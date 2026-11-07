/* veri/tabak.js — Tabak Kur. Kaynak: Dada Diet web prototipi assets/js/sayfa/moduller-tabak.js (Akıllı Tabak v1.2), aynen alındı; web değişirse burası da değişir.
 * DDV.tabakKur: { bolme:{id:{ad, aralik:[alt,ust]}}, katsayi, kategori, yemek, ekYemek, oneri, hazir, besinGrubu }. Yemek dağılımı [sebze, protein, karb, yağ], gram orta porsiyon.
 */
window.DDV = window.DDV || {};
DDV.tabakKur = {
  katsayi: 0.47,
  bolme: {sebze: {ad: 'Sebze', aralik: [40, 50]}, protein: {ad: 'Protein', aralik: [20, 25]}, karb: {ad: 'Karbonhidrat', aralik: [20, 25]}, yag: {ad: 'Sağlıklı yağ', aralik: [5, 10]}},
  besinGrubu: {'Sebzeler': 'sebze', 'Meyveler': 'sebze', 'Et & Tavuk': 'protein', 'Balık & Deniz': 'protein', 'Süt Ürünleri & Yumurta': 'protein', 'Baklagiller': 'protein', 'Tahıllar': 'karb', 'Yağlar & Soslar': 'yag', 'Kuruyemiş': 'yag'},
  kategori: {
    et: { oran: [15, 60, 0, 25], gram: 200, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    bakliyat: { oran: [5, 35, 45, 15], gram: 250, olcu: ['½ kase', '1 kase', '1,5 kase'] },
    zeytinyagli: { oran: [65, 0, 15, 20], gram: 200, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    hamur: { oran: [0, 10, 70, 20], gram: 150, olcu: ['3 yemek kaşığı', '6 yemek kaşığı', '9 yemek kaşığı'] },
    salata: { oran: [95, 0, 0, 5], gram: 200, olcu: ['1 küçük kase', '1 kase', '1 büyük kase'] },
    yumurta: { oran: [45, 50, 0, 5], gram: 150, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    meze: { oran: [25, 65, 0, 10], gram: 100, olcu: ['2 yemek kaşığı', '4 yemek kaşığı', '6 yemek kaşığı'] },
    meyve: { oran: [70, 30, 0, 0], gram: 150, olcu: ['½ kase', '1 kase', '1,5 kase'] },
    tatli: { oran: [75, 20, 0, 5], gram: 150, olcu: ['½ kase', '1 kase', '1,5 kase'] },
  },
  ekYemek: [
    { slug: 'karniyarik', ad: 'Karnıyarık', tur: 'Sebze Yemeği', deger: { kcal: 298, protein: 14.4, yag: 19.6, karb: 18.8, lif: 7.8 } },
    { slug: 'somon-izgara', ad: 'Somon Izgara', tur: 'Balık ve Deniz Ürünleri', deger: { kcal: 353, protein: 33.1, yag: 23.5, karb: 0, lif: 0 } },
  ],
  yemek: {
    'karniyarik': { oran: [80, 15, 0, 5], gram: 300, olcu: ['½ patlıcan', '1 patlıcan', '1,5 patlıcan'] }, 'somon-izgara': { oran: [0, 95, 0, 5], gram: 155, olcu: ['½ dilim', '1 dilim', '1,5 dilim'] },
    'firinda-sebzeli-tavuk': 'et', 'yesil-mercimek-yemegi': 'bakliyat', 'mercimek-koftesi': { oran: [10, 30, 50, 10], gram: 150, olcu: ['2 sıkım', '1 tabak / 4 sıkım', '1,5 tabak / 6 sıkım'] },
    'domatesli-bulgur-pilavi': 'hamur', 'mevsim-salatasi': 'salata', 'sebzeli-levrek-bugulama': 'et', 'imambayildi': 'zeytinyagli', 'mercimek-corbasi': 'bakliyat',
    'menemen': 'yumurta', 'sebzeli-tavuk-sote': 'et', 'yogurtlu-tavuk-sis': 'et', 'izgara-sebzeli-dana-bonfile': 'et', 'karidesli-guvec': 'et', 'ton-balikli-salata': 'et',
    'ezogelin-corbasi': 'bakliyat', 'nohut-salatasi': 'bakliyat', 'kisir': 'hamur', 'zeytinyagli-pirasa': 'zeytinyagli', 'firinda-sebze-turlusu': 'zeytinyagli',
    'izgara-sebzeli-sandvic': 'hamur', 'pose-yumurtali-ekmek': 'hamur', 'kahvalti-patatesi': 'hamur', 'overnight-yulaf': 'hamur',
    'sebzeli-peynirli-omlet': 'yumurta', 'ispanakli-omlet': 'yumurta', 'cilbir': 'yumurta', 'otlu-kaygana': 'yumurta', 'sebzeli-yumurta-muffin': 'yumurta',
    'sebze-cubuklu-humus': 'meze', 'haydari': 'meze', 'girit-ezmesi': 'meze',
    'naneli-meyve-salatasi': 'meyve', 'cilekli-smoothie': 'meyve', 'cilekli-donmus-yogurt': 'tatli', 'firinda-tarcinli-elma': 'tatli', 'tarcinli-firin-armudu': 'tatli',
  },
  oneri: { sebze: ['roka', 75, 'bol yeşillik ve limon', 'Yeşillik ekle'], protein: ['yogurt-yarim-yagli', 120, 'yoğurt', 'Yoğurt ekle'], karb: ['kepekli-ekmek', 50, 'iki dilim kepekli ekmek', 'Ekmek ekle'], yag: ['zeytinyagi', 10, 'iki tatlı kaşığı zeytinyağı', 'Zeytinyağı ekle'] },
  hazir: [
    { ad: 'Tavuklu tabak', kalem: [['firinda-sebzeli-tavuk', 1], ['domatesli-bulgur-pilavi', 1], ['mevsim-salatasi', 1]] },
    { ad: 'Balıklı tabak', kalem: [['sebzeli-levrek-bugulama', 1], ['domatesli-bulgur-pilavi', 1], ['mevsim-salatasi', 1]] },
    { ad: 'Ev yemeği', kalem: [['yesil-mercimek-yemegi', 1], ['mevsim-salatasi', 1.5]] },
    { ad: 'Vejetaryen tabak', kalem: [['imambayildi', 1], ['mercimek-koftesi', 1], ['haydari', 0.5]] },
  ]
};
