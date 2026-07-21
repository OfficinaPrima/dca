import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { parseNum } from "@/lib/utils";

interface WarningBannerProps {
  originalAvg: string;
  buyPrice: string;
}

export function WarningBanner({ originalAvg, buyPrice }: WarningBannerProps) {
  const o = parseNum(originalAvg);
  const p = parseNum(buyPrice);

  if (o !== null && p !== null && p > o) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="overflow-hidden"
      >
        <div className="mb-6 bg-amber-50 border border-amber-200/60 p-4 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-amber-900 font-semibold text-sm sm:text-base">Averaging Up Warning</h4>
            <p className="text-amber-800/80 text-sm mt-1 leading-relaxed">
              Your new purchase price is higher than your original average. This purchase will increase your overall average cost per share.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
