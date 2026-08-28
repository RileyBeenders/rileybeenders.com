import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import moreInfoData from "@/data/more-info/more-info.json";
import { GanttChart } from "@/components/GanttChart";
import { JobsTable } from "@/components/JobsTable";
import { parseGanttFile } from "@/lib/gantt";
import type { MoreInfoData } from "@/types/more-info";

const data = moreInfoData as MoreInfoData;

export const metadata: Metadata = {
  title: "More Info | Riley Beenders",
  description: "Background on this site and a live look at the job search behind it."
};

export default function MoreInfoPage() {
  const ganttRaw = fs.readFileSync(
    path.join(process.cwd(), "data/more-info/gantt.md"),
    "utf-8"
  );
  const { chart, columns, rows } = parseGanttFile(ganttRaw);

  return (
    <main className="site-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <header className="hero-card" id="section-moreinfo-header">
          <div>
            <h1>{data.aboutHeader.title}</h1>
            {data.aboutHeader.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <section className="resume-paper">
          <div className="resume-column-main">
            <section className="resume-block" id="section-moreinfo-aboutme">
              <div className="section-title-row">
                <div>
                  <h2>{data.aboutMe.title}</h2>
                </div>
              </div>
              {data.aboutMe.description.map((paragraph) => (
                <p key={paragraph} className="summary-text">{paragraph}</p>
              ))}
            </section>

            <section className="resume-block" id="section-moreinfo-aboutsite">
              <div className="section-title-row">
                <div>
                  <h2>{data.aboutSite.title}</h2>
                </div>
              </div>
              {data.aboutSite.description.map((paragraph) => (
                <p key={paragraph} className="summary-text">{paragraph}</p>
              ))}
            </section>

            <section className="resume-block" id="section-moreinfo-tracker">
              <div className="section-title-row">
                <div>
                  <h2>{data.ganttSection.title}</h2>
                </div>
              </div>
              <p className="summary-text">{data.ganttSection.intro}</p>
              <GanttChart chart={chart} />
              <JobsTable columns={columns} rows={rows} />
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
