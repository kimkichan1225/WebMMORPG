import { useEffect, useState } from 'react';
import {
  useEquipmentStore,
  ENHANCE_CONFIGS,
  getEnhanceColor,
  calculateEnhancedStats,
  getEnhancedDisplayName,
  TIER_COLORS,
  type EquipmentSlot,
  type EquipmentItem,
} from '../../stores/equipmentStore';
import { usePlayerStore } from '../../stores/playerStore';

interface EnhancementUIProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancementUI({ isOpen, onClose }: EnhancementUIProps) {
  const { equipped, enhanceResult, lastEnhancedItem, enhanceEquippedItem, clearEnhanceResult } =
    useEquipmentStore();
  const { gold } = usePlayerStore();
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (enhanceResult !== 'none') {
      setShowResult(true);
      const timer = setTimeout(() => {
        setShowResult(false);
        clearEnhanceResult();
        setIsEnhancing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [enhanceResult, clearEnhanceResult]);

  if (!isOpen) return null;

  const selectedItem = selectedSlot ? equipped[selectedSlot] : null;
  const nextLevel = selectedItem ? (selectedItem.enhanceLevel || 0) + 1 : 1;
  const enhanceConfig = nextLevel <= 10 ? ENHANCE_CONFIGS[nextLevel - 1] : null;
  const currentStats = selectedItem ? calculateEnhancedStats(selectedItem) : null;
  const previewStats = selectedItem && enhanceConfig
    ? calculateEnhancedStats({ ...selectedItem, enhanceLevel: nextLevel })
    : null;

  const handleEnhance = () => {
    if (!selectedSlot || !selectedItem || !enhanceConfig) return;
    if (gold < enhanceConfig.goldCost) return;
    if (nextLevel > 10) return;

    setIsEnhancing(true);
    enhanceEquippedItem(selectedSlot);
  };

  const getResultMessage = () => {
    switch (enhanceResult) {
      case 'success':
        return { message: '강화 성공!', color: '#4CAF50', icon: '🎉' };
      case 'fail':
        return { message: '강화 실패', color: '#FF9800', icon: '💫' };
      case 'downgrade':
        return { message: '강화 실패 - 등급 하락!', color: '#F44336', icon: '📉' };
      case 'destroy':
        return { message: '강화 실패 - 장비 파괴!', color: '#F44336', icon: '💥' };
      default:
        return null;
    }
  };

  const slotNames: Record<EquipmentSlot, string> = {
    weapon: '무기',
    head: '투구',
    body: '갑옷',
    accessory: '악세서리',
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
        minWidth: '500px',
        maxWidth: '600px',
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
        <h2 style={{ color: '#FFD700', margin: 0 }}>⚒️ 장비 강화</h2>
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

      {/* Gold display */}
      <div
        style={{
          textAlign: 'right',
          marginBottom: '15px',
          color: '#FFD700',
          fontWeight: 'bold',
        }}
      >
        보유 골드: {gold.toLocaleString()} G
      </div>

      {/* Equipment slots */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {(['weapon', 'head', 'body', 'accessory'] as EquipmentSlot[]).map((slot) => {
          const item = equipped[slot];
          const isSelected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => setSelectedSlot(item ? slot : null)}
              disabled={!item}
              style={{
                padding: '15px 10px',
                backgroundColor: isSelected ? '#3a3a6a' : '#2a2a4a',
                border: `2px solid ${isSelected ? '#FFD700' : item ? '#444' : '#333'}`,
                borderRadius: '8px',
                cursor: item ? 'pointer' : 'not-allowed',
                opacity: item ? 1 : 0.5,
              }}
            >
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>
                {slotNames[slot]}
              </div>
              {item ? (
                <>
                  <div
                    style={{
                      color: getEnhanceColor(item.enhanceLevel || 0),
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getEnhancedDisplayName(item)}
                  </div>
                  <div style={{ color: TIER_COLORS[item.tier], fontSize: '11px' }}>
                    [{item.tier}]
                  </div>
                </>
              ) : (
                <div style={{ color: '#555', fontSize: '12px' }}>비어있음</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected item detail */}
      {selectedItem && enhanceConfig ? (
        <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px' }}>
          {/* Item name */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '15px',
              borderBottom: '1px solid #333',
              paddingBottom: '10px',
            }}
          >
            <div
              style={{
                color: getEnhanceColor(selectedItem.enhanceLevel || 0),
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {getEnhancedDisplayName(selectedItem)}
            </div>
            <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
              +{selectedItem.enhanceLevel || 0} → +{nextLevel}
            </div>
          </div>

          {/* Stats comparison */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '10px',
              marginBottom: '15px',
            }}
          >
            {/* Current stats */}
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>현재</div>
              {currentStats &&
                Object.entries(currentStats).map(([stat, value]) => (
                  <div key={stat} style={{ color: '#AAA', fontSize: '12px' }}>
                    {stat.toUpperCase()}: {value}
                  </div>
                ))}
            </div>

            {/* Arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD700',
                fontSize: '20px',
              }}
            >
              →
            </div>

            {/* Preview stats */}
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>강화 후</div>
              {previewStats &&
                Object.entries(previewStats).map(([stat, value]) => {
                  const current = currentStats?.[stat as keyof typeof currentStats] || 0;
                  const diff = value - current;
                  return (
                    <div key={stat} style={{ color: '#4CAF50', fontSize: '12px' }}>
                      {stat.toUpperCase()}: {value}{' '}
                      {diff > 0 && <span style={{ color: '#8BC34A' }}>(+{diff})</span>}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Enhancement info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '15px',
            }}
          >
            <div style={{ backgroundColor: '#1a1a2e', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: '#888', fontSize: '11px' }}>성공 확률</div>
              <div
                style={{
                  color: enhanceConfig.successRate >= 50 ? '#4CAF50' : '#F44336',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {enhanceConfig.successRate}%
              </div>
            </div>
            <div style={{ backgroundColor: '#1a1a2e', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: '#888', fontSize: '11px' }}>비용</div>
              <div
                style={{
                  color: gold >= enhanceConfig.goldCost ? '#FFD700' : '#F44336',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {enhanceConfig.goldCost.toLocaleString()} G
              </div>
            </div>
          </div>

          {/* Warning */}
          {(enhanceConfig.destroyOnFail || enhanceConfig.downgradeOnFail) && (
            <div
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px',
                border: '1px solid #F44336',
              }}
            >
              <div style={{ color: '#F44336', fontSize: '12px', textAlign: 'center' }}>
                ⚠️ 경고: 실패 시{' '}
                {enhanceConfig.destroyOnFail ? '장비가 파괴됩니다!' : '등급이 하락합니다!'}
              </div>
            </div>
          )}

          {/* Enhance button */}
          <button
            onClick={handleEnhance}
            disabled={
              isEnhancing || gold < enhanceConfig.goldCost || nextLevel > 10
            }
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor:
                isEnhancing || gold < enhanceConfig.goldCost
                  ? '#333'
                  : '#FFD700',
              border: 'none',
              borderRadius: '8px',
              color: isEnhancing || gold < enhanceConfig.goldCost ? '#666' : '#000',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor:
                isEnhancing || gold < enhanceConfig.goldCost
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {isEnhancing ? '강화 중...' : gold < enhanceConfig.goldCost ? '골드 부족' : '강화하기'}
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#222',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          강화할 장비를 선택하세요
        </div>
      )}

      {/* Result overlay */}
      {showResult && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {(() => {
              const result = getResultMessage();
              if (!result) return null;
              return (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>{result.icon}</div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: result.color,
                    }}
                  >
                    {result.message}
                  </div>
                  {lastEnhancedItem && enhanceResult === 'success' && (
                    <div style={{ color: '#AAA', marginTop: '10px' }}>
                      {getEnhancedDisplayName(lastEnhancedItem)}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
