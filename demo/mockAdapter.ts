import type { CloudAdapter } from 'react-upload-pro';

export interface MockAdapterOptions {
  /** Total simulated duration in ms. Default 3000. */
  durationMs?: number;
  /** Probability (0..1) that an upload "fails". Default 0. */
  failRate?: number;
}

/**
 * Cloud adapter that fakes a real upload — useful for the playground so we
 * don't hammer a 404 endpoint. Progresses in ~30 ticks across the configured
 * duration. Respects the abort signal.
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
            reject({ code: 'cancelled', message: 'Upload cancelled', retryable: false });
            return;
          }
          i += 1;
          const loaded = Math.min(total, Math.round((total * i) / ticks));
          onProgress(loaded, total);

          if (i === failAt) {
            reject({
              code: 'mock-failure',
              message: 'Mock upload failed (set failRate=0 to disable)',
              retryable: true,
            });
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
