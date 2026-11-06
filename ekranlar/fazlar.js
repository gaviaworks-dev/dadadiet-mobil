/* SCR-21 Biyolojik fazlar (#/ritim/fazlar). Referans: BodyFast çizelge yapısı, Zero kart şeridi, Gentler Streak tonu (tasks/referanslar.md Ritim).
 * Etkin faz ritim.js'in kaydından okunur: 'ritim-durum', 'ritim-kayit'; onboarding 'plan'ı değiştiyse kayıt yok sayılır, varsayılan plandan hesaplanır.
 * Saatler kesin değil, her yerde "tahmini" yazılır. #/ritim/fazlar?hal=hata hata hali.
 */
(() => {
  const yerel = s => new Date(s.slice(0, 16)).getTime();
  let hataGosterildi = false, acilis = Date.now();
  const ilkKelimeler = (s, n = 2) => { const l = s.split(' '); return `**${l.slice(0, n).join(' ')}** ${l.slice(n).join(' ')}`; };
  const ilkCumle = m => m.replace(/^([^.]+\.)/, '**$1**');
  const GUN_MS = 864e5;
  const simdiMs = k => DD.simdi().getTime() + Date.now() - (k.capa ?? acilis);
  const planOku = () => { const p = DD.durum.oku('plan', null), id = p?.orucProtokolu?.replace(':', '-'), x = DDV.ritim.protokoller.find(r => r.id === id); return x && !x.haftalik ? {x, ilk: p.ilkOgunSaati} : null; };
  // ritim.js varsayilan() ile aynı kural: ilk öğün saati ve pencere uzunluğu şu anın hangi evrede olduğunu belirler.
  const varsayilan = p => {
    if (!p) return {d: DDV.ritim.aktifDurum, bas: yerel(DDV.ritim.durumlar.pencere.baslangic)};
    const su = DD.simdi().getTime(), ilk = new Date(su).setHours(0, 0, 0, 0) + DD.saatDk(p.ilk) * 6e4, son = ilk + p.x.pencereSaat * 36e5;
    if (su < ilk) return {d: 'oruc', bas: ilk - p.x.orucSaat * 36e5};
    return su < son ? {d: 'pencere', bas: ilk} : {d: 'oruc', bas: son};
  };
  const durum = () => {
    const p = planOku(), pl = DD.durum.oku('plan', null), ham = DD.durum.oku('ritim-kayit', null), uyumlu = (ham?.planImza ?? null) === (pl ? `${pl.orucProtokolu ?? 'atlandi'}@${pl.ilkOgunSaati}` : null), taze = uyumlu && ham && (!ham.capa || Date.now() - ham.capa < GUN_MS);
    const k = {protokol: p?.x.id ?? DDV.ritim.aktifProtokol, ...(taze ? ham : {})}, v = varsayilan(p);
    return {k, d: taze ? DD.durum.oku('ritim-durum', v.d) : v.d, bas: k.bas ?? v.bas};
  };
  const gecenDk = z => Math.max(0, (simdiMs(z.k) - z.bas) / 6e4);

  // Son fazın metni 16:8 için yazılmıştır; başka planda hedef yazısı plana uydurulur.
  const fazlar = plan => DDV.ritim.fazlar.map(f => {
    let aciklama = f.aciklama;
    if (f.bitisSaat == null && plan.id !== '16-8') aciklama = plan.orucSaat <= f.baslangicSaat ? f.aciklama.replace('16:8 hedefin', `${plan.ad} hedefin`) : `16 saati geçtin; planındaki hedef **${plan.orucSaat} saat**. Daha uzun süreleri diyetisyeninle konuş.`;
    return {...f, aralik: `Tahmini ${f.aralik}`, kisa: ilkKelimeler(f.kisa), aciklama: aciklama.includes('**') ? aciklama : ilkCumle(aciklama)};
  });

  const durumPil = (z, plan) => {
    const oruc = z.d === 'oruc', dk = gecenDk(z), hedef = (oruc ? plan.orucSaat : plan.pencereSaat) * 60, kalan = Math.ceil(hedef - dk), d = DDV.ritim.durumlar[z.d];
    return DD.orucPil({durum: z.d, baslik: d.rozet, alt: kalan > 0 ? `${DD.sure(kalan)} kaldı` : oruc ? 'Hedefine ulaştın' : 'Pencere süresi doldu', oran: dk / hedef, geri: true});
  };

  const ciz = () => {
    const R = DDV.ritim, z = durum(), plan = R.protokoller.find(p => p.id === z.k.protokol), pl = DD.durum.oku('plan', null), engel = (pl?.hassasiyetler || []).some(h => ['gebelik', 'yeme-bozuklugu'].includes(h)), kapali = engel || (pl?.orucProtokolu === 'yok' && !z.k.bas), oruc = z.d === 'oruc' && !plan.haftalik && !kapali, s = oruc ? gecenDk(z) / 60 : null;
    const etkin = oruc ? R.fazlar.find(f => s >= f.baslangicSaat && (f.bitisSaat == null || s < f.bitisSaat))?.id : null;
    return DD.bolumler([
      `<div class="dd-yigin">${DD.metinBlok({baslik: 'Oruç saatlerinde neler olur?', metin: engel ? 'Bu bilgiler **genel amaçlıdır**; sağlık bilgilerine göre oruç sana önerilmiyor.' : kapali ? 'Bu bilgiler **genel amaçlıdır**; bir oruç planı seçmedin.' : oruc ? 'Aşağıdaki aşamalar **tahminidir**; bedenin kendi temposunda ilerler.' : 'Orucu başlattığında **bulunduğun aşama** burada işaretlenir.'})}${plan.haftalik || kapali ? '' : durumPil(z, plan)}${DD.bant({metin: R.fazNotu.replace('genel bilgidir', '**genel bilgidir**')})}</div>`,
      {baslik: 'Tahmini aşamalar', html: DD.fazCizelge({fazlar: fazlar(plan), etkin})},
      {baslik: 'İzinli sıvılar', html: `<div class="dd-yigin-12">${DD.p('Oruç saatlerinde **kalorisiz içecekler** serbest; şeker ve süt eklenmez.', {ton: 'ikincil'})}${DD.parcali(R.izinliSiviler.map(x => ({ikon: x.ikon, baslik: x.ad, bilgi: true})), {kutu: 'izgara', aria: 'İzinli sıvılar'})}</div>`},
      {baslik: 'Bilmen gerekenler', html: `<div class="dd-yigin-12">${DD.ako({baslik: 'Orucu bozan içecekler', html: DD.satirlar(R.izinsizler.map(x => ({ikon: x.ikon, baslik: x.ad, ok: false})))})}${DD.ako({baslik: 'Kimler için uygun değil?', html: `<div class="dd-yigin-12">${DD.p('Aralıklı açlık **herkese uygun değildir**. Aşağıdaki durumlarda başlamadan hekimine danış.', {ton: 'ikincil'})}${DD.satirlar(R.uygunDegil.map(x => ({ikon: 'bilgi', baslik: x, ok: false})))}</div>`})}${DD.bant({ikon: 'bilgi', metin: R.sorumlulukNotu.replace('genel bilgi amaçlıdır', '**genel bilgi amaçlıdır**')})}</div>`}
    ]);
  };

  DD.ekran('fazlar', {
    tur: 'alt',
    nav: 'ritim',
    ust: '#/ritim',
    baslik: 'Biyolojik fazlar',
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz,
    altBar: () => DD.altEylem({dugmeler: [{metin: 'Diyetisyenime sor', ikon: 'mesaj', tam: true, git: '#/uzman/sohbet'}]}),
    yenile: true
  });
})();
