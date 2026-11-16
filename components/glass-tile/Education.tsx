import { ExternalLink, GraduationCap } from "lucide-react";
import type { Education as EducationData } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { ui } from "@/lib/copy";

/** The degree as one card, the certificates as a grid of smaller ones beside it. */
export function Education({ education }: { education: EducationData }) {
  return (
    <div className="edu-grid">
      <div>
        {education.degrees.map((degree) => (
          <Reveal key={`${degree.school}-${degree.degree}`}>
            <article className="card degree">
              <GraduationCap size={26} strokeWidth={1.6} style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h3 className="degree-school">{degree.school}</h3>
              <p className="degree-name">{degree.degree}</p>
              <p className="degree-when">{degree.graduation}</p>
            </article>
          </Reveal>
        ))}
      </div>

      {education.certificates.length > 0 && (
        <div className="certs">
          {education.certificates.map((certificate, index) => (
            <Reveal key={`${certificate.certificateName}-${certificate.issuer}`} delay={Math.min(index, 5) * 0.05}>
              <article className="card card--hover cert">
                <h4>{certificate.certificateName}</h4>
                <p className="cert-issuer">{certificate.issuer}</p>
                <p className="cert-date">{certificate.date}</p>
                {certificate.credentialUrl && (
                  <a className="bp-link" href={certificate.credentialUrl} target="_blank" rel="noreferrer" suppressHydrationWarning>
                    {certificate.credentialLabel || ui.showCredential}
                    <ExternalLink className="bp-arrow" size={12} strokeWidth={2} aria-hidden="true" />
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
