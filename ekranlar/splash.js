/* Splash (#/splash): Gastro açılış kolajı, DD.acilis. Referans: tasks/referanslar.md Splash satırları. Dokununca hemen geçer.
 * Oturum varsa Bugün; kayıt olup onboarding'i yarıda bırakan kaldığı adıma, değilse Karşılama. */
(() => {
  const KOLAJ = 15;
  const hedef = () => {
    if (DD.durum.oku('oturum')) return '#/bugun';
    return DD.durum.oku('onboarding')?.giris ? '#/onboarding/sonuc' : '#/karsilama';
  };

  DD.ekran('splash', {
    tur: 'tam',
    tabagim: false,
    ciz: () => DD.acilis({gorseller: DDV.programlar.slice(0, KOLAJ).map(p => p.kapak)}),
    sonra: kok => {
      const gec = () => DD.acilisCik(kok, () => DD.yerine(hedef()));
      const zaman = setTimeout(gec, DD.TK.motion.reveal * 5), bag = DD.eylem(kok, 'gec', gec);
      return () => { clearTimeout(zaman); bag(); };
    }
  });
})();
