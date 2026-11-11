/* Dışarıda Ne Yesem? (#/disarida): web /disarida-ne-yesem eşi, Gastro liste-v2. Kaynak DDV.disaridaKesif (veri/disarida.js); DDV.ai.disarida ayrıdır.
 * Kubbe + yapışan araç (arama, filtre) · "Beslenme konseptine göre keşfet" şeridi (DD.listeTema; çoklu, Tümü temizler) · Konum (şehir > ilçe > semt) ve "Yakınımdakileri göster" sheet'i ·
 * Gourmet süzgeç grupları filtre sheet'inde (grup içi VEYA, gruplar arası VE; sayaç diğer grupların seçimiyle) · mekan kartı Dada Gourmet'i yeni sekmede açar ·
 * "Menüyü fotoğrafla" → #/ai/kamera?mod=menu · mutfağa göre yemekler (besin detayına gider) · dışarıda yemek rehberleri.
 * "Yakınımdakileri göster": izin yoksa konum izni ekranı; izin verilince liste mekanın mesafeKm değerine göre sıralanır ve kartta "x km" görünür
 *   (mesafeKm web verisindeki sabit noktaya göre mesafedir; cihaz konumu okunmaz). İzin açıkken aynı satır sıralamayı açıp kapatır.
 * Filtre rozeti yalnız filtre sheet'indeki Gourmet gruplarını sayar (sheet'in seçim şeridiyle aynı); konsept, konum ve yakınlık "Seçimlerin"de görünür.
 * Durum: 'disarida-liste' {q, gorunum, dk[], konum{il, ilce, semt}, f{grup:[]}, mutfak}; 'konum-izin' 'verildi'|'reddedildi'; 'disarida-yakin' bool.
 * Dış bağlantı: ?konsept=hafif-fit, ?il=istanbul, ?q=metin, ?temiz=1 · ?izin=sor|red (konum izni) · ortak ?hal=. */
(() => {
  const ANAHTAR = 'disarida-liste', IZIN = 'konum-izin', YAKIN = 'disarida-yakin';
  const WJ = '\u2060', NBSP = '\u00a0';
  // İzin listeden istendiyse onay sonrası listeye geri dönülür; derin bağlantıda (önceki ekran liste değil) izin adresi listeyle değişir.
  let listedenIzin = false;
  const V = () => DDV.disaridaKesif;
  const G = () => V().gruplar.map(g => g.anahtar);
  const bosF = () => Object.fromEntries(G().map(g => [g, []]));
  const bosK = () => ({il: '', ilce: '', semt: ''});
  const harman = new Intl.Collator('tr');

  // ---------- Durum ----------
  const oku = sorgu => {
    const d = DD.durum.oku(ANAHTAR, {}) || {};
    const s = {q: d.q || '', gorunum: d.gorunum === 'liste' ? 'liste' : 'izgara', dk: d.dk || [], konum: {...bosK(), ...(d.konum || {})}, f: {...bosF(), ...(d.f || {})}, mutfak: d.mutfak || ''};
    if (sorgu.temiz || sorgu.q || sorgu.konsept || sorgu.il) {
      Object.assign(s, {q: sorgu.q || '', dk: sorgu.konsept ? sorgu.konsept.split(',') : [], konum: {...bosK(), il: sorgu.il || ''}, f: bosF()});
    }
    return s;
  };
  const yaz = ({q, gorunum, dk, konum, f, mutfak}) => DD.durum.yaz(ANAHTAR, {q, gorunum, dk, konum, f, mutfak});
  const konumSayi = s => ['il', 'ilce', 'semt'].filter(a => s.konum[a]).length;
  const filtreSayi = s => G().reduce((n, g) => n + s.f[g].length, 0);
  const yakinAcik = () => DD.durum.oku(IZIN, '') === 'verildi' && !!DD.durum.oku(YAKIN, false);
  const secimSayi = s => s.dk.length + konumSayi(s) + filtreSayi(s) + (yakinAcik() ? 1 : 0);

  // ---------- Açık olma (web acikDurum): gece yarısını aşan aralık ertesi güne sarkar. Sabit an DD.simdi(). ----------
  const acikEk = m => {
    const t = DD.simdi(), gun = t.getDay() || 7, an = t.toTimeString().slice(0, 5);
    const bugun = m.saatler[gun] || [], dun = m.saatler[gun === 1 ? 7 : gun - 1] || [];
    const ek = [];
    if (bugun.some(([a, k]) => a <= an && (k <= a || an < k)) || dun.some(([a, k]) => k <= a && an < k)) ek.push('simdi');
    if (bugun.length) ek.push('bugun');
    return ek;
  };
  const acikler = new Map();
  const deger = (m, g) => (g === 'acik' ? (acikler.has(m.slug) ? acikler.get(m.slug) : acikler.set(m.slug, [...m.suzgec.acik, ...acikEk(m)]).get(m.slug)) : m.suzgec[g] || []);

  // ---------- Süzme ----------
  const katlanmis = new Map();
  const metin = m => { if (!katlanmis.has(m.slug)) katlanmis.set(m.slug, DD.katla(`${m.ad} ${m.ozet} ${m.kategori} ${m.il} ${m.ilce}`)); return katlanmis.get(m.slug); };
  const konumUyar = (m, k) => (!k.il || m.suzgec.il === k.il) && (!k.ilce || m.suzgec.ilce === k.ilce) && (!k.semt || m.suzgec.semt === k.semt);
  // haric: sayaç hesaplanan grup ('dk', 'konum' ya da süzgeç anahtarı) kendi seçimiyle daraltılmaz.
  const suz = (s, o = {}) => {
    const f = o.f || s.f, dk = o.dk || s.dk, k = o.konum || s.konum, haric = o.haric, q = DD.katla(s.q).split(/\s+/).filter(Boolean);
    return V().mekanlar.filter(m => (haric === 'konum' || konumUyar(m, k))
      && (haric === 'dk' || !dk.length || dk.some(d => m.konsept.includes(d)))
      && G().every(g => g === haric || !f[g].length || f[g].some(v => deger(m, g).includes(v)))
      && q.every(p => metin(m).includes(p)));
  };

  // ---------- Parçalar ----------
  const konsept = d => V().konseptler.find(k => k.deger === d);
  const serit = s => DD.listeTema({ad: 'konsept', baslik: V().konseptBaslik, secili: s.dk.length ? s.dk : [''], ogeler: [
    {metin: 'Tümü', deger: '', ikon: 'border-all', sayi: suz(s, {haric: 'dk'}).length},
    ...V().konseptler.map(k => ({metin: k.etiket, deger: k.deger, ikon: k.ikon, sayi: suz(s, {haric: 'dk'}).filter(m => m.konsept.includes(k.deger)).length}))
  ]});
  const ilAd = v => V().konum.iller.find(x => x.deger === v)?.etiket ?? v;
  const ilceAd = v => Object.values(V().konum.ilceler).flat().find(x => x.deger === v)?.etiket ?? v;
  const semtAd = v => Object.values(V().konum.semtler).flat().find(x => x.deger === v)?.etiket ?? v;
  const konumMetin = k => (k.il ? [ilAd(k.il), k.ilce && ilceAd(k.ilce), k.semt && semtAd(k.semt)].filter(Boolean).join(' · ') : 'Tüm şehirler');
  const konumKart = s => DD.eylemKart({ikon: 'location-dot', baslik: 'Konum', alt: konumMetin(s.konum), veri: {eylem: 'konum'}});
  const menuKart = () => DD.eylemKart({ikon: 'camera', baslik: 'Menüyü fotoğrafla', alt: 'Kalan kalorine uyan tabakları görelim', git: '#/ai/kamera?mod=menu'});
  const secenekAd = (g, v) => V().gruplar.find(x => x.anahtar === g)?.secenekler.find(x => x.deger === v)?.etiket ?? v;
  const secimler = s => DD.listeTema({ad: 'secimler', baslik: 'Seçimlerin', ogeler: [
    ...(yakinAcik() ? [{metin: 'Yakınlığa göre', kapat: true, etiket: 'Yakınlık sıralamasını kaldır', veri: {eylem: 'kaldir', id: 'yakin|1'}}] : []),
    ...s.dk.map(d => ({metin: konsept(d)?.etiket ?? d, kapat: true, etiket: `${konsept(d)?.etiket ?? d} seçimini kaldır`, veri: {eylem: 'kaldir', id: `dk|${d}`}})),
    ...['il', 'ilce', 'semt'].filter(a => s.konum[a]).map(a => { const ad = {il: ilAd, ilce: ilceAd, semt: semtAd}[a](s.konum[a]); return {metin: ad, kapat: true, etiket: `${ad} seçimini kaldır`, veri: {eylem: 'kaldir', id: `konum|${a}`}}; }),
    ...G().flatMap(g => s.f[g].map(v => ({metin: secenekAd(g, v), kapat: true, etiket: `${secenekAd(g, v)} seçimini kaldır`, veri: {eylem: 'kaldir', id: `${g}|${v}`}})))
  ]});

  // Mekan kartı: Gourmet kartı alanları (görsel, tür, ad, konum, fiyat; puan yalnız değerlendirme varsa). Dokunuş Dada Gourmet'i yeni sekmede açar.
  // ₺ işaretleri U+2060 ile birleşir (satır sonunda bölünmez); mesafe yalnız yakınlık sıralaması açıkken.
  const fiyat = f => [...f].join(WJ);
  const meta = m => [yakinAcik() ? `${DD.ondalik(m.mesafeKm, 1)}${NBSP}km` : '', `${m.ilce} / ${m.il}`, fiyat(m.fiyat), m.puan != null ? `★ ${DD.ondalik(m.puan, 1)}` : ''].filter(Boolean).join(' · ');
  const sirali = l => (yakinAcik() ? [...l].sort((a, b) => a.mesafeKm - b.mesafeKm) : l);
  const yeniSekme = m => `${m.ad}, Dada Gourmet'te yeni sekmede açılır`;
  const kart = m => DD.icerikKart({gorsel: m.gorsel, kategori: m.kategori, baslik: m.ad, meta: meta(m), metaIkon: 'location-dot', etiket: yeniSekme(m), veri: {eylem: 'mekan', id: m.slug}});
  const satir = m => DD.satir({sol: DD.gorsel({src: m.gorsel, ad: m.ad}), baslik: m.ad, alt: m.ozet, ozet: true, ek: `<small>${DD.esc(`${m.kategori} · ${meta(m)}`)}</small>`, sag: DD.ik('arrow-up-right-from-square'), ok: false, etiket: yeniSekme(m), veri: {eylem: 'mekan', id: m.slug}});
  const sonuc = (l, s) => DD.listeSonuc(s.gorunum === 'liste' ? [DD.satirlar(l.map(satir))] : l.map(kart), {gorunum: s.gorunum});
  const kaynakNot = () => DD.p("Mekan bilgileri ve görseller **Dada Gourmet**'ten gelir. Henüz değerlendirme almamış mekanda puan gösterilmez.", {ton: 'ikincil', meta: true});

  // Mutfağa göre yemekler: web disarida.yemekler (tahmini değerler, besin kütüphanesi bağlantısı).
  const mutfaklar = () => { const l = []; V().yemekler.forEach(y => y.mutfakSlug.forEach((m, i) => { if (!l.some(x => x.deger === m)) l.push({deger: m, ad: y.mutfaklar[i]}); })); return l; };
  const yemekSatir = y => {
    const b = DDV.besinBul?.(y.besinSlug);
    return DD.besinSatir({ad: y.ad, gorsel: b?.gorsel, kcal: y.kcal, P: y.P, K: y.K, Y: y.Y}, {
      alt: `${y.porsiyon.ad} · P ${DD.ondalik(y.P)} g · K ${DD.ondalik(y.K)} g · Y ${DD.ondalik(y.Y)} g`,
      ek: y.ipucu ? `<small>${DD.esc(y.ipucu)}</small>` : '', git: b ? `#/besin/${y.besinSlug}` : undefined, ok: !!b
    });
  };
  const yemekBolum = s => {
    const l = V().yemekler.filter(y => !s.mutfak || y.mutfakSlug.includes(s.mutfak));
    return `<section class="dd-yigin-12">${DD.bas('Mutfağa göre yemekler')}${DD.cipler({ad: 'mutfak', tur: 'tek', etiket: 'Mutfak', secili: s.mutfak, ogeler: [{metin: 'Tümü', deger: ''}, ...mutfaklar().map(m => ({metin: m.ad, deger: m.deger}))]})}${DD.satirlar(l.map(yemekSatir))}${DD.p(V().yemekNotu.replace('Değerler tahminidir', '**Değerler tahminidir**'), {ton: 'ikincil', meta: true})}</section>`;
  };
  // Rehberler: DDV.rehber'de gerçekten olan sayfalar, kendi başlıklarıyla (web'in 6 başlığının ayrı sayfası yok). Hiçbiri yoksa tek Dengeli Tabak satırı.
  const rehberBolum = () => {
    const l = V().rehberler.map(slug => DDV.rehber?.liste?.find(x => x.slug === slug)).filter(Boolean);
    const satirlar = l.length ? l.map(x => ({ikon: 'book-open', baslik: x.baslik, git: `#/rehber/${x.slug}`})) : [{ikon: 'book-open', baslik: 'Dengeli Tabak rehberi', git: '#/rehber/dengeli-tabak'}];
    return `<section class="dd-yigin-12">${DD.bas(V().rehberBaslik)}${DD.satirlar(satirlar)}</section>`;
  };
  const bilgiNot = () => DD.bant({ton: 'bilgi', metin: V().bilgiNotu});

  const bosMetin = s => (s.q ? `“**${s.q}**” için mekan bulamadık. Daha kısa yazmayı ya da **seçili filtreleri temizlemeyi** dene.` : V().bos.metin.replace('seçili filtreleri temizle', '**seçili filtreleri temizle**'));
  const icerik = (s, hazir) => {
    const l = sirali(suz(s));
    const ust = `<div class="dd-yigin">${serit(s)}<div class="dd-yigin-12">${konumKart(s)}${menuKart()}</div></div>${secimSayi(s) ? secimler(s) : ''}`;
    const liste = !hazir
      ? `${DD.listeDurum({sayi: l.length, birim: 'mekan', gorunum: s.gorunum, sirala: false})}<div class="dd-liste-results">${DD.iskelet(4, s.gorunum === 'liste' ? 'satir' : 'kart')}</div>`
      : l.length
        ? `${DD.listeDurum({sayi: l.length, birim: 'mekan', gorunum: s.gorunum, sirala: false})}${sonuc(l, s)}`
        : DD.listeBos({ikon: 'location-dot', baslik: V().bos.baslik, metin: bosMetin(s), eylem: {metin: V().bos.eylem, tur: 'secondary', veri: {eylem: 'temizle'}}});
    return `<div class="dd-yigin-24"><div>${ust}${liste}</div>${kaynakNot()}${yemekBolum(s)}${rehberBolum()}${bilgiNot()}</div>`;
  };

  // ---------- Konum sheet'i (web Konum grubu: Yakınımdakileri göster, Şehir > İlçe > Semt; mekanı olan seçenekler, sayıya göre) ----------
  const konumSecenek = (s, k, alan, ust) => {
    const taban = suz(s, {haric: 'konum'}).filter(m => !ust || m.suzgec[alan === 'ilce' ? 'il' : 'ilce'] === ust);
    const kaynak = alan === 'il' ? V().konum.iller : V().konum[alan === 'ilce' ? 'ilceler' : 'semtler'][ust] || [];
    return kaynak.map(x => ({metin: x.etiket, deger: x.deger, sayi: taban.filter(m => m.suzgec[alan] === x.deger).length}))
      .filter(x => x.sayi || x.deger === k[alan]).sort((a, b) => b.sayi - a.sayi || harman.compare(a.metin, b.metin));
  };
  const konumGovde = (s, k) => {
    const izin = DD.durum.oku(IZIN, '');
    const alt = izin === 'verildi' ? (yakinAcik() ? 'Açık · En yakın mekan önce' : 'Kapalı · Konum izni açık') : izin === 'reddedildi' ? 'Konum izni kapalı' : 'Konum izni gerekir';
    const yakin = DD.satir({ikon: 'location-crosshairs', baslik: V().yakinim.etiket, alt, veri: {eylem: 'yakinim'}});
    const grup = (alan, etiket, ust) => DD.alan({etiket, html: DD.cipler({ad: `konum-${alan}`, tur: 'tek', serit: false, etiket, secili: k[alan], ogeler: konumSecenek(s, k, alan, ust)})});
    return `<div class="dd-yigin">${DD.satirlar([yakin])}${grup('il', 'Şehir')}${k.il ? grup('ilce', 'İlçe', k.il) : ''}${k.ilce ? grup('semt', 'Semt', k.ilce) : ''}</div>`;
  };
  const konumSheet = (kok, s, guncelle) => {
    const k = {...s.konum};
    const say = () => suz(s, {konum: k}).length;
    const dugme = () => `${DD.sayi(say())} mekanı göster`;
    return DD.sheet({baslik: 'Konum', html: `<div data-yuva="konum">${konumGovde(s, k)}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Temizle', tur: 'secondary', veri: {'konum-temizle': 1}})}${DD.btn({metin: dugme(), veri: {'konum-uygula': 1}})}</div>`,
      sonra: (el, h) => {
        const yuva = el.querySelector('[data-yuva="konum"]'), uygula = el.querySelector('[data-konum-uygula]');
        const ciz = () => { yuva.innerHTML = konumGovde(s, k); uygula.querySelector('span').textContent = dugme(); };
        const degis = ev => {
          const a = ev.detail?.ad?.replace('konum-', '');
          if (!['il', 'ilce', 'semt'].includes(a)) return;
          const v = ev.detail.deger === k[a] ? '' : ev.detail.deger;   // tek seçim; seçili çipe yeniden dokunmak bırakır
          k[a] = v;
          if (a === 'il') { k.ilce = ''; k.semt = ''; }
          if (a === 'ilce') k.semt = '';
          ciz();
        };
        const tik = ev => {
          if (ev.target.closest('[data-konum-temizle]')) { Object.assign(k, bosK()); ciz(); return; }
          if (ev.target.closest('[data-konum-uygula]')) { s.konum = {...k}; guncelle(); h.kapat(); return; }
          if (!ev.target.closest('[data-eylem="yakinim"]')) return;
          const izin = DD.durum.oku(IZIN, '');
          if (izin === 'verildi') {
            const on = !yakinAcik(); DD.durum.yaz(YAKIN, on); ciz(); guncelle();
            DD.toast(on ? V().yakinim.basari : 'Yakınlık sıralaması **kapatıldı**', {ikon: 'location-dot'});
            return;
          }
          h.kapat();
          listedenIzin = true;
          DD.git(`#/disarida?izin=${izin === 'reddedildi' ? 'red' : 'sor'}`);
        };
        el.addEventListener('dd-degisim', degis);
        el.addEventListener('click', tik);
        return () => { el.removeEventListener('dd-degisim', degis); el.removeEventListener('click', tik); };
      }});
  };
  // ---------- Konum izni hali (?izin=sor|red): ortak DD.izinIstemi ----------
  const izinHal = ctx => (['sor', 'red'].includes(ctx.sorgu.izin) ? ctx.sorgu.izin : '');
  const izinO = ctx => DD.izinIstemi({
    gorsel: 'assets/gorsel/hero/lokanta-istanbul.webp', ikon: 'location-crosshairs',
    baslik: 'Yakınındaki mekanları gösterelim',
    metin: 'Mekanları sana yakınlığa göre sıralamak için **konum iznine** ihtiyaç var.',
    maddeler: [['location-crosshairs', 'Yakınındakiler önce', 'Mekanlar sana yakınlığa göre sıralanır.'], ['map-location-dot', 'İzinsiz de seçebilirsin', 'Şehir, ilçe ve semt seçimiyle listeyi daraltırsın.']],
    izin: 'Konuma izin ver',
    red: izinHal(ctx) === 'red',
    reddedildi: {baslik: 'Konum izni kapalı', metin: 'Telefonunun **Ayarlar › Konum** bölümünden Dada Diet için konumu açabilirsin. Mekanları şehir ve semt seçerek de süzebilirsin.'}
  });
  const izinVerildi = () => {
    DD.durum.yaz(IZIN, 'verildi');
    DD.durum.yaz(YAKIN, true);
    if (listedenIzin) { listedenIzin = false; DD.geri('#/disarida'); } else DD.yerine('#/disarida');
    DD.toast(V().yakinim.basari, {tur: 'basari', ikon: 'location-dot'});
  };

  DD.ekran('disarida', {
    bos: {ikon: 'location-dot', baslik: 'Henüz mekan yok', metin: 'Bu bölgede listelenecek **Dada Gourmet mekanı** henüz yok. Menüyü fotoğrafla, kalan kalorine uyan tabakları seçelim.', eylem: {metin: 'Menüyü fotoğrafla', ikon: 'camera', git: '#/ai/kamera?mod=menu'}},   // ?hal=bos (ortak DD.bos)
    tur: 'banner',
    nav: 'bugun',
    // Konum izni halinde izin çubuğu alt menünün altında kalmasın (hesaplayicilar.js ile aynı getter).
    get dock() { return !/[?&]izin=(sor|red)\b/.test(location.hash); },
    ust: '#/bugun',
    baslik: 'Dışarıda Ne Yesem?',
    iskelet: 'izgara',
    yenile: true,
    ciz: ctx => {
      if (!V()?.mekanlar?.length) return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/disarida'}});
      if (izinHal(ctx)) return izinO(ctx).html;
      ctx.liste ||= oku(ctx.sorgu);
      const s = ctx.liste, M = V().mekanlar;
      const tekil = f => new Set(M.flatMap(f)).size;
      return DD.kubbe({
        gorsel: 'assets/gorsel/hero/restoran-masa.webp',
        etiket: V().bas.etiket,
        baslik: V().bas.baslik,
        alt: V().bas.alt,
        // Sayılar listedeki mekanlardan: mekan, şehir, mutfak türü.
        stat: [{deger: DD.sayi(M.length), etiket: 'Mekan'}, {deger: DD.sayi(tekil(m => [m.suzgec.il])), etiket: 'Şehir'}, {deger: DD.sayi(tekil(m => m.suzgec.mutfak)), etiket: 'Mutfak türü'}],
        arac: DD.listeArac({yer: 'Mekan, şehir ya da tür ara', deger: s.q, filtreSayi: filtreSayi(s)}),
        html: icerik(s, ctx.hazir)
      });
    },
    altBar: ctx => (izinHal(ctx) ? izinO(ctx).bar : ''),
    sonra: (kok, ctx) => {
      if (izinHal(ctx)) {
        const tik = ev => {
          if (ev.target.closest('[data-izin-ayar]')) { izinVerildi(); return; }
          if (!ev.target.closest('[data-izin-ver]')) return;
          DD.dialog({baslik: '“Dada Diet” konumunu kullanmak istiyor', metin: 'Konumun **yakındaki mekanları** sıralamak için kullanılır.', eylem: 'İzin ver', iptal: 'İzin verme'})
            .then(evet => { if (evet) izinVerildi(); else { DD.durum.yaz(IZIN, 'reddedildi'); DD.yerine('#/disarida?izin=red'); } });
        };
        kok.addEventListener('click', tik);
        return () => kok.removeEventListener('click', tik);
      }
      const s = ctx.liste;
      if (!s) return null;
      const govde = kok.querySelector('.dd-liste-icerik'), arac = kok.querySelector('.dd-liste-arac'), kaydir = kok.querySelector('.dd-kaydir'), girdi = arac.querySelector('input');
      let bekle = 0, zaman = 0;

      const rozet = () => DD.filtreSayiYaz(arac, filtreSayi(s));
      const rayX = () => govde.querySelector('[data-ad="konsept"]')?.scrollLeft || 0;
      const hizala = () => { if (!arac.classList.contains('is-stuck')) return; const fark = govde.getBoundingClientRect().top - arac.getBoundingClientRect().bottom; if (fark < 0) kaydir.scrollTop += fark; };
      // Yeniden çizimde konsept şeridinin kaydırması korunur.
      const listeCiz = () => { const x = rayX(); govde.innerHTML = icerik(s, ctx.hazir); const r = govde.querySelector('[data-ad="konsept"]'); if (r) r.scrollLeft = x; };
      const guncelle = () => { listeCiz(); rozet(); yaz(s); hizala(); };
      if (!ctx.hazir) zaman = setTimeout(() => { ctx.hazir = true; listeCiz(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal);

      const ara = () => { clearTimeout(bekle); bekle = setTimeout(() => { s.q = girdi.value.trim(); guncelle(); }, DD.TK.motion.quick); };
      const enter = ev => { if (ev.key === 'Enter') girdi.blur(); };
      girdi.addEventListener('input', ara);
      girdi.addEventListener('keydown', enter);

      const canli = d => {
        const b = document.querySelector('[data-filtre-uygula]'), sheet = b?.closest('.dd-sheet');
        if (!b) return;
        const f = {...bosF(), ...Object.fromEntries(G().map(g => [g, (d[g] || []).map(String)]))}, n = suz(s, {f}).length;
        b.querySelector('span').textContent = n ? `${DD.sayi(n)} mekanı göster` : 'Sonuç yok';
        b.disabled = !n;
        G().forEach(g => { const taban = suz(s, {f, haric: g}); sheet.querySelectorAll(`input[name="${g}"]`).forEach(i => { const c = i.closest('.dd-option')?.querySelector('.dd-option__count'); if (c) c.textContent = taban.filter(m => deger(m, g).includes(i.value)).length; }); });
      };
      const temizleyiciler = [
        DD.on(kok, 'konsept', v => { s.dk = !v ? [] : s.dk.includes(v) ? s.dk.filter(x => x !== v) : [...s.dk, v]; guncelle(); }),
        DD.on(kok, 'gorunum', v => { s.gorunum = v; listeCiz(); yaz(s); }),
        DD.on(kok, 'mutfak', v => { s.mutfak = v || ''; yaz(s); const y = govde.querySelector('.dd-yigin-24 > section'); if (y) y.outerHTML = yemekBolum(s); }),
        DD.eylem(kok, 'konum', () => konumSheet(kok, s, guncelle)),
        DD.eylem(kok, 'mekan', el => window.open(`${V().gourmet}${el.dataset.id}`, '_blank', 'noopener')),
        DD.eylem(kok, 'filtre', () => DD.filtreSheet({
          baslik: 'Mekanları filtrele',
          gruplar: V().gruplar.map(g => { const taban = suz(s, {haric: g.anahtar}); return {baslik: g.baslik, ad: g.anahtar, ikon: g.ikon, tur: 'coklu', ogeler: g.secenekler.map(x => ({metin: x.ek ? `${x.etiket} (${fiyat(x.ek)})` : x.etiket, deger: x.deger, ikon: x.yildiz ? 'star' : undefined, sayi: taban.filter(m => deger(m, g.anahtar).includes(x.deger)).length}))}; }),
          secili: s.f,
          eylem: `${DD.sayi(suz(s).length)} mekanı göster`,
          degisti: canli,
          uygula: d => { s.f = {...bosF(), ...Object.fromEntries(G().map(g => [g, (d[g] || []).map(String)]))}; guncelle(); }
        })),
        DD.eylem(kok, 'kaldir', el => {
          const [g, v] = el.dataset.id.split('|');
          if (g === 'yakin') DD.durum.yaz(YAKIN, false);
          else if (g === 'dk') s.dk = s.dk.filter(x => x !== v);
          else if (g === 'konum') { s.konum[v] = ''; if (v === 'il') Object.assign(s.konum, bosK()); if (v === 'ilce') s.konum.semt = ''; }
          else s.f[g] = s.f[g].filter(x => x !== v);
          guncelle();
        }),
        DD.eylem(kok, 'temizle', () => { Object.assign(s, {dk: [], konum: bosK(), f: bosF(), q: ''}); DD.durum.yaz(YAKIN, false); girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); guncelle(); })
      ];
      return () => { clearTimeout(bekle); clearTimeout(zaman); girdi.removeEventListener('input', ara); girdi.removeEventListener('keydown', enter); temizleyiciler.forEach(f => f()); };
    }
  });
})();
