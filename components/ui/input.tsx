import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold tracking-wide text-[#52607A]">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#DCE4EE] bg-white px-3.5 py-2.5 text-sm text-[#0B1B33] placeholder:text-[#94A3B8] transition-all duration-150 focus:border-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60",
            error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#52607A]">{hint}</p>}
        {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
