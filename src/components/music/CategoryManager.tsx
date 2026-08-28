"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiPath } from "@/lib/url";
import type { Category } from "./types";

type Props = {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
};

export function CategoryManager({ open, categories, onClose, onChanged }: Props) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(apiPath(editing ? `/api/categories/${editing.id}` : "/api/categories"), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Failed to save category.");
      return;
    }
    setEditing(null);
    setName("");
    setDescription("");
    setMessage("");
    onChanged();
  }

  async function deleteCategory(category: Category) {
    let response = await fetch(apiPath(`/api/categories/${category.id}`), { method: "DELETE" });
    let data = await response.json();
    if (response.status === 409) {
      const remove = window.confirm(`This category still contains ${data.count} songs.\n\nOK removes category from songs. Cancel keeps it.`);
      if (!remove) return;
      response = await fetch(apiPath(`/api/categories/${category.id}?mode=remove`), { method: "DELETE" });
      data = await response.json();
    }
    if (!response.ok) {
      setMessage(data.message || "Failed to delete category.");
      return;
    }
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <section className="h-full w-full max-w-lg overflow-y-auto bg-paper p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
          <button onClick={onClose} className="rounded-md border border-line px-3 py-2 text-sm">Close</button>
        </div>
        <form onSubmit={saveCategory} className="mt-5 grid gap-3 rounded-lg border border-line bg-white p-4">
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Category name" className="rounded-md border border-line px-3 py-2" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="rounded-md border border-line px-3 py-2" />
          <button className="rounded-md bg-ink px-4 py-2 font-medium text-white">{editing ? "Save Category" : "Create Category"}</button>
        </form>
        {message ? <p className="mt-3 text-sm text-wine">{message}</p> : null}
        <div className="mt-5 grid gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-lg border border-line bg-white p-3">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-zinc-500">{category._count?.music ?? 0} songs</p>
              </div>
              <div className="flex gap-1">
                <button title="Edit" onClick={() => { setEditing(category); setName(category.name); setDescription(category.description ?? ""); }} className="rounded-md p-2 text-zinc-500"><Pencil size={17} /></button>
                <button title="Delete" onClick={() => deleteCategory(category)} className="rounded-md p-2 text-zinc-500 hover:text-wine"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
