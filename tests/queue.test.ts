import { describe, expect, it } from 'vitest';
import { UploadQueue } from '../src/core/queue';
import { wrapFile } from '../src/utils';
import { makeFile } from './helpers';

describe('UploadQueue', () => {
  it('adds and emits updates', () => {
    const q = new UploadQueue();
    let received: number = -1;
    q.subscribe((files) => {
      received = files.length;
    });
    q.add([wrapFile(makeFile('a', 10))]);
    expect(received).toBe(1);
  });

  it('removes files', () => {
    const q = new UploadQueue();
    const f = wrapFile(makeFile('a', 10));
    q.add([f]);
    q.remove(f.id);
    expect(q.getFiles()).toHaveLength(0);
  });

  it('removeAll clears the queue', () => {
    const q = new UploadQueue();
    q.add([wrapFile(makeFile('a', 1)), wrapFile(makeFile('b', 1))]);
    q.removeAll();
    expect(q.getFiles()).toHaveLength(0);
  });

  it('reorders files', () => {
    const q = new UploadQueue();
    const a = wrapFile(makeFile('a', 1));
    const b = wrapFile(makeFile('b', 1));
    const c = wrapFile(makeFile('c', 1));
    q.add([a, b, c]);
    q.reorder(0, 2);
    expect(q.getFiles().map((f) => f.name)).toEqual(['b', 'c', 'a']);
  });

  it('renames a file', () => {
    const q = new UploadQueue();
    const f = wrapFile(makeFile('a', 1));
    q.add([f]);
    q.rename(f.id, 'renamed');
    expect(q.getFiles()[0]?.name).toBe('renamed');
  });

  it('sets metadata additively', () => {
    const q = new UploadQueue();
    const f = wrapFile(makeFile('a', 1), { tags: ['x'] });
    q.add([f]);
    q.setMetadata(f.id, { category: 'docs' });
    const meta = q.getFiles()[0]?.metadata ?? {};
    expect(meta.tags).toEqual(['x']);
    expect(meta.category).toBe('docs');
  });
});
