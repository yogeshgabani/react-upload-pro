export function makeFile(
  name: string,
  sizeOrContent: number | string,
  type = 'application/octet-stream',
  lastModified = 0,
): File {
  const content =
    typeof sizeOrContent === 'number' ? new Uint8Array(sizeOrContent) : sizeOrContent;
  return new File([content], name, { type, lastModified });
}
