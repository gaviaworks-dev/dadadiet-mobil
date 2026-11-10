/* İpucu detay (#/ipucu/:slug). Gastro karşılığı: püf noktası detayı (v3-app/ortak/sayfalar/icerik.js DG.sayfa('puf')):
 * kart perdeli banner (başlık, "tür · kategori" alt satırı, okunma sayacı) + panelde giriş metni, numaralı içerik blokları
 * (DG.icerikBlok ↔ DD.icerikBlok), uyarı kutusu (DG.ipucu ↔ DD.ipucu), aşağıda bölüm; kaydırınca beliren eylem çubuğu (kayanBar).
 * Web karşılığı ipuclari/<slug> ve puflar/<slug>: özet, bölümlü metin, Kaynaklar, Genel bilgi notu + Diyetisyen Bul,
 * yayın/kategori/okuma/okunma, Paylaş, "Bunlar da İşine Yarar" (aynı kategori, sonra aynı tür; yalnız ipuçları).
 * Kaynak DDV.kutuphane.icerikBul (DDV.icerikler + kütüphane ipuçları). Tam metin yalnız DDV.kutuphane.ipucuMetin'de olan 2 yazıda;
 * kalanında özet, okuma süresi, okunma ve ilgili yazılar: metin uydurulmaz.
 * Durum: 'kayitli-ipuclari' (slug listesi; varsayılan DDV.uye.kayitli.ipuclari, yeni hesapta []). ?hal=hata bağlantı hatası. */
(() => {
  const tum = () => DDV.kutuphane?.icerikTum?.() || (DDV.icerikler || []).map(x => ({tur: 'ipucu', ...x}));
  const bul = slug => tum().find(x => x.slug === slug) || null;
  const metinOf = slug => DDV.kutuphane?.ipucuMetin?.[slug] || null;
  const okunma = x => DDV.kutuphane?.okunma?.[x.slug] ?? null;
  const okumaDk = x => x.okumaDk ?? null;
  const turAd = x => (x.tur === 'puf' ? 'Püf noktası' : 'İpucu');
  const kayitlar = () => DD.durum.oku('kayitli-ipuclari', DD.yeniHesap() ? [] : (DDV.uye?.kayitli?.ipuclari || []));
  const webUrl = x => `https://dadadiet.com/${x.tur === 'puf' ? 'puflar' : 'ipuclari'}/${x.slug}`;

  // ---------- Vurgu ----------
  // Paragraf sırasıyla (bölümler düzleştirilmiş) vurgulanacak ifadeler: web sayfasındaki kalınlar (b, strong) aynen; web'de vurgusu
  // olmayan paragrafta konunun ayırt edici ifadesi. Metin değişmez, ifadenin o paragraftaki ilk geçişi kalın olur; eşleşme yoksa ilk yan cümle.
  const VURGU = {
    'gunde-ne-kadar-su-icmek-gerekir': [['erkeklerde 2,5, kadınlarda 2,0 litre'], ['İçilen suyu değil, toplamı'], ['erkekte 2.000, kadında 1.600 mililitre'], ['toplam su'], ['6-8 bardak'], ['35 mililitre × vücut ağırlığı (kilogram)', 'alınan her kilokalori için 1 mililitre'], ['Gereksinim sabit de değil'], ['18 yaşından sonra değer 70 yaş üstüne kadar değişmiyor'], ['bunu bir hekimle konuşmak gerekir'], ['1.594,3 mililitre'], ['kafein içeren içecekler dışında'], ['susama merkezi uyarılmıyor ve susama duygusu gelişmiyor'], ['idrar renginin koyulaşmasını']],
    'buzdolabinda-hangi-raf-neye-ait': [['soğuk havanın dolap içinde nasıl dolaştığından'], ['üst raflara göre daha uzun süre serin kalır'], ['en değişken sıcaklığa sahip bölgedir'], ['pişmiş ya da doğrudan tüketilecek besinler'], ['kapalı bir kapta'], ['Çiğ et hiçbir zaman sebzelerin ya da doğrudan yenecek besinlerin üzerindeki bir rafta durmamalıdır'], ['kendi kabına koymak'], ['sos, turşu, reçel gibi kendi içinde dayanıklı ürünler'], ['orijinal kartonuyla iç raflarda'], ['daha yüksek nem tutacak şekilde'], ['nem oranını ayarlayan küçük bir sürgü'], ['alışveriş sonrası yerleştirme süresini kısaltır'], ['besin israfını azaltır']]
  };
  const ilkCumle = s => { const i = s.search(/[;,.:]/), bas = i > 0 ? s.slice(0, i) : s, k = bas.split(' '); return k.length > 5 ? `**${k.slice(0, 3).join(' ')}** ${s.slice(k.slice(0, 3).join(' ').length + 1)}` : `**${bas}**${s.slice(bas.length)}`; };
  // Özet (web'deki başlık altı yazı) kısa yanıttır: ilk cümlesi kalın.
  const ozetVurgu = s => { const m = s.match(/^(.+?[.?!])(\s|$)/); return m ? `**${m[1]}**${s.slice(m[1].length)}` : `**${s}**`; };
  const vurgula = (slug, p, sira) => {
    const l = (VURGU[slug]?.[sira] || []).filter(f => p.includes(f));
    return l.length ? l.reduce((s, f) => s.replace(f, `**${f}**`), p) : ilkCumle(p);
  };

  // ---------- Gövde (Gastro püf detayı: giriş + numaralı bloklar) ----------
  const paragraflar = (x, l, bas) => l.map((p, i) => DD.p(vurgula(x.slug, p, bas + i))).join('');
  // DD.icerikBlok kanona eklenene dek aynı sıra DD.makale + alt başlıkla çizilir (kanon isteği).
  const bloklar = (x, m) => {
    let i = 0;
    const l = m.bolumler.map(b => { const bas = i; i += b.paragraflar.length; return {...b, bas}; });
    const giris = l.filter(b => !b.baslik), govde = l.filter(b => b.baslik);
    const girisHtml = DD.makale(`${DD.p(ozetVurgu(x.ozet))}${giris.map(b => paragraflar(x, b.paragraflar, b.bas)).join('')}`);
    if (DD.icerikBlok) return `${girisHtml}${govde.map((b, n) => DD.icerikBlok({no: n + 1, baslik: b.baslik, html: paragraflar(x, b.paragraflar, b.bas), id: `b${n + 1}`, paylasUrl: `${webUrl(x)}#b${n + 1}`})).join('')}`;
    return `${girisHtml}${DD.makale(govde.map(b => `<h2 class="dd-t-sub">${DD.esc(b.baslik)}</h2>${paragraflar(x, b.paragraflar, b.bas)}`).join(''))}`;
  };
  // "TÜBER 2022 — Türkiye Beslenme Rehberi Ek 1.4.1, s. 253 Açıklama" → **eser**, yer. Açıklama
  const kaynakMetin = k => { const m = k.match(/^(.*?Rehberi)\s+((?:Ek|Bölüm|Tablo)\s[\d.]+,\s*s\.\s*\d+)\s+(.*)$/); return m ? `**${m[1]}**, ${m[2]}. ${m[3]}` : `**${k}**`; };
  const kaynakNot = s => { const m = s.match(/Türkiye Beslenme Rehberi\S*/); return m ? s.replace(m[0], `**${m[0]}**`) : ilkCumle(s); };
  const kaynaklar = m => (m?.kaynaklar?.length ? DD.akordiyon([{baslik: 'Kaynaklar', alt: `${m.kaynaklar.length} kaynak`, ikon: 'book-open', icerik: DD.makale(`${m.kaynaklar.map(k => DD.p(kaynakMetin(k))).join('')}${m.kaynakNot ? DD.p(kaynakNot(m.kaynakNot), {ton: 'ikincil', meta: true}) : ''}`)}], {acik: -1}) : '');
  // Gastro "Okuyucunun Dikkatine" kutusu (DG.ipucu); metin web'in Genel bilgi notu.
  const genelNot = () => DD.ipucu({
    ikon: 'bilgi',
    baslik: 'Genel bilgi notu',
    metin: 'Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; **tıbbi teşhis veya tedavi yerine geçmez**, kişisel beslenme tavsiyesi niteliği taşımaz. Kişiye özel plan yalnızca **yetkili bir diyetisyen** tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce **hekim ve diyetisyen kontrolü zorunludur**.',
    eylem: {metin: 'Diyetisyen bul', ikon: 'uzman', git: '#/uzman/bul'}
  });

  // ---------- İlgili (Gastro püf ızgarası: bölüm + 2 sütun DD.icerikKart) ----------
  const ilgili = x => {
    const l = tum().filter(y => y.slug !== x.slug), sira = (a, b) => (okunma(b) ?? -1) - (okunma(a) ?? -1);
    return [...l.filter(y => y.kategori === x.kategori).sort(sira), ...l.filter(y => y.kategori !== x.kategori && y.tur === x.tur).sort(sira)].slice(0, 4);
  };
  const kart = y => { const dk = okumaDk(y); return DD.icerikKart({gorsel: y.gorsel, kategori: y.kategori, baslik: y.baslik, meta: dk ? `${dk} dk okuma` : undefined, git: `#/ipucu/${y.slug}`}); };
  const ilgiliBolum = x => {
    const l = ilgili(x);
    if (!l.length) return '';
    const tumu = l.some(y => y.kategori === x.kategori) ? `#/ipuclari?kategori=${encodeURIComponent(x.kategori)}` : `#/ipuclari?tur=${x.tur}`;
    return DD.bolum({baslik: 'Bunlar da işine yarar', eylem: 'Tümü', git: tumu, html: `<div class="dd-izgara">${l.map(kart).join('')}</div>`});
  };

  const kayitBoya = (kok, slug) => {
    const on = kayitlar().includes(slug);
    kok.querySelectorAll('[data-eylem="ipucu-kaydet"]').forEach(b => {
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'Kaydedildi' : 'Kaydet');
      b.querySelector('.icon')?.classList.replace(on ? 'fa-regular' : 'fa-solid', on ? 'fa-solid' : 'fa-regular');
    });
  };
  const yokEkrani = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu yazı burada değil', metin: 'Bağlantı eskimiş olabilir. **İpuçları**’ndan aynı konudaki yazıları bulabilirsin.', eylem: {metin: 'İpuçlarına dön', yerine: '#/ipuclari'}});

  let hataGosterildi = false;
  DD.ekran('ipucu', {
    tur: 'banner',
    nav: 'bugun',
    ust: '#/ipuclari',
    baslik: ctx => bul(ctx.param.slug)?.baslik || 'İpucu',
    iskelet: 'detay',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(r => setTimeout(r, DD.azHareket() ? 0 : DD.TK.motion.fast));
    },
    ciz: ctx => {
      const x = bul(ctx.param.slug);
      if (!x) return yokEkrani();
      const m = metinOf(x.slug), dk = okumaDk(x), n = okunma(x);
      return DD.kubbe({
        perde: 'kart',
        gorsel: x.gorsel,
        baslik: x.baslik,
        alt: [turAd(x), x.kategori, m?.yayin && DD.tarihUzun(m.yayin)].filter(Boolean).join(' · '),
        stat: [n != null && {deger: DD.sayi(n), etiket: 'okunma'}, dk && {deger: `${dk} dk`, etiket: 'okuma'}].filter(Boolean),
        html: `<section class="dd-ic dd-yigin">${m ? bloklar(x, m) : DD.makale(DD.p(ozetVurgu(x.ozet)))}${kaynaklar(m)}${genelNot()}</section>${ilgiliBolum(x)}`
      });
    },
    altBar: ctx => {
      const x = bul(ctx.param.slug);
      if (!x) return '';
      return DD.kayanBar({gorsel: x.gorsel, baslik: x.baslik, eylemler: [{ikon: 'kaydet', ad: 'Kaydet', veri: {eylem: 'ipucu-kaydet'}}, {ikon: 'paylas', ad: 'Paylaş', veri: {eylem: 'ipucu-paylas'}}]});
    },
    donus: (kok, ctx) => { const x = bul(ctx.param.slug); if (x) kayitBoya(kok, x.slug); },
    sonra: (kok, ctx) => {
      const x = bul(ctx.param.slug);
      if (!x) return undefined;
      kayitBoya(kok, x.slug);
      const temizle = [
        DD.eylem(kok, 'ipucu-kaydet', () => {
          if (!DD.uye()) { DD.uyeDuvar({baslik: 'Yazıyı kaydet', metin: 'Okuduğun ipuçlarını **kaydetmek** ve sonra dönmek için üye ol.'}); return; }
          const l = kayitlar(), on = !l.includes(x.slug);
          DD.durum.yaz('kayitli-ipuclari', on ? [...l, x.slug] : l.filter(s => s !== x.slug));
          kayitBoya(kok, x.slug);
          DD.titres(10);
          DD.toast(on ? '**Kaydedilenler**’e eklendi' : 'Kayıt kaldırıldı', {ikon: 'kaydet'});
        }),
        DD.eylem(kok, 'ipucu-paylas', () => DD.paylas({baslik: x.baslik, alt: x.ozet, url: webUrl(x)}))
      ];
      return () => { temizle.forEach(f => f()); };
    }
  });
})();
