import * as cheerio from 'cheerio';
import { networkService } from '../services/networkService.js';

// Known direct URL slugs for popular assets (avoids CF-blocked search page)
const INVESTING_SLUGS = {
  // Crypto
  'BTC':      { path: 'crypto/bitcoin/bitcoin-usd',          type: 'crypto' },
  'BTC-USD':  { path: 'crypto/bitcoin/bitcoin-usd',          type: 'crypto' },
  'ETH':      { path: 'crypto/ethereum/eth-usd',             type: 'crypto' },
  'ETH-USD':  { path: 'crypto/ethereum/eth-usd',             type: 'crypto' },
  'SOL':      { path: 'crypto/solana/sol-usd',               type: 'crypto' },
  'ADA':      { path: 'crypto/cardano/ada-usd',              type: 'crypto' },
  'XRP':      { path: 'crypto/xrp/xrp-usd',                  type: 'crypto' },
  'AVAX':     { path: 'crypto/avalanche/avax-usd',           type: 'crypto' },
  'DOT':      { path: 'crypto/polkadot-new/dot-usd',         type: 'crypto' },
  'LINK':     { path: 'crypto/chainlink/link-usd',           type: 'crypto' },
  // Stocks
  'AAPL':     { path: 'equities/apple-computer-inc',         type: 'stock' },
  'MSFT':     { path: 'equities/microsoft-corp',             type: 'stock' },
  'GOOGL':    { path: 'equities/alphabet-inc-a',             type: 'stock' },
  'AMZN':     { path: 'equities/amazon-com-inc',             type: 'stock' },
  'META':     { path: 'equities/meta-platforms-inc',         type: 'stock' },
  'NVDA':     { path: 'equities/nvidia-corp',                type: 'stock' },
  'TSLA':     { path: 'equities/tesla-motors',               type: 'stock' },
  'AMD':      { path: 'equities/adv-micro-device',           type: 'stock' },
  'NFLX':     { path: 'equities/netflix-inc',                type: 'stock' },
  // Commodities
  'GOLD':     { path: 'commodities/gold',                    type: 'commodity' },
  'SILVER':   { path: 'commodities/silver',                  type: 'commodity' },
  'OIL':      { path: 'commodities/crude-oil',               type: 'commodity' },
};

export async function fetchInvestingComments(symbol) {
  const entry = INVESTING_SLUGS[symbol];

  if (entry) {
    // Fast path: use pre-mapped URL
    const comments = await scrapeOpinionPage(entry.path, symbol);
    if (comments.length > 0) return comments;
    // Fallback to commentary page variant
    const comments2 = await scrapeOpinionPage(entry.path + '-commentary', symbol);
    if (comments2.length > 0) return comments2;
  }

  // Slow path for unknown symbols: try Investing search
  return await searchAndScrape(symbol);
}

async function scrapeOpinionPage(path, symbol) {
  const url = `https://www.investing.com/${path}`;
  try {
    const response = await networkService.fetch(url, {
      timeout: 10000,
      headers: {
        'Referer': 'https://www.investing.com/',
        'Origin': 'https://www.investing.com',
      },
    });

    const $ = cheerio.load(response.data);
    const comments = [];

    // Try multiple possible comment selectors (Investing has updated their UI multiple times)
    const selectors = [
      '.comment__body',
      '.js-discussion-comment',
      '[class*="comment"]',
      '.user-comment',
      '.discussionComment',
      '[data-test="comment"]',
    ];

    for (const sel of selectors) {
      $(sel).each((i, el) => {
        const $el = $(el);
        const text = $el.find('[class*="text"], [class*="body"], p').first().text().trim()
          || $el.text().trim();
        const user = $el.find('[class*="user"], [class*="author"], [class*="name"]').first().text().trim();
        const dateText = $el.find('[class*="date"], time').first().text().trim()
          || $el.find('time').attr('datetime') || '';

        if (text && text.length > 15 && text.length < 1000) {
          comments.push({
            id: `inv_${symbol}_${i}`,
            user: user || 'InvestingUser',
            text: text.substring(0, 300),
            sentiment: analyzeSentiment(text),
            source: 'Investing',
            timestamp: parseInvestingDate(dateText),
            url,
            verified: true,
          });
        }
      });
      if (comments.length > 0) break;
    }

    // Try to extract sentiment bar ratio
    if (comments.length === 0) {
      const bullText = $('[class*="bull"], [class*="bullish"]').first().text().trim();
      const bearText = $('[class*="bear"], [class*="bearish"]').first().text().trim();
      const bullPct = parseInt(bullText) || 0;
      const bearPct = parseInt(bearText) || 0;

      if (bullPct > 0 || bearPct > 0) {
        const sentiment = bullPct > bearPct ? 'Positive' : bearPct > bullPct ? 'Negative' : 'Neutral';
        // Synthesize a comment from the aggregate
        comments.push({
          id: `inv_agg_${symbol}`,
          user: 'Investing.com Sentiment',
          text: `Community sentiment: ${bullPct}% bullish, ${bearPct}% bearish`,
          sentiment,
          source: 'Investing',
          timestamp: Date.now(),
          url,
          verified: true,
        });
      }
    }

    if (comments.length > 0) {
      console.log(`[Investing] ${symbol}: ${comments.length} comments from ${url}`);
    }

    return comments.slice(0, 10);
  } catch (e) {
    if (e.response?.status !== 404) {
      console.warn(`[Investing] Failed to fetch ${url}: ${e.message}`);
    }
    return [];
  }
}

async function searchAndScrape(symbol) {
  try {
    const searchUrl = `https://www.investing.com/search/?q=${encodeURIComponent(symbol)}`;
    const searchResponse = await networkService.fetch(searchUrl, {
      timeout: 8000,
      headers: { 'Referer': 'https://www.investing.com/' },
    });

    const $search = cheerio.load(searchResponse.data);
    let assetPath = null;

    $search('.js-inner-all-results-quote-item, .js-inner-all-results a, [data-url]').each((_, el) => {
      const href = $search(el).attr('href') || $search(el).attr('data-url') || '';
      if (href && (
        href.includes('/currencies/') || href.includes('/equities/') ||
        href.includes('/crypto/') || href.includes('/commodities/')
      )) {
        assetPath = href.replace(/^https?:\/\/www\.investing\.com/, '').replace(/^\//, '');
        return false;
      }
    });

    if (!assetPath) return [];

    return scrapeOpinionPage(assetPath, symbol);
  } catch (e) {
    console.warn(`[Investing] Search failed for ${symbol}: ${e.message}`);
    return [];
  }
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const bullish = ['buy', 'bullish', 'long', 'support', 'breakout', 'gain', 'profit', 'growth', 'strong', 'upside'];
  const bearish = ['sell', 'bearish', 'short', 'resistance', 'overvalued', 'bubble', 'crash', 'dump', 'weak', 'downside'];
  const bullishScore = bullish.filter(w => lower.includes(w)).length;
  const bearishScore = bearish.filter(w => lower.includes(w)).length;
  if (bullishScore > bearishScore) return 'Positive';
  if (bearishScore > bullishScore) return 'Negative';
  return 'Neutral';
}

function parseInvestingDate(dateStr) {
  if (!dateStr) return Date.now();
  const now = Date.now();
  if (dateStr.includes('hour')) return now - (parseInt(dateStr) || 1) * 3600000;
  if (dateStr.includes('day'))  return now - (parseInt(dateStr) || 1) * 86400000;
  if (dateStr.includes('min'))  return now - (parseInt(dateStr) || 1) * 60000;
  try {
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? now : parsed;
  } catch (_) {
    return now;
  }
}
