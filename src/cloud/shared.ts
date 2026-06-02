import type { UploadError, UploadFile } from '../types';

/**
 * Shared XHR helper for cloud adapters. Sends a single request with progress
 * callbacks. Returns response headers as a plain object so adapters can
 * pluck ETags etc.
 */
export interface PresignedPutParams {
  url: string;
  method?: 'PUT' | 'POST' | 'PATCH';
  headers?: Record<string, string>;
  body: Blob | FormData;
  signal: AbortSignal;
  onProgress: (loaded: number, total: number) => void;
}

export function presignedXhr(
  params: PresignedPutParams,
): Promise<{ status: number; responseText: string; responseHeaders: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(params.method ?? 'PUT', params.url, true);
    for (const [k, v] of Object.entries(params.headers ?? {})) {
      try {
        xhr.setRequestHeader(k, v);
      } catch {
        /* ignore */
      }
    }
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) params.onProgress(ev.loaded, ev.total);
    });
    xhr.addEventListener('load', () => {
      const headers = parseHeaders(xhr.getAllResponseHeaders());
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ status: xhr.status, responseText: xhr.responseText, responseHeaders: headers });
      } else {
        reject(
          err(
            `http-${xhr.status}`,
            `Upload failed: ${xhr.status}`,
            xhr.status >= 500 || xhr.status === 408 || xhr.status === 429,
          ),
        );
      }
    });
    xhr.addEventListener('error', () => reject(err('network', 'Network error', true)));
    xhr.addEventListener('abort', () => reject(err('cancelled', 'Upload cancelled', false)));
    params.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(params.body);
  });
}

export function err(code: string, message: string, retryable: boolean, cause?: unknown): UploadError {
  return { code, message, retryable, cause };
}

function parseHeaders(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim();
      if (k) out[k] = v;
    }
  }
  return out;
}

export type PresignFn = (
  file: UploadFile,
) => Promise<{ url: string; method?: 'PUT' | 'POST'; headers?: Record<string, string>; fields?: Record<string, string> }>;
