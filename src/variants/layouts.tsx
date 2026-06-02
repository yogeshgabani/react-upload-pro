import { useDropzone } from '../hooks/useDropzone';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../utils/cn';
import { UploadIcon } from '../components/icons';
import { UploadGallery } from '../components/UploadGallery';
import { UploadModal } from '../components/UploadModal';
import { containerStyleFromProps, pickGalleryProps, surfaceStyleFromProps, type VariantProps } from "./types";
import { useState } from 'react';

/** Box layout — squarish drop target with bold border. */
export function LayoutBox({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rup-border bg-rup-bg p-6 text-center transition hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={28} height={28} className="text-rup-accent" />
        <p className="text-sm font-medium text-rup-fg">{label ?? t.dragOrClick}</p>
        {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          onRemove={(f) => api.remove(f.id)}
        />
      )}
    </div>
  );
}

/** Card layout — heavier shadow, more padding. */
export function LayoutCard({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div
      className={cn(
        'rounded-2xl border border-rup-border bg-rup-bg p-6 shadow-rup',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rup-border p-10 text-center transition hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={28} height={28} className="text-rup-accent" />
        <p className="text-base font-semibold text-rup-fg">{label ?? t.dragOrClick}</p>
        {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          className="mt-4"
          files={api.files}
          onRemove={(f) => api.remove(f.id)}
        />
      )}
    </div>
  );
}

/** Sidebar layout — vertical strip on the side. */
export function LayoutSidebar({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('grid gap-3 md:grid-cols-[240px_1fr]', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-rup border-2 border-dashed border-rup-border bg-rup-bg p-4 text-center transition hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={22} height={22} className="text-rup-accent" />
        <p className="text-sm font-medium text-rup-fg">{label ?? t.dragOrClick}</p>
        {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      </div>
      <UploadGallery
        {...pickGalleryProps(opts, api)}
        files={api.files}
        emptyState={<p className="text-sm text-rup-muted">No files yet.</p>}
        onRemove={(f) => api.remove(f.id)}
        onRetry={(f) => api.retry(f.id)}
      />
    </div>
  );
}

/** Modal layout — trigger button opens a dedicated upload dialog. */
export function LayoutModal({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const api = useDropzone(opts);
  return (
    <div className={className} style={containerStyleFromProps(opts)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-rup bg-rup-accent px-4 py-2 text-sm font-medium text-rup-accent-fg hover:opacity-90"
      >
        <UploadIcon width={14} height={14} />
        {label ?? t.browse}
      </button>
      <UploadModal open={open} onClose={() => setOpen(false)} title={t.browse}>
        <div
          {...api.getRootProps()}
          style={surfaceStyleFromProps(opts)}
          className={cn(
            'flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-rup border-2 border-dashed border-rup-border bg-rup-bg p-8 text-center transition hover:border-rup-accent',
            api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
          )}
        >
          <input {...api.getInputProps()} />
          <UploadIcon width={24} height={24} className="text-rup-accent" />
          <p className="text-sm font-medium text-rup-fg">{t.dragOrClick}</p>
          {hint && <p className="text-xs text-rup-muted">{hint}</p>}
        </div>
        {api.files.length > 0 && (
          <UploadGallery
            {...pickGalleryProps(opts, api)}
            className="mt-4"
            files={api.files}
            onRemove={(f) => api.remove(f.id)}
          />
        )}
      </UploadModal>
    </div>
  );
}

/** Floating layout — fixed bottom-right card that expands. */
export function LayoutFloating({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const api = useDropzone(opts);
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-rup border border-rup-border bg-rup-bg shadow-rup transition-all',
        expanded ? 'h-auto' : 'h-12',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 border-b border-rup-border px-4 py-3 text-sm font-medium text-rup-fg hover:bg-rup-border/30"
      >
        <span className="flex items-center gap-2">
          <UploadIcon width={14} height={14} />
          {label ?? t.browse}
        </span>
        <span className="text-rup-muted">{expanded ? '▾' : '▴'}</span>
      </button>
      {expanded && (
        <div className="p-3">
          <div
            {...api.getRootProps()}
            style={surfaceStyleFromProps(opts)}
            className={cn(
              'flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-rup border-2 border-dashed border-rup-border text-center text-xs text-rup-muted transition hover:border-rup-accent',
              api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
            )}
          >
            <input {...api.getInputProps()} />
            <UploadIcon width={16} height={16} />
            <span>{hint ?? t.dragOrClick}</span>
          </div>
          {api.files.length > 0 && (
            <UploadGallery
              {...pickGalleryProps(opts, api)}
              className="mt-2 max-h-48 overflow-y-auto"
              files={api.files}
              layout="compact"
              onRemove={(f) => api.remove(f.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
