import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCountUpAnimation } from "@/hooks/useCountUpAnimation";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  Brain, Edit3, ExternalLink, WifiOff, Plus, X, Settings, Lock, MessageCircle,
} from "lucide-react";
import { GlowButton } from "@/components/market/GlowButton";
import { haptic } from "@/services/hapticService";

function LiveDot() {
  const colors = ["#3b82f6", "#22c55e", "#ffffff", "#22c55e", "#3b82f6"];
  return (
    <motion.span
      style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }}
      animate={{ backgroundColor: colors, boxShadow: colors.map(c => `0 0 6px ${c}88`) }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

interface DashboardTabProps {
  language: string;
  t: any;
  activeAsset: any;
  activeData: number[];
  livePrice: number;
  liveChange: string;
  liveIsUp: boolean;
  isLive: boolean;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  chartExpanded: boolean;
  setChartExpanded: (v: boolean) => void;
  showNewsBubbles: boolean;
  setShowNewsBubbles: (v: boolean) => void;
  showAIConsensus: boolean;
  setShowAIConsensus: (v: boolean) => void;
  activeTranslations: any[];
  selectedPoint: any;
  setSelectedPoint: (p: any) => void;
  sentimentClusters: any[];
  chartCrosshair: { idx: number; price: number; x: number; y: number } | null;
  setChartCrosshair: (c: any) => void;
  handleChartTap: (e: React.MouseEvent<HTMLDivElement>) => void;
  openCommentSheet: (idx?: number) => void;
  handlePointClick: (point: any) => void;
  openPointDetail?: (point: any) => void;
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  generateAIAnalysis: () => Promise<boolean>;
  aiPulseCredits: number;
  aiPulseLimit: number;
  isProUnlocked: boolean;
  onProClick: () => void;
  setShowMyComments: (v: boolean) => void;
  activeUserComments: any[];
  setIsMenuOpen: (v: boolean) => void;
  setIsAssetPickerOpen: (v: boolean) => void;
  currency: string;
  setCurrency: (c: string) => void;
}

type ChartClusterPosition = {
  avgPrice?: number | string;
};

type DashboardInsightPoint = {
  idx: number;
  type?: string;
  sentiment?: "Positive" | "Negative" | "Neutral";
  translation?: string;
  newsUrl?: string;
};

type DashboardSentimentCluster = ChartClusterPosition & {
  avgIdx: number;
  bindingKind?: "exact_price" | "inferred_time" | "session_context" | "unbound";
  comments?: Array<{ text?: string; sentiment?: "Positive" | "Negative" | "Neutral"; likes?: number }>;
  count?: number;
  origin?: "user" | "external" | string;
  sentiment?: "Positive" | "Negative" | "Neutral";
  translation?: string;
};

export function DashboardTab({
  language, t, activeAsset, activeData,
  livePrice, liveChange, liveIsUp, isLive,
  timeframe, setTimeframe, chartExpanded, setChartExpanded,
  showNewsBubbles, setShowNewsBubbles, showAIConsensus, setShowAIConsensus,
  activeTranslations, selectedPoint, setSelectedPoint, sentimentClusters,
  chartCrosshair, setChartCrosshair, handleChartTap, openCommentSheet, handlePointClick,
  openPointDetail,
  isAnalyzing, aiAnalysis, generateAIAnalysis, setShowMyComments, activeUserComments,
  aiPulseCredits, aiPulseLimit, isProUnlocked, onProClick,
  setIsMenuOpen, setIsAssetPickerOpen,
  currency, setCurrency,
}: DashboardTabProps) {
  const ALL_CURRENCIES = [
    { id: "USD", name: "US Dollar", symbol: "$", rate: 1 },
    { id: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
    { id: "GBP", name: "British Pound", symbol: "£", rate: 0.79 },
    { id: "JPY", name: "Japanese Yen", symbol: "¥", rate: 149 },
    { id: "TRY", name: "Turkish Lira", symbol: "₺", rate: 32 },
    { id: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 7.24 },
    { id: "CHF", name: "Swiss Franc", symbol: "Fr", rate: 0.90 },
    { id: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.53 },
    { id: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.36 },
    { id: "KRW", name: "South Korean Won", symbol: "₩", rate: 1340 },
    { id: "INR", name: "Indian Rupee", symbol: "₹", rate: 83 },
    { id: "XAU", name: "Gold (oz)", symbol: "oz", rate: 1 / 2035 },
  ];
  const ALL_TIMEFRAMES = ["1H","4H","1D","3D","1W","2W","1M","3M","6M","1Y","2Y","5Y","ALL"];
  const currMeta = ALL_CURRENCIES.find(c => c.id === currency) || ALL_CURRENCIES[0];
  const { rate, symbol: currSymbol } = currMeta;
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [showTfPicker, setShowTfPicker] = useState(false);
  const [customTimeframes, setCustomTimeframes] = useState<string[]>(() => {
    try { const s = localStorage.getItem("customTimeframes"); return s ? JSON.parse(s) : ["1H","1D","1W","1M","1Y","ALL"]; } catch { return ["1H","1D","1W","1M","1Y","ALL"]; }
  });
  const convertedPrice = livePrice * rate;
  const [chartHeightLevel, setChartHeightLevel] = useState(1); // 0=xs 1=sm 2=md 3=lg
  const [chartWide, setChartWide] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentPriceInput, setCommentPriceInput] = useState("");
  const [commentInputMode, setCommentInputMode] = useState<"price" | "time">("price");
  const [matchingPriceOptions, setMatchingPriceOptions] = useState<{ visIdx: number; globalIdx: number; date: Date }[] | null>(null);
  const [dateListExpanded, setDateListExpanded] = useState(false);
  const [dateSearch, setDateSearch] = useState("");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGhostFinger, setShowGhostFinger] = useState(() => !localStorage.getItem("ghostFingerShown"));
  const startTouchY = useRef(0);

  const prevPriceRef = useRef(livePrice);
  const [animStart, setAnimStart] = useState(livePrice);
  useEffect(() => {
    setAnimStart(prevPriceRef.current);
    prevPriceRef.current = livePrice;
  }, [livePrice]);
  const animatedPrice = useCountUpAnimation({
    end: livePrice,
    start: animStart,
    duration: 800,
    decimals: 2,
    easingFn: 'easeInOutCubic',
    formatLocale: false,
  });
  const chartHeightValues = [150, 240, 330, 430];

  // Pinch-to-zoom
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);
  const pinchRef = useRef<{ lastDist: number; centerPct: number } | null>(null);
  const chartDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setZoomRange(null); }, [activeData]);

  const visibleData = useMemo(() => {
    if (!zoomRange || activeData.length === 0) return activeData;
    return activeData.slice(Math.max(0, zoomRange.start), Math.min(activeData.length, zoomRange.end));
  }, [activeData, zoomRange]);
  const zoomStart = zoomRange?.start ?? 0;
  const isVisibleIndex = useCallback((idx?: number) => {
    if (!Number.isFinite(idx)) return false;
    const vi = Number(idx) - zoomStart;
    return vi >= 0 && vi < visibleData.length;
  }, [visibleData.length, zoomStart]);

  const displayedInsightPoints = useMemo<DashboardInsightPoint[]>(() => {
    const visiblePoints = (activeTranslations as DashboardInsightPoint[]).filter((point) => isVisibleIndex(point.idx));
    const news = showNewsBubbles
      ? visiblePoints.filter((point) => point.type === "news").slice(0, 2)
      : [];
    const consensus = showAIConsensus
      ? visiblePoints.filter((point) => point.type !== "news").slice(0, 5)
      : [];
    return [...news, ...consensus];
  }, [activeTranslations, isVisibleIndex, showAIConsensus, showNewsBubbles]);

  const displayedSentimentClusters = useMemo<DashboardSentimentCluster[]>(() => {
    const rankCluster = (cluster: DashboardSentimentCluster) => {
      if (cluster.origin !== "external") return 3;
      if (cluster.bindingKind === "exact_price") return 0;
      if (cluster.bindingKind === "inferred_time") return 1;
      return 2;
    };

    return (sentimentClusters as DashboardSentimentCluster[])
      .filter((cluster) => (cluster.origin !== "external" || showAIConsensus) && isVisibleIndex(cluster.avgIdx))
      .sort((a, b) => rankCluster(a) - rankCluster(b) || (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 5);
  }, [isVisibleIndex, sentimentClusters, showAIConsensus]);

  const visibleCommentCount = useMemo(
    () => displayedSentimentClusters.reduce((sum, cluster) => sum + (cluster.count ?? cluster.comments?.length ?? 1), 0),
    [displayedSentimentClusters]
  );
  const externalCommentCount = useMemo(
    () => displayedSentimentClusters
      .filter((cluster) => cluster.origin === "external")
      .reduce((sum, cluster) => sum + (cluster.count ?? cluster.comments?.length ?? 1), 0),
    [displayedSentimentClusters]
  );

  const rawMin = visibleData.length > 0 ? Math.min(...visibleData) : 0;
  const rawMax = visibleData.length > 0 ? Math.max(...visibleData) : 1;
  const dataRange = (rawMax - rawMin) || rawMin * 0.01 || 1;
  const padding = dataRange * 0.15;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;
  const range = maxVal - minVal;

  const getX = (i: number) => visibleData.length > 1 ? 4 + (i / (visibleData.length - 1)) * 92 : 50;
  const getY = (v: number) => 8 + (100 - ((v - minVal) / range) * 100) * 0.84;
  const getClusterY = (cluster: ChartClusterPosition, fallbackIndex: number) => {
    const avgPrice = Number(cluster.avgPrice);
    const markerPrice = Number.isFinite(avgPrice) ? avgPrice : visibleData[fallbackIndex];
    return Math.max(3, Math.min(97, getY(markerPrice)));
  };

  const getPointDate = (visIdx: number): Date => {
    const intervalMs: Record<string, number> = { "1H": 5*60*1000, "4H": 30*60*1000, "1D": 15*60*1000, "3D": 60*60*1000, "1W": 60*60*1000, "2W": 24*60*60*1000, "1M": 24*60*60*1000, "3M": 24*60*60*1000, "6M": 7*24*60*60*1000, "1Y": 7*24*60*60*1000, "2Y": 30*24*60*60*1000, "5Y": 30*24*60*60*1000, "ALL": 30*24*60*60*1000 };
    const ms = intervalMs[timeframe] || intervalMs["1D"];
    const now = new Date();
    const actualIdx = zoomStart + visIdx;
    return new Date(now.getTime() - (activeData.length - 1 - actualIdx) * ms);
  };

  const handlePriceCommentSubmit = () => {
    const targetPrice = parseFloat(commentPriceInput) || livePrice;
    const closestIdx = visibleData.reduce((best, v, i) => Math.abs(v - targetPrice) < Math.abs(visibleData[best] - targetPrice) ? i : best, 0);
    const closestPrice = visibleData[closestIdx];
    const tolerance = Math.max(0.01, Math.abs(closestPrice) * 0.001);
    const matches = visibleData
      .map((v, i) => ({ visIdx: i, globalIdx: i + zoomStart, v }))
      .filter(({ v }) => Math.abs(v - closestPrice) <= tolerance)
      .map(({ visIdx, globalIdx }) => ({ visIdx, globalIdx, date: getPointDate(visIdx) }));
    if (matches.length > 1) {
      // Sort oldest→newest so last item = nearest (most recent)
      matches.sort((a, b) => a.visIdx - b.visIdx);
      setMatchingPriceOptions(matches);
      setDateListExpanded(false);
      setDateSearch("");
    } else {
      openCommentSheet(closestIdx + zoomStart);
      setShowCommentInput(false);
    }
  };
  const pathD = useMemo(() =>
    visibleData.length > 1 ? visibleData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d)}`).join(" ") : "M 50 50",
    [visibleData, minVal, maxVal] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const areaD = useMemo(() =>
    visibleData.length > 1 ? `${pathD} L ${getX(visibleData.length - 1)} 100 L ${getX(0)} 100 Z` : "M 50 50 L 50 100 L 50 100 Z",
    [pathD, visibleData.length] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // X-axis date labels
  const xAxisLabels = useMemo(() => {
    const count = visibleData.length;
    if (count < 2) return [];
    const now = new Date();
    const intervalMs: Record<string, number> = { "1H": 5*60*1000, "4H": 30*60*1000, "1D": 15*60*1000, "3D": 60*60*1000, "1W": 60*60*1000, "2W": 24*60*60*1000, "1M": 24*60*60*1000, "3M": 24*60*60*1000, "6M": 7*24*60*60*1000, "1Y": 7*24*60*60*1000, "2Y": 30*24*60*60*1000, "5Y": 30*24*60*60*1000, "ALL": 30*24*60*60*1000 };
    const ms = intervalMs[timeframe] || intervalMs["1D"];
    return Array.from({ length: 5 }, (_, li) => {
      const idx = Math.round(li * (count - 1) / 4);
      const actualIdx = zoomStart + idx;
      const totalLen = activeData.length;
      const pointTime = new Date(now.getTime() - (totalLen - 1 - actualIdx) * ms);
      let label = "";
      if (timeframe === "1H" || timeframe === "4H") label = pointTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      else if (timeframe === "1D") label = pointTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      else if (timeframe === "3D" || timeframe === "1W" || timeframe === "2W") label = pointTime.toLocaleDateString([], { weekday: "short", day: "numeric" });
      else if (timeframe === "1M" || timeframe === "3M") label = pointTime.toLocaleDateString([], { month: "short", day: "numeric" });
      else if (timeframe === "6M" || timeframe === "1Y" || timeframe === "2Y") label = pointTime.toLocaleDateString([], { month: "short", year: "2-digit" });
      else label = pointTime.toLocaleDateString([], { year: "numeric" });
      return { x: 4 + (idx / (count - 1)) * 92, label };
    });
  }, [visibleData, timeframe, zoomStart, activeData.length]);

  const handlePinchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const rect = chartDivRef.current?.getBoundingClientRect();
    const centerX = rect ? ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width : 0.5;
    pinchRef.current = { lastDist: dist, centerPct: centerX };
  };
  const handlePinchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const scale = pinchRef.current.lastDist / dist;
    const cur = zoomRange ?? { start: 0, end: activeData.length };
    const len = cur.end - cur.start;
    const center = cur.start + pinchRef.current.centerPct * len;
    const newLen = Math.min(activeData.length, Math.max(8, Math.round(len * scale)));
    const newStart = Math.max(0, Math.round(center - pinchRef.current.centerPct * newLen));
    const newEnd = Math.min(activeData.length, newStart + newLen);
    setZoomRange(newStart === 0 && newEnd === activeData.length ? null : { start: newStart, end: newEnd });
    pinchRef.current.lastDist = dist;
  };
  const handlePinchEnd = () => { pinchRef.current = null; };

  // Pull to refresh logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (chartExpanded) return;
    if (window.scrollY === 0) {
      startTouchY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (chartExpanded || startTouchY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startTouchY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      haptic.success();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
    startTouchY.current = 0;
  };

  useEffect(() => {
    if (showGhostFinger) {
      const timer = setTimeout(() => {
        setShowGhostFinger(false);
        localStorage.setItem("ghostFingerShown", "true");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showGhostFinger]);

  const remainingAiCredits = isProUnlocked ? aiPulseLimit : Math.max(0, Math.min(aiPulseLimit, aiPulseCredits));
  const aiCreditsUsed = isProUnlocked ? 0 : Math.max(0, aiPulseLimit - remainingAiCredits);
  const aiActionLabel = isProUnlocked
    ? "Pro Pulse"
    : remainingAiCredits > 0
      ? t.refreshAnalysis
      : (language === "Turkish" ? "Pro'ya Gec" : "Go Pro");
  const aiCreditsText = isProUnlocked
    ? (language === "Turkish" ? "Sinirsiz Pro erisim" : "Unlimited Pro access")
    : (language === "Turkish" ? `${remainingAiCredits}/${aiPulseLimit} ucretsiz pulse kaldi` : `${remainingAiCredits}/${aiPulseLimit} free pulses left`);
  const getClusterColor = (cluster: DashboardSentimentCluster) => {
    if (cluster.origin !== "external") return "#B24BF3";
    return "#FFFFFF";
  };
  const getClusterShadow = (cluster: DashboardSentimentCluster) => {
    if (cluster.origin !== "external") return "0 10px 30px rgba(178,75,243,0.6)";
    return "0 10px 30px rgba(255,255,255,0.28)";
  };
  const getClusterLabel = (cluster: DashboardSentimentCluster) => {
    if (cluster.origin !== "external") return cluster.sentiment;
    return language === "Turkish" ? "ORTALAMA" : "CONSENSUS";
  };
  const getClusterTextColor = (cluster: DashboardSentimentCluster) => {
    if (cluster.origin === "external") return "#030608";
    return "#FFFFFF";
  };
  const getClusterConsensusText = (cluster: DashboardSentimentCluster) => {
    if (cluster.origin !== "external") {
      return cluster.translation || cluster.comments?.[0]?.text || "Community sentiment";
    }

    if (cluster.sentiment === "Positive") {
      return language === "Turkish"
        ? "Ortalama yorum bu seviyede pozitif beklentinin öne çıktığını gösteriyor."
        : "Average consensus shows a bullish bias around this level.";
    }

    if (cluster.sentiment === "Negative") {
      return language === "Turkish"
        ? "Ortalama yorum bu seviyede risk ve satış baskısının öne çıktığını gösteriyor."
        : "Average consensus shows risk and selling pressure around this level.";
    }

    return language === "Turkish"
      ? "Ortalama yorum bu seviyede net yön yerine bekle-gör havası olduğunu gösteriyor."
      : "Average consensus shows a wait-and-see mood around this level.";
  };

  return (
    <motion.div
      key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-[200]" style={{ height: pullDistance, opacity: pullDistance / 60 }}>
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          className="mt-4 w-6 h-6 rounded-full border-2 border-[var(--mp-cyan)] border-t-transparent shadow-[0_0_10px_rgba(0,255,255,0.4)]"
        />
      </div>

      <div className={`${chartWide ? "" : "px-4"} mt-2 transition-all duration-500`} style={{ transform: `translateY(${pullDistance}px)` }}>
        <div className={`mp-glass-card ${chartWide ? "rounded-none" : "rounded-[32px]"} p-6 relative shadow-lg transition-all duration-500`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 relative">
                <span className="text-[var(--mp-text-secondary)] text-[11px] font-semibold tracking-[0.15em]">{activeAsset.symbol}</span>
                <button onClick={() => { setCurrency("USD"); setShowCurrencyPicker(false); }}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all ${currency === "USD" ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/40 hover:text-white/70"}`}>
                  USD
                </button>
                <button onClick={() => setShowCurrencyPicker(v => !v)}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all ${currency !== "USD" ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/40 hover:text-white/70"}`}>
                  {currency !== "USD" ? currency : "···"}
                </button>
                {showCurrencyPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-[#0a0c10]/95 backdrop-blur-xl rounded-2xl p-3 w-52 shadow-2xl border border-white/10">
                    <input autoFocus value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                      placeholder={language === "Turkish" ? "Para birimi ara..." : "Search currency..."}
                      className="w-full bg-white/[0.06] text-white text-[11px] rounded-xl px-3 py-2 outline-none placeholder:text-white/30 mb-2" />
                    <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto">
                      {ALL_CURRENCIES.filter(c => c.id.toLowerCase().includes(currencySearch.toLowerCase()) || c.name.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                        <button key={c.id} onClick={() => { setCurrency(c.id); setShowCurrencyPicker(false); setCurrencySearch(""); }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] transition-all text-left ${currency === c.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                          <span className="font-black">{c.id}</span>
                          <span className="text-white/40 text-[10px]">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <motion.div
                className="font-price text-foreground text-[clamp(30px,9vw,38px)] font-bold leading-none mb-4 inline-block pr-2"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {currSymbol}{(parseFloat(animatedPrice) * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] ${liveChange.startsWith("+") ? "mp-positive-badge" : liveChange.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>
                  {liveIsUp ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                  {liveChange}
                </div>
                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <>
                      <LiveDot />
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white">{language === "Turkish" ? "CANLI" : "LIVE"}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30">{t.liveMarket}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div onClick={() => setIsAssetPickerOpen(true)} className="w-8 h-8 shrink-0 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* Chart */}
          <div className="relative mt-8 w-full transition-all duration-500" style={{ height: chartHeightValues[chartHeightLevel] + 20 }}>
            <div className="absolute inset-0 bottom-5 flex">

                <div
                  ref={chartDivRef}
                  className="flex-1 relative"
                  onClick={(e) => {
                    handleChartTap(e);
                    if (showGhostFinger) setShowGhostFinger(false);
                  }}
                  onTouchStart={handlePinchStart}
                  onTouchMove={handlePinchMove}
                  onTouchEnd={handlePinchEnd}
                >
                  {/* Ghost Finger Guide */}
                  {showGhostFinger && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[150]">
                      <div className="mp-ghost-finger relative">
                         <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-md" />
                         <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black tracking-widest text-white/40">EXPLORE CHART</div>
                      </div>
                    </div>
                  )}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#39FF14" />
                      <stop offset="100%" stopColor="#00FFFF" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dotGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                      <stop offset="0%" stopColor="#00FFFF" />
                      <stop offset="100%" stopColor="#00FF87" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill="url(#areaGrad)" />
                  <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                  {chartCrosshair && <line x1={chartCrosshair.x} y1="0" x2={chartCrosshair.x} y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" opacity="0.3" />}

                  {/* dots rendered as CSS divs outside SVG for perfect circles */}

                  {/* Live terminal dot */}
                  {visibleData.length > 1 && (() => {
                    const lx = getX(visibleData.length - 1);
                    const ly = getY(visibleData[visibleData.length - 1]);
                    return (
                      <>
                        <circle cx={lx} cy={ly} r="2.25" fill="#00FFFF" opacity="0.3" vectorEffect="non-scaling-stroke" />
                        <circle cx={lx} cy={ly} r="1.26" fill="#00FFFF" vectorEffect="non-scaling-stroke" />
                      </>
                    );
                  })()}
                </svg>

                {/* NEWS / CONSENSUS dots — CSS div, her zaman mükemmel yuvarlak */}
                {displayedInsightPoints.map((point) => {
                  const isNews = point.type === "news";
                  if (isNews && !showNewsBubbles) return null;
                  if (!isNews && !showAIConsensus) return null;
                  if (selectedPoint?.idx === point.idx) return null;
                  const vi = point.idx - zoomStart;
                  if (vi < 0 || vi >= visibleData.length) return null;
                  const xi = Math.min(vi, visibleData.length - 1);
                  return (
                    <div
                      key={`dot-css-${point.idx}`}
                      data-testid={isNews ? "news-marker" : "ai-consensus-marker"}
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: `${getX(xi)}%`,
                        top: `${getY(visibleData[xi])}%`,
                        transform: "translate(-50%, -50%)",
                        width: 14, height: 14,
                        borderRadius: "50%",
                        background: isNews ? "linear-gradient(135deg, #00FFFF, #00FF87)" : "white",
                        boxShadow: isNews ? "0 0 18px rgba(0,255,255,0.32)" : "0 0 18px rgba(255,255,255,0.18)",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}

                {/* SENTIMENT CLUSTER dots — CSS div, her zaman mükemmel yuvarlak */}
                {displayedSentimentClusters.map((cluster, ci) => {
                  if (selectedPoint?.avgIdx === cluster.avgIdx) return null;
                  const vi = cluster.avgIdx - zoomStart;
                  if (vi < 0 || vi >= visibleData.length) return null;
                  const xi = Math.max(0, Math.min(visibleData.length - 1, vi));
                  const size = cluster.count >= 5 ? 20 : cluster.count >= 2 ? 18 : 14;
                  const color = getClusterColor(cluster);
                  return (
                    <div
                      key={`dot-cluster-css-${ci}`}
                      data-testid="comment-consensus-marker"
                      className="absolute pointer-events-none z-10 flex items-center justify-center"
                      style={{
                        left: `${getX(xi)}%`,
                        top: `${getClusterY(cluster, xi)}%`,
                        transform: "translate(-50%, -50%)",
                        width: size, height: size,
                        borderRadius: "50%",
                        background: color,
                        border: cluster.bindingKind === "session_context" ? "1px solid rgba(255,255,255,0.24)" : "none",
                        flexShrink: 0,
                      }}
                    >
                    </div>
                  );
                })}

                {/* Crosshair */}
                {chartCrosshair && (
                  <div className="absolute z-40" style={{ left: `${chartCrosshair.x}%`, top: `${chartCrosshair.y}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="w-4 h-4 rounded-full bg-foreground border-2 border-[var(--mp-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                    <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-6 whitespace-nowrap flex flex-col items-center gap-2" style={chartCrosshair.x > 65 ? { right: 0 } : chartCrosshair.x < 35 ? { left: 0 } : { left: "50%", transform: "translateX(-50%)" }}>
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-1.5">
                        <div className="text-[14px] font-bold text-foreground">{currSymbol}{(chartCrosshair.price * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); openCommentSheet(); }} className="flex items-center gap-1.5 mp-gradient-badge text-background font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.3)] active:scale-95 transition-transform">
                        <Edit3 className="w-3 h-3" strokeWidth={3} />
                        {language === "Turkish" ? "Yorum Yaz" : "Add Comment"}
                      </button>
                    </motion.div>
                  </div>
                )}

                {/* News / Consensus overlay — parent sabit konumda, içerik değişir */}
                {displayedInsightPoints.map((point) => {
                  const isSelected = selectedPoint?.idx === point.idx;
                  const vi = point.idx - zoomStart;
                  if (vi < 0 || vi >= visibleData.length) return null;
                  const xi = Math.min(vi, visibleData.length - 1);
                  const xPercent = getX(xi);
                  const yPercent = getY(visibleData[xi]);
                  const isNews = point.type === "news";
                  if (isNews && !showNewsBubbles) return null;
                  if (!isNews && !showAIConsensus) return null;
                  return (
                    <div
                      key={point.idx}
                      className={`absolute ${isSelected ? "z-30" : "z-20"}`}
                      style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: "translate(-50%, -50%)" }}
                    >
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className={`w-21 h-21 rounded-full shrink-0 flex items-center justify-center overflow-hidden cursor-pointer ${isNews ? "" : "bg-foreground shadow-[0_10px_30px_rgba(255,255,255,0.3)]"}`}
                          style={{
                            width: 110,
                            height: 110,
                            ...(isNews
                              ? { background: "linear-gradient(135deg, #00FFFF, #00FF87)", boxShadow: "0 10px 30px rgba(0,255,255,0.38)" }
                              : {}),
                          }}
                          onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}
                        >
                          <div className="p-2 text-center flex flex-col items-center justify-center h-full w-full relative">
                            <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isNews ? "text-background opacity-70" : point.sentiment === "Positive" ? "text-[#00C805]" : point.sentiment === "Negative" ? "text-[var(--mp-red)]" : "text-[#0088FF]"}`}>
                              {isNews ? t.newsAlert : point.sentiment}
                            </div>
                            <div className={`text-[11px] font-bold leading-snug line-clamp-2 mb-1 ${isNews ? "text-background" : "text-[#0A0C0E]"}`}>{point.translation}</div>
                            {isNews ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open('https://www.reuters.com/business/finance', '_blank', 'noopener,noreferrer'); }}
                                className="bg-background/20 hover:bg-background/30 px-2 py-1 rounded flex items-center gap-1.5 transition-colors border border-background/20"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-background" />
                                <span className="text-[9px] font-black uppercase text-background tracking-wider">Source</span>
                              </button>
                            ) : (
                              <div className={`absolute bottom-2 ${isNews ? "text-background/50" : "text-black/30"}`}><ChevronRight className="w-3 h-3 rotate-90" strokeWidth={3} /></div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          className="cursor-pointer rounded-full shrink-0"
                          style={{ width: 30, height: 30 }}
                          onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Clustered user comment sentiment markers */}
                {displayedSentimentClusters.map((cluster, ci) => {
                  const isSelected = selectedPoint?.avgIdx === cluster.avgIdx;
                  const vi = cluster.avgIdx - zoomStart;
                  if (vi < 0 || vi >= visibleData.length) return null;
                  const safeIdx = Math.max(0, Math.min(visibleData.length - 1, vi));
                  const xPct = getX(safeIdx);
                  const yPct = getClusterY(cluster, safeIdx);
                  const color = getClusterColor(cluster);
                  const textColor = getClusterTextColor(cluster);
                  return (
                    <div
                      key={`cluster-${ci}`}
                      className={`absolute ${isSelected ? "z-30" : "z-20"}`}
                      style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -50%)" }}
                    >
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className="rounded-full shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
                          style={{ width: 110, height: 110, background: color, boxShadow: getClusterShadow(cluster) }}
                          onClick={(e) => { e.stopPropagation(); handlePointClick(cluster); }}
                        >
                          <div className="p-2 text-center flex flex-col items-center justify-center h-full w-full relative">
                            <div className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: textColor }}>{getClusterLabel(cluster)}</div>
                            <div className="text-[11px] font-bold leading-snug line-clamp-2 mb-1" style={{ color: textColor }}>{getClusterConsensusText(cluster)}</div>
                            <div className="absolute bottom-2" style={{ color: cluster.origin === "external" && cluster.bindingKind !== "session_context" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)" }}><ChevronDown className="w-3 h-3" strokeWidth={3} /></div>
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          className="cursor-pointer rounded-full shrink-0"
                          style={{ width: 30, height: 30 }}
                          onClick={(e) => { e.stopPropagation(); handlePointClick(cluster); }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Price Scale */}
              <div className="w-12 flex flex-col justify-between py-[8%] pointer-events-none flex-shrink-0">
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const rawPrice = maxVal - pct * range;
                  const p = rawPrice * rate;
                  const formatted = p >= 100000 ? `${(p/1000).toFixed(0)}k` : p >= 10000 ? `${(p/1000).toFixed(1)}k` : p >= 1000 ? `${(p/1000).toFixed(1)}k` : p >= 1 ? p.toFixed(p >= 100 ? 0 : 2) : p.toFixed(4);
                  return <div key={pct} className="text-[7px] text-white/20 font-mono text-right leading-none">{currSymbol}{formatted}</div>;
                })}
              </div>
            </div>

            {/* X-axis date labels */}
            <div className="absolute bottom-0 left-0 right-12 h-5 pointer-events-none">
              {xAxisLabels.map((l, i) => (
                <span
                  key={i}
                  className="absolute text-[7px] text-white/20 font-mono -translate-x-1/2"
                  style={{ left: `${((l.x - 4) / 92) * 100}%`, bottom: 0 }}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 mt-6 flex flex-col gap-4 w-full">
        <div className="flex items-center gap-1 w-full relative">
          {customTimeframes.map((tf) => (
            <GlowButton key={tf} onClick={() => { haptic.light(); setTimeframe(tf); }} glowSize={60} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${timeframe === tf ? "bg-foreground text-background" : "text-[var(--mp-text-secondary)] hover:text-foreground bg-white/5"}`}>{tf}</GlowButton>
          ))}
          <button onClick={() => setShowTfPicker(v => !v)} className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/40 hover:text-white/80 transition-all ml-1">
            <Settings className="w-3.5 h-3.5" />
          </button>
          {showTfPicker && (
            <div className="absolute top-full right-0 mt-2 z-50 bg-[#0a0c10]/95 backdrop-blur-xl rounded-2xl p-4 w-64 shadow-2xl border border-white/10">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">{language === "Turkish" ? "Gösterilecek zaman aralıkları" : "Visible timeframes"}</div>
              <div className="flex flex-wrap gap-2">
                {ALL_TIMEFRAMES.map(tf => {
                  const active = customTimeframes.includes(tf);
                  return (
                    <button key={tf} onClick={() => {
                      const next = active ? customTimeframes.filter(x => x !== tf) : [...customTimeframes, tf].sort((a,b) => ALL_TIMEFRAMES.indexOf(a)-ALL_TIMEFRAMES.indexOf(b));
                      if (next.length === 0) return;
                      setCustomTimeframes(next);
                      localStorage.setItem("customTimeframes", JSON.stringify(next));
                      if (!next.includes(timeframe)) setTimeframe(next[0]);
                    }} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${active ? "bg-white/20 text-white" : "bg-white/[0.05] text-white/30 hover:text-white/60"}`}>{tf}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <GlowButton onClick={() => setShowNewsBubbles(!showNewsBubbles)} className={`flex-1 px-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${showNewsBubbles ? "bg-white text-background border-white shadow-[0_0_15px_rgba(255,255,255,0.18)]" : "bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.09] border-white/10"}`}>
            News
          </GlowButton>
          <GlowButton onClick={() => setShowAIConsensus(!showAIConsensus)} className={`flex-1 px-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${showAIConsensus ? "bg-white text-background border-white shadow-[0_0_15px_rgba(255,255,255,0.18)]" : "bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.09] border-white/10"}`}>
            AI Consensus
          </GlowButton>
          <GlowButton onClick={() => setShowMyComments(true)} className={`flex-1 px-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${activeUserComments.length > 0 ? "mp-gradient-badge-purple text-white border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]" : "bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.09] border-white/10"}`}>
            {language === "Turkish" ? "Yorumlarım" : "My Comments"}
          </GlowButton>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/60">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                  {language === "Turkish" ? "Yorum Akisi" : "Comment Flow"}
                </div>
                <div className="mt-1 truncate text-[11px] font-semibold text-white/65">
                  {visibleCommentCount > 0
                    ? (language === "Turkish" ? `${visibleCommentCount} yorum grafikte isaretli` : `${visibleCommentCount} comments marked on chart`)
                    : (language === "Turkish" ? "Gercek yorum yok. Analiz cek veya ilk yorumu ekle." : "No real comments yet. Pull analysis or add the first one.")}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                haptic.medium();
                if (displayedSentimentClusters.length > 0) {
                  if (openPointDetail) openPointDetail(displayedSentimentClusters[0]);
                  else handlePointClick(displayedSentimentClusters[0]);
                  return;
                }
                if (activeUserComments.length > 0) {
                  setShowMyComments(true);
                  return;
                }
                void generateAIAnalysis();
              }}
              disabled={isAnalyzing}
              className="shrink-0 rounded-xl bg-white/[0.08] px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/65 transition-all hover:bg-white/[0.12] hover:text-white disabled:opacity-45"
            >
              {isAnalyzing
                ? (language === "Turkish" ? "Cekiliyor" : "Pulling")
                : visibleCommentCount > 0
                  ? (language === "Turkish" ? "Gor" : "View")
                  : (language === "Turkish" ? "Analiz Cek" : "Pull")}
            </button>
          </div>
          {externalCommentCount > 0 && (
            <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mp-cyan)]/80">
              {language === "Turkish" ? `${externalCommentCount} dis kaynak yorumu` : `${externalCommentCount} external comments`}
            </div>
          )}
        </div>

        {/* Yorum Ekle */}
        <motion.div layout className="overflow-hidden">
          <GlowButton
            onClick={() => { haptic.medium(); setShowCommentInput(v => !v); setCommentPriceInput(""); }}
            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 backdrop-blur-md ${showCommentInput ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"}`}
          >
            {showCommentInput ? <X className="w-3 h-3" strokeWidth={3} /> : <Plus className="w-3 h-3" strokeWidth={3} />}
            {language === "Turkish" ? "Yorum Ekle" : "Add Comment"}
          </GlowButton>

          <AnimatePresence>
            {showCommentInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className="p-4">
                  {/* Mode toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setCommentInputMode("price")}
                      className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${commentInputMode === "price" ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"}`}
                    >
                      {language === "Turkish" ? "Fiyata Göre" : "By Price"}
                    </button>
                    <button
                      onClick={() => setCommentInputMode("time")}
                      className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${commentInputMode === "time" ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"}`}
                    >
                      {language === "Turkish" ? "Saate Göre" : "By Time"}
                    </button>
                  </div>

                  {commentInputMode === "price" ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2">
                          <span className="text-white/30 text-[11px] font-bold">$</span>
                          <input
                            type="number"
                            value={commentPriceInput}
                            onChange={e => { setCommentPriceInput(e.target.value); setMatchingPriceOptions(null); }}
                            placeholder={livePrice.toFixed(2)}
                            className="flex-1 bg-transparent text-white text-[12px] font-bold outline-none placeholder:text-white/20 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            onKeyDown={e => { if (e.key === "Enter") handlePriceCommentSubmit(); }}
                          />
                        </div>
                        <button
                          onClick={handlePriceCommentSubmit}
                          className="w-10 h-10 rounded-xl mp-gradient-badge flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                        >
                          <Edit3 className="w-4 h-4 text-black" strokeWidth={2.5} />
                        </button>
                      </div>
                      {matchingPriceOptions && matchingPriceOptions.length > 1 && (() => {
                        const locale = language === "Turkish" ? "tr-TR" : "en-US";
                        const filtered = dateSearch
                          ? matchingPriceOptions.filter(opt => opt.date.toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).toLowerCase().includes(dateSearch.toLowerCase()))
                          : matchingPriceOptions;
                        const showAll = dateListExpanded || !!dateSearch;
                        const visible = showAll ? filtered : filtered.slice(-3);
                        const hiddenCount = filtered.length - 3;
                        const nearestGlobalIdx = matchingPriceOptions[matchingPriceOptions.length - 1].globalIdx;
                        return (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-1">
                            <p className="text-[8px] text-white/40 font-bold uppercase tracking-wider mb-1 px-1">
                              {language === "Turkish" ? "Bu fiyat birden fazla noktada görüldü:" : "This price appears multiple times:"}
                            </p>
                            {(dateListExpanded || dateSearch !== "") && (
                              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 mb-1 gap-1.5">
                                <span className="text-white/30 text-[11px]">⌕</span>
                                <input
                                  type="text"
                                  value={dateSearch}
                                  onChange={e => setDateSearch(e.target.value)}
                                  placeholder={language === "Turkish" ? "Tarih ara..." : "Search date..."}
                                  className="flex-1 bg-transparent text-white text-[10px] outline-none placeholder:text-white/25 min-w-0"
                                />
                                {dateSearch && <button onClick={() => setDateSearch("")} className="text-white/30 text-[10px] leading-none">✕</button>}
                              </div>
                            )}
                            {visible.map((opt) => (
                              <button
                                key={opt.globalIdx}
                                onClick={() => {
                                  setChartCrosshair({ idx: opt.globalIdx, price: visibleData[opt.visIdx], x: getX(opt.visIdx), y: getY(visibleData[opt.visIdx]) });
                                  openCommentSheet(opt.globalIdx);
                                  setShowCommentInput(false);
                                  setMatchingPriceOptions(null);
                                }}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                              >
                                <span className="text-[10px] text-white font-medium">
                                  {opt.date.toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {opt.globalIdx === nearestGlobalIdx && (
                                  <span className="text-[8px] text-[var(--mp-cyan)] font-bold uppercase">{language === "Turkish" ? "En Yakın" : "Nearest"}</span>
                                )}
                              </button>
                            ))}
                            {!showAll && hiddenCount > 0 && (
                              <button
                                onClick={() => setDateListExpanded(true)}
                                className="mt-1 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[9px] text-white/50 font-bold uppercase tracking-wider"
                              >
                                {language === "Turkish" ? `+${hiddenCount} daha göster` : `Show ${hiddenCount} more`}
                              </button>
                            )}
                            {showAll && !dateSearch && filtered.length > 3 && (
                              <button
                                onClick={() => setDateListExpanded(false)}
                                className="mt-1 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[9px] text-white/50 font-bold uppercase tracking-wider"
                              >
                                {language === "Turkish" ? "Daralt" : "Collapse"}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <input
                          type="time"
                          value={commentPriceInput}
                          onChange={e => setCommentPriceInput(e.target.value)}
                          className="flex-1 bg-transparent text-white text-[12px] font-bold outline-none min-w-0"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!commentPriceInput) return;
                          const [h, m] = commentPriceInput.split(":").map(Number);
                          const now = new Date();
                          const intervalMs: Record<string, number> = {
                            "1H": 5 * 60 * 1000, "1D": 15 * 60 * 1000, "1W": 60 * 60 * 1000,
                            "1M": 24 * 60 * 60 * 1000, "1Y": 7 * 24 * 60 * 60 * 1000,
                          };
                          const ms = intervalMs[timeframe] || intervalMs["1D"];
                          const targetMs = (h * 60 + m) * 60 * 1000;
                          const totalLen = activeData.length;
                          let closestIdx = 0;
                          let closestDiff = Infinity;
                          visibleData.forEach((_, i) => {
                            const actualIdx = zoomStart + i;
                            const pointTime = new Date(now.getTime() - (totalLen - 1 - actualIdx) * ms);
                            const pointMs = (pointTime.getHours() * 60 + pointTime.getMinutes()) * 60 * 1000;
                            const diff = Math.abs(pointMs - targetMs);
                            if (diff < closestDiff) { closestDiff = diff; closestIdx = i; }
                          });
                          setChartCrosshair({ idx: closestIdx + zoomStart, price: visibleData[closestIdx], x: getX(closestIdx), y: getY(visibleData[closestIdx]) });
                          openCommentSheet(closestIdx + zoomStart);
                          setShowCommentInput(false);
                        }}
                        className="w-10 h-10 rounded-xl mp-gradient-badge flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                      >
                        <Edit3 className="w-4 h-4 text-black" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}

                  <p className="text-[9px] text-white/25 mt-3 text-center">
                    {commentInputMode === "price"
                      ? (language === "Turkish" ? "En yakın fiyat noktasına yorum eklenir" : "Comment added to nearest price point")
                      : (language === "Turkish" ? "En yakın saat noktasına yorum eklenir" : "Comment added to nearest time point")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Analysis */}
        <div className="mt-4 rounded-[24px] p-4 backdrop-blur-md bg-white/[0.06] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ stroke: "url(#mpIconGrad)" }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{t.aiMarketPulse}</span>
            </div>
            <button
              onClick={() => {
                haptic.medium();
                if (!isProUnlocked && remainingAiCredits <= 0) {
                  onProClick();
                  return;
                }
                void generateAIAnalysis();
              }}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${!isProUnlocked && remainingAiCredits <= 0 ? "bg-white text-black hover:bg-white/90" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              {isAnalyzing ? t.analyzing : aiActionLabel}
            </button>
          </div>
          <button
            onClick={isProUnlocked ? undefined : onProClick}
            className="mb-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-3 py-2 text-left"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isProUnlocked ? "mp-gradient-badge" : "bg-white/[0.06]"}`}>
                {isProUnlocked ? <Brain className="h-3.5 w-3.5 text-black" /> : <Lock className="h-3.5 w-3.5 text-white/45" />}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-white/[0.68]">
                  {isProUnlocked ? "Pro unlocked" : (language === "Turkish" ? "Gunluk AI kredisi" : "Daily AI credits")}
                </div>
                <div className="text-[9px] font-medium text-white/[0.35]">{aiCreditsText}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {Array.from({ length: aiPulseLimit }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-5 rounded-full transition-all ${isProUnlocked || index >= aiCreditsUsed ? "bg-[var(--mp-cyan)] shadow-[0_0_8px_rgba(0,255,255,0.35)]" : "bg-white/10"}`}
                />
              ))}
            </div>
          </button>
          {aiAnalysis ? (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-foreground leading-relaxed italic">"{aiAnalysis}"</motion.p>
          ) : (
            <p className="text-[11px] text-white/30 italic">{t.tapRefresh.replace("{asset}", activeAsset.name)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
