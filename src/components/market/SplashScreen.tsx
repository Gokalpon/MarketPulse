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
};
