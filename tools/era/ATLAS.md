# The 320 BCE atlas of Orange (work log, rules and plan for whoever continues)

## What the owner said (2026-11-15 / 11-16, several sessions; keep every one of these)
1. Keep the land and the placements as they are. No hex is removed.
2. Every hex is a real place. "Do not make new provinces that doesn't exist irl just to fill the map."
3. Americas: no Spanish / English / other Old World names. "320bce names strictly."
4. No big nation blocks for peoples or cultures that were not one single state. "Make each hex a different country if you have to, so they are tribes."
5. But no made-up same-size groups either: "why is there fictional countries of the same size, does that look natural to you?"
   and (looking at south-east North America, where every hex was its own striped country) "why is there a pattern".
6. No modern town names as countries ("there is still a country named Pskov"). Peoples must sit where they really were
   ("why are Balts not where Balts are today, are you sure?").
7. Colours: far less bright yellow, nothing near black, nothing glaring, every country its own colour.
8. Tiers: one tier per state by the kind of society. No tier 1 (Settled) anywhere in the New World. Wilds keep a visible colour.
9. Study real maps, search the web, do not stray from real sources. Never ask him questions; work and report.
10. 2026-11-16 04:15, to this session: "make the nation states better with all the rules you have in your memory make sure they
    all exist in 320bce and in the crumbled way they would be. i dont want made up shit or countries that look like texture
    patterns." and "dont ask questions work all night".

## How rule 4, 5 and 10 fit together (my reading; change it only if he says otherwise)
- "Exist in 320 BCE": a country on the map must be (a) a state or people written about around the 4th-3rd century BCE,
  or (b) an archaeological culture / regional group that was alive in 320 BCE, or (c) a people whose presence since before
  320 BCE is the accepted view (San, Aboriginal Australians, Dorset "Tuniit" ...). Names of later centuries (Osage, Shawnee,
  Choctaw, Cheyenne, Evenki, Lunda, Pskov ...) are NOT countries of 320 BCE.
- "Crumbled the way they would be": real states keep their real 320 BCE extent (the Diadochi satrapies, the Warring States,
  the poleis). Peoples without a state are split into the regional groups archaeology or the sources really know, and where
  nothing finer is known, into the bands of one river basin or coast (foragers lived by watershed). Sizes follow how many
  people the land held: small in the Ohio valley, the Andes, West Africa; large in the Arctic, the taiga, the deserts.
  Never one size, never one hex each over a whole continent ("texture pattern"), never one block for a whole language family.
- "No made-up names": a name is a real state / people / culture of that time, or the real native name of the group's own
  river, lake, bay or site. The note of every country says what it was and gives the archaeologists' name and dates.
  English, Spanish, French, Portuguese words are not used in the Americas (the culture's scholarly name goes in the note).

## How it is built
- `tools/era/atlas.js` (called first thing by `tools/era/audit.js`): for every zone file in `tools/era/atlas/NN-*.js`
  it takes the land hexes of the zone (true lat/lon from truell.b64), drops the main game's owners there unless the zone's
  `keep()` says the old country is real for 320 BCE, and grows every atlas country from its seat(s) over land
  (cheapest-path, cost = km / reach, a little jitter so borders are not straight). Unreached islands go to the nearest seat.
- Atlas countries carry `fix` (audit.js leaves their name and colour alone), their own tier, people line (the gods layer
  reads it), and a colour from their family's hue band, so related groups look related and no region turns into confetti.
- `OR_NOATLAS=1 node tools/build.js ...` builds without it (the layout of commit 8a226ed).

## Zones: status
(update this table whenever a zone is added or reworked)

| file | zone | status |
|---|---|---|
| 10-north-america.js | North America north of Mesoamerica, south Greenland | done 11-16: 532 countries on 6038 hexes (1 to 63 hexes, middle 8). Checked against the old owners hex by hex. |

Still to do, in this order: South America, Mesoamerica + Central America + Antilles, sub-Saharan Africa, northern Eurasia
(forest, steppe, Siberia: the made-up "North Saka / West Samoyeds / Southeast Saami" names), South-East Asia and Oceania,
lands nobody lived on yet (Iceland "Thule", far islands), then Old World spot fixes.

## What I learned about the map (read before adding a zone)
- The map ends near 55 N in the Americas: there is no Arctic and no Alaska. Greenland is only its southern tip (60-66 N).
- `truell.b64` (true lat/lon per old hex) is good to about a degree inland. Region names of the game ("Greenland / Qeqqata"
  on Lake Superior) are junk, never use them. Near the map's corners the coast is squeezed (Haida Gwaii sits at 49.7 N,
  132 W on the map): put seats where the owner's old tribes of that place were, see the check below.
- Check a zone: `OR_ATLAS_DUMP=dump.tsv node tools/build.js <main> index.html` writes every land hex with lat, lon, old owner
  and new owner. Group it by new owner and read which old tribes each new country replaced: a country that swallowed the
  wrong tribes has its seat in the wrong place.
- Too many seats on a thin coast give a row of one-hex countries (a pattern again): merge until most have 3 hexes or more.
- People line (4th field of a family) is read by the gods layer: the first keyword decides the pantheon
  (pantheon/src/13-gods-index.js in the main game). "Siberian" matches "iberian", so never start a people line with it.
- A family's `glyphs` make the flag (own colour + one emblem). A country with the same name as one of the owner's old
  countries keeps the owner's flag (Adena keeps its pot).
- Names: no modern state, province or big-city name even when the word is native (no Texas, Kansas, Ohio, Toronto, Miami):
  the owner reads those as modern. Use the river's or the site's own older native name (Tokonohono, Wakarusa, Pelisipi).
