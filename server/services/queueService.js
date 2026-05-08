import Queue from 'bull';
import { cacheService } from './cacheService.js';
import { dbService } from './dbService.js';
import { aiService } from './aiService.js';
import { fetchRedditComments } from '../scrapers/redditScraper.js';
import { fetchTradingViewComments } from '../scrapers/tradingviewScraper.js';
import { fetchStockTwitsComments } from '../scrapers/stocktwitsScraper.js';
import { fetchChartPoints, normalizeTimeframe } from './chartDataService.js';
import {
  bindCommentsToChart,
  buildCommentClusters,
  calculateCommentPulse,
  getBindingStats
} from './commentBindingService.js';
// Create queue or in-memory fallback
let scraperQueue = null;
let useRedis = false;
const shouldUseRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);
const memoryJobs = new Map();

try {
  if (!shouldUseRedis) {
    throw new Error('REDIS_HOST not configured');
  }

  scraperQueue = new Queue('scraper', process.env.REDIS_URL || {
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 1
    },
    defaultJobOptions: {
      attempts: 2,
      removeOnComplete: 100
    }
  });

  scraperQueue.on('error', () => {
    console.warn('[Queue] Redis not reachable, falling back to in-memory processing.');
    useRedis = false;
  });

  useRedis = true;
  console.log('[Queue] Redis connection initialized.');
} catch (e) {
  console.warn('[Queue] Redis not configured, using in-memory worker.');
  useRedis = false;
}

// Helper for timeouts
const withTimeout = (promise, ms, name) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timed out`)), ms))
  ]);
};

// Processor Function (extracted to reuse in both Bull and memory worker)
async function processScrapeJob(data) {
  const { assetId, assetName, currentPrice, timeframe = '1D' } = data;
  const safeTimeframe = normalizeTimeframe(timeframe);
  console.log(`[Worker] 🚀 Starting Super-Fast Analysis for ${assetId}...`);

  try {
    const SCRAPE_TIMEOUT = 25000; // 25s max per source

    const results = await Promise.allSettled([
      withTimeout(fetchRedditComments(assetId, assetName), SCRAPE_TIMEOUT, 'Reddit'),
      withTimeout(fetchTradingViewComments(assetId), SCRAPE_TIMEOUT, 'TradingView'),
      withTimeout(fetchStockTwitsComments(assetId), SCRAPE_TIMEOUT, 'StockTwits'),
    ]);

    const redditComments = results[0].status === 'fulfilled' ? results[0].value : [];
    const tvComments = results[1].status === 'fulfilled' ? results[1].value : [];
    const stocktwitsComments = results[2].status === 'fulfilled' ? results[2].value : [];

    console.log(`[Worker] Data gathered. Reddit: ${redditComments.length}, TradingView: ${tvComments.length}, StockTwits: ${stocktwitsComments.length}`);

    let allRaw = [...redditComments, ...tvComments, ...stocktwitsComments];
    if (allRaw.length === 0) {
      console.log(`[Worker] No real community data found for ${assetId}; injecting synthetic sentiment markers.`);
    }

    let chartPoints = [];
    try {
      chartPoints = await withTimeout(fetchChartPoints(assetId, { timeframe: safeTimeframe }), 12000, 'Chart');
    } catch (err) {
      console.warn(`[Worker] Chart binding skipped for ${assetId}: ${err.message}`);
    }

    // Synthetic fallback: if Yahoo failed, build a flat 20-point series so comments still bind.
    if ((!chartPoints || chartPoints.length === 0) && currentPrice > 0) {
      const now = Date.now();
      chartPoints = Array.from({ length: 20 }, (_, i) => ({
        index: i,
        timestamp: now - (19 - i) * 60 * 60 * 1000,
        price: currentPrice,
        open: currentPrice, high: currentPrice, low: currentPrice, close: currentPrice, volume: 0,
      }));
      console.log(`[Worker] Using synthetic chart points (Yahoo unavailable) for ${assetId}`);
    }

    // If scrapers returned nothing, inject synthetic price-action markers so the chart always has clusters.
    if (allRaw.length === 0 && chartPoints.length > 0) {
      const first = chartPoints[0];
      const last = chartPoints[chartPoints.length - 1];
      const mid = chartPoints[Math.floor(chartPoints.length / 2)];
      const priceChange = ((last.price - first.price) / (first.price || 1)) * 100;
      const trend = priceChange > 1.5 ? 'Positive' : priceChange < -1.5 ? 'Negative' : 'Neutral';
      const trendWord = trend === 'Positive' ? 'bullish' : trend === 'Negative' ? 'bearish' : 'neutral';
      const now = Date.now();
      allRaw = [
        {
          id: `pulse_start_${assetId}`,
          user: 'MarketPulse',
          text: `${assetName} opened the session at $${first.price.toFixed(2)}. Market pulse tracking initiated.`,
          sentiment: 'Neutral',
          source: 'Web',
          timestamp: first.timestamp || now,
          targetTimestamp: first.timestamp || now,
          likes: 0,
        },
        {
          id: `pulse_mid_${assetId}`,
          user: 'MarketPulse',
          text: `${assetName} mid-session sentiment is ${trendWord}. Price at $${mid.price.toFixed(2)}.`,
          sentiment: trend,
          source: 'Web',
          timestamp: mid.timestamp || now,
          targetTimestamp: mid.timestamp || now,
          likes: 0,
        },
        {
          id: `pulse_latest_${assetId}`,
          user: 'MarketPulse',
          text: `${assetName} latest price $${last.price.toFixed(2)}. ${Math.abs(priceChange).toFixed(2)}% ${priceChange >= 0 ? 'gain' : 'loss'} over the period. Community data unavailable.`,
          sentiment: trend,
          source: 'Web',
          timestamp: last.timestamp || now,
          targetTimestamp: last.timestamp || now,
          likes: 0,
        },
      ];
      console.log(`[Worker] Injected 3 synthetic sentiment markers for ${assetId}`);
    }

    const processedComments = bindCommentsToChart(allRaw, chartPoints, currentPrice);
    const commentClusters = buildCommentClusters(processedComments);
    const bindingStats = getBindingStats(processedComments);
    const pulse = calculateCommentPulse(processedComments);

    const aiAnalysis = await aiService.generateMarketSummary(processedComments, assetName, currentPrice);

    const categorized = {
      Positive: processedComments.filter(c => c.sentiment === 'Positive'),
      Negative: processedComments.filter(c => c.sentiment === 'Negative'),
      Neutral: processedComments.filter(c => c.sentiment === 'Neutral')
    };

    const calculateAvgPrice = (list) => {
      if (list.length === 0) return 0;
      return list.reduce((acc, c) => acc + (c.priceAtComment || currentPrice), 0) / list.length;
    };

    const finalResult = {
      assetId,
      assetName,
      timeframe: safeTimeframe,
      pulseScore: pulse.pulseScore,
      sentiment: pulse.sentiment,
      aiSummary: aiAnalysis.mainSummary,
      categorySummaries: aiAnalysis.summary,
      globalInsight: aiAnalysis.globalInsight,
      categoryStats: {
        bullish: { count: categorized.Positive.length, avgPrice: calculateAvgPrice(categorized.Positive) },
        bearish: { count: categorized.Negative.length, avgPrice: calculateAvgPrice(categorized.Negative) },
        neutral: { count: categorized.Neutral.length, avgPrice: calculateAvgPrice(categorized.Neutral) }
      },
      comments: processedComments.sort((a,b) => b.timestamp - a.timestamp).slice(0,50),
      commentClusters,
      bindingStats,
      sources: {
        reddit: redditComments.length,
        tradingview: tvComments.length,
        stocktwits: stocktwitsComments.length,
      },
      fetchedAt: Date.now()
    };

    await cacheService.set(`insight:${assetId}:${safeTimeframe}`, finalResult, 7200);
    await dbService.saveInsight(finalResult);

    console.log(`[Worker] ✅ Completed ${assetId}`);
    return finalResult;
  } catch (err) {
    console.error(`[Worker] ❌ Error ${assetId}:`, err.message);
    throw err;
  }
}

// Attach Bull processor if using Redis
if (useRedis && scraperQueue) {
  scraperQueue.process('scrape-asset', 2, (job) => processScrapeJob(job.data));
}
// Queue event handlers
if (scraperQueue) {
  scraperQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  scraperQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });
}

export const queueService = {
  // Add job to queue
  async enqueueScrape(assetId, assetName, currentPrice, timeframe = '1D') {
    const safeTimeframe = normalizeTimeframe(timeframe);
    const memoryJobId = `scrape-${assetId}-${safeTimeframe}`;
    if (!useRedis) {
      if (memoryJobs.has(memoryJobId)) {
        console.log(`[Queue] Reusing in-memory job ${memoryJobId}`);
        return memoryJobId;
      }

      console.log(`[Queue] No Redis. Executing ${assetId} immediately in background...`);
      // Run in background without awaiting to simulate a queue
      const job = processScrapeJob({ assetId, assetName, currentPrice, timeframe: safeTimeframe })
        .catch(console.error)
        .finally(() => memoryJobs.delete(memoryJobId));
      memoryJobs.set(memoryJobId, job);
      return memoryJobId;
    }

    const job = await scraperQueue.add('scrape-asset', {
      assetId,
      assetName,
      currentPrice,
      timeframe: safeTimeframe
    }, {
      jobId: `scrape-${assetId}-${safeTimeframe}`, // Deduplication
      removeOnComplete: true
    });
    return job.id;
  },

  // Get job status
  async getJobStatus(jobId) {
    if (memoryJobs.has(jobId)) {
      return {
        id: jobId,
        state: 'processing',
        progress: 0,
        attempts: 1,
        mode: 'memory'
      };
    }
    if (!scraperQueue) return null;
    const job = await scraperQueue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress,
      attempts: job.attemptsMade
    };
  },

  // Get queue stats
  async getStats() {
    if (!scraperQueue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        mode: 'memory'
      };
    }
    return {
      waiting: await scraperQueue.getWaitingCount(),
      active: await scraperQueue.getActiveCount(),
      completed: await scraperQueue.getCompletedCount(),
      failed: await scraperQueue.getFailedCount()
    };
  },

  // Clean old jobs
  async cleanOldJobs() {
    if (!scraperQueue) return;
    await scraperQueue.clean(24 * 3600 * 1000, 'completed'); // 24 hours
    await scraperQueue.clean(7 * 24 * 3600 * 1000, 'failed'); // 7 days
  }
};

export default queueService;
