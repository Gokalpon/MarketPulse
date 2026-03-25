import React from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Trophy, Target, ShieldCheck } from "lucide-react";
import { COMMUNITY_POSTS } from "@/data/assets";
import { TranslationStrings } from "@/types";

const SIGNALS = [
  { id: 1, user: "@CryptoKing", avatar: "CK", asset: "BTC/USD", direction: "LONG" as const, entry: 43200, target: 48000, stop: 41000, rr: "2.3", time: "2h ago", success: 88 },
  { id: 2, user: "@GoldBug", avatar: "GB", asset: "GOLD", direction: "LONG" as const, entry: 2045, target: 2100, stop: 2010, rr: "1.5", time: "5h ago", success: 92 },
  { id: 3, user: "@BearHunter", avatar: "BH", asset: "NASDAQ", direction: "SHORT" as const, entry: 17800, target: 16500, stop: 18200, rr: "3.2", time: "6h ago", success: 74 },
  { id: 4, user: "@Gokalp", avatar: "G", asset: "SOL/USD", direction: "LONG" as const, entry: 98, target: 130, stop: 88, rr: "3.2", time: "8h ago", success: 95 },
  { id: 5, user: "@MacroEcon", avatar: "ME", asset: "EUR/USD", direction: "LONG" as const, entry: 1.0820, target: 1.1050, stop: 1.0720, rr: "2.3", time: "12h ago", success: 81 },
];

const LEADERBOARD = [...COMMUNITY_POSTS]
  .sort((a, b) => b.success - a.success)
  .map((p, i) => ({ rank: i + 1, ...p }));

const TABS = [
  { key: "community", label: "Feed" },
  { key: "signals",   label: "Signals" },
  { key: "leaderboard", label: "Leaderboard" },
];

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
  t, communityTab, setCommunityTab,
}: CommunityTabProps) {
  const activeTab = TABS.find((tb) => tb.key === communityTab) ? communityTab : "community";

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-12 pb-24"
    >
      <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>

      {/* Tab Bar */}
      <div className="flex gap-5 mb-6 border-b border-white/[0.05] pb-2">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setCommunityTab(tb.key)}
            className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative transition-colors ${
              activeTab === tb.key ? "text-foreground" : "text-[var(--mp-text-secondary)]"
            }`}
          >
            {tb.label}
            {activeTab === tb.key && (
              <div
                className="absolute bottom-[-9px] left-0 right-0 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg, #00FF87, #00E5CC)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* FEED */}
      {activeTab === "community" && (
        <div className="flex flex-col gap-4">
          {COMMUNITY_POSTS.map((post) => (
            <div key={post.id} className="mp-glass-card rounded-[24px] p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">
                    {post.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-foreground">{post.name}</div>
                    <div className="text-[var(--mp-text-secondary)] text-[11px]">{post.user} · {post.time}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[9px] text-[var(--mp-text-secondary)] font-bold tracking-wider uppercase mb-1">{t.winRate}</div>
                  <div
                    className="px-2 py-0.5 rounded text-background text-[11px] font-black"
                    style={{ background: "linear-gradient(135deg, #00FF87, #00E5CC)" }}
                  >
                    {post.success}%
                  </div>
                </div>
              </div>
              <p className="text-[14px] text-white/90 leading-relaxed mb-4">{post.text}</p>
              <div className="flex items-center gap-6 text-[var(--mp-text-secondary)]">
                <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors">
                  <Heart className="w-4 h-4" /><span className="text-[12px] font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors">
                  <MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SIGNALS */}
      {activeTab === "signals" && (
        <div className="flex flex-col gap-4">
          {SIGNALS.map((sig) => (
            <div key={sig.id} className="mp-glass-card rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">
                    {sig.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-foreground">{sig.asset}</div>
                    <div className="text-[var(--mp-text-secondary)] text-[11px]">{sig.user} · {sig.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={
                      sig.direction === "LONG"
                        ? { background: "linear-gradient(135deg, #00FF87, #00E5CC)", color: "#040D08" }
                        : { background: "linear-gradient(135deg, #FF3B3B, #C00)", color: "#fff" }
                    }
                  >
                    {sig.direction === "LONG" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {sig.direction}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Entry", value: sig.entry, icon: <Target className="w-3 h-3" /> },
                  { label: "Target", value: sig.target, icon: <TrendingUp className="w-3 h-3 text-[var(--mp-green)]" /> },
                  { label: "Stop", value: sig.stop, icon: <ShieldCheck className="w-3 h-3 text-[var(--mp-red)]" /> },
                ].map((row) => (
                  <div key={row.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[var(--mp-text-secondary)] mb-1">
                      {row.icon}
                      <span className="text-[9px] font-bold uppercase tracking-wider">{row.label}</span>
                    </div>
                    <div className="text-[13px] font-black text-foreground">{row.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[var(--mp-text-secondary)]">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-white/40">R/R</span>
                  <span className="font-black text-foreground">1:{sig.rr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Win Rate</span>
                  <div
                    className="px-2 py-0.5 rounded text-background text-[11px] font-black"
                    style={{ background: "linear-gradient(135deg, #00FF87, #00E5CC)" }}
                  >
                    {sig.success}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="flex flex-col gap-3">
          {LEADERBOARD.map((trader) => (
            <div key={trader.id} className="mp-glass-card rounded-[24px] p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                {trader.rank === 1 ? (
                  <Trophy className="w-5 h-5" style={{ color: "#FFD700" }} />
                ) : trader.rank === 2 ? (
                  <Trophy className="w-5 h-5" style={{ color: "#C0C0C0" }} />
                ) : trader.rank === 3 ? (
                  <Trophy className="w-5 h-5" style={{ color: "#CD7F32" }} />
                ) : (
                  <span className="text-[15px] font-black text-white/20">{trader.rank}</span>
                )}
              </div>

              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05] flex-shrink-0">
                {trader.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-foreground">{trader.name}</div>
                <div className="text-[var(--mp-text-secondary)] text-[11px] flex items-center gap-2">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{trader.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{trader.comments}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div
                  className="px-2.5 py-1 rounded-lg text-background text-[13px] font-black"
                  style={{ background: "linear-gradient(135deg, #00FF87, #00E5CC)" }}
                >
                  {trader.success}%
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--mp-text-secondary)]">Win Rate</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
