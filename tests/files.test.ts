import { describe, expect, it } from 'vitest';
import { detectSignature, fileKey, getFileCategory, wrapFile } from '../src/utils';
import { makeFile } from './helpers';

describe('wrapFile', () => {
  it('produces a stable shape', () => {
    const w = wrapFile(makeFile('a.png', 10, 'image/png'));
    expect(w.id).toBeTruthy();
    expect(w.name).toBe('a.png');
    expect(w.size).toBe(10);
    expect(w.status).toBe('idle');
    expect(w.progress).toBe(0);
    expect(w.attempts).toBe(0);
  });
});

describe('fileKey', () => {
  it('uses name+size+lastModified', () => {
    const a = makeFile('foo', 100, 'text/plain', 42);
    const b = makeFile('foo', 100, 'text/plain', 42);
    expect(fileKey(a)).toBe(fileKey(b));
  });
});

describe('getFileCategory', () => {
  it('detects images, videos, audio, pdf', () => {
    expect(getFileCategory(makeFile('a.png', 1, 'image/png'))).toBe('image');
    expect(getFileCategory(makeFile('a.mp4', 1, 'video/mp4'))).toBe('video');
    expect(getFileCategory(makeFile('a.mp3', 1, 'audio/mpeg'))).toBe('audio');
    expect(getFileCategory(makeFile('a.pdf', 1, 'application/pdf'))).toBe('pdf');
  });
  it('falls back to extension for office files', () => {
    expect(getFileCategory(makeFile('doc.docx', 1, ''))).toBe('office');
    expect(getFileCategory(makeFile('a.zip', 1, ''))).toBe('archive');
  });
});

describe('detectSignature', () => {
  it('recognizes PNG header', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0]);
    const file = new File([png], 'a.png', { type: '' });
    expect(await detectSignature(file)).toBe('image/png');
  });
  it('recognizes PDF header', async () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const file = new File([pdf], 'a.pdf', { type: '' });
    expect(await detectSignature(file)).toBe('application/pdf');
  });
});
