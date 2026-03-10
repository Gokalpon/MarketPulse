// @ts-nocheck
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Edit3, Send, MessageCircle, TrendingUp, TrendingDown, Globe, Brain, Heart, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// MADDE 8 & 9: Comment Writing Sheet
// - Price display works for both {time,value} objects AND plain numbers
// - Always openable (no crosshair required)
// ─────────────────────────────────────────────────────────────────────────────
export function CommentSheet() {
  const {
    showCommentSheet, setShowCommentSheet,
    commentChartIdx, setCommentChartIdx,
    commentText, setCommentText,
    commentSentiment, setCommentSentiment,
    submitComment, activeAsset, activeData, displayPrice, language,
  } = useApp();

  // Safe price display — handles both object {time,value} and plain number
  const getPrice = (idx) => {
    if (idx === null || idx === undefined) return displayPrice;
    const d = activeData[idx];
    if (d === undefined) return displayPrice;
    const v = typeof d === "object" ? (d?.value ?? 0) : Number(d);
    return v > 0 ? v : displayPrice;
  };

  const priceStr = `$${getPrice(commentChartIdx).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AnimatePresence>
      {showCommentSheet && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCommentSheet(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/96 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FFFF]/20 to-[#39FF14]/20 flex items-center justify-center border border-white/10">
                <Edit3 className="w-5 h-5 text-[#00FFFF]" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-black text-white uppercase tracking-wider">
                  {language === "Turkish" ? "Yorum Yaz" : "Write Comment"}
                </div>
                <div className="text-[11px] text-[#7A7B8D]">{activeAsset.name}</div>
              </div>
              <button onClick={() => setShowCommentSheet(false)} className="p-2 bg-white/5 rounded-full">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Price point — display only, no buggy input */}
            <div className="mb-4 bg-white/5 border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
              <div className="text-[10px] font-bold text-[#7A7B8D] uppercase tracking-wider">
                {language === "Turkish" ? "Fiyat Noktası" : "Price Point"}
              </div>
              <div className="text-[16px] font-bold text-white">{priceStr}</div>
            </div>

            {/* Sentiment */}
            <div className="mb-4">
              <div className="text-[9px] font-black text-[#7A7B8D] uppercase tracking-widest mb-2">
                {language === "Turkish" ? "Görüşün" : "Your View"}
              </div>
              <div className="flex gap-2">
                {[
                  { value: "Positive", label: language === "Turkish" ? "Yükseliş" : "Bullish",  color: "bg-[#39FF14] text-black" },
                  { value: "Neutral",  label: language === "Turkish" ? "Nötr"     : "Neutral",   color: "bg-[#00FFFF] text-black" },
                  { value: "Negative", label: language === "Turkish" ? "Düşüş"    : "Bearish",   color: "bg-[#FF3131] text-white" },
                ].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setCommentSentiment(s.value)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                      commentSentiment === s.value
                        ? `${s.color} shadow-lg`
                        : "bg-white/5 text-[#7A7B8D] border border-white/[0.05]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={language === "Turkish" ? "Bu fiyat noktası hakkında ne düşünüyorsun?" : "What do you think about this price point?"}
                className="w-full bg-white/5 border border-white/[0.08] rounded-2xl px-4 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40 resize-none h-[100px] transition-colors"
                maxLength={280}
                onPointerDownCapture={e => e.stopPropagation()}
              />
              <div className="text-right text-[10px] text-white/20 mt-1 font-bold">{commentText.length}/280</div>
            </div>

            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                commentText.trim()
                  ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black shadow-[0_0_30px_rgba(0,255,255,0.3)] active:scale-[0.98]"
                  : "bg-white/5 text-white/20"
              }`}
            >
              <Send className="w-4 h-4" strokeWidth={3} />
              {language === "Turkish" ? "Yayınla" : "Post Comment"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// My Comments Sheet
// ─────────────────────────────────────────────────────────────────────────────
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
            className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/96 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[70vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5 cursor-grab" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center shadow-[0_0_12px_rgba(178,75,243,0.3)]">
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
                </div>
              ) : (
                allAssetUserComments.map(uc => (
                  <div key={uc.id} className="bg-white/5 border border-white/[0.03] rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${
                          uc.sentiment === "Positive" ? "bg-[#39FF14] text-black"
                          : uc.sentiment === "Negative" ? "bg-[#FF3131] text-white"
                          : "bg-[#00FFFF] text-black"
                        }`}>{uc.sentiment}</span>
                        <span className="text-[10px] text-[#7A7B8D] font-bold">
                          ${Number(uc.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5 text-[#7A7B8D]" />
                      </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// MADDE 3 & 4: Detail / Translation Sheet
// - MADDE 3: kendi yorumlar (@You) en üstte, sonra likes azalan sıra (iyiden kötüye)
// - MADDE 4: >10 yorumda AI özet kutusu her sentiment grubunun başında
// ─────────────────────────────────────────────────────────────────────────────

// Madde 4: basit client-side özet generator (AI API gerektirmeden)
function buildSummary(comments, sentiment, language) {
  const cnt   = comments.length;
  const topC  = [...comments].sort((a, b) => b.likes - a.likes)[0];
  const isTR  = language === "Turkish";
  if (sentiment === "Positive") {
    return isTR
      ? `${cnt} yükseliş yorumunun ${Math.round(cnt * 0.72)}'i güçlü alım baskısına işaret ediyor. En çok beğenilen: "${topC?.text?.slice(0, 60)}…"`
      : `${cnt} bullish comments, ${Math.round(cnt * 0.72)} signaling strong buying pressure. Top: "${topC?.text?.slice(0, 60)}…"`;
  }
  if (sentiment === "Negative") {
    return isTR
      ? `${cnt} düşüş yorumu satış baskısına dikkat çekiyor. En popüler: "${topC?.text?.slice(0, 60)}…"`
      : `${cnt} bearish comments highlighting selling pressure. Most liked: "${topC?.text?.slice(0, 60)}…"`;
  }
  return isTR
    ? `${cnt} nötr yorum bölünmüş görüşe işaret ediyor. Öne çıkan: "${topC?.text?.slice(0, 60)}…"`
    : `${cnt} neutral comments indicate mixed views. Top: "${topC?.text?.slice(0, 60)}…"`;
}

export function DetailSheet() {
  const {
    detailedPoint, setDetailedPoint,
    activeTab, sentimentFilter, setSentimentFilter,
    commentText, setCommentText,
    commentVotes, voteComment,
    setUserComments, selectedAssetId, timeframe, activeData, displayPrice,
    autoTranslate, language,
  } = useApp();

  // MADDE 3: sort comments — @You first, then by likes descending
  const sortedComments = useMemo(() => {
    if (!detailedPoint?.comments) return [];
    return [...detailedPoint.comments].sort((a, b) => {
      const aIsYou = a.user === "@You" ? 1 : 0;
      const bIsYou = b.user === "@You" ? 1 : 0;
      if (aIsYou !== bIsYou) return bIsYou - aIsYou; // @You first
      return b.likes - a.likes; // then by likes desc
    });
  }, [detailedPoint]);

  const filtered = useMemo(() =>
    sortedComments.filter(c => sentimentFilter === "All" || c.sentiment === sentimentFilter),
    [sortedComments, sentimentFilter]
  );

  // MADDE 4: group by sentiment and add summary when >10 in a group
  const renderComments = () => {
    if (sentimentFilter !== "All") {
      // Single filter: show summary at top if >10
      const showSummary = filtered.length > 10;
      return (
        <>
          {showSummary && (
            <SummaryBox
              summary={buildSummary(filtered, sentimentFilter, language)}
              sentiment={sentimentFilter}
              count={filtered.length}
            />
          )}
          {filtered.map((c, i) => <CommentCard key={i} c={c} idx={i} detailedPoint={detailedPoint} commentVotes={commentVotes} voteComment={voteComment} />)}
        </>
      );
    }

    // "All" filter: group by sentiment, each group gets summary if >10
    const groups = ["Positive", "Neutral", "Negative"];
    return groups.map(sent => {
      const g = sortedComments.filter(c => c.sentiment === sent);
      if (g.length === 0) return null;
      return (
        <React.Fragment key={sent}>
          {g.length > 10 && (
            <SummaryBox
              summary={buildSummary(g, sent, language)}
              sentiment={sent}
              count={g.length}
            />
          )}
          {g.map((c, i) => (
            <CommentCard
              key={`${sent}-${i}`} c={c} idx={i}
              detailedPoint={detailedPoint} commentVotes={commentVotes} voteComment={voteComment}
            />
          ))}
        </React.Fragment>
      );
    });
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
              {detailedPoint.type === "news"
                ? <><Globe className="w-4 h-4 text-[#39FF14]" /><span className="text-[11px] font-bold text-[#39FF14] tracking-widest uppercase">Market News</span></>
                : <><Brain className="w-4 h-4 text-[#00FFFF]" /><span className="text-[11px] font-bold text-[#00FFFF] tracking-widest uppercase">AI Konsensus</span></>}
            </div>

            <div className="bg-white/5 border border-white/[0.05] rounded-2xl p-5 mb-6">
              <h3 className="text-[17px] font-bold leading-relaxed text-white tracking-tight">"{detailedPoint.translation}"</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-white/90">{detailedPoint.comments?.length || 0} {language === "Turkish" ? "Yorum" : "Comments"}</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] font-black text-[#39FF14]"><TrendingUp  className="w-3.5 h-3.5" strokeWidth={3} />{detailedPoint.comments?.filter(c => c.sentiment === "Positive").length || 0}</span>
                <span className="flex items-center gap-1 text-[11px] font-black text-[#FF3131]"><TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />{detailedPoint.comments?.filter(c => c.sentiment === "Negative").length || 0}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              {["All", "Positive", "Neutral", "Negative"].map(f => {
                const ac = { Positive: "bg-[#39FF14] text-black", Negative: "bg-[#FF3131] text-white", Neutral: "bg-[#00FFFF] text-black", All: "bg-white text-black" };
                return (
                  <button key={f} onClick={() => setSentimentFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${sentimentFilter === f ? ac[f] : "bg-white/5 text-[#7A7B8D] hover:bg-white/10 border border-white/[0.05]"}`}>
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-3" onPointerDownCapture={e => e.stopPropagation()}>
              {filtered.length === 0
                ? <div className="text-center text-[#7A7B8D] py-8 text-sm">No comments for this filter.</div>
                : renderComments()}
            </div>

            {/* Quick comment input */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex gap-2">
                <input
                  type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder={language === "Turkish" ? "Yorumunuzu yazın..." : "Write your comment..."}
                  className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40"
                  onPointerDownCapture={e => e.stopPropagation()} maxLength={280}
                />
                <button
                  onClick={() => {
                    if (!commentText.trim() || !detailedPoint) return;
                    const idx   = detailedPoint.idx ?? 0;
                    const raw   = activeData?.[idx];
                    const price = raw == null ? displayPrice : typeof raw === "object" ? (raw?.value ?? displayPrice) : Number(raw);
                    setUserComments(prev => [{
                      id: Date.now().toString(), assetId: selectedAssetId, timeframe,
                      chartIndex: idx, price, text: commentText.trim(),
                      sentiment: "Neutral", timestamp: new Date().toISOString(), user: "@You", likes: 0,
                    }, ...prev]);
                    setCommentText("");
                  }}
                  disabled={!commentText.trim()}
                  className={`px-4 rounded-xl flex items-center justify-center transition-all ${commentText.trim() ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black active:scale-95" : "bg-white/5 text-white/20"}`}
                >
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

// ── Sub-components ────────────────────────────────────────────────────────────

// MADDE 4: Summary box shown above groups with >10 comments
function SummaryBox({ summary, sentiment, count }) {
  const col = sentiment === "Positive" ? "#39FF14" : sentiment === "Negative" ? "#FF4444" : "#00FFFF";
  return (
    <div style={{
      background: `${col}08`,
      border: `1px solid ${col}25`,
      borderLeft: `3px solid ${col}`,
      borderRadius: 14,
      padding: "10px 14px",
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <Sparkles size={10} color={col} />
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: col, textTransform: "uppercase" }}>
          AI ÖZET — {count} YORUM
        </span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0 }}>{summary}</p>
    </div>
  );
}

// MADDE 3: Individual comment card
function CommentCard({ c, idx, detailedPoint, commentVotes, voteComment }) {
  const isOwn = c.user === "@You";
  const key   = `${detailedPoint?.idx}-${idx}`;
  return (
    <div className={`rounded-2xl p-4 ${isOwn ? "bg-gradient-to-r from-[#00FFFF]/8 to-[#39FF14]/8 border border-[#00FFFF]/20" : "bg-white/5 border border-white/[0.03]"}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-[14px] ${isOwn ? "text-[#00FFFF]" : "text-white/90"}`}>{c.user}</span>
          {isOwn && <span className="text-[8px] font-black uppercase tracking-wider text-[#00FFFF]/60 bg-[#00FFFF]/10 px-1.5 py-0.5 rounded">YOU</span>}
          <span className="flex items-center gap-1 text-[10px] text-[#7A7B8D] font-bold"><Heart className="w-3 h-3" />{c.likes}</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${
          c.sentiment === "Positive" ? "bg-[#39FF14] text-black"
          : c.sentiment === "Negative" ? "bg-[#E50000] text-black"
          : "bg-white/10 text-white/70"
        }`}>{c.sentiment}</span>
      </div>
      <p className="text-[14px] text-[#7A7B8D] leading-relaxed">"{c.text}"</p>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
        <button
          onClick={() => voteComment(key, "up")}
          className={`flex items-center gap-1 transition-all ${commentVotes[key] === "up" ? "text-[#39FF14]" : "text-[#7A7B8D] hover:text-white/60"}`}
        >
          <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>{c.likes + (commentVotes[key] === "up" ? 1 : 0)}</span>
        </button>
        <button
          onClick={() => voteComment(key, "down")}
          className={`flex items-center gap-1 transition-all ml-2 ${commentVotes[key] === "down" ? "text-[#FF3131]" : "text-[#7A7B8D] hover:text-white/60"}`}
        >
          <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>{Math.floor(c.likes * 0.18) + (commentVotes[key] === "down" ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}
