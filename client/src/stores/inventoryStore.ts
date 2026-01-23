import { create } from 'zustand';
import type { ResourceTier, ToolType } from '@shared/types';
import { inventoryApi } from '../services/supabase';

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

export type ItemType = 'resource' | 'equipment' | 'consumable';

export interface InventoryItem {
  id: string;           // item id (e.g., 'wood', 'iron_sword')
  name: string;
  type: ItemType;
  quantity: number;
}

interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;
  gold: number;
  _characterId: string | null;
  _saveTimeout: ReturnType<typeof setTimeout> | null;

  // Actions
  addItem: (item: InventoryItem | string, quantity?: number) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  getItemCount: (itemId: string) => number;
  hasItem: (itemId: string, quantity?: number) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;
  dropRandomItems: (tier: ResourceTier, dropRate: number) => InventoryItem[];
  clearInventory: () => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;

  // DB sync
  loadFromDb: (characterId: string) => Promise<void>;
  saveToDb: () => Promise<void>;
  _scheduleSave: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  maxSlots: 30,
  gold: 100,
  _characterId: null,
  _saveTimeout: null,

  addItem: (itemOrId, quantity = 1) => {
    const state = get();

    // Handle string (resource id) or InventoryItem object
    let itemId: string;
    let itemName: string;
    let itemType: ItemType;
    let itemQuantity: number;

    if (typeof itemOrId === 'string') {
      // Legacy support - string resource id
      itemId = itemOrId;
      const resource = RESOURCES[itemId];
      itemName = resource?.name || itemId;
      itemType = 'resource';
      itemQuantity = quantity;
    } else {
      // InventoryItem object
      itemId = itemOrId.id;
      itemName = itemOrId.name;
      itemType = itemOrId.type;
      itemQuantity = itemOrId.quantity || quantity;
    }

    const existingItem = state.items.find((i) => i.id === itemId);

    if (existingItem) {
      set({
        items: state.items.map((i) =>
          i.id === itemId
            ? { ...i, quantity: i.quantity + itemQuantity }
            : i
        ),
      });
      get()._scheduleSave();
      return true;
    }

    if (state.items.length >= state.maxSlots) {
      return false; // Inventory full
    }

    set({
      items: [...state.items, {
        id: itemId,
        name: itemName,
        type: itemType,
        quantity: itemQuantity
      }],
    });
    get()._scheduleSave();
    return true;
  },

  removeItem: (itemId, quantity = 1) => {
    const state = get();
    const existingItem = state.items.find((i) => i.id === itemId);

    if (!existingItem || existingItem.quantity < quantity) {
      return false;
    }

    if (existingItem.quantity === quantity) {
      set({
        items: state.items.filter((i) => i.id !== itemId),
      });
    } else {
      set({
        items: state.items.map((i) =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - quantity }
            : i
        ),
      });
    }

    get()._scheduleSave();
    return true;
  },

  getItemCount: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  },

  hasItem: (itemId, quantity = 1) => {
    return get().getItemCount(itemId) >= quantity;
  },

  getItem: (itemId) => {
    return get().items.find((i) => i.id === itemId);
  },

  dropRandomItems: (tier, dropRate) => {
    const state = get();
    const droppedItems: InventoryItem[] = [];

    const tierItems = state.items.filter((item) => {
      const resource = RESOURCES[item.id];
      return resource && resource.tier === tier;
    });

    tierItems.forEach((item) => {
      const dropCount = Math.floor(item.quantity * dropRate);
      if (dropCount > 0) {
        droppedItems.push({
          id: item.id,
          name: item.name,
          type: item.type,
          quantity: dropCount
        });
        get().removeItem(item.id, dropCount);
      }
    });

    return droppedItems;
  },

  clearInventory: () => set({ items: [], gold: 100 }),

  addGold: (amount) => {
    set((state) => ({ gold: state.gold + amount }));
  },

  removeGold: (amount) => {
    const state = get();
    if (state.gold < amount) {
      return false;
    }
    set({ gold: state.gold - amount });
    return true;
  },

  // DB sync functions
  loadFromDb: async (characterId: string) => {
    try {
      const dbItems = await inventoryApi.getInventory(characterId);
      const items: InventoryItem[] = dbItems.map((item: any) => ({
        id: item.item_id,
        name: item.item_id, // Name will be resolved by RESOURCES or item data
        type: item.item_type as ItemType,
        quantity: item.quantity,
      }));
      set({ items, _characterId: characterId });
      console.log('Inventory loaded from DB:', items.length, 'items');
    } catch (error) {
      console.error('Failed to load inventory from DB:', error);
    }
  },

  saveToDb: async () => {
    const { items, _characterId } = get();
    if (!_characterId) return;

    try {
      // Get current DB inventory
      const dbItems = await inventoryApi.getInventory(_characterId);
      const dbItemMap = new Map(dbItems.map((i: any) => [i.item_id, i]));

      // Sync each local item
      for (const item of items) {
        const dbItem = dbItemMap.get(item.id);
        if (dbItem) {
          // Update quantity if changed
          if (dbItem.quantity !== item.quantity) {
            await inventoryApi.updateItem(dbItem.id, { quantity: item.quantity });
          }
          dbItemMap.delete(item.id);
        } else {
          // Add new item
          await inventoryApi.addItem({
            character_id: _characterId,
            item_id: item.id,
            item_type: item.type,
            quantity: item.quantity,
          });
        }
      }

      // Remove items that no longer exist locally
      for (const [, dbItem] of dbItemMap) {
        await inventoryApi.removeItem(dbItem.id);
      }

      console.log('Inventory saved to DB');
    } catch (error) {
      console.error('Failed to save inventory to DB:', error);
    }
  },

  _scheduleSave: () => {
    const { _saveTimeout } = get();
    if (_saveTimeout) {
      clearTimeout(_saveTimeout);
    }
    // Debounce save by 2 seconds
    const timeout = setTimeout(() => {
      get().saveToDb();
    }, 2000);
    set({ _saveTimeout: timeout });
  },
}));

// Re-export types
export type { ResourceTier, ToolType };
