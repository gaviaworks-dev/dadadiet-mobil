/* Genel arama (#/ara). Gastro arama.html: son aramalar, popüler aramalar, sekmeli sonuç. Referans: tasks/referanslar.md Arama (Truecaller keşif, Nextdoor gruplu sonuç, stoic. boş sonuç).
 * Kapsam: besin, yemek, program, diyetisyen, araç, yazı, rehber (DDV.rehber: Beslenme ve Makro Rehberi; ipucu/püf/kaç kalori ailesinden hub kartları
 * Yazı ve kendi ekranlarında kaldığı için yalnız rehber ve makro ailesi, #/rehber/:slug). Besin ve yemek besin-ara porsiyon sheet'ine gider; kayıt Tabağım üzerindendir.
 * Sonuç yoksa Gastro arama.js kalıbı: "Şunu mu demek istedin?" (dizindeki ad, kelime ve popüler aramalardan en yakın tek terim; Türkçe katlama +
 * düzenleme mesafesi, eşik uzunluğun üçte biri) ve popüler aramalar.
 * Kalıcı: ara-son (metin listesi). #/ara?q=metin hazır arama, ?hal=hata bağlantı hatası.
 */
(() => {
  const {sayi} = DD;
  const SON_EN = 6, GRUP_EN = 3, LISTE_EN = 30;
  const SEKMELER = [['tumu', 'Tümü'], ['besin', 'Besin'], ['program', 'Program'], ['diyetisyen', 'Diyetisyen'], ['arac', 'Araç'], ['yazi', 'Yazı'], ['rehber', 'Rehber']];
  const POPULER = ['mercimek', 'yüksek protein', '16:8', 'kahvaltı', 'barkod', 'su'];
  const ARACLAR = [
    ['Tabak tara', 'Fotoğraftan kalori ve makro', 'kamera', '#/ai/kamera?mod=tabak', 'fotoğraf yemek'],
    ['Menü oku', 'Dışarıda ne yesem', 'menu', '#/ai/kamera?mod=menu', 'restoran lokanta'],
    ['Tahlil tara', 'Kan tahlilini anlaşılır oku', 'tahlil', '#/ai/kamera?mod=tahlil', 'kan sonuç'],
    ['Barkod tara', 'Ürün içeriği ve skoru', 'barkod', '#/ai/kamera?mod=barkod', 'ürün paket'],
    ['Etiket okuma', 'İçindekileri satır satır açıkla', 'tag', '#/etiket', 'katkı içerik'],
    ['Sesli giriş', 'Yediklerini söyle, listeye düşsün', 'mikrofon', '#/ai/ses', 'konuş mikrofon'],
    ['Oruç sayacı', 'Canlı sayaç ve protokol', 'oruc', '#/ritim', 'ritim pencere aralıklı 16:8 14:10 18:6'],
    ['Biyolojik fazlar', 'Oruç saatlerine göre tahmini fazlar', 'faz', '#/ritim/fazlar', 'ritim'],
    ['Denge Skoru', 'Haftalık akıllı tabak', 'denge', '#/denge', 'tabak puan'],
    ['Muadil bul', 'Daha hafif alternatifler', 'muadil', '#/denge/muadil', 'alternatif yerine'],
    ['Kaçamak kurtarma', 'Üç adımda dengeye dön', 'kacamak', '#/denge/kacamak', 'fazla yedim'],
    ['Besin kıyasla', 'İki besini yan yana gör', 'kiyas', '#/denge/kiyasla', 'karşılaştır'],
    ['Program Bul', 'Beş soruda sana uyan program', 'wand-magic-sparkles', '#/program-bul', 'öneri'],
    ['Diyetisyen bul', 'Üç soruyla eşleş', 'uzman', '#/uzman/bul', 'randevu uzman'],
    ['Sağlık dosyam', 'Kilo, ölçüm ve tahliller', 'tahlil', '#/saglik', 'grafik bel yağ']
  ].map(([baslik, alt, ikon, git, ek]) => ({baslik, alt, ikon, git, ek}));
  const KESIF = ['Tabak tara', 'Denge Skoru', 'Muadil bul', 'Oruç sayacı'].map(b => ARACLAR.find(a => a.baslik === b));

  const sonlar = () => DD.durum.oku('ara-son', ['mercimek çorbası', 'kilo verme', 'Nehir Tunalı']);
  const sonYaz = q => { if (q.length > 1) DD.durum.yaz('ara-son', [q, ...sonlar().filter(x => DD.katla(x) !== DD.katla(q))].slice(0, SON_EN)); };

  // ---------- Dizin: ilk aramada bir kez kurulur ----------
  let dizin = null;
  const kur = () => ({
    besin: [
      ...DDV.besinler.map(b => ({m: DD.katla(`${b.ad} ${b.kategori} ${b.etiketler.join(' ')}`), a: DD.katla(b.ad), baslik: b.ad, alt: `${b.kategori} · 100 g ${sayi(b.kcal)} kcal`, gorsel: b.gorsel, ton: DD.makroTon(b), git: `#/besin-ara?besin=${b.slug}`})),
      ...DDV.yemekler.map(y => ({m: DD.katla(`${y.ad} ${y.kategori} ${y.etiketler.join(' ')}`), a: DD.katla(y.ad), baslik: y.ad, alt: `${y.kategori} · 1 porsiyon ${sayi(y.porsiyonKcal)} kcal`, gorsel: y.gorsel, ton: DD.makroTon(y), git: `#/besin-ara?yemek=${y.slug}`}))
    ],
    program: DDV.programlar.map(p => ({m: DD.katla(`${p.ad} ${p.kategori} ${p.aciklama}`), a: DD.katla(p.ad), baslik: p.ad, alt: `${p.kategori} · ${sayi(p.sureGun)} gün`, gorsel: p.kapak, git: `#/program/${p.slug}`})),
    diyetisyen: DDV.diyetisyenler.map(d => ({m: DD.katla(`${d.ad} ${d.unvan} ${d.sehir} ${d.uzmanliklar.join(' ')}`), a: DD.katla(d.ad), baslik: d.ad, alt: `${d.uzmanliklar[0]} · ${d.sehir}`, avatar: {harf: d.harf, boyut: 40}, git: `#/uzman/profil/${d.slug}`})),
    arac: ARACLAR.map(x => ({...x, m: DD.katla(`${x.baslik} ${x.alt} ${x.ek}`), a: DD.katla(x.baslik)})),
    yazi: DDV.icerikler.map(x => ({m: DD.katla(`${x.baslik} ${x.ozet} ${x.kategori}`), a: DD.katla(x.baslik), baslik: x.baslik, alt: `${x.kategori} · ${x.okumaDk} dk okuma`, gorsel: x.gorsel, veri: {eylem: 'yazi', id: x.slug}})),
    rehber: rehberler().map(x => { const tur = DDV.rehber.turler.find(t => t.deger === x.tur)?.ad || ''; return {m: DD.katla([x.baslik, x.ozet, tur, ...(x.bolumler || [])].join(' ')), a: DD.katla(x.baslik), baslik: x.baslik, alt: [tur, x.okunma != null ? `${sayi(x.okunma)} okunma` : null].filter(Boolean).join(' · '), gorsel: x.gorsel, git: `#/rehber/${x.slug}`}; })
  });
  // Hub kartlarındaki ipucu, püf ve kaç kalori yazıları rehber sayılmaz (Yazı grubunda ya da kendi ekranlarında).
  const rehberler = () => (DDV.rehber?.liste || []).filter(x => x.aile === 'rehber' || x.aile === 'makro');
  const ara = q => {
    dizin ||= kur();
    const t = DD.katla(q).split(/\s+/).filter(Boolean), puan = x => (x.a.startsWith(t[0]) ? 3 : x.a.includes(` ${t[0]}`) ? 2 : x.a.includes(t[0]) ? 1 : 0);
    return Object.fromEntries(Object.entries(dizin).map(([tur, l]) => [tur, l.filter(x => t.every(p => x.m.includes(p))).sort((a, b) => puan(b) - puan(a))]));
  };

  // ---------- "Şunu mu demek istedin?" (Gastro arama.js oneri) ----------
  // Sözlük: dizindeki her başlığın tamamı ve 3+ harfli kelimeleri, popüler aramalar. Sorguya en yakın tek aday; uzaklık eşiği uzunluğun üçte biri.
  let sozluk = null;
  const sozlukKur = () => {
    dizin ||= kur();
    const l = new Map(), ekle = (k, goster) => { if (k.length >= 3 && !l.has(k)) l.set(k, goster); };
    [...POPULER, ...Object.values(dizin).flat().map(x => x.baslik)].forEach(b => {
      ekle(DD.katla(b), b);
      b.split(/[\s()·,.:;?!'"“”‘’/-]+/).forEach(w => ekle(DD.katla(w), w.toLocaleLowerCase('tr')));
    });
    return [...l];
  };
  const uzaklik = (a, b) => {
    const d = Array.from({length: b.length + 1}, (_, j) => j);
    for (let i = 1; i <= a.length; i++) { let onceki = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const g = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, onceki + (a[i - 1] === b[j - 1] ? 0 : 1)); onceki = g; } }
    return d[b.length];
  };
  const oneri = q => {
    const k = DD.katla(q).trim();
    if (k.length < 3) return '';
    sozluk ||= sozlukKur();
    let en = '', enD = Infinity;
    for (const [a, goster] of sozluk) { if (Math.abs(a.length - k.length) >= enD) continue; const d = uzaklik(k, a); if (d < enD) { enD = d; en = goster; } }
    return enD > 0 && enD <= Math.max(1, Math.floor(k.length / 3)) ? en : '';
  };

  // ---------- Parçalar ----------
  const satir = (x, q) => DD.satir({...(x.gorsel !== undefined ? {sol: DD.gorsel({src: x.gorsel, ad: x.baslik, ton: x.ton})} : {}), ikon: x.ikon, avatar: x.avatar, baslik: x.baslik, baslikHtml: DD.vurguluEsles(x.baslik, q), alt: x.alt, git: x.git, veri: x.veri, attrs: 'data-sonuc', ok: false});
  const liste = (l, q) => DD.satirlar(l.map(x => satir(x, q)));
  const sekmeBar = (s, r) => DD.segment({ad: 'sekme', kaydir: true, etiket: 'Sonuç türü', secili: s.sekme, ogeler: SEKMELER.map(([deger, ad]) => ({ad, deger, sayi: deger === 'tumu' ? undefined : r[deger].length}))});
  const populer = () => DD.bolum({ic: false, baslik: 'Popüler aramalar', html: `<div class="dd-sira">${POPULER.map(x => DD.cip({metin: x, veri: {eylem: 'terim', id: x}})).join('')}</div>`});
  const oneriBolum = s => { const o = oneri(s.q); return o ? DD.bolum({ic: false, baslik: 'Şunu mu demek istedin?', html: `<div class="dd-sira">${DD.cip({metin: o, ikon: 'ara_', veri: {eylem: 'terim', id: o}})}</div>`}) : ''; };
  const bosSonuc = (s, ad) => DD.listeBos({baslik: 'Sonuç yok', metin: ad ? `“**${s.q}**” için ${ad} bulamadık. Tümü sekmesine ya da **başka bir aramaya** bakabilirsin.` : `“**${s.q}**” için bir şey bulamadık. Daha kısa yazmayı ya da **başka bir sözcüğü** dene.`, eylem: {metin: 'Başka bir arama dene', tur: 'secondary', veri: {eylem: 'yeni-arama'}}});
  const sonuclar = s => {
    const r = ara(s.q), n = Object.values(r).reduce((t, l) => t + l.length, 0), bar = sekmeBar(s, r);
    const ad = SEKMELER.find(([d]) => d === s.sekme)[1];
    const say = m => `<span class="dd-t-meta dd-ton-ikincil" role="status">${m}</span>`;
    if (!n) return `<div class="dd-yigin">${bar}${bosSonuc(s)}<div class="dd-yigin-24">${oneriBolum(s)}${populer()}</div></div>`;
    if (s.sekme === 'tumu') {
      const gruplar = SEKMELER.slice(1).filter(([d]) => r[d].length).map(([d, g]) => DD.bolum({ic: false, baslik: g, eylem: r[d].length > GRUP_EN ? {html: DD.btn({metin: `Tümü (${sayi(r[d].length)})`, tur: 'text', boyut: 'sm', veri: {eylem: 'sekme-ac', id: d}})} : null, html: liste(r[d].slice(0, GRUP_EN), s.q)}));
      return `<div class="dd-yigin">${bar}${say(`${sayi(n)} sonuç`)}<div class="dd-yigin-24 dd-arama-sonuc">${gruplar.join('')}</div></div>`;
    }
    const l = r[s.sekme];
    if (!l.length) return `<div class="dd-yigin">${bar}${bosSonuc(s, ad.toLocaleLowerCase('tr'))}</div>`;
    return `<div class="dd-yigin">${bar}${say(`${sayi(l.length)} sonuç`)}<div class="dd-arama-sonuc">${liste(l.slice(0, LISTE_EN), s.q)}</div></div>`;
  };
  const sonBolum = () => {
    const l = sonlar();
    if (!l.length) return '';
    return DD.bolum({ic: false, baslik: 'Son aramalar', eylem: {html: DD.btn({metin: 'Temizle', tur: 'text', boyut: 'sm', veri: {eylem: 'son-temizle'}})}, html: DD.satirlar(l.map((x, i) => DD.satirKap({ikon: 'gecmis', baslik: x, veri: {eylem: 'terim', id: x}, ok: false}, DD.ikonBtn({ikon: 'kapat', etiket: `${x} aramasını sil`, veri: {eylem: 'son-sil', id: i}}))))});
  };
  const acilis = () => `<div class="dd-yigin-24">${sonBolum()}${populer()}${DD.bolum({ic: false, baslik: 'Keşfet', html: DD.parcali(KESIF.map(x => ({ikon: x.ikon, baslik: x.baslik, git: x.git})), {aria: 'Araçlar', kutu: 'izgara'})})}${DD.bolum({ic: false, baslik: 'Programlar', eylem: 'Tümü', git: '#/programlar', html: DD.ikiliSerit(DDV.programlar.slice(0, 2).map(p => DD.programKart(p, {tur: 'tile'})), 'Programlar')})}</div>`;
  const govde = s => (s.q ? sonuclar(s) : acilis());

  const yaziSheet = slug => {
    const x = DDV.icerikler.find(i => i.slug === slug);
    DD.sheet({
      baslik: x.baslik,
      html: `<div class="dd-yigin"><div class="dd-sira">${DD.rozet({metin: x.kategori, ikon: x.ikon})}</div>${DD.p(x.ozet.replace(/^([^.]+\.)/, '**$1**'))}${DD.bant({metin: 'Bu içerik **genel bilgi** içindir; sana özel kararlar için diyetisyeninle konuş.'})}</div>`,
      altBar: DD.btn({metin: 'Diyetisyenime sor', ikon: 'sohbet', tam: true, git: '#/uzman/sohbet', attrs: 'data-sheet-kapat'})
    });
  };

  let hataGosterildi = false;
  DD.ekran('ara', {
    bos: {ikon: 'ara_', baslik: 'Sonuç yok', metin: 'Aradığını bulamadık. **Farklı bir sözcük** dene.', eylem: {metin: 'Yeni arama', ikon: 'ara_', yerine: '#/ara'}},   // ?hal=bos (ortak DD.bos)
    tur: 'alt',
    baslik: 'Ara',
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ciz: ctx => {
      const s = ctx.s ||= {q: ctx.sorgu.q || '', sekme: 'tumu'};
      return `<div class="dd-ic dd-yigin">${DD.arama({ad: 'genel', yer: 'Besin, rehber, program, diyetisyen ara', deger: s.q, mikrofon: true, sonuc: false})}<div data-yuva="govde">${govde(s)}</div></div>`;
    },
    sonra: (kok, ctx) => {
      const s = ctx.s, yer = kok.querySelector('[data-yuva="govde"]'), girdi = kok.querySelector('.dd-arama input');
      if (!yer) return null;
      // Sekme şeridi yeniden çizilince kaydırması korunur; seçili sekme görünmüyorsa yalnız şerit kaydırılır (sayfa kaymaz).
      const sekmeGoster = x => {
        const sg = yer.querySelector('.dd-seg'); if (!sg) return;
        sg.scrollLeft = x;
        const c = sg.querySelector('[aria-selected=true]'); if (!c) return;
        const r = sg.getBoundingClientRect(), b = c.getBoundingClientRect();
        if (b.left < r.left || b.right > r.right) sg.scrollLeft += b.left - r.left - (sg.clientWidth - c.offsetWidth) / 2;
      };
      const ciz = () => { const x = yer.querySelector('.dd-seg')?.scrollLeft || 0; yer.innerHTML = govde(s); sekmeGoster(x); };
      const sorgula = q => { s.q = q; s.sekme = 'tumu'; girdi.value = q; girdi.closest('.dd-girdi').classList.toggle('has-text', !!q); ciz(); };
      let zaman = 0;
      const yazildi = () => { clearTimeout(zaman); zaman = setTimeout(() => { s.q = girdi.value.trim(); if (!s.q) s.sekme = 'tumu'; ciz(); }, DD.TK.motion.oneri.inputDebounce); };
      const tus = ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); clearTimeout(zaman); s.q = girdi.value.trim(); sonYaz(s.q); ciz(); girdi.blur(); };
      // Sonuç seçilince arama geçmişe yazılır; yönlendirmeyi satırın kendi data-git'i yapar.
      const secildi = ev => { if (s.q && ev.target.closest('[data-sonuc]')) sonYaz(s.q); };
      girdi.addEventListener('input', yazildi);
      girdi.addEventListener('keydown', tus);
      yer.addEventListener('click', secildi, true);
      const odak = setTimeout(() => { if (!s.q) girdi.focus({preventScroll: true}); }, DD.azHareket() ? 0 : DD.TK.motion.page);
      const baglar = [
        DD.on(kok, 'sekme', v => { s.sekme = v; ciz(); }),
        DD.eylem(kok, 'sekme-ac', el => { s.sekme = el.dataset.id; ciz(); kok.querySelector('.dd-kaydir').scrollTop = 0; }),
        DD.eylem(kok, 'terim', el => sorgula(el.dataset.id)),
        DD.eylem(kok, 'yazi', el => yaziSheet(el.dataset.id)),
        DD.eylem(kok, 'yeni-arama', () => { sorgula(''); girdi.focus(); }),
        DD.eylem(kok, 'son-sil', el => { DD.durum.yaz('ara-son', sonlar().filter((_, i) => i !== +el.dataset.id)); ciz(); }),
        DD.eylem(kok, 'son-temizle', () => { DD.durum.yaz('ara-son', []); ciz(); })
      ];
      return () => {
        clearTimeout(zaman); clearTimeout(odak);
        girdi.removeEventListener('input', yazildi); girdi.removeEventListener('keydown', tus); yer.removeEventListener('click', secildi, true);
        baglar.forEach(c => c());
      };
    }
  });
})();
