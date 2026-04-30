// ──── TRANSLATIONS ────
export interface TranslationStrings {
  [key: string]: string;
}

export interface Translations {
  [language: string]: TranslationStrings;
}

// ──── USER COMMENTS ────
export interface UserComment {
  id: string;
  assetId: string;
  timeframe: string;
  chartIndex: number;
  price: number;
  text: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  timestamp: number;
  user?: string;
  likes?: number;
  source?: string;
  url?: string;
  priceAtComment?: number;
  chartTimestamp?: number;
  bindingKind?: "exact_price" | "inferred_time" | "session_context" | "unbound";
  bindingLabel?: string;
  bindingConfidence?: number;
  displayMode?: "price_marker" | "session_marker" | "hidden";
}

// ──── SENTIMENT CLUSTERS ────
export interface SentimentCluster {
  comments: UserComment[];
  avgPrice: number;
  avgIdx: number;
  sentiment: "Positive" | "Negative" | "Neutral";
  count: number;
  translation?: string;
  bindingKind?: "exact_price" | "inferred_time" | "session_context" | "unbound";
  origin?: "user" | "external";
  sources?: string[];
}

// ──── POINT/DETAILED POINT ────
export interface DetailedPointData {
  comments: UserComment[];
  sentiment: "Positive" | "Negative" | "Neutral";
  count: number;
  avgIdx?: number;
  avgPrice?: number;
  translation?: string;
  type?: string;
  newsUrl?: string;
  idx?: number;
  aiSummary?: string;
  globalInsight?: string;
  categorySummaries?: Record<string, string>;
  categoryStats?: Record<string, { count: number; avgPrice?: number; detail?: string }>;
  bindingKind?: "exact_price" | "inferred_time" | "session_context" | "unbound";
  origin?: "user" | "external";
}

// ──── COMMUNITY POST ────
export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  text: string;
  sentiment: string;
  timestamp: number;
  replies?: number;
}

// ──── MARKET DATA ────
export interface MarketDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

// ──── NEWS/CONSENSUS POINT ────
export interface NewsOrConsensusPoint {
  idx: number;
  type: "news" | "consensus";
  title?: string;
  text?: string;
  translation?: string;
  sentiment?: "Positive" | "Negative" | "Neutral";
  impact?: string;
  comments?: UserComment[];
  newsUrl?: string;
}

// ──── CHART CROSSHAIR ────
export interface ChartCrosshair {
  idx: number;
  price: number;
  x: number;
  y: number;
}
