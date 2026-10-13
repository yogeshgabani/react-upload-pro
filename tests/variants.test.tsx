import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BusinessCRM, MinimalModern } from '../src/variants';
import { makeFile } from './helpers';

async function selectFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: [makeFile('a.txt', 5, 'text/plain')],
    configurable: true,
  });
  await act(async () => {
    fireEvent.change(input);
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('variants in manual mode', () => {
  it('show an Upload button under the file list', async () => {
    const { container } = render(<MinimalModern />);
    await selectFile(container);
    expect(screen.getByRole('button', { name: 'Upload (1)' })).toBeEnabled();
  });

  it('hide it with hideActions or an auto-starting mode', async () => {
    const hidden = render(<MinimalModern hideActions />);
    await selectFile(hidden.container);
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();
    hidden.unmount();

    const auto = render(<MinimalModern mode="auto" />);
    await selectFile(auto.container);
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();
  });

  it('BusinessCRM keeps its own Start button instead of a second one', async () => {
    const { container } = render(<BusinessCRM />);
    await selectFile(container);
    expect(screen.getByRole('button', { name: 'Start upload' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /upload \(/i })).not.toBeInTheDocument();
  });
});
