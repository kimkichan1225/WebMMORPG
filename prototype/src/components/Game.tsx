import { GameCanvas } from '../game/GameCanvas';
import { useGameStore } from '../stores/gameStore';
import { CONFIG, TileType } from '../types';
import { useEffect, useRef } from 'react';

// 미니맵 컴포넌트
function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { player } = useGameStore();

  const MINIMAP_SIZE = 150;
  const TILE_PIXEL = MINIMAP_SIZE / CONFIG.MAP_WIDTH;

  // 타일 색상
  const tileColors: Record<TileType, string> = {
    [TileType.GRASS]: '#7ec850',
    [TileType.DIRT]: '#c4a484',
    [TileType.WATER]: '#4a90d9',
    [TileType.WALL]: '#555555',
  };

  // 간단한 맵 데이터 생성 (Map.ts와 동일한 로직)
  const generateMapData = (): TileType[][] => {
    const map: TileType[][] = [];
    for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
        let tile = TileType.GRASS;
        if (x === 0 || x === CONFIG.MAP_WIDTH - 1 || y === 0 || y === CONFIG.MAP_HEIGHT - 1) {
          tile = TileType.WALL;
        } else if (x >= 13 && x <= 16) {
          tile = TileType.DIRT;
        } else if (x >= 20 && x <= 24 && y >= 5 && y <= 9) {
          tile = TileType.WATER;
        } else if (x >= 5 && x <= 8 && y >= 20 && y <= 23) {
          tile = TileType.WATER;
        }
        row.push(tile);
      }
      map.push(row);
    }
    return map;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mapData = generateMapData();

    // 맵 그리기
    for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
        ctx.fillStyle = tileColors[mapData[y][x]];
        ctx.fillRect(x * TILE_PIXEL, y * TILE_PIXEL, TILE_PIXEL, TILE_PIXEL);
      }
    }

    // 플레이어 위치 표시
    const playerTileX = player.x / CONFIG.TILE_SIZE;
    const playerTileY = player.y / CONFIG.TILE_SIZE;

    // 플레이어 점 (빨간색)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
      playerTileX * TILE_PIXEL,
      playerTileY * TILE_PIXEL,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 플레이어 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [player.x, player.y]);

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_SIZE}
      height={MINIMAP_SIZE}
      style={{
        border: '2px solid #444',
        borderRadius: '4px',
        backgroundColor: '#222',
      }}
    />
  );
}

export function Game() {
  const { player } = useGameStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#1a1a2e',
      minHeight: '100vh',
    }}>
      <h1 style={{
        color: '#fff',
        marginBottom: '20px',
        fontFamily: 'Arial, sans-serif',
      }}>
        Skeleton MMORPG Prototype
      </h1>

      {/* 게임 캔버스 컨테이너 */}
      <div style={{ position: 'relative' }}>
        {/* HP/MP 바 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '8px',
          minWidth: '150px',
        }}>
          {/* HP 바 */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#fff',
              fontSize: '12px',
              marginBottom: '2px',
            }}>
              <span>HP</span>
              <span>{player.hp}/{player.maxHp}</span>
            </div>
            <div style={{
              width: '100%',
              height: '16px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(player.hp / player.maxHp) * 100}%`,
                height: '100%',
                backgroundColor: '#e74c3c',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* MP 바 */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#fff',
              fontSize: '12px',
              marginBottom: '2px',
            }}>
              <span>MP</span>
              <span>{player.mp}/{player.maxMp}</span>
            </div>
            <div style={{
              width: '100%',
              height: '16px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(player.mp / player.maxMp) * 100}%`,
                height: '100%',
                backgroundColor: '#3498db',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* 미니맵 (오른쪽 하단) */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px',
          borderRadius: '8px',
        }}>
          <div style={{
            color: '#fff',
            fontSize: '11px',
            marginBottom: '4px',
            textAlign: 'center',
          }}>
            Map ({Math.floor(player.x / CONFIG.TILE_SIZE)}, {Math.floor(player.y / CONFIG.TILE_SIZE)})
          </div>
          <Minimap />
        </div>

        {/* 캔버스 */}
        <GameCanvas />
      </div>

      {/* 조작 안내 */}
      <div style={{
        marginTop: '20px',
        color: '#888',
        fontSize: '14px',
        textAlign: 'center',
      }}>
        <p>WASD 또는 방향키로 이동</p>
      </div>
    </div>
  );
}
