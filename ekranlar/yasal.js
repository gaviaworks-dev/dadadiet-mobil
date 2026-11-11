/* Yasal metinler: #/yasal (dizin) ve #/yasal/:slug (metin). Gastro kalıbı ortak/sayfalar/yasal.js Y1–Y2 (uygulama/yasal.html, yasal-metin.html).
 * Veri DDV.yasal (veri/yasal.js, web yasal/* sayfalarından; metin değiştirilmez). Slug'lar sabit: kvkk, gizlilik, cerez, kullanim-kosullari, saglik-verisi, tibbi-sorumluluk-reddi, diyetisyen-dogrulama.
 * Dizin: başlık + arama (metin adı ve bölüm başlıkları), dört grup, sonuç yok hali (?q= ile de açılır). Rotalı kalemler (Künye, Bilimsel Kaynaklar) kurumsal ekranına gider.
 * Metin: başlık, sürüm ve son güncelleme, İçindekiler akordiyonu (?icindekiler=acik), bölümler akordiyonda (tek bölüm açık, ?bolum=N açar), önceki/sonraki metin.
 *   Satır içi bağlantılar uygulama adresine gider (data-git). Metin çizici DD.yasalMetin (kurumsal.js de kullanır): doldurulmamış [yer tutucu] ekranda hiç görünmez
 *   (11 Kasım: "bilgi bekleniyor" rozeti kaldırıldı): yer tutucu içeren cümle ya da ";" ile ayrılan yan cümle düşer, geriye bir şey kalmayan madde/paragraf çizilmez
 *   (Gastro K21); boşalan liste ve içeriği kalmayan bölüm de çizilmez.
 *   Bilinmeyen slug: DD.hataEkran bulunamadi. Bloğu olmayan metin ya da ?hal=bos: "henüz yayımlanmadı". ?hal=yukleniyor: satır iskeleti (router). */
(() => {
  const Y = () => DDV.yasal;
  const esc = s => DD.esc(s);

  // ---------- Ortak metin çizici (DD.yasalMetin): yasal ve kurumsal ekranlar birlikte kullanır (kurumsal.js çizimde çağırır) ----------
  // Zengin metin: yalnız strong/em/code ve uygulama içi bağlantı; geri kalan düz metin. Köşeli yer tutucu ("[e-posta]") ekranda yazılmaz (Gastro K21):
  // yer tutucu içeren cümle (ya da ";" sonrası yan cümle) düşer; geriye bir şey kalmayan madde ve paragraf çizilmez ("Etiket: [x]" / "X — [y]" dahil);
  // boşalan liste ve içeriği kalmayan bölüm çizilmez. Akordiyon özeti aynı süzgeçten geçer.
  const YT = /\[[^\]]+\]/, YT_G = /\[[^\]]+\]/g;
  const metinYaz = t => esc(t.replace(YT_G, ''));
  // Yer tutucu süzgeci (ham HTML üstünde): cümlelere, cümleyi ";" yan cümlelerine böler; yer tutucusuz kalanları birleştirir.
  const temizle = html => {
    if (!YT.test(html || '')) return html || '';
    return html.split(/(?<=[.!?])\s+(?=[<A-ZÇĞİÖŞÜ"])/).map(c => {
      if (!YT.test(c)) return c;
      const l = c.split(/;\s+/).filter(x => !YT.test(x));
      return l.length ? l.join('; ').replace(/[\s,;:]*$/, '').replace(/([^.!?])$/, '$1.') : '';
    }).filter(Boolean).join(' ');
  };
  const zengin = html => {
    const t = document.createElement('template'); t.innerHTML = html || '';
    const yaz = n => [...n.childNodes].map(c => {
      if (c.nodeType === 3) return metinYaz(c.textContent);
      if (c.nodeType !== 1) return '';
      const ad = c.tagName.toLowerCase(), ic = yaz(c);
      if (['strong', 'em', 'code'].includes(ad)) return `<${ad}>${ic}</${ad}>`;
      if (ad === 'a') { const h = c.getAttribute('href') || ''; return h.startsWith('#/') ? `<a href="${esc(h)}" data-git="${esc(h)}">${ic}</a>` : ic; }
      return ic;
    }).join('');
    return yaz(t.content);
  };
  const duz = html => { const t = document.createElement('template'); t.innerHTML = html || ''; return t.content.textContent.replace(/\s+/g, ' ').trim(); };
  // Süzgeçten sonra görünür metin kalmayan madde/paragraf (yalnız yer tutucu ya da "Etiket: [x]" biçimi).
  const yerTutucu = x => {
    const t = duz(x); if (!YT.test(t)) return false;
    return duz(temizle(x)).replace(/^[^:[\]—–]{1,60}(?::|\s[—–-])\s*/, '').replace(/[\s.,;:·()/—–-]/g, '') === '';
  };
  const blokHtml = ([t, x]) => {
    if (t === 'h2' || t === 'h3') return `<${t}>${zengin(x)}</${t}>`;
    if (t === 'ul' || t === 'ol') { const l = x.filter(li => !yerTutucu(li)); return l.length ? `<${t}>${l.map(li => `<li>${zengin(temizle(li))}</li>`).join('')}</${t}>` : ''; }
    return yerTutucu(x) ? '' : `<p>${zengin(temizle(x))}</p>`;
  };
  const bolumle = bloklar => {
    const giris = [], bolumler = [];
    bloklar.forEach(b => { if (b[0] === 'h2') bolumler.push({baslik: duz(b[1]), bloklar: []}); else (bolumler.length ? bolumler[bolumler.length - 1].bloklar : giris).push(b); });
    // Süzgeçten sonra içeriği kalmayan bölüm (ör. yalnız yer tutucudan oluşan liste) çizilmez. Numara veriden değil görünen sıradan:
    // "4. Başlık" → n. sıra, alt başlık "4.5 …" → "n.5 …" (gizlenen bölüm numarada atlama bırakmaz).
    const NO = /^\d+\.\s*/, ALT = /^\d+\.(\d+)\s/;
    return {giris, bolumler: bolumler.filter(b => b.bloklar.some(x => blokHtml(x))).map((b, i) => NO.test(b.baslik)
      ? {baslik: b.baslik.replace(NO, `${i + 1}. `), bloklar: b.bloklar.map(([t, x]) => (t === 'h3' && typeof x === 'string' ? [t, x.replace(ALT, `${i + 1}.$1 `)] : [t, x]))}
      : b)};
  };
  // Özet: bölümün yer tutucusuz ilk paragrafı ya da maddesi; yoksa süzgeçten geçmiş ilk metin.
  const ozet = (b, yedek = '') => {
    const l = b.bloklar.flatMap(([t, x]) => (t === 'p' ? [x] : t === 'ul' || t === 'ol' ? x : [])).filter(x => !yerTutucu(x));
    const s = l.find(x => !YT.test(duz(x))) ?? l[0];
    return s ? duz(temizle(s)) : yedek;
  };
  DD.yasalMetin = {zengin, duz, yerTutucu, temizle, blokHtml, bolumle, ozet};
  const metaMetin = m => {
    const s = `Sürüm ${m.surum}`;
    return m.guncelleme ? `${s} · Son güncelleme ${DD.tarihUzun(m.guncelleme)}` : `${s} · ${DD.tarihUzun(m.tarih)}`;
  };

  // ---------- Dizin ----------
  const sira = () => Y().dizin.gruplar.flatMap(g => g.kalemler.filter(k => k.slug && Y().metinler[k.slug]).map(k => k.slug));
  // Rotalı kalem (Künye, Bilimsel Kaynaklar): belge DDV.kurumsal[<rota>]'da, kurumsal ekranında açılır.
  const kurumsalBelge = k => (k.git ? DDV.kurumsal?.[k.git.replace(/^#\//, '')] : null);
  const kalemSatir = (k, alt) => {
    if (!k.slug) { const b = kurumsalBelge(k); return {ikon: k.ikon, baslik: k.ad, alt: alt ?? (b?.surum ? `Sürüm ${b.surum} · ${DD.tarihUzun(b.tarih)}` : ''), git: k.git}; }
    const m = Y().metinler[k.slug];
    return {ikon: m.ikon, baslik: m.baslik, alt: alt ?? `Sürüm ${m.surum} · ${DD.tarihUzun(m.guncelleme || m.tarih)}`, git: `#/yasal/${k.slug}`};
  };
  // Aranan: metin adı, sonra bölüm başlıkları (h2, h3). Bölüm eşleşirse satır o bölümü açar.
  const aranacaklar = () => Y().dizin.gruplar.flatMap(g => g.kalemler.map(k => {
    const m = k.slug ? Y().metinler[k.slug] : kurumsalBelge(k)?.bloklar ? kurumsalBelge(k) : null;
    const bolumler = m ? bolumle(m.bloklar).bolumler : [];
    return {k, grup: g.baslik, ad: k.slug ? m.baslik : k.ad, basliklar: bolumler.map((b, i) => [i, [b.baslik, ...b.bloklar.filter(([t]) => t === 'h3').map(([, x]) => duz(x))]])};
  }));
  const ara = q => {
    const a = DD.katla(q);
    return aranacaklar().map(x => {
      if (DD.katla(x.ad).includes(a)) return {...kalemSatir(x.k, x.grup), baslikHtml: DD.vurguluEsles(x.ad, q)};
      const b = x.basliklar.find(([, l]) => l.some(s => DD.katla(s).includes(a)));
      if (!b) return null;
      const s = kalemSatir(x.k), hedef = `${s.git}?bolum=${b[0] + 1}`;
      return {...s, alt: `Bölüm: ${b[1].find(t => DD.katla(t).includes(a))}`, git: hedef};
    }).filter(Boolean);
  };
  const listeHtml = q => {
    if (!q) return Y().dizin.gruplar.map(g => DD.bolum({ic: false, baslik: g.baslik, html: DD.satirlar(g.kalemler.map(k => kalemSatir(k)))})).join('');
    const l = ara(q);
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Eşleşen metin yok', metin: `**${q}** için bir metin bulamadık. Başka bir kelimeyle dene ya da aramayı temizle.`, eylem: {metin: 'Aramayı temizle', tur: 'secondary', veri: {eylem: 'ara-temizle'}}});
    return DD.bolum({ic: false, baslik: `${l.length} metin bulundu`, html: DD.satirlar(l)});
  };
  const dizinCiz = ctx => {
    const D = Y().dizin, q = (ctx.sorgu.q || '').trim();
    return DD.gruplar([
      {html: DD.arama({ad: 'yasal-ara', yer: 'Metin ara', deger: q, sonuc: false})},
      `<div class="dd-yigin-24" data-yuva="liste" aria-live="polite">${listeHtml(q)}</div>`,
      {html: DD.p(D.ayak, {meta: true, ton: 'ikincil'})}
    ], {bas: DD.metinBlok({etiket: 'Dada Diet', baslik: D.baslik, metin: D.giris, h: 1})});
  };

  // ---------- Metin ----------
  const bulunamadi = () => DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu metni bulamadık', metin: 'Adres değişmiş ya da bağlantı eskimiş olabilir. **Bütün metinler** Yasal Metinler sayfasında.', eylem: {metin: 'Yasal Metinler', ikon: 'scale-balanced', yerine: '#/yasal'}});
  const BOS = {ikon: 'file-lines', baslik: 'Metin henüz yayımlanmadı', metin: 'Metin yayımlandığında burada okunabilecek. **Yayımlanan bütün metinler** Yasal Metinler sayfasında.', eylem: {metin: 'Yasal Metinler', ikon: 'scale-balanced', yerine: '#/yasal'}};
  const metinCiz = (ctx, slug) => {
    const m = Y().metinler[slug];
    if (!m) return bulunamadi();
    if (!m.bloklar.some(([t]) => t !== 'h2' && t !== 'h3')) return DD.bos({tam: true, ...BOS, baslik: `${m.baslik} henüz yayımlanmadı`});
    const {giris, bolumler} = bolumle(m.bloklar);
    const n = Math.min(bolumler.length, Math.max(1, +ctx.sorgu.bolum || 1)) - 1;
    const toc = DD.akordiyon([{ikon: 'list-ol', baslik: 'İçindekiler', alt: `${bolumler.length} başlık`, icerik: DD.satirlar(bolumler.map((b, i) => ({baslik: b.baslik, veri: {eylem: 'bolum', id: i}, ok: false})))}], {ad: 'toc', acik: ctx.sorgu.icindekiler === 'acik' ? 0 : -1});
    const govde = DD.akordiyon(bolumler.map(b => ({ikon: m.ikon, baslik: b.baslik, alt: ozet(b), icerik: DD.makale(b.bloklar.map(blokHtml).join(''))})), {ad: 'ys', acik: n});
    const s = sira(), i = s.indexOf(slug);
    const komsu = [[s[i - 1], 'Önceki metin', 'arrow-left'], [s[i + 1], 'Sonraki metin', 'arrow-right']].filter(([x]) => x).map(([x, alt, ikon]) => ({ikon, baslik: Y().metinler[x].baslik, alt, git: `#/yasal/${x}`}));
    return DD.gruplar([
      bolumler.length >= 3 && {html: toc},
      giris.length && {html: DD.makale(giris.map(blokHtml).join(''))},
      {html: govde},
      {html: `<div class="dd-yigin-12">${DD.p([m.yururluk && `Yürürlük tarihi: ${DD.tarihUzun(m.yururluk)}.`, m.ayak].filter(Boolean).join(' '), {meta: true, ton: 'ikincil'})}${komsu.length ? DD.satirlar(komsu) : ''}${DD.btn({metin: 'Tüm yasal metinler', tur: 'secondary', ikon: 'list', tam: true, git: '#/yasal'})}</div>`}
    ], {bas: `<div class="dd-yigin-12">${DD.metinBlok({etiket: 'Yasal Metinler', baslik: m.baslik, metin: metaMetin(m), h: 1})}${m.uyari ? DD.bant({ton: 'uyari', baslik: m.uyari.baslik, metin: m.uyari.metin}) : ''}</div>`});
  };

  // Öğeyi kaydırma kabının başına getirir; üst bar içeriğin üstünde durduğu için kabın üst boşluğu (üst bar boyu) düşülür.
  const basaKaydir = (kok, el, yumusak = true) => {
    const k = kok.querySelector('.dd-kaydir'); if (!k || !el) return;
    const y = el.getBoundingClientRect().top - k.getBoundingClientRect().top + k.scrollTop - (parseFloat(getComputedStyle(k).paddingTop) || 0);
    k.scrollTo({top: Math.max(0, y), behavior: yumusak && !DD.azHareket() ? 'smooth' : 'auto'});
  };
  // İçindekiler → bölüm: kapalıysa ortak akordiyon düğmesiyle açılır, açılış hareketi bitince başına kaydırılır.
  const bolumeGit = (kok, i, kaydir = true) => {
    const btn = kok.querySelector(`#ys-b${i}`); if (!btn) return;
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
    setTimeout(() => { basaKaydir(kok, btn.closest('.dd-ak-bolum'), kaydir); if (kaydir) btn.focus({preventScroll: true}); }, DD.azHareket() ? 0 : DD.TK.motion.sheet);
  };

  DD.ekran('yasal', {
    tur: 'alt',
    baslik: ctx => (ctx.param?.slug ? Y().metinler[ctx.param.slug]?.baslik || 'Yasal metin' : 'Yasal Metinler'),
    iskelet: 'satir',
    bos: BOS,
    ciz: ctx => (ctx.param?.slug ? metinCiz(ctx, ctx.param.slug) : dizinCiz(ctx)),
    sonra: (kok, ctx) => {
      if (ctx.param?.slug) {
        if (ctx.sorgu.bolum && +ctx.sorgu.bolum > 1) requestAnimationFrame(() => bolumeGit(kok, +ctx.sorgu.bolum - 1, false));
        return DD.eylem(kok, 'bolum', el => bolumeGit(kok, +el.dataset.id));
      }
      const girdi = kok.querySelector('[name="yasal-ara"]'), yuva = kok.querySelector('[data-yuva="liste"]');
      if (!girdi) return undefined;
      const suz = () => { yuva.innerHTML = listeHtml(girdi.value.trim()); };
      girdi.addEventListener('input', suz);
      const c = DD.eylem(kok, 'ara-temizle', () => { girdi.value = ''; girdi.closest('.dd-girdi')?.classList.remove('has-text'); suz(); girdi.focus(); });
      return () => { girdi.removeEventListener('input', suz); c(); };
    }
  });
})();
