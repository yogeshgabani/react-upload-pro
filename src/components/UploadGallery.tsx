import { type HTMLAttributes, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { FileMetadata, UploadFile } from '../types';
import { cn } from '../utils/cn';
import { FileEditModal } from './FileEditModal';
import { FilePreviewModal } from './FilePreviewModal';
import { UploadPreview, type UploadPreviewProps } from './UploadPreview';

export type GalleryLayout = 'list' | 'grid' | 'table' | 'compact';

type DivAttrs = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onPause' | 'onResume' | 'onAbort'>;

export interface UploadGalleryProps extends DivAttrs, Omit<UploadPreviewProps, 'file'> {
  files: UploadFile[];
  layout?: GalleryLayout;
  /** Allow drag-to-reorder. Requires onReorder. */
  reorderable?: boolean;
  onReorder?: (from: number, to: number) => void;
  /** Allow free-text search by filename. */
  searchable?: boolean;
  /** Allow status filter chips. */
  filterable?: boolean;
  /**
   * Enable the built-in fullscreen preview modal (images / video / pdf / text).
   * Adds an eye icon to each row. Has no effect if a custom `onPreview` is passed.
   */
  previewable?: boolean;
  /**
   * Enable the built-in edit modal (rename + metadata). Adds a pencil icon.
   * Has no effect if a custom `onEdit` is passed.
   *
   * If `onRename` / `onMetadataChange` are provided, they're called on save.
   */
  editable?: boolean;
  /** Called when the edit modal renames a file. */
  onRename?: (file: UploadFile, newName: string) => void;
  /** Called when the edit modal saves metadata. */
  onMetadataChange?: (file: UploadFile, metadata: FileMetadata) => void;
  /**
   * When the visible file count exceeds this threshold, the file list becomes
   * a scrollable region with the height set by `maxHeight` (default ~3 rows).
   * Set to 0 to disable. Recommended for long lists so the page doesn't grow
   * unbounded.
   */
  scrollAfter?: number;
  /**
   * Max CSS height for the scrollable list region. Used together with
   * `scrollAfter`. Accepts any valid CSS value ('280px', '24rem', '40vh').
   * Default: '280px' (≈ 3 comfortable rows).
   */
  maxHeight?: string;
  emptyState?: React.ReactNode;
}

/**
 * Renders a list of files using one of several layouts. Search/filter/sort
 * are built-in. Drag-to-reorder is opt-in. When `previewable` or `editable`
 * is set, the gallery also manages the corresponding modals — pass through
 * `onRename` / `onMetadataChange` to persist the changes.
 */
export function UploadGallery({
  files,
  layout = 'list',
  reorderable = false,
  onReorder,
  searchable = false,
  filterable = false,
  previewable = false,
  editable = false,
  onRename,
  onMetadataChange,
  scrollAfter,
  maxHeight = '280px',
  emptyState,
  className,
  density,
  showStats,
  showThumb,
  progressVariant,
  progressSize,
  onRetry,
  onPause,
  onResume,
  onCancel,
  onRemove,
  onPreview,
  onDownload,
  onEdit,
  ...rest
}: UploadGalleryProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'uploading' | 'success' | 'error'>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Built-in modal state (only used when previewable/editable is true and no
  // custom handler was passed).
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [editFile, setEditFile] = useState<UploadFile | null>(null);

  const resolvedOnPreview =
    onPreview ?? (previewable ? (f: UploadFile) => setPreviewFile(f) : undefined);
  const resolvedOnEdit =
    onEdit ?? (editable ? (f: UploadFile) => setEditFile(f) : undefined);

  const visible = files.filter((f) => {
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'uploading' && f.status !== 'uploading' && f.status !== 'queued') return false;
    if (filter === 'success' && f.status !== 'success') return false;
    if (filter === 'error' && f.status !== 'error' && f.status !== 'cancelled') return false;
    return true;
  });

  // Kick the list into a bounded scroll region once we cross the threshold.
  // Threshold of 0 or undefined disables the behavior entirely.
  const shouldScroll =
    typeof scrollAfter === 'number' && scrollAfter > 0 && visible.length > scrollAfter;

  const wrapDrag = (index: number) =>
    reorderable && onReorder
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            setDragIndex(index);
          },
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            if (dragIndex === null || dragIndex === index) return;
            onReorder(dragIndex, index);
            setDragIndex(null);
          },
          onDragEnd: () => setDragIndex(null),
        }
      : {};

  if (files.length === 0 && emptyState) {
    return <div className={cn('text-sm text-rup-muted', className)}>{emptyState}</div>;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {(searchable || filterable) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-9 flex-1 min-w-[180px] rounded-rup border border-rup-border bg-rup-bg px-3 text-sm text-rup-fg placeholder:text-rup-muted focus:outline-none focus:ring-2 focus:ring-rup-accent"
            />
          )}
          {filterable && (
            <div className="flex items-center gap-1">
              {(['all', 'uploading', 'success', 'error'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium capitalize transition',
                    filter === key
                      ? 'bg-rup-accent text-rup-accent-fg'
                      : 'bg-rup-border/30 text-rup-muted hover:bg-rup-border/60',
                  )}
                >
                  {key === 'all'
                    ? 'All'
                    : key === 'uploading'
                      ? t.uploading
                      : key === 'success'
                        ? t.success
                        : t.error}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <ScrollWrapper active={shouldScroll} maxHeight={maxHeight}>
      <div
        className={cn(
          layout === 'list' && 'flex flex-col gap-2',
          layout === 'compact' && 'flex flex-col gap-1',
          layout === 'grid' && 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
          layout === 'table' && 'overflow-hidden rounded-rup border border-rup-border',
        )}
      >
        {visible.map((f, i) => (
          <div key={f.id} {...wrapDrag(i)}>
            <UploadPreview
              file={f}
              density={
                density ?? (layout === 'grid' ? 'card' : layout === 'compact' ? 'compact' : 'comfortable')
              }
              showStats={showStats}
              showThumb={showThumb}
              progressVariant={progressVariant}
              progressSize={progressSize}
              onRetry={onRetry}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onRemove={onRemove}
              onPreview={resolvedOnPreview}
              onDownload={onDownload}
              onEdit={resolvedOnEdit}
              className={cn(layout === 'table' && 'rounded-none border-x-0 border-t-0 last:border-b-0')}
            />
          </div>
        ))}
      </div>
      </ScrollWrapper>

      {/* Built-in modals — only mount when actually opened, and only if the
          caller didn't pass a custom handler (which would suppress the
          internal state altogether). */}
      {previewable && !onPreview && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {editable && !onEdit && (
        <FileEditModal
          file={editFile}
          onClose={() => setEditFile(null)}
          onRename={onRename}
          onSave={onMetadataChange}
        />
      )}
    </div>
  );
}

/**
 * Conditionally wraps children in a bounded, vertically-scrollable region.
 * Used by UploadGallery to cap the list height once `scrollAfter` is crossed.
 * Renders as a pass-through fragment when inactive so layouts stay unchanged.
 */
function ScrollWrapper({
  active,
  maxHeight,
  children,
}: {
  active: boolean;
  maxHeight: string;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <div
      className="rup-scrollbar overflow-y-auto pr-1"
      style={{ maxHeight, scrollbarGutter: 'stable' }}
    >
      {children}
    </div>
  );
}
