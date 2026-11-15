// Soak test of the Orange walk mode (base game + gods layer + Orange layers together). In the page of the local test server:
//   const s = document.createElement("script"); s.src = "/tools/soak.js"; document.head.appendChild(s);   then   await OT.soak()
// It drives the real game frame by frame (SV.S3.loop), so it also runs in a hidden tab. `errs` must come back empty and
// every `ok.*` true. Add a line here for every new walk feature.
window.OT = (() => {
  const me = () => SV.S3, sleep = ms => new Promise(r => setTimeout(r, ms)), errs = [];
  const ow = console.warn; console.warn = (...a) => { errs.push(a.map(x => x && x.stack ? x.stack.split("\n").slice(0, 3).join(" | ") : String(x)).join(" ").slice(0, 300)); ow.apply(console, a); };
  addEventListener("error", e => errs.push("window: " + e.message + " @" + e.lineno));
  const step = (n = 60, ms = 16) => { const m = me(); let t = m.last || performance.now(); for (let k = 0; k < n; k++) { t += ms; m.loop(t); } };
  const key = (code, k) => window.dispatchEvent(new KeyboardEvent("keydown", { code, key: k || code, bubbles: true, cancelable: true }));
  const keyUp = code => window.dispatchEvent(new KeyboardEvent("keyup", { code, key: code, bubbles: true, cancelable: true }));
  const ready = m => !!(m && m.orange && m.orange.w && (!window.PANTHEON || (m.pn && m.pn.W)));
  const settle = () => { step(60); const m = me(); if (m.pn && m.pn.ui) PANTHEON.closeUI(m); step(20); return m; };
  const boot = async (la, lo) => { const s0 = document.getElementById("hxStart"); if (s0) s0.remove(); const old = me(); SV.at(la, lo); for (let i = 0; i < 60; i++) { await sleep(500); if (me() !== old && ready(me())) break; } return settle(); };
  const tp = (x, z) => { const m = me(); m.pos.set(x, m.H(x, z), z); m.by = m.pos.y; step(4); };
  const plc = () => document.dispatchEvent(new Event("pointerlockchange"));
  const dummy = (hp = 400) => { const m = me(), x = m.spawn("wolf", false, false); x.root.position.set(m.pos.x + 3, m.H(m.pos.x + 3, m.pos.z), m.pos.z); x.hp = x.mx = hp; x.noRe = 1; return x; };
  const soak = async (la = 38, lo = 23.7) => { const out = { ok: {} }, ok = out.ok; try {
    let m = await boot(la, lo); const O = m.orange, OX = window.ORANGE; out.land = O.land.name; out.gods = !!m.pn;
    // windows: only Esc may close the walk (a mouse release the game asked for must not)
    const hf = document.hasFocus; document.hasFocus = () => true;
    key("Tab"); plc(); ok.inv = me() === m && !m.invEl.hidden; key("Tab"); plc(); ok.invClose = me() === m && m.invEl.hidden;
    key("Backquote", "\""); plc(); key("Backquote", "\""); plc(); ok.tree = me() === m;
    key("KeyL", "l"); plc(); ok.journal = me() === m && !document.getElementById("orJ").hidden; key("KeyL", "l"); plc(); ok.journalClose = document.getElementById("orJ").hidden;
    if (m.pn) { key("KeyO", "o"); plc(); ok.codex = !!(m.pn.ui && m.pn.ui.type === "codex"); key("KeyO", "o"); plc(); ok.codexClose = me() === m && !m.pn.ui; }
    document.hasFocus = hf;
    // one compass, nothing on top of something else
    step(10); const box = id => { const e = document.getElementById(id); if (!e || e.hidden || getComputedStyle(e).display === "none") return null; const b = e.getBoundingClientRect(); return b.width && b.height ? b : null; }, hit = (a, b) => a && b && a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
    ok.oneCompass = !(box("orCmp") && box("pnCmp")); ok.rowClear = !hit(box("orRow"), box("pnCmp")); ok.voxClear = !hit(box("svVox"), document.querySelector("#sv .atk") && document.querySelector("#sv .atk").getBoundingClientRect()) && !hit(box("svVox"), document.querySelector("#sv .btns") && document.querySelector("#sv .btns").getBoundingClientRect());
    // Orange powers on their keys, gods powers on theirs
    const mp0 = O.w.mp; key("Digit7", "7"); step(5); ok.firebolt = O.w.mp < mp0; key("Digit9", "9"); step(5); ok.frost = O.w.cdP > 0;
    key("KeyP", "p"); step(3); ok.shout = O.shCd > 0;
    m.hp = 50; m.keys.Digit8 = 1; step(90); m.keys.Digit8 = 0; ok.heal = m.hp > 50; m.hp = 100;
    if (m.pn) { const c0 = PANTHEON.st.run.cast; key("KeyU", "u"); step(5); ok.cast = PANTHEON.st.run.cast < c0; }
    { const r0 = m.rage; m.rage = 0; key("KeyZ", "z"); step(2); m.rage = r0; ok.rageKey = /Rage/.test((document.getElementById("svMsg") || {}).textContent || ""); }   // Z stays the base game's Rage key
    // moving about: walk, run, jump, crouch, turn
    const p0 = [m.pos.x, m.pos.z]; m.keys.KeyW = 1; for (let k = 0; k < 6; k++) { m.yaw += .5; step(60); if (k === 2) key("Space", " "); if (k === 3) m.keys.ShiftLeft = 1; if (k === 4) { key("ControlLeft"); step(30); keyUp("ControlLeft"); } } m.keys.KeyW = 0; m.keys.ShiftLeft = 0; step(30);
    ok.moved = Math.hypot(m.pos.x - p0[0], m.pos.z - p0[1]) > 3;
    // a fight: hits and a kill run through every layer's hooks
    const d = dummy(); for (let k = 0; k < 30 && !d.dead; k++) { m.hurtMob(d, 40, m.pos, k % 3 === 0); step(6); } step(60); ok.kill = !!d.dead;
    // villager: talk, ask for work, leave
    if (O.npcs.length) { const n = O.npcs[0]; tp(n.position.x + 1.2, n.position.z); m.yaw = Math.atan2(-(n.position.x - m.pos.x), -(n.position.z - m.pos.z)); m.face = m.yaw + Math.PI; step(10); OX.st.quest = null; key("KeyE", "e"); step(5); ok.talk = !!O.dlg; key("Digit1", "1"); step(5); out.quest = OX.st.quest && OX.st.quest.type; key("Digit4", "4"); step(5); ok.talkClose = !O.dlg; }
    // Orange places
    if (O.w.stones) { tp(O.w.stones.x + 2, O.w.stones.z); OX.st.stone = null; key("KeyE", "e"); step(5); ok.stones = !!OX.st.stone; }
    if (O.w.fire) { for (const x of m.mobs) x.angry = 0; tp(O.w.fire.x + 2, O.w.fire.z); OX.st.clock = 23; step(40); out.night = O.dn ? +O.dn.last.toFixed(2) : null; key("KeyE", "e"); await sleep(1600); step(30); ok.rest = OX.st.clock > 7 && OX.st.clock < 9; }
    // a god's shrine: trial, boon
    if (m.pn) { const P = PANTHEON, W = m.pn.W, s = W.sh.find(x => x.kind === "god"); if (s) { P.st.run.def = 99; tp(s.x - 3, s.z); P.interact(m); step(40); for (let k = 0; k < 8 && W.trial; k++) { for (const x of W.trial.ms.slice()) if (!x.dead) m.hurtMob(x, 999999, m.pos, false); step(150); } step(220); out.afterTrial = m.pn.ui && m.pn.ui.type; if (m.pn.ui) { m.pn.ui.t0 -= 2000; key("Digit1", "1"); step(10); } ok.boon = P.st.run.boons.length > 0; if (m.pn.ui) P.closeUI(m); } }
    out.mid = errs.length;
    // on to the next land through a gate
    if (O.gates.length) { const g = O.gates[0]; tp(g[0] * .985, g[1] * .985); m.yaw = Math.atan2(-g[0], -g[1]) + Math.PI; m.keys.KeyW = 1; for (let k = 0; k < 40 && me() === m; k++) { step(30); await sleep(60); } m.keys.KeyW = 0; for (let i = 0; i < 40 && !(me() !== m && ready(me())); i++) await sleep(500);
      ok.gate = me() !== m && ready(me()); if (ok.gate) { m = settle(); out.land2 = m.orange.land.name; step(120); } }
    // death and coming back
    if (m.pn) { PANTHEON.st.run.def = 0; m.pn.invT = 0; m.hp -= 5000; m.hp = 100; step(8); ok.death = !!(m.pn.ui && m.pn.ui.type === "death"); if (m.pn.ui) PANTHEON.closeUI(m); step(60); ok.alive = me() === m && m.hp > 0; }   // the base game puts you back on your feet at once (hp 100); the gods layer then shows its death screen
  } catch (e) { out.ex = e.stack.split("\n").slice(0, 4).join(" | "); }
    out.errs = errs.slice(0, 12); out.fail = Object.keys(out.ok).filter(k => !out.ok[k]); return out; };
  return { step, key, keyUp, boot, tp, dummy, soak, errs, me };
})();
