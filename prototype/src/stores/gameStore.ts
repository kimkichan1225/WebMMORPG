import { create } from 'zustand';
import type { GameState, Direction } from '../types';
import { CONFIG } from '../types';

export const useGameStore = create<GameState>((set) => ({
  player: {
    x: (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2,
    y: (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2,
    direction: 'down',
    isMoving: false,
    currentJob: 'Base',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
  },
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
  setPlayerPosition: (x: number, y: number) =>
    set((state) => ({
      player: { ...state.player, x, y },
    })),
  setDirection: (dir: Direction) =>
    set((state) => ({
      player: { ...state.player, direction: dir },
    })),
  setMoving: (moving: boolean) =>
    set((state) => ({
      player: { ...state.player, isMoving: moving },
    })),
  setKey: (key, pressed) =>
    set((state) => ({
      keys: { ...state.keys, [key]: pressed },
    })),
}));
