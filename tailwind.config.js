/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  extend: {
    keyframes: {
      'ping-slow': {
        '0%': { transform: 'scale(0.95)', opacity: '0.8' },
        '70%': { transform: 'scale(1.15)', opacity: '0' },
        '100%': { transform: 'scale(1.15)', opacity: '0' },
      },
    },
    animation: {
      'ping-slow': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
    },
  },
},
  plugins: [],
};
