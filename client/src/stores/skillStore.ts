import { create } from 'zustand';
import skillsData from '../data/skills.json';
import { usePlayerStore } from './playerStore';

export interface Skill {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  type: 'active' | 'buff';
  job: string[];
  mpCost: number;
  cooldown: number;
  damage?: number;
  range?: number;
  aoe?: boolean;
  aoeRadius?: number;
  projectile?: boolean;
  element?: string;
  hits?: number;
  critBonus?: number;
  poisonDamage?: number;
  poisonDuration?: number;
  slowDuration?: number;
  stunDuration?: number;
  teleportRange?: number;
  healAmount?: number;
  healScale?: number;
  duration?: number;
  attackBonus?: number;
  defenseBonus?: number;
  evasionBonus?: number;
  lifesteal?: number;
  piercing?: boolean;
  effect?: string; // Visual effect type
  unlockLevel: number;
}

export interface SkillSlot {
  skillId: string | null;
  itemId: string | null; // For consumable items like potions
  key: string;
}

interface SkillState {
  // All skills from data
  allSkills: Record<string, Skill>;

  // Learned skills
  learnedSkills: string[];

  // Skill slots (hotbar)
  skillSlots: SkillSlot[];

  // Cooldowns (skillId -> timestamp when available)
  cooldowns: Record<string, number>;

  // Active buffs
  activeBuffs: {
    skillId: string;
    endTime: number;
  }[];

  // Actions
  learnSkill: (skillId: string) => boolean;
  assignSkillToSlot: (skillId: string, slotIndex: number) => void;
  assignItemToSlot: (itemId: string, slotIndex: number) => void;
  clearSlot: (slotIndex: number) => void;
  removeSkillFromSlot: (slotIndex: number) => void;
  useSkill: (skillId: string) => { success: boolean; error?: string };
  isSkillReady: (skillId: string) => boolean;
  getCooldownRemaining: (skillId: string) => number;
  getAvailableSkills: () => Skill[];
  updateBuffs: () => void;
  getActiveBuffEffects: () => { attackBonus: number; evasionBonus: number };
  resetSkills: () => void;
}

const DEFAULT_SKILL_SLOTS: SkillSlot[] = [
  { skillId: null, itemId: null, key: '1' },
  { skillId: null, itemId: null, key: '2' },
  { skillId: null, itemId: null, key: '3' },
  { skillId: null, itemId: null, key: '4' },
  { skillId: null, itemId: null, key: '5' },
  { skillId: null, itemId: null, key: '6' },
];

export const useSkillStore = create<SkillState>((set, get) => ({
  allSkills: skillsData.skills as Record<string, Skill>,
  learnedSkills: ['slash'], // Base skill
  skillSlots: [...DEFAULT_SKILL_SLOTS],
  cooldowns: {},
  activeBuffs: [],

  learnSkill: (skillId: string) => {
    const { allSkills, learnedSkills } = get();
    const skill = allSkills[skillId];

    if (!skill) return false;
    if (learnedSkills.includes(skillId)) return false;

    const playerState = usePlayerStore.getState();
    const playerJob = playerState.job;
    const playerLevel = playerState.level;

    // Check job requirement
    if (!skill.job.includes(playerJob) && !skill.job.includes('Base')) {
      return false;
    }

    // Check level requirement
    if (playerLevel < skill.unlockLevel) {
      return false;
    }

    set({ learnedSkills: [...learnedSkills, skillId] });
    return true;
  },

  assignSkillToSlot: (skillId: string, slotIndex: number) => {
    const { skillSlots, learnedSkills } = get();

    if (!learnedSkills.includes(skillId)) return;
    if (slotIndex < 0 || slotIndex >= skillSlots.length) return;

    const newSlots = [...skillSlots];

    // Remove skill from other slots if already assigned
    newSlots.forEach((slot, i) => {
      if (slot.skillId === skillId) {
        newSlots[i] = { ...slot, skillId: null };
      }
    });

    // Assign skill and clear any item in this slot
    newSlots[slotIndex] = { ...newSlots[slotIndex], skillId, itemId: null };
    set({ skillSlots: newSlots });
  },

  assignItemToSlot: (itemId: string, slotIndex: number) => {
    const { skillSlots } = get();
    if (slotIndex < 0 || slotIndex >= skillSlots.length) return;

    const newSlots = [...skillSlots];

    // Remove item from other slots if already assigned
    newSlots.forEach((slot, i) => {
      if (slot.itemId === itemId) {
        newSlots[i] = { ...slot, itemId: null };
      }
    });

    // Assign item and clear any skill in this slot
    newSlots[slotIndex] = { ...newSlots[slotIndex], itemId, skillId: null };
    set({ skillSlots: newSlots });
  },

  clearSlot: (slotIndex: number) => {
    const { skillSlots } = get();
    if (slotIndex < 0 || slotIndex >= skillSlots.length) return;

    const newSlots = [...skillSlots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], skillId: null, itemId: null };
    set({ skillSlots: newSlots });
  },

  removeSkillFromSlot: (slotIndex: number) => {
    const { skillSlots } = get();
    if (slotIndex < 0 || slotIndex >= skillSlots.length) return;

    const newSlots = [...skillSlots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], skillId: null };
    set({ skillSlots: newSlots });
  },

  useSkill: (skillId: string) => {
    const { allSkills, learnedSkills, cooldowns } = get();
    const skill = allSkills[skillId];

    if (!skill) return { success: false, error: 'Skill not found' };
    if (!learnedSkills.includes(skillId)) return { success: false, error: 'Skill not learned' };

    const now = Date.now();
    if (cooldowns[skillId] && cooldowns[skillId] > now) {
      return { success: false, error: 'Skill on cooldown' };
    }

    const playerState = usePlayerStore.getState();

    // Check MP
    if (playerState.mp < skill.mpCost) {
      return { success: false, error: 'Not enough MP' };
    }

    // Consume MP
    usePlayerStore.getState().useMp(skill.mpCost);

    // Set cooldown
    set({
      cooldowns: {
        ...cooldowns,
        [skillId]: now + skill.cooldown
      }
    });

    // Handle buff skills
    if (skill.type === 'buff' && skill.duration) {
      const { activeBuffs } = get();
      set({
        activeBuffs: [
          ...activeBuffs.filter(b => b.skillId !== skillId),
          { skillId, endTime: now + skill.duration }
        ]
      });
    }

    return { success: true };
  },

  isSkillReady: (skillId: string) => {
    const { cooldowns } = get();
    const now = Date.now();
    return !cooldowns[skillId] || cooldowns[skillId] <= now;
  },

  getCooldownRemaining: (skillId: string) => {
    const { cooldowns } = get();
    const now = Date.now();
    if (!cooldowns[skillId]) return 0;
    return Math.max(0, cooldowns[skillId] - now);
  },

  getAvailableSkills: () => {
    const { allSkills } = get();
    const playerState = usePlayerStore.getState();
    const playerJob = playerState.job;
    const playerLevel = playerState.level;

    return Object.values(allSkills).filter(skill => {
      const jobMatch = skill.job.includes(playerJob) || skill.job.includes('Base');
      const levelMatch = playerLevel >= skill.unlockLevel;
      return jobMatch && levelMatch;
    });
  },

  updateBuffs: () => {
    const { activeBuffs } = get();
    const now = Date.now();
    const newBuffs = activeBuffs.filter(b => b.endTime > now);

    if (newBuffs.length !== activeBuffs.length) {
      set({ activeBuffs: newBuffs });
    }
  },

  getActiveBuffEffects: () => {
    const { activeBuffs, allSkills } = get();
    const now = Date.now();

    let attackBonus = 0;
    let defenseBonus = 0;
    let evasionBonus = 0;

    activeBuffs.forEach(buff => {
      if (buff.endTime > now) {
        const skill = allSkills[buff.skillId];
        if (skill) {
          if (skill.attackBonus) attackBonus += skill.attackBonus;
          if (skill.defenseBonus) defenseBonus += skill.defenseBonus;
          if (skill.evasionBonus) evasionBonus += skill.evasionBonus;
        }
      }
    });

    return { attackBonus, defenseBonus, evasionBonus };
  },

  resetSkills: () => {
    set({
      learnedSkills: ['slash'],
      skillSlots: DEFAULT_SKILL_SLOTS.map(slot => ({ ...slot })),
      cooldowns: {},
      activeBuffs: []
    });
  }
}));
