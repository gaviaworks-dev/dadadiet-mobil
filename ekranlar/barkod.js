/* Barkod analizi (#/barkod/:ean). Referans: tasks/referanslar.md Barkod (Yuka ürün kartı ve madde listesi, Open Food Facts yorum ve bulunamadı hali, Fooducate oranlar).
 * Ürün yoksa bulunamadı hali; reklam ve sponsorlu ürün yok. Sözcükler yargısız: düşük skorda nötr ton, kırmızı yok (referanslar §4).
 * Günlüğe yazmaz; seçilen porsiyon Tabağım'a eklenir. barkod-son [ean] son taramalar. ?hal=hata bağlantı hatası.
 */
(() => {
  const {sayi, ondalik} = DD;
  const urunBul = ean => DDV.ai.barkod.urunler.find(u => u.ean === ean);
  const skorSozcuk = u => (u.skor < 40 ? 'Sık tüketmeye uygun değil' : u.skor >= 70 ? 'İyi seçim' : 'Ölçülü tüket');
  // Uzun sözcük satıra sığsın diye düşük skorda kategori yazılmaz.
  const urunKart = u => DD.skorKart({ad: u.ad, kategori: u.skor < 40 ? null : u.kategori, skor: u.skor, etiket: skorSozcuk(u)});
  // Günün kalanı Bugün'deki halkayla aynı (DD.gunKalan, bugun.js); Tabağım'dakiler de düşülür.
  const gunKalan = () => { const k = DD.gunKalan(); return k == null ? null : k - DD.tabagim.toplam().kcal; };
  const sonaEkle = ean => DD.durum.yaz('barkod-son', [ean, ...DD.durum.oku('barkod-son', []).filter(x => x !== ean)].slice(0, 5));

  const SATIR = [['kcal', 'Enerji', 'kcal', 'kalori'], ['P', 'Protein', 'g', 'protein'], ['K', 'Karbonhidrat', 'g', 'karb'], ['seker', 'Şeker', 'g', 'cube'], ['Y', 'Yağ', 'g', 'yag'], ['doymusYag', 'Doymuş yağ', 'g', 'yag'], ['Lif', 'Lif', 'g', 'lif'], ['tuz', 'Tuz', 'g', 'cubes-stacked']];
  const degerTablo = (u, kip) => {
    const kat = kip === 'porsiyon' ? u.porsiyonGram / 100 : 1;
    return DD.kunye(SATIR.map(([k, etiket, birim, ikon]) => ({ikon, etiket, deger: `${k === 'kcal' ? sayi(u.deger100[k] * kat) : ondalik(u.deger100[k] * kat, 1)} ${birim}`})));
  };
  // Veride "Şekeri yüksek: 100 g'da 19,5 g" biçimi; iki nokta öncesi başlık, sonrası açıklama.
  const uyariSatir = (m, durum) => { const [metin, aciklama] = m.split(': '); return DD.icerikUyari({metin, aciklama, durum}); };
  const RISK = {dusuk: ['Düşük risk', 'basari'], orta: ['Orta risk', 'uyari'], yuksek: ['Yüksek risk', 'uyari']};

  const katkiHtml = u => (u.katkiMaddeleri.length
    ? DD.satirlar(u.katkiMaddeleri.map(k => DD.satir({ikon: 'flask', baslik: `${k.kod} · ${k.ad}`, alt: k.islev, sag: DD.durumRozet({metin: RISK[k.risk][0], ton: RISK[k.risk][1], ikon: k.risk === 'dusuk' ? 'onay' : 'uyari'}), ok: false, veri: {eylem: 'katki', id: k.kod}})))
    : DD.veriYok('Bu üründe **katkı maddesi** görünmüyor.'));

  const alternatifHtml = u => {
    const a = u.alternatif; if (!a) return '';
    const var_ = urunBul(a.ean);
    return DD.bolum({baslik: 'Daha iyi puanlı alternatif', html: `<div class="dd-yigin-12">${DD.skorKart({ad: a.ad, skor: a.skor, etiket: 'İyi seçim', git: var_ ? `#/barkod/${a.ean}` : undefined})}${DD.p(a.neden.replace(/^([^,;.]+)/, '**$1**'), {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Muadil bul', ikon: 'muadil', tur: 'text', git: '#/denge/muadil'})}</div>`});
  };

  const yorum = u => {
    const kcal = u.deger100.kcal * u.porsiyonGram / 100, kalan = gunKalan();
    const pay = kalan != null && kalan > 0 ? ` Kalan **${sayi(kalan)} kcal**'inin yaklaşık **%${sayi(kcal / kalan * 100)}**'i.` : '';
    return `Bir porsiyon **${sayi(u.porsiyonGram)} g**, **${sayi(kcal)} kcal** eder.${pay}`;
  };

  const urunHtml = (u, ctx) => {
    const etiket = DDV.ai.etiket.urun === u.ean;
    return `<div class="dd-ic dd-yigin">
        ${urunKart(u)}
        ${DD.p(yorum(u))}
        ${DD.varsayim({metin: 'Skor **nasıl hesaplanır**?', eylem: 'Aç', veri: {eylem: 'skor'}})}
      </div>
      ${u.uyarilar.length ? DD.bolum({baslik: 'Dikkat edilecekler', html: DD.satirlar(u.uyarilar.map(m => uyariSatir(m, 'dikkat')))}) : ''}
      ${u.olumlu.length ? DD.bolum({baslik: 'İyi yanlar', html: DD.satirlar(u.olumlu.map(m => uyariSatir(m, 'iyi')))}) : ''}
      ${DD.bolum({baslik: 'Besin değerleri', html: `<div class="dd-yigin-12">${DD.segment({ad: 'kip', secili: ctx.kip, ogeler: [{ad: `Porsiyon (${sayi(u.porsiyonGram)} g)`, deger: 'porsiyon'}, {ad: '100 g', deger: '100'}]})}<div data-yuva="deger">${degerTablo(u, ctx.kip)}</div></div>`})}
      ${DD.bolum({baslik: 'Katkı maddeleri', html: katkiHtml(u)})}
      ${DD.bolum({baslik: 'İçindekiler', html: `<div class="dd-yigin-12">${DD.p(`**${u.icindekiler[0]}**${u.icindekiler.length > 1 ? `, ${u.icindekiler.slice(1).join(', ')}` : ''}.`)}${etiket ? DD.btn({metin: 'Etiketi satır satır oku', ikon: 'menu', tur: 'tonal', tam: true, git: '#/etiket'}) : ''}</div>`})}
      ${alternatifHtml(u)}`;
  };

  const bulunamadi = ean => DD.bos({tam: true, ikon: 'barkod', baslik: 'Bu ürünü henüz tanımıyoruz', metin: `**${ean}** numaralı ürün listemizde yok. Etiketini fotoğraflarsan **içeriğini birlikte okuruz**.`, eylem: {metin: 'Etiketi fotoğrafla', ikon: 'kamera', git: '#/etiket'}, ikincil: {metin: 'Yeniden tara', git: '#/ai/kamera?mod=barkod'}});

  const ekleSheet = u => {
    const birimler = [{birim: 'porsiyon', gram: u.porsiyonGram}, {birim: 'gram', gram: 1}];
    let sec = {birim: 'porsiyon', miktar: 1, gram: u.porsiyonGram, kcal: u.deger100.kcal * u.porsiyonGram / 100};
    DD.sheet({
      baslik: 'Ne kadar yedin?',
      html: `<div class="dd-yigin">${urunKart(u)}${DD.porsiyon({ad: 'urun-porsiyon', birimler, secili: 'porsiyon', miktar: 1, kcal100: u.deger100.kcal})}</div>`,
      altBar: DD.btn({metin: 'Tabağıma ekle', ikon: 'ekle', tam: true, veri: {eylem: 'urun-ekle'}}),
      sonra: h => {
        const c1 = DD.on(h, 'urun-porsiyon', v => { sec = v; });
        const c2 = DD.eylem(h, 'urun-ekle', () => {
          const kat = sec.gram / 100, d = u.deger100;
          DD.tabagim.ekle({ad: u.ad, slug: u.ean, gorsel: null, miktar: sec.miktar, birim: sec.birim, gram: Math.round(sec.gram), kcal: Math.round(sec.kcal), P: d.P * kat, K: d.K * kat, Y: d.Y * kat, Lif: d.Lif * kat, kaynak: 'barkod', foto: null});
          h.kapat();
          DD.toast(`Tabağına eklendi: **${sayi(sec.kcal)} kcal**`, {tur: 'basari', eylem: 'Tabağı aç', onEylem: () => DD.tabagim.ac()});
        });
        return () => { c1(); c2(); };
      }
    });
  };

  const katkiSheet = (u, kod) => {
    const k = u.katkiMaddeleri.find(x => x.kod === kod);
    DD.sheet({
      baslik: `${k.kod} · ${k.ad}`,
      html: `<div class="dd-yigin">${DD.p(`**${k.ad}**, üründe **${k.islev.toLocaleLowerCase('tr')}** olarak kullanılır.`)}${DD.kunye([{ikon: 'flask', etiket: 'İşlevi', deger: k.islev}, {ikon: 'bilgi', etiket: 'Düzey', deger: RISK[k.risk][0]}])}${DD.bant({metin: 'Bu bilgi **genel niteliktedir**; sana özel durumlar için diyetisyeninle konuş.'})}</div>`
    });
  };

  DD.ekran('barkod', {
    tur: 'alt',
    ust: '#/ai/kamera?mod=barkod',
    baslik: ctx => (urunBul(ctx.param.ean) ? 'Ürün analizi' : 'Barkod'),
    ustBar: () => ({sag: [{ikon: 'barkod', etiket: 'Yeniden tara', git: '#/ai/kamera?mod=barkod'}]}),
    iskelet: 'detay',
    yukle: ctx => (ctx.sorgu.hal === 'hata' && !ctx.denendi
      ? (ctx.denendi = true, Promise.reject(new Error('baglanti')))
      : new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal))),
    ciz: ctx => {
      const u = urunBul(ctx.param.ean);
      if (!u) return bulunamadi(ctx.param.ean);
      ctx.kip ||= 'porsiyon';
      return urunHtml(u, ctx);
    },
    altBar: ctx => (urunBul(ctx.param.ean) ? DD.altEylem({dugmeler: [{metin: 'Günlüğe ekle', ikon: 'ekle', tam: true, veri: {eylem: 'ekle'}}]}) : ''),
    sonra: (kok, ctx) => {
      const u = urunBul(ctx.param.ean);
      if (!u) return null;
      sonaEkle(u.ean);
      const c = [
        DD.on(kok, 'kip', v => { ctx.kip = v; kok.querySelector('[data-yuva="deger"]').innerHTML = degerTablo(u, v); }),
        DD.eylem(kok, 'ekle', () => ekleSheet(u)),
        DD.eylem(kok, 'katki', el => katkiSheet(u, el.dataset.id)),
        DD.eylem(kok, 'skor', () => DD.sheet({baslik: 'Skor nasıl hesaplanır?', html: `<div class="dd-yigin">${DD.p(DDV.ai.barkod.skorAciklama.replace('100 üzerinden', '**100 üzerinden**'))}${DD.satirlar([{ikon: 'onay', baslik: '70 ve üstü', alt: 'İyi seçim'}, {ikon: 'circle-minus', baslik: '40-69', alt: 'Ölçülü tüket'}, {ikon: 'circle', baslik: '40’ın altı', alt: 'Sık tüketmeye uygun değil'}])}</div>`}))
      ];
      return () => c.forEach(f => f());
    }
  });
})();
