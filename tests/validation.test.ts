import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateBatch, validateFile, matchesAccept } from '../src/core/validation';
import { fileKey } from '../src/utils';
import { makeFile } from './helpers';

describe('matchesAccept', () => {
  it('accepts everything when list is empty', () => {
    expect(matchesAccept(makeFile('a.png', 1, 'image/png'), [])).toBe(true);
  });

  it('matches exact MIME', () => {
    expect(matchesAccept(makeFile('a.png', 1, 'image/png'), ['image/png'])).toBe(true);
    expect(matchesAccept(makeFile('a.gif', 1, 'image/gif'), ['image/png'])).toBe(false);
  });

  it('matches wildcard MIME', () => {
    expect(matchesAccept(makeFile('a.gif', 1, 'image/gif'), ['image/*'])).toBe(true);
    expect(matchesAccept(makeFile('a.pdf', 1, 'application/pdf'), ['image/*'])).toBe(false);
  });

  it('matches by extension', () => {
    expect(matchesAccept(makeFile('a.PDF', 1, ''), ['.pdf'])).toBe(true);
    expect(matchesAccept(makeFile('a.txt', 1, ''), ['.pdf'])).toBe(false);
  });
});

describe('validateFile', () => {
  it('flags files that are too large', async () => {
    const err = await validateFile(makeFile('a', 100), { maxSize: 50 });
    expect(err?.code).toBe('file-too-large');
  });

  it('flags files that are too small', async () => {
    const err = await validateFile(makeFile('a', 10), { minSize: 50 });
    expect(err?.code).toBe('file-too-small');
  });

  it('flags invalid type', async () => {
    const err = await validateFile(makeFile('a.pdf', 1, 'application/pdf'), { accept: 'image/*' });
    expect(err?.code).toBe('file-invalid-type');
  });

  it('runs custom validators', async () => {
    const err = await validateFile(makeFile('a', 10), {
      validators: [() => ({ code: 'custom', message: 'nope' })],
    });
    expect(err?.code).toBe('custom');
  });
});

describe('validateBatch', () => {
  it('respects maxFiles across existing+new', async () => {
    const result = await validateBatch(
      [makeFile('a', 1), makeFile('b', 1)],
      { maxFiles: 2 },
      1,
    );
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.code).toBe('too-many-files');
  });

  it('detects duplicates against existing files', async () => {
    const existing = makeFile('foo', 100, 'text/plain', 42);
    const dup = makeFile('foo', 100, 'text/plain', 42);
    const result = await validateBatch(
      [dup],
      { rejectDuplicates: true },
      1,
      new Set([fileKey(existing)]),
    );
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected[0]?.code).toBe('duplicate-file');
  });

  it('detects duplicates within the same batch', async () => {
    const a = makeFile('foo', 100, 'text/plain', 42);
    const b = makeFile('foo', 100, 'text/plain', 42);
    const result = await validateBatch([a, b], { rejectDuplicates: true });
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
  });
});

describe('maxTotalSize', () => {
  it('accepts files until the combined size would pass the limit', async () => {
    const files = [makeFile('a', 40), makeFile('b', 40), makeFile('c', 40)];
    const { accepted, rejected } = await validateBatch(files, { maxTotalSize: 100 });
    expect(accepted.map((f) => f.name)).toEqual(['a', 'b']);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.code).toBe('total-size-exceeded');
    expect(rejected[0]?.file?.name).toBe('c');
  });

  it('counts bytes already in the list', async () => {
    const { accepted, rejected } = await validateBatch(
      [makeFile('a', 30)],
      { maxTotalSize: 100 },
      1,
      new Set(),
      80,
    );
    expect(accepted).toHaveLength(0);
    expect(rejected[0]?.code).toBe('total-size-exceeded');
  });

  it('does not count files rejected for other reasons', async () => {
    const files = [makeFile('big', 90), makeFile('ok', 60)];
    const { accepted, rejected } = await validateBatch(files, { maxSize: 80, maxTotalSize: 100 });
    expect(accepted.map((f) => f.name)).toEqual(['ok']);
    expect(rejected.map((r) => r.code)).toEqual(['file-too-large']);
  });
});

describe('imageDimensions', () => {
  // jsdom can't decode images; fake createImageBitmap with the size encoded
  // in the file name ("200x100.png").
  beforeEach(() => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async (file: File) => {
        const match = /^(\d+)x(\d+)/.exec(file.name);
        if (!match) throw new Error('cannot decode');
        return { width: Number(match[1]), height: Number(match[2]), close: () => undefined };
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const png = (name: string) => makeFile(name, 10, 'image/png');

  it('rejects images below the minimum', async () => {
    const error = await validateFile(png('120x90.png'), {
      imageDimensions: { minWidth: 200, minHeight: 200 },
    });
    expect(error?.code).toBe('image-too-small');
    expect(error?.message).toBe('Image is 120×90px; it must be at least 200×200px.');
  });

  it('rejects images above the maximum', async () => {
    const error = await validateFile(png('5000x3000.png'), { imageDimensions: { maxWidth: 4000 } });
    expect(error?.code).toBe('image-too-large');
    expect(error?.message).toBe('Image is 5000×3000px; it must be at most 4000px wide.');
  });

  it('accepts images inside the limits', async () => {
    const error = await validateFile(png('800x600.png'), {
      imageDimensions: { minWidth: 200, maxWidth: 1000, minHeight: 200, maxHeight: 1000 },
    });
    expect(error).toBeNull();
  });

  it('skips non-images and images the browser cannot decode', async () => {
    const limits = { imageDimensions: { minWidth: 200 } };
    expect(await validateFile(makeFile('doc.pdf', 10, 'application/pdf'), limits)).toBeNull();
    expect(await validateFile(makeFile('logo.svg', 10, 'image/svg+xml'), limits)).toBeNull();
    expect(await validateFile(png('broken.png'), limits)).toBeNull();
  });
});
