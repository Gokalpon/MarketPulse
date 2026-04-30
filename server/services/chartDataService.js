import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const SYMBOL_MAP = {
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  SOL: "SOL-USD",
  ADA: "ADA-USD",
  DOT: "DOT-USD",
  LINK: "LINK-USD",
  AVAX: "AVAX-USD",
  XRP: "XRP-USD",
  NASDAQ: "QQQ",
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

const RANGE_MS = {
  "1h": 1 * 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "1d": 1 * 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "14d": 14 * 24 * 60 * 60 * 1000,
  "1wk": 7 * 24 * 60 * 60 * 1000,
  "1mo": 30 * 24 * 60 * 60 * 1000,
  "3mo": 90 * 24 * 60 * 60 * 1000,
  "6mo": 182 * 24 * 60 * 60 * 1000,
  "1y": 365 * 24 * 60 * 60 * 1000,
  "2y": 2 * 365 * 24 * 60 * 60 * 1000,
  "5y": 5 * 365 * 24 * 60 * 60 * 1000,
  "10y": 10 * 365 * 24 * 60 * 60 * 1000,
};

const TIMEFRAME_MAP = {
  "1H": { interval: "5m", range: "1h" },
  "4H": { interval: "30m", range: "4h" },
  "1D": { interval: "15m", range: "1d" },
  "3D": { interval: "1h", range: "3d" },
  "1W": { interval: "1h", range: "1wk" },
  "2W": { interval: "1d", range: "14d" },
  "1M": { interval: "1d", range: "1mo" },
  "3M": { interval: "1d", range: "3mo" },
  "6M": { interval: "1wk", range: "6mo" },
  "1Y": { interval: "1wk", range: "1y" },
  "2Y": { interval: "1mo", range: "2y" },
  "5Y": { interval: "1mo", range: "5y" },
  ALL: { interval: "1mo", range: "10y" },
};

export function normalizeTimeframe(timeframe = "1D") {
  return TIMEFRAME_MAP[timeframe] ? timeframe : "1D";
}

export function mapAssetToYahooSymbol(assetId = "") {
  const normalized = String(assetId).trim().toUpperCase();
  return SYMBOL_MAP[normalized] || assetId;
}

export function getTimeframeConfig(timeframe = "1D") {
  return TIMEFRAME_MAP[normalizeTimeframe(timeframe)];
}

export async function fetchChartPoints(symbolOrAsset, options = {}) {
  const timeframeConfig = getTimeframeConfig(options.timeframe);
  const interval = options.interval || timeframeConfig.interval;
  const range = options.range || timeframeConfig.range;
  const symbol = mapAssetToYahooSymbol(symbolOrAsset);

  const now = new Date();
  const period1 = new Date(now.getTime() - (RANGE_MS[range] || RANGE_MS["1d"]));
  const result = await yahooFinance.chart(symbol, {
    period1,
    period2: now,
    interval,
  });

  return (result?.quotes || [])
    .map((q) => {
      const close = q.close ?? q.open ?? null;
      const timestamp = q.date instanceof Date ? q.date.getTime() : new Date(q.date).getTime();
      if (close === null || Number.isNaN(close) || !Number.isFinite(timestamp)) return null;

      return {
        timestamp,
        price: Number(close),
        open: Number(q.open ?? close),
        high: Number(q.high ?? close),
        low: Number(q.low ?? close),
        close: Number(close),
        volume: Number(q.volume ?? 0),
      };
    })
    .filter(Boolean)
    .map((point, index) => ({ ...point, index }));
}
