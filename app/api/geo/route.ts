// Tells the browser which state/region its request came from, so SiteAnalytics
// can attach it to a Web Analytics event. Web Analytics' own pageview data
// stops at country. Vercel's edge sets these headers from the visitor's IP on
// every request; they're absent in local dev, so every field comes back null.
export const dynamic = "force-dynamic";

function decode(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value); // city arrives URL-encoded ("San%20Francisco")
  } catch {
    return value;
  }
}

export function GET(request: Request) {
  const headers = request.headers;

  return Response.json(
    {
      country: headers.get("x-vercel-ip-country"),
      region: headers.get("x-vercel-ip-country-region"),
      city: decode(headers.get("x-vercel-ip-city"))
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
