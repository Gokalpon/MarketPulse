import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

const formatVolume = (v) => {
  if (!v) return "N/A";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(2) + "K";
  return v.toString();
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const quote = await yahooFinance.quote(symbol);

    const price = quote.regularMarketPrice ?? 0;
    const prevClose = quote.regularMarketPreviousClose ?? price;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const isUp = changePercent >= 0;

    res.json({
      price,
      change: (isUp ? "+" : "") + changePercent.toFixed(2) + "%",
      changePercent,
      isUp,
      high: quote.regularMarketDayHigh ?? price,
      low: quote.regularMarketDayLow ?? price,
      volume: formatVolume(quote.regularMarketVolume),
    });
  } catch (err) {
    console.error(`Quote error [${symbol}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
}
