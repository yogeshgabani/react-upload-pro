import { describe, expect, it } from 'vitest';
import { compressImage } from '../src/utils';
import { makeFile } from './helpers';

// jsdom can't decode images, so these cover the pass-through paths. Real
// resizing is exercised in the browser via the playground.
describe('compressImage', () => {
  it('returns non-image files untouched', async () => {
    const file = makeFile('notes.txt', 10, 'text/plain');
    expect(await compressImage(file)).toBe(file);
  });

  it('returns GIF and SVG files untouched', async () => {
    const gif = makeFile('anim.gif', 10, 'image/gif');
    const svg = makeFile('logo.svg', 10, 'image/svg+xml');
    expect(await compressImage(gif)).toBe(gif);
    expect(await compressImage(svg)).toBe(svg);
  });

  it('falls back to the original when the browser cannot decode it', async () => {
    const file = makeFile('photo.jpg', 10, 'image/jpeg');
    expect(await compressImage(file, { maxWidth: 100 })).toBe(file);
  });
});
