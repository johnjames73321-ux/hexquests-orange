// HexQuests Orange builder: takes the live game file, warps the map (tools/warp.js) and adds the Orange mods (mods/).
// usage: node tools/build.js <live index.html> <out index.html>
const fs = require("fs"), path = require("path");
const [SRC, OUT] = process.argv.slice(2);
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
const idx = new Map(), colTop = new Map(); let top = 1e9, bot = -1e9, qmin = 1e9, qmax = -1e9;
const yOf = (qq, rr) => D.oy + ROW * (rr + qq / 2), xOf = qq => D.ox + 1.5 * S * qq;
for (let i = 0; i < N; i++) {
  idx.set(D.q[i] * 65536 + D.r[i], i); const y = yOf(D.q[i], D.r[i]); top = Math.min(top, y); bot = Math.max(bot, y); qmin = Math.min(qmin, D.q[i]); qmax = Math.max(qmax, D.q[i]);
  const c = colTop.get(D.q[i]); if (c === undefined || D.r[i] < D.r[c]) colTop.set(D.q[i], i);
}
const SEAM = null;   // the Atlantic seam of v3/v4 is gone: nothing is shifted across the ocean any more
const WARP = fs.readFileSync(path.join(__dirname, "warp.js"), "utf8"), OR = require("./warp.js")(top, SEAM, bot), DH = OR.DH, DB = OR.DB;
const oyN = D.oy + DH;
// open sea for the new water under the Old World (South America now reaches further south than the old bottom edge)
const quiet = i => D.reg[i] < 0 && !(G.pop[i] > 0) && !(G.own[i] >= 0) && !D.own[i] && ERA.hn[i] === undefined;
const botSeas = {}; for (let i = 0; i < N; i++) if (quiet(i) && yOf(D.q[i], D.r[i]) > bot - 40 && xOf(D.q[i]) > 700) botSeas[D.sea[i]] = (botSeas[D.sea[i]] || 0) + 1;
const seaPick = +Object.keys(botSeas).sort((a, b) => botSeas[b] - botSeas[a])[0]; let SEAREF = -1;
for (let i = 0; i < N && SEAREF < 0; i++) if (quiet(i) && D.sea[i] === seaPick) SEAREF = i;
if (SEAREF < 0) throw new Error("no quiet sea hex for the new water");
console.log("new water is", D.seas[seaPick]);
const colBot = new Map(); for (let i = 0; i < N; i++) { const c = colBot.get(D.q[i]); if (c === undefined || D.r[i] > D.r[c]) colBot.set(D.q[i], i); }
// hex under a world point (cube rounding), for a given grid origin
const hexAt = (px, py, oy) => {
  const x = px - D.ox, y = py - oy, fq = (2 / 3) * x / S, fr = (-x / 3 + SQ3 / 3 * y) / S, fz = -fq - fr;
  let rq = Math.round(fq), rr = Math.round(fr), rz = Math.round(fz); const dq = Math.abs(rq - fq), dr = Math.abs(rr - fr), dz = Math.abs(rz - fz);
  if (dq > dr && dq > dz) rq = -rr - rz; else if (dr > dz) rr = -rq - rz;
  return [rq, rr];
};
// new hex list, column by column (same order as the old map: q, then r); every new hex copies one old hex (src)
const q = [], r = [], src = []; let made = 0;
const qEnd = qmax + Math.ceil(OR.DW / (1.5 * S)) + 2;
for (let qq = qmin; qq <= qEnd; qq++) {
  const xn = xOf(qq), xo = OR.ux(xn);
  const r0 = Math.floor((top - oyN) / ROW - qq / 2) - 1, r1 = Math.ceil((bot + DH + DB - oyN) / ROW - qq / 2) + 1;
  for (let rr = r0; rr <= r1; rr++) {
    const yn = oyN + ROW * (rr + qq / 2); if (yn < top - 0.01 || yn > bot + DH + DB + 0.01) continue;
    const yo = OR.uy(xo, yn), [oq, orr] = hexAt(xo, yo, D.oy); let s = idx.get(oq * 65536 + orr);
    if (s === undefined) {                                  // off the old map: just above = the column's top hex; below the old bottom = new open sea
      const t = colTop.get(oq), u = colBot.get(oq); if (t === undefined) continue; const ty = yOf(oq, D.r[t]), uy = yOf(oq, D.r[u]);
      if (yo < ty) { if (ty - yo < ROW) s = t; else continue; } else if (yo > uy) { s = quiet(u) ? u : SEAREF; made++; }   /* the same sea as the old bottom edge of that column */ else continue;
    }
    q.push(qq); r.push(rr); src.push(s);
  }
}
const M = q.length, nidx = new Map(); for (let i = 0; i < M; i++) nidx.set(q[i] * 65536 + r[i], i);
// small islands (up to ISLE hexes) are not resampled: a 1-hex island must stay 1 hex, not grow to 2 or vanish. Each is lifted
// out and put back hex for hex (with its ring of sea, so its straits and sea names come along) where the warp sends its middle.
const ISLE = 8, D6 = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], oComp = new Int32Array(N).fill(-1), oIsl = [];
for (let s = 0; s < N; s++) { if (D.reg[s] < 0 || oComp[s] >= 0) continue; const c = oIsl.length, st = [s], hs = []; oComp[s] = c;
  while (st.length) { const i = st.pop(); hs.push(i); for (const [a, b] of D6) { const j = idx.get((D.q[i] + a) * 65536 + D.r[i] + b); if (j !== undefined && D.reg[j] >= 0 && oComp[j] < 0) { oComp[j] = c; st.push(j); } } } oIsl.push(hs); }
const isleName = hs => { const R = D.regions[D.reg[hs[0]]]; return R[1] + " / " + (R[2] || R[0]); };
{ const isSmall = i => D.reg[i] >= 0 && oIsl[oComp[i]].length <= ISLE, landN = j => D.reg[src[j]] >= 0, at = (a, b) => nidx.get(a * 65536 + b);
  const seaBy = i => { const seen = new Set([i]), qu = [i]; for (let h = 0; h < qu.length; h++) for (const [a, b] of D6) { const j = idx.get((D.q[qu[h]] + a) * 65536 + D.r[qu[h]] + b); if (j === undefined || seen.has(j)) continue; if (D.reg[j] < 0) return j; seen.add(j); qu.push(j); } throw new Error("island with no sea"); };
  for (let i = 0; i < M; i++) if (isSmall(src[i])) src[i] = seaBy(src[i]);
  const SHIFT = [[0, 0], ...D6, ...D6.map(([a, b], k) => [a * 2, b * 2]), ...D6.map(([a, b], k) => [a + D6[(k + 1) % 6][0], b + D6[(k + 1) % 6][1]])]; let moved = 0, bad = 0;
  for (const hs of oIsl) { if (hs.length > ISLE) continue;
    let cx = 0, cy = 0; for (const i of hs) { cx += xOf(D.q[i]); cy += yOf(D.q[i], D.r[i]); } cx /= hs.length; cy /= hs.length;
    let a = hs[0], best = 1e9; for (const i of hs) { const d = (xOf(D.q[i]) - cx) ** 2 + (yOf(D.q[i], D.r[i]) - cy) ** 2; if (d < best) { best = d; a = i; } }
    const [X, Y] = OR.fwd(cx, cy), [nq, nr] = hexAt(X + xOf(D.q[a]) - cx, Y + yOf(D.q[a], D.r[a]) - cy, oyN), mine = new Set(hs);
    const fits = ([sq, sr], strict) => { const tg = new Set(); for (const i of hs) { const j = at(nq + sq + D.q[i] - D.q[a], nr + sr + D.r[i] - D.r[a]); if (j === undefined || landN(j)) return null; tg.add(j); }
      if (strict) for (const j of tg) for (const [da, db] of D6) { const n = at(q[j] + da, r[j] + db); if (n !== undefined && !tg.has(n) && landN(n)) return null; } return tg; };
    let sh = SHIFT.find(s => fits(s, true)); if (!sh) { sh = SHIFT.find(s => fits(s, false)); bad++; console.log("!! island touches other land or has no room:", isleName(hs), hs.length, "hexes at old", cx.toFixed(0), cy.toFixed(0)); if (!sh) continue; }
    if (sh !== SHIFT[0]) moved++;
    for (const i of hs) for (const [da, db] of D6) { const o = idx.get((D.q[i] + da) * 65536 + D.r[i] + db); if (o === undefined || mine.has(o) || D.reg[o] >= 0) continue; const j = at(nq + sh[0] + D.q[o] - D.q[a], nr + sh[1] + D.r[o] - D.r[a]); if (j !== undefined && !landN(j)) src[j] = o; }
    for (const i of hs) src[at(nq + sh[0] + D.q[i] - D.q[a], nr + sh[1] + D.r[i] - D.r[a])] = i; }
  console.log("small islands kept hex for hex:", oIsl.filter(h => h.length <= ISLE).length, "| nudged a hex or two to stay clear of other land:", moved, "| problems:", bad); }
const copies = new Int32Array(N); for (const s of src) copies[s]++;
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
// an old hex the resampling skipped takes over the nearest new hex whose source has a spare copy
let lost = 0, lostLand = 0, fixed = 0;
for (let i = 0; i < N; i++) {
  if (copies[i]) continue; lost++; if (D.reg[i] >= 0) lostLand++;
  const xo = xOf(D.q[i]), [nq, nr] = hexAt(OR.fx(xo), OR.fy(xo, yOf(D.q[i], D.r[i])), oyN);
  for (const [dq, dr] of [[0, 0], ...DIRS]) { const j = nidx.get((nq + dq) * 65536 + nr + dr); if (j !== undefined && copies[src[j]] > 1 && (D.reg[src[j]] >= 0) === (D.reg[i] >= 0)) { copies[src[j]]--; src[j] = i; copies[i] = 1; fixed++; break; } }
}
console.log("hexes", N, "->", M, "| extra height", DH.toFixed(1), "px, extra width", OR.DW.toFixed(1), "px | new open-sea hexes", made, "| skipped old hexes", lost, "(land", lostLand + ") repaired", fixed);
if (lostLand && fixed < lost) console.log("WARNING: some old hexes have no copy");
const nbO = (i, d) => { const j = idx.get((D.q[i] + DIRS[d][0]) * 65536 + D.r[i] + DIRS[d][1]); return j === undefined ? -1 : j; };
const nbN = (i, d) => { const j = nidx.get((q[i] + DIRS[d][0]) * 65536 + r[i] + DIRS[d][1]); return j === undefined ? -1 : j; };
// straits / barrages live on edges (hex*3+d, d 0..2): a new edge keeps the line of the old edge between its two source hexes
const edgeKey = (a, b) => { for (let d = 0; d < 6; d++) if (nbO(a, d) === b) return d < 3 ? a * 3 + d : b * 3 + d - 3; return -1; };
const remapEdges = list => {
  const old = new Set((list || []).map(([i, d]) => i * 3 + d)), out = [];
  for (let i = 0; i < M; i++) for (let d = 0; d < 3; d++) { const j = nbN(i, d); if (j < 0 || src[i] === src[j]) continue; const k = edgeKey(src[i], src[j]); if (k >= 0 && old.has(k)) out.push([i, d]); }
  return out;
};
// connected pieces of land / water: the self-check that the warp kept coasts, islands and lakes whole
const comps = (n, land, nb) => {
  const seen = new Uint8Array(n); let cl = 0, cs = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue; land(s) ? cl++ : cs++; const st = [s]; seen[s] = 1;
    while (st.length) { const i = st.pop(); for (let d = 0; d < 6; d++) { const j = nb(i, d); if (j >= 0 && !seen[j] && land(j) === land(s)) { seen[j] = 1; st.push(j); } } }
  }
  return [cl, cs];
};
console.log("land/water pieces before", comps(N, i => D.reg[i] >= 0, nbO), "after", comps(M, i => D.reg[src[i]] >= 0, nbN));
// island check: every land piece of the main game must come out as exactly one piece of its own (not lost, split or merged)
{ const nComp = new Int32Array(M).fill(-1); let nc = 0;
  for (let s = 0; s < M; s++) { if (D.reg[src[s]] < 0 || nComp[s] >= 0) continue; const st = [s]; nComp[s] = nc; while (st.length) { const i = st.pop(); for (let d = 0; d < 6; d++) { const j = nbN(i, d); if (j >= 0 && D.reg[src[j]] >= 0 && nComp[j] < 0) { nComp[j] = nc; st.push(j); } } } nc++; }
  const got = oIsl.map(() => new Set()), cnt = new Int32Array(oIsl.length), owners = Array.from({ length: nc }, () => new Set());
  for (let i = 0; i < M; i++) { if (nComp[i] < 0) continue; const o = oComp[src[i]]; got[o].add(nComp[i]); cnt[o]++; owners[nComp[i]].add(o); }
  let wrong = 0; const rows = [];
  oIsl.forEach((hs, o) => { const merged = [...got[o]].some(c => owners[c].size > 1), st = !cnt[o] ? "LOST" : got[o].size > 1 ? "SPLIT in " + got[o].size : merged ? "MERGED with other land" : hs.length <= ISLE && cnt[o] !== hs.length ? "SIZE CHANGED" : "";
    if (st) { wrong++; console.log("!! island check:", isleName(hs), "|", hs.length, "->", cnt[o], "hexes |", st); }
    let cx = 0, cy = 0; for (const i of hs) { cx += xOf(D.q[i]); cy += yOf(D.q[i], D.r[i]); } rows.push([isleName(hs), hs.length, cnt[o], Math.round(cx / hs.length), Math.round(cy / hs.length), st || "ok"].join("\t")); });
  fs.writeFileSync(path.join(__dirname, "islands.tsv"), "land piece (main game)\thexes main\thexes orange\told x\told y\tcheck\n" + rows.join("\n") + "\n");
  console.log("island check:", oIsl.length, "land pieces,", wrong, "wrong (list: tools/islands.tsv)"); }
const st = remapEdges(D.st), dm = remapEdges(D.dm); console.log("straits", D.st.length, "->", st.length, "| dams", D.dm.length, "->", dm.length);
const pick = a => src.map(s => a[s]);
// people are shared out between the copies of a hex, so no country gains people from the warp
const seenC = new Int32Array(N), pop = src.map(s => { const c = copies[s], p = G.pop[s] || 0, k = seenC[s]++; return Math.floor(p / c) + (k < p % c ? 1 : 0); });
const eo = new Int16Array(Uint8Array.from(Buffer.from(ERA.own, "base64")).buffer), en = Int16Array.from(src, s => eo[s]);
const hn = {}; for (let i = 0; i < M; i++) { const v = ERA.hn[src[i]]; if (v !== undefined) hn[i] = v; }
const landOld = D.reg.filter(v => v >= 0).length, landNew = src.filter(s => D.reg[s] >= 0).length;
const popOld = G.pop.slice(0, N).reduce((a, b) => a + b, 0), popNew = pop.reduce((a, b) => a + b, 0);
console.log("land hexes", landOld, "->", landNew, "| people", popOld, "->", popNew);
if (popOld !== popNew && !lost) throw new Error("people changed");
Object.assign(D, { q, r, reg: pick(D.reg), sea: pick(D.sea), own: src.map(s => D.own[s] || ""), st, dm, oy: oyN, cutb: (D.cutb || 0) - DH - DB });
Object.assign(G, { own: pick(G.own), pop, hrel: pick(G.hrel), hcul: pick(G.hcul) });
Object.assign(ERA, { tier: src.map(s => ERA.tier[s]).join(""), own: Buffer.from(en.buffer).toString("base64"), hn });
const put = (p, v) => { lines[p.li] = p.pre + JSON.stringify(v) + p.suf + p.cr; };
put(pD, D); put(pG, G); put(pE, ERA); put(pV, src.map(s => ELEV[s]).join(""));
// ---- code patches (each must match exactly once) ----
let html = lines.join("\n");
const rep = (a, b) => { const n = html.split(a).length - 1; if (n !== 1) throw new Error("patch found " + n + " times: " + a.slice(0, 90)); html = html.replace(a, () => b); };
rep("<title>HexQuests</title>", "<title>HexQuests Orange</title>");
rep("<h1>HexQuests</h1>", '<h1>HexQuests <span style="color:#f08a24">Orange</span></h1>');
rep("<h1>HEX<span>QUESTS</span></h1>", '<h1>HEX<span>QUESTS</span></h1><div style="margin:-6px 0 14px;font-weight:800;letter-spacing:.5em;color:#f08a24;text-shadow:0 0 14px #f08a2480">ORANGE</div>');
// own storage keys: Orange shares its web address with the main game and must never read or write its saves
rep("try { const m = location.hash.match(/^#ov=(.+)$/);", '(() => { const P = "orange:", S = Storage.prototype, g = S.getItem, s = S.setItem, r = S.removeItem; S.getItem = function (k) { return g.call(this, P + k); }; S.setItem = function (k, v) { return s.call(this, P + k, v); }; S.removeItem = function (k) { return r.call(this, P + k); }; })();\ntry { const m = location.hash.match(/^#ov=(.+)$/);');
rep('if (location.protocol === "file:" && /Windows/.test(navigator.userAgent)) {', "if (false) {   /* Orange: never jump to the main game's server */");
rep('const LOCALSRV = location.port === "8766" ? "" : "http://127.0.0.1:8766";', 'const LOCALSRV = "about:invalid";   /* Orange: editor changes stay in this browser, never baked into the main game */');
// the warp, for everything that still thinks in the main game's world px: true lon/lat (LLT) and the reference pictures
rep("const CUT = D.cut || 0, CUTL = D.cutl || 0, W = 2000 - CUTL,", WARP.replace(/\nif \(typeof module[^\n]*\n?/, "\n") + `const ORW = OR(${top}, ${JSON.stringify(SEAM)}, ${bot});
let orOX = null, orOY = null;
const orOld = () => { if (orOX) return; orOX = new Float32Array(N); orOY = new Float32Array(N); for (let k = 0; k < N; k++) { const p = ORW.inv(cx[k], cy[k]); orOX[k] = p[0]; orOY[k] = p[1]; } };
const orCache = new Map();
const orDraw = (c, im, x, y, w, h) => {   /* a picture placed on the main game's map, drawn warped (built once per picture and place) */
  const key = [x, y, w, h].map(v => Math.round(v * 10)).join("_"); let e = orCache.get(im);
  if (!e || e.key !== key) {
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, nx = Math.max(1, Math.ceil(w / 8)), ny = Math.max(1, Math.ceil(h / 6)), X0 = ORW.fx(x), X1 = ORW.fx(x + w); let Y0 = 1e9, Y1 = -1e9;
    for (let a = 0; a <= nx; a++) { const xo = x + w * a / nx; Y0 = Math.min(Y0, ORW.fy(xo, y)); Y1 = Math.max(Y1, ORW.fy(xo, y + h)); }
    const k = Math.min(iw / w, 4096 / (X1 - X0), 4096 / (Y1 - Y0)), v = document.createElement("canvas"); v.width = Math.max(1, Math.ceil((X1 - X0) * k)); v.height = Math.max(1, Math.ceil((Y1 - Y0) * k)); const g = v.getContext("2d");
    for (let a = 0; a < nx; a++) { const xa = x + w * a / nx, xb = x + w * (a + 1) / nx, xc = (xa + xb) / 2, A = (ORW.fx(xa) - X0) * k, Bx = (ORW.fx(xb) - X0) * k;
      for (let b = 0; b < ny; b++) { const ya = ORW.fy(xc, y + h * b / ny), yb = ORW.fy(xc, y + h * (b + 1) / ny); g.drawImage(im, iw * a / nx, ih * b / ny, iw / nx, ih / ny, A, (ya - Y0) * k, Bx - A + 0.5, (yb - ya) * k + 0.5); } }
    e = { key, v, x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0 }; orCache.set(im, e);
  }
  c.drawImage(e.v, e.x, e.y, e.w, e.h);
};
const CUT = D.cut || 0, CUTL = D.cutl || 0, W = 2000 - CUTL + ORW.DW,`);
rep("const fx = clamp((cx[i] + CUTL) / 10, 0, LLW - 1.001), fy = clamp((cy[i] + CUT + 20) / 10, 0, LLH - 1.001)", "orOld(); const fx = clamp((orOX[i] + CUTL) / 10, 0, LLW - 1.001), fy = clamp((orOY[i] + CUT + 20) / 10, 0, LLH - 1.001)");
rep("ctx.drawImage(mapImgT, mapT.x, mapT.y, mapT.w, mapT.h);", "orDraw(ctx, mapImgT, mapT.x, mapT.y, mapT.w, mapT.h);");
rep("ctx.drawImage(isleImg[k], m.x, m.y, m.w, m.h);", "orDraw(ctx, isleImg[k], m.x, m.y, m.w, m.h);");
// ---- Orange mods: mods/patches.js = exact-match engine edits [find, replace]; mods/*.js (other files) = added as one script at the end ----
const MODS = path.join(__dirname, "..", "mods");
if (!process.env.OR_NOPATCH && fs.existsSync(path.join(MODS, "patches.js"))) { const ps = require(path.join(MODS, "patches.js")); for (const [a, b] of ps) rep(a, b); console.log("engine patches", ps.length); }
if (fs.existsSync(MODS)) {
  const files = fs.readdirSync(MODS).filter(f => f.endsWith(".js") && f !== "patches.js").sort();
  if (files.length) {
    const code = files.map(f => "/* ---- mods/" + f + " ---- */\n" + fs.readFileSync(path.join(MODS, f), "utf8")).join("\n");
    if (code.includes("</script")) throw new Error("a mod contains </script");
    const at = html.lastIndexOf("</body>"); if (at < 0) throw new Error("no </body>");
    html = html.slice(0, at) + "<script>\n" + code + "\n</script>\n" + html.slice(at); console.log("mods", files.join(", "));
  }
}
// every <script> must still parse (a broken one once took the live game down)
const vm = require("vm"); let ns = 0;
for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) { new vm.Script(m[1]); ns++; }
fs.writeFileSync(OUT, html);
console.log("scripts parsed", ns, "| written", OUT, (html.length / 1e6).toFixed(2), "MB");
