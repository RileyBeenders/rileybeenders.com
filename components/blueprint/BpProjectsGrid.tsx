import type { Project } from "@/types/resume";

export function BpProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="bp-project-grid">
      {projects.map((project) => (
        <article className="bp-project-card" key={project.id}>
          <p className="bp-project-type">{project.type}</p>
          <h3>{project.name}</h3>
          <p className="bp-project-summary">{project.summary}</p>
          {project.bullets.length > 0 && (
            <ul className="bp-project-bullets">
              {project.bullets.slice(0, 2).map((bullet) => (
                <li key={bullet.text}>{bullet.text}</li>
              ))}
            </ul>
          )}
          <div className="bp-project-bar" aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}
