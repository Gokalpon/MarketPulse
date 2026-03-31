import { useState, useEffect, useRef } from 'react';

interface EasingFunction {
  (t: number): number;
}

const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

interface UseCountUpAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  easingFn?: keyof typeof easing;
  onComplete?: () => void;
  formatLocale?: boolean;
}

export function useCountUpAnimation({
  end,
  start = 0,
  duration = 1000,
  decimals = 0,
  easingFn = 'easeInOutCubic',
  onComplete,
  formatLocale = true,
}: UseCountUpAnimationProps): string {
  const [displayValue, setDisplayValue] = useState<string>(
    formatLocale 
      ? start.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : start.toFixed(decimals)
  );
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const easeFn = easing[easingFn];
    
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeFn(progress);
      const currentValue = start + (end - start) * easeProgress;

      const formatted = formatLocale
        ? currentValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : currentValue.toFixed(decimals);

      setDisplayValue(formatted);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const finalFormatted = formatLocale
          ? end.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : end.toFixed(decimals);
        setDisplayValue(finalFormatted);
        onComplete?.();
      }
    };

    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, start, duration, decimals, easingFn, onComplete, formatLocale]);

  return displayValue;
}
