/* veri/ogun-sablonu.js — Öğün Hatırlatıcı varsayılan şablonu. Kaynak: dadadiet-prototip _src/veri/ogun-sablonu.json (onay 09.11.2026); ikon adları FA öneksiz.
 * Kural: kahvaltı çapa, öğle +4 sa, ara öğün öğleden 0–3 sa sonra, akşam +10 sa en geç 21:30. Süreler dakika, saatler SS:DD. */
window.DDV = window.DDV || {};
DDV.ogunSablonu = {
 "kod": "varsayilan",
 "ad": "Varsayılan öğün şablonu",
 "kurallar": [
  {
   "tur": "kahvalti",
   "ad": "Kahvaltı",
   "ikon": "mug-saucer",
   "referans": null,
   "varsayilan_saat": "09:00"
  },
  {
   "tur": "ogle",
   "ad": "Öğle Yemeği",
   "ikon": "utensils",
   "referans": "kahvalti",
   "ofset_dk": 240
  },
  {
   "tur": "ara1",
   "ad": "Ara Öğün",
   "ikon": "apple-whole",
   "referans": "ogle",
   "pencere_bas_dk": 0,
   "pencere_bit_dk": 180,
   "opsiyonel": true
  },
  {
   "tur": "ara2",
   "ad": "İkindi",
   "ikon": "seedling",
   "referans": "ogle",
   "pencere_bas_dk": 0,
   "pencere_bit_dk": 180,
   "opsiyonel": true
  },
  {
   "tur": "aksam",
   "ad": "Akşam Yemeği",
   "ikon": "bowl-food",
   "referans": "kahvalti",
   "ofset_dk": 600,
   "en_gec_saat": "21:30"
  }
 ],
 "ara_en_cok": 2,
 "varsayilan_ara_sayisi": 1,
 "simdi_pay_dk": 30,
 "once_dk_secenek": [
  0,
  15,
  30
 ],
 "varsayilan_once_dk": 0,
 "varsayilan_sessiz": "22:00-08:00",
 "oruc_yeme_saati": {
  "12-12": 12,
  "14-10": 10,
  "sirkadiyen": 10,
  "16-8": 8,
  "18-6": 6,
  "20-4": 4
 },
 "enerji_payi": {
  "kahvalti": 25,
  "ogle": 35,
  "ara1": 10,
  "ara2": 10,
  "aksam": 30
 }
};
