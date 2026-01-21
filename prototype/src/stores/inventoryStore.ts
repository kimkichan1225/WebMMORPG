import { create } from 'zustand';

export type ResourceTier = 'common' | 'uncommon' | 'rare';
export type ToolType = 'axe' | 'pickaxe' | 'sickle';

export interface ResourceData {
  id: string;
  name: string;
  nameKo: string;
  tool: ToolType;
  tier: ResourceTier;
  exp: number;
  color: string;
}

export const RESOURCES: Record<string, ResourceData> = {
  // Axe (Wood)
  wood: { id: 'wood', name: 'Wood', nameKo: '목재', tool: 'axe', tier: 'common', exp: 5, color: '#8B4513' },
  hardwood: { id: 'hardwood', name: 'Hardwood', nameKo: '단단한 목재', tool: 'axe', tier: 'uncommon', exp: 10, color: '#654321' },

  // Pickaxe (Ore)
  stone: { id: 'stone', name: 'Stone', nameKo: '돌', tool: 'pickaxe', tier: 'common', exp: 5, color: '#808080' },
  iron: { id: 'iron', name: 'Iron', nameKo: '철', tool: 'pickaxe', tier: 'uncommon', exp: 10, color: '#A0A0A0' },
  gold: { id: 'gold', name: 'Gold', nameKo: '금', tool: 'pickaxe', tier: 'rare', exp: 20, color: '#FFD700' },

  // Sickle (Herbs)
  herb: { id: 'herb', name: 'Herb', nameKo: '약초', tool: 'sickle', tier: 'common', exp: 5, color: '#228B22' },
  manaflower: { id: 'manaflower', name: 'Mana Flower', nameKo: '마나풀', tool: 'sickle', tier: 'uncommon', exp: 10, color: '#4169E1' },
  rareherb: { id: 'rareherb', name: 'Rare Herb', nameKo: '희귀약초', tool: 'sickle', tier: 'rare', exp: 20, color: '#9400D3' },
};

export interface InventoryItem {
  resourceId: string;
  quantity: number;
}

interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;

  // Actions
  addItem: (resourceId: string, quantity?: number) => boolean;
  removeItem: (resourceId: string, quantity?: number) => boolean;
  getItemCount: (resourceId: string) => number;
  hasItem: (resourceId: string, quantity?: number) => boolean;
  dropRandomItems: (tier: ResourceTier, dropRate: number) => InventoryItem[];
  clearInventory: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  maxSlots: 20,

  addItem: (resourceId, quantity = 1) => {
    const state = get();
    const existingItem = state.items.find((i) => i.resourceId === resourceId);

    if (existingItem) {
      set({
        items: state.items.map((i) =>
          i.resourceId === resourceId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      });
      return true;
    }

    if (state.items.length >= state.maxSlots) {
      return false; // Inventory full
    }

    set({
      items: [...state.items, { resourceId, quantity }],
    });
    return true;
  },

  removeItem: (resourceId, quantity = 1) => {
    const state = get();
    const existingItem = state.items.find((i) => i.resourceId === resourceId);

    if (!existingItem || existingItem.quantity < quantity) {
      return false;
    }

    if (existingItem.quantity === quantity) {
      set({
        items: state.items.filter((i) => i.resourceId !== resourceId),
      });
    } else {
      set({
        items: state.items.map((i) =>
          i.resourceId === resourceId
            ? { ...i, quantity: i.quantity - quantity }
            : i
        ),
      });
    }

    return true;
  },

  getItemCount: (resourceId) => {
    const item = get().items.find((i) => i.resourceId === resourceId);
    return item ? item.quantity : 0;
  },

  hasItem: (resourceId, quantity = 1) => {
    return get().getItemCount(resourceId) >= quantity;
  },

  dropRandomItems: (tier, dropRate) => {
    const state = get();
    const droppedItems: InventoryItem[] = [];

    const tierItems = state.items.filter((item) => {
      const resource = RESOURCES[item.resourceId];
      return resource && resource.tier === tier;
    });

    tierItems.forEach((item) => {
      const dropCount = Math.floor(item.quantity * dropRate);
      if (dropCount > 0) {
        droppedItems.push({ resourceId: item.resourceId, quantity: dropCount });
        get().removeItem(item.resourceId, dropCount);
      }
    });

    return droppedItems;
  },

  clearInventory: () => set({ items: [] }),
}));
