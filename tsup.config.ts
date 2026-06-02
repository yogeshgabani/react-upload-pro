import { defineConfig } from 'tsup';
import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * tsup writes a "use client" banner, but Rollup strips module-level directives
 * during bundling. We re-add it as a post-build step so consumers (Next.js App
 * Router, in particular) can import the package from server components.
 */
async function prependUseClient(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await prependUseClient(full);
    } else if (/\.(c?js|mjs)$/.test(entry.name) && !entry.name.endsWith('.map')) {
      const content = await readFile(full, 'utf8');
      if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
        await writeFile(full, `"use client";\n${content}`);
      }
    }
  }
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'variants/index': 'src/variants/index.ts',
    'cloud/index': 'src/cloud/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2020',
  external: ['react', 'react-dom', 'framer-motion'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  async onSuccess() {
    await prependUseClient('dist');
    await copyFile('src/theme/styles.css', 'dist/styles.css');
  },
});
