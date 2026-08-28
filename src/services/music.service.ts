import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { extractYouTubeVideoId, youtubeThumbnail } from "@/lib/youtube";

export async function listMusic(params: {
  search?: string | null;
  categoryId?: string | null;
  sourceType?: "MP3" | "YOUTUBE" | null;
  favorites?: boolean;
  sort?: string | null;
}) {
  const search = params.search?.trim();
  const where: Prisma.MusicWhereInput = {
    categoryId: params.categoryId || undefined,
    sourceType: params.sourceType || undefined,
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { artist: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
          { category: { name: { contains: search, mode: "insensitive" } } }
        ]
      : undefined
  };

  const orderBy = getMusicOrder(params.sort);
  return db.music.findMany({
    where,
    orderBy,
    include: { category: true, favorites: true, checkpoints: { orderBy: { startSecond: "asc" } } }
  });
}

export async function getMusic(id: string) {
  return db.music.findUnique({
    where: { id },
    include: { category: true, playlistItems: { include: { playlist: true } }, favorites: true, checkpoints: { orderBy: { startSecond: "asc" } } }
  });
}

export async function createMusic(data: Prisma.MusicUncheckedCreateInput) {
  const youtubeVideoId = data.sourceType === "YOUTUBE" && data.youtubeUrl ? extractYouTubeVideoId(data.youtubeUrl) : null;
  if (data.sourceType === "YOUTUBE" && !youtubeVideoId) throw new Error("Invalid YouTube URL.");
  if (data.sourceType === "MP3" && !data.fileUrl) throw new Error("MP3 file is required.");

  return db.music.create({
    data: {
      ...data,
      youtubeVideoId: youtubeVideoId ?? data.youtubeVideoId,
      coverUrl: data.coverUrl || youtubeThumbnail(youtubeVideoId)
    },
    include: { category: true, favorites: true, checkpoints: { orderBy: { startSecond: "asc" } } }
  });
}

export async function updateMusic(id: string, data: Prisma.MusicUncheckedUpdateInput) {
  const youtubeUrl = typeof data.youtubeUrl === "string" ? data.youtubeUrl : undefined;
  const youtubeVideoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : undefined;

  return db.music.update({
    where: { id },
    data: {
      ...data,
      youtubeVideoId
    },
    include: { category: true, favorites: true, checkpoints: { orderBy: { startSecond: "asc" } } }
  });
}

export async function deleteMusic(id: string) {
  return db.music.delete({ where: { id } });
}

export async function createMusicCheckpoint(musicId: string, data: { name: string; startSecond: number; endSecond?: number | null }) {
  return db.musicCheckpoint.create({ data: { ...data, musicId } });
}

export async function deleteMusicCheckpoint(id: string, musicId: string) {
  return db.musicCheckpoint.deleteMany({ where: { id, musicId } });
}

export async function librarySummary() {
  const [total, mp3, youtube, categories] = await Promise.all([
    db.music.count(),
    db.music.count({ where: { sourceType: "MP3" } }),
    db.music.count({ where: { sourceType: "YOUTUBE" } }),
    db.category.count()
  ]);
  return { total, mp3, youtube, categories };
}

function getMusicOrder(sort?: string | null): Prisma.MusicOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "title-asc":
      return { title: "asc" };
    case "title-desc":
      return { title: "desc" };
    case "artist-asc":
      return { artist: "asc" };
    default:
      return { createdAt: "desc" };
  }
}
