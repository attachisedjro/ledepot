import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system — Le Dépôt × Createeves Africa
        primary: "#F5A800",
        "primary-container": "#E09000",
        "primary-fixed": "#FFF0CC",
        "primary-fixed-dim": "#FFD166",
        "on-primary": "#1C1A17",
        "on-primary-container": "#1C1A17",
        "on-primary-fixed": "#1C1A17",
        "on-primary-fixed-variant": "#3D3600",
        "inverse-primary": "#E09000",

        secondary: "#6B6860",
        "secondary-container": "#EDE9E3",
        "secondary-fixed": "#EDE9E3",
        "secondary-fixed-dim": "#D4CFC8",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#3A3830",
        "on-secondary-fixed": "#1C1A17",
        "on-secondary-fixed-variant": "#4A4840",

        tertiary: "#5C5A52",
        "tertiary-container": "#C8C4BC",
        "tertiary-fixed": "#E8E4DC",
        "tertiary-fixed-dim": "#D0CCC4",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#3A3830",
        "on-tertiary-fixed": "#1C1A17",
        "on-tertiary-fixed-variant": "#4A4840",

        surface: "#FAFAF8",
        "surface-bright": "#FAFAF8",
        "surface-dim": "#DDDBD6",
        "surface-variant": "#E8E5DF",
        "surface-tint": "#F5A800",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F4F3EF",
        "surface-container": "#EEECEA",
        "surface-container-high": "#E8E6E2",
        "surface-container-highest": "#E2E0DC",

        background: "#FAFAF8",
        "on-background": "#1C1A17",
        "on-surface": "#1C1A17",
        "on-surface-variant": "#524F48",
        "inverse-surface": "#32302C",
        "inverse-on-surface": "#F4F2EE",

        outline: "#86837C",
        "outline-variant": "#D4CFC8",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        headline: ["var(--font-headline)", "DM Serif Display", "serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
        label: ["var(--font-body)", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(28, 28, 25, 0.06)",
        card: "0 4px 16px rgba(28, 28, 25, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
