# Dada Diet Kanon

Dada Diet, Dada Gastro mobilin marka değişmiş halidir: bileşen anatomisi, ölçü, boşluk, radius, gölge, hal seti ve hareket Gastro ile aynıdır. Yalnız primary rampası, logo, içerik ve makro renkleri Diet'e aittir. Bağlayıcı eşleme: `tasks/gastro-esleme.md`. Ekran yazarı yalnız bu dosyayı okuyarak ekran kurabilir. Galeri: `/kanon/`. Kurallar: `tasks/mimari.md` §2.

## Durum
- [x] tokens.json: nötr, tipografi, boşluk, radius, gölge, overlay, hareket Gastro değerleri; primary, makro Diet
- [x] Gastro CSS'i ad çevirisiyle taşındı (`dd-bilesen`, `dd-kontrol`, `dd-parcali`, `dd-sayac`, `dd-not`, `dd-metin`, `dd-takvim`, `dd-sahne`, `dd-uzman-karti`, `dd-yorum`, `dd-kartlar`, `dd-baslik`, `dd-menu`, `dd-hareket`). Bu dosyalar elle değiştirilmez; marka ve kabuk farkları `dd-kabuk.css`te
- [x] Yeni Diet bileşenleri `dd-yeni.css`, `dd-gosterge.js`; kabuk ve yığın `dd-kabuk.css`, `dd-ui.js`
- [x] `dd-metin.js` heceleme, `dd-takvim.js`, `dd-kartlar.js` (DDCard), `dd-menu.js` (DD.menu)
- [x] Eşit içerikli hesaplanmış stil kıyası: Gastro `bilesenler.html` ile 129 ölçüm; kalan farklar §6 sonunda
- [x] Yan yana görüntü: `docs/screenshots/kanon-gastro-yanyana.png`
- [x] Gastro → Diet tablosu (§6)
- [x] Son geçiş: `ana-v3`, `liste-v2`, `detay-v2` baştan sona okundu. Kalıp parçaları `dd-liste.css` (liste-v2 ad çevirisiyle), `dd-kalip.css`, `dd-kalip.js`; galeride "Ekran kalıpları", tarif §3. Gerçek yığında denendi (yapışma, daralma, sekme, filtre, sıralama, görünüm, otomatik kaydırma); yan yana: `docs/screenshots/kalip-gastro-yanyana.png`

## 1. Ekran nasıl yazılır

`ekranlar/<ad>.js` tek çağrıdır. CSS yok, hex yok, px yok, margin yok. `style=` yalnız veri kaynaklı değişken için.

```js
DD.ekran('ogun', {
  tur: 'alt',                       // sekme | alt | banner | tam | modal
  nav: 'bugun',
  baslik: ctx => DDV.bugun.ogunler.find(o => o.id === ctx.param.id).ad,
  ustBar: ctx => ({sag: [{ikon: 'more', etiket: 'Daha fazla', veri: {eylem: 'menu2'}}]}),
  ciz: ctx => `<div class="dd-ic dd-yigin">${...}</div>`,
  altBar: ctx => DD.altEylem({dugmeler: [{metin: 'Öğün ekle', ikon: 'ekle', git: '#/besin-ara', tam: true}]}),
  sonra: (kok, ctx) => {            // kok = ekran <section>
    const c1 = DD.eylem(kok, 'menu2', el => DD.sheet({...}));
    const c2 = DD.on(kok, 'porsiyon', deger => {...});
    return () => { c1(); c2(); };
  }
});
```

| Alan | Anlamı |
|---|---|
| `tur` | `sekme` alt menülü kök, DOM'da kalır, kaydırma korunur. `alt` geri + başlık + menü. `banner` görsel üstünde cam düğmeli şeffaf bar, kayınca solid. `tam` barsız. `modal` aşağıdan, solda kapat |
| `nav` | Alt menü etkin öğesi: `bugun`, `ritim`, `denge`, `uzman` |
| `baslik` | string ya da `ctx => string` |
| `ustBar` | `ctx => ({sol, sag:[{ikon, etiket, git, veri, attrs, sayi}|html], saydam, menu:false, geri:false})`. Sekme varsayılanı logo · ara · zil · menü (`DD.ustVarsayilan()`). Ara düğmesi şeffaf halde gizlidir, solid olunca gelir. `saydam:true`: sekme ekranında fotoğraflı hero |
| `ciz` | `ctx => html`. `ctx = {ad, param, sorgu, hash, durum}` |
| `altBar` | `ctx => html`; sabit alt alan: `DD.altEylem`, `DD.kayanBar`, `DD.mesajGiris`, `DD.izinIstemi().bar`. İçerik altına boşluk otomatik |
| `sonra` | `(kok, ctx) => temizleFn`. Temizleme ekran kapanınca ya da yeniden çizilince çalışır. Sekme ekranı kapanmaz: sekme değişince bağlar yaşar, temizleme çalışmaz |
| `yukle`, `iskelet` | `ctx => Promise`; bitene dek `DD.iskelet` kalıbı (varsayılan `ekran`) |
| `yenile` | `true`: geri dönüşte kaydırmayı koruyarak yeniden çizer. `donus: (kok, ctx)`: hafif güncelleme, üste her dönüşte |
| `gizlen` | `(kok, ctx)`: ekran üstten çekilince (sekme değişti, üstüne ekran açıldı, kapanıyor). Süre tutan döngü burada durur, `donus`ta başlar; `gizlen` ve `donus` çifttir. `DD.orucSayac` gibi `data-c="sayac"` gizliyken saymayı sürdürür, yalnız çizmez; kanca gerekmez |
| `cekYenile` | `ctx => Promise`: aşağı çekip yenile |
| `dock` | `true`: alt/banner ekranda alt menü de görünür |
| `tabagim` | `true` tam ekranda da, `'ust'` üstte (kamera), `false` gizle |
| `ust` | Doğrudan açılınca geri rotası (varsayılan `#/bugun`) |

Yönlendirme: `DD.git('#/x')`, `DD.geri()`, `DD.yerine('#/x')`, `DD.tazele()`, `DD.aktif()`. HTML: `data-git`, `data-yerine`, `data-geri`, `data-menu`. Bileşen seçeneklerinde `git`, `yerine`, `geri`, `id`, `etiket` (aria-label), `veri:{eylem:'x', id:1}`, `attrs` ortaktır. Sorgu `ctx.sorgu.mod`, parametre `ctx.param.slug`.

Veri `window.DDV` (`veri/README.md`). `DD.yukleVeri('program-gunleri')` yalnız program detayında. Sabit an: `DD.simdi()` (6 Kasım 2026 17:10), `DD.bugunIso()`; canlı saat yok.

Türkçe heceleme: `dd-metin.js` görünen metne yumuşak tire ekler ve DOM değişimini izler; ekran bir şey yapmaz. Paragraf `<p>` yeter; `dd-metin.css` justify'ı verir. Heceleme istemeyen öğede `data-dd-hece="yok"`. Başlık, ad, etiket ve buton hecelenmez, justify almaz.

### Olaylar

| Olay | Kullanım |
|---|---|
| `dd-degisim` | Bütün kontroller: `DD.on(kok, 'ad', (deger, detay) => {})` |
| `data-eylem` | `DD.eylem(kok, 'ad', (el, ev) => {})`, `el.dataset.id` |
| `dd-onay` | Uzun bas tamamlandı: `e.detail.ad` |
| `dd-eylem` | Swipe satır: `e.detail = {eylem, id}` |
| `dd-kamera` | Kamera düğmesi: `e.detail.eylem` = cek, galeri, mikrofon, flas, cevir, baglam, kapat |
| `dd-uzun` | `data-uzun="ad"` uzun basış |
| `dd-arama` | `DD.aramaKur`: `{q, sonuc}` |
| `gec` (`data-eylem`) | `DD.acilis` tam ekran dokunuş |
| `DD.cikis()` | Hesaptan çıkış: Tabağım'ı ve tüm durumu siler, `#/karsilama` ile uygulamayı baştan yükler. Çıkış eylemi başka yol yazmaz |
| `dd-tabagim`, `dd-tabagim-kaydet` | `document`: `{liste, toplam}`. Kaydet ayrıca `{meta, foto, not, kaynak, guven}` taşır. Tabağa ait tek meta `DD.tabagim.meta({foto, not, kaynak, guven})`; argümansız okur, `ekle` bu alanları görürse boş olanları doldurur (ilk kaynak kalır), kayıt ya da temizlikte silinir |
| `dd-bildirim` | `document`: okuma ya da silmeden sonra atılır, zil rozeti tazelenir. Sayı `DD.bildirimSayi()`: `okundu` olmayanlardan `DD.durum` `bildirim-okundu` ve `bildirim-silinen` id listeleri düşer. Elle tazeleme `DD.zilTazele()`; ekran dönüşünde kendiliğinden çalışır |

Standart `data-eylem` adları: `ogun-ekle`, `plan-uygula`, `plan-degistir`, `plan-atla` · `duzelt` · `zaman-duzenle` · `jeton-sil` · `soru` (`dataset.soru`) · `kaydet` (kart, kendi çalışır) · `ek` · `filtre` · `neden`. Mesaj formu `[data-mesaj]` submit.

## 2. Yığın ve ritim sınıfları (Gastro)

Margin yazılmaz. `.dd-yigin*` kendi çocuklarına Gastro dikey kuralını uygular.

| Sınıf | Anlamı |
|---|---|
| `.dd-bolum` | Bölüm: 32 gutter; ardışıkta üst 0. `.is-gri` gri zemin. `DD.bolum()` üretir |
| `.dd-ic` | 16 gutter iç kap |
| `.dd-yigin`, `.dd-yigin-12`, `.dd-yigin-8`, `.dd-yigin-4`, `.dd-yigin-24` | Dikey yığın (16, 12, 8, 4, 24) |
| `.dd-sira` (`.is-gen`), `.dd-ara` | Yatay sarmalı sıra; iki uca yaslı satır |
| `.dd-izgara`, `.dd-izgara-3`, `.dd-uzman-izgara`, `.dd-ikili` | 2 sütun kart, 3 sütun, uzman, eşit ikili düğme |
| `.dd-serit` | Yatay kayan şerit, gutter'a taşar |
| `.dd-satirlar` | Çocuklar arası ince ayraç |
| `.dd-t-display page section featured sheet sub card body meta label stat bold numeral-xl numeral-lg numeral-md` | Roller |
| `.dd-ton-ikincil`, `.dd-ton-primary`, `.dd-kirp-1`, `.dd-kirp-2`, `.dd-orta-metin`, `.dd-sr` | Yardımcı |

Tipik sekme gövdesi: `DD.bolum({baslik, eylem:'Tümü', git, html})` art arda. `DD.bolum` kendi padding'ini taşır; `DD.yatay`/`DD.cipler` içinde gutter'a taşar.

## 3. Ekran kalıpları (Gastro kök ekranları)

Üç ana ekranın iskeleti aşağıdadır. Galeri "Ekran kalıpları" bölümü bu çağrıların çalışan halidir. Kaydırma davranışları (`is-stuck`, sahne daralması, gizlenen satırlar) ekran kabuğundadır; ekran kod yazmaz.

**Bugün = `ana-v3`.** `tur:'sekme'`, `ustBar:()=>({saydam:true})`.
```js
ciz: () => DD.heroAna({
    baslik:'Günaydın Zeynep', perde:'tam',
    slaytlar:[{gorsel, etiket:'Bugünün önerisi', baslik:p.ad, alt:'Dyt. Elif Kaya', avatar:'E', git:`#/program/${p.slug}`}],
    icerik: DD.halka({foto:true, ...})
  }) + DD.bolumler([
    {baslik:'Öğünlerin', html: DD.ogunListe(B.ogunler)},
    {baslik:'Programlar', eylem:'Tümü', git:'#/programlar', html:`<div class="dd-yigin">${DD.oneCikan(kartlar)}${DD.ikiliSerit(tile)}</div>`},
    {baslik:'Kategoriler', html: DD.seritKartlar([{ad, alt, gorsel, git}])},
    {baslik:'Su', html: DD.suKart({...})}
  ])
```
- Hero sırası: üstte `baslik`, `altBaslik`, `arama`; ortada `icerik` yuvası; altta öneri metni; sağ altta gösterge. Birden çok slayt yatay kaydırılır ve 6 saniyede bir ilerler, dokunuşta durur. Tek slaytta gösterge çizilmez.
- `perde:'tam'` fotoğraf üstünde veri varken kullanılır (halka). Yoksa perde metin konumundan hesaplanır.
- `DD.bolumler` sırayla gri ve beyaz zemin verir; sıra elle verilmez. `DD.yuzey(html)` bölüm zeminine uyan kart yüzeyidir.
- Öne çıkan kart `DD.oneCikan(kartlar)`: tek kartta düz kart, çok kartta slider + gösterge noktaları.

**Programlar = `liste-v2`.** `tur:'banner'`. Kök ekran ise `ustBar:()=>({geri:false})`.
```js
ciz: () => DD.kubbe({gorsel, baslik:'Programlar', stat:[{deger:'82', etiket:'Program'}, ...],
  arac: DD.listeArac({yer:'Program ara', filtreSayi:2,
    segment: DD.segment({ad:'kapsam', secili:'hedef', ogeler:[...]}),
    serit: DD.cipSerit({ad:'hedef', secili:'', ogeler:[{metin:'Tümü', deger:'', ikon:'ogun'}, {metin, deger, gorsel, sayi}]})}),
  html: `${DD.eylemKart({ikon:'wand-magic-sparkles', baslik:'Program Bul', alt:'...', git:'#/program-bul'})}
    ${DD.listeTema({ad:'tema', baslik:'Hedef ve tempo', ogeler:[...]})}
    ${DD.listeDurum({sayi:82, birim:'program', gorunum})}
    ${DD.listeSonuc(programlar.map(p => DD.programKart(p, gorunum === 'liste' ? {tur:'row'} : {})), {gorunum})}
    ${DD.sayfalama({sayfa:1, toplam:3})}`}),
sonra: k => {
  DD.eylem(k, 'filtre', () => DD.filtreSheet({gruplar:[{baslik, ad, ikon, tur:'tek', ogeler:[{metin, deger, sayi, gorsel}]}], secili, uygula: d => ...}));
  DD.eylem(k, 'sirala', () => DD.siralaSheet({secili, secenekler:[[deger, ad, ikon]], sec: v => ...}));
  DD.eylem(k, 'sayfa', el => ... el.dataset.id ...);
  DD.on(k, 'gorunum', v => DD.tazele());
}
```
- `arac` verilince kubbe paneli liste paneline döner: araç bloğu üst barın altına yapışır, köşesi düzleşir, altına giren satırlar yarım görünmez.
- 5 filtre kutusu `DD.filtreSheet` gruplarıdır: seçilenler üstte kaldırılabilir çip, tek açık akordeon, 5 seçenek sonrası "N seçenek daha", sabit Temizle ve Sonuçları göster.
- Sonuç yoksa `DD.listeSonuc` yerine `DD.listeBos({baslik, metin, eylem})`.

**Program detay = `detay-v2`.** `tur:'banner'`, `ustBar:()=>({sag:[{ikon:'kaydet', etiket:'Kaydet'}]})`.
```js
ciz: () => DD.detay({gorsel:p.kapak, etiket:p.kategori, baslik:p.ad, alt:p.aciklama,
    caps:[{ikon:'yildiz', metin:'Orta'}, {ikon:'takvim', metin:'7 gün'}],
    bas: DD.ozetSerit([{ikon:'takvim', etiket:'Süre', deger:'7', birim:'gün'}, ...])
       + DD.ozellikSerit({on:[{ikon, metin}], ogeler:[{ikon, metin}]})
       + DD.aciklama({metin:'...'}),
    sekmeler: DD.detaySekmeler({ad:'gun', kaydir:true, secili:'1', ogeler:[{ad:'1. gün', deger:'1', html: gunHtml(1)}, ...]}),
    kuyruk: DD.bilgiSerit([{ikon, baslik, metin}]) + DD.kunye([{ikon, etiket, deger}])}),
altBar: () => DD.altEylem({ikonlar:[{ikon:'kaydet', ad:'Kaydet', sayi:12}, {ikon:'paylas', ad:'Paylaş'}], dugmeler:[{metin:'Programa başla', ikon:'program'}]})
```
- Başlık boyu metne göre hesaplanır, en az 320. Üst bar başlığı fotoğraf üstünde gizli, bar dolunca görünür.
- `DD.detaySekmeler` panelleri kendisi değiştirir; ekranın dinleyici yazması gerekmez. Sekme çubuğu üst barın altına yapışır. Sekme yoksa `sekmeler` yerine `govde`.
- `DD.aciklama` metin 3 satırı aşarsa "Devamını oku" çıkar; kısaysa düğme görünmez.

**Açılış.** `tur:'tam'`: `DD.acilis({gorseller:[url], logo})`. Gastro kolajı; en iyi 15 görsel, azsa yinelenir. Tam ekran dokunuş `data-eylem="gec"`. Geçiş `DD.acilisCik(kok, () => DD.yerine(hedef))`: çıkış hareketini oynatır, bir kez çalışır; zamanlayıcı ekranda (`DD.TK.motion.reveal * 5`).

**Karşılama.** `tur:'tam'`: `DD.karsilamaKabuk({gorsel, logo, baslik, metin, html})`, düğmeler `altBar`da. Kapak altBar üstüne kadar uzar; `html` kapağın altında beyaz alanda. `logo` verilmezse beyaz Dada Diet logosu.

**Onboarding.** `tur:'tam'`. `DD.onbSablon` + `DD.secimler` (`duzen:'tek'|'iki'|'uc'|'orta'`). Tempo, aktivite: 5 çubuklu ölçek `olcek:1-5`.

**Kamera.** `tur:'tam'`, `tabagim:'ust'`: `DD.kamera({...})`. İzin: `DD.izinIstemi()` (`{html, bar}`), reddedildi `DD.kameraIzinSahne()`.

**Sağlık dosyam, Uzmanım.** `tur:'banner'`: `DD.profilBas({ad, alt, kapak, sayaclar, ust:true})` (`ust`: kapak şeffaf üst barın altına girer).

**Boş, hata.** Sayfa içi `DD.bos`, tam ekran `DD.durumSahne`/`DD.hataEkran`, üstte `DD.cevrimdisi()`, liste sonu `DD.veriYok`.

Kubbe, gülücük, `DD.heroAna` ve `DD.detay` dışında birleşim yazılmaz. Fotoğraf üstü metin yalnız bu kabuklarda ve kart ailesinde.

## 4. Bileşen kataloğu

Hepsi HTML string döner. Etkileşim ve animasyon çekirdekte, bağlama gerekmez. Örnek kullanım `kanon/galeri.js`.

### Metin ve yardımcılar
`DD.p(metin, {orta, ton, meta})` (`**vurgu**` kalın; her paragrafta vurgu zorunlu) · `DD.metinBlok({etiket, baslik, metin, rol, h, orta})` · `DD.makale(html)` · `DD.ik(ad)` (sözlük anahtarı ya da FA adı) · `DD.esc`, `DD.vurgu` · `DD.sayi`, `DD.ondalik(n,b)`, `DD.sure(dk)`, `DD.saatMetin(dk)`, `DD.saatDk(s)`, `DD.paraTL(n)` · `DD.tarihUzun(iso)`, `DD.tarihKisa(iso)`, `DD.katla(s)` · `DD.say(el, hedef)` · `DD.titres(ms)`, `DD.azHareket()` · `DD.durum.oku/yaz/sil/sifirla` · `DD.mesgul(btn, sureYaDaPromise)` · `DD.sonsuz(kap, yukle)`.
İç yardımcılar: `DD.at`, `DD.ikonAd`, `DD.kisit`, `DD.yay`, `DD.degisim`, `DD.tween`, `DD.canlandir`, `DD.segGosterge`, `DD.sayacMetin`, `DD.sayacHtml`, `DD.rakamlar`, `DD.vurguluEsles`, `DD.adimDeger`, `DD.baslat`, `DD.kubbeBoya`, `DD.donen`.

### Temel
| API | Seçenek | Hal |
|---|---|---|
| `DD.ikonKutu({ikon, boyut, ton})` | sm 32, md 40, lg 44 · primary, notr, protein, karb, yag, lif, bilgi, basari, uyari, hata | |
| `DD.avatar({ad|harf, gorsel, boyut})` | 20, 40, 56 (halkalı), 96 | harf, görsel |
| `DD.kucukFoto(src, ikon)`, `DD.gorsel({src, ad, ikon, ton})`, `DD.makroTon(b)` | 56 kare; görsel yoksa harf/ikon | görsel, yok |
| `DD.rozet({metin, ikon, ton})` | büyük harf etiket; primary, notr | |
| `DD.durumRozet({kod}|{metin, ton, ikon})` | kod taslak, planli, tamamlandi, aktif, bekliyor, iptal, basarisiz · ton notr, uyari, basari, hata | |
| `DD.sayacRozet(n)`, `DD.madalya({ikon, hal, boy})` | hal ilerliyor, kilitli; boy kucuk, buyuk | |
| `DD.cip({metin, ikon, gorsel, sayi, deger, secili, kapat, pasif, kucuk})`, `DD.cipler({ad, tur:'tek'|'coklu', ogeler, secili, serit})` | 44 yükseklik | normal, seçili, pasif |
| `DD.segment({ad, ogeler:[{ad,deger,ikon,sayi}], secili, kaydir})` | tek sekme ailesi, kayan gösterge, r12 | |
| `DD.sekmeler(o)`, `DD.gunSekme({ad, ogeler:[{etiket,deger}], secili})` | segment `is-kaydir` | |
| `DD.adimGosterge({adim, toplam})`, `DD.ilerleme({oran}|{n, hedef, etiket, deger})` | | |

### Düğmeler
| API | Seçenek |
|---|---|
| `DD.btn({metin, tur, boyut:'sm', ikon, marka, gorsel, tam, pasif, yukleniyor, basili, tip})` | tur primary, secondary, tonal, text, yikici, cam. Marka ikonu: `marka:'apple'` (fa-brands) ya da `gorsel:'assets/marka/sosyal/google.svg'` |
| `DD.ikonBtn({ikon, etiket, tur, secili, pasif, tip})` | duz, kutu, tint, dolu, cam; `etiket` zorunlu |
| `DD.fab({ikon, etiket})` | Ekran içi; alt menü FAB çekirdekte, dokununca `#/ai/kamera`, uzun basınca hızlı işlem |
| `DD.uzunBas({ad, metin, ikon, tur, yardim, sure, onayBaslik, onayMetin, onayEylem, pasif})` | `dd-onay`; klavye ve ekran okuyucuda otomatik onay |
| `DD.link({metin, git})` | Tümü bağlantısı |

### Form
| API | Seçenek | Olay |
|---|---|---|
| `DD.input({ad, etiket, ikon, yer, deger, tur, birim, hata, yardim, pasif, temizle, cokSatir, mod, zorunlu})` | | input dinlenir |
| `DD.secAlan({ad, etiket, secenekler:[[deger,metin]], deger, yer, hata, yardim})`, `DD.telefon({ad, etiket, deger, opsiyonel, hata})` | | |
| `DD.arama({ad, yer, deger, mikrofon, filtre, sonuc})`, `DD.aramaKur(el, {kaynak:q=>[satir], son, sec, en, bosMetin, sonTemizle})` | `el` `.dd-arama` kabı | `dd-arama` |
| `DD.slider({ad, etiket, min, max, adim, deger, birim, etiketHer})` | | sayı |
| `DD.stepper({ad, deger, min, max, adim, birim, aria})` | Gastro adımlayıcı | sayı |
| `DD.toggle({ad, etiket, alt, ikon, secili, pasif})`, `DD.anahtar(o)`, `DD.checkbox({ad, etiket, alt, secili})`, `DD.radio({ad, deger, etiket, secili})` | | boolean; değer |
| `DD.porsiyon({ad, birimler, secili, miktar, kcal100})`, `DD.kesirIzgara({ad, secili})` | `besin.porsiyonlar` verilebilir | `{birim,miktar,gram,kcal}` |
| `DD.puan({ad, deger, etiket})` | | radyo |
| `DD.saatKadran({ad, deger, pencereSaat, etiket, adim, min, max})` | `min`, `max` `'HH:MM'` ya da dakika: kadran sınırda durur; `min > max` gece yarısını geçer | `'12:15'` |
| `DD.takvim({ad, gorunum, mod, secili, aralik, noktalar:{iso:['uyari','gecti']}, halkalar:{iso:oran}, min, max, gorunumSec, gecis})`, `DD.takvimSheet(o)`, `DD.takvimAlan({ad, etiket, deger, hizli})` | Gastro takvim | iso |
| `DD.secimKart({k, ad, alt, ikon, olcek, gorsel, secili, tek})`, `DD.secimler({ad, ogeler, secili, coklu, duzen})` | duzen tek, iki, uc, orta | değer ya da dizi |

### Yapı
| API | Seçenek |
|---|---|
| `DD.ustBar`, `DD.ustBtn`, `DD.altMenu` | Çekirdek çizer |
| `DD.menu.ac()`, `.kapat()` | Sağ çekmece: kullanıcı alanı, kısayollar, gruplar. `data-menu` açar |
| `DD.sheet({baslik, html, altBar, tam, sinif, sonra:(d)=>temizle, kapaninca})` → `d` | `d.kapat()`, `close` olayı; tutamaktan sürüklenir, Esc, geri tuşu. `data-sheet-kapat` |
| `DD.filtreSheet({baslik, gruplar:[{baslik, ad, ikon, tur, ogeler:[{metin, deger, gorsel, ikon, sayi}]}], secili, eylem, degisti, uygula})` | Gastro facet: seçili çipler, tek açık akordeon |
| `DD.siralaSheet({baslik, secenekler:[[deger, ad, ikon]], secili, sec})` | Sağda onay ikonlu tek seçim |
| `DD.dialog({baslik, metin, html, eylem, iptal, yikici})` → Promise<bool> | Gastro onay |
| `DD.toast(metin, {tur, ikon, eylem, onEylem, sure})` | Snackbar, sıralı |
| `DD.bant({ton, baslik, metin, ikon, eylem})`, `DD.ipucu({ikon, baslik, metin, html, ton, eylem})` | ipucu kutusu, 4 ton |
| `DD.bilgi({etiket, ikon, metin, html})`, `DD.veriYok(metin)`, `DD.cevrimdisi(metin)` | |
| `DD.bos({ikon, baslik, metin, eylem, ikincil, tam})` | Gastro durum |
| `DD.durumSahne({tema, gorsel, isaret, baslik, metin, not, ana, ikinciller, ipuclari, ipucuBaslik, ipucuParcali, oneriler, onerilerBaslik})`, `DD.hataEkran({tur, eylem, ikinciller})` | tur baglanti, genel, zaman, bulunamadi |
| `DD.vizor({foto, isaret, yonerge, tarama, bulanik, kompakt, ek})` | |
| `DD.izinIstemi({ikon, gorsel, baslik, metin, maddeler, izin, alternatif, red, reddedildi})` → `{html, bar}`, `DD.maddeler(l)` | `data-izin-ver`, `data-izin-ayar` |
| `DD.iskelet(n, tur)` | kart, satir, liste, izgara, detay, profil, ekran |

### Liste ve düzen
`DD.satir({ikon, sol, gorsel, gorselTon, avatar, baslik, baslikHtml, alt, deger, sag, ok, git, veri, duz, yikici})` (`sag`da düğme varsa `duz:true`) · `DD.satirlar(ogeler)` · `DD.satirKap(satir, dugmeler)` · `DD.parcali(ogeler, {aria, kutu:'yatay'|'izgara'})` (`{ikon, baslik, alt, git, ana, yikici, bilgi, rozet, pasif}`) · `DD.bas(baslik, {metin, git})` · `DD.bolum({baslik, eylem, git, html, gri, ic, id})` · `DD.yatay(dizi, {kart})` · `DD.ikiliSerit(dizi, etiket)` (dg-pairs: tam 2 kart) · `DD.stat([{deger, etiket, birim}], {yalin})` · `DD.stats([{deger, etiket}])` (foto üstü) · `DD.ozet([{ikon, etiket, deger, birim}])` · `DD.akordiyon([{baslik, alt, ikon, icerik, sag}], {acik})` · `DD.ako({baslik, html, acik})`.

### Ekran kabuğu
`DD.kubbe({gorsel, baslik, alt, etiket, stat, html, perde:'kart', rol})` · `DD.gulucuk({gorsel, baslik, alt, etiket, rol, icerik, rozet, red, ust, perde:'tam'})` · `DD.profilBas({ad, alt, kapak, gorsel, eylem, sayaclar, ust})` · `DD.banner({gorsel, etiket, baslik, alt, stat, git})` · `DD.altEylem({sol, dugmeler})` · `DD.kayanBar({gorsel, baslik, eylemler:[{ikon, ad, sayi, attrs}]})`.

### Kartlar
| API | Seçenek |
|---|---|
| `DD.kart({html, gri, git})` | Yüzey r24 |
| `DD.eylemKart({ikon, baslik, alt, rozet, git, secili, bilgi})` | 80, 44 ikon |
| `DD.programKart(p, {tur, gun, toplam, git, kayitli})` | card (4:5), row, tile, feature, aktif; DDCard ailesi |
| `DD.icerikKart({gorsel, kategori, baslik, meta, git})` | Gastro püf kartı |
| `DD.diyetisyenKart(d, {tur, eylem, ikincil, sayaclar, git})` | kart (96), tam, satir |
| `DD.metrikKart({etiket, deger, birim, ikon, ton, degisim, degisimTon, degisimIkon, seri, git})` | `deger:null` tire |
| `DD.ogunListe(l, o)`, `DD.ogunKart(x, {git, hedef, gunlukHedef, durumlar})` | durum dolu, planli, degisti, atlandi, bos. `x.foto` varsa mini halka yerine aynı hücrede tabak fotoğrafı |
| `DD.tabakIzgara({gunler:[{baslik, ozet, kayitlar}], git})` | Gün başlıklı 2 sütun fotoğraf ızgarası. Kayıt `{id, foto, ad, kcal, ogun, saat}`. `git` işlev ya da `':id'` kalıbı, varsayılan `#/kayit/:id`. Boş halde ekran `DD.bos` çizer |
| `DD.tabakSerit(kayitlar, {git, tumu, tumuMetin})` | Bugün şeridi; sonda Tümü, varsayılan `#/tabaklarim`. Tek kart `DD.tabakKart(k, {git, kucuk})` |
| `DD.kayitKaynak(kaynak, guven)` | kamera, galeri, ses, arama, barkod. "Fotoğraftan · Güven %92"; güven yoksa yalnız kaynak |
| `DD.oneriNot({ad, etiket, yer, deger, oneriler, secili})` | Girdi + öneri çipleri. `DD.on(k, ad, (not, {oneriler, serbest}) => {})`: `not` birleşik metin, `oneriler` seçili çipler |
| `DD.besinSatir(b, {swipe, eylemler, git, veri, sag, alt, ok})` | |
| `DD.suKart({icilen, hedef, adimlar, kayitEylem, ad})`, `DD.suMiktarlar({ogeler, eylem})`, `DD.suHafta({gunler, hedef})`, `DD.duygu({soru, secenekler, secili, ad})`, `DD.paketler({ad, ogeler, secili})` | `DDV.bugun.su`, `.duygu`, `d.paketler` |
| `DD.bildirimSatir(b, {git})`, `DD.yorum({ad, metin, meta})`, `DD.yorumBolumu({baslik, yorumlar, ozet, bos})`, `DD.paylas({baslik, url, alt})` | |
| `DD.icgoruKart({baslik, metin, yanitlar})`, `DD.soruCipleri({sorular})`, `DD.randevuSatir({gun, ay, baslik, alt, saat, durum, git})`, `DD.belgeSatir(o)`, `DD.gizlilikBant(metin)`, `DD.gorevSatir({baslik, alt, tamam, id})`, `DD.slotlar({ad, gruplar, secili})`, `DD.modulListe({ozet, ogeler})`, `DD.fotoIzgara(l)` | |

### Veri görselleri
`DD.halka({hedef, alinan, planli, kesitler, boyut:'lg'|'md', etiket, alt, yan, cumle, foto, git})` (184/18, açık yay; aşımda amber) · `DD.halkaMini({oran, ikon, boyut:'sm'|'xs', ton, silik})` (44/6, 24/4) · `DD.makroCubuk(makro, {tur:'dort'|'liste', kart, git})` · `DD.orucSayac({durum:'oruc'|'pencere'|'bos'|'bitti', gecenDk, hedefSaat, rozet, fazlar, canli, altMetin, git, veri})` · `DD.orucPil({durum, baslik, alt, oran, ikon, git})` · `DD.pencereBant({bas, bit, simdi, baslik, alt, git})` · `DD.dengeSkor({skor, etiket, fark, bilesenler, hazirlaniyor})` · `DD.dengeSatirlar(l)` · `DD.grafik({seri, tur:'spark'|'eksenli', hedef, hedefEtiket, secili, birim, ondalik, ton, ad, ham, onceki})` · `DD.grafikKart({deger, birim, fark, farkTon, cumle, grafik, donemler, donem, ad, alt})` · `DD.yolculuk({bas, simdi, hedef, birim, etiket})` · `DD.geriSayim({saniye, canli})` (yalnız randevu) · `DD.fazCizelge({fazlar, etkin})` · `DD.kiyasTablo({a, b, satirlar})` · `DD.tamamlanmaKart({gorsel, baslik, alt, bas, bit, eylem})` · `DD.zamanHucre(o)`, `DD.zamanHucreler(l)` · `DD.skorTon(s)`, `DD.skorRozet({skor, buyuk})`, `DD.skorKart({ad, kategori, skor, etiket, ikon, git})`, `DD.uyumRozet({oran})` · `DD.icerikUyari({metin, aciklama, durum})`, `DD.madde({metin, tur})`, `DD.etiketJeton({metin, durum, id})` · `DD.tahlilSatir({ad, deger, birim, referans, durum, aciklama})`.

### Dada AI ve sohbet
`DD.kamera({baslik, gorsel, belge, belgeler, modlar, mod, yonerge, ipucu, baglam, analiz, tarama, flas, durum, ornek})` (`dd-degisim` ad `kameraMod`, `dd-kamera`) · `DD.kameraIzinSahne({gorsel, baslik, metin})` · `DD.belge({tur, ...})` · `DD.analizAdimlari({adimlar, etkin})` · `DD.bbox({gorsel, kutular, secili, ad, etiketAdet})` · `DD.aiSatir(b, {secili})`, `DD.guvenRozet(g)`, `DD.varsayim({metin, eylem})` · `DD.oneriKart({gorsel, ad, kcal, P, puan, enUygun, rozet, gerekce, uyari, eylem})` · `DD.tabagim.ekle/cikar/liste/toplam/temizle/ac`, `DD.tabagimBar`, `DD.tabagimListe` · `DD.sesDalga({aktif, adet})`, `DD.transkript({etiket, metin, canli})` · `DD.sifreliRozet({metin})`, `DD.gunAyrac(metin)`, `DD.balon({kim, metin, saat, harf, ek})`, `DD.mesajGiris({ad, yer})`.

### Onboarding
`DD.onbSablon({adim, toplam, baslik, alt, neden, geri, atla, devam, altMetin, html})`.

## 5. Token özeti

`kanon/tokens.json` tek kaynak, `node kanon/uret.mjs` üretir. CSS `--dd-*`: `--dd-primary|-dark|-deep|-tint|-line`, `--dd-ink`, `--dd-slate`, `--dd-muted`, `--dd-line`, `--dd-bg`, `--dd-paper`, `--dd-protein|karb|yag|lif` + `-tint`, `-text`, durum `-fg`, `-bg`, `--dd-danger`, boşluk `--dd-s-*`, radius `--dd-r-*`, gölge `--dd-sh-*`, hareket `--dd-m-*`, `--dd-e-*`, `--dd-spring-*`, `--dd-ease`, ölçü `--dd-size-*`, rol `--dd-t-*`. JS `DD.TK`. Dart `flutter/dd_tokens.g.dart`.

## 6. Gastro → Diet

Sınıf çevirisi: `dgu-x` → `dd-x`, `dg-x` → `dd-x`, `dv2-x` → `dd-uz-x`, `dgu-sef*` → `dd-uzman*`, `.om*` → `.dd-menu*`, `.t-x` → `.dd-t-x`. Fark sütunu yoksa "aynı".

| Gastro | Diet | Fark |
|---|---|---|
| tokens.json nötr, durum, roller, space, radius, shadow, overlay, motion, size | kanon/tokens.json | aynı. Fark: `appMax` 430 (mimari §2), `size.logo` 120 (yatay logo), `radius.segment` 12 (Gastro kodu; json 16 yazar). Ek: space 2 ve 64, numeralLg, numeralMd, yeni bileşen ölçüleri |
| tomato, tomatoDark, tomatoDeep, tomatoTint | primary, primaryDark, primaryDeep, primaryTint | marka |
| accent.green / yellow | accentGreen #009A44 / accentYellow | yeşil marka tonuna |
| Makro: yağ yeşil, karb sarı | P, K, Y, Lif dört renk | Diet |
| `.dgu-header`, `.dgu-hbtn`, `--dgu-alfa` | `DD.ustBar` | fixed yerine ekran içi absolute; `--dd-header-solid` primaryDark |
| `.dgu-dock`, `.dgu-nav`, `.dgu-fab`, `.nav-dock` | `DD.altMenu` | dock şeffaf, nav %92 (kök ekran hali); kolon içi |
| `ortak-menu` `dialog.om` | `DD.menu` | div katman; dil ve sosyal alt bölümü yok (Diet'te yok); öğeler Diet |
| `.dgu-btn` (`--ikincil`, `--tonlu`, `--metin`, `--sm`, `--tam`) | `DD.btn` | `--yikici`, `--cam` eklendi; tonlu basılı hal düzeltildi (Gastro'da metin kayboluyordu) |
| `.dgu-ibtn`, `.dgu-chip`, `.dgu-seg`, `.dgu-girdi`, `.dgu-girdi-ses`, `.dgu-alan`, `.dgu-hata`, `.dgu-yardim`, `.dgu-secici` | `DD.ikonBtn`, `DD.cip`, `DD.segment`, `DD.input`, `DD.arama`, `DD.secAlan` | hata rengi domates yerine hataFg (primary yeşil oldu); `.dd-ibtn` kutu, tint, dolu, cam ekleri |
| `DG.telefon` | `DD.telefon` | yalnız TR, ülke sheet'i yok (bayrak seti yok) |
| `.dgu-adimlayici` | `DD.stepper` | aynı |
| `.dgu-secim`, `.dgu-anahtar` | `DD.checkbox`, `DD.radio`, `DD.anahtar`, `DD.toggle` | aynı |
| `DG.secimKart`, `.dgu-secim-izgara`, `.dgu-secim-olcek` | `DD.secimKart`, `DD.secimler` | aynı; bayrak çeşidi taşınmadı |
| `dg-takvim` | `dd-takvim.js`, `DD.takvim` | + mini halka |
| `.dgu-avatar`, `.dgu-kucuk-foto`, `.dgu-rozet`, `DG.durumRozet`, `.dgu-sayac`, `.dgu-madalya`, `.dgu-ilerleme`, `.dgu-adim` | `DD.avatar`, `DD.kucukFoto`, `DD.rozet`, `DD.durumRozet`, `DD.sayacRozet`, `DD.madalya`, `DD.ilerleme`, `DD.adimGosterge` | küçük metinli primary dolgular primaryDark (kontrast); üst bar sayacı sarı |
| `.dgu-kart`, `.dgu-bilgi`, `.dgu-ipucu`, `.dgu-eylem`, `.dgu-ozet`, `.dgu-istatistik`, `.dgu-stats`, `.dgu-veri-yok`, `.dgu-cevrimdisi` | `DD.kart`, `DD.bilgi`, `DD.ipucu`, `DD.eylemKart`, `DD.ozet`, `DD.stat`, `DD.stats`, `DD.veriYok`, `DD.cevrimdisi` | ipucu dört tonla `DD.bant` |
| `.dgu-satir`, `.dgu-satirlar`, `.dgu-satir-kap`, `DG.parcali`, `.dg-head`, `.dgu-bolum`, `.dgu-akordiyon`, `.dgu-akordeon` | `DD.satir`, `DD.satirlar`, `DD.satirKap`, `DD.parcali`, `DD.bas`, `DD.bolum`, `DD.akordiyon`, `DD.ako` | is-yikici hata tonu |
| `DGCard` feature, tile, card, row, pairs | `DDCard`, `DD.programKart`, `DD.ikiliSerit` | meta süre/görüntülenme yerine gün/öğün; slider `DD.oneCikan` |
| `.dgu-puf` | `DD.icerikKart` | aynı |
| `.dgu-sef-kart`, `dg-sef-karti`, `.dgu-yazar`, `.dgu-sef-satir` | `DD.diyetisyenKart` kart, tam, satir | Takip Et yerine Randevu; Abone ol yerine Mesaj |
| `dialog.dgu-sheet`, `.dgu-tutamak`, `dialog.dgu-diyalog`, `.dgu-snack` | `DD.sheet`, `DD.dialog`, `DD.toast` | div katman; telefon kolonunda kalır |
| `.dgu-durum`, `DG.durumSahne`, `DG.vizor`, `DG.izinIstemi`, `.dgu-izin`, `DG.gulucuk` | `DD.bos`, `DD.durumSahne`, `DD.vizor`, `DD.izinIstemi`, `DD.gulucuk` | aynı |
| `.dgu-duvar` (giriş duvarı) | taşınmadı | Diet'te misafir kapısı yok |
| `DG.kamera`, `.dgu-kamera*`, izin sahnesi | `DD.kamera`, `DD.kameraIzinSahne` | + mod şeridi, bağlam hapı, kâğıt önizleme, ağ; kamera katmanı yerine ekran; barkod da görsel + perde |
| `.dgu-banner`, `.dgu-panel`, `DG.kubbeBoya`, `.dgu-kubbe-*`, `.dgu-gulucuk`, `DG.profilBas` | `DD.kubbe`, `DD.kubbeBoya`, `DD.gulucuk`, `DD.profilBas` | aynı; `is-detay` boy (detay-v2) |
| `.dgu-bar`, `.dgu-kayan`, `.cook-bar`, `.engagement-icon` | `DD.altEylem({ikonlar})`, `DD.kayanBar` | ekran içi |
| `acilis.css` `.ac-s2`, `.ac-k3` | `DD.acilis`, `DD.acilisCik`, `DD.karsilamaKabuk` | `dd-kalip.css`; düz `.dgu-acilis` taşınmadı |
| `ana-v3`: `.x-hero`, `.v3-hero-track`, `.v3-content`, `.v3-surface`, `.v3-strip`, `DGCard.slider` | `DD.heroAna`, `DD.bolumler`, `DD.yuzey`, `DD.seritKartlar`, `DD.oneCikan`, `DD.kesikKart` | `dd-kalip.css`; hero içine `icerik` yuvası eklendi (halka) |
| `liste-v2.css`, `.list-tools`, `.dg-chip-rail`, `.dg-mark`, `.dg-facet`, `.dg-choice`, `.dg-page`, `.view-toggle` | `dd-liste.css`, `DD.listeArac`, `DD.cipSerit`, `DD.listeDurum`, `DD.listeSonuc`, `DD.listeTema`, `DD.listeBos`, `DD.sayfalama`, `DD.filtreSheet`, `DD.siralaSheet` | ad çevirisi; `.dg-slider` `.dd-kslider` oldu (biyometrik `.dd-slider` ile çakışır) |
| `detay-v2`: `.detail-hero`, `.dv2-cap`, `.dv2-facts`, `.dv2-feature*`, `.dv2-desc`, `.dv2-tabs-bar`, `.dv2-pane`, `.dv2-info-*`, `.dv2-meta-list` | `DD.detay`, `DD.ozetSerit`, `DD.ozellikSerit`, `DD.aciklama`, `DD.detaySekmeler`, `DD.bilgiSerit`, `DD.kunye` | `dd-kalip.css`; özet şeridi detayın kendi kalıbı, `DD.ozet` kart içi kullanım için kalır |
| `.dgu-bildirim`, `.dgu-paylas*`, `.dgu-puan`, `dg-yorum`, `.dgu-yorum` | `DD.bildirimSatir`, `DD.paylas`, `DD.puan`, `DD.yorumBolumu`, `DD.yorum` | yorum süzme ve yazma formu taşınmadı |
| `dg-metin.js/css` | `dd-metin.js/css` | aynı; DOM gözcüsü router sonrası da işler |
| `dg-hareket.css`, `DG.iskelet`, `DG.sonsuz`, `DG.mesgul`, `DG.yenileKur`, `.has-gosterge` | `dd-hareket.css`, `DD.iskelet`, `DD.sonsuz`, `DD.mesgul`, `cekYenile`, `DD.segGosterge` | sayfa geçişi yerine ekran yığını |
| `.dgu-mod*`, `.dgu-video*`, `.dgu-akis*`, `.dgu-zengin*`, `.dgu-blok*`, `.dgu-oynatici`, `.dgu-kanal`, `.dgu-kat`, bayrak, `dg-dolap`, `dg-baglanti` | CSS'te duruyor, çizici yok | Diet ekranı yok; gerekirse çizici eklenir |

Eşit içerik kıyasında kalan farklar: `.dd-seg-sayi` ağırlığı 500 (Gastro kalın üst öğeden sahte kalın alır; genişlik aynı), program kartı meta ve uzman unvanı içerik uzunluğundan, menü listesi öğe sayısından gelir. Kalan her ölçü aynıdır.

Taşınmayanlar: `liste-v2` kiler filtresi (`#pantryFilter`) ve tema bloğunun segmentle daralma hareketi (`.is-collapsed` CSS'i duruyor, çizici yok), bayrak işareti çizicisi; `detay-v2` tam ekran foto galeri, malzeme ve porsiyon paneli, pişirme modu, puan satırı ayıracı. Diet ekranlarında karşılığı yok; gerekirse önce buraya eklenir. Ayrıca telefon ülke sheet'i, yorum süzme formu, giriş duvarı, menü dil ve sosyal bölümü.

Gerçekten yeni olanlar (`tasks/gastro-esleme.md` §4) `dd-yeni.css`, `dd-gosterge.js`: halka, makro, oruç sayacı, Denge Skoru, grafik, slider, kadran, porsiyon, uzun bas, swipe, öğün kartı, su, duygu, bbox, öneri, ses, sohbet, faz, kıyas, ürün skoru, tahlil, paket, Tabağım, belge.

## 7. Kararlar

1. Bu sürüm eski "kardeş" kanonun yerini aldı: seçim kartı seçili hali tam dolu değil Gastro tint + deep kenardır; alt sekme yalnız segmenttir; bölüm başlığı `.dd-head`.
2. Üst bar solid `--dd-header-solid` = primaryDark #007E38 (lead kararı). Neden: üst bar 16 kalın başlık metni taşır; metin kuralı 4.5:1 ister, primary beyazla 3.68:1 kalır, primaryDark 5.2:1 verir. Primary #009A44 FAB, gösterge, halka ve dolgularda kalır.
3. Küçük metin taşıyan primary dolgular primaryDark (takvim seçili gün, sayaç rozeti) ve hata tonları `dd-kabuk.css`te ayrı kırmızı (lead kabul etti). Neden: primary üzerinde küçük metin 4.5:1 tutmaz; Gastro'da hata rengi primary ile aynı olduğu için marka değişince hata yeşil görünürdü.
4. Orta düğme doğrudan `#/ai/kamera` açar (lead kararı). Neden: Mimari §4 böyle der ve Yasin Bey'in bilgi mimarisinde modlar SCR-30'un içindedir; araya panel koymak bir dokunuş ekler. `tasks/gastro-esleme.md` §2'deki panel satırı kaldırıldı. 2×2 parçalı bileşen (`DD.parcali`) kanonda kalır.
5. Gilroy'da tabular rakam yok (rakam genişliği 19-30). Canlı sayaç rakamları sabit hücrede (`DD.rakamlar`).
6. Üç veri görseli biçimden ayrılır: halka 270 açık yay, oruç tam daire, Denge Skoru yarım kadran. Denge kadranı bileşen segmentlidir.
7. bbox: varsayılan hap etiket + nokta, çerçeve yalnız seçili halde; etiket kenara itilir, en çok 4. Etikette ad her kelimesi büyük harfle, kcal `--dd-primary-dark` ve bold.
8. Sosyal paylaşım marka renkleri `dd-bilesen.css`te hex kalır (üçüncü taraf markaları).
9. Karanlık desen yok; `DD.geriSayim` yalnız randevu.
10. Ekran kalıpları `DD.heroAna`, `DD.detay`, `DD.kubbe({arac})` ve kardeşleri bileşen sayılır. Neden: Bugün, Programlar ve Program detay Gastro'nun `ana-v3`, `liste-v2`, `detay-v2` ekranlarıdır; bu CSS kanon dışında kalsaydı ekran yazarları ekrana özel stil yazmak zorunda kalırdı.
11. `DD.oneCikan` kart slider'ının sınıfı `.dd-kslider`: biyometrik `.dd-slider` adı Diet'te doluydu.
12. Hero içine `icerik` yuvası eklendi: Gastro hero'su arama taşır, Bugün halka taşır (esleme §1). Halka fotoğraf üstünde okunsun diye `perde:'tam'` ile birlikte kullanılır.
13. Liste kapsam segmenti ve detay sekmesi Gastro'daki ekran halleriyle aynıdır: seçili olmayan normal ağırlık; liste halinde 13 yazı, dolgusuz, açık zemin. Katalog segmenti `dd-kontrol.css` değerlerindedir.
14. Hero sabitleri (`motion.sahne`, `size.heroMin`, `size.heroMax`) token oldu; değerler Gastro `ana-v3` ile aynı.
15. Sekme ekranı DOM'da kaldığı için `sonra` temizlemesi sekme değişiminde çalışmaz; `gizlen` ve `donus` kancaları süre tutan döngüler içindir.
16. Metin kuralı Gastro'dan ayrılır (lead kararı, mimari §2): yalnız paragraf, `.dd-metin` ve kart açıklaması justify ve hecelidir. Başlık kümesi (`h1-h6`, kart ve sheet başlıkları, ad, etiket, buton) `start` ya da `--dd-baslik-hiza` alır, hecelenmez. Neden: dar sütunda iki satırlı yaslı başlıkta sözcük arası 4,91em'e kadar açılıyordu. Fark `dd-metin.css` ve `dd-metin.js` içindedir.
17. Fotoğraf üstü halkada "Hedefin üstünde" etiketi kendi zemininde hap olur: fotoğraf rengi bilinmediği için kontrast ancak böyle garanti edilir.
18. Düz renk açılış kaldırıldı, `DD.acilis` Gastro kolajıdır. Neden: Beyar kuralı düz koyu zemine izin vermez.
19. Sohbet balonu da başlık kümesi gibi davranır: kısa mesajdır, `start` hizalanır, hecelenmez.
20. Ortalı kısa metin (`.dd-durum`, sahne, izin, boş liste, profil kimliği, `DD.p({orta})`) `text-align:center` + `text-wrap:balance` alır, hecelenmez. Neden: ölçüldü, justify ile balance birlikte ilk satırı daha çok geriyor ("Beklenmedik    bir    hata    oluştu."); mimari §2'deki ortalı blok kuralından bilinçli sapmadır.
21. Tabak kartı yeni aile değildir: DDCard tile'ın kare medyalı halidir, perde ve kcal metası aynı kurallarla gelir. Fotoğraf yargı aracı olmadığı için puan ve renkli işaret taşımaz; `DD.kayitKaynak` nötr rozettir.
