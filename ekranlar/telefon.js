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
 * iPhone kilit ekranı (sekme=kilit, gor=kilit): senaryo sabah|ogle|oruc|ilk|bos (W2; kural ayrıntısı "Kilit ekranı ve StandBy" bölümünde): duvar kâğıdı, saat,
 *   kilit ekranı widget'ları (saat renginde tek ton), Canlı Etkinlik kartları (öğün "+", oruç "Bitir"), ilk kullanımda iOS izin satırı, bildirim yığını.
 * Görünüm 'telefon-gorunum' {sekme, platform, tema, wg, boy, durum, gor, gece, etkinlik, komut, senaryo}; sorgu aynı adlarla ezer
 *   (#/telefon?sekme=widget&wg=su&boy=orta&platform=android&tema=koyu&durum=cevrimdisi). Ekrana özgü ?hal= yok; ortak haller router'dan. */
(() => {
  const {sayi, sure} = DD;
  const K = 'telefon-gorunum';
  const SECENEK = {
    sekme: ['widget', 'kilit', 'canli', 'ayar', 'komut'], platform: ['ios', 'android'], tema: ['acik', 'koyu'], wg: ['ozet', 'su', 'ogunler', 'oruc', 'diyetisyen', 'hafta'], boy: ['kucuk', 'orta', 'buyuk'],
    durum: ['dolu', 'bos', 'giris', 'cevrimdisi', 'pro'], gor: ['kilit', 'standby'], gece: ['gunduz', 'gece'], etkinlik: ['ada', 'oruc', 'randevu', 'akis'], adim: ['0', '4', '8', '12', '16'], komut: ['su', 'ogle'],
    senaryo: ['simdi', 'sabah', 'ogle', 'oruc', 'ilk', 'bos'], ada: ['kisa', 'oruc', 'gunluk']
  };
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');
  const hm = ms => new Date(ms).toTimeString().slice(0, 5);
  const saat = ms => nk(hm(ms));                 // uygulama metni: 12.05
  const sistemSaat = hm;                          // telefonun saati: 17:10
  const gunBasi = ms => new Date(ms).setHours(0, 0, 0, 0);
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const acilis = Date.now();
  const SOZ = {su: 'Dada Diet’e bir bardak su ekle', ogle: 'Dada Diet’e öğle yemeğimi kaydet'};

  const varsayilan = () => ({sekme: 'widget', platform: /android/i.test(navigator.userAgent) ? 'android' : 'ios', tema: 'acik', wg: 'ozet', boy: 'orta', durum: 'dolu', gor: 'kilit', gece: 'gunduz', etkinlik: 'ada', adim: '0', komut: 'su', senaryo: 'simdi', ada: 'kisa'});
  const duzelt = g => {
    if (!WG2[g.wg].boylar.includes(g.boy)) g.boy = 'orta';
    if (g.etkinlik === 'oruc') g.etkinlik = 'ada';
    if (g.durum === 'pro' && !(g.sekme === 'widget' && g.wg === 'hafta')) g.durum = 'dolu';
    if (g.durum === 'bos') g.durum = 'dolu';
    return g;
  };
  const gorunum = ctx => {
    const {durum: _eski, ...kayitli} = DD.durum.oku(K, {});
    const g = {...varsayilan(), ...kayitli, ada: 'kisa'};
    // Eski widget adları (kalori, ogun) yeni aileye eşlenir; eski adresler çalışmaya devam eder.
    const es = x => WG_ESKI[x] || x;
    g.wg = es(g.wg);
    Object.keys(SECENEK).forEach(k => { if (!SECENEK[k].includes(g[k])) g[k] = varsayilan()[k]; const v = k === 'wg' ? es(ctx?.sorgu?.[k]) : ctx?.sorgu?.[k]; if (SECENEK[k].includes(v)) g[k] = v; });
    return duzelt(g);
  };
  // Durum seçimi (giriş yok, çevrimdışı…) ve geçici sahne alanları kalıcı yazılmaz: ekran her açılışta güncel veriyle başlar.
  const kaydet = g => { const {acik, durum, komutAsama, komutOnce, yigin, anim, ada, ...kalici} = g; DD.durum.yaz(K, kalici); };

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

  // ---------- W2 b–e: yeni widget ailesi (kilit ekranı kartlarıyla aynı dil), ortak senaryo verisinden ----------
  // Ana ekran (iPhone ve Android), StandBy, Dinamik Ada ve Android canlı bildirimi aynı sahne(g) verisini çizer; dokunuşlar Şimdi'de gerçek kayda,
  // senaryolarda o senaryonun geçici durumuna yazılır (bkz. Kilit ekranı ve StandBy).
  const WG2 = {
    ozet: {ad: 'Günün özeti', ikon: 'chart-pie', boylar: ['kucuk', 'orta', 'buyuk']},
    su: {ad: 'Su', ikon: 'droplet', boylar: ['kucuk', 'orta']},
    ogunler: {ad: 'Öğünler', ikon: 'utensils', boylar: ['kucuk', 'orta', 'buyuk']},
    oruc: {ad: 'Oruç', ikon: 'hourglass-half', boylar: ['kucuk', 'orta']},
    diyetisyen: {ad: 'Diyetisyen', ikon: 'user-doctor', boylar: ['kucuk', 'orta', 'buyuk']},
    hafta: {ad: 'Haftalık ilerleme', ikon: 'chart-simple', boylar: ['kucuk', 'orta', 'buyuk']}
  };
  const WG_ESKI = {kalori: 'ozet', ogun: 'ogunler'};
  const orucIsaret = rt => (DDV.ritim.fazlar || []).map(f => f.baslangicSaat / (rt.hedefSaat || 16)).filter(x => x > 0 && x < 1);
  const w2Oruc = s => ({tur: s.rt.tur, ad: s.rt.p?.ad, hedefSaat: s.rt.hedefSaat || s.rt.p?.orucSaat, gecenSn: s.rt.gecenSn || 0, oran: s.rt.oran || 0, bas: s.rt.bas, bit: s.rt.bit, kapanis: s.rt.kapanis, kalanDk: s.rt.kalanDk,
    baslik: s.rt.baslik, alt: s.rt.alt, faz: s.rt.tur === 'oruc' ? fazAd((s.rt.gecenSn || 0) / 3600) : '', isaretler: s.rt.tur === 'oruc' ? orucIsaret(s.rt) : [], eylem: s.orucEylem, bitti: s.orucBitti ? s.orucBitti.sure || '1 dakikadan kısa' : null});
  // Pro'ya özel hal: hangi widget'ın Pro'ya özel olacağı ürün kararı bekliyor (Pro satışta değil). Hal yalnız aday tek widget'ta (Haftalık ilerleme) gösterilir.
  const PRO_WG = 'hafta';
  const w2Ciz = (tur, s, boy, a = {}) => {
    const h = {hal: s.durum === 'giris' ? 'giris' : s.durum === 'pro' && tur === PRO_WG ? 'pro' : null, eski: s.eski, pro: {rozet: DDV.uye.pro.rozet, metin: DDV.uye.pro.durumMetni}};
    const w2 = f => o => f({...h, ...o});
    const {wgOzet, wgSu, wgOgunler, wgOruc, wgDiyetisyen, wgHafta} = Object.fromEntries(['wgOzet', 'wgSu', 'wgOgunler', 'wgOruc', 'wgDiyetisyen', 'wgHafta'].map(k => [k, w2(DD[k])]));
    const l = s.l.map(x => ({...x, yeni: a.ogun === x.id}));
    if (tur === 'ozet') return wgOzet({boy, hedef: s.k.hedef, alinan: s.k.alinan, makro: s.makro, ogunler: l, su: s.su, suEylem: s.suEylem});
    if (tur === 'su') return wgSu({boy, icilen: s.su.icilen, hedef: s.su.hedef, bardak: s.su.bardak || DD.SU_BARDAK, eylem: s.suEylem, yeni: !!a.su});
    if (tur === 'ogunler') return wgOgunler({boy, ogunler: l, kalan: s.k.kalan, su: s.su});
    if (tur === 'oruc') return wgOruc({boy, ...w2Oruc(s)});
    if (tur === 'diyetisyen') return wgDiyetisyen({boy, dyt: s.dyt});
    return wgHafta({boy, gunler: s.hafta, hedef: s.k.hedef || DDV.bugun.hedefKcal, suHedef: s.su.hedef, seri: s.seri});
  };
  // Markasız genel simgeler (cam kare + glif; renk Diet token'ı)
  // Markasız genel simgeler: genel adlar, Diet renkleri; belirli bir uygulamanın simgesini andırmasın diye glif ve renkler genel.
  const SIMGELER = [{ikon: 'camera-retro', renk: 'lif', ad: 'Kamera'}, {ikon: 'calendar-days', renk: 'karb-text', ad: 'Takvim'}, {ikon: 'envelope', renk: 'bilgi', ad: 'E-posta'}, {ikon: 'headphones', renk: 'protein', ad: 'Müzik'}, {ikon: 'map-location-dot', renk: 'lif-text', ad: 'Harita'}, {ikon: 'note-sticky', renk: 'uyari', ad: 'Notlar'}, {ikon: 'cloud-sun', renk: 'bilgi-fg', ad: 'Hava'}, {ikon: 'book-open', renk: 'karb-text', ad: 'Kitap'}, {ikon: 'sliders', renk: 'muted', ad: 'Ayarlar'}, {ikon: 'images', renk: 'primary-deep', ad: 'Galeri'}, {ikon: 'stopwatch', renk: 'ink', ad: 'Saat'}, {ikon: 'calculator', renk: 'slate', ad: 'Hesap'}, {ikon: 'microphone', renk: 'protein-text', ad: 'Ses'}, {ikon: 'wallet', renk: 'lif-text', ad: 'Cüzdan'}, {ikon: 'person-running', renk: 'tehlike', ad: 'Spor'}, {ikon: 'video', renk: 'bilgi-fg', ad: 'Video'}];
  const DOCK = [{ikon: 'phone', renk: 'primary'}, {ikon: 'globe', renk: 'bilgi'}, {ikon: 'message', renk: 'primary-dark'}, {ikon: 'headphones', renk: 'protein'}];
  const anaEkran2 = (g, widgetlar, n, o = {}) => DD.anaEkran({widgetlar, simgeler: SIMGELER.slice(0, n), ara: g.platform === 'ios' && o.ara !== false, dock: true, dockSimgeler: DOCK, tarih: g.platform === 'android' ? tarih(DD.simdi().getTime(), 'android') : '', pasif: o.pasif});
  // İzgara 6 sıra × 4 sütun (24 hücre): widget hücreleri düşülür, kalan yerlere simge (Dada Diet simgesi dahil)
  const simgeSayisi = widgetlar => Math.max(0, 23 - widgetlar.reduce((t, w) => t + ({kucuk: 4, orta: 8, buyuk: 16}[w] || 0), 0));
  const DURUM_METIN = {dolu: 'Senaryonun güncel verisi.', giris: 'Oturum yokken Dada Diet yüzeyleri yalnız giriş ister; düğme ve Canlı Etkinlik yok.', cevrimdisi: 'Bağlantı yokken son veri soluk kalır; sağ üstte son güncelleme saati. Sayaçlar akmaya devam eder.', pro: `${DDV.uye.pro.durumMetni} Örnek hal yalnız Haftalık ilerleme widget’ında.`};
  const durumSecim = (g, pro) => cip('telefon-durum', 'Durum', DURUM_ADI[g.durum] && (pro || g.durum !== 'pro') ? g.durum : 'dolu', [
    {metin: 'Güncel', deger: 'dolu', ikon: 'circle-check'}, {metin: 'Giriş yok', deger: 'giris', ikon: 'right-to-bracket'}, {metin: 'Çevrimdışı', deger: 'cevrimdisi', ikon: 'clock-rotate-left'},
    ...(pro ? [{metin: 'Pro’ya özel', deger: 'pro', ikon: 'bolt'}] : [])], DURUM_METIN[DURUM_ADI[g.durum] || 'dolu']);
  const ANIM_NOT = 'Gerçek cihazda geçişleri sistem çizer: iOS widget’ı ve Canlı Etkinlik kendi içerik geçişini, Android widget’ı (RemoteViews/Glance) düz yenilemeyi kullanır. Buradaki halka dolması ve onay işareti dokunuşun sonucunu gösterir.';
  const senaryoSecim = (g, s) => cip('telefon-senaryo', 'Senaryo', g.senaryo, Object.entries(SENARYO).map(([k, x]) => ({metin: x.ad, deger: k, ikon: x.ikon})), SENARYO_METIN[g.senaryo](s));

  // (c) Ana ekran widget'ları
  const WG2_METIN = {
    ozet: 'Kalan kalori halkası; orta boyda protein, karbonhidrat ve yağ; büyük boyda dört öğün (“+”) ve su (+200 ml). Düğmeler uygulamayı açmadan kaydeder.',
    su: '**+200 ml** tek dokunuşla bir bardak ekler; halka ve bardaklar dolar. Widget’a dokununca Bugün açılır.',
    ogunler: 'Sıradaki öğün ya da dört öğün; **+** öğünü kaydeder, halka dolar. Büyük boyda saat ve kalori ile satırlar.',
    oruc: 'Oruçtayken kalan süre widget yeniden çizilmeden geri sayar; **Bitir** orucu bitirir. Başlamadıysa hedef süre ve **Başlat**.',
    diyetisyen: 'Sıradaki görüşme ve son mesaj. **Yanıtla** sohbeti açar (yazı uygulamada). Kilitliyken mesaj metni gizlenir.',
    hafta: 'Son 7 günün kalorisi (kesik çizgi hedef), büyük boyda su; seri alevi bugün sayıldıysa yanar.'
  };
  const widgetBolum = g => {
    const p = g.platform, ios = p === 'ios', s = sahne(g), a = g.anim || {}, w = WG2[g.wg];
    const ekran = anaEkran2(g, [w2Ciz(g.wg, s, g.boy, a)], simgeSayisi([g.boy]));
    const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: s.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, icerik: ekran,
      etiket: `${ios ? 'iPhone' : 'Android'} ana ekranı, ${s.sen.ad}: ${w.ad} widget’ı, ${BOY_AD[p][g.boy]} boy`});
    const adim = ios
      ? ['Ana ekranda boş bir yere **basılı tut**.', 'Sol üstteki **Düzenle**’ye, sonra **Widget Ekle**’ye dokun.', `Listeden **Dada Diet**’i seç, **${w.ad}** widget’ını bul; boyları görmek için yana kaydır.`, '**Widget Ekle**’ye dokun, istediğin yere sürükle.']
      : ['Ana ekranda boş bir yere **basılı tut**.', '**Widget’lar**’a dokun, listede **Dada Diet**’i bul.', `**${w.ad}** widget’ına basılı tutup ana ekrana **sürükle**.`, 'Boyunu değiştirmek için widget’a basılı tut, **kenarlarından** çek; içerik boya göre değişir. Renkler duvar kâğıdından gelen Material You tonuna uyar.'];
    return `${cerceve}
      ${senaryoSecim(g, s)}
      ${durumSecim(g, g.wg === PRO_WG)}
      ${cip('telefon-wg', 'Widget', g.wg, Object.entries(WG2).map(([k, x]) => ({metin: x.ad, deger: k, ikon: x.ikon})))}
      ${seg('telefon-boy', 'Boy', g.boy, w.boylar.map(b => ({ad: BOY_AD[p][b], deger: b})))}
      ${cihazSecim(g)}
      ${DD.p(WG2_METIN[g.wg], {ton: 'ikincil'})}
      ${DD.p(ANIM_NOT, {ton: 'ikincil', meta: true})}
      ${adimlar('Nasıl eklenir', adim)}`;
  };

  // (b) Dinamik Ada (iPhone): günlük (öğün + su) ve oruç Canlı Etkinlikleri. Tek etkinlikte kısa hal, ikisinde minimal; dokununca genişler.
  const adaEtkinlikler = s => {
    const l = [];
    if (s.durum === 'giris') return l;
    if (!s.orucBitti && s.rt.tur === 'oruc' && s.rt.gecenSn < LA_SN) l.push('oruc');
    if (!s.sen.bos && s.izin !== 'red') l.push('gunluk');
    return l;
  };
  const adaVeri = (s, e, a = {}) => (e === 'oruc'
    ? {etkinlik: 'oruc', oran: s.rt.oran, kalanSn: s.rt.hedefSaat * 3600 - s.rt.gecenSn, ad: s.rt.p?.ad, faz: fazAd(s.rt.gecenSn / 3600), bas: s.rt.bas, bit: s.rt.bit, isaretler: orucIsaret(s.rt), eylem: {kod: s.eylemOruc}}
    : {etkinlik: 'gunluk', kalan: s.k.kalan, hedef: s.k.hedef, oncekiKalan: a.ogun || a.su ? a.kalan : null, ogunler: s.l.map(x => ({...x, yeni: a.ogun === x.id})), su: s.su, suEylem: s.suEylem, seri: s.seri});
  const adaBolum = g => {
    const s = sahne(g), a = g.anim || {}, l = adaEtkinlikler(s), an = DD.simdi().getTime();
    const durum = l.includes(g.ada) ? g.ada : 'kisa';
    let ada = '', adaMin = '';
    if (durum !== 'kisa') ada = DD.adaV2({...adaVeri(s, durum, a), tur: 'genis'});
    else if (l.length === 1) ada = DD.adaV2({...adaVeri(s, l[0], a), tur: 'kompakt'});
    else if (l.length === 2) {
      ada = `<button type="button" class="dd-ada2-min" data-ada="${l[0]}" aria-label="${DD.esc(l[0] === 'oruc' ? 'Oruç sayacını genişlet' : 'Günlük kartı genişlet')}">${DD.adaV2({...adaVeri(s, l[0], a), tur: 'minimal'})}</button>`;
      adaMin = `<button type="button" class="dd-ada2-min" data-ada="${l[1]}" aria-label="${DD.esc(l[1] === 'oruc' ? 'Oruç sayacını genişlet' : 'Günlük kartı genişlet')}">${DD.adaV2({...adaVeri(s, l[1], a), tur: 'minimal'})}</button>`;
    }
    const ekran = anaEkran2(g, [w2Ciz('ozet', s, 'orta', a), w2Ciz('su', s, 'kucuk', a), w2Ciz('oruc', s, 'kucuk', a)], simgeSayisi(['orta', 'kucuk', 'kucuk']));
    const cerceve = DD.telefonCerceve({platform: 'ios', tema: g.tema, saat: s.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, ada, adaMin, icerik: ekran,
      etiket: `iPhone, Dinamik Ada, ${s.sen.ad}: ${l.length ? l.map(x => (x === 'oruc' ? 'oruç sayacı' : 'günlük öğün ve su')).join(' ve ') : 'etkin Canlı Etkinlik yok'}, ${durum === 'kisa' ? (l.length === 2 ? 'minimal' : 'kısa') : 'genişletilmiş'}`});
    const secenek = [{metin: l.length === 2 ? 'Minimal' : 'Kısa', deger: 'kisa', ikon: 'minus'}, ...l.map(x => ({metin: x === 'oruc' ? 'Oruç · geniş' : 'Bugün · geniş', deger: x, ikon: x === 'oruc' ? 'hourglass-half' : 'utensils'}))];
    const yok = !l.length ? DD.bant({ton: 'bilgi', ikon: 'bilgi', baslik: 'Etkin Canlı Etkinlik yok', metin: s.durum === 'giris' ? 'Oturum yokken Canlı Etkinlik başlamaz; giriş yapınca günün kartı gelir.' : s.sen.bos ? 'Plan ve kayıt yokken Dinamik Ada boş durur.' : 'Oruç başlayınca ya da günün kartı açılınca Ada’ya gelir.'}) : '';
    return `${cerceve}${yok}
      ${l.length ? cip('telefon-ada', 'Ada', durum, secenek, l.length === 2 ? 'İki etkinlik birlikteyken ikisi de minimal: biri adaya bitişik, öteki ayrı dairede. Dokununca o etkinlik genişler.' : 'Kısa hali hep görünür; dokununca (basılı tutunca) genişler, düğmeler uygulamayı açmadan çalışır.') : ''}
      ${senaryoSecim(g, s)}
      ${durumSecim(g)}
      ${cihazSecim(g)}
      ${DD.p(ANIM_NOT, {ton: 'ikincil', meta: true})}
      ${DD.p('Günlük kart kısa halde kalan kaloriyi, genişte dört öğünü (“+”) ve suyu (+200 ml) gösterir. Oruç sayacı kısa halde kalan süreyi, genişte faz çubuğunu ve **Bitir**’i. Canlı Etkinlik en çok 8 saat; sonra Ada’dan kalkar.', {ton: 'ikincil'})}`;
  };

  // (d) StandBy (iPhone, yatay şarjda): iki büyük widget, arka plan yok; gece görünümü tek ton kırmızı.
  const standbyBolum = g => {
    const s = sahne(g), a = g.anim || {}, gece = g.gece === 'gece', sagTur = s.rt.tur === 'oruc' && !s.orucBitti && s.durum !== 'giris' ? 'oruc' : 'su';
    const cerceve = DD.telefonCerceve({platform: 'ios', tema: 'koyu', yatay: true, etkilesimli: true, sinif: gece ? 'is-gece' : '', etiket: `StandBy, ${s.sen.ad}${gece ? ', gece görünümü' : ''}: Günün özeti ve ${sagTur === 'oruc' ? 'Oruç' : 'Su'}`,
      icerik: DD.standby({sol: w2Ciz('ozet', s, 'kucuk', a), sag: w2Ciz(sagTur, s, 'kucuk', a)})});
    return `${cerceve}
      ${senaryoSecim(g, s)}
      ${durumSecim(g)}
      ${seg('telefon-gor', 'Ekran', g.gor, [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: 'StandBy', deger: 'standby', ikon: 'mobile-screen'}])}
      ${seg('telefon-gece', 'StandBy ışığı', g.gece, [{ad: 'Gündüz', deger: 'gunduz', ikon: 'sun'}, {ad: 'Gece', deger: 'gece', ikon: 'moon'}])}
      ${cihazSecim(g)}
      ${DD.p('iPhone şarjdayken yan duruyorsa ve kilitliyse **StandBy** açılır; widget’lar büyür, arka planları kalkar, renkler tam görünür. Karanlık odada **gece görünümü** her şeyi kırmızı tona çeker. **+200 ml** ve **Bitir/Başlat** burada da çalışır.', {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', ['iPhone’u **şarja tak**, yan çevir ve kilitli bırak (iOS 17 ve sonrası).', 'Widget’lardan birine **basılı tut**, kilidi aç, sol üstteki **+**’ya dokun.', 'Listeden **Dada Diet**’i seç ve widget’ı ekle; iki yığının her biri ayrı düzenlenir.', 'Gece görünümü için **Ayarlar > StandBy > Gece Modu**.'])}`;
  };

  // (e) Android: kilit ekranında devam eden bildirimler (Android 16 Live Update) ve durum çubuğu çipi.
  const androidBildirimler = (s, a = {}) => {
    const l = [];
    if (s.durum === 'giris') return {liste: l, cip: ''};
    const oruc = s.orucBitti ? {tur: 'oruc', ad: s.orucBitti.ad || s.rt.p?.ad, bitti: s.orucBitti.sure || '1 dakikadan kısa', oran: 1} : s.rt.tur === 'oruc' ? {tur: 'oruc', ad: s.rt.p?.ad, gecenSn: s.rt.gecenSn, hedefSaat: s.rt.hedefSaat, oran: s.rt.oran, faz: fazAd(s.rt.gecenSn / 3600), bit: s.rt.bit, isaretler: orucIsaret(s.rt), eylem: {kod: s.eylemOruc}} : null;
    if (oruc) l.push(DD.androidCanli({...oruc, eski: s.eski}));
    if (!s.sen.bos) l.push(DD.androidCanli({eski: s.eski, tur: 'gunluk', kalan: s.k.kalan, ogunler: s.l.map(x => ({...x, yeni: a.ogun === x.id})), su: s.su, suEylem: s.suEylem}));
    const m = s.bildirim.find(x => x.kisi);
    if (m) l.push(DD.androidCanli({tur: 'mesaj', baslik: m.baslik, metin: m.metin, harf: m.kisi.harf, zaman: m.zaman}));
    return {liste: l, cip: s.rt.tur === 'oruc' && !s.orucBitti ? DD.androidCip({kalanSn: s.rt.hedefSaat * 3600 - s.rt.gecenSn}) : ''};
  };
  const androidPerde = g => {
    const s = sahne(g), a = g.anim || {}, b = androidBildirimler(s, a), an = DD.simdi().getTime();
    const ekran = anaEkran2(g, [w2Ciz('ozet', s, 'orta', a)], simgeSayisi(['orta']), {pasif: true});
    const orucK = s.rt.tur === 'oruc' && !s.orucBitti, giris = s.durum === 'giris';
    const ks = `<div class="dd-tel-perde-ks"><span class="is-aktif" aria-hidden="true">${DD.ik('wifi')}</span><span class="is-aktif" aria-hidden="true">${DD.ik('signal')}</span>${giris ? `<span class="is-su" aria-hidden="true">${DD.ik('glass-water')}</span><span aria-hidden="true">${DD.ik('hourglass-half')}</span>` : `<button type="button" class="is-su" data-wg-eylem="${s.suEylem.kod}" aria-label="Su ekle, ${sayi(s.su.icilen)} ml">${DD.ik('glass-water')}</button>${s.orucEylem?.kod ? `<button type="button" class="${orucK ? 'is-oruc is-aktif' : 'is-oruc'}" data-wg-eylem="${s.orucEylem.kod}" aria-label="${orucK ? 'Oruç sürüyor, bitir' : 'Orucu başlat'}">${DD.ik('hourglass-half')}</button>` : `<span aria-hidden="true">${DD.ik('hourglass-half')}</span>`}`}</div>`;
    const perde = `<div class="dd-tel-perde"><div class="dd-tel-perde-ust"><b>${DD.esc(s.saat)}</b><small>${DD.esc(tarih(an, 'android'))}</small></div>${ks}${b.liste.length ? `<div class="dd-kalt is-android is-perde">${b.liste.join('')}</div>` : '<p class="dd-tel-perde-bos">Bildirim yok</p>'}</div>`;
    const cerceve = DD.telefonCerceve({platform: 'android', tema: g.tema, saat: s.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, durumCip: b.cip, icerik: `${ekran}${perde}`, etiket: `Android bildirim alanı, ${s.sen.ad}: ${b.liste.length} bildirim`});
    return `${cerceve}
      ${senaryoSecim(g, s)}
      ${durumSecim(g)}
      ${cihazSecim(g)}
      ${DD.p('Ekranın üstünden aşağı kaydırınca bildirim alanı açılır: günün kartı, oruç sayacı (Android 16 Live Update; durum çubuğunda kalan süre çipi) ve diyetisyen mesajı. Eylemler uygulamayı açmadan çalışır.', {ton: 'ikincil'})}`;
  };
  const androidKilit = g => {
    const s = sahne(g), a = g.anim || {}, b = androidBildirimler(s, a);
    const cerceve = DD.telefonCerceve({platform: 'android', tema: g.tema, saat: s.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, durumCip: b.cip, kilit: {tarih: tarih(DD.simdi().getTime(), 'android')},
      icerik: b.liste.length ? `<div class="dd-kalt is-android">${b.liste.join('')}</div>` : '', etiket: `Android kilit ekranı, ${s.sen.ad}: ${b.liste.length} bildirim`});
    return `${cerceve}
      ${senaryoSecim(g, s)}
      ${durumSecim(g)}
      ${cihazSecim(g)}
      ${DD.p(ANIM_NOT, {ton: 'ikincil', meta: true})}
      ${DD.p('Android’de günün kartı ve oruç sayacı kilit ekranında **devam eden bildirim** olarak durur (Android 16 Live Update): ilerleme çubuğu, kalan süre, durum çubuğunda çip. Eylemler uygulamayı açmadan çalışır: **+ öğün**, **+200 ml su**, **Orucu bitir**. Android’de bu bildirim için süre sınırı yok.', {ton: 'ikincil'})}
      ${adimlar('Nasıl açılır', ['Dada Diet’e **bildirim izni** ver.', 'Günün kartı sabah kendiliğinden gelir; orucu **Ritim**’de ya da widget’tan başlat.', 'Kilit ekranında görünmüyorsa **Ayarlar > Bildirimler** bölümünden kilit ekranı bildirimlerini aç.'])}
      ${DD.btn({metin: 'Bildirim izni', ikon: 'bildirim', tur: 'secondary', tam: true, git: '#/bildirim-izni'})}`;
  };

  // ---------- Kilit ekranı ve StandBy ----------
  // iPhone kilit ekranı (W2, düzeltme: dogrulama-a P2-1/2/3).
  //   Şimdi: oturumun gerçek kaydı ve gerçek saat. Öğün, su, oruç, bildirim Bugün/Ritim/Uzmanım ile aynı kaynaktan; "+" ogunYedim, Bitir orucBitir yazar.
  //   Senaryolar (Sabah, Öğle, Oruçta, İlk kullanım, Boş hal): her biri sabit bir saat ve başlangıçtan açılır, oturumun kayıtlarını okumaz, yazmaz.
  //     Başlangıç uygulamanın referans gününden: DDV.bugun (plan öğünleri, hedef, su kayıtları), DDV.ritim (16:8, pencere 12.05–20.05),
  //     DDV.benimDiyetisyenim (sohbet, sıradaki görüşme), DDV.bildirimler (su hatırlatmaları), DDV.kullanici.seri.
  //     Senaryoda yapılan dokunuşlar (öğün "+", Bitir, izin seçimi) o senaryonun geçici durumunda kalır ('telefon-sahne'): yenilemede durur, senaryo değişince silinir.
  //   Seri: DDV.kullanici.seri bugünü sayar; bugün öğün yokken dünkü seri (bir eksik, sönük), ilk öğünle bir artar. İlk kullanımda 0'dan başlar.
  //   Oruç: Canlı Etkinlik ilk 8 saat; sonra bitiş içeriği en çok 4 saat; daha sonra sayaç yalnız widget'ta (karar 1).
  const SENARYO = {
    simdi: {ad: 'Şimdi', ikon: 'clock', gercek: true},
    sabah: {ad: 'Sabah', saat: '10:40', ikon: 'sun', dolu: []},
    ogle: {ad: 'Öğle', saat: '15:10', ikon: 'utensils', dolu: ['kahvalti', 'ogle']},
    oruc: {ad: 'Oruçta', saat: '23:10', ikon: 'hourglass-half', dolu: ['kahvalti', 'ogle', 'ara']},
    ilk: {ad: 'İlk kullanım', saat: '12:40', ikon: 'seedling', dolu: [], ilk: true},
    bos: {ad: 'Boş hal', saat: '17:10', ikon: 'circle', dolu: [], bos: true}
  };
  const SAHNE_SIFIR = {yigin: false, anim: null};
  const SK = 'telefon-sahne', SO = 'telefon-simdi-oruc';   // SO: Şimdi'de Bitir'den sonra bitiş kartı {sure, bas, ad, an}; en çok 4 saat
  const sahneKayit = g => { const d = DD.durum.oku(SK, null); return d?.senaryo === g.senaryo ? {ogun: {}, ...d} : {senaryo: g.senaryo, ogun: {}}; };
  const sahneYaz = (g, f) => { const d = sahneKayit(g); DD.durum.yaz(SK, f({...d, ogun: {...d.ogun}})); };
  const OGUN_SIRA = ['kahvalti', 'ogle', 'aksam', 'ara'];
  const OGUN_KISA = {kahvalti: 'Kahvaltı', ogle: 'Öğle', aksam: 'Akşam', ara: 'Ara öğün'};
  const isoDk = iso => DD.saatDk(String(iso).slice(11, 16));
  const suankiMs = () => DD.simdi().getTime() + Date.now() - acilis;      // Şimdi görünümünün saati (uygulamanın şimdisi + geçen süre)
  const gunDk = ms => { const t = new Date(ms); return t.getHours() * 60 + t.getMinutes(); };
  const refPlan = id => DDV.bugun.ogunler.find(o => o.id === id);
  // Sıradaki öğün: saati gelmemiş ilk boş öğün, yoksa ilk boş öğün (referanstaki gibi adı vurgulanır).
  const siradakiIsaretle = (l, T) => { const bos = l.filter(x => x.durum === 'bos'), s = bos.find(x => x.dk >= T) || bos[0]; return l.map(x => ({...x, siradaki: x === s})); };
  const ogunSatir = (o, durum, eylem) => ({id: o.id, ad: OGUN_KISA[o.id] || o.ad, tamAd: o.ad, saat: nk(o.saat), kcal: o.kcal, planKcal: refPlan(o.id)?.kcal, dk: DD.saatDk(String(o.saat).replace('.', ':')), durum, ayir: o.id === 'ara', eylem: durum === 'bos' ? eylem : null});

  // Senaryo verisi (referans gün + o senaryonun geçici durumu)
  const senaryoVeri = (g, sen) => {
    const d = sahneKayit(g), T = DD.saatDk(sen.saat), gun = gunBasi(DD.simdi().getTime()), an = gun + T * 6e4;
    const l = sen.bos ? [] : siradakiIsaretle(OGUN_SIRA.map(refPlan).filter(Boolean).map(o => ogunSatir(o, sen.dolu.includes(o.id) || d.ogun[o.id] === 'dolu' ? 'dolu' : 'bos', {kod: 'sahne-ogun', id: o.id})), T);
    const hedef = sen.bos ? null : DDV.bugun.hedefKcal, alinan = toplam(l.filter(x => x.durum === 'dolu'), 'kcal');
    const seriDun = sen.ilk ? 0 : Math.max(0, (DDV.kullanici.seri || 0) - 1), bugun = l.some(x => x.durum === 'dolu');
    const suMl = (sen.ilk || sen.bos ? 0 : toplam((DDV.bugun.su.kayitlar || []).filter(x => DD.saatDk(x.saat) <= T), 'ml')) + (d.su || 0);
    // Oruç: Ritim'in aktif protokolü ve varsayılan penceresi; senaryonun kendi saatinde.
    const p = DDV.ritim.protokoller.find(x => x.id === DDV.ritim.aktifProtokol), ilk = isoDk(DDV.ritim.durumlar.pencere.baslangic), son = ilk + p.pencereSaat * 60;
    let rt;
    if (sen.bos) rt = {tur: 'plansiz'};
    else if (sen.ilk) rt = {tur: 'hazir', p};
    else if (T >= ilk && T < son) rt = {tur: 'pencere', p, kapanis: saat(gun + son * 6e4), kalanDk: son - T};
    else { const basMs = gun + (T < ilk ? son - 1440 : son) * 6e4, bitMs = basMs + p.orucSaat * 36e5, gecenSn = (an - basMs) / 1000;
      rt = {tur: 'oruc', p, gecenSn, hedefSaat: p.orucSaat, oran: Math.min(1, gecenSn / (p.orucSaat * 3600)), bas: `${gunOn(basMs, an)}${saat(basMs)}`, bit: `${gunOn(bitMs, an)}${saat(bitMs)}`}; }
    // Senaryoda "Başlat": oruç senaryo saatinde başlar, sayaç dokunuştan beri akar (kayda yazılmaz).
    if (d.orucBasladi && rt.tur !== 'plansiz' && !d.orucBitti) { const gecenSn = Math.max(0, (Date.now() - d.orucBasladi) / 1000), bitMs = an + p.orucSaat * 36e5;
      rt = {tur: 'oruc', p, gecenSn, hedefSaat: p.orucSaat, oran: Math.min(1, gecenSn / (p.orucSaat * 3600)), bas: saat(an), bit: `${gunOn(bitMs, an)}${saat(bitMs)}`, basladi: true}; }
    // Bildirim: referans sohbetin okunmamış son diyetisyen mesajı ve su hatırlatmaları, saati geçmişse.
    const bildirim = [];
    if (!sen.ilk && !sen.bos) {
      const m = B().sohbet.mesajlar, okundu = m[m.length - 2].id, dy = DDV.diyetisyenler.find(x => x.slug === B().diyetisyen);
      const son_ = [...m].reverse().find(x => x.kim !== 'ben' && x.id > okundu && mesajDk(x) <= T);
      if (son_ && dy) bildirim.push({dk: mesajDk(son_), baslik: dy.kisaAd, metin: son_.metin, kisi: {harf: dy.harf}, ac: '#/uzman/sohbet'});
      bildirim.push(...suHatirlatma(T));
    }
    const r = B().sonrakiRandevu;
    const makro = sen.bos ? null : Object.fromEntries(['P', 'K', 'Y'].map(m => [m, {alinan: toplam(l.filter(x => x.durum === 'dolu').map(x => refPlan(x.id)), m), hedef: DDV.bugun.makro[m].hedef}]));
    const G = (DDV.gecmis || []).slice(-7), hafta = G.map((x, i) => (i === G.length - 1 ? {gun: x.gun, kcal: hedef == null ? null : alinan, suMl, bugun: true} : sen.ilk || sen.bos ? {gun: x.gun, kcal: null, suMl: null} : {gun: x.gun, kcal: x.kcal, suMl: x.suMl}));
    const dyr = DDV.diyetisyenler.find(x => x.slug === B().diyetisyen), mm = B().sohbet.mesajlar, gor = mm.filter(x => mesajDk(x) <= T);
    const dyt = sen.ilk || sen.bos || !dyr ? null : {kisaAd: dyr.kisaAd, harf: dyr.harf, unvan: dyr.unvan, mesajlar: gor.slice(-2).map(x => ({kim: x.kim, metin: x.metin, zaman: nk(x.saat)})),
      okunmamis: gor.filter(x => x.kim !== 'ben' && x.id > mm[mm.length - 2].id).length, randevu: r ? randevuOzet(r) : null};
    return {sen, l, k: {hedef, alinan, kalan: hedef == null ? null : hedef - alinan}, seri: {sayi: seriDun + (bugun ? 1 : 0), bugun}, su: {icilen: suMl, hedef: DDV.bugun.su.hedefMl, bardak: DD.SU_BARDAK}, rt,
      saat: sen.saat, T, bildirim: siraliBildirim(bildirim, T), rv: sen.ilk || sen.bos || !r ? null : {gun: r.tarihMetin.split(' ')[0], saat: nk(r.saat)},
      orucBitti: d.orucBitti || null, izin: d.izin || null, eylemOruc: 'sahne-oruc-bitir', makro, hafta, dyt,
      suEylem: {kod: 'sahne-su'}, orucEylem: rt.tur === 'oruc' && !d.orucBitti ? {kod: 'sahne-oruc-bitir', metin: 'Bitir'} : ['pencere', 'hazir', 'oruc'].includes(rt.tur) ? {kod: 'sahne-oruc-baslat', metin: 'Başlat'} : null};
  };
  // Şimdi: oturumun gerçek kaydı (Bugün, Ritim, Uzmanım ile aynı okuma)
  const simdiVeri = (g, sen) => {
    const nowMs = suankiMs(), T = gunDk(nowMs), dur = DD.durum.oku(`${onek()}-ogun`, {}), gercek = ogunler();
    const l = siradakiIsaretle(OGUN_SIRA.map(id => gercek.find(o => o.id === id)).filter(Boolean).map(o => ogunSatir(o, o.durum === 'atlandi' ? 'atlandi' : o.durum === 'dolu' ? 'dolu' : 'bos',
      !yeni() && refPlan(o.id)?.besinler.length ? {kod: 'ogun-yedim', id: o.id} : {ac: `#/ogun/${o.id}`})), T);
    const k = kalori(), bugun = l.some(x => x.durum === 'dolu'), seriDun = yeni() ? 0 : Math.max(0, (DDV.kullanici.seri || 0) - 1);
    const r = ritim();
    let rt;
    if (r.hal === 'kapali') rt = {tur: 'kapali', baslik: r.engel ? 'Önerilmiyor' : 'Takip kapalı', alt: r.engel ? 'Sağlık bilgine göre' : 'Ritim’de plan seç'};
    else if (!r.protokol || r.protokol.haftalik) rt = {tur: 'kapali', baslik: `${r.protokol?.ad || ''} planı`, alt: 'Haftalık takvimde'};
    else if (r.hal === 'bos') rt = {tur: 'hazir', p: r.protokol};
    else if (r.canli) rt = {tur: 'oruc', gercek: true, p: r.protokol, gecenSn: r.gecenSn, hedefSaat: r.hedefSaat, oran: r.oran, bas: r.bas, bit: r.bit};
    else rt = {tur: 'pencere', p: r.protokol, kapanis: saat(r.bitMs), kalanDk: Math.max(0, Math.round((r.bitMs - r.anMs) / 6e4))};
    const bildirim = [];
    if (!yeni()) {
      const dy = diyetisyen();
      if (dy.diyetisyen) {
        const ham = [...B().sohbet.mesajlar, ...DD.durum.oku('uzman-sohbet', [])], okundu = DD.durum.oku('uzman-okundu', B().sohbet.mesajlar[B().sohbet.mesajlar.length - 2].id);
        const m = [...ham].reverse().find(x => x.kim !== 'ben' && x.id > okundu && mesajDk(x) <= T);
        if (m) bildirim.push({dk: mesajDk(m), baslik: dy.diyetisyen.kisaAd, metin: m.metin, kisi: {harf: dy.diyetisyen.harf}, ac: '#/uzman/sohbet'});
      }
      bildirim.push(...suHatirlatma(T));
    }
    const dy = yeni() ? null : diyetisyen(), rv = dy?.randevu, w = su(), kk = k.hedef == null ? {hedef: null, kalan: null, alinan: 0} : k;
    const G = (DDV.gecmis || []).slice(-7), hafta = G.map((x, i) => (i === G.length - 1 ? {gun: x.gun, kcal: kk.hedef == null ? null : kk.alinan, suMl: w.icilen, bugun: true} : yeni() ? {gun: x.gun, kcal: null, suMl: null} : {gun: x.gun, kcal: x.kcal, suMl: x.suMl}));
    const dyt = dy?.diyetisyen ? {kisaAd: dy.diyetisyen.kisaAd, harf: dy.diyetisyen.harf, unvan: dy.diyetisyen.unvan, mesajlar: dy.mesajlar.slice(-2).map(x => ({kim: x.kim, metin: x.metin, zaman: x.saat})), okunmamis: dy.okunmamis,
      randevu: rv ? {gun: rv.gun, saat: rv.saat, kalan: rv.kalan, gunNo: rv.gunNo, ay: rv.ay, tur: rv.tur} : null} : null;
    return {sen, l, k: kk, seri: {sayi: seriDun + (bugun ? 1 : 0), bugun}, su: w, rt, saat: hm(nowMs), T,
      bildirim: siraliBildirim(bildirim, T), rv: rv ? {gun: rv.gun, saat: rv.saat} : null, orucBitti: simdiBitis(r), izin: 'ver', eylemOruc: 'oruc-bitir',
      makro: kk.makro || null, hafta, dyt, suEylem: {kod: 'su-ekle'},
      orucEylem: rt.tur === 'oruc' ? {kod: 'oruc-bitir', metin: 'Bitir'} : rt.tur === 'pencere' ? {kod: 'oruc-baslat', metin: 'Başlat'} : rt.tur === 'hazir' ? {ac: '#/ritim', metin: 'Ritim’de başlat'} : null};
  };
  const randevuOzet = r => { const t = new Date(`${r.tarih}T12:00:00`); return {gun: r.tarihMetin.split(' ')[0], saat: nk(r.saat), kalan: kalanYazi(randevuMs(r)), gunNo: String(t.getDate()), ay: t.toLocaleDateString('tr-TR', {month: 'short'}), tur: r.tur}; };
  const simdiBitis = r => { const so = DD.durum.oku(SO, null); return so && !r.canli && suankiMs() - so.an < LA_KALIR_SN * 1000 ? so : null; };
  const bitisMetni = ob => (ob.sure ? {baslik: 'Oruç bitti', metin: `${ob.sure} · pencere açıldı`} : {baslik: 'Pencere yeniden açıldı', metin: 'Oruç 1 dakikadan kısa sürdü'});
  const suHatirlatma = T => {
    const s = (DDV.bildirimler || []).filter(b => b.tur === 'su').map(b => ({...b, dk: DD.saatDk(String(b.zaman).replace(/^\D+/, ''))})).filter(b => b.dk <= T).sort((a, b) => b.dk - a.dk)[0];
    return s ? [{dk: s.dk, baslik: s.baslik, metin: s.metin, ac: '#/bugun'}] : [];
  };
  const siraliBildirim = (l, T) => l.sort((a, b) => b.dk - a.dk).map(x => ({...x, zaman: onceYazi(T - x.dk)}));
  const fazAd = sa => DDV.ritim.fazlar?.find(f => sa >= f.baslangicSaat && (f.bitisSaat == null || sa < f.bitisSaat))?.ad || '';
  // Mesaj saati "Bugün 10:02" ise bugünün dakikası; önceki günler (Perşembe 21:15) bir gün öncesine düşer.
  const mesajDk = m => { const s = String(m.saat || ''), t = s.match(/(\d{1,2}):(\d{2})/); if (!t) return DD.saatDk(hm(DD.simdi().getTime())); return DD.saatDk(`${t[1]}:${t[2]}`) - (/^Bugün/i.test(s) ? 0 : 1440); };
  const onceYazi = dk => (dk < 0 ? 'Dün' : dk < 1 ? 'şimdi' : dk < 60 ? `${dk} dk önce` : `${Math.floor(dk / 60)} sa önce`);
  // Durum (senaryonun üstüne): giris (oturum yok), cevrimdisi (son veri, son güncelleme saati; senaryoda o saate dek son su kaydı, Şimdi'de sonGuncelleme), pro (yalnız PRO_WG widget'ı).
  const DURUM_ADI = {giris: 'giris', cevrimdisi: 'cevrimdisi', pro: 'pro'};
  const sahne = g => {
    const sen = SENARYO[g.senaryo] || SENARYO.simdi, v = sen.gercek ? simdiVeri(g, sen) : senaryoVeri(g, sen), durum = DURUM_ADI[g.durum] || 'dolu';
    const sonSu = sen.gercek ? null : (DDV.bugun.su.kayitlar || []).filter(x => !sen.ilk && !sen.bos && DD.saatDk(x.saat) <= v.T).pop();
    const eski = durum !== 'cevrimdisi' ? null : sen.gercek ? sonGuncelleme() : nk(sonSu ? sonSu.saat : v.saat);
    return {...v, durum, eski};
  };
  const kilitTarih = satirli => { const t = DD.simdi(), f = o => t.toLocaleDateString('tr-TR', o); return satirli ? `${f({weekday: 'short'})} ${f({day: 'numeric'})}` : `${f({day: 'numeric', month: 'long'})} ${f({weekday: 'long'})}`; };
  const sahneAksesuar = s => {
    if (s.durum === 'giris') return [DD.kilitWidget({tur: 'dikdortgen', ikon: 'right-to-bracket', baslik: 'Dada Diet', metin: 'Giriş yap', alt: 'Günün burada', ac: '#/giris', aria: 'Dada Diet: giriş yap, günün burada görünsün'})];
    const l = sahneAksesuar_(s);
    return s.eski ? l.map((x, i) => (i === 2 ? x.replace(/<small>[^<]*<\/small>/, `<small>Son güncelleme ${DD.esc(s.eski)}</small>`) : x)) : l;
  };
  const sahneAksesuar_ = s => {
    const {k, su: w, rt} = s, ac = {kalori: '#/bugun', su: '#/bugun', oruc: '#/ritim'};
    const kal = k.hedef == null
      ? DD.kilitWidget({tur: 'daire', ikon: 'fire-flame-curved', deger: '—', oran: 0, ac: ac.kalori, aria: 'Kalori: hedef yok, Dada Diet’te hedefini belirle'})
      : DD.kilitWidget({tur: 'daire', ikon: 'fire-flame-curved', deger: sayi(Math.max(0, k.kalan)), oran: k.alinan / k.hedef, ac: ac.kalori, aria: `Kalori: ${sayi(Math.max(0, k.kalan))} kcal kaldı`});
    const suW = DD.kilitWidget({tur: 'daire', ikon: 'glass-water', deger: `${(w.icilen / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} L`, oran: w.icilen / w.hedef, ac: ac.su, aria: `Su: ${sayi(w.icilen)} / ${sayi(w.hedef)} ml`});
    let oruc;
    if (s.orucBitti) oruc = DD.kilitWidget({tur: 'dikdortgen', ikon: 'utensils', baslik: 'Yeme penceresi', metin: 'Açıldı', alt: s.orucBitti.sure ? `Oruç ${s.orucBitti.sure}` : 'Oruç 1 dk’dan kısa', ac: ac.oruc});
    else if (rt.tur === 'oruc') oruc = orucSuren(rt).rect({ac: ac.oruc});
    else if (rt.tur === 'pencere') oruc = DD.kilitWidget({tur: 'dikdortgen', ikon: 'utensils', baslik: 'Yeme penceresi', metin: `Kapanış ${rt.kapanis}`, alt: `${sure(rt.kalanDk)} kaldı`, ac: ac.oruc});
    else if (rt.tur === 'hazir') oruc = DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Oruç', metin: `${rt.p.orucSaat} sa hedef`, alt: 'Ritim’de başlat', ac: ac.oruc});
    else if (rt.tur === 'plansiz') oruc = DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Oruç', metin: 'Plan seçilmedi', alt: 'Ritim’de seç', ac: ac.oruc});
    else oruc = DD.kilitWidget({tur: 'dikdortgen', ikon: 'hourglass-half', baslik: 'Oruç', metin: rt.baslik, alt: rt.alt, ac: ac.oruc});
    return [kal, suW, oruc];
  };
  const orucKarti = s => {
    const {rt} = s;
    if (s.durum === 'giris') return '';
    // Bitir'den sonra bitiş içeriği: başlangıç ve süre Bitir anındaki kayıttan (Ritim'in gerçek orucu ya da senaryonun orucu).
    if (s.orucBitti) return DD.canliOrucKarti({baslik: `Oruç · ${s.orucBitti.ad || rt.p?.ad || ''}`, bitti: bitisMetni(s.orucBitti), oran: 1, bas: s.orucBitti.bas, ac: '#/ritim'});
    if (rt.tur !== 'oruc') return '';
    const kalanSn = rt.hedefSaat * 3600 - rt.gecenSn, isaretler = (DDV.ritim.fazlar || []).map(f => f.baslangicSaat / rt.hedefSaat).filter(x => x > 0 && x < 1);
    if (rt.gecenSn >= LA_SN + LA_KALIR_SN) return '';
    if (rt.gecenSn >= LA_SN) return DD.canliOrucKarti({baslik: `Oruç · ${rt.p.ad}`, bitti: {baslik: 'Orucun devam ediyor', metin: 'Kalan süre widget’ta'}, oran: rt.oran, bas: rt.bas, ac: '#/ritim'});
    return DD.canliOrucKarti({eski: s.eski, baslik: `Oruç · ${rt.p.ad}`, faz: fazAd(rt.gecenSn / 3600), kalanSn, kalanMetin: kalanSn > 0 ? `${sure(Math.ceil(kalanSn / 60))} kaldı` : 'Hedefine ulaştın', oran: rt.oran, bas: rt.bas, bit: rt.bit, isaretler, ac: '#/ritim',
      eylem: {kod: s.eylemOruc, metin: 'Bitir', aria: 'Orucu bitir'}});
  };
  const ogunKarti = (s, g) => {
    const {sen, l, k, seri} = s, a = g.anim || {};
    if (sen.bos || s.durum === 'giris' || (s.izin === 'red' && !a.izin)) return '';
    const alt = sen.ilk && !s.izin ? DD.canliIzinSatiri({uygulama: 'Dada Diet'}) : a.izin === 'ver' ? DD.canliIzinSatiri({uygulama: 'Dada Diet', kapaniyor: true}) : '';
    return DD.canliOgunKarti({eski: s.eski, ogunler: l.map(x => ({...x, yeni: a.ogun === x.id})), kalan: k.kalan, oncekiKalan: a.ogun ? a.kalan : null,
      seri: {...seri, yeni: !!a.ogun && seri.sayi !== a.seri}, ac: '#/bugun', acDugme: sen.ilk ? '#/bugun' : null, alt, sinif: a.izin === 'red' ? 'is-kapaniyor' : ''});
  };
  const SENARYO_METIN = {
    simdi: s => `Şu an (${nk(s.saat)}), Bugün ve Ritim’deki kaydın: ${s.l.filter(x => x.durum === 'dolu').length} öğün kayıtlı${s.rt.tur === 'oruc' ? ', oruç sürüyor' : s.rt.tur === 'pencere' ? `, yeme penceresi ${s.rt.kapanis}’te kapanıyor` : ''}. Buradaki “+” ve Bitir kaydına yazar.`,
    sabah: s => `Saat ${nk(s.saat)}: henüz öğün yok, seri bugünü bekliyor.${s.rt.tur === 'oruc' ? ` Oruç ${s.rt.bit}’te bitiyor; 8 saati geçtiği için sayaç kilit ekranı widget’ında.` : ''}`,
    ogle: s => `Saat ${nk(s.saat)}: kahvaltı ve öğle kayıtlı${s.rt.tur === 'pencere' ? `, yeme penceresi ${s.rt.kapanis}’te kapanıyor` : ''}.`,
    oruc: s => `Saat ${nk(s.saat)}: oruç ${s.rt.bas}’te başladı, ${s.rt.bit}’te bitiyor.`,
    ilk: () => 'İlk gün: kayıt yok, seri sıfırdan başlıyor. Kart ilk kez açılınca iPhone Canlı Etkinlik izni sorar.',
    bos: () => 'Plan ve kayıt yokken: widget’lar boş durur, Canlı Etkinlik ve bildirim yok.'
  };
  // Telefon ve görünüm seçimi telefonun altında (P2-5: telefon ekrana daha büyük sığar).
  const cihazSecim = g => `<div class="dd-ikili">
      ${DD.alan({etiket: 'Telefon', html: DD.segment({ad: 'telefon-platform', etiket: 'Telefon', secili: g.platform, ogeler: [{ad: 'iPhone', deger: 'ios'}, {ad: 'Android', deger: 'android'}]})})}
      ${DD.alan({etiket: 'Görünüm', html: DD.segment({ad: 'telefon-tema', etiket: 'Görünüm', secili: g.tema, ogeler: [{ad: 'Açık', deger: 'acik', ikon: 'sun'}, {ad: 'Koyu', deger: 'koyu', ikon: 'moon'}]})})}
    </div>`;
  const kilitSahne = g => {
    const s = sahne(g), {sen} = s, a = g.anim || {};
    if (s.durum === 'giris') { s.bildirim = []; s.rv = null; }
    const satir = s.rv ? DD.kilitWidget({tur: 'satir', ikon: 'calendar-days', metin: `${s.rv.gun.slice(0, 3)} ${s.rv.saat} diyetisyen görüşmesi`, ac: '#/uzman', aria: `Diyetisyen görüşmesi ${s.rv.gun} ${s.rv.saat}`}) : '';
    // Oruç sürerken oruç kartı üstte (relevanceScore); öbür durumlarda öğün kartı.
    const kartlar = s.rt.tur === 'oruc' || s.orucBitti ? [orucKarti(s), ogunKarti(s, g)] : [ogunKarti(s, g), orucKarti(s)];
    const icerik = DD.kilitAlt([...kartlar, DD.kilitBildirim({ogeler: s.bildirim, acik: g.yigin, yeni: a.yigin})]);
    const kartSayi = kartlar.filter(Boolean).length, dolu = s.l.filter(x => x.durum === 'dolu').length;
    const cerceve = DD.telefonCerceve({platform: 'ios', tema: g.tema, saat: s.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, icerik,
      kilit: {tarih: kilitTarih(!!satir), satir, aksesuar: sahneAksesuar(s), acik: s.bildirim.length > 0},
      etiket: `iPhone kilit ekranı, ${sen.ad}, saat ${nk(s.saat)}: ${kartSayi ? `${kartSayi} Canlı Etkinlik` : 'Canlı Etkinlik yok'}${s.k.kalan != null && !sen.bos ? `, ${sayi(Math.max(0, s.k.kalan))} kcal kaldı, ${dolu} öğün` : ''}${s.bildirim.length ? `, ${s.bildirim.length} bildirim` : ''}`});
    return `${cerceve}
      ${cip('telefon-senaryo', 'Senaryo', g.senaryo, Object.entries(SENARYO).map(([k, x]) => ({metin: x.ad, deger: k, ikon: x.ikon})), SENARYO_METIN[g.senaryo](s))}
      ${durumSecim(g)}
      ${cihazSecim(g)}
      ${seg('telefon-gor', 'Ekran', g.gor, [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: 'StandBy', deger: 'standby', ikon: 'mobile-screen'}])}
      ${DD.p('**Öğün kartı** ve **oruç kartı** Canlı Etkinlik’tir: öğünün **+**’sı uygulamayı açmadan kaydeder, halka dolar ve seri sayılır; **Bitir** orucu bitirir. Karta dokununca Dada Diet açılır. **Şimdi** görünümünde dokunuşlar Bugün ve Ritim’deki kaydına yazar.', {ton: 'ikincil'})}
      ${DD.p('Saatin altındaki widget’lar iPhone’un kuralıyla **saatin renginde** tek ton çizilir: kalan kalori, su ve oruç. Tarih satırında sıradaki görüşme. Canlı Etkinlik en çok 8 saat güncellenir; uzun oruçta sayaç oruç widget’ında sürer.', {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', ['Kilit ekranına **basılı tut**, **Özelleştir**’e ve **Kilit Ekranı**’na dokun.', 'Saatin altındaki alana dokun, listeden **Dada Diet**’i seç; kalori, su ya da oruç widget’ını ekle.', 'Satır içi widget için **tarihe** dokun ve Dada Diet’i seç.', 'Canlı Etkinlik ilk açıldığında **İzin Ver**’e dokun; sonra **Ayarlar > Dada Diet > Canlı Etkinlikler**’den kapatabilirsin.'])}`;
  };
  // Kilit ekranı bölümü: iPhone kilit ekranı (senaryolar), StandBy (iPhone, yatay) ve Android kilit ekranı (devam eden bildirimler).
  const kilitBolum = g => {
    if (g.platform !== 'ios') return androidKilit(g);
    if (g.gor === 'standby') return standbyBolum(g);
    return kilitSahne(g);
  };
  // ---------- Canlı Etkinlik / canlı bildirim ----------
  const canliBolum = g => {
    const p = g.platform, ios = p === 'ios', r = ritim(), canli = r.canli, dy = diyetisyen(), rv = dy.randevu;
    const secim = seg('telefon-etkinlik', 'Etkinlik', g.etkinlik, [{ad: ios ? 'Dinamik Ada' : 'Bildirim alanı', deger: 'ada', ikon: ios ? 'mobile-screen' : 'bell'}, {ad: 'Görüşme', deger: 'randevu', ikon: 'video'}, {ad: '16 saat', deger: 'akis', ikon: 'stopwatch'}]);
    if (g.etkinlik === 'akis') return `${akisBolum(g)}${secim}`;
    if (g.etkinlik === 'ada') return `${ios ? adaBolum(g) : androidPerde(g)}${secim}`;
    // Görüşme: katılım açıldığı an (randevu saatinden katilAcilisDk önce); geri sayım görüşme saatine.
    if (!rv) {
      return `${DD.bant({ton: 'bilgi', ikon: 'takvim', baslik: yeni() ? 'Henüz diyetisyenin yok' : 'Planlı görüşmen yok', metin: 'Görüşme planladığında, saati yaklaşınca geri sayım **kilit ekranına** gelir.', eylem: {metin: yeni() ? 'Diyetisyen bul' : 'Görüşme planla', git: yeni() ? '#/uzman/bul' : '#/uzman'}})}
        ${DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(DD.simdi().getTime()), kilit: {tarih: tarih(DD.simdi().getTime(), p)}, etiket: 'Kilit ekranı: planlı görüşme yok'})}${secim}${cihazSecim(g)}`;
    }
    const rh = rv.ham, an = randevuMs(rh) - rh.katilAcilisDk * 6e4, kalanSn = rh.katilAcilisDk * 60;
    const gr = {durum: 'randevu', baslik: rh.baslik, etiket: 'Diyetisyen görüşmesi', kisi: dy.diyetisyen.kisaAd, harf: dy.diyetisyen.harf, tur: rh.tur, saat: nk(rh.saat), kalanSn, eylem: 'Görüşmeye katıl', eylemAc: '#/uzman'};
    // iPhone kilit ekranında görüşme kartı yeni dilde (DD.canliRandevuKarti); Android'de canlı bildirim.
    const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), etkilesimli: true, duvar: 'gorsel', sigdir: true, kilit: {tarih: tarih(an, p)}, durumCip: ios ? '' : DD.durumCipi({durum: 'randevu', kalanSn}),
      icerik: ios ? DD.kilitAlt([DD.canliRandevuKarti({baslik: rh.baslik, kisi: dy.diyetisyen.kisaAd, harf: dy.diyetisyen.harf, tur: rh.tur, saat: nk(rh.saat), kalanSn, eylem: {ac: '#/uzman'}})]) : DD.canliEtkinlik({platform: p, ...gr}), etiket: `${ios ? 'iPhone' : 'Android'} kilit ekranı: ${rh.baslik}, ${rv.gun} ${rv.saat}, ${rh.katilAcilisDk} dakika kaldı`});
    const ek = ios
      ? DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', yardim: 'Kısa halde kalan süre; basılı tutunca katılım düğmesi. Oruç da sürerken ikisi de minimal olur.', html: `<div class="dd-yigin-8">
          ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'kompakt'}), etiket: 'Dinamik Ada kısa hali: görüşmeye kalan süre'})}
          ${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'genis'}), etiket: 'Dinamik Ada geniş hali: görüşme ve katıl düğmesi'})}
          ${canli && r.gecenSn < LA_SN ? DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.dinamikAda({...gr, tur: 'minimal'}), adaMin: DD.dinamikAda({tur: 'minimal', durum: 'oruc', oran: r.oran}), etiket: 'Dinamik Ada, iki etkinlik: ikisi de minimal; görüşmenin kalan dakikası adaya bitişik, oruç halkası ayrı dairede'}) : ''}</div>`})
      : DD.alan({etiket: 'Telefon açıkken: durum çubuğu', yardim: 'Kalan süre saatin yanında çip olarak durur (Android 16 ve sonrası).', html: DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), durumCip: DD.durumCipi({durum: 'randevu', kalanSn}), icerik: DD.canliEtkinlik({platform: p, ...gr}), etiket: 'Durum çubuğunda görüşmeye kalan süre'})});
    return `${cerceve}${secim}${cihazSecim(g)}${ek}
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
  const sessiz = html => html.replace(/ data-wg-(eylem|ac)="[^"]*"/g, '').replace(/ data-ada="[^"]*"/g, '').replace(/ data-id="[^"]*"/g, '').replace(/<button /g, '<button tabindex="-1" ');
  const akisBolum = g => {
    const p = g.platform, ios = p === 'ios', R = DDV.ritim, P = R.protokoller.find(x => x.id === '16-8') || {ad: '16:8', orucSaat: 16};
    const H = P.orucSaat, sa = +g.adim, basMs = new Date(R.durumlar.oruc.baslangic.slice(0, 16)).getTime(), an = basMs + sa * 36e5, bitMs = basMs + H * 36e5;
    const gecenSn = sa * 3600, kalanSn = (H - sa) * 3600, oran = sa / H, tamam = sa >= H;
    const bas = `${gunOn(basMs, an)}${saat(basMs)}`, bit = `${gunOn(bitMs, an)}${saat(bitMs)}`;
    const kalanMetin = tamam ? 'Hedefine ulaştın' : `Kalan ${sure((H - sa) * 60)}`;
    // Yeni dil (W2): oruç kartı, Dinamik Ada v2, oruç widget'ı ve Android Live Update aynı bileşenlerden; çizelge sahnesi dokunulmaz (kayıt yazmaz).
    const rt = {tur: 'oruc', p: P, gecenSn, hedefSaat: H, oran, bas, bit}, isaret = orucIsaret(rt), faz = fazAd(sa);
    const kart = DD.canliOrucKarti({baslik: `Oruç · ${P.ad}`, faz, kalanSn, kalanMetin, oran, bas, bit, isaretler: isaret, eylem: {kod: 'oruc-bitir', metin: 'Bitir', aria: 'Orucu bitir'}});
    const suren = orucSuren({gecenSn, hedefSaat: H, oran, bas, bit}), rect = suren.rect();
    const kilitCerceve = icerik => DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), duvar: 'gorsel', sigdir: true, kilit: {tarih: tarih(an, p, ios), aksesuar: ios ? [rect] : []}, durumCip: !ios && !tamam ? DD.androidCip({kalanSn}) : '', icerik,
      etiket: `${AKIS[sa].ad}: ${ios ? 'iPhone' : 'Android'} kilit ekranı, ${kalanMetin}`});
    const wg = DD.wgOruc({boy: 'kucuk', tur: 'oruc', ad: P.ad, hedefSaat: H, gecenSn, oran, bas, bit, faz, isaretler: isaret, eylem: {kod: 'oruc-bitir', metin: 'Bitir'}});
    const anaCerceve = () => DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), duvar: 'gorsel', sigdir: true, etiket: `${AKIS[sa].ad}: ana ekranda Oruç widget’ı, ${kalanMetin}`,
      icerik: anaEkran2(g, [wg], simgeSayisi(['kucuk']))});
    const adaKesit = tur => DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(an), ada: DD.adaV2({etkinlik: 'oruc', tur, oran, kalanSn, ad: P.ad, faz, bas, bit, isaretler: isaret, eylem: {kod: 'oruc-bitir'}}), etiket: `${AKIS[sa].ad}: Dinamik Ada ${tur === 'kompakt' ? 'kısa' : 'geniş'} hali`});
    let sahne;
    if (!ios) {
      sahne = kilitCerceve(`<div class="dd-kalt is-android">${DD.androidCanli({tur: 'oruc', ad: P.ad, gecenSn, hedefSaat: H, oran, faz, bit, isaretler: isaret, eylem: {kod: 'oruc-bitir'}})}</div>`);
      if (sa >= 8) sahne += anaCerceve();
    } else if (sa < 8) {
      sahne = `${kilitCerceve(DD.kilitAlt([kart]))}${DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', html: adaKesit(sa === 0 ? 'kompakt' : 'genis')})}`;
    } else if (sa === 8) {
      sahne = `${kilitCerceve(DD.kilitAlt([DD.canliOrucKarti({baslik: `Oruç · ${P.ad}`, bitti: {baslik: 'Orucun devam ediyor', metin: 'Kalan süre widget’ta'}, oran, bas})]))}${anaCerceve()}`;
    } else sahne = `${kilitCerceve('')}${anaCerceve()}`;
    const adimlar_ = Object.entries(AKIS).map(([h, x]) => `**${x.ad} · ${x.alt}.** ${x.ios.replace(/^\*\*[^*]+\*\*\s*/, '')}`);
    // Telefon(lar) en üstte (ekrana sığsın), seçiciler altta.
    return `${sessiz(sahne)}
      ${cip('telefon-adim', '16 saatlik oruç', g.adim, Object.entries(AKIS).map(([h, x]) => ({metin: `${x.ad} · ${x.alt}`, deger: h})))}
      ${ios ? '' : DD.bant({ton: 'bilgi', ikon: 'saat', baslik: 'Android’de süre sınırı yok', metin: 'Canlı bildirim 16 saat boyunca bildirimde ve durum çubuğu çipinde akar; widget’a devir gerekmez. Ana ekran widget’ındaki sayaç da Chronometer ile kendiliğinden akar.'})}
      ${cihazSecim(g)}
      ${DD.p(ios ? AKIS[sa].ios : `**${AKIS[sa].ad}.** ${tamam ? 'Bildirim “Hedefine ulaştın” der; **Orucu bitir** ile pencere açılır.' : 'Sayaç bildirimde akar; kalan süre ve ilerleme görünür.'}`, {ton: 'ikincil'})}
      ${ios ? DD.ako({baslik: 'Akışın tamamı', html: DD.cihazAdimlar(adimlar_)}) : ''}`;
  };

  // ---------- Hızlı ayar: iOS Denetim Merkezi denetimi (iOS 18), Android Hızlı Ayarlar kutucuğu ----------
  const ayarBolum = g => {
    const p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), giris = g.durum === 'giris', sc = sahne(g), s = sc.su, oruc = sc.rt.tur === 'oruc' && !sc.orucBitti;
    // Su ekle: tek seferlik eylem (hazırken pasif STATE_INACTIVE, dokununca kısa süre aktif). Oruç: aç/kapa kutucuğu (oruçta aktif STATE_ACTIVE; dokununca başlatır/bitirir).
    // Oturum yokken ikisi de kullanılamaz (STATE_UNAVAILABLE, dokunulmaz). Veri ve dokunuş senaryonun (Şimdi'de gerçek kaydın).
    const suK = {bizim: true, genis: true, renk: 'su', ad: 'Su ekle', ikon: 'glass-water', hal: giris ? 'kullanilamaz' : 'pasif', alt: giris ? 'Giriş gerekli' : ios ? `${sayi(s.icilen)} ml` : `${sayi(s.icilen)} / ${sayi(s.hedef)} ml`, ...(giris ? {} : {eylem: sc.suEylem.kod})};
    const orucEylem = sc.orucEylem?.kod;
    // Kutucuk alt satırı dar: “12 sa 55 dk kaldı” kesiliyordu, “12:55 kaldı” sığar.
    const dkSaat = dk => `${Math.floor(Math.max(0, dk) / 60)}:${String(Math.max(0, dk) % 60).padStart(2, '0')}`;
    const orucK = {bizim: true, genis: true, renk: 'oruc', ad: 'Oruç', ikon: 'hourglass-half', hal: giris || !orucEylem ? 'kullanilamaz' : oruc ? 'aktif' : 'pasif', alt: giris ? 'Giriş gerekli' : !orucEylem ? (sc.rt.tur === 'plansiz' ? 'Plan yok' : 'Ritim’de başlat') : oruc ? `${dkSaat(Math.ceil((sc.rt.hedefSaat * 3600 - sc.rt.gecenSn) / 60))} kaldı` : `${sc.rt.p?.orucSaat || 16} sa · başlat`, ...(giris || !orucEylem ? {} : {eylem: orucEylem})};
    const SISTEM = ios
      ? [{ad: 'Uçak modu', ikon: 'plane'}, {ad: 'Wi-Fi', ikon: 'wifi', hal: 'aktif'}, {ad: 'Hücresel', ikon: 'signal', hal: 'aktif'}, {ad: 'Rahatsız Etme', ikon: 'moon', hal: 'pasif'}, suK, orucK, {ad: 'Kamera', ikon: 'camera', hal: 'pasif'}]
      : [{ad: 'Wi-Fi', alt: 'Açık', ikon: 'wifi', hal: 'aktif'}, {ad: 'Mobil veri', alt: 'Açık', ikon: 'signal', hal: 'aktif'}, suK, orucK, {ad: 'Rahatsız etmeyin', alt: 'Kapalı', ikon: 'moon'}, {ad: 'Konum', alt: 'Açık', ikon: 'location-dot', hal: 'aktif'}, {ad: 'Uçak modu', alt: 'Kapalı', ikon: 'plane'}, {ad: 'Otomatik döndür', alt: 'Kapalı', ikon: 'rotate'}];
    const panel = DD.hizliAyarlar({platform: p, saat: sc.saat, tarih: tarih(an, 'android'), kutucuklar: SISTEM});
    const icerik = ios ? `${anaEkran2(g, [w2Ciz('ozet', sc, 'kucuk'), w2Ciz('su', sc, 'kucuk')], simgeSayisi(['kucuk', 'kucuk']), {pasif: true})}${panel}` : panel;
    const cerceve = DD.telefonCerceve({platform: p, tema: g.tema, saat: sc.saat, etkilesimli: true, duvar: 'gorsel', sigdir: true, icerik, etiket: `${ios ? 'iPhone Denetim Merkezi' : 'Android Hızlı Ayarlar'}, ${sc.sen.ad}: Su ekle ${giris ? 'kullanılamaz' : `${sayi(s.icilen)} ml`}, Oruç ${oruc ? 'sürüyor' : 'başlamadı'}`});
    return `${cerceve}
      ${senaryoSecim(g, sc)}
      ${cihazSecim(g)}
      ${cip('telefon-durum', 'Kutucuk durumu', giris ? 'giris' : 'dolu', [{metin: 'Hazır', deger: 'dolu', ikon: 'circle-check'}, {metin: 'Kullanılamaz', deger: 'giris', ikon: 'ban'}], giris ? 'Oturum yokken kutucuklar kullanılamaz: soluk durur, dokunulmaz; alt satır “Giriş gerekli”.' : 'Su ekle dokununca kısa süre aktif olur ve 200 ml ekler; Oruç kutucuğu oruç sürerken aktiftir, dokununca orucu başlatır ya da bitirir.')}
      ${DD.p(ios ? '**Su ekle** ve **Oruç** denetimleri Denetim Merkezi’nde, kilit ekranının alt köşelerinde ya da Eylem düğmesinde çalışır (iOS 18 ve sonrası); uygulama açılmadan kaydeder.' : '**Su ekle** ve **Oruç** kutucukları Hızlı Ayarlar’da durur. Su ekle tek seferlik eylemdir (hazırken pasif); Oruç açılıp kapanan bir durumdur (oruçta aktif, amber). Oturum yokken ikisi de **kullanılamaz**.', {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', ios
        ? ['Sağ üst köşeden aşağı kaydırıp **Denetim Merkezi**’ni aç.', 'Boş bir yere basılı tut, **Denetim Ekle**’ye dokun.', 'Listeden **Dada Diet > Su ekle** ya da **Oruç**’u seç; boyutunu köşesinden çekerek büyütebilirsin.']
        : ['Ekranın üstünden **iki kez aşağı kaydır**.', 'Kalem simgesine (**Düzenle**) dokun.', '**Su ekle** ya da **Oruç** kutucuğunu basılı tutup üstteki kutucukların arasına **sürükle**.'])}`;
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
    const gs = sahne({...g, senaryo: 'simdi'});
    const arka = anaEkran2(g, [w2Ciz('ozet', gs, 'kucuk'), w2Ciz('su', gs, 'kucuk')], simgeSayisi(['kucuk', 'kucuk']), {ara: false});
    const cerceve = g.komutAsama
      ? DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), duvar: 'gorsel', sigdir: true, etiket: `${ios ? 'Siri' : 'Gemini'} komutu: ${soz}. Sonuç: ${sonuc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`, icerik: DD.komutEkran({platform: p, komut: soz, sonuc, arka, hal: yazildi ? 'sonuc' : 'dinliyor'})})
      : DD.telefonCerceve({platform: p, tema: g.tema, saat: sistemSaat(an), duvar: 'gorsel', sigdir: true, etiket: `${ios ? 'iPhone' : 'Android'} ana ekranı, ${ios ? 'Siri' : 'Gemini'}’ye söylemeye hazır`, icerik: arka});
    // Gemini: üçüncü taraf uygulama işlevlerini Android 16+ AppFunctions ile çağırır; her telefonda yok. Aynı kayıt uygulama kısayolunda da durur.
    const metin = ios
      ? `Siri’ye söyle, Dada Diet açılmadan **kaydı yapsın** ve sonucu göstersin. Komutta uygulamanın adı geçer: “${SOZ.su}”.`
      : `Gemini’ye söyle; telefonun Gemini’nin uygulama işlevlerini çağırmasını destekliyorsa Dada Diet **kaydı yapar** ve sonucu kartta gösterir. Komutta uygulamanın adı geçer: “${SOZ.su}”.`;
    const adim = ios
      ? ['Dada Diet yüklüyken komutlar **hazırdır**; kurulum gerekmez.', `**Siri**’yi çağır ve komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Tümünü **Kestirmeler** uygulamasında Dada Diet altında bulursun; dilersen birini ana ekrana ekle.']
      : ['**Gemini**’yi aç: güç düğmesine basılı tut ya da “Hey Google” de.', `Komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Bu özellik Android 16 ve sonrasında, Gemini’nin uygulama işlevlerini desteklediği telefonlarda çalışır. Desteklemiyorsa aynı kayıt, Dada Diet simgesine **basılı tutunca** açılan **Su ekle** kısayolundadır.'];
    return `${cerceve}
      ${cihazSecim(g)}
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
  // Üstte yalnız bölüm sekmeleri; telefon ve görünüm seçimi her bölümde telefonun altında (cihazSecim), böylece telefon ekrana daha büyük sığar.
  const ust = g => `<div class="dd-yigin-12">
    ${DD.sekmeler({ad: 'telefon-sekme', etiket: 'Bölüm', secili: g.sekme, ogeler: sekmeOgeler(g.platform)})}
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
        // Kilit ekranı senaryosu değişince o senaryoya ait anlık seçimler (izin, açık yığın, biten oruç kartı) sıfırlanır.
        g = duzelt({...g, [alan]: v, acik: null, komutAsama: null, ...(['senaryo', 'gor', 'sekme', 'platform'].includes(alan) ? SAHNE_SIFIR : {})}); ctx.sorgu = {};
        if (alan === 'senaryo') DD.durum.sil(SK);
        ciz(false, alan === 'platform');
        // 16 saatlik akışta seçili adım adreste kalsın (yenilemede aynı adım açılır); router'ı tetiklemez.
        if (g.sekme === 'canli' && g.etkinlik === 'akis') history.replaceState(null, '', `#/telefon?${new URLSearchParams({sekme: 'canli', etkinlik: 'akis', adim: g.adim, platform: g.platform, tema: g.tema})}`);
        // iPhone kilit ekranında seçili senaryo da adreste kalır (yenilemede aynı senaryo açılır).
        else if (g.sekme === 'kilit' && g.gor === 'kilit' && g.platform === 'ios') history.replaceState(null, '', `#/telefon?${new URLSearchParams({sekme: 'kilit', gor: 'kilit', platform: 'ios', tema: g.tema, senaryo: g.senaryo})}`);
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
      // iPhone kilit ekranı (senaryolar): öğün eklenince halka dolar, kalan kalori eski değerden akar, seri güncellenir; Bitir oruç kartını bitirir.
      let sonEylem = 0, izinZ = 0, sonSu = 0;
      // Hızlı ayar kutucuğu: eylem anında kısa süre aktif (STATE_ACTIVE), sonra hazır (STATE_INACTIVE) haline döner (senaryo ve gerçek kayıt).
      const kutucukParla = el => {
        if (!el.classList.contains('dd-ha-kut')) return;
        const k = yuva()?.querySelector(`.dd-ha-kut.is-bizim[data-wg-eylem="${el.dataset.wgEylem}"]`) || yuva()?.querySelector('.dd-ha-kut.is-bizim.is-su');
        if (k && k.classList.contains('is-pasif')) { k.classList.replace('is-pasif', 'is-aktif'); setTimeout(() => k.isConnected && k.classList.replace('is-aktif', 'is-pasif'), DD.azHareket() ? 600 : 1200); }
      };
      // Senaryo verisini çizen bölümler (kilit ekranı, ana ekran, Dinamik Ada, StandBy, Android, hızlı ayar): dokunuş animasyonu ve bitiş kartı.
      const kilitteMi = () => !g.acik && g.sekme !== 'komut' && !(g.sekme === 'canli' && g.etkinlik !== 'ada');
      const kalanAk = () => {
        yuva()?.querySelectorAll('[data-lo-eski]').forEach(el => {
          const a = +el.dataset.loEski, b = +el.dataset.loYeni;
          DD.tween(DD.azHareket() ? 0 : 700, t => { if (el.isConnected) el.textContent = sayi(Math.round(a + (b - a) * t)); });
        });
      };
      // İzin seçimi o senaryonun geçici durumuna yazılır (yenilemede durur, senaryo değişince silinir).
      const izinSec = v => {
        if (sahneKayit(g).izin) return;
        sahneYaz(g, d => ({...d, izin: v})); g = {...g, anim: {izin: v}}; DD.titres(8); ciz(true);
        if (v === 'red') DD.toast('Canlı Etkinlikler kapalı. **Ayarlar > Dada Diet**’ten açabilirsin.', {ikon: 'bilgi'});
        clearTimeout(izinZ);
        izinZ = setTimeout(() => { g = {...g, anim: null}; if (kok.isConnected && kilitteMi()) ciz(true); }, DD.azHareket() ? 0 : 420);
      };
      const eylem = el => {
        const ad = el.dataset.wgEylem, kilit = kilitteMi();
        // Senaryo dokunuşları kayda yazılmaz; o senaryonun geçici durumunda kalır (Geri al aynı durumu geri çevirir).
        // Su: aynı düğmeye 400 ms içinde ikinci dokunuş yok sayılır (çift dokunuş iki bardak yazmasın); ardışık bilinçli dokunuşlar ayrı bardaktır.
        if (ad === 'sahne-su' || ad === 'su-ekle') { if (Date.now() - sonSu < 400) return; sonSu = Date.now(); }
        if (['sahne-ogun', 'sahne-oruc-bitir', 'sahne-su', 'sahne-oruc-baslat'].includes(ad)) {
          if (ad.startsWith('sahne-oruc')) { if (Date.now() - sonOruc < 600) return; sonOruc = Date.now(); }
          sonEylem = Date.now();
          const once = sahne(g), id = el.dataset.id, sen0 = g.senaryo;
          if (ad === 'sahne-ogun') {
            if (once.l.find(x => x.id === id)?.durum !== 'bos') return;
            sahneYaz(g, d => { d.ogun[id] = 'dolu'; return d; });
            g = {...g, anim: {ogun: id, kalan: once.k.kalan, seri: once.seri.sayi}};
          } else if (ad === 'sahne-su') { sahneYaz(g, d => ({...d, su: (d.su || 0) + DD.SU_BARDAK})); g = {...g, anim: {su: true, kalan: once.k.kalan}}; }
          else if (ad === 'sahne-oruc-baslat') sahneYaz(g, d => ({...d, orucBasladi: Date.now(), orucBitti: null}));
          else { const dk = Math.round(once.rt.gecenSn / 60); sahneYaz(g, d => ({...d, orucBitti: {sure: dk ? sure(dk) : null, bas: once.rt.bas, ad: once.rt.p?.ad}})); }
          DD.titres(10); ciz(true); kalanAk(); g = {...g, anim: null};
          if (ad === 'sahne-su') kutucukParla(el);
          const x = once.l.find(o => o.id === id);
          const metin = ad === 'sahne-ogun' ? `**${x?.ad || 'Öğün'}** eklendi · ${sayi(x?.kcal || 0)} kcal` : ad === 'sahne-su' ? `Su eklendi: **${sayi(once.su.icilen + DD.SU_BARDAK)} / ${sayi(once.su.hedef)} ml**` : ad === 'sahne-oruc-baslat' ? `Orucun başladı · **${once.rt.p?.ad || ''}**` : Math.round(once.rt.gecenSn / 60) ? `Oruç bitti: **${sure(Math.round(once.rt.gecenSn / 60))}**` : 'Pencere yeniden açıldı';
          DD.toast(metin, {ikon: ad === 'sahne-ogun' ? 'onay' : ad === 'sahne-su' ? 'su' : 'oruc', eylem: 'Geri al', onEylem: () => {
            if (g.senaryo !== sen0) return;
            sahneYaz(g, d => { if (ad === 'sahne-ogun') delete d.ogun[id]; else if (ad === 'sahne-su') d.su = Math.max(0, (d.su || 0) - DD.SU_BARDAK); else if (ad === 'sahne-oruc-baslat') delete d.orucBasladi; else delete d.orucBitti; return d; });
            if (DD.aktif()?.ad === 'telefon') ciz(true);
          }});
          return;
        }
        const f = EYLEM[ad];
        if (!f) return;
        // Çift dokunuş başlat + bitir yapmasın: oruç düğmelerinde 600 ms tekrar koruması
        if (ad.startsWith('oruc')) { if (Date.now() - sonOruc < 600) return; sonOruc = Date.now(); }
        const once = kilit ? sahne(g) : null;
        const sonuc = f(el.dataset.id);
        sonEylem = Date.now();
        DD.titres(10);
        if (g.durum === 'bos') g = {...g, durum: 'dolu'};
        if (kilit && ad === 'ogun-yedim') g = {...g, anim: {ogun: el.dataset.id, kalan: once.k.kalan, seri: once.seri.sayi}};
        if (kilit && ad === 'su-ekle') g = {...g, anim: {su: true, kalan: once.k.kalan}};
        if (ad === 'oruc-baslat') DD.durum.sil(SO);
        // Şimdi görünümünde gerçek oruç bitti: bitiş kartı Bitir anındaki başlangıç ve süreyle (P2-2).
        if (kilit && ad === 'oruc-bitir') { const dk = Math.round(once.rt.gecenSn / 60); DD.durum.yaz(SO, {sure: dk ? sure(dk) : null, bas: once.rt.bas, ad: once.rt.p?.ad, an: suankiMs()}); }
        ciz(true);
        if (kilit) { kalanAk(); g = {...g, anim: null}; }
        kutucukParla(el);
        DD.toast(sonuc.metin, {ikon: ad === 'su-ekle' ? 'su' : ad.startsWith('oruc') ? 'oruc' : 'onay', eylem: 'Geri al', onEylem: () => { sonuc.geri(); if (ad === 'oruc-bitir') DD.durum.sil(SO); if (kilit) g = {...g, anim: null}; if (DD.aktif()?.ad === 'telefon') ciz(true); }});
      };
      const tik = ev => {
        const e = ev.target.closest('[data-wg-eylem]');
        if (e && kok.contains(e)) { if (e.getAttribute('aria-disabled') === 'true') return; ev.preventDefault(); eylem(e); return; }
        const iz = ev.target.closest('[data-wg-izin]');
        if (iz && kok.contains(iz)) { ev.preventDefault(); izinSec(iz.dataset.wgIzin); return; }
        // Dinamik Ada: kısa/minimal hale dokununca genişler, genişte boş yere dokununca küçülür (iOS'ta basılı tutma).
        const ad_ = ev.target.closest('[data-ada]');
        if (ad_ && kok.contains(ad_) && !ev.target.closest('[data-wg-eylem]')) { ev.preventDefault(); g = {...g, ada: ad_.dataset.ada === 'kompakt' ? 'kisa' : ad_.dataset.ada}; ciz(true); return; }
        const yg = ev.target.closest('[data-kb-yigin]');
        if (yg && kok.contains(yg)) { ev.preventDefault(); g = {...g, yigin: !g.yigin, anim: {yigin: true}}; ciz(true); g = {...g, anim: null}; return; }
        const a = ev.target.closest('[data-wg-ac]');
        // Kartın gövdesi: "+"dan hemen sonraki ikinci dokunuş uygulamayı açmasın (çift dokunuş koruması)
        if (a && a.classList.contains('dd-lac-ac') && Date.now() - sonEylem < 700) { ev.preventDefault(); return; }
        if (a && kok.contains(a) && a.dataset.wgAc) { ev.preventDefault(); g = {...g, acik: a.dataset.wgAc}; ciz(false); kok.querySelector('[data-yuva="telefon"]')?.scrollIntoView({block: 'start', behavior: DD.azHareket() ? 'auto' : 'smooth'}); }
      };
      kok.addEventListener('click', tik);
      const c = [
        bag('telefon-sekme', 'sekme'), bag('telefon-platform', 'platform'), bag('telefon-tema', 'tema'), bag('telefon-wg', 'wg'), bag('telefon-boy', 'boy'),
        bag('telefon-durum', 'durum'), bag('telefon-gor', 'gor'), bag('telefon-gece', 'gece'), bag('telefon-etkinlik', 'etkinlik'), bag('telefon-adim', 'adim'), bag('telefon-komut', 'komut'), bag('telefon-senaryo', 'senaryo'), bag('telefon-ada', 'ada'),
        DD.eylem(kok, 'komut-oynat', oynat),
        DD.eylem(kok, 'tel-kapat', () => { g = {...g, acik: null}; ciz(false); }),
        DD.telefonOlcek(kok), DD.telefonSigdir(kok)
      ];
      // Kaydırmalı bölüm şeridinde seçili bölüm görünür kalsın
      const secili = kok.querySelector('[data-yuva="telefon-ust"] .dd-seg.is-kaydir [aria-selected="true"]');
      if (secili) { const s = secili.parentElement; s.scrollLeft = secili.offsetLeft - (s.clientWidth - secili.offsetWidth) / 2; }
      sinirKur();
      return () => { dur(); clearTimeout(sinirZ); clearTimeout(izinZ); kok.removeEventListener('click', tik); c.forEach(f => f()); };
    }
  });
})();
