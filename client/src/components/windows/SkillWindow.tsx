import React from 'react';
import { useSkillStore, Skill } from '../../stores/skillStore';
import { usePlayerStore } from '../../stores/playerStore';

interface SkillWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillWindow: React.FC<SkillWindowProps> = ({ isOpen, onClose }) => {
  const { allSkills, learnedSkills, skillSlots, learnSkill, assignSkillToSlot, getCooldownRemaining, isSkillReady } = useSkillStore();
  const { job, level } = usePlayerStore();

  if (!isOpen) return null;

  const availableSkills = Object.values(allSkills).filter(skill => {
    const jobMatch = skill.job.includes(job) || skill.job.includes('Base');
    return jobMatch;
  });

  const handleLearnSkill = (skillId: string) => {
    const success = learnSkill(skillId);
    if (!success) {
      console.log('Failed to learn skill');
    }
  };

  const handleAssignToSlot = (skillId: string, slotIndex: number) => {
    assignSkillToSlot(skillId, slotIndex);
  };

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return 'Ready';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="skill-window">
      <div className="window-header">
        <h3>스킬 (Skills)</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="window-content">
        {/* Skill Slots (Hotbar) */}
        <div className="skill-slots">
          <h4>스킬 슬롯</h4>
          <div className="slots-row">
            {skillSlots.map((slot, index) => {
              const skill = slot.skillId ? allSkills[slot.skillId] : null;
              const cooldown = slot.skillId ? getCooldownRemaining(slot.skillId) : 0;

              return (
                <div key={index} className={`skill-slot ${skill ? 'filled' : 'empty'}`}>
                  <span className="slot-key">{slot.key}</span>
                  {skill && (
                    <>
                      <span className="skill-name">{skill.nameKo}</span>
                      {cooldown > 0 && (
                        <span className="cooldown">{formatCooldown(cooldown)}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Skills */}
        <div className="skill-list">
          <h4>사용 가능한 스킬</h4>
          {availableSkills.map(skill => {
            const isLearned = learnedSkills.includes(skill.id);
            const canLearn = level >= skill.unlockLevel;
            const assignedSlot = skillSlots.findIndex(s => s.skillId === skill.id);

            return (
              <div key={skill.id} className={`skill-item ${isLearned ? 'learned' : ''} ${!canLearn ? 'locked' : ''}`}>
                <div className="skill-info">
                  <div className="skill-header">
                    <span className="skill-name">{skill.nameKo}</span>
                    <span className="skill-type">{skill.type === 'buff' ? '버프' : '액티브'}</span>
                  </div>
                  <p className="skill-desc">{skill.description}</p>
                  <div className="skill-stats">
                    <span>MP: {skill.mpCost}</span>
                    <span>쿨타임: {skill.cooldown / 1000}초</span>
                    <span>레벨: {skill.unlockLevel}</span>
                    {skill.damage && <span>데미지: {skill.damage * 100}%</span>}
                    {skill.range && <span>사거리: {skill.range}</span>}
                  </div>
                </div>
                <div className="skill-actions">
                  {!isLearned && canLearn && (
                    <button onClick={() => handleLearnSkill(skill.id)}>배우기</button>
                  )}
                  {!isLearned && !canLearn && (
                    <span className="level-req">Lv.{skill.unlockLevel} 필요</span>
                  )}
                  {isLearned && (
                    <div className="assign-buttons">
                      {skillSlots.map((_, i) => (
                        <button
                          key={i}
                          className={assignedSlot === i ? 'active' : ''}
                          onClick={() => handleAssignToSlot(skill.id, i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .skill-window {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 30, 0.95);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          min-width: 400px;
          max-width: 500px;
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
          overflow-y: auto;
          max-height: calc(80vh - 50px);
        }

        .skill-slots {
          margin-bottom: 20px;
        }

        .skill-slots h4, .skill-list h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #aaa;
        }

        .slots-row {
          display: flex;
          gap: 8px;
        }

        .skill-slot {
          width: 60px;
          height: 60px;
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .skill-slot.filled {
          background: rgba(60, 60, 100, 0.6);
        }

        .skill-slot .slot-key {
          position: absolute;
          top: 2px;
          left: 4px;
          font-size: 10px;
          color: #888;
        }

        .skill-slot .skill-name {
          font-size: 10px;
          text-align: center;
        }

        .skill-slot .cooldown {
          font-size: 10px;
          color: #f44;
        }

        .skill-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skill-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .skill-item.learned {
          border-color: #4a8;
        }

        .skill-item.locked {
          opacity: 0.5;
        }

        .skill-info {
          flex: 1;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .skill-header .skill-name {
          font-weight: bold;
        }

        .skill-header .skill-type {
          font-size: 12px;
          color: #aaa;
        }

        .skill-desc {
          font-size: 12px;
          color: #ccc;
          margin: 5px 0;
        }

        .skill-stats {
          display: flex;
          gap: 10px;
          font-size: 11px;
          color: #888;
        }

        .skill-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
        }

        .skill-actions button {
          padding: 5px 10px;
          background: #4a6;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .skill-actions button:hover {
          background: #5b7;
        }

        .assign-buttons {
          display: flex;
          gap: 2px;
        }

        .assign-buttons button {
          padding: 4px 8px;
          background: #444;
          font-size: 11px;
        }

        .assign-buttons button.active {
          background: #4a6;
        }

        .level-req {
          font-size: 11px;
          color: #f88;
        }
      `}</style>
    </div>
  );
};
