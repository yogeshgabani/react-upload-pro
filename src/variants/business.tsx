import { useDropzone } from '../hooks/useDropzone';
import { useI18n } from '../i18n/I18nProvider';
import { useUploadProgress } from '../hooks/useUploadProgress';
import { cn } from '../utils/cn';
import { formatBytes, formatEta, formatSpeed } from '../utils/format';
import { UploadIcon, FileIcon, CheckIcon } from '../components/icons';
import { UploadProgress } from '../components/UploadProgress';
import { UploadGallery } from '../components/UploadGallery';
import { containerStyleFromProps, pickGalleryProps, surfaceStyleFromProps, type VariantProps } from "./types";

/** CRM-style: rich left rail, action buttons, summary stats. */
export function BusinessCRM({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  const aggregate = useUploadProgress(api.files);
  return (
    <div className={cn('grid gap-4 rounded-rup border border-rup-border bg-rup-bg p-4 md:grid-cols-[1fr_280px]', className)} style={containerStyleFromProps(opts)}>
      <div className="flex flex-col gap-3">
        <div
          {...api.getRootProps()}
          style={surfaceStyleFromProps(opts)}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-rup border-2 border-dashed border-rup-border bg-rup-border/10 p-8 text-center transition-all hover:border-rup-accent',
            api.isDragAccept && 'border-rup-accent bg-rup-accent/10',
          )}
        >
          <input {...api.getInputProps()} />
          <UploadIcon width={28} height={28} className="text-rup-accent" />
          <p className="font-semibold text-rup-fg">{label ?? t.dragOrClick}</p>
          {hint && <p className="text-xs text-rup-muted">{hint}</p>}
        </div>
        {api.files.length > 0 && (
          <UploadGallery
            {...pickGalleryProps(opts, api)}
            files={api.files}
            searchable
            filterable
            onRemove={(f) => api.remove(f.id)}
            onRetry={(f) => api.retry(f.id)}
            onPause={(f) => api.pause(f.id)}
            onResume={(f) => api.resume(f.id)}
          />
        )}
      </div>
      <aside className="rounded-rup border border-rup-border bg-rup-bg p-4 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-rup-muted">
          Upload summary
        </h3>
        <dl className="mt-3 space-y-2">
          <Stat label={t.filesText} value={`${api.files.length}`} />
          <Stat
            label="Uploaded"
            value={`${formatBytes(aggregate.uploaded)} ${t.ofText} ${formatBytes(aggregate.total)}`}
          />
          <Stat label={t.speed} value={formatSpeed(aggregate.speed)} />
          <Stat label={t.eta} value={formatEta(aggregate.eta)} />
        </dl>
        <UploadProgress value={aggregate.progress} showLabel className="mt-4" />
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void api.start()}
            disabled={aggregate.pending === 0}
            className="rounded-md bg-rup-accent px-3 py-2 text-sm font-medium text-rup-accent-fg disabled:opacity-50"
          >
            Start upload
          </button>
          <button
            type="button"
            onClick={api.removeAll}
            disabled={api.files.length === 0}
            className="rounded-md border border-rup-border px-3 py-2 text-sm hover:bg-rup-border/30 disabled:opacity-50"
          >
            {t.removeAll}
          </button>
        </div>
      </aside>
    </div>
  );
}

/** Dashboard-style: compact header, list-heavy body. */
export function BusinessDashboard({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  const aggregate = useUploadProgress(api.files);
  return (
    <div
      className={cn(
        'overflow-hidden rounded-rup border border-rup-border bg-rup-bg',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <header className="flex items-center justify-between gap-4 border-b border-rup-border p-4">
        <div>
          <h3 className="text-sm font-semibold text-rup-fg">{label ?? 'Asset uploads'}</h3>
          {hint && <p className="text-xs text-rup-muted">{hint}</p>}
        </div>
        <div className="flex items-center gap-3 text-xs text-rup-muted">
          <span>
            {aggregate.completed}/{api.files.length} {t.success.toLowerCase()}
          </span>
          <UploadProgress value={aggregate.progress} size={48} variant="circle" showLabel />
        </div>
      </header>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex min-h-[120px] cursor-pointer items-center justify-center gap-3 bg-rup-border/10 p-6 text-sm text-rup-muted transition hover:bg-rup-border/20',
          api.isDragAccept && 'bg-rup-accent/10 text-rup-fg',
        )}
      >
        <input {...api.getInputProps()} />
        <UploadIcon width={18} height={18} />
        <span>{t.dragOrClick}</span>
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="table"
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
          onPause={(f) => api.pause(f.id)}
          onResume={(f) => api.resume(f.id)}
        />
      )}
    </div>
  );
}

/** SaaS-style hero with brand gradient and bold CTA. */
export function BusinessSaaS({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <div className="rounded-2xl bg-rup-bg p-6">
        <div
          {...api.getRootProps()}
          style={surfaceStyleFromProps(opts)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-rup-border p-10 text-center transition-all hover:border-indigo-500',
            api.isDragAccept && 'border-indigo-500 bg-indigo-500/5',
          )}
        >
          <input {...api.getInputProps()} />
          <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3 text-white shadow-lg">
            <UploadIcon width={26} height={26} />
          </div>
          <h3 className="text-lg font-bold text-rup-fg">{label ?? 'Upload your assets'}</h3>
          <p className="max-w-sm text-sm text-rup-muted">{hint ?? t.dragOrClick}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              api.open();
            }}
            className="mt-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:opacity-95"
          >
            {t.browse}
          </button>
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
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-rup-muted">{label}</dt>
      <dd className="text-xs font-medium tabular-nums text-rup-fg">{value}</dd>
    </div>
  );
}

export { CheckIcon, FileIcon };
