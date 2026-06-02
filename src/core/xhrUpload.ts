import type { UploadError, UploadFile, UploaderConfig } from '../types';

export interface XhrProgressEvent {
  loaded: number;
  total: number;
}

export interface XhrUploadParams {
  file: UploadFile;
  config: UploaderConfig;
  signal: AbortSignal;
  onProgress: (event: XhrProgressEvent) => void;
}

/**
 * Single-shot file upload via XMLHttpRequest. XHR is used instead of fetch
 * because fetch lacks reliable upload-progress support in all browsers.
 *
 * Returns the parsed response body (JSON if possible, else text).
 * Throws UploadError on failure.
 */
export function xhrUpload(params: XhrUploadParams): Promise<unknown> {
  const { file, config, signal, onProgress } = params;

  return new Promise(async (resolve, reject) => {
    if (signal.aborted) {
      reject(makeError('cancelled', 'Upload cancelled', false));
      return;
    }

    let url = config.endpoint;
    let method: 'POST' | 'PUT' | 'PATCH' = config.method ?? 'POST';
    let extraFields: Record<string, string> = {};
    let extraHeaders: Record<string, string> = {};

    if (typeof config.getUploadToken === 'function') {
      try {
        const token = await config.getUploadToken(file);
        url = token.url;
        method = token.method ?? method;
        extraFields = token.fields ?? {};
        extraHeaders = token.headers ?? {};
      } catch (cause) {
        reject(makeError('token-failed', 'Failed to obtain upload token', true, cause));
        return;
      }
    }

    if (!url) {
      reject(makeError('config-error', 'No endpoint configured', false));
      return;
    }

    let headers: Record<string, string> = { ...extraHeaders };
    if (config.headers) {
      try {
        const dynamic =
          typeof config.headers === 'function' ? await config.headers() : config.headers;
        headers = { ...headers, ...dynamic };
      } catch (cause) {
        reject(makeError('headers-failed', 'Failed to compute headers', true, cause));
        return;
      }
    }

    const formExtra =
      typeof config.formData === 'function' ? config.formData(file) : (config.formData ?? {});

    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = !!config.withCredentials;
    for (const [k, v] of Object.entries(headers)) {
      try {
        xhr.setRequestHeader(k, v);
      } catch {
        /* ignore forbidden headers */
      }
    }

    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) onProgress({ loaded: ev.loaded, total: ev.total });
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const ct = xhr.getResponseHeader('content-type') ?? '';
        let body: unknown = xhr.responseText;
        if (ct.includes('application/json')) {
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            /* leave as text */
          }
        }
        resolve(body);
      } else {
        reject(
          makeError(
            `http-${xhr.status}`,
            `Upload failed with status ${xhr.status}`,
            xhr.status >= 500 || xhr.status === 408 || xhr.status === 429,
            xhr.responseText,
          ),
        );
      }
    });

    xhr.addEventListener('error', () => {
      reject(makeError('network', 'Network error', true));
    });

    xhr.addEventListener('abort', () => {
      reject(makeError('cancelled', 'Upload cancelled', false));
    });

    xhr.addEventListener('timeout', () => {
      reject(makeError('timeout', 'Upload timed out', true));
    });

    const onAbort = () => xhr.abort();
    signal.addEventListener('abort', onAbort, { once: true });

    // Build body
    const fieldName = config.fieldName ?? 'file';
    if (method === 'POST' && Object.keys(formExtra).length + Object.keys(extraFields).length > 0) {
      const fd = new FormData();
      for (const [k, v] of Object.entries({ ...extraFields, ...formExtra })) fd.append(k, v);
      fd.append(fieldName, file.file, file.name);
      xhr.send(fd);
    } else if (method === 'POST') {
      const fd = new FormData();
      fd.append(fieldName, file.file, file.name);
      xhr.send(fd);
    } else {
      // PUT/PATCH: send the raw file body. Useful for presigned URLs.
      xhr.send(file.file);
    }
  });
}

function makeError(code: string, message: string, retryable: boolean, cause?: unknown): UploadError {
  return { code, message, retryable, cause };
}
