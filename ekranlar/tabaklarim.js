/* Tabaklarım (#/tabaklarim). tasks/tabak-gunlugu.md §3; referans: tasks/referanslar.md "Tabaklarım ve öğün kaydı" (Welmi günlük, Nutrium).
 * Veri DDKayit (kayit.js). Kayıtlar günün tamamı değildir: gün başlığı kalori toplamı değil tabak sayısı yazar.
 * #/tabaklarim?hal=bos hiç kaydı olmayan hal, ?hal=hata bağlantı hatası.
 */
(() => {
  const nk = s => String(s ?? '').replace(/\b(\d{1,2}):(\d{2})\b/g, '$1.$2');   // görünen saat noktalı (19.30); veri ve durum anahtarı ':' kalır
  const {sayi} = DD;
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id)?.ad || 'Öğün';
  const gunBaslik = iso => {
    const bugun = DD.bugunIso(), fark = Math.round((Date.parse(`${bugun}T12:00:00`) - Date.parse(`${iso}T12:00:00`)) / 864e5);
    if (fark === 0) return 'Bugün';
    if (fark === 1) return 'Dün';
    const d = new Date(`${iso}T12:00:00`);
    return `${d.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})} ${d.toLocaleDateString('tr-TR', {weekday: 'long'})}`;
  };
  const tumu = ctx => (ctx.sorgu.hal === 'bos' ? [] : DDKayit.liste());
  const suz = (l, s) => l.filter(k => (!s.ogun || k.ogun === s.ogun) && (!s.tarih || k.tarih === s.tarih));
  // Bugünün kaydında ad öğün adıyla aynıdır; kartta iki kez yazılmaz.
  const kart = k => ({id: k.id, foto: k.foto, kcal: k.kcal, saat: nk(k.saat), ogun: ogunAd(k.ogun), ad: k.ad === ogunAd(k.ogun) ? '' : k.ad});
  const gunler = l => [...new Set(l.map(k => k.tarih))].map(t => { const g = l.filter(k => k.tarih === t); return {baslik: gunBaslik(t), ozet: `${sayi(g.length)} tabak`, kayitlar: g.map(kart)}; });
  const filtre = (s, l) => DD.cipler({ad: 'ogun', tur: 'tek', etiket: 'Öğün', secili: s.ogun, ogeler: [{metin: 'Tümü', deger: '', sayi: l.filter(k => !s.tarih || k.tarih === s.tarih).length}, ...DDV.bugun.ogunler.map(o => ({metin: o.ad, deger: o.id, ikon: o.ikon}))]});
  const tarihCip = s => (s.tarih ? `<div class="dd-sira">${DD.cip({metin: gunBaslik(s.tarih), kapat: true, etiket: 'Tarih seçimini kaldır', veri: {eylem: 'tarih-temizle'}})}</div>` : '');
  const liste = (s, l) => {
    const g = suz(l, s);
    if (g.length) return DD.tabakIzgara({gunler: gunler(g)});
    return DD.bos({ikon: 'tabak', baslik: 'Bu seçimde tabak yok', metin: 'Başka bir **öğün ya da tarih** seçebilirsin.', eylem: {metin: 'Seçimi temizle', tur: 'secondary', veri: {eylem: 'temizle'}}});
  };
  const bos = () => DD.bos({ikon: 'kamera', tam: true, baslik: 'İlk tabağını çek', metin: 'Çektiğin tabaklar **gün gün** burada birikir.', eylem: {metin: 'Tabağını tara', ikon: 'kamera', git: '#/ai/kamera?mod=tabak'}});

  let hataGosterildi = false;
  DD.ekran('tabaklarim', {
    iskelet: 'izgara',
    bos: {ikon: 'tabak', baslik: 'Henüz tabak yok', metin: 'Çektiğin ya da eklediğin tabaklar **burada birikir**.', eylem: {metin: 'Tabağını çek', ikon: 'kamera', git: '#/ai/kamera'}},   // ?hal=bos (ortak DD.bos)
    tur: 'alt',
    nav: 'bugun',
    baslik: 'Tabaklarım',
    yenile: true,
    ustBar: ctx => (tumu(ctx).length ? {sag: [{ikon: 'takvim', etiket: 'Tarih seç', veri: {eylem: 'takvim'}}]} : {}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return Promise.resolve();
    },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    ciz: ctx => {
      const s = ctx.s ||= {ogun: '', tarih: ''}, l = tumu(ctx);
      if (!ctx.hazir) return `<div class="dd-ic">${DD.iskelet(4, 'kart')}</div>`;   // ekran iskeleti gutter'sız çizilir
      if (!l.length) return bos();
      return `<div class="dd-ic dd-yigin"><div data-yuva="filtre" class="dd-yigin-12">${filtre(s, l)}${tarihCip(s)}</div><div data-yuva="liste">${liste(s, l)}</div></div>`;
    },
    altBar: ctx => (ctx.hazir && tumu(ctx).length ? DD.altEylem({dugmeler: [{metin: 'Tabağını çek', ikon: 'kamera', tam: true, git: '#/ai/kamera?mod=tabak'}]}) : ''),
    sonra: (kok, ctx) => {
      if (!ctx.hazir) { const z = setTimeout(() => { ctx.hazir = true; if (DD.aktif()?.ctx === ctx) DD.tazele(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal); return () => clearTimeout(z); }
      const s = ctx.s, yer = kok.querySelector('[data-yuva="liste"]');
      const tazele = () => { if (DD.aktif()?.ad === 'tabaklarim') DD.tazele(); };
      document.addEventListener('dd-kayit', tazele);
      const c = [];
      if (yer) {
        const ciz = () => { yer.innerHTML = liste(s, tumu(ctx)); };
        const seritCiz = () => { kok.querySelector('[data-yuva="filtre"]').innerHTML = `${filtre(s, tumu(ctx))}${tarihCip(s)}`; };
        c.push(
          DD.on(kok, 'ogun', v => { s.ogun = v; ciz(); }),
          DD.eylem(kok, 'temizle', () => { s.ogun = ''; s.tarih = ''; seritCiz(); ciz(); }),
          DD.eylem(kok, 'tarih-temizle', () => { s.tarih = ''; seritCiz(); ciz(); }),
          DD.eylem(kok, 'takvim', async () => {
            const l = tumu(ctx), v = await DD.takvimSheet({baslik: 'Tarih seç', secili: s.tarih || undefined, odak: s.tarih || DD.bugunIso(), min: l[l.length - 1].tarih, max: DD.bugunIso(), noktalar: Object.fromEntries(l.map(k => [k.tarih, ['gecti']]))});
            if (v) { s.tarih = v; seritCiz(); ciz(); }
          })
        );
      }
      return () => { document.removeEventListener('dd-kayit', tazele); c.forEach(f => f()); };
    }
  });
})();
