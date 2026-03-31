import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q required" });

  try {
    const result = await yahooFinance.search(q);
    const quotes = (result?.quotes || [])
      .filter((r) => r.isYahooFinance && r.symbol)
      .slice(0, 10)
      .map((r) => ({
        symbol: r.symbol,
        shortname: r.shortname || r.longname || r.symbol,
        longname: r.longname,
        quoteType: r.quoteType,
        exchange: r.exchDisp || r.exchange,
      }));
    res.json(quotes);
  } catch (err) {
    console.error(`Search error [${q}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
}
