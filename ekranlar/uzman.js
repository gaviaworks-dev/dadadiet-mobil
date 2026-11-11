/* SCR-50A Uzmanım (#/uzman): Gastro profil başı + bölümler. Referans: tasks/referanslar.md Uzmanım ve sağlık.
 * Durum: uzman-randevu (sonrakiRandevu şekli; null = iptal, uzman-profil de yazar), uzman-hazirlik {gorevId:true},
 * uzman-talep {slug, paket, tarih, saat, tur, paylasim} (uzman-profil yazar), uzman-sohbet (eklenen mesajlar), uzman-okundu (son okunan mesaj id).
 * Tabak şeridi saglik-paylasim.tabaklar iznine bağlıdır; kayıtlar DDKayit (ekranlar/kayit.js) yüklenmemişse DDV.ogunKayitlari'ndan okunur.
 * #/uzman?hal=bos diyetisyeni olmayan kullanıcı, ?hal=hata bağlantı hatası, ?hal=seans görüşme saati gelmiş hal. */
(() => {
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');   // görünen saat noktalı (19.30); veri ve durum anahtarı ':' kalır
  const KAPAK = 'assets/gorsel/hero/uzman-masa.webp';
  const B = () => DDV.benimDiyetisyenim;
  const bul = slug => DDV.diyetisyenler.find(d => d.slug === slug);
  const benim = () => bul(B().diyetisyen);
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  const randevuOku = () => DD.durum.oku('uzman-randevu', B().sonrakiRandevu);
  const talepOku = () => DD.durum.oku('uzman-talep', null);
  // ai-tahlil gönderimi kendi bayrağını yazar; sohbette gönderilen tahlil olarak görünür.
  const aiTahlil = () => { if (!DD.durum.oku('ai-tahlil-gonderildi', false)) return []; const t = DDV.saglik.kanTahlilleri.find(x => x.id === DDV.ai.tahlil.tahlil); return [{id: 11, kim: 'ben', saat: `Bugün ${DDV.bugun.simdi}`, metin: 'Tahlil sonucumu gönderiyorum.', ek: {tur: 'tahlil', ad: `Kan tahlili · ${t.tarihMetin}`}}]; };
  const mesajlar = () => [...B().sohbet.mesajlar, ...aiTahlil(), ...DD.durum.oku('uzman-sohbet', [])];
  const buyukBas = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const ilkCumleVurgulu = m => m.replace(/^([^.;]+[.;])/, '**$1**');

  // ---------- Tarih ve geri sayım ----------
  const gunAy = iso => { const d = new Date(`${iso}T12:00:00`); return {gun: d.getDate(), ay: d.toLocaleDateString('tr-TR', {month: 'short'})}; };
  const acilis = Date.now();   // Ekran yeniden çizilince sayaç başa dönmesin diye geçen süre buradan sayılır.
  const SEANS_SN = 6 * 60;
  const kalanSn = r => (hal() === 'seans' ? SEANS_SN : Math.round((new Date(`${r.tarih}T${r.saat}:00`) - DD.simdi()) / 1000)) - Math.floor((Date.now() - acilis) / 1000);
  const katilAcik = r => kalanSn(r) <= r.katilAcilisDk * 60;
  const acilisSaat = r => DD.saatMetin(DD.saatDk(r.saat) - r.katilAcilisDk);

  // ---------- Hazırlık görevleri: randevunun konusundan gelir ----------
  const GOREVLER = [
    {id: 'olcum', baslik: 'Kilo ve bel ölçünü gir', alt: 'Sağlık dosyana eklenir'},
    {id: 'su', baslik: 'Su kayıtlarına göz at', alt: 'Görüşmede su hedefini konuşacaksınız'},
    {id: 'menu', baslik: 'Bu haftanın menüsünü oku', alt: 'Zorlandığın öğünü not et'}
  ];
  const hazirlik = () => ({olcum: DD.durum.oku('saglik-olcumler', []).length > 0, ...DD.durum.oku('uzman-hazirlik', {})});
  const gorevler = () => { const h = hazirlik(); return DD.gorevListe(GOREVLER.map(g => ({...g, id: `gorev-${g.id}`, tamam: !!h[g.id]}))); };

  // ---------- Randevu ----------
  const randevuKart = r => {
    const {gun, ay} = gunAy(r.tarih), acik = katilAcik(r);
    return `<div class="dd-yigin">
      ${DD.randevuSatir({gun, ay, baslik: r.baslik, saat: `${r.tarihMetin} ${nk(r.saat)}`, durum: r.tur})}
      ${DD.geriSayim({saniye: Math.max(0, kalanSn(r))})}
      <div class="dd-yigin-8">
        ${DD.btn({metin: 'Seansa katıl', ikon: 'video', tam: true, pasif: !acik, veri: {eylem: 'seans'}})}
        <small class="dd-yardim dd-orta-metin">${DD.esc(acik ? 'Diyetisyenin görüşmede seni bekliyor' : `Görüşme günü ${nk(acilisSaat(r))} itibarıyla açılır`)}</small>
      </div>
      ${DD.btn({metin: 'Görüşme detayı', tur: 'tonal', tam: true, veri: {eylem: 'detay'}})}
    </div>`;
  };
  const randevuYok = () => DD.bos({ikon: 'takvim', baslik: 'Planlı görüşmen yok', metin: `**${B().paket.kalanSeans} görüşme hakkın** duruyor. Takvimden sana uyan saati seçebilirsin.`, eylem: {metin: 'Görüşme planla', ikon: 'takvim', git: `#/uzman/profil/${B().diyetisyen}?ertele=1`}});
  const gecmisListe = () => `<div class="dd-yigin-12">${B().gecmisRandevular.map(x => { const {gun, ay} = gunAy(x.tarih); return DD.randevuSatir({gun, ay, baslik: 'Haftalık takip görüşmesi', saat: nk(x.saat), alt: x.tur, durum: x.durum}); }).join('')}</div>`;
  const randevuPanel = sekme => { const r = randevuOku(); return sekme === 'gecmis' ? gecmisListe() : r ? randevuKart(r) : randevuYok(); };

  // ---------- Haftalık menü ----------
  const H = () => B().haftalikMenu;
  const kalemAd = k => k.match(/^[^\d½¼¾(]+/)[0].trim();
  const menuPanel = gun => {
    const g = H().gunler.find(x => x.gun === gun);
    const satirlar = g.ogunler.map((o, i) => ({ikon: 'ogun', baslik: `${o.ad} · ${nk(o.saat)}`, alt: o.kalemler.slice(0, 2).map(kalemAd).join(', '), deger: `${DD.sayi(o.kcal)} kcal`, veri: {eylem: 'menu-ogun', id: `${g.gun}.${i}`}}));
    return `<div class="dd-yigin-12"><div class="dd-ara"><p class="dd-t-label dd-ton-ikincil">${DD.esc(buyukBas(g.baslik))}</p><span class="dd-t-meta dd-ton-ikincil">${DD.sayi(g.kcal)} kcal</span></div>${DD.yuzey(DD.satirlar(satirlar))}</div>`;
  };
  const menuBolum = () => {
    const bugun = H().gunler.find(x => x.bugun) || H().gunler[0];
    return `<div class="dd-yigin-12">${DD.gunSekme({ad: 'menu-gun', secili: String(bugun.gun), ogeler: H().gunler.map(x => ({etiket: x.etiket, deger: String(x.gun)}))})}<div data-yuva="menu">${menuPanel(bugun.gun)}</div></div>`;
  };
  const ogunSheet = (gun, i) => {
    const o = H().gunler.find(x => x.gun === gun).ogunler[i];
    const parca = k => k.match(/^(.*?)\s+((?:\d|[½¼¾⅓⅔]|yarım\s|çeyrek\s).*)$/i) || [null, k, ''];
    DD.sheet({
      baslik: o.ad,
      html: `<div class="dd-yigin">${DD.p(`Bu öğün **${nk(o.saat)}** için planlandı ve **${DD.sayi(o.kcal)} kcal** tutuyor.`, {ton: 'ikincil'})}${DD.satirlar(o.kalemler.map(k => { const [, ad, miktar] = parca(k); return {baslik: ad, alt: miktar || null, ok: false}; }))}</div>`,
      altBar: DD.btn({metin: 'Programı aç', ikon: 'program', tur: 'secondary', tam: true, git: `#/program/${H().program}`})
    });
  };

  // ---------- Mesajlar, notlar, paket ----------
  const okunmamis = l => { const son = DD.durum.oku('uzman-okundu', B().sohbet.mesajlar[B().sohbet.mesajlar.length - 2].id); return l.filter(m => m.kim !== 'ben' && m.id > son).length; };
  const saatParca = s => s.slice(s.lastIndexOf(' ') + 1);
  const mesajBolum = () => {
    const l = mesajlar(), d = benim(), yeni = okunmamis(l);
    const baloncuklar = l.slice(-2).map(m => DD.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: d.harf, metin: nk(m.metin), saat: nk(saatParca(m.saat)), ek: m.ek?.ad})).join('');
    return `<div class="dd-yigin-12">${DD.kart({html: `<div class="dd-yigin-12">${baloncuklar}</div>`})}${DD.eylemKart({ikon: 'sifreli', baslik: 'Şifreli sohbet', alt: B().sohbet.sifreMetni, rozet: yeni ? `${yeni} yeni` : null, git: '#/uzman/sohbet'})}</div>`;
  };
  const notlarBolum = () => DD.yuzey(DD.satirlar(B().notlar.map((n, i) => ({ikon: 'duzenle', baslik: n.baslik, alt: n.tarihMetin, veri: {eylem: 'not', id: i}}))));
  const notSheet = i => {
    const n = B().notlar[i];
    DD.sheet({baslik: n.baslik, html: `<div class="dd-yigin">${DD.bilgi({etiket: n.tarihMetin, metin: ilkCumleVurgulu(n.metin)})}</div>`, altBar: DD.btn({metin: 'Yanıt yaz', ikon: 'sohbet', tur: 'secondary', tam: true, git: '#/uzman/sohbet'})});
  };
  const paketBolum = d => {
    const p = B().paket, tanim = d.paketler.find(x => x.id === p.id), biten = tanim.seans - p.kalanSeans;
    return DD.kart({html: `<div class="dd-yigin">${DD.ilerleme({n: biten, hedef: tanim.seans, etiket: `${biten} görüşme tamamlandı`, deger: `${p.kalanSeans} kaldı`})}${DD.kunye([{ikon: 'program', etiket: 'Paket', deger: `${p.ad} · ${tanim.seans} görüşme`}, {ikon: 'takvim', etiket: 'Bitiş', deger: DD.tarihUzun(p.bitis)}])}${DD.btn({metin: 'Paketi yenile', ikon: 'yenile', tur: 'tonal', tam: true, git: `#/uzman/profil/${d.slug}?paket=${p.id}`})}</div>`});
  };

  // ---------- Tabaklar: izin kapalıysa fotoğraf çizilmez, izin yolu gösterilir ----------
  // Varsayılan kapalı (Beyar kararı 1); okuyucu window.DDPaylasim (veri-izinleri.js). Kapalıyken diyetisyen tabak görmez: şerit ve geri bildirim yerine tek kart.
  const tabakIzni = () => (window.DDPaylasim ? DDPaylasim.acik('tabaklar') : DD.durum.oku('saglik-paylasim', {}).tabaklar === true);
  const tabakKapali = () => DD.eylemKart({ikon: 'gizlilik', baslik: 'Tabakların paylaşılmıyor', alt: 'Açarsan diyetisyenin burada görür', git: window.DDPaylasim?.ac('tabaklar') || '#/veri-izinleri?paylas=tabaklar'});
  const kayitlar = () => [...(window.DDKayit?.liste() ?? DDV.ogunKayitlari ?? [])].sort((a, b) => `${b.tarih}${b.saat}`.localeCompare(`${a.tarih}${a.saat}`));
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id)?.ad || id;
  const tabakBolum = () => {
    if (!tabakIzni()) return tabakKapali();
    const l = kayitlar(), paylasilan = l.filter(k => k.foto && k.diyetisyenGorsun !== false).slice(0, 6), notlu = l.filter(k => k.diyetisyenNotu);
    if (!paylasilan.length && !notlu.length) return DD.eylemKart({ikon: 'kamera', baslik: 'İlk tabağını çek', alt: 'Diyetisyenin burada görür', git: '#/ai/kamera?mod=tabak'});
    const not = notlu.length ? DD.eylemKart({ikon: 'duzenle', baslik: `Diyetisyenin ${notlu.length} tabağına not bıraktı`, alt: `Son not ${DD.tarihKisa(notlu[0].diyetisyenNotu.tarih || notlu[0].tarih)}`, git: notlu.length === 1 ? `#/kayit/${notlu[0].id}` : '#/tabaklarim'}) : '';
    return `<div class="dd-yigin-12">${paylasilan.length ? DD.tabakSerit(paylasilan.map(k => ({...k, ogun: ogunAd(k.ogun)}))) : ''}${not}</div>`;
  };

  // ---------- Bekleyen talep ----------
  const talepKart = t => {
    const d = bul(t.slug), p = d.paketler.find(x => x.id === t.paket), {gun, ay} = gunAy(t.tarih);
    return `<div class="dd-yigin-12">${DD.randevuSatir({gun, ay, baslik: d.kisaAd, saat: nk(t.saat), alt: p.ad, durum: 'Onay bekliyor'})}${DD.p('Diyetisyen **onayladığında** bildirim alırsın. Bu adımda ödeme alınmaz.', {ton: 'ikincil'})}${DD.btn({metin: 'Talebi geri çek', tur: 'text', tam: true, veri: {eylem: 'talep-iptal'}})}</div>`;
  };

  // ---------- Görüşme ----------
  const seansSheet = d => DD.sheet({
    baslik: 'Görüşme', tam: true,
    html: `<div class="dd-yigin">${DD.gulucuk({gorsel: KAPAK, etiket: 'Görüşmedesin', baslik: d.ad, alt: B().sohbet.sifreMetni, rol: 'page'})}${DD.p('Kameran ve mikrofonun **görüşme boyunca** senin kontrolünde.', {ton: 'ikincil'})}</div>`,
    altBar: DD.altEylem({
      ikonlar: [{ikon: 'mikrofon', ad: 'Mikrofon', sayi: 'Açık', basili: false, veri: {eylem: 'seans-anahtar'}}, {ikon: 'video', ad: 'Kamera', sayi: 'Açık', basili: false, veri: {eylem: 'seans-anahtar'}}],
      dugmeler: [{metin: 'Görüşmeyi bitir', ikon: 'phone-slash', tur: 'yikici', veri: {eylem: 'seans-bitir'}}]
    }),
    sonra: s => {
      const c = [
        DD.eylem(s, 'seans-anahtar', el => { const kapali = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', kapali); el.querySelector('small').textContent = kapali ? 'Kapalı' : 'Açık'; }),
        DD.eylem(s, 'seans-bitir', () => { s.kapat(); DD.toast('Görüşme **tamamlandı**', {tur: 'basari', ikon: 'onay'}); })
      ];
      return () => c.forEach(f => f());
    }
  });

  // ---------- Randevu detayı ----------
  const detaySheet = () => {
    const r = randevuOku(), slug = B().diyetisyen;
    DD.sheet({
      baslik: r.baslik,
      html: `<div class="dd-yigin">${DD.kunye([{ikon: 'takvim', etiket: 'Tarih', deger: r.tarihMetin}, {ikon: 'saat', etiket: 'Saat', deger: `${nk(r.saat)} · ${r.sureDk} dk`}, {ikon: 'video', etiket: 'Görüşme', deger: r.tur}])}${DD.p(`Bu görüşmede **${r.konu.toLocaleLowerCase('tr')}** konuşulacak.`)}<div class="dd-yigin-8"><p class="dd-t-label dd-ton-ikincil">Hazırlık</p>${gorevler()}</div>${DD.btn({metin: 'Ölçüm ekle', ikon: 'ekle', tur: 'tonal', tam: true, git: '#/saglik?olcum=1'})}</div>`,
      // Yıkıcı eylem ayakta birincil değil (Gastro): üstte birincil Saati değiştir, altında tam genişlik tehlikeli metin İptal (Programlarım/Paketlerim kalıbı); onay diyalogla.
      altBar: `<div class="dd-yigin-8">${DD.btn({metin: 'Saati değiştir', ikon: 'takvim', tam: true, git: `#/uzman/profil/${slug}?ertele=1`})}${DD.btn({metin: 'Görüşmeyi iptal et', tur: 'yikici-metin', tam: true, veri: {eylem: 'randevu-iptal'}})}</div>`,
      sonra: s => {
        const c = [
          ...GOREVLER.map(g => DD.on(s, `gorev-${g.id}`, v => DD.durum.yaz('uzman-hazirlik', {...hazirlik(), [g.id]: v}))),
          DD.eylem(s, 'randevu-iptal', async () => {
            const evet = await DD.dialog({baslik: 'Görüşmeyi iptal et', metin: `**${r.tarihMetin} ${nk(r.saat)}** görüşmen iptal edilecek. Görüşme hakkın **paketinde kalır**.`, eylem: 'İptal et', iptal: 'Vazgeç', yikici: true});
            if (!evet) return;
            s.kapat();
            DD.durum.yaz('uzman-randevu', null);
            DD.tazele();
            DD.toast('Görüşme iptal edildi', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('uzman-randevu', r); DD.tazele(); }});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  // ---------- Ekran gövdesi ----------
  const kisayollar = () => DD.parcali([
    {ikon: 'tahlil', baslik: 'Sağlık dosyam', alt: 'Ölçümler, tahliller, notlar', git: '#/saglik'},
    {ikon: 'tabak', baslik: 'Tabaklarım', alt: 'Fotoğraflı öğün kayıtların', git: '#/tabaklarim'},
    {ikon: 'ara_', baslik: 'Diyetisyenleri incele', alt: 'Uzmanlık ve paketler', git: '#/uzman/bul'}
  ], {aria: 'Kısayollar'});
  const dolu = () => {
    const d = benim(), p = B().paket, tanim = d.paketler.find(x => x.id === p.id), t = talepOku();
    return DD.profilBas({
      ad: d.kisaAd, alt: `${d.unvan} · ${d.sehir}`, kapak: KAPAK, ust: true, avatarSinif: DD.uzmanTon(d),
      eylem: DD.btn({metin: 'Profili gör', tur: 'tonal', boyut: 'sm', git: `#/uzman/profil/${d.slug}`}),
      sayaclar: [{deger: String(p.kalanSeans), etiket: 'Kalan görüşme'}, {deger: String(tanim.seans - p.kalanSeans), etiket: 'Tamamlanan'}, {deger: p.ad, etiket: 'Paket'}]
    }) + DD.bolumler([
      t && {baslik: 'Bekleyen talebin', html: talepKart(t)},
      {baslik: 'Görüşmelerin', html: `<div class="dd-yigin-12">${DD.segment({ad: 'randevu', etiket: 'Görüşmeler', secili: 'yaklasan', ogeler: [{ad: 'Yaklaşan', deger: 'yaklasan'}, {ad: 'Geçmiş', deger: 'gecmis'}]})}<div data-yuva="randevu">${randevuPanel('yaklasan')}</div></div>`},
      {baslik: 'Öğün geri bildirimleri', eylem: 'Tabaklarım', git: '#/tabaklarim', html: geriBildirim()},
      {baslik: 'Bu haftanın menüsü', eylem: 'Program', git: `#/program/${H().program}`, html: menuBolum()},
      {baslik: 'Mesajlar', eylem: 'Tümü', git: '#/uzman/sohbet', html: mesajBolum()},
      tabakIzni() && {baslik: 'Tabakların', html: tabakBolum()},
      {baslik: 'Diyetisyen notları', html: notlarBolum()},
      {baslik: 'Paketin', html: paketBolum(d)},
      {baslik: 'Daha fazlası', html: kisayollar()}
    ]);
  };
  // K7: onay değil görülme bilgisi; diyetisyenin notu varsa "gördü" sayılır.
  const geriBildirim = () => { if (!tabakIzni()) return tabakKapali(); const l = DDV.ogunKayitlari.filter(k => k.foto && k.diyetisyenGorsun); return DD.yuzey(DD.satirlar([...l.filter(k => !k.diyetisyenNotu).slice(0, 1), ...l.filter(k => k.diyetisyenNotu).slice(0, 3)].map(k => ({gorsel: k.foto, baslik: k.ad, alt: k.diyetisyenNotu?.metin ?? 'Paylaşıldı', ozet: true, ek: DD.durumRozet(k.diyetisyenNotu ? {metin: 'Diyetisyen gördü', ton: 'basari', ikon: 'onay'} : {metin: 'Bekliyor', ton: 'notr', ikon: 'clock'}), git: `#/kayit/${k.id}`})))); };
  const bos = () => {
    const t = talepOku();
    return DD.gulucuk({gorsel: KAPAK, etiket: 'Uzmanım', baslik: 'Yanında bir diyetisyen', alt: 'Görüşme, menü ve mesaj tek yerde', ust: true}) + DD.bolumler([
      t && {baslik: 'Bekleyen talebin', html: talepKart(t)},
      DD.bos({ikon: 'uzman', baslik: 'Henüz diyetisyenin yok', metin: 'Üç soruyla **sana uygun uzmanı** bulabilir ya da listeden kendin seçebilirsin.', eylem: {metin: 'Uzman bul', ikon: 'wand-magic-sparkles', git: '#/uzman/bul?adim=1'}, ikincil: {metin: 'Tüm diyetisyenler', git: '#/uzman/bul'}}),
      {baslik: 'Diyetisyeninle neler yaparsın', html: `<div class="dd-yigin-12">${['**Haftalık menü** sana göre hazırlanır', '**Şifreli mesajla** sorularını sorarsın', '**Sağlık dosyanı** izin verirsen görür'].map(metin => DD.madde({metin})).join('')}</div>`}
    ]);
  };

  let hazir = false, hataGosterildi = false;

  DD.ekran('uzman', {
    tur: 'banner',
    ust: '#/bugun',
    baslik: 'Uzmanım',
    yenile: true,
    iskelet: 'profil',
    ustBar: () => ({saydam: hazir}),   // iskelet ve hata fotoğrafsızdır; üst bar solid kalır
    yukle: () => {
      if (hal() === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      if (hazir) return Promise.resolve();
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: () => (hal() === 'bos' || DD.yeniHesap() ? bos() : dolu()),
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    sonra: kok => {
      const yuva = (ad, html) => { const el = kok.querySelector(`[data-yuva="${ad}"]`); if (el) el.innerHTML = html; };
      const c = [
        DD.on(kok, 'randevu', v => yuva('randevu', randevuPanel(v))),
        DD.on(kok, 'menu-gun', v => yuva('menu', menuPanel(+v))),
        DD.eylem(kok, 'detay', detaySheet),
        DD.eylem(kok, 'seans', () => seansSheet(benim())),
        DD.eylem(kok, 'menu-ogun', el => { const [g, i] = el.dataset.id.split('.').map(Number); ogunSheet(g, i); }),
        DD.eylem(kok, 'not', el => notSheet(+el.dataset.id)),
        DD.eylem(kok, 'talep-iptal', async () => {
          const t = talepOku(), evet = await DD.dialog({baslik: 'Talebi geri çek', metin: `**${bul(t.slug).ad}** için gönderdiğin talep kaldırılacak.`, eylem: 'Geri çek', iptal: 'Vazgeç', yikici: true});
          if (!evet) return;
          DD.durum.sil('uzman-talep');
          DD.tazele();
          DD.toast('Talep geri çekildi', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('uzman-talep', t); DD.tazele(); }});
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
