/* SCR-32 Dışarıda Ne Yesem (#/ai/menu). Referans: tasks/referanslar.md Dışarıda Ne Yesem (Simple menü skoru, Yuka sıralı liste).
 * En uygun iki tabak kalan kcal'a göre seçilir, sığanlar puana göre sıralanır; veriye dokunulmayan günde sonuç DDV.ai.disarida.tabaklar[].enUygun ile aynıdır.
 * Günlüğe yazmaz; Tabağım'a ekler. ?hal=bos menü okunamadı, ?hal=hata bağlantı hatası.
 */
(() => {
  const {sayi} = DD;
  const D = () => DDV.ai.disarida;
  const toplam = (l, a) => l.reduce((t, x) => t + (x[a] || 0), 0);
  const gunKalan = () => {
    const d = DD.durum.oku('bugun-ogun', {}), plan = DDV.bugun.ogunler.filter(o => o.durum === 'planli' && d[o.id]?.durum === 'dolu');
    return DDV.bugun.kalanKcal - toplam(Object.values(DD.durum.oku('bugun-ek', {})).flat(), 'kcal') - toplam(plan, 'kcal') - DD.tabagim.toplam().kcal;
  };
  const vurgu = s => s.replace(/(\d+(?:,\d+)? (?:kcal|g))/, '**$1**');

  const eklendi = slug => DD.tabagim.liste().some(x => x.slug === slug && x.taslak === 'ai-menu');
  // Tabağa eklenen tabak kendi kalorisiyle yeniden yargılanmaz: kalan, o tabak eklenmemiş gibi okunur.
  const kalanIcin = (t, kalan) => kalan + (eklendi(t.slug) ? t.kcal : 0);
  const sigar = (t, kalan) => t.kcal <= kalanIcin(t, kalan);
  const siralama = kalan => [...D().tabaklar].sort((a, b) => sigar(b, kalan) - sigar(a, kalan) || b.puan - a.puan);
  const gerekce = (t, kalan) => {
    const k = kalanIcin(t, kalan);
    if (k === D().hedef.kalanKcal && t.gerekce) return vurgu(t.gerekce);
    return sigar(t, kalan)
      ? `Kalan **${sayi(k)} kcal**'ine sığıyor, **${sayi(t.P)} g protein** veriyor.`
      : `Kalan **${sayi(Math.max(k, 0))} kcal**'inin üstünde; porsiyonu paylaşmayı düşünebilirsin.`;
  };
  const uyariMetni = (t, kalan) => (sigar(t, kalan) ? t.uyari : `Kalan hedefinin ${sayi(t.kcal - Math.max(kalanIcin(t, kalan), 0))} kcal üstünde.`);
  const eklemeBtn = t => (eklendi(t.slug) ? {metin: 'Tabağında', ikon: 'onay', tur: 'secondary', veri: {eylem: 'tabagim'}} : {metin: 'Günlüğe ekle', ikon: 'ekle', veri: {eylem: 'ekle', id: t.slug}});

  const oneriler = (l, kalan) => l.slice(0, 2).map(t => DD.oneriKart({...t, enUygun: true, makro: true, uyari: null, gerekce: gerekce(t, kalan), eylem: eklemeBtn(t)})).join('');
  const tumMenu = (l, kalan) => DD.satirlar(l.map((t, i) => DD.satir({sol: DD.gorsel({src: t.gorsel, ad: t.ad}), baslikHtml: `<span data-dd-hece="yok">${i + 1}. ${DD.esc(t.ad)}</span>`, alt: `${t.etiket} · ${sayi(t.P)} g protein`, sag: DD.menuDeger(t), ok: false, veri: {eylem: 'tabak', id: t.slug}})));
  const kurallar = () => `<div class="dd-yigin-12">${D().kurallar.map(k => DD.madde({metin: k.replace(/^([^,;.]+)/, '**$1**'), tur: 'notr'})).join('')}</div>`;

  const gorunum = (ctx, l, kalan) => (ctx.gorunum === 'tum'
    ? tumMenu(l, kalan)
    : `<div class="dd-yigin">${oneriler(l, kalan)}${DD.ako({baslik: 'Dışarıda yerken', html: kurallar()})}</div>`);

  const tabakSheet = (slug, kalan) => {
    const t = D().tabaklar.find(x => x.slug === slug), ek = eklemeBtn(t);
    DD.sheet({
      baslik: t.ad,
      html: `<div class="dd-yigin">${DD.oneriKart({...t, enUygun: false, gerekce: gerekce(t, kalan), uyari: uyariMetni(t, kalan)})}${DD.ozetSerit([{ikon: 'protein', etiket: 'Protein', deger: sayi(t.P), birim: 'g'}, {ikon: 'karb', etiket: 'Karb.', deger: sayi(t.K), birim: 'g'}, {ikon: 'yag', etiket: 'Yağ', deger: sayi(t.Y), birim: 'g'}])}</div>`,
      altBar: `<div class="dd-ikili">${DD.btn({metin: 'Diyetisyene sor', tur: 'secondary', git: '#/uzman/sohbet'})}${DD.btn(ek)}</div>`,
      sonra: h => {
        const c1 = DD.eylem(h, 'ekle', () => { tabagaEkle(slug); h.kapat(); });
        const c2 = DD.eylem(h, 'tabagim', () => { h.kapat(); DD.tabagim.ac(); });
        return () => { c1(); c2(); };
      }
    });
  };

  const tabagaEkle = slug => {
    const t = D().tabaklar.find(x => x.slug === slug), y = DDV.yemekler.find(x => x.slug === slug);
    DD.tabagim.ekle({ad: t.ad, slug, gorsel: t.gorsel, miktar: 1, birim: 'porsiyon', kcal: t.kcal, P: t.P, K: t.K, Y: t.Y, Lif: y?.Lif || 0, taslak: 'ai-menu', kaynak: 'kamera'});
    DD.tazele();
    DD.toast(`Tabağına eklendi: **${sayi(t.kcal)} kcal**`, {tur: 'basari'});
  };

  DD.ekran('ai-menu', {
    tur: 'banner',
    ust: '#/ai/kamera?mod=menu',
    baslik: 'Dışarıda ne yesem?',
    iskelet: 'detay',
    yukle: ctx => (ctx.sorgu.hal === 'hata' && !ctx.denendi
      ? (ctx.denendi = true, Promise.reject(new Error('baglanti')))
      : new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal))),
    ciz: ctx => {
      const m = D().mekan, kalan = gunKalan(), l = ctx.sorgu.hal === 'bos' ? [] : siralama(kalan);
      const bas = {gorsel: m.gorsel, etiket: `${m.tur} · ${m.semt}`, baslik: D().baslik, stat: [{deger: sayi(Math.max(kalan, 0)), etiket: 'Kalan kcal'}, {deger: `${sayi(D().hedef.proteinAcigi)} g`, etiket: 'Protein açığı'}, ...(l.length ? [{deger: l.length, etiket: 'Tabak'}] : [])]};
      if (!l.length) return DD.kubbe({...bas, html: DD.bos({ikon: 'menu', baslik: 'Menüyü okuyamadık', metin: 'Menüyü **düz tut** ve sayfanın tamamı görünecek şekilde yeniden çek.', eylem: {metin: 'Yeniden çek', ikon: 'kamera', git: '#/ai/kamera?mod=menu'}, ikincil: {metin: 'Besin ara', git: '#/besin-ara'}})});
      return DD.kubbe({
        ...bas,
        html: `<div class="dd-ic dd-yigin">
          ${DD.p(`**${m.ad}** menüsünü okuduk. Sıralama **${D().hedef.ogun}** için kalan kalorine ve protein açığına göre yapıldı.`)}
          ${DD.segment({ad: 'gorunum', secili: ctx.gorunum || 'oneri', ogeler: [{ad: 'Sana en uygun', deger: 'oneri', ikon: 'hedef'}, {ad: 'Tüm menü', deger: 'tum', ikon: 'menu', sayi: l.length}]})}
          <div data-yuva="gorunum">${gorunum(ctx, l, kalan)}</div>
          ${DD.p(D().not.replace('tahminidir', '**tahminidir**'), {ton: 'ikincil', meta: true})}
        </div>`
      });
    },
    altBar: ctx => (ctx.sorgu.hal === 'bos' ? '' : DD.altEylem({dugmeler: [{metin: 'Başka menü oku', ikon: 'kamera', tur: 'secondary', tam: true, git: '#/ai/kamera?mod=menu'}]})),
    sonra: (kok, ctx) => {
      const c = [
        DD.on(kok, 'gorunum', v => { ctx.gorunum = v; const kalan = gunKalan(); kok.querySelector('[data-yuva="gorunum"]').innerHTML = gorunum(ctx, siralama(kalan), kalan); }),
        DD.eylem(kok, 'ekle', el => tabagaEkle(el.dataset.id)),
        DD.eylem(kok, 'tabagim', () => DD.tabagim.ac()),
        DD.eylem(kok, 'tabak', el => tabakSheet(el.dataset.id, gunKalan()))
      ];
      return () => c.forEach(f => f());
    },
    donus: () => DD.tazele()
  });
})();
