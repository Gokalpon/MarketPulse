// @ts-nocheck
import React, { useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, AreaSeries, createSeriesMarkers } from 'lightweight-charts';

export const MarketPulseChart = ({
  data = [],
  comments = [],
  onCrosshairMove,
  onMarkerClick,
  onVisibleMarkersChange,
  lineColor = '#00FFFF',
  backgroundColor = 'transparent',
  textColor = '#7A7B8D',
  areaTopColor = 'rgba(0, 255, 255, 0.18)',
  areaBottomColor = 'rgba(57, 255, 20, 0.02)',
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const markersPluginRef = useRef(null);
  const allMarkersRef = useRef([]);
  const debounceTimer = useRef(null);

  // ── Update visible markers: max 2 by importance in current viewport ──
  const updateVisibleMarkers = useCallback(() => {
    if (!chartRef.current || !seriesRef.current) return;
    try {
      const visibleRange = chartRef.current.timeScale().getVisibleRange();
      if (!visibleRange) return;

      const all = allMarkersRef.current;
      const inView = all.filter(m => m.time >= visibleRange.from && m.time <= visibleRange.to);

      // Sort by importance descending, take top 2, re-sort by time
      const top2 = [...inView]
        .sort((a, b) => (b.importance || 5) - (a.importance || 5))
        .slice(0, 2)
        .sort((a, b) => a.time - b.time);

      const markerData = top2.map(c => ({
        time: c.time,
        position: c.sentiment === 'Negative' ? 'belowBar' : 'aboveBar',
        color: c.sentiment === 'Positive' ? '#39FF14'
             : c.sentiment === 'Negative'  ? '#FF4444'
             : '#00FFFF',
        shape: 'circle',
        text: '',
        size: 2,
      }));

      // Use createSeriesMarkers (v5 API) if available, fallback to setMarkers
      try {
        if (markersPluginRef.current && typeof markersPluginRef.current.setData === 'function') {
          markersPluginRef.current.setData(markerData);
        } else {
          try { markersPluginRef.current?.detach?.(); } catch {}
          markersPluginRef.current = createSeriesMarkers(seriesRef.current, markerData);
        }
      } catch {
        try { seriesRef.current.setMarkers(markerData); } catch {}
      }

      if (onVisibleMarkersChange) onVisibleMarkersChange(top2);
    } catch (e) {}
  }, [onVisibleMarkersChange]);

  const scheduleUpdate = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(updateVisibleMarkers, 80);
  }, [updateVisibleMarkers]);

  // ── Mount chart once ──
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        fontSize: 10,
        fontFamily: "'SF Mono', 'Courier New', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.025)' },
        horzLines: { color: 'rgba(255,255,255,0.025)' },
      },
      width: el.clientWidth || 300,
      height: el.clientHeight || 220,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
        rightOffset: 3,
        barSpacing: 6,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(0,255,255,0.3)', style: 1, width: 1, labelBackgroundColor: '#00FFFF' },
        horzLine: { color: 'rgba(0,255,255,0.3)', style: 1, width: 1, labelBackgroundColor: '#00FFFF' },
      },
      handleScroll: { pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: 'rgba(0,255,255,0.35)',
      priceLineWidth: 1,
      lastValueVisible: true,
      lastPriceAnimation: 1,
    });
    seriesRef.current = series;

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove(param => onCrosshairMove(param));
    }

    // Click: find closest marker and call onMarkerClick with screen coordinates
    chart.subscribeClick(param => {
      if (!param?.time || !param?.point) return;
      const clickTime = Number(param.time);
      const markers = allMarkersRef.current;
      if (!markers.length) return;

      const nearest = markers.reduce((best, m) => {
        const d = Math.abs(m.time - clickTime);
        const bd = Math.abs((best?.time ?? Infinity) - clickTime);
        return d < bd ? m : best;
      }, null);

      if (nearest) {
        const vr = chart.timeScale().getVisibleRange();
        const span = ((vr?.to ?? 0) - (vr?.from ?? 0)) * 0.07; // 7% tolerance
        if (Math.abs(nearest.time - clickTime) < span && onMarkerClick) {
          onMarkerClick({ ...nearest, screenX: param.point.x, screenY: param.point.y });
        }
      }
    });

    // Subscribe to zoom/scroll → update visible markers
    chart.timeScale().subscribeVisibleTimeRangeChange(scheduleUpdate);

    // ResizeObserver — handles all layout changes including flex/grid resize
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height) || 220;
        if (chartRef.current) {
          chartRef.current.applyOptions({ width: w, height: h });
          chartRef.current.timeScale().fitContent();
        }
      }
    });
    ro.observe(el);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      ro.disconnect();
      try { markersPluginRef.current?.detach?.(); } catch {}
      markersPluginRef.current = null;
      try { chart.remove(); } catch {}
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // intentionally empty — mount once

  // ── Update data ──
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (!data?.length) { try { series.setData([]); } catch {} return; }

    const cleaned = data
      .map(d => ({ time: Number(d.time), value: Number(d.value) }))
      .filter(d => !isNaN(d.time) && !isNaN(d.value) && d.value > 0)
      .sort((a, b) => a.time - b.time)
      .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    if (!cleaned.length) return;
    try {
      series.setData(cleaned);
      chartRef.current?.timeScale().fitContent();
      setTimeout(scheduleUpdate, 200); // re-evaluate markers after data settles
    } catch (e) { console.warn('setData error:', e); }
  }, [data]);

  // ── Update markers pool when comments prop changes ──
  useEffect(() => {
    allMarkersRef.current = (comments || [])
      .filter(c => c?.time && !isNaN(Number(c.time)))
      .map(c => ({ ...c, time: Number(c.time) }))
      .sort((a, b) => a.time - b.time);
    scheduleUpdate();
  }, [comments, scheduleUpdate]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 200 }}>
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-5 h-5 border-2 border-[#00FFFF]/50 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">Loading</p>
          </div>
        </div>
      )}
    </div>
  );
};
