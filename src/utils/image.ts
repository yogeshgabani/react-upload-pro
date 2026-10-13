import type { ImageCompressionOptions } from '../types';

/** Formats the browser can decode AND re-encode via canvas. */
const COMPRESSIBLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Resize and re-encode an image in the browser. Returns the original file
 * untouched when it isn't a JPEG / PNG / WebP, when the browser can't decode
 * it, when running on the server, or when the result wouldn't be smaller.
 *
 *   const small = await compressImage(file, { maxWidth: 1280, quality: 0.7 });
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<File> {
  if (!COMPRESSIBLE.has(file.type)) return file;
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') return file;

  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;
  const mimeType = options.mimeType ?? file.type;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  // JPEG has no alpha channel — flatten onto white instead of black.
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );
  if (!blob) return file;

  // Re-encoding without resizing can grow the file (an already-optimised
  // JPEG, or a browser that can't encode WebP and falls back to PNG).
  // Keep whichever is smaller.
  if (scale === 1 && blob.size >= file.size) return file;

  const outType = blob.type || mimeType;
  const name =
    outType === file.type ? file.name : replaceExtension(file.name, EXTENSIONS[outType] ?? 'img');
  const compressed = new File([blob], name, { type: outType, lastModified: file.lastModified });
  // Keep the folder path from directory uploads so `UploadFile.path` survives.
  if (file.webkitRelativePath) {
    Object.defineProperty(compressed, 'webkitRelativePath', {
      value: file.webkitRelativePath,
      configurable: true,
    });
  }
  return compressed;
}

function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf('.');
  return `${dot > 0 ? name.slice(0, dot) : name}.${ext}`;
}
