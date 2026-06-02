import type { CloudAdapter, CloudUploadResult, UploadFile } from '../types';
import { presignedXhr, type PresignFn } from './shared';

export interface S3AdapterOptions {
  /**
   * Returns a presigned upload URL for a single file. The caller is responsible
   * for generating this server-side; this adapter never holds AWS credentials.
   *
   * For PUT uploads, return { url, method: 'PUT' }.
   * For POST uploads with form fields, return { url, method: 'POST', fields }.
   */
  getPresignedUrl: PresignFn;
  /**
   * Optional callback to derive the final object URL. Defaults to the
   * presigned URL with query strings stripped.
   */
  buildPublicUrl?: (file: UploadFile, presignedUrl: string) => string;
}

/**
 * AWS S3 adapter using presigned URLs. Supports both POST (with policy fields)
 * and PUT uploads. For multipart uploads, generate a separate presigned URL
 * per part on the server and use the chunkUpload + getUploadToken combo
 * instead.
 */
export function createS3Adapter(opts: S3AdapterOptions): CloudAdapter {
  return {
    name: 's3',
    async upload(file, { onProgress, signal }) {
      const presigned = await opts.getPresignedUrl(file);
      let body: Blob | FormData = file.file;
      const headers: Record<string, string> = { ...(presigned.headers ?? {}) };
      const method = presigned.method ?? 'PUT';

      if (method === 'POST' && presigned.fields) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(presigned.fields)) fd.append(k, v);
        fd.append('file', file.file, file.name);
        body = fd;
      } else if (method === 'PUT') {
        if (!headers['Content-Type'] && file.type) headers['Content-Type'] = file.type;
      }

      const { responseHeaders } = await presignedXhr({
        url: presigned.url,
        method,
        headers,
        body,
        signal,
        onProgress,
      });

      const publicUrl = opts.buildPublicUrl
        ? opts.buildPublicUrl(file, presigned.url)
        : presigned.url.split('?')[0] ?? presigned.url;

      const result: CloudUploadResult = { url: publicUrl };
      if (responseHeaders.etag) result.etag = responseHeaders.etag.replace(/"/g, '');
      return result;
    },
  };
}
