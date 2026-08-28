"use client";

import { create } from "zustand";
import type { PlayerMusic } from "@/player/PlayerController";

type RepeatMode = "off" | "one" | "all";

type PlayerState = {
  currentMusic: PlayerMusic | null;
  queue: PlayerMusic[];
  history: PlayerMusic[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playMusic: (music: PlayerMusic, queue?: PlayerMusic[]) => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  nextMusic: () => void;
  previousMusic: () => void;
  addToQueue: (music: PlayerMusic) => void;
  playNext: (music: PlayerMusic) => void;
  setVolume: (volume: number) => void;
  setProgress: (currentTime: number, duration: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentMusic: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  repeatMode: "off",
  shuffle: false,
  playMusic: (music, queue = []) =>
    set((state) => ({
      currentMusic: music,
      queue,
      history: state.currentMusic ? [state.currentMusic, ...state.history].slice(0, 30) : state.history,
      isPlaying: true,
      currentTime: music.playbackStart ?? 0,
      duration: music.duration ?? 0
    })),
  pauseMusic: () => set({ isPlaying: false }),
  resumeMusic: () => set({ isPlaying: true }),
  nextMusic: () => {
    const state = get();
    if (state.repeatMode === "one" && state.currentMusic) {
      set({ currentTime: 0, isPlaying: true });
      return;
    }
    const nextIndex = state.shuffle && state.queue.length > 1 ? Math.floor(Math.random() * state.queue.length) : 0;
    const next = state.queue[nextIndex];
    if (!next) {
      if (state.repeatMode === "all" && state.history.length) {
        const replay = [...state.history].reverse();
        set({ currentMusic: replay[0], queue: replay.slice(1), history: [], isPlaying: true, currentTime: replay[0]?.playbackStart ?? 0 });
      } else {
        set({ isPlaying: false });
      }
      return;
    }
    set({
      currentMusic: next,
      queue: state.queue.filter((_, index) => index !== nextIndex),
      history: state.currentMusic ? [state.currentMusic, ...state.history].slice(0, 30) : state.history,
      isPlaying: true,
      currentTime: next.playbackStart ?? 0,
      duration: next.duration ?? 0
    });
  },
  previousMusic: () => {
    const [previous, ...rest] = get().history;
    if (!previous) return;
    set((state) => ({
      currentMusic: previous,
      queue: state.currentMusic ? [state.currentMusic, ...state.queue] : state.queue,
      history: rest,
      isPlaying: true,
      currentTime: previous.playbackStart ?? 0
    }));
  },
  addToQueue: (music) => set((state) => ({ queue: [...state.queue, music] })),
  playNext: (music) => set((state) => ({ queue: [music, ...state.queue] })),
  setVolume: (volume) => set({ volume }),
  setProgress: (currentTime, duration) => set({ currentTime, duration }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === "off" ? "all" : state.repeatMode === "all" ? "one" : "off"
    }))
}));
