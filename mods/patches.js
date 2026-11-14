// Exact-match edits to the main game's code, applied by tools/build.js: [find (must occur exactly once), replace].
// Keep each one small and say why; anything bigger belongs in a mods/*.js file.
module.exports = [
  // FPS: the land around you is built in cell chunks as you move. The old code built 2 new chunks per frame and, for each one,
  // rebuilt every neighbour a tree reached into at once: 50-170 ms frames while running. Now the same work is paced by time
  // (about 3.5 ms a frame, always at least one job), nearest first; the smooth far sheet covers a chunk until it is built.
  // The first fill when a land opens (budget > 2) still does everything at once, as before.
  [
    "for (const [a, c] of ring) { if (budget <= 0) break; if (!chunks.has(mkey(kx + a, kz + c))) { if (me.cut) { for (let u = -1; u <= 1; u++) for (let w = -1; w <= 1; w++) for (const t of treesOf(kx + a + u, kz + c + w)) voxTree(t); pend.delete(mkey(kx + a, kz + c)); VX.flush(); } put(kx + a, kz + c); budget--; } }",
    "const orAll = budget > 2, orT0 = performance.now(), orLim = window.OR_CHUNK_MS || 3.5; let orDid = 0;\n" +
    "      if (!orAll) for (const key of pend) { if (orDid && performance.now() - orT0 > orLim) break; pend.delete(key); if (chunks.has(key)) { put(Math.floor(key / 1024) - 512, key % 1024 - 512); orDid++; } }\n" +
    "      for (const [a, c] of ring) { if (budget <= 0 || (!orAll && orDid && performance.now() - orT0 > orLim)) break; if (!chunks.has(mkey(kx + a, kz + c))) { if (me.cut) { for (let u = -1; u <= 1; u++) for (let w = -1; w <= 1; w++) for (const t of treesOf(kx + a + u, kz + c + w)) voxTree(t); pend.delete(mkey(kx + a, kz + c)); if (orAll) VX.flush(); } put(kx + a, kz + c); budget--; orDid++; } }",
  ],
  // FPS: building one chunk asked two Maps about every neighbour of every cell (a big tree crown = hundreds of thousands of
  // lookups, 30-60 ms). Each chunk now looks its columns up once (CCo edits, TLo tree spans) and reads those; a cell's side
  // colour is only worked out when a side is actually drawn. Same cells, same colours.
  [
    "const x0 = kx * CH, z0 = kz * CH, N = CH + 2, ns = new Int32Array(N * N), ed = new Uint8Array(N * N),",
    "const x0 = kx * CH, z0 = kz * CH, N = CH + 2, ns = new Int32Array(N * N), ed = new Uint8Array(N * N), CCo = new Array(N * N), TLo = new Array(N * N),",
  ],
  [
    "ed[a * N + c] = cols.has(kk) || tc.has(kk) ? 1 : 0; }",
    "const orC = cols.get(kk) || null, orL = tc.get(kk) || null; CCo[a * N + c] = orC; TLo[a * N + c] = orL; ed[a * N + c] = orC || orL ? 1 : 0; }",
  ],
  [
    "const at = (a, c, iy) => { const k = a * N + c; return ed[k] ? cell(x0 + a - 1, iy, z0 + c - 1, ns[k]) : iy < ns[k] ? 1 : 0; };",
    "const at = (a, c, iy) => { const k = a * N + c; if (!ed[k]) return iy < ns[k] ? 1 : 0; const oc = CCo[k]; if (oc) { const v = oc.m.get(iy); if (v !== undefined) return v; } if (iy < ns[k]) return 1; const L = TLo[k]; if (L) for (let q = 0; q < L.length; q++) { const e = L[q]; if (iy >= e[0] && iy < e[1]) return e[2]; } return 0; };",
  ],
  [
    "const t = ed[k] ? cell(cx, iy, cz, n) : iy < n ? natType(cx, iy, cz, n) : 0; if (!t) continue;",
    "let t = 0; if (!ed[k]) t = iy < n ? natType(cx, iy, cz, n) : 0; else { const oc = CCo[k]; let v; if (oc && (v = oc.m.get(iy)) !== undefined) t = v; else if (iy < n) t = natType(cx, iy, cz, n); else { const L = TLo[k]; if (L) for (let q = 0; q < L.length; q++) { const e = L[q]; if (iy >= e[0] && iy < e[1]) { t = e[2]; break; } } } } if (!t) continue;",
  ],
  // FPS: a chunk's faces went into plain arrays one number at a time (about 250,000 pushes) and were then copied again.
  // They now go straight into reusable typed buffers that grow when needed. Same vertices in the same order.
  [
    "const quad = (ox, oy, oz, e1x, e1y, e1z, e2x, e2y, e2z, nx, ny, nz, cl) => { const o = P.length / 3; P.push(ox, oy, oz, ox + e1x, oy + e1y, oz + e1z, ox + e1x + e2x, oy + e1y + e2y, oz + e1z + e2z, ox + e2x, oy + e2y, oz + e2z); for (let q = 0; q < 4; q++) { NR.push(nx, ny, nz); C.push(cl.r, cl.g, cl.b); } U.push(0, 0, 1, 0, 1, 1, 0, 1); I.push(o, o + 1, o + 2, o, o + 2, o + 3); };",
    "const SB = mk.sb || (mk.sb = { n: 0, cap: 8192, P: new Float32Array(8192 * 12), NR: new Float32Array(8192 * 12), C: new Float32Array(8192 * 12) }); SB.n = 0;\n" +
    "      const quad = (ox, oy, oz, e1x, e1y, e1z, e2x, e2y, e2z, nx, ny, nz, cl) => {\n" +
    "        if (SB.n === SB.cap) { for (const f of [\"P\", \"NR\", \"C\"]) { const g2 = new Float32Array(SB[f].length * 2); g2.set(SB[f]); SB[f] = g2; } SB.cap *= 2; }\n" +
    "        const o = SB.n++ * 12, p = SB.P, nr = SB.NR, cc = SB.C, r = cl.r, g1 = cl.g, b1 = cl.b;\n" +
    "        p[o] = ox; p[o + 1] = oy; p[o + 2] = oz; p[o + 3] = ox + e1x; p[o + 4] = oy + e1y; p[o + 5] = oz + e1z; p[o + 6] = ox + e1x + e2x; p[o + 7] = oy + e1y + e2y; p[o + 8] = oz + e1z + e2z; p[o + 9] = ox + e2x; p[o + 10] = oy + e2y; p[o + 11] = oz + e2z;\n" +
    "        for (let q = o; q < o + 12; q += 3) { nr[q] = nx; nr[q + 1] = ny; nr[q + 2] = nz; cc[q] = r; cc[q + 1] = g1; cc[q + 2] = b1; }\n" +
    "      };",
  ],
  [
    'const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T.Float32BufferAttribute(NR, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(U, 2)); g.setAttribute("color", new T.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeBoundingSphere();',
    'const g = new T.BufferGeometry(), orN = SB.n, orU = new Float32Array(orN * 8), orI = orN * 4 > 65535 ? new Uint32Array(orN * 6) : new Uint16Array(orN * 6);\n' +
    '      for (let q = 0; q < orN; q++) { const u = q * 8, w = q * 6, o = q * 4; orU[u + 2] = orU[u + 4] = orU[u + 5] = orU[u + 7] = 1; orI[w] = o; orI[w + 1] = o + 1; orI[w + 2] = o + 2; orI[w + 3] = o; orI[w + 4] = o + 2; orI[w + 5] = o + 3; }\n' +
    '      g.setAttribute("position", new T.BufferAttribute(SB.P.slice(0, orN * 12), 3)); g.setAttribute("normal", new T.BufferAttribute(SB.NR.slice(0, orN * 12), 3)); g.setAttribute("uv", new T.BufferAttribute(orU, 2)); g.setAttribute("color", new T.BufferAttribute(SB.C.slice(0, orN * 12), 3)); g.setIndex(new T.BufferAttribute(orI, 1)); g.computeBoundingSphere();',
  ],
  ["          tcol(t, cx, cz, iy, 0, cS);", "          let orS = 0;"],
  // start menu: the Orange keys
  [
    "<span><kbd>Esc</kbd> back to map</span></div>",
    "<span><kbd>Esc</kbd> back to map</span><span><kbd>L</kbd> journal · quests</span><span><kbd>U</kbd> Stormvoice shout</span><span><kbd>Ctrl</kbd> + strike = sneak attack</span><span><kbd>I</kbd> firebolt · <kbd>P</kbd> frost</span><span><kbd>O</kbd> hold = heal</span></div>",
  ],
  ["if (at(na, nc, iy) && !edge) continue;", "if (at(na, nc, iy) && !edge) continue; if (!orS) { tcol(t, cx, cz, iy, 0, cS); orS = 1; }"],
  // 320 BC land lines: Frontier and Wilds stripes both a little thicker and further apart in width (owner 11-14)
  ["const W = [0, S * 0.17, S * 0.40], P = [null", "const W = [0, S * 0.21, S * 0.55], P = [null"],
];
