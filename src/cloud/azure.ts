import type { CloudAdapter, UploadFile } from '../types';
import { presignedXhr } from './shared';

export interface AzureBlobAdapterOptions {
  /** The container URL with a SAS token, e.g. https://acct.blob.core.windows.net/container?sv=... */
  getSasUrl: (file: UploadFile) => Promise<string>;
  /** Blob name builder. Defaults to file.name. */
  buildBlobName?: (file: UploadFile) => string;
}

/**
 * Azure Blob Storage adapter using a SAS-token URL. The SAS URL must grant
 * the 'create'/'write' permission. This adapter uses a single PutBlob request
 * (no block-blob staging) — for files larger than 256MB, use the chunkUpload
 * path with a server-side block-id mint.
 */
export function createAzureBlobAdapter(opts: AzureBlobAdapterOptions): CloudAdapter {
  return {
    name: 'azure-blob',
    async upload(file, { onProgress, signal }) {
      const sasUrl = await opts.getSasUrl(file);
      const blobName = opts.buildBlobName ? opts.buildBlobName(file) : file.name;
      // Inject blob name as a path segment before any query string.
      const url = injectBlobName(sasUrl, blobName);
      const headers: Record<string, string> = {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type || 'application/octet-stream',
      };
      await presignedXhr({
        url,
        method: 'PUT',
        headers,
        body: file.file,
        signal,
        onProgress,
      });
      return {
        url: url.split('?')[0] ?? url,
        key: blobName,
      };
    },
  };
}

function injectBlobName(sasUrl: string, blobName: string): string {
  const [base, query] = sasUrl.split('?');
  const cleanBase = (base ?? '').replace(/\/$/, '');
  const path = `${cleanBase}/${encodeURI(blobName)}`;
  return query ? `${path}?${query}` : path;
}
