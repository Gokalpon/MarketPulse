import React, { useEffect, useMemo, useCallback, useRef, Suspense } from "react";
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
import { GlowButton } from "@/components/market/GlowButton";
import { AssetWheelPicker } from "@/components/market/AssetWheelPicker";
import { NotifToggle } from "@/components/market/NotifToggle";
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
import { useAppStore } from "@/stores/useAppStore";
import { WatchlistCard } from "@/components/market/WatchlistCard";

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

export default function MarketPulseApp({ containerHeight }: { containerHeight?: number } = {}) {
  // ============================================
  // ZUSTAND STORE - All state from central store
  // ============================================
  const {
    // UI State
    showSplash, setShowSplash, isExitingSplash, setIsExitingSplash,
    isSplashPressed, setIsSplashPressed, isLoggedIn, setIsLoggedIn,
    activeTab, setActiveTab, isMenuOpen, setIsMenuOpen,
    isSearchActive, setIsSearchActive, chartExpanded, setChartExpanded,
    
    // Markets State
    marketsSubTab, setMarketsSubTab, watchlistLayout, setWatchlistLayout,
    watchlistSort, setWatchlistSort, gainersExpanded, setGainersExpanded,
    losersExpanded, setLosersExpanded, moversPeriod, setMoversPeriod,
    moversCategory, setMoversCategory, selectedMarket, setSelectedMarket,
    showMarketPicker, setShowMarketPicker, marketPickerSearch, setMarketPickerSearch,
    
    // Asset State
    selectedAssetId, setSelectedAssetId, timeframe, setTimeframe,
    currency, setCurrency, selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint, chartCrosshair, setChartCrosshair,
    
    // User State
    profilePicture, setProfilePicture, watchlistAssets, setWatchlistAssets,
    pinnedAssets, setPinnedAssets, userComments, isEditPinned, setIsEditPinned,
    addToWatchlist, removeFromWatchlist, addToPinned, removeFromPinned,
    
    // Comment State
    showCommentSheet, setShowCommentSheet, commentChartIdx, setCommentChartIdx,
    commentText, setCommentText, commentSentiment, setCommentSentiment,
    showMyComments, setShowMyComments, commentsExpanded, setCommentsExpanded,
    commentsTimeframe, setCommentsTimeframe, addUserComment, deleteUserComment,
    
    // Search State
    searchQuery, setSearchQuery, searchResults, setSearchResults,
    isSearching, setIsSearching, expandedCategory, setExpandedCategory,
    
    // Settings State
    language, setLanguage, autoTranslate, setAutoTranslate,
    showNewsBubbles, setShowNewsBubbles, showAIConsensus, setShowAIConsensus,
    sentimentFilter, setSentimentFilter,
    
    // AI State
    isAnalyzing, setIsAnalyzing, aiAnalysis, setAiAnalysis,
  } = useAppStore();

  // Local UI state (not persisted, component-specific)
  const [isAssetPickerOpen, setIsAssetPickerOpen] = React.useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);
  const [langMenuPos, setLangMenuPos] = React.useState({ top: 0, left: 0 });
  const [communityTab, setCommunityTab] = React.useState("community");
  const [profilePage, setProfilePage] = React.useState<string | null>(null);
  const [menuSearch, setMenuSearch] = React.useState("");
  
  const languageButtonRef = useRef<HTMLButtonElement>(null);

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

  // Note: localStorage persistence is handled by Zustand persist middleware

  const activeUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId && c.timeframe === timeframe), [userComments, selectedAssetId, timeframe]);
  const allAssetUserComments = useMemo(() => userComments.filter((c) => c.assetId === selectedAssetId), [userComments, selectedAssetId]);

  // Chart math for sentimentClusters computation
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
    addUserComment(newComment);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

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
      const insight = await fetchMarketInsights(selectedAssetId, activeAsset.name, livePrice);
      if (insight) {
        setAiAnalysis(insight.aiSummary);
        // We set the detailed point to the cluster from Reddit to show averaged view
        setDetailedPoint({
          comments: insight.comments as any,
          sentiment: insight.sentiment,
          count: insight.comments.length,
          avgPrice: livePrice,
          translation: insight.aiSummary,
          type: "consensus",
          categoryStats: insight.categoryStats // Passing new stats to the sheet
        } as any);
      }
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerStyle = containerHeight ? { height: containerHeight } : { minHeight: "100dvh" as const };

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
        <AppHeader t={t} onMenuOpen={() => setIsMenuOpen(true)} onSearchToggle={() => setIsSearchActive(!isSearchActive)} />

        {/* Search Dropdown */}
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

        {/* Side Menu */}
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

        {/* Main Content */}
        <main
          className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{
            paddingTop: "calc(110px + env(safe-area-inset-top))",
            paddingBottom: "calc(90px + env(safe-area-inset-bottom))",
          }}
        >
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
                currency={currency}
                setCurrency={setCurrency}
              />
            )}

            {/* MARKETS TAB */}
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
