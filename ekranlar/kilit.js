/* Uygulama kilidi (#/kilit): sağlık kayıtları için Face ID / Touch ID / parmak izi (Android BiometricPrompt) ile açılış. Gastro'da karşılığı yok;
 *   kabuk Karşılama'nın gülücük kapağı (DD.karsilamaKabuk), haller DD.bant, biyometrik istem kanon DD.biyometrikIstem (kanon/dd-cihaz.js), ilk Face ID izni telefonun sistem uyarısı (DD.sistemUyari).
 * Durum DD.durum 'uygulama-kilidi' {acik, gecikme:'hemen'|'1'|'5', platform?, faceIzin?, sonAcilis, bekliyor, sifreyle, sonra}. Ayar: Ayarlar › Güvenlik › Uygulama kilidi (ayarlar.js).
 * Platform: ?platform=ios|ios-touch|android (durumda kalır), yoksa tarayıcı kimliği (Android → android, diğerleri ios). Metin ve ikon platforma göredir;
 *   Face ID simgesi kanon `yuz-tarama` (genel yüz tarama çizimi, resmi glif değil).
 * Kilit ne zaman gelir: üye + kilit açıkken (1) her soğuk açılışta #/kilit?sonra=<adres>, (2) arka plandan dönüşte seçilen gecikme (hemen, 1 dk, 5 dk)
 *   geçtiyse bulunulan ekranın yerine (DD.yerine; geri tuşu kilidi atlamaz). Açılınca sonra adresine dönülür.
 * Kilit beklerken (bekliyor) yalnız kilit, giris, iki-adim, sifre-sifirla açılır: DD.git/DD.yerine sarılır, popstate yakalanır, girişten geri kilide döner;
 *   karşılama, onboarding ve açılış dahil her adres kilide çevrilir. "Şifreyle aç" oturuma kilitSifre işareti koyar; giriş başarısı oturumu yeniden yazınca
 *   işaret düşer ve bekleme biter (giris.js'e dokunmadan).
 * Ekrana özgü haller (?hal=): basarisiz (tanımadı), kilitlendi (telefon çok başarısız denemeden sonra doğrulamayı durdurdu; yalnız şifre),
 *   iptal (istem kapatıldı), kullanilamaz (iOS'ta Face ID izni kapalı / Touch ID kurulu değil, Android'de parmak izi ya da yüz kayıtlı değil).
 *   Deneme sayısı uygulamada tutulmaz: sınırı telefon koyar (sistem kilidi), ekranda sayı yok.
 * ?dene=1 (Ayarlar › Kilit ekranını dene): bekleme yazılmaz, şifre yolu yerine Vazgeç; açılınca ya da vazgeçince geri dönülür.
 * Kilit gerekmiyorsa (misafir, kilit kapalı, açıldıktan sonra geçmişten gelinen kilit kaydı) kilit çizilmez, ?sonra (yoksa #/bugun) açılır.
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
  // Kilit beklerken (üye + kilit açık + doğrulanmamış) yalnız bu adresler açılır (rotanın tamamı; alt yollar değil); geri kalan her adres kilide döner.
  const SERBEST = /^#\/(kilit|giris|iki-adim|sifre-sifirla)(?=\?|$)/;
  const GIRIS = /^#\/(giris|iki-adim|sifre-sifirla)(?=\?|$)/;
  // Dönüş adresi olamayanlar: açılış akışı ve kilit/giriş önekli adresler (alt yollar dahil).
  const DONUSSUZ = /^#\/(splash|karsilama|onboarding|kilit|giris|iki-adim|sifre-sifirla)(?=[/?]|$)|^#\/?$/;

  const durum = () => ({acik: false, gecikme: 'hemen', ...DD.durum.oku(ANAHTAR, {})});
  const yaz = ek => DD.durum.yaz(ANAHTAR, {...durum(), ...ek});
  const platform = () => {
    const s = new URLSearchParams(location.hash.split('?')[1] || '').get('platform');
    if (P[s]) { if (durum().platform !== s) yaz({platform: s}); return s; }
    return P[durum().platform] ? durum().platform : /Android/i.test(navigator.userAgent) ? 'android' : 'ios';
  };
  const cihaz = () => { const p = platform(); return {platform: p, ios: p !== 'android', ...P[p]}; };
  const kilitli = () => durum().acik && DD.uye();
  const oturum = () => DD.durum.oku('oturum', null);
  const donus = h => (h && h.startsWith('#/') && !DONUSSUZ.test(h) ? h : null);

  // Bekleyen kilit: durum.bekliyor. Giriş ekranlarına geçilince oturuma kilitSifre işareti konur (hangi yoldan gelinirse gelinsin);
  // giriş başarılı olunca giris.js oturumu yeniden yazar, işaret düşer = şifreyle doğrulandı. Açılan kilidin dönüş adresi `acildi`ya geçer.
  const bekliyor = () => {
    const k = durum();
    if (!k.bekliyor) return false;
    if (!kilitli()) { yaz({bekliyor: false, sifreyle: false}); return false; }
    if (k.sifreyle && !oturum()?.kilitSifre) { yaz({bekliyor: false, sifreyle: false, acildi: k.sonra || null}); return false; }
    return true;
  };
  const isaretle = () => { const o = oturum(); if (o && !o.kilitSifre) DD.durum.yaz('oturum', {...o, kilitSifre: true}); if (!durum().sifreyle) yaz({sifreyle: true}); };
  // Kilidi bekleyen duruma alır, açılınca dönülecek adresi saklar ve kilit adresini verir. koru: zaten beklerken ilk kilitlendiği adres korunur.
  const kilitle = (h, koru) => {
    const k = durum();
    const s = (koru && k.bekliyor && k.sonra) || donus(h) || k.sonra || '#/bugun';
    yaz({bekliyor: true, sonra: s});
    return `#/kilit?sonra=${encodeURIComponent(s)}`;
  };

  // Biyometrik istem: iOS'ta Face ID ilk kullanımda telefonun sistem uyarısıyla izin sorulur (DD.sistemUyari), sonra kanon DD.biyometrikIstem.
  // Uyarı rota değişimiyle kapanırsa (null) izin kaydedilmez, sonuç 'iptal'. → Promise<'basari'|'basarisiz'|'iptal'|'sifre'|'izin-yok'>
  const istem = (o = {}) => {
    const c = cihaz();
    const izin = c.platform !== 'ios' ? Promise.resolve(true)
      : durum().faceIzin === true ? Promise.resolve(true)
      : durum().faceIzin === false ? Promise.resolve(false)
      : DD.sistemUyari({platform: 'ios', baslik: '“Dada Diet” Face ID kullanmak istiyor', metin: 'Uygulamayı açarken kimliğini doğrulamak için Face ID kullanılır.', red: 'İzin Verme', ver: 'İzin Ver'}).then(ok => { if (ok !== null) yaz({faceIzin: ok}); return ok; });
    return izin.then(ok => (ok === null ? 'iptal' : ok ? DD.biyometrikIstem({platform: c.platform, neden: o.neden || 'Sağlık kayıtlarına erişmek için', sonuc: o.sonuc}) : 'izin-yok'));
  };

  // Ayarlar ve kilit ekranının ortak kaynağı.
  DD.uygulamaKilidi = {durum, yaz, cihaz, istem, bekliyor, GECIKME, gecikmeAd: v => (GECIKME.find(([k]) => k === v) || GECIKME[0])[1]};

  // Yönlendirme kapısı (kanon yönlendiricisi değişmez, çağrılar sarılır):
  //   beklerken DD.git/DD.yerine serbest olmayan adresi kilide çevirir, giriş ekranına geçişte işaret konur; girişten geri kilide döner;
  //   kilit yeni açıldıysa girişin varsayılan dönüşü (#/bugun) kilitlendiği adrese çevrilir (iki adım yenilense de);
  //   geri/ileri tuşu ve adres değişimi (popstate) ekran çizilmeden yakalanır: geçmiş kaydı değiştirilmez, bulunulan adres yeniden itilir.
  const asil = {git: DD.git, yerine: DD.yerine, geri: DD.geri};
  const kapi = h => {
    if (bekliyor()) { if (!SERBEST.test(h)) return kilitle(h, true); if (GIRIS.test(h)) isaretle(); return h; }
    const a = durum().acildi;
    if (a) { yaz({acildi: null}); if (h === '#/bugun' && GIRIS.test(DD.aktif()?.hash || '')) return a; }
    return h;
  };
  DD.git = h => { const y = kapi(h); return y === h ? asil.git(h) : asil.yerine(y); };
  DD.yerine = h => asil.yerine(kapi(h));
  DD.geri = (...a) => {
    if (bekliyor() && /^#\/giris(?=\?|$)/.test(DD.aktif()?.hash || location.hash)) { asil.yerine(kilitle(null, true)); return; }
    asil.geri(...a);
  };
  addEventListener('popstate', ev => {
    const h = location.hash || '#/bugun';
    if (!bekliyor()) return;
    if (SERBEST.test(h)) { if (GIRIS.test(h)) isaretle(); return; }
    ev.stopImmediatePropagation();
    const g = DD.aktif();
    history.pushState({dd: g?.i ?? 0}, '', g?.hash || '#/kilit');
    if (!/^#\/kilit(?=\?|$)/.test(g?.hash || '')) asil.yerine(kilitle(h, true));
  }, true);

  // Soğuk açılış: kilit açıksa her açılış kilit bekler; router adresi okumadan önce kilit ekranına çevrilir (ekran dosyaları rotadan önce yüklenir).
  try {
    if (kilitli()) {
      const h = location.hash || '#/splash', k = durum();
      yaz({sifreyle: !!(k.sifreyle && oturum()?.kilitSifre), acildi: null});
      if (SERBEST.test(h)) { yaz({bekliyor: true}); if (GIRIS.test(h)) isaretle(); }
      else history.replaceState(null, '', `${kilitle(h)}&oto=1`);
    }
  } catch { /* yok */ }
  // Arka plandan dönüş: seçilen gecikme geçtiyse bulunulan ekranın yerine kilit açılır (geri tuşu kilidi atlamaz); açılınca o ekrana dönülür.
  let gizlendi = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { gizlendi = Date.now(); return; }
    const a = DD.aktif()?.hash || location.hash;
    if (!gizlendi || !kilitli() || bekliyor() || SERBEST.test(a) || Date.now() - gizlendi < (GECIKME_MS[durum().gecikme] ?? 0)) return;
    gizlendi = 0; asil.yerine(`${kilitle(a)}&oto=1`);
  });

  // ---------- Kilit ekranı ----------
  const eposta = () => DD.durum.oku('hesap-ayar', {})?.profil?.eposta || DDV.hesap.giris.eposta;
  const dene = ctx => ctx.sorgu.dene === '1';
  const btnAc = (c, metin = c.ac) => DD.btn({metin, ikon: c.ikon, tam: true, veri: {eylem: 'dogrula'}});
  // Denemede (Ayarlar › Kilit ekranını dene) şifre yolu yerine Vazgeç: doğrulamadan geri dönülür.
  const btnIkinci = (ctx, ana = false) => (dene(ctx)
    ? DD.btn({metin: 'Vazgeç', tur: ana ? 'secondary' : 'text', tam: true, veri: {eylem: 'vazgec'}})
    : DD.btn({metin: 'Şifreyle aç', ikon: 'key', tur: ana ? 'primary' : 'text', tam: true, veri: {eylem: 'sifre'}}));
  const yalnizSifre = h => h === 'kilitlendi' || h === 'kullanilamaz';
  const halHtml = (ctx, c) => {
    if (ctx.hal === 'basarisiz') return [DD.bant({ton: 'uyari', baslik: c.tanimadi, metin: `${c.ipucu} **Tekrar dene** ya da şifrenle aç.`}), btnAc(c, 'Tekrar dene'), btnIkinci(ctx)];
    if (ctx.hal === 'kilitlendi') return [DD.bant({ton: 'hata', baslik: `${c.ad} geçici olarak durdu`, metin: 'Çok sayıda başarısız denemeden sonra telefonun doğrulamayı **bir süre durdurdu**.'}), btnIkinci(ctx, true)];
    if (ctx.hal === 'iptal') return [DD.bant({ton: 'bilgi', baslik: 'Doğrulama iptal edildi', metin: 'Hazır olduğunda **yeniden dene** ya da şifrenle aç.'}), btnAc(c), btnIkinci(ctx)];
    if (ctx.hal === 'kullanilamaz') return [DD.bant({ton: 'uyari', ...c.kullanilamaz}), btnIkinci(ctx, true)];
    return [btnAc(c), btnIkinci(ctx)];
  };
  const isaretSil = () => { const o = oturum(); if (o?.kilitSifre) { const {kilitSifre, ...kalan} = o; DD.durum.yaz('oturum', kalan); } };
  const ac = ctx => {
    yaz({sonAcilis: Date.now(), bekliyor: false, sifreyle: false, acildi: null}); isaretSil();
    const s = donus(ctx.sorgu.sonra);
    if (s && !dene(ctx)) DD.yerine(s); else DD.geri();
  };
  // Şifreyle açılış: mevcut giriş; başarıda ?sonra adresine dönülür (giris.js). Kilit girişe dek bekler; girişten geri kilide döner.
  const sifreyle = ctx => {
    const s = donus(ctx?.sorgu?.sonra) || durum().sonra || '#/bugun';
    if (kilitli()) { yaz({bekliyor: true, sonra: s}); isaretle(); }
    DD.yerine(`#/giris?eposta=${encodeURIComponent(eposta())}&sonra=${encodeURIComponent(s)}`);
  };
  const dogrula = ctx => {
    const so = ctx.sorgu.sonuc;
    return istem({sonuc: so === 'basarisiz' || so === 'kilitlendi' ? 'basarisiz' : 'basari'}).then(s => {
      if (s === 'basari') { ac(ctx); return; }
      if (s === 'sifre' && !dene(ctx)) { sifreyle(ctx); return; }
      ctx.hal = s === 'basarisiz' ? (so === 'kilitlendi' ? 'kilitlendi' : 'basarisiz') : s === 'izin-yok' ? 'kullanilamaz' : 'iptal';
      DD.tazele();
    });
  };
  // Kilit gerekmeyen açılış (misafir, kilit kapalı, açıldıktan sonra geçmişten yeniden gelinen kilit kaydı): kilit çizilmez, dönüş adresine gidilir.
  const gereksiz = ctx => !dene(ctx) && !bekliyor();

  DD.ekran('kilit', {
    haller: false,   // akış ekranı: ?hal= ortak halleri uygulanmaz; kendi halleri yukarıda
    tur: 'tam',
    tabagim: false,
    ciz: ctx => {
      if (gereksiz(ctx)) return '';
      if (ctx.hal === undefined) ctx.hal = HALLER.includes(ctx.sorgu.hal) ? ctx.sorgu.hal : '';
      const c = cihaz();
      return DD.karsilamaKabuk({
        gorsel: 'assets/gorsel/hero/mutfak-raf.webp',
        baslik: 'Dada Diet kilitli',
        metin: yalnizSifre(ctx.hal) && !dene(ctx)
          ? 'Öğün, kilo ve sağlık kayıtların **kilit altında**. Şifrenle devam edebilirsin.'
          : `Öğün, kilo ve sağlık kayıtların **kilit altında**. Devam etmek için ${c.ios ? `${c.ad} ile` : 'parmak izinle ya da yüzünle'} doğrula.`,
        html: `<div class="dd-yigin-12" aria-live="polite">${halHtml(ctx, c).join('')}</div>`
      });
    },
    sonra: (kok, ctx) => {
      if (gereksiz(ctx)) { setTimeout(() => asil.yerine(donus(ctx.sorgu.sonra) || '#/bugun')); return null; }
      const c = [
        DD.eylem(kok, 'dogrula', () => dogrula(ctx)),
        DD.eylem(kok, 'sifre', () => sifreyle(ctx)),
        DD.eylem(kok, 'vazgec', () => DD.geri())
      ];
      // Kilitle gelen açılış (?oto=1: soğuk açılış, arka plandan dönüş) istemi kendiliğinden başlatır; girişten dönüş, deneme ve elle açılış düğmeyi bekler.
      let t = 0;
      if (!ctx.hal && !ctx.oto && ctx.sorgu.oto) { ctx.oto = true; t = setTimeout(() => dogrula(ctx), DD.TK.motion.reveal); }
      return () => { clearTimeout(t); c.forEach(f => f()); };
    }
  });
})();
