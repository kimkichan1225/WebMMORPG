import { create } from 'zustand';
import mapsData from '../data/maps.json';

export interface MapInfo {
  id: string;
  name: string;
  nameEn: string;
}

interface MapState {
  // Current map
  currentMapId: string;
  currentMapName: string;

  // Player position on current map
  playerX: number;
  playerY: number;

  // Map transition state
  isTransitioning: boolean;
  transitionTargetMap: string | null;
  transitionTargetX: number;
  transitionTargetY: number;

  // Available maps
  availableMaps: MapInfo[];

  // Actions
  setCurrentMap: (mapId: string, playerX: number, playerY: number) => void;
  startMapTransition: (targetMap: string, targetX: number, targetY: number) => void;
  completeMapTransition: () => void;
  cancelMapTransition: () => void;
  updatePlayerPosition: (x: number, y: number) => void;
}

// Load available maps from data
const loadAvailableMaps = (): MapInfo[] => {
  const maps = mapsData.maps as Record<string, { name: string; nameEn: string }>;
  return Object.entries(maps).map(([id, data]) => ({
    id,
    name: data.name,
    nameEn: data.nameEn,
  }));
};

// Get map name by ID
const getMapName = (mapId: string): string => {
  const maps = mapsData.maps as Record<string, { name: string }>;
  return maps[mapId]?.name || '알 수 없는 지역';
};

export const useMapStore = create<MapState>((set, get) => ({
  currentMapId: mapsData.startMap,
  currentMapName: getMapName(mapsData.startMap),
  playerX: mapsData.startPosition.x,
  playerY: mapsData.startPosition.y,

  isTransitioning: false,
  transitionTargetMap: null,
  transitionTargetX: 0,
  transitionTargetY: 0,

  availableMaps: loadAvailableMaps(),

  setCurrentMap: (mapId: string, playerX: number, playerY: number) => {
    set({
      currentMapId: mapId,
      currentMapName: getMapName(mapId),
      playerX,
      playerY,
      isTransitioning: false,
      transitionTargetMap: null,
    });
  },

  startMapTransition: (targetMap: string, targetX: number, targetY: number) => {
    set({
      isTransitioning: true,
      transitionTargetMap: targetMap,
      transitionTargetX: targetX,
      transitionTargetY: targetY,
    });
  },

  completeMapTransition: () => {
    const { transitionTargetMap, transitionTargetX, transitionTargetY } = get();
    if (transitionTargetMap) {
      set({
        currentMapId: transitionTargetMap,
        currentMapName: getMapName(transitionTargetMap),
        playerX: transitionTargetX,
        playerY: transitionTargetY,
        isTransitioning: false,
        transitionTargetMap: null,
      });
    }
  },

  cancelMapTransition: () => {
    set({
      isTransitioning: false,
      transitionTargetMap: null,
      transitionTargetX: 0,
      transitionTargetY: 0,
    });
  },

  updatePlayerPosition: (x: number, y: number) => {
    set({ playerX: x, playerY: y });
  },
}));

// Map transition effect duration
export const MAP_TRANSITION_DURATION = 500; // ms
