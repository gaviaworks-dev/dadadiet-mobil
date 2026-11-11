/* Beslenme Rehberi ve Makro Rehberi (W1): tek ekran tanımı, iki rota.
 * #/rehberler: Gastro liste-v2 (DD.kubbe + DD.listeArac). Web karşılığı besin-rehberi/ ve makro-rehberi/ (eski /beslenme adresi de besin-rehberi/'ne gider):
 *   kapsam segmenti Beslenme Rehberi | Makro Rehberi, içerik ailesi çipleri (rehber, ipucu, püf noktası, kaç kalori; web hub kartlarının ailesi),
 *   arama, filtre, sıralama, ızgara/liste, web giriş metni, liste sonunda web sayacı ("777 rehberden 19 tanesi gösteriliyor") ve genel bilgi notu.
 *   Başka aileden kart kendi ekranında açılır (web hubKart): ipucu ve püf → #/ipucu/:slug, kaç kalori → #/kac-kalori/:slug (DDV.kacKalori'de varsa); kalanı #/rehber/:slug.
 * #/rehber/:slug: ipucu.js makale iskeleti (Gastro DG.sayfa('puf')): kart perdeli banner, özet, numaralı DD.icerikBlok, Kaynaklar akordiyonu, ilgili araç,
 *   künye, genel bilgi notu, "Bunlar da işine yarar"; kayınca beliren çubukta Paylaş (web: yalnız bağlantı paylaşımı, kaydet yok).
 *   Tam metin yalnız web'de tam metni olan iki sayfada (dengeli-tabak: 4 soru, protein-kaynaklari-hayvansal-bitkisel: 6 bölüm); kalanında özet, web giriş
 *   paragrafı ve bölüm başlıkları (rehberler.json) ile "Tamamını dadadiet.com’da oku" (canlı sayfa yeni sekmede). Metin uydurulmaz.
 * Kaynak DDV.rehber (veri/rehber.js). Durum: 'rehber-liste' {tur, q, gorunum, sira, f:{aile[]}} ekran tercihi.
 * Dış bağlantı: ?tur=beslenme|makro, ?aile=rehber|ipucu|puf|kac-kalori|makro, ?q=metin, ?temiz=1. Haller: ortak ?hal= (liste ?hal=bos), detayda bilinmeyen slug → bulunamadı. */
(() => {
  const R = () => DDV.rehber;
  const ANAHTAR = 'rehber-liste', GRUPLAR = ['aile'];
  const TURLER = [{ad: 'Beslenme Rehberi', deger: 'beslenme'}, {ad: 'Makro Rehberi', deger: 'makro'}];
  const SIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['okunan', 'En çok okunan', 'fire'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z']];
  const KUNYE_IKON = {'Başlık': 'list-check', Kaynak: 'book-open', Aile: 'layer-group', Okuma: 'saat'};
  // Aynı tanım iki rotaya hizmet eder; router'ın ekran tanımından okuduğu sabit alanlar (dock, ust, bos) o anki adrese göre verilir.
  const detayMi = () => /^#\/rehber\//.test(location.hash);
  const tum = () => R()?.liste || [];
  const bul = slug => R()?.bul(slug) || null;
  const aile = a => R().aileler.find(x => x.deger === a);
  const tur = t => R().turler.find(x => x.deger === t);
  const webUrl = x => `https://dadadiet.com/${x.webYol}`;
  const ipucuVar = slug => !!(DDV.kutuphane?.icerikBul?.(slug) || (DDV.icerikler || []).some(y => y.slug === slug));
  const kacKaloriVar = slug => { const k = DDV.kacKalori; if (!k) return false; if (typeof k.bul === 'function') return !!k.bul(slug); return [k.yazilar, k.liste].some(l => Array.isArray(l) && l.some(y => y.slug === slug)); };
  const hedef = x => ((x.aile === 'ipucu' || x.aile === 'puf') && ipucuVar(x.slug) ? `#/ipucu/${x.slug}` : x.aile === 'kac-kalori' && kacKaloriVar(x.slug) ? `#/kac-kalori/${x.slug}` : `#/rehber/${x.slug}`);
  const okunmaMeta = x => (x.okunma != null ? `${DD.sayi(x.okunma)} okunma` : undefined);

  // ---------- Metin ----------
  // Paragrafta vurgu zorunlu: web'deki kalınlar aynen; kalın yoksa ilk yan cümle (ipucu.js ile aynı kural). [metin](#/adres) uygulama içi bağlantıdır.
  const ilkCumle = s => { const i = s.search(/[;:]|[,.](?=\s|$)/), bas = i > 0 ? s.slice(0, i) : s, k = bas.split(' '); return k.length > 5 ? s : `**${bas}**${s.slice(bas.length)}`; };   // ilk yan cümle uzunsa vurgu yok (yarım ifade kalın olmasın)
  const vurgulu = s => (s.includes('**') ? s : ilkCumle(s));
  const ozetVurgu = s => { const m = s.match(/^(.+?[.?!])(\s|$)/); return m ? `**${m[1]}**${s.slice(m[1].length)}` : `**${s}**`; };
  const p = (m, o) => DD.p(m, o).replace(/\[([^\]]+)\]\((#\/[^)\s]+)\)/g, (_, t, h) => `<a href="${h}" data-git="${h}">${t}</a>`);
  const maddeler = l => `<div class="dd-yigin-8">${l.map(m => DD.madde({metin: m, tur: 'notr'})).join('')}</div>`;
  const genelNot = metin => DD.ipucu({ikon: 'bilgi', baslik: 'Genel bilgi notu', metin, eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}});

  // ---------- Kartlar ----------
  const kart = x => DD.icerikKart({gorsel: x.gorsel, kategori: aile(x.aile).ad, baslik: x.baslik, meta: okunmaMeta(x), metaIkon: 'eye', git: hedef(x)});
  const satir = x => DD.satir({sol: DD.gorsel({src: x.gorsel, ad: x.baslik}), baslik: x.baslik, alt: [aile(x.aile).ad, okunmaMeta(x)].filter(Boolean).join(' · '), git: hedef(x), ok: true});

  // =================== Liste (#/rehberler) ===================
  const gecerliTur = t => TURLER.some(x => x.deger === t);
  const gecerliAile = a => !!R().aileler.some(x => x.deger === a);
  const bosF = () => ({aile: []});
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {tur: gecerliTur(d.tur) ? d.tur : 'beslenme', q: d.q || '', gorunum: d.gorunum === 'liste' ? 'liste' : 'izgara', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {aile: (d.f?.aile || []).filter(gecerliAile)}};
    if (sorgu.temiz || sorgu.q || sorgu.tur || sorgu.aile) {
      s.f = bosF(); s.q = sorgu.q || ''; s.tur = gecerliTur(sorgu.tur) ? sorgu.tur : 'beslenme';
      if (gecerliAile(sorgu.aile)) s.f.aile = [sorgu.aile];
    }
    return s;
  };
  const yaz = ({tur: t, q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {tur: t, q, gorunum, sira, f});
  const secimSayi = s => s.f.aile.length;

  const katlanmis = new Map();
  const metin = x => { if (!katlanmis.has(x.slug)) katlanmis.set(x.slug, DD.katla([x.baslik, x.ozet, aile(x.aile).ad, tur(x.tur).ad, ...(x.bolumler || [])].join(' '))); return katlanmis.get(x.slug); };
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return tum().filter(x => x.tur === s.tur && (haric === 'aile' || !f.aile.length || f.aile.includes(x.aile)) && q.every(k => metin(x).includes(k)));
  };
  const say = (s, f, v) => suz(s, f, 'aile').filter(x => x.aile === v).length;
  const sirala = (l, sira) => {
    const ad = (a, b) => a.baslik.localeCompare(b.baslik, 'tr');
    const fark = {onerilen: () => 0, okunan: (a, b) => (b.okunma ?? -1) - (a.okunma ?? -1), ad}[sira];
    return [...l].sort(fark);
  };
  const aileSecenek = s => R().aileler.filter(a => tum().some(x => x.tur === s.tur && x.aile === a.deger));
  const aileGorsel = (s, a) => tum().find(x => x.tur === s.tur && x.aile === a)?.gorsel;

  const segment = s => DD.segment({ad: 'tur', etiket: 'Rehber', secili: s.tur, ogeler: TURLER.map(t => ({ad: t.ad, deger: t.deger}))});
  const serit = s => DD.cipSerit({ad: 'cip', etiket: 'İçerik ailesi', secili: s.f.aile.length ? s.f.aile : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'book-open', sayi: suz(s, s.f, 'aile').length}, ...aileSecenek(s).filter(a => say(s, s.f, a.deger) > 0 || s.f.aile.includes(a.deger)).map(a => ({metin: a.ad, deger: a.deger, gorsel: aileGorsel(s, a.deger), sayi: say(s, s.f, a.deger)}))]});
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(l.map(satir))] : l.map(kart), {gorunum: s.gorunum});
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: s.f.aile.map(v => ({metin: aile(v).ad, kapat: true, etiket: `${aile(v).ad} seçimini kaldır`, veri: {eylem: 'kaldir', id: v}}))});
  const bosMetin = s => (s.q ? `“**${s.q}**” için rehber bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan rehber yok. **Seçimlerini temizleyip** yeniden bak.');
  // Web hub başı: "Nereden Başlamak İstersin?" / "Hangi Makroyla Başlamak İstersin?" ve giriş metni.
  const giris = s => { const t = tur(s.tur); return DD.metinBlok({baslik: t.bas, metin: t.metin || t.alt, rol: 'section'}); };
  // Web liste sonu: "777 rehberden 1–12 arası gösteriliyor" (sayaç web'in).
  const sonNot = (s, l) => DD.veriYok(`**${DD.sayi(R().sayac[s.tur])} rehberden ${DD.sayi(l.length)} tanesi** gösteriliyor.`);
  const icerik = (s, l) => {
    const filtreli = secimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli ? '' : giris(s)}${secimSayi(s) ? secimler(s) : ''}`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Rehber bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'rehber', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}${sonuc(l, s)}${filtreli ? '' : sonNot(s, l)}${genelNot(R().genelNotListe)}`;
  };

  const durum = ctx => (ctx.liste ||= oku(ctx.sorgu));
  // Seçili çip yarım kalmasın: yalnız şeridin kendi kaydırması ayarlanır (sayfa kaymaz).
  const seciliGoster = serit => { const c = serit?.querySelector('[aria-pressed=true]'); if (!c) return; const r = serit.getBoundingClientRect(), b = c.getBoundingClientRect(); if (b.left < r.left || b.right > r.right) serit.scrollLeft += b.left - r.left - (serit.clientWidth - c.offsetWidth) / 2; };
  const listeCiz = ctx => {
    if (!tum().length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/rehberler'}});
    const s = durum(ctx), S = R().sayac;
    return DD.kubbe({
      gorsel: 'assets/gorsel/hero/karsilama-sofra.webp',
      baslik: tur(s.tur).ad,
      alt: tur(s.tur).alt,
      stat: [{deger: DD.sayi(S.beslenme), etiket: 'Rehber'}, {deger: DD.sayi(S.makro), etiket: 'Makro rehberi'}, {deger: DD.sayi(S.aile), etiket: 'İçerik ailesi'}],
      arac: DD.listeArac({yer: 'Rehber ara', deger: s.q, filtreSayi: secimSayi(s), segment: segment(s), serit: serit(s)}),
      html: icerik(s, sirala(suz(s), s.sira))
    });
  };

  const listeSonra = (kok, ctx) => {
    const s = ctx.liste;
    if (!s) return null;
    const govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
    let bekle = 0;
    rail.hidden = aileSecenek(s).length < 2;
    const rozet = () => DD.filtreSayiYaz(arac, secimSayi(s));
    // Tek aile varsa (Makro Rehberi) aile çipleri gizlenir; kubbe başlığı ve alt metni seçili rehberin web metnidir.
    const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); rail.hidden = aileSecenek(s).length < 2; if (rail.firstElementChild) { rail.firstElementChild.scrollLeft = x; seciliGoster(rail.firstElementChild); } };
    const kubbeYaz = () => { const t = tur(s.tur), h = kok.querySelector('.dd-banner-metin h1'), a = kok.querySelector('.dd-banner-metin p'), u = kok.querySelector('.dd-htitle'); if (h) h.textContent = t.ad; if (a) a.textContent = t.alt; if (u) u.textContent = t.ad; };
    const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
    const listeYaz = () => { govde.innerHTML = icerik(s, sirala(suz(s), s.sira)); };
    const guncelle = () => { listeYaz(); seritCiz(); rozet(); yaz(s); hizala(); };

    const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
    const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
    girdi.addEventListener('input', ara);
    girdi.addEventListener('keydown', enter);

    const canli = d => {
      const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
      if (!b) return;
      const f = {aile: (d.aile || []).map(String)}, n = suz(s, f).length;
      b.querySelector('span').textContent = n ? `${DD.sayi(n)} rehberi gör` : 'Sonuç yok';
      b.disabled = !n;
      aileSecenek(s).forEach(a => { const c = sheet.querySelector(`input[name="aile"][value="${a.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, f, a.deger); });
    };
    const temizleyiciler = [
      DD.on(kok, 'tur', v => { s.tur = v; s.f.aile = s.f.aile.filter(a => aileSecenek(s).some(x => x.deger === a)); kubbeYaz(); guncelle(); }),
      DD.on(kok, 'cip', v => { const ayni = s.f.aile.length === 1 && s.f.aile[0] === v; s.f.aile = v && !ayni ? [v] : []; guncelle(); }),
      DD.on(kok, 'gorunum', v => { s.gorunum = v; listeYaz(); yaz(s); }),
      DD.eylem(kok, 'filtre', () => DD.filtreSheet({
        baslik: 'Rehberleri filtrele',
        gruplar: [{baslik: 'İçerik ailesi', ad: 'aile', ikon: 'layer-group', tur: 'coklu', ogeler: aileSecenek(s).map(a => ({metin: a.ad, deger: a.deger, gorsel: aileGorsel(s, a.deger), sayi: say(s, s.f, a.deger)}))}],
        secili: s.f,
        eylem: `${DD.sayi(suz(s).length)} rehberi gör`,
        degisti: canli,
        uygula: d => { s.f = {aile: (d.aile || []).map(String)}; guncelle(); }
      })),
      DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: SIRALAR, sec: v => { s.sira = v; guncelle(); }})),
      DD.eylem(kok, 'kaldir', el => { s.f.aile = s.f.aile.filter(x => x !== el.dataset.id); guncelle(); }),
      DD.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); guncelle(); })
    ];
    return () => { clearTimeout(bekle); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); temizleyiciler.forEach(f => f()); };
  };

  // =================== Detay (#/rehber/:slug) ===================
  const blokHtml = b => (b.t === 'p' ? p(vurgulu(b.m)) : DD.bilgi({etiket: b.baslik || undefined, ikon: 'list-check', html: maddeler(b.maddeler)}));
  const tamGovde = (x, m) => `${DD.makale(`${p(ozetVurgu(x.ozet))}${m.giris ? p(vurgulu(m.giris)) : ''}`)}${m.bolumler.map((b, i) => DD.icerikBlok({no: i + 1, baslik: b.baslik, html: b.bloklar.map(blokHtml).join(''), id: `b${i + 1}`, paylasUrl: `${webUrl(x)}#b${i + 1}`})).join('')}`;
  // Tam metni olmayan rehber: özet, web giriş paragrafı (son tam cümlede biter), bölüm başlıkları; tamamı canlı sitede.
  const ozetGovde = x => {
    const bol = (x.bolumler || []).length > 1 ? DD.bilgi({etiket: 'Bu rehberde', ikon: 'list-check', html: maddeler(x.bolumler)}) : '';
    return `${DD.makale(`${p(ozetVurgu(x.ozet))}${x.giris ? p(vurgulu(x.giris)) : ''}`)}${bol}${DD.btn({metin: 'Tamamını dadadiet.com’da oku', ikon: 'arrow-up-right-from-square', tur: 'secondary', tam: true, veri: {eylem: 'rehber-web'}})}`;
  };
  // "TÜBER 2022 — Türkiye Beslenme Rehberi **Bölüm 2.2.2.4, s. 22** Açıklama" → **eser**, yer. Açıklama
  const kaynakMetin = s => { const m = s.match(/^(.*?Rehberi)\s+\*\*(.+?)\*\*\s+(.*)$/); return m ? `**${m[1]}**, ${m[2]}. ${m[3]}` : vurgulu(s); };
  const kaynakNot = s => { const m = s.match(/Türkiye Beslenme Rehberi\S*/); return m ? s.replace(m[0], `**${m[0]}**`) : ilkCumle(s); };
  const kaynaklar = m => {
    const l = m.kaynaklar || [];
    if (!l.length && !m.kaynakNot) return '';
    return DD.akordiyon([{baslik: 'Kaynaklar', alt: l.length ? `${l.length} kaynak` : 'TÜBER 2022', ikon: 'book-open', icerik: DD.makale(`${l.map(k => p(kaynakMetin(k.metin))).join('')}${m.kaynakNot ? p(kaynakNot(m.kaynakNot), {ton: 'ikincil', meta: true}) : ''}`)}], {acik: -1});
  };
  const kunye = m => (m.kunye?.length ? DD.kunye(m.kunye.map(([etiket, deger]) => ({ikon: KUNYE_IKON[etiket] || 'bilgi', etiket, deger}))) : '');
  // Dengeli Tabak'ta web'in "Bunlar da İşine Yarar" listesi; diğerlerinde aynı aileden ilk dört rehber.
  const ilgili = (x, m) => (m?.ilgili ? m.ilgili.map(bul).filter(Boolean) : tum().filter(y => y.slug !== x.slug && y.aile === x.aile)).filter(y => y.slug !== x.slug).slice(0, 4);
  const ilgiliBolum = (x, m) => { const l = ilgili(x, m); return l.length ? DD.bolum({baslik: 'Bunlar da işine yarar', eylem: 'Tümü', git: `#/rehberler?tur=${x.tur}`, html: `<div class="dd-izgara">${l.map(kart).join('')}</div>`}) : ''; };
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu rehber burada değil', metin: 'Bağlantı eskimiş olabilir. **Beslenme Rehberi**’nden aynı konudaki yazıları bulabilirsin.', eylem: {metin: 'Rehberlere dön', yerine: '#/rehberler'}});

  const detayCiz = ctx => {
    const x = bul(ctx.param.slug);
    if (!x) return yokEkrani();
    const m = R().metinler[x.slug], a = aile(x.aile);
    return DD.kubbe({
      perde: 'kart',
      gorsel: x.gorsel,
      baslik: x.baslik,
      alt: [tur(x.tur).ad, x.aile !== 'rehber' && x.aile !== 'makro' ? a.ad : null].filter(Boolean).join(' · '),
      stat: [m && {deger: DD.sayi(m.bolumler.length), etiket: m.bolumAd}, x.okunma != null && {deger: DD.sayi(x.okunma), etiket: 'okunma'}, m?.okumaDk && {deger: `${m.okumaDk} dk`, etiket: 'okuma'}].filter(Boolean),
      html: `<section class="dd-ic dd-yigin">${m ? tamGovde(x, m) : ozetGovde(x)}${m ? kaynaklar(m) : ''}${m?.arac ? DD.eylemKart({...m.arac, altSatir: 2}) : ''}${m ? kunye(m) : ''}${genelNot(R().genelNot)}</section>${ilgiliBolum(x, m)}`
    });
  };
  const detaySonra = (kok, ctx) => {
    const x = bul(ctx.param.slug);
    if (!x) return undefined;
    const temizle = [
      DD.eylem(kok, 'rehber-paylas', () => DD.paylas({baslik: x.baslik, alt: x.ozet, url: webUrl(x)})),
      DD.eylem(kok, 'rehber-web', () => window.open(webUrl(x), '_blank', 'noopener'))
    ];
    return () => { temizle.forEach(f => f()); };
  };

  DD.ekran('rehber', {
    get bos() { return detayMi() ? undefined : {ikon: 'book-open', baslik: 'Rehber bulunamadı', metin: 'Bu konuda henüz rehber yok. **Diğer rehberlere** göz at.', eylem: {metin: 'Tüm rehberler', ikon: 'tumu', yerine: '#/rehberler'}}; },   // ?hal=bos (ortak DD.bos), yalnız liste
    tur: 'banner',
    nav: 'bugun',
    get dock() { return !detayMi(); },
    get ust() { return detayMi() ? '#/rehberler' : '#/bugun'; },
    iskelet: 'detay',   // liste de kapaklı kubbe + panel: kanondaki en yakın iskelet 'detay' (kapak + satırlar)
    baslik: ctx => (ctx.param.slug ? bul(ctx.param.slug)?.baslik || 'Rehber' : tur(durum(ctx).tur).ad),
    yukle: () => new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast)),
    ciz: ctx => (ctx.param.slug ? detayCiz(ctx) : listeCiz(ctx)),
    altBar: ctx => {
      const x = ctx.param.slug && bul(ctx.param.slug);
      return x ? DD.kayanBar({gorsel: x.gorsel, baslik: x.baslik, eylemler: [{ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'rehber-paylas'}}]}) : '';
    },
    sonra: (kok, ctx) => (ctx.param.slug ? detaySonra(kok, ctx) : listeSonra(kok, ctx))
  });
})();
