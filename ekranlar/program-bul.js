/* Program Bul: web'in 5 adımı (DDV.programBul). Adım ?adim=2 ile yığına girer, geri tuşu kendiliğinden çalışır; sonuç ?adim=sonuc.
 * Eşleşme web'deki ProgramEslemeServisi ile aynı: güvenlik kapısı, eleyiciler, puan, aynı puanda yaşam düzeni çeşitliliği. */
(() => {
  const ANAHTAR = 'program-bul', TOPLAM = 5, EN_DUSUK_KCAL = 1400;
  const B = () => DDV.programBul;
  const VURGU = {1: 'en belirleyici adımı', 2: 'uygun programların', 3: 'Uyumsuz programları', 4: 'hazırlama süresi', 5: 'uzman desteğiyle'};
  const fold = s => String(s).toLocaleLowerCase('tr').replace(/[çğıöşü]/g, c => ({ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u'}[c]));
  const vurgula = (m, p) => m.replace(p, `**${p}**`);
  const cevaplar = () => DD.durum.oku(ANAHTAR, {}) || {};
  const yaz = c => DD.durum.yaz(ANAHTAR, c);
  const aktif = () => DD.durum.oku('aktifProgram', DD.yeniHesap() ? null : DDV.kullanici.aktifProgram);
  const kayitlar = () => DD.durum.oku('kayitliProgramlar', []);
  const secenek = (alan, deger) => B().adimlar.flatMap(a => a.gruplar).find(g => g.alan === alan)?.secenekler.find(x => x.deger === deger);

  // ---------- Program içeriği: menü kalemlerinden türetilir, gluten yalnız etiketten (web ölçümü: 8 program) ----------
  const ICERIK = {
    laktoz: [/(^|\s)(sut|sutlu|yogurt|yogurd|peynir|peynirli|ayran|kefir|tereyag|kaymak|sutlac|muhallebi|kazandibi|keskul|labne|lor|kasar|krema|cacik|haydari)/, /(badem|soya|yulaf|bitkisel|hindistan cevizi) sutu|soya yogurdu|laktozsuz/],
    yumurta: [/yumurta|omlet|mayonez|eriste|menemen/],
    kuruyemis: [/findik|fistik|badem|ceviz|kaju|leblebi|kuruyemis/],
    balik: [/balik|hamsi|\bton\b|somon|levrek|cipura|sardalya|palamut|uskumru|alabalik|mezgit|lufer|deniz urun|karides|midye|kalamar|ahtapot/],
    soya: [/soya|tofu|tempeh|natto|edamame/],
    susam: [/susam|tahin|simit|helva|humus/]
  };
  const ALERJEN = {'Gluten': 'gluten', 'Kabuklu deniz ürünleri': 'balik', 'Yumurta': 'yumurta', 'Balık': 'balik', 'Yer fıstığı': 'kuruyemis', 'Soya': 'soya', 'Süt (laktoz)': 'laktoz', 'Sert kabuklu yemişler': 'kuruyemis', 'Susam': 'susam', 'Yumuşakçalar': 'balik'};
  const KISIT_AD = {laktoz: 'süt ürünü', gluten: 'gluten', yumurta: 'yumurta', kuruyemis: 'kuruyemiş', balik: 'balık ve deniz ürünü', soya: 'soya', susam: 'susam'};
  const icerikler = new Map();
  const icerir = (p, kisit) => {
    if (kisit === 'gluten') return !p.tercih.includes('glutensiz');
    if (!icerikler.has(p.slug)) icerikler.set(p.slug, (DDV.programGunleri?.[p.slug] || []).flatMap(g => g.ogunler.flatMap(o => o.kalemler)).map(fold));
    const l = icerikler.get(p.slug), [var_, yok] = ICERIK[kisit];
    return !l.length || l.some(k => var_.test(k) && !yok?.test(k));
  };
  const kisitlar = c => [...new Set([...(c.tercih === 'laktozsuz' ? ['laktoz'] : []), ...(c.alerjen || []).map(a => ALERJEN[a]).filter(Boolean)])];
  const icerikGerekli = c => kisitlar(c).some(k => k !== 'gluten');

  // ---------- Kurallar ----------
  const havuz = () => DDV.programlar.filter(p => p.kcalMin >= EN_DUSUK_KCAL && !B().kurallar.elenenHedefler.includes(p.hedef));
  const hedefKapsam = (p, h) => (B().hedefEsleme[h] || []).find(([eksen, d]) => (eksen === 'hedef' ? p.hedef === d : (p[eksen] || []).includes(d)));
  const sureler = h => {
    const tum = B().adimlar[1].gruplar[0].secenekler, gunler = new Set(havuz().filter(p => hedefKapsam(p, h)).map(p => String(p.sureGun)));
    const mevcut = tum.filter(x => gunler.has(x.deger)), l = mevcut.length ? mevcut : tum;
    if (h !== 'kilo') return l;
    const uzun = l.filter(x => +x.deger >= B().kurallar.kiloEnKisaGun);
    return [...(uzun.length ? uzun : l)].reverse();
  };
  const duzey = p => (p.zorluk === 'Kolay' ? 'kolay' : 'orta');
  const sigar = (p, h) => (h === 'kisa' ? duzey(p) === 'kolay' || p.ihtiyac.includes('pratik-ogun') : true);
  const ogunTutar = (p, o) => (o === '3' ? false : p.gunlukOgun >= 5);
  const tercihAdi = (eksen, d) => DDV.programFiltreleri[eksen]?.secenekler.find(x => x.deger === d)?.ad ?? d;
  const elenir = (p, c, k) => {
    if (String(p.sureGun) !== c.sure) return true;
    if (k.some(x => icerir(p, x))) return true;
    const t = B().tercihEsleme[c.tercih];
    return !!t && !t.some(x => p.tercih.includes(x));
  };
  const puanla = (p, c) => {
    const P = B().puanlar, r = [], ogunEt = secenek('ogun', c.ogun), hazEt = secenek('hazirlik', c.hazirlik);
    const hk = hedefKapsam(p, c.hedef);
    if (hk) r.push({puan: P.hedef, ikon: 'hedef', cevap: `Hedefin ${secenek('hedef', c.hedef).ad}`, olgu: hk[0] === 'hedef' ? `program “${tercihAdi('hedef', hk[1])}” hedefiyle kurulu` : hk[0] === 'yasam' ? `program “${tercihAdi('yasam', hk[1])}” yaşam düzenine göre kurulu` : `program “${tercihAdi('tercih', hk[1])}” etiketli`});
    r.push({puan: P.sure, cevap: `${secenek('sure', c.sure).ad} istedin`, olgu: `program ${p.sureGun} günlük`});
    if (c.pratiklik === 'yuksek' && p.ihtiyac.includes('pratik-ogun')) r.push({puan: P.pratiklik, cevap: 'Pratiklik: Çok önemli', olgu: `program “${tercihAdi('ihtiyac', 'pratik-ogun')}” ihtiyacına göre kurulu`});
    if (c.tercih === 'glutensiz') r.push({puan: P.glutensiz, cevap: 'Glütensiz tercihin', olgu: `program “${tercihAdi('tercih', 'glutensiz')}” etiketli`});
    else if (c.tercih === 'laktozsuz') r.push({puan: P.glutensiz, cevap: 'Laktozsuz tercihin', olgu: `programın öğünlerinde ${KISIT_AD.laktoz} yok`});
    else if (B().kurallar.eleyiciTercihler.includes(c.tercih)) r.push({puan: P.tercihEleyici, cevap: `${secenek('tercih', c.tercih).ad} tercihin`, olgu: `program “${tercihAdi('tercih', p.tercih.find(x => B().tercihEsleme[c.tercih].includes(x)))}” etiketli`});
    if (sigar(p, c.hazirlik)) r.push({puan: P.hazirlik, cevap: `${hazEt.ad} hazırlık`, olgu: c.hazirlik === 'kisa' && duzey(p) !== 'kolay' ? `program “${tercihAdi('ihtiyac', 'pratik-ogun')}” ihtiyacına göre kurulu` : `program ${p.zorluk} zorlukta`});
    if (ogunTutar(p, c.ogun)) r.push({puan: P.ogun, cevap: ogunEt.ad, olgu: 'programın her günü 3 ana + 2 ara öğün'});
    return {puan: r.reduce((n, x) => n + x.puan, 0), nedenler: r.sort((a, b) => b.puan - a.puan), hedefTuttu: !!hk};
  };
  const enYuksek = c => {
    const P = B().puanlar;
    return P.hedef + P.sure + P.hazirlik + P.ogun + (c.pratiklik === 'yuksek' ? P.pratiklik : 0) + (['glutensiz', 'laktozsuz'].includes(c.tercih) ? P.glutensiz : B().kurallar.eleyiciTercihler.includes(c.tercih) ? P.tercihEleyici : 0);
  };
  // Aynı puanda önce her yaşam düzeninden bir program, sonra katalog sırası (web: enIyiUcunuSec).
  const enIyiUc = l => {
    const n = B().kurallar.sonucSayisi, sirali = [...l].sort((a, b) => b.puan - a.puan || a.sira - b.sira), secilen = [];
    for (const puan of [...new Set(sirali.map(x => x.puan))]) {
      if (secilen.length >= n) break;
      const grup = sirali.filter(x => x.puan === puan), duzenler = new Set(), kalan = n - secilen.length, al = [];
      grup.forEach(x => { const d = x.p.yasam[0] || ''; if (al.length < kalan && !(d && duzenler.has(d))) { al.push(x); duzenler.add(d); } });
      grup.forEach(x => { if (al.length < kalan && !al.includes(x)) al.push(x); });
      secilen.push(...al);
    }
    return secilen;
  };
  const eslestir = c => {
    const k = kisitlar(c), en = enYuksek(c);
    const l = havuz().map(p => ({p, sira: DDV.programlar.indexOf(p)})).filter(x => !elenir(x.p, c, k)).map(x => ({...x, ...puanla(x.p, c)}));
    return enIyiUc(l).map(x => ({...x, oran: Math.round(x.puan / en * 100)}));
  };

  // ---------- Akış ----------
  const adimTamam = (a, c) => a.gruplar.every(g => c[g.alan] != null) && (a.no !== 2 || sureler(c.hedef).some(x => x.deger === c.sure));
  const adimNo = (ctx, c) => {
    const eksik = B().adimlar.findIndex(a => !adimTamam(a, c)), son = eksik < 0 ? TOPLAM + 1 : eksik + 1;
    return Math.min(ctx.sorgu.adim === 'sonuc' ? TOPLAM + 1 : +ctx.sorgu.adim || 1, son);
  };
  const sonraki = n => (n < TOPLAM ? `#/program-bul?adim=${n + 1}` : '#/program-bul?adim=sonuc');

  // ---------- Çizim ----------
  const alerjiHtml = c => `<div class="dd-yigin-12">${DD.metinBlok({baslik: B().alerjiSoru.soru, metin: vurgula(B().alerjiSoru.altMetin, 'listeden çıkarıyoruz'), rol: 'section', h: 2})}${DD.cipler({ad: 'alerjen', tur: 'coklu', serit: false, etiket: 'Alerjenler', secili: c.alerjen || [], ogeler: B().alerjiler.map(a => ({metin: a, deger: a}))})}</div>`;
  const grupHtml = (a, c) => {
    if (a.gruplar.length > 1) return `<div class="dd-yigin-24">${a.gruplar.map(g => DD.alan({etiket: g.baslik, html: DD.secimler({ad: g.alan, ogeler: g.secenekler, secili: c[g.alan], duzen: 'orta', sinif: 'is-uc'})})).join('')}</div>`;
    const g = a.gruplar[0], ogeler = g.alan === 'sure' ? sureler(c.hedef) : g.secenekler;
    const not = g.alan === 'sure' && c.hedef === 'kilo' ? DD.ipucu({metin: vurgula(a.notKilo, 'daha uzun planları')}) : '';
    return `<div class="dd-yigin-24">${DD.secimler({ad: g.alan, ogeler, secili: c[g.alan], duzen: 'tek'})}${not}${g.alan === 'ozel' ? `<div data-alerji>${c.ozel === 'alerji' ? alerjiHtml(c) : ''}</div>` : ''}</div>`;
  };
  const adimHtml = (n, c) => {
    const a = B().adimlar[n - 1], R = B().rozetler;
    return DD.onbSablon({
      adim: n, toplam: TOPLAM, baslik: a.soru, alt: vurgula(a.altMetin, VURGU[n]),
      atla: n === 3 ? {metin: 'Atla', veri: {eylem: 'atla'}} : null,
      devam: {metin: n === TOPLAM ? 'Programları gör' : 'Devam', pasif: !adimTamam(a, c), veri: {eylem: 'devam'}},
      altMetin: n === 1 ? `${R[0]} · ${R[2]}` : n === TOPLAM ? R[3] : '',
      html: grupHtml(a, c)
    });
  };
  const kartHtml = (x, i, c) => {
    const on = aktif()?.slug === x.p.slug;
    const rozetler = `<div class="dd-sira">${x.hedefTuttu ? (i === 0 ? DD.durumRozet({metin: 'En uygun', ton: 'basari', ikon: 'onay'}) : '') : DD.durumRozet({metin: 'En yakın menü', ton: 'notr'})}${DD.uyumRozet({oran: x.oran})}${on ? DD.durumRozet({kod: 'aktif'}) : ''}</div>`;
    return DD.kart({html: `<div class="dd-yigin-12">${DD.programKart(x.p, {tur: 'row', kayitli: kayitlar().includes(x.p.slug)})}${rozetler}<div class="dd-yigin-8">${x.nedenler.slice(0, 3).map(r => DD.madde({metin: `**${r.cevap}:** ${r.olgu}`})).join('')}${x.hedefTuttu ? '' : DD.madde({tur: 'notr', metin: `Bu menü **${secenek('hedef', c.hedef).ad}** hedefiyle kurulmadı`})}</div>${DD.btn({metin: 'Programı incele', tur: i === 0 ? 'primary' : 'secondary', tam: true, git: `#/program/${x.p.slug}`})}</div>`});
  };
  const sonucHtml = c => {
    const l = eslestir(c), S = B().sonuc, ozel = c.ozel !== 'yok';
    const denetsiz = (c.alerjen || []).filter(a => !ALERJEN[a]);
    const uyari = ozel ? DD.bant({ton: 'uyari', baslik: 'Diyetisyene danış', metin: vurgula(S.ozelUyari, 'kişiye özel tıbbi ya da beslenme önerisi değildir'), eylem: {metin: 'Diyetisyen bul', git: '#/uzman/bul'}}) : '';
    const denet = denetsiz.length ? DD.bant({ton: 'bilgi', metin: `**${denetsiz.join(', ')}** program menülerinde denetlenmiyor; menüyü kendin kontrol et ya da bir diyetisyene danış.`}) : '';
    const not = DD.bant({ton: 'bilgi', metin: vurgula(S.not, 'sağlık teşhisi koymaz')});
    const sablon = {adim: TOPLAM, toplam: TOPLAM, atla: {metin: 'Baştan', veri: {eylem: 'bastan'}}, devam: {metin: 'Tüm programları gör', tur: 'secondary', git: '#/programlar?temiz=1'}};
    if (!l.length) {
      const secim = [secenek('sure', c.sure).ad, c.tercih !== 'standart' ? secenek('tercih', c.tercih).ad : '', ...kisitlar(c).filter(k => k !== 'laktoz' || c.tercih !== 'laktozsuz').map(k => `${KISIT_AD[k]} içermeyen`)].filter(Boolean).join(' · ');
      return DD.onbSablon({...sablon, baslik: 'Program bulunamadı', alt: `Şu anda “**${secim}**” seçimine uyan yayında bir program yok.`, html: `<div class="dd-yigin">${DD.bos({ikon: 'ara_', baslik: 'Sana özel plan', metin: 'Bir diyetisyen seçimlerine göre **sana özel bir plan** hazırlayabilir.', eylem: {metin: 'Diyetisyen bul', git: '#/uzman/bul'}, ikincil: {metin: 'Yanıtları değiştir', yerine: '#/program-bul'}})}${denet}${not}</div>`});
    }
    return DD.onbSablon({...sablon, baslik: `Sana ${l.some(x => x.hedefTuttu) ? 'uygun' : 'en yakın'} ${l.length} program`, alt: vurgula(S.alt, 'eşleşme nedenleri'), html: `<div class="dd-yigin">${uyari}${denet}${l.map((x, i) => kartHtml(x, i, c)).join('')}${not}</div>`});
  };

  DD.ekran('program-bul', {
    tur: 'tam',
    tabagim: false,
    ust: '#/programlar',
    yenile: true,
    ciz: ctx => {
      const c = cevaplar(), n = adimNo(ctx, c);
      if (n <= TOPLAM) return adimHtml(n, c);
      if (ctx.hata) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', veri: {eylem: 'tekrar'}}, ikinciller: [{metin: 'Tüm programlar', ikon: 'program', git: '#/programlar?temiz=1'}]});
      if (!ctx.hazir) return DD.onbSablon({adim: TOPLAM, toplam: TOPLAM, baslik: 'Eşleşme hesaplanıyor', alt: `Yanıtlarını **${DD.sayi(DDV.programlar.length)} programla** karşılaştırıyoruz.`, devam: false, html: DD.iskelet(3, 'liste')});
      return sonucHtml(c);
    },
    sonra: (kok, ctx) => {
      const n = adimNo(ctx, cevaplar()), a = B().adimlar[n - 1], offs = [];
      const bastan = () => { DD.durum.sil(ANAHTAR); DD.yerine('#/program-bul'); };
      offs.push(DD.eylem(kok, 'bastan', bastan));
      offs.push(DD.eylem(kok, 'tekrar', () => { ctx.hata = false; DD.tazele(); }));
      offs.push(DD.eylem(kok, 'kaydet', el => { const id = el.dataset.id, on = el.getAttribute('aria-pressed') !== 'true', l = kayitlar().filter(x => x !== id); DD.durum.yaz('kayitliProgramlar', on ? [...l, id] : l); }));
      if (!a) {
        let iptal = false;
        if (!ctx.hazir && !ctx.hata) {
          const c = cevaplar(), bitti = hata => { ctx.hazir = !hata; ctx.hata = hata; if (!iptal) DD.tazele(); };
          // Laktoz ve alerjen eleme menü kalemlerine bakar; büyük veri yalnız o zaman yüklenir.
          Promise.all([new Promise(r => setTimeout(r, DD.TK.motion.reveal)), icerikGerekli(c) ? DD.yukleVeri('program-gunleri') : null]).then(() => bitti(false), () => bitti(true));
        }
        return () => { iptal = true; offs.forEach(f => f()); };
      }
      const devam = kok.querySelector('[data-eylem="devam"]');
      const hazirla = () => { devam.disabled = !adimTamam(a, cevaplar()); };
      a.gruplar.forEach(g => offs.push(DD.on(kok, g.alan, v => {
        const c = cevaplar();
        c[g.alan] = v;
        if (g.alan === 'hedef' && !sureler(v).some(x => x.deger === c.sure)) delete c.sure;
        if (g.alan === 'ozel') {
          if (v !== 'alerji') delete c.alerjen;
          const k = kok.querySelector('[data-alerji]');
          k.innerHTML = v === 'alerji' ? alerjiHtml(c) : '';
          if (v === 'alerji') k.scrollIntoView({block: 'end', behavior: DD.azHareket() ? 'auto' : 'smooth'});
        }
        yaz(c); hazirla();
      })));
      offs.push(DD.on(kok, 'alerjen', l => yaz({...cevaplar(), alerjen: l})));
      offs.push(DD.eylem(kok, 'devam', () => DD.git(sonraki(n))));
      offs.push(DD.eylem(kok, 'atla', () => { yaz({...cevaplar(), tercih: 'standart'}); DD.git(sonraki(n)); }));
      return () => offs.forEach(f => f());
    }
  });
})();
