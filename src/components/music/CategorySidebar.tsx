"use client";

import { Heart, Library, Music2 } from "lucide-react";
import type { Category } from "./types";

type Props = {
  categories: Category[];
  activeCategory: string;
  favoritesOnly: boolean;
  onCategoryChange: (id: string) => void;
  onFavorites: () => void;
};

export function CategorySidebar({ categories, activeCategory, favoritesOnly, onCategoryChange, onFavorites }: Props) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-line bg-white/70 p-5 lg:block">
      <div className="flex items-center gap-2">
        <Music2 className="text-wine" size={24} />
        <div>
          <p className="text-sm text-zinc-500">AWH Digital</p>
          <h1 className="text-lg font-semibold text-ink">Music Library</h1>
        </div>
      </div>
      <nav className="mt-8 grid gap-1">
        <button onClick={() => onCategoryChange("")} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${!activeCategory && !favoritesOnly ? "bg-ink text-white" : "text-zinc-600 hover:bg-paper"}`}>
          <span className="inline-flex items-center gap-2"><Library size={16} /> All Music</span>
        </button>
        <button onClick={onFavorites} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${favoritesOnly ? "bg-ink text-white" : "text-zinc-600 hover:bg-paper"}`}>
          <span className="inline-flex items-center gap-2"><Heart size={16} /> Favorites</span>
        </button>
      </nav>
      <div className="mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Categories</p>
        <div className="mt-2 grid gap-1">
          {categories.map((category) => (
            <button key={category.id} onClick={() => onCategoryChange(category.id)} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${activeCategory === category.id && !favoritesOnly ? "bg-ink text-white" : "text-zinc-600 hover:bg-paper"}`}>
              <span className="truncate">{category.name}</span>
              <span className="text-xs opacity-70">{category._count?.music ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
