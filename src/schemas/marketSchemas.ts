import { z } from 'zod';

// ============================================
// API Response Schemas
// ============================================

export const QuoteDataSchema = z.object({
  price: z.number(),
  change: z.string(),
  changePercent: z.number(),
  isUp: z.boolean(),
  high: z.number(),
  low: z.number(),
  volume: z.string(),
});

export type QuoteData = z.infer<typeof QuoteDataSchema>;

export const TimeSeriesSchema = z.array(z.number()).min(1);

export const ChartPointSchema = z.object({
  index: z.number(),
  timestamp: z.number(),
  price: z.number(),
  open: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  close: z.number().optional(),
  volume: z.number().optional(),
});

export const ChartPointSeriesSchema = z.array(ChartPointSchema).min(1);

export const SearchQuoteSchema = z.object({
  symbol: z.string(),
  shortname: z.string().optional(),
  longname: z.string().optional(),
  quoteType: z.string().optional(),
});

export type SearchQuote = z.infer<typeof SearchQuoteSchema>;

// ============================================
// Asset Schemas
// ============================================

export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  category: z.string(),
  price: z.number(),
  change: z.string(),
  isUp: z.boolean(),
  data: z.record(z.array(z.number())).optional(),
});

export type Asset = z.infer<typeof AssetSchema>;

// ============================================
// Comment Schemas
// ============================================

export const UserCommentSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  timeframe: z.string(),
  chartIndex: z.number(),
  price: z.number(),
  text: z.string(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  timestamp: z.number(),
});

export type UserComment = z.infer<typeof UserCommentSchema>;

// ============================================
// Market Insight Schemas
// ============================================

export const MarketInsightCommentSchema = z.object({
  id: z.string().optional(),
  user: z.string().optional().default('Anonymous'),
  text: z.string(),
  likes: z.number().optional().default(0),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  source: z.string().optional().default('Web'),
  timestamp: z.number().optional().default(() => Date.now()),
  priceAtComment: z.number().optional(),
  chartIndex: z.number().nullable().optional(),
  chartTimestamp: z.number().optional(),
  bindingKind: z.enum(['exact_price', 'inferred_time', 'session_context', 'unbound']).optional(),
  bindingLabel: z.string().optional(),
  bindingConfidence: z.number().optional(),
  displayMode: z.enum(['price_marker', 'session_marker', 'hidden']).optional(),
  includeInPulse: z.boolean().optional(),
  pulseWeightMultiplier: z.number().optional(),
  url: z.string().optional(),
});

export const MarketInsightClusterSchema = z.object({
  comments: z.array(MarketInsightCommentSchema),
  avgPrice: z.number(),
  avgIdx: z.number(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  count: z.number(),
  translation: z.string().optional(),
  bindingKind: z.enum(['exact_price', 'inferred_time', 'session_context', 'unbound']).optional(),
  origin: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

export const CategoryStatsSchema = z.object({
  bullish: z.object({ count: z.number().default(0), avgPrice: z.number().optional() }).optional(),
  bearish: z.object({ count: z.number().default(0), avgPrice: z.number().optional() }).optional(),
  neutral: z.object({ count: z.number().default(0), avgPrice: z.number().optional() }).optional(),
});

export const MarketInsightSchema = z.object({
  assetId: z.string(),
  assetName: z.string(),
  timeframe: z.string().optional(),
  pulseScore: z.number(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  aiSummary: z.string(),
  categorySummaries: z.object({
    positive: z.string().optional(),
    negative: z.string().optional(),
    neutral: z.string().optional(),
  }).optional(),
  globalInsight: z.string().optional(),
  categoryStats: CategoryStatsSchema.optional(),
  comments: z.array(MarketInsightCommentSchema),
  commentClusters: z.array(MarketInsightClusterSchema).optional().default([]),
  bindingStats: z.record(z.number()).optional(),
});

export type MarketInsight = z.infer<typeof MarketInsightSchema>;

// ============================================
// Validation Helpers
// ============================================

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): SafeParseResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
  return { success: false, error: errorMessage };
}

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
