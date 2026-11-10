/* Öğün saatlerim (#/ogun-saatleri): web Hesap Ayarları › Öğün Saatlerim (#hs-pane-ogun, uye-ogun-saatleri.js) mobil hali.
 * Hatırlatıcı anahtarı ve "kaç dakika önce" anında yazılır (DD.ogun.ayarYaz). Saat düzeni ctx.taslak'ta tutulur, alt çubuktaki Kaydet ile
 * DD.ogun.saatlerYaz + ayarYaz({ara_sayisi}) (+ oruçta ilkOgunYaz) çağrılır. Öğün satırı dokununca sheet: kadran (5 dk), hatırlatma anahtarı, şablona döndür, kaldır.
 * Hesap DD.ogun.hesap({duz:true, saatler: taslak}) (plansız, işaretsiz üye düzeni). Durum: ogun-hatirlatma, ogun-saatleri, plan.ilkOgunSaati, bildirim-izin.
 * #/ogun-saatleri?hal=hata bağlantı hatası. */
(() => {
  const O = () => DD.ogun;
  const nok = s => O().noktali(s);
  const kopya = x => JSON.parse(JSON.stringify(x));
  const ARA = () => O().sablon().kurallar.filter(k => k.pencere_bit_dk != null).map(k => k.tur);
  const enCok = () => O().sablon().ara_en_cok || 2;
  const izinYolu = () => (O().izin() === 'reddedildi' ? '#/bildirim-izni?hal=red' : '#/bildirim-izni');
  const protokolAd = p => (p === 'sirkadiyen' ? 'Sirkadiyen' : String(p).replace('-', ':'));
  let hataGosterildi = false, yaziyor = false;

  // ---------- Taslak ----------
  const kayitli = () => ({ara: O().ayar().ara_sayisi, saatler: kopya(O().saatler()), ilk: O().oruc()?.ilk_ogun_saati ?? null});
  const taslak = ctx => (ctx.taslak ||= kayitli());
  const degisti = ctx => JSON.stringify(taslak(ctx)) !== JSON.stringify(kayitli());
  const satir = (t, tur) => t.saatler.find(x => x.tur === tur);
  const satirYaz = (t, tur, alan) => {
    let x = satir(t, tur);
    if (!x) { x = {tur, saat: null, aktif: true}; t.saatler.push(x); }
    Object.assign(x, alan);
    if (x.saat == null && x.aktif !== false) t.saatler.splice(t.saatler.indexOf(x), 1);   // şablondaki haline döndü: satır gerekmez
  };
  // Ara öğünler sırayla ara1, ara2: ortadakini kaldırınca arkadaki öne geçer
  const araKaldir = (t, tur) => {
    const A = ARA(), l = A.slice(0, t.ara).map(a => satir(t, a) || null);
    l.splice(A.indexOf(tur), 1);
    t.saatler = t.saatler.filter(x => !A.includes(x.tur));
    l.forEach((x, i) => { if (x) t.saatler.push({...x, tur: A[i]}); });
    t.ara = Math.max(0, t.ara - 1);
  };
  const oruc = t => { const o = O().oruc(); return o ? {...o, ilk_ogun_saati: t.ilk || o.ilk_ogun_saati} : null; };
  const hesap = t => O().hesap({duz: true, saatler: t.saatler, ayar: {...O().ayar(), ara_sayisi: t.ara}, oruc: oruc(t)});
  const planSaati = () => Object.fromEntries((O().plan() || []).filter(x => x.saat).map(x => [x.tur, x.saat]));
  const kurallar = () => O().hesap({duz: true, saatler: [], ayar: {...O().ayar(), ara_sayisi: enCok()}, oruc: null}).ogunler;

  // ---------- Öğün hatırlatıcım ----------
  const durumMetin = () => {
    const a = O().ayar(), h = O().hesap(), od = h.ogunler.find(o => o.tur === h.odak);
    if (!a.acik) return 'Kapalı';
    return od ? `Açık · sıradaki: ${od.ad} ${nok(od.planlanan)}` : 'Açık · bugünün öğünleri tamam';
  };
  const hatirlaticiBolum = () => {
    const a = O().ayar(), izin = O().izin(), s = O().sessiz()?.split('-');
    return `<div class="dd-yigin">
      ${DD.p('Öğün saatin gelince **bildirimle** haber verir; günün öğünleri Profil’de sıralanır. E-postayla öğün hatırlatması gönderilmez.', {ton: 'ikincil'})}
      ${DD.yuzey(DD.toggle({ad: 'oh-acik', ikon: 'bildirim', etiket: 'Öğün hatırlatıcısı', alt: durumMetin(), secili: a.acik}))}
      <div class="dd-yigin-8"><span class="dd-t-card">Ne zaman hatırlatsın?</span>${DD.segment({ad: 'oh-once', etiket: 'Hatırlatma zamanı', secili: String(a.once_dk || 0), ogeler: (O().sablon().once_dk_secenek || [0, 15, 30]).map(d => ({ad: d ? `${d} dk önce` : 'Saatinde', deger: String(d)}))})}<small class="dd-yardim">Öğünün planlanan saatine göre.</small></div>
      ${DD.yuzey(DD.satirlar([
        {ikon: 'mobile-screen', baslik: 'Telefon bildirimi', alt: izin === 'verildi' ? 'İzin verildi' : izin === 'reddedildi' ? 'İzin kapalı; telefon ayarlarından açılır' : 'İzin henüz istenmedi', git: izin === 'verildi' ? '#/bildirim-onizleme' : izinYolu()},
        {ikon: 'moon', baslik: 'Sessiz saatler', alt: s ? `${nok(s[0])}–${nok(s[1])} arası hatırlatma gönderilmez` : 'Kapalı; hatırlatma her saatte gelir', git: '#/ayarlar/bildirim'}
      ]))}
    </div>`;
  };

  // ---------- Öğün saatlerim ----------
  const notlar = t => {
    const h = hesap(t), ps = planSaati(), l = [];
    if (h.oruc) l.push(DD.bant({ikon: 'hourglass-half', baslik: `${protokolAd(h.oruc.protokol)} aralıklı oruç açık`, metin: `Yeme penceren **${nok(h.oruc.bas)}–${nok(h.oruc.bit)}**. Pencere dışına düşen öğün pencere sonuna çekilir.`, eylem: {metin: 'Orucu Tercihlerim’de değiştir', git: '#/tercihler'}}));
    if (O().diyetisyenli()) l.push(DD.bant({ikon: 'uzman', baslik: 'Diyetisyen planın etkin', metin: Object.keys(ps).length ? 'Planda saati olan öğünlerde **plan saati önce gelir**; buradaki saatler planın öğünlerine uygulanır.' : 'Planında öğün saati yok; **buradaki saatler** planın öğünlerine uygulanır.'}));
    return l.join('');
  };
  const kahvaltiSatir = t => {
    const h = hesap(t), k = h.ogunler.find(x => x.tur === 'kahvalti') || {planlanan: h.kahvalti, aktif: true}, o = oruc(t);
    return DD.satir({ikon: 'kahvalti', baslik: o ? 'İlk öğün saatin (kahvaltı)' : 'Kahvaltı saatin', alt: `Zincirin çapası${k.aktif === false ? ' · hatırlatma kapalı' : ''}`, deger: nok(o ? o.ilk_ogun_saati : k.planlanan), veri: {eylem: 'ogun', id: 'kahvalti'}});
  };
  const zincir = () => {
    const A = ARA(), l = kurallar().filter(x => x.tur !== 'kahvalti' && x.tur !== A[1]).map(x => `${A.includes(x.tur) ? 'ara öğün' : x.ad.toLocaleLowerCase('tr')} = ${x.kural}`);
    return DD.p(`**Zincir:** ${l.join('; ')}.`, {meta: true, ton: 'ikincil'});
  };
  const ogunSatir = (x, ps) => {
    const elle = x.kaynak === 'elle', alt = [elle ? 'Elle girdin' : x.kural, ps[x.tur] && `planda ${nok(ps[x.tur])}`, x.aktif === false && 'hatırlatma kapalı'].filter(Boolean).join(' · ');
    return DD.satir({ikon: x.ikon, baslikHtml: `${DD.esc(x.ad)}${elle ? ` ${DD.durumRozet({metin: 'Elle', ton: 'notr', ikon: 'duzenle'})}` : ''}`, alt: alt.charAt(0).toLocaleUpperCase('tr') + alt.slice(1), deger: nok(x.planlanan), veri: {eylem: 'ogun', id: x.tur}});
  };
  const saatlerBolum = t => {
    const h = hesap(t), ps = planSaati(), digerleri = h.ogunler.filter(x => x.tur !== 'kahvalti'), araSay = digerleri.filter(x => ARA().includes(x.tur)).length;
    return `<div class="dd-yigin">
      ${DD.p('Kahvaltı **çapadır**: onu değiştirdiğinde elle girmediğin öğünler zincirle kayar. Bir öğünün saatini değiştirirsen **yalnız o öğün** sabitlenir.', {ton: 'ikincil'})}
      ${notlar(t)}
      <div class="dd-yigin-8">${DD.yuzey(kahvaltiSatir(t))}${zincir()}</div>
      ${DD.yuzey(DD.satirlar(digerleri.map(x => ogunSatir(x, ps))))}
      <div class="dd-ikili">${DD.btn({metin: 'Ara öğün ekle', ikon: 'ekle', tur: 'secondary', pasif: araSay >= enCok(), veri: {eylem: 'ara-ekle'}})}${DD.btn({metin: 'Şablona dön', ikon: 'rotate-left', tur: 'secondary', veri: {eylem: 'sablon'}})}</div>
      ${araSay >= enCok() ? `<small class="dd-yardim">En çok ${enCok()} ara öğün eklenebilir.</small>` : ''}
      ${DD.bilgi({etiket: 'Kaydedince', ikon: 'saat', metin: `**Bugün:** ${O().ozet(h)}`})}
    </div>`;
  };

  // ---------- Bildirim önizlemesi: sıradaki öğün kilit ekranında ----------
  const GORSEL = {kahvalti: 'assets/gorsel/hero/kayit-kahvalti.webp', ara1: 'assets/gorsel/hero/ritim-cay.webp', ara2: 'assets/gorsel/hero/ritim-cay.webp'};
  const tarihMetin = an => `${an.toLocaleDateString('tr-TR', {weekday: 'long'})}, ${an.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})}`;
  const onizlemeBolum = () => {
    const h = O().hesap(), od = h.ogunler.find(o => o.tur === h.odak), an = DD.simdi();
    const yarin = !od && O().hesap({duz: true}), o = od || yarin.ogunler.find(x => x.aktif), b = O().bildirim(o, od ? h : yarin);
    if (!od) an.setDate(an.getDate() + 1);
    return `<div class="dd-yigin">
      ${DD.kilitEkrani({saat: b.saat, tarih: tarihMetin(an), gorsel: GORSEL[o.tur] || 'assets/gorsel/hero/ritim-sofra.webp', baslik: b.baslik, metin: b.metin})}
      ${DD.p(`${od ? 'Sıradaki' : 'Yarının ilk'} hatırlatması **${b.saat}${DDOgun.ekDe(b.saat)}** telefonuna böyle düşer.`, {ton: 'ikincil'})}
      ${DD.btn({metin: 'Bildirimi dene', ikon: 'bildirim', tur: 'secondary', tam: true, git: '#/bildirim-onizleme'})}
    </div>`;
  };

  // ---------- Öğün sheet'i ----------
  const ogunSheet = (ctx, tur) => {
    const t = taslak(ctx), h = hesap(t), x = h.ogunler.find(o => o.tur === tur) || {tur, ad: 'Kahvaltı', planlanan: h.kahvalti, aktif: true, kural: '', notlar: []};
    const o = oruc(t), ps = planSaati(), kahvalti = tur === 'kahvalti', elle = x.kaynak === 'elle', ara = ARA().includes(tur);
    const acik = kahvalti
      ? `${o ? 'Bu saat **Tercihlerim**’deki ilk öğün saatinle aynı kayıttır; burada değiştirirsen orada da değişir. ' : 'Kahvaltı **çapadır**; elle girmediğin öğünler bu saate göre kurulur. '}${ps.kahvalti ? `Planında kahvaltı ${nok(ps.kahvalti)}; plan saati önce gelir.` : ''}`
      : [elle ? '**Elle girdin**; kahvaltı kayınca bu saat değişmez.' : `**Şablon:** ${x.kural}. Kahvaltıyı kaydırırsan bu öğün de kayar.`,
        x.pencere && !elle && `Pencere ${nok(x.pencere.bas)}–${nok(x.pencere.bit)}, hatırlatma ${nok(x.planlanan)}.`,
        ...x.notlar.filter(n => n.kod !== 'sessiz').map(n => n.metin), ps[tur] && `Planında ${nok(ps[tur])}; plan saati önce gelir.`].filter(Boolean).join(' ');
    const dugmeler = [elle && DD.btn({metin: 'Şablona döndür', ikon: 'rotate-left', tur: 'secondary', veri: {eylem: 'oh-coz'}}), ara && DD.btn({metin: 'Öğünü kaldır', ikon: 'sil', tur: 'yikici', veri: {eylem: 'oh-kaldir'}})].filter(Boolean);
    DD.sheet({
      baslik: kahvalti && o ? 'İlk öğün saatin' : x.ad,
      html: `<div class="dd-yigin">
        ${DD.saatKadran({ad: 'oh-saat', deger: kahvalti && o ? o.ilk_ogun_saati : x.planlanan, etiket: kahvalti && o ? 'İlk öğün' : x.ad, adim: 5, noktali: true})}
        ${DD.p(acik)}
        ${DD.yuzey(DD.toggle({ad: 'oh-aktif', ikon: 'bildirim', etiket: 'Hatırlatma', alt: kahvalti ? 'Zincir yine buradan kurulur' : 'Bu öğün için bildirim gönder', secili: x.aktif !== false}))}
        ${dugmeler.length ? `<div class="${dugmeler.length > 1 ? 'dd-ikili' : 'dd-yigin'}">${dugmeler.join('')}</div>` : ''}
      </div>`,
      altBar: DD.btn({metin: 'Tamam', ikon: 'onay', tam: true, attrs: 'data-sheet-kapat'}),
      kapaninca: () => DD.tazele(),
      sonra: d => {
        const c = [
          DD.on(d, 'oh-saat', v => {
            if (!kahvalti) satirYaz(t, tur, {saat: v});
            else if (O().oruc()) t.ilk = v;
            else satirYaz(t, 'kahvalti', {saat: v === O().sablon().kurallar[0]?.varsayilan_saat ? null : v});
          }),
          DD.on(d, 'oh-aktif', v => satirYaz(t, tur, {aktif: v})),
          DD.eylem(d, 'oh-coz', () => { satirYaz(t, tur, {saat: null}); d.kapat(); DD.toast('Saat şablona döndü; artık **kahvaltıyla birlikte** kayar', {ikon: 'rotate-left'}); }),
          DD.eylem(d, 'oh-kaldir', () => { araKaldir(t, tur); d.kapat(); DD.toast(`**${x.ad}** kaldırıldı. Kaydetmeyi unutma.`, {ikon: 'sil'}); })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  DD.ekran('ogun-saatleri', {
    tur: 'alt',
    baslik: 'Öğün saatlerim',
    ust: '#/profil',
    yenile: true,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => DD.bolumler([
      {baslik: 'Öğün hatırlatıcım', html: hatirlaticiBolum()},
      {baslik: 'Öğün saatlerim', html: saatlerBolum(taslak(ctx))},
      {baslik: 'Bildirim önizlemesi', html: onizlemeBolum()}
    ]),
    altBar: ctx => DD.altEylem({dugmeler: [{metin: 'Kaydet', ikon: 'onay', tam: true, pasif: !degisti(ctx), veri: {eylem: 'kaydet'}}]}),
    sonra: (kok, ctx) => {
      const tazele = () => { if (!yaziyor && DD.aktif()?.ad === 'ogun-saatleri') DD.tazele(); };
      document.addEventListener('dd-ogun', tazele);
      const t = () => taslak(ctx);
      const c = [
        () => document.removeEventListener('dd-ogun', tazele),
        DD.on(kok, 'oh-acik', v => {
          if (v && O().izin() !== 'verildi') { DD.tazele(); DD.git(izinYolu()); return; }
          O().ayarYaz({acik: v});
          DD.toast(v ? '**Öğün hatırlatıcın** açıldı' : '**Öğün hatırlatıcın** kapatıldı', {ikon: v ? 'bildirim' : 'bell-slash'});
        }),
        DD.on(kok, 'oh-once', v => {
          const d = +v;
          O().ayarYaz({once_dk: d});
          DD.toast(d ? `Hatırlatma öğünden **${d} dk önce** gelecek` : 'Hatırlatma **öğün saatinde** gelecek', {ikon: 'bildirim'});
        }),
        DD.eylem(kok, 'ogun', el => ogunSheet(ctx, el.dataset.id)),
        DD.eylem(kok, 'ara-ekle', () => { if (t().ara >= enCok()) return; t().ara += 1; DD.tazele(); DD.toast('Ara öğün eklendi; **öğleden sonraki pencereye** yerleşti', {ikon: 'ekle'}); }),
        DD.eylem(kok, 'sablon', () => {
          const s = O().sablon();
          ctx.taslak = {...t(), saatler: [], ara: s.varsayilan_ara_sayisi ?? 1};
          DD.tazele();
          DD.toast(`**Şablon saatleri** yüklendi${O().oruc() ? '; ilk öğün saatin aynı kaldı' : ''}. Kaydetmeyi unutma.`, {ikon: 'rotate-left'});
        }),
        DD.eylem(kok, 'kaydet', el => {
          if (!degisti(ctx)) return;
          const x = t(), once = kayitli();
          yaziyor = true;
          O().saatlerYaz(x.saatler);
          O().ayarYaz({ara_sayisi: x.ara});
          if (O().oruc() && x.ilk && x.ilk !== once.ilk) O().ilkOgunYaz(x.ilk);
          yaziyor = false;
          ctx.taslak = null;
          DD.mesgul(el, DD.TK.motion.reveal).then(() => {
            if (DD.aktif()?.ad === 'ogun-saatleri') DD.tazele();
            DD.toast('**Öğün saatlerin** kaydedildi', {tur: 'basari', eylem: 'Geri al', onEylem: () => {
              O().saatlerYaz(once.saatler); O().ayarYaz({ara_sayisi: once.ara}); if (O().oruc() && once.ilk) O().ilkOgunYaz(once.ilk);
            }});
          });
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
