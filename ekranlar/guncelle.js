/* Güncelleme (#/guncelle): Gastro sistem.js guncelleme eşi. Ortak DD.durumSahne; tur 'tam'.
 * Zorunlu (varsayılan): desteklenmeyen sürümde uygulama yalnız bu ekranı açar; kapatma yok, geri yok.
 * ?tur=istege-bagli: yeni sürüm var ama zorunlu değil; "Şimdi değil" ikincil düğmesi geri döner.
 * Mağaza bağlantısı gerçek üründe platforma göre (App Store / Google Play) verilir. */
(() => {
  const IPUCLARI = [['shield-halved', 'Kayıtların korunur', 'Güncelleme bu cihazdaki kayıtlarını silmez.'], ['user', 'Oturumun açık kalır', 'Güncellemeden sonra kaldığın yerden devam edersin.']];
  const ANA = {metin: 'Mağazada güncelle', ikon: 'arrow-up-right-from-square', veri: {eylem: 'magaza'}};
  DD.ekran('guncelle', {
    haller: false,
    tur: 'tam',
    tabagim: false,
    ciz: ctx => ctx.sorgu.tur === 'istege-bagli'
      ? DD.durumSahne({isaret: 'circle-up', baslik: 'Yeni sürüm hazır', metin: 'Dada Diet’in yeni sürümünü yükleyebilirsin. **Şimdi değil** dersen bu sürümle devam edersin.', ipucuBaslik: 'Bilmen gerekenler', ipuclari: IPUCLARI, ana: ANA, ikinciller: [{metin: 'Şimdi değil', geri: true}]})
      : DD.durumSahne({isaret: 'circle-up', baslik: 'Güncellemen gerekiyor', metin: 'Kullandığın sürüm artık desteklenmiyor. Devam etmek için **Dada Diet’i güncelle**.', ipucuBaslik: 'Bilmen gerekenler', ipuclari: IPUCLARI, ana: ANA, ikinciller: []}),
    sonra: kok => DD.eylem(kok, 'magaza', () => DD.toast('Mağaza sayfası açılıyor', {ikon: 'circle-up'}))
  });
})();
