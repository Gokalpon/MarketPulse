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
    const res = await fetch(url);
    if (!res.ok) return null;
    const prices: number[] = await res.json();
    if (!Array.isArray(prices) || prices.length === 0) return null;
    return prices;
  } catch {
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
    const res = await fetch(url);
    if (!res.ok) return null;
    const quote: QuoteData = await res.json();
    if (!quote?.price) return null;
    return quote;
  } catch {
    return null;
  }
}

export function getYahooSymbol(assetId: string): string | undefined {
  return SYMBOL_MAP[assetId];
}