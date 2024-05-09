/** @type {import('tailwindcss').Config} */
const tailwindcssPlugin = require('tailwindcss/plugin');
module.exports = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
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
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    tailwindcssPlugin(function ({ addUtilities, matchUtilities, theme }) {
      matchUtilities(
        {
          require: (value) => ({
            position: 'relative',
            '&::before': {
              content: '*',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              [value]: '-24rpx',
              color: 'red',
            },
          }),
        },
        { values: { left: 'left', right: 'right' } }
      );
      matchUtilities(
        {
          safe: (value) => {
            const name = {
              b: 'bottom',
              t: 'top',
              l: 'left',
              r: 'right',
            }[value];
            return {
              'padding-bottom': `constant(safe-area-inset-${name})` /*兼容 IOS<11.2*/,
              'padding-bottom ': `env(safe-area-inset-${name})` /*兼容 IOS>11.2*/,
            };
          },
        },
        { values: { b: 'b', t: 't', l: 'l', r: 'r' } }
      );
      matchUtilities(
        {
          square: (value) => ({
            width: value,
            height: value,
          }),
          circular: (value) => ({
            width: value,
            height: value,
            'border-radius': '100%',
          }),
          'expand-area': (value) => ({
            position: 'relative',
            '&::after': {
              content: '',
              position: 'absolute',
              top: value,
              bottom: value,
              left: value,
              right: value,
              'z-index': 80,
            },
          }),
        },
        { values: theme('spacing') }
      );
      addUtilities({
        '.flex-col-center': {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'flex-direction': 'column',
        },
        '.flex-center': {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'flex-direction': 'row',
        },
        '.all-unset': {
          all: 'unset',
        },
      });
    }),
  ],
};
