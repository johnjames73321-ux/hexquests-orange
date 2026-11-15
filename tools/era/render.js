// node tools/era/render.js <game.html> <out.png> [scale] [x0,y0,x1,y1 world px] : the 320 BC view as a picture
// (state colour with the Orange tier tint; state borders dark), to check colours and shapes without opening the game.
const fs = require("fs"), zlib = require("zlib");
const [inF, outF, scArg, winArg] = process.argv.slice(2);
const L = require("./lib")(inF), { D, ERA, eo, N, S, xOf, yOf, land, nb } = L;
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
for (let i = 0; i < N; i++) { const x = xOf(D.q[i]), y = yOf(D.q[i], D.r[i]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
if (winArg) [x0, y0, x1, y1] = winArg.split(",").map(Number);
const k = +scArg || 1, W = Math.ceil((x1 - x0) * k) + 1, H = Math.ceil((y1 - y0) * k) + 1, px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) { px[i * 3] = 150; px[i * 3 + 1] = 185; px[i * 3 + 2] = 215; }
const tint = (c, t) => { const n = parseInt(c.slice(1), 16), f = t === 1 ? 0.10 : t === 2 ? 0.32 : 0; return [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * f)); };
const rad = S * k, hw = Math.ceil(rad), SQ = Math.sqrt(3) / 2;
for (let i = 0; i < N; i++) { if (!land(i)) continue; const X = xOf(D.q[i]), Y = yOf(D.q[i], D.r[i]); if (X < x0 - 5 || X > x1 + 5 || Y < y0 - 5 || Y > y1 + 5) continue;
  const o = eo[i], t = +ERA.tier[i] || 0, col = o >= 0 ? tint(ERA.tags[o][1], t) : t ? [228, 225, 216] : [255, 255, 255];
  const edge = nb(i).some(j => land(j) && eo[j] !== o), cx = (X - x0) * k, cy = (Y - y0) * k;
  for (let dy = -hw; dy <= hw; dy++) for (let dx = -hw; dx <= hw; dx++) { const ax = Math.abs(dx), ay = Math.abs(dy); if (ay > rad * SQ + 0.5 || ax * SQ + ay * 0.5 > rad * SQ + 0.5) continue;
    const PX = Math.round(cx + dx), PY = Math.round(cy + dy); if (PX < 0 || PY < 0 || PX >= W || PY >= H) continue; const p = (PY * W + PX) * 3;
    const rim = edge && k >= 3 && (ay > rad * SQ - 1 || ax * SQ + ay * 0.5 > rad * SQ - 1), m = rim ? 0.72 : 1;
    px[p] = col[0] * m; px[p + 1] = col[1] * m; px[p + 2] = col[2] * m; } }
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (t, d) => { const b = Buffer.concat([Buffer.from(t), d]), o = Buffer.alloc(8 + b.length); o.writeUInt32BE(d.length, 0); b.copy(o, 4); o.writeUInt32BE(crc(b), 4 + b.length); return o; };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(outF, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
console.log(outF, W + "x" + H, "world", [x0, y0, x1, y1].map(v => v.toFixed(0)).join(","));
