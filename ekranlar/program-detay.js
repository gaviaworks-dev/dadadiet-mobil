/* Program detay: Gastro detay-v2 kalıbı (kanon README §3). Rota #/program/:slug.
 * Durum: DD.durum 'aktifProgram' {slug, ad, gun, toplamGun, baslangic} ya da null; 'kayitliProgramlar' slug dizisi.
 * Gün gün döküm 1 MB olduğu için kapak ve özet hemen çizilir, öğün panelleri veri gelene kadar iskelet kalır. */
(() => {
  const bul = slug => DDV.programlar.find(p => p.slug === slug);
  const aktifOku = () => DD.durum.oku('aktifProgram', DDV.kullanici.aktifProgram);
  const kayitlar = () => DD.durum.oku('kayitliProgramlar', []);

  // ---------- Tarih ----------
  const isoMs = s => { const [y, a, g] = s.split('-').map(Number); return Date.UTC(y, a - 1, g); };
  const gunFark = (a, b) => Math.round((isoMs(b) - isoMs(a)) / 864e5);
  const gunEkle = (s, n) => new Date(isoMs(s) + n * 864e5).toISOString().slice(0, 10);
  const programdaMi = p => { const a = aktifOku(); return a?.slug === p.slug ? a : null; };
  const kacinciGun = a => gunFark(a.baslangic, DD.bugunIso()) + 1;
  const acikGun = p => { const a = programdaMi(p); return a ? DD.kisit(kacinciGun(a), 1, p.sureGun) : 1; };

  // ---------- Metin ----------
  const buyukBas = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const ilkKelimeler = (s, n = 2) => { const l = s.split(' '); return `**${l.slice(0, n).join(' ')}** ${l.slice(n).join(' ')}`.trim(); };
  const maddeVurgu = s => { const [bas, ...kalan] = s.split(' — '); return kalan.length ? `**${bas}:** ${kalan.join(' — ')}` : ilkKelimeler(s); };
  const notVurgu = s => { const i = s.search(/[;.]/); return i > 0 ? `**${s.slice(0, i)}**${s.slice(i)}` : ilkKelimeler(s); };
  const kcalAralik = p => `${DD.sayi(p.kcalMin)}-${DD.sayi(p.kcalMax)}`;
  const kcalOrta = p => Math.round((p.kcalMin + p.kcalMax) / 20) * 10;
  const hedefAraliktaMi = p => { const h = DDV.kullanici.hedefKcal; return h >= p.kcalMin && h <= p.kcalMax; };

  // ---------- Filtre etiketleri ----------
  const filtre = (grup, deger) => DDV.programFiltreleri[grup]?.secenekler.find(x => x.deger === deger);
  const etiketler = (grup, l) => l.map(d => filtre(grup, d)).filter(Boolean);
  const adlar = l => l.map(x => x.ad).join(', ');

  // ---------- Kalem çözümü: menü satırı → besin ya da yemek kaydı ----------
  let dizin = null;
  const onbellek = new Map();
  const dizinKur = () => {
    const tam = [...DDV.yemekler.map(o => ({n: DD.katla(o.ad), o, yemek: true})), ...DDV.besinler.map(o => ({n: DD.katla(o.ad), o}))].sort((a, b) => b.n.length - a.n.length);
    const kok = new Map();
    DDV.besinler.forEach(o => { const k = DD.katla(o.ad.split(' (')[0]), v = kok.get(k); if (!v || (!v.gorsel && o.gorsel)) kok.set(k, o); });
    dizin = {tam, kok};
  };
  const MIKTAR = /^(.*?)\s+((?:\d|[½¼¾⅓⅔]|yarım\s|çeyrek\s).*)$/i;
  const coz = metin => {
    if (onbellek.has(metin)) return onbellek.get(metin);
    if (!dizin) dizinKur();
    const n = DD.katla(metin), hit = dizin.tam.find(a => n === a.n || n.startsWith(`${a.n} `));
    const parca = hit ? [hit.o.ad, metin.slice(hit.o.ad.length).trim()] : (metin.match(MIKTAR) || [null, metin, '']).slice(1);
    const [ad, miktar] = parca, kaynak = hit?.o || dizin.kok.get(DD.katla(ad)) || null, yemek = !!hit?.yemek;
    const g = miktar.match(/([\d.,]+)\s*g\)?$/), gram = g ? parseFloat(g[1].replace(',', '.')) : null;
    const deger = kaynak && !yemek && gram ? {kcal: Math.round(kaynak.kcal * gram / 100), ...Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, (kaynak[m] || 0) * gram / 100]))} : null;
    const k = {ad, miktar: miktar.replace(/\s*\(([\d.,]+\s*g)\)$/, ' · $1'), gram, kaynak, yemek, gorsel: kaynak?.gorsel || null, deger};
    onbellek.set(metin, k);
    return k;
  };
  // Günün makro toplamı: bütün kalemlerin gramı biliniyorsa hesaplanır; eski menülerde gösterilmez.
  const gunMakro = g => {
    const l = g.ogunler.flatMap(o => o.kalemler.map(coz));
    if (!l.length || l.some(k => !k.deger)) return null;
    const hedef = DDV.kullanici.makroHedef;
    return Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, {alinan: l.reduce((t, k) => t + k.deger[m], 0), hedef: hedef[m]}]));
  };

  // ---------- Gün paneli ----------
  const ogunHtml = (o, gun, oi) => {
    const sag = [o.saat, o.kcal != null ? `${DD.sayi(o.kcal)} kcal` : ''].filter(Boolean).join(' · ');
    const satirlar = o.kalemler.map((m, ki) => {
      const k = coz(m);
      return DD.besinSatir({ad: k.ad, gorsel: k.gorsel, kcal: k.deger?.kcal ?? null, ...(k.kaynak ? {P: k.kaynak.P, K: k.kaynak.K, Y: k.kaynak.Y} : {})}, {alt: k.miktar, veri: {eylem: 'kalem', id: `${gun}.${oi}.${ki}`}});
    });
    return `<section class="dd-yigin-8">${DD.bas(o.ad, sag ? {html: `<span class="dd-t-meta dd-ton-ikincil">${DD.esc(sag)}</span>`} : null)}${DD.satirlar(satirlar)}</section>`;
  };
  const gunHtml = (g, p) => {
    if (!g?.ogunler.length) return DD.bos({ikon: 'ogun', baslik: 'Bu gün boş', metin: 'Bu gün için **öğün eklenmemiş**. Diğer günlere bakabilirsin.'});
    const a = programdaMi(p), tarih = a ? gunEkle(a.baslangic, g.gun - 1) : null, makro = gunMakro(g);
    const meta = [tarih && DD.tarihKisa(tarih), `${g.ogunler.length} öğün`, g.kcal != null && `${DD.sayi(g.kcal)} kcal`].filter(Boolean).join(' · ');
    const bas = `<div class="dd-yigin-12"><div class="dd-yigin-4"><div class="dd-ara"><h3 class="dd-t-sub">${DD.esc(g.baslik ? buyukBas(g.baslik) : `${g.gun}. gün menüsü`)}</h3>${tarih === DD.bugunIso() ? DD.rozet({metin: 'Bugün'}) : ''}</div><span class="dd-t-meta dd-ton-ikincil">${DD.esc(meta)}</span></div>${makro ? DD.makroCubuk(makro) : ''}</div>`;
    return bas + g.ogunler.map((o, i) => ogunHtml(o, g.gun, i)).join('');
  };
  const paneIskelet = () => DD.iskelet('satir', 6);
  const paneHata = () => DD.bos({ikon: 'wifi', baslik: 'Öğünler yüklenemedi', metin: 'Bağlantını kontrol edip **yeniden dene**.', eylem: {metin: 'Tekrar dene', ikon: 'yenile', tur: 'secondary', veri: {eylem: 'gunler-tekrar'}}});
  const paneBos = () => DD.bos({ikon: 'ogun', baslik: 'Menü hazırlanıyor', metin: 'Bu programın **gün gün menüsü** henüz eklenmedi.'});

  // ---------- Kalem sheet'i ----------
  const degerler = k => {
    if (k.deger) return {temel: `${DD.sayi(k.gram)} g`, ...k.deger};
    if (k.yemek) return {temel: '1 porsiyon', kcal: k.kaynak.porsiyonKcal, P: k.kaynak.P, K: k.kaynak.K, Y: k.kaynak.Y, Lif: k.kaynak.Lif};
    return {temel: '100 g', kcal: k.kaynak.kcal, P: k.kaynak.P, K: k.kaynak.K, Y: k.kaynak.Y, Lif: k.kaynak.Lif};
  };
  const kalemSheet = (k, baglam) => {
    // Sheet başlığı tek satır kalsın diye parantez içi satıra iner.
    const baslik = k.ad.split(' (')[0];
    const ust = (alt, v) => DD.satir({sol: DD.gorsel({src: k.gorsel, ad: k.ad, ton: k.kaynak ? DD.makroTon(k.kaynak) : 'primary'}), baslik: k.ad, alt: alt || null, deger: v});
    if (!k.kaynak) return DD.sheet({baslik, html: `<div class="dd-yigin">${ust([baglam, k.miktar].filter(Boolean).join(' · '), null)}${DD.bant({ton: 'bilgi', metin: 'Bu kalemin **besin değeri** menüde yer almıyor. Besin aramasından benzerine bakabilirsin.'})}</div>`, altBar: DD.btn({metin: 'Besin ara', ikon: 'ara_', tur: 'secondary', tam: true, git: '#/besin-ara'})});
    const d = degerler(k), b = k.kaynak;
    const makro = [['Protein', d.P], ['Karb.', d.K], ['Yağ', d.Y], ['Lif', d.Lif]].filter(x => x[1] != null).map(([etiket, v]) => ({etiket, deger: DD.ondalik(v, 1), birim: 'g'}));
    const kunye = [{ikon: 'ogun', etiket: 'Öğün', deger: baglam}, {ikon: 'tag', etiket: 'Kategori', deger: b.kategori}, b.sureDk && {ikon: 'clock', etiket: 'Hazırlık', deger: `${b.sureDk} dk`}, b.kaynak && {ikon: 'book-open', etiket: 'Kaynak', deger: b.kaynak}].filter(x => x && x.deger);
    const eklenir = k.deger || k.yemek;
    return DD.sheet({
      baslik,
      html: `<div class="dd-yigin">${ust(k.miktar, `${DD.sayi(d.kcal)} kcal`)}<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">${DD.esc(d.temel)} için</span>${DD.ozetSerit(makro)}</div>${b.aciklama ? DD.p(ilkKelimeler(b.aciklama)) : ''}${DD.kunye(kunye)}</div>`,
      altBar: eklenir ? DD.btn({metin: 'Tabağıma ekle', ikon: 'ekle', tam: true, veri: {'kalem-ekle': 1}}) : '',
      sonra: h => {
        h.addEventListener('click', ev => {
          if (!ev.target.closest('[data-kalem-ekle]')) return;
          DD.tabagim.ekle({ad: k.ad, gorsel: k.gorsel, kcal: d.kcal, P: d.P, K: d.K, Y: d.Y, Lif: d.Lif || 0, ...(k.gram ? {gram: k.gram} : {miktar: 1, birim: 'porsiyon'})});
          h.kapat();
          DD.toast(`Tabağına eklendi: **${DD.sayi(d.kcal)} kcal**`, {tur: 'basari'});
        });
      }
    });
  };

  // ---------- Bilgi sheet'leri ----------
  const maddeler = (l, tur) => `<div class="dd-yigin-12">${l.map(m => DD.madde({metin: maddeVurgu(m), tur})).join('')}</div>`;
  const enerjiSheet = p => {
    const h = DDV.kullanici.hedefKcal;
    const yorum = hedefAraliktaMi(p) ? 'Günlük hedefin **bu aralığın içinde**.' : h < p.kcalMin ? 'Program günleri **hedefinin üstünde** kalıyor.' : 'Program günleri **hedefinin altında** kalıyor.';
    DD.sheet({baslik: 'Enerji', html: `<div class="dd-yigin">${DD.ozetSerit([{ikon: 'ogun', etiket: 'Program', deger: kcalAralik(p), birim: 'kcal'}, {ikon: 'hedef', etiket: 'Hedefin', deger: DD.sayi(h), birim: 'kcal'}])}${DD.p(`Bu menünün en düşük ve en yüksek günü **${kcalAralik(p)} kcal**. ${yorum}`)}</div>`});
  };
  const duzenSheet = g => {
    const satirlar = g.ogunler.map(o => DD.satir({ikon: 'ogun', baslik: o.ad, alt: o.saat, deger: o.kcal != null ? `${DD.sayi(o.kcal)} kcal` : null}));
    DD.sheet({baslik: 'Öğün düzeni', html: `<div class="dd-yigin">${DD.p(`Program **günde ${g.ogunler.length} öğün** üzerine kurulu. Aşağıdaki düzen **${g.gun}. güne** aittir.`)}${DD.satirlar(satirlar)}</div>`});
  };

  // ---------- Benzerler ----------
  const ortak = (a, b) => a.filter(x => b.includes(x)).length;
  const benzerler = p => DDV.programlar.filter(x => x.slug !== p.slug)
    .map(x => [x, (x.hedef === p.hedef ? 3 : 0) + ortak(x.tercih, p.tercih) + ortak(x.yasam, p.yasam) + ortak(x.ihtiyac, p.ihtiyac) + (x.sureGun === p.sureGun ? 1 : 0) - Math.abs(kcalOrta(x) - kcalOrta(p)) / 1000])
    .sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);

  // ---------- Ekran parçaları ----------
  const ilerlemeHtml = p => {
    const a = programdaMi(p);
    if (!a) return '';
    const gun = kacinciGun(a);
    return gun < 1
      ? DD.bant({ton: 'bilgi', ikon: 'takvim', metin: `Bu program **${DD.tarihUzun(a.baslangic)}** tarihinde başlıyor.`})
      : DD.kart({html: DD.ilerleme({n: Math.min(gun, p.sureGun), hedef: p.sureGun, etiket: `${Math.min(gun, p.sureGun)}. gün`, deger: gun < p.sureGun ? `${p.sureGun - gun} gün kaldı` : 'Son gün'})});
  };
  // Kapak alt satırı tek satıra kırpılır; uzun açıklama yerine kısa künye yazılır, açıklamanın tamamı panelde durur.
  const kapakAlt = p => {
    const yasam = etiketler('yasam', p.yasam).find(x => x.deger !== 'genel'), tercih = etiketler('tercih', p.tercih)[0];
    const ad = (yasam || tercih)?.ad;
    return [ad && !p.ad.includes(ad) ? ad : '', `${p.sureGun} günlük menü`].filter(Boolean).join(' · ');
  };
  const ozetMetin = p => [`**${p.sureGun} günlük** bu menü günde **${p.gunlukOgun} öğün** ve **${kcalAralik(p)} kcal** aralığında kuruldu.`, p.aciklama, p.neSunar[0]].filter(Boolean).join(' ');
  const bilgiKartlar = p => [
    p.neSunar.length > 1 && {ikon: 'book-open', baslik: 'Menü nasıl kuruldu', metin: ilkKelimeler(p.neSunar[1]), veri: {eylem: 'bilgi', id: 'kurulum'}},
    p.kimlerIcin.length && {ikon: 'user-check', baslik: 'Kimler için', metin: ilkKelimeler(p.kimlerIcin[0]), veri: {eylem: 'bilgi', id: 'kimler'}},
    p.uygunDegil.length && {ikon: 'bilgi', baslik: 'Uygun olmayabilir', metin: maddeVurgu(p.uygunDegil[0]), veri: {eylem: 'bilgi', id: 'uygun'}},
    {ikon: 'ogun', baslik: 'Öğün düzeni', metin: `Günde **${p.gunlukOgun} öğün**, program boyunca toplam **${DD.sayi(p.ogunToplam)} öğün**.`, veri: {eylem: 'bilgi', id: 'duzen'}},
    {ikon: 'hedef', baslik: 'Enerji', metin: `Günlük **${kcalAralik(p)} kcal**. Hedefin **${DD.sayi(DDV.kullanici.hedefKcal)} kcal**.`, veri: {eylem: 'bilgi', id: 'enerji'}},
    {ikon: 'comments', baslik: 'Diyetisyenine sor', metin: 'Programı başlamadan önce **diyetisyeninle** konuşabilirsin.', git: DDV.kullanici.diyetisyen ? '#/uzman/sohbet' : '#/uzman/bul'}
  ].filter(Boolean);
  const kunyeSatirlar = p => {
    const a = programdaMi(p), yasam = etiketler('yasam', p.yasam), tercih = etiketler('tercih', p.tercih);
    return [
      {ikon: 'bullseye', etiket: 'Hedef', deger: p.kategori},
      yasam.length && {ikon: 'user', etiket: 'Yaşam biçimi', deger: adlar(yasam)},
      tercih.length && {ikon: 'seedling', etiket: 'Beslenme tarzı', deger: adlar(tercih)},
      {ikon: 'ogun', etiket: 'Toplam öğün', deger: DD.sayi(p.ogunToplam)},
      {ikon: 'fire', etiket: 'Günlük enerji', deger: `${kcalAralik(p)} kcal`},
      a && {ikon: 'takvim', etiket: 'Başlangıç', deger: DD.tarihUzun(a.baslangic)},
      a && {ikon: 'flag-checkered', etiket: 'Bitiş', deger: DD.tarihUzun(gunEkle(a.baslangic, p.sureGun - 1))}
    ].filter(Boolean);
  };

  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu program burada değil', metin: 'Bağlantı eskimiş olabilir. **Programlara dönüp** sana uygun olanı seçebilirsin.', eylem: {metin: 'Programlara dön', yerine: '#/programlar'}});

  // Kaydet düğmeleri: üst bar ve alt çubuk aynı durumu gösterir; boşta çerçeve, kayıtlıda dolu ikon.
  const kayitBoya = (kok, slug) => {
    const on = kayitlar().includes(slug);
    kok.querySelectorAll('[data-eylem="program-kaydet"]').forEach(b => {
      b.setAttribute('aria-pressed', on);
      b.querySelector('.icon')?.classList.replace(on ? 'fa-regular' : 'fa-solid', on ? 'fa-solid' : 'fa-regular');
    });
  };

  DD.ekran('program-detay', {
    tur: 'banner',
    nav: 'bugun',
    ust: '#/programlar',
    baslik: ctx => bul(ctx.param.slug)?.ad || 'Program',
    ustBar: ctx => (bul(ctx.param.slug) ? {sag: [{ikon: 'kaydet', etiket: 'Kaydet', veri: {eylem: 'program-kaydet'}}]} : {}),
    ciz: ctx => {
      const p = bul(ctx.param.slug);
      if (!p) return yokEkrani();
      const secili = ctx.gunSecili || acikGun(p), a = programdaMi(p), gunler = DDV.programGunleri?.[p.slug];
      const kayit = kayitlar(), hedef = filtre('hedef', p.hedef);
      const ozellik = [...etiketler('tercih', p.tercih), ...etiketler('ihtiyac', p.ihtiyac), ...etiketler('yasam', p.yasam)];
      const panel = n => (n !== secili ? '' : gunler?.length ? gunHtml(gunler[n - 1], p) : gunler ? paneBos() : paneIskelet());
      return DD.detay({
        gorsel: p.kapak,
        etiket: p.kategori,
        baslik: p.ad,
        alt: kapakAlt(p),
        caps: [
          {ikon: 'ogun', metin: `${DD.sayi(p.ogunToplam)} öğün`},
          a ? {ikon: 'program', metin: 'Programdasın'} : hedefAraliktaMi(p) ? {ikon: 'hedef', metin: 'Hedefine uygun'} : null
        ].filter(Boolean),
        bas: `<div class="dd-yigin">${DD.ozetSerit([
          {ikon: 'takvim', etiket: 'Süre', deger: p.sureGun, birim: 'gün'},
          {ikon: 'fire', etiket: 'Kalori', deger: DD.sayi(kcalOrta(p)), birim: 'kcal'},
          {ikon: 'yildiz', etiket: 'Zorluk', deger: p.zorluk},
          {ikon: 'ogun', etiket: 'Öğün', deger: p.gunlukOgun, birim: '/gün'}
        ])}${ilerlemeHtml(p)}</div>${DD.ozellikSerit({on: [{ikon: hedef?.ikon || p.ikon, metin: p.kategori}], ogeler: ozellik.map(x => ({ikon: x.ikon, metin: x.ad}))})}${DD.aciklama({metin: ozetMetin(p)})}`,
        sekmeler: DD.detaySekmeler({
          ad: 'gun', kaydir: true, etiket: 'Günler', secili: String(secili),
          ogeler: Array.from({length: p.sureGun}, (_, i) => ({ad: `${i + 1}. gün`, deger: String(i + 1), html: panel(i + 1)}))
        }),
        kuyruk: DD.bilgiSerit(bilgiKartlar(p)) + DD.kunye(kunyeSatirlar(p)) + DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: notVurgu(p.bilgiNotu)}) +
          DD.bolum({ic: false, baslik: 'Benzer programlar', eylem: 'Tümü', git: `#/programlar?hedef=${p.hedef}`, html: DD.ikiliSerit(benzerler(p).map(x => DD.programKart(x, {tur: 'tile', kayitli: kayit.includes(x.slug)})), 'Benzer programlar')})
      });
    },
    altBar: ctx => {
      const p = bul(ctx.param.slug);
      if (!p) return '';
      return DD.altEylem({
        ikonlar: [{ikon: 'kaydet', ad: 'Kaydet', sayi: 'Kaydet', basili: kayitlar().includes(p.slug), veri: {eylem: 'program-kaydet'}}, {ikon: 'paylas', ad: 'Paylaş', sayi: 'Paylaş', veri: {eylem: 'program-paylas'}}],
        dugmeler: [programdaMi(p) ? {metin: 'Programdasın', ikon: 'onay', tur: 'tonal', veri: {eylem: 'program-birak'}} : {metin: 'Programa başla', ikon: 'program', veri: {eylem: 'program-basla'}}]
      });
    },
    donus: (kok, ctx) => {
      const p = bul(ctx.param.slug);
      if (!p) return;
      kayitBoya(kok, p.slug);
      const l = kayitlar();
      kok.querySelectorAll('.dd-save').forEach(b => b.setAttribute('aria-pressed', l.includes(b.dataset.id)));
    },
    sonra: (kok, ctx) => {
      const p = bul(ctx.param.slug);
      if (!p) return undefined;
      const pane = n => kok.querySelector(`.dd-pane[data-pane="${n}"]`);
      const secili = () => ctx.gunSecili || acikGun(p);
      const gunler = () => DDV.programGunleri?.[p.slug] || null;
      kayitBoya(kok, p.slug);

      // Seçili gün sekmesini şeridin ortasına getirir.
      const seg = kok.querySelector('.dd-sekme-bar .dd-seg'), secBtn = seg?.querySelector('[aria-selected="true"]');
      if (secBtn) seg.scrollLeft += secBtn.getBoundingClientRect().left - seg.getBoundingClientRect().left - (seg.clientWidth - secBtn.offsetWidth) / 2;

      const doldur = n => {
        const e = pane(n);
        if (!e || (e.childElementCount && !e.querySelector('[aria-busy]') && !e.querySelector('[data-eylem="gunler-tekrar"]'))) return;
        const G = gunler();
        e.innerHTML = G?.length ? gunHtml(G[n - 1], p) : paneBos();
      };
      const yukle = () => {
        const e = pane(secili());
        if (gunler()) return;
        if (e) e.innerHTML = paneIskelet();
        DD.yukleVeri('program-gunleri').then(() => { if (kok.isConnected) doldur(secili()); }).catch(() => { const x = pane(secili()); if (x) x.innerHTML = paneHata(); });
      };
      yukle();

      const baslat = async () => {
        const bugun = DD.bugunIso(), pazartesi = ((8 - new Date(isoMs(bugun)).getUTCDay()) % 7) || 7;
        const tarih = await DD.takvimSheet({baslik: 'Başlangıç tarihi', secili: bugun, odak: bugun, min: bugun, max: gunEkle(bugun, 90), hizli: [['Bugün', 0], ['Yarın', 1], ['Pazartesi', pazartesi]]});
        if (!tarih) return;
        const onceki = aktifOku(), bitis = gunEkle(tarih, p.sureGun - 1), bugunMu = tarih === bugun;
        const baslangicMetin = bugunMu ? '**bugün** başlıyor' : `**${DD.tarihUzun(tarih)}** tarihinde başlıyor`;
        const degisim = onceki ? ` Şu anki programın **${onceki.ad}** burada sona erer.` : '';
        const evet = await DD.dialog({baslik: 'Programa başla', metin: `**${p.ad}** ${baslangicMetin} ve **${DD.tarihUzun(bitis)}** tarihinde bitiyor.${degisim}`, eylem: 'Başla', iptal: 'Vazgeç'});
        if (!evet) return;
        DD.durum.yaz('aktifProgram', {slug: p.slug, ad: p.ad, gun: bugunMu ? 1 : 0, toplamGun: p.sureGun, baslangic: tarih});
        DD.yerine('#/bugun');
        DD.toast(bugunMu ? `**${p.ad}** başladı` : `**${p.ad}** ${DD.tarihKisa(tarih)} tarihinde başlıyor`, {tur: 'basari', ikon: 'program'});
      };
      const birak = async () => {
        const a = programdaMi(p);
        if (!a) return;
        const gun = kacinciGun(a);
        const evet = await DD.dialog({baslik: 'Programı bırak', metin: `${gun >= 1 ? `**${p.ad}** programında **${Math.min(gun, p.sureGun)}. gündesin**.` : `**${p.ad}** henüz başlamadı.`} Bırakırsan öğünleri Bugün ekranından kalkar; **kayıtların silinmez**.`, eylem: 'Bırak', iptal: 'Devam et', yikici: true});
        if (!evet) return;
        DD.durum.yaz('aktifProgram', null);
        delete ctx.gunSecili;
        DD.tazele();
        DD.toast('Program bırakıldı', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('aktifProgram', a); if (kok.isConnected) DD.tazele(); }});
      };

      const temizle = [
        DD.on(kok, 'gun', deger => {
          const n = +deger;
          ctx.gunSecili = n;
          const e = pane(n);
          if (e && !e.childElementCount) e.innerHTML = paneIskelet();
          if (gunler()) doldur(n); else yukle();
          // Yapışık çubuktayken yeni günün başına dön; sekme yerinde kalır.
          requestAnimationFrame(() => {
            const k = kok.querySelector('.dd-kaydir'), bar = kok.querySelector('.dd-sekme-bar'), kap = kok.querySelector('.dd-sekme-kap'), ust = kok.querySelector('.dd-header');
            if (bar?.classList.contains('is-stuck')) k.scrollTop += kap.getBoundingClientRect().top - k.getBoundingClientRect().top - (ust?.offsetHeight || 0);
          });
        }),
        DD.eylem(kok, 'gunler-tekrar', yukle),
        DD.eylem(kok, 'kalem', el => {
          const [g, o, i] = el.dataset.id.split('.').map(Number), gun = gunler()[g - 1], ogun = gun.ogunler[o];
          kalemSheet(coz(ogun.kalemler[i]), `${g}. gün · ${ogun.ad}`);
        }),
        DD.eylem(kok, 'bilgi', el => {
          const id = el.dataset.id;
          if (id === 'kurulum') DD.sheet({baslik: 'Menü nasıl kuruldu', html: `<div class="dd-yigin">${p.neSunar.slice(1).map(m => DD.p(ilkKelimeler(m))).join('')}</div>`});
          else if (id === 'kimler') DD.sheet({baslik: 'Kimler için', html: maddeler(p.kimlerIcin, 'arti')});
          else if (id === 'uygun') DD.sheet({baslik: 'Uygun olmayabilir', html: maddeler(p.uygunDegil, 'eksi')});
          else if (id === 'enerji') enerjiSheet(p);
          else if (id === 'duzen') DD.yukleVeri('program-gunleri').then(() => { const G = gunler(); if (G?.length) duzenSheet(G[secili() - 1]); }).catch(() => DD.toast('Öğün düzeni yüklenemedi', {tur: 'hata'}));
        }),
        DD.eylem(kok, 'program-kaydet', () => {
          const l = kayitlar(), on = !l.includes(p.slug);
          DD.durum.yaz('kayitliProgramlar', on ? [...l, p.slug] : l.filter(x => x !== p.slug));
          kayitBoya(kok, p.slug);
          DD.titres(10);
          DD.toast(on ? 'Kaydedildi' : 'Kayıt kaldırıldı');
        }),
        // Benzer program kartı: görünümü kart çevirir, kalıcı kayıt burada yazılır.
        DD.eylem(kok, 'kaydet', el => {
          const l = kayitlar(), id = el.dataset.id;
          DD.durum.yaz('kayitliProgramlar', l.includes(id) ? l.filter(x => x !== id) : [...l, id]);
        }),
        DD.eylem(kok, 'program-paylas', () => DD.paylas({baslik: p.ad, alt: p.aciklama, url: `https://dadadiet.com/program/${p.slug}`})),
        DD.eylem(kok, 'program-basla', baslat),
        DD.eylem(kok, 'program-birak', birak)
      ];
      return () => temizle.forEach(f => f());
    }
  });
})();
