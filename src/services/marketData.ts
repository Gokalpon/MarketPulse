// @ts-nocheck
const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

const timeframeToInterval = {
  "1H": "5min",
  "1D": "15min",
  "1W": "1h",
  "1M": "4h",
  "1Y": "1day",
  "ALL": "1week"
};

const timeframeToOutputSize = {
  "1H": "60",
  "1D": "96",
  "1W": "50",
  "1M": "60",
  "1Y": "365",
  "ALL": "500"
};

export async function fetchMarketData(symbol: string, timeframe: string) {
  if (!API_KEY) {
    console.warn("TwelveData API Key missing");
    return null;
  }

  const interval = timeframeToInterval[timeframe] || "15min";
  const outputsize = timeframeToOutputSize[timeframe] || "100";
  
  // Clean symbol for TwelveData
  let tdSymbol = symbol;
  // If no '/' in symbol and it's 3-4 chars, it might be a crypto that needs /USD
  if (!symbol.includes('/') && (symbol.length === 3 || symbol.length === 4)) {
    // Basic logic: if it's in our known crypto list, add /USD
    const cryptos = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'AVAX', 'XRP'];
    if (cryptos.includes(symbol)) tdSymbol = `${symbol}/USD`;
  }

  if (symbol === "NDX" || symbol === "NASDAQ") tdSymbol = "QQQ"; 
  if (symbol === "GOLD") tdSymbol = "XAU/USD";
  if (symbol === "OIL") tdSymbol = "WTI/USD";

  const url = `${BASE_URL}/time_series?symbol=${tdSymbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;


  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      console.error("TwelveData Error:", data.message);
      return null;
    }

    if (!data.values) return null;

    // Convert TwelveData values to our chart format
    if (!data.values || !Array.isArray(data.values)) {
      console.warn("TwelveData: No values array found in response", data);
      return null;
    }

    const mappedData = data.values.map((item: any) => {
      const ts = Math.floor(new Date(item.datetime + 'Z').getTime() / 1000); // Add 'Z' for UTC
      return {
        time: isNaN(ts) ? item.datetime : ts, 
        value: parseFloat(item.close)
      };
    }).filter(d => !isNaN(d.value));

    // Sort and remove duplicates (Lightweight Charts requirement)
    const sorted = mappedData.sort((a, b) => {
      const ta = typeof a.time === 'number' ? a.time : new Date(a.time).getTime() / 1000;
      const tb = typeof b.time === 'number' ? b.time : new Date(b.time).getTime() / 1000;
      return ta - tb;
    });

    const unique = sorted.filter((val, i, arr) => {
      if (i === 0) return true;
      return val.time !== arr[i - 1].time;
    });

    console.log(`TwelveData: Cleaned ${unique.length} points.`);
    return unique;

  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export async function fetchRealTimePrice(symbol: string) {
  if (!API_KEY) return null;
  
  let tdSymbol = symbol;
  if (symbol === "NDX" || symbol === "NASDAQ") tdSymbol = "QQQ";
  if (symbol === "GOLD") tdSymbol = "XAU/USD";

  const url = `${BASE_URL}/price?symbol=${tdSymbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.price ? parseFloat(data.price) : null;
  } catch (e) { return null; }
}

export async function fetchQuote(symbol: string) {
  if (!API_KEY) return null;
  
  let tdSymbol = symbol;
  if (symbol === "NDX" || symbol === "NASDAQ") tdSymbol = "QQQ";
  if (symbol === "GOLD") tdSymbol = "XAU/USD";

  const url = `${BASE_URL}/quote?symbol=${tdSymbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'error') return null;
    
    // In TwelveData quote, 'close' is the latest price
    const currentPrice = parseFloat(data.close || data.price);
    return {
      price: currentPrice,
      change: parseFloat(data.change),
      percentChange: parseFloat(data.percent_change),
      isUp: parseFloat(data.change) >= 0
    };
  } catch (e) { return null; }
}

