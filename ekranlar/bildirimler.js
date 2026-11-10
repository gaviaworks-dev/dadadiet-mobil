/* Bildirimler (#/bildirimler). Gastro .dgu-bildirim satırı; referans: tasks/referanslar.md Bildirimler (Doctolib yapı, Acorns boş hal).
 * Kalıcı: bildirim-okundu, bildirim-silinen (id listesi). Her değişimde document'e 'dd-bildirim' olayı gider; zil sayacı bunu dinler.
 * Öğün hatırlatmaları DD.ogun.bildirimler()'den katılır (id 'ogn-<iso>-<tur>' metin; hedef 'profil'); DDV id'leri sayıdır, eşleme String ile yapılır.
 * #/bildirimler?hal=bos boş hal, ?hal=hata bağlantı hatası.
 */
(() => {
  const GRUPLAR = ['Bugün', 'Dün', 'Bu hafta'];
  const okunan = () => DD.durum.oku('bildirim-okundu', []);
  const silinen = () => DD.durum.oku('bildirim-silinen', []);
  const yayinla = () => document.dispatchEvent(new CustomEvent('dd-bildirim'));
  const okunduYaz = ids => { DD.durum.yaz('bildirim-okundu', [...new Set([...okunan(), ...ids])]); yayinla(); };
  // Tümü: DDV bildirimleri (yalnız dolu hesap) + saati gelmiş öğün hatırlatmaları. Bugün grubu saate göre yeniden eskiye.
  const saatDk = b => { const m = String(b.zaman).match(/^(\d{1,2})[:.](\d{2})$/); return m ? +m[1] * 60 + +m[2] : null; };
  const tumu = () => {
    const l = [...(DD.yeniHesap() ? [] : DDV.bildirimler), ...DD.ogun.bildirimler()];   // yeni hesapta örnek bildirim yok
    return l.map((b, i) => ({b, i})).sort((x, y) => {
      const g = GRUPLAR.indexOf(x.b.grup) - GRUPLAR.indexOf(y.b.grup), a = saatDk(x.b), c = saatDk(y.b);
      return g || (a != null && c != null ? c - a : x.i - y.i);
    }).map(x => x.b);
  };
  const liste = ctx => (ctx.sorgu.hal === 'bos' ? [] : tumu().filter(b => !silinen().includes(b.id)).map(b => ({...b, okundu: b.okundu || okunan().includes(b.id)})));
  const hedef = b => (b.hedef === 'uzmanim' ? (b.tur === 'mesaj' ? '#/uzman/sohbet' : '#/uzman') : `#/${b.hedef}`);

  const bos = () => DD.bos({ikon: 'bildirim', tam: true, baslik: 'Şimdilik sessiz', metin: 'Yeni bir **hatırlatma ya da mesaj** geldiğinde burada görünür.', eylem: {metin: 'Bildirim ayarları', ikon: 'ayar', tur: 'secondary', git: '#/ayarlar/bildirim'}});
  const okuDugme = () => DD.btn({metin: 'Tümünü oku', tur: 'text', boyut: 'sm', veri: {eylem: 'hepsi-okundu'}});

  let hataGosterildi = false;
  DD.ekran('bildirimler', {
    tur: 'alt',
    baslik: 'Bildirimler',
    yenile: true,
    iskelet: 'liste',
    ustBar: ctx => (liste(ctx).length ? {sag: [{ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'secenek'}}]} : {}),
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    ciz: ctx => {
      const l = DD.uye() ? liste(ctx) : [];
      if (!l.length) return bos();
      const var_ = GRUPLAR.filter(g => l.some(b => b.grup === g)), yeni = l.some(b => !b.okundu);
      return var_.map((g, i) => DD.bolum({baslik: g, eylem: i === 0 && yeni ? {html: okuDugme()} : null, html: DD.satirlar(l.filter(b => b.grup === g).map(b => DD.bildirimSatir(b)))})).join('');
    },
    sonra: (kok, ctx) => {
      const hepsiOku = () => { okunduYaz(liste(ctx).map(b => b.id)); DD.tazele(); DD.toast('Bildirimler **okundu** sayıldı', {ikon: 'onay'}); };
      const temizle = () => {
        const once = silinen();
        DD.durum.yaz('bildirim-silinen', [...new Set([...once, ...tumu().map(b => b.id)])]); yayinla(); DD.tazele();
        DD.toast('Bildirimler **temizlendi**', {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('bildirim-silinen', once); yayinla(); DD.tazele(); }});
      };
      const ac = ev => { const el = ev.target.closest('.dd-bildirim'); if (!el) return; const b = tumu().find(x => String(x.id) === el.dataset.id); if (!b) return; okunduYaz([b.id]); DD.git(hedef(b)); };
      kok.addEventListener('click', ac);
      const baglar = [
        DD.eylem(kok, 'hepsi-okundu', hepsiOku),
        DD.eylem(kok, 'secenek', () => DD.sheet({
          baslik: 'Bildirimler',
          html: DD.satirlar([
            {ikon: 'onay', baslik: 'Tümünü okundu say', veri: {eylem: 's-oku'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'sil', baslik: 'Bildirimleri temizle', veri: {eylem: 's-temizle'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'ayar', baslik: 'Bildirim ayarları', git: '#/ayarlar/bildirim', attrs: 'data-sheet-kapat'}
          ]),
          sonra: d => { DD.eylem(d, 's-oku', hepsiOku); DD.eylem(d, 's-temizle', temizle); }
        }))
      ];
      return () => { kok.removeEventListener('click', ac); baglar.forEach(c => c()); };
    }
  });
})();
