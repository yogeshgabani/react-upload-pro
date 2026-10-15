<div align="center">

# react-upload-pro

**Drop-in React file upload component — drag & drop, progress bars, previews, retries, image compression, and direct-to-cloud uploads.**

Drag & drop · chunk uploads · cloud adapters · 21+ UI variants · i18n in 23 locales · a11y · SSR-safe · TypeScript-first.

[![npm](https://img.shields.io/npm/v/react-upload-pro.svg?color=4f46e5&style=flat-square)](https://www.npmjs.com/package/react-upload-pro)
[![live demo](https://img.shields.io/badge/live%20demo-playground-ec4899?style=flat-square)](https://react-upload-pro.netlify.app/)
[![types](https://img.shields.io/badge/types-included-3178c6?style=flat-square)](#typescript)
[![license](https://img.shields.io/badge/license-MIT-emerald?style=flat-square)](./LICENSE)
[![bundle](https://img.shields.io/badge/tree--shakable-✓-10b981?style=flat-square)](#performance)

### [▶ Open the live demo & playground](https://react-upload-pro.netlify.app/)

Try every variant and option in the browser, then copy the generated code.

<a href="https://react-upload-pro.netlify.app/">
  <img src="https://raw.githubusercontent.com/yogeshgabani/react-upload-pro/main/.github/assets/demo.png" alt="react-upload-pro playground: four images uploading with thumbnails, progress bars, speed and ETA" width="860" />
</a>

[Live demo](https://react-upload-pro.netlify.app/) · [Quick start](#quick-start-60-seconds-no-backend-needed) · [API reference](https://github.com/yogeshgabani/react-upload-pro/blob/main/docs/API.md) · [Changelog](https://github.com/yogeshgabani/react-upload-pro/blob/main/CHANGELOG.md) · [Report a bug](https://github.com/yogeshgabani/react-upload-pro/issues)

</div>

---

## Table of contents

- [Quick start (60 seconds, no backend needed)](#quick-start-60-seconds-no-backend-needed)
- [Connect your server](#connect-your-server)
- [Why react-upload-pro?](#why-react-upload-pro)
- [Migrating from react-dropzone](#migrating-from-react-dropzone)
- [Install](#install)
- [Import the styles](#import-the-styles)
- [Full sample with comments](#full-sample-with-comments)
- [Step-by-step setup](#step-by-step-setup)
  - [1. Vite + React](#1-vite--react)
  - [2. Next.js (App Router)](#2-nextjs-app-router)
  - [3. Create React App](#3-create-react-app)
- [Tailwind setup (optional)](#tailwind-setup-optional)
- [Core usage](#core-usage)
- [Pre-built variants](#pre-built-variants)
- [Hooks-first usage](#hooks-first-usage)
- [Image compression](#image-compression)
- [Custom upload function (fetch / axios)](#custom-upload-function-fetch--axios)
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

## Quick start (60 seconds, no backend needed)

```bash
npm install react-upload-pro
```

```tsx
import { Dropzone } from "react-upload-pro";
import { createMockAdapter } from "react-upload-pro/cloud";
import "react-upload-pro/styles.css";

// Fake uploads with real progress — swap for your server later.
const mock = createMockAdapter();

export default function App() {
  return (
    <Dropzone
      cloud={mock}
      mode="auto" // start uploading as soon as files are dropped
      accept="image/*,application/pdf"
      maxSize={10 * 1024 * 1024} // 10 MB
      previewable
      onUploadSuccess={(file) => console.log("uploaded", file.url)}
    />
  );
}
```

Drop a few files: you get thumbnails, progress bars, speed, ETA, retry and remove buttons, and a fullscreen preview. Nothing leaves the browser.

> Prefer clicking around first? The [live playground](https://react-upload-pro.netlify.app/) lets you change every option and copy the matching code.

---

## Connect your server

Replace `cloud={mock}` with `endpoint`. Each file is sent as a `multipart/form-data` `POST` with the file in a field named `file`:

```tsx
<Dropzone
  endpoint="/api/upload"
  mode="auto"
  onUploadSuccess={(file) => console.log(file.url)} // read from your JSON response
/>
```

Any backend works. A minimal Express server:

```js
// server.js — npm install express multer
import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const app = express();

app.use("/uploads", express.static("uploads"));
app.post("/api/upload", upload.single("file"), (req, res) => {
  // Return a URL and it shows up as `file.url` on the client.
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(3001);
```

Running Vite on another port? Proxy the API in `vite.config.ts`: `server: { proxy: { "/api": "http://localhost:3001" } }`.

`file.url` is read from `url`, `secure_url`, `location`, `fileUrl` or `file_url` in the JSON response (also when nested under `data`), or from a plain-text response that is itself a URL. The full response is always available as `file.response`.

Next.js route handler, S3 presigned URLs, and other backends are covered in [Step-by-step setup](#step-by-step-setup) and [Cloud adapters](#cloud-adapters).

---

## Why react-upload-pro?

`react-dropzone` stops at "drop files, get a callback". `react-upload-pro` ships everything you need to ship a real upload feature:

|                                                      | react-dropzone    | react-upload-pro            |
| ---------------------------------------------------- | ----------------- | --------------------------- |
| Drag & drop, click to browse, hook API               | ✅                | ✅                          |
| Type / size / count validation                       | ✅                | ✅ + magic-number checks    |
| Uploads to your server with progress, speed, ETA     | ❌ bring your own | ✅                          |
| Retries, pause / resume / cancel, chunked uploads    | ❌                | ✅                          |
| Ready-made UI: file list, previews, progress bars    | ❌                | ✅ 21+ variants             |
| Direct to S3 / Cloudinary / Firebase / Supabase / …  | ❌                | ✅                          |
| Client-side image compression                        | ❌                | ✅                          |
| Built-in translations                                | ❌                | ✅ 23 locales               |

Everything in the box:

- ✅ **Inputs** — drag/drop, click, paste from clipboard, folder upload (recursive)
- ✅ **Upload engine** — `instant` / `manual` / `auto` / `queue` modes, parallel + sequential, chunked, pause / resume / retry / cancel
- ✅ **Cloud adapters** — AWS S3 (presigned), Cloudinary, Firebase Storage, Supabase, DigitalOcean Spaces, Azure Blob, GCS, plus a mock adapter for demos and tests
- ✅ **Image compression** — resize and re-encode JPEG / PNG / WebP in the browser before upload
- ✅ **Validation** — MIME, extension, size (min/max), max files, duplicates, magic-number signatures, custom async validators
- ✅ **Preview** — image / video / audio / PDF / text / Office (icon) with zoom & rotate
- ✅ **Progress** — bar / circle / striped, per-file + aggregate, EWMA speed + ETA
- ✅ **21+ UI variants** across Minimal / Business / Creative / Enterprise / Layouts
- ✅ **a11y** — ARIA roles, keyboard nav, focus rings, RTL
- ✅ **i18n** — 23 built-in locales (en, hi, gu, fr, de, ar, zh, es, pt, ru, ja, ko, it, tr, id, bn, ur, nl, pl, vi, th, he, fa) + custom messages
- ✅ **Theming** — light / dark / auto with CSS variables and a Tailwind preset
- ✅ **Framework agnostic** — works with Axios / Fetch / GraphQL / REST via a [custom upload function](#custom-upload-function-fetch--axios)
- ✅ **Tree-shakeable** — core ships without `framer-motion` or any cloud SDK

---

## Migrating from react-dropzone

`useDropzone` has the same shape — `getRootProps`, `getInputProps`, `isDragActive`, `open`, and the same `accept` object format — so most components move over by changing the import:

```tsx
// Before
import { useDropzone } from "react-dropzone";

// After — same hook, plus uploads, progress and retries
import { useDropzone } from "react-upload-pro";

function Uploader() {
  const { getRootProps, getInputProps, isDragActive, files, start } = useDropzone({
    accept: { "image/*": [".png", ".jpg"] },
    maxSize: 5 * 1024 * 1024,
    endpoint: "/api/upload", // new: where files go
  });

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? "Drop here…" : "Drag files here, or click to select"}
      </div>
      <button onClick={() => start()}>Upload {files.length} files</button>
    </div>
  );
}
```

Differences to know about:

- `onDrop` receives `(accepted: UploadFile[], rejected: ValidationError[])`. Each `UploadFile` wraps the native `File` as `.file` and adds `status`, `progress`, `url`, and more.
- The hook keeps the list of files for you (`files`, `remove`, `removeAll`), so you don't need your own `useState`.
- Uploads start when you call `start()`, or automatically with `mode: "auto"`.

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

## Import the styles

> **You must import the bundled stylesheet exactly once** — otherwise the
> dropzone renders unstyled (no dashed border, no accent color, no layout).

```tsx
// Vite, CRA, Remix, Astro — anywhere with a global entry file
import "react-upload-pro/styles.css";
```

```tsx
// Next.js App Router
// app/layout.tsx
import "react-upload-pro/styles.css";
```

```tsx
// Next.js Pages Router
// pages/_app.tsx
import "react-upload-pro/styles.css";
```

The stylesheet is **self-contained** — it ships every utility class the
components use, so you do **not** need Tailwind, PostCSS, or any extra build
step in your app to get the demo look. If you also use Tailwind in your
project, see [Tailwind setup](#tailwind-setup-optional) below to share design tokens.

---

## Full sample with comments

A complete, copy-paste-ready example. Every prop is annotated so you can see
exactly what each piece does — delete the bits you don't need.

```tsx
// src/components/MyUploader.tsx

// 1️⃣ Core component + a couple of types we'll use in the callbacks.
import {
  Dropzone,
  ThemeProvider,
  I18nProvider,
  type UploadFile,
  type ValidationError,
} from "react-upload-pro";

// 2️⃣ Bundled stylesheet. Import it once at the top level of your app
//    (e.g. main.tsx / layout.tsx) — including it here works too.
import "react-upload-pro/styles.css";

import { useState } from "react";

export default function MyUploader() {
  // Track files that the dropzone rejects (wrong type, too big, etc.) so we
  // can show them in a toast or modal. Optional — leave it out if you don't
  // need rejection UI.
  const [rejected, setRejected] = useState<ValidationError[]>([]);

  return (
    // ThemeProvider gives you light / dark / auto. Wrap once near the root.
    <ThemeProvider defaultTheme="auto">
      {/* I18nProvider translates every internal string. 23 locales built in. */}
      <I18nProvider locale="en">
        <Dropzone
          // ───── Where the files go ─────
          // Pass `endpoint` for a standard multipart POST, OR pass `cloud`
          // (S3 / Cloudinary / Firebase / …) for direct-to-bucket uploads.
          endpoint="/api/upload"

          // ───── Validation ─────
          accept="image/*,application/pdf"     // MIME globs or extensions
          maxSize={10 * 1024 * 1024}           // 10 MB per file
          minSize={1024}                       // 1 KB per file
          maxFiles={5}                         // total file cap
          multiple                             // allow picking many at once
          rejectDuplicates                     // skip identical files
          compressImages                       // shrink big photos before upload

          // ───── Upload behaviour ─────
          mode="auto"          // 'manual' | 'instant' | 'auto' | 'queue'
          strategy="parallel"  // 'parallel' | 'sequential'
          concurrency={3}      // parallel upload slots
          retries={2}          // retry attempts per file on network errors
          chunkSize={5 * 1024 * 1024}  // 5 MB chunks (omit for single-shot)

          // ───── Built-in UI extras ─────
          previewable          // eye icon → fullscreen preview
          editable             // pencil icon → rename + tag
          clipboard            // allow ⌘V / Ctrl+V paste
          scrollAfter={5}      // gallery scrolls after 5 files
          maxHeight="320px"    // height of the scroll region

          // ───── Theming ─────
          // `accent` drives borders, focus rings, progress fill, primary
          // buttons, and hover states. Accepts hex (`'#10b981'`), an RGB
          // triplet (`'16 185 129'`), or any CSS color. Scoped to THIS
          // dropzone — multiple instances on one page can have different
          // accents without leaking globally.
          accent="#10b981"
          accentFg="#ffffff"   // optional — auto-derived from accent when omitted

          // ───── Copy ─────
          label="Drop your files here"
          hint="PNG, JPG, or PDF — up to 10 MB each, max 5 files"

          // ───── Events ─────
          onDrop={(accepted, rejected) =>
            console.log("dropped", { accepted, rejected })
          }
          onDropRejected={setRejected} // collect validation errors for UI
          onUploadStart={(file: UploadFile) =>
            console.log("uploading", file.name)
          }
          onUploadProgress={(file) =>
            console.log(`${file.name}: ${Math.round(file.progress * 100)}%`)
          }
          onUploadSuccess={(file) =>
            console.log("✅ done →", file.url)
          }
          onUploadError={(file, err) =>
            console.error("❌", file.name, err.message)
          }
        />

        {/* Toast/banner for rejected files. Replace with your own UI. */}
        {rejected.length > 0 && (
          <ul style={{ color: "crimson", marginTop: 12 }}>
            {rejected.map((e, i) => (
              <li key={i}>
                {e.file?.name ?? "file"} — {e.message}
              </li>
            ))}
          </ul>
        )}
      </I18nProvider>
    </ThemeProvider>
  );
}
```

**What this gives you out of the box:**

- 🖱️ Drag-drop, click-to-browse, paste from clipboard
- 🧪 Live validation with friendly error messages
- 📊 Per-file progress bars + speed + ETA
- 🔁 Automatic retries with exponential backoff
- 👁️ Fullscreen preview for images, PDFs, video, audio
- ✏️ Inline rename + metadata edit modal
- 🗜️ Big photos resized in the browser before they upload
- 🌗 Light / dark / auto themes with a single prop
- 🌐 23-locale i18n with RTL support

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
import { Dropzone } from "react-upload-pro";
import "react-upload-pro/styles.css";

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

Dropped files wait in the list until the user clicks **Upload** (`mode="manual"`, the default). Add `mode="auto"` to upload as soon as files are dropped. Don't have a server yet? Use [`createMockAdapter()`](#quick-start-60-seconds-no-backend-needed).

### 2. Next.js (App Router)

```bash
npx create-next-app@latest my-app --typescript --app
cd my-app
npm install react-upload-pro
```

```tsx
// app/upload/page.tsx
"use client";

import { Dropzone, ThemeProvider } from "react-upload-pro";
import "react-upload-pro/styles.css";

export default function UploadPage() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Dropzone
        endpoint="/api/upload"
        accept="image/*"
        maxSize={10 * 1024 * 1024}
        mode="auto"
      />
    </ThemeProvider>
  );
}
```

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  // ...save to disk / S3 / Cloudinary / etc.
  return NextResponse.json({ url: "/uploads/" + file.name });
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

## Tailwind setup (optional)

**You only need this section if your own app uses Tailwind** and you want to
re-use `react-upload-pro`'s design tokens (`text-rup-accent`, `bg-rup-bg`,
etc.) in your own components.

> Not using Tailwind? Stop here — `import "react-upload-pro/styles.css"` is
> already enough. The bundled stylesheet ships every utility the components
> need.

Plug in the preset:

```js
// tailwind.config.js
module.exports = {
  presets: [require("react-upload-pro/tailwind")],
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./node_modules/react-upload-pro/dist/**/*.{js,cjs}",
  ],
};
```

Then anywhere in your app:

```tsx
<button className="bg-rup-accent text-rup-accent-fg">Custom button</button>
```

The accent color follows the same `--rup-accent` variable the dropzone uses,
so picking a new accent updates your custom UI too.

---

## Core usage

### Minimum

```tsx
<Dropzone endpoint="/api/upload" />
```

Files are listed with an **Upload** button underneath. Pass `mode="auto"` to skip the button and upload right away.

### Real-world example

```tsx
import { Dropzone, type UploadFile } from "react-upload-pro";
import "react-upload-pro/styles.css";

export function ProfilePictureUploader() {
  return (
    <Dropzone
      endpoint="/api/avatar"
      accept="image/*"
      maxSize={2 * 1024 * 1024} // 2 MB
      maxFiles={1}
      multiple={false}
      mode="instant" // upload immediately on drop
      compressImages={{ maxWidth: 512, maxHeight: 512 }}
      previewable // eye icon → fullscreen preview
      editable // pencil icon → rename + tag
      retries={2}
      onUploadStart={(f: UploadFile) => console.log("uploading", f.name)}
      onUploadSuccess={(f) => console.log("done", f.url)}
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

### Take a photo on mobile

```tsx
// Opens the back camera on phones; desktop browsers show the normal file picker.
<Dropzone endpoint="/api/upload" accept="image/*" capture="environment" />
```

Use `capture="user"` for the front camera (selfies, avatars).

### Manual control with the render prop

```tsx
<Dropzone endpoint="/api/upload" maxSize={5e6}>
  {({ getRootProps, getInputProps, files, start, isUploading }) => (
    <div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-8 rounded-lg"
      >
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

21+ designs grouped into 5 categories. Every variant accepts the same options as `Dropzone`, so any feature works on any look. **[See them all in the live playground →](https://react-upload-pro.netlify.app/)**

```tsx
import {
  MinimalGlass,
  BusinessCRM,
  EnterpriseDocs,
  LayoutModal,
} from "react-upload-pro/variants";

<MinimalGlass endpoint="/api/upload" mode="auto" accent="#6366f1" />;
```

| Category       | Variants                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Minimal**    | `MinimalModern`, `MinimalGlass`, `MinimalNeumorphic`, `MinimalMaterial`, `MinimalInline` |
| **Business**   | `BusinessCRM`, `BusinessDashboard`, `BusinessSaaS`                                       |
| **Creative**   | `CreativeGradient`, `CreativeAnimated`, `CreativePremium`, `CreativeAvatar`              |
| **Enterprise** | `EnterpriseDocs`, `EnterpriseTeam`, `EnterpriseMediaLibrary`, `EnterpriseFullscreen`     |
| **Layouts**    | `LayoutBox`, `LayoutCard`, `LayoutSidebar`, `LayoutModal`, `LayoutFloating`              |

In `manual` mode (the default) each variant shows **Remove all / Upload** buttons under its file list; `hideActions` turns them off. `CreativeAvatar` uploads as soon as a picture is picked.

---

## Hooks-first usage

For full control — no built-in UI, no gallery, just upload state and helpers — use `useDropzone`:

```tsx
import { useDropzone, UploadGallery } from "react-upload-pro";
import "react-upload-pro/styles.css";

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
    removeAll,
  } = useDropzone({
    endpoint: "/api/upload",
    accept: { "image/*": [".png", ".jpg", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    mode: "manual", // wait for explicit start()
    chunkSize: 5 * 1024 * 1024, // 5 MB chunks
    strategy: "parallel",
    concurrency: 3,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? "Drop here…" : "Drop files or click"}
      </div>

      <UploadGallery
        files={files}
        onRemove={(f) => remove(f.id)}
        onRetry={(f) => retry(f.id)}
        onPause={(f) => pause(f.id)}
        onResume={(f) => resume(f.id)}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => start()} disabled={isUploading}>
          Upload
        </button>
        <button onClick={removeAll}>Clear</button>
      </div>
    </div>
  );
}
```

`pause`, `resume`, `retry`, `cancel` and `remove` take a file id. Want the stock buttons instead of your own? Render `<UploadActions files={files} onUpload={start} onRemoveAll={removeAll} />`.

---

## Image compression

Phone photos are often 3–10 MB. Turn on `compressImages` and JPEG / PNG / WebP files are resized and re-encoded in the browser **before** they are validated and uploaded — so a 6 MB photo can still pass `maxSize={2 * 1024 * 1024}`.

```tsx
// Defaults: longest side 1920px, quality 0.8, same format
<Dropzone endpoint="/api/upload" compressImages />

// Or tune it
<Dropzone
  endpoint="/api/upload"
  compressImages={{ maxWidth: 1280, maxHeight: 1280, quality: 0.7, mimeType: "image/webp" }}
/>
```

GIF, SVG, and non-image files pass through untouched, and an image is never replaced by a bigger one. The same logic is available on its own:

```ts
import { compressImage } from "react-upload-pro";

const smaller = await compressImage(file, { maxWidth: 800 });
```

---

## Use inside a form

Give the dropzone a `name` and every uploaded file is submitted with the surrounding `<form>` as a hidden field holding its URL — no `useState`, no `onChange` wiring. It works with plain HTML forms, Next.js Server Actions, and Remix actions.

```ts
// app/profile/actions.ts
"use server";

export async function saveProfile(formData: FormData) {
  const name = formData.get("displayName");
  const photos = formData.getAll("photos"); // → ['https://…/a.jpg', 'https://…/b.jpg']
  // …save to your database
}
```

```tsx
// app/profile/page.tsx
"use client";

import { Dropzone } from "react-upload-pro";
import "react-upload-pro/styles.css";
import { saveProfile } from "./actions";

export default function ProfilePage() {
  return (
    <form action={saveProfile}>
      <input name="displayName" />
      <Dropzone name="photos" endpoint="/api/upload" mode="auto" accept="image/*" />
      <button type="submit">Save</button>
    </form>
  );
}
```

- Only finished uploads are submitted. Use `mode="auto"` so files upload as soon as they're added.
- Submit something other than the URL with `formValue`, e.g. `formValue={(file) => (file.response as { id: string }).id}`.
- Every variant accepts `name` too. With `useDropzone`, render `<UploadFormValue name="photos" files={files} />` inside your form.

---

## Custom upload function (fetch / axios)

Need your own request logic — axios interceptors, GraphQL, a signed URL from your API? Pass any object with an `upload` function as `cloud`. Report progress with `onProgress` and honour `signal` so cancel / pause work:

```tsx
import axios from "axios";
import { Dropzone, type CloudAdapter } from "react-upload-pro";

const axiosUpload: CloudAdapter = {
  name: "axios",
  async upload(file, { onProgress, signal }) {
    const body = new FormData();
    body.append("file", file.file, file.name);
    const res = await axios.post("/api/upload", body, {
      signal,
      onUploadProgress: (e) => onProgress(e.loaded, e.total ?? file.size),
    });
    return { url: res.data.url }; // becomes file.url
  },
};

<Dropzone cloud={axiosUpload} mode="auto" />;
```

To have a failure retried (`retries`), throw `{ code: "network", message: "…", retryable: true }`.

---

## Cloud adapters

Upload directly to your cloud bucket without proxying through your server. Credentials never leave your backend — the adapter just consumes presigned URLs / signed tokens / SAS.

### AWS S3

```tsx
import { useDropzone } from "react-upload-pro";
import { createS3Adapter } from "react-upload-pro/cloud";

const s3 = createS3Adapter({
  getPresignedUrl: async (file) => {
    const res = await fetch("/api/s3/presign", {
      method: "POST",
      body: JSON.stringify({ name: file.name, type: file.type }),
    });
    return res.json(); // { url, method: 'PUT', headers? }
  },
});

useDropzone({ cloud: s3, mode: "auto" });
```

```ts
// /api/s3/presign (Next.js Route Handler example)
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { name, type } = await req.json();
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: name,
    ContentType: type,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  return Response.json({ url, method: "PUT" });
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
  createMockAdapter, // fake uploads for demos, Storybook and tests
} from "react-upload-pro/cloud";
```

Every adapter has the same shape — pass it to `cloud:` on `Dropzone` or `useDropzone`. See [`docs/cloud.md`](https://github.com/yogeshgabani/react-upload-pro/blob/main/docs/cloud.md) for each adapter's options.

`createMockAdapter({ durationMs, failRate })` simulates an upload with real progress, cancel and retry — handy for trying the UI, Storybook stories, and tests.

---

## Validation

```ts
useDropzone({
  accept: { "image/*": [".png", ".jpg"] },
  minSize: 1024, // 1 KB
  maxSize: 5 * 1024 * 1024, // 5 MB
  maxFiles: 10,
  maxTotalSize: 50 * 1024 * 1024, // 50 MB across all files
  imageDimensions: { minWidth: 400, minHeight: 400 }, // pixels
  rejectDuplicates: true, // same name + size + lastModified
  validators: [
    async (file) =>
      file.name.includes(" ")
        ? { code: "custom", message: "No spaces in filename" }
        : null,
  ],
});
```

| Rule              | Rejection `code`                       | Notes                                                                 |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------- |
| `accept`          | `file-invalid-type`                    | MIME globs, extensions, or `{ "image/*": [".png"] }`                  |
| `minSize` / `maxSize` | `file-too-small` / `file-too-large` | Bytes, per file                                                       |
| `maxFiles`        | `too-many-files`                       | Counts files already in the list                                      |
| `maxTotalSize`    | `total-size-exceeded`                  | Bytes, all files combined — including ones added earlier              |
| `imageDimensions` | `image-too-small` / `image-too-large`  | `minWidth`, `minHeight`, `maxWidth`, `maxHeight` in pixels. Checked after `compressImages`; SVG and non-images are skipped |
| `rejectDuplicates`| `duplicate-file`                       |                                                                       |
| `validators`      | whatever you return                    | Sync or async; run after the built-in rules                           |

Every rejection comes with a readable `message`, e.g. *"Image is 200×150px; it must be at least 400×400px."* `getImageSize(file)` is exported too if you need the pixel size yourself.

For security-sensitive flows, validate the real magic number instead of trusting the MIME the browser reports:

```ts
import { detectSignature } from "react-upload-pro";

const actual = await detectSignature(file); // → 'image/png' | 'application/pdf' | ...
if (!actual) throw new Error("unknown file type");
```

### Showing rejection errors as a modal

```tsx
import {
  Dropzone,
  ValidationErrorsModal,
  type ValidationError,
} from "react-upload-pro";
import { useState } from "react";

function App() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  return (
    <>
      <Dropzone endpoint="/api/upload" onDropRejected={setErrors} />
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
import { I18nProvider, Dropzone } from "react-upload-pro";

<I18nProvider locale="ja">
  <Dropzone endpoint="/api/upload" />
</I18nProvider>;
```

### Supported locales

| Code | Language         | RTL |
| ---- | ---------------- | --- |
| `en` | English          |     |
| `es` | Español          |     |
| `fr` | Français         |     |
| `de` | Deutsch          |     |
| `it` | Italiano         |     |
| `pt` | Português        |     |
| `nl` | Nederlands       |     |
| `pl` | Polski           |     |
| `ru` | Русский          |     |
| `tr` | Türkçe           |     |
| `zh` | 中文             |     |
| `ja` | 日本語           |     |
| `ko` | 한국어           |     |
| `vi` | Tiếng Việt       |     |
| `th` | ไทย              |     |
| `id` | Bahasa Indonesia |     |
| `hi` | हिन्दी           |     |
| `gu` | ગુજરાતી          |     |
| `bn` | বাংলা            |     |
| `ar` | العربية          | ✓   |
| `ur` | اردو             | ✓   |
| `he` | עברית            | ✓   |
| `fa` | فارسی            | ✓   |

### Custom messages

Override any string per-locale:

```tsx
<I18nProvider
  locale="en"
  messages={{ dropHere: "Drop your resume here", browse: "Pick a PDF" }}
>
  <Dropzone endpoint="/api/upload" />
</I18nProvider>
```

### Check the RTL set programmatically

```ts
import { rtlLocales } from "react-upload-pro";

const isRtl = rtlLocales.has(currentLocale);
```

---

## Theming

```tsx
import { ThemeProvider, useTheme } from "react-upload-pro";

// defaultTheme: 'light' | 'dark' | 'auto'
<ThemeProvider defaultTheme="auto">
  <Dropzone endpoint="/api/upload" />
</ThemeProvider>;
```

### Custom accent color

```tsx
{/* Hex string — most common */}
<Dropzone endpoint="/api/upload" accent="#10b981" />

{/* RGB triplet (the format CSS variables use internally) */}
<Dropzone endpoint="/api/upload" accent="16 185 129" />

{/* Any CSS color the browser understands */}
<Dropzone endpoint="/api/upload" accent="rebeccapurple" />

{/* With a custom foreground (button text on accent background).
    Auto-derived from luminance when omitted. */}
<Dropzone endpoint="/api/upload" accent="#facc15" accentFg="#000000" />
```

Each `accent` is **scoped to that dropzone instance** — the value is applied
as an inline `--rup-accent` CSS variable on the component's outer wrapper,
so multiple dropzones on the same page can each have their own accent
without leaking globally.

Need the accent to apply page-wide (e.g. share it with your own buttons)?
Set it as a CSS variable on any ancestor:

```css
:root {
  --rup-accent: 16 185 129; /* RGB triplet, no rgb() wrapper */
  --rup-accent-fg: 255 255 255;
}
```

Every variant also accepts the same prop:

```tsx
import { MinimalGlass, BusinessCRM } from "react-upload-pro/variants";

<MinimalGlass accent="#6366f1" endpoint="/api/upload" />
<BusinessCRM accent="#10b981" endpoint="/api/upload" />
```

The accent drives borders, buttons, progress fill, focus rings, hover
states, and scrollbars.

---

## Upload modes & strategies

| Option           | Values                                                         | Default      | Description               |
| ---------------- | -------------------------------------------------------------- | ------------ | ------------------------- |
| `mode`           | `'manual'` &#x7C; `'instant'` &#x7C; `'auto'` &#x7C; `'queue'` | `'manual'`   | When to start uploading   |
| `strategy`       | `'parallel'` &#x7C; `'sequential'`                             | `'parallel'` | How to dispatch the queue |
| `concurrency`    | number                                                         | `3`          | Parallel upload slots     |
| `retries`        | number                                                         | `2`          | Retry attempts per file   |
| `retryBackoffMs` | number                                                         | `500`        | Doubles each retry        |
| `chunkSize`      | number (bytes)                                                 | unset        | Single-shot if unset      |

### Mode cheat sheet

- **`manual`** — files queue up; the user clicks the built-in **Upload** button (or you call `start()`)
- **`instant`** — each file starts uploading the moment it's dropped
- **`auto`** — like `instant`, but waits 100 ms so several quick drops or pastes start as one batch
- **`queue`** — starts automatically and uploads strictly one at a time, in drop order, ignoring `concurrency`

---

## Props reference

### `<Dropzone>` (most common)

| Prop               | Type                                         | Notes                                                              |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------ |
| `endpoint`         | `string`                                     | URL for the multipart `POST`. Use `cloud:` for direct-to-S3 etc.   |
| `cloud`            | `CloudAdapter`                               | Direct cloud upload or a custom upload function                    |
| `accept`           | `string` &#x7C; `Accept`                     | `"image/*"`, `".pdf,.docx"`, or `{ 'image/*': ['.png'] }`          |
| `maxSize`          | `number`                                     | Bytes                                                              |
| `minSize`          | `number`                                     | Bytes                                                              |
| `maxFiles`         | `number`                                     |                                                                    |
| `maxTotalSize`     | `number`                                     | Bytes, all files combined. See [Validation](#validation)           |
| `imageDimensions`  | `{ minWidth?, minHeight?, maxWidth?, maxHeight? }` | Pixels. See [Validation](#validation)                        |
| `multiple`         | `boolean`                                    | Default `true`                                                     |
| `directory`        | `boolean`                                    | Folder upload (recursive)                                          |
| `clipboard`        | `boolean`                                    | Paste from clipboard. Default `true`                               |
| `capture`          | `boolean` &#x7C; `'user'` &#x7C; `'environment'` | Open the phone camera. See [Take a photo on mobile](#take-a-photo-on-mobile) |
| `rejectDuplicates` | `boolean`                                    | Default `false`                                                    |
| `compressImages`   | `boolean` &#x7C; `ImageCompressionOptions`   | Resize JPEG / PNG / WebP before upload. See [Image compression](#image-compression) |
| `disabled`         | `boolean`                                    |                                                                    |
| `mode`             | `'manual' \| 'instant' \| 'auto' \| 'queue'` | Default `'manual'`                                                 |
| `strategy`         | `'parallel' \| 'sequential'`                 | Default `'parallel'`                                               |
| `concurrency`      | `number`                                     | Default `3`                                                        |
| `retries`          | `number`                                     | Default `2`                                                        |
| `chunkSize`        | `number`                                     | Bytes. Unset = single-shot upload                                  |
| `label`            | `ReactNode`                                  | Main line of text in the drop area                                 |
| `hint`             | `ReactNode`                                  | Small descriptive line under the label                             |
| `hideActions`      | `boolean`                                    | Hide the Upload / Remove all buttons shown in `manual` mode        |
| `hideGallery`      | `boolean`                                    | Hide the built-in file list                                        |
| `name`             | `string`                                     | Submit uploaded file URLs with the surrounding `<form>`. See [Use inside a form](#use-inside-a-form) |
| `formValue`        | `(file) => string \| undefined`              | What to submit per file when `name` is set. Default `file.url`     |
| `galleryLayout`    | `'list' \| 'grid' \| 'table' \| 'compact'`   | Default `'list'`                                                   |
| `previewable`      | `boolean`                                    | Eye icon → fullscreen preview                                      |
| `editable`         | `boolean`                                    | Pencil icon → rename + tag + describe                              |
| `scrollAfter`      | `number`                                     | List becomes scrollable above this count                           |
| `maxHeight`        | `string`                                     | CSS height of the scrollable region                                |
| `width` / `height` | `string`                                     | Outer container CSS sizing                                         |
| `accent`           | `string`                                     | Hex / RGB triplet / CSS color. Scoped to this instance.            |
| `accentFg`         | `string`                                     | Foreground on accent surfaces. Auto-derived from `accent`.         |
| `onDrop`           | `(accepted, rejected) => void`               |                                                                    |
| `onDropRejected`   | `(errors) => void`                           |                                                                    |
| `onUploadStart`    | `(file) => void`                             |                                                                    |
| `onUploadProgress` | `(file) => void`                             | `file.progress` is 0..1; also `file.speed`, `file.eta`             |
| `onUploadSuccess`  | `(file) => void`                             | `file.url` and `file.response` are set                             |
| `onUploadError`    | `(file, error) => void`                      |                                                                    |
| `onAllComplete`    | `(files) => void`                            | Every file finished (success, error, or cancelled)                 |

### Full API surface

- **Components** — `Dropzone`, `UploadArea`, `UploadActions`, `UploadFormValue`, `UploadButton`, `UploadProgress`, `UploadPreview`, `UploadGallery`, `UploadModal`, `FilePreviewModal`, `FileEditModal`, `ValidationErrorsModal`
- **Hooks** — `useDropzone`, `useUploader`, `useUploadQueue`, `useUploadProgress`, `useFilePreview`
- **Providers** — `ThemeProvider`, `I18nProvider`
- **Core** — `UploadQueue`, `validateFile`, `validateBatch`, `matchesAccept`
- **Cloud (subpath)** — `createS3Adapter`, `createCloudinaryAdapter`, `createFirebaseStorageAdapter`, `createSupabaseAdapter`, `createDigitalOceanAdapter`, `createAzureBlobAdapter`, `createGcsAdapter`, `createMockAdapter`
- **Variants (subpath)** — 21 named exports (see [Pre-built variants](#pre-built-variants))
- **Utilities** — `compressImage`, `getImageSize`, `formatBytes`, `formatSpeed`, `formatEta`, `formatPercent`, `getFileCategory`, `detectSignature`, `wrapFile`, `generatePreview`, `revokePreview`, `cn`
- **i18n exports** — `translations`, `rtlLocales`, type `Locale`, type `Translations`

See [`docs/API.md`](https://github.com/yogeshgabani/react-upload-pro/blob/main/docs/API.md) for the full reference.

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
  ImageCompressionOptions,
  Locale,
  Theme,
} from "react-upload-pro";
```

---

## SSR / Next.js notes

- Every public surface is **SSR-safe** — DOM APIs are only touched inside `useEffect`.
- The package emits a `"use client"` directive, so importing from a server component works transparently. Pages that render `Dropzone` directly still need `'use client'` at the top.
- The base CSS (`react-upload-pro/styles.css`) is plain CSS — import it once in your root layout.

```tsx
// app/layout.tsx
import "react-upload-pro/styles.css";
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
git clone https://github.com/yogeshgabani/react-upload-pro.git
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
```

The playground (`npm run dev`, or the hosted version at [react-upload-pro.netlify.app](https://react-upload-pro.netlify.app/)) is the fastest way to explore the API — every prop is wired to a UI control and the generated code updates live as you tweak.

PRs welcome — please:

1. Open an issue first for non-trivial changes
2. Add a test for new behavior
3. Run `npm run typecheck && npm test` before pushing

If this library saves you time, a ⭐ on [GitHub](https://github.com/yogeshgabani/react-upload-pro) helps other developers find it.

---

## Changelog

Every release is documented in [`CHANGELOG.md`](https://github.com/yogeshgabani/react-upload-pro/blob/main/CHANGELOG.md) — features
added, bugs fixed, breaking changes called out. The [live playground](https://react-upload-pro.netlify.app/) also has
a "Version history" panel under the variant gallery so you can review the
release timeline right from the demo.

---

## License

[MIT](./LICENSE) © 2026 Yogesh Gabani
