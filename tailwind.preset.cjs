/**
 * Tailwind preset for react-upload-pro.
 * Consumers can extend their tailwind.config.js with this preset to inherit
 * the design tokens used by the built-in variants.
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require('react-upload-pro/tailwind')],
 *     content: ['./src/**\/*.{ts,tsx}', './node_modules/react-upload-pro/dist/**\/*.{js,cjs}'],
 *   };
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        rup: {
          bg: 'rgb(var(--rup-bg) / <alpha-value>)',
          fg: 'rgb(var(--rup-fg) / <alpha-value>)',
          muted: 'rgb(var(--rup-muted) / <alpha-value>)',
          border: 'rgb(var(--rup-border) / <alpha-value>)',
          accent: 'rgb(var(--rup-accent) / <alpha-value>)',
          'accent-fg': 'rgb(var(--rup-accent-fg) / <alpha-value>)',
          success: 'rgb(var(--rup-success) / <alpha-value>)',
          error: 'rgb(var(--rup-error) / <alpha-value>)',
          warning: 'rgb(var(--rup-warning) / <alpha-value>)',
        },
      },
      borderRadius: {
        rup: 'var(--rup-radius)',
      },
      boxShadow: {
        rup: 'var(--rup-shadow)',
      },
    },
  },
  plugins: [],
};
