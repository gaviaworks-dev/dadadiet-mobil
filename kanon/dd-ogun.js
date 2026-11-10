/* Öğün Hatırlatıcı: mobil durumunu DDOgun motorunun (dd-ogun-motor.js, web ile aynı dosya) girdisine çevirir. Ekranlar yalnız DD.ogun'u çağırır.
 * Öncelik: diyetisyen planı > elle girilen > şablon. Durum anahtarları (DD.durum):
 *   ogun-hatirlatma {acik, once_dk, ara_sayisi} (varsayılan kapalı) · ogun-saatleri [{tur, saat|null, aktif}] (yalnız üyenin değiştirdikleri)
 *   ogun-zaman {iso:{tur:'SS:DD'}} gerçek yenme saati · bildirim-izin 'verildi'|'reddedildi' · sessiz saat su-sessiz ile ortaktır.
 * Öğün türleri kahvalti, ogle, ara1, ara2, aksam; Bugün'ün 'ara' öğünü ara1'dir. Her yazımda document'e 'dd-ogun' olayı gider. */
(() => {
  const DD = window.DD, OG = window.DDOgun, V = () => window.DDV || {};
  const sablon = () => V().ogunSablonu || {kurallar: []};
  const TUR = id => (id === 'ara' ? 'ara1' : id), ID = tur => (tur === 'ara1' ? 'ara' : tur);
  const onek = () => (DD.yeniHesap() ? 'yeni' : 'bugun');
  const yayinla = () => document.dispatchEvent(new CustomEvent('dd-ogun'));
  const simdi = () => V().bugun?.simdi || '17:10';
  const noktali = s => OG.bicim(s);

  const ayar = () => { const s = sablon(); return {acik: false, once_dk: s.varsayilan_once_dk || 0, ara_sayisi: s.varsayilan_ara_sayisi ?? 1, ...DD.durum.oku('ogun-hatirlatma', {})}; };
  const ayarYaz = d => { DD.durum.yaz('ogun-hatirlatma', {...ayar(), ...d}); yayinla(); };
  const saatler = () => DD.durum.oku('ogun-saatleri', []);
  const saatlerYaz = l => { DD.durum.yaz('ogun-saatleri', l); yayinla(); };
  const izin = () => DD.durum.oku('bildirim-izin', null);
  const izinYaz = v => { DD.durum.yaz('bildirim-izin', v); yayinla(); };
  // Bildirim gerçekten gider mi: hatırlatıcı açık ve sistem izni verilmiş
  const etkin = () => ayar().acik && izin() === 'verildi';

  const profil = () => ({...(DD.yeniHesap() ? {} : V().kullanici), ...(DD.durum.oku('plan', null) || {})});
  // Oruç: protokol şablonda tanımlıysa kahvaltı = ilk öğün saati, pencere dışı öğün pencereye çekilir
  const oruc = () => {
    const p = profil(), kod = String(p.orucProtokolu || '').replace(':', '-');
    return (sablon().oruc_yeme_saati || {})[kod] ? {protokol: kod, ilk_ogun_saati: p.ilkOgunSaati || '12:00'} : null;
  };
  const ilkOgunYaz = saat => { DD.durum.yaz('plan', {...(DD.durum.oku('plan', null) || {}), orucProtokolu: profil().orucProtokolu, ilkOgunSaati: saat}); yayinla(); };
  // Diyetisyen planı: diyetisyeni olan üyede bugünün öğünleri ve saatleri plandan gelir. Yoksa undefined (üyenin kendi düzeni).
  const diyetisyenli = () => !DD.yeniHesap() && !!V().kullanici?.diyetisyen;
  const plan = () => (diyetisyenli() ? (V().bugun?.ogunler || []).map(o => ({tur: TUR(o.id), saat: o.saat, ad: o.ad})) : undefined);
  const sessiz = () => { const s = DD.suHatirlatmaDurum(); return s.bas === s.bit ? null : `${s.bas}-${s.bit}`; };

  // Günün işaretleri: Bugün'ün öğün durumu (bugun-ogun, bugun-ek) + gerçek saat (ogun-zaman)
  const isaretler = () => {
    const d = DD.durum.oku(`${onek()}-ogun`, {}), ek = DD.durum.oku(`${onek()}-ek`, {}), z = DD.durum.oku('ogun-zaman', {})[DD.bugunIso()] || {}, l = {};
    (V().bugun?.ogunler || []).forEach(o => {
      const t = TUR(o.id), x = d[o.id]?.durum, taban = !DD.yeniHesap() && o.durum === 'dolu';
      if (x === 'atlandi') l[t] = {durum: 'atladi', saat: null};
      else if (x === 'dolu' || x === 'degisti' || (ek[o.id] || []).length || taban) l[t] = {durum: 'yedi', saat: z[t] || (taban ? o.saat : null)};
    });
    Object.keys(z).forEach(t => { if (!l[t]) l[t] = z[t] === 'atla' ? {durum: 'atladi', saat: null} : {durum: 'yedi', saat: z[t] === true ? null : z[t]}; });
    return l;
  };
  // Tek çağrı. o: {ayar, saatler, oruc, duz} — duz: işaret ve şimdi olmadan üyenin kendi düzeni (Öğün saatleri formu)
  const hesap = (o = {}) => {
    const a = o.ayar || ayar();
    return OG.hesapla({
      sablon: sablon(), uye: {ara_sayisi: a.ara_sayisi, saatler: o.saatler || saatler()}, plan: o.duz ? undefined : plan(),
      isaretler: o.duz ? {} : isaretler(), oruc: o.oruc !== undefined ? o.oruc : oruc(), once_dk: a.once_dk, sessiz: sessiz(), simdi: o.duz ? null : simdi()
    });
  };
  // Yedim / Atladım / geri al (durum null). Bugün'ün öğün durumuna da yazılır; gerçek saat planlanana ±3 sa yakınsa kaydedilir.
  const isaretle = (tur, durum) => {
    const id = ID(tur), iso = DD.bugunIso(), z = DD.durum.oku('ogun-zaman', {}), gun = {...(z[iso] || {})};
    const o = hesap().ogunler.find(x => x.tur === tur), s = simdi();
    if (durum === 'yedi') gun[tur] = o && Math.abs(OG.dk(s) - OG.dk(o.planlanan)) <= 180 ? s : true;
    else if (durum === 'atladi') gun[tur] = 'atla';
    else delete gun[tur];
    DD.durum.yaz('ogun-zaman', {...z, [iso]: gun});
    if ((V().bugun?.ogunler || []).some(x => x.id === id)) {
      const l = DD.durum.oku(`${onek()}-ogun`, {});
      if (durum) l[id] = {durum: durum === 'yedi' ? 'dolu' : 'atlandi'}; else delete l[id];
      DD.durum.yaz(`${onek()}-ogun`, l);
    }
    yayinla();
  };
  // Sıradaki öğün önerisi: plandaki öğünün içeriği; yoksa kalan enerjinin şablon payı + tabak kuralı
  const oneri = (ogun, h) => {
    const b = (V().bugun?.ogunler || []).find(x => x.id === ID(ogun.tur));
    if (plan() && b?.besinler?.length) return `${b.besinler.slice(0, 3).map(x => x.ad).join(', ')}${b.besinler.length > 3 ? ' ve diğerleri' : ''} · ${DD.sayi(b.kcal)} kcal`;
    const tabak = /^ara/.test(ogun.tur) ? 'Bir meyve ya da bir kâse yoğurt, yanında bir avuç kuruyemiş.' : 'Tabağın yarısı sebze, çeyreği protein, çeyreği tam tahıl.';
    const hedef = profil().hedefKcal || DD.durum.oku('kisa-hedef', null)?.kcal;
    if (!hedef || !h) return tabak;
    const kalanTur = h.ogunler.filter(x => ['simdi', 'siradaki', 'sonra'].includes(x.durum)).map(x => x.tur);
    const pay = OG.enerjiPayi(sablon(), kalanTur, ogun.tur, hedef);
    return pay ? `Bu öğüne yaklaşık ${DD.sayi(pay)} kcal düşüyor. ${tabak}` : tabak;
  };
  const ozet = h => h.ogunler.filter(o => o.durum !== 'kapali').map(o => `${o.ad} ${noktali(o.planlanan)}`).join(' · ');
  // Bildirim metni: kilit ekranı önizlemesi, bildirim listesi ve uygulama içi kart aynı metni kullanır
  const bildirim = (o, h) => ({
    saat: noktali(o.hatirlatma || o.planlanan), baslik: `Öğün zamanı: ${o.ad}`,
    metin: `${o.hatirlatma && o.hatirlatma !== o.planlanan ? `${noktali(o.planlanan)}${OG.ekDe(o.planlanan)} · ` : ''}${oneri(o, h)}`
  });
  // Bildirimler akışı: saati gelmiş, işaretlenmemiş, sessiz saate düşmeyen öğünler (hatırlatıcı açık ve izin verilmişse)
  const bildirimler = () => {
    if (!etkin()) return [];
    const h = hesap(), s = OG.dk(simdi());
    return h.ogunler.filter(o => o.hatirlatma && !o.sessiz && OG.dk(o.hatirlatma) <= s && ['simdi', 'gecti', 'siradaki', 'sonra'].includes(o.durum))
      .map(o => ({id: `ogn-${DD.bugunIso()}-${o.tur}`, tur: 'ogun', ikon: o.ikon, ...bildirim(o, h), zaman: noktali(o.hatirlatma), grup: 'Bugün', okundu: false, hedef: 'profil', ogun: o.tur}));
  };
  DD.ogun = {ayar, ayarYaz, saatler, saatlerYaz, izin, izinYaz, etkin, oruc, ilkOgunYaz, plan, diyetisyenli, sessiz, isaretler, hesap, isaretle, oneri, ozet, bildirim, bildirimler, sablon, noktali, TUR, ID};
})();
