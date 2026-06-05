import { type ReactNode } from 'react';
import { useDropzone, type UseDropzoneReturn } from '../hooks/useDropzone';
import type { DropzoneOptions, FileMetadata, UploadFile } from '../types';
import { cn } from '../utils/cn';
import { normalizeColorInput } from '../variants/types';
import { UploadArea } from './UploadArea';
import { UploadGallery, type GalleryLayout } from './UploadGallery';
import type { ProgressVariant } from './UploadProgress';

export interface DropzoneProps extends DropzoneOptions {
  /** Render-prop API for full control. */
  children?: (api: UseDropzoneReturn) => ReactNode;
  /** Hide the built-in file list. Default false. */
  hideGallery?: boolean;
  /** Layout of the built-in gallery. Default 'list'. */
  galleryLayout?: GalleryLayout;
  /** Pick a progress visualization. */
  progressVariant?: ProgressVariant;
  /** Progress bar height (px) or circle diameter (px). */
  progressSize?: number;
  /** Enable the built-in fullscreen preview modal. */
  previewable?: boolean;
  /** Enable the built-in edit modal (rename + tags + metadata). */
  editable?: boolean;
  /** Called when the edit modal renames a file. Defaults to queue.rename. */
  onRename?: (file: UploadFile, newName: string) => void;
  /** Called when the edit modal saves metadata. Defaults to queue.setMetadata. */
  onMetadataChange?: (file: UploadFile, metadata: FileMetadata) => void;
  /** Once the file list exceeds this count, the list becomes scrollable. 0 = off. */
  scrollAfter?: number;
  /** Max CSS height for the scroll region. Default '280px'. */
  maxHeight?: string;
  /** Outer container width (any CSS value). */
  width?: string;
  /** Outer container height (any CSS value). */
  height?: string;
  /** Extra inline style merged onto the outer container. */
  style?: React.CSSProperties;
  className?: string;
  /** Hint text under the icon. */
  hint?: ReactNode;
  /**
   * Override the accent color used by the dropzone. Drives borders, focus
   * rings, progress fill, primary buttons, and hover states. Accepts a hex
   * string (`'#10b981'`), RGB triplet (`'16 185 129'`), or any CSS color.
   * Applied as an inline `--rup-accent` variable so it stays scoped to this
   * dropzone instance.
   */
  accent?: string;
  /** Foreground color used on top of `accent`. Same format as `accent`. */
  accentFg?: string;
}

/**
 * The all-in-one drop-in component. For simple cases this is all you need.
 * For more control, pass `children` as a render-prop.
 *
 *   <Dropzone endpoint="/upload" maxSize={5e6} previewable editable>
 *     {({ getRootProps, getInputProps }) => (
 *       <div {...getRootProps()}>...</div>
 *     )}
 *   </Dropzone>
 */
export function Dropzone({
  children,
  hideGallery,
  galleryLayout = 'list',
  progressVariant,
  progressSize,
  previewable,
  editable,
  onRename,
  onMetadataChange,
  scrollAfter,
  maxHeight,
  width,
  height,
  style,
  className,
  hint,
  accent,
  accentFg,
  ...options
}: DropzoneProps) {
  const api = useDropzone(options);

  if (children) {
    return <>{children(api)}</>;
  }

  // Default rename/metadata handlers map to the queue's built-in methods so
  // the file list updates in place after editing.
  const handleRename = onRename ?? ((f, newName) => api.rename(f.id, newName));
  const handleMetadata = onMetadataChange ?? ((f, m) => api.setMetadata(f.id, m));

  // width applies to the OUTER wrapper (drives the whole component's width);
  // height applies to the DROP SURFACE so the file gallery below stays at its
  // natural height (otherwise a small height value squashes the list). The
  // accent CSS variable is also set on the wrapper so it cascades to every
  // child without leaking to siblings or the rest of the page.
  const hasContainerOverride =
    width !== undefined || style !== undefined || accent !== undefined;
  let containerStyle: React.CSSProperties | undefined;
  if (hasContainerOverride) {
    const merged: Record<string, unknown> = { width, ...style };
    if (accent !== undefined) {
      merged['--rup-accent'] = normalizeColorInput(accent);
      if (accentFg !== undefined) {
        merged['--rup-accent-fg'] = normalizeColorInput(accentFg);
      }
    }
    containerStyle = merged as React.CSSProperties;
  }
  const surfaceStyle = height !== undefined ? { height } : undefined;

  return (
    <div className={cn('flex flex-col gap-4', className)} style={containerStyle}>
      <UploadArea
        state={api.state}
        disabled={options.disabled}
        description={hint}
        style={surfaceStyle}
        {...api.getRootProps()}
      />
      <input {...api.getInputProps()} />
      {!hideGallery && api.files.length > 0 && (
        <UploadGallery
          files={api.files}
          layout={galleryLayout}
          progressVariant={progressVariant}
          progressSize={progressSize}
          previewable={previewable}
          editable={editable}
          scrollAfter={scrollAfter}
          maxHeight={maxHeight}
          onRename={handleRename}
          onMetadataChange={handleMetadata}
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
          onPause={(f) => api.pause(f.id)}
          onResume={(f) => api.resume(f.id)}
          onCancel={(f) => api.cancel(f.id)}
        />
      )}
    </div>
  );
}
