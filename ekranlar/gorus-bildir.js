/* Görüş Bildir: #/gorus-bildir (misafire açık).
 * Gastro kalıbı: ortak/sayfalar/ayarlar.js DG.sayfa('gorus-bildir') (S6) ve uygulama/gorus-bildir.html: konu kartları → konuya göre alanlar → KVKK onayı → "Görüşün bize ulaştı".
 * İçerik: web _src/kabuk/canli-ogeler.mjs gorusBildir (konular, ilgili alanlar, seçenekler, başarı metni). Veri DDV.uye.gorus.
 * Sorgu: ?konu=oneri|soru|teknik|ihlal|puan (ön seçim; varsayılan oneri). Ekrana özgü haller: ?hal=form-hata (zorunlu alan + geçersiz e-posta),
 *   ?hal=gonderiliyor (Gönder düğmesi meşgul), ?hal=tamam (gönderildi; &eposta=1 e-posta bırakıldıysa dönüş cümlesi). Gönderim DD.mesgul ile bekler, DD.durum 'gorus-gonderimleri' dizisine yazılır,
 *   sonra ?hal=tamam'a geçer. Üye ise e-posta alanı hesap adresiyle dolu gelir. */
(() => {
  const G = () => DDV.uye.gorus;
  const EPOSTA = /^[^@\s]+@[^@\s]+\.[^@\s]+$/, BAGLANTI = /^https?:\/\/\S+\.\S+/;
  // Konuya göre alanlar (web gorusBildir data-for panelleri). ek: secAlan listesi ve etiketi.
  const SPEC = {
    oneri: {alan: true, mesaj: 'Önerini anlat', mesajYer: 'Neyi geliştirelim, ne iyi çalışıyor?', mesajZ: true, epostaZ: false},
    soru: {ek: ['soruKonulari', 'Sorunun konusu'], mesaj: 'Sorunu yaz', mesajYer: 'Merak ettiğin şeyi birkaç cümleyle yaz', mesajZ: true, epostaZ: true},
    teknik: {ek: ['teknikYerler', 'Sorunu nerede yaşadın?'], mesaj: 'Sorunu kısaca anlat', mesajYer: 'Ne yaptın, ne oldu?', mesajZ: true, epostaZ: false},
    ihlal: {link: true, ek: ['ihlalTurleri', 'İhlal türü'], mesaj: 'Açıklama', mesajYer: 'İhlali kısaca anlat', mesajZ: true, epostaZ: true},
    puan: {puan: true, mesaj: 'Eklemek istediğin bir şey var mı?', mesajYer: 'İsteğe bağlı', mesajZ: false, epostaZ: false}
  };
  const konuAl = k => (SPEC[k] ? k : 'oneri');
  // Üye e-postası: Ayarlar'da değiştirildiyse o, yoksa hesap verisi (ayarlar.js kisi() ile aynı sıra).
  const uyeEposta = () => {
    if (!DD.uye()) return '';
    const p = DD.durum.oku('hesap-ayar', {}).profil || {}, plan = DD.durum.oku('plan', null) || {};
    return p.eposta ?? plan.eposta ?? (DD.yeniHesap() ? '' : DDV.kullanici.eposta) ?? '';
  };
  const bosTaslak = k => ({konu: konuAl(k), alan: G().alanlar[0], ek: '', link: '', mesaj: '', eposta: uyeEposta(), puan: 0, kvkk: false});

  const dogrula = t => {
    const s = SPEC[t.konu], h = {}, ep = t.eposta.trim();
    if (s.ek && !t.ek) h.ek = 'Bir seçenek seç.';
    if (s.link) h.link = !t.link.trim() ? 'İhlal içeren sayfanın bağlantısını yaz.' : BAGLANTI.test(t.link.trim()) ? '' : 'Geçerli bir bağlantı yaz (https:// ile).';
    if (s.puan && !t.puan) h.puan = 'Bir puan seç.';
    if (s.mesajZ && !t.mesaj.trim()) h.mesaj = 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.';
    if (s.epostaZ && !ep) h.eposta = 'E‑posta adresini yaz; cevabı bu adrese göndeririz.';
    else if (ep && !EPOSTA.test(ep)) h.eposta = 'Geçerli bir e‑posta adresi yaz (ad@site.com).';
    if (!t.kvkk) h.kvkk = 'Göndermek için onay kutusunu işaretle.';
    Object.keys(h).forEach(k => { if (!h[k]) delete h[k]; });
    return h;
  };

  const panelHtml = (t, h) => {
    const s = SPEC[t.konu], uye = !!uyeEposta() && t.eposta.trim() === uyeEposta();
    const ek = s.ek ? DD.secAlan({ad: 'gb-ek', etiket: s.ek[1], zorunlu: true, secenekler: G()[s.ek[0]].map(x => [x, x]), deger: t.ek, yer: 'Seç', hata: h.ek}) : '';
    const alan = s.alan ? DD.alan({etiket: 'İlgili alan', html: DD.cipler({ad: 'gb-alan', tur: 'tek', etiket: 'İlgili alan', secili: t.alan, ogeler: G().alanlar.map(a => ({metin: a, deger: a, kucuk: true}))})}) : '';
    const link = s.link ? DD.input({ad: 'gb-link', etiket: 'İhlal içeren sayfanın bağlantısı', tur: 'url', mod: 'url', yer: 'https://', deger: t.link, hata: h.link, zorunlu: true}) : '';
    const puan = s.puan ? DD.alan({etiket: 'Dada Diet deneyimini nasıl puanlarsın?', zorunlu: true, hata: h.puan, html: DD.puan({ad: 'gb-puan', deger: t.puan, etiket: 'Dada Diet deneyimini nasıl puanlarsın?'})}) : '';
    const mesaj = DD.input({ad: 'gb-mesaj', etiket: s.mesaj, yer: s.mesajYer, deger: t.mesaj, cokSatir: true, zorunlu: s.mesajZ, hata: h.mesaj});
    const eposta = DD.input({ad: 'gb-eposta', etiket: s.epostaZ ? (t.konu === 'soru' ? 'E‑posta adresin (cevap için)' : 'E‑posta adresin') : 'E‑posta adresin (isteğe bağlı)', ikon: 'envelope', tur: 'email', mod: 'email', otomatik: 'email', yer: 'ad@site.com', deger: t.eposta, zorunlu: s.epostaZ, hata: h.eposta, yardim: h.eposta ? '' : uye ? 'Hesabındaki adres; istersen değiştirebilirsin.' : s.epostaZ ? 'Cevabı bu adrese göndeririz.' : 'Bırakırsan gerektiğinde bu adresten döneriz.'});
    const dosya = t.konu === 'teknik' ? DD.dosyaAlan({ad: 'gb-dosya', etiket: 'Ekran görüntüsü', metin: 'Ekran görüntüsü ekle', ikon: 'image', kabul: 'image/jpeg,image/png,image/webp'}) : '';
    return `<div class="dd-yigin">${alan}${link}${ek}${puan}${mesaj}${dosya}${eposta}</div>`;
  };
  const kvkkHtml = (t, h) => DD.alan({etiket: 'Kişisel veriler', zorunlu: true, hata: h.kvkk, html: `<div class="dd-yigin-8">${DD.checkbox({ad: 'gb-kvkk', etiket: 'Aydınlatma Metni’ni ve KVKK Metni’ni okudum, onaylıyorum.', secili: t.kvkk})}${DD.btn({metin: 'Aydınlatma Metni’ni oku', ikon: 'file-lines', tur: 'text', boyut: 'sm', git: '#/yasal/kvkk'})}</div>`});
  const formHtml = (t, h, mesgul) => DD.gruplar([
    {baslik: 'Konu seç', html: DD.secimler({ad: 'gb-konu', duzen: ['uc', 'orta'], secili: t.konu, ogeler: G().konular.map(x => ({k: x.k, ad: x.ad, ikon: x.ikon}))})},
    {baslik: G().konular.find(x => x.k === t.konu).ad, html: `<div data-yuva="gb-panel">${panelHtml(t, h)}</div>`},
    {html: `<div class="dd-yigin">${kvkkHtml(t, h)}${DD.btn({metin: 'Gönder', ikon: 'gonder', tam: true, yukleniyor: mesgul, veri: {eylem: 'gorus-gonder'}})}</div>`}
  ], {bas: DD.p('Önerin, şikâyetin ya da sorun: **hepsine kulak veriyoruz**.', {ton: 'ikincil'})});

  // Gastro gorus-bildir 'tamam' metni; e-posta bırakıldıysa (?eposta=1) dönüş cümlesi eklenir.
  const tamamHtml = ctx => DD.durumSahne({
    isaret: 'circle-check', baslik: 'Görüşün bize ulaştı',
    metin: `Yazdıkların **kaydedildi**. Ekibimiz okuyacak${ctx.sorgu.eposta ? '; bir e‑posta adresi bıraktığın için gerektiğinde oradan döneriz' : ''}.`,
    ana: {metin: 'Forma dön', ikon: 'comment-dots', yerine: '#/gorus-bildir'},
    ikinciller: [{metin: 'Bugün’e dön', ikon: 'house', yerine: '#/bugun'}]
  });

  DD.ekran('gorus-bildir', {
    tur: 'alt',
    baslik: 'Görüş Bildir',
    ciz: ctx => {
      const hal = ctx.sorgu.hal;
      if (hal === 'tamam') return tamamHtml(ctx);
      if (!ctx.t) {
        ctx.t = bosTaslak(ctx.sorgu.konu);
        ctx.h = {};
        if (hal === 'form-hata') { if (ctx.t.eposta) ctx.t.eposta = ctx.t.eposta.replace(/\.[^.]+$/, ''); else ctx.t.eposta = 'ad@site'; ctx.h = dogrula(ctx.t); }
      }
      return `<form data-gorus-form novalidate>${formHtml(ctx.t, ctx.h, hal === 'gonderiliyor')}</form>`;
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.hal === 'tamam') return undefined;
      const f = kok.querySelector('[data-gorus-form]');
      // Formdaki değerleri taslağa alır (konu değişince ve gönderimde).
      const oku = () => {
        const t = ctx.t, v = ad => f.querySelector(`[name="${ad}"]`);
        if (v('gb-mesaj')) t.mesaj = v('gb-mesaj').value;
        if (v('gb-eposta')) t.eposta = v('gb-eposta').value;
        if (v('gb-link')) t.link = v('gb-link').value;
        if (v('gb-ek')) t.ek = v('gb-ek').value;
        const p = f.querySelector('[name="gb-puan"]:checked'); if (p) t.puan = +p.value;
        t.kvkk = !!f.querySelector('[name="gb-kvkk"]')?.checked;
      };
      const ciz = () => { f.innerHTML = formHtml(ctx.t, ctx.h, false); };
      // Gastro alanHata: alan düzeltilince hatası kalkar.
      const hataKaldir = el => { const a = el?.closest('.dd-alan.is-hata'); if (a) { a.classList.remove('is-hata'); a.querySelector(':scope > .dd-hata')?.remove(); a.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); } };
      // Hesap adresi yardımı yalnız alan hesap adresini taşırken görünür.
      const girdi = ev => { hataKaldir(ev.target); if (ev.target.name === 'gb-eposta' && uyeEposta()) { const y = ev.target.closest('.dd-alan')?.querySelector(':scope > .dd-yardim'); if (y) y.hidden = ev.target.value.trim() !== uyeEposta(); } };
      const submit = ev => { ev.preventDefault(); f.querySelector('[data-eylem="gorus-gonder"]')?.click(); };
      f.addEventListener('input', girdi);
      f.addEventListener('change', girdi);
      f.addEventListener('submit', submit);
      const c = [
        () => { f.removeEventListener('input', girdi); f.removeEventListener('change', girdi); f.removeEventListener('submit', submit); },
        DD.on(kok, 'gb-konu', v => { if (!v || v === ctx.t.konu) return; oku(); ctx.t.konu = konuAl(v); ctx.t.ek = ''; ctx.h = {}; ciz(); }),
        DD.on(kok, 'gb-alan', v => { if (v) ctx.t.alan = v; }),
        DD.on(kok, 'gb-ek', (v, _d, ev) => { ctx.t.ek = v; hataKaldir(ev.target); }),
        DD.eylem(kok, 'gorus-gonder', el => {
          oku();
          ctx.h = dogrula(ctx.t);
          if (Object.keys(ctx.h).length) {
            ciz();
            const a = f.querySelector('.dd-alan.is-hata');
            if (a) { const k = kok.querySelector('.dd-kaydir'); k?.scrollTo({top: Math.max(0, a.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - k.clientHeight / 3), behavior: DD.azHareket() ? 'auto' : 'smooth'}); a.querySelector('input:not([type=hidden]),textarea,button')?.focus({preventScroll: true}); }
            DD.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true});
            return;
          }
          const t = ctx.t, s = SPEC[t.konu];
          DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 2).then(() => {
            const kayit = {id: `G-${Date.now().toString(36).toUpperCase()}`, konu: t.konu, tarih: DD.bugunIso(), saat: DD.ogun.noktali(DDV.bugun.simdi), uye: DD.uye(), mesaj: t.mesaj.trim(), eposta: t.eposta.trim() || null,
              ...(s.alan ? {alan: t.alan} : {}), ...(s.ek ? {ek: t.ek} : {}), ...(s.link ? {link: t.link.trim()} : {}), ...(s.puan ? {puan: t.puan} : {})};
            DD.durum.yaz('gorus-gonderimleri', [kayit, ...DD.durum.oku('gorus-gonderimleri', [])]);
            ctx.t = null;
            DD.yerine(`#/gorus-bildir?hal=tamam${kayit.eposta ? '&eposta=1' : ''}`);
          });
        })
      ];
      return () => c.forEach(x => x());
    }
  });
})();
