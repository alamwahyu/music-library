"use client";

import { Calendar, Heart, ListPlus, MoreHorizontal, Pencil, Play, Trash2 } from "lucide-react";
import type { Music } from "./types";

type Props = {
  music: Music;
  favorite: boolean;
  onPlay: (music: Music) => void;
  onQueue: (music: Music) => void;
  onPlayNext: (music: Music) => void;
  onFavorite: (music: Music) => void;
  onEdit: (music: Music) => void;
  onDelete: (music: Music) => void;
  onDetail: (music: Music) => void;
};

function formatDuration(seconds?: number | null) {
  if (!seconds) return "-";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function MusicCard({ music, favorite, onPlay, onQueue, onPlayNext, onFavorite, onEdit, onDelete, onDetail }: Props) {
  return (
    <article
      className="group grid cursor-pointer grid-cols-[64px_1fr] gap-3 rounded-lg border border-line bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft lg:grid-cols-[76px_1fr_auto]"
      onClick={() => onDetail(music)}
    >
      <div className="h-16 w-16 overflow-hidden rounded-md bg-zinc-200 lg:h-[76px] lg:w-[76px]">
        {music.coverUrl ? <img src={music.coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-moss to-wine" />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-ink">{music.title}</h3>
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-zinc-600">{music.sourceType}</span>
        </div>
        <p className="truncate text-sm text-zinc-500">{music.artist || "Unknown artist"}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span>{music.category?.name || "Uncategorized"}</span>
          <span>{formatDuration(music.duration)}</span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {new Date(music.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-1 lg:col-span-1">
        <button title="Play" onClick={(event) => { event.stopPropagation(); onPlay(music); }} className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white">
          <Play size={17} />
        </button>
        <button title="Favorite" onClick={(event) => { event.stopPropagation(); onFavorite(music); }} className={`rounded-md p-2 ${favorite ? "text-wine" : "text-zinc-500"}`}>
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <button title="Play next" onClick={(event) => { event.stopPropagation(); onPlayNext(music); }} className="rounded-md p-2 text-zinc-500">
          <MoreHorizontal size={18} />
        </button>
        <button title="Add to queue" onClick={(event) => { event.stopPropagation(); onQueue(music); }} className="rounded-md p-2 text-zinc-500">
          <ListPlus size={18} />
        </button>
        <button title="Edit" onClick={(event) => { event.stopPropagation(); onEdit(music); }} className="rounded-md p-2 text-zinc-500">
          <Pencil size={17} />
        </button>
        <button title="Delete" onClick={(event) => { event.stopPropagation(); onDelete(music); }} className="rounded-md p-2 text-zinc-500 hover:text-wine">
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
