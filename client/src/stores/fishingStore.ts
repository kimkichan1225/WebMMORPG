import { create } from 'zustand';
import {
  type FishingState,
  type FishingSpot,
  type Fish,
  type CaughtFish,
  FISHING_SPOTS,
  FISH_DATA,
  FISHING_CONFIG,
  selectRandomFish,
  calculateFishSize,
  calculateFishPrice,
  getFishingExp,
} from '../game/systems/FishingSystem';

interface FishingStoreState {
  // Fishing skill
  fishingLevel: number;
  fishingExp: number;
  fishingExpToNextLevel: number;

  // Current fishing state
  state: FishingState;
  currentSpot: FishingSpot | null;
  targetFish: Fish | null;
  castTimer: number;
  waitTimer: number;
  biteWindow: number;
  reelProgress: number;
  fishSize: number;
  perfectCatch: boolean;

  // Caught fish collection
  caughtFish: CaughtFish[];
  totalFishCaught: number;
  largestFish: { fish: Fish; size: number } | null;

  // Fish collection (for records)
  fishCollection: Set<string>;

  // Actions
  startFishing: (spot: FishingSpot) => void;
  cancelFishing: () => void;
  updateFishing: (deltaTime: number) => void;
  onBiteReact: () => void;
  onReelClick: () => void;
  collectFish: () => { fish: Fish; size: number; price: number; exp: number } | null;
  sellFish: (fish: CaughtFish) => number;
  sellAllFish: () => number;
  getFishingSpotsForMap: (mapId: string) => FishingSpot[];
  isNearFishingSpot: (x: number, y: number, mapId: string) => FishingSpot | null;
}

const calculateExpToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.3, level - 1));
};

export const useFishingStore = create<FishingStoreState>((set, get) => ({
  fishingLevel: 1,
  fishingExp: 0,
  fishingExpToNextLevel: calculateExpToNextLevel(1),

  state: 'idle',
  currentSpot: null,
  targetFish: null,
  castTimer: 0,
  waitTimer: 0,
  biteWindow: 0,
  reelProgress: 0,
  fishSize: 0,
  perfectCatch: false,

  caughtFish: [],
  totalFishCaught: 0,
  largestFish: null,

  fishCollection: new Set(),

  startFishing: (spot) => {
    const { state } = get();
    if (state !== 'idle') return;

    set({
      state: 'casting',
      currentSpot: spot,
      castTimer: FISHING_CONFIG.CAST_TIME,
      targetFish: null,
      reelProgress: 0,
      fishSize: 0,
      perfectCatch: false,
    });
  },

  cancelFishing: () => {
    set({
      state: 'idle',
      currentSpot: null,
      targetFish: null,
      castTimer: 0,
      waitTimer: 0,
      biteWindow: 0,
      reelProgress: 0,
    });
  },

  updateFishing: (deltaTime) => {
    const s = get();

    switch (s.state) {
      case 'casting':
        if (s.castTimer <= 0) {
          const waitTime =
            FISHING_CONFIG.MIN_WAIT_TIME +
            Math.random() * (FISHING_CONFIG.MAX_WAIT_TIME - FISHING_CONFIG.MIN_WAIT_TIME);

          set({
            state: 'waiting',
            castTimer: 0,
            waitTimer: waitTime,
          });
        } else {
          set({ castTimer: s.castTimer - deltaTime });
        }
        break;

      case 'waiting':
        if (s.waitTimer <= 0 && s.currentSpot) {
          const fish = selectRandomFish(s.currentSpot, s.fishingLevel);
          if (fish) {
            set({
              state: 'bite',
              waitTimer: 0,
              biteWindow: FISHING_CONFIG.BITE_WINDOW,
              targetFish: fish,
            });
          } else {
            // No fish available, go back to waiting
            set({
              waitTimer:
                FISHING_CONFIG.MIN_WAIT_TIME +
                Math.random() * (FISHING_CONFIG.MAX_WAIT_TIME - FISHING_CONFIG.MIN_WAIT_TIME),
            });
          }
        } else {
          set({ waitTimer: s.waitTimer - deltaTime });
        }
        break;

      case 'bite':
        if (s.biteWindow <= 0) {
          // Missed the bite
          set({
            state: 'failed',
            biteWindow: 0,
            targetFish: null,
          });

          // Auto reset after delay
          setTimeout(() => {
            const current = get();
            if (current.state === 'failed') {
              set({ state: 'idle', currentSpot: null });
            }
          }, 2000);
        } else {
          set({ biteWindow: s.biteWindow - deltaTime });
        }
        break;

      case 'reeling':
        // Decay reel progress over time
        const newProgress = Math.max(0, s.reelProgress - FISHING_CONFIG.REEL_DECAY);

        if (s.reelProgress >= FISHING_CONFIG.REEL_TARGET) {
          // Caught the fish!
          const isPerfect = s.biteWindow > FISHING_CONFIG.BITE_WINDOW * 0.8;
          const size = s.targetFish ? calculateFishSize(s.targetFish, isPerfect) : 0;

          set({
            state: 'caught',
            reelProgress: FISHING_CONFIG.REEL_TARGET,
            fishSize: size,
            perfectCatch: isPerfect,
          });
        } else {
          set({ reelProgress: newProgress });
        }
        break;
    }
  },

  onBiteReact: () => {
    const { state, biteWindow } = get();
    if (state !== 'bite') return;

    // Check if reaction was quick (for perfect catch)
    const perfectWindow = biteWindow > FISHING_CONFIG.BITE_WINDOW * 0.8;

    set({
      state: 'reeling',
      perfectCatch: perfectWindow,
      reelProgress: 20, // Start with some progress
    });
  },

  onReelClick: () => {
    const { state, reelProgress } = get();
    if (state !== 'reeling') return;

    const newProgress = Math.min(
      reelProgress + FISHING_CONFIG.REEL_GAIN,
      FISHING_CONFIG.REEL_TARGET
    );
    set({ reelProgress: newProgress });
  },

  collectFish: () => {
    const s = get();
    if (s.state !== 'caught' || !s.targetFish) return null;

    const fish = s.targetFish;
    const size = s.fishSize;
    const price = calculateFishPrice(fish, size);
    const exp = getFishingExp(fish, size);

    // Add to caught fish
    const caughtEntry: CaughtFish = {
      fishId: fish.id,
      size,
      timestamp: Date.now(),
    };

    // Update fishing exp and level
    let newExp = s.fishingExp + exp;
    let newLevel = s.fishingLevel;
    let newExpToNext = s.fishingExpToNextLevel;

    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel++;
      newExpToNext = calculateExpToNextLevel(newLevel);
    }

    // Check for largest fish
    let newLargest = s.largestFish;
    if (!s.largestFish || size > s.largestFish.size) {
      newLargest = { fish, size };
    }

    // Add to collection
    const newCollection = new Set(s.fishCollection);
    newCollection.add(fish.id);

    set({
      state: 'idle',
      currentSpot: null,
      targetFish: null,
      caughtFish: [...s.caughtFish, caughtEntry],
      totalFishCaught: s.totalFishCaught + 1,
      fishingExp: newExp,
      fishingLevel: newLevel,
      fishingExpToNextLevel: newExpToNext,
      largestFish: newLargest,
      fishCollection: newCollection,
    });

    return { fish, size, price, exp };
  },

  sellFish: (caughtFishEntry) => {
    const fish = FISH_DATA[caughtFishEntry.fishId];
    if (!fish) return 0;

    const price = calculateFishPrice(fish, caughtFishEntry.size);

    set((state) => ({
      caughtFish: state.caughtFish.filter((f) => f !== caughtFishEntry),
    }));

    return price;
  },

  sellAllFish: () => {
    const { caughtFish } = get();
    let totalPrice = 0;

    caughtFish.forEach((entry) => {
      const fish = FISH_DATA[entry.fishId];
      if (fish) {
        totalPrice += calculateFishPrice(fish, entry.size);
      }
    });

    set({ caughtFish: [] });
    return totalPrice;
  },

  getFishingSpotsForMap: (mapId) => {
    return FISHING_SPOTS.filter((spot) => spot.mapId === mapId);
  },

  isNearFishingSpot: (x, y, mapId) => {
    const spots = FISHING_SPOTS.filter((spot) => spot.mapId === mapId);
    const interactRange = 80;

    for (const spot of spots) {
      const centerX = spot.x + spot.width / 2;
      const centerY = spot.y + spot.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < interactRange + Math.max(spot.width, spot.height) / 2) {
        return spot;
      }
    }

    return null;
  },
}));

// Helper to get fish data
export const getFishData = (fishId: string): Fish | undefined => {
  return FISH_DATA[fishId];
};
