# Market Pulse — App Store Yol Haritası

App Store (iOS) ve Play Store (Android) yayını için yapılması gerekenler. Apple'ın **finansal uygulamalar için yatırım tavsiyesi/veri doğruluğu** standartları sıkıdır — bu nedenle "veri kaynağı + risk uyarısı" katmanlarını ihmal etmeyin.

## 1) Teknik altyapı — şart (P0)

### 1.1 Backend prod ortamı
- [ ] **Redis** (Upstash veya Railway) bağla — `queueService.js` bugün in-memory fallback'te. Bull job kuyruğu prod'da Redis ister.
- [ ] **Supabase / Postgres** bağla — `dbService.js` in-memory storage'a düşüyor (`Missing or invalid credentials`). `.env`'de `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set edilmeli.
- [ ] **Backend deploy** (Railway/Render/Fly.io) — şu an yalnız local. `server.js` 3001 portunda. Prod URL'si `vite.config.ts` proxy'sine ve `marketDataService.ts`'e bağlanmalı.
- [ ] **AI servisi prod key** — `aiService.js`'in kullandığı sağlayıcı (Anthropic/OpenAI) için prod API key, rate limit, cost monitoring.
- [ ] **CORS whitelist** — şu an `cors()` her şeye açık. Prod'da sadece app domain'i + Capacitor `capacitor://localhost` ve `https://localhost`.

### 1.2 Veri kaynakları (en kritik)
- [ ] **Yahoo Finance ToS** — `yahoo-finance2` resmi olmayan scrape paketi. Ticari kullanım için risk. Alternatif: Polygon.io, Twelve Data, Alpha Vantage, Finnhub (ücretli ama lisanslı).
- [ ] **Reddit API key** — `redditScraper.js` anonim JSON endpoint'lerini vuruyor; rate-limit ve CAPTCHA riski. Resmi OAuth (`/api/v1/access_token`) kurulmalı.
- [ ] **TradingView/Investing.com** — bu ikisinin scrape'i ToS ihlali; AppStore reviewer fark ederse reddedilir. **Kaldırılması veya lisanslı kaynakla değiştirilmesi şart.**
- [ ] **Cache TTL ayarı** — şu an 7200s (2h). Prod'da timeframe'e göre kademelendir (`1H` 60s, `1D` 300s, `1Y` 3600s).

### 1.3 Hata raporlama & analytics
- [ ] Sentry (frontend + backend) entegrasyonu
- [ ] PostHog/Mixpanel (kullanıcı davranışı, retention)
- [ ] Backend uptime monitor (Better Stack, Uptime Kuma)

## 2) Kimlik doğrulama (P0)

`OnboardingScreen.tsx`'teki "Continue with Google" şu an sadece `setIsLoggedIn(true)` yapıyor — gerçek auth yok.

- [ ] **Sign in with Apple** (iOS şart — App Store kuralı: 3. parti login varsa Apple da olmalı)
- [ ] **Google Sign-In** (gerçek OAuth, Capacitor Google Auth plugin)
- [ ] **Email/şifre** (opsiyonel) + email doğrulama
- [ ] Supabase Auth veya Clerk/Auth0 entegrasyonu
- [ ] Logout, hesap silme (Apple kuralı: hesap açabilen uygulama silmeyi de sunmak zorunda)
- [ ] JWT ile backend protect — şu an `/api/market/insights` herkese açık

## 3) Ödeme — Pro abonelik (P0)

`useAppStore.ts`'te `isProUnlocked`, `aiPulseCredits` var ama gerçek satın alma yok.

- [ ] **App Store Connect**'te Auto-Renewable Subscription tanımla (aylık + yıllık)
- [ ] **RevenueCat** entegre et (Capacitor plugin, hem iOS hem Android tek API)
- [ ] Server-side receipt validation (RevenueCat webhook → Supabase `subscriptions` tablosu)
- [ ] Restore purchases akışı
- [ ] Apple paywall metni: "auto-renewing", "cancel in Settings", fiyat + period açık
- [ ] Aile paylaşımı / promo code desteği
- [ ] Refund / iptal handling

## 4) iOS native build (P0)

- [ ] `npm run build && npx cap sync ios` — `dist/` ile iOS senkron
- [ ] Xcode'da: Bundle ID, Team, Provisioning Profile, Capabilities (Push, Sign in with Apple, IAP)
- [ ] **App icon** (1024×1024 + tüm boyutlar) — `ios/App/App/Assets.xcassets/AppIcon.appiconset`
- [ ] **Launch Screen** (storyboard ya da statik)
- [ ] **Info.plist**: `NSAppTransportSecurity`, kamera/foto permission strings (profile picture upload var)
- [ ] **Push notification** sertifikası (APNs) — fiyat alarmı vb. eklenecekse
- [ ] Versiyon + build numarası şeması (semver)
- [ ] TestFlight beta dağıtımı (en az 1 hafta beta)

## 5) Tasarım & UX cilası

### Onboarding
- [ ] **Yatırım tavsiyesi DEĞİLDİR** disclaimer onboarding sırasında onaylatılmalı
- [ ] Veri kaynaklarını şeffaf göster ("Yahoo Finance, Reddit, AI synthesis")
- [ ] Push notification permission akışı (gerekiyorsa)

### Boş durumlar
- [ ] Veri yüklenemediğinde "yeniden dene" butonu (toast yetmez)
- [ ] Cluster/yorum 0 olduğunda gerçekçi placeholder (şu an çözüldü ama text iyileştirilebilir)

### Erişilebilirlik
- [ ] VoiceOver etiketleri (semantic HTML kontrolü)
- [ ] Dynamic Type (font scaling)
- [ ] WCAG AA kontrast — bazı `text-white/35` çok düşük

### Performans
- [ ] Bundle analiz (`vite-bundle-visualizer`) — şu an Suspense lazy var, iyi
- [ ] Image optimization (`/images/*.jpg` boyutları)
- [ ] Skeleton/shimmer loading (chart yüklenirken siyah ekran var)

## 6) İçerik & yasal (P0 — App Store reddi sebebi)

- [ ] **Privacy Policy URL** (zorunlu) — Termly/iubenda ile oluştur
- [ ] **Terms of Service URL**
- [ ] **App Store Privacy "nutrition label"** — hangi veri toplanıyor
- [ ] **Risk uyarısı**: "Yatırım tavsiyesi değildir, kayıp riski yüksektir" (her grafikte ya da settings'te)
- [ ] **Veri kaynağı atıfları** (Yahoo Finance, Reddit logo + link)
- [ ] **GDPR + KVKK**: çerez/analytics consent, veri silme talepleri
- [ ] **Çocuk koruması**: 4+ değil, **17+** rating öner (finansal içerik)
- [ ] Lisans/credits ekranı (3rd party kütüphaneler)

## 7) Lokalizasyon

`TRANSLATIONS` dosyası var, English + Turkish destekli. App Store metadata için:

- [ ] App Store description (TR + EN, 4000 karakter limit)
- [ ] Keywords (100 karakter, virgülle ayrılmış)
- [ ] Subtitle (30 karakter, accent search'te kritik)
- [ ] Promo text (170 karakter, sürüm güncellemeden değiştirilebilir)
- [ ] Screenshot caption'ları çevirisi
- [ ] App preview video (opsiyonel ama dönüşüm artırır)

## 8) App Store görselleri (P0)

iOS için zorunlu set:

- [ ] iPhone 6.9" (iPhone 16 Pro Max) — 1320×2868, 3 adet min
- [ ] iPhone 6.5" (iPhone 11 Pro Max) — 1284×2778
- [ ] iPad 13" (M4) — 2064×2752
- [ ] App Icon — 1024×1024, transparan değil, köşesiz

Her ekran için: gerçek veriyle screenshot + üstüne kısa pazarlama metni (Figma template'i ile hızlı yap).

## 9) App Store Review hazırlığı

Reddi azaltmak için:

- [ ] **Demo hesap** ver (Pro açık) — review notes alanına email + şifre
- [ ] **Test verisi**: review sırasında scraper boş dönerse fallback nasıl çalışıyor anlat
- [ ] **In-app purchase test** — sandbox tester hesabı kur
- [ ] **Reviewer notes**: Türkçe arayüz olduğunu, demo hesabı, paywall'un ne yaptığını yaz
- [ ] **Çerçeve**: ekranda "Bu yatırım tavsiyesi değildir" en az bir yerde göstermeli

### Sık reddi sebepleri (önceden kontrol et)
- Guideline 2.1 — bug/crash → Sentry + TestFlight beta
- Guideline 2.3.1 — yanıltıcı pazarlama (örn. "100% accurate predictions")
- Guideline 3.1.1 — IAP olmayan ödeme yönlendirmesi (web'e link YOK)
- Guideline 4.0 — minimum işlevsellik (sadece "API wrapper" görünüyorsa reddedilir, AI/insight katmanı bunu güçlendiriyor)
- Guideline 5.1.1 — gereksiz veri toplama
- Guideline 5.1.5 — konum/data kullanım amacı net değil

## 10) CI/CD

- [ ] GitHub Actions: `lint + typecheck + test + build`
- [ ] Otomatik TestFlight upload (Fastlane)
- [ ] EAS / Capacitor cloud build (Mac olmadan)
- [ ] Versiyon bump otomasyonu (`semantic-release`)

## 11) Test kapsamı

- [ ] Unit test eksiklerini kapat (`commentBindingService.test.ts` var, scrapers yok)
- [ ] E2E test (Playwright zaten kurulu, smoke flow yaz)
- [ ] Backend integration test (queue + cache + DB)
- [ ] Real device test (en az iPhone 12, 14 Pro, 16 Pro Max)

## 12) Sıralı yol haritası — 4 hafta

| Hafta | Hedef |
|-------|-------|
| **1** | Backend prod (Redis + Supabase + deploy), gerçek auth (Sign in with Apple + Google), TradingView/Investing scraper'larını lisanslı API ile değiştir |
| **2** | RevenueCat + Pro IAP, App Store Connect setup, Bundle ID + sertifikalar, ikon + launch screen |
| **3** | Privacy Policy + ToS, App Store metadata + screenshot'lar, yasal disclaimer'lar, hesap silme akışı, Sentry |
| **4** | TestFlight beta (5-10 kişi), bug fix, App Store submission + review notes |

**Tahmini gönderme: 4 hafta sonu, kabul: +1-2 hafta.**

## 13) Maliyet (yıllık)

- Apple Developer Program: $99
- Google Play: $25 (tek seferlik)
- RevenueCat: $0 (≤$2.5k MTR), sonra %1
- Supabase Pro: $25/ay
- Redis (Upstash free → Pay-as-you-go ~$10/ay)
- Backend hosting (Railway/Render): $7-20/ay
- Sentry: $0 (free tier 5k event)
- Veri sağlayıcı (Polygon Starter): $29/ay
- Domain + SSL: ~$15/yıl

**Toplam: ~$1,000-1,200/yıl** (kullanıcı sayısına göre artar)

---

**En kritik 3 madde**: (1) lisanslı veri kaynağı, (2) gerçek auth + IAP, (3) privacy/ToS + risk disclaimer. Bunlar eksikse review reddi neredeyse kesin.
