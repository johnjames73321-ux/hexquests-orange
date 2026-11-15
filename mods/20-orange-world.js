/* HexQuests Orange, part 2: magic and places to find. Uses the hooks of mods/10-orange-rpg.js (window.ORANGE).
   - Magic: a magicka bar and three spells. I = Firebolt (flies where you aim, burns), O (hold) = Healing hands,
     P = Frost burst (a ring of cold around you that staggers and slows). Destruction and Restoration grow with use.
   - Places in every land, the same every visit: standing stones (E = take their blessing, one at a time),
     a campfire (E = rest until morning, healed and well rested), a beast den with a champion and its hoard.
   - Night hunters: predators that come for you when night falls. */
(() => {
  "use strict";
  const OX = window.ORANGE; if (!OX) return;
  const { st, banner, dGain, dLvl, DEEDS, cur, warn, clamp, dry, hash, rngOf, esc, save } = OX, $ = id => document.getElementById(id);
  DEEDS.destruction = ["Destruction", "firebolt and frost hits: +3% spell damage a level"]; DEEDS.restoration = ["Restoration", "healing: +3% healing a level"];
  const STONES = { blade: ["Stone of the Blade", "weapon hits deal 15% more", 0xff7a4a], shadow: ["Stone of the Shadow", "8% faster, sneak attacks hit half again as hard", 0xb48cff], ember: ["Stone of the Ember", "spells deal 25% more, magicka returns half again as fast", 0xffc23a], tide: ["Stone of the Tide", "health slowly returns, even in a fight", 0x6fd8ff] };
  const stone = () => st.stone || null, lvlOf = me => (me.prog && me.prog.lvl) || 1;
  const mpMax = () => 100 + 4 * (dLvl("destruction") + dLvl("restoration") - 2);
  let puffT = null; const puff = T => { if (!puffT) { const c = document.createElement("canvas"); c.width = c.height = 32; const x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); puffT = new T.CanvasTexture(c); } return puffT; };
  const spr = (me, color, op) => new me.T.Sprite(new me.T.SpriteMaterial({ map: puff(me.T), color, transparent: true, opacity: op, depthWrite: false, blending: me.T.AdditiveBlending, fog: false }));
  const part = (me, x, y, z, vx, vy, vz, color, d, s0, s1, op = .8) => { const W = me.orange.w; if (W.parts.length > 110) return; const o = spr(me, color, op); o.position.set(x, y, z); o.scale.setScalar(s0); me.scene.add(o); W.parts.push({ o, vx, vy, vz, t: 0, d, s0, s1, op }); };
  const ring = (me, x, y, z, color, d, s, flat) => { const T = me.T, r = new T.Mesh(new T.RingGeometry(.5, .9, 40), new T.MeshBasicMaterial({ color, transparent: true, side: T.DoubleSide, depthWrite: false, fog: false })); r.position.set(x, y, z); if (flat) r.rotation.x = -Math.PI / 2; else r.rotation.y = me.face; me.scene.add(r); me.fx.push({ o: r, t: 0, d, s, a: .9 }); };
  const spellHit = (me, m, dmg, from, deed) => { const O = me.orange; O.shouting = 1; try { me.hurtMob(m, dmg * (stone() === "ember" ? 1.25 : 1), from, false); } catch (e) { warn(e); } O.shouting = 0; dGain(me, deed, 5); };
  const noMp = me => { me.say("Not enough magicka", 700); try { me.tone(180, .05); } catch (e) {} return true; };

  // ---------- spells ----------
  const firebolt = me => {
    const W = me.orange.w, T = me.T; if (me.hp <= 0 || W.cdF > 0) return true; if (W.mp < 18) return noMp(me);
    W.mp -= 18; W.cdF = .45; W.rest = 2;
    const fx = Math.sin(me.face), fz = Math.cos(me.face), sx = me.pos.x + fx * .6, sy = me.pos.y + 1.35, sz = me.pos.z + fz * .6;
    // flies level along where you face; a beast close to that line (within about 14 degrees, 45 m) pulls it onto itself
    let tx = sx + fx * 30, ty = sy + .2, tz = sz + fz * 30, bd = .97; for (const m of me.mobs) { if (m.dead || m.tame) continue; const q = m.root.position, dx = q.x - sx, dz = q.z - sz, d = Math.hypot(dx, dz); if (d < 1 || d > 45) continue; const c = (dx * fx + dz * fz) / d; if (c > bd) { bd = c; tx = q.x; ty = q.y + m.a[2] * .5 + .3; tz = q.z; } }
    const v = new T.Vector3(tx - sx, ty - sy, tz - sz).normalize().multiplyScalar(40), o = spr(me, 0xffb040, 1); o.scale.setScalar(.9); o.position.set(sx, sy, sz); me.scene.add(o);
    W.bolts.push({ o, v, t: 0, dmg: (16 + 1.4 * lvlOf(me)) * (1 + .03 * (dLvl("destruction") - 1)) }); try { me.tone(520, .05); me.tone(260, .12); } catch (e) {} return true;
  };
  const boltEnd = (me, b, hit) => { const p = b.o.position; ring(me, p.x, p.y, p.z, 0xff9a3a, .35, 5, 0); for (let k = 0; k < 8; k++) part(me, p.x, p.y, p.z, (Math.random() - .5) * 7, Math.random() * 5, (Math.random() - .5) * 7, k % 2 ? 0xffd060 : 0xff6a18, .45, .5, 1.6);
    if (hit) { hit.orBurn = 3; hit.orBurnT = .5; } me.scene.remove(b.o); b.o.material.dispose(); try { me.tone(120, .12); } catch (e) {} };
  const frost = me => {
    const W = me.orange.w; if (me.hp <= 0 || W.cdP > 0) return true; if (W.mp < 35) return noMp(me);
    W.mp -= 35; W.cdP = 4; W.rest = 2; const R = 9, dmg = (9 + lvlOf(me)) * (1 + .03 * (dLvl("destruction") - 1)); let n = 0;
    ring(me, me.pos.x, me.pos.y + .3, me.pos.z, 0xbfe8ff, .6, R * 1.25, 1); ring(me, me.pos.x, me.pos.y + .3, me.pos.z, 0xffffff, .4, R * .8, 1);
    for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283; part(me, me.pos.x, me.pos.y + .8, me.pos.z, Math.cos(a) * 11, .6, Math.sin(a) * 11, 0xcfeeff, .7, .5, 1.5); }
    for (const m of me.mobs) { if (m.dead || m.tame) continue; if (Math.hypot(m.root.position.x - me.pos.x, m.root.position.z - me.pos.z) > R + m.a[1] * .4) continue; m.stun = Math.max(m.stun || 0, 1.2); if (!(m.orSlow > 0)) { m.orSp = m.a[5]; m.a[5] *= .5; } m.orSlow = 5; spellHit(me, m, dmg, me.pos, "destruction"); n++; }
    me.shake = Math.max(me.shake || 0, .25); try { me.tone(1400, .08); me.tone(900, .16); } catch (e) {} return true;
  };
  const magicTick = (me, dt, t, rdt) => {
    const O = me.orange, W = O.w, T = me.T; if (!W) return;
    W.cdF -= dt; W.cdP -= dt; W.rest -= dt;
    if (W.rest <= 0) W.mp = Math.min(mpMax(), W.mp + dt * (me.mobs.some(m => !m.dead && m.angry > 0) ? 4 : 9) * (stone() === "ember" ? 1.5 : 1));
    // healing hands: hold O
    if (me.keys && me.keys.Digit8 && me.hp > 0 && me.hp < 100 && W.mp > 0) { const use = Math.min(W.mp, 15 * dt); W.mp -= use; W.rest = 1; me.hp = Math.min(100, me.hp + use * .7 * (1 + .03 * (dLvl("restoration") - 1))); try { me.hpDraw(); } catch (e) {}
      if ((W.healT -= dt) <= 0) { W.healT = .06; const a = Math.random() * 6.283; part(me, me.pos.x + Math.cos(a) * .5, me.pos.y + .2, me.pos.z + Math.sin(a) * .5, 0, 2.4, 0, 0xfff0a0, .7, .25, .7); } if ((W.healX += use) > 12) { W.healX = 0; dGain(me, "restoration", 4); } }
    if (stone() === "tide" && me.hp > 0 && me.hp < 100) { me.hp = Math.min(100, me.hp + .8 * dt); if ((W.tideT -= dt) <= 0) { W.tideT = .5; try { me.hpDraw(); } catch (e) {} } }
    // bolts
    for (let i = W.bolts.length - 1; i >= 0; i--) { const b = W.bolts[i], p = b.o.position; b.t += dt; p.addScaledVector(b.v, dt); let hit = null;
      if ((b.tr = (b.tr || 0) - dt) <= 0) { b.tr = .03; part(me, p.x, p.y, p.z, 0, .5, 0, 0xff7a20, .3, .6, .15, .6); }
      for (const m of me.mobs) { if (m.dead || m.tame) continue; const q = m.root.position; if (Math.hypot(q.x - p.x, q.z - p.z) < .7 + m.a[1] * .32 && p.y > q.y - .6 && p.y < q.y + m.a[2] + 1.6) { hit = m; break; } }
      if (hit) { spellHit(me, hit, b.dmg, p, "destruction"); boltEnd(me, b, hit); W.bolts.splice(i, 1); }
      else if (b.t > 1.5 || p.y < me.H(p.x, p.z) - .2) { boltEnd(me, b, null); W.bolts.splice(i, 1); } }
    // burning and chilled beasts
    for (const m of me.mobs) { if (m.orBurn > 0 && !m.dead) { m.orBurn -= dt; if ((m.orBurnT -= dt) <= 0) { m.orBurnT = .5; const q = m.root.position; part(me, q.x, q.y + m.a[2] * .6 + .4, q.z, 0, 2, 0, 0xff7a20, .5, .5, 1.1); spellHit(me, m, 2 + .3 * lvlOf(me), q, "destruction"); } }
      if (m.orSlow > 0 && (m.orSlow -= dt) <= 0 && m.orSp) { m.a[5] = m.orSp; m.orSp = 0; } }
    for (let i = W.parts.length - 1; i >= 0; i--) { const f = W.parts[i], k = (f.t += dt) / f.d; f.o.position.x += f.vx * dt; f.o.position.y += f.vy * dt; f.o.position.z += f.vz * dt; f.o.scale.setScalar(f.s0 + (f.s1 - f.s0) * k); f.o.material.opacity = f.op * (1 - k); if (k >= 1) { me.scene.remove(f.o); f.o.material.dispose(); W.parts.splice(i, 1); } }
    if ((W.hudT -= rdt) <= 0) { W.hudT = .1; const e = mpBar(); if (e) e.firstChild.style.width = (100 * W.mp / mpMax()).toFixed(1) + "%"; }
  };
  const mpBar = () => { let e = $("orMp"); const hp = $("svHP"); if (!e && hp) { e = document.createElement("div"); e.id = "orMp"; e.title = "Magicka"; e.style.cssText = "height:5px;margin:3px 0;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden"; e.innerHTML = '<i style="display:block;height:100%;width:100%;background:#5aa0ff"></i>'; hp.insertBefore(e, hp.lastElementChild); } return e; };

  // ---------- places ----------
  const spot = (me, r, d0, d1, far) => { for (let k = 0; k < 80; k++) { const a = r() * 6.283, d = d0 + r() * (d1 - d0), x = Math.cos(a) * d, z = Math.sin(a) * d; if (!dry(me, x, z)) continue; const y = me.H(x, z); if (Math.abs(me.H(x + 4, z) - y) > 1.6 || Math.abs(me.H(x, z + 4) - y) > 1.6) continue; if (far.some(p => Math.hypot(p[0] - x, p[1] - z) < 90)) continue; far.push([x, z]); return [x, y, z]; } return null; };
  const solid = (me, x, z, rad) => { const g = me.tgrid; if (!g) return; const k = Math.floor(x / 8) * 4096 + Math.floor(z / 8); if (!g.has(k)) g.set(k, []); g.get(k).push(x, z, rad, 0); };   // you cannot walk through it (same grid as the trees)
  const places = me => {
    const T = me.T, O = me.orange, W = O.w, L = O.land, r = rngOf(hash(L.key + "|places")), far = [[0, 0]], sc = me.scene;
    const rock = new T.MeshLambertMaterial({ color: 0x8a8f96, flatShading: true }), wood = new T.MeshLambertMaterial({ color: 0x5a3c22, flatShading: true });
    // standing stones
    { const p = spot(me, r, 140, 430, far); if (p) { const kind = Object.keys(STONES)[hash(L.key + "|stone") % 4], S = STONES[kind], g = new T.Group();
      for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + .2, h = 3.2 + r() * 1.8, x = Math.cos(a) * 5.5, z = Math.sin(a) * 5.5, m = new T.Mesh(new T.BoxGeometry(1.15, h, .75), rock); m.position.set(x, me.H(p[0] + x, p[2] + z) - p[1] + h / 2 - .4, z); m.rotation.y = -a + (r() - .5) * .4; m.rotation.z = (r() - .5) * .14; g.add(m); solid(me, p[0] + x, p[2] + z, .75); }
      const altar = new T.Mesh(new T.CylinderGeometry(.9, 1.1, .9, 8), rock); altar.position.y = .45; g.add(altar); solid(me, p[0], p[2], 1);
      const gem = new T.Mesh(new T.OctahedronGeometry(.42), new T.MeshBasicMaterial({ color: S[2], fog: false })); gem.position.y = 1.9; g.add(gem);
      g.position.set(p[0], p[1], p[2]); sc.add(g); W.stones = { x: p[0], y: p[1], z: p[2], kind, gem };
      O.pois.push(W.stonesPoi = { x: p[0], z: p[2], icon: "◈", key: "stones", name: "The Standing Stones of " + L.name, rumour: "old stones stand", found: !!st.found[L.key + "|stones"] }); } }
    // campfire
    { const p = spot(me, r, 90, 380, far); if (p) { const g = new T.Group();
      for (let k = 0; k < 4; k++) { const lg = new T.Mesh(new T.CylinderGeometry(.11, .13, 1.3, 6), wood); lg.rotation.z = Math.PI / 2 - .5; lg.rotation.y = k * Math.PI / 2 + .4; lg.position.y = .28; g.add(lg); }
      for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, s = new T.Mesh(new T.DodecahedronGeometry(.2 + r() * .08), rock); s.position.set(Math.cos(a) * .85, .12, Math.sin(a) * .85); g.add(s); }
      const fl = [0xff6a18, 0xffc040].map((c, k) => { const f = new T.Mesh(new T.ConeGeometry(.34 - k * .14, 1.1 - k * .3, 7), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .9, fog: false })); f.position.y = .75 - k * .08; g.add(f); return f; });
      const glow = spr(me, 0xff9a40, .55); glow.scale.setScalar(4.5); glow.position.y = 1; g.add(glow);
      const bed = new T.Mesh(new T.BoxGeometry(.9, .14, 2), new T.MeshLambertMaterial({ color: 0x7a2f2f, flatShading: true })); bed.position.set(2.1, .08, .3); bed.rotation.y = .3; g.add(bed);
      g.position.set(p[0], p[1], p[2]); sc.add(g); W.fire = { x: p[0], y: p[1], z: p[2], fl, glow };
      O.pois.push(W.firePoi = { x: p[0], z: p[2], icon: "🔥", key: "camp", name: "A Traveller's Camp", rumour: "a traveller keeps a fire burning", found: !!st.found[L.key + "|camp"] }); } }
    // beast den: a champion and its hoard
    { const p = spot(me, r, 220, 470, far), kinds = me.mobs.filter(m => !m.dead && !m.boss && !m.drake).sort((a, b) => b.a[7] - a.a[7]); if (p && kinds.length && !(st.dens && st.dens[L.key])) { const g = new T.Group(), dm = new T.MeshLambertMaterial({ color: 0x6a6258, flatShading: true });
      for (let k = 0; k < 6; k++) { const a = Math.PI * (.15 + k / 5 * 1.1), s = 1.6 + r() * 1.5, m = new T.Mesh(new T.DodecahedronGeometry(s), dm); m.position.set(Math.cos(a) * 4.2, s * .45, Math.sin(a) * 4.2); m.rotation.set(r() * 3, r() * 3, r() * 3); g.add(m); solid(me, p[0] + Math.cos(a) * 4.2, p[2] + Math.sin(a) * 4.2, s * .8); }
      g.position.set(p[0], p[1], p[2]); sc.add(g);
      let m = null; try { m = me.spawn(kinds[0].k, true); } catch (e) {} if (m) { m.root.position.set(p[0], p[1], p[2] - 1); m.root.scale.multiplyScalar(1.3); m.a[1] *= 1.3; m.a[2] *= 1.3; m.a[7] *= 1.3; m.hp = m.mx = m.mx * 2.2; m.champ = 1; m.noRe = 1; m.orDen = 1; m.named = 0; m.a[9] = "Den-lord " + String(m.a[9]).replace(/^(?:[A-Z][a-z-]+ )+(?=[A-Z])/, ""); W.den = { x: p[0], y: p[1], z: p[2], m };
        O.pois.push(W.denPoi = { x: p[0], z: p[2], icon: "☗", key: "den", name: "A Beast Den", rumour: "something big has made its den", found: !!st.found[L.key + "|den"] }); } } }
    // hidden caches: two chests a land, far from everything else. You find one by walking close, or a villager's rumour marks it. E opens it, once.
    W.caches = []; const gold = new T.MeshLambertMaterial({ color: 0xd8a83a, flatShading: true }), lidM = new T.MeshLambertMaterial({ color: 0x74502e, flatShading: true });
    for (let k = 0; k < 2; k++) { const p = spot(me, r, 170, 520, far), key = "cache" + k; if (!p || st.found[L.key + "|" + key + "|open"]) continue; const g = new T.Group();
      const body = new T.Mesh(new T.BoxGeometry(.95, .5, .62), wood); body.position.y = .25; g.add(body); const band = new T.Mesh(new T.BoxGeometry(.2, .54, .66), gold); band.position.y = .26; g.add(band);
      const lid = new T.Group(); lid.position.set(0, .5, -.31); const lm = new T.Mesh(new T.BoxGeometry(.99, .2, .66), lidM); lm.position.set(0, .1, .31); lid.add(lm); g.add(lid);
      const glow = spr(me, 0xffd060, .4); glow.scale.setScalar(2.4); glow.position.y = .9; g.add(glow);
      g.position.set(p[0], p[1], p[2]); g.rotation.y = r() * 6.283; sc.add(g); solid(me, p[0], p[2], .6);
      const poi = { x: p[0], z: p[2], icon: "▣", key, name: "A Hidden Cache", rumour: "someone buried a cache", found: !!st.found[L.key + "|" + key] }; O.pois.push(poi); W.caches.push({ x: p[0], y: p[1], z: p[2], key, lid, glow, poi }); }
  };
  const openCache = (me, c) => { const O = me.orange, l = lvlOf(me), coins = 40 + 10 * l + Math.floor(Math.random() * 30); c.open = 1; st.found[O.land.key + "|" + c.key + "|open"] = 1; save();
    c.lid.rotation.x = -1.15; c.glow.visible = false; O.pois = O.pois.filter(p => p !== c.poi);
    let tome = ""; if (Math.random() < .34) { const ks = Object.keys(DEEDS), k = ks[Math.floor(Math.random() * ks.length)]; OX.dUp(me, k); tome = ` · a tome of ${DEEDS[k][0]}`; }
    banner("Cache opened", `+${coins} coins${tome}`, 3200); ring(me, c.x, c.y + .4, c.z, 0xffd060, .7, 6, 1);
    try { me.dropCoins(new me.T.Vector3(c.x, c.y + .6, c.z), coins); me.gainXP(30 + 8 * l); me.orange.w.mp = mpMax(); me.tone(660, .08); setTimeout(() => me.tone && me.tone(880, .1), 110); setTimeout(() => me.tone && me.tone(1320, .16), 230); } catch (e) { warn(e); } return true; };
  const found = (me, poi) => { if (poi.found) return; poi.found = true; st.found[me.orange.land.key + "|" + poi.key] = 1; save(); banner("Discovered", poi.name, 3200); try { me.tone(440, .1); setTimeout(() => me.tone && me.tone(660, .16), 140); me.gainXP(10 + 2 * lvlOf(me)); } catch (e) {} };
  const rest = me => {
    const W = me.orange.w; if (W.resting) return true; if (me.mobs.some(m => !m.dead && !m.tame && m.angry > 0 && Math.hypot(m.root.position.x - me.pos.x, m.root.position.z - me.pos.z) < 40)) { me.say("You cannot rest while something hunts you", 1400); return true; }
    W.resting = 1; let f = $("orFade"); if (!f) { f = document.createElement("div"); f.id = "orFade"; f.style.cssText = "position:absolute;inset:0;background:#000;opacity:0;transition:opacity .7s;pointer-events:none;z-index:59"; $("sv").appendChild(f); }
    f.style.opacity = 1; setTimeout(() => { if (cur() !== me) { f.style.opacity = 0; return; } st.clock = 7.2; me.hp = 100; W.mp = mpMax(); st.rested = Date.now() + 6 * 60000; save(); try { me.hpDraw(); } catch (e) {} f.style.opacity = 0; W.resting = 0; banner("Morning", "Well rested: +15% kill XP for 6 minutes", 3200); try { me.tone(523, .1); } catch (e) {} }, 1300); return true;
  };
  const useE = me => {   // E near a place: handled here before pick up / talk
    const W = me.orange.w; if (!W) return false; const near = (o, d) => o && Math.hypot(o.x - me.pos.x, o.z - me.pos.z) < d;
    if (near(W.stones, 3.6)) { const k = W.stones.kind, S = STONES[k]; if (stone() === k) me.say(`${S[0]}: you already carry its blessing`, 1600); else { st.stone = k; save(); banner("Blessing taken", S[0], 3400); me.say(S[1], 4200); ring(me, W.stones.x, W.stones.y + .4, W.stones.z, S[2], .9, 9, 1); try { me.tone(330, .2); me.tone(495, .3); } catch (e) {} } return true; }
    if (near(W.fire, 3.4)) return rest(me);
    for (const c of W.caches || []) if (!c.open && near(c, 2.8)) return openCache(me, c);
    return false;
  };
  const placeTick = (me, dt, t, rdt) => {
    const O = me.orange, W = O.w; if (!W) return;
    if (W.stones) { W.stones.gem.rotation.y = t * 1.2; W.stones.gem.position.y = 1.9 + Math.sin(t * 1.7) * .12; }
    if (W.fire) { const k = 1 + Math.sin(t * 13) * .12 + Math.sin(t * 7.3) * .1; W.fire.fl[0].scale.set(k, 1 + Math.sin(t * 9) * .18, k); W.fire.fl[1].scale.set(1 / k, 1 + Math.sin(t * 11 + 1) * .25, 1 / k); W.fire.glow.material.opacity = .35 + .25 * OX.nightOf(st.clock) + Math.sin(t * 10) * .05; }
    if ((W.poiT -= rdt) > 0) return; W.poiT = .3;
    for (const [o, poi, d, tip] of [[W.stones, W.stonesPoi, 26, "E take the blessing of the stones"], [W.fire, W.firePoi, 18, "E rest by the fire until morning"], [W.den, W.denPoi, 30, ""], ...(W.caches || []).filter(c => !c.open).map(c => [c, c.poi, 16, "E open the cache"])]) { if (!o) continue; const dist = Math.hypot(o.x - me.pos.x, o.z - me.pos.z); if (dist < d) found(me, poi); if (tip && dist < 3.5 && !(W.tipT > Date.now())) { W.tipT = Date.now() + 9000; me.say(tip, 2400); } }
    if (W.den && W.den.m.dead && !W.den.done) { W.den.done = 1; (st.dens = st.dens || {})[O.land.key] = 1; save(); banner("Den cleared", "Its hoard is yours", 3000); try { me.dropCoins(W.den.m.root.position, 60 + 12 * lvlOf(me)); me.gainXP(40 + 10 * lvlOf(me)); } catch (e) {} }
    // night hunters
    const n = OX.nightOf(st.clock); if (OX.opt("daynight") && O.dn) { if (n > .85 && !W.night) { W.night = 1; const pk = me.mobs.filter(m => !m.dead && !m.boss && !m.drake && !m.tame).sort((a, b) => b.a[7] - a.a[7])[0]; if (pk && me.mobs.filter(m => !m.dead).length < 16) { let c = 0; for (let k = 0; k < 2; k++) { try { const m = me.spawn(pk.k, true); if (m) { m.angry = 40; m.noRe = 1; m.orNight = 1; m.named = 0; m.a[5] *= 1.1; m.a[9] = "Night-stalking " + String(m.a[9]).replace(/^(?:[A-Z][a-z-]+ )+(?=[A-Z])/, ""); c++; } } catch (e) {} } if (c) { banner("Night falls", "The hunters wake", 3000); try { me.tone(110, .5); } catch (e) {} } } } else if (n < .1) W.night = 0; }
  };

  OX.onInit.push(me => {
    const O = me.orange, W = O.w = { mp: mpMax(), cdF: 0, cdP: 0, rest: 0, bolts: [], parts: [], healT: 0, healX: 0, tideT: 0, hudT: 0, poiT: 1, night: OX.nightOf(st.clock) > .85 ? 1 : 0 };
    mpBar(); try { places(me); } catch (e) { warn(e); }
    const hit0 = me.onHit, kill0 = me.onKill, up0 = me.up;
    me.onHit = (m, dmg, crit, heavy) => { hit0 && hit0(m, dmg, crit, heavy); try { if (O.shouting) return; if (stone() === "blade") m.hp -= dmg * .15; else if (stone() === "shadow" && m.orSn === 1) { m.orSn = 2; m.hp -= dmg; } } catch (e) { warn(e); } };
    me.onKill = (m, from, heavy) => { kill0 && kill0(m, from, heavy); try { if (st.rested > Date.now()) me.gainXP(Math.max(1, Math.round((m.a[6] * .6 + 5) * .15))); } catch (e) { warn(e); } };
    if (up0) me.up = k => up0(k) * (k === "spd" && stone() === "shadow" ? 1.08 : 1);
  });
  OX.onTick.push((me, dt, t, rdt) => { magicTick(me, dt, t, rdt); placeTick(me, dt, t, rdt); });
  OX.onKey.push((me, code) => code === "Digit7" ? firebolt(me) : code === "Digit9" ? frost(me) : code === "KeyE" ? useE(me) : false);   // 8 (healing) is read as a held key, so it is not taken here. 7 8 9 = magic; U I O belong to the gods layer (Cast, Call, Codex)
  OX.jExtra.push(() => { const k = stone(), me = cur(), W = me && me.orange && me.orange.w;
    return `<h4>Magic · magicka ${W ? Math.round(W.mp) : mpMax()} of ${mpMax()}</h4><p><kbd>7</kbd> Firebolt: flies where you aim and sets beasts burning · <kbd>8</kbd> hold: Healing hands · <kbd>9</kbd> Frost burst: staggers and slows everything around you</p>
<h4>Blessing</h4><p>${k ? `<b style="color:#ffd23a">${STONES[k][0]}</b>: ${STONES[k][1]}` : "None yet. Find the standing stones of a land and press <kbd>E</kbd> at the altar."} · one blessing at a time</p>
<h4>Places in this land</h4><p>${me && me.orange.pois.length ? me.orange.pois.map(p => `${p.icon} ${p.found ? esc(p.name) : "???"}`).join(" · ") : "nothing marked"} · rest at a campfire (<kbd>E</kbd>) to sleep until morning</p>`; });
  OX.magic = { firebolt, frost, useE, rest, mpMax, STONES };
})();
