/* HexQuests Orange map warp, shared by the builder (node) and the game (browser).
   "old" = the main game's world px, "new" = Orange world px. Measured against the owner's paper sketch (v5):
   - the main game is flat: on the sketch every land is about a quarter taller for its width. So the whole map is
     stretched north-south: SS everywhere south of the Tunis line (old y YT), a little more through Europe / North
     America (P: [px north of the line, extra stretch]), fading out at the very top so the Arctic is not Mercator-fat.
     The same stretch for every column: all continents start at the top edge and end on the same bottom line.
   - nothing is shifted any more: South America sits right under the Antilles, as in the main game and on the sketch
   - the Americas (old x < 500) are AX wider, the Europe band (old x WX) is SX wider, all the way down */
const OR = ((TOP, SEAM, BOT) => {
  const YT = 310, SX = 0.25, AX = 0.30, SS = 0.24, WX = [640, 670, 1030, 1060], P = [[0, SS], [60, 0.30], [215, 0.30], [315, 0.08]];
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const E = t => {
    if (t <= 0) return 0; let e = 0;
    for (let k = 1; k < P.length; k++) { const [a, ma] = P[k - 1], [b, mb] = P[k]; if (t <= a) break; const u = Math.min(t, b) - a; e += u * (2 * ma + (mb - ma) * u / (b - a)) / 2; }
    const L = P[P.length - 1]; if (t > L[0]) e += (t - L[0]) * L[1];
    return e;
  };
  const X0 = -300, XN = 2600, XT = new Float64Array(XN + 1);
  for (let i = 1; i <= XN; i++) { const x = X0 + i - 0.5; XT[i] = XT[i - 1] + 1 + SX * ss(WX[0], WX[1], x) * (1 - ss(WX[2], WX[3], x)) + (x > -10 ? AX * (1 - ss(500, 530, x)) : 0); }
  const fx = x => { const u = Math.min(XN - 1e-9, Math.max(0, x - X0)), i = u | 0; return X0 + XT[i] + (XT[i + 1] - XT[i]) * (u - i); };
  const ux = xn => { const v = xn - X0; let lo = 0, hi = XN; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (XT[m] <= v) lo = m; else hi = m; } return X0 + lo + (v - XT[lo]) / (XT[hi] - XT[lo]); };
  const DH = E(YT - TOP), DW = XT[XN] - XN, DB = (BOT - YT) * SS;
  const fy = (xo, yo) => yo >= YT ? YT + DH + (yo - YT) * (1 + SS) : YT + DH - ((YT - yo) + E(YT - yo));
  const uy = (xo, yn) => {
    if (yn >= YT + DH) return YT + (yn - YT - DH) / (1 + SS);
    const T = YT + DH - yn; let lo = 0, hi = T; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m + E(m) < T) lo = m; else hi = m; }
    return YT - (lo + hi) / 2;
  };
  return { YT, TOP, DH, DW, DB, E, fx, ux, fy, uy, fwd: (x, y) => [fx(x), fy(x, y)], inv: (x, y) => { const xo = ux(x); return [xo, uy(xo, y)]; } };
});
if (typeof module !== "undefined") module.exports = OR;
