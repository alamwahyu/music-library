import type { AudioPlayerAdapter } from "./AudioPlayerAdapter";

export class HTML5AudioAdapter implements AudioPlayerAdapter {
  private audio: HTMLAudioElement;

  constructor(onEnded?: () => void) {
    this.audio = new Audio();
    this.audio.addEventListener("ended", () => onEnded?.());
  }

  async load(source: string) {
    this.audio.src = source;
    this.audio.load();
  }

  async play() {
    await this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(seconds: number) {
    this.audio.currentTime = seconds;
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  getCurrentTime() {
    return this.audio.currentTime || 0;
  }

  getDuration() {
    return Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
  }

  destroy() {
    this.audio.pause();
    this.audio.src = "";
  }
}
