/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F3D3E",
          light: "#1C5C5D",
        },
        accent: {
          DEFAULT: "#C9952C",
          light: "#E3C275",
        },
        neutral: {
          900: "#1A1A1A",
          700: "#4A4A4A",
          400: "#9A9A9A",
          200: "#E4E4E4",
          100: "#F6F5F3",
        },
        surface: "#FFFFFF",
        success: "#1E7B4D",
        warning: "#B8860B",
        error: "#C0392B",
        info: "#2C6E91",
        // Module accent-tinting (design doc §2.1) — used sparingly, only on
        // dashboard headers/icons for quick visual orientation per module.
        module: {
          rooms: "#0F3D3E",
          restaurant: "#B5572C",
          banquet: "#6B3B5E",
          conference: "#2C6E91",
        },
      },
      fontFamily: {
        heading: ["Fraunces", "Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.5rem",
        "2xl": "1.875rem",
        "3xl": "2.5rem",
      },
      spacing: {
        18: "4.5rem",
      },
      borderRadius: {
        // These override Tailwind's default rounded-sm/md/lg values with
        // the design system values. rounded-sm = 8px, rounded-md = 12px,
        // rounded-lg = 16px across this entire project.
        sm: "8px",
        md: "12px",
        lg: "16px",
        pill: "999px",
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0,0,0,0.06)",
        "elevation-2": "0 4px 12px rgba(0,0,0,0.08)",
        "elevation-3": "0 12px 32px rgba(0,0,0,0.12)",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};