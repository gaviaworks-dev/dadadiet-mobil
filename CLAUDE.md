# Dada Diet mobil prototipi — proje kuralları

## Test (Beyar, 12 Kasım 2026 — prototip kapsamı)
- Bu bir tasarım prototipi: uçtan uca test, test matrisi ve gerileme turu YOK. Kontrol tek seferlik ve yalnız görsel: düzeltilen ekranın 390 ekran görüntüsüne bakılır.
- Güvenlik (kilit atlama), rota ve dil işleri Flutter aşamasında test edilir (`tasks/handoff.md` listesi).
- Bağımsız doğrulayıcı yalnız Beyar isterse koşar; koşarsa raporu `tasks/<paket>/dogrulama-*.md`'ye yazar.
- Test betikleri takılmamalı: zaman aşımı, süre sınırı, diyaloglar otomatik kapatılır; betikler scratchpad'de.

## Diğer kurallar
Ajan kuralları: `tasks/durum-denetimi/AJAN-KURALLARI.md`, `tasks/entegrasyon/AJAN-EK.md`. Güncel durum: `tasks/handoff.md` (▶ ŞU AN). Dersler: `tasks/lessons.md`.

## Ağır işlerin düzeni (kalıcı, Beyar 11 Kasım 2026)
- Biten/sahipsiz arka plan süreçleri kapatılır; tek önizleme sunucusu http://localhost:8763, yeni sunucu açılmaz.
- Playwright/ekran görüntüsü turları tek kuyruktan koşar: `bash tasks/araclar/sira.sh <etiket> <komut...>`; aynı anda iki tur yok.
- Turlar yalnız değişen ekranları gezer; tam tur yalnız final kontrolde bir kez.
- Yeni işte önce bir örnek bitip doğrulayıcıdan geçer, sonra kombinasyonlara çoğaltılır.

## Gastro'dan kalıp alma
- Gastro'dan yalnız yapı alınır; renk, font ve marka öğeleri Diet belirteçlerinden (`kanon/dd-tokens.css`) gelir. Gastro renk değeri ya da değişken adı Diet'te kullanılmaz.
