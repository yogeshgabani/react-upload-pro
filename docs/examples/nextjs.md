# Next.js example (App Router)

```tsx
// app/upload/page.tsx
'use client';

import { Dropzone, ThemeProvider } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export default function Page() {
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
import { NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const path = join(process.cwd(), 'tmp', file.name);
  await writeFile(path, buf);
  return NextResponse.json({ ok: true, name: file.name });
}
```

## With S3 presigning

```ts
// app/api/s3/presign/route.ts
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3 = new S3Client({ region: 'us-east-1' });

export async function POST(req: Request) {
  const { name, type } = await req.json();
  const presigned = await createPresignedPost(s3, {
    Bucket: process.env.AWS_BUCKET!,
    Key: `uploads/${Date.now()}-${name}`,
    Conditions: [['content-length-range', 0, 50 * 1024 * 1024]],
    Fields: { 'Content-Type': type },
    Expires: 60,
  });
  return NextResponse.json({ url: presigned.url, method: 'POST', fields: presigned.fields });
}
```

```tsx
// app/upload/client.tsx
'use client';
import { useDropzone } from 'react-upload-pro';
import { createS3Adapter } from 'react-upload-pro/cloud';

const s3 = createS3Adapter({
  getPresignedUrl: (file) =>
    fetch('/api/s3/presign', { method: 'POST', body: JSON.stringify({ name: file.name, type: file.type }) })
      .then((r) => r.json()),
});

export function Uploader() {
  const { getRootProps, getInputProps, files } = useDropzone({ cloud: s3, mode: 'auto' });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      Drop files
      <pre>{JSON.stringify(files.map((f) => ({ name: f.name, status: f.status })), null, 2)}</pre>
    </div>
  );
}
```
