/* MOBİL NOT: bu dosya dadadiet-prototip assets/js/ogun-zamanlayici.js ile birebir aynıdır; elle değiştirilmez, web güncellenince yeniden kopyalanır.
   Öğün Hatırlatıcı kural motoru (PLAN §3.1). Saf hesap: DOM, depo ve saat okumaz; her şey girdiden gelir.
   Genel Bakış kartı, Ayarlar › Öğün Saatlerim önizlemesi, Tercihlerim ve üye öğün listeleri aynı fonksiyonu çağırır.
   Canlıdaki karşılığı OgunZamanlayici servisi; girdi ve çıktı alanları ona göre adlandı.

   Girdi (hepsi isteğe bağlı, sablon dışında):
     sablon     _src/veri/ogun-sablonu.json (DD_VERI['ogun-sablonu'])
     uye        { ara_sayisi, saatler: [{ tur, saat: 'SS:DD' | null, aktif }] }  üyenin elle girdiği öğünler
     plan       [{ tur, saat: 'SS:DD' | null }]  bugünün plan ya da program öğünleri; verilirse öğün kümesini o belirler,
                saat yalnız diyetisyen planında dolu ve en önce gelir
     isaretler  { <tur>: { durum: 'yedi' | 'atladi', saat: 'SS:DD' | null } }  bugünkü günlük takip işaretleri
     oruc       { protokol, ilk_ogun_saati }  protokol 'yok' değilse kahvaltı = ilk öğün saati, pencere dışı öğün pencereye çekilir
     once_dk    hatırlatma kaç dakika önce (0 / 15 / 30)
     sessiz     'SS:DD-SS:DD' ya da null; bu aralığa düşen hatırlatma susar, öğün listede kalır
     simdi      'SS:DD' ya da dakika; yoksa durum hesaplanmaz (hepsi 'sonra')
   Çıktı: { ogunler: [{ tur, ad, ikon, planlanan, pencere, durum, kaynak, sabit, aktif, kural, notlar, gercek, hatirlatma, sessiz }],
            kahvalti, oruc: { bas, bit, saat } | null, odak: tur | null }
   durum: yedi | atladi | gecti | simdi | siradaki | sonra | kapali.  kaynak: plan | elle | oruc | uye | sablon. */
(function (kok) {
  'use strict';
  const dk = (s) => {
    if (typeof s === 'number') return s;
    const m = String(s || '').match(/^(\d{1,2})[:.](\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const saat = (d) => { const x = Math.max(0, Math.min(1439, Math.round(d))); return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  const bicim = (s) => String(typeof s === 'number' ? saat(s) : s || '').replace(':', '.');
  const yuvarla = (d) => Math.round(d / 5) * 5;
  /* Saat sonrası bulunma eki, okunuşa göre: 10.30'da (otuz), 10.15'te (beş), 18.00'de (sekiz), 21.40'ta (kırk) */
  const SON = { 0: 'da', 1: 'de', 2: 'de', 3: 'te', 4: 'te', 5: 'te', 6: 'da', 7: 'de', 8: 'de', 9: 'da' };
  const ONLAR = { 1: 'da', 2: 'de', 3: 'da', 4: 'ta', 5: 'de' };
  const ekDe = (s) => { const d = dk(s); if (d == null) return ''; const n = d % 60 || Math.floor(d / 60) % 24; return '’' + (n === 0 ? 'da' : n % 10 ? SON[n % 10] : ONLAR[n / 10]); };
  const deBicim = (s) => bicim(s) + ekDe(s);
  const saatYazi = (d) => { const h = d / 60; return (Number.isInteger(h) ? h : String(Math.round(h * 10) / 10).replace('.', ',')) + ' sa'; };

  /* Oruç penceresi: ilk öğün saati + protokolün yeme süresi. Protokol yoksa ya da 'yok' ise null */
  function orucPencere(sablon, oruc) {
    if (!oruc || !oruc.protokol || oruc.protokol === 'yok') return null;
    const yeme = (sablon.oruc_yeme_saati || {})[oruc.protokol];
    const bas = dk(oruc.ilk_ogun_saati);
    if (!yeme || bas == null) return null;
    return { bas, bit: Math.min(1439, bas + yeme * 60), saat: yeme, protokol: oruc.protokol };
  }
  /* Aralık gece yarısını geçebilir (22.00–08.00) */
  function sessizAralik(s) {
    const m = String(s || '').match(/(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})/);
    return m ? { bas: dk(m[1]), bit: dk(m[2]) } : null;
  }
  const sessizde = (d, a) => (a ? (a.bas < a.bit ? d >= a.bas && d < a.bit : d >= a.bas || d < a.bit) : false);

  function kuralMetni(k, kurallar) {
    const ref = kurallar.find((x) => x.tur === k.referans);
    const refAd = ref ? ref.ad.toLocaleLowerCase('tr') : '';
    if (!k.referans) return 'Çapa: diğer öğünler buna göre kurulur';
    if (k.pencere_bit_dk != null) return refAd + ' + ' + saatYazi(k.pencere_bas_dk).replace(' sa', '') + '–' + saatYazi(k.pencere_bit_dk);
    return refAd + ' + ' + saatYazi(k.ofset_dk) + (k.en_gec_saat ? ', en geç ' + bicim(k.en_gec_saat) : '');
  }

  function hesapla(g) {
    const s = g.sablon || {}, kurallar = s.kurallar || [];
    const pay = s.simdi_pay_dk == null ? 30 : s.simdi_pay_dk;
    const satir = {};
    ((g.uye && g.uye.saatler) || []).forEach((x) => { if (x && x.tur) satir[x.tur] = x; });
    const isaret = g.isaretler || {};
    const planVar = Array.isArray(g.plan);
    const plan = {};
    (g.plan || []).forEach((x) => { if (x && x.tur) plan[x.tur] = x; });
    const arac = Math.max(0, Math.min(s.ara_en_cok || 2, g.uye && g.uye.ara_sayisi != null ? g.uye.ara_sayisi : s.varsayilan_ara_sayisi == null ? 1 : s.varsayilan_ara_sayisi));
    const araTur = kurallar.filter((k) => k.pencere_bit_dk != null).map((k) => k.tur);
    /* Öğün kümesi: plan ya da program varsa onun öğünleri, yoksa üyenin düzeni (kahvaltı, öğle, 0–2 ara öğün, akşam) */
    const kume = planVar ? kurallar.filter((k) => plan[k.tur]).map((k) => k.tur)
      : kurallar.filter((k) => !araTur.includes(k.tur) || araTur.indexOf(k.tur) < arac).map((k) => k.tur);
    const kumeAra = araTur.filter((t) => kume.includes(t));
    const oruc = orucPencere(s, g.oruc);
    const sessiz = sessizAralik(g.sessiz);
    const once = Number(g.once_dk) || 0;
    const ad = (k) => (plan[k.tur] && plan[k.tur].ad) || k.ad;

    const h = {}; /* tur → hesaplanmış öğün */
    const etkin = (t) => { const x = h[t]; if (!x) return null; const i = isaret[t]; return i && i.durum === 'yedi' && dk(i.saat) != null ? dk(i.saat) : x.dk; };
    kurallar.forEach((k) => {
      const p = plan[k.tur], sat = satir[k.tur], o = { tur: k.tur, ad: ad(k), ikon: k.ikon, kural: kuralMetni(k, kurallar), notlar: [], pencere: null, sabit: false };
      if (p && dk(p.saat) != null) { o.dk = dk(p.saat); o.kaynak = 'plan'; o.sabit = true; }
      else if (!k.referans) {
        if (oruc) { o.dk = oruc.bas; o.kaynak = 'oruc'; }
        else if (sat && dk(sat.saat) != null) { o.dk = dk(sat.saat); o.kaynak = 'uye'; }
        else { o.dk = dk(k.varsayilan_saat) || 540; o.kaynak = 'sablon'; }
      } else if (sat && dk(sat.saat) != null) { o.dk = dk(sat.saat); o.kaynak = 'elle'; o.sabit = true; }
      else {
        const ref = etkin(k.referans), refO = h[k.referans];
        o.kaynak = 'sablon';
        if (ref == null) { o.dk = dk(k.varsayilan_saat) || 720; }
        else if (k.pencere_bit_dk != null) {
          const n = Math.max(1, kumeAra.length), i = Math.max(0, kumeAra.indexOf(k.tur));
          const bas = ref + k.pencere_bas_dk, bit = ref + k.pencere_bit_dk;
          o.pencere = { bas, bit };
          o.dk = yuvarla(bas + ((bit - bas) * (i + 1)) / n);
        } else o.dk = ref + (k.ofset_dk || 0);
        const i = isaret[k.referans];
        if (refO && i && i.durum === 'yedi' && dk(i.saat) != null && dk(i.saat) !== refO.dk) o.notlar.push({ kod: 'gercek', metin: refO.ad + ' ' + deBicim(i.saat) + ' yendiği için kaydı.' });
        const sinir = dk(k.en_gec_saat);
        if (sinir != null && o.dk > sinir) { o.dk = sinir; o.gec = true; o.notlar = o.notlar.filter((n) => n.kod !== 'gercek'); }
      }
      /* Oruç penceresi: plan saati dışındaki öğünler pencereye çekilir */
      if (oruc && o.kaynak !== 'plan') {
        if (o.dk > oruc.bit) { o.dk = oruc.bit; o.gec = false; o.notlar = [{ kod: 'oruc', metin: 'Yeme penceren ' + deBicim(oruc.bit) + ' kapanıyor; öğün pencere sonuna çekildi.' }]; }
        else if (o.dk < oruc.bas) { o.dk = oruc.bas; o.notlar = [{ kod: 'oruc', metin: 'Yeme penceren ' + deBicim(oruc.bas) + ' açılıyor; öğün pencere başına çekildi.' }]; }
        if (o.pencere) { o.pencere.bit = Math.min(o.pencere.bit, oruc.bit); o.pencere.bas = Math.min(o.pencere.bas, o.pencere.bit); }
      }
      if (o.gec) o.notlar.push({ kod: 'gec', metin: 'Akşam en geç ' + bicim(k.en_gec_saat) + '; zincir daha geçe düştüğü için sınıra çekildi.' });
      if (o.pencere && o.pencere.bas === o.pencere.bit) o.pencere = null;
      h[k.tur] = o;
    });

    const simdi = g.simdi == null ? null : dk(g.simdi);
    const liste = kume.map((t) => h[t]).filter(Boolean).map((o, sira) => ({ o, sira })).sort((a, b) => a.o.dk - b.o.dk || a.sira - b.sira).map((x) => x.o);
    let siradakiVar = false;
    const ogunler = liste.map((o) => {
      const i = isaret[o.tur] || {}, sat = satir[o.tur];
      const aktif = !(sat && sat.aktif === false);
      let durum;
      if (i.durum === 'yedi') durum = 'yedi';
      else if (i.durum === 'atladi') durum = 'atladi';
      else if (!aktif && !planVar) durum = 'kapali';
      else if (simdi == null) durum = 'sonra';
      else if (Math.abs(simdi - o.dk) <= pay) durum = 'simdi';
      else if (o.dk < simdi) durum = 'gecti';
      else if (!siradakiVar) { durum = 'siradaki'; siradakiVar = true; }
      else durum = 'sonra';
      const hat = aktif && durum !== 'yedi' && durum !== 'atladi' ? o.dk - once : null;
      const ses = hat != null && sessizde(((hat % 1440) + 1440) % 1440, sessiz);
      const notlar = o.notlar.slice();
      if (ses) notlar.push({ kod: 'sessiz', metin: 'Hatırlatma sessiz saatlerine düşüyor; gönderilmez.' });
      return {
        tur: o.tur, ad: o.ad, ikon: o.ikon, planlanan: saat(o.dk), pencere: o.pencere ? { bas: saat(o.pencere.bas), bit: saat(o.pencere.bit) } : null,
        durum, kaynak: o.kaynak, sabit: o.sabit, aktif, kural: o.kural, notlar,
        gercek: i.durum === 'yedi' && dk(i.saat) != null ? saat(dk(i.saat)) : null,
        hatirlatma: hat == null ? null : saat(hat), sessiz: ses,
      };
    });
    const odak = (ogunler.find((o) => o.durum === 'simdi') || ogunler.find((o) => o.durum === 'siradaki') || {}).tur || null;
    return { ogunler, kahvalti: saat(h.kahvalti ? h.kahvalti.dk : 540), oruc: oruc ? { bas: saat(oruc.bas), bit: saat(oruc.bit), saat: oruc.saat, protokol: oruc.protokol } : null, odak };
  }

  /* Sıradaki öğünün enerji payı: kalan enerji, kalan öğünlerin şablon paylarıyla bölünür */
  function enerjiPayi(sablon, kalanTurler, tur, kalanKcal) {
    const p = sablon.enerji_payi || {}, top = kalanTurler.reduce((t, x) => t + (p[x] || 0), 0);
    if (!top || !(kalanKcal > 0)) return 0;
    return Math.round(((kalanKcal * (p[tur] || 0)) / top) / 10) * 10;
  }

  const M = { hesapla, enerjiPayi, orucPencere, sessizAralik, sessizde, dk, saat, bicim, ekDe };
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else kok.DDOgun = M;
})(typeof window !== 'undefined' ? window : this);
