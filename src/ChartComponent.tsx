// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartProps {
  data: { time: string | number; value: number }[];
  comments?: any[];
  onCrosshairMove?: (param: any) => void;
  lineColor?: string;
  backgroundColor?: string;
  textColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
}

export const MarketPulseChart: React.FC<ChartProps> = ({
  data = [],
  comments = [],
  onCrosshairMove,
  lineColor = '#00FFFF',
  backgroundColor = 'transparent',
  textColor = '#7A7B8D',
  areaTopColor = 'rgba(0, 255, 255, 0.15)',
  areaBottomColor = 'rgba(0, 255, 255, 0.0)',
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Mount chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      width: container.clientWidth,
      height: container.clientHeight || 240,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.3)', style: 1, width: 1 },
        horzLine: { color: 'rgba(255,255,255,0.3)', style: 1, width: 1 },
      },
      handleScroll: { pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true },
    });

    chartRef.current = chart;

    const series = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: lineColor,
      lastValueVisible: true,
    });

    seriesRef.current = series;

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => onCrosshairMove(param));
    }

    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight || 240,
        });
        chartRef.current.timeScale().fitContent();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [backgroundColor, textColor, lineColor, areaTopColor, areaBottomColor]);

  // Update data when it changes — no full chart re-create
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (!data || data.length === 0) {
      try { series.setData([]); } catch(e) {}
      return;
    }

    const cleaned = data
      .map(d => ({ time: Number(d.time), value: Number(d.value) }))
      .filter(d => !isNaN(d.time) && !isNaN(d.value) && d.value > 0)
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (cleaned.length === 0) return;

    try {
      series.setData(cleaned);
      // fitContent AFTER data — fixes left-side empty space
      if (chartRef.current) chartRef.current.timeScale().fitContent();
    } catch(e) {
      console.warn('setData error:', e);
    }
  }, [data]);

  // Update markers separately
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (!comments || comments.length === 0) {
      try { series.setMarkers([]); } catch(e) {}
      return;
    }

    const markers = comments
      .map((c) => ({
        time: Number(c.time),
        position: 'aboveBar',
        color: c.sentiment === 'Positive' ? '#39FF14'
             : c.sentiment === 'Negative'  ? '#FF3131'
             : '#FFFFFF',
        shape: 'circle',
        text: '',  // no text labels on chart
        size: 1,
      }))
      .filter(m => !isNaN(m.time) && m.time > 0)
      .sort((a, b) => a.time - b.time)
      .filter((m, i, arr) => i === 0 || m.time !== arr[i - 1].time);

    try { series.setMarkers(markers); } catch(e) {}
  }, [comments]);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px' }}
    >
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};
