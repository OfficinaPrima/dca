import { Bookmark, BookmarkCheck, FileText, StickyNote } from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { breakevenBounceNoBuy } from "@/lib/dca";
import type { Holding } from "@/lib/schwab";

interface SaveBarProps {
  holdings: Holding[];
  fileName: string;
  remember: boolean;
  onToggleRemember: () => void;
}

const BTN =
  "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition-colors";

function fileBase(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "portfolio";
}

function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildNote(holdings: Holding[]): string {
  const lines = ["DCA Calculator — portfolio snapshot", new Date().toLocaleString(), ""];
  for (const h of holdings) {
    const bounce = breakevenBounceNoBuy(h.avgCost, h.currentPrice);
    lines.push(`${h.symbol} — ${h.description}`);
    lines.push(`  Shares:        ${formatNumber(h.shares)}`);
    lines.push(`  Avg cost:      ${formatCurrency(h.avgCost)}`);
    lines.push(`  Current price: ${formatCurrency(h.currentPrice)}`);
    lines.push(`  Gain / Loss:   ${formatNumber(h.gainPct)}%`);
    lines.push(`  Break-even with no buying: +${formatNumber(bounce)}%`);
    lines.push("");
  }
  return lines.join("\n");
}

export function SaveBar({ holdings, fileName, remember, onToggleRemember }: SaveBarProps) {
  return (
    <div className="no-print bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <p className="text-sm text-amber-800 mb-3">
        <span className="font-semibold">Heads up:</span> this app keeps no history. Save your
        analysis before you leave — or turn on Remember to keep it on this device.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleRemember}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
            remember
              ? "bg-primary text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300",
          )}
        >
          {remember ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {remember ? "Remembering on this device" : "Remember on this device"}
        </button>

        <button onClick={() => window.print()} className={BTN}>
          <FileText className="w-4 h-4" />
          Save as PDF
        </button>

        <button
          onClick={() => downloadText(`${fileBase(fileName)}-analysis.txt`, buildNote(holdings))}
          className={BTN}
        >
          <StickyNote className="w-4 h-4" />
          Save as note
        </button>
      </div>
    </div>
  );
}
