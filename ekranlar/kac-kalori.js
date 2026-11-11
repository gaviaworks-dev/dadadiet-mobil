/* Kaç Kalori? (#/kac-kalori, #/kac-kalori/:slug). Web karşılığı kac-kalori/, kac-kalori/kategori/sebze/, kac-kalori/<slug> (beslenme.mjs kacKalori, kacKaloriKategori, kacKaloriDetay).
 * Liste Gastro liste-v2 (besinler.js, ipuclari.js kalıbı): kubbe + DD.listeArac (arama, kategori çip şeridi), En yeni / En çok okunan sırası, satır ve ızgara görünümü,
 * liste sonunda web'in kalori notu + Diyetisyen bul. Detay Gastro püf detayı (ipucu.js kalıbı): kart perdeli banner, kısa yanıt, numaralı bölümler (DD.icerikBlok),
 * Besin Kaydı künyesi, Kaynaklar, genel bilgi notu, "Bunlar da işine yarar". Görseli olmayan yazıda kapak yoktur (besin.js kalıbı): üst bar düz, başta ikonlu satır.
 * Kaynak DDV.kacKalori (veri/kac-kalori.js). Tam metin yalnız web'de detayı olan yazıda; kalanında web özeti ve "Yazının tamamı bekleniyor" bandı: metin uydurulmaz.
 * Yazının andığı besin kaydı DDV.besinler'de varsa "Yazıdaki besinler" satırları #/besin/:slug açar; "Öğüne ekle" besin detayını ?ekle=1 ile açar, Öğüne ekle sheet'i kendiliğinden açılır (bir kayıtta doğrudan, birden çokta önce seçim sheet'i).
 * Durum: 'kac-kalori-liste' {q, gorunum, sira, f:{kategori[]}} ekran tercihi.
 * Dış bağlantı: ?kategori=sebze (web /kac-kalori/kategori/sebze ve ?kategori=<slug>), ?q=metin, ?temiz=1. Yazısı olmayan kategori (?kategori=icecek) "yazıları bekleniyor" boş hali,
 * bilinmeyen yazı (#/kac-kalori/olmayan) DD.hataEkran bulunamadi. Paylaş: DD.paylas, bağlantı https://dadadiet.com/kac-kalori/<slug>. */
(() => {
  const SAYFA = 12, ANAHTAR = 'kac-kalori-liste', GRUPLAR = ['kategori'];
  const SIRALAR = [['yeni', 'Önerilen', 'wand-magic-sparkles'], ['okunan', 'En çok okunan', 'fire-flame-curved']];
  const KK = () => DDV.kacKalori;
  const tum = () => KK()?.yazilar || [];
  const bul = slug => KK()?.bul?.(slug) || null;
  const kat = slug => KK()?.kategori?.(slug) || null;
  const katAd = slug => kat(slug)?.ad || slug;
  const webUrl = y => `https://dadadiet.com/kac-kalori/${y.slug}`;
  const besin = slug => DDV.besinBul?.(slug) || (DDV.besinler || []).find(b => b.slug === slug) || null;
  const besinleri = y => (y.besinler || []).map(besin).filter(Boolean);
  const detayMi = () => /^#\/kac-kalori\/[^?]/.test(location.hash);
  const bosF = () => ({kategori: []});

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {q: d.q || '', gorunum: d.gorunum === 'izgara' ? 'izgara' : 'liste', sira: SIRALAR.some(x => x[0] === d.sira) ? d.sira : 'yeni', f: {...bosF(), ...(d.f || {})}, gosterilen: SAYFA};
    if (sorgu.temiz || sorgu.q || sorgu.kategori) {
      s.f = bosF(); s.q = sorgu.q || '';
      if (sorgu.kategori && kat(sorgu.kategori)) s.f.kategori = [sorgu.kategori];
    }
    s.f.kategori = s.f.kategori.filter(k => kat(k));
    return s;
  };
  const yaz = ({q, gorunum, sira, f}) => DD.durum.yaz(ANAHTAR, {q, gorunum, sira, f});
  const secimSayi = s => s.f.kategori.length;

  // ---------- Süzme ve sıralama ----------
  const eslesir = (y, g, v) => y[g] === v;
  const katlanmis = new Map();
  const metin = y => { if (!katlanmis.has(y.slug)) katlanmis.set(y.slug, DD.katla(`${y.ad} ${y.ozet} ${katAd(y.kategori)}`)); return katlanmis.get(y.slug); };
  const suz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return tum().filter(y => GRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => eslesir(y, g, v))) && q.every(x => metin(y).includes(x)));
  };
  const say = (s, f, g, v) => suz(s, f, g).filter(y => eslesir(y, g, v)).length;
  // En yeni: web listesinin sırası (veri sırası). En çok okunan: okunma sayısı; sayısı olmayan sona.
  const sirala = (l, sira) => (sira === 'okunan' ? [...l].sort((a, b) => (b.okunma ?? -1) - (a.okunma ?? -1)) : l);

  // ---------- Parçalar ----------
  const meta = y => [katAd(y.kategori), y.okunma != null ? `${DD.sayi(y.okunma)} okunma` : null].filter(Boolean).join(' · ');
  const satir = y => DD.satir({sol: DD.gorsel({src: y.gorsel, ad: y.ad, ikon: y.ikon}), baslik: y.ad, alt: y.ozet, ozet: true, ek: `<span class="dd-t-meta dd-ton-ikincil">${DD.esc(meta(y))}</span>`, git: `#/kac-kalori/${y.slug}`, ok: true});
  const kart = y => DD.icerikKart({gorsel: y.gorsel, kategori: katAd(y.kategori), baslik: y.ad, meta: y.okunma != null ? `${DD.sayi(y.okunma)} okunma` : undefined, metaIkon: 'eye', git: `#/kac-kalori/${y.slug}`});
  const ogeler = (l, s) => (s.gorunum === 'liste' ? l.map(satir) : l.map(kart));
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(ogeler(l, s))] : ogeler(l, s), {gorunum: s.gorunum});
  // Çip şeridi: yazısı olan kategoriler (web gibi); deep link ile seçilen boş kategori de görünür kalır.
  const serit = s => {
    const l = KK().kategoriler.filter(k => say(s, s.f, 'kategori', k.slug) > 0 || s.f.kategori.includes(k.slug));
    return DD.cipSerit({ad: 'cip', etiket: 'Kategori', secili: s.f.kategori.length ? s.f.kategori : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'layer-group', sayi: suz(s, s.f, 'kategori').length}, ...l.map(k => ({metin: k.ad, deger: k.slug, ikon: k.ikon, sayi: say(s, s.f, 'kategori', k.slug)}))]});
  };
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: s.f.kategori.map(v => ({metin: katAd(v), kapat: true, etiket: `${katAd(v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `kategori|${v}`}}))});
  // Web kategori sayfasının giriş metni (yalnız Sebze & Meyve'de var).
  const katGiris = s => { const m = s.f.kategori.length === 1 && KK().kategoriMetin?.[s.f.kategori[0]]; return m ? DD.p(`**${katAd(s.f.kategori[0])}:** ${m.alt}`, {ton: 'ikincil', meta: true}) : ''; };
  const bosMetin = s => (s.q ? `“**${s.q}**” bu yazılarda geçmiyor. Farklı bir kelime dene ya da **seçimlerini temizle**.` : 'Bu seçimlere uyan yazı yok. **Seçimlerini temizleyip** yeniden bak.');
  // Yazısı olmayan kategori: web'de yazıları var, uygulamaya gelmedi (içerik bekleniyor).
  const katBos = s => {
    const k = s.f.kategori.length === 1 && !s.q && kat(s.f.kategori[0]);
    return k && !suz({...s, q: ''}).length ? DD.listeBos({ikon: k.ikon, baslik: `${k.ad} kategorisinde henüz yazı yok`, metin: 'Bu kategorinin yazıları henüz burada değil. **Diğer kategorilere** göz at.', eylem: {metin: 'Tüm yazılar', tur: 'secondary', veri: {eylem: 'temizle'}}}) : '';
  };
  const listeNot = () => DD.ipucu({ikon: 'bilgi', baslik: 'Genel bilgi notu', metin: KK().notlar.liste, eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}});
  const icerik = (s, l) => {
    const bas = `${secimSayi(s) ? secimler(s) : ''}${katGiris(s)}`;
    if (!l.length) return `<div class="dd-yigin">${bas}${katBos(s) || DD.listeBos({baslik: 'Yazı bulunamadı', metin: bosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}</div>`;
    return `<div class="dd-yigin">${bas}${DD.listeDurum({sayi: l.length, birim: 'yazı', gorunum: s.gorunum, siraliAktif: s.sira !== 'yeni'})}${sonuc(l.slice(0, s.gosterilen), s)}${listeNot()}</div>`;
  };

  const listeCiz = ctx => {
    if (!tum().length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/kac-kalori'}});
    ctx.liste ||= oku(ctx.sorgu);
    const s = ctx.liste, S = KK().sayfa;
    return DD.kubbe({
      gorsel: 'assets/gorsel/hero/hazirlik-kutulari.webp',
      etiket: S.etiket,
      baslik: S.baslik,
      alt: S.alt,
      stat: [{deger: DD.sayi(tum().length), etiket: 'yazı'}, {deger: DD.sayi(new Set(tum().map(y => y.kategori)).size), etiket: 'kategori'}, {deger: S.okuma, etiket: 'ortalama okuma'}],
      arac: DD.listeArac({yer: 'Yazılarda ara', deger: s.q, filtreSayi: secimSayi(s), serit: serit(s)}),
      html: icerik(s, sirala(suz(s), s.sira))
    });
  };

  const listeBagla = (kok, s) => {
    const govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
    let io = null, bekle = 0;
    const sonaGeldi = l => {
      io?.disconnect(); io = null;
      kok.querySelector('.dd-sonsuz-son')?.remove(); kok.querySelector('.dd-alt-yukleniyor')?.remove();
      const not = govde.querySelector(':scope > .dd-ipucu'), son = DD.veriYok(`**${DD.sayi(l.length)} yazının** tamamını gördün.`);
      if (not) not.insertAdjacentHTML('beforebegin', son); else govde.insertAdjacentHTML('beforeend', son);
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
    const secileGit = () => { const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]'); if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2; };
    const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = serit(s); if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
    const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
    const listeYaz = () => { const l = sirala(suz(s), s.sira); govde.innerHTML = icerik(s, l); sonsuzKur(l); };
    const guncelle = () => { s.gosterilen = SAYFA; listeYaz(); seritCiz(); rozet(); yaz(s); hizala(); };

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
      b.querySelector('span').textContent = n ? `${DD.sayi(n)} yazıyı gör` : 'Sonuç yok';
      b.disabled = !n;
      KK().kategoriler.forEach(k => { const c = sheet.querySelector(`input[name="kategori"][value="${k.slug}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = say(s, d, 'kategori', k.slug); });
    };
    const temizleyiciler = [
      DD.on(kok, 'cip', v => { const ayni = s.f.kategori.length === 1 && s.f.kategori[0] === v; s.f.kategori = v && !ayni ? [v] : []; guncelle(); }),
      DD.on(kok, 'gorunum', v => { s.gorunum = v; s.gosterilen = SAYFA; listeYaz(); yaz(s); }),
      DD.eylem(kok, 'filtre', () => DD.filtreSheet({
        baslik: 'Yazıları filtrele',
        gruplar: [{baslik: 'Kategori', ad: 'kategori', ikon: 'layer-group', tur: 'coklu', ogeler: KK().kategoriler.filter(k => say(s, s.f, 'kategori', k.slug) > 0 || s.f.kategori.includes(k.slug)).map(k => ({metin: k.ad, deger: k.slug, ikon: k.ikon, sayi: say(s, s.f, 'kategori', k.slug)}))}],
        secili: s.f,
        eylem: `${DD.sayi(suz(s).length)} yazıyı gör`,
        degisti: canli,
        uygula: d => { s.f = {kategori: (d.kategori || []).map(String)}; guncelle(); }
      })),
      DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: SIRALAR, sec: v => { s.sira = v; guncelle(); }})),
      DD.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
      DD.eylem(kok, 'temizle', () => { s.f = bosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); guncelle(); })
    ];
    return () => { clearTimeout(bekle); io?.disconnect(); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); temizleyiciler.forEach(f => f()); };
  };

  // ---------- Detay ----------
  // Vurgu: web'in kalınları (**) aynen; kalını olmayan paragrafta ilk yan cümle (ipucu.js kuralı).
  const ilkCumle = s => { const i = s.search(/[;:]|[,.](?=\s|$)/), bas = i > 0 ? s.slice(0, i) : s, k = bas.split(' '); return k.length > 5 ? s : `**${bas}**${s.slice(bas.length)}`; };   // ilk yan cümle uzunsa vurgu yok (yarım ifade kalın olmasın)
  const vurgulu = s => (s.includes('**') ? s : ilkCumle(s));
  // Özet kısa yanıttır: ilk yan cümlesi kalın.
  const ozetVurgu = s => { const m = s.match(/^(.+?)([;:]\s)/); return m ? `**${m[1]}**${s.slice(m[1].length)}` : `**${s}**`; };
  const bloklar = (y, m) => {
    const giris = [], govde = [];
    m.bloklar.forEach(b => { if (b.t === 'h2') govde.push({baslik: b.h, p: []}); else (govde.length ? govde.at(-1).p : giris).push(b.h); });
    const girisHtml = DD.makale(`${DD.p(ozetVurgu(y.ozet))}${giris.map(p => DD.p(vurgulu(p))).join('')}`);
    return `${girisHtml}${govde.map((b, n) => DD.icerikBlok({no: n + 1, baslik: b.baslik, html: b.p.map(p => DD.p(vurgulu(p))).join(''), id: `b${n + 1}`, paylasUrl: `${webUrl(y)}#b${n + 1}`})).join('')}`;
  };
  const bekliyor = () => DD.bant({ton: 'bilgi', baslik: 'Yazının tamamı bekleniyor', metin: 'Kısa yanıt yukarıda. **Tam metin** hazır olduğunda bu sayfada okunur.'});
  // Web "Besin Kaydı" kartı. DD.kunye uzun değerde (Kaynak) etiketin üstüne biniyor (kanon notu); satırda değer üstte, etiket altta.
  const KUNYE_IKON = {Kayıt: 'database', Enerji: 'kalori', Kaynak: 'book-open', Yayın: 'takvim', Kategori: 'layer-group'};
  const kunye = m => (m?.kunye ? `<section class="dd-yigin-12">${DD.bas('Besin kaydı')}${DD.satirlar(m.kunye.map(x => ({ikon: KUNYE_IKON[x.etiket] || 'bilgi', baslik: x.deger, alt: x.etiket, ok: false})))}</section>` : '');
  const besinBolum = y => {
    const l = besinleri(y);
    if (!l.length) return '';
    const sag = `<span class="dd-t-meta dd-ton-ikincil">100 g</span>`;
    return `<section class="dd-yigin-12">${DD.bas('Yazıdaki besinler', {html: sag})}${DD.yuzey(DD.satirlar(l.map(b => DD.besinSatir({ad: b.ad, gorsel: b.gorsel, kcal: b.kcal, P: b.P, K: b.K, Y: b.Y}, {alt: `${b.kaynak} · Protein ${DD.ondalik(b.P, 1)} g`, git: `#/besin/${b.slug}`, ok: true}))))}${DD.p('Kayda dokun: miktarı seç, **öğününe ekle**.', {ton: 'ikincil', meta: true})}</section>`;
  };
  const kaynaklar = m => (m?.kaynaklar?.length ? DD.akordiyon([{baslik: 'Kaynaklar', alt: `${m.kaynaklar.length} kaynak`, ikon: 'book-open', icerik: DD.satirlar(m.kaynaklar.map((k, i) => ({ikon: 'arrow-up-right-from-square', baslik: k.ad, alt: `${k.yer} · ${k.not} · Erişim ${DD.tarihUzun(k.erisim)}`, veri: {eylem: 'kaynak', id: i}})))}], {acik: -1}) : '');
  const genelNot = () => DD.ipucu({ikon: 'bilgi', baslik: 'Genel bilgi notu', metin: KK().notlar.genel, eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}});
  // Bunlar da işine yarar: web'in seçtiği kartlar; yoksa aynı kategoriden, en çok okunan önce.
  const ilgili = y => {
    const secili = (KK().ilgili?.[y.slug] || []).map(bul).filter(Boolean);
    if (secili.length) return secili;
    const l = tum().filter(x => x.slug !== y.slug), sira = (a, b) => (b.okunma ?? -1) - (a.okunma ?? -1);
    return [...l.filter(x => x.kategori === y.kategori).sort(sira), ...l.filter(x => x.kategori !== y.kategori).sort(sira)].slice(0, 4);
  };
  const ilgiliBolum = y => {
    const l = ilgili(y);
    if (!l.length) return '';
    return DD.bolum({baslik: KK().ilgili?.baslik || 'Bunlar da işine yarar', eylem: 'Tümü', git: `#/kac-kalori?kategori=${y.kategori}`, html: `<div class="dd-yigin-12">${DD.p(KK().ilgili?.metin || '', {ton: 'ikincil', meta: true})}${DD.yuzey(DD.satirlar(l.map(satir)))}</div>`});
  };
  const govdeHtml = (y, m) => `<section class="dd-ic dd-yigin">${m ? bloklar(y, m) : `${DD.makale(DD.p(ozetVurgu(y.ozet)))}${bekliyor()}`}${besinBolum(y)}${kunye(m)}${kaynaklar(m)}${genelNot()}</section>${ilgiliBolum(y)}`;
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu yazı burada değil', metin: 'Bağlantı eskimiş olabilir. **Kaç Kalori?** yazılarından aradığını bulabilirsin.', eylem: {metin: 'Kaç Kalori?’ye dön', yerine: '#/kac-kalori'}});

  const detayCiz = ctx => {
    const y = bul(ctx.param.slug);
    if (!y) return yokEkrani();
    const m = KK().metin?.[y.slug] || null;
    const alt = ['Kaç Kalori?', katAd(y.kategori), m?.yayin && DD.tarihUzun(m.yayin)].filter(Boolean).join(' · ');
    const stat = m?.sayilar?.length ? m.sayilar : [y.okunma != null && {deger: DD.sayi(y.okunma), etiket: 'okunma'}].filter(Boolean);
    if (!y.gorsel) {
      const bas = DD.satir({sol: DD.gorsel({ad: y.ad, ikon: y.ikon}), baslik: y.ad, alt: [alt, ...stat.map(x => `${x.deger} ${x.etiket}`)].join(' · '), ok: false});
      return `<div class="dd-ic">${bas}</div>${govdeHtml(y, m)}`;
    }
    return DD.kubbe({perde: 'kart', gorsel: y.gorsel, baslik: y.ad, alt, stat, html: govdeHtml(y, m)});
  };

  // Öğüne ekle: besin detayının kendi akışı (porsiyon seçimi + Öğüne ekle sheet'i). Birden çok kayıtta önce hangisi seçilir.
  const ogunEkle = y => {
    const l = besinleri(y);
    if (l.length === 1) { DD.git(`#/besin/${l[0].slug}?ekle=1`); return; }
    DD.sheet({
      baslik: 'Hangi kaydı ekleyeceksin?',
      html: `<div class="dd-yigin">${DD.satirlar(l.map(b => DD.besinSatir({ad: b.ad, gorsel: b.gorsel, kcal: b.kcal, P: b.P, K: b.K, Y: b.Y}, {alt: `100 g · ${b.kaynak}`, veri: {eylem: 'kk-besin', id: b.slug}, ok: true})))}${DD.p('Kaydın sayfasında **miktarı seçip** öğününe eklersin.', {ton: 'ikincil', meta: true})}</div>`,
      sonra: d => DD.eylem(d, 'kk-besin', el => { const slug = el.dataset.id; d.kapat(); DD.git(`#/besin/${slug}?ekle=1`); })
    });
  };

  DD.ekran('kac-kalori', {
    // Tek ekran iki rota taşır: liste Gastro liste-v2 (banner + alt menü), yazı püf detayı. Değer o an açık adresten okunur (hesaplayicilar.js kalıbı).
    bos: {ikon: 'kalori', baslik: 'Yazı bulunamadı', metin: 'Bu konuda henüz kalori yazısı yok. **Diğer kategorilere** göz at.', eylem: {metin: 'Tüm yazılar', ikon: 'tumu', yerine: '#/kac-kalori?temiz=1'}},   // ?hal=bos (ortak DD.bos)
    tur: 'banner',
    nav: 'denge',
    get dock() { return !detayMi(); },
    get ust() { return detayMi() ? '#/kac-kalori' : '#/bugun'; },
    get iskelet() { return detayMi() ? 'detay' : 'liste'; },
    baslik: ctx => (ctx.param?.slug ? bul(ctx.param.slug)?.ad || 'Kaç Kalori?' : 'Kaç Kalori?'),
    yenile: true,
    yukle: () => new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast)),
    ustBar: ctx => {
      if (!ctx.param?.slug) return {};
      const y = bul(ctx.param.slug);
      return y ? {saydam: !!y.gorsel} : {};
    },
    ciz: ctx => (ctx.param?.slug ? detayCiz(ctx) : listeCiz(ctx)),
    altBar: ctx => {
      const y = ctx.param?.slug && bul(ctx.param.slug);
      if (!y) return '';
      const paylas = {ikon: 'paylas', ad: 'Paylaş', sayi: 'Paylaş', veri: {eylem: 'kk-paylas'}};
      if (besinleri(y).length) return DD.altEylem({ikonlar: [paylas], dugmeler: [{metin: 'Öğüne ekle', ikon: 'ekle', veri: {eylem: 'kk-ekle'}}]});
      return DD.kayanBar({gorsel: y.gorsel, baslik: y.ad, eylemler: [{ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'kk-paylas'}}]});
    },
    sonra: (kok, ctx) => {
      if (!ctx.param?.slug) return ctx.liste ? listeBagla(kok, ctx.liste) : null;
      const y = bul(ctx.param.slug);
      if (!y) return undefined;
      const m = KK().metin?.[y.slug];
      const temizle = [
        DD.eylem(kok, 'kk-paylas', () => DD.paylas({baslik: y.ad, alt: y.ozet, url: webUrl(y)})),
        DD.eylem(kok, 'kk-ekle', () => ogunEkle(y)),
        DD.eylem(kok, 'kaynak', el => { const k = m?.kaynaklar?.[+el.dataset.id]; if (k?.url) window.open(k.url, '_blank', 'noopener'); })
      ];
      return () => temizle.forEach(f => f());
    }
  });
})();
