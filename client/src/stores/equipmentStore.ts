import { create } from 'zustand';
import itemsData from '../data/items.json';
import { usePlayerStore } from './playerStore';
import { useInventoryStore } from './inventoryStore';

export type EquipmentSlot = 'weapon' | 'head' | 'body' | 'accessory';

export interface ItemStats {
  attack?: number;
  defense?: number;
  hp?: number;
  mp?: number;
  str?: number;
  dex?: number;
  int?: number;
  vit?: number;
  luk?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  nameKo: string;
  type: string;
  slot: EquipmentSlot;
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  job: string[];
  stats: ItemStats;
  levelReq: number;
  price: number;
  enhanceLevel?: number; // Enhancement level (0-10)
}

// Enhancement configuration
export interface EnhanceConfig {
  level: number;
  successRate: number;
  goldCost: number;
  statBonus: number; // Percentage bonus per level
  destroyOnFail: boolean;
  downgradeOnFail: boolean;
}

export const ENHANCE_CONFIGS: EnhanceConfig[] = [
  { level: 1, successRate: 95, goldCost: 100, statBonus: 5, destroyOnFail: false, downgradeOnFail: false },
  { level: 2, successRate: 90, goldCost: 200, statBonus: 10, destroyOnFail: false, downgradeOnFail: false },
  { level: 3, successRate: 85, goldCost: 400, statBonus: 15, destroyOnFail: false, downgradeOnFail: false },
  { level: 4, successRate: 75, goldCost: 800, statBonus: 22, destroyOnFail: false, downgradeOnFail: false },
  { level: 5, successRate: 65, goldCost: 1500, statBonus: 30, destroyOnFail: false, downgradeOnFail: true },
  { level: 6, successRate: 55, goldCost: 3000, statBonus: 40, destroyOnFail: false, downgradeOnFail: true },
  { level: 7, successRate: 45, goldCost: 5000, statBonus: 55, destroyOnFail: false, downgradeOnFail: true },
  { level: 8, successRate: 35, goldCost: 8000, statBonus: 75, destroyOnFail: true, downgradeOnFail: false },
  { level: 9, successRate: 25, goldCost: 15000, statBonus: 100, destroyOnFail: true, downgradeOnFail: false },
  { level: 10, successRate: 15, goldCost: 30000, statBonus: 150, destroyOnFail: true, downgradeOnFail: false },
];

// Get enhancement color based on level
export const getEnhanceColor = (level: number): string => {
  if (!level || level === 0) return '#FFFFFF';
  if (level <= 3) return '#55FF55';
  if (level <= 6) return '#5555FF';
  if (level <= 8) return '#AA00FF';
  return '#FFD700';
};

// Calculate enhanced stats
export const calculateEnhancedStats = (item: EquipmentItem): ItemStats => {
  const baseStats = { ...item.stats };
  const enhanceLevel = item.enhanceLevel || 0;
  if (enhanceLevel === 0) return baseStats;

  const config = ENHANCE_CONFIGS[enhanceLevel - 1];
  if (!config) return baseStats;

  const bonusMultiplier = 1 + config.statBonus / 100;

  const enhancedStats: ItemStats = {};
  for (const [key, value] of Object.entries(baseStats)) {
    if (typeof value === 'number') {
      enhancedStats[key as keyof ItemStats] = Math.round(value * bonusMultiplier);
    }
  }

  return enhancedStats;
};

// Get display name with enhancement level
export const getEnhancedDisplayName = (item: EquipmentItem): string => {
  const enhanceLevel = item.enhanceLevel || 0;
  if (enhanceLevel > 0) {
    return `+${enhanceLevel} ${item.nameKo}`;
  }
  return item.nameKo;
};

export interface ConsumableItem {
  id: string;
  name: string;
  nameKo: string;
  type: 'consumable';
  effect: string;
  value: number;
  duration?: number;
  tier: string;
  price: number;
  stackable: boolean;
  maxStack: number;
}

// Enhancement result type
export type EnhanceResult = 'none' | 'success' | 'fail' | 'destroy' | 'downgrade';

// Buff system
export interface ActiveBuff {
  type: 'attack' | 'defense';
  value: number; // Percentage bonus (e.g., 0.2 = 20%)
  endTime: number;
  itemId: string;
}

interface EquipmentState {
  // All items from data
  allItems: {
    weapons: Record<string, EquipmentItem>;
    armor: Record<string, EquipmentItem>;
    consumables: Record<string, ConsumableItem>;
  };

  // Currently equipped items
  equipped: {
    weapon: EquipmentItem | null;
    head: EquipmentItem | null;
    body: EquipmentItem | null;
    accessory: EquipmentItem | null;
  };

  // Enhancement state
  enhanceResult: EnhanceResult;
  lastEnhancedItem: EquipmentItem | null;

  // Active buffs from scrolls
  activeBuffs: ActiveBuff[];

  // Actions
  equipItem: (itemId: string) => { success: boolean; error?: string };
  unequipItem: (slot: EquipmentSlot) => boolean;
  getEquippedStats: () => ItemStats;
  canEquipItem: (itemId: string) => { canEquip: boolean; reason?: string };
  useConsumable: (itemId: string) => { success: boolean; error?: string };
  getItemById: (itemId: string) => EquipmentItem | ConsumableItem | null;
  resetEquipment: () => void;

  // Enhancement actions
  enhanceEquippedItem: (slot: EquipmentSlot) => { success: boolean; cost: number; result: EnhanceResult };
  clearEnhanceResult: () => void;

  // Buff actions
  addBuff: (buff: ActiveBuff) => void;
  updateBuffs: () => void;
  getBuffBonuses: () => { attackBonus: number; defenseBonus: number };
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  allItems: {
    weapons: itemsData.weapons as Record<string, EquipmentItem>,
    armor: itemsData.armor as Record<string, EquipmentItem>,
    consumables: itemsData.consumables as Record<string, ConsumableItem>
  },

  equipped: {
    weapon: null,
    head: null,
    body: null,
    accessory: null
  },

  enhanceResult: 'none',
  lastEnhancedItem: null,
  activeBuffs: [],

  equipItem: (itemId: string) => {
    const { allItems, equipped } = get();
    const { canEquip, reason } = get().canEquipItem(itemId);

    if (!canEquip) {
      return { success: false, error: reason };
    }

    // Find item
    let item: EquipmentItem | null = null;
    if (allItems.weapons[itemId]) {
      item = allItems.weapons[itemId];
    } else if (allItems.armor[itemId]) {
      item = allItems.armor[itemId];
    }

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check if we have the item in inventory
    const inventory = useInventoryStore.getState();
    const hasItem = inventory.items.some(i => i.id === itemId);
    if (!hasItem) {
      return { success: false, error: 'Item not in inventory' };
    }

    // Unequip current item in slot (add back to inventory)
    const currentEquipped = equipped[item.slot];
    if (currentEquipped) {
      inventory.addItem({
        id: currentEquipped.id,
        name: currentEquipped.name,
        type: 'equipment',
        quantity: 1
      });
    }

    // Remove item from inventory
    inventory.removeItem(itemId, 1);

    // Equip new item
    set({
      equipped: {
        ...equipped,
        [item.slot]: item
      }
    });

    return { success: true };
  },

  unequipItem: (slot: EquipmentSlot) => {
    const { equipped } = get();
    const item = equipped[slot];

    if (!item) return false;

    // Add item back to inventory
    const inventory = useInventoryStore.getState();
    inventory.addItem({
      id: item.id,
      name: item.name,
      type: 'equipment',
      quantity: 1
    });

    set({
      equipped: {
        ...equipped,
        [slot]: null
      }
    });

    return true;
  },

  getEquippedStats: () => {
    const { equipped } = get();
    const totalStats: ItemStats = {
      attack: 0,
      defense: 0,
      hp: 0,
      mp: 0,
      str: 0,
      dex: 0,
      int: 0,
      vit: 0,
      luk: 0
    };

    Object.values(equipped).forEach(item => {
      if (item && item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (totalStats[stat as keyof ItemStats] !== undefined) {
            totalStats[stat as keyof ItemStats]! += value as number;
          }
        });
      }
    });

    return totalStats;
  },

  canEquipItem: (itemId: string): { canEquip: boolean; reason?: string } => {
    const { allItems } = get();

    // Find item
    let item: EquipmentItem | null = null;
    if (allItems.weapons[itemId]) {
      item = allItems.weapons[itemId];
    } else if (allItems.armor[itemId]) {
      item = allItems.armor[itemId];
    }

    if (!item) {
      return { canEquip: false, reason: 'Item not found' };
    }

    const playerState = usePlayerStore.getState() as { level: number; job: string };

    // Check level requirement
    if (playerState.level < item.levelReq) {
      return { canEquip: false, reason: `Level ${item.levelReq} required` };
    }

    // Check job requirement
    if (!item.job.includes(playerState.job) && !item.job.includes('Base')) {
      return { canEquip: false, reason: `Cannot be equipped by ${playerState.job}` };
    }

    return { canEquip: true };
  },

  useConsumable: (itemId: string) => {
    const { allItems } = get();
    const consumable = allItems.consumables[itemId];

    if (!consumable) {
      return { success: false, error: 'Consumable not found' };
    }

    // Check inventory
    const inventory = useInventoryStore.getState();
    const hasItem = inventory.items.some(i => i.id === itemId && i.quantity > 0);
    if (!hasItem) {
      return { success: false, error: 'Item not in inventory' };
    }

    const playerStore = usePlayerStore.getState();

    // Apply effect
    switch (consumable.effect) {
      case 'heal':
        const currentHp = playerStore.hp;
        const maxHp = playerStore.maxHp;
        const newHp = Math.min(currentHp + consumable.value, maxHp);
        usePlayerStore.setState({ hp: newHp });
        break;

      case 'mana':
        const currentMp = playerStore.mp;
        const maxMp = playerStore.maxMp;
        const newMp = Math.min(currentMp + consumable.value, maxMp);
        usePlayerStore.setState({ mp: newMp });
        break;

      case 'buff_attack':
        get().addBuff({
          type: 'attack',
          value: consumable.value,
          endTime: Date.now() + (consumable.duration || 60000),
          itemId: itemId
        });
        break;

      case 'buff_defense':
        get().addBuff({
          type: 'defense',
          value: consumable.value,
          endTime: Date.now() + (consumable.duration || 60000),
          itemId: itemId
        });
        break;

      default:
        return { success: false, error: 'Unknown effect' };
    }

    // Remove from inventory
    inventory.removeItem(itemId, 1);

    return { success: true };
  },

  getItemById: (itemId: string) => {
    const { allItems } = get();

    if (allItems.weapons[itemId]) return allItems.weapons[itemId];
    if (allItems.armor[itemId]) return allItems.armor[itemId];
    if (allItems.consumables[itemId]) return allItems.consumables[itemId];

    return null;
  },

  resetEquipment: () => {
    set({
      equipped: {
        weapon: null,
        head: null,
        body: null,
        accessory: null
      }
    });
  },

  enhanceEquippedItem: (slot: EquipmentSlot) => {
    const { equipped } = get();
    const item = equipped[slot];

    if (!item) {
      return { success: false, cost: 0, result: 'fail' as EnhanceResult };
    }

    const currentLevel = item.enhanceLevel || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 10) {
      return { success: false, cost: 0, result: 'fail' as EnhanceResult };
    }

    const config = ENHANCE_CONFIGS[nextLevel - 1];
    const playerStore = usePlayerStore.getState();

    if (playerStore.gold < config.goldCost) {
      return { success: false, cost: 0, result: 'fail' as EnhanceResult };
    }

    // Deduct gold
    playerStore.spendGold(config.goldCost);

    const roll = Math.random() * 100;
    const success = roll < config.successRate;

    if (success) {
      const enhancedItem: EquipmentItem = {
        ...item,
        enhanceLevel: nextLevel,
      };

      set({
        equipped: {
          ...equipped,
          [slot]: enhancedItem,
        },
        enhanceResult: 'success',
        lastEnhancedItem: enhancedItem,
      });

      return { success: true, cost: config.goldCost, result: 'success' as EnhanceResult };
    } else {
      // Enhancement failed
      if (config.destroyOnFail) {
        // Item destroyed
        set({
          equipped: {
            ...equipped,
            [slot]: null,
          },
          enhanceResult: 'destroy',
          lastEnhancedItem: item,
        });
        return { success: false, cost: config.goldCost, result: 'destroy' as EnhanceResult };
      } else if (config.downgradeOnFail && currentLevel > 0) {
        // Item downgraded
        const downgradedItem: EquipmentItem = {
          ...item,
          enhanceLevel: currentLevel - 1,
        };

        set({
          equipped: {
            ...equipped,
            [slot]: downgradedItem,
          },
          enhanceResult: 'downgrade',
          lastEnhancedItem: downgradedItem,
        });

        return { success: false, cost: config.goldCost, result: 'downgrade' as EnhanceResult };
      } else {
        // Just failed, no penalty
        set({
          enhanceResult: 'fail',
          lastEnhancedItem: item,
        });
        return { success: false, cost: config.goldCost, result: 'fail' as EnhanceResult };
      }
    }
  },

  clearEnhanceResult: () => {
    set({ enhanceResult: 'none', lastEnhancedItem: null });
  },

  addBuff: (buff: ActiveBuff) => {
    const { activeBuffs } = get();
    // Remove existing buff of same type and replace with new one
    const filteredBuffs = activeBuffs.filter(b => b.type !== buff.type);
    set({ activeBuffs: [...filteredBuffs, buff] });
  },

  updateBuffs: () => {
    const { activeBuffs } = get();
    const now = Date.now();
    const validBuffs = activeBuffs.filter(buff => buff.endTime > now);
    if (validBuffs.length !== activeBuffs.length) {
      set({ activeBuffs: validBuffs });
    }
  },

  getBuffBonuses: () => {
    const { activeBuffs } = get();
    const now = Date.now();
    let attackBonus = 0;
    let defenseBonus = 0;

    activeBuffs.forEach(buff => {
      if (buff.endTime > now) {
        if (buff.type === 'attack') {
          attackBonus += buff.value;
        } else if (buff.type === 'defense') {
          defenseBonus += buff.value;
        }
      }
    });

    return { attackBonus, defenseBonus };
  },
}));

// Tier colors for UI
export const TIER_COLORS: Record<string, string> = {
  common: '#9d9d9d',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000'
};
