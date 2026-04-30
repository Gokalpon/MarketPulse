import React from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Share2, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ASSETS } from "@/data/assets";
import { supabase } from "@/lib/supabase";
import { fetchMarketInsights, MarketInsight } from "@/services/marketDataService";
import { TranslationStrings, UserComment } from "@/types";

type CommunityPost = {
  id: string;
  user: string;
  name: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  replies: number;
  platform: "MarketPulse" | "Reddit" | "TradingView" | "Investing" | "StockTwits" | "X" | "Web";
  asset?: string;
  sentiment?: "Positive" | "Negative" | "Neutral";
};

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
  userComments?: UserComment[];
  selectedAssetId: string;
  activeAssetName: string;
  livePrice: number;
  timeframe: string;
}

const TABS = [
  { key: "community", label: "Feed" },
  { key: "ideas", label: "User Ideas" },
  { key: "profile", label: "Profile" },
  { key: "leaderboard", label: "Leaderboard" },
];

const SOURCE_FILTERS = ["All", "Reddit", "TradingView", "Investing", "MarketPulse"];

const formatTime = (timestamp: number | string | undefined, language: string) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(date.getTime())) return language === "Turkish" ? "Simdi" : "Now";
  return date.toLocaleString(language === "Turkish" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeSource = (source?: string): CommunityPost["platform"] => {
  const raw = (source || "Web").toLowerCase();
  if (raw.includes("marketpulse")) return "MarketPulse";
  if (raw.includes("reddit")) return "Reddit";
  if (raw.includes("tradingview")) return "TradingView";
  if (raw.includes("investing")) return "Investing";
  if (raw.includes("stock")) return "StockTwits";
  if (raw === "x" || raw.includes("twitter")) return "X";
  return "Web";
};

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-white/45">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="text-[13px] font-black uppercase tracking-[0.16em] text-white/75">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-white/40">{body}</p>
    </div>
  );
}

const PostCard = React.memo(function PostCard({ post }: { post: CommunityPost }) {
  const sentimentClass = post.sentiment === "Positive"
    ? "mp-positive-badge"
    : post.sentiment === "Negative"
      ? "mp-negative-badge"
      : "bg-white/[0.06] text-white/55 border border-white/[0.06]";

  return (
    <div className="mp-glass-card glow-btn rounded-[24px] p-5 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05] shrink-0">
            {post.avatar}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[15px] text-foreground truncate">{post.name}</div>
            <div className="text-[var(--mp-text-secondary)] text-[11px] truncate">
              {post.user} · {post.time} · <span className="text-white/50 font-bold">{post.platform}</span>
            </div>
          </div>
        </div>
        {post.sentiment && (
          <div className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${sentimentClass}`}>
            {post.sentiment}
          </div>
        )}
      </div>

      {post.asset && (
        <div className="mb-3 inline-flex rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
          {post.asset}
        </div>
      )}

      <p className="text-[14px] leading-relaxed mb-4 relative z-10 text-white/90">{post.text}</p>

      <div className="flex items-center gap-6 text-[var(--mp-text-secondary)] relative z-10">
        <button className="flex items-center gap-1.5 hover:text-[var(--mp-green)] transition-colors">
          <Heart className="w-4 h-4" /><span className="text-[12px] font-bold">{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-[var(--mp-cyan)] transition-colors">
          <MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.replies}</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

function IdeaCard({ post }: { post: CommunityPost }) {
  const isShort = post.sentiment === "Negative";
  return (
    <div className="mp-glass-card glow-btn rounded-[24px] p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-foreground truncate">{post.asset || "Market"}</div>
          <div className="text-[var(--mp-text-secondary)] text-[11px]">{post.user} · {post.time}</div>
        </div>
        <div className={`px-3 py-1 flex items-center gap-1 rounded-full text-[11px] font-black uppercase tracking-wider ${isShort ? "mp-negative-badge" : "mp-positive-badge"}`}>
          {isShort ? <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} />}
          {isShort ? "SHORT" : "LONG"}
        </div>
      </div>
      <p className="text-[14px] leading-relaxed text-white/85">{post.text}</p>
    </div>
  );
}

export function CommunityTab({
  t,
  communityTab,
  setCommunityTab,
  language,
  userComments = [],
  selectedAssetId,
  activeAssetName,
  livePrice,
  timeframe,
}: CommunityTabProps) {
  const [platformFilter, setPlatformFilter] = React.useState("All");

  const { data: livePosts = [], isLoading } = useQuery({
    queryKey: ["community-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("[Community] Supabase fetch error:", error.message);
        return [];
      }

      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 60000,
  });

  const { data: externalInsight, isFetching: isLoadingExternal } = useQuery<MarketInsight | null>({
    queryKey: ["community-external-comments", selectedAssetId, timeframe],
    queryFn: () => fetchMarketInsights(selectedAssetId, activeAssetName, livePrice, 0, false, timeframe),
    enabled: Boolean(selectedAssetId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const localPosts = React.useMemo<CommunityPost[]>(() => userComments.map((comment) => {
    const asset = ASSETS.find((item) => item.id === comment.assetId);
    return {
      id: `local-${comment.id}`,
      user: "@You",
      name: "You",
      avatar: "Y",
      time: formatTime(comment.timestamp, language),
      text: comment.text,
      likes: comment.likes || 0,
      replies: 0,
      platform: "MarketPulse",
      asset: asset?.symbol || comment.assetId,
      sentiment: comment.sentiment,
    };
  }), [language, userComments]);

  const remotePosts = React.useMemo<CommunityPost[]>(() => {
    const supabasePosts = livePosts.map((post: any) => {
    const user = post.user_name || post.user || post.author || "Community";
    const source = normalizeSource(post.source);
    return {
      id: String(post.id || `${source}-${post.timestamp || post.created_at || Math.random()}`),
      user: user.startsWith("@") ? user : `@${user}`,
      name: String(user).replace(/^@/, "").slice(0, 16) || "Community",
      avatar: String(user).replace(/^@/, "").slice(0, 1).toUpperCase() || "C",
      time: formatTime(post.timestamp || post.created_at, language),
      text: post.text || post.body || post.comment || "",
      likes: Number(post.likes || post.score || 0),
      replies: Number(post.comments || post.replies || 0),
      platform: source,
      asset: post.asset || post.asset_id || post.symbol,
      sentiment: post.sentiment,
    };
    });

    const scrapedPosts = (externalInsight?.comments || []).map((comment) => ({
      id: `${comment.source || "Web"}-${comment.id || comment.timestamp}`,
      user: comment.user?.startsWith("@") ? comment.user : `@${comment.user || "Community"}`,
      name: (comment.user || comment.source || "Community").replace(/^@/, "").slice(0, 16),
      avatar: (comment.user || comment.source || "C").replace(/^@/, "").slice(0, 1).toUpperCase() || "C",
      time: formatTime(comment.timestamp, language),
      text: comment.text,
      likes: comment.likes || 0,
      replies: 0,
      platform: normalizeSource(comment.source),
      asset: selectedAssetId,
      sentiment: comment.sentiment,
    }));

    const seen = new Set<string>();
    return [...supabasePosts, ...scrapedPosts]
      .filter((post) => post.text.trim().length > 0)
      .filter((post) => {
        const key = `${post.platform}:${post.id}:${post.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [externalInsight?.comments, language, livePosts, selectedAssetId]);

  const feed = React.useMemo(() => {
    const posts = [...localPosts, ...remotePosts];
    return platformFilter === "All"
      ? posts
      : posts.filter((post) => post.platform === platformFilter);
  }, [localPosts, platformFilter, remotePosts]);

  const ideas = React.useMemo(
    () => localPosts.filter((post) => post.platform === "MarketPulse"),
    [localPosts]
  );

  const leaderboard = React.useMemo(() => {
    const grouped = localPosts.reduce<Record<string, { user: string; name: string; avatar: string; likes: number; replies: number; posts: number }>>((acc, post) => {
      acc[post.user] = acc[post.user] || { user: post.user, name: post.name, avatar: post.avatar, likes: 0, replies: 0, posts: 0 };
      acc[post.user].likes += post.likes;
      acc[post.user].replies += post.replies;
      acc[post.user].posts += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.posts - a.posts || b.likes - a.likes)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [localPosts]);

  const activeTab = TABS.find((tab) => tab.key === communityTab) ? communityTab : "community";

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-12 pb-24"
    >
      <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>

      <div className="flex gap-5 mb-6 border-b border-white/[0.05] pb-2 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCommunityTab(tab.key)}
            className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative transition-colors whitespace-nowrap ${
              activeTab === tab.key ? "text-foreground" : "text-[var(--mp-text-secondary)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 rounded-full bg-[linear-gradient(90deg,#00FF87,#00E5CC)]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "community" && (
        <motion.div className="flex flex-col gap-4" initial="hidden" animate="visible">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SOURCE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setPlatformFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                  platformFilter === filter ? "bg-white/10 text-foreground" : "bg-white/[0.02] text-[var(--mp-text-secondary)] hover:bg-white/[0.05]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {feed.map((post) => (
            <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <PostCard post={post} />
            </motion.div>
          ))}

          {(isLoading || isLoadingExternal) && feed.length === 0 && (
            <EmptyState
              title={language === "Turkish" ? "Gercek yorumlar cekiliyor" : "Pulling real comments"}
              body={language === "Turkish" ? "Reddit, TradingView ve Investing kaynaklari taraniyor." : "Scanning Reddit, TradingView, and Investing sources."}
            />
          )}

          {!isLoading && !isLoadingExternal && feed.length === 0 && (
            <EmptyState
              title={language === "Turkish" ? "Gercek yorum yok" : "No real comments"}
              body={language === "Turkish" ? "Supabase veya MarketPulse yorumlari geldikce burada gorunecek." : "Supabase or MarketPulse comments will appear here."}
            />
          )}
        </motion.div>
      )}

      {activeTab === "ideas" && (
        <motion.div className="flex flex-col gap-4" initial="hidden" animate="visible">
          {ideas.map((post) => (
            <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <IdeaCard post={post} />
            </motion.div>
          ))}
          {ideas.length === 0 && (
            <EmptyState
              title={language === "Turkish" ? "Fikir yok" : "No ideas yet"}
              body={language === "Turkish" ? "Ilk gercek fikri grafikten yorum ekleyerek olustur." : "Create the first real idea by adding a chart comment."}
            />
          )}
        </motion.div>
      )}

      {activeTab === "leaderboard" && (
        <motion.div className="flex flex-col gap-3" initial="hidden" animate="visible">
          {leaderboard.map((trader) => (
            <motion.div
              key={trader.user}
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              className="mp-glass-card rounded-[24px] p-5 flex items-center gap-4"
            >
              <div className="flex items-center justify-center w-8 shrink-0">
                {trader.rank <= 3 ? <Trophy className="w-5 h-5 text-white/55" /> : <span className="text-[15px] font-black text-white/20">{trader.rank}</span>}
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05] shrink-0">
                {trader.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-foreground">{trader.name}</div>
                <div className="text-[var(--mp-text-secondary)] text-[11px] flex items-center gap-2">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{trader.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{trader.replies}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="px-3 py-1 mp-positive-badge text-foreground text-[14px] font-black border border-[#00FFFF]/20">
                  {trader.posts}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--mp-text-secondary)]">Posts</div>
              </div>
            </motion.div>
          ))}
          {leaderboard.length === 0 && (
            <EmptyState
              title={language === "Turkish" ? "Leaderboard bos" : "Leaderboard empty"}
              body={language === "Turkish" ? "Sahte kullanicilar kaldirildi. Siralama gercek kullanici yorumlariyla dolacak." : "Fake users are removed. Rankings will fill from real user comments."}
            />
          )}
        </motion.div>
      )}

      {activeTab === "profile" && (
        <div className="flex flex-col gap-6">
          <EmptyState
            title={language === "Turkish" ? "Profil verisi yok" : "No profile data"}
            body={language === "Turkish" ? "Gercek hesap sistemi baglaninca burada profil gorunecek." : "Real profile data will appear after account integration."}
          />
          {ideas.length > 0 && (
            <div className="flex flex-col gap-4">
              {ideas.map((post) => <IdeaCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
