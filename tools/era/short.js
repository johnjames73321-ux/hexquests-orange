// A people's name, short (owner 11-16: "short, to the point"): the first of two (Finnic/Baltic -> Finns), no "mixed", "culture",
// "proto-", and the people rather than the adjective. Only words already in the people line of the tag are used: nothing is made up.
const FOLK = { Baltic: "Balts", Finnic: "Finns", Germanic: "Germani", Saami: "Saami", Iranian: "Iranians", Khoisan: "San", Cushitic: "Cushites",
  Austronesian: "Austronesians", Austroasiatic: "Austroasiatics", "Tibeto-Burman": "Tibeto-Burmans", Papuan: "Papuans", Samoyedic: "Samoyeds",
  Tungusic: "Tungus", Thracian: "Thracians", Celtic: "Celts", Illyrian: "Illyrians", Dravidian: "Dravidians", "Indo-Aryan": "Indo-Aryans",
  Uralic: "Uralians", Yeniseian: "Yeniseians", Mongolic: "Mongols", Turkic: "Turks", Nilotic: "Nilotes", Chadic: "Chadians",
  Pomeranian: "Pomeranians", Tocharian: "Tocharians", "North Caucasian": "Caucasians", "Paleo-Siberian": "Paleo-Siberians",
  Lusatian: "Lusatians", Venetic: "Veneti", Aquitanian: "Aquitani", Nordic: "Nordics", Japonic: "Yayoi", Pannonian: "Pannonians" };
const SHORT = p => {
  p = String(p || "").split(/\s*\/\s*|\s+or\s+|\s+and\s+|\s*,\s*/)[0];
  p = p.replace(/^(possibly|probably)\s+/i, "").replace(/^(proto|pre|early|late)-\s*/i, "").replace(/^(Early|Late|Modern) /, "");
  p = p.replace(/[- ](related|derived|influenced|mixed|type)$/i, "").replace(/\s+(culture|tradition|substrate|ancestors)$/i, "").replace(/\s+(face-urn|cloche-grave)$/i, "").trim();
  if (!p) return p;
  return FOLK[p] || p[0].toUpperCase() + p.slice(1);
};
// the branch named in brackets (Austronesian (Kayan-Kenyah) -> Kayan-Kenyah), only when it is a plain proper name
const BRANCH = raw => { const m = /\(([^)]*)\)/.exec(String(raw || "")); if (!m) return ""; const s = m[1].split(/[,;:/]/)[0].trim(); return /^[A-Z][A-Za-z'’]+(-[A-Z][A-Za-z'’]+)?( [A-Z][A-Za-z'’]+)?$/.test(s) && !/\b(Age|Culture|Ware|Iron|Bronze|Early|Late|Proto|Area|Group|Central|Northern|Southern|Eastern|Western|North|South|East|West|Old|Min|Baiyue)\b/.test(s) ? s : ""; };
module.exports = { SHORT, BRANCH };
