export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: { music: number };
};

export type Music = {
  id: string;
  title: string;
  artist?: string | null;
  description?: string | null;
  sourceType: "MP3" | "YOUTUBE";
  fileUrl?: string | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  playbackStart?: number | null;
  playbackEnd?: number | null;
  tags: string[];
  categoryId?: string | null;
  category?: Category | null;
  checkpoints: MusicCheckpoint[];
  playCount: number;
  lastPlayedAt?: string | null;
  createdAt: string;
};

export type MusicCheckpoint = {
  id: string;
  musicId: string;
  name: string;
  startSecond: number;
  endSecond?: number | null;
};

export type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { items: number };
};

export type Summary = {
  total: number;
  mp3: number;
  youtube: number;
  categories: number;
};
