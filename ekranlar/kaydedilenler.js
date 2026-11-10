/* Kaydedilenler (#/kaydedilenler). Web karşılığı: hesabim/kaydedilenler (uye-kaydedilenler.js).
 * Durum: kayitliProgramlar (program-detay sözleşmesi, varsayılan []), kayitli-tarifler, kayitli-besinler, kayitli-ipuclari, kayitli-uzmanlar (slug dizileri;
 *   varsayılan DDV.uye.kayitli, yeni hesapta []). Kayıt tarihi DDV.uye.kayitli.tarihler'den; sonradan kaydedilen öğe tarihsiz en üstte durur.
 * Detay rotaları: #/program/:slug, #/tarif/:slug, #/besin/:slug, #/ipucu/:slug, #/uzman/profil/:slug. #/kaydedilenler?tur=tarifler sekmeyi açar, ?hal=bos, ?hal=hata. */
(() => {
  const TURLER = [
    {tur: 'programlar', ad: 'Programlar', anahtar: 'kayitliProgramlar', kisa: 'program', ikon: 'program', liste: '#/programlar', bos: 'Programları incele'},
    {tur: 'tarifler', ad: 'Tarifler', anahtar: 'kayitli-tarifler', kisa: 'tarif', ikon: 'ogun', liste: '#/tarifler', bos: 'Tariflere göz at'},
    {tur: 'besinler', ad: 'Besinler', anahtar: 'kayitli-besinler', kisa: 'besin', ikon: 'apple-whole', liste: '#/besinler', bos: 'Besinlere göz at'},
    {tur: 'ipuclari', ad: 'İpuçları', anahtar: 'kayitli-ipuclari', kisa: 'ipucu', ikon: 'ipucu', liste: '#/ipuclari', bos: 'İpuçlarını oku'},
    {tur: 'uzmanlar', ad: 'Diyetisyenler', anahtar: 'kayitli-uzmanlar', kisa: 'uzman', ikon: 'uzman', liste: '#/uzman/bul', bos: 'Diyetisyenleri incele'}
  ];
  const BOS_METIN = {
    programlar: 'Program detayındaki **kaydet** düğmesiyle beğendiğin programları buraya ekleyebilirsin.',
    tarifler: 'Tarif detayında **kaydet** dediğin tarifler burada birikir.',
    besinler: 'Sık baktığın besinleri **kaydedersen** değerlerine tek dokunuşla dönersin.',
    ipuclari: 'Okuduğun ipuçlarını **kaydedip** sonra yeniden açabilirsin.',
    uzmanlar: 'İncelediğin diyetisyenleri **kaydedersen** karar verirken yan yana bakarsın.'
  };
  const T = tur => TURLER.find(x => x.tur === tur);
  const varsayilan = tur => (tur === 'programlar' || DD.yeniHesap() ? [] : DDV.uye.kayitli[tur]);
  const oku = (tur, ctx) => (ctx?.sorgu.hal === 'bos' ? [] : DD.durum.oku(T(tur).anahtar, varsayilan(tur)));
  const yaz = (tur, l) => DD.durum.yaz(T(tur).anahtar, l);
  const tarih = (tur, slug) => (DD.yeniHesap() ? null : DDV.uye.kayitli.tarihler[`${T(tur).kisa}|${slug}`] || null);

  // Kaynak kayıtları: slug'ı bulunmayan öğe listede gösterilmez.
  const KAYNAK = {
    programlar: s => DDV.programlar.find(x => x.slug === s),
    tarifler: s => DDV.yemekler.find(x => x.slug === s),
    besinler: s => DDV.besinler.find(x => x.slug === s),
    ipuclari: s => DDV.icerikler.find(x => x.slug === s),
    uzmanlar: s => DDV.diyetisyenler.find(x => x.slug === s)
  };
  const ogeler = (tur, ctx) => oku(tur, ctx).map(s => ({s, x: KAYNAK[tur](s)})).filter(o => o.x)
    .sort((a, b) => (tarih(tur, b.s) || '9999').localeCompare(tarih(tur, a.s) || '9999'));
  const ek = (tur, s) => { const t = tarih(tur, s); return t ? ` · ${DD.tarihKisa(t)}` : ''; };

  const kaldirBtn = (tur, s, ad) => DD.ikonBtn({ikon: 'kaydet', etiket: `${ad}: kayıttan çıkar`, tur: 'tint', veri: {eylem: 'kaldir', id: `${tur}|${s}`}});
  const SATIR = {
    tarifler: (y, s) => ({gorsel: y.gorsel, baslik: y.ad, alt: `${y.kategori} · ${DD.sayi(y.porsiyonKcal)} kcal${ek('tarifler', s)}`, git: `#/tarif/${s}`}),
    besinler: (b, s) => ({gorsel: b.gorsel, gorselTon: DD.makroTon(b), baslik: b.ad, alt: `100 g ${DD.sayi(b.kcal)} kcal${ek('besinler', s)}`, git: `#/besin/${s}`}),
    ipuclari: (i, s) => ({gorsel: i.gorsel, baslik: i.baslik, alt: `${i.kategori} · ${i.okumaDk} dk okuma${ek('ipuclari', s)}`, git: `#/ipucu/${s}`}),
    uzmanlar: (d, s) => ({avatar: {ad: d.harf}, baslik: d.ad, alt: `${d.unvan} · ${d.sehir}${ek('uzmanlar', s)}`, git: `#/uzman/profil/${s}`})
  };
  const panel = (tur, ctx) => {
    const l = ogeler(tur, ctx), t = T(tur);
    if (!l.length) return DD.bos({ikon: t.ikon, baslik: `Kayıtlı ${t.ad.toLocaleLowerCase('tr')} yok`, metin: BOS_METIN[tur], eylem: {metin: t.bos, tur: 'secondary', git: t.liste}});
    if (tur === 'programlar') return `<div class="dd-yigin-12">${l.map(({x}) => DD.programKart(x, {tur: 'row', kayitli: true})).join('')}</div>`;
    return DD.yuzey(DD.satirlar(l.map(({x, s}) => DD.satirKap(SATIR[tur](x, s), kaldirBtn(tur, s, x.ad || x.baslik)))));
  };
  const secili = ctx => ctx.tur || (T(ctx.sorgu.tur) ? ctx.sorgu.tur : 'tarifler');
  const toplam = ctx => TURLER.reduce((t, x) => t + ogeler(x.tur, ctx).length, 0);

  let hataGosterildi = false;
  DD.ekran('kaydedilenler', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Kaydedilenler',
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      const s = secili(ctx), n = toplam(ctx);
      const seg = DD.segment({ad: 'kayit-tur', etiket: 'Kayıt türü', kaydir: true, secili: s, ogeler: TURLER.map(x => ({ad: x.ad, deger: x.tur, sayi: ogeler(x.tur, ctx).length}))});
      const giris = n
        ? DD.p(`**${n} içerik** kaydettin. Kayıttan çıkardığın öğeyi hemen **geri alabilirsin**.`, {ton: 'ikincil'})
        : DD.p('Henüz bir şey kaydetmedin. Program, tarif, besin, ipucu ve diyetisyenlerdeki **kaydet** düğmesi öğeyi buraya ekler.', {ton: 'ikincil'});
      return `<div class="dd-bolum dd-yigin">${giris}${seg}<div data-yuva="kayit">${panel(s, ctx)}</div></div>`;
    },
    sonra: (kok, ctx) => {
      const yuva = () => kok.querySelector('[data-yuva="kayit"]');
      const cikar = (tur, s) => {
        const once = oku(tur, ctx), ad = (KAYNAK[tur](s)?.ad || KAYNAK[tur](s)?.baslik);
        yaz(tur, once.filter(x => x !== s));
        DD.tazele();
        DD.toast(`**${ad}** kayıttan çıkarıldı`, {ikon: 'kaydet', eylem: 'Geri al', onEylem: () => { yaz(tur, once); DD.tazele(); }, yerine: true});
      };
      const c = [
        DD.on(kok, 'kayit-tur', v => { ctx.tur = v; yuva().innerHTML = panel(v, ctx); }),
        DD.eylem(kok, 'kaldir', el => { const [tur, s] = el.dataset.id.split('|'); cikar(tur, s); }),
        // Program kartındaki kaydet düğmesi: kartı kendi çevirir, kayıttan çıkarma burada yazılır.
        DD.eylem(kok, 'kaydet', el => cikar('programlar', el.dataset.id))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
