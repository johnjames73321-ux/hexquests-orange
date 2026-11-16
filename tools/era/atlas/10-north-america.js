// North America north of Mesoamerica in 320 BCE (the map ends near 55 N: no Arctic, no Alaska; of Greenland only the south).
// No state and no written name anywhere here: the countries are the archaeological groups alive then, split by the river
// basins, coasts and islands their bands lived on. A name is the native name of that river, lake, bay, hill or site (never an
// English, Spanish or French word, never a modern state or big city); the archaeologists' name and dates stand in the note.
// The native names come from the languages written down there after 1500 CE: nobody knows what these peoples called
// themselves, so the land's own oldest known name is the closest true thing.
// Tier: 1 Frontier = mound builders, ranked villages, first maize farmers; 2 Wilds = hunters, fishers and gatherers.
const MESO = (la, lo) => la < 22.6 && lo > -106 && lo < -86 && !(la > 21.3 && lo > -100.2);   // the Huasteca is told here
module.exports = {
  name: "North America",
  zone: (la, lo) => ((lo < -52 && la > 14.5) || (la > 59 && lo < -30 && lo > -75)) && !MESO(la, lo) && !(la < 24.6 && lo > -93) && !(la < 28 && lo > -79.9),   // south Greenland too; the Antilles are their own zone
  fam: {
    tun: { kind: "tribe", tier: 2, people: "Dorset (Tuniit, Paleo-Eskimo)", hue: [192, 16], reach: 300, glyphs: "🦭 🐋 🌊", note: "Seal and walrus hunters, the people the later Inuit remembered as the Tuniit (archaeologists: Greenlandic Dorset, about 800-1 BCE)." },
    gro: { kind: "tribe", tier: 2, people: "Groswater Paleo-Eskimo (Dorset kin)", hue: [208, 16], reach: 200, glyphs: "🦭 🐟 🪶", note: "Seal hunters of the Labrador Sea coasts (archaeologists: Groswater Paleo-Eskimo, about 800-100 BCE)." },
    inn: { kind: "tribe", tier: 2, people: "Algonquian? (Innu ancestors)", hue: [176, 24], reach: 240, glyphs: "🦌 🐟 🪶", note: "Caribou hunters and salmon fishers of the Quebec-Labrador peninsula (archaeologists: Intermediate period)." },
    shd: { kind: "tribe", tier: 2, people: "Algonquian? (Shield Archaic)", hue: [150, 30], reach: 220, glyphs: "🦌 🛶 🐟 🦫", note: "Canoe people of the Canadian Shield: caribou, moose, fish, wild rice in the south (archaeologists: Shield Archaic, before the Laurel potters)." },
    den: { kind: "tribe", tier: 2, people: "Athabaskan (Dene ancestors)", hue: [162, 20], reach: 260, glyphs: "🦌 🦬 🪶", note: "Moose and bison hunters of the northern forest edge (archaeologists: Taltheilei and Northern Archaic traditions)." },
    nwc: { kind: "tribe", tier: 1, people: "Northwest Coast villagers (Salish, Wakashan, Tsimshian, Haida ancestors)", hue: [255, 28], reach: 110, glyphs: "🐟 🐋 🦅 🛶 🐻", note: "Plank-house villages of salmon fishers with chiefs, slaves and great canoes (archaeologists: Middle Pacific period; Marpole phase on the Fraser from about 400 BCE)." },
    plt: { kind: "tribe", tier: 2, people: "Sahaptian and Interior Salish ancestors (Plateau Pithouse tradition)", hue: [168, 26], reach: 150, glyphs: "🐟 🦌 🌿", note: "Pit-house villages by the salmon rivers, roots and deer in the hills (archaeologists: Plateau Pithouse tradition, Plateau horizon from about 400 BCE)." },
    cal: { kind: "tribe", tier: 2, people: "California gatherers (Hokan, Penutian, Chumash)", hue: [28, 24], reach: 80, glyphs: "🌰 🐚 🐟 🦌", note: "Acorn, shellfish and salmon people in many small settled groups (archaeologists: Berkeley pattern and Middle period, from about 500 BCE)." },
    bas: { kind: "tribe", tier: 2, people: "Great Basin Archaic (before the Numic peoples)", hue: [8, 20], reach: 190, glyphs: "🦆 🐇 🧺", note: "Marsh, seed and rabbit people of the desert lakes and ranges, makers of duck decoys and fine baskets (archaeologists: Lovelock culture and Late Archaic)." },
    swf: { kind: "village", tier: 1, people: "Early farmers of the Southwest (Basketmaker, ancestral Pueblo, O'odham)", hue: [285, 22], reach: 105, glyphs: "🌽 🧺 ☀", note: "The first maize farmers north of Mexico: pit houses, storage pits, canals in the south, no pottery yet (archaeologists: Early Agricultural period and Basketmaker II)." },
    swa: { kind: "tribe", tier: 2, people: "Desert Archaic (Uto-Aztecan, Yuman ancestors)", hue: [325, 22], reach: 170, glyphs: "🌵 🦎 🐇", note: "Desert gatherers and hunters, some of whom had begun to plant a little maize (archaeologists: Late Archaic)." },
    pln: { kind: "tribe", tier: 2, people: "Plains bison hunters", hue: [80, 30], reach: 200, glyphs: "🦬 🐺 🦅", note: "Bison hunters on foot with dogs, driving herds over jumps and into pounds (archaeologists: Pelican Lake and Late Plains Archaic; Besant just beginning)." },
    tex: { kind: "tribe", tier: 2, people: "Southern Plains Archaic", hue: [45, 22], reach: 190, glyphs: "🦌 🦬 🌵", note: "Deer, bison and plant-baking people of the southern plains and the limestone hills (archaeologists: Late Archaic)." },
    ade: { kind: "tribe", tier: 1, people: "Adena (Early Woodland mound builders)", hue: [24, 12], reach: 75, glyphs: "⛰ 🦅 🐍 🪶", note: "Mound builders of the Ohio country: round houses, burial mounds, tobacco pipes, copper and gardens of sunflower and goosefoot (archaeologists: Adena, about 500 BCE - 100 CE)." },
    eww: { kind: "tribe", tier: 2, people: "Early Woodland (Algonquian? Siouan?)", hue: [100, 26], reach: 105, glyphs: "🦌 🐢 🐟", note: "River hunters, fishers and gardeners with the first pottery of the Midwest (archaeologists: Early Woodland: Black Sand, Marion, Morton, Crab Orchard)." },
    grl: { kind: "tribe", tier: 2, people: "Early Woodland of the Great Lakes (Algonquian?)", hue: [188, 26], reach: 125, glyphs: "🐟 🌾 🦫", note: "Fishers, wild-rice gatherers and copper workers of the lakes (archaeologists: Early Woodland; Meadowood in the east)." },
    nea: { kind: "tribe", tier: 2, people: "Eastern Algonquian? (Early Woodland)", hue: [218, 26], reach: 95, glyphs: "🐚 🐟 🦌", note: "Shore and river people of the north-east with the first pots and Adena-style burials (archaeologists: Early Woodland / Early Ceramic period: Meadowood, Middlesex, Bushkill)." },
    sea: { kind: "tribe", tier: 2, people: "Muskogean? (Southeastern Early Woodland)", hue: [128, 28], reach: 100, glyphs: "🦌 🐢 🐚", note: "Hunters, shellfishers and small-scale gardeners of the southern rivers (archaeologists: Early Woodland: Deptford, Alexander, Dunlap, Yadkin)." },
    gul: { kind: "tribe", tier: 2, people: "Tunica and Natchez ancestors? (Tchefuncte culture)", hue: [62, 20], reach: 100, glyphs: "🐊 🐚 🐟", note: "Swamp and bayou people of the lower Mississippi with shell middens and the first pottery there (archaeologists: Tchefuncte / Tchula, about 600 BCE - 100 CE)." },
    fla: { kind: "tribe", tier: 2, people: "Florida fishers (Timucua, Calusa ancestors)", hue: [320, 22], reach: 95, glyphs: "🐚 🐟 🐊 🐬", note: "Fishers and shellfish gatherers of the Florida waters, building up great shell mounds (archaeologists: St. Johns I, Glades I, Caloosahatchee I, from about 500 BCE)." },
    cad: { kind: "tribe", tier: 2, people: "Fourche Maline (Caddo ancestors)", hue: [40, 16], reach: 120, glyphs: "🦌 🏺 🐢", note: "Villagers of the Ouachita country with thick pottery and black-earth middens, forebears of the Caddo (archaeologists: Fourche Maline, from about 500 BCE)." },
    nmx: { kind: "tribe", tier: 2, people: "Desert gatherers of the north-east of Mexico (Coahuiltecan)", hue: [50, 18], reach: 170, glyphs: "🌵 🦌 🐇", note: "Mesquite, cactus and deer people of the dry north-east (archaeologists: Coahuila complex and Late Archaic)." },
    hua: { kind: "village", tier: 1, people: "Huastec (Mayan-speaking villagers)", hue: [200, 14], reach: 90, glyphs: "🌽 🐚", note: "Farming villages on the Panuco, a Maya-speaking people long cut off from the Maya south (archaeologists: Chila and El Prisco phases)." },
  },
  list: `
// ---- south Greenland ----
tun|Qaqortoq|60.7,-46;61.2,-45.5|
tun|Nunap Isua|59.9,-44;60.2,-43.2|The southern cape.
tun|Ammassalik|65.6,-37.6;65.2,-39|
tun|Umiivik|64.3,-40.5;63.8,-41|
tun|Timmiarmiit|62.5,-42.2;63,-41.8|
// ---- Newfoundland, Labrador, Quebec north shore ----
gro|Ktaqmkuk|51,-56.8;50.7,-57.3|Northern Newfoundland; the great seal hunters' station of Port au Choix is growing in these centuries.
gro|Elmastukwek|49,-58;49.5,-57.3|
gro|Nujio'qonik|48.4,-58.6;47.8,-59|
gro|Miawpukek|47.9,-55.8;47.5,-53.5;48.6,-54;49.3,-55|The south and east of Newfoundland.
gro|Pakuashipi|51.3,-58.5;51.6,-57;52.2,-56|The north shore of the Strait of Belle Isle.
inn|Sheshatshiu|53.5,-60.1;54.2,-58.5|Hamilton Inlet (archaeologists: North West River phase).
inn|Michikamau|54,-64;53.5,-62.5|
inn|Menihek|54.4,-66.6;53.8,-66.9|
inn|Ashuanipi|52.7,-66.1;52.2,-65|
inn|Natashquan|50.2,-61.8;51,-61.5|
inn|Unamen Shipu|50.2,-60.7;50.9,-59.8|
inn|Ekuanitshit|50.3,-64;51,-63.6|
inn|Mishta Shipu|50.3,-66.1;51.2,-66.4|
inn|Manicouagan|50.6,-68.7;49.3,-68.3|
inn|Betsiamites|48.9,-68.7;49.6,-69.5|
inn|Caniapiscau|54.5,-69.9;53.5,-69|
inn|Nichicun|53.2,-71;52.5,-71.5|
// ---- Canadian Shield ----
shd|Chisasibi|53.8,-78.9;54.3,-76|
shd|Wemindji|53,-78.8;52.6,-77.2|
shd|Nemiscau|51.7,-76.2;51.3,-78.5|
shd|Mistassini|50.9,-73.7;51.4,-73|
shd|Chibougamau|49.9,-74.4;50.3,-75|
shd|Waswanipi|49.7,-76;49.9,-77.2|
shd|Ashuapmushuan|49.3,-73.2;49,-73.8|
shd|Piekuakami|48.6,-72;48.9,-72.5|The great lake of the Saguenay country.
shd|Saguenay|48.4,-70.9;48.1,-69.7|
shd|Tapiskwan|47.5,-72.8;46.8,-72.7;47.9,-73.8|
shd|Abitibi|48.7,-79.5;48.4,-78|
shd|Timiskaming|47.3,-79.5;47.7,-79|
shd|Temagami|47,-80;46.9,-80.6|
shd|Kipawa|46.8,-78.9;47.1,-78.2|
shd|Mattawa|46.3,-78.7;46.2,-79.3|
shd|Kitigan Zibi|46.4,-76;47,-75.8|
shd|Kichisipi|45.6,-76.6;45.4,-75.7|Ottawa River.
shd|Petawawa|45.9,-77.3;45.8,-78|
shd|Madawaska|45.3,-77.5;45.1,-78.1|
shd|Mattagami|49.8,-81.6;48.9,-81.4|
shd|Missinaibi|49.5,-83.3;50.3,-82.7|
shd|Moosonee|51.3,-80.6;50.8,-80|
shd|Attawapiskat|52.9,-82.4;52.8,-84|
shd|Kenogami|50.4,-84.4;51.2,-84|
shd|Ogoki|51.6,-86;51.2,-87.5|
shd|Winisk|54.5,-85.4;54,-87.5|
shd|Wunnumin|52.9,-89.2;53.4,-88|
shd|Sachigo|53.9,-92.2;53.9,-90.5|
shd|Wabakimi|50.7,-89.5;51,-90.5|
shd|Nipigon|49.5,-88.3;50.2,-88.6|
shd|Pukaskwa|48.3,-85.9;48.8,-86.5|
shd|Kaministiquia|48.4,-89.5;48.7,-90.3|
shd|Atikokan|48.75,-91.6;48.4,-92.3|
shd|Koochiching|48.6,-93.4;48.8,-94.6|
shd|Wabigoon|49.8,-92.8;50.1,-91.9|
shd|Wabaseemoong|50.1,-94.9;49.8,-94.4|
shd|Pikangikum|51.8,-94;52.5,-93.5|
shd|Nopiming|50.7,-95.4;50.4,-95.9|
shd|Manigotagan|51.1,-96.3;51.8,-96.6|
shd|Pimicikamak|54.6,-97.8;53.8,-98.5|
shd|Minago|54,-99.2;53.6,-99.8|
shd|Opaskwayak|53.8,-101.2;53.4,-102.5|
shd|Athapapuskow|54.5,-101.6;54.7,-100.6|
shd|Nipawin|53.4,-104;53.8,-103.2|
shd|Waskesiu|53.9,-106.1;54.3,-105.3|
shd|Makwa|54,-108.9;54.4,-107.9|
shd|Athabasca|54.7,-113.3;54.5,-111.8|
shd|Wabamun|53.55,-114.5;53.9,-115.5|
den|Unjigah|55,-119;54.9,-117.5|
// ---- Great Lakes ----
grl|Keweenaw|47.2,-88.4;46.8,-88.5|The copper country of Lake Superior.
grl|Ontonagon|46.87,-89.3;46.5,-89.6|
grl|Chequamegon|46.7,-90.8;46.4,-91.2|
grl|Namekagon|46,-91.5;45.6,-92.3|
grl|Mde Wakan|46.2,-93.6;46.6,-93.2|The spirit lake of the headwater country.
grl|Misiziibi|47.2,-94.7;47.4,-95.2;46.4,-94.4|The headwaters of the Mississippi (archaeologists: Elk Lake / Brainerd).
grl|Cansayapi|44.5,-94.9;44.2,-93.6;44.9,-93.4|
grl|Bawating|46.5,-84.3;46.3,-83.6|The rapids between Superior and Huron.
grl|Tahquamenon|46.6,-85.3;46.4,-86|
grl|Michipicoten|47.9,-84.9;47.5,-84.7|
grl|Mississagi|46.2,-83;46.6,-82.6|
grl|Wanapitei|46.7,-80.8;46.4,-81.2|
grl|Manitoulin|45.8,-82.3;45.3,-81.2|
grl|Nipissing|46.3,-79.8;46,-80.4|
grl|Michilimackinac|45.8,-84.7;45.3,-84.9|
grl|Manistique|45.96,-86.25;46.2,-85.9|
grl|Menominee|45.1,-87.6;45.4,-88.1|
grl|Winneconne|44.1,-88.7;44.5,-88.2|
grl|Sheboygan|43.75,-87.8;44.1,-87.7|
grl|Kinnickinnic|43,-88;42.7,-88.1|
grl|Koshkonong|42.9,-89;42.5,-89.2|
grl|Meskousing|43.2,-90.3;43.9,-90;44.6,-89.9|
grl|Saginaw|43.4,-83.9;43.9,-83.5|(archaeologists: Schultz phase).
grl|Shiawassee|42.9,-84.2;42.6,-84.5|
grl|Washtenong|43,-85.6;42.9,-85.1|
grl|Kalamazoo|42.3,-85.6;42.1,-86.3|
grl|Muskegon|43.3,-86;43.6,-85.5|
grl|Manistee|44.25,-86.2;44.5,-85.6|
grl|Saugeen|44.5,-81.3;43.9,-81.4|
grl|Ouentironk|44.4,-79.4;43.8,-79.4|
grl|Otonabee|44.3,-78.3;44.6,-78.1|
grl|Askunessippi|42.9,-81.3;42.3,-82.3|The north shore of the lake south of Huron.
grl|Niagara|43.1,-79.1;42.9,-79.6|(archaeologists: Meadowood).
grl|Cattaraugus|42.5,-78.9;42.2,-79.4|
grl|Genesee|42.9,-77.7;42.5,-77.6|(archaeologists: Meadowood).
grl|Canandaigua|42.8,-77.2;42.6,-76.8|
grl|Oswego|43.4,-76.5;43,-76.1|(archaeologists: Meadowood).
grl|Chenango|42.4,-75.6;42.8,-75.3|
grl|Tioga|42,-76.5;42.1,-77.2|
grl|Cataraqui|44.2,-76.5;44.5,-76|
grl|Oswegatchie|44.6,-75.4;44.3,-75.1|
grl|Adirondack|44,-74.3;43.6,-74.6|
grl|Sandusky|41.3,-83.1;41.4,-82.4|
grl|Maumee|41.4,-83.8;41.3,-84.6|
grl|Auglaize|40.8,-84.2;41,-84.9|
grl|Cuyahoga|41.3,-81.6;41.5,-81.1|
grl|Mahoning|41.1,-80.7;41.3,-80.2|
// ---- North-east ----
nea|Kebec|46.8,-71.2;47.1,-70.6|
nea|Batiscan|46.5,-72.25;46.4,-71.8|
nea|Magtogoek|45.5,-73.6;45.9,-73.2|The great river around its island.
nea|Yamaska|45.6,-72.9;45.3,-72.6|
nea|Temiscouata|47.7,-68.8;47.4,-69.3|
nea|Kespek|48.8,-65;48.1,-66.3|
nea|Listuguj|48,-66.7;47.9,-67.4|
nea|Metepenagiag|46.95,-65.8;47.3,-65.6|Its burial mound was raised about now and the village has never been left since.
nea|Kouchibouguac|46.8,-65;46.5,-64.8|
nea|Wolastoq|45.9,-66.6;46.5,-67.4|
nea|Aroostook|46.8,-68;46.6,-68.6|
nea|Siknikt|46,-64.6;45.8,-64.2|
nea|Epekwitk|46.4,-63.3;46.3,-62.6|
nea|Unama'kik|46.2,-60.7;45.8,-60.9|
nea|Piktuk|45.7,-62.7;45.5,-62.2|
nea|Sipekne'katik|45.1,-63.4;45,-63.9|
nea|Kespukwitk|44.3,-65.5;44.7,-65|
nea|Passamaquoddy|45,-67.1;45.2,-67.6|
nea|Machias|44.7,-67.5;44.9,-68|
nea|Katahdin|45.9,-68.9;45.6,-69.4|
nea|Allagash|46.7,-69.3;46.4,-69.8|
nea|Penobscot|44.8,-68.8;45.2,-68.6|
nea|Kennebec|44.3,-69.8;44.9,-69.9|
nea|Androscoggin|44.1,-70.2;44.5,-70.6|
nea|Saco|43.5,-70.45;43.9,-70.9|
nea|Winnipesaukee|43.6,-71.3;43.9,-71.6|
nea|Merrimack|42.8,-71.3;43.2,-71.6|
nea|Shawmut|42.3,-71.1;42.1,-70.8|
nea|Noepe|41.4,-70.6;41.6,-70.5|
nea|Narragansett|41.5,-71.4;41.7,-71.5|
nea|Quinnehtukqut|41.5,-72.6;41.9,-72.7|
nea|Pocumtuc|42.55,-72.6;43.2,-72.4|
nea|Housatonic|41.8,-73.4;42.3,-73.3|
nea|Bitawbagok|44.5,-73.3;44.9,-73.1|The Boucher burial ground belongs to these years (archaeologists: Middlesex).
nea|Winooski|44.4,-72.7;44.1,-72.5|
nea|Saratoga|43.1,-73.8;43.4,-73.6|
nea|Mahicannituck|42.5,-73.8;41.9,-73.9|
nea|Manahatta|40.8,-73.95;41.1,-73.9|
nea|Montaukett|41,-72.3;40.9,-72.8|
nea|Absecon|39.4,-74.5;39.6,-74.4|
nea|Minisink|41.3,-74.8;41,-75|(archaeologists: Bushkill).
nea|Sanhican|40.2,-74.7;40.1,-75|The falls of the Delaware; the Abbott Farm camps.
nea|Lackawanna|41.4,-75.65;41.3,-76|
nea|Susquehanna|40.6,-76.9;40.2,-76.7|
nea|Chemung|42.05,-76.9;41.8,-77|
nea|Juniata|40.5,-77.8;40.4,-77.3|
nea|Allegheny|41.5,-79.3;41.9,-78.6|
nea|Kiskiminetas|40.6,-79.4;40.5,-79|
nea|Youghiogheny|39.9,-79.5;39.7,-79.3|
nea|Patuxent|38.6,-76.7;38.9,-76.7|
nea|Nanticoke|38.5,-75.7;38.7,-75.5|Rich in Ohio-country grave goods (archaeologists: Delmarva Adena).
nea|Assateague|38.1,-75.2;38.4,-75.1|
nea|Accomac|37.7,-75.7;37.4,-75.9|
nea|Potomac|38.8,-77.1;39.3,-77.7|(archaeologists: Accokeek, Popes Creek).
nea|Shenandoah|38.9,-78.5;38.3,-78.9|
nea|Rappahannock|38,-77;38.3,-77.5|
nea|Pamunkey|37.6,-77;37.8,-77.4|
nea|Appomattox|37.3,-77.6;37.4,-78.5|
nea|Nansemond|36.8,-76.6;36.7,-76.9|
nea|Chesapeake|36.9,-76.2;36.8,-76|
// ---- Ohio country: Adena ----
ade|Adena|39.35,-83;39.9,-83|The heartland on the Scioto around Chillicothe, where the mound that gave the whole culture its name stands.
ade|Hocking|39.4,-82.2;39.6,-82.5|The great ring of mounds on the Plains near Athens.
ade|Muskingum|39.9,-82;39.6,-81.7|
ade|Tuscarawas|40.5,-81.5;40.3,-81.8|
ade|Kanawha|38.4,-81.8;38.2,-81.4|
ade|Guyandotte|38.4,-82.4;38.1,-82.2|
ade|Wheeling|40,-80.7;39.8,-80.8|The Upper Ohio; Grave Creek Mound rises here within the century.
ade|Monongahela|39.9,-79.9;39.6,-80|
ade|Piqua|40.1,-84.2;39.5,-84.4|
ade|Kentake|38,-84.5;38.3,-84.2|The meadow land south of the Ohio.
ade|Wapahani|40.1,-85.5;39.6,-85.3|
// ---- Midwest Early Woodland ----
eww|Wabash|40.4,-86.9;39.5,-87.4|
eww|Patoka|38.4,-87.2;38.7,-87.5|
eww|Muscatatuck|38.8,-85.8;39,-86.2|
eww|Tippecanoe|40.6,-86.7;41.1,-86.4|
eww|Kankakee|41.2,-87.7;41.3,-86.8|
eww|Pimiteoui|40.7,-89.6;40.3,-90|(archaeologists: Black Sand and Morton).
eww|Macoupin|39.2,-90.2;39,-90.6|
eww|Sangamon|39.9,-89.7;40,-88.9|
eww|Kaskaskia|38.5,-89.5;39.2,-88.9|(archaeologists: Florence phase).
eww|Pelisipi|37.2,-88.5;37.8,-87.6;37.6,-89.1|The lower Ohio (archaeologists: Crab Orchard and Baumer).
eww|Meramec|38.4,-90.6;38,-91.2|
eww|Niangua|37.9,-92.8;37.3,-93.2|The Ozarks.
eww|Pekitanoui|38.8,-92.3;39.1,-93.4|The lower Missouri, the muddy river.
eww|Nodaway|40.3,-95;40.6,-94.7|
eww|Nishnabotna|40.9,-95.5;41.3,-95.2|
eww|Okoboji|43.4,-95.1;43.1,-95.6|
eww|Keosauqua|40.7,-91.9;41.4,-93.2|
eww|Wapsipinicon|41.9,-91.4;42.4,-92.3|
eww|Maquoketa|42.1,-90.7;42.6,-91.1|
eww|Kishwaukee|42.2,-89;41.9,-88.5|
eww|Pemiscot|36.2,-89.8;36.7,-89.6|(archaeologists: Burkett phase).
// ---- South-east ----
sea|Wasioto|36.8,-84.5;36.6,-85.3|The Cumberland country.
sea|Tanasi|35.6,-84.3;35.9,-84|(archaeologists: Watts Bar).
sea|Hogohegee|36.5,-82.6;36.3,-83.2|
sea|Watauga|36.3,-82.1;36.2,-81.7|
sea|Nolichucky|36.1,-82.9;36,-82.5|
sea|Swannanoa|35.6,-82.5;35.4,-82.8|(archaeologists: Swannanoa phase).
sea|Tuckasegee|35.4,-83.3;35.3,-83.6|
sea|Hiwassee|35.2,-84.5;35,-84|
sea|Sequatchie|35.3,-85.4;35,-85.7|
sea|Dagunahi|34.75,-87.6;35.2,-88.2;34.6,-86.6|The mussel shoals of the middle Tennessee (archaeologists: Alexander and Colbert).
sea|Hatchie|35.5,-89.2;35.2,-88.9|
sea|Tombigbee|33.5,-88.4;34.2,-88.6|(archaeologists: Alexander).
sea|Noxubee|33.1,-88.6;32.8,-88.4|
sea|Chickasawhay|31.6,-88.6;32,-88.7|
sea|Pascagoula|30.4,-88.6;30.8,-88.7|(archaeologists: Bayou La Batre).
sea|Escatawpa|30.6,-88.3;30.7,-88|
sea|Cahaba|33,-87.1;33.5,-86.9|
sea|Autauga|32.4,-86.6;32.3,-87.2|
sea|Conecuh|31.4,-87;31.2,-86.4|
sea|Coosa|33.5,-86.2;34,-85.8|
sea|Oostanaula|34.4,-85.1;34.6,-84.9|
sea|Etowah|34.2,-84.8;34.4,-84.3|(archaeologists: Kellogg and Cartersville).
sea|Tallapoosa|32.8,-85.9;33.2,-85.5|
sea|Chattahoochee|33.5,-85;32.4,-85|
sea|Thronateeska|31.6,-84.2;32.2,-84.1|
sea|Choctawhatchee|30.6,-85.9;31,-85.8|
sea|Apalachicola|29.9,-85;30.5,-85.1|
sea|Apalachee|30.4,-84.3;30.2,-84|(archaeologists: Deptford).
sea|Aucilla|30.3,-83.8;30.5,-83.5|
sea|Suwannee|29.9,-83;30.3,-83.1|
sea|Ocmulgee|32.8,-83.6;32.1,-83.3|(archaeologists: Dunlap).
sea|Oconee|33.3,-83.2;33.8,-83.4|
sea|Ohoopee|32.3,-82.3;32.6,-82.6|
sea|Ogeechee|32,-81.3;32.5,-81.8|(archaeologists: Deptford and Refuge).
sea|Altamaha|31.6,-81.9;31.9,-82.4;31.45,-81.3|The shell rings on its sea islands were old even then (archaeologists: Deptford).
sea|Okefenokee|30.8,-82.3;31,-82.6|
sea|Edisto|33,-80.5;32.6,-80.4|
sea|Santee|33.5,-80.2;33.3,-79.6|
sea|Congaree|33.9,-80.9;34,-81.2|
sea|Saluda|34.2,-81.8;34.5,-82.2|
sea|Catawba|35,-81;35.5,-81.2|
sea|Pee Dee|34.3,-79.7;34.8,-79.9|
sea|Waccamaw|34,-78.9;34.3,-78.4|
sea|Uwharrie|35.4,-80;35.6,-79.8|
sea|Yadkin|36,-80.5;36.2,-80.9|(archaeologists: Badin and Yadkin).
sea|Saxapahaw|35.9,-79.3;36.1,-79.5|
sea|Eno|36.05,-78.9;36.2,-79.1|
sea|Neuse|35.2,-77.6;35.5,-78.2|(archaeologists: Deep Creek).
sea|Pamlico|35.4,-76.6;35.5,-77|
sea|Hatteras|35.25,-75.6;35.6,-75.5|
sea|Roanoke|36.3,-77.6;36.6,-78.5|
sea|Chowan|36.3,-76.7;36.1,-76.5|
// ---- Lower Mississippi ----
gul|Tchefuncte|30.4,-90.1;30.1,-90.4|Lake Pontchartrain, where their shell middens were first dug.
gul|Tangipahoa|30.7,-90.5;31,-90.4|
gul|Atchafalaya|30,-91.5;29.7,-91.1|
gul|Calcasieu|30.2,-93.2;30.3,-92.7|
gul|Catahoula|31.5,-92;31.2,-91.7|
gul|Tchula|33.2,-90.2;32.8,-90.6|The Yazoo basin.
gul|Yalobusha|33.8,-89.8;33.9,-89.4|
gul|Tallahatchie|34.3,-90;34.7,-90.2|(archaeologists: Lake Cormorant).
gul|Ouachita|32.5,-92.1;33.2,-92.6|
gul|Niska|34.6,-91.6;35.4,-91.6|
cad|Kiamichi|34.5,-95.2;34.8,-94.7;34.3,-94.7|The heartland in the Ouachita Mountains.
cad|Bahatteno|33.7,-95.3;33.6,-94.3|The middle Red River.
cad|Neosho|36.8,-95;36.2,-94.9|
cad|Attoyac|31.6,-94.4;32.2,-94.9|
cad|Kisatchie|31.5,-93.1;32.4,-93.6|
// ---- Florida ----
fla|Welaka|29.5,-81.6;28.8,-81.3;30.2,-81.6|The river of lakes.
fla|Ocklawaha|29.2,-81.9;29.5,-82.3|
fla|Withlacoochee|28.9,-82.5;28.5,-82.2|
fla|Myakka|27.3,-82.3;27.9,-82.4|
fla|Kissimmee|28,-81.2;27.6,-81.2|
fla|Caloosahatchee|26.6,-81.9;26.5,-81.7|
fla|Okeechobee|27,-80.9;27.2,-81.1|
fla|Pahayokee|25.6,-80.6;25.8,-80.2;26.3,-80.3|The grassy waters of the south.
fla|Matecumbe|24.9,-80.7;24.6,-81.6|The island chain.
// ---- Plains ----
pln|Amiskwaciy|53.5,-113.3;53.2,-112.3|The Beaver Hills.
pln|Waskasoo|52.3,-113.8;52.1,-112.6|
pln|Makhabn|51,-114.1;50.9,-112.5|The river where bow reeds grow.
pln|Minnewanka|51.25,-115.4;51.1,-115.1|The mountain lake of the spirits, camped at for ten thousand years.
pln|Napi Tahta|49.75,-113.6;49.7,-112.8|The Old Man's river; the great buffalo jump in the Porcupine Hills is in use.
pln|Aisinaipi|49.08,-111.6;49.4,-110.9|The sandstone valley of the rock pictures.
pln|Manatakaw|49.6,-109.9;49.9,-108.6|The hills that stand above the plain.
pln|Meota|53,-108.4;53.3,-109.6|
pln|Wanuskewin|52.2,-106.6;52.7,-107.4|A meeting place of the bison hunters with jumps and pounds, in use for six thousand years.
pln|Kinistino|52.95,-105;52.5,-104.6|
pln|Mistusinne|51,-106.5;50.6,-107.6|The great sacred stone at the elbow of the river.
pln|Katepwa|50.7,-103.6;50.5,-102.4|The calling river.
pln|Wascana|50.4,-104.6;49.7,-105.2|
pln|Kenosee|49.8,-102.3;49.3,-102.6|
pln|Winnipegosis|52.5,-100.2;52,-100.9|
pln|Wasagaming|50.65,-100;50.2,-99.5|
pln|Manitowapow|50.9,-98.6;51.5,-99.1|The strait of the spirit.
pln|Pembina|49,-97.5;48.3,-97.3|
pln|Mikinak Wajiw|48.9,-100;49.2,-100.9|The turtle mountain.
pln|Minnewaukan|48,-99;47.8,-98.2|The spirit water.
pln|Mnishoshe|46.8,-100.8;47.6,-101.4|The turbid river.
pln|Takahokuty|47.45,-102.9;47,-103.5|
pln|Makoshika|47.07,-104.7;46.5,-105.4|
pln|Wahkpa Chugn|48.55,-109.7;48.4,-107.6|A bison kill ground on the little river.
pln|Pishkun|47.48,-111.5;47.9,-112.3|The mile-long buffalo jump.
pln|Mitsiadazi|45.7,-110.5;45.8,-108.6|The yellow rock river.
pln|Baahpuuo|45.2,-108.3;45.4,-107.3|
pln|Mato Tipila|44.6,-104.7;44.3,-105.6|The bear's lodge.
pln|Paha Sapa|44,-103.7;43.7,-103.5|The black hills.
pln|Mako Sica|43.8,-102.3;43.5,-101.6|
pln|Wakpala|45.66,-100.5;45.4,-101.6|
pln|Wakpa Shicha|44.3,-100.5;44.1,-101.5|
pln|Keya Paha|43,-99.5;43.3,-100.3|
pln|Niobrara|42.8,-100.6;42.7,-102.5;42.8,-98.2|
pln|Popo Agie|42.8,-108.7;43.3,-108.2|
pln|Seedskadee|41.9,-109.8;41.5,-109.4|
pln|Nibthaska|41,-100.5;41.2,-102.3|The flat water.
pln|Itskari|41.4,-98;41.7,-99.4|
pln|Pahuk|41.4,-96.7;41.2,-96.1|The holy bluff above the flat water.
pln|Nemaha|40.1,-95.8;40.4,-96.5|
pln|Sappa|39.8,-100.5;39.6,-101.3|
pln|Waconda|39.5,-98.3;39.2,-97.7|The spirit spring.
pln|Wakarusa|39,-95.6;39.1,-96.5|
pln|Ninnescah|37.6,-97.8;37.5,-98.9|
pln|Nescatunga|36.8,-98.2;36.5,-99.3|The salt river.
pln|Napeste|38.1,-103;38,-101.8|
pln|Apishapa|37.9,-104;37.4,-103.6|
pln|Tava|38.84,-104.9;39.7,-104.9|The sun mountain and the plain below it.
tex|Washita|35.2,-98.5;35.6,-99.8;34.7,-98.7|
tex|Tahoka|33.2,-101.8;34.2,-102.2|The high plain of the dry lakes.
tex|Tokonohono|31.5,-97;32.3,-96.9;33,-98.5|
tex|Navasota|30.4,-96.1;30.9,-96.4|
tex|Yanaguana|29.5,-98.5;30.3,-98.6;30.8,-99.6|
tex|Pecos|30.3,-101.7;31.4,-102.5;29.8,-101.3|The canyons with their painted shelters.
tex|Chisos|29.3,-103.3;29.6,-104.4;30.3,-103.7|
tex|Neches|31.3,-94.7;30.3,-94.2|
tex|Copano|28.1,-97;28.7,-96.2;29.3,-95|The bays of the western Gulf (archaeologists: Aransas).
// ---- Plateau ----
plt|Nechako|53.9,-124.5;53.7,-125.6|
plt|Lheidli|53.9,-122.7;54.2,-122.2|Where the two rivers meet.
plt|Nazko|53,-123.6;53.2,-123.1|
plt|Ulkatcho|52.7,-125.3;52.5,-124.8|
plt|Tsilhqox|51.9,-123.2;52.1,-122.5|
plt|Tatla|51.9,-124.6;51.6,-124.2|
plt|Esketemc|51.8,-122.2;51.6,-121.6|
plt|Shuswap|50.9,-119.3;51.3,-119.8|
plt|Tkemlups|50.7,-120.3;50.3,-120.7|
plt|Xwisten|50.75,-122;50.5,-122.5|The great pit-house villages of the middle Fraser.
plt|Similkameen|49.2,-120;49.4,-120.5|
plt|Okanagan|49.5,-119.6;48.7,-119.5|
plt|Slocan|49.8,-117.5;49.5,-117.8|
plt|Kootenay|49.5,-116;50.3,-115.9;48.6,-115.6|
plt|Methow|48.4,-120.1;48.1,-120|
plt|Chelan|47.85,-120;47.9,-120.4|
plt|Wenatchee|47.4,-120.3;47.6,-120.7|
plt|Sanpoil|48.1,-118.7;48.3,-118.9|
plt|Shonitkwu|48.6,-118.1;48.3,-117.9|The great falls fishery of the upper Columbia.
plt|Kalispel|48.2,-117;48.3,-116.4|
plt|Palus|46.9,-117.3;46.6,-118.2|
plt|Yakima|46.6,-120.5;46.3,-119.9|
plt|Walla Walla|46.1,-118.3;46.1,-118.8|
plt|Umatilla|45.7,-119;45.4,-118.6|
plt|Wallowa|45.4,-117.3;45.6,-117|
plt|Kooskooskie|46.4,-116;46.2,-115.5|
plt|Lochsa|46.4,-115;46.5,-114.6|
plt|Spetlem|46.4,-114.1;45.9,-114.2|The bitterroot valley.
plt|Missoula|46.9,-114;47.6,-114.3|
plt|Wyam|45.65,-121;45.6,-120.5|The great fishery at the falls of the Columbia, where the river turns to the sea.
plt|Tualatin|45.4,-122.9;45.5,-123.1|
plt|Willamette|45,-123;44.9,-122.7|
plt|Calapooia|44.4,-123;44.2,-123.1|
plt|Yoncalla|43.6,-123.3;43.4,-123.3|
plt|Takelma|42.4,-123.1;42.5,-122.8|
plt|Klamath|42.5,-121.8;42.2,-121.3|
// ---- North-west coast (the far west of the map is drawn north-up: the outer islands sit at the map's own corner) ----
nwc|Haida Gwaii|49.7,-132;50,-131.2|(archaeologists: Graham tradition).
nwc|Quatsino|50.3,-130;49.9,-129.3|
nwc|Kyuquot|49.4,-128.9;49.6,-128.4|
nwc|Gitxaala|53.8,-130.4;52.9,-129.4|An island village lived in without a break for thousands of years.
nwc|Metlakatla|54.3,-130.4;54.5,-130.2|The harbour ringed by old villages.
nwc|Kitselas|54.6,-128.4;54.3,-127.9|The canyon of the river of mists.
nwc|Kitimat|54,-128.7;53.7,-128.8|
nwc|Kitlope|53.2,-127.9;53.4,-127.4|
nwc|Wedzin Kwah|54.2,-126.6;53.9,-127|
nwc|Kitasoo|52.6,-128.6;52.9,-128.9|
nwc|Waglisla|52.16,-128.14;52,-128.5|
nwc|Namu|51.86,-127.87;51.6,-127.9|Lived in for nine thousand years by now.
nwc|Wuikinuxv|51.68,-127.25;51.5,-127.5|
nwc|Kimsquit|52.83,-126.95;52.6,-127.2|
nwc|Nuxalk|52.4,-126.7;52.4,-126.2|
nwc|Gwasala|51.2,-128;51.4,-128.4|
nwc|Namgis|50.55,-126.9;50.8,-126.4|
nwc|Nawiti|50.9,-127.9;50.7,-128.3|
nwc|Homalco|50.6,-125;50.3,-125.2|
nwc|Yuquot|49.6,-126.6;50,-127.4|The outer coast village that was never abandoned.
nwc|Clayoquot|49.15,-125.9;49,-125.6|
nwc|Tsishaa|48.9,-125.3;48.8,-125|An island village of the outer sound, five thousand years old.
nwc|Komoks|49.67,-124.9;49.5,-124.8|
nwc|Shishalh|49.47,-123.76;49.6,-123.9|
nwc|Cowichan|48.8,-123.7;48.7,-123.5|
nwc|Squamish|49.7,-123.2;50.1,-123.1|
nwc|Musqueam|49.2,-123.2;49.25,-123|The river mouth: the great midden village of these very years (archaeologists: Marpole).
nwc|Xaytem|49.15,-122.2;49.2,-121.9|
nwc|Nooksack|48.9,-122.3;48.8,-122.6|
nwc|Skagit|48.4,-122.3;48.5,-121.9|
nwc|Duwamish|47.5,-122.3;47.6,-122.2|
nwc|Nisqually|47,-122.7;47.1,-122.9|
nwc|Skokomish|47.3,-123.2;47.5,-123.1|
nwc|Klallam|48.1,-123.4;48.1,-123.8|
nwc|Ozette|48.15,-124.7;47.9,-124.6|
nwc|Quinault|47.4,-124.2;47.6,-124.3|
nwc|Chehalis|46.95,-123.6;46.8,-123.2|
nwc|Cowlitz|46.3,-122.9;46.5,-122.7|
nwc|Wimahl|46.2,-123.4;45.7,-122.7|The great river of the west near the sea.
nwc|Tillamook|45.5,-123.8;45.3,-123.9|
nwc|Alsea|44.4,-124;44.3,-123.8|
nwc|Coos|43.4,-124.2;43.2,-124.1|
// ---- California ----
cal|Chetco|42.1,-124.2;42,-124.1|
cal|Rekwoi|41.5,-124;41.8,-124.1;41.3,-123.7|
cal|Wiyat|40.8,-124.2;40.6,-124.1|
cal|Noyo|39.4,-123.8;39.6,-123.6|
cal|Kulanapo|39,-122.8;39.1,-122.9|The great lake of the coast ranges.
cal|Sonoma|38.4,-122.7;38.5,-122.9|
cal|Tamalpais|37.9,-122.5;37.95,-122.6|The bay shore and its shell mounds.
cal|Tamien|37.3,-121.9;36.98,-121.9|
cal|Suisun|38.2,-122;38.3,-121.8|
cal|Tehama|40,-122.1;40.2,-122.2|
cal|Shasta|41.4,-122.4;40.8,-122.3|
cal|Yuba|39.2,-121.3;39.5,-121.4|
cal|Cosumnes|38.4,-121.3;38.5,-121|
cal|Tuolumne|37.8,-120.4;37.9,-120|
cal|Chowchilla|37.1,-120.2;37,-119.9|
cal|Kaweah|36.4,-119;36.5,-118.8|
cal|Tachi|36.3,-119.7;36,-119.6|The great tule lake.
cal|Tehachapi|35.1,-118.5;35.4,-118.8|
cal|Esselen|36.2,-121.6;36.4,-121.8|
cal|Cholame|35.7,-120.3;35.9,-120.6|
cal|Lompoc|34.6,-120.4;34.7,-120.2|
cal|Syuxtun|34.4,-119.7;34.4,-119.4|The channel coast, already Chumash for thousands of years.
cal|Limuw|34,-119.7;34,-120.1|The channel islands.
cal|Topanga|34.1,-118.4;33.9,-118.2|
cal|Pimu|33.4,-118.4;33.3,-118.3|
cal|Cucamonga|34.1,-117.6;34,-117.3|
cal|Temecula|33.5,-117.1;33.3,-117.3|
cal|Cuyamaca|32.95,-116.6;33.1,-116.7|
cal|Cahuilla|33.7,-116.3;33.5,-116|
cal|Mono|38,-119;38.2,-119.2|
cal|Inyo|36.8,-118.2;37.3,-118.4|
cal|Tahoe|39.1,-120;39.3,-120.2|(archaeologists: Martis complex).
// ---- Great Basin and the Rockies ----
bas|Chewaucan|42.7,-120.5;43.3,-118.9;42.6,-119.5|The marsh and lake country of the northern desert.
bas|Kuyui|40,-119.5;40.5,-119.4|
bas|Saiduka|40,-118.6;39.6,-118.5|The marshes of the desert sinks: the tule-eaters whom later peoples remembered in their tales, makers of the duck decoys (archaeologists: Lovelock culture).
bas|Agai Pah|38.7,-118.7;38.9,-119.1|The trout lake.
bas|Tosawihi|41.2,-116.5;40.8,-116.9|The white-knife quarries, worked for ten thousand years.
bas|Jarbidge|41.9,-115.4;42.2,-114.8|
bas|Toiyabe|39.2,-117.1;39.6,-117|
bas|Toquima|38.8,-116.9;38.6,-116.5|
bas|Tonopah|38.1,-117.2;37.7,-116.7|
bas|Pahranagat|37.3,-115.1;37.8,-114.8|
bas|Moapa|36.7,-114.6;36.5,-114.4|
bas|Pahrump|36.2,-116;36,-115.6|
bas|Timbisha|36.45,-116.9;36.7,-117.1|
bas|Coso|36,-117.8;36.2,-117.6|The ranges of the pecked sheep pictures.
bas|Mojave|35,-115.5;34.9,-116.9;35.5,-116.3|
bas|Ibapah|40,-114;40.7,-114|The salt-desert caves, lived in for ten thousand years.
bas|Timpanogos|40.4,-111.7;41.2,-112.1|
bas|Bia Ogoi|42.1,-111.9;41.8,-111.8|
bas|Tosoiba|42.65,-111.6;42.9,-112.2|
bas|Pahsimeroi|44.6,-114;44.2,-113.6|
bas|Teewinot|43.7,-110.8;43.5,-111.9|
bas|Pahvant|39,-112.3;38.6,-112.8|
bas|Parowan|37.8,-112.8;37.6,-113.2|
bas|Kaiparowits|37.5,-111.5;37.3,-111.9|
bas|Kaibab|36.7,-112.2;36.9,-112.6|
bas|Shivwits|36.7,-113.6;37.1,-113.5|
bas|Tavaputs|39.5,-110;38.9,-110.4|The canyon country of the tall painted ghost figures.
bas|Uinta|40.5,-110;40.3,-109.4|
bas|Yampa|40.5,-108;40.4,-107.2|
bas|Uncompahgre|38.5,-107.9;38.8,-108.3|
bas|Saguache|38.1,-106.1;37.7,-105.8|
// ---- South-west ----
swf|Kawestima|36.7,-110.5;36.9,-110.2|The canyons and the black mesa (archaeologists: Basketmaker II, White Dog phase).
swf|Tsegi|36.2,-109.5;36.4,-109.8|
swf|Hovenweep|37.4,-109;37.5,-109.7|The cedar mesa and its dry caves.
swf|Pagosa|37.27,-107;37.3,-107.9|(archaeologists: Durango Basketmaker).
swf|Yupkoyvi|36.1,-107.9;35.7,-107.6|(archaeologists: En Medio phase).
swf|Paayu|35,-110.7;35.4,-111.2|
swf|Shiwinna|35.1,-108.8;34.7,-108.6|
swf|Tsama|36.2,-106.3;36.1,-105.9;35.6,-106.7|A cave in the hills here holds some of the oldest maize of the north (archaeologists: En Medio phase).
swf|Akimel|33.1,-111.9;33.4,-112.3|
swf|Cuk Son|32.2,-111;32.5,-111.3|Villages of round houses with canals and maize fields (archaeologists: Cienega phase).
swf|Sonoita|31.5,-110.8;31.4,-111.1|
swf|Quiburi|31.7,-110.2;32.2,-110.3|
swf|Chiricahua|31.9,-109.3;32.6,-108.8;33,-109.4|
swf|Dzil Ligai|33.9,-109.6;34,-110.3|
swf|Caborca|30.7,-111.9;30.7,-112.3|The great early farming village in the desert (archaeologists: La Playa).
swf|Paquime|30.4,-107.9;30,-107.6|(archaeologists: Late Archaic farming hill villages).
swa|Teypana|34,-106.9;32.4,-106.8;33,-106;31.9,-106|The middle Rio Grande and the basins east of it (archaeologists: Hueco phase).
swa|Cicuye|35.5,-105.7;35.2,-104.6|
swa|Havasu|36.2,-112.7;35.8,-113.2|
swa|Avikwame|35.3,-114.7;33.6,-114.6;32.7,-114.6|The river below the spirit mountain.
swa|Hia Ced|32.2,-113.3;31.9,-112.8|The sand country.
swa|Tahejoc|29,-112.4;29.3,-111.9|The island and the desert shore of the Comcaac.
swa|Bavispe|30.5,-109;30,-109.2|
swa|Sahuaripa|29,-109.2;28.6,-109.4|
swa|Yaqui|28.3,-109.9;27.7,-110.3|
swa|Mayo|26.9,-109.4;27.1,-108.9|
swa|Ohuira|25.6,-109;25.8,-108.4|
swa|Humaya|24.9,-107.4;24.3,-107|
swa|Topia|25.2,-106.6;24.8,-106.2|
swa|Raramuri|27.7,-107.6;26.9,-107.2|The canyons of the mother range.
swa|Papigochi|28.5,-107.6;28.9,-107.9|
swa|Namiquipa|29.25,-107.4;29.5,-106.9|
swa|Chuviscar|28.6,-105.9;28.9,-105.3|
swa|Satevo|27.95,-106.1;27.3,-105.4|
swa|Kiliwa|31,-115.6;30.5,-115.3|
swa|Cochimi|28,-113.5;29.5,-114.5|The painted caves of the middle peninsula.
swa|Mulege|26.9,-112;27.3,-112.3|
swa|Comondu|26.06,-111.8;25.6,-111.5|
swa|Guaycura|24.5,-111.5;24.2,-110.9|
swa|Pericu|23.2,-109.9;23.5,-110.2|The cape at the peninsula's end.
// ---- North-east Mexico ----
nmx|Mapimi|27,-103.5;27,-102;26.3,-101.4|The great dry basin.
nmx|Mayran|25.6,-102.8;25.5,-103.5;25.2,-104.5|
nmx|Mamulique|26.1,-100.2;25.7,-100.4|
nmx|Tamaholipa|24.5,-98.6;25.3,-98.4;23.9,-98.9|(archaeologists: Abasolo complex; Laguna phase villages in the sierra).
nmx|Estok Gna|26,-98.3;26.5,-99.1;27.6,-99.6|The lower Rio Grande.
nmx|Wirikuta|23.6,-100.9;22.9,-101;23,-102.6;23.8,-103.5|The high desert held sacred by the Wixarika.
hua|Tamtoc|22,-98.8;21.9,-99.3|
hua|Panuco|22.1,-98.2;22.4,-97.9|
`,
};
