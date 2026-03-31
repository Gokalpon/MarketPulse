import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface Asset {
  id: string;
  name: string;
  symbol: string;
}

interface AssetWheelPickerProps {
  assets: Asset[];
  selectedAssetId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 56;
const VISIBLE_RADIUS = 3; // items above/below center

export function AssetWheelPicker({ assets, selectedAssetId, onSelect, onClose }: AssetWheelPickerProps) {
  const initialIndex = Math.max(0, assets.findIndex(a => a.id === selectedAssetId));
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  // fractional offset during drag (0 = snapped, -0.5..0.5 during drag)
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);
  const dragStartIndex = useRef(initialIndex);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    dragStartIndex.current = centerIndex;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    const steps = dy / ITEM_HEIGHT;
    const newIndex = Math.max(0, Math.min(assets.length - 1, dragStartIndex.current - steps));
    setCenterIndex(Math.round(newIndex));
    setDragOffset(newIndex - Math.round(newIndex));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    setCenterIndex(i => Math.max(0, Math.min(assets.length - 1, i + direction)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center pb-16"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="w-[88%] max-w-[360px] relative rounded-[40px] overflow-hidden"
        style={{
          background: "rgba(8, 10, 18, 0.85)",
          backdropFilter: "blur(60px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.9)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-5 pb-3 px-8 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Varlık Seç</span>
          <button
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
          >
            Kapat
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-white/[0.04] mx-6" />

        {/* Wheel */}
        <div
          className="relative h-[280px] flex items-center justify-center overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ perspective: "600px", perspectiveOrigin: "50% 50%" }}
        >
          {/* Top fade */}
          <div
            className="absolute inset-x-0 top-0 h-[40%] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(8,10,18,0.95) 0%, transparent 100%)" }}
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-[40%] z-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(8,10,18,0.95) 0%, transparent 100%)" }}
          />

          {/* Center highlight band */}
          <div
            className="absolute inset-x-6 pointer-events-none z-0"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              height: ITEM_HEIGHT,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          />

          {/* Items */}
          <div className="relative w-full" style={{ transformStyle: "preserve-3d" }}>
            {assets.map((asset, i) => {
              const offset = (i - centerIndex) + dragOffset;
              const absOffset = Math.abs(offset);
              if (absOffset > VISIBLE_RADIUS + 0.5) return null;

              const rotateX = offset * -22; // degrees around X axis
              const scale = Math.max(0.5, 1 - absOffset * 0.16);
              const opacity = Math.max(0, 1 - absOffset * 0.32);
              const translateY = offset * ITEM_HEIGHT;
              const translateZ = -absOffset * 28;

              const isCenter = Math.round(centerIndex) === i;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (isCenter) {
                      onSelect(asset.id);
                    } else {
                      setCenterIndex(i);
                    }
                  }}
                  className="absolute left-0 right-0 flex items-center justify-center cursor-pointer"
                  style={{
                    height: ITEM_HEIGHT,
                    top: "50%",
                    marginTop: -ITEM_HEIGHT / 2,
                    transform: `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                    opacity,
                    transition: isDragging.current ? "none" : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-black tracking-wide"
                      style={{
                        fontSize: isCenter ? 22 : 18,
                        color: isCenter ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)",
                        transition: "font-size 0.3s ease, color 0.3s ease",
                      }}
                    >
                      {asset.name}
                    </span>
                    <span
                      className="font-black tracking-widest uppercase"
                      style={{
                        fontSize: isCenter ? 11 : 9,
                        color: isCenter ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {asset.symbol}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm button */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => onSelect(assets[centerIndex]?.id ?? selectedAssetId)}
            className="w-full h-14 rounded-[20px] font-black text-[13px] uppercase tracking-widest text-black transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c0c0c0 100%)",
              boxShadow: "0 8px 24px rgba(255,255,255,0.15)",
            }}
          >
            Seç
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
