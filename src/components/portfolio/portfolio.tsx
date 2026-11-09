import { useEffect, useState } from "react";
import { CsvUpload } from "@/components/portfolio/csv-upload";
import { AssetCard } from "@/components/portfolio/asset-card";
import { BestBuy } from "@/components/portfolio/best-buy";
import { SaveBar } from "@/components/portfolio/save-bar";
import type { Holding } from "@/lib/schwab";

const STORAGE_KEY = "dca-portfolio";
const REMEMBER_KEY = "dca-remember";

export function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [remember, setRemember] = useState(false);

  // Restore a remembered portfolio on first load.
  useEffect(() => {
    if (localStorage.getItem(REMEMBER_KEY) !== "1") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { fileName?: string; holdings?: Holding[] };
      if (saved.holdings && saved.holdings.length > 0) {
        setHoldings(saved.holdings);
        setFileName(saved.fileName || "saved portfolio");
        setRemember(true);
      }
    } catch {
      // Ignore corrupt storage.
    }
  }, []);

  const loadHoldings = (h: Holding[], name: string) => {
    setHoldings(h);
    setFileName(name);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fileName: name, holdings: h }));
    }
  };

  const toggleRemember = () => {
    setRemember((on) => {
      const next = !on;
      if (next && holdings) {
        localStorage.setItem(REMEMBER_KEY, "1");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ fileName, holdings }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
      return next;
    });
  };

  return (
    <div className="py-10 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-3 tracking-tight">
            DCA Calculator
          </h1>
          <p className="text-lg text-slate-500">
            Upload your Charles Schwab positions export and, for each holding,
            explore how much to buy, spend, or average down — and exactly how far
            the price must recover for you to break even.
          </p>
        </div>

        {!holdings ? (
          <CsvUpload onLoaded={loadHoldings} />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-5 no-print">
              <p className="text-sm text-slate-500 min-w-0 truncate">
                {holdings.length} holding{holdings.length === 1 ? "" : "s"} from{" "}
                <span className="font-medium text-slate-700">{fileName}</span>
              </p>
              <button
                onClick={() => setHoldings(null)}
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                Upload a different file
              </button>
            </div>

            <SaveBar
              holdings={holdings}
              fileName={fileName}
              remember={remember}
              onToggleRemember={toggleRemember}
            />
            <BestBuy holdings={holdings} />
            <div className="space-y-5">
              {holdings.map((h) => (
                <AssetCard key={h.symbol} holding={h} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
