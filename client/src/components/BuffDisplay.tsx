import { useState, useEffect } from 'react';
import { useEquipmentStore, type ActiveBuff } from '../stores/equipmentStore';

export function BuffDisplay() {
  const activeBuffs = useEquipmentStore((state) => state.activeBuffs);
  const [, forceUpdate] = useState(0);

  // Force update every second to show countdown
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (activeBuffs.length === 0) return null;

  const now = Date.now();

  const getBuffIcon = (type: 'attack' | 'defense') => {
    return type === 'attack' ? '⚔️' : '🛡️';
  };

  const getBuffColor = (type: 'attack' | 'defense') => {
    return type === 'attack' ? '#FF6B6B' : '#4ECDC4';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      zIndex: 100,
    }}>
      {activeBuffs.map((buff, index) => {
        const remainingTime = buff.endTime - now;
        if (remainingTime <= 0) return null;

        const percentage = buff.value * 100;
        const isExpiringSoon = remainingTime < 10000;

        return (
          <div
            key={`${buff.type}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: `linear-gradient(135deg, ${getBuffColor(buff.type)}22, ${getBuffColor(buff.type)}44)`,
              border: `2px solid ${getBuffColor(buff.type)}`,
              borderRadius: '8px',
              padding: '6px 12px',
              boxShadow: `0 0 10px ${getBuffColor(buff.type)}66`,
              animation: isExpiringSoon ? 'buffBlink 0.5s infinite' : undefined,
            }}
          >
            <span style={{ fontSize: '20px' }}>{getBuffIcon(buff.type)}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                color: getBuffColor(buff.type),
                fontWeight: 'bold',
                fontSize: '12px',
              }}>
                {buff.type === 'attack' ? '공격력' : '방어력'} +{percentage}%
              </span>
              <span style={{
                color: isExpiringSoon ? '#FF4444' : '#FFFFFF',
                fontSize: '11px',
                fontWeight: isExpiringSoon ? 'bold' : 'normal',
              }}>
                {formatTime(remainingTime)}
              </span>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes buffBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
