import { NextResponse } from "next/server";
import { readStudioSettings, writeStudioSettings } from "@/lib/studio-settings";

// Always re-read/re-write the file on disk rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(readStudioSettings());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const saved = writeStudioSettings(body);
  return NextResponse.json(saved);
}
