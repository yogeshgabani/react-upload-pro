import { type HTMLAttributes } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { UploadFile } from '../types';
import { cn } from '../utils/cn';

export interface UploadActionsProps extends HTMLAttributes<HTMLDivElement> {
  files: UploadFile[];
  /** Start uploading the files that haven't been uploaded yet. */
  onUpload: () => void;
  /** Clear the list. The button is hidden when omitted. */
  onRemoveAll?: () => void;
  disabled?: boolean;
}

/**
 * "Remove all" + "Upload (n)" buttons for `manual` mode, where nothing
 * uploads until `start()` is called. Renders nothing for an empty list.
 *
 *   const { files, start, removeAll } = useDropzone({ endpoint: '/upload' });
 *   <UploadActions files={files} onUpload={start} onRemoveAll={removeAll} />
 */
export function UploadActions({
  files,
  onUpload,
  onRemoveAll,
  disabled,
  className,
  ...rest
}: UploadActionsProps) {
  const { t } = useI18n();
  if (files.length === 0) return null;
  const idleCount = files.filter((f) => f.status === 'idle').length;
  const isUploading = files.some((f) => f.status === 'uploading');
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-2', className)} {...rest}>
      {onRemoveAll && (
        <button
          type="button"
          onClick={onRemoveAll}
          disabled={disabled}
          className="rounded-md border border-rup-border px-3 py-2 text-sm text-rup-fg hover:bg-rup-border/30 disabled:opacity-50"
        >
          {t.removeAll}
        </button>
      )}
      <button
        type="button"
        onClick={onUpload}
        disabled={disabled || idleCount === 0}
        className="rounded-md bg-rup-accent px-3 py-2 text-sm font-medium text-rup-accent-fg hover:opacity-90 disabled:opacity-50"
      >
        {isUploading && idleCount === 0 ? `${t.uploading}…` : `${t.upload} (${idleCount})`}
      </button>
    </div>
  );
}
