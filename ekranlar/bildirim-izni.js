/* Bildirim izni (#/bildirim-izni, tam): Öğün Hatırlatıcı için sistem bildirim izni. Kalıp DD.izinIstemi (ai-kamera, ai-ses ile aynı).
 * "Bildirimlere izin ver" sistem penceresini DD.dialog ile açar: İzin ver → bildirim-izin 'verildi' + ogun-hatirlatma.acik true, geri dön, toast;
 * İzin verme → 'reddedildi', ekran reddedildi haline geçer. Reddedildi hali (?hal=red ya da izin 'reddedildi'): "Ayarları aç" telefon ayarına gider;
 * burada izni verilmiş sayar. Durum DD.ogun.izinYaz / ayarYaz üzerinden yazılır. */
(() => {
  const O = () => DD.ogun;
  const red = ctx => O().izin() === 'reddedildi' || ctx.sorgu.hal === 'red';
  const istem = ctx => {
    const s = O().sessiz()?.split('-');
    return DD.izinIstemi({
      gorsel: 'assets/gorsel/hero/ritim-sofra.webp', ikon: 'bildirim',
      baslik: 'Öğün saatin gelince haber verelim',
      metin: 'Öğün hatırlatması için **bildirim iznine** ihtiyaç var. Yalnız senin seçtiğin saatlerde gelir.',
      maddeler: [
        ['saat', 'Öğün saatin gelince haber', 'Seçtiğin kadar önce, kilit ekranında.'],
        ['moon', 'Sessiz saatlerde susar', s ? `${O().noktali(s[0])}–${O().noktali(s[1])} arası bildirim gelmez.` : 'Sessiz saatleri ayarlardan seçebilirsin.'],
        ['toggle-off', 'İstediğin an kapatırsın', 'Öğün saatlerim’den tek dokunuşla.']
      ],
      izin: 'Bildirimlere izin ver',
      red: red(ctx),
      reddedildi: {baslik: 'Bildirim izni kapalı', metin: 'Telefonunun **Ayarlar › Bildirimler** bölümünden Dada Diet bildirimlerini açabilirsin. Öğünlerin Profil’de yine sıralanır.'}
    });
  };
  const ac = () => {
    O().izinYaz('verildi');
    O().ayarYaz({acik: true});
    DD.geri('#/profil');
    DD.toast('**Öğün hatırlatıcın** açıldı; saati gelen öğün bildirimle gelir', {tur: 'basari', ikon: 'bildirim'});
  };

  DD.ekran('bildirim-izni', {
    tur: 'tam',
    ust: '#/profil',
    ciz: ctx => istem(ctx).html,
    altBar: ctx => istem(ctx).bar,
    sonra: (kok, ctx) => {
      const tik = ev => {
        if (ev.target.closest('[data-izin-ayar]')) { ac(); return; }
        if (!ev.target.closest('[data-izin-ver]')) return;
        DD.dialog({baslik: '“Dada Diet” sana bildirim göndermek istiyor', metin: 'Bildirimler **uyarı, ses ve simge** içerebilir. Bunu Ayarlar’dan değiştirebilirsin.', eylem: 'İzin ver', iptal: 'İzin verme'}).then(evet => {
          if (evet) { ac(); return; }
          O().izinYaz('reddedildi');
          DD.tazele();
        });
      };
      kok.addEventListener('click', tik);
      return () => kok.removeEventListener('click', tik);
    }
  });
})();
