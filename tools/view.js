// node tools/view.js <game.html> <out.png> [scale] : land/sea picture of a game file with a 10% grid, to compare maps by eye.
// Small land pieces (islands, up to ISL hexes) are drawn red so they can be checked.
const fs = require("fs"), zlib = require("zlib");
const [inF, outF, scArg] = process.argv.slice(2), ISL = 60;
const lines = fs.readFileSync(inF, "utf8").split("\n"), li = lines.findIndex(l => l.startsWith("const D = "));
const D = (0, eval)("(" + lines[li].replace(/\r$/, "").slice(10).replace(/;$/, "") + ")");
const S = D.size, ROW = S * Math.sqrt(3), N = D.q.length, xOf = q => D.ox + 1.5 * S * q, yOf = (q, r) => D.oy + ROW * (r + q / 2);
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const idx = new Map();
for (let i = 0; i < N; i++) { const x = xOf(D.q[i]), y = yOf(D.q[i], D.r[i]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); idx.set(D.q[i] * 65536 + D.r[i], i); }
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], comp = new Int32Array(N).fill(-1), sizes = [];
for (let s = 0; s < N; s++) { if (D.reg[s] < 0 || comp[s] >= 0) continue; const c = sizes.length, st = [s]; comp[s] = c; let n = 0;
  while (st.length) { const i = st.pop(); n++; for (const [a, b] of DIRS) { const j = idx.get((D.q[i] + a) * 65536 + D.r[i] + b); if (j !== undefined && D.reg[j] >= 0 && comp[j] < 0) { comp[j] = c; st.push(j); } } } sizes.push(n); }
const k = +scArg || 1200 / (x1 - x0), W = Math.ceil((x1 - x0) * k) + 1, H = Math.ceil((y1 - y0) * k) + 1, px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) { px[i * 3] = 40; px[i * 3 + 1] = 60; px[i * 3 + 2] = 90; }
const rad = Math.max(1, Math.ceil(S * k * 0.95));
for (let i = 0; i < N; i++) { const land = D.reg[i] >= 0, cx = Math.round((xOf(D.q[i]) - x0) * k), cy = Math.round((yOf(D.q[i], D.r[i]) - y0) * k);
  const col = land ? (sizes[comp[i]] <= ISL ? [255, 70, 70] : [240, 240, 235]) : [110, 160, 205];
  for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const o = (Y * W + X) * 3; if (!land && px[o] > 200) continue; px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2]; } }
for (let g = 1; g < 10; g++) { const X = Math.round(W * g / 10), Y = Math.round(H * g / 10); for (let y = 0; y < H; y++) { const o = (y * W + X) * 3; px[o] = 255; px[o + 1] = 200; px[o + 2] = 0; } for (let x = 0; x < W; x++) { const o = (Y * W + x) * 3; px[o] = 255; px[o + 1] = 200; px[o + 2] = 0; } }
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (t, d) => { const b = Buffer.concat([Buffer.from(t), d]), o = Buffer.alloc(8 + b.length); o.writeUInt32BE(d.length, 0); b.copy(o, 4); o.writeUInt32BE(crc(b), 4 + b.length); return o; };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(outF, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
console.log(outF, W + "x" + H, "world x", x0.toFixed(0), x1.toFixed(0), "y", y0.toFixed(0), y1.toFixed(0), "| land pieces", sizes.length, "| islands <=" + ISL + ":", sizes.filter(n => n <= ISL).length);
