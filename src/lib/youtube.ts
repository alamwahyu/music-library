const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeVideoId(input: string) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts[0] === "embed" || parts[0] === "shorts" ? parts[1] : null;
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeThumbnail(videoId?: string | null) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}
