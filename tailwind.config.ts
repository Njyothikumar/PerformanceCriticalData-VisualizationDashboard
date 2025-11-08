import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'slate-900': '#0D1117',
        'slate-800': '#161B22',
        'slate-700': '#21262D',
        'slate-400': '#8B949E',
        'slate-300': '#C9D1D9',
        'cyan-400': '#22d3ee',
        'cyan-500': '#06b6d4',
        'sky-500': '#0ea5e9',
      },
      gridTemplateColumns: {
        'data-table': '0.5fr 1fr 0.75fr 0.75fr 0.5fr',
      }
    },
  },
  plugins: [],
};
export default config;
