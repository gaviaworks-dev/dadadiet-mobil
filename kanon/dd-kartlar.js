/* Kart ailesi: Gastro ortak-kart.js (DGCard) işaretlemesi ve perde eğrisi. Tarif verisi yerine program/içerik: süre gün, kcal. */
(() => {
  const esc = s => DD.esc(s), ik = DD.ik, root = document.documentElement;
  const meta = r => `<span class="dd-meta" role="img" aria-label="${esc(`${r.sureGun} gün${r.ogun ? `, günde ${r.ogun} öğün` : ''}`)}"><span class="dd-meta__time">${ik('takvim')}${esc(r.sureGun)} gün</span>${r.ogun ? `<span class="dd-meta__views">${ik('ogun')}${esc(r.ogun)}</span>` : ''}</span>`;
  const photo = src => `<span class="dd-photo" style="background-image:url('${esc(src)}')"></span>`;
  const text = r => `<a class="dd-card__text" href="${esc(r.git)}"><span class="dd-card__category">${esc(r.kategori)}</span><h3 class="dd-card__title">${esc(r.baslik)}</h3></a>`;
  const visual = (r, cls) => `<a class="${cls}" href="${esc(r.git)}" aria-label="${esc(r.baslik)}" tabindex="-1">${photo(r.gorsel)}</a>`;
  const author = r => (r.alt ? `<div class="dd-author"><span class="dd-author__name">${esc(r.alt)}</span></div>` : '');
  const save = r => `<button class="dd-save" type="button" aria-label="Kaydet" aria-pressed="${!!r.kayitli}" data-eylem="kaydet" data-id="${esc(r.id)}">${ik('kaydet')}</button>`;
  const card = (r, v = '') => `<article class="dd-card${v ? ` dd-card--${v}` : ''}"><div class="dd-card__media">${visual(r, 'dd-card__visual')}${meta(r)}${save(r)}</div><div class="dd-card__body">${text(r)}${author(r)}</div></article>`;
  const feature = r => `<article class="dd-feature"><div class="dd-feature__media">${visual(r, 'dd-feature__visual')}<span class="dd-feature__veil" aria-hidden="true"></span>${meta(r)}${save(r)}<div class="dd-feature__info">${text(r)}${author(r)}</div></div></article>`;
  const tile = r => `<article class="dd-tile"><div class="dd-tile__media">${visual(r, 'dd-tile__visual')}<span class="dd-tile__veil" aria-hidden="true"></span>${meta(r)}${save(r)}<div class="dd-tile__info">${text(r)}${author(r)}</div></div></article>`;
  const kart = (r, tur) => (tur === 'row' ? card(r, 'row') : tur === 'tile' ? tile(r) : tur === 'feature' ? feature(r) : card(r));

  // Ortak geçiş eğrisi: smootherstep, Gastro veils ile aynı.
  const sstep = t => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (6 * t - 15) + 10); };
  const tok = () => { const cs = getComputedStyle(root), n = k => parseFloat(cs.getPropertyValue(k)); return {T: n('--dd-veil-top-a') || .35, E: n('--dd-veil-end-a') || .6, lead: n('--dd-veil-lead') || 40, tail: n('--dd-veil-tail') || 32}; };
  const edgeTop = (y, len, t) => t.T * (1 - sstep(y / Math.max(1, len)));
  const edgeBottom = (y, top, t) => t.E * sstep((y - (top - t.lead)) / (t.lead + t.tail));
  const gradient = (h, alpha, marks = []) => { const ys = [...new Set([...Array.from({length: Math.ceil(h / 4) + 1}, (_, i) => Math.min(h, i * 4)), ...marks].map(y => Math.max(0, Math.min(h, Math.round(y)))))].sort((a, c) => a - c); return `linear-gradient(180deg,${ys.map(y => `color-mix(in srgb,var(--dd-overlay) ${(alpha(y) * 100).toFixed(2)}%,transparent) ${y}px`).join(',')})`; };
  const VEIL = [['.dd-tile__media', '.dd-tile__info'], ['.dd-feature__media', '.dd-feature__info'], ['.dd-veil-bottom', '[data-dd-veil-from]']];
  const textTop = el => { const r = document.createRange(); r.selectNodeContents(el); const t = [...r.getClientRects()].filter(x => x.width && x.height).map(x => x.top); return t.length ? Math.min(...t) : el.getBoundingClientRect().top; };
  const veils = (scope = document) => { const t = tok(); for (const [m, s] of VEIL) for (const box of scope.querySelectorAll(m)) { if (box.dataset.perde) continue; const tx = box.querySelector(s), b = box.getBoundingClientRect(); if (!tx || !b.height) continue; const top = textTop(tx) - b.top; box.style.setProperty('--dd-veil', gradient(b.height, y => edgeBottom(y, top, t), [top - t.lead, top + t.tail])); box.dataset.perde = 1; } };
  addEventListener('resize', () => { document.querySelectorAll('[data-perde]').forEach(b => delete b.dataset.perde); veils(); });
  document.fonts?.ready.then(() => veils());
  document.addEventListener('click', e => { const b = e.target.closest('.dd-save'); if (!b) return; e.preventDefault(); const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); DD.toast(on ? 'Kaydedildi' : 'Kayıt kaldırıldı'); });
  window.DDCard = {kart, card, feature, tile, meta, veils, textTop, gradient, edgeTop, edgeBottom, tokens: tok};
})();
