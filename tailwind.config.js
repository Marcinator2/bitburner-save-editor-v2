export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Override gray shades with dark terminal-green tones (Bitburner aesthetic)
        gray: {
          50:  "#e8f5e8",
          100: "#c2e0c2",
          200: "#9ccc9c",
          300: "#6db06d",
          400: "#4d8f4d",
          500: "#336b33",
          600: "#1e4a1e",
          700: "#163516",
          800: "#0e220e",
          900: "#091509",
          950: "#040c04",
        },
        // Neon green accents
        green: {
          50:  "#f0fff0",
          100: "#ccffcc",
          200: "#99ff99",
          300: "#66ff66",
          400: "#33ff33",
          500: "#00e600",
          600: "#00b300",
          700: "#008000",
          800: "#005200",
          900: "#002900",
          950: "#001400",
        },
      },
      boxShadow: {
        "neon-sm": "0 0 6px rgba(0, 230, 0, 0.4)",
        "neon":    "0 0 12px rgba(0, 230, 0, 0.5)",
        "neon-lg": "0 0 24px rgba(0, 230, 0, 0.4), 0 0 48px rgba(0, 230, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
