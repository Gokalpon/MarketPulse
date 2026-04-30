import { networkService } from '../services/networkService.js';

// Reddit scraping - no API key needed
export async function fetchRedditComments(symbol, assetName) {
  try {
    // Search multiple crypto/stock subreddits
    const subreddits = ['cryptocurrency', 'stocks', 'investing', 'Bitcoin', 'CryptoMarkets', 'StockMarket', 'wallstreetbets'];
    const comments = [];

    console.log(`[Reddit] 🔍 Deep scanning for ${assetName} (${symbol})...`);

    for (const subreddit of subreddits.slice(0, 5)) {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(symbol + ' ' + assetName)}&restrict_sr=1&sort=new&limit=25`;

      try {
        const data = await networkService.fetchJson(url, { timeout: 10000 });
        const posts = data?.data?.children || [];

        let subFound = 0;
        for (const post of posts) {
          const item = post.data;
          if (!item || (!item.selftext && !item.title)) continue;

          const title = item.title || "";
          const content = item.selftext || "";

          // Re-verify the asset is mentioned
          if (!title.toLowerCase().includes(symbol.toLowerCase()) &&
              !content.toLowerCase().includes(symbol.toLowerCase()) &&
              !title.toLowerCase().includes(assetName.toLowerCase())) continue;

          const sentiment = analyzeSentiment(title + ' ' + content);

          comments.push({
            id: `reddit_${item.id}`,
            user: item.author || 'anonymous',
            text: title,
            fullText: content.substring(0, 500),
            likes: item.ups || 0,
            sentiment: sentiment,
            source: 'Reddit',
            subreddit: subreddit,
            timestamp: item.created_utc * 1000,
            url: `https://reddit.com${item.permalink}`,
            priceAtComment: null
          });
          subFound++;
        }
        console.log(`[Reddit] r/${subreddit} matched ${subFound} relevant posts`);
      } catch (e) {
        console.warn(`[Reddit] ⚠️ r/${subreddit} unreachable: ${e.message}`);
      }

      await new Promise(r => setTimeout(r, 800)); // Safer delay
    }

    return comments;
  } catch (error) {
    console.error('Reddit scraping error:', error.message);
    return [];
  }
}

// Simple sentiment analysis
function analyzeSentiment(text) {
  const lower = text.toLowerCase();

  const bullish = ['buy', 'bullish', 'moon', 'pump', 'gain', 'profit', 'long', 'support', 'breakout', 'rally', 'surge', 'rocket'];
  const bearish = ['sell', 'bearish', 'dump', 'crash', 'loss', 'short', 'resistance', 'drop', 'fall', 'collapse', 'scam'];

  let bullishScore = 0;
  let bearishScore = 0;

  bullish.forEach(word => {
    if (lower.includes(word)) bullishScore++;
  });

  bearish.forEach(word => {
    if (lower.includes(word)) bearishScore++;
  });

  if (bullishScore > bearishScore * 1.3) return 'Positive';
  if (bearishScore > bullishScore * 1.3) return 'Negative';
  return 'Neutral';
}
