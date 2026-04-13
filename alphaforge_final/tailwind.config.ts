import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-dm-mono)", "monospace"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        forge: {
          // Backgrounds
          bg:      "var(--forge-bg)",
          surface: "var(--forge-surface)",
          panel:   "var(--forge-panel)",
          border:  "var(--forge-border)",
          dim:     "var(--forge-dim)",
          muted:   "var(--forge-muted)",
          // Foregrounds (all WCAG AA compliant)
          subtle:  "var(--forge-subtle)",
          accent:  "var(--forge-accent)",
          label:   "var(--forge-label)",
          body:    "var(--forge-body)",
          text:    "var(--forge-text)",
          bright:  "var(--forge-bright)",
          // Semantic
          pos:        "var(--forge-pos)",
          neg:        "var(--forge-neg)",
          warn:       "var(--forge-warn)",
          "pos-dim":  "var(--forge-pos-dim)",
          "neg-dim":  "var(--forge-neg-dim)",
          "warn-dim": "var(--forge-warn-dim)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
