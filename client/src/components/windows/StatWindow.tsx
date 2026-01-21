import { usePlayerStore } from '../../stores/playerStore';
import { useLifeSkillStore, SKILL_INFO, type LifeSkillType } from '../../stores/lifeSkillStore';
import type { StatType } from '@shared/types';

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
    getDisplayAttackPower,
    getExpNeeded,
  } = usePlayerStore();

  const { skills } = useLifeSkillStore();

  if (!isOpen) return null;

  const expNeeded = getExpNeeded();
  const expProgress = (exp / expNeeded) * 100;
  const calculatedAttack = getDisplayAttackPower();

  const SKILL_ICONS: Record<LifeSkillType, string> = {
    logging: '🪓',
    mining: '⛏️',
    gathering: '🌾',
  };

  const SKILL_COLORS: Record<LifeSkillType, string> = {
    logging: '#8B4513',
    mining: '#708090',
    gathering: '#228B22',
  };

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
        padding: '16px',
        width: '420px',
        zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #333',
        }}
      >
        <h2 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
          캐릭터 정보
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '11px' }}>Tab으로 닫기</span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Top Section: Basic Info + HP/MP */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        {/* Left: Job/Level/EXP */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#2a2a4a',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px' }}>{job}</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>Lv.{level}</span>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '11px' }}>
              <span>EXP</span>
              <span>{exp}/{expNeeded}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px', marginTop: '2px' }}>
              <div style={{ width: `${expProgress}%`, height: '100%', backgroundColor: '#FFD700', borderRadius: '3px' }} />
            </div>
          </div>
        </div>

        {/* Right: HP/MP */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#2a2a4a',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c', fontSize: '11px' }}>
              <span>HP</span>
              <span>{hp}/{maxHp}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px', marginTop: '2px' }}>
              <div style={{ width: `${(hp / maxHp) * 100}%`, height: '100%', backgroundColor: '#e74c3c', borderRadius: '3px' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3498db', fontSize: '11px' }}>
              <span>MP</span>
              <span>{mp}/{maxMp}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px', marginTop: '2px' }}>
              <div style={{ width: `${(mp / maxMp) * 100}%`, height: '100%', backgroundColor: '#3498db', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Combat Stats */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: '#3a2a2a',
            padding: '8px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#f88', fontSize: '12px' }}>공격력</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{calculatedAttack}</span>
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: '#2a3a2a',
            padding: '8px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#8f8', fontSize: '12px' }}>방어력</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{Math.floor(vit * 0.5)}</span>
        </div>
      </div>

      {/* Stat Points Available */}
      {statPoints > 0 && (
        <div
          style={{
            backgroundColor: '#4CAF50',
            padding: '6px 12px',
            borderRadius: '6px',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
            스탯 포인트: {statPoints}
          </span>
        </div>
      )}

      {/* Stats Grid - 2 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        <StatBox name="STR" value={str} desc="근접 공격력" canAllocate={statPoints > 0} onAllocate={() => allocateStat('str')} color="#f66" />
        <StatBox name="DEX" value={dex} desc="원거리/회피" canAllocate={statPoints > 0} onAllocate={() => allocateStat('dex')} color="#6f6" />
        <StatBox name="INT" value={int} desc="마법 공격력" canAllocate={statPoints > 0} onAllocate={() => allocateStat('int')} color="#66f" />
        <StatBox name="VIT" value={vit} desc="HP/방어력" canAllocate={statPoints > 0} onAllocate={() => allocateStat('vit')} color="#fa0" />
        <StatBox name="LUK" value={luk} desc="크리티컬" canAllocate={statPoints > 0} onAllocate={() => allocateStat('luk')} color="#f6f" />

        {/* Life Skills in the grid */}
        <div
          style={{
            backgroundColor: '#2a2a4a',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>생활 스킬</span>
          {Object.values(skills).map((skill) => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px' }}>{SKILL_ICONS[skill.id]}</span>
              <span style={{ color: '#aaa', fontSize: '10px', flex: 1 }}>{SKILL_INFO[skill.id].nameKo}</span>
              <span style={{ color: SKILL_COLORS[skill.id], fontSize: '11px', fontWeight: 'bold' }}>Lv.{skill.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  name: string;
  value: number;
  desc: string;
  canAllocate: boolean;
  onAllocate: () => void;
  color: string;
}

function StatBox({ name, value, desc, canAllocate, onAllocate, color }: StatBoxProps) {
  return (
    <div
      style={{
        backgroundColor: '#2a2a4a',
        padding: '8px 10px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ color: color, fontWeight: 'bold', fontSize: '13px' }}>{name}</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{value}</span>
        </div>
        <span style={{ color: '#666', fontSize: '10px' }}>{desc}</span>
      </div>
      <button
        onClick={onAllocate}
        disabled={!canAllocate}
        style={{
          width: '22px',
          height: '22px',
          backgroundColor: canAllocate ? '#4CAF50' : '#333',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: canAllocate ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        +
      </button>
    </div>
  );
}
