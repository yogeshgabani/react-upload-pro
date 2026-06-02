import { type HTMLAttributes, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { DropzoneState } from '../types';
import { cn } from '../utils/cn';
import { UploadIcon } from './icons';

export interface UploadAreaProps extends HTMLAttributes<HTMLDivElement> {
  state?: DropzoneState;
  disabled?: boolean;
  /** Replaces the default label content. */
  children?: ReactNode;
  /** Icon override. */
  icon?: ReactNode;
  /** Secondary descriptive line. */
  description?: ReactNode;
}

/**
 * The visual "drop here" surface, separated from the dropzone logic so users
 * can drop it into any container that spreads getRootProps().
 */
export function UploadArea({
  state = 'idle',
  disabled,
  children,
  icon,
  description,
  className,
  ...rest
}: UploadAreaProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-rup border-2 border-dashed border-rup-border bg-rup-bg p-6 text-center transition-all duration-200',
        'hover:border-rup-accent/60 hover:bg-rup-accent/5',
        state === 'drag-accept' && 'border-rup-accent bg-rup-accent/10 scale-[1.01]',
        state === 'drag-reject' && 'border-rup-error bg-rup-error/10',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {children ?? (
        <>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full bg-rup-accent/10 text-rup-accent transition-transform',
              state === 'drag-accept' && 'scale-110',
            )}
          >
            {icon ?? <UploadIcon width={24} height={24} />}
          </div>
          <p className="text-sm font-medium text-rup-fg">
            {state === 'drag-accept' ? t.dropHere : t.dragOrClick}
          </p>
          {description && <p className="text-xs text-rup-muted">{description}</p>}
        </>
      )}
    </div>
  );
}
