// node tools/study.js <main game.html> : landmark boxes of the main game (old world px) and where the Orange warp puts them.
// Used to compare the map with the owner's paper sketch (sizes there are in grid squares).
const fs = require("fs"), path = require("path");
const lines = fs.readFileSync(process.argv[2], "utf8").split("\n");
const D = (0, eval)("(" + lines.find(l => l.startsWith("const D = ")).replace(/\r$/, "").slice(10).replace(/;$/, "") + ")");
const S = D.size, ROW = S * Math.sqrt(3), N = D.q.length, xOf = q => D.ox + 1.5 * S * q, yOf = (q, r) => D.oy + ROW * (r + q / 2);
const idx = new Map(); let top = 1e9, bot = -1e9;
for (let i = 0; i < N; i++) { idx.set(D.q[i] * 65536 + D.r[i], i); const y = yOf(D.q[i], D.r[i]); top = Math.min(top, y); bot = Math.max(bot, y); }
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], comp = new Int32Array(N).fill(-1), sizes = [];
for (let s = 0; s < N; s++) { if (D.reg[s] < 0 || comp[s] >= 0) continue; const c = sizes.length, st = [s]; comp[s] = c; let n = 0;
  while (st.length) { const i = st.pop(); n++; for (const [a, b] of DIRS) { const j = idx.get((D.q[i] + a) * 65536 + D.r[i] + b); if (j !== undefined && D.reg[j] >= 0 && comp[j] < 0) { comp[j] = c; st.push(j); } } } sizes.push(n); }
// box of the hexes of some countries (optionally only states matching, only pieces of at least `min` hexes, only inside a window)
const box = (name, countries, o = {}) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, n = 0; const pts = [];
  for (let i = 0; i < N; i++) { const g = D.reg[i]; if (g < 0) continue; const R = D.regions[g]; if (!countries.includes(R[1])) continue; if (o.state && !o.state.test(R[2] || "")) continue; if (sizes[comp[i]] < (o.min || 0)) continue;
    const x = xOf(D.q[i]), y = yOf(D.q[i], D.r[i]); if (o.win && (x < o.win[0] || x > o.win[1] || y < o.win[2] || y > o.win[3])) continue; n++; pts.push([x, y]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { name, n, x0, x1, y0, y1, pts };
};
const BIG = 3000;
const L = [
  box("N America 48 states", ["United States of America", "United States"], { min: BIG, win: [0, 560, 215, 400] }),
  box("Florida", ["United States of America", "United States"], { state: /Florida/ }),
  box("Mexico", ["Mexico"], { min: BIG }),
  box("Greenland", ["Greenland"]), box("Iceland", ["Iceland"]),
  box("Cuba", ["Cuba"]),
  box("S America", ["Brazil", "Argentina", "Chile", "Peru", "Colombia", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Guyana", "Suriname"], { min: BIG }),
  box("British Isles", ["United Kingdom", "Ireland"], { win: [560, 760, 0, 300] }),
  box("Iberia", ["Spain", "Portugal"], { min: BIG }),
  box("Scandinavia", ["Norway", "Sweden"], { min: BIG }),
  box("Italy", ["Italy"], { min: BIG }), box("Turkey", ["Turkey"], { min: BIG }),
  box("Africa", ["Senegal", "Somalia", "South Africa", "Tunisia", "Ghana", "Morocco", "Egypt"], { min: BIG }),
  box("Ghana coast", ["Ghana"]), box("Senegal", ["Senegal"]),
  box("India", ["India"], { min: BIG }), box("Australia", ["Australia"], { min: 500 }), box("Japan", ["Japan"]), box("Madagascar", ["Madagascar"]),
];
const names = new Set(D.regions.map(R => R[1])); for (const l of L) if (!l.n) console.log("!! nothing for", l.name);
if (process.argv.includes("--countries")) console.log([...names].sort().join(", "));
const OR = require("./warp.js")(top, null, bot);
const xs = [], ys = []; for (let i = 0; i < N; i += 7) { const x = xOf(D.q[i]), y = yOf(D.q[i], D.r[i]); xs.push(OR.fx(x)); ys.push(OR.fy(x, y)); }
const X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = OR.fy(900, top), Y1 = OR.fy(900, bot), W = X1 - X0, H = Y1 - Y0;
console.log("old map", "y", top.toFixed(0), bot.toFixed(0), "| orange W", W.toFixed(0), "H", H.toFixed(0), "aspect", (W / H).toFixed(2));
console.log("name                 | old x0-x1 (w)  y0-y1 (h)        | orange w x h      | orange box as fractions of the map x0-x1, y0-y1");
for (const l of L) { if (!l.n) continue; let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const [x, y] of l.pts) { const X = OR.fx(x), Y = OR.fy(x, y); a0 = Math.min(a0, X); a1 = Math.max(a1, X); b0 = Math.min(b0, Y); b1 = Math.max(b1, Y); }
  const f = v => v.toFixed(0).padStart(4), g = v => v.toFixed(3);
  console.log(l.name.padEnd(20), "|", f(l.x0) + "-" + f(l.x1), "(" + f(l.x1 - l.x0) + ")", f(l.y0) + "-" + f(l.y1), "(" + f(l.y1 - l.y0) + ")", "|", f(a1 - a0), "x", f(b1 - b0), "|", g((a0 - X0) / W) + "-" + g((a1 - X0) / W), g((b0 - Y0) / H) + "-" + g((b1 - Y0) / H)); }
