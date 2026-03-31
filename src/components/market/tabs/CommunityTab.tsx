import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Trophy, Target, Calendar, Clock, Globe } from "lucide-react";
import { COMMUNITY_POSTS } from "@/data/assets";
import { TranslationStrings } from "@/types";

/* ── HELPER COMPONENTS ── */

const PostCard = React.memo(function PostCard({ post, t, language }: { post: any; t: any; language: string }) {
  const [isTranslated, setIsTranslated] = React.useState(false);
  
  const originalText = post.text;
  const translatedText = language === "Turkish" 
    ? "Piyasa şu an çok güçlü görünüyor. Eğer 44k seviyesini kırarsak yükseliş hızlanacaktır." 
    : "Market looks very strong right now. If we break 44k, the rally will accelerate.";

  return (
    <div className="mp-glass-card rounded-[24px] p-5 relative overflow-hidden group">
      {isTranslated && (
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ 
               background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.05) 30%, rgba(224,255,247,0.18) 50%, rgba(0,255,135,0.05) 70%, transparent)",
               animation: "mp-shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)" 
             }} />
      )}
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">
            {post.avatar}
          </div>
          <div>
            <div className="font-bold text-[15px] text-foreground">{post.name}</div>
            <div className="text-[var(--mp-text-secondary)] text-[11px]">
              {post.user} · {post.time} · <span className="text-white/50 font-bold">{post.platform}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsTranslated(!isTranslated)}
          className={`p-2 rounded-xl transition-all duration-300 ${isTranslated ? 'bg-[var(--mp-cyan)]/10 text-[var(--mp-cyan)]' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}`}
        >
          <Globe className={`w-4 h-4 ${isTranslated ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      
      <p className="text-[14px] leading-relaxed mb-4 relative z-10" style={{ color: isTranslated ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.9)" }}>
        {isTranslated ? translatedText : originalText}
      </p>
      
      <div className="flex items-center gap-6 text-[var(--mp-text-secondary)] relative z-10">
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
  );
});

const IdeaCard = React.memo(function IdeaCard({ idea, t, language }: { idea: any; t: any; language: string }) {
  const [isTranslated, setIsTranslated] = React.useState(false);
  
  const originalText = "Analyzing the current price action, we see a clear breakout pattern forming on the daily chart.";
  const translatedText = language === "Turkish" 
    ? "Güncel fiyat hareketini analiz ettiğimizde, günlük grafikte net bir kırılım formasyonunun oluştuğunu görüyoruz." 
    : "Analyzing the current price action, we see a clear breakout pattern forming on the daily chart.";

  return (
    <div className="mp-glass-card rounded-[24px] p-5 relative overflow-hidden group">
      {isTranslated && (
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ 
               background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.05) 30%, rgba(224,255,247,0.18) 50%, rgba(0,255,135,0.05) 70%, transparent)",
               animation: "mp-shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)" 
             }} />
      )}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">
            {idea.avatar}
          </div>
          <div>
            <div className="font-bold text-[15px] text-foreground">{idea.name}</div>
            <div className="text-[var(--mp-text-secondary)] text-[11px]">{idea.user} · {idea.time}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsTranslated(!isTranslated)}
            className={`p-2 rounded-xl transition-all duration-300 ${isTranslated ? 'bg-[var(--mp-cyan)]/10 text-[var(--mp-cyan)]' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}`}
          >
            <Globe className={`w-3.5 h-3.5 ${isTranslated ? 'animate-pulse' : ''}`} />
          </button>
          <div className="flex flex-col items-end">
            <div className="text-[9px] text-[var(--mp-text-secondary)] font-bold tracking-wider uppercase mb-1">Asset</div>
            <div className="font-black text-[13px]">{idea.asset}</div>
          </div>
        </div>
      </div>

      <p className="text-[14px] leading-relaxed mb-4 relative z-10" style={{ color: isTranslated ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.9)" }}>
        {isTranslated ? translatedText : originalText}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
        {[
          { label: "Entry", value: idea.entry.toLocaleString(), icon: <Target className="w-3 h-3" /> },
          { label: "Target", value: idea.target.toLocaleString(), icon: <TrendingUp className="w-3 h-3" /> },
          { label: "Date", value: idea.targetDate, icon: <Calendar className="w-3 h-3" /> },
        ].map((row) => (
          <div key={row.label} className="bg-white/[0.04] rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[var(--mp-text-secondary)] mb-1">
              {row.icon}
              <span className="text-[9px] font-bold uppercase tracking-wider">{row.label}</span>
            </div>
            <div className="text-[12px] font-black text-foreground whitespace-nowrap">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/[0.05] relative z-10">
        <div
          className={`px-3 py-1 flex items-center gap-1 rounded-full text-[11px] font-black uppercase tracking-wider ${idea.direction === "LONG" ? "mp-positive-badge" : "mp-negative-badge"}`}
        >
          {idea.direction === "LONG" ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />}
          {idea.direction}
        </div>
        <div className="flex items-center gap-4 text-[var(--mp-text-secondary)]">
          <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors">
            <Heart className="w-4 h-4 fill-transparent" /><span className="text-[12px] font-bold">{idea.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors">
            <MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{idea.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const USER_IDEAS = [
  { id: 4, name: "Gökalp", user: "@Gokalp", avatar: "G", asset: "SOL/USD", direction: "LONG" as const, entry: 98, target: 130, targetDate: "20 Eyl 2026", time: "8h ago", success: 95, likes: 3042, comments: 40 },
  { id: 1, name: "Crypto King", user: "@CryptoKing", avatar: "CK", asset: "BTC/USD", direction: "LONG" as const, entry: 43200, target: 48000, targetDate: "15 Eki 2026", time: "2h ago", success: 88, likes: 2150, comments: 14 },
  { id: 2, name: "Gold Bug", user: "@GoldBug", avatar: "GB", asset: "GOLD", direction: "LONG" as const, entry: 2045, target: 2100, targetDate: "01 Kas 2026", time: "5h ago", success: 92, likes: 1420, comments: 27 },
  { id: 3, name: "Bear Hunter", user: "@BearHunter", avatar: "BH", asset: "NASDAQ", direction: "SHORT" as const, entry: 17800, target: 16500, targetDate: "15 Ara 2026", time: "6h ago", success: 74, likes: 890, comments: 4 },
];

const LEADERBOARD = [...COMMUNITY_POSTS]
  .sort((a, b) => b.success - a.success)
  .map((p, i) => ({ rank: i + 1, ...p }));

const TABS = [
  { key: "community", label: "Feed" },
  { key: "ideas",   label: "User Ideas" },
  { key: "profile", label: "Profile" },
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
  t, communityTab, setCommunityTab, language
}: CommunityTabProps) {
  const activeTab = TABS.find((tb) => tb.key === communityTab) ? communityTab : "community";
  const [platformFilter, setPlatformFilter] = React.useState("All");

  const filteredFeed = React.useMemo(
    () => platformFilter === "All" ? COMMUNITY_POSTS : COMMUNITY_POSTS.filter((p: any) => p.platform === platformFilter),
    [platformFilter]
  );

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
        <motion.div className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", "TradingView", "Investing", "MarketPulse"].map((pf) => (
              <button
                key={pf}
                onClick={() => setPlatformFilter(pf)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                  platformFilter === pf ? "bg-white/10 text-foreground" : "bg-white/[0.02] text-[var(--mp-text-secondary)] hover:bg-white/[0.05]"
                }`}
              >
                {pf}
              </button>
            ))}
          </div>
          {filteredFeed.map((post: any) => (
            <motion.div key={post.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
              }}
            >
              <PostCard post={post} t={t} language={language} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* USER IDEAS (Formerly Signals) */}
      {activeTab === "ideas" && (
        <motion.div className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {USER_IDEAS.map((idea) => (
            <motion.div key={idea.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
              }}
            >
              <IdeaCard idea={idea} t={t} language={language} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <motion.div className="flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {LEADERBOARD.map((trader) => (
            <motion.div key={trader.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
              }}
              className="mp-glass-card rounded-[24px] p-5 flex items-center gap-4"
            >
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
                <div className="px-3 py-1 mp-positive-badge text-foreground text-[14px] font-black border border-[#00FFFF]/20">
                  {trader.success}%
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--mp-text-secondary)]">Win Rate</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* COMMUNITY PROFILE */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-6 mb-4">
               <div className="w-20 h-20 rounded-full mp-positive-badge p-1 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center relative">
                    <span className="text-3xl font-black text-foreground">G</span>
                  </div>
               </div>
               <div className="flex flex-col">
                 <h3 className="text-2xl font-black mb-1">Gökalp</h3>
                 <p className="text-[13px] text-[var(--mp-text-secondary)] font-medium">@Gokalp</p>
               </div>
             </div>
             <div className="flex items-center gap-8 mb-5 mt-2 ml-2">
                <div className="flex flex-col items-start cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-base font-bold text-foreground">12</div>
                  <div className="text-[9px] text-[var(--mp-text-secondary)] uppercase tracking-wider font-semibold mt-0.5">Following</div>
                </div>
                <div className="flex flex-col items-start cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-base font-bold text-foreground">840</div>
                  <div className="text-[9px] text-[var(--mp-text-secondary)] uppercase tracking-wider font-semibold mt-0.5">Followers</div>
                </div>
                <div className="flex flex-col items-start cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-base font-bold text-foreground">4</div>
                  <div className="text-[9px] text-[var(--mp-text-secondary)] uppercase tracking-wider font-semibold mt-0.5">Ideas</div>
                </div>
             </div>
             <button className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors w-full sm:max-w-xs">
               Edit Profile
             </button>
          </div>
          
          <div className="flex border-b border-white/[0.05] mt-2 mb-4">
            <button className="flex-1 py-3 text-[12px] font-bold tracking-widest uppercase border-b-2 border-foreground text-foreground">
              My Ideas
            </button>
            <button className="flex-1 py-3 text-[12px] font-bold tracking-widest uppercase border-b-2 border-transparent text-[var(--mp-text-secondary)]">
              Likes
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {USER_IDEAS.filter((u) => u.user === "@Gokalp").map((idea) => (
              <div key={idea.id} className="mp-glass-card rounded-[24px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-[15px] text-foreground">{idea.asset}</div>
                  <div
                    className={`px-2.5 py-0.5 flex items-center gap-1 rounded-full text-[10px] font-black uppercase tracking-wider ${idea.direction === "LONG" ? "mp-positive-badge" : "mp-negative-badge"}`}
                  >
                    {idea.direction === "LONG" ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                    {idea.direction}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--mp-text-secondary)] mb-1">Target Price</div>
                    <div className="text-[14px] font-black text-foreground">${idea.target.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--mp-text-secondary)] mb-1">Valid Until</div>
                    <div className="text-[14px] font-black text-foreground">{idea.targetDate}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[var(--mp-text-secondary)] border-t border-white/[0.05] pt-4">
                  <div className="text-[11px]">{idea.time}</div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors">
                      <Heart className="w-4 h-4 fill-transparent" /><span className="text-[12px] font-bold">{idea.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors">
                      <MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{idea.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
