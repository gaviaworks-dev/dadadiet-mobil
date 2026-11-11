/* veri/disarida.js: Dışarıda Ne Yesem? mekân keşfi (#/disarida). DDV.ai.disarida (menü fotoğrafından tabak önerisi) ayrıdır, ona dokunulmaz.
 * Kaynak: dadadiet-prototip _src/veri/disarida.json (üretim 2026-11-07; mekan bilgileri dadagourmet.com yayınından) ve _src/sayfalar/public-beslenme/disarida.mjs (REHBER, Gourmet bağlantısı, metinler).
 * DDV.disaridaKesif: { uretim, sayaclar{mekan, sehir, mutfak}, kaynak, gourmet (mekan sayfası kökü; + slug), bas{etiket, baslik, alt, sayac[[anahtar, etiket]] (web bandı; Gourmet geneli. Ekran kubbe sayılarını mekanlar[]'dan üretir, bu alanı göstermez)},
 *   konseptBaslik, konseptler[{deger, etiket, ikon}], mesafe{min, max, adim} (web mesafe kaydırıcısı; mobilde kullanılmaz). mesafeKm: web verisindeki sabit noktaya mesafe; mobil yakınlık sıralaması bunu kullanır,
 *   mekanlar[{slug, ad, kategori, fiyat, il, ilce, ozet, gorsel, puan (null: değerlendirme yok), goruntulenme, konsept[], mesafeKm, enlem, boylam,
 *     suzgec{il, ilce, semt, kategori[], konsept[], mutfak[], vesile[], fiyat[], puan[], hizmet[], beslenme[], ulasim[], acik[], seckiler[]}, saatler{1..7 (Pzt..Paz): [[aç, kapan]]}, ornekYemekler[]}],
 *   konum{iller[{deger, etiket}], ilceler{il: [{deger, etiket}]}, semtler{ilce: [{deger, etiket}]}} (ülke listesi taşınmadı: yalnız Türkiye),
 *   gruplar[{anahtar, baslik, ikon, secenekler[{deger, etiket, ek?, yildiz?}]}] (Gourmet süzgeç grupları, web sırası),
 *   yemekler[{ad, mutfaklar[], mutfakSlug[], porsiyon{ad, gram}, kcal, P, K, Y, ipucu, diyetEtiketleri[], alerjenler[], besinSlug (DDV.besinler), tahmini}], yemekNotu (web metni; ekranda iç not kuralı için "örnekler" sözcüğü çıkarıldı),
 *   rehberBaslik, rehberler[] (DDV.rehber slug'ları; ekran başlığı DDV.rehber'den okur), rehberWebBasliklar[] (web'in 6 başlığı: ayrı sayfaları yok, web'de hepsi dengeli tabak rehberine gider; ekranda gösterilmez), bos{baslik, metin, eylem}, yakinim{etiket, basari, hata} (basari: web toast metni; mobilde izin sonrası mesafeKm'ye göre sıralanınca gösterilir), bilgiNotu }
 * Mekan görselleri web'deki assets/img/mekan/<slug>.webp dosyalarıdır; mobilde assets/gorsel/mekan/ altına kopyalanmaları gerekir.
 */
window.DDV = window.DDV || {};
DDV.disaridaKesif = {
 "uretim": "2026-11-07",
 "sayaclar": {
  "mekan": 203,
  "sehir": 15,
  "mutfak": 18
 },
 "kaynak": "Mekan bilgileri, puan ve görüntülenme dadagourmet.com/mekanlar, /mekan/<slug> ve /mekanlar/harita-verisi yayınından okundu (2026-11-07). 203 mekanın hiçbirinde onaylı değerlendirme yok.",
 "gourmet": "https://dadagourmet.com/mekan/",
 "bas": {
  "etiket": "Restoran ve menü navigatörü",
  "baslik": "Dışarıda ne yesem?",
  "alt": "Dada Gourmet mekanlarını şehre, mutfağa ve beslenme seçeneklerine göre süz; seçtiğin mekanın detayını Dada Gourmet'te aç.",
  "sayac": [
   [
    "mekan",
    "Dada Gourmet mekanı"
   ],
   [
    "sehir",
    "şehirde mekan"
   ],
   [
    "mutfak",
    "mutfak türü"
   ]
  ]
 },
 "konseptBaslik": "Beslenme konseptine göre keşfet",
 "konseptler": [
  {
   "deger": "hafif-fit",
   "etiket": "Hafif & Fit",
   "ikon": "feather-pointed"
  },
  {
   "deger": "salata-bar",
   "etiket": "Salata Bar",
   "ikon": "bowl-food"
  },
  {
   "deger": "vegan-vejetaryen",
   "etiket": "Vegan & Vejetaryen",
   "ikon": "seedling"
  },
  {
   "deger": "glutensiz",
   "etiket": "Glütensiz",
   "ikon": "wheat-awn-circle-exclamation"
  },
  {
   "deger": "protein-agirlikli",
   "etiket": "Protein Ağırlıklı",
   "ikon": "drumstick-bite"
  },
  {
   "deger": "kahvalti",
   "etiket": "Kahvaltı",
   "ikon": "mug-hot"
  },
  {
   "deger": "deniz-urunleri",
   "etiket": "Deniz Ürünleri",
   "ikon": "fish"
  },
  {
   "deger": "ev-yemegi",
   "etiket": "Ev Yemeği",
   "ikon": "house-chimney"
  }
 ],
 "mesafe": {
  "min": 1,
  "max": 50,
  "adim": 1
 },
 "mekanlar": [
  {
   "slug": "sultanahmet-360-panorama",
   "ad": "Sultanahmet 360 Panorama Restaurant",
   "kategori": "Otel Restoranı",
   "fiyat": "₺₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "The And Hotel’in terasındaki Sultanahmet 360 Panorama, Ayasofya çevresine bakan bir yemek noktası.",
   "gorsel": "assets/gorsel/mekan/sultanahmet-360-panorama.webp",
   "puan": null,
   "goruntulenme": 14,
   "konsept": [
    "hafif-fit",
    "protein-agirlikli"
   ],
   "mesafeKm": 1.2,
   "enlem": 41.0090292,
   "boylam": 28.9774722,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.alemdar",
    "kategori": [
     "otel-restorani"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "turk-mutfagi"
    ],
    "vesile": [
     "turistik-kesif",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras"
    ],
    "beslenme": [],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "11:00",
      "01:00"
     ]
    ],
    "2": [
     [
      "11:00",
      "01:00"
     ]
    ],
    "3": [
     [
      "11:00",
      "01:00"
     ]
    ],
    "4": [
     [
      "11:00",
      "01:00"
     ]
    ],
    "5": [
     [
      "11:00",
      "01:30"
     ]
    ],
    "6": [
     [
      "11:00",
      "01:30"
     ]
    ],
    "7": [
     [
      "11:00",
      "01:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı"
   ]
  },
  {
   "slug": "zeugma-terrace-steak-house",
   "ad": "Zeugma Terrace Steak House",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Zeugma Terrace, Sultanahmet’te et yemeklerini tarihî yarımadaya bakan bir terasta sunuyor.",
   "gorsel": "assets/gorsel/mekan/zeugma-terrace-steak-house.webp",
   "puan": null,
   "goruntulenme": 16,
   "konsept": [
    "protein-agirlikli",
    "vegan-vejetaryen"
   ],
   "mesafeKm": 1.6,
   "enlem": 41.0094886,
   "boylam": 28.976893,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.alemdar",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "kebap-ocakbasi"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen"
    ],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "12:30",
      "00:30"
     ]
    ],
    "2": [
     [
      "12:30",
      "00:30"
     ]
    ],
    "3": [
     [
      "12:00",
      "00:30"
     ]
    ],
    "4": [
     [
      "12:30",
      "00:30"
     ]
    ],
    "5": [
     [
      "12:30",
      "00:30"
     ]
    ],
    "6": [
     [
      "12:30",
      "00:30"
     ]
    ],
    "7": [
     [
      "12:30",
      "00:30"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara kuzu pirzola"
   ]
  },
  {
   "slug": "galeyan-restaurant",
   "ad": "Galeyan Restaurant",
   "kategori": "Restoran",
   "fiyat": "₺₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Sultanahmet’teki Galeyan, Anadolu yemeklerini tarihî yarımadanın merkezinde çağdaş sunumlarla buluşturuyor.",
   "gorsel": "assets/gorsel/mekan/galeyan-restaurant.webp",
   "puan": null,
   "goruntulenme": 15,
   "konsept": [
    "ev-yemegi",
    "hafif-fit"
   ],
   "mesafeKm": 0.8,
   "enlem": 41.0087126,
   "boylam": 28.9759081,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.alemdar",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "tarihi",
     "modern"
    ],
    "mutfak": [
     "turk-mutfagi",
     "anadolu-mutfagi"
    ],
    "vesile": [
     "turistik-kesif",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "online-rezervasyon"
    ],
    "beslenme": [],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "2": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "3": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "4": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "5": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "6": [
     [
      "09:00",
      "00:00"
     ]
    ],
    "7": [
     [
      "09:00",
      "00:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Bulgur pilavı"
   ]
  },
  {
   "slug": "sultanahmet-ottoman-fish-terrace-house",
   "ad": "Sultanahmet Ottoman Fish Terrace House",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Sultanahmet Ottoman Fish Terrace House, Alemdar’daki terasında balık ve deniz ürünlerine odaklanıyor.",
   "gorsel": "assets/gorsel/mekan/sultanahmet-ottoman-fish-terrace-house.webp",
   "puan": null,
   "goruntulenme": 16,
   "konsept": [
    "deniz-urunleri",
    "protein-agirlikli",
    "vegan-vejetaryen"
   ],
   "mesafeKm": 2.1,
   "enlem": 41.01027,
   "boylam": 28.9751947,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.alemdar",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "deniz-urunleri"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras",
     "wifi"
    ],
    "beslenme": [
     "vejetaryen"
    ],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "11:30",
      "23:30"
     ]
    ],
    "2": [
     [
      "11:30",
      "23:30"
     ]
    ],
    "3": [
     [
      "11:30",
      "23:30"
     ]
    ],
    "4": [
     [
      "11:30",
      "00:15"
     ]
    ],
    "5": [
     [
      "11:30",
      "00:30"
     ]
    ],
    "6": [
     [
      "11:30",
      "00:30"
     ]
    ],
    "7": [
     [
      "11:30",
      "00:30"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara levrek",
    "Haşlanmış karides"
   ]
  },
  {
   "slug": "tria-terrace-restaurant",
   "ad": "Tria Terrace Restaurant",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Tria Terrace, Cankurtaran’da deniz ürünlerini ve Akdeniz yemeklerini teras ortamında sunuyor.",
   "gorsel": "assets/gorsel/mekan/tria-terrace-restaurant.webp",
   "puan": null,
   "goruntulenme": 15,
   "konsept": [
    "deniz-urunleri",
    "salata-bar",
    "vegan-vejetaryen"
   ],
   "mesafeKm": 2.7,
   "enlem": 41.0056596,
   "boylam": 28.9810052,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.cankurtaran",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "akdeniz-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras",
     "wifi",
     "canli-muzik"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen"
    ],
    "ulasim": [
     "otopark"
    ],
    "acik": [
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "2": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "3": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "4": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "5": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "6": [
     [
      "13:00",
      "23:00"
     ]
    ],
    "7": [
     [
      "13:00",
      "23:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Humus",
    "Zeytinyağlı yaprak sarma",
    "Izgara levrek"
   ]
  },
  {
   "slug": "giritli-restoran",
   "ad": "Giritli Restoran",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Cankurtaran’daki Giritli, Ege mezelerini ve deniz ürünlerini tarihi yarımadada sunuyor.",
   "gorsel": "assets/gorsel/mekan/giritli-restoran.webp",
   "puan": null,
   "goruntulenme": 14,
   "konsept": [
    "deniz-urunleri",
    "salata-bar"
   ],
   "mesafeKm": 3.4,
   "enlem": 41.0035961,
   "boylam": 28.9807082,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.cankurtaran",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "butik-restoran",
     "luks",
     "bahceli-restoran"
    ],
    "mutfak": [
     "ege-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "ozel-gunler",
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [],
    "beslenme": [],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "2": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "3": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "4": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "5": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "6": [
     [
      "13:00",
      "00:00"
     ]
    ],
    "7": [
     [
      "13:00",
      "00:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Zeytinyağlı yaprak sarma",
    "Izgara levrek",
    "Haşlanmış karides"
   ]
  },
  {
   "slug": "eva-bosphorus",
   "ad": "Eva Bosphorus Restaurant",
   "kategori": "Otel Restoranı",
   "fiyat": "₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Demiray Hotel’in üst katındaki Eva Bosphorus, Boğaz manzarasıyla Türk ve İtalyan yemekleri sunuyor.",
   "gorsel": "assets/gorsel/mekan/eva-bosphorus.webp",
   "puan": null,
   "goruntulenme": 17,
   "konsept": [
    "hafif-fit"
   ],
   "mesafeKm": 4.6,
   "enlem": 41.0136304,
   "boylam": 28.9724776,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.hobyar",
    "kategori": [
     "otel-restorani"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "turk-mutfagi",
     "italyan-mutfagi"
    ],
    "vesile": [
     "romantik-bulusma",
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras"
    ],
    "beslenme": [],
    "ulasim": [],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "10:00",
      "01:00"
     ]
    ],
    "2": [
     [
      "10:00",
      "01:00"
     ]
    ],
    "3": [
     [
      "10:00",
      "01:00"
     ]
    ],
    "4": [
     [
      "10:00",
      "01:00"
     ]
    ],
    "5": [
     [
      "10:00",
      "02:00"
     ]
    ],
    "6": [
     [
      "10:00",
      "02:00"
     ]
    ],
    "7": [
     [
      "10:00",
      "02:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Makarna (sossuz)"
   ]
  },
  {
   "slug": "matbah-ottoman-palace-cuisine",
   "ad": "Matbah Ottoman Palace Cuisine",
   "kategori": "Fine Dining",
   "fiyat": "₺₺₺₺",
   "il": "İstanbul",
   "ilce": "Fatih",
   "ozet": "Matbah, Sultanahmet’te Osmanlı saray mutfağından yemekleri tarihî çevreye yakın bir salonda sunuyor.",
   "gorsel": "assets/gorsel/mekan/matbah-ottoman-palace-cuisine.webp",
   "puan": null,
   "goruntulenme": 18,
   "konsept": [
    "ev-yemegi"
   ],
   "mesafeKm": 3,
   "enlem": 41.0092761,
   "boylam": 28.979114,
   "suzgec": {
    "il": "istanbul",
    "ilce": "istanbul.fatih",
    "semt": "istanbul.fatih.cankurtaran",
    "kategori": [
     "fine-dining-restorani"
    ],
    "konsept": [
     "tarihi",
     "geleneksel"
    ],
    "mutfak": [
     "turk-mutfagi"
    ],
    "vesile": [
     "turistik-kesif",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor"
    ],
    "beslenme": [],
    "ulasim": [],
    "acik": [
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "2": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "3": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "4": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "5": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "6": [
     [
      "09:00",
      "22:30"
     ]
    ],
    "7": [
     [
      "09:00",
      "22:30"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı"
   ]
  },
  {
   "slug": "curlys-demeter-restaurant-bar",
   "ad": "Curly's Demeter Restaurant & Bar",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "Muğla",
   "ilce": "Bodrum",
   "ozet": "Bodrum Umurca’daki Curly’s Demeter, bahçeli ortamında et yemekleri ve deniz ürünleri sunuyor.",
   "gorsel": "assets/gorsel/mekan/curlys-demeter-restaurant-bar.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "glutensiz",
    "vegan-vejetaryen",
    "deniz-urunleri",
    "hafif-fit"
   ],
   "mesafeKm": 12.5,
   "enlem": 37.0352969,
   "boylam": 27.4379795,
   "suzgec": {
    "il": "mugla",
    "ilce": "mugla.bodrum",
    "semt": "mugla.bodrum.umurca",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "bahceli-restoran"
    ],
    "mutfak": [
     "turk-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "arkadas-bulusmasi",
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "evcil-hayvan-dostu",
     "kredi-karti"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen",
     "glutensiz"
    ],
    "ulasim": [
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "2": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "3": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "4": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "5": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "6": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "7": [
     [
      "09:00",
      "02:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Izgara levrek"
   ]
  },
  {
   "slug": "almera-restaurant",
   "ad": "Almera Restaurant",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "Muğla",
   "ilce": "Bodrum",
   "ozet": "Bitez kıyısındaki Almera, deniz ürünleri ve Akdeniz yemeklerini sahil masalarında sunuyor.",
   "gorsel": "assets/gorsel/mekan/almera-restaurant.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "deniz-urunleri",
    "salata-bar"
   ],
   "mesafeKm": 18,
   "enlem": 37.0279648,
   "boylam": 27.3777676,
   "suzgec": {
    "il": "mugla",
    "ilce": "mugla.bodrum",
    "semt": "mugla.bodrum.bitez",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "deniz-kenari"
    ],
    "mutfak": [
     "akdeniz-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "kredi-karti"
    ],
    "beslenme": [],
    "ulasim": [
     "otopark",
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "2": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "3": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "4": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "5": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "6": [
     [
      "09:00",
      "02:00"
     ]
    ],
    "7": [
     [
      "09:00",
      "02:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Humus",
    "Zeytinyağlı yaprak sarma",
    "Izgara levrek"
   ]
  },
  {
   "slug": "yelken-restaurant-meyhane",
   "ad": "Yelken Restaurant & Meyhane",
   "kategori": "Restoran",
   "fiyat": "₺₺₺₺",
   "il": "Antalya",
   "ilce": "Kaş",
   "ozet": "Kaş’taki Yelken Restaurant & Meyhane, deniz kıyısında meze ve balık sofrası kuruyor.",
   "gorsel": "assets/gorsel/mekan/yelken-restaurant-meyhane.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "deniz-urunleri"
   ],
   "mesafeKm": 27,
   "enlem": 36.198789,
   "boylam": 29.6417669,
   "suzgec": {
    "il": "antalya",
    "ilce": "antalya.kas",
    "semt": "antalya.kas.andifli",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "deniz-kenari"
    ],
    "mutfak": [
     "akdeniz-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "canli-muzik",
     "kredi-karti"
    ],
    "beslenme": [],
    "ulasim": [
     "otopark",
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "08:30",
      "01:00"
     ]
    ],
    "2": [
     [
      "08:30",
      "01:00"
     ]
    ],
    "3": [
     [
      "08:30",
      "01:00"
     ]
    ],
    "4": [
     [
      "08:30",
      "01:00"
     ]
    ],
    "5": [
     [
      "08:30",
      "01:00"
     ]
    ],
    "6": [
     [
      "08:30",
      "00:00"
     ]
    ],
    "7": [
     [
      "08:30",
      "01:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Humus",
    "Zeytinyağlı yaprak sarma",
    "Izgara levrek"
   ]
  },
  {
   "slug": "sky-safran-restaurant-bar",
   "ad": "Sky Safran Restaurant Bar",
   "kategori": "Restoran",
   "fiyat": "₺₺₺",
   "il": "Antalya",
   "ilce": "Manavgat",
   "ozet": "Side’deki Sky Safran, bahçe masalarında kahvaltıdan geç saat yemeğine uzanan geniş bir menü sunuyor.",
   "gorsel": "assets/gorsel/mekan/sky-safran-restaurant-bar.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "kahvalti",
    "vegan-vejetaryen",
    "deniz-urunleri"
   ],
   "mesafeKm": 33.5,
   "enlem": 36.7756267,
   "boylam": 31.3986984,
   "suzgec": {
    "il": "antalya",
    "ilce": "antalya.manavgat",
    "semt": "antalya.manavgat.side",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "bahceli-restoran"
    ],
    "mutfak": [
     "turk-mutfagi",
     "deniz-urunleri",
     "meksika-mutfagi"
    ],
    "vesile": [
     "kahvalti",
     "aksam-yemegi"
    ],
    "fiyat": [
     "3"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "kredi-karti"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen"
    ],
    "ulasim": [
     "otopark"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "2": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "3": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "4": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "5": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "6": [
     [
      "08:30",
      "02:00"
     ]
    ],
    "7": [
     [
      "08:30",
      "02:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Izgara levrek"
   ]
  },
  {
   "slug": "fava-alacati",
   "ad": "Fava Alaçatı",
   "kategori": "Restoran",
   "fiyat": "₺₺₺₺",
   "il": "İzmir",
   "ilce": "Çeşme",
   "ozet": "Alaçatı’daki Fava, eski bir Rum evinin avlusunda Ege mezeleri ve deniz ürünlerini buluşturuyor.",
   "gorsel": "assets/gorsel/mekan/fava-alacati.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "glutensiz",
    "vegan-vejetaryen",
    "deniz-urunleri",
    "salata-bar"
   ],
   "mesafeKm": 9.8,
   "enlem": 38.285055,
   "boylam": 26.378234,
   "suzgec": {
    "il": "izmir",
    "ilce": "izmir.cesme",
    "semt": "izmir.cesme.alacati",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "tarihi",
     "bahceli-restoran"
    ],
    "mutfak": [
     "ege-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "ozel-gunler",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "bahce",
     "wifi",
     "bebek-sandalyesi",
     "kredi-karti"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen",
     "glutensiz"
    ],
    "ulasim": [
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "2": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "3": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "4": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "5": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "6": [
     [
      "17:00",
      "00:00"
     ]
    ],
    "7": [
     [
      "17:00",
      "00:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Zeytinyağlı yaprak sarma",
    "Izgara levrek",
    "Haşlanmış karides"
   ]
  },
  {
   "slug": "scappi",
   "ad": "Scappi",
   "kategori": "Otel Restoranı",
   "fiyat": "₺₺₺₺",
   "il": "İzmir",
   "ilce": "Konak",
   "ozet": "Swissôtel Büyük Efes’in terasındaki Scappi, İtalyan yemeklerini İzmir manzarasıyla sunuyor.",
   "gorsel": "assets/gorsel/mekan/scappi.webp",
   "puan": null,
   "goruntulenme": 15,
   "konsept": [
    "hafif-fit"
   ],
   "mesafeKm": 6.2,
   "enlem": 38.4277201,
   "boylam": 27.1356489,
   "suzgec": {
    "il": "izmir",
    "ilce": "izmir.konak",
    "semt": "izmir.konak.alsancak",
    "kategori": [
     "otel-restorani"
    ],
    "konsept": [
     "terasli",
     "manzarali"
    ],
    "mutfak": [
     "italyan-mutfagi"
    ],
    "vesile": [
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "teras",
     "canli-muzik",
     "kredi-karti"
    ],
    "beslenme": [],
    "ulasim": [
     "otopark"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "2": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "3": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "4": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "5": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "6": [
     [
      "18:00",
      "01:30"
     ]
    ],
    "7": [
     [
      "18:00",
      "01:30"
     ]
    ]
   },
   "ornekYemekler": [
    "Makarna (sossuz)"
   ]
  },
  {
   "slug": "seki-restaurant-lounge",
   "ad": "Seki Restaurant & Lounge",
   "kategori": "Otel Restoranı",
   "fiyat": "₺₺₺₺",
   "il": "Nevşehir",
   "ilce": "Uçhisar",
   "ozet": "Argos in Cappadocia içindeki Seki, Uçhisar manzarası eşliğinde Anadolu lezzetlerini çağdaş dokunuşlarla sunuyor.",
   "gorsel": "assets/gorsel/mekan/seki-restaurant-lounge.webp",
   "puan": null,
   "goruntulenme": 14,
   "konsept": [
    "glutensiz",
    "vegan-vejetaryen",
    "salata-bar"
   ],
   "mesafeKm": 41,
   "enlem": 38.6297129,
   "boylam": 34.8073127,
   "suzgec": {
    "il": "nevsehir",
    "ilce": "nevsehir.uchisar",
    "semt": "nevsehir.uchisar.tekelli",
    "kategori": [
     "otel-restorani"
    ],
    "konsept": [
     "tarihi",
     "manzarali",
     "sef-restorani"
    ],
    "mutfak": [
     "akdeniz-mutfagi",
     "anadolu-mutfagi"
    ],
    "vesile": [
     "romantik-bulusma",
     "ozel-gunler",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "kredi-karti"
    ],
    "beslenme": [
     "vegan",
     "vejetaryen",
     "glutensiz"
    ],
    "ulasim": [
     "otopark"
    ],
    "acik": [
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "2": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "3": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "4": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "5": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "6": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ],
    "7": [
     [
      "13:00",
      "16:30"
     ],
     [
      "18:00",
      "23:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Humus",
    "Zeytinyağlı yaprak sarma",
    "Bulgur pilavı"
   ]
  },
  {
   "slug": "tandir-house-restaurant-cappadocia",
   "ad": "Tandır House Restaurant Cappadocia",
   "kategori": "Restoran",
   "fiyat": "₺₺₺₺",
   "il": "Nevşehir",
   "ilce": "Ürgüp",
   "ozet": "Ürgüp’teki Tandır House, Türk ve Akdeniz yemeklerini taş mekân ve teras atmosferiyle birleştiriyor.",
   "gorsel": "assets/gorsel/mekan/tandir-house-restaurant-cappadocia.webp",
   "puan": null,
   "goruntulenme": 13,
   "konsept": [
    "ev-yemegi",
    "vegan-vejetaryen",
    "kahvalti"
   ],
   "mesafeKm": 22.4,
   "enlem": 38.6315288,
   "boylam": 34.908686,
   "suzgec": {
    "il": "nevsehir",
    "ilce": "nevsehir.urgup",
    "semt": "nevsehir.urgup.dereler",
    "kategori": [
     "restoran"
    ],
    "konsept": [
     "geleneksel",
     "terasli"
    ],
    "mutfak": [
     "turk-mutfagi",
     "akdeniz-mutfagi"
    ],
    "vesile": [
     "ozel-gunler",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "bebek-sandalyesi",
     "canli-muzik",
     "kredi-karti"
    ],
    "beslenme": [
     "vegan"
    ],
    "ulasim": [
     "otopark",
     "vale"
    ],
    "acik": [
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "2": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "3": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "4": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "5": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "6": [
     [
      "12:00",
      "22:30"
     ]
    ],
    "7": [
     [
      "12:00",
      "22:30"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Humus"
   ]
  },
  {
   "slug": "aruni-restaurant-bar-ankara",
   "ad": "Aruni Restaurant & Bar",
   "kategori": "Otel Restoranı",
   "fiyat": "₺₺₺₺",
   "il": "Ankara",
   "ilce": "Çankaya",
   "ozet": "Lugal Ankara’nın Aruni restoranı, yerel malzemeleri çağdaş Türk mutfağı yorumuyla kış bahçesi ve terasında sunuyor.",
   "gorsel": "assets/gorsel/mekan/aruni-restaurant-bar-ankara.webp",
   "puan": null,
   "goruntulenme": 12,
   "konsept": [
    "kahvalti",
    "ev-yemegi",
    "protein-agirlikli"
   ],
   "mesafeKm": 14.3,
   "enlem": 39.8998516,
   "boylam": 32.8651808,
   "suzgec": {
    "il": "ankara",
    "ilce": "ankara.cankaya",
    "semt": "ankara.cankaya.kavaklidere",
    "kategori": [
     "otel-restorani"
    ],
    "konsept": [
     "modern",
     "luks",
     "terasli"
    ],
    "mutfak": [
     "turk-mutfagi",
     "anadolu-mutfagi"
    ],
    "vesile": [
     "is-yemegi",
     "ozel-gunler",
     "aksam-yemegi"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "teras",
     "kredi-karti"
    ],
    "beslenme": [],
    "ulasim": [
     "otopark",
     "vale",
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "sabah",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "2": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "3": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "4": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "5": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "6": [
     [
      "06:30",
      "01:00"
     ]
    ],
    "7": [
     [
      "06:30",
      "01:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Bulgur pilavı"
   ]
  },
  {
   "slug": "trilye-restoran",
   "ad": "Trilye Restoran",
   "kategori": "Fine Dining",
   "fiyat": "₺₺₺₺",
   "il": "Ankara",
   "ilce": "Çankaya",
   "ozet": "Ankara’daki Trilye, mevsimlik balık ve deniz ürünleri için Kuleli Sokak’ta köklü bir adres.",
   "gorsel": "assets/gorsel/mekan/trilye-restoran.webp",
   "puan": null,
   "goruntulenme": 15,
   "konsept": [
    "deniz-urunleri",
    "vegan-vejetaryen",
    "protein-agirlikli"
   ],
   "mesafeKm": 48.6,
   "enlem": 39.8940686,
   "boylam": 32.8719779,
   "suzgec": {
    "il": "ankara",
    "ilce": "ankara.cankaya",
    "semt": "ankara.cankaya.kazim-ozalp",
    "kategori": [
     "fine-dining-restorani"
    ],
    "konsept": [
     "bahceli-restoran"
    ],
    "mutfak": [
     "turk-mutfagi",
     "akdeniz-mutfagi",
     "deniz-urunleri"
    ],
    "vesile": [
     "is-yemegi",
     "ozel-gunler"
    ],
    "fiyat": [
     "4"
    ],
    "puan": [
     "yok"
    ],
    "hizmet": [
     "rezervasyon-aliyor",
     "acik-alan",
     "wifi",
     "kredi-karti"
    ],
    "beslenme": [
     "vejetaryen"
    ],
    "ulasim": [
     "tekerlekli-sandalye-erisimi"
    ],
    "acik": [
     "gece",
     "hafta-sonu",
     "rezervasyon"
    ],
    "seckiler": [
     "rota"
    ]
   },
   "saatler": {
    "1": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "2": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "3": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "4": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "5": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "6": [
     [
      "12:00",
      "00:00"
     ]
    ],
    "7": [
     [
      "12:00",
      "00:00"
     ]
    ]
   },
   "ornekYemekler": [
    "Izgara tavuk göğsü",
    "Pirinç pilavı",
    "Humus"
   ]
  }
 ],
 "konum": {
  "iller": [
   {
    "deger": "istanbul",
    "etiket": "İstanbul"
   },
   {
    "deger": "mugla",
    "etiket": "Muğla"
   },
   {
    "deger": "antalya",
    "etiket": "Antalya"
   },
   {
    "deger": "izmir",
    "etiket": "İzmir"
   },
   {
    "deger": "nevsehir",
    "etiket": "Nevşehir"
   },
   {
    "deger": "ankara",
    "etiket": "Ankara"
   },
   {
    "deger": "bursa",
    "etiket": "Bursa"
   },
   {
    "deger": "aydin",
    "etiket": "Aydın"
   },
   {
    "deger": "balikesir",
    "etiket": "Balıkesir"
   },
   {
    "deger": "eskisehir",
    "etiket": "Eskişehir"
   },
   {
    "deger": "gaziantep",
    "etiket": "Gaziantep"
   },
   {
    "deger": "hatay",
    "etiket": "Hatay"
   },
   {
    "deger": "konya",
    "etiket": "Konya"
   },
   {
    "deger": "mardin",
    "etiket": "Mardin"
   },
   {
    "deger": "trabzon",
    "etiket": "Trabzon"
   },
   {
    "deger": "adana",
    "etiket": "Adana"
   },
   {
    "deger": "adiyaman",
    "etiket": "Adıyaman"
   },
   {
    "deger": "afyonkarahisar",
    "etiket": "Afyonkarahisar"
   },
   {
    "deger": "agri",
    "etiket": "Ağrı"
   },
   {
    "deger": "aksaray",
    "etiket": "Aksaray"
   },
   {
    "deger": "amasya",
    "etiket": "Amasya"
   },
   {
    "deger": "ardahan",
    "etiket": "Ardahan"
   },
   {
    "deger": "artvin",
    "etiket": "Artvin"
   },
   {
    "deger": "bartin",
    "etiket": "Bartın"
   },
   {
    "deger": "batman",
    "etiket": "Batman"
   },
   {
    "deger": "bayburt",
    "etiket": "Bayburt"
   },
   {
    "deger": "bilecik",
    "etiket": "Bilecik"
   },
   {
    "deger": "bingol",
    "etiket": "Bingöl"
   },
   {
    "deger": "bitlis",
    "etiket": "Bitlis"
   },
   {
    "deger": "bolu",
    "etiket": "Bolu"
   },
   {
    "deger": "burdur",
    "etiket": "Burdur"
   },
   {
    "deger": "canakkale",
    "etiket": "Çanakkale"
   },
   {
    "deger": "cankiri",
    "etiket": "Çankırı"
   },
   {
    "deger": "corum",
    "etiket": "Çorum"
   },
   {
    "deger": "denizli",
    "etiket": "Denizli"
   },
   {
    "deger": "diyarbakir",
    "etiket": "Diyarbakır"
   },
   {
    "deger": "duzce",
    "etiket": "Düzce"
   },
   {
    "deger": "edirne",
    "etiket": "Edirne"
   },
   {
    "deger": "elazig",
    "etiket": "Elazığ"
   },
   {
    "deger": "erzincan",
    "etiket": "Erzincan"
   },
   {
    "deger": "erzurum",
    "etiket": "Erzurum"
   },
   {
    "deger": "giresun",
    "etiket": "Giresun"
   },
   {
    "deger": "gumushane",
    "etiket": "Gümüşhane"
   },
   {
    "deger": "hakkari",
    "etiket": "Hakkari"
   },
   {
    "deger": "igdir",
    "etiket": "Iğdır"
   },
   {
    "deger": "isparta",
    "etiket": "Isparta"
   },
   {
    "deger": "kahramanmaras",
    "etiket": "Kahramanmaraş"
   },
   {
    "deger": "karabuk",
    "etiket": "Karabük"
   },
   {
    "deger": "karaman",
    "etiket": "Karaman"
   },
   {
    "deger": "kars",
    "etiket": "Kars"
   },
   {
    "deger": "kastamonu",
    "etiket": "Kastamonu"
   },
   {
    "deger": "kayseri",
    "etiket": "Kayseri"
   },
   {
    "deger": "kirikkale",
    "etiket": "Kırıkkale"
   },
   {
    "deger": "kirklareli",
    "etiket": "Kırklareli"
   },
   {
    "deger": "kirsehir",
    "etiket": "Kırşehir"
   },
   {
    "deger": "kilis",
    "etiket": "Kilis"
   },
   {
    "deger": "kocaeli",
    "etiket": "Kocaeli"
   },
   {
    "deger": "kutahya",
    "etiket": "Kütahya"
   },
   {
    "deger": "malatya",
    "etiket": "Malatya"
   },
   {
    "deger": "manisa",
    "etiket": "Manisa"
   },
   {
    "deger": "mersin",
    "etiket": "Mersin"
   },
   {
    "deger": "mus",
    "etiket": "Muş"
   },
   {
    "deger": "nigde",
    "etiket": "Niğde"
   },
   {
    "deger": "ordu",
    "etiket": "Ordu"
   },
   {
    "deger": "osmaniye",
    "etiket": "Osmaniye"
   },
   {
    "deger": "rize",
    "etiket": "Rize"
   },
   {
    "deger": "sakarya",
    "etiket": "Sakarya"
   },
   {
    "deger": "samsun",
    "etiket": "Samsun"
   },
   {
    "deger": "siirt",
    "etiket": "Siirt"
   },
   {
    "deger": "sinop",
    "etiket": "Sinop"
   },
   {
    "deger": "sivas",
    "etiket": "Sivas"
   },
   {
    "deger": "sanliurfa",
    "etiket": "Şanlıurfa"
   },
   {
    "deger": "sirnak",
    "etiket": "Şırnak"
   },
   {
    "deger": "tekirdag",
    "etiket": "Tekirdağ"
   },
   {
    "deger": "tokat",
    "etiket": "Tokat"
   },
   {
    "deger": "tunceli",
    "etiket": "Tunceli"
   },
   {
    "deger": "usak",
    "etiket": "Uşak"
   },
   {
    "deger": "van",
    "etiket": "Van"
   },
   {
    "deger": "yalova",
    "etiket": "Yalova"
   },
   {
    "deger": "yozgat",
    "etiket": "Yozgat"
   },
   {
    "deger": "zonguldak",
    "etiket": "Zonguldak"
   }
  ],
  "ilceler": {
   "ankara": [
    {
     "deger": "ankara.cankaya",
     "etiket": "Çankaya"
    },
    {
     "deger": "ankara.golbasi",
     "etiket": "Gölbaşı"
    },
    {
     "deger": "ankara.yenimahalle",
     "etiket": "Yenimahalle"
    },
    {
     "deger": "ankara.akyurt",
     "etiket": "Akyurt"
    },
    {
     "deger": "ankara.altindag",
     "etiket": "Altındağ"
    },
    {
     "deger": "ankara.ayas",
     "etiket": "Ayaş"
    },
    {
     "deger": "ankara.bala",
     "etiket": "Bala"
    },
    {
     "deger": "ankara.beypazari",
     "etiket": "Beypazarı"
    },
    {
     "deger": "ankara.camlidere",
     "etiket": "Çamlıdere"
    },
    {
     "deger": "ankara.cubuk",
     "etiket": "Çubuk"
    },
    {
     "deger": "ankara.elmadag",
     "etiket": "Elmadağ"
    },
    {
     "deger": "ankara.etimesgut",
     "etiket": "Etimesgut"
    },
    {
     "deger": "ankara.evren",
     "etiket": "Evren"
    },
    {
     "deger": "ankara.gudul",
     "etiket": "Güdül"
    },
    {
     "deger": "ankara.haymana",
     "etiket": "Haymana"
    },
    {
     "deger": "ankara.kahramankazan",
     "etiket": "Kahramankazan"
    },
    {
     "deger": "ankara.kalecik",
     "etiket": "Kalecik"
    },
    {
     "deger": "ankara.kecioren",
     "etiket": "Keçiören"
    },
    {
     "deger": "ankara.kizilcahamam",
     "etiket": "Kızılcahamam"
    },
    {
     "deger": "ankara.mamak",
     "etiket": "Mamak"
    },
    {
     "deger": "ankara.nallihan",
     "etiket": "Nallıhan"
    },
    {
     "deger": "ankara.polatli",
     "etiket": "Polatlı"
    },
    {
     "deger": "ankara.pursaklar",
     "etiket": "Pursaklar"
    },
    {
     "deger": "ankara.sincan",
     "etiket": "Sincan"
    },
    {
     "deger": "ankara.sereflikochisar",
     "etiket": "Şereflikoçhisar"
    }
   ],
   "antalya": [
    {
     "deger": "antalya.muratpasa",
     "etiket": "Muratpaşa"
    },
    {
     "deger": "antalya.serik",
     "etiket": "Serik"
    },
    {
     "deger": "antalya.manavgat",
     "etiket": "Manavgat"
    },
    {
     "deger": "antalya.alanya",
     "etiket": "Alanya"
    },
    {
     "deger": "antalya.kas",
     "etiket": "Kaş"
    },
    {
     "deger": "antalya.kemer",
     "etiket": "Kemer"
    },
    {
     "deger": "antalya.akseki",
     "etiket": "Akseki"
    },
    {
     "deger": "antalya.aksu",
     "etiket": "Aksu"
    },
    {
     "deger": "antalya.demre",
     "etiket": "Demre"
    },
    {
     "deger": "antalya.dosemealti",
     "etiket": "Döşemealtı"
    },
    {
     "deger": "antalya.elmali",
     "etiket": "Elmalı"
    },
    {
     "deger": "antalya.finike",
     "etiket": "Finike"
    },
    {
     "deger": "antalya.gazipasa",
     "etiket": "Gazipaşa"
    },
    {
     "deger": "antalya.gundogmus",
     "etiket": "Gündoğmuş"
    },
    {
     "deger": "antalya.ibradi",
     "etiket": "İbradı"
    },
    {
     "deger": "antalya.kepez",
     "etiket": "Kepez"
    },
    {
     "deger": "antalya.konyaalti",
     "etiket": "Konyaaltı"
    },
    {
     "deger": "antalya.korkuteli",
     "etiket": "Korkuteli"
    },
    {
     "deger": "antalya.kumluca",
     "etiket": "Kumluca"
    }
   ],
   "mugla": [
    {
     "deger": "mugla.bodrum",
     "etiket": "Bodrum"
    },
    {
     "deger": "mugla.fethiye",
     "etiket": "Fethiye"
    },
    {
     "deger": "mugla.dalaman",
     "etiket": "Dalaman"
    },
    {
     "deger": "mugla.datca",
     "etiket": "Datça"
    },
    {
     "deger": "mugla.kavaklidere",
     "etiket": "Kavaklıdere"
    },
    {
     "deger": "mugla.koycegiz",
     "etiket": "Köyceğiz"
    },
    {
     "deger": "mugla.marmaris",
     "etiket": "Marmaris"
    },
    {
     "deger": "mugla.mentese",
     "etiket": "Menteşe"
    },
    {
     "deger": "mugla.milas",
     "etiket": "Milas"
    },
    {
     "deger": "mugla.ortaca",
     "etiket": "Ortaca"
    },
    {
     "deger": "mugla.seydikemer",
     "etiket": "Seydikemer"
    },
    {
     "deger": "mugla.ula",
     "etiket": "Ula"
    },
    {
     "deger": "mugla.yatagan",
     "etiket": "Yatağan"
    }
   ],
   "nevsehir": [
    {
     "deger": "nevsehir.nevsehir-merkez",
     "etiket": "Nevşehir Merkez"
    },
    {
     "deger": "nevsehir.urgup",
     "etiket": "Ürgüp"
    },
    {
     "deger": "nevsehir.merkez",
     "etiket": "Merkez"
    },
    {
     "deger": "nevsehir.uchisar",
     "etiket": "Uçhisar"
    },
    {
     "deger": "nevsehir.acigol",
     "etiket": "Acıgöl"
    },
    {
     "deger": "nevsehir.avanos",
     "etiket": "Avanos"
    },
    {
     "deger": "nevsehir.derinkuyu",
     "etiket": "Derinkuyu"
    },
    {
     "deger": "nevsehir.gulsehir",
     "etiket": "Gülşehir"
    },
    {
     "deger": "nevsehir.hacibektas",
     "etiket": "Hacıbektaş"
    },
    {
     "deger": "nevsehir.kozakli",
     "etiket": "Kozaklı"
    }
   ],
   "istanbul": [
    {
     "deger": "istanbul.fatih",
     "etiket": "Fatih"
    },
    {
     "deger": "istanbul.beyoglu",
     "etiket": "Beyoğlu"
    },
    {
     "deger": "istanbul.besiktas",
     "etiket": "Beşiktaş"
    },
    {
     "deger": "istanbul.sariyer",
     "etiket": "Sarıyer"
    },
    {
     "deger": "istanbul.sisli",
     "etiket": "Şişli"
    },
    {
     "deger": "istanbul.kadikoy",
     "etiket": "Kadıköy"
    },
    {
     "deger": "istanbul.uskudar",
     "etiket": "Üsküdar"
    },
    {
     "deger": "istanbul.atasehir",
     "etiket": "Ataşehir"
    },
    {
     "deger": "istanbul.bakirkoy",
     "etiket": "Bakırköy"
    },
    {
     "deger": "istanbul.beykoz",
     "etiket": "Beykoz"
    },
    {
     "deger": "istanbul.maltepe",
     "etiket": "Maltepe"
    },
    {
     "deger": "istanbul.adalar",
     "etiket": "Adalar"
    },
    {
     "deger": "istanbul.arnavutkoy",
     "etiket": "Arnavutköy"
    },
    {
     "deger": "istanbul.avcilar",
     "etiket": "Avcılar"
    },
    {
     "deger": "istanbul.bagcilar",
     "etiket": "Bağcılar"
    },
    {
     "deger": "istanbul.bahcelievler",
     "etiket": "Bahçelievler"
    },
    {
     "deger": "istanbul.basaksehir",
     "etiket": "Başakşehir"
    },
    {
     "deger": "istanbul.bayrampasa",
     "etiket": "Bayrampaşa"
    },
    {
     "deger": "istanbul.beylikduzu",
     "etiket": "Beylikdüzü"
    },
    {
     "deger": "istanbul.buyukcekmece",
     "etiket": "Büyükçekmece"
    },
    {
     "deger": "istanbul.catalca",
     "etiket": "Çatalca"
    },
    {
     "deger": "istanbul.cekmekoy",
     "etiket": "Çekmeköy"
    },
    {
     "deger": "istanbul.esenler",
     "etiket": "Esenler"
    },
    {
     "deger": "istanbul.esenyurt",
     "etiket": "Esenyurt"
    },
    {
     "deger": "istanbul.eyupsultan",
     "etiket": "Eyüpsultan"
    },
    {
     "deger": "istanbul.gaziosmanpasa",
     "etiket": "Gaziosmanpaşa"
    },
    {
     "deger": "istanbul.gungoren",
     "etiket": "Güngören"
    },
    {
     "deger": "istanbul.kagithane",
     "etiket": "Kağıthane"
    },
    {
     "deger": "istanbul.kartal",
     "etiket": "Kartal"
    },
    {
     "deger": "istanbul.kucukcekmece",
     "etiket": "Küçükçekmece"
    },
    {
     "deger": "istanbul.pendik",
     "etiket": "Pendik"
    },
    {
     "deger": "istanbul.sancaktepe",
     "etiket": "Sancaktepe"
    },
    {
     "deger": "istanbul.silivri",
     "etiket": "Silivri"
    },
    {
     "deger": "istanbul.sultanbeyli",
     "etiket": "Sultanbeyli"
    },
    {
     "deger": "istanbul.sultangazi",
     "etiket": "Sultangazi"
    },
    {
     "deger": "istanbul.sile",
     "etiket": "Şile"
    },
    {
     "deger": "istanbul.tuzla",
     "etiket": "Tuzla"
    },
    {
     "deger": "istanbul.umraniye",
     "etiket": "Ümraniye"
    },
    {
     "deger": "istanbul.zeytinburnu",
     "etiket": "Zeytinburnu"
    }
   ],
   "izmir": [
    {
     "deger": "izmir.urla",
     "etiket": "Urla"
    },
    {
     "deger": "izmir.cesme",
     "etiket": "Çeşme"
    },
    {
     "deger": "izmir.balcova",
     "etiket": "Balçova"
    },
    {
     "deger": "izmir.konak",
     "etiket": "Konak"
    },
    {
     "deger": "izmir.bayrakli",
     "etiket": "Bayraklı"
    },
    {
     "deger": "izmir.aliaga",
     "etiket": "Aliağa"
    },
    {
     "deger": "izmir.bayindir",
     "etiket": "Bayındır"
    },
    {
     "deger": "izmir.bergama",
     "etiket": "Bergama"
    },
    {
     "deger": "izmir.beydag",
     "etiket": "Beydağ"
    },
    {
     "deger": "izmir.bornova",
     "etiket": "Bornova"
    },
    {
     "deger": "izmir.buca",
     "etiket": "Buca"
    },
    {
     "deger": "izmir.cigli",
     "etiket": "Çiğli"
    },
    {
     "deger": "izmir.dikili",
     "etiket": "Dikili"
    },
    {
     "deger": "izmir.foca",
     "etiket": "Foça"
    },
    {
     "deger": "izmir.gaziemir",
     "etiket": "Gaziemir"
    },
    {
     "deger": "izmir.guzelbahce",
     "etiket": "Güzelbahçe"
    },
    {
     "deger": "izmir.karabaglar",
     "etiket": "Karabağlar"
    },
    {
     "deger": "izmir.karaburun",
     "etiket": "Karaburun"
    },
    {
     "deger": "izmir.karsiyaka",
     "etiket": "Karşıyaka"
    },
    {
     "deger": "izmir.kemalpasa",
     "etiket": "Kemalpaşa"
    },
    {
     "deger": "izmir.kinik",
     "etiket": "Kınık"
    },
    {
     "deger": "izmir.kiraz",
     "etiket": "Kiraz"
    },
    {
     "deger": "izmir.menderes",
     "etiket": "Menderes"
    },
    {
     "deger": "izmir.menemen",
     "etiket": "Menemen"
    },
    {
     "deger": "izmir.narlidere",
     "etiket": "Narlıdere"
    },
    {
     "deger": "izmir.odemis",
     "etiket": "Ödemiş"
    },
    {
     "deger": "izmir.seferihisar",
     "etiket": "Seferihisar"
    },
    {
     "deger": "izmir.selcuk",
     "etiket": "Selçuk"
    },
    {
     "deger": "izmir.tire",
     "etiket": "Tire"
    },
    {
     "deger": "izmir.torbali",
     "etiket": "Torbalı"
    }
   ]
  },
  "semtler": {
   "ankara.cankaya": [
    {
     "deger": "ankara.cankaya.100-yil",
     "etiket": "100. Yıl"
    },
    {
     "deger": "ankara.cankaya.cankaya",
     "etiket": "Çankaya"
    },
    {
     "deger": "ankara.cankaya.kavaklidere",
     "etiket": "Kavaklıdere"
    },
    {
     "deger": "ankara.cankaya.kazim-ozalp",
     "etiket": "Kazım Özalp"
    },
    {
     "deger": "ankara.cankaya.prof-dr-ahmet-taner-kislali",
     "etiket": "Prof. Dr. Ahmet Taner Kışlalı"
    },
    {
     "deger": "ankara.cankaya.umit",
     "etiket": "Ümit"
    }
   ],
   "antalya.kas": [
    {
     "deger": "antalya.kas.andifli",
     "etiket": "Andifli"
    }
   ],
   "antalya.manavgat": [
    {
     "deger": "antalya.manavgat.side",
     "etiket": "Side"
    },
    {
     "deger": "antalya.manavgat.evrenseki",
     "etiket": "Evrenseki"
    }
   ],
   "istanbul.fatih": [
    {
     "deger": "istanbul.fatih.alemdar",
     "etiket": "Alemdar"
    },
    {
     "deger": "istanbul.fatih.cankurtaran",
     "etiket": "Cankurtaran"
    },
    {
     "deger": "istanbul.fatih.hoca-pasa",
     "etiket": "Hoca Paşa"
    },
    {
     "deger": "istanbul.fatih.hobyar",
     "etiket": "Hobyar"
    },
    {
     "deger": "istanbul.fatih.kucuk-ayasofya",
     "etiket": "Küçük Ayasofya"
    },
    {
     "deger": "istanbul.fatih.balabanaga",
     "etiket": "Balabanağa"
    },
    {
     "deger": "istanbul.fatih.binbirdirek",
     "etiket": "Binbirdirek"
    },
    {
     "deger": "istanbul.fatih.emin-sinan",
     "etiket": "Emin Sinan"
    },
    {
     "deger": "istanbul.fatih.mercan",
     "etiket": "Mercan"
    },
    {
     "deger": "istanbul.fatih.mimar-hayrettin",
     "etiket": "Mimar Hayrettin"
    },
    {
     "deger": "istanbul.fatih.mimar-kemalettin",
     "etiket": "Mimar Kemalettin"
    },
    {
     "deger": "istanbul.fatih.sultanahmet",
     "etiket": "Sultanahmet"
    },
    {
     "deger": "istanbul.fatih.yavuz-sinan",
     "etiket": "Yavuz Sinan"
    }
   ],
   "izmir.cesme": [
    {
     "deger": "izmir.cesme.alacati",
     "etiket": "Alaçatı"
    },
    {
     "deger": "izmir.cesme.16-eylul",
     "etiket": "16 Eylül"
    },
    {
     "deger": "izmir.cesme.inonu",
     "etiket": "İnönü"
    },
    {
     "deger": "izmir.cesme.sifne",
     "etiket": "Şifne"
    }
   ],
   "izmir.konak": [
    {
     "deger": "izmir.konak.akdeniz",
     "etiket": "Akdeniz"
    },
    {
     "deger": "izmir.konak.alsancak",
     "etiket": "Alsancak"
    }
   ],
   "mugla.bodrum": [
    {
     "deger": "mugla.bodrum.bitez",
     "etiket": "Bitez"
    },
    {
     "deger": "mugla.bodrum.carsi",
     "etiket": "Çarşı"
    },
    {
     "deger": "mugla.bodrum.dirmil",
     "etiket": "Dirmil"
    },
    {
     "deger": "mugla.bodrum.umurca",
     "etiket": "Umurca"
    },
    {
     "deger": "mugla.bodrum.eskicesme",
     "etiket": "Eskiçeşme"
    },
    {
     "deger": "mugla.bodrum.golkoy",
     "etiket": "Gölköy"
    },
    {
     "deger": "mugla.bodrum.gumbet",
     "etiket": "Gümbet"
    },
    {
     "deger": "mugla.bodrum.kumbahce",
     "etiket": "Kumbahçe"
    },
    {
     "deger": "mugla.bodrum.bahcelievler",
     "etiket": "Bahçelievler"
    },
    {
     "deger": "mugla.bodrum.comlekci",
     "etiket": "Çömlekçi"
    },
    {
     "deger": "mugla.bodrum.golturkbuku",
     "etiket": "Göltürkbükü"
    },
    {
     "deger": "mugla.bodrum.gumusluk",
     "etiket": "Gümüşlük"
    },
    {
     "deger": "mugla.bodrum.gundogan",
     "etiket": "Gündoğan"
    },
    {
     "deger": "mugla.bodrum.yalikavak",
     "etiket": "Yalıkavak"
    },
    {
     "deger": "mugla.bodrum.yokusbasi",
     "etiket": "Yokuşbaşı"
    }
   ],
   "nevsehir.uchisar": [
    {
     "deger": "nevsehir.uchisar.tekelli",
     "etiket": "Tekelli"
    }
   ],
   "nevsehir.urgup": [
    {
     "deger": "nevsehir.urgup.davutlu",
     "etiket": "Davutlu"
    },
    {
     "deger": "nevsehir.urgup.dereler",
     "etiket": "Dereler"
    },
    {
     "deger": "nevsehir.urgup.esentepe",
     "etiket": "Esentepe"
    },
    {
     "deger": "nevsehir.urgup.kayakapi",
     "etiket": "Kayakapı"
    },
    {
     "deger": "nevsehir.urgup.temenni",
     "etiket": "Temenni"
    }
   ]
  }
 },
 "gruplar": [
  {
   "anahtar": "kategori",
   "baslik": "Kategori",
   "ikon": "store",
   "secenekler": [
    {
     "deger": "restoran",
     "etiket": "Restoran"
    },
    {
     "deger": "kafe",
     "etiket": "Kafe"
    },
    {
     "deger": "kahvalti-mekani",
     "etiket": "Kahvaltı Mekânı"
    },
    {
     "deger": "tatlici",
     "etiket": "Tatlıcı"
    },
    {
     "deger": "pastane",
     "etiket": "Pastane"
    },
    {
     "deger": "firin-ve-unlu-mamuller",
     "etiket": "Fırın"
    },
    {
     "deger": "kahve-dukkani",
     "etiket": "Kahveci"
    },
    {
     "deger": "cay-evi",
     "etiket": "Çay Evi"
    },
    {
     "deger": "sokak-lezzetleri-noktasi",
     "etiket": "Sokak Lezzetleri"
    },
    {
     "deger": "esnaf-lokantasi",
     "etiket": "Esnaf Lokantası"
    },
    {
     "deger": "fine-dining-restorani",
     "etiket": "Fine Dining"
    },
    {
     "deger": "otel-restorani",
     "etiket": "Otel Restoranı"
    },
    {
     "deger": "gurme-market",
     "etiket": "Gurme Market"
    },
    {
     "deger": "saglikli-beslenme-mekani",
     "etiket": "Sağlıklı Beslenme Mekânı"
    },
    {
     "deger": "lokanta",
     "etiket": "Lokanta"
    },
    {
     "deger": "dondurmaci",
     "etiket": "Dondurmacı"
    },
    {
     "deger": "brunch-mekani",
     "etiket": "Brunch Mekânı"
    },
    {
     "deger": "hizli-servis-restorani",
     "etiket": "Hızlı Servis Restoranı"
    },
    {
     "deger": "fast-casual-restorani",
     "etiket": "Fast Casual Restoranı"
    },
    {
     "deger": "casual-dining-restorani",
     "etiket": "Casual Dining Restoranı"
    },
    {
     "deger": "tematik-restoran",
     "etiket": "Tematik Restoran"
    },
    {
     "deger": "ucuncu-nesil-kahveci",
     "etiket": "Üçüncü Nesil Kahveci"
    }
   ]
  },
  {
   "anahtar": "konsept",
   "baslik": "Konsept",
   "ikon": "layer-group",
   "secenekler": [
    {
     "deger": "butik-restoran",
     "etiket": "Butik"
    },
    {
     "deger": "tarihi",
     "etiket": "Tarihi"
    },
    {
     "deger": "modern",
     "etiket": "Modern"
    },
    {
     "deger": "geleneksel",
     "etiket": "Geleneksel"
    },
    {
     "deger": "minimalist",
     "etiket": "Minimalist"
    },
    {
     "deger": "luks",
     "etiket": "Lüks"
    },
    {
     "deger": "doga-icinde",
     "etiket": "Doğa İçinde"
    },
    {
     "deger": "bahceli-restoran",
     "etiket": "Bahçeli"
    },
    {
     "deger": "terasli",
     "etiket": "Teraslı"
    },
    {
     "deger": "manzarali",
     "etiket": "Manzaralı"
    },
    {
     "deger": "deniz-kenari",
     "etiket": "Deniz Kenarı"
    },
    {
     "deger": "gol-kenari",
     "etiket": "Göl Kenarı"
    },
    {
     "deger": "dag-yayla",
     "etiket": "Dağ / Yayla"
    },
    {
     "deger": "ciftlikten-sofraya-restoran",
     "etiket": "Çiftlik / Köy"
    },
    {
     "deger": "tas-konak",
     "etiket": "Taş Konak"
    },
    {
     "deger": "endustriyel",
     "etiket": "Endüstriyel"
    },
    {
     "deger": "sanat-ve-kultur",
     "etiket": "Sanat ve Kültür"
    },
    {
     "deger": "yoresel-lezzet-noktasi",
     "etiket": "Yerel Lezzet Noktası"
    },
    {
     "deger": "sef-restorani",
     "etiket": "Şef Restoranı"
    }
   ]
  },
  {
   "anahtar": "mutfak",
   "baslik": "Mutfak",
   "ikon": "utensils",
   "secenekler": [
    {
     "deger": "turk-mutfagi",
     "etiket": "Türk Mutfağı"
    },
    {
     "deger": "ege-mutfagi",
     "etiket": "Ege Mutfağı"
    },
    {
     "deger": "akdeniz-mutfagi",
     "etiket": "Akdeniz Mutfağı"
    },
    {
     "deger": "karadeniz-mutfagi",
     "etiket": "Karadeniz Mutfağı"
    },
    {
     "deger": "guneydogu-mutfagi",
     "etiket": "Güneydoğu Mutfağı"
    },
    {
     "deger": "dogu-anadolu-mutfagi",
     "etiket": "Doğu Anadolu Mutfağı"
    },
    {
     "deger": "ic-anadolu-mutfagi",
     "etiket": "İç Anadolu Mutfağı"
    },
    {
     "deger": "kebap-ocakbasi",
     "etiket": "Kebap / Ocakbaşı"
    },
    {
     "deger": "kahvalti-serpme",
     "etiket": "Kahvaltı / Serpme"
    },
    {
     "deger": "deniz-urunleri",
     "etiket": "Deniz Ürünleri"
    },
    {
     "deger": "italyan-mutfagi",
     "etiket": "İtalyan Mutfağı"
    },
    {
     "deger": "fransiz-mutfagi",
     "etiket": "Fransız Mutfağı"
    },
    {
     "deger": "japon-mutfagi",
     "etiket": "Japon Mutfağı"
    },
    {
     "deger": "cin-mutfagi",
     "etiket": "Çin Mutfağı"
    },
    {
     "deger": "hint-mutfagi",
     "etiket": "Hint Mutfağı"
    },
    {
     "deger": "meksika-mutfagi",
     "etiket": "Meksika Mutfağı"
    },
    {
     "deger": "kore-mutfagi",
     "etiket": "Kore Mutfağı"
    },
    {
     "deger": "anadolu-mutfagi",
     "etiket": "Anadolu Mutfağı"
    }
   ]
  },
  {
   "anahtar": "vesile",
   "baslik": "Kullanım Amacı",
   "ikon": "people-group",
   "secenekler": [
    {
     "deger": "aile-dostu",
     "etiket": "Aile Dostu"
    },
    {
     "deger": "cocuklu-aileler-icin",
     "etiket": "Çocuklu Aileler İçin"
    },
    {
     "deger": "romantik-bulusma",
     "etiket": "Romantik Buluşma"
    },
    {
     "deger": "is-yemegi",
     "etiket": "İş Yemeği"
    },
    {
     "deger": "arkadas-bulusmasi",
     "etiket": "Arkadaş Buluşması"
    },
    {
     "deger": "grup-yemekleri",
     "etiket": "Grup Yemekleri"
    },
    {
     "deger": "ozel-gunler",
     "etiket": "Özel Günler"
    },
    {
     "deger": "dogum-gunu",
     "etiket": "Doğum Günü / Yıldönümü"
    },
    {
     "deger": "kahvalti",
     "etiket": "Kahvaltı"
    },
    {
     "deger": "hizli-yemek",
     "etiket": "Hızlı Yemek"
    },
    {
     "deger": "uzun-sohbet",
     "etiket": "Uzun Sohbet"
    },
    {
     "deger": "calismaya-uygun",
     "etiket": "Çalışmaya Uygun"
    },
    {
     "deger": "tek-basina-yemek",
     "etiket": "Tek Başına Yemek"
    },
    {
     "deger": "turistik-kesif",
     "etiket": "Turistik Keşif"
    },
    {
     "deger": "gece-yemekleri",
     "etiket": "Gece Yemekleri"
    },
    {
     "deger": "aile-yemegi",
     "etiket": "Aile Yemeği"
    },
    {
     "deger": "aksam-yemegi",
     "etiket": "Akşam Yemeği"
    },
    {
     "deger": "evlilik-teklifi",
     "etiket": "Evlilik Teklifi"
    }
   ]
  },
  {
   "anahtar": "fiyat",
   "baslik": "Fiyat",
   "ikon": "turkish-lira-sign",
   "secenekler": [
    {
     "deger": "1",
     "etiket": "Ekonomik",
     "ek": "₺"
    },
    {
     "deger": "2",
     "etiket": "Orta",
     "ek": "₺₺"
    },
    {
     "deger": "3",
     "etiket": "Üst Orta",
     "ek": "₺₺₺"
    },
    {
     "deger": "4",
     "etiket": "Lüks",
     "ek": "₺₺₺₺"
    }
   ]
  },
  {
   "anahtar": "puan",
   "baslik": "Puan",
   "ikon": "star",
   "secenekler": [
    {
     "deger": "45",
     "etiket": "4.5 ve üzeri",
     "yildiz": true
    },
    {
     "deger": "40",
     "etiket": "4.0 ve üzeri",
     "yildiz": true
    },
    {
     "deger": "35",
     "etiket": "3.5 ve üzeri",
     "yildiz": true
    },
    {
     "deger": "yok",
     "etiket": "Henüz değerlendirilmemiş"
    }
   ]
  },
  {
   "anahtar": "hizmet",
   "baslik": "Hizmetler",
   "ikon": "bell-concierge",
   "secenekler": [
    {
     "deger": "rezervasyon-aliyor",
     "etiket": "Rezervasyon"
    },
    {
     "deger": "online-rezervasyon",
     "etiket": "Online Rezervasyon"
    },
    {
     "deger": "paket-servis",
     "etiket": "Paket Servis"
    },
    {
     "deger": "gel-al",
     "etiket": "Gel-Al"
    },
    {
     "deger": "acik-alan",
     "etiket": "Açık Alan"
    },
    {
     "deger": "bahce",
     "etiket": "Bahçe"
    },
    {
     "deger": "teras",
     "etiket": "Teras"
    },
    {
     "deger": "wifi",
     "etiket": "Wi-Fi"
    },
    {
     "deger": "calismaya-uygun",
     "etiket": "Çalışmaya Uygun"
    },
    {
     "deger": "bebek-sandalyesi",
     "etiket": "Çocuk Sandalyesi"
    },
    {
     "deger": "bebek-bakim-alani",
     "etiket": "Bebek Bakım Alanı"
    },
    {
     "deger": "evcil-hayvan-dostu",
     "etiket": "Evcil Hayvan Dostu"
    },
    {
     "deger": "canli-muzik",
     "etiket": "Canlı Müzik"
    },
    {
     "deger": "klima-isitma",
     "etiket": "Klima / Isıtma"
    },
    {
     "deger": "cocuk-dostu",
     "etiket": "Çocuk Dostu"
    },
    {
     "deger": "kredi-karti",
     "etiket": "Kredi Kartı Geçerli"
    },
    {
     "deger": "ozel-gun",
     "etiket": "Özel Günlere Uygun"
    },
    {
     "deger": "grup-rezervasyonu",
     "etiket": "Grup Rezervasyonuna Uygun"
    }
   ]
  },
  {
   "anahtar": "beslenme",
   "baslik": "Beslenme",
   "ikon": "leaf",
   "secenekler": [
    {
     "deger": "vegan",
     "etiket": "Vegan"
    },
    {
     "deger": "vejetaryen",
     "etiket": "Vejetaryen"
    },
    {
     "deger": "glutensiz",
     "etiket": "Glutensiz Seçenek"
    },
    {
     "deger": "sekersiz",
     "etiket": "Şekersiz Seçenek"
    },
    {
     "deger": "saglikli-beslenme",
     "etiket": "Sağlıklı Beslenme"
    },
    {
     "deger": "organik-urun-odakli",
     "etiket": "Organik Ürün Odaklı"
    },
    {
     "deger": "alerjen-bilgisi",
     "etiket": "Alerjen Bilgisi Sunan"
    }
   ]
  },
  {
   "anahtar": "ulasim",
   "baslik": "Ulaşım",
   "ikon": "wheelchair",
   "secenekler": [
    {
     "deger": "otopark",
     "etiket": "Otopark"
    },
    {
     "deger": "ozel-otopark",
     "etiket": "Özel Otopark"
    },
    {
     "deger": "vale",
     "etiket": "Vale"
    },
    {
     "deger": "toplu-tasimaya-yakin",
     "etiket": "Toplu Taşımaya Yakın"
    },
    {
     "deger": "metroya-yakin",
     "etiket": "Metroya Yakın"
    },
    {
     "deger": "engelli-erisimi",
     "etiket": "Engelli Erişimi"
    },
    {
     "deger": "tekerlekli-sandalye-erisimi",
     "etiket": "Tekerlekli Sandalye Erişimi"
    },
    {
     "deger": "giris-rampasi",
     "etiket": "Giriş Rampası"
    },
    {
     "deger": "asansor",
     "etiket": "Asansör"
    },
    {
     "deger": "bebek-arabasiyla-erisim",
     "etiket": "Bebek Arabasıyla Erişim"
    }
   ]
  },
  {
   "anahtar": "acik",
   "baslik": "Açık Olma",
   "ikon": "door-open",
   "secenekler": [
    {
     "deger": "simdi",
     "etiket": "Şimdi açık"
    },
    {
     "deger": "bugun",
     "etiket": "Bugün açık"
    },
    {
     "deger": "gece",
     "etiket": "Gece açık"
    },
    {
     "deger": "sabah",
     "etiket": "Sabah erken açık"
    },
    {
     "deger": "hafta-sonu",
     "etiket": "Hafta sonu açık"
    },
    {
     "deger": "24-saat",
     "etiket": "24 saat açık"
    },
    {
     "deger": "rezervasyon",
     "etiket": "Rezervasyon alıyor"
    }
   ]
  },
  {
   "anahtar": "seckiler",
   "baslik": "Seçkiler",
   "ikon": "award",
   "secenekler": [
    {
     "deger": "dada",
     "etiket": "Dada Seçkisi"
    },
    {
     "deger": "rota",
     "etiket": "Dada Route Durağı"
    },
    {
     "deger": "yeni",
     "etiket": "Yeni Eklenenler"
    }
   ]
  }
 ],
 "yemekler": [
  {
   "ad": "Izgara tavuk göğsü",
   "mutfaklar": [
    "Türk Mutfağı"
   ],
   "mutfakSlug": [
    "turk-mutfagi"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 226.0,
   "P": 45.8,
   "K": 0.0,
   "Y": 4.8,
   "ipucu": null,
   "diyetEtiketleri": [
    "glutensiz",
    "yuksek-protein",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [],
   "besinSlug": "tavuk-gogsu-izgara",
   "tahmini": true
  },
  {
   "ad": "Pirinç pilavı",
   "mutfaklar": [
    "Türk Mutfağı"
   ],
   "mutfakSlug": [
    "turk-mutfagi"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 195.0,
   "P": 4.0,
   "K": 42.3,
   "Y": 0.4,
   "ipucu": "Yarım porsiyon iste ya da pilavın yanına salata ekle; pilav çoğunlukla tereyağıyla pişer.",
   "diyetEtiketleri": [
    "vejetaryen",
    "glutensiz"
   ],
   "alerjenler": [
    "sut"
   ],
   "besinSlug": "pirinc-pismis",
   "tahmini": true
  },
  {
   "ad": "Humus",
   "mutfaklar": [
    "Akdeniz Mutfağı"
   ],
   "mutfakSlug": [
    "akdeniz-mutfagi"
   ],
   "porsiyon": {
    "ad": "100 g",
    "gram": 100
   },
   "kcal": 177.0,
   "P": 4.9,
   "K": 20.1,
   "Y": 8.6,
   "ipucu": null,
   "diyetEtiketleri": [
    "vejetaryen",
    "bitkisel",
    "glutensiz"
   ],
   "alerjenler": [
    "susam"
   ],
   "besinSlug": "humus-ev-yapimi",
   "tahmini": true
  },
  {
   "ad": "Zeytinyağlı yaprak sarma",
   "mutfaklar": [
    "Akdeniz Mutfağı",
    "Ege Mutfağı"
   ],
   "mutfakSlug": [
    "akdeniz-mutfagi",
    "ege-mutfagi"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 274.0,
   "P": 4.2,
   "K": 37.6,
   "Y": 10.6,
   "ipucu": null,
   "diyetEtiketleri": [
    "vejetaryen",
    "bitkisel"
   ],
   "alerjenler": [],
   "besinSlug": "yaprak-sarma-zeytinyagli",
   "tahmini": true
  },
  {
   "ad": "Bulgur pilavı",
   "mutfaklar": [
    "Anadolu Mutfağı"
   ],
   "mutfakSlug": [
    "anadolu-mutfagi"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 124.0,
   "P": 4.6,
   "K": 27.9,
   "Y": 0.4,
   "ipucu": null,
   "diyetEtiketleri": [
    "vejetaryen",
    "bitkisel"
   ],
   "alerjenler": [
    "gluten"
   ],
   "besinSlug": "bulgur-pismis",
   "tahmini": true
  },
  {
   "ad": "Izgara levrek",
   "mutfaklar": [
    "Deniz Ürünleri"
   ],
   "mutfakSlug": [
    "deniz-urunleri"
   ],
   "porsiyon": {
    "ad": "200 g",
    "gram": 200
   },
   "kcal": 248.0,
   "P": 47.3,
   "K": 0.0,
   "Y": 5.1,
   "ipucu": null,
   "diyetEtiketleri": [
    "glutensiz",
    "yuksek-protein",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [
    "balik"
   ],
   "besinSlug": "levrek-izgara",
   "tahmini": true
  },
  {
   "ad": "Haşlanmış karides",
   "mutfaklar": [
    "Deniz Ürünleri"
   ],
   "mutfakSlug": [
    "deniz-urunleri"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 178.0,
   "P": 34.2,
   "K": 2.3,
   "Y": 2.5,
   "ipucu": null,
   "diyetEtiketleri": [
    "glutensiz",
    "yuksek-protein",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [
    "kabuklu-deniz"
   ],
   "besinSlug": "karides-haslanmis",
   "tahmini": true
  },
  {
   "ad": "Izgara kuzu pirzola",
   "mutfaklar": [
    "Kebap & Ocakbaşı"
   ],
   "mutfakSlug": [
    "kebap-ocakbasi"
   ],
   "porsiyon": {
    "ad": "150 g",
    "gram": 150
   },
   "kcal": 474.0,
   "P": 37.8,
   "K": 0.0,
   "Y": 34.6,
   "ipucu": "Yağlı bir et: porsiyonu küçük tut, yanına közlenmiş sebze ya da salata iste.",
   "diyetEtiketleri": [
    "glutensiz",
    "yuksek-protein",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [],
   "besinSlug": "kuzu-pirzola-izgara",
   "tahmini": true
  },
  {
   "ad": "Omlet",
   "mutfaklar": [
    "Kahvaltı & Serpme"
   ],
   "mutfakSlug": [
    "kahvalti-serpme"
   ],
   "porsiyon": {
    "ad": "120 g",
    "gram": 120
   },
   "kcal": 185.0,
   "P": 12.7,
   "K": 0.8,
   "Y": 14.0,
   "ipucu": null,
   "diyetEtiketleri": [
    "vejetaryen",
    "glutensiz",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [
    "yumurta",
    "sut"
   ],
   "besinSlug": "omlet",
   "tahmini": true
  },
  {
   "ad": "Beyaz peynir",
   "mutfaklar": [
    "Kahvaltı & Serpme"
   ],
   "mutfakSlug": [
    "kahvalti-serpme"
   ],
   "porsiyon": {
    "ad": "40 g",
    "gram": 40
   },
   "kcal": 124.0,
   "P": 6.4,
   "K": 3.3,
   "Y": 9.4,
   "ipucu": null,
   "diyetEtiketleri": [
    "vejetaryen",
    "glutensiz",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [
    "sut"
   ],
   "besinSlug": "beyaz-peynir-tam-yagli",
   "tahmini": true
  },
  {
   "ad": "Makarna (sossuz)",
   "mutfaklar": [
    "İtalyan Mutfağı"
   ],
   "mutfakSlug": [
    "italyan-mutfagi"
   ],
   "porsiyon": {
    "ad": "200 g",
    "gram": 200
   },
   "kcal": 316.0,
   "P": 11.6,
   "K": 61.8,
   "Y": 1.9,
   "ipucu": "Sos kaloriyi belirgin artırır: kremalı yerine domates soslu seç, sosu ayrı iste.",
   "diyetEtiketleri": [
    "vejetaryen",
    "bitkisel"
   ],
   "alerjenler": [
    "gluten"
   ],
   "besinSlug": "makarna-haslanmis",
   "tahmini": true
  },
  {
   "ad": "Pişmiş somon",
   "mutfaklar": [
    "Japon Mutfağı"
   ],
   "mutfakSlug": [
    "japon-mutfagi"
   ],
   "porsiyon": {
    "ad": "120 g",
    "gram": 120
   },
   "kcal": 247.0,
   "P": 26.5,
   "K": 0.0,
   "Y": 14.8,
   "ipucu": "Soya sosu ve teriyaki glüten ve tuz ekler; sosu ayrı iste.",
   "diyetEtiketleri": [
    "glutensiz",
    "yuksek-protein",
    "dusuk-karbonhidrat"
   ],
   "alerjenler": [
    "balik"
   ],
   "besinSlug": "somon-atlantik-ciftlik",
   "tahmini": true
  }
 ],
 "yemekNotu": "Değerler tahminidir; bu yemekler bu mutfakta sık bulunur, mekanın menüsü değildir.",
 "rehberBaslik": "Dışarıda Yemek Rehberleri",
 "rehberler": [
  "cin-ve-tayland-restoraninda-secim-nasil-yapilir",
  "hint-restoraninda-secim-nasil-yapilir",
  "porsiyon-kontrolu",
  "tabak-duzeni-porsiyonu-nasil-etkiler",
  "ogun-planlama",
  "dengeli-tabak"
 ],
 "rehberWebBasliklar": [
  "Restoran menüsü nasıl okunur?",
  "Paket siparişte neler değişir?",
  "Hızlı servis restoranında seçim nasıl yapılır?",
  "Seyahatte öğün düzeni nasıl kurulur?",
  "Davet sofrasında porsiyon nasıl yönetilir?",
  "Dışarıda kahvaltı nasıl seçilir?"
 ],
 "bos": {
  "baslik": "Bu filtreyle henüz mekan yok",
  "metin": "Seçimlerini azaltmayı dene ya da seçili filtreleri temizle.",
  "eylem": "Seçili Filtreleri Temizle"
 },
 "yakinim": {
  "etiket": "Yakınımdakileri göster",
  "basari": "Mekanlar sana yakınlığa göre sıralandı.",
  "hata": "Konumuna ulaşılamadı, tarayıcı iznini kontrol et."
 },
 "bilgiNotu": "Bu sayfa genel bilgilendirme amaçlıdır; **tıbbi teşhis veya tedavi yerine geçmez**. Alerjin ya da klinik bir durumun varsa siparişten önce mekana danış."
};
