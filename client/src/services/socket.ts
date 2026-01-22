import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerSyncData,
  MonsterSyncData,
  ChatMessage,
  Direction,
  JobType,
} from '@shared/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private serverUrl: string;

  constructor() {
    // In production, connect to same origin (server serves both API and client)
    // In development, use VITE_SERVER_URL or default to localhost:4000
    this.serverUrl = import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.PROD ? '' : 'http://localhost:4000');
  }

  connect(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Player actions
  joinGame(name: string, job: JobType, x: number, y: number): void {
    this.socket?.emit('player:join', { name, job, x, y });
  }

  sendMovement(x: number, y: number, direction: Direction, isMoving: boolean): void {
    this.socket?.emit('player:move', { x, y, direction, isMoving });
  }

  sendAttack(direction: Direction, targetMonsterIds: number[]): void {
    this.socket?.emit('player:attack', { direction, targetMonsterIds });
  }

  sendMonsterDamage(monsterId: number, damage: number): void {
    this.socket?.emit('monster:damage', { monsterId, damage });
  }

  sendChatMessage(message: string, channel: 'global' | 'party' | 'whisper', targetId?: string): void {
    this.socket?.emit('chat:send', { message, channel, targetId });
  }

  // Event listeners
  onPlayerJoined(callback: (player: PlayerSyncData) => void): void {
    this.socket?.on('player:joined', callback);
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.socket?.on('player:left', callback);
  }

  onPlayerMoved(callback: (data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void): void {
    this.socket?.on('player:moved', callback);
  }

  onPlayerAttacked(callback: (data: { id: string; direction: Direction }) => void): void {
    this.socket?.on('player:attacked', callback);
  }

  onPlayerDamaged(callback: (data: { id: string; hp: number; damage: number }) => void): void {
    this.socket?.on('player:damaged', callback);
  }

  onMonsterUpdate(callback: (monsters: MonsterSyncData[]) => void): void {
    this.socket?.on('monster:update', callback);
  }

  onMonsterDamaged(callback: (data: { monsterId: number; hp: number; damage: number; attackerId: string }) => void): void {
    this.socket?.on('monster:damaged', callback);
  }

  onMonsterKilled(callback: (data: { monsterId: number; killerId: string; exp: number }) => void): void {
    this.socket?.on('monster:killed', callback);
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on('chat:message', callback);
  }

  onSyncState(callback: (data: { players: PlayerSyncData[]; monsters: MonsterSyncData[] }) => void): void {
    this.socket?.on('sync:state', callback);
  }

  // Remove listeners
  offPlayerJoined(): void {
    this.socket?.off('player:joined');
  }

  offPlayerLeft(): void {
    this.socket?.off('player:left');
  }

  offPlayerMoved(): void {
    this.socket?.off('player:moved');
  }

  offAll(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;
