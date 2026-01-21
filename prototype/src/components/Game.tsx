import { useState } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { usePlayerStore } from '../stores/playerStore';
import { ToolSelect } from './ToolSelect';
import { HUD } from './HUD';
import { StatWindow } from './StatWindow';
import { Inventory } from './Inventory';
import { JobChangeUI } from './JobChangeUI';
import { CONFIG, TileType } from '../types';

// Minimap component
function Minimap() {
  const { x, y } = usePlayerStore();

  const MINIMAP_SIZE = 150;
  const TILE_PIXEL = MINIMAP_SIZE / CONFIG.MAP_WIDTH;

  const tileColors: Record<TileType, string> = {
    [TileType.GRASS]: '#7ec850',
    [TileType.DIRT]: '#c4a484',
    [TileType.WATER]: '#4a90d9',
    [TileType.WALL]: '#555555',
  };

  const generateMapData = (): TileType[][] => {
    const map: TileType[][] = [];
    for (let row = 0; row < CONFIG.MAP_HEIGHT; row++) {
      const rowData: TileType[] = [];
      for (let col = 0; col < CONFIG.MAP_WIDTH; col++) {
        let tile: TileType = TileType.GRASS;

        // Map borders are walls
        if (col === 0 || col === CONFIG.MAP_WIDTH - 1 || row === 0 || row === CONFIG.MAP_HEIGHT - 1) {
          tile = TileType.WALL;
        }
        // Center dirt path (vertical)
        else if (col >= 18 && col <= 21) {
          tile = TileType.DIRT;
        }
        // Center dirt path (horizontal)
        else if (row >= 18 && row <= 21) {
          tile = TileType.DIRT;
        }
        // Tree zone (top-left)
        else if (col >= 2 && col <= 9 && row >= 2 && row <= 9) {
          tile = TileType.DIRT;
        }
        // Rock zone (top-right)
        else if (col >= 30 && col <= 37 && row >= 2 && row <= 9) {
          tile = TileType.DIRT;
        }
        // Pond (bottom area)
        else if (col >= 5 && col <= 8 && row >= 35 && row <= 38) {
          tile = TileType.WATER;
        }
        // Pond (right area)
        else if (col >= 32 && col <= 36 && row >= 25 && row <= 29) {
          tile = TileType.WATER;
        }

        rowData.push(tile);
      }
      map.push(rowData);
    }
    return map;
  };

  const mapData = generateMapData();
  const playerTileX = x / CONFIG.TILE_SIZE;
  const playerTileY = y / CONFIG.TILE_SIZE;

  return (
    <div
      style={{
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        border: '2px solid #444',
        borderRadius: '4px',
        backgroundColor: '#222',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Map tiles */}
      <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE}>
        {mapData.map((row, rowIdx) =>
          row.map((tile, colIdx) => (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * TILE_PIXEL}
              y={rowIdx * TILE_PIXEL}
              width={TILE_PIXEL}
              height={TILE_PIXEL}
              fill={tileColors[tile]}
            />
          ))
        )}
        {/* Player position */}
        <circle
          cx={playerTileX * TILE_PIXEL}
          cy={playerTileY * TILE_PIXEL}
          r={4}
          fill="#ff0000"
          stroke="#ffffff"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

// Controls help
function ControlsHelp() {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#aaa',
      }}
    >
      <div style={{ marginBottom: '5px', color: '#fff', fontWeight: 'bold' }}>Controls</div>
      <div>WASD / Arrow - Move</div>
      <div>Space - Attack</div>
      <div>E (hold) - Harvest</div>
      <div>Tab - Stats</div>
      <div>I - Inventory</div>
      <div>J - Job Change</div>
    </div>
  );
}

export function Game() {
  const { toolSelected } = usePlayerStore();

  const [isStatWindowOpen, setStatWindowOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isJobChangeOpen, setJobChangeOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#1a1a2e',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          color: '#fff',
          marginBottom: '20px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Skeleton MMORPG Prototype v2
      </h1>

      {/* Tool selection overlay */}
      <ToolSelect />

      {/* Main game container */}
      <div style={{ position: 'relative' }}>
        {/* HUD (HP/MP/Level) */}
        {toolSelected && <HUD />}

        {/* Minimap (bottom-right) */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                color: '#fff',
                fontSize: '11px',
                marginBottom: '4px',
                textAlign: 'center',
              }}
            >
              Map ({Math.floor(usePlayerStore.getState().x / CONFIG.TILE_SIZE)},{' '}
              {Math.floor(usePlayerStore.getState().y / CONFIG.TILE_SIZE)})
            </div>
            <Minimap />
          </div>
        )}

        {/* Controls help (top-right) */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
            }}
          >
            <ControlsHelp />
          </div>
        )}

        {/* Game Canvas */}
        <GameCanvas
          onOpenStatWindow={() => setStatWindowOpen(true)}
          onOpenInventory={() => setInventoryOpen(true)}
          onOpenJobChange={() => setJobChangeOpen(true)}
        />
      </div>

      {/* UI Windows */}
      <StatWindow isOpen={isStatWindowOpen} onClose={() => setStatWindowOpen(false)} />
      <Inventory isOpen={isInventoryOpen} onClose={() => setInventoryOpen(false)} />
      <JobChangeUI isOpen={isJobChangeOpen} onClose={() => setJobChangeOpen(false)} />

      {/* Footer info */}
      {toolSelected && (
        <div
          style={{
            marginTop: '20px',
            color: '#666',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <p>Press Tab for Stats | I for Inventory | J for Job Change</p>
        </div>
      )}
    </div>
  );
}
