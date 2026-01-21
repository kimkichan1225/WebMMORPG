import { create } from 'zustand';
import type { Direction } from '../types';
import { CONFIG } from '../types';
import type { WeaponType } from '../game/weapons';
import { JOB_WEAPONS } from '../game/weapons';

export type ToolType = 'axe' | 'pickaxe' | 'sickle';
export type JobType = 'Base' | 'Warrior' | 'Archer' | 'Mage' | 'Thief';
export type StatType = 'str' | 'dex' | 'int' | 'vit' | 'luk';

interface JobRequirement {
  level: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
}

export const JOB_REQUIREMENTS: Record<JobType, JobRequirement | null> = {
  Base: null,
  Warrior: { level: 10, str: 20 },
  Archer: { level: 10, dex: 20 },
  Mage: { level: 10, int: 20 },
  Thief: { level: 10, dex: 15, luk: 15 },
};

export const JOB_BONUS_STATS: Record<JobType, Partial<Record<StatType, number>>> = {
  Base: {},
  Warrior: { str: 5, vit: 3 },
  Archer: { dex: 5, luk: 3 },
  Mage: { int: 5, vit: 3 },
  Thief: { dex: 3, luk: 5 },
};

export interface PlayerState {
  // Position
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  facingRight: boolean;

  // Stats
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  dex: number;
  int: number;
  vit: number;
  luk: number;
  statPoints: number;

  // Job & Equipment
  job: JobType;
  jobTier: number;
  weapon: WeaponType;
  tool: ToolType | null;

  // Combat state
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;

  // Game state
  isDead: boolean;
  toolSelected: boolean;

  // Keys state
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };

  // Actions
  setPosition: (x: number, y: number) => void;
  setDirection: (dir: Direction) => void;
  setMoving: (moving: boolean) => void;
  setFacingRight: (facing: boolean) => void;
  setKey: (key: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void;
  setTool: (tool: ToolType) => void;
  gainExp: (amount: number) => void;
  allocateStat: (stat: StatType) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  restoreMp: (amount: number) => void;
  die: () => void;
  respawn: () => void;
  tryChangeJob: (job: JobType) => boolean;
  checkJobMaintenance: () => void;
  startAttack: () => boolean;
  updateAttack: (deltaTime: number) => void;
  getAttackPower: () => number;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial position (center of map)
  x: (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2,
  y: (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2,
  direction: 'down',
  isMoving: false,
  facingRight: false,

  // Initial stats
  level: 1,
  exp: 0,
  hp: CONFIG.BASE_HP,
  maxHp: CONFIG.BASE_HP,
  mp: CONFIG.BASE_MP,
  maxMp: CONFIG.BASE_MP,
  str: 5,
  dex: 5,
  int: 5,
  vit: 5,
  luk: 5,
  statPoints: 0,

  // Initial job & equipment
  job: 'Base',
  jobTier: 0,
  weapon: 'bone',
  tool: null,

  // Combat state
  isAttacking: false,
  attackTimer: 0,
  attackCooldown: 500, // ms

  // Game state
  isDead: false,
  toolSelected: false,

  // Keys
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
  },

  // Movement
  setPosition: (x, y) => set({ x, y }),
  setDirection: (dir) => set({ direction: dir }),
  setMoving: (moving) => set({ isMoving: moving }),
  setFacingRight: (facing) => set({ facingRight: facing }),
  setKey: (key, pressed) =>
    set((state) => ({
      keys: { ...state.keys, [key]: pressed },
    })),

  // Tool selection
  setTool: (tool) => set({ tool, toolSelected: true }),

  // Experience & Level up
  gainExp: (amount) => {
    const s = get();
    let newExp = s.exp + amount;
    let newLevel = s.level;
    let newStatPoints = s.statPoints;

    const expNeeded = newLevel * CONFIG.EXP_PER_LEVEL;
    while (newExp >= expNeeded) {
      newExp -= newLevel * CONFIG.EXP_PER_LEVEL;
      newLevel++;
      newStatPoints += CONFIG.STAT_POINTS_PER_LEVEL;
    }

    set({
      exp: newExp,
      level: newLevel,
      statPoints: newStatPoints,
    });
  },

  // Stat allocation
  allocateStat: (stat) =>
    set((s) => {
      if (s.statPoints <= 0) return s;

      const newStats: Partial<PlayerState> = {
        [stat]: s[stat] + 1,
        statPoints: s.statPoints - 1,
      };

      // VIT affects HP
      if (stat === 'vit') {
        const newVit = s.vit + 1;
        newStats.maxHp = CONFIG.BASE_HP + newVit * 10;
        newStats.hp = Math.min(s.hp, newStats.maxHp);
      }

      // INT affects MP
      if (stat === 'int') {
        const newInt = s.int + 1;
        newStats.maxMp = CONFIG.BASE_MP + newInt * 5;
        newStats.mp = Math.min(s.mp, newStats.maxMp);
      }

      return newStats as PlayerState;
    }),

  // Combat
  takeDamage: (amount) => {
    const s = get();
    const defense = Math.floor(s.vit * 0.5);
    const actualDamage = Math.max(1, amount - defense);
    const newHp = s.hp - actualDamage;

    if (newHp <= 0) {
      get().die();
    } else {
      set({ hp: newHp });
    }
  },

  heal: (amount) =>
    set((s) => ({
      hp: Math.min(s.maxHp, s.hp + amount),
    })),

  restoreMp: (amount) =>
    set((s) => ({
      mp: Math.min(s.maxMp, s.mp + amount),
    })),

  // Death
  die: () =>
    set((s) => {
      // Level & stat decrease
      const newLevel = Math.max(1, s.level - CONFIG.DEATH_LEVEL_PENALTY);
      const newStr = Math.max(5, s.str - CONFIG.DEATH_STAT_PENALTY);
      const newDex = Math.max(5, s.dex - CONFIG.DEATH_STAT_PENALTY);
      const newInt = Math.max(5, s.int - CONFIG.DEATH_STAT_PENALTY);
      const newVit = Math.max(5, s.vit - CONFIG.DEATH_STAT_PENALTY);
      const newLuk = Math.max(5, s.luk - CONFIG.DEATH_STAT_PENALTY);

      // Check job requirements after stat decrease
      let newJob = s.job;
      let newWeapon = s.weapon;
      let newJobTier = s.jobTier;

      const req = JOB_REQUIREMENTS[s.job];
      if (req) {
        const meetsReq =
          newLevel >= req.level &&
          (!req.str || newStr >= req.str) &&
          (!req.dex || newDex >= req.dex) &&
          (!req.int || newInt >= req.int) &&
          (!req.luk || newLuk >= req.luk);

        if (!meetsReq) {
          newJob = 'Base';
          newWeapon = 'bone';
          newJobTier = 0;
        }
      }

      return {
        isDead: true,
        level: newLevel,
        str: newStr,
        dex: newDex,
        int: newInt,
        vit: newVit,
        luk: newLuk,
        job: newJob,
        weapon: newWeapon,
        jobTier: newJobTier,
      };
    }),

  respawn: () =>
    set((s) => ({
      isDead: false,
      hp: CONFIG.BASE_HP + s.vit * 10,
      maxHp: CONFIG.BASE_HP + s.vit * 10,
      mp: CONFIG.BASE_MP + s.int * 5,
      maxMp: CONFIG.BASE_MP + s.int * 5,
      x: (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2,
      y: (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2,
    })),

  // Job change
  tryChangeJob: (job) => {
    const s = get();
    const req = JOB_REQUIREMENTS[job];

    if (!req) return false;

    const meetsReq =
      s.level >= req.level &&
      (!req.str || s.str >= req.str) &&
      (!req.dex || s.dex >= req.dex) &&
      (!req.int || s.int >= req.int) &&
      (!req.luk || s.luk >= req.luk);

    if (meetsReq) {
      set({
        job,
        jobTier: 1,
        weapon: JOB_WEAPONS[job] as WeaponType,
      });
      return true;
    }

    return false;
  },

  // Check job maintenance (called periodically)
  checkJobMaintenance: () => {
    const s = get();
    if (s.job === 'Base') return;

    const req = JOB_REQUIREMENTS[s.job];
    if (!req) return;

    const meetsReq =
      s.level >= req.level &&
      (!req.str || s.str >= req.str) &&
      (!req.dex || s.dex >= req.dex) &&
      (!req.int || s.int >= req.int) &&
      (!req.luk || s.luk >= req.luk);

    if (!meetsReq) {
      set({
        job: 'Base',
        jobTier: 0,
        weapon: 'bone',
      });
    }
  },

  // Attack system
  startAttack: () => {
    const s = get();
    if (s.isAttacking || s.attackTimer > 0) return false;

    set({
      isAttacking: true,
      attackTimer: s.attackCooldown,
    });
    return true;
  },

  updateAttack: (deltaTime) => {
    const s = get();
    if (s.attackTimer > 0) {
      const newTimer = s.attackTimer - deltaTime;
      set({
        attackTimer: Math.max(0, newTimer),
        isAttacking: newTimer > s.attackCooldown * 0.5,
      });
    }
  },

  getAttackPower: () => {
    const s = get();
    const baseAttack = CONFIG.BASE_ATTACK;

    // Calculate attack based on job and stats
    let attack = baseAttack;

    switch (s.job) {
      case 'Warrior':
        attack += s.str * 2;
        break;
      case 'Archer':
        attack += s.dex * 2;
        break;
      case 'Mage':
        attack += s.int * 2;
        break;
      case 'Thief':
        attack += Math.floor((s.dex + s.luk) * 1.2);
        break;
      default:
        attack += Math.floor((s.str + s.dex + s.int) / 3);
    }

    // Critical hit chance based on LUK
    const critChance = s.luk * 0.02;
    if (Math.random() < critChance) {
      attack *= 1.5;
    }

    return Math.floor(attack);
  },
}));
