/* Bakım modu (#/bakim): sunucu bakımdayken açılış bu ekrana düşer. Ortak DD.durumSahne; dönüş saati sunucudan gelir (prototipte şimdi + 1 sa).
 * ?hal=sure-yok: sunucu dönüş saati vermediğinde saat yazılmaz. */
(() => {
  const donus = () => { const t = DD.simdi(); t.setHours(t.getHours() + 1, 0, 0, 0); return t.toTimeString().slice(0, 5).replace(':', '.'); };
  DD.ekran('bakim', {
    haller: false,
    tur: 'tam',
    tabagim: false,
    ciz: ctx => DD.durumSahne({isaret: 'screwdriver-wrench', baslik: 'Kısa bir bakımdayız', metin: ctx.sorgu.hal === 'sure-yok' ? 'Dada Diet’i iyileştiriyoruz. **Dönüş saati henüz belli değil**; kayıtların güvende.' : `Dada Diet’i iyileştiriyoruz. **Tahmini dönüş ${donus()}**; kayıtların güvende.`, ipucuBaslik: 'Bu sırada', ipuclari: [['mobile-screen', 'Kayıtların bu cihazda', 'Bakım bitince kendiliğinden eşitlenir.']], ana: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/bugun'}, ikinciller: []})
  });
})();
