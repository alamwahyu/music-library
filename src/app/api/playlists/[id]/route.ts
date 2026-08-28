import { NextRequest, NextResponse } from "next/server";
import { playlistPayloadSchema } from "@/lib/validation";
import { deletePlaylist, getPlaylist, updatePlaylist } from "@/services/playlist.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const playlist = await getPlaylist(id);
  if (!playlist) return NextResponse.json({ message: "Playlist not found." }, { status: 404 });
  return NextResponse.json(playlist);
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await updatePlaylist(id, playlistPayloadSchema.parse(await request.json())));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to update playlist." }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await deletePlaylist(id);
  return NextResponse.json({ ok: true });
}
