// Thin wrappers over CoinGecko's free, keyless public API. Both endpoints are
// CORS-enabled, so they run straight from the browser — no server, no API key.

export interface CoinResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

const BASE = "https://api.coingecko.com/api/v3";

/** Search coins by name or ticker. Returns the top matches. */
export async function searchCoins(query: string): Promise<CoinResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  return (data.coins ?? []).slice(0, 8).map(
    (c: { id: string; symbol: string; name: string; thumb: string }) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      thumb: c.thumb,
    }),
  );
}

/** Current USD price for a coin id (e.g. "bitcoin"). */
export async function getPrice(id: string): Promise<number> {
  const res = await fetch(
    `${BASE}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`,
  );
  if (!res.ok) throw new Error(`Price lookup failed (${res.status})`);
  const data = await res.json();
  const price = data?.[id]?.usd;
  if (typeof price !== "number") throw new Error("No price returned for this coin.");
  return price;
}
