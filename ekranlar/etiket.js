/* Etiket okuma asistanı (#/etiket?adim=1|2|3). Referans: tasks/referanslar.md Etiket okuma (Food Scanner AI adım ve jeton, Yuka madde satırı, Fooducate oran bandı).
 * Metin duvarı yok: madde başına satır + özet. Jetonlar düzenlenebilir taslaktır; silinen satır analizde görünmez. E kodu satırı sheet açar.
 * Adımlar yığına girer, geri tuşu kendiliğinden çalışır. Silinenler DD.durum 'etiket-silinen'; yeni çekimde sıfırlanır.
 */
(() => {
  const {esc, sayi, ondalik} = DD;
  const E = () => DDV.ai.etiket;
  const urun = () => DDV.ai.barkod.urunler.find(u => u.ean === E().urun);
  const ADLAR = ['Fotoğraf', 'İçerik', 'Analiz'];
  const silinen = () => DD.durum.oku('etiket-silinen', []);
  const kalanSatirlar = () => E().satirlar.filter(s => !silinen().includes(s.metin));
  const adim = ctx => { const n = +ctx.sorgu.adim || 1; return n >= 1 && n <= 3 ? n : 1; };

  // Gastro bul.js adım başı: gösterge + "Adım n / 3 · ad" etiketi.
  const adimBas = n => `<div class="dd-yigin-8">${DD.adimGosterge({adim: n, toplam: 3})}<p class="dd-t-label dd-ton-ikincil">Adım ${n} / 3 · ${ADLAR[n - 1]}</p></div>`;

  // Etiket kâğıdı: besin tablosu + içindekiler, ürün verisinden.
  const kagit = () => {
    const u = urun(), d = u.deger100;
    return DD.belge({baslik: u.ad, alt: `Net ${sayi(u.porsiyonGram)} g porsiyon`, gruplar: [
      {ad: 'Besin değerleri (100 g)', satirlar: [['Enerji', `${sayi(d.kcal)} kcal`], ['Yağ', `${ondalik(d.Y, 1)} g`], ['Karbonhidrat', `${ondalik(d.K, 1)} g`], ['Şeker', `${ondalik(d.seker, 1)} g`], ['Protein', `${ondalik(d.P, 1)} g`], ['Tuz', `${ondalik(d.tuz, 1)} g`]].map(([ad, fiyat]) => ({ad, fiyat}))}
    ]});
  };

  const fotograf = ctx => `<div class="dd-ic dd-yigin">
    ${adimBas(1)}
    ${DD.vizor({foto: 'assets/gorsel/hero/mutfak-raf.webp', kompakt: true, tarama: !!ctx.cekiyor, yonerge: {metin: 'Fotoğrafın yalnız bu cihazda işlenir.'}})}
    ${DD.p('**İçindekiler** ve **besin tablosu** kadrajda görünsün. Parlamayı azaltmak için paketi hafifçe eğ.')}
    ${DD.ipucu({metin: E().ipucu.replace('ağırlığa göre', '**ağırlığa göre**')})}
  </div>`;

  const jetonlar = () => {
    const l = kalanSatirlar();
    return l.length
      ? `<div class="dd-sira">${l.map(s => DD.etiketJeton({metin: s.metin, durum: s.durum, id: s.metin})).join('')}</div>`
      : DD.bos({ikon: 'menu', baslik: 'İçerik kalmadı', metin: 'Etiketi **yeniden çekerek** başlayabilirsin.', eylem: {metin: 'Yeniden çek', ikon: 'kamera', veri: {eylem: 'yeniden'}}});
  };
  const icerik = () => `<div class="dd-ic dd-yigin">
    ${adimBas(2)}
    ${kagit()}
    ${DD.alan({etiket: 'Okuduğumuz içerik', yardim: 'Yanlış okunanı sil; analiz buna göre yapılır.', html: `<div data-yuva="jeton">${jetonlar()}</div>`})}
  </div>`;

  const analiz = () => {
    const u = urun(), l = kalanSatirlar(), dikkat = l.filter(s => s.durum === 'dikkat').length, a = E().alternatif;
    if (!l.length) return `<div class="dd-ic">${DD.bos({tam: true, ikon: 'menu', baslik: 'Okunacak içerik yok', metin: 'Etiketi **yeniden çekerek** başlayabilirsin.', eylem: {metin: 'Yeniden çek', ikon: 'kamera', veri: {eylem: 'yeniden'}}})}</div>`;
    return `<div class="dd-ic dd-yigin">
        ${adimBas(3)}
        ${DD.skorKart({ad: u.ad, kategori: u.kategori, skor: u.skor, etiket: u.skor >= 70 ? 'İyi seçim' : u.skor < 40 ? 'Sık tüketmeye uygun değil' : 'Ölçülü tüket', git: `#/barkod/${u.ean}`})}
        <div class="dd-yigin-8"><h1 class="dd-t-section">${esc(E().baslik)}</h1>${DD.p(E().ozet.replace(/(30 g, 139 kcal)/, '**$1**'))}</div>
        <div class="dd-sira">${DD.durumRozet({metin: `${l.length} madde`, ikon: 'menu'})}${dikkat ? DD.durumRozet({metin: `${dikkat} dikkat noktası`, ton: 'uyari', ikon: 'uyari'}) : ''}</div>
      </div>
      ${DD.bolum({baslik: 'Satır satır', html: DD.satirlar(l.map(s => {
        const kod = s.metin.match(/E\d{3}/);
        const satir = DD.icerikUyari({metin: s.metin, aciklama: s.aciklama, durum: s.durum});
        return kod ? DD.satirKap(satir, DD.ikonBtn({ikon: 'bilgi', etiket: `${s.metin} nedir`, veri: {eylem: 'ekod', id: s.metin}})) : satir;
      }))})}
      ${DD.bolum({baslik: 'Daha iyi puanlı alternatif', html: `<div class="dd-yigin-12">${DD.skorKart({ad: a.ad, skor: a.skor, etiket: 'İyi seçim', git: `#/barkod/${a.ean}`})}${DD.p(a.neden.replace(/^([^,;.]+)/, '**$1**'), {ton: 'ikincil', meta: true})}</div>`})}`;
  };

  const ekodSheet = metin => {
    const kodlar = metin.match(/E\d{3}/g) || [], l = urun().katkiMaddeleri.filter(k => kodlar.includes(k.kod));
    DD.sheet({
      baslik: 'Katkı maddesi',
      html: `<div class="dd-yigin">${DD.satirlar(l.map(k => DD.satir({ikon: 'flask', baslik: `${k.kod} · ${k.ad}`, alt: k.islev})))}${DD.bant({metin: 'Bu bilgi **genel niteliktedir**; sana özel durumlar için diyetisyeninle konuş.'})}</div>`
    });
  };

  const adimAlt = (n, ctx) => {
    if (n === 1) return DD.altEylem({dugmeler: [{metin: 'Galeriden seç', ikon: 'galeri', tur: 'secondary', veri: {eylem: 'cek'}}, {metin: 'Etiketi çek', ikon: 'kamera', yukleniyor: !!ctx.cekiyor, veri: {eylem: 'cek'}}]});
    if (n === 2) return kalanSatirlar().length ? DD.altEylem({dugmeler: [{metin: 'Yeniden çek', ikon: 'kamera', tur: 'secondary', veri: {eylem: 'yeniden'}}, {metin: 'Analiz et', ikon: 'wand-magic-sparkles', git: '#/etiket?adim=3'}]}) : '';
    return kalanSatirlar().length ? DD.altEylem({dugmeler: [{metin: 'Yeni etiket', ikon: 'kamera', tur: 'secondary', veri: {eylem: 'yeniden'}}, {metin: 'Ürün kartı', ikon: 'barkod', git: `#/barkod/${E().urun}`}]}) : '';
  };

  DD.ekran('etiket', {
    cevrimici: true,   // ağ gerekir: çevrimdışında bağlantı hatası (önbellek yok)
    iskelet: 'detay',
    tur: 'alt',
    ust: '#/ai/kamera?mod=barkod',
    baslik: 'Etiket okuma',
    ciz: ctx => [fotograf, icerik, analiz][adim(ctx) - 1](ctx),
    altBar: ctx => adimAlt(adim(ctx), ctx),
    sonra: (kok, ctx) => {
      const c = [
        DD.eylem(kok, 'cek', () => {
          if (ctx.cekiyor) return;
          ctx.cekiyor = true; DD.tazele();
          ctx.saat = setTimeout(() => { ctx.cekiyor = false; DD.durum.sil('etiket-silinen'); DD.git('#/etiket?adim=2'); }, DD.azHareket() ? 0 : DD.TK.motion.tarama);
        }),
        DD.eylem(kok, 'yeniden', () => { DD.durum.sil('etiket-silinen'); DD.yerine('#/etiket'); }),
        DD.eylem(kok, 'jeton-sil', el => {
          const metin = el.dataset.id, onceki = silinen();
          DD.durum.yaz('etiket-silinen', [...onceki, metin]);
          DD.tazele();
          DD.toast(`**${metin}** silindi`, {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('etiket-silinen', onceki); DD.tazele(); }});
        }),
        DD.eylem(kok, 'ekod', el => ekodSheet(el.dataset.id))
      ];
      return () => { clearTimeout(ctx.saat); c.forEach(f => f()); };
    },
    gizlen: (kok, ctx) => { clearTimeout(ctx.saat); ctx.cekiyor = false; },
    donus: () => DD.tazele()
  });
})();
