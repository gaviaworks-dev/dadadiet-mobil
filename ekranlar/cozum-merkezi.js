/* Çözüm Merkezi: #/cozum-merkezi (sık sorulanlar, talepler, yeni talep) ve #/talep/:id (talep yazışması).
 * Gastro kalıbı (ayarlar.js S5): sayfa başlığı + kaydırmalı segment SSS · Taleplerim · Yeni talep (?sekme=sss|talepler|yeni); yeni talep formu sekmenin içinde.
 * Web karşılığı: hesabim/cozum-merkezi + talep (uye-gastro-cozum.js, uye-gastro-talep.js, uye-gastro-destek.js). SSS, konu listesi ve talepler DDV.uye.
 * Durum: destek-talepleri (talep dizisinin tamamı; varsayılan DDV.uye.talepler, yeni hesapta []). Yanıt yazınca talep 'acik' olur; "Sorunum çözüldü" 'cozulen',
 *   kapalı talep yeniden açılabilir. #/cozum-merkezi?yeni=1 (ya da ?sekme=yeni) yeni talep sekmesini açar (?konu=İptal ve iade konuyu seçer), ?hal=bos, ?hal=hata. */
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
  const sekme = ctx => ctx.sekme || (ctx.sorgu.yeni ? 'yeni' : ['sss', 'talepler', 'yeni'].includes(ctx.sorgu.sekme) ? ctx.sorgu.sekme : 'sss');

  // ---------- Talepler ----------
  const talepSatir = t => ({ikon: DURUM[t.durum].ikon, baslik: t.baslik, alt: `${DURUM[t.durum].metin} · ${t.konu} · ${tarihMetin(son(t).tarih)}`, git: `#/talep/${t.id}`});
  const talepPanel = (ctx, suz) => {
    const tum = sirali(talepler(ctx)), l = tum.filter(t => !suz || t.durum === suz), acik = tum.filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
    if (!tum.length) return DD.bos({ikon: 'inbox', baslik: 'Henüz destek talebin yok', metin: 'Bir sorun yaşarsan ya da bir şey sormak istersen **ilk talebini** buradan açabilirsin.', eylem: {metin: 'Yeni talep', ikon: 'ekle', veri: {eylem: 'yeni-talep'}}});
    const cip = DD.cipler({ad: 'talep-suz', tur: 'tek', etiket: 'Talep durumu süzgeci', secili: suz || '', ogeler: [{metin: 'Tümü', deger: '', sayi: tum.length}, ...Object.entries(DURUM).map(([k, v]) => ({metin: v.filtre, deger: k, sayi: tum.filter(t => t.durum === k).length}))]});
    const liste = l.length ? DD.satirlar(l.map(talepSatir)) : DD.bos({ikon: 'filtre', baslik: 'Bu durumda talebin yok', metin: 'Seçtiğin durumda talep bulunmuyor; **Tümü** ile hepsini görebilirsin.', eylem: {metin: 'Tüm talepleri göster', tur: 'secondary', veri: {eylem: 'talep-tumu'}}});
    return `<div class="dd-yigin">${DD.p(acik ? `**${acik} talebin** açık. Yanıt geldiğinde bildirim alırsın.` : 'Açık talebin yok; **kapanan talepler** de burada saklanır.', {ton: 'ikincil', meta: true})}${cip}${liste}</div>`;
  };

  // ---------- Sık sorulanlar ----------
  const sssPanel = (kat, ara) => {
    const q = DD.katla(ara || ''), tum = U().sss.flatMap(k => k.sorular.map(s => ({...s, kategori: k.kategori})));
    const l = q ? tum.filter(s => DD.katla(`${s.soru} ${s.yanit}`).includes(q)) : U().sss.find(k => k.kategori === kat).sorular;
    if (!l.length) return DD.bos({ikon: 'ara_', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da **sorunu bize yaz**.', eylem: {metin: 'Yeni talep', ikon: 'ekle', tur: 'secondary', veri: {eylem: 'yeni-talep'}}});
    return `<div class="dd-yigin-12">${q ? DD.p(`**“${ara.trim()}”** için ${l.length} soru bulundu.`, {ton: 'ikincil', meta: true}) : ''}${DD.akordiyon(l.map(s => ({baslik: s.soru, alt: q ? s.kategori : null, ikon: s.ikon, icerik: DD.p(s.yanit)})), {acik: -1})}</div>`;
  };
  const sssBolum = ctx => `<div class="dd-yigin">${DD.arama({ad: 'sss-ara', yer: 'Sorunu birkaç kelimeyle yaz', sonuc: false})}${DD.cipler({ad: 'sss-kat', tur: 'tek', etiket: 'Soru kategorileri', secili: ctx.kat, ogeler: U().sss.map(k => ({metin: k.kategori, ikon: k.ikon, deger: k.kategori, sayi: k.sorular.length}))})}<div data-yuva="sss">${sssPanel(ctx.kat)}</div><div class="dd-yigin-8">${DD.bas('Topluluk')}${DD.satirlar([{ikon: 'people-group', baslik: 'Destek grupları', alt: 'Benzer hedefteki üyelerle deneyim paylaş', git: '#/destek-gruplari'}])}</div>${DD.bant({ton: 'bilgi', baslik: 'Genel bilgi', metin: 'Dada Diet içerikleri **genel bilgi** amaçlıdır; tanı ve tedavi için hekimine başvur.'})}</div>`;

  // ---------- Yeni talep ----------
  const RANDEVU = ['Diyetisyen ve randevu'], ODEME = ['Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Pro abonelik'];
  const baglamSecenek = konu => {
    if (RANDEVU.includes(konu) && !DD.yeniHesap()) { const B = DDV.benimDiyetisyenim, r = DD.durum.oku('uzman-randevu', B.sonrakiRandevu); return [...(r ? [`${r.tarihMetin} ${DD.ogun.noktali(r.saat)} · ${r.tur}`] : []), ...B.gecmisRandevular.map(x => `${x.tarihMetin} ${DD.ogun.noktali(x.saat)} · ${x.tur}`)]; }
    if (ODEME.includes(konu) && !DD.yeniHesap()) return U().odemeler.map(o => `${o.no} · ${o.baslik}`);
    return [];
  };
  const baglamHtml = konu => { const l = baglamSecenek(konu); return l.length ? DD.alan({etiket: 'İlgili kayıt (isteğe bağlı)', html: DD.cipler({ad: 'talep-baglam', tur: 'tek', serit: false, ogeler: l.map(x => ({metin: x, deger: x, kucuk: true}))})}) : ''; };
  const yeniPanel = konu0 => `<div class="dd-yigin" data-talep-form>${DD.p('Talebin destek ekibine iletilir; yanıtı **bildirim olarak** alırsın. Sağlık sorunlarında hekimine başvur.', {ton: 'ikincil'})}${DD.alan({etiket: 'Konu', zorunlu: true, html: DD.cipler({ad: 'talep-konu', tur: 'tek', serit: false, secili: konu0 || '', ogeler: U().talepKonulari.map(k => ({metin: k, deger: k, kucuk: true}))})})}<div data-yuva="baglam">${baglamHtml(konu0)}</div>${DD.input({ad: 'talep-baslik', etiket: 'Başlık', yer: 'Sorunu kısaca özetle', zorunlu: true})}${DD.input({ad: 'talep-mesaj', etiket: 'Mesajın', yer: 'Ne oldu, hangi ekranda, ne zaman?', cokSatir: true, zorunlu: true})}${DD.gizlilikBant('Tahlil belgesi, kart numarası gibi **hassas bilgileri** mesaja yazma.')}${DD.btn({metin: 'Talebi gönder', ikon: 'gonder', tam: true, veri: {eylem: 'talep-gonder'}})}${DD.p('Destek ekibi talepleri **sırayla** yanıtlar; genellikle bir iş günü içinde dönülür.', {ton: 'ikincil', meta: true})}</div>`;
  // Formu gönderir; başarılıysa yeni talebin id'sini döner.
  const talepGonder = (kok, ctx) => {
    const f = kok.querySelector('[data-talep-form]'), sec = ad => f.querySelector(`[data-ad="${ad}"] [aria-pressed="true"]`)?.dataset.cip || '';
    const konu = sec('talep-konu'), baslik = f.querySelector('[name="talep-baslik"]').value.trim(), mesaj = f.querySelector('[name="talep-mesaj"]').value.trim(), baglam = sec('talep-baglam');
    const hata = !konu ? 'Bir **konu** seç' : baslik.length < 3 ? 'Başlık **en az 3 karakter** olmalı' : mesaj.length < 10 ? 'Mesajın **en az 10 karakter** olmalı' : '';
    if (hata) { DD.toast(hata, {tur: 'hata', yerine: true}); return null; }
    const id = `DD-2026-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    yaz([{id, baslik, konu, durum: 'acik', tarih: DD.bugunIso(), mesajlar: [{kim: 'ben', tarih: DD.bugunIso(), saat: simdiSaat(), metin: baglam ? `${mesaj}\nİlgili kayıt: ${baglam}` : mesaj}]}, ...talepler(ctx)]);
    return id;
  };

  // ---------- Talep detayı ----------
  const detayCiz = t => {
    const kapali = t.durum === 'kapali' || t.durum === 'cozulen';
    let gun = '';
    const yazisma = t.mesajlar.map(m => { const g = tarihMetin(m.tarih), ayrac = g !== gun ? DD.gunAyrac(g) : ''; gun = g; return ayrac + DD.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: 'D', metin: m.metin.replace(/\n/g, ' · '), saat: m.saat}); }).join('');
    const bas = `<div class="dd-yigin-12"><div class="dd-ara"><span class="dd-t-meta dd-ton-ikincil">${DD.esc(t.id)}</span>${rozet(t.durum)}</div><h2 class="dd-t-section">${DD.esc(t.baslik)}</h2>${DD.kunye([{ikon: 'tag', etiket: 'Konu', deger: t.konu}, {ikon: 'takvim', etiket: 'Açılış', deger: DD.tarihUzun(t.tarih)}, {ikon: 'comments', etiket: 'Mesaj', deger: String(t.mesajlar.length)}])}</div>`;
    const durum = kapali
      ? `<div class="dd-yigin-12">${DD.bant({ton: 'bilgi', ikon: 'lock', metin: 'Bu talep kapandı. Sorun sürüyorsa **yeniden açabilir** ya da yeni talep oluşturabilirsin.'})}${DD.btn({metin: 'Talebi yeniden aç', ikon: 'rotate-left', tur: 'secondary', tam: true, veri: {eylem: 'yeniden-ac'}})}</div>`
      : `<div class="dd-yigin-12">${t.durum === 'yanit' ? DD.bant({ton: 'uyari', ikon: 'reply', metin: 'Destek ekibi **senden yanıt bekliyor**. Aşağıdan yazabilirsin.'}) : DD.p('Destek ekibi talepleri **sırayla** yanıtlar; genellikle bir iş günü içinde dönülür.', {ton: 'ikincil', meta: true})}${DD.btn({metin: 'Sorunum çözüldü', ikon: 'circle-check', tur: 'tonal', tam: true, veri: {eylem: 'cozuldu'}})}</div>`;
    return DD.gruplar([{baslik: 'Yazışma', html: `<div class="dd-yigin-12">${yazisma}</div>`}, {html: durum}], {bas});
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
      const s = sekme(ctx), acik = talepler(ctx).filter(t => t.durum === 'acik' || t.durum === 'yanit').length;
      const seg = DD.segment({ad: 'cm-sekme', etiket: 'Çözüm Merkezi bölümleri', kaydir: true, secili: s, ogeler: [{ad: 'Sık sorulanlar', deger: 'sss'}, {ad: 'Taleplerim', deger: 'talepler', sayi: acik || null}, {ad: 'Yeni talep', deger: 'yeni'}]});
      const panel = (k, html) => `<div data-panel="${k}"${k === s ? '' : ' hidden'}>${html}</div>`;
      return DD.gruplar([
        {html: seg},
        {html: `${panel('sss', sssBolum(ctx))}${panel('talepler', `<div data-yuva="talep">${talepPanel(ctx, ctx.suz)}</div>`)}${panel('yeni', yeniPanel(ctx.sorgu.konu))}`}
      ], {bas: DD.metinBlok({baslik: 'Çözüm Merkezi', metin: 'Sık sorulanlar, **destek taleplerin** ve yeni talep açma tek adreste.'})});
    },
    altBar: ctx => {
      if (!ctx.param?.id) return '';
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
      const ara = kok.querySelector('[name="sss-ara"]'), sss = kok.querySelector('[data-yuva="sss"]'), kat = kok.querySelector('[data-ad="sss-kat"]');
      const araGir = () => { const q = ara.value.trim(); kat.hidden = !!q; sss.innerHTML = sssPanel(ctx.kat, q); };
      ara.addEventListener('input', araGir);
      const sekmeye = k => kok.querySelector(`.dd-seg [data-seg="${k}"]`)?.click();
      const talepCiz = () => { kok.querySelector('[data-yuva="talep"]').innerHTML = talepPanel(ctx, ctx.suz); };
      const c = [
        () => ara.removeEventListener('input', araGir),
        DD.on(kok, 'cm-sekme', v => { ctx.sekme = v; kok.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== v; }); }),
        DD.eylem(kok, 'yeni-talep', () => sekmeye('yeni')),
        DD.eylem(kok, 'talep-tumu', () => { ctx.suz = null; talepCiz(); }),
        DD.on(kok, 'talep-suz', v => { ctx.suz = v || null; talepCiz(); }),
        DD.on(kok, 'sss-kat', v => { ctx.kat = v; sss.innerHTML = sssPanel(v); }),
        DD.on(kok, 'talep-konu', v => { kok.querySelector('[data-yuva="baglam"]').innerHTML = baglamHtml(v); }),
        DD.eylem(kok, 'talep-gonder', () => {
          const id = talepGonder(kok, ctx);
          if (!id) return;
          ctx.sekme = 'talepler';
          ctx.suz = null;
          DD.tazele();
          DD.toast(`**${id}** numaralı talebin açıldı`, {tur: 'basari', ikon: 'inbox', eylem: 'Aç', onEylem: () => DD.git(`#/talep/${id}`)});
        })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
