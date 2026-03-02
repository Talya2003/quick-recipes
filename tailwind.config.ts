import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbf8",
          100: "#ddf3e9",
          200: "#bee8d6",
          300: "#93d8bb",
          400: "#57bc97",
          500: "#2f9f7b",
          600: "#257f63",
          700: "#206551",
          800: "#1d5142",
          900: "#194337"
        },
        accent: {
          50: "#fff9ee",
          100: "#ffefcc",
          200: "#ffe19a",
          300: "#ffd167",
          400: "#ffc042",
          500: "#f2a100",
          600: "#ca8500",
          700: "#a36a04",
          800: "#84540c",
          900: "#6d4510"
        }
      },
      boxShadow: {
        card: "0 12px 28px -18px rgba(15, 23, 42, 0.35)"
      },
      borderRadius: {
        '2xl': "1.1rem"
      }
    }
  },
  plugins: []
};

export default config;
