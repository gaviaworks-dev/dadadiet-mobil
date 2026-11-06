/* Programlar: Gastro liste-v2. Kubbe, yapışan araç paneli, web'in 5 filtre kutusu (segment + çip şeridi + filtre sheet'i).
 * Dış bağlantı: #/programlar?hedef=oruc, ?sure=28, ?tercih=a,b, ?q=metin, ?temiz=1 (seçimleri sıfırlar). */
(() => {
  const SAYFA = 12, ANAHTAR = 'programlar-liste', GRUPLAR = ['hedef', 'yasam', 'tercih', 'ihtiyac', 'sure'];
  const KISA = {hedef: 'Hedef', yasam: 'Yaşam', tercih: 'Tercih', ihtiyac: 'İhtiyaç', sure: 'Süre'};
  const SIRALAR = [['onerilen', 'Sana göre', 'wand-magic-sparkles'], ['kisa', 'En kısa süre', 'hourglass-start'], ['uzun', 'En uzun süre', 'calendar-plus'], ['enerji', 'Enerjiye göre', 'gauge-high'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const F = () => DDV.programFiltreleri;
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g, []]));
  const fold = s => String(s).toLocaleLowerCase('tr').replace(/[çğıöşü]/g, c => ({ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u'}[c]));
  const aktif = () => DD.durum.oku('aktifProgram', DDV.kullanici.aktifProgram);
  const kayitlar = () => DD.durum.oku('kayitliProgramlar', []);

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {}, s = {seg: GRUPLAR.includes(d.seg) ? d.seg : 'hedef', q: d.q || '', gorunum: d.gorunum === 'liste' ? 'liste' : 'izgara', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {...bosF(), ...(d.f || {})}, gosterilen: SAYFA};
    const dis = GRUPLAR.filter(g => sorgu[g]);
    if (sorgu.temiz || sorgu.q || dis.length) { s.f = bosF(); s.q = sorgu.q || ''; dis.forEach(g => { s.f[g] = sorgu[g].split(','); }); if (dis[0]) s.seg = dis[0]; }
    return s;
  };
  const yaz = ({seg, q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {seg, q, gorunum, sira, f});
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g].length, 0);

  // ---------- Süzme ve sıralama ----------
  const metinler = new Map();
  const metin = p => {
    if (!metinler.has(p.slug)) metinler.set(p.slug, fold([p.ad, p.aciklama, p.kategori, ...GRUPLAR.flatMap(g => F()[g].secenekler.filter(x => eslesir(p, g, x.deger)).map(x => x.ad))].join(' ')));
    return metinler.get(p.slug);
  };
  const eslesir = (p, g, v) => (g === 'hedef' ? p.hedef === v : g === 'sure' ? String(p.sureGun) === String(v) : p[g].includes(v));
  const suz = (s, f = s.f, haric) => {
    const q = fold(s.q).split(/\s+/).filter(Boolean);
    return DDV.programlar.filter(p => GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(p, g, v))) && q.every(x => metin(p).includes(x)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(p => eslesir(p, g, v)).length;
  // Önerilen sıra: aktif program başta; hedef kalori aralıkta, beslenme tarzı ve hedef örtüşüyorsa önde.
  const yakinlik = p => {
    const k = DDV.kullanici;
    return (aktif()?.slug === p.slug ? 100 : 0) + (p.kcalMin <= k.hedefKcal && k.hedefKcal <= p.kcalMax ? 3 : 0) + (p.tercih.some(t => k.beslenmeTarzi.includes(t)) ? 2 : 0) + (k.hedef === 'kilo-vermek' && p.hedef === 'kilo' ? 2 : 0);
  };
  const sirala = (l, sira) => {
    const fark = {onerilen: (a, b) => yakinlik(b) - yakinlik(a), kisa: (a, b) => a.sureGun - b.sureGun, uzun: (a, b) => b.sureGun - a.sureGun, enerji: (a, b) => a.kcalMin - b.kcalMin, ad: (a, b) => a.ad.localeCompare(b.ad, 'tr')}[sira];
    return [...l].sort(fark);
  };

  // ---------- Parçalar ----------
  const gorseller = {};
  const gorsel = (g, v) => {
    if (g === 'hedef') return `assets/gorsel/hero/program-${v}.webp`;
    if (!gorseller[g]) { const alinan = new Set(); gorseller[g] = Object.fromEntries(F()[g].secenekler.map(x => { const l = DDV.programlar.filter(p => eslesir(p, g, x.deger)), p = l.find(y => !alinan.has(y.slug)) || l[0]; alinan.add(p?.slug); return [x.deger, p?.kapak]; })); }
    return gorseller[g][v];
  };
  const segment = s => DD.segment({ad: 'kapsam', etiket: 'Filtre türü', secili: s.seg, ogeler: GRUPLAR.map(g => ({ad: KISA[g], deger: g}))});
  const serit = s => DD.cipSerit({ad: 'cip', etiket: F()[s.seg].baslik, secili: s.f[s.seg].length ? s.f[s.seg] : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'ogun', sayi: suz(s, s.f, s.seg).length}, ...F()[s.seg].secenekler.map(x => ({metin: x.ad, deger: x.deger, gorsel: gorsel(s.seg, x.deger), sayi: say(s, s.f, s.seg, x.deger)}))]});
  const kart = (p, s) => {
    const a = aktif(), on = a?.slug === p.slug;
    return DD.programKart(on ? {...p, kategori: a.gun ? `Aktif · ${a.gun}. gün` : 'Planlı'} : p, {tur: s.gorunum === 'liste' ? 'row' : 'card', kayitli: kayitlar().includes(p.slug)});
  };
  const bulKart = () => DD.eylemKart({ikon: 'wand-magic-sparkles', baslik: 'Program Bul', alt: 'Beş soruda sana uygun üç program', git: '#/program-bul'});
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g].map(v => { const ad = F()[g].secenekler.find(x => x.deger === v)?.ad ?? v; return {metin: ad, kapat: true, etiket: `${ad} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}}; }))});
  const ustKartlar = () => {
    const a = aktif(), p = a && DDV.programlar.find(x => x.slug === a.slug);
    return `<div class="dd-yigin-12">${!p ? '' : a.gun ? DD.programKart(p, {tur: 'aktif', gun: a.gun, toplam: a.toplamGun}) : DD.eylemKart({ikon: 'takvim', baslik: p.ad, alt: `${DD.tarihKisa(a.baslangic)} başlıyor`, git: `#/program/${p.slug}`})}${bulKart()}</div>`;
  };
  const bosMetin = s => (s.q ? `“**${s.q}**” için program bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan program yok. **Seçimlerini temizleyip** yeniden keşfet ya da Program Bul’a sor.');
  const icerik = (s, l, hazir) => {
    const filtreli = secimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli ? '' : ustKartlar()}${secimSayi(s) ? secimler(s) : ''}`;
    if (!hazir) return `${bas}${DD.listeDurum({sayi: l.length, birim: 'program', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}<div class="dd-liste-results">${DD.iskelet(4, s.gorunum === 'liste' ? 'satir' : 'kart')}</div>`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Program bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}${bulKart()}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'program', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}${DD.listeSonuc(l.slice(0, s.gosterilen).map(p => kart(p, s)), {gorunum: s.gorunum})}`;
  };

  DD.ekran('programlar', {
    tur: 'banner',
    nav: 'bugun',
    dock: true,
    baslik: 'Programlar',
    yenile: true,
    cekYenile: () => new Promise(r => setTimeout(r, DD.TK.motion.reveal)),
    ciz: ctx => {
      if (ctx.sorgu.durum === 'hata' || !DDV.programlar?.length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/programlar'}});
      ctx.liste ||= oku(ctx.sorgu);
      const s = ctx.liste, P = DDV.programlar;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/program-dengeli.webp',
        baslik: 'Programlar',
        stat: [{deger: DD.sayi(P.length), etiket: 'Program'}, {deger: DD.sayi(F().hedef.secenekler.length), etiket: 'Hedef'}, {deger: DD.sayi(P.reduce((n, p) => n + p.ogunToplam, 0)), etiket: 'Öğün'}],
        arac: DD.listeArac({yer: 'Program ara', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
        html: icerik(s, sirala(suz(s), s.sira), ctx.hazir)
      });
    },
    sonra: (kok, ctx) => {
      const s = ctx.liste;
      if (!s) return null;
      const govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
      let io = null, bekle = 0, zaman = 0;

      const sonaGeldi = l => {
        io?.disconnect(); io = null;
        kok.querySelector('.dd-sonsuz-son')?.remove(); kok.querySelector('.dd-alt-yukleniyor')?.remove();
        govde.insertAdjacentHTML('beforeend', `<div class="dd-liste-results">${DD.veriYok(`**${DD.sayi(l.length)} programın** tamamını gördün.`)}</div>`);
      };
      const sonsuzKur = l => {
        io?.disconnect(); io = null;
        if (l.length <= SAYFA) return;
        if (s.gosterilen >= l.length) { sonaGeldi(l); return; }
        const kap = kok.querySelector('.dd-liste-grid,.dd-liste-rows');
        io = DD.sonsuz(kap, () => {
          const dilim = l.slice(s.gosterilen, s.gosterilen + SAYFA);
          if (!dilim.length) return '';
          s.gosterilen += dilim.length;
          if (s.gosterilen >= l.length) setTimeout(() => sonaGeldi(l));
          return dilim.map(p => kart(p, s)).join('');
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
      // Seçili çip şeridin dışında kalmasın.
      const secileGit = () => {
        const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]');
        if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2;
      };
      const seritCiz = sifirla => {
        const x = rail.firstElementChild?.scrollLeft || 0;
        rail.innerHTML = serit(s);
        if (sifirla) secileGit(); else if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x;
      };
      // Kısalan liste panelin altında kalmasın: sonuçlar yapışık panelin hemen altından başlar.
      const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
      const listeCiz = () => {
        const l = sirala(suz(s), s.sira);
        govde.innerHTML = icerik(s, l, ctx.hazir);
        if (ctx.hazir) sonsuzKur(l);
        return l;
      };
      const guncelle = () => { s.gosterilen = SAYFA; listeCiz(); seritCiz(); rozet(); yaz(s); hizala(); };

      secileGit();
      if (ctx.hazir) sonsuzKur(sirala(suz(s), s.sira));
      else zaman = setTimeout(() => { ctx.hazir = true; listeCiz(); }, DD.TK.motion.reveal);

      const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi.addEventListener('input', ara);
      girdi.addEventListener('keydown', enter);

      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
        if (!b) return;
        const n = suz(s, d).length;
        b.querySelector('span').textContent = n ? `${DD.sayi(n)} programı gör` : 'Sonuç yok';
        b.disabled = !n;
        GRUPLAR.forEach(g => F()[g].secenekler.forEach(x => { const c = sheet.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, g, x.deger); }));
      };
      const temizleyiciler = [
        DD.on(kok, 'kapsam', v => { s.seg = v; seritCiz(true); yaz(s); }),
        DD.on(kok, 'cip', v => { const g = s.seg, ayni = s.f[g].length === 1 && s.f[g][0] === v; s.f[g] = v && !ayni ? [v] : []; guncelle(); }),
        DD.on(kok, 'gorunum', v => { s.gorunum = v; listeCiz(); yaz(s); }),
        DD.eylem(kok, 'filtre', () => DD.filtreSheet({
          baslik: 'Programları filtrele',
          gruplar: GRUPLAR.map(g => ({baslik: F()[g].baslik, ad: g, ikon: F()[g].ikon, tur: 'coklu', ogeler: F()[g].secenekler.map(x => ({metin: x.ad, deger: x.deger, ikon: x.ikon, sayi: say(s, s.f, g, x.deger)}))})),
          secili: s.f,
          eylem: `${DD.sayi(suz(s).length)} programı gör`,
          degisti: canli,
          uygula: d => { s.f = {...bosF(), ...Object.fromEntries(GRUPLAR.map(g => [g, (d[g] || []).map(String)]))}; guncelle(); }
        })),
        DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: SIRALAR, sec: v => { s.sira = v; guncelle(); }})),
        DD.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
        DD.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi').classList.remove('has-text'); guncelle(); }),
        DD.eylem(kok, 'kaydet', el => { const id = el.dataset.id, on = el.getAttribute('aria-pressed') !== 'true', l = kayitlar().filter(x => x !== id); DD.durum.yaz('kayitliProgramlar', on ? [...l, id] : l); })
      ];
      return () => { clearTimeout(bekle); clearTimeout(zaman); io?.disconnect(); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); temizleyiciler.forEach(f => f()); };
    }
  });
})();
