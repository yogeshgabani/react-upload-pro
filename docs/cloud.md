# Cloud adapters

All adapters share the same `CloudAdapter` interface so you can swap providers without rewriting your UI. The library never bundles cloud SDKs — adapters use plain `XMLHttpRequest` against presigned URLs / signed tokens.

## AWS S3 (and S3-compatible like MinIO)

```ts
import { createS3Adapter } from 'react-upload-pro/cloud';

const s3 = createS3Adapter({
  getPresignedUrl: async (file) => {
    const res = await fetch('/api/s3/presign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
    });
    return res.json();
    // → { url, method?: 'PUT' | 'POST', headers?, fields? }
  },
  buildPublicUrl: (file, url) => url.split('?')[0],
});
```

For multipart uploads, generate one presigned URL **per part** server-side and use `getUploadToken` together with `chunkSize`.

## Cloudinary

```ts
import { createCloudinaryAdapter } from 'react-upload-pro/cloud';

// Unsigned preset
const cloudinary = createCloudinaryAdapter({
  cloudName: 'demo',
  uploadPreset: 'unsigned_uploads',
  folder: 'user-uploads',
});

// Signed (server-side signature)
createCloudinaryAdapter({
  cloudName: 'demo',
  getSignature: async (file) => {
    const res = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      body: JSON.stringify({ public_id: file.name }),
    });
    return res.json(); // { signature, timestamp, apiKey, ... }
  },
});
```

## Firebase Storage

```ts
import { createFirebaseStorageAdapter } from 'react-upload-pro/cloud';

const firebase = createFirebaseStorageAdapter({
  bucket: 'my-app.appspot.com',
  getIdToken: () => firebaseAuth.currentUser!.getIdToken(),
  buildPath: (file) => `uploads/${userId}/${file.name}`,
});
```

## Supabase Storage

```ts
import { createSupabaseAdapter } from 'react-upload-pro/cloud';

const supabase = createSupabaseAdapter({
  projectUrl: 'https://xyz.supabase.co',
  bucket: 'avatars',
  getToken: () => supabaseClient.auth.getSession().then((s) => s.data.session!.access_token),
  upsert: true,
});
```

## DigitalOcean Spaces

Spaces is S3-compatible, so the adapter is a thin wrapper:

```ts
import { createDigitalOceanAdapter } from 'react-upload-pro/cloud';

createDigitalOceanAdapter({
  getPresignedUrl: async (file) => {
    const res = await fetch('/api/do/presign', { method: 'POST', body: JSON.stringify({ key: file.name }) });
    return res.json();
  },
});
```

## Azure Blob Storage

```ts
import { createAzureBlobAdapter } from 'react-upload-pro/cloud';

const azure = createAzureBlobAdapter({
  getSasUrl: async (file) => {
    const res = await fetch('/api/azure/sas?name=' + encodeURIComponent(file.name));
    return (await res.json()).url; // container URL with SAS token
  },
});
```

## Google Cloud Storage

```ts
import { createGcsAdapter } from 'react-upload-pro/cloud';

const gcs = createGcsAdapter({
  getSignedUrl: async (file) => {
    const res = await fetch('/api/gcs/sign', {
      method: 'POST',
      body: JSON.stringify({ name: file.name, type: file.type }),
    });
    return (await res.json()).url;
  },
});
```

## Wiring the adapter

```tsx
import { useDropzone } from 'react-upload-pro';

useDropzone({
  cloud: s3,
  mode: 'auto',
  onUploadSuccess: (file) => console.log('uploaded to', file.response),
});
```
