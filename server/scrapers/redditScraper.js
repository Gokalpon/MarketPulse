import axios from 'axios';
import * as cheerio from 'cheerio';

// Reddit scraping - no API key needed
export async function fetchRedditComments(symbol, assetName) {
  try {
    // Search multiple crypto/stock subreddits
    const subreddits = ['cryptocurrency', 'stocks', 'investing', 'Bitcoin', 'CryptoMarkets'];
    const comments = [];
    
    for (const subreddit of subreddits.slice(0, 2)) { // Limit to avoid rate limiting
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(symbol + ' OR ' + assetName)}&restrict_sr=1&sort=new&limit=10`;
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 5000
        });
        
        const posts = response.data?.data?.children || [];
        
        for (const post of posts) {
          const data = post.data;
          if (!data || !data.selftext) continue;
          
          // Analyze sentiment from post content
          const sentiment = analyzeSentiment(data.title + ' ' + data.selftext);
          
          comments.push({
            id: `reddit_${data.id}`,
            user: data.author || 'anonymous',
            text: data.title,
            fullText: data.selftext?.substring(0, 500),
            likes: data.ups || 0,
            sentiment: sentiment,
            source: 'Reddit',
            subreddit: subreddit,
            timestamp: data.created_utc * 1000,
            url: `https://reddit.com${data.permalink}`,
            priceAtComment: null
          });
        }
      } catch (e) {
        console.warn(`Reddit scrape failed for r/${subreddit}:`, e.message);
      }
      
      // Rate limiting delay
      await new Promise(r => setTimeout(r, 500));
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
