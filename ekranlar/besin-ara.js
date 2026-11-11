/* SCR-12 Besin arama (#/besin-ara, modal). Referans: tasks/referanslar.md Besin arama (MacroFactor liste ve +, Lifesum öğüne göre çip, Fooducate porsiyon, Walmart autocomplete).
 * Bu ekran kayıt yazmaz: yalnız Tabağım'a ekler, kaydı Bugün yapar (tasks/ekran-sozlesme.md). Hedef öğün 'tabagim-ogun' (DD.durum) anahtarındadır.
 * Sorgu: ?ogun=<id> hedef öğün, ?q=metin, ?besin=<slug> ve ?yemek=<slug> porsiyon sheet'ini açar, ?hal=hata bağlantı hatası.
 * Kalıcı: besin-favori, besin-son (anahtar listesi). Besin anahtarı slug, yemek anahtarı 'y:slug' (kazandibi iki listede de var).
 */
(() => {
  const {sayi, ondalik} = DD;
  const MAKRO = ['P', 'K', 'Y', 'Lif'];
  const SEKMELER = [{ad: 'Sık', deger: 'sik', ikon: 'yildiz'}, {ad: 'Son', deger: 'son', ikon: 'gecmis'}, {ad: 'Favori', deger: 'favori', ikon: 'kaydet'}];
  const bir = n => Math.round(n * 10) / 10;
  const kisaAd = ad => ad.split(' (')[0];

  // ---------- Besin ve yemek tek biçimde ----------
  const yemekBul = slug => DDV.yemekler.find(x => x.slug === slug);
  const bul = k => (k.startsWith('y:') ? yemekBul(k.slice(2)) : DDV.besinBul(k));
  const yemekMi = k => k.startsWith('y:');
  const varsayilan = b => { const p = b.porsiyonlar.find(x => x.birim !== 'gram'); return p ? {birim: p.birim, miktar: 1, gram: p.gram, etiket: p.etiket} : {birim: 'gram', miktar: 100, gram: 100, etiket: '100 gram'}; };
  const besinKalem = (k, b, v) => ({anahtar: k, slug: b.slug, ad: b.ad, miktar: v.miktar, birim: v.birim, gram: v.gram, gorsel: b.gorsel, kcal: Math.round(b.kcal * v.gram / 100), ...Object.fromEntries(MAKRO.map(m => [m, bir(b[m] * v.gram / 100)]))});
  const yemekKalem = (k, y, f) => ({anahtar: k, slug: y.slug, ad: y.ad, miktar: f, birim: 'porsiyon', gorsel: y.gorsel, kcal: Math.round(y.porsiyonKcal * f), ...Object.fromEntries(MAKRO.map(m => [m, bir((y[m] || 0) * f)]))});
  const ilkKalem = k => { const x = bul(k); return yemekMi(k) ? yemekKalem(k, x, 1) : besinKalem(k, x, varsayilan(x)); };
  const altMetin = k => { const x = bul(k), c = ilkKalem(k); return `${sayi(c.kcal)} kcal · ${yemekMi(k) ? '1 porsiyon' : varsayilan(x).etiket}`; };

  // ---------- Listeler ----------
  const favoriler = () => DD.durum.oku('besin-favori', [...DDV.besinListeleri.favori, ...DDV.besinListeleri.yemekFavori.map(s => `y:${s}`)]);
  const sonlar = () => [...new Set([...DD.durum.oku('besin-son', []), ...DDV.besinListeleri.son])];
  const sekmeListe = sekme => (sekme === 'favori' ? favoriler() : sekme === 'son' ? sonlar() : DDV.besinListeleri.sik).filter(bul);
  const sonaYaz = k => DD.durum.yaz('besin-son', [k, ...DD.durum.oku('besin-son', []).filter(x => x !== k)].slice(0, 12));
  const dizin = () => [...DDV.besinler.map(b => [b.slug, b.ad, DD.katla(b.ad)]), ...DDV.yemekler.map(y => [`y:${y.slug}`, y.ad, DD.katla(y.ad)])];
  let arsiv = null;
  const ara = q => {
    const t = DD.katla(q).split(/\s+/).filter(Boolean);
    arsiv ||= dizin();
    const puan = a => (a.startsWith(t[0]) ? 2 : a.includes(` ${t[0]}`) ? 1 : 0);
    return arsiv.filter(x => t.every(p => x[2].includes(p))).sort((a, b) => puan(b[2]) - puan(a[2]) || a[1].localeCompare(b[1], 'tr')).map(x => x[0]);
  };

  // ---------- Öğün ----------
  const ogunBul = id => DDV.bugun.ogunler.find(o => o.id === id);
  // Seçilmiş hedef öğün yoksa saate göre (DD.saatOgunu): Tabağım çubuğu ve sayfasıyla aynı varsayılan.
  const siradaki = () => DD.saatOgunu();

  // ---------- Parçalar ----------
  // Kaynak ilk ekleyenindir: fotoğraftan gelen tabağa aramayla eklemek kaynağı değiştirmez.
  const tabagaEkle = kalem => { if (!Object.keys(DD.tabagim.meta()).length) DD.tabagim.meta({kaynak: 'arama'}); DD.tabagim.ekle(kalem); };
  const tabakta = k => DD.tabagim.liste().find(t => t.anahtar === k);
  const arti = k => { const t = tabakta(k), ad = kisaAd(bul(k).ad); return DD.ikonBtn({ikon: t ? 'onay' : 'ekle', tur: t ? 'dolu' : 'tint', etiket: t ? `${ad} Tabağım'dan çıkar` : `${ad} Tabağım'a ekle`, veri: {eylem: 'hizli', id: k}}); };
  const satir = (k, q) => { const x = bul(k); return DD.satirKap(DD.satir({sol: DD.gorsel({src: x.gorsel, ad: x.ad, ton: DD.makroTon(x)}), baslik: x.ad, baslikHtml: q ? DD.vurguluEsles(x.ad, q) : undefined, alt: altMetin(k), veri: {eylem: 'porsiyon', id: k}, ok: false}), arti(k)); };
  const listeHtml = s => {
    const l = sekmeListe(s.sekme);
    if (l.length) return DD.satirlar(l.map(k => satir(k)));
    return DD.bos({ikon: 'kaydet', baslik: 'Favorin yok', metin: 'Kaydettiğin besinler **burada durur**.'});
  };
  // Öğüne göre öneri: o öğünde bugün yer alan besinler.
  const oneri = s => {
    const o = ogunBul(s.ogun), l = o.besinler.filter(b => DDV.besinBul(b.slug)).slice(0, 6);
    if (!l.length) return '';
    return `<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">${DD.esc(o.ad)} için</span>${DD.yatay(l.map(b => DD.cip({metin: kisaAd(b.ad), gorsel: b.gorsel, veri: {eylem: 'porsiyon', id: b.slug}})))}</div>`;
  };
  const acilis = s => `<div class="dd-yigin">${oneri(s)}${DD.segment({ad: 'sekme', etiket: 'Besin listesi', secili: s.sekme, ogeler: SEKMELER})}<div data-yuva="liste">${listeHtml(s)}</div></div>`;
  const sonucHtml = q => {
    const l = ara(q);
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Besin bulunamadı', metin: `“**${q}**” için kayıt yok. Sesle söyleyebilir ya da **tabağını fotoğraflayabilirsin**.`, eylem: {metin: 'Sesle söyle', ikon: 'mikrofon', git: '#/ai/ses'}, ikincil: {metin: 'Tabağını tara', ikon: 'kamera', git: '#/ai/kamera?mod=tabak'}});
    return `<div class="dd-arama-sonuc dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">${sayi(l.length)} sonuç</span>${DD.satirlar(l.slice(0, 30).map(k => satir(k, q)))}</div>`;
  };
  const govde = s => (s.q ? sonucHtml(s.q) : acilis(s));

  // ---------- Porsiyon sheet'i ----------
  const makroHedef = m => DD.durum.oku('plan', null)?.makro?.[m] ?? DDV.bugun.makro[m].hedef;
  const makroOzet = c => DD.makroCubuk(Object.fromEntries(MAKRO.map(m => [m, {alinan: c[m], hedef: makroHedef(m)}])), {kart: false});
  const olcuNot = (x, birim) => {
    const p = x.porsiyonlar.find(y => y.birim === birim);
    if (!p || birim === 'gram') return DD.p(`**100 gramda** ${sayi(x.kcal)} kcal. Kaynak: ${x.kaynak}.`, {ton: 'ikincil', meta: true});
    return DD.p(`**1 ${p.birim}:** ${p.etiket.replace(/^1 /, '')}, ${sayi(p.gram)} g${p.kaynak === 'varsayılan' ? ' (ev ölçüsü, yaklaşık)' : ''}.`, {ton: 'ikincil', meta: true});
  };
  const kalpAyar = k => { const on = favoriler().includes(k); return {ikon: 'kaydet', tur: on ? 'dolu' : 'tint', etiket: on ? 'Favorilerden çıkar' : 'Favorilere ekle', veri: {eylem: 'favori'}}; };
  const porsiyonAc = (k, degisti) => {
    const x = bul(k), yemek = yemekMi(k); let kalem = ilkKalem(k);
    const bas = DD.satirKap(DD.satir({sol: DD.gorsel({src: x.gorsel, ad: x.ad, ton: DD.makroTon(x)}), baslik: x.ad, alt: x.kategori}), DD.ikonBtn(kalpAyar(k)));
    const v = yemek ? null : varsayilan(x);
    const secici = yemek
      ? DD.alan({etiket: 'Kaç porsiyon?', html: `${DD.kesirIzgara({ad: 'kesir', secili: 1})}<div class="dd-porsiyon-ozet"><b class="dd-t-stat" data-yuva="kcal">${sayi(kalem.kcal)} kcal</b></div>`})
      : DD.porsiyon({ad: 'porsiyon', birimler: x.porsiyonlar, secili: v.birim, miktar: v.miktar, kcal100: x.kcal});
    DD.sheet({
      baslik: 'Porsiyon',
      html: `<div class="dd-yigin">${bas}${secici}<div data-yuva="makro">${makroOzet(kalem)}</div><div data-yuva="not">${yemek ? DD.p(`**1 porsiyon** ${sayi(x.porsiyonKcal)} kcal.`, {ton: 'ikincil', meta: true}) : olcuNot(x, v.birim)}</div></div>`,
      altBar: DD.btn({metin: 'Tabağıma ekle', ikon: 'ekle', tam: true, veri: {eylem: 'ekle'}}),
      sonra: d => {
        const tazele = () => { d.querySelector('[data-yuva="makro"]').innerHTML = makroOzet(kalem); };
        DD.on(d, 'porsiyon', p => { kalem = besinKalem(k, x, p); tazele(); d.querySelector('[data-yuva="not"]').innerHTML = olcuNot(x, p.birim); });
        DD.on(d, 'kesir', f => { kalem = yemekKalem(k, x, +f); tazele(); d.querySelector('[data-yuva="kcal"]').textContent = `${sayi(kalem.kcal)} kcal`; });
        DD.eylem(d, 'favori', el => { const on = favoriler().includes(k); DD.durum.yaz('besin-favori', on ? favoriler().filter(y => y !== k) : [k, ...favoriler()]); el.outerHTML = DD.ikonBtn(kalpAyar(k)); DD.toast(on ? 'Favorilerden çıkarıldı' : '**Favorilere** eklendi', {ikon: 'kaydet'}); degisti(); });
        DD.eylem(d, 'ekle', () => { tabagaEkle(kalem); sonaYaz(k); d.kapat(); DD.toast(`**${kisaAd(x.ad)}** Tabağına eklendi`, {ikon: 'tabak'}); });
      }
    });
  };

  let hataGosterildi = false;
  DD.ekran('besin-ara', {
    tur: 'modal',
    nav: 'bugun',
    baslik: 'Besin ekle',
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ciz: ctx => {
      const ilk = ctx.sorgu.ogun || DD.durum.oku('tabagim-ogun', null) || siradaki();
      const s = ctx.s ||= {q: ctx.sorgu.q || '', sekme: 'sik', ogun: ogunBul(ilk) ? ilk : siradaki()};
      return `<div class="dd-ic dd-yigin">${DD.arama({ad: 'besin', yer: 'Besin ya da yemek ara', deger: s.q, mikrofon: true, sonuc: false, sonEk: DD.ikonBtn({ikon: 'barkod', etiket: 'Barkod tara', git: '#/ai/kamera?mod=barkod'})})}${DD.cipler({ad: 'ogun', tur: 'tek', etiket: 'Hedef öğün', secili: s.ogun, ogeler: DDV.bugun.ogunler.map(o => ({metin: o.ad, deger: o.id, ikon: o.ikon}))})}<div data-yuva="govde">${govde(s)}</div></div>`;
    },
    sonra: (kok, ctx) => {
      const s = ctx.s, yer = kok.querySelector('[data-yuva="govde"]'), girdi = kok.querySelector('.dd-arama input');
      if (!yer) return null;
      const ciz = () => { yer.innerHTML = govde(s); };
      const listeCiz = () => { const l = kok.querySelector('[data-yuva="liste"]'); if (l) l.innerHTML = listeHtml(s); };
      if (ctx.sorgu.ogun) DD.durum.yaz('tabagim-ogun', s.ogun);
      // Seçili öğün çipi şeridin dışında kalmasın.
      const serit = kok.querySelector('[data-ad="ogun"]'), secili = serit.querySelector('[aria-pressed=true]');
      serit.scrollLeft += secili.getBoundingClientRect().left - serit.getBoundingClientRect().left - (serit.clientWidth - secili.offsetWidth) / 2;
      let zaman = 0;
      const yazildi = () => { clearTimeout(zaman); zaman = setTimeout(() => { s.q = girdi.value.trim(); ciz(); }, DD.TK.motion.oneri.inputDebounce); };
      girdi.addEventListener('input', yazildi);
      const tabak = () => kok.querySelectorAll('[data-eylem="hizli"]').forEach(el => { el.outerHTML = arti(el.dataset.id); });
      // Tabağım kaydı Bugün'e geçince modal işini bitirmiştir; üstte başka ekran varsa o kapanmaz.
      const kayit = () => { if (DD.aktif()?.ad === 'besin-ara') DD.geri(); };
      document.addEventListener('dd-tabagim', tabak);
      document.addEventListener('dd-tabagim-kaydet', kayit);
      const baglar = [
        DD.on(kok, 'ogun', id => { s.ogun = id; DD.durum.yaz('tabagim-ogun', id); if (!s.q) ciz(); }),
        DD.on(kok, 'sekme', v => { s.sekme = v; listeCiz(); }),
        DD.eylem(kok, 'porsiyon', el => porsiyonAc(el.dataset.id, listeCiz)),
        DD.eylem(kok, 'hizli', el => { const k = el.dataset.id, t = tabakta(k); if (t) DD.tabagim.cikar(t.id); else { tabagaEkle(ilkKalem(k)); sonaYaz(k); DD.titres(8); } })
      ];
      const dis = ctx.sorgu.besin || (ctx.sorgu.yemek && `y:${ctx.sorgu.yemek}`);
      if (dis && !ctx.acildi && bul(dis)) { ctx.acildi = true; porsiyonAc(dis, listeCiz); }
      return () => {
        clearTimeout(zaman); girdi.removeEventListener('input', yazildi);
        document.removeEventListener('dd-tabagim', tabak); document.removeEventListener('dd-tabagim-kaydet', kayit);
        baglar.forEach(c => c());
        if (!DD.tabagim.liste().length) DD.durum.sil('tabagim-ogun');
      };
    }
  });
})();
