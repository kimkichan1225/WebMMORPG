import React from 'react';
import { useMultiplayerStore, OtherPlayer } from '../../stores/multiplayerStore';

interface PlayerListProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ isOpen, onToggle }) => {
  const { otherPlayers, isConnected } = useMultiplayerStore();

  const players = Array.from(otherPlayers.values());

  const jobColors: Record<string, string> = {
    Base: '#aaa',
    Warrior: '#e74c3c',
    Archer: '#2ecc71',
    Mage: '#3498db',
    Thief: '#9b59b6'
  };

  return (
    <div className={`player-list ${isOpen ? 'open' : 'minimized'}`}>
      <div className="list-header" onClick={onToggle}>
        <span>접속자 ({players.length})</span>
        <button className="toggle-btn">{isOpen ? '▼' : '▲'}</button>
      </div>

      {isOpen && (
        <div className="players">
          {!isConnected ? (
            <p className="empty-msg">서버에 연결되지 않음</p>
          ) : players.length === 0 ? (
            <p className="empty-msg">다른 플레이어 없음</p>
          ) : (
            players.map((player) => (
              <div key={player.id} className="player-item">
                <div className="player-info">
                  <span
                    className="player-name"
                    style={{ color: jobColors[player.job] || '#aaa' }}
                  >
                    {player.name}
                  </span>
                  <span className="player-level">Lv.{player.level}</span>
                </div>
                <div className="player-hp">
                  <div
                    className="hp-bar"
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .player-list {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 200px;
          background: rgba(20, 20, 30, 0.9);
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          z-index: 500;
          color: white;
          font-size: 13px;
        }

        .player-list.minimized {
          width: 120px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(40, 40, 60, 0.8);
          border-bottom: 1px solid #3a3a5a;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
        }

        .player-list.minimized .list-header {
          border-radius: 8px;
          border-bottom: none;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 10px;
          padding: 2px 5px;
        }

        .players {
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-msg {
          color: #666;
          text-align: center;
          font-size: 12px;
          padding: 20px 0;
          margin: 0;
        }

        .player-item {
          padding: 8px;
          background: rgba(40, 40, 60, 0.4);
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .player-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .player-name {
          font-weight: bold;
        }

        .player-level {
          color: #888;
          font-size: 11px;
        }

        .player-hp {
          height: 4px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 2px;
          overflow: hidden;
        }

        .hp-bar {
          height: 100%;
          background: linear-gradient(90deg, #4a6, #6c8);
          transition: width 0.3s;
        }
      `}</style>
    </div>
  );
};
