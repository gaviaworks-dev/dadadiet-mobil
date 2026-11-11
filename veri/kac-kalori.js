/* veri/kac-kalori.js — Kaç Kalori? (web /kac-kalori, /kac-kalori/kategori/sebze, /kac-kalori/bir-avuc-badem-kac-kalori). W2 paketi.
 * Kaynak: dadadiet-prototip/_src/veri/kac_kalori.json (12 yazı, 9 kategori, canlı toplam 168), _src/parcalar/public-beslenme/metin.json
 * (kartlar.kac-kalori-sebze 12 kart, kartlar.ilgili-kac-kalori 4 kart, makale.kac-kalori-detay tam metin), _src/sayfalar/public-beslenme/beslenme.mjs
 * (sayfa başlıkları, KK_IKON, KK_NOT, Besin Kaydı künyesi, bant sayıları). Üretici tek seferlik betik; metin aynen, <b> → **.
 *
 * DDV.kacKalori = {
 *   toplam: 168 (canlı sitedeki yazı sayısı; ekran eldeki kayıt sayısını yazar), uretim (iso),
 *   sayfa: {etiket, baslik, alt, okuma}, kategoriler: [{slug, ad, sayi (canlı sayı), ikon (FA)}],
 *   kategoriMetin: {[slug]: {alt, okuma, sayi}} (yalnız web'de kategori sayfası olan sebze),
 *   yazilar: [{slug, ad, ozet, kategori (slug), okunma (null: web kartında yok), ikon (FA), gorsel (eşlenen besinin mobil görseli ya da null),
 *              besinler: [DDV.besinler slug] (yazının andığı kayıt; değer porsiyon gramıyla sınandı), kaynak: 'liste'|'kategori'|'ilgili' (web'de geldiği yer)}],
 *   metin: {[slug]: {yayin, sayilar:[{deger, etiket}], kunye:[{etiket, deger}], bloklar:[{t:'lead'|'h2'|'p', h}], kaynaklar:[{ad, yer, not, erisim, url}]}}
 *          // tam metin yalnız web'de detayı olan bir-avuc-badem-kac-kalori; kalanında özet var, metin uydurulmaz
 *   ilgili: {baslik, metin, [slug]: [slug]} (web "Bunlar da İşine Yarar"), notlar: {liste (KK_NOT), genel (bilgi notu)},
 *   bul(slug), kategori(slug)
 * } */
window.DDV = window.DDV || {};
DDV.kacKalori = {
  "uretim": "2026-11-06",
  "toplam": 168,
  "sayfa": {"etiket":"Kaç Kalori?","baslik":"Bir porsiyon tam olarak ne kadar?","alt":"Tek soruya tek cevap: bir besin ya da bir pişirme biçimi kaç kalori, o rakam hangi porsiyona karşılık geliyor, aynı işi gören başka bir seçenek kaç kalori.","okuma":"~2 dk"},
  "kategoriler": [
    {"slug":"sebze","ad":"Sebze & Meyve","sayi":51,"ikon":"carrot"},
    {"slug":"pisirme","ad":"Pişirme Yöntemi","sayi":25,"ikon":"fire-burner"},
    {"slug":"icecek","ad":"İçecekler","sayi":24,"ikon":"mug-hot"},
    {"slug":"atistirmalik","ad":"Atıştırmalık","sayi":21,"ikon":"cookie-bite"},
    {"slug":"ekmek","ad":"Ekmek & Tahıl","sayi":17,"ikon":"bread-slice"},
    {"slug":"et","ad":"Et, Tavuk & Balık","sayi":13,"ikon":"drumstick-bite"},
    {"slug":"sut","ad":"Süt Ürünleri & Yumurta","sayi":6,"ikon":"cheese"},
    {"slug":"baklagil","ad":"Baklagiller","sayi":3,"ikon":"seedling"},
    {"slug":"tatli","ad":"Tatlılar","sayi":8,"ikon":"candy-cane"}
  ],
  "kategoriMetin": {
    "sebze": {"alt":"Meyvelerin ve sebzelerin porsiyon olarak ne ettiği, kabuğuyla yenmesiyle suyunun sıkılması arasında değerin nerede ayrıştığı bu başlıkta karşılaştırılır.","okuma":"~3 dk","sayi":51}
  },
  "yazilar": [
    {"slug":"bir-avuc-badem-kac-kalori","ad":"Bir avuç badem kaç kalori?","ozet":"Bir avuç badem 30 gramdır ve TürKomp'un kavrulmuş badem kaydına göre 180 kalori taşır; aynı avuçta 15,1 gram yağ ve 6,2 gram protein bulunur.","kategori":"atistirmalik","okunma":383,"ikon":"cookie-bite","gorsel":"assets/gorsel/besin/badem-ic-kavrulmus.webp","besinler":["badem-ic-kavrulmus","badem"],"kaynak":"liste"},
    {"slug":"bir-dilim-ekmek-kac-kalori","ad":"Bir dilim ekmek kaç kalori?","ozet":"Rehberin ince dilimi 25 gramdır ve beyaz ekmekte yaklaşık 69 kalori taşır; iki dilimlik standart porsiyon 138 kaloridir.","kategori":"ekmek","okunma":417,"ikon":"wheat-awn","gorsel":"assets/gorsel/rehber/bir-dilim-ekmek-kac-kalori.webp","besinler":["beyaz-ekmek"],"kaynak":"liste"},
    {"slug":"bir-adet-sosis-kac-kalori","ad":"Bir adet sosis kaç kalori?","ozet":"Rehber işlenmiş ete 20-30 gramlık bir bant verir; dana sosis kaydında bandın iki ucu 34,8 ile 52,2 kalori arasını gösterir.","kategori":"et","okunma":206,"ikon":"drumstick-bite","gorsel": "assets/gorsel/kac-kalori/bir-adet-sosis-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-dilim-salam-kac-kalori","ad":"Bir dilim salam kaç kalori?","ozet":"Rehber işlenmiş ete 20-30 gramlık bir bant verir; dana salam kaydında bandın iki ucu 36 ile 54 kalori arasını gösterir.","kategori":"et","okunma":188,"ikon":"drumstick-bite","gorsel": "assets/gorsel/kac-kalori/bir-dilim-salam-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-chia-tohumu-kac-kalori","ad":"Bir yemek kaşığı chia tohumu kaç kalori?","ozet":"Besin Kütüphanesi'nde chia tohumunun kaşık ölçüsü yok; kaydın kendisi 100 gramda 486 kalori verir ve hesap tartılan gramdan yürür.","kategori":"atistirmalik","okunma":188,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-chia-tohumu-kac-kalori.webp","besinler":["chia-tohumu"],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-hardal-kac-kalori","ad":"Bir yemek kaşığı hardal kaç kalori?","ozet":"Besin Kütüphanesi'nde hardalın kaşık ölçüsü yok; kaydın kendisi 100 gramda 85 kalori verir ve hesap tartılan gramdan yürür.","kategori":"pisirme","okunma":173,"ikon":"bottle-droplet","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-hardal-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-kaymak-kac-kalori","ad":"Bir yemek kaşığı kaymak kaç kalori?","ozet":"Rehber kaymağa dört ayrı ölçü verir; silme bir yemek kaşığı 46,8 ile 52,7, dolu bir yemek kaşığı 146,3 kalori eder.","kategori":"sut","okunma":183,"ikon":"jar","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-kaymak-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-ketcap-kac-kalori","ad":"Bir yemek kaşığı ketçap kaç kalori?","ozet":"Besin Kütüphanesi'nde ketçapın kaşık ölçüsü yok; kaydın kendisi 100 gramda 112 kalori verir ve hesap tartılan gramdan yürür.","kategori":"pisirme","okunma":179,"ikon":"bottle-droplet","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-ketcap-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-keten-tohumu-kac-kalori","ad":"Bir yemek kaşığı keten tohumu kaç kalori?","ozet":"Besin Kütüphanesi'ndeki ölçü bir yemek kaşığı bütün keten tohumunu 10,3 gram sayar; bu miktar 46,8 kalori ve 3,6 gram lif verir.","kategori":"atistirmalik","okunma":182,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-keten-tohumu-kac-kalori.webp","besinler":["keten-tohumu"],"kaynak":"liste"},
    {"slug":"bir-yemek-kasigi-susam-kac-kalori","ad":"Bir yemek kaşığı susam kaç kalori?","ozet":"Besin Kütüphanesi'nde susamın kaşık ölçüsü yok; kaydın kendisi 100 gramda 576 kalori verir ve hesap tartılan gramdan yürür.","kategori":"atistirmalik","okunma":185,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-yemek-kasigi-susam-kac-kalori.webp","besinler":["susam"],"kaynak":"liste"},
    {"slug":"bir-adet-mango-kac-kalori","ad":"Bir adet mango kaç kalori?","ozet":"Mangonun iki ölçüsü var: rehberin meyve dipnotu 150 gram, Besin Kütüphanesi'ndeki kupa satırı 165 gram sayar; bu iki okuma 90 ile 99 kalori arasını verir.","kategori":"sebze","okunma":184,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-adet-mango-kac-kalori.webp","besinler":["mango"],"kaynak":"liste"},
    {"slug":"bir-avuc-cam-fistigi-kac-kalori","ad":"Bir avuç çam fıstığı kaç kalori?","ozet":"Besin Kütüphanesi'ndeki ölçü bir avuç çam fıstığını 30 gram sayar; bu miktar 202,5 kalori ve 20 gram yağ verir.","kategori":"atistirmalik","okunma":179,"ikon":"bowl-food","gorsel": "assets/gorsel/kac-kalori/bir-avuc-cam-fistigi-kac-kalori.webp","besinler":[],"kaynak":"liste"},
    {"slug":"bir-porsiyon-semizotu-kac-kalori","ad":"Bir porsiyon semizotu kaç kalori?","ozet":"Rehber salata yeşilliğinde porsiyonu 75 gram sayar; semizotu kaydında bu miktar 16,5 kalori ve 2 gram protein verir.","kategori":"sebze","okunma":172,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-porsiyon-semizotu-kac-kalori.webp","besinler":["semizotu"],"kaynak":"kategori"},
    {"slug":"bir-adet-ayva-kac-kalori","ad":"Bir adet ayva kaç kalori?","ozet":"Rehber ayvaya iki ayrı ölçü verir: dipnotu 150 gram sayar, tablosu bir kilograma beş adet giren büyüklüğü tarif eder; bu iki okuma 90 ile 120 kalori arasını verir.","kategori":"sebze","okunma":173,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-adet-ayva-kac-kalori.webp","besinler":[],"kaynak":"kategori"},
    {"slug":"bir-adet-trabzon-hurmasi-kac-kalori","ad":"Bir adet Trabzon hurması kaç kalori?","ozet":"Rehber Trabzon hurmasında porsiyonu 80 gram sayar; bu miktar Besin Kütüphanesi'ndeki kayda göre 58,4 kalori ve 4 gram lif verir.","kategori":"sebze","okunma":176,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-adet-trabzon-hurmasi-kac-kalori.webp","besinler":[],"kaynak":"kategori"},
    {"slug":"bir-kase-ahududu-kac-kalori","ad":"Bir kâse ahududu kaç kalori?","ozet":"Rehber küçük taneli meyvede bir küçük kâseyi bir porsiyon sayar, yani 150 gram; ahududu kaydında bu miktar 84 kalori ve 5,5 gram lif verir.","kategori":"sebze","okunma":184,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-kase-ahududu-kac-kalori.webp","besinler":[],"kaynak":"kategori"},
    {"slug":"bir-porsiyon-marul-kac-kalori","ad":"Bir porsiyon marul kaç kalori?","ozet":"Rehber salata yeşilliğinde porsiyonu 75 gram sayar; kıvırcık ve Iceberg marul kayıtlarında bu miktar 12,8 kalori eder.","kategori":"sebze","okunma":166,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-porsiyon-marul-kac-kalori.webp","besinler":["marul-kivircik","marul-iceberg"],"kaynak":"kategori"},
    {"slug":"bir-porsiyon-pazi-kac-kalori","ad":"Bir porsiyon pazı kaç kalori?","ozet":"Rehber salata yeşilliğinde porsiyonu 75 gram sayar; TürKomp pazı kaydında bu miktar 16,5 kalori ve 1,3 gram lif verir.","kategori":"sebze","okunma":172,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-porsiyon-pazi-kac-kalori.webp","besinler":[],"kaynak":"kategori"},
    {"slug":"bir-porsiyon-roka-kac-kalori","ad":"Bir porsiyon roka kaç kalori?","ozet":"Rehber salata yeşilliğinde porsiyonu 75 gram sayar; roka kaydında bu miktar 19,5 kalori ve 1,9 gram protein verir.","kategori":"sebze","okunma":171,"ikon":"seedling","gorsel": "assets/gorsel/kac-kalori/bir-porsiyon-roka-kac-kalori.webp","besinler":["roka"],"kaynak":"kategori"},
    {"slug":"bir-dilim-kavun-kac-kalori","ad":"Bir dilim kavun kaç kalori?","ozet":"Bir üçgen dilim kavun yaklaşık 15,5, üç dilimlik standart porsiyon ise 46,5 kaloridir; kabuk ve çekirdek hesaba girmez.","kategori":"sebze","okunma":293,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-dilim-kavun-kac-kalori.webp","besinler":["kavun-kirkagac"],"kaynak":"kategori"},
    {"slug":"bir-kase-yaban-mersini-kac-kalori","ad":"Bir kâse yaban mersini kaç kalori?","ozet":"Bir küçük kâse yaban mersini 150 gramdır ve yaklaşık 66 kalori taşır; bu ölçü meyveler için bir standart porsiyona karşılık gelir.","kategori":"sebze","okunma":282,"ikon":"apple-whole","gorsel": "assets/gorsel/kac-kalori/bir-kase-yaban-mersini-kac-kalori.webp","besinler":[],"kaynak":"kategori"},
    {"slug":"bir-porsiyon-yesil-biber-kac-kalori","ad":"Bir porsiyon yeşil biber kaç kalori?","ozet":"Bir porsiyon çiğ biber 150 gramdır: TürKomp kayıtlarında çarliston 33, dolmalık 34,5, sivri biber 42 kalori. Rehberin kendi tablosu sivri biberde 57 veriyor.","kategori":"sebze","okunma":289,"ikon":"pepper-hot","gorsel": "assets/gorsel/kac-kalori/bir-porsiyon-yesil-biber-kac-kalori.webp","besinler":["carliston-biber","dolmalik-biber","sivri-biber"],"kaynak":"kategori"},
    {"slug":"yarim-greyfurt-kac-kalori","ad":"Yarım greyfurt kaç kalori?","ozet":"Besin Kütüphanesi'nde yarım greyfurdun gram karşılığı yok; bir porsiyon 150 gramdır ve Rio Red kaydına göre 57 kalori taşır.","kategori":"sebze","okunma":289,"ikon":"lemon","gorsel": "assets/gorsel/kac-kalori/yarim-greyfurt-kac-kalori.webp","besinler":["greyfurt-rio-red"],"kaynak":"kategori"},
    {"slug":"bir-avuc-ceviz-kac-kalori","ad":"Bir avuç ceviz kaç kalori?","ozet":"30 gram iç ceviz yaklaşık 204 kalori taşır; altı kuruyemiş arasında en yükseği. Kabuklu tartarsan ölçü tamamen kayar.","kategori":"atistirmalik","okunma":null,"ikon":"cookie-bite","gorsel": "assets/gorsel/kac-kalori/bir-avuc-ceviz-kac-kalori.webp","besinler":["ceviz-ic"],"kaynak":"ilgili"},
    {"slug":"bir-avuc-findik-kac-kalori","ad":"Bir avuç fındık kaç kalori?","ozet":"Bir avuç fındık 30 gramdır ve TürKomp'un kavrulmuş iç fındık kaydına göre 201 kalori taşır; aynı avuçta 18,4 gram yağ bulunur.","kategori":"atistirmalik","okunma":null,"ikon":"cookie-bite","gorsel": "assets/gorsel/kac-kalori/bir-avuc-findik-kac-kalori.webp","besinler":["findik-ic-kavrulmus"],"kaynak":"ilgili"},
    {"slug":"bir-avuc-antep-fistigi-kac-kalori","ad":"Bir avuç Antep fıstığı kaç kalori?","ozet":"30 gram iç Antep fıstığı yaklaşık 182 kalori taşır; kabuklu ölçüyle avuç hesabı Besin Kütüphanesi'nde kesinleşmiyor.","kategori":"atistirmalik","okunma":null,"ikon":"cookie-bite","gorsel": "assets/gorsel/kac-kalori/bir-avuc-antep-fistigi-kac-kalori.webp","besinler":["antep-fistigi-kavrulmus"],"kaynak":"ilgili"},
    {"slug":"bir-kase-patlamis-misir-kac-kalori","ad":"Bir kâse patlamış mısır kaç kalori?","ozet":"Rehberin porsiyon tablosunda bir büyük kâse patlamış mısır 25 gramdır ve yaklaşık 92 kalori taşır; aynı rehberin enerji tablosu aynı besini 30 gram üzerinden 110 kalori sayar.","kategori":"atistirmalik","okunma":null,"ikon":"bowl-food","gorsel": "assets/gorsel/kac-kalori/bir-kase-patlamis-misir-kac-kalori.webp","besinler":[],"kaynak":"ilgili"}
  ],
  "metin": {
    "bir-avuc-badem-kac-kalori": {
      "yayin": "2026-08-13",
      "sayilar": [
        {"deger":"180","etiket":"kalori / 30 g"},
        {"deger":"600","etiket":"kcal / 100 g"},
        {"deger":"30 g","etiket":"bir avuç"}
      ],
      "kunye": [
        {"etiket":"Kayıt","deger":"Badem (iç · kavrulmuş)"},
        {"etiket":"Enerji","deger":"600 kcal / 100 g"},
        {"etiket":"Kaynak","deger":"TürKomp — Ulusal Gıda Kompozisyon Veri Tabanı"},
        {"etiket":"Yayın","deger":"13.08.2026"},
        {"etiket":"Kategori","deger":"Atıştırmalık"}
      ],
      "bloklar": [
        {"t":"lead","h":"30 gramlık bir avuç kavrulmuş badem **yaklaşık 180 kalori** taşır. Bu rakamın dörtte üçü yağdan gelir: aynı avuçta 15,1 gram yağ, 6,2 gram protein ve 3,6 gram lif vardır."},
        {"t":"h2","h":"Bir avuç kaç gram sayılıyor?"},
        {"t":"p","h":"Türkiye Beslenme Rehberi bademde bir standart porsiyonu 30 gram olarak tanımlar (TÜBER 2022, Ek 2.1.3, PDF s. 288). Besin Kütüphanesi'ndeki \"avuç\" porsiyon satırları da bunu doğrular: ceviz, badem, fındık, yer fıstığı, kaju, kuru incir ve kuru kayısı için tutulan satırların hepsi bir avucu 30 grama eşitler."},
        {"t":"p","h":"\"Bir avuç\" bu 30 gramın kaba karşılığıdır ve el büyüklüğü kişiden kişiye değişir. Ölçüyü bir kez tartıp kabına bakmak, her seferinde avuçla tahmin etmekten güvenilirdir."},
        {"t":"p","h":"Tane hesabını rehber doğrudan veriyor: Ek 2.1.3 bademde bir standart porsiyonu **24-26 adet veya 1 avuç veya 30 gram** olarak tanımlar. Aynı ekte ceviz 4-5 büyük tam iç, yer fıstığı 27-30 adet, kaju 18-20 adet olarak verilir; yani tane sayısı kuruyemişten kuruyemişe değişir ama ağırlık hepsinde 30 gramdır."},
        {"t":"p","h":"Paketten doğrudan yemek ölçüyü en çok kaydıran alışkanlıktır. **Porsiyonu küçük bir kâseye ayırmak**, sayıyı değiştirmeden miktarı görünür kılar."},
        {"t":"h2","h":"Çiğ mi, kavrulmuş mu?"},
        {"t":"p","h":"Besin Kütüphanesi'nde bademin iki ayrı kaydı var ve ikisi farklı kaynaktan geliyor. Kavrulmuş iç badem TürKomp kaydıdır, 100 gramda 600 kalori verir; çiğ badem USDA FoodData Central kaydıdır, 100 gramda 579 kalori verir. 30 gramlık porsiyonda bu 180'e karşı 173,7 kalori eder."},
        {"t":"p","h":"İki kayıt iki ayrı kaynaktan gelir ve enerjiyi aynı usulle hesaplamaz: TürKomp karbonhidratı lif dışında verir ve lifi gram başına 2 kalori sayar, USDA lifi karbonhidratın içinde tutar ve besine özgü katsayılar kullanır. USDA'nın çiğ badem satırları TürKomp'un usulüyle hesaplanınca (4 × 21,15 protein + 4 × 9,05 lif dışı karbonhidrat + 9 × 49,93 yağ + 2 × 12,5 lif) 100 gramda 595,2 kalori eder — kavrulmuş kaydın 600'üne 4,8 kalori yakın. Yani iki kaydın farkının büyüğü satırlarda değil hesap usulündedir; kavurmanın payı bu iki kayıtla ayrılamaz. Kavurmanın ne yaptığı USDA'nın kendi veri tabanında ölçülüdür: orada çiğ bademin su satırı 4,41, kuru kavrulmuş bademinki 2,41 gramdır ve aynı veri tabanında enerji 579'dan 598'e çıkar. Ama Besin Kütüphanesi'ndeki kayıtlarda su sütunu yok; o yüzden aynı hesap bu sayfada kurulamıyor ve buradaki iki kaydın farkının ne kadarının kavurmadan geldiği gösterilemiyor."},
        {"t":"p","h":"Fındıkta aynı hesap farkı kapatmaz ama küçültür: çiğ fındık USDA kaydında 100 gramda 628, kavrulmuş fındık TürKomp kaydında 670 kalori verir; USDA satırları TürKomp usulüyle 654,6 kalori eder ve fark 42'den 15,4 kaloriye iner. Kalan fark için kaynaklarda bir sebep ölçen satır yok."},
        {"t":"p","h":"Bu sayfa TürKomp'un kavrulmuş kaydını esas alır: kaynak sıralamasında TürKomp Türkiye'den alınan numuneleri ölçtüğü için öncelikli kaynaktır. **Çiğ badem yiyen için geçerli sayı 30 gramda 173,7 kaloridir**."},
        {"t":"h2","h":"İki kaydın karbonhidrat satırı neden ayrışıyor?"},
        {"t":"p","h":"Enerjide 100 gram üzerinden 21 kalorilik fark varken karbonhidrat satırında fark iki katın üzerindedir: TürKomp 10,36, USDA 21,55 gram verir. Bu bir ölçüm hatası değil, iki farklı tanımdır."},
        {"t":"p","h":"USDA'nın karbonhidrat satırı lifi de içine alır; TürKomp lifi ayrı bir satırda tutar. USDA'nın 21,55 gramından kendi lif değeri olan 12,5 gram düşüldüğünde geriye 9,05 gram kalır ve iki kayıt birbirine yaklaşır. İki sayı da doğrudur; aynı şeyi ölçmezler."},
        {"t":"p","h":"Pratik sonuç şudur: **bademin karbonhidrat satırını iki kaynaktan okuyup ortalamasını almak yanıltır**. Hangi kaydın kullanıldığı söylenmeden verilen bir badem karbonhidratı eksik bilgidir."},
        {"t":"h2","h":"Otuz gramın tam dökümü"},
        {"t":"p","h":"Kavrulmuş badem kaydına göre 30 gramlık porsiyon 15,1 gram yağ, 6,2 gram protein, 3,6 gram lif ve 3,1 gram karbonhidrat taşır. Ağırlığın yarısı yağdır ve **kalorinin dörtte üçünü yağ satırı tutar**: 15,07 gram yağ, gram başına 9 kaloriden, 135,6 kalori."},
        {"t":"p","h":"Lif tarafında 3,6 gram, Türkiye Beslenme Rehberi'nin yetişkinler için önerdiği günlük en az 25 gramın (PDF s. 100, basılı s. 76) yaklaşık yedide biridir. Bu katkı için ödenen bedel 180 kaloridir; badem bir lif kaynağı olarak değil, yağ ve protein profili için tabağa girer."},
        {"t":"h2","h":"Diğer kuruyemişlerle yan yana"},
        {"t":"p","h":"Aynı 30 gramlık porsiyonda yer fıstığı 171, kaju 172,2, kabak çekirdeği 172,2, kavrulmuş badem 180, antep fıstığı 182,4, ayçiçeği çekirdeği 191,1, kavrulmuş fındık 201 ve ceviz 203,7 kalori taşır. Badem 180 kaloriyle bu sıranın alt yarısındadır — listenin iki ucu 171 ve 203,7 kaloridir."},
        {"t":"p","h":"Protein sütununda sıra değişir: aynı porsiyonda kabak çekirdeği 8,9, ayçiçeği çekirdeği 7,4, yer fıstığı 7,1 ve badem 6,2 gram verirken ceviz 4,4, fındık 4,1 gramda kalır. Badem bu sütunda üst sıradadır."},
        {"t":"p","h":"Yani **kuruyemiş seçimi bir kalori kararı değildir**; otuz gramın hepsi 171 ile 204 kalori arasında sıkışır. Değişen şey o kalorinin yanında ne geldiğidir."},
        {"t":"h2","h":"Tuzlu badem ayrı bir kalem mi?"},
        {"t":"p","h":"Tuz kaloriye eklenmez ama tabağa tuz ekler. Besin Kütüphanesi'ndeki kayıtlar sodyum satırı taşımıyor; bu yüzden burada tuzlu bademin tuz payı için bir sayı verilmiyor."},
        {"t":"p","h":"Kayıtlardan okunabilen tek şey, kullanılan kavrulmuş badem kaydının tuzlama bilgisi taşımadığıdır. Paketin arkasındaki sodyum satırı, bu sayfadaki kaloriden bağımsız olarak ayrıca okunmalıdır."},
        {"t":"p","h":"Bu sayfadaki değerler TürKomp Ulusal Gıda Kompozisyon Veri Tabanı'ndan ve USDA FoodData Central'dan, porsiyon tanımları Türkiye Beslenme Rehberi'nden alınmıştır. Hangi sayının hangi kayıttan geldiği metinde tek tek söylenmiştir. Değerler temsilîdir; aynı ürünün farklı bir partisi küçük sapmalar gösterebilir."}
      ],
      "kaynaklar": [
        {"ad":"TürKomp — Ulusal Gıda Kompozisyon Veri Tabanı","yer":"09.02.0009","not":"100 g yenilebilir kısım (iç, kavrulmuş)","erisim":"2026-08-14","url":"https://turkomp.tarimorman.gov.tr/food-badem-ic-kavulmus-387"},
        {"ad":"TÜBER 2022 — Türkiye Beslenme Rehberi","yer":"Ek 2.1.3, s. 264","not":"1 avuç badem = 24-26 tane / 30 g (porsiyon tanımı)","erisim":"2026-08-14","url":"https://hsgm.saglik.gov.tr/depo/birimler/saglikli-beslenme-ve-hareketli-hayat-db/Dokumanlar/Rehberler/Turkiye_Beslenme_Rehber_TUBER_2022_min.pdf"}
      ]
    }
  },
  "ilgili": {
    "baslik": "Bunlar da işine yarar",
    "metin": "Aynı mantıkla kurulmuş, yine iki dakikalık kalori soruları.",
    "bir-avuc-badem-kac-kalori": ["bir-avuc-ceviz-kac-kalori","bir-avuc-findik-kac-kalori","bir-avuc-antep-fistigi-kac-kalori","bir-kase-patlamis-misir-kac-kalori"]
  },
  "notlar": {"liste":"Buradaki kalori değerleri **ortalamalardır** ve **genel bilgi amaçlıdır**; **tıbbi teşhis veya tedavi yerine geçmez**, kişisel beslenme tavsiyesi değildir. Ürün markası, besinin çeşidi, porsiyon ölçüsü ve pişirme biçimi rakamı değiştirir. Kişiye özel plan yalnızca **yetkili bir diyetisyen** tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce **hekim ve diyetisyen kontrolü zorunludur**.","genel":"Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; **tıbbi teşhis veya tedavi yerine geçmez**, kişisel beslenme tavsiyesi niteliği taşımaz. Kişiye özel plan yalnızca **yetkili bir diyetisyen** tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce **hekim ve diyetisyen kontrolü zorunludur**."}
};
DDV.kacKalori.bul = slug => DDV.kacKalori.yazilar.find(y => y.slug === slug) || null;
DDV.kacKalori.kategori = slug => DDV.kacKalori.kategoriler.find(k => k.slug === slug) || null;
