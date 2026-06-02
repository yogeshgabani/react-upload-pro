import type { CloudAdapter } from '../types';
import { createS3Adapter, type S3AdapterOptions } from './s3';

/**
 * DigitalOcean Spaces is S3-compatible, so this is a thin re-export.
 * Use createS3Adapter under the hood with a Spaces presigned URL endpoint.
 */
export function createDigitalOceanAdapter(opts: S3AdapterOptions): CloudAdapter {
  const inner = createS3Adapter(opts);
  return { ...inner, name: 'digitalocean-spaces' };
}
