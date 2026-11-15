// Shared loader for the 320 BC audit tools. Reads the MAIN game file (old hex space: Orange is built from it hex by hex).
// const L = require("./lib")(file) -> { D, G, ERA, eo, N, S, xOf, yOf, idx, nb, ll(i) = [lat, lon], land(i), R(i), name(i) }
const fs = require("fs");
module.exports = file => {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const P = n => { const l = lines.find(x => x.startsWith("const " + n + " = ")); let b = l.replace(/\r$/, "").slice(9 + n.length); if (b.endsWith(";")) b = b.slice(0, -1); return (0, eval)("(" + b + ")"); };
  const D = P("D"), G = P("G"), ERA = P("ERA"), eo = new Int16Array(Uint8Array.from(Buffer.from(ERA.own, "base64")).buffer);
  const N = D.q.length, S = D.size, ROW = S * Math.sqrt(3), xOf = q => D.ox + 1.5 * S * q, yOf = (q, r) => D.oy + ROW * (r + q / 2);
  const idx = new Map(); for (let i = 0; i < N; i++) idx.set(D.q[i] * 65536 + D.r[i], i);
  const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const nb = i => DIRS.map(([a, b]) => idx.get((D.q[i] + a) * 65536 + D.r[i] + b)).filter(j => j !== undefined);
  // true lat/lon of a hex: the game's LLT table (sampled every 10 px), same maths as hexLL() in the game
  const ll0 = lines.find(x => x.startsWith("const LLT = ")), b64 = ll0.match(/atob\("([^"]+)"\)/)[1];
  const LLT = new Int16Array(Uint8Array.from(Buffer.from(b64, "base64")).buffer), LLW = 201, LLH = LLT.length / 2 / LLW;
  const CUT = D.cut || 0, CUTL = D.cutl || 0, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const ll = i => {
    const fx = clamp((xOf(D.q[i]) + CUTL) / 10, 0, LLW - 1.001), fy = clamp((yOf(D.q[i], D.r[i]) + CUT + 20) / 10, 0, LLH - 1.001), x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0;
    const v = (x, y, c) => LLT[(y * LLW + x) * 2 + c] / (c ? 300 : 150), c4 = c => [v(x0, y0, c), v(x0 + 1, y0, c), v(x0, y0 + 1, c), v(x0 + 1, y0 + 1, c)];
    const lo = c4(0), la = c4(1), bil = a => lerp(lerp(a[0], a[1], tx), lerp(a[2], a[3], tx), ty);
    return [bil(la), Math.max(...lo) - Math.min(...lo) > 180 ? lo[0] : bil(lo)];
  };
  const land = i => D.reg[i] >= 0, R = i => D.regions[D.reg[i]];
  const name = i => (ERA.hn && ERA.hn[i]) || (ERA.rn && ERA.rn[D.reg[i]]) || D.regions[D.reg[i]][0];
  return { lines, D, G, ERA, eo, N, S, ROW, xOf, yOf, idx, nb, ll, land, R, name, DIRS, LLH };
};
