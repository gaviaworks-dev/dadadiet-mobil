/* Şifreli sohbet (#/uzman/sohbet). Referans: tasks/referanslar.md Sohbet.
 * Durum: uzman-sohbet (DDV mesajlarının üstüne eklenenler, {id, kim, saat:'Bugün 17:10', metin, ek?:{tur, ad}}), uzman-okundu (son okunan id).
 * saglik.js ve ai-tahlil de uzman-sohbet'e yazar. #/uzman/sohbet?hal=bos diyetisyen yok, ?hal=hata bağlantı hatası. */
(() => {
  const B = () => DDV.benimDiyetisyenim;
  const benim = () => DDV.diyetisyenler.find(d => d.slug === B().diyetisyen);
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  const ekler = () => DD.durum.oku('uzman-sohbet', []);
  // ai-tahlil gönderimi kendi bayrağını yazar; sohbette gönderilen tahlil olarak görünür.
  const aiTahlil = () => { if (!DD.durum.oku('ai-tahlil-gonderildi', false)) return []; const t = DDV.saglik.kanTahlilleri.find(x => x.id === DDV.ai.tahlil.tahlil); return [{id: 11, kim: 'ben', saat: `Bugün ${DDV.bugun.simdi}`, metin: 'Tahlil sonucumu gönderiyorum.', ek: {tur: 'tahlil', ad: `Kan tahlili · ${t.tarihMetin}`}}]; };
  const mesajlar = () => [...B().sohbet.mesajlar, ...aiTahlil(), ...ekler()];
  const EK_IKON = {menu: 'program', tahlil: 'tahlil', olcum: 'kilo', ogun: 'ogun'};
  const SORULAR = ['Görüşmeyi öne alabilir miyiz?', 'Su hedefim ne kadar?', 'Lokantada ne seçeyim?'];

  // Otomatik kısa cevap: katlanmış metinde ilk eşleşen konu. Diyetisyen dönene kadar yönlendirir, tıbbi yorum yapmaz.
  const CEVAPLAR = () => [
    [/tahlil|vitamin|kolesterol/, 'Tahlilini aldım, teşekkürler. **Görüşmemizde** birlikte bakalım.'],
    [/randevu|gorusme|seans|one al/, 'Takvimime bakıp döneceğim. Uzmanım ekranından **saati kendin de** değiştirebilirsin.'],
    [/\bsu\b|suyu|litre/, `Hedefin **${DD.ondalik(DDV.kullanici.suHedefMl / 1000, 1)} litre**. Öğleden sonra masanda dolu bir şişe tutmayı sürdür.`],
    [/lokanta|disari|restoran/, 'Izgara ya da buğulama bir protein, yanına salata iyi olur. **Menüyü okutup** seçimini bana yaz.'],
    [/kilo|tarti|olcum|\bbel\b/, 'Teşekkürler, **ölçümlerini** dosyandan görüyorum. Görüşmemizde eğilime birlikte bakarız.'],
    [/menu|ogun|yemek|aksam|kahvalti/, 'Not aldım. Gerekirse **haftalık menünde** küçük bir değişiklik yaparız.'],
    [/oruc|pencere/, `Pencereni **${DDV.kullanici.sonOgunSaati}** gibi kapatman yeterli. Zorlandığın gün olursa bana yaz.`]
  ];
  const cevapBul = metin => { const n = DD.katla(metin), x = CEVAPLAR().find(([re]) => re.test(n)); return x ? x[1] : `Mesajını aldım ${DDV.kullanici.ad}. Müsait olunca **ayrıntılı dönüş** yapacağım.`; };

  const parca = s => { const i = s.lastIndexOf(' '); return [s.slice(0, i), s.slice(i + 1)]; };
  const balon = m => DD.balon({kim: m.kim === 'ben' ? 'ben' : 'o', harf: benim().harf, metin: m.metin, saat: parca(m.saat)[1], ek: m.ek && {ad: m.ek.ad, ikon: EK_IKON[m.ek.tur]}});
  const yaziyor = () => DD.balon({kim: 'o', harf: benim().harf, metin: 'Yazıyor', saat: ''});
  const liste = bekliyor => {
    let gun = '';
    const html = mesajlar().map(m => { const g = parca(m.saat)[0], ayrac = g !== gun ? DD.gunAyrac(g) : ''; gun = g; return ayrac + balon(m); }).join('');
    return html + (bekliyor ? yaziyor() : '');
  };

  DD.ekran('uzman-sohbet', {
    tur: 'alt',
    nav: 'uzman',
    ust: '#/uzman',
    tabagim: false,
    iskelet: 'liste',
    baslik: () => (hal() === 'bos' ? 'Sohbet' : benim().kisaAd),
    ustBar: () => (hal() ? {} : {sag: [{ikon: 'takvim', etiket: 'Görüşmeler', git: '#/uzman'}]}),
    yukle: () => new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.quick)),
    ciz: () => {
      if (hal() === 'hata') return DD.hataEkran({tur: 'baglanti', eylem: {metin: 'Tekrar dene', ikon: 'yenile', yerine: '#/uzman/sohbet'}, ikinciller: [{metin: 'Uzmanım', ikon: 'uzman', yerine: '#/uzman'}]});
      if (hal() === 'bos') return DD.bos({tam: true, ikon: 'sohbet', baslik: 'Sohbet için bir uzman seç', metin: 'Diyetisyeninle **şifreli mesajlaşma** paketle birlikte açılır.', eylem: {metin: 'Uzman bul', ikon: 'ara_', git: '#/uzman/bul'}});
      const d = benim(), S = B().sohbet;
      return `<div class="dd-ic dd-yigin">
        <div class="dd-yigin-12">${DD.diyetisyenKart(d, {tur: 'satir'})}<div class="dd-gun-ayrac">${DD.sifreliRozet({metin: S.sifreMetni})}</div></div>
        <div class="dd-yigin-12" data-mesajlar>${liste(false)}</div>
        ${DD.soruCipleri({sorular: SORULAR})}
      </div>`;
    },
    altBar: () => (hal() ? '' : DD.mesajGiris({ad: 'mesaj', yer: 'Mesaj yaz'})),
    sonra: kok => {
      if (hal()) return undefined;
      const kap = kok.querySelector('[data-mesajlar]'), kaydir = kok.querySelector('.dd-kaydir'), girdi = kok.querySelector('input[name="mesaj"]'), form = kok.querySelector('[data-mesaj]');
      let bekleyen = null, zaman = 0;
      const sonaIn = () => { kaydir.scrollTop = kaydir.scrollHeight; };
      const ciz = () => { kap.innerHTML = liste(!!bekleyen); sonaIn(); };
      const okundu = () => { const l = mesajlar(); DD.durum.yaz('uzman-okundu', l[l.length - 1].id); };
      const yaz = m => DD.durum.yaz('uzman-sohbet', [...ekler(), {id: Date.now(), saat: `Bugün ${DDV.bugun.simdi}`, ...m}]);
      // Ekran kapanırsa bekleyen cevap kaybolmasın diye yazma işi ayrıdır.
      const cevapYaz = () => { if (!bekleyen) return; yaz({kim: 'diyetisyen', metin: bekleyen}); bekleyen = null; };
      const gonder = (metin, ek) => {
        yaz({kim: 'ben', metin, ...(ek ? {ek} : {})});
        cevapYaz();
        clearTimeout(zaman);
        bekleyen = cevapBul(`${metin} ${ek?.tur || ''}`);
        ciz();
        DD.titres(10);
        zaman = setTimeout(() => { cevapYaz(); ciz(); okundu(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal * 4);
      };
      const paylasimAcik = alan => DD.durum.oku('saglik-paylasim', {olcum: true, tahlil: true, analiz: true})[alan];
      const ekSheet = () => {
        const t = [...DD.durum.oku('saglik-tahliller', []), ...DDV.saglik.kanTahlilleri][0], kilo = DD.durum.oku('saglik-olcumler', []).at(-1)?.kiloKg ?? DDV.saglik.ozet.guncelKiloKg;
        const secenekler = {
          tahlil: {izin: 'tahlil', metin: 'Son tahlilimi gönderiyorum.', ek: {tur: 'tahlil', ad: `Kan tahlili · ${t.tarihMetin}`}},
          olcum: {izin: 'olcum', metin: `Bugünkü tartım ${DD.ondalik(kilo, 1)} kg.`, ek: {tur: 'olcum', ad: 'Ölçüm özeti'}},
          ogun: {metin: 'Bugünkü öğünlerimi gönderiyorum.', ek: {tur: 'ogun', ad: `Öğün günlüğü · ${DD.tarihKisa(DD.bugunIso())}`}}
        };
        DD.sheet({
          baslik: 'Dosya ekle',
          html: `<div class="dd-yigin-12">${DD.satirlar([
            {ikon: 'tahlil', baslik: 'Son tahlilim', alt: t.tarihMetin, veri: {eylem: 'ek-gonder', id: 'tahlil'}},
            {ikon: 'kilo', baslik: 'Son ölçümüm', alt: `${DD.ondalik(kilo, 1)} kg`, veri: {eylem: 'ek-gonder', id: 'olcum'}},
            {ikon: 'ogun', baslik: 'Bugünkü öğünlerim', alt: DD.tarihKisa(DD.bugunIso()), veri: {eylem: 'ek-gonder', id: 'ogun'}},
            {ikon: 'kamera', baslik: 'Tabağımı fotoğrafla', alt: 'Dada AI ile tara', git: '#/ai/kamera?mod=tabak'}
          ])}${DD.gizlilikBant('Eklediğin dosyaları **yalnız sen ve diyetisyenin** görürsün.')}</div>`,
          sonra: s => DD.eylem(s, 'ek-gonder', el => {
            const x = secenekler[el.dataset.id];
            s.kapat();
            if (x.izin && !paylasimAcik(x.izin)) { DD.toast('Bu paylaşım **dosyanda kapalı**', {ikon: 'gizlilik', eylem: 'Aç', onEylem: () => DD.git('#/saglik')}); return; }
            gonder(x.metin, x.ek);
          })
        });
      };

      const gonderForm = ev => {
        ev.preventDefault();
        const metin = girdi.value.trim();
        if (!metin) return;
        girdi.value = '';
        gonder(metin);
      };
      // Ekli mesaj balonu: menü programa, tahlil Sağlık dosyam'a gider.
      const ekAc = ev => {
        const el = ev.target.closest('.dd-balon-ek');
        if (!el) return;
        const m = mesajlar().filter(x => x.ek)[[...kap.querySelectorAll('.dd-balon-ek')].indexOf(el)];
        DD.git(m?.ek.tur === 'menu' ? `#/program/${B().haftalikMenu.program}` : m?.ek.tur === 'ogun' ? '#/bugun' : '#/saglik');
      };
      form.addEventListener('submit', gonderForm);
      kap.addEventListener('click', ekAc);
      sonaIn();
      okundu();
      const c = [DD.eylem(kok, 'ek', ekSheet), DD.eylem(kok, 'soru', el => gonder(el.dataset.soru)), DD.eylem(kok, 'ses-mesaj', () => gonder('Sesli mesaj gönderdim.', {tur: 'ses', ikon: 'mikrofon', ad: 'Sesli mesaj · 0:12'}))];
      return () => { clearTimeout(zaman); cevapYaz(); form.removeEventListener('submit', gonderForm); kap.removeEventListener('click', ekAc); c.forEach(f => f()); };
    }
  });
})();
