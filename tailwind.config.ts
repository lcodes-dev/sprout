import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{ts,tsx}',
    './main.ts',
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      },
      fontFamily: {
        // Add custom fonts here
      },
    },
  },
  plugins: [
    // Add Tailwind plugins here
  ],
} satisfies Config
