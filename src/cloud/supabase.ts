import type { CloudAdapter, UploadFile } from '../types';
import { presignedXhr } from './shared';

export interface SupabaseStorageAdapterOptions {
  /** e.g. https://xyz.supabase.co */
  projectUrl: string;
  bucket: string;
  /** Anon key or user JWT — depending on RLS policy. */
  getToken: () => string | Promise<string>;
  buildPath?: (file: UploadFile) => string;
  /** Overwrite if path already exists. Default false. */
  upsert?: boolean;
}

/**
 * Supabase Storage adapter using the public REST endpoint:
 *   POST {projectUrl}/storage/v1/object/{bucket}/{path}
 */
export function createSupabaseAdapter(
  opts: SupabaseStorageAdapterOptions,
): CloudAdapter {
  return {
    name: 'supabase-storage',
    async upload(file, { onProgress, signal }) {
      const path = opts.buildPath ? opts.buildPath(file) : file.name;
      const token = await opts.getToken();
      const url = `${opts.projectUrl.replace(/\/$/, '')}/storage/v1/object/${
        opts.bucket
      }/${encodeURI(path)}`;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        apikey: token,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': opts.upsert ? 'true' : 'false',
      };
      const { responseText } = await presignedXhr({
        url,
        method: 'POST',
        headers,
        body: file.file,
        signal,
        onProgress,
      });
      const publicUrl = `${opts.projectUrl.replace(/\/$/, '')}/storage/v1/object/public/${
        opts.bucket
      }/${encodeURI(path)}`;
      let metadata: Record<string, unknown> = {};
      try {
        metadata = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        /* not JSON */
      }
      return { url: publicUrl, key: path, metadata };
    },
  };
}
