import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "#FFFFFF",
          base: "#FFFFFF",
          muted: "#F1F5F9",
          subtle: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          hover: "#F8FAFC",
        },
        brand: {
          primary: "#003087",
          navy: "#0A192F",
          blue: "#0052CC",
          secondary: "#0070E0",
          accent: "#009CDE",
          hover: "#002266",
          sky: "#EBF3FF",
        },
        fintech: {
          text: "#0A192F",
          secondary: "#475569",
          muted: "#64748B",
          subtle: "#94A3B8",
          border: "#E2E8F0",
          "border-strong": "#CBD5E1",
          success: "#0E6245",
          error: "#991B1B",
          warning: "#92400E",
          surface: "#F8FAFC",
        },
        // Backward compatibility and semantic aliases for existing components
        payvia: {
          navy: "#0A192F",
          "navy-dark": "#061020",
          blue: "#0052CC",
          cyan: "#009CDE",
          success: "#0E6245",
          error: "#991B1B",
          warning: "#92400E",
          gray: "#475569",
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
        xs: "0 1px 2px 0 rgba(10, 25, 47, 0.05)",
        sm: "0 1px 3px 0 rgba(10, 25, 47, 0.08), 0 1px 2px -1px rgba(10, 25, 47, 0.08)",
        md: "0 4px 6px -1px rgba(10, 25, 47, 0.08), 0 2px 4px -2px rgba(10, 25, 47, 0.06)",
        card: "0 1px 3px 0 rgba(10, 25, 47, 0.05), 0 1px 2px -1px rgba(10, 25, 47, 0.05)",
        "card-hover": "0 4px 12px -2px rgba(10, 25, 47, 0.08)",
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
