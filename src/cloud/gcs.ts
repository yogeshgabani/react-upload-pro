import type { CloudAdapter, UploadFile } from '../types';
import { err, presignedXhr } from './shared';

export interface GcsAdapterOptions {
  /** Returns a v4-signed PUT URL for the file. */
  getSignedUrl: (file: UploadFile) => Promise<string>;
  /** Public download URL builder. */
  buildPublicUrl?: (file: UploadFile, signedUrl: string) => string;
}

/**
 * Google Cloud Storage adapter using a v4-signed URL. The signing must happen
 * server-side; this adapter just performs the PUT.
 */
export function createGcsAdapter(opts: GcsAdapterOptions): CloudAdapter {
  return {
    name: 'gcs',
    async upload(file, { onProgress, signal }) {
      const url = await opts.getSignedUrl(file);
      if (!url) throw err('config-error', 'No signed URL returned', false);
      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      };
      const { responseHeaders } = await presignedXhr({
        url,
        method: 'PUT',
        headers,
        body: file.file,
        signal,
        onProgress,
      });
      const publicUrl = opts.buildPublicUrl
        ? opts.buildPublicUrl(file, url)
        : url.split('?')[0] ?? url;
      const result: { url: string; etag?: string } = { url: publicUrl };
      if (responseHeaders.etag) result.etag = responseHeaders.etag.replace(/"/g, '');
      return result;
    },
  };
}
