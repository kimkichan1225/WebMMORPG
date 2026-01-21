import React, { useEffect, useState } from 'react';
import { useSkillStore, Skill } from '../stores/skillStore';
import { usePlayerStore } from '../stores/playerStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useEquipmentStore, ConsumableItem, TIER_COLORS } from '../stores/equipmentStore';

// Element colors for skill icons
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FF6B35',
  ice: '#5BC0EB',
  lightning: '#FFE66D',
  holy: '#FFD700',
  dark: '#9B5DE5',
  default: '#4ECDC4'
};

// Skill type colors
const TYPE_COLORS: Record<string, string> = {
  active: '#FF6B6B',
  buff: '#6BCB77'
};

// Potion effect colors
const POTION_COLORS: Record<string, string> = {
  heal: '#FF5555',
  mana: '#5555FF',
  buff_attack: '#FFAA00',
  buff_defense: '#00AAFF'
};

interface SkillBarProps {
  onUseSkill: (skillId: string) => void;
  onUseItem?: (itemId: string) => void;
}

const SkillBar: React.FC<SkillBarProps> = ({ onUseSkill, onUseItem }) => {
  const { skillSlots, allSkills, learnedSkills, getCooldownRemaining, isSkillReady, assignSkillToSlot, assignItemToSlot, clearSlot } = useSkillStore();
  const { mp, job, level } = usePlayerStore();
  const { items } = useInventoryStore();
  const { allItems, useConsumable } = useEquipmentStore();
  const [showSlotMenu, setShowSlotMenu] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'skills' | 'items'>('skills');
  const [, forceUpdate] = useState({});

  // Update cooldown display
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 100);
    return () => clearInterval(interval);
  }, []);

  // Handle skill slot click
  const handleSlotClick = (slotIndex: number, slot: { skillId: string | null; itemId: string | null }) => {
    if (slot.skillId) {
      // Use skill if assigned
      onUseSkill(slot.skillId);
    } else if (slot.itemId) {
      // Use consumable item
      const result = useConsumable(slot.itemId);
      if (result.success) {
        onUseItem?.(slot.itemId);
      }
    } else {
      // Open assignment menu
      setSelectedSlot(slotIndex);
      setShowSlotMenu(true);
    }
  };

  // Handle skill assignment
  const handleAssignSkill = (skillId: string) => {
    if (selectedSlot !== null) {
      assignSkillToSlot(skillId, selectedSlot);
      setShowSlotMenu(false);
      setSelectedSlot(null);
    }
  };

  // Handle item assignment
  const handleAssignItem = (itemId: string) => {
    if (selectedSlot !== null) {
      assignItemToSlot(itemId, selectedSlot);
      setShowSlotMenu(false);
      setSelectedSlot(null);
    }
  };

  // Get consumable items in inventory
  const getConsumableItems = (): { item: ConsumableItem; quantity: number }[] => {
    const consumableItems: { item: ConsumableItem; quantity: number }[] = [];
    items.forEach(invItem => {
      if (invItem.type === 'consumable') {
        const consumable = allItems.consumables[invItem.id];
        if (consumable) {
          consumableItems.push({ item: consumable, quantity: invItem.quantity });
        }
      }
    });
    return consumableItems;
  };

  // Get available skills for current job
  const getAvailableSkills = (): Skill[] => {
    return Object.values(allSkills).filter(skill => {
      const jobMatch = skill.job.includes(job) || skill.job.includes('Base');
      const levelMatch = level >= skill.unlockLevel;
      return jobMatch && levelMatch;
    });
  };

  // Render skill icon
  const renderSkillIcon = (skill: Skill, size: number = 40) => {
    const elementColor = skill.element ? ELEMENT_COLORS[skill.element] : ELEMENT_COLORS.default;
    const typeColor = TYPE_COLORS[skill.type];

    return (
      <div
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${elementColor}40, ${typeColor}40)`,
          border: `2px solid ${elementColor}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontWeight: 'bold',
          color: elementColor,
          textShadow: `0 0 5px ${elementColor}`
        }}
      >
        {skill.nameKo.charAt(0)}
      </div>
    );
  };

  // Render item icon
  const renderItemIcon = (item: ConsumableItem, size: number = 40, quantity?: number) => {
    const effectColor = POTION_COLORS[item.effect] || '#AAAAAA';
    const tierColor = TIER_COLORS[item.tier] || '#9d9d9d';

    return (
      <div
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${effectColor}60, ${effectColor}20)`,
          border: `2px solid ${tierColor}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.5,
          position: 'relative'
        }}
      >
        {/* Potion emoji based on effect */}
        {item.effect === 'heal' && '❤️'}
        {item.effect === 'mana' && '💧'}
        {item.effect === 'buff_attack' && '⚔️'}
        {item.effect === 'buff_defense' && '🛡️'}

        {/* Quantity badge */}
        {quantity !== undefined && quantity > 0 && (
          <div style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            background: '#333',
            color: '#FFF',
            fontSize: 9,
            padding: '1px 4px',
            borderRadius: 4,
            fontWeight: 'bold',
            minWidth: 14,
            textAlign: 'center'
          }}>
            {quantity}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8,
      padding: 12,
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 12,
      border: '2px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1000
    }}>
      {/* Skill/Item Slots */}
      {skillSlots.map((slot, index) => {
        const skill = slot.skillId ? allSkills[slot.skillId] : null;
        const item = slot.itemId ? allItems.consumables[slot.itemId] : null;
        const itemQuantity = slot.itemId ? items.find(i => i.id === slot.itemId)?.quantity || 0 : 0;
        const cooldownMs = slot.skillId ? getCooldownRemaining(slot.skillId) : 0;
        const cooldownSec = Math.ceil(cooldownMs / 1000);
        const isReady = slot.skillId ? isSkillReady(slot.skillId) : true;
        const canUseSkill = skill ? mp >= skill.mpCost && isReady : false;
        const canUseItem = item ? itemQuantity > 0 : false;
        const hasContent = skill || item;
        const canUse = skill ? canUseSkill : canUseItem;

        return (
          <div
            key={index}
            onClick={() => handleSlotClick(index, slot)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (hasContent) {
                // Clear slot on right-click
                clearSlot(index);
              } else {
                setSelectedSlot(index);
                setShowSlotMenu(true);
              }
            }}
            style={{
              width: 50,
              height: 50,
              background: hasContent
                ? canUse
                  ? 'rgba(60, 60, 80, 0.9)'
                  : 'rgba(40, 40, 50, 0.9)'
                : 'rgba(30, 30, 40, 0.9)',
              border: `2px solid ${hasContent ? (canUse ? '#4ECDC4' : '#666') : '#444'}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              opacity: canUse || !hasContent ? 1 : 0.6
            }}
          >
            {/* Skill Icon */}
            {skill && renderSkillIcon(skill, 40)}

            {/* Item Icon */}
            {item && renderItemIcon(item, 40, itemQuantity)}

            {/* Cooldown Overlay */}
            {cooldownMs > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                {cooldownSec}s
              </div>
            )}

            {/* MP Cost indicator (skills only) */}
            {skill && skill.mpCost > 0 && (
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: mp >= skill.mpCost ? '#4169E1' : '#8B0000',
                color: '#FFF',
                fontSize: 9,
                padding: '1px 3px',
                borderRadius: 4,
                fontWeight: 'bold'
              }}>
                {skill.mpCost}
              </div>
            )}

            {/* Key Binding */}
            <div style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#333',
              color: '#FFF',
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 4,
              fontWeight: 'bold'
            }}>
              {slot.key}
            </div>

            {/* Empty Slot Indicator */}
            {!hasContent && (
              <div style={{
                color: '#666',
                fontSize: 20
              }}>
                +
              </div>
            )}
          </div>
        );
      })}

      {/* Slot Menu Panel (Skills & Items) */}
      {showSlotMenu && (
        <div style={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 20, 30, 0.95)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 12,
          padding: 16,
          minWidth: 350,
          maxWidth: 450,
          maxHeight: 350,
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <h3 style={{ color: '#FFF', margin: 0, fontSize: 14 }}>
              슬롯 {selectedSlot !== null ? selectedSlot + 1 : ''} 설정
            </h3>
            <button
              onClick={() => {
                setShowSlotMenu(false);
                setSelectedSlot(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFF',
                fontSize: 18,
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: 8
          }}>
            <button
              onClick={() => setActiveTab('skills')}
              style={{
                padding: '6px 16px',
                background: activeTab === 'skills' ? '#4ECDC4' : 'rgba(60, 60, 80, 0.8)',
                border: 'none',
                borderRadius: 6,
                color: activeTab === 'skills' ? '#000' : '#FFF',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 12
              }}
            >
              스킬
            </button>
            <button
              onClick={() => setActiveTab('items')}
              style={{
                padding: '6px 16px',
                background: activeTab === 'items' ? '#FF6B6B' : 'rgba(60, 60, 80, 0.8)',
                border: 'none',
                borderRadius: 6,
                color: activeTab === 'items' ? '#000' : '#FFF',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 12
              }}
            >
              아이템
            </button>
          </div>

          {/* Skills Grid */}
          {activeTab === 'skills' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8
            }}>
              {getAvailableSkills().map(skill => {
                const isLearned = learnedSkills.includes(skill.id);
                const isAssigned = skillSlots.some(s => s.skillId === skill.id);

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      if (!isLearned) {
                        useSkillStore.getState().learnSkill(skill.id);
                      }
                      handleAssignSkill(skill.id);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 8,
                      background: isAssigned
                        ? 'rgba(100, 100, 150, 0.5)'
                        : 'rgba(50, 50, 70, 0.5)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: isAssigned ? '2px solid #4ECDC4' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    title={skill.description}
                  >
                    {renderSkillIcon(skill, 35)}
                    <span style={{
                      color: '#FFF',
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {skill.nameKo}
                    </span>
                    <span style={{
                      color: '#888',
                      fontSize: 8
                    }}>
                      Lv.{skill.unlockLevel}
                    </span>
                  </div>
                );
              })}
              {getAvailableSkills().length === 0 && (
                <div style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: 20 }}>
                  사용 가능한 스킬이 없습니다
                </div>
              )}
            </div>
          )}

          {/* Items Grid */}
          {activeTab === 'items' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8
            }}>
              {getConsumableItems().map(({ item, quantity }) => {
                const isAssigned = skillSlots.some(s => s.itemId === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAssignItem(item.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 8,
                      background: isAssigned
                        ? 'rgba(150, 100, 100, 0.5)'
                        : 'rgba(50, 50, 70, 0.5)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: isAssigned ? '2px solid #FF6B6B' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    title={`${item.nameKo} - ${item.effect === 'heal' ? 'HP 회복' : item.effect === 'mana' ? 'MP 회복' : '버프'}`}
                  >
                    {renderItemIcon(item, 35, quantity)}
                    <span style={{
                      color: '#FFF',
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {item.nameKo}
                    </span>
                    <span style={{
                      color: '#888',
                      fontSize: 8
                    }}>
                      x{quantity}
                    </span>
                  </div>
                );
              })}
              {getConsumableItems().length === 0 && (
                <div style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: 20 }}>
                  인벤토리에 소비 아이템이 없습니다
                </div>
              )}
            </div>
          )}

          {/* Help text */}
          <div style={{
            marginTop: 12,
            padding: 8,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 6,
            color: '#888',
            fontSize: 10,
            textAlign: 'center'
          }}>
            우클릭으로 슬롯 비우기
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillBar;
