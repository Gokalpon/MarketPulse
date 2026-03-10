// @ts-nocheck
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, ChevronDown, Brain, Plus, X, Globe, Zap } from "lucide-react";
import { MarketPulseChart } from "../ChartComponent";
import { useApp } from "../context/AppContext";

// ── LCD LIVE Badge ──────────────────────────────────────────────────────────
function LiveBadge({ isLive }) {
  const [state, setState] = useState(isLive ? "on" : "off");

  React.useEffect(() => {
    if (!isLive) { setState("off"); return; }
    // Flicker-on boot sequence
    const seq = [
      [40, "flicker1"],
      [110, "off"],
      [170, "flicker2"],
      [240, "off"],
      [300, "on"],
    ];
    const timers = seq.map(([ms, s]) => setTimeout(() => setState(s), ms));
    return () => timers.forEach(clearTimeout);
  }, [isLive]);

  const isOn = state === "on" || state === "flicker1" || state === "flicker2";

  return (
    <div
      style={{
        display: "inline-flex",
        background: "linear-gradient(180deg, #bbbbb8 0%, #888886 30%, #666664 60%, #999997 100%)",
        padding: "1.5px",
        borderRadius: "3px",
        boxShadow: isOn
          ? "0 0 8px rgba(200,195,160,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          : "inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #090909 0%, #050505 100%)",
          borderRadius: "2px",
          padding: "2px 7px 3px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inactive segments (dim) */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "#1a1a14",
            userSelect: "none",
            position: "absolute",
            left: "7px",
          }}
        >
          LIVE
        </span>
        {/* Active segments */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: isOn ? "#d4cdb0" : "transparent",
            textShadow: isOn
              ? "0 0 4px rgba(212,205,176,0.9), 0 0 10px rgba(212,205,176,0.4)"
              : "none",
            transition: "color 0.04s, text-shadow 0.04s",
            position: "relative",
            userSelect: "none",
          }}
        >
          LIVE
        </span>
        {/* Subtle scanline overlay */}
        {isOn && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 2px)",
              borderRadius: "2px",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── News Bubble Overlay ─────────────────────────────────────────────────────
function NewsBubble({ bubble, onClose }) {
  if (!bubble) return null;

  const sentColor = bubble.sentiment === "Positive" ? "#39FF14"
                  : bubble.sentiment === "Negative"  ? "#FF4444"
                  : "#00FFFF";

  // Clamp position to stay within chart bounds
  const left = Math.min(Math.max(bubble.screenX - 120, 4), 220);
  const top  = Math.max(bubble.screenY - 90, 4);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 4 }}
      transition={{ type: "spring", damping: 22, stiffness: 340 }}
      style={{ left, top, zIndex: 40 }}
      className="absolute w-[240px] pointer-events-auto"
    >
      {/* Arrow pointing down to marker */}
      <div
        style={{
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `7px solid ${sentColor}22`,
          marginLeft: "50%",
          transform: "translateX(-50%)",
          position: "absolute",
          top: "-6px",
          rotate: "180deg",
        }}
      />
      <div
        style={{
          background: "rgba(8,9,14,0.97)",
          border: `1px solid ${sentColor}33`,
          borderTop: `2px solid ${sentColor}`,
          borderRadius: "12px",
          padding: "10px 12px",
          backdropFilter: "blur(20px)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            {bubble.type === "news"
              ? <Globe size={10} color={sentColor} />
              : <Zap size={10} color={sentColor} />}
            <span style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "0.2em", color: sentColor, textTransform: "uppercase" }}>
              {bubble.type === "news" ? "News" : "AI Consensus"}
            </span>
          </div>
          <button onClick={onClose} style={{ padding: 2, opacity: 0.4, marginTop: -1 }}>
            <X size={10} color="white" />
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.88)", lineHeight: 1.45, fontWeight: 500, margin: 0 }}>
          {bubble.headline || bubble.translation}
        </p>
        {bubble.comments?.length > 0 && (
          <div style={{ marginTop: 7, paddingTop: 7, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "8px", color: "rgba(122,123,141,0.7)", fontWeight: 700, letterSpacing: "0.1em" }}>
              {bubble.comments.length} COMMENT{bubble.comments.length > 1 ? "S" : ""}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
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
    selectedAssetId, handleMarkerClick, openCommentSheet,
    setDetailedPoint, setSentimentFilter,
  } = useApp();

  const [activeBubble, setActiveBubble] = useState(null);
  const chartContainerRef = useRef(null);

  const onMarkerClick = (marker) => {
    if (activeBubble?.time === marker.time) {
      // Second tap: open full detail sheet
      setActiveBubble(null);
      handleMarkerClick(marker);
    } else {
      setActiveBubble(marker);
    }
  };

  return (
    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">

      {/* ── Chart Card ── */}
      <div className="px-4 mt-2">
        <div className="bg-black/20 backdrop-blur-xl rounded-[32px] p-6 relative overflow-hidden border border-white/[0.04] shadow-lg">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[#7A7B8D] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`text-white text-[38px] font-bold tracking-tight leading-none transition-all ${isDataLoading ? "opacity-40 blur-[2px]" : "opacity-100"}`}>
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {/* LCD LIVE Badge */}
                <div className="self-center">
                  <LiveBadge isLive={!!realMarketData} />
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

          {/* Chart Area — relative container for bubble overlay */}
          <div ref={chartContainerRef} className="mt-8 relative h-[220px] w-full rounded-2xl overflow-visible border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Clip inner chart but allow bubbles to overflow */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <MarketPulseChart
                key={`${selectedAssetId}-${timeframe}`}
                data={chartDataPoints}
                comments={chartMarkers}
                lineColor="#00FFFF"
                areaTopColor="rgba(0, 255, 255, 0.20)"
                areaBottomColor="rgba(57, 255, 20, 0.02)"
                onCrosshairMove={(param) => {
                  if (!param || !param.time || !param.seriesData) { setChartCrosshair(null); return; }
                  let price = 0;
                  param.seriesData.forEach(val => { price = val.value || price; });
                  setChartCrosshair({ idx: 0, price, x: 50, y: 50 });
                }}
                onMarkerClick={onMarkerClick}
              />
            </div>

            {/* News bubble overlay */}
            <AnimatePresence>
              {activeBubble && (
                <NewsBubble
                  bubble={activeBubble}
                  onClose={() => setActiveBubble(null)}
                />
              )}
            </AnimatePresence>

            {/* Floating + comment button */}
            <button
              onClick={() => openCommentSheet()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#00FFFF]/15 border border-[#00FFFF]/30 flex items-center justify-center hover:bg-[#00FFFF]/25 transition-all backdrop-blur-sm z-30"
            >
              <Plus className="w-4 h-4 text-[#00FFFF]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 mt-6 flex flex-col gap-4 w-full">
        {/* Timeframe */}
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

        {/* Toggles */}
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
