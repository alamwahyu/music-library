import { NextRequest, NextResponse } from "next/server";
import { deleteMusic, getMusic, updateMusic } from "@/services/music.service";
import { musicUpdatePayloadSchema, parseTags } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const music = await getMusic(id);
  if (!music) return NextResponse.json({ message: "Music not found." }, { status: 404 });
  return NextResponse.json(music);
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload = musicUpdatePayloadSchema.parse({ ...body, tags: parseTags(body.tags) });
    const music = await updateMusic(id, payload);
    return NextResponse.json(music);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to update music." }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await deleteMusic(id);
  return NextResponse.json({ ok: true });
}
