/* Tabak Kur (#/denge/tabak): yemek odaklı tabak kurma. Hesap Dada Diet web'iyle aynıdır (veri/tabak.js, moduller-tabak.js).
 * Yemek Küçük/Orta/Büyük seçilir, gram üzerinden dört bölmeye dağılır; ideal aralığa uzaklık × 0,47 düşülür. Mercimek Köftesi orta porsiyon 72 eder.
 * Durum: 'tabak-kur' [{slug, tur:'yemek'|'besin', miktar (porsiyon çarpanı ya da gram), etiket}].
 */
(() => {
  const {sayi} = DD;
  const T = () => DDV.tabakKur, ANAHTAR = 'tabak-kur', SIRA = ['sebze', 'protein', 'karb', 'yag'];
  const PORSIYON = [['Küçük', .5], ['Orta', 1], ['Büyük', 1.5]];
  const ekYemek = y => ({slug: y.slug, ad: y.ad, kategori: y.tur, porsiyonKcal: y.deger.kcal, P: y.deger.protein, K: y.deger.karb, Y: y.deger.yag, gorsel: null});
  const yemekBul = s => { const e = T().ekYemek.find(y => y.slug === s); return e ? ekYemek(e) : DDV.yemekler.find(y => y.slug === s); };
  const yemekBilgi = s => { const y = T().yemek[s]; return typeof y === 'string' ? T().kategori[y] : y || null; };
  const yemekler = () => Object.keys(T().yemek).map(yemekBul).filter(Boolean);
  const bolmesi = b => (b.slug === 'avokado' ? 'yag' : T().besinGrubu[b.kategori] || 'karb');
  const kayit = k => (k.tur === 'yemek' ? yemekBul(k.slug) : DDV.besinBul(k.slug));
  const kcalOf = k => { const b = kayit(k); return k.tur === 'yemek' ? b.porsiyonKcal * k.miktar : b.kcal * k.miktar / 100; };
  const makroOf = (k, m) => { const b = kayit(k); return (b[m] || 0) * (k.tur === 'yemek' ? k.miktar : k.miktar / 100); };

  const hesap = l => {
    const gram = {sebze: 0, protein: 0, karb: 0, yag: 0};
    l.forEach(k => {
      const y = k.tur === 'yemek' && yemekBilgi(k.slug);
      if (y) SIRA.forEach((id, i) => { gram[id] += y.gram * k.miktar * y.oran[i] / 100; });
      else gram[bolmesi(kayit(k))] += k.miktar;
    });
    const t = SIRA.reduce((s, id) => s + gram[id], 0), oran = {};
    let sapma = 0;
    SIRA.forEach(id => { const o = t ? gram[id] / t * 100 : 0, [alt, ust] = T().bolme[id].aralik; oran[id] = o; sapma += o < alt ? alt - o : o > ust ? o - ust : 0; });
    return {oran, skor: t ? Math.round(Math.max(0, 100 - sapma * T().katsayi)) : 0};
  };
  const oneri = (l, h) => {
    const eksik = SIRA.map(id => ({id, fark: T().bolme[id].aralik[0] - Math.round(h.oran[id])})).filter(x => x.fark > 0).sort((a, b) => b.fark - a.fark);
    if (eksik.length) {
      const id = eksik[0].id, [slug, gram, ne, dugme] = T().oneri[id], sonra = hesap([...l, {slug, tur: 'besin', miktar: gram}]).skor;
      if (sonra > h.skor) return {metin: `Tabağında **${T().bolme[id].ad.toLocaleLowerCase('tr')} oranı** düşük kaldı. Yanına ${ne} ekleyerek ${h.skor < 90 && sonra >= 90 ? 'puanını 90 üzerine çıkarabilirsin' : `puanını ${sonra} civarına çıkarabilirsin`}.`, eylem: {metin: dugme, veri: {eylem: 'oneri-ekle', id}}};
    }
    const agir = h.oran.karb > 30 ? 'Karbonhidrat' : h.oran.yag > 15 ? 'Yağ' : null;
    if (agir) return {metin: `**${agir} ağırlığı** yüksek. Muadilini bulup tabağı dengeleyebilirsin.`, eylem: {metin: 'Değişim önerileri', git: '#/denge/muadil'}};
    return {metin: 'Tabağın **ideal aralığa** yakın.'};
  };

  const tabak = () => DD.durum.oku(ANAHTAR, []);
  const yaz = l => DD.durum.yaz(ANAHTAR, l);
  const sonucSatir = (x, ctx) => ({gorsel: x.gorsel ?? null, baslik: x.ad, alt: ctx.kat === 'besin' ? `${x.kategori} · 100 g ${sayi(x.kcal)} kcal` : `${x.kategori} · ${sayi(x.porsiyonKcal)} kcal`, veri: {eylem: 'sec', id: x.slug}});
  const sonucHtml = ctx => {
    const q = (ctx.q || '').toLocaleLowerCase('tr'), l = (ctx.kat === 'besin' ? DDV.besinler : yemekler()).filter(x => !q || x.ad.toLocaleLowerCase('tr').includes(q)).slice(0, 6);
    return l.length ? DD.satirlar(l.map(x => sonucSatir(x, ctx))) : DD.veriYok('Bu aramada **sonuç yok**.');
  };
  const durumHtml = l => {
    if (!l.length) return DD.kart({html: `<div class="dd-yigin">${DD.tabakBolme({bos: true, ideal: T().bolme})}${DD.p('**Tabağın boş.** Hazır bir tabak seç ya da aşağıdan yemeğini ara; ideal tabak böyle bölünür.', {orta: true, ton: 'ikincil'})}${DD.tabakOranlar({ideal: T().bolme, bos: true})}</div>`});
    const h = hesap(l), o = oneri(l, h), bolme = Object.fromEntries(SIRA.map(id => [id, Math.round(h.oran[id])]));
    return `<div class="dd-yigin">
      ${DD.kart({html: `<div class="dd-yigin-24">${DD.tabakBolme({bolme: bolme, skor: h.skor, ideal: T().bolme})}${DD.tabakOranlar({bolme, ideal: T().bolme})}</div>`})}
      ${DD.ipucu({ikon: 'wand-magic-sparkles', metin: o.metin, eylem: o.eylem})}
      ${DD.satirlar(l.map((k, i) => DD.satirKap({gorsel: kayit(k).gorsel ?? null, baslik: kayit(k).ad, alt: `${k.etiket} · ${sayi(kcalOf(k))} kcal`}, DD.ikonBtn({ikon: 'sil', etiket: `${kayit(k).ad} çıkar`, veri: {eylem: 'cikar', id: i}}))))}
    </div>`;
  };

  const yemekSheet = x => {
    const y = yemekBilgi(x.slug), olcu = i => y?.olcu?.[i] ?? PORSIYON[i][0];
    let miktar = 1, etiket = 'Orta', gramli = false;
    const not = () => DD.p(`${olcu(PORSIYON.findIndex(p => p[1] === miktar))} · ${sayi(x.porsiyonKcal * miktar)} kcal`, {ton: 'ikincil', meta: true});
    DD.sheet({
      baslik: x.ad,
      html: `<div class="dd-yigin">${DD.segment({ad: 'porsiyon', etiket: 'Porsiyon', secili: '1', ogeler: PORSIYON.map(([ad, d]) => ({ad, deger: String(d)}))})}<div data-yuva="not">${not()}</div><div data-yuva="gram">${DD.btn({metin: 'Gramajı kendim girmek istiyorum', tur: 'text', tam: true, veri: {eylem: 'gram-ac'}})}</div></div>`,
      altBar: DD.btn({metin: 'Tabağa ekle', ikon: 'ekle', tam: true, veri: {eylem: 'tabaga'}}),
      sonra: h => {
        DD.on(h, 'porsiyon', v => { miktar = +v; etiket = PORSIYON.find(p => p[1] === miktar)[0]; gramli = false; h.querySelector('[data-yuva="not"]').innerHTML = not(); });
        DD.eylem(h, 'gram-ac', () => { gramli = true; h.querySelector('[data-yuva="gram"]').innerHTML = DD.stepper({ad: 'gram', deger: y?.gram ?? 150, min: 25, max: 600, adim: 25, birim: 'g', aria: 'Gramaj'}); });
        DD.eylem(h, 'tabaga', () => {
          const g = gramli ? +h.querySelector('input[name="gram"]').value : null, m = g ? g / (y?.gram ?? 150) : miktar;
          yaz([...tabak(), {slug: x.slug, tur: 'yemek', miktar: m, etiket: g ? `${sayi(g)} g` : etiket}]);
          h.kapat(); DD.tazele(); DD.toast(`**${x.ad}** tabağa eklendi`, {tur: 'basari'});
        });
      }
    });
  };
  const besinSheet = x => DD.sheet({
    baslik: x.ad,
    html: `${DD.alan({etiket: 'Miktar', html: DD.stepper({ad: 'gram', deger: bolmesi(x) === 'yag' ? 10 : 50, min: 5, max: 400, adim: bolmesi(x) === 'yag' ? 5 : 10, birim: 'g', aria: 'Miktar'})})}`,
    altBar: DD.btn({metin: 'Tabağa ekle', ikon: 'ekle', tam: true, veri: {eylem: 'tabaga'}}),
    sonra: h => DD.eylem(h, 'tabaga', () => { const g = +h.querySelector('input[name="gram"]').value; yaz([...tabak(), {slug: x.slug, tur: 'besin', miktar: g, etiket: `${sayi(g)} g`}]); h.kapat(); DD.tazele(); DD.toast(`**${x.ad}** tabağa eklendi`, {tur: 'basari'}); })
  });

  DD.ekran('tabak-kur', {
    tur: 'alt',
    ust: '#/denge',
    baslik: 'Tabak Kur',
    ciz: ctx => {
      ctx.kat ||= 'yemek';
      return `<div class="dd-ic dd-yigin">
        ${durumHtml(tabak())}
        ${DD.alan({etiket: 'Hazır tabaklar', html: DD.yatay(T().hazir.map((t, i) => DD.cip({metin: t.ad, veri: {eylem: 'hazir', id: i}})))})}
        ${DD.alan({etiket: 'Tabağına ekle', html: `${DD.segment({ad: 'kat', etiket: 'Tür', secili: ctx.kat, ogeler: [{ad: 'Yemekler', deger: 'yemek'}, {ad: 'Yan öğeler', deger: 'besin'}]})}${DD.arama({ad: 'q', yer: ctx.kat === 'besin' ? 'Ekmek, ceviz, yoğurt ara' : 'Karnıyarık, mercimek köftesi ara', deger: ctx.q})}<div data-yuva="sonuc">${sonucHtml(ctx)}</div>`})}
      </div>`;
    },
    altBar: () => (tabak().length ? DD.altEylem({dugmeler: [{metin: 'Temizle', tur: 'secondary', veri: {eylem: 'temizle'}}, {metin: 'Öğüne ekle', ikon: 'ekle', veri: {eylem: 'ogune'}}]}) : ''),
    sonra: (kok, ctx) => {
      const girdi = kok.querySelector('input[name="q"]');
      const ara = () => { ctx.q = girdi.value.trim(); const y = kok.querySelector('[data-yuva="sonuc"]'); y.innerHTML = sonucHtml(ctx); if (window.DDMetin) DDMetin.isle(y); };
      girdi.addEventListener('input', ara);
      const c = [
        DD.on(kok, 'kat', v => { ctx.kat = v; ctx.q = ''; DD.tazele(); }),
        DD.eylem(kok, 'sec', el => (ctx.kat === 'besin' ? besinSheet(DDV.besinBul(el.dataset.id)) : yemekSheet(yemekBul(el.dataset.id)))),
        DD.eylem(kok, 'hazir', el => { yaz(T().hazir[+el.dataset.id].kalem.filter(([s]) => yemekBul(s)).map(([slug, miktar]) => ({slug, tur: 'yemek', miktar, etiket: (PORSIYON.find(p => p[1] === miktar) || ['Orta'])[0]}))); DD.tazele(); }),
        DD.eylem(kok, 'oneri-ekle', el => { const [slug, gram] = T().oneri[el.dataset.id]; yaz([...tabak(), {slug, tur: 'besin', miktar: gram, etiket: `${sayi(gram)} g`}]); DD.tazele(); }),
        DD.eylem(kok, 'cikar', el => { yaz(tabak().filter((_, i) => i !== +el.dataset.id)); DD.tazele(); }),
        DD.eylem(kok, 'temizle', () => { yaz([]); DD.tazele(); }),
        DD.eylem(kok, 'ogune', () => {
          tabak().forEach(k => { const b = kayit(k); DD.tabagim.ekle({ad: b.ad, slug: k.slug, gorsel: b.gorsel ?? null, miktar: k.miktar, birim: k.tur === 'yemek' ? 'porsiyon' : 'g', kcal: kcalOf(k), P: makroOf(k, 'P'), K: makroOf(k, 'K'), Y: makroOf(k, 'Y'), Lif: 0, taslak: 'tabak-kur', kaynak: 'arama'}); });
          yaz([]); DD.tazele(); DD.tabagim.ac();
        })
      ];
      return () => { girdi.removeEventListener('input', ara); c.forEach(f => f()); };
    }
  });
})();
