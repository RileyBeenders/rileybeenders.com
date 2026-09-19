"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BpMark } from "@/components/blueprint/BpMark";
import { BpThemeToggle } from "@/components/blueprint/BpThemeToggle";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  { label: "More Info", href: "/more-info" },
  // The one link whose label is drawn in a slow, in-palette gradient sweep instead of a flat color.
  { label: "About this site", href: "/about-this-site", gradient: true }
];

export function BpNav() {
  const pathname = usePathname();

  return (
    <header className="bp-nav">
      <div className="bp-nav-inner">
        <Link className="bp-brand" href="/" suppressHydrationWarning>
          <BpMark id="nav" size={34} animated />
          <span className="bp-brand-name">Riley Beenders</span>
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
