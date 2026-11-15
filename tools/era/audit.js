// 320 BC audit of the Orange map (owner 2026-11-15), run by tools/build.js on the warped map (new hex space):
//  1. hex names: a name made up to fill the map, or a colonial name in the New World (tools/era/fake-names.json, colonial.js),
//     is replaced by a real one: an attested ancient place inside that hex (Pleiades, places320.json), else the real people or
//     place it was derived from, else the people who own the hex. The second copy of a stretched hex gets its own real ancient
//     place where one lies in it; otherwise it keeps the name (the same real place over two hexes). Nothing is invented.
//  2. New World states with a colonial name get the native name (state-names.js, else their own central place).
//  3. no big blocks for peoples that were not one state: tribes, cultures, nomads, clans, chiefdoms and confederations larger
//     than CAP hexes are cut into small neighbouring groups (real states keep their land).
//  4. colours: every state its own colour, spread over the whole wheel, never near black or glaring, far less yellow.
const fs = require("fs"), path = require("path"), { isColonial, norm } = require("./colonial");
module.exports = c => {
  const { D, ERA, q, r, src, en, hn, M, N, xN, yN, xO, yO, OR } = c, here = f => path.join(__dirname, f);
  const FAKE = JSON.parse(fs.readFileSync(here("fake-names.json"), "utf8")), FIX = require("./state-names.js");
  const PL = JSON.parse(fs.readFileSync(here("places320.json"), "utf8")), TB = new Int16Array(Uint8Array.from(Buffer.from(fs.readFileSync(here("truell.b64"), "utf8"), "base64")).buffer);
  const land = i => D.reg[src[i]] >= 0, NEWW = i => xO(src[i]) < 560, DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const nidx = new Map(); for (let i = 0; i < M; i++) nidx.set(q[i] * 65536 + r[i], i);
  const nb = i => { const o = []; for (const [a, b] of DIRS) { const j = nidx.get((q[i] + a) * 65536 + r[i] + b); if (j !== undefined && land(j)) o.push(j); } return o; };
  const rep = {};
  // the copy of an old hex that sits where the warp sends its middle is the real one; the others are the stretch
  const prim = new Int32Array(N).fill(-1), pd = new Float64Array(N).fill(1e18);
  for (let i = 0; i < M; i++) { if (!land(i)) continue; const s = src[i], [X, Y] = OR.fwd(xO(s), yO(s)), d = (xN(i) - X) ** 2 + (yN(i) - Y) ** 2; if (d < pd[s]) { pd[s] = d; prim[s] = i; } }
  const tags = ERA.tags.map(t => t.slice()), hexOf = tags.map(() => []);
  for (let i = 0; i < M; i++) if (land(i) && en[i] >= 0) hexOf[en[i]].push(i);
  const mid = hs => { let x = 0, y = 0; for (const i of hs) { x += xN(i); y += yN(i); } x /= hs.length; y /= hs.length; return hs.slice().sort((a, b) => (xN(a) - x) ** 2 + (yN(a) - y) ** 2 - (xN(b) - x) ** 2 - (yN(b) - y) ** 2); };
  const newTag = tags.map((t, k) => { const hs = hexOf[k]; return hs.length > 0 && hs.filter(NEWW).length * 2 > hs.length; });
  const bad = (n, nw) => !n || FAKE[n] || (nw && isColonial(n));
  const STATE = /^(empire|kingdom|satrapy|republic|city-state|league|walled town)$/, isState = t => STATE.test(String(t[3] || "").toLowerCase());
  // map-maker labels in state names (Southwest Sauromatae, Velja River People): the people's own name alone
  const LABEL = /^(north|south|east|west|northern|southern|eastern|western|northeast|northwest|southeast|southwest|upper|lower|inner|outer|central|coastal|river|lands|land|people|peoples|coast|basin|valley)$/i, stN = new Set(tags.filter(isState).map(t => t[0])); let relab = 0;
  tags.forEach((t, k) => { if (!hexOf[k].length || isState(t)) return; const w = t[0].split(" "); if (w.length < 2) return; const rest = w.filter(x => !LABEL.test(x)).join(" "); if (rest.length < 2 || rest === t[0] || stN.has(rest)) return; t[0] = rest; relab++; });
  // Old World "cultures" carry the name of a modern town, river or district (Tver, Pskov, Ilmen): nobody was called that in 320 BC.
  // They take the name of their people instead, unless the name itself is an attested ancient place.
  const ANC = new Set(PL.map(p => p[0])); let modern = 0;
  tags.forEach((t, k) => { if (!hexOf[k].length || newTag[k] || String(t[3] || "").toLowerCase() !== "culture" || ANC.has(t[0])) return;
    const raw = String(t[4] || ""), par = (raw.match(/\(([^)]*)\)/) || [])[1] || "";
    let p = raw.split("(")[0].replace(/\s*contact( zone)?/i, "").replace(/\?/g, "").trim(); if (/^(uncertain|unknown|)$/i.test(p)) p = par.replace(/^(late|early) /i, "").replace(/\?/g, "").trim();
    if (!p || p === t[0]) return; t[6] = (t[6] || "") + " (Archaeologists' name: " + t[0] + ".)"; t[0] = p; modern++; });
  rep.modern = "Old World cultures named after modern places -> their people's name: " + modern;
  // ---- 2. New World states with colonial names ----
  const tagNames = new Set(tags.map(t => t[0])); let fixed = 0, fellBack = 0; const left = [];
  tags.forEach((t, k) => { if (!newTag[k]) return; const old = t[0]; let nu = FIX[ERA.tags[k][0]] || FIX[old];
    if (!nu && isColonial(old)) { for (const i of mid(hexOf[k])) { const n = hn[i]; if (!bad(n, true) && !tagNames.has(n)) { nu = n; break; } }
      if (!nu) { const seen = new Set(hexOf[k]); let fr = hexOf[k]; for (let ring = 0; ring < 8 && !nu && fr.length; ring++) { const nx = []; for (const i of fr) for (const j of nb(i)) { if (seen.has(j)) continue; seen.add(j); nx.push(j); const n = hn[j]; if (!nu && !bad(n, true) && !tagNames.has(n)) nu = n; } fr = nx; } }   // else the nearest native place
      if (!nu) { const p = String(t[4] || "").split(/[(/,]/)[0].trim(); if (p && !isColonial(p) && !/unknown|uncertain|unclassified|archaic|agricultur|basketmaker|woodland|macro|area|early|late|proto|[?-]/i.test(p)) nu = p; } if (nu) fellBack++; else left.push(old); }
    if (!nu) return; t[0] = nu; tagNames.add(nu); t[6] = (t[6] || "") + " (Archaeologists' name: " + old + ".)"; fixed++; });
  rep.states = "New World states renamed " + fixed + " (by table " + (fixed - fellBack) + ", by own central place or people " + fellBack + "), still colonial " + left.length + (left.length ? ": " + left.join(", ") : "") + " | map-maker labels dropped from state names " + relab;
  // ---- 1. hex names ----
  const lat = s => TB[s * 2] / 100, lon = s => TB[s * 2 + 1] / 100, km = (a, b, c2, d) => Math.hypot((d - b) * Math.cos((a + c2) / 2 * Math.PI / 180), c2 - a) * 111.2;
  const grid = new Map(); PL.forEach((p, k) => { const g = Math.floor(p[1]) + "," + Math.floor(p[2]); (grid.get(g) || grid.set(g, []).get(g)).push(k); });
  const usedN = new Set(); for (let i = 0; i < M; i++) if (land(i) && hn[i]) usedN.add(norm(hn[i]));
  const place = (la, lo, R) => { let best = -1, bs = 1e9; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const k of grid.get((Math.floor(la) + a) + "," + (Math.floor(lo) + b)) || []) { const p = PL[k]; if (usedN.has(norm(p[0]))) continue; const d = km(la, lo, p[1], p[2]); if (d > R) continue; const s = d / (p[3] || 1); if (s < bs) { bs = s; best = k; } } return best; };
  const good = new Set(); for (let i = 0; i < M; i++) if (land(i) && hn[i] && !bad(hn[i], NEWW(i))) good.add(hn[i]);
  const root = (b, hexOk) => { const ok = p => tagNames.has(p) || (hexOk && good.has(p));   // a generated family (Tatanka Paha, Tatanka Mni ...) only counts when its head is a real people
    for (let p = b.length - 1; p >= 3; p--) if ((b[p] === " " || b[p] === "-") && ok(b.slice(0, p))) return b.slice(0, p);
    for (let p = b.length - 2; p >= 5; p--) if (ok(b.slice(0, p))) return b.slice(0, p); return ""; };
  let nFake = 0, byPl = 0, byRoot = 0, byOwner = 0, keptFake = 0, dup = 0, dupPl = 0;
  const order = []; for (let i = 0; i < M; i++) if (land(i)) order.push(i); order.sort((a, b) => (prim[src[a]] === a ? 0 : 1) - (prim[src[b]] === b ? 0 : 1));   // real copies first
  for (const i of order) { const s = src[i], n = hn[i], nw = NEWW(i), isDup = prim[s] !== i, isBad = bad(n, nw); if (!isBad && !isDup) continue; if (isBad) nFake++; else dup++;
    let nu = "";
    if (!nw && s * 2 + 1 < TB.length) { const p0 = prim[s], la = lat(s) - (isDup ? (yN(i) - yN(p0)) * 0.11 : 0), lo = lon(s) + (isDup ? (xN(i) - xN(p0)) * 0.14 : 0), k = place(la, lo, isDup ? 30 : 40);
      if (k >= 0) { nu = PL[k][0]; usedN.add(norm(nu)); if (isBad) byPl++; else dupPl++; } }
    if (!nu && isBad) { const rt = n ? root(n, FAKE[n] !== "f") : ""; if (rt && !bad(rt, nw)) { nu = rt; byRoot++; } else if (en[i] >= 0 && !bad(tags[en[i]][0], nw)) { nu = tags[en[i]][0]; byOwner++; } else keptFake++; }
    if (nu) hn[i] = nu; }
  rep.names = "hex names not real " + nFake + " -> ancient place in the hex " + byPl + ", real root name " + byRoot + ", owning people " + byOwner + ", left " + keptFake + " | stretched copies " + dup + ", given their own ancient place " + dupPl;
  // ---- 3. split big blocks of peoples that were not one state ----
  const CAP = 8, CAPC = 3, usedTag = new Set(tags.map(t => t[0])); let cut = 0, made = 0;
  const T0 = tags.length;
  for (let k = 0; k < T0; k++) { const t = tags[k], kind = String(t[3] || "").toLowerCase(), hs = hexOf[k]; if (!hs.length || (STATE.test(kind) && !newTag[k])) continue;
    const cap = kind === "culture" ? CAPC : CAP; if (hs.length <= cap) continue;
    const mine = new Set(hs), seen = new Set(), comps = [];
    for (const s0 of hs) { if (seen.has(s0)) continue; const st = [s0], cc = []; seen.add(s0); while (st.length) { const i = st.pop(); cc.push(i); for (const j of nb(i)) if (mine.has(j) && !seen.has(j)) { seen.add(j); st.push(j); } } comps.push(cc); }
    comps.sort((a, b) => b.length - a.length); let home = false; cut++;
    for (const cc of comps) { if (cc.length <= cap) { if (!home) home = true; else { /* a small exclave: its own group */ mk(cc, t, k); } continue; }
      const wild = cc.filter(i => ERA.tier[src[i]] === "2").length * 2 > cc.length, n = Math.max(2, Math.round(cc.length / (wild ? 4 : 3)));
      const seeds = [mid(cc)[cc.length - 1]], dmin = new Map(cc.map(i => [i, 1e18]));
      while (seeds.length < n) { const sd = seeds[seeds.length - 1]; let far = -1, fd = -1; for (const i of cc) { const d = Math.min(dmin.get(i), (xN(i) - xN(sd)) ** 2 + (yN(i) - yN(sd)) ** 2); dmin.set(i, d); if (d > fd) { fd = d; far = i; } } seeds.push(far); }
      const piece = new Map(), parts = seeds.map(sd => [sd]), fr = seeds.map(sd => [sd]); seeds.forEach((sd, p) => piece.set(sd, p)); const inC = new Set(cc); let open = true;
      while (open) { open = false; const ord = parts.map((_, p) => p).sort((a, b) => parts[a].length - parts[b].length);
        for (const p of ord) { let got = false; while (fr[p].length && !got) { const i = fr[p][0]; let nx = -1; for (const j of nb(i)) if (inC.has(j) && !piece.has(j)) { nx = j; break; } if (nx < 0) { fr[p].shift(); continue; } piece.set(nx, p); parts[p].push(nx); fr[p].push(nx); got = true; } if (got) { open = true; break; } } }
      const ctr = mid(cc)[0], keep = home ? -1 : piece.get(ctr); home = true;
      parts.forEach((ph, p) => { if (p !== keep) mk(ph, t, k); }); } }
  function mk(ph, t, k) { const seat = mid(ph)[0], n = hn[seat], nw = NEWW(seat), own = !bad(n, nw) && !usedTag.has(n) && (nw || ANC.has(n)) ? n : t[0]; usedTag.add(own);
    const note = String(t[6] || ""), first = note.split(/(?<=\.)\s/)[0].slice(0, 220);
    tags.push([own, t[1], t[2], t[3], t[4], hn[seat] || t[5] || "", (own === t[0] ? "One of the many small groups of the " + t[0] + "; they were never one state. " : "A group of the " + t[0] + " around " + own + ". ") + first]);
    for (const i of ph) en[i] = tags.length - 1; made++; }
  rep.split = "peoples larger than " + CAP + " hexes (cultures " + CAPC + ") cut up: " + cut + " -> " + made + " new small groups | states now " + tags.filter((t, k2) => k2 >= T0 || hexOf[k2].length).length;
  // ---- 4. colours ----
  const cnt = new Int32Array(tags.length), adj = tags.map(() => new Set());
  for (let i = 0; i < M; i++) { if (!land(i) || en[i] < 0) continue; cnt[en[i]]++; for (const j of nb(i)) if (en[j] >= 0 && en[j] !== en[i]) adj[en[i]].add(en[j]); }
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hsl = ([R, G, B]) => { R /= 255; G /= 255; B /= 255; const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === R ? (G - B) / d + (G < B ? 6 : 0) : mx === G ? (B - R) / d + 2 : (R - G) / d + 4; h *= 60; } return [h, s, l]; };
  const toRgb = (h, s, l) => { const a = s * Math.min(l, 1 - l), f = n => { const k2 = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k2 - 3, 9 - k2, 1)))); }; return [f(0), f(8), f(4)]; };
  const hex = v => "#" + v.map(x => x.toString(16).padStart(2, "0")).join(""), dist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
  const col = new Array(tags.length).fill(null); let keptC = 0;
  for (let k = 0; k < T0; k++) { const t = tags[k]; if (!cnt[k] || newTag[k] || !STATE.test(String(t[3] || "").toLowerCase()) || !/^#[0-9a-f]{6}$/i.test(t[1])) continue;
    const [h, s, l] = hsl(rgb(t[1])); col[k] = toRgb(h, Math.min(s, 0.72), Math.max(0.36, Math.min(0.72, l))); keptC++; }   // real states keep their colour (only pulled out of the near-black / glaring ends)
  const rnd = seed => () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let z = Math.imul(seed ^ seed >>> 15, 1 | seed); z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; };
  const pick = R => { for (;;) { const h = R() * 360, keepP = h >= 40 && h < 72 ? 0.22 : h >= 250 && h < 345 ? 0.3 : h >= 215 && h < 250 ? 0.5 : 1; if (R() > keepP) continue;
    const warm = h >= 28 && h < 78; return toRgb(h, warm ? 0.28 + R() * 0.24 : 0.30 + R() * 0.34, warm ? 0.46 + R() * 0.16 : 0.45 + R() * 0.25); } };
  const todo = []; for (let k = 0; k < tags.length; k++) if (cnt[k] && !col[k]) todo.push(k); todo.sort((a, b) => cnt[b] - cnt[a] || a - b);
  for (const k of todo) { const R = rnd(k * 2654435761), near = [...adj[k]].map(j => col[j]).filter(Boolean); let best = null, bs = -1;
    for (let a = 0; a < 16; a++) { const cnd = pick(R); let s = 1e9; for (const o of near) s = Math.min(s, dist(cnd, o)); if (s > bs) { bs = s; best = cnd; } if (!near.length) break; } col[k] = best; }
  for (let k = 0; k < tags.length; k++) if (col[k]) tags[k][1] = hex(col[k]);
  rep.colours = "colours: real states kept " + keptC + ", new colours " + todo.length;
  for (const k in rep) console.log("320 BC audit |", rep[k]);
  return { tags, en, hn };
};
