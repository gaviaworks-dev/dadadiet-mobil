/* veri/diyetisyenler.js — 7 profilin tamamı kurgusaldır: ad, soyad, slug ve deneyim yılı gerçek kişilere ait değildir.
 * Ünvan, uzmanlık, şehir ve görüşme türü dağılımı canlı /diyetisyenler listesinden alınmıştır (6 Kasım 2026, GET).
 * puan:null, yorumSayisi:0, cinsiyet:null. paketler[].fiyat, sohbet ve notlar kaynaksız kurgudur.
 * DDV.diyetisyenler[]: { slug, ad, kisaAd, unvan, harf, uzmanliklar[], sehir, gorusme, gorusmeTurleri[], deneyimYil, dogrulandi, cinsiyet, puan, yorumSayisi, puanMetni, profilMetni,
 *   paketler:[{ id ('tek'|'1ay'|'3ay'), ad, seans, sure, fiyat (TL), kapsam[], rozet? }] }
 * DDV.diyetisyenFiltreleri: { uzmanlik[], gorusme[], sehir[], siralama[] } (canlıdaki liste)
 * DDV.benimDiyetisyenim: { diyetisyen (slug), paket, sonrakiRandevu:{tarih,tarihMetin,saat,iso,sureDk,tur,baslik,konu,katilAcilisDk}, gecmisRandevular[],
 *   haftalikMenu:{program,programAd,hafta,gunler:[{gun,etiket,baslik,kcal,bugun,ogunler[]}]}, sohbet:{sifreli,sifreMetni,cevrimici,mesajlar:[{id,kim ('ben'|'diyetisyen'),saat,metin,ek?}]}, notlar:[{tarih,tarihMetin,baslik,metin}] }
 * DDV.eslesmeSorulari: { baslik, altMetin, sorular:[{no,ad,alt,alan,soru,altMetin,secenekler:[{deger,ad,alt,ikon}]}], kural, gevsetmeNotu, not } — canlı /diyetisyen-bul.
 */
window.DDV = window.DDV || {};
DDV.diyetisyenler = [
 {
  "slug": "uzm-dyt-nehir-tunali",
  "ad": "Uzm. Dyt. Nehir Tunalı",
  "kisaAd": "Nehir Tunalı",
  "unvan": "Uzman Diyetisyen",
  "harf": "N",
  "uzmanliklar": [
   "Hormonal Denge & PCOS",
   "Kilo Yönetimi"
  ],
  "sehir": "Ankara",
  "gorusme": "Online & Yüz yüze",
  "gorusmeTurleri": [
   "Online",
   "Yüz yüze"
  ],
  "deneyimYil": 7,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Uzm. Dyt. Nehir Tunalı, Hormonal Denge & PCOS ve Kilo Yönetimi alanlarında çalışıyor. Ankara'da online ve yüz yüze görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1450,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 5200,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 13900,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "uzm-dyt-lale-erkmen",
  "ad": "Uzm. Dyt. Lale Erkmen",
  "kisaAd": "Lale Erkmen",
  "unvan": "Uzman Diyetisyen",
  "harf": "L",
  "uzmanliklar": [
   "Hormonal Denge & PCOS",
   "Kilo Yönetimi"
  ],
  "sehir": "İstanbul",
  "gorusme": "Online & Yüz yüze",
  "gorusmeTurleri": [
   "Online",
   "Yüz yüze"
  ],
  "deneyimYil": 12,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Uzm. Dyt. Lale Erkmen, Hormonal Denge & PCOS ve Kilo Yönetimi alanlarında çalışıyor. İstanbul'da online ve yüz yüze görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1550,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 5600,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 14900,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "uzm-dyt-pelin-ardic",
  "ad": "Uzm. Dyt. Pelin Ardıç",
  "kisaAd": "Pelin Ardıç",
  "unvan": "Uzman Diyetisyen",
  "harf": "P",
  "uzmanliklar": [
   "Gebelik & Emzirme",
   "Geriatri Beslenmesi"
  ],
  "sehir": "İzmir",
  "gorusme": "Online & Yüz yüze",
  "gorusmeTurleri": [
   "Online",
   "Yüz yüze"
  ],
  "deneyimYil": 5,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Uzm. Dyt. Pelin Ardıç, Gebelik & Emzirme ve Geriatri Beslenmesi alanlarında çalışıyor. İzmir'de online ve yüz yüze görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1450,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 5200,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 13900,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "dyt-ceren-soylu",
  "ad": "Dyt. Ceren Soylu",
  "kisaAd": "Ceren Soylu",
  "unvan": "Diyetisyen",
  "harf": "C",
  "uzmanliklar": [
   "Kilo Yönetimi",
   "Sporcu Beslenmesi"
  ],
  "sehir": "İstanbul",
  "gorusme": "Online & Yüz yüze",
  "gorusmeTurleri": [
   "Online",
   "Yüz yüze"
  ],
  "deneyimYil": 3,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Dyt. Ceren Soylu, Kilo Yönetimi ve Sporcu Beslenmesi alanlarında çalışıyor. İstanbul'da online ve yüz yüze görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 950,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 3400,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 9100,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "dyt-alp-karatas",
  "ad": "Dyt. Alp Karataş",
  "kisaAd": "Alp Karataş",
  "unvan": "Diyetisyen",
  "harf": "A",
  "uzmanliklar": [
   "Kilo Yönetimi",
   "Sporcu Beslenmesi"
  ],
  "sehir": "Ankara",
  "gorusme": "Online",
  "gorusmeTurleri": [
   "Online"
  ],
  "deneyimYil": 6,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Dyt. Alp Karataş, Kilo Yönetimi ve Sporcu Beslenmesi alanlarında çalışıyor. Ankara'da online görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1000,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 3600,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 9600,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "dyt-onur-sezer",
  "ad": "Dyt. Onur Sezer",
  "kisaAd": "Onur Sezer",
  "unvan": "Diyetisyen",
  "harf": "O",
  "uzmanliklar": [
   "Kilo Yönetimi"
  ],
  "sehir": "İzmir",
  "gorusme": "Online",
  "gorusmeTurleri": [
   "Online"
  ],
  "deneyimYil": 8,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Dyt. Onur Sezer, Kilo Yönetimi alanında çalışıyor. İzmir'de online görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1050,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 3800,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 10100,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 },
 {
  "slug": "dyt-melis-guven",
  "ad": "Dyt. Melis Güven",
  "kisaAd": "Melis Güven",
  "unvan": "Diyetisyen",
  "harf": "M",
  "uzmanliklar": [
   "Bağırsak Sağlığı"
  ],
  "sehir": "Ankara",
  "gorusme": "Online",
  "gorusmeTurleri": [
   "Online"
  ],
  "deneyimYil": 10,
  "dogrulandi": true,
  "cinsiyet": null,
  "puan": null,
  "yorumSayisi": 0,
  "puanMetni": "Henüz değerlendirme yok",
  "profilMetni": "Dyt. Melis Güven, Bağırsak Sağlığı alanında çalışıyor. Ankara'da online görüşme yapıyor.",
  "paketler": [
   {
    "id": "tek",
    "ad": "Tek seans",
    "seans": 1,
    "sure": "45 dk",
    "fiyat": 1050,
    "kapsam": [
     "Beslenme öyküsü ve hedef görüşmesi",
     "Görüşme sonrası kısa not"
    ]
   },
   {
    "id": "1ay",
    "ad": "1 ay",
    "seans": 4,
    "sure": "Haftada 1 görüşme",
    "fiyat": 3800,
    "kapsam": [
     "4 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma"
    ],
    "rozet": "En çok tercih edilen"
   },
   {
    "id": "3ay",
    "ad": "3 ay",
    "seans": 12,
    "sure": "Haftada 1 görüşme",
    "fiyat": 10100,
    "kapsam": [
     "12 görüşme",
     "Haftalık menü",
     "Şifreli mesajlaşma",
     "Tahlil ve ölçü takibi"
    ]
   }
  ]
 }
];

DDV.diyetisyenFiltreleri = {
 "uzmanlik": [
  "Kilo Yönetimi",
  "Sporcu Beslenmesi",
  "Çocuk & Ergen Beslenmesi",
  "Gebelik & Emzirme",
  "Klinik / Hastalık Beslenmesi",
  "Bağırsak Sağlığı",
  "Hormonal Denge & PCOS",
  "Vejetaryen & Vegan",
  "İnsülin Direnci & Diyabet",
  "Yeme Davranışı",
  "Geriatri Beslenmesi",
  "Onkoloji Beslenmesi"
 ],
 "gorusme": [
  "Online",
  "Yüz yüze"
 ],
 "sehir": [
  "Ankara",
  "İstanbul",
  "İzmir"
 ],
 "siralama": [
  "Önerilen",
  "En Yüksek Puan",
  "En Çok Değerlendirme",
  "En Uygun Fiyat",
  "En Deneyimli"
 ]
};

DDV.benimDiyetisyenim = {
 "diyetisyen": "uzm-dyt-nehir-tunali",
 "paket": {
  "id": "3ay",
  "ad": "3 ay",
  "kalanSeans": 7,
  "bitis": "2027-01-22"
 },
 "sonrakiRandevu": {
  "tarih": "2026-11-10",
  "tarihMetin": "Salı 10 Kasım",
  "saat": "18:30",
  "iso": "2026-11-10T18:30:00+03:00",
  "sureDk": 45,
  "tur": "Online",
  "baslik": "Haftalık takip görüşmesi",
  "konu": "Kilo ve bel ölçüsü, su hedefi, bu haftanın menüsü",
  "katilAcilisDk": 10
 },
 "gecmisRandevular": [
  {
   "tarih": "2026-11-03",
   "tarihMetin": "Salı 3 Kasım",
   "saat": "18:30",
   "tur": "Online",
   "durum": "Tamamlandı"
  },
  {
   "tarih": "2026-10-27",
   "tarihMetin": "Salı 27 Ekim",
   "saat": "18:30",
   "tur": "Online",
   "durum": "Tamamlandı"
  },
  {
   "tarih": "2026-10-20",
   "tarihMetin": "Salı 20 Ekim",
   "saat": "18:30",
   "tur": "Online",
   "durum": "Tamamlandı"
  }
 ],
 "haftalikMenu": {
  "program": "sekiz-saatlik-pencere-dort-hafta",
  "programAd": "Sekiz Saatlik Pencere: Dört Hafta",
  "hafta": 2,
  "gunler": [
   {
    "gun": 8,
    "etiket": "Pzt",
    "baslik": "nohut ve tavuk, pırasa",
    "kcal": 1832,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 585,
      "kalemler": [
       "Yumurta (haşlanmış) 1 küçük boy (50 g)",
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Elma (Fuji) 1 orta boy (150 g)",
       "Ceviz (iç) 5-7 yarım (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 311,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Portakal (Valensiya) 75 g",
       "Üzüm (renkli) 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 937,
      "kalemler": [
       "Nohut (haşlanmış) ¾ kupa (130 g)",
       "Tavuk Göğsü (ızgara) 1 el ayası kadar (80 g)",
       "Pırasa (çiğ) 1 kupa, doğranmış (150 g)",
       "Roka ½ büyük kase (37,5 g)",
       "Bulgur (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 4 tatlı kaşığı (20 g)"
      ]
     }
    ]
   },
   {
    "gun": 9,
    "etiket": "Sal",
    "baslik": "ızgara balık, lahana",
    "kcal": 1560,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 559,
      "kalemler": [
       "Yumurta (haşlanmış) 1 küçük boy (50 g)",
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Portakal (Valensiya) 1 orta boy (150 g)",
       "Badem 12-13 adet (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 293,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Muz (Anamur) 50 g",
       "Şeftali 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 707,
      "kalemler": [
       "Mezgit (ızgara) 1 el ayası büyüklüğünde kalın bir dilim (150 g)",
       "Beyaz Lahana (haşlanmış) 1 kupa (150 g)",
       "Marul (kıvırcık) ½ büyük kase (37,5 g)",
       "Esmer Pirinç (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 3 tatlı kaşığı (15 g)"
      ]
     }
    ]
   },
   {
    "gun": 10,
    "etiket": "Çar",
    "baslik": "kuru fasulye ve kuşbaşı, bamya",
    "kcal": 1757,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 572,
      "kalemler": [
       "Yumurta (haşlanmış) 1 küçük boy (50 g)",
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Muz (Anamur) 1 el uzunluğu (100 g)",
       "Fındık (çiğ · iç) 14-15 adet (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 308,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Kivi 75 g",
       "Mandalina (Klemantin) 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 878,
      "kalemler": [
       "Kuru Fasulye (beyaz · haşlanmış) ¾ kupa (130 g)",
       "Dana Kuşbaşı (haşlanmış) 1 el ayası kadar (80 g)",
       "Bamya (haşlanmış) 1 kupa (150 g)",
       "Roka ½ büyük kase (37,5 g)",
       "Bulgur (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 4 tatlı kaşığı (20 g)"
      ]
     }
    ]
   },
   {
    "gun": 11,
    "etiket": "Per",
    "baslik": "fırında tavuk, mantar",
    "kcal": 1580,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 501,
      "kalemler": [
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Kivi 2 orta boy (150 g)",
       "Yer Fıstığı 13-15 adet (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 311,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Üzüm (renkli) 75 g",
       "Mandalina (Klemantin) 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 767,
      "kalemler": [
       "Tavuk Göğsü (ızgara) 120 g",
       "Kültür Mantarı (haşlanmış) 1 kupa (150 g)",
       "Marul (kıvırcık) ½ büyük kase (37,5 g)",
       "Esmer Pirinç (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 4 tatlı kaşığı (20 g)"
      ]
     }
    ]
   },
   {
    "gun": 12,
    "etiket": "Cum",
    "baslik": "barbunya ve hindi, ıspanak",
    "kcal": 1772,
    "bugun": true,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 603,
      "kalemler": [
       "Yumurta (haşlanmış) 1 küçük boy (50 g)",
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Üzüm (renkli) 1 küçük kase (150 g)",
       "Ceviz (iç) 5-7 yarım (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 296,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Şeftali 75 g",
       "Elma (Fuji) 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 874,
      "kalemler": [
       "Barbunya (kuru · haşlanmış) ¾ kupa (130 g)",
       "Hindi Göğsü (fırında · derili) 1 el ayası kadar (80 g)",
       "Ispanak (haşlanmış) 1 kupa (150 g)",
       "Roka ½ büyük kase (37,5 g)",
       "Bulgur (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 4 tatlı kaşığı (20 g)"
      ]
     }
    ]
   },
   {
    "gun": 13,
    "etiket": "Cmt",
    "baslik": "yağlı balık, kabak",
    "kcal": 1580,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 547,
      "kalemler": [
       "Yumurta (haşlanmış) 1 küçük boy (50 g)",
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Şeftali 1 orta boy (150 g)",
       "Badem 12-13 adet (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 297,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Mandalina (Klemantin) 75 g",
       "Portakal (Valensiya) 75 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 736,
      "kalemler": [
       "Alabalık (gökkuşağı · çiftlik · ızgara) 1 el ayası büyüklüğünde kalın bir dilim (150 g)",
       "Kabak (yazlık · haşlanmış) 1 kupa (150 g)",
       "Marul (kıvırcık) ½ büyük kase (37,5 g)",
       "Esmer Pirinç (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 2 tatlı kaşığı (10 g)"
      ]
     }
    ]
   },
   {
    "gun": 14,
    "etiket": "Paz",
    "baslik": "hindi köfte, karnabahar",
    "kcal": 1509,
    "bugun": false,
    "ogunler": [
     {
      "ad": "Kahvaltı",
      "saat": "12:00",
      "kcal": 510,
      "kalemler": [
       "Beyaz Peynir (yarım yağlı) 2 kibrit kutusu (60 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Domates ½ orta boy (75 g)",
       "Salatalık ½ kupa, doğranmış (75 g)",
       "Kivi 2 orta boy (150 g)",
       "Fındık (çiğ · iç) 14-15 adet (15 g)",
       "Zeytinyağı 1 tatlı kaşığı (5 g)"
      ]
     },
     {
      "ad": "Ara Öğün",
      "saat": "15:30",
      "kcal": 300,
      "kalemler": [
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Yulaf (beyaz) ¼ kupa (30 g)",
       "Mandalina (Klemantin) 75 g",
       "Muz (Anamur) 50 g"
      ]
     },
     {
      "ad": "Akşam Yemeği",
      "saat": "19:30",
      "kcal": 699,
      "kalemler": [
       "Hindi Kıyma (pişmiş) 120 g",
       "Karnabahar (haşlanmış) 1 kupa (150 g)",
       "Roka ½ büyük kase (37,5 g)",
       "Bulgur (pişmiş) 1 silme orta kepçe (90 g)",
       "Yoğurt (yarım yağlı) 1 kupa (240 g)",
       "Tam Buğday Ekmeği 2 ince dilim (50 g)",
       "Zeytinyağı 2 tatlı kaşığı (10 g)"
      ]
     }
    ]
   }
  ]
 },
 "sohbet": {
  "sifreli": true,
  "sifreMetni": "Mesajlar uçtan uca şifreli",
  "cevrimici": true,
  "mesajlar": [
   {
    "id": 1,
    "kim": "diyetisyen",
    "saat": "Salı 19:20",
    "metin": "Görüşme için teşekkürler Zeynep. Haftalık menünü güncelledim, ara öğünde yoğurdu yarım kupaya indirdim."
   },
   {
    "id": 2,
    "kim": "ben",
    "saat": "Salı 19:34",
    "metin": "Teşekkürler, gördüm. Akşam yemeğini 19:30'a çekmek zor olursa ne yapayım?"
   },
   {
    "id": 3,
    "kim": "diyetisyen",
    "saat": "Salı 19:41",
    "metin": "Yarım saat kayması sorun değil. Pencereyi 20:00'de kapatman yeterli; akşamı biraz hafif tutarsın."
   },
   {
    "id": 4,
    "kim": "ben",
    "saat": "Çarşamba 12:18",
    "metin": "Dün pencere bitmeden yemeği bitirdim, bugün 12:00'de başladım."
   },
   {
    "id": 5,
    "kim": "diyetisyen",
    "saat": "Çarşamba 12:40",
    "metin": "Çok güzel. Su tarafı nasıl gidiyor?"
   },
   {
    "id": 6,
    "kim": "ben",
    "saat": "Çarşamba 12:44",
    "metin": "Öğleden sonra unutuyorum, 1,5 litrede kalıyorum."
   },
   {
    "id": 7,
    "kim": "diyetisyen",
    "saat": "Çarşamba 12:52",
    "metin": "Su hatırlatmasını 15:00 ve 17:00'ye ekleyelim. Masanda dolu bir şişe durursa daha kolay oluyor."
   },
   {
    "id": 8,
    "kim": "ben",
    "saat": "Perşembe 21:06",
    "metin": "Cumartesi akşamı dışarıda yemek var, lokantada ne seçeyim?"
   },
   {
    "id": 9,
    "kim": "diyetisyen",
    "saat": "Perşembe 21:15",
    "metin": "Izgara ya da buğulama bir protein, yanına salata iyi olur. Dışarıda Ne Yesem ekranında menüyü okutabilirsin, seçimini bana da yazarsın."
   },
   {
    "id": 10,
    "kim": "diyetisyen",
    "saat": "Bugün 10:02",
    "metin": "Gelecek haftanın menüsünü pazar akşamı dosyana ekleyeceğim. Salı görüşmesinde su hedefini konuşalım.",
    "ek": {
     "tur": "menu",
     "ad": "Haftalık menü · 2. hafta"
    }
   }
  ]
 },
 "notlar": [
  {
   "tarih": "2026-11-03",
   "tarihMetin": "3 Kasım 2026",
   "baslik": "Haftalık değerlendirme",
   "metin": "Bu hafta kilo ve bel ölçüsünde düzenli düşüş var. Protein hedefine yaklaşıyorsun; akşam öğününde baklagil ve yoğurdu birlikte tutmaya devam."
  },
  {
   "tarih": "2026-10-20",
   "tarihMetin": "20 Ekim 2026",
   "baslik": "Su hedefi",
   "metin": "Öğleden sonra su alımı düşüyor. Hedefi 2,2 litrede bırakıyoruz, hatırlatmaları 15:00 ve 17:00 olarak ekledik."
  },
  {
   "tarih": "2026-09-22",
   "tarihMetin": "22 Eylül 2026",
   "baslik": "Tahlil görüşmesi",
   "metin": "D vitamini referansın altında. Hekiminle görüşmeni rica ettim; beslenmede yağlı balık ve süt ürünlerini haftaya yaydık."
  }
 ]
};

DDV.eslesmeSorulari = {
 "baslik": "Sana uygun uzmanı bul",
 "altMetin": "Hedefini ve görüşme tercihini seç; uzmanlar arasından sana uygun olanları listeleyelim.",
 "sorular": [
  {
   "no": 1,
   "ad": "Hedefin",
   "alt": "Ne için destek?",
   "alan": "goal",
   "soru": "Hangi konuda destek arıyorsun?",
   "altMetin": "Sana en uygun uzmanlık alanını eşleştirelim.",
   "secenekler": [
    {
     "deger": "Kilo Yönetimi",
     "ad": "Kilo Yönetimi",
     "alt": "Sağlıklı kiloya ulaş, koru",
     "ikon": "weight-scale"
    },
    {
     "deger": "Sporcu Beslenmesi",
     "ad": "Sporcu Beslenmesi",
     "alt": "Performans ve toparlanma",
     "ikon": "person-running"
    },
    {
     "deger": "Çocuk & Ergen Beslenmesi",
     "ad": "Çocuk & Aile",
     "alt": "Çocuk ve ergen beslenmesi",
     "ikon": "children"
    },
    {
     "deger": "Gebelik & Emzirme",
     "ad": "Gebelik & Emzirme",
     "alt": "Anne ve bebek sağlığı",
     "ikon": "baby"
    },
    {
     "deger": "Klinik / Hastalık Beslenmesi",
     "ad": "Klinik & Hastalık",
     "alt": "Diyabet, kalp, tansiyon",
     "ikon": "heart-pulse"
    },
    {
     "deger": "Bağırsak Sağlığı",
     "ad": "Bağırsak Sağlığı",
     "alt": "Sindirim, FODMAP, şişkinlik",
     "ikon": "seedling"
    },
    {
     "deger": "Hormonal Denge & PCOS",
     "ad": "Hormonal Denge & PCOS",
     "alt": "Hormonal dengeyi destekle",
     "ikon": "venus"
    },
    {
     "deger": "Vejetaryen & Vegan",
     "ad": "Vejetaryen & Vegan",
     "alt": "Bitkisel beslenme düzeni",
     "ikon": "leaf"
    }
   ]
  },
  {
   "no": 2,
   "ad": "Görüşme",
   "alt": "Nasıl görüşürsün?",
   "alan": "mode",
   "soru": "Nasıl görüşmek istersin?",
   "altMetin": "Uzmanla nasıl buluşacağını seç.",
   "secenekler": [
    {
     "deger": "Online",
     "ad": "Online",
     "alt": "Görüntülü, her yerden",
     "ikon": "video"
    },
    {
     "deger": "Yüz yüze",
     "ad": "Yüz yüze",
     "alt": "Uzmanın ofisinde",
     "ikon": "location-dot"
    },
    {
     "deger": "farketmez",
     "ad": "Fark etmez",
     "alt": "İkisi de olur",
     "ikon": "shuffle"
    }
   ]
  },
  {
   "no": 3,
   "ad": "Tercih",
   "alt": "Uzman tercihin",
   "alan": "gender",
   "soru": "Uzman tercihin var mı?",
   "altMetin": "İstersen atla; sana en uygun uzmanı öneririz.",
   "secenekler": [
    {
     "deger": "kadin",
     "ad": "Kadın",
     "alt": "Kadın diyetisyen",
     "ikon": "venus"
    },
    {
     "deger": "erkek",
     "ad": "Erkek",
     "alt": "Erkek diyetisyen",
     "ikon": "mars"
    },
    {
     "deger": "farketmez",
     "ad": "Fark etmez",
     "alt": "En uygun uzman",
     "ikon": "user-check"
    }
   ]
  }
 ],
 "kural": {
  "enCokSonuc": 4,
  "gevsetmeEsigi": 2,
  "sira": [
   "gender",
   "mode",
   "goal"
  ],
  "aciklama": "Önce hedef + görüşme + cinsiyet süzülür. Sonuç 2'den azsa cinsiyet, sonra görüşme, sonra hedef gevşer. En çok 4 uzman gösterilir. Profillerde cinsiyet alanı doğrulanmadığı için Kadın/Erkek seçiminde gevşetilmiş sonuç notu gösterilir."
 },
 "gevsetmeNotu": "Seçimine birebir uyan uzman az olduğundan, sana en yakın uzmanları da ekledik.",
 "not": "Bu sihirbaz seni uygun uzmanla buluşturmak için bir yönlendirmedir; tıbbi teşhis ya da tedavi sağlamaz. Gebelik, kronik hastalık veya düzenli ilaç kullanımı varsa bir plana başlamadan önce diyetisyenine ve hekimine danış."
};
