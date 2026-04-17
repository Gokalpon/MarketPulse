import axios from 'axios';
import * as cheerio from 'cheerio';

// TradingView scraping - comments often have explicit 'Bullish'/'Bearish' labels
export async function fetchTradingViewComments(symbol) {
  try {
    // TradingView symbol format mapping
    const tvSymbol = mapToTVSymbol(symbol);
    
    // TradingView ideas/comments page
    const url = `https://www.tradingview.com/symbols/${tvSymbol}/ideas/`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const comments = [];
    
    // Parse trading ideas (these are like comments with analysis)
    $('.tv-card, .idea-card, .js-idea-card').each((i, el) => {
      const $card = $(el);
      
      const title = $card.find('.tv-card-title, .idea-title').text().trim();
      const text = $card.find('.tv-card-description, .idea-description').text().trim();
      const user = $card.find('.tv-card-author, .idea-author-name').text().trim();
      const timeAgo = $card.find('.tv-card-time, .idea-time').text().trim();
      
      // TradingView often has explicit sentiment labels
      const sentimentLabel = $card.find('.tv-card-label, .idea-label').text().toLowerCase();
      let sentiment = 'Neutral';
      
      if (sentimentLabel.includes('long') || sentimentLabel.includes('bullish') || sentimentLabel.includes('buy')) {
        sentiment = 'Positive';
      } else if (sentimentLabel.includes('short') || sentimentLabel.includes('bearish') || sentimentLabel.includes('sell')) {
        sentiment = 'Negative';
      } else {
        // Fallback to text analysis
        sentiment = analyzeSentiment(title + ' ' + text);
      }
      
      if (title || text) {
        comments.push({
          id: `tv_${Date.now()}_${i}`,
          user: user || 'TVTrader',
          text: title || text.substring(0, 200),
          fullText: text,
          sentiment: sentiment,
          source: 'TradingView',
          timestamp: parseTimeAgo(timeAgo),
          url: `https://www.tradingview.com/symbols/${tvSymbol}/ideas/`,
          verified: true
        });
      }
    });
    
    // Also try to get community comments
    const commentsUrl = `https://www.tradingview.com/symbols/${tvSymbol}/community/`;
    try {
      const commentsResp = await axios.get(commentsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      });
      
      const $c = cheerio.load(commentsResp.data);
      
      $c('.comment, .tv-comment').each((i, el) => {
        const $comment = $c(el);
        const text = $comment.find('.comment-text, .tv-comment-text').text().trim();
        const user = $comment.find('.comment-author, .tv-comment-author').text().trim();
        
        if (text && text.length > 20) {
          comments.push({
            id: `tv_com_${Date.now()}_${i}`,
            user: user || 'TVUser',
            text: text.substring(0, 250),
            sentiment: analyzeSentiment(text),
            source: 'TradingView',
            timestamp: Date.now(),
            verified: false
          });
        }
      });
    } catch (e) {
      // Comments page might not exist, that's ok
    }
    
    return comments.slice(0, 15);
    
  } catch (error) {
    console.error('TradingView scraping error:', error.message);
    return [];
  }
}

// Map common symbols to TradingView format
function mapToTVSymbol(symbol) {
  const mapping = {
    'BTC-USD': 'BTCUSDT',
    'ETH-USD': 'ETHUSDT',
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'AAPL': 'AAPL',
    'TSLA': 'TSLA',
    'GOOGL': 'GOOGL',
    'MSFT': 'MSFT',
    'AMZN': 'AMZN',
    'META': 'META',
    'NVDA': 'NVDA'
  };
  
  // Check direct mapping
  if (mapping[symbol]) return mapping[symbol];
  
  // Check without suffix
  const base = symbol.replace('-USD', '').replace('.IS', '');
  if (mapping[base]) return mapping[base];
  
  // Default: use as-is
  return symbol;
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  
  const bullish = ['buy', 'bullish', 'long', 'support', 'breakout', 'moon', 'pump', 'rally', 'surge'];
  const bearish = ['sell', 'bearish', 'short', 'resistance', 'crash', 'dump', 'fall', 'drop'];
  
  let bullishScore = bullish.filter(w => lower.includes(w)).length;
  let bearishScore = bearish.filter(w => lower.includes(w)).length;
  
  if (bullishScore > bearishScore) return 'Positive';
  if (bearishScore > bullishScore) return 'Negative';
  return 'Neutral';
}

function parseTimeAgo(timeStr) {
  if (!timeStr) return Date.now();
  
  const now = Date.now();
  
  if (timeStr.includes('hour')) {
    const hours = parseInt(timeStr) || 1;
    return now - hours * 3600000;
  }
  if (timeStr.includes('day')) {
    const days = parseInt(timeStr) || 1;
    return now - days * 86400000;
  }
  if (timeStr.includes('week')) {
    const weeks = parseInt(timeStr) || 1;
    return now - weeks * 604800000;
  }
  if (timeStr.includes('min')) {
    const mins = parseInt(timeStr) || 1;
    return now - mins * 60000;
  }
  
  return now;
}
