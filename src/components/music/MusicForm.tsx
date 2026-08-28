"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { apiPath } from "@/lib/url";
import type { Category, Music } from "./types";

type Props = {
  open: boolean;
  categories: Category[];
  music?: Music | null;
  onClose: () => void;
  onSaved: () => void;
};

export function MusicForm({ open, categories, music, onClose, onSaved }: Props) {
  const [sourceType, setSourceType] = useState<"MP3" | "YOUTUBE">(music?.sourceType ?? "MP3");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  const initial = useMemo(() => ({
    title: music?.title ?? "",
    artist: music?.artist ?? "",
    categoryId: music?.categoryId ?? "",
    youtubeUrl: music?.youtubeUrl ?? "",
    fileUrl: music?.fileUrl ?? "",
    coverUrl: music?.coverUrl ?? "",
    duration: music?.duration?.toString() ?? "",
    playbackStart: music?.playbackStart?.toString() ?? "",
    playbackEnd: music?.playbackEnd?.toString() ?? "",
    description: music?.description ?? "",
    tags: music?.tags?.join(", ") ?? ""
  }), [music]);

  if (!open) return null;

  async function uploadMp3(file: File) {
    setUploading(true);
    setUploadProgress(35);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(apiPath("/api/music/upload"), { method: "POST", body: formData });
    const data = await response.json();
    setUploadProgress(100);
    setUploading(false);
    if (!response.ok) throw new Error(data.message || "Upload failed.");
    setMessage("Upload successful.");
    return data.path as string;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    let fileUrl = String(form.get("fileUrl") || initial.fileUrl);

    try {
      const file = form.get("mp3");
      if (sourceType === "MP3" && file instanceof File && file.size > 0) {
        fileUrl = await uploadMp3(file);
      }

      const payload = {
        title: String(form.get("title") || ""),
        artist: String(form.get("artist") || ""),
        categoryId: String(form.get("categoryId") || ""),
        sourceType,
        youtubeUrl: sourceType === "YOUTUBE" ? String(form.get("youtubeUrl") || "") : null,
        fileUrl: sourceType === "MP3" ? fileUrl : null,
        coverUrl: String(form.get("coverUrl") || "") || null,
        duration: String(form.get("duration") || "") || null,
        playbackStart: String(form.get("playbackStart") || "") || null,
        playbackEnd: String(form.get("playbackEnd") || "") || null,
        description: String(form.get("description") || "") || null,
        tags: String(form.get("tags") || "")
      };

      const response = await fetch(apiPath(music ? `/api/music/${music.id}` : "/api/music"), {
        method: music ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed.");
      onSaved();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <form onSubmit={handleSubmit} className="h-full w-full max-w-xl overflow-y-auto bg-paper p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{music ? "Edit Music" : "Add Music"}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-2 text-sm">Close</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-line bg-white p-1">
          {(["MP3", "YOUTUBE"] as const).map((type) => (
            <button key={type} type="button" onClick={() => setSourceType(type)} className={`rounded-md px-3 py-2 text-sm font-medium ${sourceType === type ? "bg-ink text-white" : "text-zinc-600"}`}>
              {type === "MP3" ? "Upload MP3" : "YouTube"}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-1 text-sm font-medium">Music Title *<input name="title" required defaultValue={initial.title} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Artist<input name="artist" defaultValue={initial.artist ?? ""} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Category *<select name="categoryId" required defaultValue={initial.categoryId ?? ""} className="rounded-md border border-line bg-white px-3 py-2"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>

          {sourceType === "MP3" ? (
            <>
              <input type="hidden" name="fileUrl" value={initial.fileUrl ?? ""} />
              <label className="grid gap-1 text-sm font-medium">Upload MP3 {music ? "" : "*"}<input name="mp3" type="file" accept=".mp3,audio/mpeg" required={!music} className="rounded-md border border-line bg-white px-3 py-2" /></label>
              {uploading ? <div className="rounded-md bg-white p-3 text-sm"><Upload size={16} className="inline" /> Uploading... {uploadProgress}%</div> : null}
            </>
          ) : (
            <label className="grid gap-1 text-sm font-medium">YouTube URL *<input name="youtubeUrl" required defaultValue={initial.youtubeUrl ?? ""} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          )}

          <label className="grid gap-1 text-sm font-medium">Cover Image URL<input name="coverUrl" defaultValue={initial.coverUrl ?? ""} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Duration in seconds<input name="duration" type="number" min="1" defaultValue={initial.duration} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          <div className="grid gap-3 rounded-lg border border-line bg-white p-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">Start at second<input name="playbackStart" type="number" min="0" defaultValue={initial.playbackStart} placeholder="0" className="rounded-md border border-line bg-paper px-3 py-2" /></label>
            <label className="grid gap-1 text-sm font-medium">Stop at second<input name="playbackEnd" type="number" min="1" defaultValue={initial.playbackEnd} placeholder="Optional" className="rounded-md border border-line bg-paper px-3 py-2" /></label>
          </div>
          <label className="grid gap-1 text-sm font-medium">Description<textarea name="description" defaultValue={initial.description ?? ""} rows={4} className="rounded-md border border-line bg-white px-3 py-2" /></label>
          <label className="grid gap-1 text-sm font-medium">Tags<input name="tags" defaultValue={initial.tags} placeholder="romantic, dinner, entrance" className="rounded-md border border-line bg-white px-3 py-2" /></label>
        </div>

        {message ? <p className="mt-4 rounded-md bg-white px-3 py-2 text-sm text-wine">{message}</p> : null}
        <button className="mt-5 w-full rounded-md bg-wine px-4 py-3 font-semibold text-white">{music ? "Save Changes" : "Add Music"}</button>
      </form>
    </div>
  );
}
