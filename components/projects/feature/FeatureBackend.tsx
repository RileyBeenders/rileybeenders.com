"use client";

import type { BackendItem, FeatureBackend as FeatureBackendData } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { ResumeDemo } from "@/components/projects/feature/demos/ResumeDemo";
import { StudioDemo } from "@/components/projects/feature/demos/StudioDemo";
import { SkillsDemo } from "@/components/projects/feature/demos/SkillsDemo";

function Demo({ item, paletteId }: { item: BackendItem; paletteId: string }) {
  switch (item.demo) {
    case "resume":
      return <ResumeDemo matches={item.matches ?? []} />;
    case "studio":
      return <StudioDemo initialPaletteId={paletteId} />;
    case "skills":
      return <SkillsDemo skills={item.skills ?? []} />;
    default:
      return null;
  }
}

/**
 * The tools visitors never see, one row each: a small live replica on one
 * side and the notes on the other, sides alternating down the page. The
 * replicas are real, scoped-down versions of the things they stand for, not
 * pictures of them.
 */
export function FeatureBackend({ backend, paletteId }: { backend: FeatureBackendData; paletteId: string }) {
  return (
    <div className="ft-back">
      {backend.items.map((item, index) => (
        <article className={`ft-back-row${index % 2 === 1 ? " ft-back-row--reverse" : ""}`} key={`${item.demo}-${item.title}`}>
          <Reveal as="fade" delay={0.08} className="ft-back-demo">
            <Demo item={item} paletteId={paletteId} />
          </Reveal>
          <div className="ft-back-notes">
            <Reveal delay={0.06}><h3 className="ft-back-title">{item.title}</h3></Reveal>
            {item.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 + i * 0.05}><p className="ft-back-body">{paragraph}</p></Reveal>
            ))}
            {item.notes && item.notes.length > 0 && (
              <Reveal delay={0.22}>
                <ul className="ft-back-list">
                  {item.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </Reveal>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
