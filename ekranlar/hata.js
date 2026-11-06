/* Hata (#/hata). Gastro DG.durumSahne; referans: tasks/referanslar.md Hata (Open Food Facts ton, stoic. sade yapı, Speak kayıtlı veri).
 * ?tur=baglanti|genel|zaman|bulunamadi. Bilinmeyen rota çekirdekten tur=bulunamadi ile gelir. Bağlantı halinde çevrimdışı şeridi ve bu cihazda kayıtlı özet görünür.
 */
(() => {
  // Şerit yapışkandır ama üst barlı ekranda kaydırıcı dolgusuyla iki kat iner; kabı onu yerinde tutar.
  const {sayi, ondalik} = DD;
  const TURLER = ['baglanti', 'genel', 'zaman', 'bulunamadi'];
  const BASLIK = {baglanti: 'Bağlantı', genel: 'Hata', zaman: 'Bağlantı', bulunamadi: 'Sayfa'};
  const turBul = ctx => (TURLER.includes(ctx.sorgu.tur) ? ctx.sorgu.tur : 'genel');
  const kayitli = () => {
    const k = DDV.kullanici, plan = DD.durum.oku('plan', null);
    return [{etiket: 'Günlük hedef', deger: sayi(plan?.hedefKcal ?? k.hedefKcal), birim: 'kcal', ikon: 'kalori'}, {etiket: 'Su hedefi', deger: ondalik((plan?.suMl ?? k.suHedefMl) / 1000, 1), birim: 'litre', ikon: 'su', ton: 'bilgi'}, {etiket: 'Seri', deger: sayi(k.seri), birim: 'gün', ikon: 'takvim'}].map(DD.metrikKart);
  };

  DD.ekran('hata', {
    tur: 'alt',
    baslik: ctx => BASLIK[turBul(ctx)],
    tabagim: false,
    ciz: ctx => {
      const tur = turBul(ctx);
      if (tur === 'bulunamadi') return DD.hataEkran({tur, eylem: {metin: 'Bugün’e dön', ikon: 'house', yerine: '#/bugun'}});
      const eylem = {metin: 'Tekrar dene', ikon: 'yenile', veri: {eylem: 'tekrar'}};
      return tur === 'baglanti' ? `<div>${DD.cevrimdisi()}</div>${DD.hataEkran({tur, eylem, oneriler: kayitli(), onerilerBaslik: 'Bu cihazda kayıtlı'})}` : DD.hataEkran({tur, eylem});
    },
    sonra: kok => DD.eylem(kok, 'tekrar', el => DD.mesgul(el).then(() => DD.geri('#/bugun')))
  });
})();
