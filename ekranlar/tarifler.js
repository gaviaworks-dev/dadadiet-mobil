/* Sağlıklı Tarifler (#/tarifler): Gastro liste-v2. Web karşılığı tarifler/ (public-beslenme-tarif.js liste): arama, öğün, süre, kalori, beslenme etiketi, kategori.
 * Kaynak DDV.yemekler (88, görselli, 1 porsiyon değeri). Öğün web tarifinde varsa DDV.kutuphane.tarifler[slug].ogunler, yoksa kategoriden türetilir (DDV.kutuphane.kategoriOgun).
 * Durum: 'tarifler-liste' {seg, q, gorunum, sira, f:{kategori[], ogun[], kalori[], sure[], etiket[]}} ekran tercihi.
 * Dış bağlantı: ?kategori=Çorba, ?ogun=kahvalti, ?etiket=Vegan, ?q=metin, ?temiz=1, ?hal=hata. */
(() => {
  const SAYFA = 12, ANAHTAR = 'tarifler-liste', GRUPLAR = ['kategori', 'ogun', 'kalori', 'sure', 'etiket'], SEGMENT = ['kategori', 'ogun'];
  const KALORI = [{deger: '0-200', ad: '200 kcal altı', min: 0, max: 200}, {deger: '200-400', ad: '200-400 kcal', min: 200, max: 400}, {deger: '400-2000', ad: '400 kcal üstü', min: 400, max: 2000}];
  const SURE = [{deger: '0-15', ad: '15 dakikadan az', min: 0, max: 15}, {deger: '15-30', ad: '15-30 dakika', min: 15, max: 30}, {deger: '30-45', ad: '30-45 dakika', min: 30, max: 45}, {deger: '45-60', ad: '45-60 dakika', min: 45, max: 60}, {deger: '60-120', ad: '1-2 saat', min: 60, max: 120}, {deger: '120-9999', ad: '2 saatten uzun', min: 120, max: 9999}];
  const ETIKET = [{deger: 'Vegan', ad: 'Vegan', ikon: 'leaf'}, {deger: 'Vejetaryen', ad: 'Vejetaryen', ikon: 'seedling'}, {deger: 'Glütensiz', ad: 'Glütensiz', ikon: 'wheat-awn-circle-exclamation'}];
  const SIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['kcal', 'En az kalori', 'arrow-down-short-wide'], ['sure', 'En kısa süre', 'hourglass-start'], ['protein', 'En çok protein', 'dumbbell'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const K = () => DDV.kutuphane || {};
  const kategoriler = () => [...new Set(DDV.yemekler.map(y => y.kategori))];
  const SECENEK = {
    kategori: () => kategoriler().map(k => ({deger: k, ad: k})),
    ogun: () => (K().tarifOgunleri || []).map(o => ({deger: o.deger, ad: o.ad, ikon: o.ikon})),
    kalori: () => KALORI, sure: () => SURE, etiket: () => ETIKET
  };
  const BASLIK = {kategori: 'Kategori', ogun: 'Öğün', kalori: 'Kalori (porsiyon)', sure: 'Hazırlık süresi', etiket: 'Beslenme etiketi'};
  const KISA = {kategori: 'Kategori', ogun: 'Öğün'};
  const IKON = {kategori: 'layer-group', ogun: 'ogun', kalori: 'kalori', sure: 'saat', etiket: 'tag'};
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g, []]));
  const ogunleri = y => K().tarifler?.[y.slug]?.ogunler || K().kategoriOgun?.[y.kategori] || [];
  const tam = y => !!K().tarifler?.[y.slug];

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {seg: SEGMENT.includes(d.seg) ? d.seg : 'kategori', q: d.q || '', gorunum: d.gorunum === 'liste' ? 'liste' : 'izgara', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {...bosF(), ...(d.f || {})}, gosterilen: SAYFA};
    const dis = GRUPLAR.filter(g => sorgu[g]);
    if (sorgu.temiz || sorgu.q || dis.length) { s.f = bosF(); s.q = sorgu.q || ''; dis.forEach(g => { s.f[g] = sorgu[g].split(','); }); if (SEGMENT.includes(dis[0])) s.seg = dis[0]; }
    return s;
  };
  const yaz = ({seg, q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {seg, q, gorunum, sira, f});
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0);

  // ---------- Süzme ve sıralama ----------
  const aralik = (l, v, n) => { const x = l.find(a => a.deger === v); return x ? n >= x.min && n < x.max : false; };
  const eslesir = (y, g, v) => (g === 'kategori' ? y.kategori === v : g === 'ogun' ? ogunleri(y).includes(v) : g === 'kalori' ? aralik(KALORI, v, y.porsiyonKcal) : g === 'sure' ? aralik(SURE, v, y.sureDk) : y.etiketler.includes(v));
  const katlanmis = new Map();
  const metin = y => { if (!katlanmis.has(y.slug)) katlanmis.set(y.slug, DD.katla(`${y.ad} ${y.kategori} ${y.aciklama || ''} ${y.etiketler.join(' ')}`)); return katlanmis.get(y.slug); };
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return DDV.yemekler.filter(y => GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(y, g, v))) && q.every(x => metin(y).includes(x)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(y => eslesir(y, g, v)).length;
  // Önerilen: adım adım tarifi olanlar önde, sonra veri sırası (canlıdaki yayın sırası).
  const sirala = (l, sira) => {
    const sira0 = new Map(DDV.yemekler.map((y, i) => [y.slug, i])), ad = (a, b) => a.ad.localeCompare(b.ad, 'tr');
    const fark = {onerilen: (a, b) => (tam(b) - tam(a)) || sira0.get(a.slug) - sira0.get(b.slug), kcal: (a, b) => a.porsiyonKcal - b.porsiyonKcal || ad(a, b), sure: (a, b) => a.sureDk - b.sureDk || ad(a, b), protein: (a, b) => b.P - a.P || ad(a, b), ad}[sira];
    return [...l].sort(fark);
  };

  // ---------- Parçalar ----------
  const gorselCache = {};
  const gorsel = (g, v) => {
    const k = `${g}|${v}`;
    if (!(k in gorselCache)) { const alinan = new Set(Object.values(gorselCache)); const l = DDV.yemekler.filter(y => eslesir(y, g, v)); gorselCache[k] = (l.find(y => !alinan.has(y.gorsel)) || l[0])?.gorsel; }
    return gorselCache[k];
  };
  const segment = s => DD.segment({ad: 'kapsam', etiket: 'Filtre türü', secili: s.seg, ogeler: SEGMENT.map(g => ({ad: KISA[g], deger: g}))});
  const serit = s => DD.cipSerit({ad: 'cip', etiket: BASLIK[s.seg], secili: s.f[s.seg].length ? s.f[s.seg] : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'ogun', sayi: suz(s, s.f, s.seg).length}, ...SECENEK[s.seg]().map(x => ({metin: x.ad, deger: x.deger, gorsel: gorsel(s.seg, x.deger), sayi: say(s, s.f, s.seg, x.deger)}))]});
  const meta = y => `${DD.sure(y.sureDk)} · ${DD.sayi(y.porsiyonKcal)} kcal`;
  const kart = y => DD.icerikKart({gorsel: y.gorsel, kategori: y.kategori, baslik: y.ad, meta: meta(y), git: `#/tarif/${y.slug}`});
  const satir = y => DD.satir({sol: DD.gorsel({src: y.gorsel, ad: y.ad}), baslik: y.ad, alt: `${y.kategori} · ${DD.sure(y.sureDk)}`, deger: `${DD.sayi(y.porsiyonKcal)} kcal`, git: `#/tarif/${y.slug}`, ok: true});
  const ogeler = (l, s) => (s.gorunum === 'liste' ? l.map(satir) : l.map(kart));
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(ogeler(l, s))] : ogeler(l, s), {gorunum: s.gorunum});
  const ad = (g, v) => SECENEK[g]().find(x => x.deger === v)?.ad ?? v;
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g].map(v => ({metin: ad(g, v), kapat: true, etiket: `${ad(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))});
  const kayitli = () => DD.durum.oku('kayitli-tarifler', DD.yeniHesap() ? [] : (DDV.uye?.kayitli?.tarifler || [])).filter(x => DDV.yemekler.some(y => y.slug === x));
  const ustKart = () => {
    const n = kayitli().length;
    return n ? DD.eylemKart({ikon: 'kaydet', baslik: 'Kaydettiğin tarifler', alt: `${n} tarif`, git: '#/kaydedilenler?tur=tarifler'}) : DD.eylemKart({ikon: 'tabak', baslik: 'Tabağını kur', alt: 'Tarifi öğünün dengesine göre seç', git: '#/denge/tabak'});
  };
  const bosMetin = s => (s.q ? `“**${s.q}**” için tarif bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan tarif yok. **Seçimlerini temizleyip** yeniden bak.');
  const icerik = (s, l) => {
    const filtreli = secimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli ? '' : ustKart()}${secimSayi(s) ? secimler(s) : ''}`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Tarif bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'tarif', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}${sonuc(l.slice(0, s.gosterilen), s)}`;
  };

  let hataGosterildi = false;
  DD.ekran('tarifler', {
    tur: 'banner',
    nav: 'denge',
    dock: true,
    ust: '#/bugun',
    baslik: 'Sağlıklı Tarifler',
    iskelet: 'izgara',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ciz: ctx => {
      if (!DDV.yemekler?.length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/tarifler'}});
      ctx.liste ||= oku(ctx.sorgu);
      const s = ctx.liste, Y = DDV.yemekler;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/karsilama-sofra.webp',
        baslik: 'Sağlıklı Tarifler',
        alt: 'Porsiyon başına kalori ve makrolarıyla',
        stat: [{deger: DD.sayi(Y.length), etiket: 'Tarif'}, {deger: DD.sayi(kategoriler().length), etiket: 'Kategori'}, {deger: DD.sayi(Y.filter(tam).length), etiket: 'Adım adım'}],
        arac: DD.listeArac({yer: 'Tarif ara', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
        html: icerik(s, sirala(suz(s), s.sira))
      });
    },
    sonra: (kok, ctx) => {
      const s = ctx.liste;
      if (!s) return null;
      const govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
      let io = null, bekle = 0;

      const sonaGeldi = l => {
        io?.disconnect(); io = null;
        kok.querySelector('.dd-sonsuz-son')?.remove(); kok.querySelector('.dd-alt-yukleniyor')?.remove();
        govde.insertAdjacentHTML('beforeend', `<div class="dd-liste-results">${DD.veriYok(`**${DD.sayi(l.length)} tarifin** tamamını gördün.`)}</div>`);
      };
      const sonsuzKur = l => {
        io?.disconnect(); io = null;
        if (l.length <= SAYFA) return;
        if (s.gosterilen >= l.length) { sonaGeldi(l); return; }
        const kap = kok.querySelector('.dd-liste-rows > .dd-satirlar, .dd-liste-grid');
        io = DD.sonsuz(kap, () => {
          const dilim = l.slice(s.gosterilen, s.gosterilen + SAYFA);
          if (!dilim.length) return '';
          s.gosterilen += dilim.length;
          if (s.gosterilen >= l.length) setTimeout(() => sonaGeldi(l));
          return ogeler(dilim, s).join('');
        });
      };
      const rozet = () => {
        const n = secimSayi(s), d = arac.querySelector('.dd-liste-search-filter');
        d.classList.toggle('is-active', n > 0);
        let b = d.querySelector('.dd-badge');
        if (!n) { b?.remove(); return; }
        if (!b) { b = document.createElement('span'); b.className = 'dd-badge dd-liste-search-filter__badge'; d.append(b); }
        b.textContent = n;
      };
      const secileGit = () => {
        const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]');
        if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2;
      };
      const seritCiz = sifirla => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); if (sifirla) secileGit(); else if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
      const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
      const listeCiz = () => { const l = sirala(suz(s), s.sira); govde.innerHTML = icerik(s, l); sonsuzKur(l); };
      const guncelle = () => { s.gosterilen = SAYFA; listeCiz(); seritCiz(); rozet(); yaz(s); hizala(); };

      secileGit();
      sonsuzKur(sirala(suz(s), s.sira));

      const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi.addEventListener('input', ara);
      girdi.addEventListener('keydown', enter);

      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
        if (!b) return;
        const n = suz(s, d).length;
        b.querySelector('span').textContent = n ? `${DD.sayi(n)} tarifi gör` : 'Sonuç yok';
        b.disabled = !n;
        GRUPLAR.forEach(g => SECENEK[g]().forEach(x => { const c = sheet.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, g, x.deger); }));
      };
      const temizleyiciler = [
        DD.on(kok, 'kapsam', v => { s.seg = v; seritCiz(true); yaz(s); }),
        DD.on(kok, 'cip', v => { const g = s.seg, ayni = s.f[g].length === 1 && s.f[g][0] === v; s.f[g] = v && !ayni ? [v] : []; guncelle(); }),
        DD.on(kok, 'gorunum', v => { s.gorunum = v; s.gosterilen = SAYFA; listeCiz(); yaz(s); }),
        DD.eylem(kok, 'filtre', () => DD.filtreSheet({
          baslik: 'Tarifleri filtrele',
          gruplar: GRUPLAR.map(g => ({baslik: BASLIK[g], ad: g, ikon: IKON[g], tur: 'coklu', ogeler: SECENEK[g]().map(x => ({metin: x.ad, deger: x.deger, ikon: x.ikon, gorsel: SEGMENT.includes(g) ? gorsel(g, x.deger) : undefined, sayi: say(s, s.f, g, x.deger)}))})),
          secili: s.f,
          eylem: `${DD.sayi(suz(s).length)} tarifi gör`,
          degisti: canli,
          uygula: d => { s.f = {...bosF(), ...Object.fromEntries(GRUPLAR.map(g => [g, (d[g] || []).map(String)]))}; guncelle(); }
        })),
        DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: SIRALAR, sec: v => { s.sira = v; guncelle(); }})),
        DD.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
        DD.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); guncelle(); })
      ];
      return () => { clearTimeout(bekle); io?.disconnect(); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); temizleyiciler.forEach(f => f()); };
    }
  });
})();
