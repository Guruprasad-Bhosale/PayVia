import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "#FFFFFF",
          base: "#FFFFFF",
          ice: "#F0F9FF",
          muted: "#F8FAFC",
          subtle: "#F1F5F9",
          card: "#FFFFFF",
          border: "#DCE4EE",
          hover: "#F8FAFC",
        },
        brand: {
          DEFAULT: "#38BDF8",
          sky: "#38BDF8",
          hover: "#0EA5E9",
          deep: "#0284C7",
          navy: "#0B1B33",
          slate: "#52607A",
          pink: {
            DEFAULT: "#EC4899",
            hover: "#DB2777",
            subtle: "#FDF2F8",
            border: "#FBCFE8",
          },
          ice: "#F0F9FF",
          primary: "#0284C7",
          blue: "#0284C7",
          secondary: "#38BDF8",
          accent: "#38BDF8",
        },
        fintech: {
          text: "#0B1B33",
          secondary: "#52607A",
          muted: "#64748B",
          subtle: "#94A3B8",
          border: "#DCE4EE",
          "border-strong": "#CBD5E1",
          success: "#059669",
          error: "#DC2626",
          warning: "#D97706",
          surface: "#F8FAFC",
          ice: "#F0F9FF",
        },
        payvia: {
          navy: "#0B1B33",
          "navy-dark": "#050C17",
          blue: "#0284C7",
          cyan: "#38BDF8",
          pink: "#EC4899",
          success: "#059669",
          error: "#DC2626",
          warning: "#D97706",
          gray: "#52607A",
        },
        paypal: {
          blue: "#0070E0",
          darkBlue: "#003087",
          lightBlue: "#009CDE",
          gold: "#FFC439",
          navy: "#001C4E",
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(11, 27, 51, 0.04)",
        sm: "0 1px 3px 0 rgba(11, 27, 51, 0.06), 0 1px 2px -1px rgba(11, 27, 51, 0.04)",
        md: "0 4px 6px -1px rgba(11, 27, 51, 0.06), 0 2px 4px -2px rgba(11, 27, 51, 0.04)",
        card: "0 1px 3px 0 rgba(11, 27, 51, 0.04), 0 1px 2px -1px rgba(11, 27, 51, 0.04)",
        "card-hover": "0 4px 12px -2px rgba(2, 132, 199, 0.08)",
        pink: "0 2px 8px -1px rgba(236, 72, 153, 0.25)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        card: "0.75rem",
        panel: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
