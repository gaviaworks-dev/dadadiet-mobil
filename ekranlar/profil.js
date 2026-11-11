/* Profil (#/profil): web Hesabım › Genel Bakış eşi, Gastro profil kalıbında (ortak/sayfalar/profil.js): DD.profilBas + "Profili düzenle" + DD.gruplar
 * (tek zemin, başlıklı kartsız satır grupları). İçerik sırası: sıradaki adım (yeni hesapta İlk adımların), Bugünün öğünleri (Öğün Hatırlatıcı, DD.ogun),
 * hızlı kayıt, sıradaki görüşme, diyetisyenden son mesaj, kilo gidişatı; ardından Beslenmem, Gelişimim, Hesabım, Destek ve ayrı Oturum grubu.
 * Yeni hesapta (DD.yeniHesap) DDV'nin sağlık verisi okunmaz: hedef plan'dan, ölçüm 'yeni-saglik-olcumler'den, günlük 'yeni-*' anahtarlarından gelir.
 * Durum: ogun-hatirlatma / ogun-zaman / bildirim-izin (DD.ogun üzerinden), <onek>-su (Bugün ile ortak, hızlı su kaydı).
 * Hedef satırları #/tercihler, bildirim anahtarları #/ayarlar/bildirim, veri izinleri #/veri-izinleri ekranındadır.
 * Eski bağlantılar: ?ac=izinler → #/veri-izinleri, ?ac=ayarlar → #/ayarlar/bildirim. #/profil?hal=hata bağlantı hatası. */
(() => {
  const B = () => DDV.benimDiyetisyenim;
  const O = () => DD.ogun;
  const yeni = () => DD.yeniHesap();
  const onek = () => (yeni() ? 'yeni' : 'bugun');
  const nok = s => O().noktali(s);
  const kg = n => `${DD.ondalik(n, n % 1 ? 1 : 0)}`;
  const buyukBas = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  let hataGosterildi = false;

  // ---------- Kullanıcı: kimlik DDV'den, sağlık verisi yeni hesapta yalnız kendi kaydından ----------
  const plan = () => DD.durum.oku('plan', null);
  const olcumAnahtar = () => `${yeni() ? 'yeni-' : ''}saglik-olcumler`;
  const kiloSeri = () => {
    const m = new Map((yeni() ? [] : DDV.saglik.seriler.kilo.haftalik).map(x => [x.tarih, {tarih: x.tarih, etiket: x.etiket, deger: x.deger}]));
    DD.durum.oku(olcumAnahtar(), []).filter(o => o.kiloKg != null).forEach(o => m.set(o.tarih, {tarih: o.tarih, etiket: DD.tarihKisa(o.tarih), deger: o.kiloKg}));
    return [...m.values()].sort((a, b) => a.tarih.localeCompare(b.tarih));
  };
  const K = () => {
    const kim = {ad: DDV.kullanici.ad, soyad: DDV.kullanici.soyad, eposta: DDV.kullanici.eposta};
    const k = {...(yeni() ? {} : DDV.kullanici), ...kim, ...(plan() || {})}, son = kiloSeri().pop()?.deger;
    if (son != null) k.kiloKg = son;
    if (k.baslangicKiloKg == null) k.baslangicKiloKg = kiloSeri()[0]?.deger ?? k.kiloKg;
    return k;
  };
  const aktifProgram = () => DD.durum.oku('aktifProgram', yeni() ? null : DDV.kullanici.aktifProgram);
  const diyetisyen = () => (yeni() ? null : DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen));
  const kcalHedef = () => plan()?.hedefKcal ?? DD.durum.oku('kisa-hedef', null)?.kcal ?? (yeni() ? null : DDV.bugun.hedefKcal);

  // Bugün'ün günlüğü (bugun.js ile aynı kural): öğün durumu + eklenen kalemler
  const alinan = () => {
    const d = DD.durum.oku(`${onek()}-ogun`, {}), ek = DD.durum.oku(`${onek()}-ek`, {});
    return DDV.bugun.ogunler.reduce((t, o) => {
      const x = d[o.id], e = toplam(ek[o.id] || [], 'kcal'), taban = yeni() ? [] : o.besinler;
      if (x?.durum === 'atlandi') return t;
      if (x?.durum === 'degisti') return t + toplam(taban.filter(b => x.besinler.includes(b.slug)), 'kcal') + e;
      if (x?.durum === 'dolu' || (!yeni() && o.durum === 'dolu')) return t + toplam(taban, 'kcal') + e;
      return t + e;
    }, 0);
  };
  const suOku = () => DD.durum.oku(`${onek()}-su`, yeni() ? {icilenMl: 0, kayitlar: []} : {icilenMl: DDV.bugun.su.icilenMl, kayitlar: DDV.bugun.su.kayitlar});
  const suHedef = () => plan()?.suMl ?? DD.durum.oku('kisa-hedef', null)?.suMl ?? DDV.bugun.su.hedefMl;

  // Diyetisyen mesajları: uzman.js ile aynı okunmamış kuralı
  const mesajlar = () => [...B().sohbet.mesajlar, ...DD.durum.oku('uzman-sohbet', [])];
  const okunmamis = () => { const son = DD.durum.oku('uzman-okundu', B().sohbet.mesajlar[B().sohbet.mesajlar.length - 2].id); return mesajlar().filter(m => m.kim !== 'ben' && m.id > son).length; };

  // ---------- Profil başı ----------
  const bas = k => {
    const h = kcalHedef(), kalan = h ? h - alinan() : null, a = aktifProgram(), d = diyetisyen();
    return DD.profilBas({
      ad: `${k.ad} ${k.soyad}`, alt: k.hedefAd || 'Hedefini henüz seçmedin', kapak: 'assets/gorsel/hero/ritim-sofra.webp', ust: true,
      // Üyelik kademesi (Pro satışa açılmadı, karar 1): üye de Ücretsiz kademede; rozet nötr.
      eylem: DD.durumRozet({metin: yeni() ? 'Ücretsiz' : k.uyelik, ton: 'notr', ikon: 'profil'}),
      sayaclar: yeni() && !plan() ? [] : [
        {deger: k.hedefKiloKg ? kg(k.hedefKiloKg) : '–', birim: k.hedefKiloKg ? 'kg' : '', etiket: 'Hedef'},
        {deger: kalan == null ? '–' : DD.sayi(Math.abs(kalan)), birim: kalan == null ? '' : 'kcal', etiket: kalan != null && kalan < 0 ? 'Hedef üstü' : 'Kalan'},
        {deger: a ? `${a.gun}/${a.toplamGun}` : '–', etiket: 'Program'},
        {deger: d ? d.kisaAd.split(' ')[0] : '–', etiket: 'Diyetisyen'}
      ]
    });
  };

  // ---------- Sıradaki adım ve yapılacaklar (web U.yapilacaklar eşi) ----------
  const yapilacaklar = ohAcik => {
    const l = [], a = aktifProgram(), n = yeni() ? 0 : okunmamis();
    if (n) l.push({ikon: 'sohbet', baslik: 'Diyetisyeninden yeni mesaj', alt: `${n} okunmamış mesajın bekliyor`, git: '#/uzman/sohbet'});
    if (yeni() && !plan()) l.push({ikon: 'hedef', baslik: 'Seni biraz tanıyalım', alt: 'Birkaç soruyla planını kuralım', git: '#/onboarding/hedef'});
    if (a || diyetisyen()) {
      const h = O().hesap(), od = h.ogunler.find(o => o.tur === h.odak), id = od && O().ID(od.tur);
      if (od && !ohAcik) l.push({ikon: od.ikon, baslik: `Sıradaki öğünün: ${od.ad}`, alt: `${nok(od.planlanan)} · plana uydun mu?`, git: DDV.bugun.ogunler.some(o => o.id === id) ? `#/ogun/${id}` : '#/bugun'});
    } else l.push({ikon: 'program', baslik: 'Kendine bir program seç', alt: 'Bugünün öğünleri hemen hazır olsun', git: '#/program-bul'});
    const s = kiloSeri().pop();
    if (s && (DD.simdi() - new Date(`${s.tarih}T12:00:00`)) / 864e5 >= 7) l.push({ikon: 'kilo', baslik: 'Ölçüm zamanı', alt: `Son ölçümün ${DD.tarihKisa(s.tarih)} tarihli`, git: '#/saglik?olcum=1'});
    return l.slice(0, 3);
  };
  const siradakiBolum = ohAcik => {
    const l = yapilacaklar(ohAcik);
    if (!l.length) return DD.eylemKart({ikon: 'basari', baslik: 'Bugün için her şey tamam', alt: 'Kayıtların diyetisyeninle paylaşıldı', bilgi: true});
    return DD.parcali(l.map((x, i) => ({...x, ana: i === 0})), {aria: 'Yapılacaklar'});
  };

  // ---------- İlk adımların: yeni hesapta üç adım, üçü bitince kart kalkar ----------
  const ilkAdimlar = () => {
    const d = DD.durum.oku('yeni-ogun', {}), ek = DD.durum.oku('yeni-ek', {});
    return [
      {ikon: 'hedef', baslik: 'İlk hedefini belirle', alt: 'Önerilerin buna göre kurulur', tamam: !!(plan() || DD.durum.oku('kisa-hedef', null)), metin: 'Belirle', git: '#/onboarding/hedef'},
      {ikon: 'program', baslik: 'Bir program seç', alt: 'Bugünün öğünleri hazır olsun', tamam: !!aktifProgram(), metin: 'Bul', git: '#/program-bul'},
      {ikon: 'ogun', baslik: 'İlk öğününü ekle', alt: 'Fotoğrafla, aramayla ya da sesle', tamam: Object.values(d).some(x => x.durum === 'dolu') || Object.values(ek).some(x => x.length), metin: 'Ekle', git: '#/besin-ara'}
    ];
  };
  const ilkSatirlar = l => l.map(x => ({
    ikon: x.tamam ? 'onay' : x.ikon, baslik: x.baslik, alt: x.alt, duz: true,
    sag: x.tamam ? DD.durumRozet({metin: 'Tamam', ton: 'basari', ikon: 'onay'}) : DD.btn({metin: x.metin, tur: 'tonal', boyut: 'sm', git: x.git})
  }));

  // ---------- Bugünün öğünleri: Öğün Hatırlatıcı motorunun günü, zaman çizelgesi olarak ----------
  const NOT_IKON = {oruc: 'hourglass-half', gec: 'moon', sessiz: 'bell-slash', gercek: 'clock-rotate-left'};
  const kcalVurgu = s => s.replace(/(\d[\d.]*\s?kcal)/, '**$1**');
  const kalem = (o, h) => {
    const odak = o.tur === h.odak, pencere = o.pencere && !o.sabit && ['simdi', 'siradaki', 'sonra'].includes(o.durum) ? `Pencere ${nok(o.pencere.bas)}–${nok(o.pencere.bit)}.` : '';
    let metin = '';
    if (o.durum === 'yedi') metin = `**Yedin**${o.gercek ? ` · ${nok(o.gercek)}` : ''}`;
    else if (o.durum === 'atladi') metin = '**Atladın**';
    else if (o.durum === 'gecti') metin = 'Saati geçti. **Atladın mı?**';
    else if (odak) metin = kcalVurgu(O().oneri(o, h));
    else if (o.hatirlatma && o.hatirlatma !== o.planlanan) metin = `Hatırlatma **${nok(o.hatirlatma)}**`;
    if (pencere) metin = metin ? `${metin} ${pencere}` : pencere;
    const notlar = o.notlar.filter(n => !(n.kod === 'gercek' && ['yedi', 'atladi'].includes(o.durum))).map(n => ({ikon: NOT_IKON[n.kod] || 'bilgi', metin: n.metin}));
    if (!o.aktif) notlar.push({ikon: 'bell-slash', metin: 'Bu öğün için hatırlatma kapalı.'});
    const rozetler = [o.durum === 'simdi' ? {metin: 'Şimdi', ton: 'basari', ikon: 'saat'} : odak ? {metin: 'Sıradaki', ton: 'basari', ikon: 'saat'} : null, o.kaynak === 'elle' ? {metin: 'Elle', ton: 'notr', ikon: 'duzenle'} : null].filter(Boolean);
    return {
      saat: nok(o.planlanan), baslik: o.ad, ikon: o.ikon, metin, notlar, rozetler,
      hal: o.durum === 'yedi' ? 'tamam' : o.durum === 'atladi' ? 'soluk' : odak ? 'odak' : undefined,
      eylemler: o.durum === 'gecti' ? [{metin: 'Atladım', ikon: 'kapat', veri: {eylem: 'oh-isaret', id: `${o.tur}:atladi`}}, {metin: 'Yedim', ikon: 'onay', veri: {eylem: 'oh-isaret', id: `${o.tur}:yedi`}}] : []
    };
  };
  const protokolAd = p => (p === 'sirkadiyen' ? 'Sirkadiyen' : String(p).replace('-', ':'));
  const izinYolu = () => (O().izin() === 'reddedildi' ? '#/bildirim-izni?hal=red' : '#/bildirim-izni');
  const ogunBolum = () => {
    const a = O().ayar();
    if (!a.acik) return DD.satirlar([{ikon: 'bildirim', baslik: 'Öğün hatırlatıcısını aç', alt: 'Öğün saatin gelince bildirimle haber verir', duz: true, sag: DD.btn({metin: 'Aç', tur: 'tonal', boyut: 'sm', veri: {eylem: 'oh-ac'}})}]);
    const h = O().hesap(), l = h.ogunler.filter(o => o.durum !== 'kapali'), od = l.find(o => o.tur === h.odak);
    const kaynak = l.some(o => o.kaynak === 'plan') ? 'Saatler diyetisyen planından' : h.oruc ? `${protokolAd(h.oruc.protokol)} yeme penceren ${nok(h.oruc.bas)}–${nok(h.oruc.bit)}` : `Kahvaltı ${nok(h.kahvalti)} saatine göre kuruldu`;
    const hat = a.once_dk ? `hatırlatma ${a.once_dk} dk önce, bildirimle` : 'hatırlatma öğün saatinde, bildirimle';
    const uyari = O().etkin() ? '' : DD.bant({ton: 'uyari', ikon: 'bell-slash', baslik: 'Bildirimler kapalı', metin: O().izin() === 'reddedildi' ? 'Telefonunda **Dada Diet bildirimleri** kapalı; hatırlatmalar gelmez, liste burada kalır.' : 'Hatırlatmaların gelmesi için **bildirim izni** gerekiyor.', eylem: {metin: 'Bildirimleri aç', git: izinYolu()}});
    const alt = od
      ? `<div class="dd-yigin-12">${DD.btn({metin: `Yedim · ${od.ad}`, ikon: 'onay', tam: true, veri: {eylem: 'oh-yedim', id: od.tur}})}${DD.btn({metin: 'Saatleri düzenle', ikon: 'saat', tur: 'secondary', tam: true, git: '#/ogun-saatleri'})}</div>`
      : `<div class="dd-yigin-12">${DD.p('**Bugünün öğünleri** tamam. Yarın saatler yeniden kurulur.', {ton: 'ikincil'})}${DD.btn({metin: 'Saatleri düzenle', ikon: 'saat', tur: 'secondary', tam: true, git: '#/ogun-saatleri'})}</div>`;
    return `<div class="dd-yigin-12">${DD.p(`**${kaynak}** · ${hat}.`, {meta: true, ton: 'ikincil'})}${uyari}${DD.zamanCizelge({etiket: 'Bugünün öğün saatleri', ogeler: l.map(o => kalem(o, h))})}${alt}</div>`;
  };

  // ---------- Hızlı kayıt ----------
  const kayitSatirlar = () => {
    const s = suOku(), planli = !!(aktifProgram() || diyetisyen());
    return [
      {ikon: 'ogun', baslik: 'Öğün', alt: planli ? 'Plana uyduysan işaretle' : 'Günlüğe ekle', duz: true, sag: DD.btn({metin: 'Ekle', tur: 'tonal', boyut: 'sm', git: planli ? '#/bugun' : '#/besin-ara'})},
      {ikon: 'su', baslik: 'Su', alt: `${DD.sayi(s.icilenMl)} ml içtin`, duz: true, sag: DD.btn({metin: `1 su bardağı (${DD.SU_BARDAK} ml)`, tur: 'tonal', boyut: 'sm', veri: {eylem: 'su-ekle'}})},
      {ikon: 'kilo', baslik: 'Ölçüm', alt: 'Kilo, bel, yağ oranı', duz: true, sag: DD.btn({metin: 'Ekle', tur: 'tonal', boyut: 'sm', git: '#/saglik?olcum=1'})}
    ];
  };

  // ---------- Sıradaki görüşme ve son mesaj ----------
  const gorusmeBolum = d => {
    const r = DD.durum.oku('uzman-randevu', B().sonrakiRandevu);
    if (!r) return DD.satirlar([{ikon: 'takvim', baslik: 'Planlı görüşmen yok', alt: `${d.kisaAd} ile yeni bir görüşme ayarla`, duz: true, sag: DD.btn({metin: 'Randevu al', tur: 'tonal', boyut: 'sm', git: `#/uzman/profil/${d.slug}?ertele=1`})}]);
    const t = new Date(`${r.tarih}T12:00:00`);
    return DD.randevuSatir({gun: t.getDate(), ay: t.toLocaleDateString('tr-TR', {month: 'short'}), baslik: r.baslik, saat: `${r.tarihMetin} ${nok(r.saat)}`, durum: r.tur, git: '#/uzman'});
  };
  const mesajBolum = d => {
    const m = B().sohbet.mesajlar.filter(x => x.kim !== 'ben').pop(), n = okunmamis();
    return `<div class="dd-yigin-12">${DD.yorum({ad: d.kisaAd, metin: m.metin, meta: `${m.saat.replace(':', '.')}${n ? ` · ${n} okunmamış` : ''}`})}${DD.btn({metin: 'Yanıtla', ikon: 'sohbet', tur: 'tonal', tam: true, git: '#/uzman/sohbet'})}</div>`;
  };

  // ---------- Kilo gidişatı: yolculuk + son 8 ölçüm ----------
  const kiloBolum = k => {
    const l = kiloSeri().slice(-8), yol = k.hedefKiloKg ? DD.yolculuk({bas: Math.max(k.baslangicKiloKg, k.kiloKg), simdi: k.kiloKg, hedef: k.hedefKiloKg, etiket: 'Hedef yolculuğun'}) : '';
    if (l.length < 2) return yol || null;
    const f = l[l.length - 1].deger - l[0].deger, degisim = Math.abs(f) < .05 ? 'değişim yok' : `${DD.ondalik(Math.abs(f), 1)} kg ${f < 0 ? 'azaldı' : 'arttı'}`;
    const kart = DD.grafikKart({
      deger: DD.ondalik(l[l.length - 1].deger, 1), birim: 'kg', fark: buyukBas(degisim), farkTon: f < 0 ? 'iyi' : 'notr',
      cumle: `Son **${l.length} ölçüm** · ${DD.tarihKisa(l[0].tarih)} – ${DD.tarihKisa(l[l.length - 1].tarih)}`,
      grafik: DD.grafik({tur: 'eksenli', ad: 'profil-kilo', etiket: 'Son ölçümlerde kilo', seri: l, birim: 'kg'})
    });
    return `<div class="dd-yigin-12">${yol}${kart}</div>`;
  };

  // ---------- Kısayol grupları (Gastro profil: Mutfağım, Gelişimim, Hesabım, Oturum) ----------
  const listeGruplari = k => {
    const a = O().ayar(), d = diyetisyen(), riza = DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'}).riza;
    const tarz = (k.beslenmeTarziAd || []).join(', '), bil = DD.bildirimSayi();
    return [
      {baslik: 'Beslenmem', satirlar: [
        {ikon: 'filtre', baslik: 'Tercihlerim', alt: [k.hedefAd, tarz].filter(Boolean).join(' · ') || 'Hedef, beslenme tarzı, öğün ritmi', git: '#/tercihler'},
        {ikon: 'saat', baslik: 'Öğün saatlerim', alt: a.acik ? `Hatırlatıcı açık · ${a.once_dk ? `${a.once_dk} dk önce` : 'saatinde'}` : 'Hatırlatıcı kapalı', git: '#/ogun-saatleri'},
        {ikon: 'calendar-week', baslik: 'Haftalık Menüm', alt: 'Menün ve alışveriş listen', git: '#/haftalik-menu'},
        {ikon: 'program', baslik: 'Programlarım', alt: aktifProgram() ? `${aktifProgram().gun}. gün · ${aktifProgram().toplamGun} günlük program` : 'Aktif programın yok', git: '#/programlarim'},
        {ikon: 'kaydet', baslik: 'Kaydedilenler', alt: 'Programlar, besinler ve ipuçları', git: '#/kaydedilenler'}
      ]},
      {baslik: 'Gelişimim', satirlar: [
        {ikon: 'tahlil', baslik: 'Sağlık dosyam', alt: 'Ölçümler, tahliller, notlar', git: '#/saglik'},
        {ikon: 'medal', baslik: 'Rozetlerim', alt: 'Kademen, rozetlerin ve puanın', git: '#/rozetler'}
      ]},
      {baslik: 'Hesabım', satirlar: [
        {ikon: 'box', baslik: 'Paketlerim', alt: d ? `${B().paket.ad} · ${B().paket.kalanSeans} görüşme kaldı` : 'Aktif paketin yok', git: '#/paketlerim'},
        {ikon: 'credit-card', baslik: 'Ödemelerim', alt: 'Faturalar ve kayıtlı kart', git: '#/odemelerim'},
        {ikon: 'bildirim', baslik: 'Bildirimler', alt: bil ? `${bil} okunmamış` : 'Hepsi okundu', git: '#/bildirimler'},
        {ikon: 'gizlilik', baslik: 'Veri izinlerim', alt: riza ? 'Açık rıza verildi' : 'Açık rıza verilmedi', git: '#/veri-izinleri'},
        {ikon: 'ayar', baslik: 'Hesap ayarları', alt: k.eposta, git: '#/ayarlar'}
      ]},
      {baslik: 'Destek', satirlar: [
        {ikon: 'uzman', baslik: 'Diyetisyenim', alt: d ? d.ad : 'Henüz diyetisyenin yok', git: '#/uzman'},
        {ikon: 'people-group', baslik: 'Destek Grupları', alt: 'Aynı hedefteki üyelerle', git: '#/destek-gruplari'},
        {ikon: 'headset', baslik: 'Çözüm merkezi', alt: 'Sık sorulanlar ve destek taleplerin', git: '#/cozum-merkezi'}
      ]},
      {baslik: 'Oturum', satirlar: [{ikon: 'cikis', baslik: 'Çıkış yap', veri: {eylem: 'cikis'}, ok: false, yikici: true}]}
    ];
  };

  DD.ekran('profil', {
    tur: 'banner',
    nav: 'profil',
    dock: true,
    ustBar: {geri: false},
    baslik: 'Profilim',
    iskelet: 'profil',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: () => {
      const k = K(), d = diyetisyen(), ohAcik = O().ayar().acik, ilk = yeni() ? ilkAdimlar() : [], ilkKalan = ilk.filter(x => !x.tamam).length, kilo = kiloBolum(k);
      return bas(k) + DD.gruplar([
        ilkKalan ? {baslik: 'İlk adımların', eylem: {html: `<span class="dd-t-meta dd-ton-ikincil">${3 - ilkKalan} / 3 tamamlandı</span>`}, satirlar: ilkSatirlar(ilk)} : {baslik: 'Sıradaki adımın', html: siradakiBolum(ohAcik)},
        {baslik: 'Bugünün öğünleri', html: ogunBolum()},
        {baslik: 'Hızlı kayıt', satirlar: kayitSatirlar()},
        d && {baslik: 'Sıradaki görüşmen', eylem: {git: '#/uzman'}, html: gorusmeBolum(d)},
        d && {baslik: 'Diyetisyeninden son mesaj', html: mesajBolum(d)},
        kilo && {baslik: 'Kilo gidişatın', eylem: {git: '#/saglik'}, html: kilo},
        ...listeGruplari(k)
      ], {bas: DD.btn({metin: 'Profili düzenle', ikon: 'duzenle', tur: 'secondary', boyut: 'sm', tam: true, git: '#/ayarlar/profil'})});
    },
    sonra: (kok, ctx) => {
      if (ctx.sorgu.ac === 'izinler' || ctx.sorgu.ac === 'ayarlar') { const h = ctx.sorgu.ac === 'izinler' ? '#/veri-izinleri' : '#/ayarlar/bildirim'; ctx.sorgu.ac = null; setTimeout(() => DD.yerine(h)); }
      // Öğün işaretleri başka ekrandan da gelir (Bugün, Öğün saatlerim); profil üstteyken yeniden çizilir, değilse dönüşte yenilenir.
      const ogunDegisti = () => { if (DD.aktif()?.ad === 'profil') DD.tazele(); };
      document.addEventListener('dd-ogun', ogunDegisti);
      const isaretle = (tur, durum) => {
        const ad = O().hesap().ogunler.find(o => o.tur === tur)?.ad || 'Öğün';
        O().isaretle(tur, durum);
        DD.toast(durum === 'yedi' ? `**${ad}** yedin; Bugün’e de yazıldı` : `**${ad}** atlandı`, {ikon: durum === 'yedi' ? 'onay' : 'forward', tur: durum === 'yedi' ? 'basari' : undefined, eylem: 'Geri al', onEylem: () => O().isaretle(tur, null)});
      };
      const c = [
        () => document.removeEventListener('dd-ogun', ogunDegisti),
        DD.eylem(kok, 'oh-ac', () => {
          if (O().izin() !== 'verildi') { DD.git(izinYolu()); return; }
          O().ayarYaz({acik: true});
          DD.toast('**Öğün hatırlatıcın** açıldı', {ikon: 'bildirim', eylem: 'Saatler', onEylem: () => DD.git('#/ogun-saatleri')});
        }),
        DD.eylem(kok, 'oh-isaret', el => { const [tur, durum] = el.dataset.id.split(':'); isaretle(tur, durum); }),
        DD.eylem(kok, 'oh-yedim', el => isaretle(el.dataset.id, 'yedi')),
        DD.eylem(kok, 'su-ekle', () => {
          const s = suOku(), once = {...s, kayitlar: [...s.kayitlar]}, kayitlar = [...s.kayitlar, {saat: DD.saatMetin(DD.simdi().getHours() * 60 + DD.simdi().getMinutes()), ml: DD.SU_BARDAK}];
          DD.durum.yaz(`${onek()}-su`, {...s, kayitlar, icilenMl: toplam(kayitlar, 'ml')});
          DD.tazele();
          DD.toast(`Su kaydın eklendi: **${DD.sayi(toplam(kayitlar, 'ml'))} / ${DD.sayi(suHedef())} ml**`, {ikon: 'su', eylem: 'Geri al', onEylem: () => { DD.durum.yaz(`${onek()}-su`, once); if (DD.aktif()?.ad === 'profil') DD.tazele(); }});
        }),
        DD.eylem(kok, 'cikis', () => DD.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) DD.cikis(); }))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
