import { motion } from "motion/react";
import { Search, X, Plus, TrendingUp, TrendingDown, ChevronDown, List, LayoutGrid } from "lucide-react";
import { ASSETS } from "@/data/assets";
import { GlowButton } from "@/components/market/GlowButton";
import { WatchlistCard } from "@/components/market/WatchlistCard";
import type { TranslationStrings } from "@/types";

interface MarketsTabProps {
  language: string;
  t: TranslationStrings;
  watchlistAssets: string[];
  watchlistSort: string;
  setWatchlistSort: (v: string) => void;
  watchlistLayout: "list" | "grid";
  setWatchlistLayout: (v: "list" | "grid") => void;
  marketsSubTab: "watchlist" | "all";
  setMarketsSubTab: (v: "watchlist" | "all") => void;
  selectedAssetId: string;
  setSelectedAssetId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: any[];
  isSearching: boolean;
  handleAddExternalAsset: (quote: any) => void;
  selectedMarket: string;
  setSelectedMarket: (m: string) => void;
  showMarketPicker: boolean;
  setShowMarketPicker: (v: boolean) => void;
  marketPickerSearch: string;
  setMarketPickerSearch: (v: string) => void;
  moversPeriod: string;
  setMoversPeriod: (v: string) => void;
  gainersExpanded: boolean;
  setGainersExpanded: (v: boolean) => void;
  losersExpanded: boolean;
  setLosersExpanded: (v: boolean) => void;
}

export function MarketsTab({
  language,
  t,
  watchlistAssets,
  watchlistSort,
  setWatchlistSort,
  watchlistLayout,
  setWatchlistLayout,
  marketsSubTab,
  setMarketsSubTab,
  selectedAssetId,
  setSelectedAssetId,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  handleAddExternalAsset,
  selectedMarket,
  setSelectedMarket,
  showMarketPicker,
  setShowMarketPicker,
  marketPickerSearch,
  setMarketPickerSearch,
  moversPeriod,
  setMoversPeriod,
  gainersExpanded,
  setGainersExpanded,
  losersExpanded,
  setLosersExpanded,
}: MarketsTabProps) {
  const MARKETS = [
    { id: "All", label: language === "Turkish" ? "Tumu" : "All", filter: () => true },
    { id: "Crypto", label: "Crypto", filter: (a: any) => a.category === "Crypto" },
    { id: "NASDAQ", label: "NASDAQ/US", filter: (a: any) => a.category === "Stocks" && !a.symbol.includes(".IS") && !a.symbol.includes(".DE") && !a.symbol.includes(".T") },
    { id: "BIST", label: language === "Turkish" ? "Borsa Istanbul" : "BIST", filter: (a: any) => a.symbol.includes(".IS") },
    { id: "Commodities", label: language === "Turkish" ? "Emtialar" : "Commodities", filter: (a: any) => a.category === "Commodities" },
  ];

  const PERIODS = ["1D", "1W", "1M", "1Y"];

  const getPeriodChange = (asset: any) => {
    if (!asset || !asset.data) return 0;
    const data = asset.data?.[moversPeriod];
    if (!data || !Array.isArray(data) || data.length < 2 || data[0] === 0) {
      return parseFloat(asset?.change || "0") || 0;
    }
    return ((data[data.length - 1] - data[0]) / data[0]) * 100;
  };

  const activeMarket = MARKETS.find(m => m.id === selectedMarket) || MARKETS[0];
  const marketAssets = (ASSETS || []).filter(activeMarket?.filter || (() => true));

  const sortedWatchlist = [...(ASSETS || []).filter((a) => (watchlistAssets || []).includes(a.id))].sort((a, b) => {
    if (watchlistSort === "gainers") return (parseFloat(b?.change || "0") || 0) - (parseFloat(a?.change || "0") || 0);
    if (watchlistSort === "losers") return (parseFloat(a?.change || "0") || 0) - (parseFloat(b?.change || "0") || 0);
    if (watchlistSort === "az") return (a?.name || "").localeCompare(b?.name || "");
    return 0;
  });

  return (
    <motion.div key="markets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <h2 className="text-2xl font-black tracking-tight uppercase">{t.markets}</h2>
        {marketsSubTab === "watchlist" && (
          <div className="flex items-center gap-2">
            <select
              value={watchlistSort}
              onChange={e => setWatchlistSort(e.target.value)}
              className="bg-white/[0.06] backdrop-blur-md text-white/60 text-[10px] font-bold uppercase rounded-xl px-2 py-1.5 outline-none border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
            >
              <option value="default">{language === "Turkish" ? "Varsayilan" : "Default"}</option>
              <option value="gainers">{language === "Turkish" ? "Kazananlar" : "Gainers"}</option>
              <option value="losers">{language === "Turkish" ? "Kaybedenler" : "Losers"}</option>
              <option value="az">A-Z</option>
            </select>
            <div className="flex bg-white/[0.06] backdrop-blur-md rounded-xl p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <button onClick={() => setWatchlistLayout("list")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "list" ? "bg-white/15 text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setWatchlistLayout("grid")} className={`p-2 rounded-lg transition-colors ${watchlistLayout === "grid" ? "bg-white/15 text-foreground" : "text-[var(--mp-text-secondary)]"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-tab Toggle */}
      <div className="flex bg-white/[0.06] backdrop-blur-md p-1 rounded-xl mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <GlowButton
          onClick={() => setMarketsSubTab("watchlist")}
          className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${marketsSubTab === "watchlist" ? "bg-white/15 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "text-white/50 hover:text-white/70"}`}
        >
          {t.watchlist || "Watchlist"}
        </GlowButton>
        <GlowButton
          onClick={() => setMarketsSubTab("all")}
          className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${marketsSubTab === "all" ? "bg-white/15 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "text-white/50 hover:text-white/70"}`}
        >
          {language === "Turkish" ? "Tum Piyasalar" : "All Markets"}
        </GlowButton>
      </div>

      {marketsSubTab === "watchlist" ? (
        /* Watchlist */
        watchlistLayout === "list" ? (
          <motion.div className="flex flex-col gap-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
            {sortedWatchlist.map((asset) => (
              <WatchlistCard
                key={asset.id}
                asset={asset}
                layout="list"
                onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                motionVariants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-2 gap-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
            {sortedWatchlist.map((asset) => (
              <WatchlistCard
                key={asset.id}
                asset={asset}
                layout="grid"
                onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                motionVariants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } } }}
              />
            ))}
          </motion.div>
        )
      ) : (
        /* All Markets */
        <div className="flex flex-col gap-8 pb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              placeholder={language === "Turkish" ? "Hisse, coin veya kategori ara..." : "Search assets, symbols or categories..."}
              className="w-full bg-white/[0.06] backdrop-blur-md rounded-2xl py-4 pl-12 pr-4 text-[14px] focus:outline-none focus:bg-white/[0.08] transition-all font-medium placeholder:text-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery.length > 0 ? (
            /* Search Results */
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--mp-text-secondary)] mb-4 px-1">
                {language === "Turkish" ? "Arama Sonuclari" : "Search Results"}
              </h3>
              <div className="flex flex-col bg-white/[0.06] backdrop-blur-md rounded-[28px] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {isSearching ? (
                  <div className="text-center text-white/40 py-12 text-[14px] font-medium animate-pulse">
                    {language === "Turkish" ? "Kuresel piyasalar araniyor..." : "Searching global markets..."}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((quote) => (
                    <div key={quote.symbol} className="flex items-center justify-between p-4 hover:bg-white/[0.05] transition-colors cursor-pointer border-b border-white/[0.04] last:border-0 group">
                      <div className="flex items-center gap-4 flex-1" onClick={() => handleAddExternalAsset(quote)}>
                        <div className="w-11 h-11 rounded-[14px] bg-white/[0.04] flex items-center justify-center font-black text-[14px] border border-white/[0.08] uppercase">
                          {quote.symbol[0]}
                        </div>
                        <div>
                          <div className="text-[16px] font-bold text-foreground mb-0.5 max-w-[180px] truncate">
                            {quote.shortname || quote.longname || quote.symbol}
                          </div>
                          <div className="text-[11px] text-[var(--mp-text-secondary)] font-bold uppercase tracking-widest">
                            {quote.symbol} {quote.exchDisp ? `- ${quote.exchDisp}` : ""}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddExternalAsset(quote); }}
                        className="p-2.5 rounded-xl transition-all bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/40 py-12 text-[14px] font-medium">
                    {language === "Turkish" ? "Sonuc bulunamadi." : "No results found."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Market Picker */}
              <div className="relative">
                <GlowButton
                  onClick={() => { setShowMarketPicker(!showMarketPicker); setMarketPickerSearch(""); }}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all backdrop-blur-md bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center gap-1.5"
                >
                  {MARKETS.find(m => m.id === selectedMarket)?.label ?? "All Markets"}
                  <span className="text-white/40">-</span>
                </GlowButton>
                {showMarketPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-[#0a0c10]/95 backdrop-blur-xl rounded-2xl p-3 w-52 shadow-2xl border border-white/[0.08]" style={{ maxHeight: 280, overflowY: "auto" }}>
                    <input
                      autoFocus
                      value={marketPickerSearch}
                      onChange={e => setMarketPickerSearch(e.target.value)}
                      placeholder="Crypto, NASDAQ, BIST..."
                      className="w-full bg-white/[0.08] rounded-xl px-3 py-2 text-[11px] font-medium placeholder:text-white/30 focus:outline-none mb-2"
                    />
                    {MARKETS.filter(m => m.label.toLowerCase().includes(marketPickerSearch.toLowerCase())).map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMarket(m.id); setShowMarketPicker(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all mb-0.5 ${selectedMarket === m.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Period Filter */}
              <div className="flex gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setMoversPeriod(p)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all backdrop-blur-md ${moversPeriod === p ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "bg-white/[0.06] text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Top Gainers */}
              <div>
                <button onClick={() => setGainersExpanded(!gainersExpanded)} className="w-full flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" stroke="url(#mpIconGrad)" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">
                      {language === "Turkish" ? "En Cok Kazananlar" : "Top Gainers"}
                    </span>
                    <span className="text-[9px] text-white/30">{moversPeriod}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${gainersExpanded ? "rotate-180" : ""}`} />
                </button>
                <div className="flex flex-col gap-2">
                  {([...(selectedMarket === "All" ? ASSETS : marketAssets)].sort((a, b) => getPeriodChange(b) - getPeriodChange(a)).slice(0, gainersExpanded ? 10 : 1)).map((asset: any, i: number) => {
                    const chg = getPeriodChange(asset);
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                        className="mp-glass-card rounded-[18px] p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-l-2 border-l-[var(--mp-cyan)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-black text-[11px] text-white/40">{i + 1}</div>
                          <div>
                            <div className="font-bold text-[14px]">{asset.symbol}</div>
                            <div className="text-[10px] text-[var(--mp-text-secondary)] tracking-wider">{asset.name}</div>
                          </div>
                        </div>
                        <div className="text-[11px] font-black mp-positive-badge px-2.5 py-0.5 rounded-full">+{Math.abs(chg).toFixed(2)}%</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Top Losers */}
              <div>
                <button onClick={() => setLosersExpanded(!losersExpanded)} className="w-full flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[var(--mp-red)]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">
                      {language === "Turkish" ? "En Cok Kaybedenler" : "Top Losers"}
                    </span>
                    <span className="text-[9px] text-white/30">{moversPeriod}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${losersExpanded ? "rotate-180" : ""}`} />
                </button>
                <div className="flex flex-col gap-2">
                  {([...(selectedMarket === "All" ? ASSETS : marketAssets)].sort((a, b) => getPeriodChange(a) - getPeriodChange(b)).slice(0, losersExpanded ? 10 : 1)).map((asset: any, i: number) => {
                    const chg = getPeriodChange(asset);
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}
                        className="mp-glass-card rounded-[18px] p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-l-2 border-l-[#FF3B3B]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-black text-[11px] text-white/40">{i + 1}</div>
                          <div>
                            <div className="font-bold text-[14px]">{asset.symbol}</div>
                            <div className="text-[10px] text-[var(--mp-text-secondary)] tracking-wider">{asset.name}</div>
                          </div>
                        </div>
                        <div className="text-[11px] font-black mp-negative-badge px-2.5 py-0.5 rounded-full">{chg.toFixed(2)}%</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
