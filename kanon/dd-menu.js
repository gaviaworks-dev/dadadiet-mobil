/* Sağ çekmece menü: Gastro ortak-menu.js kalıbı (%86 / en çok 360, kullanıcı alanı, 48 satır, tek açık akordeon). API: DD.menu.ac(), DD.menu.kapat(). */
(() => {
  const esc = s => DD.esc(s), ik = DD.ik;
  const OGELER = [
    {id: 'bugun', label: 'Bugün', icon: 'house', git: '#/bugun'},
    {id: 'programlar', label: 'Programlar', icon: 'clipboard-list', children: [
      {id: 'tum', label: 'Tüm Programlar', icon: 'clipboard-list', git: '#/programlar'},
      {id: 'bul', label: 'Program Bul', icon: 'wand-magic-sparkles', git: '#/program-bul'}]},
    {id: 'ritim', label: 'Ritim', icon: 'hourglass-half', git: '#/ritim'},
    {id: 'denge', label: 'Denge & Tabak', icon: 'scale-balanced', children: [
      {id: 'tabak', label: 'Akıllı tabak', icon: 'plate-wheat', git: '#/denge'},
      {id: 'muadil', label: 'Muadil bulucu', icon: 'right-left', git: '#/denge/muadil'},
      {id: 'kacamak', label: 'Kaçamak kurtarma', icon: 'life-ring', git: '#/denge/kacamak'},
      {id: 'kiyasla', label: 'Besin kıyasla', icon: 'code-compare', git: '#/denge/kiyasla'}]},
    {id: 'uzman', label: 'Uzmanım', icon: 'user-doctor', children: [
      {id: 'hub', label: 'Diyetisyenim', icon: 'user-doctor', git: '#/uzman'},
      {id: 'bul2', label: 'Diyetisyen bul', icon: 'magnifying-glass', git: '#/uzman/bul'},
      {id: 'sohbet', label: 'Mesajlar', icon: 'comment-dots', git: '#/uzman/sohbet'}]},
    {id: 'tabaklar', label: 'Tabaklarım', icon: 'images', git: '#/tabaklarim'},
    {id: 'saglik', label: 'Sağlık dosyam', icon: 'file-medical', git: '#/saglik'},
    {id: 'etiket', label: 'Etiket okuma', icon: 'barcode', git: '#/etiket'},
    {id: 'bildirim', label: 'Bildirimler', icon: 'bell', git: '#/bildirimler'},
    {id: 'profil', label: 'Profil ve ayarlar', icon: 'sliders', git: '#/profil'},
    {id: 'cikis', label: 'Çıkış yap', icon: 'right-from-bracket', eylem: 'cikis'}
  ];
  const aktif = () => (DD.aktif()?.hash || location.hash).split('?')[0];
  const satir = (x, alt) => { const on = x.git === aktif(); return `<a class="dd-menu-row${alt ? ' dd-menu-subrow' : ''}${on ? ' is-active' : ''}" href="${esc(x.git || '')}" data-menu-git="${esc(x.git || '')}"${x.eylem ? ` data-menu-eylem="${esc(x.eylem)}"` : ''}${on ? ' aria-current="page"' : ''}><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span></a>`; };
  const grup = x => { const acik = x.children.some(c => c.git === aktif()); return `<div class="dd-menu-item dd-menu-group${acik ? ' is-open' : ''}"><button class="dd-menu-row dd-menu-toggle" type="button" aria-expanded="${acik}"><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span><span class="dd-menu-chev">${ik('chevron-down')}</span></button><div class="dd-menu-sub"${acik ? '' : ' inert'}><div class="dd-menu-sub-in">${x.children.map(c => satir(c, true)).join('')}</div></div></div>`; };
  const kullanici = () => { const k = window.DDV?.kullanici || {}; return `<a class="dd-menu-profile" href="#/profil" data-menu-git="#/profil"><span class="dd-menu-avatar" aria-hidden="true">${esc(String(k.ad || 'D').slice(0, 1))}</span><span class="dd-menu-who"><b>${esc([k.ad, k.soyad].filter(Boolean).join(' ') || 'Profilim')}</b><small>${ik('hedef')} ${esc(k.hedefAd || '')}</small></span><span class="dd-menu-go">Profilim ${ik('chevron-right')}</span></a><div class="dd-menu-shortcuts">${[['#/saglik', 'file-medical', 'Sağlık'], ['#/programlar', 'clipboard-list', 'Programlar'], ['#/bildirimler', 'bell', 'Bildirimler']].map(([g, i, t]) => `<a class="dd-menu-short" href="${g}" data-menu-git="${g}">${ik(i)}<span>${esc(t)}</span></a>`).join('')}</div>`; };
  let acikEl = null;
  const kapat = () => { if (!acikEl) return; const k = acikEl; acikEl = null; k.querySelector('.dd-menu').classList.remove('is-in'); k.querySelector('.dd-perde').classList.add('is-cikis'); setTimeout(() => k.remove(), DD.azHareket() ? 0 : DD.TK.motion.drawer); };
  const ac = () => {
    if (acikEl) return;
    const kat = document.getElementById('dd-katman') || document.body, k = document.createElement('div');
    k.className = 'dd-menu-kap';
    k.innerHTML = `<div class="dd-perde" data-menu-kapat></div><div class="dd-menu" role="dialog" aria-modal="true" aria-label="Menü" tabindex="-1"><div class="dd-menu-panel"><div class="dd-menu-head"><a class="dd-menu-logo" href="#/bugun" data-menu-git="#/bugun" aria-label="Dada Diet ana sayfa"><img src="assets/marka/dadadiet-renkli.svg" alt="Dada Diet"></a><button class="dd-menu-close" type="button" data-menu-kapat aria-label="Kapat">${ik('kapat')}</button></div><div class="dd-menu-scroll"><div class="dd-menu-user">${kullanici()}</div><nav class="dd-menu-nav" aria-label="Menü">${OGELER.map(x => (x.children ? grup(x) : `<div class="dd-menu-item">${satir(x)}</div>`)).join('')}</nav></div></div></div>`;
    kat.append(k); acikEl = k;
    requestAnimationFrame(() => k.querySelector('.dd-menu').classList.add('is-in'));
    k.querySelector('.dd-menu').focus({preventScroll: true});
    k.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
    k.addEventListener('click', e => {
      if (e.target.closest('[data-menu-kapat]')) { kapat(); return; }
      const t = e.target.closest('.dd-menu-toggle');
      if (t) { const g = t.closest('.dd-menu-group'), on = !g.classList.contains('is-open'); k.querySelectorAll('.dd-menu-group').forEach(x => { const a = x === g && on; x.classList.toggle('is-open', a); x.querySelector('.dd-menu-toggle').setAttribute('aria-expanded', a); x.querySelector('.dd-menu-sub').inert = !a; }); return; }
      const a = e.target.closest('[data-menu-git]');
      if (a) { e.preventDefault(); e.stopPropagation(); kapat(); if (a.dataset.menuEylem === 'cikis') DD.cikis(); else if (a.dataset.menuGit) DD.git(a.dataset.menuGit); }
    });
  };
  DD.menu = {ac, kapat};
})();
