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
    default: "bg-[#F5F7FA] text-[#5B6472] border-[#E2E8F0]",
    secondary: "bg-[#EFF8FF] text-[#003087] border-[#0070E0]/20",
    outline: "bg-transparent text-[#5B6472] border-[#CBD5E1]",
    success: "bg-[#ECFDF5] text-[#16845B] border-[#16845B]/25",
    warning: "bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/30",
    info: "bg-[#EFF8FF] text-[#0070E0] border-[#0070E0]/25",
    purple: "bg-[#F5F3FF] text-[#6D28D9] border-[#8B5CF6]/25",
    error: "bg-[#FEF3F2] text-[#D92D20] border-[#D92D20]/25",
    destructive: "bg-[#FEF3F2] text-[#D92D20] border-[#D92D20]/25",
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
