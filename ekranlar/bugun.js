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
      yeniKip = hal() === 'bos' || DD.yeniHesap();
      const kip = yeniKip ? 'yeni' : 'bugun';
      if (DD.durum.oku('bugun-kip') !== kip) DD.durum.yaz('bugun-kip', kip);
    }
    return yeniKip;
  };
  const anahtar = ad => `${yeniMi() ? 'yeni' : 'bugun'}-${ad}`;

  let secili = DD.bugunIso(), hedefOgun = null, cizilen = '', hataGosterildi = false, hazir = false;

  // Hedefler: onboarding sonucu 'plan' anahtarındadır; yoksa DDV.
  const plan = () => DD.durum.oku('plan', null);
  const kisa = () => DD.durum.oku('kisa-hedef', null);
  const kcalHedef = () => plan()?.hedefKcal ?? kisa()?.kcal ?? DDV.bugun.hedefKcal;
  const makroHedef = m => plan()?.makro?.[m] ?? kisa()?.makro?.[m] ?? DDV.bugun.makro[m].hedef;
  const suHedef = () => plan()?.suMl ?? kisa()?.suMl ?? DDV.bugun.su.hedefMl;

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
  const aktifProgram = () => DD.durum.oku('aktifProgram', yeniMi() ? null : DDV.kullanici.aktifProgram);
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
  const halkalar = z => (DD.hedefsiz() ? {} : {...(yeniMi() ? {} : Object.fromEntries(DDV.gecmis.map(g => [g.tarih, Math.min(g.kcal / z.hedef, 1)]))), [DD.bugunIso()]: Math.min(z.alinan / z.hedef, 1)});
  const takvim = z => DD.takvim({ad: 'gun', gorunum: 'hafta', secili, odak: secili, halkalar: halkalar(z)});

  // ---------- Hero ----------
  const halka = z => (DD.hedefsiz()
    ? `<div class="dd-yigin-12">${DD.halka({foto: true, hedef: z.alinan, etiket: 'Alınan', alt: 'kcal'})}${DD.btn({metin: 'Hedefini hesapla', ikon: 'hedef', tur: 'cam', boyut: 'sm', veri: {eylem: 'hedef-hesapla'}})}</div>`
    : z.kayitVar
    ? DD.halka({foto: true, hedef: z.hedef, alinan: z.alinan, planli: z.planli, kesitler: z.yenen.map(x => x.kcal), yan: [{deger: sayi(z.alinan), etiket: 'Alınan'}, z.planli ? {deger: sayi(z.planli), etiket: 'Planlı'} : {deger: `${z.yenen.length}/${z.ogunler.length}`, etiket: 'Öğün'}]})
    : DD.halka({foto: true, hedef: z.hedef, etiket: 'Hedef', alt: 'kcal'}));
  const slaytlar = z => {
    const uzman = DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen), r = DD.durum.oku('uzman-randevu', DDV.benimDiyetisyenim.sonrakiRandevu), s = z.ogunler.find(x => x.durum === 'planli');
    const sofra = 'assets/gorsel/hero/karsilama-sofra.webp';
    const gorusme = r && {gorsel: 'assets/gorsel/hero/uzman-masa.webp', etiket: `Sonraki görüşme · ${r.tarihMetin} ${r.saat}`, baslik: r.baslik, alt: uzman.ad, avatar: uzman.harf, git: '#/uzman'};
    if (!z.kayitVar) return [{gorsel: sofra, etiket: 'Güne başla', baslik: 'Tabağını çek', alt: 'Fotoğrafla öğününe ekle', git: '#/ai/kamera?mod=tabak'}];
    if (yeniMi()) return [{gorsel: sofra, etiket: 'Bugün', baslik: 'Sıradaki tabağını çek', alt: `${sayi(z.alinan)} kcal kaydettin`, git: '#/ai/kamera?mod=tabak'}];
    if (s) return [{gorsel: sofra, etiket: `Sıradaki öğün · ${s.saat}`, baslik: s.besinler.slice(0, 2).map(b => b.ad.split(' (')[0]).join(' ve '), alt: `Planlı · ${sayi(s.kcal)} kcal`, git: `#/ogun/${s.id}`}, gorusme].filter(Boolean);
    const m = gunMenu(programGunu(DD.bugunIso()) + 1);
    const l = [gorusme, m && {gorsel: sofra, etiket: 'Yarının menüsü', baslik: buyukHarf(m.baslik), alt: `${m.ogunler.length} öğün · ${sayi(toplam(m.ogunler, 'kcal'))} kcal`, git: `#/program/${aktifProgram().slug}`}].filter(Boolean);
    return l.length ? l : [{gorsel: sofra}];
  };
  const heroBugun = z => {
    const n = programGunu(DD.bugunIso());
    return DD.heroAna({baslik: DD.uye() ? DDV.bugun.selam : DDV.bugun.selam.split(',')[0], altBaslik: `${DDV.bugun.tarihMetin}${n ? ` · Programın ${n}. günü` : ''}`, perde: 'tam', slaytlar: slaytlar(z), icerik: halka(z)});
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
    return DD.ogunListe(z.ogunler.map(x => ({...x, saat: x.durum === 'degisti' ? null : x.saat, foto: x.durum === 'atlandi' ? null : kayitlar.find(k => k.ogun === x.id)?.foto})), {gunlukHedef: z.hedef, hedefsiz: DD.hedefsiz()});
  };
  const tabaklarBolum = () => {
    const l = bugunKayitlari().filter(k => k.foto).map(k => ({...k, ogun: DDV.bugun.ogunler.find(o => o.id === k.ogun)?.ad ?? k.ogun}));
    return l.length > 0 && {baslik: 'Tabakların', html: DD.uye() ? DD.tabakSerit(l) : `<div class="dd-yigin-12">${DD.tabakSerit(l)}${DD.kanca({metin: 'Çektiğin tabakları görsel arşivinde saklamak için giriş yap', ikon: 'images'})}</div>`};
  };
  const suKart = () => DD.suKart({icilen: suOku().icilenMl, hedef: suHedef(), adimlar: DDV.bugun.su.adimlar, kayitEylem: 'su-kayit'});
  const ilkCumleVurgulu = m => m.replace(/^([^.]+\.)/, '**$1**');
  const icerikler = () => { const eksik = suOku().icilenMl < suHedef(); return [...DDV.icerikler].sort((a, b) => (eksik ? (b.kategori === 'Su') - (a.kategori === 'Su') : 0)).slice(0, 4); };
  const oneriler = () => {
    const not = DDV.benimDiyetisyenim.notlar[0];
    return `<div class="dd-yigin">${DD.eylemKart({ikon: 'user-doctor', baslik: yeniMi() ? 'Diyetisyen bul' : 'Uzmanım', alt: yeniMi() ? 'Sana uygun uzmanı seç' : 'Görüşme, mesaj ve menün', git: '#/uzman'})}${yeniMi() ? '' : DD.ipucu({ikon: 'user-doctor', baslik: 'Diyetisyeninden', metin: ilkCumleVurgulu(not.metin), eylem: {metin: 'Mesaj yaz', git: '#/uzman/sohbet'}})}${DD.yatay(icerikler().map(x => DD.icerikKart({gorsel: x.gorsel, kategori: x.kategori, baslik: x.baslik, meta: `${x.okumaDk} dk okuma`, veri: {eylem: 'icerik', id: x.slug}})), {kart: true})}</div>`;
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

  // Son 7 günün ortalaması; bugün sürdüğü için sayılmaz.
  const gecmisOrtalama = () => { const l = DDV.gecmis.slice(-8, -1), ort = a => toplam(l, a) / l.length; return DD.ozetSerit([{ikon: 'kalori', etiket: '7 gün ortalaman', deger: sayi(ort('kcal')), birim: 'kcal'}, {ikon: 'su', etiket: '7 gün su', deger: ondalik(ort('suMl') / 1000, 1), birim: 'L'}]); };
  const bugunGovde = z => DD.bolumler([
    `<div class="dd-yigin"><div data-yuva="takvim">${takvim(z)}</div>${z.kayitVar && !DD.hedefsiz() ? `<div data-yuva="makro">${makro(z)}</div>` : ''}${yeniMi() ? '' : gecmisOrtalama()}</div>`,
    !z.kayitVar && !yeniMi() && DD.bos({ikon: 'utensils', baslik: 'Günün henüz boş', metin: 'İlk öğününü eklediğinde **halkan ve makroların** burada dolmaya başlar.', eylem: {metin: 'Öğün ekle', ikon: 'ekle', git: '#/besin-ara'}, ikincil: {metin: 'Tabağını tara', ikon: 'camera', git: '#/ai/kamera'}}),
    {baslik: 'Gün içinde', html: `<div class="dd-yigin">${DD.kart({html: `${DD.duygu({...DDV.bugun.duygu, secili: duyguOku()})}${DD.uye() ? '' : DD.kanca({metin: 'Duygu durumunun beslenmene etkisini görmek için kaydet', ikon: 'chart-line'})}`})}<div data-yuva="su">${suKart()}</div></div>`},
    {baslik: 'Öğünlerin', html: `<div class="dd-yigin"><div data-yuva="ogun">${ogunBlok(z)}</div>${pencereYuva()}${DD.uye() ? '' : DD.btn({metin: 'Günün Özetini Kaydet', ikon: 'onay', tam: true, veri: {'uye-ol': 'Verilerini ve çektiğin tabağı buluta yedeklemek için 10 saniyede üye ol.'}})}</div>`},
    tabaklarBolum(),
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
    const kaydet = (d, slugs) => {
      const not = d.querySelector('[name="diyetisyen-not"]')?.value.trim();
      d.kapat(); ogunDurumYaz(kok, id, {durum: 'degisti', besinler: slugs, ...(not ? {not} : {})});
      if (not) DD.durum.yaz('uzman-sohbet', [...DD.durum.oku('uzman-sohbet', []), {id: Date.now(), kim: 'ben', saat: `Bugün ${DDV.bugun.simdi}`, metin: not, ek: {tur: 'ogun', ikon: 'ogun', ad: `${o.ad} notu`}}]);
      return !!not;
    };
    DD.sheet({
      baslik: `${o.ad} nasıldı?`,
      html: `<div class="dd-yigin-12">${DD.p('Yediklerini işaretli bırak, **yemediklerinin** işaretini kaldır.', {ton: 'ikincil'})}<div class="dd-yigin-12">${o.besinler.map(b => DD.checkbox({ad: 'besin', deger: b.slug, etiket: b.ad.split(' (')[0], alt: `${ondalik(b.miktar, 2)} ${b.birim} · ${sayi(b.kcal)} kcal`, secili: true})).join('')}</div>${yeniMi() ? '' : DD.input({ad: 'diyetisyen-not', etiket: 'Diyetisyenine not', cokSatir: true, yer: 'Dışarıdaydım, salata sosunu koydurmadım.'})}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Besin ekle', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'degis-ekle'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'degis-kaydet'}})}</div>`,
      sonra: d => {
        const dugme = d.querySelector('[data-eylem="degis-kaydet"]');
        d.addEventListener('change', () => { dugme.disabled = !secim(d).length; });
        DD.eylem(d, 'degis-kaydet', () => { const notlu = kaydet(d, secim(d)); DD.toast(notlu ? `**${o.ad}** güncellendi, notun diyetisyenine gitti` : `**${o.ad}** güncellendi`, {tur: 'basari', ...ogunGeriAl(kok, id)}); });
        DD.eylem(d, 'degis-ekle', () => { hedefOgun = id; kaydet(d, secim(d)); DD.git(`#/besin-ara?ogun=${id}`); });
      }
    });
  };
  const makroSheet = () => {
    const z = gunOzet(), plan = z.ogunler.find(x => x.durum === 'planli');
    const cumle = plan ? `${plan.ad} planınla protein **${sayi(z.makro.P.alinan + plan.P)} g**, lif **${sayi(z.makro.Lif.alinan + plan.Lif)} g** olur.` : `Bugün **${z.yenen.length} öğün** kaydettin; toplamlar buna göre.`;
    DD.sheet({baslik: 'Makroların', html: `<div class="dd-yigin">${DD.makroCubuk(z.makro, {tur: 'liste', kart: false})}${DD.p(cumle, {ton: 'ikincil'})}</div>`});
  };
  const SU_MIKTAR = [{ml: 200, ad: 'Bardak', ikon: 'su'}, {ml: 300, ad: 'Büyük bardak', ikon: 'su'}, {ml: 500, ad: 'Şişe', ikon: 'bottle-water'}];
  const suHaftaBlok = (s, h) => {
    const g = DDV.gecmis.slice(-7), onceki = g.slice(0, -1), ort = Math.round(toplam(onceki, 'suMl') / onceki.length / 10) * 10;
    return `<div class="dd-yigin-12"><span class="dd-t-card">Son 7 gün</span>${DD.suHafta({gunler: g.map((x, i) => ({etiket: x.gun, ml: i === g.length - 1 ? s.icilenMl : x.suMl, bugun: i === g.length - 1})), hedef: h})}${DD.p(`Önceki 6 günün ortalaması **${sayi(ort)} ml**.`, {ton: 'ikincil', meta: true})}</div>`;
  };
  const suGovde = () => {
    const s = suOku(), h = suHedef();
    const kayitlar = [...s.kayitlar].map((k, i) => [k, i]).reverse().map(([k, i]) => DD.satirKap({sol: DD.ikonKutu({ikon: 'su', boyut: 'sm', ton: 'bilgi'}), baslik: `${sayi(k.ml)} ml`, alt: k.saat}, DD.ikonBtn({ikon: 'sil', etiket: `${k.saat} kaydını sil`, veri: {eylem: 'su-sil', id: i}})));
    return `<div class="dd-yigin">
      ${DD.ozetSerit([{etiket: 'İçilen', deger: sayi(s.icilenMl), birim: 'ml', alt: `${Math.floor(s.icilenMl / DD.SU_BARDAK)} bardak`}, {etiket: 'Hedef', deger: sayi(h), birim: 'ml', alt: `${DD.suBardak(h)} bardak`}, {etiket: 'Kalan', deger: sayi(Math.max(h - s.icilenMl, 0)), birim: 'ml', alt: `${DD.suBardak(Math.max(h - s.icilenMl, 0))} bardak`}])}
      <div class="dd-yigin-12"><span class="dd-t-card">Ne kadar içtin?</span>${DD.suMiktarlar({ogeler: SU_MIKTAR, eylem: 'su-hizli'})}<div class="dd-su-ozel">${DD.stepper({ad: 'su-miktar', deger: 400, min: 50, max: 1000, adim: 50, birim: 'ml', aria: 'Su miktarı'})}${DD.btn({metin: 'Ekle', tur: 'tonal', boyut: 'sm', veri: {eylem: 'su-ozel'}})}</div></div>
      ${yeniMi() ? '' : suHaftaBlok(s, h)}
      <div class="dd-yigin-8"><span class="dd-t-card">Su hatırlatması</span>${DD.uye() ? DD.suHatirlatma() : DD.kanca({metin: 'Su hedefini kaçırmamak için akıllı hatırlatıcıları aç', ikon: 'bell'})}</div>
      <div class="dd-yigin-8"><span class="dd-t-card">Bugünün kayıtları</span>${kayitlar.length ? DD.satirlar(kayitlar) : DD.veriYok('Bugün için **henüz su kaydı** yok.')}</div>
    </div>`;
  };
  const suGuncelle = kok => { yuva(kok, 'su', suKart()); cizilen = imza(); };
  const suSheet = kok => DD.sheet({
    baslik: 'Su', html: suGovde(),
    sonra: d => {
      const ciz = () => { d.querySelector('.dd-sheet-govde').innerHTML = suGovde(); suGuncelle(kok); };
      const ekle = ml => { const s = suOku(); suYaz({...s, kayitlar: [...s.kayitlar, {saat: DDV.bugun.simdi, ml}]}); ciz(); DD.toast(`**+${sayi(ml)} ml** eklendi`, {ikon: 'droplet'}); };
      DD.suHatirlatmaBagla(d);
      DD.eylem(d, 'su-hizli', el => ekle(+el.dataset.id));
      DD.eylem(d, 'su-ozel', () => ekle(+d.querySelector('input[name="su-miktar"]').value));
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
  // Belirti uyarısı: yönlendirme yok, tek çıkış "Anladım".
  const saglikUyari = (x, u) => DD.sheet({baslik: u.baslik, zorunlu: true, html: DD.saglikUyari({seviye: x.uyari, belirti: x.ad, ikon: x.ikon, metin: u.metin}), altBar: DD.btn({metin: 'Anladım', tam: true, attrs: 'data-sheet-kapat'})});
  // K8: kısa hesaplama; BMH (Mifflin-St Jeor) × aktivite, web hesaplayıcısıyla aynı. Kilo koruma ihtiyacıdır, kısıt uygulanmaz.
  const AKTIVITE = [{ad: 'Az', deger: '1.2'}, {ad: 'Orta', deger: '1.55'}, {ad: 'Çok', deger: '1.725'}];
  const hedefSheet = () => {
    const s = {cinsiyet: 'kadin', aktivite: '1.55'};
    DD.sheet({
      baslik: 'Hedefini hesapla',
      html: `<div class="dd-yigin">${DD.p('Kalori hedefin **boy, kilo ve yaşına** göre çıkar. Bilgiler yalnız bu cihazda kalır.', {ton: 'ikincil'})}${DD.segment({ad: 'h-cinsiyet', etiket: 'Cinsiyet', secili: s.cinsiyet, ogeler: [{ad: 'Kadın', deger: 'kadin'}, {ad: 'Erkek', deger: 'erkek'}]})}${[['yas', 'Yaş', 30, 18, 90, 1, 'yaş'], ['boy', 'Boy', 165, 140, 210, 1, 'cm'], ['kilo', 'Kilo', 70, 40, 180, 1, 'kg']].map(([ad, e, deger, min, max, adim, birim]) => `<div class="dd-ara"><span class="dd-t-card">${e}</span>${DD.stepper({ad: `h-${ad}`, deger, min, max, adim, birim, aria: e})}</div>`).join('')}<div class="dd-yigin-8"><span class="dd-t-card">Hareket</span>${DD.segment({ad: 'h-aktivite', etiket: 'Hareket', secili: s.aktivite, ogeler: AKTIVITE})}</div></div>`,
      altBar: DD.btn({metin: 'Hesapla', tam: true, veri: {eylem: 'hedef-kaydet'}}),
      sonra: h => {
        DD.on(h, 'h-cinsiyet', v => { s.cinsiyet = v; }); DD.on(h, 'h-aktivite', v => { s.aktivite = v; });
        DD.eylem(h, 'hedef-kaydet', () => {
          const n = a => +h.querySelector(`input[name="h-${a}"]`).value, kilo = n('kilo');
          const kcal = Math.round((10 * kilo + 6.25 * n('boy') - 5 * n('yas') + (s.cinsiyet === 'erkek' ? 5 : -161)) * +s.aktivite / 10) * 10;
          DD.durum.yaz('kisa-hedef', {kcal, suMl: Math.round(kilo * 30 / 100) * 100, makro: {P: Math.round(kcal * .2 / 4), K: Math.round(kcal * .5 / 4), Y: Math.round(kcal * .3 / 9), Lif: 25}});
          h.kapat(); DD.tazele(); DD.toast(`Günlük hedefin **${sayi(kcal)} kcal**`, {tur: 'basari'});
        });
      }
    });
  };
  let suBirikim = 0, suSaat = 0;
  const suToast = kok => {
    const adet = suBirikim, s = suOku(), ml = toplam(s.kayitlar.slice(-adet), 'ml'), tamam = s.icilenMl >= suHedef();
    suBirikim = 0;
    DD.toast(tamam ? `**+${sayi(ml)} ml** eklendi, su hedefine ulaştın` : `**+${sayi(ml)} ml** eklendi`, {ikon: 'droplet', yerine: true, eylem: 'Geri al', onEylem: () => { const g = suOku(); suYaz({...g, kayitlar: g.kayitlar.slice(0, -adet)}); suGuncelle(kok); }});
  };

  // Bardak dokunuşu mesaj açmaz: mesaj alt satırdaki bardakların üstüne biner, geri bildirim dolum ve sayaçtır.
  const suMesajSustur = () => { clearTimeout(suSaat); suBirikim = 0; DD.toastKapat(); };
  // Dolu bardak: son kayıtlardan bir bardak düşülür.
  const suGeriAl = (s, ml) => {
    const l = s.kayitlar.map(k => ({...k}));
    for (let kalan = ml; kalan > 0 && l.length;) { const son = l[l.length - 1]; if (son.ml <= kalan) { kalan -= son.ml; l.pop(); } else { son.ml -= kalan; kalan = 0; } }
    suYaz({...s, kayitlar: l}); cizilen = imza();
  };

  // Sekme ekranında DOM kalır; bağlar kök üzerinde bir kez kurulur, her çizimde yenilenmez.
  const bagli = new WeakSet();
  const bagla = kok => {
    DD.on(kok, 'gun', iso => { secili = iso; DD.tazele(); });
    DD.eylem(kok, 'bugune', () => { secili = DD.bugunIso(); DD.tazele(); });
    DD.eylem(kok, 'makro', makroSheet);
    DD.eylem(kok, 'icerik', el => icerikSheet(el.dataset.id));
    DD.eylem(kok, 'ogun-ekle', el => {
      const id = hedefOgun = el.dataset.id, o = ogunler().find(x => x.id === id);
      DD.sheet({baslik: `${o?.ad ?? 'Öğün'} ekle`, html: DD.parcali([
        {ikon: 'kamera', baslik: 'Tabağını çek', alt: 'Fotoğrafla öğüne ekle', git: `#/ai/kamera?mod=tabak&ogun=${id}`},
        {ikon: 'ara_', baslik: 'Besin ara', alt: 'Listeden seç', git: `#/besin-ara?ogun=${id}`},
        {ikon: 'barkod', baslik: 'Barkod tara', alt: 'Paketli ürün ekle', git: `#/ai/kamera?mod=barkod&ogun=${id}`},
        {ikon: 'mikrofon', baslik: 'Sesle anlat', alt: 'Ne yediğini söyle', git: `#/ai/ses?ogun=${id}`}
      ])});
    });
    DD.eylem(kok, 'plan-uygula', el => { const id = el.dataset.id; ogunDurumYaz(kok, id, {durum: 'dolu'}); DD.toast(`**${ogunAd(id)}** kaydedildi`, {tur: 'basari', ...ogunGeriAl(kok, id)}); });
    DD.eylem(kok, 'plan-degistir', el => degistirSheet(kok, el.dataset.id));
    DD.eylem(kok, 'plan-atla', el => { const id = el.dataset.id; ogunDurumYaz(kok, id, {durum: 'atlandi'}); DD.toast(`**${ogunAd(id)}** atlandı`, {ikon: 'forward', ...ogunGeriAl(kok, id)}); });
    DD.on(kok, 'su', (_, d) => {
      const s = suOku();
      if (d.bardak) suMesajSustur();
      if (d.eklenen < 0) { suGeriAl(s, -d.eklenen); return; }
      suYaz({...s, kayitlar: [...s.kayitlar, {saat: DDV.bugun.simdi, ml: d.eklenen}]});
      cizilen = imza();
      if (d.bardak) return;
      suBirikim += 1; clearTimeout(suSaat); suSaat = setTimeout(() => suToast(kok), DD.TK.motion.reveal);
    });
    DD.eylem(kok, 'su-kayit', () => suSheet(kok));
    DD.eylem(kok, 'hedef-hesapla', hedefSheet);
    DD.on(kok, 'duygu', id => {
      DD.durum.yaz(anahtar('duygu'), id); cizilen = imza();
      const D = DDV.bugun.duygu, x = D.secenekler.find(s => s.id === id);
      if (x.uyari) saglikUyari(x, D.uyarilar[x.uyari]);
      else DD.toast(DD.uye() ? `Şu anki halin kaydedildi: **${x.ad}**` : x.not || `Şu anki halin: **${x.ad}**`, {ikon: 'onay'});
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
  // Öğün Hatırlatıcı işareti (Profil'de Yedim / Atladım) Bugün'ün öğün durumuna yazar; öğün bölümü yerinde yenilenir, kalan parçalar dönüşte (imza).
  document.addEventListener('dd-ogun', () => { const kok = document.querySelector('.dd-ekran[data-ekran="bugun"]'); if (kok && hazir && secili === DD.bugunIso()) yuva(kok, 'ogun', ogunBlok(gunOzet())); });

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
    sonra: kok => {
      cizilen = imza(); if (!bagli.has(kok)) { bagli.add(kok); bagla(kok); }
      // Tek satırda sığmayan kayıtlı seçim görünür kalsın; sayfa kaydırılmaz.
      const d = kok.querySelector('.dd-duygu'), b = d?.querySelector('[aria-pressed=true]');
      if (b) d.scrollLeft += b.getBoundingClientRect().left - d.getBoundingClientRect().left - (d.clientWidth - b.offsetWidth) / 2;
      // Dönüşüm eşiği: misafir ikinci güne geçince bir kez sorulur. ?gun=2 aynı anı gösterir.
      if (!DD.uye()) {
        const ilk = DD.durum.oku('misafir-ilk-gun', null), ikinci = /[?&]gun=2\b/.test(location.hash) || (ilk && ilk !== DD.bugunIso() && !DD.durum.oku('misafir-duvar', false));
        if (!ilk) DD.durum.yaz('misafir-ilk-gun', DD.bugunIso());
        if (ikinci) { DD.durum.yaz('misafir-duvar', true); DD.uyeDuvar(); }
      }
    },
    donus: kok => { if (imza() !== cizilen) DD.tazele(); else yuva(kok, 'pencere', pencere()); }
  });
})();
