# 320 BC state tiers (Orange) - work log for whoever continues

Owner request (2026-11-14): "make sure the states in the world each fit tier 2 or tier 3 or tier 1 with the state they had at the time".
Meaning used: every 320 BC state (ERA.tags entry) gets ONE tier that fits what kind of society it was in 320 BC, instead of the
current per-hex tier that comes from province population (so Ptolemy's Egypt is half "Wilds" today, which is wrong).

Owner vocabulary: tier 1 = Settled (no lines), tier 2 = Frontier (thin lines), tier 3 = Wilds (thick lines).
In the data ERA.tier is one character per hex: "0" Settled, "1" Frontier, "2" Wilds.

Rule:
- Settled: real states with government and towns: empire, kingdom, satrapy, republic, city-state, league, walled town.
- Frontier: organised farmers and herders without a state: chiefdom, confederation, nomads, oasis, village, farming tribes.
- Wilds: hunter-gatherer bands: clans, forager tribes and forager "cultures" (Siberian taiga, Arctic, Australia, Khoisan, Patagonia ...).
- Land with no state (own -2) keeps the tier it has.

Files:
- tools/era/dump.js   -> tools/era/states.tsv (every state: type, culture, seat, hexes, current tiers, lat, lon)
- tools/era/classify.js -> mods/era-tiers.json (tag name -> tier) + tools/era/review.tsv   [TO DO if missing]
- tools/build.js applies mods/era-tiers.json to ERA.tier                                   [TO DO if not there]
Only Orange changes. The main game (~/hex-atlas-play) is not touched.

## Log
- step 1 done: data studied. ERA.tags[k] = [name, colour, flag, type, culture, seat, text]; 5137 states own land; 16 types.
