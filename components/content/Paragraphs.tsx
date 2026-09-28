/**
 * Body text from the Studio is plain text: an empty line between two
 * sentences starts a new paragraph, the way it would in any writing app. A
 * single line break just flows into the same paragraph, as HTML already does.
 * Returns the paragraphs, trimmed, with empty ones dropped.
 */
export function splitParagraphs(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n[ \t]*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
}

/**
 * A field's text as one <p> per paragraph, all with the same class. Each
 * carries `data-para`, which blueprint.css uses to space a paragraph from the
 * one before it, so a field that has always been one paragraph renders
 * exactly as it did.
 */
export function Paragraphs({ text, className }: { text: string | undefined | null; className?: string }) {
  return (
    <>
      {splitParagraphs(text).map((paragraph, index) => (
        <p className={className} data-para="" key={index}>{paragraph}</p>
      ))}
    </>
  );
}
