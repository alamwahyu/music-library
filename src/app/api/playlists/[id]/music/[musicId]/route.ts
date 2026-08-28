import { NextRequest, NextResponse } from "next/server";
import { removeMusicFromPlaylist } from "@/services/playlist.service";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; musicId: string }> }) {
  const { id, musicId } = await params;
  await removeMusicFromPlaylist(id, musicId);
  return NextResponse.json({ ok: true });
}
