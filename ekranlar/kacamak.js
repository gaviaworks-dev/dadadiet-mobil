/* SCR-42 Kaçamak kurtarma (#/denge/kacamak, ?senaryo=id). Referans: Simple içgörü kartı, Gentler Streak kısa liste, MacroFactor trend (tasks/referanslar.md Denge).
 * Suçlayıcı dil, kırmızı ve puan cezası yok. Haftalık cümle DDV.gecmis'ten türetilir; bugün sürdüğü için ortalamaya girmez.
 * Durum: 'kacamak' {id, adimlar:{senaryoId:[indeks]}}. Kayıt Tabağım üzerinden gider. #/denge/kacamak?hal=hata hata hali.
 */
(() => {
  const {sayi} = DD;
  let hataGosterildi = false;
  const K = () => DDV.denge.kurtarma;
  const oku = () => ({id: null, adimlar: {}, ...DD.durum.oku('kacamak', null)});
  const yaz = d => DD.durum.yaz('kacamak', d);
  const bul = id => K().senaryolar.find(s => s.id === id);
  const kisaAd = s => s.ad.replace(/ yedim$/, '');

  const trend = () => {
    const l = DDV.gecmis.filter(g => g.tarih !== DD.bugunIso()).slice(-7), ort = Math.round(l.reduce((t, g) => t + g.kcal, 0) / l.length), h = DDV.bugun.hedefKcal;
    const yakin = Math.abs(ort - h) <= h * .05;
    return `Son ${l.length} günde ortalaman **${sayi(ort)} kcal**, hedefin ${sayi(h)}. ${yakin ? 'Tek öğün bu tabloyu **değiştirmez**.' : 'Belirleyici olan **tek öğün değil**, genel örüntü.'}`;
  };
  const adimListe = (s, d) => { const y = d.adimlar[s.id] || []; return `<div class="dd-yigin-12">${s.adimlar.map((a, i) => DD.gorevSatir({id: `adim-${i}`, baslik: a.baslik, alt: a.metin, tamam: y.includes(i)})).join('')}</div>`; };
  const tamamBant = (s, d) => ((d.adimlar[s.id] || []).length === s.adimlar.length ? DD.bant({ton: 'basari', ikon: 'onay', metin: '**Üç adım da tamam.** Gününe olağan akışında devam edebilirsin.'}) : '');
  const detay = s => {
    const d = oku();
    return `<div class="dd-yigin">${DD.icgoruKart({baslik: `${kisaAd(s)}, ${s.porsiyon.toLocaleLowerCase('tr')}.`, metin: s.mesaj})}${DD.bas('Üç küçük adım')}${adimListe(s, d)}<div data-yuva="tamam">${tamamBant(s, d)}</div>${DD.bas('Haftana bakınca')}${DD.bilgi({metin: trend()})}${DD.bant({metin: K().not.replace('olağan hâline döndürmek', '**olağan hâline döndürmek**')})}</div>`;
  };
  const baslangic = () => DD.veriYok('Bir seçim yaptığında **üç küçük adım** burada görünür.');
  const secimler = sec => DD.secimler({ad: 'senaryo', duzen: 'iki', secili: sec, ogeler: [...K().senaryolar.map(s => ({k: s.id, ad: kisaAd(s), alt: s.porsiyon, ikon: s.ikon})), {k: 'baska', ad: 'Başka bir şey', alt: 'Besin ara', ikon: 'ara_'}]});

  // Yalnız ekran kaydırıcısı kayar; scrollIntoView üst barı da dışarı iterdi.
  const detayaKaydir = () => {
    const kok = DD.aktif()?.el, k = kok?.querySelector('.dd-kaydir'), el = kok?.querySelector('[data-yuva="detay"]'), bar = kok?.querySelector('.dd-header');
    if (!el) return;
    k.scrollTo({top: k.scrollTop + el.getBoundingClientRect().top - (bar?.getBoundingClientRect().bottom ?? 0) - DD.TK.space[16], behavior: DD.azHareket() ? 'auto' : 'smooth'});
  };

  DD.ekran('kacamak', {
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
      const id = bul(ctx.sorgu.senaryo)?.id || oku().id, s = bul(id);
      return `<div class="dd-ic dd-yigin">${DD.metinBlok({baslik: 'Ne oldu?', rol: 'section', metin: K().altMetin.replace('Bir öğün planı bozmaz.', '**Bir öğün planı bozmaz.**')})}${secimler(id)}<div data-yuva="detay">${s ? detay(s) : baslangic()}</div></div>`;
    },
    altBar: ctx => DD.altEylem({dugmeler: [{metin: 'Günlüğe ekle', ikon: 'ekle', tam: true, pasif: !(bul(ctx.sorgu.senaryo) || bul(oku().id)), veri: {eylem: 'ekle'}}]}),
    sonra: (kok, ctx) => {
      const bagAdim = () => (bul(oku().id)?.adimlar || []).map((_, i) => DD.on(kok, `adim-${i}`, v => {
        const d = oku(), s = bul(d.id), l = (d.adimlar[s.id] || []).filter(x => x !== i), y = v ? [...l, i] : l;
        yaz({...d, adimlar: {...d.adimlar, [s.id]: y}});
        kok.querySelector('[data-yuva="tamam"]').innerHTML = tamamBant(s, oku());
      }));
      if (ctx.sorgu.senaryo && bul(ctx.sorgu.senaryo)) yaz({...oku(), id: ctx.sorgu.senaryo});
      const adimBaglari = bagAdim();
      const baglar = [
        DD.on(kok, 'senaryo', v => { if (v === 'baska') { DD.tazele(); DD.git('#/besin-ara'); return; } yaz({...oku(), id: v}); DD.tazele(); requestAnimationFrame(detayaKaydir); }),
        DD.eylem(kok, 'ekle', () => {
          const s = bul(oku().id); if (!s) return;
          const m = s.porsiyon.match(/^(\d+)\s+(.+)$/);
          DD.tabagim.ekle({slug: s.slug, ad: kisaAd(s), miktar: m ? +m[1] : 1, birim: m ? m[2] : s.porsiyon, gram: s.gram, kcal: s.kcal, P: s.P, K: s.K, Y: s.Y, Lif: s.Lif || 0, gorsel: s.gorsel});
          DD.toast(`**${kisaAd(s)}** Tabağım'a eklendi`, {tur: 'basari'});
        })
      ];
      return () => [...adimBaglari, ...baglar].forEach(c => c());
    }
  });
})();
