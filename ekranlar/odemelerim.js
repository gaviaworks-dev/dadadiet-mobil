/* Ödemelerim (#/odemelerim). Web karşılığı: hesabim/odemelerim + odeme (uye-gastro-odemelerim.js, uye-gastro-odeme.js, uye-gastro-ortak.js).
 * Gastro kalıbı (profil.js #odemeler: Abonelik Ödemeleri · Kayıtlı Kartlar · İade Talepleri): sıradaki tahsilat grubu, segment Geçmiş · Kartlar · İadeler
 *   (?sekme=gecmis|kartlar|iadeler), kartsız satırlar, fatura bilgileri grubu.
 * Kayıtlar DDV.uye (odemeler, kartlar, faturaBilgi, abonelik). Gerçek kart verisi istenmez: kart ekleme ödeme kuruluşunun güvenli sayfasına gider, kart maskeli saklanır.
 * Durum (Paketlerim ile ortak): abonelik, odeme-kartlari [{id, marka, ikon, son, skt, varsayilan}] (varsayılan DDV.uye.kartlar, yeni hesapta []),
 *   odeme-ekleri [ödeme kaydı] (bu cihazda yapılan tahsilatlar, en yeni üstte), fatura-bilgi {tip, ad, eposta, telefon, il, ilce, adres, unvan, vergiDairesi, vkn}.
 * #/odemelerim?kart=ekle Kartlar sekmesinde kart ekleme sheet'ini açar, ?hal=bos, ?hal=hata. */
(() => {
  const U = () => DDV.uye;
  let bosHal = false;
  const yeni = () => DD.yeniHesap() || bosHal;
  const abonelik = () => (bosHal ? {kademe: 'ucretsiz'} : DD.durum.oku('abonelik', DD.yeniHesap() ? {kademe: 'ucretsiz'} : U().abonelik));
  const kartlar = () => (bosHal ? [] : DD.durum.oku('odeme-kartlari', DD.yeniHesap() ? [] : U().kartlar));
  const kartYaz = l => DD.durum.yaz('odeme-kartlari', l);
  const odemeler = () => (bosHal ? [] : [...DD.durum.oku('odeme-ekleri', []), ...(DD.yeniHesap() ? [] : U().odemeler)]);
  const fatura = () => DD.durum.oku('fatura-bilgi', DD.yeniHesap() ? {tip: 'bireysel', ad: `${DDV.kullanici.ad} ${DDV.kullanici.soyad}`, eposta: DDV.kullanici.eposta} : U().faturaBilgi);
  const kademe = kod => U().kademeler.find(k => k.kod === kod);
  const kartAd = k => (k ? `${k.marka} •••• ${k.son}` : 'Kayıtlı kart yok');
  const kartBul = id => kartlar().find(k => k.id === id);
  const tutar = n => (n < 0 ? `−${DD.paraTL(-n)}` : DD.paraTL(n));
  const sekme = ctx => ctx.sekme || (ctx.sorgu.kart === 'ekle' ? 'kartlar' : ['gecmis', 'kartlar', 'iadeler'].includes(ctx.sorgu.sekme) ? ctx.sorgu.sekme : 'gecmis');
  const kurus = n => `${n < 0 ? '−' : ''}${DD.ondalik(Math.abs(n), 2)} TL`;
  const DURUM = {odendi: {metin: 'Ödendi', ton: 'basari', ikon: 'onay'}, 'iade-edildi': {metin: 'İade edildi', ton: 'notr', ikon: 'rotate-left'}, 'iade-surecinde': {metin: 'İade sürecinde', ton: 'uyari', ikon: 'hourglass-half'}};
  const TUR = {abonelik: ['bolt', 'Üyelik'], paket: ['box-open', 'Diyetisyen'], tek: ['user-doctor', 'Diyetisyen'], iade: ['rotate-left', 'İade']};

  // ---------- Sıradaki tahsilat ----------
  const siradaki = () => {
    const a = abonelik();
    if (a.kademe === 'ucretsiz') return `<div class="dd-yigin-12">${DD.p('Ücretsiz kademedesin; **planlı bir tahsilatın yok**.', {ton: 'ikincil'})}${DD.btn({metin: 'Paketlere bak', tur: 'secondary', tam: true, git: '#/paketlerim'})}</div>`;
    const k = kademe(a.kademe), kart = kartBul(a.kart) || kartlar().find(x => x.varsayilan);
    if (a.iptal) return DD.bant({ton: 'uyari', ikon: 'hourglass-half', metin: `**${k.tamAd}** yenilenmeyecek; erişimin **${DD.tarihUzun(a.donemBit)}** tarihinde biter. Tahsilat yapılmaz.`});
    return `<div class="dd-yigin-12">${DD.satirlar([{ikon: 'takvim', baslik: k.tamAd, alt: `${DD.tarihUzun(a.yenileme)} · ${kartAd(kart)}`, deger: DD.paraTL(k.fiyat)}])}<div class="dd-ikili">${DD.btn({metin: 'Kartı değiştir', tur: 'secondary', veri: {eylem: 'yenileme-kart'}})}${DD.btn({metin: 'Üyeliğim', tur: 'tonal', git: '#/paketlerim'})}</div></div>`;
  };

  // ---------- Ödeme geçmişi ----------
  const odemeSatir = o => ({ikon: TUR[o.tur][0], baslik: o.baslik, alt: `${DD.tarihUzun(o.tarih)} · ${DURUM[o.durum].metin}`, deger: tutar(o.tutar), veri: {eylem: 'fatura', id: o.id}});
  const iadeMi = o => o.tur === 'iade' || o.durum !== 'odendi';
  const gecmisPanel = suz => {
    const tum = odemeler().filter(o => o.tur !== 'iade'), l = tum.filter(o => !suz || TUR[o.tur][1] === suz);
    if (!tum.length) return DD.bos({ikon: 'credit-card', baslik: 'Henüz ödemen yok', metin: 'Üyelik ya da diyetisyen paketi aldığında **ödemelerin ve faturaların** burada listelenir.', eylem: {metin: 'Paketlere bak', tur: 'secondary', git: '#/paketlerim'}});
    const yil = DD.bugunIso().slice(0, 4), buYil = odemeler().filter(o => o.tarih.startsWith(yil) && o.durum !== 'iade-surecinde');
    const ozet = DD.stat([{deger: DD.paraTL(buYil.reduce((t, o) => t + o.tutar, 0)), etiket: `${yil} net toplam`}, {deger: String(tum.length), etiket: 'Ödeme'}, {deger: String(odemeler().filter(o => o.tur === 'iade').length), etiket: 'İade'}], {yalin: true});
    const cip = DD.cipler({ad: 'odeme-suz', tur: 'tek', etiket: 'Ödeme türü süzgeci', secili: suz || '', ogeler: [{metin: 'Tümü', deger: '', sayi: tum.length}, ...['Üyelik', 'Diyetisyen'].map(t => ({metin: t, deger: t, sayi: tum.filter(o => TUR[o.tur][1] === t).length})).filter(x => x.sayi)]});
    return `<div class="dd-yigin">${ozet}${cip}${l.length ? DD.satirlar(l.map(odemeSatir)) : DD.p('Bu türde **ödeme yok**.', {ton: 'ikincil'})}${DD.p('Bir ödemeye dokun: **fatura ayrıntısı** açılır, indirebilirsin.', {ton: 'ikincil', meta: true})}</div>`;
  };
  const iadePanel = () => {
    const l = odemeler().filter(iadeMi);
    const talep = DD.satirlar([{ikon: 'rotate-left', baslik: 'İade ya da itiraz talebi', alt: 'Çözüm Merkezi’nde talep aç', git: `#/cozum-merkezi?yeni=1&konu=${encodeURIComponent('İptal ve iade')}`}]);
    const liste = l.length ? DD.satirlar(l.map(odemeSatir)) : DD.bos({ikon: 'rotate-left', baslik: 'İade kaydın yok', metin: 'İade ya da itiraz talebin olursa **sonucu ve tutarı** burada görünür.'});
    return `<div class="dd-yigin">${liste}${talep}${DD.p('İade tutarı **ödeme yaptığın karta** geri yansır; bankana göre birkaç iş günü sürebilir.', {ton: 'ikincil', meta: true})}</div>`;
  };
  const faturaSheet = id => {
    const o = odemeler().find(x => x.id === id), f = fatura(), brut = Math.abs(o.tutar), net = brut / 1.2, kart = kartBul(o.kart) || U().kartlar.find(k => k.id === o.kart);
    const d = o.diyetisyen && DDV.diyetisyenler.find(x => x.slug === o.diyetisyen);
    DD.sheet({
      baslik: o.tur === 'iade' ? 'İade belgesi' : 'Fatura',
      html: `<div class="dd-yigin"><div class="dd-ara"><span class="dd-t-meta dd-ton-ikincil">${DD.esc(o.no)}</span>${DD.durumRozet(DURUM[o.durum])}</div><h2 class="dd-t-section">${DD.esc(o.baslik)}</h2>${DD.kunye([
        {ikon: 'takvim', etiket: 'Tarih', deger: DD.tarihUzun(o.tarih)},
        d && {ikon: 'user-doctor', etiket: 'Hizmet', deger: d.kisaAd},
        {ikon: 'credit-card', etiket: 'Ödeme yöntemi', deger: kartAd(kart)},
        {ikon: 'receipt', etiket: 'KDV hariç', deger: kurus(net * Math.sign(o.tutar))},
        {ikon: 'percent', etiket: 'KDV (%20)', deger: kurus((brut - net) * Math.sign(o.tutar))},
        {ikon: 'tag', etiket: 'Toplam', deger: tutar(o.tutar)},
        {ikon: 'user', etiket: 'Alıcı', deger: f.tip === 'kurumsal' && f.unvan ? f.unvan : f.ad}
      ].filter(Boolean))}${DD.p('Fatura **e-arşiv** olarak kesilir ve e-posta adresine de gönderilir.', {ton: 'ikincil', meta: true})}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Sorun bildir', tur: 'secondary', git: `#/cozum-merkezi?yeni=1&konu=${encodeURIComponent(o.tur === 'iade' ? 'İptal ve iade' : 'Ödeme sorunu')}`, attrs: 'data-sheet-kapat'})}${DD.btn({metin: 'İndir', ikon: 'download', veri: {eylem: 'fatura-indir'}})}</div>`,
      sonra: s => DD.eylem(s, 'fatura-indir', el => DD.mesgul(el, DD.TK.motion.reveal * 2).then(() => DD.toast(`**${o.no}** faturası indirildi`, {tur: 'basari', ikon: 'download'})))
    });
  };

  // ---------- Kartlar ----------
  const kartPanel = () => {
    const l = kartlar();
    const liste = l.length ? DD.satirlar(l.map(k => ({ikon: 'credit-card', baslik: kartAd(k), alt: `Son kullanma ${k.skt}`, sag: k.varsayilan ? DD.durumRozet({metin: 'Varsayılan', ton: 'basari', ikon: 'onay'}) : '', veri: {eylem: 'kart', id: k.id}}))) : DD.p('Kayıtlı kartın yok. Üyelik ve paket ödemeleri için **bir kart ekleyebilirsin**.', {ton: 'ikincil'});
    return `<div class="dd-yigin-12">${liste}${DD.btn({metin: 'Kart ekle', ikon: 'ekle', tur: 'secondary', tam: true, veri: {eylem: 'kart-ekle'}})}${DD.gizlilikBant('Tam kart numarası **Dada Diet’te saklanmaz**; yalnız marka, son dört hane ve son kullanma tarihi görünür.')}</div>`;
  };
  const kartSheet = id => {
    const k = kartBul(id), a = abonelik();
    DD.sheet({
      baslik: kartAd(k),
      html: `<div class="dd-yigin">${DD.kunye([{ikon: 'credit-card', etiket: 'Kart', deger: k.marka}, {ikon: 'takvim', etiket: 'Son kullanma', deger: k.skt}, {ikon: 'onay', etiket: 'Durum', deger: k.varsayilan ? 'Varsayılan kart' : 'Kayıtlı'}])}${a.kart === k.id && a.kademe !== 'ucretsiz' ? DD.p('Bu kart **üyelik yenilemesinde** kullanılıyor.', {ton: 'ikincil', meta: true}) : ''}</div>`,
      altBar: `<div class="dd-yigin-8">${k.varsayilan ? '' : DD.btn({metin: 'Varsayılan yap', ikon: 'onay', tam: true, veri: {eylem: 'kart-varsayilan'}})}${DD.btn({metin: 'Kartı kaldır', tur: 'yikici', tam: true, veri: {eylem: 'kart-sil'}})}</div>`,
      sonra: s => {
        const c = [
          DD.eylem(s, 'kart-varsayilan', () => { kartYaz(kartlar().map(x => ({...x, varsayilan: x.id === id}))); s.kapat(); DD.tazele(); DD.toast(`**${kartAd(k)}** varsayılan kartın oldu`, {tur: 'basari', ikon: 'credit-card'}); }),
          DD.eylem(s, 'kart-sil', async () => {
            const kalan = kartlar().filter(x => x.id !== id), yenilemede = a.kart === id && a.kademe !== 'ucretsiz' && !a.iptal;
            if (yenilemede && !kalan.length) { DD.toast('Bu kart **üyelik yenilemesinde** kullanılıyor; önce başka bir kart ekle', {tur: 'uyari', yerine: true}); return; }
            if (!await DD.dialog({baslik: 'Kartı kaldır', metin: `**${kartAd(k)}** kayıtlı kartlarından kaldırılır.${yenilemede ? ` Yenileme **${kartAd(kalan[0])}** kartından alınır.` : ''}`, eylem: 'Kaldır', iptal: 'Vazgeç', yikici: true})) return;
            const once = kartlar(), onceA = DD.durum.oku('abonelik', null);
            if (k.varsayilan && kalan.length) kalan[0] = {...kalan[0], varsayilan: true};
            kartYaz(kalan);
            if (yenilemede) DD.durum.yaz('abonelik', {...a, kart: kalan[0].id});
            s.kapat();
            DD.tazele();
            DD.toast('Kart kaldırıldı', {eylem: 'Geri al', onEylem: () => { kartYaz(once); if (onceA) DD.durum.yaz('abonelik', onceA); else if (yenilemede) DD.durum.sil('abonelik'); DD.tazele(); }});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };
  const kartEkleSheet = () => DD.sheet({
    baslik: 'Kart ekle',
    html: `<div class="dd-yigin">${DD.p('Kart bilgilerini **ödeme kuruluşunun güvenli sayfasında** girersin; Dada Diet kart numarasını görmez ve saklamaz.', {ton: 'ikincil'})}<div class="dd-yigin-12">${['Kart numarası ve CVV **yalnız ödeme sayfasında** girilir', 'Doğrulama için bankan **3D Secure** kodu gönderir', 'Uygulamada kartın **son dört hanesiyle** görünür'].map(metin => DD.madde({metin, tur: 'notr'})).join('')}</div>${DD.gizlilikBant()}</div>`,
    altBar: DD.btn({metin: 'Güvenli sayfada devam et', ikon: 'lock', tam: true, veri: {eylem: 'kart-devam'}}),
    sonra: s => DD.eylem(s, 'kart-devam', el => DD.mesgul(el, DD.TK.motion.reveal * 2).then(() => {
      const l = kartlar(), aday = [U().eklenebilirKart, ...U().kartlar].find(x => !l.some(k => k.id === x.id));
      s.kapat();
      if (!aday) { DD.toast('Bu kart **zaten kayıtlı**', {ikon: 'credit-card'}); return; }
      kartYaz([...l, {...aday, varsayilan: !l.length}]);
      DD.tazele();
      DD.toast(`**${kartAd(aday)}** eklendi`, {tur: 'basari', ikon: 'credit-card'});
    }))
  });
  const yenilemeKartSheet = () => {
    const a = abonelik();
    DD.sheet({
      baslik: 'Yenileme kartı',
      html: `<div class="dd-yigin">${DD.p(`**${DD.tarihUzun(a.yenileme)}** tahsilatı seçtiğin karttan alınır.`, {ton: 'ikincil'})}${DD.satirlar(kartlar().map(k => ({ikon: 'credit-card', baslik: kartAd(k), alt: `Son kullanma ${k.skt}`, ok: false, sag: k.id === a.kart ? DD.durumRozet({metin: 'Seçili', ton: 'basari', ikon: 'onay'}) : '', veri: {eylem: 'yk-sec', id: k.id}})))}</div>`,
      altBar: DD.btn({metin: 'Kart ekle', ikon: 'ekle', tur: 'secondary', tam: true, veri: {eylem: 'yk-ekle'}, attrs: 'data-sheet-kapat'}),
      sonra: s => {
        const c = [
          DD.eylem(s, 'yk-sec', el => { DD.durum.yaz('abonelik', {...a, kart: el.dataset.id}); s.kapat(); DD.tazele(); DD.toast(`Yenileme **${kartAd(kartBul(el.dataset.id))}** kartından alınacak`, {ikon: 'credit-card'}); }),
          DD.eylem(s, 'yk-ekle', kartEkleSheet)
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  // ---------- Fatura bilgileri ----------
  const faturaOzet = () => { const f = fatura(); return {ikon: 'file-invoice', baslik: 'Fatura bilgilerim', alt: f.tip === 'kurumsal' && f.unvan ? `Kurumsal · ${f.unvan}` : `Bireysel · ${[f.ad, f.il].filter(Boolean).join(' · ')}`, veri: {eylem: 'fatura-bilgi'}}; };
  const faturaBilgiSheet = () => {
    const f = fatura(), alan = (ad, etiket, o = {}) => DD.input({ad: `fb-${ad}`, etiket, deger: f[ad] || '', ...o});
    DD.sheet({
      baslik: 'Fatura bilgilerim', tam: true,
      html: `<div class="dd-yigin">${DD.segment({ad: 'fb-tip', etiket: 'Fatura türü', secili: f.tip || 'bireysel', ogeler: [{ad: 'Bireysel', deger: 'bireysel'}, {ad: 'Kurumsal', deger: 'kurumsal'}]})}<div class="dd-yigin" data-kurumsal${f.tip === 'kurumsal' ? '' : ' hidden'}>${alan('unvan', 'Şirket unvanı', {zorunlu: true})}${alan('vergiDairesi', 'Vergi dairesi', {zorunlu: true})}${alan('vkn', 'Vergi kimlik no', {mod: 'numeric', zorunlu: true})}</div>${alan('ad', 'Ad soyad', {zorunlu: true})}${alan('eposta', 'E-posta', {tur: 'email', zorunlu: true})}${alan('telefon', 'Telefon', {tur: 'tel', mod: 'tel'})}<div class="dd-ikili">${alan('il', 'İl', {zorunlu: true})}${alan('ilce', 'İlçe', {zorunlu: true})}</div>${alan('adres', 'Adres', {cokSatir: true, zorunlu: true})}</div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'fb-kaydet'}}),
      sonra: s => {
        let tip = f.tip || 'bireysel';
        const c = [
          DD.on(s, 'fb-tip', v => { tip = v; s.querySelector('[data-kurumsal]').hidden = v !== 'kurumsal'; }),
          DD.eylem(s, 'fb-kaydet', () => {
            const d = Object.fromEntries(['ad', 'eposta', 'telefon', 'il', 'ilce', 'adres', 'unvan', 'vergiDairesi', 'vkn'].map(k => [k, s.querySelector(`[name="fb-${k}"]`).value.trim()]));
            const eksik = ['ad', 'eposta', 'il', 'ilce'].filter(k => !d[k]).length || d.adres.length < 10 || (tip === 'kurumsal' && (!d.unvan || !d.vergiDairesi || !/^\d{10,11}$/.test(d.vkn)));
            if (eksik) { DD.toast('Zorunlu alanları doldur; adres **en az 10 karakter**, VKN **10-11 hane** olmalı', {tur: 'hata', yerine: true}); return; }
            DD.durum.yaz('fatura-bilgi', {...d, tip});
            s.kapat();
            DD.tazele();
            DD.toast('Fatura bilgilerin **kaydedildi**', {tur: 'basari', ikon: 'file-invoice'});
          })
        ];
        return () => c.forEach(f2 => f2());
      }
    });
  };

  let hataGosterildi = false;
  DD.ekran('odemelerim', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Ödemelerim',
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      bosHal = ctx.sorgu.hal === 'bos';
      const s = sekme(ctx), panel = (k, html) => `<div data-panel="${k}"${k === s ? '' : ' hidden'}>${html}</div>`;
      const seg = DD.segment({ad: 'odeme-sekme', etiket: 'Ödemelerim bölümleri', kaydir: true, secili: s, ogeler: [{ad: 'Geçmiş', deger: 'gecmis'}, {ad: 'Kartlar', deger: 'kartlar', sayi: kartlar().length || null}, {ad: 'İadeler', deger: 'iadeler'}]});
      return DD.gruplar([
        {baslik: 'Sıradaki tahsilat', html: siradaki()},
        {html: seg},
        {html: `${panel('gecmis', `<div data-yuva="odeme">${gecmisPanel(ctx.suz)}</div>`)}${panel('kartlar', kartPanel())}${panel('iadeler', iadePanel())}`},
        {baslik: 'Fatura bilgileri', satirlar: [faturaOzet()]},
        {html: DD.bant({ton: 'bilgi', metin: 'Diyetisyen paketlerinin bedeli **diyetisyen onayladığında** alınır; onaylanmayan talepte ödeme yapılmaz.'})}
      ]);
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.kart === 'ekle' && !ctx.acildi) { ctx.acildi = true; kartEkleSheet(); }
      const c = [
        DD.on(kok, 'odeme-sekme', v => { ctx.sekme = v; kok.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== v; }); }),
        DD.on(kok, 'odeme-suz', v => { ctx.suz = v || null; kok.querySelector('[data-yuva="odeme"]').innerHTML = gecmisPanel(ctx.suz); }),
        DD.eylem(kok, 'fatura', el => faturaSheet(el.dataset.id)),
        DD.eylem(kok, 'kart', el => kartSheet(el.dataset.id)),
        DD.eylem(kok, 'kart-ekle', kartEkleSheet),
        DD.eylem(kok, 'yenileme-kart', yenilemeKartSheet),
        DD.eylem(kok, 'fatura-bilgi', faturaBilgiSheet)
      ];
      return () => c.forEach(f => f());
    }
  });
})();
