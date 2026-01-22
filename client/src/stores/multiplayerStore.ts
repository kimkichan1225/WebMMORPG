import { create } from 'zustand';
import { socketService } from '../services/socket';
import { usePlayerStore } from './playerStore';
import type { Direction, JobType } from '@shared/types';

export interface OtherPlayer {
  id: string;
  name: string;
  job: JobType;
  level: number;
  x: number;
  y: number;
  direction: Direction;
  hp: number;
  maxHp: number;
  isAttacking: boolean;
  isMoving: boolean;
  weapon: string;
  attackType?: string;
  attackTargetX?: number;
  attackTargetY?: number;
  currentSkill?: {
    skillId: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    direction: Direction;
    startTime: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'whisper';
}

interface MultiplayerState {
  // Connection state
  isConnected: boolean;
  roomId: string | null;

  // Other players
  otherPlayers: Map<string, OtherPlayer>;

  // Chat
  messages: ChatMessage[];
  maxMessages: number;

  // Throttle state
  _lastPositionUpdate: number;
  _pendingPosition: { x: number; y: number; direction: Direction; isMoving: boolean } | null;

  // Actions
  connect: (characterId: string, characterName: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;

  // Player sync
  updatePosition: (x: number, y: number, direction: Direction, isMoving: boolean) => void;
  updateCombatState: (isAttacking: boolean, attackType?: string, targetX?: number, targetY?: number) => void;
  sendSkillUse: (skillId: string, x: number, y: number, targetX: number, targetY: number, direction: Direction) => void;

  // Other players
  addPlayer: (player: OtherPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, data: Partial<OtherPlayer>) => void;

  // Chat
  sendMessage: (message: string) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

// Position update throttle interval (ms)
const POSITION_UPDATE_INTERVAL = 50;

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  isConnected: false,
  roomId: null,
  otherPlayers: new Map(),
  messages: [],
  maxMessages: 100,
  _lastPositionUpdate: 0,
  _pendingPosition: null,

  connect: (characterId: string, characterName: string) => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      set({ isConnected: true });

      // Join default room with full player data
      const playerStore = usePlayerStore.getState();
      socket.emit('player:join', {
        id: characterId,
        name: characterName,
        job: playerStore.job,
        x: playerStore.x,
        y: playerStore.y,
        level: playerStore.level,
        hp: playerStore.hp,
        maxHp: playerStore.maxHp,
        weapon: playerStore.weapon,
      });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false, otherPlayers: new Map() });
    });

    // Handle other players
    socket.on('player:joined', (data) => {
      get().addPlayer({
        id: data.id,
        name: data.name,
        job: data.job,
        level: data.level,
        x: data.x,
        y: data.y,
        direction: data.direction || 'down',
        hp: data.hp,
        maxHp: data.maxHp,
        isAttacking: false,
        isMoving: data.isMoving || false,
        weapon: data.weapon || 'bone',
      });

      get().addMessage({
        id: `${Date.now()}-system`,
        senderId: 'system',
        senderName: 'System',
        message: `${data.name}님이 접속했습니다.`,
        timestamp: Date.now(),
        type: 'system'
      });
    });

    socket.on('player:left', (playerId) => {
      const player = get().otherPlayers.get(playerId);
      if (player) {
        get().addMessage({
          id: `${Date.now()}-system`,
          senderId: 'system',
          senderName: 'System',
          message: `${player.name}님이 퇴장했습니다.`,
          timestamp: Date.now(),
          type: 'system'
        });
      }
      get().removePlayer(playerId);
    });

    socket.on('player:moved', (data) => {
      get().updatePlayer(data.id, {
        x: data.x,
        y: data.y,
        direction: data.direction,
        isMoving: data.isMoving,
      });
    });

    socket.on('player:attacked', (data) => {
      get().updatePlayer(data.id, {
        isAttacking: true,
        attackType: data.attackType || 'melee',
        direction: data.direction,
        x: data.x,
        y: data.y,
        attackTargetX: data.targetX,
        attackTargetY: data.targetY,
      });

      // Reset attack state after animation
      setTimeout(() => {
        get().updatePlayer(data.id, { isAttacking: false, attackType: undefined, attackTargetX: undefined, attackTargetY: undefined });
      }, 300);
    });

    socket.on('player:skill', (data) => {
      get().updatePlayer(data.id, {
        currentSkill: {
          skillId: data.skillId,
          x: data.x,
          y: data.y,
          targetX: data.targetX,
          targetY: data.targetY,
          direction: data.direction,
          startTime: Date.now(),
        },
        direction: data.direction,
      });

      // Clear skill after effect duration
      setTimeout(() => {
        get().updatePlayer(data.id, { currentSkill: undefined });
      }, 500);
    });

    socket.on('player:damaged', (data) => {
      get().updatePlayer(data.id, {
        hp: data.hp
      });
    });

    socket.on('chat:message', (data) => {
      get().addMessage({
        id: data.id || `${Date.now()}-${data.senderId}`,
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        timestamp: data.timestamp || Date.now(),
        type: 'chat'
      });
    });

    // Receive current players list when joining
    socket.on('room:players', (players) => {
      const newPlayers = new Map<string, OtherPlayer>();
      players.forEach((p) => {
        newPlayers.set(p.id, {
          id: p.id,
          name: p.name,
          job: p.job,
          level: p.level,
          x: p.x,
          y: p.y,
          direction: p.direction || 'down',
          hp: p.hp,
          maxHp: p.maxHp,
          isAttacking: p.isAttacking || false,
          isMoving: p.isMoving || false,
          weapon: p.weapon || 'bone',
        });
      });
      set({ otherPlayers: newPlayers });
    });
  },

  disconnect: () => {
    socketService.disconnect();
    set({
      isConnected: false,
      roomId: null,
      otherPlayers: new Map(),
      messages: []
    });
  },

  joinRoom: (roomId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('room:join', { roomId });
      set({ roomId });
    }
  },

  leaveRoom: () => {
    const socket = socketService.getSocket();
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit('room:leave');
      set({ roomId: null, otherPlayers: new Map() });
    }
  },

  updatePosition: (x: number, y: number, direction: Direction, isMoving: boolean) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const now = Date.now();
    const state = get();
    const timeSinceLastUpdate = now - state._lastPositionUpdate;

    // Always send immediately when stopping movement
    if (!isMoving && state._pendingPosition?.isMoving) {
      socket.emit('player:move', { x, y, direction, isMoving });
      set({ _lastPositionUpdate: now, _pendingPosition: null });
      return;
    }

    // Throttle position updates while moving
    if (timeSinceLastUpdate >= POSITION_UPDATE_INTERVAL) {
      socket.emit('player:move', { x, y, direction, isMoving });
      set({ _lastPositionUpdate: now, _pendingPosition: null });
    } else {
      // Store pending position to send later if needed
      set({ _pendingPosition: { x, y, direction, isMoving } });
    }
  },

  updateCombatState: (isAttacking: boolean, attackType?: string, targetX?: number, targetY?: number) => {
    const socket = socketService.getSocket();
    if (socket && isAttacking) {
      const playerStore = usePlayerStore.getState();
      socket.emit('player:attack', {
        direction: playerStore.direction,
        targetMonsterIds: [],
        x: playerStore.x,
        y: playerStore.y,
        targetX: targetX ?? playerStore.x,
        targetY: targetY ?? playerStore.y,
        attackType: attackType || 'melee',
      });
    }
  },

  sendSkillUse: (skillId: string, x: number, y: number, targetX: number, targetY: number, direction: Direction) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('player:skill', {
        skillId,
        x,
        y,
        targetX,
        targetY,
        direction,
      });
    }
  },

  addPlayer: (player: OtherPlayer) => {
    set((state) => {
      const newPlayers = new Map(state.otherPlayers);
      newPlayers.set(player.id, player);
      return { otherPlayers: newPlayers };
    });
  },

  removePlayer: (playerId: string) => {
    set((state) => {
      const newPlayers = new Map(state.otherPlayers);
      newPlayers.delete(playerId);
      return { otherPlayers: newPlayers };
    });
  },

  updatePlayer: (playerId: string, data: Partial<OtherPlayer>) => {
    set((state) => {
      const player = state.otherPlayers.get(playerId);
      if (!player) return state;

      const newPlayers = new Map(state.otherPlayers);
      newPlayers.set(playerId, { ...player, ...data });
      return { otherPlayers: newPlayers };
    });
  },

  sendMessage: (message: string) => {
    const socket = socketService.getSocket();
    if (socket && message.trim()) {
      socket.emit('chat:send', { message: message.trim(), channel: 'global' });
    }
  },

  addMessage: (message: ChatMessage) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      // Keep only the last maxMessages
      if (newMessages.length > state.maxMessages) {
        newMessages.shift();
      }
      return { messages: newMessages };
    });
  },

  clearMessages: () => {
    set({ messages: [] });
  }
}));
