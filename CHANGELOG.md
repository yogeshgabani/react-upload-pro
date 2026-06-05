# Changelog

All notable changes to **react-upload-pro** are documented here. This project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — `MAJOR.MINOR.PATCH`.

The same release notes are mirrored inside the live playground (`npm run dev`)
under the "Version history" panel.

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
- [ ] Built-in image cropping / rotation
- [ ] React 19 `useActionState` integration
- [ ] Edge runtime cloud adapters (Cloudflare R2, Vercel Blob)
- [ ] Headless `<Dropzone.Root>` / `<Dropzone.Item>` composition API
- [ ] More locales (Swahili, Tagalog, Tamil)

---

[unreleased]: https://github.com/react-upload-pro/react-upload-pro/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/react-upload-pro/react-upload-pro/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/react-upload-pro/react-upload-pro/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/react-upload-pro/react-upload-pro/releases/tag/v0.1.0
