// 게임 설정
export const CONFIG = {
  // 캔버스
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,

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
  MAP_WIDTH: 40,
  MAP_HEIGHT: 40,

  // 애니메이션
  WALK_FRAME_DURATION: 200,

  // 전투
  BASE_HP: 100,
  BASE_MP: 50,
  BASE_ATTACK: 10,

  // 레벨업
  STAT_POINTS_PER_LEVEL: 5,
  EXP_PER_LEVEL: 100,

  // 사망 페널티
  DEATH_LEVEL_PENALTY: 1,
  DEATH_STAT_PENALTY: 1,
  DEATH_RESOURCE_DROP_RATE: {
    common: 0.3,
    uncommon: 0.2,
    rare: 0.1,
  },

  // 채집
  HARVEST_RANGE: 80,
  HARVEST_TIME: 1000,

  // 몬스터
  MONSTER_SPAWN_RATE: 5000,
  MONSTER_AGGRO_RANGE: 150,
  MONSTER_ATTACK_RANGE: 50,
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
export const TileType = {
  GRASS: 0,
  DIRT: 1,
  WATER: 2,
  WALL: 3,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

// 게임 스토어 타입
export interface GameState {
  player: PlayerState;
  keys: KeyState;
  setPlayerPosition: (x: number, y: number) => void;
  setDirection: (dir: Direction) => void;
  setMoving: (moving: boolean) => void;
  setKey: (key: keyof KeyState, pressed: boolean) => void;
}
