/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './demo/**/*.{ts,tsx,html}',
    './.storybook/**/*.{ts,tsx}',
  ],
  presets: [require('./tailwind.preset.cjs')],
  darkMode: ['class', '[data-theme="dark"]'],
};
