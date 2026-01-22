import { useEffect, useCallback } from 'react';
import { useFishingStore, getFishData } from '../../stores/fishingStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useLifeSkillStore } from '../../stores/lifeSkillStore';
import { FISH_DATA, type FishRarity } from '../../game/systems/FishingSystem';

// Fishing mini-game overlay
export function FishingGameOverlay() {
  const {
    state,
    targetFish,
    castTimer,
    biteWindow,
    reelProgress,
    fishSize,
    perfectCatch,
    onBiteReact,
    onReelClick,
    collectFish,
    cancelFishing,
    fishingLevel,
    fishingExp,
    fishingExpToNextLevel,
  } = useFishingStore();
  const { gainGold, gainExp } = usePlayerStore();

  const handleClick = useCallback(() => {
    if (state === 'bite') {
      onBiteReact();
    } else if (state === 'reeling') {
      onReelClick();
    } else if (state === 'caught') {
      const result = collectFish();
      if (result) {
        gainGold(result.price);
        gainExp(result.exp);
        // Add life skill exp for fishing
        useLifeSkillStore.getState().gainSkillExp('fishing', result.exp);
      }
    }
  }, [state, onBiteReact, onReelClick, collectFish, gainGold, gainExp]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        handleClick();
      } else if (e.code === 'Escape') {
        cancelFishing();
      }
    },
    [handleClick, cancelFishing]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (state === 'idle' || state === 'failed') return null;

  const getRarityColor = (rarity: FishRarity) => {
    switch (rarity) {
      case 'common':
        return '#AAAAAA';
      case 'uncommon':
        return '#55FF55';
      case 'rare':
        return '#5555FF';
      case 'legendary':
        return '#FFD700';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '150px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(20, 30, 50, 0.95)',
        border: '3px solid #4FC3F7',
        borderRadius: '15px',
        padding: '20px',
        minWidth: '300px',
        textAlign: 'center',
        zIndex: 60,
        cursor: state === 'bite' || state === 'reeling' || state === 'caught' ? 'pointer' : 'default',
        boxShadow: state === 'bite' ? '0 0 30px rgba(255, 0, 0, 0.8)' : '0 5px 25px rgba(0,0,0,0.5)',
        animation: state === 'bite' ? 'biteFlash 0.3s infinite' : 'none',
      }}
    >
      {/* Fishing level indicator */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: '10px',
          backgroundColor: '#4FC3F7',
          padding: '2px 10px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#000',
        }}
      >
        낚시 Lv.{fishingLevel}
      </div>

      {/* State display */}
      {state === 'casting' && (
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎣</div>
          <p style={{ color: '#4FC3F7', fontSize: '16px', margin: 0 }}>캐스팅 중...</p>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              marginTop: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${100 - (castTimer / 1000) * 100}%`,
                backgroundColor: '#4FC3F7',
                transition: 'width 0.1s',
              }}
            />
          </div>
        </div>
      )}

      {state === 'waiting' && (
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🐟</div>
          <p style={{ color: '#88AACC', fontSize: '16px', margin: 0 }}>물고기를 기다리는 중...</p>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
            입질이 오면 스페이스 또는 클릭!
          </p>
        </div>
      )}

      {state === 'bite' && (
        <div>
          <div style={{ fontSize: '32px', marginBottom: '10px', animation: 'bounce 0.2s infinite' }}>
            ‼️
          </div>
          <p style={{ color: '#FF4444', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            입질이다!
          </p>
          <p style={{ color: '#FFF', fontSize: '14px', marginTop: '5px' }}>
            지금 클릭하세요!
          </p>
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#333',
              borderRadius: '5px',
              marginTop: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(biteWindow / 1500) * 100}%`,
                backgroundColor: '#FF4444',
                transition: 'width 0.1s',
              }}
            />
          </div>
        </div>
      )}

      {state === 'reeling' && (
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎣💨</div>
          <p style={{ color: '#FFD700', fontSize: '16px', margin: '0 0 10px' }}>
            연타로 끌어당기세요!
          </p>
          {/* Reel progress bar */}
          <div
            style={{
              width: '100%',
              height: '25px',
              backgroundColor: '#333',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${reelProgress}%`,
                background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
                transition: 'width 0.05s',
              }}
            />
            {/* Target line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#FFD700',
              }}
            />
            {/* Progress text */}
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
                fontWeight: 'bold',
                textShadow: '1px 1px 2px #000',
              }}
            >
              {Math.round(reelProgress)}%
            </div>
          </div>
          <p style={{ color: '#888', fontSize: '11px', marginTop: '5px' }}>
            스페이스 또는 클릭!
          </p>
        </div>
      )}

      {state === 'caught' && targetFish && (
        <div>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>
            {perfectCatch ? '🌟🐟🌟' : '🐟'}
          </div>
          {perfectCatch && (
            <p
              style={{
                color: '#FFD700',
                fontSize: '14px',
                margin: '0 0 5px',
                fontWeight: 'bold',
              }}
            >
              완벽한 캐치!
            </p>
          )}
          <p
            style={{
              color: getRarityColor(targetFish.rarity),
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {targetFish.nameKo}
          </p>
          <p style={{ color: '#AAA', fontSize: '14px', margin: '5px 0' }}>
            크기: {fishSize}cm
          </p>
          <p style={{ color: '#FFD700', fontSize: '16px', margin: '5px 0' }}>
            판매가: {Math.round(targetFish.basePrice * fishSize)} G
          </p>
          <button
            onClick={handleClick}
            style={{
              marginTop: '10px',
              padding: '10px 30px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '6px',
              color: '#FFF',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            수확하기
          </button>
        </div>
      )}

      {/* Cancel hint */}
      <p style={{ color: '#555', fontSize: '10px', marginTop: '15px' }}>ESC로 취소</p>
    </div>
  );
}

// Fishing collection/inventory window
interface FishingWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FishingWindow({ isOpen, onClose }: FishingWindowProps) {
  const {
    fishingLevel,
    fishingExp,
    fishingExpToNextLevel,
    caughtFish,
    totalFishCaught,
    largestFish,
    fishCollection,
    sellAllFish,
  } = useFishingStore();
  const { gainGold } = usePlayerStore();

  if (!isOpen) return null;

  const handleSellAll = () => {
    const gold = sellAllFish();
    if (gold > 0) {
      gainGold(gold);
    }
  };

  const getRarityColor = (rarity: FishRarity) => {
    switch (rarity) {
      case 'common':
        return '#AAAAAA';
      case 'uncommon':
        return '#55FF55';
      case 'rare':
        return '#5555FF';
      case 'legendary':
        return '#FFD700';
      default:
        return '#FFFFFF';
    }
  };

  // Calculate total value
  const totalValue = caughtFish.reduce((sum, entry) => {
    const fish = getFishData(entry.fishId);
    if (fish) {
      return sum + Math.round(fish.basePrice * entry.size);
    }
    return sum;
  }, 0);

  // Collection progress
  const totalFishTypes = Object.keys(FISH_DATA).length;
  const collectedTypes = fishCollection.size;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1a2e',
        border: '2px solid #4FC3F7',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '450px',
        maxWidth: '550px',
        maxHeight: '80vh',
        overflow: 'auto',
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
        <h2 style={{ color: '#4FC3F7', margin: 0 }}>🎣 낚시</h2>
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

      {/* Fishing Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        <div style={{ backgroundColor: '#2a2a4a', padding: '10px', borderRadius: '6px' }}>
          <div style={{ color: '#888', fontSize: '12px' }}>낚시 레벨</div>
          <div style={{ color: '#4FC3F7', fontSize: '20px', fontWeight: 'bold' }}>
            Lv.{fishingLevel}
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#333',
              borderRadius: '3px',
              marginTop: '5px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(fishingExp / fishingExpToNextLevel) * 100}%`,
                backgroundColor: '#4FC3F7',
                borderRadius: '3px',
              }}
            />
          </div>
          <div style={{ color: '#666', fontSize: '10px', marginTop: '3px' }}>
            {fishingExp} / {fishingExpToNextLevel} EXP
          </div>
        </div>

        <div style={{ backgroundColor: '#2a2a4a', padding: '10px', borderRadius: '6px' }}>
          <div style={{ color: '#888', fontSize: '12px' }}>총 낚은 물고기</div>
          <div style={{ color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
            {totalFishCaught}마리
          </div>
        </div>
      </div>

      {/* Collection Progress */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
        }}
      >
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>도감 수집</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
            {collectedTypes} / {totalFishTypes}
          </span>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {Math.round((collectedTypes / totalFishTypes) * 100)}% 완료
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#333',
            borderRadius: '4px',
            marginTop: '5px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(collectedTypes / totalFishTypes) * 100}%`,
              backgroundColor: '#FFD700',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Largest Fish */}
      {largestFish && (
        <div
          style={{
            backgroundColor: '#2a2a4a',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
          }}
        >
          <div style={{ color: '#888', fontSize: '12px' }}>최고 기록</div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🏆</span>
            <div>
              <span style={{ color: getRarityColor(largestFish.fish.rarity), fontWeight: 'bold' }}>
                {largestFish.fish.nameKo}
              </span>
              <span style={{ color: '#AAA', marginLeft: '10px' }}>{largestFish.size}cm</span>
            </div>
          </div>
        </div>
      )}

      {/* Caught Fish Inventory */}
      <div
        style={{
          backgroundColor: '#222',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ color: '#888' }}>보유 물고기 ({caughtFish.length})</span>
          {caughtFish.length > 0 && (
            <button
              onClick={handleSellAll}
              style={{
                padding: '5px 15px',
                backgroundColor: '#FFD700',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              전체 판매 ({totalValue} G)
            </button>
          )}
        </div>

        {caughtFish.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>
            보유한 물고기가 없습니다
          </p>
        ) : (
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {caughtFish.map((entry, index) => {
              const fish = getFishData(entry.fishId);
              if (!fish) return null;
              const price = Math.round(fish.basePrice * entry.size);

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: index % 2 === 0 ? '#2a2a3a' : '#252535',
                    borderRadius: '4px',
                    marginBottom: '2px',
                  }}
                >
                  <div>
                    <span style={{ color: getRarityColor(fish.rarity) }}>{fish.nameKo}</span>
                    <span style={{ color: '#888', marginLeft: '10px', fontSize: '12px' }}>
                      {entry.size}cm
                    </span>
                  </div>
                  <span style={{ color: '#FFD700', fontSize: '12px' }}>{price} G</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fish Collection Preview */}
      <div>
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>도감 미리보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {Object.values(FISH_DATA).map((fish) => {
            const isCollected = fishCollection.has(fish.id);
            return (
              <div
                key={fish.id}
                title={isCollected ? `${fish.nameKo} - ${fish.description}` : '???'}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: isCollected ? '#2a2a4a' : '#1a1a2a',
                  border: `2px solid ${isCollected ? getRarityColor(fish.rarity) : '#333'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  opacity: isCollected ? 1 : 0.3,
                }}
              >
                {isCollected ? '🐟' : '?'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// CSS animations
const styles = `
@keyframes biteFlash {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 0, 0, 1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
`;

if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('fishing-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'fishing-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}
