"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ListMusic, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { apiPath } from "@/lib/url";
import type { Music, Playlist, PlaylistDetail } from "./types";

type Props = {
  playlists: Playlist[];
  music: Music[];
  onChanged: () => void;
  onPlayPlaylist: (songs: Music[]) => void;
};

export function PlaylistManager({ playlists, music, onChanged, onPlayPlaylist }: Props) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<PlaylistDetail | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [rename, setRename] = useState("");
  const [message, setMessage] = useState("");

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

  async function openPlaylist(id: string) {
    setMessage("");
    const response = await fetch(apiPath(`/api/playlists/${id}`));
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Failed to load playlist.");
      return;
    }
    setSelected(data);
    setLibraryOpen(false);
    setRename(data.name);
  }

  async function renamePlaylist(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const response = await fetch(apiPath(`/api/playlists/${selected.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rename, description: selected.description ?? null })
    });
    if (response.ok) {
      await openPlaylist(selected.id);
      onChanged();
    }
  }

  async function addSong(playlistId: string, musicId: string) {
    await fetch(apiPath(`/api/playlists/${playlistId}/music`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicId })
    });
    await openPlaylist(playlistId);
    onChanged();
  }

  async function removeSong(playlistId: string, musicId: string) {
    await fetch(apiPath(`/api/playlists/${playlistId}/music/${musicId}`), { method: "DELETE" });
    await openPlaylist(playlistId);
    onChanged();
  }

  async function moveSong(index: number, direction: -1 | 1) {
    if (!selected) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.items.length) return;

    const ordered = [...selected.items];
    const current = ordered[index];
    const target = ordered[nextIndex];
    ordered[index] = target;
    ordered[nextIndex] = current;

    await fetch(apiPath(`/api/playlists/${selected.id}/music`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedMusicIds: ordered.map((item) => item.musicId) })
    });
    await openPlaylist(selected.id);
    onChanged();
  }

  async function deletePlaylist(id: string) {
    if (!window.confirm("Delete this playlist? This action cannot be undone.")) return;
    await fetch(apiPath(`/api/playlists/${id}`), { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    onChanged();
  }

  const selectedSongs = selected?.items.map((item) => item.music) ?? [];
  const selectableMusic = selected ? music.filter((song) => !selected.items.some((item) => item.musicId === song.id)) : music;

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-l border-line bg-white/60 p-4 xl:block">
        <div className="flex items-center gap-2">
          <ListMusic size={18} />
          <h2 className="font-semibold">Playlists</h2>
        </div>
        <form onSubmit={createPlaylist} className="mt-4 flex gap-2">
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="New playlist" className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm" />
          <button title="Create playlist" className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white"><Plus size={17} /></button>
        </form>
        {message ? <p className="mt-3 text-sm text-wine">{message}</p> : null}
        <div className="mt-4 grid gap-3">
          {playlists.map((playlist) => (
            <button key={playlist.id} onClick={() => openPlaylist(playlist.id)} className="rounded-lg border border-line bg-paper p-3 text-left transition hover:bg-white hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{playlist.name}</p>
                  <p className="text-xs text-zinc-500">{playlist._count?.items ?? 0} songs</p>
                </div>
                <ListMusic size={15} className="shrink-0 text-zinc-400" />
              </div>
            </button>
          ))}
        </div>
      </aside>

      <button
        title="Open playlists"
        onClick={() => setLibraryOpen(true)}
        className="fixed bottom-28 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft xl:hidden"
      >
        <ListMusic size={17} />
        Playlists
      </button>

      {libraryOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 xl:hidden">
          <section className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-lg bg-paper p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListMusic size={18} />
                <h2 className="font-semibold">Playlists</h2>
              </div>
              <button title="Close playlists" onClick={() => setLibraryOpen(false)} className="rounded-md p-2 text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createPlaylist} className="mt-4 flex gap-2">
              <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="New playlist" className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm" />
              <button title="Create playlist" className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-white"><Plus size={17} /></button>
            </form>
            {message ? <p className="mt-3 text-sm text-wine">{message}</p> : null}
            <div className="mt-4 grid gap-3 pb-4">
              {playlists.length ? playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => openPlaylist(playlist.id)} className="rounded-lg border border-line bg-white p-3 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{playlist.name}</p>
                      <p className="text-xs text-zinc-500">{playlist._count?.items ?? 0} songs</p>
                    </div>
                    <ListMusic size={16} className="shrink-0 text-zinc-400" />
                  </div>
                </button>
              )) : (
                <div className="rounded-lg border border-dashed border-line bg-white py-10 text-center text-sm text-zinc-500">No playlists yet.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <section className="h-full w-full overflow-y-auto bg-paper p-4 shadow-soft sm:max-w-xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-zinc-500">Playlist</p>
                <h2 className="truncate text-xl font-semibold">{selected.name}</h2>
              </div>
              <button title="Close" onClick={() => setSelected(null)} className="rounded-md p-2 text-zinc-600"><X size={20} /></button>
            </div>

            <form onSubmit={renamePlaylist} className="mt-5 grid gap-2 rounded-lg border border-line bg-white p-3 sm:grid-cols-[1fr_auto]">
              <input value={rename} onChange={(event) => setRename(event.target.value)} required className="min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm" />
              <button title="Rename playlist" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white"><Pencil size={15} /> Save</button>
            </form>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button disabled={!selectedSongs.length} onClick={() => onPlayPlaylist(selectedSongs)} className="inline-flex items-center justify-center gap-2 rounded-md bg-wine px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Play size={17} /> Play Playlist
              </button>
              <button onClick={() => deletePlaylist(selected.id)} className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-wine">
                <Trash2 size={17} /> Delete
              </button>
            </div>

            <label className="mt-4 grid gap-1 text-sm font-medium">
              Add Song
              <select onChange={(event) => event.target.value && addSong(selected.id, event.target.value)} className="rounded-md border border-line bg-white px-3 py-2" defaultValue="">
                <option value="">Select song</option>
                {selectableMusic.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
              </select>
            </label>

            <div className="mt-5 grid gap-2">
              {selected.items.length ? selected.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-line bg-white p-3 sm:flex sm:items-center">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-paper text-sm font-semibold text-zinc-500">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.music.title}</p>
                    <p className="truncate text-xs text-zinc-500">{item.music.artist || item.music.sourceType}</p>
                  </div>
                  <div className="col-span-2 flex shrink-0 items-center justify-end gap-1 sm:col-span-1">
                    <button title="Move up" onClick={() => moveSong(index, -1)} disabled={index === 0} className="rounded-md p-2 text-zinc-500 disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button title="Move down" onClick={() => moveSong(index, 1)} disabled={index === selected.items.length - 1} className="rounded-md p-2 text-zinc-500 disabled:opacity-30"><ArrowDown size={16} /></button>
                    <button title="Remove song" onClick={() => removeSong(selected.id, item.musicId)} className="rounded-md p-2 text-zinc-500 hover:text-wine"><X size={16} /></button>
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed border-line bg-white py-10 text-center text-sm text-zinc-500">No songs in this playlist.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
