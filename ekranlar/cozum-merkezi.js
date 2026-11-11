/* Çözüm Merkezi: #/cozum-merkezi (sık sorulanlar, talepler, yeni talep) ve #/talep/:id (talep yazışması).
 * Gastro kalıbı (ayarlar.js S5): sayfa başlığı + kaydırmalı segment SSS · Taleplerim · Yeni talep (?sekme=sss|talepler|yeni); yeni talep formu sekmenin içinde.
 * Web karşılığı: hesabim/cozum-merkezi + talep (uye-gastro-cozum.js, uye-gastro-talep.js, uye-gastro-destek.js). SSS, konu listesi ve talepler DDV.uye.
 * Durum: destek-talepleri (talep dizisinin tamamı; varsayılan DDV.uye.talepler, yeni hesapta []). Yanıt yazınca talep 'acik' olur; "Sorunum çözüldü" 'cozulen',
 *   kapalı talep yeniden açılabilir. #/cozum-merkezi?yeni=1 (ya da ?sekme=yeni) yeni talep sekmesini açar (?konu=İptal ve iade konuyu seçer), ?hal=bos, ?hal=hata.
 * Öneri ve şikâyet (?sekme=oneri; Gastro destek 'oneri' sekmesi, web cozum-merkezi.mjs oneri formu, veri DDV.uye.oneri): ad, soyad, e-posta, telefon (isteğe bağlı),
 *   tür, ilgili alan, mesaj, KVKK onayı. Gönderim DD.durum 'oneri-gonderimleri'. Haller: ?sekme=oneri&hal=form-hata, ?sekme=oneri&hal=tamam.
 * Misafir: SSS ve Öneri ve şikâyet açık; Taleplerim ve Yeni talep sekme içinde DD.girisGerekli({tam:false}), #/talep/:id tam sayfa. Yeni talep hataları alan altında. */
(() => {
  const U = () => DDV.uye;
  const talepler = ctx => (ctx?.sorgu.hal === 'bos' ? [] : DD.durum.oku('destek-talepleri', DD.yeniHesap() ? [] : U().talepler));
  const yaz = l => DD.durum.yaz('destek-talepleri', l);
  const son = t => t.mesajlar[t.mesajlar.length - 1];
  const sirali = l => l.slice().sort((a, b) => `${son(b).tarih}${son(b).saat}`.localeCompare(`${son(a).tarih}${son(a).saat}`));
  const DURUM = {
    acik: {metin: 'Açık', ton: 'notr', ikon: 'inbox', filtre: 'Açık'},
    yanit: {metin: 'Yanıtın bekleniyor', ton: 'uyari', ikon: 'reply', filtre: 'Yanıt bekliyor'},
    cozulen: {metin: 'Çözüldü', ton: 'basari', ikon: 'circle-check', filtre: 'Çözülen'},
    kapali: {metin: 'Kapandı', ton: 'notr', ikon: 'lock', filtre: 'Kapatılan'}
  };
  const rozet = d => DD.durumRozet(DURUM[d]);
  const simdiSaat = () => DD.ogun.noktali(DDV.bugun.simdi);
  const tarihMetin = iso => (iso === DD.bugunIso() ? 'Bugün' : DD.tarihKisa(iso));
  const sekme = ctx => ctx.sekme || (ctx.sorgu.yeni ? 'yeni' : ['sss', 'talepler', 'yeni', 'oneri'].includes(ctx.sorgu.sekme) ? ctx.sorgu.sekme : ['form-hata', 'tamam'].includes(ctx.sorgu.hal) ? 'oneri' : 'sss');
  const misafirKapi = (baslik, metin, tam = false) => DD.girisGerekli({ikon: 'inbox', baslik, metin, tam});
  // Ortak form yardımcıları (Gastro alanHata): düzeltilen alanın hatası kalkar; hatalı ilk alana yalnız iç kaydırıcı kayar.
  const hataKaldir = el => { const a = el?.closest('.dd-alan.is-hata'); if (a) { a.classList.remove('is-hata'); a.querySelector(':scope > .dd-hata')?.remove(); a.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); } };
  const hatayaGit = (kok, kap) => {
    const a = kap.querySelector('.dd-alan.is-hata'), k = kok.querySelector('.dd-kaydir');
    if (!a) return;
    k?.scrollTo({top: Math.max(0, a.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - k.clientHeight / 3), behavior: DD.azHareket() ? 'auto' : 'smooth'});
    a.querySelector('input:not([type=hidden]),textarea,button')?.focus({preventScroll: true});
  };

  // ---------- Talepler ----------
  const talepSatir = t => ({ikon: DURUM[t.durum].ikon, baslik: t.baslik, alt: `${DURUM[t.durum].metin} · ${t.konu} · ${tarihMetin(son(t).tarih)}`, git: `#/talep/${t.id}`});
  const talepPanel = (ctx, suz) => {
    if (!DD.uye()) return misafirKapi('Taleplerin için giriş yap', 'Destek taleplerin **hesabına bağlı**. Giriş yapınca açtığın talepleri ve yanıtları burada görürsün.');
    const tum = sirali(talepler(ctx)), l = tum.filter(t => !suz || t.durum === suz), acik = tum.filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
    if (!tum.length) return DD.bos({ikon: 'inbox', baslik: 'Henüz destek talebin yok', metin: 'Bir sorun yaşarsan ya da bir şey sormak istersen **ilk talebini** buradan açabilirsin.', eylem: {metin: 'Yeni talep', ikon: 'ekle', veri: {eylem: 'yeni-talep'}}});
    const cip = DD.cipler({ad: 'talep-suz', tur: 'tek', etiket: 'Talep durumu süzgeci', secili: suz || '', ogeler: [{metin: 'Tümü', deger: '', sayi: tum.length}, ...Object.entries(DURUM).map(([k, v]) => ({metin: v.filtre, deger: k, sayi: tum.filter(t => t.durum === k).length}))]});
    const liste = l.length ? DD.satirlar(l.map(talepSatir)) : DD.bos({ikon: 'filtre', baslik: 'Bu durumda talebin yok', metin: 'Seçtiğin durumda talep bulunmuyor; **Tümü** ile hepsini görebilirsin.', eylem: {metin: 'Tüm talepleri göster', tur: 'secondary', veri: {eylem: 'talep-tumu'}}});
    return `<div class="dd-yigin">${DD.p(acik ? `**${acik} talebin** açık; destek ekibi talepleri sırayla yanıtlar.` : 'Açık talebin yok; **kapanan talepler** de burada saklanır.', {ton: 'ikincil', meta: true})}${cip}${liste}</div>`;
  };

  // ---------- Sık sorulanlar ----------
  const sssPanel = (kat, ara) => {
    const q = DD.katla(ara || ''), tum = U().sss.flatMap(k => k.sorular.map(s => ({...s, kategori: k.kategori})));
    const l = q ? tum.filter(s => DD.katla(`${s.soru} ${s.yanit}`).includes(q)) : U().sss.find(k => k.kategori === kat).sorular;
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da **sorunu bize yaz**.', eylem: {metin: 'Yeni talep', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'yeni-talep'}}});
    return `<div class="dd-yigin-12">${q ? DD.p(`**“${ara.trim()}”** için ${l.length} soru bulundu.`, {ton: 'ikincil', meta: true}) : ''}${DD.akordiyon(l.map(s => ({baslik: s.soru, alt: q ? s.kategori : null, ikon: s.ikon, icerik: DD.p(s.yanit)})), {acik: -1})}</div>`;
  };
  const sssBolum = ctx => `<div class="dd-yigin">${DD.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', sonuc: false})}${DD.cipler({ad: 'sss-kat', tur: 'tek', etiket: 'Soru kategorileri', secili: ctx.kat, ogeler: U().sss.map(k => ({metin: k.kategori, ikon: k.ikon, deger: k.kategori, sayi: k.sorular.length}))})}<div data-yuva="sss">${sssPanel(ctx.kat)}</div><div class="dd-yigin-8">${DD.bas('Topluluk')}${DD.satirlar([{ikon: 'people-group', baslik: 'Destek grupları', alt: 'Benzer hedefteki üyelerle deneyim paylaş', git: '#/destek-gruplari'}])}</div><div class="dd-yigin-8">${DD.bas('Bize yaz')}${DD.satirlar([{ikon: 'comment-dots', baslik: 'Görüş bildir', alt: 'Öneri, soru, teknik sorun ya da puan', git: '#/gorus-bildir'}])}</div>${DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Dada Diet içerikleri **genel bilgi** amaçlıdır; tanı ve tedavi için hekimine başvur.'})}</div>`;

  // ---------- Yeni talep ----------
  const RANDEVU = ['Diyetisyen ve randevu'], ODEME = ['Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Pro abonelik'];
  const baglamSecenek = konu => {
    if (RANDEVU.includes(konu) && !DD.yeniHesap()) { const B = DDV.benimDiyetisyenim, r = DD.durum.oku('uzman-randevu', B.sonrakiRandevu); return [...(r ? [`${r.tarihMetin} ${DD.ogun.noktali(r.saat)} · ${r.tur}`] : []), ...B.gecmisRandevular.map(x => `${x.tarihMetin} ${DD.ogun.noktali(x.saat)} · ${x.tur}`)]; }
    if (ODEME.includes(konu) && !DD.yeniHesap()) return U().odemeler.map(o => `${o.no} · ${o.baslik}`);
    return [];
  };
  const baglamHtml = (konu, secili) => { const l = baglamSecenek(konu); return l.length ? DD.alan({etiket: 'İlgili kayıt (isteğe bağlı)', html: DD.cipler({ad: 'talep-baglam', tur: 'tek', serit: false, secili: secili || '', ogeler: l.map(x => ({metin: x, deger: x, kucuk: true}))})}) : ''; };
  const yeniForm = (t, h) => `<div class="dd-yigin" data-talep-form>${DD.p('Talebin **destek ekibine** iletilir; ekip talepleri sırayla yanıtlar. Sağlık sorunlarında hekimine başvur.', {ton: 'ikincil'})}${DD.alan({etiket: 'Konu', zorunlu: true, hata: h.konu, html: DD.cipler({ad: 'talep-konu', tur: 'tek', serit: false, secili: t.konu, ogeler: U().talepKonulari.map(k => ({metin: k, deger: k, kucuk: true}))})})}<div data-yuva="baglam">${baglamHtml(t.konu, t.baglam)}</div>${DD.input({ad: 'talep-baslik', etiket: 'Başlık', yer: 'Sorunu kısaca özetle', deger: t.baslik, zorunlu: true, hata: h.baslik})}${DD.input({ad: 'talep-mesaj', etiket: 'Mesajın', yer: 'Ne oldu, hangi ekranda, ne zaman?', deger: t.mesaj, cokSatir: true, zorunlu: true, hata: h.mesaj})}${DD.dosyaAlan({ad: 'talep-dosya', yardim: 'Ekran görüntüsü ya da belge: JPG, PNG, WebP veya PDF · en çok 5 MB · mesaj başına tek dosya.'})}${DD.gizlilikBant('Tahlil belgesi, kart numarası gibi **hassas bilgileri** mesaja yazma.')}${DD.btn({metin: 'Talebi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'talep-gonder'}})}</div>`;
  const yeniPanel = ctx => {
    if (!DD.uye()) return misafirKapi('Talep açmak için giriş yap', 'Destek talebi **hesabına bağlı** açılır. Hızlı bir öneri ya da şikâyet için **Öneri ve şikâyet** sekmesini kullanabilirsin.');
    ctx.yeni ||= {t: {konu: U().talepKonulari.includes(ctx.sorgu.konu) ? ctx.sorgu.konu : '', baglam: '', baslik: '', mesaj: ''}, h: {}};
    return yeniForm(ctx.yeni.t, ctx.yeni.h);
  };
  // Formu doğrular ve gönderir; hata varsa alanların altında gösterir, başarılıysa yeni talebin id'sini döner.
  const talepGonder = (kok, ctx) => {
    const y = kok.querySelector('[data-yuva="yeni"]'), f = y.querySelector('[data-talep-form]'), sec = ad => f.querySelector(`[data-ad="${ad}"] [aria-pressed="true"]`)?.dataset.cip || '';
    const t = ctx.yeni.t;
    Object.assign(t, {konu: sec('talep-konu'), baglam: sec('talep-baglam'), baslik: f.querySelector('[name="talep-baslik"]').value, mesaj: f.querySelector('[name="talep-mesaj"]').value});
    const baslik = t.baslik.trim(), mesaj = t.mesaj.trim();
    const h = {konu: t.konu ? '' : 'Bir konu seç.', baslik: !baslik ? 'Başlığı yaz.' : baslik.length < 3 ? 'Başlık en az 3 karakter olmalı.' : '', mesaj: !mesaj ? 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.' : mesaj.length < 10 ? 'Mesajın en az 10 karakter olmalı.' : ''};
    Object.keys(h).forEach(k => { if (!h[k]) delete h[k]; });
    ctx.yeni.h = h;
    if (Object.keys(h).length) { y.innerHTML = yeniForm(t, h); hatayaGit(kok, y); DD.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true}); return null; }
    const id = `DD-2026-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    yaz([{id, baslik, konu: t.konu, durum: 'acik', tarih: DD.bugunIso(), mesajlar: [{kim: 'ben', tarih: DD.bugunIso(), saat: simdiSaat(), metin: t.baglam ? `${mesaj}\nİlgili kayıt: ${t.baglam}` : mesaj}]}, ...talepler(ctx)]);
    ctx.yeni = null;
    return id;
  };

  // ---------- Öneri ve şikâyet ----------
  const O = () => U().oneri;
  const EPOSTA = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  // Üye bilgisi: Ayarlar'da değiştirildiyse o, yoksa hesap verisi (ayarlar.js kisi() ile aynı sıra). Misafirde boş.
  const kisi = () => {
    if (!DD.uye()) return {ad: '', soyad: '', eposta: '', telefon: ''};
    const p = DD.durum.oku('hesap-ayar', {}).profil || {}, k = {...(DD.yeniHesap() ? {} : DDV.kullanici), ...(DD.durum.oku('plan', null) || {})};
    return {ad: p.ad ?? k.ad ?? '', soyad: p.soyad ?? k.soyad ?? '', eposta: p.eposta ?? k.eposta ?? '', telefon: p.telefon ?? (DD.yeniHesap() ? '' : DDV.hesap?.varsayilan?.profil?.telefon) ?? ''};
  };
  const oneriTaslak = () => ({...kisi(), tur: '', alan: '', mesaj: '', kvkk: false});
  const oneriDogrula = t => {
    const ep = t.eposta.trim(), m = t.mesaj.trim(), h = {
      ad: t.ad.trim() ? '' : 'Adını yaz.', soyad: t.soyad.trim() ? '' : 'Soyadını yaz.',
      eposta: !ep ? 'E‑posta adresini yaz; cevabı bu adrese göndeririz.' : EPOSTA.test(ep) ? '' : 'Geçerli bir e‑posta adresi yaz (ad@site.com).',
      telefon: !t.telefon || /^5\d{9}$/.test(t.telefon) ? '' : 'Başında 0 olmadan 10 haneli cep numaranı yaz.',
      tur: t.tur ? '' : 'Öneri mi şikâyet mi, birini seç.', alan: t.alan ? '' : 'Hangi alanla ilgili, seç ki doğru ekibe ulaşsın.',
      mesaj: !m ? 'Mesaj alanı boş; ne olduğunu birkaç cümleyle anlat.' : m.length < O().mesajEnAz ? `En az ${O().mesajEnAz} karakter yaz.` : '',
      kvkk: t.kvkk ? '' : 'Göndermek için onay kutusunu işaretle.'
    };
    Object.keys(h).forEach(k => { if (!h[k]) delete h[k]; });
    return h;
  };
  const oneriForm = (t, h) => `<div class="dd-yigin" data-oneri-form>${DD.p('Yıldız (*) ile işaretli alanlar zorunlu. Cevabımız **e‑posta adresine** gelir.', {ton: 'ikincil'})}${DD.input({ad: 'o-ad', etiket: 'Ad', yer: 'Adın', otomatik: 'given-name', deger: t.ad, zorunlu: true, hata: h.ad})}${DD.input({ad: 'o-soyad', etiket: 'Soyad', yer: 'Soyadın', otomatik: 'family-name', deger: t.soyad, zorunlu: true, hata: h.soyad})}${DD.input({ad: 'o-eposta', etiket: 'E‑posta', ikon: 'envelope', tur: 'email', mod: 'email', otomatik: 'email', yer: 'ad@site.com', deger: t.eposta, zorunlu: true, hata: h.eposta})}${DD.telefon({ad: 'o-telefon', ulkeAd: 'o-telefon-ulke', etiket: 'Telefon', deger: t.telefon, opsiyonel: true, hata: h.telefon})}${DD.alan({etiket: 'Türü', zorunlu: true, hata: h.tur, html: DD.cipler({ad: 'o-tur', tur: 'tek', serit: false, etiket: 'Türü', secili: t.tur, ogeler: O().turler.map(x => ({metin: x, deger: x, kucuk: true}))})})}${DD.secAlan({ad: 'o-alan', etiket: 'İlgili alan', secenekler: O().alanlar.map(x => [x, x]), deger: t.alan, yer: 'Seç', hata: h.alan, yardim: h.alan ? '' : 'Alan seçimi mesajı ilgili ekibe yönlendirir.'})}${DD.input({ad: 'o-mesaj', etiket: 'Mesajın', yer: 'Önerini ya da şikâyetini buraya yazabilirsin', deger: t.mesaj, cokSatir: true, zorunlu: true, hata: h.mesaj, yardim: h.mesaj ? '' : `En az ${O().mesajEnAz}, en çok ${DD.sayi(O().mesajEnCok)} karakter.`})}${DD.alan({etiket: 'Kişisel veriler', zorunlu: true, hata: h.kvkk, html: `<div class="dd-yigin-8">${DD.checkbox({ad: 'o-kvkk', etiket: 'KVKK Metni’ni ve Aydınlatma Metni’ni okudum, onaylıyorum.', secili: t.kvkk})}${DD.btn({metin: 'Aydınlatma Metni’ni oku', ikon: 'file-lines', tur: 'text', boyut: 'sm', git: '#/yasal/kvkk'})}</div>`})}${DD.btn({metin: 'Gönder', ikon: 'gonder', tam: true, veri: {eylem: 'oneri-gonder'}})}</div>`;
  const oneriTamam = () => DD.bos({ikon: 'circle-check', baslik: 'Mesajın bize ulaştı', metin: 'Teşekkürler! Cevabımız **e‑posta adresine** gelir.', eylem: {metin: 'Forma dön', tur: 'secondary', veri: {eylem: 'oneri-yeni'}}});
  const oneriPanel = ctx => {
    if (!ctx.oneri) {
      ctx.oneri = {t: oneriTaslak(), h: {}, tamam: ctx.sorgu.hal === 'tamam'};
      if (ctx.sorgu.hal === 'form-hata') { const t = ctx.oneri.t; t.eposta = t.eposta ? t.eposta.replace(/\.[^.]+$/, '') : 'ad@site'; ctx.oneri.h = oneriDogrula(t); }
    }
    return ctx.oneri.tamam ? oneriTamam() : oneriForm(ctx.oneri.t, ctx.oneri.h);
  };

  // ---------- Talep detayı ----------
  const detayCiz = t => {
    const kapali = t.durum === 'kapali' || t.durum === 'cozulen';
    let gun = '';
    const yazisma = t.mesajlar.map(m => { const g = tarihMetin(m.tarih), ayrac = g !== gun ? DD.gunAyrac(g) : ''; gun = g; return ayrac + DD.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: 'D', metin: m.metin.replace(/\n/g, ' · '), saat: m.saat}); }).join('');
    const bas = `<div class="dd-yigin-12"><div class="dd-ara"><span class="dd-t-meta dd-ton-ikincil">${DD.esc(t.id)}</span>${rozet(t.durum)}</div><h2 class="dd-t-section">${DD.esc(t.baslik)}</h2>${DD.kunye([{ikon: 'tag', etiket: 'Konu', deger: t.konu}, {ikon: 'takvim', etiket: 'Açılış', deger: DD.tarihUzun(t.tarih)}, {ikon: 'comments', etiket: 'Mesaj', deger: String(t.mesajlar.length)}])}</div>`;
    const durum = kapali
      ? `<div class="dd-yigin-12">${DD.bant({ton: 'bilgi', ikon: 'lock', metin: 'Bu talep kapandı. Sorun sürüyorsa **yeniden açabilir** ya da yeni talep oluşturabilirsin.'})}${DD.btn({metin: 'Talebi yeniden aç', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'yeniden-ac'}})}</div>`
      : `<div class="dd-yigin-12">${t.durum === 'yanit' ? DD.bant({ton: 'uyari', ikon: 'reply', metin: 'Destek ekibi **senden yanıt bekliyor**. Aşağıdan yazabilirsin.'}) : DD.p('Destek ekibi talepleri **sırayla** yanıtlar.', {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Sorunum çözüldü', ikon: 'circle-check', tur: 'tonal', tam: true, veri: {eylem: 'cozuldu'}})}</div>`;
    return DD.gruplar([{baslik: 'Yazışma', html: `<div class="dd-yigin-12">${yazisma}</div>`}, {html: durum}], {bas});
  };

  // Öneri formu bağları: alan düzeltilince hata kalkar (Gastro alanHata), gönderimde doğrulama, DD.mesgul, DD.durum'a yazım, sonuç hali.
  const oneriBagla = (kok, ctx) => {
    const y = kok.querySelector('[data-yuva="oneri"]');
    if (!y) return [];
    const cizO = () => { y.innerHTML = oneriPanel(ctx); const m = y.querySelector('[name="o-mesaj"]'); if (m) m.maxLength = O().mesajEnCok; };
    cizO();
    const oku = () => {
      const t = ctx.oneri.t, v = ad => y.querySelector(`[name="${ad}"]`)?.value ?? '';
      Object.assign(t, {ad: v('o-ad'), soyad: v('o-soyad'), eposta: v('o-eposta'), telefon: v('o-telefon'), alan: v('o-alan'), mesaj: v('o-mesaj'), kvkk: !!y.querySelector('[name="o-kvkk"]')?.checked});
    };
    const girdi = ev => hataKaldir(ev.target);
    y.addEventListener('input', girdi);
    y.addEventListener('change', girdi);
    return [
      () => { y.removeEventListener('input', girdi); y.removeEventListener('change', girdi); },
      DD.on(kok, 'o-tur', (v, _d, ev) => { ctx.oneri.t.tur = v || ''; hataKaldir(ev.target); }),
      DD.on(kok, 'o-alan', (v, _d, ev) => { ctx.oneri.t.alan = v; hataKaldir(ev.target); }),
      DD.eylem(kok, 'oneri-yeni', () => { ctx.oneri = {t: oneriTaslak(), h: {}, tamam: false}; cizO(); }),
      DD.eylem(kok, 'oneri-gonder', el => {
        oku();
        ctx.oneri.h = oneriDogrula(ctx.oneri.t);
        if (Object.keys(ctx.oneri.h).length) {
          cizO();
          hatayaGit(kok, y);
          DD.toast('**Eksik alanları** kontrol et', {tur: 'hata', yerine: true});
          return;
        }
        DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 2).then(() => {
          const t = ctx.oneri.t;
          DD.durum.yaz('oneri-gonderimleri', [{id: `O-${Date.now().toString(36).toUpperCase()}`, tarih: DD.bugunIso(), saat: simdiSaat(), uye: DD.uye(), ad: t.ad.trim(), soyad: t.soyad.trim(), eposta: t.eposta.trim(), telefon: t.telefon || null, tur: t.tur, alan: t.alan, mesaj: t.mesaj.trim()}, ...DD.durum.oku('oneri-gonderimleri', [])]);
          ctx.oneri.tamam = true;
          cizO();
          kok.querySelector('.dd-kaydir')?.scrollTo({top: 0, behavior: DD.azHareket() ? 'auto' : 'smooth'});
        });
      })
    ];
  };

  let hataGosterildi = false;
  DD.ekran('cozum-merkezi', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: ctx => (ctx.param?.id ? 'Destek talebi' : 'Çözüm Merkezi'),
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (ctx.param?.id) {
        if (!DD.uye()) return misafirKapi('Talebi görmek için giriş yap', 'Destek talepleri **hesabına bağlı**. Giriş yapınca talebin yazışmasını burada görürsün.', true);
        const t = talepler(ctx).find(x => x.id === ctx.param.id);
        return t ? detayCiz(t) : DD.hataEkran({tur: 'bulunamadi', baslik: 'Talep bulunamadı', metin: 'Bu talep silinmiş ya da numarası yanlış olabilir. **Taleplerine dönüp** yeniden bakabilirsin.', eylem: {metin: 'Taleplerime dön', yerine: '#/cozum-merkezi'}});
      }
      ctx.kat ||= U().sss[0].kategori;
      const s = sekme(ctx), acik = talepler(ctx).filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
      const seg = DD.segment({ad: 'cm-sekme', etiket: 'Çözüm Merkezi bölümleri', kaydir: true, secili: s, ogeler: [{ad: 'Sık sorulanlar', deger: 'sss'}, {ad: 'Taleplerim', deger: 'talepler', sayi: acik || null}, {ad: 'Yeni talep', deger: 'yeni'}, {ad: 'Öneri ve şikâyet', deger: 'oneri'}]});
      const panel = (k, html) => `<div data-panel="${k}"${k === s ? '' : ' hidden'}>${html}</div>`;
      return DD.gruplar([
        {html: seg},
        {html: `${panel('sss', sssBolum(ctx))}${panel('talepler', `<div data-yuva="talep">${talepPanel(ctx, ctx.suz)}</div>`)}${panel('yeni', `<div data-yuva="yeni">${yeniPanel(ctx)}</div>`)}${panel('oneri', `<div data-yuva="oneri">${oneriPanel(ctx)}</div>`)}`}
      ], {bas: DD.metinBlok({baslik: 'Çözüm Merkezi', metin: 'Sık sorulanlar, **destek taleplerin**, yeni talep ve öneri kutusu tek adreste.'})});
    },
    altBar: ctx => {
      if (!ctx.param?.id || !DD.uye()) return '';
      const t = talepler(ctx).find(x => x.id === ctx.param.id);
      return t && t.durum !== 'kapali' && t.durum !== 'cozulen' ? DD.mesajGiris({ad: 'yanit', yer: 'Yanıt yaz'}) : '';
    },
    sonra: (kok, ctx) => {
      if (ctx.param?.id) {
        const id = ctx.param.id, t = () => talepler(ctx).find(x => x.id === id);
        if (!DD.uye() || !t()) return undefined;
        const guncelle = f => { yaz(talepler(ctx).map(x => (x.id === id ? f(x) : x))); DD.tazele(); };
        const c = [
          DD.eylem(kok, 'cozuldu', () => { guncelle(x => ({...x, durum: 'cozulen'})); DD.toast('Talep **çözüldü** olarak kapatıldı', {tur: 'basari', ikon: 'circle-check'}); }),
          DD.eylem(kok, 'yeniden-ac', () => { guncelle(x => ({...x, durum: 'acik'})); DD.toast('Talep **yeniden açıldı**', {ikon: 'rotate-left'}); }),
          DD.eylem(kok, 'ek', () => DD.toast('Ekran görüntüsünü **e‑posta yanıtına** ekleyebilirsin; uygulama içinden dosya alınmaz', {ikon: 'ek', yerine: true})),
          DD.eylem(kok, 'ses-mesaj', () => DD.toast('Destek talepleri **yazılı** yanıtlanır', {ikon: 'mikrofon', yerine: true}))
        ];
        const form = kok.querySelector('[data-mesaj]');
        if (form) {
          const gonder = ev => {
            ev.preventDefault();
            const i = form.querySelector('input'), metin = i.value.trim();
            if (metin.length < 3) { DD.toast('Yanıtın **en az 3 karakter** olmalı', {tur: 'hata', yerine: true}); return; }
            guncelle(x => ({...x, durum: 'acik', mesajlar: [...x.mesajlar, {kim: 'ben', tarih: DD.bugunIso(), saat: simdiSaat(), metin}]}));
            DD.toast('Yanıtın talebe **eklendi**', {ikon: 'gonder'});
          };
          form.addEventListener('submit', gonder);
          c.push(() => form.removeEventListener('submit', gonder));
        }
        return () => c.forEach(f => f());
      }
      const ara = kok.querySelector('[name="sss-ara"]'), sss = kok.querySelector('[data-yuva="sss"]'), kat = kok.querySelector('[data-ad="sss-kat"]');
      const araGir = () => { const q = ara.value.trim(); kat.hidden = !!q; sss.innerHTML = sssPanel(ctx.kat, q); };
      ara.addEventListener('input', araGir);
      const sekmeye = k => kok.querySelector(`.dd-seg [data-seg="${k}"]`)?.click();
      // Seçili sekme (ör. ?sekme=oneri) kayan şeritte görünür başlar: yalnız şerit yatay kayar.
      const serit = kok.querySelector('.dd-seg.is-kaydir'), secili = serit?.querySelector('[aria-selected="true"]');
      if (serit && secili) serit.scrollLeft = Math.max(0, serit.scrollLeft + secili.getBoundingClientRect().left - serit.getBoundingClientRect().left - (serit.clientWidth - secili.offsetWidth) / 2);
      const talepCiz = () => { kok.querySelector('[data-yuva="talep"]').innerHTML = talepPanel(ctx, ctx.suz); };
      const c = [
        () => ara.removeEventListener('input', araGir),
        DD.on(kok, 'cm-sekme', v => { ctx.sekme = v; kok.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== v; }); }),
        DD.eylem(kok, 'yeni-talep', () => sekmeye('yeni')),
        DD.eylem(kok, 'talep-tumu', () => { ctx.suz = null; talepCiz(); }),
        DD.on(kok, 'talep-suz', v => { ctx.suz = v || null; talepCiz(); }),
        DD.on(kok, 'sss-kat', v => { ctx.kat = v; sss.innerHTML = sssPanel(v); }),
        DD.on(kok, 'talep-konu', (v, _d, ev) => { hataKaldir(ev.target); if (ctx.yeni) { ctx.yeni.t.konu = v; ctx.yeni.t.baglam = ''; } kok.querySelector('[data-yuva="baglam"]').innerHTML = baglamHtml(v); }),
        (() => { const y = kok.querySelector('[data-yuva="yeni"]'), g = ev => hataKaldir(ev.target); y.addEventListener('input', g); return () => y.removeEventListener('input', g); })(),
        ...oneriBagla(kok, ctx),
        DD.eylem(kok, 'talep-gonder', () => {
          const id = talepGonder(kok, ctx);
          if (!id) return;
          ctx.sekme = 'talepler';
          ctx.suz = null;
          DD.tazele();
          DD.toast(`**${id}** numaralı talebin açıldı`, {tur: 'basari', ikon: 'inbox', eylem: 'Aç', onEylem: () => DD.git(`#/talep/${id}`)});
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
