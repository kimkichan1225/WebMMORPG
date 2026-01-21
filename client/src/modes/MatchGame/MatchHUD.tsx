import React from 'react';
import { useMatchStore } from '../../stores/matchStore';

export const MatchHUD: React.FC = () => {
  const { currentRoom } = useMatchStore();

  if (!currentRoom) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const redTeamPlayers = currentRoom.players.filter(p => p.team === 'red');
  const blueTeamPlayers = currentRoom.players.filter(p => p.team === 'blue');

  return (
    <div className="match-hud">
      {/* Timer */}
      <div className="timer">
        <span>{formatTime(currentRoom.timeRemaining)}</span>
      </div>

      {/* Score Board */}
      <div className="score-board">
        <div className="team-score red">
          <span className="score">{currentRoom.redTeamScore}</span>
          <span className="label">RED</span>
        </div>
        <div className="vs">VS</div>
        <div className="team-score blue">
          <span className="score">{currentRoom.blueTeamScore}</span>
          <span className="label">BLUE</span>
        </div>
      </div>

      {/* Kill Feed */}
      <div className="kill-feed">
        {/* Kill messages would appear here */}
      </div>

      {/* Team Stats */}
      <div className="team-stats">
        <div className="red-stats">
          {redTeamPlayers.map(p => (
            <div key={p.id} className="player-stat">
              <span className="name">{p.name}</span>
              <span className="kd">{p.kills}/{p.deaths}</span>
            </div>
          ))}
        </div>
        <div className="blue-stats">
          {blueTeamPlayers.map(p => (
            <div key={p.id} className="player-stat">
              <span className="name">{p.name}</span>
              <span className="kd">{p.kills}/{p.deaths}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .match-hud {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 100;
        }

        .timer {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 25px;
          border-radius: 8px;
          font-size: 28px;
          font-weight: bold;
          color: #fff;
        }

        .score-board {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.6);
          padding: 10px 20px;
          border-radius: 8px;
        }

        .team-score {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .team-score .score {
          font-size: 36px;
          font-weight: bold;
        }

        .team-score .label {
          font-size: 12px;
          opacity: 0.7;
        }

        .team-score.red .score {
          color: #f66;
        }

        .team-score.blue .score {
          color: #66f;
        }

        .vs {
          font-size: 18px;
          color: #888;
        }

        .kill-feed {
          position: absolute;
          top: 150px;
          right: 20px;
          width: 250px;
        }

        .team-stats {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 40px;
          background: rgba(0, 0, 0, 0.6);
          padding: 10px 20px;
          border-radius: 8px;
        }

        .red-stats, .blue-stats {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .red-stats {
          border-right: 2px solid #f66;
          padding-right: 20px;
        }

        .blue-stats {
          border-left: 2px solid #66f;
          padding-left: 20px;
        }

        .player-stat {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          font-size: 12px;
        }

        .red-stats .name {
          color: #faa;
        }

        .blue-stats .name {
          color: #aaf;
        }

        .kd {
          color: #aaa;
        }
      `}</style>
    </div>
  );
};
