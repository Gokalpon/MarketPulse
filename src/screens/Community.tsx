// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Share2, ChevronDown } from "lucide-react";
import { ASSETS, COMMUNITY_POSTS } from "../data";
import { useApp } from "../context/AppContext";

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * 60, y: 20 - ((v - min) / range) * 20 }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return <svg width="60" height="20" className="overflow-visible"><path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

export function Community() {
  const {
    communityTab, setCommunityTab,
    trendingExpanded, setTrendingExpanded,
    commentsExpanded, setCommentsExpanded,
    trendingTimeframe, setTrendingTimeframe,
    commentsTimeframe, setCommentsTimeframe,
    t,
  } = useApp();

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-12 pb-24"
    >
      <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/[0.05] pb-2">
        {["community", "trending"].map(tab => (
          <button key={tab} onClick={() => setCommunityTab(tab)}
            className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === tab ? "text-white" : "text-[#7A7B8D]"}`}>
            {tab === "community" ? t.community : t.trending}
            {communityTab === tab && <div className={`absolute bottom-[-9px] left-0 right-0 h-0.5 ${tab === "trending" ? "bg-[#39FF14]" : "bg-[#00FFFF]"}`} />}
          </button>
        ))}
      </div>

      {communityTab === "community" ? (
        <div className="flex flex-col gap-4">
          {COMMUNITY_POSTS.map(post => (
            <div key={post.id} className="bg-black/20 border border-white/[0.03] rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">{post.avatar}</div>
                  <div>
                    <div className="font-bold text-[15px] text-white">{post.name}</div>
                    <div className="text-[#7A7B8D] text-[11px]">{post.user} • {post.time}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[9px] text-[#7A7B8D] font-bold tracking-wider uppercase mb-1">{t.winRate}</div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-[#00FFFF] to-[#39FF14] px-2 py-0.5 rounded text-black">
                    <span className="font-black text-[11px]">{post.success}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[14px] text-white/90 leading-relaxed mb-4">{post.text}</p>
              <div className="flex items-center gap-6 text-[#7A7B8D]">
                <button className="flex items-center gap-1.5 hover:text-[#39FF14] transition-colors"><Heart className="w-4 h-4" /><span className="text-[12px] font-bold">{post.likes}</span></button>
                <button className="flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors"><MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.comments}</span></button>
                <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Trending Stocks */}
          <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
            <button onClick={() => setTrendingExpanded(!trendingExpanded)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
              <h3 className="text-[11px] font-bold text-[#7A7B8D] uppercase tracking-widest">{t.trendingStocks}</h3>
              <ChevronDown className={`w-4 h-4 text-[#7A7B8D] transition-transform duration-300 ${trendingExpanded ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {trendingExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map(tf => (
                      <button key={tf} onClick={() => setTrendingTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tf === trendingTimeframe ? "bg-[#00FFFF] text-black" : "bg-white/5 text-[#7A7B8D] hover:bg-white/10"}`}>
                        {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                      </button>
                    ))}
                  </div>
                  {ASSETS.slice(0, 8).map((asset, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/[0.08] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-[#7A7B8D] font-bold text-xs">#{i + 1}</span>
                        <div>
                          <div className="font-bold text-sm">{asset.name}</div>
                          <div className="text-[9px] text-[#7A7B8D]">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Sparkline data={asset.data["1D"].slice(-15)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${asset.change.startsWith("+") ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : asset.change.startsWith("-") ? "bg-[#E50000] text-black" : "bg-white/10 text-white"}`}>{asset.change}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trending Comments */}
          <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
            <button onClick={() => setCommentsExpanded(!commentsExpanded)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
              <h3 className="text-[11px] font-bold text-[#7A7B8D] uppercase tracking-widest">{t.trendingComments}</h3>
              <ChevronDown className={`w-4 h-4 text-[#7A7B8D] transition-transform duration-300 ${commentsExpanded ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {commentsExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-3 p-3">
                  <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map(tf => (
                      <button key={tf} onClick={() => setCommentsTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tf === commentsTimeframe ? "bg-[#39FF14] text-black" : "bg-white/5 text-[#7A7B8D] hover:bg-white/10"}`}>
                        {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                      </button>
                    ))}
                  </div>
                  {COMMUNITY_POSTS.slice(0, 5).map((post, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/[0.02] hover:bg-white/[0.07] transition-colors cursor-pointer">
                      <p className="text-sm text-white/80 line-clamp-3 mb-3 leading-relaxed italic">"{post.text}"</p>
                      <div className="flex items-center justify-between text-xs text-[#7A7B8D]">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black">{post.user[0]}</div>
                          <span className="font-bold text-white/60">{post.user}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#E50000]" /> {post.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-[#00FFFF]" /> {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
