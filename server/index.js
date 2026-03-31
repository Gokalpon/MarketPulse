import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

const app = express();
app.use(cors());

// A simple cache to avoid spamming Yahoo Finance
const cache = new Map();
const CACHE_DURATION_MS = 60000; // 1 minute

app.get('/api/market/quote', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const cacheKey = `quote_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }

    const quote = await yahooFinance.quote(symbol);
    
    // Format to match what the frontend expects
    const formattedQuote = {
      price: quote.regularMarketPrice,
      change: quote.regularMarketChangePercent ? `${quote.regularMarketChangePercent >= 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%` : '0%',
      changePercent: quote.regularMarketChangePercent || 0,
      isUp: quote.regularMarketChangePercent >= 0,
      high: quote.regularMarketDayHigh || quote.regularMarketPrice,
      low: quote.regularMarketDayLow || quote.regularMarketPrice,
      volume: quote.regularMarketVolume?.toString() || '0'
    };

    cache.set(cacheKey, { data: formattedQuote, timestamp: Date.now() });

    res.json(formattedQuote);
  } catch (error) {
    console.error(`Error fetching quote for ${req.query.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

app.get('/api/market/chart', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    const interval = req.query.interval || '1d';
    const range = req.query.range || '1mo';
    
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const cacheKey = `chart_${symbol}_${interval}_${range}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS * 5) {
      return res.json(cached.data);
    }

    let period1Date = new Date();
    if (range.endsWith('d')) {
      period1Date.setDate(period1Date.getDate() - parseInt(range));
    } else if (range.endsWith('mo')) {
      period1Date.setMonth(period1Date.getMonth() - parseInt(range));
    } else if (range.endsWith('y')) {
      period1Date.setFullYear(period1Date.getFullYear() - parseInt(range));
    } else if (range.endsWith('wk')) {
      period1Date.setDate(period1Date.getDate() - parseInt(range) * 7);
    } else if (range.endsWith('h')) {
      period1Date.setHours(period1Date.getHours() - parseInt(range));
    }
    
    const queryOptions = { period1: period1Date, interval: interval };
    const chart = await yahooFinance.chart(symbol, queryOptions);
    
    // Format the history data into an array of closing prices
    const prices = chart.quotes.map(q => q.close).filter(p => p !== null);

    cache.set(cacheKey, { data: prices, timestamp: Date.now() });

    res.json(prices);
  } catch (error) {
    console.error(`Error fetching chart for ${req.query.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

app.get('/api/market/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const cacheKey = `search_${query}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS * 60) {
      return res.json(cached.data);
    }

    const { quotes } = await yahooFinance.search(query, { quotesCount: 20, newsCount: 0 });
    
    // Filter to return extensive range of financial instruments
    const validQuotes = quotes.filter(q => 
      ['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX', 'OPTION', 'FUTURE', 'CURRENCY', 'CRYPTOCURRENCY', 'INDICATOR'].includes(q.quoteType)
    );
    
    cache.set(cacheKey, { data: validQuotes, timestamp: Date.now() });
    res.json(validQuotes);
  } catch (error) {
    console.error(`Error searching for ${req.query.q}:`, error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Market Data Proxy running on http://localhost:${PORT}`);
});
