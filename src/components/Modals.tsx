// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Send, Edit3, MessageCircle, Heart, Globe,
  TrendingUp, TrendingDown, Trash2, Brain
} from "lucide-react";
import { useApp } from "../context/AppContext";

/* ── Comment Writing Sheet ─────────────────────────────────────────────── */
export function CommentSheet() {
  const {
    showCommentSheet, setShowCommentSheet,
    commentChartIdx, setCommentChartIdx,
    commentText, setCommentText,
    commentSentiment, setCommentSentiment,
    submitComment,
    activeAsset, activeData,
    language,
  } = useApp();

  return (
    <AnimatePresence>
      {showCommentSheet && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentSheet(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FFFF]/20 to-[#39FF14]/20 flex items-center justify-center border border-white/10">
                <Edit3 className="w-5 h-5 text-[#00FFFF]" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-black text-white uppercase tracking-wider">{language === "Turkish" ? "Yorum Yaz" : "Write Comment"}</div>
                <div className="text-[11px] text-[#7A7B8D]">{activeAsset.name}</div>
              </div>
            </div>

            {/* Price display */}
            <div className="mb-4 bg-white/5 border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
              <div className="text-[10px] font-bold text-[#7A7B8D] uppercase tracking-wider">{language === "Turkish" ? "Fiyat Noktası" : "Price Point"}</div>
              <div className="text-[16px] font-bold text-white">
                ${commentChartIdx !== null ? (typeof activeData[commentChartIdx] === "object" ? activeData[commentChartIdx]?.value?.toFixed(2) : activeData[commentChartIdx]?.toFixed(2)) : "—"}
              </div>
            </div>

            {/* Sentiment */}
            <div className="mb-4">
              <div className="text-[9px] font-black text-[#7A7B8D] uppercase tracking-widest mb-2">{language === "Turkish" ? "Görüşün" : "Your View"}</div>
              <div className="flex gap-2">
                {[
                  { value: "Positive", label: language === "Turkish" ? "Yükseliş" : "Bullish", style: "bg-[#39FF14] text-black" },
                  { value: "Neutral",  label: language === "Turkish" ? "Nötr" : "Neutral",     style: "bg-[#00FFFF] text-black" },
                  { value: "Negative", label: language === "Turkish" ? "Düşüş" : "Bearish",    style: "bg-[#FF3131] text-white" },
                ].map(s => (
                  <button key={s.value} onClick={() => setCommentSentiment(s.value)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${commentSentiment === s.value ? `${s.style} shadow-lg` : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <textarea
                value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder={language === "Turkish" ? "Bu fiyat noktası hakkında ne düşünüyorsun?" : "What do you think about this price point?"}
                className="w-full bg-white/5 border border-white/[0.08] rounded-2xl px-4 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40 resize-none h-[100px] transition-colors"
                maxLength={280}
              />
              <div className="text-right text-[10px] text-white/20 mt-1 font-bold">{commentText.length}/280</div>
            </div>

            <button onClick={submitComment} disabled={!commentText.trim()}
              className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${commentText.trim() ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black shadow-[0_0_30px_rgba(0,255,255,0.3)] active:scale-[0.98]" : "bg-white/5 text-white/20"}`}>
              <Send className="w-4 h-4" strokeWidth={3} />
              {language === "Turkish" ? "Yayınla" : "Post Comment"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── My Comments Sheet ──────────────────────────────────────────────────── */
export function MyCommentsSheet() {
  const {
    showMyComments, setShowMyComments,
    allAssetUserComments, deleteComment,
    activeAsset, language,
  } = useApp();

  return (
    <AnimatePresence>
      {showMyComments && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMyComments(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) setShowMyComments(false); }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[70vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5 cursor-grab" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-[13px] font-black text-white uppercase tracking-wider">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</div>
                  <div className="text-[11px] text-[#7A7B8D]">{activeAsset.name} • {allAssetUserComments.length} {language === "Turkish" ? "yorum" : "comments"}</div>
                </div>
              </div>
              <button onClick={() => setShowMyComments(false)} className="p-2 bg-white/5 rounded-full"><X className="w-4 h-4 text-white/40" /></button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3" onPointerDownCapture={e => e.stopPropagation()}>
              {allAssetUserComments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-[13px] text-[#7A7B8D]">{language === "Turkish" ? "Henüz yorum yazmadınız." : "No comments yet."}</p>
                  <p className="text-[11px] text-white/20 mt-1">{language === "Turkish" ? "Grafikte bir noktaya dokunup yorum yazın." : "Tap on the chart to write a comment."}</p>
                </div>
              ) : (
                allAssetUserComments.map((uc: any) => (
                  <div key={uc.id} className="bg-white/5 border border-white/[0.03] rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${uc.sentiment === "Positive" ? "bg-[#39FF14] text-black" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-white" : "bg-[#00FFFF] text-black"}`}>{uc.sentiment}</span>
                        <span className="text-[10px] text-[#7A7B8D] font-bold">${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-white/20">{uc.timeframe}</span>
                      </div>
                      <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-[#7A7B8D]" /></button>
                    </div>
                    <p className="text-[14px] text-white/80 leading-relaxed">{uc.text}</p>
                    <div className="text-[9px] text-white/20 mt-2">{new Date(uc.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Detail Sheet (news/AI marker tap) ─────────────────────────────────── */
export function DetailSheet() {
  const {
    detailedPoint, setDetailedPoint,
    selectedPoint,
    sentimentFilter, setSentimentFilter,
    commentText, setCommentText,
    userComments, setUserComments,
    commentVotes, voteComment,
    autoTranslate, activeData,
    selectedAssetId, timeframe,
    activeTab, activeAsset,
    language, t,
  } = useApp();

  const submitInlineComment = () => {
    if (!commentText.trim() || !detailedPoint) return;
    const price = typeof activeData[detailedPoint.idx] === "object" ? (activeData[detailedPoint.idx] as any).value : activeData[detailedPoint.idx];
    setUserComments((prev: any[]) => [{
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: detailedPoint.idx,
      price,
      text: commentText.trim(),
      sentiment: "Neutral",
      timestamp: new Date().toISOString(),
      user: "@You",
      likes: 0,
    }, ...prev]);
    setCommentText("");
  };

  return (
    <AnimatePresence>
      {detailedPoint && activeTab === "dashboard" && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailedPoint(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) setDetailedPoint(null); }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 z-[120] bg-black/80 backdrop-blur-3xl border-t border-white/[0.05] rounded-t-[40px] p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-h-[75vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 cursor-grab" />

            <div className="flex items-center gap-2 mb-4">
              {detailedPoint.type === "news" ? (
                <><Globe className="w-4 h-4 text-[#39FF14]" /><span className="text-[11px] font-bold text-[#39FF14] tracking-widest uppercase">Market News & AI Analysis</span></>
              ) : (
                <><Brain className="w-4 h-4 text-[#00FFFF]" /><span className="text-[11px] font-bold text-[#00FFFF] tracking-widest uppercase">AI Sentiment Summary</span></>
              )}
            </div>

            <div className="bg-white/5 border border-white/[0.05] rounded-2xl p-5 mb-6">
              <h3 className="text-[18px] font-bold leading-relaxed text-white tracking-tight">"{detailedPoint.translation}"</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-white/90">{detailedPoint.comments?.length || 0} Comments</div>
            </div>

            {/* Sentiment filter */}
            <div className="flex gap-2 mb-6">
              {["All", "Positive", "Neutral", "Negative"].map(f => {
                const active = sentimentFilter === f;
                const cls = f === "Positive" ? (active ? "bg-[#39FF14] text-black" : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]")
                  : f === "Negative" ? (active ? "bg-[#FF3131] text-white" : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]")
                  : f === "Neutral"  ? (active ? "bg-[#00FFFF] text-black" : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]")
                  : (active ? "bg-white text-black" : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]");
                return (
                  <button key={f} onClick={() => setSentimentFilter(f)} className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${cls}`}>{f}</button>
                );
              })}
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3" onPointerDownCapture={e => e.stopPropagation()}>
              {detailedPoint.comments ? detailedPoint.comments
                .filter((c: any) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
                .map((c: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/[0.03] rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-white/90">{c.user}</span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7A7B8D] font-bold"><Heart className="w-3 h-3" /> {c.likes}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${c.sentiment === "Positive" ? "bg-[#39FF14] text-black" : c.sentiment === "Negative" ? "bg-[#E50000] text-black" : "bg-white/10 text-white/70"}`}>{c.sentiment}</span>
                    </div>
                    <p className="text-[14px] text-[#7A7B8D] leading-relaxed">"{c.text}"</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => voteComment(`${detailedPoint?.idx}-${i}`, "up")} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${commentVotes[`${detailedPoint?.idx}-${i}`] === "up" ? "bg-[#39FF14]/20 text-[#39FF14]" : "text-[#7A7B8D] hover:bg-white/5"}`}>
                          <TrendingUp className="w-3 h-3" strokeWidth={3} />
                          {c.likes + (commentVotes[`${detailedPoint?.idx}-${i}`] === "up" ? 1 : 0)}
                        </button>
                        <button onClick={() => voteComment(`${detailedPoint?.idx}-${i}`, "down")} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${commentVotes[`${detailedPoint?.idx}-${i}`] === "down" ? "bg-[#FF3131]/20 text-[#FF3131]" : "text-[#7A7B8D] hover:bg-white/5"}`}>
                          <TrendingDown className="w-3 h-3" strokeWidth={3} />
                        </button>
                      </div>
                      {autoTranslate && (
                        <div className="flex items-center gap-1.5 opacity-50">
                          <Globe className="w-3 h-3 text-white" />
                          <span className="text-[9px] font-medium text-white uppercase tracking-wider">Translated</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : <div className="text-center text-[#7A7B8D] py-8 text-sm">No comments available.</div>}
            </div>

            {/* Quick comment input */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex gap-2">
                <input
                  type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder={language === "Turkish" ? "Yorumunuzu yazın..." : "Write your comment..."}
                  className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40"
                  onPointerDownCapture={e => e.stopPropagation()}
                  maxLength={280}
                />
                <button onClick={submitInlineComment} disabled={!commentText.trim()}
                  className={`px-4 rounded-xl flex items-center justify-center transition-all ${commentText.trim() ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black active:scale-95" : "bg-white/5 text-white/20"}`}>
                  <Send className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
