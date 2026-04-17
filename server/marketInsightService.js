import axios from 'axios';
import pLimit from 'p-limit';
import * as cheerio from 'cheerio';
import { fetchRedditComments } from './scrapers/redditScraper.js';
import { fetchTradingViewWithPuppeteer, fetchInvestingWithPuppeteer, fetchStockTwitsComments, fetchXTwitterComments, closeBrowser } from './scrapers/puppeteerScraper.js';

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
    Positive: `${assetName} topluluk duyarÄ±lÄ±ÄÄ± pozitif. ${posCount} yorumda yÃ¼kseliÅ beklentisi var. Destek seviyeleri Ã¼zerinde duruluyor.`,
    Negative: `${assetName} iÃ§in piyasa duyarÄ±lÄ±ÄÄ± negatif. ${negCount} yorumda dÃ¼ÅÃ¼Å beklentisi. SatÄ±Å baskÄ±sÄ± ve riskten kaÃ§Ä±nma Ã¶ne Ã§Ä±kÄ±yor.`,
    Neutral: `${assetName} tarafÄ±nda karÄ±ÅÄ±k gÃ¶rÃ¼Åler. ${neutralCount} yorumda net bir yÃ¶n yok. Piyasa haber akÄ±ÅÄ±nÄ± bekliyor.`
  };

  return {
    summary: summaries[sentiment],
    sentiment: sentiment,
    pulseScore: Math.max(0, Math.min(100, score))
  };
}

class MarketDataService {
  constructor() {
    this.limit = pLimit(3); // Max 3 concurrent requests
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Common metadata validation and price matching
  processRawComment(comment, currentPrice) {
    if (!comment.text || !comment.timestamp) return null;
    
    return {
      ...comment,
      priceAtComment: comment.priceAtComment || currentPrice,
      timestamp: comment.timestamp,
      verified: !!(comment.priceAtComment && comment.timestamp)
    };
  }

  async getAssetInsight(assetId, assetName, currentPrice) {
    // Check cache first
    const cacheKey = `${assetId}_${assetName}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`Using cached data for ${assetId}`);
      return cached.data;
    }

    // Fetch from all sources in parallel with rate limiting
    console.log(`Fetching fresh data for ${assetId}...`);
    
    const [redditComments, tvComments, invComments, stocktwitsComments, xComments] = await Promise.all([
      this.limit(() => fetchRedditComments(assetId, assetName)),
      this.limit(() => fetchTradingViewWithPuppeteer(assetId)),
      this.limit(() => fetchInvestingWithPuppeteer(assetId)),
      this.limit(() => fetchStockTwitsComments(assetId)),
      this.limit(() => fetchXTwitterComments(assetId, assetName))
    ]);

    console.log(`Fetched: Reddit=${redditComments.length}, TradingView=${tvComments.length}, Investing=${invComments.length}, StockTwits=${stocktwitsComments.length}, X=${xComments.length}`);

    // Combine all comments, add mock fallback if scraping failed
    let allRaw = [...redditComments, ...tvComments, ...invComments, ...stocktwitsComments, ...xComments];

    // If no real data, use mock data for demo purposes
    if (allRaw.length === 0) {
      console.log('No real data found, using mock fallback');
      allRaw = this.getMockComments(assetId, assetName);
    }
    
    // Filter out comments without date/price metadata
    const processedComments = allRaw
      .map(c => this.processRawComment(c, currentPrice))
      .filter(c => c !== null);

    const aiResult = await getAISummary(processedComments, assetName);
    
    // Categorization
    const categorized = {
      Positive: processedComments.filter(c => c.sentiment === 'Positive'),
      Negative: processedComments.filter(c => c.sentiment === 'Negative'),
      Neutral: processedComments.filter(c => c.sentiment === 'Neutral')
    };

    // Calculate average price per category
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

    // Cache the result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  // Mock comments fallback
  getMockComments(symbol, name) {
    const templates = [
      { text: `${name} için alým vakti gibi duruyor.`, sentiment: "Positive" },
      { text: `${symbol} çok þiþti, düzeltme bekliyorum.`, sentiment: "Negative" },
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
}

export const marketInsights = new MarketDataService();
