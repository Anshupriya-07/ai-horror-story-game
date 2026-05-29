/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        horror: ['"Cinzel"', "Georgia", "serif"],
        body: ['"Crimson Pro"', "Georgia", "serif"],
      },
      colors: {
        horror: {
          bg: "#050508",
          surface: "#0c0a10",
          crimson: "#8b0000",
          glow: "#dc143c",
          mist: "#1a1520",
        },
      },
      boxShadow: {
        "crimson-glow": "0 0 20px rgba(220, 20, 60, 0.5), 0 0 40px rgba(139, 0, 0, 0.3)",
        "crimson-glow-lg":
          "0 0 30px rgba(220, 20, 60, 0.6), 0 0 60px rgba(139, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        flicker: "flicker 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.85" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};
