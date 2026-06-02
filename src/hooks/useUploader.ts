import { useMemo } from 'react';
import type { DropzoneOptions } from '../types';
import { useDropzone, type UseDropzoneReturn } from './useDropzone';

export type UseUploaderOptions = DropzoneOptions;
export type UseUploaderReturn = UseDropzoneReturn;

/**
 * Alias of useDropzone with an `auto` mode default. Useful when the user
 * wants files to upload immediately on selection (no separate "Upload" button).
 */
export function useUploader(options: UseUploaderOptions = {}): UseUploaderReturn {
  const opts = useMemo<DropzoneOptions>(
    () => ({ mode: 'auto', ...options }),
    [options],
  );
  return useDropzone(opts);
}
