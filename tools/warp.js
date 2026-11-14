/* HexQuests Orange map warp, shared by the builder (node) and the game (browser).
   "old" = the main game's world px, "new" = Orange world px.
   - north of the Tunis line (old y YT) the map grows taller, Mercator-like but capped (P: [px north of the line, extra stretch])
   - the Americas (old x left of BX) keep the main game's shape; the gap that leaves above them is open sea
   - the Europe band (old x WX) is SX wider, all the way down, so nothing east of it shears */
const OR = (TOP => {
  const YT = 310, SX = 0.25, WX = [640, 670, 1030, 1060], BX = [522, 550], P = [[0, 0], [60, 0.30], [215, 0.30], [315, 0.08]];
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const B = x => ss(BX[0], BX[1], x);
  const E = t => {
    if (t <= 0) return 0; let e = 0;
    for (let k = 1; k < P.length; k++) { const [a, ma] = P[k - 1], [b, mb] = P[k]; if (t <= a) break; const u = Math.min(t, b) - a; e += u * (2 * ma + (mb - ma) * u / (b - a)) / 2; }
    const L = P[P.length - 1]; if (t > L[0]) e += (t - L[0]) * L[1];
    return e;
  };
  const X0 = -300, XN = 2600, XT = new Float64Array(XN + 1);
  for (let i = 1; i <= XN; i++) { const x = X0 + i - 0.5; XT[i] = XT[i - 1] + 1 + SX * ss(WX[0], WX[1], x) * (1 - ss(WX[2], WX[3], x)); }
  const fx = x => { const u = Math.min(XN - 1e-9, Math.max(0, x - X0)), i = u | 0; return X0 + XT[i] + (XT[i + 1] - XT[i]) * (u - i); };
  const ux = xn => { const v = xn - X0; let lo = 0, hi = XN; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (XT[m] <= v) lo = m; else hi = m; } return X0 + lo + (v - XT[lo]) / (XT[hi] - XT[lo]); };
  const DH = E(YT - TOP), DW = XT[XN] - XN;
  const fy = (xo, yo) => yo >= YT ? yo + DH : YT + DH - ((YT - yo) + B(xo) * E(YT - yo));
  const uy = (xo, yn) => {
    if (yn >= YT + DH) return yn - DH; const T = YT + DH - yn, b = B(xo); if (!b) return YT - T;
    let lo = 0, hi = T; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m + b * E(m) < T) lo = m; else hi = m; }
    return YT - (lo + hi) / 2;
  };
  return { YT, TOP, DH, DW, B, E, fx, ux, fy, uy, fwd: (x, y) => [fx(x), fy(x, y)], inv: (x, y) => { const xo = ux(x); return [xo, uy(xo, y)]; } };
});
if (typeof module !== "undefined") module.exports = OR;
