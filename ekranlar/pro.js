/* Dada Diet Pro (#/pro): misafire de açık Pro tanıtımı. Web karşılığı /pro (herkese açık); Gastro pro.html (profil.js H16: plan kartları misafire açık, "Ücretsiz Kayıt Ol", Ödemelerim misafirde giriş kutusu).
 * Kademeler, fiyat ve özellikler yalnız DDV.uye.kademeler (paketlerim.js kademe paneliyle aynı kalıp ve bileşenler). Tanıtım metinleri web /pro sayfasından.
 * Pro'ya geç: üyede #/paketlerim (abonelik akışı orada), misafirde ortak üyelik sheet'i (data-uye-ol → DD.uyeDuvar).
 * Mevcut kademe Paketlerim ile aynı durumdan okunur: DD.durum 'abonelik' (yeni hesapta Ücretsiz). */
(() => {
  const U = () => DDV.uye;
  const GORSEL = 'assets/gorsel/hero/tabak-duzeni.webp';
  const UYE_METIN = (ad = 'Pro') => `${yonelme(ad)} geçmek için önce **ücretsiz üye ol**; kademeni üyeliğinden sonra Paketlerim’de seçersin.`;
  const abonelik = () => DD.durum.oku('abonelik', DD.yeniHesap() ? {kademe: 'ucretsiz'} : U().abonelik);
  const simdiki = () => (DD.uye() ? U().kademeler.findIndex(k => k.kod === abonelik().kademe) : -1);
  // Yönelme eki: Pro’ya, Pro Max’a (son ünlüye göre a/e, ünlüyle bitiyorsa y kaynaştırması).
  const yonelme = ad => { const s = ad.toLocaleLowerCase('tr'), u = [...s].reverse().find(h => 'aeıioöuü'.includes(h)) || 'a', e = 'eiöü'.includes(u) ? 'e' : 'a'; return `${ad}’${'aeıioöuü'.includes(s.at(-1)) ? 'y' : ''}${e}`; };

  // Web /pro üç başlığı (Reklamsız Kullanım, Programlar ve Plan, Kayıt ve Sağlık Dosyası).
  const GELENLER = [
    {ikon: 'rectangle-ad', baslik: 'Reklamsız kullanım', alt: 'Pro planlarda banner reklam yok: sayfalar daha sade, dikkat dağıtan banner yok.'},
    {ikon: 'clipboard-list', baslik: 'Programlar ve plan', alt: 'Gelişmiş programlar, PDF olarak indirilebilen kişisel beslenme planı ve haftalık menü planlama.'},
    {ikon: 'file-medical', baslik: 'Kayıt ve sağlık dosyası', alt: 'Sınırsız kayıt geçmişi; belgelerin, tahlillerin ve verinin tek yerde durduğu sağlık dosyası.'}
  ];

  // ---------- Kademe kartı (paketlerim.js kademePanel kalıbı) ----------
  const kademeKart = (k, sira) => {
    const simdi = simdiki(), mevcut = sira === simdi, uye = DD.uye();
    const sag = mevcut ? DD.durumRozet({metin: 'Mevcut paketin', ton: 'basari', ikon: 'onay'}) : k.kod === 'pro' ? DD.rozet({metin: 'Öne çıkan'}) : '';
    const miras = sira > 0 ? DD.p(`**${U().kademeler[sira - 1].ad}** kademesinin tamamı, üstüne:`, {ton: 'ikincil', meta: true}) : '';
    const dugme = mevcut || (uye && sira < simdi) ? ''
      : !uye && !k.fiyat ? DD.btn({metin: 'Ücretsiz üye ol', tur: 'secondary', tam: true, veri: {'uye-ol': 'Ücretsiz kademe her zaman 0 TL. **Kayıtların ve tercihlerin** hesabında saklanır.'}})
        : DD.btn({metin: `${yonelme(k.ad)} geç`, ikon: k.ikon, tur: k.kod === 'pro' ? 'primary' : 'secondary', tam: true, ...(uye ? {git: '#/paketlerim'} : {veri: {'uye-ol': UYE_METIN(k.ad).replace(/\*\*/g, '')}})});
    return DD.yuzey(`<div class="dd-yigin">${DD.satir({sol: DD.ikonKutu({ikon: k.ikon, ton: mevcut || (simdi < 0 && k.kod === 'pro') ? 'primary' : 'notr', boyut: 'lg'}), baslik: k.tamAd, alt: k.fiyat ? `${DD.paraTL(k.fiyat)} / ay` : 'Her zaman 0 TL', sag})}${DD.p(k.ozet.replace(/^([^.:]+)/, '**$1**'))}${miras}<div class="dd-yigin-8">${k.ozellikler.map(o => DD.madde({metin: o})).join('')}</div>${dugme}</div>`);
  };

  // ---------- Üyelik ve ödemeler: üyede kısayollar, misafirde kayıt kancası ----------
  const uyelikHtml = () => {
    const sss = {ikon: 'circle-question', baslik: 'Sık sorulanlar', alt: 'Pro ve ödeme soruları', git: '#/sss'};
    if (!DD.uye()) return `<div class="dd-yigin">${DD.kanca({metin: 'Ödemelerini ve faturalarını görmek için giriş yap', ikon: 'credit-card'})}${DD.yuzey(DD.satirlar([sss]))}</div>`;
    const k = U().kademeler[simdiki()];
    return DD.yuzey(DD.satirlar([
      {ikon: 'box-open', baslik: 'Paketlerim', alt: `${k.tamAd} · kademeni ve diyetisyen paketini yönet`, git: '#/paketlerim'},
      {ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Tahsilatlar, faturalar ve kartlar', git: '#/odemelerim'},
      sss
    ]));
  };

  DD.ekran('pro', {
    tur: 'banner',
    ust: '#/bugun',
    baslik: 'Dada Diet Pro',
    iskelet: 'liste',
    yenile: true,
    tabagim: false,
    ciz: () => {
      const pro = U().kademeler.find(k => k.kod === 'pro');
      return DD.gulucuk({gorsel: GORSEL, etiket: 'Dada Diet Pro', baslik: 'Pro, beslenme takibinin tamamını açar', alt: pro.ozet, ust: true, perde: 'tam'}) + DD.bolumler([
        {baslik: 'Pro ile gelenler', html: `<div class="dd-yigin">${DD.p('Dada Diet Pro, programların, planların ve araçların tamamına erişim sağlayan **tek üyeliktir**. Pro’da reklamlar kalkar; gelişmiş programlar, kişisel beslenme planı ve menü planlama açılır. Pro Max bunların hepsine **diyetisyen katmanını** ekler.')}<div class="dd-yigin-12">${GELENLER.map(g => DD.eylemKart({...g, bilgi: true})).join('')}</div></div>`},
        {baslik: 'Sana uygun Pro’yu seç', html: `<div class="dd-yigin">${DD.p('Kademelerin **kapsamı ve fiyatı** aşağıda.', {ton: 'ikincil'})}${U().kademeler.map(kademeKart).join('')}</div>`},
        {baslik: 'İki ayrı katman', html: DD.bant({ton: 'bilgi', baslik: 'Diyetisyen görüşmesi ayrı ödenir', metin: 'Ücretsiz ve Pro’da diyetisyen görüşmesi **diyetisyene ayrı** ödenir; Pro üyelik bu bedeli kapsamaz. Pro Max ise diyetisyen görüşme hakkını da içerir.', eylem: {metin: 'Diyetisyenler', git: '#/uzman/bul'}})},
        {baslik: DD.uye() ? 'Üyeliğin' : 'Ödemeler', html: uyelikHtml()},
        DD.bant({ton: 'bilgi', metin: 'Bu sayfadaki içerik genel bilgilendirme amaçlıdır; **tıbbi teşhis veya tedavi yerine geçmez.** Kişiye özel beslenme planı yalnızca yetkili bir diyetisyen tarafından hazırlanır.'})
      ]);
    },
    // Sabit eylem: bir üst kademe. Misafirde üyelik sheet'i; en üst kademedeki üyede Paketlerim.
    altBar: () => {
      const l = U().kademeler, ust = l[Math.max(simdiki(), 0) + 1];
      if (!DD.uye()) return DD.altEylem({dugmeler: [{metin: 'Pro’ya geç', ikon: 'bolt', tam: true, veri: {'uye-ol': UYE_METIN().replace(/\*\*/g, '')}}]});
      return DD.altEylem({dugmeler: [ust ? {metin: `${yonelme(ust.ad)} geç · ${DD.paraTL(ust.fiyat)} / ay`, ikon: ust.ikon, tam: true, git: '#/paketlerim'} : {metin: 'Paketlerim', ikon: 'box-open', tur: 'secondary', tam: true, git: '#/paketlerim'}]});
    }
  });
})();
