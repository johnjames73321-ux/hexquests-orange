// HexQuests Orange builder: takes the live game file and stretches the map north of the Tunis line (Mercator-like).
// usage: node tools/build.js <live index.html> <out index.html>
const fs = require("fs");
const [SRC, OUT] = process.argv.slice(2);
const YT = 310, K = 0.6 / 211;            // Tunis line (old world y); the stretch grows by K per px north of it (x1.6 at 60 N)
let lines = fs.readFileSync(SRC, "utf8").split("\n");
const find = n => lines.findIndex(x => x.startsWith("const " + n + " = "));
const parse = n => {
  const li = find(n), l = lines[li].replace(/\r$/, ""), pre = "const " + n + " = "; let b = l.slice(pre.length), suf = "";
  if (n === "ELEV") { const e = b.indexOf('";'); suf = b.slice(e + 1); b = b.slice(0, e + 1); } else if (b.endsWith(";")) { suf = ";"; b = b.slice(0, -1); }
  return { li, pre, suf, v: (0, eval)("(" + b + ")"), cr: lines[li].endsWith("\r") ? "\r" : "" };
};
const pD = parse("D"), pG = parse("G"), pE = parse("ERA"), pV = parse("ELEV");
const D = pD.v, G = pG.v, ERA = pE.v, ELEV = pV.v;
const S = D.size, SQ3 = Math.sqrt(3), ROW = S * SQ3, N = D.q.length;
const idx = new Map(); let top = 1e9;
for (let i = 0; i < N; i++) { idx.set(D.q[i] * 65536 + D.r[i], i); top = Math.min(top, D.oy + ROW * (D.r[i] + D.q[i] / 2)); }
const Tf = t => t + K * t * t / 2, DH = Tf(YT - top) - (YT - top);
const unY = yn => { if (yn >= YT + DH) return yn - DH; const T = YT + DH - yn; return YT - (Math.sqrt(1 + 2 * K * T) - 1) / K; };
const oyN = D.oy + DH, extra = Math.ceil(DH / ROW) + 2;
// new hex list, column by column (same order as the old map: q, then r); every new hex copies one old hex (src)
const colR = new Map();
for (let i = 0; i < N; i++) { const c = colR.get(D.q[i]); if (!c) colR.set(D.q[i], [D.r[i], D.r[i]]); else { c[0] = Math.min(c[0], D.r[i]); c[1] = Math.max(c[1], D.r[i]); } }
const q = [], r = [], src = [];
for (const qq of [...colR.keys()].sort((a, b) => a - b)) {
  const [r0, r1] = colR.get(qq);
  for (let rr = r0 - extra; rr <= r1; rr++) {
    const yn = oyN + ROW * (rr + qq / 2), yo = unY(yn), ro = Math.round((yo - D.oy) / ROW - qq / 2), s = idx.get(qq * 65536 + ro);
    if (s === undefined) continue; q.push(qq); r.push(rr); src.push(s);
  }
}
const M = q.length, nidx = new Map(); for (let i = 0; i < M; i++) nidx.set(q[i] * 65536 + r[i], i);
const copies = new Int32Array(N); for (const s of src) copies[s]++;
const lost = []; for (let i = 0; i < N; i++) if (!copies[i]) lost.push(i);
console.log("hexes", N, "->", M, "| extra height px", DH.toFixed(1), "| old hexes lost", lost.length, "land lost", lost.filter(i => D.reg[i] >= 0).length);
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const nbO = (i, d) => { const j = idx.get((D.q[i] + DIRS[d][0]) * 65536 + D.r[i] + DIRS[d][1]); return j === undefined ? -1 : j; };
const nbN = (i, d) => { const j = nidx.get((q[i] + DIRS[d][0]) * 65536 + r[i] + DIRS[d][1]); return j === undefined ? -1 : j; };
// straits / barrages live on edges (hex*3+d, d 0..2): a new edge keeps the line of the old edge between its two source hexes
const edgeKey = (a, b) => { for (let d = 0; d < 6; d++) if (nbO(a, d) === b) return d < 3 ? a * 3 + d : b * 3 + d - 3; return -1; };
const remapEdges = list => {
  const old = new Set((list || []).map(([i, d]) => i * 3 + d)), out = [];
  for (let i = 0; i < M; i++) for (let d = 0; d < 3; d++) { const j = nbN(i, d); if (j < 0 || src[i] === src[j]) continue; const k = edgeKey(src[i], src[j]); if (k >= 0 && old.has(k)) out.push([i, d]); }
  return out;
};
// connected pieces of land / water: the self-check that the stretch kept coasts, islands and lakes whole
const comps = (n, land, nb) => {
  const seen = new Uint8Array(n); let cl = 0, cs = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue; land(s) ? cl++ : cs++; const st = [s]; seen[s] = 1;
    while (st.length) { const i = st.pop(); for (let d = 0; d < 6; d++) { const j = nb(i, d); if (j >= 0 && !seen[j] && land(j) === land(s)) { seen[j] = 1; st.push(j); } } }
  }
  return [cl, cs];
};
console.log("land/water pieces before", comps(N, i => D.reg[i] >= 0, nbO), "after", comps(M, i => D.reg[src[i]] >= 0, nbN));
const st = remapEdges(D.st), dm = remapEdges(D.dm); console.log("straits", D.st.length, "->", st.length, "| dams", D.dm.length, "->", dm.length);
const pick = a => src.map(s => a[s]);
// people are shared out between the copies of a hex, so no country gains people from the stretch
const seenC = new Int32Array(N), pop = src.map(s => { const c = copies[s], p = G.pop[s] || 0, k = seenC[s]++; return Math.floor(p / c) + (k < p % c ? 1 : 0); });
const eo = new Int16Array(Uint8Array.from(Buffer.from(ERA.own, "base64")).buffer), en = Int16Array.from(src, s => eo[s]);
const hn = {}; for (let i = 0; i < M; i++) { const v = ERA.hn[src[i]]; if (v !== undefined) hn[i] = v; }
const landOld = D.reg.filter(v => v >= 0).length, landNew = src.filter(s => D.reg[s] >= 0).length;
const popOld = G.pop.slice(0, N).reduce((a, b) => a + b, 0), popNew = pop.reduce((a, b) => a + b, 0);
console.log("land hexes", landOld, "->", landNew, "| people", popOld, "->", popNew);
if (popOld !== popNew) throw new Error("people changed");
Object.assign(D, { q, r, reg: pick(D.reg), sea: pick(D.sea), own: src.map(s => D.own[s] || ""), st, dm, oy: oyN, cutb: (D.cutb || 0) - DH });
Object.assign(G, { own: pick(G.own), pop, hrel: pick(G.hrel), hcul: pick(G.hcul) });
Object.assign(ERA, { tier: src.map(s => ERA.tier[s]).join(""), own: Buffer.from(en.buffer).toString("base64"), hn });
const put = (p, v) => { lines[p.li] = p.pre + JSON.stringify(v) + p.suf + p.cr; };
put(pD, D); put(pG, G); put(pE, ERA); put(pV, src.map(s => ELEV[s]).join(""));
// ---- code patches (each must match exactly once) ----
let html = lines.join("\n");
const rep = (a, b) => { const n = html.split(a).length - 1; if (n !== 1) throw new Error("patch found " + n + " times: " + a.slice(0, 70)); html = html.replace(a, () => b); };
rep("<title>HexQuests</title>", "<title>HexQuests Orange</title>");
rep("<h1>HexQuests</h1>", '<h1>HexQuests <span style="color:#f08a24">Orange</span></h1>');
rep("<h1>HEX<span>QUESTS</span></h1>", '<h1>HEX<span>QUESTS</span></h1><div style="margin:-6px 0 14px;font-weight:800;letter-spacing:.5em;color:#f08a24;text-shadow:0 0 14px #f08a2480">ORANGE</div>');
// own storage keys: Orange shares its web address with the main game and must never read or write its saves
rep("try { const m = location.hash.match(/^#ov=(.+)$/);", '(() => { const P = "orange:", S = Storage.prototype, g = S.getItem, s = S.setItem, r = S.removeItem; S.getItem = function (k) { return g.call(this, P + k); }; S.setItem = function (k, v) { return s.call(this, P + k, v); }; S.removeItem = function (k) { return r.call(this, P + k); }; })();\ntry { const m = location.hash.match(/^#ov=(.+)$/);');
rep('if (location.protocol === "file:" && /Windows/.test(navigator.userAgent)) {', "if (false) {   /* Orange: never jump to the main game's server */");
rep('const LOCALSRV = location.port === "8766" ? "" : "http://127.0.0.1:8766";', 'const LOCALSRV = "about:invalid";   /* Orange: editor changes stay in this browser, never baked into the main game */');
rep("N = D.q.length, SEA0 = 1e7;", `N = D.q.length, SEA0 = 1e7;
/* HexQuests Orange: the map north of the Tunis line (old world y ${YT}) is stretched Mercator-like; FY old world y -> Orange y, UNY the way back */
const OR_YT = ${YT}, OR_K = ${K}, OR_DH = ${DH};
const FY = y => y >= OR_YT ? y + OR_DH : OR_DH + OR_YT - ((OR_YT - y) + OR_K * (OR_YT - y) ** 2 / 2);
const UNY = y => y >= OR_YT + OR_DH ? y - OR_DH : OR_YT - (Math.sqrt(1 + 2 * OR_K * (OR_YT + OR_DH - y)) - 1) / OR_K;
const orDraw = (c, im, x, y, w, h) => { const ih = im.naturalHeight || im.height, iw = im.naturalWidth || im.width, n = Math.max(1, Math.ceil(h / 6)); for (let s = 0; s < n; s++) { const A = FY(y + h * s / n), B = FY(y + h * (s + 1) / n); c.drawImage(im, 0, ih * s / n, iw, ih / n, x, A, w, B - A + 0.3); } };`);
rep("fy = clamp((cy[i] + CUT + 20) / 10, 0, LLH - 1.001)", "fy = clamp((UNY(cy[i]) + CUT + 20) / 10, 0, LLH - 1.001)");
rep("ctx.drawImage(mapImgT, mapT.x, mapT.y, mapT.w, mapT.h);", "orDraw(ctx, mapImgT, mapT.x, mapT.y, mapT.w, mapT.h);");
rep("ctx.drawImage(isleImg[k], m.x, m.y, m.w, m.h);", "orDraw(ctx, isleImg[k], m.x, m.y, m.w, m.h);");
// every <script> must still parse (a broken one once took the live game down)
const vm = require("vm"); let ns = 0;
for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) { new vm.Script(m[1]); ns++; }
fs.writeFileSync(OUT, html);
console.log("scripts parsed", ns, "| written", OUT, (html.length / 1e6).toFixed(2), "MB");
