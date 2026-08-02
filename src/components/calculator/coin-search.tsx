import { useEffect, useRef, useState } from "react";
import { Search, RefreshCw, X, Loader2 } from "lucide-react";
import { searchCoins, getPrice, type CoinResult } from "@/lib/coingecko";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface CoinSearchProps {
  // Called with the live price whenever a coin is picked or refreshed.
  onPriceUpdate: (price: number) => void;
}

export function CoinSearch({ onPriceUpdate }: CoinSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CoinResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CoinResult | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search whenever the debounced query changes.
  useEffect(() => {
    let cancelled = false;
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    searchCoins(q)
      .then((coins) => {
        if (!cancelled) {
          setResults(coins);
          setOpen(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't search right now. Try again.");
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const loadPrice = async (coin: CoinResult) => {
    setLoadingPrice(true);
    setError(null);
    try {
      const p = await getPrice(coin.id);
      setPrice(p);
      setFetchedAt(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
      onPriceUpdate(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't fetch the price.");
    } finally {
      setLoadingPrice(false);
    }
  };

  const selectCoin = (coin: CoinResult) => {
    setSelected(coin);
    setQuery("");
    setResults([]);
    setOpen(false);
    void loadPrice(coin);
  };

  const clearCoin = () => {
    setSelected(null);
    setPrice(null);
    setError(null);
  };

  return (
    <div ref={containerRef} className="relative mb-6">
      {!selected && (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {searching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Look up a coin (optional) — e.g. Bitcoin"
            className="w-full bg-white border-2 border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm hover:border-slate-300"
          />
          {open && results.length > 0 && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {results.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => selectCoin(coin)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  {coin.thumb && (
                    <img src={coin.thumb} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  <span className="font-medium text-slate-900">{coin.name}</span>
                  <span className="text-slate-400 text-sm uppercase">{coin.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="flex items-center justify-between gap-3 bg-white border-2 border-slate-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {selected.thumb && (
              <img
                src={selected.thumb}
                alt=""
                className="w-6 h-6 rounded-full shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 truncate">
                  {selected.name}
                </span>
                <span className="text-slate-400 text-xs uppercase">
                  {selected.symbol}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {loadingPrice ? (
                  "Fetching price…"
                ) : price !== null ? (
                  <>
                    Live price:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      ${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </span>{" "}
                    · as of {fetchedAt}
                  </>
                ) : (
                  error ?? "—"
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => loadPrice(selected)}
              disabled={loadingPrice}
              title="Refresh price"
              className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", loadingPrice && "animate-spin")} />
            </button>
            <button
              onClick={clearCoin}
              title="Clear coin"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && !selected && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
