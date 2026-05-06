import { networkService } from '../services/networkService.js';

// Asset-type aware subreddit selection
function getRelevantSubreddits(symbol, assetName) {
  const sym = symbol.toLowerCase();
  const name = (assetName || '').toLowerCase();

  const isCrypto = ['btc', 'eth', 'sol', 'ada', 'xrp', 'avax', 'dot', 'link', 'bitcoin', 'ethereum'].some(
    k => sym.includes(k) || name.includes(k)
  );

  if (isCrypto) {
    return ['CryptoCurrency', 'Bitcoin', 'CryptoMarkets'];
  }
  return ['stocks', 'investing', 'wallstreetbets'];
}

export async function fetchRedditComments(symbol, assetName) {
  try {
    const subreddits = getRelevantSubreddits(symbol, assetName);
    const query = encodeURIComponent(`${symbol} ${assetName || ''}`.trim());

    console.log(`[Reddit] Parallel scan for ${assetName || symbol} in ${subreddits.join(', ')}`);

    const fetches = subreddits.map(async (subreddit) => {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${query}&restrict_sr=1&sort=new&limit=10&t=week`;
      try {
        const data = await networkService.fetchJson(url, { timeout: 6000 });
        const posts = data?.data?.children || [];
        const found = [];

        for (const post of posts) {
          const item = post.data;
          if (!item || (!item.selftext && !item.title)) continue;

          const title = item.title || '';
          const content = item.selftext || '';
          const combined = (title + ' ' + content).toLowerCase();
          const sym = symbol.toLowerCase();
          const aname = (assetName || '').toLowerCase();

          if (!combined.includes(sym) && !combined.includes(aname)) continue;

          found.push({
            id: `reddit_${item.id}`,
            user: item.author || 'anonymous',
            text: title,
            fullText: content.substring(0, 400),
            likes: item.ups || 0,
            sentiment: analyzeSentiment(title + ' ' + content),
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
    });

    const results = await Promise.allSettled(fetches);
    const comments = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate by id
    const seen = new Set();
    return comments.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  } catch (error) {
    console.error('[Reddit] Scraping error:', error.message);
    return [];
  }
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
