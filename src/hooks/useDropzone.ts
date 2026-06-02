import {
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { validateBatch } from '../core/validation';
import type {
  DropzoneOptions,
  DropzoneState,
  UploadFile,
  ValidationError,
} from '../types';
import { collectFiles, fileKey, generatePreview, wrapFile } from '../utils';
import { useUploadQueue } from './useUploadQueue';

/** The bag of props returned by getRootProps. Tagged with data-* attributes for styling. */
export type RootProps<T extends HTMLElement = HTMLDivElement> = HTMLAttributes<T> & {
  [dataAttr: `data-${string}`]: string | undefined;
};

/** Input props returned by getInputProps. Includes a callback ref. */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
  [dataAttr: `data-${string}`]: string | undefined;
};

export interface UseDropzoneReturn {
  /** Spread on the dropzone root element. */
  getRootProps: <T extends HTMLElement = HTMLDivElement>(
    props?: HTMLAttributes<T>,
  ) => RootProps<T>;
  /** Spread on a hidden <input type="file">. */
  getInputProps: (props?: InputHTMLAttributes<HTMLInputElement>) => InputProps;
  /** Open the native file dialog programmatically. */
  open: () => void;
  /** Files currently in the queue. */
  files: UploadFile[];
  /** Validation errors from the most recent drop. */
  rejected: ValidationError[];
  /** Whether anything is being dragged over the dropzone. */
  isDragging: boolean;
  /** Whether the current drag would be accepted. */
  isDragAccept: boolean;
  isDragReject: boolean;
  /** Coarse state for styling. */
  state: DropzoneState;
  /** Queue helpers. */
  add: (files: File[]) => Promise<{ accepted: UploadFile[]; rejected: ValidationError[] }>;
  remove: (id: string) => void;
  removeAll: () => void;
  reorder: (from: number, to: number) => void;
  start: () => Promise<void>;
  pause: (id: string) => void;
  resume: (id: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  rename: (id: string, name: string) => void;
  setMetadata: (id: string, metadata: UploadFile['metadata']) => void;
  /** Direct queue handle for advanced use. */
  queue: ReturnType<typeof useUploadQueue>['queue'];
  /** Ref to the hidden input. */
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * The flagship hook. Wires drag-and-drop, paste, click, and folder upload
 * to the validation + upload queue. SSR-safe: only attaches DOM listeners
 * inside effects. Compatible with React 17/18/19.
 */
export function useDropzone(options: DropzoneOptions = {}): UseDropzoneReturn {
  const {
    multiple = true,
    directory = false,
    disabled = false,
    clipboard = true,
    noBubble: _noBubble = true,
    autoRevoke = true,
    accept,
    minSize,
    maxSize,
    maxFiles,
    rejectDuplicates,
    validators,
    onDrop,
    onDropAccepted,
    onDropRejected,
    ...uploaderConfig
  } = options;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);
  const [dragState, setDragState] = useState<DropzoneState>('idle');
  const [rejected, setRejected] = useState<ValidationError[]>([]);

  const queueApi = useUploadQueue({ ...uploaderConfig, ...options });

  const existingKeys = useMemo(() => {
    const set = new Set<string>();
    for (const f of queueApi.files) set.add(fileKey(f.file));
    return set;
  }, [queueApi.files]);

  const add = useCallback(
    async (rawFiles: File[]) => {
      let pool = rawFiles;
      if (!multiple && pool.length > 1) pool = pool.slice(0, 1);

      // Single-file mode: dropping a new file replaces the existing one
      // (matches native <input type="file"> semantics). Without this, repeated
      // drops accumulate even when `multiple={false}`.
      const isReplacement = !multiple && pool.length > 0 && queueApi.files.length > 0;
      if (isReplacement) {
        queueApi.removeAll();
      }

      const { accepted, rejected: rejectedFiles } = await validateBatch(
        pool,
        { accept, minSize, maxSize, maxFiles, rejectDuplicates, validators },
        isReplacement ? 0 : queueApi.files.length,
        isReplacement ? new Set() : existingKeys,
      );

      const wrapped = accepted.map((f) => {
        const wf = wrapFile(f);
        wf.previewUrl = generatePreview(f);
        return wf;
      });
      queueApi.add(wrapped);
      setRejected(rejectedFiles);
      onDrop?.(wrapped, rejectedFiles);
      if (wrapped.length) onDropAccepted?.(wrapped);
      if (rejectedFiles.length) onDropRejected?.(rejectedFiles);
      return { accepted: wrapped, rejected: rejectedFiles };
    },
    [
      multiple,
      accept,
      minSize,
      maxSize,
      maxFiles,
      rejectDuplicates,
      validators,
      queueApi,
      existingKeys,
      onDrop,
      onDropAccepted,
      onDropRejected,
    ],
  );

  // ───────────── DOM handlers ─────────────

  const open = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (!list) return;
      await add(Array.from(list));
      // Reset so the same file can be selected again.
      event.target.value = '';
    },
    [add],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current += 1;
      const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes('Files');
      setDragState(hasFiles ? 'drag-accept' : 'dragging');
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setDragState('idle');
    },
    [disabled],
  );

  const handleDrop = useCallback(
    async (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = 0;
      setDragState('idle');

      const dt = event.dataTransfer;
      if (!dt) return;
      let files: File[] = [];
      if (dt.items && typeof dt.items[0]?.webkitGetAsEntry === 'function') {
        files = await collectFiles(dt.items);
      } else if (dt.files) {
        files = Array.from(dt.files);
      }
      await add(files);
    },
    [add, disabled],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    },
    [disabled, open],
  );

  // Clipboard paste — global listener while the user is interacting.
  useEffect(() => {
    if (!clipboard || disabled) return;
    const onPaste = (event: Event) => {
      const ev = event as unknown as ClipboardEvent;
      const items = ev.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) void add(files);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [clipboard, disabled, add]);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    if (!autoRevoke) return;
    return () => {
      for (const f of queueApi.queue.getFiles()) {
        if (f.previewUrl && typeof URL !== 'undefined') {
          try {
            URL.revokeObjectURL(f.previewUrl);
          } catch {
            /* ignore */
          }
        }
      }
    };
  }, [autoRevoke, queueApi.queue]);

  const state: DropzoneState = dragState;
  const isDragging = state !== 'idle';

  const getRootProps = useCallback(
    <T extends HTMLElement = HTMLDivElement>(
      props: HTMLAttributes<T> = {},
    ): RootProps<T> => {
      return {
        ...props,
        role: props.role ?? 'button',
        tabIndex: props.tabIndex ?? 0,
        'aria-disabled': disabled || undefined,
        'aria-label': props['aria-label'] ?? 'File upload area',
        'data-dropzone-state': state,
        onClick: (e) => {
          props.onClick?.(e);
          if (!e.defaultPrevented) open();
        },
        onKeyDown: (e) => {
          props.onKeyDown?.(e);
          if (!e.defaultPrevented) handleKeyDown(e as unknown as KeyboardEvent);
        },
        onDragEnter: (e) => {
          props.onDragEnter?.(e);
          handleDragEnter(e as unknown as DragEvent);
        },
        onDragOver: (e) => {
          props.onDragOver?.(e);
          handleDragOver(e as unknown as DragEvent);
        },
        onDragLeave: (e) => {
          props.onDragLeave?.(e);
          handleDragLeave(e as unknown as DragEvent);
        },
        onDrop: (e) => {
          props.onDrop?.(e);
          void handleDrop(e as unknown as DragEvent);
        },
      };
    },
    [
      disabled,
      state,
      open,
      handleKeyDown,
      handleDragEnter,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    ],
  );

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}): InputProps => {
      const directoryProps: Record<string, string> = directory
        ? { webkitdirectory: '', directory: '', mozdirectory: '' }
        : {};
      return {
        ...directoryProps,
        ...props,
        ref: (node: HTMLInputElement | null) => {
          inputRef.current = node;
        },
        type: 'file',
        multiple,
        disabled,
        accept: typeof accept === 'string' ? accept : Array.isArray(accept) ? accept.join(',') : undefined,
        style: { display: 'none', ...props.style },
        onChange: (e) => {
          props.onChange?.(e);
          void handleInputChange(e);
        },
        tabIndex: -1,
        'aria-hidden': true,
      };
    },
    [multiple, disabled, accept, directory, handleInputChange],
  );

  return {
    getRootProps,
    getInputProps,
    open,
    files: queueApi.files,
    rejected,
    isDragging,
    isDragAccept: state === 'drag-accept',
    isDragReject: state === 'drag-reject',
    state,
    add,
    remove: queueApi.remove,
    removeAll: queueApi.removeAll,
    reorder: queueApi.reorder,
    start: queueApi.start,
    pause: queueApi.pause,
    resume: queueApi.resume,
    retry: queueApi.retry,
    cancel: queueApi.cancel,
    rename: queueApi.rename,
    setMetadata: queueApi.setMetadata,
    queue: queueApi.queue,
    inputRef,
  };
}
