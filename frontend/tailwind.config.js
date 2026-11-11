import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url)).replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `${rootDir}/index.html`,
    `${rootDir}/src/**/*.{js,ts,jsx,tsx}`,
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        cardFg: 'var(--color-card-foreground)',
        muted: 'var(--color-muted)',
        mutedFg: 'var(--color-muted-foreground)',
        borderToken: 'var(--color-border)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        onPrimary: 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        onAccent: 'var(--color-on-accent)',
        destructive: 'var(--color-destructive)',
        onDestructive: 'var(--color-on-destructive)',
        ringToken: 'var(--color-ring)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'token-card': 'var(--card-shadow)',
        'token-card-hover': 'var(--card-shadow-hover)',
        'glow-primary': '0 4px 24px -4px rgba(37, 99, 235, 0.35)',
        'glow-danger': '0 4px 24px -4px rgba(220, 38, 38, 0.35)',
      },
    },
  },
  plugins: [],
}
