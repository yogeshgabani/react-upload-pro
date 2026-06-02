import type { Accept, ValidationConfig, ValidationError } from '../types';
import { formatBytes, fileKey } from '../utils';

/**
 * Normalize the `accept` config into a flat list of MIME/extension matchers.
 */
function normalizeAccept(accept: Accept | undefined): string[] {
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
  if (config.validators?.length) {
    for (const validator of config.validators) {
      const result = await validator(file);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Validate a batch of files. Applies built-in rules first, then maxFiles,
 * then duplicate detection, then async validators. Returns accepted + rejected.
 */
export async function validateBatch(
  files: File[],
  config: ValidationConfig,
  existingCount = 0,
  existingKeys: Set<string> = new Set(),
): Promise<{ accepted: File[]; rejected: ValidationError[] }> {
  const accepted: File[] = [];
  const rejected: ValidationError[] = [];
  const seenInBatch = new Set<string>();
  let count = existingCount;

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
    } else {
      accepted.push(file);
      count += 1;
    }
  }

  return { accepted, rejected };
}
