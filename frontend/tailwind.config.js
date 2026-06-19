/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      extend: {
        colors: {
          'warehouse-dark': '#0a0e17',
          'warehouse-panel': '#111827',
          'warehouse-accent': '#3b82f6',
          'warehouse-green': '#10b981',
          'warehouse-orange': '#f59e0b',
          'warehouse-red': '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
