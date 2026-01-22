import { create } from 'zustand';
import { socketService } from '../services/socket';
import type { Party, PartyMember, PartyInvite } from '@shared/types';

interface PartyState {
  // Party state
  currentParty: Party | null;
  pendingInvites: PartyInvite[];
  isLeader: boolean;

  // Actions
  initializePartyListeners: () => void;
  createParty: () => void;
  invitePlayer: (targetId: string) => void;
  acceptInvite: (partyId: string) => void;
  declineInvite: (partyId: string) => void;
  leaveParty: () => void;
  kickMember: (targetId: string) => void;
  transferLeader: (targetId: string) => void;

  // Internal state updates
  setParty: (party: Party | null) => void;
  addInvite: (invite: PartyInvite) => void;
  removeInvite: (partyId: string) => void;
  updateMember: (data: { id: string; hp: number; maxHp: number; level?: number }) => void;
  addMember: (member: PartyMember) => void;
  removeMember: (memberId: string) => void;
  setLeader: (leaderId: string) => void;
}

export const usePartyStore = create<PartyState>((set, get) => ({
  currentParty: null,
  pendingInvites: [],
  isLeader: false,

  initializePartyListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Party created/joined
    socket.on('party:created', (party) => {
      set({
        currentParty: party,
        isLeader: party.leaderId === socket.id,
      });
    });

    // Party disbanded
    socket.on('party:disbanded', () => {
      set({
        currentParty: null,
        isLeader: false,
      });
    });

    // Invite received
    socket.on('party:invite_received', (invite) => {
      set((state) => ({
        pendingInvites: [...state.pendingInvites, invite],
      }));
    });

    // Member joined
    socket.on('party:member_joined', (member) => {
      set((state) => {
        if (!state.currentParty) return state;
        return {
          currentParty: {
            ...state.currentParty,
            members: [...state.currentParty.members, member],
          },
        };
      });
    });

    // Member left
    socket.on('party:member_left', (memberId) => {
      set((state) => {
        if (!state.currentParty) return state;
        return {
          currentParty: {
            ...state.currentParty,
            members: state.currentParty.members.filter((m) => m.id !== memberId),
          },
        };
      });
    });

    // Member updated (HP/MaxHP sync)
    socket.on('party:member_updated', (data) => {
      set((state) => {
        if (!state.currentParty) return state;
        return {
          currentParty: {
            ...state.currentParty,
            members: state.currentParty.members.map((m) =>
              m.id === data.id
                ? { ...m, hp: data.hp, maxHp: data.maxHp, level: data.level ?? m.level }
                : m
            ),
          },
        };
      });
    });

    // Leader changed
    socket.on('party:leader_changed', (newLeaderId) => {
      set((state) => {
        if (!state.currentParty) return state;
        return {
          currentParty: {
            ...state.currentParty,
            leaderId: newLeaderId,
          },
          isLeader: newLeaderId === socket.id,
        };
      });
    });
  },

  createParty: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('party:create');
    }
  },

  invitePlayer: (targetId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('party:invite', { targetId });
    }
  },

  acceptInvite: (partyId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('party:invite_accept', { partyId });
      // Remove from pending invites
      set((state) => ({
        pendingInvites: state.pendingInvites.filter((i) => i.partyId !== partyId),
      }));
    }
  },

  declineInvite: (partyId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('party:invite_decline', { partyId });
      // Remove from pending invites
      set((state) => ({
        pendingInvites: state.pendingInvites.filter((i) => i.partyId !== partyId),
      }));
    }
  },

  leaveParty: () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('party:leave');
    }
  },

  kickMember: (targetId: string) => {
    const socket = socketService.getSocket();
    if (socket && get().isLeader) {
      socket.emit('party:kick', { targetId });
    }
  },

  transferLeader: (targetId: string) => {
    const socket = socketService.getSocket();
    if (socket && get().isLeader) {
      socket.emit('party:transfer_leader', { targetId });
    }
  },

  setParty: (party) => {
    const socket = socketService.getSocket();
    set({
      currentParty: party,
      isLeader: party ? party.leaderId === socket?.id : false,
    });
  },

  addInvite: (invite) => {
    set((state) => ({
      pendingInvites: [...state.pendingInvites, invite],
    }));
  },

  removeInvite: (partyId) => {
    set((state) => ({
      pendingInvites: state.pendingInvites.filter((i) => i.partyId !== partyId),
    }));
  },

  updateMember: (data) => {
    set((state) => {
      if (!state.currentParty) return state;
      return {
        currentParty: {
          ...state.currentParty,
          members: state.currentParty.members.map((m) =>
            m.id === data.id
              ? { ...m, hp: data.hp, maxHp: data.maxHp, level: data.level ?? m.level }
              : m
          ),
        },
      };
    });
  },

  addMember: (member) => {
    set((state) => {
      if (!state.currentParty) return state;
      return {
        currentParty: {
          ...state.currentParty,
          members: [...state.currentParty.members, member],
        },
      };
    });
  },

  removeMember: (memberId) => {
    set((state) => {
      if (!state.currentParty) return state;
      return {
        currentParty: {
          ...state.currentParty,
          members: state.currentParty.members.filter((m) => m.id !== memberId),
        },
      };
    });
  },

  setLeader: (leaderId) => {
    const socket = socketService.getSocket();
    set((state) => {
      if (!state.currentParty) return state;
      return {
        currentParty: {
          ...state.currentParty,
          leaderId,
        },
        isLeader: leaderId === socket?.id,
      };
    });
  },
}));
