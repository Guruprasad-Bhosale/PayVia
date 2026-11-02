import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "info" | "purple" | "error" | "secondary" | "outline" | "destructive" | "pink";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#F1F5F9] text-[#52607A] border-[#DCE4EE]",
    secondary: "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]",
    outline: "bg-transparent text-[#52607A] border-[#DCE4EE]",
    success: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    warning: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    info: "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]",
    purple: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
    pink: "bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]",
    error: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
    destructive: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
