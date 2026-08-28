import type { AudioPlayerAdapter } from "./AudioPlayerAdapter";

type YouTubePlayerApi = {
  loadVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: unknown) => YouTubePlayerApi;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeReady: Promise<void> | null = null;

function loadYouTubeApi() {
  if (youtubeReady) return youtubeReady;
  youtubeReady = new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  });
  return youtubeReady;
}

export class YouTubeAudioAdapter implements AudioPlayerAdapter {
  private player?: YouTubePlayerApi;
  private container: HTMLDivElement;
  private onEnded?: () => void;

  constructor(onEnded?: () => void) {
    this.onEnded = onEnded;
    this.container = document.createElement("div");
    this.container.style.cssText = "position:fixed;left:-9999px;bottom:0;width:1px;height:1px;";
    document.body.appendChild(this.container);
  }

  async load(source: string) {
    await loadYouTubeApi();
    const videoId = source;
    if (!this.player && window.YT?.Player) {
      this.player = new window.YT.Player(this.container, {
        height: "1",
        width: "1",
        videoId,
        events: {
          onStateChange: (event: { data: number }) => {
            if (event.data === 0) this.onEnded?.();
          }
        }
      });
      return;
    }
    this.player?.loadVideoById(videoId);
  }

  async play() {
    this.player?.playVideo();
  }

  pause() {
    this.player?.pauseVideo();
  }

  seek(seconds: number) {
    this.player?.seekTo(seconds, true);
  }

  setVolume(volume: number) {
    this.player?.setVolume(Math.round(volume * 100));
  }

  getCurrentTime() {
    return this.player?.getCurrentTime() ?? 0;
  }

  getDuration() {
    return this.player?.getDuration() ?? 0;
  }

  destroy() {
    this.player?.destroy();
    this.container.remove();
  }
}
