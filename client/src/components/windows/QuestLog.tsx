import React, { useState } from 'react';
import { useQuestStore, Quest, QuestProgress } from '../../stores/questStore';

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ isOpen, onClose }) => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  const { allQuests, activeQuests, completedQuests, abandonQuest } = useQuestStore();

  if (!isOpen) return null;

  const activeQuestList = Object.values(activeQuests);

  const handleAbandon = (questId: string) => {
    if (confirm('정말 이 퀘스트를 포기하시겠습니까?')) {
      abandonQuest(questId);
      setSelectedQuest(null);
    }
  };

  const getQuestTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      kill: '처치',
      gather: '수집',
      acquire: '획득',
      level: '레벨'
    };
    return labels[type] || type;
  };

  const getProgressText = (quest: Quest, progress: QuestProgress): string => {
    return `${progress.currentCount} / ${quest.targetCount}`;
  };

  return (
    <div className="quest-log">
      <div className="window-header">
        <h3>퀘스트 (Quests)</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="window-content">
        <div className="quest-stats">
          <span>진행 중: {activeQuestList.length}</span>
          <span>완료: {completedQuests.length}</span>
        </div>

        {/* Active Quests */}
        <div className="quest-section">
          <h4>진행 중인 퀘스트</h4>
          {activeQuestList.length === 0 ? (
            <p className="empty-msg">진행 중인 퀘스트가 없습니다.</p>
          ) : (
            <div className="quest-list">
              {activeQuestList.map(progress => {
                const quest = allQuests[progress.questId];
                if (!quest) return null;

                const isSelected = selectedQuest === quest.id;

                return (
                  <div
                    key={quest.id}
                    className={`quest-item ${isSelected ? 'selected' : ''} ${progress.isComplete ? 'complete' : ''}`}
                    onClick={() => setSelectedQuest(isSelected ? null : quest.id)}
                  >
                    <div className="quest-header">
                      <span className="quest-name">
                        {progress.isComplete && '✓ '}
                        {quest.nameKo}
                      </span>
                      <span className="quest-type">{getQuestTypeLabel(quest.type)}</span>
                    </div>

                    <div className="quest-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(progress.currentCount / quest.targetCount) * 100}%`
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {getProgressText(quest, progress)}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="quest-details">
                        <p className="quest-desc">{quest.descriptionKo}</p>

                        <div className="quest-rewards">
                          <h5>보상</h5>
                          <span>경험치: {quest.rewards.exp}</span>
                          <span>골드: {quest.rewards.gold}</span>
                          {quest.rewards.items && (
                            <span>아이템: {quest.rewards.items.length}개</span>
                          )}
                        </div>

                        {!progress.isComplete && (
                          <button
                            className="abandon-btn"
                            onClick={(e) => { e.stopPropagation(); handleAbandon(quest.id); }}
                          >
                            포기
                          </button>
                        )}

                        {progress.isComplete && (
                          <p className="complete-msg">
                            NPC에게 돌아가서 보상을 받으세요!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div className="quest-section completed-section">
            <h4>완료한 퀘스트 ({completedQuests.length})</h4>
            <div className="completed-list">
              {completedQuests.map(questId => {
                const quest = allQuests[questId];
                if (!quest) return null;

                return (
                  <div key={questId} className="completed-quest">
                    <span>{quest.nameKo}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .quest-log {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 30, 0.95);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          width: 400px;
          max-height: 80vh;
          z-index: 1000;
          color: white;
        }

        .window-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(40, 40, 60, 0.8);
          border-bottom: 1px solid #4a4a6a;
        }

        .window-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .window-header button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .window-content {
          padding: 15px;
          max-height: calc(80vh - 50px);
          overflow-y: auto;
        }

        .quest-stats {
          display: flex;
          justify-content: space-around;
          padding: 10px;
          background: rgba(40, 40, 60, 0.4);
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .quest-stats span {
          font-size: 13px;
          color: #aaa;
        }

        .quest-section h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #aaa;
        }

        .quest-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quest-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quest-item:hover {
          background: rgba(50, 50, 80, 0.6);
        }

        .quest-item.selected {
          background: rgba(60, 60, 100, 0.6);
          border-color: #6a6a9a;
        }

        .quest-item.complete {
          border-color: #4a8;
        }

        .quest-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .quest-name {
          font-weight: bold;
          font-size: 13px;
        }

        .quest-item.complete .quest-name {
          color: #4a8;
        }

        .quest-type {
          font-size: 11px;
          color: #888;
          padding: 2px 6px;
          background: rgba(60, 60, 80, 0.6);
          border-radius: 3px;
        }

        .quest-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(30, 30, 50, 0.8);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4a6, #6c8);
          transition: width 0.3s;
        }

        .quest-item.complete .progress-fill {
          background: linear-gradient(90deg, #4a8, #6ca);
        }

        .progress-text {
          font-size: 12px;
          color: #aaa;
          min-width: 50px;
          text-align: right;
        }

        .quest-details {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #3a3a5a;
        }

        .quest-desc {
          font-size: 12px;
          color: #ccc;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }

        .quest-rewards {
          background: rgba(40, 40, 60, 0.4);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .quest-rewards h5 {
          margin: 0 0 5px 0;
          font-size: 11px;
          color: #888;
        }

        .quest-rewards span {
          display: block;
          font-size: 12px;
          color: #8f8;
        }

        .abandon-btn {
          padding: 5px 12px;
          background: #654;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .abandon-btn:hover {
          background: #765;
        }

        .complete-msg {
          font-size: 12px;
          color: #4a8;
          margin: 0;
          font-style: italic;
        }

        .empty-msg {
          text-align: center;
          color: #666;
          font-size: 13px;
          padding: 20px;
        }

        .completed-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #3a3a5a;
        }

        .completed-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .completed-quest {
          font-size: 11px;
          color: #888;
          padding: 3px 8px;
          background: rgba(40, 40, 60, 0.4);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};
