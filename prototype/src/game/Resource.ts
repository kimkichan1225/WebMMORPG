import { CONFIG } from '../types';
import type { ToolType } from '../stores/inventoryStore';
import { RESOURCES } from '../stores/inventoryStore';

export type ResourceType = 'tree' | 'rock' | 'herb';

export interface ResourceNode {
  id: number;
  type: ResourceType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  resourceId: string;
  respawnTime: number;
  respawnTimer: number;
  isActive: boolean;
}

// Resource types and their properties
const RESOURCE_CONFIGS: Record<ResourceType, {
  requiredTool: ToolType;
  maxHp: number;
  respawnTime: number;
  resources: string[];
}> = {
  tree: {
    requiredTool: 'axe',
    maxHp: 3,
    respawnTime: 10000,
    resources: ['wood', 'hardwood'],
  },
  rock: {
    requiredTool: 'pickaxe',
    maxHp: 5,
    respawnTime: 15000,
    resources: ['stone', 'iron', 'gold'],
  },
  herb: {
    requiredTool: 'sickle',
    maxHp: 1,
    respawnTime: 8000,
    resources: ['herb', 'manaflower', 'rareherb'],
  },
};

export class ResourceManager {
  private resources: ResourceNode[] = [];
  private nextId = 0;

  constructor() {
    this.initializeResources();
  }

  private initializeResources(): void {
    const tileSize = CONFIG.TILE_SIZE;

    // Tree zone (top-left: tiles 3-8, 3-8)
    for (let i = 0; i < 6; i++) {
      this.addResource('tree', (3 + Math.floor(i / 2)) * tileSize + 32, (3 + (i % 3)) * tileSize + 32);
    }

    // Rock zone (top-right: tiles 30-35, 3-8)
    for (let i = 0; i < 6; i++) {
      this.addResource('rock', (30 + Math.floor(i / 2)) * tileSize + 32, (3 + (i % 3)) * tileSize + 32);
    }

    // Herb zone (bottom-left: tiles 3-8, 30-35)
    for (let i = 0; i < 8; i++) {
      this.addResource('herb', (3 + Math.floor(i / 2)) * tileSize + 32, (30 + (i % 4)) * tileSize + 32);
    }
  }

  private addResource(type: ResourceType, x: number, y: number): void {
    const config = RESOURCE_CONFIGS[type];

    // Randomly select resource type based on tier probability
    const resources = config.resources;
    let resourceId = resources[0]; // Default to common
    const rand = Math.random();
    if (rand < 0.1 && resources.length > 2) {
      resourceId = resources[2]; // Rare (10%)
    } else if (rand < 0.3 && resources.length > 1) {
      resourceId = resources[1]; // Uncommon (20%)
    }

    this.resources.push({
      id: this.nextId++,
      type,
      x,
      y,
      hp: config.maxHp,
      maxHp: config.maxHp,
      resourceId,
      respawnTime: config.respawnTime,
      respawnTimer: 0,
      isActive: true,
    });
  }

  update(deltaTime: number): void {
    this.resources.forEach((resource) => {
      if (!resource.isActive) {
        resource.respawnTimer -= deltaTime;
        if (resource.respawnTimer <= 0) {
          // Respawn with new random resource
          const config = RESOURCE_CONFIGS[resource.type];
          const resources = config.resources;
          let resourceId = resources[0];
          const rand = Math.random();
          if (rand < 0.1 && resources.length > 2) {
            resourceId = resources[2];
          } else if (rand < 0.3 && resources.length > 1) {
            resourceId = resources[1];
          }

          resource.hp = resource.maxHp;
          resource.resourceId = resourceId;
          resource.isActive = true;
        }
      }
    });
  }

  getResourcesInRange(x: number, y: number, range: number): ResourceNode[] {
    return this.resources.filter((r) => {
      if (!r.isActive) return false;
      const dx = r.x - x;
      const dy = r.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  getNearestResource(x: number, y: number, tool: ToolType | null): ResourceNode | null {
    if (!tool) return null;

    const inRange = this.getResourcesInRange(x, y, CONFIG.HARVEST_RANGE);
    const validResources = inRange.filter((r) => {
      const config = RESOURCE_CONFIGS[r.type];
      return config.requiredTool === tool;
    });

    if (validResources.length === 0) return null;

    return validResources.reduce((nearest, r) => {
      const dx = r.x - x;
      const dy = r.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearestDx = nearest.x - x;
      const nearestDy = nearest.y - y;
      const nearestDist = Math.sqrt(nearestDx * nearestDx + nearestDy * nearestDy);
      return dist < nearestDist ? r : nearest;
    });
  }

  harvestResource(resourceId: number): { resourceId: string; exp: number } | null {
    const resource = this.resources.find((r) => r.id === resourceId);
    if (!resource || !resource.isActive) return null;

    resource.hp--;

    if (resource.hp <= 0) {
      resource.isActive = false;
      resource.respawnTimer = resource.respawnTime;

      const resourceData = RESOURCES[resource.resourceId];
      return {
        resourceId: resource.resourceId,
        exp: resourceData?.exp || 5,
      };
    }

    return null;
  }

  getResources(): ResourceNode[] {
    return this.resources;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.resources.forEach((resource) => {
      if (!resource.isActive) return;

      const screenX = resource.x - cameraX;
      const screenY = resource.y - cameraY;

      // Skip if off screen
      if (screenX < -50 || screenX > CONFIG.CANVAS_WIDTH + 50 ||
          screenY < -50 || screenY > CONFIG.CANVAS_HEIGHT + 50) {
        return;
      }

      const resourceData = RESOURCES[resource.resourceId];
      const tierColor = resourceData?.color || '#888';

      switch (resource.type) {
        case 'tree':
          this.drawTree(ctx, screenX, screenY, tierColor);
          break;
        case 'rock':
          this.drawRock(ctx, screenX, screenY, tierColor);
          break;
        case 'herb':
          this.drawHerb(ctx, screenX, screenY, tierColor);
          break;
      }

      // Draw HP bar if damaged
      if (resource.hp < resource.maxHp) {
        this.drawHpBar(ctx, screenX, screenY - 30, resource.hp, resource.maxHp);
      }
    });
  }

  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    // Trunk
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, y - 10, 16, 30);

    // Leaves
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x - 25, y - 10);
    ctx.lineTo(x + 25, y - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2E8B2E';
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x - 20, y - 5);
    ctx.lineTo(x + 20, y - 5);
    ctx.closePath();
    ctx.fill();
  }

  private drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 10);
    ctx.lineTo(x - 15, y - 15);
    ctx.lineTo(x + 5, y - 20);
    ctx.lineTo(x + 20, y - 10);
    ctx.lineTo(x + 18, y + 10);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x, y - 15);
    ctx.lineTo(x + 10, y - 8);
    ctx.lineTo(x, y - 5);
    ctx.closePath();
    ctx.fill();
  }

  private drawHerb(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    ctx.fillStyle = color;

    // Stem
    ctx.fillRect(x - 2, y - 5, 4, 15);

    // Leaves
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 5, 6, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + 8, y - 5, 6, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x, y - 15, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, hp: number, maxHp: number): void {
    const width = 30;
    const height = 4;

    ctx.fillStyle = '#333';
    ctx.fillRect(x - width / 2, y, width, height);

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x - width / 2, y, (hp / maxHp) * width, height);
  }
}
