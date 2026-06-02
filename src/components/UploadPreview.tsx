import { type HTMLAttributes, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { UploadFile } from '../types';
import { formatBytes, formatSpeed, formatEta, getFileCategory } from '../utils';
import { cn } from '../utils/cn';
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  ImageIcon,
  PauseIcon,
  PlayIcon,
  RetryIcon,
  TrashIcon,
  EditIcon,
} from './icons';
import { UploadProgress, type ProgressVariant } from './UploadProgress';

type DivAttrs = Omit<HTMLAttributes<HTMLDivElement>, 'onPause' | 'onResume' | 'onAbort'>;

export interface UploadPreviewProps extends DivAttrs {
  file: UploadFile;
  /** Layout density. */
  density?: 'compact' | 'comfortable' | 'card';
  /** Show speed + ETA while uploading. */
  showStats?: boolean;
  /** Show thumbnail for images/video. */
  showThumb?: boolean;
  /** Override the progress visual style. */
  progressVariant?: ProgressVariant;
  /** Override progress bar height (px) or circle diameter (px). */
  progressSize?: number;
  onRetry?: (file: UploadFile) => void;
  onPause?: (file: UploadFile) => void;
  onResume?: (file: UploadFile) => void;
  onCancel?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void;
  onPreview?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  onEdit?: (file: UploadFile) => void;
}

/**
 * A single row/card representing one file. Used as the building block of
 * UploadGallery and most variants.
 */
export function UploadPreview({
  file,
  density = 'comfortable',
  showStats = true,
  showThumb = true,
  progressVariant,
  progressSize,
  className,
  onRetry,
  onPause,
  onResume,
  onCancel,
  onRemove,
  onPreview,
  onDownload,
  onEdit,
  ...rest
}: UploadPreviewProps) {
  const { t } = useI18n();
  const category = useMemo(() => getFileCategory(file), [file]);
  const [thumbError, setThumbError] = useState(false);

  const isImage = category === 'image' && file.previewUrl && showThumb && !thumbError;
  const isVideo = category === 'video' && file.previewUrl && showThumb && !thumbError;

  const isUploading = file.status === 'uploading';
  const isPaused = file.status === 'paused';
  const isErr = file.status === 'error';
  const isOk = file.status === 'success';

  const showProgress = isUploading || isPaused || file.progress > 0;

  // Default progress variant: striped while uploading, plain bar otherwise.
  const resolvedProgressVariant: ProgressVariant =
    progressVariant ?? (isPaused ? 'bar' : isUploading ? 'striped' : 'bar');

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-rup border border-rup-border bg-rup-bg p-3 text-rup-fg',
        density === 'compact' && 'p-2 gap-2',
        density === 'card' && 'flex-col items-stretch p-4',
        isErr && 'border-rup-error/50',
        isOk && 'border-rup-success/50',
        className,
      )}
      data-rup-file-id={file.id}
      data-status={file.status}
      {...rest}
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-rup-border/30 text-rup-muted',
          density === 'compact' && 'h-9 w-9',
          density === 'card' && 'h-32 w-full',
        )}
      >
        {isImage ? (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : isVideo ? (
          <video
            src={file.previewUrl}
            className="h-full w-full object-cover"
            muted
            onError={() => setThumbError(true)}
          />
        ) : category === 'image' ? (
          <ImageIcon width={20} height={20} />
        ) : (
          <FileIcon width={20} height={20} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </span>
          {isOk && <CheckIcon width={14} height={14} className="text-rup-success" />}
          {isErr && <AlertIcon width={14} height={14} className="text-rup-error" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-rup-muted">
          <span>{formatBytes(file.size)}</span>
          {isUploading && showStats && (
            <>
              <span>·</span>
              <span>
                {t.speed}: {formatSpeed(file.speed)}
              </span>
              <span>·</span>
              <span>
                {t.eta}: {formatEta(file.eta)}
              </span>
            </>
          )}
          {isErr && file.error && (
            <span className="truncate text-rup-error" title={file.error.message}>
              {file.error.message}
            </span>
          )}
          {isPaused && <span>{t.paused}</span>}
        </div>
        {showProgress && (
          <UploadProgress
            value={file.progress}
            variant={resolvedProgressVariant}
            size={progressSize}
            className="mt-2"
            fillClassName={isErr ? 'bg-rup-error' : isOk ? 'bg-rup-success' : undefined}
          />
        )}
      </div>

      <div className={cn('flex items-center gap-1', density === 'card' && 'justify-end')}>
        {onPreview && (
          <IconButton onClick={() => onPreview(file)} label={t.preview}>
            <EyeIcon width={14} height={14} />
          </IconButton>
        )}
        {onEdit && (
          <IconButton onClick={() => onEdit(file)} label={t.edit ?? 'Edit'}>
            <EditIcon width={14} height={14} />
          </IconButton>
        )}
        {onDownload && isOk && (
          <IconButton onClick={() => onDownload(file)} label={t.download}>
            <DownloadIcon width={14} height={14} />
          </IconButton>
        )}
        {onRetry && (isErr || file.status === 'cancelled') && (
          <IconButton onClick={() => onRetry(file)} label={t.retry}>
            <RetryIcon width={14} height={14} />
          </IconButton>
        )}
        {onPause && isUploading && (
          <IconButton onClick={() => onPause(file)} label={t.pause}>
            <PauseIcon width={14} height={14} />
          </IconButton>
        )}
        {onResume && isPaused && (
          <IconButton onClick={() => onResume(file)} label={t.resume}>
            <PlayIcon width={14} height={14} />
          </IconButton>
        )}
        {onCancel && isUploading && (
          <IconButton onClick={() => onCancel(file)} label={t.cancel}>
            <CloseIcon width={14} height={14} />
          </IconButton>
        )}
        {onRemove && (
          <IconButton onClick={() => onRemove(file)} label={t.remove} danger>
            <TrashIcon width={14} height={14} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-rup-muted transition hover:bg-rup-border/40 hover:text-rup-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rup-accent',
        danger && 'hover:bg-rup-error/10 hover:text-rup-error',
      )}
    >
      {children}
    </button>
  );
}
