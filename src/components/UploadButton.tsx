import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { DropzoneOptions } from '../types';
import { useDropzone } from '../hooks/useDropzone';
import { cn } from '../utils/cn';
import { UploadIcon } from './icons';

type ButtonAttrs = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrop' | 'onPause' | 'onResume' | 'onAbort'
>;

export interface UploadButtonProps extends ButtonAttrs, DropzoneOptions {
  /** Visual variant. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Show the upload icon. */
  icon?: ReactNode;
  /** Hide the icon entirely. */
  iconOnly?: boolean;
}

const variantClasses: Record<NonNullable<UploadButtonProps['variant']>, string> = {
  primary: 'bg-rup-accent text-rup-accent-fg hover:opacity-90',
  secondary: 'bg-rup-border text-rup-fg hover:bg-rup-border/80',
  ghost: 'bg-transparent text-rup-fg hover:bg-rup-border/30',
  outline: 'border border-rup-border bg-transparent text-rup-fg hover:bg-rup-border/30',
};

/**
 * Standalone button that opens the file picker. Internally uses useDropzone
 * with `noBubble` so nesting inside another dropzone is safe.
 */
export function UploadButton({
  variant = 'primary',
  icon,
  iconOnly,
  children,
  className,
  disabled,
  // Filter DropzoneOptions out from button props.
  multiple,
  directory,
  clipboard,
  accept,
  minSize,
  maxSize,
  maxFiles,
  rejectDuplicates,
  validators,
  onDrop,
  onDropAccepted,
  onDropRejected,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  onRetry,
  onPause,
  onResume,
  onRemove,
  onAllComplete,
  endpoint,
  method,
  headers,
  fieldName,
  formData,
  withCredentials,
  concurrency,
  strategy,
  mode,
  retries,
  retryBackoffMs,
  chunkSize,
  cloud,
  getUploadToken,
  virusScan,
  ...buttonProps
}: UploadButtonProps) {
  const { t } = useI18n();
  const { getInputProps, open } = useDropzone({
    multiple,
    directory,
    clipboard: clipboard ?? false,
    accept,
    minSize,
    maxSize,
    maxFiles,
    rejectDuplicates,
    validators,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onRetry,
    onPause,
    onResume,
    onRemove,
    onAllComplete,
    endpoint,
    method,
    headers,
    fieldName,
    formData,
    withCredentials,
    concurrency,
    strategy,
    mode,
    retries,
    retryBackoffMs,
    chunkSize,
    cloud,
    getUploadToken,
    virusScan,
    disabled: !!disabled,
  });

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 rounded-rup px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rup-accent disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          className,
        )}
        {...buttonProps}
      >
        {icon !== false && (icon ?? <UploadIcon width={14} height={14} />)}
        {!iconOnly && (children ?? t.browse)}
      </button>
      <input {...getInputProps()} />
    </>
  );
}
