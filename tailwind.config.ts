import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E8192C',
          'red-dark': '#C41020',
          'red-light': '#FFF0F0',
          navy: '#1B2A4A',
          'navy-light': '#243558',
        },
        surface: {
          page: '#F7F7F7',
          card: '#FFFFFF',
          border: '#E0E0E0',
        },
        text: {
          primary: '#1B2A4A',
          body: '#4A4A4A',
          muted: '#6B7280',
          inverted: '#FFFFFF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'var(--ring)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      fontSize: {
        display: [
          '48px',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        h1: [
          '36px',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        h2: [
          '28px',
          { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        h3: [
          '22px',
          { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' },
        ],
        h4: [
          '18px',
          { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' },
        ],
        body: [
          '16px',
          { lineHeight: '1.7', letterSpacing: '0', fontWeight: '400' },
        ],
        small: [
          '14px',
          { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' },
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '12px',
        btn: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        nav: '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
