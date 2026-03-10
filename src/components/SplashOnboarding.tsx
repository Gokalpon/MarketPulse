// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { APP_ASSETS } from "../data";
import { useApp } from "../context/AppContext";

// ── SPLASH SCREEN — Image 3: aurora BG, large logo centered, "LET THE CHARTS SPEAK." ──
export function SplashScreen() {
  const { showSplash, isExitingSplash, isSplashPressed, handleSplashClick } = useApp();
  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-[400] flex flex-col items-center justify-between transition-all duration-700 ${isExitingSplash ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
      style={{ backgroundImage: `url(${APP_ASSETS.splashBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}
      onClick={handleSplashClick}
    >
      {/* Subtle vignette — keeps the aurora bright */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,20,0.30) 100%)" }} />

      {/* Logo + text — vertically centered */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-7 w-full px-8">
        <motion.div
          animate={
            isSplashPressed
              ? { scale: [1, 1.15, 0.88, 1.1, 1], rotate: [0, -4, 4, -2, 0] }
              : { scale: [1, 1.035, 1] }
          }
          transition={
            isSplashPressed
              ? { duration: 0.55 }
              : { repeat: Infinity, duration: 3.8, ease: "easeInOut" }
          }
        >
          <img
            src={APP_ASSETS.splashLogo}
            alt="MarketPulse"
            className="w-40 h-40 object-contain"
            style={{ filter: "drop-shadow(0 0 24px rgba(255,255,255,0.25))" }}
          />
        </motion.div>

        <div className="text-center">
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-[38px] font-light text-white tracking-tight"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>Market</span>
            <span className="text-[38px] font-bold text-white tracking-tight"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>Pulse</span>
          </div>
          <p className="text-[11px] font-medium text-white/55 tracking-[0.35em] uppercase mt-2">
            Let the charts speak.
          </p>
        </div>
      </div>

      {/* Tap to continue */}
      <div className="relative mb-14 flex flex-col items-center gap-2.5">
        <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.28em]">Tap to continue</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </div>
    </div>
  );
}

// ── ONBOARDING ──────────────────────────────────────────────────────────────
export function OnboardingScreen() {
  const {
    isLoggedIn, onboardingStep, setOnboardingStep, setIsLoggedIn,
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    loginGoogle, loginApple,
  } = useApp();

  if (isLoggedIn) return null;

  // Shared: aurora background layer
  const BgLayer = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0"
        style={{ backgroundImage: `url(${APP_ASSETS.splashBackground})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      {/* Darken bottom half so cards are readable */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.60) 60%, rgba(0,0,0,0.82) 100%)" }} />
    </div>
  );

  // Shared: small top logo
  const TopLogo = () => (
    <div className="relative flex flex-col items-center gap-3 pt-14 pb-0">
      <img src={APP_ASSETS.splashLogo} alt="MarketPulse" className="w-14 h-14 object-contain"
        style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))" }} />
      <div className="text-center">
        <div className="flex items-baseline gap-1.5 justify-center">
          <span className="text-[22px] font-light text-white tracking-tight">Market</span>
          <span className="text-[22px] font-bold text-white tracking-tight">Pulse</span>
        </div>
        <p className="text-[9px] font-medium text-white/40 tracking-[0.32em] uppercase mt-0.5">Let the charts speak.</p>
      </div>
    </div>
  );

  // Shared: language pill at the bottom
  const LangPicker = () => (
    <div className="relative pb-10 flex justify-center z-[50]">
      <button
        onClick={e => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl transition-all"
        style={{ background: "rgba(20,22,30,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-white">{language}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {showLanguageMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={e => { e.stopPropagation(); setShowLanguageMenu(false); }}
              className="fixed inset-0 z-[51]" />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[260px] rounded-2xl p-3 z-[52] grid grid-cols-2 gap-1.5"
              style={{ background: "rgba(10,11,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(32px)", boxShadow: "0 -8px 40px rgba(0,0,0,0.85)" }}
            >
              {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map(lang => (
                <button key={lang}
                  onClick={e => { e.stopPropagation(); changeLanguage(lang); setShowLanguageMenu(false); }}
                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${language === lang ? "bg-white text-black" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                  {lang}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  // ── STEP 0: Intro / "Future of Trading" — Image 4 ──────────────────────────
  if (onboardingStep === 0) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col" onClick={e => e.stopPropagation()}>
        <BgLayer />
        <TopLogo />

        {/* Content area */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 gap-5">
          {/* Glass card */}
          <div className="w-full max-w-[370px] rounded-[24px] p-7 text-center"
            style={{
              background: "rgba(8,10,16,0.52)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}>
            <p className="text-[11px] font-bold text-white/55 uppercase tracking-[0.22em] mb-2">WELCOME TO THE</p>
            <h1 className="text-[32px] font-bold leading-tight mb-5 italic"
              style={{ background: "linear-gradient(135deg, #00FFFF 0%, #39FF14 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Future of Trading
            </h1>
            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Market Pulse decodes the language of charts, summarizes public opinion, and simplifies financial
              literacy. It is a guide that allows you to see the average market expectation at a glance.
            </p>
          </div>

          {/* GET STARTED */}
          <button
            onClick={() => setOnboardingStep(1)}
            className="w-full max-w-[370px] py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.18em] text-black hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "white", boxShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
          >
            Get Started
          </button>
        </div>

        <LangPicker />
      </div>
    );
  }

  // ── STEP 1: Login / "Join the Community" — Image 5 ─────────────────────────
  if (onboardingStep === 1) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col" onClick={e => e.stopPropagation()}>
        <BgLayer />
        <TopLogo />

        <div className="relative flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {/* Glass card */}
          <div className="w-full max-w-[370px] rounded-[24px] p-6"
            style={{
              background: "rgba(8,10,16,0.52)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}>
            <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.22em] text-center mb-5">
              Join the Community
            </p>

            {/* Google */}
            <button
              onClick={async () => { try { await loginGoogle(); } catch { setIsLoggedIn(true); } }}
              className="w-full mb-3 py-3.5 rounded-2xl flex items-center gap-3 px-4 transition-all active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.618 14.015 17.64 11.707 17.64 9.2z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <span className="text-[13px] font-bold text-white">Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              onClick={async () => { try { await loginApple(); } catch { setIsLoggedIn(true); } }}
              className="w-full mb-4 py-3.5 rounded-2xl flex items-center gap-3 px-4 transition-all active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 694.5 0 600.3c0-168.3 111.6-257.5 221.2-257.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
              <span className="text-[13px] font-bold text-white">Continue with Apple</span>
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
            </div>

            {/* Email Login */}
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.18em] text-black hover:opacity-90 active:scale-[0.98] transition-all mb-3"
              style={{ background: "white" }}
            >
              Email Login
            </button>

            {/* Skip for now */}
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-2 text-white/30 text-[11px] font-bold uppercase tracking-widest hover:text-white/50 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Back to intro */}
          <button
            onClick={() => setOnboardingStep(0)}
            className="text-[10px] text-white/25 font-bold uppercase tracking-widest hover:text-white/50 transition-colors"
          >
            Back to Intro
          </button>
        </div>

        <LangPicker />
      </div>
    );
  }

  return null;
}
