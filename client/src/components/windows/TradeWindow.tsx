import React, { useState } from 'react';
import { useTradeStore } from '../../stores/tradeStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { socketService } from '../../services/socket';
import type { TradeItem } from '@shared/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#888',
  uncommon: '#4a4',
  rare: '#48f',
  epic: '#a4f',
  legendary: '#fa4',
};

interface TradeWindowProps {
  onClose: () => void;
}

export const TradeWindow: React.FC<TradeWindowProps> = ({ onClose }) => {
  const { currentTrade, updateOffer, confirmTrade, unconfirmTrade, cancelTrade } = useTradeStore();
  const { items: inventoryItems, gold: playerGold } = useInventoryStore();

  const [selectedItems, setSelectedItems] = useState<TradeItem[]>([]);
  const [offeredGold, setOfferedGold] = useState(0);

  const currentSocketId = socketService.getSocket()?.id;

  if (!currentTrade) {
    return null;
  }

  const isPlayer1 = currentTrade.player1Id === currentSocketId;
  const myOffer = isPlayer1 ? currentTrade.player1Offer : currentTrade.player2Offer;
  const theirOffer = isPlayer1 ? currentTrade.player2Offer : currentTrade.player1Offer;
  const partnerName = isPlayer1 ? currentTrade.player2Name : currentTrade.player1Name;

  const handleAddItem = (item: typeof inventoryItems[0]) => {
    // Check if already added
    const existing = selectedItems.find((i) => i.itemId === item.id);
    if (existing) {
      // Increase quantity up to max
      const newQuantity = Math.min(existing.quantity + 1, item.quantity);
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === item.id ? { ...i, quantity: newQuantity } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item.id,
          itemName: item.name,
          quantity: 1,
          itemType: item.type,
        },
      ]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };

  const handleUpdateOffer = () => {
    updateOffer(selectedItems, offeredGold);
  };

  const handleConfirm = () => {
    if (myOffer.confirmed) {
      unconfirmTrade();
    } else {
      confirmTrade();
    }
  };

  const handleCancel = () => {
    cancelTrade();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(20, 20, 30, 0.98)',
        border: '2px solid #4a4a6a',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '600px',
        zIndex: 1100,
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid #4a4a6a',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700' }}>
          거래 - {partnerName}
        </span>
        <button
          onClick={handleCancel}
          style={{
            background: 'rgba(200, 50, 50, 0.6)',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          취소
        </button>
      </div>

      {/* Trade Area */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* My Offer */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              backgroundColor: 'rgba(40, 60, 40, 0.5)',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '10px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#8f8' }}>
              내 제안 {myOffer.confirmed && '(확정)'}
            </div>

            {/* My items */}
            <div
              style={{
                minHeight: '100px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                padding: '8px',
                marginBottom: '8px',
              }}
            >
              {selectedItems.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  아이템을 추가하세요
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div
                    key={item.itemId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(50, 50, 70, 0.5)',
                      borderRadius: '4px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: RARITY_COLORS[item.rarity || 'common'] }}>
                      {item.itemName} x{item.quantity}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.itemId)}
                      style={{
                        background: 'rgba(200, 50, 50, 0.5)',
                        border: 'none',
                        borderRadius: '3px',
                        color: '#fff',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      X
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Gold input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#FFD700' }}>골드:</span>
              <input
                type="number"
                min="0"
                max={playerGold}
                value={offeredGold}
                onChange={(e) => setOfferedGold(Math.min(Number(e.target.value), playerGold))}
                style={{
                  width: '100px',
                  padding: '5px',
                  backgroundColor: 'rgba(30, 30, 50, 0.8)',
                  border: '1px solid #4a4a6a',
                  borderRadius: '4px',
                  color: '#FFD700',
                }}
              />
              <span style={{ color: '#888', fontSize: '12px' }}>/ {playerGold}</span>
            </div>
          </div>

          {/* Update offer button */}
          <button
            onClick={handleUpdateOffer}
            disabled={myOffer.confirmed}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: myOffer.confirmed ? '#444' : '#4a6',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: myOffer.confirmed ? 'not-allowed' : 'pointer',
              marginBottom: '8px',
            }}
          >
            제안 업데이트
          </button>
        </div>

        {/* Their Offer */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              backgroundColor: 'rgba(60, 40, 40, 0.5)',
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#f88' }}>
              상대방 제안 {theirOffer.confirmed && '(확정)'}
            </div>

            {/* Their items */}
            <div
              style={{
                minHeight: '100px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                padding: '8px',
                marginBottom: '8px',
              }}
            >
              {theirOffer.items.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  아이템 없음
                </div>
              ) : (
                theirOffer.items.map((item) => (
                  <div
                    key={item.itemId}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(50, 50, 70, 0.5)',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      color: RARITY_COLORS[item.rarity || 'common'],
                    }}
                  >
                    {item.itemName} x{item.quantity}
                  </div>
                ))
              )}
            </div>

            {/* Their gold */}
            <div style={{ color: '#FFD700' }}>
              골드: {theirOffer.gold.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* My Inventory */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>내 인벤토리</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
            maxHeight: '120px',
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          {inventoryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddItem(item)}
              style={{
                padding: '8px',
                backgroundColor: 'rgba(50, 50, 70, 0.8)',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '11px',
                border: selectedItems.some((i) => i.itemId === item.id)
                  ? '2px solid #4a9eff'
                  : '2px solid transparent',
              }}
            >
              <div style={{ color: RARITY_COLORS['common'] }}>
                {item.name}
              </div>
              <div style={{ color: '#888' }}>x{item.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleConfirm}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: myOffer.confirmed ? '#a44' : '#4CAF50',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {myOffer.confirmed ? '확정 취소' : '거래 확정'}
        </button>
      </div>

      {/* Status */}
      {myOffer.confirmed && theirOffer.confirmed && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'rgba(50, 150, 50, 0.3)',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#8f8',
          }}
        >
          양측 모두 확정! 거래가 진행됩니다...
        </div>
      )}
    </div>
  );
};

export default TradeWindow;
