import * as React from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefixIcon?: React.ReactNode;
  suffix?: string;
  error?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, value, onChange, prefixIcon, suffix, error, className, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^0-9.]/g, "");
      
      // Prevent multiple decimals
      const decimalCount = (val.match(/\./g) || []).length;
      if (decimalCount > 1) {
        val = val.substring(0, val.lastIndexOf("."));
      }
      
      onChange(val);
    };

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative group">
          {prefixIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full bg-white border-2 border-slate-200 rounded-xl py-3.5 text-slate-900 font-mono text-lg transition-all duration-200",
              "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm",
              "hover:border-slate-300",
              prefixIcon ? "pl-11" : "pl-4",
              suffix ? "pr-12" : "pr-4",
              error && "border-destructive focus:border-destructive focus:ring-destructive/10"
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
              {suffix}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
