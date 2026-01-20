// 게임 설정
export const CONFIG = {
  // 캔버스
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // 캐릭터
  PLAYER_SCALE: 0.08,
  PLAYER_SPEED: 200,

  // 파츠 원본 크기
  HEAD_WIDTH: 1000,
  HEAD_HEIGHT: 830,
  BODY_WIDTH: 1000,
  BODY_HEIGHT: 400,
  FOOT_WIDTH: 150,
  FOOT_HEIGHT: 100,

  // 타일
  TILE_SIZE: 64,
  MAP_WIDTH: 30,
  MAP_HEIGHT: 30,

  // 애니메이션
  WALK_FRAME_DURATION: 200,
};

// 방향
export type Direction = 'up' | 'down' | 'left' | 'right';

// 플레이어 상태
export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  currentJob: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

// 키 입력 상태
export interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

// 타일 타입
export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WATER = 2,
  WALL = 3,
}

// 게임 스토어 타입
export interface GameState {
  player: PlayerState;
  keys: KeyState;
  setPlayerPosition: (x: number, y: number) => void;
  setDirection: (dir: Direction) => void;
  setMoving: (moving: boolean) => void;
  setKey: (key: keyof KeyState, pressed: boolean) => void;
}
