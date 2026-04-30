const SOURCE_TRUST = {
  Reddit: 0.9,
  TradingView: 0.85,
  Investing: 0.8,
  StockTwits: 0.72,
  X: 0.65,
  News: 0.95,
  Web: 0.6,
};

const SENTIMENT_SCORE = {
  Positive: 1,
  Neutral: 0,
  Negative: -1,
};

const PRICE_CONTEXT_WORDS = [
  "price",
  "target",
  "entry",
  "support",
  "resistance",
  "breakout",
  "level",
  "zone",
  "tp",
  "sl",
  "fiyat",
  "hedef",
  "giris",
  "giriş",
  "destek",
  "direnc",
  "direnç",
  "seviye",
  "bolge",
  "bölge",
];

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function getCombinedText(comment) {
  return normalizeText([comment.text, comment.fullText, comment.title].filter(Boolean).join(" "));
}

function parseNumberToken(rawValue = "") {
  const hasK = /k\b/i.test(rawValue);
  const cleaned = rawValue
    .replace(/[$€£₺¥]/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/k\b/i, "");

  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return null;
  return hasK ? value * 1000 : value;
}

export function extractExplicitPrices(text = "") {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const hasPriceContext = PRICE_CONTEXT_WORDS.some((word) => lower.includes(word));
  const matches = [];
  const priceRegex = /(?:[$€£₺¥]\s*)?\b(?:\d{1,3}(?:,\d{3})+|\d{4,8}|\d{1,3})(?:\.\d+)?k?\b|\b\d+(?:\.\d+)?k\b/gi;

  for (const match of normalized.matchAll(priceRegex)) {
    const token = match[0];
    const value = parseNumberToken(token);
    if (!value || value <= 0) continue;

    const before = normalized.slice(Math.max(0, match.index - 12), match.index);
    const after = normalized.slice(match.index + token.length, match.index + token.length + 12);
    const isPercent = after.trim().startsWith("%") || after.trim().startsWith("percent");
    const isLikelyYear = value >= 1900 && value <= 2100 && !hasPriceContext && !/[$€£₺¥]|k/i.test(token);
    const hasCurrencyOrK = /[$€£₺¥]|k/i.test(token);
    const localContext = `${before} ${after}`.toLowerCase();
    const hasNearbyPriceWord = PRICE_CONTEXT_WORDS.some((word) => localContext.includes(word));

    if (isPercent || isLikelyYear) continue;
    if (!hasCurrencyOrK && !hasPriceContext && !hasNearbyPriceWord) continue;

    matches.push(value);
  }

  return [...new Set(matches)].slice(0, 4);
}

export function extractReferencedTimestamp(text = "", postedAt = Date.now()) {
  const lower = normalizeText(text).toLowerCase();
  const relative = lower.match(/(\d{1,3})\s*(h|hr|hrs|hour|hours|saat|sa)\s*(ago|once|önce|evvel)?/);
  if (relative) {
    return postedAt - Number(relative[1]) * 60 * 60 * 1000;
  }

  const dayRelative = lower.match(/(\d{1,2})\s*(d|day|days|gün|gun)\s*(ago|once|önce|evvel)?/);
  if (dayRelative) {
    return postedAt - Number(dayRelative[1]) * 24 * 60 * 60 * 1000;
  }

  if (/\b(yesterday|dün|dun)\b/.test(lower)) {
    return postedAt - 24 * 60 * 60 * 1000;
  }

  const clock = lower.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (clock) {
    const date = new Date(postedAt);
    date.setHours(Number(clock[1]), Number(clock[2]), 0, 0);
    return date.getTime();
  }

  return null;
}

function binarySearchNearestByTime(chartPoints, timestamp) {
  if (!chartPoints.length || !Number.isFinite(timestamp)) return null;
  let left = 0;
  let right = chartPoints.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (chartPoints[mid].timestamp < timestamp) left = mid + 1;
    else right = mid;
  }

  const prev = chartPoints[Math.max(0, left - 1)];
  const next = chartPoints[left];
  if (!prev) return next;
  if (!next) return prev;
  return Math.abs(prev.timestamp - timestamp) <= Math.abs(next.timestamp - timestamp) ? prev : next;
}

function findBestPricePoint(chartPoints, targetPrice, referenceTimestamp) {
  if (!chartPoints.length || !targetPrice) return null;

  let best = null;
  let bestScore = Infinity;
  const target = Number(targetPrice);
  const priceTolerancePct = target >= 1000 ? 0.006 : target >= 10 ? 0.012 : 0.02;

  for (const point of chartPoints) {
    const priceErrorPct = Math.abs(point.price - target) / Math.max(Math.abs(target), 0.000001);
    if (priceErrorPct > Math.max(priceTolerancePct, 0.0008)) continue;

    const timePenalty = Number.isFinite(referenceTimestamp)
      ? Math.min(Math.abs(point.timestamp - referenceTimestamp) / (24 * 60 * 60 * 1000), 3) * 0.015
      : 0;
    const score = priceErrorPct + timePenalty;

    if (score < bestScore) {
      bestScore = score;
      best = point;
    }
  }

  return best;
}

function getSessionPoint(chartPoints, timestamp) {
  const nearest = binarySearchNearestByTime(chartPoints, timestamp);
  if (!nearest) return null;

  const day = new Date(timestamp);
  const nearestDay = new Date(nearest.timestamp);
  const sameDay = day.getFullYear() === nearestDay.getFullYear()
    && day.getMonth() === nearestDay.getMonth()
    && day.getDate() === nearestDay.getDate();

  return sameDay ? nearest : null;
}

function getBindingLabel(kind) {
  if (kind === "exact_price") return "Exact price";
  if (kind === "inferred_time") return "Referenced time";
  if (kind === "session_context") return "Session context";
  return "Unbound";
}

export function bindCommentsToChart(rawComments = [], chartPoints = [], currentPrice = 0) {
  return rawComments
    .map((comment) => {
      const text = getCombinedText(comment);
      const postedAt = Number(comment.timestamp) || Date.now();
      const referencedTimestamp = Number(comment.targetTimestamp)
        || Number(comment.referencedTimestamp)
        || extractReferencedTimestamp(text, postedAt);
      const explicitPrices = [
        Number(comment.priceAtComment) || null,
        ...extractExplicitPrices(text),
      ].filter(Boolean);

      let point = null;
      let bindingKind = "unbound";
      let bindingConfidence = 0;
      let displayMode = "hidden";
      let includeInPulse = false;
      let pulseWeightMultiplier = 0;

      if (explicitPrices.length > 0) {
        for (const price of explicitPrices) {
          const candidate = findBestPricePoint(chartPoints, price, referencedTimestamp || postedAt);
          if (candidate) {
            point = candidate;
            break;
          }
        }

        if (point) {
          bindingKind = "exact_price";
          bindingConfidence = referencedTimestamp ? 0.96 : 0.88;
          displayMode = "price_marker";
          includeInPulse = true;
          pulseWeightMultiplier = 1;
        }
      }

      if (!point && referencedTimestamp) {
        point = binarySearchNearestByTime(chartPoints, referencedTimestamp);
        if (point) {
          bindingKind = "inferred_time";
          bindingConfidence = 0.72;
          displayMode = "price_marker";
          includeInPulse = true;
          pulseWeightMultiplier = 0.72;
        }
      }

      if (!point) {
        point = getSessionPoint(chartPoints, postedAt);
        if (point) {
          bindingKind = "session_context";
          bindingConfidence = 0.42;
          displayMode = "session_marker";
          includeInPulse = true;
          pulseWeightMultiplier = 0.28;
        }
      }

      if (!point && currentPrice) {
        point = { index: null, price: currentPrice, timestamp: postedAt };
      }

      if (!text || !postedAt) return null;

      return {
        ...comment,
        text: comment.text || text,
        timestamp: postedAt,
        priceAtComment: point?.price,
        chartIndex: point?.index,
        chartTimestamp: point?.timestamp,
        bindingKind,
        bindingLabel: getBindingLabel(bindingKind),
        bindingConfidence,
        displayMode,
        includeInPulse,
        pulseWeightMultiplier,
        verified: bindingKind === "exact_price" || bindingKind === "inferred_time",
      };
    })
    .filter(Boolean);
}

function dominantSentiment(comments) {
  const counts = comments.reduce((acc, comment) => {
    acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;
    return acc;
  }, {});

  if ((counts.Positive || 0) > (counts.Negative || 0) && (counts.Positive || 0) >= (counts.Neutral || 0)) return "Positive";
  if ((counts.Negative || 0) > (counts.Positive || 0) && (counts.Negative || 0) >= (counts.Neutral || 0)) return "Negative";
  return "Neutral";
}

export function buildCommentClusters(comments = []) {
  const visibleComments = comments.filter((comment) => Number.isInteger(comment.chartIndex) && comment.displayMode !== "hidden");
  const groups = new Map();

  for (const comment of visibleComments) {
    const bucket = comment.bindingKind === "session_context"
      ? `session:${new Date(comment.chartTimestamp || comment.timestamp).toISOString().slice(0, 10)}:${comment.chartIndex}`
      : `price:${comment.chartIndex}`;

    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket).push(comment);
  }

  return [...groups.values()]
    .map((group) => {
      const bindingKind = group.some((c) => c.bindingKind === "exact_price")
        ? "exact_price"
        : group.some((c) => c.bindingKind === "inferred_time")
          ? "inferred_time"
          : "session_context";
      const avgIdx = Math.round(group.reduce((sum, c) => sum + c.chartIndex, 0) / group.length);
      const avgPrice = group.reduce((sum, c) => sum + (c.priceAtComment || 0), 0) / group.length;
      const sourceSet = [...new Set(group.map((c) => c.source).filter(Boolean))].slice(0, 3);

      return {
        comments: group.sort((a, b) => (b.likes || 0) - (a.likes || 0)),
        avgPrice,
        avgIdx,
        sentiment: dominantSentiment(group),
        count: group.length,
        bindingKind,
        origin: "external",
        sources: sourceSet,
        translation: bindingKind === "session_context"
          ? `${group.length} session comments`
          : `${group.length} price-linked comments`,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function calculateCommentPulse(comments = []) {
  let totalWeight = 0;
  let weightedScore = 0;
  const now = Date.now();

  for (const comment of comments) {
    const sentimentScore = SENTIMENT_SCORE[comment.sentiment] ?? 0;
    const sourceTrust = SOURCE_TRUST[comment.source] ?? SOURCE_TRUST.Web;
    const engagementWeight = Math.log1p(Math.max(0, Number(comment.likes) || 0)) + 1;
    const ageHours = Math.max(0, (now - (Number(comment.timestamp) || now)) / 3600000);
    const recencyWeight = Math.max(0.35, Math.exp(-ageHours / 72));
    const bindingWeight = comment.pulseWeightMultiplier ?? 0.25;
    const confidence = comment.bindingConfidence || 0.3;
    const weight = sourceTrust * engagementWeight * recencyWeight * bindingWeight * confidence;

    totalWeight += weight;
    weightedScore += sentimentScore * weight;
  }

  if (totalWeight <= 0) {
    return { pulseScore: 50, sentiment: "Neutral" };
  }

  const normalized = weightedScore / totalWeight;
  const pulseScore = Math.max(0, Math.min(100, Math.round(50 + normalized * 50)));
  const sentiment = pulseScore >= 60 ? "Positive" : pulseScore <= 40 ? "Negative" : "Neutral";

  return { pulseScore, sentiment };
}

export function getBindingStats(comments = []) {
  return comments.reduce((acc, comment) => {
    const key = comment.bindingKind || "unbound";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {
    exact_price: 0,
    inferred_time: 0,
    session_context: 0,
    unbound: 0,
  });
}
