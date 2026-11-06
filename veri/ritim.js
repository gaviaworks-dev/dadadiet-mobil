/* veri/ritim.js — dil canlı /program/oruc, /program/sekiz-saatlik-pencere-*, /ipuclari/aralikli-oruc-kimin-icin-uygun (TÜBER 2022) ve ana sayfa bilgi notundan.
 * Şu anki saat DDV.bugun.simdi (17:10): yeme penceresi açık. Saatler DDV.bugun öğünleriyle uyumlu.
 * DDV.ritim: { protokoller:[{ id, ad, orucSaat, pencereSaat, seviye, aciklama, populer?, haftalik? }], aktifProtokol,
 *   aktifDurum ('pencere'|'oruc'), durumlar:{ pencere|oruc:{ rozet, ikon, baslangic, bitis, hedefSaat, gecenDakika, kalanDakika, bilgi, eylem, eylemYardim } },
 *   sonOruc, sonYediGun:[{ tarih, gun, baslangic, bitis, sureSaat, hedefSaat, tamamlandi }], ozet,
 *   fazlar:[{ id, aralik, baslangicSaat, bitisSaat, ad, ikon, kisa, aciklama, opsiyonel? }], fazNotu, izinliSiviler[{ad,ikon}], izinsizler[{ad,ikon}], uygunDegil[], sorumlulukNotu, baslamadanNotu }
 */
window.DDV = window.DDV || {};
DDV.ritim = {
 "protokoller": [
  {
   "id": "12-12",
   "ad": "12:12",
   "orucSaat": 12,
   "pencereSaat": 12,
   "seviye": "Başlangıç",
   "aciklama": "Oruç 12 saat, yeme penceresi 12 saat. Gece uykusuyla kolayca örtüşür."
  },
  {
   "id": "14-10",
   "ad": "14:10",
   "orucSaat": 14,
   "pencereSaat": 10,
   "seviye": "Kolay",
   "aciklama": "Akşam yemeğini biraz erkene, ilk öğünü biraz geçe alırsın."
  },
  {
   "id": "16-8",
   "ad": "16:8",
   "orucSaat": 16,
   "pencereSaat": 8,
   "seviye": "Orta",
   "aciklama": "Öğünler 8 saatlik bir pencereye toplanır, kalan 16 saatte yemek yenmez.",
   "populer": true
  },
  {
   "id": "18-6",
   "ad": "18:6",
   "orucSaat": 18,
   "pencereSaat": 6,
   "seviye": "İleri",
   "aciklama": "Öğünler 6 saate sığar. Diyetisyeninle konuşarak dene."
  },
  {
   "id": "20-4",
   "ad": "20:4",
   "orucSaat": 20,
   "pencereSaat": 4,
   "seviye": "İleri",
   "aciklama": "Pencere 4 saat. Yeterli besin almak zorlaşır; uzman desteğiyle değerlendir."
  },
  {
   "id": "omad",
   "ad": "OMAD",
   "orucSaat": 23,
   "pencereSaat": 1,
   "seviye": "İleri",
   "aciklama": "Günde tek öğün. Besin ögesi ihtiyacını karşılamak zordur; uzman desteği olmadan önerilmez."
  },
  {
   "id": "5-2",
   "ad": "5:2",
   "orucSaat": null,
   "pencereSaat": null,
   "seviye": "Orta",
   "aciklama": "Haftada 5 gün olağan düzen, 2 gün enerji kısıtlı düzen. Günlük sayaç yerine takvimle izlenir.",
   "haftalik": true
  }
 ],
 "aktifProtokol": "16-8",
 "aktifDurum": "pencere",
 "durumlar": {
  "pencere": {
   "rozet": "Yeme penceresi açık",
   "ikon": "utensils",
   "baslangic": "2026-11-06T12:05:00+03:00",
   "bitis": "2026-11-06T20:05:00+03:00",
   "hedefSaat": 8,
   "gecenDakika": 305,
   "kalanDakika": 175,
   "bilgi": "Pencere 20:05'te kapanıyor. Akşam yemeğin 19:30'da planlı.",
   "eylem": "Orucu başlat",
   "eylemYardim": "Başlatmak için basılı tut"
  },
  "oruc": {
   "rozet": "Oruçtasın",
   "ikon": "hourglass-half",
   "baslangic": "2026-11-06T20:05:00+03:00",
   "bitis": "2026-11-07T12:05:00+03:00",
   "hedefSaat": 16,
   "gecenDakika": 0,
   "kalanDakika": 960,
   "bilgi": "İlk öğün saatin 12:05. Bu sürede su ve şekersiz içecekler serbest.",
   "eylem": "Orucu bitir",
   "eylemYardim": "Bitirmek için basılı tut"
  }
 },
 "sonOruc": {
  "baslangic": "2026-11-05T20:00:00+03:00",
  "bitis": "2026-11-06T12:05:00+03:00",
  "sureDakika": 965,
  "hedefSaat": 16,
  "tamamlandi": true
 },
 "sonYediGun": [
  {
   "tarih": "2026-10-31",
   "gun": "Cmt",
   "baslangic": "20:10",
   "bitis": "12:00",
   "sureSaat": 15.8,
   "hedefSaat": 16,
   "tamamlandi": false
  },
  {
   "tarih": "2026-11-01",
   "gun": "Paz",
   "baslangic": "19:45",
   "bitis": "12:00",
   "sureSaat": 16.3,
   "hedefSaat": 16,
   "tamamlandi": true
  },
  {
   "tarih": "2026-11-02",
   "gun": "Pzt",
   "baslangic": "20:00",
   "bitis": "12:10",
   "sureSaat": 16.2,
   "hedefSaat": 16,
   "tamamlandi": true
  },
  {
   "tarih": "2026-11-03",
   "gun": "Sal",
   "baslangic": "20:05",
   "bitis": "12:15",
   "sureSaat": 16.2,
   "hedefSaat": 16,
   "tamamlandi": true
  },
  {
   "tarih": "2026-11-04",
   "gun": "Çar",
   "baslangic": "19:55",
   "bitis": "12:00",
   "sureSaat": 16.1,
   "hedefSaat": 16,
   "tamamlandi": true
  },
  {
   "tarih": "2026-11-05",
   "gun": "Per",
   "baslangic": "20:00",
   "bitis": "12:00",
   "sureSaat": 16.0,
   "hedefSaat": 16,
   "tamamlandi": true
  },
  {
   "tarih": "2026-11-06",
   "gun": "Cum",
   "baslangic": "20:00",
   "bitis": "12:05",
   "sureSaat": 16.1,
   "hedefSaat": 16,
   "tamamlandi": true
  }
 ],
 "ozet": {
  "seriGun": 6,
  "ortalamaSaat": 16.1,
  "tamamlanan": 6,
  "toplam": 7
 },
 "fazlar": [
  {
   "id": "faz-1",
   "aralik": "0-4 saat",
   "baslangicSaat": 0,
   "bitisSaat": 4,
   "ad": "Sindirim",
   "ikon": "utensils",
   "kisa": "Son öğün sindiriliyor.",
   "aciklama": "Vücut son öğünü sindirir, besinlerden gelen enerjiyi kullanır ve depolar. Bu saatlerde tokluk hissi genellikle sürer."
  },
  {
   "id": "faz-2",
   "aralik": "4-12 saat",
   "baslangicSaat": 4,
   "bitisSaat": 12,
   "ad": "Sindirim sonrası",
   "ikon": "moon",
   "kisa": "Enerji depolardan gelmeye başlar.",
   "aciklama": "Sindirim tamamlanır, vücut enerji için giderek depolarına yönelir. Gece uykusu bu aralığın büyük bölümünü karşılar."
  },
  {
   "id": "faz-3",
   "aralik": "12-16 saat",
   "baslangicSaat": 12,
   "bitisSaat": 16,
   "ad": "Uzayan açlık",
   "ikon": "hourglass-half",
   "kisa": "Yağ kullanımı artabilir.",
   "aciklama": "Karbonhidrat depoları azaldıkça vücut yağı daha fazla kullanabilir. Hissedilen açlık kişiden kişiye değişir; su içmek bu saatleri kolaylaştırabilir."
  },
  {
   "id": "faz-4",
   "aralik": "16+ saat",
   "baslangicSaat": 16,
   "bitisSaat": null,
   "ad": "Pencereye geçiş",
   "ikon": "sun",
   "kisa": "Sıra ilk öğünde.",
   "aciklama": "16:8 hedefin tamamlandı. İlk öğünü acele etmeden, dengeli bir tabakla açman yeterli. Daha uzun süreleri diyetisyeninle konuş.",
   "opsiyonel": true
  }
 ],
 "fazNotu": "Bu aralıklar genel bilgidir, herkeste aynı saatte yaşanmaz. Aralıklı açlığın kilo üzerindeki etkisi, enerjiyi her gün kısıtlayan bir beslenmeden üstün bulunmamıştır.",
 "izinliSiviler": [
  {
   "ad": "Su",
   "ikon": "droplet"
  },
  {
   "ad": "Maden suyu",
   "ikon": "bottle-water"
  },
  {
   "ad": "Sade çay",
   "ikon": "mug-hot"
  },
  {
   "ad": "Sade kahve",
   "ikon": "mug-saucer"
  },
  {
   "ad": "Şekersiz bitki çayı",
   "ikon": "leaf"
  }
 ],
 "izinsizler": [
  {
   "ad": "Şekerli çay ya da kahve",
   "ikon": "cubes-stacked"
  },
  {
   "ad": "Sütlü kahve",
   "ikon": "mug-saucer"
  },
  {
   "ad": "Meyve suyu",
   "ikon": "glass-water"
  },
  {
   "ad": "Gazlı içecekler",
   "ikon": "bottle-water"
  },
  {
   "ad": "Ayran ve kefir",
   "ikon": "glass-water"
  },
  {
   "ad": "Alkollü içecekler",
   "ikon": "wine-glass"
  }
 ],
 "uygunDegil": [
  "Çocuklar, ergenler ve gebe kadınlar",
  "Emziren kadınlar",
  "Yeme bozukluğu olan ya da geçmişte yaşamış kişiler",
  "Zayıf (düşük kilolu) kişiler",
  "Diyabet ilacı kullananlar: hekimle konuşmadan başlanmamalı",
  "Düzenli ilaç kullananlar: hekimle konuşmadan başlanmamalı",
  "Ağır fiziksel iş yapan kişiler"
 ],
 "sorumlulukNotu": "Dada Diet'teki hesaplayıcı, test, rehber ve program içerikleri genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir ve tıbbi teşhis veya tedavi yerine geçmez. Kişiye özel bir plan için bir diyetisyene danış.",
 "baslamadanNotu": "Aralıklı açlık herkese uygun değildir. Başlamadan önce hekimine danış."
};
