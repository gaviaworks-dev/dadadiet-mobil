/* Beslenme planım (#/beslenme-plani). Gastro alt sayfa kalıbı: DD.gruplar, kartsız satırlar; bugünün öğünleri Bugün'deki öğün kartıyla aynı
 *   (DD.ogunListe + "Plana göre" segmenti Uydum · Değiştirdim · Atladım; Değiştirdim alternatif tarif seçtirir).
 * Web karşılığı: hesabim/beslenme-planim (uye-beslenme-planim.js): diyetisyenin gönderdiği plan, bugünün öğünleri,
 * alternatifler, diyetisyen notu, plana not, plan geçmişi. Plan künyesi DDV.uye.plan; bugünün öğün içeriği DDV.bugun.ogunler; saat ve durum DD.ogun.hesap().
 * Durum: öğün işaretleri DD.ogun.isaretle(tur, 'yedi'|'atladi'|null) ile yazılır (bugun-ogun, ogun-zaman; Bugün ekranıyla ortak).
 *   plan-alternatif {iso:{tur:yemekSlug}} (yalnız o günün planına), plan-notlari [{tarih, konu, metin}] (varsayılan DDV.uye.planNotlari); not ayrıca uzman-sohbet'e eklenir.
 * #/beslenme-plani?hal=bos diyetisyensiz hal, ?hal=hata bağlantı hatası. */
(() => {
  const P = () => DDV.uye.plan;
  const B = () => DDV.benimDiyetisyenim;
  const benim = () => DDV.diyetisyenler.find(d => d.slug === B().diyetisyen);
  const planYok = ctx => ctx.sorgu.hal === 'bos' || DD.yeniHesap() || !DDV.kullanici.diyetisyen;
  const nk = s => DD.ogun.noktali(s);
  const ilkCumle = m => m.replace(/^([^.;]+[.;])/, '**$1**');

  // ---------- Bugünün öğünleri ----------
  const icerik = tur => DDV.bugun.ogunler.find(x => DD.ogun.TUR(x.id) === tur);
  const altOku = () => DD.durum.oku('plan-alternatif', {})[DD.bugunIso()] || {};
  const altYaz = (tur, slug) => { const t = DD.durum.oku('plan-alternatif', {}), g = {...(t[DD.bugunIso()] || {})}; if (slug) g[tur] = slug; else delete g[tur]; DD.durum.yaz('plan-alternatif', {...t, [DD.bugunIso()]: g}); };
  const yemek = slug => DDV.yemekler.find(y => y.slug === slug);
  // Öğünün geçerli değeri: alternatif seçildiyse tarifin bir porsiyonu, değilse plandaki öğün.
  const deger = tur => { const a = yemek(altOku()[tur]); if (a) return {kcal: a.porsiyonKcal, P: a.P || 0, K: a.K || 0, Y: a.Y || 0, Lif: a.Lif || 0}; const b = icerik(tur); return b ? {kcal: b.kcal, P: b.P, K: b.K, Y: b.Y, Lif: b.Lif} : null; };
  const ogunler = () => DD.ogun.hesap().ogunler.filter(o => o.durum !== 'kapali' && icerik(o.tur));
  // Öğün kartı: plan öğünü + bugünün işareti. Yedin + alternatif = Değiştirdim; Uydum alternatifi kaldırır.
  const kartOgun = o => {
    const b = icerik(o.tur), a = yemek(altOku()[o.tur]), d = deger(o.tur);
    const durum = o.durum === 'yedi' ? (a ? 'degisti' : 'dolu') : o.durum === 'atladi' ? 'atlandi' : 'planli';
    const planSecim = o.durum === 'yedi' ? (a ? 'degistir' : 'uygula') : o.durum === 'atladi' ? 'atla' : '';
    return {id: b.id, ad: o.ad, ikon: o.ikon, saat: nk(o.planlanan), durum, planSecim, besinler: a ? [{ad: a.ad}] : b.besinler, kcal: d?.kcal || 0, hedefKcal: b.kcal};
  };
  const bugunBolum = () => {
    const l = ogunler(), yenen = l.filter(o => o.durum === 'yedi'), plan = l.reduce((t, o) => t + (icerik(o.tur)?.kcal || 0), 0);
    const top = m => yenen.reduce((t, o) => t + (deger(o.tur)?.[m] || 0), 0), h = P().makro;
    const makro = Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, {alinan: top(m), hedef: h[m]}]));
    return `<div class="dd-yigin">${DD.ilerleme({n: yenen.length, hedef: l.length || 1, etiket: 'Plana uyum', deger: `${yenen.length} / ${l.length} öğün`})}${DD.ogunListe(l.map(kartOgun), {gunlukHedef: P().hedefKcal})}<div class="dd-yigin-12">${DD.bas('Plandan yediklerin', {html: `<span class="dd-t-meta dd-ton-ikincil">${DD.sayi(top('kcal'))} / ${DD.sayi(plan)} kcal</span>`})}${DD.makroCubuk(makro, {kart: false})}</div></div>`;
  };

  // ---------- Öğün düzeni ----------
  const duzenBolum = () => {
    const h = DD.ogun.hesap(), o = DD.ogun.oruc();
    let pencere = '';
    if (o) { const [oruc, yeme] = o.protokol.split('-').map(Number), bas = o.ilk_ogun_saati; pencere = DD.p(`Yeme pencerin **${nk(bas)}-${nk(DD.saatMetin(DD.saatDk(bas) + yeme * 60))}** (${oruc}:${yeme}). Öğün saatlerini diyetisyenin belirledi; **değişiklik için** ona yazabilirsin.`, {ton: 'ikincil', meta: true}); }
    return `<div class="dd-yigin-12">${DD.satirlar([...h.ogunler.filter(x => x.durum !== 'kapali').map(x => ({ikon: x.ikon, baslik: x.ad, alt: x.kaynak === 'plan' ? 'Diyetisyen planı' : 'Senin düzenin', deger: nk(x.planlanan)})), {ikon: 'saat', baslik: 'Öğün saatlerim', alt: 'Hatırlatıcı ve saat ayarları', git: '#/ogun-saatleri'}])}${pencere}</div>`;
  };

  // ---------- Notlar ----------
  const notlar = () => DD.durum.oku('plan-notlari', DDV.uye.planNotlari);
  const notBolum = d => {
    const l = notlar().slice().reverse();
    const liste = l.length ? DD.satirlar(l.map(n => ({ikon: 'gonder', baslik: n.metin, alt: `${n.konu} · ${DD.tarihUzun(n.tarih)}`}))) : DD.p('Planla ilgili **soru ya da değişiklik isteğin** varsa buradan diyetisyenine iletebilirsin.', {ton: 'ikincil'});
    return `<div class="dd-yigin-12">${DD.bilgi({etiket: `${d.kisaAd} · ${DD.tarihUzun(P().tarih)}`, ikon: 'comment-medical', metin: ilkCumle(P().not)})}${DD.bas('Senin notların')}${liste}${DD.btn({metin: 'Not yaz', ikon: 'duzenle', tur: 'secondary', tam: true, veri: {eylem: 'not-yaz'}})}</div>`;
  };
  const notSheet = () => {
    const d = benim(), a = DDV.kullanici.aktifProgram;
    DD.sheet({
      baslik: 'Diyetisyenine not',
      html: `<div class="dd-yigin" data-not-form>${DD.p(`Notun **${d.ad}** adlı diyetisyenine${a ? `, programının **${a.gun}. günü** bağlamıyla,` : ''} iletilir.`, {ton: 'ikincil'})}<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Konu</span>${DD.cipler({ad: 'not-konu', tur: 'tek', serit: false, secili: DDV.uye.notKonulari[0], ogeler: DDV.uye.notKonulari.map(k => ({metin: k, deger: k}))})}</div>${DD.input({ad: 'not-metin', etiket: 'Notun', cokSatir: true, yer: 'Diyetisyenine iletmek istediğini yaz', zorunlu: true})}</div>`,
      altBar: DD.btn({metin: 'Gönder', ikon: 'gonder', tam: true, veri: {eylem: 'not-gonder'}}),
      sonra: s => DD.eylem(s, 'not-gonder', () => {
        const metin = s.querySelector('[name="not-metin"]').value.trim(), konu = s.querySelector('[data-ad="not-konu"] [aria-pressed="true"]')?.dataset.cip || DDV.uye.notKonulari[0];
        if (metin.length < 3) { DD.toast('Notun boş kalamaz; **ne iletmek istediğini** yaz', {tur: 'hata'}); return; }
        DD.durum.yaz('plan-notlari', [...notlar(), {tarih: DD.bugunIso(), konu, metin}]);
        DD.durum.yaz('uzman-sohbet', [...DD.durum.oku('uzman-sohbet', []), {id: Date.now(), kim: 'ben', saat: `Bugün ${DDV.bugun.simdi}`, metin: `Plan notu · ${konu}: ${metin}`}]);
        s.kapat();
        DD.tazele();
        DD.toast('Notun **diyetisyenine iletildi**', {tur: 'basari', ikon: 'gonder', eylem: 'Sohbet', onEylem: () => DD.git('#/uzman/sohbet')});
      })
    });
  };

  // ---------- Alternatif: plandaki öğüne enerjisi en yakın tarifler ----------
  const KATEGORI = {kahvalti: ['Kahvaltılık'], ara1: ['Ara Öğün', 'İçecek'], ara2: ['Ara Öğün', 'İçecek'], ogle: ['Izgara & Et', 'Balık', 'Baklagil', 'Sebze Yemeği', 'Salata', 'Çorba'], aksam: ['Izgara & Et', 'Balık', 'Baklagil', 'Sebze Yemeği', 'Salata']};
  const adaylar = tur => { const k = icerik(tur).kcal; return DDV.yemekler.filter(y => KATEGORI[tur]?.includes(y.kategori)).sort((a, b) => Math.abs(a.porsiyonKcal - k * .6) - Math.abs(b.porsiyonKcal - k * .6)).slice(0, 3); };
  // karar: Değiştirdim'den açıldı; seçim öğünü yenmiş sayar (plandaki öğün = Uydum).
  const alternatifSheet = (tur, karar) => {
    const b = icerik(tur), o = ogunler().find(x => x.tur === tur), sec = altOku()[tur] || 'plan';
    DD.sheet({
      baslik: `${o.ad} · alternatif`,
      html: `<div class="dd-yigin">${DD.p(karar ? 'Plandaki öğün yerine **ne yediğini** seç; öğün yenmiş sayılır, plan değişmez.' : 'Seçtiğin alternatif **yalnız bugünün planına** yazılır; plan değişmez.', {ton: 'ikincil'})}${DD.satirlar([
        {k: 'plan', ikon: o.ikon, baslik: 'Plandaki öğün', alt: `${DD.sayi(b.kcal)} kcal · ${b.besinler.slice(0, 2).map(x => x.ad.split(' (')[0]).join(', ')}`},
        ...adaylar(tur).map(y => ({k: y.slug, gorsel: y.gorsel, baslik: y.ad, alt: `${DD.sayi(y.porsiyonKcal)} kcal · ${y.kategori}`}))
      ].map(({k, ...x}) => ({...x, ok: false, sag: k === sec ? DD.durumRozet({metin: 'Seçili', ton: 'basari', ikon: 'onay'}) : '', veri: {eylem: 'alt-sec', id: k}})))}</div>`,
      sonra: s => DD.eylem(s, 'alt-sec', el => {
        const v = el.dataset.id, once = altOku()[tur] || null;
        if (karar) { s.kapat(); karar(v === 'plan' ? null : v); return; }
        altYaz(tur, v === 'plan' ? null : v);
        s.kapat();
        DD.tazele();
        if ((v === 'plan' ? null : v) !== once) DD.toast(v === 'plan' ? 'Öğün **plana geri döndü**' : `**${yemek(v).ad}** bugünün planına yazıldı`, {ikon: 'muadil'});
      })
    });
  };

  const alternatifBolum = () => {
    const l = ogunler().filter(o => o.durum !== 'yedi' && o.durum !== 'atladi');
    if (!l.length) return DD.p('Bugünün bütün öğünleri **işaretlendi**; alternatif seçilecek öğün kalmadı.', {ton: 'ikincil'});
    return `<div class="dd-yigin-12">${DD.p('Plandaki öğünün yerine **enerjisi yakın bir tarif** seçebilirsin; seçim yalnız bugüne yazılır.', {ton: 'ikincil'})}${DD.satirlar(l.map(o => { const a = yemek(altOku()[o.tur]); return {ikon: o.ikon, baslik: o.ad, alt: a ? `Alternatif: ${a.ad}` : 'Plandaki öğün', deger: nk(o.planlanan), veri: {eylem: 'alternatif', id: o.tur}}; }))}</div>`;
  };

  // ---------- Plan geçmişi ----------
  const surumBolum = () => DD.satirlar(P().revizyonlar.map(r => ({ikon: 'gecmis', baslik: `Sürüm ${r.surum} · ${r.baslik}`, alt: DD.tarihUzun(r.tarih), sag: r.surum === P().surum ? DD.durumRozet({metin: 'Geçerli', ton: 'basari', ikon: 'onay'}) : '', veri: {eylem: 'surum', id: r.surum}})));
  const surumSheet = n => { const r = P().revizyonlar.find(x => x.surum === n); DD.sheet({baslik: `Sürüm ${r.surum} · ${r.baslik}`, html: `<div class="dd-yigin">${DD.p(`**${DD.tarihUzun(r.tarih)}** tarihinde ${benim().kisaAd} gönderdi.`, {ton: 'ikincil'})}<div class="dd-yigin-12">${r.degisiklikler.map(m => DD.madde({metin: m, tur: 'notr'})).join('')}</div></div>`}); };

  const bos = () => DD.gruplar([
    {html: DD.bos({ikon: 'clipboard-list', baslik: 'Beslenme planın yok', metin: 'Diyetisyenin plan gönderdiğinde **hedefin, öğün düzenin ve bugünün öğünleri** burada görünür.', eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}, ikincil: {metin: 'Program Bul', git: '#/program-bul'}})},
    {baslik: 'Planla neler gelir', html: `<div class="dd-yigin-12">${['**Kişisel kalori ve makro** hedefi', '**Öğün saatleri** ve hatırlatıcı', 'Her öğün için **alternatifler**'].map(metin => DD.madde({metin})).join('')}</div>`}
  ]);

  let hataGosterildi = false;
  DD.ekran('beslenme-plani', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/uzman',
    baslik: 'Beslenme planım',
    iskelet: 'liste',
    yenile: true,
    ustBar: ctx => (planYok(ctx) ? {} : {sag: [{ikon: 'takvim', etiket: 'Haftalık menüm', git: '#/haftalik-menu'}]}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (planYok(ctx)) return bos();
      const d = benim(), p = P();
      const bas = `<div class="dd-yigin">${DD.diyetisyenKart(d, {tur: 'satir'})}<div class="dd-yigin-4"><h2 class="dd-t-section">${DD.esc(p.ad)}</h2><span class="dd-t-meta dd-ton-ikincil">Sürüm ${p.surum} · ${DD.esc(DD.tarihUzun(p.tarih))} gönderildi</span></div>${DD.ozetSerit([{ikon: 'kalori', etiket: 'Enerji', deger: DD.sayi(p.hedefKcal), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: DD.sayi(p.makro.P), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: DD.sayi(p.makro.K), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: DD.sayi(p.makro.Y), birim: 'g'}])}</div>`;
      return DD.gruplar([
        {baslik: 'Bugünün öğünleri', eylem: {metin: 'Bugün', git: '#/bugun'}, html: bugunBolum()},
        {baslik: 'Öğün alternatifleri', html: alternatifBolum()},
        {baslik: 'Diyetisyenin notu', html: notBolum(d)},
        {baslik: 'Öğün düzeni', html: duzenBolum()},
        {baslik: 'Plan geçmişi', html: surumBolum()},
        {baslik: 'Daha fazlası', html: DD.parcali([
          {ikon: 'takvim', baslik: 'Haftalık menüm', alt: 'Gün gün menü ve alışveriş listesi', git: '#/haftalik-menu'},
          {ikon: 'program', baslik: 'Programlarım', alt: 'Uyum ve program geçmişi', git: '#/programlarim'},
          {ikon: 'tahlil', baslik: 'Sağlık dosyam', alt: 'Ölçümler ve tahliller', git: '#/saglik'}
        ], {aria: 'Kısayollar'})},
        {html: DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Plan **diyetisyeninin değerlendirmesine** göre hazırlanır; tanı ya da tedavi yerine geçmez.'})}
      ], {bas});
    },
    sonra: (kok, ctx) => {
      if (planYok(ctx)) return undefined;
      const karar = (id, durum, alt) => {
        const tur = DD.ogun.TUR(id), o = ogunler().find(x => x.tur === tur), once = {durum: o?.durum === 'yedi' || o?.durum === 'atladi' ? o.durum : null, alt: altOku()[tur] || null};
        altYaz(tur, alt);
        DD.ogun.isaretle(tur, durum);
        DD.titres(10);
        DD.tazele();
        const metin = durum === 'atladi' ? `**${o.ad}** atlandı olarak işaretlendi` : alt ? `**${o.ad}** yerine **${yemek(alt).ad}** yedin` : `**${o.ad}** plana uydu`;
        DD.toast(metin, {ikon: durum === 'atladi' ? 'forward' : 'onay', yerine: true, eylem: 'Geri al', onEylem: () => { altYaz(tur, once.alt); DD.ogun.isaretle(tur, once.durum); DD.tazele(); }});
      };
      const c = [
        // Plana göre segmenti (DD.ogunKart): id = DDV.bugun öğün id'si. Önceki işaret ve alternatif geri alınabilir.
        DD.eylem(kok, 'plan-uygula', el => karar(el.dataset.id, 'yedi', null)),
        DD.eylem(kok, 'plan-atla', el => karar(el.dataset.id, 'atladi', altOku()[DD.ogun.TUR(el.dataset.id)] || null)),
        DD.eylem(kok, 'plan-degistir', el => { const id = el.dataset.id; alternatifSheet(DD.ogun.TUR(id), slug => karar(id, 'yedi', slug)); }),
        DD.eylem(kok, 'ogun-ekle', el => {
          const id = el.dataset.id, o = icerik(DD.ogun.TUR(id));
          DD.sheet({baslik: `${o?.ad ?? 'Öğün'} ekle`, html: DD.parcali([
            {ikon: 'kamera', baslik: 'Tabağını çek', alt: 'Fotoğrafla öğüne ekle', git: `#/ai/kamera?mod=tabak&ogun=${id}`},
            {ikon: 'ara_', baslik: 'Besin ara', alt: 'Listeden seç', git: `#/besin-ara?ogun=${id}`},
            {ikon: 'barkod', baslik: 'Barkod tara', alt: 'Paketli ürün ekle', git: `#/ai/kamera?mod=barkod&ogun=${id}`},
            {ikon: 'mikrofon', baslik: 'Sesle anlat', alt: 'Ne yediğini söyle', git: `#/ai/ses?ogun=${id}`}
          ])});
        }),
        DD.eylem(kok, 'alternatif', el => alternatifSheet(el.dataset.id)),
        DD.eylem(kok, 'not-yaz', notSheet),
        DD.eylem(kok, 'surum', el => surumSheet(+el.dataset.id))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
