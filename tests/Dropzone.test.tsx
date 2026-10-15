import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Dropzone } from '../src/components/Dropzone';
import type { CloudAdapter } from '../src/types';
import { makeFile } from './helpers';

describe('<Dropzone />', () => {
  it('renders the default UploadArea', () => {
    render(<Dropzone />);
    expect(screen.getByText(/drag/i)).toBeInTheDocument();
  });

  it('calls onDrop when files are selected via input', async () => {
    const onDrop = vi.fn();
    const { container } = render(<Dropzone onDrop={onDrop} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    Object.defineProperty(input, 'files', {
      value: [makeFile('a.txt', 5, 'text/plain')],
      writable: false,
    });
    fireEvent.change(input);

    // Allow microtasks (validation is async).
    await new Promise((r) => setTimeout(r, 0));
    expect(onDrop).toHaveBeenCalled();
  });

  it('rejects files larger than maxSize', async () => {
    const onDropRejected = vi.fn();
    const { container } = render(<Dropzone maxSize={5} onDropRejected={onDropRejected} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [makeFile('a.txt', 50, 'text/plain')],
      writable: false,
    });
    fireEvent.change(input);
    await new Promise((r) => setTimeout(r, 0));
    expect(onDropRejected).toHaveBeenCalled();
    const rejected = onDropRejected.mock.calls[0][0];
    expect(rejected[0].code).toBe('file-too-large');
  });

  it('replaces existing file when multiple={false} and a new file is dropped', async () => {
    const onDropAccepted = vi.fn();
    const { container } = render(
      <Dropzone multiple={false} onDropAccepted={onDropAccepted} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // First drop
    Object.defineProperty(input, 'files', {
      value: [makeFile('first.txt', 10, 'text/plain')],
      writable: true,
    });
    fireEvent.change(input);
    await new Promise((r) => setTimeout(r, 0));

    // Second drop — should replace, not append
    Object.defineProperty(input, 'files', {
      value: [makeFile('second.txt', 20, 'text/plain')],
      writable: true,
    });
    fireEvent.change(input);
    await new Promise((r) => setTimeout(r, 0));

    expect(onDropAccepted).toHaveBeenCalledTimes(2);
    // The final accepted call should contain only the new file, and the
    // gallery should show only one file total.
    expect(screen.queryByText('first.txt')).not.toBeInTheDocument();
    expect(screen.getByText('second.txt')).toBeInTheDocument();
  });
});

describe('<Dropzone /> manual-mode actions', () => {
  const instantAdapter: CloudAdapter = {
    name: 'instant',
    upload: async (file) => ({ url: `https://cdn.example.com/${file.name}` }),
  };

  async function selectFiles(container: HTMLElement, files: File[]) {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await act(async () => {
      fireEvent.change(input);
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  it('renders a custom label', () => {
    render(<Dropzone label="Drop your resume here" />);
    expect(screen.getByText('Drop your resume here')).toBeInTheDocument();
  });

  it('shows an Upload button that uploads the queued files', async () => {
    const onUploadSuccess = vi.fn();
    const { container } = render(
      <Dropzone cloud={instantAdapter} onUploadSuccess={onUploadSuccess} />,
    );
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();

    await selectFiles(container, [makeFile('a.txt', 5, 'text/plain'), makeFile('b.txt', 5, 'text/plain')]);
    const uploadButton = screen.getByRole('button', { name: 'Upload (2)' });

    await act(async () => {
      fireEvent.click(uploadButton);
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(onUploadSuccess).toHaveBeenCalledTimes(2);
    expect(onUploadSuccess.mock.calls[0][0].url).toBe('https://cdn.example.com/a.txt');
    expect(screen.getByRole('button', { name: 'Upload (0)' })).toBeDisabled();
  });

  it('hides the action bar with hideActions or a non-manual mode', async () => {
    const { container, unmount } = render(<Dropzone hideActions />);
    await selectFiles(container, [makeFile('a.txt', 5, 'text/plain')]);
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();
    unmount();

    const auto = render(<Dropzone mode="instant" cloud={instantAdapter} />);
    await selectFiles(auto.container, [makeFile('a.txt', 5, 'text/plain')]);
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();
  });
});

describe('<Dropzone /> form integration', () => {
  const adapter: CloudAdapter = {
    name: 'instant',
    upload: async (file) => ({ url: `https://cdn.example.com/${file.name}` }),
  };

  async function selectFiles(container: HTMLElement, files: File[]) {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await act(async () => {
      fireEvent.change(input);
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  it('submits uploaded file URLs with the surrounding form', async () => {
    const { container } = render(
      <form>
        <Dropzone name="attachments" mode="instant" cloud={adapter} />
      </form>,
    );
    await selectFiles(container, [makeFile('a.png', 5, 'image/png'), makeFile('b.pdf', 5, 'application/pdf')]);
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).getAll('attachments')).toEqual([
      'https://cdn.example.com/a.png',
      'https://cdn.example.com/b.pdf',
    ]);
  });

  it('leaves out files that are not uploaded yet, and supports formValue', async () => {
    const { container } = render(
      <form>
        <Dropzone name="ids" cloud={adapter} formValue={(f) => `id:${f.name}`} />
      </form>,
    );
    await selectFiles(container, [makeFile('a.png', 5, 'image/png')]);
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).getAll('ids')).toEqual([]); // manual mode: not uploaded yet

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Upload (1)' }));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(new FormData(form).getAll('ids')).toEqual(['id:a.png']);
  });

  it('passes capture to the file input', () => {
    const { container } = render(<Dropzone accept="image/*" capture="environment" />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.getAttribute('capture')).toBe('environment');
  });
});
