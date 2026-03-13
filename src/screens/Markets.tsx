// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, Heart } from "lucide-react";
import { ASSETS } from "../data";
import { useApp } from "../context/AppContext";

export function Markets() {
  const {
    searchQuery, setSearchQuery,
    expandedCategory, setExpandedCategory,
    watchlistAssets, setWatchlistAssets,
    setSelectedAssetId, setActiveTab,
    t,
  } = useApp();

  return (
    <motion.div
      key="markets"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-12 pb-24"
    >
      <h2 className="text-2xl font-black tracking-tight uppercase mb-8 mt-2">{t.markets}</h2>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7B8D]" />
        <input
          type="text" placeholder={t.searchPlaceholder} value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-11 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00FFFF]/50 transition-colors"
        />
      </div>

      {["Stocks", "Commodities", "Crypto"].map(category => {
        const filtered = ASSETS.filter(a => a.category === category &&
          (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase())));
        if (!filtered.length) return null;
        const isExpanded = expandedCategory === category;
        const label = category === "Stocks" ? t.stocks : category === "Commodities" ? t.commodities : t.crypto;

        return (
          <div key={category} className="mb-4 bg-white/5 border border-white/[0.03] rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedCategory(isExpanded ? null : category)}
              className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors">
              <h3 className="text-[13px] font-bold text-white uppercase tracking-widest">{label}</h3>
              <ChevronDown className={`w-5 h-5 text-[#7A7B8D] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="p-2">
                    {filtered.map(asset => (
                      <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer rounded-xl">
                        <div className="flex items-center gap-3 flex-1" onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}>
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs border border-white/[0.05]">{asset.id[0]}</div>
                          <div>
                            <div className="text-[14px] font-light text-white/90">{asset.name}</div>
                            <div className="text-[10px] text-[#7A7B8D] font-medium uppercase tracking-wider">{asset.symbol}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWatchlistAssets(watchlistAssets.includes(asset.id)
                                ? watchlistAssets.filter(id => id !== asset.id)
                                : [...watchlistAssets, asset.id]);
                            }}
                            className={`p-2 rounded-lg transition-colors ${watchlistAssets.includes(asset.id) ? "text-[#00FFFF]" : "text-white/20 hover:text-white/40"}`}
                          >
                            <Heart className={`w-4 h-4 ${watchlistAssets.includes(asset.id) ? "fill-[#00FFFF]" : ""}`} />
                          </button>
                          <div className="text-right min-w-[70px]" onClick={() => { setSelectedAssetId(asset.id); setActiveTab("dashboard"); }}>
                            <div className="font-bold text-[14px]">${asset.price.toLocaleString()}</div>
                            <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${asset.change.startsWith("+") ? "bg-gradient-to-r from-[#00FFFF] to-[#39FF14] text-black" : asset.change.startsWith("-") ? "bg-[#E50000] text-black" : "bg-white/10 text-white"}`}>{asset.change}</div>
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
  );
}
