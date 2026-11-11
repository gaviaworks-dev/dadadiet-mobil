/* SCR-31 Tabak sonucu (#/ai/tabak). Referans: tasks/referanslar.md Tabak tanıma, §2.6 (Zero ve Cal AI hap etiket, MyFitnessPal güven rozeti).
 * Sonuç taslaktır: düzeltmeler DD.durum 'ai-tabak' {ogun, cekim, kaynak, oran, kalem:{id:{gram, ad, kcalGram}}, silinen:[id], oneriler:[], serbest, not} içinde durur, kamera yeni çekimde sıfırlar.
 * Günlüğe yazmaz; bileşenleri Tabağım'a ekler ve hedef öğünü 'tabagim-ogun' anahtarına yazar (sözleşme), kayıt Bugün'de olur.
 * Fotoğraf, kaynak, ortalama güven ve not DD.tabagim.meta ile kayda geçer. Hazır notlar tahmini değiştirir (ETKI), serbest metin yalnız not olarak kalır.
 * ?hal=bos bileşen bulunamadı, ?hal=hata bağlantı hatası, ?hal=olusturulamadi fotoğraf alındı ama sonuç hazırlanamadı (Gastro Tabaktan Tarif "oluşturulamadı").
 */
(() => {
  const {sayi, ondalik} = DD;
  const K = 'ai-tabak', MAKRO = ['P', 'K', 'Y', 'Lif'];
  const T = () => DDV.ai.tabak;
  const durum = () => DD.durum.oku(K, {});
  const yaz = d => DD.durum.yaz(K, d);
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id)?.ad;
  const hedefOgun = () => durum().ogun || DD.tabagim.ogun();

  // Hazır notların tahmine etkisi. Yağsız pişti: yağın %40'ı düşer, kcal 9 kcal/g ile iner (varsayım). Sos yok: bileşenlerde sos sayılmadığı için tahmin değişmez.
  const YAG_PAY = .4, YAG_KCAL = 9;
  const olcek = (b, k) => ({...b, gram: b.gram * k, kcal: b.kcal * k, ...Object.fromEntries(MAKRO.map(m => [m, b[m] * k]))});
  const ETKI = {
    'Yarım porsiyon': b => olcek(b, .5),
    'Yağsız pişti': b => ({...b, Y: b.Y * (1 - YAG_PAY), kcal: b.kcal - b.Y * YAG_PAY * YAG_KCAL}),
    'Ekstra sebze': b => (DDV.besinBul(b.slug)?.kategori === 'Sebzeler' ? olcek(b, 1.5) : b)
  };
  // Küçük ve Büyük katsayısı Akıllı Tabak spesifikasyonundaki 0,5 ve 1,5.
  const PORSIYON = [{ad: 'Küçük', deger: '0.5'}, {ad: 'Orta', deger: '1'}, {ad: 'Büyük', deger: '1.5'}];
  const ONERILER = ['Yarım porsiyon', 'Yağsız pişti', 'Sos yok', 'Ekstra sebze'];

  // Bileşen = veri + kullanıcının düzeltmesi + hazır notlar. Alternatif besinde yalnız gram başına kcal var; makrolar kcal oranıyla taşınır.
  const kalemler = (etkili = true) => {
    const d = durum(), oran = d.oran || 1, sil = d.silinen || [], etkiler = etkili ? Object.keys(ETKI).filter(k => d.oneriler?.includes(k)) : [];
    return T().bilesenler.filter(b => !sil.includes(b.id)).map(b => {
      const k = d.kalem?.[b.id], gram = (k?.gram ?? b.gram) * oran, kcalGram = k?.kcalGram ?? b.kcal / b.gram, kat = gram * kcalGram / b.kcal;
      const x = {...b, ad: k?.ad ?? b.ad, gram, kcal: gram * kcalGram, guven: k ? 100 : b.guven, slug: k?.ad ? null : b.slug, gorsel: k?.ad ? null : DDV.besinBul(b.slug)?.gorsel ?? null, ...Object.fromEntries(MAKRO.map(m => [m, b[m] * kat]))};
      return etkiler.reduce((y, e) => ETKI[e](y), x);
    });
  };
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);

  // Bugün'ün kalanı, halkadaki "Kalan" ile aynı (DD.gunKalan, bugun.js).
  const gunKalan = () => DD.gunKalan();
  const buCekim = x => x.taslak === K && x.cekim === durum().cekim;
  const tabagimda = () => DD.tabagim.liste().some(buCekim);
  const metaYaz = l => { const d = durum(); DD.tabagim.meta({foto: T().gorsel, kaynak: d.kaynak || 'kamera', guven: Math.round(toplam(l, 'guven') / l.length), not: d.not || ''}); };
  const tabagaYaz = () => {
    const {cekim} = durum(), l = kalemler();
    DD.durum.yaz('tabagim-ogun', hedefOgun());
    l.forEach(b => DD.tabagim.ekle({ad: b.ad, slug: b.slug, gorsel: b.gorsel, gram: Math.round(b.gram), kcal: Math.round(b.kcal), P: b.P, K: b.K, Y: b.Y, Lif: b.Lif, taslak: K, cekim}));
    if (l.length) metaYaz(l);
  };
  // Tabağa geçmiş taslak düzeltilirse Tabağım da aynı kalır.
  const guncelle = d => {
    const varmis = tabagimda();
    if (varmis) DD.tabagim.liste().filter(buCekim).forEach(x => DD.tabagim.cikar(x.id));
    yaz(d);
    if (varmis) tabagaYaz();
    DD.tazele();
  };

  // ---------- Parçalar ----------
  const ozetHtml = l => DD.ozetSerit([{ikon: 'kalori', etiket: 'Enerji', deger: sayi(toplam(l, 'kcal')), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: sayi(toplam(l, 'P')), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(toplam(l, 'K')), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(toplam(l, 'Y')), birim: 'g'}]);
  const kalanBant = l => {
    const kcal = Math.round(toplam(l, 'kcal')), kalan = gunKalan(), fark = kalan - kcal, id = hedefOgun(), o = DDV.bugun.ogunler.find(x => x.id === id);
    if (kalan == null) return '';
    const plan = o?.durum === 'planli' ? ` ${o.ad} planın **${sayi(o.kcal)} kcal**.` : '';
    return fark >= 0
      ? DD.bant({ikon: 'hedef', metin: `Bu tabakla günün kalanı **${sayi(fark)} kcal** olur.${plan}`})
      : DD.bant({ton: 'uyari', ikon: 'hedef', metin: `Bu tabak kalan hedefinin **${sayi(-fark)} kcal üstünde**.${plan}`});
  };
  const enAzGuvenli = l => [...l].sort((a, b) => a.guven - b.guven)[0];
  const varsayimHtml = l => {
    const b = enAzGuvenli(l);
    if (b.guven >= 90) return DD.varsayim({metin: T().not.replace('Gramlar', '**Gramlar**')});
    const alt = b.alternatif?.[0]?.ad;
    return DD.varsayim({metin: `Bunu **${b.ad}** olarak okudum${alt ? `; ${alt.toLocaleLowerCase('tr')} da olabilir` : ''}.`, eylem: 'Değiştir', veri: {eylem: 'duzelt', id: b.id}});
  };

  // Yalnız gerçekten değişen tahmin için "güncellendi" denir; serbest metin ve Sos yok not olarak kalır.
  const notBilgi = l => {
    const d = durum(), ham = Math.round(toplam(kalemler(false), 'kcal')), yeni = Math.round(toplam(l, 'kcal')), sos = d.oneriler?.includes('Sos yok');
    if (yeni !== ham) return DD.p(`Tahmin güncellendi: **${sayi(ham)} → ${sayi(yeni)} kcal**.${sos ? ' Bileşenlerde sos saymamıştık.' : ''}`, {ton: 'ikincil', meta: true});
    if (sos) return DD.p('Bileşenlerde sos saymamıştık, **tahmin aynı kaldı**. Notun kayda geçer.', {ton: 'ikincil', meta: true});
    return d.not ? DD.p('Notun **kayda geçer**, tahmini değiştirmez.', {ton: 'ikincil', meta: true}) : '';
  };
  const notHtml = l => { const d = durum(); return `<div class="dd-yigin-8">${DD.oneriNot({ad: 'ai-not', deger: d.serbest || '', oneriler: ONERILER, secili: d.oneriler || []})}<div data-yuva="not">${notBilgi(l)}</div></div>`; };

  const govde = (ctx, l) => {
    const baslik = T().baslik.replace(/\d+/, l.length), ort = Math.round(toplam(l, 'guven') / l.length);
    const secili = l.find(b => b.id === ctx.secili);
    return `${DD.bbox({gorsel: T().gorsel, kutular: l, secili: ctx.secili, ad: 'bilesen'})}
      <div class="dd-ic dd-yigin">
        ${secili ? DD.aiSatir(secili, {secili: true}) : ''}
        <div class="dd-yigin-8">
          <div class="dd-sira">${DD.durumRozet({kod: 'taslak'})}${DD.durumRozet({metin: ogunAd(hedefOgun()), ikon: 'ogun'})}${DD.durumRozet({metin: `Güven %${ort}`, ton: ort >= 90 ? 'basari' : 'notr', ikon: 'wand-magic-sparkles'})}</div>
          <h1 class="dd-t-section">${DD.esc(baslik)}</h1>
        </div>
        ${DD.alan({etiket: 'Porsiyon', html: DD.segment({ad: 'ai-porsiyon', etiket: 'Porsiyon', secili: String(durum().oran || 1), ogeler: PORSIYON})})}
        ${ozetHtml(l)}
        ${kalanBant(l)}
      </div>
      ${DD.bolum({html: notHtml(l)})}
      ${DD.bolum({baslik: 'Bileşenler', html: `<div class="dd-yigin-12">${varsayimHtml(l)}${DD.satirlar(l.map(b => DD.aiSatir(b)))}</div>`})}
      ${DD.bolum({html: DD.p('Bu sonuç bir **taslaktır**. Sen onaylayana kadar günlüğüne yazılmaz; bileşenleri değiştirebilir ya da çıkarabilirsin.', {ton: 'ikincil', meta: true})})}`;
  };

  // ---------- Sheet'ler ----------
  const birimler = b => {
    const l = DDV.besinBul(b.slug)?.porsiyonlar || [];
    return l.some(x => x.birim === 'gram') ? l : [...l, {birim: 'gram', gram: 1}];
  };
  const duzeltSheet = id => {
    const ana = T().bilesenler.find(b => b.id === id), b = kalemler().find(x => x.id === id), ham = kalemler(false).find(x => x.id === id), oran = durum().oran || 1, alt = ana.alternatif?.[0];
    // Sheet tahminin görünen halini gösterir; hazır not çarpanları kayıtta geri alınır, yoksa iki kez uygulanır.
    const gramKat = b.gram / ham.gram, kcalKat = (b.kcal / b.gram) / (ham.kcal / ham.gram);
    let gram = Math.round(b.gram), secilen = b.ad === ana.ad ? '' : b.ad;
    const kcalGram = () => (secilen ? alt.gramKcal : ana.kcal / ana.gram), gorunen = () => kcalGram() * kcalKat;
    DD.sheet({
      baslik: b.ad,
      html: `<div class="dd-yigin">
        ${alt ? DD.alan({etiket: 'Bu ne?', html: DD.cipler({ad: 'ai-tur', tur: 'tek', secili: secilen, ogeler: [{metin: ana.ad, deger: ''}, {metin: alt.ad, deger: alt.ad}]})}) : ''}
        ${DD.alan({etiket: 'Porsiyon', html: DD.porsiyon({ad: 'ai-porsiyon', birimler: birimler(ana), secili: 'gram', miktar: gram, kcal100: gorunen() * 100})})}
      </div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Çıkar', ikon: 'sil', tur: 'yikici-ikincil', veri: {eylem: 'cikar'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'kaydet-kalem'}})}</div>`,
      sonra: h => {
        const c = [
          DD.on(h, 'ai-porsiyon', v => { gram = v.gram; }),
          DD.on(h, 'ai-tur', v => {
            secilen = v; const p = h.querySelector('.dd-porsiyon');
            p.dataset.kcal100 = gorunen() * 100;
            h.querySelector('[data-p-kcal]').textContent = sayi(gram * gorunen());
          }),
          DD.eylem(h, 'kaydet-kalem', () => {
            const d = durum();
            h.kapat();
            guncelle({...d, kalem: {...d.kalem, [id]: {gram: gram / oran / gramKat, kcalGram: kcalGram(), ...(secilen ? {ad: secilen} : {})}}});
            DD.toast(`**${secilen || ana.ad}** güncellendi`, {tur: 'basari'});
          }),
          DD.eylem(h, 'cikar', () => {
            const d = durum(), onceki = d.silinen || [];
            h.kapat();
            guncelle({...d, silinen: [...onceki, id]});
            DD.toast(`**${b.ad}** çıkarıldı`, {ikon: 'sil', eylem: 'Geri al', onEylem: () => guncelle({...durum(), silinen: onceki})});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  const KESIR = [[.25, '¼'], [.5, '½'], [.75, '¾'], [1, 'Tamamı'], [1.5, '1½'], [2, '2']].map(([deger, metin]) => ({deger, metin}));
  const porsiyonSheet = () => {
    const d0 = durum(), mevcut = d0.oran || 1, taban = toplam(kalemler(), 'kcal') / mevcut;
    let oran = mevcut;
    const metin = () => `Bu haliyle **${sayi(taban * oran)} kcal**.`;
    DD.sheet({
      baslik: 'Porsiyonu düzelt',
      html: `<div class="dd-yigin">${DD.p('Tabağın **ne kadarını** yediğini seç, bütün gramlar buna göre ölçeklenir. Tek bileşen için listedeki **kaleme** dokun.')}${DD.kesirIzgara({ad: 'ai-oran', secili: mevcut, ogeler: KESIR})}<div data-yuva="oran">${DD.p(metin(), {meta: true, ton: 'ikincil'})}</div></div>`,
      altBar: DD.btn({metin: 'Uygula', ikon: 'onay', tam: true, veri: {eylem: 'oran-uygula'}}),
      sonra: h => {
        const c1 = DD.on(h, 'ai-oran', v => { oran = +v; h.querySelector('[data-yuva="oran"]').innerHTML = DD.p(metin(), {meta: true, ton: 'ikincil'}); });
        const c2 = DD.eylem(h, 'oran-uygula', () => { h.kapat(); guncelle({...durum(), oran}); DD.toast(`Porsiyon **${KESIR.find(k => k.deger === oran).metin}** olarak güncellendi`, {tur: 'basari'}); });
        return () => { c1(); c2(); };
      }
    });
  };

  const gunlugeEkle = () => {
    if (!tabagimda()) { tabagaYaz(); DD.tazele(); }
    DD.tabagim.ac();
  };

  // Sonuç hazırlanamadı: Gastro "Taslak oluşturulamadı" sahnesi (fotoğraf cihazda kalır, yeniden dene). Bir kez gösterilir; Yeniden dene olağan sonuca döner.
  const olusmadiMi = ctx => ctx.sorgu.hal === 'olusturulamadi' && !ctx.temiz;
  const olusmadi = () => DD.durumSahne({
    tema: 'koyu', gorsel: T().gorsel, isaret: 'uyari', not: 'Fotoğrafın bu cihazda duruyor', baslik: 'Sonuç hazırlanamadı',
    metin: 'Tabağını aldık ama **bileşenleri çıkaramadık**. Yeniden dene ya da besinleri **elle ekle**.',
    ana: {metin: 'Yeniden dene', ikon: 'yenile', veri: {eylem: 'yeniden'}},
    ikinciller: [{metin: 'Yeniden çek', ikon: 'kamera', git: '#/ai/kamera?mod=tabak'}, {metin: 'Elle ekle', ikon: 'ekle', git: '#/besin-ara'}]
  });

  DD.ekran('ai-tabak', {
    cevrimici: true,   // ağ gerekir: çevrimdışında bağlantı hatası (önbellek yok)
    tur: 'alt',
    ust: '#/ai/kamera?mod=tabak',
    baslik: 'Tabağın',
    ustBar: () => ({sag: [{ikon: 'kamera', etiket: 'Yeniden çek', git: '#/ai/kamera?mod=tabak'}]}),
    iskelet: 'detay',
    yukle: ctx => (ctx.sorgu.hal === 'hata' && !ctx.denendi
      ? (ctx.denendi = true, Promise.reject(new Error('baglanti')))
      : new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal))),
    ciz: ctx => {
      if (olusmadiMi(ctx)) return olusmadi();
      const l = ctx.sorgu.hal === 'bos' ? [] : kalemler();
      if (!l.length) return DD.bos({tam: true, ikon: 'tabak', baslik: 'Bileşen kalmadı', metin: 'Tabağı **yeniden çekebilir** ya da besinleri aramayla ekleyebilirsin.', eylem: {metin: 'Yeniden çek', ikon: 'kamera', git: '#/ai/kamera?mod=tabak'}, ikincil: {metin: 'Besin ara', git: '#/besin-ara'}});
      return govde(ctx, l);
    },
    altBar: ctx => {
      if (ctx.sorgu.hal === 'bos' || olusmadiMi(ctx) || !kalemler().length) return '';
      const var_ = tabagimda();
      return DD.altEylem({dugmeler: [{metin: 'Porsiyonu düzelt', tur: 'secondary', veri: {eylem: 'porsiyon'}}, {metin: var_ ? 'Tabağımı aç' : 'Günlüğe ekle', ikon: var_ ? 'tabak' : 'ekle', veri: {eylem: 'gunluge'}}]});
    },
    sonra: (kok, ctx) => {
      const kaydedildi = () => { DD.durum.sil(K); setTimeout(() => DD.git('#/bugun')); };
      document.addEventListener('dd-tabagim-kaydet', kaydedildi);
      const c = [
        DD.on(kok, 'ai-not', (not, {oneriler, serbest}) => {
          const d = durum(), degisti = JSON.stringify(oneriler) !== JSON.stringify(d.oneriler || []), yeni = {...d, not, oneriler, serbest};
          // Yazarken yeniden çizim odağı keser: serbest metin yalnız notu yazar.
          if (degisti) { guncelle(yeni); return; }
          yaz(yeni);
          if (tabagimda()) DD.tabagim.meta({not});
          const y = kok.querySelector('[data-yuva="not"]'); if (y) y.innerHTML = notBilgi(kalemler());
        }),
        DD.on(kok, 'ai-porsiyon', v => guncelle({...durum(), oran: +v})),
        DD.on(kok, 'bilesen', id => { ctx.secili = ctx.secili === id ? null : id; DD.tazele(); }),
        DD.eylem(kok, 'duzelt', el => duzeltSheet(el.dataset.id)),
        DD.eylem(kok, 'porsiyon', porsiyonSheet),
        DD.eylem(kok, 'gunluge', gunlugeEkle),
        DD.eylem(kok, 'yeniden', () => { ctx.temiz = true; DD.tazele(); })
      ];
      return () => { document.removeEventListener('dd-tabagim-kaydet', kaydedildi); c.forEach(f => f()); if (!DD.tabagim.liste().length) DD.durum.sil('tabagim-ogun'); };
    },
    donus: () => DD.tazele()
  });
})();
