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
export type ToolType = 'axe' | 'pickaxe' | 'sickle' | 'fishing_rod';

// Weapon types (including 2nd job weapons)
export type WeaponType =
  | 'bone' | 'sword' | 'bow' | 'staff' | 'dagger' | 'axe' | 'pickaxe' | 'sickle' | 'fishing_rod'
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
  channel: 'global' | 'party' | 'whisper' | 'guild';
}

// Socket events
export interface ServerToClientEvents {
  'player:joined': (player: PlayerSyncData) => void;
  'player:left': (playerId: string) => void;
  'player:moved': (data: { id: string; x: number; y: number; direction: Direction; isMoving: boolean }) => void;
  'player:attacked': (data: { id: string; direction: Direction; x: number; y: number; targetX: number; targetY: number; attackType?: string }) => void;
  'player:skill': (data: { id: string; skillId: string; x: number; y: number; targetX: number; targetY: number; direction: Direction }) => void;
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
  // Party events
  'party:created': (party: Party) => void;
  'party:disbanded': () => void;
  'party:invite_received': (invite: PartyInvite) => void;
  'party:member_joined': (member: PartyMember) => void;
  'party:member_left': (memberId: string) => void;
  'party:member_updated': (data: { id: string; hp: number; maxHp: number; level?: number }) => void;
  'party:leader_changed': (newLeaderId: string) => void;
  // Guild events
  'guild:data': (guild: Guild) => void;
  'guild:invite_received': (invite: GuildInvite) => void;
  'guild:member_joined': (member: GuildMember) => void;
  'guild:member_left': (memberId: string) => void;
  'guild:member_online': (memberId: string) => void;
  'guild:member_offline': (memberId: string) => void;
  'guild:rank_changed': (data: { memberId: string; newRank: GuildRank }) => void;
  'guild:disbanded': () => void;
  // Trading events
  'trade:request_received': (request: TradeRequest) => void;
  'trade:started': (session: TradeSession) => void;
  'trade:updated': (session: TradeSession) => void;
  'trade:completed': (session: TradeSession) => void;
  'trade:cancelled': (data: { sessionId: string; reason: string }) => void;
  // World boss events
  'worldboss:announcement': (announcement: WorldBossAnnouncement) => void;
  'worldboss:update': (boss: WorldBoss) => void;
  'worldboss:killed': (data: { bossId: string; rewards: Record<string, { exp: number; gold: number }> }) => void;
  // Dropped items events
  'item:dropped': (item: DroppedItem) => void;
  'item:picked_up': (data: { itemId: string; playerId: string }) => void;
  'item:expired': (itemId: string) => void;
  // Game time events
  'time:update': (time: GameTime) => void;
}

export interface ClientToServerEvents {
  'player:join': (data: { id?: string; name: string; job: JobType; x: number; y: number; level?: number; hp?: number; maxHp?: number; weapon?: WeaponType }) => void;
  'player:move': (data: { x: number; y: number; direction: Direction; isMoving: boolean }) => void;
  'player:attack': (data: { direction: Direction; targetMonsterIds: number[]; x?: number; y?: number; targetX?: number; targetY?: number; attackType?: string }) => void;
  'player:skill': (data: { skillId: string; x: number; y: number; targetX: number; targetY: number; direction: Direction }) => void;
  'player:damaged_self': (data: { hp: number; maxHp: number; damage: number }) => void;
  'monster:damage': (data: { monsterId: number; damage: number; newHp: number; killed: boolean; exp?: number }) => void;
  'chat:send': (data: { message: string; channel?: 'global' | 'party' | 'whisper' | 'guild'; targetId?: string }) => void;
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
  // Party events
  'party:create': () => void;
  'party:invite': (data: { targetId: string }) => void;
  'party:invite_accept': (data: { partyId: string }) => void;
  'party:invite_decline': (data: { partyId: string }) => void;
  'party:leave': () => void;
  'party:kick': (data: { targetId: string }) => void;
  'party:transfer_leader': (data: { targetId: string }) => void;
  // Guild events
  'guild:create': (data: { name: string; description?: string }) => void;
  'guild:invite': (data: { targetCharacterId: string }) => void;
  'guild:invite_accept': (data: { guildId: string }) => void;
  'guild:invite_decline': (data: { guildId: string }) => void;
  'guild:leave': () => void;
  'guild:kick': (data: { targetId: string }) => void;
  'guild:promote': (data: { targetId: string; rank: GuildRank }) => void;
  'guild:disband': () => void;
  // Trading events
  'trade:request': (data: { targetId: string }) => void;
  'trade:accept': (data: { fromId: string }) => void;
  'trade:decline': (data: { fromId: string }) => void;
  'trade:update_offer': (data: { items: TradeItem[]; gold: number }) => void;
  'trade:confirm': () => void;
  'trade:unconfirm': () => void;
  'trade:cancel': () => void;
  // Dropped items events
  'item:pickup': (data: { itemId: string }) => void;
  'item:dropped': (item: DroppedItem) => void;
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

// ============================================
// Party System Types
// ============================================

export interface PartyMember {
  id: string;
  name: string;
  job: JobType;
  level: number;
  hp: number;
  maxHp: number;
}

export interface Party {
  id: string;
  leaderId: string;
  members: PartyMember[];
}

export interface PartyInvite {
  partyId: string;
  inviterId: string;
  inviterName: string;
}

// ============================================
// Guild System Types
// ============================================

export type GuildRank = 'leader' | 'officer' | 'member';

export interface GuildMember {
  characterId: string;
  name: string;
  job: JobType;
  level: number;
  rank: GuildRank;
  isOnline: boolean;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  description: string;
  members: GuildMember[];
}

export interface GuildInvite {
  guildId: string;
  guildName: string;
  inviterId: string;
  inviterName: string;
}

// Database types for Guild (Supabase)
export interface DbGuild {
  id: string;
  name: string;
  leader_id: string;
  description: string;
  created_at: string;
}

export interface DbGuildMember {
  guild_id: string;
  character_id: string;
  rank: GuildRank;
  joined_at: string;
}

// ============================================
// Trading System Types
// ============================================

export interface TradeItem {
  itemId: string;
  itemName: string;
  quantity: number;
  itemType: ItemType;
  rarity?: ResourceTier;
}

export interface TradeOffer {
  items: TradeItem[];
  gold: number;
  confirmed: boolean;
}

export interface TradeSession {
  id: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  player1Offer: TradeOffer;
  player2Offer: TradeOffer;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface TradeRequest {
  fromId: string;
  fromName: string;
  toId: string;
}

// ============================================
// World Boss System Types
// ============================================

export interface WorldBoss {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  mapId: string;
  spawnTime: number;
  despawnTime: number;
  isAlive: boolean;
  participants: string[]; // Player IDs who damaged the boss
  damageDealt: Record<string, number>; // playerId -> damage
}

export interface WorldBossAnnouncement {
  bossId: string;
  bossName: string;
  mapId: string;
  mapName: string;
  type: 'spawn' | 'warning' | 'killed';
  killerName?: string;
}

// ============================================
// Dropped Item System Types
// ============================================

export interface DroppedItem {
  id: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  quantity: number;
  rarity?: ResourceTier;
  x: number;
  y: number;
  dropTime: number;
  ownerId?: string; // If set, only this player can pick up for first 10 seconds
  expiresAt: number;
}

// ============================================
// Day/Night Cycle Types
// ============================================

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface GameTime {
  hour: number; // 0-23
  minute: number; // 0-59
  timeOfDay: TimeOfDay;
  dayNumber: number;
}

// ============================================
// Quest Tracker Types
// ============================================

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface TrackedQuest {
  questId: string;
  questName: string;
  objectives: QuestObjective[];
  isMain: boolean;
}
