/* Bağlı uygulamalar ve cihazlar (#/cihazlar, #/cihaz/:id). Veri DDV.cihazlar (veri/cihazlar.js), durum 'cihaz-baglanti'; telefon bileşenleri kanon/dd-cihaz.js.
 * Liste: sağlık uygulaması (Apple Health / Health Connect; telefona uymayan "Bu telefonda yok"), akıllı tartı (doğrudan bağlantılar "Yakında"),
 *   Dada uygulamaları (#/ayarlar/bagli'de yönetilir), gizlilik. Hiç sağlık bağlantısı yoksa üstte DD.bos + bağla eylemi.
 * Detay: bağlıysa eşitleme (son eşitleme, kaynaklar, Şimdi eşitle: dönen ikon → "Eşitlendi" onayı), veri türleri beş grupta (Aktivite, Vücut ölçüleri,
 *   Beslenme, Uyku, Kalp), her tür tek iki katlı satır; sağda yön ikonu + anahtar (↓ gelir, ↑ yazılır; kilo ve su iki anahtarlı), hepsi kapalıysa uyarı bandı;
 *   gizlilik satırı, "Bağlantıyı kes ve veriyi sil" (yıkıcı DD.dialog → listeye döner, E5 'cihaz-izin'.silindi yazılır).
 *   Bağlı değilse gelen/yazılan özet maddeleri + Bağla düğmesi. Yakında: platform servisine yönlendirme + hazır olunca haber ver.
 * Bağlanma akışı (#/cihaz/:id?adim=…, tam ekran): bilgi (DD.cihazIzinAdim, servis tonu) → açık rıza (E5 window.DDCihazIzin.rizaAl({kaynak:'cihazlar'}):
 *   rıza varsa doğrudan geçer, yoksa E5'in rıza sheet'i; false dönerse bağlanmaz) → telefonun izin sayfası (DD.sistemIzinPenceresi) → tamam (DD.cihazBasari).
 *   ?adim=izin bilgi adımını açar ve aynı zinciri hemen başlatır. Son eşitleme alanı: 'cihaz-baglanti'.<id>.sonEsitleme (tek alan).
 * ?platform=ios|android (varsayılan ios); bağlantılar sorguyu taşır. Haller: ?hal=bos (hiç bağlantı yok), ?hal=koptu (yeniden bağlan; anahtarlar ve eşitleme kapalı),
 *   ?hal=cevrimdisi (router şeridi tek "Son eşitleme"yi söyler; ekrandaki eşitleme zamanı gizli, Şimdi eşitle pasif); yukleniyor ve hata router'dan. Misafire giriş çağrısı. */
(() => {
  const V = () => DDV.cihazlar;
  const ANAHTAR = 'cihaz-baglanti';
  const GORSEL = 'assets/gorsel/hero/ritim-sakin.webp';
  const tum = () => DD.durum.oku(ANAHTAR, {});
  // Var olan nesne korunur (E2 ve E5 de bu anahtarı okur/yazar).
  const yaz = (id, ek) => DD.durum.yaz(ANAHTAR, {...tum(), [id]: {...(tum()[id] || {}), ...ek}});
  const servis = id => V().servisler.find(s => s.id === id);
  const platform = ctx => (ctx.sorgu.platform === 'android' ? 'android' : 'ios');
  const platformServis = ctx => servis(V().platformlar[platform(ctx)].servis);
  const url = (yol, ctx, ek) => { const q = [ek, platform(ctx) === 'android' && 'platform=android'].filter(Boolean).join('&'); return q ? `${yol}?${q}` : yol; };
  const akisUrl = (s, ctx, adim = 'bilgi') => url(`#/cihaz/${s.id}`, ctx, `adim=${adim}`);
  const simdi = () => `Bugün ${DD.ogun.noktali(DDV.bugun.simdi)}`;
  const kucuk = s => s.charAt(0).toLocaleLowerCase('tr') + s.slice(1);
  const cevrimdisi = ctx => ctx.sorgu.hal === 'cevrimdisi';
  const izinler = () => DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'});
  const esitleYaz = (s, ctx, v) => { if (s.id === platformServis(ctx).id) DD.durum.yaz('veri-izinleri', {...izinler(), esitle: v}); };

  // ---------- Rıza (E5: cihaz-izin; etkin = genel rıza && cihaz rızası) ----------
  const cihazIzin = () => (window.DDCihazIzin ? DDCihazIzin.oku() : {...DDV.hesap.cihazIzin, ...DD.durum.oku('cihaz-izin', {})});
  const rizaEtkin = () => (window.DDCihazIzin ? DDCihazIzin.rizaEtkin() : !!izinler().riza && !!cihazIzin().riza);
  // E5 rıza zinciri: rizaAl rıza varsa true döner, yoksa rıza sheet'ini açar. Yoksa (eski sürüm) Veri izinlerim'in rıza sheet'ine gider.
  const rizaIste = () => {
    if (typeof window.DDCihazIzin?.rizaAl === 'function') return Promise.resolve(DDCihazIzin.rizaAl({kaynak: 'cihazlar'}));
    if (rizaEtkin()) return Promise.resolve(true);
    DD.git('#/veri-izinleri?riza=cihaz');
    return Promise.resolve(false);
  };

  // ---------- Veri türleri (id'ler arka uç adları; tür yon + id ile tekil, ekranda id başına tek satır) ----------
  const turler = s => V().turler.filter(t => !s.turler || s.turler.includes(`${t.yon}:${t.id}`));
  const acik = (izin, yon, id) => !!izin?.[yon]?.[id];
  const izinYap = (s, f) => { const o = {oku: {}, yaz: {}}; turler(s).forEach(t => { o[t.yon][t.id] = f(t); }); return o; };
  const izinBirles = (s, k) => izinYap(s, t => (k?.[t.yon]?.[t.id] ?? t.acik));
  const say = (s, izin) => ({gelen: turler(s).filter(t => t.yon === 'oku' && acik(izin, 'oku', t.id)).length, giden: turler(s).filter(t => t.yon === 'yaz' && acik(izin, 'yaz', t.id)).length});
  // Grup satırları: aynı id'nin iki yönü tek satır. Yön sırası grubun tek yönlü satırlarıyla aynı sütuna düşsün diye: grupta yalnız yazılan tür varsa ↓↑, yoksa ↑↓.
  const grupSatirlari = (s, g) => {
    const l = turler(s).filter(t => t.grup === g), ids = [...new Set(l.map(t => t.id))];
    const yazSon = ids.some(id => l.filter(t => t.id === id).every(t => t.yon === 'yaz'));
    return ids.map(id => {
      const y = l.filter(t => t.id === id).sort((a, b) => ((a.yon === 'yaz') - (b.yon === 'yaz')) * (yazSon ? 1 : -1));
      const ana = y.find(t => t.yon === 'oku') || y[0];
      return {id, ad: ana.ad, ikon: ana.ikon, alt: y.length > 1 ? ana.ciftAlt || ana.alt : ana.alt, yonler: y};
    });
  };
  const adlar = (s, yon) => [...new Set(turler(s).filter(t => t.yon === yon).map(t => t.ad))].map((a, i) => (i ? kucuk(a) : a)).join(', ');

  // Servisin o anki hali: {bagli, kopuk, yok (bu telefonda yok), yakinda, son, izin, haber}
  const hal = (s, ctx) => {
    const k = tum()[s.id] || {}, h = ctx.sorgu.hal, ps = platformServis(ctx);
    if (s.yakinda) return {yakinda: true, haber: !!k.haber};
    if (s.platform && s.platform !== platform(ctx)) return {yok: true};
    if (h === 'bos') return {bagli: false, izin: izinBirles(s)};
    const es = izinler().esitle;
    const bagli = s.id === ps.id && es !== undefined ? !!es : !!k.bagli;
    const son = (typeof k.sonEsitleme === 'string' && k.sonEsitleme) || DD.durum.oku('hesap-ayar', {})?.bagli?.sonEsitleme?.saglik || DDV.hesap.varsayilan.bagli.sonEsitleme.saglik || 'az önce';
    if (h === 'koptu' && s.id === ps.id) return {bagli: true, kopuk: true, son: V().koptuSon, izin: izinBirles(s, k.izin)};
    return {bagli, son: bagli ? son : null, izin: izinBirles(s, k.izin)};
  };
  const ROZET = {
    bagli: {metin: 'Bağlı', ton: 'basari', ikon: 'circle-check'},
    degil: {metin: 'Bağlı değil', ton: 'notr', ikon: 'circle-minus'},
    kopuk: {metin: 'Bağlantı koptu', ton: 'hata', ikon: 'link-slash'},
    yakinda: {metin: 'Yakında', ton: 'uyari', ikon: 'hourglass-half'},
    yok: {metin: 'Bu telefonda yok', ton: 'notr', ikon: 'mobile-screen'}
  };
  const rozet = d => DD.durumRozet(ROZET[d.yakinda ? 'yakinda' : d.yok ? 'yok' : d.kopuk ? 'kopuk' : d.bagli ? 'bagli' : 'degil']);
  const ikon = (s, d) => DD.ikonKutu({ikon: s.ikon, ton: d.yok ? 'notr' : s.ton, boyut: 'lg'});
  const PLATFORM_AD = {ios: 'iPhone', android: 'Android'};

  // ---------- Liste ----------
  const kart = (s, ctx) => {
    const d = hal(s, ctx);
    const meta = d.son && !cevrimdisi(ctx) ? `<small>Son eşitleme ${DD.esc(kucuk(d.son))}</small>` : '';
    return DD.satir({sol: ikon(s, d), baslik: s.ad, alt: d.yok ? `${PLATFORM_AD[s.platform]} telefonlarda çalışır.` : s.aciklama, ozet: true,
      ek: `<span class="dd-sira">${rozet(d)}${meta}</span>`, git: url(`#/cihaz/${s.id}`, ctx)});
  };
  const dadaSatirlar = () => {
    const b = DD.durum.oku('bagli-uygulamalar', {});
    return V().dada.map(x => ({sol: DD.ikonKutu({ikon: x.ikon, boyut: 'lg'}), baslik: x.ad, alt: 'Profilin ve hedefin eşitlenir.',
      ek: `<span class="dd-sira">${DD.durumRozet(ROZET[b[x.id] ? 'bagli' : 'degil'])}</span>`, git: '#/ayarlar/bagli'}));
  };
  const liste = ctx => {
    const p = platform(ctx), ps = platformServis(ctx), d = hal(ps, ctx);
    const saglik = V().servisler.filter(s => s.grup === 'saglik').sort((a, b) => (b.platform === p) - (a.platform === p));
    const bas = d.kopuk
      ? DD.bant({ton: 'hata', ikon: 'link-slash', baslik: `${ps.ad} bağlantısı koptu`, metin: `Son eşitleme **${d.son}**. İzinler telefonundan kapatılmış olabilir.`, eylem: {metin: 'Yeniden bağlan', git: akisUrl(ps, ctx)}})
      : !d.bagli
        ? DD.bos({ikon: ps.ikon, baslik: 'Henüz bağlı uygulama yok', metin: `${ps.ad}’i bağla; adımın, kilon ve uykun **kendiliğinden** gelsin.`, eylem: {metin: `${ps.ad}’i bağla`, ikon: 'link', git: akisUrl(ps, ctx)}})
        : DD.p('Bağladığın uygulamalardan **adım, kilo ve uyku** kendiliğinden gelir; öğünlerin, suyun ve kilon geri yazılır.', {ton: 'ikincil'});
    return DD.gruplar([
      {baslik: 'Sağlık uygulaması', html: DD.satirlar(saglik.map(s => kart(s, ctx)))},
      {baslik: 'Akıllı tartı', html: `<div class="dd-yigin-12">${DD.p(`Tartın ${ps.ad}’e yazıyorsa kilon **zaten oradan** gelir. Doğrudan bağlantı yakında.`, {ton: 'ikincil'})}${DD.satirlar(V().servisler.filter(s => s.grup === 'tarti').map(s => kart(s, ctx)))}</div>`},
      {baslik: 'Dada uygulamaları', satirlar: dadaSatirlar()},
      {baslik: 'Gizlilik', html: `<div class="dd-yigin-12">${DD.maddeler(V().gizlilik)}${DD.satirlar([{sol: DD.ikonKutu({ikon: 'shield-halved', ton: 'notr', boyut: 'lg'}), baslik: 'Veri izinlerim', alt: 'Açık rıza ve diyetisyenle paylaşım', git: '#/veri-izinleri'}])}</div>`}
    ], {bas});
  };

  // ---------- Detay ----------
  const basSatir = (s, d) => DD.satir({sol: ikon(s, d), baslik: s.ad, alt: s.aciklama, ek: `<span class="dd-sira">${rozet(d)}</span>`});
  const ozetMaddeler = s => [['arrow-down', 'Gelenler', `${adlar(s, 'oku')}.`], ['arrow-up', 'Yazılanlar', `${adlar(s, 'yaz')}.`], ['ban', 'Reklam için kullanılmaz', 'İzni istediğin an Ayarlar’dan geri alırsın.']];
  const uyari = (s, d) => {
    const n = say(s, d.izin);
    return n.gelen + n.giden ? '' : DD.bant({ton: 'uyari', baslik: 'Hiçbir veri aktarılmıyor', metin: 'Bağlantı duruyor ama **açık veri türü kalmadı**. Bir türü açınca eşitleme sürer.'});
  };
  const ESITLE = {
    hazir: d => DD.btn({metin: 'Şimdi eşitle', ikon: 'arrows-rotate', tur: 'secondary', tam: true, pasif: d.kopuk || d.cevrimdisi, veri: {eylem: 'esitle'}}),
    suruyor: () => DD.btn({metin: 'Eşitleniyor…', ikon: 'arrows-rotate', tur: 'secondary', tam: true, pasif: true, sinif: 'dd-cdonen'}),
    tamam: () => DD.btn({metin: 'Eşitlendi', ikon: 'circle-check', tur: 'tonal', tam: true, pasif: true})
  };
  const turSatir = (t, d) => DD.satir({ikon: t.ikon, baslik: t.ad, alt: t.alt, duz: true,
    sag: DD.cihazYonlar({ad: `tur-${t.id}`, yonler: t.yonler.map(y => ({yon: y.yon, secili: acik(d.izin, y.yon, t.id), pasif: d.kopuk, etiket: `${t.ad}, ${y.yon === 'oku' ? 'gelir' : 'yazılır'}`}))})});

  const bagliDetay = (s, d, ctx) => DD.gruplar([
    d.kopuk && {html: DD.bant({ton: 'hata', ikon: 'link-slash', baslik: 'İzinler kapalı görünüyor', metin: `${s.ad} izinleri telefonundan kapatılmış olabilir. **Yeniden bağlan**, eşitleme sürsün.`, eylem: {metin: 'Yeniden bağlan', git: akisUrl(s, ctx)}})},
    {baslik: 'Eşitleme', html: `<div class="dd-yigin-12">${DD.satirlar([
      ...(d.cevrimdisi ? [] : [DD.satir({ikon: 'clock-rotate-left', baslik: 'Son eşitleme', deger: d.son, duz: true, attrs: 'data-son-esitleme'})]),
      {ikon: 'mobile-screen', baslik: 'Veri kaynakları', alt: s.kaynaklar.join(', ')}
    ])}<div data-yuva="esitle">${ESITLE.hazir(d)}</div>${d.cevrimdisi ? DD.veriYok('Bağlantı gelince **kendiliğinden** eşitlenir.') : ''}</div>`},
    {html: `<div class="dd-yigin-12">${DD.cihazYonAciklama({gelen: 'Dada Diet’e gelir', giden: `${s.ad}’e yazılır`})}<div data-yuva="uyari">${uyari(s, d)}</div></div>`},
    ...V().gruplar.map(g => { const l = grupSatirlari(s, g.id); return l.length ? {baslik: g.ad, html: DD.satirlar(l.map(t => turSatir(t, d)))} : null; }),
    {html: DD.satirlar([
      {ikon: 'shield-halved', baslik: 'Gizlilik ve veri izinlerim', alt: 'Sağlık verin reklam için kullanılmaz.', git: '#/veri-izinleri'},
      {ikon: 'link-slash', baslik: 'Bağlantıyı kes ve veriyi sil', alt: `${s.ad}’ten gelen kayıtlar Dada Diet’ten silinir.`, yikici: true, veri: {eylem: 'kes'}}
    ])}
  ], {bas: basSatir(s, d)});

  const bagliDegilDetay = (s, d, ctx) => DD.gruplar([
    {html: `<div class="dd-yigin"><div class="${['protein', 'bilgi', 'notr'].includes(s.ton) ? `dd-cizin is-${s.ton}` : ''}">${DD.maddeler(ozetMaddeler(s))}</div>${DD.btn({metin: `${s.ad}’i bağla`, ikon: 'link', tam: true, git: akisUrl(s, ctx)})}</div>`}
  ], {bas: basSatir(s, d)});

  const yokDetay = (s, d, ctx) => {
    const ps = platformServis(ctx);
    return DD.gruplar([{html: DD.bos({ikon: ps.ikon, baslik: `Bu telefonda ${ps.ad} kullanılır`, metin: `${s.ad} ${PLATFORM_AD[s.platform]} telefonlarda çalışır. Sağlık verin bu telefonda **${ps.ad}** üzerinden gelir.`, eylem: {metin: `${ps.ad}’e git`, ikon: ps.ikon, yerine: url(`#/cihaz/${ps.id}`, ctx)}})}], {bas: basSatir(s, d)});
  };

  const yakindaDetay = (s, d, ctx) => {
    const ps = platformServis(ctx);
    return DD.gruplar([
      {html: DD.bant({ton: 'bilgi', baslik: 'Doğrudan bağlantı yakında', metin: `Tartın ${ps.ad}’e yazıyorsa kilon **bugün de** oradan gelir.`, eylem: {metin: `${ps.ad}’e git`, yerine: url(`#/cihaz/${ps.id}`, ctx)}})},
      {baslik: 'Gelecek veriler', satirlar: turler(s).map(t => ({ikon: t.ikon, baslik: t.ad, alt: t.alt}))},
      {html: DD.satirlar([DD.toggle({ad: 'haber', ikon: 'bell', etiket: 'Hazır olunca haber ver', alt: 'Bağlantı açılınca bildirim gelir.', secili: d.haber})])}
    ], {bas: basSatir(s, d)});
  };

  // ---------- Bağlanma akışı ----------
  const bilgi = s => DD.cihazIzinAdim({gorsel: GORSEL, ikon: s.ikon, ton: s.ton, baslik: `${s.ad}’i bağla`, metin: s.bilgi, maddeler: ozetMaddeler(s), adim: 1, toplam: 2});
  const gelenler = izin => {
    const g = DDV.hesap.cihazVerisi?.gunler || [], son = g[g.length - 1];
    if (!son) return [];
    const kilo = [...g].reverse().find(x => x.kiloKg != null);
    return [
      acik(izin, 'oku', 'adim') && ['shoe-prints', 'Adım', `Bugün ${DD.sayi(son.adim)} adım`],
      acik(izin, 'oku', 'kilo') && kilo && ['weight-scale', 'Kilo', `Son ölçüm ${DD.ondalik(kilo.kiloKg)} kg`],
      acik(izin, 'oku', 'uyku') && ['bed', 'Uyku', `Dün gece ${DD.sure(son.uykuDk)}`]
    ].filter(Boolean);
  };
  const tamam = (s, ctx) => {
    const d = hal(s, ctx), n = say(s, d.izin);
    return DD.cihazBasari({baslik: `${s.ad} bağlandı`, metin: `İlk eşitleme tamam: **${n.gelen} veri geliyor, ${n.giden} veri yazılıyor**. Her birini bağlantı ayarından ayrı kapatırsın.`,
      maddeler: gelenler(d.izin), ana: {metin: 'Bitti', ikon: 'onay', veri: {eylem: 'bitti'}}});
  };
  const pencere = (s, ctx) => {
    const p = platform(ctx), i = hal(s, ctx).izin, l = turler(s), m = y => l.filter(t => t.yon === y).map(t => ({id: t.id, ad: t.ad, ikon: t.ikon, acik: acik(i, y, t.id)}));
    DD.sistemIzinPenceresi({platform: p, servis: {ad: s.ad, ikon: s.ikon}, uygulama: {ad: 'Dada Diet'}, oku: m('oku'), yaz: m('yaz'), yol: V().platformlar[p].yol,
      aciklama: 'Dada Diet adımını, kilonu ve uykunu Sağlık dosyanda gösterir; öğünlerini ve suyunu kaydeder. Sağlık verin reklam için kullanılmaz.',
      bekle: DD.TK.motion.reveal * 3
    }).then(r => {
      if (!r.izin) { DD.toast('İzin vermedin; **bağlantı kurulmadı**', {ikon: 'bilgi'}); return; }
      yaz(s.id, {bagli: true, izin: {oku: r.oku, yaz: r.yaz}, sonEsitleme: simdi()});
      esitleYaz(s, ctx, true);
      DD.yerine(akisUrl(s, ctx, 'tamam'));
    });
  };
  const baglan = (s, ctx) => rizaIste().then(ok => {
    if (ok) pencere(s, ctx);
    else if (/^#\/cihaz\//.test(location.hash)) DD.toast('Açık rıza olmadan **bağlantı kurulmaz**', {ikon: 'bilgi'});
  });

  // ---------- Ekran ----------
  const adimAd = () => (location.hash.match(/[?&]adim=(bilgi|izin|tamam)\b/) || [])[1];
  DD.ekran('cihazlar', {
    // Bağlanma akışı tam ekran, liste ve detay alt ekran.
    get tur() { return adimAd() ? 'tam' : 'alt'; },
    get ust() { const m = location.hash.match(/^#\/cihaz\/([^?]+)/); return !m ? '#/ayarlar' : adimAd() ? `#/cihaz/${m[1]}` : '#/cihazlar'; },
    baslik: ctx => (ctx.param.id ? servis(ctx.param.id)?.ad || 'Bağlantı' : 'Bağlı uygulamalar ve cihazlar'),
    yenile: true,
    iskelet: 'satir',
    ciz: ctx => {
      if (!DD.uye()) return DD.girisGerekli({ikon: 'heart-pulse', baslik: 'Bağlı uygulamalar ve cihazlar', metin: 'Sağlık uygulamalarını **bağlamak** için giriş yap.'});
      if (!ctx.param.id) return liste(ctx);
      const s = servis(ctx.param.id);
      if (!s) return DD.bos({tam: true, ikon: 'link-slash', baslik: 'Bu bağlantı bulunamadı', metin: 'Bağlı uygulamalar listesinden **yeniden seç**.', eylem: {metin: 'Bağlı uygulamalar ve cihazlar', yerine: url('#/cihazlar', ctx)}});
      const d = {...hal(s, ctx), cevrimdisi: cevrimdisi(ctx)}, adim = adimAd();
      if (adim && !s.yakinda && !d.yok) return adim === 'tamam' ? tamam(s, ctx) : bilgi(s);
      if (d.yok) return yokDetay(s, d, ctx);
      if (d.yakinda) return yakindaDetay(s, d, ctx);
      return d.bagli ? bagliDetay(s, d, ctx) : bagliDegilDetay(s, d, ctx);
    },
    altBar: ctx => {
      const s = servis(ctx.param.id), adim = adimAd();
      if (!DD.uye() || !s || s.yakinda || hal(s, ctx).yok || !adim || adim === 'tamam') return '';
      return DD.altEylem({dugmeler: [{metin: 'Şimdi değil', tur: 'secondary', geri: true}, {metin: 'Devam et', veri: {eylem: 'devam'}}]});
    },
    sonra: (kok, ctx) => {
      if (!DD.uye() || !ctx.param.id) return null;
      const s = servis(ctx.param.id);
      if (!s) return null;
      const adim = adimAd();
      if (adim === 'tamam') return DD.eylem(kok, 'bitti', () => DD.geri(url(`#/cihaz/${s.id}`, ctx)));
      if (adim) {
        if (adim === 'izin') setTimeout(() => { if (kok.isConnected) baglan(s, ctx); });
        return DD.eylem(kok, 'devam', () => baglan(s, ctx));
      }
      const d = {...hal(s, ctx), cevrimdisi: cevrimdisi(ctx)};
      if (s.yakinda) return DD.on(kok, 'haber', v => { yaz(s.id, {haber: v}); DD.toast(v ? `**${s.ad}** hazır olunca haber vereceğiz` : 'Haber vermeyi kapattın', {ikon: 'bildirim', yerine: true}); });
      if (!d.bagli) return null;
      const yuva = ad => kok.querySelector(`[data-yuva="${ad}"]`);
      const c = [
        ...turler(s).map(t => DD.on(kok, `tur-${t.id}-${t.yon}`, v => {
          const i = hal(s, ctx).izin; i[t.yon][t.id] = v; yaz(s.id, {izin: i});
          const u = yuva('uyari'); if (u) u.innerHTML = uyari(s, {...d, izin: i});
        })),
        DD.eylem(kok, 'esitle', () => {
          if (d.cevrimdisi || navigator.onLine === false) { DD.toast('Bağlantı yok; **bağlantı gelince** eşitlenir', {tur: 'hata', ikon: 'wifi'}); return; }
          const y = yuva('esitle'); if (!y) return;
          y.innerHTML = ESITLE.suruyor();
          setTimeout(() => {
            const son = simdi();
            yaz(s.id, {sonEsitleme: son});
            const deger = kok.querySelector('[data-son-esitleme] .dd-satir-deger');
            if (deger) deger.textContent = son;
            // Başarı onayı: düğme kısa süre "Eşitlendi" olur, sonra eski haline döner.
            y.innerHTML = ESITLE.tamam();
            y.setAttribute('aria-live', 'polite');
            setTimeout(() => { if (y.isConnected) y.innerHTML = ESITLE.hazir(d); }, DD.TK.motion.reveal * 6);
          }, DD.azHareket() ? 0 : DD.TK.motion.reveal * 3);
        }),
        DD.eylem(kok, 'kes', () => DD.dialog({
          baslik: `${s.ad} bağlantısı kesilsin mi?`,
          metin: `${s.ad}’ten gelen **tüm kayıtların** (${kucuk(adlar(s, 'oku'))}) Dada Diet’ten silinir. ${s.ad}’teki verilerine dokunulmaz.`,
          eylem: 'Kes ve sil', iptal: 'Vazgeç', yikici: true
        }).then(evet => {
          if (!evet) return;
          yaz(s.id, {bagli: false, izin: null, sonEsitleme: null});
          esitleYaz(s, ctx, false);
          // E5: cihaz verisi silinir (Sağlık dosyam ve Veri izinlerim silinmiş hali gösterir).
          if (typeof window.DDCihazIzin?.cihazVerisiSil === 'function') DDCihazIzin.cihazVerisiSil(s.id);
          else DD.durum.yaz('cihaz-izin', {...cihazIzin(), silindi: DD.bugunIso()});
          DD.geri(url('#/cihazlar', ctx));
          DD.toast(`${s.ad} bağlantısı kesildi; **gelen veriler silindi**`, {ikon: 'link-slash'});
        }))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
