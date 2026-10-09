"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import SwipeToast from "@/components/react-bits/SwipeToast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export interface ToastOptions {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  variant?: "success" | "error" | "info" | "neutral";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  success: (title: ReactNode, description?: ReactNode) => void;
  error: (title: ReactNode, description?: ReactNode) => void;
  info: (title: ReactNode, description?: ReactNode) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = options.id || `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = { ...options, id };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  }, []);

  const success = useCallback((title: ReactNode, description?: ReactNode) => {
    toast({ title, description, variant: "success", duration: 4500 });
  }, [toast]);

  const error = useCallback((title: ReactNode, description?: ReactNode) => {
    toast({ title, description, variant: "error", duration: 5500 });
  }, [toast]);

  const info = useCallback((title: ReactNode, description?: ReactNode) => {
    toast({ title, description, variant: "info", duration: 4000 });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let icon = <Info className="w-5 h-5 text-[#0070E0]" />;
          let fuseColor = "#0070E0";
          if (t.variant === "success") {
            icon = <CheckCircle2 className="w-5 h-5 text-[#16845B]" />;
            fuseColor = "#16845B";
          } else if (t.variant === "error") {
            icon = <AlertCircle className="w-5 h-5 text-[#D92D20]" />;
            fuseColor = "#D92D20";
          }

          return (
            <div key={t.id} className="pointer-events-auto">
              <SwipeToast
                open={true}
                title={t.title}
                description={t.description}
                icon={icon}
                actionLabel={t.actionLabel}
                onAction={t.onAction}
                duration={t.duration ?? 4000}
                fuseColor={fuseColor}
                background="#FFFFFF"
                color="#111827"
                onClose={() => removeToast(t.id)}
                inline={false}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
