/* Tarif detay (#/tarif/:slug): Gastro detay-v2. Web karşılığı tarif/<slug> (public-beslenme-tarif.js): giriş, malzemeler, nasıl yapılır,
 * alerjen notu, ipucu, neler değişti, besin değerleri (klasik tarifle kıyas), kategori ve benzer tarifler.
 * Veri DDV.yemekler (1 porsiyon) + DDV.kutuphane.tarifler[slug] (34 tarifte malzeme ve adım). Adımı olmayan tarifte yalnız değerler, porsiyon ve Öğüne ekle: tarif adımı uydurulmaz.
 * Durum: 'kayitli-tarifler' (slug listesi; varsayılan DDV.uye.kayitli.tarifler, yeni hesapta []), 'tabagim-ogun' (Öğüne ekle hedefi, besin-ara ile aynı).
 * Kayıt yazmaz: yalnız Tabağım'a ekler. ?hal=hata bağlantı hatası. */
(() => {
  const MAKRO = ['P', 'K', 'Y', 'Lif'];
  const MAD = {P: 'Protein', K: 'Karbonhidrat', Y: 'Yağ', Lif: 'Lif'};
  const ETIKET_IKON = {Vegan: 'leaf', Vejetaryen: 'seedling', 'Glütensiz': 'wheat-awn-circle-exclamation'};
  const bul = slug => DDV.yemekler.find(y => y.slug === slug);
  const detay = slug => DDV.kutuphane?.tarifler?.[slug] || null;
  const kayitlar = () => DD.durum.oku('kayitli-tarifler', DD.yeniHesap() ? [] : (DDV.uye?.kayitli?.tarifler || []));
  const hedefMakro = () => DD.durum.oku('plan', null)?.makro || (DD.yeniHesap() ? null : DDV.kullanici.makroHedef);
  const ogunAd = v => (DDV.kutuphane?.tarifOgunleri || []).find(o => o.deger === v);
  // Vurgu: ilk yan cümle, uzunsa ilk üç kelime.
  const ilkCumle = s => { const i = s.search(/[;,.:]/), bas = i > 0 ? s.slice(0, i) : s, k = bas.split(' '); return k.length > 5 ? `**${k.slice(0, 3).join(' ')}** ${s.slice(k.slice(0, 3).join(' ').length + 1)}` : `**${bas}**${s.slice(bas.length)}`; };
  const g1 = n => `${DD.ondalik(n, 1)} g`;
  const bolum = (baslik, sag, html) => `<section class="dd-yigin-12">${DD.bas(baslik, sag ? {html: `<span class="dd-t-meta dd-ton-ikincil">${DD.esc(sag)}</span>`} : null)}${html}</section>`;

  // ---------- Malzemeler ----------
  const olcekle = (miktar, carpan) => {
    if (!miktar || carpan === 1) return miktar || null;
    const m = miktar.match(/^([\d.,]+)\s*(.*)$/);
    if (!m) return miktar;
    const n = parseFloat(m[1].replace(',', '.')) * carpan;
    return `${DD.ondalik(n >= 10 ? Math.round(n) : n, 1)} ${m[2]}`.trim();
  };
  const malzemeSatir = (s, carpan) => {
    const b = s.besin ? DDV.besinler.find(x => x.slug === s.besin) : null;
    return DD.satir({sol: DD.gorsel({src: b?.gorsel || null, ad: s.ad, ton: b ? DD.makroTon(b) : 'primary'}), baslik: s.ad, alt: s.not || null, deger: olcekle(s.miktar, carpan), git: b ? `#/besin/${b.slug}` : undefined, ok: !!b});
  };
  const malzemeler = (y, t, kisi) => {
    const c = kisi / y.kisi;
    const gruplar = t.malzemeGruplari.map(g => `<section class="dd-yigin-8">${g.ad ? DD.bas(g.ad) : ''}${DD.yuzey(DD.satirlar(g.satirlar.map(s => malzemeSatir(s, c))))}</section>`).join('');
    const not = kisi === y.kisi ? `Gramlar **${y.kisi} kişilik** tarife göre. Kişi sayısını değiştirirsen yeniden hesaplanır.` : `Gramlar **${kisi} kişiye** göre yeniden hesaplandı; ev ölçüleri ${y.kisi} kişilik tarife aittir.`;
    return `<div class="dd-yigin-24">${gruplar}${DD.p(not, {ton: 'ikincil', meta: true})}</div>`;
  };
  const malzemePane = (y, t, kisi) => `<div class="dd-ara"><span class="dd-t-card">Kaç kişilik?</span>${DD.stepper({ad: 'kisi', deger: kisi, min: 1, max: 12, birim: 'kişi', aria: 'Kişi sayısı'})}</div><div data-yuva="malzeme">${malzemeler(y, t, kisi)}</div>`;

  // ---------- Yapılış ----------
  const yapilis = t => {
    const adimlar = t.adimlar.map((a, i) => `<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">${i + 1}. adım</span>${DD.p(ilkCumle(a))}</div>`).join('');
    return `<div class="dd-yigin-24">${adimlar}</div>${t.ipucu ? DD.ipucu({ikon: 'ipucu', baslik: 'İpucu', metin: ilkCumle(t.ipucu)}) : ''}${t.nelerDegisti ? DD.bant({ton: 'basari', ikon: 'muadil', baslik: 'Neler değişti', metin: ilkCumle(t.nelerDegisti)}) : ''}${t.alerjen ? DD.bant({ton: 'uyari', baslik: 'Alerjen notu', metin: ilkCumle(t.alerjen)}) : ''}`;
  };

  // ---------- Besin değeri ----------
  const degerler = (y, t) => {
    const h = hedefMakro();
    const ust = h ? DD.makroCubuk(Object.fromEntries(MAKRO.map(m => [m, {alinan: y[m] || 0, hedef: h[m]}]))) : '';
    const satirlar = [DD.satir({baslik: 'Kalori', deger: `${DD.sayi(y.porsiyonKcal)} kcal`, ok: false}), ...MAKRO.filter(m => y[m] != null).map(m => DD.satir({baslik: MAD[m], deger: g1(y[m]), ok: false}))];
    const kiyas = t?.klasikKcal ? DD.bant({ton: 'basari', ikon: 'kalori', baslik: 'Klasik tarifle', metin: `Klasik tarif porsiyonu **≈ ${DD.sayi(t.klasikKcal)} kcal**, bu tarif **≈ ${DD.sayi(y.porsiyonKcal)} kcal**.`}) : '';
    const not = t ? ilkCumle(`${t.hesapToplam}. ${t.hesapNot}`) : `Değerler **1 porsiyon** içindir; tarif ${y.kisi} kişiliktir.`;
    return bolum('Besin değerleri', '1 porsiyon', `${ust}${DD.yuzey(DD.satirlar(satirlar))}${kiyas}${DD.p(not, {ton: 'ikincil', meta: true})}`);
  };

  // ---------- Kuyruk ----------
  const benzerler = (y, t) => {
    const l = (t?.benzer || []).map(bul).filter(Boolean);
    const ek = DDV.yemekler.filter(x => x.kategori === y.kategori && x.slug !== y.slug && !l.includes(x));
    return [...l, ...ek].slice(0, 6);
  };
  const kunye = (y, t) => [
    {ikon: 'layer-group', etiket: 'Kategori', deger: y.kategori},
    {ikon: 'users', etiket: 'Porsiyon', deger: `${y.kisi} kişilik`},
    t?.hazirlikDk != null && {ikon: 'saat', etiket: 'Hazırlık', deger: DD.sure(t.hazirlikDk)},
    t?.pisirmeDk ? {ikon: 'fire-burner', etiket: 'Pişirme', deger: DD.sure(t.pisirmeDk)} : null,
    {ikon: 'hourglass-half', etiket: 'Toplam süre', deger: DD.sure(y.sureDk)},
    t?.zorluk && {ikon: 'yildiz', etiket: 'Zorluk', deger: t.zorluk},
    t?.yayin && {ikon: 'takvim', etiket: 'Yayın', deger: t.yayin}
  ].filter(Boolean);
  const kuyruk = (y, t) => {
    const l = benzerler(y, t);
    return `${DD.kunye(kunye(y, t))}${l.length ? DD.bolum({ic: false, baslik: 'Benzer tarifler', eylem: 'Tümü', git: `#/tarifler?kategori=${encodeURIComponent(y.kategori)}`, html: DD.ikiliSerit(l.map(x => DD.icerikKart({gorsel: x.gorsel, kategori: x.kategori, baslik: x.ad, meta: `${DD.sure(x.sureDk)} · ${DD.sayi(x.porsiyonKcal)} kcal`, git: `#/tarif/${x.slug}`})), 'Benzer tarifler')}) : ''}`;
  };

  // ---------- Öğüne ekle ----------
  const siradaki = () => { const d = DD.durum.oku('bugun-ogun', {}) || {}; return DDV.bugun.ogunler.find(o => o.durum === 'planli' && !d[o.id])?.id || 'ara'; };
  const kalem = (y, f) => ({anahtar: `y:${y.slug}`, slug: y.slug, ad: y.ad, miktar: f, birim: 'porsiyon', gorsel: y.gorsel, kcal: Math.round(y.porsiyonKcal * f), ...Object.fromEntries(MAKRO.map(m => [m, Math.round((y[m] || 0) * f * 10) / 10]))});
  const ogunSheet = y => {
    let ogun = DD.durum.oku('tabagim-ogun', null);
    if (!DDV.bugun.ogunler.some(o => o.id === ogun)) ogun = siradaki();
    let f = 1;
    DD.sheet({
      baslik: 'Öğüne ekle',
      html: `<div class="dd-yigin">${DD.satir({sol: DD.gorsel({src: y.gorsel, ad: y.ad}), baslik: y.ad, alt: `1 porsiyon · ${DD.sayi(y.porsiyonKcal)} kcal`, ok: false})}<div class="dd-yigin-12">${DD.kesirIzgara({ad: 'kesir', secili: 1})}<div class="dd-ara"><span class="dd-t-card">Porsiyon</span><b class="dd-t-stat" data-yuva="kcal">${DD.sayi(y.porsiyonKcal)} kcal</b></div></div><div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Hangi öğünün?</span>${DD.cipler({ad: 'ogun', tur: 'tek', etiket: 'Hedef öğün', serit: false, secili: ogun, ogeler: DDV.bugun.ogunler.map(o => ({metin: o.ad, deger: o.id, ikon: o.ikon}))})}</div></div>`,
      altBar: DD.btn({metin: 'Tabağıma ekle', ikon: 'ekle', tam: true, veri: {eylem: 'tabaga'}}),
      sonra: d => {
        const a = DD.on(d, 'ogun', v => { ogun = [].concat(v)[0] || ogun; });
        const b = DD.on(d, 'kesir', v => { f = +v || 1; d.querySelector('[data-yuva="kcal"]').textContent = `${DD.sayi(Math.round(y.porsiyonKcal * f))} kcal`; });
        const c = DD.eylem(d, 'tabaga', () => {
          DD.durum.yaz('tabagim-ogun', ogun);
          if (!Object.keys(DD.tabagim.meta()).length) DD.tabagim.meta({kaynak: 'arama'});
          DD.tabagim.ekle(kalem(y, f));
          d.kapat();
          DD.titres(8);
          DD.toast(`**${y.ad}** Tabağına eklendi`, {ikon: 'tabak', eylem: 'Aç', onEylem: () => DD.tabagim.ac()});
        });
        return () => { a(); b(); c(); };
      }
    });
  };

  const kayitBoya = (kok, slug) => {
    const on = kayitlar().includes(slug);
    kok.querySelectorAll('[data-eylem="tarif-kaydet"]').forEach(b => {
      b.setAttribute('aria-pressed', on);
      b.querySelector('.icon')?.classList.replace(on ? 'fa-regular' : 'fa-solid', on ? 'fa-solid' : 'fa-regular');
    });
  };
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu tarif burada değil', metin: 'Bağlantı eskimiş olabilir. **Sağlıklı Tarifler**’den benzerini bulabilirsin.', eylem: {metin: 'Tariflere dön', yerine: '#/tarifler'}});

  let hataGosterildi = false;
  DD.ekran('tarif', {
    tur: 'banner',
    nav: 'denge',
    ust: '#/tarifler',
    baslik: ctx => bul(ctx.param.slug)?.ad || 'Tarif',
    iskelet: 'detay',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ustBar: ctx => (bul(ctx.param.slug) ? {sag: [{ikon: 'kaydet', etiket: 'Kaydet', veri: {eylem: 'tarif-kaydet'}}]} : {}),
    ciz: ctx => {
      const y = bul(ctx.param.slug);
      if (!y) return yokEkrani();
      const t = detay(y.slug), kisi = ctx.kisi ||= y.kisi;
      const ogunler = (t?.ogunler || DDV.kutuphane?.kategoriOgun?.[y.kategori] || []).map(ogunAd).filter(Boolean);
      const metin = [y.aciklama, t?.giris].filter(Boolean).join(' ');
      const bas = `${DD.ozetSerit([
        {ikon: 'kalori', etiket: 'Kalori', deger: DD.sayi(y.porsiyonKcal), birim: 'kcal'},
        {ikon: 'protein', etiket: 'Protein', deger: DD.ondalik(y.P, 1), birim: 'g'},
        {ikon: 'karb', etiket: 'Karb.', deger: DD.ondalik(y.K, 1), birim: 'g'},
        {ikon: 'yag', etiket: 'Yağ', deger: DD.ondalik(y.Y, 1), birim: 'g'}
      ])}${DD.ozellikSerit({on: ogunler.map(o => ({ikon: o.ikon, metin: o.ad})), etiket: 'Etiketler', ogeler: y.etiketler.map(e => ({ikon: ETIKET_IKON[e] || 'tag', metin: e}))})}${DD.aciklama({metin: ilkCumle(metin)})}`;
      return DD.detay({
        gorsel: y.gorsel,
        etiket: y.kategori,
        baslik: y.ad,
        alt: `${y.kisi} kişilik · 1 porsiyon ${DD.sayi(y.porsiyonKcal)} kcal`,
        caps: [{ikon: 'saat', metin: DD.sure(y.sureDk)}, t?.zorluk ? {ikon: 'yildiz', metin: t.zorluk} : null, t ? {ikon: 'list-ol', metin: `${t.adimlar.length} adım`} : null].filter(Boolean),
        bas,
        sekmeler: t ? DD.detaySekmeler({ad: 'tarif-sekme', etiket: 'Tarif', secili: ctx.sekme || 'malzeme', ogeler: [
          {ad: 'Malzemeler', deger: 'malzeme', html: malzemePane(y, t, kisi)},
          {ad: 'Yapılış', deger: 'yapilis', html: yapilis(t)},
          {ad: 'Besin değeri', deger: 'deger', html: degerler(y, t)}
        ]}) : undefined,
        kuyruk: `${t ? '' : degerler(y, null)}${kuyruk(y, t)}`
      });
    },
    altBar: ctx => {
      const y = bul(ctx.param.slug);
      if (!y) return '';
      return DD.altEylem({
        ikonlar: [{ikon: 'kaydet', ad: 'Kaydet', sayi: 'Kaydet', basili: kayitlar().includes(y.slug), veri: {eylem: 'tarif-kaydet'}}, {ikon: 'paylas', ad: 'Paylaş', sayi: 'Paylaş', veri: {eylem: 'tarif-paylas'}}],
        dugmeler: [{metin: 'Öğüne ekle', ikon: 'ekle', veri: {eylem: 'ogune-ekle'}}]
      });
    },
    donus: (kok, ctx) => { const y = bul(ctx.param.slug); if (y) kayitBoya(kok, y.slug); },
    sonra: (kok, ctx) => {
      const y = bul(ctx.param.slug);
      if (!y) return undefined;
      const t = detay(y.slug);
      kayitBoya(kok, y.slug);
      const temizle = [
        DD.on(kok, 'tarif-sekme', v => { ctx.sekme = v; }),
        DD.on(kok, 'kisi', v => { ctx.kisi = +v; const e = kok.querySelector('[data-yuva="malzeme"]'); if (e && t) e.innerHTML = malzemeler(y, t, ctx.kisi); }),
        DD.eylem(kok, 'tarif-kaydet', () => {
          if (!DD.uye()) { DD.uyeDuvar({baslik: 'Tarifi kaydet', metin: 'Beğendiğin tarifleri **kaydetmek** ve sonra dönmek için üye ol.'}); return; }
          const l = kayitlar(), on = !l.includes(y.slug);
          DD.durum.yaz('kayitli-tarifler', on ? [...l, y.slug] : l.filter(x => x !== y.slug));
          kayitBoya(kok, y.slug);
          DD.titres(10);
          DD.toast(on ? '**Kaydedilenler**’e eklendi' : 'Kayıt kaldırıldı', {ikon: 'kaydet'});
        }),
        DD.eylem(kok, 'tarif-paylas', () => DD.paylas({baslik: y.ad, alt: y.aciklama, url: `https://dadadiet.com/tarif/${y.slug}`})),
        DD.eylem(kok, 'ogune-ekle', () => ogunSheet(y))
      ];
      return () => temizle.forEach(f => f());
    }
  });
})();
