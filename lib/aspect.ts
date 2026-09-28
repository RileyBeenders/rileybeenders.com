import type { ImageAspect } from "@/types/resume";

/** The gallery's frame when an image doesn't choose one. */
export const DEFAULT_ASPECT = 4 / 3;

/**
 * A gallery image's frame shape as width ÷ height: "16:9" → 1.78, unset →
 * 4:3. "original" has no fixed shape and returns null — the image draws at
 * its own proportions. Mirrors frameRatio() in studio/ui/fields.js, which the
 * Studio's aligner uses so a crop lined up there lands the same here.
 */
export function aspectRatio(aspect: ImageAspect | undefined): number | null {
  if (aspect === "original") return null;
  const match = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect ?? "");
  return match && Number(match[2]) > 0 ? Number(match[1]) / Number(match[2]) : DEFAULT_ASPECT;
}
