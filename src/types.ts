/**
 * Core type definitions for react-upload-pro.
 * Public API types are stable; internal types prefixed with `Internal`.
 */

export type UploadStatus =
  | 'idle'
  | 'queued'
  | 'uploading'
  | 'paused'
  | 'success'
  | 'error'
  | 'cancelled';

export type UploadMode =
  | 'manual'
  | 'instant'
  | 'auto'
  | 'queue';

export type UploadStrategy =
  | 'parallel'
  | 'sequential';

export interface FileMetadata {
  tags?: string[];
  category?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Wrapper around the native File with upload-state tracking.
 * `file` is the original File; everything else is library-managed.
 */
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  /** Full webkitRelativePath when uploaded from a folder, otherwise empty. */
  path: string;
  status: UploadStatus;
  /** 0..1 */
  progress: number;
  /** Bytes uploaded so far. */
  bytesUploaded: number;
  /** Upload speed in bytes/sec, averaged over a short window. */
  speed: number;
  /** ETA in seconds. Infinity until speed is known. */
  eta: number;
  error?: UploadError;
  /** Server response after success. */
  response?: unknown;
  /** Object URL for preview, if generated. */
  previewUrl?: string;
  /** Time the file was added (ms). */
  addedAt: number;
  /** Time the upload started (ms). */
  startedAt?: number;
  /** Time the upload finished (ms). */
  finishedAt?: number;
  /** Number of retry attempts so far. */
  attempts: number;
  /** User-supplied metadata. */
  metadata: FileMetadata;
  /** AbortController for in-flight upload. */
  controller?: AbortController;
  /** For chunked uploads. */
  chunks?: ChunkState[];
}

export interface ChunkState {
  index: number;
  start: number;
  end: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  attempts: number;
  etag?: string;
}

export type ValidationErrorCode =
  | 'file-too-large'
  | 'file-too-small'
  | 'file-invalid-type'
  | 'too-many-files'
  | 'duplicate-file'
  | 'custom';

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  file?: File;
}

export interface UploadError {
  code: string;
  message: string;
  cause?: unknown;
  retryable: boolean;
}

export type Accept = string | string[] | Record<string, string[]>;

export interface ValidationConfig {
  /** Accepted MIME types or extensions. `image/*`, `.pdf`, or { "image/*": [".png"] } */
  accept?: Accept;
  /** Min file size in bytes. */
  minSize?: number;
  /** Max file size in bytes. */
  maxSize?: number;
  /** Max number of files. */
  maxFiles?: number;
  /** If true, reject duplicate files (same name + size). */
  rejectDuplicates?: boolean;
  /** Custom validators run after built-ins. Return null for valid. */
  validators?: Array<(file: File) => ValidationError | null | Promise<ValidationError | null>>;
}

export interface UploaderConfig {
  /** Endpoint to POST files to. Required unless `cloud` adapter is provided. */
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  /** FormData field name for the file. Default 'file'. */
  fieldName?: string;
  /** Extra form fields to include on each request. */
  formData?: Record<string, string> | ((file: UploadFile) => Record<string, string>);
  /** Send credentials (cookies) with the request. */
  withCredentials?: boolean;
  /** Max parallel uploads when strategy='parallel'. Default 3. */
  concurrency?: number;
  /** Sequential = one at a time. Parallel = up to `concurrency`. */
  strategy?: UploadStrategy;
  /** Upload mode. instant uploads as soon as added, manual waits for `start()`. */
  mode?: UploadMode;
  /** Number of retry attempts on retryable errors. */
  retries?: number;
  /** Backoff base in ms. Doubles each retry. */
  retryBackoffMs?: number;
  /** Chunk size in bytes. If > 0, files are chunked. */
  chunkSize?: number;
  /** Optional cloud adapter — overrides endpoint-based upload. */
  cloud?: CloudAdapter;
  /** Called to obtain an upload token / presigned URL per file. */
  getUploadToken?: (file: UploadFile) => Promise<UploadTokenPayload>;
  /** Hook to scan files for malware before upload. Throw or return error to reject. */
  virusScan?: (file: UploadFile) => Promise<{ clean: boolean; reason?: string }>;
}

export interface UploadTokenPayload {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  fields?: Record<string, string>;
}

/**
 * A cloud adapter encapsulates direct-to-cloud upload logic.
 * The adapter is responsible for the full request lifecycle including
 * progress reporting via `onProgress`.
 */
export interface CloudAdapter {
  name: string;
  upload(
    file: UploadFile,
    callbacks: {
      onProgress: (loaded: number, total: number) => void;
      signal: AbortSignal;
    },
  ): Promise<CloudUploadResult>;
}

export interface CloudUploadResult {
  url: string;
  key?: string;
  etag?: string;
  metadata?: Record<string, unknown>;
}

export type DropzoneState =
  | 'idle'
  | 'dragging'
  | 'drag-accept'
  | 'drag-reject';

export interface DropzoneCallbacks {
  /** Called whenever files are accepted (after validation). */
  onDrop?: (accepted: UploadFile[], rejected: ValidationError[]) => void;
  onDropAccepted?: (accepted: UploadFile[]) => void;
  onDropRejected?: (rejected: ValidationError[]) => void;
  onUploadStart?: (file: UploadFile) => void;
  onUploadProgress?: (file: UploadFile) => void;
  onUploadSuccess?: (file: UploadFile) => void;
  onUploadError?: (file: UploadFile, error: UploadError) => void;
  onRetry?: (file: UploadFile) => void;
  onPause?: (file: UploadFile) => void;
  onResume?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void;
  onAllComplete?: (files: UploadFile[]) => void;
}

export interface DropzoneOptions extends ValidationConfig, UploaderConfig, DropzoneCallbacks {
  /** Allow multiple files. Default true. */
  multiple?: boolean;
  /** Allow directory upload via webkitdirectory. Default false. */
  directory?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Allow paste from clipboard. Default true. */
  clipboard?: boolean;
  /** Prevent drag-drop events from bubbling. Default true. */
  noBubble?: boolean;
  /** Auto-revoke object URLs on remove. Default true. */
  autoRevoke?: boolean;
}

export type Locale =
  | 'en'
  | 'hi'
  | 'gu'
  | 'fr'
  | 'de'
  | 'ar'
  | 'zh'
  | 'es'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'it'
  | 'tr'
  | 'id'
  | 'bn'
  | 'ur'
  | 'nl'
  | 'pl'
  | 'vi'
  | 'th'
  | 'he'
  | 'fa';

export interface Translations {
  dropHere: string;
  dragOrClick: string;
  browse: string;
  uploading: string;
  paused: string;
  success: string;
  error: string;
  retry: string;
  pause: string;
  resume: string;
  cancel: string;
  remove: string;
  removeAll: string;
  preview: string;
  download: string;
  edit: string;
  save: string;
  fullscreen: string;
  rename: string;
  tags: string;
  description: string;
  category: string;
  addTag: string;
  fileTooLarge: string;
  fileTooSmall: string;
  invalidType: string;
  tooManyFiles: string;
  duplicateFile: string;
  speed: string;
  eta: string;
  ofText: string;
  filesText: string;
  bytes: string;
  kb: string;
  mb: string;
  gb: string;
}

export type Theme = 'light' | 'dark' | 'auto';
