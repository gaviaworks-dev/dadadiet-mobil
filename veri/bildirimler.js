/* veri/bildirimler.js
 * DDV.bildirimler[]: { id, tur ('oruc'|'su'|'randevu'|'mesaj'|'program'), ikon, baslik, metin, zaman, grup ('Bugün'|'Dün'|'Bu hafta'), okundu, hedef (sekme adı) }
 * DDV.icerikler[]: { slug, baslik, ozet, kategori, ikon, gorsel, okumaDk } — başlık ve özet canlı /ipuclari/<slug>; görseller yereldir.
 */
window.DDV = window.DDV || {};
DDV.bildirimler = [
 {
  "id": 1,
  "tur": "oruc",
  "ikon": "hourglass-half",
  "baslik": "Pencerenin kapanmasına 3 saat kaldı",
  "metin": "Akşam yemeğin 19:30'da planlı. Pencere 20:05'te kapanıyor.",
  "zaman": "17:05",
  "grup": "Bugün",
  "okundu": false,
  "hedef": "ritim"
 },
 {
  "id": 2,
  "tur": "su",
  "ikon": "droplet",
  "baslik": "Su hedefinin yarısındasın",
  "metin": "Bugün 1.250 ml içtin. 5 bardak daha hedefine ulaştırır.",
  "zaman": "17:00",
  "grup": "Bugün",
  "okundu": false,
  "hedef": "bugun"
 },
 {
  "id": 3,
  "tur": "oruc",
  "ikon": "circle-check",
  "baslik": "16 saatlik orucu tamamladın",
  "metin": "Dün 20:00'de başlayan orucun 12:05'te bitti.",
  "zaman": "12:05",
  "grup": "Bugün",
  "okundu": false,
  "hedef": "ritim"
 },
 {
  "id": 4,
  "tur": "mesaj",
  "ikon": "comment-medical",
  "baslik": "Nehir Tunalı sana yazdı",
  "metin": "Gelecek haftanın menüsünü pazar akşamı dosyana ekleyeceğim.",
  "zaman": "10:02",
  "grup": "Bugün",
  "okundu": true,
  "hedef": "uzmanim"
 },
 {
  "id": 5,
  "tur": "program",
  "ikon": "calendar-check",
  "baslik": "Programında 12. gün",
  "metin": "Bugünün akşam yemeği: barbunya ve hindi, ıspanak.",
  "zaman": "09:00",
  "grup": "Bugün",
  "okundu": true,
  "hedef": "bugun"
 },
 {
  "id": 6,
  "tur": "randevu",
  "ikon": "video",
  "baslik": "Salı 18:30 randevun yaklaşıyor",
  "metin": "Uzm. Dyt. Nehir Tunalı ile haftalık takip görüşmesi.",
  "zaman": "Dün 19:00",
  "grup": "Dün",
  "okundu": true,
  "hedef": "uzmanim"
 },
 {
  "id": 7,
  "tur": "su",
  "ikon": "droplet",
  "baslik": "Bir bardak su iyi gelir",
  "metin": "Öğleden sonra su alımın düşüyor. 1 su bardağı (200 ml) ekleyebilirsin.",
  "zaman": "Dün 15:00",
  "grup": "Dün",
  "okundu": true,
  "hedef": "bugun"
 },
 {
  "id": 8,
  "tur": "program",
  "ikon": "trophy",
  "baslik": "23 günlük seri",
  "metin": "23 gündür öğünlerini kaydediyorsun.",
  "zaman": "Dün 09:00",
  "grup": "Dün",
  "okundu": true,
  "hedef": "bugun"
 },
 {
  "id": 9,
  "tur": "mesaj",
  "ikon": "note-sticky",
  "baslik": "Diyetisyen notun eklendi",
  "metin": "Haftalık değerlendirme notunu Sağlık Dosyam'da görebilirsin.",
  "zaman": "3 Kasım",
  "grup": "Bu hafta",
  "okundu": true,
  "hedef": "saglik"
 },
 {
  "id": 10,
  "tur": "randevu",
  "ikon": "calendar-days",
  "baslik": "Görüşmen tamamlandı",
  "metin": "Salı günkü görüşmen kayda alındı, 7 seansın kaldı.",
  "zaman": "3 Kasım",
  "grup": "Bu hafta",
  "okundu": true,
  "hedef": "uzmanim"
 }
];

DDV.icerikler = [
 {
  "slug": "gunde-ne-kadar-su-icmek-gerekir",
  "baslik": "Günde ne kadar su içmek gerekir?",
  "ozet": "Rehberin referans değeri 18-50 yaşta erkeklerde 2,5, kadınlarda 2,0 litre toplam su. Bunun yüzde sekseni, yani 8-10 bardak, su ve içeceklerden gelmeli.",
  "kategori": "Su",
  "ikon": "droplet",
  "gorsel": "assets/gorsel/hero/ritim-su.webp",
  "okumaDk": 2
 },
 {
  "slug": "ara-ogunde-ne-yenir",
  "baslik": "Ara öğünde ne yenir?",
  "ozet": "Ara öğünün işi ana öğündeki porsiyonu küçültmektir; bunu ancak ölçüsü baştan belliyse yapar. Bir avuç cevizle bir porsiyon ayran arasında 1,6 katlık fark var.",
  "kategori": "Öğün Düzeni",
  "ikon": "apple-whole",
  "gorsel": "assets/gorsel/yemek/naneli-meyve-salatasi.webp",
  "okumaDk": 2
 },
 {
  "slug": "aralikli-oruc-kimin-icin-uygun",
  "baslik": "Aralıklı oruç kimin için uygun?",
  "ozet": "Herkese uyan bir yöntem değil. Rehber bazı grupları açıkça dışarıda bırakıyor ve ağırlık kaybı bakımından diğer yöntemlere üstün bulunmadığını yazıyor.",
  "kategori": "Öğün Düzeni",
  "ikon": "hourglass-half",
  "gorsel": "assets/gorsel/hero/ritim-cay.webp",
  "okumaDk": 2
 },
 {
  "slug": "disarida-yerken-porsiyon-nasil-tutulur",
  "baslik": "Dışarıda yerken porsiyon nasıl tutulur?",
  "ozet": "Dışarıda porsiyonu belirleyen kişi sen değilsin. Elde kalan araçlar sıra, paylaşım ve tabakta ne kadarının bırakılacağıdır.",
  "kategori": "Porsiyon",
  "ikon": "utensils",
  "gorsel": "assets/gorsel/hero/lokanta-deniz.webp",
  "okumaDk": 2
 },
 {
  "slug": "etiketteki-ilk-uc-malzeme-neden-onemli",
  "baslik": "Etiketteki ilk üç malzeme neden önemli?",
  "ozet": "İçindekiler listesi ağırlığa göre sıralanır, bu yüzden ilk üç satır ürünün ne olduğunu ön yüzdeki metinden daha doğru anlatır.",
  "kategori": "Alışveriş",
  "ikon": "barcode",
  "gorsel": "assets/gorsel/hero/mutfak-raf.webp",
  "okumaDk": 2
 },
 {
  "slug": "tabakta-once-neyi-yemeli",
  "baslik": "Tabakta önce neyi yemeli?",
  "ozet": "Sıra, tabaktaki miktara hiç dokunmadan öğünün nasıl bittiğini değiştirebilir. Çalıştığı yer besin değeri değil, tempo ve karar sırasıdır.",
  "kategori": "Öğün Düzeni",
  "ikon": "plate-wheat",
  "gorsel": "assets/gorsel/hero/tabak-duzeni.webp",
  "okumaDk": 2
 },
 {
  "slug": "kahvaltiyi-doyurucu-yapan-nedir",
  "baslik": "Kahvaltıyı doyurucu yapan nedir?",
  "ozet": "Kalem sayısı değil grup sayısı. Bir porsiyon yumurta 100 gram ve 12,58 gram protein; bir porsiyon ekmek 50 gram ve 4,7 gram protein taşıyor.",
  "kategori": "Öğün Düzeni",
  "ikon": "mug-saucer",
  "gorsel": "assets/gorsel/hero/kayit-kahvalti.webp",
  "okumaDk": 2
 },
 {
  "slug": "bir-avuc-kuruyemis-ne-kadar-eder",
  "baslik": "Bir avuç kuruyemiş ne kadar eder?",
  "ozet": "Sert kabuklularda bir porsiyon 30 gram net; aynı 30 gram kajuda 18-20, bademde 24-26 tane eder ve kajuda 172, cevizde 204 kalori taşır.",
  "kategori": "Porsiyon",
  "ikon": "hand",
  "gorsel": "assets/gorsel/besin/badem.webp",
  "okumaDk": 2
 }
];
