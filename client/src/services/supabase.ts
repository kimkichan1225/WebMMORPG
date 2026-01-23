import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptldpqswxddnklfazcsf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const authApi = {
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Character API
export const characterApi = {
  async getCharacters(userId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async getCharacter(characterId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) throw error;
    return data;
  },

  async createCharacter(userId: string, characterData: {
    name: string;
    job: string;
    level?: number;
    exp?: number;
    gold?: number;
    hp?: number;
    mp?: number;
    max_hp?: number;
    max_mp?: number;
    attack?: number;
    defense?: number;
    x?: number;
    y?: number;
    map_id?: string;
    str?: number;
    dex?: number;
    int?: number;
    vit?: number;
    luk?: number;
    stat_points?: number;
  }) {
    const { data, error } = await supabase
      .from('characters')
      .insert({
        user_id: userId,
        name: characterData.name,
        job: characterData.job || 'Base',
        level: characterData.level || 1,
        exp: characterData.exp || 0,
        gold: characterData.gold || 100,
        hp: characterData.hp || 100,
        mp: characterData.mp || 50,
        max_hp: characterData.max_hp || 100,
        max_mp: characterData.max_mp || 50,
        attack: characterData.attack || 10,
        defense: characterData.defense || 5,
        x: characterData.x || 400,
        y: characterData.y || 300,
        map_id: characterData.map_id || 'starter_village',
        str: characterData.str || 5,
        dex: characterData.dex || 5,
        int: characterData.int || 5,
        vit: characterData.vit || 5,
        luk: characterData.luk || 5,
        stat_points: characterData.stat_points || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCharacter(characterId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('characters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', characterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCharacter(characterId: string): Promise<boolean> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);

    if (error) throw error;
    return true;
  },
};

// Inventory API
export const inventoryApi = {
  async getInventory(characterId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data || [];
  },

  async addItem(item: {
    character_id: string;
    item_type: string;
    item_id: string;
    quantity: number;
    slot?: number;
  }) {
    // Check if item exists
    const { data: existing } = await supabase
      .from('inventory')
      .select('*')
      .eq('character_id', item.character_id)
      .eq('item_id', item.item_id)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity: existing.quantity + item.quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Insert new
    const { data, error } = await supabase
      .from('inventory')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(itemId: string, updates: { quantity?: number; slot?: number }) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItem(itemId: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },
};

// Equipment API
export const equipmentApi = {
  async getEquipment(characterId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data || [];
  },

  async equipItem(characterId: string, slot: string, itemId: string) {
    // Remove existing
    await supabase
      .from('equipment')
      .delete()
      .eq('character_id', characterId)
      .eq('slot', slot);

    // Add new
    const { data, error } = await supabase
      .from('equipment')
      .insert({ character_id: characterId, slot, item_id: itemId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unequipItem(characterId: string, slot: string) {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('character_id', characterId)
      .eq('slot', slot);

    if (error) throw error;
  },
};

// Quest API
export const questApi = {
  async getQuests(characterId: string) {
    const { data, error } = await supabase
      .from('character_quests')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data || [];
  },

  async startQuest(characterId: string, questId: string) {
    const { data, error } = await supabase
      .from('character_quests')
      .insert({
        character_id: characterId,
        quest_id: questId,
        status: 'active',
        progress: {},
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(questRecordId: string, progress: Record<string, number>) {
    const { data, error } = await supabase
      .from('character_quests')
      .update({ progress })
      .eq('id', questRecordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeQuest(questRecordId: string) {
    const { data, error } = await supabase
      .from('character_quests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', questRecordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Guild API
export const guildApi = {
  async getGuild(guildId: string) {
    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .eq('id', guildId)
      .single();

    if (error) throw error;
    return data;
  },

  async getGuildByName(name: string) {
    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  async getGuildMembers(guildId: string) {
    // First get all member records
    const { data: memberData, error: memberError } = await supabase
      .from('guild_members')
      .select('*')
      .eq('guild_id', guildId);

    if (memberError) throw memberError;
    if (!memberData || memberData.length === 0) return [];

    // Get character info for each member
    const characterIds = memberData.map(m => m.character_id);
    const { data: charactersData, error: charactersError } = await supabase
      .from('characters')
      .select('id, name, job, level')
      .in('id', characterIds);

    if (charactersError) throw charactersError;

    // Merge data
    const charactersMap = new Map(charactersData?.map(c => [c.id, c]) || []);
    return memberData.map(m => ({
      ...m,
      characters: charactersMap.get(m.character_id) || null,
    }));
  },

  async getCharacterGuild(characterId: string) {
    // First check if character is in a guild
    const { data: memberData, error: memberError } = await supabase
      .from('guild_members')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!memberData) return null;

    // Then fetch guild data
    const { data: guildData, error: guildError } = await supabase
      .from('guilds')
      .select('*')
      .eq('id', memberData.guild_id)
      .single();

    if (guildError) throw guildError;

    return {
      ...memberData,
      guilds: guildData,
    };
  },

  async createGuild(leaderId: string, name: string, description?: string) {
    // Check if name is already taken
    const existing = await this.getGuildByName(name);
    if (existing) {
      throw new Error('Guild name already exists');
    }

    // Create guild
    const { data: guild, error: guildError } = await supabase
      .from('guilds')
      .insert({
        name,
        leader_id: leaderId,
        description: description || '',
      })
      .select()
      .single();

    if (guildError) throw guildError;

    // Add leader as member
    const { error: memberError } = await supabase
      .from('guild_members')
      .insert({
        guild_id: guild.id,
        character_id: leaderId,
        rank: 'leader',
      });

    if (memberError) throw memberError;

    return guild;
  },

  async joinGuild(guildId: string, characterId: string) {
    const { data, error } = await supabase
      .from('guild_members')
      .insert({
        guild_id: guildId,
        character_id: characterId,
        rank: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async leaveGuild(characterId: string) {
    // Check if user is leader
    const membership = await this.getCharacterGuild(characterId);
    if (membership && membership.rank === 'leader') {
      throw new Error('Leader cannot leave guild. Transfer leadership or disband.');
    }

    const { error } = await supabase
      .from('guild_members')
      .delete()
      .eq('character_id', characterId);

    if (error) throw error;
  },

  async kickMember(guildId: string, targetCharacterId: string) {
    const { error } = await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', guildId)
      .eq('character_id', targetCharacterId);

    if (error) throw error;
  },

  async updateMemberRank(guildId: string, characterId: string, rank: 'leader' | 'officer' | 'member') {
    const { data, error } = await supabase
      .from('guild_members')
      .update({ rank })
      .eq('guild_id', guildId)
      .eq('character_id', characterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async transferLeadership(guildId: string, newLeaderId: string, oldLeaderId: string) {
    // Update new leader
    await this.updateMemberRank(guildId, newLeaderId, 'leader');
    // Demote old leader to officer
    await this.updateMemberRank(guildId, oldLeaderId, 'officer');

    // Update guild leader_id
    const { error } = await supabase
      .from('guilds')
      .update({ leader_id: newLeaderId })
      .eq('id', guildId);

    if (error) throw error;
  },

  async disbandGuild(guildId: string) {
    // Delete all members first
    await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', guildId);

    // Delete guild
    const { error } = await supabase
      .from('guilds')
      .delete()
      .eq('id', guildId);

    if (error) throw error;
  },

  async updateGuildDescription(guildId: string, description: string) {
    const { data, error } = await supabase
      .from('guilds')
      .update({ description })
      .eq('id', guildId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Auto-save helper
export class AutoSave {
  private saveInterval: number | null = null;
  private characterId: string | null = null;

  start(characterId: string, getState: () => Record<string, any>, intervalMs: number = 30000) {
    this.characterId = characterId;

    this.saveInterval = window.setInterval(async () => {
      if (!this.characterId) return;

      try {
        const state = getState();
        await characterApi.updateCharacter(this.characterId, state);
        console.log('Auto-saved character');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalMs);
  }

  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.characterId = null;
  }

  async saveNow() {
    // Manually triggered save
  }
}

export const autoSave = new AutoSave();
