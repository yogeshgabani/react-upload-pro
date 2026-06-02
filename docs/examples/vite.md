# Vite example

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install react-upload-pro tailwindcss
```

```ts
// tailwind.config.js
import preset from 'react-upload-pro/tailwind';
export default {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}', './node_modules/react-upload-pro/dist/**/*.{js,cjs}'],
};
```

```tsx
// src/App.tsx
import { Dropzone, ThemeProvider } from 'react-upload-pro';
import 'react-upload-pro/styles.css';
import './index.css';

export function App() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Dropzone endpoint="http://localhost:8787/upload" maxSize={5e6} />
    </ThemeProvider>
  );
}
```
