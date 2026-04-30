import React, { useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, ChevronRight, Globe, Settings, Shield, Users, X } from "lucide-react";
import { haptic } from "@/services/hapticService";
import { ASSETS, APP_ASSETS, getAssetData } from "@/data/assets";
import { TRANSLATIONS } from "@/data/translations";
import { UserComment, DetailedPointData, SentimentCluster, NewsOrConsensusPoint } from "@/types";
import { AssetWheelPicker } from "@/components/market/AssetWheelPicker";
import { SplashScreen } from "@/components/market/SplashScreen";
import { OnboardingScreen } from "@/components/market/OnboardingScreen";
import { SideMenu } from "@/components/market/SideMenu";
import { SearchDropdown } from "@/components/market/SearchDropdown";
import { AppHeader } from "@/components/market/AppHeader";
import { useMarketData } from "@/hooks/useMarketData";
// Lazy load tabs and sheets for better performance
const DashboardTab = React.lazy(() => import("@/components/market/tabs/DashboardTab").then(m => ({ default: m.DashboardTab })));
const MarketsTab = React.lazy(() => import("@/components/market/tabs/MarketsTab").then(m => ({ default: m.MarketsTab })));
const CommunityTab = React.lazy(() => import("@/components/market/tabs/CommunityTab").then(m => ({ default: m.CommunityTab })));
const ProfileTab = React.lazy(() => import("@/components/market/tabs/ProfileTab").then(m => ({ default: m.ProfileTab })));
const CommentSheet = React.lazy(() => import("@/components/market/sheets/CommentSheet").then(m => ({ default: m.CommentSheet })));
const MyCommentsSheet = React.lazy(() => import("@/components/market/sheets/MyCommentsSheet").then(m => ({ default: m.MyCommentsSheet })));
const DetailedPointSheet = React.lazy(() => import("@/components/market/sheets/DetailedPointSheet").then(m => ({ default: m.DetailedPointSheet })));
import { fetchMarketInsights } from "@/services/marketDataService";
import { AI_PULSE_FREE_LIMIT, getAiPulseDateKey, useAppStore } from "@/stores/useAppStore";

function GlobalSVGDefs() {
  return (
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
}

type ProCheckoutResult = boolean | {
  success?: boolean;
  isPro?: boolean;
  entitlement?: string;
};

type MarketPulsePaymentsBridge = {
  purchasePro?: (productId: string) => ProCheckoutResult | Promise<ProCheckoutResult>;
  restorePurchases?: () => ProCheckoutResult | Promise<ProCheckoutResult>;
};

export default function MarketPulseApp({ containerHeight }: { containerHeight?: number } = {}) {
  const {
    showSplash, setShowSplash, isExitingSplash, setIsExitingSplash,
    isSplashPressed, setIsSplashPressed, isLoggedIn, setIsLoggedIn,
    activeTab, setActiveTab, isMenuOpen, setIsMenuOpen,
    isSearchActive, setIsSearchActive, chartExpanded, setChartExpanded,
    marketsSubTab, setMarketsSubTab, watchlistLayout, setWatchlistLayout,
    watchlistSort, setWatchlistSort, gainersExpanded, setGainersExpanded,
    losersExpanded, setLosersExpanded, moversPeriod, setMoversPeriod,
    moversCategory, setMoversCategory, selectedMarket, setSelectedMarket,
    showMarketPicker, setShowMarketPicker, marketPickerSearch, setMarketPickerSearch,
    selectedAssetId, setSelectedAssetId, timeframe, setTimeframe,
    currency, setCurrency, selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint, chartCrosshair, setChartCrosshair,
    profilePicture, setProfilePicture, watchlistAssets, setWatchlistAssets,
    pinnedAssets, setPinnedAssets, userComments, isEditPinned, setIsEditPinned,
    addToWatchlist, removeFromWatchlist, addToPinned, removeFromPinned,
    showCommentSheet, setShowCommentSheet, commentChartIdx, setCommentChartIdx,
    commentText, setCommentText, commentSentiment, setCommentSentiment,
    showMyComments, setShowMyComments, commentsExpanded, setCommentsExpanded,
    commentsTimeframe, setCommentsTimeframe, addUserComment, deleteUserComment,
    searchQuery, setSearchQuery, searchResults, setSearchResults,
    isSearching, setIsSearching, expandedCategory, setExpandedCategory,
    language, setLanguage, autoTranslate, setAutoTranslate,
    showNewsBubbles, setShowNewsBubbles, showAIConsensus, setShowAIConsensus,
    sentimentFilter, setSentimentFilter,
    isAnalyzing, setIsAnalyzing, aiAnalysis, setAiAnalysis,
    aiPulseCredits, aiPulseCreditDate, isProUnlocked,
    consumeAiPulseCredit, resetAiPulseCredits, setIsProUnlocked,
  } = useAppStore();

  const [isAssetPickerOpen, setIsAssetPickerOpen] = React.useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);
  const [langMenuPos, setLangMenuPos] = React.useState({ top: 0, left: 0 });
  const [communityTab, setCommunityTab] = React.useState("community");
  const [profilePage, setProfilePage] = React.useState<string | null>(null);
  const [menuSearch, setMenuSearch] = React.useState("");
  const [showProPaywall, setShowProPaywall] = React.useState(false);
  const [checkoutState, setCheckoutState] = React.useState<"idle" | "pending">("idle");
  const [checkoutMessage, setCheckoutMessage] = React.useState<string | null>(null);
  const [externalSentimentClusters, setExternalSentimentClusters] = React.useState<SentimentCluster[]>([]);

  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const livePriceRef = useRef(0);

  useEffect(() => {
    if (showLanguageMenu && languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      setLangMenuPos({
        top: rect.bottom + 8,
        left: Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 308),
      });
    }
  }, [showLanguageMenu]);

  useEffect(() => {
    if (isProUnlocked) return;
    const todayKey = getAiPulseDateKey();
    if (aiPulseCreditDate !== todayKey) {
      resetAiPulseCredits(todayKey);
    }
  }, [aiPulseCreditDate, isProUnlocked, resetAiPulseCredits]);

  useEffect(() => {
    const handleEntitlementUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ isPro?: boolean }>).detail;
      if (detail?.isPro) {
        setIsProUnlocked(true);
        setShowProPaywall(false);
        setCheckoutMessage(null);
        haptic.success();
      }
    };

    window.addEventListener("marketpulse:entitlement-updated", handleEntitlementUpdate);
    return () => window.removeEventListener("marketpulse:entitlement-updated", handleEntitlementUpdate);
  }, [setIsProUnlocked]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfilePicture(result);
    };
    reader.readAsDataURL(file);
  };

  const activeAsset = useMemo(() => {
    const found = ASSETS.find((a) => a.id === selectedAssetId);
    if (found) return found;
    // Fallback to BTC if selected one is missing (e.g. after schema change)
    return ASSETS.find(a => a.id === "BTC") || ASSETS[0] || { id: "BTC", name: "Bitcoin", price: 0, change: "0%", isUp: true };
  }, [selectedAssetId]);

  const fallbackData = useMemo(() => {
    const data = getAssetData(activeAsset.id);
    return data[timeframe] || data["1D"] || Array(20).fill(0);
  }, [activeAsset.id, timeframe]);

  const activeTranslations = useMemo<NewsOrConsensusPoint[]>(() => [], []);

  const {
    chartData: activeData,
    price: livePrice,
    change: liveChange,
    isUp: liveIsUp,
    isLive,
  } = useMarketData({
    assetId: activeAsset.id,
    timeframe,
    fallbackData,
    fallbackPrice: activeAsset?.price || 0,
    fallbackChange: activeAsset?.change || "0%",
    fallbackIsUp: activeAsset?.isUp ?? true,
  });

  useEffect(() => {
    livePriceRef.current = livePrice;
  }, [livePrice]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
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
        addToWatchlist(exists.id);
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
      addToWatchlist(newAsset.id);
      setSelectedAssetId(newAsset.id);
      setActiveTab("dashboard");
      try {
        const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(quote.symbol)}`);
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
  }, [watchlistAssets, addToWatchlist]);

  const activeUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId && c.timeframe === timeframe), [userComments, selectedAssetId, timeframe]);
  const allAssetUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId), [userComments, selectedAssetId]);

  const minVal = useMemo(() => activeData.length > 0 ? Math.min(...activeData) * 0.995 : 0, [activeData]);
  const maxVal = useMemo(() => activeData.length > 0 ? Math.max(...activeData) * 1.005 : 1, [activeData]);

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
          translation: current.comments[0]?.text,
          origin: "user"
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
      translation: current.comments[0]?.text,
      origin: "user"
    });
    return clusters.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [activeUserComments, minVal, maxVal]);

  useEffect(() => {
    setExternalSentimentClusters([]);
  }, [selectedAssetId, timeframe]);

  useEffect(() => {
    if (!isLoggedIn || activeData.length === 0 || !selectedAssetId) return;

    let isCancelled = false;

    const loadExternalCommentClusters = async () => {
      const insight = await fetchMarketInsights(selectedAssetId, activeAsset.name, livePriceRef.current || activeAsset.price || 0, 0, false, timeframe);
      if (isCancelled || !insight) return;

      const clusters = (insight.commentClusters ?? [])
        .filter((cluster) => Number.isFinite(cluster.avgIdx) && Number.isFinite(cluster.avgPrice))
        .map((cluster) => ({
          ...cluster,
          origin: "external" as const,
          comments: cluster.comments.map((comment) => ({
            ...comment,
            id: comment.id || `${comment.source || "Web"}-${comment.timestamp}-${comment.text.slice(0, 24)}`,
            assetId: selectedAssetId,
            timeframe,
            chartIndex: Number(comment.chartIndex ?? cluster.avgIdx),
            price: Number(comment.priceAtComment ?? cluster.avgPrice),
            timestamp: Number(comment.timestamp || Date.now()),
          })) as unknown as UserComment[],
        })) as SentimentCluster[];

      setExternalSentimentClusters(clusters);
    };

    void loadExternalCommentClusters();

    return () => {
      isCancelled = true;
    };
  }, [activeAsset.name, activeAsset.price, activeData.length, isLoggedIn, selectedAssetId, timeframe]);

  const visibleSentimentClusters = useMemo(
    () => [...sentimentClusters, ...externalSentimentClusters].slice(0, 14),
    [sentimentClusters, externalSentimentClusters]
  );

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
    addUserComment(newComment);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const submitDetailedPointComment = useCallback((text: string, sentiment: "Positive" | "Negative" | "Neutral") => {
    const pointIdx = detailedPoint?.avgIdx ?? detailedPoint?.idx ?? selectedPoint?.avgIdx ?? selectedPoint?.idx;
    if (!text.trim() || pointIdx === undefined || pointIdx < 0 || pointIdx >= activeData.length) return false;

    const newComment: UserComment = {
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: pointIdx,
      price: activeData[pointIdx],
      text: text.trim(),
      sentiment,
      timestamp: Date.now(),
      user: "You",
      likes: 0,
      source: "MarketPulse",
      bindingKind: "exact_price",
      displayMode: "price_marker",
    };

    addUserComment(newComment);
    haptic.success();
    return true;
  }, [activeData, addUserComment, detailedPoint, selectedAssetId, selectedPoint, timeframe]);

  const deleteComment = (id: string) => {
    deleteUserComment(id);
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

  const openPointDetail = useCallback((point: SentimentCluster | NewsOrConsensusPoint) => {
    const pt = point as unknown as DetailedPointData;
    setSelectedPoint(pt);
    setDetailedPoint(pt);
    setSentimentFilter("All");
  }, [setSelectedPoint, setDetailedPoint, setSentimentFilter]);

  const handleSplashClick = () => {
    setIsSplashPressed(true);
    setTimeout(() => {
      setIsExitingSplash(true);
      setTimeout(() => setShowSplash(false), 700);
    }, 1200);
  };

  const completeProCheckout = useCallback(async (mode: "purchase" | "restore") => {
    setCheckoutState("pending");
    setCheckoutMessage(null);

    try {
      const bridge = (window as Window & { MarketPulsePayments?: MarketPulsePaymentsBridge }).MarketPulsePayments;
      const productId = "marketpulse.pro.monthly";
      const result = mode === "restore"
        ? await bridge?.restorePurchases?.()
        : await bridge?.purchasePro?.(productId);
      const isEntitled = result === true || result?.success === true || result?.isPro === true || result?.entitlement === "pro";

      if (isEntitled) {
        setIsProUnlocked(true);
        setShowProPaywall(false);
        haptic.success();
        return;
      }

      window.dispatchEvent(new CustomEvent("marketpulse:pro-checkout", {
        detail: { mode, productId, source: "ai_pulse_paywall" },
      }));
      setCheckoutMessage(
        language === "Turkish"
          ? "App Store odeme baglantisi native build icin hazir."
          : "App Store checkout hook is ready for the native build."
      );
    } catch (error) {
      console.error("Pro checkout failed", error);
      haptic.error();
      setCheckoutMessage(language === "Turkish" ? "Odeme baslatilamadi." : "Checkout could not start.");
    } finally {
      setCheckoutState("idle");
    }
  }, [language, setIsProUnlocked]);

  const generateAIAnalysis = async () => {
    if (!isProUnlocked && aiPulseCredits <= 0) {
      setShowProPaywall(true);
      haptic.error();
      return false;
    }

    setIsAnalyzing(true);
    try {
      // Pass force=true to bypass server cache when manual refresh is requested
      const insight = await fetchMarketInsights(selectedAssetId, activeAsset.name, livePrice, 0, true, timeframe);
      if (insight) {
        setAiAnalysis(insight.aiSummary);
        setExternalSentimentClusters((insight.commentClusters ?? []) as unknown as SentimentCluster[]);
        // We can store the full insight object in detailedPoint already
        setDetailedPoint({
          comments: insight.comments as any,
          sentiment: insight.sentiment,
          count: insight.comments.length,
          avgPrice: livePrice,
          translation: insight.aiSummary,
          globalInsight: insight.globalInsight, // Pass global insight forward
          categorySummaries: insight.categorySummaries,
          type: "consensus",
          categoryStats: insight.categoryStats
        } as any);

        // Success haptic
        haptic.success();
        if (!isProUnlocked) consumeAiPulseCredit();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Analysis failed", e);
      haptic.error();
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerStyle = containerHeight ? { height: containerHeight } : { minHeight: "100dvh" as const };

  if (showSplash) {
    return (
      <div className="bg-[var(--mp-bg)] flex justify-center overflow-x-hidden" style={containerStyle}>
        <div className="w-full max-w-[430px] relative overflow-hidden" style={containerStyle}>
          <SplashScreen isExitingSplash={isExitingSplash} isSplashPressed={isSplashPressed} onSplashClick={handleSplashClick} t={t} />
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${APP_ASSETS.mainBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />

        <AppHeader t={t} onMenuOpen={() => setIsMenuOpen(true)} onSearchToggle={() => setIsSearchActive(!isSearchActive)} />

        <SearchDropdown
          isActive={isSearchActive}
          searchQuery={searchQuery}
          searchResults={searchResults}
          language={language}
          onClose={() => setIsSearchActive(false)}
          onSearchChange={setSearchQuery}
          onSelectAsset={(id) => { setSelectedAssetId(id); setIsSearchActive(false); setSearchQuery(""); }}
          onAddExternalAsset={handleAddExternalAsset}
        />

        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          pinnedAssets={pinnedAssets}
          selectedAssetId={selectedAssetId}
          isEditPinned={isEditPinned}
          menuSearch={menuSearch}
          t={t}
          onEditPinnedToggle={() => setIsEditPinned(!isEditPinned)}
          onRemoveFromPinned={removeFromPinned}
          onAddToPinned={(id) => setPinnedAssets([...pinnedAssets, id])}
          onMenuSearchChange={setMenuSearch}
          onSelectAsset={(id) => { setSelectedAssetId(id); setActiveTab("dashboard"); }}
        />

        {isAssetPickerOpen && (
          <AssetWheelPicker
            key="asset-picker"
            assets={ASSETS.filter(a => watchlistAssets.includes(a.id))}
            selectedAssetId={selectedAssetId}
            onSelect={(id) => { setSelectedAssetId(id); setIsAssetPickerOpen(false); }}
            onClose={() => setIsAssetPickerOpen(false)}
          />
        )}

        <main
          className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{
            paddingTop: "calc(122px + env(safe-area-inset-top))",
            paddingBottom: "calc(90px + env(safe-area-inset-bottom))",
          }}
        >
          <AnimatePresence mode="wait">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--mp-cyan)] border-t-transparent rounded-full animate-spin" /></div>}>
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
                  sentimentClusters={visibleSentimentClusters}
                  chartCrosshair={chartCrosshair}
                  setChartCrosshair={setChartCrosshair}
                  handleChartTap={handleChartTap}
                  openCommentSheet={openCommentSheet}
                  handlePointClick={handlePointClick}
                  openPointDetail={openPointDetail}
                  isAnalyzing={isAnalyzing}
                  aiAnalysis={aiAnalysis}
                  generateAIAnalysis={generateAIAnalysis}
                  aiPulseCredits={aiPulseCredits}
                  aiPulseLimit={AI_PULSE_FREE_LIMIT}
                  isProUnlocked={isProUnlocked}
                  onProClick={() => setShowProPaywall(true)}
                  setShowMyComments={setShowMyComments}
                  activeUserComments={activeUserComments}
                  setIsMenuOpen={setIsMenuOpen}
                  setIsAssetPickerOpen={setIsAssetPickerOpen}
                  currency={currency}
                  setCurrency={setCurrency}
                />
              )}

              {activeTab === "markets" && (
                <MarketsTab
                  language={language}
                  t={t}
                  watchlistAssets={watchlistAssets}
                  watchlistSort={watchlistSort}
                  setWatchlistSort={setWatchlistSort}
                  watchlistLayout={watchlistLayout}
                  setWatchlistLayout={setWatchlistLayout}
                  marketsSubTab={marketsSubTab}
                  setMarketsSubTab={setMarketsSubTab}
                  selectedAssetId={selectedAssetId}
                  setSelectedAssetId={setSelectedAssetId}
                  setActiveTab={setActiveTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  handleAddExternalAsset={handleAddExternalAsset}
                  selectedMarket={selectedMarket}
                  setSelectedMarket={setSelectedMarket}
                  showMarketPicker={showMarketPicker}
                  setShowMarketPicker={setShowMarketPicker}
                  marketPickerSearch={marketPickerSearch}
                  setMarketPickerSearch={setMarketPickerSearch}
                  moversPeriod={moversPeriod}
                  setMoversPeriod={setMoversPeriod}
                  gainersExpanded={gainersExpanded}
                  setGainersExpanded={setGainersExpanded}
                  losersExpanded={losersExpanded}
                  setLosersExpanded={setLosersExpanded}
                />
              )}

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
                  userComments={userComments}
                  selectedAssetId={selectedAssetId}
                  activeAssetName={activeAsset.name}
                  livePrice={livePrice}
                  timeframe={timeframe}
                />
              )}

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
            isAnalyzing={isAnalyzing}
            generateAIAnalysis={generateAIAnalysis}
            onSubmitPointComment={submitDetailedPointComment}
          />
        </Suspense>

        <AnimatePresence>
          {showProPaywall && (
            <motion.div
              className="absolute inset-0 z-[320] flex items-end justify-center bg-black/70 px-4 pb-4 pt-12 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProPaywall(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="w-full max-w-[398px] rounded-[30px] border border-white/10 bg-[#07090f]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.72)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--mp-cyan)]/20 bg-[var(--mp-cyan)]/10 px-3 py-1">
                      <Brain className="h-3.5 w-3.5 text-[var(--mp-cyan)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--mp-cyan)]">Market Pulse Pro</span>
                    </div>
                    <h2 className="text-[24px] font-black leading-[1.02] tracking-normal text-white">
                      {language === "Turkish" ? "Sinyali kacirmadan yakala." : "Catch the signal first."}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowProPaywall(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { value: "AI+", label: language === "Turkish" ? "AI pulse" : "AI pulses" },
                    { value: "24/7", label: language === "Turkish" ? "Alarm" : "Alerts" },
                    { value: "Pro", label: language === "Turkish" ? "Akis" : "Feed" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-white/[0.08] bg-white/[0.045] px-3 py-3 text-center">
                      <div className="text-[18px] font-black leading-none text-white">{item.value}</div>
                      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/[0.38]">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    language === "Turkish" ? "Sinirsiz AI market pulse" : "Unlimited AI market pulses",
                    language === "Turkish" ? "Haber ve topluluk duygu onceligi" : "News and community sentiment priority",
                    language === "Turkish" ? "Watchlist icin daha hizli alarm akisi" : "Faster alert flow for your watchlist",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 rounded-2xl bg-white/[0.035] px-3 py-2">
                      <Shield className="h-3.5 w-3.5 shrink-0 text-[var(--mp-green)]" />
                      <span className="text-[11px] font-medium leading-snug text-white/[0.72]">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.045] p-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/[0.38]">
                        {language === "Turkish" ? "Pro plan" : "Pro plan"}
                      </div>
                      <div className="mt-1 text-[26px] font-black leading-none text-white">$6.99<span className="text-[11px] text-white/[0.38]">/mo</span></div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/60">
                      {language === "Turkish" ? "7 gun deneme" : "7-day trial"}
                    </div>
                  </div>
                </div>

                {checkoutMessage && (
                  <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] leading-relaxed text-white/[0.48]">
                    {checkoutMessage}
                  </p>
                )}

                <button
                  onClick={() => completeProCheckout("purchase")}
                  disabled={checkoutState === "pending"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3 text-[12px] font-black uppercase tracking-[0.14em] text-black transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {checkoutState === "pending"
                    ? (language === "Turkish" ? "Baslatiliyor" : "Starting")
                    : (language === "Turkish" ? "Pro'yu baslat" : "Start Pro")}
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => completeProCheckout("restore")}
                  disabled={checkoutState === "pending"}
                  className="mt-2 w-full py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white/70 disabled:opacity-50"
                >
                  {language === "Turkish" ? "Satinalmayi geri yukle" : "Restore purchase"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  onClick={() => {
                    haptic.light();
                    setActiveTab(tab.id as any);
                    setProfilePage(null);
                  }}
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
