import React from 'react';
import { useMatchStore, MatchMode, MATCH_MODE_INFO } from '../../stores/matchStore';

interface MatchLobbyProps {
  onBack: () => void;
}

export const MatchLobby: React.FC<MatchLobbyProps> = ({ onBack }) => {
  const {
    selectedMode,
    selectedTeamSize,
    isSearching,
    currentRoom,
    matchState,
    setSelectedMode,
    setSelectedTeamSize,
    createRoom,
    startSearching,
    stopSearching,
    leaveRoom,
    toggleReady,
    startMatch
  } = useMatchStore();

  const modes: MatchMode[] = ['deathmatch', 'capture', 'boss_raid'];

  const handleStartSearch = () => {
    if (isSearching) {
      stopSearching();
    } else {
      startSearching();
    }
  };

  // Room view
  if (currentRoom && matchState !== 'lobby') {
    const isHost = currentRoom.players.find(p => p.isHost)?.id === 'local'; // Replace with actual check
    const allReady = currentRoom.players.every(p => p.isReady || p.isHost);
    const hasEnoughPlayers = currentRoom.players.length >= currentRoom.teamSize * 2;

    return (
      <div className="match-room">
        <div className="room-header">
          <h2>{MATCH_MODE_INFO[currentRoom.mode].name} ({currentRoom.teamSize}v{currentRoom.teamSize})</h2>
          <button className="leave-btn" onClick={leaveRoom}>나가기</button>
        </div>

        <div className="teams-container">
          {/* Red Team */}
          <div className="team red-team">
            <h3>레드 팀</h3>
            <div className="team-players">
              {currentRoom.players
                .filter(p => p.team === 'red')
                .map(player => (
                  <div key={player.id} className={`player-slot ${player.isReady ? 'ready' : ''}`}>
                    <span className="player-name">{player.name}</span>
                    <span className="player-job">{player.job}</span>
                    {player.isHost && <span className="host-badge">방장</span>}
                    {player.isReady && <span className="ready-badge">준비</span>}
                  </div>
                ))}
              {Array.from({ length: currentRoom.teamSize - currentRoom.players.filter(p => p.team === 'red').length }).map((_, i) => (
                <div key={`empty-red-${i}`} className="player-slot empty">
                  대기 중...
                </div>
              ))}
            </div>
          </div>

          {/* VS */}
          <div className="vs-divider">VS</div>

          {/* Blue Team */}
          <div className="team blue-team">
            <h3>블루 팀</h3>
            <div className="team-players">
              {currentRoom.players
                .filter(p => p.team === 'blue')
                .map(player => (
                  <div key={player.id} className={`player-slot ${player.isReady ? 'ready' : ''}`}>
                    <span className="player-name">{player.name}</span>
                    <span className="player-job">{player.job}</span>
                    {player.isHost && <span className="host-badge">방장</span>}
                    {player.isReady && <span className="ready-badge">준비</span>}
                  </div>
                ))}
              {Array.from({ length: currentRoom.teamSize - currentRoom.players.filter(p => p.team === 'blue').length }).map((_, i) => (
                <div key={`empty-blue-${i}`} className="player-slot empty">
                  대기 중...
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="room-actions">
          {isHost ? (
            <button
              className="start-btn"
              onClick={startMatch}
              disabled={!allReady || !hasEnoughPlayers}
            >
              게임 시작
            </button>
          ) : (
            <button className="ready-btn" onClick={toggleReady}>
              준비 {currentRoom.players.find(p => p.id === 'local')?.isReady ? '취소' : '완료'}
            </button>
          )}
        </div>

        <style>{roomStyles}</style>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="match-lobby">
      <div className="lobby-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>매칭 게임</h1>
      </div>

      <div className="lobby-content">
        {/* Mode Selection */}
        <div className="section">
          <h3>게임 모드</h3>
          <div className="mode-options">
            {modes.map(mode => (
              <div
                key={mode}
                className={`mode-card ${selectedMode === mode ? 'selected' : ''}`}
                onClick={() => setSelectedMode(mode)}
              >
                <h4>{MATCH_MODE_INFO[mode].name}</h4>
                <p>
                  {mode === 'deathmatch' && '상대 팀을 섬멸하세요!'}
                  {mode === 'capture' && '거점을 점령하고 지키세요!'}
                  {mode === 'boss_raid' && '협력하여 보스를 처치하세요!'}
                </p>
                <div className="mode-stats">
                  <span>승리 조건: {MATCH_MODE_INFO[mode].winCondition} {mode === 'deathmatch' ? '킬' : mode === 'capture' ? '점수' : '보스'}</span>
                  <span>제한 시간: {MATCH_MODE_INFO[mode].maxTime / 60}분</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Size */}
        <div className="section">
          <h3>팀 규모</h3>
          <div className="team-size-options">
            <button
              className={selectedTeamSize === 3 ? 'selected' : ''}
              onClick={() => setSelectedTeamSize(3)}
            >
              3 vs 3
            </button>
            <button
              className={selectedTeamSize === 5 ? 'selected' : ''}
              onClick={() => setSelectedTeamSize(5)}
            >
              5 vs 5
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="section actions">
          <button className="create-room-btn" onClick={createRoom}>
            방 만들기
          </button>
          <button
            className={`search-btn ${isSearching ? 'searching' : ''}`}
            onClick={handleStartSearch}
          >
            {isSearching ? '매칭 취소' : '빠른 매칭'}
          </button>
        </div>

        {isSearching && (
          <div className="searching-overlay">
            <div className="searching-content">
              <div className="spinner"></div>
              <p>매칭 중...</p>
              <p className="mode-info">{MATCH_MODE_INFO[selectedMode].name} {selectedTeamSize}v{selectedTeamSize}</p>
              <button onClick={stopSearching}>취소</button>
            </div>
          </div>
        )}
      </div>

      <style>{lobbyStyles}</style>
    </div>
  );
};

const lobbyStyles = `
  .match-lobby {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: white;
    padding: 40px;
    box-sizing: border-box;
  }

  .lobby-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
  }

  .back-btn {
    padding: 10px 20px;
    background: rgba(100, 100, 100, 0.4);
    border: none;
    border-radius: 6px;
    color: #aaa;
    cursor: pointer;
  }

  .lobby-header h1 {
    margin: 0;
    font-size: 32px;
  }

  .lobby-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .section {
    margin-bottom: 30px;
  }

  .section h3 {
    color: #aaa;
    font-size: 14px;
    margin-bottom: 15px;
  }

  .mode-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .mode-card {
    background: rgba(40, 40, 60, 0.6);
    border: 2px solid #4a4a6a;
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-card:hover {
    background: rgba(50, 50, 80, 0.6);
  }

  .mode-card.selected {
    border-color: #6a9aca;
    background: rgba(60, 80, 120, 0.6);
  }

  .mode-card h4 {
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  .mode-card p {
    color: #aaa;
    font-size: 13px;
    margin: 0 0 15px 0;
  }

  .mode-stats {
    font-size: 11px;
    color: #888;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .team-size-options {
    display: flex;
    gap: 15px;
  }

  .team-size-options button {
    flex: 1;
    padding: 15px;
    background: rgba(40, 40, 60, 0.6);
    border: 2px solid #4a4a6a;
    border-radius: 8px;
    color: #aaa;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .team-size-options button.selected {
    border-color: #6a9aca;
    background: rgba(60, 80, 120, 0.6);
    color: white;
  }

  .actions {
    display: flex;
    gap: 15px;
  }

  .create-room-btn, .search-btn {
    flex: 1;
    padding: 18px;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
  }

  .create-room-btn {
    background: linear-gradient(180deg, #4a6a8a, #3a5a7a);
    color: white;
  }

  .search-btn {
    background: linear-gradient(180deg, #4a9a6a, #3a8a5a);
    color: white;
  }

  .search-btn.searching {
    background: linear-gradient(180deg, #9a6a4a, #8a5a3a);
  }

  .searching-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .searching-content {
    text-align: center;
  }

  .searching-content .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(100, 200, 255, 0.3);
    border-top-color: #6ac;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .searching-content p {
    font-size: 20px;
    margin: 10px 0;
  }

  .searching-content .mode-info {
    color: #888;
    font-size: 14px;
  }

  .searching-content button {
    margin-top: 20px;
    padding: 10px 30px;
    background: #654;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const roomStyles = `
  .match-room {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: white;
    padding: 40px;
    box-sizing: border-box;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .room-header h2 {
    margin: 0;
  }

  .leave-btn {
    padding: 10px 20px;
    background: #654;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
  }

  .teams-container {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 30px;
    margin-bottom: 30px;
  }

  .team {
    flex: 1;
    max-width: 300px;
    background: rgba(40, 40, 60, 0.6);
    border-radius: 10px;
    padding: 20px;
  }

  .red-team {
    border: 2px solid #c44;
  }

  .red-team h3 {
    color: #f66;
  }

  .blue-team {
    border: 2px solid #44c;
  }

  .blue-team h3 {
    color: #66f;
  }

  .team h3 {
    text-align: center;
    margin: 0 0 15px 0;
  }

  .team-players {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .player-slot {
    padding: 12px;
    background: rgba(30, 30, 50, 0.6);
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .player-slot.empty {
    color: #666;
    justify-content: center;
  }

  .player-slot.ready {
    background: rgba(50, 80, 50, 0.6);
  }

  .player-name {
    font-weight: bold;
  }

  .player-job {
    color: #888;
    font-size: 12px;
  }

  .host-badge, .ready-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: auto;
  }

  .host-badge {
    background: #864;
    color: #fda;
  }

  .ready-badge {
    background: #486;
    color: #afa;
  }

  .vs-divider {
    display: flex;
    align-items: center;
    font-size: 32px;
    font-weight: bold;
    color: #666;
  }

  .room-actions {
    text-align: center;
  }

  .start-btn, .ready-btn {
    padding: 15px 50px;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
  }

  .start-btn {
    background: linear-gradient(180deg, #4a9a6a, #3a8a5a);
    color: white;
  }

  .start-btn:disabled {
    background: #444;
    cursor: not-allowed;
  }

  .ready-btn {
    background: linear-gradient(180deg, #4a6a8a, #3a5a7a);
    color: white;
  }
`;
