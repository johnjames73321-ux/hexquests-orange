// Peoples of the 320 BC layer whose name in the main game is a modern town, river, island, district or dig site (read through by hand,
// owner 11-17: "still a country named Pskov"). They take their people's name instead (audit.js). Names of peoples themselves and names
// attested in antiquity are not listed. QUAL: a modern place word in front of a real people (Vienna Celts -> Celts).
module.exports = {
  MOD: ("Akjoujt Tichitt Walata Takrur Cruachan Ailenn Cadbury Danebury Uffington Cissbury Shetland Mallorca Menorca Hardangervidda Jotunheimen Femund Härjedalen Wetterau " +
    "Termit Fachi Bilma Djado Agadem Chirfa Dirkou Seguedine Madama Toummo Zouar Bardai Aouzou Faya Kawar Acacus Gajiganna Bossangoa Mbres Dolenjska Glubczyce Podłęże Nitra Mátra Piscolt " +
    "Vysotska Gomel Moshchiny Dyakovo Titchikha Elizavetovskoe Akhmylovo Ananyino Kara-Abyz Itkul Gorokhovo Sargat Tasmola Ust-Polui Uigarak Berezov Obdorsk Kokshetau Shuryshkar Leushi " +
    "Demyanka Betpak Esil Tromagan Alay Pamir Naryn Issyk Chingiz Karatal Tekes Alakol Ebinur Kunes Bortala Manas Berel Yulduz Shilikty Ukok Sagly Tes Kalba Tumshuq Changtang Kokonor Golog " +
    "Zoige Pur Yugan Agan Vakh Vasyugan Parabel Tym Narym Ketsk Chaya Imbat Pyak Sygva Lozva Sosva Tagil Vishera Chusovaya Inva Obva Yazva Vym Izhma Udora Perm Volga Ponoi Ter Kuma Yugra " +
    "Awash Ogaden Omo-Tana Rufiji Mafia Pemba Dahlak Kuumbi Narosura Elmenteita Nachikufu Kalambo Nakapapula Ssese Jazira Najd Qassim Nilgiri Pranhita Kotilingala Asurgarh Klang " +
    "Bangka Madura Selayar Ambon Buru Kei Aru Sula Bomberai Mamberamo Digul Sarmi Keerom Aitape Fly Kikori Goroka Madang Markham Huon Kosipe Siassi Bosavi Banks Huangzhong Shajing " +
    "Shi'ertaiyingzi Yeongsan Boseong Bukhan Mangyeong Namhan Daepyeong Gimhae Yoshinogari Awaji Hida Sado Hidaka Tokachi Simushir Shumshu Yerbogon Uchur Yudom Oymyakon Indigir Kolyma " +
    "Seymchan Korkodon Tigil Penzhin Paren Kamen Arman Ulya Ulakhan Chulman Tynd Amgin Alda Taui Sepon Socotra Osumi Amami Sanuki Aki Kawachi Omi Kii Asahi Musashi Iwaki Shiribeshi Savo Kymi Valdres Deli Kerinci Musi Hami Yumi Shirenzigou Ushki Buni Kaili").split(" ")
    .concat(["Croft Ambrey", "Serny Klyuch", "Jebel Si", "Ban Don Ta Phet", "Khao Wong Prachan", "Noen U-Loke", "Phum Snay", "Lao Pako", "Ban Chiang Hian", "Angkor Borei", "Prohear", "Go O Chua",
      "Giong Ca Vo", "Con Rang", "Binh Thuan", "Hoa Diem", "Sa Huynh", "Dong Son", "Lang Vac", "Nam Ou", "Raja Ampat", "Middle Sepik", "Han River", "Batang Hari"]),
  KEEP: new Set(["Qiemo", "Venedi", "Budini", "Neuri", "Geloni"]),
  QUAL: /^(Main|Naab|Raba|Vienna|Traisen|Banat|Barsa|Oltenian|Arges|Buzau|Barlad|Raut|Dobruja|Budjak|Crimean|Chu|Elbe) (Celts|Dacians|Getae|Scyths|Saka|Germani)$/,
};
