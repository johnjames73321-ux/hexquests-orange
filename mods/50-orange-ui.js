/* HexQuests Orange, part 5: the look. Few words, signs instead of labels, see-through panels, one carved display font (Cinzel,
   already loaded by the gods layer). Only restyles and relabels: no game logic. Full names stay as hover tips. */
(() => {
  "use strict";
  const css = `
:root { --display: "Cinzel", Georgia, serif; --body: "Cinzel", Georgia, serif; --panel: rgba(8,10,16,.34); --line: rgba(255,255,255,.14); }
body, button, input, select, kbd { font-family: "Cinzel", Georgia, serif !important; letter-spacing: .04em; }
header { background: linear-gradient(rgba(6,8,14,.55), rgba(6,8,14,0)) !important; border: 0 !important; position: relative; z-index: 6; }
header button, .btns button, #gviews button { background: rgba(10,12,20,.32) !important; border: 1px solid rgba(255,255,255,.16) !important; color: #f4efe2 !important; border-radius: 3px !important; font-weight: 800; text-transform: uppercase; padding: 6px 11px !important; backdrop-filter: blur(6px); transition: transform .08s, border-color .12s; }
header button:hover { transform: translateY(-1px); border-color: #f0a030 !important; }
header button[aria-pressed="true"] { background: rgba(240,150,40,.30) !important; border-color: #f0a030 !important; color: #fff !important; text-shadow: 0 0 10px #f0a03090; }
header .label, header .hint, header small { display: none !important; }
.status, .legend, .hud { background: rgba(8,10,16,.34) !important; border: 1px solid rgba(255,255,255,.12) !important; backdrop-filter: blur(8px); border-radius: 4px !important; color: #f4efe2 !important; }
.legend { font-size: .72rem !important; }
kbd { background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.25); border-radius: 3px; padding: 0 5px; font-size: .8em; }
#orElChip { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 99990; font: 800 13px "Cinzel", serif; letter-spacing: .08em; text-transform: uppercase; color: #fff; text-shadow: 0 2px 6px #000; pointer-events: none; display: flex; gap: 8px; align-items: center; }
#orElChip i { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
#orEl { position: fixed; inset: 0; z-index: 100000; background: radial-gradient(ellipse at center, rgba(6,8,14,.50), rgba(6,8,14,.82)); backdrop-filter: blur(5px); display: flex; flex-direction: column; padding: 18px 26px; color: #fff; font-family: "Cinzel", serif; }
#orEl[hidden] { display: none; }
#orEl .hd { display: flex; align-items: center; gap: 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.14); }
#orEl .hd b { font-size: 26px; font-weight: 800; color: #f0a030; text-shadow: 0 0 18px #f0a03080; }
#orEl .az { display: flex; flex-wrap: wrap; gap: 2px; flex: 1; }
#orEl .az a, #orEl .x, #orEl .cl { cursor: pointer; padding: 3px 7px; font-weight: 800; border-radius: 3px; }
#orEl .az a:hover, #orEl .x:hover, #orEl .cl:hover { background: rgba(240,160,48,.35); }
#orEl .kd { opacity: .8; font-size: 15px; }
#orEl .x { font-size: 20px; }
#orEl .gr { flex: 1; min-height: 0; grid-auto-rows: 36px; align-content: start; overflow: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; padding: 14px 4px; scrollbar-width: thin; }
#orEl .gr button { all: unset; display: block; box-sizing: border-box; height: 36px; line-height: 22px; cursor: pointer; padding: 7px 10px; font: 800 13px "Cinzel", serif !important; letter-spacing: .06em; text-transform: uppercase; color: var(--c); border-left: 3px solid var(--c); background: rgba(255,255,255,.04); text-shadow: 0 1px 3px #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background .1s, transform .08s; }
#orEl .gr button:hover { background: color-mix(in srgb, var(--c) 28%, transparent); color: #fff; transform: translateX(3px); box-shadow: 0 0 14px color-mix(in srgb, var(--c) 60%, transparent); }
#orEl .gr button[hidden] { display: none; }
#orEl .q { all: unset; width: 150px; padding: 5px 10px; border: 1px solid rgba(255,255,255,.3); border-radius: 3px; background: rgba(255,255,255,.08); font: 800 13px "Cinzel", serif; color: #fff; }
#orEl .kd { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
body:has(#sv[hidden]) :is(#orElChip, #orKeys) { display: none !important; }
/* lean walk: life, hands, place. H = everything + the keys */
body:not(.orFull) #sv :is(#pnBoons, .pnRow, #orRow, #pnCur, #svVox, .help, .nav, #orFps), body:not(.orFull) #sv:has(#pnHud) #svHP, body:not(.orFull) #svHud :is(.m, .fauna) { display: none !important; }
@media (hover: hover) and (pointer: fine) { body:not(.orFull) #sv :is(.atk, .joy) { display: none !important; } }
#orKeys { position: fixed; right: 14px; bottom: 60px; z-index: 99991; display: none; grid-template-columns: auto auto; gap: 5px 12px; padding: 12px 16px; background: rgba(8,10,16,.62); border: 1px solid rgba(255,255,255,.16); border-radius: 4px; backdrop-filter: blur(8px); font: 800 12px "Cinzel", serif; letter-spacing: .06em; text-transform: uppercase; color: #f4efe2; pointer-events: none; }
body.orFull #orKeys, body.orKeysOn #orKeys { display: grid; }
#orKeys kbd { justify-self: end; }
/* lean map: the few switches a player needs. ⋯ = the rest */
body:not(.orMore) :is(#t-grid, #t-dl, #t-drag, #t-mark, #t-dev, #zmeas, #status, .status, header details) { display: none !important; }
#orWalk { background: #f0a030 !important; color: #14100a !important; border-color: #f0a030 !important; }
#peg::before { content: "🚶 drag onto land"; position: absolute; right: 42px; white-space: nowrap; font: 800 11px "Cinzel", serif; letter-spacing: .06em; text-transform: uppercase; color: #fff; text-shadow: 0 1px 4px #000; pointer-events: none; }
#hxStart .keys, #hxStart small { display: none !important; }
`;
  const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  // signs instead of words (the words stay as the hover tip)
  const SIGN = [[/^Names/, "🏷️ Names"], [/^Hex lines/, "⬡"], [/^Borders/, "▦ Borders"], [/^Countries/, "🚩 Lands"], [/^Maps/, "🗺️"], [/^Download game/, "💾"], [/^Drag maps/, "✋"], [/^1444 borders: (\w+)/, "⚔️ 1444"], [/^320 BC borders: (\w+)/, "🏛️ 320 BC"],
    [/^Mark/, "✏️"], [/^Edit map/, "🛠️"], [/^Search/, "🔍 Search"], [/^Religion/, "🛐"], [/^Ethnicity/, "👥"], [/^Culture/, "🎭"], [/^Population/, "📊"], [/^▶? ?Play/, "▶"], [/^Random land/, "🎲"], [/^Spawn naked/, "🩲"]];
  const relabel = () => { for (const b of document.querySelectorAll("header button, #gviews button, .btns button, .menu button, button.search, #search")) { const t = (b.textContent || "").trim(); if (!t || b.dataset.or === t) continue;
    for (const [re, sg] of SIGN) if (re.test(t.replace(/^[^A-Za-z0-9]+/, ""))) { if (!b.title) b.title = t; b.textContent = sg; b.dataset.or = sg; break; } } };
  // start: Play = walk at once, second button = the map. Map: a Walk button and ⋯ for the rarely used switches. Walk: H = keys + full HUD.
  const KEYS = [["WASD", "move"], ["🖱️", "look"], ["Space", "jump"], ["Shift", "run"], ["E", "use · talk"], ["Tab", "bag"], ["Y", "magic"], ["🖱️ L / R", "cast"], ["K", "skills"], ["L", "quests"], ["− =", "look speed"], ["H", "more / less"], ["Esc", "map"]];
  let seen = 0;
  const lean = () => { const m = document.getElementById("hxStart"), go = () => { const b = document.querySelector('#hxStart [data-a="new"]'); b && b.click(); };
    if (m && !m.dataset.or) { m.dataset.or = 1; const p = m.querySelector('[data-a="play"]'), n = m.querySelector('[data-a="new"]'); if (p && n) { p.dataset.a = "new"; n.dataset.a = "play"; n.textContent = "🗺️ Map"; } }
    const set = document.getElementById("t-set"); if (set && !document.getElementById("orWalk")) { const w = document.createElement("button"); w.id = "orWalk"; w.textContent = "▶ Walk"; w.onclick = go;
      const more = document.createElement("button"); more.textContent = "⋯"; more.title = "More"; more.onclick = () => document.body.classList.toggle("orMore"); set.after(more); set.before(w);
      const era = document.getElementById("t-era"); try { if (era && !localStorage.getItem("orange-era1")) { localStorage.setItem("orange-era1", 1); if (era.getAttribute("aria-pressed") !== "true") era.click(); } } catch (e) {} }
    if (!document.getElementById("orKeys")) { const k = document.createElement("div"); k.id = "orKeys"; k.innerHTML = KEYS.map(([a, b]) => `<kbd>${a}</kbd><span>${b}</span>`).join(""); document.body.appendChild(k); }
    const sv = document.getElementById("sv"); if (sv && !sv.hidden && !seen) { seen = 1; document.body.classList.add("orKeysOn"); setTimeout(() => document.body.classList.remove("orKeysOn"), 12000); } };
  const OX = window.ORANGE; if (OX && OX.onKey) OX.onKey.unshift((me, code) => code === "KeyH" ? (document.body.classList.toggle("orFull"), true) : false);
  relabel(); lean(); setInterval(() => { relabel(); lean(); }, 1200);
})();
