import type { FeatureScreenshot } from "@/types/resume";

/**
 * A capture of the site shown in the *opposite* theme to the visitor's: the
 * dark capture on the light site, the light one on the dark site, so the
 * thumbnails read as a different surface rather than a mirror. Both images
 * render and `html[data-theme]` picks one in CSS (see .ft-themed in
 * feature.css) — the theme is stamped on <html> before hydration, so this is
 * consistent on both sides and flips instantly with the toggle. With no dark
 * capture the light one shows in both themes.
 */
export function ThemedShot({ shot, alt = "", className }: { shot: FeatureScreenshot; alt?: string; className?: string }) {
  // With no dark capture there is nothing to swap: the one image carries no
  // `data-shows`, so neither theme's rule hides it.
  if (!shot.srcDark) {
    return (
      <span className={`ft-themed${className ? ` ${className}` : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.src} alt={alt} loading="lazy" />
      </span>
    );
  }
  return (
    <span className={`ft-themed${className ? ` ${className}` : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.srcDark} alt={alt} loading="lazy" data-shows="dark" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.src} alt={alt} loading="lazy" data-shows="light" />
    </span>
  );
}
