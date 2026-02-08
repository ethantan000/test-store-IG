import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0070f3',
          light: '#3b9eff',
          dark: '#1e3a8a',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0070f3',
          600: '#0059c7',
          700: '#1e3a8a',
          800: '#1e2d5f',
          900: '#0f172a',
        },
        accent: {
          DEFAULT: '#a855f7',
          light: '#c084fc',
          dark: '#6b21a8',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 6px 24px rgba(0, 112, 243, 0.25)',
        accent: '0 6px 24px rgba(168, 85, 247, 0.25)',
        glow: '0 0 40px rgba(0, 112, 243, 0.15)',
        'glow-accent': '0 0 40px rgba(168, 85, 247, 0.15)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0070f3 0%, #6b21a8 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(0,112,243,0.05) 0%, rgba(168,85,247,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 6s ease-in-out infinite',
        pulse_slow: 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
