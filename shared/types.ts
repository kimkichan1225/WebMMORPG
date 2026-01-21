// Shared types between client and server

// Game configuration
export const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,

  // Character
  PLAYER_SCALE: 0.08,
  PLAYER_SPEED: 200,

  // Part original sizes
  HEAD_WIDTH: 1000,
  HEAD_HEIGHT: 830,
  BODY_WIDTH: 1000,
  BODY_HEIGHT: 400,
  FOOT_WIDTH: 150,
  FOOT_HEIGHT: 100,

  // Tiles
  TILE_SIZE: 64,
  MAP_WIDTH: 40,
  MAP_HEIGHT: 40,

  // Animation
  WALK_FRAME_DURATION: 200,

  // Combat
  BASE_HP: 100,
  BASE_MP: 50,
  BASE_ATTACK: 10,

  // Level up
  STAT_POINTS_PER_LEVEL: 5,
  EXP_BASE: 50,           // Base EXP needed at level 1
  EXP_INCREMENT: 25,      // EXP increase per level

  // Movement
  DASH_SPEED_MULTIPLIER: 2.5,
  DASH_DURATION: 200,     // ms
  DASH_COOLDOWN: 800,     // ms

  // Death penalty
  DEATH_LEVEL_PENALTY: 1,
  DEATH_STAT_PENALTY: 1,
  DEATH_RESOURCE_DROP_RATE: {
    common: 0.3,
    uncommon: 0.2,
    rare: 0.1,
  },

  // Harvesting
  HARVEST_RANGE: 80,
  HARVEST_TIME: 1000,

  // Monsters
  MONSTER_SPAWN_RATE: 5000,
  MONSTER_AGGRO_RANGE: 150,
  MONSTER_ATTACK_RANGE: 50,
} as const;

// Helper function to calculate EXP needed for a level
// Level 1: 50, Level 2: 75, Level 3: 100, etc.
export function getExpNeededForLevel(level: number): number {
  return CONFIG.EXP_BASE + (level - 1) * CONFIG.EXP_INCREMENT;
}

// Direction
export type Direction = 'up' | 'down' | 'left' | 'right';

// Tile types
export const TileType = {
  GRASS: 0,
  DIRT: 1,
  WATER: 2,
  WALL: 3,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

// Job types - 1st job
export type Job1stType = 'Warrior' | 'Archer' | 'Mage' | 'Thief';

// Job types - 2nd job (Lv.30+) - 3 branches per 1st job
export type Job2ndType =
  | 'Swordsman' | 'Mace' | 'Polearm'    // Warrior branches (검, 둔기, 봉)
  | 'Gunner' | 'Bowmaster' | 'Crossbowman'  // Archer branches (거너, 활, 석궁)
  | 'Elemental' | 'Holy' | 'Dark'       // Mage branches (원소, 성, 악)
  | 'Fighter' | 'Dagger' | 'Shuriken';  // Thief branches (격투가, 단검, 표창)

// All job types
export type JobType = 'Base' | Job1stType | Job2ndType;

// Job tier
export type JobTier = 0 | 1 | 2;

// Job advancement path - 3 options per 1st job
export const JOB_ADVANCEMENT_PATH: Record<Job1stType, Job2ndType[]> = {
  Warrior: ['Swordsman', 'Mace', 'Polearm'],
  Archer: ['Gunner', 'Bowmaster', 'Crossbowman'],
  Mage: ['Elemental', 'Holy', 'Dark'],
  Thief: ['Fighter', 'Dagger', 'Shuriken'],
};

// Stat types
export type StatType = 'str' | 'dex' | 'int' | 'vit' | 'luk';

// Tool types
export type ToolType = 'axe' | 'pickaxe' | 'sickle';

// Weapon types (including 2nd job weapons)
export type WeaponType =
  | 'bone' | 'sword' | 'bow' | 'staff' | 'dagger' | 'axe' | 'pickaxe' | 'sickle'
  // Warrior 2nd job weapons
  | 'great_sword'     // Swordsman (검)
  | 'mace'            // Mace (둔기)
  | 'battle_axe'      // Mace alternate (둔기)
  | 'polearm'         // Polearm (봉)
  // Archer 2nd job weapons
  | 'gun'             // Gunner (거너)
  | 'long_bow'        // Bowmaster (활)
  | 'crossbow'        // Crossbowman (석궁)
  // Mage 2nd job weapons
  | 'elemental_staff' // Elemental (원소)
  | 'arcane_staff'    // Elemental alternate (원소)
  | 'holy_staff'      // Holy (성)
  | 'dark_staff'      // Dark (악)
  // Thief 2nd job weapons
  | 'fist'            // Fighter (격투가)
  | 'twin_daggers'    // Dagger (단검)
  | 'shuriken';       // Shuriken (표창)

// Resource tiers
export type ResourceTier = 'common' | 'uncommon' | 'rare';

// Item types
export type ItemType = 'resource' | 'equipment' | 'consumable' | 'quest';

// Equipment slots
export type EquipmentSlot = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory';

// Player data for multiplayer sync
export interface PlayerSyncData {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  job: JobType;
  weapon: WeaponType;
  level: number;
  hp: number;
  maxHp: number;
  isAttacking: boolean;
}

// Monster sync data
export interface MonsterSyncData {
  id: number;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  state: 'idle' | 'chase' | 'attack' | 'return';
}

// Chat message
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  channel: 'global' | 'party' | 'whisper';
}

// Socket events
export interface ServerToClientEvents {
  'player:joined': (player: PlayerSyncData) => void;
  'player:left': (playerId: string) => void;
  'player:moved': (data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void;
  'player:attacked': (data: { id: string; direction: Direction; x: number; y: number }) => void;
  'player:damaged': (data: { id: string; hp: number; damage: number }) => void;
  'monster:update': (monsters: MonsterSyncData[]) => void;
  'monster:damaged': (data: { monsterId: number; hp: number; damage: number; attackerId: string }) => void;
  'monster:killed': (data: { monsterId: number; killerId: string; exp: number }) => void;
  'chat:message': (message: ChatMessage) => void;
  'sync:state': (data: { players: PlayerSyncData[]; monsters: MonsterSyncData[] }) => void;
  // Room events
  'room:players': (players: PlayerSyncData[]) => void;
  'room:joined': (data: { roomId: string }) => void;
  'room:left': () => void;
  // Match events
  'match:created': (room: MatchRoom) => void;
  'match:joined': (data: { room: MatchRoom; playerId: string }) => void;
  'match:left': () => void;
  'match:player_ready': (data: { playerId: string }) => void;
  'match:started': (data: { room: MatchRoom }) => void;
  'match:found': (data: { room: MatchRoom }) => void;
  'match:ended': (data: { winner: TeamColor | 'draw'; room: MatchRoom }) => void;
  'match:score_update': (data: { redScore: number; blueScore: number }) => void;
}

export interface ClientToServerEvents {
  'player:join': (data: { id?: string; name: string; job: JobType; x: number; y: number }) => void;
  'player:move': (data: { x: number; y: number; direction: Direction; isMoving: boolean }) => void;
  'player:attack': (data: { direction: Direction; targetMonsterIds: number[]; x?: number; y?: number }) => void;
  'monster:damage': (data: { monsterId: number; damage: number }) => void;
  'chat:send': (data: { message: string; channel?: 'global' | 'party' | 'whisper'; targetId?: string }) => void;
  // Room events
  'room:join': (data: { roomId: string }) => void;
  'room:leave': () => void;
  // Match events
  'match:create': (data: { mode: MatchMode; teamSize: number }) => void;
  'match:join': (data: { roomId: string }) => void;
  'match:leave': () => void;
  'match:ready': () => void;
  'match:start': () => void;
  'match:search': (data: { mode: MatchMode; teamSize: number }) => void;
  'match:cancel_search': () => void;
}

// Database types (Supabase)
export interface DbUser {
  id: string;
  email: string;
  created_at: string;
}

export interface DbCharacter {
  id: string;
  user_id: string;
  name: string;
  job: JobType;
  level: number;
  exp: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  str: number;
  dex: number;
  int: number;
  vit: number;
  luk: number;
  stat_points: number;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
}

export interface DbInventoryItem {
  id: string;
  character_id: string;
  item_type: ItemType;
  item_id: string;
  quantity: number;
  slot: number;
}

export interface DbEquipment {
  id: string;
  character_id: string;
  slot: EquipmentSlot;
  item_id: string;
}

export interface DbCharacterSkill {
  id: string;
  character_id: string;
  skill_id: string;
  level: number;
}

export interface DbQuest {
  id: string;
  character_id: string;
  quest_id: string;
  status: 'active' | 'completed' | 'failed';
  progress: Record<string, number>;
  started_at: string;
  completed_at?: string;
}

// Match game types
export type MatchMode = 'deathmatch' | 'capture' | 'boss_raid';
export type TeamColor = 'red' | 'blue';

export interface MatchRoom {
  id: string;
  mode: MatchMode;
  teamSize: number; // 3v3 or 5v5
  status: 'waiting' | 'starting' | 'in_progress' | 'finished';
  teams: {
    red: string[];
    blue: string[];
  };
  winner?: TeamColor;
  createdAt: string;
}

export interface MatchPlayer {
  id: string;
  name: string;
  team: TeamColor;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
}
