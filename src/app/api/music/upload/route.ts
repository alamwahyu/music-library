import { NextRequest, NextResponse } from "next/server";
import { getMusicStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "MP3 file is required." }, { status: 400 });
    }

    const saved = await getMusicStorage().saveMusicFile(file);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
