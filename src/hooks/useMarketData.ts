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
    refetchInterval: 60_000,
    staleTime: 60_000,
    gcTime: 5 * 60_000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
    refetchInterval: 30_000,
    staleTime: 30_000,
    gcTime: 5 * 60_000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const refresh = () => {
    refetchTs();
    refetchQuote();
  };

  const chartData = tsData && tsData.length > 0 ? tsData : fallbackData;
  const isLive = !!tsData;
  const quote = quoteData as QuoteData | null;

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
