/* Gastro'da karşılığı olmayan Diet bileşenleri: en yakın Gastro ailesinden türer (tasks/gastro-esleme.md §4). Katalog: kanon/README.md */
(() => {
  const DD = window.DD, {esc, ik, at, vurgu, sayi, ondalik, kisit, sure} = DD;
  const TK = DD.TK, M = TK.motion;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const yuvarla = n => +n.toFixed(2);

  const yayYol = (cx, cy, r, a0, a1) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(yuvarla); const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`; };
  const rad = d => d * Math.PI / 180;

  // ---------- Metabolik halka: 270 derece açık yay; planlı öğün silik yay, öğünler kesit olarak işlenir ----------
  // {hedef, alinan, planli, kesitler:[kcal...], boyut:'lg'|'md', etiket, yan:[{deger,etiket},{...}], cumle, foto (gülücük içinde), git}
  DD.halka = (o = {}) => {
    const {hedef = 1, alinan = 0, planli = 0, boyut = 'lg'} = o;
    const asim = alinan > hedef, kalan = Math.abs(hedef - alinan);
    const oran = kisit(alinan / hedef, 0, 1) * 100, plan = asim ? 0 : kisit(planli / hedef, 0, 1 - oran / 100) * 100;
    const b = boyut === 'lg' ? TK.size.ringLg : TK.size.ringMd, st = boyut === 'lg' ? TK.size.ringStroke : TK.size.ringStrokeMd, c = b / 2, r = b / 2 - st / 2, A0 = 135, ACI = 270, yol = yayYol(c, c, r, rad(A0), rad(A0 + ACI));
    let toplam = 0;
    const kesit = asim ? '' : (o.kesitler || []).slice(0, -1).map(k => { toplam += k; const a = rad(A0 + ACI * toplam / hedef), x = Math.cos(a), y = Math.sin(a); return `<line class="dd-halka-kesit" x1="${yuvarla(c + (r - st / 2 - 2) * x)}" y1="${yuvarla(c + (r - st / 2 - 2) * y)}" x2="${yuvarla(c + (r + st / 2 + 2) * x)}" y2="${yuvarla(c + (r + st / 2 + 2) * y)}"/>`; }).join('');
    const yayEl = (sinif, u, gecik = 0) => `<path class="${sinif}" d="${yol}" pathLength="100" stroke-dasharray="${yuvarla(u)} 100" data-c="yay" data-uzun="${yuvarla(u)}" data-gecik="${gecik}"/>`;
    const halka = `<div class="${liste('dd-halka', `dd-halka--${boyut}`, asim && 'is-ustunde', o.foto && 'is-foto', o.sinif)}" role="img" aria-label="${esc(`Hedef ${sayi(hedef)} kcal, alınan ${sayi(alinan)} kcal, ${asim ? 'hedefin üstünde' : 'kalan'} ${sayi(kalan)} kcal`)}"${at({git: o.git})}>
      <svg viewBox="0 0 ${b} ${b}" aria-hidden="true"><path class="dd-halka-iz" d="${yol}"/>${plan > .5 ? yayEl('dd-halka-plan', oran + plan, M.reveal) : ''}${oran > 0 ? yayEl('dd-halka-dolu', oran) : ''}${kesit}</svg>
      <div class="dd-halka-orta"><small>${esc(o.etiket ?? (asim ? 'Hedefin üstünde' : 'Kalan'))}</small><b class="${boyut === 'lg' ? 'dd-t-numeral-xl' : 'dd-t-numeral-lg'}">${asim ? '+' : ''}<span data-c="say" data-hedef="${Math.round(kalan)}">${sayi(kalan)}</span></b></div>
      <small class="dd-halka-hedef">${esc(o.alt ?? `/ ${sayi(hedef)} kcal`)}</small>
    </div>`;
    const yan = x => `<div class="dd-halka-yan"><b class="dd-t-numeral-md">${esc(x.deger)}</b><small>${esc(x.etiket)}</small></div>`;
    const govde = o.yan ? `<div class="dd-halka-kap${o.foto ? ' is-foto' : ''}">${yan(o.yan[0])}${halka}${yan(o.yan[1])}</div>` : halka;
    return o.cumle ? `<div class="dd-yigin-12">${govde}${DD.p(o.cumle, {orta: true, ton: 'ikincil'})}</div>` : govde;
  };
  // Mini halka: öğün satırı (sm, 44) ve hafta şeridi (xs, 24). İçinde ikon olabilir. {oran, ikon, boyut, ton, silik}
  DD.halkaMini = (o = {}) => {
    const u = yuvarla(kisit(o.oran || 0, 0, 1) * 100), bb = o.boyut || 'sm', b = bb === 'xs' ? TK.size.ringXs : TK.size.ringMini, st = bb === 'xs' ? TK.size.ringXsStroke : TK.size.ringMiniStroke, c = b / 2, r = b / 2 - st / 2;
    return `<span class="${liste('dd-mini', `dd-mini--${bb}`, `is-${o.ton || 'primary'}`, o.silik && 'is-silik', o.foto && 'has-foto', o.sinif)}" aria-hidden="true">${o.foto ? `<span class="dd-mini-foto" style="background-image:url('${esc(o.foto)}')"></span>` : ''}<svg viewBox="0 0 ${b} ${b}"><circle class="dd-mini-iz" cx="${c}" cy="${c}" r="${r}"/>${u > 0 ? `<circle class="dd-mini-dolu" cx="${c}" cy="${c}" r="${r}" pathLength="100" stroke-dasharray="${u} 100" data-c="yay" data-uzun="${u}" transform="rotate(-90 ${c} ${c})"/>` : ''}</svg>${o.ikon ? ik(o.ikon) : ''}</span>`;
  };

  // ---------- Makro çubukları ----------
  const MAKRO = [['P', 'Protein', 'protein'], ['K', 'Karbonhidrat', 'karb'], ['Y', 'Yağ', 'yag'], ['Lif', 'Lif', 'lif']];
  // makro: {P:{alinan,hedef},...}; tur: dort (tek kart, 4 sütun) | liste (tam genişlik satır, sağda yüzde; sheet için)
  DD.makroCubuk = (makro, o = {}) => `<div class="${liste('dd-makro', `is-${o.tur || 'dort'}`, o.kart === false && 'is-yalin', o.sinif)}"${at({git: o.git, veri: o.veri})}>${MAKRO.map(([k, ad, ton]) => {
    const m = makro[k] || {alinan: 0, hedef: 1}, oran = kisit(m.alinan / m.hedef, 0, 1), ustunde = m.alinan > m.hedef;
    const yol = `<span class="dd-makro-yol" role="progressbar" aria-label="${esc(ad)}" aria-valuenow="${Math.round(m.alinan)}" aria-valuemax="${Math.round(m.hedef)}"><i data-c="bar" style="--oran:${oran.toFixed(3)}"></i></span>`;
    return `<div class="${liste('dd-makro-oge', `is-${ton}`, ustunde && 'is-ustunde')}"><span class="dd-makro-ad">${esc(o.tur === 'liste' ? ad : ad === 'Karbonhidrat' ? 'Karb.' : ad)}</span><span class="dd-makro-deger"><b>${sayi(m.alinan)}</b> / ${sayi(m.hedef)} g</span>${o.tur === 'liste' ? `<span class="dd-makro-yuzde">%${Math.round(m.alinan / m.hedef * 100)}</span>` : ''}${yol}</div>`;
  }).join('')}</div>`;

  // ---------- Oruç sayacı: tam daire, faz işaretleri halkaya oturur ----------
  // {durum:'oruc'|'pencere'|'bos'|'bitti', gecenDk, hedefSaat, rozet, fazlar, canli, altMetin, git, veri}
  DD.sayacHtml = sn => { const m = DD.sayacMetin(sn); return `<span class="dd-t-numeral-xl">${DD.rakamlar(m.slice(0, 5))}</span><span class="dd-oruc-sn">${DD.rakamlar(m.slice(5))}</span>`; };
  DD.orucSayac = (o = {}) => {
    const {gecenDk = 0, hedefSaat = 16, durum = 'oruc'} = o;
    const hedefDk = hedefSaat * 60, oran = durum === 'bitti' ? 1 : durum === 'bos' ? 0 : kisit(gecenDk / hedefDk, 0, 1), r = 135, c = 148;
    const fazlar = durum === 'oruc' || durum === 'bitti' ? (o.fazlar || []).filter(f => f.baslangicSaat > 0 && f.baslangicSaat < hedefSaat) : [];
    const gecenSaat = durum === 'bitti' ? hedefSaat : gecenDk / 60;
    const isaret = fazlar.map(f => `<span class="dd-oruc-faz${gecenSaat >= f.baslangicSaat ? ' is-gecti' : ''}" style="--a:${yuvarla(f.baslangicSaat / hedefSaat * 360)}deg"><i>${ik(f.ikon)}</i></span>`).join('');
    const uzun = yuvarla(oran * 100), ton = {oruc: 'basari', pencere: 'uyari', bitti: 'basari', bos: 'notr'}[durum];
    const metin = o.rozet || {oruc: 'Oruçtasın', pencere: 'Yeme penceresi açık', bitti: 'Tamamlandı', bos: 'Hazır'}[durum];
    const zaman = durum === 'bos'
      ? `<b class="dd-t-numeral-xl dd-oruc-zaman">${esc(hedefSaat)}<span class="dd-oruc-sn"> saat</span></b>`
      : `<b class="dd-oruc-zaman" ${o.canli === false || durum === 'bitti' ? '' : `data-c="sayac" data-saniye="${gecenDk * 60}"`}>${DD.sayacHtml(gecenDk * 60)}</b>`;
    const merkez = `<div class="dd-oruc-orta">${DD.durumRozet({metin, ton, ikon: {oruc: 'oruc', pencere: 'pencere', bitti: 'onay', bos: 'saat'}[durum]})}${zaman}<small>${esc(o.altMetin || `Hedef ${hedefSaat} saat`)}</small></div>`;
    return `<div class="${liste('dd-oruc', `is-${durum}`, o.sinif)}"><svg viewBox="0 0 296 296" aria-hidden="true"><circle class="dd-oruc-iz" cx="${c}" cy="${c}" r="${r}"/>${uzun > 0 ? `<circle class="dd-oruc-dolu" cx="${c}" cy="${c}" r="${r}" pathLength="100" stroke-dasharray="${uzun} 100" data-c="yay" data-uzun="${uzun}" transform="rotate(-90 ${c} ${c})"/>` : ''}</svg>${isaret}${uzun > 0 && uzun < 100 ? `<span class="dd-oruc-uc" data-c="bar" style="--a:${yuvarla(oran * 360)}deg"><i></i></span>` : ''}${o.git || o.veri ? `<button type="button" class="dd-oruc-dokun"${at({git: o.git, veri: o.veri, etiket: 'Fazları göster'})}>${merkez}</button>` : merkez}</div>`;
  };
  // Kompakt oruç pili (Bugün). {durum, baslik, alt, oran, git}
  DD.orucPil = (o = {}) => {
    const uzun = yuvarla(kisit(o.oran || 0, 0, 1) * 100);
    return `<button type="button" class="${liste('dd-pil', `is-${o.durum || 'pencere'}`, o.sinif)}"${at(o)}><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="dd-pil-iz" cx="20" cy="20" r="16"/><circle class="dd-pil-dolu" cx="20" cy="20" r="16" pathLength="100" stroke-dasharray="${uzun} 100" transform="rotate(-90 20 20)"/></svg><span class="dd-pil-ikon">${ik(o.ikon || (o.durum === 'oruc' ? 'oruc' : 'pencere'))}</span><span class="dd-pil-metin"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></span>${ik('satirOk', 'dd-satir-ok')}</button>`;
  };

  // ---------- Denge Skoru: yarım kadran, bileşen başına segment ----------
  DD.skorTon = s => (s >= 70 ? 'iyi' : s >= 40 ? 'orta' : 'notr');
  // {skor, etiket, fark, bilesenler:[{ad,puan,enCok}], hazirlaniyor:{gun,toplam}}
  DD.dengeSkor = (o = {}) => {
    const cx = 132, cy = 136, r = 112, bosluk = .085, ton = o.hazirlaniyor ? 'notr' : DD.skorTon(o.skor || 0);
    const parcalar = o.bilesenler?.length ? o.bilesenler : [{puan: o.skor || 0, enCok: 100}];
    const top = parcalar.reduce((a, b) => a + b.enCok, 0), acik = Math.PI - bosluk * (parcalar.length - 1);
    let a = Math.PI;
    const yaylar = parcalar.map((b, i) => {
      const a1 = a + acik * (b.enCok / top), d = yayYol(cx, cy, r, a, a1); a = a1 + bosluk;
      const u = o.hazirlaniyor ? 0 : yuvarla(b.puan / b.enCok * 100);
      return `<path class="dd-skor-iz" d="${d}"/>${u > 0 ? `<path class="dd-skor-dolu" d="${d}" pathLength="100" stroke-dasharray="${u} 100" data-c="yay" data-uzun="${u}" data-gecik="${i * M.stagger * 3}"/>` : ''}`;
    }).join('');
    const orta = o.hazirlaniyor
      ? `<span class="dd-t-sub">Hazırlanıyor</span><b class="dd-t-numeral-lg">${esc(o.hazirlaniyor.gun)}<span class="dd-skor-bolu">/${esc(o.hazirlaniyor.toplam)} gün</span></b>`
      : `<span class="dd-skor-sozcuk">${esc(o.etiket || '')}</span><b class="dd-t-numeral-xl"><span data-c="say" data-hedef="${o.skor}">${esc(o.skor)}</span><span class="dd-skor-bolu">/100</span></b>${o.fark ? `<small>${esc(o.fark)}</small>` : ''}`;
    return `<div class="${liste('dd-skor', `is-${ton}`, o.sinif)}" role="img" aria-label="${esc(`Denge Skoru ${o.skor ?? ''} / 100 ${o.etiket || ''}`)}"><svg viewBox="0 0 264 148" aria-hidden="true">${yaylar}</svg><div class="dd-skor-orta">${orta}</div></div>`;
  };

  // ---------- Çizgi grafik ----------
  const egri = n => n.map((p, i) => { if (!i) return `M${p[0]} ${p[1]}`; const a = n[i - 1], dx = (p[0] - a[0]) / 2; return `C${yuvarla(a[0] + dx)} ${a[1]} ${yuvarla(p[0] - dx)} ${p[1]} ${p[0]} ${p[1]}`; }).join('');
  // {seri:[{etiket,deger}]|[sayi], tur:'spark'|'eksenli', hedef, secili (indeks), birim, ton, ad, hedefEtiket}
  DD.grafik = (o = {}) => {
    const seri = (o.seri || []).map(x => (typeof x === 'number' ? {etiket: '', deger: x} : x)), n = seri.length, tur = o.tur || 'spark';
    if (!n) return '';
    const onceki = (o.onceki || []).map(x => (typeof x === 'number' ? x : x.deger)), ham = (o.ham || []).map(x => (typeof x === 'number' ? x : x.deger));
    const dk = seri.map(x => x.deger).concat(o.hedef ?? [], onceki, ham);
    let min = Math.min(...dk), max = Math.max(...dk); const pay = (max - min || 1) * .15; min -= pay; max += pay;
    const X = i => yuvarla(n > 1 ? i / (n - 1) * 100 : 50), Y = v => yuvarla(50 - (v - min) / (max - min) * 50);
    const nokta = seri.map((x, i) => [X(i), Y(x.deger)]);
    const d = egri(nokta), alan = `${d}L100 50L0 50Z`;
    const ton = o.ton || 'primary';
    const svg = `<svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path class="dd-grafik-alanboya" d="${alan}"/>${tur === 'eksenli' ? [12.5, 25, 37.5].map(y => `<line class="dd-grafik-kilavuz" x1="0" x2="100" y1="${y}" y2="${y}"/>`).join('') : ''}${o.hedef != null ? `<line class="dd-grafik-hedef" x1="0" x2="100" y1="${Y(o.hedef)}" y2="${Y(o.hedef)}"/>` : ''}${onceki.length ? `<path class="dd-grafik-onceki" d="${egri(onceki.map((v, i) => [yuvarla(i / (onceki.length - 1) * 100), Y(v)]))}"/>` : ''}${ham.length ? `<path class="dd-grafik-ham" d="${egri(ham.map((v, i) => [yuvarla(i / (ham.length - 1) * 100), Y(v)]))}"/>` : ''}<path class="dd-grafik-cizgi" d="${d}"/></svg>`;
    if (tur === 'spark') return `<div class="dd-grafik is-spark is-${ton}" aria-hidden="true"><div class="dd-grafik-alan" data-c="bar">${svg}</div></div>`;
    const b = o.ondalik ?? 1, sec = o.secili ?? n - 1, yEt = [max - pay, (max + min) / 2, min + pay];
    const her = n <= 5 ? 1 : Math.ceil((n - 1) / 3);
    return `<div class="${liste('dd-grafik is-eksenli is-etkin', `is-${ton}`, o.sinif)}" data-c="grafik" data-ad="${esc(o.ad || 'grafik')}" data-secili="${sec}" data-birim="${esc(o.birim || '')}" data-ondalik="${b}" data-noktalar='${esc(JSON.stringify(seri.map((x, i) => [X(i), Y(x.deger), x.deger, x.etiket])))}'>
      <div class="dd-grafik-gorunum"><div class="dd-grafik-y">${yEt.map(v => `<span>${ondalik(v, b)}</span>`).join('')}</div>
      <div class="dd-grafik-alan" role="slider" tabindex="0" aria-label="${esc(o.etiket || 'Grafik')}" aria-valuemin="0" aria-valuemax="${n - 1}" aria-valuenow="${sec}" data-yatay data-c="bar">${svg}${o.hedef != null ? `<span class="dd-grafik-hedef-et" style="--y:${Y(o.hedef) * 2}%">${esc(o.hedefEtiket || `Hedef ${ondalik(o.hedef, b)}`)}</span>` : ''}<i class="dd-grafik-cubuk"></i><i class="dd-grafik-nokta"></i><span class="dd-grafik-balon"></span></div></div>
      <div class="dd-grafik-x">${seri.map((x, i) => `<span style="--x:${X(i)}%">${i % her === 0 ? esc(x.etiket) : ''}</span>`).join('')}</div></div>`;
  };
  // Grafik kartı: başlık cümledir. {cumle, deger, birim, fark, farkTon, donemler:[{ad,deger}], donem, ad, grafik (html), alt:[{deger,etiket}]}
  DD.grafikKart = (o = {}) => `<div class="dd-kart dd-grafik-kart"><div class="dd-yigin-4">${o.deger != null ? `<div class="dd-metrik-deger"><b class="dd-t-numeral-lg">${esc(o.deger)}</b>${o.birim ? `<small>${esc(o.birim)}</small>` : ''}${o.fark ? `<span class="dd-metrik-fark is-${o.farkTon || 'notr'}">${esc(o.fark)}</span>` : ''}</div>` : ''}${o.cumle ? DD.p(o.cumle, {meta: true, ton: 'ikincil'}) : ''}</div>${o.grafik || ''}${o.donemler ? DD.segment({ad: o.ad || 'donem', ogeler: o.donemler, secili: o.donem}) : ''}${o.alt ? DD.stat(o.alt, {yalin: true}) : ''}</div>`;
  DD._grafikCiz = (el, i = +el.dataset.secili) => {
    const n = JSON.parse(el.dataset.noktalar), p = n[kisit(i, 0, n.length - 1)];
    el.dataset.secili = i;
    const a = el.querySelector('.dd-grafik-alan');
    a.style.setProperty('--x', `${p[0]}%`); a.style.setProperty('--y', `${p[1] * 2}%`);
    a.setAttribute('aria-valuenow', i);
    const bal = el.querySelector('.dd-grafik-balon');
    bal.innerHTML = `<b>${ondalik(p[2], +el.dataset.ondalik)} ${esc(el.dataset.birim)}</b>${p[3] ? `<small>${esc(p[3])}</small>` : ''}`;
    bal.classList.toggle('is-sag', p[0] > 70); bal.classList.toggle('is-sol', p[0] < 30);
  };
  DD._grafikBasla = (ev, el) => {
    const a = el.querySelector('.dd-grafik-alan'), n = JSON.parse(el.dataset.noktalar);
    const sec = e => {
      const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100;
      let en = 0; n.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(n[en][0] - x)) en = i; });
      if (en !== +el.dataset.secili) { DD._grafikCiz(el, en); DD.titres(2); DD.degisim(el, el.dataset.ad, en, {deger2: n[en][2]}); }
    };
    a.setPointerCapture(ev.pointerId); sec(ev);
    const son = () => { a.removeEventListener('pointermove', sec); a.removeEventListener('pointerup', son); a.removeEventListener('pointercancel', son); };
    a.addEventListener('pointermove', sec); a.addEventListener('pointerup', son); a.addEventListener('pointercancel', son);
  };

  // ---------- Dairesel saat seçici: 24 saat kadranı, oruç penceresi yayı ----------
  // {ad, deger:'12:00', pencereSaat, etiket, adim}
  // Aralık dışındaki değer sınırda durur. Hangi sınır: sürüklemede önceki değere, dokunuşta parmağa yakın olan. min > max gece yarısını geçen aralıktır.
  const kadranSinir = (a, b, v, yakin) => { if (a <= b ? v >= a && v <= b : v >= a || v <= b) return v; const d = (x, y) => { const k = Math.abs(x - y) % 1440; return Math.min(k, 1440 - k); }; return d(yakin, a) <= d(yakin, b) ? a : b; };
  DD.saatKadran = (o = {}) => {
    const saat = x => (typeof x === 'number' ? x : DD.saatDk(x)), sinirli = o.min != null && o.max != null, mn = sinirli ? saat(o.min) : null, mx = sinirli ? saat(o.max) : null;
    const ham = saat(o.deger || '12:00'), dk = sinirli ? kadranSinir(mn, mx, ham, ham) : ham, c = 140, r = 118;
    const cizgi = Array.from({length: 24}, (_, h) => { const a = h / 24 * 2 * Math.PI, s = Math.sin(a), n = -Math.cos(a), b = h % 6 === 0; return `<line class="dd-kadran-cizgi${b ? ' is-buyuk' : ''}" x1="${yuvarla(c + 102 * s)}" y1="${yuvarla(c + 102 * n)}" x2="${yuvarla(c + (b ? 94 : 98) * s)}" y2="${yuvarla(c + (b ? 94 : 98) * n)}"/>`; }).join('');
    return `<div class="dd-kadran" data-c="kadran" data-ad="${esc(o.ad || 'saat')}" data-deger="${dk}" data-pencere="${(o.pencereSaat || 0) * 60}" data-adim="${o.adim || 15}"${sinirli ? ` data-min="${mn}" data-max="${mx}"` : ''}>
      <div class="dd-kadran-alan" role="slider" tabindex="0" aria-label="${esc(o.etiket || 'Saat')}" aria-valuemin="${sinirli ? mn : 0}" aria-valuemax="${sinirli ? mx : 1439}" aria-valuenow="${dk}" aria-valuetext="${esc(DD.saatMetin(dk))}" data-yatay>
        <svg viewBox="0 0 280 280" aria-hidden="true"><circle class="dd-kadran-iz" cx="${c}" cy="${c}" r="${r}"/><circle class="dd-kadran-yay" cx="${c}" cy="${c}" r="${r}" pathLength="100" transform="rotate(-90 ${c} ${c})"/>${cizgi}</svg>
        ${[[0, '00'], [6, '06'], [12, '12'], [18, '18']].map(([h, m]) => `<span class="dd-kadran-et" style="--a:${h * 15}deg"><span>${m}</span></span>`).join('')}
        ${o.pencereSaat ? '<span class="dd-kadran-uc"><i></i></span>' : ''}<span class="dd-kadran-tut"><i></i></span>
        <div class="dd-kadran-orta"><small>${esc(o.etiket || 'Saat')}</small><b class="dd-t-numeral-lg" data-kadran-saat>${esc(DD.saatMetin(dk))}</b>${o.pencereSaat ? `<small data-kadran-bitis></small>` : ''}</div>
      </div></div>`;
  };
  DD._kadranCiz = el => {
    const v = +el.dataset.deger, p = +el.dataset.pencere, g = 1440;
    const a = el.querySelector('.dd-kadran-alan');
    a.style.setProperty('--a', `${v / g * 360}deg`); a.style.setProperty('--b', `${(v + p) % g / g * 360}deg`);
    const y = el.querySelector('.dd-kadran-yay');
    y.setAttribute('stroke-dasharray', `${p / g * 100} 100`); y.setAttribute('stroke-dashoffset', `${-v / g * 100}`);
    el.querySelector('[data-kadran-saat]').textContent = DD.saatMetin(v);
    const b = el.querySelector('[data-kadran-bitis]'); if (b) b.textContent = `${DD.saatMetin((v + p) % g)}’e kadar`;
    a.setAttribute('aria-valuenow', v); a.setAttribute('aria-valuetext', DD.saatMetin(v));
  };
  const kadranYaz = (el, v, dokunus) => { const adim = +el.dataset.adim; v = ((Math.round(v / adim) * adim) % 1440 + 1440) % 1440; if (el.dataset.min != null) v = kadranSinir(+el.dataset.min, +el.dataset.max, v, dokunus ? v : +el.dataset.deger); if (v !== +el.dataset.deger) { el.dataset.deger = v; DD._kadranCiz(el); DD.titres(2); DD.degisim(el, el.dataset.ad, DD.saatMetin(v), {dakika: v}); } };
  DD._kadranBasla = (ev, el) => {
    const a = el.querySelector('.dd-kadran-alan');
    let ilk = true;
    const hesap = e => { const r = a.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; kadranYaz(el, ((Math.atan2(x, -y) / (2 * Math.PI)) * 1440 + 1440) % 1440, ilk); ilk = false; };
    a.setPointerCapture(ev.pointerId); el.classList.add('is-surukleniyor'); hesap(ev);
    const son = () => { el.classList.remove('is-surukleniyor'); a.removeEventListener('pointermove', hesap); a.removeEventListener('pointerup', son); a.removeEventListener('pointercancel', son); };
    a.addEventListener('pointermove', hesap); a.addEventListener('pointerup', son); a.addEventListener('pointercancel', son);
  };
  DD._kadranTus = (ev, el) => { const a = +el.dataset.adim, d = {ArrowLeft: -a, ArrowDown: -a, ArrowRight: a, ArrowUp: a}[ev.key]; if (d) { ev.preventDefault(); kadranYaz(el, +el.dataset.deger + d); } };

  // ---------- Takvim: Gastro dg-takvim (dd-takvim.js) ----------
  // {ad, gorunum:'ay'|'hafta', mod:'tek'|'aralik', secili, aralik, noktalar:{iso:['uyari','gecti']}, halkalar:{iso:oran}, min, max, gorunumSec, gecis, baslik}
  DD.takvim = (o = {}) => `<div class="${liste('dd-takvim-kap', o.sinif)}" data-c="takvim" data-tk='${esc(JSON.stringify({bugun: DD.bugunIso(), secili: DD.bugunIso(), ...o}))}'></div>`;
  DD.takvimSheet = (o = {}) => DDTakvim.sec({bugun: DD.bugunIso(), ...o});
  DD.takvimAlan = o => DDTakvim.alan(o);
  DD.tarihUzun = s => DDTakvim.uzun(s).split(',')[0];
  DD.tarihKisa = s => DDTakvim.kisa(s);

  // ---------- Öğün, besin ----------
  // ogunKart(ogun, {git, hedef}): durum dolu | planli | degisti | atlandi | bos. Mini halka 44/6, ad, kcal, öğeler; sağda +. Planlıda üç hızlı durum.
  const OGUN_PAY = {kahvalti: .25, ogle: .35, aksam: .3, ara: .1};
  const OGUN_ALT = {degisti: 'Plandan değiştirildi', atlandi: 'Atlandı'};
  DD.ogunKart = (x, o = {}) => {
    const durum = x.durum || (x.besinler?.length ? 'dolu' : 'bos');
    const adlar = (x.besinler || []).map(b => b.ad.split(' (')[0]);
    const ozet = OGUN_ALT[durum] && durum === 'atlandi' ? '' : adlar.slice(0, 3).join(', ') + (adlar.length > 3 ? ` +${adlar.length - 3}` : '');
    const gunluk = o.gunlukHedef ?? window.DDV?.bugun?.hedefKcal ?? 1650;
    const hedef = o.hedef ?? x.hedefKcal ?? Math.round(gunluk * (OGUN_PAY[x.id] ?? OGUN_PAY[String(x.id).split('-')[0]] ?? .15));
    const git = o.git ?? `#/ogun/${x.id}`, dolu = durum === 'dolu' || durum === 'degisti';
    const kcalSatir = dolu ? `<span class="dd-ogun-kcal">Yenilen: <b>${sayi(x.kcal)} kcal</b></span> · <span class="dd-ogun-kcal">Hedef: ${sayi(hedef)} kcal</span>` : durum === 'planli' ? `Planlı · ${sayi(x.kcal)} kcal` : durum === 'atlandi' ? 'Atlandı' : `Hedef ${sayi(hedef)} kcal`;
    const plan = durum === 'planli' && o.durumlar !== false ? `<div class="dd-ogun-plan" role="group" aria-label="${esc(x.ad)} durumu">${[['uygula', 'Planladığım gibi', 'onay'], ['degistir', 'Değiştirdim', 'duzenle'], ['atla', 'Atladım', 'forward']].map(([e, m, i]) => DD.cip({metin: m, ikon: i, kucuk: true, veri: {eylem: `plan-${e}`, id: x.id}})).join('')}</div>` : '';
    return `<article class="${liste('dd-ogun', `is-${durum}`, o.sinif)}"><button type="button" class="dd-ogun-ust" data-git="${esc(git)}">${DD.halkaMini({oran: dolu ? x.kcal / hedef : 0, foto: x.foto, ikon: x.foto ? null : durum === 'atlandi' ? 'forward' : x.ikon || 'ogun', silik: !dolu})}<span class="dd-satir-metin"><span class="dd-ogun-ad">${esc(x.ad)}${x.saat ? `<small>${esc(x.saat)}</small>` : ''}${durum === 'degisti' ? DD.durumRozet({metin: 'Değişti', ton: 'uyari', ikon: 'duzenle'}) : ''}</span><small>${kcalSatir}</small>${ozet ? `<small class="dd-kirp-1">${esc(ozet)}</small>` : ''}</span></button><span class="dd-ogun-ekle">${DD.ikonBtn({ikon: 'ekle', etiket: `${x.ad} ekle`, tur: 'tint', veri: {eylem: 'ogun-ekle', id: x.id}})}</span>${plan}</article>`;
  };
  DD.ogunListe = (l, o = {}) => `<div class="dd-satirlar dd-ogunler">${l.map(x => DD.ogunKart(x, o)).join('')}</div>`;
  // Tabak kartı: DDCard tile ailesi, kare medya, cam kcal metası, perde metin konumundan. Fotoğraf yargı aracı değil: puan ve renk yok.
  const tabakGit = (k, git) => (typeof git === 'function' ? git(k) : git ? String(git).replace(':id', k.id) : `#/kayit/${k.id}`);
  const tabakKart = (k, o = {}) => { const etiket = o.kucuk ? k.ogun : [k.ogun, k.saat].filter(Boolean).join(' · '); return `<article class="${liste('dd-tile dd-tabak', o.kucuk && 'is-kucuk')}"><a class="dd-tile__media" href="${esc(tabakGit(k, o.git))}" aria-label="${esc([k.ogun, k.ad, k.kcal != null ? `${sayi(k.kcal)} kcal` : ''].filter(Boolean).join(', '))}">${k.foto ? `<span class="dd-photo" style="background-image:url('${esc(k.foto)}')"></span>` : `<span class="dd-photo image-failed">${ik('tabak')}</span>`}<span class="dd-tile__veil" aria-hidden="true"></span>${k.kcal != null ? `<span class="dd-meta" aria-hidden="true"><span>${ik('kalori')}${sayi(k.kcal)} kcal</span></span>` : ''}<span class="dd-tile__info"><span class="dd-card__category">${esc(etiket || '')}</span>${o.kucuk || !k.ad ? '' : `<span class="dd-card__title">${esc(k.ad)}</span>`}</span></a></article>`; };
  DD.tabakKart = tabakKart;
  // Gün başlıklı ızgara: {gunler:[{baslik, ozet, kayitlar}], git}. git: işlev ya da ':id' kalıbı; varsayılan #/kayit/:id.
  DD.tabakIzgara = (o = {}) => `<div class="dd-tabak-gunler">${(o.gunler || []).filter(g => g.kayitlar?.length).map(g => `<section class="dd-tabak-gun">${DD.bas(g.baslik, g.ozet ? {html: `<small class="dd-tabak-ozet">${esc(g.ozet)}</small>`} : null)}<div class="dd-tabak-izgara">${g.kayitlar.map(k => tabakKart(k, {git: o.git})).join('')}</div></section>`).join('')}</div>`;
  // Bugün şeridi: küçük kartlar, sonda Tümü.
  DD.tabakSerit = (l, o = {}) => `<div class="dd-strip dd-tabak-serit">${l.map(k => `<div class="dd-strip-oge">${tabakKart(k, {git: o.git, kucuk: true})}</div>`).join('')}<a class="dd-strip-oge dd-tabak-tumu" href="${esc(o.tumu || '#/tabaklarim')}">${ik('arrow-right')}<b>${esc(o.tumuMetin || 'Tümü')}</b></a></div>`;
  // Kaydın nereden geldiği; güven varsa yüzde. Yargı değil, bilgi: nötr rozet.
  const KAYNAK = {kamera: ['Fotoğraftan', 'kamera'], galeri: ['Galeriden', 'image'], ses: ['Sesle', 'mikrofon'], arama: ['Aramadan', 'ara_'], barkod: ['Barkoddan', 'barkod']};
  DD.kayitKaynak = (kaynak, guven) => { const [m, i] = KAYNAK[kaynak] || ['Elle', 'duzenle']; return DD.durumRozet({metin: guven != null ? `${m} · Güven %${Math.round(guven)}` : m, ton: 'notr', ikon: i}); };
  // Birkaç kelime: serbest metin + hazır öneriler. Her değişimde dd-degisim, ad = o.ad: deger birleşik not, detay {oneriler, serbest}.
  DD.oneriNot = (o = {}) => { const ad = o.ad || 'not'; return `<section class="dd-oneri-not" data-oneri-not="${esc(ad)}">${DD.input({ad, etiket: o.etiket || 'Birkaç kelime ekle', yer: o.yer || 'Ne eklemek istersin?', deger: o.deger})}${DD.cipler({ad: `${ad}-oneri`, etiket: 'Hazır öneriler', secili: o.secili, ogeler: (o.oneriler || []).map(x => (typeof x === 'string' ? {metin: x, deger: x} : x))})}</section>`; };
  const oneriYay = k => { const ad = k.dataset.oneriNot, serbest = k.querySelector('input').value.trim(), oneriler = [...k.querySelectorAll('[data-cip][aria-pressed=true]')].map(b => b.dataset.cip); DD.degisim(k, ad, [...oneriler, serbest].filter(Boolean).join(', '), {oneriler, serbest}); };
  document.addEventListener('input', ev => { const k = ev.target.closest?.('[data-oneri-not]'); if (k) oneriYay(k); });
  document.addEventListener('dd-degisim', ev => { const k = ev.target.closest?.('[data-oneri-not]'); if (k && ev.detail.ad === `${k.dataset.oneriNot}-oneri`) oneriYay(k); });
  // besinSatir(b, {swipe, eylemler, git, veri, sag, alt, ok})
  DD.besinSatir = (b, o = {}) => {
    const alt = o.alt ?? [b.miktar != null ? `${ondalik(b.miktar, 2)} ${b.birim || ''}`.trim() : '', b.gram ? `${sayi(b.gram)} g` : ''].filter(Boolean).join(' · ');
    const satir = DD.satir({sol: DD.gorsel({src: b.gorsel, ad: b.ad, ton: DD.makroTon(b)}), baslik: b.ad, alt, deger: b.kcal != null ? `${sayi(b.kcal)} kcal` : null, git: o.git, veri: o.veri, sag: o.sag, ok: o.ok ?? false, duz: !!o.sag});
    if (!o.swipe) return satir;
    const ey = o.eylemler || [{eylem: 'miktar', ikon: 'duzenle', metin: 'Miktar', ton: 'notr'}, {eylem: 'sil', ikon: 'sil', metin: 'Sil', ton: 'yikici'}];
    return `<div class="dd-swipe" data-id="${esc(b.id ?? b.slug)}"><div class="dd-swipe-eylemler">${ey.map(e => `<button type="button" class="dd-swipe-eylem is-${e.ton || 'notr'}" data-eylem="${esc(e.eylem)}">${ik(e.ikon)}<span>${esc(e.metin)}</span></button>`).join('')}</div><div class="dd-swipe-on">${satir}</div></div>`;
  };

  // Metrik kartı: Gastro .dd-kart yüzeyi. deger:null tire gösterir, çıplak 0 yazılmaz.
  DD.metrikKart = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="${liste('dd-kart dd-metrik', o.sinif)}"${at({git: o.git})}><div class="dd-ara"><span class="dd-yardim">${esc(o.etiket)}</span>${o.ikon ? DD.ikonKutu({ikon: o.ikon, boyut: 'sm', ton: o.ton || 'primary'}) : ''}</div><div class="dd-metrik-deger"><b class="dd-t-numeral-lg">${esc(o.deger ?? '––')}</b>${o.birim ? `<small>${esc(o.birim)}</small>` : ''}</div>${o.degisim ? `<span class="dd-metrik-fark is-${o.degisimTon || 'notr'}">${o.degisimIkon ? ik(o.degisimIkon) : ''}${esc(o.degisim)}</span>` : ''}${o.seri ? DD.grafik({seri: o.seri, tur: 'spark', ton: o.grafikTon}) : ''}</${o.git ? 'button' : 'div'}>`;

  // ---------- Su, duygu ----------
  // Su kartı: hedef bardak bardak görünür, kısmi bardak kısmi dolar. Sıradaki bardak + ile bir bardak ekler. kayitEylem geçmiş sheet'ini açar.
  // adimlar: ml ya da {ml, metin}. Hedef ve kalan bardakla da söylenir; 1 bardak 200 ml.
  DD.SU_BARDAK = 200;
  DD.suBardak = ml => Math.ceil(ml / DD.SU_BARDAK);
  DD.suKalan = (icilen, hedef) => (icilen >= hedef ? 'Hedefe ulaştın' : `${DD.suBardak(hedef - icilen)} bardak kaldı`);
  DD.suBardakDurum = (icilen, i) => kisit((icilen - i * DD.SU_BARDAK) / DD.SU_BARDAK, 0, 1);
  // Bardak sayısı hedefle sınırlı değildir: her zaman bir sonraki bardak vardır. Boş bardak ekler, dolu bardak bir bardak geri alır.
  DD.suSiradaki = icilen => Math.floor(icilen / DD.SU_BARDAK);
  DD.suBardakSayi = (icilen, hedef) => Math.max(DD.suBardak(hedef), DD.suSiradaki(icilen) + 1);
  DD.suBardakCiz = (icilen, i) => { const oran = DD.suBardakDurum(icilen, i), dolu = oran >= 1; return `<button type="button" class="${liste('dd-bardak', i === DD.suSiradaki(icilen) && 'is-siradaki')}" style="--oran:${oran.toFixed(3)};--i:${i}" ${dolu ? 'data-su-cikar' : 'data-su-ekle'}="${DD.SU_BARDAK}" aria-label="1 su bardağı ${dolu ? 'geri al' : 'ekle'}"><span class="dd-bardak-ic"><i></i></span><span class="dd-bardak-arti" aria-hidden="true">${ik('ekle')}</span></button>`; };
  DD.suBardaklar = (icilen, hedef) => `<div class="dd-su-bardaklar" role="group" aria-label="${esc(`${DD.suBardak(hedef)} bardaklık hedef`)}">${Array.from({length: DD.suBardakSayi(icilen, hedef)}, (_, i) => DD.suBardakCiz(icilen, i)).join('')}</div>`;
  DD.suKart = (o = {}) => {
    const {icilen = 0, hedef = 2000, adimlar = [200, 500]} = o, dugmeler = adimlar.map(a => (typeof a === 'number' ? {ml: a, metin: `+${a} ml`} : a));
    return `<div class="${liste('dd-kart dd-su', o.sinif)}" data-deger="${icilen}" data-hedef="${hedef}" data-ad="${esc(o.ad || 'su')}"><div class="dd-ara"><span class="dd-su-baslik">${ik('su')}<span class="dd-t-card">Su</span></span>${o.kayitEylem ? `<button type="button" class="dd-su-kayit"${at({veri: {eylem: o.kayitEylem}})}><span>Kayıtlar</span>${ik('chevron-right')}</button>` : ''}</div><div class="dd-yigin-4"><div class="dd-su-sayi"><b class="dd-t-numeral-lg" data-su-deger>${sayi(icilen)}</b><small>/ ${sayi(hedef)} ml · ${DD.suBardak(hedef)} bardak</small></div><small class="dd-su-kalan" data-su-kalan aria-live="polite">${DD.suKalan(icilen, hedef)}</small></div>${DD.suBardaklar(icilen, hedef)}<div class="dd-su-dugmeler">${dugmeler.map(d => DD.btn({metin: d.metin, tur: 'tonal', boyut: 'sm', veri: {'su-ekle': d.ml}})).join('')}</div></div>`;
  };
  // Hızlı miktar karoları. {ogeler:[{ml, ad, ikon}], eylem}: dokunuş eklemedir, id miktardır.
  DD.suMiktarlar = (o = {}) => `<div class="dd-su-miktarlar">${(o.ogeler || []).map(x => `<button type="button" class="dd-su-miktar"${at({veri: {eylem: o.eylem, id: x.ml}})}>${ik(x.ikon)}<b>${sayi(x.ml)} ml</b><small>${esc(x.ad)}</small></button>`).join('')}</div>`;
  // Haftalık su çubukları. {gunler:[{etiket, ml, bugun}], hedef}: kesik çizgi hedeftir, renk yargı taşımaz.
  DD.suHafta = (o = {}) => {
    const l = o.gunler || [], ust = Math.max(o.hedef || 0, ...l.map(x => x.ml)) || 1;
    return `<div class="dd-su-hafta" role="img" aria-label="${esc(l.map(x => `${x.etiket} ${sayi(x.ml)} ml`).join(', '))}"><div class="dd-su-hafta-alan" style="--hedef:${(o.hedef / ust).toFixed(3)}">${l.map(x => `<i class="${liste('dd-su-cubuk', x.bugun && 'is-bugun')}" style="--oran:${(x.ml / ust).toFixed(3)}"></i>`).join('')}</div><div class="dd-su-hafta-gunler">${l.map(x => `<span class="${x.bugun ? 'is-bugun' : ''}">${esc(x.etiket)}</span>`).join('')}</div></div>`;
  };
  // Kilit ekranı önizlemesi: görsel + perde üstünde saat ve bildirim.
  DD.kilitEkrani = (o = {}) => `<figure class="${liste('dd-kilit', o.sinif)}" role="img" aria-label="${esc(`Kilit ekranı önizlemesi: ${o.baslik}. ${o.metin}`)}"><span class="dd-photo" style="background-image:url('${esc(o.gorsel || 'assets/gorsel/hero/ritim-su.webp')}')"></span><span class="dd-kilit-perde"></span><div class="dd-kilit-saat"><small>${esc(o.tarih)}</small><b>${esc(o.saat)}</b></div><div class="dd-kilit-bildirim"><img src="assets/marka/ikon-512.png" alt=""><div class="dd-kilit-metin"><div class="dd-ara"><small>Dada Diet</small><small>${esc(o.zaman || 'şimdi')}</small></div><b>${esc(o.baslik)}</b><span>${esc(o.metin)}</span></div></div></figure>`;
  // Su hatırlatması: su ekranı ve Profil > Bildirimler aynı parçadır. Durum: bildirim-ayar.su, su-sessiz {bas, bit}.
  const dakika = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const noktali = s => s.replace(':', '.');
  const sessizde = (dk, bas, bit) => (bas === bit ? false : bas < bit ? dk >= bas && dk < bit : dk >= bas || dk < bit);
  const sonrakiSaat = (bas, bit) => { const h0 = DD.simdi().getHours(); for (let i = 1; i <= 24; i += 1) { const h = (h0 + i) % 24; if (!sessizde(h * 60, dakika(bas), dakika(bit))) return `${String(h).padStart(2, '0')}:00`; } return null; };
  // Saat seçimi: yarım saatlik yerel seçici; tarayıcı diline bakmadan 24 saat gösterir.
  DD.saatSec = (o = {}) => `<div class="dd-alan"><label for="f-${esc(o.ad)}">${esc(o.etiket)}</label><div class="dd-girdi"><select id="f-${esc(o.ad)}" name="${esc(o.ad)}">${Array.from({length: 48}, (_, i) => { const v = `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`; return `<option value="${v}"${v === o.deger ? ' selected' : ''}>${noktali(v)}</option>`; }).join('')}</select></div></div>`;
  DD.suSonrakiSaat = () => { const {bas, bit} = DD.suHatirlatmaDurum(); return noktali(sonrakiSaat(bas, bit) || '18:00'); };
  DD.suHatirlatmaDurum = () => ({acik: DD.durum.oku('bildirim-ayar', {}).su ?? true, bas: '23:00', bit: '08:00', ...DD.durum.oku('su-sessiz', {})});
  const suHatirlatmaIc = () => {
    const {acik, bas, bit} = DD.suHatirlatmaDurum(), sonraki = sonrakiSaat(bas, bit), an = DD.simdi();
    const tarih = `${an.toLocaleDateString('tr-TR', {weekday: 'long'})}, ${an.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`;
    return `${DD.toggle({ad: 'su-hatirlat', ikon: 'bell', etiket: 'Saat başı hatırlat', alt: acik && sonraki ? `Sıradaki ${noktali(sonraki)}` : 'Kapalı', secili: acik})}${acik ? `<div class="dd-yigin-8"><span class="dd-t-card">Sessiz saatler</span><div class="dd-ikili">${DD.saatSec({ad: 'su-sessiz-bas', etiket: 'Başlangıç', deger: bas})}${DD.saatSec({ad: 'su-sessiz-bit', etiket: 'Bitiş', deger: bit})}</div><small class="dd-yardim">${bas === bit ? 'Sessiz saat yok; hatırlatma her saat gelir.' : `${noktali(bas)}–${noktali(bit)} arasında hatırlatma gelmez.`}</small></div><div class="dd-yigin-8"><span class="dd-t-card">Bildirim önizlemesi</span>${DD.kilitEkrani({saat: noktali(sonraki || '18:00'), tarih, baslik: 'Su zamanı', metin: `1 su bardağı (${DD.SU_BARDAK} ml) içmeye ne dersin?`})}</div>` : ''}`;
  };
  DD.suHatirlatma = () => `<div class="dd-yigin-12" data-su-hatirlatma>${suHatirlatmaIc()}</div>`;
  DD.suHatirlatmaBagla = kok => {
    const ciz = () => { const y = kok.querySelector('[data-su-hatirlatma]'); if (y) { y.innerHTML = suHatirlatmaIc(); if (window.DDMetin) DDMetin.isle(y); } };
    const anahtar = DD.on(kok, 'su-hatirlat', v => { DD.durum.yaz('bildirim-ayar', {...DD.durum.oku('bildirim-ayar', {}), su: v}); ciz(); DD.toast(`**Su hatırlatması** ${v ? 'açıldı' : 'kapatıldı'}`, {ikon: v ? 'bell' : 'bell-slash'}); });
    const saat = ev => { const ad = ev.target.name; if (!['su-sessiz-bas', 'su-sessiz-bit'].includes(ad) || !ev.target.value) return; const {bas, bit} = DD.suHatirlatmaDurum(); DD.durum.yaz('su-sessiz', {bas, bit, [ad === 'su-sessiz-bas' ? 'bas' : 'bit']: ev.target.value}); ciz(); };
    kok.addEventListener('change', saat);
    return () => { anahtar?.(); kok.removeEventListener('change', saat); };
  };
  // Sağlık uyarısı: seviye dikkat ya da acil; sheet gövdesidir, yönlendirme düğmesi taşımaz.
  DD.saglikUyari = (o = {}) => `<div class="${liste('dd-saglik-uyari', `is-${o.seviye || 'dikkat'}`)}">${DD.ikonKutu({ikon: o.seviye === 'acil' ? 'hata' : 'uyari', boyut: 'lg', ton: o.seviye === 'acil' ? 'hata' : 'uyari'})}${o.belirti ? DD.durumRozet({metin: o.belirti, ton: o.seviye === 'acil' ? 'hata' : 'uyari', ikon: o.ikon}) : ''}<p>${vurgu(o.metin)}</p></div>`;
  DD.duygu = (o = {}) => `<div class="${liste('dd-yigin-12', o.sinif)}">${o.soru ? `<span class="dd-t-card">${esc(o.soru)}</span>` : ''}<div class="dd-duygu" data-ad="${esc(o.ad || 'duygu')}" role="group" aria-label="${esc(o.soru || 'Duygu')}">${(o.secenekler || []).map(s => `<button type="button" data-deger="${esc(s.id)}" aria-pressed="${s.id === o.secili}">${ik(s.ikon)}<span>${esc(s.ad)}</span></button>`).join('')}</div></div>`;

  // ---------- Dada AI: kamera. Gastro DG.kamera işaretlemesi + mod şeridi ----------
  const kameraBtn = (eylem, ikon, aria, ek = '', sinif = '') => `<button class="dd-kamera-ibtn${sinif}" type="button" data-kamera="${eylem}" aria-label="${esc(aria)}"${ek}>${ik(ikon)}</button>`;
  // {baslik, onizleme|gorsel, belgeler:{menu,tahlil,barkod}, modlar, mod, yonerge, ipucu:{baslik,metin}, baglam, analiz, flas, durum:'canli'|'yukleniyor'}
  // Barkod vizörü de görsel + perde ile kurulur: düz koyu yüzey yok. data-kamera olayı: 'dd-kamera' {eylem: cek|galeri|cevir|flas|kapat}
  DD.kamera = (o = {}) => {
    const modlar = o.modlar || [], m = modlar.find(x => x.id === o.mod) || modlar[0] || {}, durum = o.durum || 'canli', barkod = m.id === 'barkod', foto = o.onizleme ?? o.gorsel;
    const ipucu = o.ipucu ? `<aside class="dd-kamera-ipucu"><div><b>${esc(o.ipucu.baslik)}</b>${kameraBtn('ipucu', 'kapat', 'İpucunu kapat')}</div><p>${esc(o.ipucu.metin)}</p></aside>` : '';
    const belgeler = Object.entries(o.belgeler || (o.belge ? {[m.id]: o.belge} : {})).map(([k, h]) => `<div class="dd-kamera-belge" data-belge="${esc(k)}">${h}</div>`).join('');
    return `<section class="${liste('dd-kamera', barkod && 'is-barkod', o.analiz && 'is-analiz', o.ornek && 'is-ornek')}" data-mod="${esc(m.id || 'tabak')}" aria-label="${esc(o.baslik || 'Kamera')}">${foto ? `<span class="dd-kamera-foto" style="background-image:url('${esc(foto)}')"></span>` : ''}<header class="dd-kamera-bas">${kameraBtn('kapat', 'kapat', 'Kapat')}<div>${o.baglam ? `<button type="button" class="dd-kamera-baglam" data-kamera="baglam">${esc(o.baglam)}${ik('ac')}</button>` : `<b>${esc(o.baslik || 'Dada AI')}</b>`}</div>${kameraBtn('flas', 'bolt', 'Flaş aç / kapat', ` aria-pressed="${!!o.flas}"`)}</header><div class="dd-kamera-vizor" aria-hidden="true">${belgeler}<i class="dd-kamera-ag"></i><span></span><span></span><span></span><span></span>${barkod || o.tarama ? '<i class="dd-kamera-tarama"></i>' : ''}</div>${durum === 'yukleniyor' ? '<span class="dd-kamera-yukleniyor" role="status" aria-label="Kamera açılıyor"></span>' : ''}<div class="dd-kamera-alt"><p class="dd-kamera-yonerge" role="status">${esc(o.analiz || o.yonerge || m.ipucu || 'Çerçevenin içine al')}</p>${ipucu}<div class="dd-kamera-kontrol">${kameraBtn('galeri', 'galeri', 'Galeriden seç', '', ' dd-kamera-galeri')}<button class="dd-kamera-deklansor" type="button" data-kamera="cek" aria-label="Fotoğraf çek">${ik('kamera')}</button>${kameraBtn('mikrofon', 'mikrofon', 'Sesle anlat')}</div><div class="dd-kamera-modlar" role="tablist">${modlar.map(x => `<button type="button" role="tab" class="dd-kamera-mod" data-deger="${esc(x.id)}" data-ipucu="${esc(x.ipucu || '')}" aria-selected="${x.id === m.id}">${esc(x.ad)}</button>`).join('')}</div></div></section>`;
  };
  // İzin reddedildi sahnesi: Gastro kamera.izinSahne
  DD.kameraIzinSahne = (o = {}) => DD.durumSahne({tema: 'koyu', gorsel: o.gorsel, isaret: 'kamera', baslik: o.baslik || 'Kamera izni gerekli', metin: o.metin || 'Fotoğraf çekmek için **kamera izni** gerekir. **Galeriden de** seçebilirsin.', ana: {metin: 'Ayarları aç', ikon: 'ayar', attrs: 'data-izin-ayar'}, ikinciller: [{metin: 'Galeriden seç', ikon: 'galeri', attrs: 'data-kamera="galeri"'}], ipucuBaslik: 'Kamera iznini açmak için', ipucuParcali: true, ipuclari: [['ayar', 'Ayarlar’ı aç', 'Ayarlar’da Dada Diet’i bul.'], ['kamera', 'Kamerayı aç', 'Kamera iznini “İzin ver” yap.'], ['arrow-rotate-left', 'Uygulamaya dön', 'Kamera kendiliğinden açılır.']]});
  // Kâğıt önizleme: vizörde HTML kâğıt. tur menu | tahlil | barkod
  DD.belge = (o = {}) => (o.tur === 'barkod'
    ? `<div class="dd-belge is-barkod"><span class="dd-barkod-cubuk" aria-hidden="true">${[...String(o.ean || '8690000000012')].map((c, i) => `<i style="--g:${(+c % 3) + 1};--b:${((+c + i) % 2) + 1}"></i>`).join('').repeat(3)}</span><small>${esc(o.ean || '8690000000012')}</small></div>`
    : o.tur === 'tahlil'
      ? `<div class="dd-belge is-tahlil"><div class="dd-belge-bas"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></div><div class="dd-belge-tablo"><span>Test</span><span>Sonuç</span><span>Referans</span>${(o.satirlar || []).map(s => `<span>${esc(s.ad)}</span><b>${esc(s.deger)}</b><span>${esc(s.referans)}</span>`).join('')}</div></div>`
      : `<div class="dd-belge is-menu"><div class="dd-belge-bas"><b>${esc(o.baslik)}</b><small>${esc(o.alt || '')}</small></div>${(o.gruplar || []).map(g => `<div class="dd-belge-grup"><span class="dd-belge-grup-ad">${esc(g.ad)}</span>${g.satirlar.map(s => `<div class="dd-belge-satir"><span>${esc(s.ad)}</span><i></i><span>${esc(s.fiyat)}</span></div>`).join('')}</div>`).join('')}</div>`);
  DD.analizAdimlari = (o = {}) => DD.parcali((o.adimlar || []).map((a, i) => ({ikon: i < o.etkin ? 'onay' : i === o.etkin ? 'rotate-right' : 'circle', baslik: a, bilgi: true})));
  // Bbox: varsayılan yüzen hap etiket, çerçeve yalnız seçili halde. En çok etiketAdet hap, kalanı nokta. Etiket kenara itilir.
  const basHarfler = s => String(s).split(' ').map(k => k.charAt(0).toLocaleUpperCase('tr') + k.slice(1)).join(' ');
  DD.bbox = (o = {}) => {
    const l = (o.kutular || []).map(k => { const b = k.bbox || k; return {...k, b, cx: b.x + b.w / 2, cy: b.y + b.h / 2}; });
    const onde = [...l].sort((a, b) => (b.kcal || 0) - (a.kcal || 0)).slice(0, o.etiketAdet ?? 4).map(k => k.id);
    if (o.secili && !onde.includes(o.secili)) onde[onde.length - 1] = o.secili;
    // Sol ve sağ etiket aynı satıra düşmez: dar ekranda hap genişliği çakışmaya yol açar.
    const yerlestir = grup => { grup.sort((a, b) => a.cy - b.cy); let y = 6; grup.forEach(k => { k.ly = Math.max(k.cy, y); y = k.ly + 11; }); let t = 94; [...grup].reverse().forEach(k => { k.ly = Math.min(k.ly, t); t = k.ly - 11; }); grup.forEach(k => { const sol = k.cx < 50; k.lx = sol ? 3 : 97; k.yan = sol ? 'is-sol' : 'is-sag'; }); };
    const et = l.filter(k => onde.includes(k.id));
    yerlestir(et);
    const cizgi = et.map(k => `<line x1="${yuvarla(k.cx)}" y1="${yuvarla(k.cy)}" x2="${k.lx}" y2="${yuvarla(k.ly)}"/>`).join('');
    return `<div class="${liste('dd-bbox', o.sinif)}" data-ad="${esc(o.ad || 'bbox')}"><span class="dd-photo" style="background-image:url('${esc(o.gorsel)}')"></span><svg class="dd-bbox-cizgiler" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${cizgi}</svg>${l.map(k => `<div class="${liste('dd-bbox-oge', k.id === o.secili && 'is-secili', k.yan)}" style="--x:${k.b.x}%;--y:${k.b.y}%;--w:${k.b.w}%;--h:${k.b.h}%;--cx:${yuvarla(k.cx)}%;--cy:${yuvarla(k.cy)}%${k.lx != null ? `;--lx:${k.lx}%;--ly:${yuvarla(k.ly)}%` : ''}"><i class="dd-bbox-cerceve"></i><button type="button" class="dd-bbox-nokta" data-deger="${esc(k.id)}" aria-label="${esc(k.ad)}"><i></i></button>${k.lx != null ? `<button type="button" class="dd-bbox-et" data-deger="${esc(k.id)}" tabindex="-1">${esc(basHarfler(k.ad))}${k.kcal != null ? ` · <b>${sayi(k.kcal)} kcal</b>` : ''}</button>` : ''}</div>`).join('')}</div>`;
  };
  DD.guvenRozet = g => DD.durumRozet({metin: g >= 90 ? 'Eminim' : g >= 80 ? 'Büyük ihtimalle' : 'Kontrol et', ton: g >= 90 ? 'basari' : g >= 80 ? 'notr' : 'uyari', ikon: g >= 90 ? 'onay' : g >= 80 ? 'circle-info' : 'uyari'});
  DD.aiSatir = (b, o = {}) => DD.satir({sol: DD.gorsel({src: b.gorsel ?? null, ad: b.ad, ton: DD.makroTon(b)}), baslik: b.ad, alt: `${sayi(b.gram)} g · ${sayi(b.kcal)} kcal`, sag: `${DD.guvenRozet(b.guven)}${DD.ikonBtn({ikon: 'duzenle', etiket: `${b.ad} düzelt`, veri: {eylem: 'duzelt', id: b.id}})}`, ok: false, duz: true, sinif: liste('dd-ai-satir', o.secili && 'is-secili'), attrs: `data-ai-id="${esc(b.id)}"`});
  DD.varsayim = (o = {}) => `<button type="button" class="dd-veri-yok dd-varsayim"${at(o)}>${ik('bilgi')}<span>${vurgu(o.metin)}</span>${o.eylem ? `<b>${esc(o.eylem)}</b>` : ''}</button>`;
  DD.tabagimBar = (o = {}) => `<div class="dd-bar-ic dd-tabagim"><button type="button" class="dd-kayan-kim" data-tabagim-ac aria-label="Tabağı aç">${(o.ogeler || []).slice(0, 3).map(x => DD.gorsel({src: x.gorsel ?? null, ad: x.ad, ton: DD.makroTon(x), sinif: 'dd-tabagim-foto'})).join('')}<span class="dd-satir-metin"><b class="dd-kayan-baslik">Tabağım</b><small>${esc(o.adet)} öğe · ${sayi(o.kcal)} kcal</small></span>${ik('chevron-up')}</button></div>`;
  DD.tabagimListe = l => (l.length ? DD.satirlar(l.map(x => DD.besinSatir(x, {sag: DD.ikonBtn({ikon: 'sil', etiket: `${x.ad} çıkar`, veri: {'tabagim-cikar': x.id}})}))) : DD.bos({ikon: 'tabak', baslik: 'Tabağın boş', metin: 'Fotoğraf, barkod ya da aramayla eklediklerin **burada birikir**.'}));
  // Öneri kartı: Gastro .dd-kart + .dd-eylem.is-secili dili; en uygun hali yeşil çerçeve.
  // Menü satırı sağı: tahmini kalori önde, puan altta.
  DD.menuDeger = (o = {}) => `<span class="dd-menu-deger"><b>≈ ${sayi(o.kcal)} kcal</b>${o.puan != null ? DD.skorRozet({skor: o.puan}) : ''}</span>`;
  DD.oneriKart = (o = {}) => `<article class="${liste('dd-kart dd-oneri', o.enUygun && 'is-en-uygun', o.sinif)}"><div class="dd-oneri-ust">${DD.gorsel({src: o.gorsel, ad: o.ad})}<div class="dd-satir-metin">${o.enUygun ? DD.durumRozet({metin: o.rozet || 'En uygun', ton: 'basari', ikon: 'onay'}) : ''}<span class="dd-t-card dd-kirp-2">${esc(o.ad)}</span>${o.makro ? '' : `<small>${esc([`${sayi(o.kcal)} kcal`, o.P != null ? `${sayi(o.P)} g protein` : ''].filter(Boolean).join(' · '))}</small>`}</div>${o.puan != null ? DD.skorRozet({skor: o.puan}) : ''}</div>${o.makro ? DD.ozetSerit([{ikon: 'kalori', etiket: 'Kalori', deger: sayi(o.kcal), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: sayi(o.P), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(o.K), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(o.Y), birim: 'g'}]) : ''}${o.gerekce ? DD.p(o.gerekce, {ton: 'ikincil', meta: true}) : ''}${o.uyari ? `<p class="dd-hata is-uyari">${ik('uyari')}${esc(o.uyari)}</p>` : ''}${o.eylem ? DD.btn({boyut: 'sm', tam: true, tur: o.enUygun ? 'primary' : 'secondary', ...o.eylem}) : ''}</article>`;

  // ---------- Ses ve sohbet ----------
  DD.sesDalga = (o = {}) => `<div class="${liste('dd-dalga', o.aktif !== false && 'is-aktif')}" aria-hidden="true">${Array.from({length: o.adet || 28}, (_, i) => `<i style="--i:${i};--h:${(.28 + .72 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .6))).toFixed(2)}"></i>`).join('')}</div>`;
  DD.transkript = (o = {}) => DD.bilgi({etiket: o.etiket || 'Duyduğum', html: `<p>${vurgu(o.metin)}${o.canli ? '<i class="dd-imlec"></i>' : ''}</p>`});
  DD.sifreliRozet = (o = {}) => DD.durumRozet({metin: o.metin || 'Uçtan uca şifreli', ton: 'basari', ikon: 'sifreli'});
  DD.balon = (o = {}) => `<div class="dd-balon-kap is-${o.kim === 'ben' ? 'ben' : 'o'}">${o.kim !== 'ben' && o.harf ? DD.avatar({ad: o.harf, boyut: 20}) : ''}<div class="dd-balon"><p>${vurgu(o.metin)}</p>${o.ek ? `<span class="dd-balon-ek">${ik(o.ek.ikon || 'ek')}${esc(o.ek.ad || o.ek)}</span>` : ''}<time>${esc(o.saat || '')}${o.kim === 'ben' ? ik('check-double') : ''}</time></div></div>`;
  DD.gunAyrac = metin => `<div class="dd-gun-ayrac">${DD.rozet({metin, ton: 'notr'})}</div>`;
  DD.mesajGiris = (o = {}) => `<div class="dd-bar"><form class="dd-bar-ic dd-mesaj" data-mesaj>${DD.ikonBtn({ikon: 'ek', etiket: 'Dosya ekle', veri: {eylem: 'ek'}})}<div class="dd-girdi"><input name="${esc(o.ad || 'mesaj')}" placeholder="${esc(o.yer || 'Mesaj yaz')}" aria-label="${esc(o.yer || 'Mesaj yaz')}" autocomplete="off" enterkeyhint="send"></div>${DD.ikonBtn({ikon: 'mikrofon', etiket: 'Sesli mesaj', veri: {eylem: 'ses-mesaj'}})}${DD.ikonBtn({ikon: 'gonder', etiket: 'Gönder', tur: 'dolu', tip: 'submit'})}</form></div>`;

  // ---------- Geri sayım, faz, kıyas ----------
  DD._geriSayimCiz = (el, s) => { s = Math.max(0, s); const v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60]; el.querySelectorAll('[data-gs]').forEach((b, i) => { b.textContent = iki2(v[i]); }); };
  const iki2 = n => String(n).padStart(2, '0');
  // Yalnız randevu. İstatistik bandı dili.
  DD.geriSayim = (o = {}) => { const s = o.saniye || 0, v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60], et = ['gün', 'saat', 'dk', 'sn']; return `<dl class="${liste('dd-istatistik dd-geri', o.sinif)}" data-sutun="4" ${o.canli === false ? '' : `data-c="geri" data-saniye="${s}" data-yon="-1"`} role="timer">${v.map((x, i) => `<div><dt>${et[i]}</dt><dd data-gs>${iki2(x)}</dd></div>`).join('')}</dl>`; };
  DD.fazCizelge = (o = {}) => { const ei = (o.fazlar || []).findIndex(f => f.id === o.etkin); return `<ol class="${liste('dd-faz', o.sinif)}">${(o.fazlar || []).map((f, i) => `<li class="${i < ei ? 'is-gecti' : i === ei ? 'is-etkin' : ''}"><span class="dd-faz-isaret">${ik(f.ikon)}</span><div class="dd-faz-metin"><div class="dd-ara"><span class="dd-t-card">${esc(f.ad)}</span><small>${esc(f.aralik)}</small></div>${i === ei ? DD.durumRozet({metin: 'Şu an buradasın', ton: 'basari', ikon: 'onay'}) : ''}<p class="dd-t-meta dd-ton-ikincil">${vurgu(i === ei && f.aciklama ? f.aciklama : f.kisa)}</p></div></li>`).join('')}</ol>`; };
  DD.kiyasTablo = (o = {}) => {
    const kazanan = s => { if (!s.iyi || s.a === s.b) return ''; return (s.iyi === 'az') === (s.a < s.b) ? 'a' : 'b'; };
    const hucre = (s, k, t) => `<span class="${t === k ? 'is-kazanan' : ''}">${t === k ? ik('onay') : ''}<b>${ondalik(s[k], 1)}</b> <small>${esc(s.birim || '')}</small></span>`;
    const bas = x => `<span class="dd-kiyas-bas">${DD.gorsel({src: x.gorsel ?? null, ad: x.ad, ton: DD.makroTon(x)})}<span class="dd-t-meta dd-kirp-2">${esc(x.ad)}</span></span>`;
    return `<div class="${liste('dd-kart dd-kiyas', o.sinif)}"><div class="dd-kiyas-ust">${bas(o.a)}${DD.ikonKutu({ikon: 'kiyas', boyut: 'sm', ton: 'notr'})}${bas(o.b)}</div><div class="dd-satirlar">${(o.satirlar || []).map(s => { const k = kazanan(s); return `<div class="dd-kiyas-satir">${hucre(s, 'a', k)}<em>${esc(s.ad)}</em>${hucre(s, 'b', k)}</div>`; }).join('')}</div></div>`;
  };

  // ---------- Ürün skoru, tahlil, paket ----------
  DD.skorRozet = (o = {}) => { const t = DD.skorTon(o.skor); return `<span class="${liste('dd-skor-rozet', `is-${t}`, o.buyuk && 'is-buyuk')}" aria-label="${esc(`${o.skor} / 100`)}"><b>${esc(o.skor)}</b><small>/100</small></span>`; };
  DD.skorKart = (o = {}) => { const t = DD.skorTon(o.skor); return `<${o.git ? 'button type="button"' : 'div'} class="${liste('dd-eylem dd-skor-kart', `is-${t}`, o.sinif)}"${at({git: o.git})}><span class="dd-eylem-ikon" aria-hidden="true">${ik(o.ikon || 'barkod')}</span><span class="dd-eylem-metin"><b>${esc(o.ad)}</b><small>${esc([o.kategori, o.etiket].filter(Boolean).join(' · '))}</small></span>${DD.skorRozet({skor: o.skor})}</${o.git ? 'button' : 'div'}>`; };
  DD.icerikUyari = (o = {}) => { const d = o.durum || 'notr'; return `<div class="dd-satir dd-icerik-uyari is-${d}"><span class="dd-satir-ikon">${ik({iyi: 'basari', dikkat: 'uyari', notr: 'circle-minus'}[d])}</span><span class="dd-satir-metin"><span>${esc(o.metin)}</span>${o.aciklama ? `<small>${esc(o.aciklama)}</small>` : ''}</span></div>`; };
  const referans = (r, v) => {
    const m = String(r).replace(/,/g, '.').match(/([\d.]+)\s*-\s*([\d.]+)/), lt = String(r).replace(/,/g, '.').match(/<\s*([\d.]+)/), gt = String(r).replace(/,/g, '.').match(/>\s*([\d.]+)/);
    let a, b;
    if (m) { a = +m[1]; b = +m[2]; } else if (lt) { a = 0; b = +lt[1]; } else if (gt) { a = +gt[1]; b = a * 2; } else return {sol: .25, gen: .5, nokta: .5};
    const min = Math.min(a - (b - a) * .5, v), max = Math.max(b + (b - a) * .5, v), o = x => (x - min) / (max - min || 1);
    return {sol: o(a), gen: o(b) - o(a), nokta: o(v)};
  };
  DD.tahlilSatir = (o = {}) => {
    const v = parseFloat(String(o.deger).replace(',', '.')), r = referans(o.referans, v), d = o.durum || 'normal', [et, ikon] = {normal: ['Normal', 'onay'], dusuk: ['Düşük', 'arrow-down'], yuksek: ['Yüksek', 'arrow-up']}[d];
    return `<div class="dd-tahlil is-${d}"><div class="dd-ara"><span>${esc(o.ad)}</span><b>${esc(typeof o.deger === 'number' ? ondalik(o.deger, 1) : o.deger)}${o.birim ? ` <small>${esc(o.birim)}</small>` : ''}</b></div><div class="dd-tahlil-yol" style="--sol:${r.sol.toFixed(3)};--gen:${r.gen.toFixed(3)};--nokta:${kisit(r.nokta, 0, 1).toFixed(3)}"><i class="dd-tahlil-aralik"></i><i class="dd-tahlil-nokta"></i></div><div class="dd-ara"><small class="dd-yardim">Referans ${esc(o.referans)}${o.birim ? ` ${esc(o.birim)}` : ''}</small>${DD.durumRozet({metin: et, ton: d === 'normal' ? 'basari' : 'uyari', ikon})}</div>${o.aciklama ? DD.p(o.aciklama, {ton: 'ikincil', meta: true}) : ''}</div>`;
  };
  // Paket: seçim kartı ailesi.
  DD.paketler = (o = {}) => `<div class="dd-secim-izgara is-tek dd-paketler" role="radiogroup" data-ad="${esc(o.ad || 'paket')}">${(o.ogeler || []).map(p => `<button type="button" class="dd-secim-kart is-metin dd-paket" role="radio" data-k="${esc(p.id)}" aria-checked="${p.id === o.secili}"><span class="dd-secim-metin"><b>${esc(p.ad)}</b><small>${esc(`${p.seans} görüşme · ${p.sure}`)}</small>${p.rozet ? DD.rozet({metin: p.rozet}) : ''}<b class="dd-paket-fiyat">${esc(DD.paraTL(p.fiyat))}</b><span class="dd-paket-kapsam">${(p.kapsam || []).map(k => `<small>${ik('onay')}${esc(k)}</small>`).join('')}</span></span><span class="dd-secim-kutu" aria-hidden="true"><span class="choice-mark">${ik('onay')}</span></span></button>`).join('')}</div>`;

  // ---------- Referans eklentileri ----------
  DD.icgoruKart = (o = {}) => `<div class="dd-yigin-8">${DD.ipucu({ikon: 'wand-magic-sparkles', html: `<b>${esc(o.baslik)}</b> ${vurgu(o.metin || '')}`})}${o.yanitlar ? `<div class="dd-sira">${o.yanitlar.map(y => DD.cip({kucuk: true, ...y})).join('')}</div>` : ''}</div>`;
  DD.soruCipleri = (o = {}) => `<div class="dd-serit">${(o.sorular || []).map(q => { const x = typeof q === 'string' ? {metin: q} : q; return DD.cip({...x, ikon: x.ikon || 'wand-magic-sparkles', veri: {eylem: 'soru', soru: x.metin}}); }).join('')}</div>`;
  DD.tamamlanmaKart = (o = {}) => `<div class="dd-feature dd-tamam"><div class="dd-feature__media"><span class="dd-feature__visual"><span class="dd-photo" style="background-image:url('${esc(o.gorsel || 'assets/gorsel/hero/ritim-sakin.webp')}')"></span></span><span class="dd-feature__veil" aria-hidden="true"></span><div class="dd-feature__info"><div class="dd-card__text">${o.bas ? `<span class="dd-card__category">${esc(`${o.bas} - ${o.bit}`)}</span>` : ''}<h3 class="dd-card__title">${esc(o.baslik)}</h3></div>${o.alt ? `<div class="dd-author"><span class="dd-author__name">${esc(o.alt)}</span></div>` : ''}</div></div>${o.eylem ? DD.btn({tam: true, tur: 'tonal', ...o.eylem}) : ''}</div>`;
  DD.zamanHucre = (o = {}) => `<div class="dd-kart is-gri dd-zaman"><small class="dd-yardim">${esc(o.etiket)}</small><b class="dd-t-stat">${esc(o.deger)}</b>${o.alt ? `<small class="dd-yardim">${esc(o.alt)}</small>` : ''}${o.eylem === false ? '' : DD.btn({metin: o.eylem || 'Düzenle', tur: 'text', veri: {eylem: 'zaman-duzenle', id: o.id || ''}})}</div>`;
  DD.zamanHucreler = l => `<div class="dd-ikili">${l.map(DD.zamanHucre).join('')}</div>`;
  DD.madde = (o = {}) => `<div class="dd-madde is-${o.tur || 'arti'}">${ik({arti: 'circle-plus', eksi: 'circle-minus', notr: 'circle'}[o.tur || 'arti'])}<span>${vurgu(o.metin)}</span></div>`;
  DD.etiketJeton = (o = {}) => DD.cip({metin: o.metin, kapat: true, kucuk: true, sinif: `dd-jeton is-${o.durum || 'notr'}`, veri: {eylem: 'jeton-sil', id: o.id ?? o.metin}});
  DD.randevuSatir = (o = {}) => `<${o.git ? 'button type="button"' : 'div'} class="dd-eylem dd-randevu"${at({git: o.git})}><span class="dd-eylem-ikon dd-randevu-tarih" aria-hidden="true"><b>${esc(o.gun)}</b><small>${esc(o.ay)}</small></span><span class="dd-eylem-metin"><b>${esc(o.baslik)}</b><small>${esc([o.saat, o.alt].filter(Boolean).join(' · '))}</small></span>${o.durum ? DD.durumRozet({metin: o.durum, ikon: 'saat'}) : ik('satirOk')}</${o.git ? 'button' : 'div'}>`;
  DD.belgeSatir = (o = {}) => DD.satir({ikon: o.ikon || 'tahlil', baslik: o.baslik, alt: [o.alt, o.tarih].filter(Boolean).join(' · '), git: o.git, veri: o.veri});
  DD.gizlilikBant = metin => DD.veriYok(metin || 'Bu dosyaya **yalnız sen ve diyetisyenin** erişebilir.');
  DD.slotlar = (o = {}) => `<div class="dd-yigin-12" data-cip-grup="tek" data-ad="${esc(o.ad || 'slot')}">${(o.gruplar || []).map(g => `<div class="dd-yigin-8"><span class="dd-yardim">${esc(g.ad)}</span><div class="dd-sira">${g.slotlar.map(s => DD.cip({metin: s.saat, deger: s.saat, secili: s.saat === o.secili, pasif: s.pasif})).join('')}</div></div>`).join('')}</div>`;
  DD.pencereBant = (o = {}) => { const b = DD.saatDk(o.bas) / 1440, e = DD.saatDk(o.bit) / 1440, n = DD.saatDk(o.simdi || '12:00') / 1440; return `<${o.git ? 'button type="button"' : 'div'} class="dd-kart dd-pencere"${at({git: o.git})}>${o.baslik ? `<div class="dd-ara"><span>${esc(o.baslik)}</span><small class="dd-yardim">${esc(o.alt || '')}</small></div>` : ''}<div class="dd-pencere-yol" style="--b:${b.toFixed(4)};--e:${e.toFixed(4)};--n:${n.toFixed(4)}"><i class="dd-pencere-acik"></i><i class="dd-pencere-simdi"></i></div><div class="dd-pencere-et"><span>00</span><span style="--p:${b.toFixed(4)}">${esc(o.bas)}</span><span style="--p:${e.toFixed(4)}">${esc(o.bit)}</span><span>24</span></div></${o.git ? 'button' : 'div'}>`; };
  DD.gorevSatir = (o = {}) => DD.checkbox({ad: o.id || 'gorev', etiket: o.baslik, alt: o.alt, secili: o.tamam});
  DD.modulListe = (o = {}) => `<div class="dd-yigin-8">${o.ozet ? `<span class="dd-yardim">${esc(o.ozet)}</span>` : ''}${DD.parcali((o.ogeler || []).map(m => ({ikon: m.durum === 'tamam' ? 'onay' : m.durum === 'kilitli' ? 'sifreli' : 'play', baslik: m.baslik, alt: m.alt, git: m.git, ana: m.durum === 'siradaki', pasif: m.durum === 'kilitli', bilgi: m.durum === 'kilitli'})))}</div>`;
  DD.uyumRozet = (o = {}) => DD.durumRozet({metin: `Sana uyumu %${o.oran}`, ikon: 'hedef', ton: o.oran >= 70 ? 'basari' : o.oran >= 40 ? 'uyari' : 'notr'});
  DD.yolculuk = (o = {}) => { const oran = kisit((o.bas - o.simdi) / ((o.bas - o.hedef) || 1), 0, 1); return DD.ilerleme({n: oran * 100, hedef: 100, etiket: o.etiket || 'Yolculuğun', deger: `${ondalik(o.simdi, 1)} / ${ondalik(o.hedef, 1)} ${o.birim || 'kg'}`}); };
  DD.dengeSatirlar = l => `<div class="dd-yigin">${(l || []).map(b => `<div class="dd-yigin-8">${DD.ilerleme({n: b.puan, hedef: b.enCok, etiket: b.ad, deger: `${b.puan} / ${b.enCok}`})}${b.yorum ? `<small class="dd-yardim">${esc(b.yorum)}</small>` : ''}</div>`).join('')}</div>`;
  DD.fotoIzgara = l => `<div class="dd-izgara-3">${l.map(x => `<button type="button" class="dd-medya dd-foto-kare"${at(x)}><span class="dd-photo" style="background-image:url('${esc(x.gorsel)}')"></span>${x.saat ? `<span class="dd-meta">${esc(x.saat)}</span>` : ''}</button>`).join('')}</div>`;
})();
