import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Header } from "@/components/navigation/Header";

export const metadata: Metadata = {
  title: "PayVia — Autonomous Commerce Negotiation & PayPal Settlement",
  description:
    "AI negotiates. PayPal settles. PayVia lets buyer and merchant AI agents negotiate the economic terms of a transaction before PayPal securely settles it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased text-[#0A192F] bg-[#F8FAFC]">
        <ToastProvider>
          {/* Top Professional Header */}
          <Header />

          {/* Main Application Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
            {children}
          </main>

          {/* Clean Fintech Footer */}
          <footer className="border-t border-[#E2E8F0] bg-white py-8 text-xs text-[#475569]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0A192F]">PayVia</span>
                <span>— Autonomous Agent-to-Agent Commerce Protocol</span>
              </div>
              <div className="flex items-center gap-6 text-[#475569] font-medium">
                <span className="text-[#0052CC] font-semibold">AI negotiates. PayPal settles.</span>
                <span>•</span>
                <span>Cryptographic SHA-256 Agreement Verification</span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
