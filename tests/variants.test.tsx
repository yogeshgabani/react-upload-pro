import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BusinessCRM, CreativeAvatar, MinimalModern } from '../src/variants';
import { makeFile } from './helpers';

async function selectFile(container: HTMLElement, file = makeFile('a.txt', 5, 'text/plain')) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: [file],
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

describe('variants in a form', () => {
  it('submit uploaded file URLs when name is set', async () => {
    const adapter = {
      name: 'instant',
      upload: async (file: { name: string }) => ({ url: `https://cdn.example.com/${file.name}` }),
    };
    for (const Variant of [MinimalModern, CreativeAvatar]) {
      const { container, unmount } = render(
        <form>
          <Variant name="photo" mode="instant" cloud={adapter} />
        </form>,
      );
      // An image, because CreativeAvatar only accepts image/* by default.
      await selectFile(container, makeFile('me.png', 5, 'image/png'));
      const form = container.querySelector('form') as HTMLFormElement;
      expect(new FormData(form).getAll('photo')).toEqual(['https://cdn.example.com/me.png']);
      unmount();
    }
  });
});
