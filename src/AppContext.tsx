// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useSupabase } from "../useSupabaseData";
import { supabase } from "../supabase";
import { fetchMarketData, fetchRealTimePrice, fetchQuote } from "../services/marketData";
import { GoogleGenAI } from "@google/genai";
import { ASSETS, MOCK_TRANSLATIONS as _MOCK_TRANSLATIONS } from "../data";
import { TRANSLATIONS } from "../translations";

// ─────────────────────────────────────────────────────────────────────────────
// MADDE 5: TÜM 26 ASSET için haber/konsensüs marker veritabanı
// importance: 1-10  |  zoom yapınca viewport'taki en yüksek 2 gösterilir
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_MARKERS = {
  BTC: [
    { idx: 8,  type: "news",      importance: 9,  sentiment: "Positive", translation: "BlackRock Bitcoin ETF onaylandı — kurumsal sermaye kapıları açıldı.", comments: [{ user: "@InstitutionalFlow", text: "ETF girişleri $2B geçti, oyunu tamamen değiştiriyor.", sentiment: "Positive", likes: 94 }, { user: "@CryptoKing", text: "Beklentileri aştı, long için ideal an.", sentiment: "Positive", likes: 47 }, { user: "@Skeptic99", text: "Hype fazla, realize dalgası gelebilir.", sentiment: "Negative", likes: 12 }] },
    { idx: 35, type: "news",      importance: 10, sentiment: "Negative", translation: "FTX çöküşü: $8B açık pozisyon tasfiye edildi — piyasa sarsıldı.", comments: [{ user: "@RegulatoryWatch", text: "Tarihsel en büyük kripto iflası.", sentiment: "Negative", likes: 112 }, { user: "@BearHunter", text: "Stop loss'larımı yukarı çektim, iyi ki.", sentiment: "Negative", likes: 34 }] },
    { idx: 55, type: "consensus", importance: 7,  sentiment: "Positive", translation: "AI Konsensus: %73 analist yükseliş bekliyor. RSI 68 — aşırı alıma yaklaşılıyor.", comments: [{ user: "@DayTrader", text: "RSI biraz daha yer var, aldım.", sentiment: "Positive", likes: 31 }, { user: "@MacroEcon", text: "Konsensus güçlü ama makro karışık.", sentiment: "Neutral", likes: 19 }] },
  ],
  ETH: [
    { idx: 12, type: "news",      importance: 9,  sentiment: "Positive", translation: "Ethereum The Merge tamamlandı — Proof-of-Stake, enerji tüketimi %99 düştü.", comments: [{ user: "@L2Maxi", text: "Devrimsel. Enerji tüketimi %99.95 düştü.", sentiment: "Positive", likes: 88 }, { user: "@MinerFee", text: "Madenciler için kötü, ağ için iyi.", sentiment: "Neutral", likes: 21 }] },
    { idx: 48, type: "news",      importance: 8,  sentiment: "Negative", translation: "SEC Ethereum'u menkul kıymet sayabilir — hukuki belirsizlik artıyor.", comments: [{ user: "@BTC_Maxi", text: "Regülasyon riski gerçek, sermaye BTC'ye geçiyor.", sentiment: "Negative", likes: 45 }, { user: "@ETH_Bull", text: "Hukuki belirsizlik geçici, teknoloji kazanır.", sentiment: "Positive", likes: 38 }] },
  ],
  SOL: [
    { idx: 15, type: "news",      importance: 10, sentiment: "Negative", translation: "Solana ağı 17 saatlik kesinti yaşadı — güvenilirlik ciddi biçimde sorgulanıyor.", comments: [{ user: "@ValidatorSOL", text: "Downtime hâlâ çözülmedi, endişe verici.", sentiment: "Negative", likes: 78 }, { user: "@SolSkeptic", text: "Bu tekrarlayan bir sorun, alt yapı zayıf.", sentiment: "Negative", likes: 45 }] },
    { idx: 50, type: "news",      importance: 8,  sentiment: "Positive", translation: "Solana Saga kullanıcı rekoru kırdı — tüketici odaklı büyüme hızlanıyor.", comments: [{ user: "@SolBull", text: "Saga kampanyası Solana'yı mainstream'e taşıdı.", sentiment: "Positive", likes: 52 }] },
  ],
  ADA: [
    { idx: 18, type: "news",      importance: 8,  sentiment: "Positive", translation: "Cardano Vasil hard fork — akıllı kontrat kapasitesi 10x arttı.", comments: [{ user: "@CardanoStaker", text: "Vasil beklentileri aştı, ekosistem büyüyor.", sentiment: "Positive", likes: 41 }] },
    { idx: 45, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: ADA DeFi TVL artıyor ama Ethereum dominansını kırması zor.", comments: [{ user: "@DeFiAnalyst", text: "Ekosistem büyüyor ama rekabet sert.", sentiment: "Neutral", likes: 19 }] },
  ],
  DOT: [
    { idx: 20, type: "news",      importance: 8,  sentiment: "Positive", translation: "Polkadot parachain açık artırması rekor katılımla tamamlandı.", comments: [{ user: "@PolkaDev", text: "Parachain ekosistemi güçlü biçimde genişliyor.", sentiment: "Positive", likes: 33 }] },
    { idx: 48, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: DOT cross-chain hacmi artıyor, fiyat tepkisi henüz sınırlı.", comments: [{ user: "@ChainAnalyst", text: "Teknoloji sağlam, fiyatlama geri kalmış.", sentiment: "Neutral", likes: 15 }] },
  ],
  LINK: [
    { idx: 22, type: "news",      importance: 9,  sentiment: "Positive", translation: "Chainlink CCIP lansmanı — çapraz zincir interoperabilite standart haline geliyor.", comments: [{ user: "@OracleBull", text: "CCIP gerçek devrim, her DeFi protokolü entegre edecek.", sentiment: "Positive", likes: 67 }] },
    { idx: 52, type: "consensus", importance: 6,  sentiment: "Positive", translation: "AI Konsensus: LINK oracle dominansı %74 — rakipsiz konumda.", comments: [{ user: "@DeFiResearch", text: "Oracle savaşını LINK kazandı.", sentiment: "Positive", likes: 29 }] },
  ],
  AVAX: [
    { idx: 16, type: "news",      importance: 8,  sentiment: "Positive", translation: "Avalanche subnet ağları Visa ile ortaklık kurdu — kurumsal blockchain geçişi başlıyor.", comments: [{ user: "@AvaxBull", text: "Kurumsal entegrasyon Avax'ı farklı kategoriye taşıyor.", sentiment: "Positive", likes: 55 }] },
    { idx: 46, type: "news",      importance: 7,  sentiment: "Negative", translation: "AVAX işlem ücretleri rakiplerle kıyasla yüksek — kullanıcı kayıpları artıyor.", comments: [{ user: "@LayerZeroFan", text: "Ücret yapısı optimize edilmeli.", sentiment: "Negative", likes: 28 }] },
  ],
  XRP: [
    { idx: 10, type: "news",      importance: 10, sentiment: "Positive", translation: "Ripple SEC davasında büyük zafer — XRP menkul kıymet değil hükmü verildi.", comments: [{ user: "@XRPArmy", text: "Bu karar kripto tarihini değiştirdi!", sentiment: "Positive", likes: 234 }, { user: "@LegalEagle", text: "Kararın kapsamı sınırlı ama emsal teşkil ediyor.", sentiment: "Neutral", likes: 67 }] },
    { idx: 50, type: "consensus", importance: 7,  sentiment: "Positive", translation: "AI Konsensus: Ripple ODL hacmi rekor kırdı — kurumsal ödeme kullanımı artıyor.", comments: [{ user: "@BankingBridge", text: "Fintech entegrasyon ivmesi güçlü.", sentiment: "Positive", likes: 44 }] },
  ],
  NASDAQ: [
    { idx: 15, type: "news",      importance: 9,  sentiment: "Negative", translation: "Fed agresif faiz artışı: 75bp — tech hisselerinde sert satış dalgası.", comments: [{ user: "@MacroTrader", text: "Değerleme baskısı arttı, büyüme hisseleri çok kırılgan.", sentiment: "Negative", likes: 89 }] },
    { idx: 48, type: "news",      importance: 9,  sentiment: "Positive", translation: "ChatGPT 100M kullanıcıya ulaştı — AI booming, tech sektörü yeni paradigmada.", comments: [{ user: "@TechBull", text: "AI süpersiklus başladı, Nasdaq lider olmaya devam eder.", sentiment: "Positive", likes: 178 }] },
  ],
  AAPL: [
    { idx: 14, type: "news",      importance: 9,  sentiment: "Positive", translation: "Apple Vision Pro lansmanı — $3,499 fiyatla spatial computing çağı başladı.", comments: [{ user: "@TechBull", text: "Spatial computing platform yükselişi bu.", sentiment: "Positive", likes: 72 }, { user: "@PriceSkeptic", text: "$3,499 kitlelere ulaşmayı engelliyor.", sentiment: "Negative", likes: 29 }] },
    { idx: 50, type: "news",      importance: 8,  sentiment: "Negative", translation: "iPhone satışları Çin'de %19 geriledi — Huawei rekabeti ciddiyet kazandı.", comments: [{ user: "@ChinaAnalyst", text: "Huawei'nin geri dönüşü Apple için ciddi tehdit.", sentiment: "Negative", likes: 43 }] },
  ],
  MSFT: [
    { idx: 20, type: "news",      importance: 10, sentiment: "Positive", translation: "Microsoft OpenAI'ye $13B yatırım yaptı — Copilot ürün ailesi genişliyor.", comments: [{ user: "@CloudBull", text: "Azure AI entegrasyonu rakiplerle arasını açıyor.", sentiment: "Positive", likes: 121 }] },
    { idx: 50, type: "consensus", importance: 7,  sentiment: "Positive", translation: "AI Konsensus: MSFT cloud büyümesi %28 — AI premium marjı net görünür.", comments: [{ user: "@SaaSAnalyst", text: "Copilot fiyatlaması yüksek ama tutunuyor.", sentiment: "Positive", likes: 55 }] },
  ],
  GOOGL: [
    { idx: 18, type: "news",      importance: 9,  sentiment: "Negative", translation: "Google Bard lansmanı başarısız: AI hatası hisseyi %9 düşürdü.", comments: [{ user: "@AIRace", text: "OpenAI'ye karşı geç kaldılar.", sentiment: "Negative", likes: 77 }] },
    { idx: 48, type: "news",      importance: 8,  sentiment: "Positive", translation: "Google Gemini Ultra GPT-4'ü geride bıraktı — AI yarışında yeniden güç.", comments: [{ user: "@AIAnalyst", text: "Gemini Ultra benchmark sonuçları etkileyici.", sentiment: "Positive", likes: 63 }] },
  ],
  AMZN: [
    { idx: 22, type: "news",      importance: 9,  sentiment: "Positive", translation: "Amazon AWS Bedrock lansmanı — kurumsal AI altyapı liderliği pekişti.", comments: [{ user: "@CloudNative", text: "Bedrock multi-model yaklaşımı stratejik deha.", sentiment: "Positive", likes: 84 }] },
    { idx: 50, type: "consensus", importance: 7,  sentiment: "Positive", translation: "AI Konsensus: AMZN eCommerce + Cloud sinerji marjı genişliyor.", comments: [{ user: "@RetailAnalyst", text: "Lojistik otomasyon maliyet avantajı kalıcı.", sentiment: "Positive", likes: 38 }] },
  ],
  META: [
    { idx: 14, type: "news",      importance: 9,  sentiment: "Negative", translation: "Meta Metaverse yatırımı $13B zarar yazdı — Reality Labs başarısız.", comments: [{ user: "@VRSkeptic", text: "Metaverse için çok erken, para çöpe gitti.", sentiment: "Negative", likes: 95 }] },
    { idx: 46, type: "news",      importance: 10, sentiment: "Positive", translation: "Meta 'Efficiency Yılı': 11K kişi çıkarıldı, marj %40 arttı.", comments: [{ user: "@CostCutter", text: "Zuckerberg disiplinini kanıtladı, hisse fırladı.", sentiment: "Positive", likes: 142 }] },
  ],
  NVDA: [
    { idx: 22, type: "news",      importance: 10, sentiment: "Positive", translation: "NVIDIA H100 GPU talebi rekor kırdı — 1 yıllık bekleme listesi oluştu.", comments: [{ user: "@AIInvestor", text: "ChatGPT etkisi doğrudan NVDA bilançosuna yansıdı.", sentiment: "Positive", likes: 134 }] },
    { idx: 52, type: "consensus", importance: 8,  sentiment: "Positive", translation: "AI Konsensus: NVDA datacenter geliri $10B/çeyrek rejimine giriyor.", comments: [{ user: "@TechAnalyst", text: "Gelir görünürlüğü çok yüksek, talep devam ediyor.", sentiment: "Positive", likes: 56 }] },
  ],
  AMD: [
    { idx: 20, type: "news",      importance: 8,  sentiment: "Positive", translation: "AMD MI300X lansmanı: H100'e direkt rakip — yapay zeka pazarına ciddi giriş.", comments: [{ user: "@ChipWar", text: "NVIDIA monopolüne ilk gerçek tehdit.", sentiment: "Positive", likes: 88 }] },
    { idx: 48, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: AMD pazar payı artıyor ama NVIDIA ekosistemi güçlü kalmaya devam ediyor.", comments: [{ user: "@SemiAnalyst", text: "Rakip fiyatlama avantajı var ama ekosistem eksik.", sentiment: "Neutral", likes: 34 }] },
  ],
  TSLA: [
    { idx: 18, type: "news",      importance: 10, sentiment: "Positive", translation: "Tesla S&P 500'e eklendi — pasif fon alımları $12B'a ulaştı.", comments: [{ user: "@IndexFund", text: "Tarihin en büyük endeks eklemesi.", sentiment: "Positive", likes: 89 }] },
    { idx: 46, type: "news",      importance: 9,  sentiment: "Negative", translation: "Elon Musk Tesla hisselerini sattı — Twitter satın alımı finanse ediliyor.", comments: [{ user: "@TeslaShort", text: "CEO hisse satışı güven zedeliyor.", sentiment: "Negative", likes: 67 }, { user: "@TeslaBull", text: "Kısa vadeli baskı, uzun vade değişmedi.", sentiment: "Positive", likes: 34 }] },
  ],
  NFLX: [
    { idx: 18, type: "news",      importance: 9,  sentiment: "Negative", translation: "Netflix 200K abone kaybetti — pandemi sonrası büyüme hikayesi sona erdi.", comments: [{ user: "@StreamWatcher", text: "Doygunluk noktasına gelindi, rekabet kızıştı.", sentiment: "Negative", likes: 76 }] },
    { idx: 46, type: "news",      importance: 8,  sentiment: "Positive", translation: "Netflix şifre paylaşım kısıtlaması işe yaradı: 13.1M yeni abone.", comments: [{ user: "@ContentBull", text: "Ücretli paylaşım paketi beklenenden çok daha iyi.", sentiment: "Positive", likes: 98 }] },
  ],
  GOLD: [
    { idx: 18, type: "news",      importance: 9,  sentiment: "Positive", translation: "Fed faiz artışları duraklatıldı — altın güvenli liman talebinde sert yükseliş.", comments: [{ user: "@GoldBug", text: "Reel faiz düşünce altın parlıyor, klasik senaryo.", sentiment: "Positive", likes: 44 }] },
    { idx: 48, type: "news",      importance: 8,  sentiment: "Positive", translation: "Merkez bankaları 1,000 ton altın aldı — 55 yılın rezerv alım rekoru.", comments: [{ user: "@CBAnalyst", text: "Dolar dışı rezerv çeşitlendirmesi hız kazandı.", sentiment: "Positive", likes: 61 }] },
  ],
  SILVER: [
    { idx: 22, type: "news",      importance: 7,  sentiment: "Positive", translation: "Güneş paneli talebi gümüş kullanımını rekor seviyeye taşıdı — yeşil geçiş etkisi.", comments: [{ user: "@GreenMetal", text: "Enerji geçişi gümüşü stratejik metal yapıyor.", sentiment: "Positive", likes: 38 }] },
    { idx: 50, type: "consensus", importance: 5,  sentiment: "Neutral",  translation: "AI Konsensus: Altın/Gümüş oranı tarihsel ortalamanın üzerinde — yakınsama beklentisi.", comments: [{ user: "@MetalTrader", text: "Gümüş nispi ucuz ama katalizör bekleniyor.", sentiment: "Neutral", likes: 22 }] },
  ],
  OIL: [
    { idx: 20, type: "news",      importance: 9,  sentiment: "Positive", translation: "OPEC+ 2M varil/gün üretim kesintisi kararı — ham petrol $20 sıçradı.", comments: [{ user: "@OilMajor", text: "OPEC disiplinini koruyor, arz kısıtlı kalacak.", sentiment: "Positive", likes: 67 }] },
    { idx: 46, type: "news",      importance: 8,  sentiment: "Negative", translation: "ABD stratejik petrol rezervinden 180M varil serbest bırakıldı — fiyat baskılandı.", comments: [{ user: "@EnergyAnalyst", text: "SPR serbest bırakımı kısa vadeli baskı yaratır.", sentiment: "Negative", likes: 43 }] },
  ],
  COPPER: [
    { idx: 24, type: "news",      importance: 8,  sentiment: "Positive", translation: "EV ve yenilenebilir enerji talebi bakır açığını 2030'a kadar 4M tona çıkarabilir.", comments: [{ user: "@CopperBull", text: "Yeşil ekonomi bakırı kritik hammadde yapıyor.", sentiment: "Positive", likes: 49 }] },
    { idx: 48, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: Çin inşaat sektörü yavaşlıyor — bakır talep öngörüsü zayıfladı.", comments: [{ user: "@ChinaMacro", text: "Evergrande krizi bakır talebini baskılıyor.", sentiment: "Negative", likes: 33 }] },
  ],
  PLATINUM: [
    { idx: 26, type: "news",      importance: 7,  sentiment: "Positive", translation: "Hidrojen yakıt hücresi teknolojisi platin talebini artırıyor — yeşil geçiş fırsatı.", comments: [{ user: "@H2Economy", text: "Platin hidrojende geri döndü, bu kalıcı.", sentiment: "Positive", likes: 31 }] },
    { idx: 52, type: "consensus", importance: 5,  sentiment: "Neutral",  translation: "AI Konsensus: Platin/Altın fiyat farkı tarihsel dipte — yakınsama senaryosu gündemde.", comments: [{ user: "@PGMTrader", text: "Değerleme cazip ama momentum yok.", sentiment: "Neutral", likes: 18 }] },
  ],
  PALLADIUM: [
    { idx: 18, type: "news",      importance: 9,  sentiment: "Negative", translation: "EV geçişi Palladium talebini düşürüyor — katalitik konvertör kullanımı azalıyor.", comments: [{ user: "@AutoAnalyst", text: "Palladium EV geçişinin en büyük kaybedeni.", sentiment: "Negative", likes: 55 }] },
    { idx: 46, type: "consensus", importance: 6,  sentiment: "Negative", translation: "AI Konsensus: Rusya arzı sürerken talep daralıyor — yapısal düşüş baskısı sürüyor.", comments: [{ user: "@CommodityMacro", text: "Fundamentals zayıf, trende karşı pozisyon riskli.", sentiment: "Negative", likes: 27 }] },
  ],
  NATGAS: [
    { idx: 20, type: "news",      importance: 9,  sentiment: "Positive", translation: "Rusya-Ukrayna krizi Avrupa doğalgaz arzını kesti — fiyat 6 yılın zirvesinde.", comments: [{ user: "@EnergyGeo", text: "Enerji güvenliği artık jeopolitik silah.", sentiment: "Negative", likes: 88 }, { user: "@LNGTrader", text: "ABD LNG ihracatı için mükemmel fırsat.", sentiment: "Positive", likes: 54 }] },
    { idx: 48, type: "news",      importance: 7,  sentiment: "Negative", translation: "Ilık kış doğalgaz stoklarını rekor seviyeye taşıdı — fiyat yüzde elli düştü.", comments: [{ user: "@WeatherTrader", text: "Sezonsal talep beklentilerin altında kaldı.", sentiment: "Negative", likes: 39 }] },
  ],
  CORN: [
    { idx: 22, type: "news",      importance: 8,  sentiment: "Positive", translation: "Ukrayna tahıl koridoru anlaşması çöktü — küresel gıda arzı tehdit altında.", comments: [{ user: "@AgriAnalyst", text: "Tahıl fiyatları jeopolitik riske çok duyarlı.", sentiment: "Positive", likes: 45 }] },
    { idx: 50, type: "consensus", importance: 5,  sentiment: "Neutral",  translation: "AI Konsensus: ABD mısır hasatı beklentilerin üzerinde — arz baskısı olabilir.", comments: [{ user: "@FarmFutures", text: "Rekor hasat olası, ama talep güçlü.", sentiment: "Neutral", likes: 21 }] },
  ],
  WHEAT: [
    { idx: 18, type: "news",      importance: 9,  sentiment: "Positive", translation: "Rusya Karadeniz tahıl koridorunu kapattı — buğday fiyatları sert yükseldi.", comments: [{ user: "@FoodSecurity", text: "Küresel gıda güvenliği için ciddi risk.", sentiment: "Negative", likes: 72 }, { user: "@GrainTrader", text: "Uzun pozisyon için ideal zemin.", sentiment: "Positive", likes: 48 }] },
    { idx: 48, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: Hindistan ihracat kısıtlamaları küresel buğday arzını daralttı.", comments: [{ user: "@AsiaGrain", text: "Hint ihracat politikası tahmin edilemez.", sentiment: "Neutral", likes: 28 }] },
  ],
};

const MOCK_TRANSLATIONS = { ..._MOCK_TRANSLATIONS, ...DEMO_MARKERS };

// ─────────────────────────────────────────────────────────────────────────────

let aiClient = null;
export const getAIClient = () => {
  try {
    const key = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.GEMINI_API_KEY || "";
    if (!key) return null;
    if (!aiClient) aiClient = new GoogleGenAI({ apiKey: key });
    return aiClient;
  } catch (e) { return null; }
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  // ── Navigation ──
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");

  // ── Splash / Onboarding ──
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // ── UI ──
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");

  // ── Language ──
  const [language, setLanguage] = useState(() => localStorage.getItem("mp_language") || "English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  // ── Chart / Data ──
  const [timeframe, setTimeframe] = useState("1D");
  const [showNewsBubbles, setShowNewsBubbles] = useState(false);
  const [showAIConsensus, setShowAIConsensus] = useState(false);
  const [realMarketData, setRealMarketData] = useState(null);
  const [realTimePrice, setRealTimePrice] = useState(null);
  const [realQuote, setRealQuote] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [detailedPoint, setDetailedPoint] = useState(null);
  const [chartCrosshair, setChartCrosshair] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState("All");

  // ── AI ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // ── Comments ──
  const [userComments, setUserComments] = useState(() => {
    try { const s = localStorage.getItem("userComments"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentChartIdx, setCommentChartIdx] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSentiment, setCommentSentiment] = useState("Neutral");
  const [showMyComments, setShowMyComments] = useState(false);
  const [commentVotes, setCommentVotes] = useState({});
  const [postVotes, setPostVotes] = useState({});
  const [hideMyCommentsBar, setHideMyCommentsBar] = useState(false);
  const longPressTimer = useRef(null);

  // ── Watchlist / Pinned ──
  const [watchlistAssets, setWatchlistAssets] = useState(() => {
    const s = localStorage.getItem("watchlistAssets");
    return s ? JSON.parse(s) : ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"];
  });
  const [pinnedAssets, setPinnedAssets] = useState(() => {
    const s = localStorage.getItem("pinnedAssets");
    return s ? JSON.parse(s) : ["BTC", "AAPL", "GOLD"];
  });
  const [isEditPinned, setIsEditPinned] = useState(false);
  const [watchlistLayout, setWatchlistLayout] = useState("list");

  // ── Community ──
  const [communityTab, setCommunityTab] = useState("community");
  const [trendingExpanded, setTrendingExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [trendingTimeframe, setTrendingTimeframe] = useState("Daily");
  const [commentsTimeframe, setCommentsTimeframe] = useState("Daily");

  // ── Profile ──
  const [profilePage, setProfilePage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(() => {
    try { return localStorage.getItem("profilePicture"); } catch { return null; }
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState("Gökalp");

  // ── Supabase ──
  const { session, user, loginGoogle, loginApple, logout } = useSupabase();

  // ── Auth sync ──
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      if (user.user_metadata?.name) setEditedUsername(user.user_metadata.name);
      else if (user.email) setEditedUsername(user.email.split("@")[0]);
    }
  }, [user]);

  // ── Persistence ──
  useEffect(() => { localStorage.setItem("watchlistAssets", JSON.stringify(watchlistAssets)); }, [watchlistAssets]);
  useEffect(() => { localStorage.setItem("pinnedAssets", JSON.stringify(pinnedAssets)); }, [pinnedAssets]);
  useEffect(() => { localStorage.setItem("userComments", JSON.stringify(userComments)); }, [userComments]);

  const handleProfilePicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result; setProfilePicture(r); localStorage.setItem("profilePicture", r); };
    reader.readAsDataURL(file);
  };

  const changeLanguage = (lang) => { setLanguage(lang); localStorage.setItem("mp_language", lang); setShowLanguageMenu(false); };

  // ── Reset on asset/timeframe change ──
  useEffect(() => { setAiAnalysis(null); setChartCrosshair(null); setRealMarketData(null); setRealTimePrice(null); setRealQuote(null); }, [selectedAssetId]);
  useEffect(() => { setChartCrosshair(null); }, [timeframe]);

  // ── Supabase comments ──
  useEffect(() => {
    const fetchRealComments = async () => {
      if (!selectedAssetId) return;
      try {
        const { data, error } = await supabase.from("comments").select("*, users!inner(username)").eq("asset_id", selectedAssetId);
        if (!error && data) {
          setUserComments(data.map(d => ({
            id: d.id, assetId: d.asset_id, timeframe: d.timeframe,
            chartIndex: 0, price: d.price, text: d.text, sentiment: d.sentiment,
            timestamp: d.created_at, user: `@${d.users?.username || "User"}`,
            likes: d.likes, realTime: new Date(d.created_at).getTime() / 1000,
          })));
        }
      } catch {}
    };
    fetchRealComments();
  }, [selectedAssetId]);

  // ── Real data fetching ──
  const loadRealData = async () => {
    if (!selectedAssetId) return;
    setIsDataLoading(true);
    try {
      const data = await fetchMarketData(selectedAssetId, timeframe);
      setRealMarketData(data && data.length > 2 ? data : null);
      const quote = await fetchQuote(selectedAssetId);
      if (quote) { setRealQuote(quote); setRealTimePrice(quote.price); }
      else { const price = await fetchRealTimePrice(selectedAssetId); if (price) setRealTimePrice(price); }
    } catch { setRealMarketData(null); }
    setIsDataLoading(false);
  };

  useEffect(() => {
    loadRealData();
    const interval = setInterval(() => {
      fetchQuote(selectedAssetId).then(q => { if (q) { setRealQuote(q); setRealTimePrice(q.price); } });
    }, 180000);
    return () => clearInterval(interval);
  }, [selectedAssetId, timeframe]);

  // ── Derived values ──
  const activeAsset = useMemo(() => ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0], [selectedAssetId]);

  const activeData = useMemo(() => {
    if (realMarketData?.length > 0) return realMarketData;
    const data = activeAsset?.data?.[timeframe] || activeAsset?.data?.["1D"] || [];
    return Array.isArray(data) ? data : [];
  }, [activeAsset, timeframe, realMarketData]);

  // MADDE 2: displayPrice — safe for both {time,value} objects and plain numbers
  const displayPrice = useMemo(() => {
    const getLastValue = () => {
      if (realMarketData?.length > 0) return realMarketData[realMarketData.length - 1]?.value ?? null;
      const last = activeData[activeData.length - 1];
      if (last === undefined) return null;
      return typeof last === "object" ? last?.value : last;
    };
    const chartLast = getLastValue();
    if (realTimePrice && chartLast) {
      const ratio = realTimePrice / chartLast;
      if (ratio > 0.5 && ratio < 2) return realTimePrice;
    }
    if (chartLast && chartLast > 0) return chartLast;
    return activeAsset.price;
  }, [realTimePrice, realMarketData, activeData, activeAsset]);

  // MADDE 1: timeframe-aware % change — hesaplanır her timeframe değişiminde
  const timeframeChange = useMemo(() => {
    const getValue = (d) => typeof d === "object" ? (d?.value ?? 0) : (d ?? 0);
    if (!activeData?.length || activeData.length < 2) {
      // Fallback to realQuote if available
      if (realQuote) return { pct: realQuote.percentChange, isUp: realQuote.isUp, str: `${realQuote.isUp ? "+" : ""}${realQuote.percentChange.toFixed(2)}%` };
      return { pct: 0, isUp: true, str: "+0.00%" };
    }
    const first = getValue(activeData[0]);
    const last  = getValue(activeData[activeData.length - 1]);
    if (!first || first === 0) return { pct: 0, isUp: true, str: "+0.00%" };
    const pct  = ((last - first) / first) * 100;
    const isUp = pct >= 0;
    return { pct, isUp, str: `${isUp ? "+" : ""}${pct.toFixed(2)}%` };
  }, [activeData, realQuote]);

  const activeTranslations = useMemo(() => MOCK_TRANSLATIONS[selectedAssetId] || [], [selectedAssetId]);

  // MADDE 2: chartDataPoints — deduplicated, sorted, no gaps
  const chartDataPoints = useMemo(() => {
    if (!activeData?.length) return [];
    if (realMarketData?.length > 0) {
      return activeData
        .map((d, i) => ({ time: Number(d.time), value: Number(d.value), originalIndex: i }))
        .filter(d => d.time > 0 && d.value > 0)
        .sort((a, b) => a.time - b.time)
        .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);
    }
    // Mock data: generate UNIX timestamps from now backwards
    // seconds per step by timeframe
    const stepMap = { "1H": 60, "1D": 1440, "1W": 10080, "1M": 86400, "1Y": 518400, "ALL": 2592000 };
    const s = stepMap[timeframe] || 1440;
    const now = Math.floor(Date.now() / 1000);
    const n = activeData.length;
    return activeData
      .map((val, i) => {
        const v = typeof val === "object" ? val?.value : val;
        return { time: now - (n - 1 - i) * s, value: Number(v) };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);
  }, [activeData, timeframe, realMarketData]);

  const activeUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId && c.timeframe === timeframe),
    [userComments, selectedAssetId, timeframe]
  );

  const allAssetUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId),
    [userComments, selectedAssetId]
  );

  // MADDE 6: chartMarkers — full data passed for bubble display
  const chartMarkers = useMemo(() => {
    if (!chartDataPoints?.length) return [];
    const markers = [];
    if (showAIConsensus || showNewsBubbles) {
      activeTranslations.forEach(point => {
        if (point.type === "news" && !showNewsBubbles) return;
        if (point.type !== "news" && !showAIConsensus) return;
        const idx = Math.min(Math.max(point.idx || 0, 0), chartDataPoints.length - 1);
        const target = chartDataPoints[idx];
        if (target) markers.push({
          time: target.time,
          sentiment: point.sentiment,
          type: point.type,
          idx,
          importance: point.importance || 5,
          headline: point.translation,
          translation: point.translation,
          comments: point.comments || [],
        });
      });
    }
    activeUserComments.forEach(uc => {
      const tt = uc.realTime ?? chartDataPoints[uc.chartIndex]?.time ?? chartDataPoints[chartDataPoints.length - 1]?.time;
      if (tt) markers.push({ time: tt, sentiment: uc.sentiment, type: "user_comment", id: uc.id, importance: 3 });
    });
    return markers;
  }, [activeTranslations, activeUserComments, showAIConsensus, showNewsBubbles, chartDataPoints]);

  // ── Handlers ──
  // MADDE 8 & 9: openCommentSheet works with or without crosshair
  const openCommentSheet = (forceIdx) => {
    const safeIdx = forceIdx ?? (chartCrosshair?.idx ?? (activeData.length > 0 ? activeData.length - 1 : 0));
    setCommentChartIdx(safeIdx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  // MADDE 8 & 9: submitComment — handles {time,value} objects AND plain numbers
  const submitComment = () => {
    if (!commentText.trim()) return;
    const idx = commentChartIdx ?? (activeData.length > 0 ? activeData.length - 1 : 0);
    const rawData = activeData[idx];
    const price = rawData == null ? 0 : typeof rawData === "object" ? (rawData?.value ?? 0) : Number(rawData);
    setUserComments(prev => [{
      id: Date.now().toString(), assetId: selectedAssetId, timeframe,
      chartIndex: idx, price,
      text: commentText.trim(), sentiment: commentSentiment,
      timestamp: new Date().toISOString(), user: "@You", likes: 0,
    }, ...prev]);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const deleteComment = (id) => setUserComments(prev => prev.filter(c => c.id !== id));
  const voteComment = (key, dir) => setCommentVotes(prev => ({ ...prev, [key]: prev[key] === dir ? null : dir }));

  const handleSplashClick = () => {
    setIsSplashPressed(true);
    setTimeout(() => { setIsExitingSplash(true); setTimeout(() => setShowSplash(false), 700); }, 1200);
  };

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = getAIClient();
      if (!ai) {
        setAiAnalysis(language === "Turkish" ? "Yapay zeka analizi şu an kullanılamıyor." : "AI Analysis is currently unavailable. Please configure the API key in Vercel.");
        setIsAnalyzing(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze ${activeAsset.name} (${activeAsset.symbol}). Price: $${displayPrice.toFixed(2)}. Change: ${timeframeChange.str}. Give a 2-3 sentence professional summary.`,
      });
      setAiAnalysis(response.text || "Analysis unavailable.");
    } catch { setAiAnalysis("Failed to generate analysis."); }
    finally { setIsAnalyzing(false); }
  };

  // MADDE 6: handleMarkerClick — matches full marker data for bubble/detail
  const handleMarkerClick = (marker) => {
    if (!marker) return;
    if (marker.type === "news" || marker.type === "consensus") {
      const full = activeTranslations.find(tp => {
        const target = chartDataPoints[Math.min(Math.max(tp.idx || 0, 0), chartDataPoints.length - 1)];
        return target && Math.abs(Number(target.time) - Number(marker.time)) < 2;
      }) || marker;
      setDetailedPoint({ ...full, screenX: marker.screenX, screenY: marker.screenY });
      setSentimentFilter("All");
    }
  };

  const navigateTo = (assetId) => { setSelectedAssetId(assetId); setActiveTab("dashboard"); setIsMenuOpen(false); };

  const value = {
    activeTab, setActiveTab, selectedAssetId, setSelectedAssetId, navigateTo,
    showSplash, isExitingSplash, isSplashPressed, handleSplashClick,
    isLoggedIn, setIsLoggedIn, onboardingStep, setOnboardingStep,
    isMenuOpen, setIsMenuOpen, searchQuery, setSearchQuery,
    expandedCategory, setExpandedCategory, isSearchActive, setIsSearchActive,
    menuSearch, setMenuSearch,
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    autoTranslate, setAutoTranslate, t,
    timeframe, setTimeframe, showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus, realMarketData, realTimePrice,
    realQuote, isDataLoading, selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint, chartCrosshair, setChartCrosshair,
    sentimentFilter, setSentimentFilter,
    activeAsset, activeData, displayPrice, timeframeChange, chartDataPoints, chartMarkers,
    activeUserComments, allAssetUserComments, activeTranslations,
    isAnalyzing, aiAnalysis, generateAIAnalysis,
    userComments, showCommentSheet, setShowCommentSheet,
    commentChartIdx, setCommentChartIdx, commentText, setCommentText,
    commentSentiment, setCommentSentiment, showMyComments, setShowMyComments,
    commentVotes, postVotes, setPostVotes, hideMyCommentsBar, setHideMyCommentsBar,
    longPressTimer, openCommentSheet, submitComment, deleteComment, voteComment,
    handleMarkerClick,
    watchlistAssets, setWatchlistAssets, pinnedAssets, setPinnedAssets,
    isEditPinned, setIsEditPinned, watchlistLayout, setWatchlistLayout,
    communityTab, setCommunityTab, trendingExpanded, setTrendingExpanded,
    commentsExpanded, setCommentsExpanded,
    trendingTimeframe, setTrendingTimeframe, commentsTimeframe, setCommentsTimeframe,
    profilePage, setProfilePage, profilePicture, handleProfilePicture,
    isEditingProfile, setIsEditingProfile, editedUsername, setEditedUsername,
    session, user, loginGoogle, loginApple, logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
