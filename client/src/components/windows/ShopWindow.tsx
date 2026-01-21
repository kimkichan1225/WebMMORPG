import React, { useState } from 'react';
import { useEquipmentStore, TIER_COLORS, EquipmentItem, ConsumableItem } from '../../stores/equipmentStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useQuestStore } from '../../stores/questStore';
import { NPC } from '../../game/entities/NPC';

interface ShopWindowProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NPC | null;
}

type TabType = 'buy' | 'sell';

export const ShopWindow: React.FC<ShopWindowProps> = ({ isOpen, onClose, npc }) => {
  const [activeTab, setActiveTab] = useState<TabType>('buy');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { allItems } = useEquipmentStore();
  const { items: inventoryItems, addItem, removeItem } = useInventoryStore();
  const { gold, spendGold, gainGold } = usePlayerStore();
  const { updateQuestProgress } = useQuestStore();

  if (!isOpen || !npc || !npc.shop) return null;

  const shopItems = npc.shop.items.map(itemId => {
    const weapon = allItems.weapons[itemId];
    const armor = allItems.armor[itemId];
    const consumable = allItems.consumables[itemId];
    return weapon || armor || consumable;
  }).filter(Boolean) as (EquipmentItem | ConsumableItem)[];

  const sellableItems = inventoryItems.filter(item => {
    const weapon = allItems.weapons[item.id];
    const armor = allItems.armor[item.id];
    const consumable = allItems.consumables[item.id];
    return weapon || armor || consumable;
  });

  const handleBuy = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    const totalCost = item.price * quantity;
    if (gold < totalCost) {
      console.log('Not enough gold');
      return;
    }

    if (spendGold(totalCost)) {
      const isEquipment = 'slot' in item;
      const itemType = 'type' in item && item.type === 'consumable' ? 'consumable' : 'equipment';

      for (let i = 0; i < quantity; i++) {
        addItem({
          id: item.id,
          name: item.name,
          type: itemType,
          quantity: 1
        });
      }

      // Update quest progress for weapon acquisition
      if (isEquipment && (item as EquipmentItem).slot === 'weapon') {
        updateQuestProgress('acquire', 'weapon', quantity);
      }
    }
    setQuantity(1);
    setSelectedItem(null);
  };

  const handleSell = (itemId: string, qty: number = 1) => {
    const invItem = inventoryItems.find(i => i.id === itemId);
    if (!invItem) return;

    const weapon = allItems.weapons[itemId];
    const armor = allItems.armor[itemId];
    const consumable = allItems.consumables[itemId];
    const itemData = weapon || armor || consumable;

    if (!itemData) return;

    const sellPrice = Math.floor(itemData.price * 0.5);
    const actualQty = Math.min(qty, invItem.quantity);

    removeItem(itemId, actualQty);
    gainGold(sellPrice * actualQty);
    setSelectedItem(null);
  };

  const getItemTier = (item: EquipmentItem | ConsumableItem): string => {
    return item.tier;
  };

  return (
    <div className="shop-window">
      <div className="window-header">
        <h3>{npc.nameKo}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="shop-dialogue">
        <p>{activeTab === 'buy' ? npc.dialogue.buy : npc.dialogue.sell}</p>
      </div>

      <div className="gold-display">
        <span>소지금: {gold.toLocaleString()} G</span>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'buy' ? 'active' : ''}
          onClick={() => setActiveTab('buy')}
        >
          구매
        </button>
        <button
          className={activeTab === 'sell' ? 'active' : ''}
          onClick={() => setActiveTab('sell')}
        >
          판매
        </button>
      </div>

      <div className="window-content">
        {activeTab === 'buy' ? (
          <div className="item-list">
            {shopItems.map(item => {
              const tierColor = TIER_COLORS[getItemTier(item)];
              const isEquipment = 'slot' in item;
              const stats = isEquipment ? (item as EquipmentItem).stats : null;

              return (
                <div
                  key={item.id}
                  className={`shop-item ${selectedItem === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item.id)}
                  style={{ borderColor: tierColor }}
                >
                  <div className="item-info">
                    <span className="item-name" style={{ color: tierColor }}>
                      {item.nameKo}
                    </span>
                    {stats && (
                      <div className="item-stats">
                        {Object.entries(stats).map(([stat, value]) => (
                          <span key={stat}>+{value} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                    )}
                    {!isEquipment && (
                      <span className="item-effect">
                        {(item as ConsumableItem).effect}: {(item as ConsumableItem).value}
                      </span>
                    )}
                    {isEquipment && (
                      <span className="item-req">
                        Lv.{(item as EquipmentItem).levelReq} | {(item as EquipmentItem).job.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="item-price">
                    <span className={gold >= item.price ? 'affordable' : 'expensive'}>
                      {item.price.toLocaleString()} G
                    </span>
                    {selectedItem === item.id && (
                      <div className="buy-controls">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBuy(item.id); }}
                          disabled={gold < item.price * quantity}
                        >
                          구매
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="item-list">
            {sellableItems.length === 0 ? (
              <p className="empty-msg">판매할 아이템이 없습니다.</p>
            ) : (
              sellableItems.map(invItem => {
                const weapon = allItems.weapons[invItem.id];
                const armor = allItems.armor[invItem.id];
                const consumable = allItems.consumables[invItem.id];
                const itemData = weapon || armor || consumable;

                if (!itemData) return null;

                const tierColor = TIER_COLORS[itemData.tier];
                const sellPrice = Math.floor(itemData.price * 0.5);

                return (
                  <div
                    key={invItem.id}
                    className={`shop-item ${selectedItem === invItem.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(invItem.id)}
                    style={{ borderColor: tierColor }}
                  >
                    <div className="item-info">
                      <span className="item-name" style={{ color: tierColor }}>
                        {itemData.nameKo} x{invItem.quantity}
                      </span>
                    </div>
                    <div className="item-price">
                      <span className="sell-price">{sellPrice.toLocaleString()} G each</span>
                      {selectedItem === invItem.id && (
                        <div className="sell-controls">
                          <button onClick={(e) => { e.stopPropagation(); handleSell(invItem.id, 1); }}>
                            1개 판매
                          </button>
                          {invItem.quantity > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); handleSell(invItem.id, invItem.quantity); }}>
                              전체 판매
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <style>{`
        .shop-window {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 30, 0.95);
          border: 2px solid #4a4a6a;
          border-radius: 8px;
          width: 420px;
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

        .shop-dialogue {
          padding: 10px 15px;
          background: rgba(40, 40, 60, 0.4);
          border-bottom: 1px solid #3a3a5a;
        }

        .shop-dialogue p {
          margin: 0;
          font-style: italic;
          color: #ccc;
        }

        .gold-display {
          padding: 8px 15px;
          background: rgba(60, 50, 30, 0.4);
          border-bottom: 1px solid #3a3a5a;
          color: #ffd700;
          font-weight: bold;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #4a4a6a;
        }

        .tabs button {
          flex: 1;
          padding: 10px;
          background: rgba(40, 40, 60, 0.4);
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 14px;
        }

        .tabs button.active {
          background: rgba(60, 60, 100, 0.6);
          color: white;
        }

        .window-content {
          padding: 10px;
          max-height: 400px;
          overflow-y: auto;
        }

        .item-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shop-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          cursor: pointer;
          transition: background 0.2s;
        }

        .shop-item:hover {
          background: rgba(50, 50, 80, 0.6);
        }

        .shop-item.selected {
          background: rgba(60, 60, 100, 0.6);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-weight: bold;
          font-size: 13px;
        }

        .item-stats {
          font-size: 11px;
          color: #8f8;
          display: flex;
          gap: 8px;
        }

        .item-effect {
          font-size: 11px;
          color: #8af;
        }

        .item-req {
          font-size: 10px;
          color: #888;
        }

        .item-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .item-price .affordable {
          color: #ffd700;
        }

        .item-price .expensive {
          color: #f66;
        }

        .item-price .sell-price {
          color: #8f8;
        }

        .buy-controls, .sell-controls {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .buy-controls input {
          width: 40px;
          padding: 3px;
          background: rgba(30, 30, 50, 0.8);
          border: 1px solid #4a4a6a;
          color: white;
          border-radius: 3px;
          text-align: center;
        }

        .buy-controls button, .sell-controls button {
          padding: 4px 8px;
          background: #4a6;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 11px;
        }

        .buy-controls button:disabled {
          background: #444;
          cursor: not-allowed;
        }

        .sell-controls button {
          background: #654;
        }

        .empty-msg {
          text-align: center;
          color: #888;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};
