import { create } from 'zustand';
import { socketService } from '../services/socket';
import { guildApi } from '../services/supabase';
import type { Guild, GuildMember, GuildInvite, GuildRank } from '@shared/types';

interface GuildState {
  // Guild state
  currentGuild: Guild | null;
  pendingInvites: GuildInvite[];
  isLoading: boolean;
  error: string | null;

  // Computed
  isLeader: boolean;
  isOfficer: boolean;
  myRank: GuildRank | null;

  // Actions
  initializeGuildListeners: () => void;
  loadGuildData: (characterId: string) => Promise<void>;
  createGuild: (characterId: string, name: string, description?: string) => Promise<void>;
  invitePlayer: (targetCharacterId: string) => void;
  acceptInvite: (guildId: string, characterId: string) => Promise<void>;
  declineInvite: (guildId: string) => void;
  leaveGuild: (characterId: string) => Promise<void>;
  kickMember: (targetCharacterId: string) => Promise<void>;
  promoteMember: (targetCharacterId: string, rank: GuildRank) => Promise<void>;
  disbandGuild: () => Promise<void>;

  // Internal state updates
  setGuild: (guild: Guild | null) => void;
  addInvite: (invite: GuildInvite) => void;
  removeInvite: (guildId: string) => void;
  updateMemberOnlineStatus: (memberId: string, isOnline: boolean) => void;
  removeMember: (memberId: string) => void;
  addMember: (member: GuildMember) => void;
  updateMemberRank: (memberId: string, rank: GuildRank) => void;
  clearGuild: () => void;
}

export const useGuildStore = create<GuildState>((set, get) => ({
  currentGuild: null,
  pendingInvites: [],
  isLoading: false,
  error: null,
  isLeader: false,
  isOfficer: false,
  myRank: null,

  initializeGuildListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Guild data received
    socket.on('guild:data', (guild) => {
      const myId = socket.id;
      const myMember = guild.members.find(m => m.characterId === myId);
      set({
        currentGuild: guild,
        isLeader: guild.leaderId === myId,
        isOfficer: myMember?.rank === 'officer' || myMember?.rank === 'leader',
        myRank: myMember?.rank || null,
      });
    });

    // Guild invite received
    socket.on('guild:invite_received', (invite) => {
      set((state) => ({
        pendingInvites: [...state.pendingInvites, invite],
      }));
    });

    // Member joined
    socket.on('guild:member_joined', (member) => {
      set((state) => {
        if (!state.currentGuild) return state;
        return {
          currentGuild: {
            ...state.currentGuild,
            members: [...state.currentGuild.members, member],
          },
        };
      });
    });

    // Member left
    socket.on('guild:member_left', (memberId) => {
      set((state) => {
        if (!state.currentGuild) return state;
        return {
          currentGuild: {
            ...state.currentGuild,
            members: state.currentGuild.members.filter((m) => m.characterId !== memberId),
          },
        };
      });
    });

    // Member online
    socket.on('guild:member_online', (memberId) => {
      get().updateMemberOnlineStatus(memberId, true);
    });

    // Member offline
    socket.on('guild:member_offline', (memberId) => {
      get().updateMemberOnlineStatus(memberId, false);
    });

    // Rank changed
    socket.on('guild:rank_changed', (data) => {
      get().updateMemberRank(data.memberId, data.newRank);
    });

    // Guild disbanded
    socket.on('guild:disbanded', () => {
      set({
        currentGuild: null,
        isLeader: false,
        isOfficer: false,
        myRank: null,
      });
    });
  },

  loadGuildData: async (characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      const membership = await guildApi.getCharacterGuild(characterId);

      if (membership && membership.guilds) {
        const guildData = membership.guilds;
        const members = await guildApi.getGuildMembers(guildData.id);

        // Transform members data
        const guildMembers: GuildMember[] = members.map((m: any) => ({
          characterId: m.character_id,
          name: m.characters?.name || 'Unknown',
          job: m.characters?.job || 'Base',
          level: m.characters?.level || 1,
          rank: m.rank,
          isOnline: false, // Will be updated by socket events
        }));

        const guild: Guild = {
          id: guildData.id,
          name: guildData.name,
          leaderId: guildData.leader_id,
          description: guildData.description || '',
          members: guildMembers,
        };

        const socket = socketService.getSocket();
        const myMember = guildMembers.find(m => m.characterId === characterId);

        set({
          currentGuild: guild,
          isLeader: guildData.leader_id === characterId,
          isOfficer: myMember?.rank === 'officer' || myMember?.rank === 'leader',
          myRank: myMember?.rank || null,
          isLoading: false,
        });

        // Join guild socket room
        if (socket) {
          socket.emit('guild:invite_accept', { guildId: guild.id });
        }
      } else {
        set({ currentGuild: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load guild data:', error);
      set({ error: 'Failed to load guild data', isLoading: false });
    }
  },

  createGuild: async (characterId: string, name: string, description?: string) => {
    set({ isLoading: true, error: null });

    try {
      const guild = await guildApi.createGuild(characterId, name, description);

      const socket = socketService.getSocket();
      const playerName = socket ? 'You' : 'Unknown';

      const newGuild: Guild = {
        id: guild.id,
        name: guild.name,
        leaderId: characterId,
        description: guild.description || '',
        members: [
          {
            characterId,
            name: playerName,
            job: 'Base',
            level: 1,
            rank: 'leader',
            isOnline: true,
          },
        ],
      };

      set({
        currentGuild: newGuild,
        isLeader: true,
        isOfficer: true,
        myRank: 'leader',
        isLoading: false,
      });

      // Join guild socket room
      if (socket) {
        socket.emit('guild:invite_accept', { guildId: guild.id });
      }
    } catch (error: any) {
      console.error('Failed to create guild:', error);
      set({ error: error.message || 'Failed to create guild', isLoading: false });
    }
  },

  invitePlayer: (targetCharacterId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('guild:invite', { targetCharacterId });
    }
  },

  acceptInvite: async (guildId: string, characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      await guildApi.joinGuild(guildId, characterId);

      // Remove from pending invites
      set((state) => ({
        pendingInvites: state.pendingInvites.filter((i) => i.guildId !== guildId),
      }));

      // Load guild data
      await get().loadGuildData(characterId);
    } catch (error: any) {
      console.error('Failed to accept guild invite:', error);
      set({ error: error.message || 'Failed to join guild', isLoading: false });
    }
  },

  declineInvite: (guildId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('guild:invite_decline', { guildId });
    }
    set((state) => ({
      pendingInvites: state.pendingInvites.filter((i) => i.guildId !== guildId),
    }));
  },

  leaveGuild: async (characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      await guildApi.leaveGuild(characterId);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('guild:leave');
      }

      set({
        currentGuild: null,
        isLeader: false,
        isOfficer: false,
        myRank: null,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to leave guild:', error);
      set({ error: error.message || 'Failed to leave guild', isLoading: false });
    }
  },

  kickMember: async (targetCharacterId: string) => {
    const { currentGuild } = get();
    if (!currentGuild) return;

    try {
      await guildApi.kickMember(currentGuild.id, targetCharacterId);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('guild:kick', { targetId: targetCharacterId });
      }

      get().removeMember(targetCharacterId);
    } catch (error: any) {
      console.error('Failed to kick member:', error);
      set({ error: error.message || 'Failed to kick member' });
    }
  },

  promoteMember: async (targetCharacterId: string, rank: GuildRank) => {
    const { currentGuild } = get();
    if (!currentGuild) return;

    try {
      await guildApi.updateMemberRank(currentGuild.id, targetCharacterId, rank);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('guild:promote', { targetId: targetCharacterId, rank });
      }

      get().updateMemberRank(targetCharacterId, rank);
    } catch (error: any) {
      console.error('Failed to promote member:', error);
      set({ error: error.message || 'Failed to promote member' });
    }
  },

  disbandGuild: async () => {
    const { currentGuild } = get();
    if (!currentGuild) return;

    set({ isLoading: true, error: null });

    try {
      await guildApi.disbandGuild(currentGuild.id);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('guild:disband');
      }

      set({
        currentGuild: null,
        isLeader: false,
        isOfficer: false,
        myRank: null,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to disband guild:', error);
      set({ error: error.message || 'Failed to disband guild', isLoading: false });
    }
  },

  setGuild: (guild) => {
    const socket = socketService.getSocket();
    const myId = socket?.id;
    const myMember = guild?.members.find(m => m.characterId === myId);

    set({
      currentGuild: guild,
      isLeader: guild ? guild.leaderId === myId : false,
      isOfficer: myMember?.rank === 'officer' || myMember?.rank === 'leader',
      myRank: myMember?.rank || null,
    });
  },

  addInvite: (invite) => {
    set((state) => ({
      pendingInvites: [...state.pendingInvites, invite],
    }));
  },

  removeInvite: (guildId) => {
    set((state) => ({
      pendingInvites: state.pendingInvites.filter((i) => i.guildId !== guildId),
    }));
  },

  updateMemberOnlineStatus: (memberId, isOnline) => {
    set((state) => {
      if (!state.currentGuild) return state;
      return {
        currentGuild: {
          ...state.currentGuild,
          members: state.currentGuild.members.map((m) =>
            m.characterId === memberId ? { ...m, isOnline } : m
          ),
        },
      };
    });
  },

  removeMember: (memberId) => {
    set((state) => {
      if (!state.currentGuild) return state;
      return {
        currentGuild: {
          ...state.currentGuild,
          members: state.currentGuild.members.filter((m) => m.characterId !== memberId),
        },
      };
    });
  },

  addMember: (member) => {
    set((state) => {
      if (!state.currentGuild) return state;
      return {
        currentGuild: {
          ...state.currentGuild,
          members: [...state.currentGuild.members, member],
        },
      };
    });
  },

  updateMemberRank: (memberId, rank) => {
    set((state) => {
      if (!state.currentGuild) return state;

      const socket = socketService.getSocket();
      const isMe = memberId === socket?.id;

      return {
        currentGuild: {
          ...state.currentGuild,
          members: state.currentGuild.members.map((m) =>
            m.characterId === memberId ? { ...m, rank } : m
          ),
        },
        ...(isMe
          ? {
              myRank: rank,
              isLeader: rank === 'leader',
              isOfficer: rank === 'officer' || rank === 'leader',
            }
          : {}),
      };
    });
  },

  clearGuild: () => {
    set({
      currentGuild: null,
      pendingInvites: [],
      isLeader: false,
      isOfficer: false,
      myRank: null,
      error: null,
    });
  },
}));
