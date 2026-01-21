import React from 'react';
import { useEquipmentStore, EquipmentSlot, TIER_COLORS } from '../../stores/equipmentStore';
import { useInventoryStore } from '../../stores/inventoryStore';

interface EquipmentWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquipmentWindow: React.FC<EquipmentWindowProps> = ({ isOpen, onClose }) => {
  const { equipped, allItems, equipItem, unequipItem, getEquippedStats, canEquipItem } = useEquipmentStore();
  const { items } = useInventoryStore();

  if (!isOpen) return null;

  const equippedStats = getEquippedStats();

  // Get equippable items from inventory
  const equippableItems = items.filter(item => {
    const weaponData = allItems.weapons[item.id];
    const armorData = allItems.armor[item.id];
    return weaponData || armorData;
  });

  const handleEquip = (itemId: string) => {
    const result = equipItem(itemId);
    if (!result.success) {
      console.log(`Equip failed: ${result.error}`);
    }
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    unequipItem(slot);
  };

  const getSlotLabel = (slot: EquipmentSlot): string => {
    const labels: Record<EquipmentSlot, string> = {
      weapon: '무기',
      head: '머리',
      body: '갑옷',
      accessory: '악세서리'
    };
    return labels[slot];
  };

  return (
    <div className="equipment-window">
      <div className="window-header">
        <h3>장비 (Equipment)</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="window-content">
        {/* Equipped Items */}
        <div className="equipped-section">
          <h4>장착 중인 장비</h4>
          <div className="equipped-slots">
            {(Object.keys(equipped) as EquipmentSlot[]).map(slot => {
              const item = equipped[slot];
              const tierColor = item ? TIER_COLORS[item.tier] : '#666';

              return (
                <div key={slot} className="equip-slot" style={{ borderColor: tierColor }}>
                  <span className="slot-label">{getSlotLabel(slot)}</span>
                  {item ? (
                    <>
                      <span className="item-name" style={{ color: tierColor }}>{item.nameKo}</span>
                      <div className="item-stats">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <span key={stat}>+{value as number} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                      <button onClick={() => handleUnequip(slot)}>해제</button>
                    </>
                  ) : (
                    <span className="empty-slot">비어있음</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Stats */}
        <div className="stats-section">
          <h4>장비 총 스탯</h4>
          <div className="total-stats">
            {equippedStats.attack! > 0 && <span className="stat">공격력 +{equippedStats.attack}</span>}
            {equippedStats.defense! > 0 && <span className="stat">방어력 +{equippedStats.defense}</span>}
            {equippedStats.hp! > 0 && <span className="stat">HP +{equippedStats.hp}</span>}
            {equippedStats.mp! > 0 && <span className="stat">MP +{equippedStats.mp}</span>}
            {equippedStats.str! > 0 && <span className="stat">STR +{equippedStats.str}</span>}
            {equippedStats.dex! > 0 && <span className="stat">DEX +{equippedStats.dex}</span>}
            {equippedStats.int! > 0 && <span className="stat">INT +{equippedStats.int}</span>}
            {equippedStats.vit! > 0 && <span className="stat">VIT +{equippedStats.vit}</span>}
            {equippedStats.luk! > 0 && <span className="stat">LUK +{equippedStats.luk}</span>}
          </div>
        </div>

        {/* Inventory Equipment */}
        <div className="inventory-section">
          <h4>인벤토리 장비</h4>
          <div className="inventory-items">
            {equippableItems.length === 0 ? (
              <p className="empty-msg">장비 아이템이 없습니다</p>
            ) : (
              equippableItems.map(item => {
                const weaponData = allItems.weapons[item.id];
                const armorData = allItems.armor[item.id];
                const itemData = weaponData || armorData;

                if (!itemData) return null;

                const tierColor = TIER_COLORS[itemData.tier];
                const { canEquip, reason } = canEquipItem(item.id);

                return (
                  <div key={item.id} className="inventory-item" style={{ borderColor: tierColor }}>
                    <div className="item-info">
                      <span className="item-name" style={{ color: tierColor }}>{itemData.nameKo}</span>
                      <span className="item-slot">{getSlotLabel(itemData.slot)}</span>
                      <div className="item-stats">
                        {Object.entries(itemData.stats).map(([stat, value]) => (
                          <span key={stat}>+{value as number} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                      <div className="item-req">
                        <span>Lv.{itemData.levelReq}</span>
                        <span>{itemData.job.join(', ')}</span>
                      </div>
                    </div>
                    {canEquip ? (
                      <button onClick={() => handleEquip(item.id)}>장착</button>
                    ) : (
                      <span className="cannot-equip">{reason}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        .equipment-window {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 30, 0.95);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          min-width: 400px;
          max-width: 500px;
          max-height: 80vh;
          z-index: 1000;
          color: white;
        }

        .window-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(40, 40, 60, 0.8);
          border-bottom: 1px solid #4a4a6a;
        }

        .window-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .window-header button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .window-content {
          padding: 15px;
          overflow-y: auto;
          max-height: calc(80vh - 50px);
        }

        .equipped-section, .stats-section, .inventory-section {
          margin-bottom: 20px;
        }

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #aaa;
        }

        .equipped-slots {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .equip-slot {
          background: rgba(40, 40, 60, 0.6);
          border: 2px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .slot-label {
          font-size: 12px;
          color: #888;
        }

        .item-name {
          font-weight: bold;
          font-size: 13px;
        }

        .item-stats {
          font-size: 11px;
          color: #8f8;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .empty-slot {
          color: #666;
          font-size: 12px;
        }

        .equip-slot button {
          padding: 4px 8px;
          background: #654;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 11px;
          margin-top: 5px;
        }

        .equip-slot button:hover {
          background: #765;
        }

        .total-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          background: rgba(40, 40, 60, 0.6);
          padding: 10px;
          border-radius: 4px;
        }

        .total-stats .stat {
          font-size: 12px;
          color: #8f8;
        }

        .inventory-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inventory-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .item-slot {
          font-size: 11px;
          color: #888;
        }

        .item-req {
          font-size: 10px;
          color: #aaa;
          display: flex;
          gap: 10px;
        }

        .inventory-item button {
          padding: 6px 12px;
          background: #4a6;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .inventory-item button:hover {
          background: #5b7;
        }

        .cannot-equip {
          font-size: 11px;
          color: #f88;
        }

        .empty-msg {
          color: #666;
          font-size: 12px;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};
