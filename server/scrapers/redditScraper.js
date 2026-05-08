import { networkService } from '../services/networkService.js';

// Cached OAuth token
let cachedToken = null;
let tokenExpiresAt = 0;

async function getRedditToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const data = await networkService.fetchJson('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      timeout: 8000,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MarketPulse/1.0',
      },
      data: 'grant_type=client_credentials',
    });

    if (data?.access_token) {
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      console.log('[Reddit] OAuth token acquired');
      return cachedToken;
    }
  } catch (err) {
    console.warn(`[Reddit] OAuth token fetch failed: ${err.message}`);
  }
  return null;
}

function getRelevantSubreddits(symbol, assetName) {
  const sym = symbol.toLowerCase();
  const name = (assetName || '').toLowerCase();

  const isCrypto = ['btc', 'eth', 'sol', 'ada', 'xrp', 'avax', 'dot', 'link', 'bitcoin', 'ethereum'].some(
    k => sym.includes(k) || name.includes(k)
  );

  if (isCrypto) return ['CryptoCurrency', 'Bitcoin', 'CryptoMarkets'];
  return ['stocks', 'investing', 'wallstreetbets'];
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const bullish = ['buy', 'bullish', 'moon', 'pump', 'gain', 'profit', 'long', 'support', 'breakout', 'rally', 'surge', 'rocket', 'ath', 'hodl'];
  const bearish = ['sell', 'bearish', 'dump', 'crash', 'loss', 'short', 'resistance', 'drop', 'fall', 'collapse', 'scam', 'rug', 'liquidat'];
  const bullishScore = bullish.filter(w => lower.includes(w)).length;
  const bearishScore = bearish.filter(w => lower.includes(w)).length;
  if (bullishScore > bearishScore * 1.3) return 'Positive';
  if (bearishScore > bullishScore * 1.3) return 'Negative';
  return 'Neutral';
}

async function fetchSubreddit(subreddit, query, token) {
  const encodedQuery = encodeURIComponent(query);
  const useOAuth = Boolean(token);
  const baseUrl = useOAuth ? 'https://oauth.reddit.com' : 'https://www.reddit.com';
  const url = `${baseUrl}/r/${subreddit}/search.json?q=${encodedQuery}&restrict_sr=1&sort=new&limit=10&t=week`;

  const headers = useOAuth
    ? { Authorization: `Bearer ${token}`, 'User-Agent': 'MarketPulse/1.0' }
    : { 'User-Agent': 'MarketPulse/1.0' };

  try {
    const data = await networkService.fetchJson(url, { timeout: 6000, headers });
    const posts = data?.data?.children || [];
    const found = [];

    for (const post of posts) {
      const item = post.data;
      if (!item || (!item.selftext && !item.title)) continue;

      const title = item.title || '';
      const content = item.selftext || '';
      const combined = `${title} ${content}`.toLowerCase();

      if (!combined.includes(query.split(' ')[0].toLowerCase())) continue;

      found.push({
        id: `reddit_${item.id}`,
        user: item.author || 'anonymous',
        text: title,
        fullText: content.substring(0, 400),
        likes: item.ups || 0,
        sentiment: analyzeSentiment(`${title} ${content}`),
        source: 'Reddit',
        subreddit,
        timestamp: item.created_utc * 1000,
        url: `https://reddit.com${item.permalink}`,
        priceAtComment: null,
      });
    }

    console.log(`[Reddit] r/${subreddit}: ${found.length} posts`);
    return found;
  } catch (e) {
    console.warn(`[Reddit] r/${subreddit} unreachable: ${e.message}`);
    return [];
  }
}

export async function fetchRedditComments(symbol, assetName) {
  try {
    const token = await getRedditToken();
    const subreddits = getRelevantSubreddits(symbol, assetName);
    const query = `${symbol} ${assetName || ''}`.trim();

    if (token) {
      console.log(`[Reddit] OAuth scan for ${assetName || symbol} in ${subreddits.join(', ')}`);
    } else {
      console.log(`[Reddit] Anonymous scan for ${assetName || symbol} (set REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET for OAuth)`);
    }

    const results = await Promise.allSettled(
      subreddits.map(sub => fetchSubreddit(sub, query, token))
    );

    const comments = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    const seen = new Set();
    return comments.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  } catch (error) {
    console.error('[Reddit] Error:', error.message);
    return [];
  }
}
