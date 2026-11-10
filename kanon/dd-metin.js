/* METİN KANONU — okunurluk (Beyar, 11 Kasım 2026): uygulamada heceleme YOK, paragraf başa yaslı (dd-metin.css).
   Önceki sürüm (13 Ekim) görünen metne Türkçe yumuşak tire ekliyor ve büyük başlıkta sözcük/harf aralığı deniyordu; ikisi de kaldırıldı.
   Bu dosyanın tek işi: sayı ile birimi satır sonunda koparmamak. Görünen metinde rakamdan sonra gelen boşluk + birim
   (kcal, kg, g, ml, L, cm, sa, dk, gün, %, TL, adım, bardak, hafta, kişi; ek olarak öğün, saat, porsiyon, litre, mililitre, gram, kilogram, dakika;
   “2 günlük”, “3 bardaktan” gibi ekli halleri dahil) arasındaki boşluk bölünmeyen boşluğa (U+00A0) çevrilir; sayı aralığı (8-10) tireden kopmaz. Eski içerikte kalmış yumuşak tire (U+00AD) varsa silinir.
   Girdi, düzenlenen metin, kod ve [data-dd-hece="yok"] işlenmez. Sayfa ya da içerik değişince yalnız değişen alt ağaç yeniden işlenir.
   API korunur: DDMetin.isle(kok), .hecele(s) (artık s'yi değiştirmeden döner), .baslikAyar() (no-op), .acik ([]), .hepsi(). */
(() => {
  if (window.DDMetin) return;
  const SHY = /\u00AD/g, NBSP = '\u00A0';
  // Rakam + boşluk(lar) + birim. Tek harfli ve kısa birimler (g, L, sa, dk, cm, ml, kg, TL) arkasından harf gelmeyince eşleşir ("2 güzel" bağlanmaz);
  // sözcük birimler (gün, adım, bardak, hafta, kişi, kcal) ekli de olabilir ("2 günlük"). % her durumda.
  const HARF = 'A-Za-zÇĞİÖŞÜçğıöşüâîû';
  const BIRIM = new RegExp(`(\\d)[ \\t]+(?=(?:(?:kcal|gün|adım|bardak|hafta|kişi|öğün|saat|porsiyon|litre|mililitre|gram|kilogram|dakika)|(?:kg|ml|cm|TL|sa|dk|g|L)(?![${HARF}])|%))`, 'g');
  const ATLA = 'script,style,textarea,input,select,option,code,pre,[contenteditable],[data-dd-hece="yok"]';
  // Sayı aralığı (8-10, 1.500-1.700): tireden sonra sözcük birleştirici (U+2060), aralık satır sonunda kopmaz.
  const ARALIK = /(\d)-(?=\d)/g, WJ = '\u2060';
  const duzelt = t => t.replace(SHY, '').replace(BIRIM, `$1${NBSP}`).replace(ARALIK, `$1-${WJ}`);
  // Sayı ve birim ayrı öğelerdeyse (<b>252</b> kcal, <b>5,4</b> <small>%</small>): komşu metin düğümüne bakılır.
  const BIRIM_BAS = new RegExp(`^(?:(?:kcal|gün|adım|bardak|hafta|kişi|öğün|saat|porsiyon|litre|mililitre|gram|kilogram|dakika)|(?:kg|ml|cm|TL|sa|dk|g|L)(?![${HARF}])|%)`);
  const komsu = (n, yon) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); w.currentNode = n; let m; while ((m = yon < 0 ? w.previousNode() : w.nextNode())) if (m.nodeValue) return m.nodeValue; return ''; };
  const sinir = n => {
    let t = n.nodeValue;
    const bas = t.match(/^[ \t]+/);
    if (bas && /\d$/.test(komsu(n, -1)) && (BIRIM_BAS.test(t.slice(bas[0].length)) || (bas[0].length === t.length && BIRIM_BAS.test(komsu(n, 1).trimStart())))) t = NBSP + t.slice(bas[0].length);
    const son = t.match(/(\d)[ \t]+$/);
    if (son && BIRIM_BAS.test(komsu(n, 1))) t = t.slice(0, son.index + 1) + NBSP;
    return t;
  };
  function isle(kok = document.body) {
    if (!kok) return;
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, {acceptNode: n => (!n.nodeValue || !/[\d­]|^[ \t]/.test(n.nodeValue) || !n.parentElement || n.parentElement.closest(ATLA) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)});
    const L = []; while (w.nextNode()) L.push(w.currentNode);
    for (const n of L) { const y = duzelt(n.nodeValue); if (y !== n.nodeValue) n.nodeValue = y; const z = sinir(n); if (z !== n.nodeValue) n.nodeValue = z; }
    gozcu?.takeRecords();   // kendi değişikliklerimiz yeniden işlenmez
  }
  let gozcu = null, bekle = false; const KOK = new Set();
  const sonra = ms => {
    for (const m of ms) { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (t) KOK.add(t); }
    if (!bekle) { bekle = true; requestAnimationFrame(() => { bekle = false; const L = [...KOK].filter(k => k.isConnected); KOK.clear(); for (const k of L) if (!L.some(o => o !== k && o.contains(k))) isle(k); }); }
  };
  window.DDMetin = {hecele: s => s, isle, baslikAyar: () => {}, get acik() { return []; }, hepsi: () => isle(), duzelt};
  const basla = () => {
    if (!document.documentElement.lang) document.documentElement.lang = 'tr';
    isle();
    gozcu = new MutationObserver(ms => { ms = ms.filter(m => m.addedNodes.length || m.type === 'characterData'); if (ms.length) sonra(ms); });
    gozcu.observe(document.body, {childList: true, subtree: true, characterData: true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
