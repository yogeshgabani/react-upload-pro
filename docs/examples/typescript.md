# TypeScript example

```tsx
import {
  useDropzone,
  type DropzoneOptions,
  type UploadFile,
  type UploadError,
} from 'react-upload-pro';

const options: DropzoneOptions = {
  endpoint: '/api/upload',
  accept: { 'image/*': ['.png', '.jpg', '.webp'] },
  maxSize: 5 * 1024 * 1024,
  maxFiles: 10,
  rejectDuplicates: true,
  mode: 'auto',
  retries: 3,
  validators: [
    async (file: File) =>
      file.name.length > 200 ? { code: 'custom', message: 'Name too long' } : null,
  ],
  onUploadSuccess: (file: UploadFile) => {
    console.log('uploaded', file.id, file.response);
  },
  onUploadError: (file: UploadFile, error: UploadError) => {
    console.error('failed', file.name, error.message);
  },
};

export function Uploader() {
  const { getRootProps, getInputProps, files } = useDropzone(options);
  // …
}
```
