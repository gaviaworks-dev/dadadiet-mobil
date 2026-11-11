/* SCR-51 Sağlık dosyam (#/saglik): Gastro profil başı. Referans: tasks/referanslar.md Sağlık dosyam, §2.8.
 * Durum: saglik-olcumler [{tarih, kiloKg, belCm, yagYuzde}], saglik-tahliller (ai-tahlil ekler; kanTahlilleri şekli), saglik-paylasim {olcum, tahlil, analiz, tabaklar}; eski kayıtta olmayan alan varsayılan açık sayılır.
 * 2 haftalık dönem DDV.gecmis'ten gelir: soluk çizgi ham tartı, kalın çizgi üç günlük ortalama (veride ayrı eğilim yok, türetildi).
 * Cihazdan gelen veriler (E5): son 7 gün adım, kilo, uyku DDV.hesap.cihazVerisi'nden; durum ve rıza okuyucusu window.DDCihazIzin (ekranlar/veri-izinleri.js).
 *   Bağlantı yoksa boş hal → #/cihazlar, rıza yoksa "Rıza ver" DDCihazIzin.rizaAl({kaynak:'saglik'}), silindiyse bilgi satırı. Tartıdan gelen kilo DDV.gecmis ile aynı kayıttır (Ölçümlerin grafiğine de işlenir).
 * #/saglik?hal=bos hiç kaydı olmayan dosya (ölçümler 'yeni-' önekiyle), ?hal=hata bağlantı hatası, ?olcum=1 ölçüm sheet'i açık gelir, ?izin=1 paylaşım iznine iner. */
(() => {
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');   // görünen saat noktalı (19.30); veri ve durum anahtarı ':' kalır
  const S = () => DDV.saglik, K = () => DDV.kullanici;
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  const bosMu = () => hal() === 'bos' || DD.yeniHesap();
  const METRIK = {
    kilo: {alan: 'kiloKg', ad: 'Kilo', birim: 'kg', ikon: 'kilo', min: 35, max: 200, sozcuk: 'kilon'},
    bel: {alan: 'belCm', ad: 'Bel', birim: 'cm', ikon: 'bel', min: 50, max: 160, sozcuk: 'bel ölçün'},
    yag: {alan: 'yagYuzde', ad: 'Yağ oranı', kisa: 'Yağ', birim: '%', ikon: 'yagOrani', min: 5, max: 60, sozcuk: 'yağ oranın'}
  };
  const DONEMLER = [{ad: '2H', deger: '2h', metin: 'iki haftada'}, {ad: '1A', deger: '1a', metin: 'bir ayda'}, {ad: '3A', deger: '3a', metin: 'üç ayda'}, {ad: '6A', deger: '6a', metin: 'altı ayda'}, {ad: '1Y', deger: '1y', metin: 'bir yılda'}];
  const PAYLASIM = [
    {id: 'olcum', etiket: 'Ölçümlerim', alt: 'Kilo, bel ve yağ oranı', ikon: 'kilo'},
    {id: 'tahlil', etiket: 'Kan tahlillerim', alt: 'Yüklediğin tahlil sonuçları', ikon: 'tahlil'},
    {id: 'analiz', etiket: 'AI analizlerim', alt: 'Tahlil okuma notları', ikon: 'wand-magic-sparkles'},
    {id: 'tabaklar', etiket: 'Tabak fotoğraflarım', alt: 'Fotoğraf, öğün, kalori ve notun', ikon: 'tabak'}
  ];

  // ---------- Kayıtlar ----------
  const anahtar = () => `${bosMu() ? 'yeni-' : ''}saglik-olcumler`;
  const olcumler = () => DD.durum.oku(anahtar(), []);
  // ai-tahlil kaydı DDV'deki tahlille aynı id'yi taşır (analiz bağı kopmasın diye); aynı kayıt iki kez listelenmez.
  const tahliller = () => { if (bosMu()) return []; const e = DD.durum.oku('saglik-tahliller', []); return [...e, ...S().kanTahlilleri.filter(t => !e.some(x => x.id === t.id))]; };
  const analizler = () => (bosMu() ? [] : S().aiAnalizleri);
  const notlar = () => (bosMu() ? [] : S().diyetisyenNotlari);
  const paylasim = () => ({olcum: true, tahlil: true, analiz: true, tabaklar: true, ...DD.durum.oku('saglik-paylasim', {})});
  const birlestir = (seri, alan) => {
    const m = new Map(seri.map(x => [x.tarih, x]));
    olcumler().filter(o => o[alan] != null).forEach(o => m.set(o.tarih, {tarih: o.tarih, etiket: DD.tarihKisa(o.tarih), deger: o[alan]}));
    return [...m.values()].sort((a, b) => a.tarih.localeCompare(b.tarih));
  };
  const seri = (ad, donem) => {
    const M = METRIK[ad], kaynak = S().seriler[ad];
    if (bosMu()) return birlestir([], M.alan);
    if (donem === '2h') return birlestir(DDV.gecmis.map(g => ({tarih: g.tarih, etiket: DD.tarihKisa(g.tarih), deger: g[M.alan]})), M.alan);
    if (donem === '1a') return birlestir(kaynak.haftalik, M.alan).slice(-5);
    const l = birlestir(kaynak.aylik, M.alan);
    return donem === '3a' ? l.slice(-4) : donem === '6a' ? l.slice(-7) : l;
  };
  const guncel = ad => { const l = seri(ad, '1y'); return l.length ? l[l.length - 1].deger : null; };
  const ilkDeger = ad => seri(ad, '1y')[0]?.deger ?? null;
  // Son nokta ham kalır: grafik balonu üstteki güncel değerle aynı okunsun.
  const egilim = l => l.map((x, i) => { if (i === l.length - 1) return x; const p = l.slice(Math.max(0, i - 1), i + 2); return {...x, deger: Math.round(p.reduce((t, y) => t + y.deger, 0) / p.length * 10) / 10}; });

  // ---------- Metrik kartları ----------
  const degisimMetin = (ad, fark) => { const M = METRIK[ad], n = DD.ondalik(Math.abs(fark), 1); return Math.abs(fark) < .05 ? 'Değişmedi' : `${n} ${M.birim} ${fark < 0 ? 'azaldı' : 'arttı'}`; };
  const metrikKart = ad => {
    const M = METRIK[ad], g = guncel(ad), ilk = ilkDeger(ad), fark = g != null && ilk != null ? g - ilk : null;
    return DD.metrikKart({etiket: M.kisa || M.ad, deger: g != null ? DD.ondalik(g, 1) : null, birim: M.birim, ikon: M.ikon, degisim: fark != null && seri(ad, '1y').length > 1 ? degisimMetin(ad, fark) : null, degisimTon: fark < 0 ? 'iyi' : 'notr'});
  };

  // ---------- Grafik ----------
  const grafikKart = s => {
    const M = METRIK[s.metrik], l = seri(s.metrik, s.donem), d = DONEMLER.find(x => x.deger === s.donem);
    const donemler = DONEMLER.map(({ad, deger}) => ({ad, deger}));
    if (l.length < 2) return DD.grafikKart({deger: l.length ? DD.ondalik(l[0].deger, 1) : null, birim: M.birim, cumle: 'İkinci ölçümden sonra **eğrin** burada görünür.', grafik: DD.veriYok(`${M.ad} için **en az iki ölçüm** gerekir.`), donemler, donem: s.donem, ad: 'donem'});
    const son = l[l.length - 1].deger, fark = son - l[0].deger, ham = s.donem === '2h', hedef = s.metrik === 'kilo' && ['6a', '1y'].includes(s.donem) ? K().hedefKiloKg : null;
    const cumle = `Son ${d.metin} ${M.sozcuk} **${degisimMetin(s.metrik, fark).toLocaleLowerCase('tr')}**.${ham ? ' Soluk çizgi tartın, kalın çizgi eğilimin.' : ''}`;
    const alt = s.metrik === 'kilo'
      ? [{deger: `${DD.ondalik(K().baslangicKiloKg, 1)} kg`, etiket: 'Başlangıç'}, {deger: `${DD.ondalik(K().hedefKiloKg, 1)} kg`, etiket: 'Hedef'}, {deger: `${DD.ondalik(Math.max(0, guncel('kilo') - K().hedefKiloKg), 1)} kg`, etiket: 'Hedefe kalan'}]
      : [{deger: `${DD.ondalik(ilkDeger(s.metrik), 1)} ${M.birim}`, etiket: 'Başlangıç'}, {deger: `${DD.ondalik(guncel(s.metrik), 1)} ${M.birim}`, etiket: 'Güncel'}, {deger: `${DD.ondalik(guncel(s.metrik) - ilkDeger(s.metrik), 1)} ${M.birim}`, etiket: 'Değişim'}];
    return DD.grafikKart({
      deger: DD.ondalik(son, 1), birim: M.birim, fark: degisimMetin(s.metrik, fark), farkTon: fark < 0 ? 'iyi' : 'notr', cumle,
      grafik: DD.grafik({tur: 'eksenli', ad: 'olcum-grafik', etiket: `${M.ad} grafiği`, seri: ham ? egilim(l) : l, ham: ham ? l : undefined, hedef, hedefEtiket: hedef != null ? `Hedef ${DD.ondalik(hedef, 1)}` : undefined, birim: M.birim}),
      donemler, donem: s.donem, ad: 'donem', alt
    });
  };
  const olcumBolum = s => `<div class="dd-yigin-12">${DD.segment({ad: 'metrik', etiket: 'Ölçüm türü', secili: s.metrik, ogeler: Object.entries(METRIK).map(([deger, m]) => ({ad: m.ad, deger}))})}<div data-yuva="grafik">${grafikKart(s)}</div></div>`;

  // ---------- Belgeler ----------
  const araliktaSay = t => t.degerler.filter(x => x.durum === 'normal').length;
  const ayYil = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', {month: 'long', year: 'numeric'});
  const tahlilSatir = t => DD.belgeSatir({ikon: 'tahlil', baslik: `Kan tahlili · ${ayYil(t.tarih)}`, alt: `${araliktaSay(t)}/${t.degerler.length} aralıkta`, tarih: t.kaynak, veri: {eylem: 'tahlil', id: t.id}});
  const analizSatir = a => DD.belgeSatir({ikon: 'wand-magic-sparkles', baslik: a.baslik, alt: a.tarihMetin, veri: {eylem: 'analiz', id: a.id}});
  const belgeBolum = () => {
    const t = tahliller(), a = analizler();
    if (!t.length) return DD.bos({ikon: 'tahlil', baslik: 'Henüz tahlil yok', metin: 'Tahlilini taradığında değerlerin **referans aralığıyla** burada görünür.', eylem: {metin: 'Tahlil tara', ikon: 'kamera', git: '#/ai/kamera?mod=tahlil'}});
    return `<div class="dd-yigin-12">${DD.gizlilikBant()}${DD.yuzey(DD.satirlar(t.map(tahlilSatir)))}</div>`;
  };
  const analizBolum = () => DD.yuzey(DD.satirlar(analizler().map(analizSatir)));
  const genelNot = metin => DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: metin.replace(/^([^;.]+)/, '**$1**')});

  const sohbeteEkle = m => DD.durum.yaz('uzman-sohbet', [...DD.durum.oku('uzman-sohbet', []), {id: Date.now(), kim: 'ben', saat: `Bugün ${DDV.bugun.simdi}`, ...m}]);
  const tahlilGonder = t => {
    if (!paylasim().tahlil) { DD.toast('Tahlil paylaşımın **kapalı**', {ikon: 'gizlilik'}); return; }
    sohbeteEkle({metin: 'Tahlil sonucumu gönderiyorum.', ek: {tur: 'tahlil', ad: `Kan tahlili · ${t.tarihMetin}`}});
    DD.toast('Tahlil **diyetisyenine gönderildi**', {tur: 'basari', eylem: 'Sohbete git', onEylem: () => DD.git('#/uzman/sohbet')});
  };
  const tahlilSheet = id => {
    const t = tahliller().find(x => x.id === id), l = [...t.degerler].sort((a, b) => (a.durum === 'normal') - (b.durum === 'normal')), a = S().aiAnalizleri.find(x => x.tahlil === t.id);
    DD.sheet({
      baslik: `Kan tahlili · ${t.tarihMetin}`, tam: true,
      html: `<div class="dd-yigin">${DD.p(`**${t.degerler.length} değerin ${araliktaSay(t)} tanesi** referans aralığında. Sonuçlarını diyetisyeninle ve hekiminle değerlendir.`)}${DD.kart({html: DD.satirlar(l.map(x => DD.tahlilSatir(x)))})}${a ? DD.eylemKart({ikon: 'wand-magic-sparkles', baslik: a.baslik, alt: a.tarihMetin, veri: {eylem: 'analiz-ac', id: a.id}}) : ''}${genelNot(a?.uyari || 'Bu okuma bilgilendirme amaçlıdır; teşhis değildir.')}</div>`,
      altBar: DD.btn({metin: 'Diyetisyenime gönder', ikon: 'gonder', tam: true, veri: {eylem: 'tahlil-gonder'}}),
      sonra: h => {
        const c = [DD.eylem(h, 'tahlil-gonder', () => { h.kapat(); tahlilGonder(t); }), DD.eylem(h, 'analiz-ac', el => { h.kapat(); analizSheet(el.dataset.id); })];
        return () => c.forEach(f => f());
      }
    });
  };
  const analizSheet = id => {
    const a = analizler().find(x => x.id === id);
    DD.sheet({
      baslik: a.baslik,
      html: `<div class="dd-yigin">${DD.bilgi({etiket: a.tarihMetin, metin: a.ozet})}<div class="dd-yigin-8">${a.maddeler.map(m => DD.madde({tur: 'notr', metin: m.replace(/^(\S+\s\S+)/, '**$1**')})).join('')}</div>${genelNot(a.uyari)}</div>`,
      altBar: DD.btn({metin: 'Diyetisyenime sor', ikon: 'sohbet', tam: true, git: '#/uzman/sohbet'})
    });
  };
  // Duygu ile günlük kalori birlikte gösterilir; neden sonuç iddiası yoktur.
  // Kalori trendi: 7 ve 30 gün, bugün sürdüğü için sayılmaz; makro dengesi aynı dönemin ortalamasıdır.
  let trendDonem = '7';
  const trendBolum = () => {
    const T = S().kaloriTrend, gun = [...T.onceki.map((kcal, i) => ({etiket: '', kcal})), ...DDV.gecmis.slice(0, -1).map(g => ({etiket: g.gun, kcal: g.kcal}))].slice(-+trendDonem), m = T.makro[trendDonem], ort = Math.round(gun.reduce((t, x) => t + x.kcal, 0) / gun.length);
    return DD.grafikKart({deger: DD.sayi(ort), birim: 'kcal ortalama', cumle: `Son **${trendDonem} günde** günlük ortalaman.`, grafik: DD.grafik({tur: 'eksenli', ad: 'kalori-grafik', etiket: 'Kalori grafiği', birim: 'kcal', ondalik: 0, ton: 'primary', seri: gun.map(x => ({etiket: x.etiket, deger: x.kcal}))}), donemler: [{ad: '7 gün', deger: '7'}, {ad: '30 gün', deger: '30'}], donem: trendDonem, ad: 'trend-donem', alt: [{deger: `%${m.P}`, etiket: 'Protein'}, {deger: `%${m.K}`, etiket: 'Karbonhidrat'}, {deger: `%${m.Y}`, etiket: 'Yağ'}]});
  };
  // BMH: Mifflin-St Jeor, web hesaplayıcısıyla aynı formül.
  const testBolum = () => {
    const k = DDV.kullanici, bmh = Math.round(10 * k.kiloKg + 6.25 * k.boyCm - 5 * k.yas + (k.cinsiyet === 'erkek' ? 5 : -161)), r = Object.entries(DD.durum.oku('test-sonuclari', {}));
    return `<div class="dd-yigin-12">${DD.metrikKart({etiket: 'Bazal metabolizma hızı', deger: DD.sayi(bmh), birim: 'kcal/gün', ikon: 'kalori'})}${r.length ? DD.yuzey(DD.satirlar(r.map(([s, x]) => ({ikon: 'clipboard-check', baslik: DDV.testler.liste.find(t => t.slug === s)?.ad ?? s, alt: `${x.baslik} · ${x.puan} puan`, git: `#/test/${s}`})))) : ''}${DD.eylemKart({ikon: 'clipboard-check', baslik: `${DDV.testler.toplam} Sağlık Testi`, alt: 'Testini çöz, sonucun burada dursun', git: '#/testler'})}</div>`;
  };
  const duyguBolum = () => {
    const D = DDV.bugun.duygu.secenekler, bugun = DD.durum.oku('bugun-duygu', null), gunler = DDV.gecmis.map((y, i, a) => (bugun && i === a.length - 1 ? {...y, duygu: bugun} : y)), l = D.map(x => { const g = gunler.filter(y => y.duygu === x.id && y.kcal); return {...x, n: g.length, ort: g.length ? Math.round(g.reduce((t, y) => t + y.kcal, 0) / g.length) : 0}; }).filter(x => x.n), ust = Math.max(...l.map(x => x.ort));
    return DD.kart({html: `<div class="dd-yigin-12">${l.map(x => DD.ilerleme({n: x.ort, hedef: ust, etiket: `${x.ad} · ${x.n} gün`, deger: `${DD.sayi(x.ort)} kcal`})).join('')}${DD.p('Son 14 günde hissettiklerin ve **ortalama kalorin** yan yana. Bir sonuç değil, diyetisyeninle konuşabileceğin bir ipucu.', {ton: 'ikincil', meta: true})}</div>`});
  };
  const notBolum = () => DD.akordiyon(notlar().map(n => ({baslik: n.baslik, alt: n.tarihMetin, ikon: 'duzenle', icerik: DD.p(nk(n.metin).replace(/^([^.;]+[.;])/, '**$1**'))})));
  const paylasimBolum = () => {
    const p = paylasim(), d = DDV.diyetisyenler.find(x => x.slug === K().diyetisyen);
    return `<div class="dd-yigin-12">${DD.p(`Bu bilgileri **${d.ad}** görebilir. Tabakta “Diyetisyenim görsün” anahtarını kapattığın kayıt **paylaşılmaz**.`, {ton: 'ikincil'})}${DD.yuzey(DD.satirlar(PAYLASIM.map(x => DD.toggle({...x, ad: `paylas-${x.id}`, secili: p[x.id]}))))}${DD.gizlilikBant(S().bilgiNotu.replace('yalnız sen ve izin verdiğin diyetisyen', '**yalnız sen ve izin verdiğin diyetisyen**'))}</div>`;
  };

  // ---------- Cihazdan gelen veriler (E5) ----------
  const cihazBolum = () => {
    const C = window.DDCihazIzin;
    if (!C) return '';
    const b = C.baglanti();
    if (!b) return DD.bos({ikon: 'heart-pulse', baslik: 'Sağlık uygulaman bağlı değil', metin: 'Apple Health ya da Health Connect’i bağladığında **adım, kilo ve uyku** verin burada görünür.', eylem: {metin: 'Bağla', ikon: 'link', git: '#/cihazlar'}});
    if (!C.rizaEtkin()) return DD.bos({ikon: 'shield-halved', baslik: 'Açık rızan bekleniyor', metin: `${b.ad} bağlı; verinin burada görünmesi için **sağlık uygulaması rızan** gerekir.`, eylem: {metin: 'Rıza ver', ikon: 'shield-halved', veri: {eylem: 'cihaz-riza'}}});
    const o = C.ozet(), kaynak = {ikon: 'arrows-rotate', baslik: b.ad, alt: b.son ? `Son eşitleme ${kucukBas(nk(b.son))}` : 'İlk eşitleme bekleniyor', git: b.id ? `#/cihaz/${b.id}` : '#/cihazlar'};
    if (!o) return `<div class="dd-yigin-12">${DD.yuzey(DD.satirlar([kaynak]))}${DD.veriYok(C.oku().silindi ? 'Cihaz kayıtların silindi; **yeni eşitlemeden** sonra burada görünür.' : 'İlk eşitlemeden sonra **son 7 günün** burada görünür.')}</div>`;
    const l = C.paylasilan(), uz = !DD.yeniHesap() && DDV.diyetisyenler.find(x => x.slug === K().diyetisyen);
    const turler = [{ad: 'Adım', deger: 'adim'}, o.kilo && {ad: 'Kilo', deger: 'kilo'}, {ad: 'Uyku', deger: 'uyku'}].filter(Boolean);
    if (!turler.some(t => t.deger === cihazMetrik)) cihazMetrik = 'adim';
    const satirlar = [kaynak, uz && {ikon: 'user-doctor', baslik: 'Diyetisyenim bunu görür', alt: l.length ? l.map((t, i) => (i ? t.etiket.toLocaleLowerCase('tr') : t.etiket)).join(', ') : 'Paylaşım kapalı · diyetisyenin görmez', git: l.length ? '#/veri-izinleri?onizleme=1' : '#/veri-izinleri?cihaz=1'}].filter(Boolean);
    return `<div class="dd-yigin-12">${DD.p(`Son **${o.gun} gün**, ${b.ad} üzerinden. Tartından gelen kilolar **Ölçümlerin** grafiğine de işlenir.`, {ton: 'ikincil', meta: true})}${DD.segment({ad: 'cihaz-metrik', etiket: 'Cihaz verisi türü', secili: cihazMetrik, ogeler: turler})}${cihazGrafik(o, cihazMetrik)}${DD.yuzey(DD.satirlar(satirlar))}</div>`;
  };
  let cihazMetrik = 'adim';
  const kucukBas = v => v.charAt(0).toLocaleLowerCase('tr') + v.slice(1);
  const eksiKg = f => `${f < 0 ? '−' : f > 0 ? '+' : ''}${DD.ondalik(Math.abs(f), 1)} kg`;
  const saat = dk => `${DD.ondalik(dk / 60, 1)} sa`;
  const cihazGrafik = (o, m) => {
    const enUc = (l, f) => l.reduce((a, x) => (f(x.deger, a.deger) ? x : a));
    if (m === 'kilo') {
      const k = o.kilo, ilk = k.seri[0].deger;
      return DD.grafikKart({deger: DD.ondalik(k.son, 1), birim: 'kg', fark: k.n > 1 ? degisimMetin('kilo', k.fark) : null, farkTon: k.fark < 0 ? 'iyi' : 'notr', cumle: `Son ${o.gun} günde tartından **${k.n} ölçüm** geldi; bunlar Ölçümlerin grafiğinde de görünür.`, grafik: k.n > 1 ? DD.grafik({tur: 'eksenli', ad: 'cihaz-grafik', etiket: 'Cihazdan kilo grafiği', birim: 'kg', seri: k.seri}) : DD.veriYok('Eğri için **en az iki tartım** gerekir.'), alt: [{deger: `${DD.ondalik(ilk, 1)} kg`, etiket: 'İlk tartım'}, {deger: `${DD.ondalik(k.son, 1)} kg`, etiket: 'Son tartım'}, {deger: eksiKg(Math.round((k.son - ilk) * 10) / 10), etiket: 'Değişim'}]});
    }
    if (m === 'uyku') {
      const u = o.uyku, sa = u.seri.map(x => ({...x, deger: Math.round(x.deger / 6) / 10}));
      return DD.grafikKart({deger: DD.ondalik(u.ort / 60, 1), birim: 'saat ortalama', cumle: `Son **${o.gun} gecenin** ortalaması; dün gece **${saat(u.son)}** uyudun.`, grafik: DD.grafik({tur: 'eksenli', ad: 'cihaz-grafik', etiket: 'Uyku grafiği', birim: 'sa', seri: sa}), alt: [{deger: saat(enUc(u.seri, (a, b) => a < b).deger), etiket: 'En kısa'}, {deger: saat(enUc(u.seri, (a, b) => a > b).deger), etiket: 'En uzun'}, {deger: saat(u.son), etiket: 'Dün gece'}]});
    }
    const a = o.adim;
    return DD.grafikKart({deger: DD.sayi(a.ort), birim: 'adım ortalama', cumle: `Tamamlanan günlerin ortalaması; bugün şimdiye dek **${DD.sayi(a.bugun)} adım**.`, grafik: DD.grafik({tur: 'eksenli', ad: 'cihaz-grafik', etiket: 'Adım grafiği', birim: 'adım', ondalik: 0, seri: a.seri}), alt: [{deger: DD.sayi(enUc(a.seri.slice(0, -1), (x, y) => x > y).deger), etiket: 'En yüksek'}, {deger: DD.sayi(a.bugun), etiket: 'Bugün'}, {deger: DD.sayi(a.seri.reduce((t, x) => t + x.deger, 0)), etiket: `${o.gun} gün toplam`}]});
  };

  const tabakGiris = () => { const n = bosMu() ? 0 : (window.DDKayit?.liste() ?? DDV.ogunKayitlari ?? []).filter(k => k.foto).length; return DD.eylemKart({ikon: 'tabak', baslik: 'Tabaklarım', alt: n ? `${DD.sayi(n)} fotoğraflı öğün kaydı` : 'Fotoğraflı öğün kayıtların', git: '#/tabaklarim'}); };

  // ---------- Ölçüm ekle ----------
  const olcumSheet = kok => {
    const son = {kilo: guncel('kilo') ?? K().kiloKg, bel: guncel('bel') ?? S().ozet.belCm, yag: guncel('yag') ?? S().ozet.yagYuzde};
    const satir = ad => { const M = METRIK[ad]; return DD.alan({etiket: M.ad, html: DD.stepper({ad: `olcum-${ad}`, deger: son[ad], min: M.min, max: M.max, adim: .1, birim: M.birim, aria: M.ad})}); };
    DD.sheet({
      baslik: 'Ölçüm ekle',
      html: `<div class="dd-yigin">${DD.takvimAlan({ad: 'olcum-tarih', etiket: 'Tarih', deger: DD.bugunIso(), max: DD.bugunIso(), hizli: [['Bugün', 0]]})}${Object.keys(METRIK).map(satir).join('')}${DD.veriYok('Değerler **son ölçümünden** dolduruldu.')}</div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'olcum-kaydet'}}),
      sonra: h => DD.eylem(h, 'olcum-kaydet', () => {
        const oku = ad => +h.querySelector(`input[name="olcum-${ad}"]`).value, tarih = h.querySelector('input[name="olcum-tarih"]').value || DD.bugunIso();
        const onceki = olcumler(), yeni = {tarih, kiloKg: oku('kilo'), belCm: oku('bel'), yagYuzde: oku('yag')};
        DD.durum.yaz(anahtar(), [...onceki.filter(o => o.tarih !== tarih), yeni]);
        h.kapat();
        DD.tazele();
        DD.toast('Ölçümün **dosyana eklendi**', {tur: 'basari', eylem: 'Geri al', onEylem: () => { DD.durum.yaz(anahtar(), onceki); if (kok.isConnected) DD.tazele(); }});
      })
    });
  };

  // ---------- Gövde ----------
  const govde = ctx => {
    const k = K(), s = ctx.saglik ||= {metrik: 'kilo', donem: '1a'}, g = guncel('kilo'), bos = bosMu();
    const dolu = !bos || g != null;
    return DD.profilBas({
      ad: `${k.ad} ${k.soyad}`, alt: `${k.yas} yaş · ${k.boyCm} cm · ${k.hedefAd}`, kapak: 'assets/gorsel/hero/ritim-sakin.webp', ust: true,
      sayaclar: [
        {deger: dolu ? `${DD.ondalik(Math.max(0, k.baslangicKiloKg - g), 1)} kg` : '––', etiket: 'Verilen'},
        {deger: dolu ? `${DD.ondalik(Math.max(0, g - k.hedefKiloKg), 1)} kg` : '––', etiket: 'Hedefe kalan'},
        {deger: dolu ? DD.ondalik(g / (k.boyCm / 100) ** 2, 1) : '––', etiket: 'BKİ'}
      ]
    }) + DD.bolumler([
      `<div class="dd-yigin-12"><div class="dd-izgara-3">${Object.keys(METRIK).map(metrikKart).join('')}</div>${dolu ? DD.kart({html: DD.yolculuk({bas: k.baslangicKiloKg, simdi: g, hedef: k.hedefKiloKg, etiket: 'Hedefe yolculuğun'})}) : ''}</div>`,
      {baslik: 'Ölçümlerin', html: olcumBolum(s)},
      {id: 'cihaz-verisi', baslik: 'Cihazdan gelen veriler', html: cihazBolum()},
      {baslik: 'Kalori trendi', html: trendBolum()},
      {baslik: 'Kan tahlilleri', html: belgeBolum()},
      analizler().length && {baslik: 'AI analiz geçmişi', html: analizBolum()},
      notlar().length && {baslik: 'Diyetisyen notları', html: notBolum()},
      {baslik: 'Tabakların', html: tabakGiris()},
      {baslik: 'Test skorları ve BMH', html: testBolum()},
      {baslik: 'Duygu ve beslenme', html: duyguBolum()},
      !bos && {id: 'paylasim-izni', baslik: 'Paylaşım izni', html: paylasimBolum()}
    ]);
  };

  let hazir = false, hataGosterildi = false;

  DD.ekran('saglik', {
    bos: {ikon: 'file-medical', baslik: 'Sağlık dosyan boş', metin: 'Tahlil, ölçüm ve belgelerin **burada** toplanır.', eylem: {metin: 'Tahlil yükle', ikon: 'tahlil', git: '#/ai/tahlil'}},   // ?hal=bos (ortak DD.bos)
    tur: 'banner',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Sağlık dosyam',
    yenile: true,
    iskelet: 'profil',
    ustBar: () => ({saydam: hazir}),
    yukle: () => {
      if (hal() === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      if (hazir) return Promise.resolve();
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    altBar: () => DD.altEylem({dugmeler: [{metin: 'Tahlil tara', ikon: 'tahlil', tur: 'secondary', git: '#/ai/kamera?mod=tahlil'}, {metin: 'Ölçüm ekle', ikon: 'ekle', veri: {eylem: 'olcum'}}]}),
    sonra: (kok, ctx) => {
      const s = ctx.saglik, yuva = kok.querySelector('[data-yuva="grafik"]');
      const grafik = () => { yuva.innerHTML = grafikKart(s); };
      if (ctx.sorgu.olcum && !ctx.olcumAcildi) { ctx.olcumAcildi = true; olcumSheet(kok); }
      if (ctx.sorgu.izin && !ctx.izinIndi) {
        ctx.izinIndi = true;
        requestAnimationFrame(() => { const k = kok.querySelector('.dd-kaydir'), h = kok.querySelector('#paylasim-izni'); if (h) k.scrollTop += h.getBoundingClientRect().top - k.getBoundingClientRect().top - kok.querySelector('.dd-header').offsetHeight; });
      }
      const c = [
        DD.on(kok, 'metrik', v => { s.metrik = v; grafik(); }),
        DD.on(kok, 'donem', v => { s.donem = v; grafik(); }),
        DD.on(kok, 'trend-donem', v => { trendDonem = v; DD.tazele(); }),
        DD.on(kok, 'cihaz-metrik', v => { cihazMetrik = v; DD.tazele(); }),
        DD.eylem(kok, 'cihaz-riza', () => window.DDCihazIzin?.rizaAl({kaynak: 'saglik'}).then(ok => { if (ok && kok.isConnected) DD.tazele(); })),
        DD.eylem(kok, 'olcum', () => olcumSheet(kok)),
        DD.eylem(kok, 'tahlil', el => tahlilSheet(el.dataset.id)),
        DD.eylem(kok, 'analiz', el => analizSheet(el.dataset.id)),
        ...PAYLASIM.map(x => DD.on(kok, `paylas-${x.id}`, v => {
          DD.durum.yaz('saglik-paylasim', {...paylasim(), [x.id]: v});
          DD.toast(v ? `**${x.etiket}** paylaşılıyor` : `**${x.etiket}** paylaşımı kapatıldı`, {ikon: 'gizlilik'});
        }))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
