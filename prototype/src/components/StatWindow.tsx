import { usePlayerStore } from '../stores/playerStore';
import type { StatType } from '../stores/playerStore';

interface StatRowProps {
  name: string;
  stat: StatType;
  value: number;
  canAllocate: boolean;
  onAllocate: () => void;
}

function StatRow({ name, value, canAllocate, onAllocate }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #333',
      }}
    >
      <span style={{ color: '#aaa', width: '60px' }}>{name}</span>
      <span style={{ color: '#fff', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>
        {value}
      </span>
      <button
        onClick={onAllocate}
        disabled={!canAllocate}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: canAllocate ? '#4CAF50' : '#333',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: canAllocate ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        +
      </button>
    </div>
  );
}

interface StatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatWindow({ isOpen, onClose }: StatWindowProps) {
  const {
    level,
    exp,
    hp,
    maxHp,
    mp,
    maxMp,
    str,
    dex,
    int,
    vit,
    luk,
    statPoints,
    job,
    allocateStat,
  } = usePlayerStore();

  if (!isOpen) return null;

  const expNeeded = level * 100;
  const expProgress = (exp / expNeeded) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1a2e',
        border: '2px solid #444',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '280px',
        zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <h2 style={{ color: '#fff', margin: 0, fontFamily: 'Arial, sans-serif' }}>
          스탯 창
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

      {/* Basic Info */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
          <span>직업: {job}</span>
          <span>Lv. {level}</span>
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '12px' }}>
            <span>EXP</span>
            <span>{exp} / {expNeeded}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              marginTop: '2px',
            }}
          >
            <div
              style={{
                width: `${expProgress}%`,
                height: '100%',
                backgroundColor: '#FFD700',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      </div>

      {/* HP/MP */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c', fontSize: '12px' }}>
            <span>HP</span>
            <span>{hp} / {maxHp}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#333',
              borderRadius: '3px',
              marginTop: '2px',
            }}
          >
            <div
              style={{
                width: `${(hp / maxHp) * 100}%`,
                height: '100%',
                backgroundColor: '#e74c3c',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3498db', fontSize: '12px' }}>
            <span>MP</span>
            <span>{mp} / {maxMp}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#333',
              borderRadius: '3px',
              marginTop: '2px',
            }}
          >
            <div
              style={{
                width: `${(mp / maxMp) * 100}%`,
                height: '100%',
                backgroundColor: '#3498db',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Stat Points */}
      <div
        style={{
          backgroundColor: '#4CAF50',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '15px',
          textAlign: 'center',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 'bold' }}>
          사용 가능 포인트: {statPoints}
        </span>
      </div>

      {/* Stats */}
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <StatRow
          name="STR"
          stat="str"
          value={str}
          canAllocate={statPoints > 0}
          onAllocate={() => allocateStat('str')}
        />
        <StatRow
          name="DEX"
          stat="dex"
          value={dex}
          canAllocate={statPoints > 0}
          onAllocate={() => allocateStat('dex')}
        />
        <StatRow
          name="INT"
          stat="int"
          value={int}
          canAllocate={statPoints > 0}
          onAllocate={() => allocateStat('int')}
        />
        <StatRow
          name="VIT"
          stat="vit"
          value={vit}
          canAllocate={statPoints > 0}
          onAllocate={() => allocateStat('vit')}
        />
        <StatRow
          name="LUK"
          stat="luk"
          value={luk}
          canAllocate={statPoints > 0}
          onAllocate={() => allocateStat('luk')}
        />
      </div>

      {/* Stat Descriptions */}
      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#222',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#666',
        }}
      >
        <p style={{ margin: '2px 0' }}>STR - 전사 공격력</p>
        <p style={{ margin: '2px 0' }}>DEX - 궁수/도적 공격력</p>
        <p style={{ margin: '2px 0' }}>INT - 마법사 공격력, MP 증가</p>
        <p style={{ margin: '2px 0' }}>VIT - HP 증가, 방어력</p>
        <p style={{ margin: '2px 0' }}>LUK - 크리티컬 확률</p>
      </div>
    </div>
  );
}
