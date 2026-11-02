import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "paypal" | "destructive" | "pink" | "default";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer flex-shrink-0";

    const sizeStyles = {
      sm: "px-3.5 py-1.5 text-xs gap-1.5 min-h-[36px]",
      md: "px-5 py-2.5 text-sm gap-2 min-h-[42px]",
      lg: "px-6 py-3 text-sm sm:text-base gap-2.5 min-h-[48px]",
    };

    const variantStyles = {
      default:
        "bg-[#0284C7] text-white hover:bg-[#0EA5E9] active:bg-[#0369A1] focus:ring-[#38BDF8] shadow-xs",
      primary:
        "bg-[#0284C7] text-white hover:bg-[#0EA5E9] active:bg-[#0369A1] focus:ring-[#38BDF8] shadow-xs",
      secondary:
        "bg-[#F0F9FF] text-[#0284C7] hover:bg-[#E0F2FE] border border-[#BAE6FD] focus:ring-[#38BDF8]",
      outline:
        "border border-[#DCE4EE] text-[#0B1B33] bg-white hover:bg-[#F8FAFC] hover:border-[#CBD5E1] focus:ring-[#38BDF8]",
      ghost:
        "text-[#52607A] hover:bg-[#F0F9FF] hover:text-[#0B1B33] focus:ring-[#38BDF8]",
      pink:
        "bg-[#EC4899] text-white hover:bg-[#DB2777] active:bg-[#BE185D] focus:ring-[#F472B6] shadow-xs shadow-pink-500/20",
      destructive:
        "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] shadow-xs",
      paypal:
        "bg-[#FFC439] hover:bg-[#F2B930] text-[#0B1B33] font-bold shadow-xs hover:shadow-sm focus:ring-[#FFC439]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
