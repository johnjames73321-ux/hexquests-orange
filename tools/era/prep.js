// node tools/era/prep.js [main game.html] : studies every 320 BC hex name of the main game and writes tools/era/fake-names.json
// = the names that are NOT real places (made up to fill the map, or colonial names in the New World), for tools/era/audit.js.
// Needs the local research folder (Documents/hex-atlas-work/era320: truell.json, v2/out/*.tsv, v2/famous.tsv) and ~/pleiades/places.csv.
// Reasons: c = the research itself marked the name "created", f = one of a family of generated names (same first / last word),
// v = a generated variant of a shorter real name, d = direction label (West X, X Upper ...), k = colonial (Spanish, English,
// Portuguese, French ...) name in the New World, j = junk.
const fs = require("fs"), path = require("path"), os = require("os");
const MAIN = process.argv[2] || path.join(os.homedir(), "hex-atlas-play", "index.html"), E = path.join(os.homedir(), "Documents", "hex-atlas-work", "era320");
const L = require("./lib")(MAIN), { D, ERA, eo, N, land, xOf } = L, T = JSON.parse(fs.readFileSync(E + "/truell.json", "utf8"));
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// ---- what the research said about each name ----
const basis = new Map();
for (const f of fs.readdirSync(E + "/v2/out")) { if (!f.endsWith(".tsv") || f.includes("nations")) continue;
  for (const l of fs.readFileSync(E + "/v2/out/" + f, "utf8").split("\n")) { const c = l.split("\t"); if (c.length < 4 || !/^\d+$/.test(c[0])) continue; const h = +c[0], b = (c[3] || "").trim().toLowerCase(); if (b && ERA.hn[h] === c[1].trim()) basis.set(h, b); } }
// ---- real names: Pleiades (ancient world gazetteer), today's place names of the game table, famous list, peoples (state names) ----
const real = new Set(), pl = new Map();
{ const csv = fs.readFileSync(path.join(os.homedir(), "pleiades", "places.csv"), "utf8"), rows = []; let f = [], s = "", q = false;
  for (let i = 0; i < csv.length; i++) { const c = csv[i]; if (q) { if (c === '"') { if (csv[i + 1] === '"') { s += '"'; i++; } else q = false; } else s += c; } else if (c === '"') q = true; else if (c === ",") { f.push(s); s = ""; } else if (c === "\n") { f.push(s); rows.push(f); f = []; s = ""; } else if (c !== "\r") s += c; }
  const H = rows.shift(), col = n => H.indexOf(n), [cT, cLa, cLo, cMin, cMax] = ["title", "reprLat", "reprLong", "minDate", "maxDate"].map(col);
  for (const r of rows) { const la = +r[cLa], lo = +r[cLo]; for (const t of (r[cT] || "").split("/")) { const k = norm(t); if (!k) continue; real.add(k);
    if (r[cLa] && isFinite(la) && isFinite(lo) && r[cMin] !== "" && +r[cMin] <= -320 && +r[cMax] >= -320) (pl.get(k) || pl.set(k, []).get(k)).push([la, lo]); } } }
for (const R of D.regions) { if (R[10]) real.add(norm(R[10])); for (const t of String(R[6] || "").split("|")) if (t) real.add(norm(t)); }
const famous = fs.readFileSync(E + "/v2/famous.tsv", "utf8").split("\n").filter(l => l && l[0] !== "#").map(l => l.split("\t")).filter(c => c.length >= 3 && isFinite(+c[1]));
for (const c of famous) real.add(norm(c[0]));
const people = new Set(ERA.tags.map(t => norm(t[0])));
// ---- every distinct name with its hexes ----
const names = new Map();
for (let i = 0; i < N; i++) { if (!land(i)) continue; const n = ERA.hn[i]; if (!n) continue; (names.get(n) || names.set(n, []).get(n)).push(i); }
const NEW = i => xOf(D.q[i]) < 560;                                    // the New World side of the map (old world px), as in the owner's tier rule
const zone = i => NEW(i) ? "new" : T.lat[i] > 50 && T.lon[i] > 60 ? "sib" : T.lat[i] < 13 && T.lon[i] > -20 && T.lon[i] < 52 ? "afr" : T.lon[i] > 110 && T.lat[i] < -8 ? "aus" : T.lat[i] > 66 ? "arc" : "old";
const toks = n => n.split(/[ \-]+/).filter(Boolean);
const first = new Map(), last = new Map();
for (const [n, hs] of names) { if (zone(hs[0]) === "old") continue; const t = toks(n); if (t.length < 2) continue; first.set(t[0], (first.get(t[0]) || 0) + 1); const z = t[t.length - 1]; last.set(z, (last.get(z) || 0) + 1); }
const DIR = /^(north|south|east|west|northern|southern|eastern|western|northeast|northwest|southeast|southwest|upper|lower|inner|outer|central|middle|mid|greater|lesser|coastal|interior|river|lands|land|people|peoples|coast|basin|valley|hills|mountains|lake|forest|steppe|desert|plain|plains|highlands|lowlands|region|culture|of|the)$/i;   // English map-maker words: never part of a real 320 BC name
const { isColonial } = require("./colonial");
const fake = {}, why = { c: 0, f: 0, v: 0, d: 0, k: 0, j: 0 }, zc = {}, ex = { c: [], f: [], v: [], d: [], k: [], j: [] };
const sorted = [...names.keys()].sort();
for (const [n, hs] of names) {
  const z = zone(hs[0]), k = norm(n), t = toks(n), isReal = real.has(k) || people.has(k); let w = "";
  if (/\d/.test(n) || /^unknown$/i.test(n)) w = "j";
  else if (z === "new" && isColonial(n)) w = "k";
  else if (t.some(x => DIR.test(x)) && !real.has(k)) w = "d";
  else if (hs.some(h => basis.get(h) === "created") && !isReal) w = "c";
  else if (z !== "old" && t.length >= 2 && !real.has(k) && ((first.get(t[0]) || 0) >= 3 || (last.get(t[t.length - 1]) || 0) >= 4)) w = "f";
  else if (z !== "old" && t.length === 1 && n.length >= 7 && !isReal) {             // a longer twin of a shorter name nearby in the list (Tukudika -> Tukudikasi)
    let lo = 0, hi = sorted.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < n) lo = m + 1; else hi = m; }
    for (let a = lo - 1; a >= 0 && a > lo - 40; a--) { const p = sorted[a]; if (p.length >= 5 && p.length <= n.length - 2 && n.startsWith(p) && p[0] === n[0]) { w = "v"; break; } if (p.slice(0, 4) !== n.slice(0, 4)) break; } }
  if (!w && z !== "old" && t.length === 1 && (first.get(n) || 0) >= 3 && !isReal) w = "f";   // the bare head word of a generated family (Tatanka, Hinhan ...)
  if (!w) continue; fake[n] = w; why[w] += hs.length; (zc[z] = zc[z] || { names: 0, hexes: 0 }).names++; zc[z].hexes += hs.length; if (ex[w].length < 14 && (hs[0] * 31) % 7 < 2) ex[w].push(n);
}
const zt = {}; for (let i = 0; i < N; i++) if (land(i)) zt[zone(i)] = (zt[zone(i)] || 0) + 1;
fs.writeFileSync(path.join(__dirname, "fake-names.json"), JSON.stringify(fake));
console.log("distinct hex names", names.size, "| not real:", Object.keys(fake).length, "names |", "hexes by reason", JSON.stringify(why));
for (const z in zt) console.log(" zone", z, "land hexes", zt[z], "| not-real names", (zc[z] || {}).names || 0, "hexes", (zc[z] || {}).hexes || 0);
for (const w in ex) console.log(" e.g.", w + ":", ex[w].join(" | "));
// ---- placement check: famous cities and Pleiades places against the true position of the hex that carries the name ----
const km = (a, b, c, d) => Math.hypot((d - b) * Math.cos((a + c) / 2 * Math.PI / 180), c - a) * 111.2;
const off = [], grid = new Map(); for (let i = 0; i < N; i++) if (land(i)) { const k = Math.floor(T.lat[i]) + "," + Math.floor(T.lon[i]); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
const nearest = (la, lo) => { let b = -1, bd = 1e9; for (let a = -2; a <= 2; a++) for (let c = -2; c <= 2; c++) for (const i of grid.get((Math.floor(la) + a) + "," + (Math.floor(lo) + c)) || []) { const d = km(la, lo, T.lat[i], T.lon[i]); if (d < bd) { bd = d; b = i; } } return [b, bd]; };
let okF = 0; for (const c of famous) { const hs = names.get(c[0]); const [b, bd] = nearest(+c[1], +c[2]); if (!hs) { off.push(["famous, not on the map", c[0], "", b, Math.round(bd), ERA.hn[b] || ""]); continue; }
  const d = Math.min(...hs.map(h => km(+c[1], +c[2], T.lat[h], T.lon[h]))); if (d > 90 && b >= 0 && !hs.includes(b)) off.push(["famous", c[0], Math.round(d), b, Math.round(bd), ERA.hn[b] || ""]); else okF++; }
let okP = 0, chk = 0; for (const [n, hs] of names) { const p = pl.get(norm(n)); if (!p || p.length !== 1 || hs.length !== 1) continue; chk++; const d = km(p[0][0], p[0][1], T.lat[hs[0]], T.lon[hs[0]]);
  if (d > 150) { const [b, bd] = nearest(p[0][0], p[0][1]); off.push(["pleiades", n, Math.round(d), b, Math.round(bd), b >= 0 ? ERA.hn[b] || "" : ""]); } else okP++; }
fs.writeFileSync(path.join(__dirname, "misplaced.tsv"), "source\tname\tkm off\thex that should carry it\tkm of that hex\tname there now\n" + off.map(o => o.join("\t")).join("\n") + "\n");
console.log("placement: famous ok", okF, "of", famous.length, "| Pleiades one-to-one names checked", chk, "ok", okP, "| off (tools/era/misplaced.tsv)", off.length);
console.log(off.filter(o => o[0] !== "pleiades").map(o => o.join(" ")).join("\n"));
console.log(off.filter(o => o[0] === "pleiades").sort((a, b) => b[2] - a[2]).slice(0, 25).map(o => o.slice(1).join(" ")).join(" | "));
// ---- data the build needs: true lat/lon of every main-game hex, and the ancient places alive in 320 BC ----
{ const b = new Int16Array(N * 2); for (let i = 0; i < N; i++) { b[i * 2] = Math.round((T.lat[i] || 0) * 100); b[i * 2 + 1] = Math.round((T.lon[i] || 0) * 100); }
  fs.writeFileSync(path.join(__dirname, "truell.b64"), Buffer.from(b.buffer).toString("base64"));
  const P = JSON.parse(fs.readFileSync(E + "/v2/pleiades320.json", "utf8")), kinds = {}, out = [], seen = new Set();
  for (const c of famous) { out.push([c[0], +c[1], +c[2], 4]); seen.add(norm(c[0])); }
  for (const p of P) { kinds[p[3]] = (kinds[p[3]] || 0) + 1; const t = String(p[0]).split("/")[0].trim(), k = norm(t);
    if (!/^(town|city|fort|port|village|oasis|shrine|mine)$/.test(p[3]) || !t || seen.has(k) || /[d(?)]| at | near |^unnamed|^untitled/i.test(t) || t.length > 22) continue; seen.add(k);
    out.push([t, +(+p[1]).toFixed(3), +(+p[2]).toFixed(3), p[3] === "town" || p[3] === "city" ? 2 : 1]); }
  fs.writeFileSync(path.join(__dirname, "places320.json"), JSON.stringify(out));
  console.log("ancient places for the build:", out.length, "| kinds in the source:", JSON.stringify(kinds)); }
