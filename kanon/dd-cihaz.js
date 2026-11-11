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
 *   DD.anaEkran({widgetlar:[html], uygulama:{ad, gorsel}|false, simge, simgeler:[{ikon, renk}], dockSimgeler, tarih, ara, dock, pasif}) dört sütunlu simge ızgarası: widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4),
 *     simgeler: markasız genel simge yerleri (cam kare + Font Awesome glifi, renk Diet token adı: primary, bilgi, karb, protein, lif, slate…),
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
 * Widget: eski aile (DD.widget, DD.widgetKalori/Su/Oruc/Ogun/Diyetisyen, DD.widgetDugme) W2'de kaldırıldı; yerine Widget v2 (DD.wg*, aşağıda bölüm başında).
 *   DD.kilitWidget({tur:'daire'|'dikdortgen'|'satir', ikon, deger, oran, baslik, metin, sayac, alt, ac, aria}) iOS kilit ekranı widget'ı (tek renk; duvar:'gorsel'
 *     çerçevede kilit ekranı tonunda: iOS vibrant görünümü, uygulama rengi değil).
 * Kilit ekranı (W2; çerçeve: DD.telefonCerceve({duvar:'gorsel', sigdir:true, kilit:{tarih, satir, aksesuar, acik}}), acik: Face ID ile açılmış kilit simgesi)
 *   DD.canliOgunKarti({ogunler:[{id, ad, kcal, planKcal, durum:'dolu'|'bos'|'atlandi', oran, gorsel, ayir, siradaki, yeni, eylem:{kod, id}|{ac}}], kalan, oncekiKalan,
 *     seri:{sayi, bugun, yeni}, ac, acDugme (rota: başlıkta "Aç" hapı), alt, sinif}) kalan null: "Kalori hedefin yok" tek satır günlük öğün Live Activity kartı: kalan kalori (oncekiKalan verilirse sayı ondan akar: data-lo-eski/-yeni),
 *     seri alevi (bugün sayılmadıysa sönük), 4 öğün halkası (öğün rengi, illüstrasyon, "+" ya da onay); "+" = App Intent Button (data-wg-eylem + data-id).
 *   DD.canliOrucKarti({baslik, faz, kalanSn, kalanMetin, oran, bas, bit, isaretler:[0–1], eylem:{kod|ac, metin, aria}, bitti:{baslik, metin}, ac, sinif})
 *     oruç Live Activity kartı: kalan süre geri sayar, renkli ilerleme ve faz işaretleri, "Bitir".
 *   DD.canliIzinSatiri({uygulama, kapaniyor}) iOS'un ilk Canlı Etkinlik izin satırı (İzin Verme / İzin Ver → data-wg-izin="red"|"ver"); kartın alt'ına verilir.
 *   DD.kilitBildirim({ogeler:[{baslik, metin, zaman, ac, kisi:{harf}}], acik, yeni}) bildirim yığını (data-kb-yigin açar/kapar). DD.kilitAlt([html]) alt yarı yuvası.
 *   DD.telefonSigdir(kok) → durdur: is-sigdir çerçevelerinin yüksekliğini görünür alana göre tutar. DD.OGUN_GORSEL {kahvalti, ogle, aksam, ara} illüstrasyonlar.
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
  const DD = window.DD, {esc, ik, vurgu, sayi, kisit, sure} = DD;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png';
  const iki = n => String(n).padStart(2, '0');

  // ---------- Süre: ileri (geçen) ya da geri (kalan) saniye saniye akar; başlangıç damgası, kayma yok ----------
  const sureMetin = (sn, bicim) => {
    sn = Math.max(0, Math.floor(sn));
    const s = Math.floor(sn / 3600), d = Math.floor(sn / 60) % 60;
    // kisa ve dk: sistem sayacı gibi; bir saatin altında dakika:saniye (0:42, 12:05), üstünde saat:dakika:saniye (3:10:22). İlk dakikada da akar.
    if (bicim === 'dakika') return String(Math.ceil(sn / 60));   // minimal ada: kalan dakika
    if (bicim === 'sa') { const t = Math.ceil(sn / 60); return `${Math.floor(t / 60)}:${iki(t % 60)}`; }   // küçük halka: saat:dakika
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
    ? `<div class="dd-tel-kilit"><span class="dd-tel-kilit-ikon" aria-hidden="true">${ik(o.kilit.acik ? 'lock-open' : 'lock')}</span><small>${esc(o.kilit.tarih || '')}${o.kilit.satir ? `<span class="dd-tel-kilit-satir">${o.kilit.satir}</span>` : ''}</small><b>${esc(o.saat || '')}</b>${o.kilit.aksesuar?.length ? `<span class="dd-tel-kilit-aks">${o.kilit.aksesuar.join('')}</span>` : ''}</div>`
    : `<div class="dd-tel-kilit"><b>${esc(o.saat || '')}</b><small>${esc(o.kilit.tarih || '')}</small></div>`;
  // El feneri (iOS kilit ekranı sol alt denetimi): Font Awesome Free'de fener yok; kanon glifi, renk currentColor.
  const FENER = '<svg class="dd-tel-fener" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M8.2 2h7.6A1.2 1.2 0 0 1 17 3.2V6l-2 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5V10L7 6V3.2A1.2 1.2 0 0 1 8.2 2zM7.6 5.1h8.8v1.1H7.6zM12 12.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6z"/></svg>';
  const tepe = o => (o.platform === 'ios' ? `<span class="${liste('dd-tel-ada', o.adaMin && 'is-bolunmus')}">${o.ada || ''}</span>${o.adaMin ? `<span class="dd-tel-ada-min">${o.adaMin}</span>` : ''}` : '<span class="dd-tel-delik"></span>');
  // duvar:'gorsel' gerçek duvar kâğıdı (assets/gorsel/telefon, temaya göre) ve kilit ekranı tonu; sigdir: telefonun tamamı görünür alana sığar (DD.telefonSigdir).
  const kok = (o, ek) => liste('dd-tel', `is-${o.platform || 'ios'}`, `is-${o.tema || 'acik'}`, o.yatay && 'is-yatay', o.duvar === 'gorsel' && 'is-duvar-gorsel', o.sigdir && 'is-sigdir', ek, o.sinif);
  // etkilesimli: içinde dokunulabilir widget ya da kutucuk varsa çerçeve resim değil gruptur (role=group); yoksa role=img.
  const rol = o => (o.etkilesimli ? 'role="group"' : 'role="img"');
  DD.telefonCerceve = (o = {}) => {
    const p = o.platform || 'ios';
    // Yatay (StandBy): durum çubuğu ve alt çubuk yok, ada solda dikey.
    if (o.yatay) return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-ada is-dikey"></span><div class="dd-tel-icerik">${o.icerik || ''}</div></div></div></figure>`;
    return `<figure class="${kok({...o, platform: p})}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}<div class="${liste('dd-tel-icerik', o.kilit && 'is-kilit')}">${o.kilit ? kilitBas({...o, platform: p}) : ''}${o.icerik || ''}</div>${o.kilit && p === 'android' ? `<span class="dd-tel-parmak" aria-hidden="true">${ik('fingerprint')}</span>` : ''}${o.kilit && p === 'ios' ? `<span class="dd-tel-kilit-dugmeler" aria-hidden="true"><span>${FENER}</span><span>${ik('camera')}</span></span>` : ''}<span class="dd-tel-cubuk"></span></div></div></figure>`;
  };
  DD.cihazKesit = (o = {}) => {
    const p = o.platform || 'ios';
    return `<figure class="${kok({...o, platform: p}, 'is-kesit')}" ${rol(o)} aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}${o.icerik ? `<div class="dd-tel-icerik">${o.icerik}</div>` : ''}</div></div></figure>`;
  };
  // Ana ekran: dört sütunlu simge ızgarası. Widget hücre kaplar (küçük 2×2, orta 4×2, büyük 4×4); boş hücrelere uygulama simgesi ve
  // nötr simge yerleri gelir (başka uygulamanın logosu çizilmez). simge: boş simge yeri sayısı.
  DD.anaEkran = (o = {}) => `<div class="${liste('dd-tel-ana', o.sinif)}"${o.pasif ? ' inert aria-hidden="true"' : ''}>${o.tarih ? `<p class="dd-tel-gun">${esc(o.tarih)}</p>` : ''}<div class="dd-tel-izgara">${(o.widgetlar || []).join('')}${o.uygulama === false ? '' : `<span class="dd-tel-uyg"><img src="${esc(o.uygulama?.gorsel || SIMGE)}" alt=""><small>${esc(o.uygulama?.ad || 'Dada Diet')}</small></span>`}${'<span class="dd-tel-uyg is-bos" aria-hidden="true"><i></i></span>'.repeat(o.simge || 0)}${(o.simgeler || []).map(x => `<span class="dd-tel-uyg is-simge" aria-hidden="true"><i style="--sg:var(--dd-${esc(x.renk || 'slate')})">${ik(x.ikon)}</i>${x.ad ? `<small>${esc(x.ad)}</small>` : ''}</span>`).join('')}</div>${o.ara === false ? '' : `<span class="dd-tel-ara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span></span>`}${o.dock ? `<span class="${liste('dd-tel-dock', o.dockSimgeler && 'is-simgeli')}" aria-hidden="true">${o.dockSimgeler ? o.dockSimgeler.map(x => `<span class="dd-tel-uyg is-simge"><i style="--sg:var(--dd-${esc(x.renk || 'slate')})">${ik(x.ikon)}</i></span>`).join('') : '<i></i>'.repeat(4)}</span>` : ''}</div>`;
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
  // Telefonun tamamı görünür alana sığsın (kaydırmadan): .dd-tel.is-sigdir için kaydırma alanındaki konumundan kalan yüksekliği --tel-yuk olarak yazar;
  // genişlik CSS'te bu yükseklikten (9:19,5) hesaplanır. Çok kısa pencerede alt sınır 520 (telefon okunaksız küçülmez). Durdurma işlevi döner.
  DD.telefonSigdir = kok => {
    const pay = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dd-s-12')) || 12;
    const ayarla = () => kok.querySelectorAll('.dd-tel.is-sigdir').forEach(el => {
      const sc = el.closest('[data-scroll]'), r = el.getBoundingClientRect();
      const ustY = sc ? r.top - sc.getBoundingClientRect().top + sc.scrollTop : r.top + scrollY, gorH = sc ? sc.clientHeight : innerHeight;
      const yuk = `${Math.round(Math.max(gorH - ustY - pay(), 520))}px`;
      if (el.style.getPropertyValue('--tel-yuk') !== yuk) el.style.setProperty('--tel-yuk', yuk);
    });
    const sc = kok.querySelector('[data-scroll]') || kok.closest('[data-scroll]');
    const ro = new ResizeObserver(ayarla);
    if (sc) ro.observe(sc);
    const mo = new MutationObserver(ayarla);
    mo.observe(kok, {childList: true, subtree: true});
    addEventListener('resize', ayarla);
    ayarla();
    return () => { ro.disconnect(); mo.disconnect(); removeEventListener('resize', ayarla); };
  };

  // ---------- Canlı etkinlik ----------
  // durum: 'oruc'|'pencere' (Ritim sayacı) ya da 'randevu' (diyetisyen görüşmesi: kalanSn geri sayar, kisi, harf, eylem düğmesi).
  // Android bildirim eylemi (yalnız asıl eylem; bildirime dokunmak uygulamayı zaten açar). Dokunma hedefi 48 dp.
  const canliEylem = o => (!o.eylem ? '' : o.eylemKod || o.eylemAc
    ? `<button type="button"${o.eylemKod ? ` data-wg-eylem="${esc(o.eylemKod)}"` : ` data-wg-ac="${esc(o.eylemAc)}"`}>${esc(o.eylem)}</button>` : `<span>${esc(o.eylem)}</span>`);
  // W2: yalnız Android kalıcı bildirimi kaldı (görüşme; oruç ve günlük kart için DD.androidCanli). iPhone kilit ekranı kartları: DD.canliOgunKarti, DD.canliOrucKarti, DD.canliRandevuKarti.
  DD.canliEtkinlik = (o = {}) => {
    const d = o.durum || 'oruc', yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100), randevu = d === 'randevu';
    return `<div class="${liste('dd-canli', 'is-android', `is-${d}`)}">
        <div class="dd-canli-ust"><span class="dd-canli-glif" aria-hidden="true">${ik(RITIM_IKON[d])}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(o.etiket || 'Ritim')}</span><span aria-hidden="true">·</span>${randevu ? DD.cihazGeriSayac(o.kalanSn) : DD.cihazSayac(o.gecenSn)}</div>
        <div class="dd-canli-govde"><div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(randevu ? `${o.kisi || ''} · ${o.saat || ''}` : `${o.kalanMetin}${yuzde ? ` · %${yuzde}` : ''} · bitiş ${o.bit || ''}`)}</small></div><img src="${SIMGE}" alt=""></div>
        ${randevu ? '' : DD.cihazCubuk({tur: d, oran: o.oran})}
        ${o.eylem ? `<div class="dd-canli-eylemler">${canliEylem(o)}</div>` : ''}
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

  // ---------- Kilit ekranı widget'ları (iOS accessory; tek renk, kilit ekranı yazı rengine uyar) ----------
  // tur: 'daire' (accessoryCircular: halka + ikon + değer), 'dikdortgen' (accessoryRectangular: başlık, metin, isteğe bağlı çubuk), 'satir' (accessoryInline: tarih satırında ikon + kısa metin).
  // iOS 17+ accessory widget'lar Button taşıyabilir; bu katalogda kilit ekranı widget'ları bilgi gösterir, dokunmak uygulamayı açar (ac).
  DD.kilitWidget = (o = {}) => {
    const t = o.tur || 'daire', ac = o.ac ? ` data-wg-ac="${esc(o.ac)}"` : '';
    if (t === 'satir') return `<button type="button" class="dd-kw is-satir"${ac} aria-label="${esc(o.aria || o.metin)}">${ik(o.ikon)}<span>${esc(o.metin)}</span></button>`;
    if (t === 'dikdortgen') return `<button type="button" class="dd-kw is-dikdortgen"${ac} aria-label="${esc(o.aria || `${o.baslik}, ${o.metin}`)}"><b>${ik(o.ikon)}<span>${esc(o.baslik)}</span></b><span>${o.sayac || esc(o.metin)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.oran != null ? `<span class="dd-kw-cubuk" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}"><i></i></span>` : ''}</button>`;
    return `<button type="button" class="dd-kw is-daire"${ac} aria-label="${esc(o.aria || o.deger)}">${DD.cihazHalka({tur: 'kilit', oran: o.oran ?? 0, boyut: 'kw', orta: `${ik(o.ikon)}<b>${esc(o.deger)}</b>`})}</button>`;
  };

  // ---------- Kilit ekranı (W2): Canlı Etkinlik kartları, izin satırı, bildirim yığını ----------
  // Kartlar iOS 17+ Live Activity kilit ekranı sunumudur (≤ 160 pt). Düğmeler App Intent Button karşılığı: data-wg-eylem (+ data-id) kaydı yazar,
  // data-wg-ac uygulamayı açar; kartın kendisine dokunmak (widgetURL) uygulamayı açar. Görseller assets/gorsel/telefon (Higgsfield, metinsiz).
  const TG = 'assets/gorsel/telefon/';
  DD.OGUN_GORSEL = {kahvalti: `${TG}kahve.webp`, ogle: `${TG}corba.webp`, aksam: `${TG}salata.webp`, ara: `${TG}elma.webp`};
  const ALEV = `${TG}alev.webp`;
  const lacKapak = (ac, etiket) => (ac ? `<button type="button" class="dd-lac-ac" data-wg-ac="${esc(ac)}" aria-label="${esc(etiket)}"></button>` : '');
  const lacMarka = (ikon, metin) => `<span class="dd-lac-marka"><span class="dd-lac-glif" aria-hidden="true">${ik(ikon)}</span><span>${esc(metin)}</span></span>`;
  // Öğün halkası: renk öğünün (is-<id>), oran yenen/planlı (dolu = 1). eylem {kod, id} kaydı yazar, {ac} uygulamayı açar (misafir: plan öğünü yok, ne yediğini uygulamada ekler).
  const ogunHalka = x => {
    const dolu = x.durum === 'dolu', atlandi = x.durum === 'atlandi', oran = kisit(dolu ? x.oran ?? 1 : 0, 0, 1);
    const ic = `<span class="dd-lo-halka" aria-hidden="true"><span class="dd-lo-iz"></span>${oran > 0 ? '<span class="dd-lo-yay"></span>' : ''}<img src="${esc(x.gorsel || DD.OGUN_GORSEL[x.id] || DD.OGUN_GORSEL.ara)}" alt=""><span class="dd-lo-rozet">${ik(dolu ? 'check' : atlandi ? 'minus' : 'plus')}</span></span><b>${esc(x.ad)}</b><small>${atlandi ? 'Atlandı' : `${sayi(dolu ? x.kcal || 0 : 0)} kcal`}</small>`;
    const sinif = liste('dd-lo-ogun', `is-${x.id}`, dolu && 'is-dolu', atlandi && 'is-atlandi', x.siradaki && 'is-siradaki', x.ayir && 'is-ayrik', x.yeni && 'is-yeni');
    const stil = `style="--cih-o:${oran.toFixed(3)}"`;
    if (!dolu && !atlandi && x.eylem?.kod) return `<button type="button" class="${sinif}" ${stil} data-wg-eylem="${esc(x.eylem.kod)}" data-id="${esc(x.eylem.id || x.id)}" aria-label="${esc(`${x.ad} ekle${x.planKcal ? `, ${sayi(x.planKcal)} kcal` : ''}${x.siradaki ? ', sıradaki öğün' : ''}`)}">${ic}</button>`;
    if (!dolu && !atlandi && x.eylem?.ac) return `<button type="button" class="${sinif}" ${stil} data-wg-ac="${esc(x.eylem.ac)}" aria-label="${esc(`${x.ad} ekle, Dada Diet’te açılır`)}">${ic}</button>`;
    return `<span class="${sinif}" ${stil} role="img" aria-label="${esc(`${x.ad}: ${dolu ? `kaydedildi, ${sayi(x.kcal || 0)} kcal` : atlandi ? 'atlandı' : 'henüz eklenmedi'}`)}">${ic}</span>`;
  };
  // seri: {sayi, bugun (bugün sayıldı mı), yeni (sayı bu dokunuşla arttı)}
  const seriRozet = s => `<span class="${liste('dd-lo-seri', !s.bugun && 'is-sonuk', s.yeni && 'is-yeni')}" role="img" aria-label="${esc(!s.sayi && !s.bugun ? 'Seri henüz başlamadı' : `${s.sayi} günlük seri${s.bugun ? '' : ', bugün henüz sayılmadı'}`)}"><img src="${ALEV}" alt=""><b>${sayi(s.sayi || 0)}</b></span>`;
  DD.canliOgunKarti = (o = {}) => {
    const l = o.ogunler || [], s = o.seri || {sayi: 0}, n = l.filter(x => x.durum === 'dolu').length;
    const alt = !s.sayi && !s.bugun ? 'Seri’ni başlat!' : !s.bugun ? 'Seriyi sürdür!' : `${n} / ${l.length} öğün`;
    const kalan = o.kalan == null ? '' : `<b class="${liste('dd-lo-kalan', o.oncekiKalan != null && 'is-yeni')}"${o.oncekiKalan != null ? ` data-lo-eski="${esc(Math.max(0, o.oncekiKalan))}" data-lo-yeni="${esc(Math.max(0, Math.abs(o.kalan)))}"` : ''}>${sayi(Math.abs(o.kalan))}</b>`;
    const etiket = `Dada Diet, günün öğünleri: ${o.kalan == null ? 'hedef yok' : o.kalan >= 0 ? `${sayi(o.kalan)} kcal kaldı` : `${sayi(-o.kalan)} kcal fazla`}, ${n} / ${l.length} öğün`;
    return `<section class="${liste('dd-lac', 'is-ogun', o.eski && 'is-eski', o.sinif)}" aria-label="${esc(`${etiket}${o.eski ? `, son güncelleme ${o.eski}` : ''}`)}">${lacKapak(o.ac, 'Dada Diet’te Bugün’ü aç')}
      <div class="dd-lac-ic">
        <div class="dd-lo-bas"><span class="dd-lo-ozet">${kalan}<span class="${liste('dd-lo-birim', o.kalan == null && 'is-yok')}"><small>${o.kalan == null ? 'Kalori hedefin yok' : o.kalan < 0 ? 'kcal fazla' : 'kcal kaldı'}</small><small>${o.eski ? `${ik('clock-rotate-left')} ${esc(`Son güncelleme ${o.eski}`)}` : esc(o.kalan == null ? 'Hedefini Dada Diet’te belirle' : alt)}</small></span></span><span class="dd-lo-sag">${seriRozet(s)}${o.acDugme ? `<button type="button" class="dd-lac-dugme is-ac" data-wg-ac="${esc(o.acDugme)}" aria-label="Dada Diet’i aç"><span>Aç</span></button>` : ''}</span></div>
        <div class="dd-lo-ogunler">${l.map(ogunHalka).join('')}</div>
      </div>${o.alt || ''}
    </section>`;
  };
  // Oruç kartı: kalanSn geri sayar (ActivityKit Text(timerInterval:)); oran ilerleme; isaretler: faz sınırları (0–1); eylem {kod}|{ac} "Bitir".
  // bitti: {baslik, metin} bitiş içeriği (sayaç durur, kart kısa süre kalır).
  DD.canliOrucKarti = (o = {}) => {
    const oran = kisit(o.oran || 0, 0, 1), yuzde = Math.round(oran * 100);
    const dugme = o.bitti || !o.eylem ? '' : `<button type="button" class="dd-lac-dugme"${o.eylem.kod ? ` data-wg-eylem="${esc(o.eylem.kod)}"` : ` data-wg-ac="${esc(o.eylem.ac)}"`} aria-label="${esc(o.eylem.aria || 'Orucu bitir')}">${ik('stop')}<span>${esc(o.eylem.metin || 'Bitir')}</span></button>`;
    const cubuk = `<span class="dd-lr-cubuk" style="--cih-o:${(o.bitti ? 1 : oran).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="dd-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
    const govde = o.bitti
      ? `<div class="dd-lr-sure is-bitti"><span class="dd-lr-tik" aria-hidden="true">${ik('check')}</span><span class="dd-lr-sayac"><b>${esc(o.bitti.baslik)}</b><small>${esc(o.bitti.metin || '')}</small></span></div>`
      : `<div class="dd-lr-sure"><span class="dd-lr-sayac">${o.kalanSn > 0 ? `<b>${DD.cihazGeriSayac(o.kalanSn)}</b><small>kaldı</small>` : `<b>Hedefine ulaştın</b>`}</span><span class="dd-lr-bitis"><small>Bitiş</small><b>${esc(o.bit || '')}</b></span></div>`;
    const etiket = o.bitti ? `Dada Diet, oruç: ${o.bitti.baslik}` : `Dada Diet, oruç: ${o.kalanMetin || ''}, bitiş ${o.bit || ''}, yüzde ${yuzde}`;
    return `<section class="${liste('dd-lac', 'is-oruc', o.bitti && 'is-bitti', o.eski && 'is-eski', o.sinif)}" aria-label="${esc(`${etiket}${o.eski ? `, son güncelleme ${o.eski}` : ''}`)}">${lacKapak(o.ac, 'Dada Diet’te Ritim’i aç')}
      <div class="dd-lac-ic">
        <div class="dd-lac-bas">${lacMarka('hourglass-half', o.baslik || 'Oruç')}${o.eski ? `<small>${ik('clock-rotate-left')} ${esc(o.eski)}</small>` : o.faz ? `<small>${esc(o.faz)}</small>` : ''}${dugme}</div>
        ${govde}${cubuk}
        <div class="dd-lr-alt"><span>${esc(o.bas ? `Başlangıç ${o.bas}` : '')}</span><span>${o.bitti ? '' : `%${yuzde}`}</span></div>
      </div>
    </section>`;
  };
  // Görüşme kartı (diyetisyen görüşmesi): kalan süre geri sayar, "Görüşmeye katıl" uygulamayı görüşmede açar (eylem.ac).
  DD.canliRandevuKarti = (o = {}) => `<section class="dd-lac is-randevu" aria-label="${esc(`Dada Diet, ${o.baslik || 'görüşme'}: ${o.kisi || ''}, başlangıç ${o.saat || ''}`)}">${lacKapak(o.ac || '#/uzman', 'Dada Diet’te Uzmanım’ı aç')}
      <div class="dd-lac-ic">
        <div class="dd-lac-bas">${lacMarka('video', 'Görüşme')}<small>${esc([o.tur, o.saat ? `başlangıç ${o.saat}` : ''].filter(Boolean).join(' · '))}</small></div>
        <div class="dd-lr-sure"><span class="dd-w2-kisi"><span class="dd-w2-avatar" aria-hidden="true">${esc(o.harf || '')}</span><span><b>${esc(o.baslik || '')}</b><small>${esc(o.kisi || '')}</small></span></span><span class="dd-lr-sayac is-randevu"><b>${DD.cihazGeriSayac(o.kalanSn || 0)}</b><small>kaldı</small></span></div>
        ${o.eylem ? `<button type="button" class="dd-lac-dugme is-tam"${o.eylem.ac ? ` data-wg-ac="${esc(o.eylem.ac)}"` : ''} aria-label="Görüşmeye katıl">${ik('video')}<span>Görüşmeye katıl</span></button>` : ''}
      </div>
    </section>`;
  // iOS'un ilk Canlı Etkinlik izni: kartın altında sistem satırı (marka rengi yok). data-wg-izin="red"|"ver" (ekran dinler). kapaniyor: verildi, satır kapanır.
  DD.canliIzinSatiri = (o = {}) => `<div class="${liste('dd-lizin', o.kapaniyor && 'is-kapaniyor')}"${o.kapaniyor ? ' aria-hidden="true"' : ''}><div class="dd-lizin-ic"><p>${esc(`${o.uygulama || 'Dada Diet'} Canlı Etkinlikleri’ne İzin Verilsin mi?`)}</p><div class="dd-lizin-dugmeler"><button type="button" data-wg-izin="red"${o.kapaniyor ? ' tabindex="-1"' : ''}>İzin Verme</button><button type="button" data-wg-izin="ver"${o.kapaniyor ? ' tabindex="-1"' : ''}>İzin Ver</button></div></div></div>`;
  // Bildirim yığını (iOS 16+ kilit ekranı, "Yığın" düzeni): en yeni üstte; kapalıyken arkadakiler kenar olarak görünür, dokununca açılır (data-kb-yigin).
  // ogeler:[{baslik, metin, zaman, ac, kisi:{harf}|null}] kisi: iletişim bildirimi (gönderen baş harfi + uygulama simgesi rozeti).
  DD.kilitBildirim = (o = {}) => {
    const l = o.ogeler || [], acik = o.acik || l.length < 2;
    if (!l.length) return '';
    const ikon = x => (x.kisi ? `<span class="dd-kb-ikon is-kisi" aria-hidden="true"><span>${esc(x.kisi.harf || '')}</span><img src="${SIMGE}" alt=""></span>` : `<span class="dd-kb-ikon" aria-hidden="true"><img src="${SIMGE}" alt=""></span>`);
    const oge = (x, i) => {
      const ic = `${ikon(x)}<span class="dd-kb-metin"><span class="dd-kb-bas"><b>${esc(x.baslik)}</b><small>${esc(x.zaman || '')}</small></span><span class="dd-kb-govde">${esc(x.metin)}</span></span>`;
      return acik && x.ac ? `<li><button type="button" class="dd-kb-oge" data-wg-ac="${esc(x.ac)}" aria-label="${esc(`${x.baslik}, ${x.zaman || ''}: ${x.metin}`)}">${ic}</button></li>` : `<li${!acik && i ? ' aria-hidden="true"' : ''}><span class="dd-kb-oge">${ic}</span></li>`;
    };
    return `<div class="${liste('dd-kb', acik ? 'is-acik' : 'is-yigin', l.length > 2 && 'is-cok', o.yeni && 'is-yeni')}">
      ${l.length > 1 && acik ? `<div class="dd-kb-ust"><b>Bildirimler</b><button type="button" class="dd-kb-az" data-kb-yigin aria-expanded="true">${ik('chevron-up')}<span>Daha az</span></button></div>` : ''}
      <ul class="dd-kb-liste">${l.map(oge).join('')}</ul>
      ${acik ? '' : `<button type="button" class="dd-kb-yigin" data-kb-yigin aria-expanded="false" aria-label="${esc(`${l.length} bildirim; en yenisi ${l[0].baslik}. Hepsini göster`)}"></button>`}
    </div>`;
  };
  // Kartlar ve bildirimler kilit ekranının alt yarısında, fener/kamera sırasının üstünde toplanır.
  DD.kilitAlt = (l = []) => (l.filter(Boolean).length ? `<div class="dd-kalt">${l.filter(Boolean).join('')}</div>` : '');

  // ---------- Widget v2 (W2 b–e): ana ekran (iOS WidgetKit / Android Material You), StandBy, Dinamik Ada ----------
  // Kilit ekranı kartlarıyla aynı dil: öğün/metrik rengi (token --dd-metrik-*, --dd-ogun-*), illüstrasyon, cam yüzey, renkli halka, "+" rozeti.
  // Boylar (iPhone 393 pt): küçük 158×158, orta 338×158, büyük 338×354 (ızgarada 2×2, 4×2, 4×4). Android aynı hücreler, Material You yüzeyi (CSS).
  // Düğmeler App Intent Button / Glance eylemi: data-wg-eylem (+ data-id); uygulamayı açan bağlantılar ve gövde data-wg-ac. Olayları ekran dinler.
  // renk: kalori | su | oruc | protein | karb | yag | seri | pencere
  const rh = (renk, oran, orta = '', boy = 'md', ek = '') => `<span class="${liste('dd-rh', `is-${renk}`, `is-${boy}`, ek)}" style="--cih-o:${kisit(oran || 0, 0, 1).toFixed(3)}" aria-hidden="true"><i class="dd-rh-iz"></i>${oran > 0 ? '<i class="dd-rh-yay"></i>' : ''}${orta ? `<span class="dd-rh-orta">${orta}</span>` : ''}</span>`;
  DD.renkHalka = (o = {}) => rh(o.renk || 'kalori', o.oran, o.orta, o.boy, o.sinif);
  const w2Dugme = d => `<button type="button" class="${liste('dd-w2-dugme', d.ton && `is-${d.ton}`, d.tam && 'is-tam', d.yalniz && 'is-yalniz')}"${d.kod ? ` data-wg-eylem="${esc(d.kod)}"${d.id ? ` data-id="${esc(d.id)}"` : ''}` : ` data-wg-ac="${esc(d.ac || '')}"`} aria-label="${esc(d.aria || d.metin)}">${ik(d.ikon || 'plus')}${d.yalniz ? '' : `<span>${esc(d.metin)}</span>`}</button>`;
  DD.w2Dugme = w2Dugme;
  const w2Bas = (ikon, metin, renk, sag = '') => `<span class="${liste('dd-w2-bas', `is-${renk}`)}">${ikon.startsWith('<') ? ikon : ik(ikon)}<b>${esc(metin)}</b>${sag ? `<small>${sag}</small>` : ''}</span>`;
  // eski: çevrimdışı; son veri soluk durur, sağ üstte son güncelleme saati (widget yeniden çizilemedi). hal: 'giris' | 'pro' (w2Hal).
  DD.w2Kabuk = (o = {}) => `<div class="${liste('dd-w2', `is-${o.boy || 'kucuk'}`, `is-${o.tur || 'ozet'}`, o.eski && 'is-eski', o.sinif)}">${o.ac ? `<button type="button" class="dd-w2-ac" data-wg-ac="${esc(o.ac)}" aria-label="${esc(`${o.etiket || ''}${o.eski ? `. Son güncelleme ${o.eski}` : ''}`)}"></button>` : ''}<div class="dd-w2-ic">${o.eski ? `<small class="dd-w2-damga" aria-hidden="true">${ik('clock-rotate-left')}${esc(o.eski)}</small>` : ''}${o.icerik || ''}</div></div>`;
  // Giriş yok: tek mesaj, gövde #/giris açar, düğme yok. Pro'ya özel: Dada Diet Pro + DDV.uye.pro rozeti ("Yakında") ve durum metni, pasif; gövde #/pro açar.
  // Hangi widget'ın Pro'ya özel olacağı ürün kararı bekliyor (Pro satışta değil); ekran örneği tek widget'ta gösterir.
  const w2Hal = (o, tur, ikon, ad, renk) => {
    const boy = o.boy || 'kucuk';
    if (o.hal === 'giris') return DD.w2Kabuk({boy, tur, ac: '#/giris', sinif: 'is-hal', etiket: `${ad}: giriş yap`, icerik: `${w2Bas(ikon, ad, renk)}${yok('right-to-bracket', 'Giriş yap', boy === 'kucuk' ? '' : 'Günün burada görünsün', '#/giris', boy === 'kucuk' ? '' : 'Giriş yap')}`});
    if (o.hal === 'pro') return DD.w2Kabuk({boy, tur, ac: '#/pro', sinif: 'is-hal is-pro', etiket: `${ad}: Dada Diet Pro ile açılacak, ${o.pro?.rozet || ''}`, icerik: `${w2Bas(ikon, ad, renk)}<span class="dd-w2-iskelet" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="dd-w2-yok">${ik('bolt')}<b>Dada Diet Pro</b><span class="dd-w2-rozet is-pro">${esc(o.pro?.rozet || '')}</span>${boy === 'kucuk' ? '' : `<small>${esc(o.pro?.metin || '')}</small>`}</span>`});
    return null;
  };
  const L = ml => `${(ml / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} L`;
  const yok = (ikon, baslik, metin, ac, dugme) => `<span class="dd-w2-yok">${ik(ikon)}<b>${esc(baslik)}</b>${metin ? `<small>${esc(metin)}</small>` : ''}${dugme ? w2Dugme({ac, ikon: 'arrow-right', metin: dugme, ton: 'ikincil'}) : ''}</span>`;
  const MAKRO_AD = [['P', 'Protein', 'protein'], ['K', 'Karbonhidrat', 'karb'], ['Y', 'Yağ', 'yag']];
  const makroSatirlari = m => `<span class="dd-w2-makrolar">${MAKRO_AD.map(([k, ad, r]) => { const x = m[k]; return `<span class="${liste('dd-w2-makro', `is-${r}`)}"><span><b>${ad}</b><small>${sayi(Math.round(x.alinan))} / ${sayi(x.hedef)} g</small></span><span class="dd-w2-cubuk is-${r}" style="--cih-o:${kisit(x.alinan / (x.hedef || 1), 0, 1).toFixed(3)}"><i></i></span></span>`; }).join('')}</span>`;
  const makroHalkalari = m => `<span class="dd-w2-mhalkalar">${MAKRO_AD.map(([k, ad, r]) => { const x = m[k]; return `<span class="dd-w2-mhalka">${rh(r, x.alinan / (x.hedef || 1), `<b>${sayi(Math.round(x.alinan))}</b>`, 'sm')}<small>${ad === 'Karbonhidrat' ? 'Karb.' : ad}</small></span>`; }).join('')}</span>`;
  const suSatir = (s, eylem) => `<span class="dd-w2-susatir">${ik('droplet')}<span><b>${sayi(s.icilen)}</b><small>/ ${sayi(s.hedef)} ml</small></span><span class="dd-w2-cubuk is-su" style="--cih-o:${kisit(s.icilen / (s.hedef || 1), 0, 1).toFixed(3)}"><i></i></span>${eylem ? w2Dugme({...eylem, ikon: 'plus', metin: `${sayi(s.bardak || 200)} ml`, aria: `Bir bardak su ekle, ${sayi(s.bardak || 200)} ml`, ton: 'su'}) : ''}</span>`;
  const kalanOrta = (kalan, boy) => (kalan < 0 ? `<b>+${sayi(-kalan)}</b><small>fazla</small>` : `<b>${sayi(kalan)}</b><small>${boy === 'kucuk' ? 'kaldı' : 'kcal kaldı'}</small>`);

  // Günün özeti: kalan kalori halkası; orta: makro çubukları; büyük: + dört öğün ("+") ve su (+200 ml).
  DD.wgOzet = (o = {}) => {
    const h_ = w2Hal(o, 'ozet', 'fire-flame-curved', 'Günün özeti', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun';
    if (o.hedef == null) return DD.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket: 'Günün özeti: kalori hedefi yok. Dada Diet’te aç', icerik: `${w2Bas('fire-flame-curved', boy === 'kucuk' ? 'Kalori' : 'Günün özeti', 'kalori')}${yok('bullseye', 'Kalori hedefin yok', boy === 'kucuk' ? '' : 'Hedefini belirle, kalanın burada görünsün', ac, boy === 'kucuk' ? '' : 'Hedef belirle')}`});
    const kalan = o.hedef - o.alinan, oran = o.alinan / o.hedef, n = (o.ogunler || []).filter(x => x.durum === 'dolu').length;
    const etiket = `Günün özeti: ${kalan >= 0 ? `${sayi(kalan)} kcal kaldı` : `${sayi(-kalan)} kcal fazla`}, ${sayi(o.alinan)} / ${sayi(o.hedef)} kcal. Dada Diet’te aç`;
    if (boy === 'kucuk') return DD.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: `${w2Bas('fire-flame-curved', 'Kalori', 'kalori')}<span class="dd-w2-merkez">${rh('kalori', oran, kalanOrta(kalan, boy), 'lg')}</span><small class="dd-w2-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`});
    const ust = `<span class="dd-w2-yan">${rh('kalori', oran, kalanOrta(kalan, boy), 'xl')}<span class="dd-w2-sag">${w2Bas('fire-flame-curved', 'Günün özeti', 'kalori', `${n}/${(o.ogunler || []).length} öğün`)}${o.makro ? makroSatirlari(o.makro) : `<small class="dd-w2-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`}</span></span>`;
    if (boy === 'orta') return DD.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: ust});
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'ozet', ac, etiket, icerik: `${ust}<span class="dd-w2-ayrac"></span><span class="dd-w2-ogunler">${(o.ogunler || []).map(ogunHalka).join('')}</span>${o.su ? suSatir(o.su, o.suEylem) : ''}`});
  };
  // Su: tek dokunuşla +200 ml (App Intent). Küçük: damla halkası + değer + düğme; orta: bardak ızgarası.
  DD.wgSu = (o = {}) => {
    const h_ = w2Hal(o, 'su', 'droplet', 'Su', 'su');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun', hedef = o.hedef || 1, icilen = o.icilen || 0, bardak = o.bardak || 200, kalan = Math.max(0, hedef - icilen);
    const etiket = `Su: ${sayi(icilen)} / ${sayi(hedef)} ml. Dada Diet’te aç`;
    const dugme = o.eylem ? w2Dugme({...o.eylem, ikon: 'plus', metin: `${sayi(bardak)} ml`, aria: `Bir bardak su ekle, ${sayi(bardak)} ml`, ton: 'su', tam: boy === 'kucuk'}) : '';
    const halka = b => rh('su', icilen / hedef, `<img src="${TG}damla.webp" alt="">`, b);
    const deger = `<span class="dd-w2-deger is-su"><b${o.yeni ? ' class="is-yeni"' : ''}>${L(icilen)}</b><small>/ ${L(hedef)}</small></span>`;
    if (boy === 'kucuk') return DD.w2Kabuk({eski: o.eski, boy, tur: 'su', ac, etiket, icerik: `${w2Bas('droplet', 'Su', 'su', `%${Math.round(Math.min(1, icilen / hedef) * 100)}`)}<span class="dd-w2-yan is-sik">${halka('md')}${deger}</span>${dugme}`});
    const n = Math.max(Math.ceil(hedef / bardak), Math.ceil(icilen / bardak)), dolu = icilen / bardak;
    const bardaklar = Array.from({length: n}, (_, i) => `<i class="${liste('dd-w2-bardak', i < Math.floor(dolu) ? 'is-dolu' : i < dolu ? 'is-yarim' : '')}">${ik('glass-water')}</i>`).join('');
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'su', ac, etiket, icerik: `<span class="dd-w2-yan">${halka('xl')}<span class="dd-w2-sag">${w2Bas('droplet', 'Su', 'su')}${deger}<small class="dd-w2-not">${kalan ? `${sayi(kalan)} ml kaldı · ${Math.ceil(kalan / bardak)} bardak` : 'Bugünkü hedef tamam'}</small><span class="dd-w2-bardaklar" aria-hidden="true">${bardaklar}</span>${dugme}</span></span>`});
  };
  // Öğünler: küçük sıradaki öğün; orta dört halka ("+"); büyük satırlar (illüstrasyon, saat, kcal, "+").
  DD.wgOgunler = (o = {}) => {
    const h_ = w2Hal(o, 'ogunler', 'utensils', 'Öğünler', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/bugun', l = o.ogunler || [], n = l.filter(x => x.durum === 'dolu').length;
    const etiket = `Öğünler: ${n} / ${l.length} kayıtlı${o.kalan != null ? `, ${sayi(Math.max(0, o.kalan))} kcal kaldı` : ''}. Dada Diet’te aç`;
    const sag = o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal kaldı` : `${n}/${l.length}`;
    if (boy === 'kucuk') {
      const s = l.find(x => x.siradaki) || l.find(x => x.durum === 'bos');
      if (!s) return DD.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Öğünler', 'kalori', `${n}/${l.length}`)}${yok('circle-check', 'Bugünün öğünleri tamam', o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal kaldı` : '')}`});
      return DD.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Sıradaki', 'kalori', esc(s.saat || ''))}<span class="dd-w2-merkez is-ogun">${ogunHalka({...s, ad: s.ad})}</span><small class="dd-w2-not">${s.planKcal ? `${sayi(s.planKcal)} kcal planlı` : 'Ne yediğini ekle'}</small>`});
    }
    if (boy === 'orta') return DD.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Bugünün öğünleri', 'kalori', sag)}<span class="dd-w2-ogunler">${l.map(ogunHalka).join('')}</span>`});
    const satir = x => {
      const dolu = x.durum === 'dolu', dugme = !dolu && x.durum !== 'atlandi' && x.eylem ? w2Dugme({...(x.eylem.kod ? {kod: x.eylem.kod, id: x.eylem.id || x.id} : {ac: x.eylem.ac}), ikon: 'plus', metin: 'Ekle', aria: `${x.ad} ekle${x.planKcal ? `, ${sayi(x.planKcal)} kcal` : ''}`, ton: 'ogun'}) : `<span class="dd-w2-tik" role="img" aria-label="${esc(dolu ? 'Kaydedildi' : 'Atlandı')}">${ik(dolu ? 'check' : 'minus')}</span>`;
      return `<span class="${liste('dd-w2-ogsatir', `is-${x.id}`, dolu && 'is-dolu', x.siradaki && 'is-siradaki', x.yeni && 'is-yeni')}" style="--cih-o:${dolu ? 1 : 0}"><span class="dd-lo-halka is-satir" aria-hidden="true"><span class="dd-lo-iz"></span>${dolu ? '<span class="dd-lo-yay"></span>' : ''}<img src="${esc(x.gorsel || DD.OGUN_GORSEL[x.id] || DD.OGUN_GORSEL.ara)}" alt=""></span><span class="dd-w2-ogad"><b>${esc(x.tamAd || x.ad)}</b><small>${esc([x.saat, dolu ? `${sayi(x.kcal || 0)} kcal` : x.planKcal ? `${sayi(x.planKcal)} kcal planlı` : ''].filter(Boolean).join(' · '))}</small></span>${dugme}</span>`;
    };
    const ozetler = `<span class="dd-w2-ozetler"><span><small>Kalan</small><b>${o.kalan != null ? `${sayi(Math.max(0, o.kalan))} kcal` : '—'}</b></span><span><small>Öğün</small><b>${n} / ${l.length}</b></span><span><small>Su</small><b>${o.su ? `${L(o.su.icilen)} / ${L(o.su.hedef)}` : '—'}</b></span></span>`;
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'ogunler', ac, etiket, icerik: `${w2Bas('utensils', 'Bugünün öğünleri', 'kalori', sag)}<span class="dd-w2-ogsatirlar">${l.map(satir).join('')}</span>${ozetler}`});
  };
  // Oruç: oruçta kalan süre geri sayar (Text(timerInterval:)), halka ve faz çubuğu, Bitir; başlamamışken hedef süre ve Başlat (ilerleme yok, karar 3).
  DD.wgOruc = (o = {}) => {
    const h_ = w2Hal(o, 'oruc', 'hourglass-half', 'Oruç', 'oruc');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', ac = o.ac || '#/ritim', baslik = `Oruç${o.ad ? ` · ${o.ad}` : ''}`;
    if (o.tur === 'plansiz' || o.tur === 'kapali') return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç: ${o.baslik || 'plan yok'}. Dada Diet’te aç`, icerik: `${w2Bas('hourglass-half', 'Oruç', 'oruc')}${yok('moon', o.baslik || 'Oruç planı yok', boy === 'kucuk' ? '' : o.alt || 'Ritim’de bir plan seç')}`});
    const dugme = o.eylem ? w2Dugme({...o.eylem, ikon: /baslat/.test(o.eylem.kod || '') || o.eylem.ac ? 'play' : 'stop', metin: o.eylem.metin, ton: 'oruc', tam: boy === 'kucuk'}) : '';
    // Bitir'den sonra: onay halkası, süre ve yeniden "Başlat"
    if (o.bitti) return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç bitti, ${o.bitti}`, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="dd-w2-yan is-sik">${rh('pencere', 1, ik('check'), 'md')}<small class="dd-w2-not"><b>Oruç bitti</b><br>${esc(o.bitti)}</small></span>${dugme}`});
    if (o.tur !== 'oruc') {
      const metin = o.tur === 'pencere' ? `Pencere ${o.kapanis}’e kadar` : 'Başlamaya hazır';
      const orta = `<b>${o.hedefSaat || 16}</b><small>sa hedef</small>`;
      if (boy === 'kucuk') return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç başlamadı: ${metin}. Dada Diet’te aç`, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="dd-w2-yan is-sik">${rh('oruc', 0, orta, 'md')}<small class="dd-w2-not">${esc(metin)}</small></span>${dugme}`});
      return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket: `Oruç başlamadı: ${metin}. Dada Diet’te aç`, icerik: `<span class="dd-w2-yan">${rh('oruc', 0, orta, 'xl')}<span class="dd-w2-sag">${w2Bas('hourglass-half', baslik, 'oruc')}<span class="dd-w2-deger is-oruc"><b>${esc(o.tur === 'pencere' ? 'Yeme penceresi açık' : 'Oruç başlamadı')}</b></span><small class="dd-w2-not">${esc(metin)}${o.tur === 'pencere' && o.kalanDk != null ? ` · ${sure(o.kalanDk)} kaldı` : ''}</small>${dugme}</span></span>`});
    }
    const kalanSn = Math.max(0, o.hedefSaat * 3600 - o.gecenSn), sayac = kalanSn > 0 ? DD.cihazGeriSayac(kalanSn, {bicim: boy === 'kucuk' ? 'sa' : 'dk'}) : 'Tamam';
    const etiket = `Oruç: ${kalanSn > 0 ? `${sure(Math.ceil(kalanSn / 60))} kaldı` : 'hedefine ulaştın'}, bitiş ${o.bit}. Dada Diet’te aç`;
    if (boy === 'kucuk') return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket, icerik: `${w2Bas('hourglass-half', baslik, 'oruc')}<span class="dd-w2-yan is-sik">${rh('oruc', o.oran, `<b>${sayac}</b><small>kaldı</small>`, 'md')}<small class="dd-w2-not">Bitiş<br><b>${esc(o.bit)}</b></small></span>${dugme}`});
    const cubuk = `<span class="dd-lr-cubuk is-w2" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="dd-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'oruc', ac, etiket, icerik: `<span class="dd-w2-yan">${rh('oruc', o.oran, `<b>${Math.round(o.oran * 100)}%</b><small>${esc(o.faz || '')}</small>`, 'xl')}<span class="dd-w2-sag">${w2Bas('hourglass-half', baslik, 'oruc')}<span class="dd-w2-deger is-oruc"><b>${sayac}</b><small>kaldı</small></span>${cubuk}<small class="dd-w2-not">${esc(o.bas)} → ${esc(o.bit)}</small>${dugme}</span></span>`});
  };
  // Diyetisyen: sıradaki görüşme ve son mesaj; yanıt yazmak uygulamada (bağlantı).
  DD.wgDiyetisyen = (o = {}) => {
    const h_ = w2Hal(o, 'diyetisyen', 'user-doctor', 'Diyetisyen', 'diyetisyen');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', d = o.dyt;
    if (!d) return DD.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/bul', etiket: 'Diyetisyen: henüz diyetisyenin yok. Diyetisyen bul', icerik: `${w2Bas('user-doctor', 'Diyetisyen', 'diyetisyen')}${yok('user-doctor', 'Diyetisyenin yok', boy === 'kucuk' ? '' : 'Sana uygun diyetisyeni bul, görüşmen burada görünsün', '#/uzman/bul', boy === 'kucuk' ? '' : 'Diyetisyen bul')}`});
    const kisi = `<span class="dd-w2-kisi"><span class="dd-w2-avatar" aria-hidden="true">${esc(d.harf)}</span><span><b>${esc(d.kisaAd)}</b><small>${esc(d.unvan || '')}</small></span></span>`;
    const r = d.randevu, rv = r ? `<span class="dd-w2-randevu"><span class="dd-w2-takvim" aria-hidden="true"><small>${esc(r.ay)}</small><b>${esc(r.gunNo)}</b></span><span><b>${esc(`${r.gun} ${r.saat}`)}</b><small>${esc([r.kalan, r.tur].filter(Boolean).join(' · '))}</small></span></span>` : '<small class="dd-w2-not">Planlı görüşme yok</small>';
    const etiket = `Diyetisyen ${d.kisaAd}${r ? `, görüşme ${r.gun} ${r.saat}` : ''}${d.mesajlar?.length ? `, son mesaj: ${d.mesajlar[d.mesajlar.length - 1].metin}` : ''}. Dada Diet’te aç`;
    if (boy === 'kucuk') {
      const kisiK = `<span class="dd-w2-kisi"><span class="dd-w2-avatar" aria-hidden="true">${esc(d.harf)}</span><span><b>${esc(d.kisaAd)}</b></span></span>`;
      const rvK = r ? `<span class="dd-w2-randevu"><span class="dd-w2-takvim" aria-hidden="true"><small>${esc(r.ay)}</small><b>${esc(r.gunNo)}</b></span><span><b>${esc(`${r.gun} ${r.saat}`)}</b><small>${esc(r.kalan || '')}</small></span></span>` : '<small class="dd-w2-not">Planlı görüşme yok</small>';
      return DD.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman', etiket, icerik: `${kisiK}${rvK}`});
    }
    const balon = m => `<span class="${liste('dd-w2-balon', m.kim === 'ben' && 'is-ben')}"><span>${esc(m.metin)}</span><small>${esc(m.zaman || '')}</small></span>`;
    const ms = (d.mesajlar || []).slice(boy === 'buyuk' ? -2 : -1);
    const yanit = w2Dugme({ac: '#/uzman/sohbet', ikon: 'reply', metin: 'Yanıtla', ton: 'diyetisyen'});
    if (boy === 'orta') return DD.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `<span class="dd-w2-ust">${kisi}<span class="dd-w2-sagust">${d.okunmamis ? `<span class="dd-w2-rozet">${sayi(d.okunmamis)}</span>` : ''}${yanit}</span></span>${ms.length ? balon(ms[ms.length - 1]) : '<small class="dd-w2-not">Henüz mesaj yok</small>'}${rv}`});
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'diyetisyen', ac: '#/uzman/sohbet', etiket, icerik: `<span class="dd-w2-ust">${kisi}${d.okunmamis ? `<span class="dd-w2-rozet">${sayi(d.okunmamis)}</span>` : ''}</span><span class="dd-w2-balonlar">${ms.map(balon).join('')}</span>${r ? `<span class="dd-w2-rkart">${rv}${w2Dugme({ac: '#/uzman', ikon: 'video', metin: 'Görüşme', ton: 'ikincil'})}</span>` : ''}<span class="dd-w2-alt">${yanit}</span>`});
  };
  // Haftalık ilerleme: son 7 gün kalori (hedef çizgisi), büyükte su; seri alevi.
  DD.wgHafta = (o = {}) => {
    const h_ = w2Hal(o, 'hafta', 'chart-simple', 'Haftalık ilerleme', 'kalori');
    if (h_) return h_;
    const boy = o.boy || 'kucuk', l = o.gunler || [], hedef = o.hedef || Math.max(1, ...l.map(x => x.kcal || 0)), tavan = Math.max(hedef * 1.25, ...l.map(x => x.kcal || 0)), kayitli = l.filter(x => x.kcal != null && !x.bugun);
    const ort = kayitli.length ? Math.round(kayitli.reduce((t, x) => t + x.kcal, 0) / kayitli.length) : null;
    const etiket = `Haftalık ilerleme: ${o.seri?.sayi || 0} günlük seri${ort ? `, son 7 gün ortalaması ${sayi(ort)} kcal` : ''}. Dada Diet’te aç`;
    const cubuklar = (alan, h, renk) => `<span class="${liste('dd-w2-grafik', `is-${renk}`)}" style="--h:${kisit(h / tavan, 0, 1).toFixed(3)}" aria-hidden="true">${l.map(x => `<span class="${liste('dd-w2-gun', x.bugun && 'is-bugun', x[alan] == null && 'is-bos', x[alan] > h * 1.08 && 'is-ustunde')}" style="--o:${kisit((x[alan] || 0) / tavan, 0, 1).toFixed(3)}"><i></i><small>${esc(x.gun.slice(0, 1))}</small></span>`).join('')}<i class="dd-w2-hedef"></i></span>`;
    const seri = `<span class="${liste('dd-lo-seri', !o.seri?.bugun && 'is-sonuk')}" role="img" aria-label="${esc(`${o.seri?.sayi || 0} günlük seri`)}"><img src="${ALEV}" alt=""><b>${sayi(o.seri?.sayi || 0)}</b></span>`;
    if (boy === 'kucuk') return DD.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `<span class="dd-w2-ust">${w2Bas('chart-simple', 'Hafta', 'kalori')}${seri}</span>${cubuklar('kcal', hedef, 'kalori')}<small class="dd-w2-not">${ort ? `Ort. ${sayi(ort)} kcal` : 'Kayıtlar burada birikir'}</small>`});
    const ust = `<span class="dd-w2-ust">${w2Bas('chart-simple', 'Son 7 gün', 'kalori', ort ? `ort. ${sayi(ort)} kcal` : '')}${seri}</span>`;
    if (boy === 'orta') return DD.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `${ust}${cubuklar('kcal', hedef, 'kalori')}`});
    const suH = o.suHedef || 2200, suTavan = suH * 1.25;
    const suCubuk = `<span class="dd-w2-grafik is-su" aria-hidden="true">${l.map(x => `<span class="${liste('dd-w2-gun', x.bugun && 'is-bugun', x.suMl == null && 'is-bos')}" style="--o:${kisit((x.suMl || 0) / suTavan, 0, 1).toFixed(3)}"><i></i><small>${esc(x.gun.slice(0, 1))}</small></span>`).join('')}<i class="dd-w2-hedef" style="--h:${(suH / suTavan).toFixed(3)}"></i></span>`;
    // Özet yalnız kayıtların istatistiği (kural yok): ortalama, en yüksek gün, seri.
    const ust_ = kayitli.reduce((m, x) => (!m || x.kcal > m.kcal ? x : m), null);
    const ozetler = `<span class="dd-w2-ozetler"><span><small>Ortalama</small><b>${ort ? `${sayi(ort)} kcal` : '—'}</b></span><span><small>En yüksek</small><b>${ust_ ? `${esc(ust_.gun)} ${sayi(ust_.kcal)}` : '—'}</b></span><span><small>Seri</small><b>${sayi(o.seri?.sayi || 0)} gün</b></span></span>`;
    return DD.w2Kabuk({eski: o.eski, boy, tur: 'hafta', ac: '#/saglik', etiket, icerik: `${ust}<small class="dd-w2-etiket">${ik('fire-flame-curved')}Kalori · hedef ${sayi(hedef)}</small>${cubuklar('kcal', hedef, 'kalori')}<small class="dd-w2-etiket is-su">${ik('droplet')}Su · hedef ${L(suH)}</small>${suCubuk}${ozetler}`});
  };

  // ---------- Dinamik Ada v2 (W2 b): öğün/su (günlük) ve oruç Canlı Etkinlikleri ----------
  // tur: 'kompakt' (tek etkinlik; dokununca genişler: data-ada="<etkinlik>"; genişte boş yere dokunmak data-ada="kompakt"), 'genis' (basılı tutunca; düğmeler App Intent), 'minimal' (iki etkinlik: biri adaya bitişik, öteki ayrık daire).
  // etkinlik 'oruc': {oran, kalanSn, ad, faz, bas, bit, isaretler, eylem:{kod}}; 'gunluk': {kalan, ogunler, su:{icilen, hedef, bardak}, suEylem:{kod}, seri}.
  DD.adaV2 = (o = {}) => {
    const e = o.etkinlik || 'oruc', t = o.tur || 'kompakt', oruc = e === 'oruc';
    const sol = oruc ? rh('oruc', o.oran, ik('hourglass-half'), 'ada') : rh('kalori', o.hedef ? (o.hedef - o.kalan) / o.hedef : 0, ik('fire-flame-curved'), 'ada');
    if (t === 'minimal') return `<span class="${liste('dd-ada2', 'is-minimal', `is-${e}`)}">${oruc ? rh('oruc', o.oran, '', 'ada') : rh('kalori', o.hedef ? (o.hedef - o.kalan) / o.hedef : 0, '', 'ada')}</span>`;
    if (t === 'kompakt') {
      const sag = oruc ? `<b class="is-oruc">${o.kalanSn > 0 ? DD.cihazGeriSayac(o.kalanSn, {bicim: 'kisa'}) : 'Tamam'}</b>` : `<b class="is-kalori">${o.kalan == null ? '—' : sayi(Math.max(0, o.kalan))}<small>kcal</small></b>`;
      return `<button type="button" class="${liste('dd-ada2', 'is-kompakt', `is-${e}`)}" data-ada="${e}" aria-label="${esc(oruc ? `Oruç: ${o.kalanSn > 0 ? `${sure(Math.ceil(o.kalanSn / 60))} kaldı` : 'hedefine ulaştın'}. Genişlet` : `Bugün: ${o.kalan == null ? 'hedef yok' : `${sayi(Math.max(0, o.kalan))} kcal kaldı`}. Genişlet`)}">${sol}<i></i>${sag}</button>`;
    }
    // Genişletilmiş hal Apple bölgeleriyle (≤ 160 pt): leading ve trailing kameranın iki yanında, center altında, bottom en altta.
    if (oruc) {
      const cubuk = `<span class="dd-lr-cubuk is-ada" style="--cih-o:${kisit(o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="dd-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>`;
      return `<span class="${liste('dd-ada2', 'is-genis', 'is-oruc')}"><button type="button" class="dd-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
        <span class="dd-ada2-ust">${rh('oruc', o.oran, ik('hourglass-half'), 'ada-md')}<i></i><span class="dd-ada2-sayac"><b>${o.kalanSn > 0 ? DD.cihazGeriSayac(o.kalanSn) : 'Tamam'}</b><small>${o.kalanSn > 0 ? 'kaldı' : 'hedefine ulaştın'}</small></span></span>
        <span class="dd-ada2-orta"><b>Oruç · ${esc(o.ad || '')}</b><small>${esc([o.faz, `bitiş ${o.bit}`].filter(Boolean).join(' · '))}</small></span>
        <span class="dd-ada2-alt is-cubuk"><small>${esc(o.bas || '')}</small>${cubuk}<small>${esc(o.bit || '')}</small>${o.eylem ? `<button type="button" class="dd-ada2-dugme is-oruc" data-wg-eylem="${esc(o.eylem.kod)}" aria-label="Orucu bitir">${ik('stop')}<span>Bitir</span></button>` : ''}</span></span>`;
    }
    const s = o.su || {}, l = o.ogunler || [];
    return `<span class="${liste('dd-ada2', 'is-genis', 'is-gunluk')}"><button type="button" class="dd-ada2-kapat" data-ada="kompakt" aria-label="Küçült"></button>
      <span class="dd-ada2-ust"><span class="dd-ada2-kalan"><b class="${liste(o.oncekiKalan != null && 'is-yeni')}"${o.oncekiKalan != null ? ` data-lo-eski="${esc(Math.max(0, o.oncekiKalan))}" data-lo-yeni="${esc(Math.max(0, o.kalan ?? 0))}"` : ''}>${o.kalan == null ? '—' : sayi(Math.max(0, o.kalan))}</b><small>kcal kaldı</small></span><i></i><span class="dd-ada2-su">${ik('droplet')}<b>${L(s.icilen || 0)}</b><small>/ ${L(s.hedef || 0)}</small></span></span>
      <span class="dd-ada2-alt is-ogun"><span class="dd-ada2-ogunler">${l.map(ogunHalka).join('')}</span><span class="dd-ada2-sag">${o.seri ? `<span class="${liste('dd-lo-seri', !o.seri.bugun && 'is-sonuk')}" role="img" aria-label="${esc(`${o.seri.sayi} günlük seri`)}"><img src="${ALEV}" alt=""><b>${sayi(o.seri.sayi)}</b></span>` : ''}${o.suEylem ? `<button type="button" class="dd-ada2-dugme is-su" data-wg-eylem="${esc(o.suEylem.kod)}" aria-label="Bir bardak su ekle, ${sayi(s.bardak || 200)} ml">${ik('plus')}<span>${sayi(s.bardak || 200)} ml</span></button>` : ''}</span></span></span>`;
  };

  // ---------- Android canlı bildirim v2 (W2 e): Android 16 Live Update (ProgressStyle) ve mesaj bildirimi ----------
  // tur 'oruc': ilerleme çubuğu (faz bölümleri), kalan süre, "Orucu bitir"; 'gunluk': öğün halkaları, kalan kalori, "+ <sıradaki öğün>" ve "+200 ml";
  // 'mesaj': MessagingStyle (gönderen, mesaj, Yanıtla uygulamayı açar). Eylem düğmeleri bildirim eylemi (48 dp).
  DD.androidCanli = (o = {}) => {
    const t = o.tur || 'oruc', ust = (ikon, metin, sag) => `<span class="dd-acb-ust"><span class="dd-acb-glif">${ik(ikon)}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(metin)}</span>${o.eski ? `<span aria-hidden="true">·</span><small class="dd-acb-eski">${ik('clock-rotate-left')} ${esc(o.eski)}</small>` : sag ? `<span aria-hidden="true">·</span>${sag}` : ''}</span>`;
    const eylem = e => `<button type="button"${e.kod ? ` data-wg-eylem="${esc(e.kod)}"${e.id ? ` data-id="${esc(e.id)}"` : ''}` : ` data-wg-ac="${esc(e.ac)}"`}>${esc(e.metin)}</button>`;
    if (t === 'mesaj') return `<div class="${liste('dd-acb', 'is-mesaj', o.eski && 'is-eski')}">${ust('comment', 'Diyetisyen', `<small>${esc(o.zaman || '')}</small>`)}<span class="dd-acb-govde"><span class="dd-w2-avatar" aria-hidden="true">${esc(o.harf || '')}</span><span class="dd-acb-metin"><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></span></span><span class="dd-acb-eylemler">${eylem({ac: '#/uzman/sohbet', metin: 'Yanıtla'})}</span></div>`;
    if (t === 'gunluk') {
      const l = o.ogunler || [], s = o.su || {}, sira = l.find(x => x.siradaki && x.eylem);
      return `<div class="${liste('dd-acb', 'is-gunluk', o.eski && 'is-eski')}">${ust('utensils', 'Bugün', `<small>${l.filter(x => x.durum === 'dolu').length}/${l.length} öğün</small>`)}
        <span class="dd-acb-govde"><span class="dd-acb-metin"><b>${o.kalan == null ? 'Kalori hedefin yok' : `${sayi(Math.max(0, o.kalan))} kcal kaldı`}</b><span>${esc(`Su ${sayi(s.icilen || 0)} / ${sayi(s.hedef || 0)} ml`)}</span></span><span class="dd-acb-ogunler">${l.map(x => `<span class="${liste('dd-acb-ogun', `is-${x.id}`, x.durum === 'dolu' && 'is-dolu', x.yeni && 'is-yeni')}" style="--cih-o:${x.durum === 'dolu' ? 1 : 0}" role="img" aria-label="${esc(`${x.ad}: ${x.durum === 'dolu' ? 'kaydedildi' : 'henüz yok'}`)}"><span class="dd-lo-halka is-acb"><span class="dd-lo-iz"></span>${x.durum === 'dolu' ? '<span class="dd-lo-yay"></span>' : ''}<img src="${esc(DD.OGUN_GORSEL[x.id] || DD.OGUN_GORSEL.ara)}" alt=""></span></span>`).join('')}</span></span>
        <span class="dd-acb-eylemler">${sira ? eylem(sira.eylem.kod ? {kod: sira.eylem.kod, id: sira.eylem.id || sira.id, metin: `+ ${sira.ad}`} : {ac: sira.eylem.ac, metin: `+ ${sira.ad}`}) : ''}${o.suEylem ? eylem({...o.suEylem, metin: `+${sayi(s.bardak || 200)} ml su`}) : ''}</span></div>`;
    }
    const kalanSn = Math.max(0, (o.hedefSaat || 16) * 3600 - (o.gecenSn || 0));
    return `<div class="${liste('dd-acb', 'is-oruc', o.bitti && 'is-bitti', o.eski && 'is-eski')}">${ust('hourglass-half', `Oruç · ${o.ad || ''}`, o.bitti ? '' : DD.cihazGeriSayac(kalanSn))}
      <span class="dd-acb-govde"><span class="dd-acb-metin"><b>${esc(o.bitti ? 'Oruç bitti' : kalanSn > 0 ? `${sure(Math.ceil(kalanSn / 60))} kaldı` : 'Hedefine ulaştın')}</b><span>${esc(o.bitti ? `${o.bitti} · pencere açıldı` : [o.faz, `bitiş ${o.bit}`].filter(Boolean).join(' · '))}</span></span><img src="${SIMGE}" alt=""></span>
      <span class="dd-lr-cubuk is-acb" style="--cih-o:${kisit(o.bitti ? 1 : o.oran, 0, 1).toFixed(3)}" aria-hidden="true"><i></i>${(o.isaretler || []).map(x => `<span class="dd-lr-isaret" style="--x:${kisit(x, 0, 1).toFixed(3)}"></span>`).join('')}</span>
      ${!o.bitti && o.eylem ? `<span class="dd-acb-eylemler">${eylem({...o.eylem, metin: 'Orucu bitir'})}</span>` : ''}</div>`;
  };
  // Android 16 durum çubuğu çipi (Live Update kısa metni): oruçta kalan süre.
  DD.androidCip = (o = {}) => `<span class="dd-tel-cip is-v2">${ik('hourglass-half')}${DD.cihazGeriSayac(Math.max(0, o.kalanSn || 0), {bicim: 'kisa'})}</span>`;

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
      return `<${tag} class="${liste('dd-ha-kut', `is-${k.hal || 'pasif'}`, k.genis && 'is-genis', k.bizim && 'is-bizim', k.renk && `is-${k.renk}`)}"${v}><span class="dd-ha-ikon">${ik(k.ikon)}</span>${k.genis || p === 'android' ? `<span class="dd-ha-metin"><b>${esc(k.ad)}</b>${k.alt ? `<small>${esc(k.alt)}</small>` : ''}</span>` : ''}</${k.bizim ? 'button' : 'span'}>`;
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
