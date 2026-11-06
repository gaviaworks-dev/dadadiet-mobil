/* ORTAK TAKVİM (yalnız ana ajan yazar; Beyar V4 EK 6, 13 Ekim). Tek takvim bileşeni — uygulamada tarih seçilen ya da takvim gösterilen her yer
   bunu kullanır; tarayıcının date input'u ya da sayfaya özel takvim yok. Türetildiği aile: ortak segment (.dd-seg: ay/hafta), ikon düğmesi
   (.dd-ibtn: geçiş), çip (.dd-chip: hızlı seçim), sheet (DG.sheet + ayak .dd-ikili), girdi kutusu (.dd-girdi: tarih alanı), durum rozeti
   tonları (noktalar). Kanon: Gilroy, token renkleri, kontrol radius'u, 44 dokunma hedefi; Türkçe ay/gün adları, Pazartesi başlangıç.
   Flutter: table_calendar ile birebir (eşleme docs/57 §3).
   API (window.DDTakvim):
   · html(o) — işaretleme. o = {odak:'YYYY-MM-DD' (görünen ay/hafta), gorunum:'ay'|'hafta', mod:'tek'|'aralik', secili, aralik:[bas, son],
     noktalar:{iso: ['uyari','gecti',…]}, min, max, kapali:[iso] | (iso) => bool, bugun, gorunumSec (ay/hafta segmenti), baslik (başlık metni yerine), panel:'gun'|'ay', gecis (false = geçiş okları yok: tarihsiz haftalık şablon), yukleniyor (aria-busy, etkileşimsiz)}
   · kur(el, o, {sec}) — etkileşimli takvim (geçiş, görünüm, ay/yıl paneli, gün/aralık seçimi); sec(deger, o) her seçimde.
   · sec(o) → Promise<iso | [bas, son] | null> — bottom sheet tarih seçici (hızlı seçim çipleri o.hizli = [['3 gün', 3], …] (negatif = geçmişe dönük; aralık her zaman sıralı); Vazgeç / Seç).
   · alan({ad, etiket, deger, zorunlu, yer, hizli, min, max, mod, hata, yardim}) — form alanı (gizli input + tarih düğmesi; tıklayınca sheet).
   · uzun(iso) / kisa(iso) — “15 Ekim 2026, Perşembe” / “15 Eki”. */
(() => {
  if (window.DDTakvim) return;
  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GUN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], GUNU = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const fa = n => `<i class="icon fa-solid fa-${n}" aria-hidden="true"></i>`;
  const iki = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`;
  const tarih = s => new Date(s + 'T12:00:00');
  const ekle = (s, n) => { const d = tarih(s); d.setDate(d.getDate() + n); return iso(d); };
  const ayEkle = (s, n) => { const d = tarih(s); d.setDate(1); d.setMonth(d.getMonth() + n); return iso(d); };
  const haftaGunu = s => (tarih(s).getDay() + 6) % 7;   // Pazartesi = 0
  const bugunIso = () => window.DD?.bugunIso?.() || iso(new Date());
  const uzun = s => { if (!s) return ''; const d = tarih(s); return `${d.getDate()} ${AY[d.getMonth()]} ${d.getFullYear()}, ${GUNU[haftaGunu(s)]}`; };
  const kisa = s => { if (!s) return ''; const d = tarih(s); return `${d.getDate()} ${AY[d.getMonth()].slice(0, 3)}`; };
  const kapaliMi = (o, s) => (o.min && s < o.min) || (o.max && s > o.max) || (typeof o.kapali === 'function' ? o.kapali(s) : (o.kapali || []).includes(s));
  function html(o) {
    const bugun = o.bugun || bugunIso(), odak = o.odak || o.secili || o.aralik?.[0] || bugun, d = tarih(odak), hafta = o.gorunum === 'hafta';
    const [ab, as] = o.aralik || [];
    let bas, n, baslik;
    if (hafta) { bas = ekle(odak, -haftaGunu(odak)); n = 7; const son = ekle(bas, 6), b1 = tarih(bas), b2 = tarih(son); baslik = b1.getMonth() === b2.getMonth() ? `${b1.getDate()}–${b2.getDate()} ${AY[b2.getMonth()]} ${b2.getFullYear()}` : `${b1.getDate()} ${AY[b1.getMonth()].slice(0, 3)} – ${b2.getDate()} ${AY[b2.getMonth()].slice(0, 3)} ${b2.getFullYear()}`; }
    else { const ilk = `${d.getFullYear()}-${iki(d.getMonth() + 1)}-01`; bas = ekle(ilk, -haftaGunu(ilk)); const gunSay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); n = Math.ceil((haftaGunu(ilk) + gunSay) / 7) * 7; baslik = `${AY[d.getMonth()]} ${d.getFullYear()}`; }
    if (o.baslik) baslik = o.baslik;
    const gun = s => {
      const g = tarih(s), cls = ['dd-tk-gun'], disari = !hafta && g.getMonth() !== d.getMonth(), kap = kapaliMi(o, s), nok = (o.noktalar || {})[s] || [];
      if (s === bugun) cls.push('is-bugun'); if (disari) cls.push('is-disari'); if (kap) cls.push('is-kapali');
      const sec = o.mod === 'aralik' ? (s === ab || s === as) : s === o.secili;
      if (sec) cls.push('is-secili');
      if (o.mod === 'aralik' && ab && as && s > ab && s < as) cls.push('is-aralik');
      if (o.mod === 'aralik' && ab && as && s === ab && ab !== as) cls.push('is-bas'); if (o.mod === 'aralik' && ab && as && s === as && ab !== as) cls.push('is-son');
      const etiket = `${uzun(s)}${s === bugun ? ', bugün' : ''}${nok.length ? `, ${nok.length} kayıt` : ''}${kap ? ', seçilemez' : ''}`;
      return `<button type="button" role="gridcell" class="${cls.join(' ')}" data-tk-gun="${s}" aria-label="${esc(etiket)}" aria-selected="${sec || cls.includes('is-aralik')}"${kap ? ' aria-disabled="true" tabindex="-1"' : ''}>${o.halkalar?.[s] != null ? DD.halkaMini({oran: o.halkalar[s], boyut: 'tk'}) : ''}<span class="dd-tk-sayi">${g.getDate()}${nok.length ? `<span class="dd-tk-noktalar" aria-hidden="true">${nok.slice(0, 3).map(t => `<i class="is-${esc(t)}"></i>`).join('')}</span>` : ''}</span></button>`;
    };
    const satirlar = []; for (let i = 0; i < n; i += 7) satirlar.push(`<div class="dd-tk-satir" role="row">${Array.from({length: 7}, (_, j) => gun(ekle(bas, i + j))).join('')}</div>`);
    const seg = o.gorunumSec ? `<div class="dd-seg dd-tk-gorunum" role="tablist" aria-label="Takvim görünümü">${[['ay', 'Ay'], ['hafta', 'Hafta']].map(([k, m]) => `<button type="button" role="tab" data-tk-gorunum="${k}" aria-selected="${(o.gorunum || 'ay') === k}">${m}</button>`).join('')}</div>` : '';
    const ayPanel = o.panel === 'ay' ? `<div class="dd-tk-aylar" role="grid" aria-label="${d.getFullYear()} ayları">${AY.map((a, i) => `<button type="button" class="dd-tk-ay${i === d.getMonth() ? ' is-secili' : ''}" data-tk-ay="${d.getFullYear()}-${iki(i + 1)}-01" aria-pressed="${i === d.getMonth()}">${a.slice(0, 3)}</button>`).join('')}</div>` : '';
    const navEt = o.panel === 'ay' ? ['Önceki yıl', 'Sonraki yıl'] : hafta ? ['Önceki hafta', 'Sonraki hafta'] : ['Önceki ay', 'Sonraki ay'];
    const ok = y => o.gecis === false ? '' : `<button type="button" class="dd-ibtn" data-tk-git="${y}" aria-label="${navEt[y < 0 ? 0 : 1]}">${fa(y < 0 ? 'chevron-left' : 'chevron-right')}</button>`;
    return `<div class="dd-takvim${hafta ? ' is-hafta' : ''}${o.gecis === false ? ' is-sabit' : ''}${o.yukleniyor ? ' is-yukleniyor' : ''}" data-takvim${o.yukleniyor ? ' aria-busy="true"' : ''}>${seg}<div class="dd-tk-bas">${ok(-1)}<button type="button" class="dd-tk-baslik" data-tk-baslik aria-live="polite" aria-expanded="${o.panel === 'ay'}" aria-label="${esc(o.panel === 'ay' ? `${d.getFullYear()} — ay seç` : `${baslik} — ay ve yıl seç`)}"><span>${esc(o.panel === 'ay' ? String(d.getFullYear()) : baslik)}</span>${fa(o.panel === 'ay' ? 'chevron-up' : 'chevron-down')}</button>${ok(1)}</div>${ayPanel || `<div class="dd-tk-gunadlari" aria-hidden="true">${GUN.map(g => `<span>${g}</span>`).join('')}</div><div class="dd-tk-izgara" role="grid" aria-label="${esc(baslik)}">${satirlar.join('')}</div>`}</div>`;
  }
  function kur(el, o, {sec} = {}) {
    o = {mod: 'tek', gorunum: 'ay', panel: 'gun', ...o}; if (!o.odak) o.odak = o.secili || o.aralik?.[0] || o.bugun || bugunIso();
    const ciz = () => { el.innerHTML = html(o); };
    el.addEventListener('click', e => {
      const t = e.target;
      const git = t.closest('[data-tk-git]'); if (git) { const y = +git.dataset.tkGit; o.odak = o.panel === 'ay' ? ayEkle(o.odak, 12 * y) : o.gorunum === 'hafta' ? ekle(o.odak, 7 * y) : ayEkle(o.odak, y); ciz(); el.querySelector(`[data-tk-git="${y}"]`)?.focus(); return; }
      const gr = t.closest('[data-tk-gorunum]'); if (gr) { o.gorunum = gr.dataset.tkGorunum; o.panel = 'gun'; ciz(); el.querySelector(`[data-tk-gorunum="${o.gorunum}"]`)?.focus(); return; }
      if (t.closest('[data-tk-baslik]')) { if (o.gecis === false) return; o.panel = o.panel === 'ay' ? 'gun' : 'ay'; ciz(); el.querySelector('[data-tk-baslik]')?.focus(); return; }
      const ay = t.closest('[data-tk-ay]'); if (ay) { o.odak = ay.dataset.tkAy; o.panel = 'gun'; ciz(); el.querySelector('[data-tk-baslik]')?.focus(); return; }
      const g = t.closest('[data-tk-gun]'); if (!g || g.getAttribute('aria-disabled') === 'true') return;
      const s = g.dataset.tkGun;
      if (o.mod === 'aralik') { const [a, b] = o.aralik || []; o.aralik = !a || b ? [s, null] : s < a ? [s, a] : [a, s]; if (o.aralik[1] === null) o.aralik = [s, null]; }
      else o.secili = s;
      if (o.gorunum === 'ay' && tarih(s).getMonth() !== tarih(o.odak).getMonth()) o.odak = s;
      ciz(); el.querySelector(`[data-tk-gun="${s}"]`)?.focus();
      sec?.(o.mod === 'aralik' ? o.aralik : o.secili, o);
    });
    ciz(); return {o, ciz, ayarla: x => { Object.assign(o, x); ciz(); }};
  }
  // Bottom sheet tarih seçici (ortak DG.sheet): üstte hızlı seçim çipleri (bugünden itibaren), takvim, altta Vazgeç / Seç (ikili).
  function sec(o = {}) {
    return new Promise(son => {
      const bugun = o.bugun || bugunIso(), hiz = o.hizli || [];
      const cip = ([m, n]) => `<button type="button" class="dd-chip" data-tk-hizli="${n}" aria-pressed="false">${esc(m)}</button>`;
      const govde = `<div class="dd-yigin dd-tk-sec">${hiz.length ? `<div class="dd-serit dd-tk-hizli" role="group" aria-label="Hızlı seçim">${hiz.map(cip).join('')}</div>` : ''}<div data-tk-yer></div><p class="dd-yardim dd-tk-ozet" aria-live="polite"></p></div>`;
      const d = DD.sheet({baslik: o.baslik || 'Tarih seç', html: govde, altBar: `<div class="dd-ikili">${DD.btn({metin: 'Vazgeç', tur: 'secondary', attrs: 'data-tk-vazgec'})}${DD.btn({metin: 'Seç', attrs: 'data-tk-tamam'})}</div>`, sinif: 'dd-tk-sheet'});
      let deger = o.mod === 'aralik' ? o.aralik || null : o.secili || null, bitti = false;
      const ozet = () => { const p = d.querySelector('.dd-tk-ozet'); p.textContent = o.mod === 'aralik' ? (deger?.[0] ? `${uzun(deger[0])}${deger[1] ? ' – ' + uzun(deger[1]) : ' — bitiş gününü seç'}` : 'Başlangıç gününü seç') : (deger ? uzun(deger) : 'Bir gün seç'); d.querySelector('[data-tk-tamam]').disabled = o.mod === 'aralik' ? !(deger?.[0] && deger?.[1]) : !deger; };
      const T = kur(d.querySelector('[data-tk-yer]'), {...o, baslik: undefined, bugun}, /* o.baslik = sheet başlığı; takvim başlığı ay adı kalır */ {sec: v => { deger = v; d.querySelectorAll('[data-tk-hizli]').forEach(c => c.setAttribute('aria-pressed', 'false')); ozet(); }});
      d.addEventListener('click', e => {
        const h = e.target.closest('[data-tk-hizli]');
        if (h) { const s2 = ekle(bugun, +h.dataset.tkHizli); deger = o.mod === 'aralik' ? [bugun, s2].sort() : s2; /* geçmişe dönük çip (negatif gün) de sıralı aralık */ T.ayarla(o.mod === 'aralik' ? {aralik: deger, odak: s2} : {secili: s2, odak: s2}); d.querySelectorAll('[data-tk-hizli]').forEach(c => c.setAttribute('aria-pressed', String(c === h))); ozet(); return; }
        if (e.target.closest('[data-tk-vazgec]')) { bitti = true; d.kapat(); son(null); return; }
        if (e.target.closest('[data-tk-tamam]')) { bitti = true; d.kapat(); son(deger); }
      });
      d.addEventListener('close', () => { if (!bitti) son(null); });
      ozet();
    });
  }
  // Form alanı: tarayıcının date input'u yerine. Gizli input (form uyumlu: name=ad, değer ISO) + ortak girdi kutusu görünümünde düğme.
  const alan = ({ad, etiket, deger = '', zorunlu, yer = 'Tarih seç', hizli, min, max, mod, hata, yardim, baslik, devreDisi}) => `<div class="dd-alan${hata ? ' is-hata' : ''}"><label for="f-${esc(ad)}">${esc(etiket)}${zorunlu ? ' *' : ''}</label><button type="button" class="dd-girdi dd-tk-alan" id="f-${esc(ad)}" data-takvim-alan="${esc(ad)}" aria-haspopup="dialog"${devreDisi ? ' disabled' : ''}${hizli ? ` data-hizli="${esc(JSON.stringify(hizli))}"` : ''}${min ? ` data-min="${min}"` : ''}${max ? ` data-max="${max}"` : ''}${mod ? ` data-mod="${mod}"` : ''} data-baslik="${esc(baslik || etiket)}">${fa('calendar')}<span class="dd-tk-deger${deger ? '' : ' is-bos'}">${esc(deger ? uzun(deger) : yer)}</span>${fa('chevron-down')}</button><input type="hidden" name="${esc(ad)}" value="${esc(deger)}"${zorunlu ? ' required data-zorunlu' : ''}>${hata ? `<p class="dd-hata">${fa('triangle-exclamation')}${esc(hata)}</p>` : ''}${yardim ? `<p class="dd-yardim">${esc(yardim)}</p>` : ''}</div>`;
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-takvim-alan]'); if (!b) return; e.preventDefault();
    const inp = b.parentElement.querySelector(`input[type=hidden][name="${CSS.escape(b.dataset.takvimAlan)}"]`), v = inp?.value || '';
    const r = await sec({baslik: b.dataset.baslik, secili: v || undefined, odak: v || b.dataset.min || undefined, hizli: b.dataset.hizli ? JSON.parse(b.dataset.hizli) : [], min: b.dataset.min, max: b.dataset.max, mod: b.dataset.mod || 'tek'});
    if (r == null || !inp) return b.focus();
    inp.value = Array.isArray(r) ? r.join('/') : r; const sp = b.querySelector('.dd-tk-deger'); sp.textContent = Array.isArray(r) ? `${kisa(r[0])} – ${kisa(r[1])}` : uzun(r); sp.classList.remove('is-bos');
    inp.dispatchEvent(new Event('input', {bubbles: true})); inp.dispatchEvent(new Event('change', {bubbles: true})); b.focus();
  });
  window.DDTakvim = {html, kur, sec, alan, uzun, kisa, ekle, ayEkle, iso, AY, GUN};
})();
