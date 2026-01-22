import { create } from 'zustand';
import { socketService } from '../services/socket';
import type { DroppedItem } from '@shared/types';

// Item drop duration (30 seconds)
const ITEM_LIFETIME_MS = 30 * 1000;
// Owner-only pickup duration (10 seconds)
const OWNER_ONLY_DURATION_MS = 10 * 1000;

interface DroppedItemState {
  // Items on the ground
  items: DroppedItem[];

  // Actions
  initializeListeners: () => void;
  addItem: (item: DroppedItem) => void;
  removeItem: (itemId: string) => void;
  pickupItem: (itemId: string) => void;
  dropItem: (item: Omit<DroppedItem, 'id' | 'dropTime' | 'expiresAt'>) => void;
  cleanupExpired: () => void;
}

// Generate unique ID
function generateItemId(): string {
  return `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useDroppedItemStore = create<DroppedItemState>((set, get) => ({
  items: [],

  initializeListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Item dropped by another player or monster
    socket.on('item:dropped', (item: DroppedItem) => {
      set((state) => ({
        items: [...state.items, item],
      }));

      // Schedule cleanup
      setTimeout(() => {
        get().removeItem(item.id);
      }, item.expiresAt - Date.now());
    });

    // Item picked up by another player
    socket.on('item:picked_up', ({ itemId }) => {
      get().removeItem(itemId);
    });

    // Item expired
    socket.on('item:expired', (itemId: string) => {
      get().removeItem(itemId);
    });

    // Start periodic cleanup
    setInterval(() => {
      get().cleanupExpired();
    }, 5000);
  },

  addItem: (item: DroppedItem) => {
    set((state) => ({
      items: [...state.items, item],
    }));

    // Schedule removal when expired
    const timeUntilExpiry = item.expiresAt - Date.now();
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        get().removeItem(item.id);
      }, timeUntilExpiry);
    }
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  pickupItem: (itemId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('item:pickup', { itemId });
    }
    // Optimistically remove the item
    get().removeItem(itemId);
  },

  dropItem: (itemData) => {
    const now = Date.now();
    const item: DroppedItem = {
      ...itemData,
      id: generateItemId(),
      dropTime: now,
      expiresAt: now + ITEM_LIFETIME_MS,
    };

    // Add locally
    get().addItem(item);

    // Broadcast to other players
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('item:dropped' as any, item);
    }
  },

  cleanupExpired: () => {
    const now = Date.now();
    set((state) => ({
      items: state.items.filter((item) => item.expiresAt > now),
    }));
  },
}));

// Helper function to check if current player can pick up an item
export function canPickup(item: DroppedItem, currentPlayerId: string): boolean {
  const now = Date.now();

  // If no owner, anyone can pick up
  if (!item.ownerId) return true;

  // If owner, always can pick up
  if (item.ownerId === currentPlayerId) return true;

  // If owner-only period has passed, anyone can pick up
  const ownerOnlyExpires = item.dropTime + OWNER_ONLY_DURATION_MS;
  return now >= ownerOnlyExpires;
}

// Rarity colors for display
export const RARITY_COLORS: Record<string, string> = {
  common: '#aaa',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};
