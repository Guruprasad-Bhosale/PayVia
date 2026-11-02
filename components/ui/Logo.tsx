import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({
  className,
  iconOnly = false,
  size = "md",
  href = "/",
}: LogoProps) {
  // Proportions: desktop icon 36-40px, well-balanced
  const iconDimensions = {
    sm: "w-8 h-8 rounded-[8px]",
    md: "w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[10px]",
    lg: "w-11 h-11 rounded-[12px]",
  };

  const boltDimensions = {
    sm: "w-4 h-4",
    md: "w-[18px] h-[18px]",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-[21px]",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      {/* Icon: Vivid Action Blue (#0284C7) rounded square with crisp white lightning bolt */}
      <div
        className={cn(
          "bg-[#0284C7] flex items-center justify-center text-white relative flex-shrink-0 transition-all duration-200 group-hover:bg-[#0EA5E9] shadow-xs",
          iconDimensions[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn("text-white fill-white transition-transform duration-200 group-hover:scale-105", boltDimensions[size])}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.5 2L4 13.5H11.5L10.5 22L20 10.5H12.5L13.5 2Z" />
        </svg>
      </div>

      {/* Wordmark: "Pay" in Deep Navy (#0B1B33), "Via" in Sky/Action Blue (#0284C7) */}
      {!iconOnly && (
        <span
          className={cn(
            "font-extrabold tracking-tight font-sans flex items-baseline leading-none transition-colors",
            textSizes[size]
          )}
        >
          <span className="text-[#0B1B33]">Pay</span>
          <span className="text-[#0284C7] ml-[0.5px]">Via</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8] p-1 -ml-1 inline-flex items-center"
        aria-label="PayVia - Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
