/** A gallery file that is a PDF rather than an image. */
export function isPdf(src: string): boolean {
  return /\.pdf$/i.test(src);
}

/**
 * A PDF's first-page preview: rendered by the Studio (pdf.js) and saved
 * beside the file as `<name>.pdf.png`. The gallery shows this, never the
 * PDF's other pages. Mirrors pdfPreviewSrc() in studio/ui/fields.js.
 */
export function pdfPreviewSrc(src: string): string {
  return `${src}.png`;
}
