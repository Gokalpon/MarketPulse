import { motion, AnimatePresence } from "motion/react";
import { X, Search, Plus } from "lucide-react";
import { ASSETS, APP_ASSETS } from "@/data/assets";
import { Sparkline } from "@/components/market/Sparkline";
import type { TranslationStrings } from "@/types";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedAssets: string[];
  selectedAssetId: string;
  isEditPinned: boolean;
  menuSearch: string;
  t: TranslationStrings;
  onEditPinnedToggle: () => void;
  onRemoveFromPinned: (id: string) => void;
  onAddToPinned: (id: string) => void;
  onMenuSearchChange: (value: string) => void;
  onSelectAsset: (id: string) => void;
}

export function SideMenu({
  isOpen,
  onClose,
  pinnedAssets,
  selectedAssetId,
  isEditPinned,
  menuSearch,
  t,
  onEditPinnedToggle,
  onRemoveFromPinned,
  onAddToPinned,
  onMenuSearchChange,
  onSelectAsset,
}: SideMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[150]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="absolute top-0 left-0 bottom-0 w-[300px] bg-black/80 backdrop-blur-xl border-r border-white/[0.05] z-[160] p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 mt-6">
              <div className="flex items-center gap-2">
                <img src={APP_ASSETS.tabLogo} alt="Market Pulse" className="w-7 h-7 object-contain" />
                <h2 className="text-xl font-black tracking-tight uppercase">Menu</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Pinned Assets Header */}
            <div className="flex items-center justify-between px-2 mt-4 mb-2">
              <div className="text-[10px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest">
                Pinned Assets
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onEditPinnedToggle(); }}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
                  isEditPinned
                    ? "bg-foreground text-background border-foreground"
                    : "bg-white/5 text-foreground border-white/10"
                }`}
              >
                {isEditPinned ? "Done" : "Edit"}
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 scrollbar-hide">
              {isEditPinned ? (
                <>
                  {/* Currently Pinned */}
                  <div className="px-2 mb-2 mt-2">
                    <div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">
                      {t.currentlyPinned}
                    </div>
                    <div className="flex flex-col gap-2">
                      {ASSETS.filter((a) => pinnedAssets.includes(a.id)).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.03]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                              {asset.id[0]}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-[14px]">{asset.id}</div>
                              <div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveFromPinned(asset.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--mp-red)] text-background shadow-sm hover:scale-110 transition-transform"
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

                  {/* Add More Assets */}
                  <div className="px-2 mb-4 mt-6">
                    <div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">
                      {t.addMoreAssets}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                      <input
                        type="text"
                        placeholder={t.searchToAdd}
                        value={menuSearch}
                        onChange={(e) => onMenuSearchChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[12px] focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  <div className="flex flex-col gap-2">
                    {menuSearch.length > 0 && ASSETS.filter((asset) => !pinnedAssets.includes(asset.id) && (asset.id.toLowerCase().includes(menuSearch.toLowerCase()) || asset.name.toLowerCase().includes(menuSearch.toLowerCase()))).slice(0, 10).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                            {asset.id[0]}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-[14px]">{asset.id}</div>
                            <div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => { onAddToPinned(asset.id); onMenuSearchChange(""); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center mp-gradient-badge text-background shadow-sm hover:scale-110 transition-transform"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Pinned Assets List */
                ASSETS.filter((a) => pinnedAssets.includes(a.id)).map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => { onSelectAsset(asset.id); onClose(); }}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                      selectedAssetId === asset.id
                        ? "bg-white/10 border border-white/[0.05]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/[0.05]">
                        {asset.id[0]}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-[14px]">{asset.id}</div>
                        <div className="text-[10px] text-[var(--mp-text-secondary)]">{asset.name}</div>
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
  );
}
