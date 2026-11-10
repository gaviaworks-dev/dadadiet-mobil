/* Ortak onboarding seti (DDV.onboarding, sıra değişmez). Tek soru tek adım; adım #/onboarding/<id> ile yığına girer, geri tuşu kendiliğinden çalışır.
 * Referans: tasks/referanslar.md Onboarding satırları, §2.9. Yanıtlar DD.durum 'onboarding'; bitince hesap 'plan' (DDV.kullanici alan adları; makro ve suMl Bugün'ün okuduğu adlarla), oturum 'oturum'.
 * #/onboarding/<id>?duzenle=1 tek adımı profilden düzenler, Kaydet planı yeniden hesaplar. #/onboarding/sonuc?hal=hata bağlantı hatası.
 * Hesap: Mifflin-St Jeor × aktivite + tempo farkı (DDV.onboarding.kalori), 50 kcal'a yuvarlanır, enAzKcal altına inmez. Protein ve yağ kas ve sıkılaşma hedefinde web makro aracının g/kg değerleridir. */
(() => {
  const ANAHTAR = 'onboarding', KCAL_KG = 7700, YUVARLA = 50, SU_ML_KG = 30, BKI_ALT = 18.5, BKI_UST = 24.9;
  const ORUC_ENGEL = ['gebelik', 'yeme-bozuklugu'];
  const MAKRO_GKG = {'kas-kazanmak': {P: 2, Y: .8}, sikilasmak: {P: 1.6, Y: .9}};
  const HEDEF_PROGRAM = {'kilo-vermek': ['kilo'], 'formu-korumak': ['dengeli'], 'kas-kazanmak': ['kas', 'protein'], sikilasmak: ['protein', 'kilo'], 'oruc-aliskanligi': ['oruc'], 'saglikli-yasam': ['dengeli', 'seker']};
  const TARZ_ELEYICI = {vegan: ['bitkisel'], vejetaryen: ['vejetaryen', 'bitkisel'], glutensiz: ['glutensiz']};
  const OLCEK = {yavas: 1, dengeli: 3, hizli: 5, hareketsiz: 1, hafif: 2, orta: 4, cok: 5};
  const TARZ_GORSEL = {dengeli: 'mevsim-salatasi', akdeniz: 'sebzeli-levrek-bugulama', 'yuksek-protein': 'yogurtlu-tavuk-sis', vejetaryen: 'firinda-sebze-turlusu', vegan: 'nohut-salatasi', glutensiz: 'sebzeli-pirinc-pilavi', laktozsuz: 'naneli-meyve-salatasi', 'ev-yemekleri': 'kuru-fasulye'};
  const KISA = {cinsiyet: 'Cinsiyet', yas: 'Yaş', boy: 'Boy', kilo: 'Kilo', tempo: 'Tempo', aktivite: 'Aktivite', beslenme: 'Beslenme tarzı', kvkk: 'Veri izni', ritim: 'Öğün ritmi', sonuc: 'Planın'};
  const VURGU = {hedef: 'bir plan', cinsiyet: 'Enerji ihtiyacını', yas: 'yaşa göre', boy: 'Vücut kitle indeksini', kilo: 'yalnız senin planın', tempo: 'Yavaş tempo', aktivite: 'sıradan bir gününü', beslenme: 'Birden fazla', kvkk: 'iznin', ritim: 'Opsiyonel', sonuc: 'bu değerlerle'};
  // İki satıra düşünce justify boşluk açan kısa cümle (kural: metin kısaltılır).
  const ALT = {hedef: 'Sana göre **bir plan** kurmak için başlayalım.'};
  const NEDEN = {
    hedef: 'Hedefin **kalori ve makro önerini** belirler. Kilo hedeflerinde tempo sorusu da buradan açılır.',
    cinsiyet: 'Bazal enerji formülü kadın ve erkek için **farklı bir sabit** kullanır. Yanıtın yalnız bu hesapta geçer.',
    yas: 'Dinlenirken harcadığın enerji **yaşla birlikte** değişir. Hesabı buna göre kuruyoruz.',
    boy: 'Boyun **sağlıklı kilo aralığını** ve bazal enerjini belirler. Hedef kilonu bu aralıkla karşılaştırırız.',
    kilo: 'Kilon **günlük enerji ve su** hesabına girer. Bu değeri diyetisyenin dışında kimse görmez.',
    tempo: 'Tempo, günlük enerjinden **ne kadar eksilteceğimizi** belirler. Daha yavaş tempo genelde daha kolay sürdürülür.',
    aktivite: 'Bazal enerjini **hareket düzeyine** göre çarparak günlük ihtiyacını buluruz.',
    beslenme: 'Tarzın **önerilen programları** süzer. Vegan, vejetaryen ve glütensiz seçimler uymayan menüleri listeden çıkarır.',
    ritim: 'Ritmin **yeme pencereni ve sayacını** kurar. Oruç istemiyorsan bu adımı geçmen yeterli.'
  };

  // ---------- Durum ----------
  const O = () => DDV.onboarding;
  const adim = id => O().adimlar.find(a => a.id === id);
  const secenek = (id, k) => adim(id).secenekler.find(s => s.id === k);
  const kullaniciYaniti = () => {
    const k = DDV.kullanici;
    return {hedef: k.hedef, cinsiyet: k.cinsiyet, yas: k.yas, boyCm: k.boyCm, kiloKg: k.kiloKg, hedefKiloKg: k.hedefKiloKg, tempo: k.tempo, aktivite: k.aktivite, beslenmeTarzi: k.beslenmeTarzi, hassasiyet: k.hassasiyetler, aydinlatma: true, riza: true, kvkk: 'onay', orucProtokolu: (k.orucProtokolu || 'yok').replace(':', '-'), ilkOgunSaati: k.ilkOgunSaati};
  };
  const cevaplar = () => ({...(DD.durum.oku('oturum') ? kullaniciYaniti() : {}), ...DD.durum.oku(ANAHTAR, {})});
  const yaz = c => DD.durum.yaz(ANAHTAR, c);
  const guncelle = ek => yaz({...cevaplar(), ...ek});
  const kayitlar = () => DD.durum.oku('kayitliProgramlar', []);

  const tutar = (k, c) => !k || k.deger.includes(c[k.alan]);
  const gorunen = c => O().adimlar.filter(a => tutar(a.kosul, c));
  const rota = a => (a.id === 'beslenme' ? 'tarz' : a.id);
  const yanitli = (a, c) => (a.tur === 'sonuc' || (a.tur === 'protokol' && c.ritimAtlandi) ? true : a.tur === 'onay' ? c.kvkk != null : c[a.alan] != null);
  // Adres ileri bir adımı gösterse de yanıtlanmamış ilk adımda durulur; düzenlemede istenen adım açılır.
  const konum = (ctx, c) => {
    const l = gorunen(c), id = ctx.param.adim === 'tarz' ? 'beslenme' : ctx.param.adim;
    let i = Math.max(0, l.findIndex(a => a.id === id));
    const eksik = l.findIndex(a => !yanitli(a, c));
    if (!ctx.sorgu.duzenle && eksik >= 0 && eksik < i) i = eksik;
    return {a: l[i], i, l};
  };

  // ---------- Değerler ----------
  const deger = (id, c) => { const a = adim(id); return c[a.alan] ?? a.varsayilan; };
  const kilo = c => deger('kilo', c), boy = c => deger('boy', c);
  const ek = () => adim('kilo').ekAlan;
  const hedefKilo = c => c.hedefKiloKg ?? Math.min(ek().varsayilan, +(kilo(c) * .95).toFixed(1));
  const kiloHedefli = c => tutar(ek().kosul, c);
  const aralik = c => { const m = (boy(c) / 100) ** 2; return [BKI_ALT * m, BKI_UST * m]; };
  const bki = c => kilo(c) / (boy(c) / 100) ** 2;
  const enAzHedef = c => Math.ceil(aralik(c)[0] * 10) / 10;
  // Kilo zaten aralığın altındaysa kilo verme hedefi önerilmez; hedef aralığın altındaysa yukarı çekilir.
  const hedefSorun = c => {
    if (!kiloHedefli(c)) return null;
    if (kilo(c) <= enAzHedef(c)) return 'kilo';
    if (hedefKilo(c) < enAzHedef(c)) return 'dusuk';
    return hedefKilo(c) >= kilo(c) ? 'ust' : null;
  };
  const orucEngel = c => (c.hassasiyet || []).some(h => ORUC_ENGEL.includes(h));
  const protokol = c => (orucEngel(c) ? 'yok' : c.orucProtokolu);
  // plan.orucProtokolu: '16:8' gibi protokol, 'yok' (oruç istemiyor ya da sağlık engeli), null (adım atlandı).
  const orucVar = p => !!p.orucProtokolu && p.orucProtokolu !== 'yok';
  const pencereSaat = p => (p && p !== 'yok' ? +p.split('-')[1] : 0);

  const hafta = (c, acik) => Math.round((kilo(c) - hedefKilo(c)) * KCAL_KG / (acik * 7));
  const hesapla = c => {
    const K = O().kalori, S = adim('sonuc').sonuc, ak = secenek('aktivite', c.aktivite), te = kiloHedefli(c) ? secenek('tempo', c.tempo) : null;
    const bazal = 10 * kilo(c) + 6.25 * boy(c) - 5 * deger('yas', c) + (c.cinsiyet === 'erkek' ? 5 : -161);
    const gunluk = bazal * ak.katsayi, ham = gunluk + (te?.kcalFark || 0);
    const hedefKcal = Math.max(K.enAzKcal, Math.round(ham / YUVARLA) * YUVARLA);
    const orantili = m => Math.round(S.makro[m] * hedefKcal / S.hedefKcal), g = MAKRO_GKG[c.hedef];
    const P = g ? Math.round(kilo(c) * g.P) : orantili('P'), Y = g ? Math.round(kilo(c) * g.Y) : orantili('Y');
    const K_ = g ? Math.max(0, Math.round((hedefKcal - P * 4 - Y * 9) / 4)) : orantili('K');
    const tabanda = ham < K.enAzKcal, acik = te ? (tabanda ? gunluk - hedefKcal : -te.kcalFark) : 0, p = protokol(c), tarz = c.beslenmeTarzi || [];
    return {
      hedef: c.hedef, hedefAd: secenek('hedef', c.hedef).ad, cinsiyet: c.cinsiyet, yas: deger('yas', c), boyCm: boy(c), kiloKg: kilo(c), bmi: +bki(c).toFixed(1),
      hedefKiloKg: kiloHedefli(c) ? hedefKilo(c) : null, tempo: te?.id ?? null, tempoAd: te ? `${te.ad} · ${te.alt.toLocaleLowerCase('tr')}` : null,
      aktivite: ak.id, aktiviteAd: ak.ad, beslenmeTarzi: tarz, beslenmeTarziAd: tarz.map(t => secenek('beslenme', t).ad), hassasiyetler: c.hassasiyet || [],
      hedefKcal, bazalKcal: Math.round(bazal), gunlukEnerjiKcal: Math.round(gunluk), makro: {P, K: K_, Y, Lif: orantili('Lif')}, suMl: Math.round(kilo(c) * SU_ML_KG / 100) * 100,
      orucProtokolu: p ? p.replace('-', ':') : null, ilkOgunSaati: c.ilkOgunSaati || adim('ritim').saatAlani.varsayilan,
      tabanda, tahminiHafta: acik > 0 ? hafta(c, acik) : null
    };
  };

  // Hedef, tarz ve ritim puanlanır; DDV.onboarding sonuç listesi yalnız eşitlik bozar. Elenenler: oruç engeli, tarz eleyicileri.
  const oneriler = (c, p) => {
    const hedefler = HEDEF_PROGRAM[c.hedef] || [], tarz = c.beslenmeTarzi || [], secili = adim('sonuc').sonuc.programlar, oruc = orucVar(p), seker = (c.hassasiyet || []).some(h => ['diyabet', 'insulin-direnci'].includes(h));
    const uyar = x => !(orucEngel(c) && ['oruc', 'detoks'].includes(x.hedef)) && Object.entries(TARZ_ELEYICI).every(([t, l]) => !tarz.includes(t) || l.some(d => x.tercih.includes(d)));
    const puan = x => (hedefler.includes(x.hedef) ? 4 : 0) + (oruc && x.hedef === 'oruc' ? 4 : 0) + (seker && x.hedef === 'seker' ? 3 : 0) + (p.hedefKcal >= x.kcalMin - 100 && p.hedefKcal <= x.kcalMax + 100 ? 2 : 0) + tarz.filter(t => x.tercih.includes(t)).length + (secili.includes(x.slug) ? 1 : 0);
    return DDV.programlar.filter(uyar).map(x => ({x, n: puan(x)})).sort((a, b) => b.n - a.n).slice(0, 3).map(s => s.x);
  };

  // ---------- Adım gövdeleri ----------
  const vurgula = (m, p) => (p && m.includes(p) ? m.replace(p, `**${p}**`) : m);
  const tekSecim = (a, c) => {
    const ogeler = a.secenekler.map(s => (OLCEK[s.id] && a.id !== 'beslenme' ? {...s, ikon: null, olcek: OLCEK[s.id], alt: s.onerilen ? `${s.alt} · Önerilen` : s.alt} : s));
    const secim = DD.secimler({ad: a.alan, ogeler, secili: c[a.alan], duzen: a.secenekler.length === 2 ? 'iki' : 'tek'});
    return a.id === 'tempo' ? `<div class="dd-yigin-24">${secim}<div data-yuva="tempo">${tempoNot(c)}</div></div>` : secim;
  };
  const tempoNot = c => (c.tempo ? DD.ipucu({ikon: 'takvim', metin: `Bu tempoyla hedefine **yaklaşık ${hafta(c, -secenek('tempo', c.tempo).kcalFark)} hafta** içinde varman beklenir. Bu bir tahmindir.`}) : '');
  const slider = (a, deger_) => DD.slider({ad: a.alan, etiket: a.baslik, min: a.min, max: a.max, adim: a.adim, deger: deger_, birim: a.birim, etiketHer: a.adim < 1 ? 10 / a.adim : 10});
  const kiloNot = c => {
    const [alt, ust] = aralik(c), s = hedefSorun(c), hk = DD.ondalik(enAzHedef(c), 1);
    const ozet = DD.ozetSerit([{ikon: 'weight-scale', etiket: 'BKİ', deger: DD.ondalik(bki(c), 1)}, {ikon: 'hedef', etiket: 'Sağlıklı aralık', deger: `${DD.ondalik(alt, 1)}-${DD.ondalik(ust, 1)}`, birim: 'kg'}]);
    const bant = {
      kilo: DD.bant({ton: 'uyari', baslik: 'Kilo vermeyi önermiyoruz', metin: 'Kilon boyuna göre **sağlıklı aralığın altında**. Formunu korumak ya da bir diyetisyenle görüşmek daha uygun olabilir.', eylem: {metin: 'Hedefimi değiştir', git: '#/onboarding/hedef?duzenle=1'}}),
      dusuk: DD.bant({ton: 'uyari', baslik: 'Bu hedef çok düşük', metin: `Hedef kilon boyuna göre **sağlıklı aralığın altında** kalıyor. En az **${hk} kg** önerebiliriz.`, eylem: {metin: `${hk} kg yap`, veri: {eylem: 'hedef-ayarla'}}}),
      ust: DD.bant({metin: 'Hedef kilon **şu anki kilonun altında** olmalı. Korumak istiyorsan hedefini değiştirebilirsin.'})
    }[s];
    return `<div class="dd-yigin-12">${ozet}${bant || ''}</div>`;
  };
  const kiloGovde = (a, c) => {
    const ana = slider(a, kilo(c)), not = `<div data-yuva="kilo-not">${kiloNot(c)}</div>`;
    if (!kiloHedefli(c)) return `<div class="dd-yigin-24">${ana}${not}</div>`;
    return `<div class="dd-yigin-24">${ana}<div class="dd-yigin-12"><h2 class="dd-t-section">${DD.esc(ek().baslik)}</h2><div data-yuva="hedef-slider">${slider(ek(), hedefKilo(c))}</div>${not}</div></div>`;
  };
  const sliderGovde = (a, c) => {
    if (a.id === 'kilo') return kiloGovde(a, c);
    return `<div class="dd-yigin-24">${slider(a, c[a.alan] ?? a.varsayilan)}${a.not ? DD.ipucu({metin: vurgula(a.not, '18 yaş ve üzeri')}) : ''}</div>`;
  };
  const cokluSecim = (a, c) => DD.secimler({ad: a.alan, coklu: true, duzen: 'uc', secili: c[a.alan] || [], ogeler: a.secenekler.map(s => ({id: s.id, ad: s.ad.replace(' ev ', ' ev\u00a0'), gorsel: `assets/gorsel/yemek/${TARZ_GORSEL[s.id]}.webp`}))});

  const orucBant = () => DD.bant({ton: 'uyari', baslik: 'Oruç önermiyoruz', metin: 'Seçtiğin durumda **aralıklı oruç önermiyoruz**. Planını bir diyetisyenle kurman daha güvenli olur.', eylem: {metin: 'Diyetisyen bul', git: '#/uzman/bul'}});
  const hassasNot = c => {
    const l = (c.hassasiyet || []).filter(h => h !== 'yok');
    return l.length ? `<div class="dd-yigin-12">${orucEngel(c) ? orucBant() : ''}${DD.bant({ton: 'bilgi', metin: vurgula(adim('kvkk').hassasiyet.uyari, 'hekimine ve diyetisyenine danış')})}</div>` : '';
  };
  const hassasCipler = c => DD.cipler({ad: 'hassasiyet', tur: 'coklu', serit: false, etiket: 'Hassasiyetler', secili: c.hassasiyet || [], ogeler: adim('kvkk').hassasiyet.secenekler.map(s => ({metin: s.ad, deger: s.id, ikon: s.ikon}))});
  const hassasGovde = c => {
    if (!c.riza) return DD.veriYok('Bu bölüm **açık rızanı** verdiğinde açılır.');
    return `<div class="dd-yigin-12"><div data-yuva="hassas-cip">${hassasCipler(c)}</div><div data-yuva="hassas-not">${hassasNot(c)}</div></div>`;
  };
  const onayGovde = (a, c) => {
    const r = a.acikRiza, h = a.hassasiyet;
    return `<div class="dd-yigin-24">
      <div class="dd-yigin-12">${DD.p(vurgula(r.metin, 'açık rıza veriyorum'))}
        ${DD.kart({html: DD.satirlar([DD.toggle({ad: 'aydinlatma', ikon: 'file-lines', etiket: 'Aydınlatma Metni’ni okudum', secili: c.aydinlatma}), DD.toggle({ad: 'riza', ikon: 'shield-halved', etiket: 'Açık rıza veriyorum', secili: c.riza})])})}
        <div class="dd-sira">${r.baglantilar.map(b => DD.btn({metin: b, tur: 'text', boyut: 'sm', veri: {eylem: 'metin', id: b}})).join('')}</div>
        ${DD.p(vurgula(r.detay, 'dilediğin an geri alabilirsin'), {meta: true, ton: 'ikincil'})}</div>
      <div class="dd-yigin-12">${DD.metinBlok({baslik: h.baslik, metin: vurgula(h.altMetin, 'Opsiyonel'), rol: 'section', h: 2})}<div data-yuva="hassas">${hassasGovde(c)}</div></div>
    </div>`;
  };

  const kadran = c => {
    const s = adim('ritim').saatAlani, p = protokol(c), v = c.ilkOgunSaati || s.varsayilan;
    return DD.saatKadran({ad: s.alan, deger: v, pencereSaat: pencereSaat(p), etiket: 'İlk öğün', adim: s.adimDk, min: s.min, max: s.max});
  };
  const ritimGovde = (a, c) => {
    const engel = orucEngel(c), ogeler = engel ? a.secenekler.filter(s => s.id === 'yok') : a.secenekler, s = a.saatAlani;
    return `<div class="dd-yigin-24">${engel ? orucBant() : ''}${DD.secimler({ad: a.alan, ogeler, secili: protokol(c), duzen: 'tek'})}<div class="dd-yigin-12"><h2 class="dd-t-section">${DD.esc(s.baslik)}</h2><div data-yuva="kadran">${kadran(c)}</div></div></div>`;
  };

  const GOVDE = {'tek-secim': tekSecim, slider: sliderGovde, 'coklu-secim': cokluSecim, onay: onayGovde, protokol: ritimGovde};
  const gecerli = (a, c) => {
    if (a.tur === 'tek-secim') return c[a.alan] != null;
    if (a.tur === 'coklu-secim') return !!c[a.alan]?.length;
    if (a.tur === 'onay') return !!(c.aydinlatma && c.riza);
    if (a.tur === 'protokol') return protokol(c) != null;
    return a.id !== 'kilo' || !hedefSorun(c);
  };
  const atla = a => ({beslenme: 'Atla', kvkk: 'Sonra', ritim: 'Atla'}[a.id]);
  const altYazi = (a, c, son) => {
    if (a.id === 'beslenme' && c.beslenmeTarzi?.length) return `${c.beslenmeTarzi.length} seçili`;
    return son ? `Sıradaki: ${KISA[son.id]}` : '';
  };
  const adimHtml = (ctx, c) => {
    const {a, i, l} = konum(ctx, c), duzen = !!ctx.sorgu.duzenle;
    if (a.tur === 'sonuc') return sonucHtml(ctx, c, i + 1, l.length);
    return DD.onbSablon({
      adim: duzen ? 1 : i + 1, toplam: duzen ? 1 : l.length,
      baslik: a.baslik, alt: ALT[a.id] || vurgula(a.altMetin, VURGU[a.id]), neden: NEDEN[a.id] ? 'Neden soruyoruz?' : null,
      atla: !duzen && atla(a) ? {metin: atla(a), veri: {eylem: 'atla'}} : null,
      devam: {metin: duzen ? 'Kaydet' : a.buton || 'Devam', pasif: !gecerli(a, c), veri: {eylem: 'devam'}},
      altMetin: duzen ? '' : altYazi(a, c, l[i + 1]),
      html: GOVDE[a.tur](a, c)
    });
  };

  // ---------- Sonuç ----------
  const ANALIZ = ['Enerji ihtiyacın hesaplanıyor', 'Makroların dengeleniyor', 'Programlar süzülüyor'];
  const projeksiyon = (c, p) => {
    if (!p.tahminiHafta) return '';
    const k = kilo(c), h = p.hedefKiloKg, n = 13, seri = Array.from({length: n}, (_, i) => { const t = i / (n - 1); return {etiket: `${Math.round(p.tahminiHafta * t)}. hafta`, deger: k - (k - h) * (1 - (1 - t) ** 1.5)}; });
    return DD.grafikKart({deger: DD.ondalik(h, 1), birim: 'kg', fark: 'Tahmini', cumle: `Seçtiğin tempoyla **yaklaşık ${p.tahminiHafta} hafta**. Süre kişiden kişiye değişir.`, grafik: DD.grafik({seri, tur: 'spark', hedef: h, birim: 'kg', ondalik: 1})});
  };
  const planKart = p => {
    const m = p.makro;
    return DD.kart({html: `<div class="dd-yigin">${DD.halka({hedef: p.hedefKcal, planli: p.hedefKcal, boyut: 'md', etiket: 'Günlük hedef', alt: 'kcal'})}${DD.ozetSerit([{etiket: 'Protein', deger: DD.sayi(m.P), birim: 'g'}, {etiket: 'Karb.', deger: DD.sayi(m.K), birim: 'g'}, {etiket: 'Yağ', deger: DD.sayi(m.Y), birim: 'g'}, {etiket: 'Lif', deger: DD.sayi(m.Lif), birim: 'g'}])}</div>`});
  };
  const ritimSatir = p => (orucVar(p) ? {ikon: 'hourglass-half', etiket: 'Oruç & Saatler', deger: p.orucProtokolu} : {ikon: 'utensils', etiket: 'İlk öğün', deger: p.ilkOgunSaati});
  const sonucGovde = (c, p) => {
    const S = adim('sonuc').sonuc, l = oneriler(c, p), hassas = p.hassasiyetler.filter(h => h !== 'yok').length;
    const bantlar = [
      orucEngel(c) && orucBant(),
      hassas && !orucEngel(c) && DD.bant({ton: 'uyari', metin: vurgula(adim('kvkk').hassasiyet.uyari, 'hekimine ve diyetisyenine danış')}),
      p.tabanda && DD.bant({metin: `Hesap **${DD.sayi(O().kalori.enAzKcal)} kcal** altına indiği için hedefini bu değerde tuttuk.`}),
      c.kvkk === 'sonra' && DD.bant({metin: 'Açık rıza vermedin; planın **yalnız bu cihazda** kaldı. Dilediğinde Profil’den izin verebilirsin.'})
    ].filter(Boolean).join('');
    return `<div class="dd-yigin">
      ${planKart(p)}
      ${DD.ozetSerit([{ikon: 'droplet', etiket: 'Su', deger: DD.ondalik(p.suMl / 1000, 1), birim: 'L'}, {ikon: 'fire', etiket: 'Bazal', deger: DD.sayi(p.bazalKcal), birim: 'kcal'}, ritimSatir(p)])}
      ${bantlar}
      ${projeksiyon(c, p)}
      <div class="dd-yigin-12">${DD.bas('Sana önerilen programlar')}${l.length ? l.map(x => DD.programKart(x, {tur: 'row', kayitli: kayitlar().includes(x.slug)})).join('') : DD.bos({ikon: 'program', baslik: 'Uyan program çıkmadı', metin: 'Seçimlerine uyan **hazır menü** yok. Program Bul ile başka seçenekleri deneyebilirsin.', eylem: {metin: 'Program Bul', git: '#/program-bul'}})}</div>
      ${DD.ipucu({ikon: 'user-doctor', baslik: S.diyetisyenCta.baslik, metin: vurgula(S.diyetisyenCta.metin, 'ilerlemeni birlikte'), eylem: {metin: S.diyetisyenCta.buton, git: '#/uzman/bul'}})}
      ${DD.bant({metin: vurgula(S.bilgi, 'tahminidir')})}
    </div>`;
  };
  const sonucHtml = (ctx, c, n, toplam) => {
    const a = adim('sonuc');
    if (ctx.sorgu.hal === 'hata' && !ctx.tekrar) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', veri: {eylem: 'tekrar'}}, ikinciller: []});
    if (!ctx.hazir) return DD.onbSablon({adim: n, toplam, baslik: 'Planın hazırlanıyor', alt: 'Yanıtlarını **Mifflin-St Jeor** formülüyle hesaplıyoruz.', devam: false, html: `<div data-yuva="analiz">${DD.analizAdimlari({adimlar: ANALIZ, etkin: ctx.analiz || 0})}</div>`});
    return DD.onbSablon({adim: n, toplam, baslik: a.baslik, alt: vurgula(a.altMetin, VURGU.sonuc), devam: {metin: 'Bugün’e geç', veri: {eylem: 'basla'}}, html: sonucGovde(c, hesapla(c))});
  };

  // ---------- Sheet'ler ----------
  const nedenSheet = a => DD.sheet({baslik: 'Neden soruyoruz?', html: DD.p(NEDEN[a.id])});
  const metinSheet = ad => { const r = adim('kvkk').acikRiza; DD.sheet({baslik: ad, html: `<div class="dd-yigin">${DD.p(vurgula(r.detay, 'belirtilen amaç'))}${DD.p('Verilerin **Dada Diet** tarafından planını kurmak için kullanılır; izin vermediğin sürece diyetisyeninle ya da üçüncü kişilerle paylaşılmaz.')}</div>`}); };

  // ---------- Bağlar ----------
  const yuva = (kok, ad, html) => { const el = kok.querySelector(`[data-yuva="${ad}"]`); if (el) el.innerHTML = html; return el; };

  DD.ekran('onboarding', {
    tur: 'tam',
    tabagim: false,
    ust: '#/karsilama',
    yenile: true,
    ciz: ctx => adimHtml(ctx, cevaplar()),
    sonra: (kok, ctx) => {
      const c0 = cevaplar(), {a, i, l} = konum(ctx, c0), offs = [], duzen = !!ctx.sorgu.duzenle;
      const hazirla = () => { const b = kok.querySelector('[data-eylem="devam"]'); if (b) b.disabled = !gecerli(a, cevaplar()); };
      const planYaz = c => { DD.durum.yaz('plan', hesapla(c)); document.dispatchEvent(new CustomEvent('dd-plan')); };
      const ileri = () => {
        if (!duzen) { DD.git(`#/onboarding/${rota(l[i + 1])}`); return; }
        planYaz(cevaplar());
        DD.toast('**Planın** güncellendi', {tur: 'basari'});
        DD.geri('#/profil');
      };

      if (a.tur === 'sonuc') {
        let iptal = false;
        offs.push(DD.eylem(kok, 'tekrar', () => { ctx.tekrar = true; DD.tazele(); }));
        offs.push(DD.eylem(kok, 'kaydet', el => { const id = el.dataset.id, on = el.getAttribute('aria-pressed') !== 'true', l = kayitlar().filter(x => x !== id); DD.durum.yaz('kayitliProgramlar', on ? [...l, id] : l); }));
        offs.push(DD.eylem(kok, 'basla', () => {
          const {giris, ...c} = cevaplar();
          yaz(c); planYaz(c); DD.durum.yaz('oturum', {yol: giris || 'eposta'});
          DD.yerine('#/bugun');
        }));
        if (!ctx.hazir && !(ctx.sorgu.hal === 'hata' && !ctx.tekrar)) {
          const adimla = n => {
            if (iptal) return;
            if (n >= ANALIZ.length) { ctx.hazir = true; DD.tazele(); return; }
            ctx.analiz = n; yuva(kok, 'analiz', DD.analizAdimlari({adimlar: ANALIZ, etkin: n}));
            setTimeout(() => adimla(n + 1), DD.azHareket() ? 0 : DD.TK.motion.reveal);
          };
          adimla(ctx.analiz || 0);
        }
        return () => { iptal = true; offs.forEach(f => f()); };
      }

      offs.push(DD.eylem(kok, 'neden', () => nedenSheet(a)));
      offs.push(DD.eylem(kok, 'devam', () => {
        if (a.tur === 'slider') guncelle({[a.alan]: deger(a.id, cevaplar()), ...(a.id === 'kilo' && kiloHedefli(cevaplar()) ? {hedefKiloKg: hedefKilo(cevaplar())} : {})});
        if (a.tur === 'onay') guncelle({kvkk: 'onay'});
        if (a.tur === 'protokol') guncelle({orucProtokolu: protokol(cevaplar()), ritimAtlandi: false});
        ileri();
      }));
      offs.push(DD.eylem(kok, 'atla', () => {
        if (a.id === 'beslenme') { guncelle({beslenmeTarzi: []}); ileri(); return; }
        if (a.id === 'ritim') { guncelle({orucProtokolu: null, ritimAtlandi: true}); ileri(); return; }
        DD.dialog({baslik: 'Rıza vermeden devam et', metin: 'Planın **yalnız bu cihazda** hesaplanır, sağlık bilgilerin kaydedilmez ve diyetisyeninle paylaşılmaz.', eylem: 'Devam et', iptal: 'Vazgeç'}).then(ok => {
          if (ok) { guncelle({kvkk: 'sonra', riza: false, aydinlatma: false, hassasiyet: []}); ileri(); }
        });
      }));

      if (a.tur === 'tek-secim') offs.push(DD.on(kok, a.alan, v => { const c = guncelle({[a.alan]: v}); hazirla(); if (a.id === 'tempo') yuva(kok, 'tempo', tempoNot(c)); }));
      if (a.tur === 'coklu-secim') offs.push(DD.on(kok, a.alan, v => {
        const c = guncelle({[a.alan]: v}), alt = kok.querySelector('.dd-onb-alt small');
        hazirla();
        if (alt) alt.textContent = altYazi(a, c, l[i + 1]);
      }));
      if (a.tur === 'slider') {
        // Uyarı ilk çıktığında düğmesi kaydırma alanının altında kalmasın.
        let sorun = hedefSorun(c0);
        const notCiz = c => {
          const el = yuva(kok, 'kilo-not', kiloNot(c)), s = hedefSorun(c);
          if (s && s !== sorun) el.scrollIntoView({block: 'end', behavior: DD.azHareket() ? 'auto' : 'smooth'});
          sorun = s; hazirla();
        };
        offs.push(DD.on(kok, a.alan, v => { const c = guncelle({[a.alan]: v}); if (a.id === 'kilo') notCiz(c); else hazirla(); }));
        if (a.id === 'kilo') {
          offs.push(DD.on(kok, ek().alan, v => notCiz(guncelle({hedefKiloKg: v}))));
          offs.push(DD.eylem(kok, 'hedef-ayarla', () => {
            const c = guncelle({hedefKiloKg: enAzHedef(cevaplar())});
            yuva(kok, 'hedef-slider', slider(ek(), c.hedefKiloKg)); notCiz(c);
          }));
        }
      }
      if (a.tur === 'onay') {
        offs.push(DD.eylem(kok, 'metin', el => metinSheet(el.dataset.id)));
        offs.push(DD.on(kok, 'aydinlatma', v => { guncelle({aydinlatma: v}); hazirla(); }));
        offs.push(DD.on(kok, 'riza', v => { const c = guncelle({riza: v, ...(v ? {} : {hassasiyet: []})}); yuva(kok, 'hassas', hassasGovde(c)); hazirla(); }));
        // "Yok" diğer seçimleri kaldırır, başka bir seçim "Yok"u kaldırır.
        offs.push(DD.on(kok, 'hassasiyet', v => {
          const once = cevaplar().hassasiyet || [], yeniYok = v.includes('yok') && !once.includes('yok');
          const c = guncelle({hassasiyet: yeniYok ? ['yok'] : v.filter(h => h !== 'yok')});
          yuva(kok, 'hassas-cip', hassasCipler(c)); yuva(kok, 'hassas-not', hassasNot(c));
        }));
      }
      if (a.tur === 'protokol') {
        offs.push(DD.on(kok, a.alan, v => { const c = guncelle({[a.alan]: v}); yuva(kok, 'kadran', kadran(c)); hazirla(); }));
        offs.push(DD.on(kok, a.saatAlani.alan, v => guncelle({[a.saatAlani.alan]: v})));
      }
      return () => offs.forEach(f => f());
    }
  });
})();
