import type { CloudAdapter } from '../types';
import { err } from './shared';

export interface MockAdapterOptions {
  /** Total simulated duration per file in ms. Default 3000. */
  durationMs?: number;
  /** Probability (0..1) that an upload "fails" with a retryable error. Default 0. */
  failRate?: number;
}

/**
 * Adapter that fakes an upload — progress, speed, ETA, cancel, and retry all
 * behave like a real one, but nothing leaves the browser. Use it to try the
 * UI before you have a backend, in Storybook, or in tests.
 *
 *   <Dropzone cloud={createMockAdapter()} mode="auto" />
 *
 * Resolves with `{ url: 'mock://uploads/<name>' }`.
 */
export function createMockAdapter(opts: MockAdapterOptions = {}): CloudAdapter {
  const duration = opts.durationMs ?? 3000;
  const failRate = opts.failRate ?? 0;
  return {
    name: 'mock',
    upload(file, { onProgress, signal }) {
      return new Promise((resolve, reject) => {
        const total = Math.max(file.size, 1);
        const ticks = 30;
        const interval = duration / ticks;
        let i = 0;
        const willFail = Math.random() < failRate;
        const failAt = willFail ? Math.floor(ticks * (0.3 + Math.random() * 0.4)) : -1;

        const tick = () => {
          if (signal.aborted) {
            reject(err('cancelled', 'Upload cancelled', false));
            return;
          }
          i += 1;
          const loaded = Math.min(total, Math.round((total * i) / ticks));
          onProgress(loaded, total);

          if (i === failAt) {
            reject(err('mock-failure', 'Mock upload failed (set failRate=0 to disable)', true));
            return;
          }

          if (i >= ticks) {
            resolve({ url: `mock://uploads/${encodeURIComponent(file.name)}` });
            return;
          }
          setTimeout(tick, interval);
        };
        setTimeout(tick, interval);
      });
    },
  };
}
