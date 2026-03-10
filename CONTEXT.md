# MarketPulse — Session Context Card
> Bu dosyayı her Claude oturumunun başında yapıştır. Tüm codebase'i yükleme.

## Stack
- React + TypeScript + Vite
- Framer Motion (animasyonlar)
- Supabase (auth + db)
- Google Gemini AI (`@google/genai`)
- Lightweight Charts (TradingView alternatifi)
- Lucide React (ikonlar)
- Tailwind CSS
- i18n: translations.ts (TR/EN)

## Dosya Haritası
```
src/
├── App.tsx                  ← ~2200 satır, tüm ekranlar burada
├── ChartComponent.tsx       ← Lightweight Charts, area series, neon renkler
├── data.ts                  ← THEME, APP_ASSETS, ASSETS (mock), COMMUNITY_POSTS
├── translations.ts          ← TR/EN UI metinleri
├── main.tsx                 ← ErrorBoundary + StrictMode
├── index.css                ← Tailwind + scrollbar stilleri
├── supabase.ts              ← Supabase client (mock fallback var)
├── useSupabaseData.ts       ← Auth hook (Google/Apple OAuth)
└── services/
    └── marketData.ts        ← Twelve Data API entegrasyonu
```

## Ekranlar (activeTab)
- `dashboard` → Ana grafik, AI analizi, haber baloncukları, consensus
- `watchlist` → Sabitlenmiş varlıklar, liste/grid görünüm
- `markets` → Stocks / Commodities / Crypto kategorileri, arama
- `community` → Yorumlar + Trending tab
- `profile` → Kullanıcı profili, ayarlar, bildirimler

## Onboarding Akışı
Splash → Login (Google/Apple/Email/Skip) → Ana uygulama

## Tema / Renkler
```
bg: #050507
accent (cyan): #00FFFF
success (neon yeşil): #39FF14
textSecondary: #5A5B6D
```

## Önemli State'ler (App.tsx)
- `selectedAssetId` → aktif varlık (BTC, AAPL, GOLD vb.)
- `timeframe` → 1H / 1D / 1W / 1M / 1Y / ALL
- `realMarketData` → Twelve Data'dan gelen gerçek veri
- `realTimePrice` / `realQuote` → anlık fiyat
- `aiAnalysis` → Gemini analiz metni
- `language` → "English" | "Turkish"
- `pinnedAssets` / `watchlistAssets` → localStorage'da tutuluyor

## API'ler
- Twelve Data: `VITE_TWELVE_DATA_API_KEY`
- Gemini: `VITE_GEMINI_API_KEY`
- Supabase: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

## Önemli Kararlar
- TradingView iframe yerine Lightweight Charts (performans)
- Veriler JSON formatında, harici widget yok
- Supabase bağlantı yoksa mock client devreye giriyor
- `// @ts-nocheck` birçok dosyada mevcut

## Şu an üzerinde çalışılan
<!-- Güncelle: -->
_______________________

## Bilinen Sorunlar
<!-- Varsa ekle: -->
_______________________

---
**KURAL:** Sadece üzerinde çalıştığın dosyayı yapıştır, bu dosya gerisini anlamak için yeterli.
