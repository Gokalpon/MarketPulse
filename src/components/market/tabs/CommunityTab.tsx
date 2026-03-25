import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Heart, MessageCircle, Share2 } from "lucide-react";
import { COMMUNITY_POSTS } from "@/data/assets";
import { TranslationStrings } from "@/types";

interface CommunityTabProps {
  language: string;
  t: TranslationStrings;
  communityTab: string;
  setCommunityTab: (v: string) => void;
  commentsExpanded: boolean;
  setCommentsExpanded: (v: boolean) => void;
  commentsTimeframe: string;
  setCommentsTimeframe: (v: string) => void;
  setSelectedAssetId: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export function CommunityTab({
  language, t, communityTab, setCommunityTab,
  commentsExpanded, setCommentsExpanded,
  commentsTimeframe, setCommentsTimeframe,
  setSelectedAssetId, setActiveTab,
}: CommunityTabProps) {
  return (
    <motion.div key="community" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
      <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>
      <div className="flex gap-4 mb-6 border-b border-white/[0.05] pb-2">
        <button onClick={() => setCommunityTab("community")} className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "community" ? "text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
          {t.community}
          {communityTab === "community" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[var(--mp-cyan)]" />}
        </button>
        <button onClick={() => setCommunityTab("trending")} className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "trending" ? "text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
          {t.trending}
          {communityTab === "trending" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[var(--mp-green)]" />}
        </button>
      </div>

      {communityTab === "community" ? (
        <div className="flex flex-col gap-4">
          {COMMUNITY_POSTS.map((post) => (
            <div key={post.id} className="mp-glass-card rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">{post.avatar}</div>
                  <div><div className="font-bold text-[15px] text-foreground">{post.name}</div><div className="text-[var(--mp-text-secondary)] text-[11px]">{post.user} • {post.time}</div></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[9px] text-[var(--mp-text-secondary)] font-bold tracking-wider uppercase mb-1">{t.winRate}</div>
                  <div className="flex items-center gap-1 mp-gradient-badge px-2 py-0.5 rounded text-background shadow-[0_0_10px_rgba(0,255,255,0.2)]"><span className="font-black text-[11px]">{post.success}%</span></div>
                </div>
              </div>
              <p className="text-[14px] text-white/90 leading-relaxed mb-4">{post.text}</p>
              <div className="flex items-center gap-6 text-[var(--mp-text-secondary)]">
                <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors"><Heart className="w-4 h-4" /><span className="text-[12px] font-bold">{post.likes}</span></button>
                <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors"><MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.comments}</span></button>
                <button className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Trending Comments */}
          <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
            <button onClick={() => setCommentsExpanded(!commentsExpanded)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
              <h3 className="text-[11px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest">{t.trendingComments}</h3>
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-tighter">{t.expandView}</div>
                <ChevronDown className={`w-4 h-4 text-[var(--mp-text-secondary)] transition-transform duration-300 ${commentsExpanded ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {commentsExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-3 p-3">
                  <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map((tf) => (
                      <button key={tf} onClick={() => setCommentsTimeframe(tf)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tf === commentsTimeframe ? "bg-[var(--mp-green)] text-background" : "bg-white/5 text-[var(--mp-text-secondary)] hover:bg-white/10"}`}>
                        {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const multiplier = commentsTimeframe === "Daily" ? 1 : commentsTimeframe === "Weekly" ? 3 : commentsTimeframe === "Monthly" ? 8 : commentsTimeframe === "Yearly" ? 20 : 50;
                    return [...COMMUNITY_POSTS].sort((a, b) => (b.likes * multiplier + b.comments) - (a.likes * multiplier + a.comments)).slice(0, 5).map((post, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/[0.02] hover:bg-white/[0.07] transition-colors cursor-pointer">
                        <p className="text-sm text-white/80 line-clamp-3 mb-3 leading-relaxed italic">"{post.text}"</p>
                        <div className="flex items-center justify-between text-xs text-[var(--mp-text-secondary)]">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black">{post.user[0]}</div>
                            <span className="font-bold text-white/60">{post.user}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[var(--mp-red)]" /> {Math.round(post.likes * (multiplier * 0.3 + 0.7))}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-[var(--mp-cyan)]" /> {Math.round(post.comments * (multiplier * 0.2 + 0.8))}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
