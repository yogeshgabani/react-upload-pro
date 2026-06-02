import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dropzone } from '../src/components/Dropzone';
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
