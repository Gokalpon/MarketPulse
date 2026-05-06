import * as cheerio from 'cheerio';
import { networkService } from '../services/networkService.js';

// Symbol → TradingView slug mapping
const TV_SYMBOL_MAP = {
  'BTC-USD': 'btcusd',  'ETH-USD': 'ethusd',  'BTC': 'btcusdt',
  'ETH': 'ethusdt',     'SOL': 'solusdt',      'ADA': 'adausdt',
  'XRP': 'xrpusdt',     'DOT': 'dotusdt',      'LINK': 'linkusdt',
  'AVAX': 'avaxusdt',   'AAPL': 'aapl',        'TSLA': 'tsla',
  'GOOGL': 'googl',     'MSFT': 'msft',        'AMZN': 'amzn',
  'META': 'meta',       'NVDA': 'nvda',         'AMD': 'amd',
  'NFLX': 'nflx',       'GOLD': 'xauusd',      'SILVER': 'xagusd',
  'OIL': 'usoil',       'NASDAQ': 'qqq',
};

function mapToTVSlug(symbol) {
  if (TV_SYMBOL_MAP[symbol]) return TV_SYMBOL_MAP[symbol];
  const base = symbol.replace('-USD', '').replace('.IS', '').toLowerCase();
  return TV_SYMBOL_MAP[base.toUpperCase()] || base;
}

function mapTVDirection(type) {
  if (!type) return 'Neutral';
  const t = String(type).toLowerCase();
  if (t === 'long' || t === 'bullish' || t === 'buy') return 'Positive';
  if (t === 'short' || t === 'bearish' || t === 'sell') return 'Negative';
  return 'Neutral';
}

export async function fetchTradingViewComments(symbol) {
  const slug = mapToTVSlug(symbol);

  // --- Strategy 1: Parse SSR __NEXT_DATA__ from ideas page ---
  const ideas = await fetchIdeasFromPage(slug);
  if (ideas.length > 0) return ideas;

  // --- Strategy 2: Parse __NEXT_DATA__ from symbol technical page ---
  const technical = await fetchFromSymbolPage(symbol, slug);
  if (technical.length > 0) return technical;

  return [];
}

async function fetchIdeasFromPage(slug) {
  const url = `https://www.tradingview.com/ideas/${slug}/`;
  try {
    const response = await networkService.fetch(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Try to extract __NEXT_DATA__
    const nextDataRaw = $('#__NEXT_DATA__').text() || $('script#__NEXT_DATA__').html();
    if (nextDataRaw) {
      const nextData = JSON.parse(nextDataRaw);

      // Possible structures
      const ideasArr =
        nextData?.props?.pageProps?.ideas?.data ||
        nextData?.props?.pageProps?.ideas ||
        nextData?.props?.pageProps?.initialState?.publishedScripts?.data ||
        [];

      if (Array.isArray(ideasArr) && ideasArr.length > 0) {
        console.log(`[TradingView] __NEXT_DATA__ found: ${ideasArr.length} ideas for ${slug}`);
        return ideasArr.slice(0, 15).map((idea, i) => ({
          id: `tv_${idea.id || idea.short_id || i}`,
          user: idea.user?.username || idea.author?.username || idea.author || 'TVTrader',
          text: idea.name || idea.title || '',
          fullText: idea.description || idea.descriptionHtml?.replace(/<[^>]+>/g, '') || '',
          sentiment: mapTVDirection(idea.type || idea.direction || idea.idea_type),
          source: 'TradingView',
          timestamp: idea.published_at
            ? new Date(idea.published_at).getTime()
            : (idea.timestamp || Date.now()),
          url: idea.url || `https://www.tradingview.com/ideas/${slug}/`,
          verified: true,
          likes: idea.agree_count || idea.likes_count || idea.likes || 0,
        }));
      }
    }

    // Fallback: try to extract from JSON-LD or window.__INITIAL_STATE__
    const scripts = $('script[type="application/ld+json"]');
    const ideas = [];
    scripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        if (json['@type'] === 'Article' || json['@type'] === 'ItemList') {
          ideas.push({
            id: `tv_ld_${Math.random().toString(36).slice(2)}`,
            user: json.author?.name || 'TVTrader',
            text: json.name || json.headline || '',
            fullText: json.description || '',
            sentiment: analyzeSentiment(json.name || json.headline || ''),
            source: 'TradingView',
            timestamp: json.datePublished ? new Date(json.datePublished).getTime() : Date.now(),
            url: json.url || `https://www.tradingview.com/ideas/${slug}/`,
            verified: true,
            likes: 0,
          });
        }
      } catch (_) {}
    });

    if (ideas.length > 0) {
      console.log(`[TradingView] JSON-LD found: ${ideas.length} articles for ${slug}`);
      return ideas;
    }

    return [];
  } catch (e) {
    console.warn(`[TradingView] Ideas page fetch failed for ${slug}: ${e.message}`);
    return [];
  }
}

async function fetchFromSymbolPage(symbol, slug) {
  // Try TradingView symbol profile which may have embedded analysis data
  const url = `https://www.tradingview.com/symbols/${slug.toUpperCase()}/`;
  try {
    const response = await networkService.fetch(url, { timeout: 8000 });
    const $ = cheerio.load(response.data);

    const nextDataRaw = $('#__NEXT_DATA__').text();
    if (!nextDataRaw) return [];

    const nextData = JSON.parse(nextDataRaw);
    const symData =
      nextData?.props?.pageProps?.data?.ideas?.data ||
      nextData?.props?.pageProps?.ideas?.data ||
      [];

    if (Array.isArray(symData) && symData.length > 0) {
      console.log(`[TradingView] Symbol page found: ${symData.length} ideas for ${symbol}`);
      return symData.slice(0, 10).map((idea, i) => ({
        id: `tv_sym_${idea.id || i}`,
        user: idea.user?.username || 'TVTrader',
        text: idea.name || idea.title || '',
        fullText: idea.description || '',
        sentiment: mapTVDirection(idea.type || idea.direction),
        source: 'TradingView',
        timestamp: idea.published_at ? new Date(idea.published_at).getTime() : Date.now(),
        url: idea.url || `https://www.tradingview.com/symbols/${slug.toUpperCase()}/`,
        verified: true,
        likes: idea.agree_count || 0,
      }));
    }

    return [];
  } catch (e) {
    console.warn(`[TradingView] Symbol page fetch failed for ${symbol}: ${e.message}`);
    return [];
  }
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const bullish = ['buy', 'bullish', 'long', 'support', 'breakout', 'moon', 'pump', 'rally', 'surge', 'target', 'upside'];
  const bearish = ['sell', 'bearish', 'short', 'resistance', 'crash', 'dump', 'fall', 'drop', 'downside', 'breakdown'];
  const bullishScore = bullish.filter(w => lower.includes(w)).length;
  const bearishScore = bearish.filter(w => lower.includes(w)).length;
  if (bullishScore > bearishScore) return 'Positive';
  if (bearishScore > bullishScore) return 'Negative';
  return 'Neutral';
}
