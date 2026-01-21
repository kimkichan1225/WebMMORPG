import { useInventoryStore, RESOURCES } from '../../stores/inventoryStore';
import { useEquipmentStore, TIER_COLORS, EquipmentItem, ConsumableItem } from '../../stores/equipmentStore';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DisplayItem {
  id: string;
  name: string;
  nameKo: string;
  quantity: number;
  color: string;
  tier: string;
  type: 'resource' | 'equipment' | 'consumable';
}

export function Inventory({ isOpen, onClose }: InventoryProps) {
  const { items, maxSlots } = useInventoryStore();
  const { allItems, useConsumable, equipItem } = useEquipmentStore();

  if (!isOpen) return null;

  // Convert inventory items to display items
  const displayItems: DisplayItem[] = items.map(item => {
    // Check if it's a resource
    const resource = RESOURCES[item.id];
    if (resource) {
      return {
        id: item.id,
        name: resource.name,
        nameKo: resource.nameKo,
        quantity: item.quantity,
        color: resource.color,
        tier: resource.tier,
        type: 'resource' as const,
      };
    }

    // Check if it's a weapon
    const weapon = allItems.weapons[item.id];
    if (weapon) {
      return {
        id: item.id,
        name: weapon.name,
        nameKo: weapon.nameKo,
        quantity: item.quantity,
        color: TIER_COLORS[weapon.tier] || '#888',
        tier: weapon.tier,
        type: 'equipment' as const,
      };
    }

    // Check if it's armor
    const armor = allItems.armor[item.id];
    if (armor) {
      return {
        id: item.id,
        name: armor.name,
        nameKo: armor.nameKo,
        quantity: item.quantity,
        color: TIER_COLORS[armor.tier] || '#888',
        tier: armor.tier,
        type: 'equipment' as const,
      };
    }

    // Check if it's a consumable
    const consumable = allItems.consumables[item.id];
    if (consumable) {
      return {
        id: item.id,
        name: consumable.name,
        nameKo: consumable.nameKo,
        quantity: item.quantity,
        color: getConsumableColor(consumable),
        tier: consumable.tier,
        type: 'consumable' as const,
      };
    }

    // Unknown item
    return {
      id: item.id,
      name: item.name,
      nameKo: item.name,
      quantity: item.quantity,
      color: '#888',
      tier: 'common',
      type: item.type,
    };
  });

  // Create empty slots array
  const slots = Array(maxSlots).fill(null);
  displayItems.forEach((item, index) => {
    if (index < maxSlots) {
      slots[index] = item;
    }
  });

  const handleItemClick = (item: DisplayItem) => {
    if (item.type === 'consumable') {
      const result = useConsumable(item.id);
      if (result.success) {
        console.log(`Used ${item.nameKo}`);
      }
    } else if (item.type === 'equipment') {
      const result = equipItem(item.id);
      if (result.success) {
        console.log(`Equipped ${item.nameKo}`);
      } else {
        console.log(`Cannot equip: ${result.error}`);
      }
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
        minWidth: '360px',
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
          인벤토리
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '11px' }}>I로 닫기</span>
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

      {/* Item Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
        }}
      >
        {slots.map((item, index) => {
          const tierColor = item ? TIER_COLORS[item.tier] || item.color : '#333';

          return (
            <div
              key={index}
              onClick={() => item && handleItemClick(item)}
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#2a2a4a',
                border: `2px solid ${item ? tierColor : '#333'}`,
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: item ? 'pointer' : 'default',
              }}
              title={item ? `${item.nameKo} (${getTypeLabel(item.type)})` : '빈 슬롯'}
            >
              {item && (
                <>
                  {/* Item icon */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: item.color,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                  >
                    {getItemIcon(item.type)}
                  </div>
                  {/* Quantity */}
                  {item.quantity > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '4px',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 1px #000',
                      }}
                    >
                      {item.quantity}
                    </span>
                  )}
                  {/* Type indicator */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '1px',
                      left: '3px',
                      color: '#aaa',
                      fontSize: '8px',
                    }}
                  >
                    {item.type === 'equipment' ? 'E' : item.type === 'consumable' ? 'C' : ''}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Item list summary */}
      <div
        style={{
          marginTop: '15px',
          maxHeight: '180px',
          overflowY: 'auto',
        }}
      >
        {displayItems.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            인벤토리가 비어있습니다
          </p>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                backgroundColor: '#222',
                borderRadius: '4px',
                marginBottom: '4px',
                cursor: 'pointer',
                border: `1px solid ${TIER_COLORS[item.tier] || '#333'}`,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: item.color,
                  borderRadius: '3px',
                  marginRight: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                {getItemIcon(item.type)}
              </div>
              <span style={{ color: TIER_COLORS[item.tier] || '#fff', flex: 1, fontSize: '13px' }}>
                {item.nameKo}
              </span>
              <span style={{ color: '#888', fontSize: '11px', marginRight: '8px' }}>
                {getTypeLabel(item.type)}
              </span>
              <span style={{ color: '#aaa', fontSize: '13px' }}>x{item.quantity}</span>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '10px', color: '#666', fontSize: '11px' }}>
        클릭: 장비 장착 / 소모품 사용
      </div>

      {/* Slot count */}
      <div
        style={{
          marginTop: '5px',
          textAlign: 'right',
          color: '#666',
          fontSize: '12px',
        }}
      >
        {items.length} / {maxSlots} 슬롯 사용 중
      </div>
    </div>
  );
}

function getConsumableColor(consumable: ConsumableItem): string {
  switch (consumable.effect) {
    case 'heal':
      return '#ff6666';
    case 'mana':
      return '#6666ff';
    case 'buff_attack':
      return '#ff9900';
    case 'buff_defense':
      return '#00cc66';
    default:
      return '#888';
  }
}

function getItemIcon(type: string): string {
  switch (type) {
    case 'equipment':
      return '⚔';
    case 'consumable':
      return '🧪';
    case 'resource':
      return '📦';
    default:
      return '';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'equipment':
      return '장비';
    case 'consumable':
      return '소모품';
    case 'resource':
      return '재료';
    default:
      return '';
  }
}
