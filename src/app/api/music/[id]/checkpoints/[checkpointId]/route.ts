import { NextRequest, NextResponse } from "next/server";
import { deleteMusicCheckpoint } from "@/services/music.service";

type Params = { params: Promise<{ id: string; checkpointId: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id, checkpointId } = await params;
  await deleteMusicCheckpoint(checkpointId, id);
  return NextResponse.json({ ok: true });
}
