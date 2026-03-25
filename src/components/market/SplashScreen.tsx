import { motion } from "motion/react";
import { APP_ASSETS } from "@/data/assets";

interface SplashScreenProps {
  isExitingSplash: boolean;
  isSplashPressed: boolean;
  onSplashClick: () => void;
  t: Record<string, string>;
}

export const SplashScreen = ({ isExitingSplash, isSplashPressed, onSplashClick, t }: SplashScreenProps) => {
  return (
    <div
      className={`absolute inset-0 z-[400] bg-[var(--mp-bg)] flex flex-col items-center transition-all duration-700 ${
        isExitingSplash ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
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
        className="absolute bottom-28 inset-x-8 flex justify-center"
      >
        <motion.button
          onClick={onSplashClick}
          whileTap={{ scale: 0.96 }}
          className="relative w-full py-5 rounded-[22px] overflow-hidden text-[13px] font-black uppercase tracking-[0.22em] text-white/70"
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
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-y-0 w-[40%] pointer-events-none"
            animate={{ x: ["-100%", "350%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.0 }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)",
            }}
          />

          {/* Pulsing top border highlight */}
          <motion.div
            className="absolute top-0 left-[20%] right-[20%] h-px rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />

          Tap to Start
        </motion.button>
      </motion.div>
    </div>
  );
};
