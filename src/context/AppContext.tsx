// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ASSETS, MOCK_TRANSLATIONS, APP_ASSETS } from "../data";
import { TRANSLATIONS } from "../translations";
import { GoogleGenAI } from "@google/genai";

// ── Twelve Data API ──────────────────────────────────────────────────────────
// Vite: VITE_TWELVE_DATA_API_KEY in .env  |  Vercel: env var with same name
const TD_KEY: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TWELVE_DATA_API_KEY) ||
  (typeof process !== "undefined" && process.env?.TWELVE_DATA_API_KEY) ||
  "";
const TD_BASE = "https://api.twelvedata.com";

const SYMBOL_MAP: Record<string, string> = {
  BTC: "BTC/USD", ETH: "ETH/USD", SOL: "SOL/USD", ADA: "ADA/USD",
  DOT: "DOT/USD", LINK: "LINK/USD", AVAX: "AVAX/USD", XRP: "XRP/USD",
  NASDAQ: "NDX", AAPL: "AAPL", MSFT: "MSFT", GOOGL: "GOOGL",
  AMZN: "AMZN", META: "META", NVDA: "NVDA", AMD: "AMD",
  TSLA: "TSLA", NFLX: "NFLX",
  GOLD: "XAU/USD", SILVER: "XAG/USD", OIL: "CL1!", COPPER: "HG1!",
  PLATINUM: "XPT/USD", PALLADIUM: "XPD/USD", NATGAS: "NG1!",
  CORN: "ZC1!", WHEAT: "ZW1!",
};

const INTERVAL_MAP: Record<string, { interval: string; outputsize: number }> = {
  "1H": { interval: "1min",  outputsize: 60  },
  "1D": { interval: "15min", outputsize: 96  },
  "1W": { interval: "1h",    outputsize: 168 },
  "1M": { interval: "4h",    outputsize: 180 },
  "1Y": { interval: "1day",  outputsize: 365 },
  "ALL": { interval: "1week", outputsize: 260 },
};

async function fetchTimeSeries(assetId: string, timeframe: string) {
  if (!TD_KEY) return null;
  const sym = SYMBOL_MAP[assetId];
  if (!sym) return null;
  const { interval, outputsize } = INTERVAL_MAP[timeframe] || INTERVAL_MAP["1D"];
  try {
    const res = await fetch(`${TD_BASE}/time_series?symbol=${sym}&interval=${interval}&outputsize=${outputsize}&apikey=${TD_KEY}`);
    const json = await res.json();
    if (json.status === "error" || !json.values) return null;
    return json.values
      .map((v: any) => ({ time: Math.floor(new Date(v.datetime).getTime() / 1000), value: parseFloat(v.close) }))
      .filter((d: any) => !isNaN(d.value) && d.time > 0)
      .sort((a: any, b: any) => a.time - b.time);
  } catch { return null; }
}

async function fetchQuote(assetId: string) {
  if (!TD_KEY) return null;
  const sym = SYMBOL_MAP[assetId];
  if (!sym) return null;
  try {
    const res = await fetch(`${TD_BASE}/quote?symbol=${sym}&apikey=${TD_KEY}`);
    const json = await res.json();
    if (json.status === "error") return null;
    return {
      price: parseFloat(json.close || json.price || 0),
      change: parseFloat(json.percent_change || 0),
      isUp: parseFloat(json.percent_change || 0) >= 0,
    };
  } catch { return null; }
}

// ── AI Client ────────────────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
const getAIClient = () => {
  const key =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
    "";
  if (!key) return null;
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey: key });
  return aiClient;
};

// ── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<any>(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Splash / Auth
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // ── Navigation
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profilePage, setProfilePage] = useState<string | null>(null);

  // ── Asset / Chart
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");
  const [timeframe, setTimeframe] = useState("1D");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [detailedPoint, setDetailedPoint] = useState<any>(null);
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [chartCrosshair, setChartCrosshair] = useState<any>(null);

  // ── Real data (Twelve Data)
  const [realChartData, setRealChartData] = useState<any[] | null>(null);
  const [realQuote, setRealQuote] = useState<any | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // ── UI toggles
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showNewsBubbles, setShowNewsBubbles] = useState(true);
  const [showAIConsensus, setShowAIConsensus] = useState(true);
  const [menuSearch, setMenuSearch] = useState("");
  const [isEditPinned, setIsEditPinned] = useState(false);
  const [watchlistLayout, setWatchlistLayout] = useState<"list" | "grid">("list");
  const [communityTab, setCommunityTab] = useState("community");
  const [trendingExpanded, setTrendingExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [trendingTimeframe, setTrendingTimeframe] = useState("Daily");
  const [commentsTimeframe, setCommentsTimeframe] = useState("Daily");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // ── Language / i18n
  const [language, setLanguage] = useState("English");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.English;

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  // ── Profile
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Pinned / Watchlist
  const [watchlistAssets, setWatchlistAssets] = useState<string[]>(
    ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"]
  );
  const [pinnedAssets, setPinnedAssets] = useState<string[]>(["BTC", "AAPL", "GOLD"]);

  // ── Comments
  const [userComments, setUserComments] = useState<any[]>([]);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentChartIdx, setCommentChartIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSentiment, setCommentSentiment] = useState("Neutral");
  const [showMyComments, setShowMyComments] = useState(false);
  const [commentVotes, setCommentVotes] = useState<Record<string, "up" | "down" | null>>({});
  const longPressTimer = useRef<any>(null);

  // ── AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // ── Active asset (memo)
  const activeAsset = useMemo(() => ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0], [selectedAssetId]);

  // ── Chart data: real if available, fallback to mock
  const mockChartData = useMemo(() => {
    const raw = activeAsset.data[timeframe as keyof typeof activeAsset.data] || activeAsset.data["1D"];
    const now = Math.floor(Date.now() / 1000);
    const step = timeframe === "1H" ? 60 : timeframe === "1D" ? 900 : timeframe === "1W" ? 3600 : timeframe === "1M" ? 14400 : 86400;
    return raw.map((v: number, i: number) => ({
      time: now - (raw.length - 1 - i) * step,
      value: v,
    }));
  }, [activeAsset, timeframe]);

  const chartDataPoints = realChartData || mockChartData;

  // ── Active data array (for price lookups)
  const activeData = useMemo(() => chartDataPoints.map((d: any) => d.value), [chartDataPoints]);

  // ── Display price
  const displayPrice = useMemo(() => {
    if (realQuote?.price && realQuote.price > 0) return realQuote.price;
    return activeAsset.price;
  }, [realQuote, activeAsset]);

  // ── Timeframe % change
  const timeframeChange = useMemo(() => {
    if (chartDataPoints.length < 2) {
      const raw = activeAsset.change;
      const isUp = raw.startsWith("+");
      return { pct: parseFloat(raw), isUp, str: raw };
    }
    const first = chartDataPoints[0].value;
    const last  = chartDataPoints[chartDataPoints.length - 1].value;
    const pct   = ((last - first) / first) * 100;
    const isUp  = pct >= 0;
    return { pct, isUp, str: `${isUp ? "+" : ""}${pct.toFixed(2)}%` };
  }, [chartDataPoints, activeAsset]);

  // ── Chart markers (user comments → TradingView marker format)
  const activeUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId && c.timeframe === timeframe),
    [userComments, selectedAssetId, timeframe]);

  const allAssetUserComments = useMemo(() =>
    userComments.filter(c => c.assetId === selectedAssetId),
    [userComments, selectedAssetId]);

  const chartMarkers = useMemo(() => {
    if (!chartDataPoints.length) return [];
    return activeUserComments
      .map(uc => {
        const pt = chartDataPoints[uc.chartIndex] || chartDataPoints[chartDataPoints.length - 1];
        return pt ? { time: pt.time, value: pt.value, sentiment: uc.sentiment, importance: 5, type: "comment", text: uc.text } : null;
      })
      .filter(Boolean);
  }, [activeUserComments, chartDataPoints]);

  // ── Active translations (news bubbles)
  const activeTranslations = MOCK_TRANSLATIONS[selectedAssetId as keyof typeof MOCK_TRANSLATIONS] || [];

  // ── Fetch real data on asset/timeframe change
  useEffect(() => {
    if (!TD_KEY) return;
    let cancelled = false;
    setIsDataLoading(true);
    setRealChartData(null);

    fetchTimeSeries(selectedAssetId, timeframe).then(data => {
      if (!cancelled && data) setRealChartData(data);
      setIsDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedAssetId, timeframe]);

  // ── Fetch quote on asset change
  useEffect(() => {
    if (!TD_KEY) return;
    setRealQuote(null);
    fetchQuote(selectedAssetId).then(q => { if (q) setRealQuote(q); });
  }, [selectedAssetId]);

  // ── Reset on asset change
  useEffect(() => {
    setAiAnalysis(null);
    setChartCrosshair(null);
    setSelectedPoint(null);
    setDetailedPoint(null);
  }, [selectedAssetId]);

  useEffect(() => { setChartCrosshair(null); }, [timeframe]);

  // ── Splash
  const handleSplashClick = () => {
    setIsSplashPressed(true);
    setTimeout(() => {
      setIsExitingSplash(true);
      setTimeout(() => setShowSplash(false), 700);
    }, 1200);
  };

  // ── Login helpers (stubs for OAuth)
  const loginGoogle = async () => { setIsLoggedIn(true); };
  const loginApple  = async () => { setIsLoggedIn(true); };

  // ── Comment helpers
  const openCommentSheet = () => {
    // chartCrosshair.idx is set by Dashboard's handleCrosshairMove (nearest index)
    const idx = chartCrosshair?.idx ?? (chartDataPoints.length - 1);
    setCommentChartIdx(idx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    const dp = chartDataPoints[commentChartIdx];
    const price = dp ? dp.value : chartCrosshair?.price ?? 0;
    setUserComments(prev => [{
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: commentChartIdx,
      price,
      text: commentText.trim(),
      sentiment: commentSentiment,
      timestamp: new Date().toISOString(),
      user: "@You",
      likes: 0,
    }, ...prev]);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const deleteComment = (id: string) => setUserComments(prev => prev.filter(c => c.id !== id));

  const voteComment = (key: string, dir: "up" | "down") =>
    setCommentVotes(prev => ({ ...prev, [key]: prev[key] === dir ? null : dir }));

  // ── Point click (news bubble expand)
  const handlePointClick = (point: any) => {
    if (selectedPoint?.idx === point.idx) {
      setDetailedPoint(point);
    } else {
      setSelectedPoint(point);
      setSentimentFilter("All");
    }
  };

  // ── AI Analysis
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = getAIClient();
      const changeStr = timeframeChange.str;
      if (!ai) {
        setAiAnalysis(language === "Turkish"
          ? "Yapay zeka analizi şu an kullanılamıyor."
          : "AI Analysis is currently unavailable. Please configure the GEMINI_API_KEY in Vercel.");
        return;
      }
      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Analyze ${activeAsset.name} (${activeAsset.symbol}). Price: $${displayPrice.toLocaleString()}. Change: ${changeStr}. Give a 2-3 sentence professional market summary. Be concise.`,
      });
      setAiAnalysis(res.text || "Analysis unavailable.");
    } catch {
      setAiAnalysis("Failed to generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const value = {
    // splash/auth
    showSplash, isExitingSplash, isSplashPressed, handleSplashClick,
    isLoggedIn, setIsLoggedIn, onboardingStep, setOnboardingStep,
    loginGoogle, loginApple,
    // navigation
    activeTab, setActiveTab, profilePage, setProfilePage,
    // asset/chart
    selectedAssetId, setSelectedAssetId,
    timeframe, setTimeframe,
    selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint,
    sentimentFilter, setSentimentFilter,
    chartCrosshair, setChartCrosshair,
    activeAsset, displayPrice, timeframeChange,
    chartDataPoints, activeData, chartMarkers,
    activeTranslations, activeUserComments, allAssetUserComments,
    isDataLoading, realQuote,
    // UI
    isMenuOpen, setIsMenuOpen,
    isSearchActive, setIsSearchActive,
    searchQuery, setSearchQuery,
    expandedCategory, setExpandedCategory,
    showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus,
    menuSearch, setMenuSearch,
    isEditPinned, setIsEditPinned,
    watchlistLayout, setWatchlistLayout,
    communityTab, setCommunityTab,
    trendingExpanded, setTrendingExpanded,
    commentsExpanded, setCommentsExpanded,
    trendingTimeframe, setTrendingTimeframe,
    commentsTimeframe, setCommentsTimeframe,
    showLanguageMenu, setShowLanguageMenu,
    // language
    language, setLanguage, changeLanguage, t, autoTranslate, setAutoTranslate,
    // profile
    profilePicture, handleProfilePicture,
    // lists
    watchlistAssets, setWatchlistAssets,
    pinnedAssets, setPinnedAssets,
    // comments
    userComments, setUserComments,
    showCommentSheet, setShowCommentSheet,
    commentChartIdx, setCommentChartIdx,
    commentText, setCommentText,
    commentSentiment, setCommentSentiment,
    showMyComments, setShowMyComments,
    commentVotes, voteComment,
    longPressTimer,
    openCommentSheet, submitComment, deleteComment,
    handlePointClick,
    // AI
    isAnalyzing, aiAnalysis, generateAIAnalysis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
