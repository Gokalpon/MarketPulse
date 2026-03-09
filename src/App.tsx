import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Search, 
  Globe, 
  Users, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  ChevronDown,
  MessageCircle, 
  X, 
  Plus,
  Brain,
  User,
  Bell,
  Shield,
  LogOut,
  Home,
  List,
  Heart,
  Share2,
  Newspaper,
  Send,
  Edit3,
  Trash2
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { 
  THEME, 
  APP_ASSETS, 
  ASSETS, 
  MOCK_TRANSLATIONS, 
  COMMUNITY_POSTS 
} from "./data";
import { TRANSLATIONS } from "./translations";

let aiClient: GoogleGenAI | null = null;
const getAIClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

/* ── COMPONENTS ── */

const NotifToggle = ({ label, desc, defaultOn }: { label: string, desc: string, defaultOn: boolean }) => {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center justify-between">
      <div className="flex-1 mr-4">
        <div className="font-bold text-[14px] text-white/90">{label}</div>
        <div className="text-[10px] text-[#7A7B8D] mt-0.5">{desc}</div>
      </div>
      <div onClick={() => setIsOn(!isOn)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex-shrink-0 ${isOn ? 'bg-[#39FF14]' : 'bg-white/10'}`}>
        <motion.div animate={{ x: isOn ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 60,
    y: 20 - ((v - min) / range) * 20
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width="60" height="20" className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isExitingSplash, setIsExitingSplash] = useState(false);
  const [isSplashPressed, setIsSplashPressed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState("BTC");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [detailedPoint, setDetailedPoint] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.English;

  const [communityTab, setCommunityTab] = useState("community");
  const [profilePage, setProfilePage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    try { return localStorage.getItem('profilePicture'); } catch { return null; }
  });

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfilePicture(url);
    // Also save as data URL for persistence
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfilePicture(result);
      localStorage.setItem('profilePicture', result);
    };
    reader.readAsDataURL(file);
  };
  const [trendingExpanded, setTrendingExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [trendingTimeframe, setTrendingTimeframe] = useState("Daily");
  const [commentsTimeframe, setCommentsTimeframe] = useState("Daily");
  
  // Persistence for Watchlist
  const [watchlistAssets, setWatchlistAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchlistAssets');
    return saved ? JSON.parse(saved) : ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"];
  });

  // Persistence for Pinned Assets
  const [pinnedAssets, setPinnedAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinnedAssets');
    return saved ? JSON.parse(saved) : ["BTC", "AAPL", "GOLD"];
  });

  const [isEditPinned, setIsEditPinned] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [watchlistLayout, setWatchlistLayout] = useState<"list" | "grid">("list");
  const [showNewsBubbles, setShowNewsBubbles] = useState(true);
  const [showAIConsensus, setShowAIConsensus] = useState(true);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // ── USER COMMENT SYSTEM ──
  const [userComments, setUserComments] = useState<any[]>(() => {
    try { const s = localStorage.getItem('userComments'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentChartIdx, setCommentChartIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSentiment, setCommentSentiment] = useState("Neutral");
  const [chartCrosshair, setChartCrosshair] = useState<{idx: number, price: number, x: number, y: number} | null>(null);
  const [showMyComments, setShowMyComments] = useState(false);
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const voteComment = (commentKey: string, direction: 'up' | 'down') => {
    setCommentVotes(prev => ({
      ...prev,
      [commentKey]: prev[commentKey] === direction ? null : direction
    }));
  };

  useEffect(() => {
    localStorage.setItem('userComments', JSON.stringify(userComments));
  }, [userComments]);

  const handleChartTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // If crosshair is visible, close it
    if (chartCrosshair) {
      setChartCrosshair(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const idx = Math.round(((xPct - 4) / 92) * (activeData.length - 1));
    const clampedIdx = Math.max(0, Math.min(activeData.length - 1, idx));
    const price = activeData[clampedIdx];
    setChartCrosshair({ idx: clampedIdx, price, x: getX(clampedIdx), y: getY(price) });
    setSelectedPoint(null);
  };

  const openCommentSheet = () => {
    if (!chartCrosshair) return;
    setCommentChartIdx(chartCrosshair.idx);
    setCommentText("");
    setCommentSentiment("Neutral");
    setShowCommentSheet(true);
  };

  const submitComment = () => {
    if (!commentText.trim() || commentChartIdx === null) return;
    const newComment = {
      id: Date.now().toString(),
      assetId: selectedAssetId,
      timeframe,
      chartIndex: commentChartIdx,
      price: activeData[commentChartIdx],
      text: commentText.trim(),
      sentiment: commentSentiment,
      timestamp: new Date().toISOString(),
      user: "@You",
      likes: 0,
    };
    setUserComments(prev => [newComment, ...prev]);
    setCommentText("");
    setShowCommentSheet(false);
    setChartCrosshair(null);
  };

  const deleteComment = (id: string) => {
    setUserComments(prev => prev.filter(c => c.id !== id));
  };

  const activeUserComments = useMemo(() => 
    userComments.filter(c => c.assetId === selectedAssetId && c.timeframe === timeframe),
    [userComments, selectedAssetId, timeframe]
  );

  const allAssetUserComments = useMemo(() => 
    userComments.filter(c => c.assetId === selectedAssetId),
    [userComments, selectedAssetId]
  );

  // Sync watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('watchlistAssets', JSON.stringify(watchlistAssets));
  }, [watchlistAssets]);

  useEffect(() => {
    localStorage.setItem('pinnedAssets', JSON.stringify(pinnedAssets));
  }, [pinnedAssets]);

  const activeAsset = useMemo(() => ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0], [selectedAssetId]);
  
  // Reset AI analysis when asset changes
  useEffect(() => {
    setAiAnalysis(null);
    setChartCrosshair(null);
  }, [selectedAssetId]);

  // Clear crosshair on timeframe change
  useEffect(() => {
    setChartCrosshair(null);
  }, [timeframe]);

  const activeData = useMemo(() => activeAsset.data[timeframe as keyof typeof activeAsset.data] || activeAsset.data["1D"], [activeAsset, timeframe]);
  const activeTranslations = MOCK_TRANSLATIONS[selectedAssetId as keyof typeof MOCK_TRANSLATIONS] || [];

  // Chart dimensions using 0-100 percentage scale for perfect HTML overlay alignment
  const minVal = Math.min(...activeData) * 0.995;
  const maxVal = Math.max(...activeData) * 1.005;
  const range = maxVal - minVal;

  const getX = (i: number) => 4 + (i / (activeData.length - 1)) * 92;
  const getY = (v: number) => 8 + (100 - ((v - minVal) / range) * 100) * 0.84;

  const pathD = activeData.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d)}`).join(" ");
  const areaD = `${pathD} L ${getX(activeData.length - 1)} 100 L ${getX(0)} 100 Z`;

  const handlePointClick = (point: any) => {
    if (selectedPoint?.idx === point.idx) {
      setDetailedPoint(point);
    } else {
      setSelectedPoint(point);
      setSentimentFilter("All");
    }
  };

  const handleSplashClick = () => {
    setIsSplashPressed(true);
    setTimeout(() => {
      setIsExitingSplash(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 700);
    }, 1200);
  };

  // --- SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div className={`fixed inset-0 z-[400] bg-[#030508] flex flex-col items-center transition-all duration-700 ${isExitingSplash ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
        
        {/* Background Layers */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url(${APP_ASSETS.splashBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Logo and Text (Centered iOS Layout) */}
        <div 
          className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-[430px] cursor-pointer px-8 pt-10"
          onClick={handleSplashClick}
        >
          {/* Branding Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={isSplashPressed ? { opacity: 0, scale: 0.9 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[#00FFFF]/8 blur-[30px] rounded-full" />
                <img 
                  src={APP_ASSETS.splashLogo} 
                  alt="Market Pulse Logo" 
                  className="w-64 h-64 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]" 
                  
                />
              </motion.div>
            </div>
            <div className="flex flex-col items-center mt-[-20px] relative z-20 w-full max-w-[240px]">
              <h1 className="text-[32px] tracking-tighter text-white flex items-center justify-center gap-2 w-full">
                <span className="font-thin text-white/90">{t.market}</span>
                <span className="font-bold text-white">{t.pulse}</span>
              </h1>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.32em] mt-1 text-center w-full">
                {t.slogan}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Indicator Hint (iOS Style) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }}
          className="absolute bottom-12 text-white/30 text-[10px] uppercase tracking-widest font-bold"
        >
          Tap to start
        </motion.div>
      </div>
    );
  }

  // --- ONBOARDING / LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#030508] overflow-hidden">
        {/* Fixed Background Layer with Animated Image */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 opacity-40 blur-[1px]"
            style={{ 
              backgroundImage: `url(${APP_ASSETS.splashBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
        </div>

        <div className="relative z-10 h-[100dvh] flex flex-col items-center justify-between px-6 pt-10 pb-10 w-full max-w-[430px] mx-auto overflow-hidden">
          {/* Top Branding Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#00FFFF]/10 blur-[40px] rounded-full"
                />
                <img 
                  src={APP_ASSETS.splashLogo} 
                  alt="Market Pulse Logo" 
                  className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                  
                />
              </motion.div>
            </div>
            <div className="flex flex-col items-center mt-[-15px] relative z-20 w-full">
              <h1 className="text-[28px] tracking-tighter text-white flex items-center justify-center gap-2 w-full">
                <span className="font-thin text-white/90">{t.market}</span>
                <span className="font-bold text-white">{t.pulse}</span>
              </h1>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.32em] mt-0.5 text-center w-full whitespace-nowrap">
                {t.slogan}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-[340px]">
            <AnimatePresence mode="wait">
              {onboardingStep === 0 ? (
                <motion.div 
                  key="step0"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center w-full flex flex-col items-center"
                >
                  <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-6 mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative z-10">
                      <h2 className="text-[18px] font-black text-white mb-1 leading-none tracking-tighter uppercase">
                        {t.welcome}
                      </h2>
                      <h3 className="text-[24px] font-black leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#00FFFF] via-[#39FF14] to-[#00FFFF] bg-[length:200%_auto] animate-gradient-x">
                        {t.future}
                      </h3>
                      <p className="text-white/40 text-[12px] leading-relaxed font-medium">
                        {t.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 w-full">
                    <motion.button 
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOnboardingStep(1)}
                      className="w-full bg-white text-black font-black py-4 rounded-[20px] text-[13px] uppercase tracking-[0.3em] transition-all relative overflow-hidden group"
                    >
                      <span className="relative z-10">{t.getStarted}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-6 mb-3 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-[15px] font-black text-white mb-4 text-center uppercase tracking-[0.3em]">{t.joinCommunity}</h2>
                    
                    <div className="space-y-2">
                      <motion.button 
                        whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-4 px-4 py-2.5 rounded-[16px] transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                        </div>
                        <span className="font-bold text-[13px] text-white/80 group-hover:text-white transition-colors">{t.continueGoogle}</span>
                      </motion.button>

                      <motion.button 
                        whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-4 px-4 py-2.5 rounded-[16px] transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                          <svg className="w-4 h-4 fill-black" viewBox="0 0 384 512">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                          </svg>
                        </div>
                        <span className="font-bold text-[13px] text-white/80 group-hover:text-white transition-colors">{t.continueApple}</span>
                      </motion.button>

                      <div className="flex items-center gap-4 py-1">
                        <div className="h-[1px] flex-1 bg-white/[0.05]" />
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">or</span>
                        <div className="h-[1px] flex-1 bg-white/[0.05]" />
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full bg-white text-black font-black py-3 rounded-[16px] text-[12px] uppercase tracking-widest shadow-2xl"
                      >
                        {t.emailLogin}
                      </motion.button>
                      
                      <button 
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full text-[9px] font-black text-white/30 uppercase tracking-[0.4em] hover:text-white/60 transition-colors mt-2"
                      >
                        {t.skip}
                      </button>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ opacity: 1, letterSpacing: "0.5em" }}
                    onClick={() => setOnboardingStep(0)}
                    className="w-full text-white/20 text-[11px] font-black uppercase tracking-[0.4em] transition-all py-4"
                  >
                    {t.back}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Premium Language Selector */}
          <div className="relative z-[50]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageMenu(!showLanguageMenu);
              }}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-2xl backdrop-blur-xl transition-all hover:bg-white/[0.06]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{language}</span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLanguageMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }}
                    className="fixed inset-0 z-[51]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[280px] bg-[#0D0E14]/98 border border-white/[0.1] rounded-2xl p-3 backdrop-blur-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.8)] z-[52] grid grid-cols-2 gap-1.5"
                  >
                    {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLanguage(lang);
                          setShowLanguageMenu(false);
                        }}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-center ${
                          language === lang 
                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = getAIClient();
      if (!ai) {
        setAiAnalysis(language === "Turkish" ? "Yapay zeka analizi şu an kullanılamıyor. Lütfen Vercel üzerinden API anahtarını ekleyin." : "AI Analysis is currently unavailable. Please configure the API key in Vercel.");
        setIsAnalyzing(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the current state of ${activeAsset.name} (${activeAsset.symbol}). 
        Current Price: $${activeAsset.price}. 
        24h Change: ${activeAsset.change}. 
        Give a 2-3 sentence summary of the market sentiment and a potential short-term outlook. 
        Keep it professional and concise.`,
      });
      setAiAnalysis(response.text || "Analysis unavailable.");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Failed to generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030508] flex justify-center overflow-x-hidden">
      {/* Mobile Frame Container */}
      <div 
        className="w-full max-w-[430px] min-h-screen text-white font-sans selection:bg-[#00FFFF]/30 relative shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in fade-in duration-700 overflow-x-hidden"
      >
        {/* Global Background Image */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            backgroundImage: `url(${APP_ASSETS.mainBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Header */}
        <header className="absolute top-0 inset-x-0 z-[100] px-6 pt-12 pb-4 bg-black/15 backdrop-blur-[40px] border-b border-white/[0.03]">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsMenuOpen(true)}
          >
            <div className="flex items-center gap-3">
              <img 
                src={APP_ASSETS.headerLogo} 
                alt="Logo" 
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
               
              />
              <div className="flex flex-col justify-center h-10">
                <div className="flex items-baseline gap-1.5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] transition-all">
                  <span className="text-[20px] font-thin text-white/90 tracking-tighter leading-none">{t.market}</span>
                  <span className="text-[20px] font-bold text-white tracking-tighter leading-none">{t.pulse}</span>
                </div>
                <span className="text-[7.5px] font-medium text-white/40 tracking-[0.25em] uppercase mt-1.5 leading-none">{t.slogan}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-full border border-white/[0.05] flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setIsSearchActive(!isSearchActive)}
            >
              <Search className="w-4 h-4 text-white/80" strokeWidth={2} />
            </div>
          </div>
        </div>
      </header>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isSearchActive && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchActive(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[110px] inset-x-0 px-6 py-6 z-[145] bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl"
            >
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7B8D]" />
                <input 
                  type="text" 
                  placeholder="Search assets, profiles..." 
                  className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-base text-white focus:outline-none focus:border-[#00FFFF]/50 transition-colors shadow-inner"
                  autoFocus
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Menu (Drawer) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-[150]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="absolute top-0 left-0 bottom-0 w-[300px] bg-black/80 backdrop-blur-xl border-r border-white/[0.05] z-[160] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 mt-6">
                <div className="flex items-center gap-2">
                  <img 
                    src={APP_ASSETS.tabLogo} 
                    alt="Market Pulse" 
                    className="w-7 h-7 object-contain"
                   
                  />
                  <h2 className="text-xl font-black tracking-tight uppercase">Menu</h2>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              <div className="flex items-center justify-between px-2 mt-4 mb-2">
                <div className="text-[10px] font-bold text-[#7A7B8D] uppercase tracking-widest">Pinned Assets</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditPinned(!isEditPinned); }}
                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${isEditPinned ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10'}`}
                >
                  {isEditPinned ? "Done" : "Edit"}
                </button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                {isEditPinned ? (
                  <>
                    {/* Currently Pinned Section */}
                    <div className="px-2 mb-2 mt-2">
                      <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-3">{t.currentlyPinned}</div>
                      <div className="flex flex-col gap-2">
                        {ASSETS.filter(a => pinnedAssets.includes(a.id)).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.03]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                                {asset.id[0]}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-[14px]">{asset.id}</div>
                                <div className="text-[10px] text-[#7A7B8D]">{asset.name}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => setPinnedAssets(pinnedAssets.filter(id => id !== asset.id))}
                              className="w-6 h-6 rounded-full flex items-center justify-center bg-[#E50000] text-black shadow-sm hover:scale-110 transition-transform"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                        {pinnedAssets.length === 0 && (
                          <div className="text-[10px] text-white/30 italic px-4 py-2">{t.noAssetsPinned}</div>
                        )}
                      </div>
                    </div>

                    {/* Search Section */}
                    <div className="px-2 mb-4 mt-6">
                      <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-3">{t.addMoreAssets}</div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <input 
                          type="text" 
                          placeholder={t.searchToAdd}
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[12px] focus:outline-none focus:border-[#00FFFF]/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    <div className="flex flex-col gap-2">
                      {menuSearch.length > 0 ? (
                        ASSETS.filter(asset => 
                          !pinnedAssets.includes(asset.id) && (
                            asset.id.toLowerCase().includes(menuSearch.toLowerCase()) || 
                            asset.name.toLowerCase().includes(menuSearch.toLowerCase())
                          )
                        ).slice(0, 10).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                                {asset.id[0]}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-[14px]">{asset.id}</div>
                                <div className="text-[10px] text-[#7A7B8D]">{asset.name}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setPinnedAssets([...pinnedAssets, asset.id]);
                                setMenuSearch("");
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00FFFF] to-[#39FF14] text-black shadow-sm hover:scale-110 transition-transform"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>
                          </div>
                        ))
                      ) : (
                        menuSearch.length === 0 && (
                          <div className="text-[10px] text-white/20 px-4 py-2">Type to search for assets...</div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  ASSETS.filter(a => pinnedAssets.includes(a.id)).map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => { setSelectedAssetId(asset.id); setIsMenuOpen(false); setActiveTab("dashboard"); }}
                      className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                        selectedAssetId === asset.id ? "bg-white/10 border border-white/[0.05]" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                          {asset.id[0]}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[14px]">{asset.id}</div>
                          <div className="text-[10px] text-[#7A7B8D]">{asset.name}</div>
                        </div>
                      </div>
                      <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-20 pt-[110px] pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {/* Main Chart Card */}
              <div className="px-4 mt-2">
                <div className="bg-black/20 backdrop-blur-xl rounded-[32px] p-6 relative overflow-hidden border border-white/[0.04] shadow-lg">
                  {/* Header inside card */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[#7A7B8D] text-[11px] font-semibold tracking-[0.15em] mb-1.5">{activeAsset.symbol}</div>
                      <div className="text-white text-[38px] font-bold tracking-tight leading-none mb-4">
                        ${activeAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] ${
                          activeAsset.change.startsWith('+') ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : 
                          activeAsset.change.startsWith('-') ? "bg-[#E50000] text-black" : "bg-white/10 text-white"
                        }`}>
                          {activeAsset.change.startsWith('+') ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
                          {activeAsset.change}
                        </div>
                        <div className="text-[#7A7B8D] text-[10px] font-bold tracking-[0.15em] uppercase">{t.liveMarket}</div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setIsMenuOpen(true)}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div 
                    className="mt-8 relative h-[240px] w-full"
                    onClick={(e) => { handleChartTap(e); }}
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#39FF14" />
                          <stop offset="100%" stopColor="#00FFFF" />
                        </linearGradient>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      <path d={areaD} fill="url(#areaGrad)" />
                      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Crosshair vertical line */}
                      {chartCrosshair && (
                        <line x1={chartCrosshair.x} y1="0" x2={chartCrosshair.x} y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" opacity="0.3" />
                      )}
                    </svg>

                    {/* Crosshair Price Marker + Add Comment */}
                    {chartCrosshair && (
                      <div className="absolute z-40" style={{ left: `${chartCrosshair.x}%`, top: `${chartCrosshair.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                        <motion.div 
                          initial={{ opacity: 0, y: 5, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-2"
                        >
                          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-1.5">
                            <div className="text-[14px] font-bold text-white">${chartCrosshair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openCommentSheet(); }}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.3)] active:scale-95 transition-transform"
                          >
                            <Edit3 className="w-3 h-3" strokeWidth={3} />
                            {language === "Turkish" ? "Yorum Yaz" : "Add Comment"}
                          </button>
                        </motion.div>
                      </div>
                    )}

                    {/* HTML Overlay for Perfect Circles */}
                    {(showNewsBubbles || showAIConsensus) && activeTranslations
                      .map((point: any) => {
                      const isSelected = selectedPoint?.idx === point.idx;
                      const xPercent = getX(point.idx);
                      const yPercent = getY(activeData[point.idx]);
                      const isNews = point.type === "news";

                      // Filter based on toggle states
                      if (isNews && !showNewsBubbles) return null;
                      if (!isNews && !showAIConsensus) return null;

                      return (
                        <div 
                          key={point.idx} 
                          className={`absolute flex flex-col items-center justify-center ${isSelected ? 'z-30' : 'z-20'}`}
                          style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div 
                            className="p-4 -m-4 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handlePointClick(point); }}
                          >
                              <div 
                                className={`rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${
                                  isSelected 
                                    ? `w-28 h-28 flex-shrink-0 ${isNews ? 'bg-gradient-to-br from-[#00FFFF] to-[#39FF14] shadow-[0_10px_30px_rgba(0,255,255,0.4)]' : 'bg-white shadow-[0_10px_30px_rgba(255,255,255,0.3)]'}` 
                                    : `w-3 h-3 flex-shrink-0 hover:scale-150 border border-white/20 ${isNews ? 'bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`
                                }`} 
                              >
                              {isSelected && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="p-3 text-center flex flex-col items-center justify-center h-full w-full relative"
                                >
                                  <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${
                                    isNews ? "text-[#050507] opacity-70" : 
                                    (point.sentiment === "Positive" ? "text-[#00C805]" : 
                                    point.sentiment === "Negative" ? "text-[#E50000]" : "text-[#0088FF]")
                                  }`}>
                                    {isNews ? t.newsAlert : point.sentiment}
                                  </div>
                                  <div className={`text-[11px] font-bold leading-snug line-clamp-3 ${isNews ? 'text-[#050507]' : 'text-[#0A0C0E]'}`}>
                                    {point.translation}
                                  </div>
                                  <div className={`absolute bottom-2 ${isNews ? 'text-[#050507]/50' : 'text-black/30'}`}>
                                    <ChevronRight className="w-3 h-3 rotate-90" strokeWidth={3} />
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* User Comment Markers */}
                    {activeUserComments.map((uc) => {
                      const xPct = getX(uc.chartIndex);
                      const yPct = getY(activeData[uc.chartIndex] || uc.price);
                      return (
                        <div 
                          key={uc.id}
                          className="absolute z-25"
                          style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div 
                            className="p-3 -m-3 cursor-pointer"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowMyComments(true); 
                            }}
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] shadow-[0_0_12px_rgba(178,75,243,0.6)]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Graph Controls (Minimal) */}
              <div className="px-6 mt-6 flex flex-col gap-4 w-full">
                <div className="flex items-center justify-between w-full">
                  {["1H", "1D", "1W", "1M", "1Y", "ALL"].map(tf => (
                    <button 
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`flex-1 mx-1 py-1.5 rounded-lg text-[12px] font-bold transition-all text-center ${
                        timeframe === tf ? "bg-white text-black" : "text-[#7A7B8D] hover:text-white bg-white/5"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setShowNewsBubbles(!showNewsBubbles)}
                    className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showNewsBubbles ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
                  >
                    {showNewsBubbles ? t.hideNews : t.showNews}
                  </button>
                  <button 
                    onClick={() => setShowAIConsensus(!showAIConsensus)}
                    className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${showAIConsensus ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
                  >
                    {showAIConsensus ? t.hideConsensus : t.showConsensus}
                  </button>
                  <button 
                    onClick={() => setShowMyComments(true)}
                    className={`flex-1 px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
                      activeUserComments.length > 0 
                        ? 'bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-black border-transparent shadow-[0_0_15px_rgba(178,75,243,0.3)]' 
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {language === "Turkish" ? `Yorumlarım (${allAssetUserComments.length})` : `My Comments (${allAssetUserComments.length})`}
                  </button>
                </div>

                {/* AI Analysis Section */}
                <div className="mt-4 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.aiMarketPulse}</span>
                    </div>
                    <button 
                      onClick={generateAIAnalysis}
                      disabled={isAnalyzing}
                      className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-white text-[9px] font-black uppercase tracking-wider hover:bg-black/50 transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? t.analyzing : t.refreshAnalysis}
                    </button>
                  </div>
                  
                  {aiAnalysis ? (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-white leading-relaxed italic"
                    >
                      "{aiAnalysis}"
                    </motion.p>
                  ) : (
                    <p className="text-[11px] text-white/30 italic">
                      {t.tapRefresh.replace('{asset}', activeAsset.name)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "watchlist" && (
            <motion.div 
              key="watchlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pt-12 pb-24"
            >
              <div className="flex items-center justify-between mb-8 mt-2">
                <h2 className="text-2xl font-black tracking-tight uppercase">{t.watchlist}</h2>
                <div className="flex bg-white/5 rounded-xl p-1">
                  <button 
                    onClick={() => setWatchlistLayout("list")}
                    className={`p-2 rounded-lg transition-colors ${watchlistLayout === "list" ? "bg-white/10 text-[#00FFFF]" : "text-[#7A7B8D]"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setWatchlistLayout("grid")}
                    className={`p-2 rounded-lg transition-colors ${watchlistLayout === "grid" ? "bg-white/10 text-[#00FFFF]" : "text-[#7A7B8D]"}`}
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {watchlistLayout === "list" ? (
                <div className="flex flex-col gap-3">
                  {ASSETS.filter(a => watchlistAssets.includes(a.id)).map((asset) => (
                    <div 
                      key={asset.id} 
                      onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                      className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/[0.05]">
                          {asset.id[0]}
                        </div>
                        <div>
                          <div className="font-bold text-[15px]">{asset.name}</div>
                          <div className="text-[11px] text-[#7A7B8D] font-medium uppercase tracking-wider">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                        <div className="text-right min-w-[70px]">
                          <div className="font-bold text-[15px]">${asset.price.toLocaleString()}</div>
                          <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${
                            asset.change.startsWith('+') ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : 
                            asset.change.startsWith('-') ? "bg-[#E50000] text-black" : "bg-white/10 text-white"
                          }`}>{asset.change}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {ASSETS.filter(a => watchlistAssets.includes(a.id)).map((asset) => (
                    <div 
                      key={asset.id} 
                      onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                      className="bg-black/20 border border-white/[0.03] rounded-[24px] p-5 flex flex-col hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/[0.05]">
                          {asset.id[0]}
                        </div>
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${asset.isUp ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : "bg-[#E50000] text-black"}`}>
                          {asset.change}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="font-bold text-[16px] leading-tight">{asset.name}</div>
                        <div className="text-[10px] text-[#7A7B8D] uppercase tracking-widest">{asset.symbol}</div>
                      </div>
                      <div className="mt-auto">
                        <div className="font-black text-[18px] mb-2">${asset.price.toLocaleString()}</div>
                        <div className="flex items-center justify-between">
                          <Sparkline data={asset.data["1D"].slice(-20)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                          <div className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                            asset.change.startsWith('+') ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : 
                            asset.change.startsWith('-') ? "bg-[#E50000] text-black" : "bg-white/10 text-white"
                          }`}>{asset.change}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "markets" && (
            <motion.div 
              key="markets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pt-12 pb-24"
            >
              <h2 className="text-2xl font-black tracking-tight uppercase mb-8 mt-2">{t.markets}</h2>
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7B8D]" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-11 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00FFFF]/50 transition-colors"
                />
              </div>

              {["Stocks", "Commodities", "Crypto"].map(category => {
                const categoryAssets = ASSETS.filter(a => a.category === category && (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase())));
                if (categoryAssets.length === 0) return null;
                
                const isExpanded = expandedCategory === category;
                const categoryLabel = category === "Stocks" ? t.stocks : category === "Commodities" ? t.commodities : t.crypto;

                return (
                  <div key={category} className="mb-4 bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-[13px] font-bold text-white uppercase tracking-widest">{categoryLabel}</h3>
                      <ChevronDown className={`w-5 h-5 text-[#7A7B8D] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex flex-col"
                        >
                          <div className="p-2">
                            {categoryAssets.map((asset) => (
                              <div 
                                key={asset.id}
                                className={`flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer rounded-xl group`}
                              >
                                <div 
                                  className="flex items-center gap-3 flex-1"
                                  onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs border border-white/[0.05]">
                                    {asset.id[0]}
                                  </div>
                                  <div>
                                    <div className="text-[14px] font-light text-white/90">{asset.name}</div>
                                    <div className="text-[10px] text-[#7A7B8D] font-medium uppercase tracking-wider">{asset.symbol}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (watchlistAssets.includes(asset.id)) {
                                        setWatchlistAssets(watchlistAssets.filter(id => id !== asset.id));
                                      } else {
                                        setWatchlistAssets([...watchlistAssets, asset.id]);
                                      }
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${watchlistAssets.includes(asset.id) ? "text-[#00FFFF]" : "text-white/20 hover:text-white/40"}`}
                                  >
                                    <Heart className={`w-4 h-4 ${watchlistAssets.includes(asset.id) ? "fill-[#00FFFF]" : ""}`} />
                                  </button>
                                  <div 
                                    className="text-right min-w-[70px]"
                                    onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                                  >
                                    <div className="font-bold text-[14px]">${asset.price.toLocaleString()}</div>
                                    <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${
                                      asset.change.startsWith('+') ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : 
                                      asset.change.startsWith('-') ? "bg-[#E50000] text-black" : "bg-white/10 text-white"
                                    }`}>{asset.change}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div 
              key="community"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pt-12 pb-24"
            >
              <h2 className="text-2xl font-black tracking-tight uppercase mb-6 mt-2">{t.community}</h2>
              
              <div className="flex gap-4 mb-6 border-b border-white/[0.05] pb-2">
                <button 
                  onClick={() => setCommunityTab("community")}
                  className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "community" ? "text-white" : "text-[#7A7B8D]"}`}
                >
                  {t.community}
                  {communityTab === "community" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#00FFFF]" />}
                </button>
                <button 
                  onClick={() => setCommunityTab("trending")}
                  className={`text-[13px] font-bold uppercase tracking-wider pb-2 relative ${communityTab === "trending" ? "text-white" : "text-[#7A7B8D]"}`}
                >
                  {t.trending}
                  {communityTab === "trending" && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#39FF14]" />}
                </button>
              </div>
              
              {communityTab === "community" ? (
                <div className="flex flex-col gap-4">
                  {COMMUNITY_POSTS.map(post => (
                    <div key={post.id} className="bg-black/20 border border-white/[0.03] rounded-[24px] p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/[0.05]">
                            {post.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-[15px] text-white">{post.name}</div>
                            <div className="text-[#7A7B8D] text-[11px]">{post.user} • {post.time}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-[9px] text-[#7A7B8D] font-bold tracking-wider uppercase mb-1">{t.winRate}</div>
                          <div className="flex items-center gap-1 bg-gradient-to-r from-[#00FFFF] to-[#39FF14] px-2 py-0.5 rounded text-black shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                            <span className="font-black text-[11px]">{post.success}%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[14px] text-white/90 leading-relaxed mb-4">{post.text}</p>
                      <div className="flex items-center gap-6 text-[#7A7B8D]">
                        <button className="flex items-center gap-1.5 hover:text-[#39FF14] transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-[12px] font-bold">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-[12px] font-bold">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setTrendingExpanded(!trendingExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-[11px] font-bold text-[#7A7B8D] uppercase tracking-widest">{t.trendingStocks}</h3>
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-tighter">{t.expandView}</div>
                        <ChevronDown className={`w-4 h-4 text-[#7A7B8D] transition-transform duration-300 ${trendingExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {trendingExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex flex-col gap-2 p-3"
                        >
                          <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                            {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map((tf) => (
                              <button 
                                key={tf}
                                onClick={() => setTrendingTimeframe(tf)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                  tf === trendingTimeframe ? "bg-[#00FFFF] text-black" : "bg-white/5 text-[#7A7B8D] hover:bg-white/10"
                                }`}
                              >
                                {tf === "Daily" ? t.daily : tf === "Weekly" ? t.weekly : tf === "Monthly" ? t.monthly : tf === "Yearly" ? t.yearly : t.allTime}
                              </button>
                            ))}
                          </div>
                          {ASSETS.slice(0, 8).map((asset, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/[0.08] transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <span className="text-[#7A7B8D] font-bold text-xs">#{i + 1}</span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm">{asset.name}</span>
                                  <span className="text-[9px] text-[#7A7B8D] font-medium">{asset.symbol}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Sparkline data={asset.data["1D"].slice(-15)} color={asset.isUp ? "#39FF14" : "#E50000"} />
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  asset.change.startsWith('+') ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : 
                                  asset.change.startsWith('-') ? "bg-[#E50000] text-black" : "bg-white/10 text-white"
                                }`}>{asset.change}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setCommentsExpanded(!commentsExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-[11px] font-bold text-[#7A7B8D] uppercase tracking-widest">{t.trendingComments}</h3>
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-tighter">{t.expandView}</div>
                        <ChevronDown className={`w-4 h-4 text-[#7A7B8D] transition-transform duration-300 ${commentsExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {commentsExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex flex-col gap-3 p-3"
                        >
                          <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
                            {["Daily", "Weekly", "Monthly", "Yearly", "All Time"].map((tf) => (
                              <button 
                                key={tf}
                                onClick={() => setCommentsTimeframe(tf)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                  tf === commentsTimeframe ? "bg-[#39FF14] text-black" : "bg-white/5 text-[#7A7B8D] hover:bg-white/10"
                                }`}
                              >
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
          )}

          {activeTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pt-10 pb-24"
            >
              <AnimatePresence mode="wait">
                {!profilePage ? (
                  <motion.div key="profile-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                    {/* Profile Header */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer" onClick={() => document.getElementById('profilePicInput')?.click()}>
                        <div className="w-20 h-20 rounded-[32px] bg-gradient-to-tr from-[#00FFFF] to-[#39FF14] p-0.5">
                          <div className="w-full h-full bg-[#0D0E12] rounded-[30px] flex items-center justify-center overflow-hidden">
                            {profilePicture ? (
                              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <img src={APP_ASSETS.tabLogo} alt="Profile" className="w-10 h-10 object-contain opacity-40 grayscale" />
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-[32px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">Gökalp</h2>
                        <p className="text-sm text-[#7A7B8D]">{t.proMember} • {t.since} 2024</p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[
                        { label: language === "Turkish" ? "Yorum" : "Comments", value: userComments.length, color: "from-[#B24BF3] to-[#5B7FFF]" },
                        { label: language === "Turkish" ? "İzleme" : "Watchlist", value: watchlistAssets.length, color: "from-[#00FFFF] to-[#39FF14]" },
                        { label: language === "Turkish" ? "Sabitlenen" : "Pinned", value: pinnedAssets.length, color: "from-[#39FF14] to-[#00FFFF]" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 text-center">
                          <div className={`text-[22px] font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                          <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* My Comments Quick Access */}
                    <div 
                      onClick={() => setProfilePage("comments")}
                      className="bg-gradient-to-r from-[#B24BF3]/10 to-[#5B7FFF]/10 border border-[#B24BF3]/20 rounded-[24px] p-5 mb-4 cursor-pointer hover:from-[#B24BF3]/15 hover:to-[#5B7FFF]/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center shadow-[0_0_15px_rgba(178,75,243,0.3)]">
                            <MessageCircle className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <span className="font-bold text-[15px] text-white">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</span>
                            <div className="text-[11px] text-[#7A7B8D]">{userComments.length} {language === "Turkish" ? "toplam yorum" : "total comments"}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#B24BF3]" />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-3">
                      <div className="bg-black/20 border border-white/[0.03] rounded-[24px] overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-white/[0.03]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#00FFFF]"><Globe className="w-4 h-4" /></div>
                            <div>
                              <div className="font-bold text-[14px] text-white/90">{t.autoTranslate}</div>
                              <div className="text-[10px] text-[#7A7B8D]">{t.translateComments}</div>
                            </div>
                          </div>
                          <div onClick={() => setAutoTranslate(!autoTranslate)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoTranslate ? 'bg-[#39FF14]' : 'bg-white/10'}`}>
                            <motion.div animate={{ x: autoTranslate ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#39FF14]"><MessageCircle className="w-4 h-4" /></div>
                            <div>
                              <div className="font-bold text-[14px] text-white/90">{t.language}</div>
                              <div className="text-[10px] text-[#7A7B8D]">{t.targetLanguage}</div>
                            </div>
                          </div>
                          <div className="relative z-[60]">
                            <button onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }} className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-xl">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">{language}</span>
                              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {showLanguageMenu && (
                                <>
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[61]" />
                                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 right-0 bg-[#0D0E14]/98 border border-white/[0.1] rounded-xl p-2.5 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-[62] grid grid-cols-2 gap-1.5">
                                    {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                                      <button key={lang} onClick={(e) => { e.stopPropagation(); setLanguage(lang); setShowLanguageMenu(false); }} className={`px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center ${language === lang ? "bg-white text-black" : "text-white/40 hover:bg-white/5"}`}>{lang}</button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {[
                        { icon: <User className="w-5 h-5" />, title: t.accountSettings, page: "account" },
                        { icon: <Bell className="w-5 h-5" />, title: t.notifications, page: "notifications" },
                        { icon: <Shield className="w-5 h-5" />, title: t.privacySecurity, page: "privacy" },
                        { icon: <LogOut className="w-5 h-5" />, title: t.logout, color: "bg-[#E50000] text-black", onClick: () => { setIsLoggedIn(false); setOnboardingStep(0); } },
                      ].map((item, i) => (
                        <div key={i} onClick={item.onClick || (() => item.page && setProfilePage(item.page))} className="bg-black/20 border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color || "bg-white/5 text-[#7A7B8D]"}`}>{item.icon}</div>
                            <span className={`font-bold text-[15px] ${item.color ? "text-[#E50000]" : "text-white/90"}`}>{item.title}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : profilePage === "comments" ? (
                  <motion.div key="profile-comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center"><MessageCircle className="w-5 h-5 text-black" /></div>
                      <div>
                        <h3 className="text-xl font-black uppercase">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</h3>
                        <p className="text-[11px] text-[#7A7B8D]">{userComments.length} {language === "Turkish" ? "toplam" : "total"}</p>
                      </div>
                    </div>
                    {userComments.length === 0 ? (
                      <div className="text-center py-16">
                        <MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                        <p className="text-[13px] text-[#7A7B8D]">{language === "Turkish" ? "Henüz yorum yazmadınız." : "No comments yet."}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userComments.map((uc: any) => (
                          <div key={uc.id} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-white">{ASSETS.find(a => a.id === uc.assetId)?.name || uc.assetId}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[#39FF14] text-black" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-white" : "bg-[#00FFFF] text-black"}`}>{uc.sentiment}</span>
                              </div>
                              <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[#7A7B8D]" /></button>
                            </div>
                            <p className="text-[14px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                            <div className="flex items-center gap-3 text-[10px] text-white/20">
                              <span>${uc.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              <span>{uc.timeframe}</span>
                              <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : profilePage === "account" ? (
                  <motion.div key="profile-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                    <h3 className="text-xl font-black uppercase mb-6">{t.accountSettings}</h3>
                    <div className="space-y-4">
                      {[
                        { label: language === "Turkish" ? "Kullanıcı Adı" : "Username", value: "Gökalp" },
                        { label: "Email", value: "gokalp@example.com" },
                        { label: language === "Turkish" ? "Üyelik" : "Membership", value: "Pro" },
                        { label: language === "Turkish" ? "Katılım Tarihi" : "Joined", value: "2024" },
                      ].map((field, i) => (
                        <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                          <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-1">{field.label}</div>
                          <div className="text-[15px] font-bold text-white">{field.value}</div>
                        </div>
                      ))}
                      <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">
                        {language === "Turkish" ? "Profili Düzenle" : "Edit Profile"}
                      </button>
                    </div>
                  </motion.div>
                ) : profilePage === "notifications" ? (
                  <motion.div key="profile-notif" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                    <h3 className="text-xl font-black uppercase mb-6">{t.notifications}</h3>
                    
                    {/* Notification Feed */}
                    <div className="space-y-2 mb-8">
                      {[
                        { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[#39FF14] text-black", user: "@CryptoKing", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "BTC", time: "2m" },
                        { icon: <MessageCircle className="w-4 h-4" />, color: "bg-[#00FFFF] text-black", user: "@WhaleWatch", action: language === "Turkish" ? "yorumuna yanıt verdi" : "replied to your comment", asset: "ETH", time: "15m" },
                        { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[#39FF14] text-black", user: "@GoldBug", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "GOLD", time: "1h" },
                        { icon: <Heart className="w-4 h-4" />, color: "bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-black", user: "@DayTrader", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "AAPL", time: "2h" },
                        { icon: <MessageCircle className="w-4 h-4" />, color: "bg-[#00FFFF] text-black", user: "@MacroEcon", action: language === "Turkish" ? "yorumuna yanıt verdi" : "replied to your comment", asset: "NASDAQ", time: "3h" },
                        { icon: <TrendingDown className="w-4 h-4" />, color: "bg-[#FF3131] text-white", user: "@BearHunter", action: language === "Turkish" ? "yorumunu beğenmedi" : "downvoted your comment", asset: "TSLA", time: "5h" },
                        { icon: <Newspaper className="w-4 h-4" />, color: "bg-white text-black", user: "Market Pulse", action: language === "Turkish" ? "BTC için önemli haber" : "Breaking news for BTC", asset: "BTC", time: "6h" },
                        { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[#39FF14] text-black", user: "@SwingTrader", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "SOL", time: "8h" },
                      ].map((notif, i) => (
                        <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>{notif.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-white/90 leading-snug">
                              <span className="font-bold">{notif.user}</span> {notif.action}
                            </div>
                            <div className="text-[10px] text-[#7A7B8D] mt-0.5">{notif.asset} • {notif.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notification Settings */}
                    <div className="text-[10px] font-black text-[#7A7B8D] uppercase tracking-widest mb-3">{language === "Turkish" ? "Bildirim Ayarları" : "Notification Settings"}</div>
                    <div className="space-y-3">
                      {[
                        { label: language === "Turkish" ? "Fiyat Uyarıları" : "Price Alerts", desc: language === "Turkish" ? "Fiyat hedefine ulaşıldığında" : "When price targets are hit", defaultOn: true },
                        { label: language === "Turkish" ? "Yorum Yanıtları" : "Comment Replies", desc: language === "Turkish" ? "Yorumlarına yanıt geldiğinde" : "When someone replies", defaultOn: true },
                        { label: language === "Turkish" ? "Beğeniler" : "Likes", desc: language === "Turkish" ? "Yorumların beğenildiğinde" : "When your comments are liked", defaultOn: true },
                        { label: language === "Turkish" ? "Piyasa Haberleri" : "Market News", desc: language === "Turkish" ? "Önemli piyasa haberleri" : "Important market news", defaultOn: false },
                      ].map((item, i) => (
                        <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />
                      ))}
                    </div>
                  </motion.div>
                ) : profilePage === "privacy" ? (
                  <motion.div key="profile-privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
                    <h3 className="text-xl font-black uppercase mb-6">{t.privacySecurity}</h3>
                    <div className="space-y-3">
                      {[
                        { label: language === "Turkish" ? "Profil Gizliliği" : "Profile Visibility", desc: language === "Turkish" ? "Profilini kimler görebilir" : "Who can see your profile", defaultOn: true },
                        { label: language === "Turkish" ? "Yorum Geçmişi" : "Comment History", desc: language === "Turkish" ? "Yorum geçmişini herkese göster" : "Show comment history publicly", defaultOn: false },
                        { label: language === "Turkish" ? "Konum Verisi" : "Location Data", desc: language === "Turkish" ? "Konum bilgisi paylaşımı" : "Share location with comments", defaultOn: false },
                        { label: language === "Turkish" ? "Analitik" : "Analytics", desc: language === "Turkish" ? "Kullanım verisi paylaşımı" : "Share usage data for improvements", defaultOn: true },
                      ].map((item, i) => (
                        <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />
                      ))}
                      <div className="mt-6 space-y-3">
                        <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">
                          {language === "Turkish" ? "Verileri Dışa Aktar" : "Export Data"}
                        </button>
                        <button className="w-full py-4 bg-[#E50000]/10 border border-[#E50000]/20 rounded-2xl text-[12px] font-black text-[#E50000] uppercase tracking-widest hover:bg-[#E50000]/20 transition-colors">
                          {language === "Turkish" ? "Hesabı Sil" : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── COMMENT WRITING SHEET ── */}
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
              className="absolute bottom-0 inset-x-0 z-[135] bg-[#0D0E14]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[36px] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]"
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
                  <div className="text-[11px] text-[#7A7B8D]">
                    {activeAsset.name}
                  </div>
                </div>
              </div>

              {/* Price display with manual edit */}
              <div className="mb-4 bg-white/5 border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
                <div className="text-[10px] font-bold text-[#7A7B8D] uppercase tracking-wider">{language === "Turkish" ? "Fiyat Noktası" : "Price Point"}</div>
                <input 
                  type="text"
                  value={commentChartIdx !== null ? `$${activeData[commentChartIdx]?.toFixed(2)}` : ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                    if (!isNaN(val)) {
                      // Find nearest data point to entered price
                      let nearestIdx = 0;
                      let nearestDist = Infinity;
                      activeData.forEach((d, i) => {
                        const dist = Math.abs(d - val);
                        if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
                      });
                      setCommentChartIdx(nearestIdx);
                    }
                  }}
                  className="bg-transparent text-right text-[16px] font-bold text-white w-[140px] focus:outline-none"
                  onPointerDownCapture={e => e.stopPropagation()}
                />
              </div>

              <div className="mb-4">
                <div className="text-[9px] font-black text-[#7A7B8D] uppercase tracking-widest mb-2">
                  {language === "Turkish" ? "Görüşün" : "Your View"}
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "Positive", label: language === "Turkish" ? "Yükseliş" : "Bullish", color: "bg-[#39FF14] text-black" },
                    { value: "Neutral", label: language === "Turkish" ? "Nötr" : "Neutral", color: "bg-[#00FFFF] text-black" },
                    { value: "Negative", label: language === "Turkish" ? "Düşüş" : "Bearish", color: "bg-[#FF3131] text-white" },
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
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={language === "Turkish" ? "Bu fiyat noktası hakkında ne düşünüyorsun?" : "What do you think about this price point?"}
                  className="w-full bg-white/5 border border-white/[0.08] rounded-2xl px-4 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40 resize-none h-[100px] transition-colors"
                  maxLength={280}
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

      {/* ── MY COMMENTS SHEET ── */}
      <AnimatePresence>
        {showMyComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMyComments(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[130]"
            />
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center shadow-[0_0_12px_rgba(178,75,243,0.3)]">
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-white uppercase tracking-wider">
                      {language === "Turkish" ? "Yorumlarım" : "My Comments"}
                    </div>
                    <div className="text-[11px] text-[#7A7B8D]">{activeAsset.name} • {allAssetUserComments.length} {language === "Turkish" ? "yorum" : "comments"}</div>
                  </div>
                </div>
                <button onClick={() => setShowMyComments(false)} className="p-2 bg-white/5 rounded-full">
                  <X className="w-4 h-4 text-white/40" />
                </button>
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
                          <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${
                            uc.sentiment === "Positive" ? "bg-[#39FF14] text-black" : 
                            uc.sentiment === "Negative" ? "bg-[#FF3131] text-white" : "bg-[#00FFFF] text-black"
                          }`}>{uc.sentiment}</span>
                          <span className="text-[10px] text-[#7A7B8D] font-bold">${uc.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          <span className="text-[10px] text-white/20">{uc.timeframe}</span>
                        </div>
                        <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-[#7A7B8D]" />
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

      {/* Translation Bottom Sheet */}
      <AnimatePresence>
        {detailedPoint && activeTab === "dashboard" && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailedPoint(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setDetailedPoint(null);
              }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 z-[120] bg-black/80 backdrop-blur-3xl border-t border-white/[0.05] rounded-t-[40px] p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-h-[75vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" />
              
              <div className="flex items-center gap-2 mb-4">
                {detailedPoint.type === "news" ? (
                  <>
                    <Globe className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-[11px] font-bold text-[#39FF14] tracking-widest uppercase">Market News & AI Analysis</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-[#00FFFF]" />
                    <span className="text-[11px] font-bold text-[#00FFFF] tracking-widest uppercase">AI Sentiment Summary</span>
                  </>
                )}
              </div>
              
              <div className="bg-white/5 border border-white/[0.05] rounded-2xl p-5 mb-8">
                <h3 className="text-[18px] font-bold leading-relaxed text-white tracking-tight">
                  "{detailedPoint.translation}"
                </h3>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-bold text-white/90">
                  {detailedPoint.comments?.length || 0} Comments
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                {["All", "Positive", "Neutral", "Negative"].map(f => {
                  let btnClass = "";
                  if (f === "Positive") {
                    btnClass = sentimentFilter === f 
                      ? "bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]" 
                      : "bg-white/5 text-[#7A7B8D] hover:bg-white/10 border border-white/[0.05]";
                  } else if (f === "Negative") {
                    btnClass = sentimentFilter === f 
                      ? "bg-[#FF3131] text-white shadow-[0_0_15px_rgba(255,49,49,0.3)]" 
                      : "bg-white/5 text-[#7A7B8D] hover:bg-white/10 border border-white/[0.05]";
                  } else if (f === "Neutral") {
                    btnClass = sentimentFilter === f 
                      ? "bg-[#00FFFF] text-black shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                      : "bg-white/5 text-[#7A7B8D] hover:bg-white/10 border border-white/[0.05]";
                  } else {
                    btnClass = sentimentFilter === f 
                      ? "bg-white text-black" 
                      : "bg-white/5 text-[#7A7B8D] hover:bg-white/10 border border-white/[0.05]";
                  }

                  return (
                    <button
                      key={f}
                      onClick={() => setSentimentFilter(f)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${btnClass}`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <div 
                className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3"
                onPointerDownCapture={e => e.stopPropagation()}
              >
                {detailedPoint.comments ? detailedPoint.comments
                  .filter((c: any) => sentimentFilter === "All" || c.sentiment === sentimentFilter)
                  .map((c: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/[0.03] rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-white/90">{c.user}</span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7A7B8D] font-bold">
                          <Heart className="w-3 h-3" /> {c.likes}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${
                        c.sentiment === "Positive" ? "bg-[#39FF14] text-black" : 
                        c.sentiment === "Negative" ? "bg-[#E50000] text-black" : "bg-white/10 text-white/70"
                      }`}>
                        {c.sentiment}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#7A7B8D] leading-relaxed">"{c.text}"</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => voteComment(`${detailedPoint?.idx}-${i}`, 'up')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            commentVotes[`${detailedPoint?.idx}-${i}`] === 'up' 
                              ? 'bg-[#39FF14]/20 text-[#39FF14]' 
                              : 'text-[#7A7B8D] hover:bg-white/5'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" strokeWidth={3} />
                          {c.likes + (commentVotes[`${detailedPoint?.idx}-${i}`] === 'up' ? 1 : 0)}
                        </button>
                        <button 
                          onClick={() => voteComment(`${detailedPoint?.idx}-${i}`, 'down')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            commentVotes[`${detailedPoint?.idx}-${i}`] === 'down' 
                              ? 'bg-[#FF3131]/20 text-[#FF3131]' 
                              : 'text-[#7A7B8D] hover:bg-white/5'
                          }`}
                        >
                          <TrendingDown className="w-3 h-3" strokeWidth={3} />
                        </button>
                      </div>
                      {autoTranslate && (
                        <div className="flex items-center gap-1.5 opacity-50">
                          <Globe className="w-3 h-3 text-white" />
                          <span className="text-[9px] font-medium text-white uppercase tracking-wider">Translated to {language}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-[#7A7B8D] py-8 text-sm">No comments available for this point.</div>
                )}
              </div>

              {/* Quick Comment Input */}
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={language === "Turkish" ? "Yorumunuzu yazın..." : "Write your comment..."}
                    className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#00FFFF]/40"
                    onPointerDownCapture={e => e.stopPropagation()}
                    maxLength={280}
                  />
                  <button 
                    onClick={() => {
                      if (!commentText.trim() || !detailedPoint) return;
                      const newComment = {
                        id: Date.now().toString(),
                        assetId: selectedAssetId,
                        timeframe,
                        chartIndex: detailedPoint.idx,
                        price: activeData[detailedPoint.idx],
                        text: commentText.trim(),
                        sentiment: "Neutral",
                        timestamp: new Date().toISOString(),
                        user: "@You",
                        likes: 0,
                      };
                      setUserComments(prev => [newComment, ...prev]);
                      setCommentText("");
                    }}
                    disabled={!commentText.trim()}
                    className={`px-4 rounded-xl flex items-center justify-center transition-all ${
                      commentText.trim() 
                        ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black active:scale-95" 
                        : "bg-white/5 text-white/20"
                    }`}
                  >
                    <Send className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <footer className="absolute bottom-0 inset-x-0 h-[90px] bg-black/30 backdrop-blur-[40px] border-t border-white/[0.03] flex justify-around items-start pt-5 px-4 z-[100]">
        {/* SVG Gradients */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="blueGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFFF" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>
          </defs>
        </svg>
        {[
          { id: "dashboard", icon: <img src={APP_ASSETS.tabLogo} alt="Dashboard" className="w-6 h-6 object-contain" /> },
          { id: "watchlist", icon: <List className="w-6 h-6" /> },
          { id: "markets", icon: <Globe className="w-6 h-6" /> },
          { id: "community", icon: <Users className="w-6 h-6" /> },
          { id: "profile", icon: <Settings className="w-6 h-6" /> },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedPoint(null); setProfilePage(null); setChartCrosshair(null); }}
            className="flex flex-col items-center gap-1.5 relative w-14 group"
          >
            <div className={`transition-all duration-300 ${activeTab === tab.id ? "text-white scale-110" : "text-[#7A7B8D] group-hover:text-white/70"}`}>
              {tab.icon}
            </div>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeDot"
                className="w-1 h-1 rounded-full bg-[#00FFFF] absolute -bottom-3 shadow-[0_0_10px_#00FFFF]"
              />
            )}
          </button>
        ))}
      </footer>
    </div>
  </div>
  );
}
