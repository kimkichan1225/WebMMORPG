import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qtvlysukacrqrxqqnnsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Server-side Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database helper functions
export const db = {
  // Character operations
  async getCharacter(characterId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) throw error;
    return data;
  },

  async getCharactersByUser(userId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async updateCharacter(characterId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('characters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', characterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createCharacter(character: {
    user_id: string;
    name: string;
    job: string;
  }) {
    const { data, error } = await supabase
      .from('characters')
      .insert({
        ...character,
        level: 1,
        exp: 0,
        hp: 100,
        max_hp: 100,
        mp: 50,
        max_mp: 50,
        str: 5,
        dex: 5,
        int: 5,
        vit: 5,
        luk: 5,
        stat_points: 0,
        x: 1280,
        y: 1280,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Inventory operations
  async getInventory(characterId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data;
  },

  async addInventoryItem(item: {
    character_id: string;
    item_type: string;
    item_id: string;
    quantity: number;
    slot: number;
  }) {
    // Check if item already exists
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
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async updateInventoryItem(itemId: string, updates: { quantity?: number; slot?: number }) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInventoryItem(itemId: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Equipment operations
  async getEquipment(characterId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data;
  },

  async equipItem(characterId: string, slot: string, itemId: string) {
    // Remove existing equipment in slot
    await supabase
      .from('equipment')
      .delete()
      .eq('character_id', characterId)
      .eq('slot', slot);

    // Add new equipment
    const { data, error } = await supabase
      .from('equipment')
      .insert({
        character_id: characterId,
        slot,
        item_id: itemId,
      })
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

  // Quest operations
  async getCharacterQuests(characterId: string) {
    const { data, error } = await supabase
      .from('character_quests')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;
    return data;
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

  async updateQuestProgress(questRecordId: string, progress: Record<string, number>) {
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
