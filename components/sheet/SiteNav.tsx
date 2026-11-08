"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BpMark } from "@/components/blueprint/BpMark";
import { BpThemeToggle } from "@/components/blueprint/BpThemeToggle";
import { ui } from "@/lib/copy";

// Labels are edited in the Studio (Navigation & labels → Menu); the routes are the site's own.
const NAV = [
  { label: ui.nav.home, href: "/" },
  { label: ui.nav.projects, href: "/projects" },
  { label: ui.nav.contact, href: "/contact" }
];

const CONDENSE_AT = 28;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The floating pill: the monogram and name, three links, the theme switch.
 * It condenses once the page has scrolled (tighter padding, a deeper shadow)
 * and the active link's tint slides between links with a shared layoutId.
 * `name` is Site Settings → Person → Name, passed in by the server layout.
 */
export function SiteNav({ name }: { name: string }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > CONDENSE_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-condensed={condensed ? "" : undefined}>
      <div className="nav-pill">
        <Link className="nav-brand" href="/" aria-label={`${name}, home`} suppressHydrationWarning>
          <BpMark id="nav" size={30} animated />
          <span className="nav-brand-name">{name}</span>
        </Link>

        <nav className="nav-links" aria-label="Site">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                className={`nav-link${active ? " is-active" : ""}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                suppressHydrationWarning
              >
                {active && (
                  <motion.span
                    className="nav-link-bg"
                    layoutId={reduced ? undefined : "nav-active"}
                    transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.6 }}
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <BpThemeToggle />
      </div>
    </header>
  );
}
