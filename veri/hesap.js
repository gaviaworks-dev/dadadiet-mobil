/* veri/hesap.js — Hesap ayarları, Tercihlerim, Veri izinlerim ve Giriş ekranlarının örnek verisi. Web kaynağı: dadadiet-prototip hesabim/ayarlar, tercihlerim, veri-izinlerim, giris.
 * DDV.hesap: {
 *   varsayilan: { DD.durum 'hesap-ayar' bölümlerinin başlangıç değeri; ekran {...varsayilan[b], ...durum[b]} okur. Yeni hesapta (DD.yeniHesap) kişisel alanlar boş gelir.
 *     profil:{ kullaniciAdi, telefon (10 hane, başında 0 yok), dogum (ISO), hakkimda (≤160), foto (dataURL|null), guncelleme (ISO), epostaBekleyen (doğrulanmamış yeni adres|null),
 *       gorunurluk:{ acik, gecmis ('ben'|'diyetisyen'|'grup'), rozet, liderlik, arama } },
 *     bildirim:{ eposta:{ <tur id>:boolean }, takipSaat 'SS:DD' }   · uygulama bildirimi kanalı 'bildirim-ayar' {tur:boolean} anahtarındadır (profil ile ortak)
 *     guvenlik:{ sifreTarih ISO, ikiAdim, yontem ('sms'|'uygulama'), kurtarmaKalan, kodlar[10], biyometrik, sso:{apple, google}, kapatilan[oturum id] },
 *     dil:{ dil, bolge, saatDilimi, haftaBasi, saat ('24'|'12'), agirlik ('kg'|'lb'), boy ('cm'|'inc'), enerji ('kcal'|'kj'), sivi ('ml'|'bardak'|'floz'), tarih ('gg.aa.yyyy'|'yyyy-aa-gg') },
 *     bagli:{ siklik, sonEsitleme:{ saglik, gastro, fit }, izin:{ <saglikIzinleri id>:boolean } }   · aç/kapat durumu 'bagli-uygulamalar' {gastro, fit} ve 'veri-izinleri'.esitle
 *     veri:{ saklama, onbellekMb, sonIndirme (ISO saat|null), silmeTalebi (ISO|null) },
 *     hesap:{ dondurma:{ sure, tarih }|null },
 *     besin:{ alerjen[], sevmedik[] },
 *     izin:{ hareket:[{tarih, metin, ikon}], cevap:{ <tur>:'onay'|'red' }, sure:{ <tur>:metin } } },
 *   bildirimTurleri:[{ id, ad, alt, ikon, kanal:['bildirim','eposta'], bildirim (varsayılan), eposta (varsayılan), sabit? }]  · id oruc, randevu, mesaj, program, su 'bildirim-ayar' ile ortak
 *   sessizSecenek:[[deger 'SS:DD-SS:DD'|'kapali', ad]], takipSaatleri['SS:DD'],
 *   oturumlar:[{ id, ad, ikon, yer, zaman, bu? }], kurtarmaKodlari[10],
 *   dil:{ <alan>:[[deger, ad]] } seçenek listeleri, yakinda:[deger] (seçilince "yakında"),
 *   saglikIzinleri:[{ id, ad, alt, yon ('gelen'|'giden'), acik }], siklik:[[deger, ad]], esitlenmeyen:[[ikon, baslik, alt]],
 *   veriGruplari:[{ id, ad, ikon, saklama, ilk (ISO) }] · kayıt sayısı ekranda DDV'den türetilir,
 *   saklamaSecenek:[[deger, ad]], dondurmaSure:[[deger, ad]], ayrilmaNedeni:[[deger, ad]],
 *   alerjenler:[{id, ad}], sevmedikOneri:[ad], paylasimTurleri:[{ id, etiket, alt, ikon, varsayilan }] (ilk dördü ekranlar/saglik.js PAYLASIM ile aynı; Beyar kararı 1, KVKK: hepsi varsayılan KAPALI, üye tek tek açar),
 *   izinIstekleri:[{ tur, tarih, not }], izinGecmisi:[{ tarih, metin, ikon }], izinSureleri:[[deger, ad, gun|null]],
 *   cihazIzin:{ riza, rizaTarih (ISO|null), paylas, turler:{ adim, kilo, uyku }, silindi (ISO|null), aktarim:{ zaman, bicim }|null }  · DD.durum 'cihaz-izin' başlangıç değeri (E5). Rıza, diyetisyen paylaşımı ve paylaşılan türler varsayılan kapalı (Beyar kararı 1); genel sağlık rızasına (veri-izinleri.riza) bağlı kapsam,
 *   cihazRiza:{ metin, detay, genel (genel rıza yokken sheet'teki açıklama), ozet (taahhüdün tek cümlesi, **vurgu**), taahhut:[[ikon, baslik, alt]] } · sağlık uygulamalarından gelen veri açık rıza kapsamı.
 *     Kapsamdaki okunan ve yazılan türler sabit yazılmaz: DDV.cihazlar.gruplar + turler (veri/cihazlar.js, E1) okunur,
 *   cihazTurleri:[{ id ('adim'|'kilo'|'uyku'), etiket, alt, ikon, cihaz }] · diyetisyenle paylaşılabilen cihaz verisi türleri,
 *   cihazVerisi:{ kaynak:'cihaz', gunler:[{ tarih, adim, kiloKg|null, uykuDk }] } · son 7 gün (son kayıt bugün, adım sürüyor); kilo yalnız tartılan günlerde, değerler DDV.gecmis ile aynı (tartıdan gelen kilo Ölçümlerin grafiğine de işlenir; tek kayıt, kaynak 'cihaz'),
 *   giris:{ eposta, sifre, denemeHakki, kodUzunluk, yenidenGonderSn, sifreKurali,
 *     sifreKurallari:[{ id, ad (hata cümlesindeki adı), desen (RegExp kaynağı) }] · sifreKurali cümlesinin parçaları; yeni şifre hatası eksik olanları sayar,
 *     ikiAdimKod (kayıtlı hesabın SMS kodu; #/iki-adim alanına telefonun önerdiği kod olarak gelir) }
 * } */
window.DDV = window.DDV || {};
DDV.hesap = {
  varsayilan: {
    profil: {
      kullaniciAdi: 'zeynepkaya', telefon: '5324182763', dogum: '1992-04-18', hakkimda: 'Akdeniz mutfağını seviyorum; 16:8 düzeniyle ilerliyorum.', foto: null, guncelleme: '2026-11-04', epostaBekleyen: null,
      gorunurluk: {acik: false, gecmis: 'diyetisyen', rozet: true, liderlik: true, arama: false}
    },
    bildirim: {eposta: {randevu: true, mesaj: true, program: true, ozet: true, tahlil: true, menu: false, kampanya: false, icerik: false, rozet: false, grup: false, takip: false, oruc: false, guvenlik: true}, takipSaat: '20:00'},
    guvenlik: {sifreTarih: '2026-07-02', ikiAdim: true, yontem: 'sms', kurtarmaKalan: 8, biyometrik: true, sso: {apple: true, google: false}, kapatilan: []},
    dil: {dil: 'tr', bolge: 'TR', saatDilimi: 'istanbul', haftaBasi: 'pazartesi', saat: '24', agirlik: 'kg', boy: 'cm', enerji: 'kcal', sivi: 'ml', tarih: 'gg.aa.yyyy'},
    bagli: {siklik: 'otomatik', sonEsitleme: {saglik: 'Bugün 13.05', gastro: 'Dün 21.40', fit: null}, izin: {}},
    veri: {saklama: 'acik', onbellekMb: 48, sonIndirme: null, silmeTalebi: null},
    hesap: {dondurma: null},
    besin: {alerjen: [], sevmedik: ['Bamya', 'Ciğer']},
    izin: {hareket: [], cevap: {}, sure: {}}
  },

  bildirimTurleri: [
    {id: 'mesaj', ad: 'Diyetisyen mesajı', alt: 'Diyetisyenin yazdığında', ikon: 'comment-dots', bildirim: true, eposta: true},
    {id: 'randevu', ad: 'Randevular', alt: 'Onaylandığında ve yaklaştığında', ikon: 'calendar-check', bildirim: true, eposta: true},
    {id: 'oruc', ad: 'Oruç ve pencere', alt: 'Pencere açılmadan ve kapanmadan', ikon: 'hourglass-half', bildirim: true, eposta: false},
    {id: 'takip', ad: 'Günlük takip hatırlatması', alt: 'Öğün girmediğin günlerde akşam', ikon: 'clipboard-check', bildirim: true, eposta: false},
    {id: 'program', ad: 'Program revizyonu', alt: 'Programın güncellendiğinde', ikon: 'clipboard-list', bildirim: true, eposta: true},
    {id: 'menu', ad: 'Haftalık menü', alt: 'Yeni hafta menün hazır olunca', ikon: 'utensils', bildirim: true, eposta: false},
    {id: 'tahlil', ad: 'Tahlil sonuçları', alt: 'Değerler okunup yorumlanınca', ikon: 'flask-vial', bildirim: true, eposta: true},
    {id: 'ozet', ad: 'Haftalık özetim', alt: 'Pazar akşamı haftanın özeti', ikon: 'chart-line', bildirim: false, eposta: true},
    {id: 'rozet', ad: 'Rozet ve meydan okuma', alt: 'Rozet kazandığında', ikon: 'medal', bildirim: true, eposta: false},
    {id: 'grup', ad: 'Destek grupları', alt: 'Gönderine yorum geldiğinde', ikon: 'users', bildirim: true, eposta: false},
    {id: 'icerik', ad: 'Yeni program', alt: 'Sana uygun içerik eklendiğinde', ikon: 'book-open', bildirim: false, eposta: false},
    {id: 'kampanya', ad: 'Kampanya ve Pro fırsatları', alt: 'Paket indirimleri ve seçkiler', ikon: 'tag', bildirim: false, eposta: false},
    {id: 'guvenlik', ad: 'Güvenlik uyarıları', alt: 'Yeni cihaz girişi; kapatılamaz', ikon: 'shield-halved', bildirim: true, eposta: true, sabit: true}
  ],
  sessizSecenek: [['22:00-08:00', '22.00–08.00'], ['23:00-08:00', '23.00–08.00'], ['23:00-07:00', '23.00–07.00'], ['00:00-06:00', '00.00–06.00'], ['kapali', 'Kapalı']],
  takipSaatleri: ['19:00', '20:00', '21:00', '22:00'],

  oturumlar: [
    {id: 'bu', ad: 'iPhone 15', ikon: 'mobile-screen', yer: 'İstanbul', zaman: 'Şu anda aktif', bu: true},
    {id: 'web', ad: 'Chrome, MacBook Air', ikon: 'laptop', yer: 'İstanbul', zaman: 'Son görülme dün 22.14'},
    {id: 'ipad', ad: 'iPad, Safari', ikon: 'tablet-screen-button', yer: 'Ankara', zaman: 'Son görülme 25 Ekim'}
  ],
  kurtarmaKodlari: ['418-207', '903-551', '276-834', '650-129', '381-746', '529-063', '714-398', '862-415', '137-982', '095-674'],

  dil: {
    dil: [['tr', 'Türkçe'], ['en', 'English']],
    bolge: [['TR', 'Türkiye'], ['DE', 'Almanya'], ['GB', 'Birleşik Krallık'], ['US', 'Amerika Birleşik Devletleri']],
    saatDilimi: [['istanbul', '(GMT+03.00) İstanbul'], ['berlin', '(GMT+01.00) Berlin'], ['londra', '(GMT+00.00) Londra']],
    haftaBasi: [['pazartesi', 'Pazartesi'], ['pazar', 'Pazar']],
    saat: [['24', '24 saat · 19.30'], ['12', '12 saat · 7.30 ÖS']],
    agirlik: [['kg', 'Kilogram (kg)'], ['lb', 'Pound (lb)']],
    boy: [['cm', 'Santimetre (cm)'], ['inc', 'İnç (in)']],
    enerji: [['kcal', 'Kilokalori (kcal)'], ['kj', 'Kilojul (kJ)']],
    sivi: [['ml', 'Mililitre (ml)'], ['bardak', 'Bardak'], ['floz', 'Ons (fl oz)']],
    tarih: [['gg.aa.yyyy', '06.11.2026 (gg.aa.yyyy)'], ['yyyy-aa-gg', '2026-11-06 (yyyy-aa-gg)']]
  },
  yakinda: [],

  saglikIzinleri: [
    {id: 'yaz', ad: 'Su ve enerji toplamımı yaz', alt: 'Tek çıkış izni: günlük su ve enerji toplamın sağlık uygulamasına eklenir', yon: 'giden', acik: true},
    {id: 'adim', ad: 'Adım ve hareket', alt: 'Günlük adım ve aktif dakika okunur', yon: 'gelen', acik: true},
    {id: 'kilo', ad: 'Kilo ölçümü', alt: 'Telefonuna giren kilo kaydı Sağlık dosyam’a düşer', yon: 'gelen', acik: true},
    {id: 'uyku', ad: 'Uyku süresi', alt: 'Gece toplamı haftalık özetinde görünür', yon: 'gelen', acik: false},
    {id: 'nabiz', ad: 'Nabız özeti', alt: 'İsteğe bağlı; kapalıyken hiç okunmaz', yon: 'gelen', acik: false}
  ],
  siklik: [['otomatik', 'Otomatik'], ['saat', 'Saatte bir'], ['gun', 'Günde bir'], ['elle', 'Yalnız elle yenilediğimde']],
  esitlenmeyen: [
    ['flask-vial', 'Tahlil sonuçların ve sağlık belgelerin', 'Hiçbir bağlantıya gönderilmez'],
    ['comment-dots', 'Diyetisyeninle yazışman ve notlar', 'Yalnız Dada Diet’te kalır'],
    ['credit-card', 'Ödeme ve fatura bilgin', 'Bağlı uygulamalarla paylaşılmaz'],
    ['clipboard-list', 'Beslenme planın ve özel notların', 'Gastro ve Fit’e aktarılmaz']
  ],

  veriGruplari: [
    {id: 'profil', ad: 'Profil ve hesap bilgileri', ikon: 'user', saklama: 'Hesap açık kaldıkça', ilk: '2025-11-08'},
    {id: 'olcum', ad: 'Ölçümler', ikon: 'weight-scale', saklama: 'Hesap açık kaldıkça', ilk: '2025-11-08'},
    {id: 'ogun', ad: 'Öğün kayıtları', ikon: 'utensils', saklama: 'Hesap açık kaldıkça', ilk: '2026-10-24'},
    {id: 'tahlil', ad: 'Tahlil ve belgeler', ikon: 'flask-vial', saklama: 'Hesap açık kaldıkça', ilk: '2026-03-12'},
    {id: 'mesaj', ad: 'Diyetisyen mesajları', ikon: 'comment-dots', saklama: 'Hesap açık kaldıkça', ilk: '2026-09-15'},
    {id: 'esitleme', ad: 'Bağlı uygulama eşitleme kaydı', ikon: 'arrows-rotate', saklama: '90 gün', ilk: '2026-09-04'}
  ],
  saklamaSecenek: [['acik', 'Hesap açık kaldıkça'], ['2y', '2 yıl'], ['1y', '1 yıl']],
  dondurmaSure: [['1h', '1 hafta'], ['2h', '2 hafta'], ['1a', '1 ay'], ['3a', '3 ay'], ['donus', 'Ben dönene kadar']],
  ayrilmaNedeni: [['belirtmek-istemiyorum', 'Belirtmek istemiyorum'], ['kullanmiyorum', 'Uygulamayı kullanmıyorum'], ['baska', 'Başka bir uygulamaya geçtim'], ['bildirim', 'Çok fazla bildirim alıyorum'], ['gizlilik', 'Gizlilik kaygısı'], ['ucret', 'Ücretli paket bana uygun değil']],

  alerjenler: [
    {id: 'gluten', ad: 'Gluten'}, {id: 'sut', ad: 'Süt ve süt ürünleri'}, {id: 'yumurta', ad: 'Yumurta'}, {id: 'yer-fistigi', ad: 'Yer fıstığı'},
    {id: 'kabuklu-yemis', ad: 'Sert kabuklu yemişler'}, {id: 'soya', ad: 'Soya'}, {id: 'balik', ad: 'Balık'}, {id: 'kabuklu-deniz', ad: 'Kabuklu deniz ürünleri'}, {id: 'susam', ad: 'Susam'}
  ],
  sevmedikOneri: ['Bamya', 'Ciğer', 'Patlıcan', 'Kereviz', 'Pırasa', 'Brokoli', 'Lahana', 'Mantar', 'Hamsi', 'Kuzu eti', 'Nohut', 'Kinoa', 'Avokado', 'Lor peyniri', 'Zeytin', 'Tahin'],

  paylasimTurleri: [
    {id: 'olcum', etiket: 'Ölçümlerim', alt: 'Kilo, bel ve yağ oranı', ikon: 'kilo', varsayilan: false},
    {id: 'tahlil', etiket: 'Kan tahlillerim', alt: 'Yüklediğin tahlil sonuçları', ikon: 'tahlil', varsayilan: false},
    {id: 'analiz', etiket: 'AI analizlerim', alt: 'Tahlil okuma notları', ikon: 'wand-magic-sparkles', varsayilan: false},
    {id: 'tabaklar', etiket: 'Tabak fotoğraflarım', alt: 'Fotoğraf, öğün, kalori ve notun', ikon: 'tabak', varsayilan: false},
    {id: 'gunluk', etiket: 'Günlük takibim', alt: 'Su, duygu ve öğün işaretlerin', ikon: 'clipboard-check', varsayilan: false},
    {id: 'test', etiket: 'Test sonuçlarım', alt: 'Çözdüğün sağlık testleri', ikon: 'clipboard-question', varsayilan: false}
  ],
  izinIstekleri: [
    {tur: 'gunluk', tarih: '2026-11-04', not: 'Haftalık görüşmede su ve öğün düzenine birlikte bakmak için.'},
    {tur: 'test', tarih: '2026-11-02', not: 'Yeme alışkanlığı testindeki yanıtlarını menüne yansıtmak için.'}
  ],
  izinGecmisi: [
    {tarih: '2025-11-08', metin: 'Sağlık verisi açık rızası verildi', ikon: 'shield-halved'}
  ],
  izinSureleri: [['30', '30 gün', 30], ['90', '90 gün', 90], ['surekli', 'Ben geri çekene kadar', null]],

  // Sağlık uygulamalarından (Apple Health, Health Connect) gelen veri. Metin taslaktır (hukuk onayı açık kalem: tasks/handoff.md); ekranda iç not gösterilmez.
  cihazIzin: {riza: false, rizaTarih: null, rizaKaynak: null, paylas: false, turler: {adim: false, kilo: false, uyku: false}, silindi: null, aktarim: null},
  cihazRiza: {
    metin: 'Bağladığım sağlık uygulamasından (Apple Health ya da Health Connect) aşağıda sayılan ve bağlantı ayarında açık bıraktığım verilerimin okunmasına, Sağlık dosyamda gösterilmesine ve bana özel beslenme önerileri sunulması amacıyla Dada Diet tarafından işlenmesine; ayrıca Dada Diet’e girdiğim aşağıdaki kayıtların sağlık uygulamama yazılmasına açık rıza veriyorum.',
    detay: 'Hangi türün okunacağını ya da yazılacağını bağlantı ayarından tek tek seçersin; kapattığın tür okunmaz. Rızanı dilediğin an geri alabilirsin; geri aldığında yeni veri okunmaz ve yazılmaz, mevcut cihaz kayıtların sen silmedikçe saklanır.',
    genel: 'Sağlık uygulaması verisi, sağlık verilerinin işlenmesine verdiğin genel açık rızaya bağlı ayrı bir kapsamdır. Genel rızan yok; ikisini birlikte vermen gerekir.',
    ozet: 'Sağlık verin **reklam ya da pazarlama için kullanılmaz**, **üçüncü taraflara satılmaz**. İzni **istediğin an** buradan ya da telefonunun sağlık ayarlarından geri alırsın.',
    taahhut: [
      ['ban', 'Reklam ya da pazarlama için kullanılmaz', 'Sağlık verin reklam hedeflemede ve pazarlama iletilerinde kullanılmaz'],
      ['store-slash', 'Üçüncü taraflara satılmaz', 'Diyetisyeninle paylaşım ayrı bir izindir ve yalnız sen açarsan başlar'],
      ['rotate-left', 'İzni istediğin an geri alırsın', 'Bu ekrandan ya da telefonunun sağlık ayarlarından']
    ]
  },
  cihazTurleri: [
    {id: 'adim', etiket: 'Adım', alt: 'Günlük adım sayın ve ortalaman', ikon: 'shoe-prints', cihaz: 'Telefon'},
    {id: 'kilo', etiket: 'Kilo trendi', alt: 'Tartından gelen ölçümler ve yönü', ikon: 'weight-scale', cihaz: 'Akıllı tartı'},
    {id: 'uyku', etiket: 'Uyku', alt: 'Gece toplamın ve ortalaman', ikon: 'bed', cihaz: 'Akıllı saat'}
  ],
  cihazVerisi: {
    kaynak: 'cihaz',
    gunler: [
      {tarih: '2026-10-31', adim: 9315, kiloKg: 72.8, uykuDk: 418},
      {tarih: '2026-11-01', adim: 7208, kiloKg: null, uykuDk: 462},
      {tarih: '2026-11-02', adim: 8954, kiloKg: 72.7, uykuDk: 391},
      {tarih: '2026-11-03', adim: 6842, kiloKg: 72.6, uykuDk: 436},
      {tarih: '2026-11-04', adim: 10126, kiloKg: null, uykuDk: 447},
      {tarih: '2026-11-05', adim: 7581, kiloKg: 72.5, uykuDk: 404},
      {tarih: '2026-11-06', adim: 6120, kiloKg: 72.4, uykuDk: 429}
    ]
  },

  giris: {eposta: 'zeynep.kaya@posta.com', sifre: 'Dengeli2026!', denemeHakki: 5, kodUzunluk: 6, yenidenGonderSn: 60, sifreKurali: 'En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter içermeli.',
    sifreKurallari: [
      {id: 'uzunluk', ad: 'en az 8 karakter', desen: '.{8,}'},
      {id: 'buyuk', ad: 'büyük harf', desen: '[A-ZÇĞİÖŞÜ]'},
      {id: 'kucuk', ad: 'küçük harf', desen: '[a-zçğıöşü]'},
      {id: 'rakam', ad: 'rakam', desen: '\\d'},
      {id: 'ozel', ad: 'özel karakter', desen: '[^\\wçğıöşüÇĞİÖŞÜ]'}
    ],
    ikiAdimKod: '482913'}
};
