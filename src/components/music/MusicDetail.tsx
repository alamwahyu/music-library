"use client";

import { useState } from "react";
import { Clock3, ListPlus, Play, Trash2, X } from "lucide-react";
import { apiPath } from "@/lib/url";
import type { Music, MusicCheckpoint } from "./types";

type Props = {
  music: Music | null;
  onClose: () => void;
  onPlay: (music: Music) => void;
  onPlayCheckpoint: (music: Music, checkpoint: MusicCheckpoint) => void;
  onQueue: (music: Music) => void;
  onEdit: (music: Music) => void;
  onDelete: (music: Music) => void;
  onChanged: (musicId: string) => void;
};

function formatSeconds(seconds?: number | null) {
  if (seconds == null) return "--";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function MusicDetail({ music, onClose, onPlay, onPlayCheckpoint, onQueue, onEdit, onDelete, onChanged }: Props) {
  const [message, setMessage] = useState("");
  if (!music) return null;
  const selectedMusic = music;

  async function createCheckpoint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(apiPath(`/api/music/${selectedMusic.id}/checkpoints`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        startSecond: String(form.get("startSecond") || "0"),
        endSecond: String(form.get("endSecond") || "") || null
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Failed to save checkpoint.");
      return;
    }
    event.currentTarget.reset();
    onChanged(selectedMusic.id);
  }

  async function deleteCheckpoint(checkpoint: MusicCheckpoint) {
    const response = await fetch(apiPath(`/api/music/${selectedMusic.id}/checkpoints/${checkpoint.id}`), { method: "DELETE" });
    if (!response.ok) setMessage("Failed to delete checkpoint.");
    onChanged(selectedMusic.id);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <section className="h-full w-full max-w-md overflow-y-auto bg-paper p-5 shadow-soft">
        <div className="flex justify-end">
          <button title="Close" onClick={onClose} className="rounded-md p-2"><X size={20} /></button>
        </div>
        <div className="aspect-square overflow-hidden rounded-lg bg-zinc-200">
          {music.coverUrl ? <img src={music.coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-moss to-wine" />}
        </div>
        <div className="mt-5">
          <span className="rounded-full border border-line px-2 py-1 text-xs font-semibold">{music.sourceType}</span>
          <h2 className="mt-3 text-2xl font-semibold">{music.title}</h2>
          <p className="text-zinc-500">{music.artist || "Unknown artist"}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div><dt className="text-zinc-500">Category</dt><dd>{music.category?.name || "Uncategorized"}</dd></div>
            <div><dt className="text-zinc-500">Default Playback</dt><dd>{formatSeconds(music.playbackStart ?? 0)} - {music.playbackEnd == null ? "end" : formatSeconds(music.playbackEnd)}</dd></div>
            <div><dt className="text-zinc-500">Tags</dt><dd>{music.tags.length ? music.tags.join(", ") : "-"}</dd></div>
            <div><dt className="text-zinc-500">Description</dt><dd>{music.description || "-"}</dd></div>
          </dl>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={() => onPlay(music)} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-medium text-white"><Play size={18} /> Play</button>
          <button onClick={() => onQueue(music)} className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 font-medium"><ListPlus size={18} /> Queue</button>
          <button onClick={() => onEdit(music)} className="rounded-md border border-line bg-white px-4 py-3 font-medium">Edit</button>
          <button onClick={() => onDelete(music)} className="rounded-md bg-wine px-4 py-3 font-medium text-white">Delete</button>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-4">
          <div className="flex items-center gap-2">
            <Clock3 size={17} />
            <h3 className="font-semibold">Checkpoint Templates</h3>
          </div>
          <form onSubmit={createCheckpoint} className="mt-4 grid gap-2">
            <input name="name" required placeholder="Template name, e.g. Reff only" className="rounded-md border border-line bg-paper px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input name="startSecond" required type="number" min="0" placeholder="Start second" className="rounded-md border border-line bg-paper px-3 py-2 text-sm" />
              <input name="endSecond" type="number" min="1" placeholder="End second" className="rounded-md border border-line bg-paper px-3 py-2 text-sm" />
            </div>
            <button className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white">Save Checkpoint</button>
          </form>
          {message ? <p className="mt-3 text-sm text-wine">{message}</p> : null}
          <div className="mt-4 grid gap-2">
            {music.checkpoints.length ? music.checkpoints.map((checkpoint) => (
              <div key={checkpoint.id} className="flex items-center justify-between gap-2 rounded-md border border-line bg-paper p-2">
                <button onClick={() => onPlayCheckpoint(music, checkpoint)} className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium">{checkpoint.name}</p>
                  <p className="text-xs text-zinc-500">{formatSeconds(checkpoint.startSecond)} - {checkpoint.endSecond == null ? "end" : formatSeconds(checkpoint.endSecond)}</p>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button title="Play checkpoint" onClick={() => onPlayCheckpoint(music, checkpoint)} className="rounded-md p-2 text-zinc-600"><Play size={15} /></button>
                  <button title="Delete checkpoint" onClick={() => deleteCheckpoint(checkpoint)} className="rounded-md p-2 text-zinc-600 hover:text-wine"><Trash2 size={15} /></button>
                </div>
              </div>
            )) : <p className="text-sm text-zinc-500">No checkpoint templates yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
