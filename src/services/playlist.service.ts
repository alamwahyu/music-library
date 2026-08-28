import { db } from "@/lib/db";

export async function listPlaylists() {
  return db.playlist.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } }
  });
}

export async function getPlaylist(id: string) {
  return db.playlist.findUnique({
    where: { id },
    include: { items: { orderBy: { position: "asc" }, include: { music: { include: { category: true } } } } }
  });
}

export async function createPlaylist(data: { name: string; description?: string | null }) {
  return db.playlist.create({ data });
}

export async function updatePlaylist(id: string, data: { name: string; description?: string | null }) {
  return db.playlist.update({ where: { id }, data });
}

export async function deletePlaylist(id: string) {
  return db.playlist.delete({ where: { id } });
}

export async function addMusicToPlaylist(playlistId: string, musicId: string, position?: number) {
  const nextPosition = position ?? (await db.playlistMusic.count({ where: { playlistId } }));
  return db.playlistMusic.upsert({
    where: { playlistId_musicId: { playlistId, musicId } },
    update: { position: nextPosition },
    create: { playlistId, musicId, position: nextPosition }
  });
}

export async function removeMusicFromPlaylist(playlistId: string, musicId: string) {
  return db.playlistMusic.delete({ where: { playlistId_musicId: { playlistId, musicId } } });
}
