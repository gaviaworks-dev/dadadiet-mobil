/* Dada Diet çekirdek (DD). Sözleşme: tasks/mimari.md §3, katalog: kanon/README.md.
   Ekran yığını, yönlendirme, üst bar kabuğu, alt menü, sheet, dialog, toast, kalıcı durum, Tabağım deposu ve bileşen etkileşimleri.
   Bileşen çizicileri dd-cizici.js ve dd-gosterge.js içinde; hepsi HTML string döner, etkileşim burada olay yetkilendirmesiyle çalışır.
   Değerler yalnız DD_TOKENS'tan gelir; sabit süre ya da renk yazılmaz. */
(() => {
  const TK = window.DD_TOKENS;
  const DD = window.DD = window.DD || {};
  DD.TK = TK;
  const M = TK.motion;
  const belge = document;

  // ---------- Küçük yardımcılar ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kisit = (v, a, b) => Math.min(b, Math.max(a, v));
  const ikonAd = k => TK.icons[k] || k;
  const ik = (ad, sinif = '') => `<i class="icon fa-solid fa-${esc(ikonAd(ad))}${sinif ? ' ' + sinif : ''}" aria-hidden="true"></i>`;
  const yay = (el, ad, detail) => el.dispatchEvent(new CustomEvent(ad, {bubbles: true, detail}));
  const degisim = (el, ad, deger, ek = {}) => yay(el, 'dd-degisim', {ad, deger, ...ek});

  // Ortak öznitelikler: git, geri, id, veri:{anahtar:değer}, attrs (ham string), etiket (aria-label).
  const at = (o = {}) => {
    let s = '';
    if (o.git) s += ` data-git="${esc(o.git)}"`;
    if (o.yerine) s += ` data-yerine="${esc(o.yerine)}"`;
    if (o.geri) s += ' data-geri';
    if (o.id) s += ` id="${esc(o.id)}"`;
    if (o.etiket) s += ` aria-label="${esc(o.etiket)}"`;
    if (o.veri) for (const [k, v] of Object.entries(o.veri)) s += ` data-${esc(k)}="${esc(v)}"`;
    if (o.attrs) s += ' ' + o.attrs;
    return s;
  };
  // **vurgu** → <b>; metin önce kaçırılır.
  const vurgu = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const sayi = n => Math.round(+n || 0).toLocaleString('tr-TR');
  const ondalik = (n, b = 1) => (+n || 0).toLocaleString('tr-TR', {maximumFractionDigits: b});
  const sure = dk => { const s = Math.floor(dk / 60), d = Math.round(dk % 60); return [s ? `${s} sa` : '', d || !s ? `${d} dk` : ''].filter(Boolean).join(' '); };
  const iki = n => String(n).padStart(2, '0');
  const saatMetin = dk => `${iki(Math.floor(dk / 60) % 24)}:${iki(Math.round(dk % 60))}`;
  const saatDk = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
  const paraTL = n => `${sayi(n)} TL`;

  Object.assign(DD, {esc, ik, at, vurgu, sayi, ondalik, sure, saatMetin, saatDk, paraTL, ikonAd, kisit, yay, degisim, azHareket});

  // Sabit an: uygulamanın şimdisi veriden gelir, canlı saat kullanılmaz.
  DD.simdi = () => {
    const b = window.DDV?.bugun, [y, a, g] = (b?.tarih || '2026-11-06').split('-').map(Number), [h, m] = (b?.simdi || '17:10').split(':').map(Number);
    return new Date(y, a - 1, g, h, m);
  };
  DD.bugunIso = () => window.DDV?.bugun?.tarih || '2026-11-06';

  DD.titres = (ms = 8) => { try { navigator.userActivation?.hasBeenActive && navigator.vibrate?.(ms); } catch { /* yok */ } };
  DD.tween = (ms, fn, bitti) => {
    if (azHareket() || !ms) { fn(1); bitti?.(); return () => {}; }
    let dur = false; const t0 = performance.now();
    const ease = t => 1 - (1 - t) ** 3;
    const adim = t => { if (dur) return; const p = kisit((t - t0) / ms, 0, 1); fn(ease(p)); if (p < 1) requestAnimationFrame(adim); else bitti?.(); };
    requestAnimationFrame(adim);
    return () => { dur = true; };
  };
  // Sayaç artışı: el içindeki sayıyı hedefe sayarak getirir. Biçim: data-ondalik varsa ondalıklı.
  DD.say = (el, hedef, o = {}) => {
    const b = o.ondalik ?? +(el.dataset.ondalik || 0), bas = o.bas ?? +(el.dataset.simdiki || 0);
    el.dataset.simdiki = hedef;
    DD.tween(o.sure ?? M.counter, p => { el.textContent = b ? ondalik(bas + (hedef - bas) * p, b) : sayi(bas + (hedef - bas) * p); });
  };

  // ---------- Kalıcı durum ----------
  DD.durum = {
    oku(k, d) { try { const v = localStorage.getItem('dd-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    yaz(k, v) { try { localStorage.setItem('dd-' + k, JSON.stringify(v)); } catch { /* özel pencere */ } return v; },
    sil(k) { try { localStorage.removeItem('dd-' + k); } catch { /* yok */ } },
    sifirla() { try { Object.keys(localStorage).filter(k => k.startsWith('dd-')).forEach(k => localStorage.removeItem(k)); } catch { /* yok */ } }
  };

  // Yalnız program detayında gerekli büyük veri: DD.yukleVeri('program-gunleri').then(...)
  const veriSoz = {};
  DD.yukleVeri = ad => veriSoz[ad] ||= new Promise((tamam, red) => {
    const s = belge.createElement('script');
    s.src = `veri/${ad}.js`; s.onload = () => tamam(window.DDV); s.onerror = () => { delete veriSoz[ad]; red(new Error(ad)); };
    belge.head.append(s);
  });

  // ---------- Ekran kaydı ve yönlendirme ----------
  const ekranlar = DD._ekranlar = {};
  DD.ekran = (ad, tanim) => { ekranlar[ad] = tanim; };

  const R = {yigin: [], sekmeler: {}, idx: 0, anim: [], hazir: false, sahne: null, yiginEl: null};
  const ust = () => R.yigin[R.yigin.length - 1];
  DD.aktif = () => ust() || null;

  const rotaBul = hash => {
    const [yol, q = ''] = hash.split('?');
    const sorgu = Object.fromEntries(new URLSearchParams(q));
    const tablo = window.DD_ROTALAR || {};
    if (tablo[yol]) return {ad: tablo[yol], param: {}, sorgu, hash};
    for (const [desen, ad] of Object.entries(tablo)) {
      if (!desen.includes(':')) continue;
      const adlar = [];
      const re = new RegExp('^' + desen.replace(/:[^/]+/g, m => { adlar.push(m.slice(1)); return '([^/]+)'; }) + '$');
      const m = yol.match(re);
      if (m) return {ad, param: Object.fromEntries(adlar.map((k, i) => [k, decodeURIComponent(m[i + 1])])), sorgu, hash};
    }
    return {ad: 'hata', param: {}, sorgu: {tur: 'bulunamadi', ...sorgu}, hash};
  };

  // Kayıtsız ya da hatalı ekran: kanon hata ekranı kendi içinden çizilir.
  const hataTanim = {
    tur: 'tam',
    ciz: ctx => DD.hataEkran({tur: ctx.sorgu.tur || 'bulunamadi', eylem: {metin: 'Bugün’e dön', yerine: '#/bugun'}})
  };

  const barAyar = (e, ctx) => {
    const verilen = (typeof e.ustBar === 'function' ? e.ustBar(ctx) : e.ustBar) || {};
    return {tur: e.tur || 'alt', baslik: typeof e.baslik === 'function' ? e.baslik(ctx) : e.baslik, ...verilen};
  };

  // Misafir ve üye (MBL-FLW-v2.1): oturum yoksa misafirdir. Misafirin yaptıkları cihazda 'yeni-*' anahtarlarında durur, üye olunca aynen kalır.
  try { if (/[?&]uye=1\b/.test(location.hash)) DD.durum.yaz('oturum', {yol: 'giris'}); } catch { /* yok */ }
  DD.uye = () => !!DD.durum.oku('oturum');
  DD.yeniHesap = () => !DD.uye() || !!DD.durum.oku('oturum')?.misafirden;
  // Profil bilgisi olmadan kalori hedefi gösterilmez (K8): hedef kısa hesaplamadan ya da onboarding planından gelir.
  DD.hedefsiz = () => DD.yeniHesap() && !DD.durum.oku('plan') && !DD.durum.oku('kisa-hedef');
  DD.UYE_KILIT = {
    tabaklarim: {ikon: 'tabak', baslik: 'Tabakların burada birikir', metin: 'Çektiğin tabakları **görsel arşivinde** saklamak için giriş yap.'},
    saglik: {ikon: 'file-medical', baslik: 'Sağlık dosyan', metin: 'Geçmiş günlerin **trendini** görmek için ücretsiz profil oluştur.'},
    profil: {ikon: 'user', baslik: 'Profilin', metin: 'Hedeflerini ve **verilerini** korumak için ücretsiz profil oluştur.'},
    'uzman-sohbet': {ikon: 'comment-dots', baslik: 'Diyetisyeninle yazış', metin: 'Diyetisyeninle **doğrudan iletişim** kurmak için kaydol.'},
    // Üye alanı (web Hesabım eşi): misafire kapalı, tek metin
    ...Object.fromEntries(['ogun-saatleri', 'ayarlar', 'tercihler', 'veri-izinleri', 'programlarim', 'kaydedilenler', 'rozetler', 'haftalik-menu', 'beslenme-plani', 'destek-gruplari', 'cozum-merkezi', 'paketlerim', 'odemelerim'].map(ad => [ad, {ikon: 'user', baslik: 'Üye alanı', metin: 'Bu bölüm **hesabına bağlı** çalışır; ücretsiz profil oluştur ya da giriş yap.'}]))
  };
  const SSO = [{yol: 'apple', metin: 'Apple ile devam et', marka: 'apple'}, {yol: 'google', metin: 'Google ile devam et', gorsel: 'assets/marka/sosyal/google.svg'}];
  // K10: aktarım açık rızaya bağlıdır; rıza yoksa veri cihazda kalır. Metin hukuk onayına kadar taslaktır.
  const rizaSheet = yol => DD.sheet({
    baslik: 'Verilerin hesabına geçsin mi?', zorunlu: true,
    html: `<div class="dd-yigin">${DD.durumRozet({metin: 'Taslak metin · Hukuk onayı bekliyor', ton: 'uyari', ikon: 'clock'})}${DD.p('Bu cihaza girdiğin **su, duygu, öğün ve tabak fotoğrafları** sağlık verisi sayılır. Hesabına aktarılması için **açık rızan** gerekir. Rıza vermezsen hesabın açılır, veriler yalnız bu cihazda kalır.')}</div>`,
    altBar: `<div class="dd-yigin-8">${DD.btn({metin: 'Açık rıza veriyorum, aktar', tam: true, veri: {eylem: 'riza-evet'}})}${DD.btn({metin: 'Aktarma, cihazda kalsın', tur: 'text', tam: true, veri: {eylem: 'riza-hayir'}})}</div>`,
    sonra: h => {
      const bitir = riza => { DD.durum.yaz('oturum', {yol, misafirden: true, riza}); DD.durum.yaz('veri-izinleri', {riza}); h.kapat(); DD.tazele(); DD.toast(riza ? 'Bugünkü kayıtların **hesabına aktarıldı**' : 'Hesabın açıldı, kayıtların **bu cihazda kaldı**', {tur: 'basari'}); };
      const a = DD.eylem(h, 'riza-evet', () => bitir(true)), b = DD.eylem(h, 'riza-hayir', () => bitir(false));
      return () => { a(); b(); };
    }
  });
  DD.uyeDuvar = (o = {}) => DD.sheet({
    baslik: o.baslik || 'Verilerini koru',
    html: `<div class="dd-yigin">${DD.p(o.metin || 'Verilerini ve çektiğin tabağı buluta yedeklemek için **10 saniyede** üye ol.')}<div class="dd-yigin-8">${SSO.map(b => DD.btn({...b, tur: 'secondary', tam: true, veri: {eylem: 'uye-sso', id: b.yol}})).join('')}${DD.btn({metin: 'E-posta ile devam et', tur: 'text', tam: true, veri: {eylem: 'uye-eposta'}})}</div></div>`,
    altBar: DD.btn({metin: 'Şimdi değil', tur: 'text', tam: true, attrs: 'data-sheet-kapat'}),
    sonra: h => {
      const a = DD.eylem(h, 'uye-sso', el => { const yol = el.dataset.id; h.kapat(); rizaSheet(yol); });
      const b = DD.eylem(h, 'uye-eposta', () => { h.kapat(); DD.git('#/karsilama'); });
      return () => { a(); b(); };
    }
  });
  // Kayıt kancası: misafire özelliğin üye tarafını söyleyen tek satır.
  DD.kanca = (o = {}) => `<button type="button" class="dd-kanca" data-uye-ol="${esc(o.metin)}">${ik(o.ikon || 'lock')}<span>${esc(o.metin)}</span>${ik('chevron-right')}</button>`;

  const ciz = g => {
    const {e, ctx, el} = g;
    g.temizle?.(); g.temizle = null;
    let bar = '', icerik = '', alt = '';
    const kilit = !DD.uye() && DD.UYE_KILIT[g.ad], bekliyor = !kilit && e.yukle && !g.yuklendi;
    try {
      if ((e.tur || 'alt') !== 'tam') bar = DD.ustBar(kilit ? (e.dock ? {tur: 'sekme'} : {tur: 'alt', baslik: kilit.baslik}) : barAyar(e, ctx));
      icerik = kilit ? DD.bos({tam: true, ikon: kilit.ikon, baslik: kilit.baslik, metin: kilit.metin, eylem: {metin: 'Üye ol', veri: {'uye-ol': kilit.metin.replace(/\*\*/g, '')}}, ikincil: {metin: 'Giriş yap', git: '#/karsilama'}}) : bekliyor ? DD.iskelet(e.iskelet || 'ekran') : e.ciz(ctx);
      if (!kilit && !bekliyor && e.altBar) alt = e.altBar(ctx) || '';
    } catch (hata) {
      console.error(`[ekran ${g.ad}]`, hata);
      icerik = DD.hataEkran({tur: 'genel', eylem: {metin: 'Bugün’e dön', yerine: '#/bugun'}, ikinciller: []});
    }
    el.innerHTML = `${bar}<div class="dd-kaydir"><div class="dd-icerik">${icerik}</div></div>${alt ? `<div class="dd-altbar">${alt}</div>` : ''}`;
    if (window.DDMetin) DDMetin.isle(el);
    el.classList.toggle('has-saydam', !!el.querySelector('.dd-header.is-photo'));
    el.classList.toggle('has-altbar', !!alt);
    el.classList.toggle('has-ust', !!bar);
    if (!el.classList.contains('is-gizli')) el.querySelector('.dd-kaydir').setAttribute('data-scroll', '');
    baglaKaydirma(g);
    if (bekliyor) {
      Promise.resolve().then(() => e.yukle(ctx)).then(() => { g.yuklendi = true; if (g.el.isConnected) ciz(g); })
        .catch(() => { el.querySelector('.dd-icerik').innerHTML = DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', veri: {'dd-tazele': 1}}}); });
      return;
    }
    if (!kilit && e.sonra) { try { g.temizle = e.sonra(el, ctx) || null; } catch (hata) { console.error(`[ekran ${g.ad}]`, hata); } }
    DD.tabagim._bar();
  };

  // Üst bar alfası Gastro bannerHeader, panel yapışması kubbeYapis ile aynı kural; kaydırıcı ekrana özeldir.
  const baglaKaydirma = g => {
    const k = g.el.querySelector('.dd-kaydir'), bar = g.el.querySelector('.dd-header'), panel = g.el.querySelector('.dd-panel');
    const altbar = g.el.querySelector('.dd-altbar');
    if (altbar) {
      const olc = () => { g.el.style.setProperty('--dd-altbar-h', `${altbar.offsetHeight}px`); if (ust() === g) DD.tabagim._bar(); };
      olc(); new ResizeObserver(olc).observe(altbar);
    }
    const foto = bar?.classList.contains('is-photo');
    const esikEl = () => g.el.querySelector('.dd-banner-metin .dd-t-label,.dd-banner-metin h1,.dd-hero-top h1,.dd-gkapak [data-dd-veil-from],.dd-gkapak h1') || g.el.querySelector('.dd-banner-metin');
    const kayan = g.el.querySelector('.dd-kayan');
    const guncelle = () => {
      const y = k.scrollTop, r0 = k.getBoundingClientRect();
      if (foto) {
        const e = esikEl(), h = bar.offsetHeight;
        const esik = e ? Math.max(1, Math.min(TK.space[48], e.getBoundingClientRect().top - r0.top + y - h - TK.space[8])) : TK.space[48];
        const a = azHareket() ? (y > 0 ? 1 : 0) : kisit(y / esik, 0, 1);
        bar.style.setProperty('--dd-alfa', a.toFixed(3));
        bar.classList.toggle('is-saydam', a < 1);
      }
      if (panel) panel.classList.toggle('is-yapisik', panel.getBoundingClientRect().top - r0.top <= (bar ? bar.offsetHeight : 0) + 1);
      DD._kalipKaydir?.(g, k, bar);
      if (kayan) { const on = panel ? panel.offsetTop - (bar?.offsetHeight || 0) < y : y > TK.size.banner; kayan.classList.toggle('is-gorunur', on); kayan.inert = !on; }
    };
    k.addEventListener('scroll', guncelle, {passive: true});
    guncelle();
    cekYenileBagla(g, k);
  };

  const giris = r => {
    const e = ekranlar[r.ad] || hataTanim;
    const ctx = {ad: r.ad, param: r.param, sorgu: r.sorgu, hash: r.hash, durum: DD.durum};
    const el = belge.createElement('section');
    el.className = `dd-ekran dd-ekran--${e.tur || 'alt'}`;
    el.dataset.ekran = r.ad;
    return {i: R.idx, hash: r.hash, ad: r.ad, e, ctx, el, temizle: null};
  };

  // Geçiş: ileri sağdan, geri soldan, modal aşağıdan, sekme çapraz solma.
  const bitir = () => { R.anim.splice(0).forEach(a => { try { a.finish(); } catch { /* bitmiş */ } }); };
  const oynat = (el, kf, ms, easing) => {
    const a = el.animate(kf, {duration: azHareket() ? 0 : ms, easing, fill: 'none'});
    R.anim.push(a);
    return a.finished.catch(() => {});
  };
  const gizle = el => { el.classList.add('is-gizli'); el.inert = true; el.querySelector('.dd-kaydir')?.removeAttribute('data-scroll'); };
  const goster = el => { el.classList.remove('is-gizli'); el.inert = false; el.querySelector('.dd-kaydir')?.setAttribute('data-scroll', ''); };

  const gecis = (yeni, eski, yon) => {
    const E = M.easing, X = 'translateX(100%)', G = 'translateX(-24%)', Y = 'translateY(100%)', S = 'translate(0)';
    const isler = [];
    if (yon === 'ileri') {
      isler.push(oynat(yeni, [{transform: X}, {transform: S}], M.page, E.emphasizedDecel));
      if (eski) isler.push(oynat(eski, [{transform: S, filter: 'brightness(1)'}, {transform: G, filter: 'brightness(.92)'}], M.page, E.emphasizedDecel));
    } else if (yon === 'geri') {
      if (eski) { eski.style.zIndex = 2; isler.push(oynat(eski, [{transform: S}, {transform: X}], M.pageExit + M.stagger, E.standard)); }
      isler.push(oynat(yeni, [{transform: G, filter: 'brightness(.92)'}, {transform: S, filter: 'brightness(1)'}], M.pageExit + M.stagger, E.standard));
    } else if (yon === 'modal') {
      yeni.style.zIndex = 2;
      isler.push(oynat(yeni, [{transform: Y}, {transform: S}], M.page, E.emphasizedDecel));
    } else if (yon === 'modal-kapat') {
      if (eski) { eski.style.zIndex = 2; isler.push(oynat(eski, [{transform: S}, {transform: Y}], M.pageExit, E.emphasizedAccel)); }
    } else {
      isler.push(oynat(yeni, [{opacity: 0}, {opacity: 1}], M.quick, E.standard));
    }
    return Promise.all(isler);
  };

  const dockGuncelle = g => {
    const e = g.e, goster_ = (e.tur === 'sekme') || e.dock === true;
    R.sahne.classList.toggle('has-dock', goster_);
    const aktif = e.nav || (e.tur === 'sekme' ? g.ad : '');
    R.sahne.querySelectorAll('.dd-nav [data-nav]').forEach(a => { a.dataset.nav === aktif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    DD.tabagim._bar();
  };

  // Yeniden eklemek kaydırma konumunu sıfırlar: sekme ekranı DOM'da kalır, üste z-index ile gelir.
  const sok = g => { if (g.el.parentNode !== R.yiginEl) R.yiginEl.append(g.el); };
  // Sekme ekranı DOM'da kalır: sonra bağları ve temizleme yaşar, yalnız görünümden çekilir. Temizleme ekran kapanınca ya da yeniden çizilince çalışır.
  const kaldir = g => { if (g.e.tur === 'sekme') { if (!R.yigin.includes(g)) gizle(g.el); return; } g.temizle?.(); g.temizle = null; g.el.remove(); };
  // Üstten çekilme: üstüne ekran açıldı, sekme değişti ya da kapanıyor. donus ile çifttir.
  const gizlendi = g => { if (!g || g.gizli) return; g.gizli = true; try { g.e.gizlen?.(g.el, g.ctx); } catch (hata) { console.error(`[ekran ${g.ad}]`, hata); } };

  const sekmeGiris = r => {
    let g = R.sekmeler[r.ad];
    if (g) { g.i = R.idx; g.hash = r.hash; g.donus = true; return g; }
    g = giris(r); R.sekmeler[r.ad] = g; return g;
  };

  const donus = g => { const geldi = g.gizli; g.gizli = false; DD.zilTazele?.(); if (g.e.yenile) { const k = g.el.querySelector('.dd-kaydir'), y = k?.scrollTop || 0; ciz(g); const k2 = g.el.querySelector('.dd-kaydir'); if (k2) k2.scrollTop = y; } if (geldi) g.e.donus?.(g.el, g.ctx); };

  const goruntule = (r, yon, degistir) => {
    bitir();
    const e = ekranlar[r.ad] || hataTanim;
    const eski = ust();
    if (e.tur === 'sekme') {
      const g = sekmeGiris(r), ilk = !g.el.childElementCount;
      if (eski !== g) gizlendi(eski);
      const atilacak = R.yigin.filter(x => x !== g);
      R.yigin = [g];
      sok(g); goster(g.el); g.el.style.zIndex = 3;
      if (ilk) ciz(g); else donus(g);
      dockGuncelle(g);
      gecis(g.el, eski?.el, 'solma').then(() => { g.el.style.zIndex = ''; atilacak.forEach(x => { kaldir(x); x.el.style.zIndex = ''; }); });
      return;
    }
    const g = giris(r);
    gizlendi(eski);
    if (degistir && eski) R.yigin.pop();
    if (yon === 'yeni') { const atilacak = R.yigin.splice(0); gecisSonuTemizle(atilacak); }
    R.yigin.push(g);
    sok(g); goster(g.el); ciz(g); dockGuncelle(g);
    const y = e.tur === 'modal' && yon === 'ileri' ? 'modal' : degistir ? 'solma' : yon;
    gecis(g.el, eski?.el, y === 'yeni' ? 'solma' : y).then(() => {
      g.el.style.zIndex = '';
      if (degistir && eski) kaldir(eski);
      else if (eski && eski.el.isConnected && eski !== g) gizle(eski.el);
    });
  };
  const gecisSonuTemizle = liste => { setTimeout(() => liste.forEach(kaldir), azHareket() ? 0 : M.page); };

  const geriDon = hedefI => {
    bitir();
    const eski = ust();
    gizlendi(eski);
    let n = R.yigin.findIndex(x => x.i === hedefI);
    const atilan = R.yigin.splice(n + 1);
    const g = ust();
    goster(g.el); g.el.style.zIndex = '';
    dockGuncelle(g);
    donus(g);
    gecis(g.el, eski.el, eski.e.tur === 'modal' ? 'modal-kapat' : 'geri').then(() => { atilan.forEach(x => { kaldir(x); x.el.style.zIndex = ''; }); });
  };

  DD.git = hash => {
    if (!R.hazir) { location.hash = hash; return; }
    katmanlariKapat();
    if (ust()?.hash === hash) { ust().el.querySelector('.dd-kaydir')?.scrollTo({top: 0, behavior: azHareket() ? 'auto' : 'smooth'}); return; }
    R.idx += 1;
    history.pushState({dd: R.idx}, '', hash);
    goruntule(rotaBul(hash), 'ileri');
  };
  DD.yerine = hash => {
    if (!R.hazir) { location.replace(hash); return; }
    katmanlariKapat();
    history.replaceState({dd: R.idx}, '', hash);
    goruntule(rotaBul(hash), 'yeni');
  };
  DD.geri = (yedek = '#/bugun') => {
    if (!R.hazir) { history.back(); return; }
    katmanlariKapat();
    if (R.yigin.length > 1) { history.back(); return; }
    const hedef = ust()?.e.ust || yedek;
    history.replaceState({dd: R.idx}, '', hedef);
    goruntule(rotaBul(hedef), 'geri', true);
  };
  DD.tazele = () => { const g = ust(); if (!g) return; const y = g.el.querySelector('.dd-kaydir')?.scrollTop || 0; ciz(g); const k = g.el.querySelector('.dd-kaydir'); if (k) k.scrollTop = y; };

  addEventListener('popstate', ev => {
    if (!R.hazir) return;
    if (katmanVar()) { katmanlariKapat(); history.pushState({dd: R.idx}, '', ust()?.hash || location.hash); return; }
    const hash = location.hash || '#/bugun', i = ev.state?.dd;
    if (i == null) { R.idx += 1; history.replaceState({dd: R.idx}, '', hash); goruntule(rotaBul(hash), 'ileri'); return; }
    const onceki = R.idx; R.idx = i;
    if (i < onceki && R.yigin.some(x => x.i === i) && ust().i !== i) geriDon(i);
    else if (ust()?.hash !== hash) goruntule(rotaBul(hash), i < onceki ? 'geri' : 'ileri', i < onceki);
  });

  // ---------- Açılış ----------
  const yukleSirayla = dosyalar => Promise.all(dosyalar.map(ad => new Promise(bitti => {
    const s = belge.createElement('script');
    s.src = `ekranlar/${ad}.js`; s.async = false; s.onload = s.onerror = () => bitti();
    belge.head.append(s);
  })));

  DD.baslat = async () => {
    R.sahne = belge.getElementById('dd-sahne');
    R.sahne.innerHTML = `<div class="dd-ekranlar" id="dd-ekranlar"></div>${DD.altMenu()}<div class="dd-tabagim-kat" id="dd-tabagim"></div><div class="dd-katman" id="dd-katman"></div>`;
    R.yiginEl = belge.getElementById('dd-ekranlar');
    await yukleSirayla(window.DD_EKRAN_DOSYALARI || []);
    R.hazir = true;
    const hash = location.hash && location.hash.length > 2 ? location.hash : '#/splash';
    history.replaceState({dd: 0}, '', hash);
    goruntule(rotaBul(hash), 'yeni');
  };

  // ---------- Katmanlar: sheet, dialog, toast ----------
  const katmanEl = () => {
    let k = belge.getElementById('dd-katman');
    if (!k) { k = belge.createElement('div'); k.id = 'dd-katman'; k.className = 'dd-katman is-serbest'; belge.body.append(k); }
    return k;
  };
  const acik = [];
  const katmanVar = () => acik.length > 0;
  const katmanlariKapat = () => { [...acik].reverse().forEach(a => a.kapat()); };

  const odakKapani = (kok, ev) => {
    if (ev.key !== 'Tab') return;
    const f = [...kok.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) { ev.preventDefault(); return; }
    const a = f[0], z = f[f.length - 1];
    if (ev.shiftKey && belge.activeElement === a) { ev.preventDefault(); z.focus(); }
    else if (!ev.shiftKey && belge.activeElement === z) { ev.preventDefault(); a.focus(); }
  };

  // Sheet: Gastro DG.sheet işaretlemesi; telefon kolonunda kalsın diye <dialog> yerine katman. Dönen öğe d: d.kapat(), 'close' olayı, d.kok.
  DD.sheet = (o = {}) => {
    const kat = katmanEl(), onceki = belge.activeElement;
    const kap = belge.createElement('div');
    kap.className = 'dd-sheet-kap';
    const govde = o.html ?? o.govde ?? '', ayak = o.altBar ?? o.ayak ?? '';
    kap.innerHTML = `<div class="dd-perde" data-sheet-perde></div>
      <div class="dd-sheet${o.tam ? ' is-tam' : ''}${o.zorunlu ? ' is-zorunlu' : ''}${o.sinif ? ' ' + esc(o.sinif) : ''}" open role="dialog" aria-modal="true" aria-label="${esc(o.baslik || 'Sayfa')}" tabindex="-1"><div class="dd-tutamak" aria-hidden="true"></div><div class="dd-sheet-bas"><h2 class="dd-t-sheet">${esc(o.baslik || '')}</h2>${o.zorunlu ? '' : `<button class="dd-ibtn" type="button" data-sheet-kapat aria-label="Kapat">${ik('kapat')}</button>`}</div><div class="dd-sheet-govde">${govde}</div>${ayak ? `<div class="dd-sheet-ayak">${ayak}</div>` : ''}</div>`;
    kat.append(kap);
    const d = kap.querySelector('.dd-sheet'), perde = kap.querySelector('.dd-perde');
    if (window.DDMetin) DDMetin.isle(d);
    let bitti = false, temizle = null;
    d.kapat = sonuc => {
      if (bitti) return; bitti = true;
      acik.splice(acik.indexOf(d), 1);
      temizle?.();
      const son = () => { kap.remove(); d.dispatchEvent(new Event('close')); o.kapaninca?.(sonuc); };
      d.classList.add('is-cikis'); perde.classList.add('is-cikis');
      setTimeout(son, azHareket() ? 0 : M.pageExit);
      if (onceki?.isConnected) onceki.focus?.({preventScroll: true});
    };
    d.kok = d;
    acik.push(d);
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !o.zorunlu) d.kapat(); odakKapani(d, ev); });
    kap.addEventListener('click', ev => { if (ev.target.closest('[data-sheet-kapat]') || (ev.target.hasAttribute('data-sheet-perde') && !o.zorunlu)) d.kapat(); });
    // Tutma çubuğundan aşağı sürükle: yarı yükseklik ya da hızlı fırlatma kapatır (Gastro kuralı).
    let y0 = null, t0 = 0;
    const tut = d.querySelector('.dd-tutamak');
    tut.addEventListener('pointerdown', ev => { if (o.zorunlu) return; y0 = ev.clientY; t0 = performance.now(); tut.setPointerCapture(ev.pointerId); d.style.transition = 'none'; });
    tut.addEventListener('pointermove', ev => { if (y0 != null) d.style.transform = `translateY(${Math.max(0, ev.clientY - y0)}px)`; });
    tut.addEventListener('pointerup', ev => { if (y0 == null) return; const dy = ev.clientY - y0, v = dy / Math.max(1, performance.now() - t0); y0 = null; d.style.transition = ''; d.style.transform = ''; if (dy > d.offsetHeight / 2 || v > .7) d.kapat(); });
    d.focus({preventScroll: true});
    if (o.sonra) { const t = o.sonra(d, d); if (typeof t === 'function') temizle = t; }
    return d;
  };

  // Onay: Gastro DG.onay işaretlemesi. Promise<bool>. {baslik, metin, eylem, iptal, yikici}
  DD.dialog = (o = {}) => new Promise(coz => {
    const kat = katmanEl(), onceki = belge.activeElement;
    const kap = belge.createElement('div');
    kap.className = 'dd-dialog-kap';
    kap.innerHTML = `<div class="dd-perde" data-dlg-iptal></div><div class="dd-diyalog" open role="alertdialog" aria-modal="true" aria-label="${esc(o.baslik || '')}" tabindex="-1"><h2 class="dd-t-sheet">${esc(o.baslik || '')}</h2>${o.metin ? `<p>${vurgu(o.metin)}</p>` : ''}${o.html || ''}<div class="${o.iptal === false ? '' : 'dd-ikili'}">${o.iptal === false ? '' : DD.btn({metin: o.iptal || 'İptal', tur: 'secondary', veri: {'dlg-iptal': 1}})}${DD.btn({metin: o.eylem || 'Tamam', tur: o.yikici ? 'yikici' : 'primary', tam: o.iptal === false, veri: {'dlg-tamam': 1}})}</div></div>`;
    kat.append(kap);
    const d = kap.querySelector('.dd-diyalog');
    const h = {kapat(v = false) { acik.splice(acik.indexOf(h), 1); kap.remove(); if (onceki?.isConnected) onceki.focus?.({preventScroll: true}); coz(v); }};
    acik.push(h);
    kap.addEventListener('click', ev => { if (ev.target.closest('[data-dlg-tamam]')) h.kapat(true); else if (ev.target.closest('[data-dlg-iptal]')) h.kapat(false); });
    kap.addEventListener('keydown', ev => { if (ev.key === 'Escape') h.kapat(false); odakKapani(d, ev); });
    d.focus({preventScroll: true});
  });

  // Snackbar: Gastro DG.bildir işaretlemesi, sırası korunur. DD.toast('Metin', {tur, ikon, eylem, onEylem, sure})
  const toastSira = []; let toastAcik = false, toastBitir = null;
  DD.toastKapat = () => toastBitir?.();
  DD.toast = (metin, o = {}) => { if (o.yerine) { toastSira.length = 0; DD.toastKapat(); } toastSira.push({metin, o}); toastCal(); };
  const toastCal = () => {
    if (toastAcik || !toastSira.length) return;
    toastAcik = true;
    const {metin, o} = toastSira.shift(), kat = katmanEl();
    const ikon = o.ikon || {basari: 'basari', uyari: 'uyari', hata: 'hata', bilgi: 'bilgi'}[o.tur];
    const el = belge.createElement('div');
    el.className = 'dd-snack'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = `${ikon ? ik(ikon) : ''}<span>${vurgu(metin)}</span>${o.eylem ? `<button type="button">${esc(o.eylem)}</button>` : ''}`;
    const g = ust();
    if (g) el.style.setProperty('--dd-snack-alt', `${(R.sahne.classList.contains('has-dock') ? TK.size.navBar + TK.size.navBottom + TK.space[12] : TK.space[16]) + (g.el.querySelector('.dd-altbar')?.offsetHeight || 0) + (R.sahne.classList.contains('has-tabagim') && !R.sahne.classList.contains('has-tabagim-ust') ? TK.size.tabagimBar + TK.space[8] : 0)}px`);
    kat.append(el);
    requestAnimationFrame(() => el.classList.add('is-on'));
    let bitti = false;
    const kapat = () => {
      if (bitti) return; bitti = true; clearTimeout(z);
      el.classList.remove('is-on');
      setTimeout(() => { el.remove(); toastAcik = false; toastCal(); }, azHareket() ? 0 : M.base);
    };
    toastBitir = kapat;
    const z = setTimeout(kapat, o.sure ?? (o.eylem ? M.toastAction : M.toast));
    el.querySelector('button')?.addEventListener('click', () => { o.onEylem?.(); kapat(); });
  };

  // ---------- Tabağım: fotoğraf, barkod, ses ve aramadan gelenler aynı taslakta birikir ----------
  const tKey = 'tabagim', mKey = 'tabagim-meta', META = ['foto', 'not', 'kaynak', 'guven'];
  DD.tabagim = {
    liste: () => DD.durum.oku(tKey, []),
    toplam() { const l = this.liste(); return {adet: l.length, kcal: l.reduce((a, x) => a + (x.kcal || 0), 0), P: l.reduce((a, x) => a + (x.P || 0), 0), K: l.reduce((a, x) => a + (x.K || 0), 0), Y: l.reduce((a, x) => a + (x.Y || 0), 0), Lif: l.reduce((a, x) => a + (x.Lif || 0), 0)}; },
    // Tabağa ait tek meta. Argümansız okur, verilen alanları yazar; kayıt ya da temizlikte silinir.
    meta(m) { if (m === undefined) return DD.durum.oku(mKey, {}); return DD.durum.yaz(mKey, {...this.meta(), ...m}); },
    ekle(oge) { const m = Object.fromEntries(META.filter(k => oge[k] != null).map(k => [k, oge[k]])); if (Object.keys(m).length) this.meta({...m, ...this.meta()}); const l = this.liste(); l.push({id: `t${Date.now()}${l.length}`, ...oge}); DD.durum.yaz(tKey, l); this._bar(); yay(belge, 'dd-tabagim', {liste: l}); return l; },
    cikar(id) { const l = this.liste().filter(x => x.id !== id); DD.durum.yaz(tKey, l); if (!l.length) DD.durum.sil(mKey); this._bar(); yay(belge, 'dd-tabagim', {liste: l}); return l; },
    temizle() { DD.durum.sil(tKey); DD.durum.sil(mKey); this._bar(); yay(belge, 'dd-tabagim', {liste: []}); },
    ac(o = {}) {
      const ciz_ = () => DD.tabagimListe(this.liste());
      return DD.sheet({baslik: 'Tabağım', html: ciz_(), altBar: DD.btn({metin: o.eylem || 'Öğüne ekle', ikon: 'onay', tam: true, veri: {'tabagim-kaydet': 1}}), sonra: (k, h) => {
        k.addEventListener('click', ev => {
          const sil = ev.target.closest('[data-tabagim-cikar]');
          if (sil) { this.cikar(sil.dataset.tabagimCikar); k.querySelector('.dd-sheet-govde').innerHTML = ciz_(); if (!this.liste().length) h.kapat(); }
          if (ev.target.closest('[data-tabagim-kaydet]')) { const l = this.liste(), t = this.toplam(), m = this.meta(); yay(belge, 'dd-tabagim-kaydet', {liste: l, toplam: t, meta: m, ...m}); this.temizle(); h.kapat(); DD.toast(`Öğüne eklendi: **${sayi(t.kcal)} kcal**`, {tur: 'basari', eylem: 'Tabaklarım', onEylem: () => DD.git('#/tabaklarim')}); }
        });
      }});
    },
    _bar() {
      const kat = belge.getElementById('dd-tabagim'); if (!kat) return;
      const g = ust(), t = this.toplam();
      const goster_ = t.adet && g && (g.e.tabagim === true || g.e.tabagim === 'ust' || (g.e.tabagim !== false && g.e.tur !== 'tam'));
      R.sahne.classList.toggle('has-tabagim-ust', !!goster_ && g.e.tabagim === 'ust');
      kat.innerHTML = goster_ ? DD.tabagimBar({adet: t.adet, kcal: t.kcal, ogeler: this.liste()}) : '';
      R.sahne.classList.toggle('has-tabagim', !!goster_);
      if (g) kat.style.setProperty('--dd-tabagim-alt', `${g.el.querySelector('.dd-altbar')?.offsetHeight || 0}px`);
    }
  };

  // Çıkış: DOM'da kalan sekmeler eski çizimi taşımasın diye uygulama baştan yüklenir. replaceState hashchange atmaz, router yarışmaz.
  DD.cikis = () => { DD.tabagim.temizle(); DD.durum.sifirla(); history.replaceState(null, '', '#/bugun'); location.reload(); };

  // ---------- Çekerek yenile ----------
  const cekYenileBagla = (g, k) => {
    if (!g.e.cekYenile) return;
    const y = belge.createElement('div');
    y.className = 'dd-yenile'; y.setAttribute('role', 'status'); y.setAttribute('aria-label', 'Yenileniyor'); y.innerHTML = ik('rotate-right');
    g.el.append(y);
    let y0 = null, d = 0;
    k.addEventListener('touchstart', ev => { if (k.scrollTop > 0) return; y0 = ev.touches[0].clientY; d = 0; y.classList.remove('is-birak'); }, {passive: true});
    k.addEventListener('touchmove', ev => { if (y0 == null) return; d = Math.max(0, ev.touches[0].clientY - y0); if (!d) return; y.classList.add('is-gorunur'); y.style.setProperty('--dd-cek', `${Math.min(TK.space[48] * 2, d / 2)}px`); }, {passive: true});
    k.addEventListener('touchend', async () => {
      if (y0 == null) return; y0 = null; y.classList.add('is-birak');
      if (d / 2 >= TK.space[48]) {
        y.style.setProperty('--dd-cek', `${TK.space[64]}px`); y.classList.add('is-donuyor');
        await g.e.cekYenile(g.ctx);
        DD.tazele(); DD.toast('Güncellendi');
      } else { y.style.setProperty('--dd-cek', '0px'); y.classList.remove('is-gorunur'); }
    });
  };

  // ---------- Canlandırma: yeni çizilen bileşenleri otomatik uyandırır ----------
  const sayaclar = new Set();
  setInterval(() => { sayaclar.forEach(el => { if (!el.isConnected) { sayaclar.delete(el); return; } sayacAdim(el, !!el.closest('.is-gizli')); }); }, 1000);

  const sayacMetin = s => { s = Math.max(0, Math.round(s)); return `${iki(Math.floor(s / 3600))}:${iki(Math.floor(s / 60) % 60)}:${iki(s % 60)}`; };
  DD.sayacMetin = sayacMetin;
  const rakamlar = m => [...m].map(c => (c === ':' ? '<span class="dd-rakam-ayrac">:</span>' : `<span class="dd-rakam">${c}</span>`)).join('');
  DD.rakamlar = rakamlar;
  // Gizli sekmede sayım sürer, yalnız çizim atlanır: dönüşte geçen süre kaybolmaz.
  const sayacAdim = (el, sessiz) => {
    const yon = +(el.dataset.yon || 1), s = (+el.dataset.saniye) + yon;
    el.dataset.saniye = s;
    if (sessiz) return;
    if (el.dataset.c === 'geri') { DD._geriSayimCiz?.(el, s); return; }
    el.innerHTML = DD.sayacHtml(s);
  };

  const yayAc = el => {
    const son = +el.dataset.uzun, gecik = +(el.dataset.gecik || 0);
    if (azHareket()) return;
    el.setAttribute('stroke-dasharray', `0 ${el.dataset.tur || 100}`);
    el.style.visibility = 'hidden';
    setTimeout(() => { el.style.visibility = ''; DD.tween(M.dolum, p => el.setAttribute('stroke-dasharray', `${son * p} ${el.dataset.tur || 100}`)); }, gecik);
  };

  // Görsel yer tutucu, kayan gösterge, sayaç artışı, sıralı belirme: Gastro hareketBaslat parçaları.
  const GORSEL_SEC = '.dd-photo,.dd-puf-foto,.dd-mod-foto,.dd-kucuk-foto,.dd-blok-foto,.dd-banner-foto,.dd-secim-foto';
  const gorselHazirla = kok => kok.querySelectorAll(GORSEL_SEC).forEach(el => {
    if (el.dataset.gorsel) return; const m = /url\(['"]?([^'")]+)['"]?\)/.exec(el.style.backgroundImage || ''); if (!m) return;
    el.dataset.gorsel = '1'; const im = new Image(); im.src = m[1]; if (im.complete) return;
    el.classList.add('is-gorsel-bekliyor'); const bitti = () => el.classList.remove('is-gorsel-bekliyor'); im.onload = bitti; im.onerror = bitti;
  });
  const segGosterge = kok => kok.querySelectorAll('.dd-seg:not(.is-kaydir)').forEach(sg => {
    const b = sg.querySelector('button[aria-selected=true],button[aria-pressed=true]'); if (!b || !sg.offsetWidth) return;
    const ilk = !sg.classList.contains('has-gosterge'); sg.classList.add('has-gosterge'); if (ilk) sg.classList.add('is-ilk');
    sg.style.setProperty('--dd-seg-x', `${b.offsetLeft}px`); sg.style.setProperty('--dd-seg-w', `${b.offsetWidth}px`);
    if (ilk) requestAnimationFrame(() => requestAnimationFrame(() => sg.classList.remove('is-ilk')));
  });
  DD.segGosterge = (kok = belge) => segGosterge(kok);
  const sayacGozcu = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; sayacGozcu.unobserve(e.target);
    const el = e.target, hedef = +el.dataset.sayacHedef;
    DD.tween(M.counter, p => { el.textContent = Math.round(hedef * p).toLocaleString('tr'); });
  }), {threshold: .6});
  const sayacHazirla = kok => { if (azHareket()) return; kok.querySelectorAll('.dd-istatistik dd, .dd-stats b, [data-sayac-anim]').forEach(el => {
    if (el.dataset.sayacHedef) return; const t = el.textContent.trim(); if (!/^\d{1,3}(\.\d{3})*$/.test(t)) return;
    const v = +t.replace(/\./g, ''); if (v < 2) return; el.dataset.sayacHedef = v; sayacGozcu.observe(el);
  }); };
  const siraliBelir = kok => { if (azHareket()) return; kok.querySelectorAll('.dd-izgara, .dd-izgara-3, .dd-uzman-izgara, .dd-rozet-izgara, .dd-satirlar').forEach(k => {
    if (k.dataset.belirdi || k.closest('[inert]')) return; k.dataset.belirdi = '1';
    [...k.children].slice(0, 12).forEach((c, i) => { if (c.getBoundingClientRect().top > innerHeight * 1.2) return; c.style.setProperty('--dd-i', i); c.classList.add('dd-sira-belir'); c.addEventListener('animationend', () => c.classList.remove('dd-sira-belir'), {once: true}); });
  }); };

  DD.canlandir = (kok = belge) => {
    gorselHazirla(kok); segGosterge(kok); sayacHazirla(kok); siraliBelir(kok);
    kok.querySelectorAll('[data-c]:not([data-canli])').forEach(el => {
      el.dataset.canli = 1;
      const c = el.dataset.c;
      if (c === 'yay') yayAc(el);
      else if (c === 'say') { const h = +el.dataset.hedef; el.dataset.simdiki = 0; if (azHareket()) { el.dataset.simdiki = h; return; } DD.say(el, h, {sure: M.dolum}); }
      else if (c === 'bar') requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-canli')));
      else if (c === 'sayac' || c === 'geri') sayaclar.add(el);
      else if (c === 'kadran') DD._kadranCiz?.(el);
      else if (c === 'slider') sliderCiz(el, +el.dataset.deger, true);
      else if (c === 'grafik') DD._grafikCiz?.(el);
      else if (c === 'kubbe') DD.kubbeBoya?.(el);
      else if (c === 'kalip') DD._kalipKur?.(el);
      else if (c === 'takvim') { const o = JSON.parse(el.dataset.tk), ad = o.ad; DDTakvim.kur(el, o, {sec: v => degisim(el, ad, v)}); }
    });
    if (window.DDCard) DDCard.veils(kok === belge ? belge : kok);
  };
  let bekleyen = false;
  new MutationObserver(() => { if (bekleyen) return; bekleyen = true; requestAnimationFrame(() => { bekleyen = false; DD.canlandir(); }); }).observe(belge.documentElement, {childList: true, subtree: true});

  // ---------- Olay yetkilendirme ----------
  // data-eylem yetkilendirmesi: DD.eylem(kok, 'plan-uygula', (el, ev) => {...}); dönen işlev bağı çözer.
  DD.eylem = (kok, ad, fn) => { const h = ev => { const el = ev.target.closest?.(`[data-eylem="${ad}"]`); if (el && kok.contains(el)) fn(el, ev); }; kok.addEventListener('click', h); return () => kok.removeEventListener('click', h); };
  DD.on = (kok, ad, fn) => { const h = ev => { if (ev.detail?.ad === ad) fn(ev.detail.deger, ev.detail, ev); }; kok.addEventListener('dd-degisim', h); return () => kok.removeEventListener('dd-degisim', h); };

    belge.addEventListener('click', ev => {
    const t = ev.target;
    if (bastirTik) { bastirTik = false; ev.preventDefault(); ev.stopPropagation(); return; }
    const a = t.closest('[data-git],[data-yerine],[data-geri],[data-dd-tazele]');
    if (a && !a.matches('[aria-disabled=true],:disabled')) {
      ev.preventDefault();
      if (a.dataset.git) DD.git(a.dataset.git); else if (a.dataset.yerine) DD.yerine(a.dataset.yerine); else if (a.hasAttribute('data-geri')) DD.geri(); else DD.tazele();
      return;
    }
    if (t.closest('[data-menu]')) { DD.menu?.ac(); return; }
    const seg = t.closest('.dd-seg button');
    if (seg && !seg.closest('[data-takvim]')) {
      const k = seg.closest('.dd-seg'); k.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === seg));
      if (k.classList.contains('is-kaydir')) seg.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); else segGosterge(k.parentElement || k);
      degisim(k, k.dataset.ad, seg.dataset.seg); return;
    }
    const cip = t.closest('[data-cip]');
    if (cip) {
      const k = cip.closest('[data-cip-grup]'), tek = k?.dataset.cipGrup === 'tek', on = cip.getAttribute('aria-pressed') === 'true';
      if (tek) k.querySelectorAll('[data-cip]').forEach(b => b.setAttribute('aria-pressed', b === cip));
      else cip.setAttribute('aria-pressed', !on);
      const liste = k ? [...k.querySelectorAll('[data-cip][aria-pressed=true]')].map(b => b.dataset.cip) : [cip.dataset.cip];
      degisim(k || cip, (k || cip).dataset.ad, tek ? cip.dataset.cip : liste);
      return;
    }
    const sec = t.closest('.dd-secim-kart');
    if (sec) {
      const k = sec.closest('.dd-secim-izgara'), tek = sec.getAttribute('role') === 'radio';
      if (tek) k?.querySelectorAll('.dd-secim-kart').forEach(b => b.setAttribute('aria-checked', b === sec));
      else sec.setAttribute('aria-pressed', sec.getAttribute('aria-pressed') !== 'true');
      const liste = k ? [...k.querySelectorAll('.dd-secim-kart[aria-pressed=true],.dd-secim-kart[aria-checked=true]')].map(b => b.dataset.k) : [];
      degisim(k || sec, (k || sec).dataset.ad, tek ? sec.dataset.k : liste);
      return;
    }
    const st = t.closest('[data-adim-yon]');
    if (st) { stepperAdim(st.closest('[data-adimlayici]'), +st.dataset.adimYon); return; }
    const tmz = t.closest('.dd-temizle');
    if (tmz) { const k = tmz.closest('.dd-girdi'), i = k.querySelector('input,textarea'); i.value = ''; k.classList.remove('has-text'); i.focus(); i.dispatchEvent(new Event('input', {bubbles: true})); return; }
    const duy = t.closest('.dd-duygu button');
    if (duy) { const k = duy.closest('.dd-duygu'); k.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === duy)); duy.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); degisim(k, k.dataset.ad || 'duygu', duy.dataset.deger); return; }
    const uo = t.closest('[data-uye-ol]');
    if (uo) { DD.uyeDuvar({metin: uo.dataset.uyeOl}); return; }
    const su = t.closest('[data-su-ekle],[data-su-cikar]');
    if (su) { suEkle(su.closest('.dd-su'), su.dataset.suCikar ? -su.dataset.suCikar : +su.dataset.suEkle, su.classList.contains('dd-bardak')); return; }
    const por = t.closest('.dd-porsiyon [data-birim]');
    if (por) {
      const k = por.closest('.dd-porsiyon'), st2 = k.querySelector('[data-adimlayici]'), gram = por.dataset.birim === 'gram', onceki = k.querySelector('[data-birim][aria-pressed=true]');
      const toplam = +onceki.dataset.gram * +st2.querySelector('input').value;
      k.querySelectorAll('[data-birim]').forEach(b => b.setAttribute('aria-pressed', b === por));
      Object.assign(st2.dataset, gram ? {min: 10, max: 1000, adim: 10} : {min: .5, max: 20, adim: .5});
      st2.querySelector('input').value = gram ? Math.max(10, Math.round(toplam / 10) * 10) : 1; st2.dataset.birim = por.dataset.birim;
      stepperAdim(st2, 0);
      return;
    }
    const ako = t.closest('.dd-akordiyon .dd-bolum-bas');
    if (ako) { const k = ako.closest('.dd-akordiyon'), b = ako.closest('.dd-ak-bolum'), acilsin = !b.classList.contains('is-acik'); k.querySelectorAll('.dd-ak-bolum').forEach(x => { const on = x === b && acilsin; x.classList.toggle('is-acik', on); x.querySelector('.dd-bolum-bas').setAttribute('aria-expanded', on); x.querySelector('.dd-ak-panel').inert = !on; }); return; }
    const bb = t.closest('.dd-bbox-et,.dd-bbox-nokta');
    if (bb) { const k = bb.closest('.dd-bbox'), oge = bb.parentElement; k.querySelectorAll('.dd-bbox-oge').forEach(b => b.classList.toggle('is-secili', b === oge)); degisim(k, k.dataset.ad || 'bbox', bb.dataset.deger); return; }
    const km = t.closest('.dd-kamera-mod');
    if (km) { const k = km.closest('.dd-kamera'); k.querySelectorAll('.dd-kamera-mod').forEach(b => b.setAttribute('aria-selected', b === km)); k.dataset.mod = km.dataset.deger; k.classList.toggle('is-barkod', km.dataset.deger === 'barkod'); km.scrollIntoView({inline: 'center', block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth'}); const ip = k.querySelector('.dd-kamera-yonerge'); if (ip && km.dataset.ipucu) ip.textContent = km.dataset.ipucu; degisim(k, 'kameraMod', km.dataset.deger); return; }
    const kb = t.closest('[data-kamera]');
    if (kb) { const a = kb.dataset.kamera; if (a === 'kapat') DD.geri(); else if (a === 'flas') { const on = kb.getAttribute('aria-pressed') !== 'true'; kb.setAttribute('aria-pressed', on); DD.toast(on ? 'Flaş açık' : 'Flaş kapalı'); } else if (a === 'cevir') DD.toast('Kamera çevrildi'); else if (a === 'ipucu') kb.closest('.dd-kamera-ipucu')?.remove(); yay(kb, 'dd-kamera', {eylem: a}); return; }
    const sw = t.closest('.dd-swipe-eylem');
    if (sw) { const k = sw.closest('.dd-swipe'); swipeKapat(k); yay(k, 'dd-eylem', {eylem: sw.dataset.eylem, id: k.dataset.id}); return; }
    if (t.closest('[data-tabagim-ac]')) { DD.tabagim.ac(); return; }
    const ub = t.closest('[data-uzunbas]');
    if (ub && ev.detail === 0) { // klavye ve ekran okuyucu: uzun bas yerine onay
      DD.dialog({baslik: ub.dataset.onayBaslik || ub.textContent.trim(), metin: ub.dataset.onayMetin || '', eylem: ub.dataset.onayEylem || 'Onayla'}).then(v => { if (v) yay(ub, 'dd-onay', {ad: ub.dataset.ad}); });
    }
  });

  belge.addEventListener('input', ev => {
    const t = ev.target, k = t.closest?.('.dd-girdi');
    if (k) k.classList.toggle('has-text', !!t.value);
  });
  belge.addEventListener('change', ev => {
    const t = ev.target;
    if (t.matches?.('.dd-anahtar input,.dd-secim input')) degisim(t, t.name || t.closest('[data-ad]')?.dataset.ad, t.type === 'radio' ? t.value : t.checked);
  });
  // Bağlantı gibi çalışan a[href="#/..."]
  belge.addEventListener('click', ev => { const a = ev.target.closest?.('a[href^="#/"]'); if (!a || !R.hazir) return; ev.preventDefault(); if (!bastirTik) DD.git(a.getAttribute('href')); }, true);

  // Adımlayıcı (Gastro DG.adimlayici işaretlemesi)
  const stepperAdim = (k, yon) => {
    const d = k.dataset, i = k.querySelector('input'), v = kisit(+(+i.value + yon * +d.adim).toFixed(3), +d.min, +d.max);
    i.value = v;
    k.querySelector('output').innerHTML = DD.adimDeger(ondalik(v, 2), d.birim);
    k.querySelector('[data-adim-yon="-1"]').disabled = v <= +d.min;
    k.querySelector('[data-adim-yon="1"]').disabled = v >= +d.max;
    const por = k.closest('.dd-porsiyon'); if (por) porsiyonHesap(por);
    degisim(k, k.dataset.ad, v);
    if (yon) DD.titres(4);
  };

  // Porsiyon
  const porsiyonHesap = k => {
    const b = k.querySelector('[data-birim][aria-pressed=true]'), miktar = +k.querySelector('[data-adimlayici] input').value, gram = +b.dataset.gram * miktar, kcal = (+k.dataset.kcal100) * gram / 100;
    k.querySelector('[data-p-gram]').textContent = sayi(gram);
    k.querySelector('[data-p-kcal]').textContent = sayi(kcal);
    degisim(k, k.dataset.ad, {birim: b.dataset.birim, miktar, gram, kcal});
  };

  // Su
  // Yeni bardak eklenirken mevcutlar yerinde kalır: dolum geçişi yalnız değişen bardakta oynar.
  const suEkle = (k, ml, bardak = false) => {
    const hedef = +k.dataset.hedef, once = +k.dataset.deger, yeni = Math.max(0, once + ml), kap = k.querySelector('.dd-su-bardaklar'), n = DD.suBardakSayi(yeni, hedef), sira = DD.suSiradaki(yeni);
    if (yeni === once) return;
    k.dataset.deger = yeni;
    while (kap.children.length > n) kap.lastElementChild.remove();
    while (kap.children.length < n) kap.insertAdjacentHTML('beforeend', DD.suBardakCiz(once, kap.children.length));
    [...kap.children].forEach((b, i) => {
      const oran = DD.suBardakDurum(yeni, i), dolu = oran >= 1;
      b.style.setProperty('--oran', oran.toFixed(3)); b.classList.toggle('is-siradaki', i === sira);
      b.removeAttribute(dolu ? 'data-su-ekle' : 'data-su-cikar'); b.setAttribute(dolu ? 'data-su-cikar' : 'data-su-ekle', DD.SU_BARDAK);
      b.setAttribute('aria-label', `1 su bardağı ${dolu ? 'geri al' : 'ekle'}`);
    });
    DD.say(k.querySelector('[data-su-deger]'), yeni, {bas: once, sure: M.counter});
    const kalan = k.querySelector('[data-su-kalan]');
    if (kalan) kalan.textContent = DD.suKalan(yeni, hedef);
    DD.titres(6);
    degisim(k, k.dataset.ad || 'su', yeni, {eklenen: yeni - once, bardak});
  };

  // ---------- İşaretçi tabanlı etkileşimler ----------
  let bastirTik = false;
  const uzunBaski = {el: null, t: 0};
  const uzunBitir = () => { const b = uzunBaski; if (b.el) b.el.classList.remove('is-basili'); clearTimeout(b.t); b.el = null; };
  const genelUzun = {t: 0, x: 0, y: 0};

  belge.addEventListener('pointerdown', ev => {
    const t = ev.target;
    const ub = t.closest?.('[data-uzunbas]');
    if (ub && !ub.disabled) {
      ev.button === 0 && (uzunBaski.el = ub, ub.classList.add('is-basili'), uzunBaski.t = setTimeout(() => {
        ub.classList.remove('is-basili'); ub.classList.add('is-tamam'); uzunBaski.el = null; bastirTik = true; DD.titres(30);
        setTimeout(() => { bastirTik = false; ub.classList.remove('is-tamam'); }, M.reveal);
        yay(ub, 'dd-onay', {ad: ub.dataset.ad});
      }, +ub.dataset.sure || M.uzunBas));
    }
    const gu = t.closest?.('[data-uzun]');
    if (gu) {
      genelUzun.x = ev.clientX; genelUzun.y = ev.clientY; clearTimeout(genelUzun.t);
      genelUzun.t = setTimeout(() => { bastirTik = true; DD.titres(12); setTimeout(() => { bastirTik = false; }, M.reveal); yay(gu, 'dd-uzun', {ad: gu.dataset.uzun}); }, M.reveal);
    }
    const sl = t.closest?.('.dd-slider-cetvel');
    if (sl) sliderBasla(ev, sl.closest('.dd-slider'));
    const sw = t.closest?.('.dd-swipe-on');
    if (sw) swipeBasla(ev, sw);
    const kd = t.closest?.('.dd-kadran-alan');
    if (kd) DD._kadranBasla?.(ev, kd.closest('.dd-kadran'));
    const gr = t.closest?.('.dd-grafik.is-etkin .dd-grafik-alan');
    if (gr) DD._grafikBasla?.(ev, gr.closest('.dd-grafik'));
  });
  belge.addEventListener('pointermove', ev => {
    if (genelUzun.t && Math.hypot(ev.clientX - genelUzun.x, ev.clientY - genelUzun.y) > TK.space[8]) { clearTimeout(genelUzun.t); genelUzun.t = 0; }
  }, {passive: true});
  ['pointerup', 'pointercancel'].forEach(n => belge.addEventListener(n, () => { uzunBitir(); clearTimeout(genelUzun.t); genelUzun.t = 0; }));
  belge.addEventListener('contextmenu', ev => { if (ev.target.closest?.('[data-uzunbas],[data-uzun]')) ev.preventDefault(); });

  // Orta düğme uzun bas: hızlı işlem sheet'i
  belge.addEventListener('dd-uzun', ev => {
    if (ev.detail?.ad !== 'fab') return;
    DD.sheet({baslik: 'Hızlı işlem', html: DD.parcali([
      {ikon: 'kamera', baslik: 'Tabak çek', alt: 'Fotoğraftan öğün taslağı', git: '#/ai/kamera?mod=tabak'},
      {ikon: 'barkod', baslik: 'Barkod tara', alt: 'İçerik analizi', git: '#/ai/kamera?mod=barkod'},
      {ikon: 'mikrofon', baslik: 'Sesle anlat', alt: 'Ne yediğini söyle', git: '#/ai/ses'},
      {ikon: 'oruc', baslik: 'Oruç & Saatler', alt: 'Oruç sayacına git', git: '#/ritim'}
    ])});
  });

  // Biyometrik slider: cetvel sürüklenir, iğne sabit, değer büyük
  const sliderCiz = (k, v, anlik) => {
    const min = +k.dataset.min, adim = +k.dataset.adim, b = adim % 1 ? 1 : 0, s = k.querySelector('.dd-slider-serit');
    s.style.transition = anlik ? 'none' : '';
    s.style.transform = `translateX(${-((v - min) / adim) * TK.size.sliderStep}px)`;
    k.querySelector('.dd-slider-sayi').textContent = ondalik(v, b);
    k.querySelector('.dd-slider-cetvel').setAttribute('aria-valuenow', v);
    k.querySelector('.dd-slider-cetvel').setAttribute('aria-valuetext', `${ondalik(v, b)} ${k.dataset.birim || ''}`);
  };
  DD._sliderCiz = sliderCiz;
  const sliderYaz = (k, v, anlik) => {
    const min = +k.dataset.min, max = +k.dataset.max, adim = +k.dataset.adim;
    v = kisit(Math.round((v - min) / adim) * adim + min, min, max);
    v = +v.toFixed(3);
    if (v !== +k.dataset.deger) { k.dataset.deger = v; DD.titres(2); degisim(k, k.dataset.ad, v); }
    sliderCiz(k, v, anlik);
  };
  const sliderBasla = (ev, k) => {
    const x0 = ev.clientX, v0 = +k.dataset.deger, adim = +k.dataset.adim, c = k.querySelector('.dd-slider-cetvel');
    let sonX = x0, sonT = ev.timeStamp, hiz = 0, gercek = v0;
    c.setPointerCapture(ev.pointerId);
    k.classList.add('is-surukleniyor');
    const hareket = e => {
      gercek = v0 - ((e.clientX - x0) / TK.size.sliderStep) * adim;
      hiz = (e.clientX - sonX) / Math.max(1, e.timeStamp - sonT); sonX = e.clientX; sonT = e.timeStamp;
      sliderYaz(k, gercek, true);
    };
    const son = () => {
      c.removeEventListener('pointermove', hareket); c.removeEventListener('pointerup', son); c.removeEventListener('pointercancel', son);
      k.classList.remove('is-surukleniyor');
      if (Math.abs(hiz) > .3) sliderYaz(k, gercek - (hiz * M.page / TK.size.sliderStep) * adim, false);
      else sliderCiz(k, +k.dataset.deger, false);
    };
    c.addEventListener('pointermove', hareket); c.addEventListener('pointerup', son); c.addEventListener('pointercancel', son);
  };
  belge.addEventListener('keydown', ev => {
    const c = ev.target.closest?.('.dd-slider-cetvel');
    if (c) {
      const k = c.closest('.dd-slider'), a = +k.dataset.adim, d = {ArrowLeft: -a, ArrowDown: -a, ArrowRight: a, ArrowUp: a, PageDown: -a * 10, PageUp: a * 10}[ev.key];
      if (d) { ev.preventDefault(); sliderYaz(k, +k.dataset.deger + d, false); }
    }
    const kd = ev.target.closest?.('.dd-kadran-alan');
    if (kd) DD._kadranTus?.(ev, kd.closest('.dd-kadran'));
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches?.('[data-git][role=button],[data-git]:not(a,button)')) { ev.preventDefault(); ev.target.click(); }
  });

  // Swipe satır
  const swipeKapat = k => { k.querySelector('.dd-swipe-on').style.transform = ''; k.classList.remove('is-acik'); };
  const swipeBasla = (ev, on) => {
    const k = on.closest('.dd-swipe'), w = k.querySelector('.dd-swipe-eylemler').offsetWidth, ilk = k.classList.contains('is-acik') ? -w : 0;
    belge.querySelectorAll('.dd-swipe.is-acik').forEach(d => { if (d !== k) swipeKapat(d); });
    const x0 = ev.clientX, y0 = ev.clientY; let d = 0, yatay = null;
    const hareket = e => {
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (yatay === null) { if (Math.hypot(dx, dy) < TK.space[8]) return; yatay = Math.abs(dx) > Math.abs(dy); if (yatay) { on.setPointerCapture(e.pointerId); k.classList.add('is-surukleniyor'); } else { son(); return; } }
      d = kisit(ilk + dx, -w - TK.space[16], 0);
      on.style.transform = `translateX(${d}px)`;
    };
    const son = () => {
      on.removeEventListener('pointermove', hareket); on.removeEventListener('pointerup', son); on.removeEventListener('pointercancel', son);
      k.classList.remove('is-surukleniyor');
      if (yatay) {
        bastirTik = true; setTimeout(() => { bastirTik = false; }, M.fast);
        if (d < -w * .4) { k.classList.add('is-acik'); on.style.transform = `translateX(${-w}px)`; } else swipeKapat(k);
      }
    };
    on.addEventListener('pointermove', hareket); on.addEventListener('pointerup', son); on.addEventListener('pointercancel', son);
  };
  belge.addEventListener('focusin', ev => { const k = ev.target.closest?.('.dd-swipe-eylem'); if (k) { const s = k.closest('.dd-swipe'); s.classList.add('is-acik'); s.querySelector('.dd-swipe-on').style.transform = `translateX(${-s.querySelector('.dd-swipe-eylemler').offsetWidth}px)`; } });

  // Arama + otomatik tamamlama. DD.aramaKur(kok, {kaynak:q=>[...], son:[...], sec:oge=>{}, en:8})
  const katla = s => String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  DD.katla = katla;
  DD.vurguluEsles = (metin, q) => {
    const m = String(metin), a = katla(m), b = katla(q.trim());
    const i = b ? a.indexOf(b) : -1;
    if (i < 0 || a.length !== m.length) return esc(m);
    return `${esc(m.slice(0, i))}<mark>${esc(m.slice(i, i + b.length))}</mark>${esc(m.slice(i + b.length))}`;
  };
  DD.aramaKur = (kok, o = {}) => {
    const girdi = kok.querySelector('input'), liste = kok.querySelector('.dd-arama-sonuc') || kok.parentElement.querySelector('.dd-arama-sonuc');
    let sonlar = o.son || []; let z = 0;
    const satirlar = (l, q) => `<div class="dd-satirlar">${l.map((x, i) => (x._son ? DD.satirKap({ikon: 'gecmis', baslik: x.baslik, veri: {'arama-i': i}, ok: false}, DD.ikonBtn({ikon: 'kapat', etiket: 'Sil', veri: {'son-sil': i}})) : DD.satir({...x, baslikHtml: q ? DD.vurguluEsles(x.baslik, q) : esc(x.baslik), veri: {'arama-i': i}, ok: false}))).join('')}</div>`;
    let guncel = [];
    const ciz_ = () => {
      const q = girdi.value.trim();
      if (!q) {
        guncel = sonlar.map(s => (typeof s === 'string' ? {baslik: s, _son: true} : s));
        liste.innerHTML = guncel.length ? `<div class="dd-ara"><span class="dd-t-label dd-ton-ikincil">Son aramalar</span>${DD.btn({metin: 'Temizle', tur: 'text', veri: {'son-temizle': 1}})}</div>${satirlar(guncel, '')}` : '';
      } else {
        guncel = (o.kaynak ? o.kaynak(q) : []).slice(0, o.en || 8);
        liste.innerHTML = guncel.length ? satirlar(guncel, q) : DD.bos({ikon: 'ara_', baslik: 'Sonuç yok', metin: o.bosMetin || `**${q}** için bir şey bulamadık. Daha kısa yazmayı dene.`});
      }
      yay(kok, 'dd-arama', {q, sonuc: guncel});
    };
    const h = () => { clearTimeout(z); z = setTimeout(ciz_, M.press); };
    girdi.addEventListener('input', h);
    liste.addEventListener('click', ev => {
      if (ev.target.closest('[data-son-temizle]')) { sonlar = []; ciz_(); o.sonTemizle?.(); return; }
      const sil = ev.target.closest('[data-son-sil]'); if (sil) { sonlar = sonlar.filter((_, i) => i !== +sil.dataset.sonSil); ciz_(); return; }
      const s = ev.target.closest('[data-arama-i]'); if (!s) return;
      const x = guncel[+s.dataset.aramaI];
      if (x._son) { girdi.value = x.baslik; girdi.closest('.dd-girdi')?.classList.add('has-text'); ciz_(); return; }
      o.sec?.(x);
    });
    ciz_();
    return {yenile: ciz_};
  };
})();
