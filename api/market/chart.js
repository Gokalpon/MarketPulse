import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

const RANGE_MS = {
  "1h":  1 * 60 * 60 * 1000,
  "1d":  1 * 24 * 60 * 60 * 1000,
  "1wk": 7 * 24 * 60 * 60 * 1000,
  "1mo": 30 * 24 * 60 * 60 * 1000,
  "1y":  365 * 24 * 60 * 60 * 1000,
  "5y":  5 * 365 * 24 * 60 * 60 * 1000,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, interval, range } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const now = new Date();
    const ms = RANGE_MS[range] || RANGE_MS["1d"];
    const period1 = new Date(now - ms);

    const result = await yahooFinance.chart(symbol, {
      period1,
      period2: now,
      interval: interval || "15m",
    });

    const quotes = result?.quotes || [];
    const prices = quotes
      .map((q) => q.close ?? q.open ?? null)
      .filter((p) => p !== null && !isNaN(p));

    res.json(prices);
  } catch (err) {
    console.error(`Chart error [${symbol}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
}
