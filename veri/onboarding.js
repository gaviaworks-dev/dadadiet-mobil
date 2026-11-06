/* veri/onboarding.js — ortak onboarding seti, sıra tasks/gorev.md ile birebir. İkonlar Font Awesome solid adı.
 * DDV.onboarding: { giris:{ baslik, altMetin, gorsel, butonlar[], kvkkKisa },
 *   adimlar:[{ id, no, tur ('tek-secim'|'coklu-secim'|'slider'|'onay'|'protokol'|'sonuc'), ekran, baslik, altMetin, alan, opsiyonel?, kosul?:{alan,deger[]},
 *     secenekler?:[{id,ad,ikon,alt?,...}], min?, max?, adim?, birim?, varsayilan?, ekAlan?, acikRiza?, hassasiyet?, saatAlani?, sonuc? }], kalori }
 * kosul: adım ya da ekAlan yalnız alan değeri deger[] içindeyse gösterilir (hedef kilo ve tempo yalnız kilo hedeflerinde).
 */
window.DDV = window.DDV || {};
DDV.onboarding = {
 "giris": {
  "baslik": "Dengeni birlikte kuralım",
  "altMetin": "Hedefini seç, sana uygun kalori ve öğün düzenini birkaç adımda çıkaralım.",
  "gorsel": "assets/gorsel/hero/karsilama.webp",
  "butonlar": [
   {
    "id": "apple",
    "ad": "Apple ile devam et",
    "ikon": "apple",
    "marka": true
   },
   {
    "id": "google",
    "ad": "Google ile devam et",
    "ikon": "google",
    "gorsel": "assets/marka/sosyal/google.svg"
   },
   {
    "id": "eposta",
    "ad": "E-posta ile devam et",
    "ikon": "envelope"
   }
  ],
  "kvkkKisa": "Devam ederek Kullanım Koşulları'nı ve Aydınlatma Metni'ni kabul etmiş olursun."
 },
 "adimlar": [
  {
   "id": "hedef",
   "no": 1,
   "tur": "tek-secim",
   "ekran": "SCR-01",
   "baslik": "Hedefin ne?",
   "altMetin": "Sana göre bir plan kurmak için buradan başlayalım.",
   "alan": "hedef",
   "secenekler": [
    {
     "id": "kilo-vermek",
     "ad": "Kilo vermek",
     "ikon": "weight-scale",
     "alt": "Sağlıklı bir hızla hedefe in"
    },
    {
     "id": "formu-korumak",
     "ad": "Formumu korumak",
     "ikon": "scale-balanced",
     "alt": "Bugünkü dengemi sürdüreyim"
    },
    {
     "id": "kas-kazanmak",
     "ad": "Kas kazanmak",
     "ikon": "dumbbell",
     "alt": "Protein ve toparlanma odaklı"
    },
    {
     "id": "sikilasmak",
     "ad": "Sıkılaşmak",
     "ikon": "person-running",
     "alt": "Yağ oranını azalt, kası koru"
    },
    {
     "id": "oruc-aliskanligi",
     "ad": "Aralıklı oruç alışkanlığı",
     "ikon": "hourglass-half",
     "alt": "Öğünlerimi bir pencereye toplayayım"
    },
    {
     "id": "saglikli-yasam",
     "ad": "Sağlıklı yaşam",
     "ikon": "heart-pulse",
     "alt": "Daha dengeli beslenmek istiyorum"
    }
   ]
  },
  {
   "id": "cinsiyet",
   "no": 2,
   "tur": "tek-secim",
   "ekran": "SCR-02",
   "baslik": "Cinsiyetin",
   "altMetin": "Enerji ihtiyacını hesaplarken kullanılır.",
   "alan": "cinsiyet",
   "secenekler": [
    {
     "id": "kadin",
     "ad": "Kadın",
     "ikon": "venus"
    },
    {
     "id": "erkek",
     "ad": "Erkek",
     "ikon": "mars"
    }
   ]
  },
  {
   "id": "yas",
   "no": 3,
   "tur": "slider",
   "ekran": "SCR-02",
   "baslik": "Kaç yaşındasın?",
   "altMetin": "Enerji ihtiyacı yaşa göre değişir.",
   "alan": "yas",
   "min": 18,
   "max": 80,
   "adim": 1,
   "birim": "yaş",
   "varsayilan": 34,
   "not": "Dada Diet 18 yaş ve üzeri içindir."
  },
  {
   "id": "boy",
   "no": 4,
   "tur": "slider",
   "ekran": "SCR-02",
   "baslik": "Boyun kaç?",
   "altMetin": "Vücut kitle indeksini ve enerji ihtiyacını hesaplarız.",
   "alan": "boyCm",
   "min": 140,
   "max": 210,
   "adim": 1,
   "birim": "cm",
   "varsayilan": 165
  },
  {
   "id": "kilo",
   "no": 5,
   "tur": "slider",
   "ekran": "SCR-02",
   "baslik": "Kilon kaç?",
   "altMetin": "Bu değer yalnız senin planın için kullanılır.",
   "alan": "kiloKg",
   "min": 40,
   "max": 180,
   "adim": 0.1,
   "birim": "kg",
   "varsayilan": 72.4,
   "ekAlan": {
    "kosul": {
     "alan": "hedef",
     "deger": [
      "kilo-vermek"
     ]
    },
    "alan": "hedefKiloKg",
    "baslik": "Hedef kilon",
    "min": 40,
    "max": 180,
    "adim": 0.1,
    "birim": "kg",
    "varsayilan": 66,
    "yardim": "Sağlıklı aralık boyuna göre hesaplanır."
   }
  },
  {
   "id": "tempo",
   "no": 6,
   "tur": "tek-secim",
   "ekran": "SCR-02",
   "baslik": "Hangi tempoda ilerleyelim?",
   "altMetin": "Yavaş tempo sürdürmesi daha kolaydır.",
   "alan": "tempo",
   "kosul": {
    "alan": "hedef",
    "deger": [
     "kilo-vermek"
    ]
   },
   "secenekler": [
    {
     "id": "yavas",
     "ad": "Yavaş",
     "ikon": "feather",
     "alt": "Haftada ~0,25 kg",
     "kcalFark": -250
    },
    {
     "id": "dengeli",
     "ad": "Dengeli",
     "ikon": "scale-balanced",
     "alt": "Haftada ~0,3 kg",
     "kcalFark": -300,
     "onerilen": true
    },
    {
     "id": "hizli",
     "ad": "Hızlı",
     "ikon": "bolt",
     "alt": "Haftada ~0,5 kg",
     "kcalFark": -500
    }
   ]
  },
  {
   "id": "aktivite",
   "no": 7,
   "tur": "tek-secim",
   "ekran": "SCR-02",
   "baslik": "Günün ne kadar hareketli?",
   "altMetin": "Spor dahil, sıradan bir gününü düşün.",
   "alan": "aktivite",
   "secenekler": [
    {
     "id": "hareketsiz",
     "ad": "Hareketsiz",
     "ikon": "couch",
     "alt": "Masa başı, az yürüyüş",
     "katsayi": 1.2
    },
    {
     "id": "hafif",
     "ad": "Hafif aktif",
     "ikon": "person-walking",
     "alt": "Haftada 1-3 gün hareket",
     "katsayi": 1.375
    },
    {
     "id": "orta",
     "ad": "Orta aktif",
     "ikon": "person-running",
     "alt": "Haftada 3-5 gün spor",
     "katsayi": 1.55
    },
    {
     "id": "cok",
     "ad": "Çok aktif",
     "ikon": "dumbbell",
     "alt": "Haftada 6-7 gün spor",
     "katsayi": 1.725
    }
   ]
  },
  {
   "id": "beslenme",
   "no": 8,
   "tur": "coklu-secim",
   "ekran": "SCR-02",
   "baslik": "Beslenme tarzın nasıl?",
   "altMetin": "Birden fazla seçebilirsin.",
   "alan": "beslenmeTarzi",
   "secenekler": [
    {
     "id": "dengeli",
     "ad": "Dengeli",
     "ikon": "scale-balanced"
    },
    {
     "id": "akdeniz",
     "ad": "Akdeniz tipi",
     "ikon": "fish"
    },
    {
     "id": "yuksek-protein",
     "ad": "Yüksek protein",
     "ikon": "egg"
    },
    {
     "id": "vejetaryen",
     "ad": "Vejetaryen",
     "ikon": "carrot"
    },
    {
     "id": "vegan",
     "ad": "Vegan",
     "ikon": "seedling"
    },
    {
     "id": "glutensiz",
     "ad": "Glütensiz",
     "ikon": "wheat-awn-circle-exclamation"
    },
    {
     "id": "laktozsuz",
     "ad": "Laktozsuz",
     "ikon": "glass-water"
    },
    {
     "id": "ev-yemekleri",
     "ad": "Pratik ev yemekleri",
     "ikon": "kitchen-set"
    }
   ]
  },
  {
   "id": "kvkk",
   "no": 9,
   "tur": "onay",
   "ekran": "SCR-02",
   "baslik": "Sağlık verilerin sana ait",
   "altMetin": "Planını kişiselleştirmek için iznin gerekiyor.",
   "alan": "kvkk",
   "acikRiza": {
    "zorunlu": true,
    "metin": "Boy, kilo, beslenme ve sağlık bilgilerimin, bana özel beslenme önerileri sunulması amacıyla Dada Diet tarafından işlenmesine açık rıza veriyorum.",
    "detay": "Kişisel sağlık verilerin yalnız belirtilen amaç ve gerekli izin kapsamında işlenir. Rızanı Sağlık Dosyam ekranındaki Veri İzinlerim bölümünden dilediğin an geri alabilirsin.",
    "baglantilar": [
     "Aydınlatma Metni",
     "KVKK Metni"
    ]
   },
   "hassasiyet": {
    "zorunlu": false,
    "baslik": "Hassasiyet ya da kronik bir durumun var mı?",
    "altMetin": "Opsiyonel. Varsa önerilerini bunlara göre süzeriz.",
    "secenekler": [
     {
      "id": "diyabet",
      "ad": "Diyabet",
      "ikon": "droplet"
     },
     {
      "id": "insulin-direnci",
      "ad": "İnsülin direnci",
      "ikon": "syringe"
     },
     {
      "id": "tiroid",
      "ad": "Tiroid",
      "ikon": "shield-halved"
     },
     {
      "id": "hipertansiyon",
      "ad": "Hipertansiyon",
      "ikon": "heart-pulse"
     },
     {
      "id": "kolesterol",
      "ad": "Yüksek kolesterol",
      "ikon": "heart"
     },
     {
      "id": "pcos",
      "ad": "PCOS",
      "ikon": "venus"
     },
     {
      "id": "gebelik",
      "ad": "Gebelik ya da emzirme",
      "ikon": "baby"
     },
     {
      "id": "alerji",
      "ad": "Besin alerjisi",
      "ikon": "shield-halved"
     },
     {
      "id": "yeme-bozuklugu",
      "ad": "Yeme bozukluğu öyküsü",
      "ikon": "hand-holding-heart"
     },
     {
      "id": "yok",
      "ad": "Yok",
      "ikon": "circle-check"
     }
    ],
    "uyari": "Gebelik, kronik hastalık ya da düzenli ilaç kullanımı varsa plana başlamadan önce hekimine ve diyetisyenine danış."
   }
  },
  {
   "id": "ritim",
   "no": 10,
   "tur": "protokol",
   "ekran": "SCR-03",
   "opsiyonel": true,
   "baslik": "Öğün ritmini seç",
   "altMetin": "Opsiyonel. Aralıklı oruç uygulamak istemiyorsan bu adımı geçebilirsin.",
   "alan": "orucProtokolu",
   "secenekler": [
    {
     "id": "yok",
     "ad": "Oruç istemiyorum",
     "ikon": "utensils",
     "alt": "Üç öğün düzeni"
    },
    {
     "id": "12-12",
     "ad": "12:12",
     "ikon": "moon",
     "alt": "Yumuşak başlangıç"
    },
    {
     "id": "14-10",
     "ad": "14:10",
     "ikon": "clock",
     "alt": "Kolay"
    },
    {
     "id": "16-8",
     "ad": "16:8",
     "ikon": "hourglass-half",
     "alt": "En çok tercih edilen"
    },
    {
     "id": "18-6",
     "ad": "18:6",
     "ikon": "stopwatch",
     "alt": "İleri"
    }
   ],
   "saatAlani": {
    "alan": "ilkOgunSaati",
    "baslik": "İlk öğün saatin",
    "varsayilan": "12:00",
    "min": "06:00",
    "max": "15:00",
    "adimDk": 15
   },
   "buton": "Başla"
  },
  {
   "id": "sonuc",
   "no": 11,
   "tur": "sonuc",
   "ekran": "SCR-03",
   "baslik": "Planın hazır, Zeynep",
   "altMetin": "Hedefini ve günlük ritmini bu değerlerle kurduk.",
   "alan": null,
   "sonuc": {
    "hedefKcal": 1650,
    "makro": {
     "P": 110,
     "K": 165,
     "Y": 60,
     "Lif": 28
    },
    "suMl": 2200,
    "hedefTarihi": "Nisan 2027",
    "formul": "Mifflin-St Jeor",
    "programlar": [
     "sekiz-saatlik-pencere-dort-hafta",
     "olculu-porsiyon-dort-hafta",
     "lif-odakli-dort-hafta"
    ],
    "diyetisyenCta": {
     "baslik": "Bir uzmanla ilerlemek ister misin?",
     "metin": "Diyetisyenin planını senin için uyarlar, ilerlemeni birlikte izlersiniz.",
     "buton": "Diyetisyen bul"
    },
    "bilgi": "Bu hesap tahminidir; tıbbi teşhis ya da tedavi yerine geçmez."
   }
  }
 ],
 "kalori": {
  "bazal": "kadin: 10*kg + 6.25*cm - 5*yas - 161 · erkek: 10*kg + 6.25*cm - 5*yas + 5",
  "gunluk": "bazal * aktivite.katsayi",
  "hedef": "gunluk + tempo.kcalFark (kilo hedefi dışında fark 0)",
  "enAzKcal": 1200
 }
};
