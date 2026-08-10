# Quiz Football — V4+ Roadmap

Bu dosya mevcut hızlı arkadaş oyununun gelecekteki geliştirme havuzudur. Öncelik sırası: kararlılık → görsel hız → eşzamanlılık → oyun çeşitliliği → sosyal özellikler.

## 1. Çekirdek oyun ve adalet
1. İlk doğru cevabı host zaman damgasıyla kilitleme.
2. Aynı turda ikinci doğru cevaba puan vermeme.
3. Herkes yanlışsa otomatik tur geçişi.
4. Bağlantısı kopan oyuncuyu o tur için pasif sayma.
5. Aynı kart ID'sini maç içinde tekrar kullanmama.
6. Aynı takım çiftini maç içinde tekrar kullanmama.
7. Aynı doğru futbolcuyu maç içinde tekrar kullanmama.
8. 4/6/8 seçenek modlarının tamamında güvenli distractor doğrulaması.
9. Maç başına farklı distractor seed'i.
10. Çift tıklama / çoklu submit kilidi.
11. Oyun başlamış odaya geç katılım kuralı.
12. Host ayrılırsa güvenli maç sonlandırma.

## 2. Görseller ve medya
13. Deploy-time gerçek takım logo manifesti.
14. Deploy-time gerçek futbolcu fotoğraf manifesti.
15. Wikimedia ilk kaynak, ikincil kaynak fallback.
16. Bozuk URL için otomatik yeniden çözümleme.
17. Takım logolarında contain + güvenli padding.
18. Portre futbolcu görsellerinde yüz odaklı object-position.
19. Yatay futbolcu görselleri için ayrı crop sınıfı.
20. Çok uzun görseller için ayrı crop sınıfı.
21. Görsel preload kuyruğu.
22. Sonraki 3-4 kartın önceden yüklenmesi.
23. Service Worker görsel cache'i.
24. Görsel eksikse premium initials placeholder.

## 3. Performans
25. Cevap gridini yalnız kart değişince yeniden çizme.
26. State güncellemelerinde sadece class/text güncelleme.
27. Aynı API isteğini promise dedup ile tekilleştirme.
28. Küçük thumbnail boyutları.
29. RequestIdleCallback ile düşük öncelikli preload.
30. Maksimum eşzamanlı preload sınırı.
31. Network-first HTML güncellemesi.
32. Versioned CSS/JS cache busting.
33. Lazy olmayan yalnız görünür kart görselleri.
34. Mobilde daha küçük görsel çözünürlüğü.
35. Reduce-motion desteği.
36. Gereksiz DOM mutation azaltma.

## 4. Oda ve multiplayer
37. Tek tık davet linki.
38. QR kod ile oda katılımı.
39. Aynı kullanıcı adını engelleme.
40. Kurucunun oyuncu çıkarabilmesi.
41. Oda maksimum oyuncu ayarı.
42. 2v2 takım modu.
43. 3v3 takım modu.
44. Seyirci modu.
45. Host migration.
46. Otomatik reconnect.
47. Ping / latency göstergesi.
48. Bağlantı kalitesi uyarısı.

## 5. Maç formatları
49. 25 kart hızlı maç.
50. 50 kart uzun maç.
51. 100 kart tam gece.
52. 4 seçenek hızlı mod.
53. 6 seçenek dengeli mod.
54. 8 seçenek zor mod.
55. Sadece efsaneler modu.
56. Sadece aktif futbolcular modu.
57. Premier League havuzu.
58. La Liga havuzu.
59. Serie A havuzu.
60. Avrupa kupaları havuzu.

## 6. Skor ve istatistik
61. Doğru cevap sayısı.
62. Yanlış cevap sayısı.
63. Doğruluk yüzdesi.
64. En iyi seri.
65. Arka arkaya tur kazanma sayısı.
66. Maç liderlik değişimi sayısı.
67. İlk puanı alan oyuncu rozeti.
68. Son kartlarda comeback rozeti.
69. Maç sonu MVP kartı.
70. Maç sonu en az yanlış yapan.
71. Maç sonu en agresif seçen.
72. Lokal maç geçmişi.

## 7. Sunum ve atmosfer
73. Oda kodundan deterministik tema.
74. Royal tema.
75. Aurora tema.
76. Midnight tema.
77. Emerald tema.
78. Maç giriş animasyonu.
79. Doğru cevap mikro animasyonu.
80. Yanlış cevap mikro animasyonu.
81. Lider değişti animasyonu.
82. Final gecesi görsel efekti.
83. Konfeti benzeri özgün final partikülleri.
84. Tam ekran maç modu.

## 8. Ses
85. Maç boyu özgün European Night müziği.
86. Yerel müzik ses seviyesi.
87. Doğru cevap ses efekti.
88. Yanlış cevap ses efekti.
89. Tur geçiş efekti.
90. Lider değişimi efekti.
91. Final müziği varyasyonu.
92. Sesleri tamamen kapatma.
93. Mobil titreşim seçeneği (desteklenen cihazlarda).
94. Düşük ses modu.
95. Yalnız efektler modu.
96. Yalnız müzik modu.

## 9. Erişilebilirlik ve cihaz desteği
97. 1-8 klavye kısayolları.
98. Büyük dokunma hedefleri.
99. Telefon portre görünümü.
100. Telefon yatay görünümü.
101. Tablet görünümü.
102. 1366x768 optimizasyonu.
103. 1080p masaüstü optimizasyonu.
104. 2K/4K geniş ekran ölçekleme.
105. Klavye focus görünürlüğü.
106. Aria-live sonuç duyurusu.
107. Yüksek kontrast modu.
108. Reduced-motion modu.

## 10. İçerik ve yönetim
109. Kart JSON şema doğrulaması.
110. GitHub Actions kart QA.
111. Görsel manifest QA raporu.
112. Eksik görsel raporu.
113. Yeni kart ekleme şablonu.
114. Kart zorluk derecesi.
115. Futbolcu popülerlik seviyesi.
116. Takım havuzu etiketleri.
117. Tarihsel kulüp adları eşleme tablosu.
118. Veri kaynağı notları.
119. Admin kart editörü için gelecek veri formatı.
120. 500+ kartlık genişleme mimarisi.

## Sonraki büyük sürümler
- **V4.2:** Görsel kararlılık, 4/6/8 seçim, maç boyu müzik, responsive düzeltmeler.
- **V4.5:** İstatistikler, reconnect, oda moderasyonu, takım modu.
- **V5:** Kategori havuzları, 500+ kart, profil/rozetler, gelişmiş maç geçmişi.
