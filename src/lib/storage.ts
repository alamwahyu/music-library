import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface StorageProvider {
  saveMusicFile(file: File): Promise<{ path: string; size: number }>;
}

const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "20");
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? "./uploads/music";
const PUBLIC_UPLOAD_BASE_URL =
  process.env.PUBLIC_UPLOAD_BASE_URL ?? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/uploads/music`;

export class LocalMusicStorage implements StorageProvider {
  async saveMusicFile(file: File) {
    validateMp3File(file);
    const uploadDir = path.resolve(process.cwd(), LOCAL_UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${randomUUID()}.mp3`;
    const targetPath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(targetPath, buffer, { flag: "wx" });

    return {
      path: `${PUBLIC_UPLOAD_BASE_URL}/${fileName}`,
      size: buffer.byteLength
    };
  }
}

export function getMusicStorage(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver !== "local") {
    throw new Error(`Unsupported storage driver: ${driver}`);
  }
  return new LocalMusicStorage();
}

export function validateMp3File(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (extension !== ".mp3") {
    throw new Error("Only .mp3 files are allowed.");
  }
  if (file.type !== "audio/mpeg" && file.type !== "audio/mp3") {
    throw new Error("Invalid MIME type. Expected audio/mpeg.");
  }
  if (file.size <= 0) {
    throw new Error("File cannot be empty.");
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_SIZE_MB}MB.`);
  }
}
