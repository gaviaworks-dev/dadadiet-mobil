/* İzin açıklamaları (#/izin/:tur, tam): kamera, bildirim, konum, saglik, hareket. Ortak açıklama sayfası; kalıp DD.izinIstemi (bildirim-izni, ai-kamera, disarida ile aynı).
 * Tek ekranda tek mesaj: illüstrasyon + neden (3 madde) + "İzin ver" / "Şimdi değil".
 *   kamera, bildirim, konum, hareket: "İzin ver" telefonun sistem uyarısını açar (kanon DD.sistemUyari, platforma göre). İzin ver → 'verildi', toast, dönüş; İzin verme → 'reddedildi', reddedildi hali.
 *   saglik: önce açık rıza (E5 window.DDCihazIzin.rizaAl({kaynak:'izin'}); false → bağlanmaz), sonra telefonun izin sayfası (E1 DD.sistemIzinPenceresi, tür listesi DDV.cihazlar).
 *     İzin verilirse 'cihaz-baglanti' {<servis id>: {bagli, izin:{oku, yaz}, sonEsitleme}} (E1 ile aynı alanlar), 'veri-izinleri'.esitle true, 'saglik-izin' verildi.
 * Reddedildi hali (?hal=red ya da durum 'reddedildi'): Diet'in kamera izin sahnesi kalıbı (DD.durumSahne koyu + numaralı Ayarlar adımları, iPhone / Android ayrı) + Ayarları aç / Şimdi değil.
 *   Ayarları aç burada izni verilmiş sayar; sağlıkta yine rıza + izin sayfası akışından geçer.
 * Misafir: sağlık türünde DD.girisGerekli (bağlantı hesaba bağlı). Sağlık rozeti servis tonunda (DD.cihazIzinAdim). Hareket türünde fotoğraf yok: açık sahne, red hali de açık.
 * ?donus=#/x: Şimdi değil ve izin sonrası dönülecek ekran (yığında önceki ekran varsa geri gidilir). Platform: ?platform=ios|android → DD.uygulamaKilidi.cihaz() (E4) → tarayıcı.
 * Durum anahtarları mevcut ekranlarla ortak: kamera-izin (ai-kamera), bildirim-izin (DD.ogun.izin), konum-izin (disarida), saglik-izin, hareket-izin. */
(() => {
  const C = () => DDV.cihazlar;
  const platform = ctx => {
    const q = ctx.sorgu.platform, k = q || DD.uygulamaKilidi?.cihaz?.().platform;
    return k ? (k === 'android' ? 'android' : 'ios') : /Android/i.test(navigator.userAgent) ? 'android' : 'ios';
  };
  const servis = ctx => C().servisler.find(s => s.id === C().platformlar[platform(ctx)].servis);
  const durumIzin = anahtar => ({oku: () => DD.durum.oku(anahtar, ''), yaz: v => DD.durum.yaz(anahtar, v)});
  const kucuk = s => s.charAt(0).toLocaleLowerCase('tr') + s.slice(1);
  const adlar = yon => [...new Set(C().turler.filter(t => t.yon === yon).map(t => t.ad))].map((a, i) => (i ? kucuk(a) : a)).join(', ');
  const AYAR = ['Ayarlar’ı aç', 'Telefonunun Ayarlar uygulaması.'];
  const UYG = ['Uygulamalar › Dada Diet', 'Uygulama listesinden Dada Diet’i seç.'];

  // Her tür: illüstrasyon, rozet ikonu, açıklama, maddeler, sistem uyarısı, reddedildi (başlık, tek cümle alternatif, iPhone / Android adımları), dönüş toast'u.
  const TUR = {
    kamera: {
      izin: durumIzin('kamera-izin'),
      gorsel: 'assets/gorsel/hero/kamera-tabak.webp', ikon: 'kamera',
      baslik: () => 'Tabağını kamerayla tanıyalım',
      metin: () => '**Ne Yedim?** ve **Akıllı Tabak**, fotoğraftan yemeğini tanımak için kamera iznine ihtiyaç duyar.',
      maddeler: () => [['tabak', 'Tabağını tanır', 'Bileşenleri ayırır, sen düzeltirsin.'], ['barkod', 'Menüyü ve barkodu okur', 'İçeriği satır satır açıklar.'], ['gizlilik', 'Fotoğrafın sende kalır', 'İzinsiz paylaşılmaz.']],
      dugme: 'Kameraya izin ver',
      pencere: () => ({baslik: '“Dada Diet” kamerana erişmek istiyor', metin: 'Tabak, menü, tahlil ve barkod **fotoğrafı çekmek** için kullanılır.'}),
      red: {baslik: 'Kamera izni kapalı', metin: 'Fotoğraf çekmek için **kamera izni** gerekir. Bu sırada fotoğrafı **galeriden** seçebilirsin.', ipucu: 'Kamera iznini açmak için',
        ios: [AYAR, ['Dada Diet’i bul', 'Listede aşağı kaydır, Dada Diet’e dokun.'], ['Kamera’yı aç', 'Anahtarı aç, uygulamaya dön.']],
        android: [AYAR, UYG, ['İzinler › Kamera', '“Yalnızca uygulama kullanılırken izin ver” seç.']]},
      tamam: '**Kamera izni** açıldı', toastIkon: 'kamera'
    },
    bildirim: {
      izin: {oku: () => DD.ogun.izin(), yaz: v => DD.ogun.izinYaz(v)},
      gorsel: 'assets/gorsel/hero/ritim-sofra.webp', ikon: 'bildirim',
      baslik: () => 'Zamanında haber verelim',
      metin: () => 'Öğün, su ve oruç hatırlatmaları için **bildirim iznine** ihtiyaç var.',
      maddeler: () => [['utensils', 'Öğün saatlerin', 'Sıradaki öğününden önce kısa bir not.'], ['glass-water', 'Su', 'Gün içinde bardak hatırlatması.'], ['hourglass-half', 'Oruç', 'Pencere açılırken ve kapanırken haber.']],
      dugme: 'Bildirimlere izin ver',
      pencere: () => ({baslik: '“Dada Diet” sana bildirim göndermek istiyor', metin: 'Bildirimler **uyarı, ses ve simge** içerebilir. Bunu Ayarlar’dan değiştirebilirsin.'}),
      red: {baslik: 'Bildirim izni kapalı', metin: 'Hatırlatmalar için **bildirim izni** gerekir. Öğün saatlerin **Profil**’de yine sıralanır.', ipucu: 'Bildirimleri açmak için',
        ios: [AYAR, ['Bildirimler › Dada Diet', 'Bildirimler listesinde Dada Diet’i bul.'], ['Bildirimlere İzin Ver’i aç', 'Anahtarı aç, uygulamaya dön.']],
        android: [AYAR, UYG, ['Bildirimler’i aç', 'Dada Diet bildirimleri anahtarını aç.']]},
      tamam: '**Bildirimler** açıldı', toastIkon: 'bildirim'
    },
    konum: {
      izin: durumIzin('konum-izin'),
      gorsel: 'assets/gorsel/hero/lokanta-istanbul.webp', ikon: 'location-crosshairs',
      baslik: () => 'Yakınındaki mekanları gösterelim',
      metin: () => '**Dışarıda Ne Yesem**, mekanları sana yakınlığa göre sıralamak için konum iznine ihtiyaç duyar.',
      maddeler: () => [['location-crosshairs', 'Yakınındakiler önce', 'Mekanlar sana yakınlığa göre sıralanır.'], ['map-location-dot', 'İzinsiz de seçebilirsin', 'Şehir, ilçe ve semt seçimiyle listeyi daraltırsın.'], ['toggle-off', 'İstediğin an kapatırsın', 'İzni Ayarlar’dan geri alırsın.']],
      dugme: 'Konuma izin ver',
      pencere: () => ({baslik: '“Dada Diet” konumunu kullanmak istiyor', metin: 'Mekanları **sana yakınlığa göre** sıralamak için kullanılır.'}),
      red: {baslik: 'Konum izni kapalı', metin: 'Yakınlığa göre sıralamak için **konum izni** gerekir. Mekanları **şehir ve semt** seçerek de süzebilirsin.', ipucu: 'Konum iznini açmak için',
        ios: [AYAR, ['Dada Diet’i bul', 'Listede aşağı kaydır, Dada Diet’e dokun.'], ['Konum › Uygulamayı Kullanırken', 'Seç, uygulamaya dön.']],
        android: [AYAR, UYG, ['İzinler › Konum', '“Yalnızca uygulama kullanılırken izin ver” seç.']]},
      tamam: '**Konum izni** açıldı', toastIkon: 'location-dot'
    },
    saglik: {
      izin: durumIzin('saglik-izin'),
      gorsel: 'assets/gorsel/hero/denge-yesil.webp', ikon: ctx => servis(ctx).ikon,
      baslik: ctx => `${servis(ctx).ad} ile eşitleyelim`,
      metin: ctx => `Adımın, kilon ve uykun **${servis(ctx).ad}** üzerinden gelsin; tükettiğin enerjiyi oraya yazalım.`,
      maddeler: () => [['download', 'Okunur', `${adlar('oku')}.`], ['upload', 'Yazılır', `${adlar('yaz')}.`], ['ban', 'Reklam için kullanılmaz', 'Sağlık verin reklam için kullanılmaz; izni istediğin an Ayarlar’dan geri alırsın.']],
      dugme: 'İzin ver',
      red: {baslik: 'Sağlık verisi izni kapalı', metin: 'Verinin gelmesi için **sağlık verisi izni** gerekir. Kilonu ve suyunu **elle** kaydetmeye devam edebilirsin.', ipucu: 'Sağlık iznini açmak için',
        ios: [AYAR, ['Gizlilik ve Güvenlik › Sağlık', 'Sağlık verine erişen uygulamalar listelenir.'], ['Dada Diet › Tümünü Aç', 'Ya da türleri tek tek aç, uygulamaya dön.']],
        android: [['Health Connect’i aç', 'Ayarlar’dan ya da uygulama listesinden.'], ['Uygulama izinleri › Dada Diet', 'İzin verilen uygulamalar arasında bul.'], ['Tümüne izin ver', 'Ya da türleri tek tek aç, uygulamaya dön.']]},
      tamam: ctx => `**${servis(ctx).ad}** bağlandı`, toastIkon: ctx => servis(ctx).ikon
    },
    hareket: {
      izin: durumIzin('hareket-izin'),
      sahne: true, ikon: 'shoe-prints',
      baslik: () => 'Adımlarını sayalım',
      metin: () => 'Günlük adımını ve aktif dakikanı saymak için **hareket iznine** ihtiyaç var.',
      maddeler: () => [['shoe-prints', 'Adım ve aktif dakika', 'Telefonun hareket sensörü gün boyu sayar.'], ['heart-pulse', 'Sağlık uygulaması olmadan da', 'Apple Health ya da Health Connect bağlamasan da adımın gelir.'], ['toggle-off', 'İstediğin an kapatırsın', 'İzni Ayarlar’dan geri alırsın.']],
      dugme: 'Harekete izin ver',
      pencere: ctx => ({baslik: platform(ctx) === 'android' ? '“Dada Diet” fiziksel aktivitene erişmek istiyor' : '“Dada Diet” Hareket ve Fitness etkinliğine erişmek istiyor', metin: 'Günlük **adım ve aktif dakika** sayımı için kullanılır.'}),
      red: {baslik: 'Hareket izni kapalı', metin: 'Adım saymak için **hareket izni** gerekir. Adımın bağlı bir **sağlık uygulamasından** da gelebilir.', ipucu: 'Hareket iznini açmak için',
        ios: [AYAR, ['Gizlilik ve Güvenlik › Hareket ve Fitness', 'Hareket ve Fitness bölümünü aç.'], ['Dada Diet’i aç', 'Anahtarı aç, uygulamaya dön.']],
        android: [AYAR, UYG, ['İzinler › Fiziksel aktivite', '“İzin ver” seç, uygulamaya dön.']]},
      tamam: '**Hareket izni** açıldı', toastIkon: 'shoe-prints'
    }
  };
  const t = ctx => TUR[ctx.param.tur];
  const deger = (x, ctx) => (typeof x === 'function' ? x(ctx) : x);
  const redMi = ctx => ctx.sorgu.hal === 'red' || t(ctx).izin.oku() === 'reddedildi';
  const donus = ctx => (/^#\//.test(ctx.sorgu.donus || '') ? ctx.sorgu.donus : null);

  // Sağlık türü E1'in DD.cihazIzinAdim gövdesiyle çizilir: rozet servis tonunda (Apple Health protein, Health Connect bilgi), bar DD.izinIstemi ile aynı.
  const istem = ctx => {
    const x = t(ctx), o = {gorsel: x.gorsel, ikon: deger(x.ikon, ctx), baslik: x.baslik(ctx), metin: x.metin(ctx), maddeler: x.maddeler(ctx)}, z = DD.izinIstemi({...o, izin: x.dugme});
    return ctx.param.tur === 'saglik' ? {html: DD.cihazIzinAdim({...o, ton: servis(ctx).ton}), bar: z.bar} : z;
  };
  // Görsel kitaplığında hareket fotoğrafı yok: hareket türü fotoğrafsız açık durum sahnesi (rozet + maddeler + düğmeler) ile çizilir.
  const sahne = ctx => {
    const x = t(ctx);
    return DD.durumSahne({isaret: deger(x.ikon, ctx), baslik: x.baslik(ctx), metin: x.metin(ctx),
      ana: {metin: x.dugme, attrs: 'data-izin-ver'}, ikinciller: [{metin: 'Şimdi değil', geri: true}],
      ipucuBaslik: 'Ne için kullanılır', ipucuParcali: true, ipuclari: x.maddeler(ctx)});
  };
  // Reddedildi: DD.kameraIzinSahne ile aynı düzen (koyu sahne, numaralı adımlar parçalı listede); Şimdi değil ikincil.
  // Fotoğrafı olmayan türde (hareket) koyu vizör boş çerçeve çizerdi: açık sahne, yalnız rozet.
  const redSahne = ctx => {
    const x = t(ctx), r = x.red;
    return DD.durumSahne({
      tema: x.gorsel ? 'koyu' : 'acik', gorsel: x.gorsel, isaret: deger(x.ikon, ctx), baslik: r.baslik, metin: r.metin,
      ana: {metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'}, ikinciller: [{metin: 'Şimdi değil', geri: true}],
      ipucuBaslik: r.ipucu, ipucuParcali: true, ipuclari: r[platform(ctx)].map(([b, a], i) => [String(i + 1), b, a])
    });
  };
  // Misafir sağlık bağlantısını sonradan yönetemez (#/cihazlar, #/veri-izinleri giriş ister): sağlık türünde giriş duvarı; öteki türler açık.
  const misafirSaglik = ctx => ctx.param.tur === 'saglik' && !DD.uye();
  const yok = () => DD.hataEkran({tur: 'bulunamadi', eylem: {metin: 'Bugün’e dön', yerine: '#/bugun'}});

  // ---------- Sağlık: rıza → telefonun izin sayfası (E1 ile aynı zincir) ----------
  const rizaIste = () => {
    if (typeof window.DDCihazIzin?.rizaAl === 'function') return Promise.resolve(DDCihazIzin.rizaAl({kaynak: 'izin'}));
    DD.git('#/veri-izinleri?riza=cihaz');
    return Promise.resolve(false);
  };
  const saglikBagla = (ctx, ver) => rizaIste().then(ok => {
    if (!ok) { DD.toast('Açık rıza olmadan **bağlantı kurulmaz**', {ikon: 'bilgi'}); return; }
    const p = platform(ctx), s = servis(ctx), b = DD.durum.oku('cihaz-baglanti', {}), once = b[s.id]?.izin;
    const m = y => C().turler.filter(x => x.yon === y).map(x => ({id: x.id, ad: x.ad, ikon: x.ikon, acik: once?.[y]?.[x.id] ?? x.acik}));
    return DD.sistemIzinPenceresi({platform: p, servis: {ad: s.ad, ikon: s.ikon}, uygulama: {ad: 'Dada Diet'}, oku: m('oku'), yaz: m('yaz'), yol: C().platformlar[p].yol,
      aciklama: 'Dada Diet adımını, kilonu ve uykunu Sağlık dosyanda gösterir; öğünlerini ve suyunu kaydeder. Sağlık verin reklam için kullanılmaz.',
      bekle: DD.TK.motion.reveal * 3
    }).then(r => {
      if (!r.izin) { t(ctx).izin.yaz('reddedildi'); if (/^#\/izin\//.test(location.hash)) DD.tazele(); return; }
      const g = DD.durum.oku('cihaz-baglanti', {});
      DD.durum.yaz('cihaz-baglanti', {...g, [s.id]: {...(g[s.id] || {}), bagli: true, izin: {oku: r.oku, yaz: r.yaz}, sonEsitleme: `Bugün ${DD.ogun.noktali(DDV.bugun.simdi)}`}});
      DD.durum.yaz('veri-izinleri', {...DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'}), esitle: true});
      ver();
    });
  });

  DD.ekran('izinler', {
    tur: 'tam',
    tabagim: false,
    haller: false,
    ciz: ctx => (!t(ctx) ? yok() : misafirSaglik(ctx) ? DD.girisGerekli({ikon: 'heart-pulse', metin: 'Sağlık uygulaması bağlantın **hesabına bağlı**; bağlantını ve verini Ayarlar’dan yönetirsin.'}) : redMi(ctx) ? redSahne(ctx) : t(ctx).sahne ? sahne(ctx) : istem(ctx).html),
    altBar: ctx => (t(ctx) && !misafirSaglik(ctx) && !redMi(ctx) && !t(ctx).sahne ? istem(ctx).bar : ''),
    sonra: (kok, ctx) => {
      const x = t(ctx);
      if (!x || misafirSaglik(ctx)) return undefined;
      const don = () => DD.geri(donus(ctx) || '#/bugun');
      const ver = () => {
        x.izin.yaz('verildi');
        don();
        DD.toast(deger(x.tamam, ctx), {tur: 'basari', ikon: deger(x.toastIkon, ctx)});
      };
      // Telefonun sistem uyarısı (kanon DD.sistemUyari, platforma göre); metin düz yazı (vurgu işaretleri atılır).
      const uyari = () => {
        const p = x.pencere(ctx), and = platform(ctx) === 'android';
        return DD.sistemUyari({platform: platform(ctx), baslik: p.baslik, metin: p.metin.replace(/\*\*/g, ''), red: and ? 'İzin verme' : 'İzin Verme', ver: and ? 'İzin ver' : 'İzin Ver'}).then(evet => {
          if (evet) { ver(); return; }
          x.izin.yaz('reddedildi');
          DD.tazele();
        });
      };
      // Çift dokunuş: istem (rıza, izin sayfası ya da sistem uyarısı) sürerken ikinci dokunuş yok sayılır.
      let surer = false;
      const tik = ev => {
        if (ev.target.closest('[data-geri]')) { ev.stopPropagation(); ev.preventDefault(); if (!surer) don(); return; }
        const ayar = ev.target.closest('[data-izin-ayar]');
        if (!ayar && !ev.target.closest('[data-izin-ver]')) return;
        if (surer) return;
        if (ctx.param.tur !== 'saglik' && (ayar || x.izin.oku() === 'verildi')) { ver(); return; }
        surer = true;
        Promise.resolve(ctx.param.tur === 'saglik' ? saglikBagla(ctx, ver) : uyari()).finally(() => { surer = false; });
      };
      kok.addEventListener('click', tik);
      return () => kok.removeEventListener('click', tik);
    }
  });
})();
