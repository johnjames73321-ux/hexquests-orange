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
- step 5 (owner, angry: step 4 was the opposite of what he said). "no tier 1s in new world" was an ORDER, not a complaint:
  * OWNER RULE: no tier 1 (Settled) anywhere in the New World. Maya, Oaxaca, Andes = Frontier. TOWNLANDS removed. Never promote them again.
  * Looks: Wilds must still show their colour (he hated near-white). Now Frontier tint 0.10 + stripes 0.17 of a hex, Wilds tint 0.32 + stripes 0.36.
  * Totals: Settled 281 states / 2007 hexes (all Old World), Frontier 3145 / 13373, Wilds 1711 / 11189.

## 2026-11-15 audit (owner: real places only, no colonial names in the Americas, no big blocks, fewer yellows)
- tools/era/prep.js (run once, needs the local research folder + ~/pleiades): judges every hex name of the main game ->
  fake-names.json (c created by the research itself, f generated family, v generated variant, d map-maker label, k colonial
  in the New World), places320.json (ancient places alive in 320 BC), truell.b64 (true lat/lon per hex), misplaced.tsv.
- tools/era/audit.js (run by tools/build.js on the warped map; OR_NOAUDIT=1 skips it):
  1. not-real hex name -> ancient place inside the hex, else the real name it was derived from, else the owning people.
     Never invents. A stretched copy of a hex gets its own ancient place where one lies in it, else keeps the name.
  2. New World states with colonial names -> state-names.js (native name), else their own / nearest native place.
  3. tribes, cultures, nomads, clans, chiefdoms, confederations over 8 hexes (cultures over 3) are cut into groups of 3-4
     hexes; real states (empire, kingdom, satrapy, republic, city-state, league) keep their land. New World: nobody is a state.
  4. colours: real Old World states keep theirs (pulled out of the near-black / glaring ends), everyone else gets a new one,
     far from its neighbours, whole wheel, yellow 40-72 deg rare and muted, purple / pink rare.
- Result on 11-15: 8,013 hex names replaced, 120 New World states renamed, 1,345 blocks -> 6,050 small groups (11,187 states),
  placement check: 184 of 191 famous cities on the right hex (the other 7 share a hex with a bigger neighbour), land untouched.
- Open: about 5,300 hexes now carry their people's name because no real place name is known for them (mostly North America,
  Siberia, Sahara): research real native place names there and they can be put back one by one (they are never to be made up).
  Colonial list is tools/era/colonial.js (read by eye): add words there when one is spotted. tools/era/render.js = picture of the view.
