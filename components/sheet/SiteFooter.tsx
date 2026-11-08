import { BpMark } from "@/components/blueprint/BpMark";
import homePageData from "@/data/home/page.json";
import { getBuildStamp } from "@/lib/build-stamp";
import type { HomePageData } from "@/types/pages";

const page = homePageData as HomePageData;

/**
 * The foot of every page: the monogram with the footer note beside it, and
 * a drawing's title block — sheet, revision (the commit the page was built
 * from), and where it was drawn. All of it is Studio copy (Home page →
 * Footer) and Site Settings.
 */
export function SiteFooter({ location }: { location: string }) {
  const stamp = getBuildStamp();
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-inner">
          <div className="footer-mark">
            <BpMark id="footer" size={52} animated float />
            <p className="footer-note">{page.footer.note}</p>
          </div>
          <dl className="footer-block" aria-label="About this page">
            <div>
              <dt>{page.footer.sheetLabel}</dt>
              <dd><a href={page.footer.sheetLink.href} suppressHydrationWarning>{page.footer.sheetLink.text}</a></dd>
            </div>
            {stamp.commit && (
              <div>
                <dt>{page.footer.revisionLabel}</dt>
                <dd>{stamp.commit} · {stamp.date}</dd>
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
