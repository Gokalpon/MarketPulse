import { motion } from "motion/react";
import { APP_ASSETS } from "@/data/assets";
import { ChevronRight } from "lucide-react";

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

      {/* TAP TO START — glass button with depth */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-14 inset-x-8 flex justify-center"
      >
        {/* Outer breathing glow ring */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[22px]"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,135,0.25), rgba(0,229,200,0.25))",
            filter: "blur(12px)",
          }}
        />

        <motion.button
          onClick={onSplashClick}
          whileTap={{ scale: 0.97 }}
          className="relative w-full flex items-center justify-between px-6 py-4 rounded-[22px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.12)",
              "inset 0 -1px 0 rgba(0,0,0,0.2)",
              "0 0 0 1px rgba(0,255,135,0.18)",
              "0 8px 32px rgba(0,229,180,0.18)",
              "0 24px 60px rgba(0,0,0,0.5)",
            ].join(", "),
          }}
        >
          {/* Inner surface shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            className="absolute inset-y-0 w-1/3 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            }}
          />

          <div className="flex flex-col items-start gap-0.5">
            <span
              className="text-[16px] font-black uppercase tracking-[0.12em] leading-none"
              style={{
                background: "linear-gradient(135deg, #00FF87, #00E5CC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tap to Start
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {t.slogan}
            </span>
          </div>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #00FF87, #00E5CC)",
              boxShadow: "0 4px 16px rgba(0,229,180,0.4)",
            }}
          >
            <ChevronRight className="w-4 h-4 text-[#040D08]" strokeWidth={3} />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};
