import { useEffect, useState } from "react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import {
  blendedAverage,
  breakevenBounceNoBuy,
  sharesForBounceBreakeven,
  sharesForTargetAverage,
} from "@/lib/dca";
import type { Holding } from "@/lib/schwab";

type Mode = "bounce" | "shares" | "budget" | "target";

const MODES: { id: Mode; label: string }[] = [
  { id: "bounce", label: "Break-even" },
  { id: "shares", label: "Buy shares" },
  { id: "budget", label: "Budget" },
  { id: "target", label: "Target avg" },
];

export function AssetCard({ holding }: { holding: Holding }) {
  const { symbol, description, shares, avgCost, currentPrice, gainPct } = holding;
  const underwater = currentPrice < avgCost;

  const [mode, setMode] = useState<Mode>("bounce");
  const [bounce, setBounce] = useState(10);
  const [buyQty, setBuyQty] = useState(Math.max(1, Math.round(shares)));
  const [budget, setBudget] = useState(
    Math.max(100, Math.round(currentPrice * shares)),
  );
  const [target, setTarget] = useState(
    Number(((currentPrice + avgCost) / 2).toFixed(2)),
  );

  const noBuyBounce = breakevenBounceNoBuy(avgCost, currentPrice);

  // Shares the active mode implies buying.
  let bought = 0;
  if (mode === "bounce") {
    bought = sharesForBounceBreakeven(shares, avgCost, currentPrice, bounce);
  } else if (mode === "shares") {
    bought = Math.max(0, buyQty);
  } else if (mode === "budget") {
    bought = currentPrice > 0 ? Math.max(0, budget) / currentPrice : 0;
  } else {
    bought = sharesForTargetAverage(shares, avgCost, currentPrice, target) ?? 0;
  }

  const newShares = shares + bought;
  const newAvg = blendedAverage(shares, avgCost, bought, currentPrice);

  // The headline answer per mode.
  let headline = "";
  let sub = "";
  if (mode === "bounce") {
    if (bought > 0) {
      headline = `Buy ${formatNumber(bought)} shares`;
      sub = `≈ ${formatCurrency(bought * currentPrice)}`;
    } else {
      headline = "No buy needed";
      sub = `A ${bounce}% bounce already breaks you even`;
    }
  } else if (mode === "shares" || mode === "budget") {
    const rise = breakevenBounceNoBuy(newAvg, currentPrice);
    headline = rise > 0 ? `+${formatNumber(rise)}% to break even` : "Already break-even";
    sub =
      mode === "budget"
        ? `buys ${formatNumber(bought)} shares at ${formatCurrency(currentPrice)}`
        : `${formatNumber(bought)} shares ≈ ${formatCurrency(bought * currentPrice)}`;
  } else {
    if (bought > 0) {
      const rise = ((target - currentPrice) / currentPrice) * 100;
      headline = `Buy ${formatNumber(bought)} shares`;
      sub = `≈ ${formatCurrency(bought * currentPrice)} · then +${formatNumber(rise)}% to break even`;
    } else {
      headline = "No buy needed";
      sub = "Target is at or above your average already";
    }
  }

  const showProjection = bought > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">{symbol}</span>
          <span className="text-xs text-slate-400 truncate">{description}</span>
        </div>
        <span
          className={cn(
            "shrink-0 text-sm font-semibold px-2.5 py-1 rounded-lg",
            gainPct >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
          )}
        >
          {gainPct >= 0 ? "+" : ""}
          {formatNumber(gainPct)}%
        </span>
      </div>

      {/* Stats — current, with the projected position below once a buy is implied */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-center">
        <Stat
          label="Shares"
          value={formatNumber(shares)}
          after={showProjection ? formatNumber(newShares) : undefined}
        />
        <Stat
          label="Avg cost"
          value={formatCurrency(avgCost)}
          after={showProjection ? formatCurrency(newAvg) : undefined}
        />
        <Stat label="Price" value={formatCurrency(currentPrice)} />
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex-1 min-w-0 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors",
              mode === m.id
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Controls + output */}
      <div className="bg-slate-50 rounded-xl p-4 sm:p-5 space-y-4">
        {underwater && (
          <p className="text-sm text-slate-500">
            With no buying, you'd need a{" "}
            <span className="font-semibold text-slate-700">
              +{formatNumber(noBuyBounce)}%
            </span>{" "}
            bounce to break even.
          </p>
        )}

        {mode === "bounce" && (
          <Field
            label={`Break even on a ${bounce}% bounce`}
            value={bounce}
            setValue={setBounce}
            min={1}
            sliderMax={50}
            step={1}
            suffix="%"
          />
        )}
        {mode === "shares" && (
          <Field
            label="Shares to buy"
            value={buyQty}
            setValue={setBuyQty}
            min={0}
            sliderMax={Math.max(Math.ceil(shares * 10), 100)}
            step={1}
          />
        )}
        {mode === "budget" && (
          <Field
            label="Budget to spend"
            value={budget}
            setValue={setBudget}
            min={0}
            sliderMax={Math.max(Math.ceil(currentPrice * shares * 10), 5000)}
            step={10}
            prefix="$"
          />
        )}
        {mode === "target" && (
          <Field
            label="DCA down to average"
            value={target}
            setValue={setTarget}
            min={Math.min(currentPrice, avgCost)}
            sliderMax={Math.max(currentPrice, avgCost)}
            step={0.01}
            prefix="$"
          />
        )}

        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 sm:p-5">
          <div className="text-xl sm:text-2xl font-mono font-bold break-words [overflow-wrap:anywhere]">
            {headline}
          </div>
          <div className="text-sm text-slate-300 mt-1 break-words">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  after,
}: {
  label: string;
  value: string;
  after?: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="font-mono font-semibold text-slate-900 text-sm sm:text-base break-words">
        {value}
      </div>
      {after !== undefined && (
        <div className="font-mono text-sm text-primary mt-0.5 break-words">
          → {after}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  min,
  sliderMax,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  sliderMax: number;
  step: number;
  prefix?: string;
  suffix?: string;
}) {
  // Local text so the box can be blank while typing, instead of a stuck "0".
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  const onText = (raw: string) => {
    let v = raw.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    setText(v);
    if (v === "" || v === ".") setValue(0);
    else setValue(Math.max(min, Number(v)));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-slate-400">{prefix}</span>}
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => onText(e.target.value)}
            className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono text-sm text-slate-900 focus:outline-none focus:border-primary"
          />
          {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={sliderMax}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          setValue(n);
          setText(String(n));
        }}
        className="w-full accent-primary cursor-pointer"
      />
    </div>
  );
}
