// node tools/era/classify.js : reads tools/era/states.tsv (from dump.js), writes mods/era-tiers.json (state name -> tier)
// and tools/era/review.tsv. Tier of a 320 BC state = what kind of society it was then:
//   0 Settled  = a real state with government and towns
//   1 Frontier = organised farmers / herders without a state (chiefdoms, tribes, nomad confederations, oases)
//   2 Wilds    = hunter-gatherer bands
const fs = require("fs"), path = require("path");
const rows = fs.readFileSync(path.join(__dirname, "states.tsv"), "utf8").trim().split(/\r?\n/).slice(1).map(l => l.split("\t"));
const SETTLED = new Set(["empire", "kingdom", "satrapy", "republic", "city-state", "league", "walled town"]);
const FRONTIER = new Set(["chiefdom", "confederation", "nomads", "oasis", "village"]);
// peoples who lived by hunting, fishing and gathering in 320 BC (matched in the culture / seat text of tribes, cultures, clans, islands)
const FORAGER = new RegExp([
  // words
  "hunter", "forager", "fishers", "\\bcamps?\\b", "Archaic", "LSA\\b", "Shellmidden", "Sambaqui", "bison",
  // north Asia and the Arctic
  "Yukaghir", "Odul", "Samoyed", "Selkup", "Nenets", "Enets", "Ngan", "Tungus", "Evenk", "Yenisei", "\\bKet\\b", "Khanty", "Mansi", "Ob-Ugric", "Saami", "\\bSami\\b",
  "Chukot", "Koryak", "Itelmen", "Eskimo", "Inuit", "Dorset", "Thule", "Aleut", "Paleo-Siberian", "Palaeo-European", "North Asian", "Amuric", "Nivkh", "Ymyyakhtakh",
  "Ust-Mil", "Belkachi", "Syalakh", "Glazkovo", "Negidal", "Oroch", "Nanai", "Birar", "Udege", "Ainu", "Epi-Jomon", "^Jomon", "Susuya", "Okhotsk", "Sushen", "Yilou", "Kulai",
  "Pre-Nenets", "Hasava", "Ngarka", "Nadym", "\\bPur\\b", "Tsepan", "Kindigir", "Dingling",
  // Australia, south and south-east Asia
  "Aboriginal", "Tasmanian", "Negrito", "Andaman", "Vedda", "Indigenous forest peoples",
  // Africa
  "Khoisan", "Khoe", "\\bSan\\b", "\\bTuu\\b", "Kx'a", "Pygmy", "\\bTwa\\b", "Hadza", "Sandawe", "Dahalo", "Troglodyte",
  // North America (everyone outside Adena, the North-West Coast and the first maize farmers of the South-West)
  "Algonqui", "\\bCree\\b", "Ojibwe", "Innu", "Mi'kmaq", "Abenaki", "Siouan", "Nakoda", "Lakota", "Dakota", "\\bCrow\\b", "Blackfoot", "Cheyenne", "Arapaho", "Miami-Illinois",
  "Iroquoian", "Muskogean", "Caddoan", "Wichita", "Timucua", "Tunican", "Atakapan", "Calusa", "Numic", "Paiute", "Shoshone", "\\bUte\\b", "Sahaptian", "Secwepemc", "St'at'imcets",
  "Dakelh", "Chilcotin", "Athabaskan", "Apachean", "Kutenai", "Cayuse", "Klamath", "Kalapuyan", "Coahuiltec", "Tonkawa", "Karankawa", "Yuman", "Yavapai", "\\bPai\\b", "Cochimi",
  "Waikuri", "\\bSeri\\b", "Yokuts", "Miwok", "Wintu", "Maidu", "Takic", "Achomawi", "Pomo", "Chumash", "Kiowa", "Tanoan", "Chichimeca", "Zacateco", "Toboso", "Concho", "Pisone",
  "Janambre", "Jumano", "Mayran", "Xixime", "Woodland", "Salishan", "Beothuk",
  // South America
  "Tehuelche", "Chonan", "Aonikenk", "Kawesqar", "Chono", "Yaghan", "Selk'nam", "Pampa", "Puelche", "Gununa", "Charr[uú]a", "Chaná", "Querand", "Guaicuru", "Mataguay", "Zamuco",
  "Enlhet", "Mascoy", "Lule-Vilela", "Huarpe", "Comeching", "Sanavir", "Tonocot", "\\bJ[eê]\\b", "Tapuya", "Kayapo", "Timbira", "Botocudo", "Maxakal", "Kamakã", "Kariri", "Bororo",
  "Karaja", "Xukuru", "Tarairiu", "Payayá", "Ofaié", "Nambikwar", "Nadahup", "Yanomam", "\\bMura\\b", "Guahib", "Yaruro", "Chango", "\\bUru\\b", "Huilliche", "Mapudungun", "Picunche",
  "Warao", "Matanawi", "Katukinan", "Harakmbut",
].join("|"), "i");
// ... except these, who farmed, herded or lived in ranked villages (checked first)
const NOTFORAGER = /Yayoi|Adena|mound|Kwakwala|Wakashan|Nuu-chah-nulth|Tsimshian|Coast Salish|Chinook|Haida|Tlingit|Basketmaker|Early Agricultural|O'odham|pastoral|farmers|hillfort|metallurg|Sanhaja|Sandawe-speaking farmers/i;
const tierOf = r => { const [, name, type, cult, seat] = r, s = cult + " | " + seat;
  if (SETTLED.has(type)) return 0;
  if (FRONTIER.has(type)) return 1;
  if (type === "clan") return 2;
  if (NOTFORAGER.test(s)) return 1;
  return FORAGER.test(s) || FORAGER.test(name) ? 2 : 1; };
// single states judged by hand (name -> tier), on top of the rules. Add here, with the reason.
const HAND = {
};
const out = {}, clash = [], N = ["Settled", "Frontier", "Wilds"], sum = [[0, 0], [0, 0], [0, 0]], review = [];
for (const r of rows) { const name = r[1], t = name in HAND ? HAND[name] : tierOf(r); if (name in out && out[name] !== t) clash.push(name); out[name] = t;
  const old = [+r[6], +r[7], +r[8]], od = old.indexOf(Math.max(...old)); sum[t][0]++; sum[t][1] += +r[5]; review.push([r[0], name, r[2], r[3], r[4], r[5], N[od], N[t], od === t ? "" : "changed"].join("\t")); }
fs.writeFileSync(path.join(__dirname, "..", "..", "mods", "era-tiers.json"), JSON.stringify(out));
fs.writeFileSync(path.join(__dirname, "review.tsv"), "tag\tname\ttype\tculture\tseat\thexes\twas mostly\tnow\t\n" + review.join("\n") + "\n");
console.log("states", rows.length, N.map((n, t) => n + " " + sum[t][0] + " states / " + sum[t][1] + " hexes").join(" | "), "| same name, different tier:", clash.length, clash.slice(0, 10).join(", "));
