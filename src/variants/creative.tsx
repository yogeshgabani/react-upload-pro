import { useDropzone } from '../hooks/useDropzone';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../utils/cn';
import { UploadIcon, ImageIcon } from '../components/icons';
import { UploadGallery } from '../components/UploadGallery';
import { containerStyleFromProps, pickGalleryProps, surfaceStyleFromProps, type VariantProps } from "./types";

/** Bold gradient surface — designed to stand out. */
export function CreativeGradient({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        className={cn(
          'group relative overflow-hidden rounded-3xl p-1 transition-transform',
          'bg-[conic-gradient(from_var(--rup-angle,0deg),#6366f1,#ec4899,#f59e0b,#6366f1)]',
          api.isDragAccept && 'animate-[rup-pulse_1.5s_ease-in-out_infinite]',
        )}
        style={{
          ['--rup-angle' as string]: api.isDragAccept ? '180deg' : '0deg',
          ...surfaceStyleFromProps(opts),
        }}
      >
        <div
          className={cn(
            'rounded-[calc(theme(borderRadius.3xl)-4px)] bg-rup-bg p-10 text-center transition-colors',
            api.isDragAccept && 'bg-rup-bg/95',
          )}
        >
          <input {...api.getInputProps()} />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-pink-500 to-amber-500 text-white shadow-lg">
            <UploadIcon width={26} height={26} />
          </div>
          <p className="mt-4 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 bg-clip-text text-lg font-bold text-transparent">
            {label ?? t.dragOrClick}
          </p>
          {hint && <p className="mt-1 text-xs text-rup-muted">{hint}</p>}
        </div>
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="grid"
          onRemove={(f) => api.remove(f.id)}
        />
      )}
    </div>
  );
}

/** Animated gradient border + scale on drag accept. */
export function CreativeAnimated({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div className={cn('flex flex-col gap-3', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed border-rup-border bg-rup-bg p-10 text-center transition-all duration-300',
          'hover:border-rup-accent hover:shadow-xl hover:scale-[1.02]',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/5 scale-[1.04] shadow-2xl',
        )}
      >
        <input {...api.getInputProps()} />
        <div
          className={cn(
            'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-rup-accent/15 text-rup-accent transition-all duration-300',
            api.isDragAccept && 'scale-125 rotate-12',
          )}
        >
          <UploadIcon width={30} height={30} />
        </div>
        <p className="text-base font-semibold text-rup-fg">{label ?? t.dragOrClick}</p>
        {hint && <p className="mt-1 text-xs text-rup-muted">{hint}</p>}
      </div>
      {api.files.length > 0 && (
        <UploadGallery
          {...pickGalleryProps(opts, api)}
          files={api.files}
          layout="grid"
          onRemove={(f) => api.remove(f.id)}
        />
      )}
    </div>
  );
}

/** Premium card — looks at home on landing pages. */
export function CreativePremium({ className, label, hint, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone(opts);
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-rup-border bg-gradient-to-b from-rup-bg to-rup-border/20 shadow-rup',
        className,
      )}
      style={containerStyleFromProps(opts)}
    >
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 p-12 text-center transition-all',
          api.isDragAccept && 'bg-rup-accent/5',
        )}
      >
        <input {...api.getInputProps()} />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rup-accent to-purple-500 text-white shadow-2xl">
          <ImageIcon width={36} height={36} />
        </div>
        <h3 className="text-xl font-bold text-rup-fg">{label ?? 'Drop something beautiful'}</h3>
        <p className="max-w-md text-sm text-rup-muted">{hint ?? t.dragOrClick}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            api.open();
          }}
          className="mt-2 rounded-full border border-rup-border bg-rup-bg px-5 py-2 text-sm font-medium text-rup-fg shadow-sm hover:bg-rup-border/30"
        >
          {t.browse}
        </button>
      </div>
      {api.files.length > 0 && (
        <div className="border-t border-rup-border p-4">
          <UploadGallery
            {...pickGalleryProps(opts, api)}
            files={api.files}
            layout="grid"
            onRemove={(f) => api.remove(f.id)}
          />
        </div>
      )}
    </div>
  );
}

/** Avatar/profile picker — a compact circular drop target. */
export function CreativeAvatar({ className, label, ...opts }: VariantProps) {
  const { t } = useI18n();
  const api = useDropzone({ multiple: false, accept: 'image/*', ...opts });
  const preview = api.files[0]?.previewUrl;
  return (
    <div className={cn('flex flex-col items-center gap-2', className)} style={containerStyleFromProps(opts)}>
      <div
        {...api.getRootProps()}
        style={surfaceStyleFromProps(opts)}
        className={cn(
          'group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-rup-border bg-rup-border/10 transition-all hover:border-rup-accent',
          api.isDragAccept && 'border-rup-accent bg-rup-accent/10',
        )}
      >
        <input {...api.getInputProps()} />
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon width={32} height={32} className="text-rup-muted" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          {label ?? t.browse}
        </span>
      </div>
    </div>
  );
}
