<div align="center">

# react-upload-pro

**The most feature-rich React file upload & dropzone library.**

Drag & drop · chunk uploads · cloud adapters · 21+ UI variants · i18n in 23 locales · a11y · SSR-safe · TypeScript-first.

[![npm](https://img.shields.io/npm/v/react-upload-pro.svg?color=4f46e5&style=flat-square)](https://www.npmjs.com/package/react-upload-pro)
[![types](https://img.shields.io/badge/types-included-3178c6?style=flat-square)](#typescript)
[![license](https://img.shields.io/badge/license-MIT-emerald?style=flat-square)](./LICENSE)
[![bundle](https://img.shields.io/badge/tree--shakable-✓-10b981?style=flat-square)](#performance)

</div>

---

## Table of contents

- [Why react-upload-pro?](#why-react-upload-pro)
- [Install](#install)
- [30-second example](#30-second-example)
- [Step-by-step setup](#step-by-step-setup)
  - [1. Vite + React](#1-vite--react)
  - [2. Next.js (App Router)](#2-nextjs-app-router)
  - [3. Create React App](#3-create-react-app)
- [Tailwind setup](#tailwind-setup)
- [Core usage](#core-usage)
- [Pre-built variants](#pre-built-variants)
- [Hooks-first usage](#hooks-first-usage)
- [Cloud adapters](#cloud-adapters)
- [Validation](#validation)
- [Internationalization (i18n)](#internationalization-i18n)
- [Theming](#theming)
- [Upload modes & strategies](#upload-modes--strategies)
- [Props reference](#props-reference)
- [TypeScript](#typescript)
- [SSR / Next.js notes](#ssr--nextjs-notes)
- [Performance](#performance)
- [Contributing / development](#contributing--development)
- [License](#license)

---

## Why react-upload-pro?

`react-dropzone` stops at "drop files, get a callback". `react-upload-pro` ships everything you need to ship a real upload feature:

- ✅ **Inputs** — drag/drop, click, paste from clipboard, folder upload (recursive)
- ✅ **Upload engine** — `instant` / `manual` / `auto` / `queue` modes, parallel + sequential, chunked, pause / resume / retry / cancel
- ✅ **Cloud adapters** — AWS S3 (presigned), Cloudinary, Firebase Storage, Supabase, DigitalOcean Spaces, Azure Blob, GCS
- ✅ **Validation** — MIME, extension, size (min/max), max files, duplicates, magic-number signatures, custom async validators
- ✅ **Preview** — image / video / audio / PDF / text / Office (icon) with zoom & rotate
- ✅ **Progress** — bar / circle / striped, per-file + aggregate, EWMA speed + ETA
- ✅ **21+ UI variants** across Minimal / Business / Creative / Enterprise / Layouts
- ✅ **a11y** — ARIA roles, keyboard nav, focus rings, RTL
- ✅ **i18n** — 23 built-in locales (en, hi, gu, fr, de, ar, zh, es, pt, ru, ja, ko, it, tr, id, bn, ur, nl, pl, vi, th, he, fa) + custom messages
- ✅ **Theming** — light / dark / auto with CSS variables and a Tailwind preset
- ✅ **Framework agnostic** — works with Axios / Fetch / GraphQL / REST via custom `getUploadToken`
- ✅ **Tree-shakeable** — core ships without `framer-motion` or any cloud SDK

---

## Install

```bash
# npm
npm install react-upload-pro

# yarn
yarn add react-upload-pro

# pnpm
pnpm add react-upload-pro

# bun
bun add react-upload-pro
```

Peer deps: `react >= 17`, `react-dom >= 17`. `framer-motion` is optional (only some animated variants need it).

---

## 30-second example

```tsx
import { Dropzone, ThemeProvider } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export default function App() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Dropzone
        endpoint="/api/upload"
        accept="image/*,application/pdf"
        maxSize={10 * 1024 * 1024}     // 10 MB
        maxFiles={20}
        mode="auto"
        retries={3}
        onUploadSuccess={(file) => console.log('done', file)}
        onUploadError={(file, err) => console.error(err)}
      />
    </ThemeProvider>
  );
}
```

That's it. The component handles drag/drop, validation, progress bars, retries, previews, and gallery rendering.

---

## Step-by-step setup

### 1. Vite + React

```bash
# 1. Create a Vite app
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install

# 2. Install the package
npm install react-upload-pro
```

```tsx
// src/App.tsx
import { Dropzone } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <Dropzone endpoint="/api/upload" maxSize={5 * 1024 * 1024} />
    </div>
  );
}
```

```bash
npm run dev   # → http://localhost:5173
```

### 2. Next.js (App Router)

```bash
npx create-next-app@latest my-app --typescript --app
cd my-app
npm install react-upload-pro
```

```tsx
// app/upload/page.tsx
'use client';

import { Dropzone, ThemeProvider } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export default function UploadPage() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Dropzone
        endpoint="/api/upload"
        accept="image/*"
        maxSize={10 * 1024 * 1024}
      />
    </ThemeProvider>
  );
}
```

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  // ...save to disk / S3 / Cloudinary / etc.
  return NextResponse.json({ url: '/uploads/' + file.name });
}
```

> **Why `'use client'`?** The component uses browser APIs (drag events, `File`, `FileReader`). The package emits a `"use client"` banner, so importing from a server component works — but pages that render it directly need the directive.

### 3. Create React App

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install react-upload-pro
```

Same `src/App.tsx` as the Vite example — CRA just works.

---

## Tailwind setup

If you use Tailwind, plug in the preset to pick up `react-upload-pro`'s CSS variables and utilities:

```js
// tailwind.config.js
module.exports = {
  presets: [require('react-upload-pro/tailwind')],
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './node_modules/react-upload-pro/dist/**/*.{js,cjs}',
  ],
};
```

Then import the base styles **once** (e.g. in your root layout / `main.tsx`):

```ts
import 'react-upload-pro/styles.css';
```

Not using Tailwind? You can skip the preset and just import the CSS — everything still works, the preset only matters if you want to extend the design tokens.

---

## Core usage

### Minimum

```tsx
<Dropzone endpoint="/api/upload" />
```

### Real-world example

```tsx
import { Dropzone, type UploadFile } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export function ProfilePictureUploader() {
  return (
    <Dropzone
      endpoint="/api/avatar"
      accept="image/*"
      maxSize={2 * 1024 * 1024}        // 2 MB
      maxFiles={1}
      multiple={false}
      mode="instant"                    // upload immediately on drop
      previewable                       // eye icon → fullscreen preview
      editable                          // pencil icon → rename + tag
      retries={2}
      onUploadStart={(f: UploadFile) => console.log('uploading', f.name)}
      onUploadSuccess={(f) => console.log('done', f.url)}
      onUploadError={(f, e) => alert(e.message)}
    />
  );
}
```

### Custom label / hint

```tsx
<Dropzone
  endpoint="/api/upload"
  label="Drop your resume here"
  hint="PDF or DOCX, up to 5 MB"
/>
```

### Manual control with the render prop

```tsx
<Dropzone endpoint="/api/upload" maxSize={5e6}>
  {({ getRootProps, getInputProps, files, start, isUploading }) => (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed p-8 rounded-lg">
        <input {...getInputProps()} />
        Drop files or click
      </div>
      <p>{files.length} queued</p>
      <button onClick={() => start()} disabled={isUploading}>
        Upload
      </button>
    </div>
  )}
</Dropzone>
```

---

## Pre-built variants

21+ designs grouped into 5 categories. Every variant accepts the same options as `Dropzone`, so any feature works on any look.

```tsx
import { MinimalGlass, BusinessCRM, EnterpriseDocs, LayoutModal }
  from 'react-upload-pro/variants';

<MinimalGlass endpoint="/api/upload" accent="#6366f1" />
```

| Category | Variants |
| --- | --- |
| **Minimal** | `MinimalModern`, `MinimalGlass`, `MinimalNeumorphic`, `MinimalMaterial`, `MinimalInline` |
| **Business** | `BusinessCRM`, `BusinessDashboard`, `BusinessSaaS` |
| **Creative** | `CreativeGradient`, `CreativeAnimated`, `CreativePremium`, `CreativeAvatar` |
| **Enterprise** | `EnterpriseDocs`, `EnterpriseTeam`, `EnterpriseMediaLibrary`, `EnterpriseFullscreen` |
| **Layouts** | `LayoutBox`, `LayoutCard`, `LayoutSidebar`, `LayoutModal`, `LayoutFloating` |

Try them all live in the playground: `npm run dev` after cloning.

---

## Hooks-first usage

For full control — no built-in UI, no gallery, just upload state and helpers — use `useDropzone`:

```tsx
import { useDropzone, UploadGallery } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

function MyUploader() {
  const {
    getRootProps,
    getInputProps,
    files,
    isUploading,
    isDragActive,
    start,
    pause,
    resume,
    remove,
    retry,
    clear,
  } = useDropzone({
    endpoint: '/api/upload',
    accept: { 'image/*': ['.png', '.jpg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    mode: 'manual',                    // wait for explicit start()
    chunkSize: 5 * 1024 * 1024,        // 5 MB chunks
    strategy: 'parallel',
    concurrency: 3,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? 'Drop here…' : 'Drop files or click'}
      </div>

      <UploadGallery
        files={files}
        onRemove={(f) => remove(f.id)}
        onRetry={(f) => retry(f.id)}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => start()} disabled={isUploading}>Upload</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={clear}>Clear</button>
      </div>
    </div>
  );
}
```

---

## Cloud adapters

Upload directly to your cloud bucket without proxying through your server. Credentials never leave your backend — the adapter just consumes presigned URLs / signed tokens / SAS.

### AWS S3

```tsx
import { useDropzone } from 'react-upload-pro';
import { createS3Adapter } from 'react-upload-pro/cloud';

const s3 = createS3Adapter({
  getPresignedUrl: async (file) => {
    const res = await fetch('/api/s3/presign', {
      method: 'POST',
      body: JSON.stringify({ name: file.name, type: file.type }),
    });
    return res.json(); // { url, method: 'PUT', headers? }
  },
});

useDropzone({ cloud: s3, mode: 'auto' });
```

```ts
// /api/s3/presign (Next.js Route Handler example)
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { name, type } = await req.json();
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: name,
    ContentType: type,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  return Response.json({ url, method: 'PUT' });
}
```

### Other adapters

```ts
import {
  createCloudinaryAdapter,
  createFirebaseStorageAdapter,
  createSupabaseAdapter,
  createDigitalOceanAdapter,
  createAzureBlobAdapter,
  createGcsAdapter,
} from 'react-upload-pro/cloud';
```

Every adapter has the same shape — pass it to `cloud:` on `Dropzone` or `useDropzone`.

---

## Validation

```ts
useDropzone({
  accept: { 'image/*': ['.png', '.jpg'] },
  minSize: 1024,                      // 1 KB
  maxSize: 5 * 1024 * 1024,           // 5 MB
  maxFiles: 10,
  rejectDuplicates: true,             // same name + size + lastModified
  validators: [
    async (file) =>
      file.name.includes(' ')
        ? { code: 'custom', message: 'No spaces in filename' }
        : null,
  ],
});
```

For security-sensitive flows, validate the real magic number instead of trusting the MIME the browser reports:

```ts
import { detectSignature } from 'react-upload-pro';

const actual = await detectSignature(file); // → 'image/png' | 'application/pdf' | ...
if (!actual) throw new Error('unknown file type');
```

### Showing rejection errors as a modal

```tsx
import { Dropzone, ValidationErrorsModal, type ValidationError } from 'react-upload-pro';
import { useState } from 'react';

function App() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  return (
    <>
      <Dropzone
        endpoint="/api/upload"
        onDropRejected={setErrors}
      />
      <ValidationErrorsModal
        open={errors.length > 0}
        errors={errors}
        onClose={() => setErrors([])}
      />
    </>
  );
}
```

---

## Internationalization (i18n)

23 built-in locales — wrap with `I18nProvider` and the dropzone UI translates automatically:

```tsx
import { I18nProvider, Dropzone } from 'react-upload-pro';

<I18nProvider locale="ja">
  <Dropzone endpoint="/api/upload" />
</I18nProvider>;
```

### Supported locales

| Code | Language | RTL |
| --- | --- | --- |
| `en` | English | |
| `es` | Español | |
| `fr` | Français | |
| `de` | Deutsch | |
| `it` | Italiano | |
| `pt` | Português | |
| `nl` | Nederlands | |
| `pl` | Polski | |
| `ru` | Русский | |
| `tr` | Türkçe | |
| `zh` | 中文 | |
| `ja` | 日本語 | |
| `ko` | 한국어 | |
| `vi` | Tiếng Việt | |
| `th` | ไทย | |
| `id` | Bahasa Indonesia | |
| `hi` | हिन्दी | |
| `gu` | ગુજરાતી | |
| `bn` | বাংলা | |
| `ar` | العربية | ✓ |
| `ur` | اردو | ✓ |
| `he` | עברית | ✓ |
| `fa` | فارسی | ✓ |

### Custom messages

Override any string per-locale:

```tsx
<I18nProvider
  locale="en"
  messages={{ dropHere: 'Drop your resume here', browse: 'Pick a PDF' }}
>
  <Dropzone endpoint="/api/upload" />
</I18nProvider>;
```

### Check the RTL set programmatically

```ts
import { rtlLocales } from 'react-upload-pro';

const isRtl = rtlLocales.has(currentLocale);
```

---

## Theming

```tsx
import { ThemeProvider, useTheme } from 'react-upload-pro';

<ThemeProvider defaultTheme="auto">  {/* 'light' | 'dark' | 'auto' */}
  <Dropzone endpoint="/api/upload" />
</ThemeProvider>;
```

### Custom accent color

```tsx
<Dropzone endpoint="/api/upload" accent="#10b981" />
```

Or via CSS variable on any ancestor:

```css
:root {
  --rup-accent: 16 185 129;  /* RGB triplet, no rgb() wrapper */
}
```

The accent drives buttons, progress, focus rings, and scrollbars.

---

## Upload modes & strategies

| Option | Values | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'manual'` &#x7C; `'instant'` &#x7C; `'auto'` &#x7C; `'queue'` | `'manual'` | When to start uploading |
| `strategy` | `'parallel'` &#x7C; `'sequential'` | `'parallel'` | How to dispatch the queue |
| `concurrency` | number | `3` | Parallel upload slots |
| `retries` | number | `2` | Retry attempts per file |
| `retryBackoffMs` | number | `500` | Doubles each retry |
| `chunkSize` | number (bytes) | unset | Single-shot if unset |

### Mode cheat sheet

- **`manual`** — files queue up; user clicks an "Upload" button to start
- **`instant`** — each file starts uploading the moment it's dropped
- **`auto`** — same as `instant`, but adds a small debounce so multi-drop bursts batch nicely
- **`queue`** — strictly one at a time, in drop order, ignoring `concurrency`

---

## Props reference

### `<Dropzone>` (most common)

| Prop | Type | Notes |
| --- | --- | --- |
| `endpoint` | `string` | URL for the multipart `POST`. Use `cloud:` for direct-to-S3 etc. |
| `cloud` | `CloudAdapter` | Direct cloud upload (mutually exclusive with `endpoint`) |
| `accept` | `string` &#x7C; `Accept` | `"image/*"`, `".pdf,.docx"`, or `{ 'image/*': ['.png'] }` |
| `maxSize` | `number` | Bytes |
| `minSize` | `number` | Bytes |
| `maxFiles` | `number` | |
| `multiple` | `boolean` | Default `true` |
| `directory` | `boolean` | Folder upload (recursive) |
| `clipboard` | `boolean` | Paste from clipboard. Default `true` |
| `rejectDuplicates` | `boolean` | Default `false` |
| `disabled` | `boolean` | |
| `mode` | `'manual' \| 'instant' \| 'auto' \| 'queue'` | Default `'manual'` |
| `strategy` | `'parallel' \| 'sequential'` | Default `'parallel'` |
| `concurrency` | `number` | Default `3` |
| `retries` | `number` | Default `2` |
| `chunkSize` | `number` | Bytes. Unset = single-shot upload |
| `label` | `ReactNode` | Replaces the default heading |
| `hint` | `ReactNode` | Small descriptive line under the label |
| `previewable` | `boolean` | Eye icon → fullscreen preview |
| `editable` | `boolean` | Pencil icon → rename + tag + describe |
| `scrollAfter` | `number` | List becomes scrollable above this count |
| `maxHeight` | `string` | CSS height of the scrollable region |
| `width` / `height` | `string` | Outer container CSS sizing |
| `onDrop` | `(accepted, rejected) => void` | |
| `onDropRejected` | `(errors) => void` | |
| `onUploadStart` | `(file) => void` | |
| `onUploadProgress` | `(file, progress) => void` | |
| `onUploadSuccess` | `(file) => void` | |
| `onUploadError` | `(file, error) => void` | |

### Full API surface

- **Components** — `Dropzone`, `UploadArea`, `UploadButton`, `UploadProgress`, `UploadPreview`, `UploadGallery`, `UploadModal`, `FilePreviewModal`, `FileEditModal`, `ValidationErrorsModal`
- **Hooks** — `useDropzone`, `useUploader`, `useUploadQueue`, `useUploadProgress`, `useFilePreview`
- **Providers** — `ThemeProvider`, `I18nProvider`
- **Core** — `UploadQueue`, `validateFile`, `validateBatch`, `matchesAccept`
- **Cloud (subpath)** — `createS3Adapter`, `createCloudinaryAdapter`, `createFirebaseStorageAdapter`, `createSupabaseAdapter`, `createDigitalOceanAdapter`, `createAzureBlobAdapter`, `createGcsAdapter`
- **Variants (subpath)** — 21 named exports (see [Pre-built variants](#pre-built-variants))
- **Utilities** — `formatBytes`, `formatSpeed`, `formatEta`, `formatPercent`, `getFileCategory`, `detectSignature`, `wrapFile`, `generatePreview`, `revokePreview`, `cn`
- **i18n exports** — `translations`, `rtlLocales`, type `Locale`, type `Translations`

See [`docs/API.md`](./docs/API.md) for the full reference (when published).

---

## TypeScript

Fully typed — every public API has `.d.ts`. The package exports both ESM and CJS with separate type declarations so it works in any modern bundler.

```ts
import type {
  DropzoneOptions,
  DropzoneState,
  UploadFile,
  UploadStatus,
  ValidationError,
  CloudAdapter,
  Locale,
  Theme,
} from 'react-upload-pro';
```

---

## SSR / Next.js notes

- Every public surface is **SSR-safe** — DOM APIs are only touched inside `useEffect`.
- The package emits a `"use client"` directive, so importing from a server component works transparently. Pages that render `Dropzone` directly still need `'use client'` at the top.
- The base CSS (`react-upload-pro/styles.css`) is plain CSS — import it once in your root layout.

```tsx
// app/layout.tsx
import 'react-upload-pro/styles.css';
```

---

## Performance

- Default render path is **O(n)** on file count.
- For galleries beyond a few hundred files, use `scrollAfter={N}` to cap the rendered region. For thousands of files, virtualize with your own list library — the gallery layout is intentionally pluggable.
- `previewUrl` is lazily generated and **automatically revoked** on remove / unmount, so no object-URL leaks.
- Core is tree-shakeable. `framer-motion` and cloud SDKs are not imported until you opt in.

---

## Contributing / development

```bash
git clone https://github.com/react-upload-pro/react-upload-pro
cd react-upload-pro
npm install

# 🎮 Interactive playground — every variant, every option, live code preview
npm run dev          # → http://localhost:5173

# Other scripts
npm run dev:lib      # tsup --watch — rebuild library on every save
npm run storybook    # individual component stories on :6006
npm test             # vitest unit + component
npm run test:e2e     # playwright smoke
npm run build        # tsup → dist/ (ESM + CJS + .d.ts)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

The playground at `npm run dev` is the fastest way to explore the API — every prop is wired to a UI control and the generated code updates live as you tweak.

PRs welcome — please:
1. Open an issue first for non-trivial changes
2. Add a test for new behavior
3. Run `npm run typecheck && npm run lint && npm test` before pushing

---

## License

[MIT](./LICENSE) © Yogesh Gabani
