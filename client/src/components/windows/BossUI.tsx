import { useEffect, useState } from 'react';
import { useBossStore, BOSS_INFO } from '../../stores/bossStore';

export function BossAnnouncementBanner() {
  const { announcements, clearOldAnnouncements } = useBossStore();
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      clearOldAnnouncements();
    }, 1000);
    return () => clearInterval(interval);
  }, [clearOldAnnouncements]);

  useEffect(() => {
    // Show new announcements with animation
    const newIds = announcements
      .filter((a) => Date.now() - a.timestamp < 5000)
      .map((a) => a.id);
    setVisibleAnnouncements(newIds);
  }, [announcements]);

  const recentAnnouncements = announcements.filter(
    (a) => Date.now() - a.timestamp < 5000
  );

  if (recentAnnouncements.length === 0) return null;

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case 'spawn':
        return { backgroundColor: 'rgba(138, 43, 226, 0.9)', borderColor: '#9932CC' };
      case 'enrage':
        return { backgroundColor: 'rgba(220, 20, 60, 0.9)', borderColor: '#FF4444' };
      case 'kill':
        return { backgroundColor: 'rgba(34, 139, 34, 0.9)', borderColor: '#4CAF50' };
      case 'special_attack':
        return { backgroundColor: 'rgba(255, 140, 0, 0.9)', borderColor: '#FF8C00' };
      default:
        return { backgroundColor: 'rgba(60, 60, 80, 0.9)', borderColor: '#666' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {recentAnnouncements.map((announcement) => {
        const style = getAnnouncementStyle(announcement.type);
        const opacity = Math.max(0, 1 - (Date.now() - announcement.timestamp) / 5000);

        return (
          <div
            key={announcement.id}
            style={{
              ...style,
              padding: '12px 30px',
              borderRadius: '8px',
              border: `2px solid ${style.borderColor}`,
              color: '#FFF',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              textAlign: 'center',
              opacity,
              animation: 'slideDown 0.3s ease-out',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {announcement.type === 'spawn' && '⚔️ '}
            {announcement.type === 'enrage' && '🔥 '}
            {announcement.type === 'kill' && '🏆 '}
            {announcement.type === 'special_attack' && '💥 '}
            {announcement.message}
          </div>
        );
      })}
    </div>
  );
}

interface BossHPBarProps {
  bossType: string;
  hp: number;
  maxHp: number;
  isEnraged: boolean;
}

export function BossHPBar({ bossType, hp, maxHp, isEnraged }: BossHPBarProps) {
  const info = BOSS_INFO[bossType];
  if (!info) return null;

  const hpPercent = (hp / maxHp) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        zIndex: 45,
      }}
    >
      {/* Boss Name */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '5px',
        }}
      >
        <span
          style={{
            color: isEnraged ? '#FF4444' : '#FFD700',
            fontSize: '20px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {isEnraged && '🔥 '}
          {info.nameKo}
          {isEnraged && ' 🔥'}
        </span>
      </div>

      {/* HP Bar Container */}
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '10px',
          padding: '5px',
          border: isEnraged ? '3px solid #FF4444' : '2px solid #FFD700',
          boxShadow: isEnraged
            ? '0 0 20px rgba(255, 68, 68, 0.5)'
            : '0 0 10px rgba(255, 215, 0, 0.3)',
        }}
      >
        {/* HP Bar Background */}
        <div
          style={{
            backgroundColor: '#333',
            borderRadius: '6px',
            height: '25px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* HP Bar Fill */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${hpPercent}%`,
              background: isEnraged
                ? 'linear-gradient(to right, #FF4444, #FF8800)'
                : hpPercent > 50
                  ? 'linear-gradient(to right, #4CAF50, #8BC34A)'
                  : hpPercent > 25
                    ? 'linear-gradient(to right, #FF9800, #FFC107)'
                    : 'linear-gradient(to right, #F44336, #FF5722)',
              borderRadius: '6px',
              transition: 'width 0.3s ease-out',
              boxShadow: isEnraged ? '0 0 10px rgba(255, 68, 68, 0.8)' : 'none',
            }}
          />

          {/* HP Text */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {Math.ceil(hp).toLocaleString()} / {maxHp.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Enrage indicator */}
      {isEnraged && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '5px',
            color: '#FF4444',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: 'pulse 1s infinite',
          }}
        >
          분노 상태 - 공격력 50% 증가!
        </div>
      )}
    </div>
  );
}

interface BossInfoPanelProps {
  bossType: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BossInfoPanel({ bossType, isOpen, onClose }: BossInfoPanelProps) {
  const { bossKills } = useBossStore();
  const info = BOSS_INFO[bossType];

  if (!isOpen || !info) return null;

  const kills = bossKills[bossType] || 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return '#5555FF';
      case 'epic': return '#AA00FF';
      case 'legendary': return '#FF8800';
      default: return '#FFFFFF';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1a2e',
        border: '2px solid #FFD700',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '500px',
        zIndex: 100,
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          borderBottom: '1px solid #444',
          paddingBottom: '10px',
        }}
      >
        <h2 style={{ color: '#FFD700', margin: 0 }}>
          👑 {info.nameKo}
        </h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          X
        </button>
      </div>

      {/* Description */}
      <p style={{ color: '#aaa', marginBottom: '15px', lineHeight: '1.5' }}>
        {info.description}
      </p>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        <div style={{ backgroundColor: '#2a2a4a', padding: '10px', borderRadius: '6px' }}>
          <div style={{ color: '#888', fontSize: '12px' }}>권장 레벨</div>
          <div style={{ color: '#FFF', fontSize: '16px', fontWeight: 'bold' }}>
            Lv.{info.recommendedLevel}+
          </div>
        </div>
        <div style={{ backgroundColor: '#2a2a4a', padding: '10px', borderRadius: '6px' }}>
          <div style={{ color: '#888', fontSize: '12px' }}>권장 인원</div>
          <div style={{ color: '#FFF', fontSize: '16px', fontWeight: 'bold' }}>
            {info.recommendedPartySize}인 이상
          </div>
        </div>
      </div>

      {/* Kill count */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          textAlign: 'center',
        }}
      >
        <span style={{ color: '#888' }}>처치 횟수: </span>
        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{kills}회</span>
      </div>

      {/* Loot Table */}
      <div>
        <h3 style={{ color: '#FFD700', fontSize: '14px', marginBottom: '10px' }}>
          드롭 아이템
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {info.loot.map((loot) => (
            <div
              key={loot.itemId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#222',
                padding: '8px 12px',
                borderRadius: '4px',
                borderLeft: `3px solid ${getRarityColor(loot.rarity)}`,
              }}
            >
              <span style={{ color: getRarityColor(loot.rarity) }}>
                {loot.nameKo}
              </span>
              <span style={{ color: '#888', fontSize: '12px' }}>
                {(loot.dropChance * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CSS animations (add to index.css or inline)
const styles = `
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
