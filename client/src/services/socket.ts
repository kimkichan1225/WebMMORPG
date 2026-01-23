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

type ErrorCallback = (error: Error) => void;
type ConnectionCallback = (connected: boolean) => void;

class SocketService {
  private socket: TypedSocket | null = null;
  private serverUrl: string;
  private errorCallback: ErrorCallback | null = null;
  private connectionCallback: ConnectionCallback | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor() {
    // In production, connect to same origin (server serves both API and client)
    // In development, use VITE_SERVER_URL or default to localhost:4000
    this.serverUrl = import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.PROD ? '' : 'http://localhost:4000');
  }

  setErrorCallback(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  setConnectionCallback(callback: ConnectionCallback): void {
    this.connectionCallback = callback;
  }

  connect(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // 기존 소켓이 있으면 정리
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(this.serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.connectionCallback?.(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.connectionCallback?.(false);

      // io server disconnect 또는 io client disconnect는 의도적 종료
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        return;
      }

      // 비정상 종료 - 에러 콜백 호출
      this.errorCallback?.(new Error(`연결 끊김: ${reason}`));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.reconnectAttempts++;
      this.errorCallback?.(new Error(`연결 오류: ${error.message}`));
    });

    this.socket.io.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect after max attempts');
      this.errorCallback?.(new Error('서버 연결 실패. 페이지를 새로고침 해주세요.'));
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
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

  getSocketId(): string | undefined {
    return this.socket?.id;
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

  sendMonsterDamage(monsterId: number, damage: number, newHp: number, killed: boolean, exp?: number): void {
    this.socket?.emit('monster:damage', { monsterId, damage, newHp, killed, exp });
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
