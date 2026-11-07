import header from "@/data/header.json";

// The Download PDF button now serves the main resume, a static PDF printed from
// ResumeBuilder/main-resume/main-resume.html into public/resume/ by the
// update-main-resume skill. This route stays so links to /api/resume-pdf keep
// working: it redirects to whatever file data/header.json currently points at.
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
