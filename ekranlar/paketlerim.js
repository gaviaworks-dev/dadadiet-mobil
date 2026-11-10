/* Paketlerim (#/paketlerim). Web karşılığı: hesabim/paketlerim (uye-gastro-paketlerim.js, uye-gastro-ortak.js paket kartı) ve odeme sayfasının paket adımı.
 * Gastro kalıbı: DD.gruplar (tek zemin, başlıklı kartsız gruplar, grup arası 24): Üyeliğin · Kademeler · Diyetisyen paketin · Geçmiş paketler · Ödemeler.
 * Üyelik kademeleri ve abonelik DDV.uye; diyetisyen paketi DDV.benimDiyetisyenim.paket (Uzmanım ile aynı), paket tanımı DDV.diyetisyenler[].paketler.
 * Durum (Ödemelerim ile ortak): abonelik {kademe, baslangic, donemBas, donemBit, yenileme, kart, iptal?} (varsayılan DDV.uye.abonelik, yeni hesapta {kademe:'ucretsiz'}),
 *   odeme-kartlari (kayıtlı kartlar), odeme-ekleri [ödeme kaydı] (yükseltme farkı ve yeni dönem tahsilatı buraya yazılır).
 * #/paketlerim?hal=bos ücretsiz ve paketsiz hal, ?hal=hata bağlantı hatası. */
(() => {
  const U = () => DDV.uye;
  const B = () => DDV.benimDiyetisyenim;
  const isoMs = s => { const [y, a, g] = s.split('-').map(Number); return Date.UTC(y, a - 1, g); };
  const gunFark = (a, b) => Math.round((isoMs(b) - isoMs(a)) / 864e5);
  const gunEkle = (s, n) => new Date(isoMs(s) + n * 864e5).toISOString().slice(0, 10);
  let bosHal = false;
  const yeni = () => DD.yeniHesap() || bosHal;
  const abonelik = () => (bosHal ? {kademe: 'ucretsiz'} : DD.durum.oku('abonelik', DD.yeniHesap() ? {kademe: 'ucretsiz'} : U().abonelik));
  const abonelikYaz = a => DD.durum.yaz('abonelik', a);
  const kademe = kod => U().kademeler.find(k => k.kod === kod);
  const kartlar = () => DD.durum.oku('odeme-kartlari', DD.yeniHesap() ? [] : U().kartlar);
  const kartAd = id => { const k = kartlar().find(x => x.id === id) || kartlar().find(x => x.varsayilan); return k ? `${k.marka} •••• ${k.son}` : null; };
  const odemeEkle = o => DD.durum.yaz('odeme-ekleri', [{id: `e${Date.now()}`, no: `DD-2026-00${4500 + DD.durum.oku('odeme-ekleri', []).length}`, tarih: DD.bugunIso(), durum: 'odendi', ...o}, ...DD.durum.oku('odeme-ekleri', [])]);
  const tl = n => DD.paraTL(n);

  // ---------- Üyelik kartı ----------
  const uyelikKart = () => {
    const a = abonelik(), k = kademe(a.kademe), ucretsiz = a.kademe === 'ucretsiz', ust = U().kademeler[U().kademeler.indexOf(k) + 1];
    const durum = ucretsiz ? DD.durumRozet({metin: 'Süresiz', ton: 'notr', ikon: 'infinity'}) : a.iptal ? DD.durumRozet({metin: 'Dönem sonunda bitiyor', ton: 'uyari', ikon: 'hourglass-half'}) : DD.durumRozet({kod: 'aktif'});
    const kunye = ucretsiz
      ? [{ikon: 'tag', etiket: 'Ücret', deger: '0 TL'}, {ikon: 'infinity', etiket: 'Süre', deger: 'Süresi dolmaz'}]
      : [
        {ikon: 'tag', etiket: 'Ücret', deger: `${tl(k.fiyat)} / ay`},
        {ikon: 'takvim', etiket: 'Dönem', deger: `${DD.tarihKisa(a.donemBas)} – ${DD.tarihKisa(a.donemBit)}`},
        a.iptal ? {ikon: 'flag-checkered', etiket: 'Bitiş', deger: DD.tarihUzun(a.donemBit)} : {ikon: 'credit-card', etiket: 'Sonraki tahsilat', deger: `${DD.tarihKisa(a.yenileme)} · ${kartAd(a.kart) || 'kart yok'}`},
        {ikon: 'clock-rotate-left', etiket: 'Üyelik başlangıcı', deger: DD.tarihUzun(a.baslangic)}
      ];
    const eylem = ucretsiz
      ? DD.btn({metin: 'Pro’ya geç', ikon: 'bolt', tam: true, veri: {eylem: 'gec', id: 'pro'}})
      : a.iptal
        ? DD.btn({metin: 'İptali geri al', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'iptal-geri'}})
        : `${ust ? DD.btn({metin: `${ust.ad}’a yükselt`, ikon: ust.ikon, tam: true, veri: {eylem: 'gec', id: ust.kod}}) : ''}${DD.btn({metin: 'Üyeliği iptal et', tur: 'text', tam: true, veri: {eylem: 'iptal'}})}`;
    const not = a.iptal ? DD.bant({ton: 'uyari', metin: `Üyeliğin **${DD.tarihUzun(a.donemBit)}** tarihinde biter, sonra Ücretsiz kademeye dönersin. Kayıtların, ölçümlerin ve rozetlerin **silinmez**.`}) : '';
    return `<div class="dd-yigin">${DD.satir({sol: DD.ikonKutu({ikon: k.ikon, ton: 'primary', boyut: 'lg'}), baslik: k.tamAd, alt: ucretsiz ? 'Ücretsiz kademe' : 'Aylık üyelik', sag: durum})}${DD.p(k.ozet.replace(/^([^.:]+)/, '**$1**'), {ton: 'ikincil'})}${DD.kunye(kunye)}${not}<div class="dd-yigin-8">${eylem}</div></div>`;
  };

  // ---------- Kademeler ----------
  const kademePanel = kod => {
    const k = kademe(kod), a = abonelik(), sira = U().kademeler.indexOf(k), simdi = U().kademeler.findIndex(x => x.kod === a.kademe);
    const miras = sira > 0 ? DD.p(`**${U().kademeler[sira - 1].ad}** kademesinin tamamı, üstüne:`, {ton: 'ikincil', meta: true}) : '';
    const dugme = sira === simdi ? `<div class="dd-sira">${DD.durumRozet({metin: 'Mevcut paketin', ton: 'basari', ikon: 'onay'})}</div>`
      : sira > simdi ? DD.btn({metin: `${k.ad}’a geç`, ikon: k.ikon, tam: true, veri: {eylem: 'gec', id: k.kod}})
        : DD.btn({metin: `${k.ad} kademesine dön`, tur: 'secondary', tam: true, veri: {eylem: 'dusur', id: k.kod}});
    return `<div class="dd-yigin">${DD.satir({sol: DD.ikonKutu({ikon: k.ikon, ton: sira === simdi ? 'primary' : 'notr', boyut: 'lg'}), baslik: k.tamAd, alt: k.fiyat ? `${tl(k.fiyat)} / ay` : 'Her zaman 0 TL'})}${DD.p(k.ozet.replace(/^([^.:]+)/, '**$1**'))}${miras}<div class="dd-yigin-8">${k.ozellikler.map(o => DD.madde({metin: o})).join('')}</div>${dugme}</div>`;
  };

  // ---------- Diyetisyen paketi ----------
  const diyetisyenPaket = () => {
    if (yeni() || !DDV.kullanici.diyetisyen) return DD.bos({ikon: 'box-open', baslik: 'Aktif görüşme paketin yok', metin: 'Bir diyetisyenle çalışmaya başladığında **görüşme hakların** burada görünür.', eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', tur: 'secondary', git: '#/uzman/bul'}});
    const d = DDV.diyetisyenler.find(x => x.slug === B().diyetisyen), p = B().paket, t = d.paketler.find(x => x.id === p.id), biten = t.seans - p.kalanSeans;
    const odeme = U().odemeler.find(o => o.tur === 'paket' && o.diyetisyen === d.slug);
    return `<div class="dd-yigin">${DD.diyetisyenKart(d, {tur: 'satir'})}${DD.ilerleme({n: biten, hedef: t.seans, etiket: `${biten} görüşme tamamlandı`, deger: `${p.kalanSeans} kaldı`})}${DD.kunye([
      {ikon: 'box-open', etiket: 'Paket', deger: `${t.ad} · ${t.seans} görüşme`},
      odeme && {ikon: 'takvim', etiket: 'Alınma', deger: DD.tarihUzun(odeme.tarih)},
      {ikon: 'flag-checkered', etiket: 'Bitiş', deger: DD.tarihUzun(p.bitis)},
      odeme && {ikon: 'tag', etiket: 'Ödenen', deger: tl(odeme.tutar)}
    ].filter(Boolean))}<div class="dd-yigin-8">${t.kapsam.map(m => DD.madde({metin: m})).join('')}</div><div class="dd-ikili">${DD.btn({metin: 'Uzmanım', tur: 'secondary', git: '#/uzman'})}${DD.btn({metin: 'Paketi yenile', ikon: 'yenile', git: `#/uzman/profil/${d.slug}?paket=${p.id}`})}</div></div>`;
  };
  const gecmisPaketler = () => (yeni() ? [] : U().gecmisPaketler).map(x => { const d = DDV.diyetisyenler.find(y => y.slug === x.diyetisyen); return {ikon: 'box-open', baslik: `${x.ad} · ${d.kisaAd}`, alt: `${DD.tarihUzun(x.alinma)} · ${x.seans} görüşme kullanıldı`, git: `#/uzman/profil/${d.slug}`}; });

  // ---------- Eylemler ----------
  const gec = async kod => {
    const a = abonelik(), k = kademe(kod), simdi = kademe(a.kademe), kart = kartAd(a.kart);
    if (!kart) { DD.toast('Önce bir **ödeme yöntemi** ekle', {ikon: 'credit-card', eylem: 'Ekle', onEylem: () => DD.git('#/odemelerim?kart=ekle')}); return; }
    if (a.kademe === 'ucretsiz') {
      if (!await DD.dialog({baslik: `${k.ad}’ya geç`, metin: `**${k.tamAd}** aylık **${tl(k.fiyat)}**. İlk tahsilat bugün **${kart}** kartından alınır; istediğin zaman iptal edebilirsin.`, eylem: 'Onayla ve geç', iptal: 'Vazgeç'})) return;
      const bas = DD.bugunIso(), bit = gunEkle(bas, 29);
      abonelikYaz({kademe: kod, baslangic: bas, donemBas: bas, donemBit: bit, yenileme: gunEkle(bit, 1), kart: kartlar().find(x => x.varsayilan)?.id || kartlar()[0].id});
      odemeEkle({tur: 'abonelik', baslik: `${k.tamAd} · ilk dönem`, tutar: k.fiyat, kart: kartlar().find(x => x.varsayilan)?.id});
    } else {
      const kalan = Math.max(1, gunFark(DD.bugunIso(), a.donemBit) + 1), fark = Math.round((k.fiyat - simdi.fiyat) * kalan / 30);
      if (!await DD.dialog({baslik: `${k.ad}’a yükselt`, metin: `**${k.tamAd}** aylık **${tl(k.fiyat)}**. Bu dönemin kalan **${kalan} günü** için **${tl(fark)}** fark bugün **${kart}** kartından alınır; sonraki tahsilat ${DD.tarihUzun(a.yenileme)}.`, eylem: 'Yükselt', iptal: 'Vazgeç'})) return;
      abonelikYaz({...a, kademe: kod, iptal: false});
      odemeEkle({tur: 'abonelik', baslik: `${k.tamAd} · yükseltme farkı`, tutar: fark, kart: a.kart});
    }
    DD.tazele();
    DD.toast(`**${k.tamAd}** etkin`, {tur: 'basari', ikon: k.ikon});
  };
  const dusur = async kod => {
    const a = abonelik(), k = kademe(kod);
    if (kod === 'ucretsiz') return iptal();
    if (!await DD.dialog({baslik: `${k.ad} kademesine dön`, metin: `**${DD.tarihUzun(a.yenileme)}** tahsilatından itibaren **${tl(k.fiyat)} / ay** ödersin. Bu dönemin sonuna kadar mevcut özelliklerin açık kalır.`, eylem: 'Kademeyi değiştir', iptal: 'Vazgeç'})) return;
    const once = a;
    abonelikYaz({...a, kademe: kod});
    DD.tazele();
    DD.toast(`Kademen **${k.ad}** oldu`, {eylem: 'Geri al', onEylem: () => { abonelikYaz(once); DD.tazele(); }});
  };
  const iptal = async () => {
    const a = abonelik(), k = kademe(a.kademe);
    if (!await DD.dialog({baslik: 'Üyeliği iptal et', metin: `**${k.tamAd}** yenilenmez; erişimin **${DD.tarihUzun(a.donemBit)}** tarihine kadar sürer. Gelişmiş programlar ve kişisel plan sonra kapanır, **kayıtların silinmez**.`, eylem: 'İptal et', iptal: 'Vazgeç', yikici: true})) return;
    abonelikYaz({...a, iptal: true});
    DD.tazele();
    DD.toast('İptal talebin alındı', {eylem: 'Geri al', onEylem: () => { abonelikYaz({...abonelik(), iptal: false}); DD.tazele(); }});
  };

  let hataGosterildi = false;
  DD.ekran('paketlerim', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Paketlerim',
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      bosHal = ctx.sorgu.hal === 'bos';
      const s = ctx.kademe || abonelik().kademe, gp = gecmisPaketler();
      return DD.gruplar([
        {baslik: 'Üyeliğin', html: uyelikKart()},
        {baslik: 'Kademeler', html: `<div class="dd-yigin">${DD.segment({ad: 'kademe', etiket: 'Kademeler', kaydir: true, secili: s, ogeler: U().kademeler.map(k => ({ad: k.ad, deger: k.kod}))})}<div data-yuva="kademe">${kademePanel(s)}</div></div>`},
        {baslik: 'Diyetisyen paketin', html: diyetisyenPaket()},
        gp.length && {baslik: 'Geçmiş paketler', satirlar: gp},
        {baslik: 'Ödemeler', satirlar: [{ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilatlar, faturalar ve kartlar', git: '#/odemelerim'}]},
        {html: DD.bant({ton: 'bilgi', baslik: 'Diyetisyen paketleri üyeliğe dahil değildir', metin: 'Görüşme paketinin bedelini **diyetisyene ayrı** ödersin; Pro ise gelişmiş program ve plan katmanını açar.'})}
      ]);
    },
    sonra: (kok, ctx) => {
      const c = [
        DD.on(kok, 'kademe', v => { ctx.kademe = v; kok.querySelector('[data-yuva="kademe"]').innerHTML = kademePanel(v); }),
        DD.eylem(kok, 'gec', el => gec(el.dataset.id)),
        DD.eylem(kok, 'dusur', el => dusur(el.dataset.id)),
        DD.eylem(kok, 'iptal', iptal),
        DD.eylem(kok, 'iptal-geri', () => { abonelikYaz({...abonelik(), iptal: false}); DD.tazele(); DD.toast('Üyeliğin **yenilenmeye devam** edecek', {tur: 'basari'}); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
