import { useEffect, useRef, useCallback, useState } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useInventoryStore, RESOURCES } from '../stores/inventoryStore';
import { useMapStore, MAP_TRANSITION_DURATION } from '../stores/mapStore';
import { useQuestStore } from '../stores/questStore';
import { useDroppedItemStore } from '../stores/droppedItemStore';
import { useLifeSkillStore, TOOL_TO_SKILL, getResourceExp, resourceMatchesSkill } from '../stores/lifeSkillStore';
import { useAuthStore } from '../stores/authStore';
import { CONFIG, type Direction, type ToolType } from '@shared/types';
import { Player } from './entities/Player';
import { Camera } from './core/Camera';
import { GameMap, type Portal } from './core/GameMap';
import { ResourceManager } from './entities/Resource';
import { MonsterManager, type MonsterSpawnConfig, type MonsterType } from './entities/Monster';
import { NPCManager } from './entities/NPCManager';
import { NPC } from './entities/NPC';
import {
  drawSlashEffect,
  drawHitEffect,
  drawHarvestEffect,
  createHarvestParticles,
  updateParticles,
  drawDamageNumber,
  updateDamageNumbers,
  drawDashEffect,
  drawDashGhost,
  drawCriticalEffect,
  createCriticalParticles,
  drawHarvestProgressEffect,
  drawSkillEffect,
  updateSkillEffects,
  createSkillEffect,
  type Particle,
  type DamageNumber,
  type DashGhost,
  type SkillEffect,
} from './effects';
import { useSkillStore } from '../stores/skillStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { useFishingStore } from '../stores/fishingStore';
import { useMultiplayerStore, type OtherPlayer } from '../stores/multiplayerStore';
import { FISHING_SPOTS, drawFishingSpot } from './systems/FishingSystem';
import { JOB_WEAPONS } from './weapons';

// Map to store other player instances for rendering
const otherPlayerInstances = new Map<string, Player>();

// Track which players have active attack effects to avoid duplicates
const otherPlayerAttackEffects = new Map<string, boolean>();

// Get or create player instance for other players
function getOrCreateOtherPlayer(playerData: OtherPlayer): Player {
  let playerInstance = otherPlayerInstances.get(playerData.id);

  if (!playerInstance) {
    playerInstance = new Player(
      playerData.x,
      playerData.y,
      playerData.job,
      playerData.name,
      playerData.level
    );
    otherPlayerInstances.set(playerData.id, playerInstance);
  }

  return playerInstance;
}

// Clean up player instances that are no longer in the game
function cleanupOtherPlayers(currentPlayerIds: Set<string>): void {
  for (const id of otherPlayerInstances.keys()) {
    if (!currentPlayerIds.has(id)) {
      otherPlayerInstances.delete(id);
    }
  }
}

interface GameCanvasProps {
  onToggleStatWindow: () => void;
  onToggleInventory: () => void;
  onToggleJobChange: () => void;
  onNPCInteract: (npc: NPC) => void;
  onPlayerRightClick?: (playerId: string, playerName: string, screenX: number, screenY: number) => void;
}

export function GameCanvas({ onToggleStatWindow, onToggleInventory, onToggleJobChange, onNPCInteract, onPlayerRightClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const resourceManagerRef = useRef<ResourceManager | null>(null);
  const monsterManagerRef = useRef<MonsterManager | null>(null);
  const npcManagerRef = useRef<NPCManager | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Effects state
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const slashEffectRef = useRef<{ x: number; y: number; direction: 'up' | 'down' | 'left' | 'right'; progress: number } | null>(null);
  const hitEffectsRef = useRef<{ x: number; y: number; progress: number }[]>([]);
  const screenShakeRef = useRef<{ intensity: number; duration: number; elapsed: number } | null>(null);

  // Harvest state
  const harvestingRef = useRef<{ resourceId: number; progress: number } | null>(null);

  // Dash effects state
  const dashGhostsRef = useRef<DashGhost[]>([]);
  const dashEffectRef = useRef<{ x: number; y: number; direction: Direction; progress: number } | null>(null);

  // Critical effects state
  const criticalEffectsRef = useRef<{ x: number; y: number; progress: number }[]>([]);

  // Skill effects state
  const skillEffectsRef = useRef<SkillEffect[]>([]);

  // Mouse position tracking for ranged attacks/skills
  const mousePositionRef = useRef<{ x: number; y: number; worldX: number; worldY: number }>({
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
  });

  // Map transition state
  const [transitionOpacity, setTransitionOpacity] = useState(0);
  const portalCooldownRef = useRef<number>(0);

  // Respawn listener tracking to prevent memory leak
  const respawnListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  const {
    x: playerX,
    y: playerY,
    direction,
    facingRight,
    tool,
    toolSelected,
    isDead,
    isDashing,
    dashDirection,
    job,
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
    startDash,
    updateDash,
  } = usePlayerStore();

  const { addItem } = useInventoryStore();

  const {
    currentMapId,
    currentMapName,
    isTransitioning,
    transitionTargetMap,
    transitionTargetX,
    transitionTargetY,
    startMapTransition,
    completeMapTransition,
    updatePlayerPosition,
  } = useMapStore();

  // Initialize game objects
  useEffect(() => {
    const initialJob = usePlayerStore.getState().job;
    const initialLevel = usePlayerStore.getState().level;
    const selectedChar = useAuthStore.getState().selectedCharacter;
    const playerName = selectedChar?.name || '';
    playerRef.current = new Player(playerX, playerY, initialJob, playerName, initialLevel);
    cameraRef.current = new Camera();
    mapRef.current = new GameMap(currentMapId);
    resourceManagerRef.current = new ResourceManager();
    monsterManagerRef.current = new MonsterManager();
    npcManagerRef.current = new NPCManager();

    // Set camera bounds for initial map
    if (cameraRef.current && mapRef.current) {
      cameraRef.current.setMapBounds(mapRef.current.width, mapRef.current.height);
    }

    // Load monsters for initial map
    if (mapRef.current && monsterManagerRef.current) {
      const spawns = mapRef.current.getMonsterSpawns();
      const monsterSpawns: MonsterSpawnConfig[] = spawns.map(s => ({
        type: s.type as MonsterType,
        x: s.x,
        y: s.y,
        count: s.count,
        isBoss: s.isBoss,
      }));
      monsterManagerRef.current.loadMapMonsters(currentMapId, monsterSpawns);
    }

    // Load NPCs for initial map
    if (mapRef.current && npcManagerRef.current) {
      const npcSpawns = mapRef.current.getNpcSpawns();
      npcManagerRef.current.loadMapNPCs(npcSpawns);
    }

    // Set up monster sync callbacks for multiplayer
    const multiplayerStore = useMultiplayerStore.getState();
    multiplayerStore.setMonsterCallbacks(
      // onMonsterDamaged - when other player damages a monster
      (monsterId: number, newHp: number, damage: number) => {
        if (monsterManagerRef.current) {
          monsterManagerRef.current.syncMonsterDamage(monsterId, newHp);
        }
      },
      // onMonsterKilled - when other player kills a monster
      (monsterId: number) => {
        if (monsterManagerRef.current) {
          monsterManagerRef.current.syncMonsterKilled(monsterId);
        }
      }
    );
  }, []);

  // Handle job changes - update player sprite and weapon
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setJob(job);
    }
    // Sync weapon with job
    const correctWeapon = JOB_WEAPONS[job] || 'bone';
    const currentWeapon = usePlayerStore.getState().weapon;
    if (currentWeapon !== correctWeapon) {
      usePlayerStore.setState({ weapon: correctWeapon as any });
    }
  }, [job]);

  // Handle map changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.mapId !== currentMapId) {
      mapRef.current.loadMap(currentMapId);

      // Update camera bounds for new map
      if (cameraRef.current) {
        cameraRef.current.setMapBounds(mapRef.current.width, mapRef.current.height);
      }

      // Load new map's monsters
      if (monsterManagerRef.current) {
        const spawns = mapRef.current.getMonsterSpawns();
        const monsterSpawns: MonsterSpawnConfig[] = spawns.map(s => ({
          type: s.type as MonsterType,
          x: s.x,
          y: s.y,
          count: s.count,
          isBoss: s.isBoss,
        }));
        monsterManagerRef.current.loadMapMonsters(currentMapId, monsterSpawns);
      }

      // Load new map's NPCs
      if (npcManagerRef.current) {
        const npcSpawns = mapRef.current.getNpcSpawns();
        npcManagerRef.current.loadMapNPCs(npcSpawns);
      }
    }
  }, [currentMapId]);

  // Handle map transitions
  useEffect(() => {
    if (isTransitioning) {
      // Fade out
      let opacity = 0;
      const fadeOutInterval = setInterval(() => {
        opacity += 0.1;
        setTransitionOpacity(Math.min(1, opacity));
        if (opacity >= 1) {
          clearInterval(fadeOutInterval);

          // Complete transition after fade out
          completeMapTransition();
          setPosition(transitionTargetX, transitionTargetY);

          // Fade in
          let fadeInOpacity = 1;
          const fadeInInterval = setInterval(() => {
            fadeInOpacity -= 0.1;
            setTransitionOpacity(Math.max(0, fadeInOpacity));
            if (fadeInOpacity <= 0) {
              clearInterval(fadeInInterval);
            }
          }, MAP_TRANSITION_DURATION / 10);
        }
      }, MAP_TRANSITION_DURATION / 10);
    }
  }, [isTransitioning, transitionTargetX, transitionTargetY, completeMapTransition, setPosition]);

  // Helper: Calculate direction from player to mouse
  // worldX/worldY now store direction vectors (mouse - screen center)
  const getMouseDirection = useCallback((): Direction => {
    const mouse = mousePositionRef.current;
    const dx = mouse.worldX; // Already a direction vector
    const dy = mouse.worldY;

    // Return the direction based on the dominant axis
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, []);

  // Helper: Get angle from player to mouse (in radians)
  const getMouseAngle = useCallback((): number => {
    const mouse = mousePositionRef.current;
    return Math.atan2(mouse.worldY, mouse.worldX); // Direct direction vector
  }, []);

  // Helper: Check if current job is ranged
  const isRangedJob = useCallback((jobType: string): boolean => {
    const rangedJobs = ['Archer', 'Gunner', 'Bowmaster', 'Crossbowman', 'Mage', 'Elemental', 'Holy', 'Dark', 'Shuriken'];
    return rangedJobs.includes(jobType);
  }, []);

  // Perform attack function (used by both mouse click and space key)
  const performAttack = useCallback(() => {
    if (isDead) return;

    const canAttack = startAttack();
    if (!canAttack || !monsterManagerRef.current) return;

    const currentJob = usePlayerStore.getState().job;
    const isRanged = isRangedJob(currentJob);
    const currentPlayerX = usePlayerStore.getState().x;
    const currentPlayerY = usePlayerStore.getState().y;

    // mousePositionRef now stores direction vector (dirX, dirY) in worldX, worldY
    const dirX = mousePositionRef.current.worldX;
    const dirY = mousePositionRef.current.worldY;

    // Calculate angle from direction vector
    const mouseAngle = Math.atan2(dirY, dirX);

    // Calculate attack direction from mouse
    let attackDir: Direction;
    if (Math.abs(dirX) > Math.abs(dirY)) {
      attackDir = dirX > 0 ? 'right' : 'left';
    } else {
      attackDir = dirY > 0 ? 'down' : 'up';
    }

    // Calculate attack range and target position
    const meleeRange = 70;
    const rangedRange = 250;
    const attackRange = isRanged ? rangedRange : meleeRange;

    // Calculate target position towards mouse direction
    const targetX = currentPlayerX + Math.cos(mouseAngle) * attackRange;
    const targetY = currentPlayerY + Math.sin(mouseAngle) * attackRange;

    // Update facing direction based on mouse direction
    if (dirX > 0) {
      setFacingRight(true);
    } else if (dirX < 0) {
      setFacingRight(false);
    }

    // Update player direction to match attack direction (for weapon animation)
    usePlayerStore.setState({ direction: attackDir });

    // Send attack to server for other players (with target position)
    const multiplayerStore = useMultiplayerStore.getState();
    if (multiplayerStore.isConnected) {
      multiplayerStore.updateCombatState(true, isRanged ? 'ranged' : 'melee', targetX, targetY);
    }

    if (isRanged) {
      // Create projectile effect for ranged attack
      const effectType = currentJob === 'Gunner' ? 'bullet'
        : currentJob === 'Crossbowman' ? 'crossbow_bolt'
        : currentJob === 'Bowmaster' ? 'power_arrow'
        : currentJob === 'Archer' ? 'arrow'
        : currentJob === 'Shuriken' ? 'shuriken'
        : ['Mage', 'Elemental'].includes(currentJob) ? 'magic_missile'
        : currentJob === 'Holy' ? 'holy_bolt'
        : currentJob === 'Dark' ? 'dark_bolt'
        : 'arrow';

      skillEffectsRef.current.push(
        createSkillEffect(effectType, currentPlayerX, currentPlayerY, targetX, targetY, attackDir, 300)
      );
    } else {
      // Melee slash effect towards mouse direction
      slashEffectRef.current = {
        x: currentPlayerX,
        y: currentPlayerY,
        direction: attackDir,
        progress: 0,
      };
    }

    // Find monsters in attack direction
    const allMonsters = monsterManagerRef.current.getMonstersInRange(currentPlayerX, currentPlayerY, attackRange + 30);

    const monstersInRange = allMonsters.filter(monster => {
      const monsterDx = monster.x - currentPlayerX;
      const monsterDy = monster.y - currentPlayerY;
      const monsterAngle = Math.atan2(monsterDy, monsterDx);
      const angleDiff = Math.abs(monsterAngle - mouseAngle);
      const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
      const distance = Math.sqrt(monsterDx * monsterDx + monsterDy * monsterDy);

      // Cone angle depends on melee vs ranged
      const coneAngle = isRanged ? 0.4 : 0.8; // ~23 degrees for ranged, ~46 for melee
      return normalizedDiff < coneAngle && distance <= attackRange;
    });

    const { damage: attackPower, isCritical } = getAttackPower();

    if (monstersInRange.length > 0) {
      screenShakeRef.current = {
        intensity: isCritical ? 10 + monstersInRange.length * 3 : 5 + monstersInRange.length * 2,
        duration: isCritical ? 250 : 150,
        elapsed: 0,
      };
    }

    monstersInRange.forEach((monster) => {
      const result = monsterManagerRef.current!.damageMonster(monster.id, attackPower);

      // Get updated monster HP after damage
      const updatedMonster = monsterManagerRef.current!.getMonsterById(monster.id);
      const newHp = updatedMonster ? updatedMonster.hp : 0;

      // Send damage to server for other players to sync
      const mpStore = useMultiplayerStore.getState();
      if (mpStore.isConnected) {
        mpStore.sendMonsterDamage(monster.id, attackPower, newHp, result.killed, result.exp);
      }

      damageNumbersRef.current.push({
        x: monster.x,
        y: monster.y - 30,
        value: attackPower,
        life: 1,
        maxLife: 1,
        isCritical: isCritical,
      });

      hitEffectsRef.current.push({
        x: monster.x,
        y: monster.y,
        progress: 0,
      });

      if (isCritical) {
        criticalEffectsRef.current.push({
          x: monster.x,
          y: monster.y,
          progress: 0,
        });
        particlesRef.current.push(...createCriticalParticles(monster.x, monster.y));
      }

      if (result.killed) {
        gainExp(result.exp);
        useQuestStore.getState().updateQuestProgress('kill', monster.type, 1);

        // Drop item with 30% chance
        if (Math.random() < 0.3) {
          const dropStore = useDroppedItemStore.getState();
          const socketId = useMultiplayerStore.getState().isConnected
            ? require('../services/socket').socketService.getSocket()?.id
            : undefined;

          // Determine item rarity based on monster type
          const rarityRoll = Math.random();
          let rarity: 'common' | 'uncommon' | 'rare' = 'common';
          if (monster.isBoss) {
            rarity = rarityRoll < 0.5 ? 'rare' : rarityRoll < 0.8 ? 'uncommon' : 'common';
          } else {
            rarity = rarityRoll < 0.1 ? 'rare' : rarityRoll < 0.3 ? 'uncommon' : 'common';
          }

          dropStore.dropItem({
            itemId: `monster_drop_${monster.type}`,
            itemName: `${monster.type} 드롭 아이템`,
            itemType: 'resource',
            quantity: 1,
            rarity,
            x: monster.x + (Math.random() - 0.5) * 30,
            y: monster.y + (Math.random() - 0.5) * 30,
            ownerId: socketId,
          });
        }
      }
    });
  }, [isDead, startAttack, isRangedJob, setFacingRight, getAttackPower, gainExp]);

  // Mouse click handler for attacks
  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (!toolSelected || e.button !== 0) return; // Left click only
      e.preventDefault();

      // Simple approach: Calculate direction from screen center (player) to mouse
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();

        // Mouse position relative to canvas (0,0 is top-left of canvas)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Screen center (where player is rendered)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Direction vector from player to mouse (in screen space)
        const dirX = mouseX - centerX;
        const dirY = mouseY - centerY;

        // Store this for attack calculation
        mousePositionRef.current = {
          x: mouseX,
          y: mouseY,
          // Store direction instead of world coords
          worldX: dirX,
          worldY: dirY,
        };
      }

      performAttack();
    },
    [toolSelected, performAttack]
  );

  // Right-click handler for context menu on other players
  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      if (!onPlayerRightClick || !cameraRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert screen position to world position
      const worldX = mouseX + cameraRef.current.x;
      const worldY = mouseY + cameraRef.current.y;

      // Check if click is near any other player (within 50px)
      const otherPlayersMap = useMultiplayerStore.getState().otherPlayers;
      const CLICK_RANGE = 50;

      for (const [playerId, player] of otherPlayersMap) {
        const dx = worldX - player.x;
        const dy = worldY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= CLICK_RANGE) {
          // Found a player within range
          onPlayerRightClick(playerId, player.name, e.clientX, e.clientY);
          return;
        }
      }
    },
    [onPlayerRightClick]
  );

  // Attach mouse click listener to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !toolSelected) return;

    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('contextmenu', handleRightClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseClick);
      canvas.removeEventListener('contextmenu', handleRightClick);
    };
  }, [handleMouseClick, handleRightClick, toolSelected]);

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
          // Attack (Space key as backup, main attack is left click)
          e.preventDefault();
          performAttack();
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
          onToggleStatWindow();
          break;
        case 'i':
          e.preventDefault();
          onToggleInventory();
          break;
        case 'j':
          e.preventDefault();
          onToggleJobChange();
          break;
        case 'f':
          // Interact with NPC
          e.preventDefault();
          if (!isDead && npcManagerRef.current) {
            const nearbyNPC = npcManagerRef.current.getNPCAtPosition(playerX, playerY);
            if (nearbyNPC) {
              onNPCInteract(nearbyNPC);
            }
          }
          break;
        case 'r':
          // Start fishing (requires fishing rod tool)
          e.preventDefault();
          if (!isDead) {
            const playerState = usePlayerStore.getState();
            const fishingStore = useFishingStore.getState();
            const mapStore = useMapStore.getState();

            // Check if player has fishing rod equipped
            if (playerState.tool !== 'fishing_rod') {
              console.log('[Fishing] 낚싯대가 필요합니다. 도구 장인에게서 낚싯대를 장착하세요.');
              return;
            }

            if (fishingStore.state === 'idle') {
              const nearbySpot = fishingStore.isNearFishingSpot(playerX, playerY, mapStore.currentMapId);
              if (nearbySpot) {
                fishingStore.startFishing(nearbySpot);
              }
            }
          }
          break;
        case 'shift':
          // Dash
          e.preventDefault();
          if (!isDead) {
            const canDash = startDash();
            if (canDash) {
              // Create dash start effect
              const currentState = usePlayerStore.getState();
              dashEffectRef.current = {
                x: currentState.x,
                y: currentState.y,
                direction: currentState.dashDirection || currentState.direction,
                progress: 0,
              };
            }
          }
          break;
        // Skill/Item keys 1-6
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          if (!isDead) {
            const slotIndex = parseInt(e.key) - 1;
            const skillStore = useSkillStore.getState();
            const slot = skillStore.skillSlots[slotIndex];

            // Handle item usage if slot has an item
            if (slot && slot.itemId) {
              const equipmentStore = useEquipmentStore.getState();
              const result = equipmentStore.useConsumable(slot.itemId);
              if (result.success) {
                // Add heal/mana/buff effect when using item
                const consumable = equipmentStore.allItems.consumables[slot.itemId];
                if (consumable) {
                  let effectColor: string;
                  let effectType: string;
                  let effectDuration: number = 500;

                  switch (consumable.effect) {
                    case 'heal':
                      effectColor = '#FF5555';
                      effectType = 'heal';
                      break;
                    case 'mana':
                      effectColor = '#5555FF';
                      effectType = 'heal';
                      break;
                    case 'buff_attack':
                      effectColor = '#FF6B6B';
                      effectType = 'buff';
                      effectDuration = 1000;
                      break;
                    case 'buff_defense':
                      effectColor = '#4ECDC4';
                      effectType = 'buff';
                      effectDuration = 1000;
                      break;
                    default:
                      effectColor = '#FFAA00';
                      effectType = 'buff';
                  }

                  skillEffectsRef.current.push({
                    type: effectType,
                    x: playerX,
                    y: playerY,
                    targetX: playerX,
                    targetY: playerY,
                    direction: direction,
                    progress: 0,
                    duration: effectDuration,
                    color: effectColor
                  });

                  // Screen shake for buff scrolls
                  if (consumable.effect === 'buff_attack' || consumable.effect === 'buff_defense') {
                    screenShakeRef.current = {
                      intensity: 3,
                      duration: 150,
                      elapsed: 0,
                    };
                  }
                }
              }
              break;
            }

            // Handle skill usage if slot has a skill
            if (slot && slot.skillId) {
              const skill = skillStore.allSkills[slot.skillId];
              if (skill) {
                const skillResult = skillStore.useSkill(slot.skillId);
                if (skillResult.success) {
                  // Create skill effect
                  const effectType = skill.effect || 'slash';
                  let targetX = playerX;
                  let targetY = playerY;

                  // For projectile/ranged skills, use mouse direction
                  const isProjectileSkill = skill.projectile || (skill.range && skill.range > 100);
                  const skillMousePos = mousePositionRef.current;
                  const skillMouseDir = getMouseDirection();
                  const skillDir = isProjectileSkill ? skillMouseDir : direction;

                  if (isProjectileSkill) {
                    const skillRange = skill.range || 150;
                    const skillAngle = getMouseAngle();
                    targetX = playerX + Math.cos(skillAngle) * skillRange;
                    targetY = playerY + Math.sin(skillAngle) * skillRange;

                    // Update facing direction based on mouse direction vector
                    if (skillMousePos.worldX > 0) {
                      setFacingRight(true);
                    } else if (skillMousePos.worldX < 0) {
                      setFacingRight(false);
                    }
                  }

                  // Create the skill effect
                  skillEffectsRef.current.push(
                    createSkillEffect(
                      effectType,
                      playerX,
                      playerY,
                      targetX,
                      targetY,
                      skillDir,
                      skill.cooldown > 5000 ? 1500 : skill.cooldown > 2000 ? 800 : 500
                    )
                  );

                  // Send skill use to server for other players
                  const multiplayerStoreForSkill = useMultiplayerStore.getState();
                  if (multiplayerStoreForSkill.isConnected) {
                    multiplayerStoreForSkill.sendSkillUse(
                      slot.skillId,
                      playerX,
                      playerY,
                      targetX,
                      targetY,
                      skillDir
                    );
                  }

                  // Deal damage if it's an attack skill
                  if (skill.damage && monsterManagerRef.current) {
                    const attackRange = skill.range || 60;
                    let monstersInRange;

                    if (isProjectileSkill && !skill.aoe) {
                      // For projectile skills, find monsters along the path to mouse
                      const allMonsters = monsterManagerRef.current.getMonstersInRange(playerX, playerY, attackRange + 50);
                      const skillAngle = getMouseAngle();

                      monstersInRange = allMonsters.filter(monster => {
                        const dx = monster.x - playerX;
                        const dy = monster.y - playerY;
                        const monsterAngle = Math.atan2(dy, dx);
                        const angleDiff = Math.abs(monsterAngle - skillAngle);
                        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        // Within ~40 degree cone for skills (wider than basic attack)
                        return normalizedDiff < 0.7 && distance <= attackRange;
                      });
                    } else if (skill.aoe) {
                      // AOE skills target where the mouse is pointing (for projectile AOE) or around player
                      monstersInRange = monsterManagerRef.current.getMonstersInRange(
                        skill.projectile ? targetX : playerX,
                        skill.projectile ? targetY : playerY,
                        skill.aoeRadius || attackRange
                      );
                    } else {
                      monstersInRange = monsterManagerRef.current.getMonstersInRange(
                        playerX,
                        playerY,
                        attackRange
                      );
                    }

                    const { damage: baseAttack, isCritical: baseCrit } = getAttackPower();
                    const skillDamage = Math.floor(baseAttack * skill.damage);
                    const hitCount = skill.hits || 1;

                    monstersInRange.forEach((monster) => {
                      for (let hit = 0; hit < hitCount; hit++) {
                        const isCritical = baseCrit || (skill.critBonus ? Math.random() < skill.critBonus : false);
                        const critMultiplier = isCritical ? 1.5 : 1;
                        const finalDamage = Math.floor(skillDamage * critMultiplier);

                        const dmgResult = monsterManagerRef.current!.damageMonster(monster.id, finalDamage);

                        // Get updated monster HP after damage
                        const updatedMonster = monsterManagerRef.current!.getMonsterById(monster.id);
                        const newHp = updatedMonster ? updatedMonster.hp : 0;

                        // Send damage to server for other players to sync
                        const mpStoreSkill = useMultiplayerStore.getState();
                        if (mpStoreSkill.isConnected) {
                          mpStoreSkill.sendMonsterDamage(monster.id, finalDamage, newHp, dmgResult.killed, dmgResult.exp);
                        }

                        // Damage number (slightly offset for multiple hits)
                        damageNumbersRef.current.push({
                          x: monster.x + (hit * 10 - (hitCount - 1) * 5),
                          y: monster.y - 30 - hit * 10,
                          value: finalDamage,
                          life: 1,
                          maxLife: 1,
                          isCritical,
                        });

                        // Hit effect
                        hitEffectsRef.current.push({
                          x: monster.x,
                          y: monster.y,
                          progress: 0,
                        });

                        if (isCritical) {
                          criticalEffectsRef.current.push({
                            x: monster.x,
                            y: monster.y,
                            progress: 0,
                          });
                          particlesRef.current.push(...createCriticalParticles(monster.x, monster.y));
                        }

                        if (dmgResult.killed) {
                          gainExp(dmgResult.exp);
                          useQuestStore.getState().updateQuestProgress('kill', monster.type, 1);
                        }
                      }
                    });

                    // Screen shake for skill hits
                    if (monstersInRange.length > 0) {
                      screenShakeRef.current = {
                        intensity: Math.min(15, 5 + skill.damage * 2 + monstersInRange.length * 2),
                        duration: 200,
                        elapsed: 0,
                      };
                    }
                  }

                  // Heal skill
                  if (skill.healAmount) {
                    const currentPlayer = usePlayerStore.getState();
                    const healValue = Math.floor(skill.healAmount + (skill.healScale || 0) * currentPlayer.int);
                    currentPlayer.heal(healValue);
                  }
                }
              }
            }
          }
          break;
      }
    },
    [
      toolSelected,
      isDead,
      playerX,
      playerY,
      direction,
      tool,
      setKey,
      setFacingRight,
      startDash,
      onNPCInteract,
      getAttackPower,
      gainExp,
      onToggleStatWindow,
      onToggleInventory,
      onToggleJobChange,
      getMouseDirection,
      getMouseAngle,
      performAttack,
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

  // Mouse move handler for ranged attacks/skills
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Screen center (where player is rendered)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Direction vector from player to mouse
      const dirX = mouseX - centerX;
      const dirY = mouseY - centerY;

      mousePositionRef.current = {
        x: mouseX,
        y: mouseY,
        worldX: dirX,
        worldY: dirY,
      };
    },
    []
  );

  // Attach mouse move listener to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

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
      const mapState = useMapStore.getState();

      // Don't process game logic during transitions
      if (mapState.isTransitioning) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      // Update portal cooldown
      if (portalCooldownRef.current > 0) {
        portalCooldownRef.current -= deltaTime;
      }

      if (state.isDead) {
        // Death screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('사망', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 30);

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(
          'R 키를 눌러 시작 마을에서 부활',
          CONFIG.CANVAS_WIDTH / 2,
          CONFIG.CANVAS_HEIGHT / 2 + 30
        );

        // Handle respawn key - only add listener once
        if (!respawnListenerRef.current) {
          const handleRespawn = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
              respawn();
              // Move to starting village
              const mapStore = useMapStore.getState();
              if (mapStore.currentMapId !== 'town') {
                mapStore.setCurrentMap('town', 640, 640);
              }
              // Clean up listener
              if (respawnListenerRef.current) {
                window.removeEventListener('keydown', respawnListenerRef.current);
                respawnListenerRef.current = null;
              }
            }
          };
          respawnListenerRef.current = handleRespawn;
          window.addEventListener('keydown', handleRespawn);
        }

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
        // Apply dash speed multiplier if dashing
        const speedMultiplier = state.isDashing ? CONFIG.DASH_SPEED_MULTIPLIER : 1;
        const speed = CONFIG.PLAYER_SPEED * speedMultiplier * (deltaTime / 1000);
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

          // Map boundary
          const mapWidth = mapRef.current.getMapPixelWidth();
          const mapHeight = mapRef.current.getMapPixelHeight();
          newX = Math.max(CONFIG.TILE_SIZE, Math.min(newX, mapWidth - CONFIG.TILE_SIZE));
          newY = Math.max(CONFIG.TILE_SIZE, Math.min(newY, mapHeight - CONFIG.TILE_SIZE));

          // Check for portal collision
          if (portalCooldownRef.current <= 0) {
            const portal = mapRef.current.checkPortalCollision(newX, newY);
            if (portal) {
              portalCooldownRef.current = 1000; // 1 second cooldown
              startMapTransition(portal.targetMap, portal.targetX, portal.targetY);
            }
          }
        }

        setPosition(newX, newY);
        // Only update direction from movement if not currently attacking
        const currentState = usePlayerStore.getState();
        if (!currentState.isAttacking) {
          setDirection(newDirection);
        }
        updatePlayerPosition(newX, newY);

        // Cancel harvesting when moving
        harvestingRef.current = null;

        // Cancel fishing when moving
        const fishingStore = useFishingStore.getState();
        if (fishingStore.state !== 'idle' && fishingStore.state !== 'caught') {
          fishingStore.cancelFishing();
        }

        // Sync position to server for multiplayer
        const multiplayerStore = useMultiplayerStore.getState();
        if (multiplayerStore.isConnected) {
          multiplayerStore.updatePosition(newX, newY, newDirection, true);
        }
      } else {
        // When stopped, send isMoving=false to server
        const multiplayerStore = useMultiplayerStore.getState();
        const currentPlayerState = usePlayerStore.getState();
        if (multiplayerStore.isConnected && currentPlayerState.isMoving) {
          // Only send stop once when transitioning from moving to stopped
          multiplayerStore.updatePosition(currentPlayerState.x, currentPlayerState.y, currentPlayerState.direction, false);
        }
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

      // Update dash
      updateDash(deltaTime);

      // Generate dash ghosts while dashing
      const updatedStateForDash = usePlayerStore.getState();
      if (updatedStateForDash.isDashing && isPlayerMoving) {
        // Add ghost at current position every frame while dashing
        if (dashGhostsRef.current.length < 6) {
          dashGhostsRef.current.push({
            x: updatedStateForDash.x,
            y: updatedStateForDash.y,
            alpha: 0.6,
            facingRight: updatedStateForDash.facingRight,
          });
        }
      }

      // Update dash ghosts (fade out)
      dashGhostsRef.current = dashGhostsRef.current
        .map(ghost => ({ ...ghost, alpha: ghost.alpha - deltaTime / 150 }))
        .filter(ghost => ghost.alpha > 0);

      // Update dash effect
      if (dashEffectRef.current) {
        dashEffectRef.current.progress += deltaTime / 300;
        if (dashEffectRef.current.progress >= 1) {
          dashEffectRef.current = null;
        }
      }

      // Update player
      if (playerRef.current) {
        const updatedState = usePlayerStore.getState();
        const selectedChar = useAuthStore.getState().selectedCharacter;
        playerRef.current.x = updatedState.x;
        playerRef.current.y = updatedState.y;
        playerRef.current.facingRight = updatedState.facingRight;
        playerRef.current.setNameAndLevel(selectedChar?.name || '', updatedState.level);
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

      // Update NPCs
      if (npcManagerRef.current) {
        const updatedState = usePlayerStore.getState();
        npcManagerRef.current.update(deltaTime);
        npcManagerRef.current.updatePlayerProximity(updatedState.x, updatedState.y);
      }

      // Update fishing
      const fishingStoreState = useFishingStore.getState();
      if (fishingStoreState.state !== 'idle') {
        fishingStoreState.updateFishing(deltaTime);
      }

      // Harvesting
      if (harvestingRef.current && resourceManagerRef.current) {
        harvestingRef.current.progress += deltaTime;

        if (harvestingRef.current.progress >= CONFIG.HARVEST_TIME) {
          const result = resourceManagerRef.current.harvestResource(harvestingRef.current.resourceId);

          if (result) {
            addItem(result.resourceId);
            gainExp(result.exp);
            // Update quest progress for gather quests
            useQuestStore.getState().updateQuestProgress('gather', result.resourceId, 1);

            // Update life skill exp if using appropriate tool
            const currentTool = usePlayerStore.getState().tool as ToolType | null;
            if (currentTool) {
              const skillType = TOOL_TO_SKILL[currentTool];
              if (resourceMatchesSkill(result.resourceId, skillType)) {
                const skillExp = getResourceExp(result.resourceId);
                useLifeSkillStore.getState().gainSkillExp(skillType, skillExp);
              }
            }

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

      // Update critical effects
      criticalEffectsRef.current = criticalEffectsRef.current
        .map((c) => ({ ...c, progress: c.progress + deltaTime / 400 }))
        .filter((c) => c.progress < 1);

      // Update skill effects
      skillEffectsRef.current = updateSkillEffects(skillEffectsRef.current, deltaTime);

      // Update buff effects
      useSkillStore.getState().updateBuffs();
      useEquipmentStore.getState().updateBuffs();

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

      // Fishing spots
      const currentMapIdForFishing = useMapStore.getState().currentMapId;
      const fishingSpotsForMap = FISHING_SPOTS.filter(spot => spot.mapId === currentMapIdForFishing);
      const animationFrame = Math.floor(Date.now() / 16); // ~60fps animation frame
      fishingSpotsForMap.forEach(spot => {
        drawFishingSpot(ctx, spot, cameraX, cameraY, animationFrame);
      });

      // Monsters
      if (monsterManagerRef.current) {
        monsterManagerRef.current.render(ctx, cameraX, cameraY);
      }

      // NPCs
      if (npcManagerRef.current) {
        npcManagerRef.current.render(ctx, cameraX, cameraY);
      }

      // Other players (multiplayer) - render as actual characters
      const otherPlayersMap = useMultiplayerStore.getState().otherPlayers;
      const currentPlayerIds = new Set(otherPlayersMap.keys());
      cleanupOtherPlayers(currentPlayerIds);

      otherPlayersMap.forEach((otherPlayerData: OtherPlayer) => {
        const otherPlayerInstance = getOrCreateOtherPlayer(otherPlayerData);

        // Update player instance with latest data
        otherPlayerInstance.x = otherPlayerData.x;
        otherPlayerInstance.y = otherPlayerData.y;
        otherPlayerInstance.setJob(otherPlayerData.job);
        otherPlayerInstance.setNameAndLevel(otherPlayerData.name, otherPlayerData.level);

        // Determine facing direction based on direction
        if (otherPlayerData.direction === 'left') {
          otherPlayerInstance.facingRight = false;
        } else if (otherPlayerData.direction === 'right') {
          otherPlayerInstance.facingRight = true;
        }

        // Update animation state
        otherPlayerInstance.update(
          deltaTime,
          otherPlayerData.isMoving,
          otherPlayerData.direction,
          otherPlayerData.weapon as any,
          otherPlayerData.isAttacking
        );

        // Render the player
        otherPlayerInstance.render(ctx, cameraX, cameraY);

        // Draw HP bar above the player
        const screenX = otherPlayerData.x - cameraX;
        const screenY = otherPlayerData.y - cameraY;
        const hpPercent = otherPlayerData.hp / otherPlayerData.maxHp;
        const hpBarWidth = 50;
        const hpBarHeight = 6;
        const hpBarY = screenY - 70;

        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(screenX - hpBarWidth / 2, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

        // Create attack effect for other players - add to skillEffectsRef for animation
        if (otherPlayerData.isAttacking && !otherPlayerAttackEffects.get(otherPlayerData.id)) {
          // Mark that we've created an effect for this attack
          otherPlayerAttackEffects.set(otherPlayerData.id, true);

          const attackDir = otherPlayerData.direction;
          const attackX = otherPlayerData.x;
          const attackY = otherPlayerData.y;

          // Use actual target coordinates from attack data
          const targetX = otherPlayerData.attackTargetX ?? attackX;
          const targetY = otherPlayerData.attackTargetY ?? attackY;

          if (otherPlayerData.attackType === 'ranged') {
            // Determine effect type based on job
            const effectType = ['Archer', 'Bowmaster'].includes(otherPlayerData.job) ? 'arrow'
              : otherPlayerData.job === 'Gunner' ? 'bullet'
              : otherPlayerData.job === 'Crossbowman' ? 'crossbow_bolt'
              : otherPlayerData.job === 'Shuriken' ? 'shuriken'
              : ['Mage', 'Elemental'].includes(otherPlayerData.job) ? 'magic_missile'
              : otherPlayerData.job === 'Holy' ? 'holy_bolt'
              : otherPlayerData.job === 'Dark' ? 'dark_bolt'
              : 'arrow';

            // Add to skill effects array for proper animation with actual target
            skillEffectsRef.current.push(
              createSkillEffect(effectType, attackX, attackY, targetX, targetY, attackDir, 300)
            );
          } else {
            // Melee attack - add slash effect
            slashEffectRef.current = {
              x: attackX,
              y: attackY,
              direction: attackDir,
              progress: 0,
            };
          }
        } else if (!otherPlayerData.isAttacking && otherPlayerAttackEffects.get(otherPlayerData.id)) {
          // Clear attack tracking when attack ends
          otherPlayerAttackEffects.delete(otherPlayerData.id);
        }

        // Create skill effect for other players - add to skillEffectsRef for animation
        if (otherPlayerData.currentSkill) {
          const skill = otherPlayerData.currentSkill;
          const skillKey = `${otherPlayerData.id}-${skill.skillId}-${skill.startTime}`;

          // Check if we already created this skill effect
          if (!otherPlayerAttackEffects.get(skillKey)) {
            otherPlayerAttackEffects.set(skillKey, true);

            // Add to skill effects array for proper animation
            skillEffectsRef.current.push(
              createSkillEffect(
                skill.skillId || 'slash',
                skill.x,
                skill.y,
                skill.targetX,
                skill.targetY,
                skill.direction,
                500
              )
            );

            // Clean up the key after animation duration
            setTimeout(() => {
              otherPlayerAttackEffects.delete(skillKey);
            }, 600);
          }
        }
      });

      // Dash ghosts (render before player)
      dashGhostsRef.current.forEach(ghost => {
        drawDashGhost(ctx, {
          ...ghost,
          x: ghost.x - cameraX,
          y: ghost.y - cameraY,
        });
      });

      // Player
      if (playerRef.current) {
        playerRef.current.render(ctx, cameraX, cameraY);
      }

      // Dash effect
      if (dashEffectRef.current) {
        drawDashEffect(
          ctx,
          dashEffectRef.current.x - cameraX,
          dashEffectRef.current.y - cameraY,
          dashEffectRef.current.direction,
          dashEffectRef.current.progress
        );
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

      // Critical effects
      criticalEffectsRef.current.forEach((c) => {
        drawCriticalEffect(ctx, c.x - cameraX, c.y - cameraY, c.progress);
      });

      // Skill effects
      skillEffectsRef.current.forEach((effect) => {
        drawSkillEffect(ctx, {
          ...effect,
          x: effect.x - cameraX,
          y: effect.y - cameraY,
          targetX: effect.targetX ? effect.targetX - cameraX : undefined,
          targetY: effect.targetY ? effect.targetY - cameraY : undefined,
        });
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

      // Harvest progress and visual effect
      if (harvestingRef.current && resourceManagerRef.current) {
        const resource = resourceManagerRef.current
          .getResources()
          .find((r) => r.id === harvestingRef.current?.resourceId);
        if (resource) {
          const screenX = resource.x - cameraX;
          const screenY = resource.y - cameraY;
          const progress = harvestingRef.current.progress / CONFIG.HARVEST_TIME;

          // Get resource color for effect
          const resourceData = RESOURCES[resource.resourceId];
          const effectColor = resourceData?.color || '#4CAF50';

          // Draw visual harvest effect (swirling particles + progress ring)
          drawHarvestProgressEffect(ctx, screenX, screenY, progress, effectColor);

          // Draw simple progress bar above (optional, backup display)
          const barY = screenY - 50;
          ctx.fillStyle = '#333';
          ctx.fillRect(screenX - 25, barY, 50, 8);
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(screenX - 25, barY, 50 * progress, 8);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX - 25, barY, 50, 8);
        }
      }

      // Crosshair cursor for ranged jobs
      const currentJob = state.job;
      const rangedJobs = ['Archer', 'Gunner', 'Bowmaster', 'Crossbowman', 'Mage', 'Elemental', 'Holy', 'Dark', 'Shuriken'];
      if (rangedJobs.includes(currentJob)) {
        const mouse = mousePositionRef.current;

        // Draw crosshair at mouse position
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        const crossSize = 12;
        const crossGap = 4;

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(mouse.x - crossSize, mouse.y);
        ctx.lineTo(mouse.x - crossGap, mouse.y);
        ctx.moveTo(mouse.x + crossGap, mouse.y);
        ctx.lineTo(mouse.x + crossSize, mouse.y);
        ctx.stroke();

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y - crossSize);
        ctx.lineTo(mouse.x, mouse.y - crossGap);
        ctx.moveTo(mouse.x, mouse.y + crossGap);
        ctx.lineTo(mouse.x, mouse.y + crossSize);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        // Draw aim line from player to cursor (subtle)
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const playerScreenX = state.x - cameraX;
        const playerScreenY = state.y - cameraY;
        ctx.moveTo(playerScreenX, playerScreenY);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
      }

      // Transition overlay
      if (transitionOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionOpacity})`;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      // Clean up respawn listener if still active
      if (respawnListenerRef.current) {
        window.removeEventListener('keydown', respawnListenerRef.current);
        respawnListenerRef.current = null;
      }
    };
  }, [
    toolSelected,
    setPosition,
    setDirection,
    setMoving,
    setFacingRight,
    updateAttack,
    updateDash,
    takeDamage,
    gainExp,
    addItem,
    respawn,
    startMapTransition,
    updatePlayerPosition,
    transitionOpacity,
  ]);

  // Check if current job is ranged for cursor style
  const currentJobForCursor = usePlayerStore((state) => state.job);
  const rangedJobsForCursor = ['Archer', 'Gunner', 'Bowmaster', 'Crossbowman', 'Mage', 'Elemental', 'Holy', 'Dark', 'Shuriken'];
  const isRangedForCursor = rangedJobsForCursor.includes(currentJobForCursor);

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.CANVAS_WIDTH}
      height={CONFIG.CANVAS_HEIGHT}
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'block',
        cursor: isRangedForCursor ? 'none' : 'default',
      }}
    />
  );
}
