import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import moreInfoData from "@/data/more-info/more-info.json";
import { GanttChart } from "@/components/GanttChart";
import { JobsTable } from "@/components/JobsTable";
import { Reveal } from "@/components/v3/Reveal";
import { parseGanttFile } from "@/lib/gantt";
import type { MoreInfoData } from "@/types/more-info";

const data = moreInfoData as MoreInfoData;

export const metadata: Metadata = {
  title: "More Info | Riley Beenders",
  description: "Background on this site and a live look at the job search behind it."
};

export default function V3MoreInfo() {
  const ganttRaw = fs.readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf-8");
  const { chart, columns, rows } = parseGanttFile(ganttRaw);

  return (
    <main>
      <section className="v3-hero" style={{ paddingBottom: 8 }}>
        <div className="v3-shell">
          <Reveal delay={0.05}><p className="v3-eyebrow">About</p></Reveal>
          <h1 style={{ fontSize: "clamp(44px, 8vw, 96px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>{data.aboutHeader.title}</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="v3-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <div style={{ marginTop: 26 }}>
              {data.aboutHeader.description.map((paragraph) => (
                <p className="v3-prose" key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">01&nbsp;&nbsp;{data.aboutMe.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                {data.aboutMe.description.map((paragraph) => (
                  <p className="v3-prose" key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">02&nbsp;&nbsp;{data.aboutSite.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                {data.aboutSite.description.map((paragraph) => (
                  <p className="v3-prose" key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">03&nbsp;&nbsp;{data.ganttSection.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="v3-prose">{data.ganttSection.intro}</p>
                <GanttChart chart={chart} variant="v3" />
                <JobsTable columns={columns} rows={rows} variant="v3" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
