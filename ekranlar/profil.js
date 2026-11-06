/* Profil (#/profil): DD.profilBas + bölümler. Referans: tasks/referanslar.md Profil satırları (zayıf kanıt; Gastro profil başı çıta).
 * Kullanıcı DDV.kullanici, onboarding planı varsa onun üstüne ('plan'). Hedef satırları tek adımı açar: #/onboarding/<id>?duzenle=1.
 * Durum: bildirim-ayar {tur:boolean}, veri-izinleri {riza}. Diyetisyenle paylaşım izinleri Sağlık dosyam'dadır (saglik-paylasim). #/profil?hal=hata bağlantı hatası. */
(() => {
  const BILDIRIM = [['oruc', 'hourglass-half', 'Oruç ve pencere'], ['su', 'droplet', 'Su hatırlatıcısı'], ['randevu', 'calendar-check', 'Randevular'], ['mesaj', 'comment-dots', 'Diyetisyen mesajları'], ['program', 'clipboard-list', 'Program günü']];
  const K = () => ({...DDV.kullanici, ...(DD.durum.oku('plan', null) || {})});
  const aktifProgram = () => DD.durum.oku('aktifProgram', DDV.kullanici.aktifProgram);
  const ayarlar = () => ({...Object.fromEntries(BILDIRIM.map(([t]) => [t, true])), ...DD.durum.oku('bildirim-ayar', {})});
  const izinler = () => DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'});
  const duzenle = id => `#/onboarding/${id}?duzenle=1`;
  const kg = n => `${DD.ondalik(n, 1)} kg`;
  let hataGosterildi = false;

  const yolculuk = k => (k.hedefKiloKg ? DD.kart({git: '#/saglik', html: DD.yolculuk({bas: Math.max(k.baslangicKiloKg, k.kiloKg), simdi: k.kiloKg, hedef: k.hedefKiloKg, etiket: 'Hedef yolculuğun'})}) : '');
  const hedefler = k => {
    const m = k.makro ?? k.makroHedef, suMl = k.suMl ?? k.suHedefMl;
    const satirlar = [
      {ikon: 'hedef', baslik: 'Hedefim', alt: k.hedefAd, git: duzenle('hedef')},
      {ikon: 'weight-scale', baslik: 'Kilo', alt: k.hedefKiloKg ? `${kg(k.kiloKg)} · hedef ${kg(k.hedefKiloKg)}` : kg(k.kiloKg), git: duzenle('kilo')},
      k.tempoAd && {ikon: 'gauge-high', baslik: 'Tempo', alt: k.tempoAd, git: duzenle('tempo')},
      {ikon: 'person-walking', baslik: 'Aktivite', alt: k.aktiviteAd, git: duzenle('aktivite')},
      {ikon: 'utensils', baslik: 'Beslenme tarzı', alt: k.beslenmeTarziAd.join(', ') || 'Seçim yok', git: duzenle('tarz')},
      {ikon: 'clock', baslik: 'Öğün ritmi', alt: k.orucProtokolu ? `${k.orucProtokolu} · ilk öğün ${k.ilkOgunSaati}` : `Oruç yok · ilk öğün ${k.ilkOgunSaati}`, git: duzenle('ritim')}
    ].filter(Boolean);
    return `<div class="dd-yigin">${DD.ozetSerit([{ikon: 'kalori', etiket: 'Kalori', deger: DD.sayi(k.hedefKcal), birim: 'kcal'}, {ikon: 'egg', etiket: 'Protein', deger: DD.sayi(m.P), birim: 'g'}, {ikon: 'droplet', etiket: 'Su', deger: DD.ondalik(suMl / 1000, 1), birim: 'L'}])}${DD.yuzey(DD.satirlar(satirlar))}</div>`;
  };
  const bildirimler = () => { const a = ayarlar(); return DD.yuzey(`<div class="dd-satirlar">${BILDIRIM.map(([t, ikon, etiket]) => DD.toggle({ad: `bildirim-${t}`, ikon, etiket, secili: a[t]})).join('')}</div>`); };
  const saglik = k => {
    const uzman = DDV.diyetisyenler.find(d => d.slug === k.diyetisyen), a = aktifProgram();
    return DD.yuzey(DD.satirlar([
      {ikon: 'file-medical', baslik: 'Sağlık dosyam', alt: 'Ölçümler, tahliller, notlar', git: '#/saglik'},
      uzman ? {ikon: 'user-doctor', baslik: 'Diyetisyenim', alt: uzman.ad, git: '#/uzman'} : {ikon: 'user-doctor', baslik: 'Diyetisyen bul', alt: 'Henüz diyetisyenin yok', git: '#/uzman/bul'},
      a ? {ikon: 'clipboard-list', baslik: 'Programım', alt: a.ad, git: `#/program/${a.slug}`} : {ikon: 'clipboard-list', baslik: 'Program Bul', alt: 'Henüz aktif programın yok', git: '#/program-bul'},
      {ikon: 'shield-halved', baslik: 'Veri izinlerim', alt: izinler().riza ? 'Açık rıza verildi' : 'Açık rıza verilmedi', veri: {eylem: 'izinler'}}
    ]));
  };
  const hesap = k => DD.yuzey(DD.satirlar([
    {ikon: 'envelope', baslik: 'E-posta', alt: k.eposta, ok: false},
    {ikon: 'right-from-bracket', baslik: 'Çıkış yap', veri: {eylem: 'cikis'}, ok: false, yikici: true}
  ]));

  const izinSheet = () => {
    const i = izinler(), R = DDV.onboarding.adimlar.find(a => a.id === 'kvkk').acikRiza;
    DD.sheet({
      baslik: 'Veri izinlerim',
      html: `<div class="dd-yigin">${DD.p(R.metin.replace('açık rıza veriyorum', '**açık rıza veriyorum**'))}${DD.toggle({ad: 'riza', ikon: 'shield-halved', etiket: 'Açık rıza', secili: i.riza})}${DD.p('Diyetisyeninle **neyi paylaşacağını** Sağlık dosyam ekranından seçebilirsin.', {meta: true, ton: 'ikincil'})}</div>`,
      altBar: DD.btn({metin: 'Sağlık dosyamı aç', ikon: 'file-medical', tur: 'secondary', tam: true, git: '#/saglik', attrs: 'data-sheet-kapat'}),
      sonra: d => DD.on(d, 'riza', v => { DD.durum.yaz('veri-izinleri', {riza: v}); DD.tazele(); DD.toast(v ? '**Açık rızan** kaydedildi' : '**Açık rızanı** geri aldın', {ikon: 'shield-halved'}); })
    });
  };

  DD.ekran('profil', {
    tur: 'banner',
    baslik: 'Profilim',
    iskelet: 'profil',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: () => {
      const k = K();
      return DD.profilBas({
        ad: `${k.ad} ${k.soyad}`, alt: k.hedefAd, kapak: 'assets/gorsel/hero/ritim-sofra.webp', ust: true, eylem: DD.durumRozet({metin: k.uyelik, ton: 'basari', ikon: 'onay'}),
        sayaclar: [{deger: DD.ondalik(k.kiloKg, 1), etiket: 'Kilo'}, {deger: k.hedefKiloKg ? DD.ondalik(k.hedefKiloKg, 1) : '–', etiket: 'Hedef'}, {deger: DD.ondalik(k.bmi, 1), etiket: 'BKİ'}]
      }) + DD.bolumler([
        yolculuk(k) && `<div class="dd-yigin">${yolculuk(k)}</div>`,
        {baslik: 'Hedeflerim', html: hedefler(k)},
        {baslik: 'Bildirimler', html: bildirimler()},
        {baslik: 'Sağlığım', html: saglik(k)},
        {baslik: 'Hesabım', html: hesap(k)}
      ]);
    },
    sonra: kok => {
      const offs = BILDIRIM.map(([t, , etiket]) => DD.on(kok, `bildirim-${t}`, v => {
        DD.durum.yaz('bildirim-ayar', {...ayarlar(), [t]: v});
        DD.toast(`**${etiket}** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: v ? 'bell' : 'bell-slash'});
      }));
      offs.push(DD.eylem(kok, 'izinler', izinSheet));
      offs.push(DD.eylem(kok, 'cikis', () => DD.dialog({baslik: 'Çıkış yap', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => {
        if (!ok) return;
        DD.tabagim.temizle();
        DD.durum.sifirla();
        DD.yerine('#/karsilama');
      })));
      return () => offs.forEach(f => f());
    }
  });
})();
