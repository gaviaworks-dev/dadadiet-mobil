/* Telefon özellikleri (#/telefon, alt; Ayarlar > Uygulama): etkileşimli widget kataloğu ve telefonun sistem yüzeyleri.
 * Bölümler (sekme): widget (ana ekran widget'ları: iOS küçük/orta/büyük, Android 2×2/4×2/4×4), kilit (iOS kilit ekranı widget'ları + StandBy; Android kilit ekranı),
 * canli (iOS Canlı Etkinlik + Dinamik Ada kompakt/genişletilmiş/minimal; Android 16 canlı bildirim + durum çipi), ayar (iOS Denetim Merkezi denetimi /
 * Android Hızlı Ayarlar kutucuğu "Su ekle"), komut (Siri / Gemini sesli komut). Çerçeve ve parçalar kanon/dd-cihaz.js; marka logosu yok.
 *
 * Veri (uydurma sayı yok; hepsi Bugün, Ritim ve Uzmanım ile aynı kaynak):
 *   kalori: hedef plan → kisa-hedef → DDV.bugun; kalan DD.gunKalan (Bugün halkası). Makrolar öğün kayıtlarından Bugün'ün kuralıyla toplanır; toplam kcal
 *     DD.gunKalan ile tutmazsa makro gizlenir (Alınan/Hedef satırı). Su '<önek>-su' (profil.js ile aynı yazım). Öğün '<önek>-ogun' / '<önek>-ek'.
 *   oruç: ritim.js kaydı ('ritim-kayit', 'ritim-durum', planImza denetimi, aynı zaman formülü). Karar 3: oruç başlamadıysa hiçbir yerde ilerleme yok;
 *     widget'ta hedef süre + "Orucu başlat", kilit ekranında ve Canlı Etkinlik'te sayaç yok. Başlat/Bitir ritim.js'in yazdığı kaydı aynı biçimde yazar.
 *   diyetisyen: DDV.benimDiyetisyenim (sohbet + 'uzman-sohbet', okunmamış kuralı 'uzman-okundu', randevu 'uzman-randevu'); yeni hesapta diyetisyen yok.
 * Widget durumları (durum): dolu (güncel veri), bos (ilk gün: kayıt yok, hedefler planın), giris (oturum yok), cevrimdisi (son güncelleme saati: günün son
 *   su kaydı, yoksa uygulamanın açıldığı an), pro (Pro'ya özel; yalnız kalori widget'ında gösterilir, karar bekliyor).
 * Etkileşim: widget düğmeleri (data-wg-eylem: su-ekle, ogun-yedim, oruc-baslat, oruc-bitir) gerçek kaydı yazar, Bugün/Ritim aynı veriyi görür;
 *   gövdeye ya da bağlantıya dokunmak (data-wg-ac) uygulamayı çerçeve içinde o rotada açar; altta "Uygulamada aç" gerçek rotaya gider.
 * Saat: telefonun kendi saati 17:10 (sistem biçimi); uygulama metinleri noktalı (19.30).
 * Görünüm 'telefon-gorunum' {sekme, platform, tema, wg, boy, durum, gor, gece, etkinlik, komut}; sorgu aynı adlarla ezer
 *   (#/telefon?sekme=widget&wg=su&boy=orta&platform=android&tema=koyu&durum=cevrimdisi). Ekrana özgü ?hal= yok; ortak haller router'dan. */
(() => {
  const {sayi, sure} = DD;
  const K = 'telefon-gorunum';
  const WG = {
    kalori: {ad: 'Kalori ve makro', ikon: 'fire-flame-curved', boylar: ['kucuk', 'orta', 'buyuk']},
    su: {ad: 'Su', ikon: 'glass-water', boylar: ['kucuk', 'orta']},
    ogun: {ad: 'Bugün tabağım', ikon: 'utensils', boylar: ['kucuk', 'orta', 'buyuk']},
    oruc: {ad: 'Oruç', ikon: 'hourglass-half', boylar: ['kucuk', 'orta']},
    diyetisyen: {ad: 'Diyetisyen', ikon: 'user-doctor', boylar: ['kucuk', 'orta', 'buyuk']}
  };
  // Pro'ya özel hal: hangi widget'ın Pro'ya özel olacağı ürün kararı bekliyor (Pro satışta değil). Hal yalnız Pro'ya aday tek yüzeyde,
  // büyük "Günün özeti"nde (kalori, büyük) gösterilir; temel widget'lar ücretsiz okunsun.
  const PRO_WG = 'kalori', PRO_BOY = 'buyuk';
  const proMu = g => g.wg === PRO_WG && g.boy === PRO_BOY;
  const SECENEK = {
    sekme: ['widget', 'kilit', 'canli', 'ayar', 'komut'], platform: ['ios', 'android'], tema: ['acik', 'koyu'], wg: Object.keys(WG), boy: ['kucuk', 'orta', 'buyuk'],
    durum: ['dolu', 'bos', 'giris', 'cevrimdisi', 'pro'], gor: ['kilit', 'standby'], gece: ['gunduz', 'gece'], etkinlik: ['oruc', 'randevu', 'akis'], adim: ['0', '4', '8', '12', '16'], komut: ['su', 'ogle']
  };
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');
  const hm = ms => new Date(ms).toTimeString().slice(0, 5);
  const saat = ms => nk(hm(ms));                 // uygulama metni: 12.05
  const sistemSaat = hm;                          // telefonun saati: 17:10
  const gunBasi = ms => new Date(ms).setHours(0, 0, 0, 0);
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const acilis = Date.now();
  const SOZ = {su: 'Dada Diet’e bir bardak su ekle', ogle: 'Dada Diet’e öğle yemeğimi kaydet'};

  const varsayilan = () => ({sekme: 'widget', platform: /android/i.test(navigator.userAgent) ? 'android' : 'ios', tema: 'acik', wg: 'kalori', boy: 'kucuk', durum: 'dolu', gor: 'kilit', gece: 'gunduz', etkinlik: 'oruc', adim: '0', komut: 'su'});
  const duzelt = g => {
    if (!WG[g.wg].boylar.includes(g.boy)) g.boy = 'orta';
    if (g.durum === 'pro' && !proMu(g)) g.durum = 'dolu';
    return g;
  };
  const gorunum = ctx => {
    const {durum: _eski, ...kayitli} = DD.durum.oku(K, {});
    const g = {...varsayilan(), ...kayitli};
    Object.keys(SECENEK).forEach(k => { if (!SECENEK[k].includes(g[k])) g[k] = varsayilan()[k]; const v = ctx?.sorgu?.[k]; if (SECENEK[k].includes(v)) g[k] = v; });
    return duzelt(g);
  };
  // Durum seçimi (giriş yok, çevrimdışı…) ve geçici sahne alanları kalıcı yazılmaz: ekran her açılışta güncel veriyle başlar.
  const kaydet = g => { const {acik, durum, komutAsama, komutOnce, ...kalici} = g; DD.durum.yaz(K, kalici); };

  // ---------- Veri ----------
  const yeni = () => DD.yeniHesap();
  const onek = () => (yeni() ? 'yeni' : 'bugun');
  const plan = () => DD.durum.oku('plan', null), kisa = () => DD.durum.oku('kisa-hedef', null);
  const kcalHedef = () => plan()?.hedefKcal ?? kisa()?.kcal ?? DDV.bugun.hedefKcal;
  const makroHedef = m => plan()?.makro?.[m] ?? kisa()?.makro?.[m] ?? DDV.bugun.makro[m].hedef;
  const suHedef = () => plan()?.suMl ?? kisa()?.suMl ?? DDV.bugun.su.hedefMl;
  const suOku = () => DD.durum.oku(`${onek()}-su`, yeni() ? {icilenMl: 0, kayitlar: []} : {icilenMl: DDV.bugun.su.icilenMl, kayitlar: DDV.bugun.su.kayitlar});
  const MAKRO = ['P', 'K', 'Y'];

  // Günün öğünleri Bugün'ün kuralıyla: üyede plan öğünü + karar ('dolu' | 'degisti' | 'atlandi') + eklenenler; yeni hesapta yalnız eklenenler.
  const ogunler = () => {
    const dur = DD.durum.oku(`${onek()}-ogun`, {}), ek = DD.durum.oku(`${onek()}-ek`, {});
    return DDV.bugun.ogunler.map(o => {
      const d = dur[o.id], e = ek[o.id] || [];
      let yenen, durum;
      if (d?.durum === 'atlandi') { yenen = []; durum = 'atlandi'; }
      else if (yeni()) { yenen = e; durum = e.length ? 'dolu' : 'planli'; }
      else if (d?.durum === 'degisti') { yenen = [...o.besinler.filter(b => d.besinler.includes(b.slug)), ...e]; durum = 'dolu'; }
      else if (d?.durum === 'dolu' || o.durum === 'dolu') { yenen = [...o.besinler, ...e]; durum = 'dolu'; }
      else { yenen = e; durum = e.length ? 'dolu' : 'planli'; }
      const plandaki = yeni() ? [] : o.besinler;
      const kcal = durum === 'atlandi' ? null : durum === 'dolu' ? toplam(yenen, 'kcal') : plandaki.length ? toplam(plandaki, 'kcal') : null;
      return {id: o.id, ad: o.ad, ikon: o.ikon, saat: nk(o.saat), dk: DD.saatDk(o.saat), durum, kcal, yenen, besinler: (durum === 'planli' ? plandaki : yenen).map(b => kisaAd(b.ad))};
    });
  };
  // Widget'ta besin adı kısa: parantez içi hazırlama notu atılır ("Barbunya (kuru · haşlanmış)" → "Barbunya").
  const kisaAd = ad => String(ad).replace(/\s*\([^)]*\)/g, '').trim();
  const siradakiBul = l => { const simdi = DD.saatDk(DDV.bugun.simdi), acik = l.filter(o => o.durum === 'planli'); return acik.find(o => o.dk >= simdi) || acik[0] || null; };
  const kalori = () => {
    if (DD.hedefsiz()) return {hedef: null};
    const hedef = kcalHedef(), l = ogunler(), yenenler = l.flatMap(o => (o.durum === 'dolu' ? o.yenen : []));
    // Bugün'ün kipi (bugun-kip) oturumla aynıysa halkanın kendi hesabı; giriş sonrası Bugün henüz açılmadıysa kip eskidir, aynı kuralla buradan toplanır.
    const kipAyni = DD.durum.oku('bugun-kip', 'bugun') === onek();
    const alinan = toplam(yenenler, 'kcal'), kalan = (kipAyni ? DD.gunKalan?.() : null) ?? hedef - alinan;
    // Makro yalnız toplam kcal Bugün'ün hesabıyla aynıysa gösterilir (iki hesap ayrışırsa uydurmamak için Alınan/Hedef satırı).
    const tutarli = Math.round(hedef - kalan) === Math.round(alinan);
    return {hedef, alinan: hedef - kalan, kalan, makro: tutarli ? Object.fromEntries(MAKRO.map(m => [m, {alinan: toplam(yenenler, m), hedef: makroHedef(m)}])) : null};
  };
  const su = () => ({icilen: suOku().icilenMl || 0, hedef: suHedef(), bardak: DD.SU_BARDAK});
  const sonGuncelleme = () => { const k = suOku().kayitlar || []; return k.length ? nk(k[k.length - 1].saat) : saat(DD.simdi().getTime()); };

  // Ritim: yalnız gerçek kayıt. Oruç başlamamışsa (pencere, kayıt yok, misafir onayı yok) sayaç ve ilerleme yoktur.
  const ORUC_ENGEL = ['gebelik', 'yeme-bozuklugu'];
  const planImza = () => { const p = plan(); return p ? `${p.orucProtokolu ?? 'atlandi'}@${p.ilkOgunSaati}` : null; };
  const planProtokol = () => { const id = plan()?.orucProtokolu?.replace(':', '-'); return DDV.ritim.protokoller.find(r => r.id === id && !r.haftalik)?.id ?? null; };
  const ritimHal = () => {
    const engel = !!DD.durum.oku('oruc-saglik')?.engel || (plan()?.hassasiyetler || []).some(h => ORUC_ENGEL.includes(h));
    const k = DD.durum.oku('ritim-kayit', null);
    if (engel || (plan()?.orucProtokolu === 'yok' && !k?.protokol)) return {hal: 'kapali', engel};
    if (yeni() && !DD.durum.oku('oruc-saglik')?.onay) return {hal: 'bos'};
    return {hal: 'acik'};
  };
  const ritimKayit = () => { const ham = DD.durum.oku('ritim-kayit', null); return ham && (ham.planImza ?? null) === planImza() ? ham : null; };
  const ritimAn = k => DD.simdi().getTime() + Date.now() - (k?.capa ?? acilis);
  const gunOn = (ms, an) => (gunBasi(ms) > gunBasi(an) ? 'Yarın ' : gunBasi(ms) < gunBasi(an) ? 'Dün ' : '');
  // Plan yokken ya da kayıtta başlangıç yokken Ritim'in varsayılanı (ritim.js evre/varsayilan): ilk öğün saatine göre evre ve başlangıç.
  const varsayilanEvre = () => {
    const p = plan(), x = DDV.ritim.protokoller.find(r => r.id === planProtokol());
    if (!x) return {d: DDV.ritim.aktifDurum, bas: new Date(DDV.ritim.durumlar.pencere.baslangic.slice(0, 16)).getTime()};
    const su = DD.simdi().getTime(), ilk = gunBasi(su) + DD.saatDk(p.ilkOgunSaati) * 6e4, son = ilk + x.pencereSaat * 36e5;
    if (su < ilk) return {d: 'oruc', bas: ilk - x.orucSaat * 36e5};
    return su < son ? {d: 'pencere', bas: ilk} : {d: 'oruc', bas: son};
  };
  const ritim = () => {
    const R = DDV.ritim, k = ritimKayit(), v = varsayilanEvre(), d = DD.durum.oku('ritim-durum', null) || v.d, h = ritimHal();
    const p = R.protokoller.find(x => x.id === (k?.protokol ?? planProtokol() ?? R.aktifProtokol));
    const temel = {hal: h.hal, engel: h.engel, protokol: p, durum: d, canli: false};
    if (h.hal !== 'acik' || !p || p.haftalik) return temel;
    // ritim.js basMs ile aynı: kayıttaki başlangıç, yoksa varsayılan evrenin başı
    const bas = k?.bas ?? (v.d === d || d !== 'oruc' ? v.bas : ritimAn(k));
    const anMs = ritimAn(k), hedefSaat = d === 'oruc' ? p.orucSaat : p.pencereSaat, gecenSn = Math.max(0, (anMs - bas) / 1000), bitMs = bas + hedefSaat * 36e5;
    const kalanDk = Math.ceil(hedefSaat * 60 - gecenSn / 60);
    const kalanMetin = d === 'oruc' ? (kalanDk > 0 ? `Kalan ${sure(kalanDk)}` : 'Hedefine ulaştın') : (kalanDk > 0 ? `Kapanmasına ${sure(kalanDk)}` : 'Pencere süresi doldu');
    return {
      ...temel, canli: d === 'oruc', gecenSn, hedefSaat, anMs, bitMs, oran: Math.min(1, gecenSn / (hedefSaat * 3600)), kalanMetin,
      kisaMetin: kalanDk > 0 ? `${sure(kalanDk)} kaldı` : kalanMetin, baslik: R.durumlar[d].rozet, etiket: `Ritim · ${p.ad}`,
      bas: `${gunOn(bas, anMs)}${saat(bas)}`, bit: `${gunOn(bitMs, anMs)}${saat(bitMs)}`
    };
  };
  // iPhone Canlı Etkinlik sınırı: 8 saat güncellenir; sonra bitiş içeriği kilit ekranında en çok 4 saat kalır, Ada'dan kalkar (karar 1).
  const LA_SN = 8 * 3600, LA_KALIR_SN = 4 * 3600;
  const iosKart = (r, eylem) => {
    if (r.gecenSn < LA_SN) return DD.canliEtkinlik({platform: 'ios', durum: 'oruc', baslik: r.baslik, etiket: r.etiket, gecenSn: r.gecenSn, oran: r.oran, kalanMetin: r.kalanMetin, bas: r.bas, bit: r.bit, ...eylem});
    if (r.gecenSn < LA_SN + LA_KALIR_SN) return DD.canliEtkinlik({platform: 'ios', durum: 'oruc', bitti: true, baslik: 'Orucun devam ediyor', kalanMetin: 'Kalan süre widget’ta', sureMetin: '8 sa', oran: LA_SN / (r.hedefSaat * 3600), etiket: r.etiket});
    return '';
  };
  // Oruç sürerken tek kaynak (gerçek kayıt, StandBy ve 16 saatlik akış aynı işlevden): ana ekran widget'ı ve kilit ekranı dikdörtgeni
  // kalan süreyi sistem sayacıyla geri sayar (WidgetKit Text(timerInterval:countsDown:), Android Chronometer); geçen süre ikincil satırda akar.
  // Hedefe ulaşınca kalan sayacı kalkar, "Hedefine ulaştın".
  const orucSuren = ({gecenSn, hedefSaat, oran, bas, bit}) => {
    const kalanSn = hedefSaat * 3600 - gecenSn, tamam = kalanSn <= 0, kalanYazi = `Kalan ${sure(Math.ceil(kalanSn / 60))}`;
    return {
      tamam, kalanSn,
      widget: {durum: 'oruc', baslik: tamam ? 'Hedefine ulaştın' : 'Oruç · kalan', gecenSn, oran: tamam ? 1 : oran, kalanSn: tamam ? null : kalanSn, kalanMetin: tamam ? 'Hedefine ulaştın' : kalanYazi, kisaMetin: tamam ? `${hedefSaat} sa tamam` : `Bitiş ${bit}`, bas, bit, eylem: 'Orucu bitir'},
      rect: (o = {}) => (tamam
        ? DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Hedefine ulaştın', metin: `${hedefSaat} sa tamam`, alt: o.alt || 'Ritim’de bitir', oran: 1, ac: o.ac, aria: `Oruç: hedefine ulaştın, ${hedefSaat} saat`})
        : DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Oruç · kalan', sayac: DD.cihazGeriSayac(kalanSn), metin: '', alt: o.alt || `Bitiş ${bit}`, oran, ac: o.ac, aria: `Oruç: ${kalanYazi.toLocaleLowerCase('tr')}, bitiş ${bit}`}))
    };
  };
  const orucWidget = (r, ilkGun) => {
    if (r.hal === 'kapali') return {durum: 'kapali', baslik: r.engel ? 'Oruç sana önerilmiyor' : 'Oruç takibi kapalı', metin: r.engel ? 'Sağlık bilgilerine göre sayaç kapalı' : 'Ritim’den bir plan seç'};
    if (r.protokol?.haftalik) return {durum: 'kapali', baslik: `${r.protokol.ad} planı`, metin: 'Haftalık planda günlük sayaç yok'};
    if (r.canli && !ilkGun) return orucSuren(r).widget;
    const p = r.protokol || DDV.ritim.protokoller.find(x => x.id === DDV.ritim.aktifProtokol);
    const pencere = !ilkGun && r.durum === 'pencere' && r.bitMs;
    return {
      durum: 'hazir', baslik: 'Oruç başlamadı', hedefSaat: p.orucSaat, pencereSaat: p.pencereSaat, alt: `${p.ad} oruç hedefin`,
      metin: pencere ? `Pencere kapanışı ${saat(r.bitMs)}` : `${p.ad} planın hazır`, eylem: 'Orucu başlat',
      // Misafir önce Ritim'deki sağlık sorusunu yanıtlar: düğme uygulamayı Ritim'de açar.
      eylemAc: r.hal === 'bos' ? '#/ritim' : null
    };
  };

  // Diyetisyen ve randevu (uzman.js ile aynı okuma)
  const B = () => DDV.benimDiyetisyenim;
  const randevuMs = r => new Date(`${r.tarih}T${r.saat}:00`).getTime();
  const kalanYazi = ms => { const dk = Math.round((ms - DD.simdi().getTime()) / 6e4); if (dk <= 0) return 'Görüşme saati geldi'; const gun = Math.floor(dk / 1440); return gun >= 1 ? `${gun} gün sonra` : `${sure(dk)} sonra`; };
  const diyetisyen = () => {
    if (yeni()) return {diyetisyen: null};
    const d = DDV.diyetisyenler.find(x => x.slug === B().diyetisyen), r = DD.durum.oku('uzman-randevu', B().sonrakiRandevu);
    const ham = [...B().sohbet.mesajlar, ...DD.durum.oku('uzman-sohbet', [])], son = DD.durum.oku('uzman-okundu', B().sohbet.mesajlar[B().sohbet.mesajlar.length - 2].id);
    const t = r && new Date(`${r.tarih}T12:00:00`);
    return {
      diyetisyen: {kisaAd: d.kisaAd, unvan: d.unvan, harf: d.harf},
      mesajlar: ham.map(m => ({kim: m.kim, metin: m.metin, saat: nk(m.saat)})),
      okunmamis: ham.filter(m => m.kim !== 'ben' && m.id > son).length,
      randevu: r ? {gun: r.tarihMetin.split(' ')[0], saat: nk(r.saat), kalan: kalanYazi(randevuMs(r)), gunNo: String(t.getDate()), ay: t.toLocaleDateString('tr-TR', {month: 'short'}), baslik: r.baslik, tur: r.tur, ham: r} : null
    };
  };

  // Widget verisi seçilen duruma göre. bos: ilk gün (kayıt yok; hedefler ve planlı öğünler duruyor).
  const widgetVeri = (wg, g) => {
    const ortak = {boy: g.boy, eski: g.durum === 'cevrimdisi' ? sonGuncelleme() : null};
    if (g.durum === 'giris') return {...ortak, hal: 'giris'};
    if (g.durum === 'pro') return {...ortak, hal: 'pro', pro: {rozet: DDV.uye.pro.rozet, metin: DDV.uye.pro.durumMetni}};
    const ilk = g.durum === 'bos', l = ilk ? ogunler().map(o => ({...o, durum: 'planli', kcal: yeni() ? null : DDV.bugun.ogunler.find(x => x.id === o.id).kcal, besinler: yeni() ? [] : DDV.bugun.ogunler.find(x => x.id === o.id).besinler.map(b => kisaAd(b.ad))})) : ogunler();
    if (wg === 'kalori') {
      const k = kalori();
      if (ilk && k.hedef != null) Object.assign(k, {alinan: 0, kalan: k.hedef, makro: Object.fromEntries(MAKRO.map(m => [m, {alinan: 0, hedef: makroHedef(m)}]))});
      return {...ortak, ...k, ogunler: l, siradakiId: siradakiBul(l)?.id, su: ilk ? {...su(), icilen: 0} : su()};
    }
    if (wg === 'su') return {...ortak, ...su(), ...(ilk ? {icilen: 0} : {})};
    if (wg === 'ogun') { const yenen = l.filter(o => o.durum === 'dolu'); return {...ortak, ogunler: l, siradaki: siradakiBul(l), ozet: `${yenen.length} / ${l.length} öğün`}; }
    if (wg === 'oruc') return {...ortak, ...orucWidget(ritim(), ilk)};
    return {...ortak, ...(ilk ? {diyetisyen: null} : diyetisyen())};
  };
  const CIZ = {kalori: DD.widgetKalori, su: DD.widgetSu, ogun: DD.widgetOgun, oruc: DD.widgetOruc, diyetisyen: DD.widgetDiyetisyen};
  const widgetCiz = (wg, g) => CIZ[wg](widgetVeri(wg, g));

  // ---------- Yazım: Bugün ve Ritim'in yazdığı biçimde ----------
  const suEkle = () => {
    const s = suOku(), once = {...s, kayitlar: [...(s.kayitlar || [])]}, an = DD.simdi();
    const kayitlar = [...once.kayitlar, {saat: DD.saatMetin(an.getHours() * 60 + an.getMinutes()), ml: DD.SU_BARDAK}];
    DD.durum.yaz(`${onek()}-su`, {...s, kayitlar, icilenMl: toplam(kayitlar, 'ml')});
    return {geri: () => DD.durum.yaz(`${onek()}-su`, once), metin: `Su eklendi: **${sayi(toplam(kayitlar, 'ml'))} / ${sayi(suHedef())} ml**. Bugün’de de görünür.`};
  };
  const ogunYedim = id => {
    const a = `${onek()}-ogun`, l = DD.durum.oku(a, {}), once = {...l}, ad = DDV.bugun.ogunler.find(o => o.id === id)?.ad || 'Öğün';
    DD.durum.yaz(a, {...l, [id]: {durum: 'dolu'}});
    return {geri: () => DD.durum.yaz(a, once), metin: `**${ad}** kaydedildi. Bugün’de de görünür.`};
  };
  const ritimAnlik = () => ({k: DD.durum.oku('ritim-kayit', null), d: DD.durum.oku('ritim-durum', null)});
  const ritimGeri = s => () => { if (s.k) DD.durum.yaz('ritim-kayit', s.k); else DD.durum.sil('ritim-kayit'); if (s.d) DD.durum.yaz('ritim-durum', s.d); else DD.durum.sil('ritim-durum'); };
  const ritimYaz = k => DD.durum.yaz('ritim-kayit', {...k, capa: k.capa ?? acilis, planImza: planImza()});
  const gunAdi = ms => ({'-1': 'Dün', 0: 'Bugün', 1: 'Yarın'}[Math.round((gunBasi(ms) - gunBasi(DD.simdi().getTime())) / 864e5)] ?? DD.tarihKisa(new Date(ms).toLocaleDateString('sv')));
  const orucBaslat = () => {
    const once = ritimAnlik(), k = {protokol: planProtokol() ?? DDV.ritim.aktifProtokol, gecmis: [], kisitli: ['Pzt', 'Per'], ...ritimKayit()};
    ritimYaz({...k, bas: ritimAn(k), son: null});
    DD.durum.yaz('ritim-durum', 'oruc');
    return {geri: ritimGeri(once), metin: 'Orucun başladı. Sayaç Ritim’de ve kilit ekranında.'};
  };
  const orucBitir = () => {
    const once = ritimAnlik(), k = {protokol: planProtokol() ?? DDV.ritim.aktifProtokol, gecmis: [], ...ritimKayit()}, p = DDV.ritim.protokoller.find(x => x.id === k.protokol);
    const bas = k.bas ?? ritim().anMs - ritim().gecenSn * 1000, bit = ritimAn(k), hedef = p?.orucSaat ?? DDV.ritim.durumlar.oruc.hedefSaat, sureDk = Math.round((bit - bas) / 6e4), tamam = sureDk >= hedef * 60;
    const satir = {tarih: new Date(bit).toLocaleDateString('sv'), baslangic: hm(bas), bitis: hm(bit), sureSaat: Math.round(sureDk / 6) / 10, hedefSaat: hedef, tamamlandi: tamam};
    ritimYaz({...k, bas: bit, gecmis: sureDk ? [...k.gecmis, satir] : k.gecmis, son: tamam ? {sureDk, hedefSaat: hedef, bas: `${gunAdi(bas)} ${hm(bas)}`, bit: `${gunAdi(bit)} ${hm(bit)}`} : null});
    DD.durum.yaz('ritim-durum', 'pencere');
    return {geri: ritimGeri(once), metin: tamam ? 'Orucun tamamlandı' : sureDk ? `**${sure(sureDk)}** kaydedildi, pencere açıldı` : 'Pencere yeniden açıldı'};
  };
  const EYLEM = {'su-ekle': suEkle, 'ogun-yedim': ogunYedim, 'oruc-baslat': orucBaslat, 'oruc-bitir': orucBitir};

  // ---------- Ortak parçalar ----------
  const tarih = (ms, p, kisaMi) => { const t = new Date(ms), f = o => t.toLocaleDateString('tr-TR', o); if (p === 'android' || kisaMi) return `${f({weekday: 'short'})} ${f({day: 'numeric', month: 'short'})}`.replace(' ', p === 'android' ? ', ' : ' '); return `${f({day: 'numeric', month: 'long'})} ${f({weekday: 'long'})}`; };
  const adimlar = (baslik, l) => DD.ako({baslik, acik: true, html: DD.cihazAdimlar(l)});
  const cip = (ad, etiket, secili, ogeler, yardim) => DD.alan({etiket, yardim, html: DD.cipler({ad, tur: 'tek', secili, serit: false, ogeler})});
  const seg = (ad, etiket, secili, ogeler) => DD.alan({etiket, html: DD.segment({ad, etiket, secili, ogeler})});
  const durumCip = (g, pro) => cip('telefon-durum', 'Widget durumu', g.durum, [
    {metin: 'Güncel', deger: 'dolu', ikon: 'circle-check'}, {metin: 'İlk gün', deger: 'bos', ikon: 'seedling'}, {metin: 'Giriş yok', deger: 'giris', ikon: 'right-to-bracket'},
    {metin: 'Çevrimdışı', deger: 'cevrimdisi', ikon: 'clock-rotate-left'}, ...(pro ? [{metin: 'Pro’ya özel', deger: 'pro', ikon: 'bolt'}] : [])
  ], {dolu: 'Bugün’deki gerçek verin.', bos: 'Kayıt yokken: hedefler ve planlı öğünler durur, değerler sıfırdan başlar.', giris: 'Oturum yokken widget yalnız giriş ister.', cevrimdisi: `Bağlantı yokken son veri kalır; başlıkta son güncelleme saati (${sonGuncelleme()}).`, pro: `${DDV.uye.pro.durumMetni}`}[g.durum]);
  const BOY_AD = {ios: {kucuk: 'Küçük', orta: 'Orta', buyuk: 'Büyük'}, android: {kucuk: '2×2', orta: '4×2', buyuk: '4×4'}};
  const ROTA_AD = {'#/bugun': 'Bugün', '#/ritim': 'Oruç & Saatler', '#/uzman': 'Uzmanım', '#/uzman/sohbet': 'Diyetisyen sohbeti', '#/uzman/bul': 'Diyetisyen bul', '#/giris': 'Giriş', '#/pro': 'Dada Diet Pro', '#/ai/kamera': 'Ne Yedim? kamerası', '#/besin-ara': 'Besin ara', '#/ai/ses': 'Sesle kayıt'};
  const rotaAd = r => ROTA_AD[r] || (r.startsWith('#/ogun/') ? DDV.bugun.ogunler.find(o => o.id === r.slice(7))?.ad || 'Öğün' : 'Dada Diet');

  // Uygulama açıldı: çerçeve hedef rotayı gösterir; altında geri ve gerçek rotaya geçiş.
  const acikPanel = g => {
    const an = DD.simdi().getTime(), ad = rotaAd(g.acik);
    return `${DD.telefonCerceve({platform: g.platform, tema: g.tema, saat: sistemSaat(an), etiket: `Dada Diet ${ad} ekranıyla açıldı`, icerik: DD.telefonUygulama({rota: g.acik, platform: g.platform, baslik: ad})})}
      ${DD.p(`Widget’a dokununca Dada Diet **${ad}** ekranıyla açılır.`, {ton: 'ikincil'})}
      <div class="dd-ikili">${DD.btn({metin: 'Geri dön', ikon: 'geri', tur: 'secondary', tam: true, veri: {eylem: 'tel-kapat'}})}${DD.btn({metin: 'Uygulamada aç', ikon: 'arrow-up-right-from-square', tam: true, git: g.acik})}</div>`;
  };

  // ---------- Ana ekran widget'ları ----------
  const WG_METIN = {
    kalori: {ios: 'Kalanın, alınan ve hedef bir bakışta; orta boyda makrolar, büyük boyda günün öğünleri ve su. Büyük boyda **Yedim** ve **+1 bardak** uygulamayı açmadan kaydeder.'},
    su: {ios: '**+1 bardak** düğmesi uygulamayı açmadan Bugün’deki su kaydına 200 ml ekler; widget’ın kendisine dokununca Bugün açılır.'},
    ogun: {ios: 'Sıradaki öğün ve besinleri. **Yedim** planlı öğünü kaydeder; besin eklemek ya da fotoğraf çekmek uygulamada açılır (widget’ta yazı girilmez).'},
    oruc: {ios: 'Oruç başlamadıysa hedef süren ve **Orucu başlat** düğmesi; başladıysa geçen süre, ilerleme ve **Orucu bitir**. Ritim ile aynı kayıt.'},
    diyetisyen: {ios: 'Diyetisyeninden son mesaj ve sıradaki görüşme. **Yanıtla** sohbeti açar. Kilitliyken mesaj metni gizlenir.'}
  };
  const widgetBolum = g => {
    const p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), w = WG[g.wg];
    const simge = {kucuk: 19, orta: 15, buyuk: 7}[g.boy];   // altı sıralık ızgara dolar (24 hücre)
    const cerceve = DD.telefonCerceve({
      platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true,
      etiket: `${ios ? 'iPhone' : 'Android'} ana ekranı: ${w.ad} widget’ı, ${BOY_AD[p][g.boy]} boy`,
      icerik: DD.anaEkran({widgetlar: [widgetCiz(g.wg, g)], simge, ara: ios, dock: true, tarih: ios ? '' : tarih(an, 'android')})
    });
    const adim = ios
      ? ['Ana ekranda boş bir yere **basılı tut**.', 'Sol üstteki **Düzenle**’ye, sonra **Widget Ekle**’ye dokun.', `Listeden **Dada Diet**’i seç, **${w.ad}** widget’ını bul; boyları görmek için yana kaydır.`, '**Widget Ekle**’ye dokun, istediğin yere sürükle.']
      : ['Ana ekranda boş bir yere **basılı tut**.', '**Widget’lar**’a dokun, listede **Dada Diet**’i bul.', `**${w.ad}** widget’ına basılı tutup ana ekrana **sürükle**.`, 'Boyunu değiştirmek için widget’a basılı tut, **kenarlarından** çek; içerik boya göre değişir.'];
    return `${cerceve}
      ${cip('telefon-wg', 'Widget', g.wg, Object.entries(WG).map(([k, x]) => ({metin: x.ad, deger: k, ikon: x.ikon})))}
      ${seg('telefon-boy', 'Boy', g.boy, w.boylar.map(b => ({ad: BOY_AD[p][b], deger: b})))}
      ${durumCip(g, proMu(g))}
      ${DD.p(WG_METIN[g.wg].ios, {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', adim)}`;
  };

  // ---------- Kilit ekranı ve StandBy ----------
  const aksesuar = g => {
    const r = ritim(), ilk = g.durum === 'bos', giris = g.durum === 'giris';
    if (giris) return {satir: '', aksesuar: [DD.kilitWidget({tur: 'dikdortgen', ikon: 'right-to-bracket', baslik: 'Dada Diet', metin: 'Giriş yap', alt: 'Günün burada', ac: '#/giris'})]};
    // Çevrimdışı: daireler aynı kalır, dikdörtgenin alt satırı son güncellemeyi söyler.
    const eski = g.durum === 'cevrimdisi' ? `Son güncelleme ${sonGuncelleme()}` : '';
    const k = widgetVeri('kalori', g), s = widgetVeri('su', g), dy = ilk ? null : diyetisyen(), o = orucWidget(r, ilk);
    const l = [];
    if (k.hedef != null) l.push(DD.kilitWidget({tur: 'daire', ikon: 'fire-flame-curved', deger: sayi(Math.max(0, k.kalan)), oran: k.alinan / k.hedef, ac: '#/bugun', aria: `Kalori: ${sayi(k.kalan)} kcal kaldı`}));
    l.push(DD.kilitWidget({tur: 'daire', ikon: 'glass-water', deger: `${(s.icilen / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} L`, oran: s.icilen / s.hedef, ac: '#/bugun', aria: `Su: ${sayi(s.icilen)} / ${sayi(s.hedef)} ml`}));
    l.push(o.durum === 'oruc'
      ? orucSuren(r).rect({alt: eski, ac: '#/ritim'})
      : DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Oruç', metin: o.durum === 'kapali' ? o.baslik : `${o.hedefSaat} sa hedef`, alt: eski || (o.durum === 'kapali' ? o.metin : 'Ritim’de başlat'), ac: '#/ritim'}));
    const rv = dy?.randevu;
    return {satir: rv ? DD.kilitWidget({tur: 'satir', ikon: 'calendar-days', metin: `${rv.gun.slice(0, 3)} ${rv.saat} görüşme`, ac: '#/uzman', aria: `Diyetisyen görüşmesi ${rv.gun} ${rv.saat}`}) : '', aksesuar: l};
  };
  const kilitBolum = g => {
    const p = g.platform, ios = p === 'ios', r = ritim(), an = DD.simdi().getTime(), o = orucWidget(r, false), canli = o.durum === 'oruc';
    const eylemler = {eylem: 'Orucu bitir', eylemKisa: 'Bitir', eylemKod: 'oruc-bitir'};
    const canliKart = !canli ? '' : ios ? iosKart(r, eylemler) : DD.canliEtkinlik({platform: p, durum: 'oruc', baslik: r.baslik, etiket: r.etiket, gecenSn: r.gecenSn, oran: r.oran, kalanMetin: r.kalanMetin, bas: r.bas, bit: r.bit, ...eylemler});
    if (!ios) {
      const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, kilit: {tarih: tarih(an, p)}, durumCip: canli ? DD.durumCipi({durum: 'oruc', gecenSn: r.gecenSn}) : '', icerik: canliKart,
        etiket: canli ? `Android kilit ekranı: ${r.baslik}, ${r.kalanMetin}` : 'Android kilit ekranı: başlamış oruç yok'});
      const ust = canli ? '' : bosOrucBant(r);
      return `${ust}${cerceve}
        ${DD.p('Android’de oruç sayacı kilit ekranında **kalıcı bildirim** olarak durur: geçen süre akar, kalan süre ve ilerleme görünür; bildirimden orucu bitirebilirsin. Oruç başlamadıysa kilit ekranında Dada Diet’ten bir şey görünmez.', {ton: 'ikincil'})}
        ${adimlar('Nasıl açılır', ['Dada Diet’e **bildirim izni** ver.', '**Ritim**’de orucu başlat; sayaç bildirim alanına ve kilit ekranına gelir.', 'Kilit ekranında görünmüyorsa telefonun **Ayarlar > Bildirimler** bölümünden kilit ekranı bildirimlerini aç.'])}
        ${DD.btn({metin: 'Bildirim izni', ikon: 'bildirim', tur: 'secondary', tam: true, git: '#/bildirim-izni'})}`;
    }
    if (g.gor === 'standby') {
      const gece = g.gece === 'gece', gs = {...g, boy: 'kucuk'};
      const sag = canli ? widgetCiz('oruc', gs) : widgetCiz('su', gs);
      const cerceve = DD.telefonCerceve({platform: 'ios', tema: 'koyu', yatay: true, etkilesimli: true, sinif: gece ? 'is-gece' : '', etiket: `StandBy${gece ? ', gece görünümü' : ''}: Kalori ve ${canli ? 'Oruç' : 'Su'} widget’ları`, icerik: DD.standby({sol: widgetCiz('kalori', gs), sag})});
      return `${cerceve}
        ${seg('telefon-gor', 'Görünüm', g.gor, [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: 'StandBy', deger: 'standby', ikon: 'mobile-screen'}])}
        ${seg('telefon-gece', 'StandBy ışığı', g.gece, [{ad: 'Gündüz', deger: 'gunduz', ikon: 'sun'}, {ad: 'Gece', deger: 'gece', ikon: 'moon'}])}
        ${durumCip(g, false)}
        ${DD.p('iPhone şarjdayken yan duruyorsa ve kilitliyse **StandBy** açılır; widget’lar büyür, arka planları kalkar. Karanlık odada **gece görünümü** her şeyi kırmızı tona çeker. **+1 bardak** ve **Orucu başlat/bitir** burada da çalışır.', {ton: 'ikincil'})}
        ${adimlar('Nasıl eklenir', ['iPhone’u **şarja tak**, yan çevir ve kilitli bırak (iOS 17 ve sonrası).', 'Widget’lardan birine **basılı tut**, kilidi aç, sol üstteki **+**’ya dokun.', 'Listeden **Dada Diet**’i seç ve widget’ı ekle; iki yığının her biri ayrı düzenlenir.', 'Gece görünümü için **Ayarlar > StandBy > Gece Modu**.'])}`;
    }
    const a = aksesuar(g);
    const cerceve = DD.telefonCerceve({platform: 'ios', tema: g.tema, saat: sistemSaat(an), etkilesimli: true, kilit: {tarih: tarih(an, 'ios', !!a.satir), satir: a.satir, aksesuar: a.aksesuar}, icerik: canliKart,
      etiket: `iPhone kilit ekranı: Dada Diet kilit ekranı widget’ları${canli ? `, oruç sayacı ${r.kalanMetin}` : ''}`});
    return `${cerceve}
      ${seg('telefon-gor', 'Görünüm', g.gor, [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: 'StandBy', deger: 'standby', ikon: 'mobile-screen'}])}
      ${durumCip(g, false)}
      ${DD.p('Kilit ekranında üç biçim: tarih satırında **satır içi** (sıradaki görüşme), saatin altında **daire** (kalan kalori, su) ve **dikdörtgen** (oruç). Telefonun yazı rengine uyar, tek renktir; dokununca uygulama ilgili ekranda açılır. Oruç başlamadıysa ilerleme gösterilmez.', {ton: 'ikincil'})}
      ${DD.p('Oruç **dikdörtgen widget’ında** baştan sona sürer; 16 saatlik oruçta da sayaç burada kalır. Canlı Etkinlik kartı en çok 8 saat güncellenir, sonra kilit ekranında en çok 4 saat daha durur.', {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', ['Kilit ekranına **basılı tut**, **Özelleştir**’e ve **Kilit Ekranı**’na dokun.', 'Saatin altındaki alana dokun, listeden **Dada Diet**’i seç; daire ya da dikdörtgen widget’ı ekle.', 'Satır içi widget için **tarihe** dokun ve Dada Diet’i seç.', '**Bitti**’ye dokun.'])}`;
  };
  const bosOrucBant = r => (r.hal === 'kapali'
    ? DD.bant({ton: 'bilgi', ikon: 'oruc', baslik: 'Oruç takibi kapalı', metin: r.engel ? 'Paylaştığın sağlık bilgilerine göre **oruç sana önerilmiyor**; sayaç çıkmaz.' : 'Ritim’de bir plan seçip orucu başlattığında sayaç burada görünür.', eylem: r.engel ? null : {metin: 'Ritim’e git', git: '#/ritim'}})
    : DD.bant({ton: 'bilgi', ikon: 'oruc', baslik: 'Henüz başlamış bir orucun yok', metin: `${r.protokol?.ad || ''} planın hazır. Orucu başlattığında sayaç **kilit ekranına** gelir.`}));
  const baslatDugme = r => (r.hal === 'kapali' ? '' : r.hal === 'bos'
    ? DD.btn({metin: 'Ritim’de başlat', ikon: 'play', tam: true, git: '#/ritim'})
    : DD.btn({metin: 'Orucu başlat', ikon: 'play', tam: true, veri: {'wg-eylem': 'oruc-baslat'}}));

  // ---------- Canlı Etkinlik / canlı bildirim ----------
  const canliBolum = g => {
    const p = g.platform, ios = p === 'ios', r = ritim(), canli = r.canli, dy = diyetisyen(), rv = dy.randevu;
    const secim = seg('telefon-etkinlik', 'Etkinlik', g.etkinlik, [{ad: 'Oruç', deger: 'oruc', ikon: 'hourglass-half'}, {ad: 'Görüşme', deger: 'randevu', ikon: 'video'}, {ad: '16 saat', deger: 'akis', ikon: 'stopwatch'}]);
    if (g.etkinlik === 'akis') return `${secim}${akisBolum(g)}`;
    const oruc = {durum: 'oruc', baslik: r.baslik, etiket: r.etiket, gecenSn: r.gecenSn, oran: r.oran, kalanMetin: r.kalanMetin, bas: r.bas, bit: r.bit, eylemKod: 'oruc-bitir'};
    if (g.etkinlik === 'oruc') {
      if (!canli) {
        const an = DD.simdi().getTime();
        return `${bosOrucBant(r)}${baslatDugme(r)}
          ${DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), kilit: {tarih: tarih(an, p)}, etiket: `${ios ? 'iPhone' : 'Android'} kilit ekranı: başlamış oruç yok, canlı etkinlik yok`})}
          ${secim}
          ${DD.p(ios ? 'Oruç başlayınca sayaç **kilit ekranına** ve **Dinamik Ada’ya** gelir; oruç yokken burada bir şey görünmez. Canlı Etkinlik en çok 8 saat güncellenir; uzun oruçta sayaç kilit ekranı widget’ında sürer.' : 'Oruç başlayınca sayaç **canlı bildirim** olarak bildirim alanına ve durum çubuğuna gelir; oruç yokken görünmez.', {ton: 'ikincil'})}`;
      }
      const an = r.anMs;
      // iPhone'da 8. saatten sonra gerçek kayıt: Canlı Etkinlik bitmiş (bitiş içeriği ya da hiç); sayaç kilit ekranı widget'ında.
      if (ios && r.gecenSn >= LA_SN) {
        const rect = orucSuren(r).rect({ac: '#/ritim'});
        return `${DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, kilit: {tarih: tarih(an, p, true), aksesuar: [rect]}, icerik: iosKart(r, {}), etiket: `iPhone kilit ekranı: ${r.baslik}, Canlı Etkinlik 8 saatte bitti, kalan süre widget’ta`})}${secim}
          ${DD.bant({ton: 'bilgi', ikon: 'saat', baslik: 'Canlı Etkinlik 8. saatte bitti', metin: 'Orucun sürüyor; kalan süre **kilit ekranı widget’ında** ve Ritim’de akar. Bitiş kartı kilit ekranında en çok 4 saat kalır, Ada’dan kalkmıştır.'})}
          ${DD.btn({metin: 'Orucu bitir', ikon: 'stop', tur: 'secondary', tam: true, veri: {'wg-eylem': 'oruc-bitir'}})}`;
      }
      const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, kilit: {tarih: tarih(an, p)}, durumCip: ios ? '' : DD.durumCipi({durum: 'oruc', gecenSn: r.gecenSn}), icerik: DD.canliEtkinlik({platform: p, ...oruc, eylem: 'Orucu bitir', eylemKisa: 'Bitir'}), etiket: `${ios ? 'iPhone' : 'Android'} kilit ekranı: ${r.baslik}, ${r.kalanMetin}`});
      const ek = ios
        ? DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', yardim: 'Kısa hali hep görünür; basılı tutunca genişler. Başka bir etkinlik de sürerken ikisi de minimal olur (Görüşme bölümünde).', html: `<div class="dd-yigin-8">
            ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...oruc, tur: 'kompakt'}), etiket: `Dinamik Ada kısa hali: ${r.baslik}`})}
            ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...oruc, tur: 'genis'}), etiket: `Dinamik Ada geniş hali: ${r.baslik}, ${r.kalanMetin}`})}
</div>`})
        : DD.alan({etiket: 'Telefon açıkken: durum çubuğu', yardim: 'Sayaç saatin yanında çip olarak durur (Android 16 ve sonrası); aşağı çekince bildirimin tamamı açılır.', html: DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), durumCip: DD.durumCipi({durum: 'oruc', gecenSn: r.gecenSn}), icerik: DD.canliEtkinlik({platform: p, ...oruc, eylem: 'Orucu bitir'}), etiket: `Durum çubuğunda oruç sayacı: ${r.baslik}`})});
      return `${cerceve}${secim}${ek}
        ${ios ? DD.bant({ton: 'bilgi', ikon: 'saat', baslik: 'Canlı Etkinlik en çok 8 saat', metin: 'iPhone bir Canlı Etkinliği en çok **8 saat** günceller; sonra Dinamik Ada’dan kalkar, kilit ekranında en çok **4 saat** daha durur. 16 saatlik oruçta sayaç **kilit ekranı widget’ında** ve Ritim’de baştan sona sürer.'}) : ''}
        ${DD.p(ios ? 'Sayaç Ritim’deki kaydınla saniye saniye akar; **Bitir** düğmesi uygulamayı açmadan orucu bitirir, kart da kalkar.' : 'Sayaç Ritim’deki kaydınla akar; bildirimden **Orucu bitir**, bildirime dokununca uygulama açılır. Android’de bu bildirim için süre sınırı yok.', {ton: 'ikincil'})}
        ${adimlar('Nasıl açılır', ios ? ['**Ritim**’de ya da widget’tan orucu başlat.', 'Canlı Etkinlik kilit ekranına ve Dinamik Ada’sı olan iPhone’larda adaya gelir; en çok 8 saat güncellenir.', 'Orucun tamamı için kilit ekranına **Oruç** widget’ını ekle (Kilit ve StandBy bölümü).', 'Kapatmak istersen: **Ayarlar > Dada Diet > Canlı Etkinlikler**.'] : ['Dada Diet’e **bildirim izni** ver.', '**Ritim**’de ya da widget’tan orucu başlat.', 'Durum çubuğu çipi Android 16 ve sonrasında görünür; eski sürümlerde sayaç bildirim alanında kalır.'])}`;
    }
    // Görüşme: katılım açıldığı an (randevu saatinden katilAcilisDk önce); geri sayım görüşme saatine.
    if (!rv) {
      return `${DD.bant({ton: 'bilgi', ikon: 'takvim', baslik: yeni() ? 'Henüz diyetisyenin yok' : 'Planlı görüşmen yok', metin: 'Görüşme planladığında, saati yaklaşınca geri sayım **kilit ekranına** gelir.', eylem: {metin: yeni() ? 'Diyetisyen bul' : 'Görüşme planla', git: yeni() ? '#/uzman/bul' : '#/uzman'}})}
        ${DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(DD.simdi().getTime()), kilit: {tarih: tarih(DD.simdi().getTime(), p)}, etiket: 'Kilit ekranı: planlı görüşme yok'})}${secim}`;
    }
    const rh = rv.ham, an = randevuMs(rh) - rh.katilAcilisDk * 6e4, kalanSn = rh.katilAcilisDk * 60;
    const gr = {durum: 'randevu', baslik: rh.baslik, etiket: 'Diyetisyen görüşmesi', kisi: dy.diyetisyen.kisaAd, harf: dy.diyetisyen.harf, tur: rh.tur, saat: nk(rh.saat), kalanSn, eylem: 'Görüşmeye katıl', eylemAc: '#/uzman'};
    const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, kilit: {tarih: tarih(an, p)}, durumCip: ios ? '' : DD.durumCipi({durum: 'randevu', kalanSn}), icerik: DD.canliEtkinlik({platform: p, ...gr}), etiket: `${ios ? 'iPhone' : 'Android'} kilit ekranı: ${rh.baslik}, ${rv.gun} ${rv.saat}, ${rh.katilAcilisDk} dakika kaldı`});
    const ek = ios
      ? DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', yardim: 'Kısa halde kalan süre; basılı tutunca katılım düğmesi. Oruç da sürerken ikisi de minimal olur.', html: `<div class="dd-yigin-8">
          ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'kompakt'}), etiket: 'Dinamik Ada kısa hali: görüşmeye kalan süre'})}
          ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'genis'}), etiket: 'Dinamik Ada geniş hali: görüşme ve katıl düğmesi'})}
          ${canli && r.gecenSn < LA_SN ? DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'minimal'}), adaMin: DD.dinamikAda({tur: 'minimal', durum: 'oruc', oran: r.oran}), etiket: 'Dinamik Ada, iki etkinlik: ikisi de minimal; görüşmenin kalan dakikası adaya bitişik, oruç halkası ayrı dairede'}) : ''}</div>`})
      : DD.alan({etiket: 'Telefon açıkken: durum çubuğu', yardim: 'Kalan süre saatin yanında çip olarak durur (Android 16 ve sonrası).', html: DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), durumCip: DD.durumCipi({durum: 'randevu', kalanSn}), icerik: DD.canliEtkinlik({platform: p, ...gr}), etiket: 'Durum çubuğunda görüşmeye kalan süre'})});
    return `${cerceve}${secim}${ek}
      ${DD.p(`**${rv.gun} ${rv.saat}** görüşmen için katılım ${rh.katilAcilisDk} dakika önce açılır; o an geri sayım kilit ekranına gelir ve **Görüşmeye katıl** seni doğrudan görüşmeye alır. Görüşme bitince kalkar.`, {ton: 'ikincil'})}
      ${adimlar('Nasıl açılır', ios ? ['Uzmanım’da görüşmen planlı olsun; kurulum gerekmez.', 'Katılım açılınca geri sayım **kilit ekranına** ve **Dinamik Ada’ya** gelir.', 'Kapatmak istersen: **Ayarlar > Dada Diet > Canlı Etkinlikler**.'] : ['Dada Diet’e **bildirim izni** ver.', 'Katılım açılınca geri sayım bildirim alanına gelir; Android 16 ve sonrasında durum çubuğunda çip olarak da durur.'])}
      ${DD.btn({metin: 'Görüşme detayı', ikon: 'takvim', tur: 'secondary', tam: true, git: '#/uzman'})}`;
  };

  // ---------- 16 saatlik oruç akışı (karar 1): zaman çizelgesi ----------
  // iPhone: ilk 8 saat sayaç Canlı Etkinlik'te ve Dinamik Ada'da akar; 8. saatte etkinlik bitiş içeriğiyle ("Orucun devam ediyor · Kalan süre widget'ta")
  // biter, kilit ekranında kısa süre kalır, Ada'dan kalkar; 8–16. saatte kalan süre kilit ekranı ve ana ekran widget'ında sistem sayacıyla akar
  // (Text(timerInterval:)); 16. saatte hedef. Android'de canlı bildirimin süre sınırı yok: sayaç baştan sona bildirimde akar (Chronometer).
  // Zaman Ritim'in oruç verisinden: başlangıç DDV.ritim.durumlar.oruc.baslangic, 16 saatlik plan. Çizelge sahnesi dokunulmaz (kayıt yazmaz).
  const AKIS = {
    0: {ad: '0. saat', alt: 'Başlangıç', ios: '**0. saat · Başlangıç.** Orucu başlattığında Canlı Etkinlik kilit ekranına ve Dinamik Ada’ya gelir; sayaç saniye saniye akar.'},
    4: {ad: '4. saat', alt: 'Canlı Etkinlik', ios: '**4. saat.** Sayaç Canlı Etkinlik’te ve Ada’da akmaya devam eder; ilerleme çubuğu dolar.'},
    8: {ad: '8. saat', alt: 'Widget’a devir', ios: '**8. saat · Devir.** iPhone bir Canlı Etkinliği en çok 8 saat günceller. Etkinlik “Orucun devam ediyor · Kalan süre widget’ta” son durumuyla biter; kart kilit ekranında kısa süre kalır, Ada’dan kalkar. Kalan süre kilit ekranı ve ana ekran widget’ında akar.'},
    12: {ad: '12. saat', alt: 'Widget’ta sayaç', ios: '**8–16. saat.** Kalan süre kilit ekranı ve ana ekran widget’ında **sistem sayacıyla** akar: widget yeniden çizilmeden saniye saniye ilerler.'},
    16: {ad: '16. saat', alt: 'Hedef', ios: '**16. saat · Hedef.** Sayaç hedefe ulaşır; widget “Hedefine ulaştın” der. **Orucu bitir** ile yeme penceresi açılır.'}
  };
  const sessiz = html => html.replace(/ data-wg-(eylem|ac)="[^"]*"/g, '').replace(/ data-id="[^"]*"/g, '').replace(/<button /g, '<button tabindex="-1" ');
  const akisBolum = g => {
    const p = g.platform, ios = p === 'ios', R = DDV.ritim, P = R.protokoller.find(x => x.id === '16-8') || {ad: '16:8', orucSaat: 16};
    const H = P.orucSaat, sa = +g.adim, basMs = new Date(R.durumlar.oruc.baslangic.slice(0, 16)).getTime(), an = basMs + sa * 36e5, bitMs = basMs + H * 36e5;
    const gecenSn = sa * 3600, kalanSn = (H - sa) * 3600, oran = sa / H, tamam = sa >= H;
    const bas = `${gunOn(basMs, an)}${saat(basMs)}`, bit = `${gunOn(bitMs, an)}${saat(bitMs)}`, etiket = `Ritim · ${P.ad}`;
    const kalanMetin = tamam ? 'Hedefine ulaştın' : `Kalan ${sure((H - sa) * 60)}`;
    const oruc = {durum: 'oruc', baslik: tamam ? 'Hedefine ulaştın' : R.durumlar.oruc.rozet, etiket, gecenSn, oran, kalanMetin, bas, bit, eylem: 'Orucu bitir', eylemKisa: 'Bitir'};
    const suren = orucSuren({gecenSn, hedefSaat: H, oran, bas, bit}), rect = suren.rect();
    const kilitCerceve = icerik => DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), kilit: {tarih: tarih(an, p, ios), aksesuar: ios ? [rect] : []}, durumCip: !ios && !tamam ? DD.durumCipi({durum: 'oruc', gecenSn}) : '', icerik,
      etiket: `${AKIS[sa].ad}: ${ios ? 'iPhone' : 'Android'} kilit ekranı, ${kalanMetin}`});
    const anaCerceve = () => DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etiket: `${AKIS[sa].ad}: ana ekranda Oruç widget’ı, ${kalanMetin}`,
      icerik: DD.anaEkran({widgetlar: [DD.widgetOruc({boy: 'kucuk', ...suren.widget})], simge: 19, ara: ios, dock: true, tarih: ios ? '' : tarih(an, 'android')})});
    let sahne;
    if (!ios) {
      sahne = kilitCerceve(DD.canliEtkinlik({platform: 'android', ...oruc}));
      if (sa >= 8) sahne += anaCerceve();
    } else if (sa < 8) {
      sahne = `${kilitCerceve(DD.canliEtkinlik({platform: 'ios', ...oruc}))}${DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', html: DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...oruc, tur: sa === 0 ? 'kompakt' : 'genis'}), etiket: `${AKIS[sa].ad}: Dinamik Ada ${sa === 0 ? 'kısa' : 'geniş'} hali`})})}`;
    } else if (sa === 8) {
      sahne = `${kilitCerceve(DD.canliEtkinlik({platform: 'ios', durum: 'oruc', bitti: true, baslik: 'Orucun devam ediyor', kalanMetin: 'Kalan süre widget’ta', sureMetin: `${sa} sa`, oran, etiket}))}${anaCerceve()}`;
    } else sahne = `${kilitCerceve('')}${anaCerceve()}`;
    const adimlar_ = Object.entries(AKIS).map(([h, x]) => `**${x.ad} · ${x.alt}.** ${x.ios.replace(/^\*\*[^*]+\*\*\s*/, '')}`);
    return `${cip('telefon-adim', '16 saatlik oruç', g.adim, Object.entries(AKIS).map(([h, x]) => ({metin: `${x.ad} · ${x.alt}`, deger: h})))}
      ${ios ? '' : DD.bant({ton: 'bilgi', ikon: 'saat', baslik: 'Android’de süre sınırı yok', metin: 'Canlı bildirim 16 saat boyunca bildirimde ve durum çubuğu çipinde akar; widget’a devir gerekmez. Ana ekran widget’ındaki sayaç da Chronometer ile kendiliğinden akar.'})}
      ${sessiz(sahne)}
      ${DD.p(ios ? AKIS[sa].ios : `**${AKIS[sa].ad}.** ${tamam ? 'Bildirim “Hedefine ulaştın” der; **Orucu bitir** ile pencere açılır.' : 'Sayaç bildirimde akar; kalan süre ve ilerleme görünür.'}`, {ton: 'ikincil'})}
      ${ios ? DD.ako({baslik: 'Akışın tamamı', html: DD.cihazAdimlar(adimlar_)}) : ''}`;
  };

  // ---------- Hızlı ayar: iOS Denetim Merkezi denetimi (iOS 18), Android Hızlı Ayarlar kutucuğu ----------
  const ayarBolum = g => {
    const p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), giris = g.durum === 'giris', s = su();
    // Tek seferlik eylem kutucuğu: hazırken pasif (STATE_INACTIVE), dokununca kısa süre aktif görünür; oturum yokken kullanılamaz (STATE_UNAVAILABLE, dokunulmaz).
    const bizim = {bizim: true, genis: true, ad: 'Su ekle', ikon: 'glass-water', hal: giris ? 'kullanilamaz' : 'pasif', alt: giris ? 'Giriş gerekli' : ios ? `${sayi(s.icilen)} ml` : `${sayi(s.icilen)} / ${sayi(s.hedef)} ml`, ...(giris ? {} : {eylem: 'su-ekle'})};
    const SISTEM = ios
      ? [{ad: 'Uçak modu', ikon: 'plane'}, {ad: 'Wi-Fi', ikon: 'wifi', hal: 'aktif'}, {ad: 'Hücresel', ikon: 'signal', hal: 'aktif'}, {ad: 'Rahatsız Etme', ikon: 'moon', hal: 'pasif'}, bizim, {ad: 'El feneri', ikon: 'lightbulb', hal: 'pasif'}, {ad: 'Kamera', ikon: 'camera', hal: 'pasif'}]
      : [{ad: 'Wi-Fi', alt: 'Açık', ikon: 'wifi', hal: 'aktif'}, {ad: 'Mobil veri', alt: 'Açık', ikon: 'signal', hal: 'aktif'}, {ad: 'Rahatsız etmeyin', alt: 'Kapalı', ikon: 'moon'}, {ad: 'El feneri', alt: 'Kapalı', ikon: 'lightbulb'}, bizim, {ad: 'Konum', alt: 'Açık', ikon: 'location-dot', hal: 'aktif'}, {ad: 'Uçak modu', alt: 'Kapalı', ikon: 'plane'}, {ad: 'Otomatik döndür', alt: 'Kapalı', ikon: 'rotate'}];
    const panel = DD.hizliAyarlar({platform: p, saat: sistemSaat(an), tarih: tarih(an, 'android'), kutucuklar: SISTEM});
    const icerik = ios ? `${DD.anaEkran({widgetlar: [widgetCiz('kalori', {...g, boy: 'kucuk', durum: 'dolu'}), widgetCiz('su', {...g, boy: 'kucuk', durum: 'dolu'})], simge: 4, ara: true, dock: true, pasif: true})}${panel}` : panel;
    const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, icerik, etiket: `${ios ? 'iPhone Denetim Merkezi' : 'Android Hızlı Ayarlar'}: Su ekle ${giris ? 'kullanılamaz, giriş gerekli' : `etkin, ${sayi(s.icilen)} ml`}`});
    return `${cerceve}
      ${cip('telefon-durum', 'Kutucuk durumu', giris ? 'giris' : 'dolu', [{metin: 'Hazır', deger: 'dolu', ikon: 'circle-check'}, {metin: 'Kullanılamaz', deger: 'giris', ikon: 'ban'}], giris ? 'Oturum yokken kutucuk kullanılamaz: soluk durur, dokunulmaz; alt satır “Giriş gerekli”.' : 'Hazırken kutucuk pasiftir; dokununca kısa süre aktif görünür, 200 ml eklenir ve alt satır güncellenir.')}
      ${DD.p(ios ? '**Su ekle** denetimi Denetim Merkezi’nde, kilit ekranının alt köşelerinde ya da Eylem düğmesinde çalışır (iOS 18 ve sonrası); uygulama açılmadan bir bardak ekler.' : '**Su ekle** kutucuğu Hızlı Ayarlar’da durur. Açılıp kapanan bir ayar olmadığı için hazırken **pasif** görünür; dokununca uygulama açılmadan bir bardak ekler, kısa süre **aktif** olur, alt satırda bugünkü toplam görünür. Oturum yokken **kullanılamaz**.', {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', ios
        ? ['Sağ üst köşeden aşağı kaydırıp **Denetim Merkezi**’ni aç.', 'Boş bir yere basılı tut, **Denetim Ekle**’ye dokun.', 'Listeden **Dada Diet > Su ekle**’yi seç; boyutunu köşesinden çekerek büyütebilirsin.']
        : ['Ekranın üstünden **iki kez aşağı kaydır**.', 'Kalem simgesine (**Düzenle**) dokun.', '**Su ekle** kutucuğunu basılı tutup üstteki kutucukların arasına **sürükle**.'])}`;
  };

  // ---------- Sesli komut: Siri (App Shortcuts) / Gemini ----------
  const komutBolum = g => {
    const p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), soz = SOZ[g.komut];
    // Sonuç kartı gerçek kaydı gösterir: komut oynarken kayıt sonucu (bir bardak sonrası); sonuç anında kayıt yazılır (komutAsama 'yazildi'),
    // kart ve arkadaki widget aynı değeri gösterir. Bölüm açılınca komut kendiliğinden oynamaz (her oynatma gerçek bir kayıt).
    const yazildi = g.komutAsama === 'yazildi';
    let sonuc;
    if (g.komut === 'su') {
      const s = su(), sonra = yazildi ? s.icilen : s.icilen + s.bardak, kalan = s.hedef - sonra;
      sonuc = DD.komutSonuc({ton: 'su', ikon: 'glass-water', baslik: 'Su eklendi', metin: `+${sayi(s.bardak)} ml · 1 su bardağı`, deger: sayi(sonra), birim: `/ ${sayi(s.hedef)} ml`, oran: sonra / s.hedef, alt: kalan > 0 ? `Hedefe **${sayi(kalan)} ml** kaldı` : 'Bugünkü **su hedefine** ulaştın'});
    } else {
      const o = ogunler().find(x => x.id === 'ogle'), kal = kalori(), besin = o.durum === 'dolu' ? o.yenen : yeni() ? [] : DDV.bugun.ogunler.find(x => x.id === 'ogle').besinler, fazla = besin.length - 3;
      // Söyleyişten önce öğün zaten yendiyse sonuç da "zaten kayıtlı" (g.komutOnce oynatma başında saklanır).
      const zaten = g.komutAsama ? g.komutOnce === 'dolu' : o.durum === 'dolu';
      sonuc = besin.length
        ? DD.komutSonuc({ton: 'kalori', ikon: o.ikon, baslik: zaten ? 'Öğle yemeğin zaten kayıtlı' : `${o.ad} kaydedildi`, metin: `${o.saat} · ${besin.length} besin`, deger: sayi(toplam(besin, 'kcal')), birim: 'kcal', satirlar: [...besin.slice(0, 3).map(b => b.ad), ...(fazla > 0 ? [`+${fazla} besin daha`] : [])], alt: kal.hedef != null ? `Bugün kalan **${sayi(kal.kalan)} kcal**` : ''})
        // Misafirin planında öğle yemeği yok: komut kaydı açar, ne yediğini sorar (uydurma besin ya da kcal yok)
        : DD.komutSonuc({ton: 'kalori', ikon: o.ikon, baslik: 'Öğle yemeğin henüz boş', metin: 'Planında bu öğün için besin yok', alt: '**Dada Diet’te aç**, ne yediğini ekle'});
    }
    const gs = {...g, boy: 'kucuk', durum: 'dolu'};
    const arka = DD.anaEkran({widgetlar: [widgetCiz('kalori', gs), widgetCiz('su', gs)], simge: 4, ara: false, tarih: ios ? '' : tarih(an, 'android')});
    const cerceve = g.komutAsama
      ? DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etiket: `${ios ? 'Siri' : 'Gemini'} komutu: ${soz}. Sonuç: ${sonuc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`, icerik: DD.komutEkran({platform: p, komut: soz, sonuc, arka, hal: yazildi ? 'sonuc' : 'dinliyor'})})
      : DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etiket: `${ios ? 'iPhone' : 'Android'} ana ekranı, ${ios ? 'Siri' : 'Gemini'}’ye söylemeye hazır`, icerik: arka});
    // Gemini: üçüncü taraf uygulama işlevlerini Android 16+ AppFunctions ile çağırır; her telefonda yok. Aynı kayıt uygulama kısayolunda da durur.
    const metin = ios
      ? `Siri’ye söyle, Dada Diet açılmadan **kaydı yapsın** ve sonucu göstersin. Komutta uygulamanın adı geçer: “${SOZ.su}”.`
      : `Gemini’ye söyle; telefonun Gemini’nin uygulama işlevlerini çağırmasını destekliyorsa Dada Diet **kaydı yapar** ve sonucu kartta gösterir. Komutta uygulamanın adı geçer: “${SOZ.su}”.`;
    const adim = ios
      ? ['Dada Diet yüklüyken komutlar **hazırdır**; kurulum gerekmez.', `**Siri**’yi çağır ve komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Tümünü **Kestirmeler** uygulamasında Dada Diet altında bulursun; dilersen birini ana ekrana ekle.']
      : ['**Gemini**’yi aç: güç düğmesine basılı tut ya da “Hey Google” de.', `Komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Bu özellik Android 16 ve sonrasında, Gemini’nin uygulama işlevlerini desteklediği telefonlarda çalışır. Desteklemiyorsa aynı kayıt, Dada Diet simgesine **basılı tutunca** açılan **Su ekle** kısayolundadır.'];
    return `${cerceve}
      ${DD.btn({metin: g.komutAsama ? 'Komutu yeniden söyle' : `${ios ? 'Siri' : 'Gemini'}’ye söyle`, ikon: 'microphone', tur: g.komutAsama ? 'secondary' : 'primary', tam: true, veri: {eylem: 'komut-oynat'}})}
      ${DD.p('Her söyleyiş gerçek bir kayıttır: su Bugün’e eklenir, öğün kaydedilir; bildirimden geri alabilirsin.', {ton: 'ikincil', meta: true})}
      ${cip('telefon-komut', 'Komut', g.komut, [{metin: 'Bir bardak su ekle', deger: 'su', ikon: 'glass-water'}, {metin: 'Öğle yemeğimi kaydet', deger: 'ogle', ikon: 'bowl-rice'}])}
      ${DD.p(metin, {ton: 'ikincil'})}
      ${adimlar(ios ? 'Siri ile nasıl kullanılır' : 'Gemini ile nasıl kullanılır', adim)}`;
  };

  const BOLUM = {widget: widgetBolum, kilit: kilitBolum, canli: canliBolum, ayar: ayarBolum, komut: komutBolum};
  const panel = (g, sabit) => `<div class="dd-yigin dd-cihaz-gecis${sabit ? ' is-sabit' : ''}">${g.acik ? acikPanel(g) : BOLUM[g.sekme](g)}</div>`;
  const sekmeOgeler = p => [
    {ad: 'Ana ekran', deger: 'widget', ikon: 'table-cells-large'}, {ad: p === 'ios' ? 'Kilit ve StandBy' : 'Kilit ekranı', deger: 'kilit', ikon: 'lock'},
    {ad: p === 'ios' ? 'Canlı Etkinlik' : 'Canlı bildirim', deger: 'canli', ikon: 'bolt'}, {ad: p === 'ios' ? 'Denetim Merkezi' : 'Hızlı Ayarlar', deger: 'ayar', ikon: 'sliders'},
    {ad: p === 'ios' ? 'Siri' : 'Gemini', deger: 'komut', ikon: 'microphone'}
  ];
  const ust = g => `<div class="dd-yigin-12">
    ${DD.sekmeler({ad: 'telefon-sekme', etiket: 'Bölüm', secili: g.sekme, ogeler: sekmeOgeler(g.platform)})}
    <div class="dd-ikili">
      ${DD.alan({etiket: 'Telefon', html: DD.segment({ad: 'telefon-platform', etiket: 'Telefon', secili: g.platform, ogeler: [{ad: 'iPhone', deger: 'ios'}, {ad: 'Android', deger: 'android'}]})})}
      ${DD.alan({etiket: 'Görünüm', html: DD.segment({ad: 'telefon-tema', etiket: 'Görünüm', secili: g.tema, ogeler: [{ad: 'Açık', deger: 'acik', ikon: 'sun'}, {ad: 'Koyu', deger: 'koyu', ikon: 'moon'}]})})}
    </div>
  </div>`;

  DD.ekran('telefon', {
    tur: 'alt',
    baslik: 'Telefon özellikleri',
    ust: '#/ayarlar',
    yenile: true,
    ciz: ctx => {
      const g = gorunum(ctx);
      return DD.gruplar([{html: `<div data-yuva="telefon-ust">${ust(g)}</div>`}, {html: `<div data-yuva="telefon">${panel(g)}</div>`}]);
    },
    sonra: (kok, ctx) => {
      let g = gorunum(ctx), dur = () => {};
      const yuva = () => kok.querySelector('[data-yuva="telefon"]');
      // Sesli komut: ekranı "dinliyor" ile çiz, sonuç anında kaydı yaz (su ya da planlı öğle), sahneyi sonuçla yeniden çiz.
      const oynat = () => {
        dur(); g = {...g, komutAsama: 'oynat', komutOnce: ogunler().find(x => x.id === 'ogle')?.durum, acik: null};
        const y = yuva(); if (y) y.innerHTML = panel(g, true);
        dur = DD.komutOynat(kok.querySelector('.dd-komut'), () => {
          let sonuc = null;
          if (g.komut === 'su') sonuc = suEkle();
          else { const o = ogunler().find(x => x.id === 'ogle'); if (o.durum === 'planli' && o.besinler.length) sonuc = ogunYedim('ogle'); }
          g = {...g, komutAsama: 'yazildi'};
          const y2 = yuva(); if (y2) y2.innerHTML = panel(g, true);
          if (sonuc) DD.toast(sonuc.metin, {ikon: g.komut === 'su' ? 'su' : 'onay', eylem: 'Geri al', onEylem: () => { sonuc.geri(); if (DD.aktif()?.ad === 'telefon') { g = {...g, komutAsama: null}; ciz(true); } }});
        });
      };
      const ciz = (sabit, ustDe) => {
        dur(); kaydet(g);
        if (ustDe) { const u = kok.querySelector('[data-yuva="telefon-ust"]'); if (u) { u.innerHTML = ust(g); const x = u.querySelector('.dd-seg.is-kaydir [aria-selected="true"]'); if (x) x.parentElement.scrollLeft = x.offsetLeft - (x.parentElement.clientWidth - x.offsetWidth) / 2; } }
        const y = yuva(); if (y) y.innerHTML = panel(g, sabit);
        sinirKur();
      };
      const bag = (ad, alan) => DD.on(kok, ad, v => {
        if (!SECENEK[alan].includes(v) || (g[alan] === v && !g.acik)) return;
        g = duzelt({...g, [alan]: v, acik: null, komutAsama: null}); ctx.sorgu = {};
        ciz(false, alan === 'platform');
        // 16 saatlik akışta seçili adım adreste kalsın (yenilemede aynı adım açılır); router'ı tetiklemez.
        if (g.sekme === 'canli' && g.etkinlik === 'akis') history.replaceState(null, '', `#/telefon?${new URLSearchParams({sekme: 'canli', etkinlik: 'akis', adim: g.adim, platform: g.platform, tema: g.tema})}`);
      });
      // Gerçek kayıtta sınır anları (iPhone Canlı Etkinlik 8. saat, bitiş kartının 12. saati, hedef) geçilince sahne kendiliğinden yeniden çizilir.
      let sinirZ = 0;
      const sinirKur = () => {
        clearTimeout(sinirZ);
        const r = ritim(); if (!r.canli) return;
        const kalan = [LA_SN, LA_SN + LA_KALIR_SN, r.hedefSaat * 3600].map(x => x - r.gecenSn).filter(x => x > 0);
        if (!kalan.length) return;
        sinirZ = setTimeout(() => { if (kok.isConnected && !g.acik && g.komutAsama !== 'oynat') ciz(true); sinirKur(); }, Math.min(...kalan) * 1000 + 300);
      };
      // Widget düğmesi: gerçek kaydı yazar, sahne yerinde güncellenir (giriş animasyonu tekrar oynamaz); Geri al ile döner.
      let sonOruc = 0;
      const eylem = el => {
        const ad = el.dataset.wgEylem, f = EYLEM[ad];
        if (!f) return;
        // Çift dokunuş başlat + bitir yapmasın: oruç düğmelerinde 600 ms tekrar koruması
        if (ad.startsWith('oruc')) { if (Date.now() - sonOruc < 600) return; sonOruc = Date.now(); }
        const sonuc = f(el.dataset.id);
        DD.titres(10);
        if (g.durum === 'bos') g = {...g, durum: 'dolu'};
        const wgKok = el.closest('.dd-wg');
        ciz(true);
        if (wgKok && ad === 'su-ekle') yuva()?.querySelector('.dd-wg-dugme[data-wg-eylem="su-ekle"]')?.closest('.dd-wg')?.classList.add('is-yeni');
        // Hızlı ayar kutucuğu: eylem anında kısa süre aktif (STATE_ACTIVE), sonra hazır (STATE_INACTIVE) haline döner.
        if (el.classList.contains('dd-ha-kut')) {
          const k = yuva()?.querySelector('.dd-ha-kut.is-bizim');
          if (k) { k.classList.replace('is-pasif', 'is-aktif'); setTimeout(() => k.isConnected && k.classList.replace('is-aktif', 'is-pasif'), DD.azHareket() ? 600 : 1200); }
        }
        DD.toast(sonuc.metin, {ikon: ad === 'su-ekle' ? 'su' : ad.startsWith('oruc') ? 'oruc' : 'onay', eylem: 'Geri al', onEylem: () => { sonuc.geri(); if (DD.aktif()?.ad === 'telefon') ciz(true); }});
      };
      const tik = ev => {
        const e = ev.target.closest('[data-wg-eylem]');
        if (e && kok.contains(e)) { if (e.getAttribute('aria-disabled') === 'true') return; ev.preventDefault(); eylem(e); return; }
        const a = ev.target.closest('[data-wg-ac]');
        if (a && kok.contains(a) && a.dataset.wgAc) { ev.preventDefault(); g = {...g, acik: a.dataset.wgAc}; ciz(false); kok.querySelector('[data-yuva="telefon"]')?.scrollIntoView({block: 'start', behavior: DD.azHareket() ? 'auto' : 'smooth'}); }
      };
      kok.addEventListener('click', tik);
      const c = [
        bag('telefon-sekme', 'sekme'), bag('telefon-platform', 'platform'), bag('telefon-tema', 'tema'), bag('telefon-wg', 'wg'), bag('telefon-boy', 'boy'),
        bag('telefon-durum', 'durum'), bag('telefon-gor', 'gor'), bag('telefon-gece', 'gece'), bag('telefon-etkinlik', 'etkinlik'), bag('telefon-adim', 'adim'), bag('telefon-komut', 'komut'),
        DD.eylem(kok, 'komut-oynat', oynat),
        DD.eylem(kok, 'tel-kapat', () => { g = {...g, acik: null}; ciz(false); }),
        DD.telefonOlcek(kok)
      ];
      // Kaydırmalı bölüm şeridinde seçili bölüm görünür kalsın
      const secili = kok.querySelector('[data-yuva="telefon-ust"] .dd-seg.is-kaydir [aria-selected="true"]');
      if (secili) { const s = secili.parentElement; s.scrollLeft = secili.offsetLeft - (s.clientWidth - secili.offsetWidth) / 2; }
      sinirKur();
      return () => { dur(); clearTimeout(sinirZ); kok.removeEventListener('click', tik); c.forEach(f => f()); };
    }
  });
})();
