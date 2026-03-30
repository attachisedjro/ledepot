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
        // Design system — Le Dépôt
        primary: "#815500",
        "primary-container": "#e8a020",
        "primary-fixed": "#ffddb2",
        "primary-fixed-dim": "#ffb94c",
        "on-primary": "#ffffff",
        "on-primary-container": "#5b3b00",
        "on-primary-fixed": "#291800",
        "on-primary-fixed-variant": "#624000",
        "inverse-primary": "#ffb94c",

        secondary: "#5e5d6c",
        "secondary-container": "#e3e0f2",
        "secondary-fixed": "#e3e0f2",
        "secondary-fixed-dim": "#c7c4d6",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#646372",
        "on-secondary-fixed": "#1a1a27",
        "on-secondary-fixed-variant": "#464554",

        tertiary: "#5f5c6c",
        "tertiary-container": "#b0acbe",
        "tertiary-fixed": "#e5e0f3",
        "tertiary-fixed-dim": "#c9c4d6",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#42404f",
        "on-tertiary-fixed": "#1c1a27",
        "on-tertiary-fixed-variant": "#474554",

        surface: "#fcf9f4",
        "surface-bright": "#fcf9f4",
        "surface-dim": "#dcdad5",
        "surface-variant": "#e5e2dd",
        "surface-tint": "#815500",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3ee",
        "surface-container": "#f0ede9",
        "surface-container-high": "#ebe8e3",
        "surface-container-highest": "#e5e2dd",

        background: "#fcf9f4",
        "on-background": "#1c1c19",
        "on-surface": "#1c1c19",
        "on-surface-variant": "#514534",
        "inverse-surface": "#31302d",
        "inverse-on-surface": "#f3f0eb",

        outline: "#847562",
        "outline-variant": "#d6c4ae",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        headline: ["var(--font-headline)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        label: ["var(--font-body)", "Inter", "sans-serif"],
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
