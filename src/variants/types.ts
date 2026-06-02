import type { ProgressVariant } from '../components/UploadProgress';
import type { UseDropzoneReturn } from '../hooks/useDropzone';
import type { DropzoneOptions, FileMetadata, UploadFile } from '../types';

/**
 * Common props every variant accepts. Variants are convenience presets — they
 * wrap the same `useDropzone` hook with a styled UI, so any DropzoneOptions
 * prop works on every variant.
 */
export interface VariantProps extends DropzoneOptions {
  className?: string;
  /** Custom label override. */
  label?: React.ReactNode;
  /** Custom sublabel/hint override. */
  hint?: React.ReactNode;
  /** Override the outer container width (any CSS value: '400px', '32rem', '60%'). */
  width?: string;
  /** Override the outer container height (any CSS value). */
  height?: string;
  /** Extra inline style merged onto the outer container. */
  style?: React.CSSProperties;
  /** Pick a progress visualization (bar / striped / circle / minimal / gradient / segmented / dots). */
  progressVariant?: ProgressVariant;
  /** Progress bar height in px (linear variants) or circle diameter (circle variant). */
  progressSize?: number;
  /** Enable the built-in fullscreen preview modal. */
  previewable?: boolean;
  /** Enable the built-in edit modal (rename + tags + metadata). */
  editable?: boolean;
  /** Called when the edit modal renames a file. Overrides the default queue.rename binding. */
  onRename?: (file: UploadFile, newName: string) => void;
  /** Called when the edit modal saves metadata. Overrides the default queue.setMetadata binding. */
  onMetadataChange?: (file: UploadFile, metadata: FileMetadata) => void;
  /** Once the file list exceeds this count, the list becomes scrollable. 0 = off. */
  scrollAfter?: number;
  /** Max CSS height for the scroll region. Default '280px'. */
  maxHeight?: string;
}

/**
 * Inline style applied to a variant's outermost container — drives the *width*
 * of the whole component (drop surface + gallery + actions). Any extra `style`
 * from the consumer is merged here so it acts as an escape hatch.
 *
 * Note: `height` is intentionally NOT applied here — see surfaceStyleFromProps.
 * Putting height on the outer wrapper conflicts with the file gallery growing
 * below the drop surface; users almost always mean "the drop area is N tall".
 */
export function containerStyleFromProps(
  props: VariantProps,
): React.CSSProperties | undefined {
  const hasOverride = props.width !== undefined || props.style !== undefined;
  if (!hasOverride) return undefined;
  return {
    width: props.width,
    ...props.style,
  };
}

/**
 * Inline style applied to the *drop surface* itself — the inner element that
 * receives `getRootProps()`. Drives the dropzone's visible height so the file
 * list below it isn't squashed when the user sets a small value.
 */
export function surfaceStyleFromProps(
  props: VariantProps,
): React.CSSProperties | undefined {
  if (props.height === undefined) return undefined;
  return { height: props.height };
}

/**
 * Extract the gallery-specific subset from VariantProps. Used by every variant
 * to forward UI options to UploadGallery without leaking them into useDropzone.
 *
 * When an `api` (UseDropzoneReturn) is provided, default rename/metadata
 * handlers are wired to the underlying queue so edits actually persist —
 * callers can still override by passing their own `onRename` / `onMetadataChange`.
 */
export function pickGalleryProps(props: VariantProps, api?: UseDropzoneReturn) {
  const onRename =
    props.onRename ??
    (api ? (f: UploadFile, name: string) => api.rename(f.id, name) : undefined);
  const onMetadataChange =
    props.onMetadataChange ??
    (api ? (f: UploadFile, m: FileMetadata) => api.setMetadata(f.id, m) : undefined);
  return {
    progressVariant: props.progressVariant,
    progressSize: props.progressSize,
    previewable: props.previewable,
    editable: props.editable,
    scrollAfter: props.scrollAfter,
    maxHeight: props.maxHeight,
    onRename,
    onMetadataChange,
  };
}
