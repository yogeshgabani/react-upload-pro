import type { UploadFile } from '../types';

export interface UploadFormValueProps {
  /** Form field name. Every uploaded file adds one hidden input with this name. */
  name: string;
  files: UploadFile[];
  /**
   * What to submit for each uploaded file. Default: `file.url`. Return
   * `undefined` to leave a file out.
   */
  formValue?: (file: UploadFile) => string | undefined;
}

const defaultFormValue = (file: UploadFile) => file.url;

/**
 * Hidden inputs that put successfully uploaded files into the surrounding
 * `<form>`, so a plain form post, a Next.js Server Action, or a Remix action
 * receives them without any client-side state:
 *
 *   formData.getAll('attachments'); // → ['https://…/a.png', 'https://…/b.pdf']
 *
 * `<Dropzone name="…">` and every variant render this for you.
 */
export function UploadFormValue({ name, files, formValue = defaultFormValue }: UploadFormValueProps) {
  return (
    <>
      {files.map((file) => {
        if (file.status !== 'success') return null;
        const value = formValue(file);
        if (value === undefined) return null;
        return <input key={file.id} type="hidden" name={name} value={value} />;
      })}
    </>
  );
}
