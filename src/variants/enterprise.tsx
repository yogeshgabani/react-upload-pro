import { useDropzone } from '../hooks/useDropzone';
import { useI18n } from '../i18n/I18nProvider';
import { useUploadProgress } from '../hooks/useUploadProgress';
import { cn } from '../utils/cn';
import { formatBytes, formatEta } from '../utils/format';
import { FolderIcon, UploadIcon } from '../components/icons';
import { UploadProgress } from '../components/UploadProgress';
import { UploadGallery } from '../components/UploadGallery';
import { containerStyleFromProps, pickGalleryProps, surfaceStyleFromProps, type VariantProps } from "./types";

/** Document management — formal, dense, table-driven. */
export function EnterpriseDocs({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone({ multiple: true, ...opts });
  return (
    <div
      className={cn(
        'overflow-hidden rounded-rup border border-rup-border bg-rup-bg shadow-rup',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <header className="border-b border-rup-border bg-rup-border/10 px-5 py-3">
        <h3 className="text-sm font-semibold text-rup-fg">{label ?? 'Document upload'}</h3>
        {hint && <p className="mt-0.5 text-xs text-rup-muted">{hint}</p>}
      </header>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex items-center gap-3 border-b border-rup-border bg-rup-border/5 px-5 py-4 text-sm transition hover:bg-rup-border/15',
          api.isDragAccept && 'bg-rup-accent/10',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={18} height={18} className="text-rup-accent" />
        <span className="flex-1 text-rup-fg">{t.dragOrClick}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            api.open();
          }}
          className="rounded-md border border-rup-border bg-rup-bg px-3 py-1.5 text-xs hover:bg-rup-border/30"
        >
          {t.browse}
        </button>
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="table"
          searchable
          filterable
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
          onPause={(f) => api.pause(f.id)}
          onResume={(f) => api.resume(f.id)}
        />
      )}
    </div>
  );
}

/** Team upload — shows uploader avatar/initial + tag chips. */
export function EnterpriseTeam({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  const aggregate = useUploadProgress(api.files);
  return (
    <div
      className={cn(
        'rounded-rup border border-rup-border bg-rup-bg p-5 shadow-rup',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-rup-fg">{label ?? 'Team upload'}</h3>
          {hint && <p className="text-xs text-rup-muted">{hint}</p>}
        </div>
        {aggregate.uploading > 0 && (
          <UploadProgress value={aggregate.progress} size={36} variant="circle" />
        )}
      </div>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'mt-4 flex items-center justify-between gap-3 rounded-rup border-2 border-dashed border-rup-border px-4 py-6 transition hover:border-rup-accent/60',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="flex items-center gap-3 text-sm text-rup-muted">
          <FolderIcon width={20} height={20} />
          <span>{t.dragOrClick}</span>
        </div>
        <span className="text-xs font-medium text-rup-accent">{t.browse}</span>
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          className="mt-4"
          files={api.files}
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
        />
      )}
      {aggregate.uploading > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-rup-muted">
          <span>
            {aggregate.uploading} {t.uploading.toLowerCase()} ·{' '}
            {formatBytes(aggregate.uploaded)} {t.ofText} {formatBytes(aggregate.total)}
          </span>
          <span>{formatEta(aggregate.eta)}</span>
        </div>
      )}
    </div>
  );
}

/** Media library — grid of thumbnails with hover overlay actions. */
export function EnterpriseMediaLibrary({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone({ accept: 'image/*,video/*', ...opts });
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-rup border-2 border-dashed border-rup-border bg-rup-bg p-8 text-center transition hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={22} height={22} className="text-rup-accent" />
        <p className="font-medium text-rup-fg">{label ?? 'Add media'}</p>
        {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="grid"
          reorderable
          onReorder={api.reorder}
          searchable
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
        />
      )}
    </div>
  );
}

/** Fullscreen modal-style drop overlay (controlled by visibility prop). */
export function EnterpriseFullscreen({
  className,
  label,
  hint,
  ...opts
}: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-rup-border bg-rup-bg p-10 text-center transition',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rup-accent/15 text-rup-accent">
          <UploadIcon width={36} height={36} />
        </div>
        <h2 className="text-2xl font-bold text-rup-fg">{label ?? t.dropHere}</h2>
        {hint && <p className="max-w-md text-sm text-rup-muted">{hint}</p>}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            api.open();
          }}
          className="rounded-full bg-rup-accent px-6 py-3 text-sm font-semibold text-rup-accent-fg hover:opacity-90"
        >
          {t.browse}
        </button>
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
