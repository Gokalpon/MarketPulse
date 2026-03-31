import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCountUpAnimation } from "@/hooks/useCountUpAnimation";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  Brain, Edit3, ExternalLink, WifiOff, Plus, X,
} from "lucide-react";

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
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  generateAIAnalysis: () => void;
  setShowMyComments: (v: boolean) => void;
  activeUserComments: any[];
  setIsMenuOpen: (v: boolean) => void;
  setIsAssetPickerOpen: (v: boolean) => void;
}

export function DashboardTab({
  language, t, activeAsset, activeData,
  livePrice, liveChange, liveIsUp, isLive,
  timeframe, setTimeframe, chartExpanded, setChartExpanded,
  showNewsBubbles, setShowNewsBubbles, showAIConsensus, setShowAIConsensus,
  activeTranslations, selectedPoint, setSelectedPoint, sentimentClusters,
  chartCrosshair, setChartCrosshair, handleChartTap, openCommentSheet, handlePointClick,
  isAnalyzing, aiAnalysis, generateAIAnalysis, setShowMyComments, activeUserComments,
  setIsMenuOpen, setIsAssetPickerOpen,
}: DashboardTabProps) {
  const [chartHeightLevel, setChartHeightLevel] = useState(1); // 0=xs 1=sm 2=md 3=lg
  const [chartWide, setChartWide] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentPriceInput, setCommentPriceInput] = useState("");
  const [commentInputMode, setCommentInputMode] = useState<"price" | "time">("price");
  const [matchingPriceOptions, setMatchingPriceOptions] = useState<{ visIdx: number; globalIdx: number; date: Date }[] | null>(null);
  const [dateListExpanded, setDateListExpanded] = useState(false);
  const [dateSearch, setDateSearch] = useState("");

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

  const rawMin = visibleData.length > 0 ? Math.min(...visibleData) : 0;
  const rawMax = visibleData.length > 0 ? Math.max(...visibleData) : 1;
  const dataRange = (rawMax - rawMin) || rawMin * 0.01 || 1;
  const padding = dataRange * 0.15;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;
  const range = maxVal - minVal;

  const getX = (i: number) => visibleData.length > 1 ? 4 + (i / (visibleData.length - 1)) * 92 : 50;
  const getY = (v: number) => 8 + (100 - ((v - minVal) / range) * 100) * 0.84;

  const getPointDate = (visIdx: number): Date => {
    const intervalMs: Record<string, number> = { "1H": 5 * 60 * 1000, "1D": 15 * 60 * 1000, "1W": 60 * 60 * 1000, "1M": 24 * 60 * 60 * 1000, "1Y": 7 * 24 * 60 * 60 * 1000, "ALL": 30 * 24 * 60 * 60 * 1000 };
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
  const pathD = visibleData.length > 1 ? visibleData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d)}`).join(" ") : "M 50 50";
  const areaD = visibleData.length > 1 ? `${pathD} L ${getX(visibleData.length - 1)} 100 L ${getX(0)} 100 Z` : "M 50 50 L 50 100 L 50 100 Z";

  // X-axis date labels
  const xAxisLabels = useMemo(() => {
    const count = visibleData.length;
    if (count < 2) return [];
    const now = new Date();
    const intervalMs: Record<string, number> = {
      "1H": 5 * 60 * 1000, "1D": 15 * 60 * 1000, "1W": 60 * 60 * 1000,
      "1M": 24 * 60 * 60 * 1000, "1Y": 7 * 24 * 60 * 60 * 1000, "ALL": 30 * 24 * 60 * 60 * 1000,
    };
    const ms = intervalMs[timeframe] || intervalMs["1D"];
    return Array.from({ length: 5 }, (_, li) => {
      const idx = Math.round(li * (count - 1) / 4);
      const actualIdx = zoomStart + idx;
      const totalLen = activeData.length;
      const pointTime = new Date(now.getTime() - (totalLen - 1 - actualIdx) * ms);
      let label = "";
      if (timeframe === "1H" || timeframe === "1D") label = pointTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      else if (timeframe === "1W") label = pointTime.toLocaleDateString([], { weekday: "short" });
      else if (timeframe === "1M") label = pointTime.toLocaleDateString([], { month: "short", day: "numeric" });
      else if (timeframe === "1Y") label = pointTime.toLocaleDateString([], { month: "short" });
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

  return (
    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
      <div className={`${chartWide ? "" : "px-4"} mt-2 transition-all duration-500`}>
        <div className={`mp-glass-card ${chartWide ? "rounded-none" : "rounded-[32px]"} p-6 relative shadow-lg transition-all duration-500`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[var(--mp-text-secondary)] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
              <motion.div
                className="font-price text-foreground text-[38px] font-bold leading-none mb-4 inline-block"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${animatedPrice}
              </motion.div>
              <div className="flex items-center gap-3">
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
            <div onClick={() => setIsAssetPickerOpen(true)} className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* Chart */}
          <div className="relative mt-8 w-full transition-all duration-500" style={{ height: chartHeightValues[chartHeightLevel] + 20 }}>
            <div className="absolute inset-0 bottom-5 flex">

              <div
                ref={chartDivRef}
                className="flex-1 relative"
                onClick={handleChartTap}
                onTouchStart={handlePinchStart}
                onTouchMove={handlePinchMove}
                onTouchEnd={handlePinchEnd}
              >
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
                  </defs>
                  <path d={areaD} fill="url(#areaGrad)" />
                  <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                  {chartCrosshair && <line x1={chartCrosshair.x} y1="0" x2={chartCrosshair.x} y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" opacity="0.3" />}

                  {/* NEWS / CONSENSUS dots — pixel-perfect on the chart line */}
                  {(showNewsBubbles || showAIConsensus) && activeTranslations.map((point: any) => {
                    const isNews = point.type === "news";
                    if (isNews && !showNewsBubbles) return null;
                    if (!isNews && !showAIConsensus) return null;
                    if (selectedPoint?.idx === point.idx) return null;
                    const vi = point.idx - zoomStart;
                    if (vi < 0 || vi >= visibleData.length) return null;
                    const xi = Math.min(vi, visibleData.length - 1);
                    const cx = getX(xi);
                    const cy = getY(visibleData[xi]);
                    return (
                      <circle key={`dot-${point.idx}`} cx={cx} cy={cy} r="2.7" fill={isNews ? "#00FFFF" : "white"} />
                    );
                  })}

                  {/* SENTIMENT CLUSTER dots — pixel-perfect on the chart line */}
                  {sentimentClusters.map((cluster, ci) => {
                    if (selectedPoint?.avgIdx === cluster.avgIdx) return null;
                    const vi = cluster.avgIdx - zoomStart;
                    if (vi < 0 || vi >= visibleData.length) return null;
                    const xi = Math.max(0, Math.min(visibleData.length - 1, vi));
                    const cx = getX(xi);
                    const cy = getY(visibleData[xi] ?? cluster.avgPrice);
                    const r = cluster.count >= 5 ? 3.6 : cluster.count >= 2 ? 3.15 : 2.7;
                    return (
                      <g key={`dot-cluster-${ci}`}>
                        <circle cx={cx} cy={cy} r={r} fill="#B24BF3" />
                        {cluster.count > 1 && (
                          <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.8" fontWeight="900">{cluster.count}</text>
                        )}
                      </g>
                    );
                  })}

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

                {/* Crosshair */}
                {chartCrosshair && (
                  <div className="absolute z-40" style={{ left: `${chartCrosshair.x}%`, top: `${chartCrosshair.y}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="w-4 h-4 rounded-full bg-foreground border-2 border-[var(--mp-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                    <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-6 whitespace-nowrap flex flex-col items-center gap-2" style={chartCrosshair.x > 65 ? { right: 0 } : chartCrosshair.x < 35 ? { left: 0 } : { left: "50%", transform: "translateX(-50%)" }}>
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

                {/* News / Consensus overlay — parent sabit konumda, içerik değişir */}
                {(showNewsBubbles || showAIConsensus) && activeTranslations.map((point: any) => {
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
                          className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden cursor-pointer ${isNews ? "mp-gradient-badge shadow-[0_10px_30px_rgba(0,255,255,0.4)]" : "bg-foreground shadow-[0_10px_30px_rgba(255,255,255,0.3)]"}`}
                          onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}
                        >
                          <div className="p-3 text-center flex flex-col items-center justify-center h-full w-full relative">
                            <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isNews ? "text-background opacity-70" : point.sentiment === "Positive" ? "text-[#00C805]" : point.sentiment === "Negative" ? "text-[var(--mp-red)]" : "text-[#0088FF]"}`}>
                              {isNews ? t.newsAlert : point.sentiment}
                            </div>
                            <div className={`text-[11px] font-bold leading-snug line-clamp-2 mb-1.5 ${isNews ? "text-background" : "text-[#0A0C0E]"}`}>{point.translation}</div>
                            {isNews ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open('https://www.reuters.com/business/finance', '_blank', 'noopener,noreferrer'); }}
                                className="bg-background/20 hover:bg-background/30 px-2 py-1 rounded flex items-center gap-1.5 transition-colors border border-background/20"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-background" />
                                <span className="text-[7px] font-black uppercase text-background tracking-wider">Source</span>
                              </button>
                            ) : (
                              <div className={`absolute bottom-2 ${isNews ? "text-background/50" : "text-black/30"}`}><ChevronRight className="w-3 h-3 rotate-90" strokeWidth={3} /></div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          className="w-10 h-10 cursor-pointer rounded-full"
                          onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Clustered user comment sentiment markers */}
                {sentimentClusters.map((cluster, ci) => {
                  const isSelected = selectedPoint?.avgIdx === cluster.avgIdx;
                  const vi = cluster.avgIdx - zoomStart;
                  if (vi < 0 || vi >= visibleData.length) return null;
                  const safeIdx = Math.max(0, Math.min(visibleData.length - 1, vi));
                  const xPct = getX(safeIdx);
                  const yPct = getY(visibleData[safeIdx] || cluster.avgPrice);
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
                          className="w-28 h-28 mp-gradient-badge-purple rounded-full flex items-center justify-center overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(178,75,243,0.6)]"
                          onClick={(e) => { e.stopPropagation(); handlePointClick(cluster); }}
                        >
                          <div className="p-3 text-center flex flex-col items-center justify-center h-full w-full relative">
                            <div className="text-[10px] font-black uppercase tracking-wider text-white mb-1">{cluster.sentiment}</div>
                            <div className="text-[11px] font-bold leading-snug line-clamp-2 text-white mb-1.5">{cluster.translation || "Community sentiment"}</div>
                            <div className="absolute bottom-2 text-white/50"><ChevronDown className="w-3 h-3" strokeWidth={3} /></div>
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          className="w-10 h-10 cursor-pointer rounded-full"
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
                  const price = maxVal - pct * range;
                  const formatted = price >= 10000 ? `${(price/1000).toFixed(0)}k` : price >= 1000 ? `${(price/1000).toFixed(1)}k` : price >= 1 ? price.toFixed(price >= 100 ? 0 : 2) : price.toFixed(4);
                  return <div key={pct} className="text-[7px] text-white/20 font-mono text-right leading-none">{formatted}</div>;
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
        <div className="flex items-center justify-between w-full">
          {["1H", "1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`flex-1 mx-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${timeframe === tf ? "bg-foreground text-background" : "text-[var(--mp-text-secondary)] hover:text-foreground bg-white/5"}`}>{tf}</button>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={() => setShowNewsBubbles(!showNewsBubbles)} className={`flex-1 px-1 py-2 rounded-xl text-[7.5px] font-black uppercase tracking-tight whitespace-nowrap transition-all border ${showNewsBubbles ? "bg-foreground text-background border-foreground" : "bg-white/5 text-white/40 border-white/10"}`}>
            {showNewsBubbles ? t.hideNews : t.showNews}
          </button>
          <button onClick={() => setShowAIConsensus(!showAIConsensus)} className={`flex-1 px-1 py-2 rounded-xl text-[7.5px] font-black uppercase tracking-tight whitespace-nowrap transition-all border ${showAIConsensus ? "bg-foreground text-background border-foreground" : "bg-white/5 text-white/40 border-white/10"}`}>
            {showAIConsensus ? t.hideConsensus : t.showConsensus}
          </button>
          <button onClick={() => setShowMyComments(true)} className={`flex-1 px-1 py-2 rounded-xl text-[7.5px] font-black uppercase tracking-tight whitespace-nowrap transition-all border ${activeUserComments.length > 0 ? "mp-gradient-badge-purple text-background border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]" : "bg-white/5 text-white/40 border-white/10"}`}>
            {language === "Turkish" ? "Yorumlarım" : "My Comments"}
          </button>
        </div>

        {/* Yorum Ekle */}
        <motion.div layout className="overflow-hidden">
          <button
            onClick={() => { setShowCommentInput(v => !v); setCommentPriceInput(""); }}
            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${showCommentInput ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/40 border-white/10 hover:text-white/60"}`}
          >
            {showCommentInput ? <X className="w-3 h-3" strokeWidth={3} /> : <Plus className="w-3 h-3" strokeWidth={3} />}
            {language === "Turkish" ? "Yorum Ekle" : "Add Comment"}
          </button>

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
  );
}
