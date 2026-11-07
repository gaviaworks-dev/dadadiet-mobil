/* Öğün kaydı (#/kayit/:id) ve DDKayit. Şema ve kurallar: tasks/tabak-gunlugu.md §2. Kalıp: Gastro detay-v2. Referans: tasks/referanslar.md "Tabaklarım ve öğün kaydı".
 * window.DDKayit (ortak API): liste() · bul(id) · gunun(tarih) · ogunun(tarih, ogun) (diziler yeniden eskiye) · ekle(kayit) → id · guncelle(id, degisim) · sil(id, {yalnizKayit}) · geriAl(id).
 * ekle id ve diyetisyenGorsun değerini kendi verir (varsayılan paylaşım iznine göre). Bağ: bugun-ek kalemindeki kayitId; bugun.js yazar. Eski kalemde ekIdleri, o da yoksa silerken ad ve kcal eşleşmesi.
 * Bugünün kaydı silinince besinleri de günden düşer, geriAl geri getirir. Bileşen düzeltmesi ve öğün değişimi bağlı kalemlere geçer. yalnizKayit: ogun.js öğün boşalınca kaydı düşürür, günlüğe dokunmaz.
 * Kaynak: DD.durum 'ogun-kayitlari' (yeni ya da değişmiş kayıtlar) + DDV.ogunKayitlari, id ile tekil; silinenler 'ogun-kayit-silinen'. Her değişimde document'e 'dd-kayit' olayı gider.
 * Bugünün plan kaydı (id = öğün id'si) Öğün detayında düzenlenir. Bağlı kalemler Öğün detayında değişince ogun.js kaydı günceller.
 * Diyetisyen paylaşımı 'saglik-paylasim'.tabaklar iznine bağlıdır; izin kapalıyken anahtar pasiftir, kullanıcının tercihi korunur.
 */
(() => {
  const DURUM = 'ogun-kayitlari', SILINEN = 'ogun-kayit-silinen';
  const yeni = () => DD.durum.oku(DURUM, []);
  const silinen = () => DD.durum.oku(SILINEN, []);
  const yayinla = id => document.dispatchEvent(new CustomEvent('dd-kayit', {detail: {id}}));
  const sira = (a, b) => `${b.tarih}${b.saat}`.localeCompare(`${a.tarih}${a.saat}`);
  const liste = () => {
    const l = yeni(), ids = new Set(l.map(k => k.id)), sil = new Set(silinen());
    return [...l, ...(DD.yeniHesap() ? [] : DDV.ogunKayitlari || []).filter(k => !ids.has(k.id))].filter(k => !sil.has(k.id)).sort(sira);
  };
  const paylasimAcik = () => DD.durum.oku('saglik-paylasim', {}).tabaklar !== false;

  // ---------- Bugünün kaydı ve günlük: aynı kalori iki yerde kalmasın ----------
  const gunluk = ad => `${DD.durum.oku('bugun-kip', 'bugun') === 'yeni' ? 'yeni' : 'bugun'}-${ad}`;
  const geriler = new Map();
  const bagliEkler = (k, l) => { const a = l.filter(b => b.kayitId === k.id); return a.length ? a : k.ekIdleri?.length ? l.filter(b => k.ekIdleri.includes(b.id)) : []; };
  // Silerken bağı olmayan eski kalem bileşen adı ve kalorisiyle bir kez eşleşir.
  const kaydinEkleri = (k, l) => {
    if (k.id === k.ogun) return l.filter(b => String(b.id).startsWith('m-'));
    const bagli = bagliEkler(k, l);
    if (bagli.length) return bagli;
    const kalan = [...k.bilesenler];
    return l.filter(b => { const i = kalan.findIndex(x => x.ad === b.ad && x.kcal === b.kcal); if (i < 0) return false; kalan.splice(i, 1); return true; });
  };
  const bir = n => Math.round(n * 10) / 10;
  const kalemOlcek = (b, kcal, gram) => {
    const o = b.kcal ? kcal / b.kcal : 1, g = gram ?? (b.gram ? Math.round(b.gram * o) : b.gram);
    return {...b, kcal, gram: g, miktar: b.birim === 'gram' ? g : Math.round((b.miktar ?? 1) * (b.gram && g ? g / b.gram : o) * 100) / 100, ...Object.fromEntries(['P', 'K', 'Y', 'Lif'].map(m => [m, bir((b[m] || 0) * o)]))};
  };
  // esler: eski bileşenlerle aynı sırada yeni bileşen ya da çıkarılan için null. Kalem sayısı eşitse birebir, değilse (tek kalem) toplam oranında yazılır.
  const kalemleriYaz = (k, esler) => {
    if (k.tarih !== DD.bugunIso() || k.id === k.ogun) return;
    const A = gunluk('ek'), ek = DD.durum.oku(A, {}), l = ek[k.ogun] || [], bagli = bagliEkler(k, l);
    if (!bagli.length) return;
    const toplam = esler.reduce((t, e) => t + (e?.kcal || 0), 0), oran = k.kcal ? toplam / k.kcal : 1, birebir = bagli.length === esler.length;
    const yeni = new Map(bagli.map((b, i) => [b, birebir ? (esler[i] ? kalemOlcek(b, esler[i].kcal, esler[i].gram) : null) : toplam ? kalemOlcek(b, Math.round(b.kcal * oran)) : null]));
    const son = l.map(b => (yeni.has(b) ? yeni.get(b) : b)).filter(Boolean);
    if (son.length) ek[k.ogun] = son; else delete ek[k.ogun];
    DD.durum.yaz(A, ek);
  };
  const ogunTasi = (k, ogun) => {
    if (k.tarih !== DD.bugunIso() || k.id === k.ogun || ogun === k.ogun) return;
    const A = gunluk('ek'), ek = DD.durum.oku(A, {}), l = ek[k.ogun] || [], bagli = bagliEkler(k, l);
    if (!bagli.length) return;
    const kalan = l.filter(b => !bagli.includes(b));
    if (kalan.length) ek[k.ogun] = kalan; else delete ek[k.ogun];
    DD.durum.yaz(A, {...ek, [ogun]: [...(ek[ogun] || []), ...bagli]});
  };
  const ekAnlik = () => { const A = gunluk('ek'), v = DD.durum.oku(A, {}); return () => DD.durum.yaz(A, v); };
  const gundenCikar = k => {
    if (k.tarih !== DD.bugunIso()) return;
    const ekA = gunluk('ek'), ogunA = gunluk('ogun'), ek = DD.durum.oku(ekA, {}), ogun = DD.durum.oku(ogunA, {}), l = ek[k.ogun] || [], cikan = kaydinEkleri(k, l);
    geriler.set(k.id, {ekA, ogunA, ogunId: k.ogun, ek: ek[k.ogun] ?? null, durum: ogun[k.ogun] ?? null});
    const kalan = l.filter(b => !cikan.includes(b));
    if (kalan.length) ek[k.ogun] = kalan; else delete ek[k.ogun];
    DD.durum.yaz(ekA, ek);
    if (k.id === k.ogun) DD.durum.yaz(ogunA, {...ogun, [k.ogun]: {durum: 'degisti', besinler: []}});
  };
  const gunuGeriAl = id => {
    const g = geriler.get(id);
    if (!g) return;
    geriler.delete(id);
    const ek = DD.durum.oku(g.ekA, {}), ogun = DD.durum.oku(g.ogunA, {});
    if (g.ek) ek[g.ogunId] = g.ek; else delete ek[g.ogunId];
    if (g.durum) ogun[g.ogunId] = g.durum; else delete ogun[g.ogunId];
    DD.durum.yaz(g.ekA, ek); DD.durum.yaz(g.ogunA, ogun);
  };

  window.DDKayit = {
    liste,
    bul: id => liste().find(k => k.id === id) || null,
    gunun: tarih => liste().filter(k => k.tarih === tarih),
    ogunun: (tarih, ogun) => liste().filter(k => k.tarih === tarih && k.ogun === ogun),
    ekle(kayit = {}) {
      let n = Date.now();
      while (yeni().some(k => k.id === `k${n}`)) n += 1;
      const id = `k${n}`;
      DD.durum.yaz(DURUM, [{tarih: DD.bugunIso(), saat: DDV.bugun.simdi, foto: null, ad: '', kcal: 0, protein: 0, karb: 0, yag: 0, lif: null, kaynak: 'arama', guven: null, bilesenler: [], not: null, diyetisyenGorsun: paylasimAcik(), diyetisyenNotu: null, ...kayit, id}, ...yeni()]);
      yayinla(id);
      return id;
    },
    guncelle(id, degisim) {
      const k = this.bul(id);
      if (!k) return null;
      const son = {...k, ...degisim, id};
      DD.durum.yaz(DURUM, [son, ...yeni().filter(x => x.id !== id)]);
      yayinla(id);
      return son;
    },
    sil(id, o = {}) {
      const k = this.bul(id);
      if (k && !o.yalnizKayit) gundenCikar(k);
      DD.durum.yaz(SILINEN, [...new Set([...silinen(), id])]);
      yayinla(id);
    },
    geriAl(id) { gunuGeriAl(id); DD.durum.yaz(SILINEN, silinen().filter(x => x !== id)); yayinla(id); }
  };

  const {sayi, ondalik} = DD;
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id)?.ad || 'Öğün';
  const gunMetin = iso => { const d = new Date(`${iso}T12:00:00`); return `${d.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})} ${d.toLocaleDateString('tr-TR', {weekday: 'long'})}`; };
  const fotolu = k => ['kamera', 'galeri'].includes(k.kaynak);
  // Bugünün öğününe bağlı kayıt: besinleri Öğün detayında yaşar.
  const ogunBagli = k => k.tarih === DD.bugunIso() && k.id === k.ogun;
  const ilkCumleVurgulu = m => (/^[^.]+\./.test(m) ? m.replace(/^([^.]+\.)/, '**$1**') : `**${m}**`);

  // ---------- Bölümler ----------
  const ozet = k => DD.ozetSerit([{ikon: 'kalori', etiket: 'Kalori', deger: sayi(k.kcal), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: sayi(k.protein), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(k.karb), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(k.yag), birim: 'g'}]);
  const bilesenAlt = b => (b.gram ? `${sayi(b.gram)} g` : '');
  const bilesenBolum = k => {
    const not = ogunBagli(k) ? 'Bu öğünün besinlerini **Düzelt** ile değiştirebilirsin.' : fotolu(k) ? 'Değerler fotoğraftan **tahmindir**; bir kaleme dokunup gramını düzeltebilirsin.' : 'Değerler **kendi kaydından** gelir; bir kaleme dokunup gramını düzeltebilirsin.';
    const satirlar = k.bilesenler.map((b, i) => ({baslik: b.ad, alt: bilesenAlt(b), deger: `${sayi(b.kcal)} kcal`, ok: false, veri: ogunBagli(k) ? undefined : {eylem: 'bilesen', id: i}}));
    return DD.bolum({ic: false, baslik: 'Bileşenler', html: `<div class="dd-yigin-12">${DD.p(not, {ton: 'ikincil', meta: true})}${k.bilesenler.length ? DD.satirlar(satirlar) : DD.veriYok('Bu kayıtta **bileşen** kalmadı.')}</div>`});
  };
  const notBolum = k => DD.bolum({ic: false, baslik: 'Notun', eylem: {html: DD.btn({metin: k.not ? 'Düzenle' : 'Not ekle', tur: 'text', boyut: 'sm', veri: {eylem: 'not'}})}, html: k.not ? DD.bilgi({metin: `**${k.not}**`}) : DD.veriYok('Bu tabak için **henüz not** yok.')});
  const diyetisyenNotu = k => {
    if (!k.diyetisyenNotu) return '';
    const d = DDV.diyetisyenler.find(x => x.slug === DDV.kullanici.diyetisyen);
    return DD.bolum({ic: false, baslik: 'Diyetisyen notu', html: DD.ipucu({ikon: 'user-doctor', baslik: `${d.ad} · ${DD.tarihKisa(k.diyetisyenNotu.tarih)}`, metin: ilkCumleVurgulu(k.diyetisyenNotu.metin), eylem: {metin: 'Mesaj yaz', git: '#/uzman/sohbet'}})});
  };
  const paylasimBolum = k => {
    const acik = paylasimAcik();
    const anahtar = DD.toggle({ad: 'gorsun', ikon: 'gizlilik', etiket: 'Diyetisyenim görsün', alt: acik ? 'Fotoğraf, öğün, kalori ve notun' : 'Tabak paylaşımın kapalı', secili: acik && k.diyetisyenGorsun, pasif: !acik});
    const aciklama = acik ? '' : `${DD.p('Bu kayıt **paylaşılmıyor**. Tabak fotoğrafı iznini Sağlık dosyamdan açabilirsin.', {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Sağlık dosyam', ikon: 'tahlil', tur: 'secondary', boyut: 'sm', tam: true, git: '#/saglik'})}`;
    return DD.bolum({ic: false, baslik: 'Paylaşım', html: `<div class="dd-yigin-12">${DD.yuzey(anahtar)}${aciklama}</div>`});
  };
  const kunye = k => DD.kunye([{ikon: 'saat', etiket: 'Saat', deger: k.saat}, {ikon: 'ogun', etiket: 'Öğün', deger: ogunAd(k.ogun)}, k.lif != null && {ikon: 'lif', etiket: 'Lif', deger: `${ondalik(k.lif, 1)} g`}].filter(Boolean));
  const govde = k => `<div class="dd-yigin-24"><div class="dd-sira">${DD.kayitKaynak(k.kaynak, k.guven)}</div>${bilesenBolum(k)}${notBolum(k)}${diyetisyenNotu(k)}${paylasimBolum(k)}</div>`;
  const yok = () => DD.bos({ikon: 'tabak', tam: true, baslik: 'Kayıt bulunamadı', metin: 'Bu tabak **silinmiş** olabilir.', eylem: {metin: 'Tabaklarım', ikon: 'galeri', yerine: '#/tabaklarim'}});
  // Fotoğrafsız kayıt banner değildir: düz üst bar, aynı gövde.
  const fotosuz = k => `<div class="dd-ic dd-yigin-24"><div class="dd-yigin-12">${DD.metinBlok({etiket: `${ogunAd(k.ogun)} · ${gunMetin(k.tarih)}`, baslik: k.ad, rol: 'page', h: 1})}</div>${ozet(k)}${govde(k)}${kunye(k)}</div>`;

  // ---------- Sheet'ler ----------
  // Bileşen değişince toplam fark kadar değişir, makrolar aynı oranda ölçeklenir: tahmin korunur.
  const bilesenYaz = (k, esler) => {
    const bilesenler = esler.filter(Boolean), kcal = bilesenler.reduce((t, b) => t + b.kcal, 0), oran = k.kcal ? kcal / k.kcal : 1;
    kalemleriYaz(k, esler);
    DDKayit.guncelle(k.id, {bilesenler, kcal, protein: bir(k.protein * oran), karb: bir(k.karb * oran), yag: bir(k.yag * oran), lif: k.lif == null ? null : bir(k.lif * oran)});
    DD.tazele();
  };
  const bilesenSheet = (id, i) => {
    const k = DDKayit.bul(id), b = k.bilesenler[i], kcalG = b.gram ? b.kcal / b.gram : 0;
    let gram = b.gram;
    DD.sheet({
      baslik: b.ad,
      html: b.gram
        ? `<div class="dd-yigin">${DD.p('Gram değişince **kalori** de güncellenir.', {ton: 'ikincil'})}<div class="dd-ara">${DD.stepper({ad: 'gram', deger: Math.max(10, Math.round(b.gram / 10) * 10), min: 10, max: 1000, adim: 10, birim: 'g', aria: 'Gram'})}<b class="dd-t-stat" data-yuva="kcal">${sayi(b.kcal)} kcal</b></div></div>`
        : DD.p(`Bu kalem **${sayi(b.kcal)} kcal** olarak kayıtlı; gram bilgisi yok.`, {ton: 'ikincil'}),
      altBar: b.gram ? `<div class="dd-ikili">${DD.btn({metin: 'Çıkar', ikon: 'sil', tur: 'secondary', veri: {eylem: 'b-sil'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'b-kaydet'}})}</div>` : DD.btn({metin: 'Çıkar', ikon: 'sil', tur: 'secondary', tam: true, veri: {eylem: 'b-sil'}}),
      sonra: d => {
        DD.on(d, 'gram', v => { gram = v; d.querySelector('[data-yuva="kcal"]').textContent = `${sayi(kcalG * v)} kcal`; });
        DD.eylem(d, 'b-sil', () => {
          const once = DDKayit.bul(id), ekGeri = ekAnlik(); d.kapat();
          bilesenYaz(once, once.bilesenler.map((y, j) => (j === i ? null : y)));
          DD.toast(`**${b.ad}** çıkarıldı`, {ikon: 'sil', eylem: 'Geri al', onEylem: () => { ekGeri(); DDKayit.guncelle(id, once); DD.tazele(); }});
        });
        DD.eylem(d, 'b-kaydet', () => { d.kapat(); if (gram !== b.gram) { const x = DDKayit.bul(id); bilesenYaz(x, x.bilesenler.map((y, j) => (j === i ? {...y, gram, kcal: Math.round(kcalG * gram)} : y))); DD.toast('Kayıt **güncellendi**', {tur: 'basari'}); } });
      }
    });
  };
  const notSheet = id => {
    const k = DDKayit.bul(id);
    DD.sheet({
      baslik: 'Notun',
      html: DD.input({ad: 'not', cokSatir: true, yer: 'Bu tabakla ilgili birkaç kelime', deger: k.not || ''}),
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'not-kaydet'}}),
      sonra: d => DD.eylem(d, 'not-kaydet', () => { const v = d.querySelector('textarea').value.trim(); d.kapat(); DDKayit.guncelle(id, {not: v || null}); DD.tazele(); DD.toast(v ? 'Notun **kaydedildi**' : 'Notun **kaldırıldı**', {tur: 'basari'}); })
    });
  };
  const duzeltSheet = id => {
    const k = DDKayit.bul(id);
    let ogun = k.ogun;
    DD.sheet({
      baslik: 'Kaydı düzelt',
      html: `<div class="dd-yigin">${DD.input({ad: 'ad', etiket: 'Tabağın adı', deger: k.ad})}<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Öğün</span>${DD.cipler({ad: 'k-ogun', tur: 'tek', etiket: 'Öğün', secili: k.ogun, ogeler: DDV.bugun.ogunler.map(o => ({metin: o.ad, deger: o.id, ikon: o.ikon}))})}</div>${DD.input({ad: 'saat', etiket: 'Saat', tur: 'time', deger: k.saat})}</div>`,
      altBar: DD.btn({metin: 'Kaydet', ikon: 'onay', tam: true, veri: {eylem: 'd-kaydet'}}),
      sonra: d => {
        DD.on(d, 'k-ogun', v => { ogun = v; });
        DD.eylem(d, 'd-kaydet', () => { const ad = d.querySelector('input[name="ad"]').value.trim() || k.ad, saat = d.querySelector('input[name="saat"]').value || k.saat; d.kapat(); ogunTasi(k, ogun); DDKayit.guncelle(id, {ad, ogun, saat}); DD.tazele(); DD.toast('Kayıt **güncellendi**', {tur: 'basari'}); });
      }
    });
  };
  // Bütün tabak tek kalem olur: bileşenlerde makro yok. Kayıt Bugün'de açılır, burada yazılmaz.
  const yineYedim = id => {
    const k = DDKayit.bul(id), gram = k.bilesenler.reduce((t, b) => t + (b.gram || 0), 0);
    DD.durum.yaz('tabagim-ogun', k.ogun);
    DD.tabagim.ekle({ad: k.ad, miktar: 1, birim: 'porsiyon', gram: gram || undefined, gorsel: k.foto, kcal: k.kcal, P: k.protein, K: k.karb, Y: k.yag, Lif: k.lif ?? 0, foto: k.foto, kaynak: k.kaynak, guven: k.guven});
    DD.tabagim.ac({eylem: `${ogunAd(k.ogun)} kaydına ekle`});
  };
  const sil = id => {
    const k = DDKayit.bul(id), bugun = k.tarih === DD.bugunIso();
    DD.geri('#/tabaklarim');
    DDKayit.sil(id);
    DD.toast(bugun ? '**Kayıt silindi**, bugünün toplamından çıktı' : '**Kayıt silindi**', {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DDKayit.geriAl(id); DD.tazele(); }});
  };

  DD.ekran('kayit', {
    tur: 'banner',
    nav: 'bugun',
    ust: '#/tabaklarim',
    yenile: true,
    baslik: ctx => DDKayit.bul(ctx.param.id)?.ad || 'Öğün kaydı',
    ustBar: ctx => { const k = DDKayit.bul(ctx.param.id); if (!k) return {tur: 'alt'}; return {...(k.foto ? {} : {tur: 'alt'}), sag: [{ikon: 'sil', etiket: 'Kaydı sil', veri: {eylem: 'sil'}}]}; },
    ciz: ctx => {
      const k = DDKayit.bul(ctx.param.id);
      if (!k) return yok();
      if (!k.foto) return fotosuz(k);
      return DD.detay({gorsel: k.foto, etiket: ogunAd(k.ogun), baslik: k.ad, alt: gunMetin(k.tarih), bas: ozet(k), govde: govde(k), kuyruk: kunye(k)});
    },
    altBar: ctx => { const k = DDKayit.bul(ctx.param.id); return k ? DD.altEylem({dugmeler: [{metin: 'Düzelt', ikon: 'duzenle', tur: 'secondary', ...(ogunBagli(k) ? {git: `#/ogun/${k.ogun}`} : {veri: {eylem: 'duzelt'}})}, {metin: 'Yine yedim', ikon: 'yenile', veri: {eylem: 'yine'}}]}) : ''; },
    sonra: (kok, ctx) => {
      const id = ctx.param.id;
      if (!DDKayit.bul(id)) return null;
      const c = [
        DD.eylem(kok, 'bilesen', el => bilesenSheet(id, +el.dataset.id)),
        DD.eylem(kok, 'not', () => notSheet(id)),
        DD.eylem(kok, 'duzelt', () => duzeltSheet(id)),
        DD.eylem(kok, 'yine', () => yineYedim(id)),
        DD.eylem(kok, 'sil', () => sil(id)),
        DD.on(kok, 'gorsun', v => { DDKayit.guncelle(id, {diyetisyenGorsun: v}); DD.toast(v ? 'Diyetisyenin bu tabağı **görebilir**' : 'Bu tabak **paylaşılmıyor**', {ikon: 'gizlilik'}); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
