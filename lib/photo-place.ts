import type { ImagePlace, ProjectImage } from "@/types/resume";

/**
 * Photo Mode (components/projects/PhotoMode.tsx) floats a project's photos in
 * its body text. These are the rules both the page and the Studio's
 * /api/photo-place endpoint hold a placement to.
 */

/** A placed photo's width, as a percentage of the body. The Studio clamps to the same range. */
export const PLACE_WIDTH = { min: 15, max: 70, initial: 38, step: 2 } as const;

/** One of the project's images as the page shows it: `index` in the project's own list, `at` in the viewer's. */
export type ShownImage = {
  image: ProjectImage;
  index: number;
  at: number;
};

export const clampWidth = (width: number) =>
  Math.round(Math.min(PLACE_WIDTH.max, Math.max(PLACE_WIDTH.min, width)) * 10) / 10;

/**
 * Where a photo actually sits, given how many blocks (summary paragraphs and
 * bullets) the body has now. An anchor past the end falls back to the last
 * block, so trimming the text never throws a photo out of the body; with no
 * body text at all there is nowhere to float, and the photo stays in the gallery.
 */
export function resolvePlace(place: ImagePlace | undefined, blockCount: number): ImagePlace | null {
  if (!place || blockCount === 0) return null;
  return {
    at: Math.min(Math.max(0, Math.trunc(place.at)), blockCount - 1),
    side: place.side === "left" ? "left" : "right",
    width: clampWidth(place.width)
  };
}

/** A captured post is a card of words, not a picture, so it keeps to the gallery. */
export const canFloat = (image: ProjectImage) => !image.post;
