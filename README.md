# HexQuests Orange

Test copy of HexQuests: warped map (bigger Europe, taller lands), 320 BC tiers by kind of society, and extra layers on the 3D walk.
It is generated, never hand-edited:

    node tools/build.js ~/hex-atlas-play/index.html index.html

- `tools/warp.js`, `tools/build.js`: the map warp, added islands, 320 BC tiers (`tools/era/`, `mods/era-tiers.json`).
- `mods/patches.js`: exact-match edits of the main game's code (the build fails if one no longer matches once).
- `mods/10-orange-rpg.js`: compass marks, quests, journal (L), skills by use, sneak attacks, Stormvoice (P), drake, day and night.
- `mods/20-orange-world.js`: magic (7 firebolt, 8 hold heal, 9 frost), standing stones, campfire, beast den, hidden caches, night hunters.
- `mods/30-orange-atmos.js`: weather (rain, lightning, snow), night torch, names over known places, "!" over villagers with work.
- The main game's gods layer (U cast, I call, O codex, R arm art) comes along with every rebuild. Keys that are taken:
  U I O R (gods), Z rage, G chop, B N M Y (blocks), Tab bag, " / K skill tree. Only Esc leaves the walk.

Test the walk (all layers together, also in a hidden tab): serve the folder (`python -m http.server 8777 --bind 127.0.0.1`), open it,
load `/tools/soak.js` in the page and run `await OT.soak()`: `fail` and `errs` must be empty. Add a check there for every new feature.
