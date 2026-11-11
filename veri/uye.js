/* veri/uye.js — üye alanı (web Hesabım eşi) ekranlarının verisi. Oturum açmış Zeynep Kaya'ya aittir; misafir ve yeni hesapta ekranlar bu veriyi okumaz (boş hal).
 * Kaynak: web dadadiet-prototip hesabim/* sayfaları ve _src/veri/demo.json (rozet kataloğu, kademeler, SSS, talep konuları, grup kuralları, meydan okumalar canlı tohumdan).
 * Kullanıcı kayıtları (rozet tarihleri, ödemeler, talepler, grup gönderileri, plan sürümleri) kurgudur; kişi adları gerçek kişilere ait değildir.
 * Slug'lar: besin DDV.besinler, ipucu DDV.icerikler, uzman DDV.diyetisyenler, program DDV.programlar.
 *
 * DDV.uye: {
 *   kayitli: { besinler[], ipuclari[], uzmanlar[], tarihler:{'tur|slug':iso} }   // DD.durum 'kayitli-<tur>' varsayılanı (programlar: 'kayitliProgramlar', varsayılan [])
 *   programGecmisi: [{ slug, baslangic, bitis, durum ('tamamlandi'|'birakildi'), tamam, toplam }]   // aktif program DDV.kullanici.aktifProgram
 *   aktifUyum: [[iso, tamam, toplam]]   // aktif programın bugünden önceki günleri; bugün DD.ogun'dan okunur
 *   rozet: { aileler:[{ad, ikon, not, rozetler:[{id, ad, puan, ikon, aciklama, olcu?}]}], kazanilan:[{id, tarih}],
 *            kademeler:[{ad, ikon, puan, gun, hedef}], baslangic (iso, takip günü sayacının başı), sayaclar:{ogunKalemi, kapaliGun, seri, olcum},
 *            liderlik:[{ad, kullanici, rozet, puan}], meydan:[{id, ad, rozet, ikon, sure, kural ('elle'|'su'), hedefMl?, aciklama, gorev, kaynak}], meydanKatilim:{id:{baslangic, isaret:{iso:true}}} }
 *            olcu: 'program' tamamlanan program, 'olcum' ölçüm, 'kayit' kaydedilen içerik, 'besin' kaydedilen besin, 'puan', 'gun' takip günü, 'seri' gün serisi, 'kalem' öğün kalemi, 'kapali' kapalı gün, 'test', 'meydan:<id>'; n ve hedef ekranda hesaplanır
 *   gruplar: [{ id, ad, ikon, gorsel, aciklama (**vurgu** içerir), uyeSayisi, saglik }], grupKurallari[], katildigim:{id:{gorunen, tarih}},
 *   gonderiler: {grupId:[{ id, yazar, metin, zaman, begeni, moderator?, yorumlar:[{yazar, metin, zaman}] }]}
 *   sss: [{ kategori, ikon, sorular:[{soru, yanit, ikon}] }], talepKonulari[],
 *   talepler: [{ id, baslik, konu, durum ('acik'|'yanit'|'cozulen'|'kapali'), tarih, mesajlar:[{kim ('ben'|'destek'), tarih, saat, metin}] }]
 *   kademeler: [{ kod, ad, tamAd, ikon, fiyat (TL/ay, örnek), ozet, ozellikler[] }], abonelik: { kademe, baslangic?, donemBas?, donemBit?, yenileme? (iso), kart? }
 *   pro: { satista, rozet, fiyatEtiketi, durumMetni, fiyatNotu, dugme }   // Pro satışa açılmadı (karar 1): Pro'ya giden her ekran bu metni ve etiketi kullanır
 *   kartlar: [{ id, marka, ikon, son, skt, varsayilan }], eklenebilirKart, faturaBilgi: { tip, ad, eposta, telefon, il, ilce, adres, unvan, vergiDairesi, vkn }
 *   odemeler: [{ id, no, tarih, tur ('abonelik'|'paket'|'tek'|'iade'), baslik, tutar, durum ('odendi'|'iade-edildi'|'iade-surecinde'), kart }]
 *   gecmisPaketler: [{ diyetisyen, paket, ad, seans, alinma, bitis }]
 *   plan: { ad, surum, tarih, hedefKcal, makro:{P,K,Y,Lif}, not, revizyonlar:[{surum, tarih, baslik, degisiklikler[]}] }, planNotlari:[{tarih, konu, metin}], notKonulari[]
 *   gorus: { konular:[{k, ad, ikon}], alanlar[], soruKonulari[], teknikYerler[], ihlalTurleri[] }   // Görüş Bildir; gönderimler DD.durum 'gorus-gonderimleri'
 *   oneri: { turler[], alanlar[], mesajEnAz, mesajEnCok }   // Çözüm Merkezi Öneri ve şikâyet; gönderimler DD.durum 'oneri-gonderimleri'
 * } */
window.DDV = window.DDV || {};
DDV.uye = {
  kayitli: {
    besinler: ['mercimek-haslanmis', 'ispanak-haslanmis', 'badem'],
    ipuclari: ['aralikli-oruc-kimin-icin-uygun', 'ara-ogunde-ne-yenir', 'gunde-ne-kadar-su-icmek-gerekir'],
    uzmanlar: ['dyt-ceren-soylu'],
    tarihler: {
      
      'besin|mercimek-haslanmis': '2026-08-21', 'besin|ispanak-haslanmis': '2026-09-08', 'besin|badem': '2026-10-18',
      'ipucu|aralikli-oruc-kimin-icin-uygun': '2026-10-24', 'ipucu|ara-ogunde-ne-yenir': '2026-10-30', 'ipucu|gunde-ne-kadar-su-icmek-gerekir': '2026-11-02',
      'uzman|dyt-ceren-soylu': '2026-08-18'
    }
  },

  programGecmisi: [
    {slug: 'olculu-porsiyon-iki-hafta', baslangic: '2026-01-12', bitis: '2026-01-25', durum: 'tamamlandi', tamam: 60, toplam: 70},
    {slug: 'lif-odakli-hafta', baslangic: '2026-06-08', bitis: '2026-06-11', durum: 'birakildi', tamam: 13, toplam: 20},
    {slug: 'akdeniz-tipi-beslenme', baslangic: '2026-10-13', bitis: '2026-10-19', durum: 'tamamlandi', tamam: 31, toplam: 35}
  ],
  aktifUyum: [
    ['2026-10-26', 3, 3], ['2026-10-27', 3, 3], ['2026-10-28', 2, 3], ['2026-10-29', 3, 3], ['2026-10-30', 3, 3], ['2026-10-31', 2, 3],
    ['2026-11-01', 3, 3], ['2026-11-02', 3, 3], ['2026-11-03', 3, 3], ['2026-11-04', 2, 3], ['2026-11-05', 3, 3]
  ],

  rozet: {
    baslangic: '2025-12-06',
    sayaclar: {ogunKalemi: 812, kapaliGun: 214},
    aileler: [
      {ad: 'Başlangıç', ikon: 'flag', not: 'İlk kez yaptıkların: kişisel kilometre taşların.', rozetler: [
        {id: 'ilk-adim', ad: 'İlk Adım', puan: 10, ikon: 'shoe-prints', aciklama: 'İlk günlük takip kaydını gir.'},
        {id: 'ilk-olcum', ad: 'İlk Ölçüm', puan: 10, ikon: 'weight-scale', aciklama: 'İlk ölçümünü kaydet.'},
        {id: 'ilk-hedef', ad: 'İlk Hedef', puan: 10, ikon: 'flag', aciklama: 'Kendine ilk hedefini koy.'}]},
      {ad: 'Beslenme Takibi', ikon: 'utensils', not: 'Günlük takipte kaydettiğin gün ve öğün kalemi sayısı.', rozetler: [
        {id: 'otuz-gun', ad: 'Otuz Gün', puan: 50, ikon: 'calendar-check', aciklama: '30 farklı gün için takip kaydı gir.'},
        {id: 'takipci-1', ad: 'Takipçi I', puan: 10, ikon: 'utensils', aciklama: 'Toplam 25 öğün kalemi kaydet.'},
        {id: 'takipci-2', ad: 'Takipçi II', puan: 25, ikon: 'utensils', aciklama: 'Toplam 100 öğün kalemi kaydet.'},
        {id: 'takipci-3', ad: 'Takipçi III', puan: 50, ikon: 'utensils', aciklama: 'Toplam 500 öğün kalemi kaydet.'},
        {id: 'takipci-4', ad: 'Takipçi IV', puan: 100, ikon: 'utensils', aciklama: 'Toplam 2.000 öğün kalemi kaydet.', olcu: 'kalem', hedef: 2000}]},
      {ad: 'Süreklilik', ikon: 'fire', not: 'Kapattığın gün sayısı ve üst üste gelen gün serisi.', rozetler: [
        {id: 'elli-kapali', ad: 'Elli Kapalı Gün', puan: 50, ikon: 'circle-check', aciklama: 'Toplam elli günü kapat; üst üste olması gerekmez.'},
        {id: 'yedi-seri', ad: 'Yedi Günlük Seri', puan: 25, ikon: 'fire', aciklama: 'Yedi gün üst üste gününü kapat.'},
        {id: 'otuz-seri', ad: 'Otuz Günlük Seri', puan: 100, ikon: 'fire-flame-curved', aciklama: 'Otuz gün üst üste gününü kapat.'},
        {id: 'yuz-seri', ad: 'Yüz Günlük Seri', puan: 250, ikon: 'fire-flame-simple', aciklama: 'Yüz gün üst üste gününü kapat.', olcu: 'seri', hedef: 100}]},
      {ad: 'Program', ikon: 'clipboard-list', not: 'Başlattığın ve sonuna kadar götürdüğün beslenme programları.', rozetler: [
        {id: 'programa-basladim', ad: 'Programa Başladım', puan: 10, ikon: 'clipboard-list', aciklama: 'Bir beslenme programı başlat.'},
        {id: 'programi-bitirdim', ad: 'Programı Bitirdim', puan: 50, ikon: 'clipboard-check', aciklama: 'Bir programı sonuna kadar tamamla.'},
        {id: 'program-ustasi', ad: 'Program Ustası', puan: 100, ikon: 'list-check', aciklama: 'Beş programı tamamla.', olcu: 'program', hedef: 5}]},
      {ad: 'Ölçüm', ikon: 'chart-line', not: 'Sağlık dosyana kaydettiğin ölçüm sayısı.', rozetler: [
        {id: 'fotografli', ad: 'Fotoğraflı İlerleme', puan: 25, ikon: 'camera', aciklama: 'Beş ölçümüne fotoğraf ekle.'},
        {id: 'olcum-gunlugu', ad: 'Ölçüm Günlüğü', puan: 25, ikon: 'chart-line', aciklama: 'On ölçüm kaydet.'},
        {id: 'olcum-arsivi', ad: 'Ölçüm Arşivi', puan: 100, ikon: 'chart-column', aciklama: 'Elli ölçüm kaydet.', olcu: 'olcum', hedef: 50}]},
      {ad: 'Hedef', ikon: 'bullseye', not: 'Kendine koyduğun ve ulaştığın hedefler.', rozetler: [
        {id: 'hedefe-ulastim', ad: 'Hedefe Ulaştım', puan: 50, ikon: 'bullseye', aciklama: 'İlk hedefine ulaş.'},
        {id: 'ogun-duzeni', ad: 'Öğün Düzeni', puan: 25, ikon: 'clock', aciklama: 'Üç öğün takibi hedefine ulaş.'},
        {id: 'aliskanlik-ustasi', ad: 'Alışkanlık Ustası', puan: 100, ikon: 'repeat', aciklama: 'Üç alışkanlık hedefine ulaş.'},
        {id: 'hedef-avcisi', ad: 'Hedef Avcısı', puan: 250, ikon: 'crosshairs', aciklama: 'On hedefe ulaş.'}]},
      {ad: 'Keşif', ikon: 'compass', not: 'Çözdüğün test, kullandığın hesaplayıcı, kaydettiğin içerik ve besin.', rozetler: [
        {id: 'test-cozucu', ad: 'Test Çözücü', puan: 10, ikon: 'list-check', aciklama: 'Üç farklı testi çöz.', olcu: 'test', hedef: 3},
        {id: 'hesaplayici-kasifi', ad: 'Hesaplayıcı Kâşifi', puan: 25, ikon: 'calculator', aciklama: 'Beş farklı hesaplayıcı kullan.'},
        {id: 'arsivci', ad: 'Arşivci', puan: 50, ikon: 'bookmark', aciklama: 'Yirmi beş içerik kaydet.', olcu: 'kayit', hedef: 25},
        {id: 'besin-kasifi', ad: 'Besin Kâşifi', puan: 50, ikon: 'carrot', aciklama: 'Elli farklı besin kaydet.', olcu: 'besin', hedef: 50}]},
      {ad: 'Özel', ikon: 'star', not: 'Üyelik süresi, toplam puan ve topluluk katkısı.', rozetler: [
        {id: 'topluluk-gonullusu', ad: 'Topluluk Gönüllüsü', puan: 25, ikon: 'hand-holding-heart', aciklama: 'Topluluğa katkısı için Dada Diet ekibi verir.'},
        {id: 'ilk-uyelerden', ad: 'İlk Üyelerden', puan: 25, ikon: 'hourglass-start', aciklama: 'Açılış döneminde katılan üyelere verilir.'},
        {id: 'bir-yil', ad: 'Bir Yıldır Buradasın', puan: 100, ikon: 'cake-candles', aciklama: 'Bir yıllık üyeliğini tamamla.', olcu: 'gun', hedef: 365},
        {id: 'bin-puan', ad: 'Bin Puan', puan: 50, ikon: 'star', aciklama: 'Toplam bin katkı puanına ulaş.', olcu: 'puan', hedef: 1000}]},
      {ad: 'Meydan Okumalar', ikon: 'trophy', not: 'Sonuna kadar götürdüğün meydan okumalar.', rozetler: [
        {id: 'sekersiz-21', ad: '21 Gün Şekersiz Yaşam', puan: 50, ikon: 'cube', aciklama: '“21 Gün Şekersiz Yaşam” meydan okumasını sonuna kadar götür.', olcu: 'meydan:sekersiz-21', hedef: 21},
        {id: 'su-14', ad: '14 Günlük Su Serüveni', puan: 50, ikon: 'droplet', aciklama: '“14 Günlük Su Serüveni” meydan okumasını sonuna kadar götür.', olcu: 'meydan:su-14', hedef: 14}]}
    ],
    kazanilan: [
      {id: 'ilk-adim', tarih: '2025-12-06'}, {id: 'ilk-olcum', tarih: '2025-12-06'}, {id: 'ilk-uyelerden', tarih: '2025-12-06'}, {id: 'ilk-hedef', tarih: '2025-12-07'},
      {id: 'yedi-seri', tarih: '2025-12-13'}, {id: 'takipci-1', tarih: '2025-12-20'}, {id: 'otuz-gun', tarih: '2026-01-05'}, {id: 'programa-basladim', tarih: '2026-01-12'},
      {id: 'programi-bitirdim', tarih: '2026-01-25'}, {id: 'elli-kapali', tarih: '2026-01-28'}, {id: 'takipci-2', tarih: '2026-02-10'}, {id: 'ogun-duzeni', tarih: '2026-02-20'},
      {id: 'olcum-gunlugu', tarih: '2026-03-06'}, {id: 'otuz-seri', tarih: '2026-04-02'}, {id: 'fotografli', tarih: '2026-05-14'}, {id: 'takipci-3', tarih: '2026-07-18'}
    ],
    // Kademe üç ölçütle atlanır: puan, takip günü, ulaşılan hedef (Hedef ailesinden kazanılan rozet).
    kademeler: [
      {ad: 'Başlangıç', ikon: 'flag', puan: 0, gun: 0, hedef: 0}, {ad: 'Fidan', ikon: 'seedling', puan: 100, gun: 7, hedef: 0},
      {ad: 'Filiz', ikon: 'leaf', puan: 300, gun: 20, hedef: 1}, {ad: 'Dengeli', ikon: 'scale-balanced', puan: 650, gun: 45, hedef: 3},
      {ad: 'Kararlı', ikon: 'mountain', puan: 1200, gun: 90, hedef: 6}, {ad: 'Usta', ikon: 'medal', puan: 1900, gun: 180, hedef: 12},
      {ad: 'Rehber', ikon: 'compass', puan: 2800, gun: 365, hedef: 20}, {ad: 'Öncü', ikon: 'crown', puan: 3800, gun: 500, hedef: 30}
    ],
    liderlik: [
      {ad: 'Selin A.', kullanici: 'selina', rozet: 21, puan: 640}, {ad: 'Mert K.', kullanici: 'mertk', rozet: 15, puan: 455}, {ad: 'Elif T.', kullanici: 'eliftas', rozet: 12, puan: 310},
      {ad: 'Burak Ö.', kullanici: 'burako', rozet: 9, puan: 205}, {ad: 'Deniz Y.', kullanici: 'denizy', rozet: 7, puan: 150}, {ad: 'Can B.', kullanici: 'canb', rozet: 4, puan: 50}, {ad: 'Ece S.', kullanici: 'eces', rozet: 2, puan: 20}
    ],
    meydan: [
      {id: 'sekersiz-21', ad: '21 Gün Şekersiz Yaşam', rozet: 'sekersiz-21', ikon: 'cube', sure: 21, kural: 'elle', aciklama: '21 gün boyunca eklenmiş şeker içeren yiyecek ve içecekleri bırakmayı dene. Her akşam gününü işaretle; seri uzadıkça alışkanlık yerleşir.', gorev: 'Bugün eklenmiş şeker içeren yiyecek ya da içecek tüketmedim.', kaynak: 'WHO, Guideline: Sugars intake for adults and children (2015)'},
      {id: 'su-14', ad: '14 Günlük Su Serüveni', rozet: 'su-14', ikon: 'glass-water', sure: 14, kural: 'su', hedefMl: 2000, aciklama: '14 gün boyunca içtiğin suyu kaydet. Günün toplamı 2.000 ml’ye ulaşınca gün kendiliğinden işaretlenir.', gorev: 'Gün içinde en az 2.000 ml su içip kaydet.', kaynak: 'EFSA, Dietary reference values for water (2010)'}
    ],
    meydanKatilim: {'su-14': {baslangic: '2026-11-01', isaret: {}}}
  },

  gruplar: [
    {id: 'aralikli-oruc', ad: 'Aralıklı Oruç Yapanlar', ikon: 'hourglass-half', gorsel: 'assets/gorsel/hero/ritim-cay.webp', uyeSayisi: 1284, saglik: false, aciklama: '**16:8 ve benzeri öğün pencereleriyle** yaşayanların ritim, sofra ve pencere deneyimlerini paylaştığı grup.'},
    {id: 'akdeniz-mutfagi', ad: 'Akdeniz Mutfağını Sevenler', ikon: 'leaf', gorsel: 'assets/gorsel/hero/lokanta-deniz.webp', uyeSayisi: 862, saglik: false, aciklama: '**Zeytinyağlı, sebze ve baklagil ağırlıklı** sofralar kuranların tarif ve alışveriş önerileri.'},
    {id: 'kilo-verme-yolculugu', ad: 'Kilo Verme Yolculuğu', ikon: 'weight-scale', gorsel: 'assets/gorsel/hero/program-kilo.webp', uyeSayisi: 2140, saglik: false, aciklama: '**Yavaş ve sürdürülebilir** kilo verenlerin motivasyon, plato ve alışkanlık konuştuğu grup.'},
    {id: 'pcos-ile-savasanlar', ad: 'PCOS ile Savaşanlar', ikon: 'heart-pulse', gorsel: 'assets/gorsel/hero/denge-yesil.webp', uyeSayisi: 417, saglik: true, aciklama: '**Polikistik over sendromu (PCOS)** ile yaşayanların deneyim paylaştığı ve birbirine destek olduğu grup.'},
    {id: 'veganliga-adim-atanlar', ad: 'Veganlığa Adım Atanlar', ikon: 'seedling', gorsel: 'assets/gorsel/hero/program-vegan.webp', uyeSayisi: 593, saglik: false, aciklama: '**Bitkisel beslenmeye geçiş** sürecindekilerin tarif ve deneyim paylaştığı grup.'}
  ],
  grupKurallari: [
    'Saygılı ol; kimseyi yargılama.',
    'Tanı ya da ilaç önerisi verme; tıbbi kararlar hekiminle verilir.',
    'Kişisel bilgilerini (telefon, adres, tahlil belgesi) paylaşma.',
    'Reklam ve ürün tanıtımı yapma.',
    'Kurala aykırı içeriği şikâyet et; Dada Diet moderasyonu inceler.'
  ],
  sikayetNedenleri: ['Hakaret, zorbalık ya da yargılama', 'Tanı, ilaç ya da tedavi önerisi', 'Kişisel bilgi paylaşımı', 'Reklam ya da ürün tanıtımı', 'Yanlış ya da zararlı sağlık bilgisi', 'Diğer'],
  katildigim: {'aralikli-oruc': {gorunen: 'Zeynep K.', tarih: '2026-10-26'}, 'akdeniz-mutfagi': {gorunen: 'Zeynep K.', tarih: '2026-09-02'}},
  gonderiler: {
    'aralikli-oruc': [
      {id: 'ao-1', yazar: 'Dada Diet moderatörü', moderator: true, metin: 'Hoş geldin! Bu grupta öğün penceresi deneyimlerini paylaşıyoruz. Kuralları okumayı unutma; tanı ve ilaç kararlarını hekiminle ver.', zaman: '31 Ekim', begeni: 46, yorumlar: []},
      {id: 'ao-2', yazar: 'Derya M.', metin: 'Pencereyi 12.00’de açınca ilk öğünde protein koymak akşama kadar beni tok tutuyor. Haşlanmış yumurta ve peynir benim için kurtarıcı oldu.', zaman: 'Bugün 15.42', begeni: 18, yorumlar: [
        {yazar: 'Okan T.', metin: 'Bende de aynısı, bir de yanına bir avuç ceviz ekliyorum.', zaman: 'Bugün 16.05'}]},
      {id: 'ao-3', yazar: 'Okan T.', metin: 'İkinci haftadayım. Akşam 20.00’den sonra canım bir şey çekince bitki çayı demliyorum, alışkanlık hâline geldi.', zaman: 'Dün 21.10', begeni: 24, yorumlar: [
        {yazar: 'Derya M.', metin: 'Ihlamur deniyorum, akşam rutini gibi oldu.', zaman: 'Dün 21.32'},
        {yazar: 'Aslı K.', metin: 'Ben de papatya içiyorum, uykuya da iyi geliyor.', zaman: 'Bugün 08.14'}]},
      {id: 'ao-4', yazar: 'Aslı K.', metin: 'Hafta sonu sofralarında pencereyi kaydırmak zorunda kalıyorum. Siz nasıl yönetiyorsunuz?', zaman: '4 Kasım', begeni: 9, yorumlar: [
        {yazar: 'Okan T.', metin: 'Pazar günü bir saat geç açıyorum, sonra yine düzene dönüyorum.', zaman: '4 Kasım'}]}
    ],
    'akdeniz-mutfagi': [
      {id: 'am-1', yazar: 'Dada Diet moderatörü', moderator: true, metin: 'Hoş geldin! Akdeniz sofralarından öğün ve alışveriş önerilerini burada paylaşıyoruz.', zaman: '2 Eylül', begeni: 31, yorumlar: []},
      {id: 'am-2', yazar: 'Nur Y.', metin: 'Bu hafta zeytinyağlı pırasayı bol limonla yaptım, yanına yoğurt koyunca tam bir akşam yemeği oldu.', zaman: 'Bugün 12.20', begeni: 14, yorumlar: []},
      {id: 'am-3', yazar: 'Kerem A.', metin: 'Semt pazarında mevsim sonu domatesleri çok uygundu; kurutup kışa sakladım. Kısırda harika oluyor.', zaman: '5 Kasım', begeni: 21, yorumlar: [
        {yazar: 'Nur Y.', metin: 'Fırında mı kuruttun, güneşte mi?', zaman: '5 Kasım'}]}
    ],
    'kilo-verme-yolculugu': [
      {id: 'kv-1', yazar: 'Dada Diet moderatörü', moderator: true, metin: 'Hoş geldin! Burada tartıdaki sayıdan çok alışkanlıkları konuşuyoruz. Kimseyi yargılamadan destek olalım.', zaman: '14 Eylül', begeni: 88, yorumlar: []},
      {id: 'kv-2', yazar: 'Merve D.', metin: 'Üç haftadır tartı aynı gösteriyor ama bel ölçüm iki santim azaldı. Ölçüyü de takip etmek moralimi koruyor.', zaman: 'Bugün 10.05', begeni: 37, yorumlar: [
        {yazar: 'Hakan S.', metin: 'Plato dönemi bende de oldu, sabırla geçti.', zaman: 'Bugün 11.40'}]},
      {id: 'kv-3', yazar: 'Hakan S.', metin: 'Öğle yemeğini evden getirmeye başladım, porsiyonu kendim belirleyince akşam daha rahatım.', zaman: '3 Kasım', begeni: 26, yorumlar: []}
    ],
    'pcos-ile-savasanlar': [
      {id: 'pc-1', yazar: 'Dada Diet moderatörü', moderator: true, metin: 'Hoş geldin! Bu grup deneyim paylaşımı içindir. Tanı ve tedavi kararlarını hekiminle ver; kurala aykırı bir gönderi görürsen şikâyet et.', zaman: '31 Ekim', begeni: 22, yorumlar: []},
      {id: 'pc-2', yazar: 'Gül E.', metin: 'Öğünleri düzenli saatlere oturtunca gün içindeki enerji düşüşlerim azaldı. Diyetisyenimle birlikte planladık.', zaman: '5 Kasım', begeni: 12, yorumlar: []}
    ],
    'veganliga-adim-atanlar': [
      {id: 'vg-1', yazar: 'Dada Diet moderatörü', moderator: true, metin: 'Hoş geldin! Bitkisel beslenmeye geçişte deneyimlerini paylaşabilirsin.', zaman: '1 Ekim', begeni: 19, yorumlar: []},
      {id: 'vg-2', yazar: 'İpek C.', metin: 'Nohutlu ve mercimekli yemekleri haftaya yaydım, protein tarafında rahatladım. Mercimek köftesi favorim.', zaman: '2 Kasım', begeni: 15, yorumlar: []}
    ]
  },

  sss: [
    {kategori: 'Üyelik ve hesap', ikon: 'user', sorular: [
      {ikon: 'user', soru: 'Dada Diet’e üye olmak ücretli mi?', yanit: 'Hayır, üyelik **ücretsiz**. Besin kütüphanesi, testler, temel programlar ve günlük takip ücretsizdir. Yalnız Pro kademeleri ve diyetisyen görüşmeleri ücretlidir.'},
      {ikon: 'id-card', soru: 'Profil bilgilerimi nasıl değiştiririm?', yanit: 'Menüdeki **Hesap Ayarları** ekranından adını, telefonunu ve fotoğrafını güncelleyebilirsin.'},
      {ikon: 'circle-pause', soru: 'Hesabımı silmeden ara verebilir miyim?', yanit: 'Evet. Hesabını **bir hafta ile üç ay** arasında dondurabilirsin; verilerin silinmez, giriş yaptığında hesabın kendiliğinden açılır.'},
      {ikon: 'user-slash', soru: 'Hesabımı silersem verilerime ne olur?', yanit: 'Silme talebinden sonra **30 gün** içinde giriş yaparsan silme iptal edilir. Süre dolunca planların, ölçümlerin ve kayıtların kalıcı olarak silinir.'},
      {ikon: 'medal', soru: 'Rozet ve kademe sistemi nasıl çalışır?', yanit: 'Takip, program ve ölçüm adımlarında **rozet** kazanırsın, puanın rozetlerden toplanır. Rozetler tıbbi bir başarı ölçüsü değildir.'}]},
    {kategori: 'Beslenme ve program', ikon: 'clipboard-list', sorular: [
      {ikon: 'clipboard-list', soru: 'Beslenme planım nereden geliyor?', yanit: 'Planını **diyetisyenin** hazırlar ya da bir program başlatırsın. Öğünlerin Beslenme planım ekranına ve Bugün’e düşer.'},
      {ikon: 'list-check', soru: 'Bir programı nasıl başlatırım?', yanit: 'Programlar ekranından birini seçip **Programa başla** dersin. Başlattığın program günlük öğünlerine bağlanır.'},
      {ikon: 'repeat', soru: 'Öğünümü değiştirebilir miyim?', yanit: 'Evet. Beslenme planım ekranında her öğünün **alternatiflerini** görürsün; büyük değişiklikleri diyetisyeninle konuş.'},
      {ikon: 'fire', soru: 'Günlük kalori hedefim nasıl belirleniyor?', yanit: 'Hedefin boyun, kilon ve hareket düzeninden hesaplanır; diyetisyenin varsa **onun belirlediği hedef** geçerlidir. Bu değer genel bilgi amaçlıdır.'}]},
    {kategori: 'Araçlar ve sağlık dosyası', ikon: 'file-medical', sorular: [
      {ikon: 'weight-scale', soru: 'Ölçümlerimi nereye girerim?', yanit: 'Kilo, bel ve yağ oranını **Sağlık dosyam** ekranından girersin.'},
      {ikon: 'file-medical', soru: 'Tahlil sonuçlarımı yükleyebilir miyim?', yanit: 'Evet. Alt menüdeki **Ne Yedim?** ile **tahlilini tarayabilirsin**; okunan değerler onaylamadan kayda geçmez. Yorum için hekimine ya da diyetisyenine başvur.'},
      {ikon: 'carrot', soru: 'Besin değerleri nereden geliyor?', yanit: 'Değerler **güncel besin veri tabanlarına** dayanır; her besinin kaynağı detay ekranında yazar.'}]},
    {kategori: 'Diyetisyen ve randevu', ikon: 'user-doctor', sorular: [
      {ikon: 'user-doctor', soru: 'Diyetisyenimi nasıl seçerim?', yanit: 'Diyetisyen bul ekranında **uzmanlık, şehir ve görüşme biçimine** göre süzersin. Diploma ve belgeler doğrulanır.'},
      {ikon: 'box-open', soru: 'Görüşme paketi nasıl alınır?', yanit: 'Diyetisyen profilinden paketi seçersin; **diyetisyen onayladığında** ödeme kayıtlı kartından alınır.'},
      {ikon: 'calendar-xmark', soru: 'Randevumu erteleyebilir miyim?', yanit: 'Evet, Uzmanım ekranından saati değiştirirsin. Talep **diyetisyen onayına** düşer; görüşmeye yakın iptallerde hak düşebilir.'},
      {ikon: 'user-shield', soru: 'Diyetisyenim verilerimi görüyor mu?', yanit: 'Yalnız **izin verdiğin** veriyi görür. İzinleri Sağlık dosyam ekranından istediğin an kapatırsın.'}]},
    {kategori: 'Pro ve ödeme', ikon: 'credit-card', sorular: [
      {ikon: 'layer-group', soru: 'Pro ve Pro Max arasındaki fark ne?', yanit: 'Pro gelişmiş program ve plan katmanını açar. **Pro Max** buna ayda bir diyetisyen görüşme hakkı ekler. Diyetisyen paketleri üyeliğe dahil değildir.'},
      {ikon: 'credit-card', soru: 'Kart bilgilerim güvende mi?', yanit: 'Pro planları için bugün ödeme alınmıyor; Dada Diet Pro için **kart bilgisi istemez**. Diyetisyen ödemelerinde tam kart numarası Dada Diet’te tutulmaz; yalnız marka, son dört hane ve son kullanma tarihi görünür.'},
      {ikon: 'ban', soru: 'Pro üyeliğimi istediğim zaman iptal edebilir miyim?', yanit: 'Pro planları **henüz satışa açılmadı**; bugün iptal edilecek bir Pro aboneliği yok. Üyelik ve iptal koşulları Kullanım Koşulları’nda yazar.'},
      {ikon: 'file-invoice', soru: 'Faturamı nereden alırım?', yanit: 'Ödemelerim ekranında her ödemenin **faturasını** açıp indirebilirsin.'}]},
    {kategori: 'Topluluk ve veri', ikon: 'people-group', sorular: [
      {ikon: 'people-group', soru: 'Destek grupları nedir?', yanit: 'Benzer hedefteki üyelerin **paylaşım alanıdır**. Gruplarda sağlık verin paylaşılmaz; yalnız yazdıkların görünür.'},
      {ikon: 'database', soru: 'Verilerimi nasıl indiririm?', yanit: 'Veri izinlerim ekranından **indirme paketi** hazırlatırsın; bağlantı e-postana gelir.'},
      {ikon: 'stethoscope', soru: 'Dada Diet tıbbi tavsiye verir mi?', yanit: 'Hayır. Araçlar ve içerikler **genel bilgi** amaçlıdır; tanı ve tedavi için hekimine başvur.'}]}
  ],
  talepKonulari: ['Hesap sorunu', 'Günlük takip', 'Program sorunu', 'Diyetisyen ve randevu', 'Mesajlaşma sorunu', 'Pro abonelik', 'Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Veri ve gizlilik', 'Teknik sorun', 'Sağlık içeriği bildirimi'],
  talepler: [
    {id: 'DD-2026-01000F', baslik: 'Akşam öğünü işareti kalkıyor', konu: 'Günlük takip', durum: 'acik', tarih: '2026-11-04', mesajlar: [
      {kim: 'ben', tarih: '2026-11-04', saat: '21.12', metin: 'Akşam öğününü işaretliyorum ama uygulamayı kapatıp açınca işaret kalkıyor.'}]},
    {id: 'DD-2026-01000E', baslik: 'Program günü yanlış görünüyor', konu: 'Program sorunu', durum: 'yanit', tarih: '2026-10-28', mesajlar: [
      {kim: 'ben', tarih: '2026-10-28', saat: '10.40', metin: 'Sekiz saatlik pencere programım 26 Ekim’de başladı ama Bugün ekranında bir gün geride görünüyor.'},
      {kim: 'destek', tarih: '2026-10-29', saat: '09.15', metin: 'Merhaba Zeynep Hanım, başlangıç saatini kontrol ettik. Telefonunun saat dilimi ayarını yazar mısın?'}]},
    {id: 'DD-2026-01000C', baslik: 'Rozetim tamamlandığı hâlde düşmedi', konu: 'Teknik sorun', durum: 'cozulen', tarih: '2026-10-21', mesajlar: [
      {kim: 'ben', tarih: '2026-10-21', saat: '19.02', metin: 'Akdeniz programını bitirdim ama program rozetim görünmüyor.'},
      {kim: 'destek', tarih: '2026-10-22', saat: '11.30', metin: 'Programı Bitirdim rozetini ocak ayında zaten kazanmışsın; aynı rozet ikinci kez verilmez. Program Ustası rozetinde ilerlemen arttı.'},
      {kim: 'ben', tarih: '2026-10-22', saat: '12.05', metin: 'Anladım, teşekkürler.'}]},
    {id: 'DD-2026-01000B', baslik: 'Fatura adresimi güncellemek istiyorum', konu: 'Fatura talebi', durum: 'kapali', tarih: '2026-10-16', mesajlar: [
      {kim: 'ben', tarih: '2026-10-16', saat: '14.20', metin: 'Fatura adresim eski kalmış, nasıl güncellerim?'},
      {kim: 'destek', tarih: '2026-10-17', saat: '10.05', metin: 'Ödemelerim ekranındaki Fatura bilgilerim satırından güncelleyebilirsin. Sonraki faturan yeni adresle kesilir.'}]},
    {id: 'DD-2026-010006', baslik: 'Görüşme ödemem iki kez çekildi', konu: 'Ödeme sorunu', durum: 'cozulen', tarih: '2026-09-16', mesajlar: [
      {kim: 'ben', tarih: '2026-09-16', saat: '09.48', metin: 'İlk görüşme ücreti kartımdan iki kez çekilmiş görünüyor.'},
      {kim: 'destek', tarih: '2026-09-17', saat: '13.10', metin: 'Mükerrer çekim iade edildi; bankana göre birkaç iş günü içinde hesabına geçer.'}]}
  ],

  kademeler: [
    {kod: 'ucretsiz', ad: 'Ücretsiz', tamAd: 'Dada Diet Ücretsiz', ikon: 'user', fiyat: 0, ozet: 'Beslenmeni izlemeye başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.', ozellikler: ['Günlük temel takip', 'Temel programlar', 'Su takibi', 'Sağlık profili', 'Temel test ve hesaplayıcılar', 'Kaydetme özellikleri']},
    {kod: 'pro', ad: 'Pro', tamAd: 'Dada Diet Pro', ikon: 'bolt', fiyat: 149, ozet: 'Program, plan ve araç katmanının tamamı: düzenli takip eden biri için.', ozellikler: ['Gelişmiş programlar', 'Kişisel beslenme planı ve PDF çıktısı', 'Gelişmiş menü planlama', 'Sınırsız kayıt geçmişi', 'Sağlık dosyası: belge, tahlil ve dışa aktarım', 'Reklamsız kullanım', 'Öncelikli destek']},
    {kod: 'promax', ad: 'Pro Max', tamAd: 'Dada Diet Pro Max', ikon: 'gem', fiyat: 449, ozet: 'Pro’nun tamamı, üstüne ayda bir diyetisyen görüşmesi ve sağlık dosyanı paylaşma.', ozellikler: ['Ayda bir diyetisyen görüşmesi', 'Sağlık dosyanı diyetisyeninle paylaşma (açık rızayla)']}
  ],
  // Pro satışa açılmadı (karar 1, 11 Kasım; web /pro ve hesabim/paketlerim ile aynı): üye Ücretsiz kademede, Pro tahsilatı yok.
  // Metinler web dadadiet-prototip pro/index.html ("Pro planları henüz satışa açılmadı; sitede bugün Pro için ödeme alınmıyor.", düğme "Satışa Açılmadı")
  // ve _src/sayfalar/uye-gastro/paketlerim.mjs:19/23 ("Pro ve Pro Max henüz satışa açılmadı", "tutar henüz belirlenmedi"). Fiyatlar örnek (Beyar: "örnek" etiketiyle).
  pro: {
    satista: false,
    rozet: 'Yakında',
    fiyatEtiketi: 'Örnek fiyat',
    durumMetni: 'Pro planları henüz satışa açılmadı; bugün Pro için ödeme alınmıyor.',
    fiyatNotu: 'Fiyatlar örnektir; Pro ve Pro Max için tutar henüz belirlenmedi.',
    dugme: 'Pro’ya geç'
  },
  abonelik: {kademe: 'ucretsiz'},
  kartlar: [
    {id: 'k1', marka: 'Visa', ikon: 'credit-card', son: '4242', skt: '08/27', varsayilan: true},
    {id: 'k2', marka: 'Mastercard', ikon: 'credit-card', son: '8821', skt: '03/27', varsayilan: false}
  ],
  eklenebilirKart: {id: 'k3', marka: 'Troy', ikon: 'credit-card', son: '1907', skt: '11/28', varsayilan: false},
  faturaBilgi: {tip: 'bireysel', ad: 'Zeynep Kaya', eposta: 'zeynep.kaya@posta.com', telefon: '0532 418 26 70', il: 'Ankara', ilce: 'Çankaya', adres: 'Bahçelievler Mah. 7. Cadde No: 14 D: 3', unvan: '', vergiDairesi: '', vkn: ''},
  odemeler: [
    {id: 'o5', no: 'DD-2026-004298', tarih: '2026-09-22', tur: 'paket', baslik: '3 ay paketi · 12 görüşme', tutar: 13900, durum: 'odendi', kart: 'k1', diyetisyen: 'uzm-dyt-nehir-tunali'},
    {id: 'o4', no: 'DD-2026-004281', tarih: '2026-09-16', tur: 'iade', baslik: 'Tek seans · mükerrer çekim iadesi', tutar: -1450, durum: 'iade-edildi', kart: 'k2', diyetisyen: 'uzm-dyt-nehir-tunali'},
    {id: 'o3', no: 'DD-2026-004266', tarih: '2026-09-15', tur: 'tek', baslik: 'Tek seans · ilk görüşme', tutar: 1450, durum: 'odendi', kart: 'k2', diyetisyen: 'uzm-dyt-nehir-tunali'}
  ],
  gecmisPaketler: [
    {diyetisyen: 'uzm-dyt-nehir-tunali', paket: 'tek', ad: 'Tek seans', seans: 1, alinma: '2026-09-15', bitis: '2026-09-15'}
  ],

  plan: {
    ad: '16:8 kilo yönetimi planı', surum: 3, tarih: '2026-11-03', hedefKcal: 1650, makro: {P: 110, K: 165, Y: 60, Lif: 28},
    not: 'Zeynep Hanım, bu hafta proteini biraz artırdım. Akşam öğününde baklagil ve yoğurdu birlikte tutmaya devam edin, öğün atlamamaya özen gösterin. 10 Kasım’da birlikte bakarız.',
    revizyonlar: [
      {surum: 3, tarih: '2026-11-03', baslik: 'Protein artırıldı', degisiklikler: ['Günlük hedef **1.650 kcal**, protein **110 g** oldu.', 'Akşam öğününe **baklagil ve yoğurt** eklendi.', 'Ara öğün **16.30**’a alındı.']},
      {surum: 2, tarih: '2026-10-26', baslik: '16:8 pencereye geçiş', degisiklikler: ['Öğünler **12.00-20.00** penceresine taşındı.', '**Sekiz Saatlik Pencere** programı başlatıldı.', 'Su hedefi **2,2 litre** olarak kaldı.']},
      {surum: 1, tarih: '2026-09-22', baslik: 'İlk plan', degisiklikler: ['Günlük hedef **1.600 kcal** olarak başladı.', 'Günde **üç ana, bir ara öğün** düzeni kuruldu.', 'D vitamini için **yağlı balık** haftaya yayıldı.']}
    ]
  },
  planNotlari: [
    {tarih: '2026-11-03', konu: 'Alternatif öğün', metin: 'Kahvaltıda yumurta yerine peynirli bir seçenek olabilir mi?'},
    {tarih: '2026-11-05', konu: 'Soru', metin: 'Pencere dışında şekersiz bitki çayı içebilir miyim?'}
  ],
  notKonulari: ['Alternatif öğün', 'Porsiyon', 'Öğün saati', 'Soru', 'Diğer'],

  // Görüş Bildir (#/gorus-bildir) ve Çözüm Merkezi Öneri ve şikâyet sekmesi. Kaynak: web _src/kabuk/canli-ogeler.mjs (gorusBildir) ve _src/sayfalar/uye-gastro/cozum-merkezi.mjs (oneri).
  gorus: {
    konular: [
      {k: 'oneri', ad: 'Önerim var', ikon: 'lightbulb'},
      {k: 'soru', ad: 'Bir sorum var', ikon: 'circle-question'},
      {k: 'teknik', ad: 'Teknik sorun', ikon: 'bug'},
      {k: 'ihlal', ad: 'İhlal bildirimi', ikon: 'shield-halved'},
      {k: 'puan', ad: 'Puan ver', ikon: 'face-smile'}
    ],
    alanlar: ['Beslenme', 'Programlar', 'Sağlık Araçları', 'Diyetisyenler', 'Beslenme Planım', 'Günlük Takibim', 'Diğer'],
    soruKonulari: ['Üyelik ve Hesap', 'Beslenme ve Program', 'Diyetisyen randevusu', 'Dada Diet Pro ve Ödeme', 'Diğer'],
    teknikYerler: ['Ana sayfa', 'Beslenme / Besin sayfası', 'Arama', 'Üyelik ve Giriş', 'Beslenme Planım / Günlük Takibim', 'Sağlık Dosyam / Veri İzinlerim'],
    ihlalTurleri: ['Telif hakkı', 'Uygunsuz içerik', 'Spam / yanıltıcı içerik', 'Diğer']
  },
  oneri: {turler: ['Öneri', 'Şikâyet'], alanlar: ['Besinler', 'Programlar', 'Hesaplayıcılar', 'Diyetisyenler', 'Beslenme Planım', 'Diğer'], mesajEnAz: 10, mesajEnCok: 1000}
};
