import React, { useState, useEffect } from 'react';
import { useCraftingStore, Recipe, CATEGORY_LABELS } from '../../stores/craftingStore';
import { useEquipmentStore, TIER_COLORS } from '../../stores/equipmentStore';
import { usePlayerStore } from '../../stores/playerStore';

interface CraftingWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = Recipe['category'];

export const CraftingWindow: React.FC<CraftingWindowProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('alchemy');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const {
    allRecipes,
    isCrafting,
    currentRecipe,
    craftingProgress,
    canCraft,
    startCrafting,
    cancelCrafting,
    updateCraftingProgress,
    getRecipesByCategory,
    getMaterialName,
    getMaterialCount
  } = useCraftingStore();

  const { getItemById } = useEquipmentStore();
  const { level } = usePlayerStore();

  // Update crafting progress
  useEffect(() => {
    if (!isCrafting) return;

    const interval = setInterval(() => {
      const completed = updateCraftingProgress();
      if (completed) {
        // Could show notification here
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isCrafting, updateCraftingProgress]);

  if (!isOpen) return null;

  const recipes = getRecipesByCategory(selectedCategory);
  const categories: Category[] = ['alchemy', 'smithing', 'tailoring', 'enchanting'];

  const handleCraft = (recipeId: string) => {
    startCrafting(recipeId);
  };

  const getResultItemInfo = (itemId: string) => {
    const item = getItemById(itemId);
    if (item) {
      return {
        name: item.nameKo || item.name,
        tier: item.tier
      };
    }
    return { name: itemId, tier: 'common' };
  };

  return (
    <div className="crafting-window">
      <div className="window-header">
        <h3>제작 (Crafting)</h3>
        <button onClick={onClose}>×</button>
      </div>

      {/* Crafting Progress */}
      {isCrafting && currentRecipe && (
        <div className="crafting-progress-bar">
          <div className="progress-info">
            <span>제작 중: {allRecipes[currentRecipe]?.nameKo}</span>
            <span>{Math.floor(craftingProgress * 100)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${craftingProgress * 100}%` }}
            />
          </div>
          <button className="cancel-btn" onClick={cancelCrafting}>취소</button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => { setSelectedCategory(cat); setSelectedRecipe(null); }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="window-content">
        <div className="recipe-list">
          {recipes.length === 0 ? (
            <p className="empty-msg">이 카테고리에 레시피가 없습니다.</p>
          ) : (
            recipes.map(recipe => {
              const { canCraft: craftable, reason } = canCraft(recipe.id);
              const resultInfo = getResultItemInfo(recipe.result.itemId);
              const tierColor = TIER_COLORS[resultInfo.tier] || TIER_COLORS.common;
              const isSelected = selectedRecipe === recipe.id;
              const isLevelLocked = level < recipe.levelReq;

              return (
                <div
                  key={recipe.id}
                  className={`recipe-item ${isSelected ? 'selected' : ''} ${!craftable ? 'unavailable' : ''} ${isLevelLocked ? 'locked' : ''}`}
                  onClick={() => setSelectedRecipe(isSelected ? null : recipe.id)}
                >
                  <div className="recipe-header">
                    <span className="recipe-name" style={{ color: tierColor }}>
                      {recipe.nameKo}
                    </span>
                    <span className="recipe-result">
                      → {resultInfo.name} x{recipe.result.quantity}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="recipe-details">
                      <div className="materials">
                        <h5>재료</h5>
                        {recipe.materials.map((mat, idx) => {
                          const count = getMaterialCount(mat.itemId);
                          const hasEnough = count >= mat.quantity;

                          return (
                            <div
                              key={idx}
                              className={`material ${hasEnough ? 'has' : 'missing'}`}
                            >
                              <span className="mat-name">{getMaterialName(mat.itemId)}</span>
                              <span className="mat-count">
                                {count} / {mat.quantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="recipe-info">
                        <span>제작 시간: {(recipe.craftTime / 1000).toFixed(1)}초</span>
                        <span>필요 레벨: {recipe.levelReq}</span>
                      </div>

                      {craftable ? (
                        <button
                          className="craft-btn"
                          onClick={(e) => { e.stopPropagation(); handleCraft(recipe.id); }}
                          disabled={isCrafting}
                        >
                          {isCrafting ? '제작 중...' : '제작'}
                        </button>
                      ) : (
                        <span className="cannot-craft">{reason}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .crafting-window {
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

        .crafting-progress-bar {
          padding: 10px 15px;
          background: rgba(40, 60, 40, 0.4);
          border-bottom: 1px solid #4a6a4a;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .progress-track {
          height: 8px;
          background: rgba(30, 30, 50, 0.8);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4a6, #6c8);
          transition: width 0.1s linear;
        }

        .cancel-btn {
          padding: 4px 10px;
          background: #654;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 11px;
        }

        .category-tabs {
          display: flex;
          border-bottom: 1px solid #4a4a6a;
        }

        .category-tabs button {
          flex: 1;
          padding: 10px 5px;
          background: rgba(40, 40, 60, 0.4);
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 12px;
        }

        .category-tabs button.active {
          background: rgba(60, 60, 100, 0.6);
          color: white;
        }

        .window-content {
          padding: 10px;
          max-height: 450px;
          overflow-y: auto;
        }

        .recipe-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .recipe-item {
          background: rgba(40, 40, 60, 0.6);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .recipe-item:hover {
          background: rgba(50, 50, 80, 0.6);
        }

        .recipe-item.selected {
          background: rgba(60, 60, 100, 0.6);
          border-color: #6a6a9a;
        }

        .recipe-item.unavailable {
          opacity: 0.7;
        }

        .recipe-item.locked {
          opacity: 0.5;
        }

        .recipe-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recipe-name {
          font-weight: bold;
          font-size: 13px;
        }

        .recipe-result {
          font-size: 11px;
          color: #8f8;
        }

        .recipe-details {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #3a3a5a;
        }

        .materials h5 {
          margin: 0 0 8px 0;
          font-size: 11px;
          color: #888;
        }

        .material {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 3px 0;
        }

        .material.has .mat-count {
          color: #8f8;
        }

        .material.missing .mat-count {
          color: #f88;
        }

        .recipe-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
          margin: 10px 0;
        }

        .craft-btn {
          width: 100%;
          padding: 8px;
          background: linear-gradient(180deg, #4a6, #385);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 13px;
          font-weight: bold;
        }

        .craft-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #5b7, #496);
        }

        .craft-btn:disabled {
          background: #444;
          cursor: not-allowed;
        }

        .cannot-craft {
          display: block;
          text-align: center;
          font-size: 11px;
          color: #f88;
          padding: 8px;
        }

        .empty-msg {
          text-align: center;
          color: #666;
          padding: 30px;
        }
      `}</style>
    </div>
  );
};
