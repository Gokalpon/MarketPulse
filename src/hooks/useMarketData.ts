import { useState, useEffect, useCallback } from "react";
import { fetchTimeSeries, fetchQuote, QuoteData } from "@/services/marketDataService";

interface UseMarketDataOptions {
  assetId: string;
  timeframe: string;
  fallbackData: number[];
  fallbackPrice: number;
  fallbackChange: string;
  fallbackIsUp: boolean;
}

interface MarketDataState {
  chartData: number[];
  price: number;
  change: string;
  isUp: boolean;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMarketData({
  assetId,
  timeframe,
  fallbackData,
  fallbackPrice,
  fallbackChange,
  fallbackIsUp,
}: UseMarketDataOptions): MarketDataState {
  const [chartData, setChartData] = useState<number[]>(fallbackData);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both in parallel
      const [tsData, quoteData] = await Promise.all([
        fetchTimeSeries(assetId, timeframe),
        fetchQuote(assetId),
      ]);

      if (tsData && tsData.length > 0) {
        setChartData(tsData);
        setIsLive(true);
      } else {
        setChartData(fallbackData);
        setIsLive(false);
      }

      if (quoteData) {
        setQuote(quoteData);
      }
    } catch (err) {
      console.warn("Market data unavailable, using fallback:", err);
      setChartData(fallbackData);
      setIsLive(false);
      setError("Live data unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [assetId, timeframe, fallbackData]);

  useEffect(() => {
    loadData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    chartData,
    price: quote?.price ?? fallbackPrice,
    change: quote?.change ?? fallbackChange,
    isUp: quote?.isUp ?? fallbackIsUp,
    isLive,
    isLoading,
    error,
    refresh: loadData,
  };
}