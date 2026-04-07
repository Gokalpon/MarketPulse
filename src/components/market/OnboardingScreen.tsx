import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { APP_ASSETS } from "@/data/assets";

interface OnboardingScreenProps {
  onLogin: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: Record<string, string>;
}

export const OnboardingScreen = ({ onLogin, language, setLanguage, t }: OnboardingScreenProps) => {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [filling, setFilling] = useState(false);

  const handleGetStarted = () => {
    if (filling) return;
    setFilling(true);
    setTimeout(() => {
      setFilling(false);
      setOnboardingStep(1);
    }, 1200); // Wait for the 1.2s fast premium holographic fill to finish
  };

  return (
    <div className="absolute inset-0 z-[300] bg-[var(--mp-bg)]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40 blur-[1px]"
          style={{
            backgroundImage: `url(${APP_ASSETS.splashBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      </div>

      <div className="relative z-10 h-[100dvh] flex flex-col items-center justify-between px-6 pt-10 pb-10 w-full max-w-[430px] mx-auto">
        {/* Top Branding */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[var(--mp-cyan)]/10 blur-[40px] rounded-full"
              />
              <img src={APP_ASSETS.splashLogo} alt="Market Pulse Logo" className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </motion.div>
          </div>
          <div className="flex flex-col items-center mt-[-15px] relative z-20 w-full">
            <h1 className="text-[28px] tracking-tighter text-foreground flex items-center justify-center gap-2 w-full">
              <span className="font-thin text-white/90">{t.market}</span>
              <span className="font-bold text-foreground">{t.pulse}</span>
            </h1>
            <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.32em] mt-0.5 text-center w-full whitespace-nowrap">
              {t.slogan}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[375px]">
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
                {/* Card — koyu buzlu cam */}
                <div
                  className="rounded-[32px] p-8 mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden w-full"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(32px) saturate(180%)",
                    WebkitBackdropFilter: "blur(32px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <div className="relative z-10">
                    {/* Küçük label */}
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/35 mb-2">{t.welcome}</p>
                    {/* Future of Trading — büyük ve bold */}
                    <h3 className="text-[28px] font-black tracking-tighter leading-tight pb-0.5 mb-4 mp-gradient-text animate-gradient-x">{t.future}</h3>
                    <p className="text-[13px] leading-relaxed font-medium text-white/65">{t.description}</p>
                  </div>
                </div>

                {/* GET STARTED — Premium Holographic Button */}
                <button
                  onClick={handleGetStarted}
                  className={`btn-holo btn-holo-2 relative py-[18px] px-10 rounded-[28px] text-[13px] font-black uppercase tracking-[0.22em] w-full max-w-[240px] flex items-center justify-center transition-transform duration-300 active:scale-[0.97] ${filling ? 'is-active' : ''}`}
                >
                  {/* Solid green layer inside holo effect */}
                  <span className="solid-layer pointer-events-none" aria-hidden="true"></span>
                  {/* Iridescent shine layer */}
                  <span className="shine-layer pointer-events-none" aria-hidden="true"></span>

                  {/* Button text stays visible and changes color via CSS */}
                  <span className="relative z-10 btn-text transition-all duration-[800ms] block">
                    {t.getStarted}
                  </span>
                </button>
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
                <div
                  className="rounded-[32px] p-6 mb-3 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden w-full"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(32px) saturate(180%)",
                    WebkitBackdropFilter: "blur(32px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <h2 className="text-[15px] font-black text-foreground mb-4 text-center uppercase tracking-[0.3em]">{t.joinCommunity}</h2>
                  <div className="space-y-2">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={onLogin} className="w-full bg-white/[0.04] flex items-center gap-4 px-4 py-3 rounded-full transition-all relative overflow-hidden glow-btn" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`); e.currentTarget.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`); }}>
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                        <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                      </div>
                      <span className="text-[12px] font-bold text-foreground uppercase tracking-wider">{t.continueGoogle}</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={onLogin} className="w-full bg-white/[0.04] flex items-center gap-4 px-4 py-3 rounded-full transition-all relative overflow-hidden glow-btn" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`); e.currentTarget.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`); }}>
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                      </div>
                      <span className="text-[12px] font-bold text-foreground uppercase tracking-wider">{t.continueApple}</span>
                    </motion.button>
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-[0.5px] bg-white/10" />
                      <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">or</span>
                      <div className="flex-1 h-[0.5px] bg-white/10" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onLogin} className="w-full py-3.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg" style={{ background: "rgba(255,255,255,0.92)", color: "#1a1a1a" }}>{t.emailLogin}</motion.button>
                    <button onClick={onLogin} className="w-full text-[11px] font-black text-white/50 uppercase tracking-[0.35em] hover:text-white/90 transition-colors mt-3 py-2">{t.skip}</button>
                  </div>
                </div>
                <motion.button whileHover={{ opacity: 1, letterSpacing: "0.5em" }} onClick={() => setOnboardingStep(0)} className="w-full text-white/20 text-[11px] font-black uppercase tracking-[0.4em] transition-all py-4">{t.back}</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Selector */}
        <div className="relative z-[50]">
          <button
            onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-2xl backdrop-blur-xl transition-all hover:bg-white/[0.06]"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground">{language}</span>
            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`} />
          </button>
          {showLanguageMenu && (
            <>
              <div onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[310]" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[311] w-[260px] bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-2.5 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] grid grid-cols-2 gap-1.5">
                {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                  <button
                    key={lang}
                    onClick={(e) => { e.stopPropagation(); setLanguage(lang); setShowLanguageMenu(false); }}
                    className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 text-center ${language === lang
                        ? "bg-foreground text-background shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
