import { NextRequest, NextResponse } from "next/server";
import { checkpointPayloadSchema } from "@/lib/validation";
import { createMusicCheckpoint, getMusic } from "@/services/music.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const music = await getMusic(id);
  if (!music) return NextResponse.json({ message: "Music not found." }, { status: 404 });
  return NextResponse.json(music.checkpoints);
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const payload = checkpointPayloadSchema.parse(await request.json());
    const checkpoint = await createMusicCheckpoint(id, payload);
    return NextResponse.json(checkpoint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to create checkpoint." }, { status: 400 });
  }
}
