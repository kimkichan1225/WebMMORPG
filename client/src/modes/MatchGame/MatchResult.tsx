import React from 'react';
import { useMatchStore, TeamColor } from '../../stores/matchStore';

interface MatchResultProps {
  winner: TeamColor | 'draw';
  onReturn: () => void;
}

export const MatchResult: React.FC<MatchResultProps> = ({ winner, onReturn }) => {
  const { currentRoom } = useMatchStore();

  if (!currentRoom) return null;

  const sortedPlayers = [...currentRoom.players].sort((a, b) => b.score - a.score);
  const mvp = sortedPlayers[0];

  const getResultText = () => {
    if (winner === 'draw') return '무승부!';
    return winner === 'red' ? '레드 팀 승리!' : '블루 팀 승리!';
  };

  const getResultColor = () => {
    if (winner === 'draw') return '#fff';
    return winner === 'red' ? '#f66' : '#66f';
  };

  return (
    <div className="match-result">
      <div className="result-content">
        <h1 style={{ color: getResultColor() }}>{getResultText()}</h1>

        <div className="final-score">
          <span className="red">{currentRoom.redTeamScore}</span>
          <span className="vs">-</span>
          <span className="blue">{currentRoom.blueTeamScore}</span>
        </div>

        {mvp && (
          <div className="mvp">
            <span className="label">MVP</span>
            <span className="name">{mvp.name}</span>
            <span className="stats">{mvp.kills} Kills / {mvp.deaths} Deaths</span>
          </div>
        )}

        <div className="scoreboard">
          <h3>스코어보드</h3>
          <div className="player-list">
            <div className="header">
              <span>팀</span>
              <span>이름</span>
              <span>K/D/S</span>
            </div>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`player-row ${player.team}`}
              >
                <span className={`team-indicator ${player.team}`}>
                  {player.team === 'red' ? 'R' : 'B'}
                </span>
                <span className="name">
                  {index === 0 && '👑 '}
                  {player.name}
                </span>
                <span className="kds">
                  {player.kills}/{player.deaths}/{player.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="return-btn" onClick={onReturn}>
          로비로 돌아가기
        </button>
      </div>

      <style>{`
        .match-result {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }

        .result-content {
          text-align: center;
          max-width: 500px;
          padding: 40px;
        }

        .result-content h1 {
          font-size: 48px;
          margin: 0 0 20px 0;
          text-shadow: 0 0 30px currentColor;
        }

        .final-score {
          font-size: 60px;
          font-weight: bold;
          margin-bottom: 30px;
        }

        .final-score .red {
          color: #f66;
        }

        .final-score .vs {
          color: #888;
          margin: 0 20px;
        }

        .final-score .blue {
          color: #66f;
        }

        .mvp {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 200, 0, 0.1));
          border: 2px solid #ffd700;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }

        .mvp .label {
          display: block;
          font-size: 14px;
          color: #ffd700;
          margin-bottom: 5px;
        }

        .mvp .name {
          display: block;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .mvp .stats {
          font-size: 14px;
          color: #aaa;
        }

        .scoreboard {
          background: rgba(30, 30, 50, 0.8);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .scoreboard h3 {
          margin: 0 0 15px 0;
          color: #aaa;
        }

        .player-list {
          text-align: left;
        }

        .header, .player-row {
          display: grid;
          grid-template-columns: 40px 1fr 80px;
          padding: 8px;
          font-size: 14px;
        }

        .header {
          color: #888;
          border-bottom: 1px solid #4a4a6a;
        }

        .player-row {
          border-radius: 4px;
        }

        .player-row.red {
          background: rgba(150, 50, 50, 0.2);
        }

        .player-row.blue {
          background: rgba(50, 50, 150, 0.2);
        }

        .team-indicator {
          font-weight: bold;
          font-size: 12px;
        }

        .team-indicator.red {
          color: #f66;
        }

        .team-indicator.blue {
          color: #66f;
        }

        .kds {
          text-align: right;
          color: #aaa;
        }

        .return-btn {
          padding: 15px 40px;
          background: linear-gradient(180deg, #4a6a8a, #3a5a7a);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }

        .return-btn:hover {
          background: linear-gradient(180deg, #5a7a9a, #4a6a8a);
        }
      `}</style>
    </div>
  );
};
