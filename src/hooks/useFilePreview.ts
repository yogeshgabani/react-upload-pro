import { useEffect, useState } from 'react';
import type { UploadFile } from '../types';
import { getFileCategory } from '../utils';

export type PreviewKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'text'
  | 'office'
  | 'archive'
  | 'other';

export interface FilePreview {
  kind: PreviewKind;
  url?: string;
  /** For text files: first ~64KB as a string. */
  text?: string;
  /** Loading state. */
  loading: boolean;
  /** Any error encountered while building the preview. */
  error?: string;
}

const TEXT_PREVIEW_MAX_BYTES = 64 * 1024;

/**
 * Lazy preview builder. For images/video/audio/pdf it returns the existing
 * object URL; for text files it reads up to 64KB; office files return kind
 * only (consumers can render a generic icon or call a server-side renderer).
 */
export function useFilePreview(file: UploadFile | null | undefined): FilePreview {
  const [state, setState] = useState<FilePreview>({
    kind: file ? getFileCategory(file) : 'other',
    loading: !!file,
  });

  useEffect(() => {
    if (!file) {
      setState({ kind: 'other', loading: false });
      return;
    }
    const kind = getFileCategory(file);
    if (kind === 'text') {
      let cancelled = false;
      setState({ kind, loading: true });
      const slice = file.file.slice(0, TEXT_PREVIEW_MAX_BYTES);
      slice
        .text()
        .then((text) => {
          if (!cancelled) setState({ kind, text, loading: false });
        })
        .catch((err) => {
          if (!cancelled) {
            setState({
              kind,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to read file',
            });
          }
        });
      return () => {
        cancelled = true;
      };
    }
    setState({ kind, url: file.previewUrl, loading: false });
    return;
  }, [file]);

  return state;
}
