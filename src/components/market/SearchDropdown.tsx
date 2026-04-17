import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { ASSETS } from "@/data/assets";

interface SearchDropdownProps {
  isActive: boolean;
  searchQuery: string;
  searchResults: any[];
  language: string;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onSelectAsset: (id: string) => void;
  onAddExternalAsset: (quote: any) => void;
}

export function SearchDropdown({
  isActive,
  searchQuery,
  searchResults,
  language,
  onClose,
  onSearchChange,
  onSelectAsset,
  onAddExternalAsset,
}: SearchDropdownProps) {
  const filteredAssets = ASSETS.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const externalResults = searchResults.filter(q => !ASSETS.some(a => a.id === q.symbol));

  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 px-6 z-[145] bg-black/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl max-h-[500px] overflow-y-auto"
            style={{ top: "calc(110px + env(safe-area-inset-top))" }}
          >
            <div className="py-6 max-w-2xl mx-auto">
              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mp-text-secondary)]" />
                <input
                  type="text"
                  placeholder={language === "Turkish" ? "Kripto, hisse, borsa ara..." : "Search crypto, stocks, exchanges..."}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-base text-foreground focus:outline-none focus:border-[var(--mp-cyan)]/50 transition-colors shadow-inner"
                  autoFocus
                />
              </div>

              {searchQuery.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                >
                  {/* Local Assets */}
                  {filteredAssets.length > 0 && (
                    <div className="space-y-2">
                      {filteredAssets.map((asset) => (
                        <motion.div
                          key={asset.id}
                          onClick={() => { onSelectAsset(asset.id); onClose(); onSearchChange(""); }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors border border-white/[0.05]"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-black text-[var(--mp-cyan)]">
                              {asset.id[0]}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">{asset.name}</div>
                              <div className="text-xs text-white/40">{asset.symbol} - {asset.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${asset.isUp ? "text-[var(--mp-green)]" : "text-[var(--mp-red)]"}`}>
                              ${asset.price.toFixed(2)}
                            </div>
                            <div className={`text-xs font-bold ${asset.isUp ? "text-[var(--mp-green)]" : "text-[var(--mp-red)]"}`}>
                              {asset.change}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Global Markets */}
                  {externalResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="px-1 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 mb-2">
                        {language === "Turkish" ? "Kuresel Piyasalar" : "Global Markets"}
                      </div>
                      {externalResults.map((quote) => (
                        <motion.div
                          key={quote.symbol}
                          onClick={() => { onAddExternalAsset(quote); onClose(); onSearchChange(""); }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors border border-white/[0.05]"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-black text-[var(--mp-cyan)]">
                              {quote.symbol?.[0] || "?"}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">{quote.shortname || quote.longname || quote.symbol}</div>
                              <div className="text-xs text-white/40">{quote.symbol} - {quote.quoteType || "Asset"}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-foreground">
                              {quote.price ? `$${quote.price.toFixed(2)}` : "..."}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {filteredAssets.length === 0 && externalResults.length === 0 && (
                    <div className="text-center py-8 text-white/30">
                      {language === "Turkish" ? "Varlik bulunamadi" : "No assets found"}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
