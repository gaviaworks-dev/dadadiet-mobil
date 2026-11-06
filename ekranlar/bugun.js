/* SCR-10 Günüm (#/bugun): Gastro ana-v3 kalıbı. Referans: tasks/referanslar.md Bugün, §2.1-2.3.
 * Günün kayıtları DD.durum'da: bugun-su {icilenMl, kayitlar}, bugun-duygu (id), bugun-ogun {ogunId:{durum, besinler?}}, bugun-ek {ogunId:[besin]}.
 * Aktif program DD.durum 'aktifProgram' {slug, ad, gun, toplamGun, baslangic} ya da null (program-detay yazar; gun:0 ileri tarihli başlangıç).
 * Görüşme slaytı DD.durum 'uzman-randevu' okur (uzman.js, uzman-profil.js yazar); null iptaldir, slayt çizilmez.
 * Fotoğraflı kayıtlar DDKayit'tan (ekranlar/kayit.js) okunur, dosya yoksa bu parçalar çizilmez. Yeni kipte hazır kayıtlar sayılmaz.
 * #/bugun?hal=bos hiç kaydı olmayan gün (aynı anahtarlar 'yeni-' önekiyle), #/bugun?hal=hata bağlantı hatası.
 */
(() => {
  const {sayi, ondalik} = DD;
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const MAKRO = ['P', 'K', 'Y', 'Lif'];
  const yendi = x => x.durum === 'dolu' || x.durum === 'degisti';
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  // Besin aramaya geçince hash değişir; kayıt yine aynı güne yazılsın diye kip Bugün rotasındayken okunur. 'bugun-kip' ogun.js'in anahtar önekidir.
  let yeniKip = DD.durum.oku('bugun-kip', 'bugun') === 'yeni';
  const yeniMi = () => {
    if (location.hash.startsWith('#/bugun')) {
      yeniKip = hal() === 'bos';
      const kip = yeniKip ? 'yeni' : 'bugun';
      if (DD.durum.oku('bugun-kip') !== kip) DD.durum.yaz('bugun-kip', kip);
    }
    return yeniKip;
  };
  const anahtar = ad => `${yeniMi() ? 'yeni' : 'bugun'}-${ad}`;

  let secili = DD.bugunIso(), hedefOgun = null, cizilen = '', hataGosterildi = false, hazir = false;

  // Hedefler: onboarding sonucu 'plan' anahtarındadır; yoksa DDV.
  const plan = () => DD.durum.oku('plan', null);
  const kcalHedef = () => plan()?.hedefKcal ?? DDV.bugun.hedefKcal;
  const makroHedef = m => plan()?.makro?.[m] ?? DDV.bugun.makro[m].hedef;
  const suHedef = () => plan()?.suMl ?? DDV.bugun.su.hedefMl;

  // ---------- Günün kaydı: DDV.bugun + kullanıcının yaptıkları ----------
  const besinli = (x, besinler, durum) => ({...x, durum, besinler, kcal: toplam(besinler, 'kcal'), ...Object.fromEntries(MAKRO.map(m => [m, toplam(besinler, m)]))});
  const ogunler = () => {
    const durumlar = DD.durum.oku(anahtar('ogun'), {}), ekler = DD.durum.oku(anahtar('ek'), {});
    return DDV.bugun.ogunler.map(o => {
      let x = yeniMi() ? besinli(o, [], 'bos') : o;
      const d = durumlar[o.id], ek = ekler[o.id] || [];
      if (d?.durum === 'atlandi') x = besinli(x, [], 'atlandi');
      else if (d?.durum === 'degisti') x = besinli(x, x.besinler.filter(b => d.besinler.includes(b.slug)), 'degisti');
      else if (d?.durum === 'dolu') x = {...x, durum: 'dolu'};
      if (!ek.length) return x;
      if (x.durum === 'planli') return besinli(x, ek, 'degisti');
      return besinli(x, [...x.besinler, ...ek], x.durum === 'degisti' ? 'degisti' : 'dolu');
    });
  };
  const gunOzet = () => {
    const l = ogunler(), yenen = l.filter(yendi);
    return {
      ogunler: l, yenen, hedef: kcalHedef(), alinan: toplam(yenen, 'kcal'),
      planli: toplam(l.filter(x => x.durum === 'planli'), 'kcal'),
      makro: Object.fromEntries(MAKRO.map(m => [m, {alinan: toplam(yenen, m), hedef: makroHedef(m)}])),
      kayitVar: l.some(x => x.durum !== 'bos')
    };
  };
  const suOku = () => DD.durum.oku(anahtar('su'), yeniMi() ? {icilenMl: 0, kayitlar: []} : {icilenMl: DDV.bugun.su.icilenMl, kayitlar: DDV.bugun.su.kayitlar});
  const suYaz = s => DD.durum.yaz(anahtar('su'), {...s, icilenMl: toplam(s.kayitlar, 'ml')});
  const duyguOku = () => DD.durum.oku(anahtar('duygu'), yeniMi() ? null : DDV.bugun.duygu.secili);
  const aktifProgram = () => DD.durum.oku('aktifProgram', DDV.kullanici.aktifProgram);
  const kayitDefteri = () => (typeof DDKayit === 'undefined' ? null : DDKayit);
  const bugunKayitlari = () => {
    const l = kayitDefteri()?.gunun(DD.bugunIso()) ?? [];
    if (!yeniMi()) return l;
    const hazirKayit = new Set((DDV.ogunKayitlari || []).map(k => k.id));
    return l.filter(k => !hazirKayit.has(k.id));
  };
  const imza = () => JSON.stringify([hal(), secili, aktifProgram(), plan(), bugunKayitlari().map(k => [k.id, k.ogun, k.ad, k.kcal, k.foto?.length]), DD.durum.oku('ritim-kayit', null), DD.durum.oku('ritim-durum', null), DD.durum.oku('uzman-randevu', 'kayit-yok'), ...['ogun', 'ek', 'su', 'duygu'].map(a => DD.durum.oku(anahtar(a), null))]);

  // ---------- Takvim ve program günü ----------
  const programGunu = iso => { const p = aktifProgram(); if (!p) return null; const n = Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${p.baslangic}T12:00:00`)) / 864e5) + 1; return n >= 1 && n <= p.toplamGun ? n : null; };
  // Haftalık menü diyetisyenin programına aittir; başka programa geçilince o programın menüsü sayılmaz.
  const gunMenu = n => { const h = DDV.benimDiyetisyenim.haftalikMenu; return h.program === aktifProgram()?.slug ? h.gunler.find(x => x.gun === n) : null; };
  const buyukHarf = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const tarihMetin = iso => { const d = new Date(`${iso}T12:00:00`); return `${d.toLocaleDateString('tr-TR', {weekday: 'long'})} ${d.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`; };
  const halkalar = z => ({...(yeniMi() ? {} : Object.fromEntries(DDV.gecmis.map(g => [g.tarih, Math.min(g.kcal / z.hedef, 1)]))), [DD.bugunIso()]: Math.min(z.alinan / z.hedef, 1)});
  const takvim = z => DD.takvim({ad: 'gun', gorunum: 'hafta', secili, odak: secili, halkalar: halkalar(z)});

  // ---------- Hero ----------
  const halka = z => (z.kayitVar
    ? DD.halka({foto: true, hedef: z.hedef, alinan: z.alinan, planli: z.planli, kesitler: z.yenen.map(x => x.kcal), yan: [{deger: sayi(z.alinan), etiket: 'Alınan'}, z.planli ? {deger: sayi(z.planli), etiket: 'Planlı'} : {deger: `${z.yenen.length}/${z.ogunler.length}`, etiket: 'Öğün'}]})
    : DD.halka({foto: true, hedef: z.hedef, etiket: 'Hedef', alt: 'kcal'}));
  const slaytlar = z => {
    const uzman = DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen), r = DD.durum.oku('uzman-randevu', DDV.benimDiyetisyenim.sonrakiRandevu), s = z.ogunler.find(x => x.durum === 'planli');
    const sofra = 'assets/gorsel/hero/karsilama-sofra.webp';
    const gorusme = r && {gorsel: 'assets/gorsel/hero/uzman-masa.webp', etiket: `Sonraki görüşme · ${r.tarihMetin} ${r.saat}`, baslik: r.baslik, alt: uzman.ad, avatar: uzman.harf, git: '#/uzman'};
    if (!z.kayitVar) return [{gorsel: sofra, etiket: 'Güne başla', baslik: 'İlk öğününü ekle', git: '#/besin-ara'}];
    if (s) return [{gorsel: sofra, etiket: `Sıradaki öğün · ${s.saat}`, baslik: s.besinler.slice(0, 2).map(b => b.ad.split(' (')[0]).join(' ve '), alt: `Planlı · ${sayi(s.kcal)} kcal`, git: `#/ogun/${s.id}`}, gorusme].filter(Boolean);
    const m = gunMenu(programGunu(DD.bugunIso()) + 1);
    const l = [gorusme, m && {gorsel: sofra, etiket: 'Yarının menüsü', baslik: buyukHarf(m.baslik), alt: `${m.ogunler.length} öğün · ${sayi(toplam(m.ogunler, 'kcal'))} kcal`, git: `#/program/${aktifProgram().slug}`}].filter(Boolean);
    return l.length ? l : [{gorsel: sofra}];
  };
  const heroBugun = z => {
    const n = programGunu(DD.bugunIso());
    return DD.heroAna({baslik: DDV.bugun.selam, altBaslik: `${DDV.bugun.tarihMetin}${n ? ` · Programın ${n}. günü` : ''}`, perde: 'tam', slaytlar: slaytlar(z), icerik: halka(z)});
  };

  // ---------- Bölümler ----------
  // Ritim hesabının aynısı (ekranlar/ritim.js): şimdi = sabit an + capa'dan beri geçen süre; bir günden eski ya da eski plana ait kayıt yok sayılır.
  const ORUC_ENGEL = ['gebelik', 'yeme-bozuklugu'];
  const planEvre = (x, ilkSaat) => {
    const su = DD.simdi().getTime(), ilk = new Date(su).setHours(0, 0, 0, 0) + DD.saatDk(ilkSaat) * 6e4, son = ilk + x.pencereSaat * 36e5;
    if (su < ilk) return {tur: 'oruc', bas: ilk - x.orucSaat * 36e5};
    return su < son ? {tur: 'pencere', bas: ilk} : {tur: 'oruc', bas: son};
  };
  const pencere = () => {
    const R = DDV.ritim, p = plan();
    if ((p?.hassasiyetler || []).some(h => ORUC_ENGEL.includes(h))) return '';
    const ham = DD.durum.oku('ritim-kayit', null), imza = p ? `${p.orucProtokolu ?? 'atlandi'}@${p.ilkOgunSaati}` : null;
    const k = (ham?.planImza ?? null) === imza ? ham : null, taze = k?.capa && Date.now() - k.capa < 864e5;
    if (p?.orucProtokolu === 'yok' && !k?.protokol) return '';
    const planli = R.protokoller.find(x => x.id === p?.orucProtokolu?.replace(':', '-') && !x.haftalik);
    const protokol = R.protokoller.find(x => x.id === (k?.protokol ?? planli?.id ?? R.aktifProtokol));
    if (protokol.haftalik) {
      const kisitli = k?.kisitli ?? ['Pzt', 'Per'], bugun = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][DD.simdi().getDay()];
      return DD.eylemKart({ikon: 'takvim', baslik: kisitli.includes(bugun) ? 'Bugün kısıtlı gün' : 'Bugün olağan gün', alt: `${protokol.ad} planı · ${kisitli.join(', ')} kısıtlı`, git: '#/ritim'});
    }
    const taban = planli ? planEvre(planli, p.ilkOgunSaati) : {tur: R.aktifDurum, bas: new Date(R.durumlar.pencere.baslangic.slice(0, 16)).getTime()};
    const tur = taze ? DD.durum.oku('ritim-durum', taban.tur) : taban.tur, d = R.durumlar[tur];
    const an = DD.simdi().getTime() + (taze ? Date.now() - k.capa : 0);
    const bas = (taze ? k.bas : null) ?? (tur === taban.tur ? taban.bas : an);
    const hedefDk = (tur === 'oruc' ? protokol.orucSaat : protokol.pencereSaat) * 60, gecenDk = (an - bas) / 6e4, kalan = Math.ceil(hedefDk - gecenDk);
    const alt = kalan > 0 ? `${DD.sure(kalan)} kaldı` : tur === 'oruc' ? 'Hedefine ulaştın' : 'Pencere süresi doldu';
    const bit = bas + hedefDk * 6e4, saat = ms => new Date(ms).toTimeString().slice(0, 5), gun = ms => new Date(ms).toDateString();
    // Bant tek günü çizer; gece yarısını aşan pencere pil olarak gösterilir.
    if (tur === 'oruc' || gun(bas) !== gun(bit)) return DD.orucPil({durum: tur, baslik: d.rozet, alt, oran: gecenDk / hedefDk, git: '#/ritim'});
    return DD.pencereBant({bas: saat(bas), bit: saat(bit), simdi: saat(an), baslik: d.rozet, alt, git: '#/ritim'});
  };
  const pencereYuva = () => { const h = pencere(); return h ? `<div data-yuva="pencere">${h}</div>` : ''; };
  const makro = z => DD.makroCubuk(z.makro, {veri: {eylem: 'makro'}});
  // Değişti rozeti ad satırına sığsın diye bu halde saat yazılmaz.
  const ogunBlok = z => {
    const kayitlar = bugunKayitlari().filter(k => k.foto);
    return DD.ogunListe(z.ogunler.map(x => ({...x, saat: x.durum === 'degisti' ? null : x.saat, foto: x.durum === 'atlandi' ? null : kayitlar.find(k => k.ogun === x.id)?.foto})), {gunlukHedef: z.hedef});
  };
  const tabaklarBolum = () => {
    const l = bugunKayitlari().filter(k => k.foto).map(k => ({...k, ogun: DDV.bugun.ogunler.find(o => o.id === k.ogun)?.ad ?? k.ogun}));
    return l.length > 0 && {baslik: 'Tabakların', html: DD.tabakSerit(l)};
  };
  const suSatir = () => {
    const s = suOku(), h = suHedef(), son = s.kayitlar[s.kayitlar.length - 1];
    return DD.yuzey(DD.satir({sol: DD.halkaMini({oran: s.icilenMl / h, ikon: 'droplet', ton: 'bilgi'}), baslik: 'Su kayıtların', alt: son ? `%${Math.round(s.icilenMl / h * 100)} · ${s.kayitlar.length} kayıt · son ${son.saat}` : 'Bugün için henüz kayıt yok', veri: {eylem: 'su-kayit'}}));
  };
  const suKart = () => DD.suKart({icilen: suOku().icilenMl, hedef: suHedef(), adimlar: DDV.bugun.su.adimlar});
  const ilkCumleVurgulu = m => m.replace(/^([^.]+\.)/, '**$1**');
  const icerikler = () => { const eksik = suOku().icilenMl < suHedef(); return [...DDV.icerikler].sort((a, b) => (eksik ? (b.kategori === 'Su') - (a.kategori === 'Su') : 0)).slice(0, 4); };
  const oneriler = () => {
    const not = DDV.benimDiyetisyenim.notlar[0];
    return `<div class="dd-yigin">${DD.ipucu({ikon: 'user-doctor', baslik: 'Diyetisyeninden', metin: ilkCumleVurgulu(not.metin), eylem: {metin: 'Mesaj yaz', git: '#/uzman/sohbet'}})}${DD.yatay(icerikler().map(x => DD.icerikKart({gorsel: x.gorsel, kategori: x.kategori, baslik: x.baslik, meta: `${x.okumaDk} dk okuma`, veri: {eylem: 'icerik', id: x.slug}})), {kart: true})}</div>`;
  };
  const programBolum = () => {
    const a = aktifProgram(), p = a && DDV.programlar.find(x => x.slug === a.slug);
    if (!p) {
      const hedef = DDV.kullanici.hedef.split('-')[0], l = DDV.programlar.filter(x => x.hedef === hedef);
      return {baslik: 'Sana uygun programlar', eylem: 'Tümü', git: '#/programlar', html: `<div class="dd-yigin">${DD.eylemKart({ikon: 'wand-magic-sparkles', baslik: 'Program Bul', alt: 'Beş adımda sana uyanı seç', git: '#/program-bul'})}${DD.ikiliSerit((l.length > 1 ? l : DDV.programlar).slice(0, 2).map(x => DD.programKart(x, {tur: 'tile'})), 'Önerilen programlar')}</div>`};
    }
    const html = a.gun ? DD.programKart(p, {tur: 'aktif', gun: programGunu(DD.bugunIso()) ?? a.gun, toplam: a.toplamGun}) : DD.eylemKart({ikon: 'takvim', baslik: p.ad, alt: `Başlangıç: ${tarihMetin(a.baslangic)}`, git: `#/program/${p.slug}`});
    return {baslik: 'Programın', eylem: 'Tümü', git: '#/programlar', html};
  };

  const bugunGovde = z => DD.bolumler([
    `<div class="dd-yigin"><div data-yuva="takvim">${takvim(z)}</div>${z.kayitVar ? `<div data-yuva="makro">${makro(z)}</div>` : ''}</div>`,
    !z.kayitVar && DD.bos({ikon: 'utensils', baslik: 'Günün henüz boş', metin: 'İlk öğününü eklediğinde **halkan ve makroların** burada dolmaya başlar.', eylem: {metin: 'Öğün ekle', ikon: 'ekle', git: '#/besin-ara'}, ikincil: {metin: 'Tabağını tara', ikon: 'camera', git: '#/ai/kamera'}}),
    {baslik: 'Öğünlerin', html: `<div class="dd-yigin"><div data-yuva="ogun">${ogunBlok(z)}</div>${pencereYuva()}</div>`},
    tabaklarBolum(),
    {baslik: 'Gün içinde', html: `<div class="dd-yigin"><div class="dd-yigin-12"><div data-yuva="su">${suKart()}</div><div data-yuva="su-satir">${suSatir()}</div></div>${DD.kart({html: DD.duygu({...DDV.bugun.duygu, secili: duyguOku()})})}</div>`},
    programBolum(),
    {baslik: 'Sana önerilenler', html: oneriler()}
  ]);

  // Bugün dışındaki günler: geçmişten toplamlar, haftalık menüden plan. Öğün dökümü yalnız bugün için tutulur.
  const kalemAd = k => k.match(/^[^\d½¼¾(]+/)[0].trim();
  const ogunIkon = ad => DDV.bugun.ogunler.find(o => o.ad === ad)?.ikon || 'utensils';
  const bugune = DD.btn({metin: 'Bugüne dön', ikon: 'takvim', tur: 'tonal', boyut: 'sm', tam: true, veri: {eylem: 'bugune'}});
  const digerGun = (iso, z) => {
    const g = DDV.gecmis.find(x => x.tarih === iso), n = programGunu(iso), a = aktifProgram();
    const m = gunMenu(n);
    const planKcal = m ? toplam(m.ogunler, 'kcal') : 0;
    const icerik = g
      ? DD.halka({foto: true, hedef: z.hedef, alinan: g.kcal, yan: [{deger: sayi(g.kcal), etiket: 'Alınan'}, {deger: `${ondalik(g.suMl / 1000, 1)} L`, etiket: 'Su'}]})
      : m ? DD.halka({foto: true, hedef: z.hedef, planli: planKcal, etiket: 'Hedef', alt: 'kcal', yan: [{deger: sayi(planKcal), etiket: 'Planlı'}, {deger: String(m.ogunler.length), etiket: 'Öğün'}]})
        : DD.halka({foto: true, hedef: z.hedef, etiket: 'Hedef', alt: 'kcal'});
    const hero = DD.heroAna({baslik: buyukHarf(tarihMetin(iso)), altBaslik: n ? `Programın ${n}. günü` : '', perde: 'tam', icerik, slaytlar: [m ? {gorsel: 'assets/gorsel/hero/karsilama-sofra.webp', etiket: 'Günün menüsü', baslik: buyukHarf(m.baslik), alt: `${m.ogunler.length} öğün · ${sayi(planKcal)} kcal`, git: `#/program/${a.slug}`} : {gorsel: 'assets/gorsel/hero/karsilama-sofra.webp'}]});
    const menu = m && {baslik: g ? 'O günün planı' : 'Planlanan menü', html: DD.yuzey(DD.satirlar(m.ogunler.map(o => ({ikon: ogunIkon(o.ad), baslik: `${o.ad} · ${o.saat}`, alt: o.kalemler.slice(0, 2).map(kalemAd).join(', '), deger: `${sayi(o.kcal)} kcal`, ok: false}))))};
    const ozet = g && {baslik: 'Günün özeti', html: DD.ozet([{ikon: 'utensils', etiket: 'Alınan', deger: sayi(g.kcal), birim: 'kcal'}, {ikon: 'droplet', etiket: 'Su', deger: sayi(g.suMl), birim: 'ml'}, {ikon: 'weight-scale', etiket: 'Kilo', deger: ondalik(g.kiloKg, 1), birim: 'kg'}])};
    const bos = !g && !m && DD.bos({ikon: 'takvim', baslik: 'Bu güne kayıt yok', metin: 'Bu tarihte **öğün ya da plan** görünmüyor. Bugünün kayıtlarına dönebilirsin.', eylem: {metin: 'Bugüne dön', veri: {eylem: 'bugune'}}});
    return hero + DD.bolumler([`<div class="dd-yigin">${takvim(z)}${bos ? '' : bugune}</div>`, bos, ozet, menu, m && programBolum()]);
  };

  // ---------- Parçalı güncelleme: takvim gezintisi ve kaydırma korunur ----------
  const yuva = (kok, ad, html) => { const el = kok.querySelector(`[data-yuva="${ad}"]`); if (el) el.innerHTML = html; };
  const parcalar = kok => {
    const z = gunOzet();
    if (yeniMi() || secili !== DD.bugunIso()) { DD.tazele(); return; }
    kok.querySelector('.dd-hero').outerHTML = heroBugun(z);
    yuva(kok, 'takvim', takvim(z)); yuva(kok, 'makro', makro(z)); yuva(kok, 'ogun', ogunBlok(z));
    kok.querySelector('.dd-kaydir').dispatchEvent(new Event('scroll'));
    cizilen = imza();
  };
  const ogunDurumYaz = (kok, id, deger) => {
    const l = DD.durum.oku(anahtar('ogun'), {});
    if (deger) l[id] = deger; else delete l[id];
    DD.durum.yaz(anahtar('ogun'), l);
    parcalar(kok);
  };
  const ogunGeriAl = (kok, id) => ({eylem: 'Geri al', onEylem: () => ogunDurumYaz(kok, id, null)});
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id).ad;

  // ---------- Sheet'ler ----------
  const degistirSheet = (kok, id) => {
    const o = ogunler().find(x => x.id === id);
    const secim = d => [...d.querySelectorAll('input[name="besin"]:checked')].map(i => i.value);
    const kaydet = (d, slugs) => { d.kapat(); ogunDurumYaz(kok, id, {durum: 'degisti', besinler: slugs}); };
    DD.sheet({
      baslik: `${o.ad} nasıldı?`,
      html: `<div class="dd-yigin-12">${DD.p('Yediklerini işaretli bırak, **yemediklerinin** işaretini kaldır.', {ton: 'ikincil'})}<div class="dd-yigin-12">${o.besinler.map(b => DD.checkbox({ad: 'besin', deger: b.slug, etiket: b.ad.split(' (')[0], alt: `${ondalik(b.miktar, 2)} ${b.birim} · ${sayi(b.kcal)} kcal`, secili: true})).join('')}</div></div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Besin ekle', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'degis-ekle'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'degis-kaydet'}})}</div>`,
      sonra: d => {
        const dugme = d.querySelector('[data-eylem="degis-kaydet"]');
        d.addEventListener('change', () => { dugme.disabled = !secim(d).length; });
        DD.eylem(d, 'degis-kaydet', () => { kaydet(d, secim(d)); DD.toast(`**${o.ad}** güncellendi`, {tur: 'basari', ...ogunGeriAl(kok, id)}); });
        DD.eylem(d, 'degis-ekle', () => { hedefOgun = id; kaydet(d, secim(d)); DD.git(`#/besin-ara?ogun=${id}`); });
      }
    });
  };
  const makroSheet = () => {
    const z = gunOzet(), plan = z.ogunler.find(x => x.durum === 'planli');
    const cumle = plan ? `${plan.ad} planınla protein **${sayi(z.makro.P.alinan + plan.P)} g**, lif **${sayi(z.makro.Lif.alinan + plan.Lif)} g** olur.` : `Bugün **${z.yenen.length} öğün** kaydettin; toplamlar buna göre.`;
    DD.sheet({baslik: 'Makroların', html: `<div class="dd-yigin">${DD.makroCubuk(z.makro, {tur: 'liste', kart: false})}${DD.p(cumle, {ton: 'ikincil'})}</div>`});
  };
  const suGovde = () => {
    const s = suOku(), h = suHedef();
    const kayitlar = [...s.kayitlar].map((k, i) => [k, i]).reverse().map(([k, i]) => DD.satirKap({ikon: 'droplet', baslik: `${sayi(k.ml)} ml`, alt: k.saat}, DD.ikonBtn({ikon: 'sil', etiket: `${k.saat} kaydını sil`, veri: {eylem: 'su-sil', id: i}})));
    return `<div class="dd-yigin">${DD.ilerleme({n: s.icilenMl, hedef: h, etiket: `${sayi(s.icilenMl)} ml`, deger: `${sayi(h)} ml`})}<div class="dd-ara"><span class="dd-t-card">Miktar</span>${DD.stepper({ad: 'su-miktar', deger: 200, min: 50, max: 1000, adim: 50, birim: 'ml', aria: 'Su miktarı'})}</div>${kayitlar.length ? DD.satirlar(kayitlar) : DD.veriYok('Bugün için **henüz su kaydı** yok.')}</div>`;
  };
  const suGuncelle = kok => { yuva(kok, 'su', suKart()); yuva(kok, 'su-satir', suSatir()); cizilen = imza(); };
  const suSheet = kok => DD.sheet({
    baslik: 'Su kayıtların', html: suGovde(),
    altBar: DD.btn({metin: 'Su ekle', ikon: 'ekle', tam: true, veri: {eylem: 'su-ozel'}}),
    sonra: d => {
      const ciz = () => { d.querySelector('.dd-sheet-govde').innerHTML = suGovde(); suGuncelle(kok); };
      DD.eylem(d, 'su-ozel', () => { const ml = +d.querySelector('input[name="su-miktar"]').value, s = suOku(); suYaz({...s, kayitlar: [...s.kayitlar, {saat: DDV.bugun.simdi, ml}]}); ciz(); DD.toast(`**+${sayi(ml)} ml** eklendi`, {ikon: 'droplet'}); });
      DD.eylem(d, 'su-sil', el => { const s = suOku(); suYaz({...s, kayitlar: s.kayitlar.filter((_, i) => i !== +el.dataset.id)}); ciz(); });
    }
  });
  const icerikSheet = slug => {
    const x = DDV.icerikler.find(i => i.slug === slug);
    DD.sheet({
      baslik: x.baslik,
      html: `<div class="dd-yigin"><div class="dd-sira">${DD.rozet({metin: x.kategori, ikon: x.ikon})}</div>${DD.p(ilkCumleVurgulu(x.ozet))}${DD.bant({metin: 'Bu içerik **genel bilgi** içindir; sana özel kararlar için diyetisyeninle konuş.'})}</div>`,
      altBar: DD.btn({metin: 'Diyetisyenime sor', ikon: 'mesaj', tam: true, git: '#/uzman/sohbet', attrs: 'data-sheet-kapat'})
    });
  };

  // Su düğmesine art arda basışlar tek toast olur; "Geri al" hepsini birden kaldırır.
  let suBirikim = 0, suSaat = 0;
  const suToast = kok => {
    const adet = suBirikim, s = suOku(), ml = toplam(s.kayitlar.slice(-adet), 'ml'), tamam = s.icilenMl >= suHedef();
    suBirikim = 0;
    DD.toast(tamam ? `**+${sayi(ml)} ml** eklendi, su hedefine ulaştın` : `**+${sayi(ml)} ml** eklendi`, {ikon: 'droplet', eylem: 'Geri al', onEylem: () => { const g = suOku(); suYaz({...g, kayitlar: g.kayitlar.slice(0, -adet)}); suGuncelle(kok); }});
  };

  // Sekme ekranında DOM kalır; bağlar kök üzerinde bir kez kurulur, her çizimde yenilenmez.
  const bagli = new WeakSet();
  const bagla = kok => {
    DD.on(kok, 'gun', iso => { secili = iso; DD.tazele(); });
    DD.eylem(kok, 'bugune', () => { secili = DD.bugunIso(); DD.tazele(); });
    DD.eylem(kok, 'makro', makroSheet);
    DD.eylem(kok, 'icerik', el => icerikSheet(el.dataset.id));
    DD.eylem(kok, 'ogun-ekle', el => { hedefOgun = el.dataset.id; DD.git(`#/besin-ara?ogun=${el.dataset.id}`); });
    DD.eylem(kok, 'plan-uygula', el => { const id = el.dataset.id; ogunDurumYaz(kok, id, {durum: 'dolu'}); DD.toast(`**${ogunAd(id)}** kaydedildi`, {tur: 'basari', ...ogunGeriAl(kok, id)}); });
    DD.eylem(kok, 'plan-degistir', el => degistirSheet(kok, el.dataset.id));
    DD.eylem(kok, 'plan-atla', el => { const id = el.dataset.id; ogunDurumYaz(kok, id, {durum: 'atlandi'}); DD.toast(`**${ogunAd(id)}** atlandı`, {ikon: 'forward', ...ogunGeriAl(kok, id)}); });
    DD.on(kok, 'su', (_, d) => {
      const s = suOku();
      suYaz({...s, kayitlar: [...s.kayitlar, {saat: DDV.bugun.simdi, ml: d.eklenen}]});
      yuva(kok, 'su-satir', suSatir()); cizilen = imza();
      suBirikim += 1; clearTimeout(suSaat); suSaat = setTimeout(() => suToast(kok), DD.TK.motion.reveal);
    });
    DD.eylem(kok, 'su-kayit', () => suSheet(kok));
    DD.on(kok, 'duygu', id => {
      DD.durum.yaz(anahtar('duygu'), id); cizilen = imza();
      DD.toast(`Şu anki halin kaydedildi: **${DDV.bugun.duygu.secenekler.find(s => s.id === id).ad}**`, {ikon: 'onay'});
    });
  };

  let kayitYaziliyor = false;   // ekle kendi dd-kayit olayını yayar; ek kalemler yazılmadan ekran tazelenmesin
  // Bugün hiç çizilmemiş olsa da kayıt kaybolmasın: dinleyici ekrandan bağımsızdır. 'tabagim-ogun' #/ogun/:id üzerinden gelen hedeftir.
  document.addEventListener('dd-tabagim-kaydet', e => {
    const ek = (e.detail.liste || []).filter(b => b.ad), l = DD.durum.oku(anahtar('ek'), {});
    const id = DD.durum.oku('tabagim-ogun', null) || hedefOgun || ogunler().find(x => x.durum === 'planli')?.id || 'ara';
    const {foto, not, kaynak, guven} = e.detail, adlar = ek.map(b => b.ad.split(' (')[0]);
    kayitYaziliyor = true;
    const kayitId = !ek.length ? undefined : kayitDefteri()?.ekle({
      tarih: DD.bugunIso(), saat: DD.simdi().toTimeString().slice(0, 5), ogun: id, foto: foto ?? null, not: not ?? null, kaynak: kaynak ?? 'arama', guven: guven ?? null,
      ad: `${adlar.slice(0, 2).join(' ve ')}${adlar.length > 2 ? ` +${adlar.length - 2}` : ''}`,
      kcal: Math.round(toplam(ek, 'kcal')), protein: toplam(ek, 'P'), karb: toplam(ek, 'K'), yag: toplam(ek, 'Y'), lif: toplam(ek, 'Lif'),
      bilesenler: ek.map(b => ({ad: b.ad, gram: b.gram ?? null, kcal: b.kcal})), ekIdleri: ek.map(b => b.id)
    });
    kayitYaziliyor = false;
    DD.durum.yaz(anahtar('ek'), {...l, [id]: [...(l[id] || []), ...ek.map(b => ({...b, kayitId}))]});
    DD.durum.sil('tabagim-ogun');
    hedefOgun = null;
    // Tabakların bölümü ilk kayıtla ortaya çıkabilir; parça değil ekran yenilenir.
    if (DD.aktif()?.ad === 'bugun' && hazir) DD.tazele();
  });
  document.addEventListener('dd-kayit', () => { if (!kayitYaziliyor && DD.aktif()?.ad === 'bugun' && hazir) DD.tazele(); });

  DD.ekran('bugun', {
    tur: 'sekme',
    nav: 'bugun',
    baslik: 'Bugün',
    ustBar: () => ({saydam: hazir}),   // iskelet ve hata fotoğrafsızdır; beyaz logo solid barda kalır
    yukle: () => {
      if (hal() === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: () => { const z = gunOzet(); return secili === DD.bugunIso() ? heroBugun(z) + bugunGovde(z) : digerGun(secili, z); },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    sonra: kok => { cizilen = imza(); if (!bagli.has(kok)) { bagli.add(kok); bagla(kok); } },
    donus: kok => { if (imza() !== cizilen) DD.tazele(); else yuva(kok, 'pencere', pencere()); }
  });
})();
