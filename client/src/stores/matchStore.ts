import { create } from 'zustand';
import { socketService } from '../services/socket';

export type MatchMode = 'deathmatch' | 'capture' | 'boss_raid';
export type TeamColor = 'red' | 'blue';
export type MatchState = 'lobby' | 'searching' | 'found' | 'loading' | 'playing' | 'ended';

export interface MatchPlayer {
  id: string;
  name: string;
  job: string;
  level: number; // Match level (starts at 1)
  team: TeamColor;
  kills: number;
  deaths: number;
  score: number;
  isReady: boolean;
  isHost: boolean;
}

export interface MatchRoom {
  id: string;
  mode: MatchMode;
  teamSize: 3 | 5;
  players: MatchPlayer[];
  state: MatchState;
  redTeamScore: number;
  blueTeamScore: number;
  timeRemaining: number;
  maxTime: number;
  winCondition: number; // Score to win
}

interface MatchStoreState {
  // Current match state
  currentRoom: MatchRoom | null;
  localPlayerId: string | null;
  matchState: MatchState;

  // Lobby state
  availableRooms: MatchRoom[];
  isSearching: boolean;

  // Match settings
  selectedMode: MatchMode;
  selectedTeamSize: 3 | 5;

  // Actions
  setSelectedMode: (mode: MatchMode) => void;
  setSelectedTeamSize: (size: 3 | 5) => void;

  // Room actions
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  toggleReady: () => void;
  startMatch: () => void;

  // Matchmaking
  startSearching: () => void;
  stopSearching: () => void;

  // Match events
  onMatchFound: (room: MatchRoom) => void;
  onMatchStart: () => void;
  onMatchEnd: (winner: TeamColor | 'draw') => void;
  onPlayerJoined: (player: MatchPlayer) => void;
  onPlayerLeft: (playerId: string) => void;
  onScoreUpdate: (redScore: number, blueScore: number) => void;
  onPlayerKill: (killerId: string, victimId: string) => void;

  // Reset
  resetMatch: () => void;
}

const MODE_SETTINGS: Record<MatchMode, { name: string; winCondition: number; maxTime: number }> = {
  deathmatch: { name: '섬멸전', winCondition: 20, maxTime: 600 },
  capture: { name: '점령전', winCondition: 100, maxTime: 900 },
  boss_raid: { name: '보스 레이드', winCondition: 1, maxTime: 1200 }
};

export const useMatchStore = create<MatchStoreState>((set, get) => ({
  currentRoom: null,
  localPlayerId: null,
  matchState: 'lobby',
  availableRooms: [],
  isSearching: false,
  selectedMode: 'deathmatch',
  selectedTeamSize: 3,

  setSelectedMode: (mode: MatchMode) => set({ selectedMode: mode }),
  setSelectedTeamSize: (size: 3 | 5) => set({ selectedTeamSize: size }),

  createRoom: () => {
    const { selectedMode, selectedTeamSize, localPlayerId } = get();
    const socket = socketService.getSocket();

    if (socket) {
      socket.emit('match:create', {
        mode: selectedMode,
        teamSize: selectedTeamSize
      });
    }

    // Create local room state
    const room: MatchRoom = {
      id: `room_${Date.now()}`,
      mode: selectedMode,
      teamSize: selectedTeamSize,
      players: [],
      state: 'lobby',
      redTeamScore: 0,
      blueTeamScore: 0,
      timeRemaining: MODE_SETTINGS[selectedMode].maxTime,
      maxTime: MODE_SETTINGS[selectedMode].maxTime,
      winCondition: MODE_SETTINGS[selectedMode].winCondition
    };

    set({ currentRoom: room, matchState: 'lobby' });
  },

  joinRoom: (roomId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('match:join', { roomId });
    }
  },

  leaveRoom: () => {
    const socket = socketService.getSocket();
    const { currentRoom } = get();

    if (socket && currentRoom) {
      socket.emit('match:leave');
    }

    set({ currentRoom: null, matchState: 'lobby' });
  },

  toggleReady: () => {
    const socket = socketService.getSocket();
    const { currentRoom, localPlayerId } = get();

    if (socket && currentRoom && localPlayerId) {
      socket.emit('match:ready');

      // Update local state
      set((state) => {
        if (!state.currentRoom) return state;

        const updatedPlayers = state.currentRoom.players.map(p =>
          p.id === localPlayerId ? { ...p, isReady: !p.isReady } : p
        );

        return {
          currentRoom: { ...state.currentRoom, players: updatedPlayers }
        };
      });
    }
  },

  startMatch: () => {
    const socket = socketService.getSocket();
    const { currentRoom } = get();

    if (socket && currentRoom) {
      socket.emit('match:start');
    }
  },

  startSearching: () => {
    const socket = socketService.getSocket();
    const { selectedMode, selectedTeamSize } = get();

    if (socket) {
      socket.emit('match:search', {
        mode: selectedMode,
        teamSize: selectedTeamSize
      });
    }

    set({ isSearching: true, matchState: 'searching' });
  },

  stopSearching: () => {
    const socket = socketService.getSocket();

    if (socket) {
      socket.emit('match:cancel_search');
    }

    set({ isSearching: false, matchState: 'lobby' });
  },

  onMatchFound: (room: MatchRoom) => {
    set({
      currentRoom: room,
      matchState: 'found',
      isSearching: false
    });
  },

  onMatchStart: () => {
    set({ matchState: 'playing' });
  },

  onMatchEnd: (winner: TeamColor | 'draw') => {
    set({ matchState: 'ended' });
  },

  onPlayerJoined: (player: MatchPlayer) => {
    set((state) => {
      if (!state.currentRoom) return state;

      return {
        currentRoom: {
          ...state.currentRoom,
          players: [...state.currentRoom.players, player]
        }
      };
    });
  },

  onPlayerLeft: (playerId: string) => {
    set((state) => {
      if (!state.currentRoom) return state;

      return {
        currentRoom: {
          ...state.currentRoom,
          players: state.currentRoom.players.filter(p => p.id !== playerId)
        }
      };
    });
  },

  onScoreUpdate: (redScore: number, blueScore: number) => {
    set((state) => {
      if (!state.currentRoom) return state;

      return {
        currentRoom: {
          ...state.currentRoom,
          redTeamScore: redScore,
          blueTeamScore: blueScore
        }
      };
    });
  },

  onPlayerKill: (killerId: string, victimId: string) => {
    set((state) => {
      if (!state.currentRoom) return state;

      const updatedPlayers = state.currentRoom.players.map(p => {
        if (p.id === killerId) {
          return { ...p, kills: p.kills + 1, score: p.score + 10 };
        }
        if (p.id === victimId) {
          return { ...p, deaths: p.deaths + 1 };
        }
        return p;
      });

      return {
        currentRoom: { ...state.currentRoom, players: updatedPlayers }
      };
    });
  },

  resetMatch: () => {
    set({
      currentRoom: null,
      matchState: 'lobby',
      isSearching: false
    });
  }
}));

export const MATCH_MODE_INFO = MODE_SETTINGS;
