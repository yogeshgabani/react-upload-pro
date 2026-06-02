import { describe, expect, it } from 'vitest';
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
