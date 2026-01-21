import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useInventoryStore, RESOURCES } from '../stores/inventoryStore';
import type { Direction } from '../types';
import { CONFIG } from '../types';
import { Player } from './Player';
import { Camera } from './Camera';
import { GameMap } from './Map';
import { ResourceManager } from './Resource';
import { MonsterManager } from './Monster';
import {
  drawSlashEffect,
  drawHitEffect,
  drawHarvestEffect,
  createHarvestParticles,
  updateParticles,
  drawDamageNumber,
  updateDamageNumbers,
  type Particle,
  type DamageNumber,
} from './effects';

interface GameCanvasProps {
  onOpenStatWindow: () => void;
  onOpenInventory: () => void;
  onOpenJobChange: () => void;
}

export function GameCanvas({ onOpenStatWindow, onOpenInventory, onOpenJobChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const resourceManagerRef = useRef<ResourceManager | null>(null);
  const monsterManagerRef = useRef<MonsterManager | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Effects state
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const slashEffectRef = useRef<{ x: number; y: number; direction: 'up' | 'down' | 'left' | 'right'; progress: number } | null>(null);
  const hitEffectsRef = useRef<{ x: number; y: number; progress: number }[]>([]);
  const screenShakeRef = useRef<{ intensity: number; duration: number; elapsed: number } | null>(null);

  // Harvest state
  const harvestingRef = useRef<{ resourceId: number; progress: number } | null>(null);

  const {
    x: playerX,
    y: playerY,
    direction,
    facingRight,
    tool,
    toolSelected,
    isDead,
    setPosition,
    setDirection,
    setMoving,
    setFacingRight,
    setKey,
    startAttack,
    updateAttack,
    getAttackPower,
    takeDamage,
    gainExp,
    respawn,
  } = usePlayerStore();

  const { addItem } = useInventoryStore();

  // Initialize game objects
  useEffect(() => {
    playerRef.current = new Player(playerX, playerY);
    cameraRef.current = new Camera();
    mapRef.current = new GameMap();
    resourceManagerRef.current = new ResourceManager();
    monsterManagerRef.current = new MonsterManager();
  }, []);

  // Keyboard input handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!toolSelected) return;

      // Movement keys
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
        case ' ':
          // Attack
          e.preventDefault();
          if (!isDead) {
            const canAttack = startAttack();
            if (canAttack && monsterManagerRef.current) {
              // Find monsters in attack range
              const attackRange = 60;

              // Slash effect follows movement direction (same as weapon)
              slashEffectRef.current = {
                x: playerX,
                y: playerY,
                direction: direction,
                progress: 0,
              };

              // Damage monsters
              const monstersInRange = monsterManagerRef.current.getMonstersInRange(
                playerX,
                playerY,
                attackRange
              );
              const attackPower = getAttackPower();

              if (monstersInRange.length > 0) {
                // Trigger screen shake on hit
                screenShakeRef.current = {
                  intensity: 4 + monstersInRange.length * 2,
                  duration: 150,
                  elapsed: 0,
                };
              }

              monstersInRange.forEach((monster) => {
                const result = monsterManagerRef.current!.damageMonster(monster.id, attackPower);

                // Damage number
                damageNumbersRef.current.push({
                  x: monster.x,
                  y: monster.y - 30,
                  value: attackPower,
                  life: 1,
                  maxLife: 1,
                  isCritical: attackPower > CONFIG.BASE_ATTACK * 1.4,
                });

                // Hit effect
                hitEffectsRef.current.push({
                  x: monster.x,
                  y: monster.y,
                  progress: 0,
                });

                if (result.killed) {
                  gainExp(result.exp);
                }
              });
            }
          }
          break;
        case 'e':
          // Harvest
          e.preventDefault();
          if (!isDead && resourceManagerRef.current && tool) {
            const nearestResource = resourceManagerRef.current.getNearestResource(
              playerX,
              playerY,
              tool
            );
            if (nearestResource && !harvestingRef.current) {
              harvestingRef.current = {
                resourceId: nearestResource.id,
                progress: 0,
              };
            }
          }
          break;
        case 'tab':
          e.preventDefault();
          onOpenStatWindow();
          break;
        case 'i':
          e.preventDefault();
          onOpenInventory();
          break;
        case 'j':
          e.preventDefault();
          onOpenJobChange();
          break;
      }
    },
    [
      toolSelected,
      isDead,
      playerX,
      playerY,
      direction,
      facingRight,
      tool,
      setKey,
      startAttack,
      getAttackPower,
      gainExp,
      onOpenStatWindow,
      onOpenInventory,
      onOpenJobChange,
    ]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
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
        case 'e':
          // Stop harvesting
          harvestingRef.current = null;
          break;
      }
    },
    [setKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop
  useEffect(() => {
    if (!toolSelected) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const state = usePlayerStore.getState();

      if (state.isDead) {
        // Death screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU DIED', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 30);

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(
          'Press R to respawn',
          CONFIG.CANVAS_WIDTH / 2,
          CONFIG.CANVAS_HEIGHT / 2 + 30
        );

        // Handle respawn key
        const handleRespawn = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'r') {
            respawn();
            window.removeEventListener('keydown', handleRespawn);
          }
        };
        window.addEventListener('keydown', handleRespawn);

        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // Movement processing
      let dx = 0;
      let dy = 0;
      let newDirection: Direction = state.direction;

      if (state.keys.left) {
        dx -= 1;
        newDirection = 'left';
      }
      if (state.keys.right) {
        dx += 1;
        newDirection = 'right';
      }
      if (state.keys.up) {
        dy -= 1;
        newDirection = 'up';
      }
      if (state.keys.down) {
        dy += 1;
        newDirection = 'down';
      }

      // Diagonal movement normalization
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      const isPlayerMoving = dx !== 0 || dy !== 0;

      if (isPlayerMoving) {
        const speed = CONFIG.PLAYER_SPEED * (deltaTime / 1000);
        let newX = state.x + dx * speed;
        let newY = state.y + dy * speed;

        // Collision check
        if (mapRef.current) {
          if (!mapRef.current.isWalkable(newX, state.y)) {
            newX = state.x;
          }
          if (!mapRef.current.isWalkable(state.x, newY)) {
            newY = state.y;
          }
          if (!mapRef.current.isWalkable(newX, newY)) {
            newX = state.x;
            newY = state.y;
          }
        }

        // Map boundary
        const mapWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
        const mapHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
        newX = Math.max(CONFIG.TILE_SIZE, Math.min(newX, mapWidth - CONFIG.TILE_SIZE));
        newY = Math.max(CONFIG.TILE_SIZE, Math.min(newY, mapHeight - CONFIG.TILE_SIZE));

        setPosition(newX, newY);
        setDirection(newDirection);

        // Cancel harvesting when moving
        harvestingRef.current = null;
      }

      setMoving(isPlayerMoving);

      // Update facing direction
      if (state.keys.right) {
        setFacingRight(true);
      } else if (state.keys.left) {
        setFacingRight(false);
      }

      // Update attack
      updateAttack(deltaTime);

      // Update player
      if (playerRef.current) {
        const updatedState = usePlayerStore.getState();
        playerRef.current.x = updatedState.x;
        playerRef.current.y = updatedState.y;
        playerRef.current.facingRight = updatedState.facingRight;
        playerRef.current.update(
          deltaTime,
          updatedState.isMoving,
          updatedState.direction,
          updatedState.weapon,
          updatedState.isAttacking
        );
      }

      // Update camera
      if (cameraRef.current && playerRef.current) {
        cameraRef.current.follow(playerRef.current.x, playerRef.current.y);
      }

      // Update resources
      if (resourceManagerRef.current) {
        resourceManagerRef.current.update(deltaTime);
      }

      // Update monsters
      if (monsterManagerRef.current) {
        const updatedState = usePlayerStore.getState();
        const { attackingMonster } = monsterManagerRef.current.update(
          deltaTime,
          updatedState.x,
          updatedState.y
        );

        // Monster attacks player
        if (attackingMonster) {
          takeDamage(attackingMonster.attack);

          // Hit effect on player
          hitEffectsRef.current.push({
            x: updatedState.x,
            y: updatedState.y,
            progress: 0,
          });
        }
      }

      // Harvesting
      if (harvestingRef.current && resourceManagerRef.current) {
        harvestingRef.current.progress += deltaTime;

        if (harvestingRef.current.progress >= CONFIG.HARVEST_TIME) {
          const result = resourceManagerRef.current.harvestResource(harvestingRef.current.resourceId);

          if (result) {
            addItem(result.resourceId);
            gainExp(result.exp);

            // Harvest particles
            const resource = resourceManagerRef.current
              .getResources()
              .find((r) => r.id === harvestingRef.current?.resourceId);
            if (resource) {
              const resourceData = RESOURCES[result.resourceId];
              particlesRef.current.push(
                ...createHarvestParticles(resource.x, resource.y, resourceData?.color || '#888')
              );
            }

            harvestingRef.current = null;
          } else {
            harvestingRef.current = null;
          }
        }
      }

      // Update effects
      particlesRef.current = updateParticles(particlesRef.current, deltaTime);
      damageNumbersRef.current = updateDamageNumbers(damageNumbersRef.current, deltaTime);

      // Update slash effect
      if (slashEffectRef.current) {
        slashEffectRef.current.progress += deltaTime / 200;
        if (slashEffectRef.current.progress >= 1) {
          slashEffectRef.current = null;
        }
      }

      // Update hit effects
      hitEffectsRef.current = hitEffectsRef.current
        .map((h) => ({ ...h, progress: h.progress + deltaTime / 300 }))
        .filter((h) => h.progress < 1);

      // Update screen shake
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShakeRef.current) {
        screenShakeRef.current.elapsed += deltaTime;
        if (screenShakeRef.current.elapsed >= screenShakeRef.current.duration) {
          screenShakeRef.current = null;
        } else {
          const progress = screenShakeRef.current.elapsed / screenShakeRef.current.duration;
          const decay = 1 - progress;
          const intensity = screenShakeRef.current.intensity * decay;
          shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
          shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
        }
      }

      // Rendering
      ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      const cameraX = (cameraRef.current?.x ?? 0) + shakeOffsetX;
      const cameraY = (cameraRef.current?.y ?? 0) + shakeOffsetY;

      // Map
      if (mapRef.current) {
        mapRef.current.render(ctx, cameraX, cameraY);
      }

      // Resources
      if (resourceManagerRef.current) {
        resourceManagerRef.current.render(ctx, cameraX, cameraY);
      }

      // Monsters
      if (monsterManagerRef.current) {
        monsterManagerRef.current.render(ctx, cameraX, cameraY);
      }

      // Player
      if (playerRef.current) {
        playerRef.current.render(ctx, cameraX, cameraY);
      }

      // Effects
      if (slashEffectRef.current) {
        drawSlashEffect(
          ctx,
          slashEffectRef.current.x - cameraX,
          slashEffectRef.current.y - cameraY,
          slashEffectRef.current.direction,
          slashEffectRef.current.progress
        );
      }

      hitEffectsRef.current.forEach((h) => {
        drawHitEffect(ctx, h.x - cameraX, h.y - cameraY, h.progress);
      });

      // Particles
      const adjustedParticles = particlesRef.current.map((p) => ({
        ...p,
        x: p.x - cameraX,
        y: p.y - cameraY,
      }));
      drawHarvestEffect(ctx, adjustedParticles);

      // Damage numbers
      damageNumbersRef.current.forEach((dn) => {
        drawDamageNumber(ctx, {
          ...dn,
          x: dn.x - cameraX,
          y: dn.y - cameraY,
        });
      });

      // Harvest progress bar
      if (harvestingRef.current && resourceManagerRef.current) {
        const resource = resourceManagerRef.current
          .getResources()
          .find((r) => r.id === harvestingRef.current?.resourceId);
        if (resource) {
          const screenX = resource.x - cameraX;
          const screenY = resource.y - cameraY - 50;
          const progress = harvestingRef.current.progress / CONFIG.HARVEST_TIME;

          ctx.fillStyle = '#333';
          ctx.fillRect(screenX - 25, screenY, 50, 8);
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(screenX - 25, screenY, 50 * progress, 8);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX - 25, screenY, 50, 8);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    toolSelected,
    setPosition,
    setDirection,
    setMoving,
    setFacingRight,
    updateAttack,
    takeDamage,
    gainExp,
    addItem,
    respawn,
  ]);

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
