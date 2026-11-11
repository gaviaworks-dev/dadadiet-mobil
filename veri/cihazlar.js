/* veri/cihazlar.js — Bağlı uygulamalar ve cihazlar (#/cihazlar, #/cihaz/:id). Gerçek bağlantı Flutter aşamasında (HealthKit, Health Connect).
 * DDV.cihazlar: {
 *   platformlar: { ios|android: { ad, servis (platformun sağlık servisi id), yol (telefon ayarındaki izin yolu) } },
 *   servisler: [{ id (rota ve durum anahtarı), saglayici (arka uç CihazSaglayicisi), ad, ikon, ton (DD.ikonKutu tonu), grup ('saglik'|'tarti'), platform ('ios'|'android'|null: her ikisi), yakinda,
 *     aciklama (kart), kaynaklar[] (verinin geldiği uygulama ve cihazlar), turler[] ('<yon>:<id>'; yoksa hepsi), bilgi (bağlanma adımı metni) }],
 *   gruplar: [{ id, ad }] veri türü grupları (sıra ekrandaki sıra),
 *   turler: [{ id (arka uç adı: okuma_turleri / yazma_turleri, backend-plan §1.1, §6.3), grup, ad, ikon, yon ('oku'|'yaz'), alt, acik (bağlanınca varsayılan) }]
 *     · kilo ve su iki yönde de vardır; tür yon + id ile tekildir, ekranda tek satır olur (ciftAlt: iki yönlü satırın alt metni). Su okuma varsayılan kapalı (çift sayım, backend-plan S5),
 *   dada: [{ id ('bagli-uygulamalar' anahtarı), ad, ikon }] (#/ayarlar/bagli bölümünde yönetilir),
 *   (İlk eşitlemede gelen adım, kilo, uyku ekranda DDV.hesap.cihazVerisi son gününden okunur; E5 Sağlık dosyam ile aynı değerler.)
 *   gizlilik: [[ikon, baslik, alt]] mağaza kuralı metinleri, koptuSon (bağlantı koptu halinde son eşitleme metni) }
 * Durum: 'cihaz-baglanti' { <servis id>: { bagli, izin:{ oku:{ <id>: boolean }, yaz:{ <id>: boolean } } (arka uçta okuma_turleri / yazma_turleri), sonEsitleme (son eşitleme metni; E5 aynı alanı okur), haber (yakında servis: hazır olunca haber) } }
 *   (E2 izinler/onboarding da { bagli:true } yazar). Platform servisi bağlanınca 'veri-izinleri'.esitle de güncellenir (Ayarlar özetiyle aynı kalsın).
 */
window.DDV = window.DDV || {};
DDV.cihazlar = {
  platformlar: {
    ios: {ad: 'iPhone', servis: 'apple-health', yol: 'Ayarlar › Gizlilik ve Güvenlik › Sağlık › Dada Diet'},
    android: {ad: 'Android', servis: 'health-connect', yol: 'Health Connect › Uygulama izinleri › Dada Diet'}
  },

  servisler: [
    {id: 'apple-health', saglayici: 'apple_health', ad: 'Apple Health', ikon: 'heart', ton: 'primary', grup: 'saglik', platform: 'ios',
      aciklama: 'iPhone’daki Sağlık uygulaması. Apple Watch verisi de buradan gelir.',
      kaynaklar: ['iPhone', 'Apple Watch'],
      bilgi: 'Adımın, kilon ve uykun **kendiliğinden** gelsin; öğünlerin ve suyun Sağlık’a yazılsın. Neyin paylaşılacağını telefonunun izin ekranında tek tek seçersin.'},
    {id: 'health-connect', saglayici: 'health_connect', ad: 'Health Connect', ikon: 'heart-pulse', ton: 'bilgi', grup: 'saglik', platform: 'android',
      aciklama: 'Samsung Health, Google Fit, Fitbit, Wear OS ve Garmin verisi buradan gelir.',
      kaynaklar: ['Samsung Health', 'Google Fit', 'Fitbit', 'Wear OS', 'Garmin'],
      bilgi: 'Adımın, kilon ve uykun **kendiliğinden** gelsin; öğünlerin ve suyun Health Connect’e yazılsın. Neyin paylaşılacağını telefonunun izin ekranında tek tek seçersin.'},
    {id: 'withings', saglayici: 'withings', ad: 'Withings', ikon: 'weight-scale', ton: 'notr', grup: 'tarti', platform: null, yakinda: true,
      aciklama: 'Akıllı tartını doğrudan bağla.', kaynaklar: ['Withings tartı'], turler: ['oku:kilo', 'oku:yag_orani']},
    {id: 'xiaomi', saglayici: 'xiaomi', ad: 'Xiaomi / Mi Fit', ikon: 'weight-scale', ton: 'notr', grup: 'tarti', platform: null, yakinda: true,
      aciklama: 'Mi akıllı tartını doğrudan bağla.', kaynaklar: ['Mi akıllı tartı'], turler: ['oku:kilo', 'oku:yag_orani']},
    {id: 'huawei', saglayici: 'huawei', ad: 'Huawei Health', ikon: 'weight-scale', ton: 'notr', grup: 'tarti', platform: null, yakinda: true,
      aciklama: 'Huawei akıllı tartını doğrudan bağla.', kaynaklar: ['Huawei akıllı tartı'], turler: ['oku:kilo', 'oku:yag_orani']}
  ],

  gruplar: [
    {id: 'aktivite', ad: 'Aktivite'},
    {id: 'vucut', ad: 'Vücut ölçüleri'},
    {id: 'beslenme', ad: 'Beslenme'},
    {id: 'uyku', ad: 'Uyku'},
    {id: 'kalp', ad: 'Kalp'}
  ],

  turler: [
    {id: 'adim', grup: 'aktivite', ad: 'Adım', ikon: 'shoe-prints', yon: 'oku', alt: 'Günlük adım toplamın', acik: true},
    {id: 'aktif_enerji', grup: 'aktivite', ad: 'Aktif enerji', ikon: 'fire', yon: 'oku', alt: 'Hareketle yaktığın enerji', acik: true},
    {id: 'egzersiz', grup: 'aktivite', ad: 'Egzersiz', ikon: 'person-running', yon: 'oku', alt: 'Antrenmanın türü ve süresi', acik: true},
    {id: 'kilo', grup: 'vucut', ad: 'Kilo', ikon: 'weight-scale', yon: 'oku', alt: 'Tartının ölçümü Sağlık dosyam’a gelir', ciftAlt: 'Tartın gelir, elle girdiğin yazılır', acik: true},
    {id: 'boy', grup: 'vucut', ad: 'Boy', ikon: 'ruler-vertical', yon: 'oku', alt: 'Profilindeki boy güncel kalır', acik: true},
    {id: 'yag_orani', grup: 'vucut', ad: 'Vücut yağ oranı', ikon: 'percent', yon: 'oku', alt: 'Tartın ölçüyorsa gelir', acik: true},
    {id: 'kilo', grup: 'vucut', ad: 'Kilo', ikon: 'weight-scale', yon: 'yaz', alt: 'Dada Diet’te elle girdiğin kilo', acik: true},
    {id: 'tuketilen_enerji', grup: 'beslenme', ad: 'Tüketilen enerji', ikon: 'utensils', yon: 'yaz', alt: 'Kaydettiğin öğünlerin kalorisi', acik: true},
    {id: 'makrolar', grup: 'beslenme', ad: 'Makrolar', ikon: 'bowl-food', yon: 'yaz', alt: 'Protein, karbonhidrat ve yağ', acik: true},
    {id: 'su', grup: 'beslenme', ad: 'Su', ikon: 'glass-water', yon: 'oku', alt: 'Başka uygulamada girdiğin su', ciftAlt: 'İçtiğin yazılır, dışarıdaki isteğe bağlı', acik: false},
    {id: 'su', grup: 'beslenme', ad: 'Su', ikon: 'glass-water', yon: 'yaz', alt: 'Dada Diet’te içtiğin su', acik: true},
    {id: 'uyku', grup: 'uyku', ad: 'Uyku', ikon: 'bed', yon: 'oku', alt: 'Gece toplamın haftalık özetinde görünür', acik: true},
    {id: 'dinlenme_nabzi', grup: 'kalp', ad: 'Dinlenme kalp atışı', ikon: 'heart-pulse', yon: 'oku', alt: 'İsteğe bağlı; kapalıyken hiç okunmaz', acik: false}
  ],

  dada: [
    {id: 'gastro', ad: 'Dada Gastro', ikon: 'utensils'},
    {id: 'fit', ad: 'Dada Fit', ikon: 'dumbbell'}
  ],

  gizlilik: [
    ['ban', 'Sağlık verin reklam için kullanılmaz', 'Satılmaz, reklam hedeflemesinde kullanılmaz.'],
    ['toggle-off', 'İzni istediğin an geri alırsın', 'Buradan ya da telefonunun Ayarlar’ından.'],
    ['list-check', 'Yalnız seçtiğin veri gelir', 'Kapalı bir tür hiç okunmaz.']
  ],

  koptuSon: '3 gün önce'
};
