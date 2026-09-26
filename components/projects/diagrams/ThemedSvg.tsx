"use client";

import { useEffect, useState } from "react";

/**
 * A drawing listed in THEMED_SVGS (./themed.ts). As an <img> it can only see
 * the viewer's OS colour scheme, so it is fetched and inlined instead, where
 * it picks up the live palette and the theme toggle.
 *
 * The file as an <img> first (server render, no JS, a failed fetch), then the
 * same file inlined once it arrives. The markup is our own, from public/.
 */
export function ThemedSvg({ src, alt }: { src: string; alt: string }) {
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch(src)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        if (live && text?.trimStart().startsWith("<svg")) setMarkup(text);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [src]);

  if (!markup) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" />;
  }
  return <div className="pj-themed-svg" dangerouslySetInnerHTML={{ __html: markup }} />;
}
