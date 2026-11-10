/* Kaydedilenler (#/kaydedilenler). Web karşılığı: hesabim/kaydedilenler (uye-kaydedilenler.js).
 * Gastro kalıbı (profil.js H9 Kaydettiklerim): sayılı sayfa başlığı, tür segmenti; tarif, besin ve ipucu 2 sütun püf kartı ızgarası (DD.icerikKart),
 *   programlar DD.programKart ızgarası, diyetisyenler kartsız satır. Kartı basılı tutmak (dd-uzun 'kayit') kayıttan çıkarma sheet'ini açar.
 * Durum: kayitliProgramlar (program-detay sözleşmesi, varsayılan []), kayitli-tarifler, kayitli-besinler, kayitli-ipuclari, kayitli-uzmanlar (slug dizileri;
 *   varsayılan DDV.uye.kayitli, yeni hesapta []). Kayıt tarihi DDV.uye.kayitli.tarihler'den; sonradan kaydedilen öğe tarihsiz en üstte durur.
 * Detay rotaları: #/program/:slug, #/tarif/:slug, #/besin/:slug, #/ipucu/:slug, #/uzman/profil/:slug. #/kaydedilenler?tur=tarifler sekmeyi açar, ?hal=bos, ?hal=hata. */
(() => {
  const TURLER = [
    {tur: 'programlar', ad: 'Programlar', anahtar: 'kayitliProgramlar', kisa: 'program', ikon: 'program', liste: '#/programlar', bos: 'Programları incele'},
    {tur: 'tarifler', ad: 'Tarifler', anahtar: 'kayitli-tarifler', kisa: 'tarif', ikon: 'ogun', liste: '#/tarifler', bos: 'Tariflere göz at'},
    {tur: 'besinler', ad: 'Besinler', anahtar: 'kayitli-besinler', kisa: 'besin', ikon: 'apple-whole', liste: '#/besinler', bos: 'Besinlere göz at'},
    {tur: 'ipuclari', ad: 'İpuçları', anahtar: 'kayitli-ipuclari', kisa: 'ipucu', ikon: 'ipucu', liste: '#/ara', bos: 'İpuçlarını oku'},
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
  // Püf kartı: dokunuş detaya gider, basılı tutmak kayıttan çıkarma sheet'ini açar.
  const KART = {
    tarifler: (y, s) => ({gorsel: y.gorsel, kategori: y.kategori, baslik: y.ad, meta: `${y.sureDk} dk · ${DD.sayi(y.porsiyonKcal)} kcal`, git: `#/tarif/${s}`}),
    besinler: (b, s) => ({gorsel: b.gorsel, kategori: b.kategori, baslik: b.ad, meta: `100 g · ${DD.sayi(b.kcal)} kcal`, git: `#/besin/${s}`}),
    ipuclari: (i, s) => ({gorsel: i.gorsel, kategori: i.kategori, baslik: i.baslik, meta: `${i.okumaDk} dk okuma`, git: `#/ara?q=${encodeURIComponent(i.baslik)}`})
  };
  const kart = (tur, x, s) => DD.icerikKart({...KART[tur](x, s), attrs: `data-uzun="kayit" data-kayit="${DD.esc(`${tur}|${s}`)}"`});
  const uzmanSatir = (d, s) => DD.satirKap({avatar: {ad: d.harf}, baslik: d.ad, alt: `${d.unvan} · ${d.sehir}${ek('uzmanlar', s)}`, git: `#/uzman/profil/${s}`}, kaldirBtn('uzmanlar', s, d.ad));
  const panel = (tur, ctx) => {
    const l = ogeler(tur, ctx), t = T(tur);
    if (!l.length) return DD.bos({ikon: t.ikon, baslik: `Kayıtlı ${t.ad.toLocaleLowerCase('tr')} yok`, metin: BOS_METIN[tur], eylem: {metin: t.bos, tur: 'secondary', git: t.liste}});
    if (tur === 'programlar') return `<div class="dd-izgara">${l.map(({x}) => DD.programKart(x, {kayitli: true})).join('')}</div>`;
    if (tur === 'uzmanlar') return DD.satirlar(l.map(({x, s}) => uzmanSatir(x, s)));
    return `<div class="dd-yigin-12">${DD.p('Kartı **basılı tut**, kayıttan çıkar ya da detayını aç.', {ton: 'ikincil', meta: true})}<div class="dd-izgara">${l.map(({x, s}) => kart(tur, x, s)).join('')}</div></div>`;
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
      const bas = DD.metinBlok({etiket: n ? `${n} içerik` : null, baslik: 'Kaydedilenler', metin: n
        ? 'Kayıttan çıkardığın öğeyi hemen **geri alabilirsin**.'
        : 'Henüz bir şey kaydetmedin. Program, tarif, besin, ipucu ve diyetisyenlerdeki **kaydet** düğmesi öğeyi buraya ekler.'});
      return DD.gruplar([{html: seg}, {html: `<div data-yuva="kayit">${panel(s, ctx)}</div>`}], {bas});
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
        (() => {
          const uzun = ev => {
            if (ev.detail?.ad !== 'kayit') return;
            const el = ev.target.closest('[data-kayit]'), [tur, s] = el.dataset.kayit.split('|'), x = KAYNAK[tur](s), git = el.dataset.git;
            DD.sheet({
              baslik: x.ad || x.baslik,
              html: DD.satirlar([
                {ikon: 'arrow-right', baslik: 'Detayını aç', git, attrs: 'data-sheet-kapat'},
                {ikon: 'kaydet', baslik: 'Kayıttan çıkar', yikici: true, veri: {eylem: 'k-cikar'}, attrs: 'data-sheet-kapat', ok: false}
              ]),
              sonra: d => DD.eylem(d, 'k-cikar', () => cikar(tur, s))
            });
          };
          kok.addEventListener('dd-uzun', uzun);
          return () => kok.removeEventListener('dd-uzun', uzun);
        })(),
        // Program kartındaki kaydet düğmesi: kartı kendi çevirir, kayıttan çıkarma burada yazılır.
        DD.eylem(kok, 'kaydet', el => cikar('programlar', el.dataset.id))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
