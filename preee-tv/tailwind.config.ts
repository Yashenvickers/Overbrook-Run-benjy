import type { Config } from "tailwindcss";

/**
 * Preee TV design tokens — "music newsroom after dark".
 * Bold black/white editorial system with a signal-yellow accent.
 * All colors meet WCAG 2.2 AA contrast on their intended surfaces.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0B", // page ground
          soft: "#121214", // raised surfaces
          line: "#26262A", // hairlines / borders
        },
        paper: {
          DEFAULT: "#FAFAF7", // primary text on dark
          dim: "#A6A6AD", // secondary text on dark (AA on ink)
        },
        signal: {
          DEFAULT: "#F5E003", // signal yellow — accents, category labels
          ink: "#141400", // text placed on signal yellow (AAA)
        },
        live: "#FF3B30", // breaking / live indicator
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        kicker: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.14em" }],
      },
      maxWidth: {
        site: "80rem", // 1280px content column
        prose: "42rem", // article measure
      },
      aspectRatio: {
        "3/2": "3 / 2",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out both",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
