/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        base: {
          50: "#f7f8fb",
          100: "#eef0f6",
          200: "#dfe2ec",
          800: "#12141c",
          900: "#0a0b10",
          950: "#050609",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(108,140,255,0.45)",
        glass: "0 8px 32px rgba(0,0,0,0.28)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
