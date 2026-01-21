import { create } from 'zustand';
import type { MonsterType } from '../game/entities/Monster';

export interface BossLoot {
  itemId: string;
  name: string;
  nameKo: string;
  rarity: 'rare' | 'epic' | 'legendary';
  dropChance: number;
  type: 'weapon' | 'armor' | 'accessory' | 'material';
}

export interface BossInfo {
  type: MonsterType;
  name: string;
  nameKo: string;
  description: string;
  recommendedLevel: number;
  recommendedPartySize: number;
  loot: BossLoot[];
}

export const BOSS_INFO: Record<string, BossInfo> = {
  forest_boss: {
    type: 'forest_boss',
    name: 'Forest Guardian',
    nameKo: '숲의 수호자',
    description: '오래된 숲을 지키는 고대의 트렌트. 자연의 힘을 사용하여 침입자를 물리친다.',
    recommendedLevel: 15,
    recommendedPartySize: 3,
    loot: [
      { itemId: 'guardian_bark', name: 'Guardian Bark', nameKo: '수호자의 나무껍질', rarity: 'rare', dropChance: 0.5, type: 'material' },
      { itemId: 'forest_ring', name: 'Forest Ring', nameKo: '숲의 반지', rarity: 'rare', dropChance: 0.3, type: 'accessory' },
      { itemId: 'treant_staff', name: 'Treant Staff', nameKo: '트렌트 지팡이', rarity: 'epic', dropChance: 0.15, type: 'weapon' },
      { itemId: 'guardian_helm', name: 'Guardian Helm', nameKo: '수호자의 투구', rarity: 'epic', dropChance: 0.1, type: 'armor' },
    ],
  },
  cave_boss: {
    type: 'cave_boss',
    name: 'Rock Lord',
    nameKo: '바위 군주',
    description: '지하 동굴의 지배자. 용암의 힘을 머금은 거대한 골렘.',
    recommendedLevel: 25,
    recommendedPartySize: 4,
    loot: [
      { itemId: 'lava_core', name: 'Lava Core', nameKo: '용암 핵', rarity: 'rare', dropChance: 0.5, type: 'material' },
      { itemId: 'stone_shield', name: 'Stone Shield', nameKo: '돌 방패', rarity: 'epic', dropChance: 0.2, type: 'armor' },
      { itemId: 'magma_axe', name: 'Magma Axe', nameKo: '마그마 도끼', rarity: 'epic', dropChance: 0.15, type: 'weapon' },
      { itemId: 'lord_gauntlet', name: 'Lord\'s Gauntlet', nameKo: '군주의 건틀릿', rarity: 'legendary', dropChance: 0.05, type: 'armor' },
    ],
  },
  pyramid_boss: {
    type: 'pyramid_boss',
    name: 'Pharaoh',
    nameKo: '파라오',
    description: '고대 피라미드에서 부활한 불멸의 파라오. 죽음의 마법을 다룬다.',
    recommendedLevel: 35,
    recommendedPartySize: 5,
    loot: [
      { itemId: 'ancient_cloth', name: 'Ancient Cloth', nameKo: '고대의 천', rarity: 'rare', dropChance: 0.5, type: 'material' },
      { itemId: 'pharaoh_mask', name: 'Pharaoh Mask', nameKo: '파라오의 가면', rarity: 'epic', dropChance: 0.2, type: 'armor' },
      { itemId: 'death_scepter', name: 'Death Scepter', nameKo: '죽음의 홀', rarity: 'epic', dropChance: 0.15, type: 'weapon' },
      { itemId: 'sun_amulet', name: 'Sun Amulet', nameKo: '태양의 아뮬렛', rarity: 'legendary', dropChance: 0.08, type: 'accessory' },
      { itemId: 'pharaoh_crown', name: 'Pharaoh\'s Crown', nameKo: '파라오의 왕관', rarity: 'legendary', dropChance: 0.03, type: 'armor' },
    ],
  },
};

// Special attack types for bosses
export type BossAttackType = 'normal' | 'aoe' | 'stun' | 'summon' | 'enrage';

export interface BossSpecialAttack {
  name: string;
  nameKo: string;
  type: BossAttackType;
  damage: number;
  radius?: number; // For AOE
  duration?: number; // For stun
  cooldown: number;
}

export const BOSS_SPECIAL_ATTACKS: Record<string, BossSpecialAttack[]> = {
  forest_boss: [
    { name: 'Root Slam', nameKo: '뿌리 강타', type: 'aoe', damage: 30, radius: 100, cooldown: 8000 },
    { name: 'Entangle', nameKo: '덩굴 속박', type: 'stun', damage: 15, duration: 2000, cooldown: 15000 },
    { name: 'Nature\'s Wrath', nameKo: '자연의 분노', type: 'enrage', damage: 0, cooldown: 60000 },
  ],
  cave_boss: [
    { name: 'Ground Pound', nameKo: '땅 내려치기', type: 'aoe', damage: 45, radius: 120, cooldown: 10000 },
    { name: 'Boulder Throw', nameKo: '바위 던지기', type: 'normal', damage: 60, cooldown: 5000 },
    { name: 'Lava Surge', nameKo: '용암 분출', type: 'aoe', damage: 35, radius: 150, cooldown: 12000 },
    { name: 'Stone Skin', nameKo: '돌 피부', type: 'enrage', damage: 0, cooldown: 45000 },
  ],
  pyramid_boss: [
    { name: 'Death Curse', nameKo: '죽음의 저주', type: 'aoe', damage: 50, radius: 130, cooldown: 8000 },
    { name: 'Soul Drain', nameKo: '영혼 흡수', type: 'normal', damage: 70, cooldown: 6000 },
    { name: 'Summon Mummies', nameKo: '미라 소환', type: 'summon', damage: 0, cooldown: 20000 },
    { name: 'Pharaoh\'s Rage', nameKo: '파라오의 분노', type: 'enrage', damage: 0, cooldown: 30000 },
  ],
};

interface BossAnnouncement {
  id: string;
  message: string;
  type: 'spawn' | 'enrage' | 'kill' | 'special_attack';
  timestamp: number;
  bossType: string;
}

interface BossState {
  // Active bosses tracking
  activeBosses: Map<number, {
    type: string;
    hp: number;
    maxHp: number;
    isEnraged: boolean;
    specialCooldowns: Map<string, number>;
  }>;

  // Announcements
  announcements: BossAnnouncement[];

  // Kill tracking
  bossKills: Record<string, number>;

  // Actions
  registerBoss: (monsterId: number, bossType: string, maxHp: number) => void;
  updateBossHp: (monsterId: number, hp: number) => void;
  setEnraged: (monsterId: number, enraged: boolean) => void;
  removeBoss: (monsterId: number) => void;
  addAnnouncement: (message: string, type: BossAnnouncement['type'], bossType: string) => void;
  clearOldAnnouncements: () => void;
  recordBossKill: (bossType: string) => void;
  getBossLoot: (bossType: string) => BossLoot[];
}

export const useBossStore = create<BossState>((set, get) => ({
  activeBosses: new Map(),
  announcements: [],
  bossKills: {},

  registerBoss: (monsterId, bossType, maxHp) => {
    const newBosses = new Map(get().activeBosses);
    newBosses.set(monsterId, {
      type: bossType,
      hp: maxHp,
      maxHp,
      isEnraged: false,
      specialCooldowns: new Map(),
    });
    set({ activeBosses: newBosses });

    // Announce boss spawn
    const info = BOSS_INFO[bossType];
    if (info) {
      get().addAnnouncement(
        `${info.nameKo}(이)가 나타났습니다!`,
        'spawn',
        bossType
      );
    }
  },

  updateBossHp: (monsterId, hp) => {
    const boss = get().activeBosses.get(monsterId);
    if (!boss) return;

    const newBosses = new Map(get().activeBosses);
    const updated = { ...boss, hp };

    // Check for enrage at 30% HP
    if (!boss.isEnraged && hp <= boss.maxHp * 0.3) {
      updated.isEnraged = true;
      const info = BOSS_INFO[boss.type];
      if (info) {
        get().addAnnouncement(
          `${info.nameKo}(이)가 분노했습니다!`,
          'enrage',
          boss.type
        );
      }
    }

    newBosses.set(monsterId, updated);
    set({ activeBosses: newBosses });
  },

  setEnraged: (monsterId, enraged) => {
    const boss = get().activeBosses.get(monsterId);
    if (!boss) return;

    const newBosses = new Map(get().activeBosses);
    newBosses.set(monsterId, { ...boss, isEnraged: enraged });
    set({ activeBosses: newBosses });
  },

  removeBoss: (monsterId) => {
    const boss = get().activeBosses.get(monsterId);
    if (!boss) return;

    const newBosses = new Map(get().activeBosses);
    newBosses.delete(monsterId);
    set({ activeBosses: newBosses });
  },

  addAnnouncement: (message, type, bossType) => {
    const announcement: BossAnnouncement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: Date.now(),
      bossType,
    };

    set((state) => ({
      announcements: [...state.announcements, announcement].slice(-10), // Keep last 10
    }));
  },

  clearOldAnnouncements: () => {
    const now = Date.now();
    set((state) => ({
      announcements: state.announcements.filter(
        (a) => now - a.timestamp < 10000 // Remove after 10 seconds
      ),
    }));
  },

  recordBossKill: (bossType) => {
    const info = BOSS_INFO[bossType];
    if (info) {
      get().addAnnouncement(
        `${info.nameKo}(을)를 처치했습니다!`,
        'kill',
        bossType
      );
    }

    set((state) => ({
      bossKills: {
        ...state.bossKills,
        [bossType]: (state.bossKills[bossType] || 0) + 1,
      },
    }));
  },

  getBossLoot: (bossType) => {
    const info = BOSS_INFO[bossType];
    if (!info) return [];

    const droppedLoot: BossLoot[] = [];
    info.loot.forEach((loot) => {
      if (Math.random() < loot.dropChance) {
        droppedLoot.push(loot);
      }
    });

    return droppedLoot;
  },
}));

// Utility function to get boss damage multiplier when enraged
export const getEnragedMultiplier = (isEnraged: boolean): number => {
  return isEnraged ? 1.5 : 1.0;
};

// Utility function to get boss defense multiplier when enraged (lower defense but higher attack)
export const getEnragedDefenseMultiplier = (isEnraged: boolean): number => {
  return isEnraged ? 0.7 : 1.0;
};
