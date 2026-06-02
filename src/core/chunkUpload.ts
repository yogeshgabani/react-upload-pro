import type { ChunkState, UploadError, UploadFile, UploaderConfig } from '../types';

export interface ChunkUploadParams {
  file: UploadFile;
  config: UploaderConfig;
  signal: AbortSignal;
  onProgress: (loaded: number, total: number) => void;
}

/**
 * Chunked upload over plain HTTP. Each chunk is sent as a separate request
 * with `Content-Range` and `X-Upload-Id` headers so a custom server can stitch
 * them together. The implementation is provider-agnostic — for S3 multipart,
 * use the s3 cloud adapter instead.
 *
 * Resume semantics: chunks already marked 'success' in file.chunks are skipped.
 * This makes pause-then-resume cheap: just abort, then call upload again.
 */
export async function chunkUpload(params: ChunkUploadParams): Promise<unknown> {
  const { file, config, signal, onProgress } = params;
  const chunkSize = config.chunkSize ?? 5 * 1024 * 1024;
  const uploadId = file.id;

  if (!file.chunks || file.chunks.length === 0) {
    file.chunks = buildChunks(file.size, chunkSize);
  }

  const total = file.size;
  let loadedBaseline = file.chunks
    .filter((c) => c.status === 'success')
    .reduce((sum, c) => sum + (c.end - c.start), 0);

  for (const chunk of file.chunks) {
    if (signal.aborted) throw makeError('cancelled', 'Upload cancelled', false);
    if (chunk.status === 'success') continue;

    chunk.status = 'uploading';
    chunk.attempts += 1;

    const blob = file.file.slice(chunk.start, chunk.end);
    try {
      await sendChunk({
        blob,
        chunk,
        total,
        uploadId,
        config,
        signal,
        onProgress: (loadedInChunk) => {
          onProgress(loadedBaseline + loadedInChunk, total);
        },
      });
      chunk.status = 'success';
      loadedBaseline += chunk.end - chunk.start;
      onProgress(loadedBaseline, total);
    } catch (err) {
      chunk.status = 'error';
      throw err;
    }
  }

  return { uploadId, chunks: file.chunks.length };
}

function buildChunks(total: number, size: number): ChunkState[] {
  const chunks: ChunkState[] = [];
  let start = 0;
  let index = 0;
  while (start < total) {
    const end = Math.min(total, start + size);
    chunks.push({ index, start, end, status: 'pending', attempts: 0 });
    start = end;
    index += 1;
  }
  // Ensure at least one chunk for zero-byte files.
  if (chunks.length === 0) {
    chunks.push({ index: 0, start: 0, end: 0, status: 'pending', attempts: 0 });
  }
  return chunks;
}

interface SendChunkParams {
  blob: Blob;
  chunk: ChunkState;
  total: number;
  uploadId: string;
  config: UploaderConfig;
  signal: AbortSignal;
  onProgress: (loadedInChunk: number) => void;
}

function sendChunk(params: SendChunkParams): Promise<void> {
  const { blob, chunk, total, uploadId, config, signal, onProgress } = params;
  return new Promise(async (resolve, reject) => {
    if (!config.endpoint) {
      reject(makeError('config-error', 'No endpoint configured', false));
      return;
    }
    let headers: Record<string, string> = {};
    if (config.headers) {
      try {
        headers =
          typeof config.headers === 'function' ? await config.headers() : { ...config.headers };
      } catch (cause) {
        reject(makeError('headers-failed', 'Failed to compute headers', true, cause));
        return;
      }
    }
    headers['Content-Range'] = `bytes ${chunk.start}-${Math.max(0, chunk.end - 1)}/${total}`;
    headers['X-Upload-Id'] = uploadId;
    headers['X-Chunk-Index'] = String(chunk.index);

    const xhr = new XMLHttpRequest();
    xhr.open(config.method ?? 'POST', config.endpoint, true);
    xhr.withCredentials = !!config.withCredentials;
    for (const [k, v] of Object.entries(headers)) {
      try {
        xhr.setRequestHeader(k, v);
      } catch {
        /* ignore */
      }
    }
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) onProgress(ev.loaded);
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        reject(
          makeError(
            `http-${xhr.status}`,
            `Chunk ${chunk.index} failed: ${xhr.status}`,
            xhr.status >= 500 || xhr.status === 408 || xhr.status === 429,
          ),
        );
      }
    });
    xhr.addEventListener('error', () => reject(makeError('network', 'Network error', true)));
    xhr.addEventListener('abort', () => reject(makeError('cancelled', 'Upload cancelled', false)));
    signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

function makeError(code: string, message: string, retryable: boolean, cause?: unknown): UploadError {
  return { code, message, retryable, cause };
}
