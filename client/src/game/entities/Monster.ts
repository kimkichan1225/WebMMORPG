import { CONFIG } from '@shared/types';

export type MonsterType =
  | 'slime'
  | 'goblin'
  | 'wolf'
  | 'skeleton'
  | 'bat'
  | 'golem'
  | 'treant'
  | 'scorpion'
  | 'mummy'
  | 'sand_worm'
  | 'anubis'
  | 'fire_elemental'
  // Boss monsters
  | 'forest_boss'
  | 'cave_boss'
  | 'pyramid_boss';

export interface Monster {
  id: number;
  type: MonsterType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  isAlive: boolean;
  respawnTime: number;
  respawnTimer: number;
  spawnX: number;
  spawnY: number;
  isBoss: boolean;

  // AI state
  state: 'idle' | 'chase' | 'attack' | 'return';
  targetX: number;
  targetY: number;
  attackCooldown: number;
  idleTimer: number;

  // Animation
  animationFrame: number;
  animationTimer: number;
}

interface MonsterConfig {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  respawnTime: number;
  aggroRange: number;
  attackRange: number;
  color: string;
  secondaryColor: string;
  size: number;
  isBoss?: boolean;
}

export const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig> = {
  // Basic monsters
  slime: {
    maxHp: 50,
    attack: 8,
    defense: 2,
    speed: 60,
    exp: 25,
    respawnTime: 10000,
    aggroRange: 150,
    attackRange: 50,
    color: '#7BC96F',
    secondaryColor: '#5AA84A',
    size: 25,
  },
  goblin: {
    maxHp: 80,
    attack: 15,
    defense: 5,
    speed: 90,
    exp: 40,
    respawnTime: 15000,
    aggroRange: 180,
    attackRange: 45,
    color: '#4a9c4a',
    secondaryColor: '#2a6c2a',
    size: 22,
  },
  wolf: {
    maxHp: 100,
    attack: 20,
    defense: 8,
    speed: 120,
    exp: 55,
    respawnTime: 20000,
    aggroRange: 200,
    attackRange: 40,
    color: '#696969',
    secondaryColor: '#484848',
    size: 28,
  },
  skeleton: {
    maxHp: 120,
    attack: 25,
    defense: 10,
    speed: 70,
    exp: 65,
    respawnTime: 25000,
    aggroRange: 160,
    attackRange: 55,
    color: '#e8e8d8',
    secondaryColor: '#c8c8b8',
    size: 24,
  },
  bat: {
    maxHp: 40,
    attack: 12,
    defense: 3,
    speed: 140,
    exp: 30,
    respawnTime: 8000,
    aggroRange: 170,
    attackRange: 35,
    color: '#4a2a4a',
    secondaryColor: '#2a1a2a',
    size: 18,
  },
  golem: {
    maxHp: 200,
    attack: 35,
    defense: 25,
    speed: 40,
    exp: 100,
    respawnTime: 45000,
    aggroRange: 120,
    attackRange: 60,
    color: '#6a6a6a',
    secondaryColor: '#4a4a4a',
    size: 35,
  },
  treant: {
    maxHp: 180,
    attack: 30,
    defense: 20,
    speed: 35,
    exp: 90,
    respawnTime: 40000,
    aggroRange: 130,
    attackRange: 65,
    color: '#4a3a2a',
    secondaryColor: '#3a5a2a',
    size: 38,
  },
  scorpion: {
    maxHp: 90,
    attack: 22,
    defense: 12,
    speed: 95,
    exp: 50,
    respawnTime: 18000,
    aggroRange: 160,
    attackRange: 45,
    color: '#8b4513',
    secondaryColor: '#654321',
    size: 26,
  },
  mummy: {
    maxHp: 150,
    attack: 28,
    defense: 15,
    speed: 50,
    exp: 75,
    respawnTime: 30000,
    aggroRange: 140,
    attackRange: 50,
    color: '#c4a882',
    secondaryColor: '#a08862',
    size: 26,
  },
  sand_worm: {
    maxHp: 250,
    attack: 40,
    defense: 18,
    speed: 80,
    exp: 120,
    respawnTime: 50000,
    aggroRange: 180,
    attackRange: 70,
    color: '#c2a040',
    secondaryColor: '#8a7030',
    size: 40,
  },
  anubis: {
    maxHp: 200,
    attack: 45,
    defense: 22,
    speed: 100,
    exp: 150,
    respawnTime: 60000,
    aggroRange: 200,
    attackRange: 55,
    color: '#1a1a3a',
    secondaryColor: '#ffd700',
    size: 30,
  },
  fire_elemental: {
    maxHp: 160,
    attack: 50,
    defense: 10,
    speed: 90,
    exp: 110,
    respawnTime: 35000,
    aggroRange: 170,
    attackRange: 60,
    color: '#ff4500',
    secondaryColor: '#ff8c00',
    size: 28,
  },
  // Boss monsters
  forest_boss: {
    maxHp: 1000,
    attack: 60,
    defense: 30,
    speed: 50,
    exp: 500,
    respawnTime: 300000,
    aggroRange: 250,
    attackRange: 80,
    color: '#2a4a2a',
    secondaryColor: '#1a3a1a',
    size: 60,
    isBoss: true,
  },
  cave_boss: {
    maxHp: 1500,
    attack: 80,
    defense: 40,
    speed: 45,
    exp: 750,
    respawnTime: 300000,
    aggroRange: 250,
    attackRange: 90,
    color: '#4a4a4a',
    secondaryColor: '#ff6600',
    size: 65,
    isBoss: true,
  },
  pyramid_boss: {
    maxHp: 2000,
    attack: 100,
    defense: 50,
    speed: 55,
    exp: 1000,
    respawnTime: 300000,
    aggroRange: 280,
    attackRange: 100,
    color: '#ffd700',
    secondaryColor: '#1a1a3a',
    size: 70,
    isBoss: true,
  },
};

export interface MonsterSpawnConfig {
  type: MonsterType;
  x: number;
  y: number;
  count: number;
  isBoss?: boolean;
}

export class MonsterManager {
  private monsters: Monster[] = [];
  private nextId = 0;
  private currentMapId: string = '';

  constructor() {
    // Empty constructor - monsters are loaded via loadMapMonsters
  }

  loadMapMonsters(mapId: string, spawns: MonsterSpawnConfig[]): void {
    this.currentMapId = mapId;
    this.monsters = [];
    this.nextId = 0;

    spawns.forEach(spawn => {
      for (let i = 0; i < spawn.count; i++) {
        const offsetX = (Math.random() - 0.5) * 150;
        const offsetY = (Math.random() - 0.5) * 150;
        this.addMonster(
          spawn.type,
          spawn.x + offsetX,
          spawn.y + offsetY,
          spawn.isBoss || false
        );
      }
    });
  }

  private addMonster(type: MonsterType, x: number, y: number, isBoss: boolean = false): void {
    const config = MONSTER_CONFIGS[type];

    this.monsters.push({
      id: this.nextId++,
      type,
      x,
      y,
      hp: config.maxHp,
      maxHp: config.maxHp,
      attack: config.attack,
      defense: config.defense,
      speed: config.speed,
      exp: config.exp,
      isAlive: true,
      respawnTime: config.respawnTime,
      respawnTimer: 0,
      spawnX: x,
      spawnY: y,
      isBoss: isBoss || config.isBoss || false,
      state: 'idle',
      targetX: x,
      targetY: y,
      attackCooldown: 0,
      idleTimer: Math.random() * 3000,
      animationFrame: 0,
      animationTimer: 0,
    });
  }

  update(deltaTime: number, playerX: number, playerY: number): { attackingMonster: Monster | null } {
    let attackingMonster: Monster | null = null;

    this.monsters.forEach((monster) => {
      // Update animation
      monster.animationTimer += deltaTime;
      if (monster.animationTimer > 200) {
        monster.animationTimer = 0;
        monster.animationFrame = (monster.animationFrame + 1) % 4;
      }

      if (!monster.isAlive) {
        monster.respawnTimer -= deltaTime;
        if (monster.respawnTimer <= 0) {
          this.respawnMonster(monster);
        }
        return;
      }

      // Update cooldowns
      if (monster.attackCooldown > 0) {
        monster.attackCooldown -= deltaTime;
      }

      const config = MONSTER_CONFIGS[monster.type];

      // Calculate distance to player
      const dx = playerX - monster.x;
      const dy = playerY - monster.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);

      // Calculate distance to spawn
      const spawnDx = monster.spawnX - monster.x;
      const spawnDy = monster.spawnY - monster.y;
      const distToSpawn = Math.sqrt(spawnDx * spawnDx + spawnDy * spawnDy);

      // State machine
      switch (monster.state) {
        case 'idle':
          monster.idleTimer -= deltaTime;
          if (monster.idleTimer <= 0) {
            // Random movement
            monster.targetX = monster.spawnX + (Math.random() - 0.5) * 100;
            monster.targetY = monster.spawnY + (Math.random() - 0.5) * 100;
            monster.idleTimer = 2000 + Math.random() * 3000;
          }

          // Check for player in aggro range
          if (distToPlayer < config.aggroRange) {
            monster.state = 'chase';
          }

          // Move towards idle target
          this.moveTowards(monster, monster.targetX, monster.targetY, deltaTime, 0.5);
          break;

        case 'chase':
          // If too far from spawn, return
          if (distToSpawn > config.aggroRange * 2) {
            monster.state = 'return';
            break;
          }

          // If player out of range, return to idle
          if (distToPlayer > config.aggroRange * 1.5) {
            monster.state = 'return';
            break;
          }

          // If in attack range, attack
          if (distToPlayer < config.attackRange) {
            monster.state = 'attack';
            break;
          }

          // Chase player
          this.moveTowards(monster, playerX, playerY, deltaTime, 1);
          break;

        case 'attack':
          // If player moved out of range, chase
          if (distToPlayer > config.attackRange * 1.2) {
            monster.state = 'chase';
            break;
          }

          // Attack if cooldown is ready
          if (monster.attackCooldown <= 0) {
            attackingMonster = monster;
            monster.attackCooldown = monster.isBoss ? 2000 : 1500;
          }
          break;

        case 'return':
          // Return to spawn
          if (distToSpawn < 10) {
            monster.state = 'idle';
            monster.idleTimer = 1000;
            // Heal when returning
            monster.hp = Math.min(monster.maxHp, monster.hp + monster.maxHp * 0.1);
          } else {
            this.moveTowards(monster, monster.spawnX, monster.spawnY, deltaTime, 0.8);
          }

          // If player gets close again, re-aggro
          if (distToPlayer < config.aggroRange * 0.8) {
            monster.state = 'chase';
          }
          break;
      }
    });

    return { attackingMonster };
  }

  private moveTowards(monster: Monster, targetX: number, targetY: number, deltaTime: number, speedMultiplier: number): void {
    const dx = targetX - monster.x;
    const dy = targetY - monster.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const speed = monster.speed * speedMultiplier * (deltaTime / 1000);
      monster.x += (dx / dist) * speed;
      monster.y += (dy / dist) * speed;
    }
  }

  private respawnMonster(monster: Monster): void {
    const config = MONSTER_CONFIGS[monster.type];
    monster.hp = config.maxHp;
    monster.isAlive = true;
    monster.x = monster.spawnX;
    monster.y = monster.spawnY;
    monster.state = 'idle';
    monster.idleTimer = 1000;
    monster.attackCooldown = 0;
  }

  getMonstersInRange(x: number, y: number, range: number): Monster[] {
    return this.monsters.filter((m) => {
      if (!m.isAlive) return false;
      const dx = m.x - x;
      const dy = m.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  damageMonster(monsterId: number, damage: number): { killed: boolean; exp: number } {
    const monster = this.monsters.find((m) => m.id === monsterId);
    if (!monster || !monster.isAlive) return { killed: false, exp: 0 };

    const actualDamage = Math.max(1, damage - monster.defense);
    monster.hp -= actualDamage;

    if (monster.hp <= 0) {
      monster.isAlive = false;
      monster.respawnTimer = monster.respawnTime;
      return { killed: true, exp: monster.exp };
    }

    // Aggro on damage
    if (monster.state === 'idle' || monster.state === 'return') {
      monster.state = 'chase';
    }

    return { killed: false, exp: 0 };
  }

  getMonsters(): Monster[] {
    return this.monsters;
  }

  // Update monster HP from server sync (other player's attack)
  syncMonsterDamage(monsterId: number, newHp: number): void {
    const monster = this.monsters.find((m) => m.id === monsterId);
    if (!monster) return;

    monster.hp = Math.max(0, newHp);

    // Aggro on damage
    if (monster.isAlive && (monster.state === 'idle' || monster.state === 'return')) {
      monster.state = 'chase';
    }
  }

  // Kill monster from server sync (other player killed it)
  syncMonsterKilled(monsterId: number): void {
    const monster = this.monsters.find((m) => m.id === monsterId);
    if (!monster || !monster.isAlive) return;

    monster.hp = 0;
    monster.isAlive = false;
    monster.respawnTimer = monster.respawnTime;
  }

  // Get monster by ID
  getMonsterById(monsterId: number): Monster | undefined {
    return this.monsters.find((m) => m.id === monsterId);
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.monsters.forEach((monster) => {
      if (!monster.isAlive) return;

      const screenX = monster.x - cameraX;
      const screenY = monster.y - cameraY;

      // Skip if off screen
      if (screenX < -100 || screenX > CONFIG.CANVAS_WIDTH + 100 ||
          screenY < -100 || screenY > CONFIG.CANVAS_HEIGHT + 100) {
        return;
      }

      const config = MONSTER_CONFIGS[monster.type];
      const isAggro = monster.state === 'chase' || monster.state === 'attack';

      // Draw monster based on type
      this.drawMonster(ctx, screenX, screenY, monster, config, isAggro);

      // Draw HP bar
      const hpBarWidth = monster.isBoss ? 80 : 40;
      this.drawHpBar(ctx, screenX, screenY - config.size - 10, monster.hp, monster.maxHp, hpBarWidth);

      // Draw boss crown
      if (monster.isBoss) {
        this.drawBossCrown(ctx, screenX, screenY - config.size - 20);
      }

      // Draw aggro indicator
      if (isAggro && !monster.isBoss) {
        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', screenX, screenY - config.size - 15);
      }

      // Draw monster name for bosses
      if (monster.isBoss) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getMonsterName(monster.type), screenX, screenY - config.size - 30);
      }
    });
  }

  private getMonsterName(type: MonsterType): string {
    const names: Record<MonsterType, string> = {
      slime: '슬라임',
      goblin: '고블린',
      wolf: '늑대',
      skeleton: '스켈레톤',
      bat: '박쥐',
      golem: '골렘',
      treant: '트렌트',
      scorpion: '전갈',
      mummy: '미라',
      sand_worm: '모래 벌레',
      anubis: '아누비스',
      fire_elemental: '불의 정령',
      forest_boss: '숲의 수호자',
      cave_boss: '바위 군주',
      pyramid_boss: '파라오',
    };
    return names[type] || type;
  }

  private drawMonster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    monster: Monster,
    config: MonsterConfig,
    isAggro: boolean
  ): void {
    const color = isAggro ? this.adjustColor(config.color, -30) : config.color;
    const secondaryColor = isAggro ? this.adjustColor(config.secondaryColor, -30) : config.secondaryColor;
    const size = config.size;
    const bounce = Math.sin(monster.animationTimer / 100) * 2;

    ctx.save();

    switch (monster.type) {
      case 'slime':
        this.drawSlime(ctx, x, y + bounce, size, color, secondaryColor);
        break;
      case 'goblin':
        this.drawGoblin(ctx, x, y + bounce * 0.5, size, color, secondaryColor);
        break;
      case 'wolf':
        this.drawWolf(ctx, x, y + bounce * 0.3, size, color, secondaryColor);
        break;
      case 'skeleton':
        this.drawSkeleton(ctx, x, y + bounce * 0.4, size, color, secondaryColor);
        break;
      case 'bat':
        this.drawBat(ctx, x, y + bounce * 1.5, size, color, secondaryColor);
        break;
      case 'golem':
        this.drawGolem(ctx, x, y + bounce * 0.2, size, color, secondaryColor);
        break;
      case 'treant':
        this.drawTreant(ctx, x, y + bounce * 0.2, size, color, secondaryColor);
        break;
      case 'scorpion':
        this.drawScorpion(ctx, x, y + bounce * 0.3, size, color, secondaryColor);
        break;
      case 'mummy':
        this.drawMummy(ctx, x, y + bounce * 0.4, size, color, secondaryColor);
        break;
      case 'sand_worm':
        this.drawSandWorm(ctx, x, y + bounce * 0.5, size, color, secondaryColor);
        break;
      case 'anubis':
        this.drawAnubis(ctx, x, y + bounce * 0.3, size, color, secondaryColor);
        break;
      case 'fire_elemental':
        this.drawFireElemental(ctx, x, y + bounce, size, color, secondaryColor);
        break;
      case 'forest_boss':
        this.drawForestBoss(ctx, x, y + bounce * 0.2, size, color, secondaryColor);
        break;
      case 'cave_boss':
        this.drawCaveBoss(ctx, x, y + bounce * 0.2, size, color, secondaryColor);
        break;
      case 'pyramid_boss':
        this.drawPyramidBoss(ctx, x, y + bounce * 0.3, size, color, secondaryColor);
        break;
    }

    ctx.restore();
  }

  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Monster drawing methods
  private drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.4, size, size * 0.3, 0, 0, Math.PI);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.35, y - size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGoblin(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(x, y - size * 0.6, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y - size * 0.6);
    ctx.lineTo(x - size * 0.9, y - size * 1.1);
    ctx.lineTo(x - size * 0.3, y - size * 0.8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y - size * 0.6);
    ctx.lineTo(x + size * 0.9, y - size * 1.1);
    ctx.lineTo(x + size * 0.3, y - size * 0.8);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.7, size * 0.12, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.7, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.7, size * 0.06, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.7, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWolf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.2, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x + size * 0.8, y - size * 0.2, size * 0.5, size * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y - size * 0.5);
    ctx.lineTo(x + size * 0.4, y - size * 0.9);
    ctx.lineTo(x + size * 0.7, y - size * 0.6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.9, y - size * 0.5);
    ctx.lineTo(x + size * 1.0, y - size * 0.9);
    ctx.lineTo(x + size * 1.1, y - size * 0.6);
    ctx.fill();

    // Snout
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(x + size * 1.1, y - size * 0.1, size * 0.25, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + size * 0.7, y - size * 0.35, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + size * 0.7, y - size * 0.35, size * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - size * 1.0, y);
    ctx.quadraticCurveTo(x - size * 1.5, y - size * 0.3, x - size * 1.3, y - size * 0.6);
    ctx.quadraticCurveTo(x - size * 1.2, y - size * 0.2, x - size * 0.9, y + size * 0.1);
    ctx.fill();

    // Legs
    ctx.fillRect(x - size * 0.7, y + size * 0.3, size * 0.2, size * 0.4);
    ctx.fillRect(x - size * 0.3, y + size * 0.3, size * 0.2, size * 0.4);
    ctx.fillRect(x + size * 0.2, y + size * 0.3, size * 0.2, size * 0.4);
    ctx.fillRect(x + size * 0.6, y + size * 0.3, size * 0.2, size * 0.4);
  }

  private drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Skull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye sockets
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.55, size * 0.12, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.55, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.55, size * 0.06, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.55, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Ribcage
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y + i * size * 0.15);
      ctx.quadraticCurveTo(x, y + i * size * 0.15 + size * 0.1, x + size * 0.3, y + i * size * 0.15);
      ctx.stroke();
    }

    // Spine
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.1);
    ctx.lineTo(x, y + size * 0.6);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y);
    ctx.lineTo(x - size * 0.6, y + size * 0.4);
    ctx.moveTo(x + size * 0.3, y);
    ctx.lineTo(x + size * 0.6, y + size * 0.4);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15, y + size * 0.6);
    ctx.lineTo(x - size * 0.2, y + size * 1.1);
    ctx.moveTo(x + size * 0.15, y + size * 0.6);
    ctx.lineTo(x + size * 0.2, y + size * 1.1);
    ctx.stroke();
  }

  private drawBat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y);
    ctx.quadraticCurveTo(x - size * 1.2, y - size * 0.3, x - size * 1.0, y + size * 0.4);
    ctx.quadraticCurveTo(x - size * 0.6, y + size * 0.2, x - size * 0.3, y + size * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, y);
    ctx.quadraticCurveTo(x + size * 1.2, y - size * 0.3, x + size * 1.0, y + size * 0.4);
    ctx.quadraticCurveTo(x + size * 0.6, y + size * 0.2, x + size * 0.3, y + size * 0.2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y - size * 0.4);
    ctx.lineTo(x - size * 0.3, y - size * 0.8);
    ctx.lineTo(x - size * 0.1, y - size * 0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y - size * 0.4);
    ctx.lineTo(x + size * 0.3, y - size * 0.8);
    ctx.lineTo(x + size * 0.1, y - size * 0.5);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x - size * 0.12, y - size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.12, y - size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body (rocky)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y + size * 0.5);
    ctx.lineTo(x - size * 0.6, y - size * 0.2);
    ctx.lineTo(x - size * 0.3, y - size * 0.5);
    ctx.lineTo(x + size * 0.3, y - size * 0.5);
    ctx.lineTo(x + size * 0.6, y - size * 0.2);
    ctx.lineTo(x + size * 0.5, y + size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.5);
    ctx.lineTo(x - size * 0.25, y - size * 0.9);
    ctx.lineTo(x + size * 0.25, y - size * 0.9);
    ctx.lineTo(x + size * 0.35, y - size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Cracks/details
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.3);
    ctx.lineTo(x - size * 0.1, y);
    ctx.lineTo(x - size * 0.2, y + size * 0.3);
    ctx.stroke();

    // Glowing eyes
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.7, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.7, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = color;
    ctx.fillRect(x - size * 0.9, y - size * 0.2, size * 0.35, size * 0.5);
    ctx.fillRect(x + size * 0.55, y - size * 0.2, size * 0.35, size * 0.5);
  }

  private drawTreant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Trunk/body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y + size * 0.6);
    ctx.lineTo(x - size * 0.35, y - size * 0.2);
    ctx.lineTo(x + size * 0.35, y - size * 0.2);
    ctx.lineTo(x + size * 0.4, y + size * 0.6);
    ctx.closePath();
    ctx.fill();

    // Canopy/leaves
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - size * 0.4, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Face on trunk
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y, size * 0.06, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.2, size * 0.15, 0, Math.PI);
    ctx.stroke();

    // Branch arms
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.1);
    ctx.lineTo(x - size * 0.8, y - size * 0.3);
    ctx.moveTo(x + size * 0.35, y - size * 0.1);
    ctx.lineTo(x + size * 0.8, y - size * 0.3);
    ctx.stroke();
  }

  private drawScorpion(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y, size * 0.3, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail segments
    ctx.fillStyle = secondary;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.5 - i * size * 0.25, y - i * size * 0.15, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stinger
    ctx.beginPath();
    ctx.moveTo(x - size * 1.3, y - size * 0.5);
    ctx.lineTo(x - size * 1.5, y - size * 0.8);
    ctx.lineTo(x - size * 1.2, y - size * 0.6);
    ctx.fillStyle = '#FF0000';
    ctx.fill();

    // Claws
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.9, y - size * 0.3, size * 0.25, size * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.9, y + size * 0.3, size * 0.25, size * 0.15, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y - size * 0.08, size * 0.05, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y + size * 0.08, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMummy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body (wrapped in bandages)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(x, y - size * 0.7, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Bandage lines
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.4, y - size * 0.4 + i * size * 0.25);
      ctx.lineTo(x + size * 0.4, y - size * 0.4 + i * size * 0.25);
      ctx.stroke();
    }

    // Glowing eyes
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.75, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.75, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Arms (reaching out)
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(x - size * 0.4, y - size * 0.2);
    ctx.rotate(-0.5);
    ctx.fillRect(0, 0, size * 0.6, size * 0.15);
    ctx.restore();
    ctx.save();
    ctx.translate(x + size * 0.4, y - size * 0.2);
    ctx.rotate(0.5);
    ctx.fillRect(-size * 0.6, 0, size * 0.6, size * 0.15);
    ctx.restore();
  }

  private drawSandWorm(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body segments emerging from ground
    ctx.fillStyle = color;

    // Main body arc
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y + size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.6, x, y - size * 0.4);
    ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.6, x + size * 0.8, y + size * 0.3);
    ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.3, x, y - size * 0.1);
    ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.3, x - size * 0.8, y + size * 0.3);
    ctx.fill();

    // Segments
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x + i * size * 0.25, y - size * 0.35 + Math.abs(i) * size * 0.1, size * 0.15, Math.PI, 0);
      ctx.stroke();
    }

    // Mouth (open)
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * size * 0.2, y - size * 0.2 + Math.sin(angle) * size * 0.2);
      ctx.lineTo(x + Math.cos(angle) * size * 0.35, y - size * 0.2 + Math.sin(angle) * size * 0.35);
      ctx.lineTo(x + Math.cos(angle + 0.2) * size * 0.2, y - size * 0.2 + Math.sin(angle + 0.2) * size * 0.2);
      ctx.fill();
    }
  }

  private drawAnubis(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.35, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (jackal shaped)
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.6, size * 0.3, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.6);
    ctx.lineTo(x + size * 0.5, y - size * 0.7);
    ctx.lineTo(x + size * 0.4, y - size * 0.5);
    ctx.lineTo(x, y - size * 0.4);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y - size * 0.8);
    ctx.lineTo(x - size * 0.3, y - size * 1.3);
    ctx.lineTo(x - size * 0.05, y - size * 0.9);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.1, y - size * 0.8);
    ctx.lineTo(x + size * 0.15, y - size * 1.3);
    ctx.lineTo(x + size * 0.25, y - size * 0.9);
    ctx.fill();

    // Golden headdress details
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.85, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Staff
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y - size * 0.3);
    ctx.lineTo(x + size * 0.6, y + size * 0.8);
    ctx.stroke();

    // Staff head (ankh shape simplified)
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y - size * 0.45, size * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y - size * 0.65, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFireElemental(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Flame body (multiple overlapping flames)
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, secondary);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.5);
    ctx.quadraticCurveTo(x - size * 0.6, y, x - size * 0.3, y - size * 0.5);
    ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.8, x, y - size);
    ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.8, x + size * 0.3, y - size * 0.5);
    ctx.quadraticCurveTo(x + size * 0.6, y, x, y + size * 0.5);
    ctx.fill();

    // Inner flame
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.2);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.1, x - size * 0.15, y - size * 0.4);
    ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.6, x, y - size * 0.7);
    ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.6, x + size * 0.15, y - size * 0.4);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.1, x, y + size * 0.2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.12, y - size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.12, y - size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawForestBoss(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Giant treant-like boss
    this.drawTreant(ctx, x, y, size, color, secondary);

    // Additional details for boss
    // Glowing runes
    ctx.fillStyle = '#00FF88';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y + size * 0.1, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.25, y + size * 0.1, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCaveBoss(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Giant golem boss
    this.drawGolem(ctx, x, y, size, color, secondary);

    // Lava veins
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size * 0.6);
    ctx.lineTo(x - size * 0.2, y - size * 0.2);
    ctx.lineTo(x - size * 0.35, y + size * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y - size * 0.6);
    ctx.lineTo(x + size * 0.2, y - size * 0.2);
    ctx.lineTo(x + size * 0.35, y + size * 0.2);
    ctx.stroke();
  }

  private drawPyramidBoss(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, secondary: string): void {
    // Pharaoh boss
    this.drawAnubis(ctx, x, y, size, color, secondary);

    // Crown
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size * 1.1);
    ctx.lineTo(x, y - size * 1.5);
    ctx.lineTo(x + size * 0.4, y - size * 1.1);
    ctx.closePath();
    ctx.fill();

    // Crown jewel
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x, y - size * 1.25, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBossCrown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 10);
    ctx.lineTo(x - 15, y);
    ctx.lineTo(x - 10, y + 5);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.lineTo(x + 10, y + 5);
    ctx.lineTo(x + 15, y);
    ctx.lineTo(x + 15, y + 10);
    ctx.closePath();
    ctx.fill();

    // Jewels
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x, y + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, hp: number, maxHp: number, width: number = 40): void {
    const height = 6;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x - width / 2, y, width, height);

    // HP
    const hpRatio = hp / maxHp;
    let hpColor = '#4CAF50';
    if (hpRatio < 0.3) {
      hpColor = '#F44336';
    } else if (hpRatio < 0.6) {
      hpColor = '#FF9800';
    }

    ctx.fillStyle = hpColor;
    ctx.fillRect(x - width / 2, y, hpRatio * width, height);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y, width, height);
  }
}
