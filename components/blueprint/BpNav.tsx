"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BpMark } from "@/components/blueprint/BpMark";
import { BpThemeToggle } from "@/components/blueprint/BpThemeToggle";
import { ui } from "@/lib/copy";

// Labels are edited in the Studio (Navigation & labels); the routes are the site's own.
const NAV = [
  { label: ui.nav.home, href: "/" },
  { label: ui.nav.projects, href: "/projects" },
  { label: ui.nav.contact, href: "/contact" },
  { label: ui.nav.moreInfo, href: "/more-info" },
  // The one link whose label is drawn in a slow, in-palette gradient sweep instead of a flat color.
  { label: ui.nav.aboutSite, href: "/about-this-site", gradient: true }
];

/** `name` is Site Settings → Person → Name, passed in by the server layout so no other personal detail reaches the browser bundle. */
export function BpNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="bp-nav">
      <div className="bp-nav-inner">
        <Link className="bp-brand" href="/" suppressHydrationWarning>
          <BpMark id="nav" size={34} animated />
          <span className="bp-brand-name">{name}</span>
        </Link>

        <div className="bp-nav-right">
          <nav className="bp-nav-links" aria-label="Site">
            {NAV.map((item) => (
              <Link
                key={item.href}
                className={[
                  "bp-nav-link",
                  pathname === item.href ? "is-active" : "",
                  "gradient" in item && item.gradient ? "bp-nav-link--gradient" : ""
                ].filter(Boolean).join(" ")}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                suppressHydrationWarning
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <BpThemeToggle />
        </div>
      </div>
    </header>
  );
}
