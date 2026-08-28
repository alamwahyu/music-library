import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#fbfaf7",
        line: "#e8e2d8",
        wine: "#8c2f39",
        moss: "#46624a"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(21, 21, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
