/* SCR-01 Karşılama (#/karsilama): Gastro .ac-k3, gülücük kapak + beyaz alanda giriş yolları. Referans: tasks/referanslar.md Karşılama satırları.
 * Apple, Google ve E-posta hedef adımına gider (DD.durum 'onboarding'.giris); "Zaten hesabım var" Giriş ekranını (#/giris) açar; oturum orada açılır. */
(() => {
  const G = () => DDV.onboarding.giris;
  const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, SIFRE_EN_AZ = 8;
  const girisSure = () => (DD.azHareket() ? 0 : DD.TK.motion.reveal * 2);
  const baslat = yol => {
    DD.durum.yaz('onboarding', {...DD.durum.oku('onboarding', {}), giris: yol});
    DD.git('#/onboarding/hedef');
  };
  const dugme = b => {
    const ana = {metin: b.ad, tam: true, veri: {eylem: 'giris', id: b.id}};
    return DD.btn(b.id === 'eposta' ? {...ana, ikon: b.ikon} : {...ana, tur: 'secondary', ...(b.gorsel ? {gorsel: b.gorsel} : {marka: b.ikon})});
  };

  const formHtml = (d = {}, h = {}) => `<div class="dd-yigin">
    ${DD.input({ad: 'eposta', etiket: 'E-posta', ikon: 'envelope', tur: 'email', mod: 'email', yer: 'ad@posta.com', deger: d.eposta, hata: h.eposta})}
    ${DD.input({ad: 'sifre', etiket: 'Şifre', ikon: 'lock', tur: 'password', yer: `En az ${SIFRE_EN_AZ} karakter`, deger: d.sifre, hata: h.sifre})}
  </div>`;
  const epostaSheet = () => DD.sheet({
    baslik: 'E-posta ile devam et',
    html: formHtml(),
    altBar: DD.btn({metin: 'Devam et', tam: true, veri: {eylem: 'eposta-devam'}}),
    sonra: s => DD.eylem(s, 'eposta-devam', el => {
      const d = {eposta: s.querySelector('[name="eposta"]').value.trim(), sifre: s.querySelector('[name="sifre"]').value};
      const h = {eposta: EPOSTA.test(d.eposta) ? '' : 'Geçerli bir e-posta adresi yaz', sifre: d.sifre.length >= SIFRE_EN_AZ ? '' : `Şifren en az ${SIFRE_EN_AZ} karakter olmalı`};
      if (h.eposta || h.sifre) { s.querySelector('.dd-sheet-govde').innerHTML = formHtml(d, h); return; }
      DD.mesgul(el, girisSure()).then(() => { s.kapat(); baslat('eposta'); });
    })
  });

  DD.ekran('karsilama', {
    haller: false,   // akış ekranı: ?hal= durum halleri uygulanmaz
    tur: 'tam',
    tabagim: false,
    ciz: () => {
      const g = G();
      return DD.karsilamaKabuk({
        gorsel: g.gorsel, baslik: g.baslik, metin: g.altMetin.replace('kalori ve öğün düzenini', '**kalori ve öğün düzenini**'),
        html: `<div class="dd-yigin-12"><div class="dd-yigin-8">${g.butonlar.map(dugme).join('')}${DD.btn({metin: 'Zaten hesabım var', tur: 'text', tam: true, veri: {eylem: 'hesabim-var'}})}${DD.btn({metin: 'Üye olmadan devam et', tur: 'text', tam: true, git: '#/bugun'})}</div>${DD.p(g.kvkkKisa.replace('Aydınlatma Metni', '**Aydınlatma Metni**'), {orta: true, meta: true, ton: 'ikincil'})}</div>`
      });
    },
    sonra: kok => {
      const c1 = DD.eylem(kok, 'giris', el => {
        if (el.dataset.id === 'eposta') { epostaSheet(); return; }
        if (navigator.onLine === false) { DD.toast('**Bağlantı yok.** Bağlanınca yeniden dene.', {tur: 'hata'}); return; }
        DD.mesgul(el, girisSure()).then(() => baslat(el.dataset.id));
      });
      const c2 = DD.eylem(kok, 'hesabim-var', () => DD.git('#/giris'));
      return () => { c1(); c2(); };
    }
  });
})();
