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
- step 2 done: tools/era/classify.js written (type rule + forager peoples list + later-age names + hand list), mods/era-tiers.json made:
  Settled 313 states / 2043 hexes, Frontier 3113 / 13337, Wilds 1711 / 11189.
- step 3 done: tools/build.js applies mods/era-tiers.json (19220 hexes change tier); legend + land class texts patched in mods/patches.js.
- To redo after the main game changes: node tools/era/dump.js ~/hex-atlas-play/index.html && node tools/era/classify.js && node tools/build.js ~/hex-atlas-play/index.html index.html
- Open points for a next pass (tools/era/review.tsv lists every state with old and new tier):
  * tribes with culture "Unknown / uncertain / unclassified" default to Frontier (about 60 states, mostly the Americas)
  * Amazonia: Arawakan, Cariban, Tupian, Panoan = Frontier (village gardeners); Je, Nadahup, Yanomami ... = Wilds
  * North America: all Wilds except Adena, North-West Coast, South-West early farmers (Frontier)
  * Bantu-named tribes south of 10 S = Wilds (Bantu farmers arrived there after 320 BC)
  * region lat/lon in the Americas is unreliable in the main data: never classify there by position, only by culture text
- step 4 (owner: "tier 2 looks same as tier 3, no tier 1s in new world"):
  * Settled now also covers lands of towns and temple centres even when the data calls the people tribe / chiefdom / culture:
    Mesoamerica and the central Andes + coastal Ecuador (TOWNLANDS in classify.js). New World Settled: 203 states / 358 hexes.
  * Looks: Frontier tint 0.22 toward white (was 0.45), Wilds 0.78 (was 0.68); stripes 0.21 / 0.55 of a hex. Patches in mods/patches.js.
  * Totals: Settled 484 states / 2365 hexes, Frontier 2942 / 13015, Wilds 1711 / 11189.
