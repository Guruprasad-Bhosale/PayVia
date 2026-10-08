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
        paypal: {
          blue: "#0070BA",
          darkBlue: "#003087",
          lightBlue: "#009cde",
          gold: "#FFC439",
          navy: "#0C2044",
        },
      },
    },
  },
  plugins: [],
};

export default config;
