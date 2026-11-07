/* veri/kullanici.js — uygulamadaki oturum açmış kullanıcı ve bugünün günlüğü. Besin satırları DDV.besinler 100 g değerlerinden hesaplanır.
 * DDV.kullanici: { ad, soyad, basHarf, eposta, yas, cinsiyet, boyCm, kiloKg, baslangicKiloKg, hedefKiloKg, bmi, hedef, hedefAd, tempo, tempoAd, aktivite, aktiviteAd,
 *   beslenmeTarzi[], beslenmeTarziAd[], hassasiyetler[], hedefKcal, bazalKcal, gunlukEnerjiKcal, makroHedef:{P,K,Y,Lif}, suHedefMl, orucProtokolu, ilkOgunSaati, sonOgunSaati,
 *   aktifProgram:{slug,ad,gun,toplamGun,baslangic}, diyetisyen (slug), hedefTarihi, seri, uyelik }
 * DDV.bugun: { tarih, tarihMetin, simdi, selam, hedefKcal, tuketilenKcal, kalanKcal, planliKcal, yakilanKcal, makro:{P|K|Y|Lif:{alinan,hedef}},
 *   ogunler:[{ id, ad, ikon, saat, durum ('dolu'|'planli'), kcal, P, K, Y, Lif, kaynak?, besinler:[{ slug, ad, miktar, birim, gram, kcal, P, K, Y, Lif, gorsel }] }],
 *   su:{ icilenMl, hedefMl, adimlar[{ml,metin}], kayitlar[{saat,ml}] }, duygu:{ soru, secili, secenekler[{id,ad,ikon,uyari?}], uyarilar:{dikkat|acil:{baslik,metin}} } }
 *   Tutarlılık: tuketilenKcal = 'dolu' öğünlerin toplamı; makro.alinan = aynı öğünlerin toplamı; planli öğün tüketilene girmez.
 * DDV.gecmis[]: son 14 gün { tarih, gun, kcal, suMl, duygu, kiloKg, belCm, yagYuzde }; son kayıt bugündür (öğün/su sürüyor).
 */
window.DDV = window.DDV || {};
DDV.kullanici = {
 "ad": "Zeynep",
 "soyad": "Kaya",
 "basHarf": "ZK",
 "eposta": "zeynep.kaya@posta.com",
 "yas": 34,
 "cinsiyet": "kadin",
 "boyCm": 165,
 "kiloKg": 72.4,
 "baslangicKiloKg": 79.8,
 "hedefKiloKg": 66,
 "bmi": 26.6,
 "hedef": "kilo-vermek",
 "hedefAd": "Kilo vermek",
 "tempo": "dengeli",
 "tempoAd": "Dengeli · haftada ~0,3 kg",
 "aktivite": "hafif",
 "aktiviteAd": "Hafif aktif",
 "beslenmeTarzi": [
  "dengeli",
  "akdeniz"
 ],
 "beslenmeTarziAd": [
  "Dengeli",
  "Akdeniz tipi"
 ],
 "hassasiyetler": [],
 "hedefKcal": 1650,
 "bazalKcal": 1424,
 "gunlukEnerjiKcal": 1958,
 "makroHedef": {
  "P": 110,
  "K": 165,
  "Y": 60,
  "Lif": 28
 },
 "suHedefMl": 2200,
 "orucProtokolu": "16:8",
 "ilkOgunSaati": "12:00",
 "sonOgunSaati": "20:00",
 "aktifProgram": {
  "slug": "sekiz-saatlik-pencere-dort-hafta",
  "ad": "Sekiz Saatlik Pencere: Dört Hafta",
  "gun": 12,
  "toplamGun": 28,
  "baslangic": "2026-10-26"
 },
 "diyetisyen": "uzm-dyt-nehir-tunali",
 "hedefTarihi": "2027-04-16",
 "seri": 23,
 "uyelik": "Dada Diet Pro"
};

DDV.bugun = {
 "tarih": "2026-11-06",
 "tarihMetin": "Cuma 6 Kasım",
 "simdi": "17:10",
 "selam": "İyi akşamlar, Zeynep",
 "hedefKcal": 1650,
 "tuketilenKcal": 1041,
 "kalanKcal": 609,
 "planliKcal": 551,
 "yakilanKcal": 0,
 "makro": {
  "P": {
   "alinan": 74.4,
   "hedef": 110
  },
  "K": {
   "alinan": 91.4,
   "hedef": 165
  },
  "Y": {
   "alinan": 41.7,
   "hedef": 60
  },
  "Lif": {
   "alinan": 15.7,
   "hedef": 28
  }
 },
 "ogunler": [
  {
   "id": "kahvalti",
   "ad": "Kahvaltı",
   "ikon": "mug-saucer",
   "saat": "12:05",
   "durum": "dolu",
   "kcal": 426,
   "P": 22.5,
   "K": 34.5,
   "Y": 21.0,
   "Lif": 4.3,
   "besinler": [
    {
     "slug": "yumurta-haslanmis",
     "ad": "Yumurta (haşlanmış)",
     "miktar": 1,
     "birim": "adet",
     "gram": 50,
     "kcal": 78,
     "P": 6.3,
     "K": 0.6,
     "Y": 5.3,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/yumurta-haslanmis.webp"
    },
    {
     "slug": "beyaz-peynir-yarim-yagli",
     "ad": "Beyaz Peynir (yarım yağlı)",
     "miktar": 2,
     "birim": "kibrit kutusu",
     "gram": 60,
     "kcal": 121,
     "P": 9.4,
     "K": 7.3,
     "Y": 6.1,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/beyaz-peynir-yarim-yagli.webp"
    },
    {
     "slug": "tam-bugday-ekmegi",
     "ad": "Tam Buğday Ekmeği",
     "miktar": 2,
     "birim": "ince dilim",
     "gram": 50,
     "kcal": 129,
     "P": 5.4,
     "K": 21.9,
     "Y": 1.7,
     "Lif": 2.5,
     "gorsel": "assets/gorsel/besin/tam-bugday-ekmegi.webp"
    },
    {
     "slug": "domates",
     "ad": "Domates",
     "miktar": 0.5,
     "birim": "orta boy",
     "gram": 75,
     "kcal": 14,
     "P": 0.7,
     "K": 2.2,
     "Y": 0.2,
     "Lif": 0.8,
     "gorsel": "assets/gorsel/besin/domates.webp"
    },
    {
     "slug": "salatalik",
     "ad": "Salatalık",
     "miktar": 0.5,
     "birim": "bardak",
     "gram": 75,
     "kcal": 12,
     "P": 0.3,
     "K": 2.1,
     "Y": 0.2,
     "Lif": 0.4,
     "gorsel": "assets/gorsel/besin/salatalik.webp"
    },
    {
     "slug": "siyah-zeytin",
     "ad": "Siyah Zeytin (salamura)",
     "miktar": 5,
     "birim": "adet",
     "gram": 20,
     "kcal": 27,
     "P": 0.4,
     "K": 0.4,
     "Y": 2.5,
     "Lif": 0.6,
     "gorsel": null
    },
    {
     "slug": "zeytinyagi",
     "ad": "Zeytinyağı",
     "miktar": 1,
     "birim": "tatlı kaşığı",
     "gram": 5,
     "kcal": 45,
     "P": 0.0,
     "K": 0.0,
     "Y": 5.0,
     "Lif": 0.0,
     "gorsel": null
    }
   ]
  },
  {
   "id": "ogle",
   "ad": "Öğle Yemeği",
   "ikon": "bowl-food",
   "saat": "14:30",
   "durum": "dolu",
   "kcal": 444,
   "P": 48.3,
   "K": 35.1,
   "Y": 12.3,
   "Lif": 6.8,
   "besinler": [
    {
     "slug": "tavuk-gogsu-izgara",
     "ad": "Tavuk Göğsü (ızgara)",
     "miktar": 1,
     "birim": "porsiyon",
     "gram": 120,
     "kcal": 181,
     "P": 36.6,
     "K": 0.0,
     "Y": 3.8,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/tavuk-gogsu-izgara.webp"
    },
    {
     "slug": "bulgur-pismis",
     "ad": "Bulgur (pişmiş)",
     "miktar": 1,
     "birim": "silme kepçe",
     "gram": 90,
     "kcal": 75,
     "P": 2.8,
     "K": 16.7,
     "Y": 0.2,
     "Lif": 4.0,
     "gorsel": "assets/gorsel/besin/bulgur-pismis.webp"
    },
    {
     "slug": "tam-bugday-ekmegi",
     "ad": "Tam Buğday Ekmeği",
     "miktar": 1,
     "birim": "ince dilim",
     "gram": 25,
     "kcal": 64,
     "P": 2.7,
     "K": 10.9,
     "Y": 0.8,
     "Lif": 1.2,
     "gorsel": "assets/gorsel/besin/tam-bugday-ekmegi.webp"
    },
    {
     "slug": "marul-kivircik",
     "ad": "Marul (kıvırcık)",
     "miktar": 0.5,
     "birim": "büyük kâse",
     "gram": 37.5,
     "kcal": 6,
     "P": 0.3,
     "K": 0.6,
     "Y": 0.1,
     "Lif": 0.8,
     "gorsel": null
    },
    {
     "slug": "domates",
     "ad": "Domates",
     "miktar": 0.5,
     "birim": "orta boy",
     "gram": 75,
     "kcal": 14,
     "P": 0.7,
     "K": 2.2,
     "Y": 0.2,
     "Lif": 0.8,
     "gorsel": "assets/gorsel/besin/domates.webp"
    },
    {
     "slug": "yogurt-yarim-yagli",
     "ad": "Yoğurt (yarım yağlı)",
     "miktar": 0.5,
     "birim": "kupa",
     "gram": 120,
     "kcal": 59,
     "P": 5.2,
     "K": 4.7,
     "Y": 2.2,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/yogurt-yarim-yagli.webp"
    },
    {
     "slug": "zeytinyagi",
     "ad": "Zeytinyağı",
     "miktar": 1,
     "birim": "tatlı kaşığı",
     "gram": 5,
     "kcal": 45,
     "P": 0.0,
     "K": 0.0,
     "Y": 5.0,
     "Lif": 0.0,
     "gorsel": null
    }
   ]
  },
  {
   "id": "ara",
   "ad": "Ara Öğün",
   "ikon": "apple-whole",
   "saat": "16:30",
   "durum": "dolu",
   "kcal": 171,
   "P": 3.6,
   "K": 21.8,
   "Y": 8.4,
   "Lif": 4.6,
   "besinler": [
    {
     "slug": "elma-fuji",
     "ad": "Elma (Fuji)",
     "miktar": 1,
     "birim": "orta boy",
     "gram": 150,
     "kcal": 84,
     "P": 0.4,
     "K": 18.6,
     "Y": 0.9,
     "Lif": 2.7,
     "gorsel": "assets/gorsel/besin/elma-fuji.webp"
    },
    {
     "slug": "badem",
     "ad": "Badem",
     "miktar": 13,
     "birim": "adet",
     "gram": 15,
     "kcal": 87,
     "P": 3.2,
     "K": 3.2,
     "Y": 7.5,
     "Lif": 1.9,
     "gorsel": "assets/gorsel/besin/badem.webp"
    }
   ]
  },
  {
   "id": "aksam",
   "ad": "Akşam Yemeği",
   "ikon": "utensils",
   "saat": "19:30",
   "durum": "planli",
   "kcal": 551,
   "P": 48.6,
   "K": 59.9,
   "Y": 14.5,
   "Lif": 19.5,
   "besinler": [
    {
     "slug": "barbunya-haslanmis",
     "ad": "Barbunya (kuru · haşlanmış)",
     "miktar": 0.75,
     "birim": "kupa",
     "gram": 130,
     "kcal": 177,
     "P": 12.1,
     "K": 31.9,
     "Y": 0.7,
     "Lif": 11.2,
     "gorsel": "assets/gorsel/besin/barbunya-haslanmis.webp"
    },
    {
     "slug": "hindi-gogsu-firinda",
     "ad": "Hindi Göğsü (fırında · derili)",
     "miktar": 1,
     "birim": "el ayası",
     "gram": 80,
     "kcal": 151,
     "P": 23.0,
     "K": 0.0,
     "Y": 5.9,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/hindi-gogsu-firinda.webp"
    },
    {
     "slug": "ispanak-haslanmis",
     "ad": "Ispanak (haşlanmış)",
     "miktar": 1,
     "birim": "kupa",
     "gram": 150,
     "kcal": 34,
     "P": 4.5,
     "K": 5.7,
     "Y": 0.4,
     "Lif": 3.6,
     "gorsel": "assets/gorsel/besin/ispanak-haslanmis.webp"
    },
    {
     "slug": "roka",
     "ad": "Roka",
     "miktar": 0.5,
     "birim": "büyük kâse",
     "gram": 37.5,
     "kcal": 10,
     "P": 1.0,
     "K": 0.9,
     "Y": 0.1,
     "Lif": 0.7,
     "gorsel": "assets/gorsel/besin/roka.webp"
    },
    {
     "slug": "bulgur-pismis",
     "ad": "Bulgur (pişmiş)",
     "miktar": 1,
     "birim": "silme kepçe",
     "gram": 90,
     "kcal": 75,
     "P": 2.8,
     "K": 16.7,
     "Y": 0.2,
     "Lif": 4.0,
     "gorsel": "assets/gorsel/besin/bulgur-pismis.webp"
    },
    {
     "slug": "yogurt-yarim-yagli",
     "ad": "Yoğurt (yarım yağlı)",
     "miktar": 0.5,
     "birim": "kupa",
     "gram": 120,
     "kcal": 59,
     "P": 5.2,
     "K": 4.7,
     "Y": 2.2,
     "Lif": 0.0,
     "gorsel": "assets/gorsel/besin/yogurt-yarim-yagli.webp"
    },
    {
     "slug": "zeytinyagi",
     "ad": "Zeytinyağı",
     "miktar": 1,
     "birim": "tatlı kaşığı",
     "gram": 5,
     "kcal": 45,
     "P": 0.0,
     "K": 0.0,
     "Y": 5.0,
     "Lif": 0.0,
     "gorsel": null
    }
   ],
   "kaynak": "Sekiz Saatlik Pencere: Dört Hafta · 12. gün"
  }
 ],
 "su": {
  "icilenMl": 1250,
  "hedefMl": 2200,
  "adimlar": [
   {
    "ml": 200,
    "metin": "1 su bardağı (200 ml)"
   },
   {
    "ml": 500,
    "metin": "+500 ml"
   }
  ],
  "kayitlar": [
   {
    "saat": "09:10",
    "ml": 250
   },
   {
    "saat": "11:00",
    "ml": 250
   },
   {
    "saat": "12:20",
    "ml": 250
   },
   {
    "saat": "14:40",
    "ml": 250
   },
   {
    "saat": "16:35",
    "ml": 250
   }
  ]
 },
 "duygu": {
  "soru": "Kendini nasıl hissediyorsun?",
  "secili": "iyi",
  "secenekler": [
   {"id": "iyi", "ad": "İyi", "ikon": "face-smile", "not": "Güzel gidiyor, suyunu da unutma."},
   {"id": "normal", "ad": "Normal", "ikon": "face-meh", "not": "Küçük adımlar yeter, tabağını çekmeye ne dersin?"},
   {"id": "yorgun", "ad": "Yorgun", "ikon": "face-tired", "uyari": "dikkat"},
   {"id": "bitkin", "ad": "Bitkin", "ikon": "face-frown", "uyari": "dikkat"},
   {"id": "halsiz", "ad": "Halsiz", "ikon": "face-meh-blank", "uyari": "dikkat"},
   {"id": "bas-donmesi", "ad": "Baş dönmesi", "ikon": "face-dizzy", "uyari": "acil"},
   {"id": "carpinti", "ad": "Çarpıntı", "ikon": "heart-pulse", "uyari": "acil"}
  ],
  "uyarilar": {
   "dikkat": {"baslik": "Bedenini dinle", "metin": "Bu belirtiler sürüyorsa diyete ara ver ve bir diyetisyen ya da hekime danış."},
   "acil": {"baslik": "Önemli uyarı", "metin": "Diyete devam etme, bir hekime başvur."}
  }
 }
};

DDV.gecmis = [
{
"tarih": "2026-10-24",
"gun": "Cmt",
"kcal": 1612,
"suMl": 2000,
"duygu": "iyi",
"kiloKg": 73.2,
"belCm": 86.6,
"yagYuzde": 34.2
},
{
"tarih": "2026-10-25",
"gun": "Paz",
"kcal": 1588,
"suMl": 2250,
"duygu": "normal",
"kiloKg": 73.1,
"belCm": 86.6,
"yagYuzde": 34.2
},
{
"tarih": "2026-10-26",
"gun": "Pzt",
"kcal": 1705,
"suMl": 1750,
"duygu": "yorgun",
"kiloKg": 73.2,
"belCm": 86.5,
"yagYuzde": 34.1
},
{
"tarih": "2026-10-27",
"gun": "Sal",
"kcal": 1540,
"suMl": 2200,
"duygu": "iyi",
"kiloKg": 73.0,
"belCm": 86.5,
"yagYuzde": 34.1
},
{
"tarih": "2026-10-28",
"gun": "Çar",
"kcal": 1633,
"suMl": 2000,
"duygu": "normal",
"kiloKg": 73.0,
"belCm": 86.4,
"yagYuzde": 34.0
},
{
"tarih": "2026-10-29",
"gun": "Per",
"kcal": 1660,
"suMl": 2500,
"duygu": "iyi",
"kiloKg": 72.9,
"belCm": 86.3,
"yagYuzde": 34.0
},
{
"tarih": "2026-10-30",
"gun": "Cum",
"kcal": 1721,
"suMl": 1750,
"duygu": "bitkin",
"kiloKg": 72.9,
"belCm": 86.3,
"yagYuzde": 33.9
},
{
"tarih": "2026-10-31",
"gun": "Cmt",
"kcal": 1596,
"suMl": 2250,
"duygu": "normal",
"kiloKg": 72.8,
"belCm": 86.2,
"yagYuzde": 33.9
},
{
"tarih": "2026-11-01",
"gun": "Paz",
"kcal": 1648,
"suMl": 2200,
"duygu": "iyi",
"kiloKg": 72.8,
"belCm": 86.2,
"yagYuzde": 33.8
},
{
"tarih": "2026-11-02",
"gun": "Pzt",
"kcal": 1574,
"suMl": 2000,
"duygu": "yorgun",
"kiloKg": 72.7,
"belCm": 86.1,
"yagYuzde": 33.8
},
{
"tarih": "2026-11-03",
"gun": "Sal",
"kcal": 1619,
"suMl": 2250,
"duygu": "normal",
"kiloKg": 72.6,
"belCm": 86.0,
"yagYuzde": 33.7
},
{
"tarih": "2026-11-04",
"gun": "Çar",
"kcal": 1702,
"suMl": 1900,
"duygu": "iyi",
"kiloKg": 72.6,
"belCm": 86.0,
"yagYuzde": 33.7
},
{
"tarih": "2026-11-05",
"gun": "Per",
"kcal": 1638,
"suMl": 2200,
"duygu": "iyi",
"kiloKg": 72.5,
"belCm": 85.9,
"yagYuzde": 33.6
},
{
"tarih": "2026-11-06",
"gun": "Cum",
"kcal": 1041,
"suMl": 1250,
"duygu": "iyi",
"kiloKg": 72.4,
"belCm": 85.8,
"yagYuzde": 33.6
}
];
