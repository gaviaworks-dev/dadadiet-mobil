/* Hesap ayarları (#/ayarlar, #/ayarlar/:bolum): web hesabim/ayarlar (8 sekme) + uye-gastro-ayarlar.js eşi, Gastro ortak/sayfalar/ayarlar.js kalıbında:
 * hub = parçalı profil kartı + başlıklı kartsız gruplar (DD.gruplar), Çıkış ayrı Oturum grubunda. Her bölüm alt ekrandır ve yine DD.gruplar ile kurulur.
 * Bölümler: profil, gizlilik, bildirim, guvenlik, dil, bagli, veri, dondur, sil. #/ayarlar/hesap → #/ayarlar/dondur, #/ayarlar/ogun → #/ogun-saatleri.
 * Durum: hesap-ayar {profil, bildirim, guvenlik, dil, bagli, veri, hesap} (varsayılan DDV.hesap.varsayilan; şema veri/hesap.js). Ortak anahtarlar:
 *   bildirim-ayar {tur:boolean} uygulama bildirimi kanalı (profil.js BILDIRIM ile aynı), su-sessiz {bas, bit} sessiz saatler (DD.suHatirlatma, DD.ogun.sessiz ile ortak),
 *   bagli-uygulamalar {gastro, fit} (kanon/dd-menu.js bagliSheet ile aynı), veri-izinleri {riza, esitle} (esitle = Apple Health / Health Connect).
 * Yeni hesapta (DD.yeniHesap) kişisel alanlar boş, oturum yalnız bu cihaz, kayıt sayıları sıfır. ?hal=hata bağlantı hatası. */
(() => {
  const H = () => DDV.hesap;
  const BOLUM = {profil: 'Profil bilgilerim', gizlilik: 'Profil görünürlüğü', bildirim: 'Bildirim tercihleri', guvenlik: 'Güvenlik', dil: 'Dil ve bölge', bagli: 'Bağlı uygulamalar', veri: 'Verilerim', dondur: 'Hesabı dondur', sil: 'Hesabımı sil'};
  // Eski bölüm adları yeni bölüme yönlenir.
  const YONLEN = {hesap: '#/ayarlar/dondur', ogun: '#/ogun-saatleri'};
  // Yeni hesapta örnek kişisel veri görünmez.
  const BOS = {profil: {kullaniciAdi: '', telefon: '', dogum: '', hakkimda: '', guncelleme: null}, guvenlik: {sso: {apple: false, google: false}, sifreTarih: null, ikiAdim: false, biyometrik: false}, bagli: {sonEsitleme: {}}, besin: {sevmedik: []}};
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const ayar = b => ({...H().varsayilan[b], ...(DD.yeniHesap() ? BOS[b] : {}), ...(tum()[b] || {})});
  const ayarYaz = (b, ek) => DD.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  const plan = () => DD.durum.oku('plan', null) || {};
  const K = () => ({...(DD.yeniHesap() ? {} : DDV.kullanici), ...plan()});
  const kisi = () => { const k = K(), p = ayar('profil'); return {...p, ad: p.ad ?? k.ad ?? '', soyad: p.soyad ?? k.soyad ?? '', eposta: p.eposta ?? k.eposta ?? ''}; };
  const noktali = s => String(s).replace(':', '.');
  const secAd = (liste, v) => (liste.find(([d]) => d === v) || [])[1] || '';
  const kisaAd = s => (s.match(/\(([^)]+)\)$/) || [])[1] || s.replace(/^\([^)]*\)\s*/, '');
  const telBicim = t => String(t || '').replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  const gunFark = iso => Math.round((DD.simdi() - new Date(`${iso}T12:00:00`)) / 864e5);
  const once = iso => { if (!iso) return 'Henüz değiştirilmedi'; const g = gunFark(iso); return g < 1 ? 'bugün' : g < 30 ? `${g} gün önce` : `${Math.round(g / 30)} ay önce`; };
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, KULLANICI = /^[a-z0-9._]{3,24}$/, GUCLU = /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ]).{8,}$/;
  const sessizMetin = () => { const s = DD.suHatirlatmaDurum(); return s.bas === s.bit ? 'Kapalı' : `${noktali(s.bas)}–${noktali(s.bit)}`; };
  const push = () => ({...Object.fromEntries(H().bildirimTurleri.map(t => [t.id, t.bildirim])), ...DD.durum.oku('bildirim-ayar', {})});
  const eposta = () => ({...Object.fromEntries(H().bildirimTurleri.map(t => [t.id, t.eposta])), ...ayar('bildirim').eposta});
  const bagliDurum = () => DD.durum.oku('bagli-uygulamalar', {});
  const izinler = () => DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'});
  const oturumlar = () => (DD.yeniHesap() ? H().oturumlar.filter(o => o.bu) : H().oturumlar.filter(o => !ayar('guvenlik').kapatilan.includes(o.id)));
  const sheetSec = (baslik, secenekler, secili, sec) => DD.siralaSheet({baslik, secenekler, secili, sec});
  // Gastro secimBolum: başlıklı radyo grubu.
  const radyolar = (ad, baslik, secenekler, secili) => `<div class="dd-yigin-8" role="radiogroup" aria-label="${DD.esc(baslik)}">${secenekler.map(([deger, etiket]) => DD.radio({ad, deger, etiket, secili: deger === secili})).join('')}</div>`;
  // Akordiyon açık paneli yeniden çizimde korunur (ctx.akAcik).
  const akIzle = (kok, ctx) => { const h = ev => { const b = ev.target.closest?.('.dd-bolum-bas'); if (!b) return; setTimeout(() => { const l = [...kok.querySelectorAll('.dd-bolum-bas')]; ctx.akAcik = l.findIndex(x => x.getAttribute('aria-expanded') === 'true'); }); }; kok.addEventListener('click', h); return () => kok.removeEventListener('click', h); };
  const SURUM = () => DD.SURUM;

  // ---------- Hub (Gastro ayarlar.js 58-70) ----------
  const hub = () => {
    const p = kisi(), g = ayar('guvenlik'), d = ayar('dil'), b = bagliDurum(), oa = DD.ogun.ayar(), k = K(), dz = ayar('hesap').dondurma, H_ = H(), v = ayar('veri'), bs = ayar('besin');
    const acik = H_.bildirimTurleri.filter(t => t.id !== 'su' && !t.sabit && push()[t.id]).length;
    const bagliAd = [izinler().esitle && 'Apple Health', b.gastro && 'Dada Gastro', b.fit && 'Dada Fit'].filter(Boolean);
    const ad = `${p.ad} ${p.soyad}`.trim(), uyelik = DD.yeniHesap() ? 'Ücretsiz' : k.uyelik;
    const plan = !!k.hedefAd, tercih = id => (plan ? `#/onboarding/${id}?duzenle=1` : '#/tercihler');
    const kacinilan = bs.alerjen.length + bs.sevmedik.length;
    return DD.gruplar([
      {baslik: 'Hesap', satirlar: [
        {ikon: 'user', baslik: 'Profil bilgilerim', alt: p.kullaniciAdi ? `@${p.kullaniciAdi} · ${p.eposta}` : 'Ad, kullanıcı adı, e-posta, telefon', git: '#/ayarlar/profil'},
        {ikon: 'eye', baslik: 'Profil görünürlüğü', alt: p.gorunurluk.acik ? 'Profilin herkese açık' : 'Profilini yalnız diyetisyenin görür', git: '#/ayarlar/gizlilik'},
        {ikon: 'bell', baslik: 'Bildirim tercihleri', alt: `${acik} tür açık · sessiz ${sessizMetin()}`, git: '#/ayarlar/bildirim'},
        {ikon: 'clock', baslik: 'Öğün saatlerim', alt: `Hatırlatıcı ${oa.acik ? 'açık' : 'kapalı'} · ${DD.ogun.hesap({duz: true}).ogunler.filter(o => o.durum !== 'kapali').length} öğün`, git: '#/ogun-saatleri'},
        {ikon: 'lock', baslik: 'Güvenlik', alt: `İki adımlı doğrulama ${g.ikiAdim ? 'açık' : 'kapalı'} · ${oturumlar().length} oturum`, git: '#/ayarlar/guvenlik'}
      ]},
      {baslik: 'Beslenme tercihlerim', satirlar: [
        {ikon: 'hedef', baslik: 'Hedefim', alt: plan ? `${k.hedefAd} · ${DD.sayi(k.hedefKcal)} kcal` : 'Seçilmedi', git: plan ? tercih('hedef') : '#/onboarding/hedef'},
        {ikon: 'utensils', baslik: 'Beslenme tarzı', alt: (k.beslenmeTarziAd || []).join(', ') || 'Seçilmedi', git: tercih('tarz')},
        {ikon: 'hourglass-half', baslik: 'Oruç ve ilk öğün', alt: !k.orucProtokolu ? 'Seçilmedi' : k.orucProtokolu === 'yok' ? 'Oruç yok' : `${k.orucProtokolu} · ilk öğün ${noktali(k.ilkOgunSaati)}`, git: tercih('ritim')},
        {ikon: 'thumbs-down', baslik: 'Alerjen ve sevmediklerim', alt: kacinilan ? `${kacinilan} seçim` : 'Seçilmedi', git: '#/tercihler'}
      ]},
      {baslik: 'Dil ve bölge', satirlar: [
        {ikon: 'globe', baslik: 'Dil, bölge ve birimler', alt: `${secAd(H_.dil.dil, d.dil)} · ${d.agirlik} · ${d.enerji === 'kj' ? 'kJ' : 'kcal'}`, git: '#/ayarlar/dil'}
      ]},
      {baslik: 'Üyelik', satirlar: [
        {ikon: 'box-open', baslik: 'Paketlerim', alt: DD.yeniHesap() ? 'Aktif paketin yok' : `${k.uyelik} · ${DDV.benimDiyetisyenim.paket.kalanSeans} görüşme hakkı`, git: '#/paketlerim'},
        {ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilatlar ve kayıtlı kartın', git: '#/odemelerim'}
      ]},
      {baslik: 'Uygulama', satirlar: [
        {ikon: 'arrows-rotate', baslik: 'Bağlı uygulamalar', alt: bagliAd.length ? bagliAd.join(', ') : 'Bağlı uygulama yok', git: '#/ayarlar/bagli'},
        {ikon: 'broom', baslik: 'Önbelleği temizle', alt: `Görseller ve geçici dosyalar · ${DD.sayi(v.onbellekMb)} MB`, veri: {eylem: 'onbellek'}, ok: false},
        {ikon: 'circle-info', baslik: 'Sürüm', deger: SURUM()}
      ]},
      {baslik: 'Veri ve hesap yönetimi', satirlar: [
        {ikon: 'database', baslik: 'Verilerim', alt: 'Gör, indir, sil', git: '#/ayarlar/veri'},
        {ikon: 'shield-halved', baslik: 'Veri izinlerim', alt: izinler().riza ? 'Açık rıza verildi' : 'Açık rıza verilmedi', git: '#/veri-izinleri'},
        {ikon: 'snowflake', baslik: 'Hesabı dondur', alt: dz ? `${secAd(H_.dondurmaSure, dz.sure)} donduruldu` : 'Ara ver, verilerin kalsın', git: '#/ayarlar/dondur'},
        {ikon: 'trash', baslik: 'Hesabımı sil', git: '#/ayarlar/sil', yikici: true}
      ]},
      {baslik: 'Yardım ve yasal', satirlar: [
        {ikon: 'headset', baslik: 'Çözüm merkezi', alt: 'Sık sorulanlar ve destek taleplerin', git: '#/cozum-merkezi'},
        {ikon: 'comment-dots', baslik: 'Görüş bildir', veri: {eylem: 'gorus'}},
        {ikon: 'scale-balanced', baslik: 'Yasal metinler', veri: {eylem: 'yasal'}}
      ]},
      {baslik: 'Oturum', satirlar: [{ikon: 'right-from-bracket', baslik: 'Çıkış yap', veri: {eylem: 'cikis'}, ok: false, yikici: true}]}
    ], {bas: DD.parcali([{avatar: {ad: ad || 'D', gorsel: p.foto}, baslik: ad || 'Adını ekle', alt: `${uyelik} · Profil bilgilerim`, git: '#/ayarlar/profil'}], {aria: 'Profil'})});
  };
  const gorusSheet = () => DD.gorusSheet();
  // Yasal metinler: açık rıza metni Veri izinlerim'de okunur; diğer metinler menü ayağındaki gibi yakında.
  const yasalSheet = () => DD.sheet({
    baslik: 'Yasal metinler',
    html: DD.satirlar([
      {ikon: 'shield-halved', baslik: 'Açık rıza metni', alt: 'Sağlık verilerinin işlenmesi', git: '#/veri-izinleri', attrs: 'data-sheet-kapat'},
      {ikon: 'file-lines', baslik: 'KVKK aydınlatma metni', veri: {eylem: 'yasal-yakinda'}},
      {ikon: 'file-contract', baslik: 'Üyelik sözleşmesi', veri: {eylem: 'yasal-yakinda'}},
      {ikon: 'cookie-bite', baslik: 'Çerez ve gizlilik politikası', veri: {eylem: 'yasal-yakinda'}}
    ]),
    sonra: d => DD.eylem(d, 'yasal-yakinda', () => DD.toast('Yakında', {ikon: 'bilgi'}))
  });
  const onbellek = () => DD.dialog({baslik: 'Önbellek temizlensin mi?', metin: 'Görseller yeniden indirilir; **kayıtların ve ayarların** silinmez.', eylem: 'Temizle', iptal: 'Vazgeç'}).then(ok => { if (!ok) return; ayarYaz('veri', {onbellekMb: 0}); DD.tazele(); DD.toast('Önbellek **temizlendi**', {tur: 'basari'}); });
  const hubBagla = kok => [
    DD.eylem(kok, 'cikis', () => DD.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç'}).then(ok => { if (ok) DD.cikis(); })),
    DD.eylem(kok, 'onbellek', onbellek),
    DD.eylem(kok, 'gorus', gorusSheet),
    DD.eylem(kok, 'yasal', yasalSheet)
  ];

  // ---------- Profil ----------
  const profilForm = (t, h = {}) => `<div class="dd-yigin">
    <div class="dd-ikili">${DD.input({ad: 'ad', etiket: 'Ad', zorunlu: true, deger: t.ad, hata: h.ad, otomatik: 'given-name'})}${DD.input({ad: 'soyad', etiket: 'Soyad', zorunlu: true, deger: t.soyad, hata: h.soyad, otomatik: 'family-name'})}</div>
    ${DD.input({ad: 'kullaniciAdi', etiket: 'Kullanıcı adı', zorunlu: true, ikon: 'at', deger: t.kullaniciAdi, hata: h.kullaniciAdi, yardim: 'Destek gruplarında bu adla görünürsün.'})}
    ${DD.input({ad: 'eposta', etiket: 'E-posta', zorunlu: true, ikon: 'envelope', tur: 'email', mod: 'email', deger: t.eposta, hata: h.eposta, otomatik: 'email', yardim: t.epostaBekleyen ? `${t.epostaBekleyen} doğrulama bekliyor.` : 'Değiştirirsen yeni adrese doğrulama kodu gönderilir.'})}
    ${DD.telefon({ad: 'telefon', opsiyonel: true, deger: telBicim(t.telefon), hata: h.telefon})}
    ${DD.takvimAlan({ad: 'dogum', etiket: 'Doğum tarihi', deger: t.dogum, min: '1926-01-01', max: '2013-11-06', yer: 'Seç (isteğe bağlı)', yardim: 'Enerji ihtiyacı ve hesaplayıcı önerilerinde kullanılır.'})}
    ${DD.input({ad: 'hakkimda', etiket: 'Hakkımda', cokSatir: true, deger: t.hakkimda, yer: 'Kendinden kısaca bahset', hata: h.hakkimda, yardim: `${(t.hakkimda || '').length} / 160`})}
  </div>`;
  const GECMIS = [['ben', 'Yalnız ben', 'lock'], ['diyetisyen', 'Diyetisyenim', 'user-doctor'], ['grup', 'Destek grubum', 'users']];
  const profil = ctx => {
    const p = kisi(), k = K(), t = ctx.taslak || p, ad = `${p.ad} ${p.soyad}`.trim();
    return DD.gruplar([
      {baslik: 'Profil fotoğrafı', html: `<div class="dd-yigin-12">${DD.satirlar([DD.satir({avatar: {ad: ad || 'D', gorsel: p.foto, boyut: 56}, baslik: ad || 'Adını ekle', alt: 'JPG, PNG ya da WebP', sag: DD.btn({metin: 'Değiştir', tur: 'tonal', boyut: 'sm', veri: {eylem: 'foto'}}), duz: true})])}${DD.p('Adın ve fotoğrafın **diyetisyenine**, destek gruplarında ve profilinde görünür.', {ton: 'ikincil', meta: true})}</div>`},
      {baslik: 'Kişisel bilgiler', html: `<div class="dd-yigin"><div data-yuva="profil-form">${profilForm(t, ctx.hatalar)}</div>${p.guncelleme ? DD.veriYok(`Son güncelleme: **${once(p.guncelleme)}**`) : ''}</div>`},
      {baslik: 'Beslenme hedefim', satirlar: [{ikon: 'hedef', baslik: k.hedefAd || 'Henüz seçilmedi', alt: k.hedefAd ? 'Tercihlerim ile aynı hedeftir' : 'Hedefini birkaç adımda seç', git: k.hedefAd ? '#/onboarding/hedef?duzenle=1' : '#/onboarding/hedef'}]},
      {baslik: 'Profil görünürlüğü', satirlar: [{ikon: 'eye', baslik: p.gorunurluk.acik ? 'Profilin herkese açık' : 'Profilini yalnız diyetisyenin görür', alt: 'Rozet, liderlik ve arama görünürlüğü', git: '#/ayarlar/gizlilik'}]}
    ]);
  };
  // ---------- Profil görünürlüğü (Gastro gizlilik bölümü) ----------
  const gizlilik = () => {
    const g = kisi().gorunurluk;
    return DD.gruplar([
      {html: DD.p('Profilinin ve takip geçmişinin **kimlere göründüğünü** buradan seç. Verinin indirilmesi ve silinmesi Verilerim’de yönetilir.', {ton: 'ikincil'})},
      {satirlar: [DD.toggle({ad: 'gor-acik', ikon: 'eye', etiket: 'Profilim herkese açık', alt: 'Kapalıyken yalnız diyetisyenin görür', secili: g.acik})]},
      {baslik: 'Takip geçmişimi kimler görebilir?', html: `<div class="dd-yigin-12"><small class="dd-yardim">Öğünlerin, programların ve ölçümlerin.</small>${radyolar('gor-gecmis', 'Takip geçmişimi kimler görebilir?', GECMIS, g.gecmis)}</div>`},
      {baslik: 'Topluluk', satirlar: [
        DD.toggle({ad: 'gor-rozet', ikon: 'medal', etiket: 'Rozetlerim profilimde görünsün', alt: 'Rozetlerim ekranı etkilenmez', secili: g.rozet}),
        DD.toggle({ad: 'gor-liderlik', ikon: 'ranking-star', etiket: 'Liderlikte adım görünsün', alt: 'Kapalıyken anonim görünürsün', secili: g.liderlik}),
        DD.toggle({ad: 'gor-arama', ikon: 'magnifying-glass', etiket: 'Arama motorlarında görün', alt: g.acik ? 'Açık profilin dizinlenir' : 'Profil gizliyken kapalı', secili: g.acik && g.arama, pasif: !g.acik})
      ]},
      {satirlar: [{ikon: 'download', baslik: 'Verilerimi indir', alt: 'Gör, indir, sil', git: '#/ayarlar/veri'}]}
    ]);
  };
  const profilKaydet = (kok, ctx) => {
    const v = ad => kok.querySelector(`[name="${ad}"]`)?.value ?? '';
    const t = {...kisi(), ad: v('ad').trim(), soyad: v('soyad').trim(), kullaniciAdi: v('kullaniciAdi').trim().replace(/^@/, '').toLocaleLowerCase('tr'), eposta: v('eposta').trim(), telefon: v('telefon').replace(/\D/g, ''), dogum: v('dogum'), hakkimda: v('hakkimda').trim()};
    const h = {
      ad: t.ad ? '' : 'Adını yaz', soyad: t.soyad ? '' : 'Soyadını yaz',
      kullaniciAdi: !t.kullaniciAdi ? 'Kullanıcı adı seç' : KULLANICI.test(t.kullaniciAdi) ? '' : '3-24 karakter; harf, rakam, nokta ya da alt çizgi',
      eposta: !t.eposta ? 'E-posta adresini yaz' : EPOSTA.test(t.eposta) ? '' : 'Geçerli bir e-posta adresi yaz',
      telefon: !t.telefon || /^5\d{9}$/.test(t.telefon) ? '' : 'Başında 0 olmadan 10 haneli cep numaranı yaz',
      hakkimda: t.hakkimda.length > 160 ? 'En çok 160 karakter' : ''
    };
    if (Object.values(h).some(Boolean)) {
      ctx.taslak = t; ctx.hatalar = h;
      const y = kok.querySelector('[data-yuva="profil-form"]'); y.innerHTML = profilForm(t, h); bagHakkimda(kok);
      y.querySelector('.is-hata')?.scrollIntoView({block: 'center', behavior: DD.azHareket() ? 'auto' : 'smooth'});
      DD.toast('**Zorunlu alanları** kontrol et', {tur: 'hata'});
      return;
    }
    const eski = kisi(), yeniEposta = t.eposta !== eski.eposta && t.eposta !== eski.epostaBekleyen ? t.eposta : null;
    ayarYaz('profil', {ad: t.ad, soyad: t.soyad, kullaniciAdi: t.kullaniciAdi, telefon: t.telefon, dogum: t.dogum, hakkimda: t.hakkimda, guncelleme: DD.bugunIso(), ...(yeniEposta ? {epostaBekleyen: yeniEposta} : {})});
    ctx.taslak = null; ctx.hatalar = null;
    DD.tazele();
    if (yeniEposta) DD.toast(`Doğrulama kodu **${yeniEposta}** adresine gönderildi`, {ikon: 'envelope', eylem: 'Doğrula', onEylem: () => DD.git(`#/eposta-dogrula?eposta=${encodeURIComponent(yeniEposta)}`)});
    else DD.toast('Profil bilgilerin **kaydedildi**', {tur: 'basari'});
  };
  const bagHakkimda = kok => {
    const a = kok.querySelector('textarea[name="hakkimda"]'); if (!a) return;
    a.maxLength = 160;
    a.addEventListener('input', () => { const y = a.closest('.dd-alan').querySelector('p.dd-yardim'); if (y) y.textContent = `${a.value.length} / 160`; });
  };
  // Fotoğraf yalnız bu cihazda durur: 192 kareye küçültülüp hesap-ayar.profil.foto'ya yazılır.
  const fotoIsle = (dosya, bitti) => {
    if (!dosya) return;
    if (dosya.size > 5 * 1024 * 1024) { DD.toast('Fotoğraf **5 MB**’tan büyük olamaz', {tur: 'hata'}); return; }
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), s = Math.min(im.width, im.height), n = 192; c.width = c.height = n; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, n, n); bitti(c.toDataURL('image/jpeg', .85)); }; im.onerror = () => DD.toast('Bu dosya **açılamadı**', {tur: 'hata'}); im.src = r.result; };
    r.readAsDataURL(dosya);
  };
  const fotoSheet = () => {
    const p = kisi();
    DD.sheet({
      baslik: 'Profil fotoğrafı',
      html: `<div class="dd-yigin">${DD.parcali([{ikon: 'camera', baslik: 'Fotoğraf çek', alt: 'Ön kamerayı açar', veri: {eylem: 'foto-cek'}}, {ikon: 'images', baslik: 'Galeriden seç', alt: 'JPG, PNG ya da WebP', veri: {eylem: 'foto-galeri'}}, p.foto && {ikon: 'trash', baslik: 'Fotoğrafı kaldır', alt: 'Baş harfin görünür', yikici: true, veri: {eylem: 'foto-sil'}}].filter(Boolean))}${DD.veriYok('En çok **5 MB**. Fotoğrafın diyetisyenine ve destek gruplarına görünür.')}<input type="file" accept="image/*" capture="user" data-foto="cek" hidden><input type="file" accept="image/jpeg,image/png,image/webp" data-foto="galeri" hidden></div>`,
      sonra: d => {
        const kaydet = foto => { ayarYaz('profil', {foto, guncelleme: DD.bugunIso()}); d.kapat(); DD.tazele(); DD.toast(foto ? 'Profil fotoğrafın **güncellendi**' : 'Fotoğrafın kaldırıldı, **baş harfin** görünüyor', {tur: 'basari'}); };
        d.querySelectorAll('[data-foto]').forEach(i => i.addEventListener('change', () => fotoIsle(i.files[0], kaydet)));
        const c = [DD.eylem(d, 'foto-cek', () => d.querySelector('[data-foto="cek"]').click()), DD.eylem(d, 'foto-galeri', () => d.querySelector('[data-foto="galeri"]').click()), DD.eylem(d, 'foto-sil', () => kaydet(null))];
        return () => c.forEach(f => f());
      }
    });
  };
  const profilBagla = (kok, ctx) => {
    bagHakkimda(kok);
    return [
      DD.eylem(kok, 'foto', fotoSheet),
      DD.eylem(kok, 'profil-kaydet', () => profilKaydet(kok, ctx))
    ];
  };
  const gizlilikBagla = kok => {
    const gor = (alan, etiket) => DD.on(kok, `gor-${alan}`, v => {
      const g = {...kisi().gorunurluk, [alan]: v}; ayarYaz('profil', {gorunurluk: g});
      if (alan === 'acik') DD.tazele();
      DD.toast(`**${etiket}** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: v ? 'eye' : 'eye-slash'});
    });
    return [
      DD.on(kok, 'gor-gecmis', v => { ayarYaz('profil', {gorunurluk: {...kisi().gorunurluk, gecmis: v}}); DD.toast(`Takip geçmişini artık **${secAd(GECMIS, v).toLocaleLowerCase('tr')}** görür`, {ikon: 'clock-rotate-left'}); }),
      gor('acik', 'Herkese açık profil'), gor('rozet', 'Rozet görünürlüğü'), gor('liderlik', 'Liderlik tablosu'), gor('arama', 'Arama motoru görünürlüğü')
    ];
  };

  // ---------- Bildirim ----------
  const turListe = kanal => {
    const d = kanal === 'eposta' ? eposta() : push();
    return DD.satirlar(H().bildirimTurleri.filter(t => t.id !== 'su').map(t => DD.toggle({ad: `bt-${t.id}`, ikon: t.ikon, etiket: t.ad, alt: t.alt, secili: t.sabit || d[t.id], pasif: t.sabit})));
  };
  const bildirim = ctx => {
    const kanal = ctx.kanal ||= 'bildirim', oa = DD.ogun.ayar(), h = DD.ogun.hesap({duz: true}), izinYok = DD.ogun.izin() !== 'verildi';
    return DD.gruplar([
      {baslik: 'Bildirim türleri', html: `<div class="dd-yigin">${DD.p('Hangi bildirimi **hangi kanaldan** alacağını seç. Diyetisyen planında öğün saati varsa hatırlatmalar plana göre gelir.', {ton: 'ikincil'})}${DD.segment({ad: 'kanal', etiket: 'Kanal', secili: kanal, ogeler: [{ad: 'Bildirim', deger: 'bildirim', ikon: 'bell'}, {ad: 'E-posta', deger: 'eposta', ikon: 'envelope'}]})}<div class="dd-yigin-12" data-yuva="turler">${kanal === 'bildirim' && izinYok ? DD.bant({ton: 'uyari', baslik: 'Telefon bildirimleri kapalı', metin: 'Bildirimlerin gelmesi için **sistem iznini** açman gerekir.', eylem: {metin: 'İzni aç', git: '#/bildirim-izni'}}) : ''}${turListe(kanal)}</div></div>`},
      {baslik: 'Öğün hatırlatması', satirlar: [{ikon: 'utensils', baslik: `Öğün hatırlatıcısı ${oa.acik ? 'açık' : 'kapalı'}`, alt: DD.ogun.ozet(h) || 'Öğün saatlerini düzenle', git: '#/ogun-saatleri'}]},
      {baslik: 'Su hatırlatması', html: DD.suHatirlatma()},
      {baslik: 'Zamanlama', html: `<div class="dd-yigin-12">${DD.satirlar([
        {ikon: 'clipboard-check', baslik: 'Günlük takip saati', alt: 'Öğün girmediğin günlerde', deger: noktali(ayar('bildirim').takipSaat), veri: {eylem: 'takip-saat'}},
        {id: 'sessiz-satir', ikon: 'moon', baslik: 'Sessiz saatler', alt: 'Su ve öğün hatırlatmaları dahil', deger: sessizMetin(), veri: {eylem: 'sessiz'}}
      ])}${DD.veriYok('Sessiz saatlerde **uygulama bildirimi** gelmez; e-posta etkilenmez.')}</div>`},
      {baslik: 'Bildirimlerin', satirlar: [
        {ikon: 'inbox', baslik: 'Gelen bildirimler', alt: DD.bildirimSayi() ? `${DD.bildirimSayi()} okunmamış` : 'Hepsi okundu', git: '#/bildirimler'},
        {ikon: 'mobile-screen', baslik: 'Bildirim önizlemesi', alt: 'Kilit ekranında nasıl göründüğü', git: '#/bildirim-onizleme'}
      ]}
    ]);
  };
  const bildirimBagla = (kok, ctx) => {
    const sessizYaz = () => { const el = kok.querySelector('#sessiz-satir .dd-satir-deger'); if (el) el.textContent = sessizMetin(); };
    const degis = ev => { if (/^su-sessiz-/.test(ev.target.name || '')) sessizYaz(); };
    kok.addEventListener('change', degis);
    return [
      () => kok.removeEventListener('change', degis),
      DD.suHatirlatmaBagla(kok),
      DD.on(kok, 'kanal', v => { ctx.kanal = v; DD.tazele(); }),
      ...H().bildirimTurleri.filter(t => !t.sabit && t.id !== 'su').map(t => DD.on(kok, `bt-${t.id}`, v => {
        const e = ctx.kanal === 'eposta';
        if (e) ayarYaz('bildirim', {eposta: {...eposta(), [t.id]: v}}); else DD.durum.yaz('bildirim-ayar', {...DD.durum.oku('bildirim-ayar', {}), [t.id]: v});
        DD.toast(`**${t.ad}** ${e ? 'e-postası' : 'bildirimi'} ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: v ? 'bell' : 'bell-slash', yerine: true});
      })),
      DD.eylem(kok, 'takip-saat', () => sheetSec('Günlük takip saati', H().takipSaatleri.map(s => [s, noktali(s), 'clock']), ayar('bildirim').takipSaat, v => { ayarYaz('bildirim', {takipSaat: v}); DD.tazele(); DD.toast(`Takip hatırlatması **${noktali(v)}**’da gelir`, {ikon: 'clock'}); })),
      DD.eylem(kok, 'sessiz', () => { const s = DD.suHatirlatmaDurum(), simdi = s.bas === s.bit ? 'kapali' : `${s.bas}-${s.bit}`; sheetSec('Sessiz saatler', H().sessizSecenek.map(([d, a]) => [d, a, d === 'kapali' ? 'bell' : 'moon']), simdi, v => {
        const [bas, bit] = v === 'kapali' ? ['00:00', '00:00'] : v.split('-');
        DD.durum.yaz('su-sessiz', {bas, bit}); document.dispatchEvent(new CustomEvent('dd-ogun')); DD.tazele();
        DD.toast(v === 'kapali' ? 'Sessiz saat **kapatıldı**' : `Sessiz saatler **${sessizMetin()}**`, {ikon: 'moon'});
      }); })
    ];
  };

  // ---------- Güvenlik ----------
  const YONTEM = {sms: 'SMS ile kod', uygulama: 'Doğrulayıcı uygulama'};
  // Marka ikonu fa-brands ister (DD.btn marka gibi); satır, kanon satır ikonu ve anahtarla kurulur.
  const SSO = [['apple', 'Apple'], ['google', 'Google']];
  const ssoSatir = (k, ad, on) => DD.satir({sol: `<span class="dd-satir-ikon"><i class="icon fa-brands fa-${k}" aria-hidden="true"></i></span>`, baslik: `${ad} ile giriş`, alt: on ? 'Bağlı · tek dokunuşla giriş' : 'Bağlı değil', sag: DD.anahtar({ad: `sso-${k}`, etiket: `${ad} ile giriş`, secili: on}), duz: true});
  const guvenlik = ctx => {
    const g = ayar('guvenlik'), p = kisi(), o = oturumlar(), kodlar = g.kodlar || H().kurtarmaKodlari;
    return DD.gruplar([
      {html: DD.p('Şifreni değiştir, **iki adımlı doğrulamayı** yönet, açık oturumlarını gör.', {ton: 'ikincil'})},
      {html: DD.akordiyon([
        {ikon: 'key', baslik: 'Şifre ve giriş', alt: `Son değişiklik: ${once(g.sifreTarih)}`, icerik: DD.satirlar([
          DD.satir({ikon: 'key', baslik: 'Şifreni değiştir', alt: 'Mevcut şifrenle doğrula', veri: {eylem: 'sifre'}}),
          DD.toggle({ad: 'biyometrik', ikon: 'fingerprint', etiket: 'Face ID ile giriş', alt: 'Açarken yüzünle doğrula', secili: g.biyometrik})
        ])},
        {ikon: 'shield-halved', baslik: 'İki adımlı doğrulama', alt: 'Giriş yöntemleri ve kurtarma kodları', sag: DD.durumRozet({metin: g.ikiAdim ? 'Açık' : 'Kapalı', ton: g.ikiAdim ? 'basari' : 'notr', ikon: g.ikiAdim ? 'onay' : 'lock-open'}), icerik: `<div class="dd-yigin-12">${DD.satirlar([
          DD.toggle({ad: 'iki-adim', ikon: 'shield-halved', etiket: 'İki adımlı doğrulama', alt: g.ikiAdim ? `Açık · ${YONTEM[g.yontem]}` : 'Kapalı · yalnız şifreyle giriş', secili: g.ikiAdim}),
          ...(g.ikiAdim ? [{ikon: 'list-ol', baslik: 'Kurtarma kodların', alt: `${kodlar.length} koddan ${g.kurtarmaKalan} tanesi kullanılmadı`, veri: {eylem: 'kodlar'}}, {ikon: 'mobile-screen', baslik: 'Doğrulama yöntemi', deger: YONTEM[g.yontem], veri: {eylem: 'kurulum'}}].map(DD.satir) : []),
          DD.satir({ikon: 'envelope', baslik: 'E-posta', alt: p.eposta || 'E-posta eklenmedi', sag: DD.durumRozet({metin: 'Birincil', ton: 'basari', ikon: 'onay'}), duz: true}),
          ...SSO.map(([k, ad]) => ssoSatir(k, ad, g.sso[k]))
        ])}${DD.veriYok('Yeni cihazdan giriş ve şifre değişikliği her zaman **e-postayla** bildirilir.')}</div>`},
        {ikon: 'mobile-screen', baslik: 'Açık oturumlarım', alt: 'Hesabına giriş yapılmış cihazlar', sag: DD.sayacRozet(o.length), icerik: `<div class="dd-yigin-12">${DD.p('**Tanımadığın bir cihaz** varsa oturumu kapat ve şifreni değiştir.', {ton: 'ikincil'})}${DD.satirlar(o.map(x => DD.satir({ikon: x.ikon, baslik: x.ad, alt: `${x.yer} · ${x.zaman}`, sag: x.bu ? DD.durumRozet({metin: 'Bu cihaz', ton: 'basari'}) : DD.btn({metin: 'Kapat', tur: 'text', boyut: 'sm', veri: {eylem: 'oturum-kapat', id: x.id}}), duz: true})))}${o.length > 1 ? DD.btn({metin: 'Diğer oturumları kapat', ikon: 'right-from-bracket', tur: 'secondary', tam: true, veri: {eylem: 'oturum-hepsi'}}) : DD.veriYok('Bu cihaz dışında **açık oturum** yok.')}</div>`}
      ], {ad: 'gv', acik: ctx.akAcik ?? 0})}
    ]);
  };
  const sifreSheet = () => {
    const govde = (h = {}) => `<div class="dd-yigin">${DD.input({ad: 'mevcut', etiket: 'Mevcut şifren', tur: 'password', ikon: 'lock', hata: h.mevcut, otomatik: 'current-password'})}${DD.input({ad: 'yeni', etiket: 'Yeni şifre', tur: 'password', ikon: 'key', hata: h.yeni, otomatik: 'new-password', yardim: H().giris.sifreKurali})}${DD.input({ad: 'tekrar', etiket: 'Yeni şifre (tekrar)', tur: 'password', ikon: 'key', hata: h.tekrar, otomatik: 'new-password'})}</div>`;
    DD.sheet({
      baslik: 'Şifreni değiştir', html: govde(),
      altBar: DD.btn({metin: 'Şifreyi güncelle', ikon: 'onay', tam: true, veri: {eylem: 'sifre-kaydet'}}),
      sonra: d => DD.eylem(d, 'sifre-kaydet', el => {
        const v = ad => d.querySelector(`[name="${ad}"]`).value, m = v('mevcut'), y = v('yeni');
        const h = {mevcut: m ? '' : 'Mevcut şifreni yaz', yeni: !GUCLU.test(y) ? 'Yeni şifre kurallara uymuyor' : y === m ? 'Yeni şifre eskisiyle aynı olamaz' : '', tekrar: y === v('tekrar') ? '' : 'Yeni şifreler birbiriyle aynı değil'};
        if (Object.values(h).some(Boolean)) { d.querySelector('.dd-sheet-govde').innerHTML = govde(h); return; }
        DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 2).then(() => { ayarYaz('guvenlik', {sifreTarih: DD.bugunIso(), sifre: y}); d.kapat(); DD.tazele(); DD.toast('Şifren **güncellendi**', {tur: 'basari'}); });
      })
    });
  };
  const kodSheet = () => {
    const kodlar = ayar('guvenlik').kodlar || H().kurtarmaKodlari;
    DD.sheet({
      baslik: 'Kurtarma kodların',
      html: `<div class="dd-yigin">${DD.p('Telefonuna erişemezsen hesabına **yalnız bu kodlarla** girebilirsin. Her kod bir kez kullanılır; güvenli bir yere kaydet.')}<div class="dd-sira">${kodlar.map(k => DD.rozet({metin: k, ton: 'notr'})).join('')}</div></div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Yenile', ikon: 'rotate-right', tur: 'secondary', veri: {eylem: 'kod-yenile'}})}${DD.btn({metin: 'Kopyala', ikon: 'copy', veri: {eylem: 'kod-kopyala'}})}</div>`,
      sonra: d => {
        const a = DD.eylem(d, 'kod-kopyala', () => { navigator.clipboard?.writeText(kodlar.join('\n')).catch(() => {}); DD.toast('Kodlar **kopyalandı**', {ikon: 'copy'}); });
        const b = DD.eylem(d, 'kod-yenile', () => DD.dialog({baslik: 'Kodlar yenilensin mi?', metin: 'Eski kodların **hemen geçersiz** olur.', eylem: 'Yenile', iptal: 'Vazgeç'}).then(ok => {
          if (!ok) return;
          const yeni = Array.from({length: 10}, () => String(Math.floor(Math.random() * 1e6)).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1-$2'));
          ayarYaz('guvenlik', {kodlar: yeni, kurtarmaKalan: 10}); d.kapat(); DD.tazele(); kodSheet(); DD.toast('Kurtarma kodların **yenilendi**', {tur: 'basari'});
        }));
        return () => { a(); b(); };
      }
    });
  };
  // İki adımlı kurulum: yöntem → kod → kurtarma kodları. Yarıda kapanırsa eski durum kalır.
  const kurulumSheet = () => {
    const s = {adim: 1, yontem: ayar('guvenlik').yontem || 'sms', bitti: false}, kodlar = ayar('guvenlik').kodlar || H().kurtarmaKodlari, tel = kisi().telefon;
    const govde = (hata = '') => `<div class="dd-yigin">${DD.adimGosterge({adim: s.adim, toplam: 3})}${s.adim === 1
      ? DD.secimler({ad: 'tfa-yontem', secili: s.yontem, duzen: 'tek', ogeler: [{k: 'sms', ad: 'SMS ile kod', alt: 'Kayıtlı telefonuna 6 haneli kod gelir', ikon: 'comment-sms'}, {k: 'uygulama', ad: 'Doğrulayıcı uygulama', alt: '30 saniyede bir yeni kod üretir; şebeke gerekmez', ikon: 'mobile-screen'}]})
      : s.adim === 2 ? `${DD.p(s.yontem === 'sms' ? `Kodu **+90 ${tel ? `${tel.slice(0, 3)} *** ** ${tel.slice(-2)}` : 'telefonuna'}** numarasına gönderdik.` : 'Doğrulayıcı uygulamana **Dada Diet** hesabını ekle ve ürettiği kodu yaz.')}${DD.input({ad: 'tfa-kod', etiket: 'Doğrulama kodu', ikon: 'hashtag', mod: 'numeric', yer: '6 haneli kod', otomatik: 'one-time-code', hata})}`
      : `${DD.p('Bu kodları güvenli bir yere kaydet. Telefonuna erişemezsen hesabına **yalnız bunlarla** girebilirsin.')}<div class="dd-sira">${kodlar.map(k => DD.rozet({metin: k, ton: 'notr'})).join('')}</div>${DD.checkbox({ad: 'tfa-onay', etiket: 'Kurtarma kodlarımı güvenli bir yere kaydettim'})}${hata ? DD.veriYok(hata) : ''}`}</div>`;
    const ayak = () => `<div class="dd-ikili">${s.adim > 1 ? DD.btn({metin: 'Geri', tur: 'secondary', veri: {eylem: 'tfa-geri'}}) : DD.btn({metin: 'Vazgeç', tur: 'secondary', attrs: 'data-sheet-kapat'})}${DD.btn({metin: s.adim === 3 ? 'Kurulumu bitir' : 'Devam', veri: {eylem: 'tfa-ileri'}})}</div>`;
    DD.sheet({
      baslik: 'İki adımlı doğrulama', html: govde(), altBar: ayak(),
      kapaninca: () => { if (!s.bitti) DD.tazele(); },
      sonra: d => {
        const ciz = h => { d.querySelector('.dd-sheet-govde').innerHTML = govde(h); d.querySelector('.dd-sheet-ayak').innerHTML = ayak(); };
        const c = [
          DD.on(d, 'tfa-yontem', v => { s.yontem = v; }),
          DD.eylem(d, 'tfa-geri', () => { s.adim -= 1; ciz(); }),
          DD.eylem(d, 'tfa-ileri', () => {
            if (s.adim === 2 && !/^\d{6}$/.test(d.querySelector('[name="tfa-kod"]').value.trim())) { ciz('Altı haneli kodu yaz'); return; }
            if (s.adim < 3) { s.adim += 1; ciz(); return; }
            if (!d.querySelector('[name="tfa-onay"]').checked) { ciz('Devam etmek için **kodları kaydettiğini** işaretle.'); return; }
            s.bitti = true; ayarYaz('guvenlik', {ikiAdim: true, yontem: s.yontem}); d.kapat(); DD.tazele(); DD.toast('İki adımlı doğrulama **kuruldu**', {tur: 'basari'});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };
  const guvenlikBagla = (kok, ctx) => [
    akIzle(kok, ctx),
    DD.eylem(kok, 'sifre', sifreSheet),
    DD.eylem(kok, 'kodlar', kodSheet),
    DD.eylem(kok, 'kurulum', kurulumSheet),
    DD.on(kok, 'biyometrik', v => { ayarYaz('guvenlik', {biyometrik: v}); DD.toast(`**Face ID ile giriş** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'fingerprint'}); }),
    DD.on(kok, 'iki-adim', v => {
      if (v) { kurulumSheet(); return; }
      DD.dialog({baslik: 'İki adımlı doğrulama kapansın mı?', metin: 'Hesabına **yalnız şifreyle** girilebilir.', eylem: 'Kapat', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) { ayarYaz('guvenlik', {ikiAdim: false}); DD.toast('İki adımlı doğrulama **kapatıldı**', {tur: 'uyari'}); } DD.tazele(); });
    }),
    ...SSO.map(([k, ad]) => DD.on(kok, `sso-${k}`, v => { ayarYaz('guvenlik', {sso: {...ayar('guvenlik').sso, [k]: v}}); DD.tazele(); DD.toast(`**${ad}** hesabın ${v ? 'bağlandı' : 'bağlantısı kaldırıldı'}`, {ikon: v ? 'link' : 'link-slash'}); })),
    DD.eylem(kok, 'oturum-kapat', el => { const o = H().oturumlar.find(x => x.id === el.dataset.id); ayarYaz('guvenlik', {kapatilan: [...ayar('guvenlik').kapatilan, o.id]}); DD.tazele(); DD.toast(`**${o.ad}** oturumu kapatıldı`, {ikon: 'right-from-bracket'}); }),
    DD.eylem(kok, 'oturum-hepsi', () => DD.dialog({baslik: 'Diğer oturumlar kapansın mı?', metin: 'Bu cihaz dışındaki cihazlarda **yeniden giriş** gerekir.', eylem: 'Kapat', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; ayarYaz('guvenlik', {kapatilan: H().oturumlar.filter(o => !o.bu).map(o => o.id)}); DD.tazele(); DD.toast('Diğer oturumlar **kapatıldı**', {tur: 'basari'}); }))
  ];

  // ---------- Dil ve bölge ----------
  const DIL = [['dil', 'Arayüz dili', 'language'], ['bolge', 'Bölge', 'location-dot'], ['saatDilimi', 'Saat dilimi', 'clock'], ['haftaBasi', 'Haftanın ilk günü', 'calendar-week'], ['saat', 'Saat biçimi', 'stopwatch']];
  const BIRIM = [['agirlik', 'Ağırlık', 'weight-scale'], ['boy', 'Boy', 'ruler-vertical'], ['enerji', 'Enerji', 'fire'], ['sivi', 'Sıvı', 'glass-water'], ['tarih', 'Tarih biçimi', 'calendar']];
  // Gastro dil bölümü: akordiyon; arayüz dili radyo grubu, diğer alanlar seçim alanı (sheet).
  const dilAlan = d => ([alan, baslik]) => DD.secAlan({ad: `dil-${alan}`, etiket: baslik, secenekler: H().dil[alan], deger: d[alan]});
  const dil = ctx => { const d = ayar('dil'), ozet = l => l.map(([alan]) => { const ad = secAd(H().dil[alan], d[alan]); return ['agirlik', 'boy', 'enerji', 'sivi', 'saatDilimi'].includes(alan) ? kisaAd(ad) : alan === 'saat' ? ad.split(' · ')[0] : alan === 'tarih' ? ad.split(' ')[0] : ad; }).join(' · '); return DD.gruplar([
    {html: DD.p('Arayüz dili, bölge ve ölçü birimleri; tarih ve **saat gösterimin** buna göre kurulur.', {ton: 'ikincil'})},
    {html: DD.akordiyon([
      {ikon: 'language', baslik: 'Arayüz dili', alt: secAd(H().dil.dil, d.dil), icerik: radyolar('dil-dil', 'Arayüz dili', H().dil.dil, d.dil)},
      {ikon: 'clock', baslik: 'Bölge ve saat', alt: ozet(DIL.slice(1)), icerik: `<div class="dd-yigin">${DIL.slice(1).map(dilAlan(d)).join('')}</div>`},
      {ikon: 'scale-balanced', baslik: 'Ölçü birimleri', alt: ozet(BIRIM.slice(0, 3)), icerik: `<div class="dd-yigin">${BIRIM.map(dilAlan(d)).join('')}${DD.veriYok('Birim değişikliği geçmiş kayıtlarını silmez, **yalnız gösterimi** çevirir.')}</div>`}
    ], {ad: 'dl', acik: ctx.akAcik ?? 0})}
  ]); };
  const dilBagla = (kok, ctx) => [akIzle(kok, ctx), ...[...DIL, ...BIRIM].map(([alan, baslik]) => DD.on(kok, `dil-${alan}`, v => {
    if (H().yakinda.includes(v)) { DD.toast(`**${secAd(H().dil[alan], v)}** yakında`, {ikon: 'bilgi'}); DD.tazele(); return; }
    ayarYaz('dil', {[alan]: v}); DD.tazele(); DD.toast(`${baslik}: **${kisaAd(secAd(H().dil[alan], v))}**`, {tur: 'basari'});
  }))];

  // ---------- Bağlı uygulamalar (K6) ----------
  const saglikIzin = () => ({...Object.fromEntries(H().saglikIzinleri.map(x => [x.id, x.acik])), ...ayar('bagli').izin});
  const bagli = () => {
    const b = bagliDurum(), a = ayar('bagli'), son = a.sonEsitleme, es = !!izinler().esitle, n = Object.values(saglikIzin()).filter(Boolean).length;
    const durumAlt = (acik, s) => (acik ? `Bağlı · son eşitleme ${s || 'az önce'}` : 'Bağlı değil');
    return DD.gruplar([
      {baslik: 'Dada uygulamaları', html: `<div class="dd-yigin-12">${DD.p('**Profilin ve hedefin** bağladığın uygulamalarla eşitlenir. Sağlık verilerin eşitlenmez.', {ton: 'ikincil'})}${DD.satirlar([DD.toggle({ad: 'bagli-gastro', ikon: 'utensils', etiket: 'Dada Gastro', alt: durumAlt(b.gastro, son.gastro), secili: !!b.gastro}), DD.toggle({ad: 'bagli-fit', ikon: 'dumbbell', etiket: 'Dada Fit', alt: durumAlt(b.fit, son.fit), secili: !!b.fit})])}${DD.maddeler([['user', 'Eşitlenen: profilin', 'Ad, fotoğraf ve kullanıcı adı'], ['hedef', 'Eşitlenen: hedefin', 'Hedef, hedef kilo ve günlük kalori']])}</div>`},
      {baslik: 'Sağlık uygulaması', html: `<div class="dd-yigin-12">${DD.satirlar([DD.toggle({ad: 'saglik-esitle', ikon: 'heart-pulse', etiket: 'Apple Health / Health Connect', alt: durumAlt(es, son.saglik), secili: es}), ...(es ? [{ikon: 'sliders', baslik: 'Verilen izinler', alt: `${n} izin açık · her biri ayrı kapatılabilir`, veri: {eylem: 'saglik-izin'}}, {ikon: 'arrows-rotate', baslik: 'Eşitleme sıklığı', deger: secAd(H().siklik, a.siklik), veri: {eylem: 'siklik'}}].map(DD.satir) : [])])}${es ? DD.btn({metin: 'Şimdi eşitle', ikon: 'arrows-rotate', tur: 'secondary', tam: true, veri: {eylem: 'esitle'}}) : DD.veriYok('Bağlanınca **hangi verinin** okunacağını tek tek seçersin.')}</div>`},
      {baslik: 'Hiçbir koşulda gitmeyen', html: `<div class="dd-yigin-12">${DD.maddeler(H().esitlenmeyen)}${DD.gizlilikBant('Diyetisyeninin bu veriyi görmesi **ayrı bir karardır**; Veri izinlerim’den yönetilir.')}${DD.satirlar([{ikon: 'shield-halved', baslik: 'Veri izinlerim', alt: 'Diyetisyenle paylaşım ve açık rıza', git: '#/veri-izinleri'}])}</div>`}
    ]);
  };
  const izinSheet = () => {
    const i = saglikIzin();
    DD.sheet({
      baslik: 'Verilen izinler',
      html: `<div class="dd-yigin">${DD.p('Gelen veriler **bu cihazdaki** sağlık uygulamasından okunur; tek çıkış izni su ve enerji toplamıdır.')}${DD.satirlar(H().saglikIzinleri.map(x => DD.toggle({ad: `si-${x.id}`, ikon: x.yon === 'giden' ? 'arrow-up-from-bracket' : 'arrow-down', etiket: x.ad, alt: x.alt, secili: i[x.id]})))}</div>`,
      kapaninca: () => DD.tazele(),
      sonra: d => { const c = H().saglikIzinleri.map(x => DD.on(d, `si-${x.id}`, v => { ayarYaz('bagli', {izin: {...saglikIzin(), [x.id]: v}}); DD.toast(`**${x.ad}** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'heart-pulse', yerine: true}); })); return () => c.forEach(f => f()); }
    });
  };
  const bagliBagla = kok => [
    ...[['bagli-gastro', 'gastro', 'Dada Gastro'], ['bagli-fit', 'fit', 'Dada Fit']].map(([ad, k, m]) => DD.on(kok, ad, v => {
      DD.durum.yaz('bagli-uygulamalar', {...bagliDurum(), [k]: v});
      if (v) ayarYaz('bagli', {sonEsitleme: {...ayar('bagli').sonEsitleme, [k]: `bugün ${noktali(DDV.bugun.simdi)}`}});
      DD.tazele(); DD.toast(`**${m}** ${v ? 'bağlandı' : 'bağlantısı kapatıldı'}`, {ikon: 'arrows-rotate'});
    })),
    DD.on(kok, 'saglik-esitle', v => { DD.durum.yaz('veri-izinleri', {...izinler(), esitle: v}); DD.tazele(); DD.toast(`**Sağlık eşitlemesi** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: 'heart-pulse'}); }),
    DD.eylem(kok, 'saglik-izin', izinSheet),
    DD.eylem(kok, 'siklik', () => sheetSec('Eşitleme sıklığı', H().siklik, ayar('bagli').siklik, v => { ayarYaz('bagli', {siklik: v}); DD.tazele(); DD.toast(`Eşitleme: **${secAd(H().siklik, v).toLocaleLowerCase('tr')}**`, {tur: 'basari'}); })),
    DD.eylem(kok, 'esitle', el => DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 3).then(() => {
      const b = bagliDurum(), s = `bugün ${noktali(DDV.bugun.simdi)}`;
      ayarYaz('bagli', {sonEsitleme: {...ayar('bagli').sonEsitleme, saglik: s, ...(b.gastro ? {gastro: s} : {}), ...(b.fit ? {fit: s} : {})}});
      DD.tazele(); DD.toast('Bağlantıların **eşitlendi**', {tur: 'basari'});
    }))
  ];

  // ---------- Veri ve hesap yönetimi ----------
  const sayim = id => {
    if (DD.yeniHesap()) return id === 'profil' ? 1 : 0;
    return {
      profil: 1,
      olcum: DDV.saglik.seriler.kilo.aylik.length + DD.durum.oku('saglik-olcumler', []).length,
      ogun: (window.DDKayit?.liste() ?? DDV.ogunKayitlari ?? []).length,
      tahlil: DDV.saglik.kanTahlilleri.length + DD.durum.oku('saglik-tahliller', []).filter(t => !DDV.saglik.kanTahlilleri.some(x => x.id === t.id)).length,
      mesaj: (Array.isArray(DDV.benimDiyetisyenim.sohbet) ? DDV.benimDiyetisyenim.sohbet : DDV.benimDiyetisyenim.sohbet?.mesajlar || []).length + DD.durum.oku('uzman-sohbet', []).length,
      esitleme: izinler().esitle ? gunFark('2026-09-04') : 0
    }[id];
  };
  const veri = () => {
    const v = ayar('veri'), p = kisi();
    return DD.gruplar([
      {html: DD.p('Verini **gör, indir, sil**. Hesabın tamamı için dondurma ve silme ayrı seçeneklerdir.', {ton: 'ikincil'})},
      {baslik: 'Tuttuğumuz veriler', html: `<div class="dd-yigin-12">${DD.satirlar(H().veriGruplari.map(g => { const n = sayim(g.id); return {ikon: g.ikon, baslik: g.ad, alt: n ? `${g.saklama} · ilk kayıt ${DD.tarihUzun(g.ilk)}` : 'Henüz kayıt yok', deger: DD.sayi(n), ok: false}; }))}${DD.veriYok('Hesabını silersen bu grupların tamamı **30 gün içinde** silinir; faturalar yasal süre boyunca saklanır.')}</div>`},
      {baslik: 'Verini indir', html: `<div class="dd-yigin-12">${DD.p('Planların, kayıtların ve ölçümlerin **makine okunur dosya** olarak hazırlanır; indirme bağlantısı e-postana gelir.', {ton: 'ikincil'})}${DD.btn({metin: 'Verilerimi indir', ikon: 'download', tur: 'secondary', tam: true, veri: {eylem: 'indir'}})}${v.sonIndirme ? DD.veriYok(`Son paket **${v.sonIndirme}** hazırlandı ve **${p.eposta}** adresine gönderildi; bağlantı 48 saat geçerli.`) : ''}</div>`},
      {baslik: 'Saklama ve erişim', satirlar: [
        {ikon: 'box-archive', baslik: 'Saklama', alt: 'Takip kayıtların', deger: secAd(H().saklamaSecenek, v.saklama), veri: {eylem: 'saklama'}},
        {ikon: 'user-lock', baslik: 'Rol bazlı erişim', alt: 'Yalnız izin verdiğin veri', deger: 'Açık', ok: false},
        {ikon: 'clock-rotate-left', baslik: 'Erişim kaydı', alt: 'Verine kimin ne zaman eriştiği', git: '#/veri-izinleri?gecmis=erisim'},
        {ikon: 'children', baslik: 'Yaş ve veli onayı', alt: '18 yaş altında veli onayı', deger: 'Uygulanıyor', ok: false}
      ]},
      {baslik: 'Düzelt ve sil', html: `<div class="dd-yigin-12">${v.silmeTalebi ? DD.bant({ton: 'uyari', baslik: 'Silme talebin alındı', metin: `Takip verilerinin silme talebi **${DD.tarihUzun(v.silmeTalebi)}** tarihinde alındı; 30 gün içinde geri alabilirsin.`, eylem: {metin: 'Talebi geri al', veri: {eylem: 'sil-geri'}}}) : ''}${DD.satirlar([
        {ikon: 'pen', baslik: 'Kaydı düzelt', alt: 'Yanlış girdiğin öğün kaydını düzenle', git: '#/tabaklarim'},
        !v.silmeTalebi && {ikon: 'trash', baslik: 'Takip verilerimi sil', alt: 'Öğün, su ve ölçüm kayıtların; hesabın kalır', veri: {eylem: 'takip-sil'}, yikici: true},
        {ikon: 'snowflake', baslik: 'Hesabı dondur', alt: 'Ara ver, verilerin kalsın', git: '#/ayarlar/dondur'},
        {ikon: 'user-slash', baslik: 'Hesabımı sil', alt: 'Hesabın tamamı 30 gün sonra silinir', git: '#/ayarlar/sil'}
      ].filter(Boolean))}</div>`}
    ]);
  };
  const veriBagla = kok => [
    DD.eylem(kok, 'indir', el => DD.mesgul(el, DD.azHareket() ? 0 : DD.TK.motion.reveal * 4).then(() => { ayarYaz('veri', {sonIndirme: `bugün ${noktali(DDV.bugun.simdi)}`}); DD.tazele(); DD.toast(`Veri paketin hazır; bağlantı **${kisi().eposta}** adresine gönderildi`, {tur: 'basari'}); })),
    DD.eylem(kok, 'saklama', () => sheetSec('Takip verisi saklama', H().saklamaSecenek, ayar('veri').saklama, v => { ayarYaz('veri', {saklama: v}); DD.tazele(); DD.toast(`Saklama süresi: **${secAd(H().saklamaSecenek, v).toLocaleLowerCase('tr')}**`, {tur: 'basari'}); })),
    DD.eylem(kok, 'takip-sil', () => DD.dialog({baslik: 'Takip verilerin silinsin mi?', metin: 'Öğün, su ve ölçüm kayıtların **30 gün sonra** kalıcı olarak silinir. Hesabın ve planın kalır.', eylem: 'Silme talebi oluştur', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; ayarYaz('veri', {silmeTalebi: DD.bugunIso()}); DD.tazele(); DD.toast('Silme talebin **alındı**', {tur: 'uyari'}); })),
    DD.eylem(kok, 'sil-geri', () => { ayarYaz('veri', {silmeTalebi: null}); DD.tazele(); DD.toast('Silme talebin **geri alındı**', {tur: 'basari'}); })
  ];

  // ---------- Hesabı dondur (Gastro dondur bölümü) ----------
  const dondur = ctx => {
    const d = ayar('hesap').dondurma, r = DD.yeniHesap() ? null : DDV.benimDiyetisyenim.sonrakiRandevu;
    if (d) return DD.gruplar([{html: `<div class="dd-yigin-12">${DD.bant({ton: 'bilgi', baslik: 'Hesabın donduruldu', metin: `**${secAd(H().dondurmaSure, d.sure)}** süreyle, ${DD.tarihUzun(d.tarih)} tarihinden beri. Giriş yaptığında kendiliğinden açılır.`})}${DD.btn({metin: 'Dondurmayı kaldır', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'dondur-kaldir'}})}</div>`}]);
    return DD.gruplar([
      {html: `<div class="dd-yigin">${DD.p('Bir süre ara vermek istersen hesabını **kapatmadan dondurabilirsin**. Verilerin silinmez.', {ton: 'ikincil'})}${DD.maddeler([
        ['eye-slash', 'Profilin ve diyetisyen paylaşımın gizlenir', 'Planların, ölçümlerin ve rozetlerin yerinde kalır'],
        ['calendar-xmark', r ? `${r.tarihMetin} ${noktali(r.saat)} randevun iptal edilir` : 'Yaklaşan randevuların iptal edilir', 'Görüşme haklarının süresi işlemeye devam eder'],
        ['bell-slash', 'Bildirimler ve hatırlatmalar durur', 'Giriş yaptığın anda hesabın açılır']
      ])}</div>`},
      {baslik: 'Dondurma süresi', html: radyolar('dondur-sure', 'Dondurma süresi', H().dondurmaSure, ctx.dondurSure || '2h')},
      {html: `<div class="dd-yigin">${DD.checkbox({ad: 'dondur-onay', etiket: 'Profilimin gizleneceğini ve randevularımın iptal edileceğini anladım'})}${DD.btn({metin: 'Hesabı dondur', ikon: 'snowflake', tam: true, pasif: true, veri: {eylem: 'dondur'}})}${DD.btn({metin: 'Kalıcı olarak silmek istiyorum', tur: 'text', tam: true, yerine: '#/ayarlar/sil'})}</div>`}
    ]);
  };
  const dondurBagla = (kok, ctx) => [
    DD.on(kok, 'dondur-sure', v => { ctx.dondurSure = v; }),
    DD.on(kok, 'dondur-onay', v => { const b = kok.querySelector('[data-eylem="dondur"]'); if (b) b.disabled = !v; }),
    DD.eylem(kok, 'dondur', () => DD.dialog({baslik: 'Hesabın dondurulsun mu?', metin: `Hesabın **${secAd(H().dondurmaSure, ctx.dondurSure || '2h')}** süreyle dondurulur. Verilerin silinmez.`, eylem: 'Dondur', iptal: 'Vazgeç'}).then(ok => { if (!ok) return; ayarYaz('hesap', {dondurma: {sure: ctx.dondurSure || '2h', tarih: DD.bugunIso()}}); DD.tazele(); DD.toast('Hesabın **donduruldu**', {tur: 'uyari'}); })),
    DD.eylem(kok, 'dondur-kaldir', () => { ayarYaz('hesap', {dondurma: null}); DD.tazele(); DD.toast('Hesabın **yeniden açıldı**', {tur: 'basari'}); })
  ];

  // ---------- Hesabımı sil (Gastro sil bölümü) ----------
  const sil = ctx => {
    const seans = DD.yeniHesap() ? 0 : DDV.benimDiyetisyenim.paket.kalanSeans, neden = ctx.neden || H().ayrilmaNedeni[0][0];
    return DD.gruplar([
      {html: `<div class="dd-yigin">${DD.p('Hesabını kalıcı olarak kapatır. Ara vermek istiyorsan **dondurma** geri alınabilir bir seçenektir.', {ton: 'ikincil'})}${DD.bant({ton: 'hata', baslik: 'Bu işlem geri alınamaz', metin: '**30 gün sonunda** planların, ölçümlerin, öğün kayıtların ve rozetlerin kalıcı olarak silinir.'})}${DD.maddeler([
        ['rotate-left', 'İlk 30 gün içinde dönebilirsin', 'Giriş yaparsan silme iptal edilir'],
        ['ticket', seans ? `Kalan ${seans} görüşme hakkın kapanır` : 'Kalan görüşme hakların kapanır', 'İade talebini silmeden önce açabilirsin'],
        ['file-invoice', 'Faturaların yasal süre boyunca saklanır', 'Profiline bağlı kalmaz']
      ])}</div>`},
      {satirlar: [{ikon: 'download', baslik: 'Önce verilerini indir', alt: 'Planların ve kayıtların tek dosyada', git: '#/ayarlar/veri'}, {ikon: 'snowflake', baslik: 'Yerine hesabını dondur', alt: 'Verilerin silinmez', git: '#/ayarlar/dondur'}]},
      {html: `<div class="dd-yigin">${DD.secAlan({ad: 'neden', etiket: 'Ayrılma nedenin', secenekler: H().ayrilmaNedeni, deger: neden})}${DD.checkbox({ad: 'sil-onay', etiket: 'Hesabımın ve takip verilerimin 30 gün sonra geri alınamaz şekilde silineceğini anladım'})}${DD.uzunBas({ad: 'hesap-sil', metin: 'Hesabımı sil', ikon: 'trash', tur: 'yikici', pasif: true, yardim: 'Silmek için basılı tut', onayBaslik: 'Hesabın silinsin mi?', onayMetin: '30 gün içinde giriş yapmazsan hesabın kalıcı olarak silinir.', onayEylem: 'Hesabımı sil'})}${DD.p('Kararsızsan silmek yerine **bildirimleri kapatabilir** ya da hesabını dondurabilirsin.', {ton: 'ikincil', meta: true})}</div>`}
    ]);
  };
  const silBagla = (kok, ctx) => {
    const onay = ev => { if (ev.detail?.ad !== 'hesap-sil') return; DD.toast('Silme talebin alındı; **30 gün** içinde giriş yaparsan hesabın geri gelir', {tur: 'uyari'}); setTimeout(DD.cikis, DD.azHareket() ? 0 : DD.TK.motion.reveal * 5); };
    kok.addEventListener('dd-onay', onay);
    return [
      () => kok.removeEventListener('dd-onay', onay),
      DD.on(kok, 'sil-onay', v => { const b = kok.querySelector('[data-uzunbas]'); if (b) b.disabled = !v; }),
      DD.on(kok, 'neden', v => { ctx.neden = v; })
    ];
  };

  // ---------- Ekran ----------
  const CIZ = {profil, gizlilik, bildirim, guvenlik, dil, bagli, veri, dondur, sil};
  const BAGLA = {profil: profilBagla, gizlilik: gizlilikBagla, bildirim: bildirimBagla, guvenlik: guvenlikBagla, dil: dilBagla, bagli: bagliBagla, veri: veriBagla, dondur: dondurBagla, sil: silBagla};
  let hataGosterildi = false;

  DD.ekran('ayarlar', {
    tur: 'alt',
    // Doğrudan açılan alt bölümün geri rotası hub'dır; hub'ınki profil.
    get ust() { return /^#\/ayarlar\/./.test(location.hash) ? '#/ayarlar' : '#/profil'; },
    baslik: ctx => BOLUM[ctx.param.bolum] || 'Hesap ayarları',
    yenile: true,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() || ctx.param.bolum ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      const b = ctx.param.bolum;
      if (!b) return hub();
      if (YONLEN[b]) return DD.iskelet('liste');
      return CIZ[b] ? CIZ[b](ctx) : DD.bos({tam: true, ikon: 'bilgi', baslik: 'Bu bölüm bulunamadı', metin: 'Aradığın ayar **Hesap ayarları** altında olabilir.', eylem: {metin: 'Hesap ayarları', yerine: '#/ayarlar'}});
    },
    altBar: ctx => (ctx.param.bolum === 'profil' ? DD.altEylem({dugmeler: [{metin: 'Değişiklikleri kaydet', ikon: 'onay', tam: true, veri: {eylem: 'profil-kaydet'}}]}) : ''),
    sonra: (kok, ctx) => {
      const b = ctx.param.bolum;
      if (YONLEN[b]) { setTimeout(() => DD.yerine(YONLEN[b])); return null; }
      const c = b ? (BAGLA[b]?.(kok, ctx) || []) : hubBagla(kok);
      return () => c.forEach(f => f?.());
    }
  });
})();
