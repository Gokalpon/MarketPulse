/* ── THEME & ASSETS ── */
export const THEME = {
  bg: "#050507",
  accent: "#00FFFF",
  success: "#39FF14",
  textSecondary: "#5A5B6D",
};

export const APP_ASSETS = {
  splashBackground: "/images/giris_arkaplan.jpg",
  splashVideo: "",
  mainBackground: "/images/ana_arkaplan.jpg",
  splashLogo: "/images/Logo_Market_Pulse_Minimalist.png",
  headerLogo: "/images/Logo_Market_Pulse_3.png",
  tabLogo: "/images/Logo_Market_Pulse_Minimalist_2.png",
};

/* ── MOCK DATA GENERATORS ── */
const dataCache = new Map<string, number[]>();

const generateRealisticData = (pointsCount: number, startValue: number, volatility: number) => {
  let val = startValue;
  const data: number[] = [];
  for (let i = 0; i < pointsCount; i++) {
    val += (Math.random() - 0.45) * volatility;
    data.push(val);
  }
  return data;
};

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price: number;
  change: string;
  isUp: boolean;
  data: Record<string, number[]>; // Now mandatory but lazily populated via Proxy
}

const assetConfigs = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC/USD", category: "Crypto", price: 43520.00, change: "+4.2%", isUp: true },
  { id: "ETH", name: "Ethereum", symbol: "ETH/USD", category: "Crypto", price: 2240.50, change: "+2.4%", isUp: true },
  { id: "SOL", name: "Solana", symbol: "SOL/USD", category: "Crypto", price: 98.20, change: "-1.2%", isUp: false },
  { id: "ADA", name: "Cardano", symbol: "ADA/USD", category: "Crypto", price: 0.52, change: "+1.5%", isUp: true },
  { id: "DOT", name: "Polkadot", symbol: "DOT/USD", category: "Crypto", price: 7.20, change: "-0.8%", isUp: false },
  { id: "LINK", name: "Chainlink", symbol: "LINK/USD", category: "Crypto", price: 18.50, change: "+3.2%", isUp: true },
  { id: "AVAX", name: "Avalanche", symbol: "AVAX/USD", category: "Crypto", price: 35.40, change: "+2.1%", isUp: true },
  { id: "XRP", name: "Ripple", symbol: "XRP/USD", category: "Crypto", price: 0.58, change: "-0.5%", isUp: false },
  { id: "NASDAQ", name: "Nasdaq 100", symbol: "NDX", category: "Stocks", price: 17850.20, change: "+1.1%", isUp: true },
  { id: "AAPL", name: "Apple Inc.", symbol: "AAPL", category: "Stocks", price: 185.92, change: "+0.8%", isUp: true },
  { id: "MSFT", name: "Microsoft", symbol: "MSFT", category: "Stocks", price: 405.20, change: "+1.2%", isUp: true },
  { id: "GOOGL", name: "Alphabet", symbol: "GOOGL", category: "Stocks", price: 145.30, change: "+0.5%", isUp: true },
  { id: "AMZN", name: "Amazon", symbol: "AMZN", category: "Stocks", price: 170.40, change: "+2.1%", isUp: true },
  { id: "META", name: "Meta Platforms", symbol: "META", category: "Stocks", price: 485.10, change: "+3.5%", isUp: true },
  { id: "NVDA", name: "NVIDIA", symbol: "NVDA", category: "Stocks", price: 726.13, change: "+4.5%", isUp: true },
  { id: "AMD", name: "AMD", symbol: "AMD", category: "Stocks", price: 175.20, change: "+2.8%", isUp: true },
  { id: "TSLA", name: "Tesla", symbol: "TSLA", category: "Stocks", price: 198.32, change: "-2.1%", isUp: false },
  { id: "NFLX", name: "Netflix", symbol: "NFLX", category: "Stocks", price: 580.40, change: "+1.5%", isUp: true },
  { id: "GOLD", name: "Gold", symbol: "XAU/USD", category: "Commodities", price: 2035.40, change: "-0.3%", isUp: false },
  { id: "SILVER", name: "Silver", symbol: "XAG/USD", category: "Commodities", price: 22.80, change: "+1.2%", isUp: true },
  { id: "OIL", name: "Crude Oil", symbol: "WTI", category: "Commodities", price: 78.40, change: "+1.8%", isUp: true },
  { id: "COPPER", name: "Copper", symbol: "HG", category: "Commodities", price: 3.85, change: "-0.4%", isUp: false },
  { id: "BIST100", name: "BIST 100", symbol: "XU100.IS", category: "Stocks", price: 8450.23, change: "+1.8%", isUp: true },
  { id: "ASELS", name: "Aselsan", symbol: "ASELS.IS", category: "Stocks", price: 156.80, change: "+2.3%", isUp: true },
  { id: "THYAO", name: "Turkish Airlines", symbol: "THYAO.IS", category: "Stocks", price: 28.45, change: "-1.2%", isUp: false },
  { id: "GARAN", name: "Garanti Bank", symbol: "GARAN.IS", category: "Stocks", price: 45.60, change: "+0.9%", isUp: true },
  { id: "SASA", name: "Sasaş", symbol: "SASA.IS", category: "Stocks", price: 89.30, change: "+1.5%", isUp: true },
  { id: "KCHOL", name: "Koç Holding", symbol: "KCHOL.IS", category: "Stocks", price: 92.15, change: "+2.1%", isUp: true },
];

/**
 * Proxy-based lazy initializer for assets.
 * 150+ assets with multiple timeframes create 900+ data sets.
 * Proxy ensures we only compute what we actually use.
 */
const createLazyAsset = (config: any): Asset => {
  const asset = { ...config } as Asset;
  
  return new Proxy(asset, {
    get(target, prop) {
      if (prop === 'data') {
        if (!target.data) {
          target.data = getAssetData(target.id);
        }
        return target.data;
      }
      return (target as any)[prop];
    }
  });
};

export const ASSETS: Asset[] = assetConfigs.map(createLazyAsset);

export const getAssetData = (assetId: string): Record<string, number[]> => {
  const asset = assetConfigs.find(a => a.id === assetId);
  if (!asset) return {};

  const config: Record<string, [number, number]> = {
    "1H": [30, 0.5],
    "1D": [30, 2],
    "1W": [30, 5],
    "1M": [30, 10],
    "1Y": [30, 25],
    "ALL": [30, 50],
  };

  const result: Record<string, number[]> = {};
  for (const [period, [points, vol]] of Object.entries(config)) {
    const key = `${assetId}-${period}`;
    if (!dataCache.has(key)) {
      dataCache.set(key, generateRealisticData(points, asset.price, vol));
    }
    result[period] = dataCache.get(key)!;
  }
  return result;
};

export const generateComments = (count: number, _sentiment: string) => {
  const users = ["@TraderX", "@Gokalp", "@CryptoKing", "@BearHunter", "@GoldBug", "@MacroEcon", "@DayTrader", "@SwingTrader", "@DefiDegen", "@NFTTrader", "@DevGuy", "@ShortSeller", "@Newbie", "@WallSt", "@Investor"];
  const positiveTexts = ["Massive strength here!", "Bullish divergence spotted.", "Smart money accumulating.", "Institutional inflows real.", "RSI looking good.", "Great entry point.", "Moon mission engaged.", "Fundamentals solid.", "Future is bright.", "Next stop: ATH!"];
  const negativeTexts = ["Panic selling starting.", "Double top forming.", "Bearish divergence.", "Too much FOMO.", "Flush soon expected.", "Volume drying up.", "Trend clearly bearish.", "Market overextended.", "Inflation sticky.", "Dump incoming!"];
  const neutralTexts = ["Chop city. Sitting.", "Waiting for breakout.", "Consolidation continues.", "Range-bound movement.", "No clear direction.", "Volume is average.", "Indecision in market.", "Equilibrium reached.", "Mixed signals.", "Patience is key."];

  const result: Array<{ user: string; text: string; sentiment: string; likes: number }> = [];
  const posCount = Math.floor(count * 0.4);
  const negCount = Math.floor(count * 0.4);
  const neuCount = count - posCount - negCount;

  for (let i = 0; i < posCount; i++) {
    result.push({ user: users[Math.floor(Math.random() * users.length)], text: positiveTexts[Math.floor(Math.random() * positiveTexts.length)], sentiment: "Positive", likes: Math.floor(Math.random() * 240) + 2 });
  }
  for (let i = 0; i < negCount; i++) {
    result.push({ user: users[Math.floor(Math.random() * users.length)], text: negativeTexts[Math.floor(Math.random() * negativeTexts.length)], sentiment: "Negative", likes: Math.floor(Math.random() * 240) + 2 });
  }
  for (let i = 0; i < neuCount; i++) {
    result.push({ user: users[Math.floor(Math.random() * users.length)], text: neutralTexts[Math.floor(Math.random() * neutralTexts.length)], sentiment: "Neutral", likes: Math.floor(Math.random() * 240) + 2 });
  }

  return result.sort((a, b) => b.likes - a.likes);
};

export const generateAssetTranslations = (assetId: string) => {
  const points: Array<{
    idx: number;
    type: "news" | "consensus";
    impact: string;
    translation: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    newsUrl?: string;
    comments: ReturnType<typeof generateComments>;
  }> = [];
  const usedIndices = new Set<number>();

  while (usedIndices.size < 5) {
    usedIndices.add(Math.floor(Math.random() * 50) + 5);
  }

  const commentIndices = Array.from(usedIndices);

  commentIndices.forEach((idx, i) => {
    const sentiments = ["Positive", "Neutral", "Negative"];
    const sentiment = sentiments[i % 3];
    points.push({
      idx,
      type: "consensus",
      impact: Math.random() > 0.7 ? "major" : "minor",
      translation: i === 0 ? "Market sentiment is shifting." :
                   i === 1 ? "Consolidation phase near support." :
                   i === 2 ? "Resistance level being tested." :
                   i === 3 ? "Profit taking observed at highs." :
                   "Volume accumulation starting.",
      sentiment: sentiment as "Positive" | "Neutral" | "Negative",
      comments: generateComments(Math.floor(Math.random() * 135) + 5, sentiment)
    });
  });

  const newsCount = Math.floor(Math.random() * 2) + 1;
  let addedNews = 0;
  let attempts = 0;
  while (addedNews < newsCount && attempts < 20) {
    attempts++;
    const idx = Math.floor(Math.random() * 40) + 10;
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      points.push({
        idx,
        type: "news",
        impact: "major",
        translation: "Breaking: Market-moving institutional news released.",
        sentiment: "Positive",
        newsUrl: "https://www.reuters.com/markets/",
        comments: generateComments(Math.floor(Math.random() * 240) + 15, "Positive")
      });
      addedNews++;
    }
  }

  // suppress unused variable warning
  void assetId;

  return points;
};

export const getMockTranslations = (assetId: string) => {
  return generateAssetTranslations(assetId);
};

export const COMMUNITY_POSTS = [
  { id: 1, user: "@CryptoKing", name: "Crypto King", avatar: "CK", time: "2h ago", text: "Bitcoin is showing massive strength here. If we break 44k, we fly.", likes: 103, comments: 14, success: 88, platform: "TradingView" },
  { id: 2, user: "@BearHunter", name: "Bear Hunter", avatar: "BH", time: "4h ago", text: "Nasdaq looks overextended. Taking some profits on tech stocks today.", likes: 38, comments: 4, success: 74, platform: "Investing" },
  { id: 3, user: "@GoldBug", name: "Gold Bug", avatar: "GB", time: "5h ago", text: "Inflation data tomorrow. Gold is perfectly positioned for a run to 2100.", likes: 154, comments: 27, success: 92, platform: "MarketPulse" },
  { id: 4, user: "@Gokalp", name: "Gökalp", avatar: "G", time: "8h ago", text: "Solana network activity is peaking again. Keep an eye on the ecosystem tokens.", likes: 268, comments: 40, success: 95, platform: "TradingView" },
  { id: 5, user: "@MacroEcon", name: "Macro Econ", avatar: "ME", time: "12h ago", text: "Fed minutes were dovish. Risk-on assets should benefit in Q1.", likes: 74, comments: 20, success: 81, platform: "Investing" },
];
