import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Header } from "@/components/navigation/Header";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "PayVia — Autonomous Commerce Negotiation & PayPal Settlement",
  description:
    "AI negotiates. PayPal settles. PayVia lets buyer and merchant AI agents negotiate the economic terms of a transaction before PayPal securely settles it.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased text-[#0B1B33] bg-[#FFFFFF] selection:bg-[#BAE6FD] selection:text-[#0B1B33]">
        <ToastProvider>
          {/* Top Floating Navigation Dock */}
          <Header />

          {/* Main Application Page Content with Generous Breathing Room */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 sm:pb-16">
            {children}
          </main>

          {/* Clean Fintech Footer */}
          <footer className="border-t border-[#DCE4EE] bg-[#F0F9FF]/40 py-8 text-xs text-[#52607A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo size="sm" href="/" />
                <span className="text-[#DCE4EE]">|</span>
                <span>Autonomous Agent-to-Agent Commerce Protocol</span>
              </div>
              <div className="flex items-center gap-4 text-[#52607A] font-medium flex-wrap justify-center">
                <span className="text-[#0284C7] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                  AI negotiates. PayPal settles.
                </span>
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
