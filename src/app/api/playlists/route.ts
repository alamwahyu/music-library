import { NextRequest, NextResponse } from "next/server";
import { playlistPayloadSchema } from "@/lib/validation";
import { createPlaylist, listPlaylists } from "@/services/playlist.service";

export async function GET() {
  return NextResponse.json(await listPlaylists());
}

export async function POST(request: NextRequest) {
  try {
    const playlist = await createPlaylist(playlistPayloadSchema.parse(await request.json()));
    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to create playlist." }, { status: 400 });
  }
}
