import React from 'react';
import { NPC } from '../../game/entities/NPC';
import { useQuestStore, Quest, QuestProgress } from '../../stores/questStore';
import { usePlayerStore } from '../../stores/playerStore';

interface NPCDialogProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NPC | null;
  onOpenShop: () => void;
  onOpenJobChange: () => void;
  onOpenToolChange: () => void;
}

export const NPCDialog: React.FC<NPCDialogProps> = ({
  isOpen,
  onClose,
  npc,
  onOpenShop,
  onOpenJobChange,
  onOpenToolChange
}) => {
  const {
    allQuests,
    getAvailableQuests,
    getActiveQuestsForNpc,
    getCompletableQuests,
    acceptQuest,
    completeQuest
  } = useQuestStore();

  if (!isOpen || !npc) return null;

  const availableQuests = getAvailableQuests(npc.id);
  const activeQuests = getActiveQuestsForNpc(npc.id);
  const completableQuests = getCompletableQuests(npc.id);

  const hasAvailableQuest = availableQuests.length > 0;
  const hasQuestInProgress = activeQuests.length > 0;
  const hasCompletableQuest = completableQuests.length > 0;

  const dialogueText = npc.getDialogue(hasAvailableQuest, hasQuestInProgress, hasCompletableQuest);

  const handleAcceptQuest = (questId: string) => {
    acceptQuest(questId);
  };

  const handleCompleteQuest = (questId: string) => {
    completeQuest(questId);
  };

  const handleAction = () => {
    if (npc.type === 'shop') {
      onOpenShop();
    } else if (npc.type === 'job') {
      // Check if this is tool_master
      if (npc.id === 'tool_master') {
        onOpenToolChange();
      } else {
        onOpenJobChange();
      }
    }
    onClose();
  };

  // Inn rest functionality
  const handleInnRest = () => {
    const playerState = usePlayerStore.getState();
    const restCost = 10;

    if (playerState.gold >= restCost) {
      playerState.heal(playerState.maxHp); // Full HP recovery
      usePlayerStore.setState({
        mp: playerState.maxMp, // Full MP recovery
        gold: playerState.gold - restCost
      });
      alert('HP와 MP가 완전히 회복되었습니다!');
    } else {
      alert('골드가 부족합니다! (필요: 10G)');
    }
  };

  // Get additional dialogue based on NPC type
  const getAdditionalDialogue = () => {
    switch (npc.type) {
      case 'fishing':
        return npc.dialogue.fishing_tip;
      case 'cooking':
        return npc.dialogue.cooking_recipe;
      case 'bank':
        return npc.dialogue.bank_deposit;
      case 'inn':
        return npc.dialogue.inn_rest;
      case 'info':
        return npc.dialogue.info;
      default:
        return null;
    }
  };

  const additionalDialogue = getAdditionalDialogue();

  return (
    <div className="npc-dialog">
      <div className="dialog-header">
        <h3>{npc.nameKo}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="dialog-content">
        <div className="dialogue-box">
          <p>"{dialogueText}"</p>
        </div>

        {/* Completable Quests */}
        {completableQuests.length > 0 && (
          <div className="quest-section">
            <h4>완료 가능한 퀘스트</h4>
            {completableQuests.map(progress => {
              const quest = allQuests[progress.questId];
              if (!quest) return null;

              return (
                <div key={quest.id} className="quest-item complete">
                  <div className="quest-info">
                    <span className="quest-name">{quest.nameKo}</span>
                    <div className="quest-rewards">
                      <span>보상: {quest.rewards.exp} EXP, {quest.rewards.gold} G</span>
                    </div>
                  </div>
                  <button
                    className="complete-btn"
                    onClick={() => handleCompleteQuest(quest.id)}
                  >
                    완료
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Available Quests */}
        {availableQuests.length > 0 && (
          <div className="quest-section">
            <h4>수락 가능한 퀘스트</h4>
            {availableQuests.map(quest => (
              <div key={quest.id} className="quest-item">
                <div className="quest-info">
                  <span className="quest-name">{quest.nameKo}</span>
                  <p className="quest-desc">{quest.descriptionKo}</p>
                  <div className="quest-rewards">
                    <span>보상: {quest.rewards.exp} EXP, {quest.rewards.gold} G</span>
                  </div>
                </div>
                <button
                  className="accept-btn"
                  onClick={() => handleAcceptQuest(quest.id)}
                >
                  수락
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active Quests Progress */}
        {activeQuests.length > 0 && (
          <div className="quest-section">
            <h4>진행 중인 퀘스트</h4>
            {activeQuests.map(progress => {
              const quest = allQuests[progress.questId];
              if (!quest) return null;

              return (
                <div key={quest.id} className="quest-item in-progress">
                  <div className="quest-info">
                    <span className="quest-name">{quest.nameKo}</span>
                    <span className="quest-progress">
                      진행: {progress.currentCount} / {quest.targetCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Dialogue for special NPC types */}
        {additionalDialogue && (
          <div className="info-section">
            <div className="info-box">
              <p>{additionalDialogue}</p>
            </div>
          </div>
        )}

        {/* NPC Type Actions */}
        {(npc.type === 'shop' || npc.type === 'job') && (
          <div className="action-section">
            <button className="action-btn" onClick={handleAction}>
              {npc.type === 'shop' ? '상점 열기' : (npc.id === 'tool_master' ? '도구 변경' : '전직하기')}
            </button>
          </div>
        )}

        {/* Inn Rest Action */}
        {npc.type === 'inn' && (
          <div className="action-section">
            <button className="action-btn inn-btn" onClick={handleInnRest}>
              🛏️ 휴식하기 (10G)
            </button>
          </div>
        )}

        {/* Bank Action (placeholder) */}
        {npc.type === 'bank' && (
          <div className="action-section">
            <p style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>
              은행 시스템은 곧 추가될 예정입니다.
            </p>
          </div>
        )}

        {/* Cooking Action (placeholder) */}
        {npc.type === 'cooking' && (
          <div className="action-section">
            <p style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>
              요리 시스템은 곧 추가될 예정입니다.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .npc-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 30, 0.95);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          width: 380px;
          max-height: 70vh;
          z-index: 1000;
          color: white;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(40, 40, 60, 0.8);
          border-bottom: 1px solid #4a4a6a;
        }

        .dialog-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .dialog-header button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .dialog-content {
          padding: 15px;
          max-height: calc(70vh - 50px);
          overflow-y: auto;
        }

        .dialogue-box {
          background: rgba(40, 40, 60, 0.4);
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          border-left: 3px solid #6a6a9a;
        }

        .dialogue-box p {
          margin: 0;
          font-style: italic;
          color: #ddd;
          line-height: 1.5;
        }

        .quest-section {
          margin-bottom: 15px;
        }

        .quest-section h4 {
          margin: 0 0 10px 0;
          font-size: 13px;
          color: #aaa;
        }

        .quest-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .quest-item.complete {
          border-color: #4a8;
        }

        .quest-item.in-progress {
          border-color: #aa6;
        }

        .quest-info {
          flex: 1;
        }

        .quest-name {
          font-weight: bold;
          font-size: 13px;
          display: block;
          margin-bottom: 5px;
        }

        .quest-desc {
          font-size: 12px;
          color: #aaa;
          margin: 5px 0;
          line-height: 1.4;
        }

        .quest-rewards {
          font-size: 11px;
          color: #8f8;
        }

        .quest-progress {
          font-size: 11px;
          color: #aa6;
        }

        .accept-btn, .complete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          margin-left: 10px;
        }

        .accept-btn {
          background: #46a;
        }

        .accept-btn:hover {
          background: #57b;
        }

        .complete-btn {
          background: #4a6;
        }

        .complete-btn:hover {
          background: #5b7;
        }

        .action-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #3a3a5a;
          text-align: center;
        }

        .action-btn {
          padding: 10px 30px;
          background: linear-gradient(180deg, #5a7, #486);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }

        .action-btn:hover {
          background: linear-gradient(180deg, #6b8, #597);
        }

        .inn-btn {
          background: linear-gradient(180deg, #8BC34A, #689F38);
        }

        .inn-btn:hover {
          background: linear-gradient(180deg, #9CCC65, #7CB342);
        }

        .info-section {
          margin-bottom: 15px;
        }

        .info-box {
          background: rgba(79, 195, 247, 0.1);
          border: 1px solid rgba(79, 195, 247, 0.3);
          border-radius: 4px;
          padding: 10px;
        }

        .info-box p {
          margin: 0;
          color: #ccc;
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
