"use client";

import { ListPlus, Play, X } from "lucide-react";
import type { Music } from "./types";

type Props = {
  music: Music | null;
  onClose: () => void;
  onPlay: (music: Music) => void;
  onQueue: (music: Music) => void;
  onEdit: (music: Music) => void;
  onDelete: (music: Music) => void;
};

export function MusicDetail({ music, onClose, onPlay, onQueue, onEdit, onDelete }: Props) {
  if (!music) return null;

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
      </section>
    </div>
  );
}
