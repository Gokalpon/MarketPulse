/* ── THEME & ASSETS ── */
export const THEME = {
  bg: "#050507",
  accent: "#00FFFF",
  success: "#39FF14",
  textSecondary: "#5A5B6D",
};

export const APP_ASSETS = {
  splashBackground: "/images/giris_arkaplan.png",
  splashVideo: "",
  mainBackground: "/images/ana_arkaplan.png",
  splashLogo: "/images/Logo_Market_Pulse_Minimalist.png",
  headerLogo: "/images/Logo_Market_Pulse_3.png",
  tabLogo: "/images/Logo_Market_Pulse_Minimalist_2.png",
};

/* ── MOCK DATA GENERATORS ── */
const generateRealisticData = (pointsCount: number, startValue: number, volatility: number) => {
  let val = startValue;
  const data = [];
  for (let i = 0; i < pointsCount; i++) {
    val += (Math.random() - 0.45) * volatility;
    data.push(val);
  }
  return data;
};

export const ASSETS = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC/USD", category: "Crypto", price: 43520.00, change: "+4.2%", isUp: true, data: {
    "1H": generateRealisticData(60, 43000, 100), "1D": generateRealisticData(60, 42000, 400), "1W": generateRealisticData(60, 40000, 1000), "1M": generateRealisticData(60, 38000, 2000), "1Y": generateRealisticData(60, 25000, 5000), "ALL": generateRealisticData(60, 10000, 10000)
  } },
  { id: "ETH", name: "Ethereum", symbol: "ETH/USD", category: "Crypto", price: 2240.50, change: "+2.4%", isUp: true, data: {
    "1H": generateRealisticData(60, 2220, 10), "1D": generateRealisticData(60, 2200, 30), "1W": generateRealisticData(60, 2100, 100), "1M": generateRealisticData(60, 2000, 200), "1Y": generateRealisticData(60, 1500, 500), "ALL": generateRealisticData(60, 500, 1000)
  } },
  { id: "SOL", name: "Solana", symbol: "SOL/USD", category: "Crypto", price: 98.20, change: "-1.2%", isUp: false, data: {
    "1H": generateRealisticData(60, 99, 2), "1D": generateRealisticData(60, 100, 5), "1W": generateRealisticData(60, 105, 10), "1M": generateRealisticData(60, 80, 20), "1Y": generateRealisticData(60, 20, 50), "ALL": generateRealisticData(60, 5, 80)
  } },
  { id: "ADA", name: "Cardano", symbol: "ADA/USD", category: "Crypto", price: 0.52, change: "+1.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 0.5, 0.01), "1D": generateRealisticData(60, 0.48, 0.03), "1W": generateRealisticData(60, 0.45, 0.05), "1M": generateRealisticData(60, 0.4, 0.1), "1Y": generateRealisticData(60, 0.3, 0.2), "ALL": generateRealisticData(60, 0.1, 0.4)
  } },
  { id: "DOT", name: "Polkadot", symbol: "DOT/USD", category: "Crypto", price: 7.20, change: "-0.8%", isUp: false, data: {
    "1H": generateRealisticData(60, 7.3, 0.1), "1D": generateRealisticData(60, 7.5, 0.3), "1W": generateRealisticData(60, 7.0, 0.5), "1M": generateRealisticData(60, 6.0, 1.0), "1Y": generateRealisticData(60, 4.0, 2.0), "ALL": generateRealisticData(60, 2.0, 5.0)
  } },
  { id: "LINK", name: "Chainlink", symbol: "LINK/USD", category: "Crypto", price: 18.50, change: "+3.2%", isUp: true, data: {
    "1H": generateRealisticData(60, 18, 0.2), "1D": generateRealisticData(60, 17, 0.5), "1W": generateRealisticData(60, 15, 1.0), "1M": generateRealisticData(60, 13, 2.0), "1Y": generateRealisticData(60, 6.0, 5.0), "ALL": generateRealisticData(60, 1.0, 10.0)
  } },
  { id: "AVAX", name: "Avalanche", symbol: "AVAX/USD", category: "Crypto", price: 35.40, change: "+2.1%", isUp: true, data: {
    "1H": generateRealisticData(60, 34, 0.5), "1D": generateRealisticData(60, 32, 1.0), "1W": generateRealisticData(60, 30, 2.0), "1M": generateRealisticData(60, 20, 5.0), "1Y": generateRealisticData(60, 10, 10.0), "ALL": generateRealisticData(60, 3, 20.0)
  } },
  { id: "XRP", name: "Ripple", symbol: "XRP/USD", category: "Crypto", price: 0.58, change: "-0.5%", isUp: false, data: {
    "1H": generateRealisticData(60, 0.59, 0.01), "1D": generateRealisticData(60, 0.6, 0.02), "1W": generateRealisticData(60, 0.55, 0.05), "1M": generateRealisticData(60, 0.5, 0.1), "1Y": generateRealisticData(60, 0.4, 0.2), "ALL": generateRealisticData(60, 0.2, 0.4)
  } },
  { id: "NASDAQ", name: "Nasdaq 100", symbol: "NDX", category: "Stocks", price: 17850.20, change: "+1.1%", isUp: true, data: {
    "1H": generateRealisticData(60, 17800, 20), "1D": generateRealisticData(60, 17500, 100), "1W": generateRealisticData(60, 17000, 300), "1M": generateRealisticData(60, 16500, 500), "1Y": generateRealisticData(60, 14000, 1000), "ALL": generateRealisticData(60, 10000, 3000)
  } },
  { id: "AAPL", name: "Apple Inc.", symbol: "AAPL", category: "Stocks", price: 185.92, change: "+0.8%", isUp: true, data: {
    "1H": generateRealisticData(60, 185, 2), "1D": generateRealisticData(60, 180, 5), "1W": generateRealisticData(60, 175, 10), "1M": generateRealisticData(60, 160, 20), "1Y": generateRealisticData(60, 140, 40), "ALL": generateRealisticData(60, 50, 100)
  } },
  { id: "MSFT", name: "Microsoft", symbol: "MSFT", category: "Stocks", price: 405.20, change: "+1.2%", isUp: true, data: {
    "1H": generateRealisticData(60, 400, 2), "1D": generateRealisticData(60, 390, 5), "1W": generateRealisticData(60, 380, 10), "1M": generateRealisticData(60, 350, 20), "1Y": generateRealisticData(60, 250, 50), "ALL": generateRealisticData(60, 100, 200)
  } },
  { id: "GOOGL", name: "Alphabet", symbol: "GOOGL", category: "Stocks", price: 145.30, change: "+0.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 144, 1), "1D": generateRealisticData(60, 140, 3), "1W": generateRealisticData(60, 135, 5), "1M": generateRealisticData(60, 120, 10), "1Y": generateRealisticData(60, 100, 20), "ALL": generateRealisticData(60, 50, 50)
  } },
  { id: "AMZN", name: "Amazon", symbol: "AMZN", category: "Stocks", price: 170.40, change: "+2.1%", isUp: true, data: {
    "1H": generateRealisticData(60, 168, 2), "1D": generateRealisticData(60, 160, 5), "1W": generateRealisticData(60, 150, 10), "1M": generateRealisticData(60, 130, 20), "1Y": generateRealisticData(60, 100, 40), "ALL": generateRealisticData(60, 40, 100)
  } },
  { id: "META", name: "Meta Platforms", symbol: "META", category: "Stocks", price: 485.10, change: "+3.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 480, 5), "1D": generateRealisticData(60, 450, 15), "1W": generateRealisticData(60, 400, 30), "1M": generateRealisticData(60, 300, 50), "1Y": generateRealisticData(60, 150, 100), "ALL": generateRealisticData(60, 50, 200)
  } },
  { id: "NVDA", name: "NVIDIA", symbol: "NVDA", category: "Stocks", price: 726.13, change: "+4.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 720, 10), "1D": generateRealisticData(60, 700, 30), "1W": generateRealisticData(60, 650, 80), "1M": generateRealisticData(60, 500, 150), "1Y": generateRealisticData(60, 300, 300), "ALL": generateRealisticData(60, 50, 500)
  } },
  { id: "AMD", name: "AMD", symbol: "AMD", category: "Stocks", price: 175.20, change: "+2.8%", isUp: true, data: {
    "1H": generateRealisticData(60, 170, 2), "1D": generateRealisticData(60, 160, 5), "1W": generateRealisticData(60, 150, 10), "1M": generateRealisticData(60, 120, 20), "1Y": generateRealisticData(60, 80, 40), "ALL": generateRealisticData(60, 20, 100)
  } },
  { id: "TSLA", name: "Tesla", symbol: "TSLA", category: "Stocks", price: 198.32, change: "-2.1%", isUp: false, data: {
    "1H": generateRealisticData(60, 200, 5), "1D": generateRealisticData(60, 210, 15), "1W": generateRealisticData(60, 220, 30), "1M": generateRealisticData(60, 250, 50), "1Y": generateRealisticData(60, 300, 100), "ALL": generateRealisticData(60, 50, 200)
  } },
  { id: "NFLX", name: "Netflix", symbol: "NFLX", category: "Stocks", price: 580.40, change: "+1.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 575, 5), "1D": generateRealisticData(60, 550, 10), "1W": generateRealisticData(60, 500, 20), "1M": generateRealisticData(60, 450, 40), "1Y": generateRealisticData(60, 300, 80), "ALL": generateRealisticData(60, 100, 200)
  } },
  { id: "GOLD", name: "Gold", symbol: "XAU/USD", category: "Commodities", price: 2035.40, change: "-0.3%", isUp: false, data: {
    "1H": generateRealisticData(60, 2038, 5), "1D": generateRealisticData(60, 2050, 10), "1W": generateRealisticData(60, 2020, 30), "1M": generateRealisticData(60, 1980, 50), "1Y": generateRealisticData(60, 1800, 100), "ALL": generateRealisticData(60, 1500, 300)
  } },
  { id: "SILVER", name: "Silver", symbol: "XAG/USD", category: "Commodities", price: 22.80, change: "+1.2%", isUp: true, data: {
    "1H": generateRealisticData(60, 22.5, 0.5), "1D": generateRealisticData(60, 22.0, 1), "1W": generateRealisticData(60, 21.0, 2), "1M": generateRealisticData(60, 20.0, 4), "1Y": generateRealisticData(60, 18.0, 6), "ALL": generateRealisticData(60, 10.0, 10)
  } },
  { id: "OIL", name: "Crude Oil", symbol: "WTI", category: "Commodities", price: 78.40, change: "+1.8%", isUp: true, data: {
    "1H": generateRealisticData(60, 77, 1), "1D": generateRealisticData(60, 75, 2), "1W": generateRealisticData(60, 70, 5), "1M": generateRealisticData(60, 80, 10), "1Y": generateRealisticData(60, 90, 15), "ALL": generateRealisticData(60, 40, 40)
  } },
  { id: "COPPER", name: "Copper", symbol: "HG", category: "Commodities", price: 3.85, change: "-0.4%", isUp: false, data: {
    "1H": generateRealisticData(60, 3.86, 0.02), "1D": generateRealisticData(60, 3.9, 0.05), "1W": generateRealisticData(60, 3.8, 0.1), "1M": generateRealisticData(60, 3.5, 0.2), "1Y": generateRealisticData(60, 4.0, 0.4), "ALL": generateRealisticData(60, 2.0, 1.0)
  } },
  { id: "PLATINUM", name: "Platinum", symbol: "PL", category: "Commodities", price: 920.40, change: "+0.2%", isUp: true, data: {
    "1H": generateRealisticData(60, 918, 2), "1D": generateRealisticData(60, 930, 5), "1W": generateRealisticData(60, 900, 10), "1M": generateRealisticData(60, 1000, 20), "1Y": generateRealisticData(60, 1100, 50), "ALL": generateRealisticData(60, 800, 200)
  } },
  { id: "PALLADIUM", name: "Palladium", symbol: "PA", category: "Commodities", price: 980.20, change: "-1.5%", isUp: false, data: {
    "1H": generateRealisticData(60, 995, 5), "1D": generateRealisticData(60, 1050, 15), "1W": generateRealisticData(60, 1100, 30), "1M": generateRealisticData(60, 1500, 50), "1Y": generateRealisticData(60, 2000, 100), "ALL": generateRealisticData(60, 500, 1000)
  } },
  { id: "NATGAS", name: "Natural Gas", symbol: "NG", category: "Commodities", price: 1.85, change: "-2.4%", isUp: false, data: {
    "1H": generateRealisticData(60, 1.9, 0.05), "1D": generateRealisticData(60, 2.0, 0.1), "1W": generateRealisticData(60, 2.5, 0.2), "1M": generateRealisticData(60, 3.0, 0.5), "1Y": generateRealisticData(60, 5.0, 1.0), "ALL": generateRealisticData(60, 2.0, 4.0)
  } },
  { id: "CORN", name: "Corn", symbol: "ZC", category: "Commodities", price: 420.50, change: "+0.5%", isUp: true, data: {
    "1H": generateRealisticData(60, 418, 2), "1D": generateRealisticData(60, 430, 5), "1W": generateRealisticData(60, 450, 10), "1M": generateRealisticData(60, 500, 20), "1Y": generateRealisticData(60, 600, 50), "ALL": generateRealisticData(60, 300, 200)
  } },
  { id: "WHEAT", name: "Wheat", symbol: "ZW", category: "Commodities", price: 560.20, change: "-1.1%", isUp: false, data: {
    "1H": generateRealisticData(60, 565, 5), "1D": generateRealisticData(60, 580, 10), "1W": generateRealisticData(60, 600, 20), "1M": generateRealisticData(60, 700, 40), "1Y": generateRealisticData(60, 800, 80), "ALL": generateRealisticData(60, 400, 200)
  } },
];

export const generateComments = (count: number, sentiment: string) => {
  const users = ["@TraderX", "@WhaleWatch", "@Gokalp", "@CryptoKing", "@BearHunter", "@GoldBug", "@MacroEcon", "@DayTrader", "@SwingTrader", "@DefiDegen", "@NFTTrader", "@DevGuy", "@ShortSeller", "@PanicSeller", "@SolDev", "@AirdropHunter", "@Newbie", "@WallSt", "@Investor", "@ChipNerd", "@AI_Fan", "@GoldBug", "@Boomer", "@SupplyShock", "@SilverBug", "@Ape", "@AutoAnalyst", "@ElonFan", "@GreenEnergy"];
  const positiveTexts = ["Massive strength here!", "Bullish divergence spotted.", "Smart money is accumulating.", "Targeting the next resistance.", "Institutional inflows are real.", "Healthy consolidation before the next leg up.", "RSI looking good.", "Volume is picking up.", "Great entry point.", "Long and strong.", "Moon mission engaged.", "Fundamentals are solid.", "Buying the dip.", "Don't sell your bags.", "Future is bright.", "Incredible growth potential.", "Market leader for a reason.", "Undervalued at these levels.", "Next stop: All time high.", "WAGMI!"];
  const negativeTexts = ["Panic selling starting.", "Double top forming.", "Bearish divergence on the 4H.", "Too much retail FOMO.", "Funding rates are too high.", "Expect a flush soon.", "Volume is drying up.", "Trend is clearly bearish.", "Opening a short position.", "Taking profits and exiting.", "Market is overextended.", "Macro headwinds are too strong.", "Inflation is sticky.", "Bad news for risk-on assets.", "Dump incoming!", "Watch out for the trap.", "Liquidity is thin.", "Selling the news.", "Stay cautious.", "Bear market is not over."];
  const neutralTexts = ["Chop city. Sitting on hands.", "Waiting for a clear breakout.", "Consolidation continues.", "Market is waiting for a catalyst.", "Ranging between support and resistance.", "Sideways action for now.", "Neutral stance.", "Watching the levels closely.", "No clear direction yet.", "Volume is average.", "Price action is boring.", "Expect more range-bound movement.", "Indecision in the market.", "Equilibrium reached.", "Waiting for CPI data.", "Geopolitical uncertainty.", "Mixed signals on the chart.", "Stable for now.", "Nothing to see here.", "Patience is key."];
  
  const result = [];
  const posCount = Math.floor(count * 0.4);
  const negCount = Math.floor(count * 0.4);
  const neuCount = count - posCount - negCount;
  
  for (let i = 0; i < posCount; i++) {
    result.push({ 
      user: users[Math.floor(Math.random() * users.length)], 
      text: positiveTexts[Math.floor(Math.random() * positiveTexts.length)], 
      sentiment: "Positive",
      likes: Math.floor(Math.random() * 800) + 5
    });
  }
  for (let i = 0; i < negCount; i++) {
    result.push({ 
      user: users[Math.floor(Math.random() * users.length)], 
      text: negativeTexts[Math.floor(Math.random() * negativeTexts.length)], 
      sentiment: "Negative",
      likes: Math.floor(Math.random() * 800) + 5
    });
  }
  for (let i = 0; i < neuCount; i++) {
    result.push({ 
      user: users[Math.floor(Math.random() * users.length)], 
      text: neutralTexts[Math.floor(Math.random() * neutralTexts.length)], 
      sentiment: "Neutral",
      likes: Math.floor(Math.random() * 800) + 5
    });
  }
  
  return result.sort((a, b) => b.likes - a.likes);
};

export const generateAssetTranslations = (assetId: string) => {
  const points = [];
  const usedIndices = new Set<number>();
  
  // Generate 5 unique comment indices
  while (usedIndices.size < 5) {
    usedIndices.add(Math.floor(Math.random() * 50) + 5);
  }
  
  const commentIndices = Array.from(usedIndices);
  
  commentIndices.forEach((idx, i) => {
    const sentiments = ["Positive", "Neutral", "Negative"];
    const sentiment = sentiments[i % 3];
    points.push({
      idx,
      type: "comment",
      impact: Math.random() > 0.7 ? "major" : "minor",
      translation: i === 0 ? "Market sentiment is shifting." : 
                   i === 1 ? "Consolidation phase near support." :
                   i === 2 ? "Resistance level being tested." :
                   i === 3 ? "Profit taking observed at highs." :
                   "Volume accumulation starting.",
      sentiment,
      comments: generateComments(Math.floor(Math.random() * 450) + 15, sentiment)
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
        comments: generateComments(Math.floor(Math.random() * 800) + 50, "Positive")
      });
      addedNews++;
    }
  }

  return points;
};

export const MOCK_TRANSLATIONS = ASSETS.reduce((acc, asset) => {
  acc[asset.id] = generateAssetTranslations(asset.id);
  return acc;
}, {} as Record<string, any>);

export const COMMUNITY_POSTS = [
  { id: 1, user: "@CryptoKing", name: "Crypto King", avatar: "CK", time: "2h ago", text: "Bitcoin is showing massive strength here. If we break 44k, we fly.", likes: 342, comments: 45, success: 88 },
  { id: 2, user: "@BearHunter", name: "Bear Hunter", avatar: "BH", time: "4h ago", text: "Nasdaq looks overextended. Taking some profits on tech stocks today.", likes: 128, comments: 12, success: 74 },
  { id: 3, user: "@GoldBug", name: "Gold Bug", avatar: "GB", time: "5h ago", text: "Inflation data tomorrow. Gold is perfectly positioned for a run to 2100.", likes: 512, comments: 89, success: 92 },
  { id: 4, user: "@Gokalp", name: "Gökalp", avatar: "G", time: "8h ago", text: "Solana network activity is peaking again. Keep an eye on the ecosystem tokens.", likes: 892, comments: 134, success: 95 },
];
