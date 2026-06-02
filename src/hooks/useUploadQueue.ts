import { useEffect, useRef, useState } from 'react';
import { UploadQueue } from '../core/queue';
import type { DropzoneCallbacks, UploadFile, UploaderConfig } from '../types';

export interface UseUploadQueueOptions extends UploaderConfig, DropzoneCallbacks {}

export interface UseUploadQueueReturn {
  queue: UploadQueue;
  files: UploadFile[];
  add: (files: UploadFile[]) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  reorder: (from: number, to: number) => void;
  rename: (id: string, name: string) => void;
  setMetadata: (id: string, metadata: UploadFile['metadata']) => void;
  start: () => Promise<void>;
  pause: (id: string) => void;
  resume: (id: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
}

/**
 * Low-level hook that returns a stable UploadQueue instance bound to React state.
 * Higher-level hooks (useDropzone, useUploader) compose this.
 */
export function useUploadQueue(options: UseUploadQueueOptions = {}): UseUploadQueueReturn {
  const queueRef = useRef<UploadQueue | null>(null);
  if (queueRef.current === null) {
    queueRef.current = new UploadQueue(options, options);
  }
  const queue = queueRef.current;

  const [files, setFiles] = useState<UploadFile[]>(() => queue.getFiles());

  // Keep queue config/callbacks in sync with prop changes without remounting.
  useEffect(() => {
    queue.updateConfig(options);
    queue.updateCallbacks(options);
  }, [queue, options]);

  useEffect(() => {
    return queue.subscribe(setFiles);
  }, [queue]);

  return {
    queue,
    files,
    add: (f) => queue.add(f),
    remove: (id) => queue.remove(id),
    removeAll: () => queue.removeAll(),
    reorder: (from, to) => queue.reorder(from, to),
    rename: (id, name) => queue.rename(id, name),
    setMetadata: (id, m) => queue.setMetadata(id, m),
    start: () => queue.start(),
    pause: (id) => queue.pause(id),
    resume: (id) => queue.resume(id),
    retry: (id) => queue.retry(id),
    cancel: (id) => queue.cancel(id),
  };
}
