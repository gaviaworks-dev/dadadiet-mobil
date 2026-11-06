/* veri/saglik.js — Sağlık dosyam. Kullanıcıya ait değerler kaynaksızdır; kilo/bel/yağ son noktaları DDV.kullanici ve DDV.gecmis ile aynıdır.
 * Referans aralıkları genel laboratuvar aralıklarıdır; laboratuvara göre değişir. Metinlerdeki **vurgu** kalın gösterilir.
 * DDV.saglik: { ozet, seriler:{ kilo|bel|yag:{ ad, birim, aylik:[{tarih,etiket,deger}] (12 nokta), haftalik:[...] (8 nokta) } },
 *   kanTahlilleri:[{ id, tarih, tarihMetin, kaynak, degerler:[{ ad, kisaAd, birim, deger, referans, durum ('normal'|'dusuk'|'yuksek') }] }],
 *   aiAnalizleri:[{ id, tarih, tarihMetin, tahlil, baslik, ozet, maddeler[], uyari }], diyetisyenNotlari[], bilgiNotu }
 */
window.DDV = window.DDV || {};
DDV.saglik = {
 "ozet": {
  "baslangicKiloKg": 79.8,
  "guncelKiloKg": 72.4,
  "hedefKiloKg": 66,
  "verilenKg": 7.4,
  "kalanKg": 6.4,
  "belCm": 85.8,
  "belDegisim": -6.2,
  "yagYuzde": 33.6,
  "yagDegisim": -4.5,
  "bmi": 26.6
 },
 "seriler": {
  "kilo": {
   "ad": "Kilo",
   "birim": "kg",
   "aylik": [
    {
     "tarih": "2025-12-06",
     "etiket": "Ara",
     "deger": 79.8
    },
    {
     "tarih": "2026-01-06",
     "etiket": "Oca",
     "deger": 79.2
    },
    {
     "tarih": "2026-02-06",
     "etiket": "Şub",
     "deger": 78.6
    },
    {
     "tarih": "2026-03-06",
     "etiket": "Mar",
     "deger": 78.0
    },
    {
     "tarih": "2026-04-06",
     "etiket": "Nis",
     "deger": 77.3
    },
    {
     "tarih": "2026-05-06",
     "etiket": "May",
     "deger": 76.8
    },
    {
     "tarih": "2026-06-06",
     "etiket": "Haz",
     "deger": 76.3
    },
    {
     "tarih": "2026-07-06",
     "etiket": "Tem",
     "deger": 75.8
    },
    {
     "tarih": "2026-08-06",
     "etiket": "Ağu",
     "deger": 75.3
    },
    {
     "tarih": "2026-09-06",
     "etiket": "Eyl",
     "deger": 74.7
    },
    {
     "tarih": "2026-10-06",
     "etiket": "Eki",
     "deger": 73.9
    },
    {
     "tarih": "2026-11-06",
     "etiket": "Kas",
     "deger": 72.4
    }
   ],
   "haftalik": [
    {
     "tarih": "2026-09-18",
     "etiket": "18 Eyl",
     "deger": 74.5
    },
    {
     "tarih": "2026-09-25",
     "etiket": "25 Eyl",
     "deger": 74.3
    },
    {
     "tarih": "2026-10-02",
     "etiket": "2 Eki",
     "deger": 74.0
    },
    {
     "tarih": "2026-10-09",
     "etiket": "9 Eki",
     "deger": 73.7
    },
    {
     "tarih": "2026-10-16",
     "etiket": "16 Eki",
     "deger": 73.5
    },
    {
     "tarih": "2026-10-23",
     "etiket": "23 Eki",
     "deger": 73.2
    },
    {
     "tarih": "2026-10-30",
     "etiket": "30 Eki",
     "deger": 72.9
    },
    {
     "tarih": "2026-11-06",
     "etiket": "6 Kas",
     "deger": 72.4
    }
   ]
  },
  "bel": {
   "ad": "Bel",
   "birim": "cm",
   "aylik": [
    {
     "tarih": "2025-12-06",
     "etiket": "Ara",
     "deger": 92.0
    },
    {
     "tarih": "2026-01-06",
     "etiket": "Oca",
     "deger": 91.4
    },
    {
     "tarih": "2026-02-06",
     "etiket": "Şub",
     "deger": 90.9
    },
    {
     "tarih": "2026-03-06",
     "etiket": "Mar",
     "deger": 90.3
    },
    {
     "tarih": "2026-04-06",
     "etiket": "Nis",
     "deger": 89.8
    },
    {
     "tarih": "2026-05-06",
     "etiket": "May",
     "deger": 89.2
    },
    {
     "tarih": "2026-06-06",
     "etiket": "Haz",
     "deger": 88.7
    },
    {
     "tarih": "2026-07-06",
     "etiket": "Tem",
     "deger": 88.2
    },
    {
     "tarih": "2026-08-06",
     "etiket": "Ağu",
     "deger": 87.7
    },
    {
     "tarih": "2026-09-06",
     "etiket": "Eyl",
     "deger": 87.2
    },
    {
     "tarih": "2026-10-06",
     "etiket": "Eki",
     "deger": 86.8
    },
    {
     "tarih": "2026-11-06",
     "etiket": "Kas",
     "deger": 85.8
    }
   ],
   "haftalik": [
    {
     "tarih": "2026-09-18",
     "etiket": "18 Eyl",
     "deger": 87.1
    },
    {
     "tarih": "2026-09-25",
     "etiket": "25 Eyl",
     "deger": 87.0
    },
    {
     "tarih": "2026-10-02",
     "etiket": "2 Eki",
     "deger": 86.9
    },
    {
     "tarih": "2026-10-09",
     "etiket": "9 Eki",
     "deger": 86.8
    },
    {
     "tarih": "2026-10-16",
     "etiket": "16 Eki",
     "deger": 86.7
    },
    {
     "tarih": "2026-10-23",
     "etiket": "23 Eki",
     "deger": 86.6
    },
    {
     "tarih": "2026-10-30",
     "etiket": "30 Eki",
     "deger": 86.3
    },
    {
     "tarih": "2026-11-06",
     "etiket": "6 Kas",
     "deger": 85.8
    }
   ]
  },
  "yag": {
   "ad": "Yağ oranı",
   "birim": "%",
   "aylik": [
    {
     "tarih": "2025-12-06",
     "etiket": "Ara",
     "deger": 38.1
    },
    {
     "tarih": "2026-01-06",
     "etiket": "Oca",
     "deger": 37.7
    },
    {
     "tarih": "2026-02-06",
     "etiket": "Şub",
     "deger": 37.3
    },
    {
     "tarih": "2026-03-06",
     "etiket": "Mar",
     "deger": 37.0
    },
    {
     "tarih": "2026-04-06",
     "etiket": "Nis",
     "deger": 36.6
    },
    {
     "tarih": "2026-05-06",
     "etiket": "May",
     "deger": 36.2
    },
    {
     "tarih": "2026-06-06",
     "etiket": "Haz",
     "deger": 35.8
    },
    {
     "tarih": "2026-07-06",
     "etiket": "Tem",
     "deger": 35.5
    },
    {
     "tarih": "2026-08-06",
     "etiket": "Ağu",
     "deger": 35.1
    },
    {
     "tarih": "2026-09-06",
     "etiket": "Eyl",
     "deger": 34.8
    },
    {
     "tarih": "2026-10-06",
     "etiket": "Eki",
     "deger": 34.4
    },
    {
     "tarih": "2026-11-06",
     "etiket": "Kas",
     "deger": 33.6
    }
   ],
   "haftalik": [
    {
     "tarih": "2026-09-18",
     "etiket": "18 Eyl",
     "deger": 34.7
    },
    {
     "tarih": "2026-09-25",
     "etiket": "25 Eyl",
     "deger": 34.6
    },
    {
     "tarih": "2026-10-02",
     "etiket": "2 Eki",
     "deger": 34.5
    },
    {
     "tarih": "2026-10-09",
     "etiket": "9 Eki",
     "deger": 34.4
    },
    {
     "tarih": "2026-10-16",
     "etiket": "16 Eki",
     "deger": 34.3
    },
    {
     "tarih": "2026-10-23",
     "etiket": "23 Eki",
     "deger": 34.2
    },
    {
     "tarih": "2026-10-30",
     "etiket": "30 Eki",
     "deger": 33.9
    },
    {
     "tarih": "2026-11-06",
     "etiket": "6 Kas",
     "deger": 33.6
    }
   ]
  }
 },
 "kanTahlilleri": [
  {
   "id": "t-2026-09",
   "tarih": "2026-09-18",
   "tarihMetin": "18 Eylül 2026",
   "kaynak": "Fotoğrafla tarandı",
   "degerler": [
    {
     "ad": "Açlık kan şekeri",
     "kisaAd": "Glukoz",
     "birim": "mg/dL",
     "deger": 92,
     "referans": "70-100",
     "durum": "normal"
    },
    {
     "ad": "HbA1c",
     "kisaAd": "HbA1c",
     "birim": "%",
     "deger": 5.4,
     "referans": "4,0-5,6",
     "durum": "normal"
    },
    {
     "ad": "Total kolesterol",
     "kisaAd": "Total kolesterol",
     "birim": "mg/dL",
     "deger": 196,
     "referans": "< 200",
     "durum": "normal"
    },
    {
     "ad": "LDL kolesterol",
     "kisaAd": "LDL",
     "birim": "mg/dL",
     "deger": 118,
     "referans": "< 130",
     "durum": "normal"
    },
    {
     "ad": "HDL kolesterol",
     "kisaAd": "HDL",
     "birim": "mg/dL",
     "deger": 58,
     "referans": "> 50",
     "durum": "normal"
    },
    {
     "ad": "Trigliserid",
     "kisaAd": "Trigliserid",
     "birim": "mg/dL",
     "deger": 122,
     "referans": "< 150",
     "durum": "normal"
    },
    {
     "ad": "Hemoglobin",
     "kisaAd": "Hemoglobin",
     "birim": "g/dL",
     "deger": 13.1,
     "referans": "12,0-15,5",
     "durum": "normal"
    },
    {
     "ad": "Ferritin",
     "kisaAd": "Ferritin",
     "birim": "ng/mL",
     "deger": 32,
     "referans": "15-150",
     "durum": "normal"
    },
    {
     "ad": "B12 vitamini",
     "kisaAd": "B12",
     "birim": "pg/mL",
     "deger": 340,
     "referans": "200-900",
     "durum": "normal"
    },
    {
     "ad": "D vitamini",
     "kisaAd": "25-OH D",
     "birim": "ng/mL",
     "deger": 19,
     "referans": "30-100",
     "durum": "dusuk"
    },
    {
     "ad": "TSH",
     "kisaAd": "TSH",
     "birim": "mIU/L",
     "deger": 2.1,
     "referans": "0,4-4,0",
     "durum": "normal"
    },
    {
     "ad": "ALT",
     "kisaAd": "ALT",
     "birim": "U/L",
     "deger": 21,
     "referans": "< 35",
     "durum": "normal"
    }
   ]
  },
  {
   "id": "t-2026-03",
   "tarih": "2026-03-12",
   "tarihMetin": "12 Mart 2026",
   "kaynak": "PDF olarak yüklendi",
   "degerler": [
    {
     "ad": "Açlık kan şekeri",
     "kisaAd": "Glukoz",
     "birim": "mg/dL",
     "deger": 98,
     "referans": "70-100",
     "durum": "normal"
    },
    {
     "ad": "HbA1c",
     "kisaAd": "HbA1c",
     "birim": "%",
     "deger": 5.6,
     "referans": "4,0-5,6",
     "durum": "normal"
    },
    {
     "ad": "Total kolesterol",
     "kisaAd": "Total kolesterol",
     "birim": "mg/dL",
     "deger": 214,
     "referans": "< 200",
     "durum": "yuksek"
    },
    {
     "ad": "LDL kolesterol",
     "kisaAd": "LDL",
     "birim": "mg/dL",
     "deger": 138,
     "referans": "< 130",
     "durum": "yuksek"
    },
    {
     "ad": "HDL kolesterol",
     "kisaAd": "HDL",
     "birim": "mg/dL",
     "deger": 52,
     "referans": "> 50",
     "durum": "normal"
    },
    {
     "ad": "Trigliserid",
     "kisaAd": "Trigliserid",
     "birim": "mg/dL",
     "deger": 158,
     "referans": "< 150",
     "durum": "yuksek"
    },
    {
     "ad": "Hemoglobin",
     "kisaAd": "Hemoglobin",
     "birim": "g/dL",
     "deger": 12.8,
     "referans": "12,0-15,5",
     "durum": "normal"
    },
    {
     "ad": "Ferritin",
     "kisaAd": "Ferritin",
     "birim": "ng/mL",
     "deger": 24,
     "referans": "15-150",
     "durum": "normal"
    },
    {
     "ad": "B12 vitamini",
     "kisaAd": "B12",
     "birim": "pg/mL",
     "deger": 310,
     "referans": "200-900",
     "durum": "normal"
    },
    {
     "ad": "D vitamini",
     "kisaAd": "25-OH D",
     "birim": "ng/mL",
     "deger": 17,
     "referans": "30-100",
     "durum": "dusuk"
    },
    {
     "ad": "TSH",
     "kisaAd": "TSH",
     "birim": "mIU/L",
     "deger": 2.3,
     "referans": "0,4-4,0",
     "durum": "normal"
    },
    {
     "ad": "ALT",
     "kisaAd": "ALT",
     "birim": "U/L",
     "deger": 26,
     "referans": "< 35",
     "durum": "normal"
    }
   ]
  }
 ],
 "aiAnalizleri": [
  {
   "id": "a3",
   "tarih": "2026-09-18",
   "tarihMetin": "18 Eylül 2026",
   "tahlil": "t-2026-09",
   "baslik": "Eylül tahlilin okundu",
   "ozet": "12 değerin 11'i referans aralığında. **D vitamini** referansın altında görünüyor. Kolesterol ve trigliserid değerlerin martla kıyaslandığında düşmüş.",
   "maddeler": [
    "D vitamini sonucunu diyetisyeninle ve hekiminle görüş.",
    "Yağlı balık ve süt ürünlerini haftana yaymayı diyetisyeninle planlayabilirsin.",
    "Ferritin ve B12 değerlerin aralıkta; takvimdeki kontrol tarihini koru."
   ],
   "uyari": "Bu okuma bilgilendirme amaçlıdır; teşhis değildir. Sonuçlarını diyetisyeninle ve hekiminle değerlendir."
  },
  {
   "id": "a2",
   "tarih": "2026-06-02",
   "tarihMetin": "2 Haziran 2026",
   "tahlil": "t-2026-03",
   "baslik": "Üç aylık kıyas notu",
   "ozet": "Mart tahlilin ile günlük kayıtların bir arada okundu. **Lif ortalaman** 19 g'dan 24 g'a çıkmış, **doymuş yağ kaynakların** azalmış.",
   "maddeler": [
    "Bir sonraki tahlilde kolesterol değerlerine birlikte bakmak için diyetisyeninle tarih belirle.",
    "Baklagil öğünlerini haftada en az üç tutmayı sürdürebilirsin."
   ],
   "uyari": "Bu okuma bilgilendirme amaçlıdır; teşhis değildir. Sonuçlarını diyetisyeninle ve hekiminle değerlendir."
  },
  {
   "id": "a1",
   "tarih": "2026-03-12",
   "tarihMetin": "12 Mart 2026",
   "tahlil": "t-2026-03",
   "baslik": "Mart tahlilin okundu",
   "ozet": "12 değerin 8'i referans aralığında. **Total kolesterol, LDL ve trigliserid** referansın üstünde, **D vitamini** altında görünüyor.",
   "maddeler": [
    "Bu değerleri diyetisyeninle ve hekiminle görüş.",
    "Görüşmeye kadar dengeli tabak düzenini koruyabilirsin."
   ],
   "uyari": "Bu okuma bilgilendirme amaçlıdır; teşhis değildir. Sonuçlarını diyetisyeninle ve hekiminle değerlendir."
  }
 ],
 "diyetisyenNotlari": [
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
 ],
 "bilgiNotu": "Sağlık dosyanı yalnız sen ve izin verdiğin diyetisyen görür. Kişisel sağlık verilerin yalnız belirtilen amaç ve gerekli izin kapsamında işlenir."
};
