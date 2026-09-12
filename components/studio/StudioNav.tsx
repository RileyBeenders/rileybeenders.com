"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Palette } from "lucide-react";

const NAV = [
  { label: "Site Settings", href: "/studio/site-settings", icon: Palette },
  { label: "Projects", href: "/studio/projects", icon: Layers }
];

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="studio-nav" aria-label="Studio">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "studio-nav-link is-active" : "studio-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
