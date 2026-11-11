/* Bana Uygun Olanı Bul (#/bana-uygun): web /bana-uygun-olani-bul dört adımlı yönlendirme sihirbazının eşi.
 * İçerik web _src/sayfalar/public-araclar/bana-uygun.mjs (A: soru seçenekleri, ROTALAR: amaca göre öneri) ve
 * assets/js/sayfa/public-araclar-sihirbaz.js URETICI.uygun (sonuç: amaç metni, seçim çipleri, özel durum uyarısı, birincil + ikinci öneriler).
 * Sonucu yalnız 1. adım (amaç) belirler; hedef, düzen ve tercih çip olarak görünür, özel durum uyarıyı açar (web ile aynı).
 * Kalıp program-bul.js: DD.onbSablon + DD.secimler, adım ?adim=1-4 yığına girer, sonuç ?adim=sonuc, cevaplar DD.durum 'bana-uygun'.
 * Sonuç çipine dokununca o adım ?duzenle=1 ile açılır; Devam sonuca geri döner (web diyetisyen sihirbazı data-adim-git).
 * Web adresi → mobil rota: HEDEF tablosu. */
(() => {
  const ANAHTAR = 'bana-uygun', TOPLAM = 4;

  // Web href → mobil rota. Web hedeflerinin hepsinin mobil karşılığı var (tarif ve diyetisyen paneli hedefi yok).
  const HEDEF = {
    'besin-rehberi/': '#/rehberler',
    'besin-kutuphanesi/': '#/besinler',
    'besin-karsilastir/': '#/denge/kiyasla',
    'saglik-testleri/': '#/testler',
    'hesaplayici/gunluk-kalori/': '#/hesaplayici/gunluk-kalori',
    'hesaplayicilar/': '#/hesaplayicilar',
    'akilli-tabak-ve-degisim/': '#/denge',
    'kac-kalori/': '#/kac-kalori',
    'programlar/program-bul/': '#/program-bul',
    'programlar/hedefe-gore/': '#/programlar?seg=hedef',
    'aralikli-oruc-rehberi/': '#/ritim',
    'diyetisyen-bul-sihirbazi/': '#/uzman/bul?adim=1',
    'diyetisyenler/': '#/uzman/bul',
    'sayfa/uzmanla-calisma-rehberi/': '#/uzmanla-calisma'
  };

  // Web ROTALAR (metinler aynen; vurgu mobil metin kuralı gereği eklendi).
  const ROTALAR = {
    bilgi: {metin: 'Önce mantığı öğrenmek istiyorsun. **Rehber içerikleri** kısa, genel ve uygulanabilir; hesaplama ve programa oradan geçmek daha kolay olur.',
      birincil: {ad: 'Beslenme Rehberi', metin: 'Dengeli tabak, öğün planı, porsiyon: mantığı önce anla.', href: 'besin-rehberi/', ikon: 'book-open'},
      ikinci: [{ad: 'Besin Kütüphanesi', metin: 'Besinlerin kalori ve makro değeri.', href: 'besin-kutuphanesi/', ikon: 'magnifying-glass'}, {ad: 'Besin Karşılaştır', metin: 'İki besini yan yana gör.', href: 'besin-karsilastir/', ikon: 'scale-balanced'}, {ad: 'Sağlık Testleri', metin: 'Birkaç soruda alışkanlığını ölç.', href: 'saglik-testleri/', ikon: 'clipboard-question'}]},
    hesap: {metin: 'Önce rakamları görmek istiyorsun. **Günlük kalori ihtiyacını hesapla**, sonra sonucu tabağına taşı.',
      birincil: {ad: 'Günlük Kalori İhtiyacı', metin: 'Hedefine göre günlük enerji ihtiyacın.', href: 'hesaplayici/gunluk-kalori/', ikon: 'utensils'},
      ikinci: [{ad: 'Tüm Hesaplayıcılar', metin: 'BKİ, su, makro ve daha fazlası.', href: 'hesaplayicilar/', ikon: 'calculator'}, {ad: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul.', href: 'akilli-tabak-ve-degisim/', ikon: 'chart-pie'}, {ad: 'Kaç Kalori?', metin: 'Porsiyon karşılıkları.', href: 'kac-kalori/', ikon: 'fire-flame-curved'}]},
    program: {metin: 'Hazır bir düzen arıyorsun. **Program Bul** beş adımda hedefine ve süresine uyan menüleri eşleştirir.',
      birincil: {ad: 'Program Bul', metin: 'Beş adımda sana uygun programı eşleştir.', href: 'programlar/program-bul/', ikon: 'wand-magic-sparkles'},
      ikinci: [{ad: 'Hedefe Göre Programlar', metin: 'Kilo ver, dengelen, kas yap.', href: 'programlar/hedefe-gore/', ikon: 'bullseye'}, {ad: 'Aralıklı Oruç Rehberi', metin: 'Protokolünü ve saatlerini seç.', href: 'aralikli-oruc-rehberi/', ikon: 'clock'}, {ad: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul.', href: 'akilli-tabak-ve-degisim/', ikon: 'chart-pie'}]},
    uzman: {metin: 'Birebir destek istiyorsun. Hedefini ve görüşme tercihini söyle, **sana uygun uzmanı** eşleştirelim.',
      birincil: {ad: 'Diyetisyen Bul', metin: 'Hedef, uzmanlık, şehir ve bütçeye göre eşleştir.', href: 'diyetisyen-bul-sihirbazi/', ikon: 'user-doctor'},
      ikinci: [{ad: 'Diyetisyenler', metin: 'Uzman profillerini incele.', href: 'diyetisyenler/', ikon: 'user-group'}, {ad: 'Uzmanla Çalışma Rehberi', metin: 'Süreç nasıl işler?', href: 'sayfa/uzmanla-calisma-rehberi/', ikon: 'book-open'}, {ad: 'Program Bul', metin: 'Beklerken bir programa göz at.', href: 'programlar/program-bul/', ikon: 'wand-magic-sparkles'}]}
  };

  // Web A + adım başlıkları (web Title Case → mobil cümle düzeni).
  const sec = l => l.map(([deger, ad, alt, ikon]) => ({deger, ad, alt, ikon}));
  const ADIMLAR = [
    {baslik: 'Bugün burada ne yapmak istiyorsun?', alt: 'Seni **doğru araca** yönlendirelim.', gruplar: [{alan: 'amac', secenekler: sec([['bilgi', 'Bilgi edinmek', 'Beslenmenin mantığını öğren', 'book-open'], ['hesap', 'Hesaplama yapmak', 'Kalori, BKİ, makro, su', 'calculator'], ['program', 'Program bulmak', 'Hazır bir beslenme planı', 'list-check'], ['uzman', 'Uzman desteği almak', 'Diyetisyenle birebir çalış', 'user-doctor']])}]},
    {baslik: 'Neyi hedefliyorsun?', alt: 'Hedefin **önerinin yönünü** belirler.', gruplar: [{alan: 'hedef', secenekler: sec([['dengeli', 'Dengeli beslenme', 'Düzeni oturt, sürdürülebilir kıl', 'scale-balanced'], ['kilo', 'Kilo kontrolü', 'Sağlıklı kiloya ulaş, koru', 'weight-scale'], ['sporcu', 'Sporcu beslenmesi', 'Performans ve toparlanma', 'dumbbell'], ['bitkisel', 'Bitkisel beslenme', 'Vejetaryen veya vegan düzen', 'seedling'], ['kesif', 'Genel keşif', 'Henüz net bir hedefim yok', 'compass']])}]},
    {baslik: 'Gününde beslenmeye ne kadar yer var?', alt: '**Sürdürebileceğin süre**, ideal süreden daha değerli.', gruplar: [{alan: 'duzen', secenekler: sec([['az', 'Günde 15 dk’dan az', 'Yoğun tempo, pratik çözüm', 'bolt'], ['orta', '15–30 dk', 'Dengeli bir düzen kurabilirim', 'clock'], ['cok', '30 dk ve üzeri', 'Mutfakta vakit geçirebilirim', 'kitchen-set']])}]},
    {baslik: 'Beslenme tercihin ve özel bir durumun var mı?', alt: 'Öneriyi **buna göre yorumlayalım**.', gruplar: [
      {alan: 'tercih', etiket: 'Beslenme tercihin', secenekler: sec([['standart', 'Standart', 'Özel bir kısıtım yok'], ['vejetaryen', 'Vejetaryen', 'Et yok, süt ve yumurta var'], ['vegan', 'Vegan', 'Tamamen bitkisel'], ['diger', 'Diğer', 'Glutensiz, laktozsuz, başka']])},
      {alan: 'ozel', etiket: 'Özel durum', secenekler: sec([['yok', 'Yok', 'Bildiğim bir durum yok'], ['alerji', 'Besin alerjim var', 'Alerji veya intolerans'], ['saglik', 'Sağlık durumum var', 'Gebelik, kronik hastalık, ilaç']])}
    ]}
  ];
  // Web bant güven satırı ve sihirbaz notu.
  const GUVEN = '1 dakikadan kısa · Araç, program ve uzman önerisi · Tıbbi teşhis üretmez';
  const NOT = 'Bu sihirbaz bir **yönlendirmedir**; **sağlık teşhisi koymaz, kişiye özel tıbbi ya da beslenme önerisi üretmez.** Verdiği sonuç genel bilgi ve seçimlerine dayanan bir başlangıç önerisidir. Gebelik, kronik hastalık, düzenli ilaç kullanımı, besin alerjisi veya klinik bir durum varsa plana başlamadan önce bir diyetisyene ve hekimine danış.';
  const UYARI = 'Özel bir durum işaretledin. Burada önerilen içerikler **geneldir**; plana başlamadan önce bir diyetisyene ve hekimine danış.';

  const cevaplar = () => DD.durum.oku(ANAHTAR, {}) || {};
  const yaz = c => DD.durum.yaz(ANAHTAR, c);
  const adimTamam = (a, c) => a.gruplar.every(g => c[g.alan] != null);
  const adimNo = (ctx, c) => {
    const eksik = ADIMLAR.findIndex(a => !adimTamam(a, c)), son = eksik < 0 ? TOPLAM + 1 : eksik + 1;
    return Math.min(ctx.sorgu.adim === 'sonuc' ? TOPLAM + 1 : +ctx.sorgu.adim || 1, son);
  };
  const secenek = (alan, deger) => ADIMLAR.flatMap(a => a.gruplar).find(g => g.alan === alan)?.secenekler.find(x => x.deger === deger);

  // ---------- Adım ----------
  const grupHtml = (a, c) => (a.gruplar.length > 1
    ? `<div class="dd-yigin-24">${a.gruplar.map(g => DD.alan({etiket: g.etiket, html: DD.secimler({ad: g.alan, ogeler: g.secenekler, secili: c[g.alan], duzen: 'tek'})})).join('')}</div>`
    : DD.secimler({ad: a.gruplar[0].alan, ogeler: a.gruplar[0].secenekler, secili: c[a.gruplar[0].alan], duzen: 'tek'}));
  const adimHtml = (n, c, duzenle) => {
    const a = ADIMLAR[n - 1];
    return DD.onbSablon({
      adim: n, toplam: TOPLAM, baslik: a.baslik, alt: a.alt,
      devam: {metin: duzenle ? 'Sonucu güncelle' : n === TOPLAM ? 'Sonucu gör' : 'Devam', pasif: !adimTamam(a, c), veri: {eylem: 'devam'}},
      altMetin: n === 1 ? GUVEN : '',
      html: grupHtml(a, c)
    });
  };

  // ---------- Sonuç ----------
  const hedefKart = x => DD.eylemKart({ikon: x.ikon, baslik: x.ad, alt: x.metin, altSatir: 2, git: HEDEF[x.href]});
  const baslikSatir = metin => `<p class="dd-t-label dd-ton-ikincil">${DD.esc(metin)}</p>`;
  const sonucHtml = c => {
    const R = ROTALAR[c.amac];
    // Web: her adımın seçimi çip; mobilde çip o adımı düzenlemek için açar.
    // 'Yok' (özel durum yok) tek başına bağlamsız; çip olarak gösterilmez (web de özel durumu çipe koymaz).
    const cipler = ADIMLAR.flatMap((a, i) => a.gruplar.map(g => ({n: i + 1, alan: g.alan, s: secenek(g.alan, c[g.alan])}))).filter(x => x.s && !(x.alan === 'ozel' && c.ozel === 'yok'))
      .map(x => DD.cip({metin: x.s.ad, ikon: 'pen', kucuk: true, git: `#/bana-uygun?adim=${x.n}&duzenle=1`, etiket: `${x.s.ad}, yanıtı değiştir`})).join('');
    const uyari = c.ozel && c.ozel !== 'yok' ? DD.bant({ton: 'uyari', baslik: 'Diyetisyene danış', metin: UYARI, eylem: {metin: 'Diyetisyen bul', git: '#/uzman/bul?adim=1'}}) : '';
    return DD.onbSablon({
      adim: TOPLAM, toplam: TOPLAM,
      atla: {metin: 'Baştan', veri: {eylem: 'bastan'}},
      baslik: 'Önerilen başlangıç adımın', alt: R.metin,
      devam: {metin: `${R.birincil.ad} ile başla`, ikon: 'tumu', git: HEDEF[R.birincil.href]},
      html: `<div class="dd-yigin">
        <div class="dd-sira" role="group" aria-label="Yanıtların">${cipler}</div>
        ${uyari}
        <div class="dd-yigin-8">${baslikSatir('Birincil öneri')}${hedefKart(R.birincil)}</div>
        <div class="dd-yigin-8">${baslikSatir('İkinci seçenekler')}<div class="dd-yigin-12">${R.ikinci.map(hedefKart).join('')}</div></div>
        ${DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: NOT})}
      </div>`
    });
  };

  DD.ekran('bana-uygun', {
    tur: 'tam',
    tabagim: false,
    ust: '#/bugun',
    iskelet: 'liste',
    yenile: true,
    ciz: ctx => {
      const c = cevaplar(), n = adimNo(ctx, c);
      return n <= TOPLAM ? adimHtml(n, c, !!ctx.sorgu.duzenle && ADIMLAR.every(a => adimTamam(a, c))) : sonucHtml(c);
    },
    sonra: (kok, ctx) => {
      const n = adimNo(ctx, cevaplar()), a = ADIMLAR[n - 1], offs = [];
      // Cevapsız ileri adım adresi (ör. ?adim=3) gerçekte çizilen adıma düzeltilir; geçmişe yeni kayıt eklenmez.
      const istenen = ctx.sorgu.adim === 'sonuc' ? TOPLAM + 1 : +ctx.sorgu.adim || 1;
      if (ctx.sorgu.adim && istenen !== n) history.replaceState(null, '', `#/bana-uygun${n > TOPLAM ? '?adim=sonuc' : n > 1 ? `?adim=${n}` : ''}`);
      offs.push(DD.eylem(kok, 'bastan', () => { DD.durum.sil(ANAHTAR); DD.yerine('#/bana-uygun'); }));
      if (!a) return () => offs.forEach(f => f());
      const devam = kok.querySelector('[data-eylem="devam"]');
      a.gruplar.forEach(g => offs.push(DD.on(kok, g.alan, v => {
        const c = {...cevaplar(), [g.alan]: v};
        yaz(c);
        devam.disabled = !adimTamam(a, c);
      })));
      offs.push(DD.eylem(kok, 'devam', () => {
        // Sonuçtan düzenlemeye gelindiyse sonuca geri dönülür (yığında sonuç ekranı altta durur, yenile:true yeniden çizer).
        if (ctx.sorgu.duzenle && ADIMLAR.every(x => adimTamam(x, cevaplar()))) { DD.geri(); return; }
        DD.git(n < TOPLAM ? `#/bana-uygun?adim=${n + 1}` : '#/bana-uygun?adim=sonuc');
      }));
      return () => offs.forEach(f => f());
    }
  });
})();
