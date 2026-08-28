"use client";

import { usePathname } from "next/navigation";

export function RelocationBadge() {
  const pathname = usePathname();
  // The /v3 design preview ships its own badge.
  if (pathname.startsWith("/v3")) return null;

  return (
    <div className="floating-status-pill">
      <span className="pulse-dot" aria-hidden="true" />
      Open to relocation
    </div>
  );
}
