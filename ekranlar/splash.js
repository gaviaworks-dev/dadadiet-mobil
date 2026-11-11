/* Splash (#/splash): Gastro açılış kolajı, DD.acilis. Referans: tasks/referanslar.md Splash satırları. Dokununca hemen geçer.
 * Kayıt zorunlu değil: oturum yoksa misafir olarak Bugün açılır; onboarding'i yarıda bırakan kaldığı adıma döner. */
(() => {
  const KOLAJ = 15;
  const hedef = () => {
    if (DD.durum.oku('oturum')) return '#/bugun';
    return DD.durum.oku('onboarding')?.giris ? '#/onboarding/sonuc' : '#/bugun';
  };

  DD.ekran('splash', {
    haller: false,   // akış ekranı: ?hal= durum halleri uygulanmaz
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
