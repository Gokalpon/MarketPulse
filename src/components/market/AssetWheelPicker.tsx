import React, { useState, useRef } from "react";
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

const ITEM_HEIGHT = 52;
const VISIBLE_RADIUS = 3;
const BG = "rgba(12, 12, 15, 0.52)";
const FADE_BG = "rgba(12, 12, 15, 0.52)";

export function AssetWheelPicker({ assets, selectedAssetId, onSelect, onClose }: AssetWheelPickerProps) {
  const initialIndex = Math.max(0, assets.findIndex(a => a.id === selectedAssetId));
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [pressed, setPressed] = useState(false);
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

  const handleConfirm = () => {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onSelect(assets[centerIndex]?.id ?? selectedAssetId);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center pb-10"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="w-[92%] max-w-[380px] relative rounded-[28px] overflow-hidden"
        style={{
          background: BG,
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Masked border light — only 1px edge visible */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none overflow-hidden"
          style={{
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
            zIndex: 50,
          }}
        >
          <motion.div
            className="absolute origin-center"
            style={{
              top: "50%", left: "50%",
              width: "200%", height: "200%",
              marginTop: "-100%", marginLeft: "-100%",
              background: "conic-gradient(from 0deg, transparent 0%, transparent 38%, rgba(255,255,255,0.7) 50%, transparent 62%, transparent 100%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </div>
          {/* Header */}
          <div className="pt-5 pb-4 px-7 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/25">Varlık Seç</span>
            <button onClick={onClose} className="flex items-center justify-center transition-opacity hover:opacity-60">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Wheel */}
          <div
            className="relative flex items-center justify-center select-none"
            style={{ height: ITEM_HEIGHT * (VISIBLE_RADIUS * 2 + 1), overflow: "hidden" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Fades — same BG color, no darkness difference */}
            <div className="absolute inset-x-0 top-0 z-10 pointer-events-none" style={{ height: "40%", background: `linear-gradient(to bottom, ${FADE_BG}, transparent)` }} />
            <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "40%", background: `linear-gradient(to top, ${FADE_BG}, transparent)` }} />

            {/* iOS hairlines */}
            <div className="absolute inset-x-7 z-10 pointer-events-none" style={{ top: "50%", transform: "translateY(-50%)", height: ITEM_HEIGHT }}>
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Items */}
            <div className="relative w-full" style={{ perspective: 600 }}>
              {assets.map((asset, i) => {
                const offset = (i - centerIndex) + dragOffset;
                const absOffset = Math.abs(offset);
                if (absOffset > VISIBLE_RADIUS + 0.5) return null;
                const isCenter = Math.round(centerIndex) === i;

                return (
                  <div
                    key={asset.id}
                    onClick={() => isCenter ? handleConfirm() : setCenterIndex(i)}
                    className="absolute left-0 right-0 flex items-center justify-center cursor-pointer"
                    style={{
                      height: ITEM_HEIGHT,
                      top: "50%",
                      marginTop: -ITEM_HEIGHT / 2,
                      transform: `translateY(${offset * ITEM_HEIGHT}px) rotateX(${offset * -20}deg) scale(${Math.max(0.55, 1 - absOffset * 0.15)})`,
                      opacity: Math.max(0, 1 - absOffset * 0.30),
                      transition: isDragging.current ? "none" : "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span style={{
                        fontSize: isCenter ? 21 : 17,
                        fontWeight: isCenter ? 600 : 400,
                        color: `rgba(255,255,255,${isCenter ? 0.88 : 0.22})`,
                        transition: "all 0.3s ease",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        {asset.name}
                      </span>
                      <span style={{
                        fontSize: isCenter ? 10 : 9,
                        fontWeight: 500,
                        color: `rgba(255,255,255,${isCenter ? 0.28 : 0.10})`,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        transition: "all 0.3s ease",
                      }}>
                        {asset.symbol}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm */}
          <div className="flex items-center justify-center pb-6 pt-3">
            <motion.button
              onClick={handleConfirm}
              className="px-10 py-2 text-[13px] font-semibold tracking-[0.15em] uppercase"
              animate={{
                color: pressed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                textShadow: pressed ? "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3)" : "none",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              Seç
            </motion.button>
          </div>
      </motion.div>
    </motion.div>
  );
}
