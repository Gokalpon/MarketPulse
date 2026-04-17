import express from "express";
import cors from "cors";
import YahooFinanceClass from "yahoo-finance2";
import { cacheService } from "./server/services/cacheService.js";
import { dbService, initDatabase } from "./server/services/dbService.js";
import { queueService } from "./server/services/queueService.js";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });
const app = express();
const PORT = 3001;

// Initialize database on startup
initDatabase().catch(console.error);

// Range string → milliseconds ago
const RANGE_MS = {
  "1h":  1 * 60 * 60 * 1000,
  "1d":  1 * 24 * 60 * 60 * 1000,
  "1wk": 7 * 24 * 60 * 60 * 1000,
  "1mo": 30 * 24 * 60 * 60 * 1000,
  "1y":  365 * 24 * 60 * 60 * 1000,
  "5y":  5 * 365 * 24 * 60 * 60 * 1000,
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

// GET /api/market/insights?symbol=BTC&name=Bitcoin&price=45000
// SCALABLE: Uses cache → db → queue fallback
app.get("/api/market/insights", async (req, res) => {
  const { symbol, name, price } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const cacheKey = `insight:${symbol}`;
    const currentPrice = parseFloat(price) || 0;
    
    // 1. Try Redis cache (fastest)
    const cached = await cacheService.get(cacheKey);
    if (cached && cached.data) {
      const age = (Date.now() - cached.cachedAt) / 1000;
      console.log(`[API] Cache hit for ${symbol} (age: ${age.toFixed(0)}s)`);
      
      // If cache is fresh (< 30 min), return immediately
      if (age < 1800) {
        return res.json(cached.data);
      }
      
      // If cache is stale, trigger background refresh
      queueService.enqueueScrape(symbol, name || symbol, currentPrice).catch(console.error);
      return res.json(cached.data);
    }
    
    // 2. Try Database (persistent)
    const dbData = await dbService.getInsight(symbol, 2); // Max 2 hours old
    if (dbData) {
      console.log(`[API] Database hit for ${symbol}`);
      
      // Refresh cache
      await cacheService.set(cacheKey, dbData, 7200);
      
      // Trigger background refresh if stale
      if (!dbData.fromDatabase) {
        queueService.enqueueScrape(symbol, name || symbol, currentPrice).catch(console.error);
      }
      
      return res.json(dbData);
    }
    
    // 3. Queue for scraping (async)
    console.log(`[API] Queueing scrape for ${symbol}`);
    await queueService.enqueueScrape(symbol, name || symbol, currentPrice);
    
    // Return 202 Accepted with status
    res.status(202).json({
      status: 'pending',
      message: 'Data is being fetched. Please retry in 10-30 seconds.',
      assetId: symbol,
      checkUrl: `/api/market/insights/status?symbol=${symbol}`
    });
    
  } catch (err) {
    console.error(`[API] Insight error [${symbol}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/market/insights/status?symbol=BTC
app.get("/api/market/insights/status", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  
  try {
    // Check cache
    const cached = await cacheService.get(`insight:${symbol}`);
    if (cached) {
      return res.json({ status: 'ready', data: cached.data });
    }
    
    // Check if job is in queue
    const jobId = `scrape-${symbol}`;
    const jobStatus = await queueService.getJobStatus(jobId);
    
    res.json({
      status: jobStatus ? 'processing' : 'unknown',
      jobStatus,
      message: jobStatus ? 'Data is being fetched' : 'No active job found'
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/queue/stats - Queue health check
app.get("/api/queue/stats", async (req, res) => {
  try {
    const stats = await queueService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cache/clear - Admin endpoint to clear cache
app.post("/api/cache/clear", async (req, res) => {
  try {
    // This would need authentication in production
    const keys = req.body.keys || [];
    for (const key of keys) {
      await cacheService.del(key);
    }
    res.json({ cleared: keys.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MarketPulse backend running on http://localhost:${PORT}`);
});
