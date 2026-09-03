"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FastForward, ListMusic, Pause, Play, Repeat, Rewind, Shuffle, SkipBack, SkipForward, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { usePlayerStore } from "@/lib/player-store";
import { PlayerController } from "@/player/PlayerController";
import { loadYouTubeApi } from "@/player/YouTubePlayer";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function MusicPlayer() {
  const controllerRef = useRef<PlayerController | null>(null);
  const lastMusicId = useRef<string | null>(null);
  const youtubeHostRef = useRef<HTMLDivElement | null>(null);
  const playAttemptRef = useRef<number | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const {
    currentMusic,
    queue,
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
    removeFromQueue,
    clearQueue,
    setVolume,
    setProgress,
    toggleRepeat,
    toggleShuffle
  } = usePlayerStore();

  useEffect(() => {
    controllerRef.current = new PlayerController();
    void loadYouTubeApi();
    return () => controllerRef.current?.destroy();
  }, []);

  const handleEnded = useCallback(() => {
    if (repeatMode === "one" && currentMusic) {
      const start = currentMusic.playbackStart ?? 0;
      controllerRef.current?.seek(start);
      setProgress(start, duration);
      void controllerRef.current?.play();
      return;
    }

    nextMusic();
  }, [currentMusic, duration, nextMusic, repeatMode, setProgress]);

  useEffect(() => {
    if (!currentMusic || !controllerRef.current) return;
    const loadKey = `${currentMusic.id}:${currentMusic.playbackStart ?? 0}:${currentMusic.playbackEnd ?? ""}:${currentMusic.playbackLabel ?? ""}`;
    if (lastMusicId.current === loadKey) return;
    lastMusicId.current = loadKey;
    controllerRef.current.load(currentMusic, handleEnded, youtubeHostRef.current, pauseMusic).then(() => {
      controllerRef.current?.setVolume(volume);
      controllerRef.current?.seek(currentMusic.playbackStart ?? 0);
      if (isPlaying) {
        void controllerRef.current?.play();
        if (currentMusic.sourceType === "YOUTUBE") {
          if (playAttemptRef.current) window.clearTimeout(playAttemptRef.current);
          const expectedStart = currentMusic.playbackStart ?? 0;
          playAttemptRef.current = window.setTimeout(() => {
            const snapshot = controllerRef.current?.snapshot();
            if (!snapshot) return;
            if (snapshot.currentTime <= expectedStart + 0.25) {
              pauseMusic();
            }
          }, 1500);
        }
      }
    });
  }, [currentMusic, handleEnded, isPlaying, pauseMusic, volume]);

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
      if (!snapshot) return;
      const effectiveDuration = snapshot.duration || duration;
      const endSecond = currentMusic?.playbackEnd;
      if (isPlaying && endSecond && snapshot.currentTime >= endSecond) {
        if (repeatMode === "one") {
          handleEnded();
        } else {
          nextMusic();
        }
        return;
      }
      setProgress(snapshot.currentTime, effectiveDuration);
    }, 350);
    return () => window.clearInterval(timer);
  }, [currentMusic?.playbackEnd, currentMusic?.playbackStart, duration, isPlaying, nextMusic, repeatMode, setProgress]);

  const rangeStart = currentMusic?.playbackStart ?? 0;
  const rangeEnd = currentMusic?.playbackEnd ?? duration;
  const progress = useMemo(() => {
    const total = Math.max(0, rangeEnd - rangeStart);
    return total ? Math.min(100, ((currentTime - rangeStart) / total) * 100) : 0;
  }, [currentTime, rangeEnd, rangeStart]);

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

  const isYouTube = currentMusic.sourceType === "YOUTUBE";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 py-3 backdrop-blur lg:px-6">
      {queueOpen ? (
        <div className="absolute bottom-full right-3 mb-2 max-h-80 w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Queue</p>
              <p className="text-xs text-zinc-500">{queue.length} songs waiting</p>
            </div>
            <div className="flex items-center gap-1">
              <button title="Clear queue" onClick={clearQueue} className="rounded-md p-2 text-zinc-500 hover:text-wine">
                <Trash2 size={16} />
              </button>
              <button title="Close queue" onClick={() => setQueueOpen(false)} className="rounded-md p-2 text-zinc-500">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {queue.length ? queue.map((song, index) => (
              <div key={`${song.id}-${index}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-paper">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{song.title}</p>
                  <p className="truncate text-xs text-zinc-500">{song.artist || song.sourceType}</p>
                </div>
                <button title="Remove from queue" onClick={() => removeFromQueue(index)} className="shrink-0 rounded-md p-2 text-zinc-500 hover:text-wine">
                  <X size={15} />
                </button>
              </div>
            )) : <p className="px-2 py-8 text-center text-sm text-zinc-500">No songs in queue.</p>}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[280px_1fr_260px]">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`shrink-0 overflow-hidden rounded-md bg-zinc-200 ${isYouTube ? "h-16 w-28" : "h-12 w-12"}`}>
            <div ref={youtubeHostRef} className={isYouTube ? "h-full w-full [&_iframe]:h-full [&_iframe]:w-full" : "hidden"} />
            {!isYouTube && currentMusic.coverUrl ? <img src={currentMusic.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentMusic.title}</p>
            <p className="truncate text-xs text-zinc-500">{currentMusic.playbackLabel || currentMusic.artist || "Unknown artist"}</p>
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
            <button title={`Repeat ${repeatMode}`} onClick={toggleRepeat} className={`relative rounded-md p-2 ${repeatMode !== "off" ? "text-wine" : "text-zinc-500"}`}>
              <Repeat size={18} />
              {repeatMode === "one" ? <span className="absolute right-0 top-0 grid h-3.5 w-3.5 place-items-center rounded-full bg-wine text-[9px] font-bold text-white">1</span> : null}
            </button>
          </div>
          <div className="grid w-full grid-cols-[42px_1fr_42px] items-center gap-2 text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <input
              aria-label="Progress"
              className="range w-full"
              type="range"
              min={0}
              max={rangeEnd || duration || 0}
              value={currentTime}
              onChange={(event) => controllerRef.current?.seek(Math.max(rangeStart, Number(event.target.value)))}
            />
            <span>{formatTime(rangeEnd || duration)}</span>
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
          <button title="Queue" onClick={() => setQueueOpen((open) => !open)} className="relative rounded-md p-2 text-zinc-600">
            <ListMusic size={18} />
            {queue.length ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-wine px-1 text-[10px] font-bold text-white">{queue.length}</span> : null}
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
