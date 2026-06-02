import { useI18n } from '../i18n/I18nProvider';
import type { ValidationError, ValidationErrorCode } from '../types';
import { cn } from '../utils/cn';
import { AlertIcon } from './icons';
import { UploadModal } from './UploadModal';

export interface ValidationErrorsModalProps {
  open: boolean;
  errors: ValidationError[];
  onClose: () => void;
  /** Modal title override. Default uses the localized "Failed" string. */
  title?: React.ReactNode;
}

/**
 * Shows validation rejections (wrong type, too large, too many, …) in a modal.
 * Use together with the `onDropRejected` callback or by reading
 * `api.rejected` from `useDropzone`.
 *
 *   const [errors, setErrors] = useState<ValidationError[]>([]);
 *   <Dropzone accept="image/*" onDropRejected={setErrors} />
 *   <ValidationErrorsModal open={errors.length > 0} errors={errors} onClose={() => setErrors([])} />
 */
export function ValidationErrorsModal({
  open,
  errors,
  onClose,
  title,
}: ValidationErrorsModalProps) {
  const { t } = useI18n();
  if (!open || errors.length === 0) return null;

  return (
    <UploadModal
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2 text-rup-error">
          <AlertIcon width={18} height={18} />
          {title ?? t.error}
        </span>
      }
      size="md"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-rup-muted">
          {errors.length} {errors.length === 1 ? 'file was' : 'files were'} rejected:
        </p>
        <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto rup-scrollbar">
          {errors.map((err, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-rup border border-rup-error/30 bg-rup-error/5 px-3 py-2 text-sm"
            >
              <AlertIcon
                width={14}
                height={14}
                className="mt-0.5 shrink-0 text-rup-error"
              />
              <div className="min-w-0 flex-1">
                {err.file && (
                  <p
                    className="truncate font-medium text-rup-fg"
                    title={err.file.name}
                  >
                    {err.file.name}
                  </p>
                )}
                <p className="text-xs text-rup-error">{err.message}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                  badgeClassesByCode[err.code] ?? 'bg-rup-error/15 text-rup-error',
                )}
              >
                {err.code}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-rup-accent px-4 py-2 text-sm font-medium text-rup-accent-fg hover:opacity-90"
          >
            OK
          </button>
        </div>
      </div>
    </UploadModal>
  );
}

const badgeClassesByCode: Partial<Record<ValidationErrorCode, string>> = {
  'file-too-large': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'file-too-small': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'file-invalid-type': 'bg-rup-error/15 text-rup-error',
  'too-many-files': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'duplicate-file': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
};
