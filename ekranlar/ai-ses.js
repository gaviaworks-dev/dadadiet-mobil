/* SCR-33 Sesli giriş (#/ai/ses, modal). Referans: tasks/referanslar.md Sesli giriş (Lose It! canlı transkript, MyFitnessPal yönlendirme cümlesi).
 * Hal akışı: izin → dinliyor → cozumleniyor → sonuc; hiç kelime gelmeden durdurulursa sessiz. Günlüğe yazmaz; Tabağım'a ekler.
 * Saat ekrana uygun cümleyle başlar (17:10: akşamüstü); "Tekrar dinle" sıradaki cümleye geçer. mikrofon-izin 'verildi'|'reddedildi'. ?izin=sor|red, ?hal=sessiz.
 */
(() => {
  const {sayi} = DD;
  const S = () => DDV.ai.ses;
  const GORSEL = 'assets/gorsel/hero/kayit-kahvalti.webp';
  const kelimeSure = () => (DD.azHareket() ? 0 : DD.TK.motion.quick * 2);
  const ogunAd = id => DDV.bugun.ogunler.find(o => o.id === id)?.ad;
  const baslangic = () => { const dk = DD.simdi().getHours() * 60 + DD.simdi().getMinutes(); return dk < 660 ? 0 : dk < 960 ? 1 : 2; };
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const gorselli = b => ({...b, gorsel: DDV.besinBul(b.slug)?.gorsel ?? null});

  const sonuc = ctx => S().sonuclar[ctx.sira % S().sonuclar.length];
  const dinlemeye = (ctx, sira) => { ctx.hal = 'dinliyor'; ctx.kelime = 0; if (sira != null) ctx.sira = sira; ctx.kalem = null; };

  // ---------- İzin ----------
  const izinHal = ctx => (ctx.sorgu.izin && !ctx.izinGecti ? ctx.sorgu.izin : {verildi: '', reddedildi: 'red'}[DD.durum.oku('mikrofon-izin', '')] ?? 'sor');
  const izinO = () => ({
    gorsel: GORSEL, ikon: 'mikrofon', baslik: 'Seni duymamız gerekiyor',
    metin: 'Yediklerini anlatabilmen için **mikrofon iznine** ihtiyaç var.',
    maddeler: [['mikrofon', 'Yazmadan kaydet', 'Söyle, besinleri ayıralım.'], ['gizlilik', 'Sesin saklanmaz', 'Yalnız yazıya çevrilir.']],
    alternatif: {metin: 'Yazarak ekle', git: '#/besin-ara'},
    reddedildi: {baslik: 'Mikrofon izni kapalı', metin: 'Ayarlar’dan **mikrofon iznini** açabilir ya da besinleri aramayla ekleyebilirsin.'}
  });
  const izinYaz = (ctx, v) => { DD.durum.yaz('mikrofon-izin', v); ctx.izinGecti = true; DD.tazele(); };

  // ---------- Haller ----------
  const ipucu = () => DD.p(S().ipucu.replace('ne kadar', '**ne kadar**'), {orta: true});
  const dinleHtml = ctx => {
    const k = sonuc(ctx).transkript.split(' '), metin = k.slice(0, ctx.kelime).join(' ');
    return DD.bolum({html: `<div class="dd-yigin">
      ${ipucu()}
      ${DD.sesDalga({aktif: true})}
      <div data-yuva="transkript">${DD.transkript({etiket: S().dinleniyor, metin: metin || ' ', canli: true})}</div>
      ${DD.p(`Şöyle söyleyebilirsin: **${S().hazirCumleler[(ctx.sira + 1) % S().hazirCumleler.length]}**`, {ton: 'ikincil', meta: true})}
    </div>`});
  };
  const cozHtml = ctx => DD.bolum({html: `<div class="dd-yigin">
    ${ipucu()}
    ${DD.sesDalga({aktif: false})}
    ${DD.transkript({metin: sonuc(ctx).transkript})}
    <div class="dd-sira">${DD.donen()}<span class="dd-t-meta dd-ton-ikincil">${DD.esc(S().cozumleniyor)}</span></div>
  </div>`});
  const sessizHtml = () => `<div class="dd-ic dd-yigin">
    ${DD.bos({ikon: 'mikrofon', baslik: 'Seni duyamadık', metin: 'Telefonu biraz **yaklaştırıp** yeniden dene ya da aşağıdaki cümlelerden birini seç.', eylem: {metin: 'Tekrar dinle', ikon: 'mikrofon', veri: {eylem: 'tekrar'}}, ikincil: {metin: 'Yazarak ekle', git: '#/besin-ara'}})}
    <div class="dd-yigin-8"><p class="dd-t-label dd-ton-ikincil">Hazır cümleler</p>${DD.satirlar(S().hazirCumleler.map((c, i) => DD.satir({ikon: 'mikrofon', baslik: c, veri: {eylem: 'cumle', id: i}})))}</div>
  </div>`;
  const sonucHtml = ctx => {
    const l = ctx.kalem.map(gorselli), r = sonuc(ctx);
    if (!l.length) return `<div class="dd-ic">${DD.bos({ikon: 'tabak', baslik: 'Besin kalmadı', metin: 'Yeniden **anlatabilir** ya da aramayla ekleyebilirsin.', eylem: {metin: 'Tekrar dinle', ikon: 'mikrofon', veri: {eylem: 'tekrar'}}, ikincil: {metin: 'Besin ara', git: '#/besin-ara'}})}</div>`;
    return `<div class="dd-ic dd-yigin">
      ${DD.transkript({metin: r.transkript})}
      <div class="dd-sira">${DD.durumRozet({kod: 'taslak'})}${DD.durumRozet({metin: ogunAd(r.ogun), ikon: 'ogun'})}</div>
      ${DD.ozetSerit([{ikon: 'kalori', etiket: 'Enerji', deger: sayi(toplam(l, 'kcal')), birim: 'kcal'}, {ikon: 'protein', etiket: 'Protein', deger: sayi(toplam(l, 'P')), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(toplam(l, 'K')), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(toplam(l, 'Y')), birim: 'g'}])}
      <div class="dd-yigin-8">
        <p class="dd-t-label dd-ton-ikincil">Ayırdığımız besinler</p>
        ${DD.satirlar(l.map((b, i) => DD.besinSatir(b, {sag: DD.ikonBtn({ikon: 'duzenle', etiket: `${b.ad} düzenle`, veri: {eylem: 'duzenle', id: i}})})))}
      </div>
      ${DD.btn({metin: 'Başka besin ekle', ikon: 'ekle', tur: 'text', git: '#/besin-ara'})}
    </div>`;
  };

  // ---------- Düzenle ----------
  const birimler = b => {
    const l = [...(DDV.besinBul(b.slug)?.porsiyonlar || [])], tek = b.gram / b.miktar;
    const i = l.findIndex(x => x.birim === b.birim);
    if (i >= 0) l[i] = {...l[i], gram: tek}; else l.unshift({birim: b.birim, gram: tek});
    return l;
  };
  const duzenleSheet = (ctx, i) => {
    const b = ctx.kalem[i], kcal100 = b.kcal / b.gram * 100;
    let yeni = null;
    DD.sheet({
      baslik: b.ad,
      html: DD.porsiyon({ad: 'ses-porsiyon', birimler: birimler(b), secili: b.birim, miktar: b.miktar, kcal100}),
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Çıkar', ikon: 'sil', tur: 'yikici-ikincil', veri: {eylem: 'cikar'}})}${DD.btn({metin: 'Kaydet', ikon: 'onay', veri: {eylem: 'kalem-kaydet'}})}</div>`,
      sonra: h => {
        const c = [
          DD.on(h, 'ses-porsiyon', v => { yeni = v; }),
          DD.eylem(h, 'kalem-kaydet', () => {
            if (yeni) { const kat = yeni.gram / b.gram; ctx.kalem[i] = {...b, miktar: yeni.miktar, birim: yeni.birim, gram: yeni.gram, kcal: yeni.kcal, P: b.P * kat, K: b.K * kat, Y: b.Y * kat, Lif: b.Lif * kat}; }
            h.kapat(); DD.tazele();
          }),
          DD.eylem(h, 'cikar', () => { ctx.kalem.splice(i, 1); h.kapat(); DD.tazele(); })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  // ---------- Süreç ----------
  const durdur = ctx => { clearTimeout(ctx.saat); ctx.saat = 0; };
  const akis = (kok, ctx) => {
    durdur(ctx);
    if (ctx.hal === 'dinliyor') {
      const k = sonuc(ctx).transkript.split(' ');
      const yazKelime = () => {
        ctx.kelime += 1;
        if (ctx.kelime > k.length) { ctx.hal = 'cozumleniyor'; DD.tazele(); return; }
        const y = kok.querySelector('[data-yuva="transkript"]');
        if (y) y.innerHTML = DD.transkript({etiket: S().dinleniyor, metin: k.slice(0, ctx.kelime).join(' '), canli: true});
        ctx.saat = setTimeout(yazKelime, kelimeSure());
      };
      ctx.saat = setTimeout(yazKelime, DD.TK.motion.reveal * 2);
    } else if (ctx.hal === 'cozumleniyor') {
      ctx.saat = setTimeout(() => { ctx.hal = 'sonuc'; ctx.kalem = sonuc(ctx).besinler.map(b => ({...b})); DD.tazele(); }, DD.azHareket() ? 0 : DD.TK.motion.dolum);
    }
  };

  DD.ekran('ai-ses', {
    cevrimici: true,   // ağ gerekir: çevrimdışında bağlantı hatası (önbellek yok)
    iskelet: 'detay',
    tur: 'modal',
    tabagim: false,
    baslik: () => S().baslik,
    ciz: ctx => {
      ctx.sira ??= baslangic();
      ctx.hal ||= ctx.sorgu.hal === 'sessiz' ? 'sessiz' : 'dinliyor';
      ctx.kelime ??= 0;
      const izin = izinHal(ctx);
      if (izin) return DD.izinIstemi({...izinO(), red: izin === 'red'}).html;
      const ust = ctx.hal === 'sonuc' || ctx.hal === 'sessiz' ? '' : DD.gulucuk({gorsel: GORSEL, rozet: 'mikrofon'});
      return `${ust}${{dinliyor: dinleHtml, cozumleniyor: cozHtml, sessiz: sessizHtml, sonuc: sonucHtml}[ctx.hal](ctx)}`;
    },
    altBar: ctx => {
      const izin = izinHal(ctx);
      if (izin) return DD.izinIstemi({...izinO(), red: izin === 'red'}).bar;
      if (ctx.hal === 'dinliyor') return DD.altEylem({dugmeler: [{metin: 'Durdur', ikon: 'stop', tur: 'secondary', tam: true, veri: {eylem: 'durdur'}}]});
      if (ctx.hal === 'sonuc' && ctx.kalem?.length) return DD.altEylem({dugmeler: [{metin: 'Tekrar dinle', ikon: 'mikrofon', tur: 'secondary', veri: {eylem: 'tekrar'}}, {metin: 'Tabağıma ekle', ikon: 'ekle', veri: {eylem: 'ekle'}}]});
      return '';
    },
    sonra: (kok, ctx) => {
      if (!izinHal(ctx)) akis(kok, ctx);
      const izin = ev => {
        if (ev.target.closest('[data-izin-ayar]')) { izinYaz(ctx, 'verildi'); DD.toast('Mikrofon izni **açıldı**', {tur: 'basari'}); return; }
        if (!ev.target.closest('[data-izin-ver]')) return;
        DD.dialog({baslik: '“Dada Diet” mikrofonuna erişmek istiyor', metin: 'Yediklerini **sesle anlatmak** için kullanılır.', eylem: 'İzin ver', iptal: 'İzin verme'}).then(t => izinYaz(ctx, t ? 'verildi' : 'reddedildi'));
      };
      kok.addEventListener('click', izin);
      const c = [
        DD.eylem(kok, 'durdur', () => { durdur(ctx); ctx.hal = ctx.kelime ? 'cozumleniyor' : 'sessiz'; DD.tazele(); }),
        DD.eylem(kok, 'tekrar', () => { dinlemeye(ctx, ctx.hal === 'sonuc' ? ctx.sira + 1 : ctx.sira); DD.tazele(); }),
        DD.eylem(kok, 'cumle', el => { dinlemeye(ctx, +el.dataset.id); DD.tazele(); }),
        DD.eylem(kok, 'duzenle', el => duzenleSheet(ctx, +el.dataset.id)),
        DD.eylem(kok, 'ekle', () => {
          const l = ctx.kalem.map(gorselli);
          DD.durum.yaz('tabagim-ogun', sonuc(ctx).ogun);
          l.forEach(b => DD.tabagim.ekle({ad: b.ad, slug: b.slug, gorsel: b.gorsel, miktar: b.miktar, birim: b.birim, gram: Math.round(b.gram), kcal: Math.round(b.kcal), P: b.P, K: b.K, Y: b.Y, Lif: b.Lif, kaynak: 'ses'}));
          DD.geri();
          DD.toast(`Tabağına eklendi: **${sayi(toplam(l, 'kcal'))} kcal**`, {tur: 'basari'});
        })
      ];
      return () => { durdur(ctx); kok.removeEventListener('click', izin); c.forEach(f => f()); };
    },
    gizlen: (kok, ctx) => durdur(ctx),
    donus: () => DD.tazele()
  });
})();
