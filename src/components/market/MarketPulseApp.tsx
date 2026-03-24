import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, Search, Globe, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  MessageCircle, X, Plus, Brain, User, Users, Bell, Shield, LogOut, Home, List, Heart,
  Share2, Newspaper, Send, Edit3, Trash2, ExternalLink, Settings, Wifi, WifiOff,
  Reply, CornerDownRight
} from "lucide-react";
import { ASSETS, APP_ASSETS, COMMUNITY_POSTS, getMockTranslations, getAssetData } from "@/data/assets";
import { TRANSLATIONS } from "@/data/translations";
import { UserComment, DetailedPointData, ChartCrosshair, SentimentCluster, TranslationStrings } from "@/types";
import { Sparkline } from "@/components/market/Sparkline";
import { NotifToggle } from "@/components/market/NotifToggle";
import { SplashScreen } from "@/components/market/SplashScreen";
import { OnboardingScreen } from "@/components/market/OnboardingScreen";
import { useMarketData } from "@/hooks/useMarketData";
import { DashboardTab } from "@/components/market/tabs/DashboardTab";
import { CommunityTab } from "@/components/market/tabs/CommunityTab";
import { ProfileTab } from "@/components/market/tabs/ProfileTab";
// Lazy load sheets for better performance
const CommentSheet = React.lazy(() => import("@/components/market/sheets/CommentSheet").then(m => ({ default: m.CommentSheet })));
const MyCommentsSheet = React.lazy(() => import("@/components/market/sheets/MyCommentsSheet").then(m => ({ default: m.MyCommentsSheet })));
const DetailedPointSheet = React.lazy(() => import("@/components/market/sheets/DetailedPointSheet").then(m => ({ default: m.DetailedPointSheet })));

export default function MarketPulseApp({ containerHeight }: { containerHeight?: number } = {}) {
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");
  const [selectedPoint, setSelectedPoint] = useState<DetailedPointData | null>(null);
  const [detailedPoint, setDetailedPoint] = useState<DetailedPointData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const [trendingExpanded, setTrendingExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [trendingTimeframe, setTrendingTimeframe] = useState("Daily");
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
  const activeTranslations = useMemo(() => getMockTranslations(selectedAssetId), [selectedAssetId]);

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
    const clusters: Array<{ comments: typeof activeUserComments; avgPrice: number; avgIdx: number; sentiment: string; count: number }> = [];
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
        const dominant = pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
        clusters.push({ comments: current.comments, avgPrice: avgP, avgIdx: avgI, sentiment: dominant, count: current.comments.length });
        current = { comments: [sorted[i]], priceSum: price, idxSum: sorted[i].chartIndex || 0 };
      }
    }
    const avgP = current.priceSum / current.comments.length;
    const avgI = Math.round(current.idxSum / current.comments.length);
    const pos = current.comments.filter(c => c.sentiment === "Positive").length;
    const neg = current.comments.filter(c => c.sentiment === "Negative").length;
    const dominant = pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
    clusters.push({ comments: current.comments, avgPrice: avgP, avgIdx: avgI, sentiment: dominant, count: current.comments.length });
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

  const openCommentSheet = () => {
    if (!chartCrosshair) return;
    setCommentChartIdx(chartCrosshair.idx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    const newComment = {
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: commentChartIdx,
      price: activeData[commentChartIdx],
      text: commentText.trim(),
      sentiment: commentSentiment,
      timestamp: new Date().toISOString(),
      user: "@You",
      likes: 0,
    };
    setUserComments((prev) => [newComment, ...prev]);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const deleteComment = (id: string) => {
    setUserComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePointClick = (point: SentimentCluster) => {
    if (selectedPoint?.avgIdx === point.avgIdx) {
      setDetailedPoint(point as unknown as DetailedPointData);
    } else {
      setSelectedPoint(point as unknown as DetailedPointData);
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
        `${activeAsset.name} is currently trading at $${activeAsset.price.toLocaleString()} with a ${activeAsset.change} change. ` +
        `Market sentiment appears ${activeAsset.isUp ? "bullish" : "bearish"} in the short term. ` +
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
                    <div className="space-y-2">
                      {ASSETS.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => (
                        <div key={asset.id} onClick={() => { setSelectedAssetId(asset.id); setIsSearchActive(false); setSearchQuery(""); }} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors border border-white/[0.05]">
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
                        </div>
                      ))}
                      {ASSETS.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-8 text-white/30">{language === "Turkish" ? "Varlık bulunamadı" : "No assets found"}</div>
                      )}
                    </div>
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
        </AnimatePresence>

        {/* Main Content */}
        <main className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ paddingTop: '110px', paddingBottom: '90px' }}>
          <AnimatePresence mode="wait">
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
              />
            )}

            {/* WATCHLIST TAB */}
            {activeTab === "watchlist" && (
              <motion.div key="watchlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
                <div className="flex items-center justify-between mb-8 mt-2">
                  <h2 className="text-2xl font-black tracking-tight uppercase">{t.watchlist}</h2>
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/[0.05]">
                    <button onClick={() => setWatchlistLayout("list")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "list" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setWatchlistLayout("grid")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "grid" ? "bg-white/10 text-foreground" : "text-[var(--mp-text-secondary)]"}`}><Activity className="w-4 h-4" /></button>
                  </div>
                </div>
                {watchlistLayout === "list" ? (
                  <div className="flex flex-col gap-3">
                    {ASSETS.filter((a) => watchlistAssets.includes(a.id)).map((asset) => (
                      <div key={asset.id} onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }} className="mp-glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors cursor-pointer">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {ASSETS.filter((a) => watchlistAssets.includes(a.id)).map((asset) => (
                      <div key={asset.id} onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }} className="mp-glass-card rounded-[24px] p-5 flex flex-col hover:bg-black/30 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/[0.05]">{asset.id[0]}</div>
                          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${asset.isUp ? "mp-positive-badge" : "mp-negative-badge"}`}>{asset.change}</div>
                        </div>
                        <div className="mb-4"><div className="font-bold text-[16px] leading-tight">{asset.name}</div><div className="text-[10px] text-[var(--mp-text-secondary)] uppercase tracking-widest">{asset.symbol}</div></div>
                        <div className="mt-auto">
                          <div className="font-black text-[18px] mb-2">${asset.price.toLocaleString()}</div>
                          <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* MARKETS TAB */}
            {activeTab === "markets" && (
              <motion.div key="markets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
                <h2 className="text-2xl font-black tracking-tight uppercase mb-8 mt-2">{t.markets}</h2>
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mp-text-secondary)]" />
                  <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-11 pr-4 py-4 text-sm text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors" />
                </div>
                {["Stocks", "Commodities", "Crypto"].map((category) => {
                  const categoryAssets = ASSETS.filter((a) => a.category === category && (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (categoryAssets.length === 0) return null;
                  const isExpanded = expandedCategory === category;
                  const categoryLabel = category === "Stocks" ? t.stocks : category === "Commodities" ? t.commodities : t.crypto;
                  return (
                    <div key={category} className="mb-4 bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                      <button onClick={() => setExpandedCategory(isExpanded ? null : category)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
                        <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">{categoryLabel}</h3>
                        <ChevronDown className={`w-5 h-5 text-[var(--mp-text-secondary)] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col">
                            <div className="p-2">
                              {categoryAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer rounded-xl group">
                                  <div className="flex items-center gap-3 flex-1" onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}>
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs border border-white/[0.05]">{asset.id[0]}</div>
                                    <div><div className="text-[14px] font-light text-white/90">{asset.name}</div><div className="text-[10px] text-[var(--mp-text-secondary)] font-medium uppercase tracking-wider">{asset.symbol}</div></div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <button onClick={(e) => { e.stopPropagation(); if (watchlistAssets.includes(asset.id)) { setWatchlistAssets(watchlistAssets.filter((id) => id !== asset.id)); } else { setWatchlistAssets([...watchlistAssets, asset.id]); } }} className={`p-2 rounded-lg transition-colors ${watchlistAssets.includes(asset.id) ? "text-[var(--mp-cyan)]" : "text-white/20 hover:text-white/40"}`}>
                                      <Heart className={`w-4 h-4 ${watchlistAssets.includes(asset.id) ? "fill-[var(--mp-cyan)]" : ""}`} />
                                    </button>
                                    <div className="text-right min-w-[70px]" onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}>
                                      <div className="font-bold text-[14px]">${asset.price.toLocaleString()}</div>
                                      <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${asset.change.startsWith("+") ? "mp-positive-badge" : asset.change.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>{asset.change}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* COMMUNITY TAB */}
            {activeTab === "community" && (
              <CommunityTab
                language={language}
                t={t}
                communityTab={communityTab}
                setCommunityTab={setCommunityTab}
                trendingExpanded={trendingExpanded}
                setTrendingExpanded={setTrendingExpanded}
                commentsExpanded={commentsExpanded}
                setCommentsExpanded={setCommentsExpanded}
                trendingTimeframe={trendingTimeframe}
                setTrendingTimeframe={setTrendingTimeframe}
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
        <nav className="absolute bottom-5 inset-x-5 z-[140]">
          <div
            className="relative flex items-stretch rounded-[22px] overflow-hidden border border-white/[0.09]"
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
            {/* Surface specular light — soldan sağa süpürülen ışık yansıması */}
            <div className="absolute inset-0 overflow-hidden rounded-[22px] pointer-events-none">
              <div
                className="absolute inset-y-0"
                style={{
                  width: "45%",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.025) 30%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0.025) 70%, transparent 100%)",
                  animation: "nav-sweep 7s ease-in-out infinite",
                }}
              />
            </div>
            {[
              { id: "dashboard", icon: null, isLogo: true, label: language === "Turkish" ? "Ana Sayfa" : "Home" },
              { id: "watchlist", icon: List, isLogo: false, label: language === "Turkish" ? "İzleme" : "Watchlist" },
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
