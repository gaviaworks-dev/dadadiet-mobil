/* Erişim yok (#/yetki-yok): Gastro sistem.js yetki-yok eşi. Ortak DD.durumSahne; tur 'tam', haller: false.
 * ?tur=baska-hesap&mod=dogrula|sifre|sil (&eposta=<bağlantının hesabı>): e-postadaki bağlantı başka hesaba ait. "Çıkış yap ve devam et" DD.dialog onayıyla DD.cikis,
 *   "Bu hesapta kal" #/bugun. Çıkıştan sonra bağlantının sayfası açılır (DD.cikis(hedef)): doğrula → e-posta doğrulama (?eposta taşınır), şifre → yeni şifre adımı, sil → Bugün (silme oturum ister).
 * tur yoksa: genel erişim yok (bu bölüm bu hesaba kapalı). */
(() => {
  const MOD = {
    dogrula: {metin: 'E-posta doğrulama bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Doğrulama bu yüzden tamamlanmadı.'},
    sifre: {metin: 'Şifre sıfırlama bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Yeni şifre ekranı bu yüzden açılmadı.'},
    sil: {metin: 'Hesap silme onay bağlantısını açtın ama şu an **farklı bir hesapla** giriş yapmış durumdasın. Açık olan hesabında hiçbir şey değişmedi.'}
  };
  const HEDEF = {dogrula: '#/eposta-dogrula', sifre: '#/sifre-sifirla?adim=yeni', sil: '#/bugun'};
  const simdiki = () => (DD.uye() ? DD.durum.oku('hesap-ayar', {})?.profil?.eposta || DDV.hesap.giris.eposta : 'Bu cihazdaki hesap');
  DD.ekran('yetki-yok', {
    haller: false,
    tur: 'tam',
    tabagim: false,
    ciz: ctx => {
      if (ctx.sorgu.tur === 'baska-hesap') {
        const m = MOD[ctx.sorgu.mod] || MOD.dogrula;
        return DD.durumSahne({isaret: 'arrow-right-arrow-left', baslik: 'Bu bağlantı başka bir hesaba ait', metin: m.metin, ipucuBaslik: 'Hesaplar', ipucuParcali: true, ipuclari: [['user', 'Şu an açık olan hesap', simdiki()], ['envelope', 'Bağlantının ait olduğu hesap', ctx.sorgu.eposta || 'E-postandaki hesap']], ana: {metin: 'Çıkış yap ve devam et', ikon: 'right-from-bracket', veri: {eylem: 'cikis-devam'}}, ikinciller: [{metin: 'Bu hesapta kal', ikon: 'house', yerine: '#/bugun'}]});
      }
      return DD.durumSahne({isaret: 'user-lock', baslik: 'Bu bölüm sana kapalı', metin: 'Bu içerik **açık olan hesabına** tanımlı değil. Yanlış hesapla girmiş olabilirsin.', ipucuBaslik: 'Olası sebepler', ipuclari: [['user', 'Farklı bir hesap', 'Doğru hesapla giriş yaptığında bu bölüm açılır.'], ['link', 'Başkasının bağlantısı', 'Bağlantı sana başka bir hesaptan gönderilmiş olabilir.']], ana: {metin: 'Bugün’e dön', ikon: 'house', yerine: '#/bugun'}, ikinciller: [{metin: 'Yardım al', ikon: 'circle-question', git: '#/cozum-merkezi'}]});
    },
    sonra: (kok, ctx) => DD.eylem(kok, 'cikis-devam', () => {
      const mod = HEDEF[ctx.sorgu.mod] ? ctx.sorgu.mod : 'dogrula', donus = mod === 'sil' ? 'Çıkıştan sonra bağlantıyı **doğru hesapla** yeniden açabilirsin.' : 'Çıkıştan sonra **bağlantının sayfası** açılır.';
      return DD.dialog({baslik: 'Çıkış yapılsın mı?', metin: `Bu cihazdaki **kayıtların ve tercihlerin** silinir. ${donus}`, eylem: 'Çıkış yap', iptal: 'Vazgeç'}).then(ok => { if (ok) DD.cikis(mod === 'dogrula' && ctx.sorgu.eposta ? `${HEDEF.dogrula}?eposta=${encodeURIComponent(ctx.sorgu.eposta)}` : HEDEF[mod]); });
    })
  });
})();
