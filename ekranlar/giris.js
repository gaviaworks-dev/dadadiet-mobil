/* Giriş (#/giris), iki adımlı doğrulama (#/iki-adim), şifre sıfırlama (#/sifre-sifirla), e-posta doğrulama (#/eposta-dogrula): web giris/, sifremi-unuttum/, eposta-dogrula/ eşi.
 *   Dört rota tek ekran tanımıdır; ayrım ctx.hash. Gastro kalıbı ortak/sayfalar/hesap.js (giris, yeni-sifre, eposta-dogrula, iki-adim).
 * Giriş (Gastro hesap.js giriş sırası): gülücük kapak + saydam üst bar, sosyal düğmeler, "ya da e-posta ile" ayracı, form, en altta "Hesabın yok mu?"; "Giriş yap" altBar'da.
 * Giriş: e-posta + şifre (kayıtlı hesap DDV.hesap.giris; Ayarlar'da değişen şifre hesap-ayar.guvenlik.sifre), Apple/Google. Başarıda DD.durum 'oturum' {yol:'giris'} ve #/bugun.
 *   Ayarlar > Güvenlik'te iki adım açıksa (hesap-ayar.guvenlik.ikiAdim, varsayılan DDV.hesap.varsayilan.guvenlik) e-posta + şifre başarısı #/iki-adim'e gider; Apple/Google doğrudan açar.
 *   Hatalar: boş alan, yanlış biçim, hatalı şifre (deneme hakkı sayılır, bitince giriş kilitlenir), bağlantı yok. ?hal=hata ilk denemede bağlantı hatası.
 * İki adımlı doğrulama: ?eposta=<adres>. Yöntem guvenlik.yontem: sms (maskeli telefon, yeniden gönder sayacı) | uygulama. 6 haneli kod (DDV.hesap.giris.ikiAdimKod).
 *   ?mod=kurtarma → kurtarma kodu (guvenlik.kodlar ya da DDV.hesap.kurtarmaKodlari; kullanılınca guvenlik.kurtarmaKalan bir azalır).
 *   Hatalı kod deneme hakkını (denemeHakki) iki modda ortak harcar; bitince doğrulama kilitlenir. Başarıda #/bugun.
 * Şifre sıfırlama: ?adim yok → e-posta, ?adim=gonderildi → bağlantı gönderildi, ?adim=yeni → yeni şifre (hesap-ayar.guvenlik.sifre, sifreTarih).
 *   ?adim=yeni&hal=sure-doldu → bağlantı geçersiz ya da süresi dolmuş, yeni bağlantı iste. Yeni şifre hatası eksik kuralları sayar (DDV.hesap.giris.sifreKurallari).
 * E-posta doğrulama: ?eposta=<adres> (yoksa hesap-ayar.profil.epostaBekleyen). 6 haneli kod, yeniden gönder sayacı. Bekleyen adres doğrulanınca profil e-postası olur;
 *   üye geri döner, misafir onboarding'e geçer. ?sonra=<rota> doğrulama sonrası gidilecek yer.
 *   ?hal=zaten → adres zaten doğrulanmış (kod alanı yok, Devam et). ?hal=gecersiz → kod geçersiz ya da süresi dolmuş: yeni kod istenene dek her kod reddedilir. */
(() => {
  const G = () => DDV.hesap.giris;
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const SSO = [{yol: 'apple', metin: 'Apple ile devam et', marka: 'apple'}, {yol: 'google', metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg'}];
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const ayarYaz = (b, ek) => DD.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  // Kayıtlı hesabın güvenlik ayarı (Ayarlar > Güvenlik ile aynı kaynak); giriş anında oturum yok, bu yüzden yeni hesap boşluğu uygulanmaz.
  const guvenlik = () => ({...DDV.hesap.varsayilan.guvenlik, ...(tum().guvenlik || {})});
  const telefon = () => ({...DDV.hesap.varsayilan.profil, ...(tum().profil || {})}).telefon || '';
  const kayitliSifre = () => tum().guvenlik?.sifre || G().sifre;
  const yol = ctx => ctx.hash.split('?')[0];
  const bekle = n => (DD.azHareket() ? 0 : DD.TK.motion.reveal * n);
  const enc = encodeURIComponent;
  const ayirac = `<p class="dd-t-meta dd-ton-ikincil dd-orta-metin" data-dd-hece="yok">ya da e-posta ile</p>`;
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
    return `${DD.gulucuk({gorsel: 'assets/gorsel/hero/karsilama-sofra.webp', etiket: 'Dada Diet', baslik: 'Tekrar hoş geldin', alt: 'Kaldığın yerden devam et; kayıtların seni bekliyor.', ust: true})}${DD.gruplar([
      `<div class="dd-yigin-12"><div class="dd-ikili">${SSO.map(b => DD.btn({...b, metin: b.yol === 'apple' ? 'Apple' : 'Google', etiket: b.metin, tur: 'secondary', veri: {eylem: 'sso', id: b.yol}})).join('')}</div>${DD.p('Dada Gastro ya da Dada Fit hesabın varsa **aynı hesapla** giriş yapabilirsin.', {orta: true, meta: true, ton: 'ikincil'})}</div>`,
      ayirac,
      `<div class="dd-yigin-12"><div data-yuva="form">${girisForm(d, ctx.hatalar)}</div><div class="dd-ara">${DD.checkbox({ad: 'hatirla', etiket: 'Beni hatırla', secili: true})}${DD.btn({metin: 'Şifremi unuttum', tur: 'text', boyut: 'sm', veri: {eylem: 'unuttum'}})}</div><div data-yuva="deneme">${denemeBant(ctx)}</div></div>`,
      DD.btn({metin: 'Hesabın yok mu? Üye ol', tur: 'text', tam: true, yerine: '#/karsilama'})
    ])}`;
  };
  const oturumAc = (mesaj = `Tekrar hoş geldin, **${DDV.kullanici.ad}**`) => { DD.durum.yaz('oturum', {yol: 'giris'}); DD.yerine('#/bugun'); DD.toast(mesaj, {tur: 'basari'}); };
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
          if (d.eposta.toLocaleLowerCase('tr') === G().eposta && d.sifre === kayitliSifre()) {
            if (guvenlik().ikiAdim) { ikiDeneme = 0; DD.git(`#/iki-adim?eposta=${enc(d.eposta)}`); } else oturumAc();
            return;
          }
          ctx.deneme = (ctx.deneme || 0) + 1;
          formCiz({...d, sifre: ''}, {sifre: 'E-posta ya da şifre hatalı'});
          kok.querySelector('[data-yuva="deneme"]').innerHTML = denemeBant(ctx);
          if (kilit(ctx)) el.disabled = true;
          DD.titres(20);
        });
      }),
      DD.eylem(kok, 'sso', el => {
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => oturumAc());
      })
    ];
  };

  // ---------- İki adımlı doğrulama (giriş adımı) ----------
  // Gastro iki-adim: kod alanı, kurtarma kodu yolu, "Farklı hesapla giriş yap". Deneme sayacı modül düzeyinde: kod ve kurtarma modu aynı hakkı harcar.
  let ikiDeneme = 0;
  const kurtarmaKodlari = () => guvenlik().kodlar || DDV.hesap.kurtarmaKodlari;
  const rakam = s => String(s || '').replace(/\D/g, '');
  const telMaske = t => (t ? `+90 ${t.slice(0, 3)} ••• •• ${t.slice(-2)}` : '');   // yıldız değil: ** vurgusunu bozar
  const ikiKilit = () => ikiDeneme >= G().denemeHakki;
  const ikiBant = kurtarma => {
    const kalan = G().denemeHakki - ikiDeneme;
    if (!ikiDeneme) return '';
    return kalan > 0
      ? DD.bant({ton: 'uyari', metin: `**${kalan} deneme hakkın** kaldı. ${kurtarma ? 'Kodu tire olmadan da yazabilirsin.' : 'Koda ulaşamıyorsan kurtarma kodu kullanabilirsin.'}`})
      : DD.bant({ton: 'hata', baslik: 'Doğrulama geçici olarak kilitlendi', metin: 'Çok sayıda hatalı kod girildi. **15 dakika** sonra yeniden giriş yap.', eylem: {metin: 'Giriş ekranına dön', yerine: '#/giris'}});
  };
  // Kurtarma kodu sayısal klavyeyle tiresiz yazılır (kayıtlı biçim 000-000, tireli de kabul edilir). Kilitliyken alan pasif.
  const ikiAlan = (kurtarma, d = '', h = '') => (kurtarma
    ? DD.input({ad: 'kod', etiket: 'Kurtarma kodu', ikon: 'key', mod: 'numeric', yer: rakam(kurtarmaKodlari()[0]).replace(/\d/g, '0'), deger: d, hata: h, otomatik: 'off', pasif: ikiKilit()})
    : DD.input({ad: 'kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: `${G().kodUzunluk} haneli kod`, deger: d, hata: h, otomatik: 'one-time-code', pasif: ikiKilit()}));
  // Mod geçiş düğmesi (kod ↔ kurtarma); kilitliyken pasif.
  const ikiGec = (kurtarma, sms, ep) => (kurtarma
    ? DD.btn({metin: sms ? 'SMS koduyla gir' : 'Uygulama koduyla gir', ikon: sms ? 'comment-sms' : 'mobile-screen', tur: 'secondary', tam: true, pasif: ikiKilit(), yerine: `#/iki-adim?eposta=${enc(ep)}`})
    : DD.btn({metin: 'Kurtarma kodu kullan', ikon: 'key', tur: 'secondary', tam: true, pasif: ikiKilit(), yerine: `#/iki-adim?mod=kurtarma&eposta=${enc(ep)}`}));
  const ikiAdim = ctx => {
    const kurtarma = ctx.sorgu.mod === 'kurtarma', sms = guvenlik().yontem !== 'uygulama', n = G().kodUzunluk, tel = telMaske(telefon()), ep = ctx.sorgu.eposta || '';
    const metin = kurtarma
      ? 'Telefonuna erişemiyorsan iki adımlı doğrulamayı kurarken kaydettiğin **kurtarma kodlarından** birini yaz. Her kod bir kez kullanılır.'
      : sms ? `${tel ? `**${tel}**` : 'Kayıtlı telefon'} numarasına gönderdiğimiz **${n} haneli kodu** yaz.` : `Doğrulayıcı uygulamanın ürettiği **${n} haneli kodu** yaz.`;
    // Kod modunda telefonun önerdiği kod (one-time-code) alana gelmiş olarak açılır; kurtarma kodu elle yazılır.
    const deger = ctx.taslak ?? (kurtarma ? '' : G().ikiAdimKod);
    return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: kurtarma ? 'Kurtarma koduyla gir' : 'İki adımlı doğrulama', metin})}<div class="dd-yigin-12"><div data-yuva="kod">${ikiAlan(kurtarma, deger, ctx.hata)}</div><div data-yuva="deneme">${ikiBant(kurtarma)}</div>${!kurtarma && sms ? '<div data-yuva="tekrar"></div>' : ''}</div><div class="dd-yigin-8"><div data-yuva="gec">${ikiGec(kurtarma, sms, ep)}</div>${DD.btn({metin: 'Farklı hesapla giriş yap', tur: 'text', tam: true, yerine: '#/giris'})}</div></div>`;
  };
  const ikiAdimBagla = (kok, ctx) => {
    const kurtarma = ctx.sorgu.mod === 'kurtarma', sms = guvenlik().yontem !== 'uygulama', n = G().kodUzunluk, kodlar = kurtarmaKodlari().map(rakam), kurUzun = kodlar[0].length;
    let sayacDur = () => {};
    // Kilit: alan ve mod geçişi pasif, yeniden gönder sayacı durur ve kalkar.
    const kilitle = () => {
      sayacDur(); sayacDur = () => {};
      const t = kok.querySelector('[data-yuva="tekrar"]'); if (t) t.innerHTML = '';
      kok.querySelector('[data-yuva="gec"]').innerHTML = ikiGec(kurtarma, sms, ctx.sorgu.eposta || '');
    };
    const hazirla = () => { const a = kok.querySelector('[name="kod"]'); if (a) a.maxLength = kurtarma ? kurtarmaKodlari()[0].length : n; };
    const alanCiz = (d, h) => { ctx.taslak = d; ctx.hata = h; kok.querySelector('[data-yuva="kod"]').innerHTML = ikiAlan(kurtarma, d, h); hazirla(); };
    hazirla();
    const c = [DD.eylem(kok, 'iki-dogrula', el => {
      if (ikiKilit()) return;
      const k = (kok.querySelector('[name="kod"]')?.value || '').trim(), r = rakam(k);
      const h = kurtarma
        ? (!k ? 'Kurtarma kodunu yaz' : /[^\d\s-]/.test(k) || r.length !== kurUzun ? `Kurtarma kodu ${kurUzun} rakamdan oluşur` : '')
        : (!k ? 'Kodu yaz' : /[^\d\s]/.test(k) ? 'Kod yalnız rakamdan oluşur' : r.length !== n ? `Kod ${n} haneli olmalı` : '');
      if (h) { alanCiz(k, h); return; }
      if (ctx.hata) alanCiz(k, '');
      if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
      // Kurtarma kodu tek kullanımlık: kullanılanlar hesap-ayar.guvenlik.kullanilan'da (rakamları); kalan hak 0 iken hiçbir kod geçmez.
      const g = guvenlik(), kullanilan = g.kullanilan || [], kalanHak = g.kurtarmaKalan ?? kodlar.length;
      DD.mesgul(el, bekle(2)).then(() => {
        if (kurtarma ? kodlar.includes(r) && !kullanilan.includes(r) && kalanHak > 0 : r === G().ikiAdimKod) {
          ikiDeneme = 0;
          if (!kurtarma) { oturumAc(); return; }
          const kalan = kalanHak - 1;
          ayarYaz('guvenlik', {kurtarmaKalan: kalan, kullanilan: [...kullanilan, r]});
          oturumAc(`Giriş yaptın; **${kalan} kurtarma kodun** kaldı`);
          return;
        }
        ikiDeneme += 1;
        alanCiz('', kurtarma ? 'Kurtarma kodu geçersiz ya da daha önce kullanılmış' : 'Kod hatalı ya da süresi dolmuş');
        kok.querySelector('[data-yuva="deneme"]').innerHTML = ikiBant(kurtarma);
        if (ikiKilit()) { el.disabled = true; kilitle(); }
        DD.titres(20);
      });
    })];
    const tel = telMaske(telefon());
    if (!kurtarma && sms && !ikiKilit()) sayacDur = sayac(kok, () => DD.toast(`Yeni kod **${tel || 'telefonuna'}** gönderildi`, {ikon: 'comment-sms'}));
    c.push(() => sayacDur());
    return c;
  };

  // ---------- Şifre sıfırlama ----------
  const sureDoldu = ctx => ctx.sorgu.adim === 'yeni' && ctx.sorgu.hal === 'sure-doldu';
  const sifirla = ctx => {
    const a = ctx.sorgu.adim, ep = ctx.sorgu.eposta || '';
    if (sureDoldu(ctx)) return `<div class="dd-ic dd-yigin-24">${DD.bos({ikon: 'link-slash', baslik: 'Bağlantının süresi dolmuş', metin: `Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. ${ep ? `**${ep}** adresine` : 'E-posta adresine'} yeni bir bağlantı gönderelim; gelen son bağlantıyı aç.`})}${DD.btn({metin: 'Yeni bağlantı gönder', ikon: 'gonder', tam: true, veri: {eylem: 'yeni-baglanti'}})}</div>`;
    if (a === 'gonderildi') return `<div class="dd-ic dd-yigin-24">${DD.bos({ikon: 'envelope-circle-check', baslik: 'Bağlantı gönderildi', metin: `**${ep}** kayıtlıysa birkaç dakika içinde sıfırlama bağlantısı gelir. Gelen kutunu ve spam klasörünü kontrol et.`})}<div class="dd-yigin-8">${DD.btn({metin: 'Bağlantıyı açtım', ikon: 'link', tam: true, yerine: `#/sifre-sifirla?adim=yeni&eposta=${enc(ep)}`})}<div data-yuva="tekrar"></div></div></div>`;
    if (a === 'yeni') return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'Yeni şifreni belirle', metin: `**${ep || 'Hesabın'}** için yeni bir şifre seç. Başka sitede kullandığın şifreyi tekrar etme.`})}<div data-yuva="form">${yeniForm(ctx.taslak || {}, ctx.hatalar)}</div></div>`;
    return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'Şifreni sıfırla', metin: 'E-posta adresini yaz, **sıfırlama bağlantısını** gönderelim.'})}<div data-yuva="form">${DD.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@posta.com', deger: ctx.taslak?.eposta ?? ep, hata: ctx.hatalar?.eposta, otomatik: 'email'})}</div></div>`;
  };
  const yeniForm = (d, h = {}) => `<div class="dd-yigin">${DD.input({ad: 'yeni', etiket: 'Yeni şifre', ikon: 'key', tur: 'password', deger: d.yeni, hata: h.yeni, otomatik: 'new-password', yardim: G().sifreKurali})}${DD.input({ad: 'tekrar', etiket: 'Yeni şifre (tekrar)', ikon: 'key', tur: 'password', deger: d.tekrar, hata: h.tekrar, otomatik: 'new-password'})}</div>`;
  // Şifre kuralı (DDV.hesap.giris.sifreKurallari): karşılanmayan kuralların adları; hata cümlesi "a, b ve c" diye sayar.
  const sifreEksik = s => G().sifreKurallari.filter(k => !new RegExp(k.desen).test(s)).map(k => k.ad);
  const veIle = l => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ve ${l[l.length - 1]}` : l[0] || '');
  const sifirlaBar = ctx => {
    const a = ctx.sorgu.adim;
    if (a === 'gonderildi' || sureDoldu(ctx)) return DD.altEylem({dugmeler: [{metin: 'Giriş ekranına dön', tur: 'text', tam: true, yerine: `#/giris?eposta=${enc(ctx.sorgu.eposta || '')}`}]});
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
      DD.eylem(kok, 'yeni-baglanti', el => {
        const ep = ctx.sorgu.eposta || '';
        if (!EPOSTA.test(ep)) { DD.yerine('#/sifre-sifirla'); return; }
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => DD.yerine(`#/sifre-sifirla?adim=gonderildi&eposta=${enc(ep)}`));
      }),
      DD.eylem(kok, 'sifre-kaydet', el => {
        const d = {yeni: v('yeni'), tekrar: v('tekrar')}, eksik = sifreEksik(d.yeni);
        const h = {yeni: !d.yeni ? 'Yeni şifreni yaz' : eksik.length ? `Şifrende eksik: ${veIle(eksik)}` : '', tekrar: !d.tekrar && d.yeni ? 'Yeni şifreni tekrar yaz' : d.yeni === d.tekrar ? '' : 'Şifreler birbiriyle aynı değil'};
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

  // Yeniden gönder: süre dolana dek pasif, sonra etkin metin düğmesi. hazir: sayaçsız, hemen etkin açılır. Dönen işlev aralığı durdurur.
  const sayac = (kok, gonder, hazir = false) => {
    const y = kok.querySelector('[data-yuva="tekrar"]');
    if (!y) return () => {};
    let kalan = G().yenidenGonderSn, t = null;
    const ciz = () => { y.innerHTML = kalan > 0 ? DD.btn({metin: `${kalan} sn sonra yeniden gönder`, tur: 'text', tam: true, pasif: true}) : DD.btn({metin: 'Yeniden gönder', ikon: 'rotate-right', tur: 'text', tam: true, veri: {eylem: 'tekrar-gonder'}}); };
    const basla = () => { kalan = G().yenidenGonderSn; ciz(); clearInterval(t); t = setInterval(() => { kalan -= 1; ciz(); if (kalan <= 0) clearInterval(t); }, 1000); };
    const e = DD.eylem(kok, 'tekrar-gonder', () => { gonder(); basla(); });
    if (hazir) { kalan = 0; ciz(); } else basla();
    return () => { clearInterval(t); e(); };
  };

  // ---------- E-posta doğrulama ----------
  const dogrulaEposta = ctx => ctx.sorgu.eposta || tum().profil?.epostaBekleyen || (DD.yeniHesap() ? '' : DDV.kullanici.eposta);
  const kodAlan = (d = '', h = '') => DD.input({ad: 'kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: `${G().kodUzunluk} haneli kod`, deger: d, hata: h, otomatik: 'one-time-code'});
  const gecersizBant = () => DD.bant({ton: 'hata', baslik: 'Kod geçersiz ya da süresi dolmuş', metin: 'Bu kod artık kullanılamıyor. **Yeniden gönder** ile yeni kod iste ve gelen kutuna düşen son kodu yaz.'});
  const dogrula = ctx => {
    const ep = dogrulaEposta(ctx);
    if (ctx.sorgu.hal === 'zaten') return `<div class="dd-ic">${DD.bos({ikon: 'envelope-circle-check', baslik: 'Bu adres zaten doğrulanmış', metin: `${ep ? `**${ep}**` : 'E-posta adresin'} daha önce doğrulandı. Yeniden kod girmene gerek yok.`})}</div>`;
    if (ctx.gecersiz === undefined) ctx.gecersiz = ctx.sorgu.hal === 'gecersiz';
    return `<div class="dd-ic dd-yigin-24">${DD.metinBlok({baslik: 'E-postanı doğrula', metin: ep ? `**${ep}** adresine ${G().kodUzunluk} haneli bir kod gönderdik. Birkaç dakika içinde gelmezse spam klasörüne bak.` : `E-posta adresine gelen **${G().kodUzunluk} haneli kodu** yaz.`})}<div class="dd-yigin-12"><div data-yuva="uyari">${ctx.gecersiz ? gecersizBant() : ''}</div><div data-yuva="kod">${kodAlan(ctx.taslak, ctx.hata)}</div><div data-yuva="tekrar"></div></div>${DD.btn({metin: 'Yanlış adres mi yazdın?', tur: 'text', tam: true, geri: true})}</div>`;
  };
  // Doğrulama sonrası: bekleyen adres profil e-postası olur; ?sonra, üye geri, misafir onboarding.
  const dogrulaDevam = (ctx, ep, mesaj) => {
    const p = tum().profil || {};
    if (ep && p.epostaBekleyen === ep) ayarYaz('profil', {eposta: ep, epostaBekleyen: null});
    if (mesaj) DD.toast(mesaj, {tur: 'basari'});
    if (ctx.sorgu.sonra) DD.yerine(ctx.sorgu.sonra);
    else if (DD.uye()) DD.geri();
    else { DD.durum.yaz('onboarding', {...DD.durum.oku('onboarding', {}), giris: 'eposta'}); DD.yerine('#/onboarding/hedef'); }
  };
  const dogrulaBagla = (kok, ctx) => {
    const ep = dogrulaEposta(ctx), n = G().kodUzunluk;
    if (ctx.sorgu.hal === 'zaten') return [DD.eylem(kok, 'dogrula-devam', () => dogrulaDevam(ctx, ep))];
    const hazirla = () => { const a = kok.querySelector('[name="kod"]'); if (a) a.maxLength = n; };
    const alanCiz = (k, h) => { ctx.taslak = k; ctx.hata = h; kok.querySelector('[data-yuva="kod"]').innerHTML = kodAlan(k, h); hazirla(); };
    hazirla();
    return [
      // ?hal=gecersiz: yeniden gönder hemen açıktır; yeni kod gelince uyarı kalkar ve kod kabul edilir.
      sayac(kok, () => {
        DD.toast(`Yeni kod **${ep || 'e-posta adresine'}** gönderildi`, {ikon: 'envelope'});
        if (!ctx.gecersiz) return;
        ctx.gecersiz = false;
        kok.querySelector('[data-yuva="uyari"]').innerHTML = '';
        alanCiz('', '');
      }, ctx.gecersiz),
      DD.eylem(kok, 'kod-dogrula', el => {
        const k = (kok.querySelector('[name="kod"]')?.value || '').replace(/\s/g, '');
        const h = !k ? 'Kodu yaz' : !/^\d+$/.test(k) ? 'Kod yalnız rakamdan oluşur' : k.length !== n ? `Kod ${n} haneli olmalı` : '';
        if (h) { alanCiz(k, h); return; }
        if (baglantiYok(ctx)) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, bekle(2)).then(() => {
          if (ctx.gecersiz) { alanCiz('', 'Kod geçersiz ya da süresi dolmuş; Yeniden gönder ile yeni kod iste'); DD.titres(20); return; }
          dogrulaDevam(ctx, ep, 'E-postan **doğrulandı**');
        });
      })
    ];
  };

  // ---------- Ekran ----------
  const BASLIK = {'#/giris': 'Giriş yap', '#/iki-adim': 'İki adımlı doğrulama', '#/sifre-sifirla': 'Şifreni sıfırla', '#/eposta-dogrula': 'E-posta doğrulama'};
  DD.ekran('giris', {
    cevrimici: true,   // ağ gerekir: çevrimdışında bağlantı hatası (önbellek yok)
    tur: 'alt',
    tabagim: false,
    get ust() { return location.hash.startsWith('#/eposta-dogrula') ? (DD.uye() ? '#/ayarlar/profil' : '#/karsilama') : location.hash.startsWith('#/sifre-sifirla') || location.hash.startsWith('#/iki-adim') ? '#/giris' : '#/karsilama'; },
    baslik: ctx => BASLIK[yol(ctx)] || 'Giriş yap',
    ustBar: ctx => ({menu: false, saydam: yol(ctx) === '#/giris'}),
    ciz: ctx => ({'#/iki-adim': ikiAdim, '#/sifre-sifirla': sifirla, '#/eposta-dogrula': dogrula}[yol(ctx)] || giris)(ctx),
    altBar: ctx => {
      const y = yol(ctx);
      if (y === '#/sifre-sifirla') return sifirlaBar(ctx);
      if (y === '#/iki-adim') return DD.altEylem({dugmeler: [{metin: 'Doğrula', ikon: 'onay', tam: true, pasif: ikiKilit(), veri: {eylem: 'iki-dogrula'}}]});
      if (y === '#/eposta-dogrula') return DD.altEylem({dugmeler: [ctx.sorgu.hal === 'zaten' ? {metin: 'Devam et', ikon: 'arrow-right', tam: true, veri: {eylem: 'dogrula-devam'}} : {metin: 'Doğrula', ikon: 'onay', tam: true, veri: {eylem: 'kod-dogrula'}}]});
      // Birincil eylem sabit çubukta: dar ekranda (390x844) form uzun, kaydırma alanındaki düğme çubuğun arkasında kalıyordu.
      return DD.altEylem({dugmeler: [{metin: 'Giriş yap', ikon: 'right-to-bracket', tam: true, pasif: kilit(ctx), veri: {eylem: 'giris'}}]});
    },
    sonra: (kok, ctx) => {
      const y = yol(ctx), c = ({'#/iki-adim': ikiAdimBagla, '#/sifre-sifirla': sifirlaBagla, '#/eposta-dogrula': dogrulaBagla}[y] || girisBagla)(kok, ctx);
      const tus = ev => { if (ev.key === 'Enter' && ev.target.matches?.('input')) { ev.preventDefault(); kok.querySelector('[data-eylem="giris"],[data-eylem="gonder"],[data-eylem="sifre-kaydet"],[data-eylem="kod-dogrula"],[data-eylem="iki-dogrula"]')?.click(); } };
      kok.addEventListener('keydown', tus);
      return () => { c.forEach(f => f?.()); kok.removeEventListener('keydown', tus); };
    }
  });
})();
