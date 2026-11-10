/* İpuçları (#/ipuclari): Gastro liste-v2. Web karşılığı ipuclari-ve-puf-noktalari/: İpucu ve Püf Noktası kapsamı, kategori çipleri, arama, en çok okunan sırası.
 * Kaynak DDV.icerikler (8) + DDV.kutuphane.ipuclari (web'deki diğer 21 ipucu ve püf noktası); birleşik liste DDV.kutuphane.icerikTum().
 * Durum: 'ipuclari-liste' {tur ('tum' | 'ipucu' | 'puf'), q, gorunum, sira, f:{kategori[], sure[]}} ekran tercihi.
 * Dış bağlantı: ?kategori=Su, ?tur=puf, ?q=metin, ?temiz=1, ?hal=hata. */
(() => {
  const SAYFA = 12, ANAHTAR = 'ipuclari-liste', GRUPLAR = ['kategori', 'sure'];
  const TURLER = [{ad: 'Tümü', deger: 'tum'}, {ad: 'İpucu', deger: 'ipucu'}, {ad: 'Püf noktası', deger: 'puf'}];
  const SURE = [{deger: '1-2', ad: '1-2 dk okuma', min: 1, max: 3}, {deger: '3-9', ad: '3 dk ve üstü', min: 3, max: 99}];
  const SIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['okunan', 'En çok okunan', 'fire'], ['kisa', 'En kısa okuma', 'hourglass-start'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const BASLIK = {kategori: 'Kategori', sure: 'Okuma süresi'};
  const IKON = {kategori: 'layer-group', sure: 'saat'};
  const tum = () => DDV.kutuphane?.icerikTum?.() || (DDV.icerikler || []).map(x => ({tur: 'ipucu', ...x}));
  const okunma = x => DDV.kutuphane?.okunma?.[x.slug] ?? null;
  const okumaDk = x => x.okumaDk ?? null;
  // Kategori sırası web'deki çip sırası (DDV.kutuphane.ipucuKategorileri); listede olmayan kategori sona.
  const kategoriler = () => { const mevcut = new Set(tum().map(x => x.kategori)), sira = (DDV.kutuphane?.ipucuKategorileri || []).map(k => k.ad); return [...sira.filter(k => mevcut.has(k)), ...[...mevcut].filter(k => !sira.includes(k))]; };
  const SECENEK = {kategori: () => kategoriler().map(k => ({deger: k, ad: k})), sure: () => SURE};
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g, []]));

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {tur: TURLER.some(t => t.deger === d.tur) ? d.tur : 'tum', q: d.q || '', gorunum: d.gorunum === 'liste' ? 'liste' : 'izgara', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {...bosF(), ...(d.f || {})}, gosterilen: SAYFA};
    if (sorgu.temiz || sorgu.q || sorgu.kategori || sorgu.tur) {
      s.f = bosF(); s.q = sorgu.q || ''; s.tur = TURLER.some(t => t.deger === sorgu.tur) ? sorgu.tur : 'tum';
      if (sorgu.kategori) s.f.kategori = [sorgu.kategori];
    }
    return s;
  };
  const yaz = ({tur, q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {tur, q, gorunum, sira, f});
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0);

  // ---------- Süzme ve sıralama ----------
  const eslesir = (x, g, v) => { if (g === 'kategori') return x.kategori === v; const a = SURE.find(y => y.deger === v); const dk = okumaDk(x); return !!a && dk != null && dk >= a.min && dk < a.max; };
  const katlanmis = new Map();
  const metin = x => { if (!katlanmis.has(x.slug)) katlanmis.set(x.slug, DD.katla(`${x.baslik} ${x.ozet} ${x.kategori}`)); return katlanmis.get(x.slug); };
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return tum().filter(x => (s.tur === 'tum' || x.tur === s.tur) && GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(x, g, v))) && q.every(p => metin(x).includes(p)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(x => eslesir(x, g, v)).length;
  const sirala = (l, sira) => {
    const ad = (a, b) => a.baslik.localeCompare(b.baslik, 'tr');
    const fark = {onerilen: () => 0, okunan: (a, b) => (okunma(b) ?? -1) - (okunma(a) ?? -1), kisa: (a, b) => (okumaDk(a) ?? 99) - (okumaDk(b) ?? 99) || ad(a, b), ad}[sira];
    return [...l].sort(fark);
  };

  // ---------- Parçalar ----------
  const katGorsel = k => tum().find(x => x.kategori === k)?.gorsel;
  const segment = s => DD.segment({ad: 'tur', etiket: 'Yazı türü', secili: s.tur, ogeler: TURLER.map(t => ({ad: t.ad, deger: t.deger}))});
  const serit = s => {
    const l = SECENEK.kategori().filter(x => say(s, s.f, 'kategori', x.deger) > 0 || s.f.kategori.includes(x.deger));
    return DD.cipSerit({ad: 'cip', etiket: 'Kategori', secili: s.f.kategori.length ? s.f.kategori : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'ipucu', sayi: suz(s, s.f, 'kategori').length}, ...l.map(x => ({metin: x.ad, deger: x.deger, gorsel: katGorsel(x.deger), sayi: say(s, s.f, 'kategori', x.deger)}))]});
  };
  const meta = x => (okumaDk(x) ? `${okumaDk(x)} dk okuma` : undefined);
  const kart = x => DD.icerikKart({gorsel: x.gorsel, kategori: x.kategori, baslik: x.baslik, meta: meta(x), git: `#/ipucu/${x.slug}`});
  const satir = x => DD.satir({sol: DD.gorsel({src: x.gorsel, ad: x.baslik}), baslik: x.baslik, alt: [x.tur === 'puf' ? 'Püf noktası' : 'İpucu', x.kategori, meta(x), okunma(x) != null ? `${DD.sayi(okunma(x))} okunma` : null].filter(Boolean).join(' · '), git: `#/ipucu/${x.slug}`, ok: true});
  const ogeler = (l, s) => (s.gorunum === 'liste' ? l.map(satir) : l.map(kart));
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(ogeler(l, s))] : ogeler(l, s), {gorunum: s.gorunum});
  const ad = (g, v) => SECENEK[g]().find(x => x.deger === v)?.ad ?? v;
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g].map(v => ({metin: ad(g, v), kapat: true, etiket: `${ad(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))});
  const kayitli = () => DD.durum.oku('kayitli-ipuclari', DD.yeniHesap() ? [] : (DDV.uye?.kayitli?.ipuclari || []));
  const ustKart = () => { const n = kayitli().length; return n ? DD.eylemKart({ikon: 'kaydet', baslik: 'Kaydettiğin yazılar', alt: `${n} yazı`, git: '#/kaydedilenler?tur=ipuclari'}) : ''; };
  const bosMetin = s => (s.q ? `“**${s.q}**” için yazı bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan yazı yok. **Seçimlerini temizleyip** yeniden bak.');
  // Web liste sonu: genel bilgi notu + Diyetisyen Bul (Gastro DG.ipucu kutusu). Sonsuz kaydırma sonu notunun üstüne eklenir.
  const genelNot = () => DD.ipucu({ikon: 'bilgi', baslik: 'Genel bilgi notu', metin: 'Buradaki ipuçları ve püf noktaları pratik bilgilerdir ve **genel bilgi amaçlıdır**; tıbbi teşhis veya tedavi yerine geçmez, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca **yetkili bir diyetisyen** tarafından hazırlanır.', eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}});
  const icerik = (s, l) => {
    const filtreli = secimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli ? '' : ustKart()}${secimSayi(s) ? secimler(s) : ''}`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Yazı bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'yazı', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}${sonuc(l.slice(0, s.gosterilen), s)}${genelNot()}`;
  };

  let hataGosterildi = false;
  DD.ekran('ipuclari', {
    tur: 'banner',
    nav: 'bugun',
    dock: true,
    ust: '#/bugun',
    baslik: 'İpuçları',
    iskelet: 'izgara',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ciz: ctx => {
      const T = tum();
      if (!T.length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/ipuclari'}});
      ctx.liste ||= oku(ctx.sorgu);
      const s = ctx.liste;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/tabak-duzeni.webp',
        baslik: 'İpuçları',
        alt: 'Her yazı tek bir soruyu yanıtlar, kısa sürede okunur',
        stat: [{deger: DD.sayi(T.filter(x => x.tur !== 'puf').length), etiket: 'İpucu'}, {deger: DD.sayi(T.filter(x => x.tur === 'puf').length), etiket: 'Püf noktası'}, {deger: DD.sayi(kategoriler().length), etiket: 'Kategori'}],
        arac: DD.listeArac({yer: 'İpucu ve püf noktası ara', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
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
        { const not = govde.querySelector(':scope > .dd-ipucu'); const son = DD.veriYok(`**${DD.sayi(l.length)} yazının** tamamını gördün.`); if (not) not.insertAdjacentHTML('beforebegin', son); else govde.insertAdjacentHTML('beforeend', son); }
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
      const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
      const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
      const listeCiz = () => { const l = sirala(suz(s), s.sira); govde.innerHTML = icerik(s, l); sonsuzKur(l); };
      const guncelle = () => { s.gosterilen = SAYFA; listeCiz(); seritCiz(); rozet(); yaz(s); hizala(); };

      sonsuzKur(sirala(suz(s), s.sira));
      { const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]'); if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2; }

      const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi.addEventListener('input', ara);
      girdi.addEventListener('keydown', enter);

      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
        if (!b) return;
        const n = suz(s, d).length;
        b.querySelector('span').textContent = n ? `${DD.sayi(n)} yazıyı gör` : 'Sonuç yok';
        b.disabled = !n;
        GRUPLAR.forEach(g => SECENEK[g]().forEach(x => { const c = sheet.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, g, x.deger); }));
      };
      const temizleyiciler = [
        DD.on(kok, 'tur', v => { s.tur = v; s.f.kategori = s.f.kategori.filter(k => suz({...s, f: bosF()}).some(x => x.kategori === k)); guncelle(); }),
        DD.on(kok, 'cip', v => { const ayni = s.f.kategori.length === 1 && s.f.kategori[0] === v; s.f.kategori = v && !ayni ? [v] : []; guncelle(); }),
        DD.on(kok, 'gorunum', v => { s.gorunum = v; s.gosterilen = SAYFA; listeCiz(); yaz(s); }),
        DD.eylem(kok, 'filtre', () => DD.filtreSheet({
          baslik: 'Yazıları filtrele',
          gruplar: GRUPLAR.map(g => ({baslik: BASLIK[g], ad: g, ikon: IKON[g], tur: 'coklu', ogeler: SECENEK[g]().map(x => ({metin: x.ad, deger: x.deger, gorsel: g === 'kategori' ? katGorsel(x.deger) : undefined, sayi: say(s, s.f, g, x.deger)}))})),
          secili: s.f,
          eylem: `${DD.sayi(suz(s).length)} yazıyı gör`,
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
