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
#orEl .az a, #orEl .x { cursor: pointer; padding: 3px 7px; font-weight: 800; border-radius: 3px; }
#orEl .az a:hover, #orEl .x:hover { background: rgba(240,160,48,.35); }
#orEl .kd { opacity: .8; font-size: 15px; }
#orEl .x { font-size: 20px; }
#orEl .gr { flex: 1; min-height: 0; grid-auto-rows: 36px; align-content: start; overflow: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; padding: 14px 4px; scrollbar-width: thin; }
#orEl .gr button { all: unset; display: block; box-sizing: border-box; height: 36px; line-height: 22px; cursor: pointer; padding: 7px 10px; font: 800 13px "Cinzel", serif !important; letter-spacing: .06em; text-transform: uppercase; color: var(--c); border-left: 3px solid var(--c); background: rgba(255,255,255,.04); text-shadow: 0 1px 3px #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background .1s, transform .08s; }
#orEl .gr button:hover { background: color-mix(in srgb, var(--c) 28%, transparent); color: #fff; transform: translateX(3px); box-shadow: 0 0 14px color-mix(in srgb, var(--c) 60%, transparent); }
`;
  const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  // signs instead of words (the words stay as the hover tip)
  const SIGN = [[/^Names/, "🏷️"], [/^Hex lines/, "⬡"], [/^Borders/, "▦"], [/^Countries/, "🚩"], [/^Maps/, "🗺️"], [/^Download game/, "💾"], [/^Drag maps/, "✋"], [/^1444 borders: (\w+)/, "⚔️ 1444"], [/^320 BC borders: (\w+)/, "🏛️ 320"],
    [/^Mark/, "✏️"], [/^Edit map/, "🛠️"], [/^Search/, "🔍"], [/^Religion/, "🛐"], [/^Ethnicity/, "👥"], [/^Culture/, "🎭"], [/^Population/, "📊"], [/^▶? ?Play/, "▶"], [/^Random land/, "🎲"], [/^Spawn naked/, "🩲"]];
  const relabel = () => { for (const b of document.querySelectorAll("header button, #gviews button, .btns button, .menu button, button.search, #search")) { const t = (b.textContent || "").trim(); if (!t || b.dataset.or === t) continue;
    for (const [re, sg] of SIGN) if (re.test(t.replace(/^[^A-Za-z0-9]+/, ""))) { if (!b.title) b.title = t; b.textContent = sg; b.dataset.or = sg; break; } } };
  relabel(); setInterval(relabel, 1200);
})();
