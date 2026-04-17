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
  id: z.string(),
  user: z.string(),
  text: z.string(),
  likes: z.number(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  source: z.string(),
  timestamp: z.number(),
  priceAtComment: z.number().optional(),
});

export const CategoryStatsSchema = z.object({
  bullish: z.object({ count: z.number(), avgPrice: z.number() }),
  bearish: z.object({ count: z.number(), avgPrice: z.number() }),
  neutral: z.object({ count: z.number(), avgPrice: z.number() }),
});

export const MarketInsightSchema = z.object({
  assetId: z.string(),
  assetName: z.string(),
  pulseScore: z.number(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  aiSummary: z.string(),
  categoryStats: CategoryStatsSchema.optional(),
  comments: z.array(MarketInsightCommentSchema),
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
