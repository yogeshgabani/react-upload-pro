import { useMemo } from 'react';
import type { UploadFile } from '../types';

export interface AggregateProgress {
  total: number;
  uploaded: number;
  progress: number;
  speed: number;
  eta: number;
  uploading: number;
  completed: number;
  errored: number;
  pending: number;
}

/** Aggregate progress across a list of files. Pure function — no state. */
export function useUploadProgress(files: UploadFile[]): AggregateProgress {
  return useMemo(() => {
    let total = 0;
    let uploaded = 0;
    let speed = 0;
    let uploading = 0;
    let completed = 0;
    let errored = 0;
    let pending = 0;

    for (const f of files) {
      total += f.size;
      uploaded += f.bytesUploaded;
      if (f.status === 'uploading') {
        uploading += 1;
        speed += f.speed;
      } else if (f.status === 'success') {
        completed += 1;
      } else if (f.status === 'error' || f.status === 'cancelled') {
        errored += 1;
      } else {
        pending += 1;
      }
    }

    const progress = total > 0 ? uploaded / total : 0;
    const remaining = total - uploaded;
    const eta = speed > 0 ? remaining / speed : Infinity;

    return { total, uploaded, progress, speed, eta, uploading, completed, errored, pending };
  }, [files]);
}
