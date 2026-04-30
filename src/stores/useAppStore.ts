import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserComment, DetailedPointData, ChartCrosshair } from '@/types';

export const AI_PULSE_FREE_LIMIT = 3;

export const getAiPulseDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// ============================================
// TYPES
// ============================================

interface UIState {
  showSplash: boolean;
  isExitingSplash: boolean;
  isSplashPressed: boolean;
  isLoggedIn: boolean;
  activeTab: string;
  isMenuOpen: boolean;
  isSearchActive: boolean;
  chartExpanded: boolean;
}

interface MarketsState {
  marketsSubTab: "watchlist" | "all";
  watchlistLayout: "list" | "grid";
  watchlistSort: "default" | "gainers" | "losers" | "az";
  gainersExpanded: boolean;
  losersExpanded: boolean;
  moversPeriod: string;
  moversCategory: string;
  selectedMarket: string;
  showMarketPicker: boolean;
  marketPickerSearch: string;
}

interface AssetState {
  selectedAssetId: string;
  timeframe: string;
  currency: string;
  selectedPoint: DetailedPointData | null;
  detailedPoint: DetailedPointData | null;
  chartCrosshair: ChartCrosshair | null;
}

interface UserState {
  profilePicture: string | null;
  watchlistAssets: string[];
  pinnedAssets: string[];
  userComments: UserComment[];
  isEditPinned: boolean;
}

interface CommentState {
  showCommentSheet: boolean;
  commentChartIdx: number | null;
  commentText: string;
  commentSentiment: string;
  showMyComments: boolean;
  commentsExpanded: boolean;
  commentsTimeframe: string;
}

interface SearchState {
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  expandedCategory: string | null;
}

interface SettingsState {
  language: string;
  autoTranslate: boolean;
  showNewsBubbles: boolean;
  showAIConsensus: boolean;
  sentimentFilter: string;
}

interface AIState {
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  aiPulseCredits: number;
  aiPulseCreditDate: string;
  isProUnlocked: boolean;
}

// ============================================
// STORE INTERFACE
// ============================================

interface AppStore extends UIState, MarketsState, AssetState, UserState, CommentState, SearchState, SettingsState, AIState {
  // UI Actions
  setShowSplash: (v: boolean) => void;
  setIsExitingSplash: (v: boolean) => void;
  setIsSplashPressed: (v: boolean) => void;
  setIsLoggedIn: (v: boolean) => void;
  setActiveTab: (v: string) => void;
  setIsMenuOpen: (v: boolean) => void;
  setIsSearchActive: (v: boolean) => void;
  setChartExpanded: (v: boolean) => void;

  // Markets Actions
  setMarketsSubTab: (v: "watchlist" | "all") => void;
  setWatchlistLayout: (v: "list" | "grid") => void;
  setWatchlistSort: (v: "default" | "gainers" | "losers" | "az") => void;
  setGainersExpanded: (v: boolean) => void;
  setLosersExpanded: (v: boolean) => void;
  setMoversPeriod: (v: string) => void;
  setMoversCategory: (v: string) => void;
  setSelectedMarket: (v: string) => void;
  setShowMarketPicker: (v: boolean) => void;
  setMarketPickerSearch: (v: string) => void;

  // Asset Actions
  setSelectedAssetId: (v: string) => void;
  setTimeframe: (v: string) => void;
  setCurrency: (v: string) => void;
  setSelectedPoint: (v: DetailedPointData | null) => void;
  setDetailedPoint: (v: DetailedPointData | null) => void;
  setChartCrosshair: (v: ChartCrosshair | null) => void;

  // User Actions
  setProfilePicture: (v: string | null) => void;
  setWatchlistAssets: (v: string[]) => void;
  addToWatchlist: (assetId: string) => void;
  removeFromWatchlist: (assetId: string) => void;
  setPinnedAssets: (v: string[]) => void;
  addToPinned: (assetId: string) => void;
  removeFromPinned: (assetId: string) => void;
  setIsEditPinned: (v: boolean) => void;

  // Comment Actions
  setShowCommentSheet: (v: boolean) => void;
  setCommentChartIdx: (v: number | null) => void;
  setCommentText: (v: string) => void;
  setCommentSentiment: (v: string) => void;
  setShowMyComments: (v: boolean) => void;
  setCommentsExpanded: (v: boolean) => void;
  setCommentsTimeframe: (v: string) => void;
  addUserComment: (comment: UserComment) => void;
  deleteUserComment: (id: string) => void;

  // Search Actions
  setSearchQuery: (v: string) => void;
  setSearchResults: (v: any[]) => void;
  setIsSearching: (v: boolean) => void;
  setExpandedCategory: (v: string | null) => void;

  // Settings Actions
  setLanguage: (v: string) => void;
  setAutoTranslate: (v: boolean) => void;
  setShowNewsBubbles: (v: boolean) => void;
  setShowAIConsensus: (v: boolean) => void;
  setSentimentFilter: (v: string) => void;

  // AI Actions
  setIsAnalyzing: (v: boolean) => void;
  setAiAnalysis: (v: string | null) => void;
  consumeAiPulseCredit: () => boolean;
  resetAiPulseCredits: (dateKey?: string) => void;
  setIsProUnlocked: (v: boolean) => void;

  // Reset Actions
  resetSplashState: () => void;
  resetAssetState: () => void;
  resetCommentForm: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialUIState: UIState = {
  showSplash: true,
  isExitingSplash: false,
  isSplashPressed: false,
  isLoggedIn: false,
  activeTab: "dashboard",
  isMenuOpen: false,
  isSearchActive: false,
  chartExpanded: false,
};

const initialMarketsState: MarketsState = {
  marketsSubTab: "watchlist",
  watchlistLayout: "list",
  watchlistSort: "default",
  gainersExpanded: false,
  losersExpanded: false,
  moversPeriod: "1D",
  moversCategory: "All",
  selectedMarket: "All",
  showMarketPicker: false,
  marketPickerSearch: "",
};

const initialAssetState: AssetState = {
  selectedAssetId: "BTC",
  timeframe: "1D",
  currency: "USD",
  selectedPoint: null,
  detailedPoint: null,
  chartCrosshair: null,
};

const initialUserState: UserState = {
  profilePicture: null,
  watchlistAssets: ["AAPL", "TSLA", "NVDA", "BTC", "GOLD", "ETH", "SOL", "NASDAQ"],
  pinnedAssets: ["BTC", "AAPL", "GOLD"],
  userComments: [],
  isEditPinned: false,
};

const initialCommentState: CommentState = {
  showCommentSheet: false,
  commentChartIdx: null,
  commentText: "",
  commentSentiment: "Neutral",
  showMyComments: false,
  commentsExpanded: false,
  commentsTimeframe: "Daily",
};

const initialSearchState: SearchState = {
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  expandedCategory: null,
};

const initialSettingsState: SettingsState = {
  language: "English",
  autoTranslate: true,
  showNewsBubbles: true,
  showAIConsensus: true,
  sentimentFilter: "All",
};

const initialAIState: AIState = {
  isAnalyzing: false,
  aiAnalysis: null,
  aiPulseCredits: AI_PULSE_FREE_LIMIT,
  aiPulseCreditDate: getAiPulseDateKey(),
  isProUnlocked: false,
};

// ============================================
// STORE
// ============================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial States
      ...initialUIState,
      ...initialMarketsState,
      ...initialAssetState,
      ...initialUserState,
      ...initialCommentState,
      ...initialSearchState,
      ...initialSettingsState,
      ...initialAIState,

      // UI Actions
      setShowSplash: (v) => set({ showSplash: v }),
      setIsExitingSplash: (v) => set({ isExitingSplash: v }),
      setIsSplashPressed: (v) => set({ isSplashPressed: v }),
      setIsLoggedIn: (v) => set({ isLoggedIn: v }),
      setActiveTab: (v) => set({ activeTab: v }),
      setIsMenuOpen: (v) => set({ isMenuOpen: v }),
      setIsSearchActive: (v) => set({ isSearchActive: v }),
      setChartExpanded: (v) => set({ chartExpanded: v }),

      // Markets Actions
      setMarketsSubTab: (v) => set({ marketsSubTab: v }),
      setWatchlistLayout: (v) => set({ watchlistLayout: v }),
      setWatchlistSort: (v) => set({ watchlistSort: v }),
      setGainersExpanded: (v) => set({ gainersExpanded: v }),
      setLosersExpanded: (v) => set({ losersExpanded: v }),
      setMoversPeriod: (v) => set({ moversPeriod: v }),
      setMoversCategory: (v) => set({ moversCategory: v }),
      setSelectedMarket: (v) => set({ selectedMarket: v }),
      setShowMarketPicker: (v) => set({ showMarketPicker: v }),
      setMarketPickerSearch: (v) => set({ marketPickerSearch: v }),

      // Asset Actions
      setSelectedAssetId: (v) => set({ selectedAssetId: v, aiAnalysis: null, chartCrosshair: null }),
      setTimeframe: (v) => set({ timeframe: v, chartCrosshair: null }),
      setCurrency: (v) => set({ currency: v }),
      setSelectedPoint: (v) => set({ selectedPoint: v }),
      setDetailedPoint: (v) => set({ detailedPoint: v }),
      setChartCrosshair: (v) => set({ chartCrosshair: v }),

      // User Actions
      setProfilePicture: (v) => set({ profilePicture: v }),
      setWatchlistAssets: (v) => set({ watchlistAssets: v }),
      addToWatchlist: (assetId) => set((s) => ({
        watchlistAssets: s.watchlistAssets.includes(assetId)
          ? s.watchlistAssets
          : [...s.watchlistAssets, assetId]
      })),
      removeFromWatchlist: (assetId) => set((s) => ({
        watchlistAssets: s.watchlistAssets.filter((id) => id !== assetId)
      })),
      setPinnedAssets: (v) => set({ pinnedAssets: v }),
      addToPinned: (assetId) => set((s) => ({
        pinnedAssets: s.pinnedAssets.includes(assetId)
          ? s.pinnedAssets
          : [...s.pinnedAssets, assetId]
      })),
      removeFromPinned: (assetId) => set((s) => ({
        pinnedAssets: s.pinnedAssets.filter((id) => id !== assetId)
      })),
      setIsEditPinned: (v) => set({ isEditPinned: v }),

      // Comment Actions
      setShowCommentSheet: (v) => set({ showCommentSheet: v }),
      setCommentChartIdx: (v) => set({ commentChartIdx: v }),
      setCommentText: (v) => set({ commentText: v }),
      setCommentSentiment: (v) => set({ commentSentiment: v }),
      setShowMyComments: (v) => set({ showMyComments: v }),
      setCommentsExpanded: (v) => set({ commentsExpanded: v }),
      setCommentsTimeframe: (v) => set({ commentsTimeframe: v }),
      addUserComment: (comment) => set((s) => ({
        userComments: [comment, ...s.userComments]
      })),
      deleteUserComment: (id) => set((s) => ({
        userComments: s.userComments.filter((c) => c.id !== id)
      })),

      // Search Actions
      setSearchQuery: (v) => set({ searchQuery: v }),
      setSearchResults: (v) => set({ searchResults: v }),
      setIsSearching: (v) => set({ isSearching: v }),
      setExpandedCategory: (v) => set({ expandedCategory: v }),

      // Settings Actions
      setLanguage: (v) => set({ language: v }),
      setAutoTranslate: (v) => set({ autoTranslate: v }),
      setShowNewsBubbles: (v) => set({ showNewsBubbles: v }),
      setShowAIConsensus: (v) => set({ showAIConsensus: v }),
      setSentimentFilter: (v) => set({ sentimentFilter: v }),

      // AI Actions
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      setAiAnalysis: (v) => set({ aiAnalysis: v }),
      consumeAiPulseCredit: () => {
        const state = get();
        if (state.isProUnlocked) return true;

        const todayKey = getAiPulseDateKey();
        if (state.aiPulseCreditDate !== todayKey) {
          set({ aiPulseCreditDate: todayKey, aiPulseCredits: AI_PULSE_FREE_LIMIT - 1 });
          return true;
        }

        if (state.aiPulseCredits <= 0) return false;
        set({ aiPulseCredits: state.aiPulseCredits - 1 });
        return true;
      },
      resetAiPulseCredits: (dateKey) => set({
        aiPulseCreditDate: dateKey || getAiPulseDateKey(),
        aiPulseCredits: AI_PULSE_FREE_LIMIT,
      }),
      setIsProUnlocked: (v) => set({ isProUnlocked: v }),

      // Reset Actions
      resetSplashState: () => set({
        showSplash: true,
        isExitingSplash: false,
        isSplashPressed: false
      }),
      resetAssetState: () => set({
        selectedPoint: null,
        detailedPoint: null,
        chartCrosshair: null,
        aiAnalysis: null
      }),
      resetCommentForm: () => set({
        commentText: "",
        commentSentiment: "Neutral",
        commentChartIdx: null,
        showCommentSheet: false
      }),
    }),
    {
      name: 'market-pulse-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sanitization: Ensure critical arrays are never undefined/null
          if (!Array.isArray(state.userComments)) state.userComments = [];
          if (!Array.isArray(state.watchlistAssets)) state.watchlistAssets = [];
          if (!Array.isArray(state.pinnedAssets)) state.pinnedAssets = [];
          if (!state.language) state.language = "English";
          if (typeof state.isProUnlocked !== 'boolean') state.isProUnlocked = false;

          const todayKey = getAiPulseDateKey();
          if (!state.aiPulseCreditDate) state.aiPulseCreditDate = todayKey;
          if (typeof state.aiPulseCredits !== 'number' || Number.isNaN(state.aiPulseCredits)) {
            state.aiPulseCredits = AI_PULSE_FREE_LIMIT;
          }
          if (!state.isProUnlocked && state.aiPulseCreditDate !== todayKey) {
            state.aiPulseCreditDate = todayKey;
            state.aiPulseCredits = AI_PULSE_FREE_LIMIT;
          }
          state.aiPulseCredits = Math.max(0, Math.min(AI_PULSE_FREE_LIMIT, state.aiPulseCredits));

          // Fix potentially missing properties in older persisted comments
          state.userComments = state.userComments.map(c => ({
            ...c,
            sentiment: c.sentiment || 'Neutral',
            timestamp: c.timestamp || Date.now(),
            chartIndex: c.chartIndex ?? 0
          }));
        }
      },
      partialize: (state) => ({
        // Only persist these fields
        isLoggedIn: state.isLoggedIn,
        profilePicture: state.profilePicture,
        watchlistAssets: state.watchlistAssets,
        pinnedAssets: state.pinnedAssets,
        userComments: state.userComments,
        language: state.language,
        autoTranslate: state.autoTranslate,
        showNewsBubbles: state.showNewsBubbles,
        showAIConsensus: state.showAIConsensus,
        watchlistLayout: state.watchlistLayout,
        currency: state.currency,
        aiPulseCredits: state.aiPulseCredits,
        aiPulseCreditDate: state.aiPulseCreditDate,
        isProUnlocked: state.isProUnlocked,
      }),
      // Migrate from old individual localStorage keys
      merge: (persistedState: unknown, currentState: AppStore) => {
        const persisted = persistedState as Partial<AppStore> | null;
        const merged = { ...currentState, ...(persisted || {}) };

        // If no persisted data, try to migrate from old keys
        if (!persisted || Object.keys(persisted).length === 0) {
          try {
            const oldWatchlist = localStorage.getItem('watchlistAssets');
            const oldPinned = localStorage.getItem('pinnedAssets');
            const oldComments = localStorage.getItem('userComments');
            const oldProfilePic = localStorage.getItem('profilePicture');

            if (oldWatchlist) merged.watchlistAssets = JSON.parse(oldWatchlist);
            if (oldPinned) merged.pinnedAssets = JSON.parse(oldPinned);
            if (oldComments) merged.userComments = JSON.parse(oldComments);
            if (oldProfilePic) merged.profilePicture = oldProfilePic;
          } catch (e) {
            console.error('Migration error:', e);
          }
        }

        return merged;
      },
    }
  )
);

// ============================================
// SELECTORS (for performance optimization)
// ============================================

export const useUIState = () => useAppStore((s) => ({
  showSplash: s.showSplash,
  isExitingSplash: s.isExitingSplash,
  isSplashPressed: s.isSplashPressed,
  isLoggedIn: s.isLoggedIn,
  activeTab: s.activeTab,
  isMenuOpen: s.isMenuOpen,
  isSearchActive: s.isSearchActive,
  chartExpanded: s.chartExpanded,
}));

export const useAssetState = () => useAppStore((s) => ({
  selectedAssetId: s.selectedAssetId,
  timeframe: s.timeframe,
  currency: s.currency,
  selectedPoint: s.selectedPoint,
  detailedPoint: s.detailedPoint,
  chartCrosshair: s.chartCrosshair,
}));

export const useUserState = () => useAppStore((s) => ({
  profilePicture: s.profilePicture,
  watchlistAssets: s.watchlistAssets,
  pinnedAssets: s.pinnedAssets,
  userComments: s.userComments,
  isEditPinned: s.isEditPinned,
}));

export const useSettingsState = () => useAppStore((s) => ({
  language: s.language,
  autoTranslate: s.autoTranslate,
  showNewsBubbles: s.showNewsBubbles,
  showAIConsensus: s.showAIConsensus,
  sentimentFilter: s.sentimentFilter,
}));

export const useSearchState = () => useAppStore((s) => ({
  searchQuery: s.searchQuery,
  searchResults: s.searchResults,
  isSearching: s.isSearching,
  expandedCategory: s.expandedCategory,
}));

export const useMarketsState = () => useAppStore((s) => ({
  marketsSubTab: s.marketsSubTab,
  watchlistLayout: s.watchlistLayout,
  watchlistSort: s.watchlistSort,
  gainersExpanded: s.gainersExpanded,
  losersExpanded: s.losersExpanded,
  moversPeriod: s.moversPeriod,
  moversCategory: s.moversCategory,
  selectedMarket: s.selectedMarket,
  showMarketPicker: s.showMarketPicker,
  marketPickerSearch: s.marketPickerSearch,
}));
