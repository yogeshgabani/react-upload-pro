import type { ProgressVariant } from '../components/UploadProgress';
import type { UseDropzoneReturn } from '../hooks/useDropzone';
import type { DropzoneOptions, FileMetadata, UploadFile } from '../types';

/**
 * Common props every variant accepts. Variants are convenience presets — they
 * wrap the same `useDropzone` hook with a styled UI, so any DropzoneOptions
 * prop works on every variant.
 */
export interface VariantProps extends DropzoneOptions {
  className?: string;
  /** Custom label override. */
  label?: React.ReactNode;
  /** Custom sublabel/hint override. */
  hint?: React.ReactNode;
  /** Override the outer container width (any CSS value: '400px', '32rem', '60%'). */
  width?: string;
  /** Override the outer container height (any CSS value). */
  height?: string;
  /** Extra inline style merged onto the outer container. */
  style?: React.CSSProperties;
  /** Pick a progress visualization (bar / striped / circle / minimal / gradient / segmented / dots). */
  progressVariant?: ProgressVariant;
  /** Progress bar height in px (linear variants) or circle diameter (circle variant). */
  progressSize?: number;
  /** Enable the built-in fullscreen preview modal. */
  previewable?: boolean;
  /** Enable the built-in edit modal (rename + tags + metadata). */
  editable?: boolean;
  /** Called when the edit modal renames a file. Overrides the default queue.rename binding. */
  onRename?: (file: UploadFile, newName: string) => void;
  /** Called when the edit modal saves metadata. Overrides the default queue.setMetadata binding. */
  onMetadataChange?: (file: UploadFile, metadata: FileMetadata) => void;
  /** Once the file list exceeds this count, the list becomes scrollable. 0 = off. */
  scrollAfter?: number;
  /** Max CSS height for the scroll region. Default '280px'. */
  maxHeight?: string;
  /**
   * Override the accent color used by the variant — drives borders, focus
   * rings, progress fill, primary buttons, and hover states. Accepts:
   *   - a hex string: `'#10b981'` or `'#10B981'`
   *   - an RGB triplet string: `'16 185 129'`
   *   - any CSS color the browser understands (`'rebeccapurple'`, `'rgb(16 185 129)'`)
   *
   * Applied as an inline `--rup-accent` CSS variable on the variant's outer
   * wrapper, so it stays scoped to this instance and doesn't leak globally.
   */
  accent?: string;
  /**
   * Foreground color used on top of `accent` (e.g. button text on accent
   * background). Same format as `accent`. Defaults to white / dark slate
   * automatically when `accent` is set.
   */
  accentFg?: string;
}

/**
 * Convert a value the consumer passed into `accent` / `accentFg` into the
 * RGB-triplet form Tailwind's alpha-aware utilities need.
 *
 * - `'#10b981'`     → `'16 185 129'`
 * - `'16 185 129'`  → `'16 185 129'` (already triplet, pass through)
 * - anything else   → returned verbatim (lets browser parse `rebeccapurple` etc.)
 *
 * Hex parsing is lenient — both `#rgb` and `#rrggbb` work, case-insensitive.
 */
export function normalizeColorInput(value: string): string {
  const trimmed = value.trim();
  // Already an RGB triplet ("16 185 129") — pass through.
  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(trimmed)) return trimmed;
  // Hex: #rgb or #rrggbb
  const hex = trimmed.replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const r = parseInt(hex[0]! + hex[0], 16);
    const g = parseInt(hex[1]! + hex[1], 16);
    const b = parseInt(hex[2]! + hex[2], 16);
    return `${r} ${g} ${b}`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
  }
  // Fallback — return as-is. Browser will accept full CSS colors, and the
  // Tailwind `rgb(var(--rup-accent) / <alpha>)` pattern will degrade gracefully
  // (alpha modifiers won't work but the base color still renders).
  return trimmed;
}

/**
 * Pick a sensible foreground color for `accent` when the consumer didn't
 * provide one. Computes relative luminance and returns white for dark accents,
 * near-black for light accents. Falls back to white for non-triplet inputs.
 */
function defaultAccentFg(accentTriplet: string): string {
  const m = accentTriplet.match(/^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/);
  if (!m) return '255 255 255';
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Perceived luminance — Rec. 709 coefficients.
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '17 24 39' : '255 255 255';
}

/**
 * Inline style applied to a variant's outermost container — drives the *width*
 * of the whole component (drop surface + gallery + actions). Any extra `style`
 * from the consumer is merged here so it acts as an escape hatch.
 *
 * Note: `height` is intentionally NOT applied here — see surfaceStyleFromProps.
 * Putting height on the outer wrapper conflicts with the file gallery growing
 * below the drop surface; users almost always mean "the drop area is N tall".
 */
export function containerStyleFromProps(
  props: VariantProps,
): React.CSSProperties | undefined {
  const hasWidthOrStyle =
    props.width !== undefined || props.style !== undefined;
  const hasAccent = props.accent !== undefined;
  if (!hasWidthOrStyle && !hasAccent) return undefined;
  const style: Record<string, unknown> = {
    width: props.width,
    ...props.style,
  };
  if (hasAccent) {
    const accentTriplet = normalizeColorInput(props.accent!);
    style['--rup-accent'] = accentTriplet;
    style['--rup-accent-fg'] =
      props.accentFg !== undefined
        ? normalizeColorInput(props.accentFg)
        : defaultAccentFg(accentTriplet);
  }
  return style as React.CSSProperties;
}

/**
 * Inline style applied to the *drop surface* itself — the inner element that
 * receives `getRootProps()`. Drives the dropzone's visible height so the file
 * list below it isn't squashed when the user sets a small value.
 */
export function surfaceStyleFromProps(
  props: VariantProps,
): React.CSSProperties | undefined {
  if (props.height === undefined) return undefined;
  return { height: props.height };
}

/**
 * Extract the gallery-specific subset from VariantProps. Used by every variant
 * to forward UI options to UploadGallery without leaking them into useDropzone.
 *
 * When an `api` (UseDropzoneReturn) is provided, default rename/metadata
 * handlers are wired to the underlying queue so edits actually persist —
 * callers can still override by passing their own `onRename` / `onMetadataChange`.
 */
export function pickGalleryProps(props: VariantProps, api?: UseDropzoneReturn) {
  const onRename =
    props.onRename ??
    (api ? (f: UploadFile, name: string) => api.rename(f.id, name) : undefined);
  const onMetadataChange =
    props.onMetadataChange ??
    (api ? (f: UploadFile, m: FileMetadata) => api.setMetadata(f.id, m) : undefined);
  return {
    progressVariant: props.progressVariant,
    progressSize: props.progressSize,
    previewable: props.previewable,
    editable: props.editable,
    scrollAfter: props.scrollAfter,
    maxHeight: props.maxHeight,
    onRename,
    onMetadataChange,
  };
}
