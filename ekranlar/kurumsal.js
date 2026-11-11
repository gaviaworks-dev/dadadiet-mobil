/* Kurumsal sayfalar (tek ekran, sayfa ctx.hash'ten): #/hakkimizda, #/iletisim, #/kunye, #/sss; Paket 1b: #/bilimsel-kaynaklar, #/editoryal-kurul,
 * #/nasil-calisir, #/saglik-bilgilendirmesi, #/uzmanla-calisma, #/diyetisyen-ol. Gastro kalıbı ortak/sayfalar/yasal.js Y3–Y6 (uygulama/hakkimizda.html, iletisim.html, kunye.html).
 * Veri DDV.kurumsal (veri/yasal.js, web sayfa/* ve diyetisyen-ol/ sayfalarından; metin değiştirilmez).
 * İletişim: web formunun alanları (ad, soyad, e-posta, telefon, konu, mesaj, KVKK onayı). ?konu=oneri|soru|teknik|ihlal konuyu seçer, ?talep=veri-silme mesaja
 *   veri silme şablonunu yazar (Gastro iletisim), ?hal=form-hata form hatası (eski ad hata-form da kabul edilir), ?hal=tamam gönderildi hali. Gönderim bu cihazda kalır; çevrimdışıysa gönderilmez.
 * SSS: web sayfa/sss soruları, akordiyon + arama (?q=), sonuç yok hali.
 * Künye ve Bilimsel Kaynaklar: yasal metin şablonu (içindekiler, bölümler akordiyonda; ?bolum=N o bölümü açar).
 * Editoryal Kurul, Nasıl Çalışır?, Sağlık Bilgilendirmesi, Uzmanla Çalışma Rehberi: başlık, giriş, bölümler, listeler; web kartlarındaki bağlantılar uygulama adresine.
 * Diyetisyen Ol: web başvuru formu (dört bölüm, tamamlanma ölçeri, en çok 5 uzmanlık alanı, dosya adı listelenir, taslak bu cihazda: e-posta, telefon, diploma no hariç).
 *   ?hal=form-hata form hatası (eksik alanlar özeti; eski ad hata-form da kabul edilir), ?hal=tamam gönderildi hali (Başvurun Alındı, süreç). Gönderim DD.durum 'diyetisyen-basvuru'ya yazılır;
 *   taslak 'diyetisyen-basvuru-taslak'. Başvuru alınmışsa formun başında durum bandı çıkar. Çevrimdışıysa gönderilmez. */
(() => {
  const K = () => DDV.kurumsal;
  const esc = s => DD.esc(s);
  // Form hatası hali tüm ekranlarda ?hal=form-hata; eski bağlantılar için hata-form da kabul edilir.
  const formHata = ctx => ['form-hata', 'hata-form'].includes(ctx.sorgu.hal);
  const sayfa = ctx => (ctx.hash || '').split('?')[0].replace(/^#\//, '');
  const BASLIK = {hakkimizda: 'Hakkımızda', iletisim: 'İletişim', kunye: 'Künye', sss: 'Sıkça Sorulan Sorular', 'bilimsel-kaynaklar': 'Bilimsel Kaynaklar', 'editoryal-kurul': 'Editoryal Kurul', 'nasil-calisir': 'Nasıl Çalışır?', 'saglik-bilgilendirmesi': 'Sağlık Bilgilendirmesi', 'uzmanla-calisma': 'Uzmanla Çalışma Rehberi', 'diyetisyen-ol': 'Diyetisyen Ol'};

  // Metin çizici ortak: DD.yasalMetin (ekranlar/yasal.js; yer tutucu süzgeci, özet). Çizim anında okunur.
  const YM = () => DD.yasalMetin;
  const zengin = h => YM().zengin(h), duz = h => YM().duz(h), blokHtml = b => YM().blokHtml(b);
  // Canlı doğrulama (İletişim, Diyetisyen Ol): gönderimden sonra düzeltilen alanın hatası ve özetteki satırı kalkar; yeni hata gönderimde gelir.
  const alanBul = (yuva, k) => (k === 'telefon' ? yuva.querySelector('[data-telefon="telefon"]')
    : k === 'uzmanlik' ? yuva.querySelector('#e-uzmanlik')?.closest('.dd-alan')
    : k === 'gorusme' ? yuva.querySelector('[data-ad="gorusme"]')?.closest('.dd-alan')
    : k === 'riza' ? yuva.querySelector('[name="riza1"]')?.closest('.dd-alan')
    : k === 'diplomaDosya' || k === 'foto' ? yuva.querySelector(`[data-yuva="dosya-${k}"] .dd-alan`)
    : yuva.querySelector(`[name="${k}"]`)?.closest('.dd-alan'));
  const hatalariSuz = (yuva, hatalar, yeni, ozetHtml) => {
    Object.keys(hatalar).forEach(k => {
      if (yeni[k]) return;
      const a = alanBul(yuva, k);
      if (a) { a.classList.remove('is-hata'); a.querySelector('.dd-hata')?.remove(); a.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid')); }
      delete hatalar[k];
    });
    const oz = yuva.querySelector('[data-ozet]');
    if (oz) { if (Object.keys(hatalar).length) oz.innerHTML = ozetHtml(hatalar); else oz.remove(); }
  };
  const baslikBlok = (o, h = 2) => DD.metinBlok({etiket: o.etiket, baslik: o.baslik, metin: o.metin, rol: h === 1 ? 'page' : 'section', h});
  const sayfaBas = o => DD.metinBlok({etiket: o.etiket, baslik: o.h1 || o.baslik, metin: o.alt, h: 1});
  // İçeriği henüz olmayan kart (bekliyor: true) ekranda gösterilmez (11 Kasım: "bilgi bekleniyor" rozeti kaldırıldı).
  const kartSatir = k => ({ikon: k.ikon, baslik: k.baslik, alt: k.metin, git: k.git || undefined});
  const kartGrup = o => ({html: `<div class="dd-yigin">${baslikBlok(o)}${DD.satirlar(o.kartlar.filter(k => !k.bekliyor).map(kartSatir))}</div>`});
  const adimSatir = (a, i) => ({ikon: a.ikon, baslik: `${i + 1}. ${a.baslik}`, alt: a.metin});

  // ---------- Hakkımızda ----------
  const hakkimizda = () => {
    const H = K().hakkimizda;
    return DD.gruplar([
      {html: DD.stat(H.sayilar.map(([deger, etiket]) => ({deger, etiket})))},
      {html: `<div class="dd-yigin">${baslikBlok(H.giris)}${DD.makale(H.bloklar.map(blokHtml).join(''))}</div>`},
      {html: `<div class="dd-yigin-12">${DD.ipucu({ikon: 'certificate', baslik: H.kunye.baslik, metin: H.kunye.metin})}${DD.kunye(H.kunye.sayilar.map(([deger, etiket], i) => ({ikon: ['list-check', 'calculator'][i] || 'circle-info', etiket, deger})))}</div>`},
      {html: `<div class="dd-yigin">${baslikBlok(H.araclar)}${DD.parcali(H.araclar.kartlar, {aria: H.araclar.baslik})}</div>`},
      {html: `<div class="dd-yigin">${baslikBlok(H.pusula)}${DD.satirlar(H.pusula.kartlar.map(k => ({ikon: k.ikon, baslik: k.baslik, alt: k.metin})))}</div>`},
      {html: `<div class="dd-yigin">${baslikBlok(H.dayanak)}${DD.satirlar(H.dayanak.kartlar.map(k => ({ikon: k.ikon, baslik: k.baslik, alt: k.metin})))}${H.dayanak.baglantilar ? DD.satirlar(H.dayanak.baglantilar.map(kartSatir)) : ''}</div>`},
      {html: `<div class="dd-yigin">${baslikBlok(H.alanlar)}${DD.satirlar(H.alanlar.kartlar.map(kartSatir))}</div>`},
      {html: DD.ipucu({ton: 'bilgi', ikon: 'bilgi', baslik: H.not.baslik, html: zengin(H.not.metin), eylem: H.not.eylem})},
      {baslik: 'Yasal ve iletişim', satirlar: [
        {ikon: 'scale-balanced', baslik: 'Yasal Metinler', alt: `${Object.keys(DDV.yasal.metinler).length} metin`, git: '#/yasal'},
        {ikon: 'id-card', baslik: 'Künye', git: '#/kunye'},
        {ikon: 'envelope', baslik: 'İletişim', git: '#/iletisim'},
        {ikon: 'circle-question', baslik: 'Sıkça Sorulan Sorular', git: '#/sss'}]}
    ], {bas: DD.metinBlok({etiket: H.etiket, baslik: H.baslik, metin: H.alt, h: 1})});
  };

  // ---------- İletişim ----------
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const VERI_SILME = 'Veri silme talebi\nDada Diet hesabımdaki e-posta:\nSilinmesini istediğim veriler:';
  const konuVar = k => K().iletisim.form.konular.some(([v]) => v === k);
  const dogrula = d => {
    const A = K().iletisim.form.alanlar, h = {};
    if (!d.ad) h.ad = A.ad.hata;
    if (!d.soyad) h.soyad = A.soyad.hata;
    if (!EPOSTA.test(d.eposta || '')) h.eposta = A.eposta.hata;
    if (!konuVar(d.konu)) h.konu = A.konu.hata;
    if (!d.mesaj) h.mesaj = A.mesaj.hata;
    if (!d.onay) h.onay = 'Göndermek için onay kutusunu işaretle.';
    return h;
  };
  const iletisimOzet = h => DD.bant({ton: 'hata', baslik: 'Mesaj gönderilemedi', metin: `Aşağıdaki **${Object.keys(h).length} alanı** kontrol et.`});
  const formHtml = (d = {}, h = {}) => {
    const F = K().iletisim.form, A = F.alanlar, n = Object.keys(h).length;
    return `<div class="dd-yigin">
      ${n ? `<div data-ozet tabindex="-1">${iletisimOzet(h)}</div>` : ''}
      ${DD.input({ad: 'ad', etiket: A.ad.etiket, zorunlu: true, deger: d.ad, hata: h.ad, otomatik: 'given-name'})}
      ${DD.input({ad: 'soyad', etiket: A.soyad.etiket, zorunlu: true, deger: d.soyad, hata: h.soyad, otomatik: 'family-name'})}
      ${DD.input({ad: 'eposta', etiket: A.eposta.etiket, zorunlu: true, tur: 'email', mod: 'email', ikon: 'envelope', yer: 'ad@site.com', deger: d.eposta, hata: h.eposta, otomatik: 'email'})}
      ${DD.telefon({ad: 'telefon', etiket: A.telefon.etiket, opsiyonel: true, deger: d.telefon, yardim: A.telefon.yardim})}
      ${DD.secAlan({ad: 'konu', etiket: `${A.konu.etiket} *`, secenekler: F.konular, deger: d.konu || '', yer: A.konu.yer, hata: h.konu, yardim: h.konu ? '' : A.konu.yardim})}
      ${DD.input({ad: 'mesaj', etiket: A.mesaj.etiket, zorunlu: true, cokSatir: true, deger: d.mesaj, hata: h.mesaj})}
      ${DD.alan({etiket: 'Onay', zorunlu: true, hata: h.onay, html: `<div class="dd-yigin-4">${DD.checkbox({ad: 'onay', etiket: F.onay, secili: d.onay})}${DD.btn({metin: 'KVKK Aydınlatma Metni’ni oku', tur: 'text', boyut: 'sm', ikon: 'file-lines', git: '#/yasal/kvkk'})}</div>`})}
      ${DD.p(F.not, {meta: true, ton: 'ikincil'})}
      ${DD.btn({metin: F.gonder, ikon: 'gonder', tam: true, veri: {eylem: 'iletisim-gonder'}})}
    </div>`;
  };
  const yolGrup = () => { const L = K().iletisim.yol; return {baslik: L.baslik, satirlar: L.adimlar.map(adimSatir)}; };
  const iletisim = ctx => {
    const L = K().iletisim, F = L.form;
    const bas = DD.metinBlok({etiket: L.etiket, baslik: L.baslik, metin: L.alt, h: 1});
    if (ctx.sorgu.hal === 'tamam') return DD.gruplar([{html: DD.bos({ikon: 'circle-check', baslik: 'Mesajın gönderildi', metin: F.tamam, eylem: {metin: 'Bugün’e dön', ikon: 'house', yerine: '#/bugun'}, ikincil: {metin: 'Yeni mesaj yaz', yerine: '#/iletisim'}})}, yolGrup()], {bas});
    const veriSilme = ctx.sorgu.talep === 'veri-silme';
    const ilk = ctx.taslak || (formHata(ctx)
      ? {soyad: DDV.kullanici?.soyad || '', eposta: 'zeynep@posta', telefon: ''}
      : {konu: veriSilme ? 'soru' : konuVar(ctx.sorgu.konu) ? ctx.sorgu.konu : '', mesaj: veriSilme ? VERI_SILME : ''});
    const hata = ctx.hatalar || (formHata(ctx) ? dogrula(ilk) : {});
    const kanal = L.kanallar.kartlar.map(k => ({ikon: k.ikon, baslik: k.baslik, alt: k.metin, ek: DD.rozet({metin: k.etiket, ton: 'notr'}), ...(k.hedef ? {veri: {eylem: 'forma-git'}} : {git: k.git})}));
    return DD.gruplar([
      {html: `<div class="dd-yigin" data-form>${baslikBlok({baslik: F.baslik, metin: F.metin})}<div data-yuva="form">${formHtml(ilk, hata)}</div></div>`},
      yolGrup(),
      {html: `<div class="dd-yigin">${baslikBlok(L.kanallar)}${DD.satirlar(kanal)}</div>`}
    ], {bas});
  };
  const formOku = kok => {
    const f = kok.querySelector('[data-yuva="form"]'), v = ad => (f.querySelector(`[name="${ad}"]`)?.value || '').trim();
    return {ad: v('ad'), soyad: v('soyad'), eposta: v('eposta'), telefon: v('telefon'), konu: v('konu'), mesaj: v('mesaj'), onay: !!f.querySelector('[name="onay"]')?.checked};
  };

  // ---------- SSS ----------
  const sorular = () => K().sss.kategoriler.flatMap(k => k.sorular.map(s => ({...s, kategori: k.ad})));
  const soruAko = l => DD.akordiyon(l.map(s => ({ikon: 'circle-question', baslik: s.soru, alt: s.altKat, icerik: DD.makale(`<p>${zengin(s.yanit)}</p>`)})), {acik: -1});
  const sssPanel = q => {
    if (!q) return K().sss.kategoriler.map(k => DD.bolum({ic: false, baslik: k.ad, html: soruAko(k.sorular)})).join('');
    const a = DD.katla(q), l = sorular().filter(s => DD.katla(`${s.soru} ${duz(s.yanit)}`).includes(a));
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da **sorunu bize yaz**.', eylem: {metin: 'İletişime geç', ikon: 'envelope', tur: 'secondary', git: '#/iletisim?konu=soru'}});
    return `<div class="dd-yigin-12">${DD.p(`**“${q}”** için ${l.length} soru bulundu.`, {meta: true, ton: 'ikincil'})}${soruAko(l.map(s => ({...s, altKat: s.kategori})))}</div>`;
  };
  const sss = ctx => {
    const S = K().sss, n = sorular().length, q = (ctx.sorgu.q || '').trim();
    return DD.gruplar([
      {html: DD.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', deger: q, sonuc: false})},
      `<div data-yuva="sss" aria-live="polite">${sssPanel(q)}</div>`,
      {html: DD.ipucu({ikon: S.kapanis.ikon, baslik: S.kapanis.baslik, metin: S.kapanis.metin, eylem: {metin: S.kapanis.eylem, git: '#/iletisim?konu=soru'}})}
    ], {bas: DD.metinBlok({etiket: S.etiket, baslik: S.baslik, metin: S.kategoriler.length === 1 ? `${S.kategoriler[0].ad}: ${n} soru.` : `${n} soru`, h: 1})});
  };

  // ---------- Künye, Bilimsel Kaynaklar (yasal metin şablonu) ----------
  const belge = (ctx, m) => {
    const {giris, bolumler} = YM().bolumle(m.bloklar), ozet = b => YM().ozet(b, 'Henüz yayımlanmadı');
    const n = Math.min(bolumler.length, Math.max(1, +ctx.sorgu.bolum || 1)) - 1;
    return DD.gruplar([
      {html: DD.akordiyon([{ikon: 'list-ol', baslik: 'İçindekiler', alt: `${bolumler.length} başlık`, icerik: DD.satirlar(bolumler.map((b, i) => ({baslik: b.baslik, veri: {eylem: 'bolum', id: i}, ok: false})))}], {ad: 'toc', acik: ctx.sorgu.icindekiler === 'acik' ? 0 : -1})},
      giris.length && {html: DD.makale(giris.map(blokHtml).join(''))},
      {html: DD.akordiyon(bolumler.map(b => ({ikon: m.ikon, baslik: b.baslik, alt: ozet(b), icerik: DD.makale(b.bloklar.map(blokHtml).join(''))})), {ad: 'ys', acik: n})},
      {html: `<div class="dd-yigin-12">${m.ayak ? DD.p(m.ayak, {meta: true, ton: 'ikincil'}) : ''}${DD.satirlar([{ikon: 'envelope', baslik: 'İletişim', alt: 'Başvuru ve talepler için', git: '#/iletisim'}])}${DD.btn({metin: 'Tüm yasal metinler', tur: 'secondary', ikon: 'list', tam: true, git: '#/yasal'})}</div>`}
    ], {bas: `<div class="dd-yigin-12">${DD.metinBlok({etiket: 'Yasal Metinler', baslik: m.baslik, metin: `Sürüm ${m.surum} · ${DD.tarihUzun(m.tarih)}`, h: 1})}${m.uyari ? DD.bant({ton: 'uyari', baslik: m.uyari.baslik, metin: m.uyari.metin}) : ''}</div>`});
  };

  // ---------- Editoryal ve Bilimsel Kurul ----------
  const editoryal = () => {
    const E = K()['editoryal-kurul'];
    return DD.gruplar([
      kartGrup(E.gorev),
      {html: `<div class="dd-yigin">${baslikBlok(E.isleyis)}${DD.satirlar(E.isleyis.adimlar.map(adimSatir))}</div>`},
      kartGrup(E.pusula),
      kartGrup(E.belgeler)
    ], {bas: sayfaBas(E)});
  };

  // ---------- Nasıl Çalışır? ----------
  // Kart eylemleri: kısa iki düğme eşit ikili, değilse alt alta tam genişlik (hizalı); ikincil sm.
  const eylemler = l => (!l?.length ? '' : l.length === 2 && l.every(e => e.metin.length <= 14) ? DD.btnIkili({metin: l[0].metin, boyut: 'sm', git: l[0].git}, {metin: l[1].metin, tur: 'secondary', boyut: 'sm', git: l[1].git}) : `<div class="dd-yigin-8">${l.map(e => DD.btn({metin: e.metin, tur: 'secondary', boyut: 'sm', tam: true, git: e.git})).join('')}</div>`);
  const nasilCalisir = () => {
    const N = K()['nasil-calisir'];
    const adim = a => DD.kart({html: `<div class="dd-yigin-12">${DD.metinBlok({baslik: a.baslik, metin: a.metin, rol: 'sub', h: 3})}${eylemler(a.eylemler)}</div>`});
    const kart = k => DD.kart({html: `<div class="dd-yigin-12">${DD.ikonKutu({ikon: k.ikon})}${DD.metinBlok({baslik: k.baslik, metin: k.metin, rol: 'sub', h: 3})}${eylemler(k.eylemler)}</div>`});
    return DD.gruplar([
      {html: `<div class="dd-yigin">${baslikBlok(N.adimlar)}<div class="dd-yigin-12">${N.adimlar.ogeler.map(adim).join('')}</div></div>`},
      {html: `<div class="dd-yigin-12">${N.kartlar.map(kart).join('')}</div>`},
      {html: DD.makale(N.bloklar.map(blokHtml).join(''))},
      {html: DD.ipucu({ton: 'bilgi', ikon: 'bilgi', html: zengin(N.not)})}
    ], {bas: sayfaBas(N)});
  };

  // ---------- Sağlık Bilgilendirmesi ----------
  const saglik = () => { const S = K()['saglik-bilgilendirmesi']; return DD.gruplar([{html: DD.makale(S.bloklar.map(blokHtml).join(''))}], {bas: sayfaBas(S)}); };

  // ---------- Uzmanla Çalışma Rehberi ----------
  const uzmanla = () => {
    const U = K()['uzmanla-calisma'];
    return DD.gruplar([
      {html: DD.makale(U.bloklar.map(blokHtml).join(''))},
      {baslik: U.surec.baslik, satirlar: U.surec.maddeler.map(m => ({ikon: 'check', baslik: m}))},
      {html: DD.bant({ton: 'uyari', metin: U.uyari})},
      {baslik: U.siradaki.baslik, satirlar: U.siradaki.kartlar.map(kartSatir)}
    ], {bas: sayfaBas(U)});
  };

  // ---------- Diyetisyen Ol (başvuru formu) ----------
  const D = () => K()['diyetisyen-ol'];
  const METIN = ['ad', 'soyad', 'eposta', 'telefon', 'sehir', 'cinsiyet', 'diploma', 'universite', 'mezuniyet', 'unvan', 'deneyim', 'diller', 'bio', 'klinikAd', 'klinikAdres', 'ucretNot'];
  const ZORUNLU = ['ad', 'soyad', 'eposta', 'telefon', 'sehir', 'diploma', 'universite', 'mezuniyet', 'unvan', 'deneyim', 'bio'];
  const TASLAK = ['ad', 'soyad', 'sehir', 'cinsiyet', 'universite', 'mezuniyet', 'unvan', 'deneyim', 'bio', 'klinikAd', 'klinikAdres', 'diller', 'ucretNot'];
  const bosBasvuru = (t = {}) => ({...Object.fromEntries(METIN.map(k => [k, t[k] || ''])), uzmanlik: t.uzmanlik || [], gorusme: t.gorusme || [], dosya: t.dosya || {}, riza1: !!t.riza1, riza2: !!t.riza2});
  const gecerli = (d, k) => {
    const v = String(d[k] || '').trim(), A = D().alanlar[k];
    if (!v) return false;
    if (k === 'eposta') return EPOSTA.test(v);
    if (k === 'telefon') return v.replace(/\D/g, '').length === 10;
    if (A.min != null) return /^\d+$/.test(v) && +v >= A.min && +v <= A.max;
    return true;
  };
  const basvuruDogrula = d => {
    const A = D().alanlar, h = {};
    ZORUNLU.forEach(k => { if (!gecerli(d, k)) h[k] = A[k].hata; });
    if (!d.uzmanlik.length) h.uzmanlik = A.uzmanlik.hata;
    if (!d.dosya.diplomaDosya?.length) h.diplomaDosya = A.diplomaDosya.hata;
    if (!d.dosya.foto?.length) h.foto = A.foto.hata;
    if (!d.gorusme.length) h.gorusme = A.gorusme.hata;
    if (!(d.riza1 && d.riza2)) h.riza = D().onayHata;
    return h;
  };
  const eksikAd = k => (k === 'riza' ? 'Onaylar' : k === 'uzmanlik' ? D().alanlar.uzmanlik.ozet : D().alanlar[k].etiket);
  const oran = d => {
    const p = ZORUNLU.filter(k => gecerli(d, k)).length + [d.uzmanlik.length, d.dosya.diplomaDosya?.length, d.dosya.foto?.length, d.gorusme.length, d.riza1, d.riza2].filter(Boolean).length;
    return Math.round(p / (ZORUNLU.length + 6) * 100);
  };
  const olcer = d => { const o = oran(d); return DD.ilerleme({n: o, hedef: 100, etiket: 'Form tamamlanma', deger: `%${o} tamamlandı`}); };
  const ops = A => `${A.etiket} (isteğe bağlı)`;
  const sec = l => l.map(x => [x, x]);
  const uzmanEtiket = n => `${D().alanlar.uzmanlik.etiket} · ${n} / ${D().alanlar.uzmanlik.en}`;
  const dosyaAlan = (k, d, h) => {
    const A = D().alanlar[k], l = d.dosya[k] || [];
    return DD.alan({etiket: A.hata ? A.etiket : ops(A), zorunlu: !!A.hata, hata: h[k], yardim: A.yardim, html: l.length
      ? DD.satirlar([{ikon: 'file-lines', baslik: l.join(', '), duz: true, sag: DD.btn({metin: 'Kaldır', tur: 'text', boyut: 'sm', veri: {eylem: 'dosya-sil', id: k}})}])
      : DD.btn({metin: A.sec, ikon: 'cloud-arrow-up', tur: 'secondary', tam: true, veri: {eylem: 'dosya-sec', id: k}})});
  };
  const klinikHtml = (d = {}) => {
    const A = D().alanlar;
    return d.gorusme?.includes('yuz') ? `<div class="dd-yigin">${DD.input({ad: 'klinikAd', etiket: ops(A.klinikAd), deger: d.klinikAd})}${DD.input({ad: 'klinikAdres', etiket: ops(A.klinikAdres), deger: d.klinikAdres, yardim: A.klinikAdres.yardim})}</div>` : '';
  };
  const bolumHtml = (i, govde) => { const [id, , ad] = D().bolumler[i]; return `<section class="dd-grup dd-yigin" data-bolum="${id}">${DD.bas(ad, {html: DD.rozet({metin: `${i + 1} / ${D().bolumler.length}`, ton: 'notr'})})}${govde}</section>`; };
  const basvuruOzet = h => DD.bant({ton: 'hata', metin: `**Eksik alanlar:** ${Object.keys(h).map(eksikAd).join(', ')}.`});
  const basvuruFormHtml = (d, h = {}) => {
    const B = D(), A = B.alanlar, eksik = Object.keys(h);
    return `${eksik.length ? `<div data-ozet tabindex="-1">${basvuruOzet(h)}</div>` : ''}
      <div data-yuva="olcer">${olcer(d)}</div>
      ${bolumHtml(0, `${DD.input({ad: 'ad', etiket: A.ad.etiket, zorunlu: true, yer: A.ad.yer, deger: d.ad, hata: h.ad, otomatik: 'given-name'})}
        ${DD.input({ad: 'soyad', etiket: A.soyad.etiket, zorunlu: true, yer: A.soyad.yer, deger: d.soyad, hata: h.soyad, otomatik: 'family-name'})}
        ${DD.input({ad: 'eposta', etiket: A.eposta.etiket, zorunlu: true, tur: 'email', mod: 'email', ikon: 'envelope', yer: A.eposta.yer, deger: d.eposta, hata: h.eposta, otomatik: 'email'})}
        ${DD.telefon({ad: 'telefon', etiket: A.telefon.etiket, zorunlu: true, deger: d.telefon, hata: h.telefon})}
        ${DD.secAlan({ad: 'sehir', etiket: A.sehir.etiket, zorunlu: true, secenekler: sec(A.sehir.secenekler), deger: d.sehir, yer: 'Seç', hata: h.sehir})}
        ${DD.secAlan({ad: 'cinsiyet', etiket: ops(A.cinsiyet), secenekler: sec(A.cinsiyet.secenekler), deger: d.cinsiyet, yer: 'Seç'})}`)}
      ${bolumHtml(1, `${DD.input({ad: 'diploma', etiket: A.diploma.etiket, zorunlu: true, yer: A.diploma.yer, deger: d.diploma, hata: h.diploma, yardim: A.diploma.yardim})}
        ${DD.input({ad: 'universite', etiket: A.universite.etiket, zorunlu: true, yer: A.universite.yer, deger: d.universite, hata: h.universite})}
        ${DD.input({ad: 'mezuniyet', etiket: A.mezuniyet.etiket, zorunlu: true, tur: 'number', mod: 'numeric', yer: A.mezuniyet.yer, deger: d.mezuniyet, hata: h.mezuniyet})}
        ${DD.secAlan({ad: 'unvan', etiket: A.unvan.etiket, zorunlu: true, secenekler: sec(A.unvan.secenekler), deger: d.unvan, yer: 'Seç', hata: h.unvan})}
        ${DD.input({ad: 'deneyim', etiket: A.deneyim.etiket, zorunlu: true, tur: 'number', mod: 'numeric', yer: A.deneyim.yer, deger: d.deneyim, hata: h.deneyim})}
        ${DD.alan({id: 'e-uzmanlik', etiket: uzmanEtiket(d.uzmanlik.length), zorunlu: true, hata: h.uzmanlik, yardim: A.uzmanlik.yardim, html: DD.cipler({ad: 'uzmanlik', tur: 'coklu', serit: false, etiket: A.uzmanlik.etiket, secili: d.uzmanlik, ogeler: A.uzmanlik.secenekler.map(s => ({metin: s, deger: s, kucuk: true}))})})}
        ${DD.input({ad: 'diller', etiket: ops(A.diller), yer: A.diller.yer, deger: d.diller})}`)}
      ${bolumHtml(2, `${DD.p(B.belgeNot, {ton: 'ikincil'})}
        <div data-yuva="dosya-diplomaDosya">${dosyaAlan('diplomaDosya', d, h)}</div>
        <div data-yuva="dosya-sertifika">${dosyaAlan('sertifika', d, h)}</div>
        <div data-yuva="dosya-foto">${dosyaAlan('foto', d, h)}</div>`)}
      ${bolumHtml(3, `${DD.input({ad: 'bio', etiket: A.bio.etiket, zorunlu: true, cokSatir: true, yer: A.bio.yer, deger: d.bio, hata: h.bio, yardim: `${d.bio.length} / ${A.bio.max}`})}
        ${DD.alan({etiket: A.gorusme.etiket, zorunlu: true, hata: h.gorusme, html: DD.secimler({ad: 'gorusme', coklu: true, duzen: 'iki', secili: d.gorusme, ogeler: A.gorusme.secenekler})})}
        <div data-yuva="klinik">${klinikHtml(d)}</div>
        ${DD.input({ad: 'ucretNot', etiket: ops(A.ucretNot), cokSatir: true, yer: A.ucretNot.yer, deger: d.ucretNot})}
        ${DD.alan({etiket: 'Onaylar', zorunlu: true, hata: h.riza, html: `<div class="dd-yigin-4">${DD.checkbox({ad: 'riza1', etiket: B.onaylar[0], secili: d.riza1})}${DD.checkbox({ad: 'riza2', etiket: B.onaylar[1], secili: d.riza2})}${DD.btn({metin: 'KVKK Aydınlatma Metni’ni oku', tur: 'text', boyut: 'sm', ikon: 'file-lines', git: '#/yasal/kvkk'})}</div>`})}
        ${DD.p(B.gonderNot, {meta: true, ton: 'ikincil'})}
        ${DD.btn({metin: B.gonder, ikon: 'gonder', tam: true, veri: {eylem: 'basvuru-gonder'}})}
        ${DD.p(B.taslakNot, {meta: true, ton: 'ikincil'})}`)}`;
  };
  const basvuruOku = (kok, onceki = {}) => {
    const f = kok.querySelector('[data-yuva="form"]'), v = ad => f.querySelector(`[name="${ad}"]`)?.value ?? onceki[ad] ?? '';
    return bosBasvuru({...Object.fromEntries(METIN.map(k => [k, String(v(k)).trim()])), bio: String(v('bio')),
      uzmanlik: [...f.querySelectorAll('[data-ad="uzmanlik"] [data-cip][aria-pressed="true"]')].map(b => b.dataset.cip),
      gorusme: [...f.querySelectorAll('[data-ad="gorusme"] .dd-secim-kart[aria-pressed="true"]')].map(b => b.dataset.k),
      dosya: onceki.dosya || {}, riza1: !!f.querySelector('[name="riza1"]')?.checked, riza2: !!f.querySelector('[name="riza2"]')?.checked});
  };
  const basvuru = () => DD.durum.oku('diyetisyen-basvuru', null);
  const durumMetni = b => {
    const T = D().tamam, m = T.metin.replace('{tarih}', DD.tarihUzun(b?.tarih || DD.bugunIso()));
    return b?.ad ? m.replace('{ad}', b.ad) : m.replace('{ad}, b', 'B');
  };
  const surecGrup = (tamam = false) => {
    const B = D(), T = B.tamam;
    return {baslik: B.surec.baslik, eylem: tamam ? {html: DD.durumRozet({metin: T.durum, ton: 'uyari', ikon: 'hourglass-half'})} : undefined,
      satirlar: B.surec.adimlar.map((a, i) => ({...adimSatir(a, i), ek: !tamam ? undefined : i === 0 ? DD.durumRozet({kod: 'tamamlandi'}) : i === 1 ? DD.durumRozet({metin: T.sirada, ton: 'uyari', ikon: 'clock'}) : undefined}))};
  };
  const diyetisyenOl = ctx => {
    const B = D(), T = B.tamam;
    const bas = `<div class="dd-yigin-12">${sayfaBas(B)}${DD.maddeler(B.guven.map(([i, t]) => [i, t]))}</div>`;
    if (ctx.sorgu.hal === 'tamam') {
      return DD.gruplar([
        {html: DD.bos({ikon: 'circle-check', baslik: T.baslik, metin: durumMetni(basvuru()), eylem: {metin: T.eylem, tur: 'secondary', ikon: 'file-lines', yerine: '#/diyetisyen-ol'}, ikincil: {metin: 'Bugün’e dön', yerine: '#/bugun'}})},
        surecGrup(true),
        {html: DD.p(`**${T.not}**`, {meta: true, ton: 'ikincil'})}
      ], {bas: sayfaBas(B)});
    }
    const ornekHata = () => bosBasvuru({ad: DDV.kullanici?.ad || '', eposta: `${DD.katla(DDV.kullanici?.ad || 'ad')}@posta`, uzmanlik: [B.alanlar.uzmanlik.secenekler[0]], gorusme: ['online'], riza1: true});
    const d = ctx.taslak || (formHata(ctx) ? ornekHata() : bosBasvuru(DD.durum.oku('diyetisyen-basvuru-taslak', {})));
    const h = ctx.hatalar || (formHata(ctx) ? basvuruDogrula(d) : {});
    const b = basvuru();
    return DD.gruplar([
      b?.durum === 'alindi' && {html: DD.bant({ton: 'basari', baslik: T.baslik, metin: `**${T.durum}.** ${durumMetni(b)}`, eylem: {metin: 'Süreci gör', yerine: '#/diyetisyen-ol?hal=tamam'}})},
      surecGrup(),
      `<div class="dd-yigin-24" data-form data-yuva="form">${basvuruFormHtml(d, h)}</div>`,
      {baslik: B.neden.baslik, satirlar: B.neden.maddeler.map(m => ({ikon: 'check', baslik: m}))},
      {html: `<div class="dd-yigin">${baslikBlok(B.sss)}${DD.akordiyon(B.sss.sorular.map(s => ({ikon: s.ikon, baslik: s.soru, icerik: DD.makale(`<p>${esc(s.yanit)}</p>`)})), {ad: 'dsss', acik: -1})}</div>`}
    ], {bas});
  };
  const basvuruBagla = (kok, ctx) => {
    const yuva = kok.querySelector('[data-yuva="form"]'); if (!yuva) return () => {};
    const A = D().alanlar, c = [];
    let d = ctx.taslak || basvuruOku(kok, {dosya: {}});
    if (!ctx.hatalar && formHata(ctx)) { const h0 = basvuruDogrula(d); if (Object.keys(h0).length) ctx.hatalar = h0; }
    const bioSinir = () => { const t = yuva.querySelector('[name="bio"]'); t?.setAttribute('maxlength', A.bio.max); return t; };
    const guncelle = () => {
      d = basvuruOku(kok, d); ctx.taslak = d;
      yuva.querySelector('[data-yuva="olcer"]').innerHTML = olcer(d);
      const et = yuva.querySelector('#e-uzmanlik'); if (et) et.textContent = `${uzmanEtiket(d.uzmanlik.length)} *`;
      const by = bioSinir()?.closest('.dd-alan')?.querySelector('.dd-yardim'); if (by) by.textContent = `${d.bio.length} / ${A.bio.max}`;
      if (ctx.hatalar) { hatalariSuz(yuva, ctx.hatalar, basvuruDogrula(d), basvuruOzet); if (!Object.keys(ctx.hatalar).length) ctx.hatalar = null; }
      if (!formHata(ctx)) DD.durum.yaz('diyetisyen-basvuru-taslak', {...Object.fromEntries(TASLAK.map(k => [k, d[k]])), uzmanlik: d.uzmanlik, gorusme: d.gorusme});
    };
    bioSinir();
    yuva.addEventListener('input', guncelle); yuva.addEventListener('change', guncelle); yuva.addEventListener('dd-degisim', guncelle);
    c.push(() => { yuva.removeEventListener('input', guncelle); yuva.removeEventListener('change', guncelle); yuva.removeEventListener('dd-degisim', guncelle); });
    // En çok 5 uzmanlık alanı: altıncı seçim geri alınır (web: toast "En fazla 5 ...").
    let onceki = [...d.uzmanlik];
    c.push(DD.on(kok, 'uzmanlik', liste => {
      if (liste.length > A.uzmanlik.en) {
        const yeni = liste.find(x => !onceki.includes(x));
        yuva.querySelector(`[data-ad="uzmanlik"] [data-cip="${CSS.escape(yeni)}"]`)?.setAttribute('aria-pressed', 'false');
        DD.toast(A.uzmanlik.fazla, {tur: 'uyari', yerine: true}); guncelle();
      }
      onceki = [...d.uzmanlik];
    }));
    c.push(DD.on(kok, 'gorusme', () => { yuva.querySelector('[data-yuva="klinik"]').innerHTML = klinikHtml(basvuruOku(kok, d)); }));
    // Dosya: kanonda dosya alanı yok; seçici gizli input'la açılır, yalnız dosya adı listelenir (web: dosya yüklenmez).
    const dosyaCiz = k => { yuva.querySelector(`[data-yuva="dosya-${k}"]`).innerHTML = dosyaAlan(k, d, ctx.hatalar && !d.dosya[k]?.length ? ctx.hatalar : {}); guncelle(); };
    c.push(DD.eylem(kok, 'dosya-sec', el => {
      const k = el.dataset.id, i = document.createElement('input');
      i.type = 'file'; i.accept = A[k].kabul; i.multiple = !!A[k].coklu;
      i.addEventListener('change', () => { if (!i.files.length) return; d.dosya = {...d.dosya, [k]: [...i.files].map(f => f.name)}; dosyaCiz(k); yuva.querySelector(`[data-yuva="dosya-${k}"] [data-eylem="dosya-sil"]`)?.focus(); });
      i.click();
    }));
    c.push(DD.eylem(kok, 'dosya-sil', el => { const k = el.dataset.id; d.dosya = {...d.dosya, [k]: []}; dosyaCiz(k); yuva.querySelector(`[data-yuva="dosya-${k}"] [data-eylem="dosya-sec"]`)?.focus(); }));
    if (ctx.hatalar || formHata(ctx)) requestAnimationFrame(() => yuva.querySelector('[data-ozet]')?.scrollIntoView({block: 'center'}));
    c.push(DD.eylem(kok, 'basvuru-gonder', el => {
      d = basvuruOku(kok, d);
      const h = basvuruDogrula(d);
      if (Object.keys(h).length) {
        ctx.taslak = d; ctx.hatalar = h;
        yuva.innerHTML = basvuruFormHtml(d, h); bioSinir(); onceki = [...d.uzmanlik];
        const oz = yuva.querySelector('[data-ozet]'); oz?.scrollIntoView({behavior: DD.azHareket() ? 'auto' : 'smooth', block: 'center'}); oz?.focus({preventScroll: true});
        return;
      }
      if (navigator.onLine === false) { DD.toast('**Bağlantı yok.** Başvurun bu cihazda duruyor; bağlanınca yeniden gönder.', {tur: 'hata', yerine: true}); return; }
      DD.durum.yaz('diyetisyen-basvuru', {durum: 'alindi', ad: d.ad, tarih: DD.bugunIso(), uzmanlik: d.uzmanlik, gorusme: d.gorusme});
      ctx.taslak = null; ctx.hatalar = null;
      DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 2).then(() => DD.yerine('#/diyetisyen-ol?hal=tamam'));
    }));
    return () => c.forEach(f => f());
  };

  // Öğeyi kaydırma kabının başına getirir; kabın üst boşluğu (üst bar boyu) düşülür.
  const basaKaydir = (kok, el, yumusak = true) => {
    const k = kok.querySelector('.dd-kaydir'); if (!k || !el) return;
    const y = el.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - (parseFloat(getComputedStyle(k).paddingTop) || 0);
    k.scrollTo({top: Math.max(0, y), behavior: yumusak && !DD.azHareket() ? 'smooth' : 'auto'});
  };
  // İçindekiler → bölüm: kapalıysa ortak akordiyon düğmesiyle açılır, açılış hareketi bitince başına kaydırılır.
  const bolumeGit = (kok, i, kaydir = true) => {
    const btn = kok.querySelector(`#ys-b${i}`); if (!btn) return;
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
    setTimeout(() => { basaKaydir(kok, btn.closest('.dd-ak-bolum'), kaydir); if (kaydir) btn.focus({preventScroll: true}); }, DD.azHareket() ? 0 : DD.TK.motion.sheet);
  };
  const CIZ = {hakkimizda, iletisim, sss, kunye: ctx => belge(ctx, K().kunye), 'bilimsel-kaynaklar': ctx => belge(ctx, K()['bilimsel-kaynaklar']), 'editoryal-kurul': editoryal, 'nasil-calisir': nasilCalisir, 'saglik-bilgilendirmesi': saglik, 'uzmanla-calisma': uzmanla, 'diyetisyen-ol': diyetisyenOl};
  DD.ekran('kurumsal', {
    tur: 'alt',
    baslik: ctx => BASLIK[sayfa(ctx)] || 'Dada Diet',
    iskelet: 'satir',
    ciz: ctx => (CIZ[sayfa(ctx)] || (() => DD.hataEkran({tur: 'bulunamadi'})))(ctx),
    sonra: (kok, ctx) => {
      const s = sayfa(ctx), c = [];
      if (s === 'kunye' || s === 'bilimsel-kaynaklar') {
        if (+ctx.sorgu.bolum > 1) requestAnimationFrame(() => bolumeGit(kok, +ctx.sorgu.bolum - 1, false));
        c.push(DD.eylem(kok, 'bolum', el => bolumeGit(kok, +el.dataset.id)));
      }
      if (s === 'sss') {
        const girdi = kok.querySelector('[name="sss-ara"]'), yuva = kok.querySelector('[data-yuva="sss"]');
        const suz = () => { yuva.innerHTML = sssPanel(girdi.value.trim()); };
        girdi.addEventListener('input', suz);
        c.push(() => girdi.removeEventListener('input', suz));
      }
      if (s === 'diyetisyen-ol' && ctx.sorgu.hal !== 'tamam') c.push(basvuruBagla(kok, ctx));
      if (s === 'iletisim' && ctx.sorgu.hal !== 'tamam') {
        const yuva = kok.querySelector('[data-yuva="form"]');
        if (ctx.hatalar || formHata(ctx)) requestAnimationFrame(() => kok.querySelector('[data-ozet]')?.scrollIntoView({block: 'center'}));
        if (!ctx.hatalar && formHata(ctx)) { const h0 = dogrula(formOku(kok)); if (Object.keys(h0).length) ctx.hatalar = h0; }
        const suzIletisim = () => { if (!ctx.hatalar) return; const d = formOku(kok); ctx.taslak = d; hatalariSuz(yuva, ctx.hatalar, dogrula(d), iletisimOzet); if (!Object.keys(ctx.hatalar).length) ctx.hatalar = null; };
        ['input', 'change', 'dd-degisim'].forEach(o => yuva.addEventListener(o, suzIletisim));
        c.push(() => ['input', 'change', 'dd-degisim'].forEach(o => yuva.removeEventListener(o, suzIletisim)));
        c.push(DD.eylem(kok, 'forma-git', () => basaKaydir(kok, kok.querySelector('[data-form]'))));
        c.push(DD.eylem(kok, 'iletisim-gonder', el => {
          const d = formOku(kok), h = dogrula(d);
          if (Object.keys(h).length) {
            ctx.taslak = d; ctx.hatalar = h;
            yuva.innerHTML = formHtml(d, h);
            const oz = yuva.querySelector('[data-ozet]'); oz?.scrollIntoView({behavior: DD.azHareket() ? 'auto' : 'smooth', block: 'center'}); oz?.focus({preventScroll: true});
            return;
          }
          if (navigator.onLine === false) { DD.toast('**Bağlantı yok.** Mesajın bu cihazda duruyor; bağlanınca yeniden gönder.', {tur: 'hata', yerine: true}); return; }
          ctx.taslak = null; ctx.hatalar = null;
          DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 2).then(() => DD.yerine('#/iletisim?hal=tamam'));
        }));
      }
      return () => c.forEach(f => f());
    }
  });
})();
