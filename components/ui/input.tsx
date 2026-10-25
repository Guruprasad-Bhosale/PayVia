import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold tracking-wide text-[#475569]">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-sm text-[#0A192F] placeholder:text-[#64748B] transition-colors focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:opacity-60",
            error && "border-[#991B1B] focus:border-[#991B1B] focus:ring-[#991B1B]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-[#991B1B]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
