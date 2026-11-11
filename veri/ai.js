/* veri/ai.js — Dada AI ekranları. Besin ve yemek değerleri DDV.besinler / DDV.yemekler ile aynı kaynaktan hesaplanır.
 * Barkod ürünleri ve EAN'lar kurgusaldır: marka yok, jenerik adlar; EAN kontrol hanesi geçerli. Besin değerleri ürün tipine göre kaynaksız yaklaşık değerlerdir.
 * DDV.ai.kamera: { modlar:[{id,ad,ikon,ipucu}], galeri, mikrofon, islem[] }
 * DDV.ai.tabak: { gorsel, baslik, ogunOnerisi, toplam:{kcal,P,K,Y,Lif,gram}, guvenOrtalama, not, bilesenler:[{ id, ad, slug, gram, kcal, P, K, Y, Lif, guven (%), bbox:{x,y,w,h} (% görsel), alternatif? }] }
 * DDV.ai.disarida: { baslik, altMetin, mekan, hedef:{kalanKcal,proteinAcigi,ogun}, tabaklar:[{ slug, ad, gorsel, kcal, P, K, Y, puan (/100), etiket, enUygun, gerekce?, uyari? }], kurallar[], not }
 * DDV.ai.tahlil: { baslik, tahlil, tarihMetin, okunanDeger, normal, dikkat, satirlar[], sonraki[], uyari }
 * DDV.ai.ses: { baslik, ipucu, dinleniyor, cozumleniyor, hazirCumleler[], sonuclar:[{ id, transkript, ogun, besinler:[{ad,slug,miktar,birim,gram,kcal,P,K,Y,Lif}], toplamKcal }] }
 * DDV.ai.barkod: { baslik, ipucu, skorAciklama, urunler:[{ ean, ad, kategori, porsiyonGram, icindekiler[], deger100:{kcal,P,K,seker,Y,doymusYag,Lif,tuz}, skor, skorEtiket, uyarilar[], katkiMaddeleri:[{kod,ad,islev,risk}], olumlu[], alternatif:{ean,ad,skor,neden}|null }] }
 * DDV.ai.etiket: { urun (ean), baslik, ipucu, satirlar:[{metin,aciklama,durum ('iyi'|'dikkat'|'notr')}], ozet, alternatif }
 */
window.DDV = window.DDV || {};
DDV.ai = {
 "kamera": {
  "modlar": [
   {
    "id": "tabak",
    "ad": "Tabak Tara",
    "ikon": "utensils",
    "ipucu": "Tabağı çerçeveye al"
   },
   {
    "id": "menu",
    "ad": "Menü Oku",
    "ikon": "book-open",
    "ipucu": "Menüyü düz tut, sayfanın tamamı görünsün"
   },
   {
    "id": "tahlil",
    "ad": "Tahlil Tara",
    "ikon": "file-medical",
    "ipucu": "Tahlil kâğıdını çerçeveye al"
   },
   {
    "id": "barkod",
    "ad": "Barkod",
    "ikon": "barcode",
    "ipucu": "Barkodu çerçevenin içine getir"
   }
  ],
  "galeri": "Galeriden seç",
  "mikrofon": "Sesle anlat",
  "islem": [
   "Görsel analiz ediliyor",
   "Bileşenler ayrılıyor",
   "Besin değerleri hesaplanıyor"
  ]
 },
 "tabak": {
  "gorsel": "assets/gorsel/hero/kamera-tabak.webp",
  "baslik": "Tabağında 8 bileşen bulduk",
  "ogunOnerisi": "aksam",
  "toplam": {
   "kcal": 412,
   "P": 51.8,
   "K": 19.0,
   "Y": 14.0,
   "Lif": 6.7,
   "gram": 470
  },
  "guvenOrtalama": 92,
  "bilesenler": [
   {
    "id": "tavuk",
    "ad": "Izgara Tavuk",
    "slug": "tavuk-gogsu-izgara",
    "gram": 110,
    "kcal": 166,
    "P": 33.6,
    "K": 0.0,
    "Y": 3.5,
    "Lif": 0.0,
    "guven": 84,
    "bbox": {
     "x": 34,
     "y": 28,
     "w": 34,
     "h": 40
    },
    "alternatif": [
     {
      "ad": "Baharatlı Tofu",
      "gramKcal": 1.44
     }
    ]
   },
   {
    "id": "misir",
    "ad": "Haşlanmış Mısır",
    "slug": "tatli-misir-konserve",
    "gram": 60,
    "kcal": 38,
    "P": 1.6,
    "K": 6.8,
    "Y": 0.2,
    "Lif": 1.1,
    "guven": 96,
    "bbox": {
     "x": 61,
     "y": 31,
     "w": 19,
     "h": 25
    }
   },
   {
    "id": "soya",
    "ad": "Edamame",
    "slug": "soya-fasulyesi-haslanmis",
    "gram": 50,
    "kcal": 86,
    "P": 9.1,
    "K": 4.2,
    "Y": 4.5,
    "Lif": 3.0,
    "guven": 88,
    "bbox": {
     "x": 35,
     "y": 19,
     "w": 27,
     "h": 15
    }
   },
   {
    "id": "yumurta",
    "ad": "Haşlanmış Yumurta",
    "slug": "yumurta-haslanmis",
    "gram": 50,
    "kcal": 78,
    "P": 6.3,
    "K": 0.6,
    "Y": 5.3,
    "Lif": 0.0,
    "guven": 93,
    "bbox": {
     "x": 21,
     "y": 25,
     "w": 22,
     "h": 20
    }
   },
   {
    "id": "domates",
    "ad": "Domates",
    "slug": "domates",
    "gram": 60,
    "kcal": 11,
    "P": 0.5,
    "K": 1.7,
    "Y": 0.1,
    "Lif": 0.7,
    "guven": 97,
    "bbox": {
     "x": 17,
     "y": 42,
     "w": 15,
     "h": 29
    }
   },
   {
    "id": "lahana",
    "ad": "Mor Lahana",
    "slug": "lahana-kirmizi-cig",
    "gram": 50,
    "kcal": 18,
    "P": 0.2,
    "K": 3.5,
    "Y": 0.1,
    "Lif": 1.0,
    "guven": 95,
    "bbox": {
     "x": 26,
     "y": 62,
     "w": 31,
     "h": 20
    }
   },
   {
    "id": "salatalik",
    "ad": "Salatalık",
    "slug": "salatalik",
    "gram": 60,
    "kcal": 10,
    "P": 0.2,
    "K": 1.7,
    "Y": 0.2,
    "Lif": 0.3,
    "guven": 92,
    "bbox": {
     "x": 55,
     "y": 55,
     "w": 25,
     "h": 19
    }
   },
   {
    "id": "marul",
    "ad": "Kıvırcık Marul",
    "slug": "marul-kivircik",
    "gram": 30,
    "kcal": 5,
    "P": 0.3,
    "K": 0.5,
    "Y": 0.1,
    "Lif": 0.6,
    "guven": 90,
    "bbox": {
     "x": 48,
     "y": 13,
     "w": 21,
     "h": 19
    }
   }
  ],
  "not": "Gramlar fotoğraftan tahmin edilir. Porsiyonu düzelterek değerleri kesinleştirebilirsin."
 },
 "disarida": {
  "baslik": "Dışarıda ne yesem?",
  "altMetin": "Menünü okut, programına ve kalan kalorine uyan tabakları görelim.",
  "mekan": {
   "ad": "Mahalle Lokantası",
   "tur": "Türk Mutfağı",
   "semt": "Çankaya",
   "gorsel": "assets/gorsel/hero/restoran-masa.webp"
  },
  "hedef": {
   "kalanKcal": 609,
   "proteinAcigi": 35.6,
   "ogun": "Akşam Yemeği"
  },
  "tabaklar": [
   {
    "slug": "yogurtlu-tavuk-sis",
    "ad": "Yoğurtlu Tavuk Şiş",
    "gorsel": "assets/gorsel/yemek/yogurtlu-tavuk-sis.webp",
    "kcal": 284,
    "P": 40.0,
    "K": 6.2,
    "Y": 10.5,
    "puan": 94,
    "etiket": "Izgara",
    "enUygun": true,
    "gerekce": "Kalan 609 kcal'ine rahat sığıyor, protein hedefindeki 36 g açığı tek başına kapatıyor. Izgara olduğu için yağı düşük; yanına mevsim salatası iyi gider."
   },
   {
    "slug": "karidesli-guvec",
    "ad": "Karidesli Güveç",
    "gorsel": "assets/gorsel/yemek/karidesli-guvec.webp",
    "kcal": 208,
    "P": 26.8,
    "K": 10.4,
    "Y": 5.9,
    "puan": 90,
    "etiket": "Fırında",
    "enUygun": true,
    "gerekce": "208 kcal ile en hafif ana yemeklerden, 27 g protein veriyor. Yanına bulgur pilavı ekleyip penceren kapanmadan rahatça doyabilirsin."
   },
   {
    "slug": "izgara-sebzeli-dana-bonfile",
    "ad": "Izgara Sebzeli Dana Bonfile",
    "gorsel": "assets/gorsel/yemek/izgara-sebzeli-dana-bonfile.webp",
    "kcal": 287,
    "P": 32.5,
    "K": 5.0,
    "Y": 14.6,
    "puan": 84,
    "etiket": "Izgara",
    "enUygun": false
   },
   {
    "slug": "sebzeli-kuzu-sis",
    "ad": "Sebzeli Kuzu Şiş",
    "gorsel": "assets/gorsel/yemek/sebzeli-kuzu-sis.webp",
    "kcal": 228,
    "P": 25.9,
    "K": 7.3,
    "Y": 10.1,
    "puan": 82,
    "etiket": "Izgara",
    "enUygun": false
   },
   {
    "slug": "sebzeli-levrek-bugulama",
    "ad": "Sebzeli Levrek Buğulama",
    "gorsel": "assets/gorsel/yemek/sebzeli-levrek-bugulama.webp",
    "kcal": 408,
    "P": 42.5,
    "K": 15.3,
    "Y": 18.6,
    "puan": 78,
    "etiket": "Buğulama",
    "enUygun": false,
    "uyari": "Porsiyon büyük; 408 kcal."
   },
   {
    "slug": "firinda-sebzeli-tavuk",
    "ad": "Fırında Sebzeli Tavuk",
    "gorsel": "assets/gorsel/yemek/firinda-sebzeli-tavuk.webp",
    "kcal": 193,
    "P": 23.1,
    "K": 6.8,
    "Y": 7.5,
    "puan": 80,
    "etiket": "Fırında",
    "enUygun": false
   },
   {
    "slug": "mercimek-corbasi",
    "ad": "Mercimek Çorbası",
    "gorsel": "assets/gorsel/yemek/mercimek-corbasi.webp",
    "kcal": 172,
    "P": 10.7,
    "K": 20.5,
    "Y": 3.4,
    "puan": 76,
    "etiket": "Çorba",
    "enUygun": false
   },
   {
    "slug": "mevsim-salatasi",
    "ad": "Mevsim Salatası",
    "gorsel": "assets/gorsel/yemek/mevsim-salatasi.webp",
    "kcal": 101,
    "P": 1.5,
    "K": 13.5,
    "Y": 3.9,
    "puan": 72,
    "etiket": "Salata",
    "enUygun": false
   },
   {
    "slug": "imambayildi",
    "ad": "İmambayıldı",
    "gorsel": "assets/gorsel/yemek/imambayildi.webp",
    "kcal": 237,
    "P": 4.4,
    "K": 18.8,
    "Y": 14.4,
    "puan": 64,
    "etiket": "Zeytinyağlı",
    "enUygun": false,
    "uyari": "Yağı yüksek, proteini düşük."
   },
   {
    "slug": "etli-kuru-fasulye",
    "ad": "Etli Kuru Fasulye",
    "gorsel": "assets/gorsel/yemek/etli-kuru-fasulye.webp",
    "kcal": 434,
    "P": 38.9,
    "K": 34.0,
    "Y": 8.3,
    "puan": 60,
    "etiket": "Tencere",
    "enUygun": false,
    "uyari": "434 kcal; pilavla birlikte kalan hedefi aşar."
   },
   {
    "slug": "kasarli-pide",
    "ad": "Kaşarlı Pide",
    "gorsel": "assets/gorsel/yemek/kasarli-pide.webp",
    "kcal": 467,
    "P": 20.9,
    "K": 65.0,
    "Y": 11.8,
    "puan": 38,
    "etiket": "Fırın",
    "enUygun": false,
    "uyari": "467 kcal, karbonhidratı yüksek."
   },
   {
    "slug": "manti",
    "ad": "Mantı",
    "gorsel": "assets/gorsel/yemek/manti.webp",
    "kcal": 500,
    "P": 27.9,
    "K": 69.5,
    "Y": 10.5,
    "puan": 34,
    "etiket": "Hamur işi",
    "enUygun": false,
    "uyari": "500 kcal; porsiyonu yarıya indirmeyi düşün."
   }
  ],
  "kurallar": [
   "Izgara, fırın, haşlama ve buğulama bir pişirme yöntemi söyler; kızarmış, kremalı ve soslu ifadeler başka bir yöntem. Fark, ne seçtiğini bilerek seçmektir.",
   "O öğüne aç gitme; aç gidilen masada seçim daralır.",
   "Öğün sonrasında telafi refleksine kapılmadan olağan düzene dön."
  ],
  "not": "Menü değerleri tahminidir; kaynak: Dada Diet besin veritabanı."
 },
 "tahlil": {
  "baslik": "Tahlilin okundu",
  "tahlil": "t-2026-09",
  "tarihMetin": "18 Eylül 2026",
  "okunanDeger": 12,
  "normal": 11,
  "dikkat": 1,
  "satirlar": [
   {
    "ad": "D vitamini",
    "deger": "19 ng/mL",
    "referans": "30-100",
    "durum": "dusuk",
    "aciklama": "Referansın altında görünüyor. Bu sonucu diyetisyeninle ve hekiminle görüş."
   },
   {
    "ad": "Total kolesterol",
    "deger": "196 mg/dL",
    "referans": "< 200",
    "durum": "normal",
    "aciklama": "Martta 214 idi, referans aralığına girmiş."
   },
   {
    "ad": "Ferritin",
    "deger": "32 ng/mL",
    "referans": "15-150",
    "durum": "normal",
    "aciklama": "Aralıkta."
   }
  ],
  "sonraki": [
   "Sağlık Dosyam'a kaydet",
   "Diyetisyenine gönder"
  ],
  "uyari": "Bu okuma bilgilendirme amaçlıdır; teşhis değildir. Sonuçlarını diyetisyeninle ve hekiminle değerlendir."
 },
 "ses": {
  "baslik": "Söyle, ekleyelim",
  "ipucu": "Ne yediğini ve ne kadar yediğini anlat.",
  "dinleniyor": "Dinliyorum…",
  "cozumleniyor": "Besinleri ayırıyorum…",
  "sonuclar": [
   {
    "id": "s1",
    "transkript": "Kahvaltıda iki yumurta ve bir dilim ekmek yedim",
    "ogun": "kahvalti",
    "besinler": [
     {
      "ad": "Yumurta (haşlanmış)",
      "slug": "yumurta-haslanmis",
      "miktar": 2,
      "birim": "adet",
      "gram": 100,
      "kcal": 155,
      "P": 12.6,
      "K": 1.1,
      "Y": 10.6,
      "Lif": 0.0
     },
     {
      "ad": "Tam Buğday Ekmeği",
      "slug": "tam-bugday-ekmegi",
      "miktar": 1,
      "birim": "ince dilim",
      "gram": 25,
      "kcal": 64,
      "P": 2.7,
      "K": 10.9,
      "Y": 0.8,
      "Lif": 1.2
     }
    ],
    "toplamKcal": 219
   },
   {
    "id": "s2",
    "transkript": "Öğlen bir kase mercimek yedim yanına da yoğurt aldım",
    "ogun": "ogle",
    "besinler": [
     {
      "ad": "Mercimek (haşlanmış)",
      "slug": "mercimek-haslanmis",
      "miktar": 1,
      "birim": "kâse",
      "gram": 130,
      "kcal": 151,
      "P": 11.7,
      "K": 26.1,
      "Y": 0.5,
      "Lif": 10.3
     },
     {
      "ad": "Yoğurt (yarım yağlı)",
      "slug": "yogurt-yarim-yagli",
      "miktar": 0.5,
      "birim": "kupa",
      "gram": 120,
      "kcal": 59,
      "P": 5.2,
      "K": 4.7,
      "Y": 2.2,
      "Lif": 0.0
     }
    ],
    "toplamKcal": 210
   },
   {
    "id": "s3",
    "transkript": "Akşamüstü bir elmayla bir avuç badem yedim",
    "ogun": "ara",
    "besinler": [
     {
      "ad": "Elma (Fuji)",
      "slug": "elma-fuji",
      "miktar": 1,
      "birim": "orta boy",
      "gram": 150,
      "kcal": 84,
      "P": 0.4,
      "K": 18.6,
      "Y": 0.9,
      "Lif": 2.7
     },
     {
      "ad": "Badem",
      "slug": "badem",
      "miktar": 1,
      "birim": "avuç",
      "gram": 30,
      "kcal": 174,
      "P": 6.3,
      "K": 6.5,
      "Y": 15.0,
      "Lif": 3.8
     }
    ],
    "toplamKcal": 258
   }
  ],
  "hazirCumleler": [
   "Kahvaltıda iki yumurta ve bir dilim ekmek yedim",
   "Öğlen bir kase mercimek yedim yanına da yoğurt aldım",
   "Akşamüstü bir elmayla bir avuç badem yedim"
  ]
 },
 "barkod": {
  "baslik": "Barkodu okut",
  "ipucu": "Ürünün barkodunu çerçevenin içine getir.",
  "urunler": [
   {
    "ean": "8690000000012",
    "ad": "Tam Buğday Bisküvi",
    "kategori": "Bisküvi",
    "porsiyonGram": 30,
    "icindekiler": [
     "Tam buğday unu (%32)",
     "Buğday unu",
     "Şeker",
     "Bitkisel yağ (palm)",
     "Glikoz şurubu",
     "Kabartıcı (E500, E503)",
     "Tuz",
     "Emülgatör (E322)",
     "Aroma verici"
    ],
    "deger100": {
     "kcal": 462,
     "P": 8.1,
     "K": 66.0,
     "seker": 19.5,
     "Y": 17.8,
     "doymusYag": 8.2,
     "Lif": 7.4,
     "tuz": 1.1
    },
    "skor": 58,
    "skorEtiket": "Orta",
    "uyarilar": [
     "Şekeri yüksek: 100 g'da 19,5 g",
     "Palm yağı içeriyor",
     "Tam buğday unu toplam unun yalnız bir bölümü"
    ],
    "katkiMaddeleri": [
     {
      "kod": "E500",
      "ad": "Sodyum karbonatlar",
      "islev": "Kabartıcı",
      "risk": "dusuk"
     },
     {
      "kod": "E503",
      "ad": "Amonyum karbonatlar",
      "islev": "Kabartıcı",
      "risk": "dusuk"
     },
     {
      "kod": "E322",
      "ad": "Lesitin",
      "islev": "Emülgatör",
      "risk": "dusuk"
     }
    ],
    "olumlu": [
     "Lifi yüksek: 100 g'da 7,4 g"
    ],
    "alternatif": {
     "ean": "8690000000050",
     "ad": "Sade Yulaf Ezmesi",
     "skor": 92,
     "neden": "Şeker eklenmemiş, tek içerikli ve lifi daha yüksek."
    }
   },
   {
    "ean": "8690000000029",
    "ad": "Meyveli Yoğurt",
    "kategori": "Süt Ürünü",
    "porsiyonGram": 125,
    "icindekiler": [
     "Yoğurt (süt, süt kültürü)",
     "Çilek hazırlaması (%12)",
     "Şeker",
     "Modifiye nişasta",
     "Stabilizör (E440)",
     "Aroma verici",
     "Renklendirici (E120)"
    ],
    "deger100": {
     "kcal": 98,
     "P": 3.4,
     "K": 14.6,
     "seker": 13.2,
     "Y": 2.8,
     "doymusYag": 1.8,
     "Lif": 0.3,
     "tuz": 0.1
    },
    "skor": 52,
    "skorEtiket": "Orta",
    "uyarilar": [
     "Şekeri yüksek: bir kâsede 16,5 g",
     "Renklendirici içeriyor"
    ],
    "katkiMaddeleri": [
     {
      "kod": "E440",
      "ad": "Pektin",
      "islev": "Stabilizör",
      "risk": "dusuk"
     },
     {
      "kod": "E120",
      "ad": "Karmin",
      "islev": "Renklendirici",
      "risk": "orta"
     }
    ],
    "olumlu": [
     "Kalsiyum kaynağı"
    ],
    "alternatif": {
     "ean": "8690000000067",
     "ad": "Sade Süzme Yoğurt",
     "skor": 88,
     "neden": "Şeker eklenmemiş, proteini iki kattan fazla."
    }
   },
   {
    "ean": "8690000000036",
    "ad": "Kakaolu Fındık Kreması",
    "kategori": "Sürülebilir",
    "porsiyonGram": 20,
    "icindekiler": [
     "Şeker",
     "Bitkisel yağ (palm)",
     "Fındık (%13)",
     "Yağsız süt tozu",
     "Kakao tozu (%7)",
     "Emülgatör (E322)",
     "Aroma verici"
    ],
    "deger100": {
     "kcal": 539,
     "P": 6.3,
     "K": 57.5,
     "seker": 56.3,
     "Y": 30.9,
     "doymusYag": 10.6,
     "Lif": 3.4,
     "tuz": 0.1
    },
    "skor": 22,
    "skorEtiket": "Düşük",
    "uyarilar": [
     "İlk içerik şeker",
     "Şekeri çok yüksek: 100 g'da 56,3 g",
     "Doymuş yağı yüksek"
    ],
    "katkiMaddeleri": [
     {
      "kod": "E322",
      "ad": "Lesitin",
      "islev": "Emülgatör",
      "risk": "dusuk"
     }
    ],
    "olumlu": [],
    "alternatif": {
     "ean": "8690000000074",
     "ad": "Sade Fındık Ezmesi",
     "skor": 84,
     "neden": "Tek içerikli; şeker ve palm yağı eklenmemiş."
    }
   },
   {
    "ean": "8690000000043",
    "ad": "Hazır Mercimek Çorbası",
    "kategori": "Hazır Yemek",
    "porsiyonGram": 20,
    "icindekiler": [
     "Kırmızı mercimek (%48)",
     "Buğday unu",
     "Patates nişastası",
     "Tuz",
     "Bitkisel yağ",
     "Maya özütü",
     "Lezzet artırıcı (E621)",
     "Baharatlar"
    ],
    "deger100": {
     "kcal": 352,
     "P": 17.2,
     "K": 55.1,
     "seker": 2.8,
     "Y": 5.9,
     "doymusYag": 1.1,
     "Lif": 8.8,
     "tuz": 7.2
    },
    "skor": 61,
    "skorEtiket": "Orta",
    "uyarilar": [
     "Tuzu yüksek: bir kâsede 1,4 g",
     "Lezzet artırıcı içeriyor"
    ],
    "katkiMaddeleri": [
     {
      "kod": "E621",
      "ad": "Monosodyum glutamat",
      "islev": "Lezzet artırıcı",
      "risk": "orta"
     }
    ],
    "olumlu": [
     "İlk içerik mercimek",
     "Lifi yüksek"
    ],
    "alternatif": {
     "ean": "8690000000081",
     "ad": "Kuru Kırmızı Mercimek",
     "skor": 95,
     "neden": "Tek içerikli; tuzu sen ayarlarsın."
    }
   },
   {
    "ean": "8690000000050",
    "ad": "Sade Yulaf Ezmesi",
    "kategori": "Tahıl",
    "porsiyonGram": 40,
    "icindekiler": [
     "Tam tahıllı yulaf (%100)"
    ],
    "deger100": {
     "kcal": 372,
     "P": 13.5,
     "K": 58.7,
     "seker": 1.0,
     "Y": 7.0,
     "doymusYag": 1.2,
     "Lif": 10.0,
     "tuz": 0.0
    },
    "skor": 92,
    "skorEtiket": "Yüksek",
    "uyarilar": [],
    "katkiMaddeleri": [],
    "olumlu": [
     "Tek içerikli",
     "Şeker eklenmemiş",
     "Lifi yüksek"
    ],
    "alternatif": null
   }
  ],
  "skorAciklama": "Skor; şeker, doymuş yağ, tuz, lif, protein ve katkı maddelerine göre 100 üzerinden hesaplanır."
 },
 "etiket": {
  "urun": "8690000000012",
  "baslik": "Etiketi satır satır okuduk",
  "ipucu": "İçindekiler listesi ağırlığa göre sıralanır, bu yüzden ilk üç satır ürünün ne olduğunu ön yüzdeki metinden daha doğru anlatır.",
  "satirlar": [
   {
    "metin": "Tam buğday unu (%32)",
    "aciklama": "İlk sırada, ama oran %32. Geri kalan un rafine.",
    "durum": "iyi"
   },
   {
    "metin": "Buğday unu",
    "aciklama": "İkinci sırada rafine un. Ürün tam tahıllı sayılmaz.",
    "durum": "dikkat"
   },
   {
    "metin": "Şeker",
    "aciklama": "Üçüncü sırada: ilk üç içerikten biri.",
    "durum": "dikkat"
   },
   {
    "metin": "Bitkisel yağ (palm)",
    "aciklama": "Doymuş yağ kaynağı. Bir porsiyonda 2,5 g.",
    "durum": "dikkat"
   },
   {
    "metin": "Glikoz şurubu",
    "aciklama": "Şekerin ikinci adı. Toplam şeker 100 g'da 19,5 g.",
    "durum": "dikkat"
   },
   {
    "metin": "Kabartıcı (E500, E503)",
    "aciklama": "Yaygın kabartıcılar; dikkat gerektirmez.",
    "durum": "notr"
   },
   {
    "metin": "Tuz",
    "aciklama": "Bir porsiyonda 0,3 g.",
    "durum": "notr"
   },
   {
    "metin": "Emülgatör (E322)",
    "aciklama": "Lesitin; yaygın ve düşük riskli.",
    "durum": "notr"
   },
   {
    "metin": "Aroma verici",
    "aciklama": "Tat ekler, besin değeri getirmez.",
    "durum": "notr"
   }
  ],
  "ozet": "Ön yüzdeki \"tam buğday\" ifadesi ürünün tamamını anlatmıyor. Bir porsiyon 30 g, 139 kcal ve 5,9 g şeker.",
  "alternatif": {
   "ean": "8690000000050",
   "ad": "Sade Yulaf Ezmesi",
   "skor": 92,
   "neden": "Şeker eklenmemiş, tek içerikli ve lifi daha yüksek."
  }
 }
};
// Ne Yedim? kullanım hakkı (karar 2, 11 Kasım: Gastro'daki sınır neyse aynısı). Kaynak, Gastro mobil prototip (v3-app, salt okunur):
//   deneme: ücretsiz deneme sayısı 3 — runtime.js:9241 (Tabaktan Tarif `dadagastro-photo-trials ?? 3`), ortak/sayfalar/dolaptan.js:54 (`DENEME = 3`);
//   Flutter dadagastro-mobil-app lib/core/widgets/gallery/blocks/b71_pro_ve_uyelik.dart:147 ("3 ücretsiz deneme hakkın kaldı.").
//   gunluk: Pro günlük sınırı Gastro'da sayısız ("Günlük üretim sınırına ulaştın", dolaptan.js:87; "Günlük kullanım sınırına ulaştın", runtime.js:9336);
//   DadaGastro (Laravel) kodunda YZ kotası yok. Sayı uydurulmaz: null kalır, ai-kamera.js ?hal=limit nötr metin gösterir (açık kalem).
// Gastro'da deneme oturum boyu (sessionStorage) sayılır; gerçek sayım kuralı (hesap başına mı, süresiz mi) arka uçta karar ister.
DDV.ai.kota = {gunluk: null, deneme: 3};
