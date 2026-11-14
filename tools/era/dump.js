// node tools/era/dump.js <main game.html> : 320 BC states of the main game as a table (tools/era/states.tsv):
// tag index, name, type, culture, seat, land hexes, hexes per current tier (0 Settled, 1 Frontier, 2 Wilds), middle lat, lon
const fs = require("fs"), path = require("path");
const l = fs.readFileSync(process.argv[2], "utf8").split("\n");
const P = n => (0, eval)("(" + l.find(x => x.startsWith("const " + n + " = ")).replace(/\r$/, "").slice(9 + n.length).replace(/;$/, "") + ")");
const D = P("D"), E = P("ERA"), eo = new Int16Array(Uint8Array.from(Buffer.from(E.own, "base64")).buffer);
const tc = E.tags.map(() => [0, 0, 0, 0, 0]);
for (let i = 0; i < D.q.length; i++) { const g = D.reg[i], k = eo[i]; if (g < 0 || k < 0) continue; const c = tc[k], R = D.regions[g]; c[+E.tier[i] || 0]++; c[3] += +R[7] || 0; c[4] += +R[8] || 0; }
const rows = E.tags.map((t, k) => { const c = tc[k], n = c[0] + c[1] + c[2]; return [k, t[0], t[3] || "", t[4] || "", t[5] || "", n, c[0], c[1], c[2], n ? Math.round(c[3] / n) : "", n ? Math.round(c[4] / n) : ""]; }).filter(r => r[5] > 0);
fs.writeFileSync(path.join(__dirname, "states.tsv"), "tag\tname\ttype\tculture\tseat\thexes\tsettled\tfrontier\twilds\tlat\tlon\n" + rows.map(r => r.join("\t")).join("\n") + "\n");
const x = {}; for (const r of rows) { const k = r[2], d = [r[6], r[7], r[8]].indexOf(Math.max(r[6], r[7], r[8])); (x[k] = x[k] || [0, 0, 0, 0])[d]++; x[k][3] += r[5]; }
console.log("states with land", rows.length); for (const k in x) console.log(k.padEnd(14), "states by current main tier S/F/W", x[k].slice(0, 3).join("/"), "| hexes", x[k][3]);
