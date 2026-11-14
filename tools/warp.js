/* HexQuests Orange map warp, shared by the builder (node) and the game (browser).
   "old" = the main game's world px, "new" = Orange world px.
   - north of the Tunis line (old y YT) the whole map, Americas included, grows taller the same way: Mercator-like but
     capped (P: [px north of the line, extra stretch]), so North America still reaches the top edge next to Europe
   - the Americas side: the Caribbean band (old y CB) is stretched so South America sits SA px further south. That makes
     Iberia about as far from South America as from North America. The other side of the Atlantic does not move; the
     seam between the two runs down the open ocean (SEAM: per row, the sea gap between the Americas and the Old World)
   - the Europe band (old x WX) is SX wider, all the way down, so nothing east of it shears */
const OR = ((TOP, SEAM) => {
  const YT = 310, SX = 0.25, AX = 0.22, WX = [640, 670, 1030, 1060], P = [[0, 0], [60, 0.30], [215, 0.30], [315, 0.08]], CB = [322, 402], SA = 56;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const E = t => {
    if (t <= 0) return 0; let e = 0;
    for (let k = 1; k < P.length; k++) { const [a, ma] = P[k - 1], [b, mb] = P[k]; if (t <= a) break; const u = Math.min(t, b) - a; e += u * (2 * ma + (mb - ma) * u / (b - a)) / 2; }
    const L = P[P.length - 1]; if (t > L[0]) e += (t - L[0]) * L[1];
    return e;
  };
  // 1 on the Americas side of the Atlantic, 0 on the Old World side (only used south of the Tunis line)
  const B = (x, y) => { if (!SEAM) return 0; const f = Math.min(SEAM.a.length - 1.001, Math.max(0, (y - SEAM.y0) / SEAM.dy)), i = f | 0, u = f - i; return 1 - ss(SEAM.a[i] + (SEAM.a[i + 1] - SEAM.a[i]) * u, SEAM.b[i] + (SEAM.b[i + 1] - SEAM.b[i]) * u, x); };
  const A = y => SA * Math.min(1, Math.max(0, (y - CB[0]) / (CB[1] - CB[0])));
  const X0 = -300, XN = 2600, XT = new Float64Array(XN + 1);
  for (let i = 1; i <= XN; i++) { const x = X0 + i - 0.5; XT[i] = XT[i - 1] + 1 + SX * ss(WX[0], WX[1], x) * (1 - ss(WX[2], WX[3], x)) + (x > -10 ? AX * (1 - ss(500, 530, x)) : 0); }   /* AX: the Americas are wider too, so their taller north is not left looking squeezed */
  const fx = x => { const u = Math.min(XN - 1e-9, Math.max(0, x - X0)), i = u | 0; return X0 + XT[i] + (XT[i + 1] - XT[i]) * (u - i); };
  const ux = xn => { const v = xn - X0; let lo = 0, hi = XN; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (XT[m] <= v) lo = m; else hi = m; } return X0 + lo + (v - XT[lo]) / (XT[hi] - XT[lo]); };
  const DH = E(YT - TOP), DW = XT[XN] - XN, DB = SA;
  const fy = (xo, yo) => yo >= YT ? yo + DH + B(xo, yo) * A(yo) : YT + DH - ((YT - yo) + E(YT - yo));
  const uy = (xo, yn) => {
    if (yn >= YT + DH) { const v = yn - DH; if (v <= CB[0]) return v; let lo = Math.max(YT, v - SA), hi = v; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m + B(xo, m) * A(m) < v) lo = m; else hi = m; } return (lo + hi) / 2; }
    const T = YT + DH - yn; let lo = 0, hi = T; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m + E(m) < T) lo = m; else hi = m; }
    return YT - (lo + hi) / 2;
  };
  return { YT, TOP, DH, DW, DB, SA, CB, B, A, E, fx, ux, fy, uy, fwd: (x, y) => [fx(x), fy(x, y)], inv: (x, y) => { const xo = ux(x); return [xo, uy(xo, y)]; } };
});
if (typeof module !== "undefined") module.exports = OR;
