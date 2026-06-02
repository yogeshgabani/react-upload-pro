import { type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { formatPercent } from '../utils/format';

export type ProgressVariant =
  | 'bar'
  | 'striped'
  | 'circle'
  | 'minimal'
  | 'gradient'
  | 'segmented'
  | 'dots';

export interface UploadProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress 0..1 */
  value: number;
  /** Visual variant. */
  variant?: ProgressVariant;
  /** Show the percentage label. */
  showLabel?: boolean;
  /** Size in px for circle/dots variants, height in px for bar variants. */
  size?: number;
  /** Color overrides via Tailwind classes (e.g., 'bg-emerald-500'). */
  fillClassName?: string;
  /** Track color override. */
  trackClassName?: string;
  /** Marks the upload as indeterminate (no known progress). */
  indeterminate?: boolean;
  /** Number of segments for segmented/dots variants (default 10). */
  segments?: number;
}

const SEGMENT_COUNT = 10;

/**
 * Single-file progress visualization. Pure presentational — does not subscribe
 * to the queue. Multiple visual variants supported; choose via `variant`.
 */
export function UploadProgress({
  value,
  variant = 'bar',
  showLabel = false,
  size,
  fillClassName,
  trackClassName,
  indeterminate = false,
  segments = SEGMENT_COUNT,
  className,
  ...rest
}: UploadProgressProps) {
  const pct = Math.max(0, Math.min(1, value));
  const roundedPct = Math.round(pct * 100);

  // ─── Circle ───
  if (variant === 'circle') {
    const dim = size ?? 48;
    const stroke = Math.max(3, Math.floor(dim / 12));
    const radius = (dim - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = indeterminate ? circumference * 0.75 : circumference * (1 - pct);
    return (
      <div
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: dim, height: dim }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        {...rest}
      >
        <svg width={dim} height={dim} className={indeterminate ? 'animate-spin' : ''}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className={cn('text-rup-border', trackClassName)}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            className={cn('text-rup-accent transition-[stroke-dashoffset] duration-300', fillClassName)}
          />
        </svg>
        {showLabel && (
          <span className="absolute text-xs font-medium text-rup-fg">{formatPercent(pct)}</span>
        )}
      </div>
    );
  }

  // ─── Segmented (battery-style blocks) ───
  if (variant === 'segmented') {
    const filled = Math.round(pct * segments);
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        {...rest}
      >
        <div className="flex flex-1 items-center gap-[3px]">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-sm transition-colors duration-200',
                i < filled ? 'bg-rup-accent' : 'bg-rup-border/60',
                fillClassName && i < filled && fillClassName,
              )}
            />
          ))}
        </div>
        {showLabel && (
          <span className="min-w-[3ch] text-right text-xs tabular-nums text-rup-muted">
            {formatPercent(pct)}
          </span>
        )}
      </div>
    );
  }

  // ─── Dots ───
  if (variant === 'dots') {
    const filled = Math.round(pct * segments);
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        {...rest}
      >
        <div className="flex flex-1 items-center justify-between gap-1">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-200',
                i < filled ? 'bg-rup-accent scale-110' : 'bg-rup-border/60',
                fillClassName && i < filled && fillClassName,
              )}
            />
          ))}
        </div>
        {showLabel && (
          <span className="min-w-[3ch] text-right text-xs tabular-nums text-rup-muted">
            {formatPercent(pct)}
          </span>
        )}
      </div>
    );
  }

  // ─── Linear (bar / striped / minimal / gradient) ───
  const isMinimal = variant === 'minimal';
  const isGradient = variant === 'gradient';
  const isStriped = variant === 'striped';
  const height = size ?? (isMinimal ? 2 : isStriped ? 10 : 6);

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : roundedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      {...rest}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden bg-rup-border/60',
          isMinimal ? 'rounded-none' : 'rounded-full',
          trackClassName,
        )}
        style={{ height }}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-[width] duration-300',
            isMinimal ? 'rounded-none' : 'rounded-full',
            isGradient
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
              : 'bg-rup-accent',
            isStriped &&
              'bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[rup-shimmer_1s_linear_infinite]',
            indeterminate && 'w-1/3 animate-[rup-shimmer_1.4s_linear_infinite]',
            fillClassName,
          )}
          style={{ width: indeterminate ? undefined : `${pct * 100}%` }}
        />
      </div>
      {showLabel && (
        <span className="min-w-[3ch] text-right text-xs tabular-nums text-rup-muted">
          {formatPercent(pct)}
        </span>
      )}
    </div>
  );
}
