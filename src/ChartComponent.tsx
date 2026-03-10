// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, createSeriesMarkers } from 'lightweight-charts';

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
  lineColor = '#39FF14',
  backgroundColor = 'transparent',
  textColor = '#7A7B8D',
  areaTopColor = 'rgba(57, 255, 20, 0.4)',
  areaBottomColor = 'rgba(57, 255, 20, 0.0)',
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: { color: 'rgba(255, 255, 255, 0.5)', style: 2 },
        horzLine: { color: 'rgba(255, 255, 255, 0.5)', style: 2 },
      },
      handleScroll: {
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // v5 API: addSeries(AreaSeries, options)
    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 3,
    });

    if (data && data.length > 0) {
      newSeries.setData(data.map(d => ({ time: Number(d.time), value: Number(d.value) })));
    }

    if (comments && comments.length > 0) {
      const markers = comments.map((c) => ({
        time: c.time,
        position: 'aboveBar',
        color: c.sentiment === 'Positive' ? '#39FF14' : c.sentiment === 'Negative' ? '#FF3131' : '#00FFFF',
        shape: 'circle',
        text: c.sentiment,
        size: 1,
      })).sort((a, b) => (Number(a.time) > Number(b.time) ? 1 : -1));

      const uniqueMarkers = markers.filter((v, i, a) => a.findIndex(t => t.time === v.time) === i);

      // v5 API: createSeriesMarkers(series, markers) — setMarkers kaldırıldı
      createSeriesMarkers(newSeries, uniqueMarkers);
    }

    chart.timeScale().fitContent();

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        onCrosshairMove(param);
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [backgroundColor, textColor, lineColor, areaTopColor, areaBottomColor]);

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '300px' }}
      ref={chartContainerRef}
    >
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Syncing Markets...</p>
          </div>
        </div>
      )}
    </div>
  );
};
