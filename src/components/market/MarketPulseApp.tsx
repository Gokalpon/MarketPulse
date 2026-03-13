import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, Search, Globe, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  MessageCircle, X, Plus, Brain, User, Bell, Shield, LogOut, Home, List, Heart,
  Share2, Newspaper, Send, Edit3, Trash2, Users, Settings
} from "lucide-react";
import { ASSETS, APP_ASSETS, MOCK_TRANSLATIONS, COMMUNITY_POSTS } from "@/data/assets";
import { fetchMarketData, fetchRealTimePrice, fetchQuote } from "@/services/marketData";
import { TRANSLATIONS } from "@/data/translations";
import { Sparkline } from "@/components/market/Sparkline";
import { NotifToggle } from "@/components/market/NotifToggle";
import { SplashScreen } from "@/components/market/SplashScreen";
import { OnboardingScreen } from "@/components/market/OnboardingScreen";

export default function MarketPulseApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [detailedPoint, setDetailedPoint] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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
    const saved = localStorage.getItem("watchlistAssets");
    return saved ? JSON.parse(saved) : ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"];
  });

  const [pinnedAssets, setPinnedAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem("pinnedAssets");
    return saved ? JSON.parse(saved) : ["BTC", "AAPL", "GOLD"];
  });

  const [isEditPinned, setIsEditPinned] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [watchlistLayout, setWatchlistLayout] = useState<"list" | "grid">("list");
  const [showNewsBubbles, setShowNewsBubbles] = useState(true);
  const [showAIConsensus, setShowAIConsensus] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Comment system
  const [userComments, setUserComments] = useState<any[]>(() => {
    try { const s = localStorage.getItem("userComments"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentChartIdx, setCommentChartIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSentiment, setCommentSentiment] = useState("Neutral");
  const [chartCrosshair, setChartCrosshair] = useState<{ idx: number; price: number; x: number; y: number } | null>(null);
  const [showMyComments, setShowMyComments] = useState(false);
  const [commentVotes, setCommentVotes] = useState<Record<string, "up" | "down" | null>>({});

  const voteComment = (commentKey: string, direction: "up" | "down") => {
    setCommentVotes((prev) => ({ ...prev, [commentKey]: prev[commentKey] === direction ? null : direction }));
  };

  useEffect(() => { localStorage.setItem("userComments", JSON.stringify(userComments)); }, [userComments]);

  const [realMarketData, setRealMarketData] = useState<number[] | null>(null);
  const [realTimePrice, setRealTimePrice] = useState<number | null>(null);
  const [realQuote, setRealQuote] = useState<{ price: number; change: number; percentChange: number; isUp: boolean } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const activeAsset = useMemo(() => ASSETS.find((a) => a.id === selectedAssetId) || ASSETS[0], [selectedAssetId]);
  const activeData = useMemo(() => {
    if (realMarketData && realMarketData.length > 0) return realMarketData;
    return activeAsset.data[timeframe] || activeAsset.data["1D"];
  }, [activeAsset, timeframe, realMarketData]);
  const activeTranslations = MOCK_TRANSLATIONS[selectedAssetId] || [];

  useEffect(() => {
    setRealMarketData(null);
    setRealTimePrice(null);
    setRealQuote(null);
    setAiAnalysis(null);
    setChartCrosshair(null);
  }, [selectedAssetId]);

  useEffect(() => {
    let cancelled = false;
    setIsDataLoading(true);
    const symbol = activeAsset.symbol;
    Promise.all([
      fetchMarketData(symbol, timeframe),
      fetchRealTimePrice(symbol),
      fetchQuote(symbol),
    ]).then(([chartData, price, quote]) => {
      if (cancelled) return;
      if (chartData && chartData.length > 0) {
        setRealMarketData(chartData.map((d: any) => d.value));
      }
      if (price) setRealTimePrice(price);
      if (quote) setRealQuote(quote);
      setIsDataLoading(false);
    }).catch(() => { if (!cancelled) setIsDataLoading(false); });
    return () => { cancelled = true; };
  }, [selectedAssetId, timeframe]);
  useEffect(() => { setChartCrosshair(null); }, [timeframe]);
  useEffect(() => { localStorage.setItem("watchlistAssets", JSON.stringify(watchlistAssets)); }, [watchlistAssets]);
  useEffect(() => { localStorage.setItem("pinnedAssets", JSON.stringify(pinnedAssets)); }, [pinnedAssets]);

  const activeUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId && c.timeframe === timeframe), [userComments, selectedAssetId, timeframe]);
  const allAssetUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId), [userComments, selectedAssetId]);

  // Chart math
  const minVal = Math.min(...activeData) * 0.995;
  const maxVal = Math.max(...activeData) * 1.005;
  const range = maxVal - minVal;
  const getX = (i: number) => 4 + (i / (activeData.length - 1)) * 92;
  const getY = (v: number) => 8 + (100 - ((v - minVal) / range) * 100) * 0.84;
  const pathD = activeData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d)}`).join(" ");
  const areaD = `${pathD} L ${getX(activeData.length - 1)} 100 L ${getX(0)} 100 Z`;

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

  const handlePointClick = (point: any) => {
    if (selectedPoint?.idx === point.idx) {
      setDetailedPoint(point);
    } else {
      setSelectedPoint(point);
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

  // Splash
  if (showSplash) {
    return <SplashScreen isExitingSplash={isExitingSplash} isSplashPressed={isSplashPressed} onSplashClick={handleSplashClick} t={t} />;
  }

  // Onboarding
  if (!isLoggedIn) {
    return <OnboardingScreen onLogin={() => setIsLoggedIn(true)} language={language} setLanguage={setLanguage} t={t} />;
  }

  return (
    <div className="min-h-screen bg-[var(--mp-bg)] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-screen text-foreground font-sans selection:bg-[var(--mp-cyan)]/30 relative shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in fade-in duration-700 overflow-x-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${APP_ASSETS.mainBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />

        {/* Header */}
        <header className="absolute top-0 inset-x-0 z-[100] px-6 pt-12 pb-4 bg-black/15 backdrop-blur-[40px] border-b border-white/[0.03]">
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
            <div className="w-9 h-9 rounded-full border border-white/[0.05] flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsSearchActive(!isSearchActive)}>
              <Search className="w-4 h-4 text-white/80" strokeWidth={2} />
            </div>
          </div>
        </header>

        {/* Search Dropdown */}
        <AnimatePresence>
          {isSearchActive && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchActive(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]" />
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[110px] inset-x-0 px-6 py-6 z-[145] bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mp-text-secondary)]" />
                  <input type="text" placeholder="Search assets, profiles..." className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-base text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors shadow-inner" autoFocus />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Side Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[150]" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ willChange: "transform" }} className="absolute top-0 left-0 bottom-0 w-[300px] bg-black/80 backdrop-blur-xl border-r border-white/[0.05] z-[160] p-6 flex flex-col">
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
        <main className="relative z-20 pt-[110px] pb-32">
          <AnimatePresence mode="wait">
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                <div className="px-4 mt-2">
                  <div className="mp-glass-card rounded-[32px] p-6 relative overflow-hidden shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[var(--mp-text-secondary)] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
                        <div className={`text-foreground text-[38px] font-bold tracking-tight leading-none mb-4 transition-opacity ${isDataLoading ? "opacity-40" : "opacity-100"}`}>
                          ${(realTimePrice || realQuote?.price || activeAsset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const pct = realQuote ? `${realQuote.isUp ? "+" : ""}${realQuote.percentChange.toFixed(2)}%` : activeAsset.change;
                            const isUp = realQuote ? realQuote.isUp : activeAsset.change.startsWith("+");
                            return (
                              <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] ${isUp ? "mp-positive-badge" : "mp-negative-badge"}`}>
                                {isUp ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                                {pct}
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${realMarketData ? "bg-[var(--mp-green)] animate-pulse" : "bg-white/20"}`} />
                            <div className="text-[var(--mp-text-secondary)] text-[10px] font-bold tracking-[0.15em] uppercase">{realMarketData ? "LIVE" : t.liveMarket}</div>
                          </div>
                        </div>
                      </div>
                      <div onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                        <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="mt-8 relative h-[240px] w-full" onClick={handleChartTap}>
                      {/* Right price scale */}
                      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between items-end z-10 pointer-events-none pr-1">
                        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                          <span key={t} className="text-[8px] text-white/20 font-medium tabular-nums">
                            {(maxVal - (maxVal - minVal) * t).toLocaleString(undefined, { maximumFractionDigits: activeAsset.price < 10 ? 3 : 0 })}
                          </span>
                        ))}
                      </div>
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#39FF14" /><stop offset="100%" stopColor="#00FFFF" /></linearGradient>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FFFF" stopOpacity="0.1" /><stop offset="100%" stopColor="#00FFFF" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#areaGrad)" />
                        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                        {chartCrosshair && <line x1={chartCrosshair.x} y1="0" x2={chartCrosshair.x} y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" opacity="0.3" />}
                      </svg>

                      {/* Crosshair */}
                      {chartCrosshair && (
                        <div className="absolute z-40" style={{ left: `${chartCrosshair.x}%`, top: `${chartCrosshair.y}%`, transform: "translate(-50%, -50%)" }}>
                          <div className="w-4 h-4 rounded-full bg-foreground border-2 border-[var(--mp-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                          <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-2">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-1.5">
                              <div className="text-[14px] font-bold text-foreground">${chartCrosshair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); openCommentSheet(); }} className="flex items-center gap-1.5 mp-gradient-badge text-background font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.3)] active:scale-95 transition-transform">
                              <Edit3 className="w-3 h-3" strokeWidth={3} />
                              {language === "Turkish" ? "Yorum Yaz" : "Add Comment"}
                            </button>
                          </motion.div>
                        </div>
                      )}

                      {/* Overlay markers */}
                      {(showNewsBubbles || showAIConsensus) && activeTranslations.map((point: any) => {
                        const isSelected = selectedPoint?.idx === point.idx;
                        const xPercent = getX(point.idx);
                        const yPercent = getY(activeData[point.idx]);
                        const isNews = point.type === "news";
                        if (isNews && !showNewsBubbles) return null;
                        if (!isNews && !showAIConsensus) return null;

                        return (
                          <div key={point.idx} className={`absolute flex flex-col items-center justify-center ${isSelected ? "z-30" : "z-20"}`} style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: "translate(-50%, -50%)" }}>
                            <div className="p-4 -m-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}>
                              <div className={`rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${
                                isSelected
                                  ? `w-28 h-28 flex-shrink-0 ${isNews ? "mp-gradient-badge shadow-[0_10px_30px_rgba(0,255,255,0.4)]" : "bg-foreground shadow-[0_10px_30px_rgba(255,255,255,0.3)]"}`
                                  : `w-3 h-3 flex-shrink-0 hover:scale-150 border border-white/20 ${isNews ? "bg-[var(--mp-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.5)]" : "bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.3)]"}`
                              }`}>
                                {isSelected && (
                                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="p-3 text-center flex flex-col items-center justify-center h-full w-full relative">
                                    <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isNews ? "text-background opacity-70" : point.sentiment === "Positive" ? "text-[#00C805]" : point.sentiment === "Negative" ? "text-[var(--mp-red)]" : "text-[#0088FF]"}`}>
                                      {isNews ? t.newsAlert : point.sentiment}
                                    </div>
                                    <div className={`text-[11px] font-bold leading-snug line-clamp-3 ${isNews ? "text-background" : "text-[#0A0C0E]"}`}>{point.translation}</div>
                                    <div className={`absolute bottom-2 ${isNews ? "text-background/50" : "text-black/30"}`}><ChevronRight className="w-3 h-3 rotate-90" strokeWidth={3} /></div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* User comment markers */}
                      {activeUserComments.map((uc) => {
                        const xPct = getX(uc.chartIndex);
                        const yPct = getY(activeData[uc.chartIndex] || uc.price);
                        return (
                          <div key={uc.id} className="absolute z-25" style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -50%)" }}>
                            <div className="p-3 -m-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowMyComments(true); }}>
                              <div className="w-3.5 h-3.5 rounded-full mp-gradient-badge-purple shadow-[0_0_12px_rgba(178,75,243,0.6)]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="px-6 mt-6 flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between w-full">
                    {["1H", "1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
                      <button key={tf} onClick={() => setTimeframe(tf)} className={`flex-1 mx-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${timeframe === tf ? "bg-foreground text-background" : "text-[var(--mp-text-secondary)] hover:text-foreground bg-white/5"}`}>{tf}</button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setShowNewsBubbles(!showNewsBubbles)} className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showNewsBubbles ? "bg-foreground text-background border-foreground" : "bg-white/5 text-white/40 border-white/10"}`}>
                      {showNewsBubbles ? t.hideNews : t.showNews}
                    </button>
                    <button onClick={() => setShowAIConsensus(!showAIConsensus)} className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showAIConsensus ? "bg-foreground text-background border-foreground" : "bg-white/5 text-white/40 border-white/10"}`}>
                      {showAIConsensus ? t.hideConsensus : t.showConsensus}
                    </button>
                    <button onClick={() => setShowMyComments(true)} className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${activeUserComments.length > 0 ? "mp-gradient-badge-purple text-background border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]" : "bg-white/5 text-white/40 border-white/10"}`}>
                      {language === "Turkish" ? `Yorumlarım (${allAssetUserComments.length})` : `My Comments (${allAssetUserComments.length})`}
                    </button>
                  </div>

                  {/* AI Analysis */}
                  <div className="mt-4 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.aiMarketPulse}</span>
                      </div>
                      <button onClick={generateAIAnalysis} disabled={isAnalyzing} className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-foreground text-[9px] font-black uppercase tracking-wider hover:bg-black/50 transition-all disabled:opacity-50">
                        {isAnalyzing ? t.analyzing : t.refreshAnalysis}
                      </button>
                    </div>
                    {aiAnalysis ? (
                      <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-foreground leading-relaxed italic">"{aiAnalysis}"</motion.p>
                    ) : (
                      <p className="text-[11px] text-white/30 italic">{t.tapRefresh.replace("{asset}", activeAsset.name)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* WATCHLIST TAB */}
            {activeTab === "watchlist" && (
              <motion.div key="watchlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
                <div className="flex items-center justify-between mb-8 mt-2">
                  <h2 className="text-2xl font-black tracking-tight uppercase">{t.watchlist}</h2>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button onClick={() => setWatchlistLayout("list")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "list" ? "bg-white/10 text-[var(--mp-cyan)]" : "text-[var(--mp-text-secondary)]"}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setWatchlistLayout("grid")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "grid" ? "bg-white/10 text-[var(--mp-cyan)]" : "text-[var(--mp-text-secondary)]"}`}><Activity className="w-4 h-4" /></button>
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
                          <div className="flex items-center justify-between"><Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} /></div>
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
              <motion.div key="community" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
                <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>
                <div className="flex gap-4 mb-6 border-b border-white/[0.05] pb-2">
                  <button onClick={() => setCommunityTab("community")} className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "community" ? "text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                    {t.community}
                    {communityTab === "community" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[var(--mp-cyan)]" />}
                  </button>
                  <button onClick={() => setCommunityTab("trending")} className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "trending" ? "text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                    {t.trending}
                    {communityTab === "trending" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[var(--mp-green)]" />}
                  </button>
                </div>
                {communityTab === "community" ? (
                  <div className="flex flex-col gap-4">
                    {COMMUNITY_POSTS.map((post) => (
                      <div key={post.id} className="mp-glass-card rounded-[24px] p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">{post.avatar}</div>
                            <div><div className="font-bold text-[15px] text-foreground">{post.name}</div><div className="text-[var(--mp-text-secondary)] text-[11px]">{post.user} • {post.time}</div></div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-[9px] text-[var(--mp-text-secondary)] font-bold tracking-wider uppercase mb-1">{t.winRate}</div>
                            <div className="flex items-center gap-1 mp-gradient-badge px-2 py-0.5 rounded text-background shadow-[0_0_10px_rgba(0,255,255,0.2)]"><span className="font-black text-[11px]">{post.success}%</span></div>
                          </div>
                        </div>
                        <p className="text-[14px] text-white/90 leading-relaxed mb-4">{post.text}</p>
                        <div className="flex items-center gap-6 text-[var(--mp-text-secondary)]">
                          <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors"><Heart className="w-4 h-4" /><span className="text-[12px] font-bold">{post.likes}</span></button>
                          <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors"><MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.comments}</span></button>
                          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto"><Share2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Trending Stocks */}
                    <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                      <button onClick={() => setTrendingExpanded(!trendingExpanded)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
                        <h3 className="text-[11px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest">{t.trendingStocks}</h3>
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-tighter">{t.expandView}</div>
                          <ChevronDown className={`w-4 h-4 text-[var(--mp-text-secondary)] transition-transform duration-300 ${trendingExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {trendingExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-2 p-3">
                            <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                              {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map((tf) => (
                                <button key={tf} onClick={() => setTrendingTimeframe(tf)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tf === trendingTimeframe ? "bg-[var(--mp-cyan)] text-background" : "bg-white/5 text-[var(--mp-text-secondary)] hover:bg-white/10"}`}>
                                  {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                                </button>
                              ))}
                            </div>
                            {ASSETS.slice(0, 8).map((asset, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/[0.08] transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <span className="text-[var(--mp-text-secondary)] font-bold text-xs">#{i + 1}</span>
                                  <div className="flex flex-col"><span className="font-bold text-sm">{asset.name}</span><span className="text-[9px] text-[var(--mp-text-secondary)] font-medium">{asset.symbol}</span></div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Sparkline data={asset.data["1D"].slice(-15)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${asset.change.startsWith("+") ? "mp-positive-badge" : asset.change.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>{asset.change}</span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Trending Comments */}
                    <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                      <button onClick={() => setCommentsExpanded(!commentsExpanded)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
                        <h3 className="text-[11px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest">{t.trendingComments}</h3>
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-tighter">{t.expandView}</div>
                          <ChevronDown className={`w-4 h-4 text-[var(--mp-text-secondary)] transition-transform duration-300 ${commentsExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {commentsExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-3 p-3">
                            <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                              {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map((tf) => (
                                <button key={tf} onClick={() => setCommentsTimeframe(tf)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tf === commentsTimeframe ? "bg-[var(--mp-green)] text-background" : "bg-white/5 text-[var(--mp-text-secondary)] hover:bg-white/10"}`}>
                                  {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                                </button>
                              ))}
                            </div>
                            {COMMUNITY_POSTS.slice(0, 5).map((post, i) => (
                              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/[0.02] hover:bg-white/[0.07] transition-colors cursor-pointer">
                                <p className="text-sm text-white/80 line-clamp-3 mb-3 leading-relaxed italic">"{post.text}"</p>
                                <div className="flex items-center justify-between text-xs text-[var(--mp-text-secondary)]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black">{post.user[0]}</div>
                                    <span className="font-bold text-white/60">{post.user}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[var(--mp-red)]" /> {post.likes}</span>
                                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-[var(--mp-cyan)]" /> {post.comments}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-10 pb-24">
                <AnimatePresence mode="wait">
                  {!profilePage ? (
                    <motion.div key="profile-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById("profilePicInput")?.click()}>
                          <div className="w-20 h-20 rounded-[32px] mp-gradient-badge p-0.5">
                            <div className="w-full h-full bg-[#0D0E12] rounded-[30px] flex items-center justify-center overflow-hidden">
                              {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <img src={APP_ASSETS.tabLogo} alt="Profile" className="w-10 h-10 object-contain opacity-40 grayscale" />}
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-[32px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Edit3 className="w-5 h-5 text-foreground" /></div>
                          <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight uppercase">Gökalp</h2>
                          <p className="text-sm text-[var(--mp-text-secondary)]">{t.proMember} • {t.since} 2024</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                          { label: language === "Turkish" ? "Yorum" : "Comments", value: userComments.length, color: "from-[var(--mp-purple)] to-[var(--mp-blue)]" },
                          { label: language === "Turkish" ? "İzleme" : "Watchlist", value: watchlistAssets.length, color: "from-[var(--mp-cyan)] to-[var(--mp-green)]" },
                          { label: language === "Turkish" ? "Sabitlenen" : "Pinned", value: pinnedAssets.length, color: "from-[var(--mp-green)] to-[var(--mp-cyan)]" },
                        ].map((stat, i) => (
                          <div key={i} className="mp-glass-card rounded-2xl p-4 text-center">
                            <div className={`text-[22px] font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                            <div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <div onClick={() => setProfilePage("comments")} className="bg-gradient-to-r from-[var(--mp-purple)]/10 to-[var(--mp-blue)]/10 border border-[var(--mp-purple)]/20 rounded-[24px] p-5 mb-4 cursor-pointer hover:from-[var(--mp-purple)]/15 hover:to-[var(--mp-blue)]/15 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl mp-gradient-badge-purple flex items-center justify-center shadow-[0_0_15px_rgba(178,75,243,0.3)]"><MessageCircle className="w-5 h-5 text-background" /></div>
                            <div><span className="font-bold text-[15px] text-foreground">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</span><div className="text-[11px] text-[var(--mp-text-secondary)]">{userComments.length} {language === "Turkish" ? "toplam yorum" : "total comments"}</div></div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--mp-purple)]" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="mp-glass-card rounded-[24px] overflow-hidden">
                          <div className="p-4 flex items-center justify-between border-b border-white/[0.03]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--mp-cyan)]"><Globe className="w-4 h-4" /></div>
                              <div><div className="font-bold text-[14px] text-white/90">{t.autoTranslate}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{t.translateComments}</div></div>
                            </div>
                            <div onClick={() => setAutoTranslate(!autoTranslate)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoTranslate ? "bg-[var(--mp-green)]" : "bg-white/10"}`}>
                              <motion.div animate={{ x: autoTranslate ? 20 : 0 }} className="w-4 h-4 rounded-full bg-foreground shadow-sm" />
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--mp-green)]"><MessageCircle className="w-4 h-4" /></div>
                              <div><div className="font-bold text-[14px] text-white/90">{t.language}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{t.targetLanguage}</div></div>
                            </div>
                            <div className="relative z-[60]">
                              <button onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }} className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{language}</span>
                                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
                              </button>
                              <AnimatePresence>
                                {showLanguageMenu && (
                                  <>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[61]" />
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 right-0 bg-[#0D0E14]/98 border border-white/[0.1] rounded-xl p-2.5 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-[62] grid grid-cols-2 gap-1.5">
                                      {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                                        <button key={lang} onClick={(e) => { e.stopPropagation(); setLanguage(lang); setShowLanguageMenu(false); }} className={`px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center ${language === lang ? "bg-foreground text-background" : "text-white/40 hover:bg-white/5"}`}>{lang}</button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {[
                          { icon: <User className="w-5 h-5" />, title: t.accountSettings, page: "account" },
                          { icon: <Bell className="w-5 h-5" />, title: t.notifications, page: "notifications" },
                          { icon: <Shield className="w-5 h-5" />, title: t.privacySecurity, page: "privacy" },
                          { icon: <LogOut className="w-5 h-5" />, title: t.logout, color: "bg-[var(--mp-red)] text-background", onClick: () => { setIsLoggedIn(false); } },
                        ].map((item, i) => (
                          <div key={i} onClick={item.onClick || (() => item.page && setProfilePage(item.page))} className="mp-glass-card rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color || "bg-white/5 text-[var(--mp-text-secondary)]"}`}>{item.icon}</div>
                              <span className={`font-bold text-[15px] ${item.color ? "text-[var(--mp-red)]" : "text-white/90"}`}>{item.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : profilePage === "comments" ? (
                    <motion.div key="profile-comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl mp-gradient-badge-purple flex items-center justify-center"><MessageCircle className="w-5 h-5 text-background" /></div>
                        <div><h3 className="text-xl font-black uppercase">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</h3><p className="text-[11px] text-[var(--mp-text-secondary)]">{userComments.length} {language === "Turkish" ? "toplam" : "total"}</p></div>
                      </div>
                      {userComments.length === 0 ? (
                        <div className="text-center py-16"><MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-[13px] text-[var(--mp-text-secondary)]">{language === "Turkish" ? "Henüz yorum yazmadınız." : "No comments yet."}</p></div>
                      ) : (
                        <div className="space-y-3">
                          {userComments.map((uc: any) => (
                            <div key={uc.id} className="mp-glass-card rounded-2xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-bold text-foreground">{ASSETS.find((a) => a.id === uc.assetId)?.name || uc.assetId}</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[var(--mp-green)] text-background" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-foreground" : "bg-[var(--mp-cyan)] text-background"}`}>{uc.sentiment}</span>
                                </div>
                                <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[var(--mp-text-secondary)]" /></button>
                              </div>
                              <p className="text-[14px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                              <div className="flex items-center gap-3 text-[10px] text-white/20">
                                <span>${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>{uc.timeframe}</span>
                                <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : profilePage === "account" ? (
                    <motion.div key="profile-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                      <h3 className="text-xl font-black uppercase mb-6">{t.accountSettings}</h3>
                      <div className="space-y-4">
                        {[
                          { label: language === "Turkish" ? "Kullanıcı Adı" : "Username", value: "Gökalp" },
                          { label: "Email", value: "gokalp@example.com" },
                          { label: language === "Turkish" ? "Üyelik" : "Membership", value: "Pro" },
                          { label: language === "Turkish" ? "Katılım Tarihi" : "Joined", value: "2024" },
                        ].map((field, i) => (
                          <div key={i} className="mp-glass-card rounded-2xl p-4"><div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-1">{field.label}</div><div className="text-[15px] font-bold text-foreground">{field.value}</div></div>
                        ))}
                        <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">{language === "Turkish" ? "Profili Düzenle" : "Edit Profile"}</button>
                      </div>
                    </motion.div>
                  ) : profilePage === "notifications" ? (
                    <motion.div key="profile-notif" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                      <h3 className="text-xl font-black uppercase mb-6">{t.notifications}</h3>
                      <div className="space-y-2 mb-8">
                        {[
                          { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[var(--mp-green)] text-background", user: "@CryptoKing", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "BTC", time: "2m" },
                          { icon: <MessageCircle className="w-4 h-4" />, color: "bg-[var(--mp-cyan)] text-background", user: "@WhaleWatch", action: language === "Turkish" ? "yorumuna yanıt verdi" : "replied to your comment", asset: "ETH", time: "15m" },
                          { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[var(--mp-green)] text-background", user: "@GoldBug", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "GOLD", time: "1h" },
                          { icon: <Heart className="w-4 h-4" />, color: "mp-gradient-badge-purple text-background", user: "@DayTrader", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "AAPL", time: "2h" },
                        ].map((notif, i) => (
                          <div key={i} className="mp-glass-card rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>{notif.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] text-white/90 leading-snug"><span className="font-bold">{notif.user}</span> {notif.action}</div>
                              <div className="text-[10px] text-[var(--mp-text-secondary)] mt-0.5">{notif.asset} • {notif.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] font-black text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">{language === "Turkish" ? "Bildirim Ayarları" : "Notification Settings"}</div>
                      <div className="space-y-3">
                        {[
                          { label: language === "Turkish" ? "Fiyat Uyarıları" : "Price Alerts", desc: language === "Turkish" ? "Fiyat hedefine ulaşıldığında" : "When price targets are hit", defaultOn: true },
                          { label: language === "Turkish" ? "Yorum Yanıtları" : "Comment Replies", desc: language === "Turkish" ? "Yorumlarına yanıt geldiğinde" : "When someone replies", defaultOn: true },
                          { label: language === "Turkish" ? "Beğeniler" : "Likes", desc: language === "Turkish" ? "Yorumların beğenildiğinde" : "When your comments are liked", defaultOn: true },
                          { label: language === "Turkish" ? "Piyasa Haberleri" : "Market News", desc: language === "Turkish" ? "Önemli piyasa haberleri" : "Important market news", defaultOn: false },
                        ].map((item, i) => <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />)}
                      </div>
                    </motion.div>
                  ) : profilePage === "privacy" ? (
                    <motion.div key="profile-privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                      <h3 className="text-xl font-black uppercase mb-6">{t.privacySecurity}</h3>
                      <div className="space-y-3">
                        {[
                          { label: language === "Turkish" ? "Profil Gizliliği" : "Profile Visibility", desc: language === "Turkish" ? "Profilini kimler görebilir" : "Who can see your profile", defaultOn: true },
                          { label: language === "Turkish" ? "Yorum Geçmişi" : "Comment History", desc: language === "Turkish" ? "Yorum geçmişini herkese göster" : "Show comment history publicly", defaultOn: false },
                          { label: language === "Turkish" ? "Konum Verisi" : "Location Data", desc: language === "Turkish" ? "Konum bilgisi paylaşımı" : "Share location with comments", defaultOn: false },
                          { label: language === "Turkish" ? "Analitik" : "Analytics", desc: language === "Turkish" ? "Kullanım verisi paylaşımı" : "Share usage data for improvements", defaultOn: true },
                        ].map((item, i) => <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />)}
                        <div className="mt-6 space-y-3">
                          <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">{language === "Turkish" ? "Verileri Dışa Aktar" : "Export Data"}</button>
                          <button className="w-full py-4 bg-[var(--mp-red)]/10 border border-[var(--mp-red)]/20 rounded-2xl text-[12px] font-black text-[var(--mp-red)] uppercase tracking-widest hover:bg-[var(--mp-red)]/20 transition-colors">{language === "Turkish" ? "Hesabı Sil" : "Delete Account"}</button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Comment Sheet */}
        <AnimatePresence>
          {showCommentSheet && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentSheet(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--mp-cyan)]/20 to-[var(--mp-green)]/20 flex items-center justify-center border border-white/10"><Edit3 className="w-5 h-5 text-[var(--mp-cyan)]" /></div>
                  <div className="flex-1"><div className="text-[13px] font-black text-foreground uppercase tracking-wider">{language === "Turkish" ? "Yorum Yaz" : "Write Comment"}</div><div className="text-[11px] text-[var(--mp-text-secondary)]">{activeAsset.name}</div></div>
                </div>
                <div className="mb-4 bg-white/5 border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-wider">{language === "Turkish" ? "Fiyat Noktası" : "Price Point"}</div>
                  <div className="text-[16px] font-bold text-foreground">{commentChartIdx !== null ? `$${activeData[commentChartIdx]?.toFixed(2)}` : ""}</div>
                </div>
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-wider mb-2">{language === "Turkish" ? "Duyarlılık" : "Sentiment"}</div>
                  <div className="flex gap-2">
                    {["Positive", "Neutral", "Negative"].map((s) => (
                      <button key={s} onClick={() => setCommentSentiment(s)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${commentSentiment === s ? (s === "Positive" ? "bg-[var(--mp-green)] text-background" : s === "Negative" ? "bg-[var(--mp-red)] text-foreground" : "bg-[var(--mp-cyan)] text-background") : "bg-white/5 text-white/40"}`}>{s === "Positive" ? "Bullish" : s === "Negative" ? "Bearish" : "Neutral"}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={language === "Turkish" ? "Yorumunuzu yazın..." : "Write your comment..."} className="w-full bg-white/5 border border-white/[0.05] rounded-xl p-4 text-[14px] text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 resize-none h-24 transition-colors" />
                </div>
                <button onClick={submitComment} disabled={!commentText.trim()} className="w-full mp-gradient-badge text-background font-black py-3 rounded-xl text-[12px] uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,255,0.3)] disabled:opacity-30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" strokeWidth={3} />
                  {language === "Turkish" ? "Gönder" : "Submit"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* My Comments Sheet */}
        <AnimatePresence>
          {showMyComments && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMyComments(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl mp-gradient-badge-purple flex items-center justify-center"><MessageCircle className="w-5 h-5 text-background" /></div>
                    <div><div className="text-[13px] font-black text-foreground uppercase tracking-wider">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</div><div className="text-[11px] text-[var(--mp-text-secondary)]">{activeAsset.name} • {allAssetUserComments.length} {language === "Turkish" ? "yorum" : "comments"}</div></div>
                  </div>
                  <button onClick={() => setShowMyComments(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-4 h-4 text-white/70" /></button>
                </div>
                {allAssetUserComments.length === 0 ? (
                  <div className="text-center py-10"><MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-2" /><p className="text-[12px] text-[var(--mp-text-secondary)]">{language === "Turkish" ? "Bu varlık için yorum yok." : "No comments for this asset."}</p></div>
                ) : (
                  <div className="space-y-3">
                    {allAssetUserComments.map((uc: any) => (
                      <div key={uc.id} className="mp-glass-card rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[var(--mp-green)] text-background" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-foreground" : "bg-[var(--mp-cyan)] text-background"}`}>{uc.sentiment}</span>
                            <span className="text-[10px] text-white/30">{uc.timeframe}</span>
                          </div>
                          <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[var(--mp-text-secondary)]" /></button>
                        </div>
                        <p className="text-[13px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                        <div className="flex items-center gap-3 text-[10px] text-white/20">
                          <span>${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Detailed Point Sheet */}
        <AnimatePresence>
          {detailedPoint && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[13px] font-black text-foreground uppercase tracking-wider">{detailedPoint.type === "news" ? t.newsAlert : "Community Pulse"}</div>
                    <div className="text-[11px] text-[var(--mp-text-secondary)]">{detailedPoint.translation}</div>
                  </div>
                  <button onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-4 h-4 text-white/70" /></button>
                </div>

                {/* News link */}
                {detailedPoint.type === "news" && detailedPoint.url && (
                  <a href={detailedPoint.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full mb-4 px-4 py-3 bg-[var(--mp-cyan)]/10 border border-[var(--mp-cyan)]/20 rounded-xl hover:bg-[var(--mp-cyan)]/15 transition-colors">
                    <span className="text-[11px] font-black text-[var(--mp-cyan)] uppercase tracking-wider">{language === "Turkish" ? "Haberin Kaynağına Git" : "Read Full Article"}</span>
                    <ChevronRight className="w-4 h-4 text-[var(--mp-cyan)]" />
                  </a>
                )}

                {/* AI Consensus + Sentiment Breakdown */}
                {(() => {
                  const all = detailedPoint.comments || [];
                  if (all.length < 1) return null;
                  const filtered = sentimentFilter === "All" ? all : all.filter((c: any) => c.sentiment === sentimentFilter);
                  const pos = all.filter((c: any) => c.sentiment === "Positive").length;
                  const neg = all.filter((c: any) => c.sentiment === "Negative").length;
                  const neu = all.filter((c: any) => c.sentiment === "Neutral").length;
                  const total = all.length;
                  const posP = Math.round((pos/total)*100);
                  const negP = Math.round((neg/total)*100);
                  const neuP = 100 - posP - negP;
                  const dominant = pos >= neg && pos >= neu ? "Positive" : neg >= pos && neg >= neu ? "Negative" : "Neutral";
                  const consensusByFilter: Record<string, string> = {
                    All: pos > neg + neu * 0.5 ? (language === "Turkish" ? "Topluluk genel olarak yükseliş bekliyor. Kurumsal alımlar ve güçlü teknik seviyeler öne çıkıyor." : "Community is broadly bullish. Institutional buying and strong technical levels are the dominant narrative.") :
                         neg > pos + neu * 0.5 ? (language === "Turkish" ? "Çoğunluk düşüş beklentisinde. Makro riskler ve kar satışları baskı yaratıyor." : "Bearish majority. Macro risks and profit-taking are creating downside pressure.") :
                         (language === "Turkish" ? "Karışık sinyaller — piyasa bir katalizör bekliyor. Destek ve direnç seviyeleri kritik." : "Mixed signals — market is awaiting a catalyst. Support and resistance levels are key."),
                    Positive: language === "Turkish" ? "Yükselişçi yorumlar güçlü momentum ve kurumsal ilgiye işaret ediyor." : "Bullish comments highlight strong momentum and growing institutional interest.",
                    Negative: language === "Turkish" ? "Düşüşçü bakış açısı; aşırı alım seviyeleri ve makro belirsizlik öne çıkıyor." : "Bearish perspective centers on overbought conditions and macro uncertainty.",
                    Neutral: language === "Turkish" ? "Temkinli kesim yön kırılımı bekliyor. Hacim ve haber akışı belirleyici olacak." : "Cautious traders are waiting for a directional breakout. Volume and news flow will be decisive.",
                  };
                  const showSentimentAI = sentimentFilter !== "All" && filtered.length >= 10;
                  return (
                    <div className="mb-4">
                      {/* Overall AI Consensus - large, always visible */}
                      <div className="rounded-2xl mb-3 border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-3.5 h-3.5 text-white/30" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{language === "Turkish" ? "Topluluk Konsensüsü" : "Community Consensus"}</span>
                            <span className={`ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${dominant === "Positive" ? "border-[var(--mp-green)]/30 text-[var(--mp-green)]" : dominant === "Negative" ? "border-[var(--mp-red)]/30 text-[var(--mp-red)]" : "border-white/10 text-white/30"}`}>{dominant}</span>
                          </div>
                          <p className="text-[13px] text-white/70 leading-relaxed">"{showSentimentAI ? consensusByFilter[sentimentFilter] : consensusByFilter["All"]}"</p>
                        </div>
                        {all.length >= 10 && (
                          <div className="px-4 pb-4 border-t border-white/[0.05] pt-3">
                            <div className="flex h-[3px] rounded-full overflow-hidden gap-[2px] mb-2">
                              {posP > 0 && <div className="bg-[var(--mp-green)] rounded-full transition-all duration-500" style={{ width: `${posP}%` }} />}
                              {neuP > 0 && <div className="bg-white/15 rounded-full transition-all duration-500" style={{ width: `${neuP}%` }} />}
                              {negP > 0 && <div className="bg-[var(--mp-red)] rounded-full transition-all duration-500" style={{ width: `${negP}%` }} />}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-[var(--mp-green)]">{posP}% {language === "Turkish" ? "Yükseliş" : "Bull"}</span>
                                <span className="text-[9px] font-bold text-white/25">{neuP}% {language === "Turkish" ? "Nötr" : "Neutral"}</span>
                                <span className="text-[9px] font-bold text-[var(--mp-red)]">{negP}% {language === "Turkish" ? "Düşüş" : "Bear"}</span>
                              </div>
                              <span className="text-[8px] text-white/20">{total}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Sentiment filter */}
                <div className="flex gap-2 mb-3">
                  {["All", "Positive", "Neutral", "Negative"].map((s) => (
                    <button key={s} onClick={() => setSentimentFilter(s)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sentimentFilter === s ? "bg-foreground text-background" : "bg-white/5 text-white/40"}`}>{s}</button>
                  ))}
                </div>

                {/* Own comment on top */}
                {(() => {
                  const myComment = userComments.find((c: any) => c.assetId === selectedAssetId && Math.abs(c.chartIndex - detailedPoint.idx) <= 3);
                  if (!myComment) return null;
                  return (
                    <div className="mb-2 p-2.5 rounded-xl border border-[var(--mp-purple)]/30 bg-[var(--mp-purple)]/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded mp-gradient-badge-purple text-background">{language === "Turkish" ? "Yorumum" : "My Comment"}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${myComment.sentiment === "Positive" ? "bg-[var(--mp-green)]/20 text-[var(--mp-green)]" : myComment.sentiment === "Negative" ? "bg-[var(--mp-red)]/20 text-[var(--mp-red)]" : "bg-[var(--mp-cyan)]/20 text-[var(--mp-cyan)]"}`}>{myComment.sentiment}</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">{myComment.text}</p>
                    </div>
                  );
                })()}

                {/* Comments list */}
                <div className="space-y-1.5">
                  {(detailedPoint.comments || [])
                    .filter((c: any) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
                    .slice(0, 20)
                    .map((comment: any, i: number) => {
                      const key = `${detailedPoint.idx}-${i}`;
                      const vote = commentVotes[key];
                      return (
                        <div key={i} className="flex items-start gap-2 py-2 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black flex-shrink-0 mt-0.5">{comment.user[1]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-white/60">{comment.user}</span>
                              <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded ${comment.sentiment === "Positive" ? "bg-[var(--mp-green)]/20 text-[var(--mp-green)]" : comment.sentiment === "Negative" ? "bg-[var(--mp-red)]/20 text-[var(--mp-red)]" : "bg-[var(--mp-cyan)]/20 text-[var(--mp-cyan)]"}`}>{comment.sentiment}</span>
                            </div>
                            <p className="text-[11px] text-white/75 leading-snug">{comment.text}</p>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                            <button onClick={() => voteComment(key, "up")} className={`p-0.5 rounded ${vote === "up" ? "text-[var(--mp-green)]" : "text-white/20 hover:text-white/40"}`}><TrendingUp className="w-2.5 h-2.5" /></button>
                            <span className="text-[9px] text-white/30">{comment.likes + (vote === "up" ? 1 : vote === "down" ? -1 : 0)}</span>
                            <button onClick={() => voteComment(key, "down")} className={`p-0.5 rounded ${vote === "down" ? "text-[var(--mp-red)]" : "text-white/20 hover:text-white/40"}`}><TrendingDown className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <footer className="absolute bottom-0 inset-x-0 h-[90px] bg-black/30 backdrop-blur-[40px] border-t border-white/[0.03] flex justify-around items-start pt-5 px-4 z-[100]">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="blueGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#39FF14" />
              </linearGradient>
            </defs>
          </svg>
          {[
            { id: "dashboard", icon: <img src={APP_ASSETS.tabLogo} alt="Dashboard" className="w-6 h-6 object-contain" /> },
            { id: "watchlist", icon: <List className="w-6 h-6" /> },
            { id: "markets", icon: <Globe className="w-6 h-6" /> },
            { id: "community", icon: <Users className="w-6 h-6" /> },
            { id: "profile", icon: <Settings className="w-6 h-6" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setProfilePage(null); }}
              className="flex flex-col items-center gap-1.5 relative w-14 group"
            >
              <div className={`transition-all duration-300 ${activeTab === tab.id ? "text-white scale-110" : "text-[#7A7B8D] group-hover:text-white/70"}`}>
                {tab.icon}
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeDot"
                  className="w-1 h-1 rounded-full bg-[#00FFFF] absolute -bottom-3 shadow-[0_0_10px_#00FFFF]"
                />
              )}
            </button>
          ))}
        </footer>
      </div>
    </div>
  );
}
