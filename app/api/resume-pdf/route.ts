import { generateResumePdf } from "@/ResumeBuilder/generateResumePdf";
import resumeData from "@/data/resumeData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Expires: "0",
  Pragma: "no-cache"
};

export async function GET() {
  try {
    const pdf = generateResumePdf(resumeData);

    return new Response(pdf, {
      status: 200,
      headers: {
        ...NO_CACHE_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Riley-Beenders-Resume.pdf"',
        "Content-Length": String(pdf.byteLength),
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Unable to generate the published resume PDF.", error);

    return Response.json(
      { error: "Unable to generate the resume PDF." },
      {
        status: 500,
        headers: NO_CACHE_HEADERS
      }
    );
  }
}
