import { create } from 'zustand';
import { CONFIG, getExpNeededForLevel, type Direction, type JobType, type StatType, type WeaponType, type ToolType, type Job1stType, type Job2ndType, JOB_ADVANCEMENT_PATH } from '@shared/types';
import { JOB_WEAPONS } from '../game/weapons';
import { useEquipmentStore } from './equipmentStore';

interface JobRequirement {
  level: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  vit?: number;
  previousJob?: Job1stType; // Required for 2nd job
}

// 1st Job Requirements (Lv.10+)
export const JOB_REQUIREMENTS: Record<JobType, JobRequirement | null> = {
  Base: null,
  // 1st jobs (user specified requirements)
  Warrior: { level: 10, str: 20, vit: 15 },
  Archer: { level: 10, dex: 20, luk: 10 },
  Mage: { level: 10, int: 25 },
  Thief: { level: 10, dex: 15, luk: 15 },
  // 2nd jobs - Warrior branch (검, 둔기, 봉)
  Swordsman: { level: 30, str: 50, vit: 25, previousJob: 'Warrior' },
  Mace: { level: 30, str: 45, vit: 35, previousJob: 'Warrior' },
  Polearm: { level: 30, str: 40, dex: 30, previousJob: 'Warrior' },
  // 2nd jobs - Archer branch (거너, 활, 석궁)
  Gunner: { level: 30, dex: 50, int: 25, previousJob: 'Archer' },
  Bowmaster: { level: 30, dex: 55, luk: 20, previousJob: 'Archer' },
  Crossbowman: { level: 30, dex: 45, str: 30, previousJob: 'Archer' },
  // 2nd jobs - Mage branch (원소, 성, 악)
  Elemental: { level: 30, int: 60, vit: 15, previousJob: 'Mage' },
  Holy: { level: 30, int: 50, vit: 30, previousJob: 'Mage' },
  Dark: { level: 30, int: 55, luk: 25, previousJob: 'Mage' },
  // 2nd jobs - Thief branch (격투가, 단검, 표창)
  Fighter: { level: 30, str: 40, dex: 35, previousJob: 'Thief' },
  Dagger: { level: 30, dex: 50, luk: 30, previousJob: 'Thief' },
  Shuriken: { level: 30, dex: 40, luk: 45, previousJob: 'Thief' },
};

export const JOB_BONUS_STATS: Record<JobType, Partial<Record<StatType, number>>> = {
  Base: {},
  // 1st job bonuses
  Warrior: { str: 5, vit: 3 },
  Archer: { dex: 5, luk: 3 },
  Mage: { int: 5, vit: 3 },
  Thief: { dex: 3, luk: 5 },
  // 2nd job bonuses - Warrior branch
  Swordsman: { str: 12, vit: 5, dex: 3 },
  Mace: { str: 10, vit: 10 },
  Polearm: { str: 8, dex: 8, vit: 4 },
  // 2nd job bonuses - Archer branch
  Gunner: { dex: 10, int: 5, luk: 5 },
  Bowmaster: { dex: 15, luk: 5 },
  Crossbowman: { dex: 10, str: 8, vit: 2 },
  // 2nd job bonuses - Mage branch
  Elemental: { int: 18, vit: 2 },
  Holy: { int: 10, vit: 8, luk: 2 },
  Dark: { int: 14, luk: 6 },
  // 2nd job bonuses - Thief branch
  Fighter: { str: 10, dex: 8, vit: 2 },
  Dagger: { dex: 12, luk: 8 },
  Shuriken: { dex: 8, luk: 12 },
};

// Job descriptions for UI
export const JOB_DESCRIPTIONS: Record<JobType, { name: string; nameKo: string; description: string }> = {
  Base: { name: 'Base', nameKo: '기본', description: '모험을 시작하는 초보자' },
  // 1st jobs
  Warrior: { name: 'Warrior', nameKo: '전사', description: '강한 힘으로 적을 제압하는 근거리 전투 전문가' },
  Archer: { name: 'Archer', nameKo: '궁수', description: '민첩한 활솜씨로 먼 거리에서 적을 공격' },
  Mage: { name: 'Mage', nameKo: '마법사', description: '강력한 마법으로 적을 공격하는 마법 전문가' },
  Thief: { name: 'Thief', nameKo: '도적', description: '빠른 움직임과 행운으로 기습 공격 전문' },
  // 2nd jobs - Warrior branch (검, 둔기, 봉)
  Swordsman: { name: 'Swordsman', nameKo: '소드맨', description: '강력한 검술로 적을 베어내는 검사' },
  Mace: { name: 'Mace', nameKo: '메이스', description: '단단한 방어력과 둔기로 적을 제압하는 중장보병' },
  Polearm: { name: 'Polearm', nameKo: '폴암', description: '긴 봉을 휘둘러 넓은 범위를 공격하는 창술사' },
  // 2nd jobs - Archer branch (거너, 활, 석궁)
  Gunner: { name: 'Gunner', nameKo: '거너', description: '화약 무기로 폭발적인 화력을 뿜어내는 사격수' },
  Bowmaster: { name: 'Bowmaster', nameKo: '보우마스터', description: '완벽한 활술로 정확한 일격을 날리는 명궁' },
  Crossbowman: { name: 'Crossbowman', nameKo: '석궁병', description: '강력한 석궁으로 관통력 높은 공격을 하는 저격수' },
  // 2nd jobs - Mage branch (원소, 성, 악)
  Elemental: { name: 'Elemental', nameKo: '엘리멘탈', description: '불, 물, 바람의 원소 마법으로 광역 피해를 주는 정령술사' },
  Holy: { name: 'Holy', nameKo: '홀리', description: '신성한 힘으로 아군을 치유하고 적을 정화하는 성직자' },
  Dark: { name: 'Dark', nameKo: '다크', description: '어둠의 힘을 다루어 저주와 공포를 퍼뜨리는 흑마법사' },
  // 2nd jobs - Thief branch (격투가, 단검, 표창)
  Fighter: { name: 'Fighter', nameKo: '파이터', description: '맨손 격투로 빠르고 강력한 연속 공격을 하는 무도가' },
  Dagger: { name: 'Dagger', nameKo: '대거', description: '쌍단검으로 빠른 연속 공격과 치명타를 노리는 암살자' },
  Shuriken: { name: 'Shuriken', nameKo: '슈리켄', description: '표창을 던져 원거리에서 기습 공격하는 닌자' },
};

// Check if a job is 2nd tier
export const is2ndJob = (job: JobType): job is Job2ndType => {
  return [
    'Swordsman', 'Mace', 'Polearm',           // Warrior branch
    'Gunner', 'Bowmaster', 'Crossbowman',     // Archer branch
    'Elemental', 'Holy', 'Dark',              // Mage branch
    'Fighter', 'Dagger', 'Shuriken'           // Thief branch
  ].includes(job);
};

// Check if a job is 1st tier
export const is1stJob = (job: JobType): job is Job1stType => {
  return ['Warrior', 'Archer', 'Mage', 'Thief'].includes(job);
};

// Get available 2nd jobs based on current 1st job
export const getAvailable2ndJobs = (currentJob: JobType): Job2ndType[] => {
  if (!is1stJob(currentJob)) return [];
  return JOB_ADVANCEMENT_PATH[currentJob];
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

  // Combat stats
  attack: number;
  defense: number;

  // Currency
  gold: number;

  // Job & Equipment
  job: JobType;
  jobTier: number;
  weapon: WeaponType;
  tool: ToolType | null;

  // Combat state
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  lastCritical: boolean;  // Was last attack a critical hit?

  // Dash state
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  dashDirection: Direction | null;

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
  gainGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  allocateStat: (stat: StatType) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  restoreMp: (amount: number) => void;
  useMp: (amount: number) => boolean;
  die: () => void;
  respawn: () => void;
  tryChangeJob: (job: JobType) => boolean;
  checkJobMaintenance: () => void;
  startAttack: () => boolean;
  updateAttack: (deltaTime: number) => void;
  getAttackPower: () => { damage: number; isCritical: boolean };
  getDisplayAttackPower: () => number;  // For UI display only, no state change
  startDash: () => boolean;
  updateDash: (deltaTime: number) => void;
  getExpNeeded: () => number;
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

  // Combat stats
  attack: CONFIG.BASE_ATTACK,
  defense: 5,

  // Currency
  gold: 100,

  // Initial job & equipment
  job: 'Base',
  jobTier: 0,
  weapon: 'bone',
  tool: null,

  // Combat state
  isAttacking: false,
  attackTimer: 0,
  attackCooldown: 500, // ms
  lastCritical: false,

  // Dash state
  isDashing: false,
  dashTimer: 0,
  dashCooldown: 0,
  dashDirection: null,

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

    let expNeeded = getExpNeededForLevel(newLevel);
    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel++;
      newStatPoints += CONFIG.STAT_POINTS_PER_LEVEL;
      expNeeded = getExpNeededForLevel(newLevel);
    }

    set({
      exp: newExp,
      level: newLevel,
      statPoints: newStatPoints,
    });
  },

  // Gold
  gainGold: (amount) => {
    set((s) => ({ gold: s.gold + amount }));
  },

  spendGold: (amount) => {
    const s = get();
    if (s.gold < amount) return false;
    set({ gold: s.gold - amount });
    return true;
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
    let defense = Math.floor(s.vit * 0.5);

    // Apply defense buff bonus from scrolls
    const { defenseBonus } = useEquipmentStore.getState().getBuffBonuses();
    if (defenseBonus > 0) {
      defense = Math.floor(defense * (1 + defenseBonus));
    }

    const actualDamage = Math.max(1, amount - defense);
    const newHp = s.hp - actualDamage;

    if (newHp <= 0) {
      get().die();
    } else {
      set({ hp: newHp });

      // Sync HP to party members via server
      import('../services/socket').then(({ socketService }) => {
        const socket = socketService.getSocket();
        if (socket) {
          socket.emit('player:damaged_self', { hp: newHp, maxHp: s.maxHp, damage: actualDamage });
        }
      });
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

  useMp: (amount) => {
    const s = get();
    if (s.mp < amount) return false;
    set({ mp: s.mp - amount });
    return true;
  },

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
      // Respawn at starting village
      x: 640,
      y: 640,
    })),

  // Job change
  tryChangeJob: (job) => {
    const s = get();
    const req = JOB_REQUIREMENTS[job];

    if (!req) return false;

    // Check stat requirements
    const meetsReq =
      s.level >= req.level &&
      (!req.str || s.str >= req.str) &&
      (!req.dex || s.dex >= req.dex) &&
      (!req.int || s.int >= req.int) &&
      (!req.vit || s.vit >= req.vit) &&
      (!req.luk || s.luk >= req.luk);

    if (!meetsReq) return false;

    // Check previous job requirement for 2nd jobs
    if (req.previousJob) {
      if (s.job !== req.previousJob) return false;
    } else {
      // For 1st jobs, must be Base
      if (s.job !== 'Base') return false;
    }

    // Determine job tier
    const newJobTier = is2ndJob(job) ? 2 : 1;

    set({
      job,
      jobTier: newJobTier,
      weapon: JOB_WEAPONS[job] as WeaponType,
    });
    return true;
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

  getAttackPower: (): { damage: number; isCritical: boolean } => {
    const s = get();
    const baseAttack: number = CONFIG.BASE_ATTACK;

    // Get equipment stats with explicit typing to break circular reference
    const equipStats = useEquipmentStore.getState().getEquippedStats();
    const equipAttack: number = equipStats.attack ?? 0;
    const equipStr: number = equipStats.str ?? 0;
    const equipDex: number = equipStats.dex ?? 0;
    const equipInt: number = equipStats.int ?? 0;
    const equipLuk: number = equipStats.luk ?? 0;

    // Total stats including equipment
    const totalStr: number = s.str + equipStr;
    const totalDex: number = s.dex + equipDex;
    const totalInt: number = s.int + equipInt;
    const totalLuk: number = s.luk + equipLuk;

    // Calculate attack based on job and stats
    let attack: number = baseAttack + equipAttack;
    let jobMultiplier = 1.0;

    switch (s.job) {
      // Base job
      case 'Base':
        attack += Math.floor((totalStr + totalDex + totalInt) / 3);
        break;

      // 1st jobs
      case 'Warrior':
        attack += totalStr * 2;
        jobMultiplier = 1.1;
        break;
      case 'Archer':
        attack += totalDex * 2;
        jobMultiplier = 1.1;
        break;
      case 'Mage':
        attack += totalInt * 2;
        jobMultiplier = 1.1;
        break;
      case 'Thief':
        attack += Math.floor((totalDex + totalLuk) * 1.2);
        jobMultiplier = 1.1;
        break;

      // 2nd jobs - Warrior branch (검, 둔기, 봉)
      case 'Swordsman':
        attack += totalStr * 2.5 + totalDex * 0.5;
        jobMultiplier = 1.35;
        break;
      case 'Mace':
        attack += totalStr * 2.2 + s.vit * 0.8;
        jobMultiplier = 1.3;
        break;
      case 'Polearm':
        attack += totalStr * 2 + totalDex * 1;
        jobMultiplier = 1.3;
        break;

      // 2nd jobs - Archer branch (거너, 활, 석궁)
      case 'Gunner':
        attack += totalDex * 2 + totalInt * 1;
        jobMultiplier = 1.35;
        break;
      case 'Bowmaster':
        attack += totalDex * 2.5 + totalLuk * 0.8;
        jobMultiplier = 1.35;
        break;
      case 'Crossbowman':
        attack += totalDex * 2.2 + totalStr * 0.8;
        jobMultiplier = 1.3;
        break;

      // 2nd jobs - Mage branch (원소, 성, 악)
      case 'Elemental':
        attack += totalInt * 3;
        jobMultiplier = 1.45;
        break;
      case 'Holy':
        attack += totalInt * 2 + s.vit * 0.8;
        jobMultiplier = 1.2;
        break;
      case 'Dark':
        attack += totalInt * 2.5 + totalLuk * 0.8;
        jobMultiplier = 1.35;
        break;

      // 2nd jobs - Thief branch (격투가, 단검, 표창)
      case 'Fighter':
        attack += totalStr * 1.5 + totalDex * 1.5;
        jobMultiplier = 1.35;
        break;
      case 'Dagger':
        attack += totalDex * 1.5 + totalLuk * 1.5;
        jobMultiplier = 1.35;
        break;
      case 'Shuriken':
        attack += totalDex * 1.2 + totalLuk * 2;
        jobMultiplier = 1.3;
        break;

      default:
        attack += Math.floor((totalStr + totalDex + totalInt) / 3);
    }

    // Apply job multiplier
    attack = Math.floor(attack * jobMultiplier);

    // Apply buff bonuses from scrolls
    const { attackBonus } = useEquipmentStore.getState().getBuffBonuses();
    if (attackBonus > 0) {
      attack = Math.floor(attack * (1 + attackBonus));
    }

    // Critical hit chance based on LUK (higher for Thief branch)
    let critChance = totalLuk * 0.02;
    let critMultiplier = 1.5;

    // Enhanced crit bonuses for specific jobs
    if (s.job === 'Dagger') {
      critChance = s.luk * 0.03;
      critMultiplier = 2.0;
    } else if (s.job === 'Shuriken') {
      critChance = s.luk * 0.035;
      critMultiplier = 1.8;
    } else if (s.job === 'Bowmaster') {
      critChance = s.luk * 0.025;
      critMultiplier = 2.5; // Headshot bonus
    } else if (s.job === 'Dark') {
      critChance = s.luk * 0.025;
      critMultiplier = 2.0;
    }

    const isCritical = Math.random() < critChance;
    if (isCritical) {
      attack = Math.floor(attack * critMultiplier);
    }

    // Store last critical state
    set({ lastCritical: isCritical });

    return { damage: attack, isCritical };
  },

  // Display attack power (for UI, no critical roll, no state change)
  getDisplayAttackPower: (): number => {
    const s = get();
    const baseAttack: number = CONFIG.BASE_ATTACK;

    // Get equipment stats
    const equipStats = useEquipmentStore.getState().getEquippedStats();
    const equipAttack: number = equipStats.attack ?? 0;
    const equipStr: number = equipStats.str ?? 0;
    const equipDex: number = equipStats.dex ?? 0;
    const equipInt: number = equipStats.int ?? 0;
    const equipLuk: number = equipStats.luk ?? 0;

    // Total stats including equipment
    const totalStr: number = s.str + equipStr;
    const totalDex: number = s.dex + equipDex;
    const totalInt: number = s.int + equipInt;
    const totalLuk: number = s.luk + equipLuk;

    let attack: number = baseAttack + equipAttack;
    let jobMultiplier = 1.0;

    switch (s.job) {
      case 'Base':
        attack += Math.floor((totalStr + totalDex + totalInt) / 3);
        break;
      case 'Warrior':
        attack += totalStr * 2;
        jobMultiplier = 1.1;
        break;
      case 'Archer':
        attack += totalDex * 2;
        jobMultiplier = 1.1;
        break;
      case 'Mage':
        attack += totalInt * 2;
        jobMultiplier = 1.1;
        break;
      case 'Thief':
        attack += Math.floor((totalDex + totalLuk) * 1.2);
        jobMultiplier = 1.1;
        break;
      // 2nd jobs - Warrior branch
      case 'Swordsman':
        attack += totalStr * 2.5 + totalDex * 0.5;
        jobMultiplier = 1.35;
        break;
      case 'Mace':
        attack += totalStr * 2.2 + s.vit * 0.8;
        jobMultiplier = 1.3;
        break;
      case 'Polearm':
        attack += totalStr * 2 + totalDex * 1;
        jobMultiplier = 1.3;
        break;
      // 2nd jobs - Archer branch
      case 'Gunner':
        attack += totalDex * 2 + totalInt * 1;
        jobMultiplier = 1.35;
        break;
      case 'Bowmaster':
        attack += totalDex * 2.5 + totalLuk * 0.8;
        jobMultiplier = 1.35;
        break;
      case 'Crossbowman':
        attack += totalDex * 2.2 + totalStr * 0.8;
        jobMultiplier = 1.3;
        break;
      // 2nd jobs - Mage branch
      case 'Elemental':
        attack += totalInt * 3;
        jobMultiplier = 1.45;
        break;
      case 'Holy':
        attack += totalInt * 2 + s.vit * 0.8;
        jobMultiplier = 1.2;
        break;
      case 'Dark':
        attack += totalInt * 2.5 + totalLuk * 0.8;
        jobMultiplier = 1.35;
        break;
      // 2nd jobs - Thief branch
      case 'Fighter':
        attack += totalStr * 1.5 + totalDex * 1.5;
        jobMultiplier = 1.35;
        break;
      case 'Dagger':
        attack += totalDex * 1.5 + totalLuk * 1.5;
        jobMultiplier = 1.35;
        break;
      case 'Shuriken':
        attack += totalDex * 1.2 + totalLuk * 2;
        jobMultiplier = 1.3;
        break;
      default:
        attack += Math.floor((totalStr + totalDex + totalInt) / 3);
    }

    return Math.floor(attack * jobMultiplier);
  },

  // Dash system
  startDash: () => {
    const s = get();
    if (s.isDashing || s.dashCooldown > 0 || s.isDead) return false;

    // Determine dash direction based on current keys or facing
    let dashDir: Direction = s.direction;
    if (s.keys.up) dashDir = 'up';
    else if (s.keys.down) dashDir = 'down';
    else if (s.keys.left) dashDir = 'left';
    else if (s.keys.right) dashDir = 'right';

    set({
      isDashing: true,
      dashTimer: CONFIG.DASH_DURATION,
      dashDirection: dashDir,
    });
    return true;
  },

  updateDash: (deltaTime) => {
    const s = get();

    // Update dash timer
    if (s.dashTimer > 0) {
      const newTimer = s.dashTimer - deltaTime;
      if (newTimer <= 0) {
        set({
          isDashing: false,
          dashTimer: 0,
          dashCooldown: CONFIG.DASH_COOLDOWN,
          dashDirection: null,
        });
      } else {
        set({ dashTimer: newTimer });
      }
    }

    // Update cooldown
    if (s.dashCooldown > 0) {
      set({ dashCooldown: Math.max(0, s.dashCooldown - deltaTime) });
    }
  },

  getExpNeeded: () => {
    const s = get();
    return getExpNeededForLevel(s.level);
  },
}));

// Re-export types for convenience
export type { JobType, StatType, ToolType };
