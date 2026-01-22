import React, { memo, useMemo } from 'react';
import { useGameTimeStore, getTimeOverlay } from '../stores/gameTimeStore';

const TIME_ICONS: Record<string, string> = {
  dawn: '🌅',
  day: '☀️',
  dusk: '🌇',
  night: '🌙',
};

const TIME_LABELS: Record<string, string> = {
  dawn: '새벽',
  day: '낮',
  dusk: '저녁',
  night: '밤',
};

interface DayNightOverlayProps {
  showClock?: boolean;
}

const DayNightOverlayComponent: React.FC<DayNightOverlayProps> = ({ showClock = true }) => {
  const gameTime = useGameTimeStore((state) => state.gameTime);

  // Memoize overlay calculation - only changes when timeOfDay or hour changes
  const overlay = useMemo(
    () => getTimeOverlay(gameTime.timeOfDay, gameTime.hour),
    [gameTime.timeOfDay, gameTime.hour]
  );

  // Format time as HH:MM
  const formattedTime = useMemo(
    () => `${gameTime.hour.toString().padStart(2, '0')}:${gameTime.minute.toString().padStart(2, '0')}`,
    [gameTime.hour, gameTime.minute]
  );

  return (
    <>
      {/* Overlay effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlay.color,
          pointerEvents: 'none',
          transition: 'background-color 2s ease',
          zIndex: 50,
        }}
      />

      {/* Clock display */}
      {showClock && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(20, 20, 30, 0.7)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid #4a4a6a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 100,
          }}
        >
          {/* Time icon */}
          <span style={{ fontSize: '14px' }}>
            {TIME_ICONS[gameTime.timeOfDay]}
          </span>

          {/* Time text */}
          <span
            style={{
              color: '#fff',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            {formattedTime}
          </span>

          {/* Time of day label */}
          <span
            style={{
              color: '#888',
              fontSize: '11px',
            }}
          >
            {TIME_LABELS[gameTime.timeOfDay]}
          </span>

          {/* Day number */}
          <span
            style={{
              color: '#666',
              fontSize: '10px',
              marginLeft: '4px',
            }}
          >
            Day {gameTime.dayNumber}
          </span>
        </div>
      )}
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export const DayNightOverlay = memo(DayNightOverlayComponent);
export default DayNightOverlay;
