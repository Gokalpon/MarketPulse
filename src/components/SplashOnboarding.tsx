// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { APP_ASSETS } from "../data";
import { useApp } from "../context/AppContext";

export function SplashScreen() {
  const { showSplash, isExitingSplash, isSplashPressed, handleSplashClick, t } = useApp();
  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-[400] bg-[#030508] flex flex-col items-center transition-all duration-700 ${isExitingSplash ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url(${APP_ASSETS.splashBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
      />

      {/* Content */}
      <div
        className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-[430px] cursor-pointer px-8 pt-10"
        onClick={handleSplashClick}
      >
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

export function OnboardingScreen() {
  const {
    isLoggedIn, onboardingStep, setOnboardingStep, setIsLoggedIn,
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    loginGoogle, loginApple, t,
  } = useApp();

  if (isLoggedIn) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[#030508] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 blur-[1px]"
          style={{ backgroundImage: `url(${APP_ASSETS.splashBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      </div>

      <div className="relative z-10 h-[100dvh] flex flex-col items-center justify-between px-6 pt-10 pb-10 w-full max-w-[430px] mx-auto overflow-hidden">
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
                className="absolute inset-0 bg-[#00FFFF]/10 blur-[40px] rounded-full"
              />
              <img src={APP_ASSETS.splashLogo} alt="Market Pulse Logo" className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
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

        {/* Steps */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[340px]">
          <AnimatePresence mode="wait">
            {onboardingStep === 0 ? (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-center w-full flex flex-col items-center"
              >
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-6 mb-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group w-full">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative z-10">
                    <h2 className="text-[18px] font-black text-white mb-1 leading-none tracking-tighter uppercase">{t.welcome}</h2>
                    <h3 className="text-[24px] font-black leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#00FFFF] via-[#39FF14] to-[#00FFFF] bg-[length:200%_auto] animate-gradient-x">{t.future}</h3>
                    <p className="text-white/40 text-[12px] leading-relaxed font-medium">{t.description}</p>
                  </div>
                </div>
                <div className="space-y-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOnboardingStep(1)}
                    className="w-full bg-white text-black font-black py-4 rounded-[20px] text-[13px] uppercase tracking-[0.3em] transition-all relative overflow-hidden"
                  >
                    {t.getStarted}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col items-center"
              >
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-6 mb-3 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden w-full">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <h2 className="text-[15px] font-black text-white mb-4 text-center uppercase tracking-[0.3em]">{t.joinCommunity}</h2>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.98 }}
                      onClick={() => loginGoogle().catch(() => setIsLoggedIn(true))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-4 px-4 py-2.5 rounded-[16px] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                      </div>
                      <span className="font-bold text-[13px] text-white/80 group-hover:text-white transition-colors">{t.continueGoogle}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.98 }}
                      onClick={() => loginApple().catch(() => setIsLoggedIn(true))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-4 px-4 py-2.5 rounded-[16px] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_rgba(255,255,255,0.2)]">
                        <svg className="w-4 h-4 fill-black" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      </div>
                      <span className="font-bold text-[13px] text-white/80 group-hover:text-white transition-colors">{t.continueApple}</span>
                    </motion.button>

                    <div className="flex items-center gap-4 py-1">
                      <div className="h-[1px] flex-1 bg-white/[0.05]" />
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">or</span>
                      <div className="h-[1px] flex-1 bg-white/[0.05]" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, filter: "brightness(1.1)" }} whileTap={{ scale: 0.98 }}
                      onClick={() => setIsLoggedIn(true)}
                      className="w-full bg-white text-black font-black py-3 rounded-[16px] text-[12px] uppercase tracking-widest shadow-2xl"
                    >
                      {t.emailLogin}
                    </motion.button>

                    <button onClick={() => setIsLoggedIn(true)} className="w-full text-[9px] font-black text-white/30 uppercase tracking-[0.4em] hover:text-white/60 transition-colors mt-2">
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

        {/* Language Selector */}
        <div className="relative z-[50]">
          <button
            onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-2xl backdrop-blur-xl transition-all hover:bg-white/[0.06]"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{language}</span>
            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showLanguageMenu && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[51]" />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[280px] bg-[#0D0E14]/98 border border-white/[0.1] rounded-2xl p-3 backdrop-blur-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.8)] z-[52] grid grid-cols-2 gap-1.5"
                >
                  {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                    <button key={lang} onClick={(e) => { e.stopPropagation(); changeLanguage(lang); }}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${language === lang ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
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
