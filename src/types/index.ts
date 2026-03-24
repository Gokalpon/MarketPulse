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
}

// ──── SENTIMENT CLUSTERS ────
export interface SentimentCluster {
  comments: UserComment[];
  avgPrice: number;
  avgIdx: number;
  sentiment: "Positive" | "Negative" | "Neutral";
  count: number;
}

// ──── POINT/DETAILED POINT ────
export interface DetailedPointData {
  comments: UserComment[];
  sentiment: "Positive" | "Negative" | "Neutral";
  count: number;
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
}

// ──── CHART CROSSHAIR ────
export interface ChartCrosshair {
  idx: number;
  price: number;
  x: number;
  y: number;
}
