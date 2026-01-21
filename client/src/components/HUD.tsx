import { usePlayerStore } from '../stores/playerStore';

export function HUD() {
  const { hp, maxHp, mp, maxMp, level, exp, job, tool, getExpNeeded, isDashing, dashCooldown } = usePlayerStore();

  const expNeeded = getExpNeeded();
  const expProgress = (exp / expNeeded) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '12px',
        borderRadius: '8px',
        minWidth: '180px',
      }}
    >
      {/* Level & Job */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px' }}>
          Lv. {level}
        </span>
        <span style={{ color: '#aaa', fontSize: '12px' }}>{job}</span>
      </div>

      {/* HP Bar */}
      <div style={{ marginBottom: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            fontSize: '11px',
            marginBottom: '2px',
          }}
        >
          <span>HP</span>
          <span>
            {hp}/{maxHp}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '14px',
            backgroundColor: '#333',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(hp / maxHp) * 100}%`,
              height: '100%',
              backgroundColor: hp / maxHp > 0.3 ? '#e74c3c' : '#ff4444',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* MP Bar */}
      <div style={{ marginBottom: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            fontSize: '11px',
            marginBottom: '2px',
          }}
        >
          <span>MP</span>
          <span>
            {mp}/{maxMp}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '14px',
            backgroundColor: '#333',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(mp / maxMp) * 100}%`,
              height: '100%',
              backgroundColor: '#3498db',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* EXP Bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            fontSize: '11px',
            marginBottom: '2px',
          }}
        >
          <span>EXP</span>
          <span>
            {exp}/{expNeeded}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#333',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${expProgress}%`,
              height: '100%',
              backgroundColor: '#FFD700',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Current Tool */}
      {tool && (
        <div
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#2a2a4a',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#aaa', fontSize: '11px' }}>도구: </span>
          <span style={{ color: '#fff', fontSize: '12px' }}>
            {tool === 'axe' ? '도끼' : tool === 'pickaxe' ? '곡괭이' : '낫'}
          </span>
        </div>
      )}

      {/* Dash indicator */}
      <div
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          backgroundColor: isDashing ? '#4a6' : dashCooldown > 0 ? '#444' : '#2a4a6a',
          borderRadius: '4px',
          textAlign: 'center',
          transition: 'background-color 0.2s',
        }}
      >
        <span style={{ color: '#fff', fontSize: '11px' }}>
          {isDashing ? '대시중!' : dashCooldown > 0 ? `대시 (${Math.ceil(dashCooldown / 100) / 10}s)` : 'Shift: 대시'}
        </span>
      </div>
    </div>
  );
}
