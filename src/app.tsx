import { Calculator } from "@/components/calculator/calculator";
import { Portfolio } from "@/components/portfolio/portfolio";
import { Faq } from "@/components/faq";

export function App() {
  return (
    <div className="min-h-screen">
      <Portfolio />

      <div className="no-print">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            or run a one-off calculation
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        </div>

        <Calculator />
        <Faq />

        <footer className="py-10 px-4 text-center text-sm text-slate-400">
          <p className="max-w-2xl mx-auto">
            This is a calculator, not financial advice. Averaging down adds to a
            position that has already lost value and can increase your losses.
          </p>
        </footer>
      </div>
    </div>
  );
}
