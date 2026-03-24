import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight, ChevronUp,
  Brain, Edit3, ExternalLink, Wifi, WifiOff, Maximize2, Minimize2,
} from "lucide-react";
import { Asset } from "@/data/assets";
import { TranslationStrings, DetailedPointData, SentimentCluster, ChartCrosshair, UserComment, NewsOrConsensusPoint } from "@/types";

interface DashboardTabProps {
  language: string;
  t: TranslationStrings;
  activeAsset: Asset;
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
  activeTranslations: NewsOrConsensusPoint[];
  selectedPoint: DetailedPointData | null;
  setSelectedPoint: (p: DetailedPointData | null) => void;
  sentimentClusters: SentimentCluster[];
  chartCrosshair: ChartCrosshair | null;
  setChartCrosshair: (c: ChartCrosshair | null) => void;
  handleChartTap: (e: React.MouseEvent<HTMLDivElement>) => void;
  openCommentSheet: () => void;
  handlePointClick: (point: SentimentCluster) => void;
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  generateAIAnalysis: () => void;
  setShowMyComments: (v: boolean) => void;
  activeUserComments: UserComment[];
  setIsMenuOpen: (v: boolean) => void;
}

export function DashboardTab({
  language, t, activeAsset, activeData,
  livePrice, liveChange, liveIsUp, isLive,
  timeframe, setTimeframe, chartExpanded, setChartExpanded,
  showNewsBubbles, setShowNewsBubbles, showAIConsensus, setShowAIConsensus,
  activeTranslations, selectedPoint, setSelectedPoint, sentimentClusters,
  chartCrosshair, setChartCrosshair, handleChartTap, openCommentSheet, handlePointClick,
  isAnalyzing, aiAnalysis, generateAIAnalysis, setShowMyComments, activeUserComments, setIsMenuOpen,
}: DashboardTabProps) {
  const [chartHeightLevel, setChartHeightLevel] = useState(1); // 0=xs 1=sm 2=md 3=lg
  const [chartWide, setChartWide] = useState(false);
  const chartHeightValues = [150, 240, 330, 430];

  const minVal = activeData.length > 0 ? Math.min(...activeData) * 0.995 : 0;
  const maxVal = activeData.length > 0 ? Math.max(...activeData) * 1.005 : 1;
  const range = (maxVal - minVal) || 1;
  const getX = (i: number) => activeData.length > 1 ? 4 + (i / (activeData.length - 1)) * 92 : 50;
  const getY = (v: number) => 8 + (100 - ((v - minVal) / range) * 100) * 0.84;
  const pathD = activeData.length > 1 ? activeData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d)}`).join(" ") : "M 50 50";
  const areaD = activeData.length > 1 ? `${pathD} L ${getX(activeData.length - 1)} 100 L ${getX(0)} 100 Z` : "M 50 50 L 50 100 L 50 100 Z";

  return (
    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
      <div className={`${chartWide ? "" : "px-4"} mt-2 transition-all duration-500`}>
        <div className={`mp-glass-card ${chartWide ? "rounded-none" : "rounded-[32px]"} p-6 relative overflow-hidden shadow-lg transition-all duration-500`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[var(--mp-text-secondary)] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
              <div className="font-price text-foreground text-[38px] font-bold leading-none mb-4">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] ${liveChange.startsWith("+") ? "mp-positive-badge" : liveChange.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>
                  {liveIsUp ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                  {liveChange}
                </div>
                <div className="flex items-center gap-1.5">
                  {isLive ? <Wifi className="w-3 h-3 text-[var(--mp-green)]" /> : <WifiOff className="w-3 h-3 text-white/20" />}
                  <div className={`text-[10px] font-bold tracking-[0.15em] uppercase ${isLive ? "text-[var(--mp-green)]" : "text-[var(--mp-text-secondary)]"}`}>{isLive ? (language === "Turkish" ? "CANLI" : "LIVE") : t.liveMarket}</div>
                </div>
              </div>
            </div>
            <div onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* Chart */}
          <div className="relative mt-8 w-full flex transition-all duration-500" style={{ height: chartHeightValues[chartHeightLevel] }}>
            {/* Resize controls overlay */}
            <div className="absolute bottom-2 right-14 flex items-center gap-1 z-30">
              <button
                onClick={(e) => { e.stopPropagation(); setChartHeightLevel(l => Math.max(0, l - 1)); }}
                disabled={chartHeightLevel === 0}
                className="w-5 h-5 rounded-md bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center disabled:opacity-25 hover:bg-white/10 active:scale-90 transition-all"
              >
                <ChevronDown className="w-2.5 h-2.5 text-white/50" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setChartHeightLevel(l => Math.min(3, l + 1)); }}
                disabled={chartHeightLevel === 3}
                className="w-5 h-5 rounded-md bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center disabled:opacity-25 hover:bg-white/10 active:scale-90 transition-all"
              >
                <ChevronUp className="w-2.5 h-2.5 text-white/50" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setChartWide(w => !w); }}
                className={`w-5 h-5 rounded-md backdrop-blur-sm border flex items-center justify-center active:scale-90 transition-all ${chartWide ? "bg-white/10 border-white/20" : "bg-black/40 border-white/10 hover:bg-white/10"}`}
              >
                {chartWide ? <Minimize2 className="w-2.5 h-2.5 text-white/60" /> : <Maximize2 className="w-2.5 h-2.5 text-white/50" />}
              </button>
            </div>
            <div className="flex-1 relative" onClick={handleChartTap}>
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
              {(showNewsBubbles || showAIConsensus) && activeTranslations.map((point: NewsOrConsensusPoint) => {
                const isSelected = selectedPoint?.idx === point.idx;
                const safePointIdx = Math.min(point.idx, activeData.length - 1);
                const xPercent = getX(safePointIdx);
                const yPercent = getY(activeData[safePointIdx] ?? activeData[activeData.length - 1] ?? minVal);
                const isNews = point.type === "news";
                if (isNews && !showNewsBubbles) return null;
                if (!isNews && !showAIConsensus) return null;
                return (
                  <div key={point.idx} className={`absolute flex flex-col items-center justify-center ${isSelected ? "z-30" : "z-20"}`} style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="p-4 -m-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}>
                      <div className={`rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${
                        isSelected
                          ? `w-28 h-28 flex-shrink-0 ${isNews ? "mp-gradient-badge shadow-[0_10px_30px_rgba(0,255,255,0.4)]" : "bg-foreground shadow-[0_10px_30px_rgba(255,255,255,0.3)]"}`
                          : `w-3 h-3 flex-shrink-0 hover:scale-150 border border-white/20 ${isNews ? "bg-[var(--mp-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.5)]" : "bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.4)]"}`
                      }`}>
                        {isSelected && (
                          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="p-3 text-center flex flex-col items-center justify-center h-full w-full relative">
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
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clustered user comment sentiment markers */}
              {sentimentClusters.map((cluster, ci) => {
                const safeIdx = Math.max(0, Math.min(activeData.length - 1, cluster.avgIdx));
                const xPct = getX(safeIdx);
                const yPct = getY(activeData[safeIdx] || cluster.avgPrice);
                const sentColor = "from-[#B24BF3] via-[#9D44D3] to-[#8A2BE2]";
                const size = cluster.count >= 5 ? "w-5 h-5" : cluster.count >= 2 ? "w-4 h-4" : "w-3.5 h-3.5";
                return (
                  <div key={`cluster-${ci}`} className="absolute z-25" style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="p-3 -m-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowMyComments(true); }}>
                      <div className={`${size} rounded-full bg-gradient-to-br ${sentColor} shadow-[0_0_12px_rgba(178,75,243,0.4)] flex items-center justify-center`}>
                        {cluster.count > 1 && <span className="text-[7px] font-black text-black">{cluster.count}</span>}
                      </div>
                    </div>
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
