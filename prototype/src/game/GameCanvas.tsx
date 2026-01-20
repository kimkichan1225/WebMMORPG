import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Direction } from '../types';
import { CONFIG } from '../types';
import { Player } from './Player';
import { Camera } from './Camera';
import { GameMap } from './Map';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const lastTimeRef = useRef<number>(0);

  const { player, keys, setPlayerPosition, setDirection, setMoving, setKey } = useGameStore();

  // 초기화
  useEffect(() => {
    playerRef.current = new Player(player.x, player.y);
    cameraRef.current = new Camera();
    mapRef.current = new GameMap();
  }, []);

  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setKey('up', true);
          break;
        case 's':
        case 'arrowdown':
          setKey('down', true);
          break;
        case 'a':
        case 'arrowleft':
          setKey('left', true);
          break;
        case 'd':
        case 'arrowright':
          setKey('right', true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setKey('up', false);
          break;
        case 's':
        case 'arrowdown':
          setKey('down', false);
          break;
        case 'a':
        case 'arrowleft':
          setKey('left', false);
          break;
        case 'd':
        case 'arrowright':
          setKey('right', false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKey]);

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // 이동 처리
      const currentKeys = useGameStore.getState().keys;
      const currentPlayer = useGameStore.getState().player;

      let dx = 0;
      let dy = 0;
      let newDirection: Direction = currentPlayer.direction;

      // 좌우 먼저 처리
      if (currentKeys.left) {
        dx -= 1;
        newDirection = 'left';
      }
      if (currentKeys.right) {
        dx += 1;
        newDirection = 'right';
      }
      // 상하는 나중에 처리 (우선순위 높음)
      if (currentKeys.up) {
        dy -= 1;
        newDirection = 'up';
      }
      if (currentKeys.down) {
        dy += 1;
        newDirection = 'down';
      }

      // 대각선 이동 시 속도 정규화
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      const isMoving = dx !== 0 || dy !== 0;

      if (isMoving) {
        const speed = CONFIG.PLAYER_SPEED * (deltaTime / 1000);
        let newX = currentPlayer.x + dx * speed;
        let newY = currentPlayer.y + dy * speed;

        // 충돌 체크
        if (mapRef.current) {
          // X축 이동 체크
          if (!mapRef.current.isWalkable(newX, currentPlayer.y)) {
            newX = currentPlayer.x;
          }
          // Y축 이동 체크
          if (!mapRef.current.isWalkable(currentPlayer.x, newY)) {
            newY = currentPlayer.y;
          }
          // 대각선 체크
          if (!mapRef.current.isWalkable(newX, newY)) {
            newX = currentPlayer.x;
            newY = currentPlayer.y;
          }
        }

        // 맵 경계 제한
        const mapWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
        const mapHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
        newX = Math.max(CONFIG.TILE_SIZE, Math.min(newX, mapWidth - CONFIG.TILE_SIZE));
        newY = Math.max(CONFIG.TILE_SIZE, Math.min(newY, mapHeight - CONFIG.TILE_SIZE));

        setPlayerPosition(newX, newY);
        setDirection(newDirection);
      }

      setMoving(isMoving);

      // 플레이어 업데이트
      if (playerRef.current) {
        const updatedPlayer = useGameStore.getState().player;
        playerRef.current.x = updatedPlayer.x;
        playerRef.current.y = updatedPlayer.y;
        playerRef.current.update(deltaTime, updatedPlayer.isMoving, updatedPlayer.direction);

        // 좌우 반전 상태 업데이트 (A/D 키 입력에 따라)
        if (currentKeys.right) {
          playerRef.current.facingRight = true;
        } else if (currentKeys.left) {
          playerRef.current.facingRight = false;
        }
      }

      // 카메라 업데이트
      if (cameraRef.current && playerRef.current) {
        cameraRef.current.follow(playerRef.current.x, playerRef.current.y);
      }

      // 렌더링
      ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      const cameraX = cameraRef.current?.x ?? 0;
      const cameraY = cameraRef.current?.y ?? 0;

      // 맵 렌더링
      if (mapRef.current) {
        mapRef.current.render(ctx, cameraX, cameraY);
      }

      // 플레이어 렌더링
      if (playerRef.current) {
        playerRef.current.render(ctx, cameraX, cameraY);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [setPlayerPosition, setDirection, setMoving]);

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.CANVAS_WIDTH}
      height={CONFIG.CANVAS_HEIGHT}
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}
