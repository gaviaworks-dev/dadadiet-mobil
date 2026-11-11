/* Besin Kütüphanesi (#/besinler): Gastro liste-v2. Web karşılığı besin-kutuphanesi/ (public-beslenme-liste.js).
 * Kaynak DDV.besinler (221 kayıt, 100 g değerleri) ve DDV.besinKategorileri. Menüdeki "541" ürün hedefidir (karar K5); ekran gerçek kayıt sayısını yazar.
 * Durum: 'besinler-liste' {q, gorunum, sira, f:{kategori[], etiket[], kalori[]}} ekran tercihi; satır ve kart #/besin/:slug açar.
 * Dış bağlantı: ?kategori=Meyveler, ?etiket=lifli, ?q=metin, ?temiz=1 (seçimleri sıfırlar), ?hal=hata. */
(() => {
  const SAYFA = 20, ANAHTAR = 'besinler-liste', GRUPLAR = ['kategori', 'etiket', 'kalori'];
  const ETIKETLER = [{deger: 'yuksek-protein', ad: 'Yüksek protein', ikon: 'protein'}, {deger: 'lifli', ad: 'Lifli', ikon: 'lif'}, {deger: 'dusuk-kalori', ad: 'Düşük kalori', ikon: 'kalori'}, {deger: 'bitkisel', ad: 'Bitkisel', ikon: 'seedling'}];
  const KALORI = [{deger: '0-50', ad: '50 kcal altı', min: 0, max: 50}, {deger: '50-150', ad: '50-150 kcal', min: 50, max: 150}, {deger: '150-300', ad: '150-300 kcal', min: 150, max: 300}, {deger: '300-1000', ad: '300 kcal üstü', min: 300, max: 1000}];
  const SIRALAR = [['ad', 'A’dan Z’ye', 'arrow-down-a-z'], ['kcal-az', 'En az kalori', 'arrow-down-short-wide'], ['kcal-cok', 'En çok kalori', 'arrow-up-wide-short'], ['protein', 'En çok protein', 'dumbbell'], ['lif', 'En çok lif', 'seedling']];
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g, []]));
  const SECENEK = {
    kategori: () => (DDV.besinKategorileri || []).map(k => ({deger: k, ad: k})),
    etiket: () => ETIKETLER,
    kalori: () => KALORI
  };
  const BASLIK = {kategori: 'Kategori', etiket: 'Besin özelliği', kalori: 'Kalori (100 g)'};
  const IKON = {kategori: 'layer-group', etiket: 'tag', kalori: 'kalori'};

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {q: d.q || '', gorunum: d.gorunum === 'izgara' ? 'izgara' : 'liste', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'ad', f: {...bosF(), ...(d.f || {})}, gosterilen: SAYFA};
    if (sorgu.temiz || sorgu.q || sorgu.kategori || sorgu.etiket) {
      s.f = bosF(); s.q = sorgu.q || '';
      if (sorgu.kategori) s.f.kategori = [sorgu.kategori];
      if (sorgu.etiket) s.f.etiket = sorgu.etiket.split(',');
    }
    return s;
  };
  const yaz = ({q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {q, gorunum, sira, f});
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0);

  // ---------- Süzme ve sıralama ----------
  const eslesir = (b, g, v) => {
    if (g === 'kategori') return b.kategori === v;
    if (g === 'etiket') return b.etiketler.includes(v);
    const k = KALORI.find(x => x.deger === v);
    return k ? b.kcal >= k.min && b.kcal < k.max : false;
  };
  const katlanmis = new Map();
  const metin = b => { if (!katlanmis.has(b.slug)) katlanmis.set(b.slug, DD.katla(`${b.ad} ${b.kategori} ${b.aciklama || ''}`)); return katlanmis.get(b.slug); };
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return DDV.besinler.filter(b => GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(b, g, v))) && q.every(x => metin(b).includes(x)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(b => eslesir(b, g, v)).length;
  const sirala = (l, sira) => {
    const ad = (a, b) => a.ad.localeCompare(b.ad, 'tr');
    const fark = {ad, 'kcal-az': (a, b) => a.kcal - b.kcal || ad(a, b), 'kcal-cok': (a, b) => b.kcal - a.kcal || ad(a, b), protein: (a, b) => b.P - a.P || ad(a, b), lif: (a, b) => (b.Lif || 0) - (a.Lif || 0) || ad(a, b)}[sira];
    return [...l].sort(fark);
  };

  // ---------- Parçalar ----------
  // Kategori çipinin görseli: o kategoride görseli olan ilk besin.
  const katGorsel = k => DDV.besinler.find(b => b.kategori === k && b.gorsel)?.gorsel;
  const serit = s => DD.cipSerit({ad: 'cip', etiket: 'Kategori', secili: s.f.kategori.length ? s.f.kategori : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'ogun', sayi: suz(s, s.f, 'kategori').length}, ...SECENEK.kategori().map(x => ({metin: x.ad, deger: x.deger, gorsel: katGorsel(x.deger), sayi: say(s, s.f, 'kategori', x.deger)}))]});
  const ozellik = b => `Protein ${DD.ondalik(b.P, 1)} g · Karb. ${DD.ondalik(b.K, 1)} g`;
  const satir = b => DD.besinSatir({ad: b.ad, gorsel: b.gorsel, kcal: b.kcal, P: b.P, K: b.K, Y: b.Y}, {alt: ozellik(b), git: `#/besin/${b.slug}`, ok: true});
  const kart = b => DD.icerikKart({gorsel: b.gorsel, kategori: b.kategori, baslik: b.ad, meta: `100 g · ${DD.sayi(b.kcal)} kcal`, metaIkon: 'kalori', git: `#/besin/${b.slug}`});
  const ogeler = (l, s) => (s.gorunum === 'liste' ? l.map(satir) : l.map(kart));
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(ogeler(l, s))] : ogeler(l, s), {gorunum: s.gorunum});
  const ad = (g, v) => SECENEK[g]().find(x => x.deger === v)?.ad ?? v;
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g].map(v => ({metin: ad(g, v), kapat: true, etiket: `${ad(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))});
  const kiyasKart = () => DD.eylemKart({ikon: 'kiyas', baslik: 'Besin kıyasla', alt: 'İki besini 100 gramda yan yana gör', git: '#/denge/kiyasla'});
  const bosMetin = s => (s.q ? `“**${s.q}**” için besin bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan besin yok. **Seçimlerini temizleyip** yeniden bak.');
  const icerik = (s, l) => {
    const filtreli = secimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli ? '' : kiyasKart()}${secimSayi(s) ? secimler(s) : ''}`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Besin bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'besin', gorunum: s.gorunum, siraliAktif: s.sira !== 'ad'})}${sonuc(l.slice(0, s.gosterilen), s)}`;
  };

  let hataGosterildi = false;
  DD.ekran('besinler', {
    bos: {ikon: 'ara_', baslik: 'Besin bulunamadı', metin: 'Aramanı kısalt ya da **başka bir ad** dene.', eylem: {metin: 'Tüm besinler', ikon: 'tumu', yerine: '#/besinler'}},   // ?hal=bos (ortak DD.bos)
    tur: 'banner',
    nav: 'denge',
    dock: true,
    ust: '#/bugun',
    baslik: 'Besin Kütüphanesi',
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    ciz: ctx => {
      if (!DDV.besinler?.length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/besinler'}});
      ctx.liste ||= oku(ctx.sorgu);
      const s = ctx.liste, B = DDV.besinler, kaynak = new Set(B.map(b => b.kaynak)).size;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/mutfak-raf.webp',
        baslik: 'Besin Kütüphanesi',
        alt: '100 g başına kalori, protein, karbonhidrat ve yağ',
        stat: [{deger: DD.sayi(B.length), etiket: 'Besin'}, {deger: DD.sayi(DDV.besinKategorileri.length), etiket: 'Kategori'}, {deger: DD.sayi(kaynak), etiket: 'Kaynak'}],
        arac: DD.listeArac({yer: 'Besin ara', deger: s.q, filtreSayi: secimSayi(s), serit: serit(s)}),
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
        govde.insertAdjacentHTML('beforeend', `<div class="dd-liste-results">${DD.veriYok(`**${DD.sayi(l.length)} besinin** tamamını gördün.`)}</div>`);
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
      const rozet = () => DD.filtreSayiYaz(arac, secimSayi(s));
      const secileGit = () => {
        const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]');
        if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2;
      };
      const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
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
        b.querySelector('span').textContent = n ? `${DD.sayi(n)} besini gör` : 'Sonuç yok';
        b.disabled = !n;
        GRUPLAR.forEach(g => SECENEK[g]().forEach(x => { const c = sheet.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, g, x.deger); }));
      };
      const temizleyiciler = [
        DD.on(kok, 'cip', v => { const ayni = s.f.kategori.length === 1 && s.f.kategori[0] === v; s.f.kategori = v && !ayni ? [v] : []; guncelle(); }),
        DD.on(kok, 'gorunum', v => { s.gorunum = v; s.gosterilen = SAYFA; listeCiz(); yaz(s); }),
        DD.eylem(kok, 'filtre', () => DD.filtreSheet({
          baslik: 'Besinleri filtrele',
          gruplar: GRUPLAR.map(g => ({baslik: BASLIK[g], ad: g, ikon: IKON[g], tur: 'coklu', ogeler: SECENEK[g]().map(x => ({metin: x.ad, deger: x.deger, ikon: x.ikon, gorsel: g === 'kategori' ? katGorsel(x.deger) : undefined, sayi: say(s, s.f, g, x.deger)}))})),
          secili: s.f,
          eylem: `${DD.sayi(suz(s).length)} besini gör`,
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
