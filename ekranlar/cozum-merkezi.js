/* Çözüm Merkezi: #/cozum-merkezi (talepler, sık sorulanlar, yeni talep) ve #/talep/:id (talep yazışması).
 * Web karşılığı: hesabim/cozum-merkezi + talep (uye-gastro-cozum.js, uye-gastro-talep.js, uye-gastro-destek.js). SSS, konu listesi ve talepler DDV.uye.
 * Durum: destek-talepleri (talep dizisinin tamamı; varsayılan DDV.uye.talepler, yeni hesapta []). Yanıt yazınca talep 'acik' olur; "Sorunum çözüldü" 'cozulen',
 *   kapalı talep yeniden açılabilir. #/cozum-merkezi?yeni=1 yeni talep sheet'ini açar (?konu=İptal ve iade konuyu seçer), ?hal=bos, ?hal=hata. */
(() => {
  const U = () => DDV.uye;
  const talepler = ctx => (ctx?.sorgu.hal === 'bos' ? [] : DD.durum.oku('destek-talepleri', DD.yeniHesap() ? [] : U().talepler));
  const yaz = l => DD.durum.yaz('destek-talepleri', l);
  const son = t => t.mesajlar[t.mesajlar.length - 1];
  const sirali = l => l.slice().sort((a, b) => `${son(b).tarih}${son(b).saat}`.localeCompare(`${son(a).tarih}${son(a).saat}`));
  const DURUM = {
    acik: {metin: 'Açık', ton: 'notr', ikon: 'inbox', filtre: 'Açık'},
    yanit: {metin: 'Yanıtın bekleniyor', ton: 'uyari', ikon: 'reply', filtre: 'Yanıt bekliyor'},
    cozulen: {metin: 'Çözüldü', ton: 'basari', ikon: 'circle-check', filtre: 'Çözülen'},
    kapali: {metin: 'Kapandı', ton: 'notr', ikon: 'lock', filtre: 'Kapatılan'}
  };
  const rozet = d => DD.durumRozet(DURUM[d]);
  const simdiSaat = () => DD.ogun.noktali(DDV.bugun.simdi);
  const tarihMetin = iso => (iso === DD.bugunIso() ? 'Bugün' : DD.tarihKisa(iso));

  // ---------- Talepler ----------
  const talepSatir = t => ({ikon: DURUM[t.durum].ikon, baslik: t.baslik, alt: `${DURUM[t.durum].metin} · ${t.konu} · ${tarihMetin(son(t).tarih)}`, git: `#/talep/${t.id}`});
  const talepPanel = (ctx, suz) => {
    const tum = sirali(talepler(ctx)), l = tum.filter(t => !suz || t.durum === suz);
    if (!tum.length) return DD.bos({ikon: 'inbox', baslik: 'Henüz destek talebin yok', metin: 'Bir sorun yaşarsan ya da bir şey sormak istersen **ilk talebini** buradan açabilirsin.', eylem: {metin: 'Yeni talep', ikon: 'ekle', veri: {eylem: 'yeni-talep'}}});
    const cip = DD.cipler({ad: 'talep-suz', tur: 'tek', secili: suz || '', ogeler: [{metin: 'Tümü', deger: '', sayi: tum.length}, ...Object.entries(DURUM).map(([k, v]) => ({metin: v.filtre, deger: k, sayi: tum.filter(t => t.durum === k).length}))]});
    const liste = l.length ? DD.yuzey(DD.satirlar(l.map(talepSatir))) : DD.bos({ikon: 'filtre', baslik: 'Bu durumda talebin yok', metin: 'Seçtiğin durumda talep bulunmuyor; **Tümü** ile hepsini görebilirsin.'});
    return `<div class="dd-yigin">${cip}<div data-yuva="talep-liste">${liste}</div></div>`;
  };

  // ---------- Sık sorulanlar ----------
  const sssPanel = (kat, ara) => {
    const q = DD.katla(ara || ''), tum = U().sss.flatMap(k => k.sorular.map(s => ({...s, kategori: k.kategori})));
    const l = q ? tum.filter(s => DD.katla(`${s.soru} ${s.yanit}`).includes(q)) : U().sss.find(k => k.kategori === kat).sorular;
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da **sorunu bize yaz**.', eylem: {metin: 'Yeni talep', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'yeni-talep'}}});
    return `<div class="dd-yigin-12">${q ? DD.p(`**“${ara.trim()}”** için ${l.length} soru bulundu.`, {ton: 'ikincil', meta: true}) : ''}${DD.akordiyon(l.map(s => ({baslik: s.soru, alt: q ? s.kategori : null, ikon: s.ikon, icerik: DD.p(s.yanit)})), {acik: -1})}</div>`;
  };
  const sssBolum = ctx => `<div class="dd-yigin">${DD.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', sonuc: false})}<div data-yuva="sss-kat">${DD.cipler({ad: 'sss-kat', tur: 'tek', secili: ctx.kat, ogeler: U().sss.map(k => ({metin: k.kategori, ikon: k.ikon, deger: k.kategori, sayi: k.sorular.length}))})}</div><div data-yuva="sss">${sssPanel(ctx.kat)}</div></div>`;

  // ---------- Yeni talep ----------
  const RANDEVU = ['Diyetisyen ve randevu'], ODEME = ['Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Pro abonelik'];
  const baglamSecenek = konu => {
    if (RANDEVU.includes(konu) && !DD.yeniHesap()) { const B = DDV.benimDiyetisyenim, r = DD.durum.oku('uzman-randevu', B.sonrakiRandevu); return [...(r ? [`${r.tarihMetin} ${DD.ogun.noktali(r.saat)} · ${r.tur}`] : []), ...B.gecmisRandevular.map(x => `${x.tarihMetin} ${DD.ogun.noktali(x.saat)} · ${x.tur}`)]; }
    if (ODEME.includes(konu) && !DD.yeniHesap()) return U().odemeler.map(o => `${o.no} · ${o.baslik}`);
    return [];
  };
  const baglamHtml = konu => { const l = baglamSecenek(konu); return l.length ? `<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">İlgili kayıt (isteğe bağlı)</span>${DD.cipler({ad: 'talep-baglam', tur: 'tek', serit: false, ogeler: l.map(x => ({metin: x, deger: x, kucuk: true}))})}</div>` : ''; };
  const yeniTalepSheet = (ctx, konu0) => DD.sheet({
    baslik: 'Yeni destek talebi', tam: true,
    html: `<div class="dd-yigin">${DD.p('Talebin destek ekibine iletilir; yanıtı **bildirim olarak** alırsın. Sağlık sorunlarında hekimine başvur.', {ton: 'ikincil'})}<div class="dd-yigin-8"><span class="dd-t-label dd-ton-ikincil">Konu *</span>${DD.cipler({ad: 'talep-konu', tur: 'tek', serit: false, secili: konu0 || '', ogeler: U().talepKonulari.map(k => ({metin: k, deger: k, kucuk: true}))})}</div><div data-yuva="baglam">${baglamHtml(konu0)}</div>${DD.input({ad: 'talep-baslik', etiket: 'Başlık', yer: 'Sorunu kısaca özetle', zorunlu: true})}${DD.input({ad: 'talep-mesaj', etiket: 'Mesajın', yer: 'Ne oldu, hangi ekranda, ne zaman?', cokSatir: true, zorunlu: true})}${DD.gizlilikBant('Tahlil belgesi, kart numarası gibi **hassas bilgileri** mesaja yazma.')}</div>`,
    altBar: DD.btn({metin: 'Talebi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'talep-gonder'}}),
    sonra: s => {
      const sec = ad => s.querySelector(`[data-ad="${ad}"] [aria-pressed="true"]`)?.dataset.cip || '';
      const c = [
        DD.on(s, 'talep-konu', v => { s.querySelector('[data-yuva="baglam"]').innerHTML = baglamHtml(v); }),
        DD.eylem(s, 'talep-gonder', () => {
          const konu = sec('talep-konu'), baslik = s.querySelector('[name="talep-baslik"]').value.trim(), mesaj = s.querySelector('[name="talep-mesaj"]').value.trim(), baglam = sec('talep-baglam');
          const hata = !konu ? 'Bir **konu** seç' : baslik.length < 3 ? 'Başlık **en az 3 karakter** olmalı' : mesaj.length < 10 ? 'Mesajın **en az 10 karakter** olmalı' : '';
          if (hata) { DD.toast(hata, {tur: 'hata', yerine: true}); return; }
          const id = `DD-2026-${Date.now().toString(36).slice(-6).toUpperCase()}`;
          yaz([{id, baslik, konu, durum: 'acik', tarih: DD.bugunIso(), mesajlar: [{kim: 'ben', tarih: DD.bugunIso(), saat: simdiSaat(), metin: baglam ? `${mesaj}\nİlgili kayıt: ${baglam}` : mesaj}]}, ...talepler(ctx)]);
          s.kapat();
          DD.tazele();
          DD.toast(`**${id}** numaralı talebin açıldı`, {tur: 'basari', ikon: 'inbox', eylem: 'Aç', onEylem: () => DD.git(`#/talep/${id}`)});
        })
      ];
      return () => c.forEach(f => f());
    }
  });

  // ---------- Talep detayı ----------
  const detayCiz = t => {
    const kapali = t.durum === 'kapali' || t.durum === 'cozulen';
    let gun = '';
    const yazisma = t.mesajlar.map(m => { const g = tarihMetin(m.tarih), ayrac = g !== gun ? DD.gunAyrac(g) : ''; gun = g; return ayrac + DD.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: 'D', metin: m.metin.replace(/\n/g, ' · '), saat: m.saat}); }).join('');
    const bas = DD.kart({html: `<div class="dd-yigin-12"><div class="dd-ara"><span class="dd-t-meta dd-ton-ikincil">${DD.esc(t.id)}</span>${rozet(t.durum)}</div><h2 class="dd-t-section">${DD.esc(t.baslik)}</h2>${DD.kunye([{ikon: 'tag', etiket: 'Konu', deger: t.konu}, {ikon: 'takvim', etiket: 'Açılış', deger: DD.tarihUzun(t.tarih)}, {ikon: 'comments', etiket: 'Mesaj', deger: String(t.mesajlar.length)}])}</div>`});
    const durum = kapali
      ? `${DD.bant({ton: 'bilgi', ikon: 'lock', metin: 'Bu talep kapandı. Sorun sürüyorsa **yeniden açabilir** ya da yeni talep oluşturabilirsin.'})}${DD.btn({metin: 'Talebi yeniden aç', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'yeniden-ac'}})}`
      : `${t.durum === 'yanit' ? DD.bant({ton: 'uyari', ikon: 'reply', metin: 'Destek ekibi **senden yanıt bekliyor**. Aşağıdan yazabilirsin.'}) : DD.p('Destek ekibi talepleri **sırayla** yanıtlar; genellikle bir iş günü içinde dönülür.', {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Sorunum çözüldü', ikon: 'circle-check', tur: 'tonal', tam: true, veri: {eylem: 'cozuldu'}})}`;
    return `<div class="dd-bolum dd-yigin">${bas}<div class="dd-yigin-12">${yazisma}</div>${durum}</div>`;
  };

  let hataGosterildi = false;
  DD.ekran('cozum-merkezi', {
    tur: 'alt',
    nav: 'profil',
    ust: '#/profil',
    baslik: ctx => (ctx.param?.id ? 'Destek talebi' : 'Çözüm Merkezi'),
    iskelet: 'liste',
    yenile: true,
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: ctx => {
      if (ctx.param?.id) {
        const t = talepler(ctx).find(x => x.id === ctx.param.id);
        return t ? detayCiz(t) : DD.hataEkran({tur: 'bulunamadi', baslik: 'Talep bulunamadı', metin: 'Bu talep silinmiş ya da numarası yanlış olabilir. **Taleplerine dönüp** yeniden bakabilirsin.', eylem: {metin: 'Taleplerime dön', yerine: '#/cozum-merkezi'}});
      }
      ctx.kat ||= U().sss[0].kategori;
      const acik = talepler(ctx).filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
      return DD.bolumler([
        DD.p(acik ? `**${acik} talebin** açık. Yanıt geldiğinde bildirim alırsın; sık sorulanlarda aradığını hızla bulabilirsin.` : 'Sorunun cevabı **sık sorulanlarda** olabilir; bulamazsan yeni talep aç, ekip sana döner.', {ton: 'ikincil'}),
        {baslik: 'Taleplerim', html: `<div data-yuva="talep">${talepPanel(ctx, ctx.suz)}</div>`},
        {baslik: 'Sık sorulanlar', html: sssBolum(ctx)},
        {baslik: 'Topluluk', html: DD.eylemKart({ikon: 'people-group', baslik: 'Destek grupları', alt: 'Benzer hedefteki üyelerle deneyim paylaş', git: '#/destek-gruplari'})},
        DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Dada Diet içerikleri **genel bilgi** amaçlıdır; tanı ve tedavi için hekimine başvur.'})
      ]);
    },
    altBar: ctx => {
      if (!ctx.param?.id) return DD.altEylem({dugmeler: [{metin: 'Yeni talep', ikon: 'ekle', tam: true, veri: {eylem: 'yeni-talep'}}]});
      const t = talepler(ctx).find(x => x.id === ctx.param.id);
      return t && t.durum !== 'kapali' && t.durum !== 'cozulen' ? DD.mesajGiris({ad: 'yanit', yer: 'Yanıt yaz'}) : '';
    },
    sonra: (kok, ctx) => {
      if (ctx.param?.id) {
        const id = ctx.param.id, t = () => talepler(ctx).find(x => x.id === id);
        if (!t()) return undefined;
        const guncelle = f => { yaz(talepler(ctx).map(x => (x.id === id ? f(x) : x))); DD.tazele(); };
        const c = [
          DD.eylem(kok, 'cozuldu', () => { guncelle(x => ({...x, durum: 'cozulen'})); DD.toast('Talep **çözüldü** olarak kapatıldı', {tur: 'basari', ikon: 'circle-check'}); }),
          DD.eylem(kok, 'yeniden-ac', () => { guncelle(x => ({...x, durum: 'acik'})); DD.toast('Talep **yeniden açıldı**', {ikon: 'rotate-left'}); }),
          DD.eylem(kok, 'ek', () => DD.toast('Ekran görüntüsünü **e-posta yanıtına** ekleyebilirsin; uygulama içinden dosya alınmaz', {ikon: 'ek', yerine: true})),
          DD.eylem(kok, 'ses-mesaj', () => DD.toast('Destek talepleri **yazılı** yanıtlanır', {ikon: 'mikrofon', yerine: true}))
        ];
        const form = kok.querySelector('[data-mesaj]');
        if (form) {
          const gonder = ev => {
            ev.preventDefault();
            const i = form.querySelector('input'), metin = i.value.trim();
            if (metin.length < 3) { DD.toast('Yanıtın **en az 3 karakter** olmalı', {tur: 'hata', yerine: true}); return; }
            guncelle(x => ({...x, durum: 'acik', mesajlar: [...x.mesajlar, {kim: 'ben', tarih: DD.bugunIso(), saat: simdiSaat(), metin}]}));
            DD.toast('Yanıtın talebe **eklendi**', {ikon: 'gonder'});
          };
          form.addEventListener('submit', gonder);
          c.push(() => form.removeEventListener('submit', gonder));
        }
        return () => c.forEach(f => f());
      }
      if (ctx.sorgu.yeni && !ctx.acildi) { ctx.acildi = true; yeniTalepSheet(ctx, ctx.sorgu.konu); }
      const ara = kok.querySelector('[name="sss-ara"]'), sss = kok.querySelector('[data-yuva="sss"]'), kat = kok.querySelector('[data-yuva="sss-kat"]');
      const araGir = () => { const q = ara.value.trim(); kat.hidden = !!q; sss.innerHTML = sssPanel(ctx.kat, q); };
      ara.addEventListener('input', araGir);
      const c = [
        () => ara.removeEventListener('input', araGir),
        DD.eylem(kok, 'yeni-talep', () => yeniTalepSheet(ctx)),
        DD.on(kok, 'talep-suz', v => { ctx.suz = v || null; kok.querySelector('[data-yuva="talep"]').innerHTML = talepPanel(ctx, ctx.suz); }),
        DD.on(kok, 'sss-kat', v => { ctx.kat = v; sss.innerHTML = sssPanel(v); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
