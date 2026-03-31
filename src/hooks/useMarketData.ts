import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
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
  
  // Use React Query for time series data
  const { 
    data: tsData, 
    isLoading: isTsLoading, 
    error: tsError,
    refetch: refetchTs
  } = useQuery({
    queryKey: ["market-ts", assetId, timeframe],
    queryFn: () => fetchTimeSeries(assetId, timeframe),
    refetchInterval: 60_000, // Refresh chart every 60s
    staleTime: 30_000,
  });

  // Use React Query for quote data
  const { 
    data: quoteData, 
    isLoading: isQuoteLoading,
    error: quoteError,
    refetch: refetchQuote
  } = useQuery({
    queryKey: ["market-quote", assetId],
    queryFn: () => fetchQuote(assetId),
    refetchInterval: 30_000, // Refresh quote every 30s
    staleTime: 15_000,
  });

  const refresh = () => {
    refetchTs();
    refetchQuote();
  };

  const chartData = tsData && tsData.length > 0 ? tsData : fallbackData;
  const isLive = !!tsData;
  const quote = quoteData as QuoteData | null;

  // Log errors for debugging
  useEffect(() => {
    if (tsError) console.error("🔴 Time Series API Error:", tsError);
    if (quoteError) console.error("🔴 Quote API Error:", quoteError);
  }, [tsError, quoteError]);

  return {
    chartData,
    price: quote?.price ?? fallbackPrice,
    change: quote?.change ?? fallbackChange,
    isUp: quote?.isUp ?? fallbackIsUp,
    isLive,
    isLoading: isTsLoading || isQuoteLoading,
    error: (tsError || quoteError) ? "Data unavailable" : null,
    refresh,
  };
}
