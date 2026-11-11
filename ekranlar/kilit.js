/* Uygulama kilidi (#/kilit): sağlık kayıtları için Face ID / Touch ID / parmak izi (Android BiometricPrompt) ile açılış. Gastro'da karşılığı yok;
 *   kabuk Karşılama'nın gülücük kapağı (DD.karsilamaKabuk), haller DD.bant, biyometrik istem kanon DD.biyometrikIstem (kanon/dd-cihaz.js), ilk Face ID izni DD.dialog.
 * Durum DD.durum 'uygulama-kilidi' {acik, gecikme:'hemen'|'1'|'5', platform?, faceIzin?, sonAcilis}. Ayar: Ayarlar › Güvenlik › Uygulama kilidi (ayarlar.js).
 * Platform: ?platform=ios|ios-touch|android (durumda kalır), yoksa tarayıcı kimliği (Android → android, diğerleri ios). Metin ve ikon platforma göredir;
 *   Face ID simgesi kanon `yuz-tarama` (genel yüz tarama çizimi, resmi glif değil).
 * Kilit ne zaman gelir: üye + kilit açıkken (1) uygulama soğuk açılışta #/kilit?sonra=<adres> ile başlar, (2) arka plandan dönüşte seçilen gecikme
 *   (hemen, 1 dk, 5 dk) geçtiyse üstteki ekranın üstüne #/kilit açılır; açılınca o ekrana geri dönülür. Giriş, kayıt, açılış ve durum menüsü kilitlenmez.
 * Ekrana özgü haller (?hal=): basarisiz (tanımadı), kilitlendi (telefon çok başarısız denemeden sonra doğrulamayı durdurdu; yalnız şifre),
 *   iptal (istem kapatıldı), kullanilamaz (iOS'ta Face ID izni kapalı / Touch ID kurulu değil, Android'de parmak izi ya da yüz kayıtlı değil).
 *   Deneme sayısı uygulamada tutulmaz: sınırı telefon koyar (sistem kilidi), ekranda sayı yok.
 * Akışta sonucu seçmek: ?sonuc=basarisiz her denemeyi başarısız yapar, ?sonuc=kilitlendi denemeyi sistem kilidiyle bitirir. "Şifreyle aç" mevcut girişe (#/giris) gider. */
(() => {
  const ANAHTAR = 'uygulama-kilidi';
  const GECIKME = [['hemen', 'Hemen', 'bolt'], ['1', '1 dakika sonra', 'clock'], ['5', '5 dakika sonra', 'hourglass-half']];
  const GECIKME_MS = {hemen: 0, 1: 60e3, 5: 300e3};
  const SON = 'O zamana dek şifrenle açarsın.';
  const P = {
    ios: {ad: 'Face ID', ikon: 'yuz-tarama', kilitle: 'Face ID ile kilitle', ac: 'Face ID ile aç', tanimadi: 'Face ID seni tanımadı', ipucu: 'Yüzünü telefona dönük tut, ön kamerayı elinle örtme.', kullanilamaz: {baslik: 'Face ID izni kapalı', metin: `Telefonunun **Ayarlar › Dada Diet** bölümünden Face ID’ye izin ver. ${SON}`}},
    'ios-touch': {ad: 'Touch ID', ikon: 'fingerprint', kilitle: 'Touch ID ile kilitle', ac: 'Touch ID ile aç', tanimadi: 'Touch ID parmak izini tanımadı', ipucu: 'Parmağını kuru tut ve düğmeye tam yerleştir.', kullanilamaz: {baslik: 'Touch ID kurulu değil', metin: `Telefonunun **Ayarlar › Touch ID ve Parola** bölümünden parmak izi ekle. ${SON}`}},
    android: {ad: 'Parmak izi ya da yüz', ikon: 'fingerprint', kilitle: 'Parmak izi ya da yüzle kilitle', ac: 'Parmak iziyle aç', tanimadi: 'Parmak izin tanınmadı', ipucu: 'Parmağını kuru tut ve sensörün tamamına yerleştir.', kullanilamaz: {baslik: 'Parmak izi ya da yüz kayıtlı değil', metin: `**Güvenlik ayarlarından** parmak izi ya da yüz ekle. ${SON}`}}
  };
  const HALLER = ['basarisiz', 'kilitlendi', 'iptal', 'kullanilamaz'];
  // Kilit gelmeyen ekranlar: oturum açma ve açılış akışı, gizli durum menüsü, kilidin kendisi.
  const SERBEST = /^#\/(kilit|giris|iki-adim|sifre-sifirla|eposta-dogrula|karsilama|onboarding|splash|oturum-doldu|durumlar)\b/;

  const durum = () => ({acik: false, gecikme: 'hemen', ...DD.durum.oku(ANAHTAR, {})});
  const yaz = ek => DD.durum.yaz(ANAHTAR, {...durum(), ...ek});
  const platform = () => {
    const s = new URLSearchParams(location.hash.split('?')[1] || '').get('platform');
    if (P[s]) { if (durum().platform !== s) yaz({platform: s}); return s; }
    return P[durum().platform] ? durum().platform : /Android/i.test(navigator.userAgent) ? 'android' : 'ios';
  };
  const cihaz = () => { const p = platform(); return {platform: p, ios: p !== 'android', ...P[p]}; };
  const kilitli = () => durum().acik && DD.uye();

  // Biyometrik istem: iOS'ta Face ID ilk kullanımda sistem izni sorulur, sonra kanon DD.biyometrikIstem (hareket ayarından bağımsız görünür).
  // → Promise<'basari'|'basarisiz'|'iptal'|'sifre'|'izin-yok'>. {neden: istemde görünen gerekçe, sonuc: 'basarisiz' zorla}
  const istem = (o = {}) => {
    const c = cihaz();
    const izin = c.platform !== 'ios' ? Promise.resolve(true)
      : durum().faceIzin === true ? Promise.resolve(true)
      : durum().faceIzin === false ? Promise.resolve(false)
      : DD.dialog({baslik: '“Dada Diet” Face ID kullanmak istiyor', metin: 'Uygulamayı açarken **kimliğini doğrulamak** için Face ID kullanılır.', eylem: 'İzin ver', iptal: 'İzin verme'}).then(ok => { yaz({faceIzin: ok}); return ok; });
    return izin.then(ok => (ok ? DD.biyometrikIstem({platform: c.platform, neden: o.neden || 'Sağlık kayıtlarına erişmek için', sonuc: o.sonuc}) : 'izin-yok'));
  };

  // Ayarlar ve kilit ekranının ortak kaynağı.
  DD.uygulamaKilidi = {durum, yaz, cihaz, istem, GECIKME, gecikmeAd: v => (GECIKME.find(([k]) => k === v) || GECIKME[0])[1]};

  // Soğuk açılış: router adresi okumadan önce kilit ekranına çevrilir (ekran dosyaları rotadan önce yüklenir).
  try {
    const h = location.hash || '#/splash';
    if (kilitli() && !SERBEST.test(h) && !/[?&]hal=/.test(h)) history.replaceState(null, '', `#/kilit?sonra=${encodeURIComponent(h === '#/' ? '#/bugun' : h)}`);
  } catch { /* yok */ }
  // Arka plandan dönüş: seçilen gecikme geçtiyse üstteki ekranın üstüne kilit açılır.
  let gizlendi = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { gizlendi = Date.now(); return; }
    const a = DD.aktif()?.hash || '';
    if (!gizlendi || !kilitli() || SERBEST.test(a) || Date.now() - gizlendi < (GECIKME_MS[durum().gecikme] ?? 0)) return;
    gizlendi = 0; DD.git('#/kilit?oto=1');
  });

  // ---------- Kilit ekranı ----------
  const eposta = () => DD.durum.oku('hesap-ayar', {})?.profil?.eposta || DDV.hesap.giris.eposta;
  const btnAc = (c, metin = c.ac) => DD.btn({metin, ikon: c.ikon, tam: true, veri: {eylem: 'dogrula'}});
  const btnSifre = (ana = false) => DD.btn({metin: 'Şifreyle aç', ikon: 'key', tur: ana ? 'primary' : 'text', tam: true, veri: {eylem: 'sifre'}});
  const yalnizSifre = h => h === 'kilitlendi' || h === 'kullanilamaz';
  const halHtml = (ctx, c) => {
    if (ctx.hal === 'basarisiz') return [DD.bant({ton: 'uyari', baslik: c.tanimadi, metin: `${c.ipucu} **Tekrar dene** ya da şifrenle aç.`}), btnAc(c, 'Tekrar dene'), btnSifre()];
    if (ctx.hal === 'kilitlendi') return [DD.bant({ton: 'hata', baslik: `${c.ad} geçici olarak durdu`, metin: 'Çok sayıda başarısız denemeden sonra telefonun doğrulamayı **bir süre durdurdu**.'}), btnSifre(true)];
    if (ctx.hal === 'iptal') return [DD.bant({ton: 'bilgi', baslik: 'Doğrulama iptal edildi', metin: 'Hazır olduğunda **yeniden dene** ya da şifrenle aç.'}), btnAc(c), btnSifre()];
    if (ctx.hal === 'kullanilamaz') return [DD.bant({ton: 'uyari', ...c.kullanilamaz}), btnSifre(true)];
    return [btnAc(c), btnSifre()];
  };
  const ac = ctx => {
    yaz({sonAcilis: Date.now()});
    const s = ctx.sorgu.sonra;
    if (s && s.startsWith('#/') && !s.startsWith('#/kilit')) DD.yerine(s); else DD.geri();
  };
  const sifreyle = ctx => { const s = ctx?.sorgu?.sonra; DD.yerine(`#/giris?eposta=${encodeURIComponent(eposta())}${s && s.startsWith('#/') && !s.startsWith('#/kilit') ? `&sonra=${encodeURIComponent(s)}` : ''}`); };
  const dogrula = ctx => {
    const so = ctx.sorgu.sonuc;
    return istem({sonuc: so === 'basarisiz' || so === 'kilitlendi' ? 'basarisiz' : 'basari'}).then(s => {
      if (s === 'basari') { ac(ctx); return; }
      if (s === 'sifre') { sifreyle(ctx); return; }
      ctx.hal = s === 'basarisiz' ? (so === 'kilitlendi' ? 'kilitlendi' : 'basarisiz') : s === 'izin-yok' ? 'kullanilamaz' : 'iptal';
      DD.tazele();
    });
  };

  DD.ekran('kilit', {
    haller: false,   // akış ekranı: ?hal= ortak halleri uygulanmaz; kendi halleri yukarıda
    tur: 'tam',
    tabagim: false,
    ciz: ctx => {
      if (ctx.hal === undefined) ctx.hal = HALLER.includes(ctx.sorgu.hal) ? ctx.sorgu.hal : '';
      const c = cihaz();
      return DD.karsilamaKabuk({
        gorsel: 'assets/gorsel/hero/mutfak-raf.webp',
        baslik: 'Dada Diet kilitli',
        metin: yalnizSifre(ctx.hal)
          ? 'Öğün, kilo ve sağlık kayıtların **kilit altında**. Şifrenle devam edebilirsin.'
          : `Öğün, kilo ve sağlık kayıtların **kilit altında**. Devam etmek için ${c.ios ? `${c.ad} ile` : 'parmak izinle ya da yüzünle'} doğrula.`,
        html: `<div class="dd-yigin-12" aria-live="polite">${halHtml(ctx, c).join('')}</div>`
      });
    },
    sonra: (kok, ctx) => {
      const c = [
        DD.eylem(kok, 'dogrula', () => dogrula(ctx)),
        DD.eylem(kok, 'sifre', () => sifreyle(ctx))
      ];
      // Kilitle gelen açılış istemi kendiliğinden başlatır (gerçek uygulamadaki gibi); elle açılan kilit ekranı düğmeyi bekler.
      let t = 0;
      if (!ctx.hal && !ctx.oto && (ctx.sorgu.sonra || ctx.sorgu.oto)) { ctx.oto = true; t = setTimeout(() => dogrula(ctx), DD.TK.motion.reveal); }
      return () => { clearTimeout(t); c.forEach(f => f()); };
    }
  });
})();
