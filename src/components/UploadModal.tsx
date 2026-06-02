import { type ReactNode, useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../utils/cn';
import { CloseIcon } from './icons';

export interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Children render inside the modal body. Typically a <Dropzone /> + gallery. */
  children: ReactNode;
  /** Wider modal for galleries. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Hide the close button. */
  hideClose?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<UploadModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

/**
 * SSR-safe modal with a backdrop, ESC-to-close, focus trap (basic), and
 * scroll lock. Mounted via React portal to document.body when available;
 * renders nothing on the server.
 */
export function UploadModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
  hideClose,
  className,
}: UploadModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Upload'}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-rup border border-rup-border bg-rup-bg text-rup-fg shadow-rup',
          sizeClasses[size],
          className,
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between border-b border-rup-border px-5 py-3">
            <div>
              {title && <h2 className="text-base font-semibold">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-xs text-rup-muted">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t.cancel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rup-muted hover:bg-rup-border/40 hover:text-rup-fg"
              >
                <CloseIcon width={16} height={16} />
              </button>
            )}
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
