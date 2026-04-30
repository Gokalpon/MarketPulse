import puppeteer from 'puppeteer';

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// TradingView with Puppeteer
export async function fetchTradingViewWithPuppeteer(symbol) {
  const tvSymbol = mapToTVSymbol(symbol);
  const comments = [];

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to TradingView ideas page
    const url = `https://www.tradingview.com/symbols/${tvSymbol}/ideas/`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for content to load
    await page.waitForSelector('.tv-card, .idea-card, [data-name="idea-card"]', { timeout: 10000 }).catch(() => {});

    // Extract ideas/comments
    const ideas = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.tv-card, .idea-card, [data-name="idea-card"], .js-widget-idea-card, [class*="card-"], [data-card-type="idea"]');

      cards.forEach((card, i) => {
        const titleEl = card.querySelector('[class*="title-"], .tv-card-title, .idea-title, h3');
        const descEl = card.querySelector('[class*="description-"], .tv-card-description, .idea-description, p');
        const authorEl = card.querySelector('[class*="user-name-"], .tv-card-author, .author');
        const labelEl = card.querySelector('[class*="badge-"], .tv-card-label, .idea-label');

        const title = titleEl?.textContent?.trim() || '';
        const desc = descEl?.textContent?.trim() || '';

        if (title || desc) {
          const author = authorEl?.textContent?.trim() || 'Analyst';
          const label = labelEl?.textContent?.toLowerCase() || '';

          let sentiment = 'Neutral';
          if (label.includes('long') || label.includes('bull') || label.includes('buy')) sentiment = 'Positive';
          else if (label.includes('short') || label.includes('bear') || label.includes('sell')) sentiment = 'Negative';

          results.push({
            id: `tv_${Date.now()}_${i}`,
            user: author,
            text: title || desc.substring(0, 200),
            fullText: desc,
            sentiment,
            source: 'TradingView',
            timestamp: Date.now(),
            url: window.location.href,
            verified: true
          });
        }
      });
      return results;
    });

    console.log(`[Worker] TV found ${ideas.length} ideas for ${symbol}`);
    comments.push(...ideas);

    await page.close();

    console.log(`TradingView: Found ${ideas.length} ideas for ${tvSymbol}`);

  } catch (error) {
    console.error('TradingView Puppeteer error:', error.message);
  }

  return comments;
}

// Investing.com with Puppeteer
export async function fetchInvestingWithPuppeteer(symbol) {
  const comments = [];

  // Direct URL mapping for common assets
  const investingUrls = {
    'BTC-USD': 'https://www.investing.com/crypto/bitcoin',
    'ETH-USD': 'https://www.investing.com/crypto/ethereum',
    'BTC': 'https://www.investing.com/crypto/bitcoin',
    'ETH': 'https://www.investing.com/crypto/ethereum',
    'AAPL': 'https://www.investing.com/equities/apple-computer-inc',
    'TSLA': 'https://www.investing.com/equities/tesla-motors',
    'GOOGL': 'https://www.investing.com/equities/google-inc',
    'MSFT': 'https://www.investing.com/equities/microsoft-corp',
    'AMZN': 'https://www.investing.com/equities/amazon-com-inc',
    'META': 'https://www.investing.com/equities/facebook-inc',
    'NVDA': 'https://www.investing.com/equities/nvidia-corp'
  };

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Get direct URL or search
    let assetUrl = investingUrls[symbol] || investingUrls[symbol.replace('-USD', '')];

    if (!assetUrl) {
      // Search for the asset
      const searchUrl = `https://www.investing.com/search/?q=${encodeURIComponent(symbol)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Find first result link
      assetUrl = await page.evaluate(() => {
        const links = document.querySelectorAll('.js-inner-all-results a, .searchResults a, .instrumentHeader a');
        for (const link of links) {
          const href = link.getAttribute('href');
          if (href && (href.includes('/currencies/') || href.includes('/equities/') || href.includes('/crypto/') || href.includes('/commodities/'))) {
            return href.startsWith('http') ? href : 'https://www.investing.com' + href;
          }
        }
        return null;
      });
    }

    if (!assetUrl) {
      console.log(`Investing.com: No asset found for ${symbol}`);
      await page.close();
      return [];
    }

    // Go to the comments/commentary page
    const commentUrl = assetUrl.replace('-chart', '-commentary') + '#comments';
    await page.goto(commentUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for comments
    await page.waitForSelector('.comment, .user-comment, .discussionComment', { timeout: 10000 }).catch(() => {});

    // Extract comments
    const foundComments = await page.evaluate(() => {
      const results = [];

      const commentEls = document.querySelectorAll('.comment, .user-comment, .discussionComment, .comment__body');

      commentEls.forEach((el, i) => {
        const textEl = el.querySelector('.comment__text, .comment-text, .js-comment-text, p');
        const userEl = el.querySelector('.comment__username, .user-name, .js-user-name, .author');
        const dateEl = el.querySelector('.comment__date, .date, .js-date');

        const text = textEl?.textContent?.trim() || '';
        const user = userEl?.textContent?.trim() || 'Investor';

        if (text && text.length > 15) {
          // Simple sentiment analysis
          const lower = text.toLowerCase();
          let sentiment = 'Neutral';

          if (lower.includes('buy') || lower.includes('bullish') || lower.includes('long') || lower.includes('up')) {
            sentiment = 'Positive';
          } else if (lower.includes('sell') || lower.includes('bearish') || lower.includes('short') || lower.includes('down')) {
            sentiment = 'Negative';
          }

          results.push({
            id: `inv_puppet_${Date.now()}_${i}`,
            user,
            text: text.substring(0, 300),
            sentiment,
            source: 'Investing',
            timestamp: Date.now(),
            url: window.location.href,
            verified: true
          });
        }
      });

      return results;
    });

    comments.push(...foundComments);

    await page.close();

    console.log(`Investing.com: Found ${foundComments.length} comments for ${symbol}`);

  } catch (error) {
    console.error('Investing.com Puppeteer error:', error.message);
  }

  return comments;
}

// StockTwits scraping
export async function fetchStockTwitsComments(symbol) {
  const comments = [];

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // StockTwits symbol page
    const stSymbol = symbol.replace('-USD', '').replace('.IS', '');
    const url = `https://stocktwits.com/symbol/${stSymbol}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for messages
    const selector = '[data-testid="message-item"], .message-item, .stx-message';
    await page.waitForSelector(selector, { timeout: 15000 }).catch(() => {});

    // Extract messages
    const messages = await page.evaluate(() => {
      const results = [];
      const msgItems = document.querySelectorAll('[data-testid="message-item"], .message-item, .stx-message-item, div[class*="message-item"]');

      msgItems.forEach((el, i) => {
        const textEl = el.querySelector('[data-testid="message-text"], .message-body, div[class*="message-body"]');
        const userEl = el.querySelector('[data-testid="user-username"], .username, .user-name');
        const sentimentEl = el.querySelector('[class*="sentiment-"], .bullish, .bearish');

        const text = textEl?.textContent?.trim() || '';
        if (text && text.length > 5) {
          let sentiment = 'Neutral';
          if (sentimentEl) {
            const txt = sentimentEl.textContent?.toLowerCase() || '';
            if (txt.includes('bullish')) sentiment = 'Positive';
            else if (txt.includes('bearish')) sentiment = 'Negative';
          }

          if (sentiment === 'Neutral') {
             const lower = text.toLowerCase();
             if (lower.includes('buy') || lower.includes('long')) sentiment = 'Positive';
             else if (lower.includes('sell') || lower.includes('short')) sentiment = 'Negative';
          }

          results.push({
            id: `st_${Date.now()}_${i}`,
            user: userEl?.textContent?.trim() || 'Investor',
            text: text.substring(0, 250),
            sentiment,
            source: 'StockTwits',
            timestamp: Date.now(),
            verified: false
          });
        }
      });
      return results;
    });

    console.log(`[Worker] StockTwits found ${messages.length} messages for ${symbol}`);
    comments.push(...messages);

    await page.close();

    console.log(`StockTwits: Found ${messages.length} messages for ${symbol}`);

  } catch (error) {
    console.error('StockTwits error:', error.message);
  }

  return comments;
}

// X/Twitter scraping (public tweets only, no API needed)
export async function fetchXTwitterComments(symbol, assetName) {
  const comments = [];

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // X/Twitter search
    const query = encodeURIComponent(`$${symbol.replace('-USD', '')} OR ${assetName} (crypto OR stock OR trading)`);
    const url = `https://twitter.com/search?q=${query}&src=typed_query&f=live`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for tweets
    await page.waitForSelector('[data-testid="tweet"], article', { timeout: 15000 }).catch(() => {});

    // Extract tweets
    const tweets = await page.evaluate(() => {
      const results = [];

      const tweetEls = document.querySelectorAll('[data-testid="tweet"], article');

      tweetEls.forEach((el, i) => {
        const textEl = el.querySelector('[data-testid="tweetText"], .tweet-text');
        const userEl = el.querySelector('[data-testid="User-Name"], .username');

        const text = textEl?.textContent?.trim() || '';
        const user = userEl?.textContent?.trim()?.split('@')[0]?.trim() || 'XUser';

        if (text && text.length > 15) {
          // Sentiment analysis
          const lower = text.toLowerCase();
          let sentiment = 'Neutral';

          const bullishWords = ['buy', 'long', 'bull', 'moon', 'pump', 'gain', 'up', 'call'];
          const bearishWords = ['sell', 'short', 'bear', 'dump', 'crash', 'loss', 'down', 'put'];

          let bullishScore = bullishWords.filter(w => lower.includes(w)).length;
          let bearishScore = bearishWords.filter(w => lower.includes(w)).length;

          if (bullishScore > bearishScore) sentiment = 'Positive';
          else if (bearishScore > bullishScore) sentiment = 'Negative';

          results.push({
            id: `x_${Date.now()}_${i}`,
            user,
            text: text.substring(0, 280),
            sentiment,
            source: 'X',
            timestamp: Date.now(),
            verified: false
          });
        }
      });

      return results;
    });

    comments.push(...tweets);

    await page.close();

    console.log(`X/Twitter: Found ${tweets.length} tweets for ${symbol}`);

  } catch (error) {
    console.error('X/Twitter error:', error.message);
  }

  return comments;
}

// Symbol mapping helper
function mapToTVSymbol(symbol) {
  const mapping = {
    'BTC-USD': 'BTCUSDT',
    'ETH-USD': 'ETHUSDT',
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT'
  };

  if (mapping[symbol]) return mapping[symbol];

  const base = symbol.replace('-USD', '').replace('.IS', '');
  if (mapping[base]) return mapping[base];

  return symbol;
}
