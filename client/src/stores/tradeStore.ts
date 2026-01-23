import { create } from 'zustand';
import { socketService } from '../services/socket';
import type { TradeSession, TradeRequest, TradeItem } from '@shared/types';

interface TradeState {
  // Current trade session
  currentTrade: TradeSession | null;
  // Pending trade requests (received from other players)
  pendingRequests: TradeRequest[];
  // Is trade window open
  isTradeOpen: boolean;
  // Listener initialization flag
  _listenersInitialized: boolean;

  // Actions
  initializeListeners: () => void;
  cleanupListeners: () => void;
  requestTrade: (targetId: string) => void;
  acceptRequest: (fromId: string) => void;
  declineRequest: (fromId: string) => void;
  updateOffer: (items: TradeItem[], gold: number) => void;
  confirmTrade: () => void;
  unconfirmTrade: () => void;
  cancelTrade: () => void;
  setTradeOpen: (open: boolean) => void;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  currentTrade: null,
  pendingRequests: [],
  isTradeOpen: false,
  _listenersInitialized: false,

  initializeListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Prevent duplicate listener registration
    if (get()._listenersInitialized) return;
    set({ _listenersInitialized: true });

    // Received trade request from another player
    socket.on('trade:request_received', (request: TradeRequest) => {
      set((state) => ({
        pendingRequests: [...state.pendingRequests, request],
      }));
    });

    // Trade session started
    socket.on('trade:started', (session: TradeSession) => {
      set({
        currentTrade: session,
        isTradeOpen: true,
        pendingRequests: get().pendingRequests.filter(
          (r) => r.fromId !== session.player1Id && r.fromId !== session.player2Id
        ),
      });
    });

    // Trade session updated (items/gold changed or confirmed)
    socket.on('trade:updated', (session: TradeSession) => {
      set({ currentTrade: session });
    });

    // Trade completed successfully
    socket.on('trade:completed', (session: TradeSession) => {
      set({
        currentTrade: null,
        isTradeOpen: false,
      });
      // Show success message (can be handled by UI)
      console.log('Trade completed successfully!');
    });

    // Trade cancelled
    socket.on('trade:cancelled', ({ sessionId, reason }) => {
      if (get().currentTrade?.id === sessionId) {
        set({
          currentTrade: null,
          isTradeOpen: false,
        });
        console.log('Trade cancelled:', reason);
      }
    });
  },

  cleanupListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.off('trade:request_received');
    socket.off('trade:started');
    socket.off('trade:updated');
    socket.off('trade:completed');
    socket.off('trade:cancelled');

    set({ _listenersInitialized: false });
  },

  requestTrade: (targetId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:request', { targetId });
    }
  },

  acceptRequest: (fromId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:accept', { fromId });
      // Remove from pending requests
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.fromId !== fromId),
      }));
    }
  },

  declineRequest: (fromId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:decline', { fromId });
      // Remove from pending requests
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.fromId !== fromId),
      }));
    }
  },

  updateOffer: (items: TradeItem[], gold: number) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:update_offer', { items, gold });
    }
  },

  confirmTrade: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:confirm');
    }
  },

  unconfirmTrade: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:unconfirm');
    }
  },

  cancelTrade: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('trade:cancel');
    }
    set({
      currentTrade: null,
      isTradeOpen: false,
    });
  },

  setTradeOpen: (open: boolean) => {
    set({ isTradeOpen: open });
  },
}));
