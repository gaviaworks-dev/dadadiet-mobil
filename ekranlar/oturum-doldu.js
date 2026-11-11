/* Oturum süresi doldu (#/oturum-doldu): Gastro sistem.js oturum-doldu eşi. Ortak DD.durumSahne; geri yok (tur 'tam', geri düğmesi yok).
 * ?eposta=<adres> giriş formuna taşınır; yoksa hesap-ayar.profil.eposta, o da yoksa DDV.hesap.giris.eposta. Tekrar giriş: #/giris?eposta=<adres>. */
(() => {
  const eposta = ctx => ctx.sorgu.eposta || DD.durum.oku('hesap-ayar', {})?.profil?.eposta || (DD.yeniHesap() ? '' : DDV.hesap.giris.eposta);
  DD.ekran('oturum-doldu', {
    haller: false,
    tur: 'tam',
    tabagim: false,
    ciz: ctx => {
      const ep = eposta(ctx);
      return DD.durumSahne({isaret: 'hourglass-end', baslik: 'Oturumun sona erdi', metin: ep ? `Güvenliğin için oturumunu kapattık. **${ep}** ile tekrar giriş yap, kaldığın yerden devam et.` : 'Güvenliğin için oturumunu kapattık. **Tekrar giriş yap**, kaldığın yerden devam et.', ipucuBaslik: 'Kayıtların duruyor', ipuclari: [['mobile-screen', 'Kayıtların bu cihazda', 'Oturumun kapanması bu cihazdaki kayıtlarını silmez.'], ['right-to-bracket', 'Aynı hesapla gir', 'Aynı e-postayla giriş yaptığında kayıtlarına ulaşırsın.']], ana: {metin: 'Tekrar giriş yap', ikon: 'right-to-bracket', yerine: (ep ? `#/giris?eposta=${encodeURIComponent(ep)}` : '#/giris')}, ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]});
    }
  });
})();
