"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, FolderCog, Plus, Search } from "lucide-react";
import { usePlayerStore } from "@/lib/player-store";
import { apiPath } from "@/lib/url";
import { CategoryManager } from "./CategoryManager";
import { CategorySidebar } from "./CategorySidebar";
import { MusicCard } from "./MusicCard";
import { MusicDetail } from "./MusicDetail";
import { MusicForm } from "./MusicForm";
import { MusicPlayer } from "./MusicPlayer";
import { PlaylistManager } from "./PlaylistManager";
import type { Category, Music, Playlist, Summary } from "./types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const defaultSummary: Summary = { total: 0, mp3: 0, youtube: 0, categories: 0 };

function SkeletonList() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[76px_1fr] gap-3 rounded-lg border border-line bg-white p-3">
          <div className="h-[76px] rounded-md bg-zinc-200" />
          <div className="space-y-3 py-2">
            <div className="h-4 w-2/5 rounded bg-zinc-200" />
            <div className="h-3 w-1/4 rounded bg-zinc-200" />
            <div className="h-3 w-3/5 rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MusicLibraryClient() {
  const [music, setMusic] = useState<Music[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [sort, setSort] = useState("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingMusic, setEditingMusic] = useState<Music | null>(null);
  const [detailMusic, setDetailMusic] = useState<Music | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Music | null>(null);
  const player = usePlayerStore();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const saved = window.localStorage.getItem("music-library:favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("music-library:favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryId) params.set("categoryId", categoryId);
    if (sourceType) params.set("sourceType", sourceType);
    if (sort) params.set("sort", sort);
    const [musicResponse, categoryResponse, playlistResponse] = await Promise.all([
      fetch(apiPath(`/api/music?${params.toString()}`)),
      fetch(apiPath("/api/categories")),
      fetch(apiPath("/api/playlists"))
    ]);
    const musicData = await musicResponse.json();
    setMusic(musicData.music ?? []);
    setSummary(musicData.summary ?? defaultSummary);
    setCategories(await categoryResponse.json());
    setPlaylists(await playlistResponse.json());
    setLoading(false);
  }, [categoryId, debouncedSearch, sort, sourceType]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const visibleMusic = useMemo(() => {
    return favoritesOnly ? music.filter((song) => favorites.includes(song.id)) : music;
  }, [favorites, favoritesOnly, music]);

  function playSong(song: Music) {
    const queue = visibleMusic.filter((item) => item.id !== song.id);
    player.playMusic(song, queue);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(apiPath(`/api/music/${deleteTarget.id}`), { method: "DELETE" });
    setDeleteTarget(null);
    setDetailMusic(null);
    await fetchAll();
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
      <div className="flex min-h-screen">
        <CategorySidebar
          categories={categories}
          activeCategory={categoryId}
          favoritesOnly={favoritesOnly}
          onCategoryChange={(id) => { setCategoryId(id); setFavoritesOnly(false); }}
          onFavorites={() => { setFavoritesOnly(true); setCategoryId(""); }}
        />

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-ink lg:text-3xl">Music Library</h1>
              <p className="mt-1 text-sm text-zinc-500">Store, organize, search, and play your music from the browser.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setEditingMusic(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-wine px-4 py-2 text-sm font-semibold text-white"><Plus size={17} /> Add Music</button>
              <button onClick={() => setCategoryOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold"><FolderCog size={17} /> Manage Categories</button>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard label="Total Music" value={summary.total} />
            <SummaryCard label="MP3" value={summary.mp3} />
            <SummaryCard label="YouTube" value={summary.youtube} />
            <SummaryCard label="Categories" value={summary.categories} />
          </section>

          <section className="mt-5 grid gap-3 rounded-lg border border-line bg-white p-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
              <Search size={18} className="text-zinc-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, artist, tags, category" className="min-w-0 flex-1 outline-none" />
            </label>
            <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setFavoritesOnly(false); }} className="rounded-md border border-line px-3 py-2">
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="rounded-md border border-line px-3 py-2">
              <option value="">All Sources</option>
              <option value="MP3">MP3</option>
              <option value="YOUTUBE">YouTube</option>
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-line px-3 py-2">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="artist-asc">Artist A-Z</option>
            </select>
          </section>

          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            <button onClick={() => { setCategoryId(""); setFavoritesOnly(false); }} className="shrink-0 rounded-full border border-line bg-white px-3 py-2 text-sm">All Music</button>
            <button onClick={() => setFavoritesOnly(true)} className="shrink-0 rounded-full border border-line bg-white px-3 py-2 text-sm">Favorites</button>
            {categories.map((category) => <button key={category.id} onClick={() => { setCategoryId(category.id); setFavoritesOnly(false); }} className="shrink-0 rounded-full border border-line bg-white px-3 py-2 text-sm">{category.name}</button>)}
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
              <Filter size={16} />
              <span>{visibleMusic.length} songs shown</span>
            </div>
            {loading ? <SkeletonList /> : visibleMusic.length ? (
              <div className="grid gap-3">
                {visibleMusic.map((song) => (
                  <MusicCard
                    key={song.id}
                    music={song}
                    favorite={favorites.includes(song.id)}
                    onPlay={playSong}
                    onQueue={player.addToQueue}
                    onPlayNext={player.playNext}
                    onFavorite={(item) => setFavorites((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}
                    onEdit={(item) => { setEditingMusic(item); setFormOpen(true); }}
                    onDelete={setDeleteTarget}
                    onDetail={setDetailMusic}
                  />
                ))}
              </div>
            ) : (
              <div className="grid place-items-center rounded-lg border border-dashed border-line bg-white py-16 text-center">
                <div>
                  <h2 className="text-lg font-semibold">{categoryId ? "No music in this category." : "No music in your library yet."}</h2>
                  <button onClick={() => setFormOpen(true)} className="mt-4 rounded-md bg-wine px-4 py-2 text-sm font-semibold text-white">Add Your First Music</button>
                </div>
              </div>
            )}
          </section>
        </main>

        <PlaylistManager playlists={playlists} music={music} onChanged={fetchAll} />
      </div>

      <MusicForm open={formOpen} categories={categories} music={editingMusic} onClose={() => setFormOpen(false)} onSaved={fetchAll} />
      <CategoryManager open={categoryOpen} categories={categories} onClose={() => setCategoryOpen(false)} onChanged={fetchAll} />
      <MusicDetail music={detailMusic} onClose={() => setDetailMusic(null)} onPlay={playSong} onQueue={player.addToQueue} onEdit={(item) => { setEditingMusic(item); setFormOpen(true); }} onDelete={setDeleteTarget} />
      <ConfirmDialog open={Boolean(deleteTarget)} title={`Delete "${deleteTarget?.title ?? ""}"?`} description="This action cannot be undone." onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      <MusicPlayer />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
