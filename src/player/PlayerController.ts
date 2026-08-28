import type { AudioPlayerAdapter } from "./AudioPlayerAdapter";
import { HTML5AudioAdapter } from "./HTML5AudioPlayer";
import { YouTubeAudioAdapter } from "./YouTubePlayer";

export type PlayerMusic = {
  id: string;
  title: string;
  artist?: string | null;
  sourceType: "MP3" | "YOUTUBE";
  fileUrl?: string | null;
  youtubeVideoId?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
};

export class PlayerController {
  private adapter?: AudioPlayerAdapter;

  async load(music: PlayerMusic, onEnded: () => void) {
    this.adapter?.destroy();
    this.adapter = music.sourceType === "MP3" ? new HTML5AudioAdapter(onEnded) : new YouTubeAudioAdapter(onEnded);
    const source = music.sourceType === "MP3" ? music.fileUrl : music.youtubeVideoId;
    if (!source) throw new Error("Music source is missing.");
    await this.adapter.load(source);
  }

  play() {
    return this.adapter?.play();
  }

  pause() {
    this.adapter?.pause();
  }

  seek(seconds: number) {
    this.adapter?.seek(seconds);
  }

  setVolume(volume: number) {
    this.adapter?.setVolume(volume);
  }

  snapshot() {
    return {
      currentTime: this.adapter?.getCurrentTime() ?? 0,
      duration: this.adapter?.getDuration() ?? 0
    };
  }

  destroy() {
    this.adapter?.destroy();
  }
}
