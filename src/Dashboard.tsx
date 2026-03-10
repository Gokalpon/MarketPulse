// @ts-nocheck
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, ChevronDown, Brain, Plus, X, Globe, Zap } from "lucide-react";
import { MarketPulseChart } from "../ChartComponent";
import { useApp } from "../context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// MADDE 11: LCD LIVE Badge — metalik kenarlık, karanlık panel, segment yanma animasyonu
// ─────────────────────────────────────────────────────────────────────────────
function LiveBadge({ isLive }) {
  const [phase, setPhase] = useState("off");

  React.useEffect(() => {
    if (!isLive) { setPhase("off"); return; }
    // Flicker boot sequence
    const seq = [
      [50,  "f1"],
      [120, "off"],
      [180, "f2"],
      [260, "off"],
      [320, "on"],
    ];
    const timers = seq.map(([ms, p]) => setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, [isLive]);

  const on = phase === "on" || phase === "f1" || phase === "f2";

  return (
    <div style={{
      display: "inline-flex",
      background: "linear-gradient(175deg, #c8c8c5 0%, #888886 35%, #606060 65%, #a0a09e 100%)",
      padding: "1.5px",
      borderRadius: "4px",
      boxShadow: on
        ? "0 0 10px rgba(200,195,155,0.25), inset 0 1px 0 rgba(255,255,255,0.18)"
        : "inset 0 1px 0 rgba(255,255,255,0.08)",
    }}>
      <div style={{
        background: "linear-gradient(180deg, #080808 0%, #040404 100%)",
        borderRadius: "3px",
        padding: "2.5px 8px 3.5px",
        position: "relative",
        overflow: "hidden",
        minWidth: 42,
      }}>
        {/* Dim (inactive) segments always visible */}
        <span style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "9px", fontWeight: 900, letterSpacing: "0.2em",
          color: "#141410",
          position: "absolute", top: "50%", left: 8,
          transform: "translateY(-50%)",
          userSelect: "none",
        }}>LIVE</span>

        {/* Lit segments */}
        <span style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "9px", fontWeight: 900, letterSpacing: "0.2em",
          color: on ? "#ddd9bb" : "transparent",
          textShadow: on ? "0 0 5px rgba(221,217,187,0.95), 0 0 12px rgba(221,217,187,0.35)" : "none",
          transition: "color 0.04s, text-shadow 0.04s",
          position: "relative", userSelect: "none",
        }}>LIVE</span>

        {/* Scanline */}
        {on && (
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.12) 2px)",
            borderRadius: 3, pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MADDE 6: News / Consensus Bubble — spring animasyonlu, sentiment renkli
// ─────────────────────────────────────────────────────────────────────────────
function NewsBubble({ bubble, onClose, onExpand }) {
  if (!bubble) return null;
  const col = bubble.sentiment === "Positive" ? "#39FF14"
            : bubble.sentiment === "Negative"  ? "#FF4444"
            : "#00FFFF";

  // Keep bubble inside chart (240px wide, positioned from click point)
  const left = Math.max(4, Math.min(bubble.screenX - 120, 200));
  const top  = Math.max(4, bubble.screenY - 96);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82, y: 6 }}
      transition={{ type: "spring", damping: 20, stiffness: 320 }}
      style={{ left, top, position: "absolute", width: 248, zIndex: 50, pointerEvents: "auto" }}
    >
      <div style={{
        background: "rgba(6,7,12,0.97)",
        border: `1px solid ${col}30`,
        borderTop: `2px solid ${col}`,
        borderRadius: 14,
        padding: "10px 12px 11px",
        backdropFilter: "blur(24px)",
        boxShadow: `0 10px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {bubble.type === "news"
              ? <Globe size={9} color={col} />
              : <Zap size={9} color={col} />}
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: col, textTransform: "uppercase" }}>
              {bubble.type === "news" ? "HABER" : "AI KONSENSUS"}
            </span>
          </div>
          <button onClick={onClose} style={{ opacity: 0.35, padding: 2 }}>
            <X size={10} color="white" />
          </button>
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
          {bubble.headline || bubble.translation}
        </p>

        {bubble.comments?.length > 0 && (
          <button
            onClick={onExpand}
            style={{
              marginTop: 8, paddingTop: 7,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", padding: "7px 0 0", cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 8, color: "rgba(122,123,141,0.8)", fontWeight: 700, letterSpacing: "0.12em" }}>
              {bubble.comments.length} YORUM — DETAY →
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const {
    activeAsset, displayPrice, timeframeChange, realMarketData, isDataLoading,
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

  const onMarkerClick = (marker) => {
    // First tap → show bubble; second tap on same marker → open full sheet
    if (activeBubble?.time === marker.time) {
      setActiveBubble(null);
      handleMarkerClick(marker);
    } else {
      setActiveBubble(marker);
    }
  };

  // MADDE 1: use timeframeChange, not realQuote/activeAsset.change
  const changeIsUp  = timeframeChange.isUp;
  const changeStr   = timeframeChange.str;

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
                {/* MADDE 11: LCD LIVE badge */}
                <div className="self-center mt-1">
                  <LiveBadge isLive={!!realMarketData} />
                </div>
              </div>

              {/* MADDE 1: timeframeChange — updates on every timeframe switch */}
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-all ${
                  changeIsUp
                    ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black"
                    : "bg-[#E50000] text-black"
                }`}>
                  {changeIsUp
                    ? <TrendingUp  className="w-3 h-3" strokeWidth={3} />
                    : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                  {changeStr}
                </div>
                <div className="text-[#7A7B8D] text-[10px] font-bold tracking-[0.15em] uppercase">{t.liveMarket}</div>
              </div>
            </div>

            <div onClick={() => setIsMenuOpen(true)} className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
          </div>

          {/* MADDE 7: Chart with cyan→green gradient. overflow-visible so bubbles can escape */}
          <div className="mt-8 relative" style={{ height: 220 }}>
            {/* Inner clip */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <MarketPulseChart
                key={`${selectedAssetId}-${timeframe}`}
                data={chartDataPoints}
                comments={chartMarkers}
                lineColor="#00FFFF"
                areaTopColor="rgba(0,255,255,0.22)"
                areaBottomColor="rgba(57,255,20,0.03)"
                onCrosshairMove={(param) => {
                  if (!param?.time || !param?.seriesData) { setChartCrosshair(null); return; }
                  let price = 0;
                  param.seriesData.forEach(v => { price = v.value || price; });
                  setChartCrosshair({ idx: 0, price, x: 50, y: 50 });
                }}
                onMarkerClick={onMarkerClick}
              />
            </div>

            {/* MADDE 6: News bubble overlay — outside clip, above chart */}
            <AnimatePresence>
              {activeBubble && (
                <NewsBubble
                  bubble={activeBubble}
                  onClose={() => setActiveBubble(null)}
                  onExpand={() => { setActiveBubble(null); handleMarkerClick(activeBubble); }}
                />
              )}
            </AnimatePresence>

            {/* MADDE 8/9: Floating + comment button */}
            <button
              onClick={() => openCommentSheet()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#00FFFF]/15 border border-[#00FFFF]/30 flex items-center justify-center hover:bg-[#00FFFF]/25 active:scale-95 transition-all backdrop-blur-sm z-30"
            >
              <Plus className="w-4 h-4 text-[#00FFFF]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 mt-6 flex flex-col gap-4 w-full">
        {/* Timeframe — MADDE 1: switching these recalculates timeframeChange */}
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
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
              showNewsBubbles ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {showNewsBubbles ? t.hideNews : t.showNews}
          </button>
          <button
            onClick={() => setShowAIConsensus(!showAIConsensus)}
            className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
              showAIConsensus ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"
            }`}
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
              : (language === "Turkish"
                  ? `Yorumlarım (${allAssetUserComments.length})`
                  : `My Comments (${allAssetUserComments.length})`)}
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
