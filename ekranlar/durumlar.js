/* Durum halleri (#/durumlar): gizli geliştirici menüsü; menüde ve alt navigasyonda yok.
 * Bir hal seç (Normal, Yükleniyor, Boş, Hata, Çevrimdışı, Giriş gerekli, Kilitli), sonra ekranı aç: rota ?hal= ile açılır, hali router ortak bileşenle çizer
 * (kanon/dd-ui.js halCiz). Boş hal: e.bos (ortak DD.bos) ya da ekranın kendi boş hali (KENDI_BOS); ikisi de yoksa ekranda boş kavramı yoktur.
 * Ayrıca akışlar (açılış, onboarding, giriş, ayarlar, güncelleme, bakım) ve bildirim / onay pencereleri buradan denenir. Seçili hal: DD.durum 'durumlar-hal'.
 * ?pencere=basari|geri|hata|sil|cikis: ekran açılınca o pencere kendiliğinden açılır (katalog bağlantısı ve küçük görsel üretimi).
 * Paylaşılan liste: DD.durumlar = {HALLER, HAL_ORNEK, KENDI_BOS, AKISLAR, SISTEM, OZEL, PENCERE, ornek, pencere}; Ekran kataloğu (#/katalog) "Durumlar"
 * bölümünü bu listeden kurar (ekranlar/katalog.js). Yeni hal ya da sistem ekranı buraya eklenir, iki sayfada birden görünür. */
(() => {
  const HALLER = [['', 'Normal'], ['yukleniyor', 'Yükleniyor'], ['bos', 'Boş'], ['hata', 'Hata'], ['cevrimdisi', 'Çevrimdışı'], ['giris', 'Giriş gerekli'], ['kilitli', 'Kilitli']];
  // Ortak halin tek örneği (katalog "Durumlar" bölümü): hal → o hali gösteren ekran. Boş hal e.bos tanımlı ekranda açılır.
  const HAL_ORNEK = {yukleniyor: '#/programlar', bos: '#/tabaklarim', hata: '#/besinler', cevrimdisi: '#/bugun', giris: '#/saglik', kilitli: '#/rozetler'};
  // Kendi ?hal=bos çizen ekranlar (ekran dosyasında sorgu.hal === 'bos' ya da hal() === 'bos').
  const KENDI_BOS = ['bugun', 'denge', 'ai-menu', 'ai-tabak', 'beslenme-plani', 'bildirimler', 'cozum-merkezi', 'destek-gruplari', 'haftalik-menu', 'kaydedilenler', 'odemelerim', 'paketlerim'];
  const AKISLAR = [
    ['play', 'Açılış', '#/splash'], ['hand', 'Karşılama', '#/karsilama'], ['bullseye', 'Onboarding', '#/onboarding/hedef'],
    ['right-to-bracket', 'Giriş', '#/giris'], ['key', 'Şifre sıfırlama', '#/sifre-sifirla'], ['envelope', 'E-posta doğrulama', '#/eposta-dogrula'],
    ['user-pen', 'Profil düzenleme', '#/ayarlar/profil'], ['sliders', 'Tercihler', '#/tercihler'], ['bell', 'Bildirim merkezi', '#/bildirimler'],
    ['bell-concierge', 'Bildirim izni', '#/bildirim-izni'], ['snowflake', 'Hesabı dondur', '#/ayarlar/dondur'], ['user-xmark', 'Hesabı sil', '#/ayarlar/sil'],
    ['shield-halved', 'İki adımlı doğrulama', '#/iki-adim'], ['scale-balanced', 'Yasal metinler', '#/yasal'], ['file-lines', 'KVKK aydınlatma metni', '#/yasal/kvkk'],
    ['circle-question', 'Sıkça sorulan sorular', '#/sss'], ['book-medical', 'Bilimsel kaynaklar', '#/bilimsel-kaynaklar'], ['users', 'Editoryal kurul', '#/editoryal-kurul'], ['diagram-project', 'Nasıl çalışır?', '#/nasil-calisir'],
    ['handshake', 'Uzmanla çalışma rehberi', '#/uzmanla-calisma'], ['notes-medical', 'Sağlık bilgilendirmesi', '#/saglik-bilgilendirmesi'], ['id-badge', 'Diyetisyen ol (başvuru)', '#/diyetisyen-ol'], ['envelope-open-text', 'İletişim', '#/iletisim'], ['building', 'Hakkımızda', '#/hakkimizda'], ['id-card', 'Künye', '#/kunye'],
    ['comment-dots', 'Görüş bildir', '#/gorus-bildir'], ['life-ring', 'Çözüm merkezi', '#/cozum-merkezi'], ['mobile-screen-button', 'Uygulama ayarları', '#/ayarlar/uygulama'],
    ['book-medical', 'Beslenme rehberleri', '#/rehberler'], ['fire-flame-curved', 'Kaç kalori?', '#/kac-kalori'], ['location-dot', 'Dışarıda ne yesem?', '#/disarida'], ['compass', 'Bana uygun olanı bul', '#/bana-uygun'], ['bolt', 'Dada Diet Pro', '#/pro']
  ];
  // Sistem ekranları: sürüm, bakım, oturum, erişim, hata sayfaları (akış ekranı; ortak hal almaz).
  const SISTEM = [
    ['circle-up', 'Zorunlu güncelleme', '#/guncelle'], ['arrow-up-from-bracket', 'İsteğe bağlı güncelleme', '#/guncelle?tur=istege-bagli'], ['screwdriver-wrench', 'Bakım modu', '#/bakim'],
    ['clock-rotate-left', 'Oturum süresi doldu', '#/oturum-doldu'], ['user-lock', 'Erişim yok (başka hesap)', '#/yetki-yok?tur=baska-hesap&mod=dogrula'],
    ['wifi', 'Bağlantı yok', '#/hata?tur=baglanti'], ['triangle-exclamation', 'Bir şeyler ters gitti', '#/hata?tur=genel'], ['hourglass-end', 'Zaman aşımı', '#/hata?tur=zaman'], ['link-slash', 'Sayfa bulunamadı', '#/olmayan-sayfa']
  ];
  // Ekrana özgü haller (ekran kendi ?hal= değeriyle çizer).
  const OZEL = [
    ['camera', 'Ne Yedim? · günlük hak doldu', '#/ai/kamera?hal=limit'], ['camera', 'Ne Yedim? · ücretsiz deneme', '#/ai/kamera?hal=deneme'], ['camera', 'Ne Yedim? · deneme bitti', '#/ai/kamera?hal=deneme-bitti'],
    ['camera', 'Ne Yedim? · yemek bulunamadı', '#/ai/kamera?hal=yemek-yok'], ['camera', 'Ne Yedim? · bulanık fotoğraf', '#/ai/kamera?hal=bulanik'], ['camera', 'Ne Yedim? · kamera izni reddedildi', '#/ai/kamera?izin=red'],
    ['plate-wheat', 'AI tabak · sonuç hazırlanamadı', '#/ai/tabak?hal=olusturulamadi'], ['file-medical', 'Tahlil · okunamadı', '#/ai/tahlil?hal=okunamadi'], ['microphone', 'Sesle anlat · ses algılanmadı', '#/ai/ses?hal=sessiz'],
    ['bell-slash', 'Bildirim izni · reddedildi', '#/bildirim-izni?hal=red'], ['screwdriver-wrench', 'Bakım · dönüş saati belli değil', '#/bakim?hal=sure-yok'],
    ['user-lock', 'Erişim yok · şifre bağlantısı', '#/yetki-yok?tur=baska-hesap&mod=sifre'], ['user-lock', 'Erişim yok · silme bağlantısı', '#/yetki-yok?tur=baska-hesap&mod=sil']
  ];
  const PENCERE = [['basari', 'circle-check', 'Başarı bildirimi'], ['geri', 'rotate-left', 'Geri al bildirimi'], ['hata', 'circle-exclamation', 'Hata bildirimi'], ['sil', 'trash-can', 'Silme onayı'], ['cikis', 'right-from-bracket', 'Çıkış onayı']];
  const pencere = id => ({
    basari: () => DD.toast('**Kaydedildi**', {tur: 'basari'}),
    geri: () => DD.toast('Kayıt silindi', {ikon: 'sil', eylem: 'Geri al', onEylem: () => DD.toast('Kayıt **geri alındı**', {ikon: 'onay'})}),
    hata: () => DD.toast('Kaydedilemedi, **tekrar dene**', {tur: 'hata'}),
    sil: () => DD.dialog({baslik: 'Kayıt silinsin mi?', metin: 'Bu kayıt **kalıcı olarak** silinir.', eylem: 'Sil', iptal: 'Vazgeç', yikici: true}),
    cikis: () => DD.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true})
  })[id]?.();
  const hal = () => DD.durum.oku('durumlar-hal', '');
  // Parametreli rotalar örnek kayıtla açılır (tasks/araclar/tur2.cjs ile aynı kaynaklar).
  const ornek = r => {
    const V = window.DDV || {}, k = (window.DDKayit?.liste() || [])[0];
    const s = {':adim': 'hedef', ':bolum': 'profil', ':ean': V.ai?.barkod?.urunler?.[0]?.ean ?? '', ':id': null, ':slug': null};
    if (/#\/program\/:slug/.test(r)) return `#/program/${V.programlar[0].slug}`;
    if (/uzman\/profil\/:slug/.test(r)) return `#/uzman/profil/${V.diyetisyenler[0].slug}`;
    if (/besin\/:slug/.test(r)) return `#/besin/${V.besinler[0].slug}`;
    if (/test\/:slug/.test(r)) return `#/test/${V.testler?.liste?.[0]?.slug ?? 'beslenme'}`;
    if (/ipucu\/:slug/.test(r)) return `#/ipucu/${(V.kutuphane?.icerikTum?.() || V.icerikler || [])[0]?.slug ?? ''}`;
    if (/hesaplayici\/:slug/.test(r)) return '#/hesaplayici/gunluk-kalori';
    if (/kayit\/:id/.test(r)) return `#/kayit/${k?.id ?? (V.ogunKayitlari || [])[0]?.id ?? 'kahvalti'}`;
    if (/destek-grubu\/:id/.test(r)) return `#/destek-grubu/${(V.uye?.gruplar || V.uye?.destekGruplari || [])[0]?.id ?? ''}`;
    if (/talep\/:id/.test(r)) return `#/talep/${(V.uye?.talepler || [])[0]?.id ?? ''}`;
    if (/ogun\/:id/.test(r)) return '#/ogun/ogle';
    if (/rehber\/:slug/.test(r)) return `#/rehber/${V.rehber?.liste?.[0]?.slug ?? ''}`;
    if (/kac-kalori\/:slug/.test(r)) return `#/kac-kalori/${V.kacKalori?.yazilar?.[0]?.slug ?? ''}`;
    if (/yasal\/:slug/.test(r)) return '#/yasal/kvkk';
    if (/cihaz\/:id/.test(r)) return `#/cihaz/${V.cihazlar?.servisler?.[0]?.id ?? ''}`;
    if (/izin\/:tur/.test(r)) return '#/izin/saglik';
    return Object.entries(s).reduce((a, [p, v]) => a.replace(p, v ?? ''), r);
  };
  const rotalar = () => Object.entries(window.DD_ROTALAR || {}).filter(([r, ad]) => !ad.startsWith('#/') && !['durumlar', 'hata'].includes(ad) && r !== '#/durumlar');
  const ADLAR = {splash: 'Açılış', karsilama: 'Karşılama', onboarding: 'Onboarding', ogun: 'Öğün', kayit: 'Öğün kaydı', 'program-detay': 'Program detayı', 'uzman-profil': 'Diyetisyen profili', barkod: 'Barkod sonucu', testler: 'Testler', 'destek-gruplari': 'Destek grupları', 'cozum-merkezi': 'Çözüm merkezi', besin: 'Besin detayı', ipucu: 'İpucu', hesaplayicilar: 'Hesaplayıcılar', ayarlar: 'Ayarlar', giris: 'Giriş', guncelle: 'Zorunlu güncelleme', rehber: 'Beslenme rehberleri', 'kac-kalori': 'Kaç kalori?', disarida: 'Dışarıda ne yesem?', 'bana-uygun': 'Bana uygun olanı bul', pro: 'Dada Diet Pro', bakim: 'Bakım modu', yasal: 'Yasal metinler', kurumsal: 'Kurumsal sayfalar', 'gorus-bildir': 'Görüş bildir', 'oturum-doldu': 'Oturum süresi doldu', 'yetki-yok': 'Erişim yok', 'ai-ses': 'Sesle anlat', kacamak: 'Kaçamak kurtarma', kiyasla: 'Besin kıyasla', 'uzman-sohbet': 'Diyetisyenle mesajlaşma', cihazlar: 'Bağlı uygulamalar ve cihazlar', izinler: 'İzin açıklaması', kilit: 'Uygulama kilidi', katalog: 'Ekran kataloğu'};
  const ad_ = (ad, e) => (typeof e.baslik === 'string' && e.baslik) || ADLAR[ad] || ad.charAt(0).toLocaleUpperCase('tr') + ad.slice(1).replace(/-/g, ' ');
  const bosDurum = ad => (DD.ekranTanim(ad)?.bos ? 'Boş: ortak' : KENDI_BOS.includes(ad) ? 'Boş: ekran içi' : 'Boş yok');
  const ac = r => { const h = hal(), u = ornek(r); return h ? `${u}${u.includes('?') ? '&' : '?'}hal=${h}` : u; };

  const ciz = () => DD.bolumler([
    {baslik: 'Hal seç', html: `<div class="dd-yigin">${DD.p('Seçtiğin hal **bütün ekranlarda** aynı ortak bileşenle açılır. Normal, ekranı olduğu gibi gösterir.', {ton: 'ikincil'})}${DD.cipler({ad: 'durumlar-hal', tur: 'tek', serit: true, secili: hal(), ogeler: HALLER.map(([deger, metin]) => ({deger, metin}))})}</div>`},
    {baslik: 'Ekranlar', html: `<div data-yuva="durumlar-liste">${liste()}</div>`},
    {baslik: 'Ekrana özgü haller', html: DD.parcali(OZEL.map(([ikon, baslik, git]) => ({ikon, baslik, alt: git, git})))},
    {baslik: 'Akışlar', html: DD.parcali(AKISLAR.map(([ikon, baslik, git]) => ({ikon, baslik, alt: git, git})))},
    {baslik: 'Sistem ekranları', html: DD.parcali(SISTEM.map(([ikon, baslik, git]) => ({ikon, baslik, alt: git, git})))},
    {baslik: 'Bildirim ve onay pencereleri', html: DD.parcali(PENCERE.map(([id, ikon, baslik]) => ({ikon, baslik, veri: {eylem: 'pencere', id}})))}
  ]);
  const liste = () => DD.satirlar(rotalar().map(([r, ad]) => {
    const e = DD.ekranTanim(ad) || {};
    return {ikon: e.haller === false ? 'route' : e.cevrimici ? 'wifi' : 'mobile-screen', baslik: ad_(ad, e), alt: `${ornek(r)} · ${e.haller === false ? 'akış ekranı' : bosDurum(ad)}${e.cevrimici ? ' · ağ gerekir' : ''}`, git: ac(r)};
  }));

  DD.durumlar = {HALLER, HAL_ORNEK, KENDI_BOS, AKISLAR, SISTEM, OZEL, PENCERE, ornek, pencere};

  DD.ekran('durumlar', {
    haller: false,
    tur: 'alt',
    ust: '#/profil',
    baslik: 'Durum halleri',
    tabagim: false,
    ciz,
    sonra: (kok, ctx) => [
      DD.on(kok, 'durumlar-hal', v => { DD.durum.yaz('durumlar-hal', [].concat(v)[0] || ''); const y = kok.querySelector('[data-yuva="durumlar-liste"]'); if (y) y.innerHTML = liste(); }),
      DD.eylem(kok, 'pencere', el => pencere(el.dataset.id)),
      // ?pencere=<id>: ekran çizilince pencere kendiliğinden açılır (katalog bağlantısı)
      (t => () => clearTimeout(t))(PENCERE.some(x => x[0] === ctx.sorgu.pencere) ? setTimeout(() => pencere(ctx.sorgu.pencere), DD.TK.motion.reveal) : 0)
    ].reduce((a, f) => () => { a(); f(); }, () => {})
  });
})();
