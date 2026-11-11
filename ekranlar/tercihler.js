/* Tercihlerim (#/tercihler): web hesabim/tercihlerim + moduller-tercihlerim.js eşi. Onboarding cevaplarının özeti; her satır tek adım düzenlemesini açar (#/onboarding/<adim>?duzenle=1, Kaydet planı yeniden hesaplar).
 * Okuma ekranlar/profil.js hedefler ile aynı: DDV.kullanici üstüne DD.durum 'plan', kilo Sağlık dosyam'daki son ölçüm ('saglik-olcumler'). Yeni hesapta yalnız 'plan'; plan yoksa boş hal.
 * Birimler hesap-ayar.dil (Ayarlar > Dil ve bölge). Alerjenler ve sevmediklerim hesap-ayar.besin {alerjen[], sevmedik[]}. Hassasiyet satırı açık rızaya bağlı ('veri-izinleri'.riza).
 * ?hal=hata bağlantı hatası. */
(() => {
  const H = () => DDV.hesap;
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const ayar = b => ({...H().varsayilan[b], ...(DD.yeniHesap() && b === 'besin' ? {sevmedik: []} : {}), ...(tum()[b] || {})});
  const ayarYaz = (b, ek) => DD.durum.yaz('hesap-ayar', {...tum(), [b]: {...(tum()[b] || {}), ...ek}});
  const sonKilo = () => DD.durum.oku(`${DD.yeniHesap() ? 'yeni-' : ''}saglik-olcumler`, []).filter(o => o.kiloKg != null).sort((x, y) => x.tarih.localeCompare(y.tarih)).pop()?.kiloKg;
  const K = () => {
    const p = DD.durum.oku('plan', null);
    if (DD.yeniHesap() && !p) return null;
    const k = {...(DD.yeniHesap() ? {} : DDV.kullanici), ...(p || {})}, o = sonKilo();
    return o == null ? k : {...k, kiloKg: o};
  };
  const riza = () => DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'}).riza;
  const adim = id => DDV.onboarding.adimlar.find(a => a.id === id);
  const secenekAd = (id, k) => adim(id).secenekler.find(s => s.id === k)?.ad;
  const duzenle = id => `#/onboarding/${id}?duzenle=1`;
  const noktali = s => String(s).replace(':', '.');
  // Birim gösterimi: kayıt hep kg, cm, kcal; yalnız görünüm çevrilir.
  const B = () => ayar('dil');
  const kg = n => (B().agirlik === 'lb' ? `${DD.ondalik(n * 2.20462, 1)} lb` : `${DD.ondalik(n, 1)} kg`);
  const boy = n => (B().boy === 'inc' ? `${DD.ondalik(n / 2.54, 1)} inç` : `${DD.sayi(n)} cm`);
  const enerji = n => (B().enerji === 'kj' ? [DD.sayi(n * 4.184), 'kJ'] : [DD.sayi(n), 'kcal']);

  const ritimAlt = k => {
    const pr = k.orucProtokolu;
    if (!pr) return 'Henüz seçilmedi';
    if (pr === 'yok') return 'Oruç yok';
    const o = DD.ogun.hesap({duz: true}).oruc;
    return `${pr} · ilk öğün ${noktali(k.ilkOgunSaati)}${o ? ` · pencere ${noktali(o.bas)}–${noktali(o.bit)}` : ''}`;
  };
  const hassasAd = k => { const l = (k.hassasiyetler || []).filter(h => h !== 'yok'); return l.length ? l.map(h => secenekAd('kvkk', h) || adim('kvkk').hassasiyet.secenekler.find(s => s.id === h)?.ad || h).join(', ') : 'Yok'; };
  const alerjenAd = () => { const l = ayar('besin').alerjen; return l.length ? l.map(id => H().alerjenler.find(a => a.id === id)?.ad || id).join(', ') : 'Eklenmedi'; };

  const govde = () => {
    const k = K();
    if (!k) return DD.bos({tam: true, ikon: 'hedef', baslik: 'Henüz tercihin yok', metin: 'Hedefini ve beslenme düzenini seçtiğinde **planın** buradan düzenlenir.', eylem: {metin: 'Hedefimi seç', ikon: 'hedef', git: '#/onboarding/hedef'}});
    const m = k.makro ?? k.makroHedef ?? {}, suMl = k.suMl ?? k.suHedefMl, [kc, kb] = enerji(k.hedefKcal), d = B(), b = ayar('besin'), r = riza();
    const uzman = !DD.yeniHesap() && DDV.diyetisyenler.find(x => x.slug === k.diyetisyen);
    const ogunHesap = DD.ogun.hesap({duz: true});
    return DD.gruplar([
      `<div class="dd-yigin">${DD.p('Planın ve önerilerin bu cevaplardan hesaplanır. Bir değeri değiştirdiğinde **günlük hedefin** de güncellenir.', {ton: 'ikincil'})}${DD.ozetSerit([{ikon: 'kalori', etiket: 'Kalori', deger: kc, birim: kb}, {ikon: 'egg', etiket: 'Protein', deger: DD.sayi(m.P), birim: 'g'}, {ikon: 'droplet', etiket: 'Su', deger: DD.ondalik(suMl / 1000, 1), birim: 'L'}])}</div>`,
      {baslik: 'Hedefin', satirlar: [
        {ikon: 'hedef', baslik: 'Hedefim', alt: k.hedefAd, git: duzenle('hedef')},
        {ikon: 'weight-scale', baslik: 'Kilo', alt: k.hedefKiloKg ? `${kg(k.kiloKg)} · hedef ${kg(k.hedefKiloKg)}` : kg(k.kiloKg), git: duzenle('kilo')},
        k.tempoAd && {ikon: 'gauge-high', baslik: 'Tempo', alt: k.tempoAd, git: duzenle('tempo')}
      ].filter(Boolean)},
      {baslik: 'Ölçülerin ve hareketin', satirlar: [
        {ikon: 'venus-mars', baslik: 'Cinsiyet', deger: secenekAd('cinsiyet', k.cinsiyet) || '–', git: duzenle('cinsiyet')},
        {ikon: 'cake-candles', baslik: 'Yaş', deger: k.yas ? `${k.yas}` : '–', git: duzenle('yas')},
        {ikon: 'ruler-vertical', baslik: 'Boy', deger: k.boyCm ? boy(k.boyCm) : '–', git: duzenle('boy')},
        {ikon: 'person-walking', baslik: 'Aktivite', deger: k.aktiviteAd || '–', git: duzenle('aktivite')}
      ]},
      {baslik: 'Beslenme ve öğün ritmin', satirlar: [
        {ikon: 'utensils', baslik: 'Beslenme tarzı', alt: (k.beslenmeTarziAd || []).join(', ') || 'Seçim yok', git: duzenle('tarz')},
        {ikon: 'hourglass-half', baslik: 'Oruç ve ilk öğün', alt: ritimAlt(k), git: duzenle('ritim')},
        {ikon: 'clock', baslik: 'Öğün saatlerim', alt: DD.ogun.ozet(ogunHesap) || 'Öğün saatlerini kur', git: '#/ogun-saatleri'}
      ]},
      {baslik: 'Hassasiyetlerin', html: `<div class="dd-yigin-12">${DD.satirlar(r ? [
        {ikon: 'shield-halved', baslik: 'Hassasiyet ve kronik durum', alt: hassasAd(k), git: duzenle('kvkk')},
        {ikon: 'wheat-awn-circle-exclamation', baslik: 'Alerjenlerim', alt: alerjenAd(), veri: {eylem: 'alerjen'}},
        {ikon: 'thumbs-down', baslik: 'Sevmediklerim', alt: b.sevmedik.length ? b.sevmedik.join(', ') : 'Eklenmedi', veri: {eylem: 'sevmedik'}}
      ] : [
        {ikon: 'lock', baslik: 'Hassasiyet ve alerjenler', alt: 'Açık rıza vermediğin için kullanılmıyor', git: '#/veri-izinleri'},
        {ikon: 'thumbs-down', baslik: 'Sevmediklerim', alt: b.sevmedik.length ? b.sevmedik.join(', ') : 'Eklenmedi', veri: {eylem: 'sevmedik'}}
      ])}${DD.veriYok('Önerilerin bu seçimlere göre **süzülür**; sevmediklerin menü önerilerinde geri planda kalır.')}</div>`},
      {baslik: 'Günlük hedefin', html: `<div class="dd-yigin-12">${DD.kunye([
        {ikon: 'kalori', etiket: 'Kalori', deger: `${kc} ${kb}`},
        {ikon: 'egg', etiket: 'Protein', deger: `${DD.sayi(m.P)} g`},
        {ikon: 'wheat-awn', etiket: 'Karbonhidrat', deger: `${DD.sayi(m.K)} g`},
        {ikon: 'droplet', etiket: 'Yağ', deger: `${DD.sayi(m.Y)} g`},
        {ikon: 'leaf', etiket: 'Lif', deger: `${DD.sayi(m.Lif)} g`},
        {ikon: 'glass-water', etiket: 'Su', deger: `${DD.ondalik(suMl / 1000, 1)} L`}
      ])}${uzman ? DD.veriYok(`**${uzman.ad}** ile çalıştığın için planındaki değerler esastır.`) : ''}</div>`},
      {baslik: 'Bildirim ve birimler', satirlar: [
        {ikon: 'bell', baslik: 'Bildirim tercihleri', alt: 'Öğün, su ve oruç hatırlatmaları', git: '#/ayarlar/bildirim'},
        {ikon: 'ruler-combined', baslik: 'Birimler', alt: `${d.agirlik} · ${d.boy === 'inc' ? 'inç' : 'cm'} · ${d.enerji === 'kj' ? 'kJ' : 'kcal'}`, git: '#/ayarlar/dil'}
      ]},
      // Gastro kalıbı (ayarlar.js "Uygulamayı sıfırla", Diet ayarlar.js aynı): sayfa sonunda eylem satırı (ok yok) + onay diyaloğu.
      {baslik: 'Başlangıç soruları', satirlar: [{ikon: 'rotate-left', baslik: 'Soruları baştan yanıtla', alt: 'Yanıtların seçili gelir; bitirince hedefin yeniden hesaplanır', veri: {eylem: 'bastan'}, ok: false}]}
    ]);
  };

  const alerjenSheet = () => {
    let secim = ayar('besin').alerjen;
    DD.sheet({
      baslik: 'Alerjenlerim',
      html: `<div class="dd-yigin">${DD.p('Seçtiğin alerjenleri içeren besinler önerilerde **uyarıyla** görünür.', {ton: 'ikincil'})}${DD.cipler({ad: 'alerjen', tur: 'coklu', serit: false, etiket: 'Alerjenler', secili: secim, ogeler: H().alerjenler.map(a => ({metin: a.ad, deger: a.id}))})}${DD.bant({ton: 'bilgi', metin: 'Ciddi bir alerjin varsa **hekimine ve diyetisyenine** danış; etiketi her zaman kontrol et.'})}</div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'kaydet-alerjen'}}),
      sonra: d => {
        const c = [DD.on(d, 'alerjen', v => { secim = v; }), DD.eylem(d, 'kaydet-alerjen', () => { ayarYaz('besin', {alerjen: secim}); d.kapat(); DD.tazele(); DD.toast('Alerjenlerin **kaydedildi**', {tur: 'basari'}); })];
        return () => c.forEach(f => f());
      }
    });
  };
  const sevmedikSheet = () => {
    let secim = [...ayar('besin').sevmedik];
    const cipler = () => DD.cipler({ad: 'sevmedik', tur: 'coklu', serit: false, etiket: 'Sevmediklerim', secili: secim, ogeler: [...new Set([...H().sevmedikOneri, ...secim])].map(x => ({metin: x, deger: x}))});
    DD.sheet({
      baslik: 'Sevmediklerim',
      html: `<div class="dd-yigin">${DD.p('Sevmediğin besinler **menü** önerilerinde geri planda kalır.', {ton: 'ikincil'})}<div data-yuva="cipler">${cipler()}</div>${DD.input({ad: 'yeni-besin', etiket: 'Listede yok mu?', ikon: 'ekle', yer: 'Besin adı yaz', sag: DD.btn({metin: 'Ekle', tur: 'text', boyut: 'sm', veri: {eylem: 'besin-ekle'}})})}</div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'kaydet-sevmedik'}}),
      sonra: d => {
        const ekle = () => {
          const i = d.querySelector('[name="yeni-besin"]'), v = i.value.trim().replace(/\s+/g, ' ');
          if (!v) { DD.toast('Önce **besin adını** yaz', {ikon: 'bilgi'}); return; }
          const ad = v.charAt(0).toLocaleUpperCase('tr') + v.slice(1);
          if (!secim.includes(ad)) secim.push(ad);
          d.querySelector('[data-yuva="cipler"]').innerHTML = cipler(); i.value = ''; i.closest('.dd-girdi').classList.remove('has-text');
        };
        const tus = ev => { if (ev.key === 'Enter' && ev.target.name === 'yeni-besin') { ev.preventDefault(); ekle(); } };
        d.addEventListener('keydown', tus);
        const c = [DD.on(d, 'sevmedik', v => { secim = v; }), DD.eylem(d, 'besin-ekle', ekle), DD.eylem(d, 'kaydet-sevmedik', () => { ayarYaz('besin', {sevmedik: secim}); d.kapat(); DD.tazele(); DD.toast('Sevmediklerin **kaydedildi**', {tur: 'basari'}); }), () => d.removeEventListener('keydown', tus)];
        return () => c.forEach(f => f());
      }
    });
  };

  let hataGosterildi = false;
  DD.ekran('tercihler', {
    tur: 'alt',
    ust: '#/profil',
    baslik: 'Tercihlerim',
    yenile: true,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    sonra: kok => {
      const c = [
        DD.eylem(kok, 'alerjen', alerjenSheet),
        DD.eylem(kok, 'sevmedik', sevmedikSheet),
        // Akış (onboarding.js): yanıtlar silinmez, seçili gelir; son adımda "Bugün’e geç" planı ('plan') yeni yanıtlarla baştan yazar. Önceki hedef saklanmaz, geri alınamaz: yıkıcı onay.
        DD.eylem(kok, 'bastan', () => DD.dialog({baslik: 'Sorular baştan sorulsun mu?', metin: 'Yanıtların **seçili gelir**. Son adımı bitirdiğinde günlük hedefin ve makroların **yeniden hesaplanır**; önceki hedefine geri dönemezsin. Bitirmeden çıkarsan planın değişmez.', eylem: 'Baştan başla', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) DD.git('#/onboarding/hedef'); }))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
