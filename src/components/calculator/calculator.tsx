import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalculatorIcon, DollarSign, Target, Briefcase, Hash, LineChart } from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { formatCurrency, formatNumber, parseNum, cn } from "@/lib/utils";
import { WarningBanner } from "@/components/calculator/warning-banner";
import { ResultCard } from "@/components/calculator/result-card";
import { CoinSearch } from "@/components/calculator/coin-search";

type TabId = "target" | "budget" | "custom";

export function Calculator() {
  const [activeTab, setActiveTab] = useState<TabId>("target");

  // Shared State (UX enhancement: persists across tabs)
  const [shares, setShares] = useState<string>("");
  const [originalAvg, setOriginalAvg] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");

  // Tab-specific State
  const [targetAvg, setTargetAvg] = useState<string>("");     // Tab 1
  const [budget, setBudget] = useState<string>("");           // Tab 2
  const [newSharesQty, setNewSharesQty] = useState<string>(""); // Tab 3

  // Tab 1 Logic
  const renderTabTarget = () => {
    const s = parseNum(shares);
    const a = parseNum(originalAvg);
    const p = parseNum(buyPrice);
    const t = parseNum(targetAvg);

    let sharesNeeded: number | null = null;
    let cost: number | null = null;
    let error: string | null = null;

    if (s !== null && a !== null && p !== null && t !== null) {
      if (p === t) {
        error = "Target average cannot equal the buy price.";
      } else {
        const n = s * (t - a) / (p - t);
        if (n < 0) {
          error = "Target average must be between the buy price and your original average.";
        } else {
          sharesNeeded = n;
          cost = n * p;
        }
      }
    }

    return (
      <motion.div
        key="tab-target"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <NumberInput
          label="Desired Target Average"
          placeholder="0.00"
          value={targetAvg}
          onChange={setTargetAvg}
          prefixIcon={<Target className="w-5 h-5" />}
        />

        {error && <ResultCard isError title="Calculation Error" value={error} />}

        {!error && (
          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              title="Shares to Buy"
              value={sharesNeeded !== null ? formatNumber(sharesNeeded) : "—"}
            />
            <ResultCard
              title="Total Cost"
              value={cost !== null ? formatCurrency(cost) : "—"}
            />
          </div>
        )}
      </motion.div>
    );
  };

  // Tab 2 Logic
  const renderTabBudget = () => {
    const s = parseNum(shares);
    const a = parseNum(originalAvg);
    const p = parseNum(buyPrice);
    const b = parseNum(budget);

    let resultShares: number | null = null;
    let resultAvg: number | null = null;

    if (s !== null && a !== null && p !== null && b !== null && p > 0) {
      resultShares = b / p;
      resultAvg = (s * a + b) / (s + resultShares);
    }

    return (
      <motion.div
        key="tab-budget"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <NumberInput
          label="Budget / Funds Available"
          placeholder="0.00"
          value={budget}
          onChange={setBudget}
          prefixIcon={<Briefcase className="w-5 h-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <ResultCard
            title="Shares Purchasable"
            value={resultShares !== null ? formatNumber(resultShares) : "—"}
          />
          <ResultCard
            title="New Blended Average"
            value={resultAvg !== null ? formatCurrency(resultAvg) : "—"}
          />
        </div>
      </motion.div>
    );
  };

  // Tab 3 Logic
  const renderTabCustom = () => {
    const s = parseNum(shares);
    const a = parseNum(originalAvg);
    const p = parseNum(buyPrice);
    const n = parseNum(newSharesQty);

    let resultAvg: number | null = null;
    let totalCost: number | null = null;

    if (s !== null && a !== null && p !== null && n !== null && (s + n) > 0) {
      resultAvg = (s * a + n * p) / (s + n);
      totalCost = n * p;
    }

    return (
      <motion.div
        key="tab-custom"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <NumberInput
          label="Number of New Shares to Buy"
          placeholder="0"
          value={newSharesQty}
          onChange={setNewSharesQty}
          prefixIcon={<Hash className="w-5 h-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <ResultCard
            title="New Blended Average"
            value={resultAvg !== null ? formatCurrency(resultAvg) : "—"}
          />
          <ResultCard
            title="Total Amount Spent"
            value={totalCost !== null ? formatCurrency(totalCost) : "—"}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/10 mb-6 border border-slate-100">
            <CalculatorIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3 tracking-tight">
            DCA Calculator
          </h1>
          <p className="text-lg text-slate-500 max-w-lg">
            Plan your dollar cost averaging strategy with precision. Enter your current position to get started.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-200/60 overflow-hidden backdrop-blur-xl">
          
          {/* Top Shared Inputs Section */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <CoinSearch onPriceUpdate={(p) => setBuyPrice(String(p))} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <NumberInput
                label="Current Shares"
                placeholder="0"
                value={shares}
                onChange={setShares}
                prefixIcon={<LayersIcon className="w-5 h-5" />}
              />
              <NumberInput
                label="Original Avg Price"
                placeholder="0.00"
                value={originalAvg}
                onChange={setOriginalAvg}
                prefixIcon={<DollarSign className="w-5 h-5" />}
              />
              <NumberInput
                label="Current Market Price"
                placeholder="0.00"
                value={buyPrice}
                onChange={setBuyPrice}
                prefixIcon={<LineChart className="w-5 h-5" />}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <WarningBanner originalAvg={originalAvg} buyPrice={buyPrice} />

            {/* Custom Segmented Control */}
            <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100/80 rounded-2xl mb-8 gap-1.5">
              {[
                { id: "target", label: "Hit Target Average" },
                { id: "budget", label: "Spend Fixed Budget" },
                { id: "custom", label: "Buy Custom Amount" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={cn(
                    "relative flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 z-10",
                    activeTab === tab.id ? "text-primary" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content */}
            {/* Each panel carries its own key, so switching tabs remounts it and
                replays the entrance animation. Wrapping these in AnimatePresence
                stalls the swap — it waits on an exit that never resolves. */}
            <div className="relative min-h-[250px]">
              {activeTab === "target" && renderTabTarget()}
              {activeTab === "budget" && renderTabBudget()}
              {activeTab === "custom" && renderTabCustom()}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Calculations are performed locally in your browser.</p>
        </div>
      </div>
    </div>
  );
}

// Just a quick custom icon component to keep things self-contained without adding too many imports
function LayersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
