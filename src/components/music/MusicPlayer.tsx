"use client";

import { useEffect, useMemo, useRef } from "react";
import { FastForward, Pause, Play, Repeat, Rewind, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/lib/player-store";
import { PlayerController } from "@/player/PlayerController";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function MusicPlayer() {
  const controllerRef = useRef<PlayerController | null>(null);
  const lastMusicId = useRef<string | null>(null);
  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    shuffle,
    pauseMusic,
    resumeMusic,
    nextMusic,
    previousMusic,
    setVolume,
    setProgress,
    toggleRepeat,
    toggleShuffle
  } = usePlayerStore();

  useEffect(() => {
    controllerRef.current = new PlayerController();
    return () => controllerRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!currentMusic || !controllerRef.current) return;
    if (lastMusicId.current === currentMusic.id) return;
    lastMusicId.current = currentMusic.id;
    controllerRef.current.load(currentMusic, nextMusic).then(() => {
      controllerRef.current?.setVolume(volume);
      if (isPlaying) void controllerRef.current?.play();
    });
  }, [currentMusic, isPlaying, nextMusic, volume]);

  useEffect(() => {
    if (!controllerRef.current || !currentMusic) return;
    if (isPlaying) void controllerRef.current.play();
    else controllerRef.current.pause();
  }, [isPlaying, currentMusic]);

  useEffect(() => {
    controllerRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const snapshot = controllerRef.current?.snapshot();
      if (snapshot) setProgress(snapshot.currentTime, snapshot.duration || duration);
    }, 500);
    return () => window.clearInterval(timer);
  }, [duration, setProgress]);

  const progress = useMemo(() => (duration ? Math.min(100, (currentTime / duration) * 100) : 0), [currentTime, duration]);

  if (!currentMusic) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-zinc-500">
          <span>No song selected</span>
          <span>Queue ready</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 py-3 backdrop-blur lg:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[280px_1fr_260px]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-200">
            {currentMusic.coverUrl ? <img src={currentMusic.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentMusic.title}</p>
            <p className="truncate text-xs text-zinc-500">{currentMusic.artist || "Unknown artist"}</p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-col items-center gap-2 lg:flex">
          <div className="flex items-center gap-2">
            <button title="Shuffle" onClick={toggleShuffle} className={`rounded-md p-2 ${shuffle ? "text-wine" : "text-zinc-500"}`}>
              <Shuffle size={18} />
            </button>
            <button title="Previous" onClick={previousMusic} className="rounded-md p-2 text-zinc-700">
              <SkipBack size={20} />
            </button>
            <button
              title={isPlaying ? "Pause" : "Play"}
              onClick={isPlaying ? pauseMusic : resumeMusic}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white"
            >
              {isPlaying ? <Pause size={19} /> : <Play size={19} />}
            </button>
            <button title="Next" onClick={nextMusic} className="rounded-md p-2 text-zinc-700">
              <SkipForward size={20} />
            </button>
            <button title="Repeat" onClick={toggleRepeat} className={`rounded-md p-2 ${repeatMode !== "off" ? "text-wine" : "text-zinc-500"}`}>
              <Repeat size={18} />
            </button>
          </div>
          <div className="grid w-full grid-cols-[42px_1fr_42px] items-center gap-2 text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <input
              aria-label="Progress"
              className="range w-full"
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(event) => controllerRef.current?.seek(Number(event.target.value))}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-md p-2 lg:hidden" onClick={() => controllerRef.current?.seek(Math.max(0, currentTime - 10))}>
            <Rewind size={18} />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white lg:hidden" onClick={isPlaying ? pauseMusic : resumeMusic}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="rounded-md p-2 lg:hidden" onClick={() => controllerRef.current?.seek(currentTime + 10)}>
            <FastForward size={18} />
          </button>
          <button title="Mute" onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="hidden rounded-md p-2 text-zinc-600 lg:block">
            {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            aria-label="Volume"
            className="range hidden w-28 lg:block"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200 lg:hidden">
        <div className="h-full bg-wine" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
