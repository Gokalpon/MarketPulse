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
  { id: "BTC", name: "Bitcoin", symbol: "BTC/USD", category: "Crypto", price: 81250.0, change: "+1.8%", isUp: true },
  { id: "ETH", name: "Ethereum", symbol: "ETH/USD", category: "Crypto", price: 3120.0, change: "+2.4%", isUp: true },
  { id: "SOL", name: "Solana", symbol: "SOL/USD", category: "Crypto", price: 168.4, change: "-1.2%", isUp: false },
  { id: "ADA", name: "Cardano", symbol: "ADA/USD", category: "Crypto", price: 0.74, change: "+1.5%", isUp: true },
  { id: "DOT", name: "Polkadot", symbol: "DOT/USD", category: "Crypto", price: 8.6, change: "-0.8%", isUp: false },
  { id: "LINK", name: "Chainlink", symbol: "LINK/USD", category: "Crypto", price: 22.4, change: "+3.2%", isUp: true },
  { id: "AVAX", name: "Avalanche", symbol: "AVAX/USD", category: "Crypto", price: 41.8, change: "+2.1%", isUp: true },
  { id: "XRP", name: "Ripple", symbol: "XRP/USD", category: "Crypto", price: 2.34, change: "-0.5%", isUp: false },
  { id: "NASDAQ", name: "Nasdaq 100", symbol: "NDX", category: "Stocks", price: 19840.0, change: "+1.1%", isUp: true },
  { id: "AAPL", name: "Apple Inc.", symbol: "AAPL", category: "Stocks", price: 218.6, change: "+0.8%", isUp: true },
  { id: "MSFT", name: "Microsoft", symbol: "MSFT", category: "Stocks", price: 432.5, change: "+1.2%", isUp: true },
  { id: "GOOGL", name: "Alphabet", symbol: "GOOGL", category: "Stocks", price: 178.4, change: "+0.5%", isUp: true },
  { id: "AMZN", name: "Amazon", symbol: "AMZN", category: "Stocks", price: 198.2, change: "+2.1%", isUp: true },
  { id: "META", name: "Meta Platforms", symbol: "META", category: "Stocks", price: 612.8, change: "+3.5%", isUp: true },
  { id: "NVDA", name: "NVIDIA", symbol: "NVDA", category: "Stocks", price: 138.4, change: "+4.5%", isUp: true },
  { id: "AMD", name: "AMD", symbol: "AMD", category: "Stocks", price: 142.3, change: "+2.8%", isUp: true },
  { id: "TSLA", name: "Tesla", symbol: "TSLA", category: "Stocks", price: 286.4, change: "-2.1%", isUp: false },
  { id: "NFLX", name: "Netflix", symbol: "NFLX", category: "Stocks", price: 1085.0, change: "+1.5%", isUp: true },
  { id: "GOLD", name: "Gold", symbol: "XAU/USD", category: "Commodities", price: 3120.0, change: "-0.3%", isUp: false },
  { id: "SILVER", name: "Silver", symbol: "XAG/USD", category: "Commodities", price: 33.6, change: "+1.2%", isUp: true },
  { id: "OIL", name: "Crude Oil", symbol: "WTI", category: "Commodities", price: 68.4, change: "+1.8%", isUp: true },
  { id: "COPPER", name: "Copper", symbol: "HG", category: "Commodities", price: 4.62, change: "-0.4%", isUp: false },
  { id: "BIST100", name: "BIST 100", symbol: "XU100.IS", category: "Stocks", price: 10240.0, change: "+1.8%", isUp: true },
  { id: "ASELS", name: "Aselsan", symbol: "ASELS.IS", category: "Stocks", price: 168.5, change: "+2.3%", isUp: true },
  { id: "THYAO", name: "Turkish Airlines", symbol: "THYAO.IS", category: "Stocks", price: 312.4, change: "-1.2%", isUp: false },
  { id: "GARAN", name: "Garanti Bank", symbol: "GARAN.IS", category: "Stocks", price: 138.6, change: "+0.9%", isUp: true },
  { id: "SASA", name: "Sasa", symbol: "SASA.IS", category: "Stocks", price: 64.2, change: "+1.5%", isUp: true },
  { id: "KCHOL", name: "Koc Holding", symbol: "KCHOL.IS", category: "Stocks", price: 168.3, change: "+2.1%", isUp: true },
  { id: "DAX", name: "DAX 40", symbol: "^GDAXI", category: "Stocks", price: 21850.0, change: "+0.6%", isUp: true },
  { id: "SAP", name: "SAP SE", symbol: "SAP.DE", category: "Stocks", price: 248.6, change: "+1.1%", isUp: true },
  { id: "BMW", name: "BMW AG", symbol: "BMW.DE", category: "Stocks", price: 78.4, change: "-0.7%", isUp: false },
  { id: "VOW3", name: "Volkswagen", symbol: "VOW3.DE", category: "Stocks", price: 88.2, change: "-1.3%", isUp: false },
  { id: "NKY", name: "Nikkei 225", symbol: "^N225", category: "Stocks", price: 36420.0, change: "+0.9%", isUp: true },
  { id: "7203", name: "Toyota Motor", symbol: "7203.T", category: "Stocks", price: 2840.0, change: "+1.4%", isUp: true },
  { id: "6758", name: "Sony Group", symbol: "6758.T", category: "Stocks", price: 14250.0, change: "+2.2%", isUp: true },
  { id: "9984", name: "SoftBank Group", symbol: "9984.T", category: "Stocks", price: 8620.0, change: "-0.5%", isUp: false },
  { id: "PLATINUM", name: "Platinum", symbol: "XPT/USD", category: "Commodities", price: 982.0, change: "-0.2%", isUp: false },
  { id: "NATGAS", name: "Natural Gas", symbol: "NG", category: "Commodities", price: 3.85, change: "+3.1%", isUp: true },
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
