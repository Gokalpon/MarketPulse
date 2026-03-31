import { useState } from "react";
import { motion } from "motion/react";

export const NotifToggle = ({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) => {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="mp-glass-card rounded-2xl p-4 flex items-center justify-between">
      <div className="flex-1 mr-4">
        <div className="font-bold text-[14px] text-white/90">{label}</div>
        <div className="text-[10px] text-[var(--mp-text-secondary)] mt-0.5">{desc}</div>
      </div>
      <div
        onClick={() => setIsOn(!isOn)}
        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex-shrink-0 ${isOn ? "bg-[var(--mp-green)]" : "bg-white/10"}`}
      >
        <motion.div animate={{ x: isOn ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
};
