import React, { useRef } from "react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  glowColor?: string;
  glowSize?: number;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, className = "", glowColor, glowSize, style, onMouseMove, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLButtonElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLButtonElement>) ?? innerRef;

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = ref.current ?? innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--gx", `${x}%`);
      el.style.setProperty("--gy", `${y}%`);
      if (glowColor) el.style.setProperty("--glow-color", glowColor);
      if (glowSize) el.style.setProperty("--glow-size", `${glowSize}px`);
      onMouseMove?.(e);
    };

    return (
      <button
        ref={innerRef}
        onMouseMove={handleMouseMove}
        className={`glow-btn ${className}`}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";
