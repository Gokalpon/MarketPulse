// Yahoo Finance proxy server endpoint (relative path — proxied by Vite in dev)
const SERVER_BASE = "/api/market";

// Yahoo Finance symbol mapping for our assets
const SYMBOL_MAP: Record<string, string> = {
  // Crypto
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  SOL: "SOL-USD",
  ADA: "ADA-USD",
  DOT: "DOT-USD",
  LINK: "LINK-USD",
  AVAX: "AVAX-USD",
  XRP: "XRP-USD",
  // Stocks
  AAPL: "AAPL",
  MSFT: "MSFT",
  GOOGL: "GOOGL",
  AMZN: "AMZN",
  META: "META",
  NVDA: "NVDA",
  AMD: "AMD",
  TSLA: "TSLA",
  NFLX: "NFLX",
  // Index
  NASDAQ: "QQQ",
  // Commodities (Yahoo futures format)
  GOLD: "GC=F",
  SILVER: "SI=F",
  OIL: "CL=F",
  COPPER: "HG=F",
  PLATINUM: "PL=F",
  PALLADIUM: "PA=F",
  NATGAS: "NG=F",
  CORN: "ZC=F",
  WHEAT: "ZW=F",
};

// Timeframe to Yahoo Finance interval/range mapping
const INTERVAL_MAP: Record<string, { interval: string; range: string }> = {
  "1H":  { interval: "5m",   range: "1h"  },
  "1D":  { interval: "15m",  range: "1d"  },
  "1W":  { interval: "1h",   range: "1wk" },
  "1M":  { interval: "1d",   range: "1mo" },
  "1Y":  { interval: "1wk",  range: "1y"  },
  "ALL": { interval: "1mo",  range: "5y"  },
};

export async function fetchTimeSeries(
  assetId: string,
  timeframe: string
): Promise<number[] | null> {
  const symbol = SYMBOL_MAP[assetId] ?? assetId;
  if (!symbol) return null;

  const config = INTERVAL_MAP[timeframe] || INTERVAL_MAP["1D"];

  try {
    const url = `${SERVER_BASE}/chart?symbol=${encodeURIComponent(symbol)}&interval=${config.interval}&range=${config.range}`;
    console.log("📊 Fetching chart data from:", url);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("🔴 Chart fetch error:", res.status, res.statusText);
      return null;
    }
    const prices: number[] = await res.json();
    if (!Array.isArray(prices) || prices.length === 0) {
      console.warn("⚠️ No valid price data returned");
      return null;
    }

    console.log("✅ Chart data loaded:", prices.length, "points");
    return prices;
  } catch (err) {
    console.error("🔴 Failed to fetch time series:", err);
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
  const symbol = SYMBOL_MAP[assetId] ?? assetId;
  if (!symbol) return null;

  const url = `${SERVER_BASE}/quote?symbol=${encodeURIComponent(symbol)}`;
  try {
    console.log("💰 Fetching quote from:", url);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("🔴 Quote fetch error:", res.status, res.statusText);
      return null;
    }
    const quote: QuoteData = await res.json();
    if (!quote?.price) {
      console.warn("⚠️ No valid quote data");
      return null;
    }

    console.log("✅ Quote loaded: $" + quote.price + " (" + quote.change + ")");
    return quote;
  } catch (err) {
    console.error("🔴 Failed to fetch quote:", err);
    return null;
  }
}

export function getYahooSymbol(assetId: string): string | undefined {
  return SYMBOL_MAP[assetId];
}