/* Veri izinlerim (#/veri-izinleri): web hesabim/veri-izinlerim + uye-veri-izinlerim.js eşi. Açık rıza (K10, metin taslak), diyetisyenle paylaşım (veri türü bazında), bekleyen izin istekleri, izin ve erişim geçmişi, haklar.
 * Durum: veri-izinleri {riza, esitle} (profil ve kanon rizaSheet ile ortak; esitle korunur), saglik-paylasim {olcum, tahlil, analiz, tabaklar, gunluk, test} (ekranlar/saglik.js ile aynı anahtar; ilk dördü varsayılan açık, gunluk ve test kapalı),
 *   hesap-ayar.izin {hareket:[{tarih, metin, ikon}] yeniden eskiye, cevap:{tur:'onay'|'red'}, sure:{tur:metin}}. Seed: DDV.hesap.izinIstekleri, izinGecmisi, paylasimTurleri.
 * Diyetisyeni olmayan (yeni hesap) üyede paylaşım yerine boş hal. ?gecmis=erisim erişim kaydına iner, ?hal=hata bağlantı hatası. */
(() => {
  const H = () => DDV.hesap;
  const tum = () => DD.durum.oku('hesap-ayar', {});
  const izinAyar = () => ({...H().varsayilan.izin, ...(tum().izin || {})});
  const izinYaz = ek => DD.durum.yaz('hesap-ayar', {...tum(), izin: {...izinAyar(), ...ek}});
  const izinler = () => DD.durum.oku('veri-izinleri', {riza: DD.durum.oku('onboarding')?.kvkk !== 'sonra'});
  const TUR = () => H().paylasimTurleri;
  const paylasim = () => ({...Object.fromEntries(TUR().map(t => [t.id, t.varsayilan])), ...DD.durum.oku('saglik-paylasim', {})});
  const uzman = () => (DD.yeniHesap() ? null : DDV.diyetisyenler.find(d => d.slug === DDV.kullanici.diyetisyen));
  const hareketler = () => [...izinAyar().hareket, ...(DD.yeniHesap() ? [] : H().izinGecmisi)];
  const istekler = () => (uzman() ? H().izinIstekleri.filter(i => !izinAyar().cevap[i.tur] && !paylasim()[i.tur]) : []);
  const R = () => DDV.onboarding.adimlar.find(a => a.id === 'kvkk').acikRiza;
  const kaydet = (metin, ikon) => izinYaz({hareket: [{tarih: DD.bugunIso(), metin, ikon}, ...izinAyar().hareket]});
  const turDegis = (id, v, sure) => {
    const t = TUR().find(x => x.id === id), s = {...izinAyar().sure};
    if (v && sure) s[id] = sure; else if (!v) delete s[id];
    DD.durum.yaz('saglik-paylasim', {...paylasim(), [id]: v});
    izinYaz({sure: s});
    kaydet(`${t.etiket} ${v ? 'paylaşıma açıldı' : 'paylaşımı kapatıldı'}`, t.ikon);
  };
  const gunEkle = n => { const d = DD.simdi(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  // ---------- Bölümler ----------
  const rizaBolum = () => {
    const i = izinler(), r = R(), ilk = hareketler().find(h => /rıza/.test(h.metin));
    return `<div class="dd-yigin">${DD.durumRozet({metin: 'Taslak metin · Hukuk onayı bekliyor', ton: 'uyari', ikon: 'clock'})}${DD.p('Sağlık verilerin **özel nitelikli kişisel veridir**; Dada Diet bunları yalnız açık rızanla işler. Diyetisyenle paylaşım ayrı bir izindir.', {ton: 'ikincil'})}${DD.yuzey(`<div class="dd-satirlar">${DD.toggle({ad: 'riza', ikon: 'shield-halved', etiket: 'Sağlık verisi açık rızası', alt: i.riza ? (ilk ? `Verildi · ${DD.tarihUzun(ilk.tarih)}` : 'Verildi') : 'Verilmedi · veriler yalnız bu cihazda', secili: !!i.riza})}</div>`)}${DD.maddeler([['weight-scale', 'Boy, kilo ve ölçümlerin', 'Kalori ve öğün planı için'], ['heart-pulse', 'Hassasiyet ve kronik durumun', 'Önerileri süzmek için'], ['camera', 'Su, duygu, öğün ve tabak fotoğrafların', 'Günlüğün ve Sağlık dosyan için']])}${DD.akordiyon([{baslik: 'Rıza metni', ikon: 'file-lines', icerik: `<div class="dd-yigin-12">${DD.p(r.metin.replace('açık rıza veriyorum', '**açık rıza veriyorum**'))}${DD.p(r.detay.replace('dilediğin an geri alabilirsin', '**dilediğin an geri alabilirsin**'), {ton: 'ikincil', meta: true})}</div>`}], {acik: -1})}</div>`;
  };
  const istekBolum = () => {
    const u = uzman(), l = istekler();
    return `<div class="dd-yigin-12">${DD.p('Karar senin; onaylamazsan diyetisyenin **bu veriyi göremez**.', {ton: 'ikincil'})}${l.map(i => { const t = TUR().find(x => x.id === i.tur); return DD.kart({html: `<div class="dd-yigin-12">${DD.satir({avatar: {harf: u.harf, boyut: 40}, baslik: t.etiket, alt: `${u.kisaAd || u.ad} · ${DD.tarihUzun(i.tarih)}`})}${DD.p(`${i.not} Onaylarsan **${t.alt.toLocaleLowerCase('tr')}** paylaşılır.`, {meta: true})}<div class="dd-ikili">${DD.btn({metin: 'Reddet', tur: 'secondary', veri: {eylem: 'istek-red', id: i.tur}})}${DD.btn({metin: 'Onayla', ikon: 'onay', veri: {eylem: 'istek-onay', id: i.tur}})}</div></div>`}); }).join('')}</div>`;
  };
  const paylasimBolum = () => {
    const u = uzman();
    if (!u) return DD.bos({ikon: 'user-doctor', baslik: 'Henüz diyetisyenin yok', metin: 'Bir diyetisyenle çalışmaya başladığında **neyi paylaşacağını** buradan seçersin.', eylem: {metin: 'Diyetisyen bul', ikon: 'magnifying-glass', git: '#/uzman/bul'}});
    const p = paylasim(), s = izinAyar().sure, acik = TUR().filter(t => p[t.id]).length;
    return `<div class="dd-yigin-12">${DD.p(`Seçtiğin veri türlerini **${u.ad}** görebilir. Değişiklik anında kaydedilir ve diyetisyen paneline yansır.`, {ton: 'ikincil'})}${DD.yuzey(`<div class="dd-satirlar">${DD.toggle({ad: 'paylas-genel', ikon: 'user-doctor', etiket: 'Diyetisyenimle paylaş', alt: acik ? `${acik} veri türü açık` : 'Bütün erişimler kapalı', secili: acik > 0})}${TUR().map(t => DD.toggle({ad: `paylas-${t.id}`, ikon: t.ikon, etiket: t.etiket, alt: p[t.id] && s[t.id] ? `Açık · ${s[t.id]}` : t.alt, secili: p[t.id]})).join('')}</div>`)}${acik < TUR().length ? DD.btn({metin: 'Süreli izin ver', ikon: 'calendar-plus', tur: 'secondary', tam: true, veri: {eylem: 'yeni-izin'}}) : ''}${acik ? DD.btn({metin: 'Bütün izinleri geri çek', ikon: 'ban', tur: 'text', tam: true, veri: {eylem: 'hepsini-cek'}}) : ''}</div>`;
  };
  const gecmisBolum = ctx => {
    const sec = ctx.gecmis ||= ctx.sorgu.gecmis === 'erisim' ? 'erisim' : 'hareket', u = uzman();
    const l = sec === 'hareket'
      ? hareketler().map(h => ({ikon: h.ikon || 'shield-halved', baslik: h.metin, alt: DD.tarihUzun(h.tarih)}))
      : u ? DDV.saglik.diyetisyenNotlari.map(n => ({avatar: {harf: u.harf, boyut: 40}, baslik: u.kisaAd || u.ad, alt: `${n.tarihMetin} · ölçüm ve tahlil kayıtların · görüntüleme`})) : [];
    return `<div class="dd-yigin-12">${DD.segment({ad: 'gecmis', etiket: 'Geçmiş', secili: sec, ogeler: [{ad: 'İzin hareketlerin', deger: 'hareket'}, {ad: 'Erişim kaydı', deger: 'erisim'}]})}${l.length ? DD.yuzey(DD.satirlar(l)) : DD.veriYok(sec === 'hareket' ? 'Henüz **izin hareketin** yok.' : 'Henüz **erişim kaydı** yok.')}</div>`;
  };
  const haklarBolum = () => `<div class="dd-yigin-12">${DD.yuzey(DD.satirlar([
    {ikon: 'download', baslik: 'Verilerimi indir', alt: 'Erişim kaydın dahil tek arşivde', git: '#/ayarlar/veri'},
    {ikon: 'trash', baslik: 'Verilerimin silinmesini iste', alt: 'Kimliğin doğrulandıktan sonra işlenir', git: '#/ayarlar/hesap'},
    {ikon: 'arrows-rotate', baslik: 'Bağlı uygulamalar', alt: 'Apple Health, Dada Gastro ve Dada Fit', git: '#/ayarlar/bagli'}
  ]))}${DD.gizlilikBant(DDV.saglik.bilgiNotu.replace('yalnız sen ve izin verdiğin diyetisyen', '**yalnız sen ve izin verdiğin diyetisyen**'))}</div>`;

  const govde = ctx => DD.bolumler([
    {baslik: 'Açık rıza', html: rizaBolum()},
    istekler().length && {baslik: 'Bekleyen istekler', html: istekBolum()},
    {baslik: 'Diyetisyenle paylaşım', html: paylasimBolum()},
    {id: 'gecmis', baslik: 'Geçmiş', html: gecmisBolum(ctx)},
    {baslik: 'Hakların', html: haklarBolum()}
  ]);

  // ---------- Sheet ----------
  const yeniIzinSheet = () => {
    const kapali = TUR().filter(t => !paylasim()[t.id]);
    let sure = 'surekli';
    DD.sheet({
      baslik: 'Süreli izin ver',
      html: `<div class="dd-yigin">${DD.p(`**${uzman().ad}** seçtiğin verileri seçtiğin süre boyunca görür; istediğin an geri çekebilirsin.`, {ton: 'ikincil'})}<div class="dd-yigin-8">${kapali.map(t => DD.checkbox({ad: `yeni-${t.id}`, etiket: t.etiket, alt: t.alt})).join('')}</div><div class="dd-yigin-12"><span class="dd-t-card">İzin süresi</span>${DD.cipler({ad: 'izin-sure', tur: 'tek', serit: false, secili: sure, ogeler: H().izinSureleri.map(([deger, metin]) => ({deger, metin}))})}</div><div data-yuva="hata"></div></div>`,
      altBar: DD.btn({metin: 'İzni ver', ikon: 'onay', tam: true, veri: {eylem: 'izin-ver'}}),
      sonra: d => {
        const c = [
          DD.on(d, 'izin-sure', v => { sure = v; }),
          DD.eylem(d, 'izin-ver', () => {
            const l = kapali.filter(t => d.querySelector(`[name="yeni-${t.id}"]`)?.checked);
            if (!l.length) { d.querySelector('[data-yuva="hata"]').innerHTML = DD.veriYok('En az **bir veri türü** seç.'); return; }
            const [, ad, gun] = H().izinSureleri.find(x => x[0] === sure), metin = gun ? `${DD.tarihUzun(gunEkle(gun))} tarihine kadar` : 'geri çekene kadar';
            l.forEach(t => turDegis(t.id, true, metin));
            d.kapat(); DD.tazele();
            DD.toast(l.length === 1 ? `**${l[0].etiket}** için ${ad.toLocaleLowerCase('tr')} izin verildi` : `**${l.length} veri türü** için izin verildi`, {tur: 'basari'});
          })
        ];
        return () => c.forEach(f => f());
      }
    });
  };

  let hataGosterildi = false;
  DD.ekran('veri-izinleri', {
    tur: 'alt',
    ust: '#/profil',
    baslik: 'Veri izinlerim',
    yenile: true,
    iskelet: 'liste',
    yukle: ctx => {
      if (ctx.sorgu.hal === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(tamam, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    sonra: (kok, ctx) => {
      if (ctx.sorgu.gecmis && !ctx.indi) {
        ctx.indi = true;
        requestAnimationFrame(() => { const k = kok.querySelector('.dd-kaydir'), h = kok.querySelector('#gecmis'); if (h) k.scrollTop += h.getBoundingClientRect().top - k.getBoundingClientRect().top - kok.querySelector('.dd-header').offsetHeight; });
      }
      const c = [
        DD.on(kok, 'riza', v => {
          if (v) { DD.durum.yaz('veri-izinleri', {...izinler(), riza: true}); kaydet('Sağlık verisi açık rızası verildi', 'shield-halved'); DD.tazele(); DD.toast('**Açık rızan** kaydedildi', {tur: 'basari'}); return; }
          DD.dialog({baslik: 'Rızanı geri al', metin: 'Yeni sağlık kaydın **hesabına aktarılmaz**, hassasiyetlerin önerilerde kullanılmaz. Mevcut kayıtların sen silmedikçe saklanır.', eylem: 'Geri al', iptal: 'Vazgeç', yikici: true}).then(ok => {
            if (ok) { DD.durum.yaz('veri-izinleri', {...izinler(), riza: false}); kaydet('Sağlık verisi açık rızası geri alındı', 'shield-halved'); DD.toast('**Açık rızanı** geri aldın', {tur: 'uyari'}); }
            DD.tazele();
          });
        }),
        DD.on(kok, 'paylas-genel', v => {
          if (v) { ['olcum', 'tahlil', 'analiz', 'tabaklar'].forEach(id => { if (!paylasim()[id]) turDegis(id, true); }); DD.tazele(); DD.toast('Paylaşım **yeniden açıldı**', {tur: 'basari'}); return; }
          DD.dialog({baslik: 'Bütün izinler geri çekilsin mi?', metin: 'Diyetisyenin **hiçbir sağlık verini** göremez. İstediğin zaman yeniden açabilirsin.', eylem: 'Geri çek', iptal: 'Vazgeç', yikici: true}).then(ok => { if (ok) { TUR().forEach(t => { if (paylasim()[t.id]) turDegis(t.id, false); }); DD.toast('Bütün erişimler **durdu**', {tur: 'uyari'}); } DD.tazele(); });
        }),
        ...TUR().map(t => DD.on(kok, `paylas-${t.id}`, v => { turDegis(t.id, v); DD.tazele(); DD.toast(v ? `**${t.etiket}** paylaşılıyor` : `**${t.etiket}** paylaşımı kapatıldı`, {ikon: 'gizlilik', yerine: true}); })),
        DD.eylem(kok, 'hepsini-cek', () => DD.dialog({baslik: 'Bütün izinler geri çekilsin mi?', metin: 'Diyetisyenin **hiçbir sağlık verini** göremez. İstediğin zaman yeniden açabilirsin.', eylem: 'Geri çek', iptal: 'Vazgeç', yikici: true}).then(ok => { if (!ok) return; TUR().forEach(t => { if (paylasim()[t.id]) turDegis(t.id, false); }); DD.tazele(); DD.toast('Bütün erişimler **durdu**', {tur: 'uyari'}); })),
        DD.eylem(kok, 'yeni-izin', yeniIzinSheet),
        DD.eylem(kok, 'istek-onay', el => { const t = TUR().find(x => x.id === el.dataset.id); turDegis(t.id, true); izinYaz({cevap: {...izinAyar().cevap, [t.id]: 'onay'}}); DD.tazele(); DD.toast(`**${t.etiket}** izni verildi; diyetisyenin artık görebilir`, {tur: 'basari'}); }),
        DD.eylem(kok, 'istek-red', el => { const t = TUR().find(x => x.id === el.dataset.id); izinYaz({cevap: {...izinAyar().cevap, [t.id]: 'red'}}); kaydet(`${t.etiket} isteği reddedildi`, 'ban'); DD.tazele(); DD.toast('İzin isteği **reddedildi**', {ikon: 'ban'}); }),
        DD.on(kok, 'gecmis', v => { ctx.gecmis = v; DD.tazele(); })
      ];
      return () => c.forEach(f => f());
    }
  });
})();
