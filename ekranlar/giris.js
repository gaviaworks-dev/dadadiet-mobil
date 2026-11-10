/* Giriş (#/giris), şifre sıfırlama (#/sifre-sifirla), e-posta doğrulama (#/eposta-dogrula): web giris/, sifremi-unuttum/, eposta-dogrula/ eşi. Üç rota tek ekran tanımıdır; ayrım ctx.hash.
 * Giriş: e-posta + şifre (kayıtlı hesap DDV.hesap.giris; Ayarlar'da değişen şifre hesap-ayar.guvenlik.sifre), Apple/Google. Başarıda DD.durum 'oturum' {yol:'giris'} ve #/bugun.
 *   Hatalar: boş alan, yanlış biçim, hatalı şifre (deneme hakkı sayılır, bitince giriş kilitlenir), bağlantı yok. ?hal=hata ilk denemede bağlantı hatası.
 * Şifre sıfırlama: ?adim yok → e-posta, ?adim=gonderildi → bağlantı gönderildi, ?adim=yeni → yeni şifre (hesap-ayar.guvenlik.sifre, sifreTarih).
 * E-posta doğrulama: ?eposta=<adres> (yoksa hesap-ayar.profil.epostaBekleyen). 6 haneli kod, yeniden gönder sayacı. Bekleyen adres doğrulanınca profil e-postası olur;
 *   üye geri döner, misafir onboarding'e geçer. ?sonra=<rota> doğrulama sonrası gidilecek yer. */
(() => {
  const G = () => DDV.hesap.giris;
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, GUCLU = /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ]).{8,}$/;
  const SSO = [{yol: 'apple', metin: 'Apple ile devam et', marka: 'apple'}, {yol: 'google', metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg'}];
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const ayarYaz = (b, ek) => DD.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  const kayitliSifre = () => tum().guvenlik?.sifre || G().sifre;
  const yol = ctx => ctx.hash.split('?')[0];
  const bekle = n => (DD.azHareket() ? 0 : DD.TK.motion.reveal * n);
  const enc = encodeURIComponent;
  const ayirac = `<p class="dd-t-meta dd-ton-ikincil dd-orta-metin" data-dd-hece="yok">ya da</p>`;
  let hataGosterildi = false;
  const baglantiYok = ctx => {
    if (navigator.onLine === false) return true;
    if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return true; }
    return false;
  };

  // ---------- Giriş ----------
  const girisForm = (d, h = {}) => `<div class="dd-yigin">
    ${DD.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@posta.com', deger: d.eposta, hata: h.eposta, otomatik: 'username'})}
    ${DD.input({ad: 'sifre', etiket: 'Şifre', ikon: 'lock', tur: 'password', yer: 'Şifren', deger: d.sifre, hata: h.sifre, otomatik: 'current-password'})}
  </div>`;
  const kilit = ctx => (ctx.deneme || 0) >= G().denemeHakki;
  const denemeBant = ctx => {
    const n = ctx.deneme || 0, kalan = G().denemeHakki - n;
    if (!n) return '';
    return kalan > 0
      ? DD.bant({ton: 'uyari', metin: `**${kalan} deneme hakkın** kaldı. Şifreni hatırlamıyorsan sıfırlayabilirsin.`})
      : DD.bant({ton: 'hata', baslik: 'Giriş geçici olarak kilitlendi', metin: 'Çok sayıda hatalı deneme oldu. **15 dakika** sonra yeniden dene ya da şifreni sıfırla.', eylem: {metin: 'Şifremi sıfırla', veri: {eylem: 'unuttum'}}});
  };
  const giris = ctx => {
    const d = ctx.taslak || {eposta: ctx.sorgu.eposta || G().eposta, sifre: ctx.sorgu.eposta ? '' : kayitliSifre()};
    return `<div class="dd-ic dd-yigin-24">
      ${DD.metinBlok({baslik: 'Tekrar hoş geldin', metin: 'Kaldığın yerden devam et; **kayıtların** seni bekliyor.'})}
      <div class="dd-yigin-12">
        <div data-yuva="form">${girisForm(d, ctx.hatalar)}</div>
        <div class="dd-ara">${DD.checkbox({ad: 'hatirla', etiket: 'Beni hatırla', secili: true})}${DD.btn({metin: 'Şifremi unuttum', tur: 'text', boyut: 'sm', veri: {eylem: 'unuttum'}})}</div>
        <div data-yuva="deneme">${denemeBant(ctx)}</div>
      </div>
      ${DD.btn({metin: 'Giriş yap', ikon: 'right-to-bracket', tam: true, pasif: kilit(ctx), veri: {eylem: 'giris'}})}
      ${ayirac}
      <div class="dd-yigin-8">${SSO.map(b => DD.btn({...b, tur: 'secondary', tam: true, veri: {eylem: 'sso', id: b.yol}})).join('')}</div>
      ${DD.p('Dada Gastro ya da Dada Fit hesabın varsa **aynı hesapla** giriş yapabilirsin.', {orta: true, meta: true, ton: 'ikincil'})}
    </div>`;
  };
  const oturumAc = () => { DD.durum.yaz('oturum', {yol: 'giris'}); DD.yerine('#/bugun'); DD.toast(`Tekrar hoş geldin, **${DDV.kullanici.ad}**`, {tur: 'basari'}); };
  const girisBagla = (kok, ctx) => {
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const formCiz = (d, h) => { ctx.taslak = d; ctx.hatalar = h; kok.querySelector('[data-yuva="form"]').innerHTML = girisForm(d, h); };
    return [
      DD.eylem(kok, 'unuttum', () => DD.git(`#/sifre-sifirla?eposta=${enc(v('eposta').trim())}`)),
      DD.eylem(kok, 'giris', el => {
        const d = {eposta: v('eposta').trim(), sifre: v('sifre')};
        const h = {eposta: !d.eposta ? 'E-posta adresini yaz' : EPOSTA.test(d.eposta) ? '' : 'Geçerli bir e-posta adresi yaz', sifre: d.sifre ? '' : 'Şifreni yaz'};
        if (h.eposta || h.sifre) { formCiz(d, h); return; }
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => {
          if (d.eposta.toLocaleLowerCase('tr') === G().eposta && d.sifre === kayitliSifre()) { oturumAc(); return; }
          ctx.deneme = (ctx.deneme || 0) + 1;
          formCiz({...d, sifre: ''}, {sifre: 'E-posta ya da şifre hatalı'});
          kok.querySelector('[data-yuva="deneme"]').innerHTML = denemeBant(ctx);
          if (kilit(ctx)) el.disabled = true;
          DD.titres(20);
        });
      }),
      DD.eylem(kok, 'sso', el => {
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(oturumAc);
      })
    ];
  };

  // ---------- Şifre sıfırlama ----------
  const sifirla = ctx => {
    const a = ctx.sorgu.adim, ep = ctx.sorgu.eposta || '';
    if (a === 'gonderildi') return `<div class="dd-ic dd-yigin-24">${DD.bos({ikon: 'envelope-circle-check', baslik: 'Bağlantı gönderildi', metin: `**${ep}** kayıtlıysa birkaç dakika içinde sıfırlama bağlantısı gelir. Gelen kutunu ve spam klasörünü kontrol et.`})}<div class="dd-yigin-8">${DD.btn({metin: 'Bağlantıyı açtım', ikon: 'link', tam: true, yerine: `#/sifre-sifirla?adim=yeni&eposta=${enc(ep)}`})}<div data-yuva="tekrar"></div></div></div>`;
    if (a === 'yeni') return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'Yeni şifreni belirle', metin: `**${ep || 'Hesabın'}** için yeni bir şifre seç. Başka sitede kullandığın şifreyi tekrar etme.`})}<div data-yuva="form">${yeniForm(ctx.taslak || {}, ctx.hatalar)}</div></div>`;
    return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'Şifreni sıfırla', metin: 'E-posta adresini yaz, **sıfırlama bağlantısını** gönderelim.'})}<div data-yuva="form">${DD.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@posta.com', deger: ctx.taslak?.eposta ?? ep, hata: ctx.hatalar?.eposta, otomatik: 'email'})}</div></div>`;
  };
  const yeniForm = (d, h = {}) => `<div class="dd-yigin">${DD.input({ad: 'yeni', etiket: 'Yeni şifre', ikon: 'key', tur: 'password', deger: d.yeni, hata: h.yeni, otomatik: 'new-password', yardim: G().sifreKurali})}${DD.input({ad: 'tekrar', etiket: 'Yeni şifre (tekrar)', ikon: 'key', tur: 'password', deger: d.tekrar, hata: h.tekrar, otomatik: 'new-password'})}</div>`;
  const sifirlaBar = ctx => {
    const a = ctx.sorgu.adim;
    if (a === 'gonderildi') return DD.altEylem({dugmeler: [{metin: 'Giriş ekranına dön', tur: 'text', tam: true, yerine: `#/giris?eposta=${enc(ctx.sorgu.eposta || '')}`}]});
    return DD.altEylem({dugmeler: [a === 'yeni' ? {metin: 'Şifremi kaydet', ikon: 'onay', tam: true, veri: {eylem: 'sifre-kaydet'}} : {metin: 'Sıfırlama bağlantısı gönder', ikon: 'gonder', tam: true, veri: {eylem: 'gonder'}}]});
  };
  const sifirlaBagla = (kok, ctx) => {
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const c = [
      DD.eylem(kok, 'gonder', el => {
        const ep = v('eposta').trim(), h = !ep ? 'E-posta adresini yaz' : EPOSTA.test(ep) ? '' : 'Geçerli bir e-posta adresi yaz';
        if (h) { ctx.taslak = {eposta: ep}; ctx.hatalar = {eposta: h}; kok.querySelector('[data-yuva="form"]').innerHTML = DD.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@posta.com', deger: ep, hata: h, otomatik: 'email'}); return; }
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => DD.yerine(`#/sifre-sifirla?adim=gonderildi&eposta=${enc(ep)}`));
      }),
      DD.eylem(kok, 'sifre-kaydet', el => {
        const d = {yeni: v('yeni'), tekrar: v('tekrar')}, h = {yeni: !d.yeni ? 'Yeni şifreni yaz' : GUCLU.test(d.yeni) ? '' : 'Şifre kurallara uymuyor', tekrar: d.yeni === d.tekrar ? '' : 'Şifreler birbiriyle aynı değil'};
        if (h.yeni || h.tekrar) { ctx.taslak = d; ctx.hatalar = h; kok.querySelector('[data-yuva="form"]').innerHTML = yeniForm(d, h); return; }
        DD.mesgul(el, bekle(2)).then(() => {
          ayarYaz('guvenlik', {sifre: d.yeni, sifreTarih: DD.bugunIso()});
          DD.yerine(`#/giris?eposta=${enc(ctx.sorgu.eposta || '')}`);
          DD.toast('Şifren **güncellendi**; yeni şifrenle giriş yap', {tur: 'basari'});
        });
      })
    ];
    if (ctx.sorgu.adim === 'gonderildi') c.push(sayac(kok, () => DD.toast(`Bağlantı **${ctx.sorgu.eposta}** adresine yeniden gönderildi`, {ikon: 'envelope'})));
    return c;
  };

  // Yeniden gönder: süre dolana dek pasif, sonra etkin metin düğmesi. Dönen işlev aralığı durdurur.
  const sayac = (kok, gonder) => {
    const y = kok.querySelector('[data-yuva="tekrar"]');
    if (!y) return () => {};
    let kalan = G().yenidenGonderSn, t = null;
    const ciz = () => { y.innerHTML = kalan > 0 ? DD.btn({metin: `${kalan} sn sonra yeniden gönder`, tur: 'text', tam: true, pasif: true}) : DD.btn({metin: 'Yeniden gönder', ikon: 'rotate-right', tur: 'text', tam: true, veri: {eylem: 'tekrar-gonder'}}); };
    const basla = () => { kalan = G().yenidenGonderSn; ciz(); clearInterval(t); t = setInterval(() => { kalan -= 1; ciz(); if (kalan <= 0) clearInterval(t); }, 1000); };
    const e = DD.eylem(kok, 'tekrar-gonder', () => { gonder(); basla(); });
    basla();
    return () => { clearInterval(t); e(); };
  };

  // ---------- E-posta doğrulama ----------
  const dogrulaEposta = ctx => ctx.sorgu.eposta || tum().profil?.epostaBekleyen || (DD.yeniHesap() ? '' : DDV.kullanici.eposta);
  const kodAlan = (d = '', h = '') => DD.input({ad: 'kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: `${G().kodUzunluk} haneli kod`, deger: d, hata: h, otomatik: 'one-time-code'});
  const dogrula = ctx => {
    const ep = dogrulaEposta(ctx);
    return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'E-postanı doğrula', metin: ep ? `**${ep}** adresine ${G().kodUzunluk} haneli bir kod gönderdik. Birkaç dakika içinde gelmezse spam klasörüne bak.` : `E-posta adresine gelen **${G().kodUzunluk} haneli kodu** yaz.`})}<div class="dd-yigin-12"><div data-yuva="kod">${kodAlan(ctx.taslak, ctx.hata)}</div><div data-yuva="tekrar"></div></div>${DD.btn({metin: 'Yanlış adres mi yazdın?', tur: 'text', tam: true, geri: true})}</div>`;
  };
  const dogrulaBagla = (kok, ctx) => {
    const ep = dogrulaEposta(ctx), alan = kok.querySelector('[name="kod"]');
    if (alan) alan.maxLength = G().kodUzunluk;
    return [
      sayac(kok, () => DD.toast(`Yeni kod **${ep || 'e-posta adresine'}** gönderildi`, {ikon: 'envelope'})),
      DD.eylem(kok, 'kod-dogrula', el => {
        const k = (kok.querySelector('[name="kod"]')?.value || '').replace(/\s/g, ''), n = G().kodUzunluk;
        const h = !k ? 'Kodu yaz' : !/^\d+$/.test(k) ? 'Kod yalnız rakamdan oluşur' : k.length !== n ? `Kod ${n} haneli olmalı` : '';
        if (h) { ctx.taslak = k; ctx.hata = h; kok.querySelector('[data-yuva="kod"]').innerHTML = kodAlan(k, h); kok.querySelector('[name="kod"]').maxLength = n; return; }
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => {
          const p = tum().profil || {};
          if (ep && p.epostaBekleyen === ep) ayarYaz('profil', {eposta: ep, epostaBekleyen: null});
          DD.toast('E-postan **doğrulandı**', {tur: 'basari'});
          if (ctx.sorgu.sonra) DD.yerine(ctx.sorgu.sonra);
          else if (DD.uye()) DD.geri();
          else { DD.durum.yaz('onboarding', {...DD.durum.oku('onboarding', {}), giris: 'eposta'}); DD.yerine('#/onboarding/hedef'); }
        });
      })
    ];
  };

  // ---------- Ekran ----------
  const BASLIK = {'#/giris': 'Giriş yap', '#/sifre-sifirla': 'Şifreni sıfırla', '#/eposta-dogrula': 'E-posta doğrulama'};
  DD.ekran('giris', {
    tur: 'alt',
    tabagim: false,
    get ust() { return location.hash.startsWith('#/eposta-dogrula') ? (DD.uye() ? '#/ayarlar/profil' : '#/karsilama') : location.hash.startsWith('#/sifre-sifirla') ? '#/giris' : '#/karsilama'; },
    baslik: ctx => BASLIK[yol(ctx)] || 'Giriş yap',
    ustBar: () => ({menu: false}),
    ciz: ctx => ({'#/sifre-sifirla': sifirla, '#/eposta-dogrula': dogrula}[yol(ctx)] || giris)(ctx),
    altBar: ctx => {
      const y = yol(ctx);
      if (y === '#/sifre-sifirla') return sifirlaBar(ctx);
      if (y === '#/eposta-dogrula') return DD.altEylem({dugmeler: [{metin: 'Doğrula', ikon: 'onay', tam: true, veri: {eylem: 'kod-dogrula'}}]});
      return DD.altEylem({dugmeler: [{metin: 'Hesabın yok mu? Üye ol', tur: 'text', tam: true, yerine: '#/karsilama'}]});
    },
    sonra: (kok, ctx) => {
      const y = yol(ctx), c = (y === '#/sifre-sifirla' ? sifirlaBagla : y === '#/eposta-dogrula' ? dogrulaBagla : girisBagla)(kok, ctx);
      const tus = ev => { if (ev.key === 'Enter' && ev.target.matches?.('input')) { ev.preventDefault(); kok.querySelector('[data-eylem="giris"],[data-eylem="gonder"],[data-eylem="sifre-kaydet"],[data-eylem="kod-dogrula"]')?.click(); } };
      kok.addEventListener('keydown', tus);
      return () => { c.forEach(f => f?.()); kok.removeEventListener('keydown', tus); };
    }
  });
})();
