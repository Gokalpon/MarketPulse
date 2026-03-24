import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit3, Send } from "lucide-react";

interface CommentSheetProps {
  showCommentSheet: boolean;
  setShowCommentSheet: (v: boolean) => void;
  language: string;
  activeAsset: any;
  commentChartIdx: number | null;
  activeData: number[];
  commentSentiment: string;
  setCommentSentiment: (s: string) => void;
  commentText: string;
  setCommentText: (t: string) => void;
  submitComment: () => void;
}

export function CommentSheet({
  showCommentSheet, setShowCommentSheet, language, activeAsset,
  commentChartIdx, activeData, commentSentiment, setCommentSentiment,
  commentText, setCommentText, submitComment,
}: CommentSheetProps) {
  return (
    <AnimatePresence>
      {showCommentSheet && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentSheet(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[145]" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 inset-x-0 z-[150] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--mp-cyan)]/20 to-[var(--mp-green)]/20 flex items-center justify-center border border-white/10"><Edit3 className="w-5 h-5 text-[var(--mp-cyan)]" /></div>
              <div className="flex-1"><div className="text-[13px] font-black text-foreground uppercase tracking-wider">{language === "Turkish" ? "Yorum Yaz" : "Write Comment"}</div><div className="text-[11px] text-[var(--mp-text-secondary)]">{activeAsset.name}</div></div>
            </div>
            <div className="mb-4 bg-white/5 border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
              <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-wider">{language === "Turkish" ? "Fiyat Noktası" : "Price Point"}</div>
              <div className="text-[16px] font-bold text-foreground">{commentChartIdx !== null ? `$${activeData[commentChartIdx]?.toFixed(2)}` : ""}</div>
            </div>
            <div className="mb-4">
              <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-wider mb-2">{language === "Turkish" ? "Duyarlılık" : "Sentiment"}</div>
              <div className="flex gap-2">
                {["Positive", "Neutral", "Negative"].map((s) => (
                  <button key={s} onClick={() => setCommentSentiment(s)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${commentSentiment === s ? (s === "Positive" ? "bg-[var(--mp-green)] text-background" : s === "Negative" ? "bg-[var(--mp-red)] text-foreground" : "bg-[var(--mp-cyan)] text-background") : "bg-white/5 text-white/40"}`}>{s === "Positive" ? "Bullish" : s === "Negative" ? "Bearish" : "Neutral"}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={language === "Turkish" ? "Yorumunuzu yazın..." : "Write your comment..."} className="w-full bg-white/5 border border-white/[0.05] rounded-xl p-4 text-[14px] text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 resize-none h-24 transition-colors" />
            </div>
            <button onClick={submitComment} disabled={!commentText.trim()} className="w-full mp-gradient-badge text-background font-black py-3 rounded-xl text-[12px] uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,255,0.3)] disabled:opacity-30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <Send className="w-4 h-4" strokeWidth={3} />
              {language === "Turkish" ? "Gönder" : "Submit"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
