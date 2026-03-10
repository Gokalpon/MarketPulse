// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useSupabase } from "../useSupabaseData";
import { supabase } from "../supabase";
import { fetchMarketData, fetchRealTimePrice, fetchQuote } from "../services/marketData";
import { GoogleGenAI } from "@google/genai";
import { ASSETS, MOCK_TRANSLATIONS } from "../data";
import { TRANSLATIONS } from "../translations";

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
        const target = chartDataPoints[point.idx] || chartDataPoints[0];
        if (target) markers.push({ time: target.time, sentiment: point.type === "news" ? "Neutral" : point.sentiment, type: point.type, idx: point.idx });
      });
    }
    activeUserComments.forEach(uc => {
      const t = uc.realTime ?? chartDataPoints[uc.chartIndex]?.time ?? chartDataPoints[chartDataPoints.length - 1]?.time;
      if (t) markers.push({ time: t, sentiment: uc.sentiment, type: "user_comment", id: uc.id });
    });
    return markers;
  }, [activeTranslations, activeUserComments, showAIConsensus, showNewsBubbles, chartDataPoints]);

  // ── Handlers ──
  const openCommentSheet = () => {
    if (!chartCrosshair) return;
    setCommentChartIdx(chartCrosshair.idx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    setUserComments(prev => [{
      id: Date.now().toString(), assetId: selectedAssetId, timeframe,
      chartIndex: commentChartIdx, price: activeData[commentChartIdx],
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
