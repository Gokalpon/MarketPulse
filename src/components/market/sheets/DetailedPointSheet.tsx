import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Brain, Trash2, Reply, Globe, Heart, Send, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { DetailedPointData, UserComment, TranslationStrings } from "@/types";

interface Props {
  detailedPoint: DetailedPointData | null;
  setDetailedPoint: (p: DetailedPointData | null) => void;
  setSelectedPoint: (p: DetailedPointData | null) => void;
  language: string;
  t: TranslationStrings;
  sentimentFilter: string;
  setSentimentFilter: (s: string) => void;
  activeUserComments: UserComment[];
  deleteComment: (id: string) => void;
}

function Badge({ s }: { s: string }) {
  if (s === "Positive")
    return (
      <span className="inline-flex items-center gap-[4px] px-[9px] py-[3px] mp-positive-badge rounded-full text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap">
        <TrendingUp className="w-[10px] h-[10px]" strokeWidth={3} /> POSITIVE
      </span>
    );
  if (s === "Negative")
    return (
      <span className="inline-flex items-center gap-[4px] px-[9px] py-[3px] mp-negative-badge rounded-full text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap">
        <TrendingDown className="w-[10px] h-[10px]" strokeWidth={3} /> NEGATIVE
      </span>
    );
  return (
    <span className="inline-flex items-center gap-[3px] px-[9px] py-[3px] rounded-full text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap"
      style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.65)" }}>
      <Minus className="w-[10px] h-[10px]" strokeWidth={3} /> NEUTRAL
    </span>
  );
}

/* ── FILTER BADGE ── */
function Pill({ label, active, onClick, language }: { label: string; active: boolean; onClick: () => void; language: string }) {
  const getClassName = () => {
    if (!active) return "bg-white/5 text-white/30 border border-white/5";
    if (label === "Positive") return "mp-positive-badge shadow-[0_0_15px_rgba(0,255,255,0.2)] border-transparent";
    if (label === "Negative") return "mp-negative-badge shadow-[0_0_15px_rgba(255,59,59,0.2)] border-transparent";
    if (label === "Neutral") return "bg-white/90 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] border-transparent";
    return "bg-white/5 text-white border-transparent"; 
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex-1 max-w-[90px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${getClassName()}`}
    >
      {label === "Positive" && language === "Turkish" ? "POZİTİF" : 
       label === "Negative" && language === "Turkish" ? "NEGATİF" :
       label === "Neutral" && language === "Turkish" ? "NÖTR" :
       label === "All" && language === "Turkish" ? "HEPSİ" : label}
    </motion.button>
  );
}

/* ── per-filter AI summary texts ── */
const AI_SUMMARY: Record<string, string> = {
  All:      "Market sentiment is mixed. Both bulls and bears are active at this level.",
  Positive: "Bulls are in control. Strong buying interest and upward momentum observed.",
  Negative: "Bears dominating this zone. Risk-off sentiment with selling pressure.",
  Neutral:  "Market in consolidation. Waiting for a catalyst to break direction.",
};

const AI_SUMMARY_TR: Record<string, string> = {
  All:      "Piyasa duyarlılığı karışık. Hem boğalar hem ayılar bu seviyede aktif.",
  Positive: "Boğalar kontrolü elinde tutuyor. Güçlü alım ilgisi ve yukarı yönlü momentum gözlemleniyor.",
  Negative: "Ayılar bu bölgeye hakim. Satış baskısı olan riskten kaçış modu hakim.",
  Neutral:  "Piyasa konsolidasyon aşamasında. Yön kırılımı için bir tetikleyici bekleniyor.",
};

/* ── AI SENTIMENT CARD — CLEAN ── */
function AICard({ filter, userText, userSentiment, isOwn, isTranslated, language }: {
  filter: string; userText?: string; userSentiment?: string; isOwn?: boolean; isTranslated: boolean; language: string;
}) {
  const summaryText = isOwn && userText ? userText : (isTranslated && language === "Turkish" ? AI_SUMMARY_TR[filter] : AI_SUMMARY[filter]) ?? AI_SUMMARY.All;

  return (
    <div className="rounded-lg p-3 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,200,0.15)" }}>
      {isTranslated && (
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ 
               background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.05) 30%, rgba(224,255,247,0.18) 50%, rgba(0,255,135,0.05) 70%, transparent)",
               animation: "mp-shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)" 
             }} />
      )}
      <div className="flex items-center gap-2 mb-2.5 relative z-10">
        <Brain className="w-4 h-4" style={{ color: "#00E5CC" }} />
        <h3 className="text-[12px] font-black uppercase tracking-[0.15em]" style={{ color: "#00E5CC" }}>
          {isTranslated && language === "Turkish" ? "MARKET ÖNGÖRÜSÜ" : "Market Insight"}
        </h3>
        {isOwn && userSentiment && <Badge s={userSentiment} />}
      </div>
      <p className="text-[12px] leading-relaxed relative z-10" style={{ color: isTranslated ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)" }}>
        {summaryText}
      </p>
    </div>
  );
}

/* ── COMMENT CARD — COMPACT ── */
function Card({ c, language, isOwn, onDelete, isGlobalTranslated }: {
  c: UserComment; language: string; isOwn?: boolean; onDelete?: () => void; isGlobalTranslated: boolean;
}) {
  const [isLocalTranslated, setIsLocalTranslated] = React.useState(false);
  const isTranslated = isGlobalTranslated || isLocalTranslated;
  
  // Simulated translations for foreign comments
  const originalText = c.text;
  const translatedText = language === "Turkish" ? "Piyasada yakında bir düzeltme bekleniyor." : "Expect a market correction soon.";

  return (
    <div className="rounded-xl p-2.5 overflow-hidden relative group"
      style={{
        background: isOwn ? "rgba(90,50,200,0.08)" : "rgba(255,255,255,0.02)",
        border: isOwn ? "1px solid rgba(120,70,230,0.15)" : "1px solid rgba(255,255,255,0.05)",
      }}>
      
      {isTranslated && (
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ 
               background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.05) 30%, rgba(224,255,247,0.18) 50%, rgba(0,255,135,0.05) 70%, transparent)",
               animation: "mp-shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)" 
             }} />
      )}

      <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}>
          {isOwn ? "Y" : (c.user ?? "@")[0].toUpperCase()}
        </div>
        <span className="text-[10px] font-bold truncate flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>
          {isOwn ? "@You" : `@${c.user}`}
        </span>
        <Badge s={c.sentiment} />
        
        {!isOwn && (
          <button 
            onClick={() => setIsLocalTranslated(!isLocalTranslated)}
            className={`p-1.5 rounded-lg transition-all duration-300 ${isTranslated ? 'bg-[var(--mp-cyan)]/10 text-[var(--mp-cyan)]' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}`}
            title="Translate"
          >
            <Globe className={`w-3 h-3 ${isTranslated ? 'animate-pulse' : ''}`} />
          </button>
        )}

        {isOwn && onDelete && (
          <button onClick={onDelete} className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0">
            <Trash2 className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.2)" }} />
          </button>
        )}
      </div>

      <p className="text-[11.5px] leading-snug relative z-10" style={{ color: isTranslated ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)" }}>
        {isTranslated ? translatedText : originalText}
      </p>

      <div className="flex items-center justify-between pt-1.5 mt-1.5 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-0.5 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>
            <Heart className="w-[9px] h-[9px]" />
            <span className="text-[8px] font-bold">{c.likes ?? 0}</span>
          </button>
          <button className="flex items-center gap-0.5 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>
            <Reply className="w-[9px] h-[9px]" />
            <span className="text-[8px] font-bold">{language === "Turkish" ? "Yanıt" : "Reply"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export function DetailedPointSheet({
  detailedPoint, setDetailedPoint, setSelectedPoint,
  language, t, sentimentFilter, setSentimentFilter,
  activeUserComments, deleteComment,
}: Props) {
  const [showFullComments, setShowFullComments] = React.useState(false);
  const [isGlobalTranslated, setIsGlobalTranslated] = React.useState(false);

  return (
    <AnimatePresence>
      {detailedPoint && (() => {
        const all    = detailedPoint.comments ?? [];
        const total  = all.length;
        const pos    = all.filter((c: UserComment) => c.sentiment === "Positive").length;
        const neu    = all.filter((c: UserComment) => c.sentiment === "Neutral").length;
        const neg    = all.filter((c: UserComment) => c.sentiment === "Negative").length;
        const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
        const neuPct = total > 0 ? Math.round((neu / total) * 100) : 0;
        const negPct = total > 0 ? Math.round((neg / total) * 100) : 0;
        const score  = total > 0 ? Math.round((pos * 100 + neu * 50) / total) : 0;
        const C      = 2 * Math.PI * 14;

        const nearbyOwn = activeUserComments.filter(
          uc => Math.abs(uc.chartIndex - (detailedPoint.avgIdx ?? 0)) <= 3
        );
        const ownInFilter = sentimentFilter === "All"
          ? nearbyOwn
          : nearbyOwn.filter(uc => uc.sentiment === sentimentFilter);

        const community = all
          .filter((c: UserComment) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
          .slice(0, 40);

        // Get top community comment (most liked)
        const topComment = community.length > 0
          ? community.reduce((prev, curr) => ((curr.likes ?? 0) > (prev.likes ?? 0) ? curr : prev))
          : null;

        const close = () => { setDetailedPoint(null); setSelectedPoint(null); setShowFullComments(false); };

        const getInsightText = () => {
          if (sentimentFilter === "All") {
            return isGlobalTranslated && language === "Turkish" ? (AI_SUMMARY_TR.All) : (AI_SUMMARY.All);
          }
          if (topComment) {
            if (isGlobalTranslated && language === "Turkish") {
              if (sentimentFilter === "Positive") return "Boğalar piyasaya hakim, yükseliş devam edebilir.";
              if (sentimentFilter === "Negative") return "Piyasada yakında bir düzeltme bekleniyor.";
              return "Fiyat bu seviyede denge bulmaya çalışıyor.";
            }
            return topComment.text;
          }
          return isGlobalTranslated && language === "Turkish" ? (AI_SUMMARY_TR[sentimentFilter] ?? AI_SUMMARY_TR.All) : (AI_SUMMARY[sentimentFilter] ?? AI_SUMMARY.All);
        };

        return (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 z-[145]"
              style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            />

            {/* sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="absolute bottom-0 inset-x-0 z-[150] rounded-t-[26px] max-h-[70vh] flex flex-col"
              style={{
                background: "rgba(6,7,11,0.88)",
                backdropFilter: "blur(40px) saturate(150%)",
                WebkitBackdropFilter: "blur(40px) saturate(150%)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 -40px 80px rgba(0,0,0,0.8)",
              }}
            >
              {/* drag handle */}
              <div className="w-8 h-[3px] rounded-full mx-auto mt-[10px] flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }} />

              {/* header */}
              <div className="flex items-start gap-3 px-4 pt-3.5 pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[8.5px] font-black uppercase tracking-[0.28em] mb-2"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    Community Pulse
                  </p>
                  <h2 className="font-price text-[26px] font-bold leading-tight"
                    style={{ color: "rgba(255,255,255,0.95)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isGlobalTranslated && detailedPoint.translation ? detailedPoint.translation : (detailedPoint.type === "news" ? (detailedPoint as any).title : "Market sentiment cluster")}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                  {detailedPoint.type === "news" && (
                    <a href={detailedPoint.newsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                      style={{ background: "#FFFFFF", color: "#000000", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                      <ExternalLink className="w-3 h-3" strokeWidth={3} /> {language === "Turkish" ? "KAYNAK" : "SOURCE"}
                    </a>
                  )}
                  <button onClick={() => setIsGlobalTranslated(!isGlobalTranslated)}
                    className="p-1.5 transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
                    title={isGlobalTranslated ? "Show Original" : "Translate All"}
                  >
                    <Globe 
                      className="w-[18px] h-[18px] transition-all duration-300" 
                      strokeWidth={2.4} 
                      style={{ color: isGlobalTranslated ? "#00E5CC" : "rgba(255,255,255,0.4)" }} 
                    />
                  </button>
                  <button onClick={close}
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                    style={{ background: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                    <X className="w-3.5 h-3.5" strokeWidth={3.2} style={{ color: "#000000" }} />
                  </button>
                </div>
              </div>

              <div className="h-px mx-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* scroll body with smooth fade */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4 pb-20 space-y-3 relative"
                style={{
                  backgroundImage: "linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.8) 100%)",
                  backgroundAttachment: "fixed",
                  backgroundSize: "100% 100%"
                }}>

                {/* SENTIMENT SECTION — CLEAN & MINIMAL */}
                <div className="space-y-4 py-2">
                  {/* AI Sentiment Text — CLEAN */}
                  <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                    {isGlobalTranslated && (
                      <div className="absolute inset-0 opacity-10 pointer-events-none"
                           style={{ 
                             background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.05) 30%, rgba(224,255,247,0.18) 50%, rgba(0,255,135,0.05) 70%, transparent)",
                             animation: "mp-shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)" 
                           }} />
                    )}
                    <div className="flex items-center gap-2 mb-2.5 relative z-10">
                      <Brain className="w-4 h-4" style={{ color: "#FFFFFF" }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em]" 
                        style={{ 
                          backgroundImage: "linear-gradient(135deg,#00FF87,#00E5CC)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent"
                        }}>
                        {isGlobalTranslated && language === "Turkish" ? "MARKET ANALİZİ" : "Market Insight"}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed font-medium relative z-10" style={{ color: isGlobalTranslated ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)" }}>
                      {getInsightText()}
                    </p>
                  </div>

                  {/* Sentiment Stats — Collapsible */}
                  <details className="group cursor-pointer">
                    <summary className="flex items-center justify-between px-2 py-2 select-none" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Sentiment Details</span>
                      <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Donut — Optional */}
                      <div className="flex justify-center">
                        <div className="relative w-[100px] h-[100px]">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                            {total > 0 && <>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#00FF87" strokeWidth="4"
                                strokeDasharray={`${(posPct / 100) * C} ${C}`} strokeLinecap="round" />
                              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4"
                                strokeDasharray={`${(neuPct / 100) * C} ${C}`}
                                strokeDashoffset={`${-((posPct / 100) * C)}`} strokeLinecap="round" />
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#FF3B3B" strokeWidth="4"
                                strokeDasharray={`${(negPct / 100) * C} ${C}`}
                                strokeDashoffset={`${-(((posPct + neuPct) / 100) * C)}`} strokeLinecap="round" />
                            </>}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[36px] font-black text-white leading-none">{total > 0 ? score : "—"}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Score</span>
                          </div>
                        </div>
                      </div>

                      {/* Bars */}
                      <div className="space-y-2.5">
                        {([
                          { label: "Positive", pct: posPct, color: "#00FF87" },
                          { label: "Neutral",  pct: neuPct, color: "rgba(255,255,255,0.35)" },
                          { label: "Negative", pct: negPct, color: "#FF3B3B" },
                        ] as const).map(s => (
                          <div key={s.label} className="flex items-center gap-2.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider w-16" style={{ color: s.color }}>{s.label}</span>
                            <div className="flex-1 h-[4px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${s.pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                style={{ backgroundColor: s.color }}
                              />
                            </div>
                            <span className="text-[12px] font-black w-8 text-right" style={{ color: s.color }}>
                              {s.pct}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] font-bold text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {total} {language === "Turkish" ? "yorum" : "comments"}
                      </p>
                    </div>
                  </details>
                </div>

                {/* filter pills — minimal black glassmorphism */}
                <div className="flex justify-center gap-1.5 p-2 rounded-[20px] mb-6"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.04)"
                  }}>
                  {(["All","Positive","Neutral","Negative"] as const).map(f => (
                    <Pill key={f} label={f} active={sentimentFilter === f} onClick={() => setSentimentFilter(f)} language={language} />
                  ))}
                </div>

                {/* per-filter: user's AI card + own comments */}
                {ownInFilter.length > 0 && (
                  <AICard
                    filter={sentimentFilter}
                    userText={ownInFilter[0].text}
                    userSentiment={ownInFilter[0].sentiment}
                    isOwn
                    isTranslated={isGlobalTranslated}
                    language={language}
                  />
                )}
                {ownInFilter.map(uc => (
                  <Card key={`own-${uc.id}`} c={uc} language={language} isOwn onDelete={() => deleteComment(uc.id)} isGlobalTranslated={isGlobalTranslated} />
                ))}

                {/* community comments */}
                <div className="space-y-2 pb-3">
                  {sentimentFilter === "All" ? (
                    community.map((c: UserComment, i: number) => (
                      <Card key={i} c={c} language={language} isGlobalTranslated={isGlobalTranslated} />
                    ))
                  ) : (
                    topComment && <Card c={topComment} language={language} isGlobalTranslated={isGlobalTranslated} />
                  )}
                  {community.length === 0 && (
                    <p className="text-center py-8 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {language === "Turkish" ? "Bu kategoride yorum yok" : "No comments in this category"}
                    </p>
                  )}
                </div>
              </div>

              {/* input pinned — with blur background */}
              <div className="flex-shrink-0 relative"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}>
                <div className="px-4 py-5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={language === "Turkish" ? "Yorumunu yaz..." : "Write your comment..."}
                      className="w-full rounded-2xl py-3.5 pl-4 pr-14 text-[13px] focus:outline-none placeholder:text-white/20 font-medium"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    />
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:scale-110"
                      style={{ background: "linear-gradient(135deg,#00FF87,#00E5CC)", color: "#040D08" }}>
                      <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>
  );
}
