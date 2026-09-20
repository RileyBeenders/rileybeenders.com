"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Set by `npm run site` (studio/site.mjs) for the dev server it starts. Without
 * it there is no Studio to jump to, so the control never renders. Never set
 * in a production build.
 */
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL;

/** Which Studio file edits each page — the same pairing as RAIL in studio/ui/schema.js. */
const STUDIO_FILE_FOR_PAGE: Record<string, string> = {
  "/": "summary",
  "/projects": "projects",
  "/contact": "contact",
  "/more-info": "moreInfo",
  "/about-this-site": "aboutSite"
};

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Dev-only, bottom-right: opens the Studio on the file that edits the page
 * being looked at (and on the project entry, when the URL names one). It
 * reuses one Studio window, and only changes that window's hash, so unsaved
 * work there is never lost. The Studio's "Open on the site" is the way back.
 */
export function StudioLink() {
  const pathname = usePathname();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (!STUDIO_URL) return;

    function update() {
      // The Studio answers this machine only, so the control is pointless on a phone.
      if (!LOOPBACK_HOSTS.has(window.location.hostname)) return setHref(null);
      const key = STUDIO_FILE_FOR_PAGE[pathname];
      if (!key) return setHref(null);
      let hash = `#${key}`;
      const anchor = window.location.hash.match(/^#project-(.+)$/);
      if (key === "projects" && anchor) hash += `/${encodeURIComponent(decodeURIComponent(anchor[1]))}`;
      setHref(`${STUDIO_URL}/${hash}`);
    }

    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  if (!href) return null;

  return (
    <a
      className="bp-studio-link"
      href={href}
      target="rileybeenders-studio"
      rel="noreferrer"
      title="Open this page's content in the Studio"
      suppressHydrationWarning
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20h9M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Edit in Studio</span>
    </a>
  );
}
