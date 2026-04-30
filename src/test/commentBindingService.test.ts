import { describe, expect, it } from "vitest";
import {
  bindCommentsToChart,
  buildCommentClusters,
  calculateCommentPulse,
} from "../../server/services/commentBindingService.js";

describe("commentBindingService", () => {
  it("separates exact price, referenced time, and session context comments", () => {
    const now = Date.UTC(2026, 3, 30, 12, 0, 0);
    const chartPoints = Array.from({ length: 12 }, (_, index) => ({
      index,
      timestamp: now - (11 - index) * 60 * 60 * 1000,
      price: 90000 + index * 1000,
    }));

    const bound = bindCommentsToChart([
      { text: "BTC 95000 support looks strong", timestamp: now, source: "Reddit", sentiment: "Positive", likes: 12 },
      { text: "5 hours ago resistance was weak", timestamp: now, source: "TradingView", sentiment: "Negative", likes: 4 },
      { text: "general mood is mixed today", timestamp: now, source: "Investing", sentiment: "Neutral", likes: 1 },
    ], chartPoints, 101000);

    expect(bound.map((comment) => comment.bindingKind)).toEqual([
      "exact_price",
      "inferred_time",
      "session_context",
    ]);
    expect(bound[0].chartIndex).toBe(5);
    expect(buildCommentClusters(bound)).toHaveLength(3);
    expect(calculateCommentPulse(bound).pulseScore).toBeGreaterThan(50);
  });
});
