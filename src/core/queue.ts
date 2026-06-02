import type {
  DropzoneCallbacks,
  UploadError,
  UploadFile,
  UploaderConfig,
} from '../types';
import { revokePreview } from '../utils';
import { chunkUpload } from './chunkUpload';
import { SpeedMeter } from './speed';
import { xhrUpload } from './xhrUpload';

type Listener = (files: UploadFile[]) => void;

/**
 * Central upload coordinator. Owns the list of files, drives the upload
 * lifecycle (start/pause/resume/retry/cancel/remove), and emits updates
 * to subscribed React hooks.
 *
 * The queue is intentionally framework-agnostic — the hooks layer adapts it.
 */
export class UploadQueue {
  private files: UploadFile[] = [];
  private listeners = new Set<Listener>();
  private inFlight = new Set<string>();
  private callbacks: DropzoneCallbacks;
  private config: UploaderConfig;
  private completionFired = false;

  constructor(config: UploaderConfig = {}, callbacks: DropzoneCallbacks = {}) {
    this.config = { concurrency: 3, retries: 2, retryBackoffMs: 500, ...config };
    this.callbacks = callbacks;
  }

  // ───────────── public state ─────────────

  getFiles(): UploadFile[] {
    return this.files;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.files);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateConfig(config: UploaderConfig): void {
    this.config = { ...this.config, ...config };
  }

  updateCallbacks(callbacks: DropzoneCallbacks): void {
    this.callbacks = callbacks;
  }

  // ───────────── mutations ─────────────

  add(files: UploadFile[]): void {
    if (files.length === 0) return;
    this.files = [...this.files, ...files];
    this.completionFired = false;
    this.emit();
    const mode = this.config.mode ?? 'manual';
    if (mode === 'instant' || mode === 'auto') {
      void this.start();
    }
  }

  remove(id: string): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    if (file.status === 'uploading') {
      file.controller?.abort();
    }
    revokePreview(file.previewUrl);
    this.files = this.files.filter((f) => f.id !== id);
    this.inFlight.delete(id);
    this.callbacks.onRemove?.(file);
    this.emit();
  }

  removeAll(): void {
    for (const f of this.files) {
      if (f.status === 'uploading') f.controller?.abort();
      revokePreview(f.previewUrl);
    }
    const removed = this.files;
    this.files = [];
    this.inFlight.clear();
    for (const f of removed) this.callbacks.onRemove?.(f);
    this.emit();
  }

  reorder(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.files.length ||
      toIndex >= this.files.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const next = [...this.files];
    const [moved] = next.splice(fromIndex, 1);
    if (moved) next.splice(toIndex, 0, moved);
    this.files = next;
    this.emit();
  }

  rename(id: string, newName: string): void {
    this.patch(id, { name: newName });
  }

  setMetadata(id: string, metadata: UploadFile['metadata']): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    this.patch(id, { metadata: { ...file.metadata, ...metadata } });
  }

  // ───────────── lifecycle ─────────────

  async start(): Promise<void> {
    const strategy = this.config.strategy ?? 'parallel';
    const concurrency =
      strategy === 'sequential' ? 1 : Math.max(1, this.config.concurrency ?? 3);

    const pending = () =>
      this.files.filter((f) => f.status === 'idle' || f.status === 'queued' || f.status === 'paused');

    // Mark all pending as queued so the UI reflects it immediately.
    for (const f of pending()) {
      if (f.status === 'idle') this.patch(f.id, { status: 'queued' });
    }

    const next = () => pending().find((f) => f.status === 'queued');

    const runners: Promise<void>[] = [];
    const launch = async () => {
      while (true) {
        const file = next();
        if (!file) return;
        await this.runFile(file);
      }
    };
    for (let i = 0; i < concurrency; i++) runners.push(launch());
    await Promise.all(runners);
    this.maybeFireCompletion();
  }

  pause(id: string): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    if (file.status !== 'uploading') return;
    file.controller?.abort();
    this.patch(id, { status: 'paused' });
    this.callbacks.onPause?.(file);
  }

  resume(id: string): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    if (file.status !== 'paused') return;
    this.patch(id, { status: 'queued' });
    this.callbacks.onResume?.(file);
    void this.start();
  }

  retry(id: string): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    if (file.status !== 'error' && file.status !== 'cancelled') return;
    this.patch(id, {
      status: 'queued',
      progress: 0,
      bytesUploaded: 0,
      speed: 0,
      eta: Infinity,
      error: undefined,
    });
    this.callbacks.onRetry?.(file);
    void this.start();
  }

  cancel(id: string): void {
    const file = this.files.find((f) => f.id === id);
    if (!file) return;
    if (file.status === 'uploading') file.controller?.abort();
    this.patch(id, { status: 'cancelled' });
  }

  // ───────────── internals ─────────────

  private async runFile(file: UploadFile): Promise<void> {
    if (this.inFlight.has(file.id)) return;
    this.inFlight.add(file.id);

    const controller = new AbortController();
    file.controller = controller;
    const startedAt = Date.now();
    this.patch(file.id, {
      status: 'uploading',
      startedAt,
      attempts: file.attempts + 1,
      controller,
    });
    this.callbacks.onUploadStart?.(this.lookup(file.id));

    const meter = new SpeedMeter(file.size);
    const updateProgress = (loaded: number, total: number) => {
      const { speed, eta } = meter.update(loaded);
      const progress = total > 0 ? loaded / total : 0;
      this.patch(file.id, { progress, bytesUploaded: loaded, speed, eta });
      this.callbacks.onUploadProgress?.(this.lookup(file.id));
    };

    try {
      if (this.config.virusScan) {
        const result = await this.config.virusScan(this.lookup(file.id));
        if (!result.clean) {
          throw {
            code: 'virus-detected',
            message: result.reason ?? 'File failed virus scan',
            retryable: false,
          } satisfies UploadError;
        }
      }

      let response: unknown;
      if (this.config.cloud) {
        response = await this.config.cloud.upload(this.lookup(file.id), {
          signal: controller.signal,
          onProgress: updateProgress,
        });
      } else if (this.config.chunkSize && this.config.chunkSize > 0) {
        response = await chunkUpload({
          file: this.lookup(file.id),
          config: this.config,
          signal: controller.signal,
          onProgress: updateProgress,
        });
      } else {
        response = await xhrUpload({
          file: this.lookup(file.id),
          config: this.config,
          signal: controller.signal,
          onProgress: (ev) => updateProgress(ev.loaded, ev.total),
        });
      }

      this.patch(file.id, {
        status: 'success',
        progress: 1,
        bytesUploaded: file.size,
        finishedAt: Date.now(),
        response,
        controller: undefined,
        eta: 0,
      });
      this.callbacks.onUploadSuccess?.(this.lookup(file.id));
    } catch (err) {
      const error = normalizeError(err);
      const current = this.lookup(file.id);

      // If the user paused, the controller aborted — leave status as 'paused'.
      if (current.status === 'paused') {
        // already handled by pause()
      } else if (error.code === 'cancelled') {
        this.patch(file.id, { status: 'cancelled', error, controller: undefined });
      } else {
        const maxRetries = this.config.retries ?? 0;
        const canRetry = error.retryable && current.attempts <= maxRetries;
        if (canRetry) {
          const backoff = (this.config.retryBackoffMs ?? 500) * Math.pow(2, current.attempts - 1);
          await new Promise((r) => setTimeout(r, backoff));
          this.inFlight.delete(file.id);
          this.callbacks.onRetry?.(current);
          this.patch(file.id, { status: 'queued', controller: undefined });
          return this.runFile(this.lookup(file.id));
        }
        this.patch(file.id, { status: 'error', error, controller: undefined });
        this.callbacks.onUploadError?.(this.lookup(file.id), error);
      }
    } finally {
      this.inFlight.delete(file.id);
    }
  }

  private lookup(id: string): UploadFile {
    const f = this.files.find((x) => x.id === id);
    if (!f) throw new Error(`File ${id} not found`);
    return f;
  }

  private patch(id: string, patch: Partial<UploadFile>): void {
    const idx = this.files.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const prev = this.files[idx];
    if (!prev) return;
    this.files = [
      ...this.files.slice(0, idx),
      { ...prev, ...patch },
      ...this.files.slice(idx + 1),
    ];
    this.emit();
  }

  private emit(): void {
    for (const l of this.listeners) l(this.files);
  }

  private maybeFireCompletion(): void {
    if (this.completionFired) return;
    if (this.files.length === 0) return;
    const allDone = this.files.every(
      (f) => f.status === 'success' || f.status === 'error' || f.status === 'cancelled',
    );
    if (allDone) {
      this.completionFired = true;
      this.callbacks.onAllComplete?.(this.files);
    }
  }
}

function normalizeError(err: unknown): UploadError {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err && 'retryable' in err) {
    return err as UploadError;
  }
  if (err instanceof Error) {
    return { code: 'unknown', message: err.message, retryable: false, cause: err };
  }
  return { code: 'unknown', message: 'Upload failed', retryable: false, cause: err };
}
