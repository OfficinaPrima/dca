import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string | ReactNode;
  isError?: boolean;
}

export function ResultCard({ title, value, subtitle, isError }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        mt-8 p-6 sm:p-8 rounded-3xl shadow-xl border
        ${isError 
          ? "bg-red-50 border-red-100 text-red-900" 
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-slate-800 text-white"}
      `}
    >
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-2 ${isError ? "text-red-700" : "text-slate-400"}`}>
        {title}
      </h3>
      
      <div className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight break-words [overflow-wrap:anywhere] ${isError ? "text-red-600 text-xl sm:text-2xl font-sans" : "text-white"}`}>
        {value}
      </div>
      
      {subtitle && (
        <div className={`mt-4 pt-4 border-t text-sm sm:text-base ${isError ? "border-red-200/50 text-red-800" : "border-white/10 text-slate-300"}`}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
