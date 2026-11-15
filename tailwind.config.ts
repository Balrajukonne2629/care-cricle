import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e5ede5",
          200: "#cddbcd",
          300: "#a6c0a6",
          400: "#799f79",
          500: "#588258",
          600: "#446744",
          700: "#365236",
          800: "#2d422d",
          900: "#273827",
        },
        warmamber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        coral: {
          50: "#fff1f0",
          100: "#ffe0de",
          200: "#ffc7c4",
          300: "#ffa09c",
          400: "#ff6961",
          500: "#f8473c",
          600: "#e52a1e",
          700: "#c11e13",
          800: "#9f1d14",
          900: "#831f17",
        },
        elderSlate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        pill: {
          blue: "#38bdf8",
          gold: "#fbbf24",
          mint: "#34d399",
          coral: "#fb7185",
          purple: "#c084fc",
          white: "#f8fafc",
          amber: "#f97316",
        }
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
      },
      boxShadow: {
        tactile: "0 4px 0 0 rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.08)",
        "tactile-pressed": "0 1px 0 0 rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        glow: "0 0 25px -5px rgba(88, 130, 88, 0.25)",
      },
      fontSize: {
        "elder-base": "1.125rem", // 18px base for elder legibility
        "elder-lg": "1.25rem",   // 20px
        "elder-xl": "1.5rem",    // 24px
        "elder-2xl": "1.875rem", // 30px
        "elder-3xl": "2.25rem",  // 36px
        "elder-4xl": "3rem",     // 48px
      }
    },
  },
  plugins: [],
};

export default config;
