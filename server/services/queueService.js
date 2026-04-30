import Queue from 'bull';
import { cacheService } from './cacheService.js';
import { dbService } from './dbService.js';
import { aiService } from './aiService.js';
import { fetchRedditComments } from '../scrapers/redditScraper.js';
import { fetchTradingViewComments } from '../scrapers/tradingviewScraper.js';
import { fetchInvestingComments } from '../scrapers/investingScraper.js';
import {
  fetchStockTwitsComments,
  fetchXTwitterComments
} from '../scrapers/puppeteerScraper.js';
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
      withTimeout(fetchTradingViewComments(assetId), SCRAPE_TIMEOUT, 'TV'),
      withTimeout(fetchInvestingComments(assetId), SCRAPE_TIMEOUT, 'Investing'),
      withTimeout(fetchStockTwitsComments(assetId), SCRAPE_TIMEOUT, 'StockTwits'),
      withTimeout(fetchXTwitterComments(assetId, assetName), SCRAPE_TIMEOUT, 'X')
    ]);

    const redditComments = results[0].status === 'fulfilled' ? results[0].value : [];
    const tvComments = results[1].status === 'fulfilled' ? results[1].value : [];
    const invComments = results[2].status === 'fulfilled' ? results[2].value : [];
    const stocktwitsComments = results[3].status === 'fulfilled' ? results[3].value : [];
    const xComments = results[4].status === 'fulfilled' ? results[4].value : [];

    console.log(`[Worker] Data gathered. Total: ${redditComments.length + tvComments.length + invComments.length + stocktwitsComments.length + xComments.length} comments`);

    let allRaw = [...redditComments, ...tvComments, ...invComments, ...stocktwitsComments, ...xComments];
    if (allRaw.length === 0) {
      console.log(`[Worker] No real community data found for ${assetId}; returning empty comment set.`);
    }

    let chartPoints = [];
    try {
      chartPoints = await withTimeout(fetchChartPoints(assetId, { timeframe: safeTimeframe }), 12000, 'Chart');
    } catch (err) {
      console.warn(`[Worker] Chart binding skipped for ${assetId}: ${err.message}`);
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
        investing: invComments.length,
        stocktwits: stocktwitsComments.length,
        x: xComments.length
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
