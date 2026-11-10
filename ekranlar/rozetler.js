/* Rozetlerim (#/rozetler). Web karşılığı: hesabim/rozetlerim (uye-rozetlerim.js): koleksiyon, kademe, puan defteri, liderlik, meydan okumalar.
 * Katalog ve kazanımlar DDV.uye.rozet. Puan kazanılan rozetlerin toplamıdır; kademe puan, takip günü ve ulaşılan hedef (Hedef ailesi) ile atlanır.
 * Durum: rozet-yeni [{id, tarih}] (bu cihazda tamamlanan meydan okuma rozetleri), meydan-katilim {id:{baslangic, isaret:{iso:true}, birakti?}}
 *   (varsayılan DDV.uye.rozet.meydanKatilim, yeni hesapta {}), liderlik-gorunur (boolean, varsayılan true).
 * İlerleme ölçüleri kayıtlardan okunur: program-gecmisi, saglik-olcumler, kayitli-*, test-sonuclari, bugun-su. #/rozetler?sekme=meydan, ?hal=bos, ?hal=hata. */
(() => {
  const R = () => DDV.uye.rozet;
  const isoMs = s => { const [y, a, g] = s.split('-').map(Number); return Date.UTC(y, a - 1, g); };
  const gunFark = (a, b) => Math.round((isoMs(b) - isoMs(a)) / 864e5);
  const gunEkle = (s, n) => new Date(isoMs(s) + n * 864e5).toISOString().slice(0, 10);
  const bugun = () => DD.bugunIso();
  let bosHal = false;
  const yeni = () => DD.yeniHesap() || bosHal;

  // ---------- Kayıtlardan okunan ölçüler ----------
  const hepsi = () => R().aileler.flatMap(a => a.rozetler.map(r => ({...r, aile: a.ad})));
  const kazanilan = () => { const m = {}; [...(yeni() ? [] : R().kazanilan), ...DD.durum.oku('rozet-yeni', [])].forEach(k => { m[k.id] ||= k.tarih; }); return m; };
  const puan = () => { const k = kazanilan(); return hepsi().filter(r => k[r.id]).reduce((t, r) => t + r.puan, 0); };
  const takipGunu = () => (yeni() ? 0 : gunFark(R().baslangic, bugun()));
  const hedefSayisi = () => { const k = kazanilan(); return R().aileler.find(a => a.ad === 'Hedef').rozetler.filter(r => k[r.id]).length; };
  const kayitSayisi = tur => {
    const v = t => (yeni() ? [] : DDV.uye.kayitli[t]);
    const l = {tarifler: DD.durum.oku('kayitli-tarifler', v('tarifler')), besinler: DD.durum.oku('kayitli-besinler', v('besinler')), ipuclari: DD.durum.oku('kayitli-ipuclari', v('ipuclari')), uzmanlar: DD.durum.oku('kayitli-uzmanlar', v('uzmanlar')), programlar: DD.durum.oku('kayitliProgramlar', [])};
    return tur ? l[tur].length : Object.values(l).reduce((t, x) => t + x.length, 0);
  };
  const olcumSayisi = () => {
    const s = yeni() ? [] : [...DDV.saglik.seriler.kilo.aylik, ...DDV.saglik.seriler.kilo.haftalik].map(x => x.tarih);
    return new Set([...s, ...DD.durum.oku('saglik-olcumler', []).map(x => x.tarih)]).size;
  };
  const tamamProgram = () => DD.durum.oku('program-gecmisi', yeni() ? [] : DDV.uye.programGecmisi).filter(x => x.durum === 'tamamlandi').length;

  // ---------- Meydan okumalar ----------
  const katilim = () => DD.durum.oku('meydan-katilim', yeni() ? {} : R().meydanKatilim);
  const suMl = t => {
    if (t === bugun()) return DD.durum.oku(DD.yeniHesap() ? 'yeni-su' : 'bugun-su', null)?.icilenMl ?? (DD.yeniHesap() ? 0 : DDV.bugun.su.icilenMl);
    return DD.yeniHesap() ? 0 : DDV.gecmis.find(g => g.tarih === t)?.suMl || 0;
  };
  const isaretli = (m, k, t) => (m.kural === 'su' ? suMl(t) >= m.hedefMl : !!k.isaret?.[t]);
  const meydanDurum = m => {
    const k = katilim()[m.id];
    if (!k) return {k: null, n: 0, durum: 'yok'};
    const son = gunEkle(k.baslangic, m.sure - 1), bit = bugun() < son ? bugun() : son;
    let n = 0, seri = 0, enUzun = 0;
    for (let t = k.baslangic; t <= bit; t = gunEkle(t, 1)) { if (isaretli(m, k, t)) { n += 1; seri += 1; enUzun = Math.max(enUzun, seri); } else if (t < bugun()) seri = 0; }
    const durum = k.birakti ? 'birakti' : n >= m.sure ? 'tamam' : bugun() > son ? 'bitti' : 'devam';
    return {k, son, n, seri, enUzun, durum, kalan: Math.max(0, gunFark(bugun(), son) + 1), gun: gunFark(k.baslangic, bugun()) + 1};
  };

  const OLCU = {
    program: tamamProgram, olcum: olcumSayisi, kayit: () => kayitSayisi(), besin: () => kayitSayisi('besinler'), puan, gun: takipGunu,
    seri: () => (yeni() ? 0 : DDV.kullanici.seri), kalem: () => (yeni() ? 0 : R().sayaclar.ogunKalemi), test: () => Object.keys(DD.durum.oku('test-sonuclari', {})).length
  };
  const ilerleme = r => { if (!r.olcu) return 0; if (r.olcu.startsWith('meydan:')) return meydanDurum(R().meydan.find(m => m.id === r.olcu.slice(7))).n; return OLCU[r.olcu](); };
  const hal = r => { if (kazanilan()[r.id]) return 'kazanildi'; const n = ilerleme(r); return n > 0 ? 'ilerliyor' : 'kilitli'; };
  // Meydan okuması tamamlanan rozet bu cihazda kazanılmış yazılır.
  const rozetVer = () => {
    const k = kazanilan(), yeniler = R().meydan.filter(m => !k[m.rozet] && meydanDurum(m).durum === 'tamam');
    if (!yeniler.length) return;
    DD.durum.yaz('rozet-yeni', [...DD.durum.oku('rozet-yeni', []), ...yeniler.map(m => ({id: m.rozet, tarih: bugun()}))]);
    yeniler.forEach(m => { const r = hepsi().find(x => x.id === m.rozet); DD.toast(`Yeni rozet: **${r.ad}** (+${r.puan} puan)`, {tur: 'basari', ikon: 'medal'}); });
  };

  // ---------- Kademe ----------
  const kademe = () => {
    const p = puan(), g = takipGunu(), h = hedefSayisi(), K = R().kademeler;
    const i = K.reduce((s, k, n) => (p >= k.puan && g >= k.gun && h >= k.hedef ? n : s), 0);
    return {simdi: K[i], sira: i, sonraki: K[i + 1], p, g, h};
  };
  const kademeKart = () => {
    const k = kademe(), s = k.sonraki;
    if (!s) return DD.kart({html: DD.p(`**${k.simdi.ad}** kademesindesin: merdivenin **son basamağı**.`)});
    const cubuk = (etiket, n, hedef, birim) => DD.ilerleme({n: Math.min(n, hedef), hedef, etiket, deger: n >= hedef ? 'Tamam' : `${DD.sayi(n)} / ${DD.sayi(hedef)} ${birim}`});
    const eksik = [s.puan > k.p && `**${DD.sayi(s.puan - k.p)} puan**`, s.gun > k.g && `**${s.gun - k.g} takip günü**`, s.hedef > k.h && `**${s.hedef - k.h} hedef**`].filter(Boolean);
    return DD.kart({html: `<div class="dd-yigin">${DD.satir({sol: DD.madalya({ikon: s.ikon, hal: 'ilerliyor'}), baslik: `Sıradaki kademe: ${s.ad}`, alt: `${k.sira + 2}. basamak · ${DD.sayi(s.puan)} puan, ${s.gun} gün, ${s.hedef} hedef`})}<div class="dd-yigin-12">${cubuk('Puan', k.p, s.puan, 'puan')}${cubuk('Takip günü', k.g, s.gun, 'gün')}${cubuk('Ulaşılan hedef', k.h, s.hedef, 'hedef')}</div>${DD.p(eksik.length ? `${s.ad} kademesi için ${eksik.join(', ')} kaldı. Kademe **satın alınmaz**, sürdürdükçe yükselir.` : `Üç ölçütü de geçtin; **${s.ad}** kademesine geçiyorsun.`, {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Kademe merdiveni', ikon: 'layer-group', tur: 'tonal', tam: true, veri: {eylem: 'merdiven'}})}</div>`});
  };
  const merdivenSheet = () => {
    const k = kademe();
    DD.sheet({baslik: 'Kademe merdiveni', html: `<div class="dd-yigin">${DD.p('Her kademenin **puan eşiği, takip günü barajı** ve hedef sayısı var; üçünü birlikte geçtiğin en yüksek kademedesin.', {ton: 'ikincil'})}${DD.satirlar(R().kademeler.map((x, n) => ({
      sol: DD.madalya({ikon: x.ikon, hal: n <= k.sira ? '' : 'kilitli'}), baslik: x.ad, alt: `${DD.sayi(x.puan)} puan · ${x.gun} gün · ${x.hedef} hedef`,
      sag: n === k.sira ? DD.durumRozet({metin: 'Buradasın', ton: 'basari', ikon: 'location-dot'}) : n < k.sira ? DD.durumRozet({metin: 'Geçtin', ton: 'notr', ikon: 'onay'}) : ''
    })))}</div>`});
  };

  // ---------- Koleksiyon ----------
  const izgaraOge = r => { const h = hal(r), n = ilerleme(r); return {id: r.id, ad: r.ad, ikon: r.ikon, hal: h, n: Math.min(n, r.hedef || n), hedef: r.hedef, alt: h === 'kazanildi' ? DD.tarihKisa(kazanilan()[r.id]) : `+${r.puan} puan`}; };
  const koleksiyon = aile => {
    const k = kazanilan(), l = R().aileler.filter(a => !aile || a.ad === aile);
    const cip = DD.cipler({ad: 'aile', tur: 'tek', secili: aile || '', ogeler: [{metin: 'Tümü', deger: ''}, ...R().aileler.map(a => ({metin: a.ad, ikon: a.ikon, deger: a.ad, sayi: `${a.rozetler.filter(r => k[r.id]).length}/${a.rozetler.length}`}))]});
    return `<div class="dd-yigin">${cip}${l.map(a => `<section class="dd-yigin-12"><div class="dd-yigin-4">${DD.bas(a.ad, {html: `<span class="dd-t-meta dd-ton-ikincil">${a.rozetler.filter(r => k[r.id]).length} / ${a.rozetler.length}</span>`})}<span class="dd-t-meta dd-ton-ikincil">${DD.esc(a.not)}</span></div>${DD.rozetIzgara({ogeler: a.rozetler.map(izgaraOge)})}</section>`).join('')}</div>`;
  };
  const rozetSheet = id => {
    const r = hepsi().find(x => x.id === id), h = hal(r), n = ilerleme(r), meydan = r.olcu?.startsWith('meydan:');
    const durum = h === 'kazanildi'
      ? DD.durumRozet({metin: `Kazanıldı · ${DD.tarihUzun(kazanilan()[r.id])}`, ton: 'basari', ikon: 'onay'})
      : h === 'ilerliyor' ? DD.ilerleme({n: Math.min(n, r.hedef), hedef: r.hedef, etiket: 'İlerleme', deger: `${DD.sayi(n)} / ${DD.sayi(r.hedef)}`})
        : DD.durumRozet({metin: 'Henüz başlamadın', ton: 'notr', ikon: 'lock'});
    DD.sheet({
      baslik: r.ad,
      html: `<div class="dd-yigin">${DD.satir({sol: DD.madalya({ikon: r.ikon, hal: h === 'kazanildi' ? '' : h, boy: 'buyuk'}), baslik: r.aciklama, alt: `${r.aile} ailesi · +${r.puan} puan`})}${durum}${DD.p(h === 'kazanildi' ? 'Kazandığın rozet **geri alınmaz**; puanı toplamına eklendi.' : 'Her rozet **tek bir ölçülebilir kayıttan** doğar; ilerledikçe çubuk dolar.', {ton: 'ikincil', meta: true})}</div>`,
      altBar: meydan && h !== 'kazanildi' ? DD.btn({metin: 'Meydan okumaya git', ikon: 'trophy', tur: 'secondary', tam: true, veri: {eylem: 'meydana-git'}, attrs: 'data-sheet-kapat'}) : ''
    });
  };

  // ---------- Puan defteri ----------
  const defter = () => {
    const k = kazanilan(), l = hepsi().filter(r => k[r.id]).sort((a, b) => k[b.id].localeCompare(k[a.id])), tavan = hepsi().reduce((t, r) => t + r.puan, 0);
    if (!l.length) return DD.bos({ikon: 'medal', baslik: 'Henüz kazanımın yok', metin: 'İlk rozetini kazandığında **tarihi ve puanı** burada birikmeye başlar.', eylem: {metin: 'Bugün’e git', tur: 'secondary', git: '#/bugun'}});
    const aileler = R().aileler.map(a => { const t = a.rozetler.filter(r => k[r.id]).reduce((s, r) => s + r.puan, 0), m = a.rozetler.reduce((s, r) => s + r.puan, 0); return DD.ilerleme({n: t, hedef: m, etiket: a.ad, deger: `${t} / ${m}`}); }).join('');
    return `<div class="dd-yigin">${DD.p(`Puan ayrı bir sayaç değil: **kazandığın rozetlerin toplamı**. ${R().aileler.length} ailenin tamamı ${DD.sayi(tavan)} puan eder.`, {ton: 'ikincil'})}${DD.kart({html: `<div class="dd-yigin-12">${aileler}</div>`})}${DD.bas('Ne zaman ne kazandın')}${DD.yuzey(DD.satirlar(l.map(r => ({sol: DD.madalya({ikon: r.ikon}), baslik: r.ad, alt: `${DD.tarihUzun(k[r.id])} · ${r.aile}`, deger: `+${r.puan}`, veri: {eylem: 'rozet', id: r.id}}))))}</div>`;
  };

  // ---------- Liderlik ----------
  const gorunur = () => DD.durum.oku('liderlik-gorunur', true);
  const tablo = () => {
    const l = R().liderlik.map(x => ({...x}));
    if (gorunur()) l.push({ad: `${DDV.kullanici.ad} ${DDV.kullanici.soyad.charAt(0)}.`, kullanici: DD.katla(`${DDV.kullanici.ad}${DDV.kullanici.soyad.charAt(0)}`), rozet: Object.keys(kazanilan()).length, puan: puan(), ben: true});
    return l.sort((a, b) => b.puan - a.puan || (b.ben ? 1 : 0) - (a.ben ? 1 : 0));
  };
  const siram = () => { const i = tablo().findIndex(x => x.ben); return i < 0 || !puan() ? null : i + 1; };
  const liderlik = () => `<div class="dd-yigin">${DD.p('Sıralama **rozet puanına** göre kurulur ve çevreni gösterir: üstünde beş, altında iki sıra.', {ton: 'ikincil'})}${DD.yuzey(DD.toggle({ad: 'liderlik-gorunur', ikon: 'eye', etiket: 'Tabloda görün', alt: gorunur() ? 'Adın ve puanın görünüyor' : 'Adın tabloda görünmüyor', secili: gorunur()}))}${DD.yuzey(DD.satirlar(tablo().map((x, n) => ({avatar: {ad: x.ad}, baslik: `${n + 1}. ${x.ad}`, alt: `@${x.kullanici} · ${x.rozet} rozet`, deger: `${DD.sayi(x.puan)} puan`, sag: x.ben ? DD.rozet({metin: 'Sen'}) : ''}))))}</div>`;

  // ---------- Meydan okumalar ----------
  const MD = {devam: ['Devam ediyor', 'basari', 'play'], tamam: ['Tamamladın', 'basari', 'onay'], bitti: ['Süresi bitti', 'notr', 'flag-checkered'], birakti: ['Bıraktın', 'notr', 'circle-stop'], yok: ['Katılmadın', 'notr', 'circle']};
  const meydanKart = m => {
    const d = meydanDurum(m), [et, ton, ikon] = MD[d.durum];
    const bas = `<div class="dd-ara">${DD.ikonKutu({ikon: m.ikon, ton: 'primary'})}${DD.durumRozet({metin: et, ton, ikon})}</div><div class="dd-yigin-8"><h3 class="dd-t-card">${DD.esc(m.ad)}</h3>${DD.p(m.aciklama.replace(/^([^.;]+[.;])/, '**$1**'), {ton: 'ikincil'})}</div>`;
    let govde = DD.bilgi({etiket: 'Günün görevi', ikon: 'list-check', metin: `**${m.gorev}**`});
    if (d.k) govde += `${DD.stat([{deger: `${d.seri}`, etiket: 'Güncel seri'}, {deger: `${d.n}/${m.sure}`, etiket: 'İşaretli gün'}, {deger: String(d.durum === 'devam' ? d.kalan : 0), etiket: 'Kalan gün'}])}${DD.ilerleme({oran: d.n / m.sure})}`;
    else govde += DD.p(`${m.sure} gün sürer; **katıldığın gün 1. gün** sayılır.`, {ton: 'ikincil', meta: true});
    let alt = '';
    if (!d.k || d.durum === 'birakti' || d.durum === 'bitti') alt = DD.btn({metin: d.k ? 'Yeniden başla' : 'Meydan okumaya katıl', ikon: 'trophy', tam: true, veri: {eylem: 'meydan-katil', id: m.id}});
    else if (d.durum === 'devam') {
      const ana = m.kural === 'su'
        ? DD.btn({metin: 'Su kaydına git', ikon: 'su', git: '#/bugun'})
        : DD.btn({metin: d.k.isaret?.[bugun()] ? 'Geri al' : 'Bugünü işaretle', ikon: d.k.isaret?.[bugun()] ? 'rotate-left' : 'onay', tur: d.k.isaret?.[bugun()] ? 'secondary' : 'primary', veri: {eylem: 'meydan-isaret', id: m.id}});
      alt = `<div class="dd-ikili">${DD.btn({metin: 'Bırak', tur: 'secondary', veri: {eylem: 'meydan-birak', id: m.id}})}${ana}</div>${m.kural === 'su' ? DD.p(`Gün içinde **${DD.sayi(m.hedefMl)} ml** suya ulaşınca gün kendiliğinden işaretlenir. Bugün **${DD.sayi(suMl(bugun()))} ml**.`, {ton: 'ikincil', meta: true}) : ''}`;
    }
    return DD.kart({html: `<div class="dd-yigin">${bas}${govde}${alt}${DD.p(`Kaynak: **${m.kaynak}**`, {ton: 'ikincil', meta: true})}</div>`});
  };
  const meydan = () => `<div class="dd-yigin">${DD.p('Her meydan okumanın **tek bir günlük görevi** var; sonuna kadar götürdüğünde rozetini kazanırsın.', {ton: 'ikincil'})}${R().meydan.map(meydanKart).join('')}</div>`;

  const SEKMELER = [['koleksiyon', 'Koleksiyon'], ['defter', 'Puan geçmişi'], ['liderlik', 'Liderlik'], ['meydan', 'Meydan okumalar']];
  const panel = (s, ctx) => (s === 'defter' ? defter() : s === 'liderlik' ? liderlik() : s === 'meydan' ? meydan() : koleksiyon(ctx.aile));

  let hataGosterildi = false, hazir = false;
  DD.ekran('rozetler', {
    tur: 'banner',
    nav: 'profil',
    ust: '#/profil',
    baslik: 'Rozetlerim',
    iskelet: 'profil',
    yenile: true,
    ustBar: () => ({saydam: hazir}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      bosHal = ctx.sorgu.hal === 'bos';
      rozetVer();
      const k = kademe(), adet = Object.keys(kazanilan()).length, s = ctx.sekme || (SEKMELER.some(x => x[0] === ctx.sorgu.sekme) ? ctx.sorgu.sekme : 'koleksiyon'), sira = siram();
      const giris = adet ? '' : DD.bos({ikon: 'medal', baslik: 'İlk rozetin yakın', metin: 'Günlük takibini girdiğinde, ilk ölçümünü kaydettiğinde ya da bir program başlattığında **ilk rozetlerin** gelir.', eylem: {metin: 'Bugün’e git', ikon: 'bugun', git: '#/bugun'}});
      return DD.gulucuk({gorsel: 'assets/gorsel/hero/karsilama-sofra.webp', etiket: 'Rozetlerim', baslik: `${k.simdi.ad} kademesi`, alt: k.sonraki ? `Sıradaki kademe: ${k.sonraki.ad}` : 'Merdivenin son basamağındasın', ust: true}) + DD.bolumler([
        `<div class="dd-yigin">${DD.stat([{deger: DD.sayi(k.p), etiket: 'Puan'}, {deger: `${adet}/${hepsi().length}`, etiket: 'Rozet'}, {deger: sira ? `#${sira}` : '–', etiket: 'Sıran'}])}${giris}</div>`,
        {baslik: 'Kademen', html: kademeKart()},
        {baslik: 'Rozetler', html: `<div class="dd-yigin">${DD.segment({ad: 'rozet-sekme', etiket: 'Rozet bölümleri', kaydir: true, secili: s, ogeler: SEKMELER.map(([deger, ad]) => ({ad, deger}))})}<div data-yuva="rozet">${panel(s, ctx)}</div></div>`},
        DD.bant({ton: 'bilgi', metin: 'Rozetler alışkanlıklarını görünür kılar; **tıbbi bir başarı ölçüsü değildir**.'})
      ]);
    },
    sonra: (kok, ctx) => {
      const yuva = () => kok.querySelector('[data-yuva="rozet"]');
      const ciz = () => { yuva().innerHTML = panel(ctx.sekme || 'koleksiyon', ctx); };
      const meydanYaz = (id, f) => { const l = {...katilim()}; l[id] = f(l[id]); DD.durum.yaz('meydan-katilim', l); };
      const sekmeye = s => { ctx.sekme = s; const b = kok.querySelector(`.dd-seg [data-seg="${s}"]`); b?.click(); };
      const c = [
        DD.on(kok, 'rozet-sekme', v => { ctx.sekme = v; ciz(); }),
        DD.on(kok, 'aile', v => { ctx.aile = v || null; ciz(); }),
        DD.on(kok, 'liderlik-gorunur', v => { DD.durum.yaz('liderlik-gorunur', v); DD.tazele(); DD.toast(v ? 'Adın **liderlik tablosunda** görünüyor' : 'Adın tablodan **gizlendi**', {ikon: v ? 'eye' : 'eye-slash'}); }),
        DD.eylem(kok, 'rozet', el => rozetSheet(el.dataset.id)),
        DD.eylem(kok, 'merdiven', merdivenSheet),
        DD.eylem(kok, 'meydan-katil', el => { const id = el.dataset.id; meydanYaz(id, () => ({baslangic: bugun(), isaret: {}})); DD.tazele(); DD.toast('Meydan okumaya katıldın; **bugün 1. gün**', {tur: 'basari', ikon: 'trophy'}); }),
        DD.eylem(kok, 'meydan-isaret', el => {
          const id = el.dataset.id, on = !katilim()[id].isaret?.[bugun()];
          meydanYaz(id, k => { const isaret = {...(k.isaret || {})}; if (on) isaret[bugun()] = true; else delete isaret[bugun()]; return {...k, isaret}; });
          DD.titres(10); DD.tazele();
          DD.toast(on ? 'Bugün **işaretlendi**' : 'İşaret geri alındı', {ikon: on ? 'onay' : 'rotate-left'});
        }),
        DD.eylem(kok, 'meydan-birak', async el => {
          const id = el.dataset.id, m = R().meydan.find(x => x.id === id);
          if (!await DD.dialog({baslik: 'Meydan okumayı bırak', metin: `**${m.ad}** bırakılırsa işaretli günlerin kalır, **rozet kazanılmaz**. İstediğinde yeniden başlayabilirsin.`, eylem: 'Bırak', iptal: 'Devam et', yikici: true})) return;
          const once = katilim()[id];
          meydanYaz(id, k => ({...k, birakti: true}));
          DD.tazele();
          DD.toast('Meydan okumayı bıraktın', {eylem: 'Geri al', onEylem: () => { meydanYaz(id, () => once); DD.tazele(); }});
        })
      ];
      const sheetGecis = ev => { if (ev.target.closest('[data-eylem="meydana-git"]')) sekmeye('meydan'); };
      document.addEventListener('click', sheetGecis);
      return () => { c.forEach(f => f()); document.removeEventListener('click', sheetGecis); };
    }
  });
})();
