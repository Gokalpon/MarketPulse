// @ts-nocheck
import React, { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, ChevronDown, Brain, Edit3, ChevronRight, Globe } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MarketPulseChart } from "../ChartComponent";

export function Dashboard() {
  const {
    activeAsset, displayPrice, timeframeChange,
    selectedAssetId, timeframe, setTimeframe,
    chartDataPoints, chartMarkers,
    selectedPoint, detailedPoint,
    chartCrosshair, setChartCrosshair,
    showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus,
    activeTranslations, activeUserComments, allAssetUserComments,
    handlePointClick, openCommentSheet,
    showMyComments, setShowMyComments,
    isAnalyzing, aiAnalysis, generateAIAnalysis,
    setIsMenuOpen, setActiveTab, setSelectedAssetId,
    isDataLoading,
    language, t,
  } = useApp();

  const handleCrosshairMove = useCallback((param: any) => {
    if (!param?.point || !param?.time) {
      setChartCrosshair(null);
      return;
    }
    setChartCrosshair({
      time: param.time,
      price: param.seriesData?.values?.().next()?.value?.value ?? 0,
      point: param.point,
    });
  }, [setChartCrosshair]);

  const handleMarkerClick = useCallback((marker: any) => {
    if (marker?.type === "comment") return;
    handlePointClick(marker);
  }, [handlePointClick]);

  const isUp = timeframeChange.isUp;

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
        <div className="bg-black/20 backdrop-blur-xl rounded-[32px] p-6 relative overflow-hidden border border-white/[0.04] shadow-lg">

          {/* Card header */}
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
                {isDataLoading && (
                  <div className="w-3 h-3 border border-[#00FFFF]/50 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
            <div
              onClick={() => setIsMenuOpen(true)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* ── TradingView Chart ── */}
          <div className="mt-8 relative h-[240px] w-full">
            <MarketPulseChart
              key={`${selectedAssetId}-${timeframe}`}
              data={chartDataPoints}
              comments={chartMarkers}
              onCrosshairMove={handleCrosshairMove}
              onMarkerClick={handleMarkerClick}
            />

            {/* Crosshair overlay: ADD COMMENT button */}
            <AnimatePresence>
              {chartCrosshair && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openCommentSheet(); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black font-black text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-[0_0_24px_rgba(0,255,255,0.4)] active:scale-95 transition-transform"
                  >
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={3} />
                    {language === "Turkish" ? "Yorum Yaz" : "Add Comment"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 mt-6 flex flex-col gap-4 w-full">

        {/* Timeframe buttons */}
        <div className="flex items-center justify-between w-full">
          {["1H", "1D", "1W", "1M", "1Y", "ALL"].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 mx-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${timeframe === tf ? "bg-white text-black" : "text-[#7A7B8D] hover:text-white bg-white/5"}`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Toggle buttons */}
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
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${allAssetUserComments.length > 0 ? "bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-black border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]" : "bg-white/5 text-white/40 border-white/10"}`}
          >
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
