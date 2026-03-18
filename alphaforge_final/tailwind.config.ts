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
        mono: ["var(--font-dm-mono)", "monospace"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        forge: {
          bg:      "#0b0b0b",
          surface: "#0f0f0d",
          panel:   "#111110",
          border:  "#1a1a18",
          dim:     "#222220",
          muted:   "#333330",
          subtle:  "#4a4845",
          mid:     "#6b6963",
          text:    "#c8c5bc",
          bright:  "#e8e6e0",
          pos:     "#3d7a4a",
          neg:     "#7a3d3d",
          warn:    "#7a6a3d",
          "pos-dim":  "#1e3320",
          "neg-dim":  "#331e1e",
          "warn-dim": "#332d1e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
