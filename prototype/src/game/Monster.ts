import { CONFIG } from '../types';

export type MonsterType = 'slime';

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

  // AI state
  state: 'idle' | 'chase' | 'attack' | 'return';
  targetX: number;
  targetY: number;
  attackCooldown: number;
  idleTimer: number;
}

const MONSTER_CONFIGS: Record<MonsterType, {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  respawnTime: number;
}> = {
  slime: {
    maxHp: 50,
    attack: 8,
    defense: 2,
    speed: 60,
    exp: 25,
    respawnTime: 10000,
  },
};

export class MonsterManager {
  private monsters: Monster[] = [];
  private nextId = 0;

  constructor() {
    this.initializeMonsters();
  }

  private initializeMonsters(): void {
    const tileSize = CONFIG.TILE_SIZE;

    // Spawn slimes in the center area
    const centerX = (CONFIG.MAP_WIDTH / 2) * tileSize;
    const centerY = (CONFIG.MAP_HEIGHT / 2) * tileSize;

    // Left slime area
    this.addMonster('slime', centerX - 200, centerY);
    this.addMonster('slime', centerX - 250, centerY + 100);

    // Right slime area
    this.addMonster('slime', centerX + 200, centerY);
    this.addMonster('slime', centerX + 250, centerY - 100);

    // Bottom area
    this.addMonster('slime', centerX, centerY + 200);
    this.addMonster('slime', centerX + 50, centerY + 250);
  }

  private addMonster(type: MonsterType, x: number, y: number): void {
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
      state: 'idle',
      targetX: x,
      targetY: y,
      attackCooldown: 0,
      idleTimer: Math.random() * 3000,
    });
  }

  update(deltaTime: number, playerX: number, playerY: number): { attackingMonster: Monster | null } {
    let attackingMonster: Monster | null = null;

    this.monsters.forEach((monster) => {
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
          if (distToPlayer < CONFIG.MONSTER_AGGRO_RANGE) {
            monster.state = 'chase';
          }

          // Move towards idle target
          this.moveTowards(monster, monster.targetX, monster.targetY, deltaTime, 0.5);
          break;

        case 'chase':
          // If too far from spawn, return
          if (distToSpawn > CONFIG.MONSTER_AGGRO_RANGE * 2) {
            monster.state = 'return';
            break;
          }

          // If player out of range, return to idle
          if (distToPlayer > CONFIG.MONSTER_AGGRO_RANGE * 1.5) {
            monster.state = 'return';
            break;
          }

          // If in attack range, attack
          if (distToPlayer < CONFIG.MONSTER_ATTACK_RANGE) {
            monster.state = 'attack';
            break;
          }

          // Chase player
          this.moveTowards(monster, playerX, playerY, deltaTime, 1);
          break;

        case 'attack':
          // If player moved out of range, chase
          if (distToPlayer > CONFIG.MONSTER_ATTACK_RANGE * 1.2) {
            monster.state = 'chase';
            break;
          }

          // Attack if cooldown is ready
          if (monster.attackCooldown <= 0) {
            attackingMonster = monster;
            monster.attackCooldown = 1500; // 1.5 second cooldown
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
          if (distToPlayer < CONFIG.MONSTER_AGGRO_RANGE * 0.8) {
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

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.monsters.forEach((monster) => {
      if (!monster.isAlive) return;

      const screenX = monster.x - cameraX;
      const screenY = monster.y - cameraY;

      // Skip if off screen
      if (screenX < -50 || screenX > CONFIG.CANVAS_WIDTH + 50 ||
          screenY < -50 || screenY > CONFIG.CANVAS_HEIGHT + 50) {
        return;
      }

      switch (monster.type) {
        case 'slime':
          this.drawSlime(ctx, screenX, screenY, monster.state === 'chase' || monster.state === 'attack');
          break;
      }

      // Draw HP bar
      this.drawHpBar(ctx, screenX, screenY - 35, monster.hp, monster.maxHp);

      // Draw aggro indicator
      if (monster.state === 'chase' || monster.state === 'attack') {
        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', screenX, screenY - 45);
      }
    });
  }

  private drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, isAggro: boolean): void {
    // Body
    const color = isAggro ? '#FF6B6B' : '#7BC96F';
    const darkColor = isAggro ? '#CC4444' : '#5AA84A';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shadow/bottom
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 25, 8, 0, 0, Math.PI);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 8, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x - 6, y - 7, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y - 7, 2, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 10, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, hp: number, maxHp: number): void {
    const width = 40;
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
