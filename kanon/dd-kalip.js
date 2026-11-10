/* Ekran kalıbı çizicileri: Gastro ana-v3, liste-v2, detay-v2 işaretlemesi ve davranışı. Katalog: kanon/README.md §3. */
(() => {
  const DD = window.DD, {esc, ik, at, vurgu, sayi} = DD, TK = DD.TK, M = TK.motion;
  const liste = (...s) => s.filter(Boolean).join(' ');
  const bg = src => (src ? ` style="background-image:url('${esc(src)}')"` : '');
  const noktalar = n => `<span class="dd-pager-dots">${Array.from({length: n}, (_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span>`;

  // ---------- ana-v3 ----------
  // {slaytlar:[{gorsel, etiket, baslik, alt, git}], baslik, altBaslik, arama:{metin, git}, icerik, perde:'tam'}. Üst bar saydam, gülücük alt kenar.
  DD.heroAna = (o = {}) => {
    const S = o.slaytlar || [], cok = S.length > 1;
    const slayt = (r, i, klon) => `<div class="dd-hero-slide"${klon ? ' data-klon aria-hidden="true" inert' : ` role="group" aria-roledescription="slide" aria-label="${i + 1} / ${S.length}"`}><div class="dd-hero-foto"${bg(r.gorsel)}></div><div class="dd-hero-perde"></div>${r.git ? `<button type="button" class="dd-hero-hit" tabindex="-1" aria-hidden="true" data-git="${esc(r.git)}"></button>` : ''}<div class="dd-hero-info"><div class="dd-hero-copy">${r.etiket ? `<small>${esc(r.etiket)}</small>` : ''}${r.baslik ? `<strong>${esc(r.baslik)}</strong>` : ''}${r.alt ? `<span class="dd-hero-alt">${r.avatar ? `<span class="dd-card-avatar" aria-hidden="true">${esc(String(r.avatar).slice(0, 1).toLocaleUpperCase('tr'))}</span>` : ''}<span class="dd-kirp-1">${esc(r.alt)}</span></span>` : ''}</div></div></div>`;
    return `<section class="${liste('dd-hero dd-gulucuk', o.perde === 'tam' && 'is-perdeli', o.sinif)}" data-c="kalip" data-kalip="hero"><div class="dd-hero-track" role="region" aria-roledescription="carousel" aria-label="${esc(o.etiket || 'Öneriler, yatay kaydır')}" tabindex="0">${S.map((r, i) => slayt(r, i)).join('')}${cok ? slayt(S[0], 0, true) : ''}</div>${o.baslik || o.arama ? `<div class="dd-hero-top">${o.baslik ? `<h1>${esc(o.baslik)}</h1>` : ''}${o.altBaslik ? `<p>${esc(o.altBaslik)}</p>` : ''}${o.arama ? `<button type="button" class="dd-hero-ara"${at({git: o.arama.git || '#/ara'})}>${ik('ara_')}<span>${esc(o.arama.metin || 'Ara')}</span></button>` : ''}</div>` : ''}${o.icerik ? `<div class="dd-hero-orta">${o.icerik}</div>` : ''}${cok ? `<div class="dd-hero-pager" aria-hidden="true">${noktalar(S.length)}</div>` : ''}</section>`;
  };
  // Alterne gri/beyaz bölümler: [{baslik, eylem, git, html}|html]
  DD.bolumler = l => `<div class="dd-icerikler">${l.filter(Boolean).map(x => (typeof x === 'string' ? `<section>${x}</section>` : `<section${at({id: x.id})}>${x.baslik ? DD.bas(x.baslik, x.eylem ? (typeof x.eylem === 'string' ? {metin: x.eylem, git: x.git} : x.eylem) : null) : ''}${x.html || ''}</section>`)).join('')}</div>`;
  DD.yuzey = html => `<div class="dd-yuzey">${html}</div>`;
  DD.seritKartlar = l => `<div class="dd-strip">${l.map(x => `<button type="button" class="dd-strip-oge"${at(x)}><span class="dd-strip-medya"><span class="dd-photo"${bg(x.gorsel)}></span></span><span class="dd-strip-metin"><b>${esc(x.ad)}</b>${x.alt ? `<small>${esc(x.alt)}</small>` : ''}</span></button>`).join('')}</div>`;
  // Öne çıkan slider: DGCard.slider; gösterge noktaları kartın içinde.
  DD.oneCikan = (l, o = {}) => (l.length === 1 ? l[0] : `<section class="dd-kslider" data-count="${l.length}" data-c="kalip" data-kalip="slider" aria-roledescription="carousel" aria-label="${esc(o.etiket || 'Öne çıkanlar')}"><div class="dd-kslider__track" tabindex="0">${l.map((h, i) => `<div class="dd-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${l.length}">${h}</div>`).join('')}</div><div class="dd-kslider__pager" aria-hidden="true">${noktalar(l.length)}</div></section>`);
  DD.kesikKart = (o = {}) => `<button type="button" class="dd-uzman-ol"${at(o)}>${ik(o.ikon || 'circle-plus')}<b>${esc(o.baslik)}</b>${o.alt ? `<span>${esc(o.alt)}</span>` : ''}</button>`;

  // ---------- liste-v2 ----------
  // Panel başı: arama + filtre, segment, görselli çip şeridi. Yapışır, köşesi düzleşir.
  DD.listeArac = (o = {}) => `<div class="dd-liste-arac">${DD.arama({yer: o.yer || 'Ara', ad: o.ad, deger: o.deger, sonuc: false, sonEk: `<button class="dd-liste-search-filter${o.filtreSayi ? ' is-active' : ''}" type="button" aria-label="Filtrele" data-eylem="filtre">${ik('filtre')}${o.filtreSayi ? `<span class="dd-badge dd-liste-search-filter__badge">${esc(o.filtreSayi)}</span>` : ''}</button>`})}${o.segment ? `<div class="dd-liste-scope">${o.segment}</div>` : ''}${o.serit ? `<div class="dd-liste-rail">${o.serit}</div>` : ''}</div>`;
  const lcip = x => { const mark = x.gorsel ? `<span class="dd-mark"><span class="dd-mark__foto"${bg(x.gorsel)}></span></span>` : x.ikon ? `<span class="dd-mark">${ik(x.ikon)}</span>` : ''; return `<button type="button" class="${liste('dd-kok-chip', x.kapat && 'dd-kok-chip--removable')}"${x.deger != null ? ` data-cip="${esc(x.deger)}" aria-pressed="${!!x.secili}"` : ''}${at(x)}>${mark}<span>${esc(x.metin ?? x.ad)}</span>${x.sayi != null ? `<span class="dd-kok-chip__count">${esc(x.sayi)}</span>` : ''}${x.kapat ? ik('kapat') : ''}</button>`; };
  // Görselli çip şeridi: {ad, tur, ogeler:[{metin, deger, gorsel, ikon, sayi}], secili}
  DD.cipSerit = (o = {}) => { const s = [].concat(o.secili ?? []); return `<div class="dd-kok-chip-rail" data-cip-grup="${o.tur || 'tek'}" data-ad="${esc(o.ad || '')}" role="group"${o.etiket ? ` aria-label="${esc(o.etiket)}"` : ''}>${o.ogeler.map(x => lcip({...x, secili: s.includes(x.deger)})).join('')}</div>`; };
  // Sonuç satırı: {sayi, birim, sirala, gorunum:'izgara'|'liste'}
  DD.listeDurum = (o = {}) => `<div class="dd-liste-status"><p class="dd-liste-sayi"><b>${esc(sayi(o.sayi))} ${esc(o.birim || 'sonuç')}</b> bulundu</p><div class="dd-liste-status__controls">${o.sirala === false ? '' : `<div class="dd-liste-sort-group"><button type="button" class="dd-liste-sort-button${o.siraliAktif ? ' is-active' : ''}" aria-label="Sırala" data-eylem="sirala">${ik('sirala')}</button></div>`}<div class="dd-gorunum" role="group" aria-label="Görünüm" data-cip-grup="tek" data-ad="${esc(o.ad || 'gorunum')}"><button type="button" data-cip="izgara" aria-pressed="${(o.gorunum || 'izgara') === 'izgara'}" aria-label="Izgara">${ik('table-cells-large')}</button><button type="button" data-cip="liste" aria-pressed="${o.gorunum === 'liste'}" aria-label="Liste">${ik('list')}</button></div></div></div>`;
  DD.listeSonuc = (kartlar, o = {}) => `<div class="dd-liste-results"><div class="${o.gorunum === 'liste' ? 'dd-liste-rows' : 'dd-liste-grid'}">${kartlar.join('')}</div></div>`;
  DD.listeBos = (o = {}) => `<div class="dd-liste-empty"><span class="dd-liste-empty__mark">${ik(o.ikon || 'ara_')}</span><h2 class="dd-t-section">${esc(o.baslik)}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.eylem ? DD.btn(o.eylem) : ''}</div>`;
  DD.listeTema = (o = {}) => `<div class="dd-liste-themes"><div class="dd-liste-themes__inner"><div class="dd-head"><h2 class="dd-liste-themes__title">${esc(o.baslik)}</h2></div><div class="dd-liste-theme-rail">${DD.cipSerit(o)}</div></div></div>`;
  DD.sayfalama = (o = {}) => (o.toplam > 1 ? `<nav class="dd-sayfalama" aria-label="Sayfalar">${Array.from({length: o.toplam}, (_, i) => `<button class="dd-page" type="button" data-eylem="sayfa" data-id="${i + 1}" aria-label="Sayfa ${i + 1}"${o.sayfa === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : '');
  // Sıralama sheet'i: {secenekler:[[deger, ad, ikon]], secili, sec}
  DD.siralaSheet = (o = {}) => DD.sheet({baslik: o.baslik || 'Sıralama', html: `<div class="dd-choice-list" role="radiogroup" aria-label="${esc(o.etiket || o.baslik || 'Sıralama')}">${o.secenekler.map(([v, a, i]) => `<button type="button" class="dd-choice" role="radio" aria-checked="${v === o.secili}" data-sirala="${esc(v)}">${i ? `<span class="dd-choice__icon">${ik(i)}</span>` : ''}<span class="dd-choice__label">${esc(a)}</span>${ik('onay')}</button>`).join('')}</div>`, sonra: (k, h) => { k.addEventListener('click', ev => { const b = ev.target.closest('[data-sirala]'); if (b) { o.sec?.(b.dataset.sirala); h.kapat(); } }); }});
  // Filtre sheet'i: Gastro dg-sheet: seçilenler çip şeridi, tek açık akordeon, seçenek satırı, N seçenek daha, sabit iki düğme.
  DD.filtreSheet = (o = {}) => {
    const d = {}; const GORUNUR = 5;
    o.gruplar.forEach(g => { d[g.ad] = [].concat((o.secili || {})[g.ad] ?? g.secili ?? []); });
    const secenek = (g, x, i) => `<label class="dd-option"${i >= GORUNUR ? ' data-extra hidden' : ''}><span class="dd-secim"><input type="${g.tur === 'tek' ? 'radio' : 'checkbox'}" name="${esc(g.ad)}" value="${esc(x.deger)}"${d[g.ad].map(String).includes(String(x.deger)) ? ' checked' : ''}></span>${x.gorsel ? `<span class="dd-mark"><span class="dd-mark__foto"${bg(x.gorsel)}></span></span>` : x.ikon ? `<span class="dd-mark">${ik(x.ikon)}</span>` : ''}<span class="dd-option__label">${esc(x.metin ?? x.ad)}</span>${x.sayi != null ? `<span class="dd-option__count">${esc(x.sayi)}</span>` : ''}</label>`;
    const html = `<div class="dd-sheet__chips dd-kok-chip-rail" data-filtre-cipler></div><div class="dd-sheet__scroll">${o.gruplar.map((g, i) => `<section class="dd-facet${i === 0 ? ' is-open' : ''}"><h3 class="dd-facet__heading"><button type="button" class="dd-facet__head" aria-expanded="${i === 0}">${g.ikon ? `<span class="dd-facet__icon">${ik(g.ikon)}</span>` : ''}<span class="dd-facet__label">${esc(g.baslik)}</span>${ik('ac')}</button></h3><div class="dd-facet__body"><div class="dd-facet__inner">${g.ogeler.map((x, k) => secenek(g, x, k)).join('')}${g.ogeler.length > GORUNUR ? `<button type="button" class="dd-more" data-more="${g.ogeler.length - GORUNUR} seçenek daha" aria-expanded="false">${g.ogeler.length - GORUNUR} seçenek daha ${ik('ac')}</button>` : ''}</div></div></section>`).join('')}</div>`;
    return DD.sheet({baslik: o.baslik || 'Filtrele', tam: true, html, altBar: `<div class="dd-ikili">${DD.btn({metin: 'Temizle', tur: 'secondary', veri: {'filtre-temizle': 1}})}${DD.btn({metin: o.eylem || 'Sonuçları göster', veri: {'filtre-uygula': 1}})}</div>`, sonra: (k, h) => {
      const etiket = (ad, v) => { const g = o.gruplar.find(x => x.ad === ad), x = g.ogeler.find(y => String(y.deger) === String(v)); return x?.metin ?? x?.ad ?? v; };
      const cipCiz = () => { const c = k.querySelector('[data-filtre-cipler]'), l = Object.entries(d).flatMap(([a, vs]) => vs.map(v => [a, v])); c.innerHTML = l.length ? l.map(([a, v]) => lcip({metin: etiket(a, v), kapat: true, attrs: `data-kaldir="${esc(a)}" data-deger="${esc(v)}"`})).join('') : '<span class="dd-sheet__hint">Seçtiğin filtreler burada görünür</span>'; o.degisti?.(d); };
      k.addEventListener('change', ev => { const t = ev.target; if (!t.matches('input')) return; const g = t.name; if (t.type === 'radio') d[g] = [t.value]; else d[g] = t.checked ? [...d[g].filter(x => String(x) !== t.value), t.value] : d[g].filter(x => String(x) !== t.value); cipCiz(); });
      k.addEventListener('click', ev => {
        const f = ev.target.closest('.dd-facet__head');
        if (f) { const s = f.closest('.dd-facet'), on = !s.classList.contains('is-open'); k.querySelectorAll('.dd-facet').forEach(x => { const a = x === s && on; x.classList.toggle('is-open', a); x.querySelector('.dd-facet__head').setAttribute('aria-expanded', a); }); return; }
        const m = ev.target.closest('.dd-more');
        if (m) { const on = m.getAttribute('aria-expanded') !== 'true'; m.setAttribute('aria-expanded', on); m.parentElement.querySelectorAll('[data-extra]').forEach(x => { x.hidden = !on; }); m.innerHTML = `${on ? 'Daha az göster' : m.dataset.more} ${ik(on ? 'chevron-up' : 'ac')}`; return; }
        const r = ev.target.closest('[data-kaldir]');
        if (r) { const a = r.dataset.kaldir, v = r.dataset.deger; d[a] = d[a].filter(x => String(x) !== v); const i = k.querySelector(`input[name="${CSS.escape(a)}"][value="${CSS.escape(v)}"]`); if (i) i.checked = false; cipCiz(); return; }
        if (ev.target.closest('[data-filtre-temizle]')) { Object.keys(d).forEach(x => { d[x] = []; }); k.querySelectorAll('input:checked').forEach(i => { i.checked = false; }); cipCiz(); }
        if (ev.target.closest('[data-filtre-uygula]')) { o.uygula?.(d); h.kapat(); }
      });
      cipCiz();
    }});
  };

  // ---------- detay-v2 ----------
  // Detay başlığı + panel: {gorsel, etiket, baslik, alt, caps:[{ikon, metin}], bas (html, sekmeden önce), sekmeler (DD.detaySekmeler), kuyruk (html)}
  DD.detay = (o = {}) => `<section class="dd-banner is-kart is-detay" data-c="kalip" data-kalip="detay"><div class="dd-banner-foto"${bg(o.gorsel)}></div><span class="dd-banner-golge" aria-hidden="true"></span><div class="dd-banner-metin">${o.etiket ? `<span class="dd-t-label">${esc(o.etiket)}</span>` : ''}<h1 class="dd-t-display">${esc(o.baslik)}</h1>${o.alt ? `<p>${esc(o.alt)}</p>` : ''}${o.caps?.length ? `<div class="dd-caps">${o.caps.map(c => `<span class="dd-cap">${c.ikon ? ik(c.ikon) : ''}<span>${esc(c.metin)}</span></span>`).join('')}</div>` : ''}</div></section><div class="dd-panel dd-detay-panel">${o.bas ? `<div class="dd-detay-bas">${o.bas}</div>` : ''}${o.sekmeler || ''}${o.govde || o.kuyruk ? `<div class="dd-detay-icerik">${o.govde || ''}${o.kuyruk ? `<div class="dd-kuyruk">${o.kuyruk}</div>` : ''}</div>` : ''}</div>`;
  // Özet şeridi: [{ikon, etiket, deger, birim}]
  DD.ozetSerit = l => `<section class="dd-facts"><dl style="--n:${l.length}">${l.map(x => `<div><dt>${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.etiket)}</span></dt><dd>${esc(x.deger)}${x.birim ? `<small>${esc(x.birim)}</small>` : ''}</dd>${x.alt ? `<dd class="dd-facts-alt">${esc(x.alt)}</dd>` : ''}</div>`).join('')}</dl></section>`;
  // Özellik satırı: {on:[{ikon,metin}], etiket:'Özellikler', ogeler:[{ikon,metin}]}
  DD.ozellikSerit = (o = {}) => { const c = x => `<span class="dd-ozellik">${x.ikon ? ik(x.ikon) : ''}<span>${esc(x.metin)}</span></span>`; return `<section class="dd-ozellikler"><div class="dd-ozellik-rail" tabindex="0">${(o.on || []).map(c).join('')}${o.ogeler?.length ? `${o.etiket === false ? '' : `<span class="dd-ozellik-etiket">${esc(o.etiket || 'Özellikler')}</span>`}${o.ogeler.map(c).join('')}` : ''}</div></section>`; };
  // Açıklama: 3 satır + fade + Devamını oku. {metin, satir}
  DD.aciklama = (o = {}) => `<div class="dd-aciklama" data-c="kalip" data-kalip="aciklama" data-satir="${o.satir || 3}"><p class="dd-aciklama-metin">${vurgu(o.metin)}</p><button type="button" class="dd-devam" aria-expanded="false" hidden><span>Devamını oku</span>${ik('ac')}</button></div>`;
  // Yapışkan sekme + paneller: {ad, ogeler:[{ad, deger, sayi, html}], secili, kaydir}
  DD.detaySekmeler = (o = {}) => { const sec = o.secili ?? o.ogeler[0]?.deger; return `<div class="dd-sekme-kap" data-sekme-kap="${esc(o.ad || 'sekme')}"><div class="dd-sekme-bar">${DD.segment({...o, secili: sec, ogeler: o.ogeler.map(({html, ...x}) => x)})}</div><div class="dd-detay-icerik">${o.ogeler.map(x => `<div class="dd-pane" role="tabpanel" data-pane="${esc(x.deger)}"${x.deger === sec ? '' : ' hidden'}>${x.html || ''}</div>`).join('')}</div></div>`; };
  // Bilgi kartı şeridi: [{ikon, baslik, metin, veri}]
  DD.bilgiSerit = l => `<div class="dd-bilgi-rail">${l.map(c => `<button type="button" class="dd-bilgi-kart"${at(c)}><span class="dd-bilgi-bas">${DD.ikonKutu({ikon: c.ikon, boyut: 'md'})}<span class="dd-bilgi-baslik">${esc(c.baslik)}</span></span><span class="dd-bilgi-govde">${vurgu(c.metin)}</span></button>`).join('')}</div>`;
  DD.kunye = l => `<ul class="dd-kunye">${l.map(x => `<li>${ik(x.ikon)}<span>${esc(x.etiket)}</span><b>${esc(x.deger)}</b></li>`).join('')}</ul>`;

  // ---------- Açılış ve karşılama (Gastro acilis.css .ac-s2, .ac-k3) ----------
  const LOGO = 'assets/marka/dadadiet-beyaz.svg';
  // Eğik üç sütun kolaj; dokunuş data-eylem="gec". Az görsel verilirse sütunları dolduracak kadar yinelenir.
  DD.acilis = (o = {}) => {
    const G = o.gorseller || [], K = G.length ? Array.from({length: 15}, (_, i) => G[i % G.length]) : [];
    const sutun = k => `<div class="dd-ac-sutun">${K.map((g, i) => (i % 3 === k ? `<div class="dd-ac-karo"${bg(g)} data-i="${i % 5}"></div>` : '')).join('')}</div>`;
    return `<div class="dd-ac" data-c="kalip" data-kalip="acilis"><div class="dd-ac-kolaj" aria-hidden="true">${sutun(0)}${sutun(1)}${sutun(2)}</div><div class="dd-ac-perde"></div><div class="dd-ac-isik" aria-hidden="true"></div><div class="dd-ac-orta"><img class="dd-ac-logo" src="${esc(o.logo || LOGO)}" alt="Dada Diet"></div><span class="dd-ac-hilal" aria-hidden="true"></span><button class="dd-ac-dokun" type="button" data-eylem="gec" aria-label="Geç"></button></div>`;
  };
  // Çıkış: kolaj düzleşip dağılır, sonra fn. Bir kez çalışır; dokunuş ve zamanlayıcı birlikte çağırabilir.
  DD.acilisCik = (kok, fn) => { const e = kok.querySelector('.dd-ac'); if (!e || e.dataset.cikti) return; e.dataset.cikti = 1; if (DD.azHareket()) { fn?.(); return; } e.classList.add('is-cikis'); setTimeout(() => fn?.(), M.base); };
  // Gülücük kapak kalan yüksekliği doldurur: logo üstte, başlık ve metin altta, html beyaz alanda. Alt düğmeler altBar'dadır.
  DD.karsilamaKabuk = (o = {}) => `<div class="dd-ac-k3">${DD.gulucuk({gorsel: o.gorsel, sinif: 'dd-ac-kapak', icerik: `<img class="dd-ac-logo" src="${esc(o.logo || LOGO)}" alt="Dada Diet"><div class="dd-ac-metin" data-dd-veil-from><h1 class="dd-t-display">${esc(o.baslik)}</h1>${o.metin ? `<p class="dd-t-body">${vurgu(o.metin)}</p>` : ''}</div>`})}${o.html ? `<div class="dd-ac-alt">${o.html}</div>` : ''}</div>`;

  // ---------- Davranış ----------
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('.dd-devam'); if (!b) return;
    const k = b.closest('.dd-aciklama'), m = k.querySelector('.dd-aciklama-metin'), on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on); b.querySelector('span').textContent = on ? 'Daha az göster' : 'Devamını oku';
    k.classList.toggle('is-kirpik', !on); k.style.setProperty('--dd-aciklama-kapali', on ? `${m.scrollHeight}px` : k.dataset.kapali);
  });
  document.addEventListener('dd-degisim', ev => { const k = ev.target.closest?.('[data-sekme-kap]'); if (!k || ev.detail.ad !== k.dataset.sekmeKap) return; k.querySelectorAll(':scope>.dd-detay-icerik>.dd-pane').forEach(p => { p.hidden = p.dataset.pane !== String(ev.detail.deger); }); });
  const heroBoya = h => { if (!window.DDCard) return; const top = h.getBoundingClientRect().top, H = h.clientHeight; if (!H) return; const ust = h.querySelector('.dd-hero-ara,.dd-hero-top p') || h.querySelector('.dd-hero-top h1'), orta = h.querySelector('.dd-hero-orta'), A = TK.overlay; if (orta) { const r = orta.getBoundingClientRect(); h.style.setProperty('--dd-hero-odak-y', `${Math.round(r.top + r.height / 2 - top)}px`); } const metin = [...h.querySelectorAll('.dd-hero-slide:not([data-klon]) .dd-hero-copy')].map(c => DDCard.textTop(c) - top), tt = metin.length ? Math.min(...metin) : H, len = ust ? ust.getBoundingClientRect().bottom - top : TK.size.header + TK.space[48]; h.style.setProperty('--dd-sahne-perde', DDCard.gradient(H, y => DDCard.heroAlfa(y, H, len, tt), [len, len + A.heroTop.fadeLength, tt - A.heroBottom.leadAboveFirstText, tt])); };
  const heroKur = h => {
    const tr = h.querySelector('.dd-hero-track'), n = tr.querySelectorAll('.dd-hero-slide:not([data-klon])').length, dots = [...h.querySelectorAll('.dd-pager-dots i')];
    const pos = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
    tr.addEventListener('scroll', () => { const i = pos() % n; dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); }, {passive: true});
    heroBoya(h);
    if (n > 1 && !DD.azHareket()) { let z = setInterval(() => { if (!h.isConnected) { clearInterval(z); return; } if (h.closest('.is-gizli') || document.hidden) return; const s = pos() + 1; tr.scrollTo({left: s * tr.clientWidth, behavior: 'smooth'}); if (s >= n) setTimeout(() => { tr.scrollTo({left: 0, behavior: 'auto'}); }, M.reveal * 2); }, M.heroAutoplay); tr.addEventListener('pointerdown', () => { clearInterval(z); }, {once: true}); }
  };
  const sliderKur = s => { const tr = s.querySelector('.dd-kslider__track'), pg = s.querySelector('.dd-kslider__pager'), dots = [...pg.querySelectorAll('i')]; s.style.setProperty('--dd-pager-room', `calc(${pg.getBoundingClientRect().width}px + var(--dd-s-12))`); tr.addEventListener('scroll', () => { const w = tr.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(tr).columnGap) || 0), i = Math.max(0, Math.min(dots.length - 1, Math.round(tr.scrollLeft / w))); dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); }, {passive: true}); };
  // Detay yükseklik: blok + alt boşluk + header + 152, en az 320 (Gastro sizeHero); perde üst ve alt kenar eğrisi.
  const detayKur = h => { const c = h.querySelector('.dd-banner-metin'), e = c.firstElementChild, y = Math.round(Math.max(TK.size.banner, c.offsetHeight + TK.spaceAlias.panelOverlap + TK.space[24] + TK.size.header + TK.space[48] * 3 + TK.space[8])); h.style.height = `${y}px`; requestAnimationFrame(() => { const t = DDCard.tokens(), tt = e.getBoundingClientRect().top - h.getBoundingClientRect().top, len = TK.size.header + TK.space[48]; h.dataset.perde = 1; h.style.setProperty('--dd-veil', DDCard.gradient(y, v => Math.max(DDCard.edgeTop(v, len, t), DDCard.edgeBottom(v, tt, t)), [len, tt - t.lead, tt + t.tail])); }); };
  const aciklamaKur = k => { const m = k.querySelector('.dd-aciklama-metin'), lh = parseFloat(getComputedStyle(m).lineHeight) || TK.typography.body.size * TK.typography.body.line, kapali = `${Math.round(lh * +k.dataset.satir)}px`; if (m.scrollHeight > lh * +k.dataset.satir + 2) { k.dataset.kapali = kapali; k.style.setProperty('--dd-aciklama-kapali', kapali); k.classList.add('is-kirpik'); k.querySelector('.dd-devam').hidden = false; } };
  const smoother = t => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (6 * t - 15) + 10); };
  // Perde logo çevresinde sabit, alt kenara doğru koyulaşır (Gastro acilis.js boya).
  const acilisKur = e => {
    e.querySelectorAll('.dd-ac-karo').forEach(k => k.style.setProperty('--i', k.dataset.i));
    const p = e.querySelector('.dd-ac-perde'), l = e.querySelector('.dd-ac-logo');
    const boya = () => { const h = p.offsetHeight; if (!h) return; const t = p.getBoundingClientRect().top, r = l.getBoundingClientRect(), s = TK.space[48], d = [[0, .35], [Math.max(h * .32, TK.space[64]), .3], [r.top - t - s, .55], [r.bottom - t + s, .55], [h - s * 2, .8], [h, .9]].sort((a, b) => a[0] - b[0]); p.style.backgroundImage = DDCard.gradient(h, y => { for (let i = 1; i < d.length; i++) { const [y0, a0] = d[i - 1], [y1, a1] = d[i]; if (y <= y1) return a0 + (a1 - a0) * smoother((y - y0) / Math.max(1, y1 - y0)); } return d.at(-1)[1]; }); };
    boya(); l.addEventListener('load', boya); new ResizeObserver(boya).observe(p);
  };
  DD._kalipKur = el => ({hero: heroKur, slider: sliderKur, detay: detayKur, aciklama: aciklamaKur, acilis: acilisKur}[el.dataset.kalip]?.(el));
  // Ekran kaydırması: sahne daralması, foto parallax, yapışan panel başı ve sekme, panel altına giren satırın gizlenmesi.
  DD._kalipKaydir = (g, k, bar) => {
    const y = k.scrollTop, r0 = k.getBoundingClientRect().top, H = bar ? bar.offsetHeight : 0, h = g.el.querySelector('.dd-hero');
    if (h && !DD.azHareket()) { const s = M.sahne, a = Math.min(y, s.limit); h.style.setProperty('--dd-scene-collapse', `${Math.min(a * s.daralma, s.enFazla)}px`); h.querySelectorAll('.dd-hero-foto').forEach(p => { p.style.transform = `translateY(${a * s.kayma}px) scale(${1 - a * s.kucul})`; }); }
    const arac = g.el.querySelector('.dd-liste-arac');
    if (arac) { const st = arac.getBoundingClientRect().top - r0 <= H + .5; arac.classList.toggle('is-stuck', st); const alt = arac.getBoundingClientRect().bottom; g.el.querySelectorAll('.dd-liste-themes__title,.dd-liste-theme-rail,.dd-liste-status').forEach(e => e.classList.toggle('dd-liste-occluded', st && e.getBoundingClientRect().top < alt)); }
    g.el.querySelectorAll('.dd-sekme-bar').forEach(b => b.classList.toggle('is-stuck', b.getBoundingClientRect().top - r0 <= H + .5));
  };
  // Seçim alanı (DD.secAlan): dokununca tek seçimli sheet açar, gizli input'u doldurur ve dd-degisim atar.
  document.addEventListener('click', ev => {
    const b = ev.target.closest?.('[data-sec-alan]'); if (!b) return;
    const alan = b.closest('.dd-alan'), girdi = alan.querySelector('input[type="hidden"]'), sec = JSON.parse(b.dataset.secenekler || '[]');
    DD.siralaSheet({baslik: alan.querySelector('label')?.textContent || 'Seç', secenekler: sec.map(([d, m]) => [String(d), m]), secili: girdi.value, sec: v => {
      const m = sec.find(([d]) => String(d) === v); girdi.value = v;
      const sp = b.querySelector('span'); sp.textContent = m ? m[1] : b.dataset.yer; sp.classList.toggle('is-yer', !m);
      DD.degisim(b, b.dataset.secAlan, v);
    }});
  });
})();
