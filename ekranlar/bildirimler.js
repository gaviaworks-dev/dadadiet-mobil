/* Bildirimler (#/bildirimler). Gastro .dgu-bildirim satırı; referans: tasks/referanslar.md Bildirimler (Doctolib yapı, Acorns boş hal).
 * Kalıcı: bildirim-okundu, bildirim-silinen (id listesi). Her değişimde document'e 'dd-bildirim' olayı gider; zil sayacı bunu dinler.
 * #/bildirimler?hal=bos boş hal, ?hal=hata bağlantı hatası.
 */
(() => {
  const GRUPLAR = ['Bugün', 'Dün', 'Bu hafta'];
  const okunan = () => DD.durum.oku('bildirim-okundu', []);
  const silinen = () => DD.durum.oku('bildirim-silinen', []);
  const yayinla = () => document.dispatchEvent(new CustomEvent('dd-bildirim'));
  const okunduYaz = ids => { DD.durum.yaz('bildirim-okundu', [...new Set([...okunan(), ...ids])]); yayinla(); };
  const liste = ctx => (ctx.sorgu.hal === 'bos' ? [] : DDV.bildirimler.filter(b => !silinen().includes(b.id)).map(b => ({...b, okundu: b.okundu || okunan().includes(b.id)})));
  const hedef = b => (b.hedef === 'uzmanim' ? (b.tur === 'mesaj' ? '#/uzman/sohbet' : '#/uzman') : `#/${b.hedef}`);

  const bos = () => DD.bos({ikon: 'bildirim', tam: true, baslik: 'Şimdilik sessiz', metin: 'Yeni bir **hatırlatma ya da mesaj** geldiğinde burada görünür.', eylem: {metin: 'Bildirim ayarları', ikon: 'ayar', tur: 'secondary', git: '#/profil'}});
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
      const l = liste(ctx);
      if (!l.length) return bos();
      const var_ = GRUPLAR.filter(g => l.some(b => b.grup === g)), yeni = l.some(b => !b.okundu);
      return var_.map((g, i) => DD.bolum({baslik: g, eylem: i === 0 && yeni ? {html: okuDugme()} : null, html: DD.satirlar(l.filter(b => b.grup === g).map(b => DD.bildirimSatir(b)))})).join('');
    },
    sonra: (kok, ctx) => {
      const hepsiOku = () => { okunduYaz(liste(ctx).map(b => b.id)); DD.tazele(); DD.toast('Bildirimler **okundu** sayıldı', {ikon: 'onay'}); };
      const temizle = () => {
        const once = silinen();
        DD.durum.yaz('bildirim-silinen', DDV.bildirimler.map(b => b.id)); yayinla(); DD.tazele();
        DD.toast('Bildirimler **temizlendi**', {ikon: 'sil', eylem: 'Geri al', onEylem: () => { DD.durum.yaz('bildirim-silinen', once); yayinla(); DD.tazele(); }});
      };
      const ac = ev => { const el = ev.target.closest('.dd-bildirim'); if (!el) return; const b = DDV.bildirimler.find(x => x.id === +el.dataset.id); okunduYaz([b.id]); DD.git(hedef(b)); };
      kok.addEventListener('click', ac);
      const baglar = [
        DD.eylem(kok, 'hepsi-okundu', hepsiOku),
        DD.eylem(kok, 'secenek', () => DD.sheet({
          baslik: 'Bildirimler',
          html: DD.satirlar([
            {ikon: 'onay', baslik: 'Tümünü okundu say', veri: {eylem: 's-oku'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'sil', baslik: 'Bildirimleri temizle', veri: {eylem: 's-temizle'}, attrs: 'data-sheet-kapat', ok: false},
            {ikon: 'ayar', baslik: 'Bildirim ayarları', git: '#/profil', attrs: 'data-sheet-kapat'}
          ]),
          sonra: d => { DD.eylem(d, 's-oku', hepsiOku); DD.eylem(d, 's-temizle', temizle); }
        }))
      ];
      return () => { kok.removeEventListener('click', ac); baglar.forEach(c => c()); };
    }
  });
})();
