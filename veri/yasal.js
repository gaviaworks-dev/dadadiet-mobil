/* veri/yasal.js — yasal metinler ve kurumsal sayfalar (Paket 1, 1b).
 * Kaynak: web dadadiet-prototip yasal/<slug>/index.html ve sayfa/{hakkimizda,iletisim,kunye,sss}/index.html (başlık, sürüm satırı, bölüm başlıkları, paragraflar, maddeler);
 *   Paket 1b: sayfa/{bilimsel-kaynaklar,editoryal-kurul,nasil-calisir,saglik-bilgilendirmesi,uzmanla-calisma-rehberi}, diyetisyen-ol/ (_src/sayfalar/public-beslenme/kurumsal.mjs, public-araclar/diyetisyen-ol.mjs, metin.json).
 * Metin değiştirilmedi. Satır içi yalnız <strong>, <em>, <code>, <a href="#/...">; web bağlantısı uygulamada ekranı olan adrese çevrildi (1b: Bilimsel Kaynaklar, Editoryal Kurul, Diyetisyen Ol da); karşılığı olmayan düz metin kaldı.
 * Şirket bilgisi (karar 4, 11 Kasım): Gastro'daki gibi yalnız üç alan doldu: [unvan], [adres], [e-posta] (DadaGastro app/Servisler/Kurumsal/YasalKurumsalBilgiler.php:9-11;
 *   Gastro mobil v3-app ortak/veri/icerik.js aynı değerler). Diet web footer'ı aynı unvanı kullanır (dadadiet-prototip _src/kabuk/kabuk.mjs:95, DadaDiet resources/lang/tr/arayuz_footer_a106.php:9).
 *   MERSİS, vergi, KEP, telefon, yasal temsilci vb. Gastro'da da [yer tutucu]; ekran yer tutucu içeren satırı/cümleyi hiç çizmez (ekranlar/yasal.js temizle).
 * 11 Kasım: "Durum: Taslak" uyarıları (künye, bilimsel kaynaklar) kaldırıldı; Sağlık Verisi Politikası 1.1 bağlı sağlık uygulamalarını (Apple Sağlık, Health Connect)
 *   kapsar (§2, §3, §4.5-4.6, §5, §6, §8-§10; kaynak tasks/entegrasyon/backend-plan.md §1.6, §4.1, §5 ve rapor-E5.md). Saklama süresi yazılmadı (açık kalem).
 *
 * DDV.yasal: {
 *   dizin: { baslik, alt, giris, ayak, gruplar:[{ baslik, kalemler:[{ slug } | { ad, ikon, git }] }] }   // web yasal/index.html; { git } kalemi DDV.kurumsal[<rota>] belgesini gösterir (kunye, bilimsel-kaynaklar)
 *   metinler: { <slug>: { baslik, ikon, surum, tarih (iso, web bant), yururluk (iso|null), guncelleme (iso|null), uyari?:{baslik, metin}, ayak, bloklar:[[tur, html | [li html]]] } }
 *     tur: 'h2' bölüm başı, 'h3' alt başlık, 'p', 'ul', 'ol'. Slug'lar sabit: kvkk, gizlilik, cerez, kullanim-kosullari, saglik-verisi, tibbi-sorumluluk-reddi, diyetisyen-dogrulama
 * }
 * DDV.kurumsal: { hakkimizda, iletisim (form alanları ve konular web formuyla aynı), kunye (metinler biçiminde), sss (web sayfa/sss: 1 kategori, 3 soru),
 *   'bilimsel-kaynaklar' (metinler biçiminde), 'editoryal-kurul', 'nasil-calisir', 'saglik-bilgilendirmesi', 'uzmanla-calisma', 'diyetisyen-ol' (başvuru formu alanları, süreç, SSS, gönderildi metni) }
 */
window.DDV = window.DDV || {};
DDV.yasal = {
 dizin: {
  baslik: 'Yasal Metinler',
  alt: 'Her metnin başında yürürlük sürümü ve son güncelleme tarihi bulunur.',
  giris: 'Dada Diet’i kullanırken geçerli olan sözleşmeler, sağlık içeriği ve tıbbi sorumluluk metinleri ile sağlık verisi ve gizlilik politikaları burada toplanır. Metinler dört başlık altında gruplanmıştır.',
  ayak: 'Bu metinler bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.',
  gruplar: [
   {baslik: 'A. Sözleşmeler ve Kullanım', kalemler: [{slug: 'kullanim-kosullari'}]},
   {baslik: 'B. Sağlık İçeriği ve Tıbbi Sorumluluk', kalemler: [{slug: 'tibbi-sorumluluk-reddi'}, {ad: 'Bilimsel Kaynaklar ve Metodoloji', ikon: 'flask', git: '#/bilimsel-kaynaklar'}]},
   {baslik: 'C. Sağlık Verisi, Gizlilik ve Güvenlik', kalemler: [{slug: 'saglik-verisi'}, {slug: 'gizlilik'}, {slug: 'kvkk'}, {slug: 'cerez'}]},
   {baslik: 'D. Uzman İlişkisi, Ticari ve Şeffaflık', kalemler: [{slug: 'diyetisyen-dogrulama'}, {ad: 'Künye', ikon: 'id-card', git: '#/kunye'}]}
  ]
 },
 metinler: {
 "kullanim-kosullari": {
  baslik: "Kullanım Koşulları", ikon: "file-contract", surum: "1.1", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-11-11",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Taraflar ve Konu"],
   ["p", "İşbu Kullanım Koşulları; DadaDiet platformunu işleten Dada İst Ajans Hizmetleri Ticaret Limited Şirketi (\"<strong>DadaDiet</strong>\" veya \"<strong>Platform</strong>\") ile Platform'u ziyaret eden, üye olan veya Platform üzerinden hizmet alan gerçek kişi (\"<strong>Kullanıcı</strong>\") arasındaki ilişkiyi düzenler. Platform'u kullanmaya devam ederek bu koşulları kabul etmiş sayılırsınız."],
   ["p", "Bu metin; <a href=\"#/yasal/tibbi-sorumluluk-reddi\">Tıbbi Sorumluluk Reddi</a>, <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> ve Platformun Rolü ve Aracılık Bildirimi metinlerine atıf yapar ve onlarla birlikte bir bütün oluşturur."],
   ["h2", "2. Tanımlar"],
   ["ul", ["<strong>Hesaplayıcı</strong> — Kullanıcının girdiği ölçü ve bilgilerden referans denklemlerle tahmini bir sonuç üreten araç.", "<strong>Program</strong> — Platform'da yayımlanan örnek nitelikteki beslenme içeriği ve takip planı.", "<strong>Rehber içerik</strong> — Beslenme ve besin bilgisine ilişkin editoryal yazı ve besin kütüphanesi kayıtları.", "<strong>Sağlık verisi</strong> — Boy, kilo, vücut ölçüleri, hedefler, öğün kayıtları ve diyetisyene aktarılan sağlık geçmişi.", "<strong>Uzman</strong> — Platform üzerinde doğrulanmış, bağımsız meslek mensubu diyetisyen."]],
   ["h2", "3. Platform'un Niteliği"],
   ["p", "<strong>DadaDiet bir sağlık kuruluşu değildir ve sağlık hizmeti sunmaz.</strong> Platform; hesaplayıcı, rehber içerik ve beslenme programı yayımlar ve kullanıcı ile bağımsız diyetisyeni buluşturan aracılık, randevu ve altyapı hizmeti verir. Bu ayrımın kapsamı Platformun Rolü ve Aracılık Bildirimi'nde düzenlenmiştir."],
   ["p", "Platform'da yayımlanan içerikler genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir ve teşhis veya tedavi yerine geçmez. Sınırların tamamı <a href=\"#/yasal/tibbi-sorumluluk-reddi\">Tıbbi Sorumluluk Reddi</a>'ndedir."],
   ["h2", "4. Hesap Açma ve Hesabın Kullanımı"],
   ["ul", ["Üyelik sırasında verilen bilgilerin doğru ve güncel olması Kullanıcı'nın sorumluluğundadır.", "Hesap kişiseldir; giriş bilgilerinin gizliliğinden ve hesap üzerinden yapılan işlemlerden Kullanıcı sorumludur.", "Sağlık verisi barındıran bir hesapta iki adımlı doğrulamanın açılması önerilir; ayarları \"Giriş ve Güvenlik\" bölümündedir.", "Yetkisiz erişim şüphesinde Kullanıcı derhal <strong>dadamentorcom@gmail.com</strong> adresine bildirimde bulunur.", "Üyelik için asgari yaş ve küçüklere ilişkin kurallar Yaş Sınırı ve Küçüklerin Korunması metnindedir."]],
   ["h2", "5. Onayların Ayrı Alınması"],
   ["p", "DadaDiet'te onaylar tek kutuda toplanmaz. <strong>Üyelik onayı, sağlık verisi rızası, uzmanla paylaşım rızası ve pazarlama izni dört ayrı onaydır</strong>; ayrı ayrı verilir, ayrı ayrı kaydedilir ve ayrı ayrı geri çekilebilir. Tek kutuda birleştirilen rıza geçersiz sayılır."],
   ["ul", ["<strong>Zorunlu:</strong> Kullanım Koşulları ve <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a>'nın kabulü.", "<strong>İsteğe bağlı ve ayrı:</strong> sağlık verisinin diyetisyenle paylaşılması izni — hesabınızın \"Veri izinlerim\" bölümünde veri türü bazında ayrı anahtarlar; bütün türler varsayılan olarak kapalıdır.", "<strong>İsteğe bağlı ve ayrı:</strong> pazarlama iletileri izni — Ayarlar › Bildirim tercihleri bölümünde kanal kanal ayrı anahtarlar.", "<strong>İsteğe bağlı ve ayrı:</strong> sağlık verisinin işlenmesine ilişkin açık rıza — bkz. Açık Rıza Metni. Bu rıza üyelik onayından ayrı bir adımda istenir ve \"Veri izinlerim\" bölümünde ayrı bir anahtar olarak durur; sağlık uygulamalarından veri okunması buna bağlı ayrı bir kapsamdır ve ayrıca onaylanır."]],
   ["p", "<strong>Rıza vermemek Platform'u kullanmanıza engel değildir:</strong> izin vermeden de rehberleri okuyabilir, programları inceleyebilirsiniz. Kabul ettiğiniz metnin sürümü ve kabul tarihi kaydedilir. Verdiğiniz ve geri aldığınız izinler tarihleriyle <strong>\"Veri izinlerim\"</strong> bölümündeki <strong>İzin hareketleri</strong>nde görünür; onaylanan metnin sürüm ayrıntısını <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a> §11'deki adrese başvurarak öğrenebilirsiniz."],
   ["h2", "6. Sağlık Verisi"],
   ["p", "Boy, kilo, vücut ölçüleri, hedefler, öğün kayıtları ve diyetisyene aktardığınız sağlık geçmişi özel nitelikli kişisel veridir ve genel kişisel veriden ayrı bir rejime tabidir. İşleme amaçları, saklama süreleri, uzmanla paylaşım koşulları ve bu veriler üzerindeki kontrolünüz <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>'nda düzenlenmiştir."],
   ["h2", "7. Hesaplayıcılar ve Programlar"],
   ["p", "Hesaplama sonuçları tahmini değerlerdir ve referans denklemlere dayanır; program menüleri örnek niteliktedir ve kişiye uyarlanması gerekir. Her hesaplayıcının sınırlılıkları Hesaplayıcı Sınırlılıkları Bildirimi'nde, kullanılan referans denklemler ve besin değeri kaynakları <a href=\"#/bilimsel-kaynaklar\">Bilimsel Kaynaklar ve Metodoloji</a>'de açıklanmıştır."],
   ["p", "Gebelik ve emzirme, kronik hastalık, düzenli ilaç kullanımı, çocuk ve ergen beslenmesi ile klinik bir durumun varlığı hâlinde programa başlamadan önce hekim ve diyetisyen kontrolü zorunludur — bkz. Hassas Gruplar ve Kontrendikasyon Bildirimi."],
   ["h2", "8. Uzman Hizmetleri"],
   ["p", "Platform üzerinde listelenen diyetisyenler bağımsız meslek mensubudur, Platform çalışanı değildir. Kişiye özel beslenme planı yalnızca yetkili diyetisyen tarafından hazırlanabilir ve mesleki sorumluluk uzmandadır. Doğrulama esasları <a href=\"#/yasal/diyetisyen-dogrulama\">Diyetisyen Doğrulama ve Kabul Politikası</a>'nda, sorumluluk sınırı Platformun Rolü ve Aracılık Bildirimi'ndedir."],
   ["h2", "9. Yasak Kullanımlar"],
   ["ul", ["Platform içeriğinin otomatik araçlarla toplu olarak çekilmesi, kopyalanması veya türev bir hizmette kullanılması.", "Platform içeriğinin tıbbi tavsiye, teşhis veya tedavi olarak sunulması ya da bu izlenimi verecek şekilde yeniden yayımlanması.", "Başkasına ait sağlık verisinin, o kişinin bilgisi ve onayı olmaksızın Platform'a girilmesi.", "Uzman olmadığı hâlde uzman gibi görünmek, sahte belge sunmak veya doğrulama sürecini yanıltmak.", "Platform'un güvenlik önlemlerini aşmaya yönelik girişimler ve hizmeti aksatacak yükleme oluşturmak.", "Üçüncü kişilerin kişilik, telif veya marka haklarını ihlal eden içerik yüklemek."]],
   ["h2", "10. Ücretli Hizmetler"],
   ["p", "Platform'un temel kullanımı ücretsizdir. Pro üyelik, randevu ücreti ve benzeri ücretli hizmetlerin koşulları ayrı bilgilendirme ve sözleşme metinleriyle düzenlenir; bu hizmetlerden yararlanmak Platform'un ücretsiz kullanımının şartı değildir."],
   ["p", "Ücretli hizmet almak, bir uzmanın doğrulama durumunu, sıralamasını veya hakkındaki bildirimlerin akıbetini değiştirmez."],
   ["h2", "11. Fikri Mülkiyet"],
   ["p", "Platform'un tasarımı, yazılımı, veri tabanı yapısı, markası ve editoryal içerikleri DadaDiet'e aittir. Kullanıcı'nın Platform'a girdiği kendi verisi Kullanıcı'ya aittir; bu verinin işlenmesi <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> ve <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a> kapsamındadır."],
   ["h2", "12. Sorumluluğun Sınırlandırılması"],
   ["p", "İçeriklerin niteliği, hesaplama sonuçlarının tahmini oluşu, program menülerinin örnek niteliği, besin değeri bilgilerinin kaynaklara göre değişebilmesi ve acil sağlık durumunda izlenecek yol <a href=\"#/yasal/tibbi-sorumluluk-reddi\">Tıbbi Sorumluluk Reddi</a>'nde düzenlenmiştir. Uzmandan kaynaklanan hususlarda sorumluluğun kimde olduğu Platformun Rolü ve Aracılık Bildirimi'nde yazılıdır."],
   ["h2", "13. Hesabın Askıya Alınması ve Sonlandırılması"],
   ["p", "Bu koşulların ihlali hâlinde içerik yayından kaldırılabilir, hesap geçici olarak askıya alınabilir veya sonlandırılabilir. Kullanıcı'nın karara itiraz hakkı saklıdır; itiraz başvuruları <strong>dadamentorcom@gmail.com</strong> adresinden yapılır ve <strong>[yanıt süresi]</strong> içinde sonuçlandırılır."],
   ["p", "Kullanıcı hesabını dilediği zaman Ayarlar › <strong>Hesabımı sil</strong> adımından kapatabilir; 30 gün içinde giriş yapmazsa hesap kalıcı olarak silinir. Hesap silindiğinde sağlık verileri kalıcı olarak silinir; uzmanla paylaşılmış veri ve görüşme kayıtları için mesleki saklama yükümlülükleri geçerli olabilir. Ayrıntı <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>'ndadır."],
   ["h2", "14. Değişiklikler ve Versiyonlama"],
   ["p", "Her metnin başında yürürlük tarihi, son güncelleme tarihi ve sürüm numarası gösterilir. Metin güncellendiğinde kayıtlı kullanıcılara bildirim gönderilir; esaslı değişiklikte yeniden onay istenir. Sağlık içeriğinde güncellik ayrıca bir güvenilirlik göstergesidir; rehber ve hesaplayıcı sayfalarında da son güncelleme tarihi gösterilir."],
   ["h2", "15. Uygulanacak Hukuk ve İletişim"],
   ["p", "Bu koşullara Türk hukuku uygulanır. Uyuşmazlıklarda <strong>[yetkili mahkeme ve icra daireleri]</strong> yetkilidir."],
   ["ul", ["<strong>Unvan:</strong> Dada İst Ajans Hizmetleri Ticaret Limited Şirketi", "<strong>Adres:</strong> Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083", "<strong>MERSİS no:</strong> [MERSİS no]", "<strong>Vergi dairesi / vergi no:</strong> [vergi dairesi / vergi no]", "<strong>KEP adresi:</strong> [KEP adresi]", "<strong>E-posta:</strong> dadamentorcom@gmail.com"]],
   ["p", "Yer sağlayıcı bilgileri <a href=\"#/kunye\">Künye / Yer Sağlayıcı Bilgisi</a> sayfasındadır."],
   ["h2", "16. İlgili Metinler"],
   ["ul", ["<a href=\"#/yasal/tibbi-sorumluluk-reddi\">Tıbbi Sorumluluk Reddi</a>", "<a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>", "Platformun Rolü ve Aracılık Bildirimi", "Yaş Sınırı ve Küçüklerin Korunması"]]
  ]
 },
 "tibbi-sorumluluk-reddi": {
  baslik: "Tıbbi Sorumluluk Reddi", ikon: "stethoscope", surum: "1.0", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-10-28",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Özet Uyarı"],
   ["p", "<strong>Bu sitedeki hesaplayıcı, test, rehber ve program içerikleri genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir, teşhis veya tedavi yerine geçmez. Gebelik, kronik hastalık, düzenli ilaç kullanımı veya çocuk beslenmesi durumunda hekim ve diyetisyen kontrolü zorunludur.</strong>"],
   ["p", "Bu uyarı Platform'un tüm sayfalarında kalıcı olarak gösterilir. Aşağıdaki bölümler, uyarının kapsamını ayrıntılandırır."],
   ["h2", "2. İçeriklerin Niteliği"],
   ["p", "Platform'da yayımlanan hesaplayıcı sonuçları, testler, rehber yazılar, besin bilgileri ve beslenme programları <strong>genel bilgi amaçlıdır</strong>. Bu içerikler kişiye özel tıbbi veya beslenme önerisi değildir; kişinin yaşı, sağlık durumu, kullandığı ilaçlar ve klinik geçmişi dikkate alınarak hazırlanmamıştır."],
   ["h2", "3. Teşhis ve Tedavi Yerine Geçmez"],
   ["p", "Platform içeriği <strong>teşhis ve tedavi yerine geçmez</strong>; hekim veya diyetisyen muayenesinin yerini almaz. Bir hastalığın tanısı, tedavisi veya izlemi için Platform'a dayanılamaz. Mevcut bir tedaviniz varsa, Platform'daki içeriğe dayanarak tedavinizi değiştirmeyiniz."],
   ["h2", "4. Hesaplama Sonuçları Tahmini Değerlerdir"],
   ["p", "Hesaplayıcıların ürettiği sonuçlar <strong>tahmini değerlerdir ve referans denklemlere dayanır</strong>. Bu denklemler kişiler arası farklılıkları tam olarak yansıtmaz; sonuç, ölçülmüş bir değer değil, girdiğiniz verilerden türetilmiş bir tahmindir."],
   ["p", "Hangi referans denklemin kullanıldığı ve kaynağı sonuç ekranında gösterilir; ayrıntı için <a href=\"#/bilimsel-kaynaklar\">Bilimsel Kaynaklar ve Metodoloji</a> ve Hesaplayıcı Sınırlılıkları Bildirimi."],
   ["h2", "5. Program Menüleri Örnek Niteliktedir"],
   ["p", "Platform'da yayımlanan program ve menüler <strong>örnek niteliktedir ve kişiye uyarlanması gerekir</strong>. Bir programın olduğu gibi uygulanması amaçlanmamıştır; kişiye özel beslenme planı yalnızca yetkili bir diyetisyen tarafından hazırlanabilir."],
   ["h2", "6. Besin Değeri Bilgileri"],
   ["p", "Besin değeri bilgileri <strong>kaynaklara göre değişebilir</strong>. Ürünün cinsi, üretim ve pişirme yöntemi, marka ve porsiyon ölçüsü gibi etkenler değerleri değiştirir. Kullanılan veri kaynakları <a href=\"#/bilimsel-kaynaklar\">Bilimsel Kaynaklar ve Metodoloji</a>'de listelenmiştir."],
   ["h2", "7. Uygulanan Beslenme Düzeninin Sonuçları"],
   ["p", "<strong>Platform, kullanıcının uyguladığı beslenme düzeninin sonuçlarından sorumlu değildir.</strong> İçeriklerin kişinin durumuna uygun olup olmadığının değerlendirilmesi, hekim ve diyetisyen kontrolü ile yapılır. Bu değerlendirme yapılmadan uygulanan düzenin sonuçları kullanıcının kendi sorumluluğundadır."],
   ["h2", "8. Acil Sağlık Durumu"],
   ["p", "<strong>Acil sağlık durumunda Platform kullanılmaz.</strong> Böyle bir durumda doğrudan bir sağlık kuruluşuna başvurunuz. Platform bir acil yardım, danışma veya triaj hizmeti değildir ve mesajlarınıza acil müdahale sağlamaz."],
   ["h2", "9. Hassas Gruplar"],
   ["p", "Gebelik ve emzirme, kronik hastalık, düzenli ilaç kullanımı, çocuk ve ergen beslenmesi ile klinik bir durumun varlığı hâlinde programa başlamadan önce <strong>hekim ve diyetisyen kontrolü zorunludur</strong>; bu gruplara yönelik hazır programlar uygun değildir. Ayrıntı: Hassas Gruplar ve Kontrendikasyon Bildirimi."],
   ["h2", "10. Bu Uyarının Gösterildiği Yerler"],
   ["p", "Sorumluluk sınırlaması, kullanıcının içeriği tükettiği anda görünür olduğunda anlam taşır. Bu nedenle uyarı yalnızca bu sayfada değil, şu noktalarda da özet hâlinde gösterilir:"],
   ["ul", ["Tüm sayfalarda, footer'ın üstündeki kalıcı tıbbi uyarı bandında.", "Hesaplayıcı sonuç ekranlarında.", "Program sayfalarının başında."]],
   ["h2", "11. Uzman Hizmetleri Bakımından Sorumluluk"],
   ["p", "Bir diyetisyenin hazırladığı kişiye özel plan bakımından mesleki sorumluluk uzmandadır; Platform aracılık, randevu ve altyapı hizmeti verir. Bu ayrım Platformun Rolü ve Aracılık Bildirimi'nde düzenlenmiştir."],
   ["h2", "12. Bildirim Kanalı"],
   ["p", "Platform'da hatalı veya yanıltıcı olduğunu düşündüğünüz bir sağlık içeriğini <strong>dadamentorcom@gmail.com</strong> adresine bildirebilirsiniz. Bildirimler <strong>[inceleme süresi]</strong> içinde incelenir; içerik gerekiyorsa düzeltilir veya yayından kaldırılır ve sonuç gerekçesiyle bildirilir."],
   ["h2", "13. İlgili Metinler"],
   ["ul", ["Hesaplayıcı Sınırlılıkları Bildirimi", "Hassas Gruplar ve Kontrendikasyon Bildirimi", "<a href=\"#/bilimsel-kaynaklar\">Bilimsel Kaynaklar ve Metodoloji</a>", "Editoryal ve Tıbbi Denetim Politikası"]]
  ]
 },
 "saglik-verisi": {
  baslik: "Sağlık Verisi Politikası", ikon: "heart-pulse", surum: "1.4", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-11-11",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Neden Ayrı Bir Metin?"],
   ["p", "DadaDiet'te işlenen bazı veriler, KVKK kapsamında <strong>özel nitelikli kişisel veri</strong>, GDPR kapsamında <strong>sağlık verisi</strong> sayılır. Bu kategori genel kişisel veriden ayrı bir rejime tabidir; bu nedenle ayrı bir metinde düzenlenmiştir."],
   ["h2", "2. Hangi Veriler Sağlık Verisi Sayılır?"],
   ["p", "Aşağıdaki veriler sağlık verisi kapsamındadır:"],
   ["ul", ["<strong>Boy</strong>", "<strong>Kilo</strong>", "<strong>Vücut ölçüleri</strong>", "<strong>Hedefler</strong> — girdiğiniz kilo, ölçü ve beslenme hedefleri", "<strong>Öğün kayıtları</strong> — tükettiğiniz besinlere ilişkin kayıtlar", "<strong>Diyetisyene aktarılan sağlık geçmişi</strong>"]],
   ["p", "Telefonunuzdaki sağlık uygulamasını (Apple Health ya da Health Connect) bağlarsanız, bu uygulamadan okunan aşağıdaki veriler de sağlık verisi kapsamındadır:"],
   ["ul", ["<strong>Adım ve hareket</strong> — adım sayısı, aktif enerji ve egzersiz kayıtları", "<strong>Vücut ölçümleri</strong> — kilo, boy ve vücut yağ oranı", "<strong>Su</strong> — sağlık uygulamasına kaydedilmiş su tüketimi", "<strong>Uyku</strong> — uyku süresi", "<strong>Dinlenme nabzı</strong>"]],
   ["p", "Bağlantı ayarlarında izin verirseniz Platform, kendi kayıtlarınızı telefonunuzdaki sağlık uygulamasına da yazar: öğünlerinizden hesaplanan <strong>enerji ve makrolar</strong>, <strong>su</strong> ve Platform'da elle girdiğiniz <strong>kilo</strong>. Sağlık uygulamasından okunan kilo o uygulamaya geri yazılmaz. Yazılan kayıtlar telefonunuzdaki sağlık uygulamasında durur ve orada o uygulamanın kendi koşullarına tabidir."],
   ["p", "Bu verilerden üretilen hesaplama sonuçları ve bunlara dayalı program eşleştirmeleri de aynı rejime tabidir."],
   ["h2", "3. Bu Veri Nasıl Doğuyor?"],
   ["ul", ["Sağlık verisi Platform'da iki yolla doğar: <strong>bir forma kendi elinizle girmenizle</strong> ya da <strong>bağladığınız sağlık uygulamasından, bunun için ayrıca verdiğiniz açık rızayla okunmasıyla</strong>. Ölçülerinizi girmediğiniz ve bir sağlık uygulaması bağlamadığınız sürece bu kategoride hiçbir kaydınız oluşmaz.", "Girdiğiniz veri, girdiğiniz aracın amacıyla sınırlı olarak işlenir ve <strong>hesabınızın dışına çıkarılmaz</strong>.", "Sağlık uygulamasından yalnızca bağlantı ayarlarında açtığınız veri türleri okunur; kapattığınız tür okunmaz. Her kayıt kaynağını taşır: elle girdiğiniz kayıt <strong>\"elle\"</strong>, sağlık uygulamasından gelen kayıt <strong>\"cihazdan\"</strong> olarak işaretlenir ve bu işaret sonradan değişmez.", "<strong>Açık rıza adımı:</strong> elle girdiğiniz sağlık verisinin hesabınızda işlenmesi için açık rızanız, üyelik onayından ayrı bir adımda istenir ve <strong>\"Veri izinlerim\"</strong> bölümünde ayrı bir anahtar olarak durur. Rıza vermezseniz kayıtlarınız yalnız kullandığınız cihazda kalır ve hesabınıza aktarılmaz. Sağlık uygulamasından veri okunması bu rızaya bağlı ayrı bir kapsamdır ve ayrıca onaylanır (§4.6).", "<strong>Kritik kural:</strong> sağlık verisine ilişkin açık rıza, üyelik sözleşmesi onayıyla aynı kutuda alınamaz. Rıza özgür iradeye dayanmalı, ayrı ve anlaşılır biçimde sunulmalı, hizmetin kullanımının koşulu hâline getirilmemelidir. <strong>Tek kutuda birleştirilen rıza geçersiz sayılır.</strong>"]],
   ["h2", "4. İşleme Amaçları — Her Amaç Ayrı"],
   ["p", "Sağlık veriniz yalnızca aşağıdaki amaçlarla işlenir ve her amaç ayrı ayrı bildirilir:"],
   ["h3", "4.1 Hesaplama"],
   ["p", "Girdiğiniz ölçülerden referans denklemlerle tahmini sonuç üretilmesi. Sonuçların niteliği ve sınırları Hesaplayıcı Sınırlılıkları Bildirimi'ndedir."],
   ["h3", "4.2 Program eşleştirme"],
   ["p", "Girdiğiniz bilgilere göre Platform'daki örnek programların önerilmesi."],
   ["h3", "4.3 Takip"],
   ["p", "Hesaplama geçmişinin ve öğün kayıtlarının hesabınızda saklanarak zaman içinde görüntülenebilmesi."],
   ["h3", "4.4 Uzman paylaşımı"],
   ["p", "Verinin, izin verdiğiniz diyetisyenle paylaşılması. Bu izin hesabınızın <strong>\"Veri izinlerim\"</strong> bölümünde veri türü bazında ayrı anahtarlar olarak durur. <strong>Bütün veri türleri, sağlık uygulamalarından okunanlar dâhil, varsayılan olarak kapalıdır</strong>; paylaşım yalnız sizin tek tek açtığınız türler için başlar. Hangi türün açık olduğunu orada görür, istediğinizi istediğiniz an kapatırsınız."],
   ["h3", "4.5 Sağlık uygulamalarından okunan veri"],
   ["p", "Bağladığınız sağlık uygulamasından okunan veriler; günlük takibinizin ve ölçüm geçmişinizin tamamlanması (örneğin adım ve aktif enerjinin gününüzde, kilonun ölçüm geçmişinizde görünmesi) ve ayrıca izin vermeniz hâlinde diyetisyeninizle paylaşılması amacıyla işlenir. Nabız ve uyku verisi tanı ya da uyarı amacıyla yorumlanmaz."],
   ["h3", "4.6 Açık rıza ve geri alma"],
   ["p", "Sağlık uygulamasından veri okunması, bu iş için <strong>ayrıca verdiğiniz açık rızayla</strong> başlar. Bu rıza üyelik onayından ve diğer izinlerden ayrı alınır; vermemeniz Platform'un geri kalanını kullanmanızı engellemez. Rızanızı <strong>\"Veri izinlerim\"</strong> bölümünden ya da telefonunuzun sağlık ayarlarından istediğiniz an geri alabilirsiniz; geri almak vermek kadar kolaydır. Geri alma ileriye etkilidir; hangi metni ne zaman onayladığınızın kaydı silinmez."],
   ["p", "Bu amaçların dışında — örneğin profil çıkarma, reklam hedefleme veya üçüncü taraflara satış amacıyla — sağlık veriniz işlenmez. <strong>Sağlık uygulamalarından okunanlar dâhil sağlık veriniz reklam ya da pazarlama için kullanılmaz ve satılmaz.</strong>"],
   ["h2", "5. Uzmanla Paylaşım"],
   ["p", "Diyetisyeninizle paylaşım <strong>\"Veri izinlerim\"</strong> bölümünden veri türü bazında yönetilir; süreli izin verebilir, diyetisyeninizin izin isteklerini onaylayabilir ya da reddedebilirsiniz. Paylaşımda şu kurallar uygulanır:"],
   ["ul", ["<strong>Hangi veri:</strong> yalnızca ilgili danışan ilişkisi için gerekli olan veriler paylaşılır; paylaşılacak veri kalemleri paylaşım öncesinde size gösterilir.", "<strong>Ne zaman:</strong> hiçbir veri türü kendiliğinden paylaşılmaz; paylaşım, siz bir türü açtığınız anda, yalnız o tür için ve yalnızca çalışmayı kabul ettiğiniz uzman bakımından başlar.", "<strong>Kimin onayıyla:</strong> paylaşım yalnızca sizin ayrı izninizle yapılır; uzmanın talebi tek başına yeterli değildir.", "<strong>Erişim sınırı:</strong> diyetisyen yalnızca kendisiyle çalışmayı kabul etmiş ve veri paylaşımına ayrıca izin vermiş danışanların verisini görebilir. Platform genelinde kullanıcı verisine erişim yetkisi tanımlanmaz.", "<strong>Sağlık uygulamalarından okunan veri:</strong> diyetisyeninizle yalnızca <strong>ayrı bir paylaşım izniyle</strong> paylaşılır; okuma rızası paylaşım izni sayılmaz. Hangi türlerin paylaşılacağını tek tek seçersiniz ve diyetisyeninizin göreceğini paylaşımdan önce görebilirsiniz. Paylaşılan değerler günlük değer ve dönem ortalaması düzeyindedir ve \"cihazdan\" etiketiyle gösterilir.", "<strong>Paylaşımın kaldırılması:</strong> paylaşım anahtarını \"Veri izinlerim\" bölümünden kapatabilirsiniz."]],
   ["h2", "6. Saklama Süreleri"],
   ["ul", ["<strong>Hesaplama geçmişi</strong> — [saklama süresi — hesaplama geçmişi]", "<strong>Öğün kaydı</strong> — [saklama süresi — öğün kaydı]", "<strong>Danışan dosyası</strong> — [saklama süresi — danışan dosyası]", "<strong>Görüşme kayıtları</strong> — [saklama süresi — görüşme kayıtları]"]],
   ["p", "Sağlık uygulamalarından okunan veriler, hesabınız açık kaldığı sürece ve hesap ayarlarınızdaki saklama tercihinize göre saklanır. Okuma rızanızı geri aldığınızda ya da bağlantıyı kesip bu verilerin silinmesini istediğinizde, mevzuattan doğan saklama yükümlülükleri saklı kalmak kaydıyla silinir."],
   ["p", "Sürenin sonunda veriler silinir, yok edilir veya anonim hâle getirilir. Uzmanın mesleki kayıt tutma yükümlülüğü ile silme talebiniz çakışabilir; bu çakışmanın nasıl çözüleceği §9'da ve diyetisyenle imzalanan hizmet sözleşmesinde tanımlanır."],
   ["h2", "7. Güvenlik Tedbirleri"],
   ["ul", ["<strong>Şifreli bağlantı</strong> — Platform ile cihazınız arasındaki tüm trafik şifreli bağlantı üzerinden taşınır.", "<strong>Erişim yetkilendirmesi</strong> — yönetim arayüzüne erişim yetkilendirilmiş hesaplarla sınırlıdır; genel erişim yetkisi tanımlanmaz.", "<strong>Hesap ayrımı</strong> — sağlık kayıtları hesabınıza bağlıdır; başka bir üyenin kaydına erişim uygulama düzeyinde engellenir."]],
   ["p", "Diyetisyeninizin sağlık verinizi görüntülemesi tarihiyle kaydedilir ve <strong>\"Veri izinlerim\"</strong> bölümündeki <strong>Erişim kaydı</strong>nda size gösterilir."],
   ["h2", "8. Kullanıcı Kontrolü"],
   ["p", "Sağlık veriniz üzerinde bugün fiilen kullanabildiğiniz kontroller şunlardır:"],
   ["ul", ["<strong>Görüntüleme ve değiştirme</strong> — ölçüleriniz, tahlilleriniz ve ölçüm geçmişiniz <strong>\"Sağlık dosyam\"</strong> bölümünde, hedefleriniz ve beslenme tercihleriniz profilinizde durur; buradan güncellenir.", "<strong>İzinlerin yönetimi</strong> — diyetisyen paylaşımı, kişiselleştirilmiş öneriler, anonim kullanım ve pazarlama iletileri izinleri <strong>\"Veri izinlerim\"</strong> ve bildirim ayarlarından tek tek açılıp kapatılır. Kapatma ileriye etkilidir; o ana kadar yapılmış işlemenin hukuka uygunluğunu etkilemez.", "<strong>Sağlık uygulaması verileri</strong> — hangi türlerin okunacağını bağlantı ayarlarından seçer, okumayı istediğiniz an durdurursunuz. Sağlık uygulamalarından okunan verilerinizi <strong>\"Veri izinlerim\"</strong> bölümünden dışa aktarabilir ya da silebilirsiniz. Silme geri alınamaz; elle girdiğiniz kayıtlara ve telefonunuzdaki sağlık uygulamasında duran veriye dokunmaz."]],
   ["p", "<strong>Kopya ve silme:</strong> planlarınızın, kayıtlarınızın ve ölçümlerinizin bir kopyasını Ayarlar › <strong>Verilerim</strong> bölümündeki <strong>\"Verilerimi indir\"</strong> ile makine okunur dosya olarak alırsınız; indirme bağlantısı e-posta adresinize gönderilir. Öğün, su ve ölçüm kayıtlarınızın silinmesini aynı bölümden talep edersiniz; talep edilen kayıtlar 30 gün sonra kalıcı olarak silinir. Talepleriniz için <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a> §11'deki adrese de başvurabilirsiniz."],
   ["h2", "9. Hesap Silme ve Sağlık Verisinin İmhası"],
   ["p", "Hesabınızı Ayarlar › <strong>Hesabımı sil</strong> adımından silersiniz; 30 gün içinde giriş yapmazsanız hesabınız ve sağlık verileriniz (planlar, ölçümler, öğün kayıtları) kalıcı olarak silinir. Hesabınızı kapatmadan yalnız takip verilerinizin (öğün, su ve ölçüm kayıtları) silinmesini Ayarlar › <strong>Verilerim</strong>'den talep edersiniz; talep edilen kayıtlar 30 gün sonra kalıcı olarak silinir. Sağlık uygulamalarından okunan veriyi §8'deki yoldan hemen silersiniz. Talepleriniz için <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a> §11'deki adrese de başvurabilirsiniz."],
   ["p", "Diyetisyeninizle paylaştığınız veriler ve görüşme kayıtları için mesleki saklama yükümlülükleri geçerli olabilir; bu durumda hangi verinin hangi süreyle saklandığı size bildirilir. İşlem geri alınamaz."],
   ["p", "Hesabınız silindiğinde sağlık uygulamalarından okunan veriler de silinir. Telefonunuzdaki sağlık uygulamasında duran veriler bundan etkilenmez; onları o uygulamadan yönetirsiniz."],
   ["h2", "10. Rıza Verilmediğinde"],
   ["p", "<strong>Rıza vermeden de Platform'u kullanmaya devam edebilirsiniz:</strong> rehberleri okuyabilir, besin kütüphanesini görüntüleyebilir ve programları inceleyebilirsiniz. Rıza verilmediğinde çalışmayan bölümler, ölçü girişi gerektiren hesaplayıcılar, kişisel takip ve uzmanla veri paylaşımıdır."],
   ["p", "Sağlık uygulaması bağlamamak ya da bu okumaya rıza vermemek de Platform'un geri kalanını kısıtlamaz; bu durumda verilerinizi elle girmeye devam edersiniz."],
   ["p", "Rıza vermeyen kullanıcının Platform'u kullanmaya devam edebilmesi, rızanın geçerliliği için gereklidir."],
   ["h2", "11. Onay Kaydı"],
   ["p", "Üyelik sırasında hangi metnin hangi sürümünü ne zaman kabul ettiğiniz kaydedilir ve bu kayıt bir uyuşmazlıkta tek dayanaktır. Verdiğiniz ve geri aldığınız izinler tarihleriyle <strong>\"Veri izinlerim\"</strong> bölümündeki <strong>İzin hareketleri</strong>nde görünür; onaylanan metnin sürüm ayrıntısını <a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a> §11'deki adrese başvurarak öğrenebilirsiniz."],
   ["h2", "12. İlgili Metinler"],
   ["ul", ["Açık Rıza Metni (Özel Nitelikli Veri)", "<a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a>", "<a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a>", "Platformun Rolü ve Aracılık Bildirimi"]]
  ]
 },
 "gizlilik": {
  baslik: "Gizlilik Politikası", ikon: "user-shield", surum: "1.1", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-11-11",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Veri Sorumlusu"],
   ["p", "DadaDiet platformunda işlenen kişisel veriler bakımından veri sorumlusu Dada İst Ajans Hizmetleri Ticaret Limited Şirketi'dır."],
   ["ul", ["<strong>Adres:</strong> Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083", "<strong>MERSİS no:</strong> [MERSİS no]", "<strong>KEP adresi:</strong> [KEP adresi]", "<strong>E-posta:</strong> dadamentorcom@gmail.com"]],
   ["p", "Bu metin, verilerinizi nasıl işlediğimizi ve bunun üzerinde hangi kontrollere sahip olduğunuzu anlatır. Aydınlatma yükümlülüğünün mevzuat karşılığı için <a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a>'ne, yer sağlayıcı bilgileri için <a href=\"#/kunye\">Künye / Yer Sağlayıcı Bilgisi</a> sayfasına bakınız."],
   ["p", "<strong>Sağlık verisi bu metnin dışında ayrıca düzenlenmiştir:</strong> boy, kilo, vücut ölçüleri, hedefler, öğün kayıtları ve diyetisyene aktarılan sağlık geçmişi için <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> geçerlidir."],
   ["h2", "2. İşlediğimiz Veriler"],
   ["ul", ["<strong>Hesap verileri</strong> — ad, kullanıcı adı, e-posta, profil fotoğrafı, doğum tarihi beyanı.", "<strong>Sağlık verileri</strong> — ölçüler, hedefler, hesaplama geçmişi, öğün kayıtları, uzmana aktarılan sağlık geçmişi ve bağladığınız sağlık uygulamasından (Apple Health ya da Health Connect) ayrıca verdiğiniz rızayla okunan veriler. Bu kategori özel nitelikli kişisel veridir ve <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>'na tabidir.", "<strong>Kullanım ve teknik veriler</strong> — IP adresi, oturum kayıtları, cihaz ve tarayıcı bilgisi, görüntülenen sayfalar.", "<strong>Randevu ve görüşme verileri</strong> — randevu kayıtları ve görüşmeye ilişkin işlem bilgileri.", "<strong>Ticari işlem verileri</strong> — ücretli bir hizmet alırsanız abonelik ve fatura bilgileri. Kart bilgileri Platform'da saklanmaz; ödeme kuruluşu tarafından tokenize edilir.", "<strong>İletişim verileri</strong> — destek, şikâyet ve başvurularınızın içeriği."]],
   ["h2", "3. İşleme Amaçları"],
   ["ul", ["Üyeliğin oluşturulması, hesabın yönetilmesi ve güvenliğinin sağlanması", "Hesaplama, program eşleştirme ve takip (açık rıza — bkz. Sağlık Verisi Politikası)", "Diyetisyenle veri paylaşımı, randevu ve görüşme süreçlerinin yürütülmesi (ayrı açık rıza)", "Uzman doğrulama ve şikâyet süreçlerinin yürütülmesi", "Ücretli hizmetlerin sunulması, faturalandırma ve muhasebe yükümlülükleri", "Pazarlama iletişimi (ayrı ve isteğe bağlı açık rıza)", "Hukuki yükümlülüklerin yerine getirilmesi ve uyuşmazlıkların çözümü"]],
   ["h2", "4. Onayların Ayrı Alınması"],
   ["p", "DadaDiet'te dört onay birbirinden ayrıdır; ayrı ayrı verilir, ayrı ayrı kaydedilir ve ayrı ayrı geri çekilebilir:"],
   ["ul", ["<strong>Üyelik onayı</strong> (zorunlu) — <a href=\"#/yasal/kullanim-kosullari\">Kullanım Koşulları</a> ve bu Gizlilik Politikası'nın kabulü.", "<strong>Sağlık verisi rızası</strong> (isteğe bağlı) — Açık Rıza Metni. Üyelik onayından ayrı bir adımda istenir ve <strong>\"Veri izinlerim\"</strong> bölümünde ayrı bir anahtar olarak durur.", "<strong>Uzmanla paylaşım rızası</strong> (isteğe bağlı) — randevu ve danışan ilişkisi için; <strong>\"Veri izinlerim\"</strong> bölümünde veri türü bazında verilir ve bütün türler varsayılan olarak kapalıdır.", "<strong>Pazarlama izni</strong> (isteğe bağlı) — e-posta, uygulama içi bildirim ve pazarlama izinleri tek tek verilir ve tek tek geri alınır."]],
   ["p", "<strong>Tek kutuda birleştirilen rıza geçersiz sayılır.</strong> Kabul ettiğiniz metnin sürümü ve tarihi kaydedilir. Verdiğiniz ve geri aldığınız izinler tarihleriyle <strong>\"Veri izinlerim\"</strong> bölümündeki <strong>İzin hareketleri</strong>nde görünür; onaylanan metnin sürüm ayrıntısını §11'deki adrese başvurarak öğrenebilirsiniz."],
   ["h2", "5. Paylaşım ve Aktarım"],
   ["ul", ["<strong>Diyetisyen</strong> — yalnızca ayrıca rıza verdiğiniz veri, yalnızca çalışmayı kabul ettiğiniz uzmanla. Bkz. <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> §5.", "<strong>Barındırma ve altyapı sağlayıcıları</strong> — hizmetin sunulması için zorunlu ölçüde.", "<strong>Ödeme kuruluşu</strong> — yalnızca ücretli hizmet alındığında.", "<strong>Yetkili kamu kurum ve kuruluşları</strong> — mevzuattan doğan talep hâlinde."]],
   ["p", "Sağlık veriniz reklam ağlarıyla veya veri satışı amacıyla üçüncü kişilerle paylaşılmaz. Yurt dışına aktarım yalnızca mevzuatın öngördüğü güvenceler sağlanarak yapılır."],
   ["h2", "6. Saklama Süreleri"],
   ["ul", ["<strong>Hesap verileri</strong> — hesap açık kaldığı sürece; hesap silindiğinde §8'e göre.", "<strong>Sağlık verileri</strong> — kategori bazında ayrı süreler; bkz. <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> §6.", "<strong>İşlem güvenliği kayıtları</strong> — mevzuatın öngördüğü asgari süre boyunca.", "<strong>Fatura ve muhasebe kayıtları</strong> — mevzuattaki zorunlu saklama süresi boyunca.", "<strong>Şikâyet ve inceleme kayıtları</strong> — [saklama süresi — şikâyet kayıtları]"]],
   ["p", "Sürenin sonunda veriler silinir, yok edilir veya anonim hâle getirilir."],
   ["h2", "7. Haklarınız ve Bunları Kullandığınız Yer"],
   ["p", "Verilerinizin bir bölümünü doğrudan hesabınızdan yönetirsiniz:"],
   ["ul", ["<strong>Sağlık dosyam</strong> — ölçüleriniz, tahlilleriniz ve ölçüm geçmişiniz; hedefiniz ve beslenme tercihleriniz profilinizde durur. Bu bölümlerden görüntülenir ve değiştirilir.", "<strong>Veri izinlerim</strong> — sağlık verisi açık rızası, sağlık uygulaması rızası ve diyetisyeninizle veri paylaşımı; her biri ayrı ayrı açılıp kapatılır.", "<strong>Bildirim tercihleri</strong> — pazarlama iletileri dâhil bildirim ve e-posta izinleri; kanal kanal açılıp kapatılır.", "<strong>Bağlı uygulamalar ve cihazlar</strong> — sağlık uygulaması bağlantısı, okunan ve yazılan veri türleri; bağlantıyı kesip gelen verilerin silinmesi."]],
   ["p", "Verilerinizin bir kopyasını Ayarlar › <strong>Verilerim</strong> bölümündeki \"Verilerimi indir\" ile alırsınız; takip verilerinizin silinmesini aynı bölümden, hesabınızın silinmesini <strong>Hesabımı sil</strong> adımından istersiniz. Düzeltme ve bunların dışındaki talepleriniz §11'deki adrese yapacağınız başvuruyla karşılanır. Mevzuattan doğan haklarınızın tam listesi ve başvuru usulü <a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a>'ndedir."],
   ["h2", "8. Hesap Silme"],
   ["p", "Hesabınızı Ayarlar › <strong>Hesabımı sil</strong> adımından silersiniz; 30 gün içinde giriş yapmazsanız hesabınız ve verileriniz kalıcı olarak silinir. Silme talebinizi §11'deki adrese başvurarak da iletebilirsiniz; hangi kayıtların mevzuattan doğan saklama yükümlülüğü nedeniyle kaldığı size bildirilir. Sağlık verisinin imhası bakımından ayrıca <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> §9 geçerlidir."],
   ["h2", "9. Güvenlik"],
   ["p", "Kişisel verilerin yetkisiz erişime, kayba ve hukuka aykırı işlenmeye karşı korunması için idari ve teknik tedbirler uygulanır: Platform ile cihazınız arasındaki tüm trafik şifreli bağlantı üzerinden taşınır, yönetim arayüzüne erişim yetkilendirilmiş hesaplarla sınırlıdır ve parolalar geri döndürülemez biçimde saklanır."],
   ["h2", "10. Çerezler"],
   ["p", "Tarayıcınıza yerleştirilen çerezler ve benzeri teknolojiler ayrıca <a href=\"#/yasal/cerez\">Çerez Politikası</a>'nda açıklanmıştır."],
   ["h2", "11. Başvuru"],
   ["p", "Bu politikaya ilişkin talep ve sorularınızı <strong>dadamentorcom@gmail.com</strong> adresine iletebilirsiniz. Mevzuattan doğan haklara ilişkin başvurular en geç <strong>30 gün</strong> içinde sonuçlandırılır; diğer başvurular <strong>[yanıt süresi]</strong> içinde yanıtlanır."],
   ["h2", "12. İlgili Metinler"],
   ["ul", ["<a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>", "<a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a>", "Açık Rıza Metni (Özel Nitelikli Veri)", "<a href=\"#/yasal/cerez\">Çerez Politikası</a>"]]
  ]
 },
 "kvkk": {
  baslik: "KVKK Aydınlatma Metni", ikon: "scale-balanced", surum: "1.1", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-11-11",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Veri Sorumlusunun Kimliği"],
   ["p", "Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (\"<strong>KVKK</strong>\") m.10 uyarınca, DadaDiet platformunu işleten veri sorumlusu tarafından hazırlanmıştır."],
   ["ul", ["<strong>Unvan:</strong> Dada İst Ajans Hizmetleri Ticaret Limited Şirketi", "<strong>Adres:</strong> Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083", "<strong>MERSİS no:</strong> [MERSİS no]", "<strong>Vergi dairesi / vergi no:</strong> [vergi dairesi / vergi no]", "<strong>KEP adresi:</strong> [KEP adresi]", "<strong>E-posta:</strong> dadamentorcom@gmail.com"]],
   ["h2", "2. İşlenen Kişisel Veri Kategorileri"],
   ["h3", "2.1 Genel nitelikli kişisel veriler"],
   ["ul", ["<strong>Kimlik verisi</strong> — ad, soyad, kullanıcı adı, doğum tarihi beyanı.", "<strong>İletişim verisi</strong> — e-posta adresi ve varsa telefon numarası.", "<strong>Müşteri işlem verisi</strong> — ücretli hizmet alındığında abonelik, randevu ve fatura kayıtları.", "<strong>İşlem güvenliği verisi</strong> — IP adresi, oturum ve giriş kayıtları, cihaz ve tarayıcı bilgisi.", "<strong>Görsel veri</strong> — profil fotoğrafı.", "<strong>Pazarlama verisi</strong> — açık rıza hâlinde iletişim tercihleri ve etkileşim kayıtları."]],
   ["h3", "2.2 Özel nitelikli kişisel veriler (sağlık verisi)"],
   ["ul", ["Boy, kilo ve vücut ölçüleri", "Hedefler ve hesaplama geçmişi", "Öğün kayıtları", "Diyetisyene aktarılan sağlık geçmişi"]],
   ["p", "Bu kategori KVKK kapsamında özel nitelikli kişisel veri, GDPR kapsamında sağlık verisi sayılır ve ayrı bir rejime tabidir — bkz. Sağlık Verisi Politikası."],
   ["h2", "3. İşleme Amaçları"],
   ["ul", ["Üyelik kaydının oluşturulması, hesabın yönetimi ve kimlik doğrulama", "Hesaplama, program eşleştirme ve takip süreçlerinin yürütülmesi", "Diyetisyenle veri paylaşımı, randevu ve görüşme süreçlerinin yürütülmesi", "Uzman doğrulama, içerik denetimi ve şikâyet süreçlerinin yürütülmesi", "Platform güvenliğinin sağlanması", "Ücretli hizmetlerin sunulması, faturalandırma ve muhasebe süreçlerinin yürütülmesi", "Talep, şikâyet ve veri sahibi başvurularının karşılanması", "Pazarlama iletişiminin yürütülmesi", "Hukuki yükümlülüklerin yerine getirilmesi ve uyuşmazlıkların takibi"]],
   ["h2", "4. Hukuki Sebepler"],
   ["h3", "4.1 Genel nitelikli veriler (KVKK m.5)"],
   ["ul", ["<strong>Sözleşmenin kurulması ve ifası</strong> (m.5/2-c) — üyelik, hesap yönetimi, ücretli hizmetler.", "<strong>Hukuki yükümlülüğün yerine getirilmesi</strong> (m.5/2-ç) — mevzuattan doğan kayıt ve saklama yükümlülükleri.", "<strong>Bir hakkın tesisi, kullanılması veya korunması</strong> (m.5/2-e) — şikâyet, inceleme ve uyuşmazlık kayıtları.", "<strong>Meşru menfaat</strong> (m.5/2-f) — Platform güvenliği ve hizmetin iyileştirilmesi.", "<strong>Açık rıza</strong> (m.5/1) — pazarlama iletişimi."]],
   ["h3", "4.2 Özel nitelikli veriler (KVKK m.6)"],
   ["p", "Özel nitelikli kişisel veri, Kanun'un aradığı şartlar dışında işlenemez; sağlık verisi bakımından esas alınan şart <strong>açık rızadır</strong>. Bu rıza genel üyelik onayından ayrı ve bağımsız alınır; hizmetin kullanımının koşulu hâline getirilmez. Tek kutuda birleştirilen rıza geçersiz sayılır. Rıza metni: Açık Rıza Metni (Özel Nitelikli Veri)."],
   ["p", "<strong>Açık rıza adımı:</strong> bu rıza üyelik onayından ayrı bir adımda istenir ve <strong>\"Veri izinlerim\"</strong> bölümünde ayrı bir anahtar olarak durur; rıza vermezseniz kayıtlarınız yalnız kullandığınız cihazda kalır. Sağlık verisi bir forma kendi elinizle girmenizle ya da bağladığınız sağlık uygulamasından, bunun için ayrıca verdiğiniz rızayla okunmasıyla doğar — ayrıntı Sağlık Verisi Politikası §3'tedir."],
   ["p", "Sağlık verisinin diyetisyenle paylaşılması, hesaplama amacından farklı bir amaçtır ve <strong>ayrı bir izne</strong> tabidir; bu izin \"Veri izinlerim\" bölümünde veri türü bazında ayrı anahtarlar olarak durur ve bütün türler varsayılan olarak kapalıdır."],
   ["h2", "5. Toplama Yöntemi"],
   ["p", "Kişisel verileriniz; üyelik ve giriş formları, hesaplayıcı ve ölçü giriş ekranları, öğün kayıt ekranları, açık rızanızla bağladığınız sağlık uygulamaları, randevu ve görüşme akışları, iletişim ve başvuru formları ile çerezler üzerinden <strong>elektronik ortamda</strong>; yazılı başvurularda ise fiziksel ortamda toplanır."],
   ["h2", "6. Aktarım"],
   ["p", "Kişisel verileriniz KVKK m.8 ve m.9'a uygun olarak; hizmetin ifası için zorunlu olduğu ölçüde barındırma ve altyapı sağlayıcılarına, açık rızanız hâlinde çalışmayı kabul ettiğiniz diyetisyene, ödeme kuruluşuna ve yasal talep hâlinde yetkili kamu kurum ve kuruluşlarına aktarılabilir."],
   ["p", "Özel nitelikli kişisel verinin aktarımı, Kanun'un öngördüğü ek şartlara ve Kurul'un belirlediği yeterli önlemlere tabidir. Yurt dışına aktarım yalnızca Kanun'un aradığı şartların sağlanması hâlinde yapılır."],
   ["h2", "7. Saklama ve İmha"],
   ["p", "Veriler, işleme amacının gerektirdiği süre ve mevzuatta öngörülen azami süreler boyunca saklanır; sürenin sonunda periyodik imha dönemlerinde silinir, yok edilir veya anonim hâle getirilir. Sağlık verisi kategorileri için ayrı süreler Sağlık Verisi Politikası §6'da listelenmiştir."],
   ["h2", "8. İlgili Kişinin Hakları (KVKK m.11)"],
   ["p", "Veri sorumlusuna başvurarak şu haklarınızı kullanabilirsiniz:"],
   ["ul", ["Kişisel verinizin işlenip işlenmediğini öğrenme", "İşlenmişse buna ilişkin bilgi talep etme", "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme", "Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme", "Eksik veya yanlış işlenmiş verinin düzeltilmesini isteme", "Kanun'un 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme", "Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme", "Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme", "Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme"]],
   ["p", "Açık rızaya dayalı işlemelerde (sağlık verisi, uzmanla paylaşım, pazarlama) rızanızı dilediğiniz zaman ve her biri için ayrı ayrı geri çekebilirsiniz; geri çekme, o ana kadar yapılmış işlemenin hukuka uygunluğunu etkilemez."],
   ["h2", "9. Başvuru Yolu"],
   ["p", "Başvurularınızı, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak şu yollardan biriyle iletebilirsiniz:"],
   ["ul", ["Yazılı olarak Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083 adresine", "KEP adresinizden <strong>[KEP adresi]</strong> adresine", "Sistemimizde kayıtlı e-posta adresinizden <strong>dadamentorcom@gmail.com</strong> adresine"]],
   ["p", "Başvurunuz talebin niteliğine göre en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde Kurul'ca belirlenen tarifedeki ücret alınabilir."],
   ["h2", "10. İlgili Metinler"],
   ["ul", ["Sağlık Verisi Politikası", "Açık Rıza Metni (Özel Nitelikli Veri)", "Gizlilik Politikası"]]
  ]
 },
 "cerez": {
  baslik: "Çerez Politikası", ikon: "cookie-bite", surum: "1.0", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-10-28",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Çerez Nedir?"],
   ["p", "Çerezler, ziyaret ettiğiniz sitelerin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Bu politika, çerezlerin yanı sıra yerel depolama (localStorage) ve benzeri istemci tarafı saklama teknolojilerini de kapsar."],
   ["h2", "2. Kullandığımız Çerez Kategorileri"],
   ["h3", "2.1 Zorunlu çerezler — <em>kullanılıyor</em>"],
   ["p", "Oturumun açık tutulması, güvenlik ve form gönderimlerinin doğrulanması için gereklidir. Bu çerezler olmadan Platform çalışmaz; bu nedenle rızaya bağlı değildir ve devre dışı bırakılamaz."],
   ["h3", "2.2 Tercih saklama — <em>çerez değil, tarayıcı depolaması</em>"],
   ["p", "Görünüm tercihi, son kullanılan filtreler ve benzeri seçimleriniz sunucuya gönderilen bir çerezde değil, tarayıcınızın kendi yerel depolamasında (localStorage) tutulur. Bu kayıtları tarayıcı ayarlarınızdan silebilirsiniz."],
   ["h3", "2.3 Analitik çerezler — <em>yalnızca onayınızla</em>"],
   ["p", "Platform'un nasıl kullanıldığını anlamak için Google Analytics 4 kullanırız. Bu hizmet <strong>yalnızca çerez bildiriminde \"Tümünü Kabul Et\" derseniz</strong> yüklenir; \"Reddet\" derseniz ya da hiç seçim yapmazsanız Google'a hiçbir istek gönderilmez ve analitik çerezi yerleştirilmez. Onay verdiğinizde tarayıcınıza <code>_ga</code> ve <code>_ga_&lt;kimlik&gt;</code> çerezleri yerleştirilir (süre: 2 yıl). Ölçüme ad, e-posta, telefon ya da sağlık verisi gönderilmez; üye girişi yaptıysanız hesabınız yalnızca geri çevrilemeyen anonim bir anahtarla temsil edilir. Reklam ve kişiselleştirme sinyalleri her durumda kapalıdır."],
   ["h3", "2.4 Pazarlama çerezleri — <em>kullanılmıyor</em>"],
   ["p", "Reklam, yeniden hedefleme ve siteler arası takip çerezi <strong>yerleştirilmemektedir</strong>."],
   ["h2", "3. Hesaplayıcı Girdilerinin Tarayıcıda Saklanması"],
   ["p", "Bir hesaplayıcıya girdiğiniz değerlerin, sayfalar arasında kaybolmaması için tarayıcınızda geçici olarak saklanması söz konusu olabilir. <strong>Bu saklama, sağlık verisinin işlenmesi için verilen açık rızanın yerine geçmez</strong>; sağlık verisinin işlenmesi Açık Rıza Metni ve <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>'na tabidir."],
   ["p", "Tarayıcınızdaki bu kayıtları tarayıcı ayarlarınızdan silebilirsiniz."],
   ["h2", "4. Rıza Yönetimi"],
   ["ul", ["İlk ziyarette çerez bildirimi gösterilir; zorunlu çerezler dışındaki tüm kategoriler <strong>varsayılan olarak kapalıdır</strong> ve onayınız olmadan çalıştırılmaz. Siteyi kullanmaya devam etmek onay yerine geçmez.", "İsteğe bağlı tek kategori analitiktir (§2.3). Bildirimde \"Reddet\" ve \"Tümünü Kabul Et\" düğmeleri bulunur; kararınızı dilediğiniz an geri alabilirsiniz: <em>Çerez tercihimi sıfırla</em> — tercih unutulur ve bildirim yeniden gösterilir.", "Kararınız <code>dadadiet_cookie_notice</code> adlı çerezde 12 ay saklanır ve her istekte sunucuya iletilir; bu çerez yalnızca kararınızı hatırlamak için kullanılır.", "İsteğe bağlı bir kategori kullanılmaya başlandığında bu metin ve bildirim, kategori bazında onay alacak biçimde birlikte değişir."]],
   ["h2", "5. Tarayıcıdan Kontrol"],
   ["p", "Çerezleri tarayıcı ayarlarınızdan da yönetebilirsiniz: mevcut çerezleri silebilir, yeni çerezleri engelleyebilir veya her çerez öncesi uyarı isteyebilirsiniz. Zorunlu çerezlerin engellenmesi hâlinde oturum açma ve form gönderme gibi işlevler çalışmayabilir."],
   ["h2", "6. Üçüncü Taraf Hizmetleri"],
   ["p", "Platform, onay vermeniz hâlinde yalnızca <strong>Google Analytics 4</strong> ölçümleme betiğini yükler (bkz. §2.3); onay yoksa hiçbir üçüncü taraf betiği yüklenmez. Reklam ya da siteler arası takip betiği kullanılmamaktadır. Google'ın yerleştirdiği çerezler Google'ın kendi gizlilik politikasına tabidir. Başka bir üçüncü taraf hizmet devreye alınırsa yalnızca ilgili kategoriye onay verdiğinizde yüklenir ve bu metin önceden güncellenir."],
   ["h2", "7. Saklama Süreleri"],
   ["ul", ["<strong>Oturum ve güvenlik çerezleri</strong> (zorunlu) — oturum süresince; tarayıcı kapatıldığında ya da oturum sona erdiğinde silinir.", "<strong><code>dadadiet_cookie_notice</code></strong> (zorunlu, çerez kararınız) — 12 ay.", "<strong><code>_ga</code> ve <code>_ga_&lt;kimlik&gt;</code></strong> (analitik, yalnızca onayınızla) — 2 yıl; onayı geri çektiğinizde yeniden yüklenmez, mevcut kayıtları tarayıcı ayarlarınızdan silebilirsiniz."]],
   ["p", "Tarayıcınızın yerel depolamasındaki tercih kayıtları siz silene kadar tarayıcınızda kalır."],
   ["h2", "8. İlgili Metinler"],
   ["ul", ["<a href=\"#/yasal/gizlilik\">Gizlilik Politikası</a>", "<a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a>", "<a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>"]]
  ]
 },
 "diyetisyen-dogrulama": {
  baslik: "Diyetisyen Doğrulama ve Kabul Politikası", ikon: "user-check", surum: "1.0", tarih: "2026-10-28", yururluk: "2026-10-28", guncelleme: "2026-10-28",
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Amaç"],
   ["p", "Doğrulandı rozeti, kullanıcının bir uzmanı seçerken güvendiği sinyaldir. Bu politika, rozetin neye dayandığını, hangi belgelerin arandığını ve doğrulamanın nasıl sürdürüldüğünü yazılı hâle getirir."],
   ["h2", "2. İstenen Belgeler"],
   ["ul", ["<strong>Diploma</strong>", "<strong>Mesleki kayıt belgesi</strong>", "<strong>Kimlik belgesi</strong>"]],
   ["p", "Belgeler başvuru sırasında Platform üzerinden yüklenir; başvurunun durumu (\"onay bekliyor\", \"onaylandı\", \"reddedildi\") uzmanın panelinde görünür."],
   ["h2", "3. Doğrulamayı Kim, Nasıl Yapar?"],
   ["ul", ["<strong>Doğrulamayı yapan birim:</strong> [doğrulamayı yapan birim]", "<strong>Doğrulama yöntemi:</strong> [doğrulama yöntemi — belge incelemesi ve kayıt teyidi usulü]", "<strong>Kayıt:</strong> her doğrulamada belge incelemesini yapan kişi ve inceleme tarihi kayda alınır.", "<strong>Karar:</strong> onay ve red kararları gerekçesiyle kaydedilir ve başvurana bildirilir."]],
   ["h2", "4. Rozet Doğrulama Tamamlanmadan Gösterilmez"],
   ["p", "<strong>Doğrulandı rozeti yalnızca diploması ve mesleki kaydı kontrol edilen uzmanlara verilir.</strong> Doğrulama tamamlanmadan rozet gösterilmez; başvurusu incelemede olan bir uzmanın profilinde rozet bulunmaz."],
   ["p", "Rozet, uzmanın hizmet kalitesine değil, <strong>belgelerinin ve mesleki kaydının doğrulanmış olduğuna</strong> işaret eder."],
   ["h2", "5. Doğrulamanın Yenilenmesi"],
   ["p", "Mesleki kaydın güncelliği <strong>[doğrulama yenileme aralığı]</strong> aralıklarla yeniden doğrulanır. Yenileme döneminde belgesini güncellemeyen uzmanın rozeti askıya alınır."],
   ["h2", "6. Belgesi Geçersiz Hâle Gelen Uzman"],
   ["ul", ["Rozet kaldırılır ve profil, yeni danışan başvurusuna kapatılır.", "Devam eden randevular ve danışan ilişkileri bakımından uygulanacak usul: <strong>[devam eden randevu ve danışan ilişkisi usulü]</strong>.", "Danışan dosyalarına erişim, mesleki saklama yükümlülüğü saklı kalmak üzere sınırlandırılır.", "Uzmana durum gerekçesiyle bildirilir; itiraz hakkı §8'dedir."]],
   ["h2", "7. Uzmanın Veriye Erişim Sınırı"],
   ["p", "Diyetisyen yalnızca <strong>kendisiyle çalışmayı kabul etmiş ve veri paylaşımına ayrıca rıza vermiş</strong> danışanların verisini görebilir. Platform genelinde kullanıcı verisine erişim yetkisi tanımlanmaz. Sağlık verisine yapılan her erişim zaman damgasıyla kaydedilir — bkz. <a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a> §7."],
   ["h2", "8. Başvurunun Reddi ve İtiraz"],
   ["p", "Başvurusu reddedilen veya rozeti kaldırılan uzman, karara <strong>[itiraz süresi]</strong> içinde itiraz edebilir. İtiraz, ilk kararı veren kişiden bağımsız olarak incelenir ve sonucu gerekçesiyle bildirilir."],
   ["h2", "9. Kullanıcı Bildirimi"],
   ["p", "Bir uzmanın belgesi veya beyanı hakkında şüpheniz varsa <strong>dadamentorcom@gmail.com</strong> adresine bildirebilirsiniz. Bildirimler <strong>[inceleme süresi]</strong> içinde incelenir ve sonuç gerekçesiyle bildirilir."],
   ["h2", "10. İlgili Metinler"],
   ["ul", ["Platformun Rolü ve Aracılık Bildirimi", "<a href=\"#/yasal/saglik-verisi\">Sağlık Verisi Politikası</a>", "Editoryal ve Tıbbi Denetim Politikası"]]
  ]
 }
 }
};
DDV.kurumsal = {
 kunye: {
  baslik: "Künye", ikon: "id-card", surum: "1.0", tarih: "2026-09-14", yururluk: null, guncelleme: null,
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Bu Sayfa Nedir?"],
   ["p", "Bu sayfa, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun ve ilgili mevzuat uyarınca, DadaDiet'i işleten kuruluşun kimlik ve iletişim bilgilerini kamuya açık biçimde bildirir."],
   ["h2", "2. Kimlik ve İletişim Bilgileri"],
   ["ul", ["<strong>Unvan:</strong> Dada İst Ajans Hizmetleri Ticaret Limited Şirketi", "<strong>Adres:</strong> Yavuz Sultan Selim Mah. No:52/B, Fatih/İstanbul 34083", "<strong>MERSİS no:</strong> [MERSİS no]", "<strong>Vergi dairesi / vergi no:</strong> [vergi dairesi / vergi no]", "<strong>KEP adresi:</strong> [KEP adresi]", "<strong>E-posta:</strong> dadamentorcom@gmail.com", "<strong>Telefon:</strong> [telefon]"]],
   ["h2", "3. Sorumlular"],
   ["ul", ["<strong>Yasal temsilci:</strong> [yasal temsilci]", "<strong>İçerik sorumlusu:</strong> [içerik sorumlusu]", "<strong>Barındırma (hosting) sağlayıcısı:</strong> [barındırma sağlayıcısı]"]],
   ["h2", "4. Yer Sağlayıcı Sıfatı"],
   ["p", "DadaDiet, kullanıcıların girdiği ölçü, öğün, hedef ve profil bilgilerini barındıran bir platformdur. Kullanıcı içeriği bakımından <strong>yer sağlayıcı</strong> konumundadır; yayımlanan kullanıcı içeriğini yayımdan önce kontrol etmek ve hukuka aykırı olup olmadığını araştırmakla yükümlü değildir."],
   ["p", "Bununla birlikte, hukuka aykırı içerikten haberdar edildiğinde, teknik olarak imkân bulunduğu ölçüde içeriği yayından kaldırır. Platform'un kendi ürettiği editoryal içerikler bakımından ise içerik sağlayıcı sıfatı geçerlidir."],
   ["h2", "5. İçeriğe İlişkin Başvuru ve Kaldırma Talepleri"],
   ["p", "Bir içeriğin haklarınızı ihlal ettiğini düşünüyorsanız başvurunuzu <strong>dadamentorcom@gmail.com</strong> veya <strong>[KEP adresi]</strong> üzerinden iletebilirsiniz. Başvuruda; talep sahibinin kimlik ve iletişim bilgileri, içeriğin Platform'daki adresi ve talebin gerekçesi bulunmalıdır."],
   ["p", "Başvurular <strong>[inceleme süresi]</strong> içinde sonuçlandırılır ve sonuç gerekçesiyle bildirilir. Hesap kurallarına dayalı talepler için Kullanım Koşulları, kişisel veriye ilişkin talepler için <a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a> metinlerine bakınız."],
   ["p", "Mevzuatın öngördüğü hâllerde başvurular, kanunda belirtilen mercilere de yapılabilir."],
   ["h2", "6. Veri Sorumlusu"],
   ["p", "Kişisel verilerin işlenmesi bakımından veri sorumlusu yukarıda unvanı belirtilen kuruluştur. Ayrıntı için <a href=\"#/yasal/kvkk\">KVKK Aydınlatma Metni</a> ve Gizlilik Politikası."],
   ["h2", "7. Ticari Bilgiler"],
   ["p", "Platform üzerinden sunulan ücretli hizmetlere ilişkin satıcı bilgileri, ödeme ve cayma koşulları Tıbbi Sorumluluk Reddi, Sağlık Verisi Politikası ve Kullanım Koşulları metinlerinde yer alır."],
   ["h2", "8. İlgili Metinler"],
   ["ul", ["Kullanım Koşulları", "Tıbbi Sorumluluk Reddi", "Gizlilik Politikası"]]
  ]
 },
 hakkimizda: {
  baslik: 'Hakkımızda', alt: 'Dada Diet nedir, neyi amaçlar.', etiket: 'Hikâyemiz',
  sayilar: [['777', 'yayında yazı'], ['541', 'besin değeri'], ['58', 'beslenme testi']],
  giris: {etiket: 'Neden buradayız', baslik: 'Sayıyı Yazmak Kolay, Nereden Geldiğini Yazmak Zor', metin: 'Amacımız, güvenilir kaynaklara dayanan beslenme bilgisini karmaşık tıbbi dilden arındırıp herkesin gündelik hayatında kullanabileceği, anlaşılır bir biçimde sunmaktır.'},
  bloklar: [
   ['h2', 'Dada Diet ne yapar?'],
   ['p', 'Platformda dört ana alan bulunur: beslenmeyle ilgili günlük soruları yanıtlayan rehber ve ipucu içerikleri, kalori ve makro hesaplayıcıları, hedefe göre kurulmuş beslenme programları ve diyetisyenlerle buluşulan bir dizin. Bu alanların hepsi aynı editöryal disiplinle yönetilir: <strong>hiçbiri tanı koymaz, hiçbiri tedaviyi değiştirmez</strong>, hepsi genel bilgilendirme amacı taşır.'],
   ['p', 'Bazı ziyaretçiler tek bir sayıyı (bir öğünün kalorisi gibi) merak ederken, bazıları haftalık bir program ya da bir diyetisyenle uzun soluklu bir çalışma arar; platform bu iki uçtaki ihtiyacı da aynı çatı altında karşılamak için kurulmuştur.'],
   ['h2', 'İçerikler nasıl hazırlanır?'],
   ['p', 'Beslenmeyle ilgili her sayı (kalori değeri, porsiyon ağırlığı, referans alım miktarı) üç kaynaktan birine dayanır: TürKomp, TÜBER 2022 ve USDA FoodData Central. Bu kaynaklardan hangisinin kullanıldığı, ilgili besin ya da hesaplayıcı kaydının künyesinde ayrı ayrı görünür.'],
   ['p', '<strong>Kaynağı gösterilemeyen bir sayı yayınlanmaz.</strong>'],
   ['p', 'Bu üç kaynağın ne işe yaradığını ve aralarındaki farkı <a href="#/bilimsel-kaynaklar">Bilimsel Kaynaklar</a> sayfasında ayrıntılı okuyabilirsin.'],
   ['p', 'Yazı ve rehber içerikleri Dada Diet Beslenme Ekibi tarafından hazırlanır ve yayın öncesi bu içerik standardına göre gözden geçirilir. Künyenin neden kurumsal kaldığını da açıkça söylemek isteriz: bir içeriğin altına gerçek bir diyetisyenin adı ancak o kişi metni gerçekten okumuş, onaylamış ve bu onayın tarihi kayıt altına alınmışsa yazılır.'],
   ['p', 'Bu üç şart birlikte sağlanmadığı sürece içerik Dada Diet Beslenme Ekibi imzasıyla kalır; amaç, var olmayan bir uzman onayını var gibi göstermemektir. Bugün itibarıyla bu sayfalar da dahil hiçbir içerik üçüncü şartı, yani kayıtlı, tarihli bir uzman onayını henüz karşılamıyor; bu yüzden hepsi kurumsal imzayla yayınlanır.']
  ],
  kunye: {baslik: '541 Besin Değerinin Tamamı Künyeli', metin: 'Kaynak, kayıt kimliği, porsiyon ve erişim tarihi: dördü birden yazılmayan bir değer yayınlanmaz.', sayilar: [['82', 'Beslenme programı'], ['10', 'Hesaplayıcı']]},
  araclar: {etiket: 'Hangi araçları bulursun', baslik: 'Hangi Araçları Bulursun?', metin: 'Bu araçların her biri kendi sayfasında nasıl çalıştığını ve hangi kaynağa dayandığını ayrıca açıklar; bir hesaplayıcının hangi denklemi kullandığı ya da bir testin sonuç bantlarının neye dayandığı, o aracın kendi sayfasında yazılıdır.', kartlar: [
   {ikon: 'calculator', baslik: 'Hesaplayıcılar', alt: 'Kalori, makro, su ve vücut ölçüleri', git: '#/hesaplayicilar'},
   {ikon: 'clipboard-question', baslik: 'Beslenme Testleri', alt: 'Alışkanlıklarını ölçen kısa testler', git: '#/testler'},
   {ikon: 'list-check', baslik: 'Beslenme Programları', alt: 'Hedefe göre kurulmuş haftalık menüler', git: '#/programlar'},
   {ikon: 'magnifying-glass', baslik: 'Besin Kütüphanesi', alt: '100 gram referanslı besin değerleri', git: '#/besinler'},
   {ikon: 'user-doctor', baslik: 'Diyetisyenler', alt: 'Diyetisyenlerle iletişim ve randevu', git: '#/uzman/bul'},
   {ikon: 'location-dot', baslik: 'Dışarıda Ne Yesem', alt: 'Şehrindeki mekanlarda hedefine uygun öğünler', git: '#/disarida'}]},
  pusula: {etiket: 'Pusulamız', baslik: 'Neyi Yapıyoruz, Neyi Yapmıyoruz', metin: 'Bu üç cümle her içerik kararının arkasında duruyor.', kartlar: [
   {ikon: 'bullseye', baslik: 'Amacımız', metin: 'Güvenilir kaynaklara dayanan beslenme bilgisini karmaşık tıbbi dilden arındırmak ve herkesin gündelik hayatında kullanabileceği anlaşılır bir biçimde sunmak.'},
   {ikon: 'shield-halved', baslik: 'Sınırımız', metin: 'Hiçbir ekranda tanı konmaz, tedavi önerilmez, hastalık yönetimi tarif edilmez. Kişiye özel değerlendirmeyi yalnız doğrulanmış bir diyetisyen yapar.'},
   {ikon: 'signature', baslik: 'İmzamız', metin: 'Bir içeriğin altına gerçek bir diyetisyenin adı ancak o kişi metni okumuş, onaylamış ve onayın tarihi kayda geçmişse yazılır. Üçü birden sağlanmadıkça içerik kurumsal imzayla kalır.'}]},
  dayanak: {etiket: 'Dayanağımız', baslik: 'Sayılar Nereden Geliyor?', metin: 'Beslenmeyle ilgili her sayı (kalori, porsiyon, referans alım) üç veri tabanından birine dayanır ve hangisinden geldiği kaydın künyesinde ayrıca görünür.', kartlar: [
   {ikon: 'database', baslik: 'TürKomp', metin: 'Ulusal Gıda Kompozisyon Veri Tabanı. Türkiye’de üretilen ve tüketilen gıdaların laboratuvarda analiz edilmiş bileşimi; yerel çeşit ve geleneksel ürünlerde birinci tercih.'},
   {ikon: 'book-medical', baslik: 'TÜBER 2022', metin: 'Türkiye Beslenme Rehberi. Referans alım değerleri, porsiyon tanımları ve yaş/cinsiyet grubuna göre öneriler buradan gelir.'},
   {ikon: 'globe', baslik: 'USDA FoodData Central', metin: 'Uluslararası bileşim kaynağı. Bir gıdanın aynı hazırlık hâliyle TürKomp karşılığı bulunmadığında başvurulur; kullanılan kayıt kimliği künyede görünür.'}],
   baglantilar: [
    {ikon: 'flask', baslik: 'Bilimsel Kaynaklar ve Metodoloji', metin: 'Kaynakların sürümleri, künyenin dört alanı ve iki kaynağın neden aynı satırda karıştırılmadığı.', git: '#/bilimsel-kaynaklar'},
    {ikon: 'users', baslik: 'Editoryal ve Bilimsel Kurul', metin: 'İçeriğin hangi süreçten geçtiği, kimin sorumlu olduğu ve ticari iş birliklerinden bağımsızlık.', git: '#/editoryal-kurul'}]},
  alanlar: {etiket: 'Ne bulursun', baslik: 'Platformdaki Alanlar', kartlar: [
   {ikon: 'lightbulb', baslik: 'Yazılar ve Rehberler', metin: 'Beslenmeyle ilgili günlük soruları yanıtlayan rehber, ipucu ve püf noktası içerikleri.', git: '#/ipuclari'},
   {ikon: 'calculator', baslik: 'Hesaplayıcılar', metin: 'Kalori, makro, su ve vücut ölçüleri. Her araç hangi denklemi kullandığını kendi sayfasında yazar.', git: '#/hesaplayicilar'},
   {ikon: 'magnifying-glass', baslik: 'Besin Kütüphanesi', metin: '100 gram referanslı besin değerleri; her kayıt kaynağını ve erişim tarihini künyesinde taşır.', git: '#/besinler'},
   {ikon: 'list-check', baslik: 'Beslenme Programları', metin: 'Hedefe göre kurulmuş haftalık programlar, alışveriş listesi ve günlük takip.', git: '#/programlar'},
   {ikon: 'user-doctor', baslik: 'Diyetisyen Dizini', metin: 'Diyetisyenlerle iletişim ve randevu. Kişiye özel değerlendirme yalnız burada yapılır.', git: '#/uzman/bul'},
   {ikon: 'user-check', baslik: 'Diyetisyen Ol', metin: 'Diploman ve mesleki kaydın kontrol edilir; doğrulama rozeti otomatik verilmez. Başvuru sürecini buradan başlatabilirsin.', git: '#/diyetisyen-ol'}]},
  not: {baslik: 'Genel bilgi notu.', metin: 'Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; <strong>tıbbi teşhis veya tedavi yerine geçmez</strong>, kişisel beslenme tavsiyesi niteliği taşımaz. Kişiye özel plan yalnızca <strong>yetkili bir diyetisyen</strong> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <strong>hekim ve diyetisyen kontrolü zorunludur</strong>.', eylem: {metin: 'Diyetisyen Bul', git: '#/uzman/bul'}}
 },
 iletisim: {
  baslik: 'İletişim', alt: 'Bize ulaş.', etiket: 'Bize ulaşın',
  form: {
   baslik: 'İletişim Formu',
   metin: 'Dada Diet tamamen dijital bir platformdur; telefon ya da posta adresi yerine mesajın doğrudan ilgili ekibe düşer. Yıldızlı alanlar zorunludur, cevabımız yazdığın e-posta adresine gelir.',
   alanlar: {
    ad: {etiket: 'Ad', hata: 'Bu alan zorunlu.'},
    soyad: {etiket: 'Soyad', hata: 'Bu alan zorunlu.'},
    eposta: {etiket: 'E-posta', hata: 'Geçerli bir e‑posta adresi yaz (ad@site.com).'},
    telefon: {etiket: 'Telefon', yardim: 'İstersen bırakabilirsin, zorunlu değil.'},
    konu: {etiket: 'Konu', yer: 'Konu seç', yardim: 'Konuya göre doğru ekibe yönlendiriyoruz.', hata: 'Bir konu seç.'},
    mesaj: {etiket: 'Mesajın', hata: 'Bu alan zorunlu.'}
   },
   konular: [['oneri', 'Önerim var'], ['soru', 'Bir sorum var'], ['teknik', 'Teknik sorun'], ['ihlal', 'İhlal bildirimi']],
   onay: 'KVKK Aydınlatma Metni’ni okudum, mesajımın bu kapsamda işlenmesini onaylıyorum.',
   not: 'Mesajın kuyruğa kayıt olarak düşer; kaybolmaz.',
   gonder: 'Gönder',
   tamam: 'Mesajın kuyruğa kayıt olarak düştü; cevabımız yazdığın e-posta adresine gelir.'
  },
  yol: {baslik: 'Mesajın Nereye Gider?', adimlar: [
   {ikon: 'signs-post', baslik: 'Konusuna Göre Yönlenir', metin: 'Öneri, soru, teknik sorun ve ihlal bildirimi ayrı ayrı işaretlenir.'},
   {ikon: 'inbox', baslik: 'Kuyrukta Kayda Dönüşür', metin: 'Gelen mesajlar aynı listeye düşer; hiçbiri sessizce kaybolmaz.'},
   {ikon: 'envelope', baslik: 'E-posta ile Dönülür', metin: 'Sabit bir süre taahhüt etmiyoruz; ama her kayıt izlenir.'}]},
  kanallar: {etiket: 'Kanallar', baslik: 'Hangi Kanal, Ne İçin?', kartlar: [
   {ikon: 'comment-dots', etiket: 'Ürünle ilgili her şey', baslik: 'Öneri ve Hata Bildirimi', metin: 'Öneri, hata bildirimi ve iş birliği önerileri için bu formu kullan.', eylem: 'Forma git', hedef: 'form'},
   {ikon: 'user-doctor', etiket: 'Kişiye özel beslenme', baslik: 'Diyetisyen Dizini', metin: '“Bana kaç kalori doğru?” gibi sorular burada yanıtlanır: mesajla değil, uzmanla.', eylem: 'Diyetisyenlere git', git: '#/uzman/bul'},
   {ikon: 'user-shield', etiket: 'Hesap ve gizlilik', baslik: 'Veri İzinlerim', metin: 'Sağlık verinin kiminle paylaşıldığını buradan görür, izinleri tek tek kapatırsın.', eylem: 'İzinlerimi aç', git: '#/veri-izinleri'}]}
 },
 sss: {
  baslik: 'Sıkça Sorulan Sorular', etiket: 'Dada Diet',
  kategoriler: [{ad: 'Pro ve ödeme', ikon: 'crown', sorular: [
   {soru: 'Tek üyelikle her şey mi açılıyor?', yanit: 'Evet. Dada Diet Pro, site geneli tek üyeliktir. Gelişmiş programlar, kişisel beslenme planı, menü planlama ve reklamsız kullanım seçtiğin kademenin kapsamına göre açılır; Pro Max bunlara diyetisyen görüşme hakkını ekler. Ücretsiz ve Pro’da diyetisyen görüşmesinin ücreti üyeliğe dâhil değildir. Kademeleri yan yana görmek için <a href="#/pro">Dada Diet Pro sayfasındaki karşılaştırma tablosuna</a> bakabilirsin.'},
   {soru: 'Kart bilgilerim güvende mi?', yanit: 'Pro planları için bugün ödeme alınmıyor; Dada Diet Pro için kart bilgisi istemez. Verinin nasıl işlendiği Gizlilik Politikası’nda.'},
   {soru: 'Pro üyeliğimi istediğim zaman iptal edebilir miyim?', yanit: 'Pro planları henüz satışa açılmadı; bugün iptal edilecek bir Pro aboneliği yok. Üyelik ve iptal koşulları Kullanım Koşulları’nda yazar.'}]}],
  kapanis: {ikon: 'headset', baslik: 'Cevabını Bulamadın mı?', metin: 'Sorunu yaz, destek ekibi sırayla ve mesai içinde dönsün. Yanıtı bu bölüme de ekleriz.', eylem: 'İletişime geç'}
 },
 // ---------- Paket 1b: web sayfa/{bilimsel-kaynaklar,editoryal-kurul,nasil-calisir,saglik-bilgilendirmesi,uzmanla-calisma-rehberi} ve diyetisyen-ol/ ----------
 // Anahtar = rota (#/<anahtar>). Bağlantılar uygulama adresine çevrildi; web'de karşılığı olmayan hedef (Bana Uygun Olanı Bul) bağlantısız kaldı.
 "bilimsel-kaynaklar": {
  baslik: "Bilimsel Kaynaklar", ikon: "flask", surum: "1.0", tarih: "2026-08-19", yururluk: null, guncelleme: null,
  ayak: "Bu metin bilgilendirme amaçlıdır; güncel sürüm her zaman bu sayfada yayımlanır.",
  bloklar: [
   ["h2", "1. Bu Sayfanın Amacı"],
   ["p", "Dada Diet, hesaplayıcı ve rehber içeriklerinin bilimsel dayanağı olduğunu söyler. Bu dayanağın hangi kaynaklara ve hangi yönteme oturduğunun yayımlanması, bu beyanın karşılığıdır. Bu sayfa, kullanılan kaynakları ve içeriğin nasıl üretildiğini tek yerde toplar."],
   ["h2", "2. Hesaplayıcılarda Kullanılan Referans Denklemler"],
   ["p", "Hesaplayıcılar, girdiğiniz verilerden <strong>referans denklemlerle tahmini bir sonuç</strong> üretir. Her hesaplayıcının sonuç ekranında hangi referans denklemin kullanıldığı yazılır ve kaynağına bağlantı verilir."],
   ["p", "Hesaplayıcı bazında kullanılan denklemlerin ve kaynaklarının tam listesi: <strong>[referans denklem ve kaynak listesi]</strong>."],
   ["p", "Bir denklemin hangi durumlarda yanıltıcı olabileceği, o hesaplayıcının sınırlılık notunda belirtilir — bkz. Hesaplayıcı Sınırlılıkları Bildirimi."],
   ["h2", "3. Besin Değeri Verisinin Kaynağı"],
   ["ul", ["<strong>Kullanılan besin değeri veri kaynakları:</strong> [besin değeri veri kaynakları]", "<strong>Verinin sürümü ve alındığı tarih:</strong> [veri sürümü ve tarihi]", "<strong>Güncelleme aralığı:</strong> [besin verisi güncelleme aralığı]"]],
   ["p", "Besin değeri bilgileri kaynaklara göre değişebilir; ürünün cinsi, üretim ve pişirme yöntemi, marka ve porsiyon ölçüsü değerleri etkiler. Bu nedenle sayfalarda gösterilen değerler kesin ölçüm değil, kaynağa dayalı referans değerlerdir."],
   ["h2", "4. Rehber İçeriklerin Kaynakları"],
   ["p", "Rehber yazılar ve beslenme içerikleri, o sayfada ayrıca listelenen kaynaklara dayanır. Her rehber sayfasında şunlar görünür:"],
   ["ul", ["Kaynak listesi ve varsa kaynağa doğrudan bağlantı.", "İçeriği hazırlayan ve denetleyen bilgisi.", "Son güncelleme tarihi."]],
   ["p", "Kaynakların seçimi, güncellenmesi ve uzman denetimi Editoryal ve Tıbbi Denetim Politikası'nda tanımlanmıştır."],
   ["h2", "5. Kaynak Gösteriminin Sınırı"],
   ["p", "Bir içeriğin kaynak göstermesi, o içeriğin size uygun olduğu anlamına gelmez. Kaynaklar genel bilgi düzeyinde geçerlidir; kişiye uygunluk değerlendirmesi hekim ve diyetisyen tarafından yapılır. Bu sınırın tamamı Tıbbi Sorumluluk Reddi'ndedir."],
   ["h2", "6. Kaynak Hatası Bildirimi"],
   ["p", "Bir kaynağın hatalı, eksik veya güncelliğini yitirmiş olduğunu düşünüyorsanız <strong>dadamentorcom@gmail.com</strong> adresine bildirin. Bildirimler <strong>[inceleme süresi]</strong> içinde incelenir; düzeltme yapılırsa sayfanın son güncelleme tarihi yenilenir."],
   ["h2", "7. İlgili Metinler"],
   ["ul", ["Hesaplayıcı Sınırlılıkları Bildirimi", "Editoryal ve Tıbbi Denetim Politikası", "Tıbbi Sorumluluk Reddi"]]

  ]
 },
 "editoryal-kurul": {
  baslik: 'Editoryal ve Bilimsel Kurul', etiket: 'Kurumsal', alt: 'Sağlık içeriği, yazıldığı kadar denetlendiği ölçüde güvenilirdir. Bu sayfa içeriklerimizin hangi süreçten geçtiğini ve kimin sorumlu olduğunu anlatır.',
  gorev: {etiket: 'Kurulun görevi', baslik: 'Ne Denetleniyor?', metin: 'Editoryal ve bilimsel kurul, platformda yayınlanan beslenme içeriğinin bilimsel dayanağını ve dilini denetler.', kartlar: [
   {ikon: 'file-circle-check', baslik: 'Yayın Öncesi İnceleme', metin: 'İddialar kaynaklarıyla karşılaştırılır; kaynağı olmayan ya da kaynağını aşan ifadeler yayına girmeden çıkarılır.'},
   {ikon: 'rotate', baslik: 'Yayın Sonrası Güncellik Takibi', metin: 'Dayanılan rehberler güncellendiğinde içerik yeniden değerlendirilir; yayınlanmış olması bir metni tartışmaya kapatmaz.'},
   {ikon: 'flag', baslik: 'İtiraz ve Düzeltme', metin: 'Bir içerikte hata olduğunu düşünüyorsan bize bildir. Düzeltme talepleri kaynak gösterilerek değerlendirilir ve sonucu bildirilir.'}]},
  isleyis: {etiket: 'İşleyiş', baslik: 'Bir İçerik Nasıl Yayına Giriyor?', metin: 'Bir içerik yayına girene kadar beş adımdan geçer. Bu adımların ikisi denetimdir.', adimlar: [
   {ikon: 'bullseye', baslik: 'Konu Belirlenir ve Kapsamı Yazılır', metin: 'İçerik neyi anlatacak, neyi anlatmayacak.'},
   {ikon: 'file-pen', baslik: 'Taslak Hazırlanır', metin: 'Güncel beslenme rehberlerine ve hakemli yayınlara dayanılır; her iddia bir kaynağa bağlanır.'},
   {ikon: 'flask', baslik: 'Bilimsel Denetim', metin: 'İddialar kaynaklarla karşılaştırılır, kaynağı olmayan ya da kaynağını aşan ifadeler çıkarılır.'},
   {ikon: 'spell-check', baslik: 'Editoryal Denetim', metin: 'Dil sadeleştirilir, tanı/tedavi izlenimi verebilecek ifadeler ayıklanır, gerekli uyarı şerhleri eklenir.'},
   {ikon: 'rotate', baslik: 'Yayın ve Güncellik Takibi', metin: 'Kaynak rehberler güncellendiğinde içerik yeniden değerlendirilir.'}]},
  pusula: {etiket: 'Pusulamız', baslik: 'Neye Dayanıyoruz, Nerede Duruyoruz', metin: 'Pusulanın üç ucu: dayandığımız kaynaklar, ticari iş birliklerinden bağımsızlık ve kendi sınırımız.', kartlar: [
   {ikon: 'book-medical', baslik: 'Kaynak Politikası', metin: 'İçeriklerimiz öncelikle ulusal ve uluslararası beslenme rehberlerine, sonra hakemli yayınlara dayanır. Tek bir çalışmaya dayanan kesin ifadeler kullanılmaz. Kanıt düzeyi zayıfsa bu içerikte açıkça belirtilir.'},
   {ikon: 'handshake-slash', baslik: 'Ticari İş Birliklerinden Bağımsızlık', metin: 'Sponsorlu bir içerik de sponsorsuz içerikle aynı incelemeden geçer. Sponsor bir bulgunun çıkarılmasını ya da bir önerinin değiştirilmesini isteyemez. Ticari iş birliğiyle üretilen içerik okuyucuya açıkça belirtilir.'},
   {ikon: 'shield-halved', baslik: 'Sınırımız', metin: 'Kurul, içeriğin bilimsel dayanağını denetler; kişiye özel tıbbi karar vermez. Buradaki hiçbir içerik hekim ya da diyetisyen değerlendirmesinin yerine geçmez.'}]},
  // İki politika metninin kendisi henüz yok (web'de yasal/ dizinine gider): bekliyor: true, ekranda gösterilmez (kurumsal.js kartGrup).
  belgeler: {etiket: 'Dayanağımız', baslik: 'İlgili Belgeler', metin: 'Bu sayfa kurulu ve süreci tanıtır; kuralın kendisi aşağıdaki belgelerde yazılıdır.', kartlar: [
   {ikon: 'file-shield', baslik: 'Editoryal ve Tıbbi Denetim Politikası', metin: 'Denetim sürecinin bağlayıcı kuralları.', bekliyor: true},
   {ikon: 'flask', baslik: 'Bilimsel Kaynaklar ve Metodoloji', metin: 'Hangi kaynaklara dayandığımız ve yöntemimiz.', git: '#/bilimsel-kaynaklar'},
   {ikon: 'pen', baslik: 'İçerik Düzeltme Politikası', metin: 'Hata bildirimi ve düzeltme süreci.', bekliyor: true}]}
 },
 "nasil-calisir": {
  baslik: 'Nasıl Çalışır?', etiket: 'Dada Diet', alt: 'Dada Diet hazır bir beslenme listesi dağıtmaz. Önce durumunu anlamana, sonra sana uyan yolu seçmene ve ilerlemeni düzenli takip etmene yarayan araçlar sunar.',
  adimlar: {etiket: 'Bilimsel kaynaklara dayalı içerik · Sağlık verisi izinle işlenir', baslik: 'Dört Adımda', ogeler: [
   {baslik: '1 · Durumunu Tanı', metin: 'Hesaplayıcılar ve beslenme testleriyle başla. Enerji ihtiyacın, su alımın ve mevcut alışkanlıkların hakkında somut bir başlangıç noktası çıkar. Hiçbir sonuç tanı değildir; nereye bakacağını gösterir.', eylemler: [{metin: 'Hesaplayıcılar', git: '#/hesaplayicilar'}, {metin: 'Testler', git: '#/testler'}]},
   // Web "Bana Uygun Olanı Bul" yönlendirme akışının uygulamada ekranı yok: düğme konmaz.
   {baslik: '2 · Sana Uyanı Bul', metin: 'Araçlar, testler ve programlar arasında kaybolma. Yönlendirme akışı birkaç soruyla seni doğru başlangıç noktasına götürür: bir programa mı, bir hesaplayıcıya mı yoksa doğrudan bir diyetisyene mi ihtiyacın olduğunu söyler.', eylemler: []},
   {baslik: '3 · Programını Başlat', metin: 'Programlar günlük öğün önerileri, alışveriş listesi ve haftalık ritim içerir. Bir programı başlatmak onu Planım alanına bağlar; oradan günü gününe ilerleyebilirsin.', eylemler: [{metin: 'Programlar', git: '#/programlar'}]},
   {baslik: '4 · Takip Et', metin: 'Günlük takip, öğünlerini ve su alımını kaydetmeni sağlar; ilerleme kaydı değişimi zaman içinde gösterir. Takip, tek bir günün değil eğilimin resmini çıkarmak içindir.', eylemler: [{metin: 'Günlük Takibini Yap', git: '#/bugun'}]}]},
  kartlar: [
   {ikon: 'user-doctor', baslik: 'Uzman Desteği Nerede Devreye Girer?', metin: 'Araçlar genel bilgilendirme içindir. Gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi ya da bir hastalığa özgü beslenme söz konusuysa süreç bir diyetisyenle yürütülmelidir. Platformdaki diyetisyenlerin diploma ve belgeleri doğrulanır.', eylemler: [{metin: 'Diyetisyen Bul', git: '#/uzman/bul?adim=1'}, {metin: 'Uzmanla Çalışma Rehberi', git: '#/uzmanla-calisma'}]},
   {ikon: 'book-medical', baslik: 'İçerikler Neye Dayanıyor?', metin: 'Rehberler, hesaplayıcılar ve besin değerleri güncel beslenme rehberlerine ve hakemli yayınlara dayanır. Kullanılan kaynaklar ve yöntem ayrı bir sayfada açıkça yazılıdır.', eylemler: [{metin: 'Bilimsel Kaynaklar', git: '#/bilimsel-kaynaklar'}]}],
  bloklar: [
   ['h2', 'Neden bu sırayla?'],
   ['p', 'Beslenmeyle ilgili bir şeyi değiştirmek isteyen çoğu kişi ortadan başlar: bir liste bulur, birkaç gün uygular, sonra bırakır. Sıranın baştan kurulması bunu önlemek içindir: önce nerede olduğunu bilirsin, sonra nereye gideceğini seçersin, en son nasıl gittiğini görürsün.'],
   ['p', 'Bu yüzden platformda hazır bir "en iyi beslenme planı" yok. Aynı hedefe giden birden çok yol var ve hangisinin sana uyacağı günlük düzenine, mutfak alışkanlıklarına ve sağlık durumuna bağlı.'],
   ['h2', 'Verilerin ne oluyor?'],
   ['p', 'Hesaplayıcı sonuçların, günlük kayıtların ve sağlık profilin kişisel alanında tutulur. Bir diyetisyenle paylaşılması senin iznine bağlıdır; izinlerini istediğin zaman kişisel alanından değiştirebilir, kayıtlarını silebilirsin.'],
   ['h2', 'Ücretli mi?'],
   ['p', 'Rehberler, hesaplayıcılar, testler ve besin kütüphanesi herkese açıktır. Bir diyetisyenle birebir çalışmak ise o uzmanın kendi hizmetidir; ücreti ve kapsamı ilgili profilde yazılıdır.']
  ],
  not: 'Buradaki araç ve içeriklerin hiçbiri <strong>tıbbi tanı koymaz, tedavi önermez</strong> ve kişiye özel beslenme planı yerine geçmez. Sağlığınla ilgili kararları hekimin ve diyetisyeninle birlikte al.'
 },
 "saglik-bilgilendirmesi": {
  baslik: 'Sağlık Bilgilendirmesi', etiket: 'Dada Diet', alt: 'Bu sayfa Dada Diet’in çalışma biçimini ve açık, güvenli kullanıcı deneyimi ilkelerini açıklar.',
  bloklar: [
   ['h2', 'Bilgilendirme'],
   ['p', 'Bu sayfadaki içerik Dada Diet editoryal ve operasyon ekibi tarafından güncellenir. <strong>Tıbbi tavsiye yerine geçmez.</strong> Kişisel sağlık verileri yalnız belirtilen amaç ve gerekli izin kapsamında işlenir.'],
   ['p', 'Soruların veya düzeltme taleplerin için isteğin güvenle takip edilebilmesi amacıyla <a href="#/iletisim">iletişim formunu</a> kullanabilirsin.']
  ]
 },
 "uzmanla-calisma": {
  baslik: 'Uzmanla Çalışma Rehberi', etiket: 'Uzman desteği', alt: 'Bir diyetisyenle çalışmak, hazır bir liste almak değildir. Bu rehber süreci baştan sona anlatır: neye hazırlanacaksın, ilk görüşmede ne konuşulur, takip nasıl yürür.',
  bloklar: [
   ['h2', 'Diyetisyen ne yapar, ne yapmaz?'],
   ['p', 'Diyetisyen, beslenme durumunu değerlendirir ve sana özel bir beslenme planı kurar. Bu plan yaşam düzenini, bütçeni, mutfak alışkanlıklarını ve varsa hastalık durumunu birlikte hesaba katar.'],
   ['p', 'Diyetisyen <strong>hastalık teşhisi koymaz, ilaç yazmaz ve ilaç dozunu değiştirmez</strong>. Bir hastalığın tedavisi hekimin sorumluluğundadır; diyetisyen o tedavinin beslenme ayağını yürütür. Hekim ve diyetisyenin birlikte çalışması gereken durumlarda ikisiyle de görüşmen gerekir.'],
   ['h2', 'Randevu öncesi hazırlık'],
   ['p', 'Görüşmeyi verimli kılan şey, ilk seansta konuşulacak verinin hazır olmasıdır. Görüşmeden önce şunları toparlaman işini kolaylaştırır:'],
   ['ul', ['Son birkaç güne ait öğün kaydın: ne yediğinden çok, ne zaman ve hangi düzende yediğin önemli.', 'Varsa güncel kan tahlili sonuçların ve hekim raporların.', 'Düzenli kullandığın ilaçlar ve takviyeler.', 'Bilinen alerji, besin intoleransı ve kronik hastalıkların.', 'Hedefin: kilo değişimi mi, bir hastalığa özgü beslenme mi, performans mı, yoksa yalnız düzen kurmak mı?']],
   ['p', 'Günlük takibi bir süredir kullanıyorsan kayıtların bu hazırlığın büyük kısmını zaten karşılar.'],
   ['h2', 'İlk görüşmede ne olur?'],
   ['p', 'İlk görüşme çoğunlukla bir değerlendirmedir: alışkanlıkların, günlük ritmin, sağlık geçmişin ve hedefin konuşulur. Ölçüm alınabilir. Bu görüşmenin sonunda genellikle bir plan taslağı ve bir sonraki adım çıkar; bazen de eksik veri (tahlil, hekim görüşü) istenir ve plan ikinci görüşmeye bırakılır.'],
   ['h2', 'Takip nasıl işler?'],
   ['p', 'Beslenme planı sabit bir belge değil, düzeltilerek ilerleyen bir süreçtir. Takip görüşmelerinde ne işe yaradığı, nerede zorlandığın ve planın nasıl uyarlanacağı konuşulur. Platform üzerinden randevularını, mesajlarını ve varsa reçetelerini tek yerden takip edebilirsin.'],
   ['h2', 'Uzman doğrulaması'],
   ['p', 'Platformda profil açan diyetisyenlerin diploma ve belgeleri incelenir; doğrulanan profillerde doğrulama işareti görünür. Doğrulama, o uzmanın belgelerinin kontrol edildiği anlamına gelir; verdiği hizmetin sonucuna dair bir garanti değildir.'],
   ['h2', 'Ücretler'],
   ['p', 'Görüşme ücretleri ve hizmet kapsamı her uzmanın kendi profilinde, Hizmetler bölümünde yazılıdır; süre ve görüşmenin çevrim içi mi yüz yüze mi olduğu da orada belirtilir. Randevu oluşturmadan önce bu bilgiyi kontrol et.']
  ],
  surec: {baslik: 'Bu Süreçte', maddeler: ['Diploma ve belge doğrulaması', 'Platform içi mesajlaşma', 'Sağlık verisi izinle paylaşılır']},
  uyari: 'Gebelik, emzirme, kronik hastalık, düzenli ilaç kullanımı, yeme bozukluğu öyküsü ve çocuk beslenmesi durumlarında beslenme değişikliği hekim ve diyetisyen kontrolü olmadan yapılmamalıdır. Platformdaki hesaplayıcı ve programlar bu durumlarda tek başına yeterli değildir.',
  // Web üçüncü kartı DETAY.yasal (yasal/kvkk/) adresine bağlar; başlığa uyan metin Diyetisyen Doğrulama ve Kabul Politikası'dır.
  siradaki: {baslik: 'Sıradaki Adım', kartlar: [
   {ikon: 'wand-magic-sparkles', baslik: 'Diyetisyen Bul', metin: 'Hedefine ve ihtiyacına göre uygun uzmanı eşleştir.', git: '#/uzman/bul?adim=1'},
   {ikon: 'user-doctor', baslik: 'Diyetisyenler', metin: 'Tüm uzman profillerini tek listede incele.', git: '#/uzman/bul'},
   {ikon: 'user-check', baslik: 'Diyetisyen Doğrulama Politikası', metin: 'Belgelerin nasıl incelendiğini ve doğrulamanın ne anlama geldiğini oku.', git: '#/yasal/diyetisyen-dogrulama'}]}
 },
 // Diyetisyen Ol: web diyetisyen-ol/ (_src/sayfalar/public-araclar/diyetisyen-ol.mjs + assets/js/sayfa/public-araclar-basvuru.js).
 // Dosya yüklenmez, yalnız adı listelenir. Taslak bu cihazda; e-posta, telefon ve diploma numarası taslağa yazılmaz. Komisyon oranı web verisinden (%10).
 "diyetisyen-ol": {
  baslik: 'Diyetisyen Ol', etiket: 'Uzman başvurusu', h1: 'Dada Diet’te diyetisyen olarak danışan kabul et',
  alt: 'Profilini oluştur, online ya da yüz yüze randevu al, beslenme planlarını tek panelden yönet. Başvurun ekibimizce incelenir.',
  guven: [['calendar-check', 'Yerleşik randevu sistemi'], ['clipboard-list', 'Plan oluşturucu ve danışan takibi']],
  surec: {baslik: 'Başvuru Süreci', adimlar: [
   {ikon: 'pen-to-square', baslik: 'Formu doldur', metin: 'Mesleki bilgiler ve diploma belgesi.'},
   {ikon: 'file-shield', baslik: 'Diploma doğrulama', metin: 'Ekibimiz belgelerini kontrol eder (2-3 iş günü).'},
   {ikon: 'comments', baslik: 'Ön görüşme', metin: 'Kısa bir tanışma görüşmesi yapılır.'},
   {ikon: 'circle-check', baslik: 'Profilin yayında', metin: 'Panelden hizmet ve takvimini kur, randevu almaya başla.'}]},
  bolumler: [['kisisel', 'user', 'Kişisel Bilgiler'], ['mesleki', 'graduation-cap', 'Mesleki Bilgiler'], ['belgeler', 'file-shield', 'Belgeler ve Görseller'], ['profil', 'id-card', 'Profil ve Hizmet']],
  alanlar: {
   ad: {etiket: 'Ad', yer: 'Adın', hata: 'Adını yaz.'},
   soyad: {etiket: 'Soyad', yer: 'Soyadın', hata: 'Soyadını yaz.'},
   eposta: {etiket: 'E-posta', yer: 'ad@site.com', hata: 'Geçerli bir e‑posta adresi yaz (ad@site.com).'},
   telefon: {etiket: 'Telefon', hata: 'Telefon numaranı yaz.'},
   sehir: {etiket: 'Şehir', secenekler: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'], hata: 'Şehir seç.'},
   cinsiyet: {etiket: 'Cinsiyet', secenekler: ['Kadın', 'Erkek', 'Belirtmek istemiyorum']},
   diploma: {etiket: 'Diploma / lisans no', yer: 'Beslenme ve Diyetetik diploma numaran', hata: 'Diploma numaranı yaz.', yardim: 'Yalnız doğrulama için kullanılır, profilinde gösterilmez.'},
   universite: {etiket: 'Mezun olduğun üniversite', yer: 'Örn. Hacettepe Üniversitesi', hata: 'Üniversiteni yaz.'},
   mezuniyet: {etiket: 'Mezuniyet yılı', yer: '2015', min: 1970, max: 2026, hata: 'Geçerli bir yıl gir.'},
   unvan: {etiket: 'Unvan', secenekler: ['Diyetisyen', 'Uzman Diyetisyen', 'Dr. Diyetisyen'], hata: 'Unvan seç.'},
   deneyim: {etiket: 'Deneyim (yıl)', yer: 'Örn. 9', min: 0, max: 60, hata: 'Deneyim yılını gir.'},
   uzmanlik: {etiket: 'Uzmanlık alanların', ozet: 'Uzmanlık alanı', en: 5, secenekler: ['Kilo Yönetimi', 'Sporcu Beslenmesi', 'Çocuk & Ergen Beslenmesi', 'Gebelik & Emzirme', 'Klinik / Hastalık Beslenmesi', 'Bağırsak Sağlığı', 'Hormonal Denge & PCOS', 'Vejetaryen & Vegan', 'İnsülin Direnci & Diyabet', 'Yeme Davranışı', 'Geriatri Beslenmesi', 'Onkoloji Beslenmesi'], yardim: 'En fazla 5 alan seç; profilinde etiket olarak görünür.', hata: 'En az bir uzmanlık alanı seç.', fazla: 'En fazla 5 uzmanlık alanı seçebilirsin.'},
   diller: {etiket: 'Görüşme dilleri', yer: 'Örn. Türkçe, İngilizce'},
   diplomaDosya: {etiket: 'Diploma belgesi', yardim: 'PDF, JPG veya PNG, en çok 10 MB', kabul: '.pdf,.jpg,.jpeg,.png', sec: 'Dosyanı seç', hata: 'Diploma belgesi gerekli.'},
   sertifika: {etiket: 'Sertifikalar', yardim: 'Birden fazla dosya ekleyebilirsin', kabul: '.pdf,.jpg,.jpeg,.png', sec: 'Dosyalarını ekle', coklu: true},
   foto: {etiket: 'Profil fotoğrafı', yardim: 'Net, vesikalık tarzı; kare kesilir', kabul: '.jpg,.jpeg,.png', sec: 'Dosyanı seç', hata: 'Profil fotoğrafı gerekli.'},
   bio: {etiket: 'Kısa biyografi', yer: 'Yaklaşımını ve danışanlarına nasıl yardımcı olduğunu anlat; profilinde gösterilir.', max: 600, hata: 'Kısa biyografini yaz.'},
   gorusme: {etiket: 'Görüşme türü', secenekler: [{k: 'online', ad: 'Online', alt: 'Görüntülü görüşme', ikon: 'video'}, {k: 'yuz', ad: 'Yüz yüze', alt: 'Klinik ya da ofis', ikon: 'house-medical'}], hata: 'En az bir görüşme türü seç.'},
   klinikAd: {etiket: 'Klinik / ofis adı'},
   klinikAdres: {etiket: 'Klinik / ofis adresi', yardim: 'Yüz yüze görüşme varsa profilinde il ve ilçe görünür.'},
   ucretNot: {etiket: 'Hizmet ve ücret notu', yer: 'Paketlerini ve ücret aralığını kısaca belirt; onay sonrası panelden detaylandırırsın.'}
  },
  belgeNot: 'Belgeler yalnız doğrulama ekibi tarafından görülür.',
  onaylar: ['Verdiğim diploma ve belge bilgilerinin doğrulanması amacıyla işlenmesine açık rıza veriyorum.', 'Uzman Sözleşmesi ve KVKK Aydınlatma Metni’ni okudum, onaylıyorum.'],
  onayHata: 'Başvuru için iki onay da gerekli.',
  gonderNot: 'Başvurun genellikle 2-3 iş günü içinde değerlendirilir.', gonder: 'Başvuruyu gönder',
  taslakNot: 'Taslağın bu cihazda saklanır. E-posta, telefon ve diploma numarası kaydedilmez.',
  neden: {baslik: 'Neden Dada Diet?', maddeler: ['Yerleşik randevu, ödeme ve mesaj sistemi', 'İçerik üreterek görünürlük', 'Komisyon yalnızca tamamlanan görüşmede']},
  sss: {etiket: 'Sık sorulanlar', baslik: 'Başvurmadan Önce Bilmek İstediklerin', sorular: [
   {ikon: 'user-check', soru: 'Kimler başvurabilir?', yanit: 'Beslenme ve Diyetetik lisans diplomasına sahip diyetisyenler başvurabilir. Diploma numaran yalnız doğrulama için kullanılır, profilinde gösterilmez.'},
   {ikon: 'hourglass-half', soru: 'Doğrulama ne kadar sürer?', yanit: 'Başvurun genellikle 2-3 iş günü içinde değerlendirilir. Doğrulanmış Uzman rozeti yalnız kontrol tamamlandıktan sonra eklenir.'},
   {ikon: 'percent', soru: 'Komisyon nasıl işler?', yanit: 'Komisyon yalnızca tamamlanan görüşmede alınır, oran %10. Kazanç ve komisyon dökümünü panelindeki Kazançlarım ekranından izlersin.'},
   {ikon: 'users', soru: 'Danışan nasıl gelir?', yanit: 'Danışanlar seni Diyetisyen Bul sihirbazı ve diyetisyen vitrininden bulur; uzmanlık alanların ve görüşme kipin eşleşmeyi belirler.'}]},
  tamam: {baslik: 'Başvurun Alındı', durum: 'İncelemede', metin: '{ad}, başvurun {tarih} tarihinde alındı. Doğrulama 2-3 iş günü sürer.', not: 'Doğrulanmış Uzman rozeti onaydan sonra eklenir.', sirada: 'Sırada', eylem: 'Başvurunu gör'}
 }
};
