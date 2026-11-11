/* Sağlık testleri (#/testler, #/test/:slug). İçerik web'den gelir (veri/testler.js). Beslenme testi burada çözülür; diğerleri canlı sitede açılır.
 * Misafir sonucu görür, kaydetmek için üye olur. Durum: 'test-sonuclari' {slug:{puan, baslik, tarih}}, sonuç Sağlık dosyam'da görünür.
 * Grup süzgeci web test listesinin sekmeleri: Tümü · Sağlık & Beslenme · Eğlence & Bilgi Yarışması (sayılar web toplamı DDV.testler.gruplar; liste yerel kayıtları süzer).
 *   #/testler?grup=saglik|eglence grubu açar (web ?grup= ile aynı değerler).
 */
(() => {
  const {esc} = DD;
  const T = () => DDV.testler, ANAHTAR = 'test-sonuclari';
  const webLink = s => `https://dadadiet.com/test/${s}`;
  const sonuc = (d, p) => d.sonuclar.find(x => p >= x.min_puan && p <= x.max_puan) || d.sonuclar[d.sonuclar.length - 1];

  const GRUP_SLUG = {'Sağlık & Beslenme': 'saglik', 'Eğlence & Bilgi Yarışması': 'eglence'};
  const grupIkon = ad => (ad.startsWith('Sağlık') ? 'heart-pulse' : 'face-grin-stars');
  const grupSec = ctx => { const g = ctx.grup ?? ctx.sorgu.grup ?? ''; return (T().gruplar || []).some(x => GRUP_SLUG[x.ad] === g) ? g : ''; };
  const grupCip = secili => DD.cipler({ad: 'test-grup', tur: 'tek', etiket: 'Test grupları', secili, ogeler: [{metin: 'Tümü', deger: '', ikon: 'layer-group', sayi: T().toplam}, ...(T().gruplar || []).map(g => ({metin: g.ad, deger: GRUP_SLUG[g.ad], ikon: grupIkon(g.ad), sayi: g.sayi}))]});

  const liste = ctx => {
    const kayit = DD.durum.oku(ANAHTAR, {}), g = grupSec(ctx), grupAd = (T().gruplar || []).find(x => GRUP_SLUG[x.ad] === g)?.ad;
    const l = T().liste.filter(t => !grupAd || t.grup === grupAd);
    const gSayi = (T().gruplar || []).find(x => x.ad === grupAd)?.sayi;
    // Uygulamada testlerin bir kısmı var; grup sayısı web toplamı. Fark açıkça yazılır.
    const not_ = grupAd && gSayi > l.length ? DD.veriYok(`Bu gruptaki **${gSayi} testin ${l.length} tanesi** burada; tamamı dadadiet.com’da.`) : '';
    const govde = l.length ? DD.yuzey(DD.satirlar(l.map(t => ({ikon: 'clipboard-check', baslik: t.ad, alt: kayit[t.slug] ? `Sonucun: ${kayit[t.slug].baslik}` : `${t.soru_sayisi} soru`, ...(t.slug === T().detay.slug ? {git: `#/test/${t.slug}`} : {veri: {eylem: 'web-test', id: t.slug}})})))) : DD.bos({ikon: 'clipboard-list', baslik: 'Bu grupta test yok', metin: 'Başka bir **test grubuna** göz at.', eylem: {metin: 'Tüm testler', tur: 'secondary', veri: {eylem: 'grup-sifirla'}}});
    return DD.bolumler([
      `<div class="dd-yigin-8"><h1 class="dd-t-section">${T().toplam} Sağlık Testi</h1>${DD.p('Alışkanlıklarını ölç, sonucunu **Sağlık dosyanda** sakla. Testler teşhis koymaz.', {ton: 'ikincil'})}</div>`,
      {baslik: grupAd || 'Testler', html: `<div class="dd-yigin-12">${grupCip(g)}${govde}${not_}${DD.btn({metin: `Tüm ${T().toplam} testi gör`, tur: 'secondary', tam: true, veri: {eylem: 'web-test', id: ''}})}</div>`}
    ]);
  };
  const soruHtml = (d, ctx) => {
    const q = d.sorular[ctx.i];
    return `<div class="dd-ic dd-yigin">${DD.ilerleme({n: ctx.i + 1, hedef: d.sorular.length, etiket: `Soru ${ctx.i + 1}`, deger: `${d.sorular.length} soru`})}<h1 class="dd-t-section">${esc(q.soru)}</h1>${DD.satirlar(q.secenekler.map((s, i) => ({baslik: s.metin, veri: {eylem: 'yanit', id: i}})))}</div>`;
  };
  const sonucHtml = (d, ctx) => {
    const r = sonuc(d, ctx.puan), en = d.sonuclar[d.sonuclar.length - 1].max_puan;
    return `<div class="dd-ic dd-yigin">${DD.kart({html: `<div class="dd-yigin-8"><span class="dd-t-meta dd-ton-ikincil">${ctx.puan} / ${en} puan</span><h1 class="dd-t-section">${esc(r.baslik)}</h1>${DD.p(r.aciklama)}</div>`})}${DD.uye() ? DD.btn({metin: 'Sağlık dosyamda gör', ikon: 'file-medical', tam: true, git: '#/saglik'}) : DD.kanca({metin: 'Sonucumu Sağlık Dosyama kaydet ve uzmana ilet', ikon: 'file-medical'})}${DD.btn({metin: 'Yeniden çöz', tur: 'text', tam: true, veri: {eylem: 'bastan'}})}${DD.bant({metin: 'Bu test **bilgilendirme** amaçlıdır, teşhis koymaz.'})}</div>`;
  };

  DD.ekran('testler', {
    iskelet: 'liste',
    bos: {ikon: 'clipboard-list', baslik: 'Test bulunamadı', metin: 'Bu başlıkta henüz test yok. **Diğer testlere** göz at.', eylem: {metin: 'Tüm testler', ikon: 'tumu', yerine: '#/testler'}},   // ?hal=bos (ortak DD.bos)
    tur: 'alt',
    ust: '#/bugun',
    baslik: 'Sağlık Testleri',
    ciz: ctx => {
      if (!ctx.param?.slug) return liste(ctx);
      const d = T().detay;
      ctx.i ??= 0;
      return ctx.bitti ? sonucHtml(d, ctx) : soruHtml(d, ctx);
    },
    sonra: (kok, ctx) => {
      // Seçili grup çipi şeritte görünür kalsın (programlar.js kalıbı).
      { const r = kok.querySelector('[data-ad="test-grup"]'), b = r?.querySelector('[aria-pressed=true]'); if (b) r.scrollLeft += b.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - b.offsetWidth) / 2; }
      const d = T().detay, c = [
        DD.eylem(kok, 'web-test', el => window.open(el.dataset.id ? webLink(el.dataset.id) : 'https://dadadiet.com/testler', '_blank', 'noopener')),
        DD.eylem(kok, 'yanit', el => {
          ctx.puan = (ctx.puan || 0) + d.sorular[ctx.i].secenekler[+el.dataset.id].puan;
          if (ctx.i + 1 < d.sorular.length) { ctx.i += 1; DD.tazele(); return; }
          ctx.bitti = true;
          if (DD.uye()) DD.durum.yaz(ANAHTAR, {...DD.durum.oku(ANAHTAR, {}), [d.slug]: {puan: ctx.puan, baslik: sonuc(d, ctx.puan).baslik, tarih: DD.bugunIso()}});
          DD.tazele();
        }),
        DD.on(kok, 'test-grup', v => { ctx.grup = v || ''; DD.tazele(); }),
        DD.eylem(kok, 'grup-sifirla', () => { ctx.grup = ''; DD.tazele(); }),
        DD.eylem(kok, 'bastan', () => { ctx.i = 0; ctx.puan = 0; ctx.bitti = false; DD.tazele(); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
