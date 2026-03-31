import { useEffect, useState } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  animated?: boolean;
}

export const Sparkline = ({ data, color, animated = true }: SparklineProps) => {
  const [strokeLength, setStrokeLength] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 60,
    y: 20 - ((v - min) / range) * 20,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  useEffect(() => {
    if (!animated) return;
    setIsAnimated(true);
  }, [animated]);

  return (
    <svg 
      width="60" 
      height="20" 
      className="overflow-visible"
      style={{
        '--stroke-length': strokeLength,
      } as React.CSSProperties}
      ref={(el) => {
        if (el && isAnimated && strokeLength === 0) {
          const pathElement = el.querySelector('path');
          if (pathElement) {
            const length = pathElement.getTotalLength();
            setStrokeLength(length);
          }
        }
      }}
    >
      <path 
        d={d} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={animated ? 'animate-draw' : ''}
        style={{
          strokeDasharray: strokeLength,
          strokeDashoffset: isAnimated ? 0 : strokeLength,
        }}
      />
    </svg>
  );
};
