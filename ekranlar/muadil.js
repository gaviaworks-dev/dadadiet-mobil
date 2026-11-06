/* SCR-41 Muadil bulucu (#/denge/muadil, ?besin=slug). Referans: Yuka eski → yeni satırı, Open Food Facts kategori listesi (tasks/referanslar.md Denge).
 * Sol besin nötr kalır, yalnız muadilin üstün olduğu satır vurgulanır; kırmızı çarpı yok. Kürasyon DDV.denge.muadiller; yoksa besin.muadil[] aynı gramdan türetilir.
 * Kayıt Tabağım üzerinden gider (tasks/ekran-sozlesme.md). #/denge/muadil?hal=hata hata hali.
 */
(() => {
  const {sayi} = DD;
  let hataGosterildi = false, grup = null, besin = null;
  const kisaAd = ad => ad.split(' (')[0];
  const MAKRO = ['P', 'K', 'Y', 'Lif'];

  // ---------- Veri ----------
  const gruplar = () => DDV.denge.muadiller;
  const ilkPorsiyon = b => b.porsiyonlar.find(p => p.birim !== 'gram') || {etiket: '100 g', gram: 100};
  const olcekli = (b, gram, porsiyon) => ({slug: b.slug, ad: b.ad, porsiyon, gram, gorsel: b.gorsel, kcal: Math.round(b.kcal * gram / 100), ...Object.fromEntries(MAKRO.map(m => [m, Math.round(b[m] * gram / 10) / 10]))});
  const gerekce = (a, b) => {
    const l = [b.kcal < a.kcal && 'daha az kalori', b.Lif > a.Lif && 'daha çok lif', b.Y < a.Y && 'daha az yağ', b.P > a.P && 'daha çok protein'].filter(Boolean).slice(0, 2);
    return l.length ? `Aynı ölçüde ${l.join(', ')}.` : 'Aynı ölçüde benzer besin değeri.';
  };
  const turet = (b, slug) => {
    const m = DDV.besinBul(slug); if (!m) return null;
    const p = ilkPorsiyon(b), kaynak = olcekli(b, p.gram, p.etiket), muadil = olcekli(m, p.gram, `${sayi(p.gram)} g`);
    return {kaynak, muadil, kcalFark: muadil.kcal - kaynak.kcal, gerekce: gerekce(kaynak, muadil)};
  };
  const secenekler = () => {
    if (!besin) return (gruplar().find(g => g.baslik === grup) || gruplar()[0]).secenekler;
    const l = gruplar().flatMap(g => g.secenekler).filter(s => s.kaynak.slug === besin);
    return l.length ? l : (DDV.besinBul(besin)?.muadil || []).map(s => turet(DDV.besinBul(besin), s)).filter(Boolean);
  };
  const tabakKaydi = b => {
    const m = String(b.porsiyon).match(/^(\d+)(?:-\d+)?\s+(.+)$/);
    return {slug: b.slug, ad: b.ad, miktar: m ? +m[1] : 1, birim: m ? m[2] : b.porsiyon, gram: b.gram, kcal: b.kcal, P: b.P, K: b.K, Y: b.Y, Lif: b.Lif || 0, gorsel: b.gorsel};
  };

  // ---------- Kart ----------
  const farkRozet = f => (Math.abs(f) <= 5
    ? DD.durumRozet({metin: 'Kalorisi yakın', ton: 'notr', ikon: 'scale-balanced'})
    : f < 0 ? DD.durumRozet({metin: `${sayi(-f)} kcal daha az`, ton: 'basari', ikon: 'onay'}) : DD.durumRozet({metin: `${sayi(f)} kcal daha fazla`, ton: 'notr', ikon: 'bilgi'}));
  const satirlar = s => [
    {ad: 'Porsiyon', a: s.kaynak.gram, b: s.muadil.gram, birim: 'g'},
    {ad: 'Enerji', a: s.kaynak.kcal, b: s.muadil.kcal, birim: 'kcal', iyi: s.muadil.kcal < s.kaynak.kcal ? 'az' : null},
    {ad: 'Protein', a: s.kaynak.P, b: s.muadil.P, birim: 'g', iyi: s.muadil.P > s.kaynak.P ? 'cok' : null},
    {ad: 'Lif', a: s.kaynak.Lif, b: s.muadil.Lif, birim: 'g', iyi: s.muadil.Lif > s.kaynak.Lif ? 'cok' : null}
  ];
  const kart = (s, i) => `<div class="dd-yigin-12">${DD.kiyasTablo({a: s.kaynak, b: s.muadil, satirlar: satirlar(s)})}${DD.p(`**${kisaAd(s.muadil.ad)}:** ${s.gerekce}`)}<div class="dd-ara">${farkRozet(s.kcalFark)}${DD.btn({metin: 'Günlüğe ekle', ikon: 'ekle', tur: 'tonal', boyut: 'sm', veri: {eylem: 'ekle', id: i}})}</div></div>`;
  const sonuc = () => {
    const l = secenekler();
    const baslik = besin ? `<div class="dd-ara"><span class="dd-t-card">${DD.esc(kisaAd(DDV.besinBul(besin)?.ad || ''))} için</span>${DD.btn({metin: 'Temizle', tur: 'text', veri: {eylem: 'temizle'}})}</div>` : '';
    if (!l.length) return `<div class="dd-yigin">${baslik}${DD.bos({ikon: 'right-left', baslik: 'Kayıtlı muadil yok', metin: 'Bu besin için henüz **önerilen bir muadil** bulunmuyor. Başka bir besinle yan yana koyabilirsin.', eylem: {metin: 'Kıyasla', ikon: 'code-compare', git: `#/denge/kiyasla?a=${besin}`}})}</div>`;
    return `<div class="dd-yigin-24">${baslik}${l.map(kart).join('')}</div>`;
  };
  const cipler = () => DD.cipler({ad: 'grup', tur: 'tek', etiket: 'Besin grupları', secili: besin ? '' : grup, ogeler: gruplar().map(g => ({metin: g.baslik, deger: g.baslik, ikon: g.ikon, sayi: g.secenekler.length}))});

  DD.ekran('muadil', {
    tur: 'alt',
    nav: 'denge',
    ust: '#/denge',
    baslik: 'Muadil bulucu',
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (!grup) { grup = gruplar()[0].baslik; besin = ctx.sorgu.besin || null; }
      return `<div class="dd-ic dd-yigin">${DD.p('Sevdiğin besini **bırakmadan** aynı rolü üstlenen bir seçenek bul.', {ton: 'ikincil'})}${DD.arama({ad: 'muadil-ara', yer: 'Besin ara'})}${cipler()}<div data-yuva="sonuc">${sonuc()}</div></div>`;
    },
    sonra: kok => {
      const guncelle = () => { kok.querySelector('.dd-serit').outerHTML = cipler(); kok.querySelector('[data-yuva="sonuc"]').innerHTML = sonuc(); };
      DD.aramaKur(kok.querySelector('.dd-arama'), {
        kaynak: q => { const n = DD.katla(q); return DDV.besinler.filter(b => DD.katla(b.ad).includes(n)).map(b => ({baslik: b.ad, alt: b.kategori, sol: DD.gorsel({src: b.gorsel, ad: b.ad, ton: DD.makroTon(b)}), slug: b.slug})); },
        bosMetin: 'Bu ada uyan **bir besin** bulamadık. Daha kısa yazmayı dene.',
        sec: x => { besin = x.slug; const g = kok.querySelector('.dd-arama input'); g.value = ''; g.dispatchEvent(new Event('input', {bubbles: true})); guncelle(); }
      });
      const baglar = [
        DD.on(kok, 'grup', v => { if (v) { grup = [].concat(v)[0]; besin = null; guncelle(); } }),
        DD.eylem(kok, 'temizle', () => { besin = null; guncelle(); }),
        DD.eylem(kok, 'ekle', el => { const s = secenekler()[+el.dataset.id]; DD.tabagim.ekle(tabakKaydi(s.muadil)); DD.toast(`**${kisaAd(s.muadil.ad)}** Tabağım'a eklendi`, {tur: 'basari'}); })
      ];
      return () => baglar.forEach(c => c());
    }
  });
})();
