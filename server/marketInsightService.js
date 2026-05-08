import pLimit from 'p-limit';
import { fetchRedditComments } from './scrapers/redditScraper.js';
import { fetchStockTwitsComments } from './scrapers/stocktwitsScraper.js';
import { fetchChartPoints, normalizeTimeframe } from './services/chartDataService.js';
import {
  bindCommentsToChart,
  buildCommentClusters,
  calculateCommentPulse,
  getBindingStats
} from './services/commentBindingService.js';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

// AI Summary Logic using Gemini/Local-Heuristics
async function getAISummary(comments, assetName, news = []) {
  const posComments = comments.filter(c => c.sentiment === 'Positive');
  const negComments = comments.filter(c => c.sentiment === 'Negative');
  const neutralComments = comments.filter(c => c.sentiment === 'Neutral');

  const newsContext = news.map(n => n.title).join(' ');

  const posCount = posComments.length;
  const negCount = negComments.length;

  let sentiment = 'Neutral';
  let score = 50;

  if (posCount > negCount * 1.5) {
    sentiment = 'Positive';
    score = 65 + Math.min(posCount * 2, 25);
  } else if (negCount > posCount * 1.5) {
    sentiment = 'Negative';
    score = 35 - Math.min(negCount * 2, 25);
  }

  // --- CHART TRANSLATION ENGINE ---
  // Use AI to extract common themes from each group
  const extractTrend = (group, type) => {
    if (group.length === 0) return type === 'Positive' ? 'Ciddi bir yÃ¼kseliÅ beklentisi gÃ¶zlemlenmiyor.' : 'Net bir baskÄ± bulunmuyor.';

    // Logic: Collect most frequent nouns/verbs or use LLM
    // For now: Smart template based on source and content
    const commonTopics = group.slice(0, 5).map(c => c.text).join(' ');

    if (type === 'Positive') {
      if (commonTopics.includes('destek') || commonTopics.includes('support')) return 'GÃ¼Ã§lÃ¼ destek seviyeleri korunuyor, alÄ±m iÅtahÄ± yÃ¼ksek.';
      if (commonTopics.includes('breakout') || commonTopics.includes('kÄ±rÄ±lÄ±m')) return 'KÄ±sa vadeli direnÃ§lerin kÄ±rÄ±lmasÄ± heyecan yaratmÄ±Å durumda.';
      return 'Topluluk genel olarak yÃ¼kseliÅ trendinin devam edeceÄini dÃ¼ÅÃ¼nÃ¼yor.';
    }

    if (type === 'Negative') {
      if (commonTopics.includes('satÄ±Å') || commonTopics.includes('dump')) return 'KullanÄ±cÄ±lar kÃ¢r satÄ±ÅÄ± ve likidite temizliÄinden endiÅeli.';
      if (commonTopics.includes('direnÃ§') || commonTopics.includes('resistance')) return 'Kritik direnÃ§ bÃ¶lgelerine yaklaÅÄ±lmasÄ± temkinli bir duruÅ sergiletiyor.';
      return 'DÃ¼ÅÃ¼Å yÃ¶nlÃ¼ beklentiler ve belirsizlik hakim.';
    }

    return 'Piyasa yÃ¶n tayin etmek iÃ§in haber akÄ±ÅÄ±nÄ± bekliyor.';
  }

  // GLOBAL INSIGHT: The "Real Fear"
  const getGlobalFearInsight = (allComments, allNews) => {
    const text = allComments.map(c => c.text.toLowerCase()).join(' ') + ' ' + allNews.map(n => n.title.toLowerCase()).join(' ');
    if (text.includes('fed') || text.includes('faiz')) return 'Piyasadaki asÄ±l odak Fed faiz kararÄ± ve makroekonomik veriler.';
    if (text.includes('binance') || text.includes('sec') || text.includes('dava')) return 'RegÃ¼lasyon baskÄ±sÄ± ve yasal sÃ¼reÃ§ler duyarlÄ±lÄ±ÄÄ± etkiliyor.';
    if (text.includes('balina') || text.includes('whale')) return 'BÃ¼yÃ¼k oyuncularÄ±n (balina) hareketleri ve borsa giriÅleri takip ediliyor.';
    if (text.includes('enflasyon') || text.includes('cpi')) return 'Enflasyon verileri ve pazar beklentileri fiyatlama Ã¼zerinde baskÄ± kuruyor.';
    return 'Belirgin bir makro korku yok, teknik seviyeler pazarÄ± yÃ¶netiyor.';
  }

  return {
    summary: {
      positive: extractTrend(posComments, 'Positive'),
      negative: extractTrend(negComments, 'Negative'),
      neutral: extractTrend(neutralComments, 'Neutral'),
      global: getGlobalFearInsight(comments, news)
    },
    mainSummary: sentiment === 'Positive' ? 'Pozitif DuyarlÄ±lÄ±k Hakim' : sentiment === 'Negative' ? 'Negatif BaskÄ± Ãne Ã‡Ä±kÄ±yor' : 'NÃ¶tr / Karar Bekleniyor',
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

  async getAssetInsight(assetId, assetName, currentPrice, timeframe = '1D') {
    const safeTimeframe = normalizeTimeframe(timeframe);
    // Check cache first
    const cacheKey = `${assetId}_${assetName}_${safeTimeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`Using cached data for ${assetId}`);
      return cached.data;
    }

    // Fetch from all sources in parallel with rate limiting
    console.log(`Fetching fresh data for ${assetId}...`);

    const fetchResults = await Promise.allSettled([
      this.limit(() => fetchRedditComments(assetId, assetName)),
      this.limit(() => fetchStockTwitsComments(assetId)),
      this.limit(() => this.fetchMarketNews(assetId))
    ]);

    let redditComments = fetchResults[0].status === 'fulfilled' ? fetchResults[0].value : [];
    let stocktwitsComments = fetchResults[1].status === 'fulfilled' ? fetchResults[1].value : [];
    let newsItems = fetchResults[2].status === 'fulfilled' ? fetchResults[2].value : [];

    let allRaw = [...redditComments, ...stocktwitsComments];
    console.log(`[Insight] Total: Reddit=${redditComments.length}, StockTwits=${stocktwitsComments.length}`);

    if (allRaw.length === 0) {
      console.log('No real community data found; returning empty comment set.');
    }

    let chartPoints = [];
    try {
      chartPoints = await fetchChartPoints(assetId, { timeframe: safeTimeframe });
    } catch (err) {
      console.warn(`[Insight] Chart binding skipped for ${assetId}: ${err.message}`);
    }

    const processedComments = bindCommentsToChart(allRaw, chartPoints, currentPrice);
    const commentClusters = buildCommentClusters(processedComments);
    const bindingStats = getBindingStats(processedComments);
    const pulse = calculateCommentPulse(processedComments);

    const aiResult = await getAISummary(processedComments, assetName, newsItems);

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
      timeframe: safeTimeframe,
      pulseScore: pulse.pulseScore,
      sentiment: pulse.sentiment,
      aiSummary: aiResult.mainSummary,
      categorySummaries: aiResult.summary, // Elite insights added
      categoryStats: {
        bullish: { count: categorized.Positive.length, avgPrice: calculateAvgPrice(categorized.Positive), detail: aiResult.summary.positive },
        bearish: { count: categorized.Negative.length, avgPrice: calculateAvgPrice(categorized.Negative), detail: aiResult.summary.negative },
        neutral: { count: categorized.Neutral.length, avgPrice: calculateAvgPrice(categorized.Neutral), detail: aiResult.summary.neutral }
      },
      comments: processedComments.sort((a,b) => b.timestamp - a.timestamp).slice(0, 50),
      commentClusters,
      bindingStats,
      news: newsItems,
      sources: {
        reddit: redditComments.length,
        stocktwits: stocktwitsComments.length,
        news: newsItems.length,
      },
      fetchedAt: Date.now()
    };

    // Cache the result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  async fetchMarketNews(symbol) {
    try {
      console.log(`[News] Fetching official news for ${symbol}...`);
      const cleanSymbol = symbol.split('-')[0]; // Standardize for Yahoo search
      const results = await yahooFinance.search(cleanSymbol, { newsCount: 5 });
      return (results.news || []).map(n => ({
        title: n.title,
        link: n.link,
        publisher: n.publisher,
        timestamp: n.providerPublishTime ? n.providerPublishTime * 1000 : Date.now(),
        type: 'news'
      }));
    } catch (err) {
      console.warn(`[News] Failed to fetch news for ${symbol}: ${err.message}`);
      return [];
    }
  }

}

export const marketInsights = new MarketDataService();
