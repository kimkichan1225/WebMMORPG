import React, { memo, useMemo } from 'react';
import { useQuestStore } from '../stores/questStore';

const QuestTrackerComponent: React.FC = () => {
  // Use selectors to minimize re-renders
  const activeQuests = useQuestStore((state) => state.activeQuests);
  const allQuests = useQuestStore((state) => state.allQuests);

  // Memoize quest calculations
  const { trackedQuestIds, totalActive } = useMemo(() => {
    const ids = Object.keys(activeQuests).slice(0, 3);
    return {
      trackedQuestIds: ids,
      totalActive: Object.keys(activeQuests).length,
    };
  }, [activeQuests]);

  if (trackedQuestIds.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '180px',
        right: '10px',
        width: '200px',
        backgroundColor: 'rgba(20, 20, 30, 0.85)',
        border: '1px solid #4a4a6a',
        borderRadius: '8px',
        padding: '10px',
        zIndex: 90,
        color: '#fff',
        fontSize: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid #3a3a5a',
        }}
      >
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>퀘스트</span>
        <span style={{ color: '#888', fontSize: '10px' }}>
          {trackedQuestIds.length}/{totalActive}
        </span>
      </div>

      {/* Quest List */}
      {trackedQuestIds.map((questId) => {
        const progress = activeQuests[questId];
        const quest = allQuests[questId];

        if (!quest || !progress) return null;

        const isComplete = progress.isComplete;
        const progressPercent = Math.min(
          (progress.currentCount / quest.targetCount) * 100,
          100
        );

        // Determine if it's a main quest (has no prereq and is early)
        const isMainQuest = quest.levelReq <= 5 && !quest.prereqQuest;

        return (
          <div
            key={questId}
            style={{
              marginBottom: '10px',
              padding: '6px',
              backgroundColor: 'rgba(40, 40, 60, 0.5)',
              borderRadius: '4px',
              borderLeft: isMainQuest
                ? '3px solid #FFD700'
                : '3px solid #4a9eff',
            }}
          >
            {/* Quest Title */}
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '4px',
                color: isMainQuest ? '#FFD700' : '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isMainQuest && <span style={{ fontSize: '10px' }}>★</span>}
              {quest.nameKo || quest.name}
            </div>

            {/* Objective */}
            <div
              style={{
                marginTop: '4px',
                opacity: isComplete ? 0.6 : 1,
              }}
            >
              {/* Objective description */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px',
                }}
              >
                <span
                  style={{
                    color: isComplete ? '#8f8' : '#ccc',
                    fontSize: '11px',
                    textDecoration: isComplete ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {isComplete ? '✓ ' : '○ '}
                  {quest.descriptionKo || quest.description}
                </span>
              </div>

              {/* Progress */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: '4px',
                }}
              >
                <span
                  style={{
                    color: isComplete ? '#8f8' : '#888',
                    fontSize: '10px',
                  }}
                >
                  {progress.currentCount}/{quest.targetCount}
                </span>
              </div>

              {/* Progress bar */}
              {!isComplete && (
                <div
                  style={{
                    height: '3px',
                    backgroundColor: '#333',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '2px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: '#4a9eff',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quest completion check */}
            {isComplete && !progress.isRewarded && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '4px',
                  backgroundColor: 'rgba(76, 175, 80, 0.3)',
                  borderRadius: '3px',
                  textAlign: 'center',
                  color: '#8f8',
                  fontSize: '10px',
                }}
              >
                완료 가능 - NPC에게 보고
              </div>
            )}
          </div>
        );
      })}

      {/* More quests indicator */}
      {totalActive > 3 && (
        <div
          style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '10px',
            marginTop: '4px',
          }}
        >
          +{totalActive - 3}개 더...
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
const QuestTracker = memo(QuestTrackerComponent);
export { QuestTracker };
export default QuestTracker;
