import { defineConfig } from 'tsup';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

/**
 * Compile the bundled stylesheet via the Tailwind CLI. Scans the package
 * sources for utility classes (per `tailwind.lib.config.cjs`) and emits a
 * self-contained `dist/styles.css` so consumers don't need to install or
 * configure Tailwind in their own app.
 */
function buildPackageCss(): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const bin = isWindows ? 'tailwindcss.cmd' : 'tailwindcss';
    const args = [
      '-c',
      'tailwind.lib.config.cjs',
      '-i',
      'src/theme/lib.css',
      '-o',
      'dist/styles.css',
      '--minify',
    ];
    // shell: true is required so `.cmd` shims work on Windows. The args we
    // pass are static (no user input), so there's no injection surface.
    const child = spawn(join('node_modules', '.bin', bin), args, {
      stdio: 'inherit',
      shell: true,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tailwindcss exited with code ${code}`));
    });
  });
}

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
    await buildPackageCss();
  },
});
