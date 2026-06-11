import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF7E6",
        mint: "#D7F5E6",
        sage: "#A9DDBF",
        blue: "#CFE8FF",
        coral: "#FFD9C1",
        peach: "#FFBFA7",
        gold: "#FFEAA7",
        charcoal: "#2D2D2D",
        lavender: "#D9C5FF",
      },
      boxShadow: {
        doodle: "0 8px 0 rgba(45,45,45,0.08), 0 18px 35px rgba(45,45,45,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
