import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, Search, Globe, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  MessageCircle, X, Plus, Brain, User, Users, Bell, Shield, LogOut, Home, List, Heart,
  Share2, Newspaper, Send, Edit3, Trash2, ExternalLink, Settings, Wifi, WifiOff,
  Reply, CornerDownRight, LayoutGrid
} from "lucide-react";
import { ASSETS, APP_ASSETS, COMMUNITY_POSTS, getMockTranslations, getAssetData } from "@/data/assets";
import { TRANSLATIONS } from "@/data/translations";
import { UserComment, DetailedPointData, ChartCrosshair, SentimentCluster, TranslationStrings, NewsOrConsensusPoint } from "@/types";
import { Sparkline } from "@/components/market/Sparkline";
import { AssetWheelPicker } from "@/components/market/AssetWheelPicker";
import { NotifToggle } from "@/components/market/NotifToggle";
import { SplashScreen } from "@/components/market/SplashScreen";
import { OnboardingScreen } from "@/components/market/OnboardingScreen";
import { useMarketData } from "@/hooks/useMarketData";
// Lazy load tabs and sheets for better performance
const DashboardTab = React.lazy(() => import("@/components/market/tabs/DashboardTab").then(m => ({ default: m.DashboardTab })));
const CommunityTab = React.lazy(() => import("@/components/market/tabs/CommunityTab").then(m => ({ default: m.CommunityTab })));
const ProfileTab = React.lazy(() => import("@/components/market/tabs/ProfileTab").then(m => ({ default: m.ProfileTab })));
const CommentSheet = React.lazy(() => import("@/components/market/sheets/CommentSheet").then(m => ({ default: m.CommentSheet })));
const MyCommentsSheet = React.lazy(() => import("@/components/market/sheets/MyCommentsSheet").then(m => ({ default: m.MyCommentsSheet })));
const DetailedPointSheet = React.lazy(() => import("@/components/market/sheets/DetailedPointSheet").then(m => ({ default: m.DetailedPointSheet })));

export default function MarketPulseApp({ containerHeight }: { containerHeight?: number } = {}) {
  // Global SVG Definitions for gradients and masks
  const GlobalSVGDefs = () => (
    <svg width="0" height="0" className="absolute pointer-events-none">
      <defs>
        <linearGradient id="mpIconGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FFFF" />
          <stop offset="50%" stopColor="#00FF87" />
          <stop offset="100%" stopColor="#00FF55" />
        </linearGradient>
      </defs>
    </svg>
  );

  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [marketsSubTab, setMarketsSubTab] = useState<"watchlist" | "all">("watchlist");
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");
  const [selectedPoint, setSelectedPoint] = useState<DetailedPointData | null>(null);
  const [detailedPoint, setDetailedPoint] = useState<DetailedPointData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const [langMenuPos, setLangMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showLanguageMenu && languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      setLangMenuPos({
        top: rect.bottom + 8,
        left: Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 308),
      });
    }
  }, [showLanguageMenu]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  const [communityTab, setCommunityTab] = useState("community");
  const [profilePage, setProfilePage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    try { return localStorage.getItem("profilePicture"); } catch { return null; }
  });

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfilePicture(result);
      localStorage.setItem("profilePicture", result);
    };
    reader.readAsDataURL(file);
  };

  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentsTimeframe, setCommentsTimeframe] = useState("Daily");

  const [watchlistAssets, setWatchlistAssets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("watchlistAssets");
      return saved ? JSON.parse(saved) : ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"];
    } catch { return ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"]; }
  });

  const [pinnedAssets, setPinnedAssets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pinnedAssets");
      return saved ? JSON.parse(saved) : ["BTC", "AAPL", "GOLD"];
    } catch { return ["BTC", "AAPL", "GOLD"]; }
  });

  const [isEditPinned, setIsEditPinned] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [watchlistLayout, setWatchlistLayout] = useState<"list" | "grid">("list");
  const [showNewsBubbles, setShowNewsBubbles] = useState(true);
  const [showAIConsensus, setShowAIConsensus] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [chartExpanded, setChartExpanded] = useState(false);

  // Comment system
  const [userComments, setUserComments] = useState<UserComment[]>(() => {
    try { const s = localStorage.getItem("userComments"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentChartIdx, setCommentChartIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSentiment, setCommentSentiment] = useState("Neutral");
  const [chartCrosshair, setChartCrosshair] = useState<ChartCrosshair | null>(null);
  const [showMyComments, setShowMyComments] = useState(false);

  useEffect(() => { localStorage.setItem("userComments", JSON.stringify(userComments)); }, [userComments]);

  const activeAsset = useMemo(() => ASSETS.find((a) => a.id === selectedAssetId) || ASSETS[0], [selectedAssetId]);
  const fallbackData = useMemo(() => {
    const data = getAssetData(selectedAssetId);
    return data[timeframe] || data["1D"] || [];
  }, [selectedAssetId, timeframe]);
  const activeTranslations = useMemo(() => getMockTranslations(selectedAssetId) as any as NewsOrConsensusPoint[], [selectedAssetId]);

  const {
    chartData: activeData,
    price: livePrice,
    change: liveChange,
    isUp: liveIsUp,
    isLive,
    isLoading: isMarketLoading,
    refresh: refreshMarketData,
  } = useMarketData({
    assetId: selectedAssetId,
    timeframe,
    fallbackData,
    fallbackPrice: activeAsset.price,
    fallbackChange: activeAsset.change,
    fallbackIsUp: activeAsset.isUp,
  });

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`http://localhost:3001/api/market/search?q=${searchQuery}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddExternalAsset = useCallback(async (quote: any) => {
    const exists = ASSETS.find((a) => a.id === quote.symbol);
    if (exists) {
      if (!watchlistAssets.includes(exists.id)) {
        setWatchlistAssets((prev) => {
          const newW = [...prev, exists.id];
          localStorage.setItem("watchlistAssets", JSON.stringify(newW));
          return newW;
        });
      }
      setSelectedAssetId(exists.id);
      setActiveTab("dashboard");
    } else {
      const newAsset = {
        id: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        symbol: quote.symbol,
        category: quote.quoteType === "CRYPTOCURRENCY" ? "Crypto" : quote.quoteType === "INDEX" ? "Indices" : "Stocks",
        price: 0,
        change: "0%",
        isUp: true,
        data: {
          "1D": Array(20).fill(0),
          "1W": Array(20).fill(0),
          "1M": Array(20).fill(0),
          "1Y": Array(20).fill(0),
        },
      };
      ASSETS.push(newAsset);
      setWatchlistAssets((prev) => {
        const newW = [...prev, newAsset.id];
        localStorage.setItem("watchlistAssets", JSON.stringify(newW));
        return newW;
      });
      setSelectedAssetId(newAsset.id);
      setActiveTab("dashboard");
      try {
        const res = await fetch(`http://localhost:3001/api/market/quote?symbol=${quote.symbol}`);
        if (res.ok) {
          const data = await res.json();
          newAsset.price = data.price;
          newAsset.change = data.change;
          newAsset.isUp = data.isUp;
        }
      } catch (e) {
        console.error("Fetch quote err", e);
      }
    }
  }, [watchlistAssets]);

  useEffect(() => { setAiAnalysis(null); setChartCrosshair(null); }, [selectedAssetId]);
  useEffect(() => { setChartCrosshair(null); }, [timeframe]);
  useEffect(() => { localStorage.setItem("watchlistAssets", JSON.stringify(watchlistAssets)); }, [watchlistAssets]);
  useEffect(() => { localStorage.setItem("pinnedAssets", JSON.stringify(pinnedAssets)); }, [pinnedAssets]);

  const activeUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId && c.timeframe === timeframe), [userComments, selectedAssetId, timeframe]);
  const allAssetUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId), [userComments, selectedAssetId]);

  // Chart math for sentimentClusters computation
  const minVal = activeData.length > 0 ? Math.min(...activeData) * 0.995 : 0;
  const maxVal = activeData.length > 0 ? Math.max(...activeData) * 1.005 : 1;

  const sentimentClusters = useMemo(() => {
    if (activeUserComments.length === 0) return [];
    const priceRange = maxVal - minVal;
    const clusterThreshold = priceRange * 0.08;
    const sorted = [...activeUserComments].sort((a, b) => (a.price || 0) - (b.price || 0));
    const clusters: Array<{ comments: typeof activeUserComments; avgPrice: number; avgIdx: number; sentiment: "Positive" | "Negative" | "Neutral"; count: number; translation?: string }> = [];
    let current = { comments: [sorted[0]], priceSum: sorted[0].price || 0, idxSum: sorted[0].chartIndex || 0 };
    for (let i = 1; i < sorted.length; i++) {
      const price = sorted[i].price || 0;
      const avgPrice = current.priceSum / current.comments.length;
      if (Math.abs(price - avgPrice) < clusterThreshold) {
        current.comments.push(sorted[i]);
        current.priceSum += price;
        current.idxSum += sorted[i].chartIndex || 0;
      } else {
        const avgP = current.priceSum / current.comments.length;
        const avgI = Math.round(current.idxSum / current.comments.length);
        const pos = current.comments.filter(c => c.sentiment === "Positive").length;
        const neg = current.comments.filter(c => c.sentiment === "Negative").length;
        const dominant: "Positive" | "Negative" | "Neutral" = pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
        clusters.push({ 
          comments: current.comments, 
          avgPrice: avgP, 
          avgIdx: avgI, 
          sentiment: dominant, 
          count: current.comments.length,
          translation: current.comments[0]?.text
        });
        current = { comments: [sorted[i]], priceSum: price, idxSum: sorted[i].chartIndex || 0 };
      }
    }
    const avgP = current.priceSum / current.comments.length;
    const avgI = Math.round(current.idxSum / current.comments.length);
    const pos = current.comments.filter(c => c.sentiment === "Positive").length;
    const neg = current.comments.filter(c => c.sentiment === "Negative").length;
    const dominant: "Positive" | "Negative" | "Neutral" = pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
    clusters.push({ 
      comments: current.comments, 
      avgPrice: avgP, 
      avgIdx: avgI, 
      sentiment: dominant, 
      count: current.comments.length,
      translation: current.comments[0]?.text
    });
    return clusters.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [activeUserComments, minVal, maxVal]);

  const getX = (i: number) => activeData.length > 1 ? 4 + (i / (activeData.length - 1)) * 92 : 50;
  const getY = (v: number) => { const range = (maxVal - minVal) || 1; return 8 + (100 - ((v - minVal) / range) * 100) * 0.84; };

  const handleChartTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (chartCrosshair) { setChartCrosshair(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const idx = Math.round(((xPct - 4) / 92) * (activeData.length - 1));
    const clampedIdx = Math.max(0, Math.min(activeData.length - 1, idx));
    const price = activeData[clampedIdx];
    setChartCrosshair({ idx: clampedIdx, price, x: getX(clampedIdx), y: getY(price) });
    setSelectedPoint(null);
  };

  const openCommentSheet = (overrideIdx?: number) => {
    const idx = overrideIdx ?? chartCrosshair?.idx;
    if (idx === undefined) return;
    setCommentChartIdx(idx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    const newComment: UserComment = {
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: commentChartIdx,
      price: activeData[commentChartIdx],
      text: commentText.trim(),
      sentiment: commentSentiment as "Positive" | "Negative" | "Neutral",
      timestamp: Date.now(),
    };
    setUserComments((prev) => [newComment, ...prev]);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const deleteComment = (id: string) => {
    setUserComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePointClick = (point: SentimentCluster | NewsOrConsensusPoint) => {
    const pt = point as unknown as DetailedPointData;
    const isSame = (pt.idx !== undefined && selectedPoint?.idx === pt.idx) || (pt.avgIdx !== undefined && selectedPoint?.avgIdx === pt.avgIdx);
    if (isSame) {
      setDetailedPoint(pt);
    } else {
      setSelectedPoint(pt);
      setSentimentFilter("All");
    }
  };

  const handleSplashClick = () => {
    setIsSplashPressed(true);
    setTimeout(() => {
      setIsExitingSplash(true);
      setTimeout(() => setShowSplash(false), 700);
    }, 1200);
  };

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiAnalysis(
        `${activeAsset.name} is currently trading at $${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} with a ${liveChange} change. ` +
        `Market sentiment appears ${liveIsUp ? "bullish" : "bearish"} in the short term. ` +
        `Key support and resistance levels should be monitored for potential breakout or breakdown scenarios.`
      );
      setIsAnalyzing(false);
    }, 1500);
  };

  const containerStyle = containerHeight ? { height: containerHeight } : { minHeight: "100vh" };

  // Splash
  if (showSplash) {
    return (
      <div className="bg-[var(--mp-bg)] flex justify-center overflow-x-hidden" style={containerStyle}>
        <div className="w-full max-w-[430px] relative overflow-hidden" style={containerStyle}>
          <SplashScreen isExitingSplash={isExitingSplash} isSplashPressed={isSplashPressed} onSplashClick={handleSplashClick} t={t} />
        </div>
      </div>
    );
  }

  // Onboarding
  if (!isLoggedIn) {
    return (
      <div className="bg-[var(--mp-bg)] flex justify-center overflow-x-hidden" style={containerStyle}>
        <div className="w-full max-w-[430px] relative overflow-hidden" style={containerStyle}>
          <OnboardingScreen onLogin={() => setIsLoggedIn(true)} language={language} setLanguage={setLanguage} t={t} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--mp-bg)] flex justify-center overflow-x-hidden" style={containerStyle}>
      <GlobalSVGDefs />
      <div className="w-full max-w-[430px] text-foreground font-sans selection:bg-[var(--mp-cyan)]/30 relative shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in fade-in duration-700 overflow-x-hidden overflow-y-hidden" style={containerStyle}>
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${APP_ASSETS.mainBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />

        {/* Header */}
        <header
          className="absolute top-0 inset-x-0 z-[100] px-6 pt-12 pb-4"
          style={{
            background: "rgba(5, 5, 8, 0.55)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
              <img src={APP_ASSETS.headerLogo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <div className="flex flex-col justify-center h-10">
                <div className="flex items-baseline gap-1.5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] transition-all">
                  <span className="text-[20px] font-thin text-white/90 tracking-tighter leading-none">{t.market}</span>
                  <span className="text-[20px] font-bold text-foreground tracking-tighter leading-none">{t.pulse}</span>
                </div>
                <span className="text-[7.5px] font-medium text-white/40 tracking-[0.25em] uppercase mt-1.5 leading-none">{t.slogan}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[14px] border border-white/[0.06] flex items-center justify-center bg-[#07080C]/60 backdrop-blur-[50px] cursor-pointer hover:bg-white/[0.07] transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]" onClick={() => setIsSearchActive(!isSearchActive)}>
              <Search className="w-4 h-4 text-white/70" strokeWidth={2.2} />
            </div>
          </div>
        </header>

        {/* Search Dropdown */}
        <AnimatePresence>
          {isSearchActive && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchActive(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]" />
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[110px] inset-x-0 px-6 z-[145] bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl max-h-[500px] overflow-y-auto">
                <div className="py-6 max-w-2xl mx-auto">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mp-text-secondary)]" />
                    <input type="text" placeholder={language === "Turkish" ? "Kripto, hisse, borsa ara..." : "Search crypto, stocks, exchanges..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-base text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors shadow-inner" autoFocus />
                  </div>
                  {searchQuery.length > 0 && (
                    <motion.div className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                          },
                        },
                      }}
                    >
                      {/* Local Assets */}
                      <div className="space-y-2">
                        {ASSETS.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => (
                          <motion.div 
                            key={asset.id} 
                            onClick={() => { setSelectedAssetId(asset.id); setIsSearchActive(false); setSearchQuery(""); }} 
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors border border-white/[0.05]"
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-black text-[var(--mp-cyan)]">{asset.id[0]}</div>
                              <div>
                                <div className="text-sm font-bold text-foreground">{asset.name}</div>
                                <div className="text-xs text-white/40">{asset.symbol} • {asset.category}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${asset.isUp ? "text-[var(--mp-green)]" : "text-[var(--mp-red)]"}`}>${asset.price.toFixed(2)}</div>
                              <div className={`text-xs font-bold ${asset.isUp ? "text-[var(--mp-green)]" : "text-[var(--mp-red)]"}`}>{asset.change}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Global Markets (from backend) */}
                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          <div className="px-1 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 mb-2">
                            {language === "Turkish" ? "Küresel Piyasalar" : "Global Markets"}
                          </div>
                          {searchResults
                            .filter(q => !ASSETS.some(a => a.id === q.symbol)) // Don't show duplicates
                            .map((quote) => (
                              <motion.div 
                                key={quote.symbol} 
                                onClick={() => { handleAddExternalAsset(quote); setIsSearchActive(false); setSearchQuery(""); }} 
                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors border border-white/[0.05]"
                                variants={{
                                  hidden: { opacity: 0, y: 10 },
                                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.08] uppercase text-white/60">{quote.symbol[0]}</div>
                                  <div>
                                    <div className="text-sm font-bold text-foreground max-w-[160px] truncate">{quote.shortname || quote.longname || quote.symbol}</div>
                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{quote.symbol} {quote.quoteType ? `• ${quote.quoteType}` : ""}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[var(--mp-cyan)]">
                                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      )}

                      {/* No Results */}
                      {isSearching && searchResults.length === 0 && (
                        <div className="text-center py-8 text-white/20 text-xs animate-pulse">
                          {language === "Turkish" ? "Aranıyor..." : "Searching..."}
                        </div>
                      )}
                      
                      {!isSearching && searchResults.length === 0 && ASSETS.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-8 text-white/30">{language === "Turkish" ? "Varlık bulunamadı" : "No assets found"}</div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Side Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[150]" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.25, ease: "easeOut" }} className="absolute top-0 left-0 bottom-0 w-[300px] bg-black/80 backdrop-blur-xl border-r border-white/[0.05] z-[160] p-6 flex flex-col">
                <div className="flex items-center justify-between mb-8 mt-6">
                  <div className="flex items-center gap-2">
                    <img src={APP_ASSETS.tabLogo} alt="Market Pulse" className="w-7 h-7 object-contain" />
                    <h2 className="text-xl font-black tracking-tight uppercase">Menu</h2>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-white/70" /></button>
                </div>
                <div className="flex items-center justify-between px-2 mt-4 mb-2">
                  <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest">Pinned Assets</div>
                  <button onClick={(e) => { e.stopPropagation(); setIsEditPinned(!isEditPinned); }} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${isEditPinned ? "bg-foreground text-background border-foreground" : "bg-white/5 text-foreground border-white/10"}`}>
                    {isEditPinned ? "Done" : "Edit"}
                  </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                  {isEditPinned ? (
                    <>
                      <div className="px-2 mb-2 mt-2">
                        <div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">{t.currentlyPinned}</div>
                        <div className="flex flex-col gap-2">
                          {ASSETS.filter((a) => pinnedAssets.includes(a.id)).map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.03]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
                                <div className="text-left"><div className="font-bold text-[14px]">{asset.id}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div></div>
                              </div>
                              <button onClick={() => setPinnedAssets(pinnedAssets.filter((id) => id !== asset.id))} className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--mp-red)] text-background shadow-sm hover:scale-110 transition-transform"><X className="w-3.5 h-3.5" strokeWidth={3} /></button>
                            </div>
                          ))}
                          {pinnedAssets.length === 0 && <div className="text-[10px] text-white/30 italic px-4 py-2">{t.noAssetsPinned}</div>}
                        </div>
                      </div>
                      <div className="px-2 mb-4 mt-6">
                        <div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">{t.addMoreAssets}</div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input type="text" placeholder={t.searchToAdd} value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[12px] focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {menuSearch.length > 0 && ASSETS.filter((asset) => !pinnedAssets.includes(asset.id) && (asset.id.toLowerCase().includes(menuSearch.toLowerCase()) || asset.name.toLowerCase().includes(menuSearch.toLowerCase()))).slice(0, 10).map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
                              <div className="text-left"><div className="font-bold text-[14px]">{asset.id}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div></div>
                            </div>
                            <button onClick={() => { setPinnedAssets([...pinnedAssets, asset.id]); setMenuSearch(""); }} className="w-6 h-6 rounded-full flex items-center justify-center mp-gradient-badge text-background shadow-sm hover:scale-110 transition-transform"><Plus className="w-3.5 h-3.5" strokeWidth={3} /></button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    ASSETS.filter((a) => pinnedAssets.includes(a.id)).map((asset) => (
                      <button key={asset.id} onClick={() => { setSelectedAssetId(asset.id); setIsMenuOpen(false); setActiveTab("dashboard"); }} className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${selectedAssetId === asset.id ? "bg-white/10 border border-white/[0.05]" : "hover:bg-white/5"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
                          <div className="text-left"><div className="font-bold text-[14px]">{asset.id}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div></div>
                        </div>
                        <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* 3D Drum Wheel Asset Picker */}
          {isAssetPickerOpen && (
            <AssetWheelPicker
              key="asset-picker"
              assets={ASSETS.filter(a => watchlistAssets.includes(a.id))}
              selectedAssetId={selectedAssetId}
              onSelect={(id) => { setSelectedAssetId(id); setIsAssetPickerOpen(false); }}
              onClose={() => setIsAssetPickerOpen(false)}
            />
          )}

        </AnimatePresence>

        {/* Main Content */}
        <main className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <AnimatePresence mode="wait">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--mp-cyan)] border-t-transparent rounded-full animate-spin" /></div>}>
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
              <DashboardTab
                language={language}
                t={t}
                activeAsset={activeAsset}
                activeData={activeData}
                livePrice={livePrice}
                liveChange={liveChange}
                liveIsUp={liveIsUp}
                isLive={isLive}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                chartExpanded={chartExpanded}
                setChartExpanded={setChartExpanded}
                showNewsBubbles={showNewsBubbles}
                setShowNewsBubbles={setShowNewsBubbles}
                showAIConsensus={showAIConsensus}
                setShowAIConsensus={setShowAIConsensus}
                activeTranslations={activeTranslations}
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
                sentimentClusters={sentimentClusters}
                chartCrosshair={chartCrosshair}
                setChartCrosshair={setChartCrosshair}
                handleChartTap={handleChartTap}
                openCommentSheet={openCommentSheet}
                handlePointClick={handlePointClick}
                isAnalyzing={isAnalyzing}
                aiAnalysis={aiAnalysis}
                generateAIAnalysis={generateAIAnalysis}
                setShowMyComments={setShowMyComments}
                activeUserComments={activeUserComments}
                setIsMenuOpen={setIsMenuOpen}
                setIsAssetPickerOpen={setIsAssetPickerOpen}
              />
            )}

            {/* MARKETS TAB (Combined Watchlist & All Markets) */}
            {activeTab === "markets" && (
              <motion.div key="markets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
                <div className="flex items-center justify-between mb-6 mt-2">
                  <h2 className="text-2xl font-black tracking-tight uppercase">{t.markets}</h2>
                  {marketsSubTab === "watchlist" && (
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/[0.05]">
                      <button onClick={() => setWatchlistLayout("list")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "list" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}><List className="w-4 h-4" /></button>
                      <button onClick={() => setWatchlistLayout("grid")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "grid" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* Sub-tab toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/[0.05]">
                  <button onClick={() => setMarketsSubTab("watchlist")} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors ${marketsSubTab === "watchlist" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                    {t.watchlist || "Watchlist"}
                  </button>
                  <button onClick={() => setMarketsSubTab("all")} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors ${marketsSubTab === "all" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                    {language === "Turkish" ? "Tüm Piyasalar" : "All Markets"}
                  </button>
                </div>

                {marketsSubTab === "watchlist" ? (
                  /* Watchlist Content */
                  watchlistLayout === "list" ? (
                    <motion.div className="flex flex-col gap-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                    >
                      {ASSETS.filter((a) => watchlistAssets.includes(a.id)).map((asset) => (
                        <motion.div key={asset.id}
                          variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
                          onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                          className="mp-glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/[0.05]">{asset.id[0]}</div>
                            <div><div className="font-bold text-[15px]">{asset.name}</div><div className="text-[11px] text-[var(--mp-text-secondary)] font-medium uppercase tracking-wider">{asset.symbol}</div></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                            <div className="text-right min-w-[70px]">
                              <div className="font-bold text-[15px]">${asset.price.toLocaleString()}</div>
                              <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${asset.change.startsWith("+") ? "mp-positive-badge" : asset.change.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>{asset.change}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div className="grid grid-cols-2 gap-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                    >
                      {ASSETS.filter((a) => watchlistAssets.includes(a.id)).map((asset) => (
                        <motion.div key={asset.id}
                          variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
                          onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                          className="mp-glass-card rounded-[20px] p-4 flex flex-col hover:bg-black/30 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-8 h-8 rounded-[10px] bg-white/5 flex items-center justify-center font-bold text-xs border border-white/[0.05]">{asset.id[0]}</div>
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${asset.isUp ? "mp-positive-badge" : "mp-negative-badge"}`}>{asset.change}</div>
                          </div>
                          <div className="mb-2"><div className="font-bold text-[14px] leading-tight truncate">{asset.name}</div><div className="text-[9px] text-[var(--mp-text-secondary)] uppercase tracking-widest">{asset.symbol}</div></div>
                          <div className="mt-auto">
                            <div className="font-black text-[16px] mb-1">${asset.price.toLocaleString()}</div>
                            <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                ) : (
                  /* All Markets Content (Discover) */
                  <div className="flex flex-col gap-8 pb-8">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        placeholder={language === "Turkish" ? "Hisse, coin veya kategori ara..." : "Search assets, symbols or categories..."}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[14px] focus:outline-none focus:border-[var(--mp-cyan)]/50 focus:bg-white/[0.05] transition-all font-medium placeholder:text-white/20 shadow-inner" 
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {searchQuery.length > 0 ? (
                      /* Search Results */
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--mp-text-secondary)] mb-4 px-1">{language === "Turkish" ? "Arama Sonuçları" : "Search Results"}</h3>
                        <div className="flex flex-col bg-white/[0.02] border border-white/[0.05] rounded-[28px] overflow-hidden shadow-lg backdrop-blur-sm">
                          {isSearching ? (
                            <div className="text-center text-white/40 py-12 text-[14px] font-medium animate-pulse">{language === "Turkish" ? "Küresel piyasalar aranıyor..." : "Searching global markets..."}</div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((quote) => {
                              const isWatchlisted = watchlistAssets.includes(quote.symbol);
                              return (
                                <div key={quote.symbol} className="flex items-center justify-between p-4 hover:bg-white/[0.05] transition-colors cursor-pointer border-b border-white/[0.02] last:border-0 group">
                                  <div className="flex items-center gap-4 flex-1" onClick={() => handleAddExternalAsset(quote)}>
                                    <div className="w-11 h-11 rounded-[14px] bg-white/[0.04] flex items-center justify-center font-black text-[14px] border border-white/[0.08] shadow-inner group-hover:border-white/20 transition-colors uppercase">{quote.symbol[0]}</div>
                                    <div>
                                      <div className="text-[16px] font-bold text-foreground mb-0.5 max-w-[180px] truncate">{quote.shortname || quote.longname || quote.symbol}</div>
                                      <div className="text-[11px] text-[var(--mp-text-secondary)] font-bold uppercase tracking-widest">{quote.symbol} {quote.exchDisp ? `· ${quote.exchDisp}` : ''}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-5">
                                    <button onClick={(e) => { e.stopPropagation(); handleAddExternalAsset(quote); }} className={`p-2.5 rounded-xl transition-all ${isWatchlisted ? "bg-[var(--mp-cyan)]/10 border border-[var(--mp-cyan)]/30 text-[var(--mp-cyan)]" : "bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10"}`}>
                                      <Plus className={`w-4 h-4 transition-transform duration-300 ${isWatchlisted ? "rotate-45" : ""}`} strokeWidth={3} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center text-white/40 py-12 text-[14px] font-medium">{language === "Turkish" ? "Araştırdığınız kriterlere uygun sonuç bulunamadı." : "No results found for your search."}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Compact Top Movers */}
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--mp-text-secondary)] mb-3 px-1">{language === "Turkish" ? "Günün Özeti" : "Market Overview"}</h3>
                          <motion.div className="flex flex-col gap-2"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                          >
                            {[...ASSETS].sort((a,b) => parseFloat(b.change) - parseFloat(a.change)).slice(0,1).map((asset) => (
                               <motion.div key={`gainer-${asset.id}`}
                                 variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
                                 onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                                 className="mp-glass-card rounded-[18px] p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-l-2 border-l-[var(--mp-cyan)]"
                               >
                                 <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 shadow-inner flex items-center justify-center"><TrendingUp className="w-5 h-5" stroke="url(#mpIconGrad)" /></div>
                                   <div><div className="font-bold text-[14px] text-foreground tracking-wider">{asset.symbol}</div><div className="text-[10px] text-[var(--mp-text-secondary)] font-bold uppercase tracking-wider mt-0.5">{language === "Turkish" ? "En Yüksek Kazanç" : "Top Gainer"}</div></div>
                                 </div>
                                 <div className="text-right">
                                   <div className="text-[15px] font-black text-foreground mb-0.5">${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                   <div className="text-[11px] font-black mp-positive-badge px-2.5 py-0.5 rounded-full inline-block">{asset.change}</div>
                                 </div>
                               </motion.div>
                            ))}
                            {[...ASSETS].sort((a,b) => parseFloat(a.change) - parseFloat(b.change)).slice(0,1).map((asset) => (
                               <motion.div key={`loser-${asset.id}`}
                                 variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
                                 onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                                 className="mp-glass-card rounded-[18px] p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-l-2 border-l-[#FF3B3B]"
                               >
                                 <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 shadow-inner flex items-center justify-center"><TrendingDown className="w-5 h-5 text-[var(--mp-red)]" /></div>
                                   <div><div className="font-bold text-[14px] text-foreground tracking-wider">{asset.symbol}</div><div className="text-[10px] text-[var(--mp-text-secondary)] font-bold uppercase tracking-wider mt-0.5">{language === "Turkish" ? "En Yüksek Düşüş" : "Top Loser"}</div></div>
                                 </div>
                                 <div className="text-right">
                                   <div className="text-[15px] font-black text-foreground mb-0.5">${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                   <div className="text-[11px] font-black mp-negative-badge px-2.5 py-0.5 rounded-full inline-block">{asset.change}</div>
                                 </div>
                               </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        {/* Popular Categories */}
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--mp-text-secondary)] mb-4 px-1">{language === "Turkish" ? "Kategoriler" : "Discover"}</h3>
                          <motion.div className="grid grid-cols-2 gap-3"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                          >
                            {["Crypto", "Stocks", "Commodities"].map((category) => {
                              const categoryLabel = category === "Stocks" ? t.stocks : category === "Commodities" ? t.commodities : t.crypto;
                              return (
                                <motion.div
                                  key={category}
                                  variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
                                  onClick={() => setSearchQuery(category.toLowerCase())}
                                  className="bg-black/40 backdrop-blur-2xl border border-transparent rounded-[28px] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-black/60 transition-all group relative overflow-hidden"
                                  style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)" }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="text-[17px] font-black text-foreground tracking-widest transition-colors relative z-10 drop-shadow-md">{categoryLabel}</div>
                                  <div className="text-[9px] font-black text-white/60 uppercase mt-3 bg-black/40 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 rounded-full group-hover:bg-white/10 group-hover:text-white transition-all relative z-10" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>Explore</div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* COMMUNITY TAB */}
            {activeTab === "community" && (
              <CommunityTab
                language={language}
                t={t}
                communityTab={communityTab}
                setCommunityTab={setCommunityTab}
                commentsExpanded={commentsExpanded}
                setCommentsExpanded={setCommentsExpanded}
                commentsTimeframe={commentsTimeframe}
                setCommentsTimeframe={setCommentsTimeframe}
                setSelectedAssetId={setSelectedAssetId}
                setActiveTab={setActiveTab}
              />
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <ProfileTab
                language={language}
                t={t}
                profilePage={profilePage}
                setProfilePage={setProfilePage}
                profilePicture={profilePicture}
                userComments={userComments}
                deleteComment={deleteComment}
                watchlistAssets={watchlistAssets}
                pinnedAssets={pinnedAssets}
                autoTranslate={autoTranslate}
                setAutoTranslate={setAutoTranslate}
                showLanguageMenu={showLanguageMenu}
                setShowLanguageMenu={setShowLanguageMenu}
                languageButtonRef={languageButtonRef}
                langMenuPos={langMenuPos}
                setLanguage={setLanguage}
                setIsLoggedIn={setIsLoggedIn}
                handleProfilePicture={handleProfilePicture}
              />
            )}
          </Suspense>
        </AnimatePresence>
      </main>

        {/* Sheets */}
        <Suspense fallback={null}>
          <CommentSheet
            showCommentSheet={showCommentSheet}
            setShowCommentSheet={setShowCommentSheet}
            language={language}
            activeAsset={activeAsset}
            commentChartIdx={commentChartIdx}
            activeData={activeData}
            commentSentiment={commentSentiment}
            setCommentSentiment={setCommentSentiment}
            commentText={commentText}
            setCommentText={setCommentText}
            submitComment={submitComment}
          />
        </Suspense>

        <Suspense fallback={null}>
          <MyCommentsSheet
            showMyComments={showMyComments}
            setShowMyComments={setShowMyComments}
            language={language}
            activeAsset={activeAsset}
            allAssetUserComments={allAssetUserComments}
            deleteComment={deleteComment}
          />
        </Suspense>

        <Suspense fallback={null}>
          <DetailedPointSheet
            detailedPoint={detailedPoint}
            setDetailedPoint={setDetailedPoint}
            setSelectedPoint={setSelectedPoint}
            language={language}
            t={t}
            sentimentFilter={sentimentFilter}
            setSentimentFilter={setSentimentFilter}
            activeUserComments={activeUserComments}
            deleteComment={deleteComment}
          />
        </Suspense>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-6 inset-x-6 z-[140]">
          <div
            className="relative flex items-stretch rounded-[30px] overflow-hidden border border-white/[0.09]"
            style={{
              background: "rgba(7, 9, 15, 0.42)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.08)",
                "inset 0 -1px 0 rgba(0,0,0,0.4)",
                "0 -6px 24px rgba(0,0,0,0.5)",
                "0 12px 40px rgba(0,0,0,0.7)",
              ].join(", "),
            }}
          >
            {[
              { id: "dashboard", icon: null, isLogo: true, label: language === "Turkish" ? "Ana Sayfa" : "Home" },
              { id: "markets", icon: Globe, isLogo: false, label: language === "Turkish" ? "Piyasalar" : "Markets" },
              { id: "community", icon: Users, isLogo: false, label: language === "Turkish" ? "Topluluk" : "Community" },
              { id: "profile", icon: Settings, isLogo: false, label: language === "Turkish" ? "Ayarlar" : "Settings" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setProfilePage(null); }}
                  className="flex-1 flex flex-col items-center justify-center gap-[5px] py-3 px-1 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navHalo"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "radial-gradient(ellipse 50% 75% at 50% 0%, rgba(160,255,235,0.30) 0%, rgba(80,230,200,0.12) 40%, rgba(40,200,170,0.03) 65%, transparent 80%)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <div className="relative flex items-center justify-center">
                    {tab.isLogo ? (
                      <img
                        src="/images/Logo_Market_Pulse_Minimalist.png"
                        alt="Home"
                        className={`w-[22px] h-[22px] object-contain relative z-10 transition-all duration-300 ${isActive ? "opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-45"}`}
                      />
                    ) : (
                      <tab.icon
                        className={`w-[21px] h-[21px] relative z-10 transition-all duration-300 ${isActive ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" : "text-white/45"}`}
                        strokeWidth={isActive ? 2.4 : 1.9}
                      />
                    )}
                  </div>
                  <span className={`text-[9px] font-medium tracking-[0.03em] relative z-10 transition-all duration-300 ${isActive ? "text-white/90" : "text-white/40"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
