/**
 * react-upload-pro — the most feature-rich React file upload library.
 *
 *   import { Dropzone, useDropzone, ThemeProvider } from 'react-upload-pro';
 *   import 'react-upload-pro/styles.css';
 *
 * Variants and cloud adapters are split into separate entrypoints to keep the
 * core bundle small:
 *
 *   import { MinimalGlass } from 'react-upload-pro/variants';
 *   import { createS3Adapter } from 'react-upload-pro/cloud';
 */

// Types
export type {
  UploadFile,
  UploadStatus,
  UploadMode,
  UploadStrategy,
  UploadError,
  ValidationError,
  ValidationErrorCode,
  ValidationConfig,
  UploaderConfig,
  DropzoneOptions,
  DropzoneCallbacks,
  DropzoneState,
  CloudAdapter,
  CloudUploadResult,
  UploadTokenPayload,
  ChunkState,
  FileMetadata,
  Accept,
  Locale,
  Translations,
  Theme,
} from './types';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Core (advanced)
export { UploadQueue } from './core/queue';
export { validateFile, validateBatch, matchesAccept } from './core/validation';

// Theme / i18n
export { ThemeProvider, useTheme } from './theme';
export { I18nProvider, useI18n, translations, rtlLocales } from './i18n';

// Utilities
export {
  formatBytes,
  formatSpeed,
  formatEta,
  formatPercent,
  getFileCategory,
  detectSignature,
  wrapFile,
  generatePreview,
  revokePreview,
  cn,
} from './utils';
