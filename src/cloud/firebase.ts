import type { CloudAdapter, UploadFile } from '../types';
import { err, presignedXhr } from './shared';

export interface FirebaseStorageAdapterOptions {
  bucket: string;
  /** Returns a Firebase Storage auth token for the user. */
  getIdToken: () => Promise<string>;
  /** Path builder. Defaults to `uploads/<file.name>`. */
  buildPath?: (file: UploadFile) => string;
  /** Custom metadata. */
  customMetadata?: (file: UploadFile) => Record<string, string>;
}

/**
 * Firebase Storage adapter using the v0 REST upload API.
 * Avoids pulling in firebase-js-sdk so the package stays lightweight.
 *
 * Endpoint: POST https://firebasestorage.googleapis.com/v0/b/{BUCKET}/o?name={ENCODED_PATH}
 */
export function createFirebaseStorageAdapter(
  opts: FirebaseStorageAdapterOptions,
): CloudAdapter {
  return {
    name: 'firebase-storage',
    async upload(file, { onProgress, signal }) {
      const path = opts.buildPath ? opts.buildPath(file) : `uploads/${file.name}`;
      const token = await opts.getIdToken();
      const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
        opts.bucket,
      )}/o?name=${encodeURIComponent(path)}&uploadType=media`;

      const headers: Record<string, string> = {
        Authorization: `Firebase ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
      };
      const custom = opts.customMetadata?.(file);
      if (custom) {
        for (const [k, v] of Object.entries(custom)) {
          headers[`X-Goog-Meta-${k}`] = v;
        }
      }

      const { responseText } = await presignedXhr({
        url,
        method: 'POST',
        headers,
        body: file.file,
        signal,
        onProgress,
      });

      try {
        const meta = JSON.parse(responseText) as {
          name?: string;
          downloadTokens?: string;
          bucket?: string;
          generation?: string;
          md5Hash?: string;
        };
        const downloadUrl = meta.downloadTokens
          ? `https://firebasestorage.googleapis.com/v0/b/${meta.bucket}/o/${encodeURIComponent(
              meta.name ?? path,
            )}?alt=media&token=${meta.downloadTokens.split(',')[0]}`
          : `https://firebasestorage.googleapis.com/v0/b/${meta.bucket}/o/${encodeURIComponent(
              meta.name ?? path,
            )}?alt=media`;
        return {
          url: downloadUrl,
          key: meta.name,
          metadata: meta as unknown as Record<string, unknown>,
        };
      } catch {
        throw err('parse-error', 'Invalid Firebase response', false);
      }
    },
  };
}
