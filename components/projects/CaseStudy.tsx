import type { ProofView } from "@/lib/projects";
import { FlowDiagram } from "@/components/projects/diagrams/FlowDiagram";
import { FLOW_DIAGRAMS } from "@/components/projects/diagrams/flows";

/**
 * The expanded case study: problem, constraints, approach, decisions, impact,
 * then tags and diagrams. Pure markup — the entry that shows it owns the
 * toggle and the height animation, so the same block serves the projects
 * page and the About-this-site page.
 */
export function CaseStudy({ proof }: { proof: ProofView }) {
  return (
    <div className="pj-case-study">
      <h3 className="pj-proof-title">{proof.title}</h3>
      {proof.subtitle && <p className="pj-proof-subtitle">{proof.subtitle}</p>}
      {proof.summary && <p className="pj-proof-summary">{proof.summary}</p>}

      {proof.sections.map((section) => (
        <section className="pj-proof-section" key={section.label}>
          <h4>{section.label}</h4>
          {section.body && <p>{section.body}</p>}
          {section.items && (
            <ul>
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}

      {proof.tags.length > 0 && (
        <div className="pj-proof-tags">
          {proof.tags.map((tag) => <span className="pj-tag" key={tag}>{tag}</span>)}
        </div>
      )}

      {proof.assets.length > 0 && (
        // All flowcharts: the grid lets two share a row when the width allows.
        <div className={`pj-proof-assets${proof.assets.every((asset) => FLOW_DIAGRAMS[asset.src]) ? " pj-proof-assets--flows" : ""}`}>
          {proof.assets.map((asset) => {
            // A diagram the site knows how to draw itself renders inline,
            // in the palette and animated; anything else is the file as-is.
            const flow = FLOW_DIAGRAMS[asset.src];
            return (
              <figure key={asset.src} className={flow ? "pj-proof-asset--flow" : undefined}>
                {flow ? (
                  <FlowDiagram spec={flow} title={asset.alt || asset.label} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.src} alt={asset.alt} loading="lazy" />
                )}
                <figcaption>{asset.label}</figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
