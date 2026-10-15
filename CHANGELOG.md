# Changelog

All notable changes to **react-upload-pro** are documented here. This project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — `MAJOR.MINOR.PATCH`.

The same release notes are mirrored inside the live playground (`npm run dev`)
under the "Version history" panel.

---

## 0.2.0 — 2026-10-13

### Added

- **`compressImages` option** on `Dropzone`, `useDropzone`, and every
  variant. Resizes and re-encodes JPEG / PNG / WebP in the browser before
  validation and upload (defaults: longest side 1920px, quality 0.8, same
  format). Pass an object to tune `maxWidth`, `maxHeight`, `quality`, and
  `mimeType`. GIF, SVG, and other files pass through untouched, and an image
  is never replaced by a bigger one. Also exported as `compressImage(file, options)`.
- **`createMockAdapter()`** in `react-upload-pro/cloud` — fake uploads with
  real progress, cancel, and retry, so you can try the UI with no backend and
  use it in Storybook or tests.
- **Upload / Remove all buttons in `manual` mode.** `Dropzone` and every
  variant with a file list now show them under the list (`BusinessCRM` keeps
  its own Start button). Hide them with `hideActions`. Also exported as the
  standalone `<UploadActions>` component for hook users.
- **`file.url`** on every successful upload — taken from the cloud adapter
  result, from `url` / `secure_url` / `location` / `fileUrl` / `file_url`
  in a JSON response (also nested under `data`), or a plain-text URL body.
- **`name` prop for forms** on `Dropzone` and every variant. Each
  successful upload adds a hidden `<input name={name} value={file.url}>`, so
  a plain form post, a Next.js Server Action, or a Remix action gets the
  URLs via `formData.getAll(name)`. Change what's submitted with
  `formValue`. Also exported as `<UploadFormValue>` for hook users.
- **`maxTotalSize` option** — a limit on the combined size of every file in
  the list, including ones added earlier. Files over it are rejected with
  `total-size-exceeded`.
- **`imageDimensions` option** — `minWidth`, `minHeight`, `maxWidth`,
  `maxHeight` in pixels. Rejects with `image-too-small` / `image-too-large`
  and a message like "Image is 120×90px; it must be at least 200×200px."
  Checked after `compressImages`. Images the browser can't decode (SVG,
  HEIC) and non-images are not checked. Also exported as `getImageSize(file)`.
- **`capture` option** — open the phone camera instead of the file picker
  (`'user'`, `'environment'`, or `true`). Ignored on desktop.
- **`label` prop** on `Dropzone` and `UploadArea`.
- **`isUploading`** and **`isDragActive`** (react-dropzone-style alias of
  `isDragging`) on `useDropzone`.
- New `upload` translation key in all 23 locales.

### Changed

- `CreativeAvatar` defaults to `mode: 'instant'`, since it has no file list
  to put an Upload button in. Pass `mode` to override.

### Fixed

- `concurrency` is now respected when files are added while an upload is
  already running (e.g. several drops in `instant` mode used to start
  `concurrency` extra uploads each time).
- `mode: 'queue'` now starts automatically and uploads one file at a time,
  as documented. It previously behaved like `manual`.
- `mode: 'auto'` now waits 100 ms so quick successive drops start as one
  batch, as documented. It previously behaved exactly like `instant`.
- Removing a file while it was uploading could stop the rest of the queue
  from uploading when an `onUploadSuccess` / `onUploadError` callback was set.
- Object-form `accept` (`{ 'image/*': ['.png'] }`) now also filters the
  native file picker; previously only validation used it.
- CommonJS consumers now get the `.d.cts` type declarations through
  `exports`, and `react-upload-pro/package.json` is exported.
- `.rup-scrollbar` looked different per browser: Chromium 121+ ignored the
  custom `::-webkit-scrollbar` styling and drew its own scrollbar (with
  arrow buttons on Windows). Chromium and Safari now get the rounded 8px
  accent thumb, and Firefox gets the matching `scrollbar-color`.
- npm `homepage`, `repository`, and `bugs` links pointed to a GitHub
  organisation that doesn't exist. They now point to the live demo and
  `github.com/yogeshgabani/react-upload-pro`.

### Docs

- README: live demo link and screenshot, a no-backend quick start, an
  Express server example, a "Migrating from react-dropzone" section, and
  sections for image compression, form submission, the camera, validation
  rules, and custom upload functions. Examples that used non-existent APIs
  (`isUploading`, `isDragActive`, `clear`, `pause()` without an id,
  `onUploadProgress(file, progress)`) are fixed.
- Live playground: page description, favicon, and a social-preview image
  for links shared on X, LinkedIn, Slack, WhatsApp, and so on.

---

## 0.1.2 — 2026-06-05

### Added

- **`accent` prop on every variant + `Dropzone`.** Pass a hex string
  (`'#10b981'`), an RGB triplet (`'16 185 129'`), or any CSS color and the
  variant's border, focus ring, progress fill, primary buttons, and hover
  states all update to match. The value is applied as an inline
  `--rup-accent` CSS variable on the variant's outer wrapper, so it stays
  scoped to that instance — multiple dropzones on the same page can each
  have their own accent without leaking globally.
- **`accentFg` prop** — companion to `accent`, controls the foreground color
  used on top of accent surfaces (e.g. primary button text). Auto-derived
  from `accent` via relative luminance when omitted, so white text shows on
  dark accents and near-black on light ones.
- **`:root` CSS-variable defaults** in the bundled stylesheet. Consumers who
  don't wrap their app in `<ThemeProvider>` now still get the full accent /
  border / hover look out of the box. Uses `:where(:root)` for zero
  specificity so any consumer-level override (`:root { --rup-accent: … }`)
  still wins, and includes an `@media (prefers-color-scheme: dark)` block
  for automatic dark colors.

### Internal

- New `normalizeColorInput()` helper in `src/variants/types.ts` parses hex /
  triplet / CSS color values into Tailwind's RGB-triplet form.
- Playground's "Get the code" panel now emits the `accent` prop in the
  generated snippet when the user picks a non-default color.

---

## 0.1.1 — 2026-06-05

### Fixed

- **Bundled CSS is now self-contained.** Previously `dist/styles.css` shipped
  only the CSS variables, which meant consumers who didn't already have
  Tailwind installed saw the dropzone render unstyled. The build now runs
  Tailwind CLI against the package source and ships every utility class the
  components use, so `import "react-upload-pro/styles.css"` is all that's
  needed to get the demo look in any project (Vite, Next.js, CRA, Remix,
  Astro…).
- Disabled Tailwind's `preflight` reset in the bundled stylesheet so the
  package no longer overrides the consumer's box-sizing, margin, or
  heading styles.

### Internal

- New `tailwind.lib.config.cjs` and `src/theme/lib.css` drive the bundled
  CSS build.
- `tsup.config.ts` now spawns Tailwind CLI in its `onSuccess` hook instead of
  copying the bare variable file.

---

## 0.1.0 — 2026-06-01

Initial public release. 🎉

### Components

- `Dropzone` — the all-in-one drop-in component with built-in gallery,
  progress, preview, and edit modals
- `UploadArea`, `UploadButton`, `UploadGallery`, `UploadProgress`,
  `UploadPreview`, `UploadModal`, `FilePreviewModal`, `FileEditModal`,
  `ValidationErrorsModal`

### Hooks

- `useDropzone`, `useUploader`, `useUploadQueue`, `useUploadProgress`,
  `useFilePreview`

### Upload engine

- Four modes: `manual` (wait for `start()`), `instant` (upload on drop),
  `auto` (debounced burst), `queue` (one at a time, in order)
- Two strategies: `parallel` (configurable concurrency) and `sequential`
- Chunked uploads with `pause` / `resume` / `retry` / `cancel`
- Exponential-backoff retries with per-file overrides
- EWMA speed + ETA tracking for accurate progress UI

### Validation

- MIME globs, extension lists, magic-number signature detection
- Min / max file size, max file count, duplicate detection
- Custom synchronous and asynchronous validators
- Virus-scan hook for security-sensitive flows

### Cloud adapters

Direct-to-bucket uploads — credentials never leave your backend:

- AWS S3 (presigned URLs)
- Cloudinary
- Firebase Storage
- Supabase Storage
- DigitalOcean Spaces
- Azure Blob (SAS tokens)
- Google Cloud Storage

### UI variants (20+)

Five categories, each option works on every variant:

- **Minimal** — `MinimalModern`, `MinimalGlass`, `MinimalNeumorphic`,
  `MinimalMaterial`, `MinimalInline`
- **Business** — `BusinessCRM`, `BusinessDashboard`, `BusinessSaaS`
- **Creative** — `CreativeGradient`, `CreativeAnimated`, `CreativePremium`,
  `CreativeAvatar`
- **Enterprise** — `EnterpriseDocs`, `EnterpriseTeam`,
  `EnterpriseMediaLibrary`, `EnterpriseFullscreen`
- **Layouts** — `LayoutBox`, `LayoutCard`, `LayoutSidebar`, `LayoutModal`,
  `LayoutFloating`

### Internationalization

- 23 built-in locales: `en`, `es`, `fr`, `de`, `it`, `pt`, `nl`, `pl`, `ru`,
  `tr`, `zh`, `ja`, `ko`, `vi`, `th`, `id`, `hi`, `gu`, `bn`, `ar`, `ur`,
  `he`, `fa`
- RTL-aware rendering for Arabic, Urdu, Hebrew, Farsi
- Per-string overrides via `messages` prop

### Theming

- Light / dark / auto modes via `ThemeProvider`
- CSS variables for every design token (`--rup-accent`, `--rup-border`, …)
- Optional Tailwind preset to share tokens with your own components

### Accessibility

- ARIA roles + labels on every interactive element
- Full keyboard navigation (Tab, Enter, Space, Esc)
- Visible focus rings tied to the accent color
- Drag-and-drop is just one input method — keyboard and click also work
- Screen-reader announcements for upload state changes

### Developer experience

- TypeScript-first — every public API has `.d.ts`
- ESM + CJS dual emit with separate type declarations
- Tree-shakable — `framer-motion` and cloud SDKs are not loaded until used
- SSR-safe — DOM APIs only touched inside `useEffect`
- Emits `"use client"` so Next.js App Router can import it from server
  components
- Storybook for every component
- Vitest unit tests + Playwright e2e smoke tests

---

## Roadmap (unreleased)

These items are tracked for future releases — feedback and PRs welcome:

- [ ] Resumable uploads via tus protocol
- [ ] Built-in image cropping / rotation (resizing shipped in 0.2.0 as `compressImages`)
- [ ] React 19 `useActionState` integration
- [ ] Edge runtime cloud adapters (Cloudflare R2, Vercel Blob)
- [ ] Headless `<Dropzone.Root>` / `<Dropzone.Item>` composition API
- [ ] More locales (Swahili, Tagalog, Tamil)

---

[unreleased]: https://github.com/yogeshgabani/react-upload-pro/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yogeshgabani/react-upload-pro/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/yogeshgabani/react-upload-pro/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/yogeshgabani/react-upload-pro/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/yogeshgabani/react-upload-pro/releases/tag/v0.1.0
