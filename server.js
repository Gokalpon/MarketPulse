import express from "express";
import cors from "cors";
import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });
const app = express();
const PORT = 3001;

// Range string → milliseconds ago
const RANGE_MS = {
  "1h":  1 * 60 * 60 * 1000,
  "4h":  4 * 60 * 60 * 1000,
  "1d":  1 * 24 * 60 * 60 * 1000,
  "3d":  3 * 24 * 60 * 60 * 1000,
  "1wk": 7 * 24 * 60 * 60 * 1000,
  "14d": 14 * 24 * 60 * 60 * 1000,
  "1mo": 30 * 24 * 60 * 60 * 1000,
  "3mo": 90 * 24 * 60 * 60 * 1000,
  "6mo": 180 * 24 * 60 * 60 * 1000,
  "1y":  365 * 24 * 60 * 60 * 1000,
  "2y":  2 * 365 * 24 * 60 * 60 * 1000,
  "5y":  5 * 365 * 24 * 60 * 60 * 1000,
  "10y": 10 * 365 * 24 * 60 * 60 * 1000,
};

app.use(cors());
app.use(express.json());

// GET /api/market/chart?symbol=BTC-USD&interval=15m&range=1d
app.get("/api/market/chart", async (req, res) => {
  const { symbol, interval, range } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const now = new Date();
    const ms = RANGE_MS[range] || RANGE_MS["1d"];
    const period1 = new Date(now - ms);

    const result = await yahooFinance.chart(symbol, {
      period1,
      period2: now,
      interval: interval || "15m",
    });

    const quotes = result?.quotes || [];
    const prices = quotes
      .map((q) => q.close ?? q.open ?? null)
      .filter((p) => p !== null && !isNaN(p));

    res.json(prices);
  } catch (err) {
    console.error(`Chart error [${symbol}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/market/quote?symbol=BTC-USD
app.get("/api/market/quote", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const quote = await yahooFinance.quote(symbol);

    const price = quote.regularMarketPrice ?? 0;
    const prevClose = quote.regularMarketPreviousClose ?? price;
    const changePercent = prevClose
      ? ((price - prevClose) / prevClose) * 100
      : 0;
    const isUp = changePercent >= 0;

    const formatVolume = (v) => {
      if (!v) return "N/A";
      if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
      if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(2) + "K";
      return v.toString();
    };

    res.json({
      price,
      change: (isUp ? "+" : "") + changePercent.toFixed(2) + "%",
      changePercent,
      isUp,
      high: quote.regularMarketDayHigh ?? price,
      low: quote.regularMarketDayLow ?? price,
      volume: formatVolume(quote.regularMarketVolume),
    });
  } catch (err) {
    console.error(`Quote error [${symbol}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/market/search?q=OYAKC
app.get("/api/market/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q required" });

  try {
    const result = await yahooFinance.search(q);
    const quotes = (result?.quotes || [])
      .filter((r) => r.isYahooFinance && r.symbol)
      .slice(0, 10)
      .map((r) => ({
        symbol: r.symbol,
        shortname: r.shortname || r.longname || r.symbol,
        longname: r.longname,
        quoteType: r.quoteType,
        exchange: r.exchDisp || r.exchange,
      }));
    res.json(quotes);
  } catch (err) {
    console.error(`Search error [${q}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MarketPulse backend running on http://localhost:${PORT}`);
});
