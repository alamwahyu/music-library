import { NextRequest, NextResponse } from "next/server";
import { addMusicToPlaylist, reorderPlaylistMusic } from "@/services/playlist.service";

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!Array.isArray(body.orderedMusicIds)) {
      return NextResponse.json({ message: "orderedMusicIds must be an array." }, { status: 400 });
    }
    await reorderPlaylistMusic(id, body.orderedMusicIds.map(String));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to reorder playlist." }, { status: 400 });
  }
}
