import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

export async function GET(_: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-f0-9-]+\.mp3$/i.test(file)) {
    return NextResponse.json({ message: "Invalid file." }, { status: 400 });
  }

  const uploadDir = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "./uploads/music");
  const filePath = path.join(uploadDir, file);

  try {
    const fileStat = await stat(filePath);
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }
}
