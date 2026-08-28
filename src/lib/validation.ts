import { z } from "zod";

export const musicSourceTypes = ["MP3", "YOUTUBE"] as const;

export const musicPayloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  artist: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  sourceType: z.enum(musicSourceTypes),
  fileUrl: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  coverUrl: z.string().trim().optional().nullable(),
  duration: z.coerce.number().int().positive().optional().nullable(),
  categoryId: z.string().trim().min(1).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional().default([])
});

export const categoryPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().nullable()
});

export const playlistPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().nullable()
});

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function parseTags(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}
