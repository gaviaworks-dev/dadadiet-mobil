/* SCR-40 Denge & Tabak (#/denge): Akıllı tabak ve Denge Skoru. Referans: Lifesum, Apple Health, Zero, Fastic, Simple (tasks/referanslar.md Denge, §2.5).
 * Yargısız: kırmızı yok, sözcük sayıdan önce okunur. Haftalık ortalama ve en iyi gün DDV.denge.tabak.haftalik'ten türetilir.
 * Durum: 'denge-oneri' seçilen öneri indeksleri. #/denge?hal=bos hazırlanıyor, #/denge?hal=hata hata hali.
 */
(() => {
  const {sayi} = DD;
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  let hazir = false, hataGosterildi = false, cizilen = '';
  const GUN_UZUN = {Pzt: 'Pazartesi', Sal: 'Salı', Çar: 'Çarşamba', Per: 'Perşembe', Cum: 'Cuma', Cmt: 'Cumartesi', Paz: 'Pazar'};
  const tabak = () => DDV.denge.tabak;
  const seciliOneri = () => DD.durum.oku('denge-oneri', []);
  const imza = () => JSON.stringify([hal(), seciliOneri(), DD.durum.oku('bugun-ogun', null)]);
  const ortalama = () => { const l = tabak().haftalik; return Math.round(l.reduce((t, g) => t + g.skor, 0) / l.length); };
  const enDengeli = () => [...tabak().haftalik].sort((a, b) => b.skor - a.skor)[0];
  const enAcik = () => [...tabak().bilesenler].sort((a, b) => a.puan / a.enCok - b.puan / b.enCok)[0];
  const ogunId = () => DDV.bugun.ogunler.find(o => o.ad === tabak().ogun)?.id || 'ogle';
  const yuva = (kok, ad, html) => { const el = kok.querySelector(`[data-yuva="${ad}"]`); if (el) el.innerHTML = html; };
  const ilkCumle = m => m.replace(/^([^.]+\.)/, '**$1**');

  // ---------- Bölümler ----------
  const skorKart = () => {
    const t = tabak(), a = enAcik();
    return DD.kart({html: `<div class="dd-yigin">${DD.dengeSkor({skor: t.skor, etiket: t.skorEtiket, fark: `Haftalık ortalaman ${ortalama()}`, bilesenler: t.bilesenler})}${DD.p(`**${t.ogun}** tabağın dengeli görünüyor; en çok **${a.ad.toLocaleLowerCase('tr')}** tarafında yer var.`, {orta: true, ton: 'ikincil'})}${DD.btn({metin: 'Ayrıntıları gör', tur: 'tonal', tam: true, veri: {eylem: 'ayrinti'}})}</div>`});
  };
  const hazirlaniyor = () => DD.kart({html: `<div class="dd-yigin">${DD.dengeSkor({hazirlaniyor: {gun: 3, toplam: 7}, bilesenler: tabak().bilesenler})}${DD.p('Birkaç gün daha öğün ekledikçe **ilk Denge Skorun** hazırlanır; o zamana kadar kayıtların burada birikir.', {orta: true, ton: 'ikincil'})}${DD.btn({metin: 'Öğün ekle', ikon: 'ekle', tam: true, git: '#/besin-ara'})}</div>`});
  const araclar = () => DD.parcali([
    {ikon: 'right-left', baslik: 'Muadil', git: '#/denge/muadil'},
    {ikon: 'life-ring', baslik: 'Kaçamak', git: '#/denge/kacamak'},
    {ikon: 'code-compare', baslik: 'Kıyasla', git: '#/denge/kiyasla'},
    {ikon: 'program', baslik: 'Programlar', git: '#/programlar'}
  ], {kutu: 'izgara', aria: 'Denge araçları'});
  const kirilim = () => DD.kart({html: DD.dengeSatirlar(tabak().bilesenler.map(b => ({...b, yorum: `Tabakta %${b.oran}, hedef %${b.hedefOran}. ${b.yorum}`})))});

  const tahmin = () => {
    const t = tabak(), s = seciliOneri(), artis = s.reduce((a, i) => a + t.oneriler[i].puanArtisi, 0);
    return s.length
      ? DD.bant({ton: 'basari', ikon: 'onay', metin: `Seçtiklerinle bu tabağın tahmini skoru **${Math.min(100, t.skor + artis)}**. Küçük bir değişiklik yeterli.`})
      : '';
  };
  const oneriListe = () => DD.alan({etiket: 'Denemek istediklerini seç', html: DD.secimler({ad: 'oneriler', coklu: true, duzen: 'tek', secili: seciliOneri().map(String), ogeler: tabak().oneriler.map((o, i) => ({k: String(i), ad: o.baslik, alt: `+${o.puanArtisi} puan · ${o.metin}`, ikon: o.ikon}))})});

  const haftaKart = () => {
    const l = tabak().haftalik, e = enDengeli(), once = l[l.length - 2].skor, son = l[l.length - 1].skor, fark = son - once;
    return DD.grafikKart({
      deger: String(ortalama()), birim: '/100 ortalama', fark: fark ? `Düne göre ${fark > 0 ? '+' : ''}${fark}` : 'Dünle aynı', farkTon: fark >= 0 ? 'iyi' : 'notr',
      cumle: `Bu hafta en dengeli günün **${GUN_UZUN[e.gun]}** oldu.`,
      grafik: DD.grafik({tur: 'eksenli', seri: l.map(g => ({etiket: g.gun, deger: g.skor})), ad: 'denge-hafta', secili: l.length - 1})
    });
  };

  const govde = () => {
    const t = tabak(), yeni = DD.yeniHesap(), bos = hal() === 'bos' || yeni, kur = DD.eylemKart({ikon: 'plate-wheat', baslik: 'Tabak Kur', alt: 'Yemeğini seç, 100 üzerinden puanını gör', git: '#/denge/tabak'});
    const hero = DD.gulucuk({gorsel: 'assets/gorsel/hero/denge-yesil.webp', baslik: 'Akıllı Tabak', alt: yeni ? 'Tabağını kur, puanını gör' : bos ? 'İlk skorun hazırlanıyor' : t.baslik, ust: true});
    if (bos) return hero + DD.bolumler([yeni ? kur : `<div class="dd-yigin">${kur}${hazirlaniyor()}</div>`, {baslik: 'Araçlar', html: araclar()}, {baslik: t.rehber.baslik, html: rehber()}]);
    return hero + DD.bolumler([
      `<div class="dd-yigin">${kur}${skorKart()}</div>`,
      {baslik: 'Araçlar', html: araclar()},
      {baslik: 'Tabağın', eylem: 'Öğüne git', git: `#/ogun/${ogunId()}`, html: kirilim()},
      {baslik: 'Öneriler', html: `<div class="dd-yigin"><div data-yuva="oneri">${oneriListe()}</div><div data-yuva="tahmin">${tahmin()}</div></div>`},
      {baslik: 'Bu hafta', html: haftaKart()},
      {baslik: 'Aklındaki sorular', html: DD.soruCipleri({sorular: ['Akşam ne yesem?', 'Sebzeyi nasıl artırırım?']})},
      {baslik: t.rehber.baslik, html: rehber()}
    ]);
  };
  // Rehber: ipucu kutusu + girintili düğme yerine görselli kart (dokununca Tabak Kur) ve altında kısa açıklama (Beyar: "dengesiz duruyor")
  // Kartın altındaki açıklama kalktı (Beyar: gereksiz); kart başlığı kuralı zaten söylüyor.
  const rehber = () => DD.banner({gorsel: 'assets/gorsel/hero/tabak-duzeni.webp', etiket: 'Dengeli tabak', baslik: 'Yarısı sebze, çeyreği protein, çeyreği tahıl', alt: 'Kendi tabağını kur, puanını gör', git: '#/denge/tabak'});

  // ---------- Sheet'ler ----------
  const ayrintiSheet = () => {
    const t = tabak();
    DD.sheet({
      baslik: 'Denge Skoru nasıl oluşur?',
      html: `<div class="dd-yigin">${DD.p(`Skor dört bileşenin toplamıdır: **${t.bilesenler.map(b => b.puan).join(' + ')} = ${t.skor}**. Bir not değil, tabağı kurarken yol gösteren bir özettir.`)}${DD.satirlar(t.bilesenler.map(b => ({ikon: b.ikon, baslik: b.ad, alt: b.yorum, deger: `${b.puan} / ${b.enCok}`, ok: false})))}${DD.bant({metin: 'Bu skor **genel bilgi** içindir; sana özel kararlar için diyetisyeninle konuş.'})}</div>`,
      altBar: DD.btn({metin: 'Öğünü aç', ikon: 'utensils', tam: true, git: `#/ogun/${ogunId()}`, attrs: 'data-sheet-kapat'})
    });
  };
  const soruSheet = soru => {
    const d = DD.durum.oku('bugun-ogun', {}), o = DDV.bugun.ogunler.find(x => (d[x.id]?.durum ?? x.durum) === 'planli');
    if (soru.startsWith('Akşam')) {
      const metin = o ? `Planında **${o.besinler.slice(0, 3).map(b => b.ad.split(' (')[0]).join(', ')}** var; toplam **${sayi(o.kcal)} kcal**. Tabağın yarısını sebzeyle kurarsan günün dengesi de güçlenir.` : 'Bugün için **planlı öğünün kalmadı**. Yine de bir şey eklemek istersen tabağın yarısını sebzeyle kur.';
      DD.sheet({baslik: soru, html: DD.p(metin), altBar: DD.btn({metin: o ? 'Öğünü aç' : 'Besin ekle', ikon: o ? 'utensils' : 'ekle', tam: true, git: o ? `#/ogun/${o.id}` : '#/besin-ara', attrs: 'data-sheet-kapat'})});
      return;
    }
    const n = tabak().oneriler[0];
    DD.sheet({baslik: soru, html: `<div class="dd-yigin">${DD.p(`**${n.baslik}:** ${n.metin}`)}${DD.p(ilkCumle(tabak().rehber.metin), {ton: 'ikincil'})}</div>`, altBar: DD.btn({metin: 'Diyetisyenime sor', ikon: 'mesaj', tam: true, git: '#/uzman/sohbet', attrs: 'data-sheet-kapat'})});
  };

  // ---------- Bağlar ----------


  DD.ekran('denge', {
    tur: 'sekme',
    nav: 'denge',
    baslik: 'Akıllı Tabak',
    ustBar: () => ({saydam: hazir}),
    yukle: () => {
      if (hal() === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    sonra: kok => {
      cizilen = imza();
      const baglar = [
        DD.eylem(kok, 'ayrinti', ayrintiSheet),
        DD.eylem(kok, 'soru', el => soruSheet(el.dataset.soru)),
        DD.on(kok, 'oneriler', l => { DD.durum.yaz('denge-oneri', l.map(Number)); yuva(kok, 'tahmin', tahmin()); cizilen = imza(); })
      ];
      return () => baglar.forEach(c => c());
    },
    donus: () => { if (imza() !== cizilen) DD.tazele(); }
  });
})();
