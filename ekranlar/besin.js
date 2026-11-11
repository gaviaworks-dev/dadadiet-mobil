/* Besin detay (#/besin/:slug): Gastro detay-v2. Web karşılığı besin/<slug> (public-beslenme-besin.js):
 * değer kartı, miktar seçici, besin değerleri, vitamin ve mineraller, makro dağılımı, kaynak, karşılaştır, favori, öğüne ekle.
 * Veri DDV.besinler (100 g) + DDV.kutuphane.mikrolar[slug] (web kaydındaki vitamin, mineral, doymuş yağ, şeker, GI; olmayan alan yazılmaz).
 * Görseli olmayan besinde kapak yoktur: üst bar düz, başta DD.gorsel harf hali.
 * Durum: 'kayitli-besinler' (slug listesi, varsayılan DDV.uye.kayitli.besinler; yeni hesapta []), 'tabagim-ogun' (Öğüne ekle sheet'inin hedef öğünü, besin-ara ile aynı).
 * Kayıt yazmaz: yalnız Tabağım'a ekler (tasks/ekran-sozlesme.md). ?hal=hata bağlantı hatası. */
(() => {
  const MAKRO = ['P', 'K', 'Y', 'Lif'];
  const ETIKET = {'yuksek-protein': ['Yüksek protein', 'protein'], lifli: ['Lifli', 'lif'], 'dusuk-kalori': ['Düşük kalori', 'kalori'], bitkisel: ['Bitkisel', 'seedling']};
  const bul = slug => DDV.besinler.find(b => b.slug === slug);
  const ek = slug => DDV.kutuphane?.mikrolar?.[slug] || {};
  const kayitlar = () => DD.durum.oku('kayitli-besinler', DD.yeniHesap() ? [] : (DDV.uye?.kayitli?.besinler || []));
  const kisaAd = ad => ad.split(' (')[0];
  const parantez = ad => ad.match(/\((.+)\)$/)?.[1] || null;
  const bir = n => Math.round(n * 10) / 10;
  const g1 = n => `${DD.ondalik(n, 1)} g`;
  const ilkPorsiyon = b => { const p = b.porsiyonlar.find(x => x.birim !== 'gram'); return p ? {birim: p.birim, miktar: 1, gram: p.gram} : {birim: 'gram', miktar: 100, gram: 100}; };
  const deger = (b, gram) => ({kcal: Math.round(b.kcal * gram / 100), ...Object.fromEntries(MAKRO.map(m => [m, bir((b[m] || 0) * gram / 100)]))});
  const hedefMakro = () => DD.durum.oku('plan', null)?.makro || (DD.yeniHesap() ? null : DDV.kullanici.makroHedef);
  // Vurgu: ilk yan cümle, uzunsa ilk üç kelime.
  const ilkCumle = s => { const i = s.search(/[;:]|[,.](?=\s|$)/), bas = i > 0 ? s.slice(0, i) : s, k = bas.split(' '); return k.length > 5 ? `**${k.slice(0, 3).join(' ')}** ${s.slice(k.slice(0, 3).join(' ').length + 1)}` : `**${bas}**${s.slice(bas.length)}`; };

  // ---------- Bölümler ----------
  const bolum = (baslik, sag, html) => `<section class="dd-yigin-12">${DD.bas(baslik, sag ? {html: `<span class="dd-t-meta dd-ton-ikincil">${DD.esc(sag)}</span>`} : null)}${html}</section>`;
  const olcuNot = (b, p) => {
    const x = b.porsiyonlar.find(y => y.birim === p.birim);
    if (!x || p.birim === 'gram') return DD.p(`Değerler **100 gram** kaydından orantılanır. Gramı adımlayıcıyla değiştirebilirsin.`, {ton: 'ikincil', meta: true});
    const tanim = x.etiket.replace(/^1 /, '');   // etiket birimle aynıysa ("porsiyon: porsiyon") tekrar yazılmaz
    return DD.p(`**1 ${x.birim}:** ${tanim === x.birim ? '' : `${tanim}, `}${DD.sayi(x.gram)} g${x.kaynak === 'varsayılan' ? ' (ev ölçüsü, yaklaşık)' : ''}.`, {ton: 'ikincil', meta: true});
  };
  const porsiyonMakro = (b, p) => {
    const d = deger(b, p.gram), h = hedefMakro();
    if (!h) return DD.ozetSerit(MAKRO.map(m => ({etiket: {P: 'Protein', K: 'Karb.', Y: 'Yağ', Lif: 'Lif'}[m], deger: DD.ondalik(d[m], 1), birim: 'g'})));
    return `<div class="dd-yigin-8">${DD.makroCubuk(Object.fromEntries(MAKRO.map(m => [m, {alinan: d[m], hedef: h[m]}])))}${DD.p(`Bu miktar **${DD.sayi(d.kcal)} kcal**; çubuklar günlük makro hedefine göre dolar.`, {ton: 'ikincil', meta: true})}</div>`;
  };
  const degerSatir = (ad, yuz, por, birim) => DD.satir({baslik: ad, alt: `100 g: ${yuz}`, deger: por, ok: false});
  const degerler = (b, p) => {
    const d = deger(b, p.gram), e = ek(b.slug), oran = p.gram / 100;
    const satirlar = [
      degerSatir('Enerji', `${DD.sayi(b.kcal)} kcal`, `${DD.sayi(d.kcal)} kcal`),
      degerSatir('Protein', g1(b.P), g1(d.P)),
      degerSatir('Karbonhidrat', g1(b.K), g1(d.K)),
      degerSatir('Lif', g1(b.Lif || 0), g1(d.Lif)),
      degerSatir('Yağ', g1(b.Y), g1(d.Y)),
      e.doymusYag != null && degerSatir('Doymuş yağ', g1(e.doymusYag), g1(e.doymusYag * oran)),
      e.seker != null && degerSatir('Şeker', g1(e.seker), g1(e.seker * oran))
    ].filter(Boolean);
    return bolum('Besin değerleri', `${DD.sayi(p.gram)} g için`, `${DD.yuzey(DD.satirlar(satirlar))}${DD.p('Karbonhidrat değerine **lif dahildir**; kaynak kaydındaki gibi gösterilir.', {ton: 'ikincil', meta: true})}`);
  };
  const mikrolar = b => {
    const m = ek(b.slug).mikro, A = DDV.kutuphane?.mikroAd || {}, B = DDV.kutuphane?.mikroBirim || {};
    if (!m || !Object.keys(m).length) return bolum('Vitamin ve mineraller', null, DD.bant({ton: 'bilgi', metin: 'Bu kayıtta **vitamin ve mineral** değeri yayımlanmıyor; kaynağı olmayan değer yazılmaz.'}));
    const l = Object.entries(m).map(([k, v]) => ({ikon: /vit|b12|folat/.test(k) ? 'capsules' : 'flask', etiket: A[k] || k, deger: `${DD.ondalik(v, 2)} ${B[A[k]] || ''}`.trim()}));
    return bolum('Vitamin ve mineraller', '100 g', DD.kunye(l));
  };
  const dagilim = b => {
    const e = {P: b.P * 4, K: b.K * 4, Y: b.Y * 9}, top = e.P + e.K + e.Y;
    if (!top) return '';
    const y = k => `%${Math.round(e[k] / top * 100)}`;
    return bolum('Makro dağılımı', '100 g', `${DD.ozetSerit([{ikon: 'protein', etiket: 'Protein', deger: y('P'), alt: g1(b.P)}, {ikon: 'karb', etiket: 'Karb.', deger: y('K'), alt: g1(b.K)}, {ikon: 'yag', etiket: 'Yağ', deger: y('Y'), alt: g1(b.Y)}])}${DD.p('Yüzdeler enerjinin makrolara dağılımıdır: **protein ve karbonhidrat 4, yağ 9 kcal/g** sayılır. Günlük ihtiyaç kişiye göre değişir.', {ton: 'ikincil', meta: true})}`);
  };
  const muadilVar = b => b.muadil.length > 0 || (DDV.denge?.muadiller || []).some(g => g.secenekler.some(s => s.kaynak.slug === b.slug));
  const araclar = b => {
    const muadil = b.muadil.map(bul).filter(Boolean);
    const satir = x => DD.besinSatir({ad: x.ad, gorsel: x.gorsel, kcal: x.kcal, P: x.P, K: x.K, Y: x.Y}, {alt: `100 g · Protein ${g1(x.P)}`, git: `#/besin/${x.slug}`, ok: true});
    return `${muadil.length ? bolum('Yerine geçebilecekler', null, DD.yuzey(DD.satirlar(muadil.map(satir)))) : ''}<div class="dd-yigin-12">${muadilVar(b) ? DD.eylemKart({ikon: 'muadil', baslik: 'Değişim önerileri', alt: 'Aynı porsiyonda daha dengeli seçenek', git: `#/denge/muadil?besin=${b.slug}`}) : ''}${DD.eylemKart({ikon: 'kiyas', baslik: 'Başka besinle kıyasla', alt: 'İki besini yan yana gör', git: `#/denge/kiyasla?a=${b.slug}`})}</div>`;
  };
  const benzerler = b => DDV.besinler.filter(x => x.kategori === b.kategori && x.slug !== b.slug).sort((x, y) => Math.abs(x.kcal - b.kcal) - Math.abs(y.kcal - b.kcal)).slice(0, 4);
  const kunye = b => {
    const e = ek(b.slug);
    return [
      {ikon: 'layer-group', etiket: 'Kategori', deger: b.kategori},
      {ikon: 'database', etiket: 'Veri tabanı', deger: b.kaynak},
      e.kaynakKod && {ikon: 'hashtag', etiket: 'Kayıt kodu', deger: e.kaynakKod},
      e.gi != null && {ikon: 'chart-line', etiket: 'Glisemik indeks', deger: String(e.gi)}
    ].filter(Boolean);
  };
  const kuyruk = b => {
    const l = benzerler(b);
    return `${DD.kunye(kunye(b))}${l.length ? DD.bolum({ic: false, baslik: 'Aynı kategoriden', eylem: 'Tümü', git: `#/besinler?kategori=${encodeURIComponent(b.kategori)}`, html: DD.yuzey(DD.satirlar(l.map(x => DD.besinSatir({ad: x.ad, gorsel: x.gorsel, kcal: x.kcal, P: x.P, K: x.K, Y: x.Y}, {alt: '100 g', git: `#/besin/${x.slug}`, ok: true}))))}) : ''}${DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Bu sayfadaki içerik **genel bilgilendirme** amaçlıdır; tıbbi teşhis veya tedavi yerine geçmez. Kişiye özel plan için diyetisyenine danış.'})}`;
  };
  const ozet = b => DD.ozetSerit([{ikon: 'kalori', etiket: 'Enerji', deger: DD.sayi(b.kcal), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: DD.ondalik(b.P, 1), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: DD.ondalik(b.K, 1), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: DD.ondalik(b.Y, 1), birim: 'g'}]);
  const porsiyonHtml = (b, p) => bolum('Miktar', null, `${DD.porsiyon({ad: 'porsiyon', birimler: b.porsiyonlar, secili: p.birim, miktar: p.miktar, kcal100: b.kcal})}<div data-yuva="olcu">${olcuNot(b, p)}</div><div data-yuva="pmakro">${porsiyonMakro(b, p)}</div>`);
  const govde = (b, p) => `${porsiyonHtml(b, p)}<div data-yuva="degerler">${degerler(b, p)}</div>${mikrolar(b)}${dagilim(b)}${araclar(b)}`;

  // ---------- Öğüne ekle ----------
  // Seçilmiş hedef öğün yoksa saate göre (DD.saatOgunu): Tabağım çubuğu ve sayfasıyla aynı varsayılan.
  const siradaki = () => DD.saatOgunu();
  const kalem = (b, p) => ({anahtar: b.slug, slug: b.slug, ad: b.ad, miktar: p.miktar, birim: p.birim, gram: p.gram, gorsel: b.gorsel, ...deger(b, p.gram)});
  const ogunSheet = (b, p) => {
    let ogun = DD.durum.oku('tabagim-ogun', null) || siradaki();
    if (!DDV.bugun.ogunler.some(o => o.id === ogun)) ogun = siradaki();
    const k = kalem(b, p);
    DD.sheet({
      baslik: 'Öğüne ekle',
      html: `<div class="dd-yigin">${DD.besinSatir(k, {alt: `${p.birim === 'gram' ? '' : `${DD.ondalik(p.miktar, 2)} ${p.birim} · `}${DD.sayi(p.gram)} g`})}${DD.alan({etiket: 'Hangi öğünün?', html: DD.cipler({ad: 'ogun', tur: 'tek', etiket: 'Hedef öğün', serit: false, secili: ogun, ogeler: DDV.bugun.ogunler.map(o => ({metin: o.ad, deger: o.id, ikon: o.ikon}))})})}${DD.p('Besin önce **Tabağım**’a eklenir; tabağı kaydettiğinde seçtiğin öğüne yazılır.', {ton: 'ikincil', meta: true})}</div>`,
      altBar: DD.btn({metin: 'Tabağıma ekle', ikon: 'ekle', tam: true, veri: {eylem: 'tabaga'}}),
      sonra: d => {
        const a = DD.on(d, 'ogun', v => { ogun = [].concat(v)[0] || ogun; });
        const c = DD.eylem(d, 'tabaga', () => {
          DD.durum.yaz('tabagim-ogun', ogun);
          if (!Object.keys(DD.tabagim.meta()).length) DD.tabagim.meta({kaynak: 'arama'});
          DD.tabagim.ekle(k);
          d.kapat();
          DD.titres(8);
          DD.toast(`**${kisaAd(b.ad)}** Tabağına eklendi`, {ikon: 'tabak', eylem: 'Aç', onEylem: () => DD.tabagim.ac()});
        });
        return () => { a(); c(); };
      }
    });
  };

  const kayitBoya = (kok, slug) => {
    const on = kayitlar().includes(slug);
    kok.querySelectorAll('[data-eylem="besin-kaydet"]').forEach(b => {
      b.setAttribute('aria-pressed', on);
      b.querySelector('.icon')?.classList.replace(on ? 'fa-regular' : 'fa-solid', on ? 'fa-solid' : 'fa-regular');
    });
  };
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu besin burada değil', metin: 'Bağlantı eskimiş olabilir. **Besin Kütüphanesi**’nden aradığını bulabilirsin.', eylem: {metin: 'Kütüphaneye dön', yerine: '#/besinler'}});

  let hataGosterildi = false;
  DD.ekran('besin', {
    tur: 'banner',
    nav: 'denge',
    ust: '#/besinler',
    baslik: ctx => kisaAd(bul(ctx.param.slug)?.ad || 'Besin'),
    iskelet: 'detay',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ustBar: ctx => {
      const b = bul(ctx.param.slug);
      if (!b) return {};
      return {saydam: !!b.gorsel, sag: [{ikon: 'kaydet', etiket: 'Kaydet', veri: {eylem: 'besin-kaydet'}}]};
    },
    ciz: ctx => {
      const b = bul(ctx.param.slug);
      if (!b) return yokEkrani();
      const p = ctx.porsiyon ||= ilkPorsiyon(b);
      const caps = b.etiketler.slice(0, 2).map(e => ETIKET[e] && {ikon: ETIKET[e][1], metin: ETIKET[e][0]}).filter(Boolean);
      const aciklama = DD.aciklama({metin: ilkCumle(b.aciklama || `${b.ad}, ${b.kategori.toLocaleLowerCase('tr')} grubunda.`)});
      if (!b.gorsel) {
        const bas = DD.satir({sol: DD.gorsel({ad: b.ad, ton: DD.makroTon(b)}), baslik: b.ad, alt: b.kategori, ok: false});
        return `<div class="dd-ic dd-yigin-24"><div class="dd-yigin">${bas}${ozet(b)}${aciklama}</div>${govde(b, p)}${kuyruk(b)}</div>`;
      }
      return DD.detay({
        gorsel: b.gorsel,
        etiket: b.kategori,
        baslik: kisaAd(b.ad),
        alt: parantez(b.ad) || `100 g · ${DD.sayi(b.kcal)} kcal`,
        caps,
        bas: `${ozet(b)}${aciklama}`,
        kuyruk: govde(b, p) + kuyruk(b)
      });
    },
    altBar: ctx => {
      const b = bul(ctx.param.slug);
      if (!b) return '';
      return DD.altEylem({
        ikonlar: [{ikon: 'kaydet', ad: 'Kaydet', sayi: 'Kaydet', basili: kayitlar().includes(b.slug), veri: {eylem: 'besin-kaydet'}}, {ikon: 'kiyas', ad: 'Kıyasla', sayi: 'Kıyasla', git: `#/denge/kiyasla?a=${b.slug}`}],
        dugmeler: [{metin: 'Öğüne ekle', ikon: 'ekle', veri: {eylem: 'ogune-ekle'}}]
      });
    },
    donus: (kok, ctx) => { const b = bul(ctx.param.slug); if (b) kayitBoya(kok, b.slug); },
    sonra: (kok, ctx) => {
      const b = bul(ctx.param.slug);
      if (!b) return undefined;
      kayitBoya(kok, b.slug);
      const yuva = ad => kok.querySelector(`[data-yuva="${ad}"]`);
      const temizle = [
        DD.on(kok, 'porsiyon', v => {
          ctx.porsiyon = {birim: v.birim, miktar: v.miktar, gram: v.gram};
          yuva('olcu').innerHTML = olcuNot(b, ctx.porsiyon);
          yuva('pmakro').innerHTML = porsiyonMakro(b, ctx.porsiyon);
          yuva('degerler').innerHTML = degerler(b, ctx.porsiyon);
        }),
        DD.eylem(kok, 'besin-kaydet', () => {
          if (!DD.uye()) { DD.uyeDuvar({baslik: 'Besini kaydet', metin: 'Sık baktığın besinleri **kaydetmek** ve tek dokunuşla dönmek için üye ol.'}); return; }
          const l = kayitlar(), on = !l.includes(b.slug);
          DD.durum.yaz('kayitli-besinler', on ? [...l, b.slug] : l.filter(x => x !== b.slug));
          kayitBoya(kok, b.slug);
          DD.titres(10);
          DD.toast(on ? '**Kaydedilenler**’e eklendi' : 'Kayıt kaldırıldı', {ikon: 'kaydet'});
        }),
        DD.eylem(kok, 'ogune-ekle', () => ogunSheet(b, ctx.porsiyon || ilkPorsiyon(b)))
      ];
      return () => temizle.forEach(f => f());
    }
  });
})();
