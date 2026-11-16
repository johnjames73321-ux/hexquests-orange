// The 320 BCE atlas (owner 2026-11-16, see ATLAS.md): in every zone of tools/era/atlas/NN-*.js the countries are real ones of
// 320 BCE (a written people, an archaeological group alive then, or the bands of one river basin of such a group), grown from
// their real seats over land so that shapes and sizes come out natural: no one-hex confetti, no same-size groups, no blocks
// for a whole language family. Called by audit.js before anything else touches names or colours.
//   zone file: module.exports = { name, zone(lat, lon) -> bool, keep(tag, lat, lon) -> bool (optional: an old country that is
//     real for 320 BCE stays), none(lat, lon) -> bool (optional: land nobody lived on yet gets no owner),
//     fam: { key: { kind, tier, people, hue: [centre, spread], reach, glyphs: "emblems for the flag", note } },
//     list: "key|Name|lat,lon[,reach];lat,lon[,reach]...|extra note" lines }
const fs = require("fs"), path = require("path");
module.exports = (c, tags, TB) => {
  const { D, q, r, src, en, M } = c, DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const land = i => D.reg[src[i]] >= 0, lat = i => TB[src[i] * 2] / 100, lon = i => TB[src[i] * 2 + 1] / 100;
  const nidx = new Map(); for (let i = 0; i < M; i++) nidx.set(q[i] * 65536 + r[i], i);
  const km = (a, b, a2, b2) => { let dl = Math.abs(b2 - b); if (dl > 180) dl = 360 - dl; return Math.hypot(dl * Math.cos((a + a2) / 2 * Math.PI / 180), a2 - a) * 111.2; };
  const h01 = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 2654435761) ^ Math.imul(b + 0x7f4a7c15, 2246822519); h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
  const tier = new Int8Array(M).fill(-1), rep = [], dir = path.join(__dirname, "atlas");
  const toRgb = (h, s, l) => { h = ((h % 360) + 360) % 360; const a = s * Math.min(l, 1 - l), f = n => { const k2 = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k2 - 3, 9 - k2, 1)))); }; return [f(0), f(8), f(4)]; };
  const hex = v => "#" + v.map(x => x.toString(16).padStart(2, "0")).join(""), dist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
  const usedNames = new Map(), old = Int32Array.from(en);
  // a people without a known banner flies its own colour with one of its family's emblems (fam.glyphs), like the main game's totems
  const FLAGS = ["F M;G X A .5 .5 .78", "F M;B A;G X A .5 .5 .6", "H M M A;G X A .5 .36 .6", "F M;W A .84 .1;G X A .5 .42 .64"];
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter(x => /^\d.*\.js$/.test(x)).sort() : []) {
    const Z = require(path.join(dir, f)), zh = []; let emptied = 0;
    for (let i = 0; i < M; i++) { if (!land(i) || en[i] < 0 && !Z.fill) continue; const la = lat(i), lo = lon(i); if (!Z.zone(la, lo)) continue; if (Z.none && Z.none(la, lo)) { if (en[i] >= 0) { en[i] = -2; emptied++; } continue; } if (Z.keep && en[i] >= 0 && Z.keep(tags[en[i]], la, lo)) continue; zh.push(i); }
    const inZ = new Uint8Array(M); for (const i of zh) inZ[i] = 1;
    // countries of the zone
    const ents = String(Z.list).split("\n").map(s => s.trim()).filter(s => s && !s.startsWith("//")).map(s => { const p = s.split("|"), F = Z.fam[p[0]]; if (!F || p.length < 3) throw new Error(f + ": bad line: " + s);
      return { fam: p[0], F, name: p[1], seats: p[2].split(";").map(x => { const v = x.split(",").map(Number); if (!(v.length >= 2) || v.some(isNaN)) throw new Error(f + ": bad seat in: " + s); return [v[0], v[1], v[2] || F.reach || 150]; }), note: (p[3] || "").trim(), hs: [] }; });
    for (const e of ents) { if (usedNames.has(e.name)) throw new Error("atlas: the name " + e.name + " is used twice (" + usedNames.get(e.name) + ", " + f + ")"); usedNames.set(e.name, f); }
    // grow every country from its seats: cheapest path over land, cost = km / reach
    const cost = new Float64Array(M).fill(Infinity), own = new Int32Array(M).fill(-1), heap = [];
    const push = (cst, i, e) => { heap.push([cst, i, e]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const a = 2 * k + 1, b = a + 1; let m = k; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const lost = [], seatOf = new Map();
    ents.forEach((e, ei) => { let any = false; for (const [la, lo, reach] of e.seats) { let best = -1, bd = 1e9; for (const i of zh) { if (seatOf.has(i) && seatOf.get(i) !== ei) continue; const d = km(la, lo, lat(i), lon(i)); if (d < bd) { bd = d; best = i; } } if (best < 0 || bd > Math.max(260, reach)) continue; any = true; seatOf.set(best, ei); push(0, best, ei); e.reach = reach; } if (!any) lost.push(e.name); });
    while (heap.length) { const [cst, i, ei] = pop(); if (own[i] >= 0) continue; own[i] = ei; cost[i] = cst; const e = ents[ei], reach = e.reach;
      for (const [a, b] of DIRS) { const j = nidx.get((q[i] + a) * 65536 + r[i] + b); if (j === undefined || !inZ[j] || own[j] >= 0) continue; const d = km(lat(i), lon(i), lat(j), lon(j)) + 8; push(cst + d * (0.75 + 0.5 * h01(Math.min(i, j), Math.max(i, j))) / reach, j, ei); } }
    // islands and corners no path reached: the nearest seat, if it is not absurdly far
    let far = 0; for (const i of zh) { if (own[i] >= 0) continue; let best = -1, bs = 1e9; ents.forEach((e, ei) => { for (const [la, lo, reach] of e.seats) { const s = km(la, lo, lat(i), lon(i)) / reach; if (s < bs) { bs = s; best = ei; } } }); if (best >= 0 && bs < (Z.farLimit || 2.5)) own[i] = best; else far++; }
    // tags
    let made = 0; const first = tags.length;
    for (const i of zh) if (own[i] >= 0) ents[own[i]].hs.push(i);
    for (const e of ents) { if (!e.hs.length) { if (!lost.includes(e.name)) lost.push(e.name); continue; } const F = e.F, gl = (F.glyphs || "").split(" ").filter(Boolean), hh = Math.floor(h01(e.name.length * 131 + e.name.charCodeAt(0) * 7 + e.name.charCodeAt(e.name.length - 1), 91) * 1e6), t = [e.name, "#888888", gl.length ? FLAGS[hh % FLAGS.length].replace("X", gl[(hh >> 3) % gl.length]) : "", F.kind || "tribe", F.people || "", "", (e.note ? e.note + " " : "") + (F.note || "")]; const was = tags.find(o => !o.fix && o[0] === e.name); if (was && was[2]) t[2] = was[2];   // the owner's own flag for a country of this name stays
      t.fix = 1; t.fam = F; e.k = tags.length; tags.push(t); made++;
      for (const i of e.hs) { en[i] = e.k; tier[i] = F.tier; } }
    // colours: the family's hue band, each country as far from its neighbours as the band allows
    const adj = new Map(); for (const e of ents) if (e.hs.length) adj.set(e.k, new Set());
    for (const e of ents) for (const i of e.hs) for (const [a, b] of DIRS) { const j = nidx.get((q[i] + a) * 65536 + r[i] + b); if (j !== undefined && en[j] >= first && en[j] !== e.k) adj.get(e.k).add(en[j]); }
    const colOf = new Map(), order = ents.filter(e => e.hs.length).sort((a, b) => b.hs.length - a.hs.length);
    for (const e of order) { const [hc, sp] = e.F.hue || [200, 40], near = [...adj.get(e.k)].map(k => colOf.get(k)).filter(Boolean); let best = null, bs = -1;
      for (let a = 0; a < 24; a++) { const u = h01(e.k * 31 + a, 77), v = h01(e.k * 17 + a, 191), w = h01(e.k * 13 + a, 313), cnd = toRgb(hc + (u * 2 - 1) * sp, 0.3 + v * 0.3, 0.46 + w * 0.24); let s = 1e9; for (const o of near) s = Math.min(s, dist(cnd, o)); if (s > bs) { bs = s; best = cnd; } if (!near.length) break; }
      colOf.set(e.k, best); tags[e.k][1] = hex(best); }
    const sizes = ents.filter(e => e.hs.length).map(e => e.hs.length).sort((a, b) => a - b);
    rep.push(`atlas | ${Z.name}: ${zh.length} hexes -> ${made} countries (smallest ${sizes[0]}, middle ${sizes[sizes.length >> 1]}, largest ${sizes[sizes.length - 1]})` + (emptied ? ` | ${emptied} hexes of land nobody lived on yet: no owner` : "") + (far ? ` | ${far} hexes too far from any seat keep their old owner` : "") + (lost.length ? ` | NO LAND: ${lost.join(", ")}` : ""));
  }
  // an atlas name must not also be the name of an old country that still holds land
  const still = new Set(); for (let i = 0; i < M; i++) if (land(i) && en[i] >= 0 && !tags[en[i]].fix) still.add(tags[en[i]][0]);
  const clash = [...usedNames.keys()].filter(n => still.has(n)); if (clash.length) rep.push("atlas | SAME NAME as an old country that still has land (rename one): " + clash.join(", "));
  for (const l of rep) console.log("320 BC " + l);
  // OR_ATLAS_DUMP=file: every land hex with its true lat/lon, the main game's owner and the owner now (to check a zone by hand)
  if (process.env.OR_ATLAS_DUMP) fs.writeFileSync(process.env.OR_ATLAS_DUMP, "q\tr\tlat\tlon\told\tnow\n" + Array.from({ length: M }, (_, i) => i).filter(land).map(i => [q[i], r[i], lat(i), lon(i), old[i] >= 0 ? tags[old[i]][0] + " (" + tags[old[i]][3] + "; " + tags[old[i]][4] + ")" : old[i], en[i] >= 0 ? tags[en[i]][0] : en[i]].join("\t")).join("\n"));
  return { tier };
};
