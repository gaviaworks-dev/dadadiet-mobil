/* SCR-11 Öğün detay (#/ogun/:id). Referans: tasks/referanslar.md Öğün detay (Lifesum sıra, Lose It! satır, Cronometer özet, MyFitnessPal alt bar).
 * Kayıt Bugün ile ortaktır: <kip>-ogun {ogunId:{durum, besinler?}}, <kip>-ek {ogunId:[besin]}; kip 'bugun-kip' ('bugun'|'yeni'). Birleştirme kuralı bugun.js ogunler() ile aynıdır.
 * Plan besini silinince durum 'degisti' olur; miktarı değişen plan besini aynı sırayla (sira) ek kaydına geçer.
 * Değişiklikler öğüne bağlı kayda yansır (DDKayit): plan kaydı id = öğün id'si, Tabağım kaydı kalemdeki kayitId ile (eski kalemde ekIdleri).
 * tabagim-ogun: ekran yığındayken Tabağım kaydı bu öğüne düşsün diye yazılır; Bugün kayıttan sonra siler.
 * #/ogun/:id?hal=hata bağlantı hatası.
 */
(() => {
  const {sayi, ondalik} = DD;
  const MAKRO = [['P', 'Protein'], ['K', 'Karbonhidrat'], ['Y', 'Yağ'], ['Lif', 'Lif']];
  const OGUN_PAY = {kahvalti: .25, ogle: .35, aksam: .3, ara: .1};   // DD.ogunKart ile aynı: kart ve detay aynı hedefi gösterir.
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const bir = n => Math.round(n * 10) / 10;
  const yeni = () => DD.durum.oku('bugun-kip', 'bugun') === 'yeni';
  const anahtar = ad => `${yeni() ? 'yeni' : 'bugun'}-${ad}`;
  const oku = ad => DD.durum.oku(anahtar(ad), {});
  const tanim = id => DDV.bugun.ogunler.find(o => o.id === id);
  const kimlik = b => b.id ?? b.slug;
  const kisaAd = b => b.ad.split(' (')[0];
  const ekleRota = id => `#/besin-ara?ogun=${id}`;
  const yendi = x => x.durum === 'dolu' || x.durum === 'degisti';
  // Hedefler: onboarding sonucu 'plan' anahtarındadır; yoksa DDV (bugun.js ile aynı).
  const planHedef = () => DD.durum.oku('plan', null);
  const gunlukKcal = () => planHedef()?.hedefKcal ?? DDV.bugun.hedefKcal;
  const makroHedef = m => planHedef()?.makro?.[m] ?? DDV.bugun.makro[m].hedef;

  // ---------- Kayıt ----------
  const kayit = id => {
    const o = tanim(id), d = oku('ogun')[id], ek = oku('ek')[id] || [];
    let durum = yeni() ? 'bos' : o.durum, plan = yeni() ? [] : o.besinler.map((b, sira) => ({...b, sira}));
    if (d?.durum === 'atlandi') { durum = 'atlandi'; plan = []; }
    else if (d?.durum === 'degisti') { durum = 'degisti'; plan = plan.filter(b => d.besinler.includes(b.slug)); }
    else if (d?.durum === 'dolu') durum = 'dolu';
    if (ek.length) { if (durum === 'planli') { durum = 'degisti'; plan = []; } else if (durum !== 'degisti') durum = 'dolu'; }
    const besinler = [...plan, ...ek.map((b, i) => ({...b, sira: b.sira ?? o.besinler.length + i, ek: true}))].sort((a, b) => a.sira - b.sira);
    return {...o, durum, besinler, kcal: toplam(besinler, 'kcal'), ...Object.fromEntries(MAKRO.map(([m]) => [m, toplam(besinler, m)])), degisik: !!d || !!ek.length};
  };
  const yaz = (id, deger, ek) => {
    const l = oku('ogun'), e = oku('ek');
    if (deger) l[id] = deger; else delete l[id];
    if (ek?.length) e[id] = ek; else delete e[id];
    DD.durum.yaz(anahtar('ogun'), l); DD.durum.yaz(anahtar('ek'), e);
    kaydaYansit(id);
    DD.tazele();
  };
  // Öğüne bağlı kayıt (id = öğün id'si) aynı besinleri gösterir. Tabağım'dan gelen ekler kendi kaydındadır; miktarı düzeltilen plan besini (m-) bu kayda aittir.
  // Öğün boşalınca düşen kayıtlar: geri alınca dönerler. Kullanıcının sildiği kayıt burada olmadığı için geri gelmez.
  const dusen = new Map();
  const degerler = l => ({kcal: toplam(l, 'kcal'), protein: bir(toplam(l, 'P')), karb: bir(toplam(l, 'K')), yag: bir(toplam(l, 'Y')), lif: bir(toplam(l, 'Lif')), bilesenler: l.map(b => ({ad: b.ad, gram: b.gram ?? null, kcal: b.kcal}))});
  const kayitEsle = (rid, l, k) => {
    if (!l.length) { const k = DDKayit.bul(rid); if (k) { dusen.set(rid, k); DDKayit.sil(rid, {yalnizKayit: true}); } return; }
    if (!DDKayit.bul(rid)) { if (!dusen.delete(rid)) return; DDKayit.geriAl(rid); }
    const d = degerler(l);
    // Tek kalemli tabağın ayrıntılı bileşenleri korunur, kalemle aynı oranda ölçeklenir.
    if (l.length === 1 && k?.bilesenler.length > 1) { const o = k.kcal ? d.kcal / k.kcal : 1; d.bilesenler = k.bilesenler.map(b => ({...b, gram: b.gram && Math.round(b.gram * o), kcal: Math.round(b.kcal * o)})); }
    DDKayit.guncelle(rid, d);
  };
  const kaydaYansit = id => {
    const x = kayit(id);
    if (!yeni() && DDV.ogunKayitlari?.some(y => y.id === id)) kayitEsle(id, x.besinler.filter(b => !b.ek || String(b.id).startsWith('m-')));
    [...DDKayit.ogunun(DD.bugunIso(), id), ...dusen.values()].filter(k => k.ogun === id && k.ekIdleri?.length).forEach(k => kayitEsle(k.id, x.besinler.filter(b => b.ek && (b.kayitId === k.id || k.ekIdleri.includes(b.id))), k));
  };
  const anlik = id => [oku('ogun')[id] ?? null, oku('ek')[id] ?? []];
  const geriAl = (id, [d, e]) => ({eylem: 'Geri al', onEylem: () => yaz(id, d, e)});
  const kalanPlan = (x, cikan) => x.besinler.filter(b => !b.ek && b.slug !== cikan).map(b => b.slug);

  const sil = (id, kim) => {
    const x = kayit(id), b = x.besinler.find(y => kimlik(y) === kim), once = anlik(id), [d, ek] = once;
    if (b.ek) yaz(id, d, ek.filter(y => y.id !== kim));
    else yaz(id, {durum: 'degisti', besinler: kalanPlan(x, b.slug)}, ek);
    DD.toast(`**${kisaAd(b)}** çıkarıldı`, {ikon: 'sil', ...geriAl(id, once)});
  };
  const miktarYaz = (id, b, deger) => {
    const x = kayit(id), once = anlik(id), [d, ek] = once, {ek: _, ...ham} = b, yeniB = {...ham, ...deger};
    if (b.ek) yaz(id, d, ek.map(y => (y.id === b.id ? yeniB : y)));
    else yaz(id, {durum: 'degisti', besinler: kalanPlan(x, b.slug)}, [...ek, {...yeniB, id: `m-${b.slug}`}]);
    DD.toast(`**${kisaAd(b)}** güncellendi`, {tur: 'basari', ...geriAl(id, once)});
  };

  // ---------- Sheet'ler ----------
  // Kayıttaki birim besinin porsiyon listesinde yoksa gramına denk gelen ölçü seçilir; o da yoksa gram.
  const birimBul = (b, besin) => {
    const l = besin.porsiyonlar, ayni = l.find(p => p.birim === b.birim);
    if (ayni && Math.abs(ayni.gram * b.miktar - b.gram) < 1) return {birim: ayni.birim, miktar: b.miktar};
    const denk = l.find(p => p.birim !== 'gram' && (b.gram / p.gram * 2) % 1 === 0);
    return denk ? {birim: denk.birim, miktar: b.gram / denk.gram} : {birim: 'gram', miktar: Math.max(10, Math.round(b.gram / 10) * 10)};
  };
  const miktarSheet = (id, kim) => {
    const b = kayit(id).besinler.find(y => kimlik(y) === kim), besin = DDV.besinBul(b.slug), porsiyonlu = !!(besin && b.gram);
    const ilk = porsiyonlu ? birimBul(b, besin) : {birim: b.birim || 'porsiyon', miktar: b.miktar ?? 1};
    const hesap = (v, f) => (porsiyonlu
      ? {miktar: v.miktar, birim: v.birim, gram: v.gram, kcal: Math.round(besin.kcal * v.gram / 100), ...Object.fromEntries(MAKRO.map(([m]) => [m, bir(besin[m] * v.gram / 100)]))}
      : {miktar: v, kcal: Math.round(b.kcal * f), ...Object.fromEntries(MAKRO.map(([m]) => [m, bir((b[m] || 0) * f)]))});
    const kcalOzet = v => `<b class="dd-t-stat">${sayi(b.kcal * v / ilk.miktar)} kcal</b>`;
    const secici = porsiyonlu
      ? DD.porsiyon({ad: 'miktar', birimler: besin.porsiyonlar, secili: ilk.birim, miktar: ilk.miktar, kcal100: besin.kcal})
      : `<div class="dd-ara">${DD.stepper({ad: 'miktar-adet', deger: ilk.miktar, min: .5, max: 20, adim: .5, birim: ilk.birim, aria: 'Miktar'})}<span data-yuva="kcal">${kcalOzet(ilk.miktar)}</span></div>`;
    let son = null;
    DD.sheet({
      baslik: kisaAd(b),
      html: secici,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Çıkar', ikon: 'sil', tur: 'secondary', veri: {eylem: 'sheet-sil'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'sheet-kaydet'}})}</div>`,
      sonra: d => {
        DD.on(d, 'miktar', v => { son = hesap(v); });
        DD.on(d, 'miktar-adet', v => { son = hesap(v, v / ilk.miktar); d.querySelector('[data-yuva="kcal"]').innerHTML = kcalOzet(v); });
        DD.eylem(d, 'sheet-sil', () => { d.kapat(); sil(id, kim); });
        DD.eylem(d, 'sheet-kaydet', () => { d.kapat(); if (son) miktarYaz(id, b, son); });
      }
    });
  };
  const degistirSheet = id => {
    const x = kayit(id), secim = d => [...d.querySelectorAll('input[name="besin"]:checked')].map(i => i.value);
    DD.sheet({
      baslik: `${x.ad} nasıldı?`,
      html: `<div class="dd-yigin-12">${DD.p('Yediklerini işaretli bırak, **yemediklerinin** işaretini kaldır.', {ton: 'ikincil'})}<div class="dd-yigin-12">${x.besinler.map(b => DD.checkbox({ad: 'besin', deger: b.slug, etiket: kisaAd(b), alt: `${ondalik(b.miktar, 2)} ${b.birim} · ${sayi(b.kcal)} kcal`, secili: true})).join('')}</div></div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'degis-kaydet'}}),
      sonra: d => {
        const dugme = d.querySelector('[data-eylem="degis-kaydet"]');
        d.addEventListener('change', () => { dugme.disabled = !secim(d).length; });
        DD.eylem(d, 'degis-kaydet', () => { const once = anlik(id), l = secim(d); d.kapat(); yaz(id, {durum: 'degisti', besinler: l}, once[1]); DD.toast(`**${x.ad}** güncellendi`, {tur: 'basari', ...geriAl(id, once)}); });
      }
    });
  };
  const secenekler = x => [
    yendi(x) && !yeni() && {ikon: 'forward', baslik: 'Bu öğünü atladım', alt: 'Bugünün toplamından çıkar', veri: {eylem: 'atla'}, attrs: 'data-sheet-kapat'},
    x.degisik && {ikon: 'yenile', baslik: yeni() ? 'Öğünü temizle' : 'Plana dön', alt: yeni() ? 'Eklediklerini kaldırır' : 'Değişikliklerini kaldırır', veri: {eylem: 'plana-don'}, attrs: 'data-sheet-kapat'}
  ].filter(Boolean);

  // ---------- Bölümler ----------
  const halka = x => {
    const gunluk = gunlukKcal(), hedef = Math.round(gunluk * (OGUN_PAY[x.id] ?? .15)), adet = {deger: sayi(x.besinler.length), etiket: 'Besin'};
    if (x.durum === 'planli') return DD.halka({boyut: 'md', hedef, planli: x.kcal, etiket: 'Öğün hedefi', alt: 'kcal', yan: [{deger: sayi(x.kcal), etiket: 'Planlı'}, adet], cumle: x.kaynak ? `Plan **${x.kaynak}** programından.` : 'Bu öğün **planında** duruyor.'});
    return DD.halka({boyut: 'md', hedef, alinan: x.kcal, kesitler: x.besinler.map(b => b.kcal), yan: [{deger: sayi(x.kcal), etiket: 'Alınan'}, adet], cumle: `Bu öğün günlük hedefinin **%${Math.round(x.kcal / gunluk * 100)}** kadarı.`});
  };
  const planEylem = () => `<div class="dd-yigin-12">${DD.btn({metin: 'Planladığım gibi', ikon: 'onay', tam: true, veri: {eylem: 'plan-uygula'}})}<div class="dd-ikili">${DD.btn({metin: 'Değiştirdim', ikon: 'duzenle', tur: 'secondary', veri: {eylem: 'plan-degistir'}})}${DD.btn({metin: 'Atladım', ikon: 'forward', tur: 'secondary', veri: {eylem: 'atla'}})}</div></div>`;
  const besinListe = x => {
    const satirlar = x.besinler.map(b => (x.durum === 'planli' ? DD.besinSatir(b) : DD.besinSatir(b, {swipe: true, veri: {eylem: 'besin-ac', id: kimlik(b)}})));
    return DD.yuzey(DD.satirlar(satirlar));
  };
  const besinBolum = x => ({
    baslik: x.durum === 'planli' ? 'Planlanan besinler' : 'Besinler',
    html: `<div class="dd-yigin-12">${besinListe(x)}${x.durum === 'planli' ? '' : DD.p('Satırı **sola kaydır**, miktarı değiştir ya da çıkar.', {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Besin ekle', ikon: 'ekle', tur: 'tonal', tam: true, git: ekleRota(x.id)})}</div>`
  });
  const makroBolum = x => ({
    baslik: x.durum === 'planli' ? 'Planlanan makrolar' : 'Makro özeti',
    html: `<div class="dd-yigin-12">${DD.makroCubuk(Object.fromEntries(MAKRO.map(([m]) => [m, {alinan: x[m], hedef: makroHedef(m)}])))}${DD.p('Çubuklar bu öğünün **günlük hedefindeki** payını gösterir.', {ton: 'ikincil', meta: true})}</div>`
  });
  const planCumle = (x, o) => {
    const f = Math.round(x.kcal - o.kcal);
    if (!x.degisik) return 'Bu öğün **planınla aynı**.';
    if (!f) return 'Toplam kalori **planınla aynı** kaldı.';
    return `Bu öğün planına göre **${sayi(Math.abs(f))} kcal ${f > 0 ? 'daha fazla' : 'daha az'}**.`;
  };
  const planBolum = x => {
    const o = tanim(x.id);
    if (yeni() || !yendi(x)) return null;
    const cikan = o.besinler.filter(b => !x.besinler.some(y => y.slug === b.slug)), giren = x.besinler.filter(b => b.ek && !o.besinler.some(y => y.slug === b.slug));
    const degisen = x.besinler.filter(b => b.ek && o.besinler.some(y => y.slug === b.slug));
    const maddeler = [...giren.map(b => DD.madde({metin: `**${kisaAd(b)}** eklendi`, tur: 'arti'})), ...degisen.map(b => DD.madde({metin: `**${kisaAd(b)}** miktarı değişti`, tur: 'notr'})), ...cikan.map(b => DD.madde({metin: `**${kisaAd(b)}** çıkarıldı`, tur: 'eksi'}))];
    const satirlar = [{ad: 'Kalori', a: o.kcal, b: x.kcal, birim: 'kcal'}, ...MAKRO.map(([m, ad]) => ({ad, a: o[m], b: bir(x[m]), birim: 'g'}))];
    return {baslik: 'Planla karşılaştır', html: `<div class="dd-yigin-12">${DD.p(planCumle(x, o), {ton: 'ikincil'})}${DD.kiyasTablo({a: {ad: 'Plan', gorsel: 'assets/gorsel/hero/tabak-duzeni.webp'}, b: {ad: 'Bu öğün', gorsel: 'assets/gorsel/hero/kamera-tabak.webp'}, satirlar})}${maddeler.length ? `<div class="dd-yigin-8">${maddeler.join('')}</div>` : ''}</div>`};
  };
  // Kayıtlı fotoğraf: en yeni fotoğraflı kayıt. Boş gün kipinde yalnız o gün çekilenler sayılır.
  const fotoKayit = x => DDKayit.ogunun(DD.bugunIso(), x.id).find(k => k.foto && (!yeni() || /^k\d/.test(k.id)));
  const fotoBanner = k => DD.banner({gorsel: k.foto, etiket: k.saat, baslik: k.ad, git: `#/kayit/${k.id}`});
  const tabaklarGiris = () => DD.eylemKart({ikon: 'galeri', baslik: 'Tabaklarım', alt: 'Çektiğin tabaklar gün gün', git: '#/tabaklarim'});
  const bosHal = x => (x.durum === 'atlandi'
    ? DD.bos({ikon: 'forward', tam: true, baslik: 'Bu öğünü atladın', metin: 'Yediklerini **dilediğin an** ekleyebilirsin.', eylem: {metin: 'Besin ekle', ikon: 'ekle', git: ekleRota(x.id)}, ikincil: {metin: 'Plana dön', ikon: 'yenile', veri: {eylem: 'plana-don'}}})
    : DD.bos({ikon: x.ikon, tam: true, baslik: x.degisik ? 'Bu öğünde besin kalmadı' : `${x.ad} henüz boş`, metin: 'Eklediğinde **kalori ve makro** burada görünür.', eylem: {metin: 'Besin ekle', ikon: 'ekle', git: ekleRota(x.id)}, ikincil: x.degisik && !yeni() ? {metin: 'Plana dön', ikon: 'yenile', veri: {eylem: 'plana-don'}} : undefined}));

  let hataGosterildi = false;
  DD.ekran('ogun', {
    tur: 'alt',
    nav: 'bugun',
    yenile: true,
    iskelet: 'liste',
    baslik: ctx => tanim(ctx.param.id)?.ad || 'Öğün',
    ustBar: ctx => { if (!tanim(ctx.param.id)) return {}; return secenekler(kayit(ctx.param.id)).length ? {sag: [{ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'secenek'}}]} : {}; },
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (!tanim(ctx.param.id)) return DD.hataEkran({tur: 'bulunamadi', eylem: {metin: 'Bugün’e dön', yerine: '#/bugun'}});
      const x = kayit(ctx.param.id);
      if (!x.besinler.length) return bosHal(x);
      const foto = fotoKayit(x);
      return DD.bolumler([
        `<div class="dd-yigin">${foto ? fotoBanner(foto) : ''}${halka(x)}${x.durum === 'planli' ? planEylem() : ''}</div>`,
        besinBolum(x), makroBolum(x), planBolum(x), tabaklarGiris()
      ]);
    },
    altBar: ctx => (tanim(ctx.param.id) ? DD.altEylem({dugmeler: [{metin: 'Tabağı fotoğrafla', tur: 'secondary', git: '#/ai/kamera?mod=tabak'}, {metin: 'Barkod tara', tur: 'secondary', git: '#/ai/kamera?mod=barkod'}]}) : ''),
    sonra: (kok, ctx) => {
      const id = ctx.param.id;
      if (!tanim(id)) return null;
      DD.durum.yaz('tabagim-ogun', id);
      const swipe = e => { if (e.detail.eylem === 'sil') sil(id, e.detail.id); else if (e.detail.eylem === 'miktar') miktarSheet(id, e.detail.id); };
      kok.addEventListener('dd-eylem', swipe);
      // Tabağım bu ekrandan kaydedilince Bugün yazar, liste burada tazelenir. Üstte başka ekran varsa dönüşte çizilir.
      const kaydedildi = () => { if (DD.aktif()?.ad === 'ogun') DD.tazele(); };
      document.addEventListener('dd-tabagim-kaydet', kaydedildi);
      const baglar = [
        DD.eylem(kok, 'besin-ac', el => miktarSheet(id, el.dataset.id)),
        DD.eylem(kok, 'plan-uygula', () => { const once = anlik(id); yaz(id, {durum: 'dolu'}, once[1]); DD.toast(`**${tanim(id).ad}** kaydedildi`, {tur: 'basari', ...geriAl(id, once)}); }),
        DD.eylem(kok, 'plan-degistir', () => degistirSheet(id)),
        DD.eylem(kok, 'atla', () => atla(id)),
        DD.eylem(kok, 'plana-don', () => planaDon(id)),
        DD.eylem(kok, 'secenek', () => DD.sheet({
          baslik: tanim(id).ad, html: DD.satirlar(secenekler(kayit(id)).map(s => ({...s, ok: false}))),
          sonra: d => { DD.eylem(d, 'atla', () => atla(id)); DD.eylem(d, 'plana-don', () => planaDon(id)); }
        }))
      ];
      return () => { kok.removeEventListener('dd-eylem', swipe); document.removeEventListener('dd-tabagim-kaydet', kaydedildi); baglar.forEach(c => c()); if (!DD.tabagim.liste().length) DD.durum.sil('tabagim-ogun'); };
    }
  });
  const atla = id => { const once = anlik(id); yaz(id, {durum: 'atlandi'}, []); DD.toast(`**${tanim(id).ad}** atlandı`, {ikon: 'forward', ...geriAl(id, once)}); };
  const planaDon = id => { const once = anlik(id); yaz(id, null, []); DD.toast(`**${tanim(id).ad}** planına döndü`, {ikon: 'yenile', ...geriAl(id, once)}); };
})();
