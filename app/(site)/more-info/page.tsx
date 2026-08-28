import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import moreInfoData from "@/data/more-info/more-info.json";
import { GanttChart } from "@/components/GanttChart";
import { JobsTable } from "@/components/JobsTable";
import { Reveal } from "@/components/blueprint/Reveal";
import { parseGanttFile } from "@/lib/gantt";
import type { MoreInfoData } from "@/types/more-info";

const data = moreInfoData as MoreInfoData;

export const metadata: Metadata = {
  title: "More Info | Riley Beenders",
  description: "Background on this site and a live look at the job search behind it."
};

export default function MoreInfoPage() {
  const ganttRaw = fs.readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf-8");
  const { chart, columns, rows } = parseGanttFile(ganttRaw);

  return (
    <main>
      <section className="bp-hero" style={{ paddingBottom: 8 }}>
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">About</p></Reveal>
          <h1 style={{ fontSize: "clamp(44px, 8vw, 96px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>{data.aboutHeader.title}</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <div style={{ marginTop: 26 }}>
              {data.aboutHeader.description.map((paragraph) => (
                <p className="bp-prose" key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">01&nbsp;&nbsp;{data.aboutMe.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                {data.aboutMe.description.map((paragraph) => (
                  <p className="bp-prose" key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">02&nbsp;&nbsp;{data.aboutSite.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                {data.aboutSite.description.map((paragraph) => (
                  <p className="bp-prose" key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">03&nbsp;&nbsp;{data.ganttSection.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="bp-prose">{data.ganttSection.intro}</p>
                <GanttChart chart={chart} />
                <JobsTable columns={columns} rows={rows} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
