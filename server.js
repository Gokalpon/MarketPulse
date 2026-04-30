import express from "express";
import cors from "cors";
import YahooFinanceClass from "yahoo-finance2";
import { cacheService } from "./server/services/cacheService.js";
import { dbService, initDatabase } from "./server/services/dbService.js";
import { queueService } from "./server/services/queueService.js";
import { fetchChartPoints, normalizeTimeframe } from "./server/services/chartDataService.js";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });
const app = express();
const PORT = 3001;

// Initialize database on startup
initDatabase().catch(console.error);

app.use(cors());
app.use(express.json());

// GET /api/market/chart?symbol=BTC-USD&interval=15m&range=1d
app.get("/api/market/chart", async (req, res) => {
  const { symbol, interval, range, format } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const points = await fetchChartPoints(symbol, { interval, range });
    res.json(format === "points" ? points : points.map((point) => point.price));
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
    const { symbol, name, price, force } = req.query;
    if (!symbol) return res.status(400).json({ error: "symbol required" });

    try {
      const timeframe = normalizeTimeframe(req.query.timeframe || "1D");
      const cacheKey = `insight:${symbol}:${timeframe}`;
      const isForce = force === 'true';
      const currentPrice = parseFloat(price) || 0;

      // 1. Try Cache (unless force refresh)
      if (!isForce) {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          const data = cached.data || cached;
          const cachedAt = cached.cachedAt || data.fetchedAt || Date.now();
          const age = (Date.now() - cachedAt) / 1000;

          if (age < 1800) {
            console.log(`[API] Cache hit for ${symbol} (age: ${age.toFixed(0)}s)`);
            return res.json(data);
          }

          // If stale, return cached but trig refresh
          console.log(`[API] Stale cache for ${symbol}, triggering background refresh...`);
          queueService.enqueueScrape(symbol, name || symbol, currentPrice, timeframe).catch(err => {
            console.error(`[API] Queue error for ${symbol}:`, err.message);
          });
          return res.json(data);
        }
      } else {
        console.log(`[API] Force refresh requested for ${symbol}/${timeframe}, bypassing cache...`);
      }

    // 2. Try Database
    const dbData = await dbService.getInsight(symbol, timeframe);
    if (dbData) {
      console.log(`[API] DB hit for ${symbol}/${timeframe}`);
      await cacheService.set(cacheKey, dbData, 7200);
      return res.json(dbData);
    }

    // 3. Queue for scraping
    console.log(`[API] No data found for ${symbol}/${timeframe}, triggering scrape...`);
    await queueService.enqueueScrape(symbol, name || symbol, currentPrice, timeframe);

    res.status(202).json({
      status: "pending",
      message: "Analiz hazırlanıyor...",
      assetId: symbol
    });

  } catch (err) {
    console.error(`[API] Insight error [${symbol}], falling back to on-demand scrape:`, err.message);
    // Even if DB/Cache fails, trigger a scrape so the user eventually gets data
    queueService.enqueueScrape(symbol, name || symbol, parseFloat(price) || 0, normalizeTimeframe(req.query.timeframe || "1D")).catch(() => {});

    res.status(202).json({
      status: "pending",
      message: "Veritabanı hatası gideriliyor, analiz sıraya alındı...",
      assetId: symbol,
      isFallback: true
    });
  }
});

// GET /api/market/insights/status?symbol=BTC
app.get("/api/market/insights/status", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const timeframe = normalizeTimeframe(req.query.timeframe || "1D");
    // Check cache
    const cached = await cacheService.get(`insight:${symbol}:${timeframe}`);
    if (cached) {
      return res.json({ status: 'ready', data: cached.data });
    }

    // Check if job is in queue
    const jobId = `scrape-${symbol}-${timeframe}`;
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

// GET /api/health - Monitor server & DB health
app.get("/api/health", async (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.json({
    status: 'healthy',
    mode: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
    },
    services: {
      api: 'online',
      db: 'connected' // Database is checked on init
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`MarketPulse backend running on http://localhost:${PORT}`);
});
