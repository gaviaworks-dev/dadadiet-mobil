# Dada Diet mobil: veri ve görsel envanteri

Yükleme: düz `<script>`, modül değil. Her dosya `window.DDV` altına yazar. Alan şemaları her dosyanın başındaki yorumda tam olarak durur; aşağıdaki liste özettir.

## Dosyalar

| Dosya | Global | Özet |
|---|---|---|
| kullanici.js | DDV.kullanici, DDV.bugun, DDV.gecmis | Profil ve hedefler; bugünün öğünleri (`dolu`/`planli`), su, duygu; son 14 gün |
| besinler.js | DDV.besinler (221), DDV.besinKategorileri, DDV.besinListeleri, DDV.yemekler (88), DDV.besinBul(slug) | 100 g değerleri, porsiyon birimleri, muadil; yemeklerde 1 porsiyon değeri |
| programlar.js | DDV.programlar (82), DDV.programFiltreleri, DDV.programBul, DDV.sureyeGore | Liste ve filtreler, Program Bul 5 adım ve puan kuralları |
| program-gunleri.js | DDV.programGunleri[slug] | 82 programın gün gün dökümü. 1 MB; yalnız program detayında yükle |
| diyetisyenler.js | DDV.diyetisyenler (7), DDV.diyetisyenFiltreleri, DDV.benimDiyetisyenim, DDV.eslesmeSorulari | Profil, paket, randevu, haftalık menü, sohbet, notlar, 3 soruluk eşleşme |
| saglik.js | DDV.saglik | Kilo/bel/yağ serileri (12 aylık, 8 haftalık), kan tahlilleri, AI analizleri, notlar |
| ritim.js | DDV.ritim | Protokoller, `durumlar.pencere` ve `durumlar.oruc`, son 7 gün, fazlar, sıvılar, notlar |
| ai.js | DDV.ai.{kamera, tabak, disarida, tahlil, ses, barkod, etiket} | Dada AI ekranları |
| denge.js | DDV.denge.{tabak, muadiller, kurtarma, kiyasla} | Denge & Tabak ekranları |
| onboarding.js | DDV.onboarding | giris + 11 adım, koşullar, kalori formülü |
| bildirimler.js | DDV.bildirimler (10), DDV.icerikler (8) | Bildirimler ve ipucu kartları |
| kayitlar.js | DDV.ogunKayitlari (33) | Tabaklarım: son 14 günün fotoğraflı öğün kayıtları; bugünkü 3 kayıt DDV.bugun ile aynı |

## Sabit an

Uygulamanın "şimdi"si Cuma 6 Kasım 2026, 17:10 (`DDV.bugun.simdi`). Yeme penceresi açık (12:05-20:05), bu yüzden `DDV.ritim.aktifDurum` değeri `pencere`. Orucu başlatınca `durumlar.oruc` kullanılır.

Bugünün değerleri: hedef 1650, tüketilen 1041, kalan 609, planlı akşam 551 kcal. Aktif program 12. gün.

## Kaynak durumu

- Canlıdan: besin değerleri, yemek değerleri, 82 program ve menüleri, filtre üyelikleri, sihirbaz soruları, diyetisyenlerde ünvan/uzmanlık/şehir/görüşme dağılımı, ipuçları.
- Kurgusal: 7 diyetisyenin adı, soyadı, slug'ı ve deneyim yılı (gerçek kişi değil), sohbet ve notlar.
- Canlıda yok, makul değer: paket fiyatları, porsiyonlarda `kaynak:'varsayılan'` olanlar, kan tahlili referans aralıkları, barkod ürünlerinin besin değerleri, Denge Skoru kırılımı, tüm kullanıcı kayıtları.
- Kayıtlar: kcal ve makrolar DDV.yemekler ve DDV.besinler değerlerinden; yemek gramları tahmin, kullanıcı ve diyetisyen notları kurgu. Geçmiş günlerin kayıt toplamı DDV.gecmis değerini aşmaz, kalan kayda geçmemiş öğünlerdir.
- Canlıda yok, boş bırakıldı: diyetisyen `puan`, `yorumSayisi`, `cinsiyet`.

## Tabak tanıma

`assets/gorsel/hero/kamera-tabak.webp` kare ve 700 px. `DDV.ai.tabak.bilesenler[].bbox` görselin yüzdesi cinsinden: `left:x%, top:y%, width:w%, height:h%`.

## Görseller

- assets/marka: dadadiet-renkli.svg, dadadiet-beyaz.svg, dadadiet-amblem.svg, apple-touch-icon.png, favicon.png, ikon-512.png, sosyal/google.svg, sosyal/facebook.svg
- assets/fonts: Gilroy-Light, Gilroy-Medium, Gilroy-ExtraBold (woff2)
- assets/fontawesome: css/all.min.css, webfonts (solid, regular, brands)

**gorsel/hero (25):** denge-yesil hazirlik-kutulari kamera-tabak-2 kamera-tabak karsilama-sofra karsilama kayit-kahvalti lokanta-deniz lokanta-istanbul mutfak-raf program-dengeli program-detoks program-kas program-kilo program-oruc program-protein program-seker program-vegan restoran-masa ritim-cay ritim-sakin ritim-sofra ritim-su tabak-duzeni uzman-masa 

**gorsel/yemek (88):** acili-ezme balik-corbasi bulgurlu-yaprak-sarma buzlu-cay cilbir cilekli-donmus-yogurt cilekli-smoothie citir-firin-patates domates-corbasi domates-dolmasi domatesli-bulgur-pilavi elma-kompostosu etli-kuru-fasulye etli-pirasa ezogelin-corbasi firin-balik-koftesi firin-sutlac firinda-sebze-turlusu firinda-sebzeli-tavuk firinda-tarcinli-elma havuclu-bezelye haydari imambayildi irmik-helvasi ispanakli-omlet izgara-sebzeli-dana-bonfile kabak-corbasi kabakli-tavuk-kofte kahvalti-patatesi karidesli-guvec kasarli-pide kazandibi kirmizi-mercimekli-makarna kisir kozlenmis-biberli-dana-guvec kozlenmis-patlican-salatasi kumpir kuru-fasulye kuru-meyve-hosafi kus-yuvasi-yumurta limonata mantarli-dana-sote mantarli-tavuk-corbasi manti menemen mercimek-corbasi mercimek-koftesi mercimekli-biber-dolmasi mercimekli-bulgur-pilavi mevsim-salatasi naneli-meyve-salatasi nohut-salatasi nohut-yemegi otlu-kaygana overnight-yulaf patatesli-yumurta peynirli-gozleme peynirli-krep piyaz pose-yumurtali-ekmek revani sebze-cubuklu-humus sebzeli-kuzu-sis sebzeli-levrek-bugulama sebzeli-makarna-salatasi sebzeli-muffin sebzeli-peynirli-omlet sebzeli-pirinc-pilavi sebzeli-tas-kebabi sebzeli-tavuk-guvec sebzeli-tavuk-sote sebzeli-tavuk-suyu-corbasi sebzeli-yumurta-muffin sekerpare soganli-yumurta soguk-kahve supangle tarcinli-firin-armudu tavuk-rulo tavuklu-sehriye-corbasi ton-balikli-salata yayla-corbasi yesil-mercimek-corbasi yesil-mercimek-yemegi yogurtlu-tavuk-sis zencefilli-bal-kabagi-corbasi zeytinyagli-kabak-dolmasi zeytinyagli-pirasa 

**gorsel/program (82):** her program için `<slug>.webp` (`DDV.programlar[].kapak`)

**gorsel/besin (160):** `<besin-slug>.webp`; görseli olmayan 61 besinde `gorsel:null`, harf ya da ikon göster.
