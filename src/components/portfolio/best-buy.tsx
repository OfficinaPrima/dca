import { useState } from "react";
import { Sparkles } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { blendedAverage, breakevenBounceNoBuy } from "@/lib/dca";
import type { Holding } from "@/lib/schwab";

export function BestBuy({ holdings }: { holdings: Holding[] }) {
  const [text, setText] = useState("");
  const budget = text === "" || text === "." ? 0 : Number(text);

  const onText = (raw: string) => {
    let v = raw.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    setText(v);
  };

  // Rank every underwater position by the break-even bounce it would need
  // after the whole budget is spent on it. Smallest bounce wins.
  const ranked =
    budget > 0
      ? holdings
          .filter((h) => h.currentPrice > 0 && h.currentPrice < h.avgCost)
          .map((h) => {
            const bought = budget / h.currentPrice;
            const newAvg = blendedAverage(h.shares, h.avgCost, bought, h.currentPrice);
            const rise = breakevenBounceNoBuy(newAvg, h.currentPrice);
            return { h, bought, newAvg, rise };
          })
          .sort((a, b) => a.rise - b.rise)
      : [];

  const best = ranked[0];

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg shadow-indigo-600/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5" />
        <h2 className="font-display font-bold text-lg">Can't decide? Let the numbers pick.</h2>
      </div>
      <p className="text-sm text-indigo-100 mb-4">
        Tell me what you've got, and I'll find the position where that money needs
        the smallest price bounce to break even.
      </p>

      <div className="flex items-center flex-wrap gap-2 mb-4">
        <span className="text-xl font-semibold">I have $</span>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder="1,000"
          className="w-32 bg-white/15 border border-white/30 rounded-lg px-3 py-2 text-xl font-mono text-white placeholder:text-indigo-200/70 focus:outline-none focus:border-white"
        />
        <span className="text-xl font-semibold">to invest.</span>
      </div>

      {budget > 0 && best && (
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-sm text-indigo-100">Your easiest path to break-even</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold mt-1 break-words [overflow-wrap:anywhere]">
            {best.h.symbol} · +{formatNumber(best.rise)}%
          </div>
          <div className="text-sm text-indigo-100 mt-1 break-words">
            Buy {formatNumber(best.bought)} shares at {formatCurrency(best.h.currentPrice)} →
            new average {formatCurrency(best.newAvg)}. Then just a +{formatNumber(best.rise)}%
            move and you're green.
          </div>
          {ranked.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/15 space-y-1 text-sm text-indigo-100">
              {ranked.slice(1).map((r) => (
                <div key={r.h.symbol} className="flex justify-between gap-3">
                  <span className="truncate">{r.h.symbol}</span>
                  <span className="font-mono shrink-0">+{formatNumber(r.rise)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {budget > 0 && !best && (
        <div className="bg-white/10 rounded-xl p-4 text-sm text-indigo-100">
          You're in the green on everything — nothing to average down.
        </div>
      )}
    </div>
  );
}
