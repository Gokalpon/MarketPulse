import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Trash2 } from "lucide-react";

interface MyCommentsSheetProps {
  showMyComments: boolean;
  setShowMyComments: (v: boolean) => void;
  language: string;
  activeAsset: any;
  allAssetUserComments: any[];
  deleteComment: (id: string) => void;
}

export function MyCommentsSheet({
  showMyComments, setShowMyComments, language, activeAsset,
  allAssetUserComments, deleteComment,
}: MyCommentsSheetProps) {
  return (
    <AnimatePresence>
      {showMyComments && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMyComments(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[145]" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute bottom-0 inset-x-0 z-[150] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl mp-gradient-badge-purple flex items-center justify-center"><MessageCircle className="w-5 h-5 text-background" /></div>
                <div><div className="text-[13px] font-black text-foreground uppercase tracking-wider">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</div><div className="text-[11px] text-[var(--mp-text-secondary)]">{activeAsset.name} • {allAssetUserComments.length} {language === "Turkish" ? "yorum" : "comments"}</div></div>
              </div>
              <button onClick={() => setShowMyComments(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X className="w-4 h-4 text-white/70" /></button>
            </div>
            {allAssetUserComments.length === 0 ? (
              <div className="text-center py-10"><MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-2" /><p className="text-[12px] text-[var(--mp-text-secondary)]">{language === "Turkish" ? "Bu varlık için yorum yok." : "No comments for this asset."}</p></div>
            ) : (
              <div className="space-y-3">
                {allAssetUserComments.map((uc: any) => (
                  <div key={uc.id} className="mp-glass-card rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[var(--mp-green)] text-background" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-foreground" : "bg-[var(--mp-cyan)] text-background"}`}>{uc.sentiment}</span>
                        <span className="text-[10px] text-white/30">{uc.timeframe}</span>
                      </div>
                      <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[var(--mp-text-secondary)]" /></button>
                    </div>
                    <p className="text-[13px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                    <div className="flex items-center gap-3 text-[10px] text-white/20">
                      <span>${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
