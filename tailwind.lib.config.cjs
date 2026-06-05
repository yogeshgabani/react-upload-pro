/**
 * Tailwind config used to build the standalone `dist/styles.css` that ships
 * with the published package. It scans the package source for utility classes
 * and emits a flat stylesheet so consumers can just:
 *
 *   import 'react-upload-pro/styles.css';
 *
 * and get the same look as the demo — without having to install or configure
 * Tailwind in their own app.
 *
 * Preflight is disabled so we do NOT reset the consumer's box-sizing, margins,
 * or heading styles. Dark mode triggers off the `[data-theme="dark"]` attribute
 * applied by ThemeProvider.
 */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('./tailwind.preset.cjs')],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
};
