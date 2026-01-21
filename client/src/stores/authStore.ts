import { create } from 'zustand';
import { supabase, authApi, characterApi } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface CharacterData {
  id: string;
  user_id: string;
  name: string;
  job: string;
  level: number;
  exp: number;
  gold: number;
  hp: number;
  mp: number;
  max_hp: number;
  max_mp: number;
  attack: number;
  defense: number;
  x: number;
  y: number;
  map_id: string;
  // Stats
  str: number;
  dex: number;
  int: number;
  vit: number;
  luk: number;
  stat_points: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  // Auth state
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Character state
  characters: CharacterData[];
  selectedCharacter: CharacterData | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;

  // Character actions
  loadCharacters: () => Promise<void>;
  createCharacter: (name: string, job: string) => Promise<boolean>;
  selectCharacter: (characterId: string) => Promise<boolean>;
  deleteCharacter: (characterId: string) => Promise<boolean>;
  saveCharacterProgress: (data: Partial<CharacterData>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  characters: [],
  selectedCharacter: null,

  initialize: async () => {
    set({ isLoading: true });

    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        set({
          user: session.user,
          session,
          isLoading: false
        });

        // Load characters
        await get().loadCharacters();
      } else {
        set({ isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({
          user: session?.user || null,
          session
        });

        if (event === 'SIGNED_IN') {
          await get().loadCharacters();
        } else if (event === 'SIGNED_OUT') {
          set({
            characters: [],
            selectedCharacter: null
          });
        }
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await authApi.signUp(email, password);

      if (error) throw error;

      if (data.user) {
        set({
          user: data.user,
          session: data.session,
          isLoading: false
        });
        return true;
      }

      // Email confirmation required
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
      return false;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await authApi.signIn(email, password);

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isLoading: false
      });

      await get().loadCharacters();
      return true;
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await authApi.signOut();
      set({
        user: null,
        session: null,
        characters: [],
        selectedCharacter: null,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),

  loadCharacters: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const characters = await characterApi.getCharacters(user.id);
      set({ characters: characters || [] });
    } catch (error: any) {
      console.error('Failed to load characters:', error);
      set({ characters: [] });
    }
  },

  createCharacter: async (name: string, job: string) => {
    const { user } = get();
    if (!user) return false;

    set({ isLoading: true, error: null });

    try {
      // Default stats based on job
      const jobStats: Record<string, Partial<CharacterData>> = {
        Base: { max_hp: 100, max_mp: 50, attack: 10, defense: 5 },
        Warrior: { max_hp: 150, max_mp: 30, attack: 15, defense: 10 },
        Archer: { max_hp: 100, max_mp: 50, attack: 12, defense: 6 },
        Mage: { max_hp: 80, max_mp: 100, attack: 8, defense: 4 },
        Thief: { max_hp: 90, max_mp: 60, attack: 12, defense: 5 }
      };

      const stats = jobStats[job] || jobStats.Base;

      const character = await characterApi.createCharacter(user.id, {
        name,
        job: job || 'Base',
        level: 1,
        exp: 0,
        gold: 100,
        hp: stats.max_hp!,
        mp: stats.max_mp!,
        max_hp: stats.max_hp!,
        max_mp: stats.max_mp!,
        attack: stats.attack!,
        defense: stats.defense!,
        x: 400,
        y: 300,
        map_id: 'starter_village',
        str: 5,
        dex: 5,
        int: 5,
        vit: 5,
        luk: 5,
        stat_points: 0,
      });

      if (character) {
        set((state) => ({
          characters: [...state.characters, character],
          isLoading: false
        }));
        return true;
      }

      throw new Error('Failed to create character');
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
      return false;
    }
  },

  selectCharacter: async (characterId: string) => {
    const { characters } = get();
    const character = characters.find(c => c.id === characterId);

    if (!character) return false;

    set({ selectedCharacter: character });
    return true;
  },

  deleteCharacter: async (characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      const success = await characterApi.deleteCharacter(characterId);

      if (success) {
        set((state) => ({
          characters: state.characters.filter(c => c.id !== characterId),
          selectedCharacter: state.selectedCharacter?.id === characterId
            ? null
            : state.selectedCharacter,
          isLoading: false
        }));
        return true;
      }

      throw new Error('Failed to delete character');
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
      return false;
    }
  },

  saveCharacterProgress: async (data: Partial<CharacterData>) => {
    const { selectedCharacter } = get();
    if (!selectedCharacter) return;

    try {
      await characterApi.updateCharacter(selectedCharacter.id, {
        ...data,
        updated_at: new Date().toISOString()
      });

      set((state) => ({
        selectedCharacter: state.selectedCharacter
          ? { ...state.selectedCharacter, ...data }
          : null
      }));
    } catch (error) {
      console.error('Failed to save character progress:', error);
    }
  }
}));
