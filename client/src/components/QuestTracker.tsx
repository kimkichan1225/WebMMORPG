import React from 'react';
import { useQuestStore } from '../stores/questStore';

export const QuestTracker: React.FC = () => {
  const { allQuests, activeQuests } = useQuestStore();

  const activeQuestList = Object.values(activeQuests);

  if (activeQuestList.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '120px',
      left: '10px',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '200px',
      maxWidth: '250px',
      border: '1px solid #4a4a6a',
    }}>
      <div style={{
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: '12px',
        marginBottom: '8px',
        borderBottom: '1px solid #4a4a6a',
        paddingBottom: '5px',
      }}>
        Quest Tracker
      </div>

      {activeQuestList.map(progress => {
        const quest = allQuests[progress.questId];
        if (!quest) return null;

        const isComplete = progress.isComplete;
        const progressPercent = Math.min(100, (progress.currentCount / quest.targetCount) * 100);

        return (
          <div
            key={progress.questId}
            style={{
              marginBottom: '8px',
              padding: '6px',
              backgroundColor: isComplete ? 'rgba(80, 200, 80, 0.2)' : 'rgba(40, 40, 60, 0.5)',
              borderRadius: '4px',
              border: isComplete ? '1px solid #4a8' : '1px solid transparent',
            }}
          >
            {/* Quest Name */}
            <div style={{
              color: isComplete ? '#8f8' : '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}>
              {isComplete && <span style={{ marginRight: '4px' }}>✓</span>}
              {quest.nameKo}
            </div>

            {/* Quest Target Description */}
            <div style={{
              color: '#aaa',
              fontSize: '10px',
              marginBottom: '4px',
            }}>
              {getQuestTargetText(quest)}
            </div>

            {/* Progress Bar */}
            <div style={{
              backgroundColor: '#333',
              borderRadius: '3px',
              height: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                backgroundColor: isComplete ? '#4a8' : '#46a',
                width: `${progressPercent}%`,
                height: '100%',
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Progress Text */}
            <div style={{
              color: isComplete ? '#8f8' : '#888',
              fontSize: '10px',
              textAlign: 'right',
              marginTop: '2px',
            }}>
              {progress.currentCount} / {quest.targetCount}
              {isComplete && <span style={{ color: '#FFD700', marginLeft: '5px' }}>(NPC 방문)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get quest target description
function getQuestTargetText(quest: { type: string; target: string; targetCount: number }): string {
  switch (quest.type) {
    case 'kill':
      return `${getMonsterName(quest.target)} 처치`;
    case 'gather':
      return `${getItemName(quest.target)} 수집`;
    case 'acquire':
      return `${getItemName(quest.target)} 획득`;
    case 'level':
      return `레벨 ${quest.targetCount} 달성`;
    default:
      return quest.target;
  }
}

// Monster name mapping
function getMonsterName(monsterId: string): string {
  const monsterNames: Record<string, string> = {
    'slime': '슬라임',
    'goblin': '고블린',
    'wolf': '늑대',
    'skeleton': '스켈레톤',
    'bat': '박쥐',
    'golem': '골렘',
    'treant': '트렌트',
    'scorpion': '전갈',
    'mummy': '미라',
    'sand_worm': '샌드웜',
    'anubis': '아누비스',
    'fire_elemental': '화염 정령',
    'forest_boss': '숲의 수호자',
    'cave_boss': '동굴의 군주',
    'pyramid_boss': '파라오',
  };
  return monsterNames[monsterId] || monsterId;
}

// Item name mapping (basic)
function getItemName(itemId: string): string {
  const itemNames: Record<string, string> = {
    'wood': '나무',
    'hardwood': '단단한 나무',
    'stone': '돌',
    'iron': '철광석',
    'iron_ore': '철광석',
    'gold': '금광석',
    'gold_ore': '금광석',
    'herb': '약초',
    'manaflower': '마나꽃',
    'rareherb': '희귀약초',
    'mushroom': '버섯',
    'crystal': '수정',
    'weapon': '무기',
    'hp_potion_small': '작은 HP 포션',
    'hp_potion_medium': '중간 HP 포션',
  };
  return itemNames[itemId] || itemId;
}
