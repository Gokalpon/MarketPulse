// @ts-nocheck
import React, { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, ChevronDown, Brain, Edit3, Globe, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MarketPulseChart } from "../ChartComponent";

export function Dashboard() {
  const {
    activeAsset, displayPrice, timeframeChange,
    selectedAssetId, timeframe, setTimeframe,
    chartDataPoints, chartMarkers,
    chartCrosshair, setChartCrosshair,
    showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus,
    allAssetUserComments, activeUserComments,
    activeTranslations,
    selectedPoint, setSelectedPoint,
    detailedPoint, setDetailedPoint,
    handlePointClick, openCommentSheet,
    setShowMyComments,
    isAnalyzing, aiAnalysis, generateAIAnalysis,
    setIsMenuOpen,
    isDataLoading,
    language, t,
  } = useApp();

  // Coordinate converters from TradingView
  const [coords, setCoords] = useState<any>(null);

  // crosshair move → find nearest data index
  const handleCrosshairMove = useCallback((param: any) => {
    if (!param?.point || !param?.time) {
      setChartCrosshair(null);
      return;
    }
    let price = 0;
    try {
      const entries = param.seriesData?.entries?.();
      if (entries) {
        const first = entries.next();
        if (!first.done) price = first.value[1]?.value ?? 0;
      }
    } catch {}

    // Find nearest index in chartDataPoints
    const time = Number(param.time);
    let nearestIdx = 0;
    let nearestDist = Infinity;
    chartDataPoints.forEach((d: any, i: number) => {
      const dist = Math.abs(Number(d.time) - time);
      if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
    });

    setChartCrosshair({ time, price, point: param.point, idx: nearestIdx });
  }, [setChartCrosshair, chartDataPoints]);

  const handleMarkerClick = useCallback((marker: any) => {
    handlePointClick(marker);
  }, [handlePointClick]);

  // Receive coordinate converters from chart
  const handleCoordConverters = useCallback((c: any) => {
    setCoords(c);
  }, []);

  const isUp = timeframeChange.isUp;

  // ── Build overlay items: activeTranslations + activeUserComments
  // Map each to pixel position using TradingView coordinate converters
  const overlayItems = React.useMemo(() => {
    if (!coords || !chartDataPoints.length) return [];
    const items: any[] = [];

    // AI / News bubbles from activeTranslations
    if (showNewsBubbles || showAIConsensus) {
      activeTranslations.forEach((point: any) => {
        if (point.type === "news" && !showNewsBubbles) return;
        if (point.type !== "news" && !showAIConsensus) return;

        const dp = chartDataPoints[point.idx];
        if (!dp) return;
        const x = coords.timeToX(dp.time);
        const y = coords.priceToY(dp.value);
        if (x == null || y == null) return;
        if (x < 0 || x > coords.width || y < 0 || y > coords.height) return;

        items.push({ ...point, x, y, kind: "bubble" });
      });
    }

    // User comment dots (purple)
    activeUserComments.forEach((uc: any) => {
      const dp = chartDataPoints[uc.chartIndex] || chartDataPoints[chartDataPoints.length - 1];
      if (!dp) return;
      const x = coords.timeToX(dp.time);
      const y = coords.priceToY(dp.value);
      if (x == null || y == null) return;
      items.push({ ...uc, x, y, kind: "comment" });
    });

    return items;
  }, [coords, chartDataPoints, activeTranslations, activeUserComments, showNewsBubbles, showAIConsensus]);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* ── Main Chart Card ── */}
      <div className="px-4 mt-2">
        <div className="bg-black/20 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/[0.04] shadow-lg">

          {/* Card header */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[#7A7B8D] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
                <div className="text-white text-[38px] font-bold tracking-tight leading-none mb-4">
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] ${isUp ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : "bg-[#E50000] text-black"}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                    {timeframeChange.str}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                    <div className="text-[#7A7B8D] text-[10px] font-bold tracking-[0.15em] uppercase">{t.liveMarket}</div>
                  </div>
                  {isDataLoading && <div className="w-3 h-3 border border-[#00FFFF]/50 border-t-transparent rounded-full animate-spin" />}
                </div>
              </div>
              <div onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer mt-1">
                <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* ── Chart + Overlay layer ── */}
          <div className="mt-6 relative" style={{ height: 240 }}>
            {/* TradingView chart */}
            <MarketPulseChart
              key={`${selectedAssetId}-${timeframe}`}
              data={chartDataPoints}
              comments={chartMarkers}
              onCrosshairMove={handleCrosshairMove}
              onMarkerClick={handleMarkerClick}
              onCoordConverters={handleCoordConverters}
            />

            {/* ── HTML Overlay layer — bubbles + comment dots ── */}
            <div className="absolute inset-0 pointer-events-none">
              {overlayItems.map((item: any, i: number) => {
                const isSelected = selectedPoint?.idx === item.idx && selectedPoint?.kind === item.kind;

                if (item.kind === "comment") {
                  // User comment: small purple dot
                  return (
                    <div
                      key={`uc-${item.id}`}
                      className="absolute pointer-events-auto"
                      style={{ left: item.x, top: item.y, transform: "translate(-50%,-50%)" }}
                      onClick={(e) => { e.stopPropagation(); setShowMyComments(true); }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] shadow-[0_0_12px_rgba(178,75,243,0.6)] cursor-pointer hover:scale-125 transition-transform" />
                    </div>
                  );
                }

                // AI/News bubble
                const isNews = item.type === "news";
                return (
                  <div
                    key={`bubble-${item.idx}`}
                    className="absolute pointer-events-auto"
                    style={{ left: item.x, top: item.y, transform: "translate(-50%,-50%)", zIndex: isSelected ? 30 : 20 }}
                    onClick={(e) => { e.stopPropagation(); handlePointClick({ ...item, kind: "bubble" }); }}
                  >
                    <div className="p-3 -m-3 cursor-pointer">
                      <AnimatePresence mode="wait">
                        {isSelected ? (
                          <motion.div
                            key="big"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: "spring", damping: 18, stiffness: 200 }}
                            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-2xl ${
                              isNews
                                ? "bg-gradient-to-br from-[#00FFFF] to-[#39FF14] shadow-[0_10px_30px_rgba(0,255,255,0.4)]"
                                : "bg-white shadow-[0_10px_30px_rgba(255,255,255,0.3)]"
                            }`}
                            onClick={(e) => { e.stopPropagation(); setDetailedPoint({ ...item, kind: "bubble" }); }}
                          >
                            <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${
                              isNews ? "text-[#050507]/70" :
                              item.sentiment === "Positive" ? "text-[#00C805]" :
                              item.sentiment === "Negative" ? "text-[#E50000]" : "text-[#0088FF]"
                            }`}>
                              {isNews ? t.newsAlert || "NEWS" : item.sentiment}
                            </div>
                            <div className={`text-[10px] font-bold leading-snug text-center line-clamp-3 ${isNews ? "text-[#050507]" : "text-[#0A0C0E]"}`}>
                              {item.translation}
                            </div>
                            <ChevronRight className={`w-3 h-3 rotate-90 absolute bottom-2 ${isNews ? "text-[#050507]/50" : "text-black/30"}`} strokeWidth={3} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="small"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`w-3 h-3 rounded-full hover:scale-150 transition-transform border border-white/20 ${
                              isNews
                                ? "bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            }`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD COMMENT button when crosshair active */}
            <AnimatePresence>
              {chartCrosshair && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openCommentSheet(); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-white font-black text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-[0_0_28px_rgba(178,75,243,0.5)] active:scale-95 transition-transform whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={3} />
                    {language === "Turkish" ? "Yorum Yaz" : "Add Comment"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timeframe tabs inside card */}
          <div className="flex items-center gap-1 px-5 py-4">
            {["1H", "1D", "1W", "1M", "1Y", "ALL"].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${timeframe === tf ? "bg-white/10 text-white" : "text-[#7A7B8D] hover:text-white/70"}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls below card ── */}
      <div className="px-6 mt-4 flex flex-col gap-3 w-full">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShowNewsBubbles(!showNewsBubbles)}
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showNewsBubbles ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"}`}
          >
            {showNewsBubbles ? t.hideNews : t.showNews}
          </button>
          <button
            onClick={() => setShowAIConsensus(!showAIConsensus)}
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showAIConsensus ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"}`}
          >
            {showAIConsensus ? t.hideConsensus : t.showConsensus}
          </button>
          <button
            onClick={() => setShowMyComments(true)}
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${allAssetUserComments.length > 0 ? "bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-white border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]" : "bg-white/5 text-white/40 border-white/10"}`}
          >
            {language === "Turkish" ? `Yorumlarım (${allAssetUserComments.length})` : `My Comments (${allAssetUserComments.length})`}
          </button>
        </div>

        {/* AI Analysis */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.aiMarketPulse}</span>
            </div>
            <button
              onClick={generateAIAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-white text-[9px] font-black uppercase tracking-wider hover:bg-black/50 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? t.analyzing : t.refreshAnalysis}
            </button>
          </div>
          {aiAnalysis ? (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-white leading-relaxed italic">
              "{aiAnalysis}"
            </motion.p>
          ) : (
            <p className="text-[11px] text-white/30 italic">{t.tapRefresh?.replace("{asset}", activeAsset.name)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
