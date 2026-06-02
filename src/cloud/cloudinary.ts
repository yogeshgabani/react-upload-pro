import type { CloudAdapter, UploadFile } from '../types';
import { err, presignedXhr } from './shared';

export interface CloudinaryAdapterOptions {
  cloudName: string;
  /** Unsigned upload preset, or omit if using `getSignature`. */
  uploadPreset?: string;
  /**
   * For signed uploads, returns { signature, timestamp, apiKey, ...extra }
   * generated server-side. Required when uploadPreset is omitted.
   */
  getSignature?: (file: UploadFile) => Promise<{
    signature: string;
    timestamp: number;
    apiKey: string;
    folder?: string;
    publicId?: string;
    [k: string]: string | number | undefined;
  }>;
  /** Optional folder prefix for the asset. */
  folder?: string;
  /** Resource type (auto handles images, videos, raw). */
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
}

/**
 * Cloudinary adapter. Uses the upload endpoint with either an unsigned preset
 * or a server-side signature. Returns the secure_url from the response.
 */
export function createCloudinaryAdapter(opts: CloudinaryAdapterOptions): CloudAdapter {
  const resource = opts.resourceType ?? 'auto';
  const endpoint = `https://api.cloudinary.com/v1_1/${opts.cloudName}/${resource}/upload`;

  return {
    name: 'cloudinary',
    async upload(file, { onProgress, signal }) {
      const fd = new FormData();
      fd.append('file', file.file, file.name);

      if (opts.uploadPreset) {
        fd.append('upload_preset', opts.uploadPreset);
      } else if (opts.getSignature) {
        const sig = await opts.getSignature(file);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', String(sig.timestamp));
        fd.append('signature', sig.signature);
        for (const [k, v] of Object.entries(sig)) {
          if (['apiKey', 'timestamp', 'signature'].includes(k)) continue;
          if (v !== undefined) fd.append(k, String(v));
        }
      } else {
        throw err('config-error', 'Cloudinary adapter needs uploadPreset or getSignature', false);
      }
      if (opts.folder) fd.append('folder', opts.folder);

      const { responseText } = await presignedXhr({
        url: endpoint,
        method: 'POST',
        body: fd,
        signal,
        onProgress,
      });
      try {
        const json = JSON.parse(responseText) as {
          secure_url?: string;
          public_id?: string;
          etag?: string;
        };
        return {
          url: json.secure_url ?? '',
          key: json.public_id,
          etag: json.etag,
          metadata: json as unknown as Record<string, unknown>,
        };
      } catch {
        throw err('parse-error', 'Invalid Cloudinary response', false);
      }
    },
  };
}
