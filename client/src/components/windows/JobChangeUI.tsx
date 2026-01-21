import { usePlayerStore, JOB_REQUIREMENTS, JOB_BONUS_STATS, JOB_DESCRIPTIONS, is1stJob, getAvailable2ndJobs } from '../../stores/playerStore';
import type { JobType, Job1stType, Job2ndType } from '@shared/types';
import { drawWeapon, JOB_WEAPONS } from '../../game/weapons';
import { useRef, useEffect } from 'react';

const FIRST_JOBS: Job1stType[] = ['Warrior', 'Archer', 'Mage', 'Thief'];

function WeaponPreview({ job }: { job: JobType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const weapon = JOB_WEAPONS[job];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 80, 80);
    if (weapon) {
      // Larger scale for 2nd job weapons which tend to be bigger
      const scale = ['great_sword', 'battle_axe', 'arcane_staff', 'holy_staff', 'long_bow'].includes(weapon) ? 0.45 : 0.6;
      drawWeapon(ctx, weapon, 40, 50, 0, scale);
    }
  }, [weapon]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={80}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

interface JobChangeUIProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JobChangeUI({ isOpen, onClose }: JobChangeUIProps) {
  const { level, str, dex, int, vit, luk, job, tryChangeJob } = usePlayerStore();

  if (!isOpen) return null;

  // Determine which jobs to show based on current job
  const isBase = job === 'Base';
  const has1stJob = is1stJob(job);
  const available2ndJobs = has1stJob ? getAvailable2ndJobs(job) : [];

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
    if (req.vit && vit < req.vit) {
      missingReqs.push(`VIT ${req.vit} 필요 (현재: ${vit})`);
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

  const renderJobCard = (jobType: JobType) => {
    const { canChange, missingReqs } = checkRequirements(jobType);
    const isCurrentJob = job === jobType;
    const bonusStats = JOB_BONUS_STATS[jobType];
    const req = JOB_REQUIREMENTS[jobType];
    const desc = JOB_DESCRIPTIONS[jobType];

    return (
      <div
        key={jobType}
        style={{
          backgroundColor: isCurrentJob ? '#3a3a6a' : '#2a2a4a',
          border: `2px solid ${isCurrentJob ? '#FFD700' : canChange ? '#4CAF50' : '#444'}`,
          borderRadius: '10px',
          padding: '15px',
          opacity: isCurrentJob ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <WeaponPreview job={jobType} />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <h3 style={{ color: '#fff', margin: 0 }}>{desc.nameKo}</h3>
            <span style={{ color: '#888', fontSize: '12px' }}>{desc.name}</span>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 10px', lineHeight: '1.4' }}>
          {desc.description}
        </p>

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
            <div style={{ color: '#ccc', display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
              <span style={{ color: level >= req.level ? '#4CAF50' : '#F44336' }}>
                Lv.{req.level}
              </span>
              {req.str && (
                <span style={{ color: str >= req.str ? '#4CAF50' : '#F44336' }}>
                  STR {req.str}
                </span>
              )}
              {req.dex && (
                <span style={{ color: dex >= req.dex ? '#4CAF50' : '#F44336' }}>
                  DEX {req.dex}
                </span>
              )}
              {req.int && (
                <span style={{ color: int >= req.int ? '#4CAF50' : '#F44336' }}>
                  INT {req.int}
                </span>
              )}
              {req.vit && (
                <span style={{ color: vit >= req.vit ? '#4CAF50' : '#F44336' }}>
                  VIT {req.vit}
                </span>
              )}
              {req.luk && (
                <span style={{ color: luk >= req.luk ? '#4CAF50' : '#F44336' }}>
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
          <div style={{ color: '#4CAF50', display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {Object.entries(bonusStats).map(([stat, value]) => (
              <span key={stat}>
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
            onClick={() => handleJobChange(jobType)}
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
            {missingReqs.map((r, i) => (
              <p key={i} style={{ margin: '2px 0' }}>
                - {r}
              </p>
            ))}
          </div>
        )}
      </div>
    );
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
        minWidth: '550px',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
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
          {has1stJob ? '2차 전직' : '1차 전직'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '11px' }}>J로 닫기</span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Current Job */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#aaa' }}>현재 직업: </span>
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
            {JOB_DESCRIPTIONS[job as JobType].nameKo} ({job})
          </span>
        </div>
        <div style={{ color: '#aaa', fontSize: '12px' }}>
          Lv.{level}
        </div>
      </div>

      {/* Section title */}
      {has1stJob && (
        <div
          style={{
            backgroundColor: '#3a2a4a',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#FFD700' }}>
            {JOB_DESCRIPTIONS[job as JobType].nameKo}에서 전직 가능한 2차 직업
          </span>
        </div>
      )}

      {/* Job List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
        }}
      >
        {isBase && FIRST_JOBS.map((j) => renderJobCard(j))}
        {has1stJob && available2ndJobs.map((j) => renderJobCard(j))}
      </div>

      {/* Already has 2nd job message */}
      {!isBase && !has1stJob && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#aaa',
          }}
        >
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            이미 최고 등급의 직업입니다!
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>
            현재 직업: {JOB_DESCRIPTIONS[job as JobType].nameKo}
          </p>
        </div>
      )}

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
