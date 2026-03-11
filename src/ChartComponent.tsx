// @ts-nocheck
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, ColorType, AreaSeries, createSeriesMarkers } from "lightweight-charts";

export const MarketPulseChart = ({
  data = [],
  comments = [],
  onCrosshairMove,
  onMarkerClick,
  onVisibleMarkersChange,
  lineColor = "#00FFFF",
  backgroundColor = "transparent",
  areaTopColor = "rgba(0, 255, 255, 0.18)",
  areaBottomColor = "rgba(57, 255, 20, 0.02)",
}) => {
  const containerRef  = useRef(null);
  const chartRef      = useRef(null);
  const seriesRef     = useRef(null);
  const markersPlugin = useRef(null);
  const allMarkers    = useRef([]);
  const debounce      = useRef(null);

  const refreshMarkers = useCallback(() => {
    if (!chartRef.current || !seriesRef.current) return;
    try {
      const vr = chartRef.current.timeScale().getVisibleRange();
      if (!vr) return;
      const inView = allMarkers.current.filter(m => m.time >= vr.from && m.time <= vr.to);
      const top2 = [...inView]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 2)
        .sort((a, b) => a.time - b.time);
      const mData = top2.map(m => ({
        time: m.time,
        position: m.sentiment === "Negative" ? "belowBar" : "aboveBar",
        color: m.sentiment === "Positive" ? "#39FF14" : m.sentiment === "Negative" ? "#FF4444" : "#00FFFF",
        shape: "circle",
        text: "",
        size: 2,
      }));
      try {
        if (markersPlugin.current && typeof markersPlugin.current.setData === "function") {
          markersPlugin.current.setData(mData);
        } else {
          try { markersPlugin.current?.detach?.(); } catch {}
          markersPlugin.current = createSeriesMarkers(seriesRef.current, mData);
        }
      } catch {
        try { seriesRef.current.setMarkers(mData); } catch {}
      }
      if (onVisibleMarkersChange) onVisibleMarkersChange(top2);
    } catch {}
  }, [onVisibleMarkersChange]);

  const schedule = useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(refreshMarkers, 80);
  }, [refreshMarkers]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(0,0,0,0)",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width:  el.clientWidth  || 300,
      height: el.clientHeight || 220,
      timeScale: {
        visible: false,
        borderVisible: false,
        rightOffset: 1,
        barSpacing: 6,
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.04 },
      },
      leftPriceScale:  { visible: false },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255,255,255,0.2)",
          style: 1,
          width: 1,
          labelVisible: false,
        },
        horzLine: {
          color: "rgba(0,255,255,0.15)",
          style: 1,
          width: 1,
          labelVisible: false,
        },
      },
      handleScroll: { pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale:  { mouseWheel: true, pinch: true, axisPressedMouseMove: false },
    });
    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor:    areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      priceLineVisible:  false,
      lastValueVisible:  false,
      crosshairMarkerVisible:         true,
      crosshairMarkerRadius:          5,
      crosshairMarkerBorderColor:     "#00FFFF",
      crosshairMarkerBackgroundColor: "#050507",
      crosshairMarkerBorderWidth:     2,
    });
    seriesRef.current = series;

    if (onCrosshairMove) chart.subscribeCrosshairMove(p => onCrosshairMove(p));

    chart.subscribeClick(param => {
      if (!param?.time || !param?.point) return;
      const clickTime = Number(param.time);
      const markers = allMarkers.current;
      if (!markers.length) return;
      const nearest = markers.reduce((best, m) => {
        const d = Math.abs(m.time - clickTime);
        const bd = Math.abs((best?.time ?? Infinity) - clickTime);
        return d < bd ? m : best;
      }, null);
      if (nearest && onMarkerClick) {
        const vr   = chart.timeScale().getVisibleRange();
        const span = ((vr?.to ?? 0) - (vr?.from ?? 0)) * 0.07;
        if (Math.abs(nearest.time - clickTime) < span) {
          onMarkerClick({ ...nearest, screenX: param.point.x, screenY: param.point.y });
        }
      }
    });

    chart.timeScale().subscribeVisibleTimeRangeChange(schedule);

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height) || 220;
        if (chartRef.current && w > 0) {
          chartRef.current.applyOptions({ width: w, height: h });
          chartRef.current.timeScale().fitContent();
        }
      }
    });
    ro.observe(el);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
      ro.disconnect();
      try { markersPlugin.current?.detach?.(); } catch {}
      markersPlugin.current = null;
      try { chart.remove(); } catch {}
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (!data?.length) { try { series.setData([]); } catch {} return; }
    const cleaned = data
      .map(d => ({ time: Number(d.time ?? d), value: Number(d.value ?? d) }))
      .filter(d => d.time > 0 && d.value > 0 && !isNaN(d.time) && !isNaN(d.value))
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);
    if (!cleaned.length) return;
    try {
      series.setData(cleaned);
      chartRef.current?.timeScale().fitContent();
      setTimeout(schedule, 200);
    } catch (e) { console.warn("setData error:", e); }
  }, [data]);

  useEffect(() => {
    allMarkers.current = (comments || [])
      .filter(c => c?.time && !isNaN(Number(c.time)))
      .map(c => ({ ...c, time: Number(c.time) }))
      .sort((a, b) => a.time - b.time);
    schedule();
  }, [comments, schedule]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", minHeight: 200, overflow: "hidden" }}>
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-5 h-5 border-2 border-[#00FFFF]/50 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">Loading</p>
          </div>
        </div>
      )}
      <style>{`a[href*="tradingview"]{display:none!important}`}</style>
    </div>
  );
};
