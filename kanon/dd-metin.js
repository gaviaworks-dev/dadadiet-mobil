/* METİN KANONU — Türkçe heceleme (Beyar, 13 Ekim: “Bütün metinler justify, istisna yok; boşluk heceleme ve aralık ayarıyla çözülür.”).
   Ölçüldü: Chromium ve WebKit'te `hyphens:auto` Türkçe sözcükleri BÖLMÜYOR (İngilizceyi bölüyor); satır sonunda bölünmeyen uzun sözcük
   iki yana yaslı satırda büyük kelime boşluğu açıyor. Bu dosya görünen metne Türkçe hece kurallarıyla yumuşak tire (U+00AD) ekler;
   tarayıcı yalnız gerektiğinde satır sonunda böler ve tireyi gösterir, aksi hâlde görünmez. Justify kuralı dd-metin.css'tedir.
   Hece kuralı (Türkçe yazım): iki ünlü arasında ünsüz yoksa ünlüler arasından, bir ünsüz varsa ünsüzden önce, iki ünsüz varsa
   aralarından, üç ve daha fazlaysa son ünsüzden önce bölünür. Sözcük başında ve sonunda en az 2 harf kalır; 5 harften kısa sözcük,
   rakam/@/nokta içeren parça (adres, ölçü) bölünmez; 20px ve üstü metinde en az 6 harf ve parçalar 3/3. Başlık, ad, etiket ve buton hecelenmez (dd-metin.css başlık kümesi). Girdi, düzenlenen metin, kod ve [data-dd-hece="yok"] içi atlanır.
   Sayfa ya da içerik değişince yeni metin işlenir. Kök ekranlar dd-baglanti.js üzerinden, uygulama sayfaları üreticiden yükler.
   Kutu genişliği daraltılmaz (Beyar, 13 Ekim revize eki: daraltılmış blok sütunun sağ kenarına ulaşmaz, ekranda sola dayalı görünür);
   2+ satırlı her blokta son satır dışındaki satırlar sütunun iki kenarına dayanır. */
(() => {
  if (window.DDMetin) return;
  const UNLU = /[aeıioöuüâîûAEIİOÖUÜÂÎÛ]/, HARF = /^[a-zçğıöşüâîûA-ZÇĞIİÖŞÜÂÎÛ]+$/;
  const SHY = '­';
  // Sınırlar (hyphenate-limit-chars karşılığı): gövdede en az 5 harf, parçalar 2/2; büyük başlıkta (20px+) en az 6 harf, parçalar 3/3.
  function hecele(s, {en = 5, bas = 2, son = 2} = {}) {
    if (s.length < en || !HARF.test(s)) return s;
    const u = [...s].map(c => UNLU.test(c)), yer = [];
    let once = -1;
    for (let i = 0; i < s.length; i++) {
      if (!u[i]) continue;
      if (once >= 0) { const k = i - once - 1; yer.push(k <= 1 ? once + 1 : k === 2 ? once + 2 : i - 1); }
      once = i;
    }
    const iyi = yer.filter(b => b >= bas && s.length - b >= son);
    if (!iyi.length) return s;
    let o = '', p = 0; for (const b of iyi) { o += s.slice(p, b) + SHY; p = b; } return o + s.slice(p);
  }
  const KELIME = /[A-Za-zÇĞIİÖŞÜÂÎÛçğıöşüâîû]{5,}/g;
  const BASLIK = {en: 6, bas: 3, son: 3};
  const metinHecele = (t, o) => t.replace(KELIME, (w, i) => /[\d@\/_]/.test(t[i - 1] || '') || /[\d@\/_]/.test(t[i + w.length] || '') || (t[i - 1] === '.' && /\w/.test(t[i - 2] || '')) ? w : hecele(w, o));
  // Büyük başlık (20px ve üstü: bölüm, sayfa, hero) de hecelenir (Beyar EK 13 Ekim: justify boşluğu açılmasın) ama kısa parça bırakmadan:
  // en az 6 harfli sözcük, satır sonunda ve başında en az 3 harf (hyphenate-limit-chars: 6 3 3).
  const BUYUK = 20;
  // Başlık kümesi hizalanmaz ve hecelenmez (dd-metin.css). Paragraf dışındaki kalın metin de ad ya da başlıktır; paragraf içi vurgu hecelenir.
  const BASLIK_KUME = 'h1,h2,h3,h4,h5,h6,dt,th,legend,label,summary,[class*=title],[class*=baslik]:not(.dd-baslik):not([class*=baslik-]),[class*=__name],[class*=-name],.dd-t-page,.dd-t-section,.dd-t-sub,.dd-t-card,.dd-t-featured,.dd-t-display,.dd-t-label,.dd-t-sheet,.dd-t-stat,.dd-btn,.dd-kok-chip,.dd-chip,.dd-hbtn,.dd-seg,.dd-balon,.dd-durum>p,.dd-sahne-metin>p,.dd-liste-empty>p,.dd-rozet-detay>p,.dd-profil-kimlik>p,.review-empty>p,.dd-izin-metin,.dd-orta-metin,.dd-kamera-yonerge';
  const PARAGRAF = 'p,blockquote,.dd-metin,[class*=govde],[class*=aciklama]';
  // Kısa mutfak etiketi (bayrakla birlikte millet adı: “Türk”, “Amerikan” — Beyar V4 A3): hecelenmez, tek satır + “…” (dd-metin.css).
  const MUTFAK = '.dd-bayrak-metin b,.v3-cuisine .v3-cuisine-text b,.dd-uz-feature .dd-uz-flag ~ span,.dd-mark--flag ~ span,.dd-mutfak-ad';
  const ATLA = 'script,style,textarea,input,select,option,code,pre,svg,[contenteditable],[data-dd-hece="yok"],.dd-girdi,' + BASLIK_KUME + ',' + MUTFAK;
  function isle(kok = document.body) {
    if (!kok) return;
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, {acceptNode: n => !n.nodeValue || n.nodeValue.length < 5 || n.nodeValue.includes(SHY) || !n.parentElement || n.parentElement.closest(ATLA) || (n.parentElement.matches('b,strong') && !n.parentElement.closest(PARAGRAF)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const L = []; while (w.nextNode()) L.push(w.currentNode);
    for (const n of L) { const y = metinHecele(n.nodeValue, parseFloat(getComputedStyle(n.parentElement).fontSize) >= BUYUK ? BASLIK : undefined); if (y !== n.nodeValue) n.nodeValue = y; }
  }
  // ---------- Büyük başlık ince ayarı (Beyar EK 13 Ekim: “justify kalacak; açılmış boşluk kalmasın; gerekirse word-spacing ince ayarı”) ----------
  // 20px ve üstü, 2–4 satırlı iki yana yaslı başlıkta tarayıcıda birkaç dizgi denenir ve ölçülür: heceli / hecesiz × sözcük aralığı
  // (0 … −0,08em) × harf aralığı (0 … −0,01em). Puan = normal sözcük arasından en büyük sapma (em; açılma da sıkışma da) + satır sonu tiresi başına 0,3
  // + ayar miktarı kadar küçük ceza; en düşük puan uygulanır. Kutu genişliği değişmez (satırlar iki kenara dayanır). Genişlik değişince yeniden.
  const BASLIK_SEC = 'h1,h2,h3,.dd-t-page,.dd-t-section,.dd-t-display,.dd-t-featured,.dd-t-sheet';
  let gozcu = null; const ACIK = new Set(), ESIK_BASLIK = .35;   // 2px küçültmeyle de kapanmayan başlıklar (DDMetin.acik)
  const ATLA_B = ATLA.replace(',[data-dd-hece="yok"]', '');   // başlığın kendi “hecesiz” seçimi yeniden ölçümü engellemez
  // Başlığın kendi yazı tipinde normal sözcük arası (ayarsız): gizli ölçü kutusu.
  const B0 = new WeakMap();
  function bosluk0(el) { if (B0.has(el)) return B0.get(el); const cs = getComputedStyle(el), k = document.createElement('span'); k.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily};letter-spacing:0;word-spacing:0`; k.textContent = 'a a'; document.body.append(k); const a = k.getBoundingClientRect().width; k.textContent = 'aa'; const g = a - k.getBoundingClientRect().width; k.remove(); B0.set(el, g); return g; }
  function olc(el) {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 20, lh = parseFloat(getComputedStyle(el).lineHeight) || fs * 1.2, sat = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let no = 0;
    while (w.nextNode()) { const t = w.currentNode, re = /\S+/g; let m; while ((m = re.exec(t.nodeValue))) { no++; const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length); const q = [...r.getClientRects()].filter(x => x.width > 0); q.forEach((x, i) => { const mid = (x.top + x.bottom) / 2; let s = sat.find(s => Math.abs(s.mid - mid) < lh * .45); if (!s) sat.push(s = {mid, p: []}); s.p.push({x, no, bol: q.length > 1 && i < q.length - 1}); }); } }
    sat.sort((a, b) => a.mid - b.mid);
    // en: normal boşluktan en büyük sapma (em) — açılma da sıkışma da; son satır yalnız sıkışma için (iki yana yaslanmaz).
    let en = 0, tire = 0; const g0 = bosluk0(el);
    let ac = 0;
    sat.forEach((s, si) => { const p = s.p.sort((a, b) => a.x.left - b.x.left); const son = si === sat.length - 1; if (!son && p.some(x => x.bol)) tire++; let g = 0, k = 0; for (let i = 1; i < p.length; i++) if (p[i].no !== p[i - 1].no) { const d = (p[i].x.left - p[i - 1].x.right - g0) / fs; en = Math.max(en, son ? -d : Math.abs(d)); if (!son) { g += d; k++; } } if (k) ac = Math.max(ac, g / k); });
    return {n: sat.length, en, tire, ac};
  }
  function baslikAyar(kok = document.body) {
    const L = [...(kok.matches?.(BASLIK_SEC) ? [kok] : []), ...(kok.querySelectorAll?.(BASLIK_SEC) || [])];
    for (const el of L) {
      if (!el.isConnected || el.closest(ATLA_B) || !el.getClientRects().length) continue;
      const cs = getComputedStyle(el); if (cs.textAlign !== 'justify' || parseFloat(cs.fontSize) < BUYUK) continue;
      const anah = innerWidth + '|' + el.textContent.replace(/­/g, ''); if (el.dataset.ddBaslik === anah) continue;
      el.style.removeProperty('word-spacing'); el.style.removeProperty('letter-spacing'); el.style.removeProperty('font-size'); delete el.dataset.ddBaslikAcik; ACIK.delete(el);
      const metinler = []; { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) metinler.push([w.currentNode, w.currentNode.nodeValue.includes(SHY) ? w.currentNode.nodeValue : metinHecele(w.currentNode.nodeValue, BASLIK)]); }
      const ilk = olc(el); el.dataset.ddBaslik = anah;
      if (ilk.n < 2 || ilk.n > 4 || (ilk.en <= .15 && !ilk.tire)) continue;
      const fsS = parseFloat(cs.fontSize);
      // Bir yazı boyutunda en iyi dizgi: heceli/hecesiz × sözcük aralığı × harf aralığı.
      const ara = () => { let en = null; for (const hy of [true, false]) {
        metinler.forEach(([t, v]) => { const y = hy ? v : v.split(SHY).join(''); if (t.nodeValue !== y) t.nodeValue = y; });
        for (const ws of [0, -.04, -.08]) for (const ls of [0, -.01]) {
          el.style.setProperty('word-spacing', ws + 'em'); el.style.setProperty('letter-spacing', ls + 'em');
          const o = olc(el); if (o.n > ilk.n) continue;
          const puan = o.en + o.tire * .3 - ws * .5 - ls * 5;
          if (!en || puan < en.puan - .001) en = {puan, hy, ws, ls, ac: o.ac};
        } } return en; };
      // Beyar EK (a): boşluk 0,35em'i aşıyorsa yalnız bu başlıkta yazı boyutu 1px adımlarla en çok 2px küçülür; yetmezse boyut değişmez, başlık listelenir.
      let en = null, kucuk = 0;
      for (const d of [0, 1, 2]) { if (d) el.style.setProperty('font-size', (fsS - d) + 'px'); const o = ara(); if (o) { en = o; kucuk = d; } if (o && o.ac <= ESIK_BASLIK) break; }
      if (en && en.ac > ESIK_BASLIK) { el.style.removeProperty('font-size'); kucuk = 0; en = ara() || en; el.dataset.ddBaslikAcik = en.ac.toFixed(2); ACIK.add(el); }
      metinler.forEach(([t, v]) => { const y = en.hy ? v : v.split(SHY).join(''); if (t.nodeValue !== y) t.nodeValue = y; });
      if (en.hy) el.removeAttribute('data-dd-hece'); else el.setAttribute('data-dd-hece', 'yok');
      if (en.ws) el.style.setProperty('word-spacing', en.ws + 'em'); else el.style.removeProperty('word-spacing');
      if (en.ls) el.style.setProperty('letter-spacing', en.ls + 'em'); else el.style.removeProperty('letter-spacing');
      if (kucuk) el.style.setProperty('font-size', (fsS - kucuk) + 'px'); else el.style.removeProperty('font-size');
    }
    gozcu?.takeRecords();   // denemelerin metin değişiklikleri yeniden işlenmez
  }
  // Yalnız değişen alt ağaçlar yeniden işlenir (ör. pişirme zamanlayıcısı her saniye yalnız kendi metnini değiştirir).
  let bekle = false; const KOK = new Set();
  const sonra = ms => { for (const m of ms) { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (t) { KOK.add(t); } }
    if (!bekle) { bekle = true; requestAnimationFrame(() => { bekle = false; const L = [...KOK].filter(k => k.isConnected); KOK.clear(); for (const k of L) if (!L.some(o => o !== k && o.contains(k))) { isle(k); baslikAyar(k.closest?.(BASLIK_SEC) || k); } }); } };
  window.DDMetin = {hecele, isle, baslikAyar, olc, get acik() { return [...ACIK].filter(e => e.isConnected).map(e => ({metin: e.textContent.replace(/\u00AD/g, '').trim(), em: +e.dataset.ddBaslikAcik})); }, hepsi: () => { isle(); baslikAyar(); }};
  // Kopyalanan metne görünmez heceleme tireleri geçmez.
  document.addEventListener('copy', e => { const t = String(getSelection?.() || ''); if (!t.includes(SHY) || e.target.closest?.('input,textarea')) return; e.clipboardData?.setData('text/plain', t.split(SHY).join('')); e.preventDefault(); });
  const basla = () => {
    if (!document.documentElement.lang) document.documentElement.lang = 'tr';
    isle(); baslikAyar();
    gozcu = new MutationObserver(ms => { ms = ms.filter(m => m.addedNodes.length || (m.type === 'characterData' && !m.target.nodeValue?.includes(SHY))); if (ms.length) sonra(ms); });
    gozcu.observe(document.body, {childList: true, subtree: true, characterData: true});
    (document.fonts?.ready || Promise.resolve()).then(() => baslikAyar());
    let gW = innerWidth, gZ; addEventListener('resize', () => { if (innerWidth === gW) return; gW = innerWidth; clearTimeout(gZ); gZ = setTimeout(() => baslikAyar(), 150); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
