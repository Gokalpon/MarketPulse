import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Brain, Trash2, Reply, Globe, Heart, Send } from "lucide-react";
import { DetailedPointData, UserComment, TranslationStrings } from "@/types";

interface DetailedPointSheetProps {
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

const SENTIMENT_CONFIG = {
  Positive: { color: "#3DFF85", bg: "rgba(61,255,133,0.12)", border: "rgba(61,255,133,0.25)", label: "POSITIVE" },
  Neutral:  { color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)", label: "NEUTRAL" },
  Negative: { color: "#FF4545", bg: "rgba(255,69,69,0.12)", border: "rgba(255,69,69,0.25)", label: "NEGATIVE" },
};

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const cfg = SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG];
  if (!cfg) return null;
  return (
    <span
      className="text-[8px] font-black uppercase tracking-[0.12em] px-2 py-[3px] rounded-md"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function AISentimentCard({ text, sentiment, isOwn }: { text: string; sentiment?: string; isOwn?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{
        background: isOwn ? "rgba(80,40,200,0.1)" : "rgba(0,229,180,0.05)",
        border: `1px solid ${isOwn ? "rgba(120,80,220,0.2)" : "rgba(0,229,180,0.12)"}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: isOwn ? "rgba(140,80,255,0.2)" : "rgba(0,229,180,0.15)" }}
        >
          <Brain className="w-3 h-3" style={{ color: isOwn ? "#A06BFF" : "#00E5B4" }} />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ color: isOwn ? "#A06BFF" : "#00E5B4" }}
        >
          {isOwn ? "Your View · AI Analysis" : "AI Sentiment Summary"}
        </span>
        {isOwn && sentiment && <SentimentBadge sentiment={sentiment} />}
      </div>
      <p className="text-[12.5px] text-white/70 leading-relaxed italic">
        "{text}"
      </p>
    </div>
  );
}

export function DetailedPointSheet({
  detailedPoint, setDetailedPoint, setSelectedPoint,
  language, t, sentimentFilter, setSentimentFilter,
  activeUserComments, deleteComment,
}: DetailedPointSheetProps) {
  return (
    <AnimatePresence>
      {detailedPoint && (() => {
        const allComments = detailedPoint.comments || [];
        const total = allComments.length;
        const pos  = allComments.filter((c: UserComment) => c.sentiment === "Positive").length;
        const neg  = allComments.filter((c: UserComment) => c.sentiment === "Negative").length;
        const neu  = allComments.filter((c: UserComment) => c.sentiment === "Neutral").length;
        const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
        const neuPct = total > 0 ? Math.round((neu / total) * 100) : 0;
        const negPct = total > 0 ? Math.round((neg / total) * 100) : 0;
        const score  = total > 0 ? Math.round((pos * 100 + neu * 50) / total) : 0;

        // User comments matching nearby cluster
        const nearbyUserComments = activeUserComments.filter(
          uc => Math.abs(uc.chartIndex - (detailedPoint.avgIdx ?? 0)) <= 2
        );

        // Filtered community comments
        const filteredComments = allComments
          .filter((c: UserComment) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
          .slice(0, 30);

        // User comments for current filter (for per-tab AI sentiment)
        const filteredUserComments = sentimentFilter === "All"
          ? nearbyUserComments
          : nearbyUserComments.filter(uc => uc.sentiment === sentimentFilter);

        const circumference = 2 * Math.PI * 14; // r=14

        return (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }}
              className="absolute inset-0 z-[145]"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 240 }}
              className="absolute bottom-0 inset-x-0 z-[150] rounded-t-[28px] max-h-[88vh] flex flex-col"
              style={{
                background: "rgba(7, 8, 13, 0.88)",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 -2px 0 rgba(255,255,255,0.04), 0 -40px 100px rgba(0,0,0,0.9)",
              }}
            >
              {/* Drag handle */}
              <div className="w-9 h-[3px] bg-white/20 rounded-full mx-auto mt-3 flex-shrink-0" />

              {/* ── Header ── */}
              <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-1.5">
                    {detailedPoint.type === "news" ? (t.newsAlert ?? "News Alert") : "Community Pulse"}
                  </div>
                  <div className="text-[15px] font-bold text-white/90 leading-snug line-clamp-2">
                    {detailedPoint.translation || "Market sentiment cluster"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  {detailedPoint.type === "news" && (
                    <a
                      href={detailedPoint.newsUrl || "https://www.reuters.com/markets/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider"
                      style={{ background: "rgba(0,229,204,0.08)", border: "1px solid rgba(0,229,204,0.2)", color: "#00E5CC" }}
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Source
                    </a>
                  )}
                  <button
                    onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              </div>

              <div className="h-px mx-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-5 pt-5 pb-4">

                {/* AI Sentiment Summary */}
                <AISentimentCard
                  text={detailedPoint.translation || "Market at a key decision level. Watch for breakout signals."}
                />

                {/* ── Score card ── */}
                <div
                  className="rounded-2xl p-4 mb-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-5">
                    {/* Donut */}
                    <div className="relative w-[76px] h-[76px] flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                        {total > 0 && (
                          <>
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#3DFF85" strokeWidth="3.5"
                              strokeDasharray={`${(posPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset="0" strokeLinecap="butt" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5"
                              strokeDasharray={`${(neuPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset={`${-((posPct / 100) * circumference)}`}
                              strokeLinecap="butt" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#FF4545" strokeWidth="3.5"
                              strokeDasharray={`${(negPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset={`${-(((posPct + neuPct) / 100) * circumference)}`}
                              strokeLinecap="butt" />
                          </>
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[17px] font-black text-white leading-none">{total > 0 ? score : "—"}</span>
                        <span className="text-[6.5px] font-bold text-white/25 uppercase tracking-[0.15em] mt-0.5">score</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-2.5">
                      {([
                        { label: "Positive", pct: posPct, color: "#3DFF85" },
                        { label: "Neutral",  pct: neuPct, color: "rgba(255,255,255,0.3)" },
                        { label: "Negative", pct: negPct, color: "#FF4545" },
                      ] as const).map(s => (
                        <div key={s.label} className="flex items-center gap-2.5">
                          <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-[9px] font-bold uppercase tracking-wider w-14 text-white/40">{s.label}</span>
                          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                          </div>
                          <span className="text-[10px] font-black w-7 text-right" style={{ color: s.color }}>{s.pct}%</span>
                        </div>
                      ))}
                      <div className="text-[9px] text-white/20 font-bold pt-0.5">
                        {total} {language === "Turkish" ? "yorum" : "comments"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Filter pills ── */}
                <div className="flex gap-2 mb-5">
                  {(["All", "Positive", "Neutral", "Negative"] as const).map((f) => {
                    const active = sentimentFilter === f;
                    const cfg = f !== "All" ? SENTIMENT_CONFIG[f] : null;
                    return (
                      <button
                        key={f}
                        onClick={() => setSentimentFilter(f)}
                        className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                        style={active
                          ? { background: cfg ? cfg.bg : "rgba(255,255,255,0.9)", color: cfg ? cfg.color : "#08090D", border: `1px solid ${cfg ? cfg.border : "transparent"}` }
                          : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }
                        }
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>

                {/* ── Per-filter AI sentiment of user's own comments ── */}
                {filteredUserComments.length > 0 && (
                  <AISentimentCard
                    text={filteredUserComments[0].text}
                    sentiment={filteredUserComments[0].sentiment}
                    isOwn
                  />
                )}

                {/* ── Own comments (deletable) for current filter ── */}
                {filteredUserComments.map((uc: UserComment) => (
                  <div
                    key={`own-${uc.id}`}
                    className="flex items-start gap-3 p-3.5 rounded-2xl mb-3"
                    style={{ background: "rgba(100,55,220,0.1)", border: "1px solid rgba(130,80,240,0.18)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#B24BF3,#7B2DE2)", color: "#fff" }}
                    >
                      Y
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-white/80">@You</span>
                        <SentimentBadge sentiment={uc.sentiment} />
                      </div>
                      <p className="text-[11.5px] text-white/60 leading-snug">{uc.text}</p>
                    </div>
                    <button onClick={() => deleteComment(uc.id)} className="p-1 rounded-lg hover:bg-white/10 flex-shrink-0 transition-colors">
                      <Trash2 className="w-3 h-3 text-white/15" />
                    </button>
                  </div>
                ))}

                {/* ── Community comments ── */}
                <div className="space-y-2.5 pb-6">
                  {filteredComments.map((comment: UserComment, i: number) => (
                    <div
                      key={i}
                      className="rounded-[18px] p-4"
                      style={{
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Row: avatar + name + badge */}
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          {(comment.user ?? "?")[0].toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[12px] font-bold text-white/85 truncate">@{comment.user}</span>
                          <SentimentBadge sentiment={comment.sentiment} />
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-[12.5px] text-white/70 leading-relaxed mb-3">
                        {comment.text}
                      </p>

                      {/* Footer */}
                      <div
                        className="flex items-center justify-between pt-2.5"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1.5 text-white/25 hover:text-[#3DFF85] transition-colors">
                            <Heart className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{comment.likes ?? 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors">
                            <Reply className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{language === "Turkish" ? "Yanıtla" : "Reply"}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-white/18">
                          <Globe className="w-2.5 h-2.5" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">
                            {language === "Turkish" ? "Çevrildi" : "Translated"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Comment input (pinned bottom) ── */}
              <div
                className="flex-shrink-0 px-4 pb-7 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(7,8,13,0.8)" }}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === "Turkish" ? "Yorumunu yaz..." : "Write your comment..."}
                    className="w-full rounded-2xl py-3.5 pl-5 pr-14 text-[13px] text-white/80 placeholder-white/20 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg,#00CFAC,#00E5CC)", color: "#07080D" }}
                  >
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
