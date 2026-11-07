import header from "@/data/header.json";

// The main resume is a static HTML + PDF pair in public/resume/, built from
// ResumeBuilder/main-resume/main-resume.html by the update-main-resume skill.
// Download PDF opens the HTML (header.json resumeHtmlPath); this route stays so
// links to /api/resume-pdf keep working: it redirects to resumePdfPath.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// A relative Location keeps the redirect on whatever host the visitor used
// (request.url is the internal port when the local gate proxies next dev).
export function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: header.resumePdfPath, "Cache-Control": "no-store" }
  });
}
