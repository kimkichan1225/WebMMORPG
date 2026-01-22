import React, { useEffect, useRef, memo, useMemo } from 'react';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { CONFIG } from '@shared/types';

interface MinimapProps {
  playerX: number;
  playerY: number;
  mapWidth: number;
  mapHeight: number;
  monsters?: Array<{ id: number; x: number; y: number; isAlive: boolean; type: string }>;
  npcs?: Array<{ id: string; x: number; y: number; name: string }>;
  resources?: Array<{ id: string; x: number; y: number; type: string }>;
  mapName?: string;
}

const MINIMAP_SIZE = 150;
const DOT_SIZE = 4;

// Colors for different entity types
const COLORS = {
  player: '#4CAF50',
  otherPlayer: '#4FC3F7',
  partyMember: '#81C784',
  monster: '#F44336',
  boss: '#FF5722',
  npc: '#FFD700',
  resource: '#8BC34A',
  portal: '#9C27B0',
  background: 'rgba(20, 20, 30, 0.85)',
  border: '#4a4a6a',
  mapArea: 'rgba(60, 60, 80, 0.5)',
};

// Throttle interval for minimap updates (ms)
const MINIMAP_UPDATE_INTERVAL = 100;

const MinimapComponent: React.FC<MinimapProps> = ({
  playerX,
  playerY,
  mapWidth,
  mapHeight,
  monsters = [],
  npcs = [],
  resources = [],
  mapName = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Get other players as array (converted from Map)
  const otherPlayers = useMultiplayerStore((state) => state.otherPlayers);
  const playersArray = useMemo(() => Array.from(otherPlayers.values()), [otherPlayers]);

  // Memoize scale calculation
  const { scale, mapPixelWidth, mapPixelHeight } = useMemo(() => {
    const tileSize = CONFIG.TILE_SIZE;
    const pixelW = mapWidth * tileSize;
    const pixelH = mapHeight * tileSize;
    return {
      scale: Math.min(MINIMAP_SIZE / pixelW, MINIMAP_SIZE / pixelH),
      mapPixelWidth: pixelW,
      mapPixelHeight: pixelH,
    };
  }, [mapWidth, mapHeight]);

  // Throttled canvas drawing
  useEffect(() => {
    const drawMinimap = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = COLORS.mapArea;
      ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      // Draw map boundary
      const scaledWidth = mapPixelWidth * scale;
      const scaledHeight = mapPixelHeight * scale;
      const offsetX = (MINIMAP_SIZE - scaledWidth) / 2;
      const offsetY = (MINIMAP_SIZE - scaledHeight) / 2;

      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX, offsetY, scaledWidth, scaledHeight);

      // Helper function to convert world coordinates to minimap coordinates
      const worldToMinimap = (x: number, y: number) => ({
        x: offsetX + x * scale,
        y: offsetY + y * scale,
      });

      // Draw resources (small green dots)
      resources.forEach((resource) => {
        const pos = worldToMinimap(resource.x, resource.y);
        ctx.fillStyle = COLORS.resource;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, DOT_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw NPCs (yellow dots)
      npcs.forEach((npc) => {
        const pos = worldToMinimap(npc.x, npc.y);
        ctx.fillStyle = COLORS.npc;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw monsters (red dots)
      monsters.forEach((monster) => {
        if (!monster.isAlive) return;
        const pos = worldToMinimap(monster.x, monster.y);
        const isBoss = monster.type.includes('boss');
        ctx.fillStyle = isBoss ? COLORS.boss : COLORS.monster;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isBoss ? DOT_SIZE * 1.5 : DOT_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw other players (blue dots)
      playersArray.forEach((player) => {
        const pos = worldToMinimap(player.x, player.y);
        ctx.fillStyle = COLORS.otherPlayer;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw current player (green dot with white border - larger)
      const playerPos = worldToMinimap(playerX, playerY);

      // Direction indicator (small line showing facing direction)
      ctx.strokeStyle = COLORS.player;
      ctx.lineWidth = 2;

      // White border for visibility
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(playerPos.x, playerPos.y, DOT_SIZE + 1, 0, Math.PI * 2);
      ctx.fill();

      // Green player dot
      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.arc(playerPos.x, playerPos.y, DOT_SIZE, 0, Math.PI * 2);
      ctx.fill();
    };

    // Throttle updates using requestAnimationFrame
    const updateMinimap = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= MINIMAP_UPDATE_INTERVAL) {
        drawMinimap();
        lastUpdateRef.current = now;
      }
      animationFrameRef.current = requestAnimationFrame(updateMinimap);
    };

    // Start update loop
    animationFrameRef.current = requestAnimationFrame(updateMinimap);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerX, playerY, mapPixelWidth, mapPixelHeight, monsters, npcs, resources, playersArray, scale]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: MINIMAP_SIZE + 10,
        backgroundColor: COLORS.background,
        border: `2px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: '5px',
        zIndex: 100,
      }}
    >
      {/* Map name header */}
      {mapName && (
        <div
          style={{
            color: '#FFD700',
            fontSize: '11px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {mapName}
        </div>
      )}

      {/* Minimap canvas */}
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        style={{
          borderRadius: '4px',
          display: 'block',
        }}
      />

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '4px',
          fontSize: '9px',
          color: '#888',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: COLORS.player,
            }}
          />
          나
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: COLORS.otherPlayer,
            }}
          />
          유저
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: COLORS.monster,
            }}
          />
          몬스터
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: COLORS.npc,
            }}
          />
          NPC
        </span>
      </div>

      {/* Coordinates */}
      <div
        style={{
          color: '#666',
          fontSize: '9px',
          textAlign: 'center',
          marginTop: '2px',
        }}
      >
        X: {Math.floor(playerX)} Y: {Math.floor(playerY)}
      </div>
    </div>
  );
};

// Memoize the entire component to prevent re-renders when parent changes
export const Minimap = memo(MinimapComponent);
export default Minimap;
