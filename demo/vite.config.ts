import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      'react-upload-pro/variants': path.resolve(__dirname, '../src/variants/index.ts'),
      'react-upload-pro/cloud': path.resolve(__dirname, '../src/cloud/index.ts'),
      'react-upload-pro/styles.css': path.resolve(__dirname, '../src/theme/styles.css'),
      'react-upload-pro': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: { port: 5173 },
});
