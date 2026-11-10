/* Dada Diet bileşen çizicileri: Gastro dg-ui.js işaretlemesi, ad ve marka dışında aynı. Hepsi HTML string döner. Katalog: kanon/README.md */
(() => {
  const DD = window.DD, {esc, ik, at, vurgu, sayi, ondalik} = DD;
  const TK = DD.TK;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');

  // ---------- Metin ----------
  DD.p = (metin, o = {}) => `<p class="${liste(o.orta && 'dd-orta-metin', o.ton && `dd-ton-${o.ton}`, o.meta && 'dd-t-meta', o.sinif)}">${vurgu(metin)}</p>`;
  DD.metinBlok = (o = {}) => `<div class="${liste('dd-yigin-8', o.orta && 'dd-orta-metin', o.sinif)}">${o.etiket ? `<span class="dd-t-label dd-ton-ikincil">${esc(o.etiket)}</span>` : ''}<h${o.h || 2} class="dd-t-${o.rol || 'page'}">${esc(o.baslik)}</h${o.h || 2}>${o.metin ? DD.p(o.metin, {ton: 'ikincil'}) : ''}</div>`;
  DD.makale = html => `<div class="dd-metin">${html}</div>`;

  // ---------- Avatar, küçük foto, görsel ----------
  // boyut Gastro ölçeği: 20, 40, 56, 96
  DD.avatar = (o = {}) => { const b = o.boyut || 40; return `<span class="${liste('dd-avatar', `s${b}`, o.sinif)}" aria-hidden="true"${bg(o.gorsel)}>${o.gorsel ? '' : esc(String(o.harf ?? o.ad ?? '?').trim().slice(0, 1).toLocaleUpperCase('tr'))}</span>`; };
  DD.kucukFoto = (src, ikon = 'image') => (src ? `<span class="dd-kucuk-foto"${bg(src)} aria-hidden="true"></span>` : `<span class="dd-kucuk-foto" aria-hidden="true">${ik(ikon)}</span>`);
  // Besin görseli: görsel yoksa harf ya da ikon; küçük foto ölçüsünde, ikon kutusu dili.
  DD.gorsel = (o = {}) => (o.src ? `<span class="${liste('dd-kucuk-foto', o.sinif)}"${bg(o.src)} aria-hidden="true"></span>` : `<span class="${liste('dd-kucuk-foto is-yok', `is-${o.ton || 'primary'}`, o.sinif)}" aria-hidden="true">${o.ikon ? ik(o.ikon) : `<b>${esc(String(o.ad || '?').trim().charAt(0).toLocaleUpperCase('tr'))}</b>`}</span>`);
  DD.makroTon = b => { const m = [['protein', (b.P || 0) * 4], ['karb', (b.K || 0) * 4], ['yag', (b.Y || 0) * 9]].sort((x, y) => y[1] - x[1])[0]; return m[1] > 0 ? m[0] : 'primary'; };
  // İkon kutusu: Gastro eylem ve parçalı ikon kutusunun tek adı. boyut sm 32, md 40, lg 44; ton primary, notr, protein, karb, yag, lif, bilgi, basari, uyari, hata
  DD.ikonKutu = (o = {}) => `<span class="${liste('dd-ik', `is-${o.boyut || 'md'}`, `is-${o.ton || 'primary'}`, o.sinif)}" aria-hidden="true">${ik(o.ikon)}</span>`;

  // ---------- Rozet ----------
  DD.rozet = (o = {}) => `<span class="${liste('dd-rozet', o.ton === 'notr' && 'is-notr', o.ton && o.ton !== 'notr' && o.ton !== 'primary' && `is-${o.ton}`, o.sinif)}">${o.ikon ? ik(o.ikon) : ''}${esc(o.metin)}</span>`;
  const DURUM = {taslak: ['Taslak', 'notr', 'pen'], planli: ['Planlı', 'uyari', 'clock'], tamamlandi: ['Tamamlandı', 'basari', 'flag-checkered'], aktif: ['Aktif', 'basari', 'circle-check'], bekliyor: ['Bekliyor', 'uyari', 'hourglass-half'], iptal: ['İptal edildi', 'notr', 'ban'], basarisiz: ['Başarısız', 'hata', 'circle-xmark']};
  // DD.durumRozet({metin, ton, ikon}) ya da DD.durumRozet({kod:'aktif'})
  DD.durumRozet = (o = {}) => { const [a, t, i] = DURUM[o.kod] || []; return `<span class="dd-durum-rozet is-${esc(o.ton || t || 'notr')}">${ik(o.ikon || i || 'circle-info')}<span>${esc(o.metin ?? a)}</span></span>`; };
  DD.sayacRozet = n => `<span class="dd-sayac">${esc(n)}</span>`;
  DD.madalya = (o = {}) => `<span class="${liste('dd-madalya', o.hal === 'ilerliyor' && 'is-ilerliyor', o.hal === 'kilitli' && 'is-kilitli', o.boy && `is-${o.boy}`)}" aria-hidden="true">${ik(o.ikon || 'medal')}${o.hal === 'kilitli' ? `<span class="dd-madalya-kilit">${ik('lock')}</span>` : ''}</span>`;

  // ---------- Çip ----------
  DD.cip = (o = {}) => `<button type="button" class="${liste('dd-chip', o.kucuk && 'is-kucuk', o.sinif)}"${o.deger != null ? ` data-cip="${esc(o.deger)}" aria-pressed="${!!o.secili}"` : ''}${o.pasif ? ' disabled' : ''}${at(o)}>${o.gorsel ? `<img src="${esc(o.gorsel)}" alt="" loading="lazy">` : ''}${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span>${o.sayi != null ? `<span class="dd-chip-sayi">${esc(o.sayi)}</span>` : ''}${o.kapat ? ik('kapat') : ''}</button>`;
  DD.cipler = (o = {}) => { const sec = [].concat(o.secili ?? []); return `<div class="${liste(o.serit === false ? 'dd-sira' : 'dd-serit', o.sinif)}" data-cip-grup="${o.tur || 'coklu'}" data-ad="${esc(o.ad || '')}" role="group"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${o.ogeler.map(x => DD.cip({...x, metin: x.metin ?? x.ad, secili: sec.includes(x.deger)})).join('')}</div>`; };

  // ---------- Segment: Gastro'daki tek sekme ailesi ----------
  const segDugme = (x, sec) => `<button type="button" role="tab" data-seg="${esc(x.deger)}" aria-selected="${x.deger === sec}"${x.pasif ? ' disabled' : ''}${x.veri ? at({veri: x.veri}) : ''}>${x.ikon ? ik(x.ikon) : ''}${esc(x.ad)}${x.sayi != null ? ` <span class="dd-seg-sayi">${esc(x.sayi)}</span>` : ''}</button>`;
  DD.segment = (o = {}) => `<div class="${liste('dd-seg', o.kaydir && 'is-kaydir', o.sinif)}" role="tablist" data-ad="${esc(o.ad || '')}" aria-label="${esc(o.etiket || o.ad || '')}">${o.ogeler.map(x => segDugme(x, o.secili)).join('')}</div>`;
  DD.sekmeler = o => DD.segment({...o, kaydir: true});
  // Gün sekmesi: segment is-kaydir. ogeler [{ad:'Pzt', deger, sayi}]
  DD.gunSekme = o => DD.segment({...o, kaydir: true, ogeler: o.ogeler.map(x => ({...x, ad: x.ad ?? x.etiket}))});
  DD.adimGosterge = (o = {}) => `<div class="dd-adim" role="progressbar" aria-valuemin="0" aria-valuemax="${o.toplam}" aria-valuenow="${o.adim}" aria-label="Adım ${o.adim} / ${o.toplam}">${Array.from({length: o.toplam}, (_, i) => `<i${i < o.adim ? ' class="is-on"' : ''}></i>`).join('')}</div>`;
  // Gastro DG.ilerleme: etiketli satır ya da çıplak progress. Geriye uyum: {oran}
  DD.ilerleme = (o = {}) => { const n = o.n ?? (o.oran ?? 0) * 100, h = o.hedef ?? 100, bar = `<progress class="dd-ilerleme" max="${+h || 1}" value="${Math.min(+n || 0, +h || 1)}" aria-label="${esc(o.etiket || 'İlerleme')}"></progress>`; return o.etiket && o.satir !== false ? `<div class="dd-ilerleme-satir"><div class="dd-ilerleme-bas"><span>${esc(o.etiket)}</span><b>${esc(o.deger ?? `${sayi(n)} / ${sayi(h)}`)}</b></div>${bar}</div>` : bar; };

  // ---------- Düğmeler ----------
  const BT = {secondary: 'ikincil', tonal: 'tonlu', text: 'metin', yikici: 'yikici', cam: 'cam', ikincil: 'ikincil', tonlu: 'tonlu', metin: 'metin'};
  DD.donen = () => '<span class="dd-kamera-yukleniyor is-satir" aria-hidden="true"></span>';
  // tur primary | secondary | tonal | text | yikici | cam; boyut sm; tam, pasif, yukleniyor (is-mesgul), ikon
  DD.btn = (o = {}) => { const c = liste('dd-btn', BT[o.tur] && `dd-btn--${BT[o.tur]}`, o.boyut === 'sm' && 'dd-btn--sm', o.tam && 'dd-btn--tam', o.yukleniyor && 'is-mesgul', o.basili && 'is-basili', o.sinif), ic = `${o.marka ? `<i class="icon fa-brands fa-${esc(o.marka)}" aria-hidden="true"></i>` : o.gorsel ? `<img class="dd-btn-marka" src="${esc(o.gorsel)}" alt="">` : o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span>`; return `<button class="${c}" type="${o.tip || 'button'}"${o.pasif || o.yukleniyor ? ' disabled' : ''}${o.yukleniyor ? ' aria-busy="true"' : ''}${at(o)}>${ic}</button>`; };
  // tur duz | kutu (sheet kapat zemini) | tint (girdi sesi) | dolu | cam
  DD.ikonBtn = (o = {}) => `<button class="${liste('dd-ibtn', o.tur && o.tur !== 'duz' && `is-${o.tur}`, o.sinif)}" type="${o.tip || 'button'}"${o.secili != null ? ` aria-pressed="${!!o.secili}"` : ''}${o.pasif ? ' disabled' : ''}${at(o)}>${ik(o.ikon)}</button>`;
  DD.fab = (o = {}) => `<button class="${liste('dd-fab is-ekran', o.sinif)}" type="button"${o.pasif ? ' disabled' : ''}${at(o)}>${ik(o.ikon || 'ekle')}</button>`;
  DD.uzunBas = (o = {}) => `<div class="dd-uzun-kap"><button type="button" class="${liste('dd-btn', BT[o.tur] && `dd-btn--${BT[o.tur]}`, 'dd-btn--tam', 'dd-uzun', o.sinif)}" data-uzunbas data-ad="${esc(o.ad || '')}"${o.sure ? ` data-sure="${o.sure}" style="--dd-uzun-sure:${+o.sure}ms"` : ''} data-onay-baslik="${esc(o.onayBaslik || o.metin)}" data-onay-metin="${esc(o.onayMetin || '')}" data-onay-eylem="${esc(o.onayEylem || o.metin)}"${o.pasif ? ' disabled' : ''}${at(o)}><i class="dd-uzun-dolgu"></i>${o.ikon ? ik(o.ikon) : ''}<span>${esc(o.metin)}</span></button>${o.yardim ? `<small class="dd-yardim">${esc(o.yardim)}</small>` : ''}</div>`;
  DD.link = (o = {}) => `<a class="dd-head__link section-heading-action" href="${esc(o.git || '#/bugun')}" aria-label="${esc(o.aria || o.metin)}">${esc(o.metin)} ${ik('tumu')}</a>`;

  // ---------- Form ----------
  DD.input = (o = {}) => { const id = o.id || `f-${o.ad || Math.random().toString(36).slice(2, 7)}`; return `<div class="${liste('dd-alan', o.hata && 'is-hata', o.sinif)}">${o.etiket ? `<label for="${esc(id)}">${esc(o.etiket)}${o.zorunlu ? ' *' : ''}</label>` : ''}<div class="${liste('dd-girdi', o.deger && 'has-text')}">${o.ikon ? ik(o.ikon) : ''}${o.cokSatir ? `<textarea id="${esc(id)}" name="${esc(o.ad || '')}" placeholder="${esc(o.yer || '')}"${o.pasif ? ' disabled' : ''}>${esc(o.deger || '')}</textarea>` : `<input id="${esc(id)}" name="${esc(o.ad || '')}" type="${esc(o.tur || 'text')}" placeholder="${esc(o.yer || '')}" value="${esc(o.deger ?? '')}"${o.pasif ? ' disabled' : ''}${o.mod ? ` inputmode="${esc(o.mod)}"` : ''} autocomplete="${esc(o.otomatik || 'off')}">`}${o.birim ? `<span class="dd-yardim">${esc(o.birim)}</span>` : ''}${o.temizle && !o.cokSatir ? `<button class="dd-ibtn dd-temizle" type="button" aria-label="Temizle">${ik('kapat')}</button>` : ''}${o.tur === 'password' ? `<button class="dd-ibtn" type="button" data-sifre-goster aria-label="Şifreyi göster">${ik('eye')}</button>` : ''}${o.sag || ''}</div>${o.hata ? `<p class="dd-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="dd-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  // Seçim alanı: girdi görünümlü düğme, sheet'te radyo listesi.
  DD.secAlan = (o = {}) => { const sec = (o.secenekler || []).find(([d]) => String(d) === String(o.deger)); return `<div class="${liste('dd-alan', o.hata && 'is-hata')}"><label id="l-${esc(o.ad)}" for="f-${esc(o.ad)}">${esc(o.etiket)}</label><div class="dd-girdi dd-secici"><button type="button" id="f-${esc(o.ad)}" class="dd-secici-dugme" data-sec-alan="${esc(o.ad)}" data-yer="${esc(o.yer || 'Seç')}" data-secenekler="${esc(JSON.stringify(o.secenekler || []))}" aria-haspopup="dialog"><span${sec ? '' : ' class="is-yer"'}>${esc(sec ? sec[1] : o.yer || 'Seç')}</span></button><span class="dd-secici-ok" aria-hidden="true">${ik('ac')}</span><input type="hidden" name="${esc(o.ad)}" value="${esc(sec ? sec[0] : '')}"></div>${o.hata ? `<p class="dd-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="dd-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  DD.arama = (o = {}) => `<div class="${liste('dd-arama', o.sinif)}" role="search"><div class="${liste('dd-girdi', o.deger && 'has-text')}">${ik('ara_')}<input type="search" name="${esc(o.ad || 'q')}" placeholder="${esc(o.yer || 'Ara')}" value="${esc(o.deger || '')}" aria-label="${esc(o.yer || 'Ara')}" autocomplete="off" enterkeyhint="search"><button class="dd-ibtn dd-temizle" type="button" aria-label="Temizle">${ik('kapat')}</button>${o.mikrofon ? `<button class="dd-ibtn dd-girdi-ses" type="button" aria-label="Sesle ara"${at({git: o.mikrofon === true ? '#/ai/ses' : o.mikrofon})}>${ik('mikrofon')}</button>` : ''}${o.filtre ? `<button class="dd-ibtn" type="button" aria-label="Filtrele" data-eylem="filtre">${ik('filtre')}</button>` : ''}${o.sonEk || ''}</div>${o.sonuc === false ? '' : '<div class="dd-arama-sonuc"></div>'}</div>`;
  DD.adimDeger = (v, birim) => `<b>${esc(v)}</b>${birim ? `<span>${esc(birim)}</span>` : ''}`;
  // Adımlayıcı: Gastro DG.adimlayici. API: DD.stepper
  DD.stepper = (o = {}) => { const {deger = 1, min = 1, max = 99, adim = 1, birim = ''} = o; return `<div class="dd-adimlayici" role="group" aria-label="${esc(o.aria || o.ad || '')}" data-adimlayici data-ad="${esc(o.ad || '')}" data-min="${min}" data-max="${max}" data-adim="${adim}" data-birim="${esc(birim)}"><button type="button" data-adim-yon="-1" aria-label="Azalt"${+deger <= min ? ' disabled' : ''}>${ik('minus')}</button><span class="dd-adim-deger"><output aria-live="polite">${DD.adimDeger(ondalik(deger, 2), birim)}</output><span class="dd-adim-iz" aria-hidden="true">${DD.adimDeger('0'.repeat(Math.max(2, String(max).length)), birim)}</span></span><input type="hidden" name="${esc(o.ad || '')}" value="${esc(deger)}"><button type="button" data-adim-yon="1" aria-label="Artır"${+deger >= max ? ' disabled' : ''}>${ik('plus')}</button></div>`; };
  // Gastro DG.secim; alt verilince Gastro profil.js:496 yapısı (span.dd-satir-metin > span + small).
  const secimEt = (o, tur) => `<label class="dd-secim"><input type="${tur}" name="${esc(o.ad || '')}" value="${esc(o.deger ?? '1')}"${o.secili ? ' checked' : ''}${o.pasif ? ' disabled' : ''}><span>${o.alt ? `<span class="dd-satir-metin"><span>${esc(o.etiket)}</span><small>${esc(o.alt)}</small></span>` : esc(o.etiket)}</span></label>`;
  DD.checkbox = (o = {}) => secimEt(o, 'checkbox');
  DD.radio = (o = {}) => secimEt(o, 'radio');
  DD.anahtar = (o = {}) => `<label class="dd-anahtar"><input type="checkbox" name="${esc(o.ad || '')}"${o.secili ? ' checked' : ''}${o.pasif ? ' disabled' : ''} aria-label="${esc(o.etiket || o.ad || '')}"><i></i></label>`;
  // Anahtarlı satır: Gastro satır + anahtar.
  DD.toggle = (o = {}) => `<div class="dd-satir">${o.ikon ? `<span class="dd-satir-ikon">${ik(o.ikon)}</span>` : ''}<span class="dd-satir-metin"><span>${esc(o.etiket)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${DD.anahtar(o)}</div>`;
  DD.slider = (o = {}) => {
    const {min, max, adim = 1, birim = '', deger = min} = o, n = Math.round((max - min) / adim), her = o.etiketHer || 10, et = [];
    for (let i = 0; i <= n; i += her) et.push(`<span style="--i:${i}">${ondalik(min + i * adim, adim % 1 && her * adim % 1 ? 1 : 0)}</span>`);
    return `<div class="dd-slider" data-c="slider" data-ad="${esc(o.ad || '')}" data-min="${min}" data-max="${max}" data-adim="${adim}" data-deger="${deger}" data-birim="${esc(birim)}"><output class="dd-slider-deger"><b class="dd-slider-sayi dd-t-numeral-xl">${ondalik(deger, adim % 1 ? 1 : 0)}</b><span>${esc(birim)}</span></output><div class="dd-slider-cetvel" role="slider" tabindex="0" aria-label="${esc(o.etiket || birim)}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${deger}"><div class="dd-slider-serit" style="--adet:${n};--her:${her}">${et.join('')}</div><i class="dd-slider-igne"></i></div></div>`;
  };
  DD.porsiyon = (o = {}) => {
    const sec = o.birimler.find(b => b.birim === o.secili) || o.birimler[0], miktar = o.miktar ?? 1, gram = sec.gram * miktar, g = sec.birim === 'gram';
    return `<div class="dd-porsiyon" data-ad="${esc(o.ad || 'porsiyon')}" data-kcal100="${+o.kcal100 || 0}"><div class="dd-serit" role="group" aria-label="Birim">${o.birimler.map(b => `<button type="button" class="dd-chip" data-birim="${esc(b.birim)}" data-gram="${b.gram}" aria-pressed="${b === sec}">${esc(b.birim)}</button>`).join('')}</div><div class="dd-ara">${DD.stepper({ad: `${o.ad || 'porsiyon'}-miktar`, deger: miktar, min: g ? 10 : .5, max: g ? 1000 : 20, adim: g ? 10 : .5, birim: sec.birim})}<div class="dd-porsiyon-ozet"><b class="dd-t-stat"><span data-p-kcal>${sayi((o.kcal100 || 0) * gram / 100)}</span> kcal</b><small class="dd-t-meta dd-ton-ikincil"><span data-p-gram>${sayi(gram)}</span> g</small></div></div></div>`;
  };
  const KESIR = [[.25, '¼'], [.5, '½'], [.75, '¾'], [1, '1'], [1.5, '1½'], [2, '2'], [2.5, '2½'], [3, '3']].map(([deger, metin]) => ({deger, metin}));
  DD.kesirIzgara = (o = {}) => `<div class="dd-kesir" data-cip-grup="tek" data-ad="${esc(o.ad || 'kesir')}">${(o.ogeler || KESIR).map(k => DD.cip({...k, secili: k.deger === (o.secili ?? 1)})).join('')}</div>`;
  DD.puan = (o = {}) => { const PUAN = ['Çok kötü', 'Kötü', 'İdare eder', 'İyi', 'Harika']; return `<fieldset class="dd-puan"><legend class="dd-sr">${esc(o.etiket || 'Puanın')}</legend><div class="dd-puan-yildizlar">${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="p-${esc(o.ad)}-${n}" name="${esc(o.ad)}" value="${n}"${n === o.deger ? ' checked' : ''}><label for="p-${esc(o.ad)}-${n}" aria-label="${n} yıldız, ${PUAN[n - 1]}">${ik('yildiz')}</label>`).join('')}</div>${o.deger ? `<span class="dd-puan-etiket">${PUAN[o.deger - 1]}</span>` : ''}</fieldset>`; };

  // Telefon alanı: Gastro DG.telefon; yalnız TR (+90), ülke sheet'i taşınmadı.
  // Telefon: Gastro DG.telefon yapısı — ülke düğmesi (bayrak 24×18 + kod + ok), görünür alan biçimli ("5xx xxx xx xx"), gönderilen değer gizli alanlarda:
  // name=ad yalnız rakam, name=ulkeAd ISO. Ülke seçim sheet'i taşınmadı: düğme aria-disabled. {ad, ulkeAd, etiket, deger, zorunlu, opsiyonel, hata, yardim}
  const telBicim = r => [r.slice(0, 3), r.slice(3, 6), r.slice(6, 8), r.slice(8, 10)].filter(Boolean).join(' ');
  DD.telefon = (o = {}) => { const ad = o.ad || 'telefon', r = String(o.deger || '').replace(/\D/g, '').replace(/^0/, '').slice(0, 10); return `<div class="${liste('dd-alan', o.hata && 'is-hata')}" data-telefon="${esc(ad)}"><label for="f-${esc(ad)}">${esc(o.etiket || 'Telefon')}${o.zorunlu ? ' *' : ''}${o.opsiyonel ? ' <span class="dd-ops">(opsiyonel)</span>' : ''}</label><div class="dd-girdi dd-telefon"><button type="button" class="dd-telefon-ulke" data-telefon-ulke aria-haspopup="dialog" aria-disabled="true" aria-label="Ülke kodu — şu an Türkiye +90"><img class="dd-telefon-bayrak" src="assets/flags/tr.svg" width="24" height="18" alt=""><span>+90</span>${ik('ac')}</button><input id="f-${esc(ad)}" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="5__ ___ __ __" value="${esc(telBicim(r))}"${o.zorunlu ? ' required' : ''}><input type="hidden" name="${esc(ad)}" value="${esc(r)}"><input type="hidden" name="${esc(o.ulkeAd || 'telefon_ulke')}" value="TR"></div>${o.hata ? `<p class="dd-hata">${ik('uyari')}${esc(o.hata)}</p>` : ''}${o.yardim ? `<p class="dd-yardim">${esc(o.yardim)}</p>` : ''}</div>`; };
  // Gastro dg-ui.js:542: yazarken gizli alana rakam, görünür alana biçim; hata hali kalkar.
  document.addEventListener('input', e => { const t = e.target; if (t.type !== 'tel') return; const k = t.closest('[data-telefon]'); if (!k) return; const r = t.value.replace(/\D/g, '').replace(/^0/, '').slice(0, 10); k.querySelector('input[type=hidden]').value = r; t.value = telBicim(r); k.classList.remove('is-hata'); });

  // ---------- Üst bar, alt menü ----------
  const logo = () => `<a class="dd-logo" href="#/bugun" aria-label="Dada Diet ana sayfa"><img src="assets/marka/dadadiet-beyaz.svg" alt="Dada Diet"></a>`;
  DD.ustBtn = (o = {}) => (typeof o === 'string' ? o : `<button class="dd-hbtn${o.ara ? ' dd-hara' : ''}" type="button" aria-label="${esc(o.etiket || '')}"${at({...o, etiket: undefined})}>${ik(o.ikon)}${o.sayi ? DD.sayacRozet(o.sayi) : ''}</button>`);
  const MENU = {ikon: 'bars', etiket: 'Menü', attrs: 'data-menu'}, ZIL = () => ({ikon: 'bildirim', etiket: 'Bildirimler', git: '#/bildirimler', attrs: 'data-zil', sayi: DD.bildirimSayi() || undefined}), ARA = {ikon: 'ara_', etiket: 'Ara', git: '#/ara', ara: true};
  // Mesaj kutusu (Instagram'daki gibi zilin yanında): diyetisyen sohbeti; rozet okunmamış diyetisyen mesajı (uzman.js / profil.js ile aynı kural).
  DD.mesajSayi = () => { const B = window.DDV?.benimDiyetisyenim; if (!DD.uye() || DD.yeniHesap() || !B?.sohbet?.mesajlar?.length) return 0; const l = [...B.sohbet.mesajlar, ...DD.durum.oku('uzman-sohbet', [])], son = DD.durum.oku('uzman-okundu', B.sohbet.mesajlar[B.sohbet.mesajlar.length - 2]?.id); return l.filter(m => m.kim !== 'ben' && m.id > son).length; };
  const MESAJ = () => ({ikon: 'comment-dots', etiket: 'Mesajlar', git: '#/uzman/sohbet', attrs: 'data-mesaj-kutu', sayi: DD.mesajSayi() || undefined});
  DD.ustVarsayilan = () => [ARA, ZIL(), MESAJ(), MENU];
  // Okunmamış sayısı: veri + kullanıcının okuduğu ve sildiği id'ler. Yığındaki bütün üst barlar birlikte tazelenir.
  DD.bildirimSayi = () => { if (!DD.uye()) return 0; const dus = new Set([...DD.durum.oku('bildirim-okundu', []), ...DD.durum.oku('bildirim-silinen', [])].map(String)); return [...(DD.yeniHesap() ? [] : window.DDV?.bildirimler || []), ...(DD.ogun?.bildirimler() || [])].filter(b => !b.okundu && !dus.has(String(b.id))).length; };
  DD.zilTazele = () => { [['[data-zil]', DD.bildirimSayi()], ['[data-mesaj-kutu]', DD.mesajSayi()]].forEach(([sec, n]) => document.querySelectorAll(sec).forEach(b => { const r = b.querySelector('.dd-sayac'); if (!n) r?.remove(); else if (r) r.textContent = n; else b.insertAdjacentHTML('beforeend', DD.sayacRozet(n)); })); };
  document.addEventListener('dd-bildirim', DD.zilTazele);
  // tur sekme | alt | banner | modal; saydam: görsel üstünde başlar. sekme: logo · ara · zil · menü. alt: geri · başlık · eylem · menü.
  DD.ustBar = (o = {}) => {
    const tur = o.tur || 'alt', foto = o.saydam ?? tur === 'banner', kok = tur === 'sekme' || (tur === 'banner' && o.geri === false);
    const sinif = liste('dd-header', foto && 'is-photo');
    if (kok) return `<header class="${sinif}">${o.sol ?? logo()}<span class="dd-hbosluk"></span>${(o.sag ?? DD.ustVarsayilan()).map(DD.ustBtn).join('')}</header>`;
    if (tur === 'modal') return `<header class="${sinif}">${DD.ustBtn({ikon: 'kapat', etiket: 'Kapat', geri: true})}<span class="dd-htitle dd-kirp-1">${esc(o.baslik || '')}</span>${(o.sag || []).map(DD.ustBtn).join('')}</header>`;
    return `<header class="${sinif}">${o.sol ?? DD.ustBtn({ikon: 'geri', etiket: 'Geri', geri: true})}<span class="dd-htitle dd-kirp-1">${esc(o.baslik || '')}</span>${(o.sag || []).map(DD.ustBtn).join('')}${o.menu === false ? '' : DD.ustBtn(MENU)}</header>`;
  };
  DD.altMenu = () => `<div class="dd-dock"><nav class="dd-nav" aria-label="Alt menü">${TK.nav.items.map(n => (n.center
    ? `<a href="${n.href}" data-uzun="fab" aria-label="${esc(n.label)}"><span class="dd-fab">${ik(n.icon)}</span><span>${esc(n.label)}</span></a>`
    : `<a href="${n.href}" data-nav="${n.id}">${ik(n.icon)}<span>${esc(n.label)}</span></a>`)).join('')}</nav></div>`;

  // ---------- Geri bildirim yüzeyleri ----------
  // Uyarı bandı: Gastro DG.ipucu kalıbı, dört durum tonu. {ton, baslik, metin, ikon, eylem}
  DD.ipucu = (o = {}) => `<aside class="${liste('dd-ipucu', o.ton && `is-${o.ton}`, o.sinif)}"><span class="dd-ipucu-ikon" aria-hidden="true">${ik(o.ikon || 'ipucu')}</span><div>${o.baslik ? `<h4>${esc(o.baslik)}</h4>` : ''}<p>${o.html ?? vurgu(o.metin || '')}</p>${o.eylem ? DD.btn({tur: 'secondary', boyut: 'sm', ...o.eylem}) : ''}</div></aside>`;
  DD.bant = (o = {}) => DD.ipucu({...o, ton: o.ton || 'bilgi', ikon: o.ikon || {bilgi: 'bilgi', basari: 'basari', uyari: 'uyari', hata: 'hata'}[o.ton || 'bilgi']});
  DD.bilgi = (o = {}) => `<div class="dd-bilgi">${o.etiket ? `<span class="dd-t-label">${o.ikon ? ik(o.ikon) : ''}${esc(o.etiket)}</span>` : ''}${o.metin ? DD.p(o.metin) : ''}${o.html || ''}</div>`;
  DD.veriYok = metin => `<p class="dd-veri-yok">${ik('bilgi')}<span>${vurgu(metin)}</span></p>`;
  DD.cevrimdisi = (metin = 'Bağlantı yok, kayıtlar bu cihazda duruyor') => `<div class="dd-cevrimdisi">${ik('baglanti')}<span>${esc(metin)}</span></div>`;
  // Boş durum: Gastro DG.durum. {ikon, baslik, metin, eylem (btn seçenekleri), tam}
  DD.bos = (o = {}) => `<div class="${liste('dd-durum', o.tam && 'is-tam', o.sinif)}"><span class="dd-durum-ikon">${ik(o.ikon || 'bilgi')}</span><h2 class="dd-t-section">${esc(o.baslik)}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.eylem ? DD.btn(o.eylem) : ''}${o.ikincil ? DD.btn({tur: 'text', ...o.ikincil}) : ''}</div>`;
  // Gastro DG.vizor: durum sahnesinin üst parçası.
  const ISARET = {soru: 'question', bulanik: 'droplet-slash', baglanti: 'wifi', yemek: 'utensils', uyari: 'triangle-exclamation', hata: 'circle-exclamation'};
  DD.vizor = (o = {}) => `<div class="${liste('dd-sahne-ust is-koyu dd-vizor', o.kompakt && 'is-kompakt', o.sinif)}"><div class="dd-sahne-cerceve${o.bulanik ? ' is-bulanik' : ''}"><span class="dd-sahne-foto"${bg(o.foto)}></span><i class="dd-kose is-ust-sol"></i><i class="dd-kose is-ust-sag"></i><i class="dd-kose is-alt-sol"></i><i class="dd-kose is-alt-sag"></i>${o.tarama ? '<i class="dd-vizor-tarama" aria-hidden="true"></i>' : ''}${o.isaret ? `<span class="dd-sahne-isaret" aria-hidden="true">${ik(ISARET[o.isaret] || o.isaret)}</span>` : ''}</div>${o.yonerge ? `<p class="dd-sahne-not">${ik(o.yonerge.ikon || 'gizlilik')}<span>${esc(o.yonerge.metin ?? o.yonerge)}</span></p>` : ''}${o.ek || ''}</div>`;
  const eylemBtn = (e, tur) => (e ? DD.btn({...e, tur: tur || e.tur, tam: true}) : '');
  // Gastro DG.durumSahne. {tema:'koyu'|'acik', gorsel, isaret, baslik, metin, not, ana, ikinciller, ipuclari:[[ikon,baslik,alt]], ipucuBaslik, ipucuParcali, oneriler (html dizi), onerilerBaslik}
  DD.durumSahne = (o = {}) => {
    const koyu = o.tema === 'koyu', isr = ISARET[o.isaret] || o.isaret || 'bilgi';
    const gorsel = koyu ? DD.vizor({foto: o.gorsel, isaret: isr, bulanik: o.isaret === 'bulanik', yonerge: o.not ? {metin: o.not} : ''}) : `<div class="dd-sahne-ust"><span class="dd-sahne-rozet" aria-hidden="true">${ik(isr)}</span></div>`;
    const ipuc = o.ipuclari?.length ? `<section class="dd-sahne-ek"><h2 class="dd-t-sub">${esc(o.ipucuBaslik || 'İpuçları')}</h2>${o.ipucuParcali ? DD.parcali(o.ipuclari.map(([ikon, baslik, alt]) => ({ikon, baslik, alt, bilgi: true}))) : `<ul class="dd-sahne-ipuclari">${o.ipuclari.map(([i, b, a]) => `<li><span class="dd-sahne-ipucu-ikon" aria-hidden="true">${ik(i)}</span><span><b>${esc(b)}</b>${a ? `<small>${esc(a)}</small>` : ''}</span></li>`).join('')}</ul>`}</section>` : '';
    const oner = o.oneriler?.length ? `<section class="dd-sahne-ek"><h2 class="dd-t-sub">${esc(o.onerilerBaslik || 'Belki bunlardan biri?')}</h2><div class="dd-serit dd-sahne-oneriler">${o.oneriler.join('')}</div></section>` : '';
    return `<div class="dd-sahne${koyu ? ' is-koyu' : ''}">${gorsel}<div class="dd-sahne-panel"><div class="dd-sahne-metin"><h1 class="dd-t-page">${esc(o.baslik)}</h1>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}</div><div class="dd-sahne-eylem">${eylemBtn(o.ana)}${(o.ikinciller || []).map(e => eylemBtn(e, 'secondary')).join('')}</div>${ipuc}${oner}</div></div>`;
  };
  const HATA = {
    baglanti: {isaret: 'baglanti', baslik: 'Bağlantı yok', metin: 'İnternet bağlantını kontrol edip **tekrar dene**.', ipucuBaslik: 'Kontrol edebileceklerin', ipuclari: [['wifi', 'Wi-Fi ya da mobil veri', 'Bağlantının açık olduğundan emin ol.'], ['plane', 'Uçak modu', 'Açıksa kapat.'], ['rotate-right', 'Yeniden dene', 'Bağlantı gelince ekran kaldığı yerden açılır.']]},
    genel: {isaret: 'uyari', baslik: 'Bir şeyler ters gitti', metin: 'Beklenmedik bir hata oluştu. **Biraz sonra** tekrar dene.'},
    zaman: {isaret: 'hourglass-half', baslik: 'Yanıt gecikti', metin: 'Sunucu zamanında yanıt vermedi. **Tekrar dene.**'},
    bulunamadi: {isaret: 'ara_', baslik: 'Bu sayfa burada değil', metin: 'Bağlantı eskimiş olabilir. **Bugün’e dönüp** oradan devam edebilirsin.'}
  };
  DD.hataEkran = (o = {}) => { const h = {...HATA[o.tur || 'genel'], ...o}; return DD.durumSahne({...h, ana: o.eylem || {metin: 'Tekrar dene', ikon: 'yenile', veri: {'dd-tazele': 1}}, ikinciller: o.ikinciller ?? (o.tur === 'bulunamadi' ? [] : [{metin: 'Bugün’e dön', ikon: 'house', yerine: '#/bugun'}])}); };
  // Gastro DG.izinIstemi. {ikon, gorsel, baslik, metin, maddeler, izin, alternatif:{metin,git}, red, reddedildi:{baslik,metin}} → {html, bar}
  DD.maddeler = l => `<ul class="dd-izin-maddeler">${l.map(([i, t, a]) => `<li><span class="dd-izin-madde-ikon" aria-hidden="true">${ik(i)}</span><span><b>${esc(t)}</b>${a ? `<small>${esc(a)}</small>` : ''}</span></li>`).join('')}</ul>`;
  DD.izinIstemi = (o = {}) => {
    const r = !!o.red, b = r ? o.reddedildi : o;
    const html = `<div class="dd-izin${r ? ' is-red' : ''}">${DD.gulucuk({gorsel: o.gorsel, rozet: r ? 'lock' : o.ikon, red: r})}<div class="dd-ic dd-izin-govde"><h1 class="dd-t-page">${esc(b.baslik)}</h1><p class="dd-izin-metin">${vurgu(b.metin)}</p>${!r && o.maddeler?.length ? DD.maddeler(o.maddeler) : ''}</div></div>`;
    const ikinci = o.alternatif ? DD.btn({metin: o.alternatif.metin, tur: 'secondary', git: o.alternatif.git}) : DD.btn({metin: 'Şimdi değil', tur: 'secondary', geri: true});
    return {html, bar: `<div class="dd-bar"><div class="dd-bar-ic">${ikinci}${r ? DD.btn({metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'}) : DD.btn({metin: o.izin || 'İzin ver', attrs: 'data-izin-ver'})}</div></div>`};
  };

  // ---------- İskelet (Gastro DG.iskelet) ----------
  const isk = (cls, ek = '') => `<span class="dd-iskelet ${cls}"${ek}></span>`;
  const ISK = {
    kart: () => `<div class="dd-isk-kart">${isk('is-kart')}${isk('is-etiket')}${isk('is-satir')}${isk('is-satir is-kisa')}<span class="dd-isk-yazar">${isk('is-avatar20')}${isk('is-satir is-ad')}</span></div>`,
    satir: () => `<div class="dd-isk-satir">${isk('is-kucuk')}<span class="dd-isk-metin">${isk('is-satir')}${isk('is-satir is-kisa')}</span></div>`,
    liste: () => `<div class="dd-isk-satir is-kart">${isk('is-liste-foto')}<span class="dd-isk-metin">${isk('is-etiket')}${isk('is-satir')}${isk('is-satir is-kisa')}</span></div>`,
    izgara: () => isk('is-kare')
  };
  // tur kart | satir | liste | izgara | detay | profil | ekran. Eski sıra da kabul: DD.iskelet('liste', 3)
  DD.iskelet = (a = 4, b = 'kart') => {
    let tur = b, n = a; if (typeof a === 'string') { tur = a; n = typeof b === 'number' ? b : 4; }
    if (tur === 'ekran') tur = 'detay';
    if (tur === 'detay') return `<div class="dd-isk-detay" aria-busy="true" inert>${isk('is-kapak')}<div class="dd-ic dd-yigin-12">${isk('is-baslik')}${isk('is-satir is-kisa')}<span class="dd-isk-cipler">${isk('is-cip')}${isk('is-cip')}${isk('is-cip')}</span>${Array.from({length: n}, (_, i) => isk(`is-satir${i % 3 === 2 ? ' is-kisa' : ''}`)).join('')}</div></div>`;
    if (tur === 'profil') return `<div class="dd-isk-profil" aria-busy="true" inert>${isk('is-kapak is-kisa-kapak')}<span class="dd-isk-avatar">${isk('is-avatar96')}</span><div class="dd-ic dd-yigin-12">${isk('is-baslik is-orta')}${isk('is-satir is-orta is-kisa')}<span class="dd-isk-sayac">${isk('is-sayi')}${isk('is-sayi')}${isk('is-sayi')}${isk('is-sayi')}</span>${isk('is-sekme')}</div></div>`;
    const kap = tur === 'satir' ? 'dd-yigin' : tur === 'liste' ? 'dd-yigin-12' : tur === 'izgara' ? 'dd-izgara-3' : 'dd-izgara';
    return `<div class="${kap}" aria-busy="true" inert>${Array.from({length: n}, () => (ISK[tur] || ISK.kart)()).join('')}</div>`;
  };

  // ---------- Liste ----------
  // satir: Gastro DG.satir. {ikon, sol, gorsel, baslik, baslikHtml, alt, ek, ozet, deger, sag, ok, git, veri, duz, yikici, sinif}
  // Diet ekleri: ek = metin sütununda alt satırın altına HTML (durum rozeti; sağda yer kaplayıp başlığı daraltmaz), ozet = alt en çok 2 satır.
  DD.satir = (o = {}) => {
    const sol = o.sol || (o.gorsel !== undefined ? DD.gorsel({src: o.gorsel, ad: o.baslik, ton: o.gorselTon}) : o.avatar ? DD.avatar(o.avatar) : o.ikon ? `<span class="dd-satir-ikon">${ik(o.ikon)}</span>` : '');
    const tik = !o.duz && (o.git || o.yerine || o.geri || o.veri || o.attrs);
    const ic = `${sol}<span class="dd-satir-metin"><span>${o.baslikHtml || esc(o.baslik)}</span>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.ek || ''}</span>${o.deger != null ? `<b class="dd-satir-deger">${esc(o.deger)}</b>` : ''}${o.sag || ''}${(o.ok ?? !!tik) ? ik('satirOk') : ''}`;
    const c = liste('dd-satir', o.yikici && 'is-yikici', o.ozet && 'is-ozet', o.sinif);
    return tik ? `<button class="${c}" type="button"${at(o)}>${ic}</button>` : `<div class="${c}"${o.duz ? at({...o, git: undefined, veri: undefined}) : ''}>${ic}</div>`;
  };
  // Eylemli satır kabı: satır + sonda ayrı ikon düğmeleri (son aramalar).
  DD.satirKap = (satir, dugmeler = '') => `<div class="dd-satir-kap">${typeof satir === 'string' ? satir : DD.satir(satir)}${dugmeler}</div>`;
  DD.satirlar = (ogeler, o = {}) => `<div class="${liste('dd-satirlar', o.sinif)}">${ogeler.map(x => (typeof x === 'string' ? x : DD.satir(x))).join('')}</div>`;
  // Gastro DG.parcali. ogeler [{ikon, baslik, alt, git, veri, attrs, ana, yikici, bilgi, rozet}], {aria, kutu:'yatay'|'izgara'}
  DD.parcali = (ogeler, o = {}) => `<ul class="${liste('dd-parcali', o.kutu && `is-${o.kutu}`)}"${o.aria ? ` aria-label="${esc(o.aria)}"` : ''}>${ogeler.map(x => { const ic2 = `${x.rozet ? `<span class="dd-rozet dd-parcali-rozet">${esc(x.rozet)}</span>` : ''}${x.avatar ? DD.avatar({...x.avatar, boyut: 56}) : `<span class="dd-parcali-ikon" aria-hidden="true">${ik(x.ikon || 'satirOk')}</span>`}<span class="dd-parcali-metin"><b>${esc(x.baslik)}</b>${x.alt && !o.kutu ? `<small>${esc(x.alt)}</small>` : ''}</span>${x.bilgi ? '' : ik('satirOk', 'dd-parcali-ok')}`, c = liste('dd-parcali-oge', x.ana && 'is-ana', x.yikici && 'is-yikici', x.bilgi && 'is-bilgi'); return `<li>${x.bilgi ? `<div class="${c}">${ic2}</div>` : `<button class="${c}" type="button"${x.pasif ? ' aria-disabled="true"' : ''}${at(x)}>${ic2}</button>`}</li>`; }).join('')}</ul>`;
  // Bölüm başlığı: Gastro DG.bas (.dd-head). Önünde ikon yok.
  // Alt sayfa grupları (Gastro ortak/sayfalar/ayarlar.css .ay-gruplar, Flutter SettingsGroups): tek zemin, başlık + kartsız ince ayraçlı satırlar, grup arası 24.
  // gruplar: [{baslik, eylem, satirlar:[DD.satir seçenekleri | html], html}] · o.bas: grupların üstüne (profil kartı, açıklama)
  DD.gruplar = (gruplar, o = {}) => `<div class="dd-ic dd-gruplar">${o.bas || ''}${gruplar.filter(Boolean).map(g => (typeof g === 'string' ? g : `<section class="dd-grup">${g.baslik ? DD.bas(g.baslik, g.eylem) : ''}${g.satirlar ? DD.satirlar(g.satirlar) : ''}${g.html || ''}</section>`)).join('')}</div>`;
  DD.bas = (baslik, eylem) => `<div class="dd-head"><h2>${esc(baslik)}</h2>${eylem?.html ?? (eylem ? DD.link({metin: eylem.metin || 'Tümü', git: eylem.git, aria: `${baslik} tümü`}) : '')}</div>`;
  // Bölüm: Gastro .dd-bolum (padding 32 gutter). {baslik, eylem, git, html, gri, ic:false kabuksuz, id}
  DD.bolum = (o = {}) => `<section class="${liste(o.ic !== false && 'dd-bolum', o.gri && 'is-gri', o.sinif)}"${at({id: o.id})}>${o.baslik ? DD.bas(o.baslik, o.eylem ? (typeof o.eylem === 'string' ? {metin: o.eylem, git: o.git} : o.eylem) : null) : ''}${o.html || ''}</section>`;
  DD.yatay = (ogeler, o = {}) => `<div class="${liste('dd-serit', o.kart && 'is-kart', o.sinif)}">${ogeler.join('')}</div>`;
  DD.ikiliSerit = (ogeler, etiket = 'Liste') => `<section class="dd-pairs" aria-roledescription="carousel" aria-label="${esc(etiket)}"><div class="dd-pairs__track" tabindex="0">${ogeler.map(h => `<div class="dd-pairs__item">${h}</div>`).join('')}</div></section>`;
  // Sayaç bandı: Gastro .dd-istatistik. [{deger, etiket}], {yalin}
  DD.stat = (ogeler, o = {}) => `<dl class="${liste('dd-istatistik', o.yalin && 'is-yalin', o.sinif)}" data-sutun="${ogeler.length}">${ogeler.map(x => `<div><dt>${esc(x.etiket)}</dt><dd>${esc(x.deger)}${x.birim ? ` ${esc(x.birim)}` : ''}</dd></div>`).join('')}</dl>`;
  // Foto üstü sayaç şeridi: Gastro .dd-stats. [{deger, etiket}]
  DD.stats = l => `<p class="dd-stats${l.length === 1 ? ' is-tek' : ''}">${l.map(x => `<span><b>${esc(x.deger)}</b> ${esc(x.etiket)}</span>`).join('<span class="dd-stats-ayrac" aria-hidden="true"></span>')}</p>`;
  // Üçlü özet: Gastro .dd-ozet. [{ikon, etiket, deger, birim}]
  DD.ozet = l => `<div class="dd-ozet">${l.map(x => `<div><small>${x.ikon ? ik(x.ikon) : ''} ${esc(x.etiket)}</small><b class="dd-t-stat">${esc(x.deger)}</b>${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</div>`).join('')}</div>`;
  // Akordiyon: tek açık. [{baslik, alt, ikon, icerik}], {acik}. Akordeon (details): DD.ako
  DD.akordiyon = (bolumler, o = {}) => { const ad = o.ad || `ak${Math.random().toString(36).slice(2, 6)}`, acik = o.acik ?? 0, basIc = b => `<span class="dd-bolum-ikon" aria-hidden="true">${ik(b.ikon || 'layer-group')}</span><span class="dd-bolum-metin"><b>${esc(b.baslik)}</b>${b.alt ? `<small>${esc(b.alt)}</small>` : ''}</span><span class="dd-bolum-sag">${b.sag || ''}${ik('ac')}</span>`; return `<div class="dd-akordiyon" data-akordiyon>${bolumler.map((b, i) => { const on = i === acik; return `<section class="dd-ak-bolum${on ? ' is-acik' : ''}"><h3 class="dd-ak-h"><button type="button" class="dd-bolum-bas" id="${ad}-b${i}" aria-expanded="${on}" aria-controls="${ad}-g${i}">${basIc(b)}</button></h3><div class="dd-ak-panel" id="${ad}-g${i}" role="region" aria-labelledby="${ad}-b${i}"${on ? '' : ' inert'}><div class="dd-ak-ic">${b.icerik || ''}</div></div></section>`; }).join('')}</div>`; };
  DD.ako = (o = {}) => `<div class="dd-akordeon"><details${o.acik ? ' open' : ''}><summary><span>${esc(o.baslik)}</span>${ik('ac')}</summary><div class="dd-ak-govde">${o.html || ''}</div></details></div>`;

  // ---------- Ekran kabuğu ----------
  // Kubbe (liste-v2): banner 320 + sayaç + panel. Detay (detay-v2): perde:'kart', rol:'display', etiket. {gorsel, baslik, alt, etiket, stat, html, perde, rol}
  DD.kubbe = (o = {}) => { const kart = o.perde === 'kart'; return `<section class="${liste('dd-banner', kart && 'is-kart dd-veil-bottom', o.rol === 'display' && 'is-detay')}"${kart ? '' : ' data-c="kubbe"'}><div class="dd-banner-foto"${bg(o.gorsel)}></div>${kart ? '<span class="dd-banner-ust" aria-hidden="true"></span><span class="dd-banner-golge" aria-hidden="true"></span>' : ''}<div class="dd-banner-metin"${kart ? ' data-dd-veil-from' : ''}>${o.etiket ? `<span class="dd-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="dd-t-${o.rol || 'page'}">${esc(o.baslik)}</h1>${o.alt ? `<p>${esc(o.alt)}</p>` : ''}${o.stat ? DD.stats(o.stat) : ''}</div></section><div class="dd-panel${o.arac ? ' dd-liste-panel' : ''}">${o.arac || ''}${o.arac ? `<div class="dd-liste-icerik">${o.html || ''}</div>` : o.html || ''}</div>`; };
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  // Gastro kubbeBoya: liste-v2 paintBanner eğrisi (49 durak).
  DD.kubbeBoya = banner => {
    const title = banner?.querySelector('h1'); if (!title || !title.offsetParent) return;
    const px = n => TK.space[n], h = banner.offsetHeight, textTop = title.getBoundingClientRect().top - banner.getBoundingClientRect().top;
    const at_ = Math.max(0, textTop - px(24)), start = Math.max(0, at_ - px(48) * 2), full = .8, end = .9;
    const lower = y => (y <= at_ ? full * smooth((y - start) / Math.max(1, at_ - start)) : full + (end - full) * smooth((y - at_) / Math.max(1, h - at_)));
    const H = TK.size.header, upper = y => .76 * (1 - smooth((y - H) / (px(48) * 2))), a = y => 1 - (1 - upper(y)) * (1 - lower(y));
    banner.style.setProperty('--dd-veil', `linear-gradient(180deg,${Array.from({length: 49}, (_, i) => `color-mix(in srgb,var(--dd-overlay) ${(a(h * i / 48) * 100).toFixed(2)}%,transparent) ${(i * 100 / 48).toFixed(3)}%`).join(',')})`);
  };
  // Gülücük kapak (Gastro DG.gulucuk): hero; {gorsel, icerik|html, rozet, red, baslik, alt, etiket, kisa}
  DD.gulucuk = (o = {}) => { const metin = o.baslik ? `<div class="dd-foto-metin" data-dd-veil-from>${o.etiket ? `<span class="dd-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="dd-t-${o.rol || 'display'}">${esc(o.baslik)}</h1>${o.alt ? `<p class="dd-t-meta">${esc(o.alt)}</p>` : ''}</div>` : ''; return `<div class="${liste('dd-gkap', o.rozet && 'has-rozet', o.sinif)}"><section class="dd-gulucuk dd-gkapak dd-veil-top dd-veil-bottom${o.ust ? ' is-ust' : ''}${o.perde === 'tam' ? ' is-perdeli' : ''}"${bg(o.gorsel)}><span class="dd-gkapak-golge" aria-hidden="true"></span><span class="dd-gkapak-isik" aria-hidden="true"></span>${o.icerik ?? o.html ?? ''}${metin}</section>${o.rozet ? `<span class="dd-gkapak-rozet${o.red ? ' is-red' : ''}" aria-hidden="true">${ik(o.rozet)}</span>` : ''}</div>`; };
  // Profil başı: Gastro DG.profilBas. {ad, alt, kapak, eylem, sayaclar:[{deger,etiket}]}
  DD.profilBas = (o = {}) => `<header class="dd-profil-bas"><div class="dd-profil-kapak dd-gulucuk${o.ust ? ' is-ust' : ''}"${bg(o.kapak)}></div><div class="dd-profil-kimlik">${DD.avatar({ad: o.ad, gorsel: o.gorsel, boyut: 96, sinif: o.avatarSinif})}<div class="dd-profil-ad"><h1 class="dd-t-page">${esc(o.ad)}</h1>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}${o.eylem || ''}</div></div>${o.sayaclar?.length ? `<div class="dd-ic">${DD.stat(o.sayaclar)}</div>` : ''}</header>`;
  DD.banner = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="dd-feature dd-feature-kart"${at({git: o.git})}><div class="dd-feature__media"><span class="dd-feature__visual"><span class="dd-photo"${bg(o.gorsel)}></span></span><span class="dd-feature__veil" aria-hidden="true"></span><div class="dd-feature__info"><div class="dd-card__text">${o.etiket ? `<span class="dd-card__category">${esc(o.etiket)}</span>` : ''}<h3 class="dd-card__title">${esc(o.baslik)}</h3></div>${o.alt ? `<div class="dd-author"><span class="dd-author__name">${esc(o.alt)}</span></div>` : ''}${o.stat ? DD.stats(o.stat) : ''}</div></div></${o.git ? 'button' : 'div'}>`;
  // Alt eylem çubuğu: Gastro .dd-bar + cook-bar ikonları. {dugmeler:[btn seçenekleri|html], ikonlar:[{ikon,sayi,ad,basili,veri}], sol}
  DD.altEylem = (o = {}) => `<div class="dd-bar"><div class="dd-bar-ic">${o.sol ? `<div class="dd-bar-sol">${o.sol}</div>` : ''}${o.ikonlar ? `<div class="dd-bar-ikonlar">${o.ikonlar.map(x => `<button type="button" class="dd-bar-ikon" aria-label="${esc(x.ad || '')}"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''}${at({git: x.git, veri: x.veri, attrs: x.attrs})}>${ik(x.ikon)}${x.sayi != null ? `<small>${esc(x.sayi)}</small>` : ''}</button>`).join('')}</div>` : ''}${(o.dugmeler || []).map(b => (typeof b === 'string' ? b : DD.btn(b))).join('')}</div></div>`;
  // Kayan alt çubuk: Gastro DG.eylemCubugu; banner geçilince belirir. eylemler: [{ikon, ad, sayi, basili (aria-pressed), git, veri, attrs}]; aria-label sayıyı da okur.
  DD.kayanBar = (o = {}) => `<div class="dd-bar dd-kayan" inert><div class="dd-bar-ic"><div class="dd-kayan-kim">${o.gorsel ? `<span class="dd-kayan-foto"${bg(o.gorsel)} aria-hidden="true"></span>` : ''}<b class="dd-kayan-baslik">${esc(o.baslik)}</b></div><div class="dd-kayan-eylem">${(o.eylemler || []).map(x => `<button type="button" class="dd-kayan-btn"${x.basili != null ? ` aria-pressed="${!!x.basili}"` : ''} aria-label="${esc(x.ad)}${x.sayi != null ? ` (${esc(x.sayi)})` : ''}"${at({...x, etiket: undefined})}>${ik(x.ikon)}${x.sayi != null ? `<small>${esc(x.sayi)}</small>` : ''}</button>`).join('')}</div></div></div>`;

  // ---------- Kartlar ----------
  DD.kart = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="${liste('dd-kart', o.gri && 'is-gri', o.sinif)}"${at({git: o.git})}>${o.html || ''}</${o.git ? 'button' : 'div'}>`;
  // Eylem kartı: Gastro .dd-eylem (80, 44 ikon). {ikon, baslik, alt, rozet, git, veri, secili, bilgi}
  DD.eylemKart = (o = {}) => `<${o.bilgi ? 'div' : 'button type="button"'} class="${liste('dd-eylem', o.secili && 'is-secili', o.bilgi && 'is-bilgi', o.sinif)}"${at(o)}><span class="dd-eylem-ikon" aria-hidden="true">${ik(o.ikon)}</span><span class="dd-eylem-metin"><b>${esc(o.baslik)}${o.rozet ? DD.rozet({metin: o.rozet}) : ''}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span>${o.bilgi ? '<span></span>' : ik('satirOk')}</${o.bilgi ? 'div' : 'button'}>`;
  // İçerik kartı: Gastro DG.puf (.dgu-puf) birebir: foto 4:3, altında kategori etiketi (label, büyük harf) · başlık (2 satır) · meta.
  // {gorsel, kategori, baslik, meta, metaIkon ('saat'), git}. Kategori fotoğraf üstü rozet değil (eski Diet eki .dd-puf-rozet kaldırıldı).
  DD.icerikKart = (o = {}) => `<button type="button" class="${liste('dd-puf', o.sinif)}"${at(o)}><span class="dd-puf-foto"${bg(o.gorsel)}></span><span class="dd-puf-metin">${o.kategori ? `<small>${esc(o.kategori)}</small>` : ''}<b>${esc(o.baslik)}</b>${o.meta ? `<span>${ik(o.metaIkon || 'saat')}${esc(o.meta)}</span>` : ''}</span></button>`;
  // Bildirim: Gastro .dd-bildirim; okunmamış kalın + tint kutu, nokta yok.
  DD.bildirimSatir = (b, o = {}) => `<button type="button" class="${liste('dd-bildirim', !b.okundu && 'is-okunmadi', o.sinif)}"${at({git: o.git, veri: {id: b.id}})}><span class="dd-bildirim-ikon" aria-hidden="true">${ik(b.ikon)}</span><span class="dd-bildirim-metin"><b>${esc(b.baslik)}</b><p>${esc(b.metin)}</p><small class="dd-bildirim-meta">${b.okundu ? '' : DD.durumRozet({metin: 'Yeni', ton: 'basari'})}<span>${esc([o.meta ?? b.tur_ad, b.zaman].filter(Boolean).join(' · '))}</span></small></span></button>`;
  DD.yorum = (o = {}) => `<div class="dd-yorum">${o.ad ? DD.avatar({ad: o.ad}) : ''}<div class="dd-yorum-metin">${o.ad ? `<b>${esc(o.ad)}</b>` : ''}<p>${esc(o.metin)}</p>${o.meta ? `<small>${esc(o.meta)}</small>` : ''}</div></div>`;
  // Yorum bölümü: Gastro DG.yorumBolumu. {baslik, yorumlar:[{yazar, tarih, puan, metin}], ozet:{puan, sayi, dagilim:[[yildiz,adet]]}, bos}
  const yildiz = (v, c = '') => `<span class="dd-uz-stars ${c}" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="icon fa-solid fa-star${n <= Math.round(v) ? ' on' : ''}"></i>`).join('')}</span>`;
  DD.yorumBolumu = (o = {}) => {
    const Y = o.yorumlar || [], z = o.ozet, mx = z ? Math.max(1, ...z.dagilim.map(x => x[1])) : 1;
    const oz = z?.puan ? `<div class="dd-uz-rating"><div class="dd-uz-rating-score"><b>${esc(ondalik(z.puan, 1))}</b>${yildiz(z.puan)}<small>${esc(z.sayi)} değerlendirme</small></div><ul class="dd-uz-rating-bars">${z.dagilim.map(([st, c]) => `<li><span class="dd-uz-bar-label">${st}${ik('yildiz')}</span><span class="dd-uz-bar-track"><i style="width:${c / Math.max(z.sayi, mx) * 100}%"></i></span><span class="dd-uz-bar-count">${c}</span></li>`).join('')}</ul></div>` : '';
    const liste_ = Y.length ? `<div class="dd-yrm-liste">${Y.map(y => `<article class="review"><div class="review-head"><span class="avatar" aria-hidden="true">${esc(String(y.yazar || '?').slice(0, 1).toLocaleUpperCase('tr'))}</span><div class="dd-uz-review-who"><span class="dd-uz-review-ad"><b>${esc(y.yazar)}</b></span><span class="dd-uz-review-meta">${esc(y.tarih || '')}</span></div>${y.puan ? yildiz(y.puan, 'dd-uz-review-stars') : ''}</div><p>${esc(y.metin)}</p></article>`).join('')}</div>` : `<div class="review-empty"><span class="dd-uz-box-icon">${ik('comment-dots')}</span><p>${esc(o.bos || 'Henüz yorum yapılmamış. İlk yorumu sen yaz.')}</p></div>`;
    return `<section class="dd-yrm"><div class="dd-yrm-bas"><span class="dd-t-label">${ik('comments')} Yorumlar</span><h2 class="dd-t-section">${esc(o.baslik || 'Yorumlar')} (${sayi(Y.length)})</h2></div>${oz}${liste_}</section>`;
  };
  // Paylaş sheet'i: Gastro DG.paylas birebir — 3 sütun marka ızgarası + tek satır bağlantı alanı ve "Kopyala" (+ cihaz paylaşımı varsa "Diğer uygulamalar").
  // {baslik, url, alt, kopyala (varsayılan true; false kopya satırını gizler)}. Kopyalama başarısızsa alan seçilir, kullanıcı elle kopyalar.
  DD.paylas = (o = {}) => {
    const url = o.url || location.href, baslik = o.baslik || document.title, u = encodeURIComponent(url), t = encodeURIComponent(baslik), fab = n => `<i class="icon fa-brands fa-${n}" aria-hidden="true"></i>`;
    const K = [['Facebook', fab('facebook-f'), 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`], ['X', fab('x-twitter'), 'x', `https://twitter.com/intent/tweet?url=${u}&text=${t}`], ['WhatsApp', fab('whatsapp'), 'whatsapp', `https://wa.me/?text=${t}%20${u}`], ['Telegram', fab('telegram'), 'telegram', `https://t.me/share/url?url=${u}&text=${t}`], ['Pinterest', fab('pinterest-p'), 'pinterest', `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`], ['E-posta', ik('envelope'), 'eposta', `mailto:?subject=${t}&body=${u}`]];
    const kopya = o.kopyala === false ? '' : `<div class="dd-paylas-kopya"><label class="dd-girdi">${ik('link')}<input type="text" readonly value="${esc(url)}" aria-label="Paylaşım bağlantısı"></label>${DD.btn({metin: 'Kopyala', tur: 'secondary', ikon: 'copy', attrs: 'data-kopyala aria-label="Bağlantıyı kopyala"'})}</div>`;
    const yerel = navigator.share ? `<div class="dd-paylas-yerel">${DD.btn({metin: 'Diğer uygulamalar', tur: 'text', ikon: 'share-from-square', attrs: 'data-yerel'})}</div>` : '';
    return DD.sheet({baslik: 'Paylaş', html: `${o.alt ? `<p class="dd-paylas-ne">${esc(o.alt)}</p>` : ''}<ul class="dd-paylas-izgara" aria-label="Paylaşım kanalları">${K.map(([a, i, m, h]) => `<li><a class="dd-paylas-oge" data-marka="${m}" href="${h}" target="_blank" rel="noopener" aria-label="${a} ile paylaş"><span class="dd-paylas-ikon">${i}</span><span class="dd-paylas-ad">${a}</span></a></li>`).join('')}</ul>${kopya}${yerel}`, sonra: d => {
      const tik = e => {
        const k = e.target.closest('[data-kopyala]');
        if (k) {
          e.preventDefault();
          let is; try { is = navigator.clipboard.writeText(url); } catch { is = Promise.reject(); }
          Promise.resolve(is).then(() => { k.innerHTML = `${ik('onay')}<span>Kopyalandı</span>`; k.dataset.kopyalandi = ''; DD.toast('Bağlantı kopyalandı', {ikon: 'link'}); }, () => { const i = d.querySelector('.dd-paylas-kopya input'); i.focus(); i.select(); DD.toast('Bağlantıyı seçip kopyalayabilirsin'); });
        } else if (e.target.closest('[data-yerel]')) { e.preventDefault(); navigator.share({title: baslik, url}).catch(() => {}); d.kapat(); } else if (e.target.closest('.dd-paylas-oge')) setTimeout(() => d.kapat(), 0);
      };
      d.addEventListener('click', tik);
      return () => d.removeEventListener('click', tik);
    }});
  };
  // İçerik bloğu: Gastro DG.icerikBlok (docs/51 DgContentBlock) — numara + başlık + bölüm paylaş; altında görsel (4:3, figcaption) ve metin (.dd-metin), ya da video.
  // {no, baslik, html, gorsel, aciklama, video:{poster}, id, paylasUrl}. Paylaş düğmesi (data-blok-paylas) aşağıdaki genel dinleyiciyle DD.paylas açar.
  DD.icerikBlok = (o = {}) => `<section class="dd-blok"${o.id ? ` id="${esc(o.id)}"` : ''}><header class="dd-blok-bas">${o.no != null ? `<span class="dd-blok-no" aria-hidden="true">${esc(o.no)}</span>` : ''}<h2>${esc(o.baslik)}</h2><button type="button" class="dd-ibtn" data-blok-paylas="${esc(o.paylasUrl || (location.href.split('#')[0] + (o.id ? `#${o.id}` : '')))}" data-blok-baslik="${esc(o.baslik)}" aria-label="“${esc(o.baslik)}” bölümünü paylaş">${ik('paylas')}</button></header>${o.gorsel ? `<figure class="dd-blok-gorsel"><span class="dd-blok-foto" role="img" aria-label="${esc(o.aciklama || o.baslik)}"${bg(o.gorsel)}></span>${o.aciklama ? `<figcaption>${esc(o.aciklama)}</figcaption>` : ''}</figure>` : ''}${o.html ? `<div class="dd-metin">${o.html}</div>` : ''}${o.video ? `<div class="dd-oynatici dd-blok-video"${bg(o.video.poster)}><button class="dd-oynatici-dugme" type="button" aria-label="Videoyu oynat">${ik('play')}</button></div>` : ''}</section>`;
  // Gastro dg-ui genel dinleyicisi: bölüm paylaş. Ekran kendi dinleyicisiyle zaten bir paylaş sheet'i açtıysa ikinciyi açmaz.
  document.addEventListener('click', e => {
    const b = e.target.closest?.('[data-blok-paylas]');
    if (!b || document.querySelector('.dd-sheet-kap .dd-paylas-izgara')) return;
    DD.paylas({baslik: b.dataset.blokBaslik, url: b.dataset.blokPaylas, alt: b.dataset.blokBaslik});
  });

  // ---------- Seçim ----------
  // Gastro DG.secimKart. {k|deger|id, ad, alt, ikon, olcek (1-5), gorsel, secili, tek}
  DD.secimKart = (o = {}) => { const on = o.ikon ? `<span class="dd-secim-on dd-secim-ikon" aria-hidden="true">${ik(o.ikon)}</span>` : o.olcek ? `<span class="dd-secim-on dd-secim-olcek" aria-hidden="true">${[1, 2, 3, 4, 5].map(x => `<i class="${x <= o.olcek ? 'is-on' : ''}"></i>`).join('')}</span>` : ''; const k = o.k ?? o.deger ?? o.id; return `<button type="button" class="${liste('dd-secim-kart', o.gorsel ? 'is-foto' : !on && 'is-metin')}" data-k="${esc(k)}" ${o.tek ? `role="radio" aria-checked="${!!o.secili}"` : `aria-pressed="${!!o.secili}"`}>${o.gorsel ? `<span class="dd-secim-foto"${bg(o.gorsel)} aria-hidden="true"></span>` : on}<span class="dd-secim-metin"><b>${esc(o.ad)}</b>${o.alt ? `<small>${esc(o.alt)}</small>` : ''}</span><span class="dd-secim-kutu" aria-hidden="true"><span class="choice-mark">${ik('onay')}</span></span></button>`; };
  // Izgara: {ad, ogeler, secili, coklu, duzen:'tek'|'iki'|'uc'|'orta'}
  DD.secimler = (o = {}) => { const s = [].concat(o.secili ?? []); return `<div class="${liste('dd-secim-izgara', ...[].concat(o.duzen ?? 'tek').flatMap(d => String(d).split('-')).map(d => ({tek: 'is-tek', uc: 'is-uc', orta: 'is-orta'}[d])), o.sinif)}" role="${o.coklu ? 'group' : 'radiogroup'}" data-ad="${esc(o.ad || '')}">${o.ogeler.map(x => { const k = x.k ?? x.deger ?? x.id; return DD.secimKart({...x, k, tek: !o.coklu, secili: s.includes(k)}); }).join('')}</div>`; };
  // Onboarding adım şablonu: .dd-adim üstte, geri aynı satırda; altta .dd-bar.
  DD.onbSablon = (o = {}) => `<div class="dd-onb"><div class="dd-onb-ust">${o.geri === false ? '<span class="dd-onb-bos"></span>' : `<button class="dd-ibtn" type="button" data-geri aria-label="Geri">${ik('geri')}</button>`}${DD.adimGosterge({adim: o.adim, toplam: o.toplam})}${o.atla ? DD.btn({metin: o.atla.metin || 'Atla', tur: 'text', ...o.atla}) : '<span class="dd-onb-bos"></span>'}</div><div class="dd-onb-govde dd-yigin">${DD.metinBlok({baslik: o.baslik, metin: o.alt, rol: 'page', h: 1})}${o.neden ? DD.btn({metin: o.neden, tur: 'text', veri: {eylem: 'neden'}, sinif: 'dd-onb-neden'}) : ''}<div class="dd-onb-icerik">${o.html || ''}</div></div>${o.devam === false ? '' : `<div class="dd-onb-alt">${DD.btn({metin: 'Devam', tam: true, ...(o.devam || {})})}${o.altMetin ? `<small class="dd-yardim">${esc(o.altMetin)}</small>` : ''}</div>`}</div>`;
  // ---------- Diet kartları ----------
  // Program kartı: DDCard ailesi. tur card (dikey 4:5) | row (satır) | tile (foto üstü) | feature (öne çıkan) | aktif (eylem kartı + ilerleme)
  DD.programKart = (p, o = {}) => {
    const tur = o.tur === 'liste' ? 'row' : o.tur === 'rail' ? 'tile' : o.tur || 'card';
    const git = o.git ?? `#/program/${p.slug}`;
    if (tur === 'aktif') return `<button type="button" class="dd-eylem dd-eylem-program" data-git="${esc(git)}"><span class="dd-kayan-foto"${bg(p.kapak)} aria-hidden="true"></span><span class="dd-eylem-metin"><b>${esc(p.ad)}</b>${DD.ilerleme({n: o.gun, hedef: o.toplam, etiket: `${o.gun}. gün`, deger: `${o.toplam} gün`})}</span>${ik('satirOk')}</button>`;
    return DDCard.kart({baslik: p.ad, kategori: p.kategori, gorsel: p.kapak, sureGun: p.sureGun, ogun: p.gunlukOgun, alt: [p.kcalMin ? `${sayi(p.kcalMin)}-${sayi(p.kcalMax)} kcal` : '', p.zorluk].filter(Boolean).join(' · '), git, kayitli: o.kayitli, id: p.slug}, tur);
  };
  // Diyetisyen kartı (Beyar revize, 10 Kasım: şef kartı kalıbı reddedildi; web vitrin kartı onaylı). Dört tür:
  //   liste (varsayılan liste görünümü; 'tam' eş anlamlı): kompakt pazar yeri kartı — avatar 56 dolu ton · ad + "unvan · N yıl" · sağda fiyat/seans;
  //     uzmanlık çipleri (en çok 2 + "+N"); ikonlu meta (şehir · görüşme · uygunluk rozeti); dd-ikili eşit iki düğme. Kart dokununca profile gider.
  //   kart (ızgara): web vitrin kartı — tonlu kapak bandı + uzmanlık ikonu, banda binen avatar 64, ad, unvan, 1 çip, "şehir · fiyat", "Profili gör".
  //   satir: yazar satırı (avatar 40).
  // {git (null: kart bağlantısız), eylem, ikincil, uygun:{metin, ton}, fiyat (TL; varsayılan tek seans), not (meta satırına ek metin)}. eylem.secili → tonal + onay hali.
  // Fotoğraf verisi yok (webde de yok): web KART_TONLARI fikri, dolu ton zemin + beyaz harf; ton kişinin veri sırasından (DD.uzmanTon).
  const UZ_IKON = {'Kilo Yönetimi': 'weight-scale', 'Sporcu Beslenmesi': 'dumbbell', 'Gebelik & Emzirme': 'person-pregnant', 'Geriatri Beslenmesi': 'person-cane', 'Hormonal Denge & PCOS': 'venus', 'Bağırsak Sağlığı': 'seedling', 'Çocuk & Ergen Beslenmesi': 'child', 'Klinik / Hastalık Beslenmesi': 'stethoscope', 'Vejetaryen & Vegan': 'leaf', 'İnsülin Direnci & Diyabet': 'droplet', 'Yeme Davranışı': 'brain', 'Onkoloji Beslenmesi': 'ribbon'};
  const uzTon = d => { const i = (window.DDV?.diyetisyenler || []).findIndex(x => x.slug === d.slug); return `dd-uz-ton-${(i < 0 ? [...String(d.slug || d.ad || '')].reduce((n, c) => n + c.charCodeAt(0), 0) : i) % 3}`; };
  DD.uzmanTon = uzTon;
  const uzHarf = d => esc(String(d.harf || d.ad || '?').trim().slice(0, 1).toLocaleUpperCase('tr'));
  const uzFiyat = (d, o) => o.fiyat ?? d.paketler?.find(p => p.id === 'tek')?.fiyat;
  const uzGorusme = d => { const t = d.gorusmeTurleri || []; return t.length > 1 ? 'Online, yüz yüze' : t[0] || d.gorusme || ''; };
  const uzCipler = (l, n) => `${l.slice(0, n).map(x => `<span class="dd-uzk-cip">${esc(x)}</span>`).join('')}${l.length > n ? `<span class="dd-uzk-cip">+${l.length - n}</span>` : ''}`;
  const uzLink = (d, git, ic) => (git ? `<button type="button" class="dd-uzk-link" data-git="${esc(git)}" aria-label="${esc(d.ad)} profilini gör">${ic}</button>` : `<span class="dd-uzk-link">${ic}</span>`);
  DD.diyetisyenKart = (d, o = {}) => {
    const tur = o.tur === 'tam' ? 'liste' : o.tur || 'kart', git = o.git === null ? null : o.git ?? `#/uzman/profil/${d.slug}`, e = o.eylem, fiyat = uzFiyat(d, o);
    if (tur === 'satir') return `<div class="dd-yazar"><button type="button" class="dd-yazar-kim"${git ? ` data-git="${esc(git)}"` : ''} aria-label="${esc(d.ad)} profili">${DD.avatar({ad: d.harf || d.ad, sinif: uzTon(d)})}<span class="dd-yazar-metin"><span class="dd-yazar-ad"><b>${esc(d.ad)}</b>${d.dogrulandi ? DD.rozet({metin: 'Onaylı', ikon: 'dogrulandi'}) : ''}</span><small>${esc([d.unvan, d.sehir].filter(Boolean).join(' · '))}</small></span></button>${e ? DD.btn({tur: 'tonal', boyut: 'sm', sinif: 'dd-yazar-takip', ...e}) : ''}</div>`;
    if (tur === 'liste') {
      const ad = `<b class="dd-uzk-ad">${esc(d.ad)}</b>${d.dogrulandi ? `<span class="dd-uzk-onay" role="img" aria-label="Doğrulandı">${ik('dogrulandi')}</span>` : ''}`;
      const meta = [d.sehir && `<span>${ik('location-dot')}${esc(d.sehir)}</span>`, uzGorusme(d) && `<span>${ik('video')}${esc(uzGorusme(d))}</span>`, o.not && `<span>${esc(o.not)}</span>`].filter(Boolean).join('');
      const birincil = e ? DD.btn({boyut: 'sm', ...(e.secili ? {tur: 'tonal', ikon: 'onay'} : {}), ...e, secili: undefined}) : '';
      const ikincil = o.ikincil ? DD.btn({tur: 'secondary', boyut: 'sm', ...o.ikincil}) : '';
      return `<article class="${liste('dd-uzk', git && 'is-link')}" aria-label="${esc(d.ad)}"><div class="dd-uzk-ust">${DD.avatar({ad: d.harf || d.ad, boyut: 56, sinif: uzTon(d)})}<div class="dd-uzk-kim">${uzLink(d, git, ad)}<small>${esc([d.unvan, d.deneyimYil && `${d.deneyimYil} yıl`].filter(Boolean).join(' · '))}</small></div>${fiyat != null ? `<div class="dd-uzk-fiyat"><b>${esc(DD.paraTL(fiyat))}</b><small>seans</small></div>` : ''}</div>${d.uzmanliklar?.length ? `<div class="dd-uzk-cipler">${uzCipler(d.uzmanliklar, 2)}</div>` : ''}<div class="dd-uzk-meta">${meta}${o.uygun ? DD.durumRozet({metin: o.uygun.metin, ton: o.uygun.ton || 'basari', ikon: o.uygun.ikon || 'takvim'}) : ''}</div>${birincil || ikincil ? `<div class="dd-ikili">${birincil}${ikincil}</div>` : ''}</article>`;
    }
    // kart (ızgara): web vitrin kartı
    const metaK = [d.sehir, fiyat != null && DD.paraTL(fiyat)].filter(Boolean).join(' · ');
    return `<article class="${liste('dd-uzk-kart', uzTon(d), git && 'is-link')}" aria-label="${esc(d.ad)}"><span class="dd-uzk-bant" aria-hidden="true">${ik(UZ_IKON[d.uzmanliklar?.[0]] || 'leaf')}</span><span class="dd-uzk-kart-avatar" aria-hidden="true">${uzHarf(d)}</span>${uzLink(d, git, `<b class="dd-uzk-ad">${esc(d.kisaAd || d.ad)}</b>`)}${d.unvan ? `<small class="dd-uzk-unvan">${esc(d.unvan)}</small>` : ''}${d.uzmanliklar?.length ? `<div class="dd-uzk-cipler">${uzCipler(d.uzmanliklar, 1)}</div>` : ''}${metaK ? `<small class="dd-uzk-kart-meta">${esc(metaK)}</small>` : ''}${e?.secili ? DD.durumRozet({metin: e.metin, ton: 'basari', ikon: 'onay'}) : ''}<span class="dd-uzk-git" aria-hidden="true">Profili gör${ik('arrow-right')}</span></article>`;
  };
  // Sonsuz liste ve meşgul düğme: Gastro DG.sonsuz, DG.mesgul.
  DD.sonsuz = (kap, yukle, {bas = 2} = {}) => {
    let n = bas, bekle = false; const son = document.createElement('div'); son.className = 'dd-sonsuz-son'; kap.after(son);
    const g = document.createElement('div'); g.className = 'dd-alt-yukleniyor'; g.setAttribute('role', 'status'); g.setAttribute('aria-label', 'Yükleniyor'); g.innerHTML = '<i></i><i></i><i></i>'; g.hidden = true; son.before(g);
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting || bekle) return; bekle = true; g.hidden = false; setTimeout(() => { const h = yukle(n++); g.hidden = true; bekle = false; if (!h) { io.disconnect(); son.remove(); g.remove(); return; } kap.insertAdjacentHTML('beforeend', h); }, DD.azHareket() ? 0 : TK.motion.reveal); }, {root: kap.closest('.dd-kaydir'), rootMargin: '200px'});
    io.observe(son); return io;
  };
  DD.mesgul = (b, is = TK.motion.reveal * 2) => { if (!b) return Promise.resolve(); b.setAttribute('aria-busy', 'true'); b.disabled = true; const bit = () => { b.removeAttribute('aria-busy'); b.disabled = false; }; return (is && is.then ? is : new Promise(r => setTimeout(r, is))).then(v => { bit(); return v; }); };
})();
