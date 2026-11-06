/* SCR-43 Besin kıyasla (#/denge/kiyasla, ?a=slug&b=slug). Referans: Yuka iki ürün, Cronometer çubukları, Open Food Facts günlük karşılık (tasks/referanslar.md Denge).
 * Vurgu kaloride değil dengede: yalnız protein ve lifte kazanan işaretlenir. Günlük karşılık DDV.kullanici.makroHedef'ten türetilir.
 * Hazır çiftte porsiyon iki besinde aynı gram; serbest seçimde her besinin kendi ilk porsiyonu. #/denge/kiyasla?hal=hata hata hali.
 */
(() => {
  const {sayi, ondalik} = DD;
  let hataGosterildi = false, kurulu = false;
  const s = {a: null, b: null, hazir: null, olcu: '100'};
  const VURGU = {P: 'cok', Lif: 'cok'};
  const kisaAd = ad => ad.split(' (')[0];
  const K = () => DDV.denge.kiyasla;
  const hazirBul = id => K().hazirlar.find(h => h.id === id);
  const ilkPorsiyon = b => b.porsiyonlar.find(p => p.birim !== 'gram') || {etiket: '100 g', gram: 100};
  const gramOf = b => (s.olcu === '100' ? 100 : hazirBul(s.hazir)?.gram ?? ilkPorsiyon(b).gram);
  const olcek = (b, id) => b[id] * gramOf(b) / 100;
  const hazirSec = id => { const h = hazirBul(id); s.hazir = id; s.a = h.a; s.b = h.b; };
  const besinler = () => [DDV.besinBul(s.a), DDV.besinBul(s.b)];

  // ---------- Parçalar ----------
  const slot = (k, sira) => {
    const b = s[k] && DDV.besinBul(s[k]);
    if (!b) return DD.satir({ikon: 'ekle', baslik: `${sira}. besini seç`, alt: 'Listeden ya da aramadan', veri: {eylem: 'sec', id: k}});
    return DD.satirKap({sol: DD.gorsel({src: b.gorsel, ad: b.ad, ton: DD.makroTon(b)}), baslik: b.ad, alt: b.kategori, veri: {eylem: 'sec', id: k}, ok: false}, DD.ikonBtn({ikon: 'kapat', etiket: `${kisaAd(b.ad)} seçimini kaldır`, veri: {eylem: 'kaldir', id: k}}));
  };
  const sonuc = () => {
    const [a, b] = besinler();
    if (!a || !b) return DD.bos({ikon: 'code-compare', baslik: 'İki besin seç', metin: 'Yan yana görmek istediğin **iki besini** seçince değerleri burada karşılaştırırız.'});
    const etiket = x => (s.olcu === '100' ? kisaAd(x.ad) : `${kisaAd(x.ad)} · ${sayi(gramOf(x))} g`);
    const satirlar = K().olcutler.map(o => ({ad: o.ad, a: olcek(a, o.id), b: olcek(b, o.id), birim: o.birim, iyi: VURGU[o.id]}));
    const porsiyonGram = hazirBul(s.hazir)?.gram;
    return `<div class="dd-yigin">${DD.segment({ad: 'olcu', secili: s.olcu, ogeler: [{ad: '100 g', deger: '100'}, {ad: porsiyonGram ? `Porsiyon (${sayi(porsiyonGram)} g)` : 'Porsiyon', deger: 'porsiyon'}]})}${DD.kiyasTablo({a: {...a, ad: etiket(a)}, b: {...b, ad: etiket(b)}, satirlar})}${DD.bilgi({etiket: 'Günlük karşılık', metin: karsilik(a, b)})}</div>`;
  };
  const karsilik = (a, b) => {
    const h = DDV.kullanici.makroHedef, la = olcek(a, 'Lif'), lb = olcek(b, 'Lif'), fark = Math.abs(la - lb), usten = la > lb ? a : b;
    if (fark < .1) return `İki besinin lif değeri **neredeyse aynı**; günlük lif hedefinin %${Math.round(la / h.Lif * 100)} kadarı.`;
    return `**${kisaAd(usten.ad)}** bu ölçüde **${ondalik(fark, 1)} g** daha çok lif verir; bu fark günlük lif hedefinin %${Math.round(fark / h.Lif * 100)} kadarı.`;
  };
  const tabakKaydi = b => { const g = gramOf(b), m = ['P', 'K', 'Y', 'Lif']; return {slug: b.slug, ad: b.ad, miktar: g, birim: 'g', gram: g, kcal: Math.round(olcek(b, 'kcal')), ...Object.fromEntries(m.map(x => [x, Math.round(olcek(b, x) * 10) / 10])), gorsel: b.gorsel}; };

  // ---------- Sheet'ler ----------
  const secSheet = k => DD.sheet({
    baslik: 'Besin seç',
    html: DD.arama({ad: 'kiyas-ara', yer: 'Besin ara'}),
    sonra: d => {
      const satir = b => ({baslik: b.ad, alt: b.kategori, sol: DD.gorsel({src: b.gorsel, ad: b.ad, ton: DD.makroTon(b)}), slug: b.slug});
      DD.aramaKur(d.querySelector('.dd-arama'), {
        son: DDV.besinListeleri.son.map(DDV.besinBul).filter(Boolean).map(satir),
        kaynak: q => { const n = DD.katla(q); return DDV.besinler.filter(b => DD.katla(b.ad).includes(n)).map(satir); },
        bosMetin: 'Bu ada uyan **bir besin** bulamadık. Daha kısa yazmayı dene.',
        sec: x => { s[k] = x.slug; s.hazir = null; d.kapat(); DD.tazele(); }
      });
    }
  });
  const ekleSheet = () => {
    const l = besinler();
    DD.sheet({
      baslik: 'Tabağa ekle',
      html: DD.satirlar(l.map(b => DD.besinSatir(tabakKaydi(b), {alt: `${sayi(gramOf(b))} g`, veri: {eylem: 'tabak', id: b.slug}, ok: true}))),
      sonra: d => DD.eylem(d, 'tabak', el => { const b = DDV.besinBul(el.dataset.id); DD.tabagim.ekle(tabakKaydi(b)); d.kapat(); DD.toast(`**${kisaAd(b.ad)}** Tabağım'a eklendi`, {tur: 'basari'}); })
    });
  };

  DD.ekran('kiyasla', {
    tur: 'alt',
    nav: 'denge',
    ust: '#/denge',
    baslik: () => K().baslik,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (!kurulu) { kurulu = true; if (ctx.sorgu.a || ctx.sorgu.b) { s.a = ctx.sorgu.a || null; s.b = ctx.sorgu.b || null; } else hazirSec(K().hazirlar[0].id); }
      return `<div class="dd-ic dd-yigin">${DD.p(K().altMetin.replace('aynı ölçüde', '**aynı ölçüde**'), {ton: 'ikincil'})}${DD.cipler({ad: 'hazir', tur: 'tek', etiket: 'Hazır çiftler', secili: s.hazir || '', ogeler: K().hazirlar.map(h => ({metin: h.ad, deger: h.id}))})}${DD.yuzey(`<div class="dd-satirlar">${slot('a', 1)}${slot('b', 2)}</div>`)}${sonuc()}</div>`;
    },
    altBar: () => DD.altEylem({dugmeler: [{metin: 'Tabağa ekle', ikon: 'ekle', tam: true, pasif: !(s.a && s.b), veri: {eylem: 'tabaga'}}]}),
    sonra: kok => {
      const baglar = [
        DD.on(kok, 'hazir', v => { const id = [].concat(v)[0]; if (id) { hazirSec(id); DD.tazele(); } }),
        DD.on(kok, 'olcu', v => { s.olcu = v; DD.tazele(); }),
        DD.eylem(kok, 'sec', el => secSheet(el.dataset.id)),
        DD.eylem(kok, 'kaldir', el => { s[el.dataset.id] = null; s.hazir = null; DD.tazele(); }),
        DD.eylem(kok, 'tabaga', ekleSheet)
      ];
      return () => baglar.forEach(c => c());
    }
  });
})();
