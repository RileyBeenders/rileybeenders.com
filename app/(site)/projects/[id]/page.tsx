import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { ProjectBody } from "@/components/sheet/ProjectBody";
import { SiteFooter } from "@/components/sheet/SiteFooter";
import { getCatalog, getEntry } from "@/lib/catalog";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { todayIso } from "@/lib/dates";
import { ui } from "@/lib/copy";

type Params = { id: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCatalog().map((entry) => ({ id: entry.project.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntry(id);
  if (!entry) return {};
  if (entry.meta) return { title: entry.meta.title, description: entry.meta.description };
  const description = entry.tagline ?? splitParagraphs(entry.project.summary)[0] ?? "";
  return {
    title: `${entry.project.name} | ${resumeData.person.name}`,
    description
  };
}

/**
 * A project on its own page: the same body the dialog shows, with room to
 * breathe, and links to the entries either side of it in the catalog.
 */
export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const catalog = getCatalog();
  const index = catalog.findIndex((entry) => entry.project.id === id);
  if (index < 0) notFound();
  const entry = catalog[index];
  const previous = catalog[index - 1];
  const next = catalog[index + 1];

  return (
    <main>
      <section className="shell sec sec--tight" aria-label={entry.project.name}>
        <Reveal>
          <Link className="page-back" href="/projects" suppressHydrationWarning>
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span>{ui.nav.projects}</span>
          </Link>
        </Reveal>
        <Reveal delay={0.06}>
          <ProjectBody entry={entry} today={todayIso()} paletteId={resumeData.theme.paletteId} mode="page" />
        </Reveal>

        {(previous || next) && (
          <nav className="page-nav" aria-label="Other projects">
            {previous ? (
              <Link href={`/projects/${previous.project.id}`} suppressHydrationWarning>
                <small>← {previous.project.type}</small>
                <b>{previous.project.name}</b>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/projects/${next.project.id}`} suppressHydrationWarning>
                <small>{next.project.type} →</small>
                <b>{next.project.name}</b>
              </Link>
            ) : <span />}
          </nav>
        )}
      </section>

      <SiteFooter location={resumeData.person.location} />
      <BackToTop />
    </main>
  );
}
