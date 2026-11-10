/* Programlarım (#/programlarim). Web karşılığı: hesabim/programlarim + program-baslat (uye-programlarim.js, uye-program-baslat.js).
 * Gastro alt sayfa kalıbı: DD.gruplar (özet sayılar üstte; Devam eden · Kaydettiğin · Tamamladıkların · Bıraktıkların · Program geçmişin), kartsız satırlar.
 * Durum: aktifProgram (program-detay sözleşmesi {slug, ad, gun, toplamGun, baslangic}; bu ekran duraklatmada 'duraklatildi' iso alanını ekler),
 *   kayitliProgramlar (slug dizisi), program-gecmisi [{slug, baslangic, bitis, durum:'tamamlandi'|'birakildi', tamam, toplam}] (varsayılan DDV.uye.programGecmisi),
 *   program-hareket [{tarih, slug, hareket}] (duraklat ve devam kayıtları). Başlatma program detayındadır (#/program/:slug).
 * #/programlarim?hal=bos boş hal, ?hal=hata bağlantı hatası. */
(() => {
  const U = () => DDV.uye;
  const bul = slug => DDV.programlar.find(p => p.slug === slug);
  const bos = ctx => ctx.sorgu.hal === 'bos';
  const aktifOku = ctx => (bos(ctx) ? null : DD.durum.oku('aktifProgram', DD.yeniHesap() ? null : DDV.kullanici.aktifProgram));
  const gecmisOku = ctx => (bos(ctx) ? [] : DD.durum.oku('program-gecmisi', DD.yeniHesap() ? [] : U().programGecmisi));
  const hareketOku = () => DD.durum.oku('program-hareket', []);
  const kayitlar = ctx => (bos(ctx) ? [] : DD.durum.oku('kayitliProgramlar', []));

  // ---------- Tarih ----------
  const isoMs = s => { const [y, a, g] = s.split('-').map(Number); return Date.UTC(y, a - 1, g); };
  const gunFark = (a, b) => Math.round((isoMs(b) - isoMs(a)) / 864e5);
  const gunEkle = (s, n) => new Date(isoMs(s) + n * 864e5).toISOString().slice(0, 10);
  const bugun = () => DD.bugunIso();
  const kacinciGun = a => gunFark(a.baslangic, a.duraklatildi || bugun()) + 1;
  const oran = (n, t) => (t ? Math.round(n / t * 100) : 0);

  // ---------- Uyum: geçmiş günler kayıttan, bugün öğün işaretlerinden ----------
  const bugunOgun = () => { const l = DD.ogun.hesap().ogunler.filter(o => o.durum !== 'kapali'); return {tamam: l.filter(o => o.durum === 'yedi').length, toplam: l.length}; };
  const uyum = a => {
    const ilk = DDV.kullanici.aktifProgram, ayni = !DD.yeniHesap() && ilk && ilk.slug === a.slug && ilk.baslangic === a.baslangic;
    const gunler = ayni ? U().aktifUyum.filter(([t]) => t >= a.baslangic && t < bugun()) : [];
    const b = a.baslangic <= bugun() && !a.duraklatildi ? bugunOgun() : {tamam: 0, toplam: 0};
    const tamam = gunler.reduce((t, g) => t + g[1], 0) + b.tamam, toplam = gunler.reduce((t, g) => t + g[2], 0) + b.toplam;
    return {tamam, toplam, oran: oran(tamam, toplam)};
  };

  // ---------- Parçalar ----------
  const aktifKart = a => {
    const p = bul(a.slug);
    if (!p) return '';
    const gun = kacinciGun(a), baslamadi = gun < 1, u = uyum(a), g = DD.kisit(gun, 1, p.sureGun);
    const ust = baslamadi
      ? DD.bant({ton: 'bilgi', ikon: 'takvim', metin: `**${p.ad}** ${DD.tarihUzun(a.baslangic)} tarihinde başlıyor.`})
      : a.duraklatildi ? DD.bant({ton: 'uyari', ikon: 'circle-pause', metin: `Program **${DD.tarihUzun(a.duraklatildi)}** tarihinden beri duraklatıldı. Devam ettiğinde kalan günler **bugünden** sayılır.`}) : '';
    const sayac = DD.stat([
      {deger: baslamadi ? '–' : `${g}/${p.sureGun}`, etiket: 'Gün'},
      {deger: u.toplam ? `%${u.oran}` : '–', etiket: 'Uyum'},
      {deger: baslamadi ? String(p.sureGun) : String(Math.max(0, p.sureGun - g)), etiket: 'Kalan gün'}
    ]);
    const uyumMetin = u.toplam ? DD.p(`**${u.toplam} öğünün ${u.tamam} tanesinde** plana uydun. Uyum, işaretlediğin öğünlerin planlanan öğünlere oranıdır.`, {ton: 'ikincil', meta: true}) : '';
    const dugmeler = a.duraklatildi
      ? `<div class="dd-ikili">${DD.btn({metin: 'Bırak', tur: 'secondary', veri: {eylem: 'birak'}})}${DD.btn({metin: 'Devam et', ikon: 'play', veri: {eylem: 'devam'}})}</div>`
      : `<div class="dd-ikili">${DD.btn({metin: 'Duraklat', ikon: 'pause', tur: 'secondary', pasif: baslamadi, veri: {eylem: 'duraklat'}})}${DD.btn({metin: 'Öğünlerim', ikon: 'ogun', git: '#/beslenme-plani'})}</div>${DD.btn({metin: 'Programı bırak', tur: 'text', tam: true, veri: {eylem: 'birak'}})}`;
    return `<div class="dd-yigin">${ust}${DD.programKart(p, {tur: 'aktif', gun: baslamadi ? 0 : g, toplam: p.sureGun})}<div class="dd-yigin-12">${sayac}${u.toplam ? DD.ilerleme({oran: u.oran / 100}) : ''}${uyumMetin}</div>${dugmeler}</div>`;
  };
  const aktifYok = () => DD.satirlar([{ikon: 'wand-magic-sparkles', baslik: 'Program Bul', alt: 'Beş soruda sana uygun menü', git: '#/program-bul'}, {ikon: 'program', baslik: 'Tüm programlar', alt: `${DDV.programlar.length} program`, git: '#/programlar'}]);

  const gecmisSatir = x => {
    const p = bul(x.slug);
    if (!p) return null;
    const tamam = x.durum === 'tamamlandi', gun = gunFark(x.baslangic, x.bitis) + 1;
    return {
      gorsel: p.kapak, baslik: p.ad,
      alt: tamam ? `${DD.tarihKisa(x.baslangic)} – ${DD.tarihKisa(x.bitis)} · uyum` : `${gun}. günde bırakıldı`,
      deger: tamam ? `%${oran(x.tamam, x.toplam)}` : DD.tarihKisa(x.bitis),
      git: `#/program/${p.slug}`
    };
  };
  const kayitliBolum = ctx => {
    const l = kayitlar(ctx).map(bul).filter(Boolean);
    if (!l.length) return null;
    return {baslik: 'Kaydettiğin programlar', eylem: {metin: 'Tümü', git: '#/kaydedilenler?tur=programlar'}, html: `<div class="dd-yigin-12">${l.slice(0, 3).map(p => DD.programKart(p, {tur: 'row', kayitli: true})).join('')}</div>`};
  };
  // Hareketler: geçmiş kayıtlardan türer, duraklat ve devam ayrıca yazılır. En yeni üstte.
  const hareketler = ctx => {
    const a = aktifOku(ctx), l = [];
    gecmisOku(ctx).forEach(x => { l.push({tarih: x.baslangic, slug: x.slug, hareket: 'Başlatıldı'}); l.push({tarih: x.bitis, slug: x.slug, hareket: x.durum === 'tamamlandi' ? 'Tamamlandı' : 'Bırakıldı'}); });
    if (a) l.push({tarih: a.baslangic, slug: a.slug, hareket: a.baslangic > bugun() ? 'Planlandı' : 'Başlatıldı'});
    if (!bos(ctx)) l.push(...hareketOku());
    return l.filter(h => bul(h.slug)).sort((x, y) => y.tarih.localeCompare(x.tarih));
  };
  const HAREKET_IKON = {Başlatıldı: 'play', Planlandı: 'takvim', Tamamlandı: 'flag-checkered', Bırakıldı: 'circle-stop', Duraklatıldı: 'pause', 'Devam ettirildi': 'play'};
  const hareketBolum = ctx => {
    const l = hareketler(ctx);
    if (!l.length) return null;
    return {baslik: 'Program geçmişin', satirlar: l.slice(0, 8).map(h => ({ikon: HAREKET_IKON[h.hareket] || 'program', baslik: bul(h.slug).ad, alt: `${DD.tarihUzun(h.tarih)} · ${h.hareket}`}))};
  };

  // ---------- Eylemler ----------
  const hareketYaz = (slug, hareket) => DD.durum.yaz('program-hareket', [...hareketOku(), {tarih: bugun(), slug, hareket}]);
  const duraklat = async ctx => {
    const a = aktifOku(ctx), p = bul(a.slug);
    const evet = await DD.dialog({baslik: 'Programı duraklat', metin: `**${p.ad}** duraklatılırsa kalan günler ileri kayar. Tamamladığın günler ve **uyum oranın korunur**.`, eylem: 'Duraklat', iptal: 'Vazgeç'});
    if (!evet) return;
    DD.durum.yaz('aktifProgram', {...a, duraklatildi: bugun()});
    hareketYaz(a.slug, 'Duraklatıldı');
    DD.tazele();
    DD.toast('Program **duraklatıldı**', {ikon: 'pause', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('aktifProgram', a); DD.durum.yaz('program-hareket', hareketOku().slice(0, -1)); DD.tazele(); }});
  };
  const devam = ctx => {
    const a = aktifOku(ctx), {duraklatildi, ...kalan} = a, kayma = gunFark(duraklatildi, bugun());
    DD.durum.yaz('aktifProgram', {...kalan, baslangic: gunEkle(a.baslangic, kayma)});
    hareketYaz(a.slug, 'Devam ettirildi');
    DD.tazele();
    DD.toast('Programa **devam ediyorsun**', {tur: 'basari', ikon: 'play'});
  };
  const birak = async ctx => {
    const a = aktifOku(ctx), p = bul(a.slug), gun = kacinciGun(a), u = uyum(a);
    const evet = await DD.dialog({baslik: 'Programı bırak', metin: `${gun >= 1 ? `**${p.ad}** programında **${Math.min(gun, p.sureGun)}. gündesin**.` : `**${p.ad}** henüz başlamadı.`} Bırakırsan öğünleri Bugün ekranından kalkar; **kayıtların silinmez**.`, eylem: 'Bırak', iptal: 'Devam et', yikici: true});
    if (!evet) return;
    const once = DD.durum.oku('program-gecmisi', null);
    DD.durum.yaz('aktifProgram', null);
    if (gun >= 1) DD.durum.yaz('program-gecmisi', [...gecmisOku(ctx), {slug: a.slug, baslangic: a.baslangic, bitis: a.duraklatildi || bugun(), durum: 'birakildi', tamam: u.tamam, toplam: u.toplam}]);
    DD.tazele();
    DD.toast('Program bırakıldı', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('aktifProgram', a); if (once) DD.durum.yaz('program-gecmisi', once); else DD.durum.sil('program-gecmisi'); DD.tazele(); }});
  };

  let hataGosterildi = false;
  DD.ekran('programlarim', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Programlarım',
    iskelet: 'liste',
    yenile: true,
    ustBar: {sag: [{ikon: 'ekle', etiket: 'Program bul', git: '#/program-bul'}]},
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      const a = aktifOku(ctx), g = gecmisOku(ctx), tamam = g.filter(x => x.durum === 'tamamlandi'), birakilan = g.filter(x => x.durum === 'birakildi');
      if (!a && !g.length) {
        return DD.gruplar([
          {html: DD.bos({ikon: 'program', baslik: 'Henüz başlattığın program yok', metin: 'Sana uygun programı **Program Bul** ile seçebilirsin; öğünlerin hemen Bugün’e düşer.', eylem: {metin: 'Program Bul', ikon: 'wand-magic-sparkles', git: '#/program-bul'}, ikincil: {metin: 'Tüm programlar', git: '#/programlar'}})},
          kayitliBolum(ctx)
        ]);
      }
      return DD.gruplar([
        {baslik: 'Devam eden', html: a && bul(a.slug) ? aktifKart(a) : aktifYok()},
        kayitliBolum(ctx),
        {baslik: 'Tamamladıkların', ...(tamam.length ? {satirlar: tamam.slice().reverse().map(gecmisSatir).filter(Boolean)} : {html: DD.p('Bir programı sonuna kadar götürdüğünde **uyum oranınla** burada saklanır.', {ton: 'ikincil'})})},
        birakilan.length && {baslik: 'Bıraktıkların', satirlar: birakilan.slice().reverse().map(gecmisSatir).filter(Boolean)},
        hareketBolum(ctx),
        {html: DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Programlar **eğitim amaçlıdır**; kişiye özel plan için diyetisyenine danış.'})}
      ], {bas: DD.stat([{deger: String(a ? 1 : 0), etiket: 'Devam eden'}, {deger: String(tamam.length), etiket: 'Tamamlanan'}, {deger: String(birakilan.length), etiket: 'Bırakılan'}])});
    },
    sonra: (kok, ctx) => {
      const c = [
        DD.eylem(kok, 'duraklat', () => duraklat(ctx)),
        DD.eylem(kok, 'devam', () => devam(ctx)),
        DD.eylem(kok, 'birak', () => birak(ctx)),
        // Kayıtlı program kartı: kaydet düğmesi kartı çevirir, kalıcı kayıt burada yazılır.
        DD.eylem(kok, 'kaydet', el => { const l = DD.durum.oku('kayitliProgramlar', []), id = el.dataset.id; DD.durum.yaz('kayitliProgramlar', l.includes(id) ? l.filter(x => x !== id) : [...l, id]); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
