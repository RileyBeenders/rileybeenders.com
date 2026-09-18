"use client";

import { useMemo, useState } from "react";
import type { ProjectFeature as ProjectFeatureData, ProjectImage } from "@/types/resume";
import { useTheme } from "@/components/blueprint/ThemeProvider";
import { Reveal } from "@/components/blueprint/Reveal";
import { WordReveal } from "@/components/blueprint/WordReveal";
import { ScrollWords } from "@/components/blueprint/ScrollWords";
import { Lightbox } from "@/components/projects/Lightbox";
import { FeatureStats } from "@/components/projects/feature/FeatureStats";
import { FeatureTimeline } from "@/components/projects/feature/FeatureTimeline";
import { FeaturePillars } from "@/components/projects/feature/FeaturePillars";
import { FeatureBackend } from "@/components/projects/feature/FeatureBackend";

type ProjectFeatureProps = {
  feature: ProjectFeatureData;
  projectName: string;
  /** ISO date from the server; anchors the timeline's "now". */
  today: string;
  /** The site's current palette id (Site Settings), so the Studio replica starts where the real one is. */
  paletteId: string;
};

/**
 * The deep-dive of the About page: stats, the commit timeline, thematic
 * pillars, and the behind-the-site demos. Every screenshot thumbnail in the
 * timeline and pillars opens the same viewer, so it lives here — and, like
 * the thumbnails, the viewer shows the capture from the *other* theme.
 */
export function ProjectFeature({ feature, projectName, today, paletteId }: ProjectFeatureProps) {
  const { theme } = useTheme();
  const screenshots = useMemo(() => feature.screenshots ?? [], [feature.screenshots]);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const viewerImages: ProjectImage[] = useMemo(
    () =>
      screenshots.map((shot) => ({
        src: theme === "dark" ? shot.src : (shot.srcDark ?? shot.src),
        alt: shot.alt,
        caption: shot.caption,
        fit: "contain" as const
      })),
    [screenshots, theme]
  );
  const openScreenshot = (id: string) => {
    const index = screenshots.findIndex((shot) => shot.id === id);
    if (index >= 0) setOpenAt(index);
  };

  const hasStats = (feature.stats?.length ?? 0) > 0;
  const hasTimeline = (feature.timeline?.length ?? 0) > 0;
  const hasPillars = (feature.pillars?.length ?? 0) > 0;
  const hasBackend = (feature.backend?.items.length ?? 0) > 0;

  return (
    <section className="ft" aria-label={`${projectName}: deep dive`}>
      <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>

      <header className="ft-head">
        {feature.eyebrow && <WordReveal as="p" className="pj-eyebrow ft-eyebrow" text={feature.eyebrow} blur={false} />}
        {feature.intro && <ScrollWords className="ft-intro" text={feature.intro} />}
      </header>

      {hasStats && (
        <div className="ft-block">
          <FeatureStats stats={feature.stats!} />
        </div>
      )}

      {hasTimeline && (
        <div className="ft-block">
          <Reveal><h3 className="ft-block-title">Timeline</h3></Reveal>
          <FeatureTimeline
            entries={feature.timeline!}
            screenshots={screenshots}
            today={today}
            note="Key commits, placed by date, playing through in order. Click a dot, or use the arrow keys, to take over."
            onOpenScreenshot={openScreenshot}
          />
        </div>
      )}

      {hasPillars && (
        <div className="ft-block">
          <Reveal><h3 className="ft-block-title">What it's made of</h3></Reveal>
          <FeaturePillars pillars={feature.pillars!} screenshots={screenshots} onOpenScreenshot={openScreenshot} />
        </div>
      )}

      {hasBackend && (
        <div className="ft-block">
          <Reveal><h3 className="ft-block-title">{feature.backend!.eyebrow ?? "Behind the site"}</h3></Reveal>
          {feature.backend!.intro && (
            <Reveal delay={0.06}><p className="ft-block-note">{feature.backend!.intro}</p></Reveal>
          )}
          <FeatureBackend backend={feature.backend!} paletteId={paletteId} />
        </div>
      )}

      {openAt !== null && (
        <Lightbox images={viewerImages} index={openAt} onIndexChange={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}
