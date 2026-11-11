# Dada Diet mobil prototipi — proje kuralları

## Test standardı (kalıcı, Beyar 11 Kasım 2026)
- Her iş uçtan uca akışla **ve** uç testlerle (edge case) doğrulanır; yalnız "mutlu yol" yetmez. Uç test örnekleri: boş / ilk gün verisi, misafir ve üye, çevrimdışı, rıza yok / geri alındı, izin reddi, geri tuşu ve doğrudan adres, yarıda bırakma, art arda iki kez tıklama, çok uzun metin (EN dahil), 390 ve 430 genişlik, azaltılmış hareket, sayfa yenileme sonrası durum.
- Düzeltilen her bulgu, onu bulan **aynı doğrulayıcı** tarafından yeniden koşulmadan "bitti" sayılmaz. Yeniden koşuda bulgu tablosu KAPANDI / AÇIK / YENİ SORUN olarak işaretlenir.
- Doğrulayıcı raporu dosyaya yazılır (`tasks/<paket>/dogrulama-*.md`); hüküm "YAYINLANIR" olmadan yayın onayı istenmez.
- Test betikleri takılmamalı: her adımda zaman aşımı (`page.setDefaultTimeout(15000)`), betik başında süre sınırı, tarayıcı diyalogları otomatik kapatılır; betikler scratchpad'de ajanın kendi alt klasöründe.

## Diğer kurallar
Ajan kuralları: `tasks/durum-denetimi/AJAN-KURALLARI.md`, `tasks/entegrasyon/AJAN-EK.md`. Güncel durum: `tasks/handoff.md` (▶ ŞU AN). Dersler: `tasks/lessons.md`.

## Ağır işlerin düzeni (kalıcı, Beyar 11 Kasım 2026)
- Biten/sahipsiz arka plan süreçleri kapatılır; tek önizleme sunucusu http://localhost:8763, yeni sunucu açılmaz.
- Playwright/ekran görüntüsü turları tek kuyruktan koşar: `bash tasks/araclar/sira.sh <etiket> <komut...>`; aynı anda iki tur yok.
- Turlar yalnız değişen ekranları gezer; tam tur yalnız final kontrolde bir kez.
- Yeni işte önce bir örnek bitip doğrulayıcıdan geçer, sonra kombinasyonlara çoğaltılır.
