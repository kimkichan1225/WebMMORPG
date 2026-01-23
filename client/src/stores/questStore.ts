import { create } from 'zustand';
import questsData from '../data/quests.json';
import { usePlayerStore } from './playerStore';
import { useInventoryStore } from './inventoryStore';
import { useEquipmentStore } from './equipmentStore';
import { questApi } from '../services/supabase';

export interface Quest {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  type: 'kill' | 'gather' | 'acquire' | 'level';
  target: string;
  targetCount: number;
  levelReq: number;
  rewards: {
    exp: number;
    gold: number;
    items?: string[];
  };
  prereqQuest: string | null;
  npcId: string;
}

export interface QuestProgress {
  questId: string;
  currentCount: number;
  isComplete: boolean;
  isRewarded: boolean;
}

interface QuestState {
  // All quests from data
  allQuests: Record<string, Quest>;

  // Active quests with progress
  activeQuests: Record<string, QuestProgress>;

  // Completed quest IDs
  completedQuests: string[];

  // DB sync
  _characterId: string | null;
  _dbQuestRecords: Map<string, string>; // questId -> DB record id

  // Actions
  acceptQuest: (questId: string) => boolean;
  abandonQuest: (questId: string) => void;
  updateQuestProgress: (type: 'kill' | 'gather' | 'acquire' | 'level', target: string, count?: number) => void;
  completeQuest: (questId: string) => boolean;
  canAcceptQuest: (questId: string) => boolean;
  getAvailableQuests: (npcId: string) => Quest[];
  getActiveQuestsForNpc: (npcId: string) => QuestProgress[];
  getCompletableQuests: (npcId: string) => QuestProgress[];
  resetQuests: () => void;

  // DB sync actions
  loadFromDb: (characterId: string) => Promise<void>;
  _saveQuestToDb: (questId: string, progress: QuestProgress) => Promise<void>;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  allQuests: questsData.quests as Record<string, Quest>,
  activeQuests: {},
  completedQuests: [],
  _characterId: null,
  _dbQuestRecords: new Map(),

  acceptQuest: (questId: string) => {
    const { allQuests, activeQuests, canAcceptQuest, _characterId } = get();
    const quest = allQuests[questId];

    if (!quest) return false;
    if (!canAcceptQuest(questId)) return false;
    if (activeQuests[questId]) return false;

    const newProgress: QuestProgress = {
      questId,
      currentCount: 0,
      isComplete: false,
      isRewarded: false
    };

    set({
      activeQuests: {
        ...activeQuests,
        [questId]: newProgress
      }
    });

    // Save to DB
    if (_characterId) {
      questApi.startQuest(_characterId, questId).then((record) => {
        if (record) {
          const { _dbQuestRecords } = get();
          _dbQuestRecords.set(questId, record.id);
        }
      }).catch(console.error);
    }

    // Check immediate completion for level quests
    if (quest.type === 'level') {
      get().updateQuestProgress('level', 'level', usePlayerStore.getState().level);
    }

    return true;
  },

  abandonQuest: (questId: string) => {
    const { activeQuests } = get();
    const newActiveQuests = { ...activeQuests };
    delete newActiveQuests[questId];
    set({ activeQuests: newActiveQuests });
  },

  updateQuestProgress: (type, target, count = 1) => {
    const { allQuests, activeQuests, _dbQuestRecords } = get();

    const updatedQuests = { ...activeQuests };
    let hasChanges = false;
    const questsToSave: string[] = [];

    Object.entries(activeQuests).forEach(([questId, progress]) => {
      if (progress.isComplete || progress.isRewarded) return;

      const quest = allQuests[questId];
      if (!quest) return;

      if (quest.type === type && quest.target === target) {
        const newCount = type === 'level'
          ? count
          : Math.min(progress.currentCount + count, quest.targetCount);

        updatedQuests[questId] = {
          ...progress,
          currentCount: newCount,
          isComplete: newCount >= quest.targetCount
        };
        hasChanges = true;
        questsToSave.push(questId);
      }
    });

    if (hasChanges) {
      set({ activeQuests: updatedQuests });

      // Save to DB
      questsToSave.forEach(questId => {
        const dbRecordId = _dbQuestRecords.get(questId);
        const progress = updatedQuests[questId];
        if (dbRecordId && progress) {
          questApi.updateProgress(dbRecordId, { currentCount: progress.currentCount }).catch(console.error);
        }
      });
    }
  },

  completeQuest: (questId: string) => {
    const { allQuests, activeQuests, completedQuests, _dbQuestRecords } = get();
    const quest = allQuests[questId];
    const progress = activeQuests[questId];

    if (!quest || !progress) return false;
    if (!progress.isComplete || progress.isRewarded) return false;

    // Give rewards
    const playerStore = usePlayerStore.getState();
    const inventoryStore = useInventoryStore.getState();
    const equipmentStore = useEquipmentStore.getState();

    // EXP
    playerStore.gainExp(quest.rewards.exp);

    // Gold
    playerStore.gainGold(quest.rewards.gold);

    // Items
    if (quest.rewards.items) {
      quest.rewards.items.forEach(itemId => {
        // Find item data
        const consumable = equipmentStore.allItems.consumables[itemId];
        const weapon = equipmentStore.allItems.weapons[itemId];
        const armor = equipmentStore.allItems.armor[itemId];

        const itemData = consumable || weapon || armor;
        if (itemData) {
          inventoryStore.addItem({
            id: itemId,
            name: itemData.name,
            type: consumable ? 'consumable' : 'equipment',
            quantity: 1
          });
        }
      });
    }

    // Mark as completed
    const newActiveQuests = { ...activeQuests };
    newActiveQuests[questId] = {
      ...progress,
      isRewarded: true
    };

    // Remove from active and add to completed
    delete newActiveQuests[questId];

    set({
      activeQuests: newActiveQuests,
      completedQuests: [...completedQuests, questId]
    });

    // Save to DB
    const dbRecordId = _dbQuestRecords.get(questId);
    if (dbRecordId) {
      questApi.completeQuest(dbRecordId).catch(console.error);
      _dbQuestRecords.delete(questId);
    }

    return true;
  },

  canAcceptQuest: (questId: string) => {
    const { allQuests, activeQuests, completedQuests } = get();
    const quest = allQuests[questId];

    if (!quest) return false;

    // Already active or completed
    if (activeQuests[questId] || completedQuests.includes(questId)) {
      return false;
    }

    // Level requirement
    const playerLevel = usePlayerStore.getState().level;
    if (playerLevel < quest.levelReq) {
      return false;
    }

    // Prerequisite quest
    if (quest.prereqQuest && !completedQuests.includes(quest.prereqQuest)) {
      return false;
    }

    return true;
  },

  getAvailableQuests: (npcId: string) => {
    const { allQuests, canAcceptQuest } = get();

    return Object.values(allQuests).filter(quest => {
      return quest.npcId === npcId && canAcceptQuest(quest.id);
    });
  },

  getActiveQuestsForNpc: (npcId: string) => {
    const { allQuests, activeQuests } = get();

    return Object.values(activeQuests).filter(progress => {
      const quest = allQuests[progress.questId];
      return quest && quest.npcId === npcId && !progress.isComplete;
    });
  },

  getCompletableQuests: (npcId: string) => {
    const { allQuests, activeQuests } = get();

    return Object.values(activeQuests).filter(progress => {
      const quest = allQuests[progress.questId];
      return quest && quest.npcId === npcId && progress.isComplete && !progress.isRewarded;
    });
  },

  resetQuests: () => {
    set({
      activeQuests: {},
      completedQuests: []
    });
  },

  // DB sync functions
  loadFromDb: async (characterId: string) => {
    try {
      const dbQuests = await questApi.getQuests(characterId);
      const activeQuests: Record<string, QuestProgress> = {};
      const completedQuests: string[] = [];
      const dbQuestRecords = new Map<string, string>();

      for (const dbQuest of dbQuests) {
        const questId = dbQuest.quest_id;
        const progress = dbQuest.progress || {};

        if (dbQuest.status === 'completed') {
          completedQuests.push(questId);
        } else if (dbQuest.status === 'active') {
          const { allQuests } = get();
          const questData = allQuests[questId];
          const currentCount = progress.currentCount || 0;

          activeQuests[questId] = {
            questId,
            currentCount,
            isComplete: questData ? currentCount >= questData.targetCount : false,
            isRewarded: false,
          };
          dbQuestRecords.set(questId, dbQuest.id);
        }
      }

      set({
        activeQuests,
        completedQuests,
        _characterId: characterId,
        _dbQuestRecords: dbQuestRecords,
      });
      console.log('Quests loaded from DB:', Object.keys(activeQuests).length, 'active,', completedQuests.length, 'completed');
    } catch (error) {
      console.error('Failed to load quests from DB:', error);
    }
  },

  _saveQuestToDb: async (questId: string, progress: QuestProgress) => {
    const { _dbQuestRecords } = get();
    const dbRecordId = _dbQuestRecords.get(questId);
    if (dbRecordId) {
      try {
        await questApi.updateProgress(dbRecordId, { currentCount: progress.currentCount });
      } catch (error) {
        console.error('Failed to save quest progress:', error);
      }
    }
  },
}));
