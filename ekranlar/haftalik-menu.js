/* Haftalık menüm (#/haftalik-menu). Gastro alt sayfa kalıbı: DD.gruplar, kartsız satırlar; alışveriş listesi DD.gorevListe (alınan soluk + üstü çizili).
 * Web karşılığı: hesabim/haftalik-menum (uye-haftalik-menum.js) ve Beslenme Planım'ın haftalık menü + alışveriş listesi bölümü.
 * Menü diyetisyenin gönderdiğidir: DDV.benimDiyetisyenim.haftalikMenu (Uzmanım'daki "Bu haftanın menüsü" ile aynı kaynak). Kalemler DDV.besinler / DDV.yemekler'e çözülür;
 * dokununca #/besin/:slug ya da #/tarif/:slug açılır. Günün makrosu bütün kalemlerin gramı biliniyorsa hesaplanır.
 * Durum: alisveris {'<program>-<hafta>': {malzeme: true}} (alındı işaretleri hafta başına). #/haftalik-menu?ac=alisveris listeyi açar, ?hal=bos, ?hal=hata. */
(() => {
  const B = () => DDV.benimDiyetisyenim;
  const H = () => B().haftalikMenu;
  const benim = () => DDV.diyetisyenler.find(d => d.slug === B().diyetisyen);
  const menuYok = ctx => ctx.sorgu.hal === 'bos' || DD.yeniHesap() || !DDV.kullanici.diyetisyen;
  const isoMs = s => { const [y, a, g] = s.split('-').map(Number); return Date.UTC(y, a - 1, g); };
  const gunEkle = (s, n) => new Date(isoMs(s) + n * 864e5).toISOString().slice(0, 10);
  const bugunGun = () => H().gunler.find(x => x.bugun) || H().gunler[0];
  const tarih = g => gunEkle(DD.bugunIso(), g.gun - bugunGun().gun);
  const buyukBas = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const gunAdi = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', {weekday: 'long', day: 'numeric', month: 'long'});

  // ---------- Kalem çözümü: menü satırı → besin ya da yemek kaydı (program detayıyla aynı kural) ----------
  let dizin = null;
  const onbellek = new Map();
  const MIKTAR = /^(.*?)\s+((?:\d|[½¼¾⅓⅔]|yarım\s|çeyrek\s).*)$/i;
  const coz = metin => {
    if (onbellek.has(metin)) return onbellek.get(metin);
    dizin ||= [...DDV.yemekler.map(o => ({n: DD.katla(o.ad), o, yemek: true})), ...DDV.besinler.map(o => ({n: DD.katla(o.ad), o}))].sort((a, b) => b.n.length - a.n.length);
    const n = DD.katla(metin), hit = dizin.find(a => n === a.n || n.startsWith(`${a.n} `));
    const [ad, miktar] = hit ? [hit.o.ad, metin.slice(hit.o.ad.length).trim()] : (metin.match(MIKTAR) || [null, metin, '']).slice(1);
    const g = miktar.match(/([\d.,]+)\s*g\)?$/), gram = g ? parseFloat(g[1].replace(',', '.')) : null, b = hit && !hit.yemek ? hit.o : null;
    const deger = b && gram ? {kcal: b.kcal * gram / 100, ...Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, (b[m] || 0) * gram / 100]))} : null;
    const k = {ad, miktar: miktar.replace(/\s*\(([\d.,]+\s*g)\)$/, ' · $1'), gram, kaynak: hit?.o || null, yemek: !!hit?.yemek, deger};
    onbellek.set(metin, k);
    return k;
  };
  const gunMakro = g => {
    const l = g.ogunler.flatMap(o => o.kalemler.map(coz));
    if (!l.length || l.some(k => !k.deger)) return null;
    const h = DDV.kullanici.makroHedef;
    return Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, {alinan: l.reduce((t, k) => t + k.deger[m], 0), hedef: h[m]}]));
  };

  // ---------- Gün paneli ----------
  const kalemSatir = k => DD.besinSatir({ad: k.ad, gorsel: k.kaynak?.gorsel || null, kcal: k.deger ? Math.round(k.deger.kcal) : k.yemek ? k.kaynak.porsiyonKcal : null, ...(k.kaynak ? {P: k.kaynak.P, K: k.kaynak.K, Y: k.kaynak.Y} : {})},
    {alt: k.miktar, ok: !!k.kaynak, git: k.kaynak ? `#/${k.yemek ? 'tarif' : 'besin'}/${k.kaynak.slug}` : undefined});
  const gunPanel = g => {
    const t = tarih(g), makro = gunMakro(g), hedef = DDV.kullanici.hedefKcal;
    const bas = `<div class="dd-yigin-8"><div class="dd-ara"><h3 class="dd-t-sub">${DD.esc(gunAdi(t))}</h3>${g.bugun ? DD.rozet({metin: 'Bugün'}) : t < DD.bugunIso() ? DD.durumRozet({metin: 'Geçti', ton: 'notr', ikon: 'onay'}) : ''}</div><span class="dd-t-meta dd-ton-ikincil">${DD.esc(`${buyukBas(g.baslik)} · ${g.ogunler.length} öğün · ${DD.sayi(g.kcal)} / ${DD.sayi(hedef)} kcal`)}</span></div>`;
    const ogunler = g.ogunler.map(o => `<section class="dd-yigin-8">${DD.bas(o.ad, {html: `<span class="dd-t-meta dd-ton-ikincil">${DD.esc(`${DD.ogun.noktali(o.saat)} · ${DD.sayi(o.kcal)} kcal`)}</span>`})}${DD.satirlar(o.kalemler.map(m => kalemSatir(coz(m))))}</section>`).join('');
    return `<div class="dd-yigin">${bas}${makro ? DD.makroCubuk(makro, {kart: false}) : ''}${ogunler}</div>`;
  };

  // ---------- Hafta özeti ----------
  const haftaOzet = () => {
    const l = H().gunler, ort = Math.round(l.reduce((t, g) => t + g.kcal, 0) / l.length), hedef = DDV.kullanici.hedefKcal, i = l.findIndex(g => g.bugun);
    const grafik = DD.grafik({tur: 'eksenli', ad: 'hm-kcal', etiket: 'Günlük enerji', seri: l.map(g => ({etiket: g.etiket, deger: g.kcal})), hedef, hedefEtiket: 'Hedef', birim: 'kcal', secili: i < 0 ? 0 : i});
    const fark = ort - hedef, yorum = Math.abs(fark) <= 50 ? 'hedefinle **aynı çizgide**' : fark > 0 ? `hedefinin **${DD.sayi(fark)} kcal üstünde**` : `hedefinin **${DD.sayi(-fark)} kcal altında**`;
    return `<div class="dd-yigin">${DD.ozetSerit([{ikon: 'kalori', etiket: 'Ortalama', deger: DD.sayi(ort), birim: 'kcal'}, {ikon: 'hedef', etiket: 'Hedefin', deger: DD.sayi(hedef), birim: 'kcal'}, {ikon: 'ogun', etiket: 'Öğün', deger: String(Math.round(l.reduce((t, g) => t + g.ogunler.length, 0) / l.length)), birim: '/gün'}])}${grafik}${DD.p(`Bu haftanın günlük ortalaması ${yorum}. Antrenman ya da sosyal günlerde enerji **bilerek** yükseltilmiş olabilir; sorun varsa diyetisyenine yaz.`, {ton: 'ikincil', meta: true})}</div>`;
  };

  // ---------- Alışveriş listesi: haftanın bütün kalemleri, gram toplamıyla ----------
  const haftaAnahtar = () => `${H().program}-${H().hafta}`;
  const alisveris = () => {
    const m = new Map();
    H().gunler.forEach(g => g.ogunler.forEach(o => o.kalemler.forEach(x => {
      const k = coz(x), ad = k.ad.split(' (')[0], v = m.get(ad) || {ad, gram: 0, adet: 0};
      if (k.gram) v.gram += k.gram; else v.adet += 1;
      m.set(ad, v);
    })));
    return [...m.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
  };
  const miktarMetin = v => (v.gram ? (v.gram >= 1000 ? `${DD.ondalik(v.gram / 1000, 1)} kg` : `${DD.sayi(Math.round(v.gram / 5) * 5)} g`) : `${v.adet} porsiyon`);
  const alinan = () => DD.durum.oku('alisveris', {})[haftaAnahtar()] || {};
  const alinanYaz = a => DD.durum.yaz('alisveris', {...DD.durum.oku('alisveris', {}), [haftaAnahtar()]: a});
  const alisverisSheet = kok => {
    const l = alisveris(), ilk = alinan();
    const ozet = () => { const a = alinan(); return `${l.filter(v => a[v.ad]).length} / ${l.length} alındı`; };
    DD.sheet({
      baslik: 'Alışveriş listesi', tam: true,
      html: `<div class="dd-yigin">${DD.p(`${DD.tarihKisa(tarih(H().gunler[0]))} – ${DD.tarihKisa(tarih(H().gunler[H().gunler.length - 1]))} menüsündeki **${l.length} malzeme**. Aldıklarını işaretle; liste bu hafta için saklanır.`, {ton: 'ikincil'})}<span class="dd-t-meta dd-ton-ikincil" data-yuva="alis-ozet">${ozet()}</span>${DD.gorevListe(l.map((v, i) => ({id: `alis-${i}`, baslik: v.ad, alt: miktarMetin(v), tamam: !!ilk[v.ad]})), {etiket: 'Alışveriş listesi'})}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Paylaş', ikon: 'paylas', tur: 'secondary', veri: {eylem: 'alis-paylas'}})}${DD.btn({metin: 'Tümü alındı', ikon: 'onay', veri: {eylem: 'alis-hepsi'}})}</div>`,
      sonra: d => {
        const tazele = () => { d.querySelector('[data-yuva="alis-ozet"]').textContent = ozet(); const e = kok.querySelector('[data-yuva="alis-kart"]'); if (e) e.innerHTML = alisverisKart(); };
        const c = l.map((v, i) => DD.on(d, `alis-${i}`, on => { const a = {...alinan()}; if (on) a[v.ad] = true; else delete a[v.ad]; alinanYaz(a); tazele(); }));
        c.push(DD.eylem(d, 'alis-hepsi', () => { alinanYaz(Object.fromEntries(l.map(v => [v.ad, true]))); d.querySelectorAll('.dd-kalem').forEach(k => { k.classList.add('is-tamam'); k.querySelector('input').checked = true; }); tazele(); DD.toast('Listenin **hepsi** alındı', {tur: 'basari'}); }));
        c.push(DD.eylem(d, 'alis-paylas', () => DD.paylas({baslik: 'Haftalık alışveriş listem', alt: l.map(v => `${v.ad} (${miktarMetin(v)})`).join(', '), url: 'https://dadadiet.com/hesabim/haftalik-menum'})));
        return () => c.forEach(f => f());
      }
    });
  };
  const alisverisKart = () => { const l = alisveris(), a = alinan(), n = l.filter(v => a[v.ad]).length; return DD.satirlar([{ikon: 'cart-shopping', baslik: 'Alışveriş listesi', alt: n ? `${n} / ${l.length} malzeme alındı` : `${l.length} malzeme · haftanın menüsünden`, sag: n === l.length ? DD.durumRozet({metin: 'Tamam', ton: 'basari', ikon: 'onay'}) : '', veri: {eylem: 'alisveris'}}]); };

  const bos = () => DD.gruplar([
    {html: DD.bos({ikon: 'takvim', baslik: 'Haftalık menün yok', metin: 'Bir diyetisyenle çalıştığında **gün gün menün** burada görünür. O zamana dek programların menülerine göz atabilirsin.', eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}, ikincil: {metin: 'Programlar', git: '#/programlar'}})}
  ]);

  let hataGosterildi = false;
  DD.ekran('haftalik-menu', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/uzman',
    baslik: 'Haftalık menüm',
    iskelet: 'liste',
    yenile: true,
    ustBar: ctx => (menuYok(ctx) ? {} : {sag: [{ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'secenek'}}]}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (menuYok(ctx)) return bos();
      const d = benim(), s = ctx.gun || bugunGun().gun, g0 = H().gunler[0], gS = H().gunler[H().gunler.length - 1];
      const bas = `<div class="dd-yigin-12">${DD.satir({avatar: {ad: d.harf}, baslik: d.ad, alt: `${H().programAd} · ${H().hafta}. hafta`})}${DD.p(`${DD.tarihKisa(tarih(g0))} – ${DD.tarihKisa(tarih(gS))} menün **diyetisyenin tarafından** hazırlandı. Kaleme dokunursan besin değerini görürsün.`, {ton: 'ikincil', meta: true})}</div>`;
      return DD.gruplar([
        {html: `<div data-yuva="alis-kart">${alisverisKart()}</div>`},
        {baslik: 'Gün gün', html: `<div class="dd-yigin">${DD.gunSekme({ad: 'hm-gun', secili: String(s), ogeler: H().gunler.map(x => ({etiket: x.etiket, deger: String(x.gun)}))})}<div data-yuva="hm-gun">${gunPanel(H().gunler.find(x => x.gun === s))}</div></div>`},
        {baslik: 'Haftanın özeti', html: haftaOzet()},
        {baslik: 'Değişiklik mi gerekiyor?', satirlar: [{ikon: 'sohbet', baslik: 'Diyetisyenine yaz', alt: 'Öğün ya da kalem değişikliği iste', git: '#/uzman/sohbet'}]},
        {html: DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Menü **diyetisyeninin değerlendirmesine** göre hazırlanır; ilaç ya da tedavi yerine geçmez.'})}
      ], {bas});
    },
    altBar: ctx => (menuYok(ctx) ? '' : DD.altEylem({
      ikonlar: [{ikon: 'paylas', ad: 'Paylaş', sayi: 'Paylaş', veri: {eylem: 'paylas'}}, {ikon: 'file-pdf', ad: 'PDF indir', sayi: 'PDF', veri: {eylem: 'pdf'}}],
      dugmeler: [{metin: 'Alışveriş listesi', ikon: 'cart-shopping', veri: {eylem: 'alisveris'}}]
    })),
    sonra: (kok, ctx) => {
      if (menuYok(ctx)) return undefined;
      if (ctx.sorgu.ac === 'alisveris' && !ctx.acildi) { ctx.acildi = true; alisverisSheet(kok); }
      const pdf = el => DD.mesgul(el, DD.TK.motion.reveal * 2).then(() => DD.toast(`Haftalık menün **PDF olarak** indirildi`, {tur: 'basari', ikon: 'file-pdf'}));
      const paylas = () => DD.paylas({baslik: `${H().programAd} · ${H().hafta}. hafta menüm`, alt: 'Diyetisyenimin hazırladığı haftalık menü', url: 'https://dadadiet.com/hesabim/haftalik-menum'});
      const c = [
        DD.on(kok, 'hm-gun', v => { ctx.gun = +v; kok.querySelector('[data-yuva="hm-gun"]').innerHTML = gunPanel(H().gunler.find(x => x.gun === +v)); }),
        DD.eylem(kok, 'alisveris', () => alisverisSheet(kok)),
        DD.eylem(kok, 'pdf', pdf),
        DD.eylem(kok, 'paylas', paylas),
        DD.eylem(kok, 'secenek', () => DD.sheet({
          baslik: 'Haftalık menü',
          html: DD.satirlar([
            {ikon: 'file-pdf', baslik: 'PDF olarak indir', alt: 'Yazdırmak ya da saklamak için', veri: {eylem: 's-pdf'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'paylas', baslik: 'Paylaş', veri: {eylem: 's-paylas'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'program', baslik: 'Programı aç', alt: H().programAd, git: `#/program/${H().program}`, attrs: 'data-sheet-kapat'},
            {ikon: 'clipboard-list', baslik: 'Beslenme planım', git: '#/beslenme-plani', attrs: 'data-sheet-kapat'}
          ]),
          sonra: d => { const a = DD.eylem(d, 's-pdf', () => pdf(kok.querySelector('[data-eylem="pdf"]'))), b = DD.eylem(d, 's-paylas', paylas); return () => { a(); b(); }; }
        }))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
