import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        primary: "var(--color-primary)",
        "primary-dim": "var(--color-primary-dim)",
        gold: "var(--color-gold)",
        "gold-dim": "var(--color-gold-dim)",
        line: "var(--color-line)",
        muted: "var(--color-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        ripple:
          "radial-gradient(circle at 50% 0%, rgba(225,15,33,0.18), transparent 60%)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
        wave: {
          "0%": { backgroundPositionX: "0" },
          "100%": { backgroundPositionX: "1000px" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
        wave: "wave 18s linear infinite",
        rise: "rise 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
