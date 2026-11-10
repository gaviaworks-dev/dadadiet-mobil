/* Bildirimler (#/bildirimler). Gastro kalıbı (arama.js S2 Bildirimler): üst barda ayar ikonu, baş bloğu ("N okunmamış" + Tümünü okundu + açıklama),
 *   tür süzgeci çip şeridi, gün grupları, satır başına üç nokta sheet'i (aç · okundu/okunmadı · sil), okunmamışa "Yeni" rozeti, süzgeç boş hali.
 * Kalıcı: bildirim-okundu, bildirim-silinen (id listesi). Her değişimde document'e 'dd-bildirim' olayı gider; zil sayacı bunu dinler.
 * Öğün hatırlatmaları DD.ogun.bildirimler()'den katılır (id 'ogn-<iso>-<tur>' metin; hedef 'profil'); DDV id'leri sayıdır, eşleme String ile yapılır.
 * #/bildirimler?tur=su süzgeci açar, ?hal=bos boş hal, ?hal=hata bağlantı hatası.
 */
(() => {
  const GRUPLAR = ['Bugün', 'Dün', 'Bu hafta'];
  const TURLER = [['ogun', 'Öğün', 'ogun'], ['oruc', 'Oruç', 'hourglass-half'], ['su', 'Su', 'su'], ['randevu', 'Randevu', 'takvim'], ['mesaj', 'Mesaj', 'sohbet'], ['program', 'Program', 'program']];
  const turAd = t => TURLER.find(x => x[0] === t)?.[1] || 'Bildirim';
  const okunan = () => DD.durum.oku('bildirim-okundu', []);
  const silinen = () => DD.durum.oku('bildirim-silinen', []);
  const yayinla = () => document.dispatchEvent(new CustomEvent('dd-bildirim'));
  const okunduYaz = ids => { DD.durum.yaz('bildirim-okundu', [...new Set([...okunan(), ...ids])]); yayinla(); };
  const saatNokta = s => String(s).replace(/(\d{1,2}):(\d{2})/g, '$1.$2');
  // Tümü: DDV bildirimleri (yalnız dolu hesap) + saati gelmiş öğün hatırlatmaları. Bugün grubu saate göre yeniden eskiye.
  const saatDk = b => { const m = String(b.zaman).match(/^(\d{1,2})[:.](\d{2})$/); return m ? +m[1] * 60 + +m[2] : null; };
  const tumu = () => {
    const l = [...(DD.yeniHesap() ? [] : DDV.bildirimler), ...DD.ogun.bildirimler()];   // yeni hesapta örnek bildirim yok
    return l.map((b, i) => ({b, i})).sort((x, y) => {
      const g = GRUPLAR.indexOf(x.b.grup) - GRUPLAR.indexOf(y.b.grup), a = saatDk(x.b), c = saatDk(y.b);
      return g || (a != null && c != null ? c - a : x.i - y.i);
    }).map(x => x.b);
  };
  const liste = ctx => (ctx.sorgu.hal === 'bos' || !DD.uye() ? [] : tumu().filter(b => !silinen().includes(b.id)).map(b => ({...b, okundu: b.okundu || okunan().includes(b.id)})));
  const hedef = b => (b.hedef === 'uzmanim' ? (b.tur === 'mesaj' ? '#/uzman/sohbet' : '#/uzman') : `#/${b.hedef}`);
  const suzgec = ctx => { const t = ctx.suz ?? ctx.sorgu.tur ?? ''; return TURLER.some(x => x[0] === t) ? t : ''; };

  const bos = () => DD.bos({ikon: 'bildirim', tam: true, baslik: 'Şimdilik sessiz', metin: 'Yeni bir **hatırlatma ya da mesaj** geldiğinde burada görünür.', eylem: {metin: 'Bildirim ayarları', ikon: 'ayar', tur: 'secondary', git: '#/ayarlar/bildirim'}});
  // Satır: Gastro .dgu-satir-kap = bildirim + üç nokta. Okunmamışta "Yeni" rozeti ve "tür · zaman" metası kanondan (DD.bildirimSatir meta).
  const satir = b => DD.satirKap(DD.bildirimSatir({...b, baslik: saatNokta(b.baslik), metin: saatNokta(b.metin), zaman: saatNokta(b.zaman)}, {meta: turAd(b.tur)}), DD.ikonBtn({ikon: 'more', etiket: `${saatNokta(b.baslik)}: seçenekler`, veri: {eylem: 'b-daha', id: String(b.id)}}));
  const basBlok = (l, suz) => {
    const n = l.filter(b => !b.okundu).length;
    const cip = DD.cipler({ad: 'bildirim-tur', tur: 'tek', etiket: 'Bildirim türü süzgeci', secili: suz, ogeler: [{metin: 'Tümü', deger: '', sayi: l.length}, ...TURLER.map(([deger, metin, ikon]) => ({metin, ikon, deger}))]});
    return `<div class="dd-yigin-12"><div class="dd-ara"><span class="dd-t-sub" role="status">${n ? `${n} okunmamış` : 'Hepsi okundu'}</span>${n ? DD.btn({metin: 'Tümünü okundu', ikon: 'onay', tur: 'text', boyut: 'sm', veri: {eylem: 'hepsi-okundu'}}) : ''}</div>${DD.p('Öğün, oruç, su, randevu, mesaj ve program bildirimlerin **tek akışta**.', {ton: 'ikincil', meta: true})}${cip}</div>`;
  };

  let hataGosterildi = false;
  DD.ekran('bildirimler', {
    tur: 'alt',
    baslik: 'Bildirimler',
    yenile: true,
    iskelet: 'liste',
    ustBar: () => (DD.uye() ? {sag: [{ikon: 'ayar', etiket: 'Bildirim ayarları', git: '#/ayarlar/bildirim'}]} : {}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    ciz: ctx => {
      const l = liste(ctx);
      if (!l.length) return bos();
      const suz = suzgec(ctx), g = l.filter(b => !suz || b.tur === suz);
      const gruplar = g.length
        ? GRUPLAR.filter(x => g.some(b => b.grup === x)).map(x => ({baslik: x, html: DD.satirlar(g.filter(b => b.grup === x).map(satir))}))
        : [{html: DD.bos({ikon: 'filtre', baslik: 'Bu süzgeçte bildirim yok', metin: `Şu an **${turAd(suz).toLocaleLowerCase('tr')}** türünde bildirimin bulunmuyor.`, eylem: {metin: 'Süzgeci sıfırla', tur: 'secondary', veri: {eylem: 'suz-sifirla'}}})}];
      const temizleDugme = g.length ? {html: `<div class="dd-sira">${DD.btn({metin: 'Bildirimleri temizle', ikon: 'sil', tur: 'text', boyut: 'sm', veri: {eylem: 'temizle'}})}</div>`} : null;
      return DD.gruplar([...gruplar, temizleDugme], {bas: basBlok(l, suz)});
    },
    sonra: (kok, ctx) => {
      const bul = id => tumu().find(x => String(x.id) === String(id));
      const hepsiOku = () => { okunduYaz(liste(ctx).map(b => b.id)); DD.tazele(); DD.toast('Bildirimler **okundu** sayıldı', {ikon: 'onay'}); };
      const temizle = () => {
        const once = silinen();
        DD.durum.yaz('bildirim-silinen', [...new Set([...once, ...tumu().map(b => b.id)])]); yayinla(); DD.tazele();
        DD.toast('Bildirimler **temizlendi**', {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('bildirim-silinen', once); yayinla(); DD.tazele(); }});
      };
      const sil = b => {
        const once = silinen();
        DD.durum.yaz('bildirim-silinen', [...once, b.id]); yayinla(); DD.tazele();
        DD.toast('Bildirim silindi', {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('bildirim-silinen', once); yayinla(); DD.tazele(); }, yerine: true});
      };
      // Okunmadı yalnız bu cihazda okunmuş sayılan bildirime geri verilir; zil sayacı aynı listeyi okur.
      const okunmadi = b => { DD.durum.yaz('bildirim-okundu', okunan().filter(x => x !== b.id)); yayinla(); DD.tazele(); DD.toast('Bildirim **okunmadı** olarak işaretlendi', {ikon: 'bildirim', yerine: true}); };
      const ac = ev => { const el = ev.target.closest('.dd-bildirim'); if (!el) return; const b = bul(el.dataset.id); if (!b) return; okunduYaz([b.id]); DD.git(hedef(b)); };
      kok.addEventListener('click', ac);
      const baglar = [
        DD.eylem(kok, 'hepsi-okundu', hepsiOku),
        DD.eylem(kok, 'temizle', temizle),
        DD.eylem(kok, 'suz-sifirla', () => { ctx.suz = ''; DD.tazele(); }),
        DD.on(kok, 'bildirim-tur', v => { ctx.suz = v || ''; DD.tazele(); }),
        DD.eylem(kok, 'b-daha', el => {
          const b = bul(el.dataset.id);
          if (!b) return;
          const okundu = b.okundu || okunan().includes(b.id), geriAlinir = !b.okundu && okunan().includes(b.id);
          DD.sheet({
            baslik: saatNokta(b.baslik),
            html: DD.satirlar([
              {ikon: 'arrow-right', baslik: 'İlgili sayfaya git', veri: {eylem: 's-ac'}, attrs: 'data-sheet-kapat'},
              !okundu ? {ikon: 'onay', baslik: 'Okundu olarak işaretle', veri: {eylem: 's-okundu'}, attrs: 'data-sheet-kapat', ok: false}
                : geriAlinir ? {ikon: 'bildirim', baslik: 'Okunmadı olarak işaretle', veri: {eylem: 's-okunmadi'}, attrs: 'data-sheet-kapat', ok: false} : null,
              {ikon: 'sil', baslik: 'Bildirimi sil', yikici: true, veri: {eylem: 's-sil'}, attrs: 'data-sheet-kapat', ok: false}
            ].filter(Boolean)),
            sonra: d => {
              const c = [
                DD.eylem(d, 's-ac', () => { okunduYaz([b.id]); DD.git(hedef(b)); }),
                DD.eylem(d, 's-okundu', () => { okunduYaz([b.id]); DD.tazele(); DD.toast('Bildirim **okundu** sayıldı', {ikon: 'onay', yerine: true}); }),
                DD.eylem(d, 's-okunmadi', () => okunmadi(b)),
                DD.eylem(d, 's-sil', () => sil(b))
              ];
              return () => c.forEach(f => f());
            }
          });
        })
      ];
      return () => { kok.removeEventListener('click', ac); baglar.forEach(c => c()); };
    }
  });
})();
