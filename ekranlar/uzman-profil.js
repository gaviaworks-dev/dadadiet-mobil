/* Diyetisyen profili (#/uzman/profil/:slug). Referans: tasks/referanslar.md Profil.
 * Akış: paket + görüşme türü + takvimden saat, onay sheet'i, ödeme yok; talep DD.durum 'uzman-talep' olarak Uzmanım'a düşer.
 * Kendi diyetisyeninde paket seçilmez, saat 'uzman-randevu'ya yazılır (s.kendi). ?ertele=1 doğrudan takvime iner. ?paket=1ay paketi seçili açar; kendi diyetisyeninde bu, paket yenileme talebidir.
 * Boş saatler veride yok: uygunSaatler slug ve tarihten türetir (uzman-bul.js aynı kuralı kullanır). */
(() => {
  const KAPAK = 'assets/gorsel/hero/uzman-masa.webp', ONGORU_GUN = 30;
  const B = () => DDV.benimDiyetisyenim;
  const bul = slug => DDV.diyetisyenler.find(d => d.slug === slug);
  const benimMi = d => d.slug === B().diyetisyen;
  const randevu = () => DD.durum.oku('uzman-randevu', B().sonrakiRandevu);
  const buyukBas = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

  // ---------- Takvim ----------
  const SAATLER = [['Sabah', ['09:30', '10:15', '11:00']], ['Öğleden sonra', ['13:30', '14:15', '15:00', '16:30']], ['Akşam', ['17:45', '18:30', '19:15']]];
  const gunEkle = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const pazarMi = iso => new Date(`${iso}T12:00:00`).getDay() === 0;
  const ozet = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);
  const dolu = (slug, iso, saat) => ozet(`${slug}${iso}${saat}`) % 3 === 0 || (iso === DD.bugunIso() && saat <= DDV.bugun.simdi);
  const uygunSaatler = (slug, iso) => (pazarMi(iso) ? [] : SAATLER.map(([ad, l]) => ({ad, slotlar: l.map(saat => ({saat, pasif: dolu(slug, iso, saat)}))})));
  const bosSaatVar = (slug, iso) => uygunSaatler(slug, iso).some(g => g.slotlar.some(s => !s.pasif));
  const ilkGun = slug => { for (let i = 0; i <= ONGORU_GUN; i += 1) { const t = gunEkle(DD.bugunIso(), i); if (bosSaatVar(slug, t)) return t; } return DD.bugunIso(); };
  const pazarlar = () => Array.from({length: ONGORU_GUN + 1}, (_, i) => gunEkle(DD.bugunIso(), i)).filter(pazarMi);
  const tarihMetin = iso => { const d = new Date(`${iso}T12:00:00`); return `${buyukBas(d.toLocaleDateString('tr-TR', {weekday: 'long'}))} ${d.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`; };

  // ---------- Seçim ----------
  const onerilen = d => (d.paketler.find(p => p.rozet) || d.paketler[0]).id;
  const secim = (ctx, d) => (ctx.secim ||= {paket: d.paketler.some(p => p.id === ctx.sorgu.paket) ? ctx.sorgu.paket : onerilen(d), tur: d.gorusmeTurleri[0], tarih: ilkGun(d.slug), saat: null, kendi: benimMi(d) && !ctx.sorgu.paket});
  const paketBul = (d, s) => d.paketler.find(p => p.id === s.paket);

  // ---------- Parçalar ----------
  const slotHtml = (d, s) => {
    const g = uygunSaatler(d.slug, s.tarih);
    if (!g.length) return DD.veriYok('Bu gün **görüşme yok**. Başka bir gün seçebilirsin.');
    if (!bosSaatVar(d.slug, s.tarih)) return DD.veriYok('Bu günün saatleri **dolu**. Başka bir gün seçebilirsin.');
    return DD.slotlar({ad: 'saat', secili: s.saat, gruplar: g});
  };
  const takvimHtml = (d, s) => `<div class="dd-yigin" id="randevu-saat">${DD.takvim({ad: 'tarih', gorunum: 'hafta', secili: s.tarih, odak: s.tarih, min: DD.bugunIso(), max: gunEkle(DD.bugunIso(), ONGORU_GUN), kapali: pazarlar()})}<div data-yuva="slot">${slotHtml(d, s)}</div></div>`;
  const kartHtml = d => DD.diyetisyenKart(d, {
    tur: 'tam',
    git: benimMi(d) ? '#/uzman' : `#/uzman/profil/${d.slug}`,
    eylem: {metin: benimMi(d) ? 'Görüşme planla' : 'Randevu al', ikon: 'takvim', veri: {eylem: 'takvime-in'}},
    ikincil: benimMi(d) ? {metin: 'Mesaj', ikon: 'sohbet', git: '#/uzman/sohbet'} : {metin: 'Paylaş', ikon: 'paylas', veri: {eylem: 'paylas'}},
    sayaclar: [{deger: `${d.deneyimYil} yıl`, etiket: 'Deneyim'}, {deger: d.sehir, etiket: 'Şehir'}, {deger: DD.paraTL(d.paketler.find(p => p.id === 'tek').fiyat), etiket: 'Tek seans'}]
  });
  const hakkinda = d => {
    const tek = d.paketler.find(p => p.id === 'tek');
    return `<div class="dd-yigin">${DD.p(d.profilMetni.replace(d.ad, `**${d.ad}**`))}${DD.kunye([
      {ikon: 'award', etiket: 'Deneyim', deger: `${d.deneyimYil} yıl`},
      {ikon: 'saat', etiket: 'Seans süresi', deger: tek.sure},
      {ikon: 'video', etiket: 'Görüşme', deger: d.gorusme}
    ])}</div>`;
  };
  const benimPaket = () => {
    const p = B().paket;
    return DD.kart({html: `<div class="dd-yigin-12"><div class="dd-ara"><span class="dd-t-card">${DD.esc(`${p.ad} paketin`)}</span>${DD.durumRozet({kod: 'aktif'})}</div>${DD.p(`**${p.kalanSeans} görüşme hakkın** var, paketin **${DD.tarihUzun(p.bitis)}** tarihinde bitiyor.`, {ton: 'ikincil'})}</div>`});
  };
  const turSecim = (d, s) => (d.gorusmeTurleri.length > 1 ? DD.segment({ad: 'tur', etiket: 'Görüşme türü', secili: s.tur, ogeler: d.gorusmeTurleri.map(t => ({ad: t, deger: t}))}) : '');
  const altHtml = (d, s) => {
    const p = paketBul(d, s), sol = s.kendi
      ? `<small class="dd-yardim">${DD.esc(s.saat ? tarihMetin(s.tarih) : 'Kalan görüşme')}</small><b class="dd-t-card">${DD.esc(s.saat || String(B().paket.kalanSeans))}</b>`
      : `<small class="dd-yardim">${DD.esc(p.ad)}</small><b class="dd-t-card">${DD.esc(DD.paraTL(p.fiyat))}</b>`;
    return DD.altEylem({sol, dugmeler: [s.saat ? {metin: s.kendi ? 'Saati onayla' : 'Randevu iste', ikon: 'onay', veri: {eylem: 'onay'}} : {metin: 'Saat seç', ikon: 'takvim', veri: {eylem: 'takvime-in'}}]});
  };

  // ---------- Onay ----------
  const onaySatirlar = (d, s) => [
    {ikon: 'uzman', etiket: 'Diyetisyen', deger: d.ad},
    ...(s.kendi ? [] : [{ikon: 'program', etiket: 'Paket', deger: `${paketBul(d, s).ad} · ${paketBul(d, s).seans} görüşme`}]),
    {ikon: 'takvim', etiket: 'Tarih', deger: tarihMetin(s.tarih)},
    {ikon: 'saat', etiket: 'Saat', deger: s.saat},
    {ikon: 'video', etiket: 'Görüşme', deger: s.tur},
    ...(s.kendi ? [] : [{ikon: 'tag', etiket: 'Tutar', deger: DD.paraTL(paketBul(d, s).fiyat)}])
  ];
  const randevuYaz = (d, s) => {
    const r = randevu() || B().sonrakiRandevu;
    DD.durum.yaz('uzman-randevu', {...r, tarih: s.tarih, tarihMetin: tarihMetin(s.tarih), saat: s.saat, iso: `${s.tarih}T${s.saat}:00+03:00`, tur: s.tur});
    DD.yerine('#/uzman');
    DD.toast(`Görüşmen **${DD.tarihKisa(s.tarih)} ${s.saat}** için planlandı`, {tur: 'basari', ikon: 'takvim'});
  };
  const onaySheet = (d, s) => {
    const benim = s.kendi, eski = DD.durum.oku('uzman-talep', null), metin = benim
      ? (randevu() ? 'Önceki saatin **yeni saatle değişir**. Görüşme hakkın etkilenmez.' : 'Görüşme hakkından **1 görüşme** kullanılır.')
      : 'Talebin diyetisyene iletilir. **Onaylandığında** bildirim alırsın; bu adımda ödeme alınmaz.';
    DD.sheet({
      baslik: benim ? 'Görüşmeyi onayla' : 'Randevu talebi',
      html: `<div class="dd-yigin">${DD.kunye(onaySatirlar(d, s))}${DD.bant({ton: 'bilgi', metin})}${!benim && eski ? DD.bant({ton: 'uyari', metin: `Bu talep **${bul(eski.slug).ad}** için bekleyen talebinin yerine geçer.`}) : ''}${benim ? '' : DD.checkbox({ad: 'paylasim', etiket: 'Sağlık dosyamı paylaş', alt: 'İstediğin zaman kapatabilirsin', secili: false})}</div>`,
      altBar: DD.btn({metin: benim ? 'Onayla' : 'Talebi gönder', ikon: 'onay', tam: true, veri: {eylem: 'gonder'}}),
      sonra: h => DD.eylem(h, 'gonder', async el => {
        await DD.mesgul(el);
        if (benim) { randevuYaz(d, s); return; }
        DD.durum.yaz('uzman-talep', {slug: d.slug, paket: s.paket, tarih: s.tarih, saat: s.saat, tur: s.tur, paylasim: !!h.querySelector('input[name="paylasim"]')?.checked});
        DD.yerine('#/uzman');
        DD.toast('Talebin **diyetisyene iletildi**', {tur: 'basari', ikon: 'onay'});
      })
    });
  };

  DD.ekran('uzman-profil', {
    tur: 'banner',
    nav: 'uzman',
    ust: '#/uzman/bul',
    tabagim: false,
    baslik: ctx => bul(ctx.param.slug)?.kisaAd || 'Diyetisyen',
    ustBar: ctx => (bul(ctx.param.slug) ? {} : {saydam: false}),
    ciz: ctx => {
      const d = bul(ctx.param.slug);
      if (!d) return DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu profil burada değil', metin: 'Bağlantı eskimiş olabilir. **Diyetisyenlere dönüp** sana uygun olanı seçebilirsin.', eylem: {metin: 'Diyetisyenlere dön', yerine: '#/uzman/bul'}});
      const s = secim(ctx, d), benim = s.kendi;
      return DD.gulucuk({gorsel: KAPAK, ust: true, etiket: benimMi(d) ? 'Diyetisyenin' : d.unvan, baslik: d.uzmanliklar[0], alt: d.uzmanliklar[1] || d.sehir, rol: 'page'}) + DD.bolumler([
        kartHtml(d),
        {baslik: 'Hakkında', html: hakkinda(d)},
        benim ? {baslik: 'Paketin', html: benimPaket()} : {baslik: 'Paket seç', html: DD.paketler({ad: 'paket', ogeler: d.paketler, secili: s.paket})},
        {baslik: benim && randevu() ? 'Görüşme saatini değiştir' : 'Randevu saati', html: `<div class="dd-yigin">${turSecim(d, s)}${takvimHtml(d, s)}</div>`},
        DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: `Diyetisyen görüşmesi **tıbbi teşhis ya da tedavi yerine geçmez**. ${DDV.eslesmeSorulari.not.split('. ')[1]}`})
      ]);
    },
    altBar: ctx => { const d = bul(ctx.param.slug); return d ? altHtml(d, secim(ctx, d)) : ''; },
    sonra: (kok, ctx) => {
      const d = bul(ctx.param.slug);
      if (!d) return undefined;
      const s = secim(ctx, d), yuva = kok.querySelector('[data-yuva="slot"]'), bar = kok.querySelector('.dd-altbar');
      const barCiz = () => { bar.innerHTML = altHtml(d, s); };
      const takvimeIn = () => { const k = kok.querySelector('.dd-kaydir'), hedef = kok.querySelector('#randevu-saat'), ust = kok.querySelector('.dd-header'); k.scrollTo({top: k.scrollTop + hedef.getBoundingClientRect().top - k.getBoundingClientRect().top - ust.offsetHeight - DD.TK.space[16], behavior: DD.azHareket() ? 'auto' : 'smooth'}); };
      if (ctx.sorgu.ertele && !ctx.indi) { ctx.indi = true; requestAnimationFrame(takvimeIn); }
      const c = [
        DD.on(kok, 'paket', v => { s.paket = v; barCiz(); }),
        DD.on(kok, 'tur', v => { s.tur = v; barCiz(); }),
        DD.on(kok, 'tarih', v => { s.tarih = v; s.saat = null; yuva.innerHTML = slotHtml(d, s); barCiz(); }),
        DD.on(kok, 'saat', v => { s.saat = v || null; barCiz(); }),
        DD.eylem(kok, 'takvime-in', takvimeIn),
        DD.eylem(kok, 'onay', () => onaySheet(d, s)),
        DD.eylem(kok, 'paylas', () => DD.paylas({baslik: d.ad, alt: d.uzmanliklar.join(' · '), url: `https://dadadiet.com/diyetisyen/${d.slug}`}))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
