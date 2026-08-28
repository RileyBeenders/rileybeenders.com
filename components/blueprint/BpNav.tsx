"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BpMark } from "@/components/blueprint/BpMark";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  { label: "More Info", href: "/more-info" }
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

        <nav className="bp-nav-links" aria-label="Site">
          {NAV.map((item) => (
            <Link
              key={item.href}
              className={pathname === item.href ? "bp-nav-link is-active" : "bp-nav-link"}
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
