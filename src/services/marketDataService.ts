import { QuoteDataSchema, TimeSeriesSchema, SearchQuoteSchema, MarketInsightSchema, safeParse } from '@/schemas/marketSchemas';
import { toast } from 'sonner';

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
  "4H":  { interval: "30m",  range: "4h" },
  "1D":  { interval: "15m",  range: "1d"  },
  "3D":  { interval: "1h",   range: "3d" },
  "1W":  { interval: "1h",   range: "1wk" },
  "2W":  { interval: "1d",   range: "14d" },
  "1M":  { interval: "1d",   range: "1mo" },
  "3M":  { interval: "1d",   range: "3mo" },
  "6M":  { interval: "1wk",  range: "6mo" },
  "1Y":  { interval: "1wk",  range: "1y"  },
  "2Y":  { interval: "1mo",  range: "2y"  },
  "5Y":  { interval: "1mo",  range: "5y"  },
  "ALL": { interval: "1mo",  range: "10y" },
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
    
    if (!res.ok) {
      toast.error(`Veri yüklenemedi: ${res.status}`);
      return null;
    }
    
    const rawData: unknown = await res.json();
    const result = safeParse(TimeSeriesSchema, rawData);
    
    if (result.success === false) {
      console.error('TimeSeries validation error:', result.error);
      toast.error('Geçersiz veri formatı');
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('fetchTimeSeries error:', error);
    toast.error('Bağlantı hatası. Tekrar deneyin.');
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
    
    if (!res.ok) {
      toast.error(`Fiyat verisi yüklenemedi: ${res.status}`);
      return null;
    }
    
    const rawData: unknown = await res.json();
    const result = safeParse(QuoteDataSchema, rawData);
    
    if (result.success === false) {
      console.error('Quote validation error:', result.error);
      toast.error('Geçersiz fiyat formatı');
      return null;
    }
    
    return result.data as QuoteData;
  } catch (error) {
    console.error('fetchQuote error:', error);
    toast.error('Bağlantı hatası. Tekrar deneyin.');
    return null;
  }
}

export interface MarketInsight {
  assetId: string;
  assetName: string;
  pulseScore: number;
  sentiment: "Positive" | "Negative" | "Neutral";
  aiSummary: string;
  categoryStats?: {
    bullish: { count: number; avgPrice: number };
    bearish: { count: number; avgPrice: number };
    neutral: { count: number; avgPrice: number };
  };
  comments: {
    id: string;
    user: string;
    text: string;
    likes: number;
    sentiment: "Positive" | "Negative" | "Neutral";
    source: string;
    timestamp: number;
    priceAtComment?: number;
  }[];
}

export async function fetchMarketInsights(assetId: string, assetName: string, price: number): Promise<MarketInsight | null> {
  try {
    const url = `${SERVER_BASE}/insights?symbol=${encodeURIComponent(assetId)}&name=${encodeURIComponent(assetName)}&price=${price}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      toast.error('AI analizi yüklenemedi');
      return null;
    }
    
    const rawData: unknown = await res.json();
    const result = safeParse(MarketInsightSchema, rawData);
    
    if (result.success === false) {
      console.error('MarketInsight validation error:', result.error);
      toast.error('Geçersiz analiz formatı');
      return null;
    }
    
    return result.data as MarketInsight;
  } catch (error) {
    console.error('fetchMarketInsights error:', error);
    toast.error('Analiz bağlantı hatası');
    return null;
  }
}

export function getYahooSymbol(assetId: string): string | undefined {
  return SYMBOL_MAP[assetId];
}