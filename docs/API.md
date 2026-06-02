# API Reference

## Components

### `<Dropzone />`

The flagship drop-in component. Accepts all `DropzoneOptions` plus:

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `(api: UseDropzoneReturn) => ReactNode` | Render-prop override |
| `hideGallery` | `boolean` | Hide the built-in file list (default false) |
| `galleryLayout` | `'list' \| 'grid' \| 'table' \| 'compact'` | Layout of the built-in gallery |
| `hint` | `ReactNode` | Subtext under the icon |
| `className` | `string` | Tailwind class additions |

### `<UploadArea />`

The visual drop surface. Spread `getRootProps()` on it.

### `<UploadButton />`

Standalone "browse" button that opens the picker. Accepts `variant`, `icon`, `iconOnly`, and all `DropzoneOptions`.

### `<UploadProgress />`

| Prop | Type |
| --- | --- |
| `value` | `number` (0..1) |
| `variant` | `'bar' \| 'circle' \| 'striped'` |
| `showLabel` | `boolean` |
| `size` | `number` (px) |
| `fillClassName` | `string` |
| `trackClassName` | `string` |
| `indeterminate` | `boolean` |

### `<UploadPreview />`

Single-file row/card. Accepts callbacks for retry / pause / resume / cancel / remove / preview / download.

### `<UploadGallery />`

Renders a list of `UploadFile[]` in `list / grid / table / compact` layout. Supports `searchable`, `filterable`, `reorderable`.

### `<UploadModal />`, `<FilePreviewModal />`

Modal containers. The latter supports image zoom & rotate, video, audio, PDF, and text previews.

---

## Hooks

### `useDropzone(options)`

Returns:

```ts
{
  getRootProps,         // spread on container
  getInputProps,        // spread on <input type="file">
  open,                 // open the file dialog
  files,                // UploadFile[]
  rejected,             // ValidationError[] from latest drop
  isDragging,
  isDragAccept,
  isDragReject,
  state,                // 'idle' | 'dragging' | 'drag-accept' | 'drag-reject'
  add,                  // (File[]) => Promise<{accepted, rejected}>
  remove,
  removeAll,
  reorder,              // (from, to)
  start,                // begin uploading
  pause,
  resume,
  retry,
  cancel,
  rename,
  setMetadata,
  queue,                // direct UploadQueue handle
  inputRef,
}
```

### `useUploader(options)`

Alias for `useDropzone({ mode: 'auto', ...options })`.

### `useUploadQueue(options)`

Lower-level hook returning the raw queue + helpers, without DOM bindings.

### `useUploadProgress(files)`

Aggregates `{ total, uploaded, progress, speed, eta, uploading, completed, errored, pending }`.

### `useFilePreview(file)`

Returns `{ kind, url?, text?, loading, error? }`. Lazily reads up to 64KB for text previews.

---

## Options

### Validation

| Option | Type | Default |
| --- | --- | --- |
| `accept` | `string \| string[] \| Record<string, string[]>` | unset |
| `minSize` | `number` (bytes) | unset |
| `maxSize` | `number` (bytes) | unset |
| `maxFiles` | `number` | unset |
| `rejectDuplicates` | `boolean` | false |
| `validators` | `Array<(file: File) => ValidationError \| null \| Promise<...>>` | unset |

### Upload

| Option | Type | Default |
| --- | --- | --- |
| `endpoint` | `string` | required (unless `cloud`) |
| `method` | `'POST' \| 'PUT' \| 'PATCH'` | `'POST'` |
| `headers` | `Record<string,string> \| () => …` | unset |
| `fieldName` | `string` | `'file'` |
| `formData` | `Record \| (file) => Record` | unset |
| `withCredentials` | `boolean` | false |
| `mode` | `'manual' \| 'instant' \| 'auto' \| 'queue'` | `'manual'` |
| `strategy` | `'parallel' \| 'sequential'` | `'parallel'` |
| `concurrency` | `number` | `3` |
| `retries` | `number` | `2` |
| `retryBackoffMs` | `number` | `500` |
| `chunkSize` | `number` (bytes) | unset |
| `cloud` | `CloudAdapter` | unset |
| `getUploadToken` | `(file) => Promise<UploadTokenPayload>` | unset |
| `virusScan` | `(file) => Promise<{ clean: boolean }>` | unset |

### Behavior

| Option | Type | Default |
| --- | --- | --- |
| `multiple` | `boolean` | `true` |
| `directory` | `boolean` | `false` |
| `clipboard` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `noBubble` | `boolean` | `true` |
| `autoRevoke` | `boolean` | `true` |

### Callbacks

```ts
onDrop?: (accepted: UploadFile[], rejected: ValidationError[]) => void
onDropAccepted?: (accepted: UploadFile[]) => void
onDropRejected?: (rejected: ValidationError[]) => void
onUploadStart?: (file: UploadFile) => void
onUploadProgress?: (file: UploadFile) => void
onUploadSuccess?: (file: UploadFile) => void
onUploadError?: (file: UploadFile, error: UploadError) => void
onRetry?: (file: UploadFile) => void
onPause?: (file: UploadFile) => void
onResume?: (file: UploadFile) => void
onRemove?: (file: UploadFile) => void
onAllComplete?: (files: UploadFile[]) => void
```

---

## Cloud adapters

All adapters implement:

```ts
interface CloudAdapter {
  name: string;
  upload(file: UploadFile, callbacks: {
    onProgress: (loaded: number, total: number) => void;
    signal: AbortSignal;
  }): Promise<CloudUploadResult>;
}
```

Use `cloud: createS3Adapter({...})` instead of `endpoint`.

See [`docs/cloud.md`](./cloud.md) for adapter-specific options.

---

## UploadFile

```ts
interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  path: string;             // webkitRelativePath for folder uploads
  status: 'idle' | 'queued' | 'uploading' | 'paused' | 'success' | 'error' | 'cancelled';
  progress: number;         // 0..1
  bytesUploaded: number;
  speed: number;            // bytes/sec
  eta: number;              // seconds
  error?: UploadError;
  response?: unknown;
  previewUrl?: string;
  addedAt: number;
  startedAt?: number;
  finishedAt?: number;
  attempts: number;
  metadata: FileMetadata;
  controller?: AbortController;
  chunks?: ChunkState[];
}
```
