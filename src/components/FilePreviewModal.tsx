import { useEffect, useState } from 'react';
import { useFilePreview } from '../hooks/useFilePreview';
import { useI18n } from '../i18n/I18nProvider';
import type { UploadFile } from '../types';
import { cn } from '../utils/cn';
import { CloseIcon, DownloadIcon } from './icons';
import { UploadModal } from './UploadModal';

export interface FilePreviewModalProps {
  file: UploadFile | null;
  onClose: () => void;
  /** Override download handler. By default, triggers a browser download of the local File. */
  onDownload?: (file: UploadFile) => void;
}

/**
 * Full-screen preview modal supporting images (with zoom/rotate), videos,
 * audio, PDFs (iframe), and text files. Office files fall back to a generic
 * "open in new tab" affordance because rendering DOCX/XLSX/PPTX client-side
 * is out of scope for this library.
 */
export function FilePreviewModal({ file, onClose, onDownload }: FilePreviewModalProps) {
  const { t } = useI18n();
  const preview = useFilePreview(file);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    setZoom(1);
    setRotate(0);
  }, [file?.id]);

  const handleDownload = () => {
    if (!file) return;
    if (onDownload) {
      onDownload(file);
      return;
    }
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <UploadModal open={!!file} onClose={onClose} title={file?.name} size="xl" hideClose>
      {file && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end gap-2">
            {preview.kind === 'image' && (
              <>
                <ZoomButton onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}>−</ZoomButton>
                <span className="text-xs text-rup-muted">{Math.round(zoom * 100)}%</span>
                <ZoomButton onClick={() => setZoom((z) => Math.min(5, z + 0.2))}>+</ZoomButton>
                <ZoomButton onClick={() => setRotate((r) => (r + 90) % 360)}>↻</ZoomButton>
              </>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 rounded-md border border-rup-border px-3 py-1.5 text-xs hover:bg-rup-border/30"
            >
              <DownloadIcon width={14} height={14} />
              {t.download}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.cancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rup-muted hover:bg-rup-border/40 hover:text-rup-fg"
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>
          <div className="flex min-h-[40vh] items-center justify-center overflow-auto rounded-rup bg-rup-border/20 p-4">
            {renderPreview({ preview, file, zoom, rotate })}
          </div>
        </div>
      )}
    </UploadModal>
  );
}

function renderPreview({
  preview,
  file,
  zoom,
  rotate,
}: {
  preview: ReturnType<typeof useFilePreview>;
  file: UploadFile;
  zoom: number;
  rotate: number;
}) {
  if (preview.loading) {
    return <div className="text-sm text-rup-muted">Loading…</div>;
  }
  if (preview.error) {
    return <div className="text-sm text-rup-error">{preview.error}</div>;
  }
  if (preview.kind === 'image' && preview.url) {
    return (
      <img
        src={preview.url}
        alt={file.name}
        style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
        className="max-h-[70vh] origin-center select-none transition-transform"
      />
    );
  }
  if (preview.kind === 'video' && preview.url) {
    return <video src={preview.url} controls className="max-h-[70vh]" />;
  }
  if (preview.kind === 'audio' && preview.url) {
    return <audio src={preview.url} controls className="w-full" />;
  }
  if (preview.kind === 'pdf' && preview.url) {
    return <iframe src={preview.url} title={file.name} className="h-[70vh] w-full rounded border-0" />;
  }
  if (preview.kind === 'text' && typeof preview.text === 'string') {
    return (
      <pre className="max-h-[70vh] w-full overflow-auto whitespace-pre-wrap break-words rounded bg-rup-bg p-4 text-xs">
        {preview.text}
      </pre>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-rup-muted">
      <span>No inline preview available for this file type.</span>
      {preview.url && (
        <a
          href={preview.url}
          target="_blank"
          rel="noreferrer"
          className="text-rup-accent underline"
        >
          Open in new tab
        </a>
      )}
    </div>
  );
}

function ZoomButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 w-8 rounded-md border border-rup-border bg-rup-bg text-sm text-rup-fg hover:bg-rup-border/30',
      )}
    >
      {children}
    </button>
  );
}
