/* Hesaplayıcılar: #/hesaplayicilar (liste) ve #/hesaplayici/:slug (form + sonuç). Web karşılığı: hesaplayicilar/ (liste, amaç sekmeleri, Son Sonuçların,
 * Rakamdan Tabağa Geç) ve hesaplayici/gunluk-kalori/ (public-araclar-kalori.js: form, sonuç, hedef seçimi, Hedefimi belirle).
 * Gastro kalıbı (ayarlar.js, dolabim.js): DD.gruplar; form alanları DD.input / DD.alan + DD.stepper, DD.segment, DD.secimler, DD.takvimAlan;
 *   alan hatası alanın altında; Sıfırla grup başlığında metin düğmesi, alt çubukta tek birincil Hesapla; sonuç aynı ekranda formun üstünde.
 * Veri DDV.kutuphane.hesaplayicilar (10) ve hesapAmaclari (4); formül sabitleri her kaydın `ayar` alanından okunur.
 * Formüller ve sınıflar web ile birebir (DadaDiet app/Hesaplayici/Stratejiler + resources/lang/tr/arayuz_hesaplayicilar_tek.php), K164/K166 onaylı
 *   katsayılarla (dadadiet-prototip tasks/backend-birlestirme/olcum/deploy7/KATSAYI-ONAY.md): BMH Mifflin-St Jeor; Günlük kalori BMH × katsayı sonra
 *   yuvarlanır, ±500, alt 1.400 kcal; vücut yağı ABD Donanması (Hodgdon-Beckett 1984) + ACE bantları; BKİ WHO; bel/kalça WHO 2008; makro ACSM 2016.
 * Üye: alanlar profilden gelir (DDV.kullanici + DD.durum 'plan', kilo ve bel Sağlık dosyam'daki son ölçüm); misafir ve planı olmayan yeni hesap varsayılanla başlar,
 *   cinsiyet ve aktivite seçilmeden hesaplanmaz. "Hedefime uygula" plana yazmaz: toast + #/tercihler; misafirde üye ol duvarı.
 * Liste Gastro liste-v2 (ekranlar/besinler.js, ipuclari.js kalıbı): kubbe + liste aracı (arama, filtre, amaç çip şeridi), durum satırı (sıralama, görünüm),
 *   eylem kartı listesi ya da parçalı ızgara, üyede Son sonuçların, altta Rakamdan tabağa geç ve genel bilgi notu.
 * Durum: 'hesap-sonuc' {slug: {girdi, sonuc, tarih}} her hesaplayıcının son hesabı (formu da bu girdiyle açar); 'hesaplayicilar-liste' {q, gorunum, sira, f:{amac[], girdi[]}}.
 * ?amac=enerji, ?q=metin, ?temiz=1 listeyi süzer; ?hal=hata bağlantı hatası; bilinmeyen slug bulunamadı ekranı. */
(() => {
  const L = () => DDV.kutuphane;
  const bul = slug => L().hesaplayiciBul(slug);
  const ANAHTAR = 'hesap-sonuc';
  // Sürüm 3: K164/K166 web eşitliği + bel/kalça Düşük/Orta/Yüksek (sınıf kümeleri değişti); eski biçimdeki kayıt okunmaz, hesaplayıcı boş açılır.
  const SURUM = 3;
  const kayitlar = () => Object.fromEntries(Object.entries(DD.durum.oku(ANAHTAR, {}) || {}).filter(([, x]) => x?.surum === SURUM));
  const kayit = slug => kayitlar()[slug] || null;
  const kayitYaz = (slug, x) => DD.durum.yaz(ANAHTAR, {...kayitlar(), [slug]: x});
  const kayitSil = slug => { const {[slug]: _, ...kalan} = kayitlar(); DD.durum.yaz(ANAHTAR, kalan); };
  const sayi = n => DD.sayi(Math.round(n));
  const ond = (n, b = 1) => DD.ondalik(n, b);
  const kcal = n => `${sayi(n)} kcal`;
  const iki = n => (+n).toFixed(2).replace('.', ','); // oran gösterimi: 0,80
  const bir = n => (+n).toFixed(1).replace('.', ','); // web $nf(x, 1): 25,0

  // ---------- Profil ----------
  // Okuma ekranlar/tercihler.js ile aynı: plan üstüne son ölçüm. Misafir ve planı olmayan yeni hesapta profil yok.
  const sonOlcum = alan => DD.durum.oku(`${DD.yeniHesap() ? 'yeni-' : ''}saglik-olcumler`, []).filter(o => o[alan] != null).sort((x, y) => x.tarih.localeCompare(y.tarih)).pop()?.[alan];
  const profil = () => {
    if (!DD.uye()) return null;
    const p = DD.durum.oku('plan', null);
    if (DD.yeniHesap() && !p) return null;
    const k = {...(DD.yeniHesap() ? {} : DDV.kullanici), ...(p || {})};
    const kilo = sonOlcum('kiloKg'), bel = sonOlcum('belCm') ?? (DD.yeniHesap() ? null : DDV.saglik?.ozet?.belCm);
    return {...k, ...(kilo != null ? {kiloKg: kilo} : {}), belCm: bel ?? null};
  };
  const obAktivite = id => DDV.onboarding.adimlar.find(a => a.id === 'aktivite')?.secenekler.find(s => s.id === id);

  // ---------- Alanlar ----------
  // Web formundaki seçenekler (hesaplayici/gunluk-kalori aktivite listesi). Katsayılar hesaplayicilar.json enum'u.
  const AKTIVITE = [
    {k: 1.2, ad: 'Hareketsiz', alt: 'Masa başı, egzersiz yok'},
    {k: 1.375, ad: 'Az aktif', alt: 'Haftada 1-3 gün düşük yoğunluklu egzersiz'},
    {k: 1.55, ad: 'Orta aktif', alt: 'Haftada 3-5 gün egzersiz'},
    {k: 1.725, ad: 'Çok aktif', alt: 'Haftada 6-7 gün yoğun egzersiz'},
    {k: 1.9, ad: 'Atlet', alt: 'Günde çift antrenman ya da ağır fiziksel iş'}
  ];
  const MAKRO_HEDEF = {'kilo-vermek': 'form', sikilasmak: 'form', 'kas-kazanmak': 'kas'};
  const MAKRO_AKT = {hareketsiz: 'dusuk', hafif: 'dusuk', orta: 'orta', cok: 'yuksek'};
  const TEMPO_HIZ = {yavas: '0.25', dengeli: '0.25', hizli: '0.5'};
  // Form alanları Gastro form kalıbıyla (ayarlar.js, dolabim.js): sayı DD.input (Gastro alan), kişi sayısı DD.stepper (adımlayıcı),
  // kısa seçim DD.segment, kartlı seçim DD.secimler, tarih DD.takvimAlan; girdi olmayan kontrol DD.alan etiketiyle. Hata alanın altında (Gastro alanHata).
  const ALAN = {
    cinsiyet: {etiket: 'Cinsiyet', tur: 'cinsiyet', p: k => k.cinsiyet},
    boy_cm: {etiket: 'Boy', tur: 'sayi', birim: 'cm', p: k => k.boyCm},
    kilo_kg: {etiket: 'Kilo', tur: 'sayi', birim: 'kg', p: k => k.kiloKg},
    mevcut_kilo_kg: {etiket: 'Şu anki kilon', tur: 'sayi', birim: 'kg', p: k => k.kiloKg},
    hedef_kilo_kg: {etiket: 'Hedef kilon', tur: 'sayi', birim: 'kg', p: k => k.hedefKiloKg},
    yas: {etiket: 'Yaş', tur: 'sayi', birim: 'yaş', p: k => k.yas},
    bel_cm: {etiket: 'Bel çevresi', yardim: 'Göbek hizasından, nefes verirken ölç.', tur: 'sayi', birim: 'cm', p: k => k.belCm},
    kalca_cm: {etiket: 'Kalça çevresi', yardim: 'Kalçanın en geniş yerinden ölç.', tur: 'sayi', birim: 'cm'},
    boyun_cm: {etiket: 'Boyun çevresi', yardim: 'Gırtlağın hemen altından ölç.', tur: 'sayi', birim: 'cm'},
    aktivite_katsayisi: {etiket: 'Aktivite düzeyi', tur: 'aktivite', p: k => obAktivite(k.aktivite)?.katsayi},
    egzersiz_saat: {etiket: 'Günlük egzersiz', tur: 'sec', v: '0', ogeler: [['0', 'Egzersiz yok'], ['0.5', 'Yarım saat'], ['1', '1 saat'], ['1.5', '1,5 saat'], ['2', '2 saat ve üzeri']]},
    yogunluk_ml_saat: {etiket: 'Egzersiz yoğunluğu', tur: 'sec', v: '350', ogeler: [['350', 'Düşük yoğunluk (+350 ml/saat)'], ['500', 'Yoğun (+500 ml/saat)']]},
    hiz_kg_hafta: {etiket: 'Haftalık hız', yardim: 'Haftada vücut ağırlığının %1’ini aşan hızlar kas kaybını ve yeniden kilo alma riskini artırır.', tur: 'sec', v: '0.5', ogeler: [['0.25', 'Çok yavaş — haftada 0,25 kg'], ['0.5', 'Önerilen — haftada 0,5 kg'], ['0.75', 'Hızlı — haftada 0,75 kg'], ['1', 'Çok hızlı — haftada 1 kg']], p: k => TEMPO_HIZ[k.tempo]},
    baslangic_tarihi: {etiket: 'Başlangıç tarihi', tur: 'tarih'},
    hedef: {etiket: 'Hedef', tur: 'segment', v: 'koru', ogeler: [['koru', 'Koru'], ['form', 'Form-tut'], ['kas', 'Kas-odak']], p: k => MAKRO_HEDEF[k.hedef] || 'koru'},
    aktivite: {etiket: 'Aktivite düzeyi', tur: 'kart', v: 'orta', ogeler: [['dusuk', 'Düşük', 'Hafif hareket ya da günde 1 saatten az egzersiz'], ['orta', 'Orta', 'Günde yaklaşık 1 saat orta tempolu egzersiz'], ['yuksek', 'Yüksek', 'Günde 1–3 saat orta-yüksek tempolu antrenman']], p: k => MAKRO_AKT[k.aktivite]},
    tarif_kisi: {etiket: 'Tarif kaç kişilik?', tur: 'stepper', birim: 'kişi', v: 4},
    hedef_kisi: {etiket: 'Kaç kişilik yapacaksın?', tur: 'stepper', birim: 'kişi', v: 2},
    porsiyon_carpani: {etiket: 'Porsiyon boyutu', tur: 'segment', v: '1', ogeler: [['0.85', 'Düşük yoğunluk'], ['1', 'Normal'], ['1.2', 'Doyurucu']]},
    ornek_miktar: {etiket: 'Malzeme miktarı (isteğe bağlı)', yardim: 'Tarifteki bir malzemenin gramını yaz; yeni miktarı sonuçta görürsün.', tur: 'sayi', birim: 'g', yer: ''}
  };
  const sayiOku = v => { const t = String(v ?? '').trim().replace(',', '.'); return t === '' || Number.isNaN(+t) ? null : +t; };
  const sayiYaz = v => (v == null || v === '' ? '' : String(v).replace('.', ','));
  // Vücut yağ oranında kalça yalnız kadında sorulur (web formülü); erkekte alan çizilmez.
  const gorunen = (h, s) => Object.keys(h.girdiler).filter(ad => ALAN[ad] && !(ad === 'kalca_cm' && h.slug === 'vucut-yag-orani' && s.cinsiyet === 'erkek'));
  const zorunlu = (h, ad, s) => !!h.girdiler[ad].zorunlu || (ad === 'kalca_cm' && s.cinsiyet === 'kadin');
  // Başlangıç değerleri: son hesap > profil > varsayılan. Misafirde sayı alanları boş (web formu gibi), seçimler varsayılanda.
  const ilkDegerler = h => {
    const son = kayit(h.slug)?.girdi, k = profil(), s = {};
    Object.keys(h.girdiler).forEach(ad => {
      const a = ALAN[ad];
      if (!a) return;
      let v = son?.[ad] ?? (k && a.p ? a.p(k) : null) ?? a.v ?? null;
      if (a.tur === 'tarih') v = son?.[ad] || DD.bugunIso();
      if (a.tur === 'sayi') v = sayiYaz(v);
      if (v != null && ['segment', 'aktivite', 'sec', 'kart'].includes(a.tur)) v = String(v);
      s[ad] = v;
    });
    return s;
  };
  // Taslak: hesaplanmamış girdiler ve alan hataları yeniden çizimde kalır; ekran üstten çekilince ya da Sıfırla'da silinir.
  let T = {slug: null, s: null, hata: {}};
  const taslak = h => { if (T.slug !== h.slug) T = {slug: h.slug, s: ilkDegerler(h), hata: {}}; return T; };
  const taslakSil = () => { T = {slug: null, s: null, hata: {}}; };
  // Doğrulama web formuyla aynı metinler: "Boy 100 ile 250 arasında olmalı.", "Cinsiyet seç.", "Aktivite düzeyini seç."
  const dogrula = (h, s) => {
    const hata = {}, g = {};
    gorunen(h, s).forEach(ad => {
      const a = ALAN[ad], d = h.girdiler[ad];
      if (a.tur === 'sayi') {
        const n = sayiOku(s[ad]);
        if (n == null && !zorunlu(h, ad, s)) { g[ad] = null; return; }
        if (n == null || n < d.min || n > d.max) hata[ad] = `${a.etiket.replace(/ \(.*\)$/, '')} ${DD.sayi(d.min)} ile ${DD.sayi(d.max)} arasında olmalı.`;
        g[ad] = n;
      } else if (a.tur === 'stepper') g[ad] = +s[ad];
      else if ((a.tur === 'cinsiyet' || a.tur === 'aktivite') && !s[ad]) hata[ad] = a.tur === 'cinsiyet' ? 'Cinsiyet seç.' : 'Aktivite düzeyini seç.';
      else g[ad] = s[ad];
    });
    return {hata, g};
  };

  const alanHtml = (h, ad, t) => {
    const a = ALAN[ad], g = h.girdiler[ad], n = `h-${ad}`, s = t.s, hata = t.hata[ad], z = zorunlu(h, ad, s);
    if (a.tur === 'sayi') return DD.input({ad: n, etiket: a.etiket, deger: s[ad], birim: a.birim, mod: 'decimal', yer: a.yer ?? `${DD.sayi(g.min)}–${DD.sayi(g.max)}`, zorunlu: z, hata, yardim: a.yardim});
    if (a.tur === 'stepper') return DD.alan({etiket: a.etiket, zorunlu: z, html: DD.stepper({ad: n, deger: s[ad], min: g.min, max: g.max, birim: a.birim, aria: a.etiket})});
    if (a.tur === 'cinsiyet') return DD.alan({etiket: a.etiket, zorunlu: z, hata, html: DD.secimler({ad: n, duzen: 'iki', secili: s[ad] ?? [], ogeler: [{id: 'kadin', ad: 'Kadın', ikon: 'venus'}, {id: 'erkek', ad: 'Erkek', ikon: 'mars'}]})});
    if (a.tur === 'aktivite') return DD.alan({etiket: a.etiket, zorunlu: z, hata, html: DD.secimler({ad: n, secili: s[ad] ?? [], ogeler: AKTIVITE.map(x => ({id: String(x.k), ad: x.ad, alt: `${x.alt} · ×${DD.ondalik(x.k, String(x.k).split('.')[1]?.length || 0)}`}))})});
    if (a.tur === 'sec') return DD.secAlan({ad: n, etiket: a.etiket, secenekler: a.ogeler, deger: s[ad], yardim: a.yardim});
    if (a.tur === 'kart') return DD.alan({etiket: a.etiket, html: DD.secimler({ad: n, secili: s[ad], ogeler: a.ogeler.map(([id, ad_, alt]) => ({id, ad: ad_, alt}))})});
    if (a.tur === 'segment') return DD.alan({etiket: a.etiket, yardim: a.yardim, html: DD.segment({ad: n, etiket: a.etiket, secili: s[ad], ogeler: a.ogeler.map(([deger, ad_]) => ({ad: ad_, deger}))})});
    if (a.tur === 'tarih') return DD.takvimAlan({ad: n, etiket: a.etiket, deger: s[ad], min: DD.bugunIso(), hizli: [['Bugün', 0]], yardim: 'Tahmini varış bu günden sayılır.'});
    return '';
  };

  // ---------- Hesaplar ----------
  // Web (DadaDiet app/Hesaplayici/Stratejiler) ile birebir: yuvarlama yeri, sınır eşitliği, sınıf kümesi ve hata durumları aynı.
  // Değişen katsayılar K164/K166 kararlarıyla (KATSAYI-ONAY.md): vücut tipi WHO 2008, makro karbonhidrat ACSM 2016; değerler veri/kutuphane.js ayarından.
  // Her işlev {sonuc} ya da {hata} döner; sonuç alanları hesaplayicilar.json `sonuclar` adlarıyla aynıdır.
  const yuvarla = (n, b = 1) => Math.round(n * 10 ** b) / 10 ** b;
  const gunEkle = (iso, gun) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + gun); return d.toISOString().slice(0, 10); };
  const tarihMetin = iso => new Date(`${iso}T12:00:00Z`).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
  const cinsiyetGerek = g => (!g.cinsiyet ? {hata: 'Hesaplamak için **cinsiyetini** seç'} : null);
  const bmhHam = (h, g) => 10 * g.kilo_kg + 6.25 * g.boy_cm - 5 * g.yas + h.ayar.cinsiyet_ekleri[g.cinsiyet];
  const EN_DUSUK = 1400, EN_DUSUK_YAS = 18;
  const ANLAMSIZ = 'Girilen ölçülerle **anlamlı bir sonuç** hesaplanamıyor.';
  const HESAP = {
    'bazal-metabolizma': (h, g) => cinsiyetGerek(g) || {sonuc: {bmh_kcal: Math.round(bmhHam(h, g))}},
    // Web: ham BKİ ile sınıflar, gösterim 1 hane.
    'beden-kutle-endeksi': (h, g) => {
      const ham = g.kilo_kg / (g.boy_cm / 100) ** 2, i = h.ayar.kategori_esikleri.findIndex(e => ham < e);
      return {sonuc: {bki: yuvarla(ham), kategori: h.ayar.kategoriler[i < 0 ? h.ayar.kategoriler.length - 1 : i]}};
    },
    // Web: BMH × katsayı sonra yuvarlanır; kilo verme bandı 1.400 kcal tabanının altına inmez.
    'gunluk-kalori': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      if (!g.aktivite_katsayisi) return {hata: 'Hesaplamak için **aktivite düzeyini** seç'};
      if (g.yas < EN_DUSUK_YAS) return {hata: 'Bu araç **yetişkinler içindir**; çocuk ve ergen beslenmesinde hekim ve diyetisyen kontrolü zorunludur.'};
      const tdee = Math.round(bmhHam(h, g) * +g.aktivite_katsayisi), bant = h.ayar.band_farki_kcal;
      return {sonuc: {tdee_kcal: tdee, kilo_ver_kcal: Math.max(tdee - bant, EN_DUSUK), kilo_al_kcal: tdee + bant}};
    },
    // WHO 2008 (K164/K166): sınıf kümesi cinsiyete göre, kural "ham oran < üst sınır"; sınır değeri bir üst sınıfa girer.
    'vucut-tipi': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const ham = g.bel_cm / g.kalca_cm, l = h.ayar.siniflar[g.cinsiyet];
      return {sonuc: {oran: yuvarla(ham, 2), tip: (l.find(x => x.ust != null && ham < x.ust) || l[l.length - 1]).tip}};
    },
    // ABD Donanması (Hodgdon-Beckett 1984) metrik denklemi, web ile aynı katsayılar; ACE bantları, web sınıf adları.
    'vucut-yag-orani': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const erkek = g.cinsiyet === 'erkek';
      if (!erkek && !(g.kalca_cm > 0)) return {hata: 'Kadın cinsiyeti için **kalça çevresi** zorunludur.'};
      const fark = erkek ? g.bel_cm - g.boyun_cm : g.bel_cm + g.kalca_cm - g.boyun_cm;
      if (fark <= 0) return {hata: ANLAMSIZ};
      const ham = erkek ? 495 / (1.0324 - 0.19077 * Math.log10(fark) + 0.15456 * Math.log10(g.boy_cm)) - 450 : 495 / (1.29579 - 0.35004 * Math.log10(fark) + 0.22100 * Math.log10(g.boy_cm)) - 450;
      if (!Number.isFinite(ham) || ham <= 0 || ham >= 70) return {hata: ANLAMSIZ};
      const pct = yuvarla(ham), b = h.ayar.bantlar[g.cinsiyet], p = b.p;
      const sinif = pct < p[0] ? 'cok_dusuk' : pct < p[1] ? 'atletik' : pct < p[2] ? 'fit' : pct < p[3] ? 'saglikli' : 'saglikli_ustu';
      return {sonuc: {yag_orani_pct: pct, siniflandirma: sinif, hedef_ust_sinir_pct: b.hedef, ...(g.kilo_kg > 0 ? {yag_kutlesi_kg: yuvarla(g.kilo_kg * pct / 100), yagsiz_kutle_kg: yuvarla(g.kilo_kg * (100 - pct) / 100)} : {})}};
    },
    'gunluk-su': (h, g) => {
      const ham = h.ayar.ml_per_kg * g.kilo_kg + +g.egzersiz_saat * +g.yogunluk_ml_saat, asti = ham > h.ayar.ust_sinir_ml, ml = asti ? h.ayar.ust_sinir_ml : ham;
      return {sonuc: {su_ml: Math.round(ml), su_litre: yuvarla(ml / 1000), ust_sinir_asildi: asti ? 1 : 0}};
    },
    // Web: Devine farkı 152 cm altında da uygulanır (kırpılmaz).
    'ideal-kilo': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const a = h.ayar, m2 = (g.boy_cm / 100) ** 2;
      return {sonuc: {ideal_kilo_kg: yuvarla(a.taban_kg[g.cinsiyet] + a.inch_basina_kg * (g.boy_cm / 2.54 - a.inch_esigi)), alt_sinir_kg: yuvarla(a.bki_alt * m2), ust_sinir_kg: yuvarla(a.bki_ust * m2)}};
    },
    // Web: beş sınıf (hedefte, kilo alma, riskli, sürdürülebilir, makul tempolu); günlük fark 10'a yuvarlanır; tarih = başlangıç + ⌈hafta × 7⌉ gün.
    'hedef-kilo-suresi': (h, g) => {
      const a = h.ayar, bas = g.baslangic_tarihi || DD.bugunIso(), hiz = +g.hiz_kg_hafta, fark = yuvarla(Math.abs(g.mevcut_kilo_kg - g.hedef_kilo_kg));
      if (g.mevcut_kilo_kg === g.hedef_kilo_kg) return {sonuc: {fark_kg: 0, hafta_tam: 0, gunluk_kcal_farki: 0, tahmini_tarih: bas, kategori: 'hedefte', yon: 'ver'}};
      const hafta = fark / hiz, alma = g.hedef_kilo_kg > g.mevcut_kilo_kg;
      const kategori = alma ? 'kilo_alma' : hiz > g.mevcut_kilo_kg * a.risk_esik_orani ? 'riskli' : hiz <= a.surdurulebilir_ust_sinir ? 'surdurulebilir' : 'makul_tempolu';
      return {sonuc: {fark_kg: fark, hafta_tam: Math.ceil(hafta), gunluk_kcal_farki: Math.round(hiz * a.kg_basina_kcal / 7 / 10) * 10, tahmini_tarih: gunEkle(bas, Math.ceil(hafta * 7)), kategori, yon: alma ? 'al' : 'ver'}};
    },
    'makro-dagilim': (h, g) => {
      const a = h.ayar, P = Math.round(g.kilo_kg * (a.protein_gkg[g.hedef] + a.protein_aktivite_eki[g.aktivite])), Y = Math.round(g.kilo_kg * a.yag_gkg[g.hedef]), K = Math.round(g.kilo_kg * (a.karb_aktivite_gkg[g.aktivite] + a.karb_hedef_eki[g.hedef]));
      return {sonuc: {protein_g: P, karbonhidrat_g: K, yag_g: Y}};
    },
    // Web: çarpan 2 hane, örnek miktar 1 hane.
    'porsiyon-hesaplama': (h, g) => {
      const carpan = Math.round(g.hedef_kisi / g.tarif_kisi * +g.porsiyon_carpani * 100) / 100;
      return {sonuc: {carpan, ornek_sonuc: g.ornek_miktar > 0 ? Math.round(g.ornek_miktar * carpan * 10) / 10 : null}};
    }
  };

  // ---------- Sonuç ----------
  // Sınıf adları ve açıklamaları web dil dosyasından (DadaDiet resources/lang/tr/arayuz_hesaplayicilar_tek.php, BkiStratejisi bantları); kalın vurgu eklendi.
  const BKI_AD = {zayif: 'Zayıf', normal: 'Normal', fazla_kilolu: 'Fazla kilolu', obezite_1: 'Obezite sınıf I', obezite_2: 'Obezite sınıf II', obezite_3: 'Obezite sınıf III'};
  // Bel/kalça sınıfları Beyar kararıyla (10 Kasım, web'den önde): erkek < 0,90 Düşük, ≥ 0,90 Yüksek; kadın < 0,80 Düşük, < 0,85 Orta, ≥ 0,85 Yüksek.
  const TIP = {
    dusuk: ['Düşük', 'Bel/kalça oranın **düşük** aralıkta; yağın daha çok kalça çevresinde ya da dengeli dağılıyor.'],
    orta: ['Orta', 'Bel/kalça oranın **orta** aralıkta; yağın bel ve kalça arasında dağılıyor. Bel çevreni zaman zaman ölçmek değişimi görmeni sağlar.'],
    yuksek: ['Yüksek', 'Bel/kalça oranın **yüksek** aralıkta; yağın daha çok karın ve bel bölgesinde toplanıyor. Dengeli beslenme ve düzenli hareket bu bölgeyi destekler.']
  };
  const YAG = {
    cok_dusuk: ['Çok düşük', 'Yağ oranın **yaşamsal işlevler için gereken eşiğin altında** görünüyor. Bu tabloda hormonal düzen, bağışıklık ve kemik sağlığı zorlanabilir; bir hekime danışmadan daha fazla düşürmeye çalışma.'],
    atletik: ['Atletik aralık', 'Yağ oranın **düzenli antrenman yapan kişilerin bandında**. Bu seviyeyi korumak yeterli protein, yeterli uyku ve toparlanma süresi ister; enerji alımını fazla kısma.'],
    fit: ['Fit aralık', 'Yağ oranın sağlıklının da üstünde, **fit kabul edilen bantta**. Mevcut düzenin işe yarıyor; öğün düzenini ve hareketi sürdürmen yeterli.'],
    saglikli: ['Sağlıklı aralık', 'Yağ oranın **sağlıklı kabul edilen bandın içinde**. Bu aralığı korumak için protein alımını ve düzenli hareketi sürdürmen yeterli.'],
    saglikli_ustu: ['Sağlıklı bandın üstünde', 'Yağ oranın **sağlıklı kabul edilen bandın üstünde**. Haftada 0,25-0,5 kg gibi ölçülü bir kayıp hedefi, yeterli protein ve düzenli hareket bu tabloyu en sürdürülebilir şekilde değiştirir.']
  };
  const HK = {
    hedefte: ['Zaten hedefindesin', 'Mevcut kilon **hedefinle aynı**. Bundan sonrası korumak: günlük kalori ihtiyacın kadar yemek ve düzenli hareket yeterli.'],
    kilo_alma: ['Kilo alma yönünde', 'Hedefin mevcut kilonun üstünde, yani **günlük ihtiyacının üzerine** çıkman gerekiyor. Fazlalığı şekerden değil, kaliteli protein ve yağ kaynaklarından almak kas kazanımı için önemlidir.'],
    riskli: ['Bu hız senin için yüksek', 'Seçtiğin hız, vücut ağırlığının **haftalık %1 sınırının** üstünde. Bu tempoda kaybın önemli bir kısmı kastan ve sudan gelir, verilen kilo da daha kolay geri alınır. Daha yavaş bir hız seçmeyi ya da bir diyetisyene danışmayı düşün.'],
    surdurulebilir: ['Sürdürülebilir hız', 'Seçtiğin hız vücut ağırlığına göre **makul aralıkta**. Bu tempoda kaybın büyük bölümü yağdan gelir ve verdiğin kiloyu korumak daha kolay olur.'],
    makul_tempolu: ['Makul ama tempolu', 'Bu hız **sınırın içinde ama iddialı**. Protein alımını yüksek tutmak ve haftada birkaç gün direnç çalışması eklemek kas kaybını azaltır.']
  };
  const HEDEF_TUR = [['ver', 'Kilo vermek'], ['koru', 'Korumak'], ['al', 'Kilo almak']];
  const hedefTuruIlk = r => r.hedef_turu || ({'kilo-vermek': 'ver', 'kas-kazanmak': 'al'}[profil()?.hedef] ?? 'koru');
  const hedefKcal = (r, tur) => ({ver: r.kilo_ver_kcal, koru: r.tdee_kcal, al: r.kilo_al_kcal}[tur]);
  // Listede "Son sonuçların" satırı ve toast için tek satırlık özet.
  const OZET = {
    'bazal-metabolizma': r => `${kcal(r.bmh_kcal)} / gün`,
    'beden-kutle-endeksi': r => `${bir(r.bki)} · ${BKI_AD[r.kategori]}`,
    'gunluk-kalori': r => `${kcal(r.tdee_kcal)} / gün`,
    'vucut-tipi': r => `${iki(r.oran)} · ${TIP[r.tip][0]}`,
    'vucut-yag-orani': r => `%${ond(r.yag_orani_pct)} · ${YAG[r.siniflandirma][0]}`,
    'gunluk-su': r => `${ond(r.su_litre)} L / gün`,
    'ideal-kilo': r => `${bir(r.ideal_kilo_kg)} kg`,
    'hedef-kilo-suresi': r => `${r.hafta_tam} hafta · ${HK[r.kategori][0]}`,
    'makro-dagilim': r => `P ${r.protein_g} · K ${r.karbonhidrat_g} · Y ${r.yag_g} g`,
    'porsiyon-hesaplama': r => `×${ond(r.carpan, 2)} çarpan`
  };
  const uygulaBtn = metin => (DD.uye()
    ? DD.btn({metin: 'Hedefime uygula', ikon: 'hedef', tam: true, veri: {eylem: 'hedefe-uygula', id: metin}})
    : DD.btn({metin: 'Hedefime uygula', ikon: 'hedef', tam: true, veri: {'uye-ol': 'Sonucunu **hedefine uygulamak** ve değişimini izlemek için ücretsiz profil oluştur.'}}));
  const gitBtn = (metin, ikon, git) => DD.btn({metin, ikon, tur: 'secondary', tam: true, git});
  const iyiTon = iyi => (iyi ? 'iyi' : 'uyari');
  // Web sonuç kartlarında olmayan ek gösterimler (BKİ kg aralığı, BMH, su egzersiz eki, makro toplam kcal, vücut tipi sınırları) yok (KATSAYI-ONAY madde 13).
  const SONUC = {
    'bazal-metabolizma': r => ({
      kart: {etiket: 'Bazal metabolizma', deger: sayi(r.bmh_kcal), birim: 'kcal / gün'},
      metin: `Vücudun tam dinlenirken, yalnız **temel işlevlerini** sürdürmek için günde yaklaşık ${kcal(r.bmh_kcal)} harcar. Gün içindeki hareketin bu sayının üstüne eklenir.`,
      eylemler: [gitBtn('Günlük kaloriyi hesapla', 'utensils', '#/hesaplayici/gunluk-kalori')]
    }),
    'beden-kutle-endeksi': (r, g, h) => {
      const e = h.ayar.kategori_esikleri;
      return {
        kart: {etiket: 'Beden kütle endeksi', deger: bir(r.bki), birim: 'kg/m²', degisim: BKI_AD[r.kategori], degisimTon: iyiTon(r.kategori === 'normal')},
        // Web sonuç kartındaki sınıf ölçeği (bki.blade.php alan-yardim) satır satır bilgi kutusunda.
        ek: DD.bilgi({etiket: 'Sınıflandırma ölçeği', ikon: 'chart-simple', html: [`**Zayıf:** ${bir(e[0])} altı`, `**Normal:** ${bir(e[1])} altı`, `**Fazla Kilolu:** ${bir(e[2])} altı`, `**Obez:** ${bir(e[2])} ve üstü`].map(metin => DD.madde({metin, tur: 'notr'})).join('')}),
        metin: 'BKİ **yalnızca boy ve kiloyu** kullanır; aktivite kalori hesaplayıcıda devreye girer.',
        eylemler: [gitBtn('Vücut yağ oranına bak', 'percent', '#/hesaplayici/vucut-yag-orani')]
      };
    },
    'gunluk-kalori': (r, g, h) => {
      const tur = hedefTuruIlk(r), ak = AKTIVITE.find(x => String(x.k) === String(g.aktivite_katsayisi)), bant = h.ayar.band_farki_kcal, verBandi = r.kilo_ver_kcal < r.tdee_kcal;
      return {
        kart: {etiket: 'Mevcut kilonu korumak için', deger: sayi(r.tdee_kcal), birim: 'kcal / gün', degisim: ak?.ad, degisimTon: 'iyi'},
        serit: [{ikon: 'arrow-down', etiket: verBandi ? 'Kilo vermek için' : 'Kilo ver — diyetisyene danış', deger: verBandi ? sayi(r.kilo_ver_kcal) : '—', birim: verBandi ? 'kcal' : ''}, {ikon: 'arrow-up', etiket: 'Kilo almak için', deger: sayi(r.kilo_al_kcal), birim: 'kcal'}],
        metin: `Bu değer, seçtiğin aktivite düzeyinde gün içinde harcadığın **toplam enerjidir**. Hedefine göre alttaki bandlardan birini referans al; günlük ±${sayi(bant)} kcal, haftada yaklaşık yarım kilo değişime denk gelir.`,
        ek: `${DD.alan({etiket: 'Hedefin ne?', html: DD.segment({ad: 'h-hedef-turu', etiket: 'Hedefin ne?', secili: tur, ogeler: HEDEF_TUR.map(([deger, ad]) => ({ad, deger}))})})}${DD.satirlar([{ikon: 'hedef', baslik: 'Günlük kalori hedefin', deger: kcal(hedefKcal(r, tur))}])}`,
        bant: verBandi && r.tdee_kcal - r.kilo_ver_kcal < bant && {ton: 'uyari', metin: `Yetişkin için en düşük enerji düzeyi **${sayi(EN_DUSUK)} kcal** olarak gösterildi (TÜBER 2022, Ek 3.1.1).`},
        eylemler: [uygulaBtn('kalori'), gitBtn('Uygun programları gör', 'program', '#/programlar')]
      };
    },
    'vucut-tipi': r => ({
      kart: {etiket: 'Bel / kalça oranı', deger: iki(r.oran), degisim: TIP[r.tip][0], degisimTon: iyiTon(r.tip !== 'yuksek')},
      metin: `${TIP[r.tip][1]} Yağ dağılımı büyük ölçüde genetiktir ve tek başına bir sağlık göstergesi değildir. Sebze-lif ağırlıklı, dengeli öğünler ve düzenli hareket genel dengeyi destekler.`,
      eylemler: [gitBtn(DD.uye() ? 'Sağlık dosyama git' : 'Vücut yağ oranına bak', DD.uye() ? 'file-medical' : 'percent', DD.uye() ? '#/saglik' : '#/hesaplayici/vucut-yag-orani')]
    }),
    'vucut-yag-orani': r => ({
      kart: {etiket: 'Vücut yağ oranı', deger: `%${ond(r.yag_orani_pct)}`, degisim: YAG[r.siniflandirma][0], degisimTon: iyiTon(!['cok_dusuk', 'saglikli_ustu'].includes(r.siniflandirma))},
      serit: [{ikon: 'droplet', etiket: 'Yağ kütlesi', deger: r.yag_kutlesi_kg != null ? ond(r.yag_kutlesi_kg) : '—', birim: r.yag_kutlesi_kg != null ? 'kg' : ''}, {ikon: 'dumbbell', etiket: 'Yağsız kütle', deger: r.yagsiz_kutle_kg != null ? ond(r.yagsiz_kutle_kg) : '—', birim: r.yagsiz_kutle_kg != null ? 'kg' : ''}, {ikon: 'hedef', etiket: 'Sağlıklı üst sınır', deger: `%${r.hedef_ust_sinir_pct}`}],
      metin: YAG[r.siniflandirma][1],
      bant: r.yag_kutlesi_kg == null && {ton: 'bilgi', metin: 'Yağ ve yağsız kütle kilogram karşılığı için **kilonu da gir**.'},
      eylemler: [gitBtn('İdeal kilona bak', 'scale-balanced', '#/hesaplayici/ideal-kilo')]
    }),
    'gunluk-su': r => ({
      kart: {etiket: 'Günlük su ihtiyacın', deger: bir(r.su_litre), birim: 'litre/gün', degisim: `≈ ${Math.round(r.su_ml / DD.SU_BARDAK)} bardak (200 ml)`, degisimTon: 'iyi'},
      serit: [{ikon: 'droplet', etiket: 'Günlük toplam', deger: sayi(r.su_ml), birim: 'ml'}, {ikon: 'glass-water', etiket: 'Bardak (200 ml)', deger: `≈ ${Math.round(r.su_ml / DD.SU_BARDAK)}`}],
      metin: 'Bu, kilona göre **günlük taban su ihtiyacın**. Gün içine yay: güne 1-2 bardakla başla, her öğünde ve öğün aralarında birer bardak iç. Çay-kahve yerine geçmez; onlar ayrıca sayılır. TÜBER 2022 yetişkinler için günlük 2,0 L (kadın) – 2,5 L (erkek) yeterli alım değeri veriyor; bu hesap senin kilona göre uyarlanmış hâlidir.',
      bant: r.ust_sinir_asildi && {ton: 'uyari', metin: 'Hesaplanan miktar günlük klinik üst sınırı **(4 L)** aştığı için 4 L olarak gösterildi.'},
      eylemler: [uygulaBtn('su')]
    }),
    'ideal-kilo': r => ({
      kart: {etiket: 'Devine formülüne göre ideal nokta', deger: bir(r.ideal_kilo_kg), birim: 'kg'},
      serit: [{ikon: 'arrow-down', etiket: 'Alt sınır (BKİ 18,5)', deger: bir(r.alt_sinir_kg), birim: 'kg'}, {ikon: 'arrow-up', etiket: 'Üst sınır (BKİ 24,9)', deger: bir(r.ust_sinir_kg), birim: 'kg'}],
      metin: 'İdeal kilo tek bir sayı değil, **bir aralıktır**: kas oranı, kemik yapısı ve yaş bu noktayı kaydırır. Alttaki aralık, boyuna göre sağlıklı kabul edilen BKİ bandının (18,5-24,9) kilogram karşılığıdır.',
      eylemler: [gitBtn('Hedefime kaç haftada varırım?', 'calendar-check', '#/hesaplayici/hedef-kilo-suresi')]
    }),
    'hedef-kilo-suresi': r => ({
      kart: {etiket: 'Tahmini süre', deger: String(r.hafta_tam), birim: 'hafta', degisim: HK[r.kategori][0], degisimTon: iyiTon(r.kategori !== 'riskli')},
      serit: [{ikon: 'arrows-up-down', etiket: 'Toplam fark', deger: ond(r.fark_kg), birim: 'kg'}, {ikon: 'fire', etiket: 'Günlük kalori farkı', deger: sayi(r.gunluk_kcal_farki), birim: 'kcal'}],
      metin: `${HK[r.kategori][1]} Tahmini tarih: **${tarihMetin(r.tahmini_tarih)}**.`,
      eylemler: [gitBtn('Günlük kaloriyi hesapla', 'utensils', '#/hesaplayici/gunluk-kalori')]
    }),
    'makro-dagilim': (r, g) => ({
      kart: {etiket: 'Günlük makro', deger: sayi(r.protein_g + r.karbonhidrat_g + r.yag_g), birim: 'g / gün', degisim: 'Vücut ağırlığı başına gram olarak', degisimTon: 'iyi'},
      serit: [{ikon: 'egg', etiket: 'Protein', deger: String(r.protein_g), birim: 'g', alt: `~${ond(r.protein_g / g.kilo_kg)} g/kg`}, {ikon: 'wheat-awn', etiket: 'Karbonhidrat', deger: String(r.karbonhidrat_g), birim: 'g', alt: `~${ond(r.karbonhidrat_g / g.kilo_kg)} g/kg`}, {ikon: 'droplet', etiket: 'Yağ', deger: String(r.yag_g), birim: 'g', alt: `~${ond(r.yag_g / g.kilo_kg)} g/kg`}],
      metin: 'Bu değerler kilona, hedefine ve aktivitene göre türetilmiş **genel bir başlangıç dağılımıdır**. Öğünlerini bu üç makroyu dengede tutacak şekilde çeşitlendirebilirsin; besin seçiminde kaynak kalitesi de miktar kadar önemlidir.',
      eylemler: [uygulaBtn('makro')]
    }),
    'porsiyon-hesaplama': (r, g) => ({
      kart: {etiket: `${g.hedef_kisi} kişilik porsiyon`, deger: `×${ond(r.carpan, 2)}`, birim: 'malzeme'},
      serit: [{ikon: 'users', etiket: 'Tarif', deger: String(g.tarif_kisi), birim: 'kişi'}, {ikon: 'users', etiket: 'Yeni', deger: String(g.hedef_kisi), birim: 'kişi'}, ...(r.ornek_sonuc != null ? [{ikon: 'weight-scale', etiket: `${ond(g.ornek_miktar)} yerine`, deger: ond(r.ornek_sonuc)}] : [])],
      metin: '**Tarifteki her malzemeyi** bu çarpanla çarp. Baharat, tuz ve pişirme süresini orantı yerine tada göre ayarla.',
      eylemler: [gitBtn('Besin Kütüphanesi', 'apple-whole', '#/besinler')]
    })
  };
  // Web sonuç kartının alt notu (detay.blade.php): "Kaynak: … Sonuç tahminidir, tıbbi tavsiye değildir."
  const kaynakSatiri = h => DD.p(`${h.kaynaklar.length ? `**Kaynak:** ${h.kaynaklar.join('; ')}. ` : ''}Sonuç **tahminidir**, tıbbi tavsiye değildir.`, {ton: 'ikincil', meta: true});
  const genelBilgi = () => DD.bant({ton: 'bilgi', metin: 'Tıbbi teşhis ya da tedavi yerine geçmez. Gebelik, kronik hastalık ya da düzenli ilaç kullanımında **hekimine ve diyetisyenine** danış.'});
  const sonucHtml = (h, x) => {
    const o = SONUC[h.slug](x.sonuc, x.girdi, h);
    return `<div class="dd-yigin">${DD.metrikKart({ikon: h.ikon, ...o.kart})}${o.serit?.length ? DD.ozetSerit(o.serit) : ''}${o.ek || ''}${DD.p(o.metin)}${o.bant ? DD.bant(o.bant) : ''}${o.eylemler?.length ? `<div class="dd-yigin-8">${o.eylemler.join('')}</div>` : ''}${kaynakSatiri(h)}${genelBilgi()}</div>`;
  };

  // ---------- Liste ----------
  const LANAHTAR = 'hesaplayicilar-liste', LGRUPLAR = ['amac', 'girdi'];
  const LSIRALAR = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['ad', 'A’dan Z’ye', 'arrow-down-a-z'], ['son', 'Son kullandığın', 'clock-rotate-left']];
  // "Ne gerekiyor?" süzgeci girdilerden türer: mezura ölçüsü (bel, kalça, boyun), tarif bilgisi, ya da yalnız temel bilgiler.
  const GEREKEN = [{deger: 'temel', ad: 'Boy, kilo, yaş yeter', ikon: 'user'}, {deger: 'mezura', ad: 'Mezura ölçüsü', ikon: 'ruler-horizontal'}, {deger: 'tarif', ad: 'Tarif bilgisi', ikon: 'bowl-food'}];
  const gereken = h => (h.girdiler.tarif_kisi ? 'tarif' : ['bel_cm', 'kalca_cm', 'boyun_cm'].some(k => h.girdiler[k]) ? 'mezura' : 'temel');
  const LSECENEK = {amac: () => L().hesapAmaclari.map(a => ({deger: a.deger, ad: a.ad, ikon: a.ikon})), girdi: () => GEREKEN};
  const LBASLIK = {amac: 'Amaç', girdi: 'Ne gerekiyor?'}, LIKON = {amac: 'hedef', girdi: 'ruler-combined'};
  const lBosF = () => Object.fromEntries(LGRUPLAR.map(g => [g, []]));
  const lOku = sorgu => {
    const d = DD.durum.oku(LANAHTAR, {}) || {};
    const s = {q: d.q || '', gorunum: d.gorunum === 'izgara' ? 'izgara' : 'liste', sira: LSIRALAR.some(x => x[0] === d.sira) ? d.sira : 'onerilen', f: {...lBosF(), ...(d.f || {})}};
    if (sorgu.temiz || sorgu.q || sorgu.amac) {
      s.f = lBosF(); s.q = sorgu.q || '';
      if (L().hesapAmaclari.some(a => a.deger === sorgu.amac)) s.f.amac = [sorgu.amac];
    }
    return s;
  };
  const lYaz = ({q, gorunum, sira, f}) => DD.durum.yaz(LANAHTAR, {q, gorunum, sira, f});
  const lSecimSayi = s => LGRUPLAR.reduce((n, g) => n + s.f[g].length, 0);
  const lEslesir = (h, g, v) => (g === 'amac' ? h.amac.includes(v) : gereken(h) === v);
  const lMetin = h => DD.katla(`${h.ad} ${h.kisaAd} ${h.ozet} ${h.aciklama}`);
  const lSuz = (s, f = s.f, haric) => {
    const q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return L().hesaplayicilar.filter(h => LGRUPLAR.every(g => g === haric || !f[g].length || f[g].some(v => lEslesir(h, g, v))) && q.every(x => lMetin(h).includes(x)));
  };
  const lSay = (s, f, g, v) => lSuz(s, f, g).filter(h => lEslesir(h, g, v)).length;
  const lSirala = (l, sira) => {
    const k = kayitlar(), ad = (a, b) => a.ad.localeCompare(b.ad, 'tr');
    if (sira === 'ad') return [...l].sort(ad);
    if (sira === 'son') return [...l].sort((a, b) => (k[b.slug]?.zaman || 0) - (k[a.slug]?.zaman || 0));
    return l;
  };
  const lSerit = s => DD.cipSerit({ad: 'cip', etiket: 'Amaç', secili: s.f.amac.length ? s.f.amac : [''], ogeler: [{metin: 'Tümü', deger: '', ikon: 'calculator', sayi: lSuz(s, s.f, 'amac').length}, ...LSECENEK.amac().map(a => ({metin: a.ad, deger: a.deger, ikon: a.ikon, sayi: lSay(s, s.f, 'amac', a.deger)}))]});
  const lAd = (g, v) => LSECENEK[g]().find(x => x.deger === v)?.ad ?? v;
  const lSecimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: LGRUPLAR.flatMap(g => s.f[g].map(v => ({metin: lAd(g, v), kapat: true, etiket: `${lAd(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))});
  // Liste görünümü Gastro eylem kartı (80, 44 ikon); ızgara görünümü Gastro parçalı ızgara (kısa adla).
  const lSonuc = (l, s) => DD.listeSonuc([s.gorunum === 'izgara'
    ? DD.parcali(l.map(h => ({ikon: h.ikon, baslik: h.kisaAd, git: `#/hesaplayici/${h.slug}`})), {kutu: 'izgara', aria: 'Hesaplayıcılar'})
    : `<div class="dd-yigin-12">${l.map(h => DD.eylemKart({ikon: h.ikon, baslik: h.ad, alt: h.ozet, git: `#/hesaplayici/${h.slug}`})).join('')}</div>`], {gorunum: 'liste'});
  const sonSonuclar = () => Object.entries(kayitlar()).map(([slug, x]) => ({h: bul(slug), x})).filter(o => o.h && o.x?.sonuc).sort((a, b) => (b.x.zaman || 0) - (a.x.zaman || 0)).slice(0, 3);
  const sonBolum = () => {
    const l = sonSonuclar();
    return l.length ? DD.bolum({ic: false, baslik: 'Son sonuçların', html: DD.parcali(l.map(({h, x}) => ({ikon: h.ikon, baslik: h.kisaAd, alt: `${OZET[h.slug](x.sonuc)} · ${DD.tarihKisa(x.tarih)}`, git: `#/hesaplayici/${h.slug}`})), {aria: 'Son sonuçların'})}) : '';
  };
  const altBolum = () => `${DD.bolum({ic: false, baslik: 'Rakamdan tabağa geç', html: DD.parcali([
    {ikon: 'tabak', baslik: 'Akıllı Tabak ve Değişim', alt: 'Tabağını kur, muadilini bul', git: '#/denge/tabak'},
    {ikon: 'clipboard-question', baslik: 'Sağlık Testleri', alt: `${DDV.testler?.toplam ?? ''} test ile alışkanlığını ölç`.trim(), git: '#/testler'},
    {ikon: 'wand-magic-sparkles', baslik: 'Program Bul', alt: 'Beş adımda eşleştirme', git: '#/program-bul'}
  ], {aria: 'Rakamdan tabağa geç'})})}${DD.ipucu({ikon: 'bilgi', baslik: 'Sonuçlar tahminidir', metin: 'Her araç **referans denklemlere** dayanır; sonuçlar genel bilgi amaçlıdır, tıbbi teşhis ya da tedavi yerine geçmez. Kişiye özel plan yetkili bir diyetisyen tarafından hazırlanır.', eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}})}`;
  const lBosMetin = s => (s.q ? `“**${s.q}**” için hesaplayıcı bulamadık. Daha kısa yazmayı ya da **seçimlerini temizlemeyi** dene.` : 'Bu seçimlere uyan hesaplayıcı yok. **Seçimlerini temizleyip** yeniden bak.');
  const lIcerik = (s, l) => {
    const filtreli = lSecimSayi(s) > 0 || !!s.q;
    const bas = `${filtreli || !DD.uye() ? '' : sonBolum()}${lSecimSayi(s) ? lSecimler(s) : ''}`;
    if (!l.length) return `${bas}${DD.listeBos({baslik: 'Hesaplayıcı bulunamadı', metin: lBosMetin(s), eylem: {metin: 'Seçimleri temizle', tur: 'secondary', veri: {eylem: 'temizle'}}})}`;
    return `${bas}${DD.listeDurum({sayi: l.length, birim: 'hesaplayıcı', gorunum: s.gorunum, siraliAktif: s.sira !== 'onerilen'})}<div class="dd-yigin-24">${lSonuc(lSirala(l, s.sira), s)}${altBolum()}</div>`;
  };
  const listeCiz = ctx => {
    ctx.liste ||= lOku(ctx.sorgu);
    const s = ctx.liste, H = L().hesaplayicilar, n = sonSonuclar().length;
    return DD.kubbe({
      gorsel: 'assets/gorsel/hero/hazirlik-kutulari.webp',
      baslik: 'Hesaplayıcılar',
      alt: 'Kalori, makro, su ve kilo hesapları birkaç saniyede',
      stat: [{deger: DD.sayi(H.length), etiket: 'Hesaplayıcı'}, {deger: DD.sayi(L().hesapAmaclari.length), etiket: 'Amaç'}, ...(DD.uye() && n ? [{deger: DD.sayi(n), etiket: 'Sonucun'}] : [])],
      arac: DD.listeArac({yer: 'Hesaplayıcı ara', deger: s.q, filtreSayi: lSecimSayi(s), serit: lSerit(s)}),
      html: lIcerik(s, lSuz(s))
    });
  };
  // Liste etkileşimi besinler.js ile aynı: arama gecikmeli, çip tek amaç, filtre sheet'i canlı sayı, sırala, görünüm, seçim kaldır, temizle.
  const listeBagla = (kok, s) => {
    const govde = kok.querySelector('.dd-liste-icerik'), rail = kok.querySelector('.dd-liste-rail'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
    let bekle = 0;
    const secileGit = () => {
      const r = rail.firstElementChild, c = r?.querySelector('[aria-pressed=true]');
      if (c) r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2;
    };
    const seritCiz = () => { const x = rail.firstElementChild?.scrollLeft || 0; rail.innerHTML = lSerit(s); if (rail.firstElementChild) rail.firstElementChild.scrollLeft = x; };
    const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
    const guncelle = () => { govde.innerHTML = lIcerik(s, lSuz(s)); seritCiz(); DD.filtreSayiYaz(arac, lSecimSayi(s)); lYaz(s); hizala(); };
    secileGit();
    const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
    const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
    girdi.addEventListener('input', ara);
    girdi.addEventListener('keydown', enter);
    const canli = d => {
      const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
      if (!b) return;
      const n = lSuz(s, d).length;
      b.querySelector('span').textContent = n ? `${DD.sayi(n)} hesaplayıcıyı gör` : 'Sonuç yok';
      b.disabled = !n;
      LGRUPLAR.forEach(g => LSECENEK[g]().forEach(x => { const c = sheet.querySelector(`input[name="${g}"][value="${x.deger}"]`)?.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = lSay(s, d, g, x.deger); }));
    };
    const c = [
      DD.on(kok, 'cip', v => { const ayni = s.f.amac.length === 1 && s.f.amac[0] === v; s.f.amac = v && !ayni ? [v] : []; guncelle(); }),
      DD.on(kok, 'gorunum', v => { s.gorunum = v; govde.innerHTML = lIcerik(s, lSuz(s)); lYaz(s); }),
      DD.eylem(kok, 'filtre', () => DD.filtreSheet({
        baslik: 'Hesaplayıcıları filtrele',
        gruplar: LGRUPLAR.map(g => ({baslik: LBASLIK[g], ad: g, ikon: LIKON[g], tur: 'coklu', ogeler: LSECENEK[g]().map(x => ({metin: x.ad, deger: x.deger, ikon: x.ikon, sayi: lSay(s, s.f, g, x.deger)}))})),
        secili: s.f,
        eylem: `${DD.sayi(lSuz(s).length)} hesaplayıcıyı gör`,
        degisti: canli,
        uygula: d => { s.f = {...lBosF(), ...Object.fromEntries(LGRUPLAR.map(g => [g, (d[g] || []).map(String)]))}; guncelle(); }
      })),
      DD.eylem(kok, 'sirala', () => DD.siralaSheet({secili: s.sira, secenekler: LSIRALAR, sec: v => { s.sira = v; guncelle(); }})),
      DD.eylem(kok, 'kaldir', el => { const [g, v] = el.dataset.id.split('|'); s.f[g] = s.f[g].filter(x => x !== v); guncelle(); }),
      DD.eylem(kok, 'temizle', () => { s.f = lBosF(); s.q = ''; girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); guncelle(); })
    ];
    return () => { clearTimeout(bekle); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); c.forEach(f => f()); };
  };

  // ---------- Form ----------
  const VURGU = {'bazal-metabolizma': 'dinlenme enerjisini', 'beden-kutle-endeksi': 'BKİ değerini', 'gunluk-kalori': 'koru, ver ya da al', 'vucut-tipi': 'düşük, orta ya da yüksek', 'vucut-yag-orani': 'yağın yüzdesini', 'gunluk-su': 'günlük su ihtiyacını', 'ideal-kilo': 'sağlıklı kilo aralığını', 'hedef-kilo-suresi': 'kaç haftada', 'makro-dagilim': 'protein, karbonhidrat ve yağ', 'porsiyon-hesaplama': 'yeniden ölçekle'};
  const vurgula = (metin, ifade) => (ifade && metin.includes(ifade) ? metin.replace(ifade, `**${ifade}**`) : `**${metin}**`);
  // "Nasıl hesaplanır?" formül bloğu: Gastro bilgi kutusu (DD.bilgi), her denklem ayrı satır (DD.madde), altında birimler; künye kutunun altında ayrı satır.
  // Sayılar hesaplayıcının ayar alanından okunur; hesapla aynı değerler.
  const vs = n => String(n).replace('.', ',');
  const isaret = n => (n > 0 ? `+${vs(n)}` : n < 0 ? `−${vs(-n)}` : '0');
  const sira = (o, f, anahtar) => anahtar.map(k => f(o[k])).join(' / ');
  const HEDEF3 = ['koru', 'form', 'kas'], AKT3 = ['dusuk', 'orta', 'yuksek'];
  const BMH_SATIR = a => [`**Erkek:** BMH = 10 × kilo + 6,25 × boy − 5 × yaş + ${vs(a.cinsiyet_ekleri.erkek)}`, `**Kadın:** BMH = 10 × kilo + 6,25 × boy − 5 × yaş − ${vs(-a.cinsiyet_ekleri.kadin)}`];
  const FORMUL = {
    'bazal-metabolizma': a => ({satirlar: BMH_SATIR(a), birim: 'kilo kg · boy cm · yaş yıl · BMH kcal/gün'}),
    'beden-kutle-endeksi': a => {
      const e = a.kategori_esikleri.map(vs);
      return {satirlar: ['**BKİ** = kilo ÷ boy²', `**Zayıf:** ${e[0]} altı · **Normal:** ${e[1]} altı`, `**Fazla kilolu:** ${e[2]} altı`, `**Obezite sınıf I:** ${e[3]} altı · **sınıf II:** ${e[4]} altı`, `**Obezite sınıf III:** ${e[4]} ve üstü`], birim: 'kilo kg · boy m'};
    },
    'gunluk-kalori': a => ({satirlar: [...BMH_SATIR(a), '**Günlük ihtiyaç** = BMH × aktivite katsayısı', `**Katsayılar:** ${AKTIVITE.map(x => vs(x.k)).join(' · ')}`, `**Kilo vermek** = ihtiyaç − ${vs(a.band_farki_kcal)} (en az ${DD.sayi(EN_DUSUK)})`, `**Kilo almak** = ihtiyaç + ${vs(a.band_farki_kcal)}`], birim: 'kilo kg · boy cm · yaş yıl (18 ve üstü) · kcal/gün'}),
    'vucut-tipi': a => {
      const ad = {dusuk: 'Düşük', orta: 'Orta', yuksek: 'Yüksek'};
      const sinif = (c, l) => l.map((x, i) => `**${c}, ${ad[x.tip]}:** ${x.ust == null ? `${iki(l[i - 1].ust)} ve üstü` : i ? `${iki(l[i - 1].ust)}–${iki(x.ust)}` : `${iki(x.ust)} altı`}`);
      return {satirlar: ['**Oran** = bel ÷ kalça', ...sinif('Kadın', a.siniflar.kadin), ...sinif('Erkek', a.siniflar.erkek)], birim: 'bel cm · kalça cm'};
    },
    'vucut-yag-orani': a => {
      const b = c => `${a.bantlar[c].p.slice(0, 4).map(vs).join(' · ')} · üst sınır %${a.bantlar[c].hedef}`;
      return {satirlar: ['**Erkek:** %yağ = 495 ÷ D − 450', '**D (erkek)** = 1,0324 − 0,19077 × log(bel − boyun) + 0,15456 × log(boy)', '**Kadın:** %yağ = 495 ÷ D − 450', '**D (kadın)** = 1,29579 − 0,35004 × log(bel + kalça − boyun) + 0,22100 × log(boy)', '**Yağ kütlesi** = kilo × %yağ ÷ 100', `**Sınırlar, kadın:** ${b('kadin')}`, `**Sınırlar, erkek:** ${b('erkek')}`], birim: 'boy ve çevreler cm · kilo kg · log 10 tabanlı'};
    },
    'gunluk-su': a => ({satirlar: [`**Günlük su** = ${vs(a.ml_per_kg)} ml × kilo + egzersiz eki`, '**Egzersiz eki** = saat × yoğunluk', '**Yoğunluk:** düşük 350 · yoğun 500 ml/saat', `**Üst sınır:** ${vs(a.ust_sinir_ml / 1000)} L`], birim: 'kilo kg · su ml · 1 bardak 200 ml'}),
    'ideal-kilo': a => ({satirlar: [`**Erkek:** ideal = ${vs(a.taban_kg.erkek)} + ${vs(a.inch_basina_kg)} × (boy ÷ 2,54 − ${vs(a.inch_esigi)})`, `**Kadın:** ideal = ${vs(a.taban_kg.kadin)} + ${vs(a.inch_basina_kg)} × (boy ÷ 2,54 − ${vs(a.inch_esigi)})`, `**Sağlıklı aralık** = ${vs(a.bki_alt)} × boy² ile ${vs(a.bki_ust)} × boy²`], birim: 'ideal kg · boy cm (aralıkta m)'}),
    'hedef-kilo-suresi': a => ({satirlar: ['**Hafta** = |hedef − mevcut| ÷ haftalık hız', `**Günlük fark** = hız × ${DD.sayi(a.kg_basina_kcal)} ÷ 7`, '**Tahmini tarih** = başlangıç + hafta × 7 gün', `**Sürdürülebilir:** haftada ${vs(a.surdurulebilir_ust_sinir)} kg ve altı`, `**Yüksek:** kilonun %${vs(a.risk_esik_orani * 100)}’ini aşan hız`], birim: `kilo kg · hız kg/hafta · günlük fark 10 kcal’e yuvarlanır`}),
    'makro-dagilim': a => ({satirlar: [
      '**Protein** = kilo × (taban + eki)', `**Taban (hedef):** ${sira(a.protein_gkg, bir, HEDEF3)}`, `**Eki (aktivite):** ${sira(a.protein_aktivite_eki, isaret, AKT3)}`,
      '**Karbonhidrat** = kilo × (taban + eki)', `**Taban (aktivite):** ${sira(a.karb_aktivite_gkg, vs, AKT3)}`, `**Eki (hedef):** ${sira(a.karb_hedef_eki, isaret, HEDEF3)}`,
      `**Yağ** = kilo × ${sira(a.yag_gkg, bir, HEDEF3)} (hedef)`, '**Hedef sırası:** Koru / Form-tut / Kas-odak', '**Aktivite sırası:** Düşük / Orta / Yüksek'
    ], birim: 'kilo kg · katsayılar g/kg · sonuç g/gün'}),
    'porsiyon-hesaplama': () => ({satirlar: ['**Çarpan** = hedef kişi ÷ tarif kişi × porsiyon boyutu', `**Porsiyon boyutu:** ${ALAN.porsiyon_carpani.ogeler.map(([d, ad]) => `${ad.toLocaleLowerCase('tr')} ${vs(d)}`).join(' · ')}`, '**Yeni miktar** = malzeme × çarpan'], birim: 'çarpan 2 hane · miktar 1 hane'})
  };
  const formulBlok = h => {
    const f = FORMUL[h.slug](h.ayar);
    return `<div class="dd-yigin-12">${DD.bilgi({etiket: 'Formül', ikon: 'calculator', html: `${f.satirlar.map(metin => DD.madde({metin, tur: 'notr'})).join('')}${DD.p(`**Birimler:** ${f.birim}`, {ton: 'ikincil', meta: true})}`})}${h.kaynaklar.length ? DD.p(`**Kaynak:** ${h.kaynaklar.join('; ')}`, {ton: 'ikincil', meta: true}) : ''}</div>`;
  };
  const formCiz = h => {
    const t = taslak(h), x = kayit(h.slug), alanlar = gorunen(h, t.s);
    const gecis = DD.cipler({ad: 'hesaplayici', tur: 'tek', etiket: 'Hesaplayıcılar', secili: h.slug, ogeler: L().hesaplayicilar.map(y => ({metin: y.kisaAd, deger: y.slug, ikon: y.ikon}))});
    const bilgi = profil() && alanlar.some(ad => ALAN[ad].p) ? 'Alanlar **profilinden** dolduruldu; değiştirdiğin değer yalnız bu hesapta kullanılır.' : 'Sonucun **bu cihazda** hesaplanır, hiçbir yere gönderilmez.';
    return DD.gruplar([
      x?.sonuc && {baslik: 'Sonucun', html: sonucHtml(h, x)},
      {baslik: x?.sonuc ? 'Bilgilerin' : 'Bilgilerini gir', eylem: {html: DD.btn({metin: 'Sıfırla', ikon: 'rotate-left', tur: 'text', boyut: 'sm', veri: {eylem: 'sifirla'}})}, html: `<div class="dd-yigin">${DD.p(bilgi, {ton: 'ikincil'})}${alanlar.map(ad => alanHtml(h, ad, t)).join('')}</div>`},
      {baslik: 'Nasıl hesaplanır?', html: formulBlok(h)},
      {baslik: 'Hesaplamaya devam et', satirlar: [
        {ikon: 'tabak', baslik: 'Akıllı Tabak ve Değişim', alt: 'Sonucunu tabağa dök', git: '#/denge/tabak', ok: true},
        {ikon: 'apple-whole', baslik: 'Kaç Kalori?', alt: 'Porsiyon karşılıklarını gör', git: '#/besinler', ok: true},
        {ikon: 'user-doctor', baslik: 'Diyetisyene danış', alt: 'Sonucunu uzmanla yorumla', git: '#/uzman/bul', ok: true},
        {ikon: 'calculator', baslik: 'Tüm hesaplayıcılar', alt: `${L().hesaplayicilar.length} araç`, git: '#/hesaplayicilar', ok: true}
      ]}
    ], {bas: `<div class="dd-yigin">${gecis}${DD.metinBlok({baslik: h.ad, metin: vurgula(h.aciklama, VURGU[h.slug])})}</div>`});
  };
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu hesaplayıcı burada değil', metin: 'Bağlantı eskimiş olabilir. **Tüm hesaplayıcılar** listesinden aradığını bulabilirsin.', eylem: {metin: 'Hesaplayıcılara dön', yerine: '#/hesaplayicilar'}});

  // Çip şeridinde seçili öğe görünür olsun (web sekme rayı seçiliyi ortalar).
  const seritOrtala = (kok, ad) => {
    const secili = kok.querySelector(`[data-ad="${ad}"] [aria-pressed="true"]`), serit = secili?.parentElement;
    if (serit) serit.scrollLeft = secili.offsetLeft - serit.offsetLeft - (serit.clientWidth - secili.offsetWidth) / 2;
  };

  let hataGosterildi = false, sonucaKaydir = false, hatayaKaydir = false;
  DD.ekran('hesaplayicilar', {
    // Tek ekran iki rota taşır: liste Gastro liste-v2 (banner + alt menü), form alt sayfa. Değer o an açık adresten okunur.
    get tur() { return location.hash.startsWith('#/hesaplayici/') ? 'alt' : 'banner'; },
    get dock() { return !location.hash.startsWith('#/hesaplayici/'); },
    nav: 'bugun',
    // Doğrudan açılınca geri: detaydan listeye, listeden Bugün'e (DD.geri ust'u okuduğu an adres hâlâ bu ekranındır).
    get ust() { return location.hash.startsWith('#/hesaplayici/') ? '#/hesaplayicilar' : '#/bugun'; },
    baslik: ctx => (ctx.param?.slug ? bul(ctx.param.slug)?.kisaAd || 'Hesaplayıcı' : 'Hesaplayıcılar'),
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (!ctx.param?.slug) return listeCiz(ctx);
      const h = bul(ctx.param.slug);
      return h ? formCiz(h) : yokEkrani();
    },
    altBar: ctx => {
      const h = ctx.param?.slug && bul(ctx.param.slug);
      return h ? DD.altEylem({dugmeler: [{metin: 'Hesapla', ikon: 'calculator', tam: true, veri: {eylem: 'hesapla'}}]}) : '';
    },
    gizlen: () => taslakSil(),
    sonra: (kok, ctx) => {
      if (!ctx.param?.slug) return ctx.liste ? listeBagla(kok, ctx.liste) : null;
      const h = bul(ctx.param.slug);
      if (!h) return undefined;
      const t = taslak(h);
      seritOrtala(kok, 'hesaplayici');
      // Gastro alanHata gibi: kullanıcı alanı düzeltince hata kalkar.
      const hataKaldir = (el, ad) => {
        delete t.hata[ad];
        const a = el.closest('.dd-alan');
        if (a?.classList.contains('is-hata')) { a.classList.remove('is-hata'); a.querySelector(':scope > .dd-hata')?.remove(); }
      };
      const yazilan = ev => {
        const ad = ev.target.name?.startsWith('h-') && ev.target.name.slice(2);
        if (!ad || !(ad in t.s) || ALAN[ad]?.tur !== 'sayi') return;
        t.s[ad] = ev.target.value;
        hataKaldir(ev.target, ad);
      };
      kok.addEventListener('input', yazilan);
      const c = [
        () => kok.removeEventListener('input', yazilan),
        DD.on(kok, 'hesaplayici', v => { if (v && v !== h.slug) DD.yerine(`#/hesaplayici/${v}`); }),
        ...Object.keys(t.s).filter(ad => ALAN[ad].tur !== 'sayi').map(ad => DD.on(kok, `h-${ad}`, (v, _d, ev) => {
          t.s[ad] = Array.isArray(v) ? v[0] : v;
          const hataVardi = !!t.hata[ad];
          if (hataVardi) hataKaldir(ev.target, ad);
          if (ad === 'cinsiyet' && h.girdiler.kalca_cm && h.slug === 'vucut-yag-orani') DD.tazele();
        })),
        DD.on(kok, 'h-hedef-turu', v => {
          const x = kayit(h.slug); if (!x) return;
          kayitYaz(h.slug, {...x, sonuc: {...x.sonuc, hedef_turu: v}});
          DD.tazele();
        }),
        DD.eylem(kok, 'hesapla', el => {
          const tarih = kok.querySelector('input[name="h-baslangic_tarihi"]'); if (tarih) t.s.baslangic_tarihi = tarih.value || DD.bugunIso();
          const {hata, g} = dogrula(h, t.s);
          t.hata = hata;
          if (Object.keys(hata).length) { hatayaKaydir = true; DD.tazele(); return; }
          const r = HESAP[h.slug](h, g);
          if (r.hata) { DD.toast(r.hata, {tur: 'hata', yerine: true}); return; }
          const once = kayit(h.slug);
          if (h.slug === 'gunluk-kalori' && once?.sonuc?.hedef_turu) r.sonuc.hedef_turu = once.sonuc.hedef_turu;
          kayitYaz(h.slug, {surum: SURUM, girdi: g, sonuc: r.sonuc, tarih: DD.bugunIso(), zaman: Date.now()});
          sonucaKaydir = true;
          DD.mesgul(el, 300);
          DD.tazele();
          DD.toast(`Sonucun **hazır**: ${OZET[h.slug](r.sonuc)}`, {tur: 'basari', ikon: h.ikon, yerine: true});
        }),
        DD.eylem(kok, 'sifirla', () => {
          const once = kayit(h.slug);
          kayitSil(h.slug);
          taslakSil();
          DD.tazele();
          DD.toast(profil() ? 'Alanlar **profiline** döndü' : 'Alanlar **sıfırlandı**', {eylem: once ? 'Geri al' : undefined, onEylem: once ? () => { kayitYaz(h.slug, once); taslakSil(); DD.tazele(); } : undefined, yerine: true});
        }),
        DD.eylem(kok, 'hedefe-uygula', el => {
          const x = kayit(h.slug); if (!x) return;
          const deger = {kalori: () => kcal(hedefKcal(x.sonuc, hedefTuruIlk(x.sonuc))), su: () => `${ond(x.sonuc.su_litre)} L su`, makro: () => `${x.sonuc.protein_g} g protein`}[el.dataset.id]();
          DD.git('#/tercihler');
          DD.toast(`**${deger}** hedefin için tercihlerini buradan güncelleyebilirsin`, {ikon: 'hedef', yerine: true});
        })
      ];
      const kaydir = (hedef, blok) => requestAnimationFrame(() => hedef.scrollIntoView({block: blok, behavior: DD.azHareket() ? 'auto' : 'smooth'}));
      if (hatayaKaydir) {
        hatayaKaydir = false;
        const a = kok.querySelector('.dd-alan.is-hata');
        if (a) { kaydir(a, 'center'); a.querySelector('input:not([type=hidden])')?.focus({preventScroll: true}); }
      } else if (sonucaKaydir) {
        sonucaKaydir = false;
        // Sonuç grubu ilk grup: kaydırıcı grupların başına gelir, başlık üst barın altında kalmaz.
        const y = kok.querySelector('.dd-metrik')?.closest('.dd-grup'), k = kok.querySelector('.dd-kaydir');
        if (y && k) requestAnimationFrame(() => k.scrollTo({top: Math.max(0, y.offsetTop - k.querySelector('.dd-gruplar').offsetTop), behavior: DD.azHareket() ? 'auto' : 'smooth'}));
      }
      return () => c.forEach(f => f());
    }
  });
})();
