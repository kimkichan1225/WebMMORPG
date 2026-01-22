import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolType } from '@shared/types';

export type LifeSkillType = 'logging' | 'mining' | 'gathering' | 'fishing';

export interface LifeSkill {
  id: LifeSkillType;
  name: string;
  nameKo: string;
  tool: ToolType;
  level: number;
  exp: number;
  maxExp: number;
}

// EXP needed per level formula: level * 50
const calculateMaxExp = (level: number) => level * 50;

// Map tool type to life skill type
export const TOOL_TO_SKILL: Record<ToolType, LifeSkillType> = {
  axe: 'logging',
  pickaxe: 'mining',
  sickle: 'gathering',
  fishing_rod: 'fishing',
};

// Map life skill to resources it can gather
export const SKILL_RESOURCES: Record<LifeSkillType, string[]> = {
  logging: ['wood', 'hardwood'],
  mining: ['stone', 'iron', 'gold'],
  gathering: ['herb', 'manaflower', 'rareherb'],
  fishing: ['carp', 'crucian', 'bass', 'catfish', 'trout', 'salmon', 'koi', 'golden_carp'],
};

// Life skill descriptions
export const SKILL_INFO: Record<LifeSkillType, { name: string; nameKo: string; description: string }> = {
  logging: {
    name: 'Logging',
    nameKo: '벌목',
    description: '나무를 베어 목재를 얻습니다.',
  },
  mining: {
    name: 'Mining',
    nameKo: '채광',
    description: '광물을 캐서 광석을 얻습니다.',
  },
  gathering: {
    name: 'Gathering',
    nameKo: '채집',
    description: '약초와 식물을 채집합니다.',
  },
  fishing: {
    name: 'Fishing',
    nameKo: '낚시',
    description: '물고기를 낚아 판매하거나 요리에 사용합니다.',
  },
};

interface LifeSkillState {
  skills: Record<LifeSkillType, LifeSkill>;

  // Actions
  gainSkillExp: (skillType: LifeSkillType, amount: number) => void;
  getSkillByTool: (tool: ToolType) => LifeSkill;
  getGatherBonus: (skillType: LifeSkillType) => number;
  getGatherSpeedBonus: (skillType: LifeSkillType) => number;
}

export const useLifeSkillStore = create<LifeSkillState>()(
  persist(
    (set, get) => ({
      skills: {
        logging: {
          id: 'logging',
          name: 'Logging',
          nameKo: '벌목',
          tool: 'axe',
          level: 1,
          exp: 0,
          maxExp: calculateMaxExp(1),
        },
        mining: {
          id: 'mining',
          name: 'Mining',
          nameKo: '채광',
          tool: 'pickaxe',
          level: 1,
          exp: 0,
          maxExp: calculateMaxExp(1),
        },
        gathering: {
          id: 'gathering',
          name: 'Gathering',
          nameKo: '채집',
          tool: 'sickle',
          level: 1,
          exp: 0,
          maxExp: calculateMaxExp(1),
        },
        fishing: {
          id: 'fishing',
          name: 'Fishing',
          nameKo: '낚시',
          tool: 'fishing_rod',
          level: 1,
          exp: 0,
          maxExp: calculateMaxExp(1),
        },
      },

      gainSkillExp: (skillType, amount) => {
        set((state) => {
          let skill = state.skills[skillType];

          // Handle case where skill doesn't exist (migration from old persisted state)
          if (!skill) {
            const skillInfo = SKILL_INFO[skillType];
            const toolMap: Record<LifeSkillType, ToolType> = {
              logging: 'axe',
              mining: 'pickaxe',
              gathering: 'sickle',
              fishing: 'fishing_rod',
            };
            skill = {
              id: skillType,
              name: skillInfo?.name || skillType,
              nameKo: skillInfo?.nameKo || skillType,
              tool: toolMap[skillType],
              level: 1,
              exp: 0,
              maxExp: calculateMaxExp(1),
            };
          }

          let newExp = skill.exp + amount;
          let newLevel = skill.level;
          let newMaxExp = skill.maxExp;

          // Level up loop
          while (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLevel++;
            newMaxExp = calculateMaxExp(newLevel);
            console.log(`[Life Skill] ${SKILL_INFO[skillType].nameKo} 레벨 업! Lv.${newLevel}`);
          }

          return {
            skills: {
              ...state.skills,
              [skillType]: {
                ...skill,
                exp: newExp,
                level: newLevel,
                maxExp: newMaxExp,
              },
            },
          };
        });
      },

      getSkillByTool: (tool) => {
        const skillType = TOOL_TO_SKILL[tool];
        return get().skills[skillType];
      },

      // Bonus yield chance based on skill level (1% per level)
      getGatherBonus: (skillType) => {
        const skill = get().skills[skillType];
        return skill.level * 0.01; // 1% per level
      },

      // Speed bonus based on skill level (2% faster per level)
      getGatherSpeedBonus: (skillType) => {
        const skill = get().skills[skillType];
        return skill.level * 0.02; // 2% faster per level
      },
    }),
    {
      name: 'life-skill-storage',
      // Migrate old data that doesn't have fishing skill
      merge: (persistedState: any, currentState: LifeSkillState) => {
        if (!persistedState) return currentState;

        const mergedSkills = { ...currentState.skills };

        // Copy over persisted skills
        if (persistedState.skills) {
          for (const key of Object.keys(persistedState.skills)) {
            if (mergedSkills[key as LifeSkillType]) {
              mergedSkills[key as LifeSkillType] = persistedState.skills[key];
            }
          }
        }

        return {
          ...currentState,
          skills: mergedSkills,
        };
      },
    }
  )
);

// Helper function to get EXP for gathering a resource
export function getResourceExp(resourceId: string): number {
  const expValues: Record<string, number> = {
    // Wood
    wood: 5,
    hardwood: 15,
    // Mining
    stone: 5,
    iron: 10,
    gold: 20,
    // Gathering
    herb: 5,
    manaflower: 15,
    rareherb: 30,
  };
  return expValues[resourceId] || 5;
}

// Helper to check if a resource matches a skill
export function resourceMatchesSkill(resourceId: string, skillType: LifeSkillType): boolean {
  return SKILL_RESOURCES[skillType].includes(resourceId);
}
