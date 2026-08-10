# Quiz Football — European Night

Tarayıcıda çalışan, 2–4 kişilik gerçek zamanlı futbolcu bağlantı oyunu.

## Oyun kuralı

- Ekranda iki kulüp görünür.
- Altı futbolcu seçeneğinden **iki kulüpte de oynamış olan futbolcu** bulunur.
- Her oyuncunun kart başına **tek seçim hakkı** vardır.
- **İlk doğru cevabı host'a ulaşan oyuncu 1 puan alır.**
- Doğru cevap gelir gelmez kart kısa bir sonuç gösteriminin ardından otomatik değişir.
- Herkes yanlış seçim yaparsa doğru cevap gösterilir ve otomatik yeni karta geçilir.
- Süre sayacı ve “sonraki kart” butonu yoktur.
- Deste karıştırılır; aynı kart bir oyun içinde ikinci kez kullanılmaz.
- 25 / 50 / 100 kartlık oyun seçilebilir.

## Çok oyunculu yapı

Oyun, PeerJS/WebRTC ile eşler arası çalışır. İlk oyuncu oda kurucusudur ve oyun durumunun otoritesidir. Oda kodunu arkadaşlarına gönderir; diğer oyuncular bu koda bağlanır.

Bu sürüm küçük arkadaş grupları (2–4 kişi) için tasarlanmıştır. PeerJS ücretsiz bulut sinyal sunucusunu kullanır; bazı ağ/NAT türlerinde WebRTC bağlantısı kurulamayabilir.

## Görseller

Takım armaları ve futbolcu görselleri çalışma anında İngilizce Wikipedia / Wikimedia PageImages API üzerinden alınır ve tarayıcı `localStorage` önbelleğinde URL olarak saklanır. Repoda base64 görsel tutulmaz.

Görseller Wikimedia/Wikipedia sayfalarından gelir ve her görselin kendi lisans/telif koşulları olabilir. Bu proje görsellerin sahipliğini iddia etmez.

## Müzik

Telifli bir turnuva marşı veya ses kaydı eklenmemiştir. Oyunun son bölümünde WebAudio API ile tarayıcı içinde üretilen özgün bir “stadium final” akor atmosferi çalar. Harici ses dosyası ve base64 ses kullanılmaz.

## GitHub Pages

Bu repo statik olduğu için GitHub Pages ile doğrudan yayınlanabilir:

1. Repository → **Settings**
2. **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`
5. Folder: `/(root)`
6. Save

Yayın adresi: `https://rahokul55.github.io/quizfootball/`

## Dosyalar

- `index.html` — ekranlar ve uygulama kabuğu
- `styles.css` — responsive European-night tema
- `data.js` — takım, futbolcu ve 100 kart verisi
- `app.js` — PeerJS oda sistemi, oyun motoru, görseller, ses
- `sw.js` — yerel statik dosya önbelleği / PWA
- `manifest.webmanifest` — kurulabilir web uygulaması tanımı
- `icon.svg` — özgün uygulama ikonu
