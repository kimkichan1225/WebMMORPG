import { create } from 'zustand';
import recipesData from '../data/recipes.json';
import { useInventoryStore, RESOURCES } from './inventoryStore';
import { usePlayerStore } from './playerStore';
import { useEquipmentStore } from './equipmentStore';

export interface Material {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  nameKo: string;
  category: 'alchemy' | 'smithing' | 'tailoring' | 'enchanting';
  result: {
    itemId: string;
    quantity: number;
  };
  materials: Material[];
  levelReq: number;
  craftTime: number;
}

interface CraftingState {
  // All recipes
  allRecipes: Record<string, Recipe>;

  // Currently crafting
  isCrafting: boolean;
  currentRecipe: string | null;
  craftingProgress: number;
  craftingEndTime: number | null;

  // Unlocked recipes (by level or quest)
  unlockedRecipes: string[];

  // Actions
  canCraft: (recipeId: string) => { canCraft: boolean; reason?: string };
  startCrafting: (recipeId: string) => boolean;
  cancelCrafting: () => void;
  updateCraftingProgress: () => boolean;
  getRecipesByCategory: (category: Recipe['category']) => Recipe[];
  getMaterialName: (materialId: string) => string;
  getMaterialCount: (materialId: string) => number;
  resetCrafting: () => void;
}

const CATEGORY_ORDER: Recipe['category'][] = ['alchemy', 'smithing', 'tailoring', 'enchanting'];

export const useCraftingStore = create<CraftingState>((set, get) => ({
  allRecipes: recipesData.recipes as Record<string, Recipe>,
  isCrafting: false,
  currentRecipe: null,
  craftingProgress: 0,
  craftingEndTime: null,
  unlockedRecipes: Object.keys(recipesData.recipes), // All unlocked by default

  canCraft: (recipeId: string) => {
    const { allRecipes, isCrafting } = get();
    const recipe = allRecipes[recipeId];

    if (!recipe) {
      return { canCraft: false, reason: 'Recipe not found' };
    }

    if (isCrafting) {
      return { canCraft: false, reason: 'Already crafting' };
    }

    // Check level
    const playerLevel = usePlayerStore.getState().level;
    if (playerLevel < recipe.levelReq) {
      return { canCraft: false, reason: `Level ${recipe.levelReq} required` };
    }

    // Check materials
    const inventoryStore = useInventoryStore.getState();
    for (const material of recipe.materials) {
      const count = get().getMaterialCount(material.itemId);
      if (count < material.quantity) {
        return {
          canCraft: false,
          reason: `Not enough ${get().getMaterialName(material.itemId)}`
        };
      }
    }

    return { canCraft: true };
  },

  startCrafting: (recipeId: string) => {
    const { allRecipes, canCraft } = get();
    const recipe = allRecipes[recipeId];

    const result = canCraft(recipeId);
    if (!result.canCraft) {
      console.log(`Cannot craft: ${result.reason}`);
      return false;
    }

    // Consume materials
    const inventoryStore = useInventoryStore.getState();
    for (const material of recipe.materials) {
      inventoryStore.removeItem(material.itemId, material.quantity);
    }

    const now = Date.now();
    set({
      isCrafting: true,
      currentRecipe: recipeId,
      craftingProgress: 0,
      craftingEndTime: now + recipe.craftTime
    });

    return true;
  },

  cancelCrafting: () => {
    const { allRecipes, currentRecipe } = get();

    // Refund materials
    if (currentRecipe) {
      const recipe = allRecipes[currentRecipe];
      if (recipe) {
        const inventoryStore = useInventoryStore.getState();
        for (const material of recipe.materials) {
          inventoryStore.addItem({
            id: material.itemId,
            name: get().getMaterialName(material.itemId),
            type: 'resource',
            quantity: material.quantity
          });
        }
      }
    }

    set({
      isCrafting: false,
      currentRecipe: null,
      craftingProgress: 0,
      craftingEndTime: null
    });
  },

  updateCraftingProgress: () => {
    const { allRecipes, currentRecipe, craftingEndTime, isCrafting } = get();

    if (!isCrafting || !currentRecipe || !craftingEndTime) {
      return false;
    }

    const recipe = allRecipes[currentRecipe];
    if (!recipe) {
      set({
        isCrafting: false,
        currentRecipe: null,
        craftingProgress: 0,
        craftingEndTime: null
      });
      return false;
    }

    const now = Date.now();
    const elapsed = now - (craftingEndTime - recipe.craftTime);
    const progress = Math.min(1, elapsed / recipe.craftTime);

    set({ craftingProgress: progress });

    // Crafting complete
    if (progress >= 1) {
      // Add result item to inventory
      const inventoryStore = useInventoryStore.getState();
      const equipmentStore = useEquipmentStore.getState();

      // Determine item type
      const resultItem = equipmentStore.getItemById(recipe.result.itemId);
      let itemType: 'resource' | 'equipment' | 'consumable' = 'resource';
      let itemName = recipe.result.itemId;

      if (resultItem) {
        itemName = resultItem.name;
        if ('effect' in resultItem) {
          itemType = 'consumable';
        } else {
          itemType = 'equipment';
        }
      }

      inventoryStore.addItem({
        id: recipe.result.itemId,
        name: itemName,
        type: itemType,
        quantity: recipe.result.quantity
      });

      set({
        isCrafting: false,
        currentRecipe: null,
        craftingProgress: 0,
        craftingEndTime: null
      });

      return true; // Crafting completed
    }

    return false; // Still crafting
  },

  getRecipesByCategory: (category: Recipe['category']) => {
    const { allRecipes, unlockedRecipes } = get();

    return Object.values(allRecipes)
      .filter(recipe => recipe.category === category && unlockedRecipes.includes(recipe.id))
      .sort((a, b) => a.levelReq - b.levelReq);
  },

  getMaterialName: (materialId: string) => {
    // Check resources
    const resource = RESOURCES[materialId];
    if (resource) {
      return resource.name;
    }

    // Check items
    const equipmentStore = useEquipmentStore.getState();
    const item = equipmentStore.getItemById(materialId);
    if (item) {
      return item.nameKo || item.name;
    }

    return materialId;
  },

  getMaterialCount: (materialId: string) => {
    const inventoryStore = useInventoryStore.getState();
    const item = inventoryStore.items.find(i => i.id === materialId);
    return item?.quantity || 0;
  },

  resetCrafting: () => {
    set({
      isCrafting: false,
      currentRecipe: null,
      craftingProgress: 0,
      craftingEndTime: null
    });
  }
}));

export const CATEGORY_LABELS: Record<Recipe['category'], string> = {
  alchemy: '연금술',
  smithing: '대장',
  tailoring: '재봉',
  enchanting: '마법부여'
};
