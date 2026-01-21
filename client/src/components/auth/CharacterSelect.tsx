import React, { useState } from 'react';
import { useAuthStore, CharacterData } from '../../stores/authStore';

interface CharacterSelectProps {
  onStartGame: () => void;
}

type BaseJobType = 'Base' | 'Warrior' | 'Archer' | 'Mage' | 'Thief';

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onStartGame }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharJob, setNewCharJob] = useState<BaseJobType>('Base');

  const {
    characters,
    selectedCharacter,
    isLoading,
    error,
    signOut,
    createCharacter,
    selectCharacter,
    deleteCharacter,
    clearError
  } = useAuthStore();

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (newCharName.trim().length < 2) {
      return;
    }

    const success = await createCharacter(newCharName.trim(), newCharJob);
    if (success) {
      setIsCreating(false);
      setNewCharName('');
      setNewCharJob('Base');
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (confirm('정말 이 캐릭터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await deleteCharacter(charId);
    }
  };

  const handleStartGame = async () => {
    if (selectedCharacter) {
      onStartGame();
    }
  };

  // All jobs info including 2nd jobs
  const allJobInfo: Record<string, { name: string; color: string; desc: string }> = {
    // Base
    Base: { name: '초보자', color: '#aaa', desc: 'Lv.10에 전직 가능' },
    // 1st jobs
    Warrior: { name: '전사', color: '#e74c3c', desc: '높은 HP와 공격력' },
    Archer: { name: '궁수', color: '#2ecc71', desc: '원거리 공격 특화' },
    Mage: { name: '마법사', color: '#3498db', desc: '강력한 마법 공격' },
    Thief: { name: '도적', color: '#9b59b6', desc: '빠른 속도와 치명타' },
    // 2nd jobs - Warrior branch
    Swordsman: { name: '소드맨', color: '#c0392b', desc: '검술 마스터' },
    Mace: { name: '메이스', color: '#7f8c8d', desc: '둔기 전문가' },
    Polearm: { name: '폴암', color: '#d35400', desc: '창술 달인' },
    // 2nd jobs - Archer branch
    Gunner: { name: '거너', color: '#1abc9c', desc: '화약 무기 전문가' },
    Bowmaster: { name: '보우마스터', color: '#27ae60', desc: '명궁' },
    Crossbowman: { name: '석궁병', color: '#16a085', desc: '석궁 저격수' },
    // 2nd jobs - Mage branch
    Elemental: { name: '엘리멘탈', color: '#e67e22', desc: '원소 마법사' },
    Holy: { name: '홀리', color: '#f1c40f', desc: '신성 마법사' },
    Dark: { name: '다크', color: '#8e44ad', desc: '암흑 마법사' },
    // 2nd jobs - Thief branch
    Fighter: { name: '파이터', color: '#e91e63', desc: '격투가' },
    Dagger: { name: '대거', color: '#673ab7', desc: '쌍단검 암살자' },
    Shuriken: { name: '슈리켄', color: '#3f51b5', desc: '표창 닌자' },
  };

  // Only base jobs for creation
  const createableJobs: BaseJobType[] = ['Base', 'Warrior', 'Archer', 'Mage', 'Thief'];
  const jobInfo: Record<BaseJobType, { name: string; color: string; desc: string }> = {
    Base: allJobInfo.Base,
    Warrior: allJobInfo.Warrior,
    Archer: allJobInfo.Archer,
    Mage: allJobInfo.Mage,
    Thief: allJobInfo.Thief,
  };

  return (
    <div className="character-select-screen">
      <div className="screen-header">
        <h1>캐릭터 선택</h1>
        <button className="logout-btn" onClick={signOut}>로그아웃</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="character-list">
        {characters.map(char => (
          <div
            key={char.id}
            className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
            onClick={() => selectCharacter(char.id)}
          >
            <div className="char-avatar" style={{ borderColor: allJobInfo[char.job]?.color || '#aaa' }}>
              <span className="job-icon">{char.job.charAt(0)}</span>
            </div>
            <div className="char-info">
              <span className="char-name">{char.name}</span>
              <span className="char-job" style={{ color: allJobInfo[char.job]?.color }}>
                {allJobInfo[char.job]?.name || char.job}
              </span>
              <span className="char-level">Lv. {char.level}</span>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); handleDeleteCharacter(char.id); }}
            >
              삭제
            </button>
          </div>
        ))}

        {characters.length < 3 && !isCreating && (
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            + 새 캐릭터 생성
          </button>
        )}
      </div>

      {/* Character Creation Form */}
      {isCreating && (
        <div className="create-form-overlay">
          <form className="create-form" onSubmit={handleCreateCharacter}>
            <h2>새 캐릭터 생성</h2>

            <div className="form-group">
              <label>캐릭터 이름</label>
              <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="2자 이상"
                maxLength={12}
                required
              />
            </div>

            <div className="form-group">
              <label>직업 선택</label>
              <div className="job-options">
                {createableJobs.map(job => (
                  <div
                    key={job}
                    className={`job-option ${newCharJob === job ? 'selected' : ''}`}
                    onClick={() => setNewCharJob(job)}
                    style={{ borderColor: newCharJob === job ? jobInfo[job].color : '#4a4a6a' }}
                  >
                    <span className="job-name" style={{ color: jobInfo[job].color }}>
                      {jobInfo[job].name}
                    </span>
                    <span className="job-desc">{jobInfo[job].desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>
                취소
              </button>
              <button type="submit" className="confirm-btn" disabled={isLoading}>
                {isLoading ? '생성 중...' : '생성'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Start Game Button */}
      {selectedCharacter && !isCreating && (
        <div className="start-section">
          <p>선택된 캐릭터: <strong>{selectedCharacter.name}</strong></p>
          <button className="start-btn" onClick={handleStartGame}>
            게임 시작
          </button>
        </div>
      )}

      <style>{`
        .character-select-screen {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          box-sizing: border-box;
          color: white;
        }

        .screen-header {
          width: 100%;
          max-width: 600px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .screen-header h1 {
          margin: 0;
          font-size: 32px;
        }

        .logout-btn {
          padding: 8px 16px;
          background: rgba(100, 100, 100, 0.4);
          border: 1px solid #666;
          border-radius: 6px;
          color: #aaa;
          cursor: pointer;
        }

        .logout-btn:hover {
          background: rgba(100, 100, 100, 0.6);
        }

        .error-message {
          background: rgba(200, 50, 50, 0.3);
          border: 1px solid #c33;
          padding: 10px 20px;
          border-radius: 6px;
          color: #faa;
          margin-bottom: 20px;
        }

        .character-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
          max-width: 500px;
        }

        .character-card {
          background: rgba(40, 40, 60, 0.8);
          border: 2px solid #4a4a6a;
          border-radius: 10px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .character-card:hover {
          background: rgba(50, 50, 80, 0.8);
        }

        .character-card.selected {
          border-color: #6a9aca;
          background: rgba(60, 80, 120, 0.6);
        }

        .char-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid #aaa;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 30, 50, 0.8);
        }

        .job-icon {
          font-size: 24px;
          font-weight: bold;
        }

        .char-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .char-name {
          font-size: 18px;
          font-weight: bold;
        }

        .char-job {
          font-size: 14px;
        }

        .char-level {
          font-size: 12px;
          color: #888;
        }

        .delete-btn {
          padding: 6px 12px;
          background: rgba(150, 50, 50, 0.4);
          border: 1px solid #a55;
          border-radius: 4px;
          color: #faa;
          cursor: pointer;
          font-size: 12px;
        }

        .delete-btn:hover {
          background: rgba(150, 50, 50, 0.6);
        }

        .create-btn {
          padding: 20px;
          background: rgba(60, 60, 100, 0.4);
          border: 2px dashed #6a6a9a;
          border-radius: 10px;
          color: #8a8aba;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .create-btn:hover {
          background: rgba(70, 70, 120, 0.4);
          border-color: #8a8aca;
        }

        .create-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .create-form {
          background: rgba(30, 30, 50, 0.95);
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #4a4a6a;
          min-width: 400px;
        }

        .create-form h2 {
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #aaa;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          background: rgba(20, 20, 40, 0.8);
          border: 1px solid #4a4a6a;
          border-radius: 6px;
          color: #fff;
          font-size: 16px;
          box-sizing: border-box;
        }

        .job-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .job-option {
          padding: 12px;
          background: rgba(40, 40, 60, 0.6);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .job-option:hover {
          background: rgba(50, 50, 80, 0.6);
        }

        .job-option.selected {
          background: rgba(60, 80, 100, 0.6);
        }

        .job-name {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .job-desc {
          font-size: 11px;
          color: #888;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .cancel-btn, .confirm-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-btn {
          background: rgba(100, 100, 100, 0.4);
          color: #aaa;
        }

        .confirm-btn {
          background: linear-gradient(180deg, #4a8a6a, #3a7a5a);
          color: white;
        }

        .confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .start-section {
          margin-top: 30px;
          text-align: center;
        }

        .start-section p {
          color: #aaa;
          margin-bottom: 15px;
        }

        .start-section strong {
          color: #6a9aca;
        }

        .start-btn {
          padding: 15px 50px;
          background: linear-gradient(180deg, #4a9a6a, #3a8a5a);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .start-btn:hover {
          background: linear-gradient(180deg, #5aaa7a, #4a9a6a);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};
