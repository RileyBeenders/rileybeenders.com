"use client";

import { useMemo, useState } from "react";
import type { ProjectFeature as ProjectFeatureData, ProjectImage } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { WordReveal } from "@/components/blueprint/WordReveal";
import { ScrollWords } from "@/components/blueprint/ScrollWords";
import { Lightbox } from "@/components/projects/Lightbox";
import { FeatureStats } from "@/components/projects/feature/FeatureStats";
import { FeatureTimeline } from "@/components/projects/feature/FeatureTimeline";
import { FeaturePillars } from "@/components/projects/feature/FeaturePillars";
import { FeatureScreenshots } from "@/components/projects/feature/FeatureScreenshots";

type ProjectFeatureProps = {
  feature: ProjectFeatureData;
  projectName: string;
  /** ISO date from the server; anchors the timeline's "now". */
  today: string;
};

/**
 * The deep-dive under a featured project: stats, the commit timeline,
 * thematic pillars, and annotated screenshots. Every screenshot trigger in
 * any of those sections opens the same viewer, so it lives here.
 */
export function ProjectFeature({ feature, projectName, today }: ProjectFeatureProps) {
  const screenshots = useMemo(() => feature.screenshots ?? [], [feature.screenshots]);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const viewerImages: ProjectImage[] = useMemo(
    () => screenshots.map((shot) => ({ src: shot.src, alt: shot.alt, caption: shot.caption, fit: "contain" as const })),
    [screenshots]
  );
  const openScreenshot = (id: string) => {
    const index = screenshots.findIndex((shot) => shot.id === id);
    if (index >= 0) setOpenAt(index);
  };

  const hasStats = (feature.stats?.length ?? 0) > 0;
  const hasTimeline = (feature.timeline?.length ?? 0) > 0;
  const hasPillars = (feature.pillars?.length ?? 0) > 0;
  const hasShots = screenshots.length > 0;

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
          <Reveal delay={0.06}>
            <p className="ft-block-note">Key commits, placed by date. Click a dot, or use the arrow keys.</p>
          </Reveal>
          <FeatureTimeline entries={feature.timeline!} screenshots={screenshots} today={today} onOpenScreenshot={openScreenshot} />
        </div>
      )}

      {hasPillars && (
        <div className="ft-block">
          <Reveal><h3 className="ft-block-title">What it's made of</h3></Reveal>
          <FeaturePillars pillars={feature.pillars!} screenshots={screenshots} onOpenScreenshot={openScreenshot} />
        </div>
      )}

      {hasShots && (
        <div className="ft-block">
          <Reveal><h3 className="ft-block-title">On screen</h3></Reveal>
          <Reveal delay={0.06}>
            <p className="ft-block-note">Numbered pins point at what each screenshot is showing. Hover, or click to keep one open.</p>
          </Reveal>
          <FeatureScreenshots screenshots={screenshots} onOpen={openScreenshot} />
        </div>
      )}

      {openAt !== null && (
        <Lightbox images={viewerImages} index={openAt} onIndexChange={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}
