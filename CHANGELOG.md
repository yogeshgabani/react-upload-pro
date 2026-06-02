# Changelog

## 0.1.0 — 2026-06-01

Initial release.

- Core: `Dropzone`, `useDropzone`, `useUploader`, `useUploadQueue`, `useUploadProgress`, `useFilePreview`
- Components: `UploadArea`, `UploadButton`, `UploadProgress`, `UploadPreview`, `UploadGallery`, `UploadModal`, `FilePreviewModal`
- Upload engine: instant / manual / auto / queue modes; parallel / sequential strategies; chunked uploads; pause / resume / retry / cancel with exponential backoff
- Validation: MIME, extension, min/max size, max files, duplicate detection, magic-number signatures, custom async validators, virus-scan hook
- Cloud adapters: AWS S3, Cloudinary, Firebase Storage, Supabase Storage, DigitalOcean Spaces, Azure Blob, Google Cloud Storage
- 20+ pre-built UI variants across Minimal / Business / Creative / Enterprise / Layouts
- i18n in en / hi / gu / fr / de / ar / zh (RTL-aware)
- Theme system with light / dark / auto + CSS variables and Tailwind preset
- a11y: ARIA roles, keyboard navigation, focus rings, RTL support
- SSR-safe; ESM + CJS; works with React 17/18/19
