import axios from 'axios';
import * as cheerio from 'cheerio';

// Investing.com scraping
export async function fetchInvestingComments(symbol) {
  try {
    // Investing.com has different URL patterns for different asset types
    // Try to find the asset page first
    const searchUrl = `https://www.investing.com/search/?q=${encodeURIComponent(symbol)}`;
    
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });
    
    const $search = cheerio.load(searchResponse.data);
    
    // Find first result link
    let assetUrl = null;
    $search('.js-inner-all-results a').each((i, el) => {
      const href = $search(el).attr('href');
      if (href && (href.includes('/currencies/') || href.includes('/equities/') || href.includes('/crypto/') || href.includes('/commodities/'))) {
        assetUrl = href;
        if (!assetUrl.startsWith('http')) {
          assetUrl = 'https://www.investing.com' + assetUrl;
        }
        return false; // break
      }
    });
    
    if (!assetUrl) {
      console.warn(`Investing.com: No asset page found for ${symbol}`);
      return [];
    }
    
    // Now fetch the comments/opinions page
    const commentsUrl = assetUrl.replace('-chart', '-commentary') + '#comments';
    
    const commentsResponse = await axios.get(commentsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(commentsResponse.data);
    const comments = [];
    
    // Parse comments from the page
    $('.comment__body, .user-comment, .discussionComment').each((i, el) => {
      const $comment = $(el);
      const text = $comment.find('.comment__text, .comment-text, .js-comment-text').text().trim();
      const user = $comment.find('.comment__username, .user-name, .js-user-name').text().trim();
      const dateText = $comment.find('.comment__date, .date').text().trim();
      
      if (text && text.length > 10) {
        const sentiment = analyzeSentiment(text);
        
        comments.push({
          id: `inv_${Date.now()}_${i}`,
          user: user || 'InvestingUser',
          text: text.substring(0, 300),
          sentiment: sentiment,
          source: 'Investing',
          timestamp: parseInvestingDate(dateText),
          url: commentsUrl,
          verified: true
        });
      }
    });
    
    // Also get the sentiment bar data if available
    const sentimentBar = $('.sentimentBar, .bullBearRatio').first();
    if (sentimentBar.length) {
      const bullishPct = parseInt(sentimentBar.find('.bullishPct, .bull').text()) || 50;
      console.log(`Investing sentiment for ${symbol}: ${bullishPct}% bullish`);
    }
    
    return comments.slice(0, 10);
    
  } catch (error) {
    console.error('Investing.com scraping error:', error.message);
    return [];
  }
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  
  const bullish = ['buy', 'bullish', 'long', 'support', 'breakout', 'gain', 'profit', 'undervalued', 'growth'];
  const bearish = ['sell', 'bearish', 'short', 'resistance', 'overvalued', 'bubble', 'crash', 'dump'];
  
  let bullishScore = bullish.filter(w => lower.includes(w)).length;
  let bearishScore = bearish.filter(w => lower.includes(w)).length;
  
  if (bullishScore > bearishScore) return 'Positive';
  if (bearishScore > bullishScore) return 'Negative';
  return 'Neutral';
}

function parseInvestingDate(dateStr) {
  if (!dateStr) return Date.now();
  
  // Try to parse various formats like "2 hours ago", "Jan 15, 2024"
  const now = Date.now();
  
  if (dateStr.includes('hour')) {
    const hours = parseInt(dateStr) || 1;
    return now - hours * 3600000;
  }
  if (dateStr.includes('day')) {
    const days = parseInt(dateStr) || 1;
    return now - days * 86400000;
  }
  if (dateStr.includes('min')) {
    const mins = parseInt(dateStr) || 1;
    return now - mins * 60000;
  }
  
  return now;
}
