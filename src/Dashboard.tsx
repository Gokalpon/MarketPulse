// @ts-nocheck
import React from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, ChevronDown, Brain } from "lucide-react";
import { MarketPulseChart } from "../ChartComponent";
import { useApp } from "../context/AppContext";

export function Dashboard() {
  const {
    activeAsset, displayPrice, realMarketData, realQuote, isDataLoading,
    chartDataPoints, chartMarkers, setChartCrosshair,
    timeframe, setTimeframe,
    showNewsBubbles, setShowNewsBubbles,
    showAIConsensus, setShowAIConsensus,
    hideMyCommentsBar, setHideMyCommentsBar,
    setShowMyComments, allAssetUserComments,
    language, t, setIsMenuOpen, longPressTimer,
    isAnalyzing, aiAnalysis, generateAIAnalysis,
    selectedAssetId,
  } = useApp();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* Chart Card */}
      <div className="px-4 mt-2">
        <div className="bg-black/20 backdrop-blur-xl rounded-[32px] p-6 relative overflow-hidden border border-white/[0.04] shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[#7A7B8D] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`text-white text-[38px] font-bold tracking-tight leading-none transition-all ${isDataLoading ? "opacity-50 blur-[2px]" : "opacity-100"}`}>
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`rounded px-1.5 py-0.5 self-center border ${realMarketData ? "bg-[#39FF14]/15 border-[#39FF14]/30" : "bg-white/5 border-white/10"}`}>
                  <span className={`text-[9px] font-black tracking-widest ${realMarketData ? "text-[#39FF14] animate-pulse" : "text-white/30"}`}>LIVE</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-all ${
                  (realQuote ? realQuote.isUp : activeAsset.change.startsWith("+"))
                    ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black"
                    : "bg-[#E50000] text-black"
                }`}>
                  {(realQuote ? realQuote.isUp : activeAsset.change.startsWith("+"))
                    ? <TrendingUp className="w-3 h-3" strokeWidth={3} />
                    : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                  {realQuote ? `${realQuote.change >= 0 ? "+" : ""}${realQuote.percentChange.toFixed(2)}%` : activeAsset.change}
                </div>
                <div className="text-[#7A7B8D] text-[10px] font-bold tracking-[0.15em] uppercase">{t.liveMarket}</div>
              </div>
            </div>
            <div
              onClick={() => setIsMenuOpen(true)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* Chart */}
          <div className="mt-8 relative h-[220px] w-full rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <MarketPulseChart
              key={`${selectedAssetId}-${timeframe}`}
              data={chartDataPoints}
              comments={chartMarkers}
              lineColor="#00FFFF"
              areaTopColor="rgba(0, 255, 255, 0.15)"
              areaBottomColor="rgba(0, 255, 255, 0.0)"
              onCrosshairMove={(param) => {
                if (!param || !param.time || !param.seriesData) { setChartCrosshair(null); return; }
                let price = 0;
                param.seriesData.forEach((val) => { price = val.value || price; });
                setChartCrosshair({ idx: 0, price, x: 50, y: 50 });
              }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 mt-6 flex flex-col gap-4 w-full">
        {/* Timeframe buttons */}
        <div className="flex items-center justify-between w-full">
          {["1H", "1D", "1W", "1M", "1Y", "ALL"].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 mx-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${
                timeframe === tf ? "bg-white text-black" : "text-[#7A7B8D] hover:text-white bg-white/5"
              }`}
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
            onClick={() => { if (!hideMyCommentsBar) setShowMyComments(true); }}
            onPointerDown={() => { longPressTimer.current = setTimeout(() => setHideMyCommentsBar(h => !h), 600); }}
            onPointerUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
            onPointerLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border select-none ${
              hideMyCommentsBar
                ? "bg-white/5 text-white/20 border-white/10 line-through"
                : allAssetUserComments.length > 0
                  ? "bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-black border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]"
                  : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {hideMyCommentsBar
              ? (language === "Turkish" ? "Gizli" : "Hidden")
              : (language === "Turkish" ? `Yorumlarım (${allAssetUserComments.length})` : `My Comments (${allAssetUserComments.length})`)}
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
