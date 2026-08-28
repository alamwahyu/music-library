import { NextRequest, NextResponse } from "next/server";
import { createMusic, librarySummary, listMusic } from "@/services/music.service";
import { musicPayloadSchema, parseTags } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const music = await listMusic({
    search: searchParams.get("search"),
    categoryId: searchParams.get("categoryId"),
    sourceType: searchParams.get("sourceType") as "MP3" | "YOUTUBE" | null,
    favorites: searchParams.get("favorites") === "true",
    sort: searchParams.get("sort")
  });
  const summary = await librarySummary();
  return NextResponse.json({ music, summary });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = musicPayloadSchema.parse({ ...body, tags: parseTags(body.tags) });
    const music = await createMusic(payload);
    return NextResponse.json(music, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to create music." }, { status: 400 });
  }
}
