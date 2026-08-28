"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { V3Mark } from "@/components/v3/V3Mark";

const NAV = [
  { label: "Home", href: "/v3" },
  { label: "Projects", href: "/v3/projects" },
  { label: "Contact", href: "/v3/contact" },
  { label: "More Info", href: "/v3/more-info" }
];

export function V3Nav() {
  const pathname = usePathname();

  return (
    <header className="v3-nav">
      <div className="v3-nav-inner">
        <Link className="v3-brand" href="/v3" suppressHydrationWarning>
          <V3Mark id="nav" size={34} animated />
          <span className="v3-brand-name">Riley Beenders</span>
        </Link>

        <nav className="v3-nav-links" aria-label="Site">
          {NAV.map((item) => (
            <Link
              key={item.href}
              className={pathname === item.href ? "v3-nav-link is-active" : "v3-nav-link"}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              suppressHydrationWarning
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
