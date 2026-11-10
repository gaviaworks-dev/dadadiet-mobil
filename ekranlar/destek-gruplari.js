/* Destek grupları: #/destek-gruplari (liste) ve #/destek-grubu/:id (grup akışı). Web karşılığı: hesabim/destek-gruplari (uye-destek-gruplari.js).
 * Gruplar, kurallar ve gönderiler DDV.uye. Durum: grup-uyelik {id:{gorunen, tarih}} (varsayılan DDV.uye.katildigim, yeni hesapta {}),
 *   grup-gonderi {id:[{id, metin, zaman}]} (üyenin gönderileri), grup-begeni [gonderiId], grup-yorum {gonderiId:[{metin, zaman}]},
 *   grup-sikayet {gonderiId:{neden, not, tarih}}, grup-bildirim (boolean, varsayılan true), grup-riza (sağlık grubu açık rızası, boolean).
 * Beğeni ve yorum sayıları veriden gelir, üyenin kendi beğenisi ve yorumu üstüne eklenir. #/destek-gruplari?hal=bos, ?hal=hata. */
(() => {
  const U = () => DDV.uye;
  const bul = id => U().gruplar.find(g => g.id === id);
  const varsayilanUyelik = () => (DD.yeniHesap() ? {} : U().katildigim);
  const uyelik = ctx => (ctx?.sorgu.hal === 'bos' ? {} : DD.durum.oku('grup-uyelik', varsayilanUyelik()));
  const benimGonderi = id => DD.durum.oku('grup-gonderi', {})[id] || [];
  const begeniler = () => DD.durum.oku('grup-begeni', []);
  const yorumlarim = id => DD.durum.oku('grup-yorum', {})[id] || [];
  const sikayetler = () => DD.durum.oku('grup-sikayet', {});
  const simdi = () => `Bugün ${DD.ogun.noktali(DDV.bugun.simdi)}`;
  const uyeSayisi = (g, ctx) => g.uyeSayisi + (uyelik(ctx)[g.id] && !varsayilanUyelik()[g.id] ? 1 : 0) - (!uyelik(ctx)[g.id] && varsayilanUyelik()[g.id] ? 1 : 0);
  const gorunenAd = () => `${DDV.kullanici.ad} ${DDV.kullanici.soyad.charAt(0)}.`;

  // Akış: sabit moderatör gönderisi, üyenin gönderileri (yeni üstte), diğer üyeler.
  const gonderiler = (g, ctx) => {
    const l = U().gonderiler[g.id] || [], gorunen = uyelik(ctx)[g.id]?.gorunen || gorunenAd();
    const ben = benimGonderi(g.id).slice().reverse().map(x => ({...x, yazar: gorunen, ben: true, begeni: 0, yorumlar: []}));
    return [...l.filter(x => x.moderator), ...ben, ...l.filter(x => !x.moderator)];
  };
  const gonderiBul = (g, id, ctx) => gonderiler(g, ctx).find(x => x.id === id);

  // ---------- Liste ----------
  const sonZaman = g => (benimGonderi(g.id).length ? simdi() : (U().gonderiler[g.id] || []).filter(x => !x.moderator)[0]?.zaman);
  const grupSatir = (g, ctx, uye) => {
    const satir = {gorsel: g.gorsel, baslik: g.ad, alt: [`${DD.sayi(uyeSayisi(g, ctx))} üye`, g.saglik && 'Sağlık grubu', uye && sonZaman(g) && `son gönderi ${sonZaman(g).toLocaleLowerCase('tr')}`].filter(Boolean).join(' · '), git: `#/destek-grubu/${g.id}`};
    return uye ? satir : DD.satirKap({...satir, ok: false}, DD.btn({metin: 'Katıl', tur: 'tonal', boyut: 'sm', veri: {eylem: 'katil', id: g.id}}));
  };
  const listeCiz = ctx => {
    const u = uyelik(ctx), benim = U().gruplar.filter(g => u[g.id]), diger = U().gruplar.filter(g => !u[g.id]);
    return DD.bolumler([
      `<div class="dd-yigin">${DD.p('Benzer yoldan geçenlerle **deneyim paylaş**; gerçek adınla ya da takma adla katılabilirsin.', {ton: 'ikincil'})}${DD.bant({ton: 'uyari', metin: 'Destek grupları **tıbbi tavsiye yeri değildir**. Tanı ve tedavi kararlarını hekiminle ver.'})}</div>`,
      {baslik: 'Katıldığın gruplar', html: benim.length ? DD.yuzey(DD.satirlar(benim.map(g => grupSatir(g, ctx, true)))) : DD.bos({ikon: 'people-group', baslik: 'Henüz bir gruba katılmadın', metin: 'Aşağıdaki gruplardan **hedefine yakın** olanı seçebilirsin.'})},
      diger.length && {baslik: benim.length ? 'Önerilen gruplar' : 'Gruplar', html: DD.yuzey(DD.satirlar(diger.map(g => grupSatir(g, ctx, false))))},
      {baslik: 'Grup bildirimleri', html: DD.yuzey(DD.toggle({ad: 'grup-bildirim', ikon: 'bildirim', etiket: 'Gönderime yorum gelince bildir', alt: 'Uygulama içi bildirim; e-posta gönderilmez', secili: DD.durum.oku('grup-bildirim', true)}))},
      {baslik: 'Grup kuralları', html: kurallar()}
    ]);
  };
  const kurallar = () => `<div class="dd-yigin-12">${U().grupKurallari.map(k => DD.madde({metin: k.replace(/^([^;,.]+)/, '**$1**'), tur: 'notr'})).join('')}</div>`;

  // ---------- Grup akışı ----------
  const gonderiHtml = (g, x) => {
    const begendim = begeniler().includes(x.id), yorum = (x.yorumlar?.length || 0) + yorumlarim(x.id).length, sk = sikayetler()[x.id];
    const cipler = [
      DD.cip({metin: String((x.begeni || 0) + (begendim ? 1 : 0)), ikon: 'heart', kucuk: true, etiket: begendim ? 'Beğenini geri al' : 'Beğen', veri: {eylem: 'begen', id: x.id}, attrs: `aria-pressed="${begendim}"`}),
      DD.cip({metin: `Yorumlar ${yorum}`, ikon: 'comment', kucuk: true, veri: {eylem: 'yorumlar', id: x.id}}),
      x.ben ? DD.cip({metin: 'Sil', ikon: 'sil', kucuk: true, veri: {eylem: 'gonderi-sil', id: x.id}})
        : x.moderator ? '' : sk ? DD.durumRozet({metin: 'Şikâyetin incelemede', ton: 'uyari', ikon: 'flag'}) : DD.cip({metin: 'Şikâyet et', ikon: 'flag', kucuk: true, veri: {eylem: 'sikayet', id: x.id}})
    ].join('');
    const meta = [x.ben ? `${x.zaman} · sen` : x.zaman, x.moderator && 'sabit gönderi'].filter(Boolean).join(' · ');
    return `<article class="dd-yigin-8">${DD.yorum({ad: x.yazar, metin: x.metin, meta})}<div class="dd-sira">${cipler}</div></article>`;
  };
  const detayCiz = (g, ctx) => {
    const u = uyelik(ctx)[g.id], l = gonderiler(g, ctx);
    const kim = u ? `<div class="dd-ara"><span class="dd-t-meta dd-ton-ikincil">Grupta <b>${DD.esc(u.gorunen)}</b> olarak görünüyorsun</span>${DD.btn({metin: 'Ayrıl', tur: 'text', boyut: 'sm', veri: {eylem: 'ayril', id: g.id}})}</div>` : DD.btn({metin: 'Gruba katıl', ikon: 'ekle', tam: true, veri: {eylem: 'katil', id: g.id}});
    return DD.bolumler([
      `<div class="dd-yigin">${DD.banner({gorsel: g.gorsel, etiket: g.saglik ? 'Sağlık grubu' : 'Destek grubu', baslik: g.ad, stat: [{deger: DD.sayi(uyeSayisi(g, ctx)), etiket: 'üye'}, {deger: String(l.length), etiket: 'gönderi'}]})}${DD.p(g.aciklama)}${kim}</div>`,
      {baslik: 'Gönderiler', html: DD.yuzey(DD.satirlar(l.map(x => gonderiHtml(g, x))))},
      {baslik: 'Kurallar', html: kurallar()},
      DD.bant({ton: 'uyari', metin: 'Gruplarda **sağlık verin paylaşılmaz**; yalnız yazdıkların görünür. Tanı ve ilaç kararlarını hekiminle ver.'})
    ]);
  };

  // ---------- Sheet'ler ----------
  const katilSheet = (g, ctx, bitti) => {
    DD.sheet({
      baslik: g.ad, tam: g.saglik,
      html: `<div class="dd-yigin">${DD.p(g.aciklama, {ton: 'ikincil'})}${g.saglik ? DD.bant({ton: 'uyari', metin: 'Bu grup sağlık durumunu belli edebilir; üyeliğin **sağlık verisi** sayılır. Takma adla katılmayı seçebilirsin.'}) : ''}
        <div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Grupta nasıl görüneceksin</span>${DD.radio({ad: 'kip', deger: 'gercek', etiket: 'Gerçek adımla', alt: `${gorunenAd()} olarak görünürsün`, secili: true})}${DD.radio({ad: 'kip', deger: 'takma', etiket: 'Takma adla', alt: 'Yalnız seçtiğin takma ad görünür'})}</div>
        <div data-takma hidden>${DD.input({ad: 'takma-ad', etiket: 'Takma ad', yer: 'En az 3 harf'})}</div>
        <div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Grup kuralları</span>${kurallar()}</div>
        ${DD.checkbox({ad: 'kural-onay', etiket: 'Grup kurallarını okudum ve uyacağım'})}${g.saglik ? DD.checkbox({ad: 'riza-onay', etiket: 'Sağlık grubu üyeliğimin işlenmesine açık rıza veriyorum', alt: 'Rızanı Veri izinlerim ekranından geri alabilirsin', secili: DD.durum.oku('grup-riza', false)}) : ''}</div>`,
      altBar: DD.btn({metin: 'Gruba katıl', ikon: 'ekle', tam: true, veri: {eylem: 'katil-onay'}}),
      sonra: s => {
        const takma = s.querySelector('[data-takma]');
        const c = [
          DD.on(s, 'kip', v => { takma.hidden = v !== 'takma'; if (v === 'takma') takma.querySelector('input').focus(); }),
          DD.eylem(s, 'katil-onay', () => {
            const kip = s.querySelector('[name="kip"]:checked').value, ad = s.querySelector('[name="takma-ad"]').value.trim();
            if (kip === 'takma' && ad.length < 3) { DD.toast('Takma ad **en az 3 harf** olmalı', {tur: 'hata', yerine: true}); return; }
            if (!s.querySelector('[name="kural-onay"]').checked) { DD.toast('Katılmak için **grup kurallarını** onayla', {tur: 'hata', yerine: true}); return; }
            if (g.saglik && !s.querySelector('[name="riza-onay"]').checked) { DD.toast('Sağlık grubuna katılmak için **açık rıza** gerekir', {tur: 'hata', yerine: true}); return; }
            if (g.saglik) DD.durum.yaz('grup-riza', true);
            DD.durum.yaz('grup-uyelik', {...uyelik(ctx), [g.id]: {gorunen: kip === 'takma' ? ad : gorunenAd(), tarih: DD.bugunIso()}});
            s.kapat();
            bitti?.();
            DD.toast(`**${g.ad}** grubuna katıldın`, {tur: 'basari', ikon: 'people-group'});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };
  const yorumSheet = (g, x, ctx, bitti) => {
    const liste = () => { const l = [...(x.yorumlar || []), ...yorumlarim(x.id).map(y => ({...y, yazar: uyelik(ctx)[g.id]?.gorunen || gorunenAd()}))]; return l.length ? DD.satirlar(l.map(y => DD.yorum({ad: y.yazar, metin: y.metin, meta: y.zaman}))) : DD.p('Henüz yorum yok. **İlk yorumu** sen yaz.', {ton: 'ikincil'}); };
    const uye = !!uyelik(ctx)[g.id];
    DD.sheet({
      baslik: 'Yorumlar',
      html: `<div class="dd-yigin">${DD.yorum({ad: x.yazar, metin: x.metin, meta: x.zaman})}<div data-yuva="yorumlar">${liste()}</div>${uye ? DD.input({ad: 'yorum', etiket: 'Yorumun', yer: 'Yorum yaz', cokSatir: true}) : DD.bant({ton: 'bilgi', metin: 'Yorum yazmak için **gruba katıl**.'})}</div>`,
      altBar: uye ? DD.btn({metin: 'Yorumu gönder', ikon: 'gonder', tam: true, veri: {eylem: 'yorum-gonder'}}) : '',
      sonra: s => DD.eylem(s, 'yorum-gonder', () => {
        const i = s.querySelector('[name="yorum"]'), metin = i.value.trim();
        if (!metin) { DD.toast('Yorumun **boş** kalamaz', {tur: 'hata', yerine: true}); return; }
        const t = DD.durum.oku('grup-yorum', {});
        DD.durum.yaz('grup-yorum', {...t, [x.id]: [...(t[x.id] || []), {metin, zaman: simdi()}]});
        i.value = '';
        s.querySelector('[data-yuva="yorumlar"]').innerHTML = liste();
        bitti?.();
        DD.toast('Yorumun **paylaşıldı**', {ikon: 'comment'});
      })
    });
  };
  const sikayetSheet = (x, bitti) => DD.sheet({
    baslik: 'Gönderiyi şikâyet et',
    html: `<div class="dd-yigin">${DD.p(`**“${x.metin.length > 90 ? `${x.metin.slice(0, 89)}…` : x.metin}”**`, {ton: 'ikincil'})}<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Şikâyet nedeni</span>${U().sikayetNedenleri.map(n => DD.radio({ad: 'neden', deger: n, etiket: n})).join('')}</div>${DD.input({ad: 'sikayet-not', etiket: 'Açıklama (isteğe bağlı)', cokSatir: true})}${DD.p('Şikâyetin moderasyon ekibine **kimliğin gizli tutularak** iletilir.', {ton: 'ikincil', meta: true})}</div>`,
    altBar: DD.btn({metin: 'Şikâyet et', ikon: 'flag', tam: true, tur: 'yikici', veri: {eylem: 'sikayet-gonder'}}),
    sonra: s => DD.eylem(s, 'sikayet-gonder', () => {
      const n = s.querySelector('[name="neden"]:checked')?.value;
      if (!n) { DD.toast('Bir **şikâyet nedeni** seç', {tur: 'hata', yerine: true}); return; }
      DD.durum.yaz('grup-sikayet', {...sikayetler(), [x.id]: {neden: n, not: s.querySelector('[name="sikayet-not"]').value.trim(), tarih: DD.bugunIso()}});
      s.kapat();
      bitti();
      DD.toast('Şikâyetin **moderasyona iletildi**', {ikon: 'flag'});
    })
  });

  let hataGosterildi = false;
  DD.ekran('destek-gruplari', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: ctx => (ctx.param?.id ? bul(ctx.param.id)?.ad || 'Destek grubu' : 'Destek grupları'),
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (!ctx.param?.id) return listeCiz(ctx);
      const g = bul(ctx.param.id);
      return g ? detayCiz(g, ctx) : DD.hataEkran({tur: 'bulunamadi', baslik: 'Bu grup burada değil', metin: 'Grup kapatılmış ya da bağlantı eskimiş olabilir. **Gruplara dönüp** başka birini seçebilirsin.', eylem: {metin: 'Gruplara dön', yerine: '#/destek-gruplari'}});
    },
    altBar: ctx => { const g = ctx.param?.id && bul(ctx.param.id); return g && uyelik(ctx)[g.id] ? DD.mesajGiris({ad: 'gonderi', yer: 'Gruba yaz'}) : ''; },
    sonra: (kok, ctx) => {
      const g = ctx.param?.id && bul(ctx.param.id);
      const yenile = () => DD.tazele();
      const c = [
        DD.eylem(kok, 'katil', el => katilSheet(bul(el.dataset.id), ctx, yenile)),
        DD.on(kok, 'grup-bildirim', v => { DD.durum.yaz('grup-bildirim', v); DD.toast(v ? 'Grup bildirimleri **açıldı**' : 'Grup bildirimleri **kapatıldı**', {ikon: v ? 'bell' : 'bell-slash'}); })
      ];
      if (g) {
        c.push(
          DD.eylem(kok, 'ayril', async () => {
            if (!await DD.dialog({baslik: 'Gruptan ayrıl', metin: `**${g.ad}** grubundan ayrılırsan yeni gönderi yazamazsın; **gönderilerin silinmez**.`, eylem: 'Ayrıl', iptal: 'Vazgeç', yikici: true})) return;
            const once = uyelik(ctx), {[g.id]: _, ...kalan} = once;
            DD.durum.yaz('grup-uyelik', kalan);
            yenile();
            DD.toast('Gruptan ayrıldın', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('grup-uyelik', once); yenile(); }});
          }),
          DD.eylem(kok, 'begen', el => {
            if (!uyelik(ctx)[g.id]) { katilSheet(g, ctx, yenile); return; }
            const l = begeniler(), id = el.dataset.id;
            DD.durum.yaz('grup-begeni', l.includes(id) ? l.filter(x => x !== id) : [...l, id]);
            DD.titres(8);
            yenile();
          }),
          DD.eylem(kok, 'yorumlar', el => yorumSheet(g, gonderiBul(g, el.dataset.id, ctx), ctx, yenile)),
          DD.eylem(kok, 'sikayet', el => sikayetSheet(gonderiBul(g, el.dataset.id, ctx), yenile)),
          DD.eylem(kok, 'gonderi-sil', async el => {
            if (!await DD.dialog({baslik: 'Gönderiyi sil', metin: 'Gönderin **gruptan kaldırılır**.', eylem: 'Sil', iptal: 'Vazgeç', yikici: true})) return;
            const t = DD.durum.oku('grup-gonderi', {}), once = t[g.id] || [];
            DD.durum.yaz('grup-gonderi', {...t, [g.id]: once.filter(x => x.id !== el.dataset.id)});
            yenile();
            DD.toast('Gönderin silindi', {eylem: 'Geri al', onEylem: () => { DD.durum.yaz('grup-gonderi', {...DD.durum.oku('grup-gonderi', {}), [g.id]: once}); yenile(); }});
          }),
          DD.eylem(kok, 'ek', () => DD.toast('Gruplarda **fotoğraf ve dosya** paylaşılmaz; kişisel bilgilerin korunur', {ikon: 'gizlilik', yerine: true})),
          DD.eylem(kok, 'ses-mesaj', () => DD.toast('Gruplarda **yalnız yazılı** gönderi paylaşılır', {ikon: 'mikrofon', yerine: true}))
        );
        const form = kok.querySelector('[data-mesaj]');
        if (form) {
          const gonder = ev => {
            ev.preventDefault();
            const i = form.querySelector('input'), metin = i.value.trim();
            if (!metin) return;
            const t = DD.durum.oku('grup-gonderi', {});
            DD.durum.yaz('grup-gonderi', {...t, [g.id]: [...(t[g.id] || []), {id: `ben-${Date.now()}`, metin, zaman: simdi()}]});
            i.value = '';
            yenile();
            DD.toast('Gönderin **grupta paylaşıldı**', {tur: 'basari', ikon: 'gonder'});
          };
          form.addEventListener('submit', gonder);
          c.push(() => form.removeEventListener('submit', gonder));
        }
      }
      return () => c.forEach(f => f());
    }
  });
})();
