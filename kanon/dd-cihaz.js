/* Telefon özellikleri bileşenleri (E3 + W widget kataloğu): cihaz çerçevesi, kilit ekranı ve StandBy, canlı etkinlik, Dinamik Ada, durum çubuğu çipi,
 * ana ekran widget'ları, hızlı ayar kutucuğu, sesli komut ekranı (Siri / Gemini). Stil kanon/dd-cihaz.css; renkler kanon token'larından, koyu tema çerçeve içinde yerel değişkenlerle.
 * Marka logosu çizilmez (Apple/Google yok): çerçeve sade, durum simgeleri Font Awesome solid, uygulama simgesi Dada Diet'in kendi simgesi.
 *
 * Çerçeve ve sahne
 *   DD.telefonCerceve({platform:'ios'|'android', tema:'acik'|'koyu', icerik, saat, kilit:{tarih, satir, aksesuar:[html]}, durumCip, ada, adaMin, yatay, etkilesimli, etiket, sinif})
 *     Tam telefon. kilit verilirse kilit ekranı başlığı (kilit simgesi, tarih, büyük saat; iOS'ta altta fener/kamera düğmeleri, Android'de parmak izi) çizilir;
 *     iOS'ta kilit.satir tarih satırındaki satır içi widget, kilit.aksesuar saatin altındaki widget sırası (DD.kilitWidget).
 *     iOS'ta Dinamik Ada (ada; adaMin verilirse ada bölünür, yanında minimal daire), Android'de kamera deliği. saat telefonun sistem saatidir (tr biçimi 17:10).
 *     yatay: StandBy (durum çubuğu yok, ada solda). etkilesimli: içinde dokunulabilir öğe var (role=group; yoksa role=img). durumCip: Android canlı çip (DD.durumCipi).
 *   DD.cihazKesit({platform, tema, saat, ada, adaMin, durumCip, icerik, etiket}) telefonun üst kesiti, altı solar.
 *   DD.anaEkran({widgetlar:[html], uygulama:{ad, gorsel}|false, simge, tarih, ara, dock, pasif}) dört sütunlu simge ızgarası: widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4),
 *     ardından uygulama simgesi ve simge sayısı kadar nötr simge yeri; iOS'ta Ara hapı (ara:false gizler), Android'de tarih satırı; dock: altta dört boş simge yeri;
 *     pasif: arka plan (inert, ekran okuyucudan gizli; Denetim Merkezi ve sesli komut altında).
 *   DD.telefonUygulama({rota, platform, baslik}) widget'a dokununca açılan uygulama: gerçek rota telefon ekranı ölçeğinde (iframe, dokunma kapalı).
 *   DD.telefonOlcek(kok) → durdur: kok altındaki uygulama ekranlarının ölçeğini (--tel-olcek) genişliğe göre tutar.
 * Canlı etkinlik
 *   DD.canliEtkinlik({platform, durum:'oruc'|'pencere'|'randevu', baslik, etiket, gecenSn, oran, kalanMetin, bas, bit, eylem, eylemKisa, eylemKod, eylemAc, kalanSn, kisi, harf, tur, saat, bitti, sureMetin})
 *     bitti: iOS bitiş içeriği (sayaç durur, sureMetin "8 sa" geçti; Ada'dan kalkar, kilit ekranında kısa süre kalır).
 *     iOS kilit ekranı Live Activity kartı ya da Android kalıcı bildirim (Android 16 Live Update). randevu: kalanSn geri sayar. eylem iOS'ta düğme olur (oruçta başlıkta kısa hap: eylemKisa;
 *     görüşmede tam genişlik; kart ≤ 160 pt):
 *     eylemKod verilirse data-wg-eylem, eylemAc verilirse uygulamayı açan data-wg-ac (ekran dinler); ikisi de yoksa yalnız görünüm.
 *   DD.dinamikAda({tur:'kompakt'|'genis'|'minimal', durum, ...canliEtkinlik alanları}) iOS Dinamik Ada içeriği (cihazKesit ada / adaMin).
 *     İki etkinlik aynı anda: ikisi de minimal (ada = bitişik minimal, adaMin = ayrık daire); ada kaymaz, sistem saati kesilmez.
 *   DD.durumCipi({durum, gecenSn, kalanSn}) Android durum çubuğu canlı çipi.
 * Widget (iOS WidgetKit / Android Glance boyları; düğmeler data-wg-eylem, uygulamayı açan gövde ve bağlantılar data-wg-ac; olaylar ekranın)
 *   DD.widget({boy:'kucuk'|'orta'|'buyuk', ton, hal, ac, etiket, icerik}) kabuk: ac verilirse tam boy kaplama düğmesi (gövdeye dokunma). Platform ve tema atadaki .dd-tel'den.
 *   Ortak alanlar: boy, hal:'giris'|'pro' (oturum yok / Pro'ya özel; pro:{rozet, metin}), eski (çevrimdışı: son güncelleme saati, başlıkta).
 *   DD.widgetKalori({hedef, alinan, makro, ogunler, su}) küçük/orta/büyük (büyük: Günün özeti) · DD.widgetSu({icilen, hedef, bardak}) küçük/orta ·
 *   DD.widgetOruc({durum:'oruc'|'hazir'|'kapali', baslik, metin, alt, hedefSaat, pencereSaat, gecenSn, oran, kalanMetin, kisaMetin, bas, bit, eylem, eylemAc, kalanSn}) küçük/orta
 *     (kalanSn: büyük sayaç kalan süreyi geri sayar; sistem sayacı gibi widget yeniden çizilmeden akar)
 *     (hazir: başlamamış oruç; ilerleme çizilmez, "Orucu başlat") ·
 *   DD.widgetOgun({siradaki:{id, ad, ikon, saat, kcal, besinler}, ogunler:[{id, ad, ikon, saat, kcal, durum, besinler}], ozet}) küçük/orta/büyük ·
 *   DD.widgetDiyetisyen({diyetisyen:{kisaAd, unvan, harf}, randevu:{gun, saat, kalan, gunNo, ay, baslik, tur}, mesajlar:[{kim, metin, saat}], okunmamis}) küçük/orta/büyük ·
 *   DD.widgetDugme({eylem, id, ac, ikon, metin, aria, ikincil, tam, yalniz}) widget içi düğme.
 *   DD.kilitWidget({tur:'daire'|'dikdortgen'|'satir', ikon, deger, oran, baslik, metin, sayac, alt, ac, aria}) iOS kilit ekranı widget'ı (tek renk).
 *   DD.standby({sol, sag}) StandBy'da iki widget (çerçeve yatay; gece kırmızı tonu çerçeve sinif 'is-gece').
 *   DD.hizliAyarlar({platform, saat, tarih, kutucuklar:[{ad, alt, ikon, hal:'aktif'|'pasif'|'kullanilamaz', eylem, ac, bizim, genis}]}) Android Hızlı Ayarlar paneli / iOS Denetim Merkezi.
 * Sesli komut
 *   DD.komutEkran({platform, komut, hal:'dinliyor'|'sonuc', sonuc, arka}) · DD.komutSonuc({ikon, ton, baslik, metin, deger, birim, oran, satirlar, alt})
 *   DD.komutOynat(el, sonuc) .dd-komut'u dinliyor → sonuç akışıyla yeniden oynatır (azHareket'te doğrudan sonuç); sonuç görününce sonuc() çağrılır (kaydı yazar); durdurma işlevi döner.
 * Sağlık bağlantısı (E1; E2 aynı pencereyi kullanır)
 *   DD.sistemIzinPenceresi({platform:'ios'|'android', servis:{ad, ikon}, uygulama:{ad, simge}, oku:[{id, ad, ikon, acik}], yaz:[...], yol, aciklama, bekle})
 *     → Promise<{izin:boolean, oku:{id:bool}, yaz:{id:bool}}>. Telefonun kendi sağlık izni sayfası (iOS Sağlık erişimi / Android Health Connect):
 *     nötr sistem yüzeyi, marka rengi ve marka logosu yok (uygulama simgesi Dada Diet'in kendi simgesi). Kapatma yok; İzin Verme ya da İzin Ver.
 *     iOS: üst çubukta İzin Verme / İzin Ver, gri gruplu zemin, "Tümünü Aç", yazma ve okuma grupları. Android: başlık soru cümlesi, "Tümüne izin ver" anahtarı,
 *     okuma ve yazma grupları, altta İzin verme / İzin ver. Hiçbir tür açık değilken İzin Ver pasif. bekle (ms): İzin Ver'de dönen halka, sonra kapanır.
 *     Sayfa değişip pencere kapanırsa {izin:false} döner.
 *   DD.cihazIzinAdim({gorsel, ikon, ton, baslik, metin, maddeler, ek, adim, toplam}) DD.izinIstemi gövdesi + servis tonu (ton: DD.ikonKutu tonu; rozet ve madde ikonları
 *     o tonda) + ek html (bağlantı, akordiyon) + isteğe bağlı adım göstergesi. Alt çubuk ekranın (DD.altEylem).
 *   DD.cihazBasari({baslik, metin, maddeler:[[ikon, baslik, alt]], ana, ikinciller, ipucuBaslik}) başarı sahnesi: DD.durumSahne onay rozeti yayla belirir,
 *     onay işareti ardından gelir, maddeler sırayla belirir (dd-hareket dd-dol / dd-sira-gir; azHareket'te anlık).
 *   DD.cihazYonlar({ad, yonler:[{yon:'oku'|'yaz', secili, etiket, pasif}]}) satır sonu yön ikonu + anahtar çifti (↓ okunur, ↑ yazılır); anahtar adı `${ad}-${yon}`,
 *     dd-degisim olayı DD.anahtar'ınki. DD.cihazYonAciklama({gelen, giden}) yön ikonlarının tek satırlık açıklaması.
 *   .dd-cdonen (DD.btn sinif): düğme ikonu döner ("Eşitleniyor…"); pasif halde soluklaşmaz.
 * Yardımcılar
 *   DD.cihazHalka({tur:'kalori'|'su'|'oruc'|'pencere'|'kilit', oran, boyut:'xs'|'sm'|'md'|'lg'|'kw', orta, aria, ustunde}) halka (kalori 270° açık yay = DD.halka; oruç geçişi = DD.orucSayac renkleri)
 *   DD.cihazCubuk({tur, oran}) ince ilerleme çubuğu · DD.cihazSayac(sn, {bicim:'tam'|'kisa'}) saniye saniye akan süre · DD.cihazGeriSayac(sn, {bicim:'dk'}) geri sayım · DD.cihazAdimlar([metin]) numaralı adımlar (**vurgu**)
 */
(() => {
  const DD = window.DD, {esc, ik, vurgu, sayi, kisit} = DD;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png';
  const iki = n => String(n).padStart(2, '0');

  // ---------- Süre: ileri (geçen) ya da geri (kalan) saniye saniye akar; başlangıç damgası, kayma yok ----------
  const sureMetin = (sn, bicim) => {
    sn = Math.max(0, Math.floor(sn));
    const s = Math.floor(sn / 3600), d = Math.floor(sn / 60) % 60;
    // kisa ve dk: sistem sayacı gibi; bir saatin altında dakika:saniye (0:42, 12:05), üstünde saat:dakika:saniye (3:10:22). İlk dakikada da akar.
    if (bicim === 'dakika') return String(Math.ceil(sn / 60));   // minimal ada: kalan dakika
    if (bicim === 'kisa' || bicim === 'dk') return s ? `${s}:${iki(d)}:${iki(sn % 60)}` : `${d}:${iki(sn % 60)}`;
    return `${iki(s)}:${iki(d)}:${iki(sn % 60)}`;
  };
  DD.cihazSayac = (sn = 0, o = {}) => `<span class="dd-csayac" data-cihaz-sayac="${Math.round(Date.now() - sn * 1000)}" data-bicim="${o.bicim || 'tam'}">${sureMetin(sn, o.bicim)}</span>`;
  DD.cihazGeriSayac = (sn = 0, o = {}) => `<span class="dd-csayac" data-cihaz-geri="${Math.round(Date.now() + sn * 1000)}" data-bicim="${o.bicim || 'dk'}">${sureMetin(sn, o.bicim || 'dk')}</span>`;
  setInterval(() => {
    if (document.hidden) return;
    document.querySelectorAll('[data-cihaz-sayac],[data-cihaz-geri]').forEach(el => {
      if (el.closest('.is-gizli')) return;
      const sn = el.dataset.cihazGeri ? Math.ceil((+el.dataset.cihazGeri - Date.now()) / 1000) : (Date.now() - +el.dataset.cihazSayac) / 1000;
      const m = sureMetin(sn, el.dataset.bicim);
      if (el.textContent !== m) el.textContent = m;
    });
  }, 1000);

  // ---------- Halka ve çubuk ----------
  DD.cihazHalka = (o = {}) => {
    const tur = o.tur || 'kalori', yay = tur === 'kalori', oran = kisit(o.oran || 0, 0, 1);
    const stil = `--cih-o:${oran.toFixed(3)};--bas:${yay ? 225 : 0}deg;--aci:${yay ? 270 : 360}deg`;
    return `<span class="${liste('dd-chalka', `is-${tur}`, `is-${o.boyut || 'sm'}`, o.ustunde && 'is-ustunde', o.sinif)}" style="${stil}"${o.aria ? ` role="img" aria-label="${esc(o.aria)}"` : ' aria-hidden="true"'}><span class="dd-chalka-iz"></span>${yay ? '<span class="dd-chalka-izuc is-bas"></span><span class="dd-chalka-izuc is-son"></span>' : ''}${oran > 0 ? '<span class="dd-chalka-yay"></span><span class="dd-chalka-uc is-bas"></span><span class="dd-chalka-uc is-son"></span>' : ''}${o.orta ? `<span class="dd-chalka-orta">${o.orta}</span>` : ''}</span>`;
  };
  DD.cihazCubuk = (o = {}) => `<span class="${liste('dd-ccubuk', `is-${o.tur || 'oruc'}`)}" style="--cih-o:${kisit(o.oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i></i></span>`;
  const RITIM_IKON = {oruc: 'hourglass-half', pencere: 'utensils', randevu: 'video'};

  // ---------- Çerçeve ----------
  const simgeler = p => `<span class="dd-tel-simgeler" aria-hidden="true">${p === 'ios' ? ik('signal') + ik('wifi') : ik('wifi') + ik('signal')}${ik('battery-three-quarters')}</span>`;
  const durumCubugu = o => `<div class="dd-tel-durum"><span class="dd-tel-durum-sol">${o.kilit ? '' : `<b>${esc(o.saat || '')}</b>`}${o.durumCip || ''}</span>${simgeler(o.platform)}</div>`;
  // iOS kilit ekranı: tarih satırında satır içi widget (accessoryInline), saatin altında en fazla dört yuvalık widget sırası (daire 1, dikdörtgen 2 yuva).
  const kilitBas = o => o.platform === 'ios'
    ? `<div class="dd-tel-kilit"><span class="dd-tel-kilit-ikon" aria-hidden="true">${ik('lock')}</span><small>${esc(o.kilit.tarih || '')}${o.kilit.satir ? `<span class="dd-tel-kilit-satir">${o.kilit.satir}</span>` : ''}</small><b>${esc(o.saat || '')}</b>${o.kilit.aksesuar?.length ? `<span class="dd-tel-kilit-aks">${o.kilit.aksesuar.join('')}</span>` : ''}</div>`
    : `<div class="dd-tel-kilit"><b>${esc(o.saat || '')}</b><small>${esc(o.kilit.tarih || '')}</small></div>`;
  const tepe = o => (o.platform === 'ios' ? `<span class="${liste('dd-tel-ada', o.adaMin && 'is-bolunmus')}">${o.ada || ''}</span>${o.adaMin ? `<span class="dd-tel-ada-min">${o.adaMin}</span>` : ''}` : '<span class="dd-tel-delik"></span>');
  const kok = (o, ek) => liste('dd-tel', `is-${o.platform || 'ios'}`, `is-${o.tema || 'acik'}`, o.yatay && 'is-yatay', ek, o.sinif);
  // etkilesimli: içinde dokunulabilir widget ya da kutucuk varsa çerçeve resim değil gruptur (role=group); yoksa role=img.
  const rol = o => (o.etkilesimli ? 'role="group"' : 'role="img"');
  DD.telefonCerceve = (o = {}) => {
    const p = o.platform || 'ios';
    // Yatay (StandBy): durum çubuğu ve alt çubuk yok, ada solda dikey.
    if (o.yatay) return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-ada is-dikey"></span><div class="dd-tel-icerik">${o.icerik || ''}</div></div></div></figure>`;
    return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}<div class="${liste('dd-tel-icerik', o.kilit && 'is-kilit')}">${o.kilit ? kilitBas({...o, platform: p}) : ''}${o.icerik || ''}</div>${o.kilit && p === 'android' ? `<span class="dd-tel-parmak" aria-hidden="true">${ik('fingerprint')}</span>` : ''}${o.kilit && p === 'ios' ? `<span class="dd-tel-kilit-dugmeler" aria-hidden="true"><span>${ik('lightbulb')}</span><span>${ik('camera')}</span></span>` : ''}<span class="dd-tel-cubuk"></span></div></div></figure>`;
  };
  DD.cihazKesit = (o = {}) => {
    const p = o.platform || 'ios';
    return `<figure class="${kok({...o, platform: p}, 'is-kesit')}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}${o.icerik ? `<div class="dd-tel-icerik">${o.icerik}</div>` : ''}</div></div></figure>`;
  };
  // Ana ekran: dört sütunlu simge ızgarası. Widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4); boş hücrelere uygulama simgesi ve
  // nötr simge yerleri gelir (başka uygulamanın logosu çizilmez). simge: boş simge yeri sayısı.
  DD.anaEkran = (o = {}) => `<div class="${liste('dd-tel-ana', o.sinif)}"${o.pasif ? ' inert aria-hidden="true"' : ''}>${o.tarih ? `<p class="dd-tel-gun">${esc(o.tarih)}</p>` : ''}<div class="dd-tel-izgara">${(o.widgetlar || []).join('')}${o.uygulama === false ? '' : `<span class="dd-tel-uyg"><img src="${esc(o.uygulama?.gorsel || SIMGE)}" alt=""><small>${esc(o.uygulama?.ad || 'Dada Diet')}</small></span>`}${'<span class="dd-tel-uyg is-bos" aria-hidden="true"><i></i></span>'.repeat(o.simge || 0)}</div>${o.ara === false ? '' : `<span class="dd-tel-ara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span></span>`}${o.dock ? `<span class="dd-tel-dock" aria-hidden="true">${'<i></i>'.repeat(4)}</span>` : ''}</div>`;
  // Widget'a dokununca açılan uygulama: hedef rotanın kendisi, telefon ekranı ölçeğinde (iframe; dokunma kapalı). Ölçek DD.telefonOlcek ile.
  DD.telefonUygulama = (o = {}) => `<div class="dd-tel-uygulama" data-tel-uyg="${o.platform === 'android' ? 412 : 393}"><iframe src="index.html${esc(o.rota || '#/bugun')}" title="${esc(o.baslik || 'Dada Diet')}" tabindex="-1" aria-hidden="true"></iframe></div>`;
  DD.telefonOlcek = kok => {
    const ayarla = el => { const g = el.offsetWidth;   // dönüşümden bağımsız yerleşim genişliği (açılış animasyonu ölçeği karıştırmaz)
      if (g) el.style.setProperty('--tel-olcek', (g / +el.dataset.telUyg).toFixed(4)); };
    const ro = new ResizeObserver(l => l.forEach(x => ayarla(x.target)));
    const bagla = () => kok.querySelectorAll('[data-tel-uyg]').forEach(el => { if (el.dataset.olcekli) return; el.dataset.olcekli = '1'; ayarla(el); ro.observe(el); });
    const mo = new MutationObserver(bagla);
    mo.observe(kok, {childList: true, subtree: true});
    bagla();
    return () => { ro.disconnect(); mo.disconnect(); };
  };

  // ---------- Canlı etkinlik ----------
  // durum: 'oruc'|'pencere' (Ritim sayacı) ya da 'randevu' (diyetisyen görüşmesi: kalanSn geri sayar, kisi, harf, eylem düğmesi).
  // Live Activity düğmesi (iOS 17+ App Intents): eylemKod → data-wg-eylem, eylemAc → uygulamayı açar; ikisi yoksa yalnız görünüm.
  const canliDugme = (o, ikon) => (!o.eylem ? '' : o.eylemKod || o.eylemAc
    ? `<button type="button" class="dd-canli-dugme"${o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ` data-wg-ac="${esc(o.eylemAc)}"`}>${ik(ikon)}<span>${esc(o.eylem)}</span></button>`
    : `<span class="dd-canli-dugme">${ik(ikon)}<span>${esc(o.eylem)}</span></span>`);
  // Başlıkta logo yerine kutusuz glif + ad (HIG: tam uygulama simgesi kullanılmaz). Kısa hap düğme başlığın sağında (kart 160 pt sınırında kalır).
  const marka = d => `<span class="dd-canli-marka">${ik(RITIM_IKON[d])}<span>Dada Diet</span></span>`;
  const canliHap = (o, ikon) => (!o.eylem ? '' : `<button type="button" class="dd-canli-hap"${o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : o.eylemAc ? ` data-wg-ac="${esc(o.eylemAc)}"` : ' disabled'} aria-label="${esc(o.eylem)}">${ik(ikon)}<span>${esc(o.eylemKisa || o.eylem)}</span></button>`);
  // Android bildirim eylemi (yalnız asıl eylem; bildirime dokunmak uygulamayı zaten açar). Dokunma hedefi 48 dp.
  const canliEylem = o => (!o.eylem ? '' : o.eylemKod || o.eylemAc
    ? `<button type="button"${o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ` data-wg-ac="${esc(o.eylemAc)}"`}>${esc(o.eylem)}</button>` : `<span>${esc(o.eylem)}</span>`);
  const randevuGovde = o => `<span class="dd-canli-kisi" aria-hidden="true">${esc(o.harf || '')}</span><div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kisi || '')}${o.tur ? ` · ${esc(o.tur)}` : ''}</small></div><div class="dd-canli-sure">${DD.cihazGeriSayac(o.kalanSn)}<small>${esc(o.saat ? `Başlangıç ${o.saat}` : '')}</small></div>`;
  DD.canliEtkinlik = (o = {}) => {
    const d = o.durum || 'oruc', yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100), randevu = d === 'randevu';
    if ((o.platform || 'ios') === 'android') {
      return `<div class="${liste('dd-canli', 'is-android', `is-${d}`)}">
        <div class="dd-canli-ust"><span class="dd-canli-glif" aria-hidden="true">${ik(RITIM_IKON[d])}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(o.etiket || 'Ritim')}</span><span aria-hidden="true">·</span>${randevu ? DD.cihazGeriSayac(o.kalanSn) : DD.cihazSayac(o.gecenSn)}</div>
        <div class="dd-canli-govde"><div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(randevu ? `${o.kisi || ''} · ${o.saat || ''}` : `${o.kalanMetin}${yuzde ? ` · %${yuzde}` : ''} · bitiş ${o.bit || ''}`)}</small></div><img src="${SIMGE}" alt=""></div>
        ${randevu ? '' : DD.cihazCubuk({tur: d, oran: o.oran})}
        ${o.eylem ? `<div class="dd-canli-eylemler">${canliEylem(o)}</div>` : ''}
      </div>`;
    }
    if (randevu) {
      return `<div class="${liste('dd-canli', 'is-ios', 'is-randevu')}">
        <div class="dd-canli-ust">${marka(d)}<small>${esc(o.etiket || '')}</small></div>
        <div class="dd-canli-govde">${randevuGovde(o)}</div>
        ${canliDugme(o, 'video')}
      </div>`;
    }
    // Bitiş içeriği (ActivityKit "ended"): sayaç durur, son durum yazılır; kart kilit ekranında kısa süre kalır, Ada'dan kalkar.
    if (o.bitti) return `<div class="${liste('dd-canli', 'is-ios', `is-${d}`, 'is-bitti')}">
      <div class="dd-canli-ust">${marka(d)}<small>${esc(o.etiket || '')}</small></div>
      <div class="dd-canli-govde">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik('forward')})}<div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin || '')}</small></div><div class="dd-canli-sure"><b>${esc(o.sureMetin || '')}</b><small>geçti</small></div></div>
    </div>`;
    return `<div class="${liste('dd-canli', 'is-ios', `is-${d}`)}">
      <div class="dd-canli-ust">${marka(d)}<small>${esc(o.etiket || '')}</small>${canliHap(o, 'stop')}</div>
      <div class="dd-canli-govde">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik(RITIM_IKON[d])})}<div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)}${o.bit ? ` · bitiş ${esc(o.bit)}` : ''}</small></div><div class="dd-canli-sure">${DD.cihazSayac(o.gecenSn)}<small>Geçen${yuzde ? ` · %${yuzde}` : ''}</small></div></div>
      ${DD.cihazCubuk({tur: d, oran: o.oran})}
    </div>`;
  };
  // Dinamik Ada: kompakt (tek etkinlik: adanın iki yanı), genis (basılı tutunca), minimal (iki etkinlik: ikisi de minimal; biri adaya bitişik
  // (cihazKesit ada + adaMin ile ada hafif genişler), öteki ayrık daire). Minimal canlı bilgi taşır: oruçta halka, görüşmede kalan dakika.
  DD.dinamikAda = (o = {}) => {
    const d = o.durum || 'oruc', randevu = d === 'randevu';
    const sol = randevu ? `<span class="dd-ada-kisi">${esc(o.harf || '')}</span>` : DD.cihazHalka({tur: d, oran: o.oran, boyut: 'xs'});
    if (o.tur === 'minimal') return `<span class="${liste('dd-ada', 'is-minimal', `is-${d}`)}">${randevu ? `<b>${DD.cihazGeriSayac(o.kalanSn, {bicim: 'dakika'})}</b>` : DD.cihazHalka({tur: d, oran: o.oran, boyut: 'xs', orta: ''})}</span>`;
    if (o.tur === 'genis') {
      if (randevu) return `<span class="${liste('dd-ada', 'is-genis', 'is-randevu')}"><span class="dd-ada-ust"><span class="dd-ada-kisi is-buyuk">${esc(o.harf || '')}</span><i></i>${DD.cihazGeriSayac(o.kalanSn)}</span><span class="dd-ada-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kisi || '')} · ${esc(o.saat || '')}</small></span>${o.eylem ? `<button type="button" class="dd-ada-dugme"${o.eylemAc ? ` data-wg-ac="${esc(o.eylemAc)}"` : o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ' disabled'}>${ik('video')}<span>${esc(o.eylem)}</span></button>` : ''}</span>`;
      // Üst satır kameranın iki yanına ayrılır (solda halka, sağda sayaç, ortası kamera); başlık ve kalan kameranın altında başlar.
      return `<span class="${liste('dd-ada', 'is-genis', `is-${d}`)}"><span class="dd-ada-ust">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik(RITIM_IKON[d])})}<i></i>${DD.cihazSayac(o.gecenSn)}</span><span class="dd-ada-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)}</small></span>${DD.cihazCubuk({tur: d, oran: o.oran})}<span class="dd-ada-alt"><span>${esc(o.bas)}</span><span>${esc(o.bit)}</span></span></span>`;
    }
    return `<span class="${liste('dd-ada', 'is-kompakt', `is-${d}`)}">${sol}<i></i>${randevu ? DD.cihazGeriSayac(o.kalanSn) : DD.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;
  };
  // Android durum çubuğu canlı çipi (Android 16 Live Updates; kısa metin): oruçta geçen süre, randevuda kalan süre.
  DD.durumCipi = (o = {}) => `<span class="${liste('dd-tel-cip', `is-${o.durum || 'oruc'}`)}">${ik(RITIM_IKON[o.durum || 'oruc'])}${o.durum === 'randevu' ? DD.cihazGeriSayac(o.kalanSn) : DD.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;

  // ---------- Widget ----------
  // Boylar (iPhone 393 pt): küçük 158×158, orta 338×158, büyük 338×354; köşe ~22 pt. Android: 2×2, 4×2, 4×4 hücre, sistem köşesi.
  // Gövdeye dokunmak uygulamayı açar: ilk çocuk tam boy kaplama düğmesi (data-wg-ac = rota). Widget içi düğmeler (iOS 17 App Intents Button,
  // Android RemoteViews/Glance eylemi) data-wg-eylem (+ data-id) taşır; uygulamayı açan bağlantı düğmeleri data-wg-ac.
  // Haller (her içerikli widget'ta o.hal): 'giris' (oturum yok: Giriş yap), 'pro' (Pro'ya özel; o.pro {rozet, metin}, pasif), o.eski (çevrimdışı: son güncelleme saati).
  // Çevrimdışı (başlıkta son güncelleme damgası varsa) veri soluklaşır: is-eski.
  DD.widget = (o = {}) => `<div class="${liste('dd-wg', `is-${o.boy || 'kucuk'}`, o.ton && `is-${o.ton}`, o.hal && `is-hal-${o.hal}`, (o.eski || o.icerik?.includes('class="dd-wg-eski is-damga')) && 'is-eski', o.sinif)}">${o.ac ? `<button type="button" class="dd-wg-ac" data-wg-ac="${esc(o.ac)}" aria-label="${esc(o.etiket || '')}"></button>` : ''}<div class="dd-wg-ic">${o.icerik || ''}</div></div>`;
  // Çevrimdışı damga: saat ikonu + son güncelleme saati. Küçük boyda başlık kısa adla yazılır (kisa), damga sığsın diye.
  const wgBas = (ikon, metin, o = {}, kisa) => `<span class="dd-wg-bas">${ik(ikon)}<span>${esc(o.eski && o.boy !== 'buyuk' && kisa ? kisa : metin)}</span>${o.eski ? `<small class="dd-wg-eski is-damga" aria-label="${esc(`Son güncelleme ${o.eski}`)}">${ik('clock-rotate-left')}${esc(o.eski)}</small>` : o.sag ? `<small class="dd-wg-eski">${o.sag}</small>` : ''}</span>`;
  const wgDugme = (d = {}) => {
    const v = d.eylem ? ` data-wg-eylem="${esc(d.eylem)}"${d.id ? ` data-id="${esc(d.id)}"` : ''}` : ` data-wg-ac="${esc(d.ac || '')}"`;
    return `<button type="button" class="${liste('dd-wg-dugme', d.ikincil && 'is-ikincil', d.tam && 'is-tam', d.yalniz && 'is-yalniz')}"${v} aria-label="${esc(d.aria || d.metin)}">${ik(d.ikon || 'plus')}${d.yalniz ? '' : `<span>${esc(d.metin)}</span>`}</button>`;
  };
  DD.widgetDugme = wgDugme;
  const wgBos = (ikon, baslik, metin, ek = '') => `<span class="dd-wg-bos">${ik(ikon)}${baslik ? `<b>${esc(baslik)}</b>` : ''}${metin ? `<small>${vurgu(metin)}</small>` : ''}${ek}</span>`;
  // Oturum yok ya da Pro'ya özel: içerik yerine tek mesaj; gövde sırasıyla #/giris ve #/pro açar. Orta ve büyükte widget'ın yerleşimi soluk iskeletle
  // durur (metin yok), mesaj altta: büyük kart boş kalmaz (HIG: küçük içeriği büyük alana yayma).
  const iskelet = boy => `<span class="${liste('dd-wg-iskelet', `is-${boy}`)}" aria-hidden="true"><i class="is-halka"></i><span>${'<i></i>'.repeat(boy === 'buyuk' ? 7 : 3)}</span></span>`;
  const halMesaj = (o, ikon, baslik, metin, ek) => (o.boy === 'kucuk'
    ? wgBos(ikon, baslik, '', ek)
    : `${iskelet(o.boy)}<span class="dd-wg-halmesaj">${ik(ikon)}<span><b>${esc(baslik)}</b>${metin ? `<small>${esc(metin)}</small>` : ''}</span>${ek}</span>`);
  const wgHal = (o, ton, ikon, ad) => {
    if (o.hal === 'giris') return DD.widget({boy: o.boy, ton, hal: 'giris', ac: '#/giris', etiket: `${ad} widget’ı: giriş yap`, icerik: `${wgBas(ikon, ad)}${halMesaj(o, 'right-to-bracket', 'Giriş yap', 'Günün burada görünsün', '')}`});
    // Pro metni kısa: uzun ödeme notu #/pro'da kalır.
    if (o.hal === 'pro') return DD.widget({boy: o.boy, ton, hal: 'pro', ac: '#/pro', etiket: `${ad} widget’ı: Dada Diet Pro ile açılacak, ${o.pro?.rozet || ''}`, icerik: `${wgBas(ikon, ad)}${halMesaj(o, 'bolt', 'Dada Diet Pro', 'Pro ile açılacak', `<span class="dd-wg-rozet">${esc(o.pro?.rozet || '')}</span>`)}`});
    return null;
  };
  const makroSatir = makro => `<span class="dd-wg-makrolar">${[['P', 'Protein', 'protein'], ['K', 'Karb.', 'karb'], ['Y', 'Yağ', 'yag']].map(([k, ad, t]) => { const m = makro[k]; return `<span class="dd-wg-makro is-${t}"><span><small>${ad}</small><small>${sayi(m.alinan)} / ${sayi(m.hedef)} g</small></span><span class="dd-wg-makro-yol" style="--cih-o:${kisit(m.alinan / (m.hedef || 1), 0, 1).toFixed(3)}"><i></i></span></span>`; }).join('')}</span>`;
  const ogunSatir = (x, o = {}) => {
    const sag = x.durum === 'dolu' ? `<span class="dd-wg-tik" aria-label="Yendi">${ik('circle-check')}</span>`
      : x.durum === 'atlandi' ? '<small class="dd-wg-not">Atlandı</small>'
        : o.dugmesiz ? '<small class="dd-wg-not">Planlı</small>'
          : x.besinler?.length ? wgDugme({eylem: 'ogun-yedim', id: x.id, ikon: 'check', metin: 'Yedim', aria: `${x.ad}: yedim`, ikincil: true}) : wgDugme({ac: `#/ogun/${x.id}`, ikon: 'plus', metin: 'Ekle', aria: `${x.ad}: besin ekle`, ikincil: true});
    return `<span class="${liste('dd-wg-ogsatir', x.durum === 'dolu' && 'is-dolu', o.siradaki && 'is-siradaki')}"><span class="dd-wg-ogun-ikon">${ik(x.ikon || 'utensils')}</span><span class="dd-wg-ogsatir-ad"><b>${esc(x.ad)}</b><small>${esc([x.saat, x.kcal != null ? `${sayi(x.kcal)} kcal` : ''].filter(Boolean).join(' · '))}</small></span>${sag}</span>`;
  };

  // Kalori: küçük halka + kalan, orta halka + makrolar, büyük "Günün özeti" (halka, makrolar, öğünler, su düğmesi).
  DD.widgetKalori = (o = {}) => {
    const boy = o.boy || 'kucuk', h = wgHal(o, 'kalori', 'fire-flame-curved', 'Kalori');
    if (h) return h;
    const ac = '#/bugun', bas = wgBas('fire-flame-curved', boy === 'buyuk' ? 'Bugün' : 'Kalori', o);
    if (o.hedef == null) return DD.widget({boy, ton: 'kalori', ac, etiket: 'Kalori widget’ı: hedef yok, uygulamada aç', icerik: `${bas}${wgBos('bullseye', '', 'Hedefini belirle, kalanın burada görünsün')}`});
    const kalan = o.hedef - o.alinan, ustunde = kalan < 0;
    const etiket = `Kalori widget’ı: ${sayi(o.alinan)} / ${sayi(o.hedef)} kcal, ${ustunde ? `${sayi(-kalan)} kcal fazla` : `${sayi(kalan)} kcal kaldı`}. Uygulamada aç`;
    const halka = b => DD.cihazHalka({tur: 'kalori', oran: o.alinan / o.hedef, ustunde, boyut: b, orta: `<b>${ustunde ? '+' : ''}${sayi(Math.abs(kalan))}</b><small>${ustunde ? 'fazla' : 'kalan'}</small>`});
    if (boy === 'kucuk') return DD.widget({boy, ton: 'kalori', ac, etiket, icerik: `${bas}<span class="dd-wg-halka">${halka('md')}</span><small class="dd-wg-not is-orta">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`});
    const sag = o.makro ? makroSatir(o.makro) : `<span class="dd-wg-satirlar"><span><small>Alınan</small><b>${sayi(o.alinan)} kcal</b></span><span><small>Hedef</small><b>${sayi(o.hedef)} kcal</b></span></span>`;
    const ust = `<span class="dd-wg-yan">${halka('lg')}<span class="dd-wg-sag">${bas}<small class="dd-wg-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>${sag}</span></span>`;
    if (boy === 'orta') return DD.widget({boy, ton: 'kalori', ac, etiket, icerik: ust});
    // Günün özetinde yalnız sıradaki planlı öğün düğme taşır (tek dokunma hedefi; satırlar sıkışmaz). Ötekiler "Planlı".
    const sira = (o.ogunler || []).find(x => x.durum === 'planli' && x.id === o.siradakiId) || (o.ogunler || []).find(x => x.durum === 'planli');
    const ogunler = (o.ogunler || []).map(x => ogunSatir(x, {dugmesiz: x !== sira, siradaki: x === sira})).join('');
    const su = o.su ? `<span class="dd-wg-surow"><span class="dd-wg-surow-ust">${ik('glass-water')}<b>${sayi(o.su.icilen)}</b><small>/ ${sayi(o.su.hedef)} ml</small></span>${DD.cihazCubuk({tur: 'su', oran: o.su.icilen / o.su.hedef})}${wgDugme({eylem: 'su-ekle', ikon: 'plus', metin: `${sayi(o.su.bardak)} ml`, aria: `1 su bardağı ekle, ${sayi(o.su.bardak)} ml`})}</span>` : '';
    return DD.widget({boy, ton: 'kalori', ac, etiket, icerik: `${ust}<span class="dd-wg-ayrac"></span><span class="dd-wg-ogunler">${ogunler}</span>${su}`});
  };

  // Su: "+1 bardak" düğmesi (App Intent; uygulama açılmadan Bugün'deki su kaydına yazar). Küçük ve orta boy.
  DD.widgetSu = (o = {}) => {
    const boy = o.boy || 'kucuk', h = wgHal(o, 'su', 'glass-water', 'Su');
    if (h) return h;
    const hedef = o.hedef || 1, icilen = o.icilen || 0, bardak = o.bardak || DD.SU_BARDAK || 200, kalan = hedef - icilen;
    const etiket = `Su widget’ı: ${sayi(icilen)} / ${sayi(hedef)} ml. Uygulamada aç`, ac = '#/bugun';
    const sayilar = `<span class="dd-wg-deger"><b>${sayi(icilen)}</b><small>/ ${sayi(hedef)} ml</small></span>`;
    const dugme = wgDugme({eylem: 'su-ekle', ikon: 'plus', metin: boy === 'kucuk' ? '1 bardak' : `1 bardak · ${sayi(bardak)} ml`, aria: `1 su bardağı ekle, ${sayi(bardak)} ml`, tam: boy === 'kucuk'});
    if (boy === 'kucuk') return DD.widget({boy, ton: 'su', ac, etiket, icerik: `${wgBas('glass-water', 'Su', o)}${sayilar}<span class="dd-wg-alt">${DD.cihazCubuk({tur: 'su', oran: icilen / hedef})}${dugme}</span>`});
    const n = Math.max(Math.ceil(hedef / bardak), Math.ceil(icilen / bardak)), dolu = icilen / bardak;
    const bardaklar = Array.from({length: n}, (_, i) => `<i class="${liste('dd-wg-bardak', i < Math.floor(dolu) ? 'is-dolu' : i < dolu ? 'is-yarim' : '')}">${ik('glass-water')}</i>`).join('');
    return DD.widget({boy, ton: 'su', ac, etiket, icerik: `<span class="dd-wg-yan is-su"><span class="dd-wg-sol">${wgBas('glass-water', 'Su', o)}${sayilar}<small class="dd-wg-not">${kalan > 0 ? `${sayi(kalan)} ml kaldı` : 'Bugünkü hedef tamam'}</small></span><span class="dd-wg-sag"><span class="dd-wg-bardaklar" aria-hidden="true">${bardaklar}</span>${dugme}</span></span>`});
  };

  // Oruç: başlamamışken ilerleme yok (karar 3): hedef süre + "Orucu başlat" düğmesi. Oruçta gerçek süre, çubuk/halka, "Orucu bitir".
  // durum: 'oruc' (canlı) | 'hazir' (başlamadı; eylem varsa düğme, eylemAc varsa uygulamayı açan bağlantı) | 'kapali' (takip kapalı).
  DD.widgetOruc = (o = {}) => {
    const boy = o.boy || 'kucuk', h = wgHal(o, 'oruc', 'hourglass-half', 'Oruç');
    if (h) return h;
    const d = o.durum || 'hazir', ac = '#/ritim';
    if (d === 'kapali') return DD.widget({boy, ton: 'oruc', ac, etiket: `Oruç widget’ı: ${o.baslik}. Uygulamada aç`, icerik: `${wgBas('hourglass-half', 'Oruç', o)}${wgBos('moon', o.baslik || 'Oruç takibi kapalı', boy === 'kucuk' ? '' : o.metin || '')}`});
    const dugme = o.eylem ? wgDugme({...(o.eylemAc ? {ac: o.eylemAc} : {eylem: d === 'oruc' ? 'oruc-bitir' : 'oruc-baslat'}), ikon: d === 'oruc' ? 'stop' : 'play', metin: o.eylem, tam: boy === 'kucuk'}) : '';
    if (d === 'hazir') {
      const etiket = `Oruç widget’ı: ${o.baslik}, ${o.metin}. Uygulamada aç`;
      // Küçük boyda gövde zaten Ritim'i açar: uygulamayı açan ikinci hedef konmaz (HIG: küçük widget'ta tek açma hedefi).
      if (boy === 'kucuk') return DD.widget({boy, ton: 'oruc', ac, etiket, icerik: `${wgBas('hourglass-half', 'Oruç', o)}<span class="dd-wg-deger"><b>${esc(o.hedefSaat ?? '')} sa</b><small>${esc(o.alt || '')}</small></span><span class="dd-wg-alt">${o.eylemAc ? '<small class="dd-wg-not">Ritim’de başlat</small>' : dugme}</span>`});
      return DD.widget({boy, ton: 'oruc', ac, etiket, icerik: `<span class="dd-wg-yan is-oruc"><span class="dd-wg-sol">${wgBas('hourglass-half', 'Oruç', o)}<b class="dd-wg-baslik">${esc(o.baslik)}</b><small class="dd-wg-not">${esc(o.metin || '')}</small>${dugme}</span><span class="dd-wg-sag is-ozet"><span><b>${esc(o.hedefSaat ?? '')} sa</b><small>oruç</small></span><span><b>${esc(o.pencereSaat ?? '')} sa</b><small>yeme penceresi</small></span></span></span>`});
    }
    const yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100);
    const etiket = `Oruç widget’ı: ${o.baslik}, %${yuzde}, ${o.kalanMetin}. Uygulamada aç`;
    // kalanSn verilirse büyük sayaç geri sayar (WidgetKit Text(timerInterval:) / Android Chronometer: widget yeniden çizilmeden akar).
    const sayac = o.kalanSn != null ? DD.cihazGeriSayac(o.kalanSn) : DD.cihazSayac(o.gecenSn);
    if (boy === 'kucuk') return DD.widget({boy, ton: 'oruc', ac, etiket, icerik: `${wgBas('hourglass-half', o.baslik || 'Oruç', o)}<b class="dd-wg-sure">${sayac}</b>${DD.cihazCubuk({tur: 'oruc', oran: o.oran})}<small class="dd-wg-not">${esc(o.kisaMetin || o.kalanMetin)}</small><span class="dd-wg-alt">${dugme}</span>`});
    return DD.widget({boy, ton: 'oruc', ac, etiket, icerik: `<span class="dd-wg-yan">${DD.cihazHalka({tur: 'oruc', oran: o.oran, boyut: 'lg', orta: `${ik('hourglass-half')}${yuzde ? `<b>%${yuzde}</b>` : ''}`})}<span class="dd-wg-sag">${wgBas('hourglass-half', o.baslik || 'Oruç', o)}<b class="dd-wg-sure">${sayac}</b><small class="dd-wg-not">${o.kalanSn != null ? `Geçen ${DD.cihazSayac(o.gecenSn)}` : esc(o.kalanMetin)}</small><small class="dd-wg-not">${esc(o.bas)} → ${esc(o.bit)}</small>${dugme}</span></span>`});
  };

  // Öğün / Bugün tabağım: sıradaki öğün + "Yedim" (planlı ve besinli öğün); besin yoksa "Ekle" uygulamayı açar (widget'ta metin girişi yok).
  // Büyük boy günün öğünleri + hızlı kayıt bağlantıları (fotoğraf, arama, ses).
  DD.widgetOgun = (o = {}) => {
    const boy = o.boy || 'kucuk', h = wgHal(o, 'ogun', 'utensils', 'Öğün');
    if (h) return h;
    const s = o.siradaki || {}, ac = s.id ? `#/ogun/${s.id}` : '#/bugun';
    if (boy === 'buyuk') {
      const l = o.ogunler || [];
      const hizli = `<span class="dd-wg-hizli">${wgDugme({ac: '#/ai/kamera', ikon: 'camera', metin: 'Fotoğraf', ikincil: true})}${wgDugme({ac: '#/besin-ara', ikon: 'magnifying-glass', metin: 'Besin ara', ikincil: true})}${wgDugme({ac: '#/ai/ses', ikon: 'microphone', metin: 'Sesle', ikincil: true})}</span>`;
      return DD.widget({boy, ton: 'ogun', ac: '#/bugun', etiket: `Bugün tabağım widget’ı: ${l.filter(x => x.durum === 'dolu').length} / ${l.length} öğün. Uygulamada aç`, icerik: `${wgBas('plate-wheat', 'Bugün tabağım', {...o, sag: o.eski ? '' : o.ozet ? esc(o.ozet) : ''})}<span class="dd-wg-ogunler is-genis">${l.map(x => ogunSatir(x, {siradaki: x.id === s.id})).join('')}</span>${hizli}`});
    }
    if (!s.ad) return DD.widget({boy, ton: 'ogun', ac: '#/bugun', etiket: 'Öğün widget’ı: bugünün öğünleri tamam. Uygulamada aç', icerik: `${wgBas('utensils', 'Sıradaki öğün', o, 'Öğün')}${wgBos('circle-check', boy === 'kucuk' ? '' : 'Bugünün öğünleri tamam', boy === 'kucuk' ? 'Bugünün öğünleri tamam' : 'Yarının planı sabah burada')}`});
    const meta = [s.saat, s.kcal != null ? `${sayi(s.kcal)} kcal` : ''].filter(Boolean).join(' · ');
    const etiket = `Sıradaki öğün widget’ı: ${s.ad}, ${meta}. Uygulamada aç`;
    const dugme = s.besinler?.length ? wgDugme({eylem: 'ogun-yedim', id: s.id, ikon: 'check', metin: 'Yedim', aria: `${s.ad}: yedim`, tam: boy === 'kucuk'}) : wgDugme({ac: ac, ikon: 'plus', metin: 'Ekle', aria: `${s.ad}: besin ekle`, tam: boy === 'kucuk'});
    const sol = `${wgBas(s.ikon || 'utensils', 'Sıradaki öğün', o, 'Öğün')}<span class="dd-wg-ogun"><b>${esc(s.ad)}</b><small>${esc(meta)}</small></span>`;
    if (boy === 'kucuk') return DD.widget({boy, ton: 'ogun', ac, etiket, icerik: `${sol}<span class="dd-wg-alt">${s.besinler?.length ? dugme : '<small class="dd-wg-not">Henüz besin eklenmedi</small>'}</span>`});
    const b = s.besinler || [], fazla = b.length - 3;
    if (!b.length) return DD.widget({boy, ton: 'ogun', ac, etiket, icerik: `${sol}<small class="dd-wg-not">Henüz besin eklenmedi</small><span class="dd-wg-sira">${dugme}${wgDugme({ac: '#/ai/kamera', ikon: 'camera', metin: 'Fotoğrafla', aria: 'Tabağını fotoğrafla', ikincil: true})}</span>`});
    return DD.widget({boy, ton: 'ogun', ac, etiket, icerik: `<span class="dd-wg-yan is-ogun"><span class="dd-wg-sol">${sol}<span class="dd-wg-sira">${dugme}</span></span><span class="dd-wg-sag"><span class="dd-wg-besinler">${b.slice(0, 4).map(x => `<small>${esc(x)}</small>`).join('')}${fazla > 1 ? `<small class="dd-wg-fazla">+${fazla - 1} besin daha</small>` : ''}</span></span></span>`});
  };

  // Diyetisyen: son mesaj ve sıradaki görüşme. Yanıt yazmak uygulamada (widget'ta metin girişi yok): "Yanıtla" sohbeti açar.
  // o.diyetisyen null → diyetisyen yok; o.randevu null → planlı görüşme yok. o.mesajlar: [{kim, metin, saat}] (sonuncusu en yeni).
  DD.widgetDiyetisyen = (o = {}) => {
    const boy = o.boy || 'kucuk', h = wgHal(o, 'diyetisyen', 'user-doctor', 'Diyetisyen');
    if (h) return h;
    const d = o.diyetisyen, r = o.randevu, m = o.mesajlar || [], son = [...m].reverse().find(x => x.kim !== 'ben');
    if (!d) return DD.widget({boy, ton: 'diyetisyen', ac: '#/uzman/bul', etiket: 'Diyetisyen widget’ı: diyetisyenin yok. Diyetisyen bul', icerik: `${wgBas('user-doctor', 'Diyetisyen', o)}${wgBos('user-doctor', boy === 'kucuk' ? '' : 'Henüz diyetisyenin yok', boy === 'kucuk' ? 'Diyetisyen bul' : 'Mesajların ve görüşmen burada görünür')}${boy === 'kucuk' ? '' : `<span class="dd-wg-alt is-sol">${wgDugme({ac: '#/uzman/bul', ikon: 'magnifying-glass', metin: 'Diyetisyen bul'})}</span>`}`});
    const kisi = `<span class="dd-wg-kisi"><span class="dd-wg-harf" aria-hidden="true">${esc(d.harf)}</span><span><b>${esc(d.kisaAd)}</b>${boy === 'kucuk' ? '' : `<small>${esc(d.unvan || '')}</small>`}</span>${o.okunmamis ? `<span class="dd-wg-rozet">${o.okunmamis} yeni</span>` : ''}</span>`;
    const randevuMetin = r ? `${r.gun} ${r.saat}` : 'Planlı görüşmen yok';
    if (boy === 'kucuk') {
      if (r) return DD.widget({boy, ton: 'diyetisyen', ac: '#/uzman', etiket: `Diyetisyen widget’ı: görüşme ${randevuMetin}, ${r.kalan}. Uygulamada aç`, icerik: `${wgBas('calendar-days', 'Görüşmen', o, 'Görüşme')}<span class="dd-wg-randevu"><span class="dd-wg-harf" aria-hidden="true">${esc(d.harf)}</span><b>${esc(r.gun)}</b><b class="dd-wg-buyuk">${esc(r.saat)}</b><small>${esc(r.kalan)}</small></span>`});
      return DD.widget({boy, ton: 'diyetisyen', ac: '#/uzman/sohbet', etiket: `Diyetisyen widget’ı: ${d.kisaAd}${o.okunmamis ? `, ${o.okunmamis} yeni mesaj` : ''}. Uygulamada aç`, icerik: `${wgBas('comment-dots', 'Mesajlar', o, 'Mesaj')}${kisi}${son ? `<small class="dd-wg-mesaj is-2">${esc(son.metin)}</small>` : ''}`});
    }
    // Orta boyda alt satır tek satır ve kısa gün (uzun dilde de taşmaz, sonu üç noktayla kesilir); büyük boyda iki satır.
    const rSatir = boy === 'orta'
      ? `<span class="dd-wg-rsatir is-tek">${ik('calendar-days')}<span><b>${esc(r ? `${r.gun.slice(0, 3)} ${r.saat}` : randevuMetin)}</b>${r ? `<small>${esc(r.kalan)}</small>` : ''}</span></span>`
      : `<span class="dd-wg-rsatir">${ik('calendar-days')}<span><b>${esc(randevuMetin)}</b>${r ? `<small>${esc(r.kalan)}</small>` : ''}</span></span>`;
    const yanitla = wgDugme({ac: '#/uzman/sohbet', ikon: 'reply', metin: 'Yanıtla', aria: 'Diyetisyenine yanıt yaz'});
    const etiket = `Diyetisyen widget’ı: ${d.kisaAd}${o.okunmamis ? `, ${o.okunmamis} yeni mesaj` : ''}${son ? `: ${son.metin}` : ''}. Görüşme ${randevuMetin}. Uygulamada aç`;
    if (boy === 'orta') return DD.widget({boy, ton: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `${kisi}${son ? `<span class="dd-wg-mesaj is-3"><small>${esc(son.metin)}</small><small class="dd-wg-not">${esc(son.saat)}</small></span>` : wgBos('', '', 'Henüz mesaj yok')}<span class="dd-wg-alt is-ara">${rSatir}${yanitla}</span>`});
    const balon = x => `<span class="${liste('dd-wg-balon', x.kim === 'ben' && 'is-ben')}"><small>${esc(x.metin)}</small><small class="dd-wg-not">${esc(x.saat)}</small></span>`;
    const kart = r ? `<span class="dd-wg-rkart"><span class="dd-wg-rtarih"><b>${esc(r.gunNo)}</b><small>${esc(r.ay)}</small></span><span class="dd-wg-rkart-ad"><b>${esc(r.baslik)}</b><small>${esc(`${r.gun} ${r.saat} · ${r.tur}`)}</small><small>${esc(r.kalan)}</small></span></span>` : rSatir;
    return DD.widget({boy, ton: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `${kisi}<span class="dd-wg-balonlar">${m.slice(-2).map(balon).join('')}</span>${kart}<span class="dd-wg-sira">${yanitla}${wgDugme({ac: '#/uzman', ikon: 'calendar-days', metin: 'Görüşme', ikincil: true})}</span>`});
  };

  // ---------- Kilit ekranı widget'ları (iOS accessory; tek renk, kilit ekranı yazı rengine uyar) ----------
  // tur: 'daire' (accessoryCircular: halka + ikon + değer), 'dikdortgen' (accessoryRectangular: başlık, metin, isteğe bağlı çubuk), 'satir' (accessoryInline: tarih satırında ikon + kısa metin).
  // iOS 17+ accessory widget'lar Button taşıyabilir; bu katalogda kilit ekranı widget'ları bilgi gösterir, dokunmak uygulamayı açar (ac).
  DD.kilitWidget = (o = {}) => {
    const t = o.tur || 'daire', ac = o.ac ? ` data-wg-ac="${esc(o.ac)}"` : '';
    if (t === 'satir') return `<button type="button" class="dd-kw is-satir"${ac} aria-label="${esc(o.aria || o.metin)}">${ik(o.ikon)}<span>${esc(o.metin)}</span></button>`;
    if (t === 'dikdortgen') return `<button type="button" class="dd-kw is-dikdortgen"${ac} aria-label="${esc(o.aria || `${o.baslik}, ${o.metin}`)}"><b>${ik(o.ikon)}<span>${esc(o.baslik)}</span></b><span>${o.sayac || esc(o.metin)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.oran != null ? `<span class="dd-kw-cubuk" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}"><i></i></span>` : ''}</button>`;
    return `<button type="button" class="dd-kw is-daire"${ac} aria-label="${esc(o.aria || o.deger)}">${DD.cihazHalka({tur: 'kilit', oran: o.oran ?? 0, boyut: 'kw', orta: `${ik(o.ikon)}<b>${esc(o.deger)}</b>`})}</button>`;
  };

  // ---------- StandBy (iOS, yatay şarjda): iki widget yan yana, arka planları kalkar; gece kırmızı ton çerçevenin is-gece sınıfıyla ----------
  DD.standby = (o = {}) => `<div class="dd-sb"><div class="dd-sb-yuva">${o.sol || ''}</div><div class="dd-sb-yuva">${o.sag || ''}</div></div>`;

  // ---------- Hızlı ayarlar (Android Quick Settings kutucuğu) ve Denetim Merkezi (iOS 18 denetimi) ----------
  // kutucuklar: [{ad, alt, ikon, hal:'aktif'|'pasif'|'kullanilamaz', eylem, ac, bizim}] Android Tile durumları: aktif = STATE_ACTIVE (açık), pasif = STATE_INACTIVE
  // (kapalı / tek seferlik eylemin hazır hali), kullanilamaz = STATE_UNAVAILABLE (dokunulmaz). bizim olmayanlar telefonun kendi nötr kutucuklarıdır (dokunulmaz).
  DD.hizliAyarlar = (o = {}) => {
    const p = o.platform || 'ios', l = o.kutucuklar || [];
    const kut = k => {
      const yok = k.hal === 'kullanilamaz';
      const tag = k.bizim ? 'button type="button"' : 'span', v = k.bizim ? `${!yok && k.eylem ? ` data-wg-eylem="${esc(k.eylem)}"` : ''}${!yok && k.ac ? ` data-wg-ac="${esc(k.ac)}"` : ''}${yok ? ' disabled' : ''} aria-label="${esc(`${k.ad}${k.alt ? `, ${k.alt}` : ''}`)}"` : ' aria-hidden="true"';
      return `<${tag} class="${liste('dd-ha-kut', `is-${k.hal || 'pasif'}`, k.genis && 'is-genis', k.bizim && 'is-bizim')}"${v}><span class="dd-ha-ikon">${ik(k.ikon)}</span>${k.genis || p === 'android' ? `<span class="dd-ha-metin"><b>${esc(k.ad)}</b>${k.alt ? `<small>${esc(k.alt)}</small>` : ''}</span>` : ''}</${k.bizim ? 'button' : 'span'}>`;
    };
    if (p === 'android') return `<div class="dd-ha is-android"><div class="dd-ha-ust"><b>${esc(o.saat || '')}</b><small>${esc(o.tarih || '')}</small></div><span class="dd-ha-parlak" aria-hidden="true">${ik('sun')}<i></i></span><div class="dd-ha-izgara">${l.map(kut).join('')}</div><span class="dd-ha-tutamak" aria-hidden="true"></span></div>`;
    return `<div class="dd-ha is-ios"><div class="dd-ha-izgara">${l.map(kut).join('')}<span class="dd-ha-kaydirici" aria-hidden="true">${ik('sun')}<i></i></span><span class="dd-ha-kaydirici" aria-hidden="true">${ik('volume-high')}<i></i></span></div></div>`;
  };

  // ---------- Sesli komut ----------
  DD.komutSonuc = (o = {}) => `<div class="${liste('dd-ksonuc', `is-${o.ton || 'kalori'}`)}">
    <span class="dd-ksonuc-ust"><img src="${SIMGE}" alt=""><span>Dada Diet</span></span>
    <span class="dd-ksonuc-bas"><span class="dd-ksonuc-ikon">${ik(o.ikon || 'check')}</span><span><b>${esc(o.baslik)}</b>${o.metin ? `<small>${esc(o.metin)}</small>` : ''}</span></span>
    ${o.deger != null ? `<span class="dd-ksonuc-deger"><b>${esc(o.deger)}</b><small>${esc(o.birim || '')}</small></span>` : ''}
    ${o.oran != null ? DD.cihazCubuk({tur: o.ton === 'su' ? 'su' : 'kalori', oran: o.oran}) : ''}
    ${o.satirlar?.length ? `<span class="dd-ksonuc-satirlar">${o.satirlar.map(s => `<small>${esc(s)}</small>`).join('')}</span>` : ''}
    ${o.alt ? `<span class="dd-ksonuc-alt">${vurgu(o.alt)}</span>` : ''}
  </div>`;
  DD.komutEkran = (o = {}) => {
    const p = o.platform || 'ios', hal = o.hal || 'sonuc';
    const dalga = `<span class="dd-komut-dalga" aria-hidden="true">${'<i></i>'.repeat(5)}</span>`;
    if (p === 'android') {
      return `<div class="dd-komut is-android" data-hal="${hal}"><div class="dd-komut-arka" aria-hidden="true" inert>${o.arka || ''}</div><span class="dd-komut-perde"></span>
        <div class="dd-komut-sayfa"><span class="dd-komut-tutamak"></span><p class="dd-komut-soz"><q>${esc(o.komut)}</q></p><p class="dd-komut-dinle">${dalga}<span>Dinliyor…</span></p><div class="dd-komut-kart">${o.sonuc || ''}</div><span class="dd-komut-mik" aria-hidden="true">${ik('microphone')}</span></div></div>`;
    }
    return `<div class="dd-komut is-ios" data-hal="${hal}"><div class="dd-komut-arka" aria-hidden="true" inert>${o.arka || ''}</div><span class="dd-komut-perde"></span><span class="dd-komut-isilti" aria-hidden="true"></span>
      <div class="dd-komut-kart">${o.sonuc || ''}</div><p class="dd-komut-soz">${dalga}<q>${esc(o.komut)}</q></p></div>`;
  };
  DD.komutOynat = (el, sonuc) => {
    if (!el) return () => {};
    el.dataset.hal = 'dinliyor';
    if (DD.azHareket()) { el.dataset.hal = 'sonuc'; sonuc?.(); return () => {}; }
    void el.offsetWidth;
    const z = setTimeout(() => { el.dataset.hal = 'sonuc'; sonuc?.(); }, 1800);
    return () => clearTimeout(z);
  };

  // ---------- Adımlar ----------
  DD.cihazAdimlar = (l = [], o = {}) => `<ol class="${liste('dd-cadimlar', o.sinif)}">${l.map((m, i) => `<li><span class="dd-cadim-no" aria-hidden="true">${i + 1}</span><span>${vurgu(m)}</span></li>`).join('')}</ol>`;

  // ---------- Sağlık bağlantısı: telefonun izin penceresi ----------
  const YON_IKON = {oku: 'arrow-down', yaz: 'arrow-up'};
  DD.cihazYonlar = (o = {}) => `<span class="dd-cyonlar">${(o.yonler || []).map(y => `<span class="${liste('dd-cyon', `is-${y.yon}`)}">${ik(YON_IKON[y.yon])}${DD.anahtar({ad: `${o.ad}-${y.yon}`, etiket: y.etiket, secili: y.secili, pasif: y.pasif})}</span>`).join('')}</span>`;
  DD.cihazYonAciklama = (o = {}) => `<p class="dd-cyon-aciklama">${o.gelen ? `<span>${ik(YON_IKON.oku)}${esc(o.gelen)}</span>` : ''}${o.giden ? `<span>${ik(YON_IKON.yaz)}${esc(o.giden)}</span>` : ''}</p>`;

  DD.cihazIzinAdim = (o = {}) => `<div class="${liste('dd-izin dd-cizin', o.ton && `is-${o.ton}`)}">${DD.gulucuk({gorsel: o.gorsel, rozet: o.ikon})}<div class="dd-ic dd-izin-govde">${o.toplam ? `<div class="dd-cizin-adim">${DD.adimGosterge({adim: o.adim, toplam: o.toplam})}</div>` : ''}<h1 class="dd-t-page">${esc(o.baslik)}</h1><p class="dd-izin-metin">${vurgu(o.metin || '')}</p>${o.maddeler?.length ? DD.maddeler(o.maddeler) : ''}${o.ek || ''}</div></div>`;

  DD.cihazBasari = (o = {}) => `<div class="dd-cbasari">${DD.durumSahne({isaret: 'circle-check', baslik: o.baslik, metin: o.metin, ipucuBaslik: o.ipucuBaslik || 'İlk eşitlemede gelenler', ipuclari: o.maddeler, ana: o.ana, ikinciller: o.ikinciller || []})}</div>`;

  const SIZIN = {
    ios: {baslik: 'Sağlık Erişimi', red: 'İzin Verme', ver: 'İzin Ver', tumu: 'Tümünü Aç', tumuKapat: 'Tümünü Kapat',
      giris: (u, s) => `“${u}”, ${s} verilerine erişmek ve onları güncellemek istiyor.`,
      yaz: u => `“${u}” uygulamasının veri yazmasına izin ver:`, oku: u => `“${u}” uygulamasının veri okumasına izin ver:`, aciklama: 'Uygulama açıklaması'},
    android: {baslik: 'Health Connect', red: 'İzin verme', ver: 'İzin ver', tumu: 'Tümüne izin ver',
      giris: (u, s) => `${u} uygulamasının ${s} verilerine erişmesine izin verilsin mi?`,
      yaz: u => `${u} uygulamasının yazmasına izin ver`, oku: u => `${u} uygulamasının okumasına izin ver`, aciklama: 'Bu uygulama verilerini neden kullanıyor?'}
  };
  DD.sistemIzinPenceresi = (o = {}) => new Promise(coz => {
    const p = o.platform === 'android' ? 'android' : 'ios', M = SIZIN[p], u = o.uygulama?.ad || 'Dada Diet', simge = o.uygulama?.simge || SIMGE;
    const oku = o.oku || [], yaz = o.yaz || [], hepsi = [...oku.map(t => ['oku', t]), ...yaz.map(t => ['yaz', t])];
    const sec = {oku: Object.fromEntries(oku.map(t => [t.id, !!t.acik])), yaz: Object.fromEntries(yaz.map(t => [t.id, !!t.acik]))};
    const tumuAcik = () => hepsi.every(([y, t]) => sec[y][t.id]), biri = () => hepsi.some(([y, t]) => sec[y][t.id]);
    const satir = (y, t) => `<div class="dd-sizin-satir">${t.ikon ? `<span class="dd-sizin-ikon" aria-hidden="true">${ik(t.ikon)}</span>` : ''}<span class="dd-sizin-ad">${esc(t.ad)}</span>${DD.anahtar({ad: `sizin-${y}-${t.id}`, etiket: `${t.ad}, ${y === 'oku' ? 'okuma' : 'yazma'}`, secili: sec[y][t.id]})}</div>`;
    const grup = (y, l) => (l.length ? `<p class="dd-sizin-etiket">${esc(M[y](u))}</p><div class="dd-sizin-kart">${l.map(t => satir(y, t)).join('')}</div>` : '');
    const tumuHtml = () => (p === 'ios'
      ? `<div class="dd-sizin-kart"><button type="button" class="dd-sizin-baglanti" data-sizin="tumu">${esc(tumuAcik() ? M.tumuKapat : M.tumu)}</button></div>`
      : `<div class="dd-sizin-kart"><div class="dd-sizin-satir is-tumu"><span class="dd-sizin-ad">${esc(M.tumu)}</span>${DD.anahtar({ad: 'sizin-tumu', etiket: M.tumu, secili: tumuAcik()})}</div></div>`);
    const verBtn = `<button type="button" class="dd-sizin-dugme is-ana" data-sizin="ver"${biri() ? '' : ' disabled'}>${esc(M.ver)}</button>`;
    const redBtn = `<button type="button" class="dd-sizin-dugme" data-sizin="red">${esc(M.red)}</button>`;
    const servis = `<span class="dd-sizin-servis" aria-hidden="true">${ik(o.servis?.ikon || 'heart-pulse')}</span>`;
    const ust = p === 'ios'
      ? `<div class="dd-sizin-bar">${redBtn}<h2>${esc(M.baslik)}</h2>${verBtn}</div>`
      : `<div class="dd-sizin-bar"><span class="dd-sizin-simge is-kucuk" aria-hidden="true"><img src="${esc(simge)}" alt=""></span>${servis}</div>`;
    const bas = p === 'ios'
      ? `<div class="dd-sizin-uyg"><span class="dd-sizin-simge" aria-hidden="true"><img src="${esc(simge)}" alt=""></span><p>${esc(M.giris(u, o.servis?.ad || 'Sağlık'))}</p></div>`
      : `<div class="dd-sizin-uyg"><h2>${esc(M.giris(u, o.servis?.ad || 'Health Connect'))}</h2><p>${esc(`${u} uygulamasının okuyup yazabileceği verileri seç.`)}</p></div>`;
    const not = `${o.aciklama ? `<p class="dd-sizin-etiket">${esc(M.aciklama)}</p><div class="dd-sizin-kart is-metin"><p>${esc(o.aciklama)}</p></div>` : ''}${o.yol ? `<p class="dd-sizin-not">${esc(`İzinleri istediğin an ${o.yol} bölümünden değiştirebilirsin.`)}</p>` : ''}`;
    const govde = p === 'ios' ? `${tumuHtml()}${grup('yaz', yaz)}${grup('oku', oku)}` : `${tumuHtml()}${grup('oku', oku)}${grup('yaz', yaz)}`;
    let sonuc = {izin: false, oku: sec.oku, yaz: sec.yaz};
    DD.sheet({
      baslik: p === 'ios' ? M.baslik : `${o.servis?.ad || 'Health Connect'} izni`, tam: true, zorunlu: true, sinif: `dd-sizin-sheet is-${p}`,
      html: `<div class="${liste('dd-sizin', `is-${p}`)}">${ust}<div class="dd-sizin-govde">${bas}${govde}${not}</div>${p === 'android' ? `<div class="dd-sizin-alt">${redBtn}${verBtn}</div>` : ''}</div>`,
      kapaninca: () => coz(sonuc),
      sonra: d => {
        const ver = () => d.querySelector('[data-sizin="ver"]');
        const yenile = () => {
          const b = ver(); if (b) b.disabled = !biri();
          const t = d.querySelector('[data-sizin="tumu"]'); if (t) t.textContent = tumuAcik() ? M.tumuKapat : M.tumu;
          const a = d.querySelector('input[name="sizin-tumu"]'); if (a) a.checked = tumuAcik();
        };
        const hepsiniYap = v => { hepsi.forEach(([y, t]) => { sec[y][t.id] = v; const g = d.querySelector(`input[name="sizin-${y}-${t.id}"]`); if (g) g.checked = v; }); yenile(); };
        const c = [
          ...hepsi.map(([y, t]) => DD.on(d, `sizin-${y}-${t.id}`, v => { sec[y][t.id] = v; yenile(); })),
          DD.on(d, 'sizin-tumu', v => hepsiniYap(v))
        ];
        const tik = ev => {
          const b = ev.target.closest('[data-sizin]'); if (!b || b.disabled) return;
          const e = b.dataset.sizin;
          if (e === 'tumu') hepsiniYap(!tumuAcik());
          else if (e === 'red') { sonuc = {izin: false, oku: sec.oku, yaz: sec.yaz}; d.kapat(); }
          else if (e === 'ver') {
            sonuc = {izin: true, oku: {...sec.oku}, yaz: {...sec.yaz}};
            const bek = DD.azHareket() ? 0 : +o.bekle || 0;
            if (!bek) { d.kapat(); return; }
            b.setAttribute('aria-busy', 'true'); d.querySelectorAll('[data-sizin]').forEach(x => { x.disabled = true; });
            setTimeout(() => d.kapat(), bek);
          }
        };
        d.addEventListener('click', tik);
        return () => { c.forEach(f => f()); d.removeEventListener('click', tik); };
      }
    });
  });
})();

/* ---------- Biyometrik istem (E4): telefonun kimlik doğrulama penceresi ----------
 * DD.biyometrikIstem({platform:'ios'|'ios-touch'|'android', neden, sonuc:'basari'|'basarisiz', sure}) → Promise<'basari'|'basarisiz'|'iptal'|'sifre'>
 *   ios: ortada kare sistem kutusu (yüz tarama simgesi + "Face ID"), tararken köşeler nabız atar; altta İptal.
 *   ios-touch: sistem uyarısı ("“Dada Diet” için Touch ID", gerekçe, parmak izi), altta İptal.
 *   android: alttan sayfa (BiometricPrompt): uygulama simgesi, "Dada Diet’i aç", gerekçe, halkalı parmak izi, durum satırı, "Şifre kullan" metin düğmesi.
 *   Haller data-hal: tarama → basari (simge onay işaretine döner, çizilerek) | basarisiz (hata tonu, sallanma). Sonuçta İptal ve Şifre kullan kalkar.
 *   Süreler hareket ayarından bağımsızdır: azaltılmış harekette istem aynı süre görünür, yalnız animasyonlar durur. Perdeye dokunmak, Esc ve sayfa değişimi = iptal.
 *   Nötr sistem yüzeyi: marka rengi ve resmi glif yok; yüz tarama simgesi genel çizim (köşe çerçeve + ifadesiz yüz).
 * İkon: `yuz-tarama` (DD.ik('yuz-tarama'), DD.btn/satır/ikonKutu ikon adı olarak) dd-cihaz.css'te maske ile tanımlı. */
(() => {
  const DD = window.DD, {esc, ik} = DD;
  const SIMGE = 'assets/marka/ikon-512.png';
  const YUZ = '<svg class="dd-bistem-yuz" viewBox="0 0 24 24" aria-hidden="true"><g class="dd-bistem-kose"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/></g><g class="dd-bistem-ic-yuz"><path d="M9 9v1.5"/><path d="M15 9v1.5"/><path d="M12 9v4.5h-1"/><path d="M9.5 16.5h5"/></g></svg>';
  const ONAY = '<svg class="dd-bistem-onay" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" pathLength="1"/><path d="M7.5 12.5l3 3 6-6.5" pathLength="1"/></svg>';
  const M = {
    ios: {ad: 'Face ID', tarama: 'Face ID', basari: 'Doğrulandı', basarisiz: 'Tanınmadı'},
    'ios-touch': {ad: 'Touch ID', tarama: 'Parmağını Ana ekran düğmesine koy', basari: 'Doğrulandı', basarisiz: 'Tanınmadı, tekrar dene'},
    android: {ad: 'Parmak izi', tarama: 'Parmak izi sensörüne dokun', basari: 'Doğrulandı', basarisiz: 'Tanınmadı'}
  };
  DD.biyometrikIstem = (o = {}) => new Promise(coz => {
    const p = M[o.platform] ? o.platform : 'ios', m = M[p], neden = o.neden || 'Dada Diet’i açmak için';
    const kat = document.getElementById('dd-katman') || document.body;
    const glif = `<span class="dd-bistem-glif">${p === 'ios' ? YUZ : ik('fingerprint', 'dd-bistem-parmak')}${ONAY}</span>`;
    const durum = `<span class="dd-bistem-durum" aria-live="polite">${esc(m.tarama)}</span>`;
    const govde = p === 'ios'
      ? `<div class="dd-bistem-kutu" tabindex="-1">${glif}${durum}</div><button type="button" class="dd-bistem-iptal" data-bistem="iptal">İptal</button>`
      : p === 'ios-touch'
        ? `<div class="dd-bistem-kutu" tabindex="-1"><div class="dd-bistem-ic"><b class="dd-bistem-baslik">“Dada Diet” için Touch ID</b><p>${esc(neden)}</p>${glif}${durum}</div><button type="button" class="dd-bistem-dugme" data-bistem="iptal">İptal</button></div>`
        : `<div class="dd-bistem-kutu" tabindex="-1"><div class="dd-bistem-ic"><span class="dd-bistem-simge" aria-hidden="true"><img src="${SIMGE}" alt=""></span><b class="dd-bistem-baslik">Dada Diet’i aç</b><p>${esc(neden)}</p>${glif}${durum}</div><div class="dd-bistem-ayak"><button type="button" class="dd-bistem-dugme" data-bistem="sifre">Şifre kullan</button></div></div>`;
    const kap = document.createElement('div');
    kap.className = `dd-bistem is-${p}`;
    kap.dataset.hal = 'tarama';
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-modal', 'true'); kap.setAttribute('aria-label', m.ad);
    kap.innerHTML = `<div class="dd-bistem-perde" data-bistem="iptal"></div>${govde}`;
    kat.append(kap);
    const onceki = document.activeElement;
    kap.querySelector('.dd-bistem-kutu').focus({preventScroll: true});
    let bitti = false, t1 = 0, t2 = 0;
    const kapat = s => {
      if (bitti) return; bitti = true;
      clearTimeout(t1); clearTimeout(t2); removeEventListener('hashchange', gec); removeEventListener('popstate', gec);
      kap.classList.add('is-cikis');
      setTimeout(() => { kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(s); }, DD.azHareket() ? 0 : DD.TK.motion.base);
    };
    const gec = () => kapat('iptal');
    addEventListener('hashchange', gec); addEventListener('popstate', gec);
    kap.addEventListener('click', ev => { const b = ev.target.closest('[data-bistem]'); if (b && kap.dataset.hal === 'tarama') kapat(b.dataset.bistem); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape' && kap.dataset.hal === 'tarama') kapat('iptal'); });
    const sure = +o.sure || DD.TK.motion.reveal * 4;
    t1 = setTimeout(() => {
      const s = o.sonuc === 'basarisiz' ? 'basarisiz' : 'basari';
      kap.dataset.hal = s;
      kap.querySelector('.dd-bistem-durum').textContent = m[s];
      kap.querySelectorAll('[data-bistem]:not(.dd-bistem-perde)').forEach(b => { b.disabled = true; });
      DD.titres(s === 'basari' ? 12 : 30);
      t2 = setTimeout(() => kapat(s), s === 'basari' ? DD.TK.motion.reveal * 2 : DD.TK.motion.reveal * 3);
    }, sure);
  });
  // Telefonun sistem uyarısı (ör. iOS "… Face ID kullanmak istiyor"): nötr yüzey, iOS'ta yan yana iki eşit metin düğmesi, Android'de sağa yaslı metin düğmeleri.
  // DD.sistemUyari({platform, baslik, metin, red, ver}) → Promise<boolean|null>. Perde kapatmaz (sistem seçim ister); Esc = false (red);
  // rota değişirse (geri tuşu, adres) uyarı kapanır ve null döner: seçim yapılmadı, çağıran red sayar ama kalıcı karar yazmaz.
  DD.sistemUyari = (o = {}) => new Promise(coz => {
    const p = o.platform === 'android' ? 'android' : 'ios';
    const kat = document.getElementById('dd-katman') || document.body;
    const kap = document.createElement('div');
    kap.className = `dd-bistem is-uyari is-${p === 'android' ? 'android-uyari' : 'ios-uyari'}`;
    kap.dataset.hal = 'uyari';
    kap.setAttribute('role', 'alertdialog'); kap.setAttribute('aria-modal', 'true'); kap.setAttribute('aria-label', o.baslik || '');
    kap.innerHTML = `<div class="dd-bistem-perde"></div><div class="dd-bistem-kutu" tabindex="-1"><div class="dd-bistem-ic"><b class="dd-bistem-baslik">${esc(o.baslik || '')}</b>${o.metin ? `<p>${esc(o.metin)}</p>` : ''}</div><div class="dd-bistem-ikili"><button type="button" class="dd-bistem-dugme is-ikincil" data-uyari="0">${esc(o.red || 'İzin Verme')}</button><button type="button" class="dd-bistem-dugme" data-uyari="1">${esc(o.ver || 'İzin Ver')}</button></div></div>`;
    kat.append(kap);
    const onceki = document.activeElement;
    kap.querySelector('.dd-bistem-kutu').focus({preventScroll: true});
    let bitti = false;
    const gec = () => kapat(null);
    addEventListener('hashchange', gec); addEventListener('popstate', gec);
    const kapat = v => {
      if (bitti) return; bitti = true;
      removeEventListener('hashchange', gec); removeEventListener('popstate', gec);
      kap.classList.add('is-cikis');
      setTimeout(() => { kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(v); }, DD.azHareket() ? 0 : DD.TK.motion.base);
    };
    kap.addEventListener('click', ev => { const b = ev.target.closest('[data-uyari]'); if (b) kapat(b.dataset.uyari === '1'); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape') kapat(false); });
  });
})();
