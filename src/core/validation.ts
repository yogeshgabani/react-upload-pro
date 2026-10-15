import type { Accept, ImageDimensionLimits, ValidationConfig, ValidationError } from '../types';
import { formatBytes, fileKey, getImageSize } from '../utils';

/**
 * Normalize the `accept` config into a flat list of MIME/extension matchers.
 */
export function normalizeAccept(accept: Accept | undefined): string[] {
  if (!accept) return [];
  if (typeof accept === 'string') {
    return accept.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(accept)) {
    return accept.map((s) => s.trim()).filter(Boolean);
  }
  // Record<mime, extensions>
  const out: string[] = [];
  for (const [mime, exts] of Object.entries(accept)) {
    out.push(mime);
    if (Array.isArray(exts)) out.push(...exts);
  }
  return out;
}

/**
 * Match a file's MIME / extension against a list of acceptors.
 * Supports `image/*` wildcards and `.ext` entries.
 */
export function matchesAccept(file: File, acceptors: string[]): boolean {
  if (acceptors.length === 0) return true;
  const fileMime = (file.type || '').toLowerCase();
  const fileName = file.name.toLowerCase();
  for (const raw of acceptors) {
    const a = raw.toLowerCase();
    if (a.startsWith('.')) {
      if (fileName.endsWith(a)) return true;
      continue;
    }
    if (a.endsWith('/*')) {
      const prefix = a.slice(0, -1); // "image/"
      if (fileMime.startsWith(prefix)) return true;
      continue;
    }
    if (fileMime === a) return true;
  }
  return false;
}

/**
 * Validate one file synchronously against built-in rules.
 * Custom (async) validators are run separately by validateFile.
 */
function validateBuiltin(file: File, config: ValidationConfig): ValidationError | null {
  if (typeof config.minSize === 'number' && file.size < config.minSize) {
    return {
      code: 'file-too-small',
      message: `File is smaller than ${formatBytes(config.minSize)}.`,
      file,
    };
  }
  if (typeof config.maxSize === 'number' && file.size > config.maxSize) {
    return {
      code: 'file-too-large',
      message: `File is larger than ${formatBytes(config.maxSize)}.`,
      file,
    };
  }
  const acceptors = normalizeAccept(config.accept);
  if (!matchesAccept(file, acceptors)) {
    return {
      code: 'file-invalid-type',
      message: `File type "${file.type || 'unknown'}" is not allowed.`,
      file,
    };
  }
  return null;
}

/**
 * Full single-file validation including custom async validators.
 */
export async function validateFile(
  file: File,
  config: ValidationConfig,
): Promise<ValidationError | null> {
  const built = validateBuiltin(file, config);
  if (built) return built;
  if (config.imageDimensions) {
    const dimensionError = await validateImageDimensions(file, config.imageDimensions);
    if (dimensionError) return dimensionError;
  }
  if (config.validators?.length) {
    for (const validator of config.validators) {
      const result = await validator(file);
      if (result) return result;
    }
  }
  return null;
}

async function validateImageDimensions(
  file: File,
  limits: ImageDimensionLimits,
): Promise<ValidationError | null> {
  const size = await getImageSize(file);
  if (!size) return null;
  const { width, height } = size;
  const { minWidth, minHeight, maxWidth, maxHeight } = limits;
  if ((minWidth !== undefined && width < minWidth) || (minHeight !== undefined && height < minHeight)) {
    return {
      code: 'image-too-small',
      message: `Image is ${width}×${height}px; it must be at least ${describeSize(minWidth, minHeight)}.`,
      file,
    };
  }
  if ((maxWidth !== undefined && width > maxWidth) || (maxHeight !== undefined && height > maxHeight)) {
    return {
      code: 'image-too-large',
      message: `Image is ${width}×${height}px; it must be at most ${describeSize(maxWidth, maxHeight)}.`,
      file,
    };
  }
  return null;
}

/** "200×100px", "200px wide", or "100px tall" — whichever limits are set. */
function describeSize(width: number | undefined, height: number | undefined): string {
  if (width !== undefined && height !== undefined) return `${width}×${height}px`;
  if (width !== undefined) return `${width}px wide`;
  return `${height}px tall`;
}

/**
 * Validate a batch of files. Applies maxFiles first, then duplicate
 * detection, then per-file rules and async validators, then maxTotalSize.
 * `existingCount` / `existingKeys` / `existingBytes` describe files already
 * in the list. Returns accepted + rejected.
 */
export async function validateBatch(
  files: File[],
  config: ValidationConfig,
  existingCount = 0,
  existingKeys: Set<string> = new Set(),
  existingBytes = 0,
): Promise<{ accepted: File[]; rejected: ValidationError[] }> {
  const accepted: File[] = [];
  const rejected: ValidationError[] = [];
  const seenInBatch = new Set<string>();
  let count = existingCount;
  let totalBytes = existingBytes;

  for (const file of files) {
    if (typeof config.maxFiles === 'number' && count >= config.maxFiles) {
      rejected.push({
        code: 'too-many-files',
        message: `Maximum of ${config.maxFiles} files allowed.`,
        file,
      });
      continue;
    }

    if (config.rejectDuplicates) {
      const key = fileKey(file);
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        rejected.push({
          code: 'duplicate-file',
          message: `Duplicate file: ${file.name}.`,
          file,
        });
        continue;
      }
      seenInBatch.add(key);
    }

    const error = await validateFile(file, config);
    if (error) {
      rejected.push(error);
      continue;
    }

    if (typeof config.maxTotalSize === 'number' && totalBytes + file.size > config.maxTotalSize) {
      rejected.push({
        code: 'total-size-exceeded',
        message: `Adding this file would exceed the ${formatBytes(config.maxTotalSize)} total limit.`,
        file,
      });
      continue;
    }

    accepted.push(file);
    count += 1;
    totalBytes += file.size;
  }

  return { accepted, rejected };
}
