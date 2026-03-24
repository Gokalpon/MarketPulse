import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Brain, Trash2, Reply, Globe, Heart, Send, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DetailedPointData, UserComment, TranslationStrings } from "@/types";

interface DetailedPointSheetProps {
  detailedPoint: DetailedPointData | null;
  setDetailedPoint: (p: DetailedPointData | null) => void;
  setSelectedPoint:  (p: DetailedPointData | null) => void;
  language: string;
  t: TranslationStrings;
  sentimentFilter: string;
  setSentimentFilter: (s: string) => void;
  activeUserComments: UserComment[];
  deleteComment: (id: string) => void;
}

/* ─── badge — "imza" stil: hafif dolgu + renkli border + renkli metin ─── */
function Badge({ sentiment }: { sentiment: string }) {
  if (sentiment === "Positive")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[8px] font-black uppercase tracking-[0.1em]"
        style={{ background: "rgba(57,255,20,0.13)", border: "1px solid rgba(57,255,20,0.45)", color: "#39FF14" }}>
        <TrendingUp className="w-2 h-2" strokeWidth={3} />
        POSITIVE
      </span>
    );
  if (sentiment === "Negative")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[8px] font-black uppercase tracking-[0.1em]"
        style={{ background: "rgba(229,0,0,0.13)", border: "1px solid rgba(229,0,0,0.45)", color: "#FF4040" }}>
        <TrendingDown className="w-2 h-2" strokeWidth={3} />
        NEGATIVE
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[8px] font-black uppercase tracking-[0.1em]"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.55)" }}>
      <Minus className="w-2 h-2" strokeWidth={3} />
      NEUTRAL
    </span>
  );
}

/* ─── filter pill ─── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  let activeStyle: React.CSSProperties = {};
  if (active) {
    if (label === "Positive")  activeStyle = { background: "rgba(57,255,20,0.15)",  border: "1px solid rgba(57,255,20,0.5)",  color: "#39FF14" };
    else if (label === "Negative") activeStyle = { background: "rgba(229,0,0,0.15)", border: "1px solid rgba(229,0,0,0.5)",  color: "#FF4040" };
    else if (label === "Neutral")  activeStyle = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.85)" };
    else activeStyle = { background: "rgba(255,255,255,0.9)", border: "1px solid transparent", color: "#07080D" };
  }
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
      style={active ? activeStyle : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.32)" }}
    >
      {label}
    </button>
  );
}

/* ─── AI card ─── */
function AICard({ text, isOwn, sentiment }: { text: string; isOwn?: boolean; sentiment?: string }) {
  const accent = isOwn
    ? { light: "rgba(150,90,255,0.7)", bg: "rgba(110,55,220,0.1)", border: "rgba(140,80,240,0.22)" }
    : { light: "rgba(0,220,160,0.8)",  bg: "rgba(0,180,130,0.08)", border: "rgba(0,210,150,0.18)" };

  return (
    <div className="rounded-2xl p-4 mb-4"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[22px] h-[22px] rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent.light}20`, border: `1px solid ${accent.light}30` }}>
          <Brain className="w-3 h-3" style={{ color: accent.light }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: accent.light }}>
          {isOwn ? "Your View · AI Analysis" : "AI Sentiment Summary"}
        </span>
        {isOwn && sentiment && <Badge sentiment={sentiment} />}
      </div>
      <p className="text-[12.5px] italic leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
        "{text}"
      </p>
    </div>
  );
}

/* ─── comment card ─── */
function CommentCard({ comment, language, isOwn, onDelete }: {
  comment: UserComment; language: string; isOwn?: boolean; onDelete?: () => void;
}) {
  const initials = (comment.user ?? "@")[0].toUpperCase();
  return (
    <div className="rounded-[18px] p-4"
      style={{
        background: isOwn ? "rgba(100,55,220,0.1)" : "rgba(255,255,255,0.035)",
        border: isOwn ? "1px solid rgba(130,75,240,0.2)" : "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {isOwn ? "Y" : initials}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[12px] font-bold text-white/85 truncate">
            {isOwn ? "@You" : `@${comment.user}`}
          </span>
          <Badge sentiment={comment.sentiment} />
        </div>
        {isOwn && onDelete && (
          <button onClick={onDelete} className="p-1 rounded-lg hover:bg-white/10 flex-shrink-0 transition-colors">
            <Trash2 className="w-3 h-3 text-white/20" />
          </button>
        )}
      </div>

      <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.72)" }}>
        {comment.text}
      </p>

      <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 transition-colors" style={{ color: "rgba(255,255,255,0.22)" }}>
            <Heart className="w-3 h-3" />
            <span className="text-[10px] font-bold">{comment.likes ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 transition-colors" style={{ color: "rgba(255,255,255,0.22)" }}>
            <Reply className="w-3 h-3" />
            <span className="text-[10px] font-bold">{language === "Turkish" ? "Yanıtla" : "Reply"}</span>
          </button>
        </div>
        <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          <Globe className="w-2.5 h-2.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">
            {language === "Turkish" ? "Çevrildi" : "Translated"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export function DetailedPointSheet({
  detailedPoint, setDetailedPoint, setSelectedPoint,
  language, t, sentimentFilter, setSentimentFilter,
  activeUserComments, deleteComment,
}: DetailedPointSheetProps) {
  return (
    <AnimatePresence>
      {detailedPoint && (() => {
        const all   = detailedPoint.comments ?? [];
        const total = all.length;
        const pos   = all.filter((c: UserComment) => c.sentiment === "Positive").length;
        const neu   = all.filter((c: UserComment) => c.sentiment === "Neutral").length;
        const neg   = all.filter((c: UserComment) => c.sentiment === "Negative").length;
        const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
        const neuPct = total > 0 ? Math.round((neu / total) * 100) : 0;
        const negPct = total > 0 ? Math.round((neg / total) * 100) : 0;
        const score  = total > 0 ? Math.round((pos * 100 + neu * 50) / total) : 0;

        const C = 2 * Math.PI * 14; // circumference r=14

        /* user comments near this cluster */
        const nearbyOwn = activeUserComments.filter(
          uc => Math.abs(uc.chartIndex - (detailedPoint.avgIdx ?? 0)) <= 3
        );
        /* user comments that match current filter */
        const ownInFilter = sentimentFilter === "All"
          ? nearbyOwn
          : nearbyOwn.filter(uc => uc.sentiment === sentimentFilter);

        /* community comments for current filter */
        const communityFiltered = all
          .filter((c: UserComment) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
          .slice(0, 40);

        const close = () => { setDetailedPoint(null); setSelectedPoint(null); };

        return (
          <>
            {/* ── backdrop ── */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 z-[145]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            />

            {/* ── sheet ── */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="absolute bottom-0 inset-x-0 z-[150] rounded-t-[28px] max-h-[90vh] flex flex-col"
              style={{
                background: "rgba(6, 7, 11, 0.92)",
                backdropFilter: "blur(60px) saturate(180%)",
                WebkitBackdropFilter: "blur(60px) saturate(180%)",
                borderTop: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 -40px 100px rgba(0,0,0,0.95)",
              }}
            >
              {/* drag handle */}
              <div className="w-9 h-[3px] rounded-full mx-auto mt-[10px] flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.18)" }} />

              {/* ── header ── */}
              <div className="flex items-start gap-3 px-5 pt-4 pb-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-1.5"
                    style={{ color: "rgba(255,255,255,0.28)" }}>
                    {detailedPoint.type === "news" ? (t.newsAlert ?? "News Alert") : "Community Pulse"}
                  </p>
                  <p className="text-[15px] font-bold leading-snug line-clamp-2" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {detailedPoint.translation ?? "Market sentiment cluster"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  {detailedPoint.type === "news" && (
                    <a href={detailedPoint.newsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider"
                      style={{ background: "rgba(0,229,200,0.08)", border: "1px solid rgba(0,229,200,0.2)", color: "#00E5C8" }}>
                      <ExternalLink className="w-2.5 h-2.5" /> Source
                    </a>
                  )}
                  <button onClick={close}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />
                  </button>
                </div>
              </div>

              <div className="h-px mx-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* ── scroll body ── */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4 space-y-4">

                {/* AI card */}
                <AICard text={detailedPoint.translation ?? "Market at a key decision level. Watch for breakout signals."} />

                {/* score card */}
                <div className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-5">
                    {/* donut */}
                    <div className="relative w-[78px] h-[78px] flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                        {total > 0 && <>
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#39FF14" strokeWidth="3.5"
                            strokeDasharray={`${(posPct / 100) * C} ${C}`} strokeLinecap="butt" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5"
                            strokeDasharray={`${(neuPct / 100) * C} ${C}`}
                            strokeDashoffset={`${-((posPct / 100) * C)}`} strokeLinecap="butt" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#FF4040" strokeWidth="3.5"
                            strokeDasharray={`${(negPct / 100) * C} ${C}`}
                            strokeDashoffset={`${-(((posPct + neuPct) / 100) * C)}`} strokeLinecap="butt" />
                        </>}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[18px] font-black text-white leading-none">{total > 0 ? score : "—"}</span>
                        <span className="text-[6px] font-bold uppercase tracking-[0.18em] mt-0.5"
                          style={{ color: "rgba(255,255,255,0.25)" }}>score</span>
                      </div>
                    </div>

                    {/* stat bars */}
                    <div className="flex-1 space-y-2.5">
                      {([
                        { label: "Positive", pct: posPct, color: "#39FF14" },
                        { label: "Neutral",  pct: neuPct, color: "rgba(255,255,255,0.32)" },
                        { label: "Negative", pct: negPct, color: "#FF4040" },
                      ] as const).map(s => (
                        <div key={s.label} className="flex items-center gap-2.5">
                          <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider w-12"
                            style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</span>
                          <div className="flex-1 h-[3px] rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                          </div>
                          <span className="text-[10px] font-black w-7 text-right" style={{ color: s.color }}>
                            {s.pct}%
                          </span>
                        </div>
                      ))}
                      <p className="text-[9px] font-bold pt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {total} {language === "Turkish" ? "yorum" : "comments"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* filter pills */}
                <div className="flex gap-2">
                  {(["All","Positive","Neutral","Negative"] as const).map(f => (
                    <FilterPill key={f} label={f} active={sentimentFilter === f}
                      onClick={() => setSentimentFilter(f)} />
                  ))}
                </div>

                {/* ── per-filter: user's own AI card + comments ── */}
                {ownInFilter.length > 0 && (
                  <AICard
                    text={ownInFilter[0].text}
                    sentiment={ownInFilter[0].sentiment}
                    isOwn
                  />
                )}

                {ownInFilter.map(uc => (
                  <CommentCard key={`own-${uc.id}`} comment={uc} language={language}
                    isOwn onDelete={() => deleteComment(uc.id)} />
                ))}

                {/* community comments */}
                <div className="space-y-2.5 pb-4">
                  {communityFiltered.map((c: UserComment, i: number) => (
                    <CommentCard key={i} comment={c} language={language} />
                  ))}
                  {communityFiltered.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {language === "Turkish" ? "Bu kategoride yorum yok" : "No comments in this category"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── input (pinned) ── */}
              <div className="flex-shrink-0 px-4 pb-8 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(6,7,11,0.85)" }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === "Turkish" ? "Yorumunu yaz..." : "Write your comment..."}
                    className="w-full rounded-2xl py-3.5 pl-5 pr-14 text-[13px] focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg,#00C9A0,#00E5C8)", color: "#06070B" }}>
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
