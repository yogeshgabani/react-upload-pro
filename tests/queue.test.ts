import { describe, expect, it } from 'vitest';
import { UploadQueue, extractUrl } from '../src/core/queue';
import type { CloudAdapter } from '../src/types';
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

/** Adapter whose uploads stay open until `finish()` is called. */
function makeControlledAdapter() {
  let active = 0;
  let maxActive = 0;
  const pending: Array<() => void> = [];
  const adapter: CloudAdapter = {
    name: 'controlled',
    upload: (file) =>
      new Promise((resolve) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        pending.push(() => {
          active -= 1;
          resolve({ url: `https://cdn.example.com/${file.name}` });
        });
      }),
  };
  return {
    adapter,
    get maxActive() {
      return maxActive;
    },
    finishAll: async () => {
      while (pending.length) {
        pending.shift()!();
        await flush();
      }
    },
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('UploadQueue upload modes', () => {
  it('respects concurrency across repeated drops in instant mode', async () => {
    const ctl = makeControlledAdapter();
    const q = new UploadQueue({ mode: 'instant', concurrency: 2, cloud: ctl.adapter });
    q.add([wrapFile(makeFile('a', 1)), wrapFile(makeFile('b', 1))]);
    q.add([wrapFile(makeFile('c', 1)), wrapFile(makeFile('d', 1))]);
    q.add([wrapFile(makeFile('e', 1))]);
    await flush();
    await ctl.finishAll();
    expect(ctl.maxActive).toBe(2);
    expect(q.getFiles().every((f) => f.status === 'success')).toBe(true);
  });

  it("starts automatically and uploads one at a time in 'queue' mode", async () => {
    const ctl = makeControlledAdapter();
    const q = new UploadQueue({ mode: 'queue', concurrency: 3, cloud: ctl.adapter });
    q.add([wrapFile(makeFile('a', 1)), wrapFile(makeFile('b', 1)), wrapFile(makeFile('c', 1))]);
    await flush();
    expect(q.getFiles()[0]?.status).toBe('uploading');
    await ctl.finishAll();
    expect(ctl.maxActive).toBe(1);
    expect(q.getFiles().every((f) => f.status === 'success')).toBe(true);
  });

  it("does not start on its own in 'manual' mode", async () => {
    const ctl = makeControlledAdapter();
    const q = new UploadQueue({ cloud: ctl.adapter });
    q.add([wrapFile(makeFile('a', 1))]);
    await flush();
    expect(q.getFiles()[0]?.status).toBe('idle');
  });

  it('sets file.url from the adapter result', async () => {
    const ctl = makeControlledAdapter();
    const q = new UploadQueue({ mode: 'instant', cloud: ctl.adapter });
    q.add([wrapFile(makeFile('photo.png', 1))]);
    await flush();
    await ctl.finishAll();
    expect(q.getFiles()[0]?.url).toBe('https://cdn.example.com/photo.png');
  });

  it('keeps draining the queue when a file is removed mid-upload', async () => {
    const ctl = makeControlledAdapter();
    const q = new UploadQueue(
      { mode: 'instant', concurrency: 1, cloud: ctl.adapter },
      { onUploadSuccess: () => undefined },
    );
    const a = wrapFile(makeFile('a', 1));
    q.add([a, wrapFile(makeFile('b', 1))]);
    await flush();
    q.remove(a.id);
    await ctl.finishAll();
    await ctl.finishAll();
    expect(q.getFiles().map((f) => [f.name, f.status])).toEqual([['b', 'success']]);
  });
});

describe('extractUrl', () => {
  it.each([
    [{ url: 'https://x.dev/a.png' }, 'https://x.dev/a.png'],
    [{ secure_url: 'https://res.cloudinary.com/a.png' }, 'https://res.cloudinary.com/a.png'],
    [{ location: 'https://bucket.s3.amazonaws.com/a.png' }, 'https://bucket.s3.amazonaws.com/a.png'],
    [{ data: { fileUrl: '/uploads/a.png' } }, '/uploads/a.png'],
    ['https://x.dev/a.png\n', 'https://x.dev/a.png'],
    ['OK', undefined],
    [{ id: 1 }, undefined],
    [null, undefined],
  ])('extracts %j', (response, expected) => {
    expect(extractUrl(response)).toBe(expected);
  });
});
