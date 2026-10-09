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
          muted: "#F5F7FA",
          subtle: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        brand: {
          primary: "#003087",
          secondary: "#0070E0",
          accent: "#009CDE",
          hover: "#002266",
        },
        fintech: {
          text: "#111827",
          muted: "#5B6472",
          subtle: "#94A3B8",
          border: "#E2E8F0",
          success: "#16845B",
          error: "#D92D20",
          warning: "#F59E0B",
          surface: "#F5F7FA",
        },
        paypal: {
          blue: "#0070E0",
          darkBlue: "#003087",
          lightBlue: "#009CDE",
          gold: "#FFC439",
          navy: "#001C4E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
