/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./nuxt.config.{js,ts}",
  ],
  // Safelist important classes that might be dynamically generated
  safelist: [
    'max-w-7xl',
    'max-w-4xl',
    'mx-auto',
    'px-4',
    'px-6',
    'px-8',
    'sm:px-6',
    'lg:px-8',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Blue Waters - Light Mode Palette
        primary: {
          50: '#e8f0f5',   // Light desaturated sky blue
          100: '#d1e1eb',  // Lighter sky blue
          200: '#a3c3d7',  // Medium sky blue
          300: '#75a5c3',  // Steel blue
          400: '#5c8fb0',  // Medium-dark muted blue
          500: '#4a7a9d',  // Dusty/slate blue
          600: '#3d6280',  // Darker slate blue
          700: '#2f4a63',  // Deep slate blue
          800: '#1f3142',  // Very dark deep blue (navy/midnight)
          900: '#0f1821',  // Almost black navy
        },
        // Ocean Depths - Dark Mode Palette
        dark: {
          50: '#f5f7fa',   // Very light almost white
          100: '#e8ecf0',  // Very light desaturated purple/lavender
          200: '#d1d9e1',  // Light desaturated blue (pale periwinkle)
          300: '#a3b3c3',  // Medium-light blue
          400: '#758da5',  // Medium-dark teal/blue-green
          500: '#5c7289',  // Darker teal/blue-green
          600: '#4a5a6d',  // Dark teal
          700: '#384251',  // Very dark teal/blue-green
          800: '#262a35',  // Almost black teal
          900: '#141519',  // Deep black teal
        },
        // Neutral grays for backgrounds and text
        gray: {
          50: '#f9fafb',   // Off-white
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
