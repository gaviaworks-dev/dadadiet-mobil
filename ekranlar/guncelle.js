/* Zorunlu güncelleme (#/guncelle): desteklenmeyen sürümde uygulama yalnız bu ekranı açar. Ortak DD.durumSahne; kapatma yok, geri yok.
 * Mağaza bağlantısı gerçek üründe platforma göre (App Store / Google Play) verilir. */
(() => {
  DD.ekran('guncelle', {
    haller: false,
    tur: 'tam',
    tabagim: false,
    ciz: () => DD.durumSahne({isaret: 'circle-up', baslik: 'Yeni sürüm hazır', metin: 'Kullandığın sürüm artık desteklenmiyor. Devam etmek için **Dada Diet’i güncelle**.', ipucuBaslik: 'Bilmen gerekenler', ipuclari: [['shield-halved', 'Kayıtların korunur', 'Güncelleme bu cihazdaki kayıtlarını silmez.'], ['user', 'Oturumun açık kalır', 'Güncellemeden sonra kaldığın yerden devam edersin.']], ana: {metin: 'Mağazada güncelle', ikon: 'arrow-up-right-from-square', veri: {eylem: 'magaza'}}, ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]}),
    sonra: kok => DD.eylem(kok, 'magaza', () => DD.toast('Mağaza sayfası açılıyor', {ikon: 'circle-up'}))
  });
})();
