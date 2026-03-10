// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { APP_ASSETS } from "../data";
import { useApp } from "../context/AppContext";

export function SplashScreen() {
  const { showSplash, isExitingSplash, isSplashPressed, handleSplashClick } = useApp();
  if (!showSplash) return null;
  return (
    <div
      className={`fixed inset-0 z-[400] bg-[#030508] flex flex-col items-center transition-all duration-700 ${isExitingSplash ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
      onClick={handleSplashClick}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={isSplashPressed ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -5, 5, -3, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <img src={APP_ASSETS.splashLogo} alt="MarketPulse" className="w-32 h-32 object-contain" />
        </motion.div>
        <div className="text-center">
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-[36px] font-thin text-white/90 tracking-tighter">Market</span>
            <span className="text-[36px] font-bold text-white tracking-tighter">Pulse</span>
          </div>
          <p className="text-[11px] font-medium text-white/30 tracking-[0.3em] uppercase mt-2">Real-time market intelligence</p>
        </div>
      </div>
      <div className="mb-16 flex flex-col items-center gap-3 opacity-40">
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Tap to continue</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const {
    isLoggedIn, onboardingStep, setOnboardingStep, setIsLoggedIn,
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    loginGoogle, loginApple, t,
  } = useApp();

  if (isLoggedIn) return null;

  if (onboardingStep === 0) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#030508] flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[360px] flex flex-col items-center gap-8">
          <img src={APP_ASSETS.splashLogo} alt="MarketPulse" className="w-20 h-20 object-contain" />
          <div className="text-center">
            <h1 className="text-[28px] font-black tracking-tight text-white mb-2">Welcome to<br />MarketPulse</h1>
            <p className="text-[13px] text-white/40 leading-relaxed">Your AI-powered market intelligence companion</p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={async () => { try { await loginGoogle(); } catch { setIsLoggedIn(true); } }}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Continue with Google
            </button>
            <button
              onClick={async () => { try { await loginApple(); } catch { setIsLoggedIn(true); } }}
              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Continue with Apple
            </button>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-3 text-white/30 text-[12px] font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
            >
              Continue as Guest
            </button>
          </div>

          {/* Language selector */}
          <div className="relative z-[50]">
            <button
              onClick={e => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-2xl backdrop-blur-xl transition-all hover:bg-white/[0.06]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{language}</span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showLanguageMenu && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[51]" />
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[280px] bg-[#0D0E14]/98 border border-white/[0.1] rounded-2xl p-3 backdrop-blur-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.8)] z-[52] grid grid-cols-2 gap-1.5">
                    {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map(lang => (
                      <button key={lang} onClick={e => { e.stopPropagation(); changeLanguage(lang); }} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${language === lang ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
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

  return null;
}
