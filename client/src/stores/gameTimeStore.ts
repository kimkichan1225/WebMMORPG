import { create } from 'zustand';
import { socketService } from '../services/socket';
import type { TimeOfDay, GameTime } from '@shared/types';

// Local tick interval for smooth time display
const LOCAL_TICK_INTERVAL = 1000; // 1 second = 1 game minute (matches server)

// Time of day ranges (in hours)
const TIME_RANGES: Record<TimeOfDay, [number, number]> = {
  dawn: [5, 7],    // 5:00 - 7:00
  day: [7, 18],    // 7:00 - 18:00
  dusk: [18, 20],  // 18:00 - 20:00
  night: [20, 5],  // 20:00 - 5:00 (wraps around)
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= TIME_RANGES.dawn[0] && hour < TIME_RANGES.dawn[1]) return 'dawn';
  if (hour >= TIME_RANGES.day[0] && hour < TIME_RANGES.day[1]) return 'day';
  if (hour >= TIME_RANGES.dusk[0] && hour < TIME_RANGES.dusk[1]) return 'dusk';
  return 'night';
}

interface GameTimeState {
  // Current game time (synced with server)
  gameTime: GameTime;

  // Is time running locally
  isRunning: boolean;

  // Is connected to server
  isSynced: boolean;

  // Internal timer for local interpolation
  _intervalId: NodeJS.Timeout | null;

  // Actions
  initializeSync: () => void;
  stopSync: () => void;
  syncFromServer: (serverTime: GameTime) => void;
  localTick: () => void;
}

export const useGameTimeStore = create<GameTimeState>((set, get) => ({
  gameTime: {
    hour: 8, // Default start at 8 AM (will be overwritten by server)
    minute: 0,
    timeOfDay: 'day',
    dayNumber: 1,
  },
  isRunning: false,
  isSynced: false,
  _intervalId: null,

  initializeSync: () => {
    const socket = socketService.getSocket();
    if (!socket) {
      console.warn('[GameTime] Socket not connected, cannot sync time');
      return;
    }

    // Listen for server time updates
    socket.on('time:update', (serverTime: GameTime) => {
      get().syncFromServer(serverTime);
    });

    // Start local tick for smooth interpolation between server updates
    const { _intervalId } = get();
    if (_intervalId) {
      clearInterval(_intervalId);
    }

    const intervalId = setInterval(() => {
      get().localTick();
    }, LOCAL_TICK_INTERVAL);

    set({ isRunning: true, _intervalId: intervalId });
    console.log('[GameTime] Time sync initialized');
  },

  stopSync: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.off('time:update');
    }

    const { _intervalId } = get();
    if (_intervalId) {
      clearInterval(_intervalId);
    }

    set({ isRunning: false, isSynced: false, _intervalId: null });
  },

  syncFromServer: (serverTime: GameTime) => {
    // Directly apply server time
    set({
      gameTime: {
        hour: serverTime.hour,
        minute: serverTime.minute,
        timeOfDay: serverTime.timeOfDay,
        dayNumber: serverTime.dayNumber,
      },
      isSynced: true,
    });
  },

  localTick: () => {
    // Only tick locally if synced (to interpolate between server updates)
    const { isSynced, gameTime } = get();
    if (!isSynced) return;

    let newMinute = gameTime.minute + 1;
    let newHour = gameTime.hour;
    let newDay = gameTime.dayNumber;

    if (newMinute >= 60) {
      newMinute = 0;
      newHour++;
    }

    if (newHour >= 24) {
      newHour = 0;
      newDay++;
    }

    set({
      gameTime: {
        hour: newHour,
        minute: newMinute,
        timeOfDay: getTimeOfDay(newHour),
        dayNumber: newDay,
      },
    });
  },
}));

// Helper function to get overlay color and opacity for time of day
export function getTimeOverlay(timeOfDay: TimeOfDay, hour: number): { color: string; opacity: number } {
  switch (timeOfDay) {
    case 'dawn':
      // Gradually lighten from dark to light
      const dawnProgress = (hour - 5) / 2; // 0 to 1
      return {
        color: `rgba(255, 200, 150, ${0.15 - dawnProgress * 0.15})`, // Orange tint fading
        opacity: 0.2 - dawnProgress * 0.2,
      };

    case 'day':
      return {
        color: 'transparent',
        opacity: 0,
      };

    case 'dusk':
      // Gradually darken with orange/red tint
      const duskProgress = (hour - 18) / 2; // 0 to 1
      return {
        color: `rgba(255, 100, 50, ${duskProgress * 0.2})`, // Orange/red tint growing
        opacity: duskProgress * 0.3,
      };

    case 'night':
      // Dark blue overlay
      return {
        color: 'rgba(20, 30, 60, 0.4)',
        opacity: 0.4,
      };

    default:
      return { color: 'transparent', opacity: 0 };
  }
}

// Get ambient light multiplier (for monster behavior, etc.)
export function getAmbientLight(timeOfDay: TimeOfDay): number {
  switch (timeOfDay) {
    case 'dawn': return 0.7;
    case 'day': return 1.0;
    case 'dusk': return 0.6;
    case 'night': return 0.3;
    default: return 1.0;
  }
}
