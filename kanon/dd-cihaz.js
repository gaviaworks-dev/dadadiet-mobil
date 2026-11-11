/* Telefon özellikleri bileşenleri (E3): cihaz çerçevesi, kilit ekranı canlı etkinliği, Dinamik Ada, durum çubuğu çipi,
 * ana ekran widget'ları, sesli komut ekranı (Siri / Asistan). Stil kanon/dd-cihaz.css; renkler kanon token'larından, koyu tema çerçeve içinde yerel değişkenlerle.
 * Marka logosu çizilmez (Apple/Google yok): çerçeve sade, durum simgeleri Font Awesome solid, uygulama simgesi Dada Diet'in kendi simgesi.
 *
 * Çerçeve ve sahne
 *   DD.telefonCerceve({platform:'ios'|'android', tema:'acik'|'koyu', icerik, saat, kilit:{tarih}, durumCip, etiket, sinif})
 *     Tam telefon. kilit verilirse kilit ekranı başlığı (kilit simgesi, tarih, büyük saat; iOS'ta altta fener/kamera düğmeleri, Android'de parmak izi) çizilir;
 *     iOS'ta Dinamik Ada, Android'de kamera deliği. saat telefonun sistem saatidir (tr biçimi 17:10); uygulama metinleri noktalı kalır.
 *     durumCip: Android durum çubuğunda saat yanındaki canlı çip (DD.durumCipi).
 *   DD.cihazKesit({platform, tema, saat, ada, durumCip, icerik, etiket}) telefonun üst kesiti (durum çubuğu + ada/çip + isteğe bağlı içerik), altı solar.
 *   DD.anaEkran({widgetlar:[html], uygulama:{ad, gorsel}, tarih, ara, sik, dock}) widget ızgarası + uygulama simgesi; iOS'ta Ara hapı (ara:false gizler), Android'de tarih satırı;
 *     sik: dar aralık (dört orta widget); dock: altta dört boş, yarı saydam simge yeri (başka uygulamanın logosu çizilmez).
 * Canlı etkinlik
 *   DD.canliEtkinlik({platform, durum:'oruc'|'pencere', baslik, etiket, gecenSn, oran, kalanMetin, bas, bit, eylem})
 *     iOS kilit ekranı Live Activity kartı ya da Android kalıcı (devam eden) bildirim.
 *   DD.dinamikAda({tur:'kompakt'|'genis', durum, gecenSn, oran, baslik, kalanMetin, bas, bit}) iOS Dinamik Ada içeriği (cihazKesit ada'sına verilir).
 *   DD.durumCipi({durum, gecenSn}) Android durum çubuğu canlı çipi.
 * Widget
 *   DD.widget({boy:'kucuk'|'orta', ton, etiket, icerik}) kabuk. Platform ve tema atadaki .dd-tel'den gelir.
 *   DD.widgetKalori({boy, hedef, alinan, makro}) · DD.widgetSu({boy, icilen, hedef, bardak}) ·
 *   DD.widgetOruc({boy, durum:'oruc'|'pencere'|'bos', baslik, gecenSn, oran, kalanMetin, kisaMetin, bas, bit, eylem, hedefSaat}) (bos: başlamış oruç yok, ortada hedef saat; kisaMetin küçük boyun alt satırı) ·
 *   DD.widgetOgun({boy, ad, ikon, saat, kcal, besinler}) (besin yoksa "Henüz besin eklenmedi" + Ekle)
 * Sesli komut
 *   DD.komutEkran({platform, komut, hal:'dinliyor'|'sonuc', sonuc, arka}) · DD.komutSonuc({ikon, ton, baslik, metin, deger, birim, oran, satirlar, alt})
 *   DD.komutOynat(el) .dd-komut'u dinliyor → sonuç akışıyla yeniden oynatır (azHareket'te doğrudan sonuç); durdurma işlevi döner.
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
 *   DD.cihazHalka({tur:'kalori'|'su'|'oruc'|'pencere', oran, boyut:'xs'|'sm'|'md'|'lg', orta, aria, ustunde}) halka (kalori 270° açık yay = DD.halka; oruç geçişi = DD.orucSayac renkleri)
 *   DD.cihazCubuk({tur, oran}) ince ilerleme çubuğu · DD.cihazSayac(sn, {bicim:'tam'|'kisa'}) saniye saniye akan süre · DD.cihazAdimlar([metin]) numaralı adımlar (**vurgu**)
 */
(() => {
  const DD = window.DD, {esc, ik, vurgu, sayi, kisit} = DD;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const SIMGE = 'assets/marka/ikon-512.png';
  const iki = n => String(n).padStart(2, '0');

  // ---------- Süre: oluşturulduğu andan saniye saniye akar (başlangıç damgası, kayma yok) ----------
  const sureMetin = (sn, bicim) => {
    sn = Math.max(0, Math.floor(sn));
    const s = Math.floor(sn / 3600), d = Math.floor(sn / 60) % 60;
    return bicim === 'kisa' ? `${s}:${iki(d)}` : `${iki(s)}:${iki(d)}:${iki(sn % 60)}`;
  };
  DD.cihazSayac = (sn = 0, o = {}) => `<span class="dd-csayac" data-cihaz-sayac="${Math.round(Date.now() - sn * 1000)}" data-bicim="${o.bicim || 'tam'}">${sureMetin(sn, o.bicim)}</span>`;
  setInterval(() => {
    if (document.hidden) return;
    document.querySelectorAll('[data-cihaz-sayac]').forEach(el => {
      if (el.closest('.is-gizli')) return;
      const m = sureMetin((Date.now() - +el.dataset.cihazSayac) / 1000, el.dataset.bicim);
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
  const RITIM_IKON = {oruc: 'hourglass-half', pencere: 'utensils'};

  // ---------- Çerçeve ----------
  const simgeler = p => `<span class="dd-tel-simgeler" aria-hidden="true">${p === 'ios' ? ik('signal') + ik('wifi') : ik('wifi') + ik('signal')}${ik('battery-three-quarters')}</span>`;
  const durumCubugu = o => `<div class="dd-tel-durum"><span class="dd-tel-durum-sol">${o.kilit ? '' : `<b>${esc(o.saat || '')}</b>`}${o.durumCip || ''}</span>${simgeler(o.platform)}</div>`;
  const kilitBas = o => o.platform === 'ios'
    ? `<div class="dd-tel-kilit"><span class="dd-tel-kilit-ikon" aria-hidden="true">${ik('lock')}</span><small>${esc(o.kilit.tarih || '')}</small><b>${esc(o.saat || '')}</b></div>`
    : `<div class="dd-tel-kilit"><b>${esc(o.saat || '')}</b><small>${esc(o.kilit.tarih || '')}</small></div>`;
  const tepe = o => (o.platform === 'ios' ? `<span class="dd-tel-ada">${o.ada || ''}</span>` : '<span class="dd-tel-delik"></span>');
  const kok = (o, ek) => liste('dd-tel', `is-${o.platform || 'ios'}`, `is-${o.tema || 'acik'}`, ek, o.sinif);
  DD.telefonCerceve = (o = {}) => {
    const p = o.platform || 'ios';
    return `<figure class="${kok(o)}" role="img" aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}<div class="${liste('dd-tel-icerik', o.kilit && 'is-kilit')}">${o.kilit ? kilitBas({...o, platform: p}) : ''}${o.icerik || ''}</div>${o.kilit && p === 'android' ? `<span class="dd-tel-parmak" aria-hidden="true">${ik('fingerprint')}</span>` : ''}${o.kilit && p === 'ios' ? `<span class="dd-tel-kilit-dugmeler" aria-hidden="true"><span>${ik('lightbulb')}</span><span>${ik('camera')}</span></span>` : ''}<span class="dd-tel-cubuk"></span></div></div></figure>`;
  };
  DD.cihazKesit = (o = {}) => {
    const p = o.platform || 'ios';
    return `<figure class="${kok(o, 'is-kesit')}" role="img" aria-label="${esc(o.etiket || '')}"><div class="dd-tel-govde"><div class="dd-tel-ekran"><span class="dd-tel-duvar"></span>${tepe({...o, platform: p})}${durumCubugu({...o, platform: p})}${o.icerik ? `<div class="dd-tel-icerik">${o.icerik}</div>` : ''}</div></div></figure>`;
  };
  DD.anaEkran = (o = {}) => `<div class="${liste('dd-tel-ana', o.sik && 'is-sik')}">${o.tarih ? `<p class="dd-tel-gun">${esc(o.tarih)}</p>` : ''}<div class="dd-tel-izgara">${(o.widgetlar || []).join('')}</div>${o.uygulama ? `<div class="dd-tel-uygulamalar"><span class="dd-tel-uyg"><img src="${esc(o.uygulama.gorsel || SIMGE)}" alt=""><small>${esc(o.uygulama.ad || 'Dada Diet')}</small></span></div>` : ''}${o.ara === false ? '' : `<span class="dd-tel-ara" aria-hidden="true">${ik('magnifying-glass')}<span>Ara</span></span>`}${o.dock ? `<span class="dd-tel-dock" aria-hidden="true">${'<i></i>'.repeat(4)}</span>` : ''}</div>`;

  // ---------- Canlı etkinlik ----------
  DD.canliEtkinlik = (o = {}) => {
    const d = o.durum || 'oruc', yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100);
    if ((o.platform || 'ios') === 'android') {
      return `<div class="${liste('dd-canli', 'is-android', `is-${d}`)}">
        <div class="dd-canli-ust"><span class="dd-canli-glif" aria-hidden="true">${ik(RITIM_IKON[d])}</span><span>Dada Diet</span><span aria-hidden="true">·</span><span>${esc(o.etiket || 'Ritim')}</span><span aria-hidden="true">·</span>${DD.cihazSayac(o.gecenSn)}</div>
        <div class="dd-canli-govde"><div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)} · %${yuzde}</small></div><img src="${SIMGE}" alt=""></div>
        ${DD.cihazCubuk({tur: d, oran: o.oran})}
        <div class="dd-canli-alt"><span>${esc(o.bas)}</span><span>${esc(o.bit)}</span></div>
        <div class="dd-canli-eylemler"><span>${esc(o.eylem || '')}</span><span>Uygulamayı aç</span></div>
      </div>`;
    }
    return `<div class="${liste('dd-canli', 'is-ios', `is-${d}`)}">
      <div class="dd-canli-ust"><img src="${SIMGE}" alt=""><span>Dada Diet</span><small>${esc(o.etiket || '')}</small></div>
      <div class="dd-canli-govde">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik(RITIM_IKON[d])})}<div class="dd-canli-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)}</small></div><div class="dd-canli-sure">${DD.cihazSayac(o.gecenSn)}<small>Geçen · %${yuzde}</small></div></div>
      ${DD.cihazCubuk({tur: d, oran: o.oran})}
      <div class="dd-canli-alt"><span>${esc(o.bas)}</span><span>${esc(o.bit)}</span></div>
    </div>`;
  };
  DD.dinamikAda = (o = {}) => {
    const d = o.durum || 'oruc';
    if (o.tur === 'genis') {
      // Üst satır kameranın iki yanına ayrılır (solda halka, sağda sayaç, ortası kamera); başlık ve kalan kameranın altında başlar.
      return `<span class="${liste('dd-ada', 'is-genis', `is-${d}`)}"><span class="dd-ada-ust">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'sm', orta: ik(RITIM_IKON[d])})}<i></i>${DD.cihazSayac(o.gecenSn)}</span><span class="dd-ada-metin"><b>${esc(o.baslik)}</b><small>${esc(o.kalanMetin)}</small></span>${DD.cihazCubuk({tur: d, oran: o.oran})}<span class="dd-ada-alt"><span>${esc(o.bas)}</span><span>${esc(o.bit)}</span></span></span>`;
    }
    return `<span class="${liste('dd-ada', 'is-kompakt', `is-${d}`)}">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'xs'})}<i></i>${DD.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;
  };
  DD.durumCipi = (o = {}) => `<span class="${liste('dd-tel-cip', `is-${o.durum || 'oruc'}`)}">${ik(RITIM_IKON[o.durum || 'oruc'])}${DD.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</span>`;

  // ---------- Widget ----------
  DD.widget = (o = {}) => `<div class="${liste('dd-wg', `is-${o.boy || 'kucuk'}`, o.ton && `is-${o.ton}`, o.sinif)}"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${o.icerik || ''}</div>`;
  const wgBas = (ikon, metin) => `<span class="dd-wg-bas">${ik(ikon)}<span>${esc(metin)}</span></span>`;
  const wgDugme = (ikon, metin) => `<span class="dd-wg-dugme">${ik(ikon)}<span>${esc(metin)}</span></span>`;

  DD.widgetKalori = (o = {}) => {
    const boy = o.boy || 'kucuk';
    if (o.hedef == null) return DD.widget({boy, ton: 'kalori', icerik: `${wgBas('fire-flame-curved', 'Kalori')}<span class="dd-wg-bos">${ik('bullseye')}<small>Hedefini belirle, kalanın burada görünsün</small></span>`});
    const kalan = o.hedef - o.alinan, ustunde = kalan < 0;
    const halka = DD.cihazHalka({tur: 'kalori', oran: o.alinan / o.hedef, ustunde, boyut: boy === 'orta' ? 'lg' : 'md', orta: `<b>${ustunde ? '+' : ''}${sayi(Math.abs(kalan))}</b><small>${ustunde ? 'fazla' : 'kalan'}</small>`});
    if (boy === 'kucuk') return DD.widget({boy, ton: 'kalori', icerik: `${wgBas('fire-flame-curved', 'Kalori')}<span class="dd-wg-halka">${halka}</span><small class="dd-wg-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>`});
    const MAKRO = [['P', 'Protein', 'protein'], ['K', 'Karb.', 'karb'], ['Y', 'Yağ', 'yag']];
    const sag = o.makro
      ? `<span class="dd-wg-makrolar">${MAKRO.map(([k, ad, t]) => { const m = o.makro[k]; return `<span class="dd-wg-makro is-${t}"><span><small>${ad}</small><small>${sayi(m.alinan)} / ${sayi(m.hedef)} g</small></span><span class="dd-wg-makro-yol" style="--cih-o:${kisit(m.alinan / m.hedef, 0, 1).toFixed(3)}"><i></i></span></span>`; }).join('')}</span>`
      : `<span class="dd-wg-satirlar"><span><small>Alınan</small><b>${sayi(o.alinan)} kcal</b></span><span><small>Hedef</small><b>${sayi(o.hedef)} kcal</b></span></span>`;
    return DD.widget({boy, ton: 'kalori', icerik: `<span class="dd-wg-yan">${halka}<span class="dd-wg-sag">${wgBas('fire-flame-curved', 'Kalori')}<small class="dd-wg-not">${sayi(o.alinan)} / ${sayi(o.hedef)} kcal</small>${sag}</span></span>`});
  };

  DD.widgetSu = (o = {}) => {
    const boy = o.boy || 'kucuk', hedef = o.hedef || 1, icilen = o.icilen || 0, bardak = o.bardak || DD.SU_BARDAK || 200;
    const sayilar = `<span class="dd-wg-deger"><b>${sayi(icilen)}</b><small>/ ${sayi(hedef)} ml</small></span>`;
    if (boy === 'kucuk') return DD.widget({boy, ton: 'su', icerik: `${wgBas('glass-water', 'Su')}${sayilar}<span class="dd-wg-alt">${DD.cihazCubuk({tur: 'su', oran: icilen / hedef})}${wgDugme('plus', `${sayi(bardak)} ml`)}</span>`});
    const n = Math.max(Math.ceil(hedef / bardak), Math.ceil(icilen / bardak)), dolu = icilen / bardak;
    const bardaklar = Array.from({length: n}, (_, i) => `<i class="${liste('dd-wg-bardak', i < Math.floor(dolu) ? 'is-dolu' : i < dolu ? 'is-yarim' : '')}">${ik('glass-water')}</i>`).join('');
    const kalan = hedef - icilen;
    return DD.widget({boy, ton: 'su', icerik: `<span class="dd-wg-yan is-su"><span class="dd-wg-sol">${wgBas('glass-water', 'Su')}${sayilar}<small class="dd-wg-not">${kalan > 0 ? `${sayi(kalan)} ml kaldı` : 'Hedef tamam'}</small></span><span class="dd-wg-sag"><span class="dd-wg-bardaklar" aria-hidden="true">${bardaklar}</span>${wgDugme('plus', `1 bardak · ${sayi(bardak)} ml`)}</span></span>`});
  };

  DD.widgetOruc = (o = {}) => {
    const boy = o.boy || 'kucuk', d = o.durum || 'oruc', yuzde = Math.round(kisit(o.oran || 0, 0, 1) * 100);
    const ad = d === 'oruc' ? 'Oruç' : 'Pencere';
    // Hazır: başlamış oruç yok (Ritim'in 'bos' hali). Boş iz, ortada hedef saat; sayaç ve yüzde yok.
    if (d === 'bos') {
      const hedef = `<b>${esc(o.hedefSaat ?? '')}</b><small>saat hedef</small>`;
      if (boy === 'kucuk') return DD.widget({boy, ton: 'oruc', icerik: `${wgBas('hourglass-half', 'Oruç')}<span class="dd-wg-halka">${DD.cihazHalka({tur: 'oruc', oran: 0, boyut: 'md', orta: hedef})}</span><small class="dd-wg-not">${esc(o.kalanMetin || 'Hazır')}</small>`});
      return DD.widget({boy, ton: 'oruc', icerik: `<span class="dd-wg-yan">${DD.cihazHalka({tur: 'oruc', oran: 0, boyut: 'lg', orta: hedef})}<span class="dd-wg-sag">${wgBas('hourglass-half', o.baslik || 'Hazır')}<small class="dd-wg-not">${esc(o.kalanMetin || '')}</small>${o.eylem ? wgDugme('play', o.eylem) : ''}</span></span>`});
    }
    if (boy === 'kucuk') return DD.widget({boy, ton: d, icerik: `${wgBas(RITIM_IKON[d], ad)}<span class="dd-wg-halka">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'md', orta: `<b>${DD.cihazSayac(o.gecenSn, {bicim: 'kisa'})}</b><small>%${yuzde}</small>`})}</span><small class="dd-wg-not">${esc(o.kisaMetin || o.kalanMetin)}</small>`});
    return DD.widget({boy, ton: d, icerik: `<span class="dd-wg-yan">${DD.cihazHalka({tur: d, oran: o.oran, boyut: 'lg', orta: `${ik(RITIM_IKON[d])}<b>%${yuzde}</b>`})}<span class="dd-wg-sag">${wgBas(RITIM_IKON[d], o.baslik || ad)}<b class="dd-wg-sure">${DD.cihazSayac(o.gecenSn)}</b><small class="dd-wg-not">${esc(o.kalanMetin)}</small><small class="dd-wg-not">${esc(o.bas)} – ${esc(o.bit)}</small>${o.eylem ? wgDugme(d === 'oruc' ? 'stop' : 'play', o.eylem) : ''}</span></span>`});
  };

  DD.widgetOgun = (o = {}) => {
    const boy = o.boy || 'kucuk';
    if (!o.ad) return DD.widget({boy, ton: 'ogun', icerik: `${wgBas('utensils', 'Sıradaki öğün')}<span class="dd-wg-bos">${ik('circle-check')}<small>Bugünün öğünleri tamam</small></span>`});
    const meta = [o.saat, o.kcal != null ? `${sayi(o.kcal)} kcal` : ''].filter(Boolean).join(' · ');
    const sol = `${wgBas('utensils', 'Sıradaki öğün')}<span class="dd-wg-ogun"><span class="dd-wg-ogun-ikon">${ik(o.ikon || 'utensils')}</span><b>${esc(o.ad)}</b><small>${esc(meta)}</small></span>`;
    if (boy === 'kucuk') return DD.widget({boy, ton: 'ogun', icerik: sol});
    const b = o.besinler || [], fazla = b.length - 3;
    return DD.widget({boy, ton: 'ogun', icerik: `<span class="dd-wg-yan is-ogun"><span class="dd-wg-sol">${sol}</span><span class="dd-wg-sag"><span class="dd-wg-besinler">${b.slice(0, 3).map(x => `<small>${esc(x)}</small>`).join('')}${fazla > 0 ? `<small class="dd-wg-fazla">+${fazla} besin daha</small>` : ''}${b.length ? '' : '<small class="dd-wg-fazla">Henüz besin eklenmedi</small>'}</span>${b.length ? wgDugme('check', 'Yedim') : wgDugme('plus', 'Ekle')}</span></span>`});
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
      return `<div class="dd-komut is-android" data-hal="${hal}"><div class="dd-komut-arka" aria-hidden="true">${o.arka || ''}</div><span class="dd-komut-perde"></span>
        <div class="dd-komut-sayfa"><span class="dd-komut-tutamak"></span><p class="dd-komut-soz"><q>${esc(o.komut)}</q></p><p class="dd-komut-dinle">${dalga}<span>Dinliyor…</span></p><div class="dd-komut-kart">${o.sonuc || ''}</div><span class="dd-komut-mik" aria-hidden="true">${ik('microphone')}</span></div></div>`;
    }
    return `<div class="dd-komut is-ios" data-hal="${hal}"><div class="dd-komut-arka" aria-hidden="true">${o.arka || ''}</div><span class="dd-komut-perde"></span><span class="dd-komut-isilti" aria-hidden="true"></span>
      <div class="dd-komut-kart">${o.sonuc || ''}</div><p class="dd-komut-soz">${dalga}<q>${esc(o.komut)}</q></p></div>`;
  };
  DD.komutOynat = el => {
    if (!el) return () => {};
    el.dataset.hal = 'dinliyor';
    if (DD.azHareket()) { el.dataset.hal = 'sonuc'; return () => {}; }
    void el.offsetWidth;
    const z = setTimeout(() => { el.dataset.hal = 'sonuc'; }, 1800);
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
})();
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
