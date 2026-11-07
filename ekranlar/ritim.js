/* SCR-20 Ritim (#/ritim): canlı oruç sayacı. Referans: Fastic, Zero, Yazio, Tiimo (tasks/referanslar.md Ritim, §2.4).
 * Durum: 'ritim-durum' = 'pencere'|'oruc' (Bugün okur). 'ritim-kayit' {protokol, bas (ms), capa (ms), gecmis[], son, kisitli[], planImza}.
 * Onboarding 'plan': orucProtokolu '16:8' protokol ve saatleri belirler, null (adım atlandı) DDV'ye düşer, 'yok' sayacı kapatır. Sağlık engelinde başlatma tamamen kapalıdır.
 * Plan değişince plan kazanır ('planImza'). Bugün Ritim açılmadan planı görsün diye dosya yüklenirken ve document 'dd-plan' olayında tohumla() kaydı yazar.
 * Uygulama saati sabittir (DD.simdi); sayaç gerçek saniye ilerlesin diye şimdi = sabit an + capa'dan beri geçen gerçek süre.
 * #/ritim?hal=bos ilk kullanım, #/ritim?hal=hata bağlantı hatası. 5:2 planında günlük sayaç yerine kısıtlı gün seçimi çizilir.
 */
(() => {
  const {sayi, ondalik} = DD;
  const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const GUN_MS = 864e5;
  const acilis = Date.now();
  const hal = () => new URLSearchParams(location.hash.split('?')[1] || '').get('hal');
  let hazir = false, hataGosterildi = false, bosGecildi = false, secili = null, cizilen = '', dongu = 0, sonFaz = null;

  // ---------- Kayıt ----------
  const ham = () => DD.durum.oku('ritim-kayit', null);
  const yerel = s => new Date(s.slice(0, 16)).getTime();
  const gunBasi = ms => new Date(ms).setHours(0, 0, 0, 0);
  const planHam = () => DD.durum.oku('plan', null);
  const planOku = () => { const p = planHam(), id = p?.orucProtokolu?.replace(':', '-'), x = DDV.ritim.protokoller.find(r => r.id === id); return x && !x.haftalik ? {x, ilk: p.ilkOgunSaati} : null; };
  const planImzasi = () => { const p = planHam(); return p ? `${p.orucProtokolu ?? 'atlandi'}@${p.ilkOgunSaati}` : null; };
  // Bu hassasiyetlerde oruç önerilmez (kararlar 12); başlatma da plan seçme de kapanır.
  const ORUC_ENGEL = ['gebelik', 'yeme-bozuklugu'];
  const engelli = () => !!DD.durum.oku('oruc-saglik')?.engel || (planHam()?.hassasiyetler || []).some(h => ORUC_ENGEL.includes(h));
  const orucYok = () => planHam()?.orucProtokolu === 'yok';
  const kapali = () => orucYok() && !ham()?.protokol;   // "oruç istemiyorum" seçip sonradan plan seçen kişide sayaç açılır
  // İlk öğün saati ve pencere uzunluğu şu anın hangi evrede olduğunu belirler; plan yoksa DDV'nin 12:05 penceresi.
  const evre = (x, ilkSaat) => {
    const su = DD.simdi().getTime(), ilk = gunBasi(su) + DD.saatDk(ilkSaat) * 6e4, son = ilk + x.pencereSaat * 36e5;
    if (su < ilk) return {d: 'oruc', bas: ilk - x.orucSaat * 36e5};
    return su < son ? {d: 'pencere', bas: ilk} : {d: 'oruc', bas: son};
  };
  const varsayilan = () => { const p = planOku(); return p ? evre(p.x, p.ilk) : {d: DDV.ritim.aktifDurum, bas: yerel(DDV.ritim.durumlar.pencere.baslangic)}; };
  const durumOku = () => DD.durum.oku('ritim-durum', varsayilan().d);
  // Saat her gün 17:10'a döner; bir gün sonra açan kişi önceki oturumun sayacını görmez.
  const bayatTemizle = () => {
    const k = ham();
    if (!k?.capa || Date.now() - k.capa < GUN_MS) return;
    const {bas, capa, son, ...kalan} = k;
    DD.durum.yaz('ritim-kayit', kalan);
    DD.durum.sil('ritim-durum');
  };
  // Plan değiştiyse o güne ait sayaç ve protokol bırakılır; geçmiş ve kısıtlı günler kalır. Ekran çiziminden bağımsızdır.
  const tohumla = () => {
    bayatTemizle();
    const k = ham(), imza = planImzasi(), kapanik = orucYok() || engelli();
    if ((k?.planImza ?? null) === imza && (!imza || k.bas != null || kapanik)) return;
    const {bas, son, protokol, ...kalan} = k || {};
    if (!imza) { DD.durum.yaz('ritim-kayit', {...kalan, planImza: null}); DD.durum.sil('ritim-durum'); return; }
    const v = varsayilan();
    DD.durum.yaz('ritim-kayit', {...kalan, capa: kalan.capa ?? Date.now(), planImza: imza, ...(kapanik ? {} : {protokol: planOku()?.x.id ?? DDV.ritim.aktifProtokol, bas: v.bas})});
    DD.durum.yaz('ritim-durum', kapanik ? 'pencere' : v.d);
  };
  const kayit = () => { tohumla(); return {protokol: planOku()?.x.id ?? DDV.ritim.aktifProtokol, gecmis: [], kisitli: ['Pzt', 'Per'], ...ham()}; };
  const yaz = k => DD.durum.yaz('ritim-kayit', {...k, capa: k.capa ?? acilis, planImza: planImzasi()});
  const anlik = () => ({k: ham(), d: DD.durum.oku('ritim-durum', null)});
  const geriYukle = s => { if (s.k) DD.durum.yaz('ritim-kayit', s.k); else DD.durum.sil('ritim-kayit'); if (s.d) DD.durum.yaz('ritim-durum', s.d); else DD.durum.sil('ritim-durum'); DD.tazele(); };
  const bosMu = () => (hal() === 'bos' || (DD.yeniHesap() && !DD.durum.oku('oruc-saglik')?.onay)) && !bosGecildi;
  const planBul = k => DDV.ritim.protokoller.find(p => p.id === k.protokol);
  const imza = () => JSON.stringify([hal(), durumOku(), ham(), planImzasi(), engelli(), DD.durum.oku('bugun-ogun', null), DD.durum.oku('bugun-ek', null)]);

  // ---------- Zaman ----------
  const an = k => DD.simdi().getTime() + Date.now() - (k.capa ?? acilis);
  const basMs = (k, d) => { const v = varsayilan(); return k.bas ?? (v.d === d || d !== 'oruc' ? v.bas : an(k)); };
  const gecenSn = (k, d) => Math.max(0, (an(k) - basMs(k, d)) / 1000);
  const hedefSaat = (k, d) => { const p = planBul(k); return d === 'oruc' ? p.orucSaat : p.pencereSaat; };
  const saat = ms => new Date(ms).toTimeString().slice(0, 5);
  const gunAdi = ms => ({'-1': 'Dün', 0: 'Bugün', 1: 'Yarın'}[Math.round((gunBasi(ms) - gunBasi(DD.simdi().getTime())) / GUN_MS)] ?? DD.tarihKisa(new Date(ms).toLocaleDateString('sv')));
  const zaman = ms => `${gunAdi(ms)} ${saat(ms)}`;
  const altMetin = (k, d) => {
    const kalan = Math.ceil(hedefSaat(k, d) * 60 - gecenSn(k, d) / 60);
    if (d === 'oruc') return kalan > 0 ? `Kalan ${DD.sure(kalan)}` : 'Hedefine ulaştın';
    return kalan > 0 ? `Kapanmasına ${DD.sure(kalan)}` : 'Pencere süresi doldu';
  };
  const fazBul = s => DDV.ritim.fazlar.find(f => s >= f.baslangicSaat && (f.bitisSaat == null || s < f.bitisSaat));
  const ilkCumle = m => m.replace(/^([^.]+\.)/, '**$1**');
  const baslamadanNotu = () => DDV.ritim.baslamadanNotu.replace('herkese uygun değildir', '**herkese uygun değildir**');

  // Bugün'de henüz yenmemiş planlı öğün: başlatma onayında ve pencere cümlesinde anılır.
  const planliOgun = () => {
    const d = DD.durum.oku('bugun-ogun', {}), e = DD.durum.oku('bugun-ek', {});
    return DDV.bugun.ogunler.find(o => (d[o.id]?.durum ?? o.durum) === 'planli' && !e[o.id]?.length);
  };

  // ---------- Parçalar ----------
  const diyetisyenDugme = () => DD.btn({metin: 'Diyetisyenime sor', ikon: 'mesaj', tur: 'tonal', tam: true, git: '#/uzman'});
  const kapaliGovde = engel => DD.bolumler([`<div class="dd-yigin">${engel
    ? DD.bant({baslik: 'Oruç takibi kapalı', metin: 'Paylaştığın sağlık bilgilerine göre **oruç sana önerilmiyor**. Öğün düzenini diyetisyeninle birlikte planlayabilirsin.'})
    : DD.bant({baslik: 'Oruç planı seçilmedi', metin: 'Öğünlerin **olağan düzeninde** ilerliyor. Denemek istersen bir plan seçebilirsin.', eylem: {metin: 'Plan seç', veri: {eylem: 'protokol'}}})}${diyetisyenDugme()}</div>`]);
  const planHapi = k => `<div class="dd-sira">${DD.btn({metin: `Planım ${planBul(k).ad}`, ikon: 'duzenle', tur: 'cam', boyut: 'sm', veri: {eylem: 'protokol'}})}</div>`;
  const sayac = (k, d) => (d === 'bos'
    ? DD.orucSayac({durum: 'bos', hedefSaat: planBul(k).orucSaat, altMetin: `${planBul(k).ad} planın hazır`})
    : DD.orucSayac({durum: d, gecenDk: gecenSn(k, d) / 60, hedefSaat: hedefSaat(k, d), rozet: DDV.ritim.durumlar[d].rozet, fazlar: DDV.ritim.fazlar, altMetin: altMetin(k, d), ...(d === 'oruc' ? {veri: {eylem: 'faz'}} : {git: '#/ritim/fazlar'})}));
  const bilgi = (k, d) => {
    if (d === 'bos') return `Sıradaki oruç **${planBul(k).orucSaat} saat**. Hazır olduğunda başlat; sayaç o andan itibaren işler.`;
    const bitis = basMs(k, d) + hedefSaat(k, d) * 36e5;
    if (d === 'oruc') return `İlk öğün saatin **${saat(bitis)}**. Bu sürede **su ve şekersiz içecekler** serbest.`;
    const o = planliOgun();
    return `Pencerenin kapanışı **${saat(bitis)}**.${o ? ` Planlı öğünün **${o.ad}, ${o.saat}**.` : ' Bugünkü öğünlerin tamam.'}`;
  };
  const zamanlar = (k, d) => {
    const bas = basMs(k, d), bitis = bas + hedefSaat(k, d) * 36e5;
    return DD.zamanHucreler([
      {etiket: d === 'oruc' ? 'Oruç başladı' : 'Pencere açıldı', deger: zaman(bas), id: 'bas'},
      {etiket: d === 'oruc' ? 'Hedef bitiş' : 'Pencere kapanır', deger: zaman(bitis), eylem: 'Planı değiştir', id: 'plan'}
    ]);
  };
  const gecisMetin = (k, d) => {
    if (d !== 'oruc') { const o = planliOgun(); return {baslik: 'Orucu başlat', metin: `${planBul(k).orucSaat} saatlik orucun şimdi başlar.${o ? ` ${o.ad} ${o.saat} için planlı.` : ''}`, eylem: 'Başlat', dugme: DDV.ritim.durumlar.pencere.eylem, yardim: DDV.ritim.durumlar.pencere.eylemYardim, ikon: 'oruc'}; }
    return {baslik: 'Orucu bitir', metin: 'Geçen süre haftana kaydedilir, yeme penceren açılır.', eylem: 'Bitir', dugme: DDV.ritim.durumlar.oruc.eylem, yardim: DDV.ritim.durumlar.oruc.eylemYardim, ikon: 'pencere'};
  };
  const eylemler = (k, d) => {
    const m = gecisMetin(k, d);
    return `<div class="dd-yigin-4">${DD.uzunBas({ad: 'ritim-gecis', metin: m.dugme, ikon: m.ikon, yardim: m.yardim, onayBaslik: m.baslik, onayMetin: m.metin, onayEylem: m.eylem})}${DD.btn({metin: 'Basılı tutmadan onayla', tur: 'text', tam: true, veri: {eylem: 'gecis-onay'}})}</div>`;
  };
  const bittiGovde = s => `<div class="dd-yigin">${DD.orucSayac({durum: 'bitti', gecenDk: s.sureDk, hedefSaat: s.hedefSaat, canli: false, fazlar: DDV.ritim.fazlar, altMetin: `${s.hedefSaat} saatlik oruç`})}${DD.tamamlanmaKart({baslik: `${s.hedefSaat} saati tamamladın`, alt: 'Bugün kendine iyi baktın.', bas: s.bas, bit: s.bit, eylem: {metin: 'Orucu açan öğünü ekle', ikon: 'ekle', veri: {eylem: 'acis-ogun'}}})}${DD.btn({metin: 'Pencereye dön', tur: 'text', tam: true, veri: {eylem: 'son-kapat'}})}</div>`;

  // ---------- 5:2 ----------
  const haftaIso = g => { const b = DD.simdi(), i = (b.getDay() + 6) % 7; return new Date(b.getFullYear(), b.getMonth(), b.getDate() - i + GUNLER.indexOf(g)).toLocaleDateString('sv'); };
  const haftalikGovde = k => {
    const bugun = GUNLER[(DD.simdi().getDay() + 6) % 7], kisitli = k.kisitli.includes(bugun);
    const noktalar = Object.fromEntries(k.kisitli.map(g => [haftaIso(g), ['uyari']]));
    return `<div class="dd-yigin">${DD.p(ilkCumle(planBul(k).aciklama), {ton: 'ikincil'})}<div class="dd-sira">${DD.durumRozet(kisitli ? {metin: 'Bugün kısıtlı gün', ton: 'uyari', ikon: 'takvim'} : {metin: 'Bugün olağan gün', ton: 'basari', ikon: 'onay'})}</div>${DD.kart({html: `<div class="dd-yigin-12"><span class="dd-t-card">Kısıtlı iki günün</span>${DD.cipler({ad: 'kisitli', tur: 'coklu', serit: false, etiket: 'Kısıtlı günler', ogeler: GUNLER.map(g => ({metin: g, deger: g})), secili: k.kisitli})}</div>`})}${DD.takvim({ad: 'ritim-52', gorunum: 'hafta', noktalar})}</div>`;
  };

  // ---------- Hafta ----------
  const kayitlar = k => [...DDV.ritim.sonYediGun, ...k.gecmis];
  const halkalar = l => l.reduce((h, g) => ({...h, [g.tarih]: Math.max(h[g.tarih] || 0, Math.min(g.sureSaat / g.hedefSaat, 1))}), {});
  const gunSatir = g => DD.satir({sol: DD.halkaMini({oran: Math.min(g.sureSaat / g.hedefSaat, 1), boyut: 'sm'}), baslik: `${ondalik(g.sureSaat, 1)} saat`, alt: `${g.baslangic} - ${g.bitis} · hedef ${g.hedefSaat} saat`, sag: DD.durumRozet(g.tamamlandi ? {metin: 'Hedefte', ton: 'basari', ikon: 'onay'} : {metin: 'Kısa sürdü', ton: 'notr', ikon: 'saat'}), ok: false, duz: true});
  const gunDetay = k => { const l = kayitlar(k).filter(g => g.tarih === (secili || DD.bugunIso())); return l.length ? DD.yuzey(DD.satirlar(l.map(gunSatir))) : DD.veriYok('Bu gün için **oruç kaydı** yok.'); };
  const ozet = k => {
    const l = kayitlar(k).slice(-7), tamam = l.filter(g => g.tamamlandi).length, ort = l.reduce((t, g) => t + g.sureSaat, 0) / l.length;
    let seri = 0; for (let i = l.length - 1; i >= 0 && l[i].tamamlandi; i -= 1) seri += 1;
    return `<div class="dd-yigin-12">${DD.ozet([{ikon: 'saat', etiket: 'Ortalama', deger: ondalik(ort, 1), birim: 'saat'}, {ikon: 'onay', etiket: 'Hedefte', deger: `${tamam}/${l.length}`, birim: 'oruç'}, {ikon: 'takvim', etiket: 'Üst üste', deger: String(seri), birim: 'gün'}])}${DD.p(`Son ${l.length} orucunun **${tamam} tanesi** hedef süreye ulaştı.`, {meta: true, ton: 'ikincil'})}</div>`;
  };
  const hafta = k => {
    if (bosMu()) return {baslik: 'Bu hafta', html: DD.veriYok('İlk orucunu bitirdiğinde **haftalık ritmin** burada görünür.')};
    const tak = DD.takvim({ad: 'ritim-gun', gorunum: 'hafta', secili: secili || DD.bugunIso(), odak: secili || DD.bugunIso(), halkalar: halkalar(kayitlar(k))});
    return {baslik: 'Bu hafta', html: `<div class="dd-yigin">${tak}<div data-yuva="gun">${gunDetay(k)}</div>${ozet(k)}</div>`};
  };
  const fazKart = (k, d) => {
    const f = d === 'oruc' ? fazBul(gecenSn(k, d) / 3600) : null;
    return f
      ? DD.eylemKart({ikon: f.ikon, baslik: f.ad, alt: `Tahmini aşama · ${f.aralik}`, git: '#/ritim/fazlar'})
      : DD.eylemKart({ikon: 'layer-group', baslik: 'Biyolojik fazlar', alt: 'Oruç saatlerinde tahmini aşamalar', git: '#/ritim/fazlar'});
  };

  // ---------- Sheet'ler ----------
  const fazSheet = k => {
    const f = fazBul(gecenSn(k, 'oruc') / 3600);
    DD.sheet({
      baslik: f.ad,
      html: `<div class="dd-yigin"><div class="dd-sira">${DD.durumRozet({metin: `Tahmini · ${f.aralik}`, ton: 'basari', ikon: f.ikon})}</div>${DD.p(ilkCumle(f.aciklama))}${DD.bant({metin: 'Bu aralıklar **genel bilgidir**, herkeste aynı saatte yaşanmaz.'})}</div>`,
      altBar: DD.btn({metin: 'Bütün fazlar', ikon: 'layer-group', tam: true, git: '#/ritim/fazlar', attrs: 'data-sheet-kapat'})
    });
  };
  const planNot = p => `<div class="dd-yigin-12">${DD.p(`**${p.ad}:** ${p.aciklama}`, {meta: true, ton: 'ikincil'})}${p.seviye === 'İleri' ? DD.bant({ton: 'uyari', metin: 'Bu plan **uzman desteğiyle** daha güvenli ilerler. Başlamadan diyetisyeninle konuş.', eylem: {metin: 'Diyetisyenime sor', git: '#/uzman/sohbet', attrs: 'data-sheet-kapat'}}) : ''}</div>`;
  const protokolSheet = () => {
    const k = kayit(), R = DDV.ritim;
    let sec = k.protokol;
    const ogeler = R.protokoller.map(p => ({k: p.id, ad: p.ad, alt: p.haftalik ? `Haftalık · ${p.seviye}` : p.id === 'omad' ? `Tek öğün · ${p.seviye}` : p.populer ? `${p.seviye} · Popüler` : p.seviye}));
    DD.sheet({
      baslik: 'Planını seç',
      html: `<div class="dd-yigin">${DD.secimler({ad: 'protokol', duzen: 'iki', secili: sec, ogeler})}<div data-yuva="plan-not">${planNot(planBul(k))}</div></div>`,
      altBar: DD.btn({metin: 'Planı kaydet', ikon: 'onay', tam: true, veri: {eylem: 'plan-kaydet'}}),
      sonra: d => {
        const c1 = DD.on(d, 'protokol', v => { sec = v; d.querySelector('[data-yuva="plan-not"]').innerHTML = planNot(R.protokoller.find(p => p.id === v)); });
        const c2 = DD.eylem(d, 'plan-kaydet', () => {
          d.kapat();
          const acilacak = kapali();
          if (sec === k.protokol && !acilacak) return;
          const eski = anlik(), yeni = R.protokoller.find(p => p.id === sec);
          if (yeni.haftalik && durumOku() === 'oruc') orucuKapat(kayit());
          const g = kayit(), v = acilacak && !yeni.haftalik ? evre(yeni, planHam().ilkOgunSaati) : {d: durumOku(), bas: basMs(g, durumOku())};
          yaz({...g, protokol: sec, bas: v.bas, son: yeni.haftalik ? null : g.son});
          DD.durum.yaz('ritim-durum', v.d);   // plan varsayılanı yeni protokolle evreyi değiştirmesin
          DD.tazele();
          DD.toast(`Planın artık **${yeni.ad}**`, {tur: 'basari', eylem: 'Geri al', onEylem: () => geriYukle(eski)});
        });
        return () => { c1(); c2(); };
      }
    });
  };
  const baslangicSheet = () => {
    const k = kayit(), d0 = durumOku(), bas = basMs(k, d0), simdi = an(k), oruc = d0 === 'oruc';
    let gun = gunBasi(bas) < gunBasi(simdi) ? 'dun' : 'bugun', dk = DD.saatDk(saat(bas));
    const ms = () => gunBasi(simdi) - (gun === 'dun' ? GUN_MS : 0) + dk * 6e4;
    DD.sheet({
      baslik: oruc ? 'Oruç başlangıcı' : 'Pencere başlangıcı',
      html: `<div class="dd-yigin">${oruc ? DD.segment({ad: 'bas-gun', secili: gun, ogeler: [{ad: 'Dün', deger: 'dun'}, {ad: 'Bugün', deger: 'bugun'}]}) : ''}${DD.saatKadran({ad: 'bas-saat', deger: saat(bas), pencereSaat: hedefSaat(k, d0), etiket: 'Başlangıç', adim: 5})}<div data-yuva="saat-uyari"></div></div>`,
      altBar: DD.btn({metin: 'Saati kaydet', ikon: 'onay', tam: true, veri: {eylem: 'saat-kaydet'}}),
      sonra: d => {
        const dugme = d.querySelector('[data-eylem="saat-kaydet"]');
        const denetle = () => {
          const ileri = ms() > simdi;
          dugme.disabled = ileri;
          d.querySelector('[data-yuva="saat-uyari"]').innerHTML = ileri ? DD.bant({ton: 'uyari', metin: `Başlangıç **şu andan sonra** olamaz. Şimdi saat ${saat(simdi)}.`}) : '';
        };
        const c1 = DD.on(d, 'bas-gun', v => { gun = v; denetle(); });
        const c2 = DD.on(d, 'bas-saat', (_, x) => { dk = x.dakika; denetle(); });
        const c3 = DD.eylem(d, 'saat-kaydet', () => {
          const eski = anlik();
          yaz({...k, bas: ms()});
          d.kapat(); DD.tazele();
          DD.toast(`Başlangıç **${zaman(ms())}** oldu`, {tur: 'basari', eylem: 'Geri al', onEylem: () => geriYukle(eski)});
        });
        return () => { c1(); c2(); c3(); };
      }
    });
  };

  // ---------- Başlat ve bitir ----------
  const orucuKapat = k => {
    const bas = basMs(k, 'oruc'), bit = an(k), hedef = hedefSaat(k, 'oruc') ?? DDV.ritim.durumlar.oruc.hedefSaat, sureDk = Math.round((bit - bas) / 6e4), tamam = sureDk >= hedef * 60;
    const satir = {tarih: new Date(bit).toLocaleDateString('sv'), baslangic: saat(bas), bitis: saat(bit), sureSaat: Math.round(sureDk / 6) / 10, hedefSaat: hedef, tamamlandi: tamam};
    yaz({...k, bas: bit, gecmis: sureDk ? [...k.gecmis, satir] : k.gecmis, son: tamam ? {sureDk, hedefSaat: hedef, bas: zaman(bas), bit: zaman(bit)} : null});
    DD.durum.yaz('ritim-durum', 'pencere');
    return {sureDk, tamam};
  };
  // K9: yeni hesap oruca başlamadan önce sağlık sorusunu görür; işaretlenirse başlatma kapanır (onboarding ile aynı engel).
  const saglikSheet = () => DD.sheet({
    baslik: 'Başlamadan önce', zorunlu: true,
    html: `<div class="dd-yigin-12">${DD.p('Aralıklı oruç **herkese uygun değil**. Sana uyan varsa işaretle.', {ton: 'ikincil'})}${DD.checkbox({ad: 'engel', deger: 'gebelik', etiket: 'Gebelik ya da emzirme'})}${DD.checkbox({ad: 'engel', deger: 'yeme-bozuklugu', etiket: 'Yeme bozukluğu öyküsü'})}</div>`,
    altBar: DD.btn({metin: 'Devam et', tam: true, veri: {eylem: 'saglik-devam'}}),
    sonra: h => DD.eylem(h, 'saglik-devam', () => {
      const engel = !!h.querySelector('input[name="engel"]:checked');
      DD.durum.yaz('oruc-saglik', engel ? {engel: true} : {onay: true});
      h.kapat();
      if (engel) DD.tazele(); else gecis();
    })
  });
  const gecis = () => {
    if (DD.yeniHesap() && !DD.durum.oku('oruc-saglik')) { saglikSheet(); return; }
    const k = kayit(), eski = anlik(), geriAl = {eylem: 'Geri al', onEylem: () => geriYukle(eski)};
    if (bosMu() || durumOku() !== 'oruc') {
      bosGecildi = bosMu();
      yaz({...k, bas: an(k), son: null});
      DD.durum.yaz('ritim-durum', 'oruc');
      if (hal()) DD.yerine('#/ritim'); else DD.tazele();
      DD.toast('Orucun başladı', {ikon: 'oruc', ...geriAl});
      return;
    }
    const s = orucuKapat(k);
    DD.tazele();
    if (s.tamam) DD.toast('Orucun tamamlandı', {tur: 'basari', ...geriAl});
    else DD.toast(s.sureDk ? `**${DD.sure(s.sureDk)}** kaydedildi, pencere açıldı` : 'Pencere yeniden açıldı', {ikon: 'onay', ...geriAl});
  };

  // ---------- Canlı güncelleme: sayacı çekirdek çizer; burada kalan süre, yay ve faz izlenir ----------
  const tik = kok => {
    const k = kayit(), d = durumOku(), el = kok.querySelector('[data-c="sayac"]');
    if (!el || k.son || bosMu()) return;
    const sn = gecenSn(k, d), metin = kok.querySelector('.dd-oruc-orta small'), yeni = altMetin(k, d);
    el.dataset.saniye = Math.round(sn);
    if (metin && metin.textContent !== yeni) metin.textContent = yeni;
    const oran = Math.min(sn / 3600 / hedefSaat(k, d), 1), yay = kok.querySelector('.dd-oruc-dolu'), uc = kok.querySelector('.dd-oruc-uc');
    if (yay && Math.abs(oran * 100 - +yay.dataset.uzun) >= .05) {
      yay.dataset.uzun = (oran * 100).toFixed(2);
      yay.setAttribute('stroke-dasharray', `${yay.dataset.uzun} 100`);
      uc?.style.setProperty('--a', `${(oran * 360).toFixed(1)}deg`);
    }
    const f = d === 'oruc' ? fazBul(sn / 3600)?.id : null;
    if (f !== sonFaz) { sonFaz = f; DD.tazele(); }
  };
  const durdur = () => clearInterval(dongu);
  const baslat = kok => {
    durdur();
    const k = kayit(), d = durumOku();
    sonFaz = d === 'oruc' ? fazBul(gecenSn(k, d) / 3600)?.id : null;
    dongu = setInterval(() => tik(kok), 1000);
  };

  // Bir sonraki öğün ve su hatırlatması; misafire bildirim için hesap bağlama söylenir.
  const siradakiler = () => {
    const o = DD.yeniHesap() ? null : DDV.bugun.ogunler.find(x => x.durum === 'planli'), an = DD.simdi();
    const kalan = o && (([h, m]) => h * 60 + m - an.getHours() * 60 - an.getMinutes())(o.saat.split(':').map(Number));
    const sure = n => `${n >= 60 ? `${Math.floor(n / 60)} sa ` : ''}${n % 60} dk sonra`;
    const l = [o && {ikon: 'ogun', baslik: `${o.ad} · ${o.saat.replace(':', '.')}`, alt: kalan > 0 ? sure(kalan) : 'Şimdi', git: `#/ogun/${o.id}`}, {ikon: 'su', baslik: 'Su aralığı', alt: `Saat başı · sıradaki ${DD.suSonrakiSaat()}`, git: '#/bugun'}].filter(Boolean);
    return `<div class="dd-yigin-12">${DD.yuzey(DD.satirlar(l))}${DD.uye() ? '' : DD.kanca({metin: 'Yeme penceren açıldığında bildirim almak için hesabını bağla', ikon: 'bell'})}</div>`;
  };
  const govde = () => {
    const engel = engelli();
    if (engel || (tohumla(), kapali())) {
      if (engel && durumOku() === 'oruc') DD.durum.yaz('ritim-durum', 'pencere');   // engelden önce başlamış oruç sürmesin
      return DD.gulucuk({gorsel: 'assets/gorsel/hero/ritim-sakin.webp', baslik: 'Oruç & Saatler', alt: 'Öğün düzenin', ust: true, perde: 'tam'}) + kapaliGovde(engel);
    }
    const k = kayit(), p = planBul(k), son = !bosMu() && k.son, d = bosMu() ? 'bos' : durumOku();
    const gorsel = `assets/gorsel/hero/${{oruc: 'ritim-su', pencere: 'ritim-sofra', bos: 'ritim-sakin'}[d]}.webp`;
    const hero = DD.gulucuk({gorsel, baslik: 'Oruç & Saatler', alt: p.haftalik ? 'Haftalık plan' : `${p.orucSaat} saat oruç, ${p.pencereSaat} saat pencere`, ust: true, perde: 'tam', icerik: planHapi(k)});
    if (p.haftalik) return hero + DD.bolumler([haftalikGovde(k), DD.bant({metin: baslamadanNotu()})]);
    const ust = son
      ? bittiGovde(son)
      : `<div class="dd-yigin">${sayac(k, d)}${eylemler(k, d)}${DD.bilgi({metin: bilgi(k, d)})}${d === 'bos' ? '' : zamanlar(k, d)}</div>`;
    return hero + DD.bolumler([
      ust,
      {baslik: 'Sıradakiler', html: siradakiler()},
      hafta(k),
      {baslik: 'Oruçta neler olur?', html: `<div class="dd-yigin">${fazKart(k, d)}${DD.bant({metin: baslamadanNotu()})}</div>`}
    ]);
  };

  tohumla();
  document.addEventListener('dd-plan', tohumla);

  DD.ekran('ritim', {
    tur: 'sekme',
    nav: 'ritim',
    baslik: 'Oruç & Saatler',
    ustBar: () => ({saydam: hazir}),
    yukle: () => {
      if (hal() === 'hata' && !hataGosterildi) { hataGosterildi = true; return Promise.reject(new Error('baglanti')); }
      return new Promise(tamam => setTimeout(() => { hazir = true; tamam(); }, DD.azHareket() ? 0 : DD.TK.motion.reveal));
    },
    ciz: govde,
    cekYenile: () => new Promise(tamam => setTimeout(tamam, DD.TK.motion.reveal)),
    sonra: kok => {
      cizilen = imza();
      baslat(kok);
      const onay = e => { if (e.detail?.ad === 'ritim-gecis') gecis(); };
      kok.addEventListener('dd-onay', onay);
      const baglar = [
        DD.eylem(kok, 'protokol', protokolSheet),
        DD.eylem(kok, 'faz', () => fazSheet(kayit())),
        DD.eylem(kok, 'zaman-duzenle', el => (el.dataset.id === 'plan' ? protokolSheet() : baslangicSheet())),
        DD.eylem(kok, 'gecis-onay', () => { const m = gecisMetin(kayit(), bosMu() ? 'bos' : durumOku()); DD.dialog({baslik: m.baslik, metin: m.metin, eylem: m.eylem}).then(v => { if (v) gecis(); }); }),
        DD.eylem(kok, 'son-kapat', () => { const k = kayit(); yaz({...k, son: null}); DD.tazele(); }),
        DD.eylem(kok, 'acis-ogun', () => { const k = kayit(); yaz({...k, son: null}); DD.tazele(); DD.git(`#/besin-ara?ogun=${planliOgun()?.id || 'ara'}`); }),
        DD.on(kok, 'ritim-gun', iso => { secili = iso; const y = kok.querySelector('[data-yuva="gun"]'); if (y) y.innerHTML = gunDetay(kayit()); }),
        DD.on(kok, 'kisitli', l => {
          const k = kayit();
          if (l.length !== 2) { if (l.length > 2) DD.toast('**İki gün** seçebilirsin'); else DD.toast('Haftada **iki gün** seç'); DD.tazele(); return; }
          yaz({...k, kisitli: GUNLER.filter(g => l.includes(g))}); DD.tazele();
        })
      ];
      return () => { durdur(); kok.removeEventListener('dd-onay', onay); baglar.forEach(c => c()); };
    },
    gizlen: durdur,
    donus: kok => {
      if (imza() !== cizilen) { DD.tazele(); return; }
      const el = kok.querySelector('[data-c="sayac"]');   // gizliyken çizilmedi; dönüşte eski saniye görünmesin
      if (el) el.innerHTML = DD.sayacHtml(gecenSn(kayit(), durumOku()));
      baslat(kok);
    }
  });
})();
