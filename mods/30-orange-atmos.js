/* HexQuests Orange, part 3: atmosphere. Uses the hooks of mods/10-orange-rpg.js (window.ORANGE) only.
   - A torch that lights itself when it gets dark (night, or a storm at dusk): warm light around you, so nights stay playable.
   - Weather that comes and goes: rain with lightning and thunder, snow in cold lands. Dry lands almost never get any; lands
     whose biome is already rainy keep their own. The sky, the fog and the light go grey with it (dnApply in the RPG mod
     reads me.orange.wxF). Off in the journal options (Weather).
   - Names floating over the places you have found, and a gold "!" over villagers while you have no quest. */
(() => {
  "use strict";
  const OX = window.ORANGE; if (!OX) return;
  const { st, cur, warn, clamp, opt } = OX, $ = id => document.getElementById(id);
  const DRY = /desert|sahara|arid|dune|namib|atacama|gobi|outback|badland|salt|karoo|kalahari|sonora|mojave|rub al/i, COLD = /tundra|taiga|boreal|alpine|arctic|polar|ice|glacier|snow|subarctic|permafrost/i;
  const N = 520, R = 20, HH = 20;   // drops, half width and height (m) of the box of weather that follows you
  const labs = [];                   // label elements, shared by every land
  const carry = { kind: null, f: 0, t: 0, at: -1e9 };   // the weather walks with you through a gate into the next land
  const css = () => { if ($("orAtCss")) return; const c = document.createElement("style"); c.id = "orAtCss"; c.textContent = `
.orLab{position:absolute;left:0;top:0;z-index:30;pointer-events:none;text-align:center;white-space:nowrap;will-change:transform;font:400 14px Georgia,"Times New Roman",serif;letter-spacing:.06em;color:#fff;text-shadow:0 1px 2px #000,0 0 7px rgba(0,0,0,.85)}
.orLab small{display:block;font:600 10px system-ui,sans-serif;letter-spacing:.12em;opacity:.75}.orLab.q{font:700 24px Georgia,serif;color:#ffd23a}
#orFlash{position:absolute;inset:0;background:#dfe8ff;opacity:0;pointer-events:none;z-index:29}`; document.head.appendChild(c); };
  const flash = me => { let f = $("orFlash"); if (!f) { f = document.createElement("div"); f.id = "orFlash"; $("sv").appendChild(f); }
    f.style.transition = "none"; f.style.opacity = .28; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = "opacity .6s"; f.style.opacity = 0; }));
    setTimeout(() => { if (cur() === me) try { me.tone(58, .9); me.tone(41, 1.3); me.shake = Math.max(me.shake || 0, .12); } catch (e) {} }, 350 + Math.random() * 1100); };
  const drops = (me, kind) => { const T = me.T, rain = kind === "rain", g = new T.BufferGeometry(), s = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i += 3) { s[i] = (Math.random() * 2 - 1) * R; s[i + 1] = Math.random() * HH - 2; s[i + 2] = (Math.random() * 2 - 1) * R; }
    g.setAttribute("position", new T.BufferAttribute(new Float32Array(N * (rain ? 6 : 3)), 3));
    const o = rain ? new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xc4d6ea, transparent: true, opacity: 0, fog: false, depthWrite: false }))
      : new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    o.frustumCulled = false; o.s = s; me.scene.add(o); return o; };
  const label = (i, cls, key, html) => { let e = labs[i]; if (!e) { e = document.createElement("div"); $("sv").appendChild(e); labs[i] = e; } if (!e.isConnected) $("sv").appendChild(e); if (e.className !== cls) e.className = cls; if (e.k !== key) { e.k = key; e.innerHTML = html; } e.style.display = ""; return e; };

  OX.onInit.push(me => { css(); const T = me.T, O = me.orange, b = me.bio || {}; let lat = 0; try { lat = hexLL(me.hex)[0]; } catch (e) {}
    const L = new T.PointLight(0xffc080, 0, 36, 1.3); L.position.set(me.pos.x, me.pos.y + 3.2, me.pos.z); me.scene.add(L);
    O.at = { L, cold: COLD.test(b.n || "") || b.t === "polar" || Math.abs(lat) > 62, chance: !O.dn || /rain|storm|monsoon/.test(b.t || "") ? 0 : DRY.test(b.n || "") ? .05 : .45,
      kind: null, last: "rain", f: 0, t: 25 + Math.random() * 90, bolt: 6, v: new T.Vector3() }; O.wxF = 0; for (const e of labs) e.style.display = "none";
    if (carry.kind && O.at.chance && performance.now() - carry.at < 15000) { O.at.kind = O.at.last = O.at.cold ? "snow" : "rain"; O.at.f = carry.f; O.at.t = Math.max(30, carry.t); } });

  OX.onTick.push((me, dt, t, rdt) => { const O = me.orange, A = O.at; if (!A) return;
    // weather: now and then it starts, lasts a few minutes, and clears
    if (A.chance) { if ((A.t -= rdt) <= 0) { if (A.kind) { A.kind = null; A.t = 200 + Math.random() * 400; } else if (opt("weather") && Math.random() < A.chance) { A.kind = A.last = A.cold ? "snow" : "rain"; A.t = 80 + Math.random() * 160; } else A.t = 90 + Math.random() * 200; }
      if (A.kind && !opt("weather")) A.kind = null; }
    const tg = A.kind ? 1 : 0; if (A.f !== tg) A.f = clamp(A.f + Math.sign(tg - A.f) * rdt / 10, 0, 1);
    const rain = A.last === "rain"; O.wxF = A.f * (rain ? 1 : .7); carry.kind = A.kind; carry.f = A.f; carry.t = A.t; carry.at = performance.now();
    for (const k of ["rain", "snow"]) { const on = A.f > .01 && k === A.last; let o = A[k]; if (!on) { if (o) o.visible = false; continue; } if (!o) o = A[k] = drops(me, k);
      const s = o.s, p = o.geometry.attributes.position.array, vy = rain ? 24 : 1.7, wx = rain ? 3.2 : Math.sin(t * .4) * .8, wz = rain ? 1.4 : Math.cos(t * .31) * .8;
      for (let i = 0, j = 0; i < N * 3; i += 3) { s[i] += wx * rdt; s[i + 2] += wz * rdt; s[i + 1] -= vy * rdt;
        if (s[i + 1] < -2) { s[i + 1] += HH; s[i] = (Math.random() * 2 - 1) * R; s[i + 2] = (Math.random() * 2 - 1) * R; } else { if (s[i] > R) s[i] -= 2 * R; else if (s[i] < -R) s[i] += 2 * R; if (s[i + 2] > R) s[i + 2] -= 2 * R; else if (s[i + 2] < -R) s[i + 2] += 2 * R; }
        p[j++] = s[i]; p[j++] = s[i + 1]; p[j++] = s[i + 2]; if (rain) { p[j++] = s[i] + wx * .03; p[j++] = s[i + 1] + .75; p[j++] = s[i + 2] + wz * .03; } }
      o.geometry.attributes.position.needsUpdate = true; o.position.copy(me.pos); o.material.opacity = A.f * (rain ? .42 : .9); o.visible = true; }
    if (A.kind === "rain" && A.f > .8 && (A.bolt -= rdt) <= 0) { A.bolt = 9 + Math.random() * 18; flash(me); }
    // rain on the ground: soft noise that follows the strength of the rain (the game's own sound switch silences it too)
    if (me.ac && me.ac.state === "running" && A.snd === undefined && rain && A.f > .02) { try { const ac = me.ac, b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = b; src.loop = true; fl.type = "highpass"; fl.frequency.value = 1400; g.gain.value = 0; src.connect(fl).connect(g).connect(ac.destination); src.start(); A.snd = g; } catch (e) { A.snd = null; warn(e); } }
    if (A.snd) A.snd.gain.value = rain ? A.f * .035 : 0;
    // torch: lights itself when it is dark
    const n = O.dn ? (opt("daynight") ? O.dn.last : 0) : /night|aurora/.test((me.bio || {}).t || "") ? 1 : 0, dark = clamp(n + A.f * .3, 0, 1);
    A.L.intensity = dark > .35 ? (dark - .35) / .65 * 18 * (1 + Math.sin(t * 11) * .06 + Math.sin(t * 5.3) * .05) : 0;
    if (A.L.intensity) A.L.position.set(me.pos.x + Math.sin(me.face) * 1.6, me.pos.y + 3.2, me.pos.z + Math.cos(me.face) * 1.6);   /* above and ahead: lights the ground, does not bleach you */
    // names over the places you know, "!" over villagers while you have no quest
    const sv = $("sv"), w = sv.clientWidth, h = sv.clientHeight, v = A.v; let i = 0;
    const put = (x, y, z, cls, key, html) => { v.set(x, y, z).project(me.cam); if (v.z > 1 || Math.abs(v.x) > 1.02 || Math.abs(v.y) > 1.02) return; label(i++, cls, key, html).style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px,${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%,-100%)`; };
    if (!(me.pn && me.pn.ui) && !O.dlg) {
      for (const p of O.pois) { if (!p.found && !p.hint) continue; const d = Math.hypot(p.x - me.pos.x, p.z - me.pos.z); if (d > 170 || d < 7) continue; if (p.y == null) p.y = me.H(p.x, p.z); const nm = p.found ? p.name : "?"; put(p.x, p.y + 5.5, p.z, "orLab", nm + Math.round(d / 5), `${OX.esc(nm)}<small>${Math.round(d / 5) * 5} m</small>`); }
      if (!st.quest) for (const g of O.npcs) { const d = Math.hypot(g.position.x - me.pos.x, g.position.z - me.pos.z); if (d < 60 && d > 2.5) put(g.position.x, g.position.y + 2.7, g.position.z, "orLab q", "!", "!"); } }
    for (; i < labs.length; i++) labs[i].style.display = "none";
  });
})();
