import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS configuration for ViralGoods.
 *
 * We extend the default theme with brand colours derived from the original
 * ViralGoods prototype.  The dark palette ensures high contrast against
 * the deep background used throughout the site.  Adjust these values to
 * match your own branding.
 */
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7cf5ff',
          light: '#8bfaff',
          dark: '#5ad5e5',
        },
        purple: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
      },
      boxShadow: {
        brand: '0 6px 18px rgba(124, 245, 255, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;