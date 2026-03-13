// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, X, Plus, List } from "lucide-react";
import { ASSETS, APP_ASSETS } from "../data";
import { useApp } from "../context/AppContext";

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * 60, y: 20 - ((v - min) / range) * 20 }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width="60" height="20" className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function Header() {
  const {
    isMenuOpen, setIsMenuOpen,
    isSearchActive, setIsSearchActive,
    isEditPinned, setIsEditPinned,
    pinnedAssets, setPinnedAssets,
    menuSearch, setMenuSearch,
    selectedAssetId, setSelectedAssetId,
    setActiveTab, t, language,
  } = useApp();

  return (
    <>
      <header className="absolute top-0 inset-x-0 z-[100] px-6 pt-12 pb-4 bg-black/15 backdrop-blur-[40px] border-b border-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
            <img src={APP_ASSETS.headerLogo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center h-10">
              <div className="flex items-baseline gap-1.5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] transition-all">
                <span className="text-[20px] font-thin text-white/90 tracking-tighter leading-none">{t.market}</span>
                <span className="text-[20px] font-bold text-white tracking-tighter leading-none">{t.pulse}</span>
              </div>
              <span className="text-[7.5px] font-medium text-white/40 tracking-[0.25em] uppercase mt-1.5 leading-none">{t.slogan}</span>
            </div>
          </div>
          <div
            className="w-9 h-9 rounded-full border border-white/[0.05] flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setIsSearchActive(!isSearchActive)}
          >
            <Search className="w-4 h-4 text-white/80" strokeWidth={2} />
          </div>
        </div>
      </header>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isSearchActive && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchActive(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]" />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[110px] inset-x-0 px-6 py-6 z-[145] bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7B8D]" />
                <input type="text" placeholder="Search assets, profiles..." className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-base text-white focus:outline-none focus:border-[#00FFFF]/50 transition-colors shadow-inner" autoFocus />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[150]" />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="absolute top-0 left-0 bottom-0 w-[300px] bg-black/80 backdrop-blur-xl border-r border-white/[0.05] z-[160] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 mt-6">
                <div className="flex items-center gap-2">
                  <img src={APP_ASSETS.tabLogo} alt="Market Pulse" className="w-7 h-7 object-contain" />
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
                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${isEditPinned ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10"}`}
                >
                  {isEditPinned ? "Done" : "Edit"}
                </button>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                {isEditPinned ? (
                  <>
                    <div className="px-2 mb-2 mt-2">
                      <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-3">{t.currentlyPinned}</div>
                      <div className="flex flex-col gap-2">
                        {ASSETS.filter(a => pinnedAssets.includes(a.id)).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.03]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
                              <div>
                                <div className="font-bold text-[14px]">{asset.id}</div>
                                <div className="text-[10px] text-[#7A7B8D]">{asset.name}</div>
                              </div>
                            </div>
                            <button onClick={() => setPinnedAssets(pinnedAssets.filter(id => id !== asset.id))} className="w-6 h-6 rounded-full flex items-center justify-center bg-[#E50000] text-black shadow-sm hover:scale-110 transition-transform">
                              <X className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                        {pinnedAssets.length === 0 && <div className="text-[10px] text-white/30 italic px-4 py-2">{t.noAssetsPinned}</div>}
                      </div>
                    </div>

                    <div className="px-2 mb-4 mt-6">
                      <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-3">{t.addMoreAssets}</div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <input type="text" placeholder={t.searchToAdd} value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[12px] focus:outline-none focus:border-[#00FFFF]/50 transition-colors" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {menuSearch.length > 0 && ASSETS.filter(a => !pinnedAssets.includes(a.id) && (a.id.toLowerCase().includes(menuSearch.toLowerCase()) || a.name.toLowerCase().includes(menuSearch.toLowerCase()))).slice(0, 10).map(asset => (
                        <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
                            <div>
                              <div className="font-bold text-[14px]">{asset.id}</div>
                              <div className="text-[10px] text-[#7A7B8D]">{asset.name}</div>
                            </div>
                          </div>
                          <button onClick={() => { setPinnedAssets([...pinnedAssets, asset.id]); setMenuSearch(""); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00FFFF] to-[#39FF14] text-black shadow-sm hover:scale-110 transition-transform">
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  ASSETS.filter(a => pinnedAssets.includes(a.id)).map(asset => (
                    <button key={asset.id}
                      onClick={() => { setSelectedAssetId(asset.id); setIsMenuOpen(false); setActiveTab("dashboard"); }}
                      className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${selectedAssetId === asset.id ? "bg-white/10 border border-white/[0.05]" : "hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">{asset.id[0]}</div>
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
    </>
  );
}
