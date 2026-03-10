// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useSupabase } from "../useSupabaseData";
import { supabase } from "../supabase";
import { fetchMarketData, fetchRealTimePrice, fetchQuote } from "../services/marketData";
import { GoogleGenAI } from "@google/genai";
import { ASSETS, MOCK_TRANSLATIONS as _MOCK_TRANSLATIONS } from "../data";
import { TRANSLATIONS } from "../translations";

// ── NEWS & CONSENSUS MARKERS — importance 1-10, zoom-aware (max 2 shown in viewport) ──
const DEMO_MARKERS = {
  BTC: [
    { idx: 8,  type: "news",      importance: 9,  sentiment: "Positive", translation: "BlackRock Bitcoin ETF onaylandı — kurumsal sermaye kapıları açıldı.", comments: [{ user: "@InstitutionalFlow", text: "ETF girişleri $2B geçti, bu oyunu tamamen değiştiriyor.", sentiment: "Positive", likes: 94 }, { user: "@CryptoKing", text: "Beklentileri aştı, long pozisyon için ideal an.", sentiment: "Positive", likes: 47 }, { user: "@Skeptic99", text: "Hype fazla, realize etme dalgası gelebilir.", sentiment: "Negative", likes: 12 }] },
    { idx: 18, type: "consensus", importance: 6,  sentiment: "Positive", translation: "AI Konsensus: %73 analist yükseliş bekliyor. RSI 68 — aşırı alım bölgesine yaklaşılıyor.", comments: [{ user: "@DayTrader", text: "RSI biraz daha yer var, aldım.", sentiment: "Positive", likes: 31 }, { user: "@MacroEcon", text: "Konsensus güçlü ama makro veriler karışık.", sentiment: "Neutral", likes: 19 }] },
    { idx: 32, type: "news",      importance: 10, sentiment: "Negative", translation: "FTX çöküşü piyasayı sarstı — $8B açık pozisyon tasfiye edildi.", comments: [{ user: "@RegulatoryWatch", text: "Tarihsel en büyük kripto iflası. Etkileri uzun sürer.", sentiment: "Negative", likes: 112 }, { user: "@BearHunter", text: "Stop loss'larımı yukarı çektim, iyi ki.", sentiment: "Negative", likes: 34 }] },
    { idx: 45, type: "consensus", importance: 5,  sentiment: "Neutral",  translation: "AI Konsensus: Piyasa yön arıyor. %51 yükseliş, %49 düşüş beklentisi.", comments: [{ user: "@SwingTrader", text: "Bu belirsizlikte range trading yapıyorum.", sentiment: "Neutral", likes: 15 }] },
    { idx: 55, type: "news",      importance: 8,  sentiment: "Positive", translation: "MicroStrategy 21,000 BTC daha satın aldı — hazine stratejisi güçleniyor.", comments: [{ user: "@Saylor_Fan", text: "Şirket bilanço stratejisi olarak BTC aldı, bu trend büyüyor.", sentiment: "Positive", likes: 67 }, { user: "@ValueInvestor", text: "Riskli ama kararlı bir hamle.", sentiment: "Neutral", likes: 23 }] },
  ],
  ETH: [
    { idx: 10, type: "news",      importance: 9,  sentiment: "Positive", translation: "Ethereum The Merge tamamlandı — Proof-of-Stake geçişi başarılı.", comments: [{ user: "@L2Maxi", text: "Enerji tüketimi %99.95 düştü. Bu devrimsel.", sentiment: "Positive", likes: 88 }, { user: "@MinerFee", text: "Madenciler için kötü, ama ağ için iyi.", sentiment: "Neutral", likes: 21 }] },
    { idx: 30, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: ETH staking oranı %28'e ulaştı. Likidite azalıyor.", comments: [{ user: "@ValidatorNode", text: "Staking getirisi düşüyor ama güvenlik artıyor.", sentiment: "Neutral", likes: 21 }] },
    { idx: 50, type: "news",      importance: 8,  sentiment: "Negative", translation: "SEC Ethereum'u menkul kıymet sayabilir — davalar genişliyor.", comments: [{ user: "@BTC_Maxi", text: "Regülasyon riski gerçek. Sermaye BTC'ye geçiyor.", sentiment: "Negative", likes: 45 }, { user: "@ETH_Bull", text: "Hukuki belirsizlik geçici, teknoloji kazanır.", sentiment: "Positive", likes: 38 }] },
  ],
  AAPL: [
    { idx: 12, type: "news",      importance: 9,  sentiment: "Positive", translation: "Apple Vision Pro lansmanı — $3,499 fiyatla spatial computing çağı başladı.", comments: [{ user: "@TechBull", text: "Spatial computing platform yükselişi bu. 5 yıl içinde mainstream.", sentiment: "Positive", likes: 72 }, { user: "@PriceSkeptic", text: "$3,499 fiyat kitlelere ulaşmayı engelliyor.", sentiment: "Negative", likes: 29 }] },
    { idx: 35, type: "consensus", importance: 7,  sentiment: "Neutral",  translation: "AI Konsensus: AAPL P/E 31x — büyüme beklentileri fiyatlanmış durumda.", comments: [{ user: "@ValueInvestor", text: "Değerleme gergin ama Apple kalite primini hak ediyor.", sentiment: "Neutral", likes: 16 }] },
    { idx: 52, type: "news",      importance: 8,  sentiment: "Negative", translation: "iPhone satışları Çin'de %19 geriledi — rekabet baskısı artıyor.", comments: [{ user: "@ChinaAnalyst", text: "Huawei'nin geri dönüşü Apple için ciddi tehdit.", sentiment: "Negative", likes: 43 }] },
  ],
  TSLA: [
    { idx: 15, type: "news",      importance: 10, sentiment: "Positive", translation: "Tesla S&P 500'e eklendi — pasif fon alımları $12B'a ulaştı.", comments: [{ user: "@IndexFund", text: "Tarihin en büyük endeks eklemesi. Fiyat hareketi anlaşılır.", sentiment: "Positive", likes: 89 }] },
    { idx: 40, type: "news",      importance: 9,  sentiment: "Negative", translation: "Elon Musk Tesla hisselerini sattı — Twitter satın alımı finanse ediliyor.", comments: [{ user: "@TeslaShort", text: "CEO hisse satışı güven zedeliyor.", sentiment: "Negative", likes: 67 }, { user: "@TeslaBull", text: "Kısa vadeli baskı, uzun vade değişmedi.", sentiment: "Positive", likes: 34 }] },
    { idx: 55, type: "consensus", importance: 6,  sentiment: "Neutral",  translation: "AI Konsensus: TSLA EV rekabeti artıyor, margin baskısı devam ediyor.", comments: [{ user: "@EVAnalyst", text: "BYD, GM, Ford basıyı artırıyor.", sentiment: "Negative", likes: 22 }] },
  ],
  NVDA: [
    { idx: 20, type: "news",      importance: 10, sentiment: "Positive", translation: "NVIDIA H100 GPU talebi yapay zeka patlamasıyla rekor kırdı — bekleme listesi 1 yıla uzadı.", comments: [{ user: "@AIInvestor", text: "ChatGPT etkisi doğrudan NVDA bilançosuna yansıdı.", sentiment: "Positive", likes: 134 }] },
    { idx: 50, type: "consensus", importance: 7,  sentiment: "Positive", translation: "AI Konsensus: NVDA datacenter gelirleri $10B/çeyrek rejimine giriyor.", comments: [{ user: "@TechAnalyst", text: "Gelir görünürlüğü çok yüksek, kurumsal talep devam ediyor.", sentiment: "Positive", likes: 56 }] },
  ],
  GOLD: [
    { idx: 15, type: "news",      importance: 9,  sentiment: "Positive", translation: "Fed faiz artışları duraklatıldı — altın güvenli liman talebinde sert yükseliş.", comments: [{ user: "@GoldBug", text: "Reel faiz düşünce altın parlıyor, klasik senaryo.", sentiment: "Positive", likes: 44 }] },
    { idx: 45, type: "news",      importance: 8,  sentiment: "Positive", translation: "Merkez bankaları 1,000 ton altın aldı — 55 yılın rekoru.", comments: [{ user: "@CBAnalyst", text: "Dolar dışı rezerv çeşitlendirmesi hız kazandı.", sentiment: "Positive", likes: 61 }] },
  ],
  SOL: [
    { idx: 18, type: "news",      importance: 10, sentiment: "Negative", translation: "Solana ağı 17 saatlik kesinti yaşadı — güvenilirlik sorgulanıyor.", comments: [{ user: "@ValidatorSOL", text: "Downtime sorunu hâlâ çözülmedi, endişe verici.", sentiment: "Negative", likes: 78 }] },
    { idx: 48, type: "news",      importance: 9,  sentiment: "Positive", translation: "Solana mobil cüzdan Saga kullanıcı rekoru kırdı — tüketici odaklı büyüme.", comments: [{ user: "@SolBull", text: "Saga kampanyası Solana ekosistemini mainstream'e taşıdı.", sentiment: "Positive", likes: 52 }] },
  ],
};

const MOCK_TRANSLATIONS = { ..._MOCK_TRANSLATIONS, ...DEMO_MARKERS };
// ── END DEMO DATA ──

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

  // ── Profile picture ──
  const handleProfilePicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setProfilePicture(result);
      localStorage.setItem("profilePicture", result);
    };
    reader.readAsDataURL(file);
  };

  // ── Language setter (with persistence) ──
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("mp_language", lang);
    setShowLanguageMenu(false);
  };

  // ── Reset on asset change ──
  useEffect(() => {
    setAiAnalysis(null);
    setChartCrosshair(null);
    setRealMarketData(null);
    setRealTimePrice(null);
    setRealQuote(null);
  }, [selectedAssetId]);

  useEffect(() => { setChartCrosshair(null); }, [timeframe]);

  // ── Supabase comments ──
  useEffect(() => {
    const fetchRealComments = async () => {
      if (!selectedAssetId) return;
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*, users!inner(username)")
          .eq("asset_id", selectedAssetId);
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
      else {
        const price = await fetchRealTimePrice(selectedAssetId);
        if (price) setRealTimePrice(price);
      }
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

  const activeTranslations = useMemo(() => MOCK_TRANSLATIONS[selectedAssetId] || [], [selectedAssetId]);

  const chartDataPoints = useMemo(() => {
    if (!activeData?.length) return [];
    if (realMarketData?.length > 0) {
      return activeData.map((d, i) => ({ time: d.time, value: d.value, originalIndex: i }));
    }
    let s = 60;
    if (timeframe === "1D")  s = 1440;
    if (timeframe === "1W")  s = 10080;
    if (timeframe === "1M")  s = 86400;
    if (timeframe === "1Y")  s = 518400;
    if (timeframe === "ALL") s = 2592000;
    const now = Math.floor(Date.now() / 1000);
    return activeData.map((val, i) => ({
      time: now - (activeData.length - 1 - i) * s,
      value: val,
      originalIndex: i,
    }));
  }, [activeData, timeframe, realMarketData]);

  const activeUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId && c.timeframe === timeframe),
    [userComments, selectedAssetId, timeframe]
  );

  const allAssetUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId),
    [userComments, selectedAssetId]
  );

  const chartMarkers = useMemo(() => {
    if (!chartDataPoints?.length) return [];
    const markers = [];
    if (showAIConsensus || showNewsBubbles) {
      activeTranslations.forEach(point => {
        if (point.type === "news" && !showNewsBubbles) return;
        if (point.type !== "news" && !showAIConsensus) return;
        // Clamp idx to valid range
        const idx = Math.min(Math.max(point.idx || 0, 0), chartDataPoints.length - 1);
        const target = chartDataPoints[idx];
        if (target) markers.push({
          time: target.time,
          sentiment: point.sentiment,
          type: point.type,
          idx,
          importance: point.importance || 5,
          headline: point.translation,  // short version for bubble
          translation: point.translation,
          comments: point.comments || [],
        });
      });
    }
    activeUserComments.forEach(uc => {
      const t = uc.realTime ?? chartDataPoints[uc.chartIndex]?.time ?? chartDataPoints[chartDataPoints.length - 1]?.time;
      if (t) markers.push({ time: t, sentiment: uc.sentiment, type: "user_comment", id: uc.id, importance: 3 });
    });
    return markers;
  }, [activeTranslations, activeUserComments, showAIConsensus, showNewsBubbles, chartDataPoints]);

  // ── Handlers ──
  const openCommentSheet = (forceIdx) => {
    // Allow opening from chart crosshair OR floating button (forceIdx)
    const idx = forceIdx ?? (chartCrosshair?.idx ?? null);
    const safeIdx = idx !== null ? idx : (activeData.length > 0 ? activeData.length - 1 : 0);
    setCommentChartIdx(safeIdx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    // Handle both {time, value} objects (realMarketData) and plain numbers (mock data)
    const rawData = activeData[commentChartIdx];
    const price = typeof rawData === 'object' ? (rawData?.value ?? 0) : (rawData ?? 0);
    setUserComments(prev => [{
      id: Date.now().toString(), assetId: selectedAssetId, timeframe,
      chartIndex: commentChartIdx, price,
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
    setTimeout(() => {
      setIsExitingSplash(true);
      setTimeout(() => setShowSplash(false), 700);
    }, 1200);
  };

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = getAIClient();
      if (!ai) {
        setAiAnalysis(language === "Turkish"
          ? "Yapay zeka analizi şu an kullanılamıyor."
          : "AI Analysis is currently unavailable. Please configure the API key in Vercel.");
        setIsAnalyzing(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze ${activeAsset.name} (${activeAsset.symbol}). Price: $${activeAsset.price}. Change: ${activeAsset.change}. Give a 2-3 sentence professional summary.`,
      });
      setAiAnalysis(response.text || "Analysis unavailable.");
    } catch { setAiAnalysis("Failed to generate analysis."); }
    finally { setIsAnalyzing(false); }
  };

  // Called from ChartComponent when user taps a marker dot
  // marker has { time, sentiment, type, headline, translation, comments, screenX, screenY }
  const handleMarkerClick = (marker) => {
    if (!marker) return;
    // If it's a news/consensus marker, open the detail sheet
    if (marker.type === 'news' || marker.type === 'consensus') {
      const fullMarker = activeTranslations.find(t => {
        const target = chartDataPoints[t.idx];
        return target && Math.abs(Number(target.time) - marker.time) < 1;
      }) || marker;
      setDetailedPoint({ ...fullMarker, screenX: marker.screenX, screenY: marker.screenY });
      setSentimentFilter("All");
    }
    // user_comment markers could open My Comments sheet
  };

  const navigateTo = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab("dashboard");
    setIsMenuOpen(false);
  };

  const value = {
    // nav
    activeTab, setActiveTab, selectedAssetId, setSelectedAssetId, navigateTo,
    // splash
    showSplash, isExitingSplash, isSplashPressed, handleSplashClick,
    isLoggedIn, setIsLoggedIn, onboardingStep, setOnboardingStep,
    // ui
    isMenuOpen, setIsMenuOpen, searchQuery, setSearchQuery,
    expandedCategory, setExpandedCategory, isSearchActive, setIsSearchActive,
    menuSearch, setMenuSearch,
    // language
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    autoTranslate, setAutoTranslate, t,
    // chart
    timeframe, setTimeframe, showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus, realMarketData, realTimePrice,
    realQuote, isDataLoading, selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint, chartCrosshair, setChartCrosshair,
    sentimentFilter, setSentimentFilter,
    // derived
    activeAsset, activeData, displayPrice, chartDataPoints, chartMarkers,
    activeUserComments, allAssetUserComments,
    // ai
    isAnalyzing, aiAnalysis, generateAIAnalysis,
    // comments
    userComments, showCommentSheet, setShowCommentSheet,
    commentChartIdx, setCommentChartIdx, commentText, setCommentText,
    commentSentiment, setCommentSentiment, showMyComments, setShowMyComments,
    commentVotes, postVotes, setPostVotes, hideMyCommentsBar, setHideMyCommentsBar,
    longPressTimer, openCommentSheet, submitComment, deleteComment, voteComment,
    handleMarkerClick,
    // watchlist
    watchlistAssets, setWatchlistAssets, pinnedAssets, setPinnedAssets,
    isEditPinned, setIsEditPinned, watchlistLayout, setWatchlistLayout,
    // community
    communityTab, setCommunityTab, trendingExpanded, setTrendingExpanded,
    commentsExpanded, setCommentsExpanded,
    trendingTimeframe, setTrendingTimeframe, commentsTimeframe, setCommentsTimeframe,
    // profile
    profilePage, setProfilePage, profilePicture, handleProfilePicture,
    isEditingProfile, setIsEditingProfile, editedUsername, setEditedUsername,
    // auth
    session, user, loginGoogle, loginApple, logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
