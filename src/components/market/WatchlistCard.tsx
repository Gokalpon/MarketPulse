import { motion } from "motion/react";
import { Sparkline } from "@/components/market/Sparkline";
import { useMarketData } from "@/hooks/useMarketData";

interface WatchlistCardProps {
  asset: any;
  onClick: () => void;
  layout: "list" | "grid";
  motionVariants: any;
}

export function WatchlistCard({ asset, onClick, layout, motionVariants }: WatchlistCardProps) {
  const { price, change, isUp, chartData } = useMarketData({
    assetId: asset.id,
    timeframe: "1D",
    fallbackData: asset.data?.["1D"] ?? [],
    fallbackPrice: asset.price,
    fallbackChange: asset.change,
    fallbackIsUp: asset.isUp,
  });

  const sparkData = chartData.slice(-20);
  const displayPrice = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (layout === "list") {
    return (
      <motion.div
        variants={motionVariants}
        onClick={onClick}
        className="mp-glass-card glow-btn rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors cursor-pointer"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
          e.currentTarget.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/[0.05]">
            {asset.id[0]}
          </div>
          <div>
            <div className="font-bold text-[15px]">{asset.name}</div>
            <div className="text-[11px] text-[var(--mp-text-secondary)] font-medium uppercase tracking-wider">
              {asset.symbol}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Sparkline data={sparkData} color={isUp ? "#39FF14" : "#E50000"} />
          <div className="text-right min-w-[70px]">
            <div className="font-bold text-[15px]">${displayPrice}</div>
            <div className={`text-[9px] font-bold px-1 py-0.5 rounded inline-block ${change.startsWith("+") ? "mp-positive-badge" : change.startsWith("-") ? "mp-negative-badge" : "bg-white/10 text-foreground"}`}>
              {change}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={motionVariants}
      onClick={onClick}
      className="mp-glass-card glow-btn rounded-[20px] p-4 flex flex-col hover:bg-black/30 transition-colors cursor-pointer"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-8 h-8 rounded-[10px] bg-white/5 flex items-center justify-center font-bold text-xs border border-white/[0.05]">
          {asset.id[0]}
        </div>
        <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isUp ? "mp-positive-badge" : "mp-negative-badge"}`}>
          {change}
        </div>
      </div>
      <div className="mb-2">
        <div className="font-bold text-[14px] leading-tight truncate">{asset.name}</div>
        <div className="text-[9px] text-[var(--mp-text-secondary)] uppercase tracking-widest">{asset.symbol}</div>
      </div>
      <div className="mt-auto">
        <div className="font-black text-[16px] mb-1">${displayPrice}</div>
        <Sparkline data={sparkData} color={isUp ? "#39FF14" : "#E50000"} />
      </div>
    </motion.div>
  );
}
