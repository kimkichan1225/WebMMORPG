import { useInventoryStore, RESOURCES } from '../stores/inventoryStore';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Inventory({ isOpen, onClose }: InventoryProps) {
  const { items, maxSlots } = useInventoryStore();

  if (!isOpen) return null;

  // Create empty slots array
  const slots = Array(maxSlots).fill(null);
  items.forEach((item, index) => {
    if (index < maxSlots) {
      slots[index] = item;
    }
  });

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
        minWidth: '320px',
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

      {/* Item Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
        }}
      >
        {slots.map((item, index) => {
          const resource = item ? RESOURCES[item.resourceId] : null;
          const tierColor = resource
            ? resource.tier === 'rare'
              ? '#9400D3'
              : resource.tier === 'uncommon'
              ? '#4169E1'
              : '#888'
            : '#333';

          return (
            <div
              key={index}
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
              }}
              title={resource ? `${resource.nameKo} (${resource.tier})` : '빈 슬롯'}
            >
              {item && resource && (
                <>
                  {/* Item icon (simple colored square) */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: resource.color,
                      borderRadius: '4px',
                    }}
                  />
                  {/* Quantity */}
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
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        {items.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            인벤토리가 비어있습니다
          </p>
        ) : (
          items.map((item) => {
            const resource = RESOURCES[item.resourceId];
            if (!resource) return null;

            return (
              <div
                key={item.resourceId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 8px',
                  backgroundColor: '#222',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: resource.color,
                    borderRadius: '2px',
                    marginRight: '8px',
                  }}
                />
                <span style={{ color: '#fff', flex: 1, fontSize: '13px' }}>
                  {resource.nameKo}
                </span>
                <span style={{ color: '#aaa', fontSize: '13px' }}>x{item.quantity}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Slot count */}
      <div
        style={{
          marginTop: '10px',
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
