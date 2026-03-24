import { supabase } from "@/integrations/supabase/client";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// TwelveData symbol mapping for our assets
const SYMBOL_MAP: Record<string, string> = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
  ADA: "ADA/USD",
  DOT: "DOT/USD",
  LINK: "LINK/USD",
  AVAX: "AVAX/USD",
  XRP: "XRP/USD",
  AAPL: "AAPL",
  MSFT: "MSFT",
  GOOGL: "GOOGL",
  AMZN: "AMZN",
  META: "META",
  NVDA: "NVDA",
  AMD: "AMD",
  TSLA: "TSLA",
  NFLX: "NFLX",
  NASDAQ: "QQQ", // NDX proxy via QQQ ETF
  GOLD: "XAU/USD",
  SILVER: "XAG/USD",
  OIL: "WTI/USD",
  COPPER: "HG",
  PLATINUM: "PL",
  PALLADIUM: "PA",
  NATGAS: "NG",
  CORN: "ZC",
  WHEAT: "ZW",
};

// Timeframe to TwelveData interval mapping
const INTERVAL_MAP: Record<string, { interval: string; outputsize: number }> = {
  "1H": { interval: "5min", outputsize: 12 },
  "1D": { interval: "15min", outputsize: 60 },
  "1W": { interval: "1h", outputsize: 60 },
  "1M": { interval: "4h", outputsize: 60 },
  "1Y": { interval: "1day", outputsize: 60 },
  "ALL": { interval: "1week", outputsize: 60 },
};

// Cache to avoid excessive API calls
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60_000; // 1 minute for price, 5 min for time series

function getCacheKey(action: string, symbol: string, extra?: string): string {
  return `${action}:${symbol}:${extra || ""}`;
}

function getCached(key: string, duration: number = CACHE_DURATION): unknown {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < duration) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
  // Limit cache size
  if (cache.size > 200) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 50; i++) {
      cache.delete(oldest[i][0]);
    }
  }
}

export async function fetchTimeSeries(
  assetId: string,
  timeframe: string
): Promise<number[] | null> {
  const symbol = SYMBOL_MAP[assetId];
  if (!symbol) return null;

  const config = INTERVAL_MAP[timeframe] || INTERVAL_MAP["1D"];
  const cacheKey = getCacheKey("ts", symbol, `${config.interval}-${config.outputsize}`);
  const cached = getCached(cacheKey, 300_000); // 5 min cache for time series
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke("market-data", {
      body: {
        action: "time_series",
        symbol,
        interval: config.interval,
        outputsize: config.outputsize,
      },
    });

    if (error) {
      console.error("Time series fetch error:", error);
      return null;
    }

    if (data?.status === "error" || !data?.values) {
      console.warn("TwelveData API error:", data?.message || "No data");
      return null;
    }

    // TwelveData returns newest first, reverse for chart display
    const prices: number[] = (data.values as Array<{ close: string }>)
      .map((v) => parseFloat(v.close))
      .reverse();

    setCache(cacheKey, prices);
    return prices;
  } catch (err) {
    console.error("Failed to fetch time series:", err);
    return null;
  }
}

export interface QuoteData {
  price: number;
  change: string;
  changePercent: number;
  isUp: boolean;
  high: number;
  low: number;
  volume: string;
}

export async function fetchQuote(assetId: string): Promise<QuoteData | null> {
  const symbol = SYMBOL_MAP[assetId];
  if (!symbol) return null;

  const cacheKey = getCacheKey("quote", symbol);
  const cached = getCached(cacheKey, 30_000); // 30 sec cache for quotes
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke("market-data", {
      body: { action: "quote", symbol },
    });

    if (error || data?.status === "error" || !data?.close) {
      console.warn("Quote fetch error:", error || data?.message);
      return null;
    }

    const close = parseFloat(data.close);
    const prevClose = parseFloat(data.previous_close);
    const changeVal = close - prevClose;
    const changePct = prevClose ? (changeVal / prevClose) * 100 : 0;

    const quote: QuoteData = {
      price: close,
      change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`,
      changePercent: changePct,
      isUp: changePct >= 0,
      high: parseFloat(data.high) || close,
      low: parseFloat(data.low) || close,
      volume: data.volume || "0",
    };

    setCache(cacheKey, quote);
    return quote;
  } catch (err) {
    console.error("Failed to fetch quote:", err);
    return null;
  }
}

export function getTwelveDataSymbol(assetId: string): string | undefined {
  return SYMBOL_MAP[assetId];
}