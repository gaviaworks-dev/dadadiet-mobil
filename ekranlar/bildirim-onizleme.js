/* Bildirim önizlemesi (#/bildirim-onizleme, alt): öğün hatırlatmasının telefonda nasıl görüneceği.
 * Öğün seçilir (segment), kilit ekranı (DD.kilitEkrani) o öğünün hatırlatma saatiyle çizilir; altında uygulama içi satır (DD.bildirimSatir)
 * ve sessiz saate düşen hatırlatmanın neden gitmediği. "Şimdi dene" birkaç saniye sonra uygulama içinde DD.toast ile bildirimi gösterir (eylem: Yedim).
 * Metinler DD.ogun.bildirim; saat bugünün planından (DD.ogun.hesap). Yenen öğünün hatırlatma saati planlanan − once_dk ile gösterilir. */
(() => {
  const O = () => DD.ogun;
  const nok = s => O().noktali(s);
  const GORSEL = {kahvalti: 'assets/gorsel/hero/kayit-kahvalti.webp', ara1: 'assets/gorsel/hero/ritim-cay.webp', ara2: 'assets/gorsel/hero/ritim-cay.webp'};
  const tarih = () => { const an = DD.simdi(); return `${an.toLocaleDateString('tr-TR', {weekday: 'long'})}, ${an.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`; };
  // Sessiz aralık gece yarısını geçebilir (23.00–08.00)
  const sessizde = saat => {
    const s = O().sessiz(); if (!s) return false;
    const [a, b] = s.split('-').map(DD.saatDk), d = DD.saatDk(saat);
    return a < b ? d >= a && d < b : d >= a || d < b;
  };
  const liste = () => {
    const h = O().hesap(), once = O().ayar().once_dk || 0;
    return h.ogunler.filter(o => o.durum !== 'kapali').map(o => {
      const hat = o.hatirlatma || DD.saatMetin((DD.saatDk(o.planlanan) - once + 1440) % 1440), b = O().bildirim({...o, hatirlatma: hat}, h);
      return {o, h, hat, b, sessiz: o.hatirlatma ? o.sessiz : sessizde(hat)};
    });
  };
  const secili = ctx => { const l = liste(); return l.find(x => x.o.tur === ctx.secim) || l.find(x => x.o.tur === l[0].h.odak) || l[0]; };
  const durumMetin = x => (x.o.durum === 'yedi' ? 'Bugün yedin; yarın yine bu saatte.' : x.o.durum === 'atladi' ? 'Bugün atladın; yarın yine bu saatte.' : !x.o.aktif ? 'Bu öğün için hatırlatma kapalı.' : null);

  const panel = x => {
    const not = x.sessiz
      ? DD.bant({ton: 'uyari', ikon: 'bell-slash', baslik: 'Bu hatırlatma gitmez', metin: `**${nok(x.hat)}** sessiz saatlerine düşüyor; telefonuna bildirim gelmez. Öğün yine **Profil’deki listede** görünür.`, eylem: {metin: 'Sessiz saatleri değiştir', git: '#/ayarlar/bildirim'}})
      : '';
    const durum = durumMetin(x);
    return `<div class="dd-yigin">
      ${DD.kilitEkrani({saat: nok(x.hat), tarih: tarih(), gorsel: GORSEL[x.o.tur] || 'assets/gorsel/hero/ritim-sofra.webp', baslik: x.b.baslik, metin: x.b.metin})}
      ${DD.p(`**${x.o.ad}** ${nok(x.o.planlanan)}${DDOgun.ekDe(x.o.planlanan)}; hatırlatma **${nok(x.hat)}${DDOgun.ekDe(x.hat)}** gelir.${durum ? ` ${durum}` : ''}`, {ton: 'ikincil'})}
      ${not}
      ${DD.alan({etiket: 'Uygulama içinde', yardim: 'Saati gelen hatırlatma Bildirimler listesine de düşer.', html: DD.bildirimSatir({id: `ogn-onizleme-${x.o.tur}`, ikon: x.o.ikon, baslik: x.b.baslik, metin: x.b.metin, zaman: nok(x.hat), okundu: false}, {git: '#/profil'})})}
    </div>`;
  };

  DD.ekran('bildirim-onizleme', {
    tur: 'alt',
    baslik: 'Bildirim görünümü',
    ust: '#/ogun-saatleri',
    yenile: true,
    ciz: ctx => {
      const l = liste(), x = secili(ctx), a = O().ayar();
      const uyari = O().etkin() ? '' : DD.bant({ton: 'bilgi', ikon: 'bildirim', baslik: a.acik ? 'Bildirim izni yok' : 'Hatırlatıcı kapalı', metin: a.acik ? 'Hatırlatmaların telefonuna gelmesi için **bildirim izni** ver.' : 'Açtığında öğün hatırlatmaları **böyle görünür**.', eylem: a.acik ? {metin: 'Bildirimleri aç', git: O().izin() === 'reddedildi' ? '#/bildirim-izni?hal=red' : '#/bildirim-izni'} : {metin: 'Öğün saatlerim', git: '#/ogun-saatleri'}});
      return DD.gruplar([
        {html: `<div class="dd-yigin">
          ${DD.p(`Hatırlatma öğünden ${a.once_dk ? `**${a.once_dk} dk önce**` : '**saatinde**'} kilit ekranına düşer. Öğün seç, nasıl görüneceğine bak.`, {ton: 'ikincil'})}
          ${uyari}
          ${DD.segment({ad: 'onizleme-ogun', etiket: 'Öğün', kaydir: true, secili: x.o.tur, ogeler: l.map(y => ({ad: y.o.ad.split(' ')[0], deger: y.o.tur}))})}
          <div data-yuva="onizleme">${panel(x)}</div>
        </div>`}
      ]);
    },
    altBar: () => DD.altEylem({dugmeler: [{metin: 'Şimdi dene', ikon: 'bildirim', tam: true, veri: {eylem: 'dene'}}]}),
    sonra: (kok, ctx) => {
      let zaman = null;
      const tazele = () => { if (DD.aktif()?.ad === 'bildirim-onizleme') DD.tazele(); };
      document.addEventListener('dd-ogun', tazele);
      const c = [
        () => document.removeEventListener('dd-ogun', tazele),
        DD.on(kok, 'onizleme-ogun', v => { ctx.secim = v; const y = kok.querySelector('[data-yuva="onizleme"]'); if (y) y.innerHTML = panel(secili(ctx)); }),
        DD.eylem(kok, 'dene', el => {
          const x = secili(ctx), {b} = x, tur = x.o.tur;
          DD.toast('Bildirim **birkaç saniye** içinde gelecek', {ikon: 'saat', sure: 2400});
          DD.mesgul(el, new Promise(bitti => { zaman = setTimeout(bitti, 3200); })).then(() => {
            zaman = null;
            DD.titres(20);
            DD.toast(`**${b.baslik}** · ${nok(x.o.planlanan)}`, {ikon: x.o.ikon, yerine: true, sure: 6000, eylem: x.o.durum === 'yedi' ? null : 'Yedim', onEylem: () => {
              O().isaretle(tur, 'yedi');
              DD.toast(`**${x.o.ad}** yedin; Bugün’e de yazıldı`, {tur: 'basari', ikon: 'onay', eylem: 'Geri al', onEylem: () => O().isaretle(tur, null)});
            }});
          });
        })
      ];
      return () => { clearTimeout(zaman); c.forEach(f => f()); };
    }
  });
})();
