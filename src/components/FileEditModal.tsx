import { type KeyboardEvent, useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import type { FileMetadata, UploadFile } from '../types';
import { cn } from '../utils/cn';
import { CloseIcon, TagIcon } from './icons';
import { UploadModal } from './UploadModal';

export interface FileEditModalProps {
  file: UploadFile | null;
  onClose: () => void;
  /** Persist a new name (rename). */
  onRename?: (file: UploadFile, newName: string) => void;
  /** Persist metadata (tags / category / description / custom fields). */
  onSave?: (file: UploadFile, metadata: FileMetadata) => void;
}

/**
 * Modal for editing a single file's name + metadata. Drives the library's
 * built-in `rename()` / `setMetadata()` queue methods when wired through
 * UploadGallery, but the form itself is presentational — pass `onRename` /
 * `onSave` to integrate with your own state.
 */
export function FileEditModal({ file, onClose, onRename, onSave }: FileEditModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');

  useEffect(() => {
    if (!file) return;
    setName(file.name);
    setCategory(typeof file.metadata.category === 'string' ? file.metadata.category : '');
    setDescription(
      typeof file.metadata.description === 'string' ? file.metadata.description : '',
    );
    setTags(Array.isArray(file.metadata.tags) ? [...file.metadata.tags] : []);
    setTagDraft('');
  }, [file]);

  const commitTagDraft = () => {
    const next = tagDraft.trim();
    if (!next) return;
    if (tags.includes(next)) {
      setTagDraft('');
      return;
    }
    setTags((prev) => [...prev, next]);
    setTagDraft('');
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTagDraft();
    } else if (e.key === 'Backspace' && tagDraft === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    if (!file) return;
    if (name && name !== file.name) onRename?.(file, name);
    onSave?.(file, { category: category || undefined, description: description || undefined, tags });
    onClose();
  };

  return (
    <UploadModal open={!!file} onClose={onClose} title={t.edit} size="md" hideClose>
      {file && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-rup-muted">
              {file.size > 0
                ? new Intl.NumberFormat().format(file.size) + ' bytes'
                : ''}{' '}
              · {file.type || 'unknown'}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.cancel}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-rup-muted hover:bg-rup-border/40 hover:text-rup-fg"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>

          <Field label={t.rename}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </Field>

          <Field label={t.category}>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. invoices"
              className={inputCls}
            />
          </Field>

          <Field label={t.tags}>
            <div className="flex flex-wrap items-center gap-1.5 rounded-rup border border-rup-border bg-rup-bg p-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-rup-accent/15 px-2 py-0.5 text-xs text-rup-accent"
                >
                  <TagIcon width={10} height={10} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((x) => x !== tag))}
                    className="ml-0.5 text-rup-accent hover:opacity-70"
                    aria-label={`${t.remove} ${tag}`}
                  >
                    <CloseIcon width={10} height={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={onTagKeyDown}
                onBlur={commitTagDraft}
                placeholder={t.addTag}
                className="min-w-[80px] flex-1 bg-transparent text-sm text-rup-fg outline-none placeholder:text-rup-muted"
              />
            </div>
          </Field>

          <Field label={t.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(inputCls, 'resize-none')}
            />
          </Field>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-rup-border bg-rup-bg px-4 py-2 text-sm text-rup-fg hover:bg-rup-border/30"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-rup-accent px-4 py-2 text-sm font-medium text-rup-accent-fg hover:opacity-90"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </UploadModal>
  );
}

const inputCls =
  'w-full rounded-rup border border-rup-border bg-rup-bg px-3 py-2 text-sm text-rup-fg placeholder:text-rup-muted focus:outline-none focus:ring-2 focus:ring-rup-accent';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-rup-muted">{label}</span>
      {children}
    </label>
  );
}
