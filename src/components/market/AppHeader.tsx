import { Search } from "lucide-react";
import { APP_ASSETS } from "@/data/assets";
import type { TranslationStrings } from "@/types";

interface AppHeaderProps {
  t: TranslationStrings;
  onMenuOpen: () => void;
  onSearchToggle: () => void;
}

export function AppHeader({ t, onMenuOpen, onSearchToggle }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] px-6"
      style={{
        paddingTop: "calc(3rem + env(safe-area-inset-top))",
        background: "rgba(5, 5, 8, 0.55)",
        backdropFilter: "blur(32px) saturate(160%)",
        WebkitBackdropFilter: "blur(32px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onMenuOpen}>
          <img src={APP_ASSETS.headerLogo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
          <div className="flex flex-col justify-center h-10">
            <div className="flex items-baseline gap-1.5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] transition-all">
              <span className="text-[20px] font-thin text-white/90 tracking-tighter leading-none">{t.market}</span>
              <span className="text-[20px] font-bold text-foreground tracking-tighter leading-none">{t.pulse}</span>
            </div>
            <span className="text-[7.5px] font-medium text-white/40 tracking-[0.25em] uppercase mt-1.5 leading-none">{t.slogan}</span>
          </div>
        </div>

        {/* Search Button */}
        <div
          className="w-9 h-9 rounded-[14px] border border-white/[0.06] flex items-center justify-center bg-[#07080C]/60 backdrop-blur-[50px] cursor-pointer hover:bg-white/[0.07] transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
          onClick={onSearchToggle}
        >
          <Search className="w-4 h-4 text-white/70" strokeWidth={2.2} />
        </div>
      </div>
    </header>
  );
}
