import React, { useRef } from "react";
import { motion } from "motion/react";
import { APP_ASSETS } from "@/data/assets";

interface SplashScreenProps {
  isExitingSplash: boolean;
  isSplashPressed: boolean;
  onSplashClick: () => void;
  t: Record<string, string>;
}

export const SplashScreen = ({ isExitingSplash, isSplashPressed, onSplashClick, t }: SplashScreenProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const outerGlowRef = useRef<HTMLDivElement>(null);

  const handleProximity = (clientX: number, clientY: number) => {
    const btn = btnRef.current;
    const glow = glowRef.current;
    if (!btn || !glow) return;

    const rect = btn.getBoundingClientRect();

    // Pointer position relative to button (clamped to button bounds for gx/gy)
    const gx = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const gy = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    // Distance from pointer to nearest point on button
    const nearestX = Math.max(rect.left, Math.min(rect.right, clientX));
    const nearestY = Math.max(rect.top, Math.min(rect.bottom, clientY));
    const dist = Math.sqrt((clientX - nearestX) ** 2 + (clientY - nearestY) ** 2);

    const proximityRadius = 120; // px dışında algılama başlar
    const opacity = dist === 0 ? 1 : Math.max(0, 1 - dist / proximityRadius);

    btn.style.setProperty("--gx", `${gx}%`);
    btn.style.setProperty("--gy", `${gy}%`);
    glow.style.opacity = String(opacity);

    // Outer ambient glow
    const outer = outerGlowRef.current;
    if (outer) {
      outer.style.opacity = String(opacity * 0.7);
      outer.style.setProperty("--gx", `${gx}%`);
      outer.style.setProperty("--gy", `${gy}%`);
    }
  };

  const handleScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handleProximity(e.clientX, e.clientY);
  };

  return (
    <div
      className={`absolute inset-0 z-[400] bg-[var(--mp-bg)] flex flex-col items-center transition-all duration-700 ${
        isExitingSplash ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
      onPointerMove={handleScreenPointerMove}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${APP_ASSETS.splashBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-[430px] cursor-pointer px-8 pt-10"
        onClick={onSplashClick}
      >
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isSplashPressed ? { opacity: 0, scale: 0.9 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[var(--mp-cyan)]/8 blur-[30px] rounded-full" />
              <img
                src={APP_ASSETS.splashLogo}
                alt="Market Pulse Logo"
                className="w-64 h-64 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              />
            </motion.div>
          </div>
          <div className="flex flex-col items-center mt-[-20px] relative z-20 w-full max-w-[240px]">
            <h1 className="text-[32px] tracking-tighter text-foreground flex items-center justify-center gap-2 w-full">
              <span className="font-thin text-white/90">{t.market}</span>
              <span className="font-bold text-foreground">{t.pulse}</span>
            </h1>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.32em] mt-1 text-center w-full">
              {t.slogan}
            </p>
          </div>
        </div>
      </div>

      {/* TAP TO START */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-28 inset-x-16 flex justify-center"
      >
        {/* Outer ambient glow — not clipped by button */}
        <div
          ref={outerGlowRef}
          className="absolute inset-[-32px] pointer-events-none rounded-[100px]"
          style={{
            opacity: 0,
            background: "radial-gradient(ellipse 55% 45% at var(--gx,50%) var(--gy,50%), rgba(100,215,200,0.12), transparent 80%)",
            filter: "blur(24px)",
            transition: "opacity 0.2s ease",
          }}
        />

        <motion.button
          ref={btnRef}
          onClick={onSplashClick}
          whileTap={{ scale: 0.96 }}
          className="relative w-full py-[22px] rounded-[100px] overflow-hidden text-[13px] font-black uppercase tracking-[0.22em] text-white/70"
          style={{
            background: "rgba(0,0,0,0.12)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.07)",
              "inset 0 -1px 0 rgba(0,0,0,0.3)",
              "0 16px 48px rgba(0,0,0,0.6)",
              "0 2px 8px rgba(0,0,0,0.4)",
            ].join(", "),
          }}
        >
          {/* Cursor spotlight glow */}
          <div
            ref={glowRef}
            className="absolute inset-0 pointer-events-none rounded-[100px]"
            style={{
              opacity: 0,
              background: "radial-gradient(ellipse 110px 90px at var(--gx,50%) var(--gy,50%), rgba(200,255,215,0.25) 0%, rgba(60,190,160,0.16) 35%, rgba(0,120,180,0.10) 65%, rgba(0,30,100,0.05) 85%, transparent 100%)",
              transition: "opacity 0.15s ease",
            }}
          />
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-y-0 w-[40%] pointer-events-none"
            animate={{ x: ["-100%", "350%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.0 }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)",
            }}
          />
          Tap to Start
        </motion.button>

        {/* Border traveling light — after button in DOM, overflow-hidden clips to pill shape */}
        <div
          className="absolute inset-0 rounded-[100px] pointer-events-none overflow-hidden"
          style={{ zIndex: 20 }}
        >
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "100px",
              overflow: "hidden",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          >
            <motion.div
              className="absolute origin-center"
              style={{
                top: "50%", left: "50%",
                width: "200%", height: "200%",
                marginTop: "-100%", marginLeft: "-100%",
                background: "conic-gradient(from 0deg, transparent 0%, transparent 38%, rgba(255,255,255,0.9) 50%, transparent 62%, transparent 100%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
