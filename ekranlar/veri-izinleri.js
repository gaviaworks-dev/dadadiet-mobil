/* Veri izinlerim (#/veri-izinleri): web hesabim/veri-izinlerim + uye-veri-izinlerim.js eşi. Açık rıza (K10, metin taslak), diyetisyenle paylaşım (veri türü bazında), bekleyen izin istekleri, izin ve erişim geçmişi, haklar.
 * Durum: veri-izinleri {riza, esitle} (profil ve kanon rizaSheet ile ortak; esitle korunur), saglik-paylasim {olcum, tahlil, analiz, tabaklar, gunluk, test} (ekranlar/saglik.js ile aynı anahtar; Beyar kararı 1: hepsi varsayılan kapalı, üye tek tek açar),
 *   hesap-ayar.izin {hareket:[{tarih, metin, ikon}] yeniden eskiye, cevap:{tur:'onay'|'red'}, sure:{tur:metin}}. Seed: DDV.hesap.izinIstekleri, izinGecmisi, paylasimTurleri.
 * Diyetisyeni olmayan (yeni hesap) üyede paylaşım yerine boş hal. ?gecmis=erisim erişim kaydına iner, ?hal=hata bağlantı hatası.
 * Cihaz verisi (E5): cihaz-izin {riza, rizaTarih, rizaKaynak, paylas, turler:{adim, kilo, uyku}, silindi, silKesik (silme bağlantı kesilerek mi yapıldı), aktarim} (varsayılan DDV.hesap.cihazIzin; rıza ve paylaşım kapalı).
 *   Kapsam genel rızaya bağlı: etkin rıza = veri-izinleri.riza && cihaz-izin.riza. veri-izinleri'nde riza alanı yoksa (yalnız esitle yazılmışsa) onboarding kvkk varsayılanı geçerli.
 *   Diyetisyen cihaz verisini yalnız etkin rıza + paylas + tür açıkken görür. Cihaz kaydı yalnız rıza en az bir kez verilmiş ve silinmemişse vardır.
 *   Bağlantı E1'in cihaz-baglanti {apple-health|health-connect:{bagli, sonEsitleme}} anahtarından okunur (E1 kaydı hiç yoksa eski veri-izinleri.esitle).
 *   window.DDCihazIzin (E1, E2, saglik.js ortak sözleşmesi):
 *     rizaAl({kaynak}) → Promise<boolean>: etkin rıza varsa sheet açmadan true; yoksa rıza sheet'i (kapsam DDV.cihazlar'dan; genel rıza yoksa onu da ayrı onay kutusuyla ister). Onayda cihaz-izin.riza (+ gerekirse veri-izinleri.riza) ve hareket kaydı yazılır.
 *     cihazVerisiSil(servisId): bağlantı kesilip veri silinince silindi = bugün, silKesik = true, aktarim = null, hareket kaydı. → durum(). Argümansız (Veri izinlerim'den, bağlantı sürerken) silKesik = false.
 *     baglandi(servisId): bağlantı (yeniden) kurulunca çağrılır; kes-sil sonrası silme kalkar, sağlık uygulamasındaki geçmiş yeniden okunur (cihazdaki veri silinmemişti). → durum()
 *       Çağrılmasa da kes-sil sonrası bağlantı yeniden kurulduysa veri görünür (silKesik + bağlı).
 *     Rıza geri alınınca (genel ya da cihaz) cihaz paylaşımı ve türleri sıfırlanır; rıza yeniden verilince paylaşım kapalı kalır (Beyar kararı 1).
 *     durum(): {genelRiza, cihazRiza, riza (etkin), rizaTarih, rizaKaynak, paylas, turler, paylasilan:[id], baglanti:{id, ad, son, duraklatildi (bağlı ama etkin rıza yok: eşitleme durur)}|null, veriGun, silindi, aktarim}
 *     okuyucular: oku, baglanti, rizaEtkin, gunler, ozet, paylasilan, turler.
 *   ?paylas=<tür>|sec "Paylaşacaklarını seç" sheet'i açık gelir (tür önceden işaretli; window.DDPaylasim.ac(id) bu adresi verir).
 *   ?riza=cihaz rıza sheet'i açık gelir (rıza varsa cihaz bölümüne iner), ?onizleme=1 "Diyetisyenim bunu görür" açık gelir, ?cihaz=1 paylaşım bölümüne (rıza yoksa rıza bölümüne) iner. */
(() => {
  const H = () => DDV.hesap;
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const izinAyar = () => ({...H().varsayilan.izin, ...(tum().izin || {})});
  const izinYaz = ek => DD.durum.yaz('hesap-ayar', {...tum(), izin: {...izinAyar(), ...ek}});
  // riza alanı yazılmamışsa (ör. yalnız esitle yazan eski kayıt) onboarding kvkk kararı geçerlidir; başka anahtar yazımı rızayı silmiş gibi görünmez.
  const izinler = () => { const d = DD.durum.oku('veri-izinleri', {}) || {}; return {...d, riza: typeof d.riza === 'boolean' ? d.riza : DD.durum.oku('onboarding')?.kvkk !== 'sonra'}; };
  const TUR = () => H().paylasimTurleri;
  const paylasim = () => ({...Object.fromEntries(TUR().map(t => [t.id, t.varsayilan])), ...DD.durum.oku('saglik-paylasim', {})});
  const uzman = () => (DD.yeniHesap() ? null : DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen));
  const hareketler = () => [...izinAyar().hareket, ...(DD.yeniHesap() ? [] : H().izinGecmisi)];
  const istekler = () => (uzman() ? H().izinIstekleri.filter(i => !izinAyar().cevap[i.tur] && !paylasim()[i.tur]) : []);
  const R = () => DDV.onboarding.adimlar.find(a => a.id === 'kvkk').acikRiza;
  const kaydet = (metin, ikon) => izinYaz({hareket: [{tarih: DD.bugunIso(), metin, ikon}, ...izinAyar().hareket]});
  const turDegis = (id, v, sure) => {
    const t = TUR().find(x => x.id === id), s = {...izinAyar().sure};
    if (v && sure) s[id] = sure; else if (!v) delete s[id];
    DD.durum.yaz('saglik-paylasim', {...paylasim(), [id]: v});
    izinYaz({sure: s});
    kaydet(`${t.etiket} ${v ? 'paylaşıma açıldı' : 'paylaşımı kapatıldı'}`, t.ikon);
  };
  // ---------- Cihaz verisi: durum ve özet ----------
  const CT = () => H().cihazTurleri;
  const ciOku = () => { const d = DD.durum.oku('cihaz-izin', {}); return {...H().cihazIzin, ...d, turler: {...H().cihazIzin.turler, ...(d.turler || {})}}; };
  const ciYaz = ek => DD.durum.yaz('cihaz-izin', {...ciOku(), ...ek});
  const SERVIS = {'apple-health': 'Apple Health', 'health-connect': 'Health Connect'};
  const servisAd = id => DDV.cihazlar?.servisler?.find(x => x.id === id)?.ad || SERVIS[id] || 'Sağlık uygulaman';
  const metinMi = v => (typeof v === 'string' && v ? v : null);
  // E1 son eşitlemeyi sonEsitleme alanına yazar; değer yoksa ilk eşitleme bekleniyor sayılır (seed saate düşülmez).
  const baglanti = () => {
    const b = DD.durum.oku('cihaz-baglanti', {}) || {}, id = Object.keys(SERVIS).find(k => b[k]?.bagli);
    if (id) return {id, ad: servisAd(id), son: metinMi(b[id].sonEsitleme) || metinMi(b[id].son)};
    if (Object.keys(SERVIS).some(k => b[k])) return null;
    if (!izinler().esitle) return null;
    return {id: null, ad: 'Apple Health / Health Connect', son: DD.yeniHesap() ? null : metinMi(DD.durum.oku('hesap-ayar', {})?.bagli?.sonEsitleme?.saglik) || H().varsayilan.bagli.sonEsitleme.saglik};
  };
  const kucukBas = v => (v ? v.charAt(0).toLocaleLowerCase('tr') + v.slice(1) : v);
  const rizaEtkin = () => !!izinler().riza && !!ciOku().riza;
  const cihazGunler = () => { const c = ciOku(); return DD.yeniHesap() || !c.rizaTarih ? [] : H().cihazVerisi.gunler.filter(g => !c.silindi || g.tarih > c.silindi); };
  const paylasilan = () => { const c = ciOku(); return rizaEtkin() && uzman() && c.paylas ? CT().filter(t => c.turler[t.id]) : []; };
  const ort = l => (l.length ? l.reduce((t, x) => t + x, 0) / l.length : 0);
  // Son gün bugündür, adımı sürer: ortalama tamamlanan günlerden.
  const ozet = () => {
    const g = cihazGunler(); if (!g.length) return null;
    const son = g[g.length - 1], tam = g.length > 1 ? g.slice(0, -1) : g, k = g.filter(x => x.kiloKg != null), nokta = (x, alan) => ({tarih: x.tarih, etiket: DD.tarihKisa(x.tarih), deger: x[alan]});
    return {
      gun: g.length,
      adim: {bugun: son.adim, ort: Math.round(ort(tam.map(x => x.adim))), seri: g.map(x => nokta(x, 'adim'))},
      kilo: k.length ? {son: k[k.length - 1].kiloKg, fark: Math.round((k[k.length - 1].kiloKg - k[0].kiloKg) * 10) / 10, n: k.length, seri: k.map(x => nokta(x, 'kiloKg'))} : null,
      uyku: {son: son.uykuDk, ort: Math.round(ort(g.map(x => x.uykuDk))), seri: g.map(x => nokta(x, 'uykuDk'))}
    };
  };
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');
  const kiloFark = f => (Math.abs(f) < .05 ? 'değişmedi' : `${DD.ondalik(Math.abs(f), 1)} kg ${f < 0 ? 'azaldı' : 'arttı'}`);
  const saat = dk => `${DD.ondalik(dk / 60, 1)} sa`;
  const sonMetin = b => (b.son ? `son eşitleme ${kucukBas(nk(b.son))}` : 'ilk eşitleme bekleniyor');
  const durum = () => {
    const c = ciOku();
    return {genelRiza: !!izinler().riza, cihazRiza: !!c.riza, riza: rizaEtkin(), rizaTarih: c.rizaTarih || null, rizaKaynak: c.rizaKaynak || null, paylas: !!c.paylas, turler: {...c.turler}, paylasilan: paylasilan().map(t => t.id), baglanti: baglanti() ? {...baglanti(), duraklatildi: !rizaEtkin()} : null, veriGun: cihazGunler().length, silindi: silinmis(c) ? c.silindi : null, aktarim: c.aktarim || null};
  };
  const cihazVerisiSil = servisId => {
    ciYaz({silindi: DD.bugunIso(), aktarim: null});
    kaydet(servisId ? `${servisAd(servisId)} verisi silindi` : 'Cihaz verisi silindi', 'trash');
    return durum();
  };
  // Rıza kapsamı E1'in tür listesinden: okunanlar grup grup, yazılanlar tek satır.
  const tumKucuk = l => l.map((x, i) => (i ? x.toLocaleLowerCase('tr') : x)).join(', ');
  const kapsamHtml = () => {
    const C = DDV.cihazlar, T = C?.turler || [], etiket = m => `<p class="dd-t-label dd-ton-ikincil">${m}</p>`;
    const oku = (C?.gruplar || []).map(g => { const l = T.filter(t => t.grup === g.id && t.yon === 'oku'); return l.length ? {ikon: l[0].ikon, baslik: g.ad, alt: l.length === 1 && l[0].ad === g.ad ? l[0].alt : tumKucuk(l.map(t => t.ad))} : null; }).filter(Boolean);
    const yaz = T.filter(t => t.yon === 'yaz');
    return `<div class="dd-yigin-8">${etiket('Okunanlar')}${DD.satirlar(oku)}</div>${yaz.length ? `<div class="dd-yigin-8">${etiket('Sağlık uygulamana yazılanlar')}${DD.satirlar([{ikon: 'pen-to-square', baslik: 'Dada Diet kayıtların', alt: tumKucuk(yaz.map(t => t.ad))}])}</div>` : ''}`;
  };
  let acikSoz = null;
  const rizaAl = ({kaynak = 'veri-izinleri'} = {}) => {
    if (rizaEtkin()) return Promise.resolve(true);
    if (!acikSoz) acikSoz = new Promise(bitir => cihazRizaSheet(kaynak, bitir)).finally(() => { acikSoz = null; });
    return acikSoz;
  };
  // Genel paylaşım okuyucusu (kayit, uzman, uzman-sohbet, saglik ortak): tür yalnız açıkça açıldıysa açıktır; ac(id) seçim sayfasının adresi.
  window.DDPaylasim = {acik: id => paylasim()[id] === true, durum: () => ({...paylasim()}), ac: id => `#/veri-izinleri?paylas=${id || 'sec'}`};
  window.DDCihazIzin = {rizaAl, cihazVerisiSil, baglandi, durum, oku: ciOku, baglanti, rizaEtkin, gunler: cihazGunler, ozet, paylasilan, turler: CT};

  // Cihaz paylaşımı anahtarı yalnız tür listesini açar; hiçbir tür kendiliğinden açılmaz (Beyar kararı 1).
  const paylasAc = () => ciYaz({paylas: true});
  const cihazPaylasKapat = () => { if (ciOku().paylas) { ciYaz({paylas: false, turler: Object.fromEntries(CT().map(t => [t.id, false]))}); kaydet('Cihaz verisi paylaşımı kapatıldı', 'mobile-screen'); } };
  const gunEkle = n => { const d = DD.simdi(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  // ---------- Bölümler ----------
  const rizaBolum = () => {
    const i = izinler(), r = R(), ilk = hareketler().find(h => /rıza/.test(h.metin));
    return `<div class="dd-yigin">${DD.p('Sağlık verilerin **özel nitelikli kişisel veridir**; Dada Diet bunları yalnız açık rızanla işler. Diyetisyenle paylaşım ayrı bir izindir.', {ton: 'ikincil'})}${DD.satirlar([DD.toggle({ad: 'riza', ikon: 'shield-halved', etiket: 'Sağlık verisi açık rızası', alt: i.riza ? (ilk ? `Verildi · ${DD.tarihUzun(ilk.tarih)}` : 'Verildi') : 'Verilmedi · veriler yalnız bu cihazda', secili: !!i.riza})])}${DD.maddeler([['weight-scale', 'Boy, kilo ve ölçümlerin', 'Kalori ve öğün planı için'], ['heart-pulse', 'Hassasiyet ve kronik durumun', 'Önerileri süzmek için'], ['camera', 'Su, duygu, öğün ve tabak fotoğrafların', 'Günlüğün ve Sağlık dosyan için'], ['mobile-screen', 'Sağlık uygulamalarından gelen veri', 'Bu rızaya bağlı ayrı kapsam; aşağıda ayrıca onaylarsın']])}${DD.akordiyon([{baslik: 'Rıza metni', ikon: 'file-lines', icerik: `<div class="dd-yigin-12">${DD.p(r.metin.replace('açık rıza veriyorum', '**açık rıza veriyorum**'))}${DD.p(r.detay.replace('dilediğin an geri alabilirsin', '**dilediğin an geri alabilirsin**'), {ton: 'ikincil', meta: true})}</div>`}], {acik: -1})}</div>`;
  };
  // Sağlık uygulamalarından gelen veri: genel rızaya bağlı ayrı kapsam.
  const cihazRizaBolum = () => {
    const c = ciOku(), genel = !!izinler().riza, b = baglanti(), r = H().cihazRiza;
    const alt = genel && c.riza ? (c.rizaTarih ? `Verildi · ${DD.tarihUzun(c.rizaTarih)}` : 'Verildi') : !genel ? 'Verilmedi · genel rızanla birlikte istenir' : 'Verilmedi · cihaz verisi okunmaz';
    return `<div class="dd-yigin" id="cihaz-izin">${DD.p('Apple Health ya da Health Connect’ten okunan veri de **sağlık verisidir**. Okunması için bu kapsama ayrıca rıza verirsin; genel açık rızanı geri alırsan bu kapsam da durur.', {ton: 'ikincil'})}${DD.satirlar([
      DD.toggle({ad: 'cihaz-riza', ikon: 'heart-pulse', etiket: 'Sağlık uygulamalarından gelen veri', alt, secili: genel && c.riza}),
      {ikon: 'link', baslik: b ? b.ad : 'Bağlı sağlık uygulaman yok', alt: b ? `Bağlı · ${sonMetin(b)}` : 'Apple Health ya da Health Connect’i bağla', git: b?.id ? `#/cihaz/${b.id}` : '#/cihazlar'}
    ])}${DD.gizlilikBant(r.ozet)}${DD.akordiyon([{baslik: 'Sağlık uygulaması rıza metni', ikon: 'file-lines', icerik: rizaMetni()}], {acik: -1})}${DD.satirlar([{ikon: 'file-shield', baslik: 'Sağlık Verisi Politikası', alt: 'Amaçlar, paylaşım ve hakların', git: '#/yasal/saglik-verisi'}])}</div>`;
  };
  const rizaMetni = () => { const r = H().cihazRiza; return `<div class="dd-yigin-12">${DD.p(r.metin.replace('açık rıza veriyorum', '**açık rıza veriyorum**'))}${kapsamHtml()}${DD.p(r.detay.replace('dilediğin an geri alabilirsin', '**dilediğin an geri alabilirsin**'), {ton: 'ikincil', meta: true})}</div>`; };
  // Cihaz verisini diyetisyenle paylaşma: ölçüm paylaşımından ayrı anahtar.
  const cihazPaylasimBolum = () => {
    const u = uzman(), c = ciOku(), r = rizaEtkin(), acik = r && c.paylas, n = CT().filter(t => c.turler[t.id]).length;
    const alt = !r ? 'Önce sağlık uygulaması rızası gerekir' : acik ? (n ? `${n} veri türü açık` : 'Paylaşmak istediğin türü aç') : 'Kapalı · diyetisyenin görmez';
    return `<div class="dd-yigin-12" id="cihaz-paylas">${DD.p(`Cihaz verin ölçümlerinden **ayrı bir izindir**; kapalıyken ${u.kisaAd || u.ad} bu veriyi görmez.`, {ton: 'ikincil'})}${DD.satirlar([
      DD.toggle({ad: 'cihaz-paylas', ikon: 'mobile-screen', etiket: 'Cihaz verimi paylaş', alt, secili: acik, pasif: !r}),
      ...(acik ? CT().map(t => DD.toggle({ad: `cihaz-tur-${t.id}`, ikon: t.ikon, etiket: t.etiket, alt: t.alt, secili: !!c.turler[t.id]})) : [])
    ])}${r ? '' : DD.veriYok('Önce **sağlık uygulaması rızanı** ver; sonra neyi paylaşacağını tek tek seçersin.')}</div>`;
  };
  const istekBolum = () => {
    const u = uzman(), l = istekler();
    return `<div class="dd-yigin-12">${DD.p('Karar senin; onaylamazsan diyetisyenin **bu veriyi göremez**.', {ton: 'ikincil'})}<div class="dd-yigin-24">${l.map(i => { const t = TUR().find(x => x.id === i.tur); return `<article class="dd-yigin-12">${DD.satir({avatar: {harf: u.harf, boyut: 40}, baslik: t.etiket, alt: `${u.kisaAd || u.ad} · ${DD.tarihUzun(i.tarih)}`})}${DD.p(`${i.not} Onaylarsan **${t.alt.toLocaleLowerCase('tr')}** paylaşılır.`, {meta: true})}<div class="dd-ikili">${DD.btn({metin: 'Reddet', tur: 'secondary', veri: {eylem: 'istek-red', id: i.tur}})}${DD.btn({metin: 'Onayla', ikon: 'onay', veri: {eylem: 'istek-onay', id: i.tur}})}</div></article>`; }).join('')}</div></div>`;
  };
  const paylasimBolum = () => {
    const u = uzman();
    if (!u) return DD.bos({ikon: 'user-doctor', baslik: 'Henüz diyetisyenin yok', metin: 'Bir diyetisyenle çalışmaya başladığında **neyi paylaşacağını** buradan seçersin.', eylem: {metin: 'Diyetisyen bul', ikon: 'magnifying-glass', git: '#/uzman/bul'}});
    const p = paylasim(), s = izinAyar().sure, acik = TUR().filter(t => p[t.id]).length;
    return `<div class="dd-yigin-12" id="paylasim">${DD.p(`Hiçbir veri türü kendiliğinden açılmaz; **${u.ad}** yalnız senin açtığın türleri görür. Değişiklik anında kaydedilir ve diyetisyen paneline yansır.`, {ton: 'ikincil'})}${DD.eylemKart({ikon: 'eye', baslik: 'Diyetisyenim bunu görür', alt: acik || paylasilan().length ? 'Danışan özetindeki görünümün' : 'Şu an hiçbir verini görmüyor', veri: {eylem: 'onizleme'}})}${DD.satirlar([DD.toggle({ad: 'paylas-genel', ikon: 'user-doctor', etiket: 'Diyetisyenimle paylaş', alt: acik ? `${acik} veri türü açık` : 'Hiçbir veri paylaşılmıyor', secili: acik > 0}), ...TUR().map(t => DD.toggle({ad: `paylas-${t.id}`, ikon: t.ikon, etiket: t.etiket, alt: p[t.id] && s[t.id] ? `Açık · ${s[t.id]}` : t.alt, secili: p[t.id]}))])}${acik < TUR().length ? DD.btn({metin: 'Süreli izin ver', ikon: 'calendar-plus', tur: 'secondary', tam: true, veri: {eylem: 'yeni-izin'}}) : ''}${acik ? DD.btn({metin: 'Bütün izinleri geri çek', ikon: 'ban', tur: 'text', tam: true, veri: {eylem: 'hepsini-cek'}}) : ''}</div>`;
  };
  const gecmisBolum = ctx => {
    const sec = ctx.gecmis ||= ctx.sorgu.gecmis === 'erisim' ? 'erisim' : 'hareket', u = uzman();
    const l = sec === 'hareket'
      ? hareketler().map(h => ({ikon: h.ikon || 'shield-halved', baslik: h.metin, alt: DD.tarihUzun(h.tarih)}))
      : u ? DDV.saglik.diyetisyenNotlari.map(n => ({avatar: {harf: u.harf, boyut: 40}, baslik: u.kisaAd || u.ad, alt: `${n.tarihMetin} · ölçüm ve tahlil kayıtların · görüntüleme`})) : [];
    return `<div class="dd-yigin-12">${DD.segment({ad: 'gecmis', etiket: 'Geçmiş', secili: sec, ogeler: [{ad: 'İzin hareketlerin', deger: 'hareket'}, {ad: 'Erişim kaydı', deger: 'erisim'}]})}${l.length ? DD.satirlar(l) : DD.veriYok(sec === 'hareket' ? 'Henüz **izin hareketin** yok.' : 'Henüz **erişim kaydı** yok.')}</div>`;
  };
  const cihazHakSatirlar = () => {
  // Erişim kaydı yalnız açık türler için olabilir; hiçbir şey paylaşılmıyorsa kayıt yoktur.
  const erisimKonu = () => { const p = paylasim(), l = [p.olcum && 'ölçüm', p.tahlil && 'tahlil'].filter(Boolean); return l.length ? `${l.join(' ve ')} kayıtların` : ''; };
    const c = ciOku(), g = cihazGunler();
    if (!g.length) return c.silindi ? [{ikon: 'mobile-screen', baslik: 'Cihaz verin', alt: `${DD.tarihUzun(c.silindi)} tarihinde silindi`, duz: true}] : [];
    return [
      {ikon: 'file-export', baslik: 'Cihaz verimi dışa aktar', alt: c.aktarim ? `Son dosya ${c.aktarim.zaman} · ${c.aktarim.bicim.toLocaleUpperCase('tr')}` : 'Adım, kilo ve uyku kayıtların tek dosyada', veri: {eylem: 'cihaz-aktar'}},
      {ikon: 'trash', baslik: 'Cihaz verimi sil', alt: `${g.length} günlük kayıt · elle girdiklerin kalır`, veri: {eylem: 'cihaz-sil'}, yikici: true}
    ];
  };
  const haklarBolum = () => `<div class="dd-yigin-12">${DD.satirlar([
    {ikon: 'download', baslik: 'Verilerimi indir', alt: 'Erişim kaydın dahil tek arşivde', git: '#/ayarlar/veri'},
    {ikon: 'trash', baslik: 'Verilerimin silinmesini iste', alt: 'Kimliğin doğrulandıktan sonra işlenir', git: '#/ayarlar/sil'},
    ...cihazHakSatirlar(),
    {ikon: 'heart-pulse', baslik: 'Bağlı uygulamalar ve cihazlar', alt: 'Apple Health, Health Connect, Dada Gastro ve Dada Fit', git: '#/cihazlar'}
  ])}${DD.gizlilikBant(DDV.saglik.bilgiNotu.replace('yalnız sen ve izin verdiğin diyetisyen', '**yalnız sen ve izin verdiğin diyetisyen**'))}</div>`;

  const govde = ctx => DD.gruplar([
    {baslik: 'Açık rıza', html: rizaBolum()},
    {baslik: 'Sağlık uygulamaları', html: cihazRizaBolum()},
    istekler().length && {baslik: 'Bekleyen istekler', html: istekBolum()},
    {baslik: 'Diyetisyenle paylaşım', html: paylasimBolum()},
    uzman() && {baslik: 'Cihaz verisi paylaşımı', html: cihazPaylasimBolum()},
    {baslik: 'Geçmiş', html: `<div id="gecmis">${gecmisBolum(ctx)}</div>`},
    {baslik: 'Hakların', html: haklarBolum()}
  ]);

  // ---------- Sheet ----------
  const yeniIzinSheet = () => {
    const kapali = TUR().filter(t => !paylasim()[t.id]);
    let sure = 'surekli';
    DD.sheet({
      baslik, kapaninca: () => { if (DD.aktif()?.ad === 'veri-izinleri') DD.tazele(); },
      html: `<div class="dd-yigin">${DD.p(`**${uzman().ad}** seçtiğin verileri seçtiğin süre boyunca görür; istediğin an geri çekebilirsin.`, {ton: 'ikincil'})}${DD.alan({etiket: 'Paylaşılacak veriler', html: kapali.map(t => DD.checkbox({ad: `yeni-${t.id}`, etiket: t.etiket, alt: t.alt, secili: t.id === sec})).join('')})}${DD.alan({etiket: 'İzin süresi', html: DD.cipler({ad: 'izin-sure', tur: 'tek', serit: false, secili: sure, ogeler: H().izinSureleri.map(([deger, metin]) => ({deger, metin}))})})}<div data-yuva="hata"></div></div>`,
      altBar: DD.btn({metin: 'İzni ver', ikon: 'onay', tam: true, veri: {eylem: 'izin-ver'}}),
      sonra: d => {
        const c = [
          DD.on(d, 'izin-sure', v => { sure = v; }),
          DD.eylem(d, 'izin-ver', () => {
            const l = kapali.filter(t => d.querySelector(`[name="yeni-${t.id}"]`)?.checked);
            if (!l.length) { d.querySelector('[data-yuva="hata"]').innerHTML = DD.veriYok('En az **bir veri türü** seç.'); return; }
            const [, ad, gun] = H().izinSureleri.find(x => x[0] === sure), metin = gun ? `${DD.tarihUzun(gunEkle(gun))} tarihine kadar` : 'geri çekene kadar';
            l.forEach(t => turDegis(t.id, true, metin));
            d.kapat(); DD.tazele();
            DD.toast(l.length === 1 ? `**${l[0].etiket}** için ${ad.toLocaleLowerCase('tr')} izin verildi` : `**${l.length} veri türü** için izin verildi`, {tur: 'basari'});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  // Açık rıza: anahtar tek başına rıza sayılmaz, metin okunup onaylanır. Genel rıza yoksa ayrı onay kutusuyla birlikte istenir.
  const cihazRizaSheet = (kaynak = 'veri-izinleri', bitir = () => {}) => {
    const r = H().cihazRiza, genelYok = !izinler().riza;
    let verildi = false;
    DD.sheet({
      baslik: 'Sağlık uygulaması verisi', tam: true,
      html: `<div class="dd-yigin">${genelYok ? `<div class="dd-yigin-12">${DD.bant({ton: 'uyari', metin: r.genel.replace('genel açık rızaya', '**genel açık rızaya**')})}${DD.checkbox({ad: 'genel-onay', etiket: 'Sağlık verilerimin işlenmesine açık rıza veriyorum', alt: R().metin})}</div>` : ''}${rizaMetni()}${(r.taahhut?.length ? DD.maddeler(r.taahhut) : '')}${DD.btn({metin: 'Sağlık Verisi Politikası', ikon: 'file-shield', tur: 'text', tam: true, git: '#/yasal/saglik-verisi'})}</div>`,
      altBar: `<div class="dd-yigin-8">${DD.btn({metin: 'Açık rıza veriyorum', ikon: 'onay', tam: true, pasif: genelYok, veri: {eylem: 'cihaz-riza-ver'}})}${DD.btn({metin: 'Şimdi değil', tur: 'secondary', tam: true, attrs: 'data-sheet-kapat'})}</div>`,
      sonra: d => {
        const dug = d.querySelector('[data-eylem="cihaz-riza-ver"]');
        const c = [
          DD.on(d, 'genel-onay', v => { dug.disabled = !v; }),
          DD.eylem(d, 'cihaz-riza-ver', () => {
            if (genelYok) {
              if (!d.querySelector('[name="genel-onay"]')?.checked) return;
              DD.durum.yaz('veri-izinleri', {...izinler(), riza: true});
              kaydet('Sağlık verisi açık rızası verildi', 'shield-halved');
            }
            ciYaz({riza: true, rizaTarih: DD.bugunIso(), rizaKaynak: kaynak});
            kaydet('Sağlık uygulaması verisi için açık rıza verildi', 'heart-pulse');
            verildi = true;
            d.kapat();
            DD.toast('**Açık rızan** kaydedildi', {tur: 'basari'});
          })
        ];
        return () => c.forEach(f => f());
      },
      kapaninca: () => { bitir(verildi); if (DD.aktif()?.ad === 'veri-izinleri') DD.tazele(); }
    });
  };
  const rozetCihaz = () => DD.rozet({metin: 'Cihazdan', ikon: 'mobile-screen'});
  const rozetElle = () => DD.rozet({metin: 'Elle', ikon: 'pen', ton: 'notr'});
  // Diyetisyen panelindeki danışan özetinin mobil eşi: cihaz değerleri rozetli, elle girilenler ayrı grupta.
  const onizlemeSheet = () => {
    const u = uzman(), l = paylasilan(), k = DDV.kullanici, o = ozet(), p = paylasim();
    const genelAcik = TUR().filter(t => p[t.id]);
    if (!u || (!l.length && !genelAcik.length)) {
      const ad = u ? (u.kisaAd || u.ad) : 'Diyetisyenin';
      DD.sheet({baslik: 'Diyetisyenim bunu görür', html: DD.bos({ikon: 'eye-slash', baslik: 'Henüz hiçbir veriyi paylaşmıyorsun', metin: u ? `**${ad}** şu an sağlık verilerinden hiçbirini görmüyor. Neyi paylaşacağını tek tek seçersin; seçmediğin tür kapalı kalır.` : 'Bir diyetisyenle çalışmaya başladığında **neyi paylaşacağını** tek tek seçersin.', eylem: u ? {metin: 'Paylaşacaklarını seç', ikon: 'user-doctor', veri: {eylem: 'oniz-sec'}} : {metin: 'Diyetisyen bul', ikon: 'magnifying-glass', git: '#/uzman/bul'}}), sonra: d => DD.eylem(d, 'oniz-sec', () => { d.kapat(); yeniIzinSheet('Paylaşacaklarını seç'); })});
      return;
    }
    const satirlar = {
      adim: () => ({ikon: 'shoe-prints', baslik: 'Adım', alt: `Günlük ort. · bugün ${DD.sayi(o.adim.bugun)}`, deger: DD.sayi(o.adim.ort)}),
      kilo: () => (o.kilo ? {ikon: 'weight-scale', baslik: 'Kilo trendi', alt: `${o.kilo.n} tartım · ${o.gun} günde ${kiloFark(o.kilo.fark)}`, deger: `${DD.ondalik(o.kilo.son, 1)} kg`} : null),
      uyku: () => ({ikon: 'bed', baslik: 'Uyku', alt: `Gece ort. · dün gece ${saat(o.uyku.son)}`, deger: saat(o.uyku.ort)})
    };
    const cihaz = o ? l.map(t => satirlar[t.id]()).filter(Boolean) : [];
    const S = DDV.saglik, manuel = DD.durum.oku('saglik-olcumler', []).filter(x => x.kiloKg != null).sort((a, b) => a.tarih.localeCompare(b.tarih)).pop();
    const son = ad => S.seriler[ad].haftalik[S.seriler[ad].haftalik.length - 1];
    const elle = [
      manuel && {ikon: 'kilo', baslik: 'Kilo ölçümü', alt: DD.tarihUzun(manuel.tarih), deger: `${DD.ondalik(manuel.kiloKg, 1)} kg`},
      {ikon: 'bel', baslik: 'Bel', alt: DD.tarihUzun(son('bel').tarih), deger: `${DD.ondalik(son('bel').deger, 1)} cm`},
      {ikon: 'yagOrani', baslik: 'Yağ oranı', alt: DD.tarihUzun(son('yag').tarih), deger: `%${DD.ondalik(son('yag').deger, 1)}`}
    ].filter(Boolean);
    const gizli = CT().filter(t => !l.includes(t));
    const etiket = (m, rozet = '') => `<div class="dd-ara"><p class="dd-t-label dd-ton-ikincil">${m}</p>${rozet}</div>`;
    DD.sheet({
      baslik: 'Diyetisyenim bunu görür', tam: true,
      html: `<div class="dd-yigin">${DD.p(`**${u.ad}** danışan özetinde seni böyle görür. Sağlık uygulamandan gelenler **Cihazdan**, elle girdiklerin **Elle** etiketiyle ayrı gösterilir.`, {ton: 'ikincil'})}${DD.kart({html: `<div class="dd-yigin-12">${DD.satir({avatar: {harf: k.basHarf || k.ad[0], boyut: 40}, baslik: `${k.ad} ${k.soyad}`, alt: `Danışan özeti · son ${o ? o.gun : 7} gün`})}${l.length ? `<div class="dd-yigin-8">${etiket(baglanti()?.ad || 'Sağlık uygulaması', rozetCihaz())}${cihaz.length ? DD.satirlar(cihaz) : DD.veriYok('Paylaşılacak **cihaz kaydın** yok.')}</div>` : ''}${p.olcum ? `<div class="dd-yigin-8">${etiket('Elle girdiklerin', rozetElle())}${DD.satirlar(elle)}</div>` : ''}${diger.length ? `<div class="dd-yigin-8">${etiket('Ayrıca gördükleri')}${DD.satirlar(diger.map(t => ({ikon: t.ikon, baslik: t.etiket, alt: t.alt})))}</div>` : ''}</div>`})}${gizli.length ? `<div class="dd-yigin-8">${etiket('Görmedikleri')}${DD.satirlar(gizli.map(t => ({ikon: 'eye-slash', baslik: t.etiket, alt: 'Paylaşım kapalı'})))}</div>` : ''}${DD.gizlilikBant('Bir türü kapattığında diyetisyenin **o veriyi artık görmez**.')}</div>`
    });
  };
  const aktarSheet = () => {
    const g = cihazGunler(), say = {adim: g.length, kilo: g.filter(x => x.kiloKg != null).length, uyku: g.length};
    let bicim = 'csv';
    DD.sheet({
      baslik: 'Cihaz verini dışa aktar',
      html: `<div class="dd-yigin">${DD.p('Sağlık uygulamandan gelen kayıtların **makine okunur dosya** olarak hazırlanır; indirme bağlantısı e-postana gelir.', {ton: 'ikincil'})}${DD.alan({etiket: 'Veri türleri', html: `<div class="dd-yigin-8">${CT().map(t => DD.checkbox({ad: `aktar-${t.id}`, etiket: t.etiket, alt: `${say[t.id]} günlük kayıt`, secili: true})).join('')}</div>`})}${DD.alan({etiket: 'Dosya biçimi', html: DD.cipler({ad: 'aktar-bicim', tur: 'tek', serit: false, secili: bicim, ogeler: [{deger: 'csv', metin: 'CSV', ikon: 'file-csv'}, {deger: 'json', metin: 'JSON', ikon: 'file-code'}]})})}<div data-yuva="hata"></div></div>`,
      altBar: DD.btn({metin: 'Dosyayı hazırla', ikon: 'file-export', tam: true, veri: {eylem: 'aktar-hazirla'}}),
      sonra: d => {
        const c = [
          DD.on(d, 'aktar-bicim', v => { bicim = v; }),
          DD.eylem(d, 'aktar-hazirla', el => {
            const l = CT().filter(t => d.querySelector(`[name="aktar-${t.id}"]`)?.checked);
            if (!l.length) { d.querySelector('[data-yuva="hata"]').innerHTML = DD.veriYok('En az **bir veri türü** seç.'); return; }
            DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 3).then(() => {
              ciYaz({aktarim: {zaman: `bugün ${nk(DDV.bugun.simdi)}`, bicim}});
              kaydet('Cihaz verisi dışa aktarıldı', 'file-export');
              d.kapat(); DD.tazele();
              DD.toast(`Dosyan hazır; bağlantı **${DDV.kullanici.eposta}** adresine gönderildi`, {tur: 'basari'});
            });
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };
  const cihazSil = () => {
    const g = cihazGunler(), b = baglanti();
    DD.dialog({baslik: 'Cihaz verin silinsin mi?', metin: `Sağlık uygulamandan gelen **${g.length} günlük adım, kilo ve uyku kaydın** Dada Diet’ten silinir. Elle girdiğin ölçümler kalır, ${b ? b.ad : 'sağlık uygulaman'} içindeki verine dokunulmaz. Bu işlem geri alınamaz.`, eylem: 'Sil', iptal: 'Vazgeç', yikici: true}).then(ok => {
      if (!ok) return;
      cihazVerisiSil();
      DD.tazele();
      DD.toast('Cihaz verin **silindi**', {tur: 'uyari'});
    });
  };

  let hataGosterildi = false;
  DD.ekran('veri-izinleri', {
    tur: 'alt',
    ust: '#/profil',
    baslik: 'Veri izinlerim',
    yenile: true,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    sonra: (kok, ctx) => {
      const in_ = sec => requestAnimationFrame(() => { const k = kok.querySelector('.dd-kaydir'), h = kok.querySelector(sec)?.closest('.dd-grup'); if (h) k.scrollTop += h.getBoundingClientRect().top - k.getBoundingClientRect().top - kok.querySelector('.dd-header').offsetHeight; });
      const cihazIn = () => in_(rizaEtkin() && kok.querySelector('#cihaz-paylas') ? '#cihaz-paylas' : '#cihaz-izin');
      if ((ctx.sorgu.gecmis || ctx.sorgu.cihaz) && !ctx.indi) { ctx.indi = true; if (ctx.sorgu.gecmis) in_('#gecmis'); else cihazIn(); }
      if (!ctx.sheetAcildi && (ctx.sorgu.riza === 'cihaz' || ctx.sorgu.onizleme)) {
        ctx.sheetAcildi = true;
        if (ctx.sorgu.riza === 'cihaz') { if (rizaEtkin()) in_('#cihaz-izin'); else rizaAl({kaynak: 'baglanti'}); } else onizlemeSheet();
      }
      const c = [
        DD.on(kok, 'riza', v => {
          if (v) { DD.durum.yaz('veri-izinleri', {...izinler(), riza: true}); kaydet('Sağlık verisi açık rızası verildi', 'shield-halved'); DD.tazele(); DD.toast('**Açık rızan** kaydedildi', {tur: 'basari'}); return; }
          const cihazAcik = ciOku().riza;
          DD.dialog({baslik: 'Rızanı geri al', metin: `Yeni sağlık kaydın **hesabına aktarılmaz**, hassasiyetlerin önerilerde kullanılmaz${cihazAcik ? ', sağlık uygulamandan veri okunmaz' : ''}. Mevcut kayıtların sen silmedikçe saklanır.`, eylem: 'Geri al', iptal: 'Vazgeç', yikici: true}).then(ok => {
      if (!ctx.sheetAcildi && ctx.sorgu.paylas && uzman()) {
        ctx.sheetAcildi = true;
        const id = TUR().some(t => t.id === ctx.sorgu.paylas) ? ctx.sorgu.paylas : null;
        if (id && paylasim()[id]) in_('#paylasim'); else yeniIzinSheet('Paylaşacaklarını seç', id);
      }
            if (ok) { DD.durum.yaz('veri-izinleri', {...izinler(), riza: false}); if (cihazAcik) ciYaz({riza: false, paylas: false, turler: kapaliTurler()}); kaydet('Sağlık verisi açık rızası geri alındı', 'shield-halved'); DD.toast('**Açık rızanı** geri aldın', {tur: 'uyari'}); }
            DD.tazele();
          });
        }),
        DD.on(kok, 'paylas-genel', v => {
          if (v) { yeniIzinSheet('Paylaşacaklarını seç'); return; }
          DD.dialog({baslik: 'Bütün izinler geri çekilsin mi?', metin: 'Diyetisyenin **hiçbir sağlık verini** göremez. İstediğin zaman yeniden açabilirsin.', eylem: 'Geri çek', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) { TUR().forEach(t => { if (paylasim()[t.id]) turDegis(t.id, false); }); cihazPaylasKapat(); DD.toast('Bütün erişimler **durdu**', {tur: 'uyari'}); } DD.tazele(); });
        }),
        ...TUR().map(t => DD.on(kok, `paylas-${t.id}`, v => { turDegis(t.id, v); DD.tazele(); DD.toast(v ? `**${t.etiket}** paylaşılıyor` : `**${t.etiket}** paylaşımı kapatıldı`, {ikon: 'gizlilik', yerine: true}); })),
        DD.eylem(kok, 'hepsini-cek', () => DD.dialog({baslik: 'Bütün izinler geri çekilsin mi?', metin: 'Diyetisyenin **hiçbir sağlık verini** göremez. İstediğin zaman yeniden açabilirsin.', eylem: 'Geri çek', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; TUR().forEach(t => { if (paylasim()[t.id]) turDegis(t.id, false); }); cihazPaylasKapat(); DD.tazele(); DD.toast('Bütün erişimler **durdu**', {tur: 'uyari'}); })),
        DD.eylem(kok, 'yeni-izin', yeniIzinSheet),
        DD.eylem(kok, 'istek-onay', el => { const t = TUR().find(x => x.id === el.dataset.id); turDegis(t.id, true); izinYaz({cevap: {...izinAyar().cevap, [t.id]: 'onay'}}); DD.tazele(); DD.toast(`**${t.etiket}** izni verildi; diyetisyenin artık görebilir`, {tur: 'basari'}); }),
        DD.eylem(kok, 'istek-red', el => { const t = TUR().find(x => x.id === el.dataset.id); izinYaz({cevap: {...izinAyar().cevap, [t.id]: 'red'}}); kaydet(`${t.etiket} isteği reddedildi`, 'ban'); DD.tazele(); DD.toast('İzin isteği **reddedildi**', {ikon: 'ban'}); }),
        DD.on(kok, 'gecmis', v => { ctx.gecmis = v; DD.tazele(); }),
        DD.on(kok, 'cihaz-riza', v => {
          if (v) { rizaAl({kaynak: 'veri-izinleri'}); return; }
          DD.dialog({baslik: 'Sağlık uygulaması rızanı geri al', metin: 'Sağlık uygulamandan **yeni veri okunmaz**, bağlantın duraklar ve cihaz verisi paylaşımın kapanır. Mevcut cihaz kayıtların sen silmedikçe saklanır.', eylem: 'Geri al', iptal: 'Vazgeç', yikici: true}).then(ok => {
            if (ok) { const p = ciOku().paylas; ciYaz({riza: false, paylas: false, turler: kapaliTurler()}); kaydet('Sağlık uygulaması verisi rızası geri alındı', 'heart-pulse'); if (p) kaydet('Cihaz verisi paylaşımı kapatıldı', 'mobile-screen'); DD.toast('Sağlık uygulaması **rızanı geri aldın**', {tur: 'uyari'}); }
            DD.tazele();
          });
        }),
        DD.on(kok, 'cihaz-paylas', v => {
          if (v) { paylasAc(); DD.tazele(); DD.toast('Paylaşmak istediğin **türü tek tek aç**', {ikon: 'gizlilik', yerine: true}); return; }
          cihazPaylasKapat(); DD.tazele(); DD.toast('Cihaz verisi paylaşımı **kapatıldı**', {ikon: 'gizlilik', yerine: true});
        }),
        ...CT().map(t => DD.on(kok, `cihaz-tur-${t.id}`, v => {
          const c = ciOku(), turler = {...c.turler, [t.id]: v};
          ciYaz({turler});
          kaydet(`${t.etiket} cihaz paylaşımı ${v ? 'açıldı' : 'kapatıldı'}`, t.ikon);
          DD.tazele(); DD.toast(v ? `**${t.etiket}** paylaşılıyor` : `**${t.etiket}** paylaşımı kapatıldı`, {ikon: 'gizlilik', yerine: true});
        })),
        DD.eylem(kok, 'onizleme', onizlemeSheet),
        DD.eylem(kok, 'cihaz-aktar', aktarSheet),
        DD.eylem(kok, 'cihaz-sil', cihazSil)
      ];
      return () => c.forEach(f => f());
    }
  });
})();
