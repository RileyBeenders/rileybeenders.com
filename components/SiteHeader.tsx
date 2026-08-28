"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteSection = {
  id: string;
  label: string;
};

const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: "Home", href: "/classic" },
  { label: "Projects", href: "/classic/projects" },
  { label: "Contact", href: "/classic/contact" },
  { label: "More Info", href: "/classic/more-info" }
];

const SECTIONS_BY_ROUTE: Record<string, SiteSection[]> = {
  "/classic": [
    { id: "section-header", label: "Header" },
    { id: "section-summary", label: "Summary" },
    { id: "section-experience", label: "Experience" },
    { id: "section-education", label: "Education" },
    { id: "section-skills", label: "Skills" }
  ],
  "/classic/projects": [
    { id: "section-projects-header", label: "Overview" },
    { id: "section-projects-work", label: "Selected Work" }
  ],
  "/classic/contact": [
    { id: "section-contact-header", label: "Get in Touch" },
    { id: "section-contact-details", label: "Details" }
  ],
  "/classic/more-info": [
    { id: "section-moreinfo-header", label: "About" },
    { id: "section-moreinfo-aboutme", label: "About Me" },
    { id: "section-moreinfo-aboutsite", label: "About the Site" },
    { id: "section-moreinfo-tracker", label: "Application Tracker" }
  ]
};

export function SiteHeader() {
  const pathname = usePathname();
  const sections = SECTIONS_BY_ROUTE[pathname] ?? [];

  const headerRef = useRef<HTMLElement | null>(null);
  const sectionsNavRef = useRef<HTMLElement | null>(null);
  const underlineRef = useRef<HTMLSpanElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineReady, setUnderlineReady] = useState(false);

  useEffect(() => {
    setUnderlineReady(false);

    if (sections.length === 0) return;

    let frame = 0;
    let starts: number[] = [];
    let lastActiveIndex = -1;

    function measure() {
      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
      // Clamp to the page's actual max scroll so a short trailing section
      // (e.g. Skills) whose natural trigger point is unreachable still
      // becomes active once the user hits the bottom of the page.
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

      starts = sections.map((section) => {
        const el = document.getElementById(section.id);
        if (!el) return 0;
        const raw = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        return Math.min(Math.max(0, raw), maxScroll);
      });
    }

    function positionUnderline(index: number) {
      if (!underlineRef.current || !sectionsNavRef.current) return;

      const buttons = sectionsNavRef.current.querySelectorAll<HTMLButtonElement>("button");
      const el = buttons[index];
      if (!el) return;

      underlineRef.current.style.transform = `translateX(${el.offsetLeft}px)`;
      underlineRef.current.style.width = `${el.offsetWidth}px`;
      setUnderlineReady(true);
    }

    function currentIndex() {
      const scrollY = window.scrollY;
      let index = 0;
      for (let i = 0; i < starts.length; i++) {
        if (scrollY >= starts[i]) index = i;
      }
      return index;
    }

    function update() {
      if (starts.length === 0) return;

      const index = currentIndex();
      if (index === lastActiveIndex) return;
      lastActiveIndex = index;
      setActiveIndex(index);
      positionUnderline(index);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    function onResize() {
      measure();
      if (starts.length === 0) return;
      const index = currentIndex();
      lastActiveIndex = index;
      setActiveIndex(index);
      positionUnderline(index);
    }

    // Wait a frame so refs/layout are settled before the first measurement.
    const initFrame = requestAnimationFrame(() => {
      measure();
      update();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(initFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [pathname, sections.length]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const raw = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    const target = Math.min(Math.max(0, raw), maxScroll);

    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header-tier site-header-tier-primary">
        <Link href="/classic" className="site-header-brand" suppressHydrationWarning>
          RileyBeenders.com
        </Link>
        <nav aria-label="Site">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "is-active" : ""}
              suppressHydrationWarning
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {sections.length > 0 && (
        <div className="site-header-tier site-header-tier-secondary">
          <nav aria-label="Page sections" className="site-header-sections" ref={sectionsNavRef}>
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
            <span
              className="site-header-underline"
              ref={underlineRef}
              aria-hidden="true"
              style={{ opacity: underlineReady ? 1 : 0 }}
            />
          </nav>
        </div>
      )}
    </header>
  );
}
