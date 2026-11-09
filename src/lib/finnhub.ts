// Finnhub stock quotes. The key is embedded on purpose — this is a static site,
// so the client calls Finnhub directly. It's a free quote-only key; if its quota
// is ever abused we move it behind a relay (see notes). Quotes may be delayed.
const FINNHUB_KEY = "dboitrpr01qo2f3i1og0dboitrpr01qo2f3i1ogg";
const BASE = "https://finnhub.io/api/v1";

export interface StockResult {
  symbol: string;
  description: string;
}

/** Search US common stocks by ticker or company name. */
export async function searchStocks(query: string): Promise<StockResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(
    `${BASE}/search?q=${encodeURIComponent(q)}&exchange=US&token=${FINNHUB_KEY}`,
  );
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  return (data.result ?? [])
    .filter(
      (r: { symbol: string; type: string }) =>
        r.type === "Common Stock" && !r.symbol.includes("."),
    )
    .slice(0, 8)
    .map((r: { symbol: string; description: string }) => ({
      symbol: r.symbol,
      description: r.description,
    }));
}

/** Current price for a ticker (Finnhub "c"). Throws if unavailable. */
export async function getQuote(symbol: string): Promise<number> {
  const res = await fetch(
    `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`,
  );
  if (!res.ok) throw new Error(`Quote failed (${res.status})`);
  const data = await res.json();
  const price = data?.c;
  if (typeof price !== "number" || price === 0) {
    throw new Error("No price available for this symbol.");
  }
  return price;
}
