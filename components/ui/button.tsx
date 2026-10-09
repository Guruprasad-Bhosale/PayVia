import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "paypal" | "destructive" | "default";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-sm sm:text-base gap-2.5",
    };

    const variantStyles = {
      default:
        "bg-[#003087] text-white hover:bg-[#002266] focus:ring-[#0070E0] shadow-sm",
      primary:
        "bg-[#003087] text-white hover:bg-[#002266] focus:ring-[#0070E0] shadow-sm",
      secondary:
        "bg-[#F5F7FA] text-[#111827] hover:bg-[#E2E8F0] border border-[#E2E8F0] focus:ring-[#0070E0]",
      outline:
        "border border-[#CBD5E1] text-[#003087] bg-white hover:bg-[#F5F7FA] focus:ring-[#0070E0]",
      ghost:
        "text-[#5B6472] hover:bg-[#F5F7FA] hover:text-[#111827] focus:ring-[#CBD5E1]",
      destructive:
        "bg-[#D92D20] text-white hover:bg-[#B42318] focus:ring-[#D92D20] shadow-sm",
      paypal:
        "bg-[#FFC439] hover:bg-[#F2B930] text-[#003087] font-bold shadow-sm hover:shadow focus:ring-[#FFC439]",
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
