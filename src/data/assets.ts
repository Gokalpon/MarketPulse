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

const dataCache = new Map<string, number[]>();

const generateFallbackPriceSeries = (pointsCount: number, startValue: number, volatility: number) => {
  let value = startValue;
  const data: number[] = [];

  for (let index = 0; index < pointsCount; index += 1) {
    value += (Math.random() - 0.45) * volatility;
    data.push(value);
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
  data: Record<string, number[]>;
}

const assetConfigs = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC/USD", category: "Crypto", price: 43520.0, change: "+4.2%", isUp: true },
  { id: "ETH", name: "Ethereum", symbol: "ETH/USD", category: "Crypto", price: 2240.5, change: "+2.4%", isUp: true },
  { id: "SOL", name: "Solana", symbol: "SOL/USD", category: "Crypto", price: 98.2, change: "-1.2%", isUp: false },
  { id: "ADA", name: "Cardano", symbol: "ADA/USD", category: "Crypto", price: 0.52, change: "+1.5%", isUp: true },
  { id: "DOT", name: "Polkadot", symbol: "DOT/USD", category: "Crypto", price: 7.2, change: "-0.8%", isUp: false },
  { id: "LINK", name: "Chainlink", symbol: "LINK/USD", category: "Crypto", price: 18.5, change: "+3.2%", isUp: true },
  { id: "AVAX", name: "Avalanche", symbol: "AVAX/USD", category: "Crypto", price: 35.4, change: "+2.1%", isUp: true },
  { id: "XRP", name: "Ripple", symbol: "XRP/USD", category: "Crypto", price: 0.58, change: "-0.5%", isUp: false },
  { id: "NASDAQ", name: "Nasdaq 100", symbol: "NDX", category: "Stocks", price: 17850.2, change: "+1.1%", isUp: true },
  { id: "AAPL", name: "Apple Inc.", symbol: "AAPL", category: "Stocks", price: 185.92, change: "+0.8%", isUp: true },
  { id: "MSFT", name: "Microsoft", symbol: "MSFT", category: "Stocks", price: 405.2, change: "+1.2%", isUp: true },
  { id: "GOOGL", name: "Alphabet", symbol: "GOOGL", category: "Stocks", price: 145.3, change: "+0.5%", isUp: true },
  { id: "AMZN", name: "Amazon", symbol: "AMZN", category: "Stocks", price: 170.4, change: "+2.1%", isUp: true },
  { id: "META", name: "Meta Platforms", symbol: "META", category: "Stocks", price: 485.1, change: "+3.5%", isUp: true },
  { id: "NVDA", name: "NVIDIA", symbol: "NVDA", category: "Stocks", price: 726.13, change: "+4.5%", isUp: true },
  { id: "AMD", name: "AMD", symbol: "AMD", category: "Stocks", price: 175.2, change: "+2.8%", isUp: true },
  { id: "TSLA", name: "Tesla", symbol: "TSLA", category: "Stocks", price: 198.32, change: "-2.1%", isUp: false },
  { id: "NFLX", name: "Netflix", symbol: "NFLX", category: "Stocks", price: 580.4, change: "+1.5%", isUp: true },
  { id: "GOLD", name: "Gold", symbol: "XAU/USD", category: "Commodities", price: 2035.4, change: "-0.3%", isUp: false },
  { id: "SILVER", name: "Silver", symbol: "XAG/USD", category: "Commodities", price: 22.8, change: "+1.2%", isUp: true },
  { id: "OIL", name: "Crude Oil", symbol: "WTI", category: "Commodities", price: 78.4, change: "+1.8%", isUp: true },
  { id: "COPPER", name: "Copper", symbol: "HG", category: "Commodities", price: 3.85, change: "-0.4%", isUp: false },
  { id: "BIST100", name: "BIST 100", symbol: "XU100.IS", category: "Stocks", price: 8450.23, change: "+1.8%", isUp: true },
  { id: "ASELS", name: "Aselsan", symbol: "ASELS.IS", category: "Stocks", price: 156.8, change: "+2.3%", isUp: true },
  { id: "THYAO", name: "Turkish Airlines", symbol: "THYAO.IS", category: "Stocks", price: 28.45, change: "-1.2%", isUp: false },
  { id: "GARAN", name: "Garanti Bank", symbol: "GARAN.IS", category: "Stocks", price: 45.6, change: "+0.9%", isUp: true },
  { id: "SASA", name: "Sasa", symbol: "SASA.IS", category: "Stocks", price: 89.3, change: "+1.5%", isUp: true },
  { id: "KCHOL", name: "Koc Holding", symbol: "KCHOL.IS", category: "Stocks", price: 92.15, change: "+2.1%", isUp: true },
  { id: "DAX", name: "DAX 40", symbol: "^GDAXI", category: "Stocks", price: 18420.0, change: "+0.6%", isUp: true },
  { id: "SAP", name: "SAP SE", symbol: "SAP.DE", category: "Stocks", price: 178.3, change: "+1.1%", isUp: true },
  { id: "BMW", name: "BMW AG", symbol: "BMW.DE", category: "Stocks", price: 102.5, change: "-0.7%", isUp: false },
  { id: "VOW3", name: "Volkswagen", symbol: "VOW3.DE", category: "Stocks", price: 115.2, change: "-1.3%", isUp: false },
  { id: "NKY", name: "Nikkei 225", symbol: "^N225", category: "Stocks", price: 38950.0, change: "+0.9%", isUp: true },
  { id: "7203", name: "Toyota Motor", symbol: "7203.T", category: "Stocks", price: 3250.0, change: "+1.4%", isUp: true },
  { id: "6758", name: "Sony Group", symbol: "6758.T", category: "Stocks", price: 12800.0, change: "+2.2%", isUp: true },
  { id: "9984", name: "SoftBank Group", symbol: "9984.T", category: "Stocks", price: 7940.0, change: "-0.5%", isUp: false },
  { id: "PLATINUM", name: "Platinum", symbol: "XPT/USD", category: "Commodities", price: 915.0, change: "-0.2%", isUp: false },
  { id: "NATGAS", name: "Natural Gas", symbol: "NG", category: "Commodities", price: 2.35, change: "+3.1%", isUp: true },
];

const createLazyAsset = (config: (typeof assetConfigs)[number]): Asset => {
  const asset = { ...config } as Asset;

  return new Proxy(asset, {
    get(target, prop) {
      if (prop === "data") {
        if (!target.data) {
          target.data = getAssetData(target.id);
        }
        return target.data;
      }

      return target[prop as keyof Asset];
    },
  });
};

export const ASSETS: Asset[] = assetConfigs.map(createLazyAsset);

export const getAssetData = (assetId: string): Record<string, number[]> => {
  const asset = assetConfigs.find((item) => item.id === assetId);
  if (!asset) return {};

  const config: Record<string, [number, number]> = {
    "1H": [30, 0.5],
    "1D": [30, 2],
    "1W": [30, 5],
    "1M": [30, 10],
    "1Y": [30, 25],
    ALL: [30, 50],
  };

  const result: Record<string, number[]> = {};

  for (const [period, [points, volatility]] of Object.entries(config)) {
    const key = `${assetId}-${period}`;
    if (!dataCache.has(key)) {
      dataCache.set(key, generateFallbackPriceSeries(points, asset.price, volatility));
    }
    result[period] = dataCache.get(key)!;
  }

  return result;
};
