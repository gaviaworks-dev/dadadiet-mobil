/* Sağ çekmece menü: Gastro mobil 1.0.1 dg_drawer.dart + app_drawer.dart. %86 / en çok 360, hesap kartı, kayan kısayollar, başlıksız gezinme blokları, tek açık akordeon, dil, sosyal ve yasal ayak. API: DD.menu.ac(), DD.menu.kapat(). */
(() => {
  const esc = s => DD.esc(s), ik = DD.ik;
  const hesapGrubu = {id: 'hesap', label: 'Hesabım', icon: 'user', uye: true, children: [
    {id: 'hedefler', label: 'Hedefler', icon: 'bullseye', git: '#/profil'},
    {id: 'izinler', label: 'İzinler (HealthKit)', icon: 'shield-halved', git: '#/profil?ac=izinler'},
    {id: 'ayarlar', label: 'Ayarlar', icon: 'sliders', git: '#/profil?ac=ayarlar'}]};
  const BLOKLAR = () => [[
    {id: 'bugun', label: 'Bugün', icon: 'house', git: '#/bugun'},
    {id: 'tabak', label: 'Akıllı Tabak & Değişim', icon: 'plate-wheat', children: [
      {id: 'tabak-kur', label: 'Tabak Kur', icon: 'plate-wheat', git: '#/denge'},
      {id: 'tabak-cek', label: 'Tabağını Çek', icon: 'camera', git: '#/ai/kamera?mod=tabak'},
      {id: 'degisim', label: 'Değişim Önerileri', icon: 'right-left', git: '#/denge/muadil'}]},
    {id: 'programlar', label: 'Programlar & Diyetler', icon: 'clipboard-list', children: [
      {id: 'hedefe', label: 'Hedefe Göre', icon: 'bullseye', git: '#/programlar?seg=hedef'},
      {id: 'yasama', label: 'Yaşam Biçimine Göre', icon: 'person-walking', git: '#/programlar?seg=yasam'}]},
    {id: 'oruc', label: 'Oruç & Öğün Saatleri', icon: 'hourglass-half', git: '#/ritim'},
    {id: 'kutuphane', label: 'Beslenme Kütüphanesi', icon: 'book-open', children: [
      {id: 'besin', label: `${(window.DDV?.besinler || []).length} Besin Değeri`, icon: 'apple-whole', git: '#/besin-ara'},
      {id: 'testler', label: 'Sağlık Testleri', icon: 'clipboard-check', yakinda: true}]},
    {id: 'etiket', label: 'Etiket Okuma', icon: 'barcode', git: '#/etiket'},
    {id: 'uzman', label: 'Diyetisyenim', icon: 'user-doctor', children: [
      {id: 'randevu', label: 'Randevularım', icon: 'calendar-check', git: '#/uzman'},
      {id: 'sohbet', label: 'Mesajlarım', icon: 'comment-dots', git: '#/uzman/sohbet'},
      {id: 'bul2', label: 'Uzman Bul', icon: 'magnifying-glass', git: '#/uzman/bul'}]}
  ], [
    ...(DD.uye() ? [hesapGrubu] : []),
    {id: 'gorus', label: 'Görüş Bildir / Destek', icon: 'comment-dots', eylem: 'gorus'}
  ]];
  const kisayollar = () => { const a = DD.durum.oku('aktifProgram', window.DDV?.kullanici?.aktifProgram), n = DD.bildirimSayi(); return [['#/saglik', 'file-medical', 'Sağlık Dosyam'], [a ? `#/program/${a.slug}` : '#/programlar', 'clipboard-list', 'Aktif Programım'], ['#/tabaklarim', 'images', 'Tabaklarım'], ['#/bildirimler', 'bell', 'Bildirimler', n]]; };
  const DILLER = ['Türkçe', 'English', 'Español', 'Русский', 'Deutsch'];
  const SOSYAL = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['x-twitter', 'X']];
  const YASAL = ['Hakkımızda', 'Yasal Sayfalar', 'İletişim'];
  const aktif = () => (DD.aktif()?.hash || location.hash).split('?')[0];
  const satir = (x, alt) => { const on = x.git === aktif(); return `<a class="dd-menu-row${alt ? ' dd-menu-subrow' : ''}${on ? ' is-active' : ''}" href="${esc(x.git || '')}" data-menu-git="${esc(x.git || '')}"${x.yakinda ? ' data-menu-yakinda' : ''}${x.eylem ? ` data-menu-eylem="${esc(x.eylem)}"` : ''}${on ? ' aria-current="page"' : ''}><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span></a>`; };
  const grup = x => { const acik = x.children.some(c => c.git === aktif()); return `<div class="dd-menu-item dd-menu-group${acik ? ' is-open' : ''}"><button class="dd-menu-row dd-menu-toggle" type="button" aria-expanded="${acik}"><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span><span class="dd-menu-chev">${ik('chevron-down')}</span></button><div class="dd-menu-sub"${acik ? '' : ' inert'}><div class="dd-menu-sub-in">${x.children.map(c => satir(c, true)).join('')}</div></div></div>`; };
  const kullanici = () => { if (!DD.uye()) return `<p class="dd-menu-hello"><b>Merhaba</b><span>Verilerini korumak ve geçmişini görmek için giriş yap.</span></p><div class="dd-menu-auth">${DD.btn({metin: 'Giriş Yap', boyut: 'sm', attrs: 'data-menu-git="#/karsilama"'})}${DD.btn({metin: 'Üye Ol', tur: 'secondary', boyut: 'sm', attrs: 'data-menu-eylem="uye" data-menu-git=""'})}</div>`; const k = window.DDV?.kullanici || {}; return `<a class="dd-menu-profile" href="#/profil" data-menu-git="#/profil"><span class="dd-menu-avatar" aria-hidden="true">${esc(String(k.ad || 'D').slice(0, 1))}</span><span class="dd-menu-who"><b>${esc([k.ad, k.soyad].filter(Boolean).join(' ') || 'Profilim')}</b><small>${ik('hedef')} ${esc(String(k.hedefAd || '').split(' ').map(w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1)).join(' '))}</small></span><span class="dd-menu-go">Profilim ${ik('chevron-right')}</span></a><div class="dd-menu-shortcuts">${kisayollar().map(([g, i, t, n]) => `<a class="dd-menu-short" href="${g}" data-menu-git="${g}">${ik(i)}<span>${esc(t)}</span>${n ? `<b class="dd-menu-sayac">${n}</b>` : ''}</a>`).join('')}</div>`; };
  const ayak = () => `<footer class="dd-menu-foot"><div class="dd-menu-item dd-menu-group dd-menu-lang"><button class="dd-menu-row dd-menu-toggle" type="button" aria-expanded="false"><span class="dd-menu-ic">${ik('globe')}</span><span class="dd-menu-label">Dil: <b>${esc(DILLER[0])}</b></span><span class="dd-menu-chev">${ik('chevron-down')}</span></button><div class="dd-menu-sub" inert><div class="dd-menu-sub-in" role="radiogroup" aria-label="Dil">${DILLER.map((d, i) => `<button class="dd-menu-row dd-menu-subrow dd-menu-lang-opt" type="button" role="radio" aria-checked="${!i}"${i ? ' data-menu-yakinda' : ''}><span class="dd-menu-label">${esc(d)}</span>${i ? '' : `<span class="dd-menu-ic">${ik('onay')}</span>`}</button>`).join('')}</div></div></div><div class="dd-menu-meta"><div class="dd-menu-social">${SOSYAL.map(([i, ad]) => `<a href="" data-menu-yakinda aria-label="Dada Diet ${esc(ad)}"><i class="dd-menu-brand fa-brands fa-${i}" aria-hidden="true"></i></a>`).join('')}</div><div class="dd-menu-legal">${YASAL.map(t => `<a href="" data-menu-yakinda>${esc(t)}</a>`).join('')}</div></div></footer>`;
  const gorusSheet = () => DD.sheet({
    baslik: 'Görüş Bildir',
    html: `<div class="dd-yigin">${DD.p('Uygulamayla ilgili **görüşünü** bizimle paylaş.')}${DD.input({ad: 'gorus', etiket: 'Görüşün', cokSatir: true, yer: 'Ne iyi çalıştı, neyi geliştirelim?'})}</div>`,
    altBar: DD.btn({metin: 'Gönder', ikon: 'gonder', tam: true, veri: {eylem: 'gorus-gonder'}}),
    sonra: h => DD.eylem(h, 'gorus-gonder', () => {
      if (!h.querySelector('[name="gorus"]').value.trim()) { DD.toast('Önce **görüşünü** yaz', {ikon: 'bilgi'}); return; }
      h.kapat(); DD.toast('Görüşün **alındı**, teşekkürler', {tur: 'basari'});
    })
  });
  let acikEl = null;
  const kapat = () => { if (!acikEl) return; const k = acikEl; acikEl = null; k.querySelector('.dd-menu').classList.remove('is-in'); k.querySelector('.dd-perde').classList.add('is-cikis'); setTimeout(() => k.remove(), DD.azHareket() ? 0 : DD.TK.motion.drawer); };
  const ac = () => {
    if (acikEl) return;
    const kat = document.getElementById('dd-katman') || document.body, k = document.createElement('div');
    k.className = 'dd-menu-kap';
    k.innerHTML = `<div class="dd-perde" data-menu-kapat></div><div class="dd-menu" role="dialog" aria-modal="true" aria-label="Menü" tabindex="-1"><div class="dd-menu-panel"><div class="dd-menu-head"><a class="dd-menu-logo" href="#/bugun" data-menu-git="#/bugun" aria-label="Dada Diet ana sayfa"><img src="assets/marka/dadadiet-renkli.svg" alt="Dada Diet"></a><button class="dd-menu-close" type="button" data-menu-kapat aria-label="Kapat">${ik('kapat')}</button></div><div class="dd-menu-scroll"><div class="dd-menu-user">${kullanici()}</div><nav class="dd-menu-nav" aria-label="Menü">${BLOKLAR().map(b => `<div class="dd-menu-blok">${b.map(x => (x.children ? grup(x) : `<div class="dd-menu-item">${satir(x)}</div>`)).join('')}</div>`).join('')}</nav>${ayak()}</div></div></div>`;
    kat.append(k); acikEl = k;
    requestAnimationFrame(() => k.querySelector('.dd-menu').classList.add('is-in'));
    k.querySelector('.dd-menu').focus({preventScroll: true});
    k.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
    k.addEventListener('click', e => {
      if (e.target.closest('[data-menu-kapat]')) { kapat(); return; }
      const t = e.target.closest('.dd-menu-toggle');
      if (t) { const g = t.closest('.dd-menu-group'), on = !g.classList.contains('is-open'); g.closest('.dd-menu-nav,.dd-menu-foot').querySelectorAll('.dd-menu-group').forEach(x => { const a = x === g && on; x.classList.toggle('is-open', a); x.querySelector('.dd-menu-toggle').setAttribute('aria-expanded', a); x.querySelector('.dd-menu-sub').inert = !a; }); return; }
      if (e.target.closest('[data-menu-yakinda]')) { e.preventDefault(); kapat(); DD.toast('Yakında', {ikon: 'bilgi'}); return; }
      const a = e.target.closest('[data-menu-git]');
      if (a) { e.preventDefault(); e.stopPropagation(); kapat(); if (a.dataset.menuEylem === 'cikis') DD.cikis(); else if (a.dataset.menuEylem === 'gorus') gorusSheet(); else if (a.dataset.menuEylem === 'uye') DD.uyeDuvar(); else if (a.dataset.menuGit) DD.git(a.dataset.menuGit); }
    });
  };
  DD.menu = {ac, kapat};
})();
