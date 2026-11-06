/* Tahlil sonucu (#/ai/tahlil). Referans: tasks/referanslar.md Tahlil sonucu (Cronometer değer çubuğu, Apple Health "Typical" dili, Doctolib belge kaydı, Lifesum yorum kartı).
 * Satırlar DDV.saglik.kanTahlilleri (12 değer), açıklamalar DDV.ai.tahlil, yorum DDV.saglik.aiAnalizleri. Teşhis dili yok: "Aralıkta" / "Referansın altında".
 * Durum: saglik-tahliller (kanTahlilleri şekli, aynı id; analiz bağı kopmasın diye), ai-tahlil-gonderildi (true; sohbet ve Uzmanım bu bayraktan mesaj türetir, uzman-sohbet'e ayrıca yazılmaz). ?hal=okunamadi belge okunamadı, ?hal=hata bağlantı hatası.
 */
(() => {
  const {esc, ondalik} = DD;
  const A = () => DDV.ai.tahlil;
  const tahlil = () => DDV.saglik.kanTahlilleri.find(t => t.id === A().tahlil);
  const onceki = () => DDV.saglik.kanTahlilleri.find(t => t.id !== A().tahlil);
  const analiz = () => DDV.saglik.aiAnalizleri.find(a => a.tahlil === A().tahlil);
  const dosyadakiler = () => DD.durum.oku('saglik-tahliller', []);
  const kayitli = () => dosyadakiler().some(t => t.id === A().tahlil);
  const uzman = () => DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen);
  const ayAdi = t => t.tarihMetin.split(' ')[1];
  const vurguluDeger = v => esc(ondalik(v, 1));

  // Açıklama önce AI satırından; yoksa önceki tahlille kıyas.
  const aciklama = x => {
    const a = A().satirlar.find(s => s.ad === x.ad)?.aciklama;
    if (a && x.durum !== 'normal' || a?.length > 12) return a.replace(/(Referansın altında|referans aralığına girmiş|Aralıkta)/, '**$1**');
    const o = onceki()?.degerler.find(y => y.ad === x.ad);
    return o && o.deger !== x.deger ? `${ayAdi(onceki())} sonucun **${vurguluDeger(o.deger)}** idi.` : '';
  };
  const satirlar = sadeceDisinda => {
    const l = tahlil().degerler.filter(x => !sadeceDisinda || x.durum !== 'normal');
    return [...l].sort((a, b) => (a.durum === 'normal') - (b.durum === 'normal'));
  };
  const liste = ctx => DD.kart({html: `<div class="dd-satirlar">${satirlar(ctx.filtre === 'disinda').map(x => DD.tahlilSatir({...x, aciklama: aciklama(x)})).join('')}</div>`});

  const gonderSheet = kok => {
    const u = uzman(), disinda = satirlar(true);
    DD.sheet({
      baslik: 'Diyetisyenine gönder',
      html: `<div class="dd-yigin">${DD.diyetisyenKart(u, {tur: 'satir', git: null})}${DD.p(`**${tahlil().tarihMetin}** tarihli tahlilin **${A().okunanDeger} değeriyle** birlikte paylaşılır. Aralığın dışında kalan: **${disinda.map(x => x.ad).join(', ') || 'yok'}**.`)}${DD.gizlilikBant('Tahlilini **yalnız sen ve diyetisyenin** görürsün.')}</div>`,
      altBar: DD.btn({metin: 'Gönder', ikon: 'gonder', tam: true, veri: {eylem: 'gonder-onay'}}),
      sonra: h => DD.eylem(h, 'gonder-onay', () => {
        DD.durum.yaz('ai-tahlil-gonderildi', true);
        h.kapat(); DD.tazele();
        DD.toast('Tahlilin **diyetisyenine** gönderildi', {tur: 'basari', eylem: 'Sohbete git', onEylem: () => DD.git('#/uzman/sohbet')});
      })
    });
  };

  DD.ekran('ai-tahlil', {
    tur: 'alt',
    ust: '#/ai/kamera?mod=tahlil',
    baslik: 'Tahlil sonucu',
    ustBar: () => ({sag: [{ikon: 'kamera', etiket: 'Yeni tahlil tara', git: '#/ai/kamera?mod=tahlil'}]}),
    iskelet: 'detay',
    yukle: ctx => (ctx.sorgu.hal === 'hata' && !ctx.denendi
      ? (ctx.denendi = true, Promise.reject(new Error('baglanti')))
      : new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal))),
    ciz: ctx => {
      if (ctx.sorgu.hal === 'okunamadi') return DD.bos({tam: true, ikon: 'tahlil', baslik: 'Belgeyi okuyamadık', metin: 'Kâğıdı **düz bir yüzeye** koyup yeniden çek; değerlerin ve referansların göründüğünden emin ol.', eylem: {metin: 'Yeniden çek', ikon: 'kamera', git: '#/ai/kamera?mod=tahlil'}, ikincil: {metin: 'Sağlık dosyam', git: '#/saglik'}});
      const a = analiz(), T = A();
      return `<div class="dd-ic dd-yigin">
          <div class="dd-yigin-8">
            <div class="dd-sira">${DD.durumRozet({metin: T.tarihMetin, ikon: 'takvim'})}${DD.durumRozet({metin: tahlil().kaynak, ikon: 'kamera'})}</div>
            <h1 class="dd-t-section">${esc(T.baslik)}</h1>
          </div>
          ${DD.ozetSerit([{ikon: 'tahlil', etiket: 'Okunan', deger: T.okunanDeger, birim: 'değer'}, {ikon: 'onay', etiket: 'Aralıkta', deger: T.normal}, {ikon: 'bilgi', etiket: 'Dışında', deger: T.dikkat}])}
          ${DD.ipucu({ikon: 'wand-magic-sparkles', baslik: 'Kısa yorum', metin: a.ozet})}
        </div>
        ${DD.bolum({baslik: 'Değerler', html: `<div class="dd-yigin-12">${DD.segment({ad: 'filtre', secili: ctx.filtre || 'tum', ogeler: [{ad: 'Tümü', deger: 'tum', sayi: T.okunanDeger}, {ad: 'Aralığın dışında', deger: 'disinda', sayi: T.dikkat}]})}<div data-yuva="liste">${liste(ctx)}</div></div>`})}
        ${DD.bolum({baslik: 'Görüşmede konuşabileceklerin', html: `<div class="dd-yigin-12">${a.maddeler.map(m => DD.madde({metin: m.replace(/^(D vitamini|Yağlı balık|Ferritin ve B12|[^ ]+)/, '**$1**'), tur: 'notr'})).join('')}</div>`})}
        ${DD.bolum({html: DD.bant({ton: 'bilgi', metin: T.uyari.replace('teşhis değildir', '**teşhis değildir**')})})}`;
    },
    altBar: ctx => {
      if (ctx.sorgu.hal === 'okunamadi') return '';
      const kayit = kayitli(), gitti = DD.durum.oku('ai-tahlil-gonderildi', false);
      return DD.altEylem({dugmeler: [
        kayit ? {metin: 'Dosyamda', ikon: 'onay', tur: 'secondary', git: '#/saglik'} : {metin: 'Dosyama kaydet', tur: 'secondary', veri: {eylem: 'kaydet-dosya'}},
        gitti ? {metin: 'Sohbete git', ikon: 'sohbet', git: '#/uzman/sohbet'} : {metin: 'Diyetisyene gönder', veri: {eylem: 'gonder'}}
      ]});
    },
    sonra: (kok, ctx) => {
      const c = [
        DD.on(kok, 'filtre', v => { ctx.filtre = v; kok.querySelector('[data-yuva="liste"]').innerHTML = liste(ctx); }),
        DD.eylem(kok, 'kaydet-dosya', () => {
          DD.durum.yaz('saglik-tahliller', [tahlil(), ...dosyadakiler()]); DD.tazele();
          DD.toast('Sağlık dosyana **kaydedildi**', {tur: 'basari', eylem: 'Dosyayı aç', onEylem: () => DD.git('#/saglik')});
        }),
        DD.eylem(kok, 'gonder', () => gonderSheet(kok))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
