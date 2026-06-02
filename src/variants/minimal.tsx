import { useDropzone } from '../hooks/useDropzone';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../utils/cn';
import { UploadIcon, FolderIcon, ImageIcon } from '../components/icons';
import { UploadGallery } from '../components/UploadGallery';
import { containerStyleFromProps, pickGalleryProps, surfaceStyleFromProps, type VariantProps } from "./types";

/** Clean, modern card. The default look for most apps. */
export function MinimalModern({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rup-border bg-rup-bg p-8 text-center transition-all hover:border-rup-accent/60 hover:bg-rup-accent/5',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/10 scale-[1.01]',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rup-accent/10 text-rup-accent">
          <UploadIcon width={22} height={22} />
        </div>
        <p className="text-sm font-medium text-rup-fg">{label ?? t.dragOrClick}</p>
        {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          onRemove={(f) => api.remove(f.id)}
          onRetry={(f) => api.retry(f.id)}
        />
      )}
    </div>
  );
}

/** Frosted-glass aesthetic with backdrop blur. */
export function MinimalGlass({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-10 text-center backdrop-blur-xl shadow-lg transition-all hover:bg-white/20',
          api.isDragAccept && 'bg-white/25 scale-[1.01]',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rup-accent/20 via-transparent to-pink-500/20" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur">
            <UploadIcon width={26} height={26} />
          </div>
          <p className="text-base font-semibold text-white">{label ?? t.dragOrClick}</p>
          {hint && <p className="text-xs text-white/70">{hint}</p>}
        </div>
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

/** Soft, extruded shadows — the "neumorphism" look. */
export function MinimalNeumorphic({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'rounded-3xl bg-slate-100 p-10 text-center transition-all dark:bg-slate-800',
          '[box-shadow:inset_8px_8px_16px_rgb(0_0_0_/_0.08),inset_-8px_-8px_16px_rgb(255_255_255_/_0.7)]',
          'dark:[box-shadow:inset_8px_8px_16px_rgb(0_0_0_/_0.4),inset_-8px_-8px_16px_rgb(255_255_255_/_0.05)]',
          api.isDragAccept && 'ring-2 ring-rup-accent/40',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-rup-accent shadow-[8px_8px_16px_rgb(0_0_0_/_0.08),-8px_-8px_16px_rgb(255_255_255_/_0.7)] dark:bg-slate-800 dark:shadow-[8px_8px_16px_rgb(0_0_0_/_0.4),-8px_-8px_16px_rgb(255_255_255_/_0.05)]">
          <UploadIcon width={28} height={28} />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          {label ?? t.dragOrClick}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
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

/** Material 3-inspired card with elevation and ripple-ready bg. */
export function MinimalMaterial({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex items-center gap-4 rounded-2xl border border-rup-border bg-rup-bg p-5 shadow-rup transition-all hover:shadow-lg',
          api.isDragAccept && 'border-rup-accent ring-2 ring-rup-accent/30',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rup-accent/15 text-rup-accent">
          <FolderIcon width={26} height={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-base font-semibold text-rup-fg">{label ?? t.dragOrClick}</p>
          {hint && <p className="text-xs text-rup-muted">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            api.open();
          }}
          className="rounded-full bg-rup-accent px-4 py-2 text-sm font-medium text-rup-accent-fg shadow-sm hover:opacity-90"
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

/** A no-frills inline strip with the trigger inline. */
export function MinimalInline({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-2', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'flex items-center justify-between gap-3 rounded-rup border border-rup-border bg-rup-bg px-4 py-3 text-sm transition hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/10',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="flex items-center gap-2 text-rup-muted">
          <ImageIcon width={16} height={16} />
          <span>{label ?? t.dragOrClick}</span>
        </div>
        <span className="text-rup-accent">{t.browse}</span>
      </div>
      {hint && <p className="text-xs text-rup-muted">{hint}</p>}
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="compact"
          onRemove={(f) => api.remove(f.id)}
        />
      )}
    </div>
  );
}
