/* Hesaplayıcılar: #/hesaplayicilar (liste) ve #/hesaplayici/:slug (form + sonuç). Web karşılığı: hesaplayicilar/ (liste, amaç sekmeleri, Son Sonuçların,
 * Rakamdan Tabağa Geç) ve hesaplayici/gunluk-kalori/ (public-araclar-kalori.js: form, sonuç, hedef seçimi, Hedefimi belirle).
 * Gastro kalıbı (ayarlar.js, dolabim.js): DD.gruplar; form alanları DD.input / DD.alan + DD.stepper, DD.segment, DD.secimler, DD.takvimAlan;
 *   alan hatası alanın altında; Sıfırla grup başlığında metin düğmesi, alt çubukta tek birincil Hesapla; sonuç aynı ekranda formun üstünde.
 * Veri DDV.kutuphane.hesaplayicilar (10) ve hesapAmaclari (4); formül sabitleri her kaydın `ayar` alanından okunur.
 * Formüller: BMH Mifflin-St Jeor (veri/onboarding.js kalori.bazal ile aynı); Günlük kalori web'deki gibi önce BMH yuvarlanır, sonra × katsayı,
 *   bantlar ±500, en düşük 1.400 kcal (TÜBER 2022 Ek 3.1.1). Vücut yağ oranı ABD Donanması çevre denklemi (Hodgdon-Beckett, metrik).
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
  const kayitlar = () => DD.durum.oku(ANAHTAR, {}) || {};
  const kayit = slug => kayitlar()[slug] || null;
  const kayitYaz = (slug, x) => DD.durum.yaz(ANAHTAR, {...kayitlar(), [slug]: x});
  const kayitSil = slug => { const {[slug]: _, ...kalan} = kayitlar(); DD.durum.yaz(ANAHTAR, kalan); };
  const sayi = n => DD.sayi(Math.round(n));
  const ond = (n, b = 1) => DD.ondalik(n, b);
  const kcal = n => `${sayi(n)} kcal`;
  const iki = n => (+n).toFixed(2).replace('.', ','); // oran gösterimi: 0,80

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
    egzersiz_saat: {etiket: 'Günlük egzersiz', tur: 'segment', v: '0', ogeler: [['0', 'Yok'], ['0.5', '30 dk'], ['1', '1 sa'], ['1.5', '1,5 sa'], ['2', '2 sa']]},
    yogunluk_ml_saat: {etiket: 'Egzersiz yoğunluğu', yardim: 'Orta saatte 350 mL, yoğun 500 mL ekler.', tur: 'segment', v: '350', ogeler: [['350', 'Orta'], ['500', 'Yoğun']]},
    hiz_kg_hafta: {etiket: 'Haftalık hız', tur: 'segment', v: '0.5', ogeler: [['0.25', '0,25 kg'], ['0.5', '0,5 kg'], ['0.75', '0,75 kg'], ['1', '1 kg']], p: k => TEMPO_HIZ[k.tempo]},
    baslangic_tarihi: {etiket: 'Başlangıç tarihi', tur: 'tarih'},
    hedef: {etiket: 'Hedefin', tur: 'segment', v: 'koru', ogeler: [['koru', 'Korumak'], ['form', 'Forma girmek'], ['kas', 'Kas kazanmak']], p: k => MAKRO_HEDEF[k.hedef] || 'koru'},
    aktivite: {etiket: 'Aktivite düzeyi', tur: 'segment', v: 'orta', ogeler: [['dusuk', 'Düşük'], ['orta', 'Orta'], ['yuksek', 'Yüksek']], p: k => MAKRO_AKT[k.aktivite]},
    tarif_kisi: {etiket: 'Tarif kaç kişilik?', tur: 'stepper', birim: 'kişi', v: 4},
    hedef_kisi: {etiket: 'Kaç kişilik yapacaksın?', tur: 'stepper', birim: 'kişi', v: 2},
    porsiyon_carpani: {etiket: 'Porsiyon büyüklüğü', tur: 'segment', v: '1', ogeler: [['0.85', 'Küçük'], ['1', 'Normal'], ['1.2', 'Büyük']]},
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
      if (v != null && (a.tur === 'segment' || a.tur === 'aktivite')) v = String(v);
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
    if (a.tur === 'segment') return DD.alan({etiket: a.etiket, yardim: a.yardim, html: DD.segment({ad: n, etiket: a.etiket, secili: s[ad], ogeler: a.ogeler.map(([deger, ad_]) => ({ad: ad_, deger}))})});
    if (a.tur === 'tarih') return DD.takvimAlan({ad: n, etiket: a.etiket, deger: s[ad], min: DD.bugunIso(), hizli: [['Bugün', 0]], yardim: 'Tahmini varış bu günden sayılır.'});
    return '';
  };

  // ---------- Hesaplar ----------
  // Her işlev {sonuc} ya da {hata} döner. Sonuç alanları hesaplayicilar.json `sonuclar` adlarıyla aynıdır.
  const yuvarla = (n, b = 1) => Math.round(n * 10 ** b) / 10 ** b;
  const gunEkle = (iso, gun) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + gun); return d.toISOString().slice(0, 10); };
  const cinsiyetGerek = g => (!g.cinsiyet ? {hata: 'Hesaplamak için **cinsiyetini** seç'} : null);
  const bmh = (h, g) => Math.round(10 * g.kilo_kg + 6.25 * g.boy_cm - 5 * g.yas + h.ayar.cinsiyet_ekleri[g.cinsiyet]);
  const BKI_AD = {zayif: 'Zayıf', normal: 'Normal', fazla_kilolu: 'Fazla kilolu', obezite_1: '1. derece obezite', obezite_2: '2. derece obezite', obezite_3: '3. derece obezite'};
  const EN_DUSUK = 1400;
  const HESAP = {
    'bazal-metabolizma': (h, g) => cinsiyetGerek(g) || {sonuc: {bmh_kcal: bmh(h, g)}},
    'beden-kutle-endeksi': (h, g) => {
      const m = g.boy_cm / 100, bki = yuvarla(g.kilo_kg / (m * m)), i = h.ayar.kategori_esikleri.findIndex(e => bki < e);
      return {sonuc: {bki, kategori: h.ayar.kategoriler[i < 0 ? h.ayar.kategoriler.length - 1 : i], alt_kg: yuvarla(18.5 * m * m), ust_kg: yuvarla(24.9 * m * m)}};
    },
    'gunluk-kalori': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      if (!g.aktivite_katsayisi) return {hata: 'Hesaplamak için **aktivite düzeyini** seç'};
      const b = bmh(h, g), tdee = Math.round(b * +g.aktivite_katsayisi), bant = h.ayar.band_farki_kcal;
      return {sonuc: {bmh_kcal: b, tdee_kcal: tdee, kilo_ver_kcal: Math.max(tdee - bant, EN_DUSUK), kilo_al_kcal: tdee + bant, sinir: tdee - bant < EN_DUSUK}};
    },
    'vucut-tipi': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const oran = yuvarla(g.bel_cm / g.kalca_cm, 2), t = h.ayar.sinir_degerleri[g.cinsiyet];
      return {sonuc: {oran, tip: oran < t.t1 ? 'armut' : oran < t.t2 ? 'dengeli' : 'elma', t1: t.t1, t2: t.t2}};
    },
    'vucut-yag-orani': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const kadin = g.cinsiyet === 'kadin', fark = kadin ? g.bel_cm + g.kalca_cm - g.boyun_cm : g.bel_cm - g.boyun_cm;
      if (fark <= 0) return {hata: '**Bel çevren** boyun çevrenden büyük olmalı'};
      const yogunluk = kadin ? 1.29579 - 0.35004 * Math.log10(fark) + 0.22100 * Math.log10(g.boy_cm) : 1.0324 - 0.19077 * Math.log10(fark) + 0.15456 * Math.log10(g.boy_cm);
      const pct = yuvarla(495 / yogunluk - 450), b = h.ayar.bantlar[g.cinsiyet], p = b.p;
      if (pct < 2 || pct > 70) return {hata: 'Bu ölçülerle **güvenilir bir sonuç** çıkmadı; ölçülerini yeniden kontrol et'};
      const sinif = pct < p[1] ? 'atletik' : pct < p[2] ? 'fit' : pct < p[3] ? 'ortalama' : 'yuksek';
      return {sonuc: {yag_orani_pct: pct, siniflandirma: sinif, hedef_ust_sinir_pct: b.hedef, yag_kutlesi_kg: g.kilo_kg ? yuvarla(g.kilo_kg * pct / 100) : null, yagsiz_kutle_kg: g.kilo_kg ? yuvarla(g.kilo_kg * (1 - pct / 100)) : null}};
    },
    'gunluk-su': (h, g) => {
      const ek = +g.egzersiz_saat * +g.yogunluk_ml_saat, ham = h.ayar.ml_per_kg * g.kilo_kg + ek, ml = Math.round(Math.min(ham, h.ayar.ust_sinir_ml));
      return {sonuc: {su_ml: ml, su_litre: yuvarla(ml / 1000), ek_ml: ek, ust_sinir_asildi: ham > h.ayar.ust_sinir_ml ? 1 : 0}};
    },
    'ideal-kilo': (h, g) => {
      if (cinsiyetGerek(g)) return cinsiyetGerek(g);
      const a = h.ayar, inc = g.boy_cm / 2.54, m = g.boy_cm / 100;
      return {sonuc: {ideal_kilo_kg: yuvarla(a.taban_kg[g.cinsiyet] + a.inch_basina_kg * Math.max(0, inc - a.inch_esigi)), alt_sinir_kg: yuvarla(a.bki_alt * m * m), ust_sinir_kg: yuvarla(a.bki_ust * m * m)}};
    },
    'hedef-kilo-suresi': (h, g) => {
      const fark = yuvarla(g.hedef_kilo_kg - g.mevcut_kilo_kg), hiz = +g.hiz_kg_hafta;
      if (!fark) return {hata: 'Hedef kilon **şu anki kilonla aynı**; farklı bir hedef seç'};
      const hafta = Math.ceil(Math.abs(fark) / hiz), a = h.ayar;
      const kategori = hiz > g.mevcut_kilo_kg * a.risk_esik_orani ? 'cok_hizli' : hiz > a.surdurulebilir_ust_sinir ? 'hizli' : 'surdurulebilir';
      return {sonuc: {fark_kg: fark, hafta_tam: hafta, gunluk_kcal_farki: Math.round(hiz * a.kg_basina_kcal / 7), tahmini_tarih: gunEkle(g.baslangic_tarihi || DD.bugunIso(), hafta * 7), kategori}};
    },
    'makro-dagilim': (h, g) => {
      const a = h.ayar, P = Math.round(g.kilo_kg * (a.protein_gkg[g.hedef] + a.protein_aktivite_eki[g.aktivite])), Y = Math.round(g.kilo_kg * a.yag_gkg[g.hedef]), K = Math.round(g.kilo_kg * (a.karb_aktivite_gkg[g.aktivite] + a.karb_hedef_eki[g.hedef]));
      return {sonuc: {protein_g: P, karbonhidrat_g: K, yag_g: Y, toplam_kcal: P * 4 + K * 4 + Y * 9}};
    },
    'porsiyon-hesaplama': (h, g) => {
      const carpan = yuvarla(g.hedef_kisi / g.tarif_kisi * +g.porsiyon_carpani, 2);
      return {sonuc: {carpan, ornek_sonuc: g.ornek_miktar ? Math.round(g.ornek_miktar * carpan) : null}};
    }
  };

  // ---------- Sonuç ----------
  const YAG_AD = {atletik: 'Atletik', fit: 'Fit', ortalama: 'Ortalama', yuksek: 'Sağlıklı aralığın üstünde'};
  const TIP_AD = {armut: 'Armut', dengeli: 'Dengeli', elma: 'Elma'};
  const SURE_AD = {surdurulebilir: 'Sürdürülebilir tempo', hizli: 'Hızlı tempo', cok_hizli: 'Önerilenin üstünde'};
  const HEDEF_TUR = [['ver', 'Kilo vermek'], ['koru', 'Korumak'], ['al', 'Kilo almak']];
  const hedefTuruIlk = r => r.hedef_turu || ({'kilo-vermek': 'ver', 'kas-kazanmak': 'al'}[profil()?.hedef] ?? 'koru');
  const hedefKcal = (r, tur) => ({ver: r.kilo_ver_kcal, koru: r.tdee_kcal, al: r.kilo_al_kcal}[tur]);
  // Listede "Son sonuçların" satırı için tek satırlık özet.
  const OZET = {
    'bazal-metabolizma': r => `${kcal(r.bmh_kcal)} / gün`,
    'beden-kutle-endeksi': r => `${ond(r.bki)} · ${BKI_AD[r.kategori]}`,
    'gunluk-kalori': r => `${kcal(r.tdee_kcal)} / gün`,
    'vucut-tipi': r => `${iki(r.oran)} · ${TIP_AD[r.tip]}`,
    'vucut-yag-orani': r => `%${ond(r.yag_orani_pct)} · ${YAG_AD[r.siniflandirma]}`,
    'gunluk-su': r => `${ond(r.su_litre)} L / gün`,
    'ideal-kilo': r => `${ond(r.ideal_kilo_kg)} kg`,
    'hedef-kilo-suresi': r => `${r.hafta_tam} hafta · ${DD.tarihKisa(r.tahmini_tarih)}`,
    'makro-dagilim': r => `P ${r.protein_g} · K ${r.karbonhidrat_g} · Y ${r.yag_g} g`,
    'porsiyon-hesaplama': r => `×${ond(r.carpan, 2)} çarpan`
  };
  const uygulaBtn = metin => (DD.uye()
    ? DD.btn({metin: 'Hedefime uygula', ikon: 'hedef', tam: true, veri: {eylem: 'hedefe-uygula', id: metin}})
    : DD.btn({metin: 'Hedefime uygula', ikon: 'hedef', tam: true, veri: {'uye-ol': 'Sonucunu **hedefine uygulamak** ve değişimini izlemek için ücretsiz profil oluştur.'}}));
  const gitBtn = (metin, ikon, git) => DD.btn({metin, ikon, tur: 'secondary', tam: true, git});
  const SONUC = {
    'bazal-metabolizma': (r, g) => ({
      kart: {etiket: 'Bazal metabolizma', deger: sayi(r.bmh_kcal), birim: 'kcal / gün'},
      serit: [{ikon: 'saat', etiket: 'Saatte', deger: sayi(r.bmh_kcal / 24), birim: 'kcal'}, {ikon: 'couch', etiket: 'Hareketsiz', deger: sayi(r.bmh_kcal * 1.2), birim: 'kcal'}, {ikon: 'person-running', etiket: 'Orta aktif', deger: sayi(r.bmh_kcal * 1.55), birim: 'kcal'}],
      metin: `Vücudun tam dinlenirken, yalnız **temel işlevlerini** sürdürmek için günde yaklaşık ${kcal(r.bmh_kcal)} harcar. Gün içindeki hareketin bu sayının üstüne eklenir; şeritteki değerler ${g.yas} yaşında, ${ond(g.kilo_kg)} kg için iki aktivite düzeyini gösterir.`,
      eylemler: [gitBtn('Günlük kaloriyi hesapla', 'utensils', '#/hesaplayici/gunluk-kalori')]
    }),
    'beden-kutle-endeksi': r => ({
      kart: {etiket: 'Beden kütle endeksi', deger: ond(r.bki), birim: 'kg/m²', degisim: BKI_AD[r.kategori], degisimTon: r.kategori === 'normal' ? 'iyi' : 'uyari'},
      serit: [{ikon: 'arrow-down', etiket: 'Aralık altı', deger: ond(r.alt_kg), birim: 'kg'}, {ikon: 'arrow-up', etiket: 'Aralık üstü', deger: ond(r.ust_kg), birim: 'kg'}],
      metin: `Boyuna göre **${ond(r.alt_kg)}–${ond(r.ust_kg)} kg** arası, BKİ 18,5–24,9 aralığına denk gelir. BKİ kas ile yağı ayırmaz; bel çevresi ve vücut yağ oranıyla birlikte okunduğunda daha çok şey söyler.`,
      eylemler: [gitBtn('Vücut yağ oranına bak', 'percent', '#/hesaplayici/vucut-yag-orani')]
    }),
    'gunluk-kalori': (r, g) => {
      const tur = hedefTuruIlk(r), ak = AKTIVITE.find(x => String(x.k) === String(g.aktivite_katsayisi));
      return {
        kart: {etiket: 'Kilonu korumak için', deger: sayi(r.tdee_kcal), birim: 'kcal / gün'},
        serit: [{ikon: 'fire', etiket: 'Bazal', deger: sayi(r.bmh_kcal), birim: 'kcal'}, {ikon: 'arrow-down', etiket: 'Kilo vermek', deger: sayi(r.kilo_ver_kcal), birim: 'kcal'}, {ikon: 'arrow-up', etiket: 'Kilo almak', deger: sayi(r.kilo_al_kcal), birim: 'kcal'}],
        metin: `**${ak?.ad || 'Seçtiğin'}** düzeyinde kilonu korumak için yaklaşık enerji ihtiyacın. Bazal metabolizman **${kcal(r.bmh_kcal)}**; kilo vermek ve almak için günde ${sayi(h0('gunluk-kalori').ayar.band_farki_kcal)} kcal fark alınır.`,
        ek: `${DD.alan({etiket: 'Hedefin ne?', html: DD.segment({ad: 'h-hedef-turu', etiket: 'Hedefin ne?', secili: tur, ogeler: HEDEF_TUR.map(([deger, ad]) => ({ad, deger}))})})}${DD.satirlar([{ikon: 'hedef', baslik: 'Günlük kalori hedefin', deger: kcal(hedefKcal(r, tur))}])}`,
        bant: r.sinir && {ton: 'uyari', metin: `Yetişkin için en düşük enerji düzeyi **${sayi(EN_DUSUK)} kcal** olarak gösterildi (TÜBER 2022, Ek 3.1.1).`},
        eylemler: [uygulaBtn('kalori'), gitBtn('Uygun programları gör', 'program', '#/programlar')]
      };
    },
    'vucut-tipi': (r, g) => ({
      kart: {etiket: 'Bel / kalça oranı', deger: iki(r.oran), degisim: `${TIP_AD[r.tip]} tipi`, degisimTon: r.tip === 'elma' ? 'uyari' : 'iyi'},
      serit: [{ikon: 'ruler-horizontal', etiket: 'Bel', deger: ond(g.bel_cm), birim: 'cm'}, {ikon: 'ruler-horizontal', etiket: 'Kalça', deger: ond(g.kalca_cm), birim: 'cm'}],
      metin: {
        armut: `Yağ daha çok **kalça ve basende** toplanıyor. ${g.cinsiyet === 'kadin' ? 'Kadında' : 'Erkekte'} ${iki(r.t1)} altındaki oran bu dağılımı gösterir.`,
        dengeli: `Yağ **bel ile kalça arasında** dengeli dağılıyor. Oranın ${iki(r.t1)} ile ${iki(r.t2)} arasında.`,
        elma: `Yağ daha çok **bel çevresinde** toplanıyor; oranın ${iki(r.t2)} ve üstünde. Bel çevresi zamanla izlenmeye değer bir ölçü; değişimini Sağlık dosyanda takip edebilirsin.`
      }[r.tip],
      eylemler: [gitBtn(DD.uye() ? 'Sağlık dosyama git' : 'Vücut yağ oranına bak', DD.uye() ? 'file-medical' : 'percent', DD.uye() ? '#/saglik' : '#/hesaplayici/vucut-yag-orani')]
    }),
    'vucut-yag-orani': (r, g) => ({
      kart: {etiket: 'Vücut yağ oranı', deger: `%${ond(r.yag_orani_pct)}`, degisim: YAG_AD[r.siniflandirma], degisimTon: r.siniflandirma === 'yuksek' ? 'uyari' : 'iyi'},
      serit: [...(r.yag_kutlesi_kg != null ? [{ikon: 'droplet', etiket: 'Yağ kütlesi', deger: ond(r.yag_kutlesi_kg), birim: 'kg'}, {ikon: 'dumbbell', etiket: 'Yağsız kütle', deger: ond(r.yagsiz_kutle_kg), birim: 'kg'}] : []), {ikon: 'hedef', etiket: 'Üst sınır', deger: `%${r.hedef_ust_sinir_pct}`}],
      metin: `${r.yag_kutlesi_kg != null ? `${ond(g.kilo_kg)} kg ağırlığının yaklaşık **${ond(r.yag_kutlesi_kg)} kg**'ı yağ.` : 'Kilonu da girersen **yağ kütleni** de görürsün.'} ${g.cinsiyet === 'kadin' ? 'Kadında' : 'Erkekte'} sağlıklı aralığın üst sınırı **%${r.hedef_ust_sinir_pct}**; çevre ölçüsüyle yapılan tahmin ±%3-4 sapabilir.`,
      eylemler: [gitBtn('İdeal kilona bak', 'scale-balanced', '#/hesaplayici/ideal-kilo')]
    }),
    'gunluk-su': (r, g) => ({
      kart: {etiket: 'Günlük su ihtiyacın', deger: ond(r.su_litre), birim: 'L'},
      serit: [{ikon: 'droplet', etiket: 'Toplam', deger: sayi(r.su_ml), birim: 'mL'}, {ikon: 'dumbbell', etiket: 'Egzersiz eki', deger: sayi(r.ek_ml), birim: 'mL'}, {ikon: 'glass-water', etiket: 'Bardak', deger: String(Math.ceil(r.su_ml / DD.SU_BARDAK))}],
      metin: `${ond(g.kilo_kg)} kg için kilogram başına **${h0('gunluk-su').ayar.ml_per_kg} mL** hesaplandı${r.ek_ml ? `, egzersiz günü için ${sayi(r.ek_ml)} mL eklendi` : ''}. Yemeklerden ve içeceklerden gelen sıvı da bu toplama katılır.`,
      bant: r.ust_sinir_asildi && {ton: 'uyari', metin: `Hesap **4 litreyi** aştığı için üst sınırda gösterildi.`},
      eylemler: [uygulaBtn('su')]
    }),
    'ideal-kilo': (r, g) => ({
      kart: {etiket: 'İdeal kilon', deger: ond(r.ideal_kilo_kg), birim: 'kg'},
      serit: [{ikon: 'arrow-down', etiket: 'Aralık altı', deger: ond(r.alt_sinir_kg), birim: 'kg'}, {ikon: 'arrow-up', etiket: 'Aralık üstü', deger: ond(r.ust_sinir_kg), birim: 'kg'}],
      metin: `${g.boy_cm} cm boy için Devine formülü **${ond(r.ideal_kilo_kg)} kg** verir. Sağlıklı aralık daha geniştir: **${ond(r.alt_sinir_kg)}–${ond(r.ust_sinir_kg)} kg** arası BKİ 18,5–24,9'a denk gelir.`,
      eylemler: [gitBtn('Hedefime kaç haftada varırım?', 'calendar-check', '#/hesaplayici/hedef-kilo-suresi')]
    }),
    'hedef-kilo-suresi': (r, g) => ({
      kart: {etiket: 'Tahmini süre', deger: String(r.hafta_tam), birim: 'hafta', degisim: SURE_AD[r.kategori], degisimTon: r.kategori === 'surdurulebilir' ? 'iyi' : 'uyari'},
      serit: [{ikon: 'weight-scale', etiket: r.fark_kg < 0 ? 'Verilecek' : 'Alınacak', deger: ond(Math.abs(r.fark_kg)), birim: 'kg'}, {ikon: 'fire', etiket: 'Günlük fark', deger: sayi(r.gunluk_kcal_farki), birim: 'kcal'}, {ikon: 'takvim', etiket: 'Varış', deger: DD.tarihKisa(r.tahmini_tarih)}],
      metin: `Haftada **${ond(+g.hiz_kg_hafta, 2)} kg** hızla ${ond(Math.abs(r.fark_kg))} kg ${r.fark_kg < 0 ? 'vermek' : 'almak'} yaklaşık ${r.hafta_tam} hafta sürer; tahmini varış **${DD.tarihUzun(r.tahmini_tarih)}**. Bunun için günde ortalama ${kcal(r.gunluk_kcal_farki)} fark gerekir.`,
      bant: r.kategori !== 'surdurulebilir' && {ton: 'uyari', metin: r.kategori === 'cok_hizli' ? 'Bu hız haftada kilonun **%1’ini** aşıyor. Daha yavaş bir tempo kas kaybını ve geri alımı azaltır.' : 'Haftada **0,5 kg** üstü tempo uzun sürede zor sürdürülür; diyetisyeninle konuşmanı öneririz.'},
      eylemler: [gitBtn('Günlük kaloriyi hesapla', 'utensils', '#/hesaplayici/gunluk-kalori')]
    }),
    'makro-dagilim': (r, g) => ({
      kart: {etiket: 'Makrolardan gelen enerji', deger: sayi(r.toplam_kcal), birim: 'kcal / gün'},
      serit: [{ikon: 'egg', etiket: 'Protein', deger: String(r.protein_g), birim: 'g', alt: `${ond(r.protein_g / g.kilo_kg)} g/kg`}, {ikon: 'wheat-awn', etiket: 'Karb.', deger: String(r.karbonhidrat_g), birim: 'g', alt: `${ond(r.karbonhidrat_g / g.kilo_kg)} g/kg`}, {ikon: 'droplet', etiket: 'Yağ', deger: String(r.yag_g), birim: 'g', alt: `${ond(r.yag_g / g.kilo_kg)} g/kg`}],
      metin: `${ond(g.kilo_kg)} kg için **${ALAN.hedef.ogeler.find(o => o[0] === g.hedef)[1].toLocaleLowerCase('tr')}** hedefi ve ${ALAN.aktivite.ogeler.find(o => o[0] === g.aktivite)[1].toLocaleLowerCase('tr')} aktiviteyle günlük gram ihtiyacın. Protein ve karbonhidrat gramı 4, yağ gramı 9 kcal sayıldı.`,
      eylemler: [uygulaBtn('makro')]
    }),
    'porsiyon-hesaplama': (r, g) => ({
      kart: {etiket: 'Malzeme çarpanı', deger: `×${ond(r.carpan, 2)}`},
      serit: [{ikon: 'users', etiket: 'Tarif', deger: String(g.tarif_kisi), birim: 'kişi'}, {ikon: 'users', etiket: 'Yeni', deger: String(g.hedef_kisi), birim: 'kişi'}, ...(r.ornek_sonuc != null ? [{ikon: 'weight-scale', etiket: `${sayi(g.ornek_miktar)} g yerine`, deger: sayi(r.ornek_sonuc), birim: 'g'}] : [])],
      metin: `Tarifteki **her malzemeyi ×${ond(r.carpan, 2)}** ile çarp. Tuz ve baharatı önce çarpanın biraz altında koyup tadına bakarak tamamlamak daha güvenlidir; pişirme süresi kap boyuna göre değişebilir.`,
      eylemler: [gitBtn('Besin Kütüphanesi', 'apple-whole', '#/besinler')]
    })
  };
  const h0 = slug => bul(slug);
  const genelBilgi = () => DD.bant({ton: 'bilgi', metin: 'Sonuç **tahminidir**; tıbbi teşhis ya da tedavi yerine geçmez. Gebelik, kronik hastalık ya da düzenli ilaç kullanımında hekimine ve diyetisyenine danış.'});
  const sonucHtml = (h, x) => {
    const o = SONUC[h.slug](x.sonuc, x.girdi);
    return `<div class="dd-yigin">${DD.metrikKart({ikon: h.ikon, ...o.kart})}${o.serit?.length ? DD.ozetSerit(o.serit) : ''}${o.ek || ''}${DD.p(o.metin)}${o.bant ? DD.bant(o.bant) : ''}${o.eylemler?.length ? `<div class="dd-yigin-8">${o.eylemler.join('')}</div>` : ''}${genelBilgi()}</div>`;
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
  const VURGU = {'bazal-metabolizma': 'dinlenme enerjisini', 'beden-kutle-endeksi': 'BKİ değerini', 'gunluk-kalori': 'koru, ver ya da al', 'vucut-tipi': 'elma, armut ya da dengeli', 'vucut-yag-orani': 'yağın yüzdesini', 'gunluk-su': 'günlük su ihtiyacını', 'ideal-kilo': 'sağlıklı kilo aralığını', 'hedef-kilo-suresi': 'kaç haftada', 'makro-dagilim': 'protein, karbonhidrat ve yağ', 'porsiyon-hesaplama': 'yeniden ölçekle'};
  const vurgula = (metin, ifade) => (ifade && metin.includes(ifade) ? metin.replace(ifade, `**${ifade}**`) : `**${metin}**`);
  const formulMetin = f => f.replace(/^([^=:,]+?)(\s*[=:,])/, '**$1**$2');
  const formCiz = h => {
    const t = taslak(h), x = kayit(h.slug), alanlar = gorunen(h, t.s);
    const gecis = DD.cipler({ad: 'hesaplayici', tur: 'tek', etiket: 'Hesaplayıcılar', secili: h.slug, ogeler: L().hesaplayicilar.map(y => ({metin: y.kisaAd, deger: y.slug, ikon: y.ikon}))});
    const bilgi = profil() && alanlar.some(ad => ALAN[ad].p) ? 'Alanlar **profilinden** dolduruldu; değiştirdiğin değer yalnız bu hesapta kullanılır.' : 'Sonucun **bu cihazda** hesaplanır, hiçbir yere gönderilmez.';
    return DD.gruplar([
      x?.sonuc && {baslik: 'Sonucun', html: sonucHtml(h, x)},
      {baslik: x?.sonuc ? 'Bilgilerin' : 'Bilgilerini gir', eylem: {html: DD.btn({metin: 'Sıfırla', ikon: 'rotate-left', tur: 'text', boyut: 'sm', veri: {eylem: 'sifirla'}})}, html: `<div class="dd-yigin">${DD.p(bilgi, {ton: 'ikincil'})}${alanlar.map(ad => alanHtml(h, ad, t)).join('')}</div>`},
      {baslik: 'Nasıl hesaplanır?', html: `<div class="dd-yigin-12">${DD.p(formulMetin(h.formul))}${h.kaynaklar.length ? DD.p(`**Kaynak:** ${h.kaynaklar.join(' · ')}`, {ton: 'ikincil', meta: true}) : ''}</div>`},
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
          kayitYaz(h.slug, {girdi: g, sonuc: r.sonuc, tarih: DD.bugunIso(), zaman: Date.now()});
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
