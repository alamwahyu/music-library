import { NextRequest, NextResponse } from "next/server";
import { addMusicToPlaylist } from "@/services/playlist.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.musicId) return NextResponse.json({ message: "musicId is required." }, { status: 400 });
    const item = await addMusicToPlaylist(id, body.musicId, body.position);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to add music." }, { status: 400 });
  }
}
