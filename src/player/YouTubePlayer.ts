import type { AudioPlayerAdapter } from "./AudioPlayerAdapter";

type YouTubePlayerApi = {
  cueVideoById(id: string): void;
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
      Player: new (elementId: string, options: unknown) => YouTubePlayerApi;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeReady: Promise<void> | null = null;

export function loadYouTubeApi() {
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
  private ownsContainer = true;
  private onEnded?: () => void;
  private onBlocked?: () => void;
  private ready?: Promise<void>;
  private readyResolve?: () => void;
  private volume = 80;

  constructor(onEnded?: () => void, mountElement?: HTMLDivElement | null, onBlocked?: () => void) {
    this.onEnded = onEnded;
    this.onBlocked = onBlocked;
    this.container = mountElement ?? document.createElement("div");
    this.container.id = `youtube-player-${crypto.randomUUID()}`;
    if (mountElement) {
      this.ownsContainer = false;
      this.container.innerHTML = "";
    } else {
      this.container.style.cssText = "position:fixed;left:-9999px;bottom:0;width:1px;height:1px;";
      document.body.appendChild(this.container);
    }
  }

  async load(source: string) {
    await loadYouTubeApi();
    const videoId = source;
    if (!this.player && window.YT?.Player) {
      this.ready = new Promise((resolve) => {
        this.readyResolve = resolve;
      });
      this.player = new window.YT.Player(this.container.id, {
        height: "90",
        width: "160",
        videoId,
        host: "https://www.youtube.com",
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            this.safeCall("setVolume", this.volume);
            this.readyResolve?.();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === 0) this.onEnded?.();
          },
          onAutoplayBlocked: () => this.onBlocked?.()
        }
      });
      await this.ready;
      return;
    }
    await this.ready;
    this.safeCall("loadVideoById", videoId);
  }

  async play() {
    await this.ready;
    this.safeCall("playVideo");
  }

  pause() {
    this.safeCall("pauseVideo");
  }

  seek(seconds: number) {
    this.safeCall("seekTo", seconds, true);
  }

  setVolume(volume: number) {
    this.volume = Math.round(volume * 100);
    this.safeCall("setVolume", this.volume);
  }

  getCurrentTime() {
    return this.safeRead("getCurrentTime");
  }

  getDuration() {
    return this.safeRead("getDuration");
  }

  destroy() {
    this.safeCall("destroy");
    if (this.ownsContainer) this.container.remove();
    else this.container.innerHTML = "";
  }

  private safeCall(method: keyof YouTubePlayerApi, ...args: unknown[]) {
    const candidate = this.player?.[method];
    if (typeof candidate === "function") {
      (candidate as (...methodArgs: unknown[]) => void).apply(this.player, args);
    }
  }

  private safeRead(method: "getCurrentTime" | "getDuration") {
    const candidate = this.player?.[method];
    if (typeof candidate !== "function") return 0;
    const value = candidate.apply(this.player);
    return Number.isFinite(value) ? value : 0;
  }
}
