import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, X, Brain, Trash2, Reply, Globe, Heart, Send } from "lucide-react";

interface DetailedPointSheetProps {
  detailedPoint: any;
  setDetailedPoint: (p: any) => void;
  setSelectedPoint: (p: any) => void;
  language: string;
  t: any;
  sentimentFilter: string;
  setSentimentFilter: (s: string) => void;
  activeUserComments: any[];
  deleteComment: (id: string) => void;
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
        const pos = allComments.filter((c: any) => c.sentiment === "Positive").length;
        const neg = allComments.filter((c: any) => c.sentiment === "Negative").length;
        const neu = allComments.filter((c: any) => c.sentiment === "Neutral").length;
        const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
        const neuPct = total > 0 ? Math.round((neu / total) * 100) : 0;
        const negPct = total > 0 ? Math.round((neg / total) * 100) : 0;
        const sentimentScore = total > 0 ? Math.round((pos * 100 + neu * 50) / total) : 0;

        return (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[145]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute bottom-0 inset-x-0 z-[150] rounded-t-[32px] max-h-[82vh] flex flex-col"
              style={{
                background: "rgba(8, 9, 14, 0.82)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 -30px 80px rgba(0,0,0,0.8)",
              }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3 mb-0 flex-shrink-0" />

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">
                    {detailedPoint.type === "news" ? t.newsAlert : "Community Pulse"}
                  </div>
                  <div className="text-[15px] font-bold text-white/90 leading-snug line-clamp-2">
                    {detailedPoint.translation}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  {detailedPoint.type === "news" && (
                    <a
                      href={detailedPoint.newsUrl || "https://www.reuters.com/markets/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors"
                      style={{ background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.15)", color: "#00FFFF" }}
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Source
                    </a>
                  )}
                  <button
                    onClick={() => { setDetailedPoint(null); setSelectedPoint(null); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="h-px mx-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-5 pt-4 pb-6">

                {/* AI Label */}
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-3.5 h-3.5" style={{ color: "rgba(0,210,180,0.7)" }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(0,210,180,0.7)" }}>
                    AI Sentiment Summary
                  </span>
                </div>

                {/* Summary quote */}
                <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[13px] font-medium text-white/80 text-center leading-relaxed italic">
                    "{detailedPoint.translation || "Market at key resistance level."}"
                  </p>
                </div>

                {/* Sentiment distribution — always shown */}
                <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-5">
                    {/* Donut */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <defs>
                          <linearGradient id="posGradDS" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00E5CC" />
                            <stop offset="100%" stopColor="#39FF14" />
                          </linearGradient>
                        </defs>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                        {total > 0 ? (
                          <>
                            <circle cx="18" cy="18" r="14" fill="none" stroke="url(#posGradDS)" strokeWidth="3"
                              strokeDasharray={`${posPct * 0.88} 88`} strokeDashoffset="0" strokeLinecap="round" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3"
                              strokeDasharray={`${neuPct * 0.88} 88`} strokeDashoffset={`${-posPct * 0.88}`} strokeLinecap="round" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#FF5050" strokeWidth="3"
                              strokeDasharray={`${negPct * 0.88} 88`} strokeDashoffset={`${-(posPct + neuPct) * 0.88}`} strokeLinecap="round" />
                          </>
                        ) : (
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"
                            strokeDasharray="88 0" strokeLinecap="round" />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <div className="text-[16px] font-black text-white leading-none">{total > 0 ? sentimentScore : "—"}</div>
                        <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-0.5">score</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-2">
                      {[
                        { label: "Positive", pct: posPct, color: "#00E5CC", count: pos },
                        { label: "Neutral", pct: neuPct, color: "rgba(255,255,255,0.35)", count: neu },
                        { label: "Negative", pct: negPct, color: "#FF5050", count: neg },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex-1">{s.label}</span>
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, backgroundColor: s.color, opacity: 0.7 }} />
                          </div>
                          <span className="text-[10px] font-black w-8 text-right" style={{ color: s.color }}>{s.pct}%</span>
                        </div>
                      ))}
                      <div className="text-[9px] text-white/25 font-bold mt-1">{total} {language === "Turkish" ? "yorum" : "comments"}</div>
                    </div>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  {["All", "Positive", "Neutral", "Negative"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSentimentFilter(s)}
                      className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0"
                      style={sentimentFilter === s
                        ? { background: "rgba(255,255,255,0.92)", color: "#0A0C10", border: "1px solid transparent" }
                        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* User's own nearby comments */}
                {activeUserComments.filter(uc => Math.abs(uc.chartIndex - detailedPoint.idx) <= 2).map((uc: any) => (
                  <div key={`own-${uc.id}`} className="flex items-start gap-2.5 p-3 rounded-2xl mb-2"
                    style={{ background: "rgba(100,60,200,0.12)", border: "1px solid rgba(120,80,220,0.2)" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-black flex-shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg, #B24BF3, #8A2BE2)" }}>Y</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-white/80">@You</span>
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          uc.sentiment === "Positive" ? "bg-[#00E5CC]/20 text-[#00E5CC]" :
                          uc.sentiment === "Negative" ? "bg-[#FF5050]/20 text-[#FF5050]" :
                          "bg-white/10 text-white/50"
                        }`}>{uc.sentiment}</span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-snug">{uc.text}</p>
                    </div>
                    <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded flex-shrink-0">
                      <Trash2 className="w-3 h-3 text-white/15" />
                    </button>
                  </div>
                ))}

                {/* Comments list */}
                <div className="space-y-2.5 mb-28">
                  {(detailedPoint.comments || [])
                    .filter((c: any) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
                    .slice(0, 30)
                    .map((comment: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-[20px] p-4 transition-all duration-200"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.08)", color: "#00E5CC", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {comment.user[1].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-white/85 truncate">{comment.user}</span>
                              <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                                comment.sentiment === "Positive" ? "text-black" :
                                comment.sentiment === "Negative" ? "text-white" :
                                "text-white/70"
                              }`} style={{
                                background: comment.sentiment === "Positive"
                                  ? "linear-gradient(135deg, #00E5CC, #39FF14)"
                                  : comment.sentiment === "Negative"
                                  ? "#FF5050"
                                  : "rgba(255,255,255,0.12)"
                              }}>
                                {comment.sentiment}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[12px] text-white/75 leading-relaxed mb-2.5">
                          {comment.text}
                        </p>

                        <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-white/25 hover:text-[#00E5CC] transition-colors text-[10px]">
                              <Heart className="w-3 h-3" />
                              <span className="font-bold">{comment.likes || 0}</span>
                            </button>
                            <button className="flex items-center gap-1 text-white/25 hover:text-white/50 transition-colors text-[10px]">
                              <Reply className="w-3 h-3" />
                              <span className="font-bold">{language === "Turkish" ? "Yanıtla" : "Reply"}</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-white/20">
                            <Globe className="w-2.5 h-2.5" />
                            <span className="font-bold uppercase tracking-wider">{language === "Turkish" ? "Çevrildi" : "Translated"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fixed comment input */}
              <div className="flex-shrink-0 px-5 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,9,14,0.7)" }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === "Turkish" ? "Yorum yaz..." : "Write your comment..."}
                    className="w-full rounded-2xl py-3.5 pl-5 pr-14 text-[13px] text-white/80 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  />
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: "rgba(0,229,204,0.12)", color: "#00E5CC" }}
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
