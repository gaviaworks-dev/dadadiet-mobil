/* Sağ çekmece menü: Gastro ortak-menu.js (V4) + mobil 1.0.1 dg_drawer.dart / app_drawer.dart (10 Kasım Gastro geçişinde yeniden kıyaslandı). %86 / en çok 360, hesap kartı, kayan kısayollar, başlıksız gezinme blokları, tek açık akordeon, dil, sosyal ve yasal ayak. API: DD.menu.ac(), DD.menu.kapat(). */
(() => {
  const esc = s => DD.esc(s), ik = DD.ik;
  // Gezinme Gastro mobil 1.0.1 çekmecesinin kalıbıdır (app_drawer.dart): hesap kartı + 4 kısayol, başlıksız iki blok (ana modüller · Hesabım + Görüş Bildir), ayak.
  // Ana blok sırası web prototipin menüsüyle aynı (_src/kabuk/menu.mjs anaMenu): Sağlık Araçları · Beslenme · Programlar · Diyetisyenler; başta Ana Sayfa (Gastro).
  // Web satırlarının hepsinin mobilde ekranı var (Kaç Kalori?, Beslenme Rehberleri, Dışarıda Ne Yesem? 11 Kasım'da eklendi). Sağlıklı Tarifler yok (ürün kaldırıldı, 10 Kasım).
  // Dışarıda Ne Yesem? Beslenme grubunda (lead kararı, 10 Kasım). Etiket Okuma şartname 2c gereği Sağlık Araçları'nın sonunda kalır.
  // Hesabım web üye menüsünün sırasıyla (uyeMenu); kısayollarda olanlar (Beslenme Planım, Sağlık Dosyam) tekrar edilmez; grup yalnız üyede çizilir.
  const hesapGrubu = {id: 'hesap', label: 'Hesabım', icon: 'user', children: [
    {id: 'programlarim', label: 'Programlarım', icon: 'list-check', git: '#/programlarim'},
    {id: 'diyetisyenim', label: 'Diyetisyenim', icon: 'user-doctor', git: '#/uzman'},
    {id: 'sohbet', label: 'Mesajlarım', icon: 'comment-dots', git: '#/uzman/sohbet'},
    {id: 'izinler', label: 'Veri İzinlerim', icon: 'user-shield', git: '#/veri-izinleri'},
    {id: 'rozetler', label: 'Rozetlerim', icon: 'medal', git: '#/rozetler'},
    {id: 'meydan', label: 'Meydan Okumalar', icon: 'flag-checkered', git: '#/rozetler?sekme=meydan'},
    {id: 'tercihler', label: 'Tercihlerim', icon: 'user-pen', git: '#/tercihler'},
    {id: 'ogun-saat', label: 'Öğün Saatlerim', icon: 'clock', git: '#/ogun-saatleri'},
    {id: 'tabaklarim', label: 'Tabaklarım', icon: 'images', git: '#/tabaklarim'},
    {id: 'paketler', label: 'Paketlerim', icon: 'crown', git: '#/paketlerim'},
    {id: 'odemeler', label: 'Ödemelerim', icon: 'receipt', git: '#/odemelerim'},
    {id: 'ayarlar', label: 'Hesap Ayarları', icon: 'sliders', git: '#/ayarlar'},
    {id: 'bagli', label: 'Bağlı Uygulamalar ve Cihazlar', icon: 'heart-pulse', git: '#/cihazlar'},
    {id: 'cozum', label: 'Çözüm Merkezi', icon: 'headset', git: '#/cozum-merkezi'},
    {id: 'cikis', label: 'Çıkış', icon: 'right-from-bracket', eylem: 'cikis'}]};
  const BLOKLAR = () => [[
    {id: 'bugun', label: 'Ana Sayfa', icon: 'house', git: '#/bugun'},
    {id: 'araclar', label: 'Sağlık Araçları', icon: 'toolbox', children: [
      {id: 'bana-uygun', label: 'Bana Uygun Olanı Bul', icon: 'compass', git: '#/bana-uygun'},
      {id: 'hesapla', label: 'Hesaplayıcılar', icon: 'calculator', git: '#/hesaplayicilar'},
      {id: 'testler', label: 'Sağlık Testleri', icon: 'clipboard-question', git: '#/testler'},
      {id: 'denge', label: 'Akıllı Tabak ve Değişim', icon: 'chart-pie', git: '#/denge'},
      {id: 'oruc', label: 'Aralıklı Oruç Rehberi', icon: 'clock', git: '#/ritim'},
      {id: 'etiket', label: 'Etiket Okuma', icon: 'barcode', git: '#/etiket'}]},
    {id: 'beslenme', label: 'Beslenme', icon: 'book-open', children: [
      {id: 'besin', label: 'Besin Kütüphanesi', icon: 'magnifying-glass', git: '#/besinler'},
      {id: 'kiyasla', label: 'Besin Karşılaştır', icon: 'scale-balanced', git: '#/denge/kiyasla'},
      {id: 'kac-kalori', label: 'Kaç Kalori?', icon: 'fire-flame-curved', git: '#/kac-kalori'},
      {id: 'rehberler', label: 'Beslenme Rehberi', icon: 'book-open', git: '#/rehberler'},
      {id: 'ipuclari', label: 'İpuçları & Püf Noktaları', icon: 'lightbulb', git: '#/ipuclari'},
      {id: 'disarida', label: 'Dışarıda Ne Yesem?', icon: 'location-dot', git: '#/disarida'}]},
    {id: 'programlar', label: 'Programlar', icon: 'list-check', children: [
      {id: 'tum', label: 'Tüm Programlar', icon: 'clipboard-list', git: '#/programlar'},
      {id: 'bul', label: 'Program Bul', icon: 'wand-magic-sparkles', git: '#/program-bul'},
      {id: 'hedefe', label: 'Hedefe Göre', icon: 'bullseye', git: '#/programlar?seg=hedef'},
      {id: 'yasama', label: 'Yaşam Biçimine Göre', icon: 'people-roof', git: '#/programlar?seg=yasam'},
      {id: 'tercihe', label: 'Beslenme Tercihine Göre', icon: 'seedling', git: '#/programlar?seg=tercih'},
      {id: 'ihtiyaca', label: 'İhtiyacına Göre', icon: 'list-check', git: '#/programlar?seg=ihtiyac'},
      {id: 'sureye', label: 'Süreye Göre', icon: 'calendar', git: '#/programlar?seg=sure'}]},
    // Diyetisyenler: web footer "Uzman Desteği" sütunu (Paket 1b): bul, nasıl çalışır, uzmanla çalışma rehberi, diyetisyen ol.
    {id: 'uzman', label: 'Diyetisyenler', icon: 'user-doctor', children: [
      {id: 'uzman-bul', label: 'Diyetisyen Bul', icon: 'magnifying-glass', git: '#/uzman/bul'},
      {id: 'nasil', label: 'Nasıl Çalışır?', icon: 'circle-question', git: '#/nasil-calisir'},
      {id: 'uzmanla', label: 'Uzmanla Çalışma Rehberi', icon: 'handshake', git: '#/uzmanla-calisma'},
      {id: 'saglik-bilgi', label: 'Sağlık Bilgilendirmesi', icon: 'notes-medical', git: '#/saglik-bilgilendirmesi'},
      {id: 'diyetisyen-ol', label: 'Diyetisyen Ol', icon: 'id-badge', git: '#/diyetisyen-ol'}]}
  ], [
    ...(DD.uye() ? [hesapGrubu] : []),
    {id: 'pro', label: 'Dada Diet Pro', icon: 'bolt', git: '#/pro'},
    {id: 'gorus', label: 'Görüş Bildir', icon: 'comment-dots', git: '#/gorus-bildir'}
  ]];
  const kisayollar = () => [['#/beslenme-plani', 'clipboard-list', 'Beslenme Planım'], ['#/saglik', 'file-medical', 'Sağlık Dosyam'], ['#/haftalik-menu?ac=alisveris', 'cart-shopping', 'Alışveriş Listem'], ['#/kaydedilenler', 'bookmark', 'Kaydettiklerim']];
  // Dil: Ayarlar > Dil ile aynı iki dil ve aynı kayıt (hesap-ayar.dil.dil). Tasarım öğesi: uygulama TR çalışır, diller Flutter aşamasında gelir.
  const DILLER = [['tr', 'Türkçe'], ['en', 'English']];
  const dilKod = () => DD.durum.oku('hesap-ayar', {})?.dil?.dil || 'tr';
  const dilAd = () => (DILLER.find(([k]) => k === dilKod()) || DILLER[0])[1];
  // Sosyal (karar 5, 11 Kasım): Diet web'de adresli sosyal hesap yok (web footer + Laravel adressiz ikonu basmıyor) → menüde sosyal satırı yok. Adres gelince web'in platformları: Instagram, YouTube, Pinterest.
  // Yasal ayak (Paket 1, 1b): web footer kurumsal sırası (_src/kabuk/menu.mjs footerKurumsal: Hakkımızda · Editoryal ve Bilimsel Kurul · Künye · İletişim), sonra SSS ve Yasal Metinler. Hepsi gerçek rota.
  const YASAL = [['#/hakkimizda', 'Hakkımızda'], ['#/editoryal-kurul', 'Editoryal Kurul'], ['#/kunye', 'Künye'], ['#/iletisim', 'İletişim'], ['#/sss', 'SSS'], ['#/yasal', 'Yasal Metinler']];
  const aktif = () => (DD.aktif()?.hash || location.hash).split('?')[0];
  const satir = (x, alt) => { const on = x.git === aktif(); return `<a class="dd-menu-row${alt ? ' dd-menu-subrow' : ''}${on ? ' is-active' : ''}" href="${esc(x.git || '')}" data-menu-git="${esc(x.git || '')}"${x.yakinda ? ' data-menu-yakinda' : ''}${x.eylem ? ` data-menu-eylem="${esc(x.eylem)}"` : ''}${on ? ' aria-current="page"' : ''}><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span></a>`; };
  const grup = x => { const acik = x.children.some(c => c.git === aktif()); return `<div class="dd-menu-item dd-menu-group${acik ? ' is-open' : ''}"><button class="dd-menu-row dd-menu-toggle" type="button" aria-expanded="${acik}"><span class="dd-menu-ic">${ik(x.icon)}</span><span class="dd-menu-label">${esc(x.label)}</span><span class="dd-menu-chev">${ik('chevron-down')}</span></button><div class="dd-menu-sub"${acik ? '' : ' inert'}><div class="dd-menu-sub-in">${x.children.map(c => satir(c, true)).join('')}</div></div></div>`; };
  const kullanici = () => { if (!DD.uye()) return `<p class="dd-menu-hello"><b>Merhaba</b><span>Verilerini korumak ve takip etmek için giriş yap.</span></p><div class="dd-menu-auth">${DD.btn({metin: 'Giriş Yap', boyut: 'sm', attrs: 'data-menu-git="#/giris"'})}${DD.btn({metin: 'Üye Ol', tur: 'secondary', boyut: 'sm', attrs: 'data-menu-eylem="uye" data-menu-git=""'})}</div>`; const k = window.DDV?.kullanici || {}; return `<a class="dd-menu-profile" href="#/profil" data-menu-git="#/profil"><span class="dd-menu-avatar" aria-hidden="true">${esc(String(k.ad || 'D').slice(0, 1))}</span><span class="dd-menu-who"><b>${esc([k.ad, k.soyad].filter(Boolean).join(' ') || 'Profilim')}</b><small>${ik('hedef')} ${esc(String(k.hedefAd || '').split(' ').map(w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1)).join(' '))}</small></span><span class="dd-menu-go">Profilim ${ik('chevron-right')}</span></a><div class="dd-menu-shortcuts">${kisayollar().map(([g, i, t, n]) => `<a class="dd-menu-short" href="${g}" data-menu-git="${g}">${ik(i)}<span>${esc(t)}</span>${n ? `<b class="dd-menu-sayac">${n}</b>` : ''}</a>`).join('')}</div>`; };
  const ayak = () => `<footer class="dd-menu-foot"><div class="dd-menu-item dd-menu-group dd-menu-lang"><button class="dd-menu-row dd-menu-toggle" type="button" aria-expanded="false"><span class="dd-menu-ic">${ik('globe')}</span><span class="dd-menu-label">Dil: <b>${esc(dilAd())}</b></span><span class="dd-menu-chev">${ik('chevron-down')}</span></button><div class="dd-menu-sub" inert><div class="dd-menu-sub-in" role="radiogroup" aria-label="Dil">${DILLER.map(([k, d]) => { const on = k === dilKod(); return `<button class="dd-menu-row dd-menu-subrow dd-menu-lang-opt" type="button" role="radio" aria-checked="${on}" data-menu-dil="${k}"><span class="dd-menu-ic">${on ? ik('onay') : ''}</span><span class="dd-menu-label">${esc(d)}</span></button>`; }).join('')}</div></div></div><div class="dd-menu-meta"><div class="dd-menu-legal">${YASAL.map(([g, t]) => `<a href="${g}" data-menu-git="${g}"${g === aktif() ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</div></div></footer>`;
  // K6: yalnız profil ve hedef eşitlenir, sağlık verisi kapsam dışıdır.
  const bagliSheet = () => { const d = DD.durum.oku('bagli-uygulamalar', {}); return DD.sheet({
    baslik: 'Bağlı Uygulamalar',
    html: `<div class="dd-yigin">${DD.p('**Profilin ve hedefin** bağladığın uygulamalarla eşitlenir. Sağlık verilerin eşitlenmez.')}${DD.toggle({ad: 'bagli-gastro', ikon: 'utensils', etiket: 'Dada Gastro', secili: !!d.gastro})}${DD.toggle({ad: 'bagli-fit', ikon: 'dumbbell', etiket: 'Dada Fit', secili: !!d.fit})}</div>`,
    sonra: h => { [['bagli-gastro', 'gastro', 'Dada Gastro'], ['bagli-fit', 'fit', 'Dada Fit']].forEach(([ad, k, m]) => DD.on(h, ad, v => { DD.durum.yaz('bagli-uygulamalar', {...DD.durum.oku('bagli-uygulamalar', {}), [k]: v}); DD.toast(`**${m}** ${v ? 'bağlandı' : 'bağlantısı kapatıldı'}`, {ikon: 'arrows-rotate'}); })); }
  }); };
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
      if (t) { const g = t.closest('.dd-menu-group'), on = !g.classList.contains('is-open'); g.closest('.dd-menu-nav,.dd-menu-foot').querySelectorAll('.dd-menu-group').forEach(x => { const a = x === g && on; x.classList.toggle('is-open', a); x.querySelector('.dd-menu-toggle').setAttribute('aria-expanded', a); x.querySelector('.dd-menu-sub').inert = !a; }); if (on && g.classList.contains('dd-menu-lang')) setTimeout(() => g.scrollIntoView({block: 'end', behavior: DD.azHareket() ? 'auto' : 'smooth'}), DD.TK.motion.base); return; }
      const dl = e.target.closest('[data-menu-dil]'); if (dl) { e.preventDefault(); kapat(); const h = DD.durum.oku('hesap-ayar', {}) || {}; DD.durum.yaz('hesap-ayar', {...h, dil: {...(h.dil || {}), dil: dl.dataset.menuDil}}); DD.toast(`Dil: **${dl.textContent.trim()}**`, {tur: 'basari'}); return; }
      if (e.target.closest('[data-menu-yakinda]')) { e.preventDefault(); kapat(); DD.toast('Yakında', {ikon: 'bilgi'}); return; }
      const a = e.target.closest('[data-menu-git]');
      if (a) { e.preventDefault(); e.stopPropagation(); kapat(); if (a.dataset.menuEylem === 'cikis') DD.dialog({baslik: 'Çıkış yapılsın mı?', metin: 'Bu cihazdaki **kayıtların ve tercihlerin** silinir.', eylem: 'Çıkış yap', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) DD.cikis(); }); else if (a.dataset.menuEylem === 'bagli') bagliSheet(); else if (a.dataset.menuEylem === 'uye') DD.uyeDuvar(); else if (a.dataset.menuGit) DD.git(a.dataset.menuGit); }
    });
  };
  DD.menu = {ac, kapat};
})();
