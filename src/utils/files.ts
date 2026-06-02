import type { FileMetadata, UploadFile } from '../types';
import { generateId } from './id';

const SSR = typeof window === 'undefined';

/** Convert a native File into an UploadFile. */
export function wrapFile(file: File, metadata: FileMetadata = {}): UploadFile {
  const path =
    typeof (file as File & { webkitRelativePath?: string }).webkitRelativePath === 'string'
      ? (file as File & { webkitRelativePath: string }).webkitRelativePath
      : '';

  return {
    id: generateId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    path,
    status: 'idle',
    progress: 0,
    bytesUploaded: 0,
    speed: 0,
    eta: Infinity,
    addedAt: Date.now(),
    attempts: 0,
    metadata,
  };
}

/**
 * Create an object URL for previews. SSR-safe (returns undefined on server).
 * Caller is responsible for revoking via revokePreview.
 */
export function generatePreview(file: File): string | undefined {
  if (SSR) return undefined;
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return undefined;
  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}

export function revokePreview(url: string | undefined): void {
  if (!url || SSR) return;
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* ignore */
  }
}

/** Best-effort file category from MIME or extension. */
export function getFileCategory(
  file: File | UploadFile,
): 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'office' | 'archive' | 'other' {
  const name = 'file' in file ? file.file.name : file.name;
  const type = 'file' in file ? file.file.type : file.type;
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('text/') || type === 'application/json' || type === 'application/xml') {
    return 'text';
  }
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    return 'office';
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'archive';
  if (['md', 'log', 'csv', 'tsv'].includes(ext)) return 'text';
  return 'other';
}

/**
 * Read the first 16 bytes of a file to validate its magic-number signature.
 * Returns the detected MIME type or null. Best-effort, not exhaustive.
 *
 * Uses a small dispatch because `Blob.arrayBuffer` isn't always available
 * (e.g., in some jsdom versions) — we fall back to FileReader.
 */
export async function detectSignature(file: File): Promise<string | null> {
  const head = file.slice(0, 16);
  const ab = await readArrayBuffer(head);
  const buf = new Uint8Array(ab);
  const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');

  // JPEG
  if (hex.startsWith('ffd8ff')) return 'image/jpeg';
  // PNG
  if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
  // GIF
  if (hex.startsWith('474946383761') || hex.startsWith('474946383961')) return 'image/gif';
  // WebP (RIFF....WEBP)
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return 'image/webp';
  // PDF
  if (hex.startsWith('25504446')) return 'application/pdf';
  // ZIP (also docx, xlsx, pptx, jar)
  if (hex.startsWith('504b0304') || hex.startsWith('504b0506') || hex.startsWith('504b0708')) {
    return 'application/zip';
  }
  // MP4 / m4a / mov
  if (hex.slice(8, 16) === '66747970') return 'video/mp4';
  // GZIP
  if (hex.startsWith('1f8b')) return 'application/gzip';
  return null;
}

/**
 * Recursively walk a DataTransferItemList for files, including folders.
 * Returns a flat list of File objects with webkitRelativePath set when possible.
 */
export async function collectFiles(items: DataTransferItemList | null): Promise<File[]> {
  if (!items) return [];
  const collected: File[] = [];
  const promises: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    if (item.kind !== 'file') continue;
    const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
    if (entry) {
      promises.push(walkEntry(entry, '', collected));
    } else {
      const file = item.getAsFile();
      if (file) collected.push(file);
    }
  }

  await Promise.all(promises);
  return collected;
}

async function walkEntry(
  entry: FileSystemEntry,
  basePath: string,
  out: File[],
): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise((resolve) => {
      fileEntry.file(
        (f) => {
          if (basePath) {
            Object.defineProperty(f, 'webkitRelativePath', {
              value: `${basePath}/${f.name}`,
              configurable: true,
            });
          }
          out.push(f);
          resolve();
        },
        () => resolve(),
      );
    });
  }
  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();
    const children: FileSystemEntry[] = [];
    await new Promise<void>((resolve) => {
      const readAll = () => {
        reader.readEntries((batch) => {
          if (batch.length === 0) {
            resolve();
            return;
          }
          children.push(...batch);
          readAll();
        }, () => resolve());
      };
      readAll();
    });
    const nextPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    await Promise.all(children.map((c) => walkEntry(c, nextPath, out)));
  }
}

/** Stable identity key used for duplicate detection. */
export function fileKey(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

async function readArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  const maybe = (blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer;
  if (typeof maybe === 'function') {
    return maybe.call(blob);
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}
