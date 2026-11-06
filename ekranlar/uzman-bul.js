/* SCR-50B Diyetisyen bul (#/uzman/bul): vitrin Gastro liste-v2; ?adim=1-3 eşleşme soruları, ?adim=sonuc sonuç. Referans: tasks/referanslar.md Diyetisyen bul.
 * Puan ve yorum verisi yok, gösterilmez; canlı listedeki puan sıralamaları da alınmadı. Cinsiyet alanı doğrulanmadığı için Kadın/Erkek seçimi süzmez, gevşetme notu çıkar.
 * Durum: uzman-liste {seg, q, gorunum, sira, f}, uzman-eslesme {goal, mode, gender}. Boş saatler uzman-profil.js ile aynı kuraldan türer.
 * #/uzman/bul?durum=hata bağlantı hatası. */
(() => {
  const LISTE = 'uzman-liste', ESLESME = 'uzman-eslesme', ONGORU_GUN = 30;
  const GRUPLAR = [{ad: 'uzmanlik', baslik: 'Uzmanlık', ikon: 'award'}, {ad: 'gorusme', baslik: 'Görüşme', ikon: 'video'}, {ad: 'sehir', baslik: 'Şehir', ikon: 'location-dot'}];
  const SIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['fiyat', 'En uygun fiyat', 'tag'], ['deneyim', 'En deneyimli', 'award']];
  const E = () => DDV.eslesmeSorulari, TOPLAM = 3;
  const D = () => DDV.diyetisyenler;
  const benim = () => DDV.benimDiyetisyenim.diyetisyen;
  const bosF = () => Object.fromEntries(GRUPLAR.map(g => [g.ad, []]));
  const tekSeans = d => d.paketler.find(p => p.id === 'tek').fiyat;

  // ---------- İlk uygun saat ----------
  const SAATLER = ['09:30', '10:15', '11:00', '13:30', '14:15', '15:00', '16:30', '17:45', '18:30', '19:15'];
  const gunEkle = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const ozet = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);
  const dolu = (slug, iso, saat) => ozet(`${slug}${iso}${saat}`) % 3 === 0 || (iso === DD.bugunIso() && saat <= DDV.bugun.simdi);
  const ilkUygun = slug => {
    for (let i = 0; i <= ONGORU_GUN; i += 1) {
      const t = gunEkle(DD.bugunIso(), i), saat = new Date(`${t}T12:00:00`).getDay() === 0 ? null : SAATLER.find(x => !dolu(slug, t, x));
      if (saat) return {saat, gun: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : new Date(`${t}T12:00:00`).toLocaleDateString('tr-TR', {weekday: 'short'})};
    }
    return null;
  };
  const ilkMetin = slug => { const x = ilkUygun(slug); return x ? `${x.gun} ${x.saat}` : 'Takvimde'; };

  // ---------- Vitrin durumu ----------
  const oku = () => { const d = DD.durum.oku(LISTE, {}) || {}; return {seg: GRUPLAR.some(g => g.ad === d.seg) ? d.seg : 'uzmanlik', q: d.q || '', gorunum: d.gorunum === 'izgara' ? 'izgara' : 'liste', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {...bosF(), ...(d.f || {})}}; };
  const yaz = ({seg, q, gorunum, sira, f}) => DD.durum.yaz(LISTE, {seg, q, gorunum, sira, f});
  const secimSayi = s => GRUPLAR.reduce((n, g) => n + s.f[g.ad].length, 0);
  const secenekler = g => (g === 'uzmanlik' ? DDV.diyetisyenFiltreleri.uzmanlik.filter(v => D().some(d => d.uzmanliklar.includes(v))) : DDV.diyetisyenFiltreleri[g]);
  const ikon = (g, v) => E().sorular.flatMap(q => q.secenekler).find(x => x.deger === v)?.ikon || (g === 'sehir' ? 'location-dot' : 'award');
  const eslesir = (d, g, v) => (g === 'uzmanlik' ? d.uzmanliklar.includes(v) : g === 'gorusme' ? d.gorusmeTurleri.includes(v) : d.sehir === v);
  const metin = d => DD.katla([d.ad, d.unvan, d.sehir, d.gorusme, ...d.uzmanliklar].join(' '));
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return D().filter(d => GRUPLAR.every(({ad}) => ad === haric || !f[ad].length || f[ad].some(v => eslesir(d, ad, v))) && q.every(x => metin(d).includes(x)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(d => eslesir(d, g, v)).length;
  // Önerilen sıra: kullanıcının kilo hedefine uyan uzmanlık önde, deneyim ikincil; kendi diyetisyeni başta.
  const yakinlik = d => (d.slug === benim() ? 100 : 0) + (d.uzmanliklar.includes('Kilo Yönetimi') ? 10 : 0) + d.deneyimYil / 100;
  const sirala = (l, sira) => [...l].sort({onerilen: (a, b) => yakinlik(b) - yakinlik(a), fiyat: (a, b) => tekSeans(a) - tekSeans(b), deneyim: (a, b) => b.deneyimYil - a.deneyimYil}[sira]);

  // ---------- Kartlar ----------
  const randevuEylem = d => (d.slug === benim() ? {metin: 'Diyetisyenin', ikon: 'onay', git: '#/uzman'} : {metin: 'Paket seç', ikon: 'program', veri: {eylem: 'paket-sec', id: d.slug}});
  const kart = (d, s) => (s.gorunum === 'izgara'
    ? DD.diyetisyenKart(d, {eylem: randevuEylem(d)})
    : DD.diyetisyenKart(d, {tur: 'tam', eylem: randevuEylem(d), ikincil: {metin: 'Profil', ikon: 'profil', git: `#/uzman/profil/${d.slug}`}, sayaclar: [{deger: DD.paraTL(tekSeans(d)), etiket: 'Tek seans'}, {deger: ilkMetin(d.slug), etiket: 'İlk uygun'}, {deger: d.sehir, etiket: 'Şehir'}]}));
  const sonuc = (l, s) => `<div class="dd-liste-results"><div class="${s.gorunum === 'izgara' ? 'dd-uzman-izgara' : 'dd-yigin-12'}">${l.map(d => kart(d, s)).join('')}</div></div>`;
  const eslesmeKart = () => { const c = cevaplar(); return tamam(c) ? DD.eylemKart({ikon: 'wand-magic-sparkles', baslik: 'Son eşleşmen', alt: `${eslestir(c).l.length} uzman sana yakın`, git: '#/uzman/bul?adim=sonuc'}) : DD.eylemKart({ikon: 'wand-magic-sparkles', baslik: 'Sana uygun uzmanı bul', alt: 'Üç soruda en yakın eşleşme', git: '#/uzman/bul?adim=1'}); };
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: GRUPLAR.flatMap(g => s.f[g.ad].map(v => ({metin: v, kapat: true, etiket: `${v} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g.ad}|${v}`}})))});
  const bosMetin = s => (s.q ? `“**${s.q}**” için uzman bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan uzman yok. **Seçimlerini temizleyip** yeniden bakabilirsin.');
  const icerik = (s, l, hazir) => {
    const filtreli = secimSayi(s) > 0 || !!s.q, bas = `${filtreli ? '' : eslesmeKart()}${secimSayi(s) ? secimler(s) : ''}`;
    const durum = DD.listeDurum({sayi: l.length, birim: 'uzman', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'});
    if (!hazir) return `${bas}${durum}<div class="dd-liste-results">${DD.iskelet(3, 'liste')}</div>`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Uzman bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}${eslesmeKart()}`;
    return `${bas}${durum}${sonuc(l, s)}`;
  };
  const segment = s => DD.segment({ad: 'kapsam', etiket: 'Filtre türü', secili: s.seg, ogeler: GRUPLAR.map(g => ({ad: g.baslik, deger: g.ad}))});
  const serit = s => DD.cipSerit({ad: 'cip', etiket: 'Süz', secili: s.f[s.seg].length ? s.f[s.seg] : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'uzman', sayi: suz(s, s.f, s.seg).length}, ...secenekler(s.seg).map(v => ({metin: v, deger: v, ikon: ikon(s.seg, v), sayi: say(s, s.f, s.seg, v)}))]});

  // ---------- Eşleşme ----------
  const cevaplar = () => DD.durum.oku(ESLESME, {}) || {};
  const tamam = c => !!c.goal && !!c.mode;
  const eslestir = c => {
    const hedef = d => d.uzmanliklar.includes(c.goal), gorusme = d => c.mode === 'farketmez' || d.gorusmeTurleri.includes(c.mode);
    const cinsiyetli = !!c.gender && c.gender !== 'farketmez', esik = E().kural.gevsetmeEsigi;
    const oran = d => (d.uzmanliklar[0] === c.goal ? 60 : hedef(d) ? 50 : 0) + (gorusme(d) ? 30 : 0) + (cinsiyetli ? 0 : 10);
    // kural.sira: cinsiyet, görüşme, hedef sırasıyla gevşer. Cinsiyet verisi olmadığı için ilk süzgeç hedef + görüşmedir.
    let l = D().filter(d => hedef(d) && gorusme(d)), gevsek = cinsiyetli;
    if (l.length < esik) { l = [...l, ...D().filter(d => hedef(d) && !l.includes(d))]; gevsek = true; }
    if (l.length < esik) { l = [...l, ...D().filter(d => !l.includes(d))]; gevsek = true; }
    return {gevsek, l: l.map(d => ({d, oran: oran(d), hedefTuttu: hedef(d), gorusmeTuttu: gorusme(d)})).sort((a, b) => b.oran - a.oran || b.d.deneyimYil - a.d.deneyimYil).slice(0, E().kural.enCokSonuc)};
  };
  const adimNo = ctx => { const c = cevaplar(), n = ctx.sorgu.adim === 'sonuc' ? TOPLAM + 1 : +ctx.sorgu.adim || 1; return !c.goal ? 1 : !c.mode ? Math.min(n, 2) : n; };
  const adimHtml = (n, c) => {
    const q = E().sorular[n - 1], vurgu = {1: 'en uygun uzmanlık alanını', 2: 'nasıl buluşacağını', 3: 'İstersen atla'}[n];
    return DD.onbSablon({
      adim: n, toplam: TOPLAM, geri: false, baslik: q.soru, alt: q.altMetin.replace(new RegExp(vurgu, 'i'), m => `**${m}**`),
      atla: n === TOPLAM ? {metin: 'Atla', veri: {eylem: 'atla'}} : null, devam: false,
      html: DD.secimler({ad: q.alan, ogeler: q.secenekler, secili: c[q.alan], duzen: 'tek'})
    });
  };
  const sonucKart = (x, i, c) => {
    const {d} = x, soruH = E().sorular[0].secenekler.find(o => o.deger === c.goal), ilk = ilkMetin(d.slug);
    const rozetler = `<div class="dd-sira">${i === 0 && x.hedefTuttu ? DD.durumRozet({metin: 'En uygun', ton: 'basari', ikon: 'onay'}) : ''}${DD.uyumRozet({oran: x.oran})}${d.slug === benim() ? DD.durumRozet({metin: 'Diyetisyenin', ton: 'notr', ikon: 'uzman'}) : ''}</div>`;
    const maddeler = [
      x.hedefTuttu ? {metin: `**Hedefin:** ${soruH.ad} alanında çalışıyor`} : {tur: 'notr', metin: `**Hedefin:** ${soruH.ad} bu uzmanın alanı değil`},
      x.gorusmeTuttu ? {metin: `**Görüşme:** ${d.gorusme.toLocaleLowerCase('tr')} görüşüyor`} : {tur: 'notr', metin: `**Görüşme:** yalnız ${d.gorusme.toLocaleLowerCase('tr')}`},
      {metin: `**İlk uygun saat:** ${ilk}`}
    ];
    return DD.kart({html: `<div class="dd-yigin-12">${DD.diyetisyenKart(d, {tur: 'satir'})}${rozetler}<div class="dd-yigin-8">${maddeler.map(DD.madde).join('')}</div><div class="dd-ikili">${DD.btn({metin: 'Profil', tur: 'secondary', git: `#/uzman/profil/${d.slug}`})}${d.slug === benim() ? DD.btn({metin: 'Uzmanım', ikon: 'uzman', git: '#/uzman'}) : DD.btn({metin: 'Paket seç', ikon: 'program', veri: {eylem: 'paket-sec', id: d.slug}})}</div></div>`});
  };
  const sonucHtml = c => {
    const {l, gevsek} = eslestir(c);
    return DD.onbSablon({
      adim: TOPLAM, toplam: TOPLAM, geri: false, baslik: `Sana yakın ${l.length} uzman`, alt: 'Yanıtlarına göre **eşleşme nedenlerini** kartlarda görebilirsin.',
      atla: {metin: 'Baştan', veri: {eylem: 'bastan'}}, devam: false,
      html: `<div class="dd-yigin">${gevsek ? DD.bant({ton: 'bilgi', metin: E().gevsetmeNotu.replace('sana en yakın uzmanları', '**sana en yakın uzmanları**')}) : ''}${l.map((x, i) => sonucKart(x, i, c)).join('')}${DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: E().not.replace('tıbbi teşhis ya da tedavi sağlamaz', '**tıbbi teşhis ya da tedavi sağlamaz**')})}</div>`
    });
  };

  // ---------- Paket seçimi: ödeme yok, onay akışı profilde sürer ----------
  const paketSheet = slug => {
    const d = D().find(x => x.slug === slug);
    let secili = (d.paketler.find(p => p.rozet) || d.paketler[0]).id;
    DD.sheet({
      baslik: d.kisaAd,
      html: `<div class="dd-yigin">${DD.paketler({ad: 'paket', ogeler: d.paketler, secili})}${DD.p('Saatini bir sonraki adımda seçersin. **Bu adımda ödeme alınmaz.**', {ton: 'ikincil'})}</div>`,
      altBar: DD.btn({metin: 'Saat seç', ikon: 'takvim', tam: true, veri: {eylem: 'paket-devam'}}),
      sonra: h => {
        const c = [DD.on(h, 'paket', v => { secili = v; }), DD.eylem(h, 'paket-devam', () => DD.git(`#/uzman/profil/${d.slug}?paket=${secili}&ertele=1`))];
        return () => c.forEach(f => f());
      }
    });
  };

  // ---------- Vitrin bağları ----------
  const vitrinBagla = (kok, ctx) => {
    const s = ctx.liste, govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
    let bekle = 0, zaman = 0;
    const rozet = () => {
      const n = secimSayi(s), b0 = arac.querySelector('.dd-liste-search-filter');
      b0.classList.toggle('is-active', n > 0);
      let b = b0.querySelector('.dd-badge');
      if (!n) { b?.remove(); return; }
      if (!b) { b = document.createElement('span'); b.className = 'dd-badge dd-liste-search-filter__badge'; b0.append(b); }
      b.textContent = n;
    };
    const secileGit = () => { const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]'); if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2; };
    const seritCiz = sifirla => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); if (sifirla) secileGit(); else if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
    const listeCiz = () => { govde.innerHTML = icerik(s, sirala(suz(s), s.sira), ctx.hazir); };
    const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
    const guncelle = () => { listeCiz(); seritCiz(); rozet(); yaz(s); hizala(); };
    secileGit();
    if (!ctx.hazir) zaman = setTimeout(() => { ctx.hazir = true; listeCiz(); }, DD.TK.motion.reveal);

    const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
    const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
    girdi.addEventListener('input', ara);
    girdi.addEventListener('keydown', enter);
    const canli = d => {
      const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
      if (!b) return;
      const n = suz(s, d).length;
      b.querySelector('span').textContent = n ? `${DD.sayi(n)} uzmanı gör` : 'Sonuç yok';
      b.disabled = !n;
      GRUPLAR.forEach(g => secenekler(g.ad).forEach(v => { const c = sheet.querySelector(`input[name="${g.ad}"][value="${CSS.escape(v)}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, g.ad, v); }));
    };
    const c = [
      DD.on(kok, 'kapsam', v => { s.seg = v; seritCiz(true); yaz(s); }),
      DD.on(kok, 'cip', v => { const g = s.seg, ayni = s.f[g].length === 1 && s.f[g][0] === v; s.f[g] = v && !ayni ? [v] : []; guncelle(); }),
      DD.on(kok, 'gorunum', v => { s.gorunum = v; listeCiz(); yaz(s); }),
      DD.eylem(kok, 'filtre', () => DD.filtreSheet({
        baslik: 'Uzmanları filtrele',
        gruplar: GRUPLAR.map(g => ({baslik: g.baslik, ad: g.ad, ikon: g.ikon, tur: 'coklu', ogeler: secenekler(g.ad).map(v => ({metin: v, deger: v, sayi: say(s, s.f, g.ad, v)}))})),
        secili: s.f,
        eylem: `${DD.sayi(suz(s).length)} uzmanı gör`,
        degisti: canli,
        uygula: d => { s.f = {...bosF(), ...Object.fromEntries(GRUPLAR.map(g => [g.ad, (d[g.ad] || []).map(String)]))}; guncelle(); }
      })),
      DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: SIRALAR, sec: v => { s.sira = v; guncelle(); }})),
      DD.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
      DD.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi').classList.remove('has-text'); guncelle(); }),
      DD.eylem(kok, 'paket-sec', el => paketSheet(el.dataset.id))
    ];
    return () => { clearTimeout(bekle); clearTimeout(zaman); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); c.forEach(f => f()); };
  };

  // ---------- Eşleşme bağları ----------
  const eslesmeBagla = (kok, ctx) => {
    const n = adimNo(ctx), sonraki = () => DD.git(n < TOPLAM ? `#/uzman/bul?adim=${n + 1}` : '#/uzman/bul?adim=sonuc');
    if (n > TOPLAM) {
      const c = [DD.eylem(kok, 'paket-sec', el => paketSheet(el.dataset.id)), DD.eylem(kok, 'bastan', () => { DD.durum.sil(ESLESME); DD.yerine('#/uzman/bul?adim=1'); })];
      return () => c.forEach(f => f());
    }
    const q = E().sorular[n - 1];
    const c = [
      DD.on(kok, q.alan, v => { DD.durum.yaz(ESLESME, {...cevaplar(), [q.alan]: v}); kok.querySelector('[data-eylem="devam"]').disabled = false; }),
      DD.eylem(kok, 'devam', sonraki),
      DD.eylem(kok, 'atla', () => { const y = cevaplar(); delete y[q.alan]; DD.durum.yaz(ESLESME, y); sonraki(); })
    ];
    return () => c.forEach(f => f());
  };

  DD.ekran('uzman-bul', {
    tur: 'banner',
    nav: 'uzman',
    ust: '#/uzman',
    tabagim: false,
    yenile: true,
    baslik: ctx => (ctx.sorgu.adim ? 'Uzman eşleşmesi' : 'Diyetisyenler'),
    // Eşleşme adımları fotoğrafsızdır: bar solid kalır, geri düğmesi adım şablonu yerine barda durur.
    ustBar: ctx => (ctx.sorgu.adim || ctx.sorgu.durum === 'hata' ? {saydam: false} : {}),
    ciz: ctx => {
      if (ctx.sorgu.durum === 'hata') return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/uzman/bul'}});
      if (ctx.sorgu.adim) { const n = adimNo(ctx), c = cevaplar(); return n <= TOPLAM ? adimHtml(n, c) : sonucHtml(c); }
      ctx.liste ||= oku();
      const s = ctx.liste, uzmanlik = new Set(D().flatMap(d => d.uzmanliklar)).size;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/uzman-masa.webp',
        baslik: 'Diyetisyenler',
        stat: [{deger: DD.sayi(D().length), etiket: 'Uzman'}, {deger: DD.sayi(uzmanlik), etiket: 'Uzmanlık'}, {deger: DD.sayi(DDV.diyetisyenFiltreleri.sehir.length), etiket: 'Şehir'}],
        arac: DD.listeArac({yer: 'Uzman ara', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
        html: icerik(s, sirala(suz(s), s.sira), ctx.hazir)
      });
    },
    // Banner ekranda adım şablonunun alt düğmesi sabit kalmaz; düğme ekranın alt çubuğunda durur.
    altBar: ctx => {
      if (!ctx.sorgu.adim) return '';
      const n = adimNo(ctx), q = E().sorular[n - 1];
      return DD.altEylem({dugmeler: [n > TOPLAM ? {metin: 'Tüm diyetisyenler', tur: 'secondary', tam: true, yerine: '#/uzman/bul'} : {metin: n === TOPLAM ? 'Uzmanları gör' : 'Devam', tam: true, pasif: !cevaplar()[q.alan], veri: {eylem: 'devam'}}]});
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.durum === 'hata') return undefined;
      return ctx.sorgu.adim ? eslesmeBagla(kok, ctx) : vitrinBagla(kok, ctx);
    }
  });
})();
