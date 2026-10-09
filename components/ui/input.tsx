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
          <label className="block text-xs font-semibold tracking-wide text-[#5B6472]">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] transition-colors focus:border-[#0070E0] focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:opacity-60",
            error && "border-[#D92D20] focus:border-[#D92D20] focus:ring-[#D92D20]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-[#D92D20]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
