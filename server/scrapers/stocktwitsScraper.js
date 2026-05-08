import { networkService } from '../services/networkService.js';

const CRYPTO_IDS = new Set(['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'AVAX', 'DOT', 'LINK']);

function toStockTwitsSymbol(symbol) {
  const base = symbol.replace('-USD', '').replace('.IS', '').toUpperCase();
  return CRYPTO_IDS.has(base) ? `${base}.X` : base;
}

function mapSentiment(basic) {
  if (basic === 'Bullish') return 'Positive';
  if (basic === 'Bearish') return 'Negative';
  return 'Neutral';
}

export async function fetchStockTwitsComments(symbol) {
  const stSymbol = toStockTwitsSymbol(symbol);

  try {
    const url = `https://api.stocktwits.com/api/2/streams/symbol/${stSymbol}.json?limit=30`;
    const data = await networkService.fetchJson(url, { timeout: 8000 });

    const messages = data?.messages || [];
    console.log(`[StockTwits] ${stSymbol}: ${messages.length} messages`);

    return messages.map(msg => ({
      id: `st_${msg.id}`,
      user: msg.user?.username || 'investor',
      text: msg.body || '',
      likes: 0,
      sentiment: mapSentiment(msg.entities?.sentiment?.basic),
      source: 'StockTwits',
      timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
      url: `https://stocktwits.com/${msg.user?.username}/message/${msg.id}`,
      priceAtComment: null,
    }));
  } catch (err) {
    console.warn(`[StockTwits] ${stSymbol} failed: ${err.message}`);
    return [];
  }
}
