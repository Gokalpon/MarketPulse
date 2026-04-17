import Queue from 'bull';
import { cacheService } from './cacheService.js';
import { dbService } from './dbService.js';
import { fetchRedditComments } from '../scrapers/redditScraper.js';
import { 
  fetchTradingViewWithPuppeteer, 
  fetchInvestingWithPuppeteer, 
  fetchStockTwitsComments, 
  fetchXTwitterComments 
} from '../scrapers/puppeteerScraper.js';
import pLimit from 'p-limit';

// Create queues
const scraperQueue = new Queue('scraper', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

// AI Summary Logic
async function getAISummary(comments, assetName) {
  const posCount = comments.filter(c => c.sentiment === 'Positive').length;
  const negCount = comments.filter(c => c.sentiment === 'Negative').length;
  const neutralCount = comments.filter(c => c.sentiment === 'Neutral').length;
  
  let sentiment = 'Neutral';
  let score = 50;
  
  if (posCount > negCount * 1.5) {
    sentiment = 'Positive';
    score = 65 + Math.min(posCount * 2, 25);
  } else if (negCount > posCount * 1.5) {
    sentiment = 'Negative';
    score = 35 - Math.min(negCount * 2, 25);
  }

  const summaries = {
    Positive: `${assetName} topluluk duyarlılığı pozitif. ${posCount} yorumda yükseliş beklentisi var. Destek seviyeleri üzerinde duruluyor.`,
    Negative: `${assetName} için piyasa duyarlılığı negatif. ${negCount} yorumda düşüş beklentisi. Satış baskısı ve riskten kaçınma öne çıkıyor.`,
    Neutral: `${assetName} tarafında karışık görüşler. ${neutralCount} yorumda net bir yön yok. Piyasa haber akışını bekliyor.`
  };

  return {
    summary: summaries[sentiment],
    sentiment: sentiment,
    pulseScore: Math.max(0, Math.min(100, score))
  };
}

// Process scraper jobs
scraperQueue.process('scrape-asset', 5, async (job) => { // 5 concurrent workers
  const { assetId, assetName, currentPrice } = job.data;
  
  console.log(`[Queue] Processing ${assetId}...`);
  
  const limit = pLimit(2); // Max 2 concurrent scrapers per job
  
  try {
    // Fetch from all sources with rate limiting
    const [redditComments, tvComments, invComments, stocktwitsComments, xComments] = await Promise.all([
      limit(() => fetchRedditComments(assetId, assetName)),
      limit(() => fetchTradingViewWithPuppeteer(assetId)),
      limit(() => fetchInvestingWithPuppeteer(assetId)),
      limit(() => fetchStockTwitsComments(assetId)),
      limit(() => fetchXTwitterComments(assetId, assetName))
    ]);

    console.log(`[Queue] Fetched for ${assetId}: Reddit=${redditComments.length}, TV=${tvComments.length}, Investing=${invComments.length}, ST=${stocktwitsComments.length}, X=${xComments.length}`);

    // Combine all comments
    let allRaw = [...redditComments, ...tvComments, ...invComments, ...stocktwitsComments, ...xComments];

    // If no real data, use mock
    if (allRaw.length === 0) {
      allRaw = getMockComments(assetId, assetName);
    }

    // Process comments
    const processedComments = allRaw
      .map(c => ({
        ...c,
        priceAtComment: c.priceAtComment || currentPrice,
        verified: !!(c.priceAtComment && c.timestamp)
      }))
      .filter(c => c !== null);

    const aiResult = await getAISummary(processedComments, assetName);
    
    // Categorization
    const categorized = {
      Positive: processedComments.filter(c => c.sentiment === 'Positive'),
      Negative: processedComments.filter(c => c.sentiment === 'Negative'),
      Neutral: processedComments.filter(c => c.sentiment === 'Neutral')
    };

    const calculateAvgPrice = (list) => {
      if (list.length === 0) return 0;
      return list.reduce((acc, c) => acc + (c.priceAtComment || currentPrice), 0) / list.length;
    };

    const result = {
      assetId,
      assetName,
      pulseScore: aiResult.pulseScore,
      sentiment: aiResult.sentiment,
      aiSummary: aiResult.summary,
      categoryStats: {
        bullish: { count: categorized.Positive.length, avgPrice: calculateAvgPrice(categorized.Positive) },
        bearish: { count: categorized.Negative.length, avgPrice: calculateAvgPrice(categorized.Negative) },
        neutral: { count: categorized.Neutral.length, avgPrice: calculateAvgPrice(categorized.Neutral) }
      },
      comments: processedComments.sort((a,b) => b.timestamp - a.timestamp),
      sources: {
        reddit: redditComments.length,
        tradingview: tvComments.length,
        investing: invComments.length,
        stocktwits: stocktwitsComments.length,
        x: xComments.length
      },
      fetchedAt: Date.now()
    };

    // Save to cache (2 hours)
    await cacheService.set(`insight:${assetId}`, result, 7200);
    
    // Save to database
    await dbService.saveInsight(result);

    console.log(`[Queue] Completed ${assetId}`);
    return { success: true, commentCount: processedComments.length };
    
  } catch (error) {
    console.error(`[Queue] Error processing ${assetId}:`, error.message);
    throw error;
  }
});

// Mock comments fallback
function getMockComments(symbol, name) {
  const templates = [
    { text: `${name} için alım vakti gibi duruyor.`, sentiment: "Positive" },
    { text: `${symbol} çok şişti, düzeltme bekliyorum.`, sentiment: "Negative" },
    { text: `Piyasada belirsizlik hakim, izlemedeyim.`, sentiment: "Neutral" }
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `mock_${symbol}_${i}`,
    user: `@User${i}`,
    text: templates[i % templates.length].text,
    likes: Math.floor(Math.random() * 100),
    sentiment: templates[i % templates.length].sentiment,
    source: ['Reddit', 'TradingView', 'Investing'][i % 3],
    timestamp: Date.now() - (i * 3600000),
    priceAtComment: null
  }));
}

// Queue event handlers
scraperQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

scraperQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export const queueService = {
  // Add job to queue
  async enqueueScrape(assetId, assetName, currentPrice) {
    const job = await scraperQueue.add('scrape-asset', {
      assetId,
      assetName,
      currentPrice
    }, {
      jobId: `scrape-${assetId}`, // Deduplication
      removeOnComplete: true
    });
    return job.id;
  },

  // Get job status
  async getJobStatus(jobId) {
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
    return {
      waiting: await scraperQueue.getWaitingCount(),
      active: await scraperQueue.getActiveCount(),
      completed: await scraperQueue.getCompletedCount(),
      failed: await scraperQueue.getFailedCount()
    };
  },

  // Clean old jobs
  async cleanOldJobs() {
    await scraperQueue.clean(24 * 3600 * 1000, 'completed'); // 24 hours
    await scraperQueue.clean(7 * 24 * 3600 * 1000, 'failed'); // 7 days
  }
};

export default queueService;
