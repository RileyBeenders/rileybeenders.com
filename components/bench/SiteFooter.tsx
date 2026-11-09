import { BpMark } from "@/components/blueprint/BpMark";
import homePageData from "@/data/home/page.json";
import { getBuildStamp } from "@/lib/build-stamp";
import type { HomePageData } from "@/types/pages";

const page = homePageData as HomePageData;

/**
 * The foot of every page: the monogram with the footer note beside it, and
 * a quiet line of small facts in the label face: the site's own link, the
 * commit and date the page was built from, and where Riley is based. All of
 * it is Studio copy (Home page → Footer) and Site Settings.
 */
export function SiteFooter({ location }: { location: string }) {
  const stamp = getBuildStamp();
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-inner">
          <div className="footer-mark">
            <BpMark id="footer" size={44} animated float />
            <p className="footer-note">{page.footer.note}</p>
          </div>
          <dl className="footer-meta" aria-label="About this page">
            <div>
              <dt>{page.footer.siteLabel}</dt>
              <dd><a href={page.footer.siteLink.href} suppressHydrationWarning>{page.footer.siteLink.text}</a></dd>
            </div>
            {stamp.commit && (
              <div>
                <dt>{page.footer.updatedLabel}</dt>
                <dd>{stamp.date} · {stamp.commit}</dd>
              </div>
            )}
            <div>
              <dt>{page.footer.locationLabel}</dt>
              <dd>{location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </footer>
  );
}
