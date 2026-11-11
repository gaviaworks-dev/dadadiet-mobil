/* veri/denge.js — Denge & Tabak. Dil canlı /beslenme/dengeli-tabak, /beslenme/disarida-yemek, /kac-kalori. Kalori ve makrolar DDV.besinler / DDV.yemekler kaynağından hesaplanır.
 * Denge Skoru bileşen puanları kaynaksız kurgu değerdir; toplamları skor ile aynıdır (28+20+19+15=82).
 * DDV.denge.tabak: { baslik, ogun, gorsel, skor (/100), skorEtiket, bilesenler:[{ id, ad, ikon, puan, enCok, oran (%), hedefOran (%), yorum }], oneriler:[{ikon,baslik,metin,puanArtisi}], rehber:{baslik,metin,kaynak}, haftalik:[{gun,skor}] }
 * DDV.denge.muadiller:[{ baslik, ikon, secenekler:[{ kaynak:{slug,ad,porsiyon,gram,kcal,P,K,Y,Lif,gorsel}, muadil:{...}, kcalFark, gerekce }] }]
 * DDV.denge.kurtarma: { baslik, altMetin, not, senaryolar:[{ id, ad, slug, porsiyon, gram (null: yemek porsiyonu), kcal, P, K, Y, Lif, gorsel (null olabilir), ikon, mesaj, adimlar:[{ikon,baslik,metin}] }] }
 * DDV.denge.kiyasla: { baslik, altMetin, hazirlar:[{id,ad,a,b,gram}], olcutler:[{id,ad,birim}] }
 */
window.DDV = window.DDV || {};
DDV.denge = {
 "tabak": {
  "baslik": "Bugünkü tabağın",
  "ogun": "Öğle Yemeği",
  "gorsel": "assets/gorsel/hero/karsilama.webp",
  "skor": 82,
  "skorEtiket": "Dengeli",
  "bilesenler": [
   {
    "id": "protein",
    "ad": "Protein",
    "ikon": "drumstick-bite",
    "puan": 28,
    "enCok": 30,
    "oran": 24,
    "hedefOran": 25,
    "yorum": "Hedefe çok yakın."
   },
   {
    "id": "sebze",
    "ad": "Sebze",
    "ikon": "carrot",
    "puan": 20,
    "enCok": 30,
    "oran": 35,
    "hedefOran": 50,
    "yorum": "Tabağın yarısını hedefle."
   },
   {
    "id": "tahil",
    "ad": "Tahıl",
    "ikon": "wheat-awn",
    "puan": 19,
    "enCok": 20,
    "oran": 26,
    "hedefOran": 25,
    "yorum": "Tam tahıl tercihin güzel."
   },
   {
    "id": "yag",
    "ad": "Yağ",
    "ikon": "droplet",
    "puan": 15,
    "enCok": 20,
    "oran": 15,
    "hedefOran": 10,
    "yorum": "Sıvı yağ ölçüsüne dikkat."
   }
  ],
  "oneriler": [
   {
    "ikon": "leaf",
    "baslik": "Yarım tabak sebze",
    "metin": "Bir kâse salata ekle; hem lif hem hacim kazanırsın.",
    "puanArtisi": 7
   },
   {
    "ikon": "scale-balanced",
    "baslik": "Zeytinyağını tatlı kaşığıyla ölç",
    "metin": "Dökerek değil, ölçerek ekle.",
    "puanArtisi": 3
   },
   {
    "ikon": "palette",
    "baslik": "Renkleri artır",
    "metin": "Kırmızı, yeşil ve turuncu sebzeler bir arada besin çeşitliliği getirir.",
    "puanArtisi": 2
   }
  ],
  "rehber": {
   "baslik": "Dengeli tabak nasıl kurulur?",
   "metin": "Tabağının yaklaşık yarısını sebze ve yeşilliklerle, kalan yarısını eşit ağırlıkta protein ve tahıl/nişastalarla doldur. Bu bir kural değil, tabağını kurgularken zihinsel bir kılavuzdur.",
   "kaynak": "Dada Diet · Dengeli Tabak rehberi"
  },
  "haftalik": [
   {
    "gun": "Cmt",
    "skor": 74
   },
   {
    "gun": "Paz",
    "skor": 68
   },
   {
    "gun": "Pzt",
    "skor": 79
   },
   {
    "gun": "Sal",
    "skor": 85
   },
   {
    "gun": "Çar",
    "skor": 81
   },
   {
    "gun": "Per",
    "skor": 77
   },
   {
    "gun": "Cum",
    "skor": 82
   }
  ]
 },
 "muadiller": [
  {
   "baslik": "Ekmek",
   "ikon": "bread-slice",
   "secenekler": [
    {
     "kaynak": {
      "slug": "beyaz-ekmek",
      "ad": "Beyaz Ekmek",
      "porsiyon": "2 ince dilim",
      "gram": 50,
      "kcal": 138,
      "P": 4.7,
      "K": 25.1,
      "Y": 1.6,
      "Lif": 2.1,
      "gorsel": null
     },
     "muadil": {
      "slug": "tam-bugday-ekmegi",
      "ad": "Tam Buğday Ekmeği",
      "porsiyon": "2 ince dilim",
      "gram": 50,
      "kcal": 129,
      "P": 5.4,
      "K": 21.9,
      "Y": 1.7,
      "Lif": 2.5,
      "gorsel": "assets/gorsel/besin/tam-bugday-ekmegi.webp"
     },
     "kcalFark": -9,
     "gerekce": "Kalorisi yakın, lifi daha yüksek; daha uzun tok tutar."
    },
    {
     "kaynak": {
      "slug": "simit",
      "ad": "Simit",
      "porsiyon": "1 adet",
      "gram": 100,
      "kcal": 368,
      "P": 12.1,
      "K": 38.4,
      "Y": 16.5,
      "Lif": 8.9,
      "gorsel": null
     },
     "muadil": {
      "slug": "tam-bugday-ekmegi",
      "ad": "Tam Buğday Ekmeği",
      "porsiyon": "2 ince dilim",
      "gram": 50,
      "kcal": 129,
      "P": 5.4,
      "K": 21.9,
      "Y": 1.7,
      "Lif": 2.5,
      "gorsel": "assets/gorsel/besin/tam-bugday-ekmegi.webp"
     },
     "kcalFark": -239,
     "gerekce": "Üçte biri kadar enerjiyle aynı kahvaltı rolü."
    }
   ]
  },
  {
   "baslik": "Pilav",
   "ikon": "bowl-rice",
   "secenekler": [
    {
     "kaynak": {
      "slug": "pirinc-pismis",
      "ad": "Pirinç Pilavı (sade · pişmiş)",
      "porsiyon": "1 silme kepçe",
      "gram": 90,
      "kcal": 117,
      "P": 2.4,
      "K": 25.4,
      "Y": 0.3,
      "Lif": 0.4,
      "gorsel": "assets/gorsel/besin/pirinc-pismis.webp"
     },
     "muadil": {
      "slug": "bulgur-pismis",
      "ad": "Bulgur (pişmiş)",
      "porsiyon": "1 silme kepçe",
      "gram": 90,
      "kcal": 75,
      "P": 2.8,
      "K": 16.7,
      "Y": 0.2,
      "Lif": 4.0,
      "gorsel": "assets/gorsel/besin/bulgur-pismis.webp"
     },
     "kcalFark": -42,
     "gerekce": "Aynı ölçüde daha az kalori, daha çok lif."
    },
    {
     "kaynak": {
      "slug": "makarna-haslanmis",
      "ad": "Makarna (haşlanmış)",
      "porsiyon": "2 silme kepçe",
      "gram": 150,
      "kcal": 237,
      "P": 8.7,
      "K": 46.3,
      "Y": 1.4,
      "Lif": 2.7,
      "gorsel": "assets/gorsel/besin/makarna-haslanmis.webp"
     },
     "muadil": {
      "slug": "tam-bugday-makarna",
      "ad": "Tam Buğday Makarna (haşlanmış)",
      "porsiyon": "2 silme kepçe",
      "gram": 150,
      "kcal": 224,
      "P": 9.0,
      "K": 45.2,
      "Y": 2.5,
      "Lif": 5.8,
      "gorsel": "assets/gorsel/besin/tam-bugday-makarna.webp"
     },
     "kcalFark": -13,
     "gerekce": "Tam tahıl; lif farkı doygunluğu uzatır."
    }
   ]
  },
  {
   "baslik": "Süt ürünleri",
   "ikon": "cheese",
   "secenekler": [
    {
     "kaynak": {
      "slug": "kasar-peyniri-taze",
      "ad": "Kaşar Peyniri (taze)",
      "porsiyon": "1 kibrit kutusu",
      "gram": 30,
      "kcal": 106,
      "P": 8.1,
      "K": 0.8,
      "Y": 7.8,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/kasar-peyniri-taze.webp"
     },
     "muadil": {
      "slug": "beyaz-peynir-yarim-yagli",
      "ad": "Beyaz Peynir (yarım yağlı)",
      "porsiyon": "1 kibrit kutusu",
      "gram": 30,
      "kcal": 61,
      "P": 4.7,
      "K": 3.7,
      "Y": 3.0,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/beyaz-peynir-yarim-yagli.webp"
     },
     "kcalFark": -45,
     "gerekce": "Aynı dilimde daha az yağ."
    },
    {
     "kaynak": {
      "slug": "yogurt-tam-yagli",
      "ad": "Yoğurt (tam yağlı)",
      "porsiyon": "1 kupa",
      "gram": 240,
      "kcal": 166,
      "P": 10.8,
      "K": 10.1,
      "Y": 9.1,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/yogurt-tam-yagli.webp"
     },
     "muadil": {
      "slug": "yogurt-yarim-yagli",
      "ad": "Yoğurt (yarım yağlı)",
      "porsiyon": "1 kupa",
      "gram": 240,
      "kcal": 118,
      "P": 10.3,
      "K": 9.4,
      "Y": 4.3,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/yogurt-yarim-yagli.webp"
     },
     "kcalFark": -48,
     "gerekce": "Protein aynı kalırken yağ azalır."
    }
   ]
  },
  {
   "baslik": "Et",
   "ikon": "drumstick-bite",
   "secenekler": [
    {
     "kaynak": {
      "slug": "dana-kiyma-pismis",
      "ad": "Dana Kıyma (pişmiş)",
      "porsiyon": "3-4 adet köfte",
      "gram": 80,
      "kcal": 192,
      "P": 20.1,
      "K": 0.5,
      "Y": 11.6,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/dana-kiyma-pismis.webp"
     },
     "muadil": {
      "slug": "hindi-kiyma-pismis",
      "ad": "Hindi Kıyma (pişmiş)",
      "porsiyon": "3-4 adet köfte",
      "gram": 80,
      "kcal": 162,
      "P": 21.9,
      "K": 0.0,
      "Y": 8.3,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/hindi-kiyma-pismis.webp"
     },
     "kcalFark": -30,
     "gerekce": "Aynı porsiyonda daha az yağ, biraz daha çok protein."
    },
    {
     "kaynak": {
      "slug": "sucuk-isil-islem-gormus",
      "ad": "Sucuk (ısıl işlem görmüş · dana)",
      "porsiyon": "5 dilim",
      "gram": 50,
      "kcal": 198,
      "P": 7.9,
      "K": 1.1,
      "Y": 17.6,
      "Lif": 1.9,
      "gorsel": "assets/gorsel/besin/sucuk-isil-islem-gormus.webp"
     },
     "muadil": {
      "slug": "hindi-gogsu-firinda",
      "ad": "Hindi Göğsü (fırında · derili)",
      "porsiyon": "3 dilim",
      "gram": 50,
      "kcal": 94,
      "P": 14.3,
      "K": 0.0,
      "Y": 3.7,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/hindi-gogsu-firinda.webp"
     },
     "kcalFark": -104,
     "gerekce": "Kahvaltıda daha fazla protein, çok daha az yağ."
    }
   ]
  },
  {
   "baslik": "Atıştırmalık",
   "ikon": "cookie-bite",
   "secenekler": [
    {
     "kaynak": {
      "slug": "patates-cipsi",
      "ad": "Patates Cipsi",
      "porsiyon": "1 avuç",
      "gram": 30,
      "kcal": 155,
      "P": 1.7,
      "K": 15.6,
      "Y": 9.1,
      "Lif": 2.0,
      "gorsel": null
     },
     "muadil": {
      "slug": "leblebi",
      "ad": "Leblebi",
      "porsiyon": "1 avuç",
      "gram": 30,
      "kcal": 118,
      "P": 6.5,
      "K": 16.3,
      "Y": 2.2,
      "Lif": 3.5,
      "gorsel": null
     },
     "kcalFark": -37,
     "gerekce": "Çıtırlık kalır, yağ düşer, protein ve lif artar."
    },
    {
     "kaynak": {
      "slug": "sutlu-cikolata",
      "ad": "Sütlü Çikolata",
      "porsiyon": "2 kare",
      "gram": 20,
      "kcal": 111,
      "P": 1.1,
      "K": 10.6,
      "Y": 6.9,
      "Lif": 0.9,
      "gorsel": null
     },
     "muadil": {
      "slug": "bitter-cikolata",
      "ad": "Bitter Çikolata (%70–85)",
      "porsiyon": "2 kare",
      "gram": 20,
      "kcal": 120,
      "P": 1.6,
      "K": 9.2,
      "Y": 8.5,
      "Lif": 2.2,
      "gorsel": null
     },
     "kcalFark": 9,
     "gerekce": "Şeker azalır; iki kare aynı tadı verir."
    },
    {
     "kaynak": {
      "slug": "kaju-kavrulmus",
      "ad": "Kaju (kuru kavrulmuş · tuzsuz)",
      "porsiyon": "1 avuç",
      "gram": 30,
      "kcal": 172,
      "P": 4.6,
      "K": 9.8,
      "Y": 13.9,
      "Lif": 0.9,
      "gorsel": "assets/gorsel/besin/kaju-kavrulmus.webp"
     },
     "muadil": {
      "slug": "badem",
      "ad": "Badem",
      "porsiyon": "1 avuç",
      "gram": 30,
      "kcal": 174,
      "P": 6.3,
      "K": 6.5,
      "Y": 15.0,
      "Lif": 3.8,
      "gorsel": "assets/gorsel/besin/badem.webp"
     },
     "kcalFark": 2,
     "gerekce": "Lifi çok daha yüksek."
    }
   ]
  },
  {
   "baslik": "İçecek",
   "ikon": "glass-water",
   "secenekler": [
    {
     "kaynak": {
      "slug": "kola",
      "ad": "Kola",
      "porsiyon": "1 kupa",
      "gram": 240,
      "kcal": 103,
      "P": 0.0,
      "K": 25.7,
      "Y": 0.0,
      "Lif": 0.0,
      "gorsel": null
     },
     "muadil": {
      "slug": "ayran-tam-yagli",
      "ad": "Ayran (tam yağlı)",
      "porsiyon": "1 kupa",
      "gram": 240,
      "kcal": 89,
      "P": 4.8,
      "K": 6.5,
      "Y": 4.8,
      "Lif": 0.0,
      "gorsel": "assets/gorsel/besin/ayran-tam-yagli.webp"
     },
     "kcalFark": -14,
     "gerekce": "Şeker yerine protein gelir."
    },
    {
     "kaynak": {
      "slug": "nar-suyu",
      "ad": "Nar Suyu",
      "porsiyon": "1 kupa",
      "gram": 240,
      "kcal": 127,
      "P": 0.0,
      "K": 31.2,
      "Y": 0.2,
      "Lif": 0.0,
      "gorsel": null
     },
     "muadil": {
      "slug": "nar-hicaz",
      "ad": "Nar (Hicaz)",
      "porsiyon": "1 küçük kâse",
      "gram": 150,
      "kcal": 92,
      "P": 0.4,
      "K": 14.0,
      "Y": 0.3,
      "Lif": 15.3,
      "gorsel": "assets/gorsel/besin/nar-hicaz.webp"
     },
     "kcalFark": -35,
     "gerekce": "Meyve suyu yerine meyve: lif kalır, doygunluk artar."
    }
   ]
  }
 ],
 "kurtarma": {
  "baslik": "Kaçamak Kurtarma",
  "altMetin": "Bir öğün planı bozmaz. Neyi yediğini seç, sana üç küçük adım önerelim.",
  "senaryolar": [
   {
    "id": "baklava",
    "ad": "Baklava yedim",
    "slug": "baklava-cevizli",
    "porsiyon": "2 dilim",
    "gram": 80,
    "kcal": 361,
    "P": 3.3,
    "K": 43.8,
    "Y": 18.1,
    "Lif": 5.0,
    "gorsel": null,
    "mesaj": "Tek bir tatlı günü belirlemez. Belirleyici olan genel örüntü; günün akışına dönmen yeterli.",
    "adimlar": [
     {
      "ikon": "droplet",
      "baslik": "Bir bardak su iç",
      "metin": "Tatlıdan sonra susama hissi artar. Bir bardak su ekle."
     },
     {
      "ikon": "plate-wheat",
      "baslik": "Akşamı sebze ve proteinle kur",
      "metin": "Tabağın yarısı sebze, çeyreği protein. Öğün atlama."
     },
     {
      "ikon": "person-walking",
      "baslik": "20 dakika yürü",
      "metin": "Hareket keyfini de toparlar. Zorunlu değil, iyi gelirse yap."
     }
    ],
    "ikon": "cookie-bite"
   },
   {
    "id": "pide",
    "ad": "Pide yedim",
    "slug": "kasarli-pide",
    "porsiyon": "1 porsiyon",
    "gram": null,
    "kcal": 467,
    "P": 20.9,
    "K": 65.0,
    "Y": 11.8,
    "Lif": null,
    "gorsel": "assets/gorsel/yemek/kasarli-pide.webp",
    "mesaj": "Güzel bir öğünmüş. Sonraki öğünü atlamadan olağan düzene dönelim.",
    "adimlar": [
     {
      "ikon": "leaf",
      "baslik": "Bir sonraki öğüne yeşillik ekle",
      "metin": "Salata hacim verir, lif hedefini destekler."
     },
     {
      "ikon": "drumstick-bite",
      "baslik": "Proteini koru",
      "metin": "Akşam öğününde 100-120 g ızgara ya da baklagil yeterli."
     },
     {
      "ikon": "droplet",
      "baslik": "Su hedefini tamamla",
      "metin": "Tuzlu yiyeceklerden sonra su iyi gelir."
     }
    ],
    "ikon": "pizza-slice"
   },
   {
    "id": "cips",
    "ad": "Cips yedim",
    "slug": "patates-cipsi",
    "porsiyon": "Yarım paket",
    "gram": 60,
    "kcal": 310,
    "P": 3.5,
    "K": 31.1,
    "Y": 18.1,
    "Lif": 4.0,
    "gorsel": null,
    "mesaj": "Atıştırmak olağan. Bir sonraki adımı planlamak, geriye bakmaktan daha işe yarar.",
    "adimlar": [
     {
      "ikon": "droplet",
      "baslik": "İki bardak su iç",
      "metin": "Tuz miktarı yüksek; su iyi gelir."
     },
     {
      "ikon": "apple-whole",
      "baslik": "Ara öğünü meyveyle geç",
      "metin": "Bugünün kalan ara öğününü bir meyveye bırak."
     },
     {
      "ikon": "bowl-food",
      "baslik": "Akşamı hafif tut",
      "metin": "Çorba ve salata ikilisi hem doyurur hem dengeler."
     }
    ],
    "ikon": "cookie"
   },
   {
    "id": "dondurma",
    "ad": "Dondurma yedim",
    "slug": "maras-dondurmasi",
    "porsiyon": "2 top",
    "gram": 100,
    "kcal": 176,
    "P": 4.8,
    "K": 31.8,
    "Y": 3.3,
    "Lif": 0.0,
    "gorsel": "assets/gorsel/yemek/cilekli-donmus-yogurt.webp",
    "mesaj": "Keyif de planın parçası. Günün geri kalanına devam.",
    "adimlar": [
     {
      "ikon": "plate-wheat",
      "baslik": "Öğünü atlama",
      "metin": "Sonraki öğünü olduğu gibi ye, porsiyonu değiştirme."
     },
     {
      "ikon": "leaf",
      "baslik": "Lif ekle",
      "metin": "Tabağa bir kepçe bulgur ya da baklagil koy."
     },
     {
      "ikon": "person-walking",
      "baslik": "Kısa bir yürüyüş",
      "metin": "15 dakikalık yürüyüş sindirime iyi gelir."
     }
    ],
    "ikon": "ice-cream"
   },
   {
    "id": "manti",
    "ad": "Mantı yedim",
    "slug": "manti",
    "porsiyon": "1 porsiyon",
    "gram": null,
    "kcal": 500,
    "P": 27.9,
    "K": 69.5,
    "Y": 10.5,
    "Lif": null,
    "gorsel": "assets/gorsel/yemek/manti.webp",
    "mesaj": "Ev sofrasının hakkı var. Gün bitmedi, plana kaldığın yerden devam.",
    "adimlar": [
     {
      "ikon": "droplet",
      "baslik": "Su ekle",
      "metin": "Bir bardak su ile başla."
     },
     {
      "ikon": "carrot",
      "baslik": "Akşama sebze koy",
      "metin": "Bir kâse zeytinyağlı sebze yeterli."
     },
     {
      "ikon": "moon",
      "baslik": "Pencereni koru",
      "metin": "Oruç saatini değiştirmene gerek yok."
     }
    ],
    "ikon": "bowl-food"
   }
  ],
  "not": "Bir sonraki öğünü atlamak ya da ertesi gün dengelemeye çalışmak çoğu zaman geri teper; gün akışını olağan hâline döndürmek yeterlidir."
 },
 "kiyasla": {
  "baslik": "Besin Kıyasla",
  "altMetin": "İki besini aynı ölçüde yan yana gör.",
  "hazirlar": [
   {
    "id": "ekmek",
    "ad": "Beyaz ekmek ve tam buğday",
    "a": "beyaz-ekmek",
    "b": "tam-bugday-ekmegi",
    "gram": 50
   },
   {
    "id": "pilav",
    "ad": "Pirinç ve bulgur",
    "a": "pirinc-pismis",
    "b": "bulgur-pismis",
    "gram": 90
   },
   {
    "id": "peynir",
    "ad": "Kaşar ve beyaz peynir",
    "a": "kasar-peyniri-taze",
    "b": "beyaz-peynir-yarim-yagli",
    "gram": 30
   },
   {
    "id": "yemis",
    "ad": "Badem ve ceviz",
    "a": "badem",
    "b": "ceviz-ic",
    "gram": 30
   },
   {
    "id": "kinoa",
    "ad": "Kinoa ve pirinç",
    "a": "kinoa-pismis",
    "b": "pirinc-pismis",
    "gram": 90
   },
   {
    "id": "somon-tavuk",
    "ad": "Somon ve tavuk göğsü",
    "a": "somon-atlantik-ciftlik",
    "b": "tavuk-gogsu-izgara",
    "gram": null
   },
   {
    "id": "yaglar",
    "ad": "Zeytinyağı ve tereyağı",
    "a": "zeytinyagi",
    "b": "tereyagi",
    "gram": null
   },
   {
    "id": "meyve",
    "ad": "Elma ve muz",
    "a": "elma-fuji",
    "b": "muz-anamur",
    "gram": 100
   },
   {
    "id": "balik",
    "ad": "Levrek ve somon",
    "a": "levrek-izgara",
    "b": "somon-atlantik-ciftlik",
    "gram": 150
   },
   {
    "id": "protein",
    "ad": "Tavuk ve hindi",
    "a": "tavuk-gogsu-izgara",
    "b": "hindi-gogsu-firinda",
    "gram": 100
   },
   {
    "id": "baklagil",
    "ad": "Nohut ve mercimek",
    "a": "nohut-haslanmis",
    "b": "mercimek-haslanmis",
    "gram": 130
   }
  ],
  "olcutler": [
   {
    "id": "kcal",
    "ad": "Enerji",
    "birim": "kcal"
   },
   {
    "id": "P",
    "ad": "Protein",
    "birim": "g"
   },
   {
    "id": "K",
    "ad": "Karbonhidrat",
    "birim": "g"
   },
   {
    "id": "Y",
    "ad": "Yağ",
    "birim": "g"
   },
   {
    "id": "Lif",
    "ad": "Lif",
    "birim": "g"
   }
  ]
 }
};
