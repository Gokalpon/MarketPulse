import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Brain, Trash2, Reply, Globe, Heart, Send, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

/* ── İMZA BADGE — solid dolgu, kenarsız, tam görseldeki gibi ── */
function Badge({ s }: { s: string }) {
  if (s === "Positive")
    return (
      <span className="inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded-full text-[7.5px] font-black uppercase tracking-[0.06em] whitespace-nowrap"
        style={{ background: "linear-gradient(135deg,#00FF87,#00E5CC)", color: "#040D08" }}>
        <TrendingUp className="w-[9px] h-[9px]" strokeWidth={3} /> POSITIVE
      </span>
    );
  if (s === "Negative")
    return (
      <span className="inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded-full text-[7.5px] font-black uppercase tracking-[0.06em] whitespace-nowrap"
        style={{ background: "linear-gradient(135deg,#FF3B3B,#C00)", color: "#fff" }}>
        <TrendingDown className="w-[9px] h-[9px]" strokeWidth={3} /> NEGATIVE
      </span>
    );
  return (
    <span className="inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded-full text-[7.5px] font-black uppercase tracking-[0.06em] whitespace-nowrap"
      style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.65)" }}>
      <Minus className="w-[9px] h-[9px]" strokeWidth={3} /> NEUTRAL
    </span>
  );
}

/* ── FILTER PILL ── */
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const activeStyle: React.CSSProperties =
    label === "Positive" ? { background: "linear-gradient(135deg,#00FF87,#00E5CC)", color: "#040D08", border: "none" } :
    label === "Negative" ? { background: "linear-gradient(135deg,#FF3B3B,#C00)", color: "#fff", border: "none" } :
    label === "Neutral"  ? { background: "rgba(255,255,255,0.18)", color: "#fff", border: "none" } :
    { background: "rgba(255,255,255,0.88)", color: "#06070B", border: "none" };

  return (
    <button onClick={onClick}
      className="flex-1 py-[7px] rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all"
      style={active ? activeStyle : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {label}
    </button>
  );
}

/* ── per-filter AI summary texts ── */
const AI_SUMMARY: Record<string, string> = {
  All:      "Market sentiment is mixed. Both bulls and bears are active at this level.",
  Positive: "Bulls are in control. Strong buying interest and upward momentum observed.",
  Negative: "Bears dominating this zone. Risk-off sentiment with selling pressure.",
  Neutral:  "Market in consolidation. Waiting for a catalyst to break direction.",
};

/* ── AI SENTIMENT CARD ── */
function AICard({ filter, userText, userSentiment, isOwn }: {
  filter: string; userText?: string; userSentiment?: string; isOwn?: boolean;
}) {
  const summaryText = isOwn && userText ? userText : AI_SUMMARY[filter] ?? AI_SUMMARY.All;

  const borderColor =
    filter === "Positive" ? "rgba(0,255,135,0.2)" :
    filter === "Negative" ? "rgba(255,59,59,0.2)" :
    filter === "Neutral"  ? "rgba(255,255,255,0.12)" :
    "rgba(0,229,180,0.18)";

  const accentColor =
    filter === "Positive" ? "#00FF87" :
    filter === "Negative" ? "#FF5050" :
    filter === "Neutral"  ? "rgba(255,255,255,0.5)" :
    "#00E5B4";

  return (
    <div className="rounded-2xl p-3.5"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderColor}` }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18` }}>
          <Brain className="w-[10px] h-[10px]" style={{ color: accentColor }} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>
          {isOwn ? "Your View · AI" : "AI Sentiment Summary"}
        </span>
        {isOwn && userSentiment && <Badge s={userSentiment} />}
      </div>
      <p className="text-[11.5px] italic leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
        "{summaryText}"
      </p>
    </div>
  );
}

/* ── COMMENT CARD ── */
function Card({ c, language, isOwn, onDelete }: {
  c: UserComment; language: string; isOwn?: boolean; onDelete?: () => void;
}) {
  return (
    <div className="rounded-[16px] p-3.5"
      style={{
        background: isOwn ? "rgba(90,50,200,0.1)" : "rgba(255,255,255,0.03)",
        border: isOwn ? "1px solid rgba(120,70,230,0.2)" : "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          {isOwn ? "Y" : (c.user ?? "@")[0].toUpperCase()}
        </div>
        <span className="text-[11.5px] font-bold truncate" style={{ color: "rgba(255,255,255,0.82)" }}>
          {isOwn ? "@You" : `@${c.user}`}
        </span>
        <Badge s={c.sentiment} />
        {isOwn && onDelete && (
          <button onClick={onDelete} className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            <Trash2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          </button>
        )}
      </div>

      <p className="text-[12px] leading-relaxed mb-2.5" style={{ color: "rgba(255,255,255,0.68)" }}>
        {c.text}
      </p>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3.5">
          <button className="flex items-center gap-1 transition-colors" style={{ color: "rgba(255,255,255,0.22)" }}>
            <Heart className="w-[11px] h-[11px]" />
            <span className="text-[9.5px] font-bold">{c.likes ?? 0}</span>
          </button>
          <button className="flex items-center gap-1 transition-colors" style={{ color: "rgba(255,255,255,0.22)" }}>
            <Reply className="w-[11px] h-[11px]" />
            <span className="text-[9.5px] font-bold">{language === "Turkish" ? "Yanıtla" : "Reply"}</span>
          </button>
        </div>
        <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.18)" }}>
          <Globe className="w-[10px] h-[10px]" />
          <span className="text-[7.5px] font-bold uppercase tracking-wider">
            {language === "Turkish" ? "Çevrildi" : "Translated"}
          </span>
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

        const close = () => { setDetailedPoint(null); setSelectedPoint(null); };

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
              className="absolute bottom-0 inset-x-0 z-[150] rounded-t-[26px] max-h-[88vh] flex flex-col"
              style={{
                background: "rgba(6,7,11,0.94)",
                backdropFilter: "blur(60px) saturate(180%)",
                WebkitBackdropFilter: "blur(60px) saturate(180%)",
                borderTop: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 -40px 100px rgba(0,0,0,0.95)",
              }}
            >
              {/* drag handle */}
              <div className="w-8 h-[3px] rounded-full mx-auto mt-[10px] flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }} />

              {/* header */}
              <div className="flex items-start gap-3 px-4 pt-3.5 pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[8.5px] font-black uppercase tracking-[0.28em] mb-1"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    Community Pulse
                  </p>
                  <p className="text-[14px] font-bold leading-snug line-clamp-2" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {detailedPoint.translation ?? "Market sentiment cluster"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                  {detailedPoint.type === "news" && (
                    <a href={detailedPoint.newsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[7.5px] font-black uppercase tracking-wider"
                      style={{ background: "rgba(0,229,200,0.08)", border: "1px solid rgba(0,229,200,0.2)", color: "#00E5C8" }}>
                      <ExternalLink className="w-2.5 h-2.5" /> Source
                    </a>
                  )}
                  <button onClick={close}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <X className="w-3 h-3" style={{ color: "rgba(255,255,255,0.45)" }} />
                  </button>
                </div>
              </div>

              <div className="h-px mx-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* scroll body */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4 pb-3 space-y-3">

                {/* AI Sentiment — per filter */}
                <AICard filter={sentimentFilter} />

                {/* score card */}
                <div className="rounded-2xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-4">
                    {/* donut */}
                    <div className="relative w-[68px] h-[68px] flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                        {total > 0 && <>
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#00FF87" strokeWidth="3.5"
                            strokeDasharray={`${(posPct / 100) * C} ${C}`} strokeLinecap="butt" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5"
                            strokeDasharray={`${(neuPct / 100) * C} ${C}`}
                            strokeDashoffset={`${-((posPct / 100) * C)}`} strokeLinecap="butt" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#FF3B3B" strokeWidth="3.5"
                            strokeDasharray={`${(negPct / 100) * C} ${C}`}
                            strokeDashoffset={`${-(((posPct + neuPct) / 100) * C)}`} strokeLinecap="butt" />
                        </>}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[16px] font-black text-white leading-none">{total > 0 ? score : "—"}</span>
                        <span className="text-[5.5px] font-bold uppercase tracking-[0.18em] mt-0.5"
                          style={{ color: "rgba(255,255,255,0.22)" }}>score</span>
                      </div>
                    </div>

                    {/* bars */}
                    <div className="flex-1 space-y-2">
                      {([
                        { label: "Positive", pct: posPct, color: "#00FF87" },
                        { label: "Neutral",  pct: neuPct, color: "rgba(255,255,255,0.3)" },
                        { label: "Negative", pct: negPct, color: "#FF3B3B" },
                      ] as const).map(s => (
                        <div key={s.label} className="flex items-center gap-2">
                          <div className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-[8px] font-bold uppercase tracking-wider w-11"
                            style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                          <div className="flex-1 h-[3px] rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                          </div>
                          <span className="text-[9.5px] font-black w-7 text-right" style={{ color: s.color }}>
                            {s.pct}%
                          </span>
                        </div>
                      ))}
                      <p className="text-[8.5px] font-bold" style={{ color: "rgba(255,255,255,0.18)" }}>
                        {total} {language === "Turkish" ? "yorum" : "comments"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* filter pills */}
                <div className="flex gap-1.5">
                  {(["All","Positive","Neutral","Negative"] as const).map(f => (
                    <Pill key={f} label={f} active={sentimentFilter === f} onClick={() => setSentimentFilter(f)} />
                  ))}
                </div>

                {/* per-filter: user's AI card + own comments */}
                {ownInFilter.length > 0 && (
                  <AICard
                    filter={sentimentFilter}
                    userText={ownInFilter[0].text}
                    userSentiment={ownInFilter[0].sentiment}
                    isOwn
                  />
                )}
                {ownInFilter.map(uc => (
                  <Card key={`own-${uc.id}`} c={uc} language={language} isOwn onDelete={() => deleteComment(uc.id)} />
                ))}

                {/* community comments */}
                <div className="space-y-2 pb-3">
                  {community.map((c: UserComment, i: number) => (
                    <Card key={i} c={c} language={language} />
                  ))}
                  {community.length === 0 && (
                    <p className="text-center py-8 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {language === "Turkish" ? "Bu kategoride yorum yok" : "No comments in this category"}
                    </p>
                  )}
                </div>
              </div>

              {/* input pinned */}
              <div className="flex-shrink-0 px-4 pb-7 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(6,7,11,0.9)" }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === "Turkish" ? "Yorumunu yaz..." : "Write your comment..."}
                    className="w-full rounded-2xl py-3 pl-4 pr-14 text-[12.5px] focus:outline-none placeholder:text-white/20"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg,#00FF87,#00E5CC)", color: "#040D08" }}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>
  );
}
