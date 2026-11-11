/* Telefon özellikleri (#/telefon, alt; Ayarlar > Uygulama): kilit ekranı canlı etkinliği (iOS Live Activities + Dinamik Ada, Android kalıcı bildirim),
 * ana ekran widget'ları (kalori, su, oruç, sıradaki öğün; küçük/orta), sesli komutlar (Siri / Google Asistan: "Bir bardak su ekle", "Öğle yemeğimi kaydet").
 * Çerçeve ve parçalar kanon/dd-cihaz.js (DD.telefonCerceve, DD.canliEtkinlik, DD.dinamikAda, DD.widget*, DD.komutEkran). Marka logosu yok.
 * Veri: kalori DD.gunKalan (Bugün ile aynı hesap) + plan hedefi; su 'bugun-su' / 'yeni-su'; öğün 'bugun-ogun' / 'yeni-ogun' durumları; oruç ritim.js'in kaydı
 * ('ritim-kayit', 'ritim-durum'; Ritim ile aynı zaman formülü ve planImza denetimi), kayıt yoksa DDV.ritim. Uydurma sayı yok.
 * Ritim hali Ritim ekranıyla aynı: misafir sağlık onayı vermediyse 'bos' (Hazır; canlı etkinlik yok), plan 'yok' ya da sağlık engeli 'kapali'.
 * Saat: telefonun kendi saati (kilit ekranı, durum çubuğu) tr sistem biçiminde 17:10; uygulamanın metinleri noktalı (19.30).
 * Görünüm 'telefon-gorunum' {sekme, platform, tema, ritim, boy, komut}; sorgu aynı adlarla ezer (#/telefon?sekme=widget&platform=android&tema=koyu).
 * Ekrana özgü hal yok; ortak ?hal= değerleri router'dan. */
(() => {
  const {sayi, sure} = DD;
  const K = 'telefon-gorunum';
  const SECENEK = {sekme: ['kilit', 'widget', 'komut'], platform: ['ios', 'android'], tema: ['acik', 'koyu'], ritim: ['oruc', 'pencere'], boy: ['kucuk', 'orta'], komut: ['su', 'ogle']};
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');
  const saat = ms => nk(new Date(ms).toTimeString().slice(0, 5));      // uygulama metni: 12.05
  const sistemSaat = ms => new Date(ms).toTimeString().slice(0, 5);    // telefonun saati: 17:10
  const gunBasi = ms => new Date(ms).setHours(0, 0, 0, 0);
  const yerel = s => new Date(s.slice(0, 16)).getTime();
  const SOZ = {su: 'Dada Diet’e bir bardak su ekle', ogle: 'Dada Diet’e öğle yemeğimi kaydet'};

  const varsayilan = () => ({sekme: 'kilit', platform: /android/i.test(navigator.userAgent) ? 'android' : 'ios', tema: 'acik', ritim: null, boy: 'kucuk', komut: 'su'});
  const gorunum = ctx => {
    const g = {...varsayilan(), ...DD.durum.oku(K, {})};
    Object.keys(SECENEK).forEach(k => { const v = ctx?.sorgu?.[k]; if (SECENEK[k].includes(v)) g[k] = v; });
    return g;
  };
  const kaydet = g => DD.durum.yaz(K, g);

  // ---------- Veri ----------
  const onek = () => (DD.yeniHesap() ? 'yeni' : 'bugun');
  const plan = () => DD.durum.oku('plan', null), kisa = () => DD.durum.oku('kisa-hedef', null);
  const kalori = () => {
    if (DD.hedefsiz()) return {hedef: null};
    const hedef = plan()?.hedefKcal ?? kisa()?.kcal ?? DDV.bugun.hedefKcal;
    const kalan = DD.gunKalan?.() ?? hedef - DDV.bugun.tuketilenKcal, alinan = hedef - kalan;
    // Makrolar yalnız gün DDV'deki haliyle duruyorsa (kayıt değişince Bugün'ün iç hesabı gerekir; uydurmamak için gizlenir)
    const degismedi = !DD.yeniHesap() && alinan === DDV.bugun.tuketilenKcal && hedef === DDV.bugun.hedefKcal;
    return {hedef, alinan, kalan, makro: degismedi ? DDV.bugun.makro : null};
  };
  const su = () => {
    const s = DD.durum.oku(`${onek()}-su`, DD.yeniHesap() ? {icilenMl: 0} : DDV.bugun.su);
    return {icilen: s.icilenMl || 0, hedef: plan()?.suMl ?? kisa()?.suMl ?? DDV.bugun.su.hedefMl, bardak: DD.SU_BARDAK};
  };
  // Misafirde öğün yuvaları Bugün'deki gibi boştur (ad ve saat var, besin ve kcal yok); eklediği besinler 'yeni-ek'te.
  const ogunEk = id => (DD.durum.oku(`${onek()}-ek`, {})[id] || []);
  const siradaki = () => {
    const yeni = DD.yeniHesap(), dur = DD.durum.oku(`${onek()}-ogun`, {}), simdi = DD.saatDk(DDV.bugun.simdi);
    const acik = DDV.bugun.ogunler.filter(o => !['dolu', 'atlandi', 'degisti'].includes(dur[o.id]?.durum) && (yeni || o.durum === 'planli'));
    const o = acik.find(x => DD.saatDk(x.saat) >= simdi) || acik[0];
    if (!o) return {};
    const ek = yeni ? ogunEk(o.id) : [];
    return {ad: o.ad, ikon: o.ikon, saat: nk(o.saat), kcal: yeni ? (ek.length ? ek.reduce((t, b) => t + (b.kcal || 0), 0) : null) : o.kcal, besinler: yeni ? ek.map(b => b.ad) : o.besinler.map(b => b.ad)};
  };

  // Ritim: ekran seçilen durumu gösterir. Gerçek durumla aynıysa ve Ritim'in kaydı geçerliyse canlı kayıt (Ritim ile aynı formül),
  // değilse Ritim verisinden bir an. Oruçta bu an orucun başı değil "Uzayan açlık" fazının başıdır: DDV.ritim.fazlar[faz-3].baslangicSaat (12),
  // başlangıç/hedef DDV.ritim.durumlar.oruc (20.05, 16 saat). Böylece geçen 12 sa, %75, kalan 4 sa ve kilit saati 08:05 hepsi veriden çıkar.
  const ORUC_ENGEL = ['gebelik', 'yeme-bozuklugu'];
  const planImza = () => { const p = plan(); return p ? `${p.orucProtokolu ?? 'atlandi'}@${p.ilkOgunSaati}` : null; };
  const ritimHal = () => {
    const engel = !!DD.durum.oku('oruc-saglik')?.engel || (plan()?.hassasiyetler || []).some(h => ORUC_ENGEL.includes(h));
    const k = DD.durum.oku('ritim-kayit', null);
    if (engel || (plan()?.orucProtokolu === 'yok' && !k?.protokol)) return {hal: 'kapali', engel};
    if (DD.yeniHesap() && !DD.durum.oku('oruc-saglik')?.onay) return {hal: 'bos'};
    return {hal: 'acik'};
  };
  const ritim = secim => {
    const R = DDV.ritim, ham = DD.durum.oku('ritim-kayit', null), k = ham && (ham.planImza ?? null) === planImza() ? ham : null;
    const gercek = DD.durum.oku('ritim-durum', null) || R.aktifDurum, d = secim || gercek;
    const p = R.protokoller.find(x => x.id === (k?.protokol ?? R.aktifProtokol)), h = ritimHal();
    let gecenSn, hedefSaat, basMs, anMs, canli = false;
    if (d === gercek && k?.bas != null && p && !p.haftalik) {
      anMs = DD.simdi().getTime() + Date.now() - (k.capa ?? Date.now());
      gecenSn = Math.max(0, (anMs - k.bas) / 1000); hedefSaat = d === 'oruc' ? p.orucSaat : p.pencereSaat; basMs = k.bas; canli = true;
    } else {
      const x = R.durumlar[d], faz = d === 'oruc' && R.fazlar.find(f => f.id === 'faz-3' && f.baslangicSaat < x.hedefSaat);
      basMs = yerel(x.baslangic); hedefSaat = x.hedefSaat;
      gecenSn = faz && !x.gecenDakika ? faz.baslangicSaat * 3600 : x.gecenDakika * 60;
      anMs = basMs + gecenSn * 1000;
    }
    const bitMs = basMs + hedefSaat * 36e5, kalanDk = Math.ceil(hedefSaat * 60 - gecenSn / 60);
    const gun = ms => (gunBasi(ms) > gunBasi(anMs) ? 'Yarın ' : gunBasi(ms) < gunBasi(anMs) ? 'Dün ' : '');
    const kalanMetin = d === 'oruc' ? (kalanDk > 0 ? `Kalan ${sure(kalanDk)}` : 'Hedefine ulaştın') : (kalanDk > 0 ? `Kapanmasına ${sure(kalanDk)}` : 'Pencere süresi doldu');
    return {
      durum: d, gercek, canli, hal: h.hal, engel: h.engel, gecenSn, hedefSaat, oran: Math.min(1, gecenSn / (hedefSaat * 3600)), kalanMetin,
      kisaMetin: kalanDk > 0 ? `${sure(kalanDk)} kaldı` : kalanMetin,
      baslik: R.durumlar[d].rozet, eylem: R.durumlar[d].eylem, etiket: `Ritim · ${p?.ad || ''}`, protokol: p,
      bas: `${gun(basMs)}${saat(basMs)}`, bit: `${gun(bitMs)}${saat(bitMs)}`, anMs
    };
  };
  // Widget'ta oruç: Ritim hazır ya da kapalıysa sayaç değil, başlamamış oruç (Ritim'in 'bos' hali)
  const orucWidget = r => (r.hal === 'acik'
    ? r
    : {durum: 'bos', hedefSaat: r.protokol?.orucSaat ?? DDV.ritim.durumlar.oruc.hedefSaat, baslik: r.hal === 'kapali' ? 'Oruç takibi kapalı' : 'Hazır', kalanMetin: r.hal === 'kapali' ? 'Ritim’den plan seç' : `${r.protokol?.ad || ''} planın hazır`, eylem: r.hal === 'kapali' ? '' : 'Orucu başlat'});
  const tarih = (ms, p) => { const t = new Date(ms), f = o => t.toLocaleDateString('tr-TR', o); return p === 'ios' ? `${f({day: 'numeric', month: 'long'})} ${f({weekday: 'long'})}` : `${f({weekday: 'short'})}, ${f({day: 'numeric', month: 'short'})}`; };

  // ---------- Parçalar ----------
  const widgetlar = (boy, r) => [
    DD.widgetKalori({boy, ...kalori()}),
    DD.widgetSu({boy, ...su()}),
    DD.widgetOruc({boy, ...orucWidget(r)}),
    DD.widgetOgun({boy, ...siradaki()})
  ];
  const adimlar = (baslik, l) => DD.ako({baslik, acik: true, html: DD.cihazAdimlar(l)});
  const cip = (ad, etiket, secili, ogeler, yardim) => DD.alan({etiket, yardim, html: DD.cipler({ad, tur: 'tek', secili, serit: false, ogeler})});

  const kilit = g => {
    const r = ritim(g.ritim), p = g.platform, ios = p === 'ios', bos = r.hal !== 'acik';
    const ortak = {durum: r.durum, baslik: r.baslik, gecenSn: r.gecenSn, oran: r.oran, kalanMetin: r.kalanMetin, bas: r.bas, bit: r.bit};
    const an = bos ? DD.simdi().getTime() : r.anMs;
    const cerceve = DD.telefonCerceve({
      platform: p, tema: g.tema, saat: sistemSaat(an), kilit: {tarih: tarih(an, p)},
      etiket: bos ? `${ios ? 'iPhone' : 'Android'} kilit ekranı: başlamış oruç yok` : `${ios ? 'iPhone' : 'Android'} kilit ekranı: ${r.baslik}, ${r.kalanMetin}`,
      durumCip: ios || bos ? '' : DD.durumCipi({durum: r.durum, gecenSn: r.gecenSn}),
      icerik: bos ? '' : DD.canliEtkinlik({platform: p, ...ortak, etiket: r.etiket, eylem: r.eylem})
    });
    const adim = ios
      ? ['**Ritim**’de orucu başlat.', 'Sayaç kilit ekranına kendiliğinden gelir; Dinamik Ada’sı olan iPhone’larda telefon açıkken adada da görünür.', 'Kapatmak istersen: **Ayarlar > Dada Diet > Canlı Etkinlikler**.']
      : ['Dada Diet’e **bildirim izni** ver.', '**Ritim**’de orucu başlat; sayaç bildirim alanına gelir.', 'Kilit ekranında görünmüyorsa telefonun **Ayarlar > Bildirimler** bölümünden kilit ekranı bildirimlerini aç.'];
    const metin = ios
      ? 'Orucu başlattığında sayaç **kilit ekranına** ve **Dinamik Ada’ya** gelir: geçen süre saniye saniye akar, kalan süre ve ilerleme bir bakışta görünür. Orucu bitirdiğinde kendiliğinden kalkar.'
      : 'Orucu başlattığında sayaç **kalıcı bildirim** olarak bildirim alanında ve kilit ekranında durur: geçen süre akar, kalan süre ve ilerleme görünür. Bildirimden orucu bitirebilir ya da uygulamayı açabilirsin.';
    const sonu = `${DD.p(metin, {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', adim)}
      ${ios ? '' : DD.btn({metin: 'Bildirim izni', ikon: 'bildirim', tur: 'secondary', tam: true, git: '#/bildirim-izni'})}
      ${DD.btn({metin: 'Ritim’e git', ikon: 'ritim', tur: ios ? 'secondary' : 'text', tam: true, git: '#/ritim'})}`;
    // Gerçek boş durum: oruç başlamadıysa telefonda canlı etkinlik yoktur; kilit ekranı yalnız saat. Açıklama çerçevenin üstünde.
    if (bos) {
      const bant = r.hal === 'kapali'
        ? DD.bant({ton: 'bilgi', ikon: 'oruc', baslik: 'Oruç takibi kapalı', metin: r.engel ? 'Paylaştığın sağlık bilgilerine göre **oruç sana önerilmiyor**; kilit ekranında sayaç çıkmaz.' : 'Ritim’de bir plan seçip orucu başlattığında sayaç **kilit ekranına** gelir.', eylem: r.engel ? null : {metin: 'Ritim’e git', git: '#/ritim'}})
        : DD.bant({ton: 'bilgi', ikon: 'oruc', baslik: 'Henüz başlamış bir orucun yok', metin: `${r.protokol?.ad || ''} planın hazır. Ritim’de orucu başlattığında sayaç **kilit ekranına** gelir.`, eylem: {metin: 'Ritim’e git', git: '#/ritim'}});
      return `${bant}${cerceve}${sonu}`;
    }
    const ada = ios
      ? DD.alan({etiket: 'Telefon açıkken: Dinamik Ada', yardim: 'Kısa hali hep görünür; dokunup basılı tutunca genişler.', html: `<div class="dd-yigin-8">${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(r.anMs), ada: DD.dinamikAda({tur: 'kompakt', ...ortak}), etiket: `Dinamik Ada kısa hali: ${r.baslik}`})}${DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(r.anMs), ada: DD.dinamikAda({tur: 'genis', ...ortak}), etiket: `Dinamik Ada geniş hali: ${r.baslik}, ${r.kalanMetin}`})}</div>`})
      : DD.alan({etiket: 'Telefon açıkken: durum çubuğu', yardim: 'Sayaç saatin yanında durur; aşağı çekince bildirimin tamamı açılır.', html: DD.cihazKesit({platform: p, tema: g.tema, saat: sistemSaat(r.anMs), durumCip: DD.durumCipi({durum: r.durum, gecenSn: r.gecenSn}), icerik: DD.canliEtkinlik({platform: p, ...ortak, etiket: r.etiket, eylem: r.eylem}), etiket: `Durum çubuğunda oruç sayacı: ${r.baslik}`})});
    const yardim = r.canli ? 'Ritim’deki sayacın şu anki hali.' : 'Ritim’de başlattığında sayaç gerçek sürenle akar.';
    return `${cerceve}
      ${cip('telefon-ritim', 'Sayaç durumu', r.durum, [{metin: 'Oruçta', deger: 'oruc', ikon: 'hourglass-half'}, {metin: 'Yeme penceresi', deger: 'pencere', ikon: 'utensils'}], yardim)}
      ${ada}${sonu}`;
  };

  const widget = g => {
    const r = ritim(null), p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), orta = g.boy === 'orta';
    const cerceve = DD.telefonCerceve({
      platform: p, tema: g.tema, saat: sistemSaat(an),
      etiket: `${ios ? 'iPhone' : 'Android'} ana ekranı: Dada Diet widget’ları, ${orta ? 'orta' : 'küçük'} boy`,
      icerik: DD.anaEkran({widgetlar: widgetlar(g.boy, r), uygulama: orta ? null : {ad: 'Dada Diet'}, ara: ios && !orta, sik: orta, dock: !orta, tarih: ios ? '' : tarih(an, 'android')})
    });
    const metin = 'Uygulamayı açmadan **kalanını, suyunu ve oruç sayacını** gör. Su widget’ından tek dokunuşla bardak eklenir; sıradaki öğün planından gelir. Değerler Bugün ve Ritim ile aynıdır.';
    const adim = ios
      ? ['Ana ekranda boş bir yere **basılı tut**.', 'Sol üstteki **Düzenle**’ye, sonra **Widget Ekle**’ye dokun.', 'Listeden **Dada Diet**’i seç; Kalori, Su, Oruç ya da Sıradaki öğün widget’ını ve boyunu seç.', '**Widget Ekle**’ye dokun, istediğin yere sürükle.']
      : ['Ana ekranda boş bir yere **basılı tut**.', '**Widget’lar**’a dokun, listede **Dada Diet**’i bul.', 'Widget’a basılı tutup ana ekrana **sürükle**.', 'Boyunu değiştirmek için widget’a basılı tut, **kenarlarından** çek.'];
    return `${cerceve}
      ${cip('telefon-boy', 'Widget boyu', g.boy, [{metin: 'Küçük', deger: 'kucuk', ikon: 'table-cells-large'}, {metin: 'Orta', deger: 'orta', ikon: 'grip-lines'}])}
      ${DD.p(metin, {ton: 'ikincil'})}
      ${adimlar('Nasıl eklenir', adim)}`;
  };

  const komut = g => {
    const p = g.platform, ios = p === 'ios', an = DD.simdi().getTime(), r = ritim(null), soz = SOZ[g.komut];
    let sonuc;
    if (g.komut === 'su') {
      const s = su(), sonra = s.icilen + s.bardak, kalan = s.hedef - sonra;
      sonuc = DD.komutSonuc({ton: 'su', ikon: 'glass-water', baslik: 'Su eklendi', metin: `+${sayi(s.bardak)} ml · 1 su bardağı`, deger: sayi(sonra), birim: `/ ${sayi(s.hedef)} ml`, oran: sonra / s.hedef, alt: kalan > 0 ? `Hedefe **${sayi(kalan)} ml** kaldı` : 'Bugünkü **su hedefine** ulaştın'});
    } else {
      const o = DDV.bugun.ogunler.find(x => x.id === 'ogle'), kal = kalori(), yeni = DD.yeniHesap();
      const besin = yeni ? ogunEk('ogle') : o.besinler, kcal = besin.reduce((t, b) => t + (b.kcal || 0), 0), fazla = besin.length - 3;
      sonuc = besin.length
        ? DD.komutSonuc({ton: 'kalori', ikon: o.ikon, baslik: `${o.ad} kaydedildi`, metin: `${nk(o.saat)} · ${besin.length} besin`, deger: sayi(yeni ? kcal : o.kcal), birim: 'kcal', satirlar: [...besin.slice(0, 3).map(b => b.ad), ...(fazla > 0 ? [`+${fazla} besin daha`] : [])], alt: kal.hedef != null ? `Bugün kalan **${sayi(kal.kalan)} kcal**` : ''})
        // Misafirin planında öğle yemeği yok: komut kaydı açar, ne yediğini sorar (uydurma besin ya da kcal yok)
        : DD.komutSonuc({ton: 'kalori', ikon: o.ikon, baslik: 'Öğle yemeğin henüz boş', metin: 'Planında bu öğün için besin yok', alt: '**Dada Diet’te aç**, ne yediğini ekle'});
    }
    const arka = DD.anaEkran({widgetlar: widgetlar('kucuk', r), uygulama: {ad: 'Dada Diet'}, ara: false, tarih: ios ? '' : tarih(an, 'android')});
    const cerceve = DD.telefonCerceve({
      platform: p, tema: g.tema, saat: sistemSaat(an),
      etiket: `${ios ? 'Siri' : 'Google Asistan'} komutu: ${soz}. Sonuç: ${sonuc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`,
      icerik: DD.komutEkran({platform: p, komut: soz, sonuc, arka})
    });
    const metin = ios
      ? `Siri’ye söyle, Dada Diet açılmadan **kaydı yapsın** ve sonucu göstersin. Komutta uygulamanın adı geçer: “${SOZ.su}”.`
      : `Google Asistan’a söyle, Dada Diet **kaydı yapsın** ve sonucu kartta göstersin. Komutta uygulamanın adı geçer: “${SOZ.su}”.`;
    const adim = ios
      ? ['Dada Diet yüklüyken komutlar **hazırdır**; kurulum gerekmez.', `**Siri**’yi çağır ve komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Tümünü **Kestirmeler** uygulamasında Dada Diet altında bulursun; dilersen birini ana ekrana ekle.']
      : ['**Google Asistan**’ı aç: “Hey Google” de ya da asistan düğmesine basılı tut.', `Komutu söyle: “${SOZ.su}” ya da “${SOZ.ogle}”.`, 'Sonuç kartına dokunursan kayıt **Dada Diet**’te açılır.'];
    return `${cerceve}
      ${DD.btn({metin: 'Komutu yeniden oynat', ikon: 'play', tur: 'secondary', tam: true, veri: {eylem: 'komut-oynat'}})}
      ${cip('telefon-komut', 'Komut', g.komut, [{metin: 'Bir bardak su ekle', deger: 'su', ikon: 'glass-water'}, {metin: 'Öğle yemeğimi kaydet', deger: 'ogle', ikon: 'bowl-rice'}])}
      ${DD.p(metin, {ton: 'ikincil'})}
      ${adimlar(ios ? 'Siri ile nasıl kullanılır' : 'Google Asistan ile nasıl kullanılır', adim)}`;
  };

  const panel = g => `<div class="dd-yigin dd-cihaz-gecis">${{kilit, widget, komut}[g.sekme](g)}</div>`;

  DD.ekran('telefon', {
    tur: 'alt',
    baslik: 'Telefon özellikleri',
    ust: '#/ayarlar',
    yenile: true,
    ciz: ctx => {
      const g = gorunum(ctx);
      return DD.gruplar([
        {html: `<div class="dd-yigin-12">
          ${DD.segment({ad: 'telefon-sekme', etiket: 'Özellik', secili: g.sekme, ogeler: [{ad: 'Kilit ekranı', deger: 'kilit', ikon: 'lock'}, {ad: 'Widget’lar', deger: 'widget', ikon: 'table-cells-large'}, {ad: 'Kısayollar', deger: 'komut', ikon: 'microphone'}]})}
          <div class="dd-ikili">
            ${DD.alan({etiket: 'Telefon', html: DD.segment({ad: 'telefon-platform', etiket: 'Telefon', secili: g.platform, ogeler: [{ad: 'iPhone', deger: 'ios'}, {ad: 'Android', deger: 'android'}]})})}
            ${DD.alan({etiket: 'Görünüm', html: DD.segment({ad: 'telefon-tema', etiket: 'Görünüm', secili: g.tema, ogeler: [{ad: 'Açık', deger: 'acik', ikon: 'sun'}, {ad: 'Koyu', deger: 'koyu', ikon: 'moon'}]})})}
          </div>
        </div>`},
        {html: `<div data-yuva="telefon">${panel(g)}</div>`}
      ]);
    },
    sonra: (kok, ctx) => {
      let g = gorunum(ctx), dur = () => {};
      const yuva = () => kok.querySelector('[data-yuva="telefon"]');
      const oynat = () => { dur(); dur = DD.komutOynat(kok.querySelector('.dd-komut')); };
      const ciz = () => { dur(); kaydet(g); const y = yuva(); if (y) y.innerHTML = panel(g); if (g.sekme === 'komut') oynat(); };
      const bag = (ad, alan) => DD.on(kok, ad, v => { if (!SECENEK[alan].includes(v) || g[alan] === v) return; g = {...g, [alan]: v}; ctx.sorgu = {}; ciz(); });
      const c = [
        bag('telefon-sekme', 'sekme'), bag('telefon-platform', 'platform'), bag('telefon-tema', 'tema'),
        bag('telefon-ritim', 'ritim'), bag('telefon-boy', 'boy'), bag('telefon-komut', 'komut'),
        DD.eylem(kok, 'komut-oynat', oynat)
      ];
      // Komut sekmesi açılınca bir kez dinliyor → sonuç akışı
      if (g.sekme === 'komut') oynat();
      return () => { dur(); c.forEach(f => f()); };
    }
  });
})();
