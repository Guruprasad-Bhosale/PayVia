import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "info" | "purple" | "error" | "secondary" | "outline" | "destructive";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    secondary: "bg-[#EBF3FF] text-[#0A192F] border-[#0052CC]/25",
    outline: "bg-transparent text-[#475569] border-[#CBD5E1]",
    success: "bg-[#ECFDF5] text-[#0E6245] border-[#A7F3D0]",
    warning: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
    info: "bg-[#EBF3FF] text-[#0052CC] border-[#BFDBFE]",
    purple: "bg-[#F5F3FF] text-[#581C87] border-[#DDD6FE]",
    error: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
    destructive: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
