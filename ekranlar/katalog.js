/* Ekran kataloğu (#/katalog): uygulamanın bütün ekranları bölüm başlıklarıyla; her satırda küçük ekran görüntüsü, ekran adı, dokununca o ekran.
 * Gizli sayfa (menüde ve alt navigasyonda yok), #/durumlar gibi. Üstte özet (ekran ve bölüm sayısı hesaplanır).
 *
 * Kaynak: ekranlar/_liste.js DD_ROTALAR. ESLEME her rota desenini tam bir bölüme atar; parametreli rota DD.durumlar.ornek ile gerçek örnek
 *   parametreyle açılır (durumlar.js, tasks/araclar/tur2.cjs ile aynı örnekler). EK: rota başına ayrı satır olan önemli alt haller
 *   (null = rotanın kendi satırı). Atanmamış, iki bölüme atanmış ya da tabloda olup DD_ROTALAR'da olmayan desen DD.katalog.kontrol()
 *   ile bulunur ve konsola uyarı düşer (tasks/katalog/onizleme-uret.cjs de raporlar).
 * Durumlar bölümü #/durumlar ile aynı listeden kurulur (DD.durumlar: ortak haller, sistem ekranları, ekrana özgü haller, pencereler).
 * Satır başlığı: ekranın kendi başlığı (DD.ekranTanim(ad).baslik, işlevse örnek bağlamla); başlığı olmayan tam ekranlarda ve parametreli
 *   rotalarda AD tablosu, o zaman ekranın kendi başlığı alt satıra iner (Program detayı · <program adı>).
 * Küçük görsel: assets/katalog/<tr|en>/<id>.webp (aktif dil; EN yoksa TR'ye düşmez, nötr kutu kalır). Üretim: node tasks/katalog/onizleme-uret.cjs <port>.
 * id: rotanın harf/rakam dışı karakterleri tireye çevrilmiş hali (#/izin/saglik?hal=red → izin-saglik-hal-red). */
(() => {
  const {sayi} = DD;
  const BOLUMLER = [
    ['giris', 'Giriş ve onboarding'], ['ana', 'Ana sayfa'], ['tabak', 'Bugün tabağım'], ['takip', 'Takip'], ['uzman', 'Diyetisyen ve mesaj'],
    ['program', 'Programlar'], ['profil', 'Profil ve ayarlar'], ['entegrasyon', 'Entegrasyonlar'],   // 'Widget’lar ve kilit ekranı' bölümü ikinci yayında (görselleriyle)
    ['durum', 'Durumlar (hata, offline, boş, yükleniyor)']
  ];
  // Eşleme tablosu: bölüm → rota desenleri (DD_ROTALAR anahtarları). Her desen tam bir bölümde.
  const ESLEME = {
    giris: ['#/splash', '#/karsilama', '#/onboarding/:adim', '#/giris', '#/sifre-sifirla', '#/eposta-dogrula', '#/iki-adim', '#/bildirim-izni', '#/kilit'],
    ana: ['#/bugun', '#/ara', '#/bildirimler'],
    tabak: ['#/ogun/:id', '#/kayit/:id', '#/tabaklarim', '#/besin-ara', '#/ai/kamera', '#/ai/tabak', '#/ai/ses', '#/ai/menu', '#/barkod/:ean', '#/etiket',
      '#/denge', '#/denge/tabak', '#/denge/muadil', '#/denge/kacamak', '#/denge/kiyasla', '#/besinler', '#/besin/:slug', '#/kac-kalori', '#/kac-kalori/:slug', '#/disarida'],
    takip: ['#/ritim', '#/ritim/fazlar', '#/saglik', '#/ai/tahlil', '#/testler', '#/test/:slug', '#/hesaplayicilar', '#/hesaplayici/:slug', '#/rozetler', '#/ogun-saatleri', '#/bildirim-onizleme'],
    uzman: ['#/uzman', '#/uzman/bul', '#/uzman/profil/:slug', '#/uzman/sohbet', '#/beslenme-plani', '#/haftalik-menu', '#/destek-gruplari', '#/destek-grubu/:id', '#/uzmanla-calisma', '#/diyetisyen-ol'],
    program: ['#/programlar', '#/program-bul', '#/program/:slug', '#/programlarim', '#/bana-uygun', '#/rehberler', '#/rehber/:slug', '#/ipuclari', '#/ipucu/:slug'],
    profil: ['#/profil', '#/ayarlar', '#/ayarlar/:bolum', '#/tercihler', '#/veri-izinleri', '#/kaydedilenler', '#/paketlerim', '#/odemelerim', '#/pro', '#/cozum-merkezi', '#/talep/:id',
      '#/gorus-bildir', '#/yasal', '#/yasal/:slug', '#/hakkimizda', '#/iletisim', '#/kunye', '#/sss', '#/bilimsel-kaynaklar', '#/editoryal-kurul', '#/nasil-calisir', '#/saglik-bilgilendirmesi'],
    entegrasyon: ['#/cihazlar', '#/cihaz/:id', '#/izin/:tur'],
    widget: ['#/telefon'],
    durum: ['#/hata', '#/guncelle', '#/bakim', '#/oturum-doldu', '#/yetki-yok', '#/durumlar']
  };
  const KENDI = ['#/katalog'];   // bu sayfa: eşlenmiş sayılır, satırı yok
  // Kendi başlığı olmayan (tam) ekranların ve parametreli rotaların adı.
  const AD = {
    '#/splash': 'Açılış', '#/karsilama': 'Karşılama', '#/onboarding/:adim': 'Onboarding', '#/bildirim-izni': 'Bildirim izni', '#/kilit': 'Uygulama kilidi',
    '#/ogun/:id': 'Öğün', '#/kayit/:id': 'Öğün kaydı', '#/barkod/:ean': 'Barkod sonucu', '#/besin/:slug': 'Besin detayı', '#/kac-kalori/:slug': 'Kaç kalori? yazısı',
    '#/test/:slug': 'Sağlık testi', '#/hesaplayici/:slug': 'Hesaplayıcı', '#/uzman/profil/:slug': 'Diyetisyen profili', '#/destek-grubu/:id': 'Destek grubu',
    '#/program-bul': 'Program bul', '#/program/:slug': 'Program detayı', '#/bana-uygun': 'Bana uygun olanı bul', '#/rehber/:slug': 'Rehber', '#/ipucu/:slug': 'İpucu',
    '#/ayarlar/:bolum': 'Ayarlar', '#/talep/:id': 'Destek talebi', '#/yasal/:slug': 'Yasal metin', '#/cihaz/:id': 'Bağlı uygulama', '#/izin/:tur': 'İzin açıklaması',
    '#/hata': 'Hata', '#/guncelle': 'Zorunlu güncelleme', '#/bakim': 'Bakım modu', '#/oturum-doldu': 'Oturum süresi doldu', '#/yetki-yok': 'Erişim yok'
  };
  // Önemli alt haller: [adres, alt satır, başlık]; null = rotanın kendi satırı. EK verilen desende rotanın satırı yalnız null ile gelir.
  const V = () => window.DDV || {};
  const EK = {
    // Alerjen sonrası adımlar üyede yanıtsız ilk adıma döner; ?duzenle=1 istenen adımı açar (onboarding.js konum).
    '#/onboarding/:adim': () => { const l = V().onboarding?.adimlar || [], i = l.findIndex(a => a.id === 'alerjen'); return l.map((a, j) => [`#/onboarding/${a.id}${i > -1 && j > i ? '?duzenle=1' : ''}`, a.baslik]); },
    '#/sifre-sifirla': [null, ['#/sifre-sifirla?adim=gonderildi', 'Bağlantı gönderildi'], ['#/sifre-sifirla?adim=yeni', 'Yeni şifre'], ['#/sifre-sifirla?adim=yeni&hal=sure-doldu', 'Bağlantının süresi doldu']],
    '#/eposta-dogrula': [null, ['#/eposta-dogrula?hal=gecersiz', 'Kod geçersiz'], ['#/eposta-dogrula?hal=zaten', 'Zaten doğrulanmış']],
    '#/iki-adim': [null, ['#/iki-adim?mod=kurtarma', 'Kurtarma kodu']],
    '#/kilit': [['#/kilit?platform=ios', 'iPhone'], ['#/kilit?platform=android', 'Android'], ['#/kilit?platform=ios&hal=basarisiz', 'Tanınmadı'], ['#/kilit?platform=ios&hal=kilitlendi', 'Geçici olarak durdu']],
    '#/bugun': [null, ['#/bugun?hal=bos', 'Boş gün']],
    '#/test/:slug': () => [[`#/test/${V().testler?.detay?.slug ?? 'beslenme'}`, V().testler?.detay?.ad]],
    '#/uzman/sohbet': () => [['#/uzman/sohbet', canli('#/uzman/sohbet'), 'Diyetisyenle mesajlaşma']],
    '#/ai/kamera': () => [...(V().ai?.kamera?.modlar || []).map(m => [m.id === 'tabak' ? '#/ai/kamera' : `#/ai/kamera?mod=${m.id}`, m.ad]), ['#/ai/kamera?izin=sor', 'Kamera izni']],
    '#/ayarlar/:bolum': ['profil', 'gizlilik', 'bildirim', 'guvenlik', 'dil', 'bagli', 'veri', 'uygulama', 'dondur', 'sil'].map(b => [`#/ayarlar/${b}`]),
    '#/yasal/:slug': () => Object.keys(V().yasal?.metinler || {}).map(s => [`#/yasal/${s}`]),
    '#/cihaz/:id': () => [...(V().cihazlar?.servisler || []).map(s => [`#/cihaz/${s.id}${s.platform === 'android' ? '?platform=android' : ''}`]),
      ['#/cihaz/apple-health?adim=izin', 'Bağlanma adımları'], ['#/cihaz/apple-health?hal=koptu', 'Bağlantı koptu']],
    '#/izin/:tur': [['#/izin/saglik', 'Sağlık verisi'], ['#/izin/saglik?hal=red', 'Sağlık verisi · reddedildi'], ['#/izin/kamera', 'Kamera'], ['#/izin/bildirim', 'Bildirim'], ['#/izin/konum', 'Konum'], ['#/izin/hareket', 'Hareket']],
    '#/telefon': [
      // Ana ekran widget'ları: her widget ve boy açıkça (wg, boy, durum)
      ['#/telefon?sekme=widget&wg=kalori&boy=kucuk&durum=dolu&platform=ios&tema=acik', 'Widget · Kalori küçük'], ['#/telefon?sekme=widget&wg=kalori&boy=orta&durum=dolu&platform=ios&tema=acik', 'Widget · Kalori ve makro orta'],
      ['#/telefon?sekme=widget&wg=kalori&boy=buyuk&durum=dolu&platform=ios&tema=acik', 'Widget · Günün özeti büyük'], ['#/telefon?sekme=widget&wg=su&boy=kucuk&durum=dolu&platform=ios&tema=acik', 'Widget · Su küçük (+1 bardak)'],
      ['#/telefon?sekme=widget&wg=su&boy=orta&durum=dolu&platform=ios&tema=koyu', 'Widget · Su orta, koyu görünüm'], ['#/telefon?sekme=widget&wg=ogun&boy=orta&durum=dolu&platform=ios&tema=acik', 'Widget · Sıradaki öğün orta'],
      ['#/telefon?sekme=widget&wg=ogun&boy=buyuk&durum=dolu&platform=ios&tema=acik', 'Widget · Bugün tabağım büyük'], ['#/telefon?sekme=widget&wg=oruc&boy=orta&durum=dolu&platform=ios&tema=acik', 'Widget · Oruç orta'],
      ['#/telefon?sekme=widget&wg=diyetisyen&boy=orta&durum=dolu&platform=ios&tema=acik', 'Widget · Diyetisyen orta'], ['#/telefon?sekme=widget&wg=diyetisyen&boy=buyuk&durum=dolu&platform=ios&tema=acik', 'Widget · Diyetisyen büyük'],
      ['#/telefon?sekme=widget&wg=kalori&boy=kucuk&durum=dolu&platform=android&tema=acik', 'Widget · Android 2×2'], ['#/telefon?sekme=widget&wg=ogun&boy=orta&durum=dolu&platform=android&tema=acik', 'Widget · Android 4×2'],
      ['#/telefon?sekme=widget&wg=kalori&boy=buyuk&durum=dolu&platform=android&tema=koyu', 'Widget · Android 4×4, koyu görünüm'],
      // Widget durumları
      ['#/telefon?sekme=widget&wg=kalori&boy=orta&durum=bos&platform=ios&tema=acik', 'Widget durumu · ilk gün'], ['#/telefon?sekme=widget&wg=diyetisyen&boy=buyuk&durum=giris&platform=ios&tema=acik', 'Widget durumu · giriş yok'],
      ['#/telefon?sekme=widget&wg=su&boy=orta&durum=cevrimdisi&platform=ios&tema=acik', 'Widget durumu · çevrimdışı'], ['#/telefon?sekme=widget&wg=kalori&boy=buyuk&durum=pro&platform=ios&tema=acik', 'Widget durumu · Pro “Yakında”'],
      // Kilit ekranı ve StandBy
      ['#/telefon?sekme=kilit&gor=kilit&durum=dolu&platform=ios&tema=acik', 'Kilit ekranı widget’ları · iPhone'], ['#/telefon?sekme=kilit&gor=kilit&durum=dolu&platform=ios&tema=koyu', 'Kilit ekranı · koyu görünüm'],
      ['#/telefon?sekme=kilit&durum=dolu&platform=android&tema=acik', 'Kilit ekranı · Android'],
      ['#/telefon?sekme=kilit&gor=standby&gece=gunduz&durum=dolu&platform=ios', 'StandBy'], ['#/telefon?sekme=kilit&gor=standby&gece=gece&durum=dolu&platform=ios', 'StandBy · gece görünümü'],
      // Canlı Etkinlik / canlı bildirim
      ['#/telefon?sekme=canli&etkinlik=oruc&platform=ios&tema=acik', 'Canlı Etkinlik · oruç başlamadan (iPhone)'], ['#/telefon?sekme=canli&etkinlik=randevu&platform=ios&tema=acik', 'Canlı Etkinlik ve Dinamik Ada · görüşme'],
      ['#/telefon?sekme=canli&etkinlik=oruc&platform=android&tema=acik', 'Canlı bildirim · oruç başlamadan (Android)'], ['#/telefon?sekme=canli&etkinlik=randevu&platform=android&tema=koyu', 'Canlı bildirim · görüşme, koyu görünüm'],
      // 16 saatlik oruç akışı (karar 1): 0. saat, Canlı Etkinlik, 8. saat devri, widget'ta sayaç, hedef
      ['#/telefon?sekme=canli&etkinlik=akis&adim=0&platform=ios&tema=acik', '16 saatlik oruç · 0. saat, başlangıç'], ['#/telefon?sekme=canli&etkinlik=akis&adim=4&platform=ios&tema=acik', '16 saatlik oruç · 4. saat, Canlı Etkinlik ve Ada'],
      ['#/telefon?sekme=canli&etkinlik=akis&adim=8&platform=ios&tema=acik', '16 saatlik oruç · 8. saat, widget’a devir'], ['#/telefon?sekme=canli&etkinlik=akis&adim=12&platform=ios&tema=acik', '16 saatlik oruç · 12. saat, widget’ta sayaç'],
      ['#/telefon?sekme=canli&etkinlik=akis&adim=16&platform=ios&tema=acik', '16 saatlik oruç · 16. saat, hedef'], ['#/telefon?sekme=canli&etkinlik=akis&adim=12&platform=android&tema=acik', '16 saatlik oruç · Android, süre sınırı yok'],
      ['#/telefon?sekme=canli&etkinlik=akis&adim=4&platform=android&tema=acik', 'Canlı bildirim · oruç sürerken (Android)'],
      // Hızlı ayar
      ['#/telefon?sekme=ayar&durum=dolu&platform=ios&tema=acik', 'Denetim Merkezi · Su ekle'], ['#/telefon?sekme=ayar&durum=dolu&platform=android&tema=acik', 'Hızlı Ayarlar · Su ekle'],
      ['#/telefon?sekme=ayar&durum=giris&platform=android&tema=koyu', 'Hızlı Ayarlar · kullanılamaz'],
      // Sesli komut
      ['#/telefon?sekme=komut&platform=ios&komut=su', 'Siri · bir bardak su'], ['#/telefon?sekme=komut&platform=android&komut=ogle', 'Gemini · öğle yemeği']
    ]
  };

  // ---------- Rota çözümü ve başlık (router rotaBul ile aynı eşleme) ----------
  const rotaCoz = git => {
    const [yol, q = ''] = git.split('?'), sorgu = Object.fromEntries(new URLSearchParams(q)), T = window.DD_ROTALAR || {};
    if (T[yol]) return {desen: yol, ad: T[yol], param: {}, sorgu};
    for (const [desen, ad] of Object.entries(T)) {
      if (!desen.includes(':')) continue;
      const adlar = [], m = yol.match(new RegExp('^' + desen.replace(/:[^/]+/g, x => { adlar.push(x.slice(1)); return '([^/]+)'; }) + '$'));
      if (m) return {desen, ad, param: Object.fromEntries(adlar.map((k, i) => [k, decodeURIComponent(m[i + 1])])), sorgu};
    }
    return null;
  };
  const canli = git => {
    const r = rotaCoz(git), e = r && DD.ekranTanim(r.ad);
    if (!e) return '';
    try { const b = typeof e.baslik === 'function' ? e.baslik({ad: r.ad, param: r.param, sorgu: r.sorgu, hash: git, durum: DD.durum}) : e.baslik; return typeof b === 'string' ? b.trim() : ''; } catch { return ''; }
  };
  const kimlik = git => git.replace(/^#\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  const ornek = d => DD.durumlar?.ornek?.(d) ?? d;
  // Satır: {id, git, baslik, alt}. Parametreli desende başlık AD, ekranın kendi başlığı alt satırda.
  const satir = (git, alt, baslik, desen) => {
    const d = desen || rotaCoz(git)?.desen || '', p = d.includes(':'), c = canli(git);
    const b = baslik || (p ? AD[d] : c) || AD[d] || c || git;
    return {id: kimlik(git), git, baslik: b, alt: alt ?? (p && c && c !== b ? c : '')};
  };
  const rotaSatirlari = d => {
    const ek = typeof EK[d] === 'function' ? EK[d]() : EK[d];
    return ek ? ek.map(x => (x ? satir(x[0], x[1], x[2], d) : satir(ornek(d), undefined, undefined, d))) : [satir(ornek(d), undefined, undefined, d)];
  };
  // Durumlar bölümü: #/durumlar ile aynı liste (DD.durumlar). Bölümün rotaları (hata, güncelleme, bakım, oturum, erişim) SISTEM satırlarıyla gelir.
  const durumSatirlari = () => {
    const S = DD.durumlar || {}, hal = S.HALLER || [], ornekler = S.HAL_ORNEK || {};
    return [
      satir('#/durumlar'),
      ...hal.filter(([h]) => h && ornekler[h]).map(([h, ad]) => satir(`${ornekler[h]}?hal=${h}`, canli(ornekler[h]), ad)),
      ...(S.SISTEM || []).map(([, ad, git]) => satir(git, '', ad)),
      ...(S.OZEL || []).map(([, ad, git]) => satir(git, '', ad)),
      ...(S.PENCERE || []).map(([id, , ad]) => satir(`#/durumlar?pencere=${id}`, '', ad))
    ];
  };
  // Bütün satırlar, bölüm sırasıyla; aynı adres bir kez (ilk geçtiği yerde).
  const satirlar = () => {
    const gorulen = new Set();
    return BOLUMLER.map(([id, ad]) => ({id, ad, satirlar: (id === 'durum' ? durumSatirlari() : ESLEME[id].flatMap(rotaSatirlari)).filter(s => !gorulen.has(s.git) && gorulen.add(s.git))}));
  };
  // Eşleme denetimi: atanmamış, çift atanmış, DD_ROTALAR'da olmayan desen; atandığı bölümde satırı çıkmayan desen (satirsiz).
  const kontrol = (B = satirlar()) => {
    const T = Object.keys(window.DD_ROTALAR || {}), atanan = new Map();
    Object.entries(ESLEME).forEach(([b, l]) => l.forEach(d => atanan.set(d, [...(atanan.get(d) || []), b])));
    const satirsiz = [...atanan].filter(([d, [b]]) => !B.find(x => x.id === b)?.satirlar.some(s => rotaCoz(s.git)?.desen === d)).map(([d]) => d);
    return {rota: T.length, atanmamis: T.filter(d => !atanan.has(d) && !KENDI.includes(d)), cift: [...atanan].filter(([, b]) => b.length > 1).map(([d]) => d), fazla: [...atanan.keys()].filter(d => !T.includes(d)), satirsiz};
  };
  const dil = () => 'tr';   // Beyar: prototip TR çalışır; diller Flutter aşamasında (EN sözlükleri en-ceviri-arsiv dalında)
  const gorsel = s => `assets/katalog/${dil()}/${s.id}.webp`;
  DD.katalog = {BOLUMLER, ESLEME, AD, EK, satirlar, kontrol, kimlik};

  DD.ekran('katalog', {
    haller: false,
    tur: 'alt',
    ust: '#/profil',
    baslik: 'Ekran kataloğu',
    tabagim: false,
    ciz: () => {
      const B = satirlar(), n = B.reduce((t, b) => t + b.satirlar.length, 0), k = kontrol(B);
      if (k.atanmamis.length || k.cift.length || k.fazla.length || k.satirsiz.length) console.warn('[katalog] eşleme tablosu eksik', k);
      const ozet = `<div class="dd-yigin">
        ${DD.stat([{deger: sayi(n), etiket: 'Ekran'}, {deger: sayi(B.length), etiket: 'Bölüm'}])}
        ${DD.p('Satıra dokununca **o ekran** açılır.', {ton: 'ikincil'})}
      </div>`;
      return DD.gruplar(B.map(b => ({
        baslik: b.ad,
        eylem: {html: DD.rozet({metin: sayi(b.satirlar.length), ton: 'notr'})},
        satirlar: b.satirlar.map(s => ({sol: DD.ekranKucuk({src: gorsel(s), ad: s.baslik}), baslik: s.baslik, alt: s.alt, git: s.git}))
      })), {bas: ozet});
    },
  });
})();
