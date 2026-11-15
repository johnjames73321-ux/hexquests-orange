/* HexQuests Orange RPG layer (open-world RPG feel on top of the 3D walk):
   compass bar, land discovery, villager quests + journal, skills that grow with use, sneak attacks, the Stormvoice
   shout, a drake world boss whose soul strengthens the shout, day and night, enemy target bar, FPS meter and an
   automatic resolution saver.
   It only uses what the game already exposes: window.hxRestore (once per land), window.hxKey, and the session object
   (me.ps per-frame list, me.onHit / me.onKill, me.say, me.spawn...). Every entry point is wrapped in try/catch, so a
   fault here can never stop the base game. */
(() => {
  "use strict";
  const OX = window.ORANGE = { jExtra: [], onInit: [], onTick: [], onKey: [], rumours: [] };
  const SKEY = "orange-rpg", DEF = { daynight: 1, autores: 1, fps: 0, compass: 1, weather: 1 };
  const st = (() => { let s = {}; try { s = JSON.parse(localStorage.getItem(SKEY) || "{}") || {}; } catch (e) {} return Object.assign({ deeds: {}, quest: null, done: 0, log: [], found: {}, souls: 0, clock: 9, seen: 0, opt: {} }, s); })();
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(SKEY, JSON.stringify(st)); } catch (e) {} }, 400); };
  const opt = k => st.opt[k] !== undefined ? st.opt[k] : DEF[k];
  const warn = e => { try { console.warn("[orange]", e); } catch (x) {} };
  const $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const cur = () => (window.SV && window.SV.S3) || null;
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const rngOf = seed => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 | 0) >>> 0) / 4294967296;
  const dry = (me, x, z) => !(me.bio && me.bio.w) || me.H(x, z) > .3;   /* only lands with water have a sea level; dry valleys run below 0 */
  const landOf = i => { const g = D.regions[D.reg[i]] || []; return { key: (g[0] || "?") + "|" + (g[1] || ""), name: g[0] || "Unknown land", country: g[1] || "" }; };

  // ---------- skills that grow with use ----------
  const DEEDS = { onehand: ["One-handed", "sword, spear and fist hits: +1% damage a level"], twohand: ["Two-handed", "axe and hammer hits: +1% damage a level"], archery: ["Archery", "arrow hits: +1% damage a level"],
    block: ["Block", "parries: +2 stamina back a level"], sneak: ["Sneak", "sneak attacks hit harder each level"], athletics: ["Athletics", "running: +0.3% speed a level"], voice: ["Voice", "Stormvoice hits: +4% shout damage a level"] };
  const deed = k => st.deeds[k] || (st.deeds[k] = { l: 1, x: 0 }), dLvl = k => deed(k).l, dNeed = l => Math.round(18 * l ** 1.5);
  const dGain = (me, k, v) => { const d = deed(k); if (d.l >= 100) return; d.x += v; let up = 0; while (d.x >= dNeed(d.l) && d.l < 100) { d.x -= dNeed(d.l); d.l++; up = 1; } if (up) { banner("Skill increased", `${DEEDS[k][0]} ${d.l}`, 2200); try { me.tone && me.tone(1040, .06); me.gainXP && me.gainXP(4 + d.l); } catch (e) {} } save(); };

  // ---------- HUD ----------
  let ui = null;
  const ensureUI = () => {
    const sv = $("sv"); if (!sv) return null; if (ui && ui.root.isConnected) return ui;
    if (!$("orCss")) { const c = document.createElement("style"); c.id = "orCss"; c.textContent = `
#orTop{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:31;pointer-events:none;display:grid;justify-items:center;gap:5px;font-family:system-ui,sans-serif;color:#f4f1ea;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.7)}
#orCmp{position:relative;width:min(460px,62vw);height:26px;overflow:hidden;border-top:1px solid rgba(255,255,255,.45);border-bottom:1px solid rgba(255,255,255,.45);background:linear-gradient(90deg,transparent,rgba(0,0,0,.34) 18%,rgba(0,0,0,.34) 82%,transparent)}
#orCmp i{position:absolute;top:0;left:0;height:26px;display:grid;place-items:center;font:700 13px system-ui;font-style:normal;white-space:nowrap;will-change:transform}
#orCmp i.c{font-size:15px;letter-spacing:.04em}#orCmp i.t{opacity:.55;font-size:10px}
#orCmp i.mob,#pnCmp i.mob{color:#ff5a4a;font-size:10px}#orCmp i.boss,#pnCmp i.boss{color:#ff5a4a;font-size:15px}#orCmp i.gate,#pnCmp i.gate{color:#8fdcff;font-size:12px}#orCmp i.q,#pnCmp i.q{color:#ffd23a;font-size:17px}#orCmp i.poi,#pnCmp i.poi{color:#fff;font-size:13px}#orCmp i.npc,#pnCmp i.npc{color:#e8ecff;font-size:9px;opacity:.8}
#svVox{bottom:142px!important;font-size:11px!important}#sv:has(#pnBan) #orBan{top:29%}#sv:has(#pnHud) #orFps{left:14px;top:140px}
#orDlg{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);z-index:33;width:min(480px,88vw);background:rgba(12,14,24,.9);border:1px solid #8a6a2a;border-radius:12px;padding:12px 16px;color:#e8ecff;font:13px system-ui;display:grid;gap:5px;box-shadow:0 12px 34px rgba(0,0,0,.5)}
#orDlg[hidden]{display:none}#orDlg b{font:400 19px Georgia,serif;color:#ffd23a}#orDlg p{margin:0 0 4px;line-height:1.45}#orDlg kbd{font:700 11px system-ui;padding:1px 7px;border-radius:5px;background:rgba(255,255,255,.14);margin-right:6px}
#orRow{display:flex;gap:14px;align-items:center;font:600 12px system-ui}
#orShout{display:flex;gap:6px;align-items:center}#orShout b{display:block;width:74px;height:6px;border-radius:3px;background:rgba(0,0,0,.5);overflow:hidden}#orShout b u{display:block;height:100%;background:#8fdcff}
#orTgt{display:grid;justify-items:center;gap:2px;font:700 13px system-ui}#orTgt[hidden]{display:none}
#orTgt b{display:block;width:min(300px,44vw);height:7px;border-radius:4px;background:rgba(0,0,0,.55);overflow:hidden}#orTgt b u{display:block;height:100%;background:#d8261c}
#orBan{position:absolute;left:50%;top:19%;transform:translateX(-50%);z-index:32;pointer-events:none;text-align:center;font-family:Georgia,"Times New Roman",serif;color:#fff;text-shadow:0 2px 4px #000,0 0 14px rgba(0,0,0,.8);opacity:0;transition:opacity .5s}
#orBan.on{opacity:1}#orBan small{display:block;font:600 13px system-ui;letter-spacing:.34em;text-transform:uppercase;color:#ffd23a}#orBan b{display:block;font-size:clamp(24px,4.4vw,44px);font-weight:400;letter-spacing:.06em}
#orBan b::after{content:"";display:block;margin:6px auto 0;width:min(320px,60vw);height:1px;background:linear-gradient(90deg,transparent,#fff,transparent)}
#orQ{position:absolute;right:12px;top:64px;z-index:30;pointer-events:none;max-width:min(250px,40vw);text-align:right;font:600 12px system-ui;color:#f4f1ea;text-shadow:0 1px 2px #000,0 0 4px #000;line-height:1.45}
#orQ[hidden]{display:none}#orQ b{display:block;color:#ffd23a;letter-spacing:.14em;text-transform:uppercase;font-size:11px}
#orSneak{position:absolute;left:50%;top:calc(50% + 46px);transform:translateX(-50%);z-index:30;pointer-events:none;font:700 11px system-ui;letter-spacing:.3em;color:#f4f1ea;text-shadow:0 1px 2px #000;opacity:.85}#orSneak[hidden]{display:none}
#orFps{position:absolute;left:10px;top:10px;z-index:30;pointer-events:none;font:600 11px ui-monospace,monospace;color:#f4f1ea;text-shadow:0 1px 2px #000}#orFps[hidden]{display:none}
#orJ{position:absolute;z-index:61;left:50%;top:50%;transform:translate(-50%,-50%);width:min(720px,94vw);max-height:86vh;overflow:auto;background:rgba(12,14,24,.96);border:1px solid #8a6a2a;border-radius:14px;padding:16px 18px;color:#e8ecff;font:13px system-ui;box-shadow:0 18px 50px rgba(0,0,0,.55)}
#orJ[hidden]{display:none}#orJ h3{margin:0 0 6px;font:400 22px Georgia,serif;color:#ffd23a;letter-spacing:.05em}#orJ h4{margin:14px 0 6px;font:700 11px system-ui;letter-spacing:.2em;text-transform:uppercase;color:#f08a24}
#orJ .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}#orJ .d{background:#161a30;border:1px solid #2c335e;border-radius:9px;padding:7px 9px}
#orJ .d b{display:flex;justify-content:space-between}#orJ .d span{display:block;opacity:.7;font-size:11px;margin-top:2px}#orJ .d u{display:block;height:3px;border-radius:2px;background:#f08a24;margin-top:5px}
#orJ button{background:#1c2140;color:inherit;border:1px solid #46508a;border-radius:8px;padding:7px 10px;cursor:pointer;font:600 12px system-ui}#orJ button:hover{border-color:#ffd23a}#orJ button.on{border-color:#f08a24;color:#ffd23a}
#orJ p{margin:4px 0;opacity:.85}#orJ kbd{font:600 11px system-ui;padding:1px 6px;border-radius:5px;background:rgba(255,255,255,.12)}`; document.head.appendChild(c); }
    const mk = (tag, id, html) => { const e = document.createElement(tag); e.id = id; if (html) e.innerHTML = html; sv.appendChild(e); return e; };
    const top = mk("div", "orTop", `<div id="orCmp"></div><div id="orRow"><div id="orShout">P · Stormvoice <b><u></u></b></div><div id="orClock"></div></div><div id="orTgt" hidden><span></span><b><u></u></b></div>`);
    const cmp = $("orCmp"), fixed = [];
    for (let a = 0; a < 360; a += 15) { const e = document.createElement("i"), card = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" }[a]; e.className = card && card.length === 1 ? "c" : "t"; e.textContent = card || "·"; cmp.appendChild(e); fixed.push([a * Math.PI / 180, e]); }
    ui = { root: top, cmp, own: cmp, fixed, pool: [], ban: mk("div", "orBan", "<small></small><b></b>"), q: mk("div", "orQ"), sneak: mk("div", "orSneak"), fps: mk("div", "orFps"), j: mk("div", "orJ"), dlg: mk("div", "orDlg") };
    ui.q.hidden = ui.sneak.hidden = ui.fps.hidden = ui.j.hidden = ui.dlg.hidden = true; ui.j.onclick = jClick;
    return ui;
  };
  const banQ = []; let banBusy = 0;
  const banner = (small, big, ms = 3200) => { banQ.push([small, big, ms]); if (!banBusy) banNext(); };
  const banNext = () => { const b = banQ.shift(), u = ensureUI(); if (!b || !u) { banBusy = 0; return; } banBusy = 1; u.ban.firstChild.textContent = b[0]; u.ban.lastChild.textContent = b[1]; u.ban.classList.add("on"); setTimeout(() => { u.ban.classList.remove("on"); setTimeout(banNext, 550); }, b[2]); };

  // ---------- quests ----------
  const reward = (me, mul) => { const l = (me.prog && me.prog.lvl) || 1; return { c: Math.round((20 + 6 * l) * mul), xp: Math.round((40 + 12 * l) * mul) }; };
  const speciesOf = m => { const a = window.SV && SV.AN && SV.AN[m.k]; if (a && a[9]) return a[9]; return String(m.a[9]).replace(/^(?:[A-Z][a-z-]+ )+(?=[A-Z])/, ""); };
  const questText = q => !q ? "" : q.type === "hunt" ? `Slay ${q.kindName} (${q.n}/${q.need})` : q.type === "boss" ? "Slay the beast that rules this land" : q.type === "drake" ? "Slay the Ancient Drake" : q.type === "peak" ? "Reach the highest ground of this land" : q.type === "courier" ? `Carry the letter to ${q.toName}` : "";
  const questDone = me => { const q = st.quest; if (!q) return; st.quest = null; st.done++; st.log.unshift(`${questText(q).replace(/ \(\d+\/\d+\)/, "")} · ${q.landName}`); st.log.length = Math.min(st.log.length, 12); save();
    banner("Quest completed", q.title, 3600); try { me.prog.coins = (me.prog.coins || 0) + q.r.c; me.saveProg(); me.gainXP(q.r.xp); me.tone(660, .08); setTimeout(() => me.tone && me.tone(990, .12), 120); me.say(`Reward: +${q.r.c} coins · +${q.r.xp} XP`, 3600); } catch (e) { warn(e); } const O = me.orange; if (O && O.beacon) { me.scene.remove(O.beacon); O.beacon = null; } };
  const peakOf = me => { const r = rngOf(hash(me.orange.land.key)); let best = null; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = 120 + r() * 400, x = Math.cos(a) * d, z = Math.sin(a) * d, y = me.H(x, z); if (dry(me, x, z) && (!best || y > best[1])) best = [x, y, z]; } return best; };
  const beacon = (me, x, y, z) => { const T = me.T, O = me.orange; if (O.beacon) me.scene.remove(O.beacon); const b = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 160, 12, 1, true), new T.MeshBasicMaterial({ color: 0xffc23a, fog: false, transparent: true, opacity: .5, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide })); b.position.set(x, y + 80, z); me.scene.add(b); O.beacon = b; };
  const questArm = me => {   // (re)connect the saved quest to this land's world
    const q = st.quest, O = me.orange; O.qPos = null; if (!q) return;
    if (q.type === "courier") { if (q.to === O.land.key) { setTimeout(() => { if (cur() === me) questDone(me); }, 1800); return; } if (q.land === O.land.key && q.d != null) { const j = nb(me.hex, q.d); if (j >= 0) { const a = Math.atan2(cy[j] - cy[me.hex], cx[j] - cx[me.hex]); O.qPos = [Math.cos(a) * 600, Math.sin(a) * 600]; } } return; }
    if (q.land !== O.land.key) return;
    if (q.type === "peak") { const p = peakOf(me); if (p) { O.qPos = [p[0], p[2]]; beacon(me, p[0], p[1], p[2]); } }
    if (q.type === "drake" && !me.mobs.some(m => m.drake && !m.dead)) spawnDrake(me);
  };
  const questOffer = (me, giver) => {
    const O = me.orange, alive = me.mobs.filter(m => !m.dead && !m.tame), pool = [], lvl = (me.prog && me.prog.lvl) || 1;
    const by = {}; for (const m of alive) if (!m.boss && !m.drake) (by[m.k] = by[m.k] || []).push(m);
    const top = Object.values(by).sort((a, b) => b.length - a.length)[0];
    if (top) pool.push(() => ({ type: "hunt", kind: top[0].k, kindName: speciesOf(top[0]), n: 0, need: Math.min(3, top.length), r: reward(me, 1), title: "Thin the Herd", say: `The ${speciesOf(top[0])}s grow too bold. Cut down ${Math.min(3, top.length)} of them and I'll make it worth your while.` }));
    if (alive.some(m => m.boss)) pool.push(() => ({ type: "boss", r: reward(me, 3), title: "The Beast of " + O.land.name, say: "A great beast rules this land. No one here dares face it. Will you?" }));
    if (peakOf(me)) pool.push(() => ({ type: "peak", r: reward(me, 1), title: "The High Ground", say: "From the highest ground you can see the whole land. Climb it and light the old beacon for us." }));
    const ways = []; for (let d = 0; d < 6; d++) { const j = nb(me.hex, d); if (j >= 0 && D.reg[j] >= 0 && landOf(j).key !== O.land.key) ways.push([d, j]); }
    if (ways.length) pool.push(() => { const [d, j] = ways[Math.floor(Math.random() * ways.length)], L = landOf(j); return { type: "courier", d, to: L.key, toName: L.name, r: reward(me, 1.5), title: "A Letter for " + L.name, say: `Take this letter to ${L.name}. Follow the blue light at the edge of the land.` }; });
    if (lvl >= 4 && Math.random() < .3) pool.push(() => ({ type: "drake", r: reward(me, 6), title: "Wings over " + O.land.name, say: "A drake has come down from the high places. It burns everything. Kill it, and its soul is yours." }));
    if (!pool.length) return null;
    const q = pool[Math.floor(Math.random() * pool.length)](); q.land = O.land.key; q.landName = O.land.name; q.giver = giver; st.quest = q; save(); questArm(me);
    banner("New quest", q.title, 3000); try { me.tone(520, .07); } catch (e) {} return q;
  };
  const DIRN = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"], dirWord = (me, x, z) => DIRN[Math.round(wrap(Math.atan2(x - me.pos.x, -(z - me.pos.z))) / (Math.PI / 4) + 8) % 8];
  const IDLE = ["Safe travels, stranger.", "Keep your blade close, the beasts are bold here.", "The blue lights at the edge of the land lead elsewhere.", "Mind the nights. Things hunt in the dark."];
  const workLine = (me, name) => { const q = st.quest, O = me.orange;
    if (!q) { const n = questOffer(me, name); return n ? n.say + "  (L = journal)" : "Nothing needs doing today. Come back later."; }
    if (q.land === O.land.key || q.type === "courier") return q.type === "hunt" ? `Still ${q.need - q.n} to go. Good hunting.` : q.type === "courier" ? `That letter won't carry itself to ${q.toName}.` : q.type === "peak" ? "Follow the golden light to the high ground." : "It is still out there. Be careful.";
    return `You have work waiting in ${q.landName}. Finish it, or drop it in your journal (L).`; };
  const rumour = me => { const O = me.orange, out = [];
    for (const p of O.pois) if (!p.found) out.push(() => { p.hint = 1; return `They say ${p.rumour} to the ${dirWord(me, p.x, p.z)}. I have marked the way for you.`; });
    const dk = me.mobs.find(m => m.drake && !m.dead); if (dk) out.push(() => `A drake was seen to the ${dirWord(me, dk.root.position.x, dk.root.position.z)}. Stay clear, or bring fire of your own.`);
    const bs = me.mobs.find(m => m.boss && !m.dead); if (bs) out.push(() => `The great beast of this land prowls to the ${dirWord(me, bs.root.position.x, bs.root.position.z)}.`);
    for (const f of OX.rumours) { try { const t = f(me); if (t) out.push(() => t); } catch (e) {} }
    return out.length ? out[Math.floor(Math.random() * out.length)]() : IDLE[Math.floor(Math.random() * IDLE.length)]; };
  const dlgDraw = (me, line) => { const u = ensureUI(), d = me.orange.dlg; if (!u) return; if (!d) { u.dlg.hidden = true; return; } u.dlg.hidden = false;
    u.dlg.innerHTML = `<b>${esc(d.name)}</b><p>${esc(line)}</p><span><kbd>1</kbd>Any work for me?</span><span><kbd>2</kbd>Heard any rumours?</span><span><kbd>3</kbd>Train me (skills and training)</span><span><kbd>4</kbd>Farewell</span>`; };
  const dlgClose = me => { me.orange.dlg = null; const u = ensureUI(); if (u) u.dlg.hidden = true; };
  const dlgKey = (me, code) => { const d = me.orange.dlg; if (!d) return false; const n = { Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Numpad1: 1, Numpad2: 2, Numpad3: 3, Numpad4: 4, Escape: 4, KeyE: 4 }[code]; if (!n) return false;
    if (n === 1) dlgDraw(me, workLine(me, d.name)); else if (n === 2) dlgDraw(me, rumour(me)); else if (n === 3) { dlgClose(me); me.toggleTree && me.toggleTree(); } else dlgClose(me); try { me.tone && me.tone(700, .03); } catch (e) {} return true; };
  const onTalk = me => { const msg = $("svMsg"), name = msg ? msg.textContent.split(":")[0] : "Villager"; if (msg) msg.hidden = true; me.orange.dlg = { name, x: me.pos.x, z: me.pos.z }; dlgDraw(me, "Well met, traveller. What do you need?"); };

  // ---------- drake: a winged world boss that breathes fire ----------
  let puffT = null; const puff = T => { if (!puffT) { const c = document.createElement("canvas"); c.width = c.height = 32; const x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); puffT = new T.CanvasTexture(c); } return puffT; };
  const spawnDrake = me => {
    const T = me.T, O = me.orange; let m = null;
    for (const k of ["komodo", "perentie", "nilecroc", "gator"]) { if (!(window.SV && SV.AN && SV.AN[k])) continue; try { m = me.spawn(k, true, false); } catch (e) { m = null; } if (m) break; }
    if (!m) return null;
    const lvl = (me.prog && me.prog.lvl) || 1, bb = new T.Box3().setFromObject(m.root), s0 = m.root.scale.x || 1, w = (bb.max.x - bb.min.x) / s0, h = (bb.max.y - bb.min.y) / s0, K = 2.3;
    m.root.scale.multiplyScalar(K); m.a[1] *= K; m.a[2] *= K; m.a[5] *= 1.15; m.a[7] *= 1.5; m.a[9] = "Ancient Drake"; m.hp = m.mx = 700 + 110 * lvl; m.drake = 1; m.champ = 1; m.noRe = 1; m.named = 0; m.tr.clear(); m.tr.add("relentless"); m.tr.add("thick-hided");   /* never a skittish or fragile one */
    const seen = new Set(); m.root.traverse(o => { const mt = o.material; if (mt && mt.color && !seen.has(mt)) { seen.add(mt); const l = mt.color.r * .3 + mt.color.g * .59 + mt.color.b * .11; mt.color.setRGB(.16 + l * .75, .05 + l * .12, .04 + l * .08); } });
    const wm = new T.MeshLambertMaterial({ color: 0x6a1410, side: T.DoubleSide, flatShading: true }), span = Math.max(w * 1.6, h * 2.4, .9), sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(span, span * .5); sh.lineTo(span * .82, 0); sh.lineTo(span * .62, -span * .2); sh.lineTo(span * .42, .02); sh.lineTo(span * .22, -span * .15); sh.lineTo(0, 0);
    const wg = new T.ShapeGeometry(sh); m.orW = [-1, 1].map(sd => { const p = new T.Group(); p.position.set(sd * w * .12, h * .92, 0); const o = new T.Mesh(wg, wm); if (sd < 0) o.rotation.y = Math.PI; p.add(o); m.root.add(p); return [p, sd]; });
    O.drake = { m, cd: 4, wind: 0, fire: 0, dir: [0, 1], emit: 0 }; banner("A shadow passes overhead", "An Ancient Drake stalks this land", 4200); try { me.tone(90, .5); } catch (e) {}
    return m;
  };
  const drakeTick = (me, dt, t) => {
    const O = me.orange, Dk = O.drake; if (!Dk) return; const T = me.T, m = Dk.m, p = m.root.position;
    for (const [g, sd] of m.orW) g.rotation.z = sd * (.25 + Math.sin(t * (m.angry > 0 ? 7 : 2.4)) * .35);
    for (let i = O.fireP.length - 1; i >= 0; i--) { const f = O.fireP[i]; f.t += dt; f.o.position.addScaledVector(f.v, dt); f.o.scale.setScalar(.7 + f.t * 2.6); f.o.material.opacity = .7 * (1 - f.t / f.d); if (f.t >= f.d) { me.scene.remove(f.o); f.o.material.dispose(); O.fireP.splice(i, 1); } }
    if (m.dead) { if (!O.fireP.length) O.drake = null; return; }
    const dx = me.pos.x - p.x, dz = me.pos.z - p.z, dist = Math.hypot(dx, dz) || 1; Dk.cd -= dt;
    if (Dk.wind > 0) { Dk.wind -= dt; if (Dk.wind <= 0) { Dk.fire = 1.5; Dk.dir = [dx / dist, dz / dist]; try { me.tone(140, .5); } catch (e) {} } }
    else if (Dk.fire > 0) {
      Dk.fire -= dt; const k = Math.min(1, dt * 1.6); Dk.dir[0] += (dx / dist - Dk.dir[0]) * k; Dk.dir[1] += (dz / dist - Dk.dir[1]) * k; const n = Math.hypot(Dk.dir[0], Dk.dir[1]) || 1, fx = Dk.dir[0] / n, fz = Dk.dir[1] / n;
      m.root.rotation.y = Math.atan2(fx, fz); m.hd = m.root.rotation.y; m.stun = Math.max(m.stun || 0, .1);   // it plants its feet while it breathes
      Dk.emit -= dt; while (Dk.emit <= 0 && O.fireP.length < 70) { Dk.emit += .035; const o = new T.Sprite(new T.SpriteMaterial({ map: puff(T), color: Math.random() < .4 ? 0xffd060 : 0xff6a18, transparent: true, opacity: .7, depthWrite: false, blending: T.AdditiveBlending, fog: false })), sp = 15 + Math.random() * 5, j = (Math.random() - .5) * .34;
        o.position.set(p.x + fx * m.a[1] * .45, p.y + m.a[2] * .55 + .4, p.z + fz * m.a[1] * .45); me.scene.add(o); O.fireP.push({ o, t: 0, d: .75 + Math.random() * .2, v: new T.Vector3((fx + fz * j) * sp, .6 + Math.random() * 1.6, (fz - fx * j) * sp) }); }
      const along = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
      if (along > 0 && along < 15 && side < 1.6 + along * .22 && !(me.rollT > 0) && me.hp > 1) { me.hp = Math.max(1, me.hp - (me.block ? 9 : 24) * dt / (me.up ? me.up("hp") : 1)); me.hurtT = 1; try { me.hpDraw(); } catch (e) {} const hu = $("svHurt"); if (hu) { hu.style.opacity = .45; clearTimeout(O.huT); O.huT = setTimeout(() => hu.style.opacity = 0, 160); } }
    }
    else if (Dk.cd <= 0 && m.angry > 0 && dist < 13.5 && dist > 3 && !(m.stun > 0)) { Dk.cd = 7 + Math.random() * 3; Dk.wind = .9; try { me.tele && me.tele(m, .9, "🔥"); me.tone(220, .25); } catch (e) {} }
  };

  // ---------- Stormvoice (P: the only free letter. U I O = gods layer Cast / Call / Codex, Z = Rage shatter, G = chop): a shockwave that staggers and throws back everything in front of you ----------
  const voiceLvl = () => Math.min(5, 1 + (st.souls || 0)), voiceCd = () => Math.max(8, 22 - 3 * (voiceLvl() - 1));
  const shout = me => {
    const O = me.orange, T = me.T; if (me.hp <= 0) return true;
    if (O.shCd > 0) { me.say(`Stormvoice returns in ${Math.ceil(O.shCd)} s`, 900); return true; }
    O.shCd = voiceCd(); const L = voiceLvl(), R = 13 + 2.5 * L, fx = Math.sin(me.face), fz = Math.cos(me.face), dmg = (12 + 9 * L) * (1 + .04 * (dLvl("voice") - 1)); let n = 0;
    for (let i = 0; i < 3; i++) { const ring = new T.Mesh(new T.RingGeometry(.5, .95, 40), new T.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, side: T.DoubleSide, depthWrite: false, fog: false })); ring.position.set(me.pos.x + fx * (1.5 + i * 2.6), me.pos.y + 1.2, me.pos.z + fz * (1.5 + i * 2.6)); ring.rotation.y = me.face; me.scene.add(ring); me.fx.push({ o: ring, t: 0, d: .45 + i * .14, s: 5 + i * 3.5, a: .9 }); }
    O.shouting = 1;
    try { for (const m of me.mobs) { if (m.dead || m.tame) continue; const dx = m.root.position.x - me.pos.x, dz = m.root.position.z - me.pos.z, d = Math.hypot(dx, dz) || 1; if (d > R + m.a[1] * .4 || (dx * fx + dz * fz) / d < .72 && d > 2.5) continue;
      const kb = (m.drake || m.boss ? 5 : 15) * (1 - d / (R + 6) * .5); O.push.push({ m, vx: dx / d * kb, vz: dz / d * kb, t: .38 }); m.stun = Math.max(m.stun || 0, (m.drake ? .9 : 1.5) + .15 * L); me.hurtMob(m, dmg, me.pos, true); n++; } } catch (e) { warn(e); }
    O.shouting = 0; me.shake = Math.max(me.shake || 0, .5); try { me.tone(96, .45); me.tone(64, .7); me.tone(190, .18); } catch (e) {}
    if (n) dGain(me, "voice", 6 + 3 * n); return true;
  };

  // ---------- day and night ----------
  const nightOf = h => h >= 7 && h < 18 ? 0 : h >= 18 && h < 20.5 ? ss(18, 20.5, h) : h >= 4.5 && h < 7 ? 1 - ss(4.5, 7, h) : 1;
  const dnInit = me => {
    const sc = me.scene, T = me.T, O = me.orange, b = me.bio || {};
    if (/night|aurora/.test(b.t || "") || !me.sky || !me.sun || !me.sunDir || !sc.fog) return;
    const hemi = sc.children.find(o => o.isHemisphereLight), dir = sc.children.find(o => o.isDirectionalLight); if (!hemi || !dir) return;
    const pos = me.sky.geometry.attributes.position, col = me.sky.geometry.attributes.color, hw = new Float32Array(pos.count); for (let k = 0; k < pos.count; k++) hw[k] = (1 - Math.min(1, Math.abs(pos.getY(k)) / 4000)) ** 2;
    const sp = []; const r = rngOf(7); for (let k = 0; k < 700; k++) { const a = r() * 6.283, e = Math.asin(r()); sp.push(Math.cos(e) * Math.sin(a) * 3800, Math.sin(e) * 3800, Math.cos(e) * Math.cos(a) * 3800); }
    const sg = new T.BufferGeometry(); sg.setAttribute("position", new T.Float32BufferAttribute(sp, 3)); const stars = new T.Points(sg, new T.PointsMaterial({ size: 2, sizeAttenuation: false, fog: false, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); stars.visible = false; me.sky.add(stars);
    const sd = me.sunDir.clone(), az = Math.atan2(sd.x, sd.z);
    O.dn = { hemi, dir, hi: hemi.intensity, di: dir.intensity, dc: dir.color.clone(), hc: hemi.color.clone(), hg: hemi.groundColor.clone(), fog: sc.fog.color.clone(), sky: Float32Array.from(col.array), hw, col, stars, sd, moon: new T.Vector3(Math.sin(az + 2.2) * .7, .66, Math.cos(az + 2.2) * .7).normalize(), so: me.sun.material.opacity, sc: me.sun.material.color.clone(), ss: me.sun.scale.x, tmp: new T.Color(), last: -1, lastX: 0, fn: sc.fog.near, ff: sc.fog.far };
  };
  const dnApply = (me, force) => {
    const O = me.orange, d = O.dn; if (!d) return; const on = opt("daynight"), n = on ? nightOf(st.clock) : 0, x = O.wxF || 0; if (!force && Math.abs(n - d.last) < .004 && Math.abs(x - d.lastX) < .01) return; d.last = n; d.lastX = x;
    // x = weather (mods/30-orange-atmos.js): the sky, the fog and the light go grey with it, and the fog closes in
    const w = 4 * n * (1 - n) * (1 - x), T = me.T, a = d.sky, c = d.col.array, k = 1 - .9 * n, gr = .3 - .26 * n, xs = x * .85;
    for (let i = 0, v = 0; i < a.length; i += 3, v++) { const g = w * .3 * d.hw[v], r = a[i] * k + .015 * n + g, gg = a[i + 1] * k + .025 * n + g * .5, b = a[i + 2] * k + .06 * n + g * .12; c[i] = r + (gr * .94 - r) * xs; c[i + 1] = gg + (gr - gg) * xs; c[i + 2] = b + (gr * 1.07 - b) * xs; }
    d.col.needsUpdate = true;
    d.hemi.intensity = d.hi * (1 - .42 * n) * (1 - .2 * x); d.hemi.color.copy(d.hc).lerp(d.tmp.setHex(0x4a62b0), n * .85); d.hemi.groundColor.copy(d.hg).lerp(d.tmp.setHex(0x2a3a66), n * .6);   /* a blue night you can still fight in */
    d.dir.intensity = d.di * (1 - .62 * n) * (1 - .6 * x); d.dir.color.copy(d.dc).lerp(d.tmp.setHex(0x8fa8ff), n).lerp(d.tmp.setHex(0xff9a5a), w * .55);
    me.scene.fog.color.copy(d.fog).multiplyScalar(1 - .78 * n).lerp(d.tmp.setHex(0x0c1430), n * .5).lerp(d.tmp.setHex(0xff9a5a), w * .22).lerp(d.tmp.setRGB(gr * .94, gr, gr * 1.07), x * .8);
    me.scene.fog.near = d.fn * (1 - .6 * x); me.scene.fog.far = d.ff * (1 - .55 * x);
    me.sunDir.copy(d.sd).lerp(d.moon, n).normalize(); d.dir.position.copy(me.sunDir);
    me.sun.material.opacity = (d.so + (.85 - d.so) * n) * (1 - .9 * x); me.sun.material.color.copy(d.sc).lerp(d.tmp.setHex(0xdfe8ff), n); me.sun.scale.setScalar(d.ss + (150 - d.ss) * n);
    d.stars.visible = n > .25 && x < .9; d.stars.material.opacity = clamp(n * 1.3 - .3, 0, 1) * (1 - x);
  };

  // ---------- journal (L) ----------
  const jDraw = () => {
    const u = ensureUI(), me = cur(); if (!u || u.j.hidden) return; const q = st.quest, lvl = (me && me.prog && me.prog.lvl) || 1, found = Object.keys(st.found).length;
    const O = [["daynight", "Day and night"], ["autores", "Auto resolution (keeps the frame rate up)"], ["fps", "FPS meter"], ["compass", "Compass bar"], ["weather", "Weather (rain, snow, storms)"]];
    u.j.innerHTML = `<h3>Journal</h3><p>Level ${lvl} · ${st.done} quest${st.done === 1 ? "" : "s"} done · ${found} land${found === 1 ? "" : "s"} discovered · ${st.souls || 0} drake soul${st.souls === 1 ? "" : "s"}</p>
<h4>Quest</h4>${q ? `<div class="d"><b><span>${esc(q.title)}</span><span>+${q.r.c} coins · +${q.r.xp} XP</span></b><span>${esc(questText(q))} · ${esc(q.landName)}${q.giver ? " · from " + esc(q.giver) : ""}</span></div><p><button data-a="drop">Drop this quest</button></p>` : `<p>No quest. Talk to a villager (<kbd>E</kbd>) to get one.</p>`}
<h4>Skills (they grow as you use them)</h4><div class="g">${Object.entries(DEEDS).map(([k, [n, h]]) => { const d = deed(k); return `<div class="d"><b><span>${n}</span><span>${d.l}</span></b><span>${h}</span><u style="width:${Math.round(100 * d.x / dNeed(d.l))}%"></u></div>`; }).join("")}</div>
<h4>Stormvoice · level ${voiceLvl()} of 5</h4><p><kbd>P</kbd> a shockwave that staggers and throws back what is in front of you · ready every ${voiceCd()} s · each drake soul makes it stronger</p>
${OX.jExtra.map(f => { try { return f(); } catch (e) { return ""; } }).join("")}
<h4>How it works</h4><p><kbd>Ctrl</kbd> crouch, then strike a beast that has not noticed you: sneak attack, triple damage or more · the bar at the top is your compass: red = hostile, blue = the way to the next land, gold = your quest · a gold <b>!</b> floats over villagers who have work · weather comes and goes, and a torch lights itself when it gets dark</p>
<h4>Keys</h4><p><kbd>WASD</kbd> move · <kbd>Shift</kbd> run (tap twice: dash) · <kbd>Space</kbd> jump (tap twice: dodge roll) · <kbd>Ctrl</kbd> crouch · <kbd>C</kbd> turn round</p>
<p><kbd>LMB</kbd> strike (hold: charged) · <kbd>RMB</kbd> or <kbd>Q</kbd> block, a late tap parries · <kbd>1</kbd> sword <kbd>2</kbd> bow <kbd>3</kbd> axe <kbd>4</kbd> hammer <kbd>5</kbd> spear · <kbd>R</kbd> arm art · <kbd>T</kbd> spin · <kbd>F</kbd> dash strike · <kbd>Z</kbd> rage, when its bar is full</p>
<p><kbd>U</kbd> cast · <kbd>I</kbd> call your god · <kbd>P</kbd> Stormvoice · <kbd>7</kbd> firebolt · <kbd>8</kbd> hold: heal · <kbd>9</kbd> frost</p>
<p><kbd>E</kbd> use, talk, pick up · <kbd>Tab</kbd> bag · <kbd>"</kbd> or <kbd>K</kbd> skill tree · <kbd>L</kbd> journal · <kbd>O</kbd> gods, boons and arms · <kbd>B</kbd> mine <kbd>N</kbd> place <kbd>M</kbd> switch block <kbd>G</kbd> chop · <kbd>H</kbd> help line · <kbd>Esc</kbd> back to the map (the only key that leaves)</p>
${st.log.length ? `<h4>Done</h4>${st.log.map(l => `<p>✓ ${esc(l)}</p>`).join("")}` : ""}
<h4>Options</h4><p style="display:flex;gap:6px;flex-wrap:wrap">${O.map(([k, n]) => `<button data-o="${k}" class="${opt(k) ? "on" : ""}">${n}: ${opt(k) ? "on" : "off"}</button>`).join("")}</p><p style="opacity:.6"><kbd>L</kbd> close</p>`;
  };
  function jClick(e) {
    const b = e.target.closest("button"); if (!b) return; const me = cur();
    if (b.dataset.o) { const k = b.dataset.o; st.opt[k] = opt(k) ? 0 : 1; save(); if (me && me.orange) { if (k === "daynight") dnApply(me, 1); if (k === "autores" && !opt(k)) setPx(me, 1.5); } }
    if (b.dataset.a === "drop") { st.quest = null; save(); if (me && me.orange) { me.orange.qPos = null; if (me.orange.beacon) { me.scene.remove(me.orange.beacon); me.orange.beacon = null; } } }
    jDraw();
  }
  const jToggle = () => { const u = ensureUI(); if (!u) return; u.j.hidden = !u.j.hidden; if (!u.j.hidden) { try { document.exitPointerLock(); } catch (e) {} jDraw(); } else if (window.svLock) window.svLock(); };

  // ---------- resolution saver ----------
  const setPx = (me, px) => { const O = me.orange; if (!me.R || !me.pix || O.px === px) return; O.px = px; try { me.R.setPixelRatio(1 / px); me.R.setSize(innerWidth, innerHeight); me.pix.size(); } catch (e) { warn(e); } };
  const fpsTick = (me, now) => {
    const O = me.orange, F = O.f; if (!F.last) { F.last = now; return; } const ms = now - F.last; F.last = now; if (ms > 250 || document.visibilityState !== "visible" || !document.hasFocus()) { F.slow = F.fast = 0; return; }
    F.ema = F.ema ? F.ema + (Math.min(ms, 80) - F.ema) * .05 : ms; F.n++;
    if (opt("autores") && F.n > 240) {   // only after the land has settled; a step that does not help is undone and not tried again for a minute
      if (F.try) { if ((F.tryT -= ms) <= 0) { if (F.ema > F.try.before * .88) { setPx(me, F.try.from); F.hold = 60000; } F.try = null; } }
      else if ((F.hold -= ms) <= 0) {
        if (F.ema > 24) { if ((F.slow += ms) > 2500 && O.px < 2.5) { F.try = { from: O.px, before: F.ema }; F.tryT = 3000; setPx(me, O.px + .5); F.slow = 0; } } else F.slow = 0;
        if (F.ema < 12.5 && O.px > 1.5) { if ((F.fast += ms) > 6000) { setPx(me, O.px - .5); F.fast = 0; F.hold = 8000; } } else F.fast = 0;
      }
    }
  };

  // ---------- per frame ----------
  const marker = (u, i, cls, txt) => { let e = u.pool[i]; if (!e) { e = document.createElement("i"); u.cmp.appendChild(e); u.pool[i] = e; } if (e.className !== cls) e.className = cls; if (e.textContent !== txt) e.textContent = txt; return e; };
  const tick = (me, dt, t) => {
    const O = me.orange, u = ensureUI(), now = performance.now(), rdt = Math.min(.1, (now - (O.now || now)) / 1000); O.now = now; if (!u) return;
    fpsTick(me, now); drakeTick(me, dt, t); for (const f of OX.onTick) f(me, dt, t, rdt);
    if (O.dlg && Math.hypot(me.pos.x - O.dlg.x, me.pos.z - O.dlg.z) > 5) dlgClose(me);
    for (let i = O.push.length - 1; i >= 0; i--) { const p = O.push[i]; p.t -= dt; if (p.t <= 0 || p.m.dead) { O.push.splice(i, 1); continue; } const x = p.m.root.position.x + p.vx * dt, z = p.m.root.position.z + p.vz * dt; if (dry(me, x, z)) { p.m.root.position.x = x; p.m.root.position.z = z; } }
    if (O.shCd > 0) O.shCd -= rdt;
    st.clock = (st.clock + rdt * 24 / (24 * 60)) % 24;   // one day = 24 minutes
    // athletics
    { const dx = me.pos.x - O.lx, dz = me.pos.z - O.lz, d = Math.hypot(dx, dz); O.lx = me.pos.x; O.lz = me.pos.z; if (d < 3 && me.runNow && !me.flying) { O.ran += d; if (O.ran > 40) { O.ran = 0; dGain(me, "athletics", 3); } } }
    // quests that finish by where you stand
    const q = st.quest; if (q && q.type === "peak" && O.qPos && Math.hypot(me.pos.x - O.qPos[0], me.pos.z - O.qPos[1]) < 6) questDone(me);
    if ((O.slowT += rdt) < .066) return; const sdt = O.slowT; O.slowT = 0;   // the HUD itself: 15 times a second is plenty
    dnApply(me);
    // one compass: where the main game's gods layer has its own bar (shrines), Orange puts its marks on that bar and hides its own
    { const pc = $("pnCmp") || u.own; if (u.cmp !== pc) { for (const e of u.pool) e.remove(); u.pool = []; u.cmp = pc; u.own.style.display = pc === u.own ? "" : "none"; }
      const pt = pc !== u.own && $("pnTop"), y = pt ? pt.offsetHeight + 16 : 10; if (u.topY !== y) { u.topY = y; u.root.style.top = y + "px"; } }
    const W = u.cmp.clientWidth || 460, half = W / 2, span = u.cmp === u.own ? Math.PI * .56 : 1.3, put = (e, rel) => { const v = Math.abs(rel) < span; e.style.display = v ? "" : "none"; if (v) e.style.transform = `translateX(${(half + rel / span * half).toFixed(1)}px) translateX(-50%)`; };
    u.root.style.display = opt("compass") ? "" : "none";
    if (opt("compass")) {
      if (u.cmp === u.own) for (const [a, e] of u.fixed) put(e, wrap(a + me.yaw));
      let i = 0; const rel = (x, z) => wrap(Math.atan2(x - me.pos.x, -(z - me.pos.z)) + me.yaw);
      for (const g of O.gates) put(marker(u, i++, "gate", "◆"), rel(g[0], g[1]));
      for (const p of O.pois) if (p.found || p.hint || Math.hypot(p.x - me.pos.x, p.z - me.pos.z) < 140) put(marker(u, i++, "poi", p.icon), rel(p.x, p.z));
      if (!q) for (const n of O.npcs) if (Math.hypot(n.position.x - me.pos.x, n.position.z - me.pos.z) < 90) put(marker(u, i++, "npc", "○"), rel(n.position.x, n.position.z));
      for (const m of me.mobs) { if (m.dead || m.tame) continue; const d = Math.hypot(m.root.position.x - me.pos.x, m.root.position.z - me.pos.z); if (m.boss || m.drake) put(marker(u, i++, "boss", m.drake ? "🐲" : "☠"), rel(m.root.position.x, m.root.position.z)); else if (m.angry > 0 && d < 70) put(marker(u, i++, "mob", "●"), rel(m.root.position.x, m.root.position.z)); }
      let qp = O.qPos; if (q && q.land === O.land.key && (q.type === "boss" || q.type === "drake" || q.type === "hunt")) { let best = null, bd = 1e9; for (const m of me.mobs) { if (m.dead) continue; if (q.type === "hunt" ? m.k !== q.kind : q.type === "boss" ? !m.boss : !m.drake) continue; const d = Math.hypot(m.root.position.x - me.pos.x, m.root.position.z - me.pos.z); if (d < bd) { bd = d; best = m; } } qp = best ? [best.root.position.x, best.root.position.z] : null; }
      if (qp) put(marker(u, i++, "q", "▼"), rel(qp[0], qp[1]));
      for (; i < u.pool.length; i++) u.pool[i].style.display = "none";
      const sh = u.root.querySelector("#orShout u"); if (sh) sh.style.width = (100 * (1 - clamp(O.shCd / voiceCd(), 0, 1))).toFixed(0) + "%";
      const h = st.clock, ck = $("orClock"); if (ck) ck.textContent = O.dn && opt("daynight") ? `${O.wxF > .3 ? (O.at && O.at.last === "snow" ? "❄" : "☂") : nightOf(h) > .5 ? "☾" : "☀"} ${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor(h % 1 * 6) * 10).padStart(2, "0")}` : "";
      const tg = $("orTgt"), m = O.tgt; if ((O.tgtT -= sdt) > 0 && m && !m.dead) { tg.hidden = false; tg.firstChild.textContent = m.a[9]; tg.lastChild.firstChild.style.width = clamp(100 * m.hp / m.mx, 0, 100).toFixed(0) + "%"; } else tg.hidden = true;
    } else for (const e of u.pool) e.style.display = "none";
    u.q.hidden = !q; if (q) { const here = q.land === O.land.key || q.type === "courier"; u.q.innerHTML = `<b>${esc(q.title)}</b>${esc(here ? questText(q) : "Return to " + q.landName)}`; }
    const hot = me.mobs.some(m => !m.dead && !m.tame && m.angry > 0 && Math.hypot(m.root.position.x - me.pos.x, m.root.position.z - me.pos.z) < 45); u.sneak.hidden = !me.crouching; if (me.crouching) u.sneak.textContent = hot ? "DETECTED" : "HIDDEN";
    u.fps.hidden = !opt("fps"); if (opt("fps") && O.f.ema) u.fps.textContent = `${Math.round(1000 / O.f.ema)} fps · ${O.f.ema.toFixed(1)} ms · 1/${O.px} res`;
  };

  // ---------- once per land ----------
  const init = me => {
    if (!me || me.orange || !me.T || !me.scene || !me.mobs) return; const land = landOf(me.hex);
    const O = me.orange = { land, push: [], fireP: [], gates: [], pois: [], npcs: [], dlg: null, shCd: 0, tgt: null, tgtT: 0, lx: me.pos.x, lz: me.pos.z, ran: 0, slowT: 0, px: 1.5, f: { n: 0, slow: 0, fast: 0, hold: 0 } };
    for (let d = 0; d < 6; d++) { const j = nb(me.hex, d); if (j < 0 || D.reg[j] < 0) continue; const a = Math.atan2(cy[j] - cy[me.hex], cx[j] - cx[me.hex]); O.gates.push([Math.cos(a) * 600, Math.sin(a) * 600]); }
    ensureUI(); dlgClose(me);
    try { O.npcs = me.scene.children.filter(o => o.isGroup && o.children.filter(c => c.isGroup).length === 4 && [6, 9].includes(o.children.filter(c => c.isMesh).length)); } catch (e) { O.npcs = []; }   /* villagers: the only groups built as 4 limbs + 6 or 9 body parts */
    const hit0 = me.onHit, kill0 = me.onKill, par0 = me.parried, up0 = me.up, talk0 = me.talk;
    me.onHit = (m, dmg, crit, heavy) => { try { hit0 && hit0(m, dmg, crit, heavy); } catch (e) { warn(e); }
      try { O.tgt = m; O.tgtT = 6; if (O.shouting) return; const k = me.weapon === "bow" ? "archery" : /axe|hammer/.test(String(me.melee || "")) ? "twohand" : "onehand"; let extra = dmg * .01 * (dLvl(k) - 1);
        if (me.crouching && !(m.angry > 0) && !m.orSn) { const mul = 2 + .05 * (dLvl("sneak") - 1); extra += dmg * mul; m.orSn = 1; banner("Sneak attack", `×${(1 + mul).toFixed(1)} damage`, 1300); dGain(me, "sneak", 14); try { me.popNum(m, dmg * mul, true); } catch (e) {} }
        if (extra > 0) m.hp -= extra; dGain(me, k, clamp(dmg / 6, 1, 12)); } catch (e) { warn(e); } };
    me.onKill = (m, from, heavy) => { try { kill0 && kill0(m, from, heavy); } catch (e) { warn(e); }
      try { const q = st.quest; if (q && q.land === land.key) { if (q.type === "hunt" && m.k === q.kind) { q.n++; save(); if (q.n >= q.need) questDone(me); else banner("Quest", questText(q), 1500); } else if (q.type === "boss" && m.boss) questDone(me); else if (q.type === "drake" && m.drake) questDone(me); }
        if (m.drake) { st.souls = (st.souls || 0) + 1; (st.slain = st.slain || {})[land.key] = 1; save(); banner("Drake soul absorbed", voiceLvl() > Math.min(5, st.souls) ? "Your voice already shakes the mountains" : `Stormvoice is now level ${voiceLvl()}`, 4200); me.dropCoins && me.dropCoins(m.root.position, 120); me.gainXP && me.gainXP(250); } } catch (e) { warn(e); } };
    if (par0) me.parried = m => { par0(m); try { me.st = Math.min(me.stMax || 100, me.st + 2 * (dLvl("block") - 1)); dGain(me, "block", 10); } catch (e) { warn(e); } };
    if (up0) me.up = k => up0(k) * (k === "spd" ? 1 + .003 * (dLvl("athletics") - 1) : 1);
    if (talk0) me.talk = () => { const r = talk0(); if (r) try { onTalk(me); } catch (e) { warn(e); } return r; };
    try { dnInit(me); dnApply(me, 1); } catch (e) { warn(e); O.dn = null; }
    me.ps.push((dt, t) => { if (cur() !== me) return; try { tick(me, dt, t); } catch (e) { if (!O.err) { O.err = 1; warn(e); } } });
    // discovery
    if (!st.found[land.key]) { st.found[land.key] = 1; save(); setTimeout(() => { if (cur() !== me) return; banner("Discovered", land.name, 3800); try { me.tone(392, .12); setTimeout(() => me.tone && me.tone(587, .2), 160); me.gainXP(15); } catch (e) {} }, 900); }
    else setTimeout(() => { if (cur() === me) banner(land.country || "", land.name, 1800); }, 700);
    try { questArm(me); } catch (e) { warn(e); }
    for (const f of OX.onInit) { try { f(me); } catch (e) { warn(e); } }
    // a drake haunts about one land in seven once you can stand up to it
    try { const lvl = (me.prog && me.prog.lvl) || 1; if (!O.drake && lvl >= 4 && hash(land.key + "|drake") % 7 === 0 && !(st.slain && st.slain[land.key])) setTimeout(() => { if (cur() === me && !O.drake) spawnDrake(me); }, 6000); } catch (e) { warn(e); }
    if ((st.seen = (st.seen || 0) + 1) <= 4) setTimeout(() => { if (cur() === me) me.say("H = keys", 4000); }, 5200);
    save();
  };

  const restore0 = window.hxRestore;
  window.hxRestore = me => { try { restore0 && restore0(me); } finally { try { init(me); } catch (e) { warn(e); } } };
  const key0 = window.hxKey;
  window.hxKey = (code, me) => {
    try { if (me && me.orange && !(me.pn && me.pn.ui)) { if (dlgKey(me, code)) return true; if (code === "KeyL") { jToggle(); return true; } if (code === "KeyP") return shout(me); for (const f of OX.onKey) if (f(me, code)) return true; } } catch (e) { warn(e); }
    return key0 ? key0(code, me) : false;
  };
  OX.dUp = (me, k) => dGain(me, k, dNeed(deed(k).l) - deed(k).x);   // one full level of a skill (a tome)
  Object.assign(OX, { st, banner, shout, spawnDrake, questOffer, jToggle, jDraw, nightOf, save, dGain, dLvl, DEEDS, opt, cur, warn, clamp, dry, hash, rngOf, esc, landOf, ensureUI, voiceLvl });   // shared with the other Orange mods, and for tests
})();
