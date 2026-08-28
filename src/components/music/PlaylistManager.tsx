"use client";

import { useState } from "react";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { apiPath } from "@/lib/url";
import type { Music, Playlist } from "./types";

type Props = {
  playlists: Playlist[];
  music: Music[];
  onChanged: () => void;
};

export function PlaylistManager({ playlists, music, onChanged }: Props) {
  const [name, setName] = useState("");

  async function createPlaylist(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(apiPath("/api/playlists"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (response.ok) {
      setName("");
      onChanged();
    }
  }

  async function addSong(playlistId: string, musicId: string) {
    await fetch(apiPath(`/api/playlists/${playlistId}/music`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicId })
    });
    onChanged();
  }

  async function deletePlaylist(id: string) {
    if (!window.confirm("Delete this playlist? This action cannot be undone.")) return;
    await fetch(apiPath(`/api/playlists/${id}`), { method: "DELETE" });
    onChanged();
  }

  return (
    <aside className="hidden w-72 shrink-0 border-l border-line bg-white/60 p-4 xl:block">
      <div className="flex items-center gap-2">
        <ListMusic size={18} />
        <h2 className="font-semibold">Playlists</h2>
      </div>
      <form onSubmit={createPlaylist} className="mt-4 flex gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="New playlist" className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm" />
        <button title="Create playlist" className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white"><Plus size={17} /></button>
      </form>
      <div className="mt-4 grid gap-3">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="rounded-lg border border-line bg-paper p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{playlist.name}</p>
                <p className="text-xs text-zinc-500">{playlist._count?.items ?? 0} songs</p>
              </div>
              <button title="Delete playlist" onClick={() => deletePlaylist(playlist.id)} className="rounded-md p-1 text-zinc-500 hover:text-wine"><Trash2 size={15} /></button>
            </div>
            <select onChange={(event) => event.target.value && addSong(playlist.id, event.target.value)} className="mt-3 w-full rounded-md border border-line bg-white px-2 py-2 text-xs" defaultValue="">
              <option value="">Add song</option>
              {music.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
            </select>
          </div>
        ))}
      </div>
    </aside>
  );
}
