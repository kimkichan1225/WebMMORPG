import { usePlayerStore, JOB_REQUIREMENTS, JOB_BONUS_STATS } from '../stores/playerStore';
import type { JobType } from '../stores/playerStore';
import { drawWeapon, JOB_WEAPONS } from '../game/weapons';
import { useRef, useEffect } from 'react';

const JOBS: { type: JobType; name: string; nameKo: string }[] = [
  { type: 'Warrior', name: 'Warrior', nameKo: '전사' },
  { type: 'Archer', name: 'Archer', nameKo: '궁수' },
  { type: 'Mage', name: 'Mage', nameKo: '마법사' },
  { type: 'Thief', name: 'Thief', nameKo: '도적' },
];

function WeaponPreview({ job }: { job: JobType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const weapon = JOB_WEAPONS[job];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 60, 60);
    if (weapon) {
      drawWeapon(ctx, weapon, 30, 35, 0, 0.6);
    }
  }, [weapon]);

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={60}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

interface JobChangeUIProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JobChangeUI({ isOpen, onClose }: JobChangeUIProps) {
  const { level, str, dex, int, luk, job, tryChangeJob } = usePlayerStore();

  if (!isOpen) return null;

  const checkRequirements = (jobType: JobType) => {
    const req = JOB_REQUIREMENTS[jobType];
    if (!req) return { canChange: false, missingReqs: [] };

    const missingReqs: string[] = [];

    if (level < req.level) {
      missingReqs.push(`레벨 ${req.level} 필요 (현재: ${level})`);
    }
    if (req.str && str < req.str) {
      missingReqs.push(`STR ${req.str} 필요 (현재: ${str})`);
    }
    if (req.dex && dex < req.dex) {
      missingReqs.push(`DEX ${req.dex} 필요 (현재: ${dex})`);
    }
    if (req.int && int < req.int) {
      missingReqs.push(`INT ${req.int} 필요 (현재: ${int})`);
    }
    if (req.luk && luk < req.luk) {
      missingReqs.push(`LUK ${req.luk} 필요 (현재: ${luk})`);
    }

    return {
      canChange: missingReqs.length === 0,
      missingReqs,
    };
  };

  const handleJobChange = (jobType: JobType) => {
    const success = tryChangeJob(jobType);
    if (success) {
      onClose();
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
        border: '2px solid #444',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '500px',
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
          전직
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

      {/* Current Job */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <span style={{ color: '#aaa' }}>현재 직업: </span>
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{job}</span>
      </div>

      {/* Job List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
        }}
      >
        {JOBS.map((j) => {
          const { canChange, missingReqs } = checkRequirements(j.type);
          const isCurrentJob = job === j.type;
          const bonusStats = JOB_BONUS_STATS[j.type];
          const req = JOB_REQUIREMENTS[j.type];

          return (
            <div
              key={j.type}
              style={{
                backgroundColor: isCurrentJob ? '#3a3a6a' : '#2a2a4a',
                border: `2px solid ${isCurrentJob ? '#FFD700' : canChange ? '#4CAF50' : '#444'}`,
                borderRadius: '10px',
                padding: '15px',
                opacity: isCurrentJob ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <WeaponPreview job={j.type} />
                <div style={{ marginLeft: '10px' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>{j.nameKo}</h3>
                  <span style={{ color: '#888', fontSize: '12px' }}>{j.name}</span>
                </div>
              </div>

              {/* Requirements */}
              <div
                style={{
                  backgroundColor: '#222',
                  padding: '8px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  fontSize: '12px',
                }}
              >
                <p style={{ color: '#aaa', margin: '0 0 5px' }}>요구 조건:</p>
                {req && (
                  <div style={{ color: '#ccc' }}>
                    <span style={{ color: level >= req.level ? '#4CAF50' : '#F44336' }}>
                      Lv.{req.level}
                    </span>
                    {req.str && (
                      <span style={{ color: str >= req.str ? '#4CAF50' : '#F44336', marginLeft: '8px' }}>
                        STR {req.str}
                      </span>
                    )}
                    {req.dex && (
                      <span style={{ color: dex >= req.dex ? '#4CAF50' : '#F44336', marginLeft: '8px' }}>
                        DEX {req.dex}
                      </span>
                    )}
                    {req.int && (
                      <span style={{ color: int >= req.int ? '#4CAF50' : '#F44336', marginLeft: '8px' }}>
                        INT {req.int}
                      </span>
                    )}
                    {req.luk && (
                      <span style={{ color: luk >= req.luk ? '#4CAF50' : '#F44336', marginLeft: '8px' }}>
                        LUK {req.luk}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bonus Stats */}
              <div
                style={{
                  backgroundColor: '#222',
                  padding: '8px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  fontSize: '12px',
                }}
              >
                <p style={{ color: '#aaa', margin: '0 0 5px' }}>보너스 스탯:</p>
                <div style={{ color: '#4CAF50' }}>
                  {Object.entries(bonusStats).map(([stat, value]) => (
                    <span key={stat} style={{ marginRight: '8px' }}>
                      {stat.toUpperCase()} +{value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Change Button */}
              {isCurrentJob ? (
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: '#555',
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: '#aaa',
                  }}
                >
                  현재 직업
                </div>
              ) : (
                <button
                  onClick={() => handleJobChange(j.type)}
                  disabled={!canChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: canChange ? '#4CAF50' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: canChange ? 'pointer' : 'not-allowed',
                  }}
                >
                  {canChange ? '전직하기' : '조건 미달'}
                </button>
              )}

              {/* Missing Requirements */}
              {!canChange && !isCurrentJob && missingReqs.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#F44336' }}>
                  {missingReqs.map((req, i) => (
                    <p key={i} style={{ margin: '2px 0' }}>
                      - {req}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#4a2a2a',
          borderRadius: '6px',
          color: '#F44336',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        사망 시 스탯이 감소하면 직업 조건 미달로 Base로 돌아갈 수 있습니다!
      </div>
    </div>
  );
}
