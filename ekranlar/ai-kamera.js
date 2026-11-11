/* SCR-30 Kamera (#/ai/kamera?mod=tabak|menu|tahlil|barkod&ogun=id). Tarayıcı kamerası kullanılmaz; DD.kamera vizörü görsel üstünde çalışır.
 * Referans: tasks/referanslar.md Kamera, §2.5 (Cal AI kabuk, SnapCalorie mod şeridi ve öğün seçici, Noom yönerge, Foodvisor barkod özet kartı).
 * Durum: kamera-izin 'verildi'|'reddedildi', kamera-ipucu (kapatıldı), ai-tabak {ogun, cekim, kaynak} (yeni çekimde sıfırlanır, ai-tabak.js okur), barkod-son [ean].
 * ?izin=sor|red izin halleri, ?hal=bulanik net olmayan görüntü, ?hal=yemek-yok fotoğrafta yemek yok (Gastro Tabaktan Tarif "yemek yok").
 * Kullanım hakkı halleri (Gastro tabaktan-tarif.html durum=deneme|deneme-bitti|limit, dolaptan.js durum=limit): ?hal=deneme ücretsiz deneme sheet'i,
 * ?hal=deneme-bitti deneme bitti (Pro'ya geç pasif, "Yakında"), ?hal=limit günlük sınır doldu. Haller akışa bağlı değil, yalnız ?hal= ile açılır.
 * Sayılar DDV.ai.kota'dan (karar 2: Gastro ile aynı; deneme 3, Pro günlük sınır Gastro'da sayısız → null, metinde sayı yok).
 * Pro satışa açılmadı (karar 1): Pro'ya geç pasif, yanında "Yakında" ve DDV.uye.pro.durumMetni (pro.js, paketlerim.js ile aynı).
 */
(() => {
  const {esc, sayi} = DD;
  const HERO = 'assets/gorsel/hero/';
  const MOD = {
    tabak: {foto: `${HERO}kamera-tabak.webp`, hedef: '#/ai/tabak', baslik: 'Tabağını inceliyorum', adimlar: () => DDV.ai.kamera.islem},
    menu: {foto: `${HERO}restoran-masa.webp`, hedef: '#/ai/menu', baslik: 'Menünü okuyorum', adimlar: () => ['Menü okunuyor', 'Tabaklar eşleştiriliyor', 'Kalan kalorine göre sıralanıyor']},
    tahlil: {foto: `${HERO}program-dengeli.webp`, hedef: '#/ai/tahlil', baslik: 'Tahlilini okuyorum', adimlar: () => ['Belge okunuyor', 'Değerler ayrılıyor', 'Referans aralıkları karşılaştırılıyor']},
    barkod: {foto: `${HERO}program-seker.webp`}
  };
  const adimSure = () => (DD.azHareket() ? 0 : DD.TK.motion.counter);
  const modAd = id => DDV.ai.kamera.modlar.find(m => m.id === id)?.ad;
  const ogunBul = id => DDV.bugun.ogunler.find(o => o.id === id);
  const varsayilanOgun = ctx => (ogunBul(ctx.sorgu.ogun) || ogunBul(DD.durum.oku('tabagim-ogun', null)) || ogunBul(DD.saatOgunu()) || ogunBul(DDV.ai.tabak.ogunOnerisi)).id;

  // Vizördeki kâğıtlar veriden gelir: menü DDV.ai.disarida, tahlil son kan tahlili.
  const menuBelge = () => {
    const D = DDV.ai.disarida, grup = {};
    D.tabaklar.forEach(t => { (grup[t.etiket] ||= []).push({ad: t.ad, fiyat: ''}); });
    return DD.belge({baslik: D.mekan.ad, alt: `${D.mekan.tur} · ${D.mekan.semt}`, gruplar: Object.entries(grup).slice(0, 6).map(([ad, satirlar]) => ({ad, satirlar}))});
  };
  const tahlilBelge = () => {
    const t = DDV.saglik.kanTahlilleri.find(x => x.id === DDV.ai.tahlil.tahlil);
    return DD.belge({tur: 'tahlil', baslik: 'Laboratuvar Sonuç Raporu', alt: t.tarihMetin, satirlar: t.degerler.map(x => ({ad: x.kisaAd, deger: `${DD.ondalik(x.deger, 1)} ${x.birim}`, referans: x.referans}))});
  };
  const urunler = () => DDV.ai.barkod.urunler;
  const skorSozcuk = u => (u.skor < 40 ? 'Sık tüketmeye uygun değil' : u.skor >= 70 ? 'İyi seçim' : 'Ölçülü tüket');

  const kameraHtml = (ctx, ek = {}) => {
    const m = ctx.mod, tabak = m === 'tabak', ipucu = tabak && !ek.analiz && !DD.durum.oku('kamera-ipucu', false);
    return DD.kamera({
      baslik: modAd(m), gorsel: MOD[m].foto, modlar: DDV.ai.kamera.modlar, mod: m, flas: ctx.flas,
      baglam: tabak ? ogunBul(ctx.ogun).ad : null,
      belgeler: {menu: menuBelge(), tahlil: tahlilBelge(), barkod: DD.belge({tur: 'barkod', ean: urunler()[ctx.sira % urunler().length].ean})},
      ipucu: ipucu ? {baslik: 'Tabağı ortala', metin: 'Yukarıdan çek, gölgeyi azalt.'} : null,
      ...ek
    });
  };
  const yenidenCiz = (kok, ctx, ek) => { const el = kok.querySelector('.dd-kamera'); if (el) el.outerHTML = kameraHtml(ctx, ek); };

  // ---------- İzin ----------
  const izinHal = ctx => (ctx.sorgu.izin && !ctx.izinGecti ? ctx.sorgu.izin : {verildi: '', reddedildi: 'red'}[DD.durum.oku('kamera-izin', '')] ?? 'sor');
  const izinIstem = () => DD.izinIstemi({
    gorsel: MOD.tabak.foto, ikon: 'kamera', baslik: 'Kamerana ihtiyacımız var',
    metin: 'Tabağını, menüyü ve barkodu tanımak için **kamera iznine** ihtiyaç var.',
    maddeler: [['tabak', 'Tabağını tanır', 'Bileşenleri ayırır, sen düzeltirsin.'], ['barkod', 'Ürünü okur', 'İçeriği satır satır açıklar.'], ['gizlilik', 'Fotoğrafın sende kalır', 'İzinsiz paylaşılmaz.']]
  });
  const izinRed = () => DD.durumSahne({
    tema: 'koyu', gorsel: MOD.tabak.foto, isaret: 'kamera', baslik: 'Kamera izni gerekli',
    metin: 'Fotoğraf çekmek için **kamera izni** gerekir. **Galeriden de** seçebilirsin.',
    ana: {metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'},
    ikinciller: [{metin: 'Galeriden seç', ikon: 'galeri', attrs: 'data-kamera="galeri"'}, {metin: 'Şimdi değil', geri: true}],
    ipucuBaslik: 'Kamera iznini açmak için', ipucuParcali: true,
    ipuclari: [['ayar', 'Ayarlar’ı aç', 'Ayarlar’da Dada Diet’i bul.'], ['kamera', 'Kamerayı aç', 'Kamera iznini “İzin ver” yap.'], ['arrow-rotate-left', 'Uygulamaya dön', 'Kamera kendiliğinden açılır.']]
  });
  const izinYaz = (ctx, v) => { DD.durum.yaz('kamera-izin', v); ctx.izinGecti = true; DD.tazele(); };

  // ---------- Çekim: analiz adımları, sonra sonuç ----------
  const sonucaGit = ctx => {
    if (ctx.mod === 'tabak') DD.durum.yaz('ai-tabak', {ogun: ctx.ogun, cekim: Date.now(), kaynak: ctx.kaynak || 'kamera'});
    DD.git(MOD[ctx.mod].hedef);
  };
  const analiz = (kok, ctx) => {
    const m = MOD[ctx.mod], adimlar = m.adimlar();
    let etkin = 0, saat = 0;
    DD.durum.yaz('kamera-ipucu', true);
    yenidenCiz(kok, ctx, {analiz: adimlar[0], tarama: true});
    DD.sheet({
      baslik: m.baslik, html: DD.analizAdimlari({adimlar, etkin}),
      sonra: d => {
        const ilerle = () => {
          etkin += 1;
          if (etkin >= adimlar.length) { sonucaGit(ctx); return; }
          d.querySelector('.dd-sheet-govde').innerHTML = DD.analizAdimlari({adimlar, etkin});
          const y = kok.querySelector('.dd-kamera-yonerge'); if (y) y.textContent = adimlar[etkin];
          saat = setTimeout(ilerle, adimSure());
        };
        saat = setTimeout(ilerle, adimSure());
        return () => clearTimeout(saat);
      },
      kapaninca: () => yenidenCiz(kok, ctx)
    });
  };

  // ---------- Barkod: kameranın üstünde özet kart, detay ayrı ekranda ----------
  const sonaEkle = ean => DD.durum.yaz('barkod-son', [ean, ...DD.durum.oku('barkod-son', []).filter(x => x !== ean)].slice(0, 5));
  const barkodOzet = (kok, ctx) => {
    const u = urunler()[ctx.sira % urunler().length], kcal = u.deger100.kcal * u.porsiyonGram / 100;
    DD.titres(12);
    sonaEkle(u.ean);
    DD.sheet({
      baslik: 'Ürünü bulduk',
      html: `<div class="dd-yigin">${DD.skorKart({ad: u.ad, kategori: u.skor < 40 ? null : u.kategori, skor: u.skor, etiket: skorSozcuk(u)})}${DD.p(`Bir porsiyon **${sayi(u.porsiyonGram)} g**, **${sayi(kcal)} kcal**. ${u.uyarilar.length ? `Dikkat edilecek **${u.uyarilar.length} nokta** var.` : 'Dikkat edilecek bir nokta görünmüyor.'}`)}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Yeniden tara', tur: 'secondary', attrs: 'data-sheet-kapat'})}${DD.btn({metin: 'Detayı gör', ikon: 'tumu', git: `#/barkod/${u.ean}`})}</div>`,
      kapaninca: () => { ctx.sira += 1; yenidenCiz(kok, ctx); }
    });
  };

  // ---------- Galeri ----------
  const galeriTabak = () => DD.fotoIzgara([
    {gorsel: MOD.tabak.foto, veri: {eylem: 'galeri-sec', id: 'net'}, etiket: 'Bugün çekilen tabak'},
    {gorsel: `${HERO}kamera-tabak-2.webp`, veri: {eylem: 'galeri-sec', id: 'bulanik'}, etiket: 'Dün çekilen tabak'}
  ]);
  const galeriMenu = () => DD.fotoIzgara([{gorsel: `${HERO}lokanta-istanbul.webp`, veri: {eylem: 'galeri-sec', id: 'net'}, etiket: 'Bugün çekilen menü'}]);
  const galeriTahlil = () => DD.satirlar(DDV.saglik.kanTahlilleri.slice(0, 1).map(t => DD.belgeSatir({baslik: 'Kan tahlili', alt: t.kaynak, tarih: t.tarihMetin, veri: {eylem: 'galeri-sec', id: 'net'}})));
  const galeriBarkod = () => {
    const son = DD.durum.oku('barkod-son', []).map(e => urunler().find(u => u.ean === e)).filter(Boolean);
    return `<div class="dd-yigin">${DD.input({ad: 'ean', etiket: 'Barkod numarası', yer: '13 haneli numara', mod: 'numeric', ikon: 'barkod', yardim: 'Barkodun altındaki numarayı yaz.'})}${son.length ? `<div class="dd-yigin-8"><p class="dd-t-label dd-ton-ikincil">Son taramalar</p>${DD.satirlar(son.map(u => DD.satir({ikon: 'barkod', baslik: u.ad, alt: u.kategori, sag: DD.skorRozet({skor: u.skor}), git: `#/barkod/${u.ean}`})))}</div>` : ''}</div>`;
  };
  const galeri = (kok, ctx) => {
    const barkod = ctx.mod === 'barkod';
    DD.sheet({
      baslik: barkod ? 'Barkodu elle yaz' : 'Galeriden seç',
      html: {tabak: galeriTabak, menu: galeriMenu, tahlil: galeriTahlil, barkod: galeriBarkod}[ctx.mod](),
      altBar: barkod ? DD.btn({metin: 'Ürünü bul', ikon: 'ara_', tam: true, veri: {eylem: 'ean-bul'}}) : '',
      sonra: d => {
        const c1 = DD.eylem(d, 'galeri-sec', el => {
          d.kapat();
          ctx.kaynak = 'galeri';
          if (el.dataset.id === 'bulanik') { ctx.bulanik = true; DD.tazele(); return; }
          if (izinHal(ctx)) { sonucaGit(ctx); return; }
          analiz(kok, ctx);
        });
        const c2 = DD.eylem(d, 'ean-bul', () => {
          const ean = d.querySelector('input[name="ean"]').value.replace(/\D/g, '');
          if (ean.length < 8) { DD.toast('Barkod numarasını **tam** yaz', {ikon: 'barkod'}); return; }
          DD.git(`#/barkod/${ean}`);
        });
        return () => { c1(); c2(); };
      }
    });
  };

  // ---------- Kullanım hakkı (karar bekliyor) ve tanıma halleri ----------
  const kota = () => DDV.ai.kota || {};
  const pro = () => (DDV.uye?.kademeler || []).find(k => k.kod === 'pro') || {ad: 'Pro'};
  const P = () => DDV.uye.pro;
  // Pro satışa açılmadı: düğme pasif (fiyatsız), "Yakında" rozeti ve durum cümlesi yanında.
  const proGec = () => { const k = pro(); return {metin: P().dugme, ikon: k.ikon || 'bolt', pasif: true}; };
  const yakindaRozet = () => DD.durumRozet({metin: P().rozet, ton: 'uyari', ikon: 'clock'});
  const elleEkle = {metin: 'Besin ara', ikon: 'ara_', git: '#/besin-ara'};
  const SAHNE = {
    'yemek-yok': () => DD.durumSahne({
      tema: 'koyu', gorsel: `${HERO}mutfak-raf.webp`, isaret: 'yemek', baslik: 'Fotoğrafta yemek seçemedik',
      metin: '**Tek tabağı** çerçeveye alıp yeniden dene ya da besinleri **elle ekle**.',
      ana: {metin: 'Tekrar çek', ikon: 'kamera', veri: {eylem: 'tekrar'}}, ikinciller: [{metin: 'Elle ekle', ikon: 'ekle', git: '#/besin-ara'}, {metin: 'Şimdi değil', geri: true}],
      ipucuBaslik: 'Tabağı çerçeveye almak için', ipuclari: [['tabak', 'Tek tabak seç', 'Birden çok tabak tanımayı zorlaştırır.'], ['crop-simple', 'Köşelerin içine al', 'Tabağın tamamı çerçevede kalsın.'], ['arrow-down', 'Üstten çek', 'Tabağı yukarıdan görmek tanımayı kolaylaştırır.']]
    }),
    'deneme-bitti': () => DD.durumSahne({
      isaret: 'lock', baslik: 'Ücretsiz deneme hakların bitti',
      metin: `Tabağını fotoğrafla tanımaya **${pro().ad}** ile devam edebilirsin. Bu sırada besinleri **aramayla** ekleyebilirsin.`,
      ana: elleEkle, ikinciller: [proGec(), {metin: 'Şimdi değil', geri: true}],
      ipucuBaslik: pro().tamAd || 'Dada Diet Pro', ipuclari: [['clock', P().rozet, P().durumMetni]]
    }),
    limit: () => {
      const n = kota().gunluk;
      return DD.durumSahne({
        isaret: 'hourglass-end', baslik: 'Bugünkü hakkını kullandın',
        metin: `${n ? `Bugünkü **${sayi(n)} analiz** hakkının hepsini kullandın.` : 'Günlük kullanım sınırına ulaştın.'} Yeni hakkın **yarın** açılır; bu sırada besinleri aramayla ekleyebilirsin.`,
        ana: elleEkle, ikinciller: [{metin: 'Tabaklarım', ikon: 'tabak', git: '#/tabaklarim'}, {metin: 'Şimdi değil', geri: true}]
      });
    }
  };
  // Ücretsiz deneme: Gastro tanıtım sheet'i (rozet, yan yana 3 adım, deneme notu + tam genişlik düğme, ikili eylem). Kamera arkada kalır.
  const denemeSheet = (kok, ctx) => {
    const n = kota().deneme, k = pro();
    DD.sheet({
      baslik: 'Ne Yedim? · Ücretsiz deneme',
      html: `<div class="dd-yigin"><div class="dd-sira">${DD.durumRozet({metin: k.ad, ikon: k.ikon || 'bolt'})}${yakindaRozet()}</div>${DD.p('Tabağının fotoğrafını çek; **bileşenleri ve kaloriyi** tahmin edelim, sen düzeltip günlüğüne ekle.')}${DD.parcali([{ikon: 'kamera', baslik: 'Çek', bilgi: true}, {ikon: 'duzenle', baslik: 'Düzelt', bilgi: true}, {ikon: 'ekle', baslik: 'Günlüğe ekle', bilgi: true}], {kutu: 'yatay', aria: 'Ne Yedim? nasıl çalışır'})}${DD.p(n ? `**${sayi(n)} ücretsiz deneme** hakkın var.` : `**${k.ad}**’ya geçmeden ücretsiz dene.`, {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Ücretsiz denemeyi kullan', ikon: 'kamera', tam: true, veri: {eylem: 'deneme-kullan'}})}${DD.p(P().durumMetni, {ton: 'ikincil', meta: true})}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Şimdilik değil', tur: 'secondary', attrs: 'data-sheet-kapat'})}${DD.btn(proGec())}</div>`,
      // Deneme kullanılmadan kapanırsa (Şimdilik değil, X, aşağı kaydırma) kamera açık kalmaz: geri döner (Gastro dolaptan.js data-dt-simdilik).
      kapaninca: () => { if (!ctx.temiz) DD.geri(); },
      sonra: d => DD.eylem(d, 'deneme-kullan', () => { ctx.temiz = true; d.kapat(); DD.toast('Ücretsiz denemen **başladı**', {tur: 'basari'}); DD.tazele(); })
    });
  };

  const baglamSheet = (kok, ctx) => DD.siralaSheet({
    baslik: 'Hangi öğüne?', secili: ctx.ogun,
    secenekler: DDV.bugun.ogunler.map(o => [o.id, o.ad, o.id]),
    sec: v => { ctx.ogun = v; ctx.ogunSecildi = true; DD.durum.yaz('tabagim-ogun', v); yenidenCiz(kok, ctx); }
  });

  // ?hal= değerleri bir kez gösterilir: Tekrar çek ya da denemeyi kullan (ctx.temiz) olağan akışa döner.
  const ozelHal = ctx => (ctx.temiz ? null : ctx.sorgu.hal);
  const bulanikMi = ctx => ozelHal(ctx) === 'bulanik' || !!ctx.bulanik;
  const sahne = ctx => SAHNE[ozelHal(ctx)] || null;
  const denemeMi = ctx => ozelHal(ctx) === 'deneme';
  DD.ekran('ai-kamera', {
    cevrimici: true,   // ağ gerekir: çevrimdışında bağlantı hatası (önbellek yok)
    tur: 'tam',
    tabagim: 'ust',
    baslik: 'Ne Yedim?',
    ciz: ctx => {
      ctx.mod ||= MOD[ctx.sorgu.mod] ? ctx.sorgu.mod : 'tabak';
      ctx.ogun ||= varsayilanOgun(ctx);
      ctx.sira ??= 0;
      if (bulanikMi(ctx)) {
        return DD.durumSahne({tema: 'koyu', gorsel: `${HERO}kamera-tabak-2.webp`, isaret: 'bulanik', baslik: 'Görüntü net değil', metin: 'Tabağı **ışığa** yaklaştırıp yeniden dene.', ana: {metin: 'Tekrar çek', ikon: 'kamera', veri: {eylem: 'tekrar'}}, ikinciller: [{metin: 'Elle ekle', ikon: 'ekle', git: '#/besin-ara'}, {metin: 'Şimdi değil', geri: true}]});
      }
      if (sahne(ctx)) return sahne(ctx)();
      if (denemeMi(ctx)) return kameraHtml(ctx);   // tanıtım izinden önce gelir
      const izin = izinHal(ctx);
      if (izin === 'sor') return izinIstem().html;
      if (izin === 'red') return izinRed();
      return kameraHtml(ctx);
    },
    altBar: ctx => (izinHal(ctx) === 'sor' && !bulanikMi(ctx) && !sahne(ctx) && !denemeMi(ctx) ? izinIstem().bar : ''),   // durum sahnelerinde ve deneme tanıtımında izin çubuğu çıkmaz (kendi düğmeleri var)
    sonra: (kok, ctx) => {
      const kamera = ev => {
        const a = ev.detail.eylem;
        if (a === 'cek') { ctx.kaynak = 'kamera'; if (ctx.mod === 'barkod') barkodOzet(kok, ctx); else analiz(kok, ctx); }
        else if (a === 'galeri') galeri(kok, ctx);
        else if (a === 'mikrofon') DD.git('#/ai/ses');
        else if (a === 'baglam') baglamSheet(kok, ctx);
        else if (a === 'flas') ctx.flas = !ctx.flas;
      };
      const izin = ev => {
        // İpucu düğmesi kanonda kendini kaldırır, dd-kamera olayı buraya ulaşmaz.
        if (ev.target.closest('[data-kamera="ipucu"]')) { DD.durum.yaz('kamera-ipucu', true); return; }
        if (ev.target.closest('[data-izin-ayar]')) { izinYaz(ctx, 'verildi'); DD.toast('Kamera izni **açıldı**', {tur: 'basari'}); return; }
        if (!ev.target.closest('[data-izin-ver]')) return;
        DD.dialog({baslik: `“Dada Diet” kamerana erişmek istiyor`, metin: 'Tabak, menü, tahlil ve barkod **fotoğrafı çekmek** için kullanılır.', eylem: 'İzin ver', iptal: 'İzin verme'}).then(tamam => izinYaz(ctx, tamam ? 'verildi' : 'reddedildi'));
      };
      if (denemeMi(ctx) && !ctx.denemeGosterildi) { ctx.denemeGosterildi = true; denemeSheet(kok, ctx); }
      kok.addEventListener('dd-kamera', kamera);
      kok.addEventListener('click', izin);
      const c1 = DD.on(kok, 'kameraMod', v => { ctx.mod = v; yenidenCiz(kok, ctx); });
      const c2 = DD.eylem(kok, 'tekrar', () => { ctx.bulanik = false; ctx.temiz = true; DD.tazele(); });
      return () => { kok.removeEventListener('dd-kamera', kamera); kok.removeEventListener('click', izin); c1(); c2(); if (ctx.ogunSecildi && !DD.tabagim.liste().length) DD.durum.sil('tabagim-ogun'); };
    }
  });
})();
