/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#003366",
          mid: "#004A8F",
          light: "#0055A4",
          surface: "#E8F0FA",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F5A623",
          dark: "#D4891A",
          foreground: "#0F172A",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#0284C7",
        surface: "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",
        dark: {
          bg: "#0A1628",
          surface: "#0F2040",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fillGauge: {
          from: { strokeDashoffset: "100" },
          to: { strokeDashoffset: "0" },
        },
        stampIn: {
          "0%": { transform: "scale(1.3) rotate(-5deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fillGauge: "fillGauge 1s ease-out forwards",
        stampIn: "stampIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        bounceDot: "bounceDot 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
